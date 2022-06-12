<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\IncomingIvr;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Libraries\Helper;
use App\Libraries\Services\IncomingMessageService;

use  Carbon\Carbon;


/**
 * Ivr controller
 */
class IvrController extends Controller {
    private $errors = [
        'V001' => 'אֵרְעָה שְׁגִיאָה בִּלְתִּי צְפוּיָה',
        'V002' => 'חֲסֵרִים פָּרָמֶטְרִים',
        'V003' => 'זְמַן הַבְּחִירוֹת לֹא הִגִּיעַ',
        'V004' => 'לֹא נִמְצְאָה קַלְפִּי לַפָּעִיל',
        'V005' => 'לֹא נִמְצְאָה קַלְפִּי לַפָּעִיל',
        'V006' => 'שָׁלוֹם, הַגָּעָתָם לַמֶּרְכָּז הַדִּוּוּחִים. מִסְפָּרְךָ אֵינֶנּוּ מְזֹהֶה בְּמַעֲרֶכֶת, אָנָּא פָּנָה לַמַּטֶּה הַמְּקוֹמִי בַּטֹּפֶס שֶׁקִּבַּלְתָּ. תּוֹדָה',
        'V007' => 'לפי המספר שהוזן, הדיווח איננו מהקלפי הנכונה. יש להתייצב בקלפי מספר {ballot} ב {city}.',
        'V008' => 'תְּעוּדַת הַזֶּהוּת שדווחה לֹא נִמְצֵאת בַּקַּלְפִּי שֶׁבּוֹ אַתָּה אָמוּר לְהִתְיַצֵּב. הַמְּסַפֵּר שהוזן הוּא', 
        // 'V009' => ' שלום {first_name}, נותקת ממערכת הדיווחים לאחר שמחליפך בקלפי {mi_id} התחבר כעת.
        // אם אתה עדיין בקלפי ונדרש להמשיך לדווח, פנה לאחראי בטלפון', 
    ];

	/**
     * Add IVR message from external service for activists role verification
     *
     * @param Request $request
     * @return void
     */
	public function getActivistIvrRoleVerification(Request $request) {
		$jsonOutput = app()->make("JsonOutput");

        $responseData = $this->parseIvr($request, IncomingMessageService::TYPE_ROLE);
        Log::info('getActivistIvrRoleVerification');
        if ($responseData['status']) {
            $jsonOutput->setData($responseData['data']);
        } else {
              $error = $responseData['error'];
              $errorCode = str_replace('V0', '', config("errors.ivr.$error"));
              $jsonOutput->setErrorData('');
              $jsonOutput->setErrorCode($errorCode);
        }
	}

	/**
     * Add IVR message from external service for activists ballot verification
     *
     * @param Request $request
     * @return void
     */
	public function getActivistIvrBallotVerification(Request $request) {
		$jsonOutput = app()->make("JsonOutput");
        Log::info('getActivistIvrBallotVerification');
        $responseData = $this->parseIvr($request, IncomingMessageService::TYPE_BALLOT);

        if ($responseData['status']) {
		    $jsonOutput->setData($responseData['data']);
        } else {
            $errorData = $responseData['error'];
            if(is_string($errorData)){ 
                $error = $errorData;
            } else { //Error with additional data
                $error = $errorData['error'];
                $jsonOutput->setErrorData($errorData['data']);
            }
            // Log::info('$errorData');
            // Log::info(json_encode($errorData));
            $errorCode = str_replace('V0', '', config("errors.ivr.$error"));
            $jsonOutput->setErrorCode($errorCode);
        }
	}

	/**
     * Add IVR message from external service for activists votes reporting
     *
     * @param Request $request
     * @return void
     */
	public function getActivistIvrVotesReporitng(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        
        Log::info('getActivistIvrVotesReporitng');

        $responseData = $this->parseIvr($request, IncomingMessageService::TYPE_VOTE);
        
        if ($responseData['status']) {
            $jsonOutput->setData($responseData['data']);
        } else {
            $error = $responseData['error'];
            $errorCode = str_replace('V0', '', config("errors.ivr.$error"));
            $jsonOutput->setErrorData('');
            $jsonOutput->setErrorCode($errorCode);
        }
	}

    public function parseIvr($request, $type) {
        //get input params
        $source = $request->input('source', null);
        $destination = $request->input('destination', null);
        $message = trim($request->input('message', null));
        Log::info('message: '. $message . ' destination ' . $destination . ' source ' . $source);
        
        if (!$source || !$destination || !isset($message)) {
            return ['status' => false, 'error' => 'MISSING_PARAMS'];
        }

        $realSource = str_replace('-', '', $source);
        $countryPrefix = '972';
        if (substr($source, 0, strlen($countryPrefix)) == $countryPrefix) {
            $realSource = substr($source, strlen($countryPrefix));
            $realSource = '0'.$realSource;
        }
        $currentCampaign = ElectionCampaigns::currentCampaign();

        //save IVR message
        $incomingIvr = new IncomingIvr;
        $incomingIvr->key = Helper::getNewTableKey('incoming_ivr', 6);
        $incomingIvr->source = $source;
        $incomingIvr->destination = $destination;
        $incomingIvr->message = $message;
        $incomingIvr->save();

        //load activists
        $activists = ElectionRolesByVoters::select(
            'election_roles_by_voters.id', 'election_roles_by_voters.phone_number',
            'verified_status', 'election_roles.system_name as election_role_name')
                            ->withElectionRole(false)
                            ->where('election_campaign_id', $currentCampaign->id)
                            ->where('phone_number', $realSource);

        if($type != IncomingMessageService::TYPE_ROLE){
            $activists->whereIn('election_roles.system_name', ['ballot_member', 'observer']);
        }
        $activists = $activists->get();
        if(count($activists) == 0){
            return ['status' => false, 'error' => 'ACTIVIST_PHONE_NUMBER_NOT_FOUND'];
        }

        $verifiedStatus = null;
        $responseIvrMessage = '';
        $responseStatus = false;
        switch ($type) {
            case IncomingMessageService::TYPE_ROLE:
                //check and update activist verification status & add message
                $verifiedStatus = IncomingMessageService::activistsVerification($realSource, $message, $currentCampaign, $activists, 'ivr', $responseIvrMessage);
                $responseStatus = true;
                break;
            case IncomingMessageService::TYPE_BALLOT:
            case IncomingMessageService::TYPE_VOTE:
                
                $electionDate = Carbon::parse($currentCampaign->election_date)->startOfDay();
                $now = Carbon::now();
                $today = $now->startOfDay();
                $voteEndDate = Carbon::parse($currentCampaign->election_date . " " . $currentCampaign->vote_end_time);
                //If today is election day:            
                if ($today->diffInDays($electionDate) == 0) {
                    $responseStatus = IncomingMessageService::electionDayReporting($realSource,
                                                                    $message,
                                                                    $currentCampaign,
                                                                    $activists,
                                                                    $type,
                                                                    $responseIvrMessage);
                } else {
                    $responseIvrMessage =  'ELECTIONS_DATE_NOT_ARRIVED';
                }
                break;
        }
        $responseData = ['status' => $responseStatus];

        if(!$responseStatus){
            $error = !empty($responseIvrMessage)? $responseIvrMessage : 'SOMETHING_WENT_WRONG'; 
            $responseData['error'] = $error;
        } else {
            $responseData['data'] = $responseIvrMessage;
        }

        //save activists message
        foreach($activists as $activist) {
            //Save incoming message
            IncomingMessageService::saveActivistMessage($activist->id, $realSource,$message,
                                config('constants.MESSAGE_DIRECTION_IN'), null,  $incomingIvr->id,  $verifiedStatus);
            //Save outcoming message
            $this->saveResponseMessage($responseData, $message, $type, $activist->id, $realSource, $incomingIvr->id, $verifiedStatus);
        }
        Log::info('$responseData');
        Log::info(json_encode($responseData));

        // dd($responseData);
        return $responseData;

    }
    private function saveResponseMessage($responseData, $activistMessage, $requestType, $activistId, $realSource, $incomingIvrId, $verifiedStatus){
        if($responseData['status']){
            $responseMessage = '';

            switch($requestType){
                case IncomingMessageService::TYPE_ROLE:
                    if($activistMessage == config('constants.activists.verificationMessage.ACCEPT_IVR')){
                        $responseMessage = 'הַתַּפְקִיד אֻמַּת בַּהַצְלָחָה';
                    } else if($activistMessage == config('constants.activists.verificationMessage.DENY_IVR')){
                        $responseMessage = 'הַתַּפְקִיד בֻּטַּל';
                    } else {
                        $responseMessage = 'נִדָּרֵשׁ מֵידָע נוֹסָף';
                    }
                    break;
                case IncomingMessageService::TYPE_BALLOT:
                    if($activistMessage == config('constants.activists.NOT_COMING')){
                        $responseMessage = "הֵבַנּוּ שֶׁאֵינְךָ יָכוֹל לְהַגִּיעַ. אָנָּא הִתְקַשֵּׁר לְאַחְרַאי הַשִּׁבּוּץ אוֹ לַמּוֹקֵד. תּוֹדָה.";
                    } else {
                        $responseMessage ='הִתְיַצְּבוּתְךָ בַּקַּלְפִּי נִקְלְטָה, מֵעַתָּה תּוּכַל לְדַוֵּחַ הַצְבָּעוֹת בַּחִיּוּג חוֹזֵר לְטֶלֶפוֹן זֶה. הַדִּוּוּחַ מִתְבַּצֵּעַ בְּאֶמְצָעוּת הַקֶּשֶׁת הַמִּסְפָּר הַסִּדּוּרִי שֶׁל הַבּוֹחֵר בַּקַּלְפִּי. בְּכָל דִּוּוּחַ נִתָּן לְדַוֵּחַ בּוֹחֵר אַחֵד אוֹ כַּמָּה בּוֹחֲרִים כשכוכבית מַפְרִידָה בֵּין הַבּוֹחֲרִים הַשּׁוֹנִים. הַקֵּשׁ סולמית לְסִיּוּם';
                    }
                    break;
                case IncomingMessageService::TYPE_VOTE:
                    $data = $responseData['data'];
                    if(empty($data['errlist'])){
                        $responseMessage = ' התקבל דיווח של ' . count($data['oklist']) . ' תושבים תקינים ';
                    } else {
                        $successNumbers = implode(',', $data['oklist']);
                        $responseMessage = count($data['errlist']) . ' מִסַּפָּרִים שחויגו הֵם מְסַפְּרִים שֶׁגּוֹיִים .' . ' הַמְּסַפְּרִים שֶׁנִּקְלְטוּ הֵם ' . $successNumbers;
                    }
                    $responseMessage .= 'לַחֵץ 1, לַבִּטּוּל הַדִּוּוּחַ וַהֲזָנָה מְחַדֵּשׁ הַקַּשׁ 2, להשמעת הִרְשִׁימָה שֶׁהִתְקַבְּלָה בְּשִׂיחָה זוֹ הַקַּשׁ 3';
                    break;
            }
        } else {
            $errorData = $responseData['error'];
            $error = is_string($errorData) ? $errorData : $errorData['error'] ;
            $errorCode = config("errors.ivr.$error");
            $responseMessage = $this->errors[$errorCode];
            // dd($responseMessage, $errorCode, $errorData);
            if($errorCode == 'V007'){
                $data = $errorData['data'];
                $responseMessage = str_replace(['{city}','{ballot}'], [$data['city_name'], $data['ballot']], $responseMessage);
            }else if($errorCode == 'V009'){ // Not exist in errors!
                $data = $errorData['data'];
                $responseMessage = str_replace(['{first_name}','{mi_id}'], [$data['first_name'], $data['mi_id']], $responseMessage);
            }
        }
        // dump($responseMessage);
        IncomingMessageService::saveActivistMessage($activistId, $realSource, $responseMessage,
        config('constants.MESSAGE_DIRECTION_OUT'), null, $incomingIvrId, $verifiedStatus);
    }

}