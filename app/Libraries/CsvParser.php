<?php

namespace App\Libraries;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\CrmRequestController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\VoterElectionsController;
use App\Libraries\Address;
use App\Libraries\Helper;
use App\Models\CrmRequestStatus;
use App\Models\CsvFileFields;
use App\Models\CsvFileRows;
use App\Models\CsvFiles;
use App\Models\InstituteRolesByVoters;
use App\Models\VoterTransportation;
use App\Models\PhoneTypes;
use App\Models\SupportStatus;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\VotersInGroups;
use App\Models\VotersInElectionCampaigns;

use App\Models\Ethnic;
use App\Models\ReligiousGroup;
use App\Models\ElectionCampaigns;
use App\Models\Votes;
use App\Models\VoteSources;
use App\Models\VoterSupportStatus;

use Illuminate\Support\Facades\Redis;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

use Psr\Log\Test\LoggerInterfaceTest;
use Psy\Test\Exception\RuntimeExceptionTest;

class CsvParser{
    private $electionCampaignId;

    private $addressObj;

    private $csvFields = [
        " " => "תעודת זהות",
        "key" => "קוד תושב",
        "sephardi" => "ספרדי",

        /** Address **/
        "city" => "עיר",
        "neighborhood" => "שכונה",
        "street" => "רחוב",
        "house" => "מספר בית",
        "house_entry" => "כניסה",
        "flat" => "דירה",
        "zip" => "מיקוד",

        /** Contact */
        "phone_number" => "טלפון",
        "line_phone" => "טלפון נייח",
        "mobile_phone" => "טלפון נייד",
        "email" => "דואר אלקטרוני",

        "support_status" => "מזהה סטטוס סניף",

        'request_topic' => "נושא",
        'request_sub_topic' => "תת נושא",
        'request_date' => 'תאריך',
        'request_description' => 'תיאור',

        "voted" => "הצביע",
    ];

    private $totalRowsChanged = 0;
    private $totalChangedPhones = 0;
    private $totalNonChangedPhones = 0;

    private $detailsFields = [];
    private $addressFields = [];
    private $contactFields = [];
    private $supportFields = [];
    private $requestFields = [];
    private $transportFields = [];
    private $votesFields = [];

    private $phoneTypes = [];

    private $permission = 'elections.import.execute';

    private function validateVoterIdentityAndKey($fieldValue , $fieldName)
    {
        $pattern =  ($fieldName == 'personal_identity') ? '/^[0-9]{2,10}$/' : '/^[0-9]{10}$/';
        return preg_match($pattern, $fieldValue);
    }

    public function test()
    {
        exec("ps -ef | awk '{print $2} 2>&1'", $pids);

        return json_encode($pids);
    }

    private function processIdRunning($processId)
    {
        exec("ps -ef | awk '{print $2}'", $pids);

        if (in_array($processId, $pids)) {
            return true;
        } else {
            return false;
        }
    }

    private function validateEmail($email)
    {
        $rules = [
            'email' => 'email',
        ];

        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

    private function validateUserPermissions($user_create_id, $personalIdentity, $fieldName = 'personal_identity') {
        $currentVoter = Voters::select(['voters.id'])
        ->withFilters($user_create_id)
        ->where("voters.$fieldName", $personalIdentity)->first();
        return ($currentVoter != null);
    }

    private function validateTime($fieldName, $fieldValue) {
        $formats = [
            'G:i:s',
            'H:i:s'
        ];

        for ( $formatIndex = 0; $formatIndex < count($formats); $formatIndex++ ) {
            $format = $formats[$formatIndex];

            $rules = [
                $fieldName => 'date_format:' . $format
            ];

            $validator = Validator::make([$fieldName => $fieldValue], $rules);
            if (!$validator->fails()) {
                return true;
            }
        }

        return false;
    }

    private function validateDate($fieldName, $fieldValue) {
        $formats = [
            'j-n-Y',
            'd-n-Y',
            'j-m-Y',
            'd-m-Y'
        ];

        for ( $formatIndex = 0; $formatIndex < count($formats); $formatIndex++ ) {
            $format = $formats[$formatIndex];

            $rules = [
                $fieldName => 'date_format:' . $format
            ];

            $validator = Validator::make([$fieldName => $fieldValue], $rules);
            if (!$validator->fails()) {
                return true;
            }
        }

        return false;
    }
    private function validateVoter($fieldValue, $fieldName)
    {
        $currentVoter = Voters::select(['id'])->where($fieldName, $fieldValue)->first();
        return ($currentVoter != null);
    }
    

    /**
     * This function validates the fields
     * in a row.
     *
     * @param $csvId
     * @param $rowNumber
     * @param $row
     * @param $arrFields
     * @return bool
     */
    private function validateFields($csvId, $rowNumber, $row, $arrFields,$user_create_id)
    {
        $inserts = [
            'key' => Helper::getNewTableKey("csv_file_rows", 10),
            'csv_file_id' => $csvId,
            'row_number' => $rowNumber,
            'status' => config('constants.CSV_PARSER_ROW_STATUS_FAILED'),
        ];
        foreach ($arrFields as $column => $fieldName) {
			if(!array_key_exists($column,$row)){continue;}
            $fieldValue = trim($row[$column]);

            switch ( $fieldName ) {
                case 'personal_identity':
                    $personalIdentity = ltrim($fieldValue, 0);
                    if (!$this->validateVoterIdentityAndKey($personalIdentity, 'personal_identity')) {
                        $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_IDENTITY');
                        
                        CsvFileRows::insert($inserts);
                        return false;
                    } else {
                        $this->detailsFields['personal_identity'] = $personalIdentity;
                        if (!$this->validateVoter($personalIdentity, 'personal_identity')) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_UNKNOWN_VOTER');

                            CsvFileRows::insert($inserts);
                            return false;
                        }
                        if (!$this->validateUserPermissions($user_create_id, $personalIdentity, 'personal_identity')) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_USER_MISSING_PERMISSIONS');
                            CsvFileRows::insert($inserts);
                            return false;
                        }
                    }
                    break;
                case 'key':
                    $voterKey = $fieldValue;
                    if (!$this->validateVoterIdentityAndKey($voterKey ,'key')) {
                        $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_KEY');
                        
                        CsvFileRows::insert($inserts);
                        return false;
                    } else {
                        $this->detailsFields['key'] = $voterKey;
                        if (!$this->validateVoter($voterKey, 'key')) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_UNKNOWN_VOTER');

                            CsvFileRows::insert($inserts);
                            return false;
                        }
                        if (!$this->validateUserPermissions($user_create_id, $voterKey, 'key')) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_USER_MISSING_PERMISSIONS');
                            CsvFileRows::insert($inserts);
                            return false;
                        }
                    }
                    break;

                case 'city':
                    if (strlen($fieldValue) > 0) {
                        $cityId = $this->addressObj->getCityId($fieldValue);
                        if (0 == $cityId) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_CITY');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->addressFields['city_id'] = $cityId;
                        }
                    }
                    break;

                case 'flat':
                    if (strlen($fieldValue) > 0) {
                        if (!$this->addressObj->validateFlat($fieldValue)) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_ZIP');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->addressFields['flat'] = $fieldValue;
                        }
                    }
                    break;

                case 'zip':
                    if (strlen($fieldValue) > 0) {
                        if (!$this->addressObj->validateZip($fieldValue)) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_ZIP');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->addressFields['zip'] = $fieldValue;
                        }
                    }
                    break;

                case 'street':
                case 'house':
                case 'house_entry':
                    $this->addressFields[$fieldName] = $fieldValue;
                    break;

                case 'birth_date':
                case 'deceased_date':
                    $newDateValue = str_replace(["'", "/"], '-', $fieldValue);
                    $dateElementsArr = explode('-', $newDateValue);

                    switch (count($dateElementsArr)) {
                        case 1:
                            $newDateValue = '01-01-' . $newDateValue;
                            break;

                        case 2:
                            $newDateValue = '01-' . $newDateValue;
                            break;

                        case 3:
                            break;

                        default:
                            $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_DATE' );

                            CsvFileRows::insert($inserts);
                            return false;
                            break;
                    }

                    if ( !$this->validateDate($fieldName, $newDateValue) ) {
                        $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_DATE' );

                        CsvFileRows::insert($inserts);
                        return false;
                    } else {
                        $this->detailsFields[$fieldName] = date( "Y-m-d", strtotime( $newDateValue ) );
                    }
                    break;

                case 'ethnic_group_id': // table
                    if ( strlen($fieldValue) > 0 ) {
                        $ethnic = Ethnic::select('id')
                            ->where(['name' => $fieldValue, 'deleted' => 0])
                            ->first();

                        if ( null == $ethnic ) {
                            $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_ETHNIC' );

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->detailsFields['ethnic_group_id'] = $ethnic->id;
                        }
                    }
                    break;

                case 'religious_group_id': // table
                    if ( strlen($fieldValue) > 0 ) {
                        $religiousGroup = ReligiousGroup::select('id')
                            ->where(['name' => $fieldValue, 'deleted' => 0])
                            ->first();

                        if ( null == $religiousGroup ) {
                            $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_RELIGIOUS_GROUP' );

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->detailsFields['religious_group_id'] = $religiousGroup->id;
                        }
                    }
                    break;

                case 'gender': // table
                    if ( strlen($fieldValue) > 0 ) {
                        if ( $fieldValue == config( 'constants.VOTER_GENDER_MALE_STRING ' ) || $fieldValue == 'ז' ) {
                            $this->detailsFields['gender'] = config( 'constants.VOTER_GENDER_MALE_NUMBER ' );
                        } else if ( $fieldValue == config( 'constants.VOTER_GENDER_FEMALE_STRING ' ) || $fieldValue == 'נ' ) {
                            $this->detailsFields['gender'] = config( 'constants.VOTER_GENDER_FEMALE_NUMBER ' );
                        }
                    }
                    break;

                case 'first_name':
                case 'last_name':
                    $this->detailsFields[$fieldName] = $fieldValue;
                    break;

                case 'sephardi':
                case 'strictly_orthodox':
                case 'deceased':
                    if ( strlen($fieldValue) > 0 ) {
                        switch ($fieldValue) {
                            case 'כן':
                            case 'כ':
                                $this->detailsFields[$fieldName] = 1;
                                break;

                            case 'לא':
                            case 'ל':
                                $this->detailsFields[$fieldName] = 0;
                                break;

                            default:
                                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_' . strtoupper($fieldName) );

                                CsvFileRows::insert($inserts);
                            return false;
                                break;
                        }
                    }
                    break;
				case 'transportation_type':
				case 'transportation_from_time':
				case 'transportation_to_time':
					$this->transportFields[$fieldName] = $fieldValue;
					break;
                case 'voted':
                    if ( strlen($fieldValue) > 0 ) {
                        switch ($fieldValue) {
                            case 'כן':
                            case 'כ':
                            case '1':
                                $this->votesFields[$fieldName] = 1;
                                break;

                            case 'לא':
                            case 'ל':
                            case '0':
                                $this->votesFields[$fieldName] = 0;
                                break;

                            default:
                                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_VOTE_TIME' . strtoupper($fieldName) );

                                CsvFileRows::insert($inserts);
                            return false;
                                break;
                        }
                    }
                    break;

                case 'vote_time':
                    if ( strlen($fieldValue) > 0 ) {
                        $newTimeValue = '';
                        $timeElementsArr = explode(':', $fieldValue);

                        switch (count($timeElementsArr)) {
                            case 1:
                                $newTimeValue = $fieldValue . ':00:00';
                                break;

                            case 2:
                                $newTimeValue = $fieldValue . ':00';
                                break;

                            case 3:
                                $newTimeValue = $fieldValue;
                                break;

                            default:
                                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_VOTE_TIME' );

                                CsvFileRows::insert($inserts);
                                return false;
                                break;
                        }

                        if ( !$this->validateTime($fieldName, $newTimeValue) ) {
                            $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_VOTE_TIME' );

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->votesFields[$fieldName] = date( "H:i:s", strtotime( $newTimeValue ) );
                        }
                    }
                    break;

                case 'email':
                    if (strlen($fieldValue) > 0) {
                        if (!$this->validateEmail($fieldValue)) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_EMAIL');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->contactFields['email'] = $fieldValue;
                            $this->contactFields['contact_via_email'] = 1;
                        }
                    }
                    break;

                case 'phone_number':
                    $validPhone = false;
                    $phoneType = '';

                    if (strlen($fieldValue) > 0) {
                        if (Helper::isIsraelLandPhone($fieldValue)) {
                            $validPhone = true;
                            $phoneType = 'home';
                        } else if (Helper::isIsraelMobilePhone($fieldValue)) {
                            $validPhone = true;
                            $phoneType = 'mobile';
                        }

                        $fieldValue = ($fieldValue[0] != "0") ? ("0" . $fieldValue) : $fieldValue; //add 0 if missing

                        if (!$validPhone) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_PHONE');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->contactFields['phones'][] = [
                                'phone_type_id' => $this->phoneTypes[$phoneType],
                                'phone_number' => str_replace("-", '', $fieldValue),
                            ];
                        }
                    }
                    break;

                case 'support_status':
                    if (strlen($fieldValue) > 0) {
                        $supportStatus = SupportStatus::select(['id', 'level'])
                                            ->where('election_campaign_id', $this->electionCampaignId)
                                            ->where('name', $fieldValue)
                                            ->where('deleted', 0)
                                            ->where('active', 1)
                                            ->first();
                        if (null == $supportStatus) {
                            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_SUPPORT');

                            CsvFileRows::insert($inserts);
                            return false;
                        } else {
                            $this->supportFields['support_status_id'] = $supportStatus->id;
                            $this->supportFields['level'] = $supportStatus->level;
                        }
                    }
                    break;

                case 'support_status_final':
                    if ( strlen($fieldValue) > 0 ) {
                        if ( trim($fieldValue) == 'ללא סטטוס' ) {
                            $this->supportFields['support_status_final_id'] = null;
                            $this->supportFields['support_status_final_level'] = 0;
                        } else {
                            $supportStatus = SupportStatus::select( ['id', 'level'] )
                                ->where([
                                    'election_campaign_id' => $this->electionCampaignId,
                                    'name' => $fieldValue,
                                    'deleted' => 0,
                                    'active' => 1])
                                ->first();
                            if ( is_null($supportStatus) ) {
                                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_SUPPORT' );

                                CsvFileRows::insert($inserts);
                                return false;
                            } else {
                                $this->supportFields['support_status_final_id'] = $supportStatus->id;
                                $this->supportFields['support_status_final_level'] = $supportStatus->level;
                            }
                        }
                    }
                    break;

                case 'neighborhood':
                    if ( strlen($fieldValue) > 0 ) {
                        $this->addressFields['neighborhood'] = $fieldValue;
                    }
                    break;

                /*case 'requet_topic':
                $topicObj = CrmRequestTopic::select(['id'])->where( ['name' => $fieldValue, 'deleted' =>0] )->first();

                if ( null == $topicObj ) {
                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_REQUEST_TOPIC' );

                CsvFileRows::insert($inserts);
                return false;
                } else {
                $this->requestFields['topic_id'] = $topicObj->id;
                }
                break;

                case 'requet_sub_topic':
                $subTopicObj = CrmRequestTopic::select(['id', 'parent_id'])->where( ['name' => $fieldValue, 'deleted' =>0] )
                ->first();

                if ( null == $subTopicObj ) {
                $inserts['error_type'] = config( 'constants.CSV_PARSER_ERROR_INVALID_REQUEST_SUB_TOPIC' );

                CsvFileRows::insert($inserts);
                return false;
                } else {
                $this->requestFields['sub_topic_id'] = $subTopicObj->id;
                }
                break;*/

                case 'requet_topic':
                    $this->requestFields['topic_id'] = $fieldValue;
                    break;

                case 'requet_sub_topic':
                    $this->requestFields['sub_topic_id'] = $fieldValue;
                    break;

                case 'request_date':
                    list($day, $month, $year) = explode('/', $fieldValue);
                    $this->requestFields['date'] = $year . "-" . $month . "-" . $day . " 00:00:00";
                    break;

                case 'request_description':
                    $this->requestFields['description'] = $fieldValue;
                    break;

                case 'handler_id':
                    $this->requestFields['user_handler_id'] = $fieldValue;
                    break;

                case 'team_id':
                    $this->requestFields['team_handler_id'] = $fieldValue;
                    break;
            }
        }

        if (!isset($this->detailsFields['personal_identity']) && !isset($this->detailsFields['key'])) {
            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_IDENTITY');

            CsvFileRows::insert($inserts);
            return false;
        }

        if (count($this->addressFields) > 0 && !isset($this->addressFields['city_id'])) {
            $inserts['error_type'] = config('constants.CSV_PARSER_ERROR_INVALID_CITY');

            CsvFileRows::insert($inserts);
            return false;
        }

        return true;
    }

    /**
     * This function updates the voter details
     * such as email.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $rowFile
     */
    private function saveVoterDetails($userCreateId, $csvFileId, $rowFile)
    {
        $fields = [
        'id', 'household_id', 'email','sephardi',
        'gender','strictly_orthodox','ethnic_group_id','religious_group_id',
        'deceased','deceased_date','birth_date']; 

        $currentVoter = Voters::select($fields);
        if( isset($this->detailsFields['personal_identity'])){
            $currentVoter->where('personal_identity', $this->detailsFields['personal_identity']);
        }
        if( isset($this->detailsFields['key'])){
            $currentVoter->where('key', $this->detailsFields['key']);
        }
        $currentVoter = $currentVoter->first();
        
        if (null != $currentVoter) {
            // print_r($currentVoter->toArray()); echo "----------------------------------------------";
            $needToUpdateVoterBallotCounts = false;

            $changedValues = [];
            $updates = [];
            if (isset($this->contactFields['email'])) {
                if ($currentVoter['email'] != $this->contactFields['email']) {
                    $updates['email'] = $this->contactFields['email'];
                    $updates['contact_via_email'] = 1;
                    $this->totalRowsChanged++;

                    $changedValues[] = [
                        'field_name' => 'email',
                        'display_field_name' => config('history.Voters.email'),
                        'old_value' => $currentVoter['email'],
                        'new_value' => $updates['email'],
                    ];
                }
            }

            /* Fields for update that are also in the UI */
            $uiFields = [
                'gender',
                'strictly_orthodox',
                'ethnic_group_id',
                'religious_group_id'
            ];

            $uiFields4Update = [];

            for ( $fieldIndex = 0; $fieldIndex < count($uiFields); $fieldIndex++ ) {
                $fieldName = $uiFields[$fieldIndex];
                // First take the value from csv row filw
                if ( isset($this->detailsFields[$fieldName]) ) {
                    $uiFields4Update[$fieldName] = $this->detailsFields[$fieldName];
                } else if ( !is_null($rowFile->{$fieldName}) ) { // If field not in row then take from UI
                    $uiFields4Update[$fieldName] = $rowFile->{$fieldName};
                }
            }

            foreach ( $uiFields4Update as $fieldName => $fieldValue ) {
                if($currentVoter[$fieldName] !== $uiFields4Update[$fieldName]) {
                    if($fieldName == 'strictly_orthodox'){ $needToUpdateVoterBallotCounts = true;}
                    $updates[$fieldName] = $uiFields4Update[$fieldName];
                    $this->totalRowsChanged ++;

                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.Voters.' . $fieldName),
                        'old_numeric_value' => $currentVoter[$fieldName],
                        'new_numeric_value' => $uiFields4Update[$fieldName]
                    ];
                }
            }

            $voterFields = [
                'sephardi',
                'deceased',
                'deceased_date',
                'birth_date'
            ];

            for ( $fieldIndex = 0; $fieldIndex < count($voterFields); $fieldIndex++ ) {
                $fieldName = $voterFields[$fieldIndex];
                if ( isset($this->detailsFields[$fieldName]) ) {
                    if($currentVoter[$fieldName] !== $this->detailsFields[$fieldName]) {
                        if($fieldName == 'sephardi'){ $needToUpdateVoterBallotCounts = true;}
                        $updates[$fieldName] = $this->detailsFields[$fieldName];
                        $this->totalRowsChanged ++;

                        if ( 'deceased_date' == $fieldName || 'birth_date' == $fieldName ) {
                            $changedValues[] = [
                                'field_name' => $fieldName,
                                'display_field_name' => config('history.Voters.' . $fieldName),
                                'old_value' => $currentVoter[$fieldName],
                                'new_value' => $updates[$fieldName]
                            ];
                        } else {
                            $changedValues[] = [
                                'field_name' => $fieldName,
                                'display_field_name' => config('history.Voters.' . $fieldName),
                                'old_numeric_value' => $currentVoter[$fieldName],
                                'new_numeric_value' => $updates[$fieldName]
                            ];
                        }
                    }
                }
            }

            if (count($updates) > 0) {
                Voters::where('id', $currentVoter->id)->update($updates);
            }

            if (count($changedValues) > 0) {
                if($needToUpdateVoterBallotCounts){
                    \App\Http\Controllers\BallotBoxController::updateBallotDetailsCounters(null, $currentVoter->id);
                }
                $historyArgsArr = [
                    'topicName' => $this->permission,
                    'user_create_id' => $userCreateId,
                    'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                    'entity_id' => $csvFileId,
                    'models' => [
                        [
                            'description' => 'עדכון פרטי משתמש מהעלאת קובץ',
                            'referenced_model' => 'Voters',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $currentVoter->id,
                            'valuesList' => $changedValues,
                        ],
                    ],
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
            $this->detailsFields['id'] = $currentVoter->id;
            $this->detailsFields['household_id'] = $currentVoter->household_id;
        }
    }
	
	/*
		This is helpful function that gets time and returns true only if it's one of the followinf formats : 
			integer number - between 0 and 23
			hh:mm
			h:mm - will be translated into 0h:mm
			h:m - will be translated into 0h:0m
			hh:m - will be translated into hh:0m
			
	*/
	private function generateValideTimeFormat($timeString){
		$result = null;
		if(!$timeString || strlen($timeString) ==0 || strlen($timeString) > 5){return null;}
		if(is_numeric($timeString)){
			if((int)$timeString <0 || (int)$timeString >= 24){return null;}
			$result = "";
			if((int)$timeString < 10){
				$result="0";
			}
			$result .= $timeString.":00:00";
		}
		else{
			if(strpos($timeString , ":") === false){
				return null;
			}
			$timeParts = explode(":" , $timeString);
			if(sizeof($timeParts)!=2){return null;}
			$hours = $timeParts[0];
			$minutes = $timeParts[1];
			if(!is_numeric($hours) || !is_numeric($minutes)){return null;}
			$hours = (int)$hours;
			$minutes = (int)$minutes;
			if($hours <0 || $hours >= 24 || $minutes<0 || $minutes>=60){return null;}
			$result = "";
			if($hours<10){
				$result="0";
			}
			$result .= $hours.":";
			if($minutes<10){
				$result .= "0";
			}
			$result .= $minutes.":00";
		}
		return $result;
	}
	
	
	/*
		This function adds/edits transportation row for voter 
	*/
	private function saveVoterTransportation($userCreateId, $csvFileId, $deleteDuplicatePhones){
		$transportData = "";
		$transportType="";
		$transportFromHour="";
		$transportToHour="";
		if(array_key_exists("transportation_type" , $this->transportFields)){
			$transportData .= $this->transportFields['transportation_type']." , ";
			$transportType = $this->transportFields['transportation_type'];
			$transportType = trim($transportType);
		}
		if(array_key_exists("transportation_from_time" , $this->transportFields)){
			$transportData .= $this->transportFields['transportation_from_time']." , ";
			$transportFromHour = $this->transportFields['transportation_from_time'];
			$transportFromHour = trim($transportFromHour);
		}
		if(array_key_exists("transportation_to_time" , $this->transportFields)){
			$transportData .= $this->transportFields['transportation_to_time']." , ";
			$transportToHour = $this->transportFields['transportation_to_time'];
			$transportToHour = trim($transportToHour);
		}
		//Log::info("try to save transportation to voter_id : ".$this->detailsFields['id']." with data : ".$transportData);
		
		if($transportType == "כן" || $transportType == "נכה"){
			//Log::info("do transtportation action with this row");
			$lastElectionCampaign = VoterElectionsController::getLastCampaign();
			$voterTransportation = VoterTransportation::where('election_campaign_id',$lastElectionCampaign)->where('voter_id',$this->detailsFields['id'])->first();
			$updatesCount = 0 ;
			if($voterTransportation){ // voter transportation exists - only update available
				//Log::info("check if should update the transportation row");
				
				if($transportType == "נכה" && $voterTransportation->cripple != 1){
						//Log::info("update cripple status of voter to true");
						$voterTransportation->cripple = 1;
						$updatesCount ++;
				}
				if($updatesCount > 0){
					$voterTransportation->save();
				}
			}
			else{
				//Log::info("insert new voter transportation");
				$voterTransportation = new VoterTransportation;
				$voterTransportation->key = Helper::getNewTableKey("csv_file_rows", 5);
				$voterTransportation->election_campaign_id = $lastElectionCampaign;
				$voterTransportation->voter_id = $this->detailsFields['id'];
				if($transportType == "נכה"){
					//Log::info("new voter is cripple");
					$voterTransportation->cripple=1;
				}
				$voterTransportation->save();
			}
			$updatesCount = 0 ;
			$transportFromHour = $this->generateValideTimeFormat($transportFromHour);
			$transportToHour = $this->generateValideTimeFormat($transportToHour);
			if($transportFromHour){
				$updatesCount++;
				$voterTransportation->from_time = $transportFromHour;
			}
			if($transportToHour){
				$updatesCount++;
				$voterTransportation->to_time = $transportToHour;
			}
			
			if($updatesCount > 0){
				$voterTransportation->save();
			}
			
		}
		else{
			//Log::info("wrong transportation type - thus ignore this row");
		}
		
		//Log::info("--------------------------------");
		
		
	}
	

    /**
     * This function saves the voter phones
     * read from the csv file.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $deleteDuplicatePhones
     */
    private function saveVoterPhone($userCreateId, $csvFileId, $deleteDuplicatePhones)
    {
        if (count($this->contactFields['phones']) == 0) {
            return;
        }

        $phoneNumbers = [];
        for ($phoneIndex = 0; $phoneIndex < count($this->contactFields['phones']); $phoneIndex++) {
            $phoneNumbers[] = $this->contactFields['phones'][$phoneIndex]['phone_number'];
        }

        $historyModels = [];

        if (1 == $deleteDuplicatePhones) {
            //    Log::info("voter id : ".$this->detailsFields['id']." - delete duplicate phone fields from other users count : ".count( VoterPhone::whereIn('phone_number', $phoneNumbers)->where('voter_id' , '!=' ,$this->detailsFields['id'] )->get()));
            $deletedPhones = VoterPhone::whereIn('phone_number', $phoneNumbers)
                ->where('voter_id', '!=', $this->detailsFields['id'])
                ->get();

            for ($phoneIndex = 0; $phoneIndex < count($deletedPhones); $phoneIndex++) {
                $historyModels[] = [
                    'description' => 'מחיקת טלפונים משוכפלים מהעלאת קבצים',
                    'referenced_model' => 'VoterPhone',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $deletedPhones[$phoneIndex]->id,
                ];
            }

            VoterPhone::whereIn('phone_number', $phoneNumbers)->where('voter_id', '!=', $this->detailsFields['id'])->delete();
        }

        $existingVoterPhones = VoterPhone::select('phone_number')->where('voter_id', $this->detailsFields['id'])->whereIn('phone_number', $phoneNumbers)->get();
        $this->totalNonChangedPhones += count($existingVoterPhones);
        $arrExistingPhones = array();
        for ($i = 0; $i < count($existingVoterPhones); $i++) {
            array_push($arrExistingPhones, $existingVoterPhones[$i]->phone_number);
        }

        $inserts = [];
        $insertedPhoneNumbers = [];
        for ($phoneIndex = 0; $phoneIndex < count($this->contactFields['phones']); $phoneIndex++) {
            if (!in_array($this->contactFields['phones'][$phoneIndex]['phone_number'], $arrExistingPhones)) {
                $inserts[] = [
                    'key' => Helper::getNewTableKey('voter_phones', 10),
                    'voter_id' => $this->detailsFields['id'],
                    'phone_number' => $this->contactFields['phones'][$phoneIndex]['phone_number'],
                    'call_via_tm' => 1,
                    'sms' => 1,
                    'phone_type_id' => $this->contactFields['phones'][$phoneIndex]['phone_type_id'],
                ];
                $this->totalChangedPhones++;

                $insertedPhoneNumbers[] = $this->contactFields['phones'][$phoneIndex]['phone_number'];
            }
        }
        VoterPhone::insert($inserts);

        if (count($inserts) > 0) {
            $voterNewPhones = VoterPhone::select(['id', 'phone_type_id', 'phone_number'])
                ->where('voter_id', $this->detailsFields['id'])
                ->wherein('phone_number', $insertedPhoneNumbers)
                ->get();

            for ($phoneIndex = 0; $phoneIndex < count($voterNewPhones); $phoneIndex++) {
                $historyInsertFields = [
                    [
                        'field_name' => 'voter_id',
                        'display_field_name' => config('history.VoterPhone.voter_id'),
                        'new_numeric_value' => $this->detailsFields['id'],
                    ],
                    [
                        'field_name' => 'phone_number',
                        'display_field_name' => config('history.VoterPhone.phone_number'),
                        'new_value' => $voterNewPhones[$phoneIndex]->phone_number,
                    ],
                    [
                        'field_name' => 'call_via_tm',
                        'display_field_name' => config('history.VoterPhone.call_via_tm'),
                        'new_numeric_value' => 1,
                    ],
                    [
                        'field_name' => 'sms',
                        'display_field_name' => config('history.VoterPhone.sms'),
                        'new_numeric_value' => 1,
                    ],
                    [
                        'field_name' => 'phone_type_id',
                        'display_field_name' => config('history.VoterPhone.phone_type_id'),
                        'new_numeric_value' => $voterNewPhones[$phoneIndex]->phone_type_id,
                    ],
                ];

                $historyModels[] = [
                    'description' => 'הוספת טלפון חדש מקובץ',
                    'referenced_model' => 'VoterPhone',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterNewPhones[$phoneIndex]->id,
                    'valuesList' => $historyInsertFields,
                ];
            }
        }

        if (count($historyModels) > 0) {
            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => $historyModels,
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    /**
     * This function saves the voter address.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $updateHouseholdAddress
     */
    private function saveVoterAddress($userCreateId, $csvFileId, $updateHouseholdAddress) {
        //Log::info('city id: ' . $this->addressFields['city_id']);

        if (!isset($this->addressFields['city_id'])) {
            return 0;
        }

        $this->addressObj->street = null;
        $this->addressObj->neighborhood = null;
        $this->addressObj->house = null;
        $this->addressObj->house_entry = null;
        $this->addressObj->flat = null;
        $this->addressObj->zip = null;

        foreach ($this->addressFields as $fieldName => $fieldValue) {
            $this->addressObj->{$fieldName} = $fieldValue;
        }
        // Log::info('$this->addressObj', $this->addressObj);
        $updateVoterData = [
            'updateIfNotChange' => true,
            'userCreateId' => $userCreateId,
            'entityId' => $csvFileId,
            'entityType' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
        ];
        $updatesCount = VoterController::updateVoterAddress($this->addressObj, $this->detailsFields['id'], $updateHouseholdAddress, $updateVoterData);

        // Update address might change the voter's household_id,
        // therefor it's being recalculated
        $currentVoter = Voters::select(['household_id'])->where('id', $this->detailsFields['id'])->first();
        $this->detailsFields['household_id'] = $currentVoter->household_id;

        return count($updatesCount);
        // Log::info('Update address for ID: ' . $this->detailsFields['personal_identity'], $this->addressFields);
    }

    /**
     * This function allocates institute's role
     * for a voter.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $instituteId
     * @param $instituteRoleId
     */
    private function saveVoterInstitute($userCreateId, $csvFileId, $instituteId, $instituteRoleId)
    {
        $where = [
            'voter_id' => $this->detailsFields['id'],
            'institute_id' => $instituteId,
            'institute_role_id' => $instituteRoleId,
        ];
        $institutes = InstituteRolesByVoters::select(['id'])
            ->where($where)
            ->first();

        if (null == $institutes) {
            $newInstituteRolesByVoters = new InstituteRolesByVoters;

            $newInstituteRolesByVoters->voter_id = $this->detailsFields['id'];
            $newInstituteRolesByVoters->institute_id = $instituteId;
            $newInstituteRolesByVoters->institute_role_id = $instituteRoleId;
            $newInstituteRolesByVoters->save();

            $instituteFields = [
                'voter_id',
                'institute_id',
                'institute_role_id',
            ];

            $insertFields = [];
            for ($fieldIndex = 0; $fieldIndex < count($instituteFields); $fieldIndex++) {
                $fieldName = $instituteFields[$fieldIndex];

                $insertFields[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.InstituteRolesByVoters.' . $fieldName),
                    'new_numeric_value' => $newInstituteRolesByVoters->{$fieldName}, // new value of field
                ];
            }

            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => 'הוספת תפקיד לתושב במוסד מקובץ',
                        'referenced_model' => 'InstituteRolesByVoters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $newInstituteRolesByVoters->id,
                        'valuesList' => $insertFields,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);

            $this->totalRowsChanged++;
        }
    }

    /**
     * This function saves the voter support status.
     *
     * @param $supportStatusId
     */
    private function addVoterSupportStatus($userCreateId,
                                            $csvFileId,
                                            $supportStatusId,
                                            $entityType=null) {
        $newVoterSupportStatus = new VoterSupportStatus;
        $newVoterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
        $newVoterSupportStatus->election_campaign_id = $this->electionCampaignId;
        $newVoterSupportStatus->voter_id = $this->detailsFields['id'];
        $newVoterSupportStatus->entity_type = $entityType;
        $newVoterSupportStatus->support_status_id = $supportStatusId;
        $newVoterSupportStatus->create_user_id = $userCreateId;
        $newVoterSupportStatus->update_user_id = $userCreateId;
        $newVoterSupportStatus->save();

        $supportFields = [
            'election_campaign_id',
            'voter_id',
            'entity_type',
            'support_status_id'
        ];

        $fieldsArray = [];
        for ($fieldIndex = 0; $fieldIndex < count($supportFields); $fieldIndex++) {
            $fieldName = $supportFields[$fieldIndex];

            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                'new_numeric_value' => $newVoterSupportStatus->{$fieldName},
            ];
        }

        if ( $entityType == config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION' ) ) {
            $description = 'הוספת סטוס תמיכה סניף מקובץ';
        } else {
            $description = 'הוספת סטוס תמיכה סופי מקובץ';
        }

        $historyArgsArr = [
            'topicName' => $this->permission,
            'user_create_id' => $userCreateId,
            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
            'entity_id' => $csvFileId,
            'models' => [
                [
                    'description' => $description,
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newVoterSupportStatus->id,
                    'valuesList' => $fieldsArray,
                ],
            ],
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

    /**
     * This function updates the support status
     * according to the status update type, which
     * is updated from the UI and not the csv file.
     *
     * @param $currentVoterSupportStatus
     * @param $selectedSupportStatusId
     * @param $selectedSupportStatusLevel
     * @param $supportStatusUpdateType
     */
    private function editVoterSupportStatusByUpdateType($userCreateId, $csvFileId,$rowFile,$currentVoterSupportStatus) {
        $selectedSupportStatusId = $rowFile->support_status_id;
        $selectedSupportStatusLevel = $rowFile->support_status_level;
        $supportStatusUpdateType = $rowFile->support_status_update_type;

        if ($currentVoterSupportStatus->support_status_id == $selectedSupportStatusId) {
            return;
        }

        $newSupportStatusId = $currentVoterSupportStatus->support_status_id;

        switch ($supportStatusUpdateType) {
            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'):
                if ($currentVoterSupportStatus->support_status_level < $selectedSupportStatusLevel) {
                    $newSupportStatusId = $selectedSupportStatusId;
                }
                break;

            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'):
                if ($currentVoterSupportStatus->support_status_level > $selectedSupportStatusLevel) {
                    $newSupportStatusId = $selectedSupportStatusId;
                }
                break;

            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS'):
                $newSupportStatusId = $selectedSupportStatusId;
                break;
        }

        if ($newSupportStatusId != $currentVoterSupportStatus->support_status_id) {
            $oldVoterSupportStatusId = $currentVoterSupportStatus->support_status_id;
            VoterSupportStatus::where('id', $currentVoterSupportStatus->id)
                ->update([
                    'support_status_id' => $newSupportStatusId,
                    'update_user_id'    => $userCreateId
                    ]);

            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => 'עדכון סטטוס תמיכה מקובץ',
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $currentVoterSupportStatus->id,
                        'valuesList' => [
                            [
                                'field_name' => 'support_status_id',
                                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                'old_numeric_value' => $oldVoterSupportStatusId,
                                'new_numeric_value' => $newSupportStatusId,
                            ],
                        ],
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    /**
     * This function updates/adds support status to voters by household
     *
     * @param $householdID - ID of household voter id
     * @param $statusID - The new support status
     */
    private function updateVoterHouseholdMembersSupportStatus($userCreateId,
                                                            $csvFileId,
                                                            $householdID,
                                                            $rowFile)
    {
        //init variables
        $updateSupportStatusIfExists = $rowFile->update_support_status_if_exists;
        $selectedSupportStatusId = $rowFile->support_status_id;
        $selectedSupportStatusLevel = $rowFile->support_status_level;
        $supportStatusUpdateType = $rowFile->support_status_update_type;

        //get voters from household
        $votersOfHousehold = Voters::select(['voters.id','vs0.support_status_id'])->withSupportStatus0($this->electionCampaignId)
            ->where('household_id', $householdID)
            ->where('voters.id', '!=', $this->detailsFields['id'])
            ->get();

        for ($i = 0; $i < count($votersOfHousehold); $i++) {
            $householdVoter = $votersOfHousehold[$i];

            $voterSupportStatusFields = [
                'voter_support_status.id',
                'voter_support_status.support_status_id',
                'support_status.level as support_status_level',
            ];
            $where = [
                'voter_id' => $householdVoter->id,
                'voter_support_status.election_campaign_id' => $this->electionCampaignId,
                'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'),
                'voter_support_status.deleted' => 0
            ];
            //get voter support status
            $voterSupportStatus = VoterSupportStatus::select($voterSupportStatusFields)
                ->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id')
                ->where($where)
                ->first();

            if ($updateSupportStatusIfExists && $voterSupportStatus) {
                //update support status via type
                $newSupportStatusId = $voterSupportStatus->support_status_id;

                switch ($supportStatusUpdateType) {
                    case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'):
                        if ($voterSupportStatus->support_status_level < $selectedSupportStatusLevel) {
                            $newSupportStatusId = $selectedSupportStatusId;
                        }
                        break;

                    case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'):
                        if ($voterSupportStatus->support_status_level > $selectedSupportStatusLevel) {
                            $newSupportStatusId = $selectedSupportStatusId;
                        }
                        break;

                    case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS'):
                        $newSupportStatusId = $selectedSupportStatusId;
                        break;
                }

                if ($newSupportStatusId != $voterSupportStatus->support_status_id) {
                    $oldVoterSupportStatusId = $voterSupportStatus->support_status_id;
                    $voterSupportStatus->support_status_id  = $newSupportStatusId;
                    $voterSupportStatus->update_user_id     = $userCreateId;
                    $voterSupportStatus->save();

                    $historyArgsArr = [
                        'topicName' => $this->permission,
                        'user_create_id' => $userCreateId,
                        'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                        'entity_id' => $csvFileId,
                        'models' => [
                            [
                                'description' => 'עדכון סטטוס תמיכה מקובץ',
                                'referenced_model' => 'VoterSupportStatus',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $voterSupportStatus->id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'support_status_id',
                                        'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                        'old_numeric_value' => $oldVoterSupportStatusId,
                                        'new_numeric_value' => $voterSupportStatus->support_status_id,
                                    ],
                                ],
                            ],
                        ],
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            } elseif (!$voterSupportStatus) {
                //add support status to voter
                $voterSupportStatus = new VoterSupportStatus;
                $voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
                $voterSupportStatus->election_campaign_id = $this->electionCampaignId;
                $voterSupportStatus->voter_id = $householdVoter->id;
                $voterSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
                $voterSupportStatus->support_status_id  = $selectedSupportStatusId;
                $voterSupportStatus->create_user_id     = $userCreateId;
                $voterSupportStatus->update_user_id     = $userCreateId;
                $voterSupportStatus->save();

                $supportFields = [
                    'election_campaign_id',
                    'voter_id',
                    'entity_type',
                    'support_status_id',
                ];

                $fieldsArray = [];
                for ($fieldIndex = 0; $fieldIndex < count($supportFields); $fieldIndex++) {
                    $fieldName = $supportFields[$fieldIndex];

                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                        'new_numeric_value' => $voterSupportStatus->{$fieldName},
                    ];
                }

                $historyArgsArr = [
                    'topicName' => $this->permission,
                    'user_create_id' => $userCreateId,
                    'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                    'entity_id' => $csvFileId,
                    'models' => [
                        [
                            'description' => 'עדכון סטוס תמיכה מקובץ',
                            'referenced_model' => 'VoterSupportStatus',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $voterSupportStatus->id,
                            'valuesList' => $fieldsArray,
                        ],
                    ],
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }
    }

    /**
     * This function saves voter data
     * like gender, ethnic, religious group and orthodox
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $rowFile
     */
    private function saveVoterFields($userCreateId, $csvFileId, $rowFile)
    {
        $changedValues = [];

        $voter = Voters::where('id', $this->detailsFields['id'])->first();
        if ($rowFile->ethnic_group_id != null) {
            if ($voter->ethnic_group_id != $rowFile->ethnic_group_id) {
                $oldEthnicGroupId = $voter->ethnic_group_id;

                $voter->ethnic_group_id = $rowFile->ethnic_group_id;
                $this->totalRowsChanged++;

                $changedValues[] = [
                    'field_name' => 'ethnic_group_id',
                    'display_field_name' => config('history.Voters.ethnic_group_id'),
                    'old_numeric_value' => $oldEthnicGroupId,
                    'new_numeric_value' => $voter->ethnic_group_id,
                ];
            }
        }

        //save religious group
        if ($rowFile->religious_group_id != null) {
            if ($voter->religious_group_id != $rowFile->religious_group_id) {
                $oldReligiousGroupId = $voter->religious_group_id;

                $voter->religious_group_id = $rowFile->religious_group_id;
                $this->totalRowsChanged++;

                $changedValues[] = [
                    'field_name' => 'religious_group_id',
                    'display_field_name' => config('history.Voters.religious_group_id'),
                    'old_numeric_value' => $oldReligiousGroupId,
                    'new_numeric_value' => $voter->religious_group_id,
                ];
            }
        }

        if ($rowFile->gender != null) {
            if ($voter->gender != $rowFile->gender) {
                $oldGender = $voter->gender;

                $voter->gender = $rowFile->gender;
                $this->totalRowsChanged++;

                $changedValues[] = [
                    'field_name' => 'gender',
                    'display_field_name' => config('history.Voters.gender'),
                    'old_numeric_value' => $oldGender,
                    'new_numeric_value' => $voter->gender,
                ];
            }
        }

        if ($rowFile->strictly_orthodox != null) {
            if ($voter->strictly_orthodox != $rowFile->strictly_orthodox) {
                $oldStrictlyOrthodox = $voter->strictly_orthodox;

                $voter->strictly_orthodox = $rowFile->strictly_orthodox;
                $this->totalRowsChanged++;

                $changedValues[] = [
                    'field_name' => 'strictly_orthodox',
                    'display_field_name' => config('history.Voters.strictly_orthodox'),
                    'old_numeric_value' => $oldStrictlyOrthodox,
                    'new_numeric_value' => $voter->strictly_orthodox,
                ];
                \App\Http\Controllers\BallotBoxController::updateBallotDetailsCounters(null, $voterData->id, 'strictly_orthodox');

            }
        }

        if (count($changedValues) > 0) {
            $voter->save();

            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => 'עדכון נתוני תושב מקובץ',
                        'referenced_model' => 'Voters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voter->id,
                        'valuesList' => $changedValues,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    private function saveVoterGroup($userCreateId, $csvFileId, $rowFile)
    {
        $fieldsArray = [];

        $voterInGroup = VotersInGroups::where('voter_id', $this->detailsFields['id'])
                                        ->where('voter_group_id', $rowFile->voter_group_id)->first();
        /*if ($voterInGroup) {
            $oldVoterGroupId = $voterInGroup->voter_group_id;

            $voterInGroup->voter_group_id = $rowFile->voter_group_id;
            $voterInGroup->save();

            if ($voterInGroup->voter_group_id != $oldVoterGroupId) {
                $fieldsArray[] = [
                    'field_name' => 'voter_group_id',
                    'display_field_name' => config('history.VotersInGroups.voter_group_id'),
                    'old_numeric_value' => $oldVoterGroupId,
                    'new_numeric_value' => $voterInGroup->voter_group_id,
                ];
            }

            $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');
        } */
        if ($voterInGroup == null) {
            $voterInGroup = new VotersInGroups;
            $voterInGroup->voter_id = $this->detailsFields['id'];
            $voterInGroup->voter_group_id = $rowFile->voter_group_id;
            $voterInGroup->save();

            $fieldsArray[] = [
                'field_name' => 'voter_id',
                'display_field_name' => config('history.VotersInGroups.voter_id'),
                'new_numeric_value' => $voterInGroup->voter_id,
            ];

            $fieldsArray[] = [
                'field_name' => 'voter_group_id',
                'display_field_name' => config('history.VotersInGroups.voter_group_id'),
                'new_numeric_value' => $voterInGroup->voter_group_id,
            ];

            $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');
        }

        if (count($fieldsArray) > 0) {
            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => 'עדכון קבוצת תושב מקובץ',
                        'referenced_model' => 'VotersInGroups',
                        'referenced_model_action_type' => $referenced_model_action_type,
                        'referenced_id' => $voterInGroup->id,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    private function saveVoterSupportStatus($userCreateId, $csvFileId, $rowFile)
    {
        //init variables
        $updateAlsoAllMembersOfHousehold = $rowFile->update_household_support_status;

        $voterSupportStatusFields = [
            'voter_support_status.id',
            'voter_support_status.support_status_id',
            'support_status.level as support_status_level',
        ];
        $where = [
            'voter_id' => $this->detailsFields['id'],
            'voter_support_status.election_campaign_id' => $this->electionCampaignId,
            'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'),
            'voter_support_status.deleted' => 0
        ];
        //get current support status
        $currentVoterSupportStatus = VoterSupportStatus::select($voterSupportStatusFields)
            ->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id')
            ->where($where)
            ->first();
        if (isset($this->supportFields['support_status_id'])) {
            //add/update status if came from column
            if (null == $currentVoterSupportStatus) {
                $this->addVoterSupportStatus($userCreateId,
                                            $csvFileId,
                                            $this->supportFields['support_status_id'],
                                            config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION' ));
            } elseif ($currentVoterSupportStatus->support_status_id != $this->supportFields['support_status_id']) {
                $oldVoterSupportStatusId = $currentVoterSupportStatus->support_status_id;
                $currentVoterSupportStatus->support_status_id = $this->supportFields['support_status_id'];
                $currentVoterSupportStatus->update_user_id = $userCreateId;
                $currentVoterSupportStatus->save();

                $historyArgsArr = [
                    'topicName' => $this->permission,
                    'user_create_id' => $userCreateId,
                    'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                    'entity_id' => $csvFileId,
                    'models' => [
                        [
                            'description' => 'עדכון סטטוס תמיכה תושב מקובץ',
                            'referenced_model' => 'VoterSupportStatus',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $currentVoterSupportStatus->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'support_status_id',
                                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                    'old_numeric_value' => $oldVoterSupportStatusId,
                                    'new_numeric_value' => $this->supportFields['support_status_id'],
                                ],
                            ],
                        ],
                    ],
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
            $this->totalRowsChanged ++;
        } else if ( $rowFile->support_status_id != null ) {
            //add/update status if via type
            if ( null == $currentVoterSupportStatus ) {
                $this->addVoterSupportStatus($userCreateId,
                                            $csvFileId,
                                            $rowFile->support_status_id,
                                            config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION' ));
            } elseif ($rowFile->update_support_status_if_exists) {
                $this->editVoterSupportStatusByUpdateType($userCreateId, $csvFileId,$rowFile, $currentVoterSupportStatus);
            }

            //update household status via type
            if ($updateAlsoAllMembersOfHousehold) {
                $this->updateVoterHouseholdMembersSupportStatus($userCreateId,
                                                                $csvFileId,
                                                                $this->detailsFields['household_id'],
                                                                $rowFile);
            }

            $this->totalRowsChanged++;
        }
    }

    /**
     * This function adds a vote for the
     * voter.
     *
     * @param $userCreateId
     * @param $csvFileId
     */
    private function addVoterVote($userCreateId, $voterId, $csvFileId) {

        $elections = ElectionCampaigns::select(['id', 'election_date'])
            ->where('id',  $this->electionCampaignId)
            ->first();

        $voteSourceId = VoteSources::select('id')
            ->where('system_name', config( 'constants.VOTE_SOURCE_TYPE_CSV_FILE' ))
            ->first()
            ->id;

        $votesObj = new Votes;
        $votesObj->key = Helper::getNewTableKey('votes', 10);
        $votesObj->voter_id = $voterId;
        $votesObj->election_campaign_id = $this->electionCampaignId;

        if ( isset( $this->votesFields['vote_time']) ) {
            $votesObj->vote_date = $elections->election_date . ' ' . $this->votesFields['vote_time'];
        } else {
            $votesObj->vote_date = $elections->election_date . ' ' . date("H:i:s");
        }

        $votesObj->vote_source_id = $voteSourceId;
        $votesObj->user_create_id = $userCreateId;

        $votesObj->save();

        //update ballot box in votes calculations
        $voterInElection = VotersInElectionCampaigns::select('ballot_box_id')
                            ->where('election_campaign_id', $this->electionCampaignId)
                            ->where('voter_id', $voterId)
                            ->first();
        if ($voterInElection) {
            Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $voterInElection->ballot_box_id, $voterInElection->ballot_box_id);
        }

        $changedValues = [];

        $fields = [
            'voter_id',
            'election_campaign_id',
            'vote_date',
            'vote_source_id'
        ];

        for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
            $fieldName = $fields[$fieldIndex];

            if ('vote_date' == $fieldName) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Votes.' . $fieldName),
                    'new_value' => $votesObj->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Votes.' . $fieldName),
                    'new_numeric_value' => $votesObj->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => $this->permission,
            'user_create_id' => $userCreateId,
            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
            'entity_id' => $csvFileId,
            'models' => [
                [
                    'description' => 'הוספת שעת הצבעה מקובץ',
                    'referenced_model' => 'Votes',
                    'referenced_model_action_type' => config( 'constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD' ),
                    'referenced_id' => $votesObj->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

    /**
     * This function edits an existing
     * vote for voter.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $votesObj
     */
    private function editVoterVote($userCreateId, $csvFileId, $votesObj) {
        $voteSourceId = VoteSources::select('id')
            ->where('system_name', config( 'constants.VOTE_SOURCE_TYPE_CSV_FILE' ))
            ->first()
            ->id;

        $elections = ElectionCampaigns::select(['id', 'election_date'])
            ->where('id',  $this->electionCampaignId)
            ->first();

        if ( isset($this->votesFields['vote_time']) ) {
            $newVoteDate = $elections->election_date . ' ' . $this->votesFields['vote_time'];
        } else {
            $newVoteDate = null;
        }

        $oldVoteDate = $votesObj->vote_date;
        $oldVoteSourceId = $votesObj->vote_source_id;

        $changedValues = [];

        if ( $newVoteDate != $oldVoteDate ) {
            $votesObj->vote_date = $newVoteDate;

            $changedValues[] = [
                'field_name' => 'vote_date',
                'display_field_name' => config('history.Votes.vote_date'),
                'old_value' => $oldVoteDate,
                'new_value' => $newVoteDate
            ];
        }

        if ( $voteSourceId != $oldVoteSourceId ) {
            $votesObj->vote_source_id = $voteSourceId;

            $changedValues[] = [
                'field_name' => 'vote_source_id',
                'display_field_name' => config('history.Votes.vote_source_id'),
                'old_numeric_value' => $oldVoteSourceId,
                'new_numeric_value' => $voteSourceId
            ];
        }

        if ( count($changedValues) > 0 ) {
            $votesObj->save();

            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => 'עדכון שעת הצבעה מקובץ',
                        'referenced_model' => 'Votes',
                        'referenced_model_action_type' => config( 'constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $votesObj->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    /**
     * This function updates the time
     * the user voted.
     *
     * @param $userCreateId
     * @param $csvFileId
     * @param $rowFile
     */
    private function saveVoterVotes($userCreateId, $csvFileId) {
        $voterId = $this->detailsFields['id'];

        $votesObj = Votes::select(['id', 'vote_date', 'vote_source_id'])
            ->where(['election_campaign_id' => $this->electionCampaignId, 'voter_id' => $voterId])
            ->first();

        $referenced_model_action_type = null;

        if ( is_null($votesObj) ) {
            if ( isset($this->votesFields['voted']) && 1 == $this->votesFields['voted'] ) {
                $this->addVoterVote($userCreateId, $voterId, $csvFileId);
            }

        }/* else {
            if ( isset($this->votesFields['voted']) ) {
                if ( 1 == $this->votesFields['voted'] ) {
                    $this->editVoterVote($userCreateId, $csvFileId, $votesObj);
                } else {
                    $votesId = $votesObj->id;
                    $votesObj->delete();

                    $historyArgsArr = [
                        'topicName' => 'elections.voter.political_party.shas_institutes.delete',
                        'user_create_id' => $userCreateId,
                        'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                        'entity_id' => $csvFileId,
                        'models' => [
                            [
                                'description' => 'מחיקת שעת הצבעה מקובץ',
                                'referenced_model' => 'Votes',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                                'referenced_id' => $votesId
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }
        }*/
    }

    private function saveVoterSupportStatusFinal($userCreateId, $csvFileId) {
        $where = [
            'voter_id'             => $this->detailsFields['id'],
            'election_campaign_id' => $this->electionCampaignId,
            'entity_type'          => config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL' ),
            'deleted'              => 0
        ];
        $currentVoterSupportStatus = VoterSupportStatus::select(['id', 'support_status_id'])
            ->where($where)
            ->first();

        $historyDescription = null;
        $referenced_model_action_type = null;
        $changedValues = [];

        if ( is_null($this->supportFields['support_status_final_id']) ) {
            if ( !is_null($currentVoterSupportStatus) ) {
                $changedValues[] = [
                    'field_name' => 'support_status_id',
                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                    'old_numeric_value' => $currentVoterSupportStatus->id
                ];

                $historyDescription = 'מחיקת סטטוס תמיכה סופי מקובץ';
                $referenced_model_action_type = config( 'constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE');

                $currentVoterSupportStatus->delete();
            }
        } else {
            if ( is_null($currentVoterSupportStatus) ) {
                $this->addVoterSupportStatus($userCreateId,
                                            $csvFileId,
                                            $this->supportFields['support_status_final_id'],
                                            config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL' ));
            } else {
                $oldSupportStatusId = $currentVoterSupportStatus->support_status_id;
                $newSupportStatusId = $this->supportFields['support_status_final_id'];

                if ( $newSupportStatusId != $oldSupportStatusId ) {
                    $currentVoterSupportStatus->support_status_id = $newSupportStatusId;
                    $currentVoterSupportStatus->update_user_id = $userCreateId;
                    $currentVoterSupportStatus->save();

                    $changedValues[] = [
                        'field_name' => 'support_status_id',
                        'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                        'old_numeric_value' => $oldSupportStatusId,
                        'new_numeric_value' => $newSupportStatusId,
                    ];

                    $historyDescription = 'עדכון סטטוס תמיכה סופי מקובץ';
                    $referenced_model_action_type = config( 'constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');
                }
            }
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => $this->permission,
                'user_create_id' => $userCreateId,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
                'entity_id' => $csvFileId,
                'models' => [
                    [
                        'description' => $historyDescription,
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => $referenced_model_action_type,
                        'referenced_id' => $currentVoterSupportStatus->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

    /**
     * This function handles the parsing of file of type "Normal".
     *
     * @param $csvFileId - The csv file id in table "csv_files"
     * @param $rowFile - The file data from table "csv_files"
     * @param $startFromRow - The row to start from
     */
    private function parseCsvTypeNormal($csvFileId, $rowFile, $startFromRow)
    {
        Log::info('START PARSE JOB');
        $this->electionCampaignId = VoterElectionsController::getLastCampaign();

        $addressObj = new Address();
        $this->addressObj = $addressObj;
        $tempPhoneTypes = PhoneTypes::select(['id', 'system_name'])->whereIn('system_name', ['home', 'mobile'])->get();
        for ($phoneIndex = 0; $phoneIndex < count($tempPhoneTypes); $phoneIndex++) {
            $phoneTypeSystemName = $tempPhoneTypes[$phoneIndex]->system_name;
            $this->phoneTypes[$phoneTypeSystemName] = $tempPhoneTypes[$phoneIndex]->id;
        }
        // Get the column numbers of fields
        $arrColumnFields = CsvFileFields::select(['column_number', 'field_name'])->where('csv_file_id', $csvFileId)->get();
        $arrFields = [];
        for ($index = 0; $index < count($arrColumnFields); $index++) {
            $column = $arrColumnFields[$index]->column_number;
            $arrFields[$column] = $arrColumnFields[$index]->field_name;
        }
        $statusName = "פתיחת מערכת";
        $statusObj = CrmRequestStatus::select(['id'])->where(['name' => $statusName, 'deleted' => 0])->first();
        $requestStatusId = $statusObj->id;

        $fileHandle = fopen(config('constants.CSV_UPLOADS_DIRECTORY') . $rowFile->file_name, 'r');
        $rowNumber = 0;
 
        while ( ($fileData = fgets($fileHandle)) !== false) {
			Redis::set('services:csv:'.$csvFileId, 1,'EX', 30);
            $this->totalRowsChanged = 0;
            $this->totalChangedPhones = 0;
            $this->totalNonChangedPhones = 0;
            $rowNumber++;
            // Skip to the row to start from
            if ($startFromRow > 0 && $rowNumber < $startFromRow) {
                continue;
            }

            // Ignore the first row if it's a header
            if (1 == $rowNumber && $rowFile->header) {
                continue;
            }

            $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');

            $utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
            $row = str_getcsv($utf8Data);

            $this->detailsFields = [];
            $this->addressFields = [];
            $this->contactFields = [
                'phones' => [],
            ];
            $this->supportFields = [];

            $isRowValid = $this->validateFields($csvFileId, $rowNumber, $row, $arrFields,$rowFile->user_create_id);
            echo '$isRowValid'. "$isRowValid &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&";
            if (!$isRowValid) {
                CsvFiles::where('id', '=', $csvFileId)->where('deleted',0)->update(['current_row' => $rowNumber]);
                continue;
            }

            $this->saveVoterDetails($rowFile->user_create_id, $csvFileId, $rowFile);

            $this->saveVoterPhone($rowFile->user_create_id, $csvFileId, $rowFile->delete_duplicate_phones);
			
			$this->saveVoterTransportation($rowFile->user_create_id, $csvFileId, $rowFile);

            if (null == $rowFile->update_household_address) {
                $this->totalRowsChanged++;
                $updateHouseholdAddress = 0;
            } else {
                $updateHouseholdAddress = $rowFile->update_household_address;
            }
            // Log::info('saveVoterAddress', ['user_create_id' => $rowFile->user_create_id, 'updateHouseholdAddress' => $updateHouseholdAddress]);
            $this->saveVoterAddress($rowFile->user_create_id, $csvFileId, $updateHouseholdAddress);

            if ($rowFile->institute_id != null && $rowFile->institute_role_id != null) {
                $this->saveVoterInstitute($rowFile->user_create_id, $csvFileId, $rowFile->institute_id, $rowFile->institute_role_id);
            }

            $this->saveVoterVotes($rowFile->user_create_id, $csvFileId);

            // Saving gender, orthodox, religious group & ethnic group
            $this->saveVoterFields($rowFile->user_create_id, $csvFileId, $rowFile);

            if (!is_null($rowFile->voter_group_id)) {
                $this->saveVoterGroup($rowFile->user_create_id, $csvFileId, $rowFile);
            }

            $this->saveVoterSupportStatus($rowFile->user_create_id, $csvFileId, $rowFile);
            if (isset($this->requestFields['topic_id'])) {
                $requestArr = [
                    'topic_id' => $this->requestFields['topic_id'],
                    'sub_topic_id' => $this->requestFields['sub_topic_id'],
                    'date' => $this->requestFields['date'],
                    'request_priority_id' => 1,
                    'status_id' => $requestStatusId,
                    'user_handler_id' => $this->requestFields['user_handler_id'],
                    'team_handler_id' => $this->requestFields['team_handler_id'],
                    'description' => $this->requestFields['description'],
                    'voter_id' => $this->detailsFields['id'],
                ];
                CrmRequestController::addRequestFromCsv($requestArr, $rowFile->user_create_id);
            }

            if ( isset($this->supportFields['support_status_final_id']) ) {
                $this->saveVoterSupportStatusFinal($rowFile->user_create_id, $csvFileId);
            }
 

            $inserts = [
                'key' => Helper::getNewTableKey('csv_file_rows', 10),
                'csv_file_id' => $csvFileId,
                'row_number' => $rowNumber,
                'voter_id' => $this->detailsFields['id'],
                'status' => config('constants.CSV_PARSER_ROW_STATUS_SUCCESS'),
                'update_count' => ($this->totalRowsChanged + $this->totalChangedPhones),
                'added_phone_count' => $this->totalChangedPhones,
                'non_added_phone_count' => $this->totalNonChangedPhones,
            ];
            CsvFileRows::insert($inserts);
	 
            CsvFiles::where('id', $csvFileId)->where('deleted',0)->update(['current_row' => $rowNumber]);
						
			$currentFileStatus = CsvFiles::select('status')->where('id', $csvFileId)->where('deleted',0)->first();
			if($currentFileStatus && $currentFileStatus->status != config('constants.CSV_PARSER_STATUS_AT_WORK')){
				Redis::del('services:csv:'.$csvFileId);
				fclose($fileHandle);
				return; // if process not running anymore - break this loop and return from function
			}
        }
        fclose($fileHandle);
		 
        $updates = [
            'process_id' => null,
            'status' => config('constants.CSV_PARSER_STATUS_SUCCESS'),
        ];
        CsvFiles::where('id', $csvFileId)->where('deleted',0)->update($updates);
 
    }

    /**
     * This function checks the file running status
     * by checking the field "status" in the table
     * "csv_files".
     *
     * According to the file type it calls the relevent
     * function to handle the parsing.
     *
     * @param $csvFileId
     */
    public function parseCsv($csvFileId)
    {

        $startFromRow = 0;

        $csvFileFields = [
            'csv_files.id',
            'csv_files.name',
            'csv_files.file_name',
            'csv_files.row_count',
            'csv_files.current_row',
            'csv_files.header',
            'csv_files.status',
            'csv_files.process_id',
            'csv_files.user_create_id',
            'csv_files.captain_id',
            'csv_files.delete_duplicate_phones',
            'csv_files.update_household_address',
            'csv_files.support_status_id',
            'csv_files.support_status_update_type',
            'csv_files.previous_support_status_id',
            'csv_files.update_support_status_if_exists',
            'csv_files.update_household_support_status',
            'csv_files.institute_id',
            'csv_files.institute_role_id',
            'csv_files.ethnic_group_id',
            'csv_files.religious_group_id',
            'csv_files.gender',
            'csv_files.strictly_orthodox',
            'csv_files.voter_group_id',
            'support_status.level as support_status_level',
        ];

        $rowFile = CsvFiles::select($csvFileFields)
            ->where('csv_files.id', '=', $csvFileId)
			->where('csv_files.deleted',0)
            ->withSupportStatus()
            ->first();
        // Log::info( $rowFile);
        // print_r(config('constants.CSV_PARSER_STATUS_RESTARTED'));

    if(!$rowFile){
		echo 'File id:'.$csvFileId;
        echo 'File not found!';
        return;
    }
 
        switch ($rowFile->status) {
            // The parsing of the file did not start yet.
            case config('constants.CSV_PARSER_STATUS_DID_NOT_START'):
                // Log::info('In process csv did not start');

                // Change the parsing status to "At work".
                $updates = [
                    'process_id' => getmypid(),
                    'status' => config('constants.CSV_PARSER_STATUS_AT_WORK'),
                ];
                CsvFiles::where('id', $csvFileId)->where('csv_files.deleted',0)->update($updates);

                // Start from row 0.
                $startFromRow = 0;
                break;

            // The parsing status at work or has been stopped
            case config('constants.CSV_PARSER_STATUS_AT_WORK'):
                // Checking if the process id is running
                if (Redis::get('services:csv:'.$csvFileId)) {
                    // If the file procees is running, don't interupt.
                    return;
                } else {
                    // If the procees is not running, then the parsing
                    // has been stopped, and will be executed from the
                    // last row taht was processed.
                    $updates = [
                        'process_id' => getmypid(),
                    ];
                    CsvFiles::where('id', $csvFileId)->where('csv_files.deleted',0)->update($updates);

                    // Start parsing fromn the row after the
                    // last row that was processed
                    $startFromRow = $rowFile->current_row + 1;
                }
                break;
			// The will restart at the place it was stopped
            case config('constants.CSV_PARSER_STATUS_RESTARTED'):
                $updates = [
                       'process_id' => getmypid(),
						'status' => config('constants.CSV_PARSER_STATUS_AT_WORK')
                ];
                CsvFiles::where('id', $csvFileId)->where('csv_files.deleted',0)->update($updates);

                // Start parsing fromn the row after the
                // last row that was processed
                $startFromRow = $rowFile->current_row + 1;
                 
                break;


            // The parsing ended successfully.
            case config('constants.CSV_PARSER_STATUS_SUCCESS'):
            case config('constants.CSV_PARSER_STATUS_ERROR'):
            case config('constants.CSV_PARSER_STATUS_WAITING'):
            case config('constants.CSV_PARSER_STATUS_CANCELLED'):
			 
				Redis::del('services:csv:'.$csvFileId);
				return;
                break;
        }

        // Check the file type and call
        // the relevant function to handle
        // the parsing.
        switch ($rowFile->type) {
            case config('constants.CSV_FILE_TYPE_NORMAL'):
                $this->parseCsvTypeNormal($csvFileId, $rowFile, $startFromRow);
                break;
        }
        // print_r(json_encode($rowFile));
        // die;
        echo json_encode("Command pid: " . getmypid());
    }
}
