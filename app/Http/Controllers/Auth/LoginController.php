<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetUserPassword;
use App\Models\Voters;
use Session;
use App\Models\VoterPhone;
use App\API\Sms\Sms;

use App\API\License;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;
use App\Enums\CommonEnum;
use App\Extensions\ActivistUserProvider;
use App\Extensions\JwtGuard;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Encryption\DecryptException;

use Carbon\Carbon;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Support\Facades\Redis;
use Mpdf\Tag\Select;

//use Illuminate\Support\Facades\URL;

class LoginController extends Controller {

    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    public function index ( Request $request ) {

        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0)? true : false;
        $baseUrl = str_replace( "http://", "", $baseUrl );
        $baseUrl = str_replace( "https://", "", $baseUrl );
        $baseUrl = str_replace( request()->server( 'SERVER_NAME' ), "", $baseUrl );
        $baseUrl = str_replace( ":" . request()->server( 'SERVER_PORT' ), "", $baseUrl );
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();

        //go to maintenance view if in maintenance mode
        $maintenance = config('app.maintenance');
        if ($maintenance) return view( 'auth/maintenance', $data);
        //else go to login view
        else return view( 'auth/login', $data);
    }

    private function getUserPasswordExpirationDate($passwordDate) {
        $expirationDays = config('auth.password_expiration_days');

        $expirationDate = date(config('constants.APP_DATETIME_DB_FORMAT'),
                               strtotime($passwordDate . ' + ' . $expirationDays . ' days'));

        return $expirationDate;
    }

    private function getSmsCode() {
        //check that reset_password_token doesn't exist
        do{
            $smsCode = Helper::random(6, Helper::DIGIT);
            $isExistSmsCode = User::select('sms_code')->where('sms_code', $smsCode)->first();
        } while ($isExistSmsCode);

        return $smsCode;
    }


    /** User activists login routes: */
    public function loginActivist(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $bodyParams = json_decode($request->getContent());
        // dd($request->getContent());
        $personal_identity = $bodyParams->personal_identity;
        $activist_login_token = $bodyParams->activist_login_token;

        Redis::set("activist_login_token:$personal_identity",
            $activist_login_token
        );
        $credentials = [
            'personal_identity' => $bodyParams->personal_identity,
            'role_key' => $bodyParams->role_id,
            'code' => null,
        ];
        $userActivist = Auth::guard('activists_api')->checkUserActivist($credentials);

        if ($userActivist) {
            $this->setActivistUserTwoStepAuthentication($userActivist, $jsonOutput);
        } else {
            $jsonOutput->setErrorMessage(trans('auth.login_data_missing'));
            return;
        }
    }


    public function checkActivistCode( Request $request ) {
        $jsonOutput = app()->make( "JsonOutput" );
        $bodyParams = json_decode($request->getContent());
        $personal_identity = $bodyParams->personal_identity;

        $activist_login_token = Redis::get("activist_login_token:$personal_identity");
        if($activist_login_token != $bodyParams->activist_login_token ){
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ) , 401);
            return;
        }
        $credentials = [
            'personal_identity' => $personal_identity,
            'role_key' => $bodyParams->role_id,
            'code' => $bodyParams->code,
            'checkCode' => true,
        ];
        $userActivist = Auth::guard( 'activists_api' )->attempt($credentials);

        if (!$userActivist) { //user not found
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ), 401 );
            return;

        } else if ($this->smsCodeExpired($userActivist)) { //sms code expired
            $userActivist->activist_sms_code = null;
            $userActivist->activist_sms_code_date = null;
            $userActivist->save();
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ) , 401);
            return;
        } else{
            // $voter = Voters::where('voters.id', $userActivist->voter_id)->first();

            $token = Auth::guard( 'activists_api' )->token();
            
            $userActivist->activist_sms_code = null;
            $userActivist->activist_sms_code_date = null;
            $userActivist->activist_fcm_token = $request->input('fcm_token', null);
            // $userActivist->activist_token = $token;

            $userActivist->save();
            $electionCampaign  = ElectionCampaigns::currentCampaign();

            $data = new \stdClass;
            $data->activist_token = $token;
            $data->elections_start  = "$electionCampaign->election_date $electionCampaign->vote_start_time"  ;
            $data->elections_end  = "$electionCampaign->election_date $electionCampaign->vote_end_time"  ;
            $data->full_activist_name  = "$userActivist->first_name $userActivist->last_name"  ;
            $jsonOutput->setData( $data );
            return;
        }
    }

    public function loginUserRequestApp(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $bodyParams = json_decode($request->getContent());
        $credentials = array();
        $credentials['personal_identity'] = $bodyParams->personal_identity;
        $credentials['password'] = $bodyParams->password;
        $credentials['code'] = $request->input('code', "");
        $credentials['application_type'] = "global";

        $userActivist = Auth::guard('activists_api')->attempt($credentials, false, false);
        if ($userActivist) {
            if ($userActivist->two_step_authentication == 0) {
                $token = Auth::guard('activists_api')->token();
                $data = new \stdClass;
                $data->activist_token = $token;
                $data->user = UserRepository::getUserNameAndMainRoleTeamId($userActivist->id);
            } else {
                $send_sms = $this->sendCodeUserEnter($userActivist, $jsonOutput);
                $data = ['send_sms' => $send_sms ? 1 : 0];
            }

            $jsonOutput->setData($data);
        } else {
            $jsonOutput->setErrorMessage(trans('auth.error_login_code_or_identity'));
            return;
        }
    }


    public function checkUserRequestApp(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $bodyParams = json_decode($request->getContent());
        $credentials = array();
        $credentials['personal_identity'] = $bodyParams->personal_identity;
        $credentials['password'] = $bodyParams->password;
        $credentials['code'] = $request->input('code', "");
        $credentials['application_type'] = "global";
        $credentials['checkCode'] = true;


        $userActivist = Auth::guard('activists_api')->attempt($credentials);
        if (!$userActivist) { //user not found
            $jsonOutput->setErrorMessage(trans('auth.invalid_sms_code'));
            return;
        } elseif ($this->smsCodeExpired($userActivist)) { //sms code expired
            $userActivist->sms_code = null;
            $userActivist->sms_code_date = null;
            $userActivist->save();
            $jsonOutput->setErrorMessage(trans('auth.sms_code_expired'));
            return;
        } else {
            $token = Auth::guard('activists_api')->token();
            $data = new \stdClass;
            $data->activist_token = $token;
            $data->user = UserRepository::getUserNameAndMainRoleTeamId($userActivist->id);
            $jsonOutput->setData($data);
            return;
        }
    }

    /** End User activists login routes: */

    /**
     * This function validates the user in 2 steps
     *   1. with user name + password
     *   2. with sms code sent to the user mobile phone
     *
     * @param Request $request
     */
    public function loginUser ( Request $request ) {
        //get credentials
        $credentials = array();
        $credentials['personal_identity'] = $request->input( 'personal_identity', "" );
        $credentials['password'] = $request->input( 'password', "" );
        $smsCode = $request->input( 'sms_code', "" );

        //api token input
        $isApi = $request->input('api', false);

        //output singleton
        $jsonOutput = app()->make( "JsonOutput" );

        $errorData = false;

        if ( $credentials['personal_identity'] == "" && $smsCode == '' ) {
            $errorData = true;
            $jsonOutput->setErrorMessage( trans( 'auth.login_data_missing' ) );
        } else if ( $credentials['personal_identity'] != "" ) {
            $credentials['personal_identity'] = trim(ltrim($credentials['personal_identity'], '0'));
            $credentials['active'] = 1;

            if ( $credentials['password'] == "" ) {
                $errorData = true;
                $jsonOutput->setErrorMessage( trans( 'auth.password_missing' ) );
            }
        }

        if (!$errorData) {
            if ($isApi) {
                if ( Auth::guard( 'api' )->attempt( $credentials ) ) {
                    //return redirect to original url
                    $data = new \stdClass;
                    $data->token = Auth::guard( 'api' )->token();
                    $jsonOutput->setData( $data );
                } else {
                    //error message
                    $jsonOutput->setErrorMessage( trans( 'auth.failed' ) );
                }
            } else {
                $resetPasswordType = null;

                // Checking if the user log in with
                // personal identity + password
                if (  $request->has('personal_identity') ) {
                    // Validating the user without login to generate
                    // sms code for the next login step which the
                    // validation is done with sms code sent to the
                    // user's mobile phone
                    if ( Auth::guard( 'web' )->attempt( $credentials, false, false ) ) {
                            $userObj = $this->getUserWithVoter($credentials['personal_identity']);
                           
                            if(env('NOT_CHECK_TWO_STEP_AUTH', false)){
                                $userObj->two_step_authentication = 0; 
                            }
                            if(!empty($userObj) && $userObj->two_step_authentication == 0){ //If user not need two step authentication
                                $dataRedirect = $request->session()->get( 'original_url', '/') ;

                                 $currentUser = User::where('id', $userObj->id)->first();
                                 $this->userLoginSuccess($jsonOutput, $currentUser, $dataRedirect);
                                 return;
                            }else{
                                //set user id in session for sms validation
                                $request->session()->set('userIdForSms', $userObj->id);
                                $this->setSetUserTwoStepAuthentication($userObj, $jsonOutput);
                            }
                    } else {
                        //error message
                        $jsonOutput->setErrorMessage( trans( 'auth.failed' ) );
                    }
                } elseif ( $request->has('sms_code') ) { // login step with sms code
                    $this->checkUserSmsCode($request, $jsonOutput, $smsCode);
                } else {
                    //error message
                    $jsonOutput->setErrorMessage( trans( 'auth.failed' ) );
                    return;
                }
            }
        }
    }
    private function checkUserSmsCode($request, &$jsonOutput, $smsCode, $user_id = null){
        // validating sms login code.
        $userId = !$user_id ? $request->session()->get('userIdForSms', 0) : $user_id;

        $currentUser = User::where('id', $userId)
                            ->where('sms_code', $smsCode)
                            ->first();
        
        if ($currentUser == null) { //user not found
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ) );
            return;

        } elseif ($this->smsCodeExpired($currentUser)) { //sms code expired
            $currentUser->sms_code = null;
            $currentUser->sms_code_date = null;
            $currentUser->save();
            $jsonOutput->setErrorMessage( trans( 'auth.sms_code_expired' ) );
            return;
        } else { // the sms code is now valid
            $dataRedirect = $request->session()->get( 'original_url', "/");
            $this->userLoginSuccess($jsonOutput, $currentUser, $dataRedirect);
            //remove user id for sms key in session
            $request->session()->forget('userIdForSms');
            return;
        }
    }
    private function getUserWithVoter ($personal_identity, $withPhones = true) {
        $userObj = User::select([
            'users.id', 'users.initial_password', 'users.email', 'users.sms_wrong_attempts_cnt',
            'users.reset_password_token', 'voters.first_name', 'voters.last_name',
            'users.password_date','users.two_step_authentication'])
            ->withVoter()
            ->where('voters.personal_identity', $personal_identity);
            if($withPhones){
                $userObj->with(['phones' => function ($query) {
                    $query->select(['id', 'user_id', 'phone_number'])
                        ->where('deleted', 0);
                }]);
            }
            return $userObj->first();
    }
    private function userLoginSuccess($jsonOutput,$currentUser, $dataRedirect){
        $currentDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $expirationDate = $this->getUserPasswordExpirationDate($currentUser->password_date);

        // If it's the user initial password or the
        // user's password expired, he should be redirected
        // to do reset password.
        if ( $currentUser->initial_password || $currentDate > $expirationDate) {
            $shouldResetPassword = true;
            $resetPasswordType = ($currentUser->initial_password) ? config('constants.RESET_PASSWORD_TYPE_INITIAL')
                                                                  : config('constants.RESET_PASSWORD_TYPE_EXPIRED');
        } else {
            $shouldResetPassword = false;
        }

        // Checking if the user should reset his password
        // due to initial password or password expiration date
        if ( $shouldResetPassword ) {
            $resetPasswordToken = $this->getResetPasswordToken();

            $currentUser->reset_password_token = $resetPasswordToken;
            $currentUser->sms_code = null;
            $currentUser->sms_code_date = null;
            $currentUser->sms_wrong_attempts_cnt = 0;
            $currentUser->is_view_all_voters = CommonEnum::NO;

            $currentUser->save();

            $data = new \stdClass;
            $data->redirect = 'login/reset_password/' . $resetPasswordToken;
            $data->redirect .= '?type=' . $resetPasswordType;
            $data->status = 0;
            $jsonOutput->setData( $data );
        } else {
            // A valid user who recieved the sms code
			 Session::set('controlling_user_id' , null );
            Auth::login($currentUser);

            $currentUser->sms_code = null;
            $currentUser->sms_code_date = null;
            $currentUser->sms_wrong_attempts_cnt = 0;
            $currentUser->is_view_all_voters = CommonEnum::NO;
            $currentUser->save();

            $data = new \stdClass;
            $data->redirect = $dataRedirect;
            $data->status = 1;

            $jsonOutput->setData( $data );
        }
    }
    private function setActivistUserTwoStepAuthentication($userActivistObj, &$jsonOutput){
        $userPhoneNumber = $userActivistObj->activist_phone_number;

        if ( is_null($userPhoneNumber) || !Helper::isIsraelMobilePhone($userPhoneNumber) ) {
            $jsonOutput->setErrorMessage( trans( 'auth.user_can_not_recieve_sms' ) ); return;
        } else {

            // Genearting sms code for the login next step
            // via sms code sent to the user's mobile phone.
            $newSmsCode = $this->getSmsCode();
            $userActivistObj->activist_sms_code = $newSmsCode;
            $userActivistObj->activist_sms_code_date = Carbon::now();
            $userActivistObj->save();

            $message = 'קוד הכניסה למערכת הפעילים של ש"ס הוא: ' . $newSmsCode;
            
            if(!Helper::isKosherPhone($userPhoneNumber)){
                Sms::send($userPhoneNumber, $message);
            } else {
                Ivr::send($userPhoneNumber, $message, IvrConst::TYPE_DEFAULT, null);
            }

            $jsonOutput->setData( ['user_id' => $userActivistObj->id] );
        }
    }

    private  function sendCodeUserEnter($userObj,&$jsonOutput){
        $userPhoneNumber = null;
        if(!empty($userObj->phones)){
            $userPhoneNumber = $userObj->phones[0]->phone_number ;
        }
        // dd($userPhoneNumber ,$hasOnlyIvrPhone);
        if ( is_null($userPhoneNumber) || !Helper::isIsraelMobilePhone($userPhoneNumber) ) {
            $jsonOutput->setErrorMessage( trans( 'auth.user_can_not_recieve_sms' ) ); return;
        } else {

            // Genearting sms code for the login next step
            // via sms code sent to the user's mobile phone.
            $newSmsCode = $this->getSmsCode();
            $userObj->sms_code = $newSmsCode;
            $userObj->sms_code_date = Carbon::now();
            $userObj->save();

            $message = 'קוד הכניסה למערכת ש"ס הוא: ';
            
            if(!Helper::isKosherPhone($userPhoneNumber)){
                Sms::send($userPhoneNumber, $message.$newSmsCode);
            } else {
                $newSmsCode = $newSmsCode . '';
                $newSmsCode = str_split($newSmsCode);
                $newSmsCode = implode(' ', $newSmsCode);
                Ivr::send($userPhoneNumber, $message . $newSmsCode, IvrConst::TYPE_DEFAULT, null);
            }

            return true;
    }
}

    private function setSetUserTwoStepAuthentication($userObj, &$jsonOutput)
    {
        $sendSms = $this->sendCodeUserEnter($userObj, $jsonOutput);
        $data = new \stdClass;
        // A flag for the ajax call that
        // it's login step via mobile phone
        $data->sms_code_login = $sendSms ? 1 : 0;
        $jsonOutput->setData($data);
    }


    public function logout ( Request $request ) {
        //set original url to home
        $request->session()->put( 'original_url', "/");
        //set is view all voters to false if admin
        $isViewAllVotersField = $request->session()->get('isViewAllVotersField', false);
        if ($isViewAllVotersField){
            $request->session()->put('isViewAllVotersField', false);
            UserRepository::updateIsViewAllVoter(Auth::user(),CommonEnum::NO);
        }
        
        //remove user id for sms key in session if exists
        if ($request->session()->exists('userIdForSms')) $request->session()->forget('userIdForSms');
        //logout from session
        Auth::guard( 'web' )->logout();
        //redirect to login page
        return redirect( 'login' );
    }

    private function userSendEmail($to, $firstName, $lastName,$resetPasswordToken) {
        Mail::to($to)->send(new ResetUserPassword($firstName, $lastName , config('app.url').'login/reset_password/'.$resetPasswordToken));
    }

    private function getResetPasswordToken() {
        //check that reset_password_token doesn't exist
        do{
            $randResetPWD = Str::random(20);
            $isExistResetPasswordToken = User::select('reset_password_token')->where('reset_password_token', $randResetPWD)->first();
        } while ($isExistResetPasswordToken);

        return $randResetPWD;
    }
    public function resendSmsCode(Request $request){
        $jsonOutput = app()->make( "JsonOutput" );

        $userId = $request->session()->get('userIdForSms', 0);
        $currentUser = User::select('users.id', 'users.sms_wrong_attempts_cnt')->where('id', $userId)
                            ->with(['phones' => function ($query) {
                                $query->select(['id', 'user_id', 'phone_number'])
                                    ->where('deleted', 0);
                            }])
                            ->first();
        $maxWrongAttempts = config('constants.users.MAX_WRONG_ATTEMPTS');

        if(!$currentUser){
            $jsonOutput->setErrorMessage( trans( 'auth.user_not_found' ) );
            return;
        }
        if ($currentUser->sms_wrong_attempts_cnt >= $maxWrongAttempts) { //Sms code not valid.
            $jsonOutput->setErrorMessage( trans( 'auth.user_sms_verification_is_locked' ) );
            return;
        }
        $this->setSetUserTwoStepAuthentication($currentUser, $jsonOutput);

    }
    public function resetPasswordViaSms(Request $request){
        $jsonOutput = app()->make( "JsonOutput" );

        $userId = $request->session()->get('userIdForSms', 0);
        $smsCode = $request->input('sms_code');
        $currentUser = User::where('id', $userId)
                            // ->where('sms_code', $smsCode)
                            ->first();

            if ($currentUser == null) { //user not found
                $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ) );
                return;

            }else{
                $maxWrongAttempts = config('constants.users.MAX_WRONG_ATTEMPTS');
                $wrongAttemptsForReloadPage = config('constants.users.WRONG_ATTEMPTS_FOR_RELOAD_PAGE');
                if ($currentUser->sms_wrong_attempts_cnt >= $maxWrongAttempts ) { //Sms code not valid.
                    $currentUser->sms_wrong_attempts_cnt += 1;
                    $currentUser->save();
                    $jsonOutput->setErrorMessage( trans( 'auth.user_sms_verification_is_locked' ) );
                    $jsonOutput->setErrorData(['need_to_reload_page' => true]);
                    return;
                } elseif ($currentUser->sms_code !=  $smsCode) { //Sms code not valid.
                    $currentUser->sms_wrong_attempts_cnt += 1;
                    $currentUser->save();
                    $need_to_reload_page = (($currentUser->sms_wrong_attempts_cnt % $wrongAttemptsForReloadPage) == 0);

                    $jsonOutput->setErrorMessage( trans( 'auth.invalid_sms_code' ) );
                    $jsonOutput->setErrorData(['need_to_reload_page' => $need_to_reload_page]);

                } elseif ($this->smsCodeExpired($currentUser)) { //sms code expired
                    $currentUser->sms_code = null;
                    $currentUser->sms_code_date = null;
                    $currentUser->save();
                    $jsonOutput->setErrorMessage( trans( 'auth.sms_code_expired' ) );
                    return;
                } else { //sms code is valid
                    $resetPasswordToken = $this->getResetPasswordToken();
    
                    $currentUser->reset_password_token = $resetPasswordToken;
                    $currentUser->sms_code = null;
                    $currentUser->sms_code_date = null;
                    $currentUser->save();
    
                    $data = new \stdClass;
                    $data->redirect = 'login/reset_password/' . $resetPasswordToken;
                    $data->redirect .= '?type=' . config('constants.RESET_PASSWORD_TYPE_NONE');
                    $jsonOutput->setData( $data );
            } 
            }
    }
    //the function creates a reset password token to the user which needs to reset password
    //and sends him an email for reset instructions
    public function resetUserPassword(Request $request){
        //get credentials
        $credentials = array();
        $credentials['personal_identity'] = $request->input( 'personal_identity' );
        $resetPasswordMethod = $request->input('reset_password_method');
        //output singleton
        $jsonOutput = app()->make( "JsonOutput" );
        //verify input
        if ( $credentials['personal_identity'] == "") {
            $jsonOutput->setErrorMessage( trans( 'auth.personal_identity_missing' ) );
        }
        $credentials['personal_identity'] = trim(ltrim($credentials['personal_identity'], '0'));
        $credentials['active'] = 1;

        $withPhones = ($resetPasswordMethod == 'sms');
        $userObj = $this->getUserWithVoter($credentials['personal_identity'], $withPhones);

        if (!$userObj){
            $jsonOutput->setErrorMessage( trans( 'auth.personal_identity_invalid' ) );
            return;
        }

        if ($userObj->email == null){
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_EMAIL'));
            return;
        }

        $userObj->reset_password_token = $this->getResetPasswordToken();
        $userObj->save();

        $maxWrongAttempts = config('constants.users.MAX_WRONG_ATTEMPTS');

        if($resetPasswordMethod == 'email'){
            $this->userSendEmail($userObj->email , $userObj->first_name , $userObj->last_name , $userObj->reset_password_token);
            $jsonOutput->setData('ok');
        } else {
            if ($userObj->sms_wrong_attempts_cnt >= $maxWrongAttempts) { //Sms code not valid.
                $jsonOutput->setErrorMessage( trans( 'auth.user_sms_verification_is_locked' ) );
                return;
            }
            $request->session()->set('userIdForSms', $userObj->id);
            $this->setSetUserTwoStepAuthentication($userObj, $jsonOutput);
        }
    }

    //the function gets user details using the link which contains the reset password token
    public function getUserResetPassword(Request $request, $resetPasswordToken) {
        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0)? true : false;
        $baseUrl = str_replace( "http://", "", $baseUrl );
        $baseUrl = str_replace( "https://", "", $baseUrl );
        $baseUrl = str_replace( request()->server( 'SERVER_NAME' ), "", $baseUrl );
        $baseUrl = str_replace( ":" . request()->server( 'SERVER_PORT' ), "", $baseUrl );
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();


        if (!$resetPasswordToken){
            return view( 'auth/error' ,$data);
        }
        $user = User::where('reset_password_token', $resetPasswordToken)->first();
        if (!$user){
            return view( 'auth/error' ,$data);
        }
        $voter = Voters::select('id','first_name','last_name')->where('voters.id', $user->voter_id)->first();

        $resetPasswordType = $request->input( 'type', config('constants.RESET_PASSWORD_TYPE_NONE'));
        switch ($resetPasswordType) {
            case config('constants.RESET_PASSWORD_TYPE_INITIAL'):
                $data['resetMessage'] = 'אנא החלף את סיסמתך הראשונית';
                break;

            case config('constants.RESET_PASSWORD_TYPE_EXPIRED'):
                $data['resetMessage'] = 'תוקף סיסמת פג, אנא החלף';
                break;

            case config('constants.RESET_PASSWORD_TYPE_NONE'):
            default:
                $data['resetMessage'] = 'אנא אפס את סיסמתך';
                break;
        }

        $data['resetPasswordToken'] = $user->reset_password_token;
        $data['firstName'] = $voter->first_name;
        $data['lastName'] = $voter->last_name;

        return view( 'auth/resetPassword' ,$data);
    }

    //the function resets user password by typing new password and validation password
    //then clean the "reset_password_token" field for user
    public function resetingUserPassword(Request $request, $resetPasswordToken) {                //get credentials
        $params = array();
        $params['new_password'] = $request->input( 'new_password' );

        $jsonOutput = app()->make( "JsonOutput" );
        //verify input
        if (  !$resetPasswordToken ) {
            $jsonOutput->setErrorCode(config('errors.system.RESET_PASSWORD_TOKEN_DOES_NOT_EXIST'));
            return;
        }

        $getUser = User::select('users.id', 'voters.personal_identity')
            ->withVoter()
            ->where('users.reset_password_token','=', $resetPasswordToken)
            ->first();
        //can save only a single table
        $user = User::where('users.id', $getUser->id )->first();

        if (!$user){
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        if ( !$params['new_password'] ){
            $jsonOutput->setErrorMessage( trans( 'auth.password_missing' ) );
            return;
        }

        // Checking if password is 5 charcters long and contains at lt least
        // 1 uppercase letter, 1 lowercase letter and at least 1 digit
        if ( !preg_match('/[A-Z]/', $params['new_password']) || !preg_match('/[a-z]/', $params['new_password']) ||
             !preg_match('/[0-9]/', $params['new_password']) || strlen($params['new_password']) < 5){
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_password' ) );
            return;
        }

        // Comparing new password to current password
        if ( Hash::check($params['new_password'], $user->password) ) {
            $jsonOutput->setErrorMessage( trans( 'auth.change_current_password' ) );
            return;
        }

        if (strlen($params['new_password']) >= 5) {
            $user->password = Hash::make($params['new_password']);
            $currentDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
            $user->password_date = $currentDate;
            $user->reset_password_token = null;
            $user->initial_password = 0;
            $user->save();
        }

        $jsonOutput->setData('ok');
    }

    /**
     * Check sms code expiry
     *
     * @param object $user
     * @return boolean
     */
    private function smsCodeExpired($user) {

        $currentDate = Carbon::now();
        $smsExpiryDate = (new Carbon($user->sms_code_date))->addMinutes(config('auth.sms_code_expiration_minutes'));
        if ($currentDate->greaterThan($smsExpiryDate)) return true;
        return false;
    }

    public function getUi(Request $request) {
        $fileName = $request->segment(2);
        $path = $request->path();
        switch ($fileName) {
            case 'index.js':
                $reactFileLocation = base_path('public/js/index.enc');
                break;
            case 'index.js.map':
                $reactFileLocation = base_path('public/js/index.map.enc');
                break;            
            case 'cti.js':
                $reactFileLocation = base_path('public/js/cti.enc');
                break;
            case 'cti.js.map':
                $reactFileLocation = base_path('public/js/cti.map.enc');
                break;
        }
        $uiErrorFileLocation = base_path('public/js/ui_error.js');
        $fileContent = file_get_contents($reactFileLocation);
        $license = License::getLicense();
        if ($license) {
            $newEncrypter = new \Illuminate\Encryption\Encrypter( $license, config( 'app.cipher' ) );
            try {
                $decrypted = $newEncrypter->decrypt($fileContent);
            } catch (DecryptException $e) {
                $decrypted = file_get_contents($uiErrorFileLocation);
            }
        } else {
            $decrypted = file_get_contents($uiErrorFileLocation);
        }
        
        return response($decrypted, 200)
                  ->header('Content-Type', 'application/javascript; charset=utf-8')
                  ->header('Cache-Control', 'no-cache; no-store');
    }
}