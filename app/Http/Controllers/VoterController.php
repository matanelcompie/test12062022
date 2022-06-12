<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\Tm\CtiController;
use App\Models\VoterElectionCampaigns;
use App\Libraries\Address;
use App\Libraries\Helper;
use App\Libraries\HelpFunctions;
use App\Libraries\Services\ServicesModel\BankBranchesService;
use App\Libraries\Services\ServicesModel\BankDetailsService;
use App\Libraries\Services\VotersService;
use App\Models\BankBranches;
use App\Models\BankDetails;
use App\Models\City;
use App\Models\CrmRequest;
use App\Models\LastViewedVoter;
use App\Models\VoterSupportStatus;
use Carbon\Carbon;
use App\Models\Streets;
use App\Models\TempVoter;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Repositories\VotersRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class VoterController extends Controller
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
    }
    /**
     * For the moment we're grabbing voter data for the following
     * parameters(table fields) only.
     *
     * @var array
     */
    private $voterSearchParams = [
        'personal_identity' => 0,
        'voter_key' => 0,
        'phone' => 0,
        'first_name' => 0,
        'last_name' => 0,
        'city' => 0,
        'street' => 0,
        'street_text' => 0,
        /* = */
        'father_first_name' => 0,
        'age' => 0,
        'age_min' => 0,
        'age_max' => 0,
        //interval
        'house_number' => 0,
        'birth_year' => 0,
        /* = */
        'cluster_name' => 0,
        'ballot_box_voter_id' => 0,
        'ballot_box' => 0];
    private $errorMessage;

    private function validatePersonalIdentity($personalIdentity)
    {
        $pattern = '/^[0-9]{2,10}$/';

        return preg_match($pattern, $personalIdentity);
    }

    /**
     * @param Request $request
     */
    public function search(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($request->input('is_personal_identity_search') == 1) {
            // Voter search by Personal Identity
            $personalIdentity = $request->input('personal_identity', null);

            if ($personalIdentity) {
                $personalIdentity = ltrim($personalIdentity, '0'); // remove all preceding zeros before personal identity
                if (!$this->validatePersonalIdentity($personalIdentity)) 
				{
                    $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                    return;
                } 
				$requiredFields = ['voters.id AS id','voters.key AS key',
								   'voters.first_name as first_name' , 'voters.last_name as last_name',
                                   'voters.personal_identity as personal_identity'];
                if ($request->input('other_fields')) {
                     $requiredFields = ['voters.key as voters_key','voters.personal_identity as personalIdentity',
										'voters.first_name as firstName','voters.last_name as lastName',
										'voters.city as cityName', 'voters.street'];
                }
                $voterObj = Voters::select($requiredFields);

                if ($request->path() != "api/elections/imports/search_voter") {
                      $voterObj->withFilters();
                }
                $voterObj = $voterObj->where('personal_identity', $personalIdentity)->first();
                
                if (!$voterObj){
                    $jsonOutput->setData(array());
                } 
				else 
				{
                    $jsonOutput->setData($voterObj);
                }
				return;
            } 
			else 
			{
                $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                return;
            }
        } 
		else
		{
            // Voter search by Personal Identity
            $personalIdentity = $request->input('personal_identity', null);
            $onlyKey = $request->input('only_key', null);
            $first = $request->input('first', null);
            if ($personalIdentity && $onlyKey) {
                $personalIdentity = ltrim($personalIdentity, '0');
                if (!$this->validatePersonalIdentity($personalIdentity)) {
                    $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                    return;
                }
				
                if ($first) {
                    $voterObj = Voters::select('voters.key')->where('personal_identity', $personalIdentity)->first();
                } else {
                    $voterObj = Voters::select('voters.key')->where('personal_identity', $personalIdentity)->get();
                }

                if (!$voterObj || sizeof($voterObj) == 0) {
                    $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                    return;
                } 
				else 
				{
                    if ($first) {
                        $voterObj = Voters::select('voters.key')->withFilters()->where('personal_identity', $personalIdentity)->first();
                    } 
					else 
					{
                        $voterObj = Voters::select('voters.key')->withFilters()->where('personal_identity', $personalIdentity)->get();
                    }

                    if (!$voterObj || sizeof($voterObj) == 0) 
					{
                        $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
                    } 
					else 
					{
                        $jsonOutput->setData($voterObj->key);
                    }
					return;
                }
            }

            $reqParams = $request->all(); //trim all request parameters
            $searchVoterCore = Voters::withFilters();
            $isValidParam = $this->validateVoterSearchParams($reqParams);
            $page = $request->input('page');
            $isAdvancedSearch = $request->input('isAdvancedSearch', 0);
            $isCount = $request->input('count', 0);
            $isPhone = isset($request['phone']) ? TRUE : FALSE;
            $withStreet = (isset($request['street'])||isset($request['street_text'])) ? true : false;
            $limit = 30;
            $skip = ($page * $limit);

            if (false == $isValidParam) {
                $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
                return;
            }

            $isParamInRange = $this->validateVoterSearchValues($reqParams);
            if (true != $isParamInRange) {
                $jsonOutput->setErrorCode(config('errors.elections.' . $isParamInRange));
                return;
            }

            $this->assemblyVoterSearchWhere($searchVoterCore, $reqParams, $isValidParam, $isAdvancedSearch);
            $user = Auth::user();
            $isLeftJoin = $request->session()->get('isViewAllVotersField') ? ($user->admin && $request->session()->get('isViewAllVotersField')) : false;

            if ($isCount && ((int) $page < 1)) {
                $rowsCount = $this->getSearchResultsCount($searchVoterCore, $isPhone, $withStreet, $isLeftJoin);
                $jsonOutput->setData(['rowsCount' => $rowsCount]);
                return;
            }

            if ($isPhone) {
                $searchVoterCore->withPhones('left');
            }

            $voterSearchfieldsWeNeed = ['voters.id AS id',
                'voters.key AS voters_key',
                'voters.personal_identity AS personalIdentity',
                'voters.first_name AS firstName',
                'voters.last_name AS lastName',
                'voters.city_id',
                'voters.neighborhood',
                DB::Raw("IF(streets.name IS NULL , voters.street , streets.name) as street"),
                'voters.house',
                'voters.house_entry',
                'voters.flat',
                'voters.mark',
                'voters.zip',
                'voters.birth_date',
                'voters.birth_date_type',
                'voters.gender',
                DB::raw('TIMESTAMPDIFF( YEAR, voters.birth_date, CURDATE() ) AS age'),
                'voters.father_name AS fatherFirstName',
                'voters.main_voter_phone_id',
                'voters.email',
                'cities.key AS cityKey',
                DB::Raw("IF(mi_city.name IS NULL, cities.name , mi_city.name) as cityName"),
                'support_status.name as supportStatusName',
                DB::raw('IFNULL(support_status.likes,0) AS supportStatusLikes'),
                //'if(support_status.likes AS supportStatusLikes',
                DB::raw('COUNT(requests.id) AS voterRequestCount'),
            ];
            if ($request->input("clean") == '1') {
                $voterSearchfieldsWeNeed = [
                    'voters.key AS voters_key',
                    'voters.personal_identity AS personalIdentity',
                    'voters.first_name AS firstName',
                    'voters.last_name AS lastName',
                    'voters.city_id',
                    'voters.neighborhood',
                    DB::Raw("IF(streets.name IS NULL, voters.street , streets.name) as street"),
                    DB::Raw("IF(mi_city.name IS NULL, cities.name , mi_city.name) as cityName"),
                    // 'voters.city AS cityName',
                ];
            }
            $lastcampaignId = VoterElectionsController::getLastCampaign();

            $voterStuff = $searchVoterCore->select($voterSearchfieldsWeNeed)
                ->leftJoin('cities as mi_city', 'mi_city.id', 'voters.mi_city_id')
                ->withCitiesIfMissing(true)
                // ->withBranchSupportStatus()
                ->withSupportStatus0($lastcampaignId)
                ->withCrmRequestCount()
                ->withStreet(true)
                ->with(['phones' => function ($query) {
                    $query->select('voter_phones.id', 'voter_id', 'phone_number', 'phone_type_id', 'pt.name AS phone_type_name')
                        ->join('phone_types AS pt', 'pt.id', '=', 'voter_phones.phone_type_id')
                        ->orderBy('phone_type_id', 'ASC')
                        ->where('wrong', 0);
                }])
                ->groupBy('voters.id');
            $userPermissions = $user->permissions();
            $isAllowedShowUsers = $user->admin;

            if (!$isAllowedShowUsers) {
                foreach ($userPermissions as $permission) {
                    if ($permission->operation_name == 'elections.voter.search.show_users') {
                        $isAllowedShowUsers = true;
                        break;
                    }
                }
            }

            if ($isAllowedShowUsers) {
                $voterStuff->withUser()
                    ->withUsersMainRole(true)
                    ->withUserRules(true)
                    ->addSelect('users.key AS user_key', 'user_roles.name AS user_main_role');
            }
        
            if (!is_null($request->input('max_number_of_rows')) && is_numeric($request->input('max_number_of_rows'))) {
                $result = $voterStuff->limit($request->input('max_number_of_rows'))->get();
            } else {
                $result = $voterStuff->skip($skip)->take($limit)->get();
            }

			
            foreach ($result as $row) {
                if ($row['street_name'] != null) {
                    $row['street'] = $row['street_name'];
                }
                unset($row['street_name']);
            }
			
            $jsonOutput->setData($result);
        }
    }

    private function getSearchResultsCount($searchVoterCore, $isPhone, $withStreet, $isLeftJoin = false) {
        $rowsCount = -1;

        $searchVoterCore->withCitiesIfMissing(true);
        if (!$isPhone) {
             $searchVoterCore->select(DB::raw('COUNT(DISTINCT voters.id) as count'));
        } else {
            $searchVoterCore->withPhones('left')->select(DB::raw('COUNT(DISTINCT voters.id) as count'));
        }
        if ($withStreet) $searchVoterCore->withStreet(true);

        $rowsCount = $searchVoterCore->first()->count;

        return $rowsCount;
    }

    /**
     * Check if every single parameter of the request is in the "Okay list".
     *
     * @param $request
     *
     * @return bool|int|string
     */
    private function validateVoterSearchParams($request)
    {

        $result = false;
        $checkedSearchParam = [];

        foreach ($this->voterSearchParams as $rightParam => $v) {

            if (isset($request[$rightParam])) {
                /*
                 * Bingo! We have a "legal" parameter!
                 */
                $checkedSearchParam[$rightParam] = 1;
            }
        }

        return (count($checkedSearchParam) > 0) ? array_keys($checkedSearchParam) : $result;
    }

    /**
     * Check for search parameters values.
     * Return TRUE if all parameters are in 'range' and an array with
     * specific error(s) if one(at least) of parameters are out of 'range'.
     *
     * @param $request
     *
     * @return array|bool
     */
    private function validateVoterSearchValues(&$request)
    {
        $errorCode = false;

        if (isset($request['personal_identity'])) {
            /**
             * We don't check it against the Luhn algorithm.
             */
            $tLen = strlen($request['personal_identity']);
            if (false == is_numeric($request['personal_identity']) || $tLen < 2 || $tLen > 10) {
                $errorCode = 'PERSONAL_IDENTITY_NOT_VALID';
            }
        }
        if (isset($request['voter_key'])) {
            /**
             * We don't check it against the Luhn algorithm.
             */
            $tLen = strlen($request['voter_key']);
            if (false == is_numeric($request['voter_key']) ||  $tLen <> 10) {
                $errorCode = 'PERSONAL_IDENTITY_NOT_VALID';
            }
        }

        if (isset($request['phone'])) {
            if (false == Helper::isIsraelPhone($request['phone'])) {
                $errorCode = 'PERSONAL_IDENTITY_NOT_VALID';
            }
        }

        if (isset($request['first_name'])) {
            $length = strlen($request['first_name']);
            if (false == Helper::isStringOrBlank($request['first_name']) || $length < 2 || $length > 20) {
                $errorCode = 'PERSONAL_NAME_NOT_VALID';
            }
        }

        if (isset($request['last_name'])) {
            $length = strlen($request['last_name']);
            if (false == Helper::isStringOrBlank($request['last_name']) || $length < 2 || $length > 20) {
                $errorCode = 'FAMILY_NAME_NOT_VALID';
            }
        }

        if (isset($request['street_text'])) {
            $length = strlen($request['street_text']);
            if (false == Helper::isAlphaNumericOrBlank($request['street_text']) || $length < 2 || $length > 20) {
                $errorCode = 'STREET_NAME_NOT_VALID';
            }
        }

        if (isset($request['father_first_name'])) {
            $length = strlen($request['father_first_name']);
            if (false == Helper::isStringOrBlank($request['father_first_name']) || $length < 2 || $length > 20) {
                $errorCode = 'FATHER_NAME_NOT_VALID';
            }
        }
        /**
         * Birth year and age limit are mutual exclusive!
         */
        if (isset($request['birth_year']) && (isset($request['age_min']) || isset($request['age_max']))) {
            $errorCode = 'AGE_NOT_VALID';
        } else {
            if (isset($request['birth_year'])) {
                if (false == $this->isValidVoterBirthYear($request['birth_year'])) {
                    $errorCode = 'BIRTHDATE_NOT_VALID';
                }
            } else {
                if (isset($request['age_min'])) {
                    if (false == $this->isValidVoterAge($request['age_min'])) {
                        $errorCode = 'AGE_NOT_VALID';
                    }
                } else {
                    if (isset($request['age_max'])) { //if age min not set and age max is set, ERROR
                        $errorCode = 'AGE_NOT_VALID';
                    }
                }
                if (isset($request['age_max'])) {
                    if (false == $this->isValidVoterAge($request['age_max'])) {
                        $errorCode = 'AGE_NOT_VALID';
                    }
                } else {
                    if (isset($request['age_min'])) { //if age max not set and age min is set, ERROR
                        $errorCode = 'AGE_NOT_VALID';
                    }
                }
            }
        }

        if (isset($request['house_number'])) {
            $length = strlen($request['house_number']);
            if (false == Helper::isAlphaNumericOrBlank($request['house_number']) || $length < 2 || $length > 20) {
                $errorCode = 'HOUSE_NUMBER_NOT_VALID';
            }
        }

        return ($errorCode ? $errorCode : true);
    }

    /**
     * @param $searchVoterCore
     * @param $request
     * @param $param
     */
    private function assemblyVoterSearchWhere(&$searchVoterCore, $request, &$param, $isAdvancedSearch)
    {
        if (in_array('city', $param)) {
            $tmp = json_decode($request['city'], true);
            $cityId = [];

            foreach ($tmp as &$v) {
                $cityId[] = trim($v['id']);
            }

            if (count($cityId) > 0) {
                $searchVoterCore->where(function ($query) use ($cityId) {
                    $query->whereIn('voters.city_id', $cityId)
                        ->orWhereIn('voters.mi_city_id', $cityId);
                });
            }
            unset($tmp);
            unset($cityId);
        }

        if (in_array('street', $param)) {
            $streetsArray = json_decode($request['street'], true);
            $streetKeysArray = [];
            $streetNamesArray = [];
			for($i = 0 ; $i < sizeof($streetsArray) ; $i++){
				array_push($streetKeysArray , $streetsArray[$i]['key']);
				array_push($streetNamesArray , $streetsArray[$i]['name']);
			}
			if(sizeof($streetKeysArray) > 0){
				$streetIDS=[];
				$streets = Streets::select('id')->whereIn('key',$streetKeysArray)->get();
				for($i = 0 ; $i < sizeof($streets) ; $i++){
					array_push($streetIDS , $streets[$i]->id);
				}
			}
 

            if (count($streetIDS) > 0) {
                $searchVoterCore->where(function ($query) use ($streetKeysArray, $streetNamesArray) {
                    $query->whereIn('voters.street_id', $streetKeysArray)
                        ->orWhereIn('voters.street', $streetNamesArray);
                });
            }
        }

        if (in_array('street_text', $param)) {
            $street = $request['street_text'];
            $searchVoterCore->where(function ($query) use ($street, $isAdvancedSearch) {
                $query->where('voters.street', '=', $street);
            });
        }

        /**
         * Handle birth_year
         */
        if (in_array('birth_year', $param)) {
            $searchVoterCore->where(DB::raw('YEAR(voters.birth_date)'), '=', $request['birth_year']);
        }

        /**
         * Handle age_min, age_max
         */
        if (in_array('age_min', $param) && in_array('age_max', $param)) {

            $tmpAgeMin = min((int) $request['age_min'], (int) $request['age_max']);
            $tmpAgeMax = max((int) $request['age_min'], (int) $request['age_max']);
            if ($tmpAgeMin == $tmpAgeMax) {
                $searchVoterCore->where(DB::raw('YEAR(voters.birth_date)'), '=', Helper::yearFromAge($tmpAgeMin));
            } else {
                $searchVoterCore->where(DB::raw('YEAR(voters.birth_date)'), '>=', Helper::yearFromAge($tmpAgeMax)) /* = */
                    ->where(DB::raw('YEAR(voters.birth_date)'), '<=', Helper::yearFromAge($tmpAgeMin));
            }
        }

        if (in_array('age_min', $param) xor in_array('age_max', $param)) {
            $tmpAge = -1;
            if (in_array('age_min', $param)) {
                $tmpAge = $request['age_min'];
            } else {
                $tmpAge = $request['age_max'];
            }

            $searchVoterCore->where(DB::raw('YEAR(voters.birth_date)'), '=', Helper::yearFromAge($tmpAge));
        }
        /**
         * Final touch on 'where'
         */
        if (in_array('personal_identity', $param)) {
            $noLeftZero = (string) ((int) $request['personal_identity']);
            $searchVoterCore->where('voters.personal_identity', 'like', ($isAdvancedSearch ? '%' : '') . $noLeftZero . '%');
        }
        if (in_array('voter_key', $param)) {
            $keyNoLeftZero = (string) ((int) $request['voter_key']);
            $searchVoterCore->where('voters.key', '=', $keyNoLeftZero);
        }

        if (in_array('phone', $param)) {
            $phoneSearch = str_replace('-', '', $request['phone']);
            $searchVoterCore->where('voter_phones.phone_number', 'like', ($isAdvancedSearch ? '%' : '') . $phoneSearch . '%');
        }

        if (in_array('first_name', $param)) {
            $searchVoterCore->where('voters.first_name', 'like', ($isAdvancedSearch ? '%' : '') . $request['first_name'] . '%');
        }

        if (in_array('last_name', $param)) {
            $searchVoterCore->where('voters.last_name', 'like', ($isAdvancedSearch ? '%' : '') . $request['last_name'] . '%');
        }

        if (in_array('house_number', $param)) {
            $searchVoterCore->where('voters.house', 'like', ($isAdvancedSearch ? '%' : '') . $request['house_number'] . '%');
        }

        if (in_array('father_first_name', $param)) {
            $searchVoterCore->where('voters.father_name', 'like', ($isAdvancedSearch ? '%' : '') . $request['father_first_name'] . '%');
        }
    }

    /*
     *   This function gets the Voter Data from
     *   the database.
     *   It's called by an Ajax call from component
     *   Voter.
     *
     *   @param $voterKey - The voter key
     */

    public function getVoterDetails2(Request $request, $voterKey = null)
    {

        $voterDetailsField = ['voters.id',
            'personal_identity',
            'first_name',
            'last_name',
            'birth_date',
            'origin_country_id',
            'father_name',
            'gender',
            'previous_last_name',
            /* 'EDA as congregation',
            'PHONE1 as phone1',
            'PHONE2 as phone2',
            'PHONE3 as phone3', */
            'email',
            /* 'MAIN_PHONE as main_phone', */
            'city',
            'neighborhood',
            'street',
            'house',
            'house_entry',
            'flat',
            'zip',
            'mi_city',
            'mi_neighborhood',
            'mi_street',
            'mi_house',
            'mi_house_entry',
            'mi_flat',
            'mi_zip'];

        $jsonOutput = app()->make("JsonOutput");
        $tempUser = false;
        if ($request->input('temp_voter_id') != null) {
            $userData = TempVoter::where('id', $request->input('temp_voter_id'))->first();
            $userData->phones = array();
            $userData->birth_date = '';
            $userData->email = '';
            $jsonOutput->setData($userData);

            return;
        } else {
            if ($request->input('identity') != null && $request->input('identity') == 'true') {

                $userData = Voters::withFilters()->where('personal_identity', $voterKey)->first($voterDetailsField);
                if ($userData == null) {
                    $userData = TempVoter::where('personal_identity', $voterKey)->first();
                    if ($userData) {
                        $jsonOutput->setData(array('personal_identity' => $userData->personal_identity,
                            'first_name' => $userData->first_name,
                            'last_name' => $userData->last_name,
                            'phones' => array(),
                            'birth_date' => '',
                            'email' => ''));

                        return;
                        $tempUser = true;
                    }
                }
            } else {
                $userData = Voters::withFilters()->where('personal_identity', $voterKey)->first($voterDetailsField);
            }
        }

        if ($userData == null) {
            $jsonOutput->setData(array('personal_identity' => '',
                'first_name' => '',
                'last_name' => '',
                'phones' => array(),
                'birth_date' => '',
                'email' => ''));

            return;
        }

        $voterData = $userData;

        if ($userData->gender == config('constants.VOTER_GENDER_MALE_NUMBER')) {
            $userData->gender = config('constants.VOTER_GENDER_MALE_STRING');
        } else {
            $userData->gender = config('constants.VOTER_GENDER_FEMALE_STRING');
        }

        $voterData->birth_date = "01/01/" . $voterData->birth_year;

        $voterData->city = trim($userData->city);
        $voterData->mp_city = trim($userData->mp_city);

        if ($voterData->prev_first_name == null) {
            $voterData->prev_first_name = '';
        }

        $votersFields = ['id',
            'phone_from_table',
            'contact_via_email',
            'main_voter_phone_id',
            'actual_address_correct'];
        $voters = $userData->voter()->first($votersFields);

        if ($voters != null) {
            $voterData->voter_id = $voters->id;
            $voterData->phone_from_table = $voters->phone_from_table;
            $voterData->contact_via_email = $voters->contact_via_email;
            $voterData->main_voter_phone_id = $voters->main_voter_phone_id;
        } else {
            $voterData->voter_id = 0;
            $voterData->phone_from_table = 0;
            $voterData->contact_via_email = 0;
            $voterData->main_voter_phone_id = null;
        }

        // If email is empty there is no point in
        // registering the email in the new letter
        if (!$voterData->email) {
            $voterData->contact_via_email = 0;
        }

        if ($voters != null) {
            $voterPhones = $voters->phones()->get();
            $voterData->phones = $voterPhones;
            $numOfPhones = count($voterData->phones);
            for ($phoneIndex = 0; $phoneIndex < $numOfPhones; $phoneIndex++) {
                $voterData->phones[$phoneIndex]->phone_id = $voterData->phones[$phoneIndex]->id;
                $voterData->phones[$phoneIndex]->defined = true;
            }

            $voterRequestsFields = ['requests.id',
                'requests.key',
                'requests.date',
                'requests.target_close_date',
                'request_status.name as request_status_name',
                'teams.name as team_name'];
            $crmRequests = $voters->crmRequests()->select($voterRequestsFields)->withTopic()->withSubTopic()->withStatus()->withHandlerTeam()->withUser()->withPriority()->with(['documents' => function ($query) {

                $query->wherePivot('entity_type', '=', config('constants.ENTITY_TYPE_REQUEST'))->where('deleted', 0);
            }])->with('actions')->addSelect('requests.id as request_id')->get();
            $voterData->voterRequests = $crmRequests;

            //$voterDocuments = $voters->documents()->select()->get();
            //$voterData->voterDocuments = $voterDocuments;

            $voterActionsFields = ['actions.id',
                'action_types.name as action_type_name',
                'action_status.name as action_status_name',
                'actions.conversation_direction',
                'actions.user_create_id',
                'actions.action_date',
                'actions.description',
                'actions.conversation_with_other',
                'action_topics.name as action_topic_name',
                'first_name',
                'last_name'];
            $voterActions = $voters->actions()->withUser()->withTopic()->withType()->withStatus()->select($voterActionsFields)->get();
            $voterData->voterActions = $voterActions;
        } else { // Voters is null
            // If Voters is null then
            // Initialize the data to
            // empty arrays
            $voterData->voterRequests = [];
            //$voterData->voterDocuments = [];
            $voterData->voterActions = [];
        }

        $jsonOutput->setData($voterData);
    }

    public function getVoterActions($voterKey)
    {

        $voterActionsFields = ['actions.id',
            'action_types.name as action_type_name',
            'action_status.name as action_status_name',
            'actions.conversation_direction',
            'actions.user_create_id',
            'actions.action_date',
            'actions.description',
            'actions.conversation_with_other',
            'action_topics.name as action_topic_name',
            'first_name',
            'last_name'];

        $voterActions = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id'])->actions()->withUser()->withTopic()->withType()->withStatus()->select($voterActionsFields)->get();

        $jsonOutput = app()->make("JsonOutput");

        $jsonOutput->setData($voterActions);
    }

    public function getVoterRequests($voterKey)
    {

        $voterRequestsFields = ['requests.id',
            'requests.key',
            'requests.date',
            'requests.target_close_date',
            'request_status.name as request_status_name',
            'teams.name as team_name'];

        $voterRequests = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id'])->crmRequests()->select($voterRequestsFields)->withTopic()->withSubTopic()->withStatus()->withHandlerTeam()->withUser()->withPriority()->with(['documents' => function ($query) {

            $query->wherePivot('entity_type', '=', config('constants.ENTITY_TYPE_REQUEST'))->where('deleted', 0);
        }])->with('actions')->addSelect('requests.id as request_id')->get();

        $jsonOutput = app()->make("JsonOutput");

        $jsonOutput->setData($voterRequests);
    }

    /*
     *   This function gets the Voter Data from
     *   the database.
     *   It's called by an Ajax call from component
     *   Voter.
     *
     *   @param $voterKey - The voter key
     */

    public function getVoterDetails(Request $request, $voterKey = null)
    {

        if ($request->input('useSecondVoter') == 'true') {
            return $this->getVoterDetails2($request, $voterKey);
        }

        $voterDetailsField = ['voters.id',
            'voters.key',
            'personal_identity',
            'first_name',
            'last_name',
            'city',
            'voters.city_id',
            'c.name as city_name',
            'c.key as city_key',
            'c.crm_team_id',
            'neighborhood',
            'voters.street',
            'streets.id as street_id',
            'streets.name as street_name',
            'voters.house',
            'house_entry',
            'flat',
            'zip',
            'mark',
            'distribution_code',
            'mi_city',
            'mi_city_id',
            'mi_cities.key as mi_city_key',
            'mi_neighborhood',
            'mi_street',
            'mi_streets.id as mi_street_id',
            'mi_streets.name as mi_street_name',
            'mi_house',
            'mi_house_entry',
            'mi_flat',
            'mi_zip',
            'mi_mark',
            'can_vote',
            'voters.sephardi',
            'origin_country_id',
            'countries.name as origin_country_name',
            'ethnic_group_id',
            'ethnic_groups.name as ethnic_group_name',
            'religious_group_id',
            'religious_groups.name as religious_group_name',
            'voter_title_id',
            'voter_titles.name as voter_title_name',
            'voter_ending_id',
            'voter_endings.name as voter_ending_name',
            'phone_from_table',
            'contact_via_email',
            'sms',
            'main_voter_phone_id',
            'household_id',
            'actual_address_correct',
            'shas_representative',
            'birth_date',
            'birth_date_type',
            'father_name as father_first_name',
            'gender',
            'voters.email',
            'previous_last_name',
            'users.id as user_id',
            'users.key as user_key',
            'voters_in_election_campaigns.id as voters_in_election_campaigns_id',
            'vs0.key as voter_support_status_key0',
            'support_status.id as support_status_id0',
            'support_status.name as support_status_name0',
             DB::raw('IFNULL(support_status.likes,0) AS support_status_likes0'),
            //'support_status.likes as support_status_likes0',
            'deceased' , 'deceased_date',
            // Voters bank details
            'bank_branches.bank_id as bank_number',
            'bank_branches.branch_number as bank_branch_number',
            'bank_branches.id as bank_branch_id',
            DB::raw("CONCAT(bank_branches.name,' (',branch_number,')') AS bank_branch_name"),
            'bank_details.bank_account_number',
            'bank_details.bank_owner_name',
            'bank_details.other_owner_type',
            'bank_details.is_activist_bank_owner',
            'bank_details.is_bank_verified',
            'bank_details.verify_bank_document_key',
            'bank_details.created_at as bank_details_created_time'
        ];

        $jsonOutput = app()->make("JsonOutput");

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)
            ->orWhere('voters.personal_identity', $voterKey)->first();
        if (null == $voterExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()
            ->where(function ($query) use ($voterKey) {
                $query->where('voters.key', $voterKey)
                    ->orWhere('voters.personal_identity', $voterKey);
            })->first(['voters.id']);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $lastcampaignId = VoterElectionsController::getLastCampaign();

        $voterDetails = Voters::select($voterDetailsField)
            ->selectRaw("IF(mi_city_details.name IS NULL , voters.mi_city , mi_city_details.name ) as mi_city_name")
			->leftJoin('cities as mi_city_details' , 'mi_city_details.id' , '=','voters.mi_city_id')
			->where('voters.key', $voterKey)
            ->orWhere('voters.personal_identity', $voterKey)
            ->withCountry()
            ->withEthnic()
            ->withReligiousGroup()
            ->withCity()
            ->withMiCity()
            ->withStreet(true)
            ->withMiStreet(true)
            ->withTitle()
            ->withUser()->withEnding()
            ->withBankDetails()
            ->withCheckVoterInElectionCampaigns()
            ->withSupportStatus0($lastcampaignId)
            ->addSelect(DB::raw("TIMESTAMPDIFF( YEAR, voters.birth_date, CURDATE() ) AS age"))
            ->first();
			
 	
        if (null == $voterDetails) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
		
	    if($voterDetails->deceased == '1'){
			$voterDetails->voter_voting_text = "נפטר";
			$voterDetails->eligible="0";
		}
		else{
			$voterInAnyElectionCampaign = VoterElectionCampaigns::where('voter_id' , $voterDetails->id)->first();
			if(!$voterInAnyElectionCampaign){
				$voterDetails->voter_voting_text = "נפש";
				$voterDetails->eligible="0";
			}
			else{
				$voterInCurrentCampaign= VoterElectionCampaigns::where('voter_id' , $voterDetails->id)->where('election_campaign_id' , $lastcampaignId)->first();
				if($voterInCurrentCampaign){
					$voterDetails->eligible="1";
					$voterInPreviousCampaign = VoterElectionCampaigns::where('voter_id' , $voterDetails->id)->where('election_campaign_id'  , '<>', $lastcampaignId)->first();
					if($voterInPreviousCampaign){
						$voterDetails->voter_voting_text = "בעל זכות הצבעה";
					}
					else{
						$voterDetails->voter_voting_text = "תושב חדש";
					}
					
				}
				else{
					$voterDetails->voter_voting_text = "ללא זכות הצבעה";
					$voterDetails->eligible="0";
				}
				
			}
		}

        switch ($voterDetails->gender) {
            case config('constants.VOTER_GENDER_MALE_NUMBER'):
                $voterDetails->gender_name = config('constants.VOTER_GENDER_MALE_STRING');
                break;

            case config('constants.VOTER_GENDER_FEMALE_NUMBER'):
                $voterDetails->gender_name = config('constants.VOTER_GENDER_FEMALE_STRING');
                break;

            default:
                $voterDetails->gender_name = '';
                break;
        }

        if ($voterDetails->birth_date != null) {
            switch ($voterDetails->birth_date_type) {
                case config('constants.BIRTH_DATE_TYPE_ONLY_YEAR'):
                    $voterDetails->birth_date_type_name = "שנה";
                    break;

                case config('constants.BIRTH_DATE_TYPE_YEAR_AND_MONTH'):
                    $voterDetails->birth_date_type_name = "חודש";
                    break;

                case config('constants.BIRTH_DATE_TYPE_FULL_DATE'):
                    $voterDetails->birth_date_type_name = "תאריך מלא";
                    break;
            }
        } else {
            $voterDetails->birth_date = null;
            $voterDetails->birth_date_type_name = '';
        }

        if ($voterDetails->previous_last_name == null) {
            $voterDetails->previous_last_name = '';
        }

        if ($voterDetails->email == null) {
            $voterDetails->email = "";
        }

        if ($voterDetails->distribution_code == null) {
            $voterDetails->distribution_code = "";
        }

        if ($voterDetails->zip == null) {
            $voterDetails->zip = "";
        }

        if ($voterDetails->house == null) {
            $voterDetails->house = "";
        }

        if ($voterDetails->house_entry == null) {
            $voterDetails->house_entry = "";
        }

        if ($voterDetails->flat == null) {
            $voterDetails->flat = "";
        }

        if ($voterDetails->neighborhood == null) {
            $voterDetails->neighborhood = "";
        }

        if ($voterDetails->street == null) {
            $voterDetails->street = "";
        }

        if ($voterDetails->street_name == null) {
            $voterDetails->street_name = $voterDetails->street;
        }

        if ($voterDetails->mi_street_name == null) {
            $voterDetails->mi_street_name = $voterDetails->mi_street;
        }

        $voterPhonesFields = [
            'voter_phones.id',
            'voter_phones.key',
            'voter_phones.phone_number',
            'voter_phones.call_via_tm',
            'voter_phones.call_via_phone',
            'voter_phones.sms',
            'voter_phones.phone_type_id',
            'voter_phones.wrong',
            'phone_types.name as phone_type_name',
            'voter_phones.updated_at',
        ];
        $voterPhones = $voterDetails->select($voterPhonesFields)->withPhones('inner', true)->where('voters.id', $voterDetails->id)
            ->orderBy('voter_phones.updated_at', 'desc')->get();
        $voterDetails->phones = $voterPhones;
        $numOfPhones = count($voterDetails->phones);
        for ($phoneIndex = 0; $phoneIndex < $numOfPhones; $phoneIndex++) {
            $voterDetails->phones[$phoneIndex]->defined = true;

            $voterDetails->phones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($voterDetails->phones[$phoneIndex]->phone_number);
        }

        $voterDetails->lastCrmRequestDateTime = null;
        $voterReqObj = CrmRequest::select('requests.date as date')->where('voter_id', $voterDetails->id)
            ->orderBy('requests.date', 'DESC')->first();
        if ($voterReqObj) {
            $voterDetails->lastCrmRequestDateTime = $voterReqObj->date;
        }
        if ($voterDetails->shas_representative != '1') {
            $voterDetails->shas_representative = (ElectionsCitiesController::IsShasRepresentative($voterDetails->id) ? 1 : 0);
        }
        $jsonOutput->setData($voterDetails);
    }

    public function getVoterPhones(Request $request, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)->first('id');
        if (null == $voterExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(["voters.id"]);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $voterPhonesFields = [
            'voter_phones.id',
            'voter_phones.key',
            'voter_phones.phone_number',
            'voter_phones.call_via_tm',
            'voter_phones.call_via_phone',
            'voter_phones.sms',
            'voter_phones.phone_type_id',
            'voter_phones.wrong',
            'phone_types.name as phone_type_name',
            'voter_phones.updated_at',
        ];

        $voterPhones = Voters::where('voters.key', $voterKey)->withPhones('inner', true)->select($voterPhonesFields)
            ->orderBy('voter_phones.updated_at', 'desc')->get();

        for ($phoneIndex = 0; $phoneIndex < count($voterPhones); $phoneIndex++) {
            $voterPhones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($voterPhones[$phoneIndex]->phone_number);
        }

        $jsonOutput->setData($voterPhones);
    }

    private function getVoterPhonesHash($voterKey, $getAllPhoneData = true)
    {
        $voterPhonesFields = [
            'voter_phones.id',
            'voter_phones.key',
            'voter_phones.phone_number'
        ];  

        $voterPhonesMoreFields = [
            'voter_phones.call_via_tm',
            'voter_phones.call_via_phone',
            'voter_phones.sms',
            'voter_phones.wrong',
            'voter_phones.phone_type_id',
            'phone_types.name as phone_type_name'
        ];


        $voterPhones = Voters::where('voters.key', $voterKey)
            ->select($voterPhonesFields);

        if($getAllPhoneData){
            $voterPhones->withPhones('inner', true)->addSelect($voterPhonesMoreFields);
        } else {
            $voterPhones->withPhones();
        }
        $voterPhones = $voterPhones->get();
        $voterPhonesHash = [];
        for ($index = 0; $index < count($voterPhones); $index++) {
            $key = $voterPhones[$index]->key;
            if($getAllPhoneData){
                $voterPhonesHash[$key] = [
                    "id" => $voterPhones[$index]->id,
                    "key" => $key,
                    "phone_number" => $voterPhones[$index]->phone_number,
                    "call_via_tm" => $voterPhones[$index]->call_via_tm,
                    "call_via_phone" => $voterPhones[$index]->call_via_phone,
                    "sms" => $voterPhones[$index]->sms,
                    "phone_type_id" => $voterPhones[$index]->phone_type_id,
                    "wrong" => $voterPhones[$index]->wrong
                ];
            }else{
                $voterPhonesHash[$key] = [
                    "id" => $voterPhones[$index]->id,
                    "key" => $key,
                    "phone_number" => $voterPhones[$index]->phone_number,
                ];
            }

        }

        return $voterPhonesHash;
    }

    /*
     *  This function updates the voter data.
     *  It's called by an Ajax call triggered
     *  by save button data click in component
     *  Voters
     *
     *  @param $request
     *  @param $voterKey - The voter key
     */

    public function updateVoter(Request $request, $voterKey)
    {

        $voterData = $request->input('voter_data', null);

        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData('Saved by the bell');
    }

    public function updateVoterBankDetails(Request $request, $voterKey){
        $jsonOutput = app()->make("JsonOutput");
        
        try {
        $bank_branch_id = $request->input('bank_branch_id', null);
        $bank_account_number = $request->input('bank_account_number', null);
        $bank_owner_name = $request->input('bank_owner_name', null);
        $other_owner_type = $request->input('other_owner_type', null);
        $is_activist_bank_owner = $request->input('is_activist_bank_owner', null);
        $is_bank_verified = $request->input('is_bank_verified', null);

        $disable_bank_validation = $request->input('disable_bank_validation', null);
        $screen_permissions = $request->input('screen_permissions', null);

        $canVerifyBankDetails = GlobalController::isActionPermitted("elections.$screen_permissions.bank_details.verify");
        $canDisableBankValidation = GlobalController::isActionPermitted("elections.$screen_permissions.bank_details.disabled_validation");
        $disable_bank_validation = ($canDisableBankValidation && $disable_bank_validation) ? true : false; 

        $electionCampaignId= ElectionCampaigns::currentCampaign()->id;

        /** Bank Editable details  */
        $bankDetailsFields = [
             'bank_branch_id' , 'bank_account_number' ,
             'bank_owner_name', 'other_owner_type', 'is_activist_bank_owner'
        ];

        // $fields = array_merge($bankDetailsFields, ['voters.id as voter_id']);
        $voter = Voters::select('voters.id')->where('voters.key', $voterKey)->first('id');
        if (!$voter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }


        $voterBankDetails = BankDetails::where('voter_id', $voter->id)->first();
        $oldBankDetails=null;
        if($voterBankDetails)
        $oldBankDetails = $voterBankDetails->replicate();
        $currentUserId = Auth::user()->id;
        /** If Voter don't has bank details row */
        if(!$voterBankDetails){
            $voterBankDetails = new BankDetails();
            $voterBankDetails->key = Helper::getNewTableKey('bank_details', 5);
            $voterBankDetails->voter_id = $voter->id;
            $voterBankDetails->user_create_id = $currentUserId;
        }
        $voterBankDetails->validation_election_campaign_id = $electionCampaignId;
        
        $voterBankDetails->user_update_id = $currentUserId;

        $needToCheckBank = false;
        /** Check if bank important details had changed */
        if( !empty($bank_branch_id) || !empty($bank_account_number)){
            $bankBranch = BankBranches::where('id', $bank_branch_id)->first();
            if(!$bankBranch || empty($bank_account_number)){ // Check if bank data is valid
                $jsonOutput->setErrorCode(config('errors.elections.BANK_DETAILS_NOT_VALID')); return;
            }
            // Check if bank data had changed
            if($bank_account_number != $voterBankDetails->bank_account_number || $bank_branch_id != $voterBankDetails->bank_branch_id){
                $needToCheckBank = true;
            }
            /** Check if need to check bank details (with external api) */
            if($needToCheckBank ){
                if($is_bank_verified){
                    $jsonOutput->setErrorCode(config('errors.elections.CANT_EDIT_VERIFIED_BANK_DETAILS')); return;
                }
                $bank_number = $bankBranch->bank_id;
                $bank_branch_number = $bankBranch->branch_number;
                $jerusalemBankId = 54;
                $noValidationBankList = [$jerusalemBankId] ; // Not need to check this bank details 
                if(!$disable_bank_validation && !in_array($bank_number, $noValidationBankList)){
                    $isBankValid =  BankDetailsService::checkBankDetailsValidation($bank_number, $bank_branch_number, $bank_account_number);
                    if(!$isBankValid){
                        $jsonOutput->setErrorCode(config('errors.elections.BANK_DETAILS_NOT_VALID')); return;
                    }
                    $voterBankDetails->is_bank_pass_validation = 1;
                } else {
                    $voterBankDetails->is_bank_pass_validation = 0;
                }

            }
        }

        /** Bank details history fields */
        $actionHistoryFieldsNames = [
            'bank_branch_id' => config('history.ElectionRolesByVoters.bank_branch_id'),
            'bank_account_number' => config('history.ElectionRolesByVoters.bank_account_number'),
            'bank_owner_name' => config('history.ElectionRolesByVoters.bank_owner_name'),
            'other_owner_type' => config('history.ElectionRolesByVoters.other_owner_type'),
            'is_activist_bank_owner' => config('history.ElectionRolesByVoters.is_activist_bank_owner'),
        ];
        if($canVerifyBankDetails){
            $bankDetailsFields[] = 'is_bank_verified';
            $actionHistoryFieldsNames['is_bank_verified'] = config('history.ElectionRolesByVoters.is_bank_verified');
            if($request->input('is_bank_verified') == 1){
                $voterBankDetails->validation_election_campaign_id = $electionCampaignId;
            }
        }
        $updatedValuesArray = [];
        foreach ($bankDetailsFields as $field) {
            $newValue = $$field;
            $oldValue = $voterBankDetails->$field;
            if($oldValue != $newValue){
                $updatedValuesArray[$field] = $oldValue;
                $voterBankDetails->$field = $newValue;
            }
        }

        if($canVerifyBankDetails){
       }
        
        if(count($updatedValuesArray) > 0){
                if ($oldBankDetails) {
                    BankDetailsService::checkIsValidUpdateWrongBankDetails($oldBankDetails, $voterBankDetails);
                    $voterBankDetails->is_bank_wrong = 0;
                }
                $voterBankDetails->save();
            $historyArgsArr = [
                'topicName' => 'elections.activists.bank_details',
                'models' => []
            ];
    
            $fieldsArray = [];
            foreach ($updatedValuesArray as $fieldName => $fieldOldValue) {
                $fieldsArray[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config("history.BankDetails.$fieldName"),
                    'old_value' => $fieldOldValue,
                    'new_value' => $voterBankDetails->{$fieldName},
                ];
            }
    
            $historyArgsArr['models'][] = [
                'referenced_model' => 'ElectionRolesByVoters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterBankDetails->id,
                'valuesList' => $fieldsArray,
            ];
            ActionController::AddHistoryItem($historyArgsArr);
        }
        
        $jsonOutput->setData($voterBankDetails);
    } catch (\Exception $e) {
        $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }

    }
    public function getBanksBranchesTree(){
        $jsonOutput = app()->make("JsonOutput");

        $banksBranches = BankBranchesService::getBanksBranchesTree();
        // dd($banksBranches->toArray());
        $jsonOutput->setData( $banksBranches);

    }
    public function updateVoterBankDetailsVerification(Request $request, $voterKey){
        $jsonOutput = app()->make("JsonOutput");

        $voter = Voters::select('voters.id')->where('voters.key', $voterKey)->first('id');
        if (!$voter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $voterBankDetails = BankDetails::where('voter_id', $voter->id)->first();
        /** If Voter don't has bank details row */
        if(!$voterBankDetails){
            $jsonOutput->setErrorCode(config('errors.elections.BANK_DETAILS_MISSING'));
        }
        $is_bank_verified = $request->input('is_bank_verified') == 1;
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        if ($is_bank_verified){
            $voterBankDetails->validation_election_campaign_id = $electionCampaignId;
        } else {
            $voterBankDetails->is_bank_verified = false;
        }
        $currentUserId = Auth::user()->id;

        $voterBankDetails->user_update_id = $currentUserId;
        $voterBankDetails->save();
        $jsonOutput->setData(true);
    }
    private static function calculateVoterHouseHold($voterId, $voterFamilyName, $addressObj, $updateHouseholds, $voterHouseholdsIds,
                                                    $userCreateId = null, $entityId = null, $entityType = null) {

        $addressFields = [
            'city_id',
            'neighborhood',
            'house',
            'house_entry',
            'flat',
        ];

        for ($addresIndex = 0; $addresIndex < count($addressFields); $addresIndex++) {
            $fieldName = $addressFields[$addresIndex];

            $voterDataHash[$fieldName] = $addressObj->{$fieldName};
        }
        $voterDataHash['last_name'] = $voterFamilyName;

        if ($addressObj->street_id == null) {
            $voterDataHash['street_id'] = $addressObj->street_id;
            $newHouseHolds = Voters::select(['voters.id'])->where($voterDataHash)->get();
        } else {
            $newHouseHolds = Voters::select(['voters.id'])->where($voterDataHash)
                ->where(function ($query) use ($addressObj) {
                    $query->orWhere('street_id', $addressObj->street_id)
                        ->orWhere('street', $addressObj->street_name);
                })->get();
        }

        $newHouseHoldsIds = [];
        if ($newHouseHolds != null) {
            for ($householdIndex = 0; $householdIndex < count($newHouseHolds); $householdIndex++) {
                $newHouseHoldsIds[] = $newHouseHolds[$householdIndex]->id;
            }
        }

        $maxHouseholdId = Voters::max('household_id') + 1;

        $allHouseholdIds = [];
        if ($updateHouseholds) {
            $allHouseholdIds = array_merge($newHouseHoldsIds, $voterHouseholdsIds);
        } else {
            $allHouseholdIds = $newHouseHolds;
        }

        $allHouseholdIds[] = $voterId;
        Voters::whereIn('id', $allHouseholdIds)->update(['household_id' => $maxHouseholdId]);

        $historyArgsArr = [
            'topicName' => 'elections.voter.additional_data.address.household.edit',
            'models' => [],
        ];

        if (!is_null($userCreateId)) {
            $historyArgsArr['user_create_id'] = $userCreateId;
        }

        if ( !is_null($entityId) ) {
            $historyArgsArr['entity_type'] = $entityType;
            $historyArgsArr['entity_id'] = $entityId;
        }

        $fieldsArray = [
            [
                'field_name' => 'household_id',
                'display_field_name' => config('history.Voters.household_id'),
                'new_numeric_value' => $maxHouseholdId,
            ],
        ];

        for ($index = 0; $index < count($allHouseholdIds); $index++) {
            $historyArgsArr['models'][] = [
                'description' => 'חישוב בית אב',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $allHouseholdIds[$index],
                'valuesList' => $fieldsArray,
            ];
        }
    }

    /**
     * This function updates all the household
     * member addresses according to the voter's
     * address
     *
     * @param $voter - Object of voter
     */
    private static function updateVoterHouseholdAddress($voter, $userCreateId = null, $entityId = null, $entityType = null) {
        $householdFields = [
            'city_id',
            'street',
            'street_id',
            'neighborhood',
            'house',
            'house_entry',
            'flat',
            'zip',
            'distribution_code',
            'actual_address_correct',
            'actual_address_update_date',
        ];
        $voterHouseHolds = Voters::select($householdFields)
            ->addSelect('id')
            ->where('household_id', $voter->household_id)
            ->where('voters.id', '<>', $voter->id)
            ->get();
        
        if (count($voterHouseHolds) == 0) {
            return $voterHouseHolds;
        }

        $householdIds = [];
        for ($index = 0; $index < count($voterHouseHolds); $index++) {
            $householdIds[] = $voterHouseHolds[$index]->id;
        }

        $updateFieldsValues = [];
        $historyFieldsNames = [];
        foreach ($householdFields as $fieldName) {
            $voterNewValue = $voter->{$fieldName};

            $updateFieldsValues[$fieldName] = $voterNewValue;

            $historyFieldsNames[$fieldName] = config('history.Voters.' . $fieldName);
        }

        //Going throw all the households members:
        foreach($voterHouseHolds as $householdMember){
            $fieldsArray = [];

            //Going throw all the address fields
            foreach($householdFields as $fieldName){

                $oldValue = $householdMember->{$fieldName};
                $newValue = $voter->{$fieldName};

                if ($oldValue != $newValue) { 
                    //Update household memeber field and Add him to changed array.
                    $householdMember->{$fieldName} = $newValue;

                    $historyInsertFields = [
                        'field_name' => $fieldName,
                        'display_field_name' => $historyFieldsNames[$fieldName],
                    ];

                    switch ($fieldName) {
                        case 'city_id':
                        case 'street_id':
                        case 'actual_address_correct':
                            $historyInsertFields['old_numeric_value'] = $oldValue;
                            $historyInsertFields['new_numeric_value'] = $newValue;
                            break;

                        default:
                            $historyInsertFields['old_value'] = $oldValue;
                            $historyInsertFields['new_value'] = $newValue;
                            break;
                    }

                    $fieldsArray[] = $historyInsertFields;
                }
            }
            $householdMember->save();

            if (count($fieldsArray) > 0) {
                $historyArgsArr = [
                    'topicName' => 'elections.voter.additional_data.address.household.edit',
                    'models' => [
                        [
                            'referenced_model' => 'Voters',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $householdMember->id,
                            'valuesList' => $fieldsArray,
                        ],
                    ],
                ];

                if (!is_null($userCreateId)) {
                    $historyArgsArr['user_create_id'] = $userCreateId;
                }

                if ( !is_null($entityId) ) {
                    $historyArgsArr['entity_type'] = $entityType;
                    $historyArgsArr['entity_id'] = $entityId;
                }

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }


        return $householdIds;
    }

    public static function updateVoterAddress($addressObj, $voterId, $updateHouseholds, $updateData = null){

        $userCreateId = isset($updateData['userCreateId']) ? $updateData ['userCreateId'] : null;
        $entityId = isset($updateData['entityId']) ? $updateData ['entityId'] : null;
        $entityType = isset($updateData['entityType']) ?$updateData ['entityType'] : null;
        $returnOnly = isset($updateData['returnOnly']) ?$updateData ['returnOnly'] : false;
        $updateIfNotChange = isset($updateData['updateIfNotChange']) ?$updateData ['updateIfNotChange'] : false;

        
        $addressFields = [
            'city_id',
            'street',
            'street_id',
            'neighborhood',
            'house',
            'house_entry',
            'flat',
            'zip',
        ];
        if (isset($addressObj->distribution_code)) {
            $addressFields[] = 'distribution_code';
        }
        if (isset($addressObj->actual_address_correct)) {
            $addressFields[] = 'actual_address_correct';
        }
        $voter = Voters::select(array_merge(['id', 'last_name', 'household_id'], $addressFields))
            ->where('id', $voterId)->first();

        $oldVoterDetails = [];

        // Array of display field names
        $historyFieldsNames = [];

        foreach ($addressFields as $fieldName) {

            $fieldValue = $addressObj->{$fieldName};

            if($voter->{$fieldName} != $fieldValue){
                $oldVoterDetails[$fieldName] = $voter->{$fieldName};
                $voter->{$fieldName} = $fieldValue;
                $historyFieldsNames[$fieldName] = config('history.Voters.' . $fieldName);
            }
        }
        // Update voter address:
        if($updateIfNotChange || $updateHouseholds || count($historyFieldsNames) > 0){
            $voter->actual_address_update_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
            $voter->save();
        }


        if (isset($addressObj->distribution_code)) {
            $historyFieldsNames['distribution_code'] = config('history.Voters.distribution_code');
        }
        if (isset($addressObj->actual_address_correct)) {
            $historyFieldsNames['actual_address_correct'] = config('history.Voters.actual_address_correct');
        }

        $addressHasChanged = false; // A boolean indication that address has changed

        $fieldsArray = [];
        foreach ($addressFields as $fieldName) {
            if (!isset($addressObj->{$fieldName}) || !isset($oldVoterDetails[$fieldName])) {
                continue;
            }
                $historyInsertFields = [
                    'field_name' => $fieldName,
                    'display_field_name' => $historyFieldsNames[$fieldName],
                ];

                switch ($fieldName) {
                    case 'city_id':
                    case 'street_id':
                    case 'actual_address_correct':
                        $historyInsertFields['old_numeric_value'] = $oldVoterDetails[$fieldName];
                        $historyInsertFields['new_numeric_value'] = $voter->{$fieldName};
                        break;

                    default:
                        $historyInsertFields['old_value'] = $oldVoterDetails[$fieldName];
                        $historyInsertFields['new_value'] = $voter->{$fieldName};
                        break;
                }

                $fieldsArray[] = $historyInsertFields;

                switch ($fieldName) {
                    case 'city_id':
                    case 'street':
                    case 'street_id':
                    case 'neighborhood':
                    case 'house':
                    case 'house_entry':
                    case 'flat':
                        $addressHasChanged = true;
                        break;
                }
        }
		if($returnOnly){
			if(count($fieldsArray) > 0){
				return ([
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voter->id,
                        'valuesList' => $fieldsArray,
                    ]);
			}
			else{
				return null;
			}
		}
        if (count($fieldsArray) > 0) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.address.edit',
                'models' => [
                    [
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voter->id,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            if (!is_null($userCreateId)) {
                $historyArgsArr['user_create_id'] = $userCreateId;
            }

            if ( !is_null($entityId) ) {
                $historyArgsArr['entity_type'] = $entityType;
                $historyArgsArr['entity_id'] = $entityId;
            }

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $voterHouseholds = [];
        if ($updateHouseholds) {
            $voterHouseholds = VoterController::updateVoterHouseholdAddress($voter, $userCreateId, $entityId, $entityType);
        }

        if ($addressHasChanged) {
            VoterController::calculateVoterHouseHold($voter->id, $voter->last_name, $addressObj, $updateHouseholds, $voterHouseholds,
                                                     $userCreateId, $entityId, $entityType);
        }
    }

    private function getHouseholdsFromDb($voterKey)
    {
        $householdFields = [
            'v2.id',
            'v2.key',
            'v2.first_name',
            'v2.last_name',
            'v2.personal_identity',
            'v2.father_name',
            'v2.birth_date',
            'v2.household_id',
            'vs0.id as voter_support_status_id0',
            'vs0.key as voter_support_status_key0',
            'vs0.support_status_id as support_status_id0',
            'vs1.id as voter_support_status_id1',
            'vs1.key as voter_support_status_key1',
            'vs1.support_status_id as support_status_id1',
        ];

        $lastcampaignId = VoterElectionsController::getLastCampaign();

        $voterHouseholds = Voters::withFilters()
                                ->select($householdFields)
                                ->withHousehold($lastcampaignId)
                                ->where('voters.key', $voterKey)
                                ->orderBy('v2.birth_date')
                                ->groupBy('v2.id')
                                ->get();

        return $voterHouseholds;
    }

    public function validateVoterAddressFields(Request $request, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $voterExist = Voters::where('voters.key', $voterKey)->first(['id']);
        if (null == $voterExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id', 'voters.household_id']);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $oldHouseholdId = $currentVoter->household_id;

        $cityId = $request->input('city_id', null);
        $streetId = $request->input('street_id', null);
        $flat = $request->input('flat', null);
        $zip = $request->input('zip', null);
        $distributionCode = $request->input('distribution_code', null);
        $actualAddressCorrect = $request->input('actual_address_correct', null);

        $addressObj = new Address();
        if (!$addressObj->validateCity($cityId)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_CITY'));
            return;
        }

        if (!is_null($streetId) && !$addressObj->validateStreet($streetId)) {
            $jsonOutput->setErrorCode(config('errors.elections.STREET_NAME_NOT_VALID'));
            return;
        }

        if (!is_null($flat) && !$addressObj->validateFlat($flat)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_FLAT'));
            return;
        }

        if (!is_null($zip) && !$addressObj->validateZip($zip)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ZIP'));
            return;
        }

        if (!is_null($distributionCode) && !$addressObj->validateDistributionCode($distributionCode)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_DISTRIBUTION_CODE'));
            return;
        }

        if (!is_null($actualAddressCorrect) && !in_array($actualAddressCorrect, [0, 1])) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ACTUAL_ADDRESS_CORRECT'));
        }

        $cityObj = City::select(['key', 'name'])->where(['id' => $cityId, 'deleted' => 0])->first();
        $streetObj = Streets::select(['name'])->where(['id' => $streetId, 'deleted' => 0])->first();
        if (null == $streetObj) {
            $streetName = null;
        } else {
            $streetName = $streetObj->name;
        }

        $addressObj->city_id = $cityId;
        $addressObj->city_key = $cityObj->key;
        $addressObj->city_name = $cityObj->name;
        $addressObj->street_id = $streetId;
        $addressObj->street_name = $streetName;
        $addressObj->street = null;
        $addressObj->neighborhood = $request->input('neighborhood', null);
        $addressObj->house = $request->input('house', null);
        $addressObj->house_entry = $request->input('house_entry', null);
        $addressObj->flat = $flat;
        $addressObj->zip = $zip;
        $addressObj->distribution_code = $distributionCode;
        $addressObj->actual_address_correct = $actualAddressCorrect;

        $updateHouseholds = $request->input('update_households', null);

        $this->updateVoterAddress($addressObj, $currentVoter->id, $updateHouseholds, ['updateIfNotChange' => true]);

        $voterObj = Voters::select(['voters.id', 'voters.household_id'])->where('voters.key', $voterKey)->first();
        $newHouseholdId = $voterObj->household_id;

        if ($newHouseholdId != $oldHouseholdId) {
            $households = $this->getHouseholdsFromDb($voterKey);
        } else {
            $households = [];
        }

        $addressDetails = [
            'address_details' => $addressObj,
            'households' => $households,
        ];

        $jsonOutput->setData($addressDetails);
    }

    private function validateCountry($countryId)
    {
        if (0 == $countryId) {
            $this->errorMessage = '';
            return true;
        }

        $rules = [
            'origin_country_id' => 'integer|exists:countries,id',
        ];

        $validator = Validator::make(['origin_country_id' => $countryId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('origin_country_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateTitle($titleId)
    {
        if (0 == $titleId) {
            $this->errorMessage = '';
            return true;
        }

        $rules = [
            'voter_title_id' => 'integer|exists:voter_titles,id',
        ];

        $validator = Validator::make(['voter_title_id' => $titleId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('voter_title_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateEnding($endingId)
    {
        if (0 == $endingId) {
            $this->errorMessage = '';
            return true;
        }

        $rules = [
            'voter_ending_id' => 'integer|exists:voter_endings,id',
        ];

        $validator = Validator::make(['voter_ending_id' => $endingId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('voter_ending_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateEthnic($ethnicId)
    {
        if (0 == $ethnicId) {
            $this->errorMessage = '';
            return true;
        }

        $rules = [
            'ethnic_group_id' => 'integer|exists:ethnic_groups,id',
        ];

        $validator = Validator::make(['ethnic_group_id' => $ethnicId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('ethnic_group_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateReligiousGroup($religiousGroupId)
    {
        if (0 == $religiousGroupId) {
            $this->errorMessage = '';
            return true;
        }

        $rules = [
            'religious_group_id' => 'integer|exists:religious_groups,id',
        ];

        $validator = Validator::make(['religious_group_id' => $religiousGroupId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('religious_group_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateDate($birthDate, $format)
    {
        $rules = [
            'birth_date' => 'date_format:' . $format,
        ];

        $validator = Validator::make(['birth_date' => $birthDate], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('birth_date');

            return false;
        } else {
            return true;
        }
    }

    private function validateBirthDate($birthDate)
    {
        return $this->validateDate($birthDate, 'Y-m-d');
    }

    private function validateBirthDateType($birthDateType)
    {
        $birthDateTypes = [
            config('constants.BIRTH_DATE_TYPE_ONLY_YEAR'),
            config('constants.BIRTH_DATE_TYPE_YEAR_AND_MONTH'),
            config('constants.BIRTH_DATE_TYPE_FULL_DATE'),
        ];

        if (in_array($birthDateType, $birthDateTypes)) {
            return true;
        } else {
            return false;
        }
    }

    public function updateVoterDetails(Request $request, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)->first('id');
        if (null == $voterExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $origin_country_id = $request->input('origin_country_id', null);
        if (!is_null($origin_country_id) && !$this->validateCountry($origin_country_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.COUNTRY_NOT_VALID'));
            return;
        }

        $voter_title_id = $request->input('voter_title_id', null);
        if (!is_null($voter_title_id) && !$this->validateTitle($voter_title_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_TITLE_NOT_VALID'));
            return;
        }

        $voter_ending_id = $request->input('voter_ending_id', null);
        if (!is_null($voter_ending_id) && !$this->validateEnding($voter_ending_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ENDING_NOT_VALID'));
            return;
        }

        $ethnic_group_id = $request->input('ethnic_group_id', null);
        if (!is_null($ethnic_group_id) && !$this->validateEthnic($ethnic_group_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ETHNIC_GROUP_NOT_VALID'));
            return;
        }

        $religious_group_id = $request->input('religious_group_id', null);
        if (!is_null($religious_group_id) && !$this->validateReligiousGroup($religious_group_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_RELIGIOUS_GROUP_NOT_VALID'));
            return;
        }

        $birth_date = $request->input('birth_date', null);
        if (!is_null($birth_date) && !$this->validateBirthDate($birth_date)) {
            $jsonOutput->setErrorCode(config('errors.elections.BIRTHDATE_NOT_VALID'));
            return;
        }

        $birth_date_type = $request->input('birth_date_type', null);
        if (!is_null($birth_date_type) && !$this->validateBirthDateType($birth_date_type)) {
            return;
        }

        $allowedSephardiValues = [0, 1];
        $sephardi = $request->input('sephardi', null);
        if (!is_null($sephardi) && !in_array($sephardi, $allowedSephardiValues)) {
            $jsonOutput->setErrorCode(config('errors.elections.SEPHARDI_VALUE_NOT_VALID'));
            return;
        }

        $allowedGenderValues = [
            config('constants.VOTER_GENDER_FEMALE_NUMBER'),
            config('constants.VOTER_GENDER_MALE_NUMBER'),
        ];
        $gender = $request->input('gender', null);
        if (!is_null($gender) && !in_array($gender, $allowedGenderValues)) {
            $jsonOutput->setErrorCode(config('errors.elections.GENDER_VALUE_NOT_VALID'));
            return;
        }

        $oldVoterDetails = [];

        $voter = Voters::where('voters.key', $voterKey)->first();
        $voterId = $voter->id;

        $detailsFields = [
            'birth_date',
            'birth_date_type',
            'origin_country_id',
            'voter_title_id',
            'voter_ending_id',
            'ethnic_group_id',
            'religious_group_id',
            'sephardi',
            'gender',
			'deceased',
			'deceased_date'
        ];

        // Array of display field names
        $historyFieldsNames = [];

        for ($index = 0; $index < count($detailsFields); $index++) {
            $fieldName = $detailsFields[$index];
 
            $oldVoterDetails[$fieldName] = $voter->{$fieldName};
            $voter->{$fieldName} = $request->input($fieldName, null);

            $historyFieldsNames[$fieldName] = config('history.Voters.' . $fieldName);
        }

        $voter->save();

        $fieldsArray = [];
        for ($index = 0; $index < count($detailsFields); $index++) {
            $fieldName = $detailsFields[$index];

            if ($oldVoterDetails[$fieldName] != $voter->{$fieldName}) {
                $voterFieldsInsert = [
                    'field_name' => $fieldName,
                    'display_field_name' => $historyFieldsNames[$fieldName],
                ];

                if ('birth_date' == $fieldName || 'deceased_date' == $fieldName) {
                    $voterFieldsInsert['old_value'] = $oldVoterDetails[$fieldName];
                    $voterFieldsInsert['new_value'] = $voter->{$fieldName};
                } else {
                    $voterFieldsInsert['old_numeric_value'] = $oldVoterDetails[$fieldName];
                    $voterFieldsInsert['new_numeric_value'] = $voter->{$fieldName};
                }

                $fieldsArray[] = $voterFieldsInsert;
            }
        }

        if (count($fieldsArray) > 0) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.details.edit',
                'models' => [
                    [
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterId,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData($voterId);
    }

    private function phoneHistoryUpdate($currentPhoneItem, $newPhoneItem, $historyFieldsNames)
    {
        // Array of display field names
        $fieldsArray = [];
        foreach ($historyFieldsNames as $fieldName => $display_field_name) {
            if ($currentPhoneItem[$fieldName] != $newPhoneItem[$fieldName]) {
                $insertedFields = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                ];

                if ('phone_number' == $fieldName) {
                    $insertedFields['old_value'] = $currentPhoneItem[$fieldName];
                    $insertedFields['new_value'] = $newPhoneItem[$fieldName];
                } else {
                    $insertedFields['old_numeric_value'] = $currentPhoneItem[$fieldName];
                    $insertedFields['new_numeric_value'] = $newPhoneItem[$fieldName];
                }

                $fieldsArray[] = $insertedFields;
            }
        }

        if (count($fieldsArray) > 0) {
            $modelUpdate = [
                'referenced_model' => 'VoterPhone',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $currentPhoneItem['id'],
                'valuesList' => $fieldsArray,
            ];

            return $modelUpdate;
        } else {
            return [];
        }
    }

    public static function phoneHistoryAdd($phoneId, $newPhoneItem, $historyFieldsNames)
    {

        $fieldsArray = [];
        foreach ($historyFieldsNames as $fieldName => $display_field_name) {
            $insertedFields = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
            ];

            if ('phone_number' == $fieldName) {
                $insertedFields['new_value'] = $newPhoneItem[$fieldName];
            } else {
                $insertedFields['new_numeric_value'] = $newPhoneItem[$fieldName];
            }

            $fieldsArray[] = $insertedFields;
        }

        if (count($fieldsArray) > 0) {
            $modelAdd = [
                'referenced_model' => 'VoterPhone',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $phoneId,
                'valuesList' => $fieldsArray,
            ];

            return $modelAdd;
        } else {
            return [];
        }
    }

    private function voterContactHistory($currentVoter, $voterData, $mainPhoneId)
    {
        // Array of display field names
        $historyFieldsNames = [
            "email" => config('history.Voters.email'),
            "contact_via_email" => config('history.Voters.contact_via_email'),
        ];

        $fieldsArray = [];
        foreach ($historyFieldsNames as $fieldName => $display_field_name) {
            if ($voterData[$fieldName] != $currentVoter->{$fieldName}) {
                $historyInsertFields = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                ];

                if ("email" == $fieldName) {
                    $historyInsertFields['old_value'] = $currentVoter->{$fieldName};
                    $historyInsertFields['new_value'] = $voterData[$fieldName];
                } else {
                    $historyInsertFields['old_numeric_value'] = $currentVoter->{$fieldName};
                    $historyInsertFields['new_numeric_value'] = $voterData[$fieldName];
                }

                $fieldsArray[] = $historyInsertFields;
            }
        }

        if (count($fieldsArray) > 0) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.contact_details.email.edit',
                'models' => [
                    [
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $currentVoter->id,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $fieldsArray = [];
        if ($mainPhoneId != $currentVoter->main_voter_phone_id) {
            $fieldsArray[] = [
                'field_name' => 'main_voter_phone_id',
                'display_field_name' => config('history.Voters.main_voter_phone_id'),
                'old_numeric_value' => $currentVoter->main_voter_phone_id,
                'new_numeric_value' => $mainPhoneId,
            ];

            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.contact_details.phone.edit',
                'models' => [
                    [
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $currentVoter->id,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    private function validatePhoneType($phoneTypeId)
    {
        $rules = [
            'phone_type_id' => [
                'required',
                'integer',
                Rule::exists('phone_types','id')->where(function($query) {
                    $query->where('deleted', 0);
                }),
            ],
        ];

        $validator = Validator::make(['phone_type_id' => $phoneTypeId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('phone_type_id');

            return false;
        } else {
            return true;
        }
    }

    private function validateEmail($email)
    {
        $rules = [
            'email' => 'email|max:' . config('constants.EMAIL_MAX_LENGTH'),
        ];

        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('email');

            return false;
        } else {
            return true;
        }
    }

    /*
     *  This function checks if any of the phone numbers
     *  is owned by another voter.
     */

    private function checkVoterPhones($voterId, $newVoterPhones)
    {
        $phones = [];
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phones[] = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
        }

        $fields = [
            'voter_phones.key',
            'voter_phones.phone_number',
            'voters.first_name',
            'voters.last_name',
        ];
        $anotherVotersWithVoterPhones = VoterPhone::select($fields)->where('voter_phones.voter_id', '<>', $voterId)
            ->whereIn('voter_phones.phone_number', $phones)->withVoters()->get();

        for ($phoneIndex = 0; $phoneIndex < count($anotherVotersWithVoterPhones); $phoneIndex++) {
            $phoneNumber = $anotherVotersWithVoterPhones[$phoneIndex]->phone_number;
            $anotherVotersWithVoterPhones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($phoneNumber);
        }

        return $anotherVotersWithVoterPhones;
    }

    private function validatePhoneKey($phoneKey)
    {
        $rules = [
            'key' => 'exists:voter_phones,key',
        ];

        $validator = Validator::make(['key' => $phoneKey], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('key');

            return false;
        } else {
            return true;
        }
    }

    private function deletePhonesCommonToVoter($phonesToDelete)
    {
        $phoneIds = VoterPhone::select(['id'])->whereIn('key', $phonesToDelete)->get();

        VoterPhone::whereIn('key', $phonesToDelete)->delete();

        $historyArgsArr = [
            'topicName' => 'elections.voter.additional_data.contact_details.phone.delete',
            'models' => [],
        ];

        for ($phoneIndex = 0; $phoneIndex < count($phoneIds); $phoneIndex++) {
            $historyArgsArr['models'][] = [
                'description' => 'מחיקת טלפונים שמשותפים לתושב',
                'referenced_model' => 'VoterPhone',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $phoneIds[$phoneIndex]->id,
            ];
        }

        ActionController::AddHistoryItem($historyArgsArr);
    }

    public function updateVoterContact(Request $request, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $mainPhoneId = null;

        $currentVoter = Voters::where('voters.key', $voterKey)
            ->first(["voters.id", "email", "contact_via_email", "main_voter_phone_id"]);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)
            ->first(["voters.id", "email", "contact_via_email", "main_voter_phone_id"]);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $voterData = $request->input('voter_data', null);

        $currentPhonesHash = $this->getVoterPhonesHash($voterKey);
        $newVoterPhones = $request->input('voter_phones', null);

        //  Phone validations
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];

            if (!is_null($phoneKey) && !isset($currentPhonesHash[$phoneKey])) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
                return;
            }

            $phoneToCheck = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
            if (!Helper::isIsraelLandPhone($phoneToCheck) &&
                !Helper::isIsraelMobilePhone($phoneToCheck)) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                return;
            }

            if (!in_array($newVoterPhones[$phoneIndex]['call_via_tm'], [0, 1])) {
                $jsonOutput->setErrorCode(config('errors.elections.TM_VALUE_IS_NOT_VALID'));
                return;
            }

            if (!in_array($newVoterPhones[$phoneIndex]['sms'], [0, 1])) {
                $jsonOutput->setErrorCode(config('errors.elections.SMS_VALUE_IS_NOT_VALID'));
                return;
            }

            if (!is_null($phoneKey) && !in_array($newVoterPhones[$phoneIndex]['wrong'], [0, 1])) {
                $jsonOutput->setErrorCode(config('errors.elections.WRONG_VALUE_IS_NOT_VALID'));
                return;
            }

            if (is_null($phoneKey) && !$this->validatePhoneType($newVoterPhones[$phoneIndex]['phone_type_id'])) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_TYPE_IS_NOT_VALID'));
                return;
            }
        }

        if (!is_null($voterData['email']) && !$this->validateEmail($voterData['email'])) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_EMAIL'));
            return;
        }

        if (!in_array($voterData['contact_via_email'], [0, 1])) {
            $jsonOutput->setErrorCode(config('errors.elections.CONTACT_VIA_EMAIL_VALUE_IS_NOT_VALID'));
            return;
        }

        // This variables indicates whether to save a phone number
        // owned by another voter
        $saveAnyWay = $request->input('save_any_way', null);
        if (false == $saveAnyWay) {
            // Checking if any phones  is owned by another voter
            $votersWithVoterPhones = $this->checkVoterPhones($currentVoter->id, $newVoterPhones);

            if (count($votersWithVoterPhones) > 0) {
                $jsonOutput->setErrorCode(config('errors.elections.UNUNIQUE_PHONES'));
                $jsonOutput->setErrorData($votersWithVoterPhones);
                return;
            }
        } else {
            $phonesToDelete = $request->input('phones_to_delete', null);
            for ($phoneIndex = 0; $phoneIndex < count($phonesToDelete); $phoneIndex++) {
                if (!$this->validatePhoneKey($phonesToDelete[$phoneIndex])) {
                    $jsonOutput->setErrorCode(config('errors.elections.INVALID_PHONES_TO_DELETE_VALUE'));
                    return;
                }
            }

            if (count($phonesToDelete) > 0) {
                $this->deletePhonesCommonToVoter($phonesToDelete);
            }
        }

        $phoneUpdateHistoryArgs = [
            'topicName' => 'elections.voter.additional_data.contact_details.phone.edit',
            'models' => [],
        ];

        $phoneAddHistoryArgs = [
            'topicName' => 'elections.voter.additional_data.contact_details.phone.add',
            'models' => [],
        ];
		$phoneUpdateHistoryElement = [];
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];

            if (isset($currentPhonesHash[$phoneKey])) {
				$existingVoterPhone = VoterPhone::where('key',$phoneKey)
												->where( "phone_number" , str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']))
                                                ->where('phone_type_id', $newVoterPhones[$phoneIndex]['phone_type_id'])
												->where("call_via_tm" , $newVoterPhones[$phoneIndex]['call_via_tm'])
												->where( "sms", $newVoterPhones[$phoneIndex]['sms'])
                                                ->where( "wrong", $newVoterPhones[$phoneIndex]['wrong'])
												->first();
				if(!$existingVoterPhone){
					$updates = [
						"phone_number" => str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']),
                        "phone_type_id" => $newVoterPhones[$phoneIndex]['phone_type_id'],
						"call_via_tm" => $newVoterPhones[$phoneIndex]['call_via_tm'],
						"sms" => $newVoterPhones[$phoneIndex]['sms'],
                        "wrong" => $newVoterPhones[$phoneIndex]['wrong']
					];
					VoterPhone::where('key', $phoneKey)->update($updates);
                    $historyFieldsNames = [
                        "phone_number" => config('history.VoterPhone.phone_number'),
                        "phone_type_id" => config('history.VoterPhone.phone_type_id'),
                        "call_via_tm" => config('history.VoterPhone.call_via_tm'),
                        "sms" => config('history.VoterPhone.sms'),
                        "wrong" => config('history.VoterPhone.wrong')
                    ];
					// Do history of updating phone
					$phoneUpdateHistoryElement = $this->phoneHistoryUpdate($currentPhonesHash[$phoneKey],
                                                    $newVoterPhones[$phoneIndex],
                                                    $historyFieldsNames);

                    if (count($phoneUpdateHistoryElement) > 0) {
                        $phoneUpdateHistoryArgs['models'][] = $phoneUpdateHistoryElement;
                    }
				}

				unset($currentPhonesHash[$phoneKey]);

				if ($newVoterPhones[$phoneIndex]['main_phone']) {
					$mainPhoneId = $newVoterPhones[$phoneIndex]['id'];
				}
            } else {
                $voterPhone = new VoterPhone;
                $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
                $voterPhone->voter_id = $currentVoter->id;
                $voterPhone->phone_number = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
                $voterPhone->call_via_tm = $newVoterPhones[$phoneIndex]['call_via_tm'];
                $voterPhone->sms = $newVoterPhones[$phoneIndex]['sms'];
                $voterPhone->phone_type_id = $newVoterPhones[$phoneIndex]['phone_type_id'];
                $voterPhone->save();
                
                $historyFieldsNames = [
                    "phone_number" => config('history.VoterPhone.phone_number'),
                    "call_via_tm" => config('history.VoterPhone.call_via_tm'),
                    "sms" => config('history.VoterPhone.sms'),
                    "phone_type_id" => config('history.VoterPhone.phone_type_id'),
                ];
                // Do history of adding phone
                $phoneAddHistoryElement = $this->phoneHistoryAdd($voterPhone->id, $newVoterPhones[$phoneIndex], $historyFieldsNames);
                if (count($phoneAddHistoryElement) > 0) {
                    $phoneUpdateHistoryArgs['models'][] = $phoneAddHistoryElement;
                }

                if ($newVoterPhones[$phoneIndex]['main_phone']) {
                    $mainPhoneId = $voterPhone->id;
                }
            }
        }

        if (count($phoneUpdateHistoryArgs['models']) > 0) {
            ActionController::AddHistoryItem($phoneUpdateHistoryArgs);
        }

        if (count($phoneAddHistoryArgs['models']) > 0) {
            ActionController::AddHistoryItem($phoneAddHistoryArgs);
        }

        if (count($currentPhonesHash) > 0) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.contact_details.phone.delete',
                'models' => [],
            ];

            foreach ($currentPhonesHash as $phoneKey => $value) {
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterPhone',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $currentPhonesHash[$phoneKey]['id'],
                ];

                VoterPhone::where('key', $phoneKey)->delete();
            }

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $updates = [
            "email" => $voterData['email'],
            "contact_via_email" => $voterData['contact_via_email'],
            "main_voter_phone_id" => $mainPhoneId,
        ];
        Voters::where('voters.id', $currentVoter->id)->update($updates);

        // Voter Contact history
        $this->voterContactHistory($currentVoter, $voterData, $mainPhoneId);

        $jsonOutput->setData($updates);
    }

    //TODO:remove after finish arrange update activist
    public function updateVoterPhones($newVoterPhones, $currentVoter){
        $jsonOutput = app()->make("JsonOutput");
        
        $currentPhonesHash = $this->getVoterPhonesHash($currentVoter->key, false);

        //  Phone validations
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];

            if (!is_null($phoneKey) && !isset($currentPhonesHash[$phoneKey])) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
                return;
            }

            $phoneToCheck = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
            if (!Helper::isIsraelLandPhone($phoneToCheck) &&
                !Helper::isIsraelMobilePhone($phoneToCheck)) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                return;
            }
        }

        /**
         * Save phones to history
         */
        $phoneUpdateHistoryArgs = [
            'topicName' => 'elections.voter.additional_data.contact_details.phone.edit',
            'models' => [],
        ];

        $phoneAddHistoryArgs = [
            'topicName' => 'elections.voter.additional_data.contact_details.phone.add',
            'models' => [],
        ];
		$phoneUpdateHistoryElement = [];
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];

            if (isset($currentPhonesHash[$phoneKey])) {
				$existingVoterPhone = VoterPhone::where('key',$phoneKey)
												->where( "phone_number" , str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']))
												->first();
				if(!$existingVoterPhone){
					$updates = [
						"phone_number" => str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']),
					];
                    VoterPhone::where('key', $phoneKey)->update($updates);
                    
                    $historyFieldsNames = [ "phone_number" => config('history.VoterPhone.phone_number')];
					// Do history of updating phone
                    $phoneUpdateHistoryElement = $this->phoneHistoryUpdate($currentPhonesHash[$phoneKey], $newVoterPhones[$phoneIndex], $historyFieldsNames);
					}
					if (count($phoneUpdateHistoryElement) > 0) {
						$phoneUpdateHistoryArgs['models'][] = $phoneUpdateHistoryElement;
					}

					unset($currentPhonesHash[$phoneKey]);

					// if ($newVoterPhones[$phoneIndex]['main_phone']) {
					// 	$mainPhoneId = $newVoterPhones[$phoneIndex]['id'];
					// }
				
            } else {
                $voterPhone = new VoterPhone;
                $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
                $voterPhone->voter_id = $currentVoter->id;
                $voterPhone->phone_type_id = config('constants.PHONE_TYPE_MOBILE');
                $voterPhone->phone_number = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
                $voterPhone->save();

                        // Array of display field names
                $historyFieldsNames = [
                    "phone_number" => config('history.VoterPhone.phone_number'),
                ];
                // Do history of adding phone
                $phoneAddHistoryElement = $this->phoneHistoryAdd($voterPhone->id, $newVoterPhones[$phoneIndex], $historyFieldsNames);
                if (count($phoneAddHistoryElement) > 0) {
                    $phoneUpdateHistoryArgs['models'][] = $phoneAddHistoryElement;
                }

                // if ($newVoterPhones[$phoneIndex]['main_phone']) {
                //     $mainPhoneId = $voterPhone->id;
                // }
            }
        }

        if (count($phoneUpdateHistoryArgs['models']) > 0) {
            ActionController::AddHistoryItem($phoneUpdateHistoryArgs);
        }

        if (count($phoneAddHistoryArgs['models']) > 0) {
            ActionController::AddHistoryItem($phoneAddHistoryArgs);
        }

        if (count($currentPhonesHash) > 0) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.contact_details.phone.delete',
                'models' => [],
            ];

            foreach ($currentPhonesHash as $phoneKey => $value) {
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterPhone',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $currentPhonesHash[$phoneKey]['id'],
                ];

                VoterPhone::where('key', $phoneKey)->delete();
            }

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }
    public function updateVoterEmail(Request $request, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $mainPhoneId = null;

        $currentVoter = Voters::where('voters.key', $voterKey)
            ->first(["voters.id", "email"]);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)
            ->first(["voters.id", "email"]);
        if ($currentVoter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
        // dd($request->input('email'));
        $updates = [
            "email" => $request->input('email',null),
        ];
        //Need to save to history, and check if email is valid!
       $result= Voters::where('voters.id', $currentVoter->id)->update($updates);
        $jsonOutput->setData($result);
    }
    public function getVoterUser($voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $voterUserFields = ['users.id',
            'users.active',
            'users.key',
            'users.voter_id',
            'users.password_date',
            'user_roles.name as role_name',
            'teams.name as team_name'];

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)->first(['voters.id']);
        if (null == $voterExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));

            return;
        }

        $voter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
        if ($voter != null) {
            $voterUser = $voter->user()->withMainRole(true)->first($voterUserFields);
		 
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        if ($voterUser == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_SYSTEM_USER'));
            return;
        } else {
            $sectorialFilters = $voterUser->sectorialFilterNames();
            $voterUser->sectorial_filters = $sectorialFilters;

            $geographicFilters = $voterUser->geographicFilters();
            $voterUser->geographic_filters = $geographicFilters;
        }

        $jsonOutput->setData($voterUser);
    }

    public function getVoterHousehold(Request $request, $voterKey)
    {

        $jsonOutput = app()->make("JsonOutput");

        $voterHouseholds = $this->getHouseholdsFromDb($voterKey);

        $jsonOutput->setData($voterHouseholds);
    }

    public function getVoterSupportStatuses(Request $request, $voterKey)
    {

        $jsonOutput = app()->make("JsonOutput");

        $supportStatusesFields = [
            // Support Status Elections
            'vs0.id as voter_support_status_id0',
            'vs0.key as voter_support_status_key0',
            'vs0.support_status_id as support_status_id0',
            'vs0.updated_at as branch_updated_at',
            'vs0.create_user_id as branch_create_user_id',
            'voters0.first_name as voter_branch_first_name',
            'voters0.last_name as voter_branch_last_name',
            // Support Status TeleMarketing
            'vs1.id as voter_support_status_id1',
            'vs1.key as voter_support_status_key1',
            'vs1.support_status_id as support_status_id1',
            'vs1.updated_at as tm_updated_at',
            'vs1.create_user_id as tm_create_user_id',
            'voters1.first_name as voter_tm_first_name',
            'voters1.last_name as voter_tm_last_name',
            // Support Status Final
            'vs2.id as voter_support_status_id2',
            'vs2.key as voter_support_status_key2',
            'vs2.support_status_id as support_status_id2',
            'vs2.updated_at as final_updated_at',
            'vs2.create_user_id as final_create_user_id',
            'voters2.first_name as voter_final_first_name',
            'voters2.last_name as voter_final_last_name',
        ];
	
        $lastcampaignId = VoterElectionsController::getLastCampaign();

        $supportStatuses = Voters::withFilters()
            ->where('voters.key', $voterKey)
            ->withSupportStatuses($lastcampaignId)
            ->select($supportStatusesFields)
            ->first();
		 
		// if($supportStatuses && !$supportStatuses->branch_create_user_id){
		// 	   $deletedByUser = VoterSupportStatus::select('voter_support_status.update_user_id','voter_support_status.updated_at')
		// 																	->join('voters' , 'voters.id' , '=','voter_support_status.voter_id')
		// 																	->where('voter_support_status.deleted',1)
		// 																	->where('election_campaign_id' , $lastcampaignId)
		// 																	->orderBy('voter_support_status.updated_at','DESC')
		// 																	->first();
		// 	if(  $deletedByUser){
		// 		 $supportStatuses->branch_create_user_id = $deletedByUser->update_user_id;
		// 		 $supportStatuses->branch_updated_at = (new Carbon($deletedByUser->updated_at))->toDateTimeString();
		// 		 if($deletedByUser->update_user_id){
		// 			 $branchVoterObj = Voters::select('voters.first_name','voters.last_name')
		// 										->join('users','users.voter_id' , '=','voters.id')
		// 										->where('users.id',$deletedByUser->update_user_id)
		// 										->first();
		// 		    if($branchVoterObj){
		// 				$supportStatuses->voter_branch_first_name = $branchVoterObj->first_name;
		// 				$supportStatuses->voter_branch_last_name = $branchVoterObj->last_name;
		// 			}
		// 		 }
		// 	}
		//}
        $jsonOutput->setData($supportStatuses);
    }

    /**
     * @param Request $request
     * @param         $voterKey
     */
    public function getVoterInElectionCampaigns(Request $request, $voterKey)
    {

        $jsonOutput = app()->make("JsonOutput");

        $fields = ['voters_in_election_campaigns.election_campaign_id',
            'voters_in_election_campaigns.ballot_box_id',
            'voters_in_election_campaigns.voter_serial_number',
            'election_campaigns.name as election_campaign_name',
            'election_campaigns.type as election_campaign_type',
            'election_campaigns.end_date as election_campaign_end_date',
            'ballot_boxes.mi_id',
            'ballot_boxes.cluster_id',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),
            'ballot_boxes.special_markings',
            'ballot_boxes.reporting',
             DB::raw($this->fullClusterNameQuery),
            'clusters.city_id',
            'clusters.street as cluster_streeet',
            'cities.name as city_name',
            'votes.id as vote_id',
            'votes.vote_source_id',
            'votes.vote_date',
            'votes.key as vote_key',
            'vote_sources.name as vote_source_name',
            'voter_transportations.id as voter_transportation_id',
            'voter_transportations.key as voter_transportation_key',
            'voter_transportations.cripple as voter_transport_crippled',
            'voter_transportations.from_time as voter_transport_from_time',
            'voter_transportations.to_time as voter_transport_to_time',
        ];
        $campaigns = Voters::where('voters.key', $voterKey)
            ->withVoterInElectionCampaigns()
            ->withElectionCampaigns()
            ->withBallots()
            ->withVotes()
            ->withVoterTransportations()
            ->where('election_campaigns.type', '<', config('constants.ELECTION_CAMPAIGN_TYPE_ROUTINE'))
            ->orderBy(DB::raw('(case when election_campaigns.end_date is null then 1 else 0 end)'), 'DESC')
            ->orderBy('election_campaigns.end_date', 'DESC')->select($fields)
            ->get();
            // "voter_transport_date" is not a date , is time of the transportations
            // -> so no need to convert the time format   
        // if (isset($campaigns[0]) && $campaigns[0]->voter_transport_date != null) {
        //     $voteTranspaortDate = $campaigns[0]->voter_transport_date;
        //     $arrOfDateTime = explode(' ', $voteTranspaortDate);

        //     list($year, $month, $day) = explode('-', $arrOfDateTime[0]);
        //     list($hour, $minute, $second) = explode(':', $arrOfDateTime[1]);

        //     $dateTime = $day . "/" . $month . "/" . $year . " " . $hour . ":" . $minute;
        //     $campaigns[0]->voter_transport_date = $dateTime;
        // }

        $jsonOutput->setData($campaigns);
    }

    /**
     * @param $birthYear
     *
     * @return bool
     */
    private function isValidVoterBirthYear($birthYear)
    {

        $result = false;

        $tmpYear = 1 * $birthYear;

        if (1850 <= $tmpYear && $tmpYear <= (new \DateTime)->format('Y')) {
            $result = true;
        }

        return $result;
    }

    /**
     * @param $voterAge
     *
     * @return bool
     */
    private function isValidVoterAge($voterAge)
    {

        $result = false;

        $voterAge = 1 * $voterAge;

        if (1 <= $voterAge && $voterAge <= 180) {
            $result = true;
        }

        return $result;
    }

    /**
     * Load last viewed voters
     *
     */
    public function getLastViewed()
    {
        $jsonOutput = app()->make("JsonOutput");
        $user = Auth::user();
        $lastViewed = LastViewedVoter::select('voters.key', 'voters.first_name', 'voters.last_name')
            ->withVoter()->where('user_id', $user->id)->where('last_viewed_voters.deleted', 0)
            ->orderBy('last_viewed_voters.updated_at', 'DESC')->get();
        $jsonOutput->setData($lastViewed);
    }

    /**
     * Add voter to last viewed voters list
     *
     */
    public function updateLastViewed(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $isError = false;
        $voterKey = $request->input('voter_key');
        $user = Auth::user();
        if (($voterKey == null) || ($voterKey == '')) {
            $isError = true;
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
        }
        if (!$isError) {
            $lastViewedVoter = $user->LastViewedVoters()->select('last_viewed_voters.id')->withVoter()
                ->where('voters.key', $voterKey)->first();
            if ($lastViewedVoter != null) {
                $lastViewedVoter->where('id', $lastViewedVoter['id'])->update(['deleted' => 0]);
                $jsonOutput->setData('');
            } else {
                $voter = Voters::select('voters.id')->withFilters()->where('voters.key', $voterKey)->first();
                if ($voter == null) {
                    $isError = true;
                    $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                } else {
                    $key = Helper::getNewTableKey('last_viewed_voters', 5);
                    $user->lastViewedVoters()->create([
                        'key' => $key,
                        'voter_id' => $voter->id,
                    ]);
                    if (count($user->lastViewedVoters) > 15) {
                        $user->lastViewedVoters()->orderBy('updated_at', 'ASC')->limit(1)->delete();
                    }
                    $jsonOutput->setData('');
                }
            }
        }
    }

    public function deleteLastViewed(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $userId = Auth::user()->id;
        LastViewedVoter::where('user_id', $userId)->update(['deleted' => 1]);
        $jsonOutput->setData('');
    }

    public function searchVoterSourceVoters(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $firstName = $request->input('first_name', null);
        $lastName =  $request->input('last_name', null);
        $cityId = $request->input('city_id', null);
        $streetId = $request->input('street_id', null);

        $currentPage = $request->input('current_page', 1);
        $limit = $request->input('max_rows', 100);
        $skip = ( $currentPage -1 ) * $limit;

        $addressObj = new Address();
        if (!$addressObj->validateCity($cityId)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_CITY'));
            return;
        }

        if (!is_null($streetId) && !$addressObj->validateStreet($streetId)) {
            $jsonOutput->setErrorCode(config('errors.elections.STREET_NAME_NOT_VALID'));
            return;
        }

        $fields  = [
            'voters.id',
            'voters.key',
            'voters.personal_identity',
            'voters.first_name',
            'voters.last_name',
            'voters.house',

            'voters.city_id',
            'c.name as city_name',

            'voters.street_id',
            'streets.name as street_name',
            'voters.street'
        ];

        $where = [];

        $where['voters.city_id'] = $cityId;

        if ( !is_null($streetId) ) {
            $where['voters.street_id'] = $streetId;
        }

        if ( !is_null($firstName) ) {
            $where['voters.first_name'] = $firstName;
        }

        if ( !is_null($lastName) ) {
            $where['voters.last_name'] = $lastName;
        }

        $voterObj = Voters::select($fields)
			->whereHas('votersInElectionCampaigns')
            ->withCity()
            ->withStreet(true)
            ->where($where);

        $totalVoters = $voterObj->count();

        $voters = $voterObj->skip($skip)
            ->take($limit)
            ->get();

        $result = [
            'totalVoters' => $totalVoters,
            'voters' => $voters
        ];

        $jsonOutput->setData($result);
    }
    public function getUserCallDetails(){
        $jsonOutput = app()->make("JsonOutput");
        $CtiController = new CtiController;
        $userExtensionObj = $CtiController->getDialerDetails();
        $jsonOutput->setData($userExtensionObj);
    }
    /* Infinite Scroll Example */

    public function testGetVoters(Request $request)
    {

        $page = $request->input('page');
        $limit = 20;
        $skip = (($page - 1) * $limit);
        $users = Voters::select('personal_identity', 'first_name', 'last_name')->withFilters()->where('first_name', 'LIKE', '%דרור%')->skip($skip)->take($limit)->orderBy('voters.id', 'asc')->get();
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData($users);
    }

    public function testUsers()
    {
        $jsonOutput = app()->make("JsonOutput");

        $file = config('constants.DOCUMENTS_DIRECTORY') . "8t1qexmSSa";

        $finfo = finfo_open(FILEINFO_MIME_TYPE);

        $str = finfo_file($finfo, $file);

        finfo_close($finfo);

        $jsonOutput->setData($str);
    }
    public function prepareSupportersPhonesCsvFile(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);

        VotersService::prepareSupportersPhonesCsvFile();

    }

}
