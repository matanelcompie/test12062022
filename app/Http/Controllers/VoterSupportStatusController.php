<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Cluster;
use Illuminate\Http\Request;
use App\Models\Voters;
use App\Models\VoterSupportStatus;
use App\Models\ElectionCampaigns;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\SupportStatus;

use Auth;

use App\Libraries\Helper;
use App\Libraries\Services\ExportService;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\VoterElectionsController;


class VoterSupportStatusController extends Controller {
    private $errorMessage;
	
	/*
		Contructor function
	*/
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
    }
	
	/*
		Private helpful function that converts array into object of type stdClass
	*/
	private function arrayToObject($array) {
		if (!is_array($array)) {
			return $array;
		}
    
		$object = new \stdClass();
		if (is_array($array) && count($array) > 0) {
			foreach ($array as $name=>$value) {
				$name = strtolower(trim($name));
				if (!empty($name)) {
					$object->$name = self::arrayToObject($value);
				}
			}
			return $object;
		}
		else {
			return FALSE;
		}
	}

	/*
		Function that adds new VoterSupportStatus by voterKey and POST params
	*/
    public function addHouseholdStatus(Request $request, $voterKey, $householdKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $householdVoter = Voters::withFilters()->where( 'voters.key', $householdKey )->first( ['voters.id'] );
        if ( $householdVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterSupportStatus = new VoterSupportStatus;

        $voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
        $voterSupportStatus->election_campaign_id = VoterElectionsController::getLastCampaign();
        $voterSupportStatus->entity_type = $request->input('entity_type');
        $voterSupportStatus->support_status_id = $request->input('support_status_id');
        $voterSupportStatus->voter_id = $householdVoter->id;
        $voterSupportStatus->create_user_id = Auth::user()->id;
        $voterSupportStatus->update_user_id = Auth::user()->id;
        $voterSupportStatus->save();

        // Array of display field names
        $historyFieldsNames = [
            'election_campaign_id' => config('history.VoterSupportStatus.election_campaign_id'),
            'entity_type'          => config('history.VoterSupportStatus.entity_type'),
            'support_status_id'    => config('history.VoterSupportStatus.support_status_id'),
            'voter_id'             => config('history.VoterSupportStatus.voter_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_numeric_value' => $voterSupportStatus->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.household.support_status.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterSupportStatus->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData( $voterSupportStatus );
    }

	/*
		Function that edits existing VoterSupportStatus by voterSupportStatusKey and POST params
	*/
    public function editHouseholdStatus(Request $request, $voterKey, $householdKey, $supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $voterSupportStatus = VoterSupportStatus::where('key', $supportStatusKey)->first();
        if ( null == $voterSupportStatus ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $oldSupportStatusId = $voterSupportStatus->support_status_id;
        $newSupportStatusId = $request->input('support_status_id');

        $voterSupportStatus->support_status_id  = $newSupportStatusId;
        $voterSupportStatus->update_user_id     = Auth::user()->id;
        $voterSupportStatus->save();

        $fieldsArray = [];
        if ( $oldSupportStatusId != $newSupportStatusId ) {
            $fieldsArray[] = [
                'field_name' => 'support_status_id',
                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                'old_numeric_value' => $oldSupportStatusId,
                'new_numeric_value' => $newSupportStatusId
            ];

            $historyArgsArr = [
                'topicName' => 'elections.voter.household.support_status.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterSupportStatus->id,
                        'valuesList' => $fieldsArray
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData( $voterSupportStatus );
    }

	/*
		Function that deletes voterSupportStatus entry by its key
	*/
    public function deleteHouseholdStatus(Request $request, $voterKey, $householdKey, $supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $voterSupportStatus = VoterSupportStatus::where('key', $supportStatusKey)->first();
        if ( null == $voterSupportStatus ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }


        $fieldsArray = [
            [
                'field_name' => 'support_status_id',
                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                'old_numeric_value' => $voterSupportStatus->support_status_id
            ]
        ];

        $historyArgsArr = [
            'topicName' => 'elections.voter.household.support_status.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterSupportStatus->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $voterSupportStatus->delete();

        $jsonOutput->setData( $voterSupportStatus->id );
    }

	/*
		Private helpful function that adds new voterSupportStatus entry
	*/
    private function addVoterSupportStatuses($voterId, $newSupportStatusId) {
        $voterSupportStatus = new VoterSupportStatus;

        $voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
        $voterSupportStatus->election_campaign_id = VoterElectionsController::getLastCampaign();
        $voterSupportStatus->entity_type = config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
        $voterSupportStatus->support_status_id = $newSupportStatusId;
        $voterSupportStatus->voter_id = $voterId;
        $voterSupportStatus->create_user_id = Auth::user()->id;
        $voterSupportStatus->update_user_id = Auth::user()->id;
        $voterSupportStatus->save();

        // Array of display field names
        $historyFieldsNames = [
            'election_campaign_id' => config('history.VoterSupportStatus.election_campaign_id'),
            'entity_type'          => config('history.VoterSupportStatus.entity_type'),
            'support_status_id'    => config('history.VoterSupportStatus.support_status_id'),
            'voter_id'             => config('history.VoterSupportStatus.voter_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_numeric_value' => $voterSupportStatus->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.support_status.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterSupportStatus->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that edits voterSupportStatus by its key , and 
		assigns to it new id of support_status 
	*/
    private function editVoterSupportStatus($supportStatusKey, $newSupportStatusId) {
        $jsonOutput = app()->make( "JsonOutput" );

        $voterSupportStatus = VoterSupportStatus::where('key', $supportStatusKey)->first();
        if ( null == $voterSupportStatus ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $oldSupportStatusId = $voterSupportStatus->support_status_id;

        $voterSupportStatus->support_status_id = $newSupportStatusId;
        $voterSupportStatus->update_user_id = Auth::user()->id;
        $voterSupportStatus->save();

        if ( $oldSupportStatusId != $newSupportStatusId ) {
            $fieldsArray = [
                [
                    'field_name' => 'support_status_id',
                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                    'old_numeric_value' => $oldSupportStatusId,
                    'new_numeric_value' => $newSupportStatusId
                ]
            ];

            $historyArgsArr = [
                'topicName' => 'elections.voter.support_and_elections.support_status.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterSupportStatus->id,
                        'valuesList' => $fieldsArray
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

	/*
		Private helpful function that deletes voterSupportStatus by its key
	*/
    private function deleteVoterSupportStatuses($supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $voterSupportStatus = VoterSupportStatus::where('key', $supportStatusKey)->first();
        if ( null == $voterSupportStatus ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }


        $fieldsArray = [
            [
                'field_name' => 'support_status_id',
                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                'old_numeric_value' => $voterSupportStatus->support_status_id
            ]
        ];

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.support_status.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterSupportStatus->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];
        $voterSupportStatus->delete();

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that validates supportStatus key
	*/
    private function validateSupportStatusKey($supportStatusKey) {
        $rules = [
            'supportStatusKey' => 'required|exists:voter_support_status,key'
        ];

        $validator = Validator::make( ['supportStatusKey' => $supportStatusKey ], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('supportStatusKey');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates supportStatus
	*/
    private function validateSupportStatus( $newSupportStatusId ) {
        $rules = [
            'newSupportStatusId' => 'required|exists:support_status,id'
        ];

        $validator = Validator::make( ['newSupportStatusId' => $newSupportStatusId ], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('newSupportStatusId');

            return false;
        } else {
            return true;
        }
    }

	/*
		Function that adds VoterSupportStatus to voter by voterKey and POST params
	*/
    public function saveVoterSupportStatuses(Request $request, $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $newSupportStatusId = $request->input('support_status_id');
        if ( !$this->validateSupportStatus($newSupportStatusId) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $voterId = $currentVoter->id;
        $this->addVoterSupportStatuses($voterId, $newSupportStatusId);

        $jsonOutput->setData('סטטוס תמיכת משתמש התווסף');
    }

	/*
		Function that edits VoterSupportStatus to voter by voterKey , supportStatusKey and POST params
	*/
    public function saveVoterSupportStatusWithKey(Request $request, $voterKey, $supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        if ( !$this->validateSupportStatusKey($supportStatusKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $newSupportStatusId = $request->input('support_status_id');
        if ( null == $newSupportStatusId ) {
            $this->deleteVoterSupportStatuses($supportStatusKey);

            $jsonOutput->setData('סטטוס תמיכת משתמש נמחק');
            return;
        }

        // Support status is not null,
        // so it has to be validated
        if ( !$this->validateSupportStatus($newSupportStatusId) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $this->editVoterSupportStatus($supportStatusKey, $newSupportStatusId);

        $jsonOutput->setData("סטטוס תמיכת משתמש עודכן");
    }

	/*
		Function that returns all voter's VoterSupportStatuses by voterKey
	*/
    public function getAllVoterSupportStatuses($voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        /*$currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }*/
        $voterId = $currentVoter->id;

        $fields = [
                   'voter_support_status.id', 'voter_support_status.election_campaign_id',
                   'voter_support_status.entity_type', 'voter_support_status.support_status_id',
                   'election_campaigns.name as election_campaigns_name',
                   'support_status.name as support_status_name',
                   'election_campaigns.start_date as election_campaign_start_date'
                  ];
        $voterSupportStatuses = VoterSupportStatus::select($fields)
                                                  ->withElectionCampaigns()
                                                  ->withSupportStatus()
                                                  ->where('voter_id', $voterId)
                                                  ->where('voter_support_status.deleted', 0)
                                                  ->orderBy('voter_support_status.entity_type', 'desc')
                                                  ->orderBy('election_campaigns.start_date', 'desc')
                                                  ->get();

        $jsonOutput->setData($voterSupportStatuses);
    }

	/*
		Private helpful function that validates date
	*/
    private function validateDate($dateField, $dateValue, $format) {
        $rules = [
            $dateField => 'date_format:' . $format
        ];

        $validator = Validator::make([$dateField => $dateValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates Integer
	*/
    private function validateIntInput($fieldName, $fieldValue) {
        $rules = [
            $fieldName => 'integer'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates POST params for the
		generation of status-change report
	*/
    private function validateStatusChangeReportData(Request $request) {
        $summary_by_id = $request->input('summary_by_id', null);

        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        $start_date = $request->input('start_date', null);
        $end_date = $request->input('end_date', null);

        $selected_statuses = $request->input('selected_statuses', []);

        if ( is_null($summary_by_id) || !$this->validateIntInput('summary_by_id', $summary_by_id) ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_SUMMARY_BY');
        }

        if ( is_null($area_id) && is_null($city_id)) {
            return config('errors.elections.STATUS_CHANGE_NO_GEO_TYPE_WAS_CHOSEN');
        }

        if ( !is_null($area_id) && !$this->validateIntInput('area_id', $area_id) ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_AREA');
        }

        if ( !is_null($city_id) ) {
            if ( !$this->validateIntInput('city_id', $city_id) ) {
                return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
            } else {
                $cityObj = City::select(['id', 'key'])->where('id', $city_id)->first();
                if ( is_null($cityObj) ) {
                    return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
                } else if ( !GlobalController::isAllowedCitiesForUser($cityObj->key) ) {
                    return config('errors.elections.STATUS_CHANGE_CITY_IS_NOT_ALLOWED_TO_USER');
                }
            }
        }

        if ( !is_null($sub_area_id) && !$this->validateIntInput('sub_area_id', $sub_area_id) ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_SUB_AREA');
        }

        if ( !is_null($cluster_id) && !$this->validateIntInput('cluster_id', $cluster_id) ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_CLUSTER');
        }

        if ( !is_null($ballot_id) && !$this->validateIntInput('ballot_id', $ballot_id) ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_BALLOT');
        }

        if ( is_null($start_date) || !$this->validateDate('start_date', $start_date, 'Y-m-d') ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_START_DATE');
        }

        if ( !is_null($end_date) && !$this->validateDate('end_date', $end_date, 'Y-m-d') ) {
            return config('errors.elections.STATUS_CHANGE_INVALID_END_DATE');
        } else if ( $start_date > $end_date ) {
            return config('errors.elections.STATUS_CHANGE_START_DATE_GREATER_THAN_END_DATE');
        }

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }
// dd($systemSupportHashByKey,$selected_statuses);
        for ( $selectedStatusIndex = 0; $selectedStatusIndex < count($selected_statuses); $selectedStatusIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedStatusIndex];
            //Check if all the selected statuses is valid
            if ( $selectedStatusKey != config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') &&
                !isset($systemSupportHashByKey[$selectedStatusKey]) ) {
					dd($systemSupportHashByKey);
                return config('errors.elections.STATUS_CHANGE_INVALID_SELECTED_STATUSES');
            }
        }

        return 'OK';
    }

	/*
		Private helpful function that dynamicly returns counts for support statuses fields in the report 
	*/
    private function getCountStatusesFields($selectedStatusesIds, $isSupportStausNoneSelected) {
        $statusesFields = [];
        $sumStatusesFields = [];
        for ( $stausIndex = 0; $stausIndex < count($selectedStatusesIds); $stausIndex++ ) {
            $selectedSupportStatusId = $selectedStatusesIds[$stausIndex];

            $countUpField = 'count(CASE WHEN action_history_details.new_value=' . $selectedSupportStatusId . ' THEN 1 END)';
            $countUpField .= ' as count_support_status' . $selectedSupportStatusId . '_up';
            $statusesFields[] = DB::raw($countUpField);

            $sumStatusUpField = 'sum(count_support_status' . $selectedSupportStatusId . '_up) ';
            $sumStatusUpField .= 'as sum_support_status' . $selectedSupportStatusId . '_up';
            $sumStatusesFields[] = DB::raw($sumStatusUpField);

            $countDownField = 'count(CASE WHEN action_history_details.old_value=' . $selectedSupportStatusId . ' THEN 1 END)';
            $countDownField .= ' as count_support_status' . $selectedSupportStatusId . '_down';
            $statusesFields[] = DB::raw($countDownField);

            $sumStatusDownField = 'sum(count_support_status' . $selectedSupportStatusId . '_down) ';
            $sumStatusDownField .= 'as sum_support_status' . $selectedSupportStatusId . '_down';
            $sumStatusesFields[] = DB::raw($sumStatusDownField);
        }

        if ($isSupportStausNoneSelected) {
            $countUpField = 'count(CASE WHEN action_history_details.new_value IS NULL THEN 1 END) ';
            $countUpField .= 'as count_support_status_none_up';
            $statusesFields[] = DB::raw($countUpField);

            $sumStatusUpField = 'sum(count_support_status_none_up) as sum_support_status_none_up';
            $sumStatusesFields[] = DB::raw($sumStatusUpField);

            $countDownField = 'count(CASE WHEN action_history_details.old_value IS NULL THEN 1 END) ';
            $countDownField .= 'as count_support_status_none_down';
            $statusesFields[] = DB::raw($countDownField);

            $sumStatusDownField = 'sum(count_support_status_none_down) as sum_support_status_none_down';
            $sumStatusesFields[] = DB::raw($sumStatusDownField);
        }

        $result = [
            'statusesFields' => $statusesFields,
            'sumStatusesFields' => $sumStatusesFields
        ];

        return $result;
    }

	/*
		Private helpful function that returns status-change report summed by Area
	*/
    private function displayStatusChangeReportByArea(Request $request, $exportToFile = false) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        $selected_statuses = $request->input('selected_statuses', null);

        $start_date = $request->input('start_date', null);
        $end_date = $request->input('end_date', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'areas.id',
            'areas.name as area_name',

            DB::Raw("count(distinct voter_support_status.voter_id) as count_voters_handled"),
            DB::Raw("count(action_history.id) as count_total_activity"),
        ];

        $countTotalVotersQuery = "(select count(voters_in_election_campaigns.id) from areas as areas2 ";
        $countTotalVotersQuery .= "join cities on cities.area_id=areas2.id ";
        $countTotalVotersQuery .= "join clusters on clusters.city_id=cities.id and clusters.election_campaign_id=" . $last_campaign_id;
        $countTotalVotersQuery .= " join ballot_boxes on ballot_boxes.cluster_id=clusters.id ";
        $countTotalVotersQuery .= "join voters_in_election_campaigns on voters_in_election_campaigns.ballot_box_id=ballot_boxes.id ";
        $countTotalVotersQuery .= "where areas2.id=areas.id group by areas2.id)";

        $countTotalVotersField = $countTotalVotersQuery . " as voters_in_election_campaigns_count";
        $fields[] = DB::raw($countTotalVotersField);

        $percentSql = "count(distinct voter_support_status.voter_id) * 100/" . $countTotalVotersQuery . " ";
        $percentSql .= "as percent_voters_handled";
        $fields[] = DB::Raw($percentSql);

        if ( count($selected_statuses) > 0 ) {
            $resultStatuses = $this->getCountStatusesFields($selectedStatusesIds, $isSupportStausNoneSelected);
            $statusesFields = $resultStatuses['statusesFields'];
            $sumStatusesFields = $resultStatuses['sumStatusesFields'];

            $fields = array_merge($fields, $statusesFields);
        }

        $areaObj = Area::select($fields)
            ->withCities()
            ->withClusters()
            ->withBallotBoxes()
            ->withSupportStatusChange();

        $where = [];

        if ( !is_null($ballot_id) ) {
            $where['ballot_boxes.id'] = $ballot_id;
        } else if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        } else if ( !is_null($sub_area_id) ) {
            $where['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $where['areas.id'] = $area_id;
        }

        $where['clusters.election_campaign_id'] = $last_campaign_id;

        $areaObj->where($where)
            ->where('voter_support_status.entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('action_history.created_at', '>=', $start_date . ' 00:00:00');

        if ( !is_null($end_date) ) {
            $areaObj->where('action_history.created_at', '<=', $end_date . ' 23:59:59');
        }

        $areaObj->groupBy('areas.id');

        $summaryFields = [
            DB::raw('sum(count_voters_handled) as sum_voters_handled'),
            DB::raw('sum(voters_in_election_campaigns_count) as sum_total_voters'),
            DB::raw('sum(count_total_activity) as sum_total_activity')
        ];

        $sumPercentField = 'sum(count_voters_handled) * 100 / sum(voters_in_election_campaigns_count) ';
        $sumPercentField .= 'as percent_sum_voters_handled';
        $summaryFields[] = DB::raw($sumPercentField);

        if ( count($selected_statuses) > 0 ) {
            $summaryFields = array_merge($summaryFields, $sumStatusesFields);
        }

        $summary = DB::table(DB::Raw('( ' . $areaObj->toSql() . ' ) AS t1'))
            ->setBindings([$areaObj->getBindings()])
            ->select($summaryFields)
            ->first();

        $sort_by_field = $request->input('sort_by_field', null);
        if ( !is_null($sort_by_field) ) {
            $sort_direction = $request->input('sort_direction', null);

            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $areaObj->orderBy($sort_by_field, 'asc');
            } else {
                $areaObj->orderBy($sort_by_field, 'desc');
            }
        }

        if ($exportToFile) {
            $areas = $areaObj->get();
        } else {
            $areas = $areaObj->skip($skip)->limit($limit)->get();
        }

        $total_records = DB::table(DB::Raw('( ' . $areaObj->toSql() . ' ) AS t1'))
            ->setBindings([$areaObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $areas,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Private helpful function that returns status-change report summed by City
	*/
    private function displayStatusChangeReportByCity(Request $request, $exportToFile = false) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        $selected_statuses = $request->input('selected_statuses', []);

        $start_date = $request->input('start_date', null);
        $end_date = $request->input('end_date', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'cities.id',
            'cities.name as city_name',

            DB::Raw("count(distinct voter_support_status.voter_id) as count_voters_handled"),
            DB::Raw("count(action_history.id) as count_total_activity"),
        ];

        $countTotalVotersQuery = "(select count(voters_in_election_campaigns.id) from cities as cities2 ";
        $countTotalVotersQuery .= "join clusters on clusters.city_id=cities2.id and clusters.election_campaign_id=" . $last_campaign_id;
        $countTotalVotersQuery .= " join ballot_boxes on ballot_boxes.cluster_id=clusters.id ";
        $countTotalVotersQuery .= "join voters_in_election_campaigns on voters_in_election_campaigns.ballot_box_id=ballot_boxes.id ";
        $countTotalVotersQuery .= "where cities2.id=cities.id group by cities2.id)";

        $countTotalVotersField = $countTotalVotersQuery . " as voters_in_election_campaigns_count";
        $fields[] = DB::raw($countTotalVotersField);

        $percentSql = "count(distinct voter_support_status.voter_id) * 100/" . $countTotalVotersQuery . " ";
        $percentSql .= "as percent_voters_handled";
        $fields[] = DB::Raw($percentSql);

        if ( count($selected_statuses) > 0 ) {
            $resultStatuses = $this->getCountStatusesFields($selectedStatusesIds, $isSupportStausNoneSelected);
            $statusesFields = $resultStatuses['statusesFields'];
            $sumStatusesFields = $resultStatuses['sumStatusesFields'];

            $fields = array_merge($fields, $statusesFields);
        }

        $cityObj = City::select($fields)
            ->withClusters()
            ->withBallotBoxes()
            ->withSupportStatusChange();

        $where = [];

        if ( !is_null($ballot_id) ) {
            $where['ballot_boxes.id'] = $ballot_id;
        } else if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        } else if ( !is_null($sub_area_id) ) {
            $where['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $where['cities.area_id'] = $area_id;
        }

        $where['clusters.election_campaign_id'] = $last_campaign_id;

        $cityObj->where($where)
            ->where('voter_support_status.entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('action_history.created_at', '>=', $start_date . ' 00:00:00');

        if ( !is_null($end_date) ) {
            $cityObj->where('action_history.created_at', '<=', $end_date . ' 23:59:59');
        }

        $cityObj->groupBy('cities.id');

        $summaryFields = [
            DB::raw('sum(count_voters_handled) as sum_voters_handled'),
            DB::raw('sum(voters_in_election_campaigns_count) as sum_total_voters'),
            DB::raw('sum(count_total_activity) as sum_total_activity')
        ];

        $sumPercentField = 'sum(count_voters_handled) * 100 / sum(voters_in_election_campaigns_count) ';
        $sumPercentField .= 'as percent_sum_voters_handled';
        $summaryFields[] = DB::raw($sumPercentField);

        if ( count($selected_statuses) > 0 ) {
            $summaryFields = array_merge($summaryFields, $sumStatusesFields);
        }

        $summary = DB::table(DB::Raw('( ' . $cityObj->toSql() . ' ) AS t1'))
            ->setBindings([$cityObj->getBindings()])
            ->select($summaryFields)
            ->first();

        $sort_by_field = $request->input('sort_by_field', null);
        if ( !is_null($sort_by_field) ) {
            $sort_direction = $request->input('sort_direction', null);

            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $cityObj->orderBy($sort_by_field, 'asc');
            } else {
                $cityObj->orderBy($sort_by_field, 'desc');
            }
        }

        if ($exportToFile) {
            $cities = $cityObj->get();
        } else {
            $cities = $cityObj->skip($skip)->limit($limit)->get();
        }

        if ( count($selected_statuses) > 0 ) {
            $summaryFields = array_merge($summaryFields, $sumStatusesFields);
        }

        $total_records = DB::table(DB::Raw('( ' . $cityObj->toSql() . ' ) AS t1'))
            ->setBindings([$cityObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $cities,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Private helpful function that returns status-change report summed by Cluster
	*/
    private function displayStatusChangeReportByCluster(Request $request, $exportToFile = false) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        $selected_statuses = $request->input('selected_statuses', []);

        $start_date = $request->input('start_date', null);
        $end_date = $request->input('end_date', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'clusters.id',
            DB::raw($this->fullClusterNameQuery),

            DB::Raw("count(distinct voter_support_status.voter_id) as count_voters_handled"),
            DB::Raw("count(action_history.id) as count_total_activity"),
        ];

        $countTotalVotersQuery = "(SELECT COUNT(voters_in_election_campaigns.id) FROM clusters as clusters2 ";
        $countTotalVotersQuery .= "JOIN ballot_boxes ON ballot_boxes.cluster_id=clusters2.id ";
        $countTotalVotersQuery .= "JOIN voters_in_election_campaigns ON voters_in_election_campaigns.ballot_box_id=ballot_boxes.id ";
        $countTotalVotersQuery .= "where clusters2.id=clusters.id)";

        $countTotalVotersField = $countTotalVotersQuery . " as voters_in_election_campaigns_count";
        $fields[] = DB::raw($countTotalVotersField);

        $percentSql = "round(count(distinct voter_support_status.voter_id) * 100/" . $countTotalVotersQuery . ", 2) ";
        $percentSql .= "as percent_voters_handled";
        $fields[] = DB::Raw($percentSql);

        if ( count($selected_statuses) > 0 ) {
            $resultStatuses = $this->getCountStatusesFields($selectedStatusesIds, $isSupportStausNoneSelected);
            $statusesFields = $resultStatuses['statusesFields'];
            $sumStatusesFields = $resultStatuses['sumStatusesFields'];

            $fields = array_merge($fields, $statusesFields);
        }

        $clusterObj = Cluster::select($fields)
            ->withCity()
            ->withBallotBoxes()
            ->withSupportStatusChange();

        $where = [];

        if ( !is_null($ballot_id) ) {
            $where['ballot_boxes.id'] = $ballot_id;
        } else if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        } else if ( !is_null($sub_area_id) ) {
            $where['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $where['cities.area_id'] = $area_id;
        }

        $where['clusters.election_campaign_id'] = $last_campaign_id;

        $clusterObj->where($where)
            ->where('voter_support_status.entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('action_history.created_at', '>=', $start_date . ' 00:00:00');

        if ( !is_null($end_date) ) {
            $clusterObj->where('action_history.created_at', '<=', $end_date . ' 23:59:59');
        }

        if ( is_null($cluster_id)  ) {
            $clusterObj->groupBy('clusters.id');
        }

        $summaryFields = [
            DB::raw('sum(count_voters_handled) as sum_voters_handled'),
            DB::raw('sum(voters_in_election_campaigns_count) as sum_total_voters'),
            DB::raw('sum(count_total_activity) as sum_total_activity')
        ];

        $sumPercentField = 'round(sum(count_voters_handled) * 100 / sum(voters_in_election_campaigns_count), 2) ';
        $sumPercentField .= 'as percent_sum_voters_handled';
        $summaryFields[] = DB::raw($sumPercentField);

        if ( count($selected_statuses) > 0 ) {
            $summaryFields = array_merge($summaryFields, $sumStatusesFields);
        }

        $summary = DB::table(DB::Raw('( ' . $clusterObj->toSql() . ' ) AS t1'))
            ->setBindings([$clusterObj->getBindings()])
            ->select($summaryFields)
            ->first();

        $sort_by_field = $request->input('sort_by_field', null);
        if ( !is_null($sort_by_field) ) {
            $sort_direction = $request->input('sort_direction', null);

            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $clusterObj->orderBy($sort_by_field, 'asc');
            } else {
                $clusterObj->orderBy($sort_by_field, 'desc');
            }
        }

        if ($exportToFile) {
            $clusters = $clusterObj->get();
        } else {
            $clusters = $clusterObj->skip($skip)->limit($limit)->get();
        }

        $total_records = DB::table(DB::Raw('( ' . $clusterObj->toSql() . ' ) AS t1'))
            ->setBindings([$clusterObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $clusters,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Private helpful function that returns status-change report summed by BallotBox
	*/
    private function displayStatusChangeReportByBallot(Request $request, $exportToFile = false) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        $selected_statuses = $request->input('selected_statuses', []);

        $start_date = $request->input('start_date', null);
        $end_date = $request->input('end_date', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'ballot_boxes.id',
            'ballot_boxes.mi_id as ballot_box_name',

            DB::Raw("count(distinct voter_support_status.voter_id) as count_voters_handled"),
            DB::Raw("count(action_history.id) as count_total_activity")
        ];

        $percentSql = 'round(count(distinct voter_support_status.voter_id) * 100/(select count(*) from voters_in_election_campaigns ';
        $percentSql .= 'where voters_in_election_campaigns.ballot_box_id = ballot_boxes.id), 2) as percent_voters_handled';
        $fields[] = DB::Raw($percentSql);

        if ( count($selected_statuses) > 0 ) {
            $resultStatuses = $this->getCountStatusesFields($selectedStatusesIds, $isSupportStausNoneSelected);
            $statusesFields = $resultStatuses['statusesFields'];
            $sumStatusesFields = $resultStatuses['sumStatusesFields'];

            $fields = array_merge($fields, $statusesFields);
        }

        $ballotObj = BallotBox::select($fields)
            ->withCluster()
            ->withCity()
            ->withCount('votersInElectionCampaigns')
            ->withSupportStatusChange();

        $where = [];

        if ( !is_null($ballot_id) ) {
            $where['ballot_boxes.id'] = $ballot_id;
        } else if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        } else if ( !is_null($sub_area_id) ) {
            $where['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $where['cities.area_id'] = $area_id;
        }

        $where['clusters.election_campaign_id'] = $last_campaign_id;

        $ballotObj->where($where)
            ->where('voter_support_status.entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('action_history.created_at', '>=', $start_date . ' 00:00:00');

        if ( !is_null($end_date) ) {
            $ballotObj->where('action_history.created_at', '<=', $end_date . ' 23:59:59');
        }

        if ( is_null($ballot_id)  ) {
            $ballotObj->groupBy('ballot_boxes.id');
        }

        $summaryFields = [
            DB::raw('sum(count_voters_handled) as sum_voters_handled'),
            DB::raw('sum(voters_in_election_campaigns_count) as sum_total_voters'),
            DB::raw('sum(count_total_activity) as sum_total_activity')
        ];

        $sumPercentField = 'round(sum(count_voters_handled) * 100 / sum(voters_in_election_campaigns_count), 2) ';
        $sumPercentField .= 'as percent_sum_voters_handled';
        $summaryFields[] = DB::raw($sumPercentField);

        if ( count($selected_statuses) > 0 ) {
            $summaryFields = array_merge($summaryFields, $sumStatusesFields);
        }

        $summary = DB::table(DB::Raw('( ' . $ballotObj->toSql() . ' ) AS t1'))
            ->setBindings([$ballotObj->getBindings()])
            ->select($summaryFields)
            ->first();

        $sort_by_field = $request->input('sort_by_field', null);
        if ( !is_null($sort_by_field) ) {
            $sort_direction = $request->input('sort_direction', null);

            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $ballotObj->orderBy($sort_by_field, 'asc');
            } else {
                $ballotObj->orderBy($sort_by_field, 'desc');
            }
        }

        if ($exportToFile) {
            $ballots = $ballotObj->get();
        } else {
            $ballots = $ballotObj->skip($skip)->limit($limit)->get();
        }

        $total_records = DB::table(DB::Raw('( ' . $ballotObj->toSql() . ' ) AS t1'))
            ->setBindings([$ballotObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $ballots,
            'summary' => $summary
        ];
		if(sizeof($result['records']) == 0){
			$ballotBoxes = BallotBox::select('id' , 'mi_id as ballot_box_name' );
			if($cluster_id){
				$ballotBoxes = $ballotBoxes->where('cluster_id',$cluster_id);
			}
			if($ballot_id){
				$ballotBoxes = $ballotBoxes->where('id',$ballot_id);
			}
			$ballotBoxes = $ballotBoxes->get();
			if(sizeof($ballotBoxes) > 0){
				$result['total_records'] = sizeof($ballotBoxes);
				for($i = 0 ; $i< sizeof($ballotBoxes); $i++){
					$ballotBoxes[$i]->count_voters_handled = 0;
					$ballotBoxes[$i]->count_total_activity = 0;
					$ballotBoxes[$i]->percent_voters_handled = 0;
					$ballotBoxes[$i]->count_support_status1_up = 0;
					$ballotBoxes[$i]->count_support_status1_down = 0;
					$ballotBoxes[$i]->count_support_status2_up = 0;
					$ballotBoxes[$i]->count_support_status2_down = 0;
					$ballotBoxes[$i]->count_support_status3_up = 0;
					$ballotBoxes[$i]->count_support_status3_down = 0;
					$ballotBoxes[$i]->count_support_status4_up = 0;
					$ballotBoxes[$i]->count_support_status4_down = 0;
					$ballotBoxes[$i]->count_support_status5_up = 0;
					$ballotBoxes[$i]->count_support_status5_down = 0;
					$ballotBoxes[$i]->count_support_status_none_up = 0;
					$ballotBoxes[$i]->count_support_status_none_down = 0;
					$ballotBoxes[$i]->voters_in_election_campaigns_count = 0;
				}
				$result['records'] = $ballotBoxes;
			 	$result['summary'] = ["sum_voters_handled"=>0,"sum_total_voters"=>0,"sum_total_activity"=>0,"percent_sum_voters_handled"=>0,"sum_support_status1_up"=>0,"sum_support_status1_down"=>0,"sum_support_status2_up"=>0,"sum_support_status2_down"=>0,"sum_support_status3_up"=>0,"sum_support_status3_down"=>0,"sum_support_status4_up"=>0,"sum_support_status4_down"=>0,"sum_support_status5_up"=>0,"sum_support_status5_down"=>0,"sum_support_status_none_up"=>0,"sum_support_status_none_down"=>0 , "sum_total_activity"=>0];
			 
			}
			 
		}
		
        return $result;
    }

	/*
		Private helpful function that returns correct 'filterBy' string by POST params
	*/
    private function getFilterBy(Request $request) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);

        if ( !is_null($ballot_id) ) {
            return config('constants.status_change_report.summary_by.BY_BALLOT');
        } else if ( !is_null($cluster_id) ) {
            return config('constants.status_change_report.summary_by.BY_BALLOT');
        } else if ( !is_null($city_id) ) {
            return config('constants.status_change_report.summary_by.BY_CLUSTER');
        } else if ( !is_null($sub_area_id) ) {
            return config('constants.status_change_report.summary_by.BY_CITY');
        } else if ( !is_null($area_id) ) {
            return config('constants.status_change_report.summary_by.BY_CITY');
        }
    }

	/*
		Function that returns status-change report by POST params
	*/
    public function displayStatusChangeReport(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        if ( ($code = $this->validateStatusChangeReportData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($code);
            return;
        }

        $summary_by_id = $request->input('summary_by_id', null);

        switch ($summary_by_id) {
            case config('constants.status_change_report.summary_by.NONE'):
                $filterBy = $this->getFilterBy($request);
                switch ($filterBy) {
                    case config('constants.status_change_report.summary_by.BY_BALLOT'):
                        $result = $this->displayStatusChangeReportByBallot($request);
                        $jsonOutput->setData($result);
                        break;

                    case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                        $result = $this->displayStatusChangeReportByCluster($request);
                        $jsonOutput->setData($result);
                        break;

                    case config('constants.status_change_report.summary_by.BY_CITY'):
                        $result = $this->displayStatusChangeReportByCity($request);
                        $jsonOutput->setData($result);
                        break;
                }
                break;

            case config('constants.status_change_report.summary_by.BY_AREA'):
                $result = $this->displayStatusChangeReportByArea($request);
                $jsonOutput->setData($result);
                break;

            case config('constants.status_change_report.summary_by.BY_CITY'):
                $result = $this->displayStatusChangeReportByCity($request);
                $jsonOutput->setData($result);
                break;

            case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                $result = $this->displayStatusChangeReportByCluster($request);
                $jsonOutput->setData($result);
                break;

            case config('constants.status_change_report.summary_by.BY_BALLOT'):
                $result = $this->displayStatusChangeReportByBallot($request);
                $jsonOutput->setData($result);
                break;
        }
    }

	/*
		Private helpful function that formats data in order to export the support status change report
	*/
    private function convertStatusChangeReport(Request $request, $result) {
        $exportedRows = [];

        $geoFieldName = '';
        $geoFieldHeader = '';

        $systemSupportStatuses = SupportStatus::select(['id', 'name', 'key', 'level'])
            ->where(['deleted' => 0])
			->where('active',1)
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatusKey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatusKey] = $systemSupportStatuses[$stausIndex];
        }

        $selected_statuses = $request->input('selected_statuses', null);

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $summary_by_id = $request->input('summary_by_id', null);
        switch ($summary_by_id) {
            case config('constants.status_change_report.summary_by.NONE'):
                $filterBy = $this->getFilterBy($request);
                switch ($filterBy) {
                    case config('constants.status_change_report.summary_by.BY_BALLOT'):
                        $geoFieldName = 'ballot_box_name';
                        $geoFieldHeader = 'קלפי';
                        break;

                    case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                        $geoFieldName = 'cluster_name';
                        $geoFieldHeader = 'אשכול';
                        break;

                    case config('constants.status_change_report.summary_by.BY_CITY'):
                        $geoFieldName = 'city_name';
                        $geoFieldHeader = 'עיר';
                        break;
                }
                break;

            case config('constants.status_change_report.summary_by.BY_AREA'):
                $geoFieldName = 'area_name';
                $geoFieldHeader = 'איזור';
                break;

            case config('constants.status_change_report.summary_by.BY_CITY'):
                $geoFieldName = 'city_name';
                $geoFieldHeader = 'עיר';
                break;

            case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                $geoFieldName = 'cluster_name';
                $geoFieldHeader = 'אשכול';
                break;

            case config('constants.status_change_report.summary_by.BY_BALLOT'):
                $geoFieldName = 'ballot_box_name';
                $geoFieldHeader = 'קלפי';
                break;
        }

        $header1Row = [
            $geoFieldName => $geoFieldHeader
        ];

        if ($isSupportStausNoneSelected) {
            $countUpField = 'count_support_status_none_up';
            $header1Row[$countUpField] = 'ללא סטטוס';

            $countDownField = 'count_support_status_none_down';
            $header1Row[$countDownField] = '';
        }

        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey != config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $selectedStatusName = $systemSupportHashByKey[$selectedStatusKey]->name;
                $selectedStatusId = $systemSupportHashByKey[$selectedStatusKey]->id;

                $countUpField = 'count_support_status' . $selectedStatusId . '_up';
                $header1Row[$countUpField] = $selectedStatusName;

                $countDownField = 'count_support_status' . $selectedStatusId . '_down';
                $header1Row[$countDownField] = '';
            }
        }

        $header1Row['count_total_activity'] = 'סה"כ פעולות';
        $header1Row['count_voters_handled'] = 'תושבים שטופלו';
        $header1Row['voters_in_election_campaigns_count'] = 'סה"כ תושבים';
        $header1Row['percent_voters_handled'] = 'טופלו ב-%';

        $exportedRows[] = $header1Row;

        $header2Row = [
            $geoFieldName => ''
        ];

        if ($isSupportStausNoneSelected) {
            $header2Row['count_support_status_none_up'] = 'עלה';
            $header2Row['count_support_status_none_down'] = 'ירד';
        }

        for ( $statusIndex = 0; $statusIndex < count($selectedStatusesIds); $statusIndex++ ) {
            $supportStatusId = $selectedStatusesIds[$statusIndex];

            $countUpField = 'count_support_status' . $supportStatusId . '_up';
            $header2Row[$countUpField] = 'עלה';

            $countDownField = 'count_support_status' . $supportStatusId . '_down';
            $header2Row[$countDownField] = 'ירד';
        }

        $header2Row['count_total_activity'] = '';
        $header2Row['count_voters_handled'] = '';
        $header2Row['voters_in_election_campaigns_count'] = '';
        $header2Row['percent_voters_handled'] = '';

        $exportedRows[] = $header2Row;

        $summary = $result['summary'];

        $summaryRow = [
            $geoFieldName => 'סה"כ'
        ];

        if ($isSupportStausNoneSelected) {
            $summaryRow['count_support_status_none_up'] = $summary->sum_support_status_none_up;
            $summaryRow['count_support_status_none_down'] = $summary->sum_support_status_none_down;
        }

        for ( $statusIndex = 0; $statusIndex < count($selectedStatusesIds); $statusIndex++ ) {
            $supportStatusId = $selectedStatusesIds[$statusIndex];

            $countUpField = 'count_support_status' . $supportStatusId . '_up';
            $sumUpField = 'sum_support_status' . $supportStatusId . '_up';
            $summaryRow[$countUpField] = $summary->{$sumUpField};

            $countDownField = 'count_support_status' . $supportStatusId . '_down';
            $sumDownField = 'sum_support_status' . $supportStatusId . '_down';
            $summaryRow[$countDownField] = $summary->{$sumDownField};
        }

 
			$summary =  self::arrayToObject($summary);
		 
        $summaryRow['count_total_activity'] = $summary->sum_total_activity;
        $summaryRow['count_voters_handled'] = $summary->sum_voters_handled;
        $summaryRow['voters_in_election_campaigns_count'] = $summary->sum_total_voters;
        $summaryRow['percent_voters_handled'] = $summary->percent_sum_voters_handled;

        $exportedRows[] = $summaryRow;

        $records = $result['records']->toArray();
        for ($rowIndex = 0; $rowIndex < count($records); $rowIndex++) {
            $newRow = [
                $geoFieldName => $records[$rowIndex][$geoFieldName]
            ];

            if ($isSupportStausNoneSelected) {
                $newRow['count_support_status_none_up'] = $records[$rowIndex]['count_support_status_none_up'];
                $newRow['count_support_status_none_down'] = $records[$rowIndex]['count_support_status_none_down'];
            }

            for ( $statusIndex = 0; $statusIndex < count($selectedStatusesIds); $statusIndex++ ) {
                $supportStatusId = $selectedStatusesIds[$statusIndex];

                $countUpField = 'count_support_status' . $supportStatusId . '_up';
                $newRow[$countUpField] = $records[$rowIndex][$countUpField];

                $countDownField = 'count_support_status' . $supportStatusId . '_down';
                $newRow[$countDownField] = $records[$rowIndex][$countDownField];
            }

            $newRow['count_total_activity'] = $records[$rowIndex]['count_total_activity'];
            $newRow['count_voters_handled'] = $records[$rowIndex]['count_voters_handled'];
            $newRow['voters_in_election_campaigns_count'] = $records[$rowIndex]['voters_in_election_campaigns_count'];
            $newRow['percent_voters_handled'] = $records[$rowIndex]['percent_voters_handled'];

            $exportedRows[] = $newRow;
        }

        return $exportedRows;
    }

	/*
		Function that exports status-change report into file or PRINT
	*/
    public function exportStatusChangeReport(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        if ( ($code = $this->validateStatusChangeReportData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($code);
            return;
        }

        $jsonOutput->setBypass(true);

        $result = [
            'total_records' => 0,
            'records' => [],
            'summary' => []
        ];

        $summary_by_id = $request->input('summary_by_id', null);
        switch ($summary_by_id) {
            case config('constants.status_change_report.summary_by.NONE'):
                $filterBy = $this->getFilterBy($request);
                switch ($filterBy) {
                    case config('constants.status_change_report.summary_by.BY_BALLOT'):
                        $result = $this->displayStatusChangeReportByBallot($request, true);
                        break;

                    case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                        $result = $this->displayStatusChangeReportByCluster($request, true);
                        break;

                    case config('constants.status_change_report.summary_by.BY_CITY'):
                        $result = $this->displayStatusChangeReportByCity($request, true);
                        break;
                }
                break;

            case config('constants.status_change_report.summary_by.BY_AREA'):
                $result = $this->displayStatusChangeReportByArea($request, true);
                break;

            case config('constants.status_change_report.summary_by.BY_CITY'):
                $result = $this->displayStatusChangeReportByCity($request, true);
                break;

            case config('constants.status_change_report.summary_by.BY_CLUSTER'):
                $result = $this->displayStatusChangeReportByCluster($request, true);
                break;

            case config('constants.status_change_report.summary_by.BY_BALLOT'):
                $result = $this->displayStatusChangeReportByBallot($request, true);
                break;
        }

        $file_type = $request->input('file_type', null);

        $data = $this->convertStatusChangeReport($request, $result);
        return ExportService::export($data, $file_type);
    }
}