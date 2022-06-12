<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Models\Tm\CallNote;
use App\Models\Tm\Question;
use App\Models\Tm\VotersAnswer;
use App\Models\Tm\Call;
use App\Models\Tm\Campaign;
use App\Models\Tm\PossibleAnswer;

use App\Models\Voters;
use App\Models\VoterSupportStatus;
use App\Models\VoterVotes;
use App\Models\VoterPhone;
use App\Models\ElectionRolesByVoters;
use App\Models\Message;
use App\Models\VoterMetas;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\ElectionCampaigns;
use App\Models\City;
use App\Models\Streets;
use App\Models\VoterMetaKeys;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\GeneralEmail;
use Carbon\Carbon;

use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\VoterController;

use App\Libraries\Helper;
use App\Libraries\Address;
use App\API\Sms\Sms;


use App\Libraries\Services\CampaignService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class CallController extends Controller {

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.'
    ];
    /* Calls */

	/*
		Function that returns all list of calls
	*/
    public function getCalls() {
        $jsonOutput = app()->make("JsonOutput");
        $result = Call::all();
        $jsonOutput->setData($result);
    }
    
	/*
		Function that returns call details by call key
	*/
    public function getCallDetails($key) {
        $jsonOutput = app()->make("JsonOutput");
        $call = Call::findByKey($key);
        $jsonOutput->setData($call);
    }

	/*
		Function that deletes call by its key
	*/
    public function deleteCall($key) {
        $jsonOutput = app()->make("JsonOutput");
        if($key) {
            $call = Call::findByKey($key);
            $call->delete();
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that updates call by its key and POST params
	*/
    public function updateCall(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $call = Call::findByKey($key);
            $call->update($request->all());
            $jsonOutput->setData($call->fresh());
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }

	/*
		Function that add new call by POST params
	*/
    public function addCall(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $call = Call::create($request->all());
        $jsonOutput->setData($call->fresh());
    }

	/*
		Function that update call's status to finished via POST request params
	*/
    public function finishCall(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        $call = Call::findByKey($key);
        $call->update($request->all());
        $jsonOutput->setData($call/*->fresh()*/); // removed because it was freezing up
    }

	/*
		Private helpful unction that returns all household members by voter_id , household_id and campaign_id
	*/
    private function getVoterHousehold($voterId, $voterHouseholdId, $lastCampaignId) {
        $householdFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name',
            'voters.birth_date',
            'vss.support_status_id as support_status_tm',
            \DB::raw('CASE WHEN votes.id IS NOT NULL THEN true ELSE false END as vote_status'),
            \DB::raw('CASE WHEN voter_transportations.id IS NOT NULL THEN true ELSE false END as needs_transportation')
        ];

        $voterHouseholds = Voters::select($householdFields)
                                 ->with(['phones' => function ( $query ) {
                                      $query->select(['voter_id', 'id', 'key', 'phone_type_id', 'phone_number'])
                                            ->where('wrong', 0);
                                   }])
                                 ->withTmSupportStatus($lastCampaignId, true)
                                 ->withElectionVotes($lastCampaignId, true)
                                 ->withElectionTransportation($lastCampaignId, true)
                                 ->where('voters.household_id', $voterHouseholdId)
                                 ->where('voters.id', '<>', $voterId)
                                 ->get();

        return $voterHouseholds;
    }

	/*
		Private helpful unction that converts household into array-hash representation
	*/
    private function convertVoterHouseholdToHash($voterHouseholds) {
        $voterHouseholdHash = [];

        for ( $householdIndex = 0; $householdIndex < count($voterHouseholds); $householdIndex++) {
            $householdKey = $voterHouseholds[$householdIndex]->key;

            $phones = [];
            for ( $phoneIndex = 0; $phoneIndex < count($voterHouseholds[$householdIndex]->phones); $phoneIndex++ ) {
                $phoneKey = $voterHouseholds[$householdIndex]->phones[$phoneIndex]->key;

                $phones[$phoneKey] = [
                    'id'  => $voterHouseholds[$householdIndex]->phones[$phoneIndex]->id,
                    'key' => $phoneKey,
                    'phone_number' => $voterHouseholds[$householdIndex]->phones[$phoneIndex]->phone_number
                ];
            }

            $voterHouseholdHash[$householdKey] = [
                'id' =>  $voterHouseholds[$householdIndex]->id,
                'key' => $householdKey,
                'support_status_tm' => $voterHouseholds[$householdIndex]->support_status_tm,
                'vote_status' => $voterHouseholds[$householdIndex]->vote_status,
                'phones' => $phones
            ];
        }

        return $voterHouseholdHash;
    }

	/*
		Function that return voter-driver role by voterId and electionCampaignId
	*/
    public function getVoterDrivers($voterId, $lastCampaignId) {
        $electionFilelds = [
            'ballot_boxes.cluster_id'
        ];
        $electionWhere =  [
            'voter_id' => $voterId,
            'election_campaign_id' => $lastCampaignId
        ];
        $voterInElections = VotersInElectionCampaigns::select($electionFilelds)
        ->withCluster()->where($electionWhere)->first();
        $drivers = [];
        if($voterInElections && $voterInElections->cluster_id){ // If voter exist in current election campaign
            
            $fields = [
                'election_roles_by_voters.id',
                'election_roles_by_voters.phone_number',
                'voters.first_name',
                'voters.last_name'
            ];

            $where = [
                'election_roles_by_voters.election_campaign_id' => $lastCampaignId,
                'election_roles.system_name' => config('constants.activists.election_role_system_names.driver'),
                'election_roles_by_voters.verified_status' => 1,
                'election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                'election_role_by_voter_geographic_areas.entity_id' => $voterInElections->cluster_id
            ];

            $drivers = ElectionRolesByVoters::select($fields)->withVoter()->withElectionRole()->WithGeographic()->where($where)->get();
        }

        return $drivers;
    }

	/*
		Private helpful function that returns voter's meta values by voterId and lastCampaignId
	*/
    private function getVoterMetaValues($voterId, $lastCampaignId) {
        $fields = ['id', 'voter_meta_key_id', 'voter_meta_value_id'];

        $where = [
            'voter_id' => $voterId,
            'election_campaign_id' => $lastCampaignId
        ];

        $voterMetaValues = VoterMetas::select($fields)->where($where)->get();

        return $voterMetaValues;
    }

	/*
		Function the returns voter data by key parameter
	*/
    public function getVoter($key) {
        $jsonOutput = app()->make("JsonOutput");

        $callObj = Call::select(['id', 'voter_id'])->where('key', $key)->first();
        if ( null == $callObj ) {
            $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
            return;
        }

        $voterId = $callObj->voter_id;

        $voterFields = [
            'voters.id',
            'voters.household_id',
            'voters.city_id',
            'voters.street_id',
            'voters.house_entry',
            'voters.neighborhood',
            'voters.zip',
            'voters.mark',
            'voters.distribution_code',
            'voters.actual_address_correct',

            'voters.contact_via_email',

            'mi_city',
            'mi_city_id',
            'mi_cities.name as mi_city_name',
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

            'vssFinal.support_status_id as support_status_final',

            \DB::raw('CASE WHEN voter_transportations.id IS NOT NULL THEN true ELSE false END as needs_transportation'),
            \DB::raw('CASE WHEN voter_transportations.from_time IS NOT NULL THEN true ELSE false END as from_time'),
            \DB::raw('CASE WHEN voter_transportations.to_time IS NOT NULL THEN true ELSE false END as to_time'),
            \DB::raw('CASE WHEN voter_transportations.cripple IS NOT NULL THEN true ELSE false END as cripple')
        ];

        $lastCampaignId = ElectionCampaigns::currentCampaign()->id;

        $voterObj = Voters::select($voterFields)->withMiCity()->withMiStreet(true)
                          ->withElectionTransportation($lastCampaignId, true)
                          ->withFinalSupportStatus($lastCampaignId, true)
                          ->where('voters.id', $voterId)->first();
        $voterHouseholdId = $voterObj->household_id;

        $voterHouseholds = $this->getVoterHousehold($voterId, $voterHouseholdId, $lastCampaignId);

        $data = [
            'details' => $voterObj,
            'household' => $voterHouseholds,
            'drivers' => $this->getVoterDrivers($voterId, $lastCampaignId),
            'voterMetaData' => $this->getVoterMetaValues($voterId, $lastCampaignId)
        ];

        $jsonOutput->setData($data);
    }

	/*
		Private helpful function that gets callid and note , and updates the note for call id
	*/
    private function saveCallNote($callId, $note, $supportStatusTm, $previous_support_status_id) {
        $data = [
            'key' => Helper::getNewTableKey('call_notes', 10),
            'call_id' => $callId,
            'note' =>  $note,
            'support_status_id' =>  $supportStatusTm,
            'previous_support_status_id' =>  $previous_support_status_id
        ];
        CallNote::insert($data);
    }

	/*
		Private helpful function that gets callid and callEndStatus , and updates the callEndStatus for call id
	*/
    private function saveEndStatusItem($callId, $endCallStatus, $endCallStatusItem) {
        $data = [
            'key' => Helper::getNewTableKey('call_notes', 10),
            'call_id' => $callId
        ];

        if ($endCallStatus == config('tmConstants.call.status.GET_BACK')) {
            $data['call_me_later'] = 1;
            $data['call_me_later_time'] = $endCallStatusItem['datetime'];
        }else if ($endCallStatus == config('tmConstants.call.status.LANGUAGE')){
            $data['language_id'] = $endCallStatusItem['language_select'];
        }

        CallNote::insert($data);
    }

	/*
		Private helpful function that gets datetime and format , and validates the datetime by the format
	*/
    private function validateDate($dateTime, $format) {
        $rules = [
            'datetime' => 'date_format:' . $format
        ];

        $validator = Validator::make(['datetime' => $dateTime], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('dateTime');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates endCallStatus
	*/
    private function validateEndStatusItems($endCallStatus, $endCallStatusItem) {
        if ( $endCallStatus == config('tmConstants.call.status.GET_BACK') ) {
            if ( is_null($endCallStatusItem) ) {
                return false;
            } else if ( !isset($endCallStatusItem['datetime']) ) {
                return false;
            } else {
                return $this->validateDate($endCallStatusItem['datetime'], 'Y-m-d H:i:s');
            }
        }

        return true;
    }

	/*
		Private helpful function that saves for question in call the answers - MULTI ANSWERS
	*/
    private function saveMultiAnswers4Question($callId, $voterId, $questionId, $voterAnswerArr, $questionObj, $lastElectionCampaignId, &$newSupportStatus) {
        $insertData = [];

        foreach($voterAnswerArr as $voterAnswer){
            $possibleAnswerKey = $voterAnswer['possibleAnswerKey'];
            $possibleAnswerId = $questionObj[$possibleAnswerKey]->id;
            $support_status_id = $questionObj[$possibleAnswerKey]->support_status_id;
            if( $support_status_id){
                $newSupportStatus = $support_status_id;
            }

            $insertData[] = [
                'key'                => Helper::getNewTableKey('voters_answers', 10),
                'question_id'        => $questionId,
                'possible_answer_id' => $possibleAnswerId,
                'answer_text'        => $voterAnswer['answerText'],
                'answered'           => 1,
                'voter_id'           => $voterId,
                'call_id'            => $callId
            ];
        }

        VotersAnswer::insert($insertData);
    }

	
	/*
		Private helpful function that saves for question in call the answers - ONE ANSWER
	*/
    private function saveOneAnswer4Question($callId, $voterId, $questionId, $voterAnswerObj, $questionObj, $lastElectionCampaignId, &$newSupportStatusFromQuestion) {
        if ( isset($voterAnswerObj['possibleAnswerKey']) ) {
            $possibleAnswerKey = $voterAnswerObj['possibleAnswerKey'];

            $possibleAnswerId = $questionObj[$possibleAnswerKey]->id;
        } else {
            $possibleAnswerId = null;
        }

        $voterAnswer = new VotersAnswer;
        $voterAnswer->key = Helper::getNewTableKey('voters_answers', 10);
        $voterAnswer->question_id = $questionId;
        $voterAnswer->possible_answer_id = $possibleAnswerId;
        $voterAnswer->answer_text = $voterAnswerObj['answerText'];
        $voterAnswer->answered = 1;
        $voterAnswer->voter_id = $voterId;
        $voterAnswer->call_id = $callId;

        $voterAnswer->save();

        if ($possibleAnswerId) {
            $possibleAnswer = PossibleAnswer::select('id', 'support_status_id')
                            ->where('id', $possibleAnswerId)
                            ->first();
            if ($possibleAnswer && !is_null($possibleAnswer->support_status_id)) {
                $newSupportStatusFromQuestion = $possibleAnswer->support_status_id;
            }
        }
    }

	/*
		Private helpful function that saves unsaved question in call
	*/
    private function saveUnAnsweredQuestion($callId, $voterId, $questionId) {
        $voterAnswer = new VotersAnswer;

        $voterAnswer->key = Helper::getNewTableKey('voters_answers', 10);
        $voterAnswer->question_id = $questionId;
        $voterAnswer->voter_id = $voterId;
        $voterAnswer->answered = 0;
        $voterAnswer->call_id = $callId;

        $voterAnswer->save();
    }

	/*
		Private helpful function that get as parameter an array , and returns whether it is associative or not
	*/
    private function isAssocArray(array $arr) {
        foreach(array_keys($arr) as $key) {
            if ( !is_int($key) ) {
                return true;
            }
        }

        return false;
    }

	/*
		Private helpful function that gets answer of voter  , and question object , and returns whether it's valid answer or not - SINGLE ANSWER
	*/
    private function validateObjAnswerPossibleKey($voterAnswerObj, $questionObj) {
        $possibleAnswerKey = $voterAnswerObj['possibleAnswerKey'];

        if (isset($questionObj[$possibleAnswerKey])) {
            return true;
        } else {
            return false;
        }
    }

	/*
		Private helpful function that gets answers array of voter  , and question object , and returns whether they're valid answers or not - MULTI ANSWERS
	*/
    private function validateQuestionWithMultiAnswers($voterAnswerArr, $questionObj) {
        for ( $answerIndex = 0; $answerIndex < count($voterAnswerArr); $answerIndex++ ) {
            if ( !$this->validateObjAnswerPossibleKey($voterAnswerArr[$answerIndex], $questionObj) ) {
                return false;
            }
        }

        return true;
    }

	/*
		Private helpful function that gets voterHouseholdsHash and householdId , and verifies if householdId exists in the Hash
	*/
    private function validateHousehold($voterHouseholdHash, $household) {
        for ( $householdIndex = 0; $householdIndex < count($household); $householdIndex++ ) {
            $householdKey = $household[$householdIndex]['key'];

            if ( !is_null($householdKey) && !isset($voterHouseholdHash[$householdKey]) ) {
                return config('errors.tm.HOUSEHOLD_DOES_NOT_EXIST');
            }

            for ( $phoneIndex = 0; $phoneIndex < count($household[$householdIndex]['phones']); $phoneIndex++ ) {
                $phoneKey = $household[$householdIndex]['phones'][$phoneIndex]['key'];
                $phoneNumber = $household[$householdIndex]['phones'][$phoneIndex]['phone_number'];

                if ( !is_null($phoneKey) && !isset($voterHouseholdHash[$householdKey]['phones'][$phoneKey]) ) {
                    return config('errors.tm.PHONE_DOES_NOT_BELONG_TO_HOUSEHOLD');
                }

                $phoneToCheck = str_replace('-', '', $phoneNumber);
                if (!Helper::isIsraelLandPhone($phoneToCheck) && !Helper::isIsraelMobilePhone($phoneToCheck)) {
                    return config('errors.tm.PHONE_NUMBER_IS_NOT_VALID');
                }
            }
        }

        return config('constants.SUCCESS');
    }

	/*
		Private helpful function that gets householdID , oldPhones and newPhones , and adds in correct way the new phones to all household's voters
	*/
    private function saveHouseholdPhones($householdId, $oldPhones, $newPhones) {
        $voterCurrentPhones = $oldPhones;

        for ( $phoneIndex = 0; $phoneIndex < count($newPhones); $phoneIndex++ ) {
            $phoneKey = $newPhones[$phoneIndex]['key'];
            $phoneNumber = str_replace('-', '', $newPhones[$phoneIndex]['phone_number']);

            if ( Helper::isIsraelMobilePhone($phoneNumber) ) {
                $phoneTypeId = config('constants.PHONE_TYPE_MOBILE');
            } else {
                $phoneTypeId = config('constants.PHONE_TYPE_HOME');
            }

            if ( is_null($phoneKey) ) {
                $data = [
                    'key' => Helper::getNewTableKey('voter_phones', 10),
                    'phone_type_id' => $phoneTypeId,
                    'phone_number' => $newPhones[$phoneIndex]['phone_number'],
                    'voter_id' => $householdId
                ];

                VoterPhone::insert($data);
            } else {
                if ($oldPhones[$phoneKey]['phone_number'] != $newPhones[$phoneIndex]['phone_number']) {
                    $voterPhoneId = $oldPhones[$phoneKey]['id'];

                    VoterPhone::where('id', $voterPhoneId)->update(['phone_number' => $phoneNumber]);
                }

                unset($voterCurrentPhones[$phoneKey]);
            }
        }

        $phonesToDelete = [];
        if ( count($voterCurrentPhones) > 0 ) {
            foreach ($voterCurrentPhones as $phoneKey => $value) {
                $phonesToDelete[] = $voterCurrentPhones[$phoneKey]['id'];
            }
        }

        if ( count($phonesToDelete) > 0 ) {
            VoterPhone::whereIn('id', $phonesToDelete)->delete();
        }
    }

	/*
		Private helpful function that saves vote per household
	*/
    private function saveHouseholdVote($lastCampaignId, $householdId, $oldVote, $newVote) {
        if ( 0 == $oldVote ) {
            if ( $newVote   ) {
                $data = [
                    'key' => Helper::getNewTableKey('votes', 10),
                    'voter_id' => $householdId,
                    'election_campaign_id' => $lastCampaignId,
                    'vote_source_id' => config('constants.VOTE_SOURCE_TM')
                ];
			 
                VoterVotes::insert($data);
            }
        } else {
            $where = [
                'election_campaign_id' => $lastCampaignId,
                'voter_id' => $householdId
            ];

            if ( $newVote != true ) {
                VoterVotes::where($where)->delete();
            }
        }
    }

	/*
		Private helpful function that updates support status to whole household
	*/
    private function saveHouseholdSupportStatus($lastCampaignId, $householdId, $oldSupportStatusTm, $newSupportStatusTm) {
        if ( is_null($oldSupportStatusTm) ) {
            if ( !is_null($newSupportStatusTm) ) {
                $data = [
                    'key' => Helper::getNewTableKey('voter_support_status', 10),
                    'election_campaign_id' => $lastCampaignId,
                    'voter_id' => $householdId,
                    'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
                    'support_status_id' => $newSupportStatusTm,
                    'create_user_id' => Auth::user()->id,
                    'update_user_id' => Auth::user()->id
                ];

                VoterSupportStatus::insert($data);
            }
        } else {
            $where = [
                'election_campaign_id' => $lastCampaignId,
                'voter_id' => $householdId,
                'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')
            ];

            if ( is_null($newSupportStatusTm)) {
                VoterSupportStatus::where($where)->delete();
            } else if ( $oldSupportStatusTm != $newSupportStatusTm ) {
                VoterSupportStatus::where($where)->update([
                    'support_status_id' => $newSupportStatusTm,
                    'update_user_id'    => Auth::user()->id
                    ]);
            }
        }
    }

	
	/*
		Private helpful function that saves all types of data to household
	*/
    private function saveHousehold($voterHouseholdHash, $household) {
 
        $lastCampaignId = ElectionCampaigns::currentCampaign()->id;
		 
        for ( $householdIndex = 0; $householdIndex < count($household); $householdIndex++ ) {
		 
            $householdKey = $household[$householdIndex]['key'];
            $householdId = $voterHouseholdHash[$householdKey]['id'];

            $oldSupportStatusTm = $voterHouseholdHash[$householdKey]['support_status_tm'];
            $newSupportStatusTm = $household[$householdIndex]['support_status_tm'];

            $oldVote = $voterHouseholdHash[$householdKey]['vote_status'];
            $newVote = $household[$householdIndex]['vote_status'];

            $this->saveHouseholdSupportStatus($lastCampaignId, $householdId, $oldSupportStatusTm, $newSupportStatusTm);
            $this->saveHouseholdVote($lastCampaignId, $householdId, $oldVote, $newVote);
            $this->saveHouseholdPhones($householdId, $voterHouseholdHash[$householdKey]['phones'], $household[$householdIndex]['phones']);
        }
    }

	/*
		Private helpful function that validates address
	*/
    private function validateAddress($address, $addressObj) {
        $cityId = isset($address['city_id'])? $address['city_id'] : 0;
        $streetId = isset($address['street_id'])? $address['street_id'] : null;
        $flat = isset($address['flat'])? $address['flat'] : null;
        $zip = isset($address['zip'])? $address['zip'] : null;
        $distributionCode = isset($address['distribution_code'])? $address['distribution_code'] : null;
        $actualAddressCorrect = isset($address['actual_address_correct'])? $address['actual_address_correct'] : null;

        if (!$addressObj->validateCity($cityId)) {
            return config('errors.elections.INVALID_CITY');
        }

        if (!is_null($streetId) && !$addressObj->validateStreet($streetId)) {
            return config('errors.elections.STREET_NAME_NOT_VALID');
        }

        if (!is_null($flat) && !$addressObj->validateFlat($flat)) {
            return config('errors.elections.INVALID_FLAT');
        }

        if (!is_null($zip) && !$addressObj->validateZip($zip)) {
            return config('errors.elections.INVALID_ZIP');
        }

        if (!is_null($distributionCode) && !$addressObj->validateDistributionCode($distributionCode)) {
            return config('errors.elections.INVALID_DISTRIBUTION_CODE');
        }

        if (!is_null($actualAddressCorrect) && !in_array($actualAddressCorrect, [0, 1])) {
            return config('errors.elections.INVALID_ACTUAL_ADDRESS_CORRECT');
        }

        return config('constants.SUCCESS');
    }

	/*
		Private helpful function that validates time 
	*/
    private function validateTime( $fieldName, $fieldValue ) {
        $format = 'H:i:s';

        $rules = [
            $fieldName => 'date_format:' . $format
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that updates transportation to voter
	*/
    private function updateTransportation($voterId, $lastCampaignId, $transportation, $voterHousehold) {
        if (!isset($transportation['needs_transportation'])) return;
        $voterHouseholdIds = [];
		$fieldsArray = [];
        for ( $householdIndex = 0; $householdIndex < count($voterHousehold); $householdIndex++ ) {
            $voterHouseholdIds[] = $voterHousehold[$householdIndex]->id;
        }

        $deleteIds = array_merge($voterHouseholdIds, [$voterId]);
        VoterTransportation::whereIn('voter_id', $deleteIds)->delete();

        if ( $transportation['needs_transportation'] == 1 ) {
            $insertData = [];
			$fieldsArray[] = [
                    'field_name' => 'has_transport',
                    'display_field_name' => 'הסעה',
					'old_value' => '' , 
					'new_value' => 'כן' , 
					'old_numeric_value' => 0 , 
					'new_numeric_value' => 1
					];
			$fromTime = null;
			$toTime = null;
			if($transportation['from_time'] != '0:0:00' && $transportation['to_time'] != '0:0:00')
			{
				if ( $transportation['from_time'] >  $transportation['to_time'] ) {
					$fromTime = $transportation['to_time'];
					$toTime = $transportation['from_time'];
				} else {
					$fromTime = $transportation['from_time'];
					$toTime = $transportation['to_time'];
				}
			}
			elseif($transportation['from_time'] != '0:0:00'){
				$fromTime = $transportation['from_time'];
			}
			elseif($transportation['to_time'] != '0:0:00'){
				$toTime = $transportation['to_time'];
			}
            
			
			if($fromTime){
				$fieldsArray[] = [
                    'field_name' => 'from_time',
                    'display_field_name' => 'משעת הסעה',
					'old_value' => '' , 
					'new_value' => $fromTime 
					];
			}
			if($toTime){	
				$fieldsArray[] = [
                    'field_name' => 'to_time',
                    'display_field_name' => 'עד שעת הסעה',
					'old_value' => '' , 
					'new_value' => $toTime 
					];
			}

            $insertData[] = [
                'key' => Helper::getNewTableKey('voter_transportations', 5),
                'election_campaign_id' => $lastCampaignId,
                'voter_id' => $voterId,
                'cripple' => $transportation['cripple'],
                'from_time' => $fromTime,
                'to_time' => $toTime
            ];

            for ( $householdIndex = 0; $householdIndex < count($voterHouseholdIds); $householdIndex++ ) {
                $insertData[] = [
                    'key' => Helper::getNewTableKey('voter_transportations', 5),
                    'election_campaign_id' => $lastCampaignId,
                    'voter_id' => $voterHouseholdIds[$householdIndex],
                    'cripple' => 0,
                    'from_time' => $fromTime,
                    'to_time' => $toTime
                ];
            }

            VoterTransportation::insert($insertData);
			
			if(count( $fieldsArray) > 0 ){
					return ([
								'referenced_model' => 'VoteTransportation',
								'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
								'referenced_id' => $voterId,
								'valuesList' => $fieldsArray,
							]);
			}
        }
    }

	/*
		Private helpful function that validates transportation data
	*/
    private function validateTransportation($transportation, $voterHousehold) {
	 
        if (!isset($transportation['needs_transportation']) || !in_array($transportation['needs_transportation'], [0, 1]) ) {
            return config('errors.elections.INVALID_NEEDS_TRANSPORTATION');
        }
	 
        if ( $transportation['needs_transportation'] == 0 ) {
            return config('constants.SUCCESS');
        }
		 
 
        if ( $transportation['from_time'] != '00:00:00' && !$this->validateTime('from_time', $transportation['from_time']) ) {
            return config('errors.elections.INVALID_TIME_TRANSPORTATION');
        }
        if ( $transportation['to_time'] != '00:00:00' &&  !$this->validateTime('to_time', $transportation['to_time']) ) {
            return config('errors.elections.INVALID_TIME_TRANSPORTATION');
        }
        if ( count($transportation['passengers'] == 0) ) {
            return config('constants.SUCCESS');
        }
        $voterHouseholdIds = [];
        for ( $householdIndex = 0; $householdIndex < count($voterHousehold); $householdIndex++ ) {
            $voterHouseholdIds[] = $voterHousehold[$householdIndex]->id;
        }

        // Validating that transport passengers
        // are part of the voter's household
        $containsSearch = count(array_intersect($transportation['passengers'], $voterHouseholdIds));
        if ( count($containsSearch) != count($voterHouseholdIds) ) {
            return config('errors.elections.INVALID_PASSENGERS_TRANSPORTATION');
        }

        return config('constants.SUCCESS');
    }

	/*
		Private helpful function that updates voter's address
	*/
    private function updateVoterAddress($address, $addressObj, $voterId) {
        $cityObj = City::select(['key', 'name'])->where(['id' => $address['city_id'], 'deleted' => 0])->first();
        $streetObj = Streets::select(['name'])->where(['id' => $address['street_id'], 'deleted' => 0])->first();
        if ( null == $streetObj ) {
            $streetName = null;
        } else {
            $streetName = $streetObj->name;
        }

        $addressObj->city_id = $address['city_id'];
        $addressObj->city_key = $cityObj->key;
        $addressObj->city_name = $cityObj->name;
        $addressObj->street_id = $address['street_id'];
        $addressObj->street_name = $streetName;
        $addressObj->street = null;
        $addressObj->neighborhood = $address['neighborhood'];
        $addressObj->house = $address['house'];
        $addressObj->house_entry = $address['house_entry'];
        $addressObj->flat = $address['flat'];
        $addressObj->zip = $address['zip'];
        $addressObj->distribution_code = $address['distribution_code'];
        $addressObj->actual_address_correct = $address['actual_address_correct'];

        return VoterController::updateVoterAddress($addressObj, $voterId, false, ['returnOnly' => true]);
    }

	/*
		Private helpful function that validates given TM support status
	*/
    private function validateSupportStatus( $supportStatusTm ) {
        $rules = [
            'support_status_tm' => 'integer|exists:support_status,id'
        ];

        $validator = Validator::make( ['support_status_tm' => $supportStatusTm ], $rules );
        if ( $validator->fails() ) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that updates TM support status of voter in last election campaign
	*/
    private function updateSupportStatusTm($voterId, $currentCampaign, $newSupportStatusFromQuestion, $supportStatusTmFromRequest) {
        $where = [
            'election_campaign_id' => $currentCampaign,
            'voter_id' => $voterId,
            'entity_type' => config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
            'deleted' => 0
        ];
        $existingSupportStatus = VoterSupportStatus::select([
                'id','voter_id', 'support_status_id', 'entity_type', 'election_campaign_id'
            ])->where($where)->first();

        $historyModel = null;
        $saveHistoryModel = false;
        $referencedModelId = null;

        $prevSupportStatus = null;
        $newSupportStatusTmId = null;
        if ($existingSupportStatus) {
            $prevSupportStatus = $existingSupportStatus->support_status_id;

                if(!is_null( $supportStatusTmFromRequest) && ($supportStatusTmFromRequest != $prevSupportStatus)){ // User changed manually the support status
                    $newSupportStatusTmId = $supportStatusTmFromRequest;
                } else { // User changed the support status by questions
                    $newSupportStatusTmId = $newSupportStatusFromQuestion;
                }
                if($newSupportStatusTmId){
                    $existingSupportStatus->support_status_id = $newSupportStatusTmId;
                    $existingSupportStatus->update_user_id = Auth::user()->id;
                    $existingSupportStatus->save();
    
                    $actionType = 'EDIT';                     
                    $saveHistoryModel = true;
                    $referencedModelId = $existingSupportStatus->id;
                }

        } else { // If support status not changed:
                $newSupportStatusTmId = !is_null( $supportStatusTmFromRequest) ? $supportStatusTmFromRequest : $newSupportStatusFromQuestion;
                if($newSupportStatusTmId ){
                    $newSupportStatus = new VoterSupportStatus;
                    $newSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
                    $newSupportStatus->election_campaign_id = $currentCampaign;
                    $newSupportStatus->voter_id = $voterId;
                    $newSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM');
                    $newSupportStatus->support_status_id = $newSupportStatusTmId;
                    $newSupportStatus->create_user_id = Auth::user()->id;
                    $newSupportStatus->update_user_id = Auth::user()->id;
                    $newSupportStatus->save();
    
                    $actionType = 'ADD';
                    $saveHistoryModel = true;
                    $referencedModelId = $newSupportStatus->id;
                }

            }
            if($saveHistoryModel){
                
                // Array of display field names
                $historyFieldsNames = [
                    'election_campaign_id' => config('history.VoterSupportStatus.election_campaign_id'),
                    'entity_type'          => config('history.VoterSupportStatus.entity_type'),
                    'support_status_id'    => config('history.VoterSupportStatus.support_status_id'),
                    'voter_id'             => config('history.VoterSupportStatus.voter_id')
                ];

                $voterSupportStatusData = $existingSupportStatus ? $existingSupportStatus : $newSupportStatus;

                $valuesList = [];
                foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
                    $valuesList[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => $display_field_name,
                        'new_numeric_value' => $voterSupportStatusData->{$fieldName},
                        'old_numeric_value' => $fieldName == 'support_status_id' ? $prevSupportStatus : null
                    ];
                }
                $historyModel = [
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_' . $actionType),
                    'referenced_id' => $referencedModelId,
                    'valuesList' => $valuesList
                ];
            }
            $result = [
                'historyModel' => $historyModel,
                'newSupportStatus' => $newSupportStatusTmId,
                'prevSupportStatus' => $prevSupportStatus
            ];
            return $result;
    }

	/*
		Private helpful function that validates phone type id
	*/
    private function validatePhoneType($phoneTypeId) {
        $rules = [
            'phone_type_id' => 'required|integer|exists:phone_types,id'
        ];

        $validator = Validator::make(['phone_type_id' => $phoneTypeId], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates phones list
	*/
    private function validatePhones($newVoterPhones) {
        //  Phone validations
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];

            $phoneToCheck = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
            if (!Helper::isIsraelLandPhone($phoneToCheck) &&
                !Helper::isIsraelMobilePhone($phoneToCheck)) {
                return config('errors.tm.PHONE_NUMBER_IS_NOT_VALID');
            }

            if (!in_array($newVoterPhones[$phoneIndex]['call_via_tm'], [0, 1])) {
                return config('errors.tm.CALL_VIA_TM_IS_NOT_VALID');
            }

            if (!in_array($newVoterPhones[$phoneIndex]['sms'], [0, 1])) {
                return config('errors.elections.SMS_VALUE_IS_NOT_VALID');
            }

            if (is_null($phoneKey) && !$this->validatePhoneType($newVoterPhones[$phoneIndex]['phone_type_id'])) {
                return config('errors.tm.PHONE_TYPE_IS_NOT_VALID');
            }
        }

        return config('constants.SUCCESS');
    }

	/*
		Private helpful function that returns phones hash array
	*/
    private function getVoterPhonesHash($voterId) {

        $voterPhonesFields = ['voter_phones.id',
            'voter_phones.key',
            'voter_phones.phone_number',
            'voter_phones.call_via_tm',
            'voter_phones.call_via_phone',
            'voter_phones.sms',
            'voter_phones.phone_type_id'];

        $voterPhones = VoterPhone::select($voterPhonesFields)
                            ->where('voter_phones.voter_id', $voterId)
                            ->where('voter_phones.wrong', 0)
                            ->get();

        $voterPhonesHash = [];
        for ($index = 0; $index < count($voterPhones); $index++) {
            $key = $voterPhones[$index]->key;

            $voterPhonesHash[$key] = [
                "id" => $voterPhones[$index]->id,
                "key" => $key,
                "phone_number" => $voterPhones[$index]->phone_number,
                "call_via_tm" => $voterPhones[$index]->call_via_tm,
                "call_via_phone" => $voterPhones[$index]->call_via_phone,
                "sms" => $voterPhones[$index]->sms,
                "phone_type_id" => $voterPhones[$index]->phone_type_id
            ];
        }

        return $voterPhonesHash;
    }

	/*
		Private helpful function that updates voter's phone in database and phones hash
	*/
    private function updatePhones($voterId, $newVoterPhones, $currentPhonesHash) {
		//$fieldsArray = [];
        $historyModels = [];
        for ($phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++) {
            $phoneKey = $newVoterPhones[$phoneIndex]['key'];
			
            if (isset($currentPhonesHash[$phoneKey])) {
                $historyValues = [];
                $updates = [];
				if(($currentPhonesHash[$phoneKey]['phone_number'] != $newVoterPhones[$phoneIndex]['phone_number'])){
					$historyInsertFields = [
                        'field_name' => 'phone_number',
                        'display_field_name' => config('history.VoterPhone.phone_number')
					];
					
					$historyInsertFields['old_value'] = $currentPhonesHash[$phoneKey]['phone_number'];
					$historyInsertFields['new_value'] = $newVoterPhones[$phoneIndex]['phone_number'];

					$updates["phone_number"] = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);

                    $historyValues[] = $historyInsertFields;
					
				}

                if(($currentPhonesHash[$phoneKey]['call_via_tm'] != $newVoterPhones[$phoneIndex]['call_via_tm'])){
                    $historyInsertFields = [
                        'field_name' => 'call_via_tm',
                        'display_field_name' => config('history.VoterPhone.call_via_tm')
                    ];
                    
                    $historyInsertFields['old_value'] = $currentPhonesHash[$phoneKey]['call_via_tm'];
                    $historyInsertFields['new_value'] = $newVoterPhones[$phoneIndex]['call_via_tm'];

                    $updates["call_via_tm"] = $newVoterPhones[$phoneIndex]['call_via_tm'];

                    $historyValues[] = $historyInsertFields;  
                }

                if(($currentPhonesHash[$phoneKey]['sms'] != $newVoterPhones[$phoneIndex]['sms'])){
                    $historyInsertFields = [
                        'field_name' => 'sms',
                        'display_field_name' => config('history.VoterPhone.sms')
                    ];
                    
                    $historyInsertFields['old_value'] = $currentPhonesHash[$phoneKey]['sms'];
                    $historyInsertFields['new_value'] = $newVoterPhones[$phoneIndex]['sms'];

                    $updates["sms"] = $newVoterPhones[$phoneIndex]['sms'];

                    $historyValues[] = $historyInsertFields;  
                }

                if (count($updates) > 0) {
                    VoterPhone::where('key', $phoneKey)->update($updates);

                    $historyModels[] = [
                            'referenced_model' => 'VoterPhones',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $currentPhonesHash[$phoneKey]['id'],
                            'valuesList' => $historyValues,
                    ];
                }
                unset($currentPhonesHash[$phoneKey]);
					
            } else {
                $voterPhone = new VoterPhone;
                $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
                $voterPhone->voter_id = $voterId;
                $voterPhone->phone_number = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
                $voterPhone->call_via_tm = $newVoterPhones[$phoneIndex]['call_via_tm'];
                $voterPhone->sms = $newVoterPhones[$phoneIndex]['sms'];
                $voterPhone->phone_type_id = $newVoterPhones[$phoneIndex]['phone_type_id'];
                $voterPhone->save();
 
				//$historyInsertFields['old_value'] = '';
                //$historyInsertFields['new_value'] = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
				$fieldsArray = [
                    [
                        'field_name' => 'phone_number',
                        'display_field_name' => config('history.VoterPhone.phone_number'),
                        'new_value' => $voterPhone->phone_number
                    ],
                    [
                        'field_name' => 'voter_id',
                        'display_field_name' => config('history.VoterPhone.voter_id'),
                        'new_numeric_value' => $voterPhone->voter_id
                    ],
                    [
                        'field_name' => 'phone_type_id',
                        'display_field_name' => config('history.VoterPhone.phone_type_id'),
                        'new_numeric_value' => $voterPhone->phone_type_id
                    ]
                ];

                $historyModels[] = [
                    'referenced_model' => 'VoterPhones',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterPhone->id,
                    'valuesList' => $fieldsArray,
                ];
            }
			
        }

        if (count($currentPhonesHash) > 0) {
            $phonesToDelete = [];

            foreach ($currentPhonesHash as $phoneKey => $value) {
                $voterPhoneId = $currentPhonesHash[$phoneKey]['id'];
                $phonesToDelete[] = $voterPhoneId;
                $historyModels[] = [
                    'referenced_model' => 'VoterPhones',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterPhoneId,
                    'valuesList' => [],
                ];                
            }

            VoterPhone::whereIn('id', $phonesToDelete)->delete();
        }

		return  $historyModels;
    }

	/*
		Private helpful function that returns voter's metadata keys hash
	*/
    private function getMetaDataKeysHash() {
        $keyNames = ['willing_volunteer', 'agree_sign', 'explanation_material'];
        $fields = ['id'];
        $voterMetaKeys = VoterMetaKeys::select($fields)->where( 'deleted', 0 )->whereIn('key_system_name', $keyNames)->get();

        $voterMetaKeysHash = [];

        for ( $keyIndex = 0; $keyIndex < count($voterMetaKeys); $keyIndex++) {
            $metaKeyId = $voterMetaKeys[$keyIndex]->id;
            $voterMetaKeysHash[$metaKeyId] = [
                "id"           => $voterMetaKeys[$keyIndex]->id,
                "key_type"     => $voterMetaKeys[$keyIndex]->key_type,
                "key_name"     => $voterMetaKeys[$keyIndex]->key_name,
                "max"          => $voterMetaKeys[$keyIndex]->max,
                "per_campaign" => $voterMetaKeys[$keyIndex]->per_campaign
            ];
        }

        return $voterMetaKeysHash;
    }

	/*
		Private helpful function that saves voter's metadatas in last election campaign 
	*/
    public function saveVoterMetaData($voterId, $lastElectionCampaignId, $newMetaDataValues) {
        $metaKeysHash = $this->getMetaDataKeysHash();
        $currentVoterMetas = $this->getVoterMetaValues($voterId, $lastElectionCampaignId);
		$fieldsArray = [];
        $newMetaDataValuesHash = [];
        for ( $newIndex = 0; $newIndex < count($newMetaDataValues); $newIndex++ ) {
            $metaKeyId = $newMetaDataValues[$newIndex]['voter_meta_key_id'];

            $newMetaDataValuesHash[$metaKeyId] = [
                "id"                    => $newMetaDataValues[$newIndex]['id'],
                "voter_meta_key_id"     => $metaKeyId,
                "voter_meta_value_id"   => $newMetaDataValues[$newIndex]['voter_meta_value_id']
            ];
        }

        for ( $currentIndex = 0; $currentIndex < count($currentVoterMetas); $currentIndex++ ) {
            $metaKeyId = $currentVoterMetas[$currentIndex]->voter_meta_key_id;

            if (!isset($metaKeysHash[$metaKeyId])) {
                continue;
            }

            if ( isset( $newMetaDataValuesHash[$metaKeyId] ) ) {
                $updates = [
                    'voter_meta_value_id' => $newMetaDataValuesHash[$metaKeyId]['voter_meta_value_id']
                ];
                VoterMetas::where('id', $newMetaDataValuesHash[$metaKeyId]['id'])->update($updates);

                unset($newMetaDataValuesHash[$metaKeyId]);
            } else {
                $where = [
                    'voter_id' => $voterId,
                    'voter_meta_key_id' => $metaKeyId,
                    'election_campaign_id' => $lastElectionCampaignId
                ];

                VoterMetas::where($where)->delete();
            }
        }


        if ( count($newMetaDataValuesHash) > 0 ) {
            $insertData = [];

            foreach ( $newMetaDataValuesHash as $metaKeyId => $value ) {
                $insertData[] = [
                    'voter_id' => $voterId,
                    'voter_meta_key_id' => $metaKeyId,
                    'voter_meta_value_id' => $newMetaDataValuesHash[$metaKeyId]['voter_meta_value_id'],
                    'election_campaign_id' => $lastElectionCampaignId
                ];
				$fieldsArray[] = [
                    'field_name' => 'voter_meta',
                    'display_field_name' => 'התנדבות',
					'old_value' => '' , 
					'new_value' => $metaKeyId , 
					'old_numeric_value' => -1 , 
					'new_numeric_value' => $newMetaDataValuesHash[$metaKeyId]['voter_meta_value_id']
				];	 
            }
            VoterMetas::insert($insertData);	
        }
		
		if(count($fieldsArray) > 0){
			return  ([
							'referenced_model' => 'VoterMetas',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
							'referenced_id' => $voterId,
							'valuesList' => $fieldsArray,
                        ]);
	 
		}
		else{
			return null;
		}
    }

	/*
		Function that get call key and POST params , and updates call's data
	*/
    public function saveCallData(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
		
        $callObj = Call::select(['id', 'campaign_id', 'questionnaire_id', 'voter_id', 'portion_id', 'created_at'])
                       ->where('key', $key)->first();
        if ( null == $callObj ) {
            $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
            return;
        }
	       
        $callId = $callObj->id;
        $campaignId = $callObj->campaign_id;
        $voterId = $callObj->voter_id;
        $questionnaireId = $callObj->questionnaire_id;
		 
        $campaign = Campaign::where('id', $campaignId)->first();
 
        $redisCallKey = "tm:campaigns:" . $campaignId . ":active_calls:" . $callId;
        $voterData = json_decode(Redis::get($redisCallKey));
        Redis::del($redisCallKey);
 
        $voterAnswers = $request->input('voter_answers', null);

        $questionsFromDb = Question::select('id')->where(['questionnaire_id' => $questionnaireId, 'deleted' => 0])
                                    ->orderBy('admin_order', 'asc')
                                   ->get();
        $questionsIds = [];
        $arrAssocQuestionsIds = [];

        for ( $questionIndex = 0; $questionIndex < count($questionsFromDb); $questionIndex++ ) {
            $questionId = $questionsFromDb[$questionIndex]->id;

            $questionsIds[] = $questionId;
            $arrAssocQuestionsIds[$questionId]['active'] = 1;

            for ( $possibleAnswerIndex = 0;
                  $possibleAnswerIndex < count($questionsFromDb[$questionIndex]->possible_answers);
                  $possibleAnswerIndex++ ) {

                $possibleAnswerKey = $questionsFromDb[$questionIndex]->possible_answers[$possibleAnswerIndex]->key;
                $arrAssocQuestionsIds[$questionId][$possibleAnswerKey] = $questionsFromDb[$questionIndex]->possible_answers[$possibleAnswerIndex];
            }
        }
	 
        // validate voter answers
        foreach ($voterAnswers as $questionId => $answers) {
            if ( !isset( $arrAssocQuestionsIds[$questionId] ) ) {
                $jsonOutput->setErrorCode(config('errors.tm.QUESTION_DOES_NOT_EXIST'));
                return;
            }

            if ( !is_null($voterAnswers[$questionId]) ) {
                if ( $this->isAssocArray($voterAnswers[$questionId]) ) {
                    if ( isset($voterAnswers[$questionId]['possibleAnswerKey']) &&
                         !$this->validateObjAnswerPossibleKey($voterAnswers[$questionId],
                                                              $arrAssocQuestionsIds[$questionId]) ) {
                        $jsonOutput->setErrorCode(config('errors.tm.POSSIBLE_ANSWER_DOES_NOT_EXIST'));
                        return;
                    }
                } else if (!$this->validateQuestionWithMultiAnswers($voterAnswers[$questionId],
                                                                   $arrAssocQuestionsIds[$questionId])) {
                    $jsonOutput->setErrorCode(config('errors.tm.POSSIBLE_ANSWER_DOES_NOT_EXIST'));
                    return;
                }
            }
        }
 
        $lastElectionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $voterHouseholdHash = [];
        $household = [];

        $voterObj = Voters::select('household_id')->where('id', $voterId)->first();
        $voterHouseholdId = $voterObj->household_id;
        $voterHousehold = $this->getVoterHousehold($voterId, $voterHouseholdId, $lastElectionCampaignId);
        if ( count($voterHousehold) > 0 ) {
            $voterHouseholdHash = $this->convertVoterHouseholdToHash($voterHousehold);
            $household = $request->input('household', null);

            if ( ($errorCode = $this->validateHousehold($voterHouseholdHash, $household)) != config('constants.SUCCESS') ) {
                $jsonOutput->setErrorCode($errorCode);
                return;
            }
        }
	 
        $actionCallSeconds = $request->input('action_call_seconds', null);
        $callSeconds = $request->input('call_seconds', null);
        if ( null == $callSeconds ) {
            $callSeconds = $actionCallSeconds;
        }

        $endCallStatus = $request->input('call_end_status', null);
        $arrOfStatusCodeValues = array_values(config('tmConstants.call.status'));
        if ( !is_null($endCallStatus) && !in_array($endCallStatus, $arrOfStatusCodeValues) ) {
            $jsonOutput->setErrorCode(config('errors.tm.INVALID_CALL_END_STATUS'));
            return;
        }

        $endCallStatusItems = $request->input('call_end_status_items', null);
        if ( !$this->validateEndStatusItems($endCallStatus, $endCallStatusItems) ) {
            $jsonOutput->setErrorCode(config('errors.tm.INVALID_CALL_END_STATUS_ITEM'));
            return;
        }

        $addressValid = true;
        $addressObj = new Address();
        $address = $request->input('address', null);
        if ( ($errorCode = $this->validateAddress($address, $addressObj)) != config('constants.SUCCESS') ) {
            $addressValid = false;
            // $jsonOutput->setErrorCode($errorCode);
            // return;
        }
 	 
        $transportation = $request->input('transportation', null);
        if ( ($errorCode = $this->validateTransportation($transportation, $voterHousehold)) != config('constants.SUCCESS') ) {
            //$jsonOutput->setErrorCode($errorCode);
            //return;
        }
		
        $supportStatusTmFromRequest = $request->input('support_status_tm', null);
        if ( !is_null($supportStatusTmFromRequest) && !$this->validateSupportStatus($supportStatusTmFromRequest) ) {
            $jsonOutput->setErrorCode(config('errors.tm.INVALID_SUPPORT_STATUS_TM'));
            return;
        }

        $newVoterPhones = $request->input('voter_phones', null);
        if ( !is_null($newVoterPhones) && ($errorCode = $this->validatePhones($newVoterPhones)) != config('constants.SUCCESS') ) {
            $jsonOutput->setErrorCode($errorCode);
            return;
        }
 
        $voterEmail = $request->input('voter_email', null);
        if (isset($voterEmail['email']) && !$this->validateEmail($voterEmail['email'])) {
            $jsonOutput->setErrorCode(config('errors.tm.INVALID_EMAIL'));
            return;
        }

        if (isset($voterEmail['contact_via_email']) && !in_array($voterEmail['contact_via_email'], [0, 1])) {
            $jsonOutput->setErrorCode(config('errors.tm.CONTACT_VIA_EMAIL_VALUE_IS_NOT_VALID'));
            return;
        }

        // Update call times and status
        $callObj->call_end_status = is_null($endCallStatus) ? config('tmConstants.call.status.SUCCESS') : $endCallStatus;
        $callObj->call_end_date = Carbon::parse($callObj->created_at)->addSecond($callSeconds)->toDateTimeString();
        $callObj->call_action_end_date = Carbon::parse($callObj->created_at)->addSecond($actionCallSeconds)
                                               ->toDateTimeString();
        $callObj->total_seconds = $callSeconds;
        $callObj->total_action_seconds = $actionCallSeconds;
        $callObj->save();

        $currentPhonesHash = $this->getVoterPhonesHash($voterId);

        $voterPhonesModel = $this->updatePhones($voterId, $newVoterPhones, $currentPhonesHash);

        if (count($voterPhonesModel) > 0) {
            $updatedPhones = true;
            $voterData = $this->getUpdatedPhones($voterData);
        } else {
            $updatedPhones = false;
        }

        $newSupportStatusFromQuestion = null;
		 
        //If status code is not success - not save call details!!!
        if ( $endCallStatus != config('tmConstants.call.status.SUCCESS') ) {
			 
            switch ($endCallStatus) {
                case config('tmConstants.call.status.NON_COOPERATIVE'):

                    //Add voter to finished list and change portion processing count
                    CampaignService::addVoterToFinished($voterId, $campaign, $callObj->call_end_status);
                    CampaignService::transferVotersCountToProcessed($callObj->portion_id, 1);
                   break;

                case config('tmConstants.call.status.GET_BACK'):
                    $this->saveEndStatusItem($callId, $endCallStatus, $endCallStatusItems);
                    CampaignService::setCallbackToVoter($campaignId, $voterData, $endCallStatusItems['datetime'], $endCallStatus);
                    break;

                case config('tmConstants.call.status.LANGUAGE'):
                    CampaignService::addVoterToFinished($voterId, $campaign, $callObj->call_end_status);
                    CampaignService::transferVotersCountToProcessed($callObj->portion_id, 1);
                    $this->saveEndStatusItem($callId, $endCallStatus, $endCallStatusItems);
                    break;

                //call needs to be redialed
                case config('tmConstants.call.status.ANSWERING_MACHINE'):
                case config('tmConstants.call.status.GOT_MARRIED'):
                case config('tmConstants.call.status.CHANGED_ADDRESS'):
                case config('tmConstants.call.status.FAX_TONE'):
                case config('tmConstants.call.status.HANGED_UP'):
                case config('tmConstants.call.status.WRONG_NUMBER'):
                case config('tmConstants.call.status.BUSY'):
                case config('tmConstants.call.status.DISCONNECTED_NUMBER'):
                case config('tmConstants.call.status.UNANSWERED'):

                    //remove current phone if can't be used
                    if (($endCallStatus == config('tmConstants.call.status.GOT_MARRIED')) ||
                        ($endCallStatus == config('tmConstants.call.status.CHANGED_ADDRESS')) ||
                        ($endCallStatus == config('tmConstants.call.status.WRONG_NUMBER')) ||
                        ($endCallStatus == config('tmConstants.call.status.DISCONNECTED_NUMBER'))
                    ) {
                        $wrongNumber = true;
                    } else {
                        $wrongNumber = false;
                    }

                    if ($endCallStatus == config('tmConstants.call.status.FAX_TONE')) {
                        $callViaTm = false;
                    } else {
                        $callViaTm = true;
                    }

                    if ($endCallStatus == config('tmConstants.call.status.HANGED_UP')) {
                        $sameNumber = true;
                    } else {
                        $sameNumber = false;
                    }
                    try {
                            //add voter to redial
                            CampaignService::setVoterToRedial($campaign,
                            $voterData,
                            $voterData->current_phone->id,
                            $endCallStatus,
                            $wrongNumber,
                            $callViaTm,
                            $sameNumber,
                            $updatedPhones);
                    } catch (\Throwable $th) {
                        //throw $th;
                    }

                    break;
            }
        } else {
			 
            //Add voter to finished list and change portion processing count
            CampaignService::addVoterToFinished($voterId, $campaign, $callObj->call_end_status);
            CampaignService::transferVotersCountToProcessed($callObj->portion_id, 1);
            Log::info('voterAnswers->' . json_encode($voterAnswers));

            foreach ($voterAnswers as $questionId => $answers) {

                if ( is_null($voterAnswers[$questionId]) ) {
                    $this->saveUnAnsweredQuestion($callId, $voterId, $questionId);
                } else if ( $this->isAssocArray($voterAnswers[$questionId]) ) {
                     $this->saveOneAnswer4Question($callId, $voterId, $questionId, $voterAnswers[$questionId],
                                                 $arrAssocQuestionsIds[$questionId], $lastElectionCampaignId, $newSupportStatusFromQuestion);
                } else {
                    $this->saveMultiAnswers4Question($callId, $voterId, $questionId, $voterAnswers[$questionId],
                                                     $arrAssocQuestionsIds[$questionId], $lastElectionCampaignId, $newSupportStatusFromQuestion);
                }
            }
        }
        $supportStatusAnswerModels = [];

        $newSupportStatus = null;
        $prevSupportStatus = null;
        if(!is_null($newSupportStatusFromQuestion) || !is_null($supportStatusTmFromRequest)){
            try {
                $result = $this->updateSupportStatusTm($voterId, $lastElectionCampaignId, $newSupportStatusFromQuestion, $supportStatusTmFromRequest);
                $prevSupportStatus = $result['prevSupportStatus'];
                $newSupportStatus = $result['newSupportStatus'];
                Log::info("----------------> voter: $voterId ->Question $newSupportStatusFromQuestion Request $supportStatusTmFromRequest -------------------> prev $prevSupportStatus next $newSupportStatus");
                if($result['historyModel']) { $supportStatusAnswerModels[] = $result['historyModel']; }
            } catch (\Throwable $e) {
                Log::info($e);
            }

        }

        if ( count($voterHousehold) > 0 ) {
            $this->saveHousehold($voterHouseholdHash, $household);
        }

        $voterAddressModel = ($addressValid)? $this->updateVoterAddress($address, $addressObj, $voterId) : false;

        $voterTransportationModel = $this->updateTransportation($voterId, $lastElectionCampaignId, $transportation, $voterHousehold);



        $callNote = $request->input('call_note', null);
        if ( !is_null($callNote) || !is_null($newSupportStatus)  ) {
            $this->saveCallNote($callId, $callNote, $newSupportStatus, $prevSupportStatus);
        }

        if (($voterEmail!= null) && isset($voterEmail['email'])) {
        $updates = [
                "email" => $voterEmail['email'] ,
                "contact_via_email" => isset($voterEmail['contact_via_email'])? $voterEmail['contact_via_email'] : 1,
            ];

            Voters::where('voters.id', $voterId)->update($updates);
        }
        

        $newMetaDataValues = $request->input( 'meta_data_values', null );
        $voterMetaModel = $this->saveVoterMetaData($voterId, $lastElectionCampaignId, $newMetaDataValues);
		
		$ctiCallModel = [
							'referenced_model' => 'Call',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
							'referenced_id' => $callObj->id,
							'valuesList' => [],
                        ]; 
						
		$modelsList = [];
		array_push($modelsList ,$ctiCallModel);
        if (count($supportStatusAnswerModels) > 0) $modelsList = array_merge($modelsList, $supportStatusAnswerModels);
		if($voterAddressModel){
			array_push($modelsList ,$voterAddressModel);
		}
		if(count($voterPhonesModel) > 0){
			$modelsList = array_merge($modelsList ,$voterPhonesModel);
		}
		if($voterTransportationModel){
			array_push($modelsList ,$voterTransportationModel);
		}
		if($voterMetaModel){
			array_push($modelsList ,$voterMetaModel);
		}
		
		$historyArgsArr = [
                'topicName' => ('cti.call.edit'),
                'models' => $modelsList,
        ];

        ActionController::AddHistoryItem($historyArgsArr);
		

        $jsonOutput->setData($callObj);
    }

	/*
		Function that handles sending SMS of specific call by correct conditions
	*/
    public function sendSms(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $callObj = Call::select(['id'])->where('key', $key)->first();
        if ( null == $callObj ) {
            $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
            return;
        }

        $phoneNumber = $request->input('phone_number', null);

        $phoneToCheck = str_replace('-', '', $phoneNumber);

        if (!Helper::isIsraelMobilePhone($phoneToCheck)) {
            $jsonOutput->setErrorCode(config('errors.tm.PHONE_NUMBER_IS_NOT_VALID'));
            return;
        }

        $message = $request->input('message', null);
        if ( is_null($message) ) {
            $jsonOutput->setErrorCode(config('errors.tm.SMS_MESSAGE_IS_MISSING'));
            return;
        }

        $code = (Sms::connection('telemarketing')->send($phoneToCheck, $message)) ? 'OK' : 'Error';

        $jsonOutput->setData($code);
    }

	/*
		Private helpful function that validates email
	*/
    private function validateEmail($email) {
        $rules = [
            'email' => 'email'
        ];

        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that saves message in messages table for voter 
	*/
    private function saveMessage($voterId, $subject, $message) {
        $insertData = [
            'key' => Helper::getNewTableKey('messages', 10),
            'entity_type' => config('constants.ENTITY_TYPE_VOTER'),
            'entity_id' => $voterId,
            'date' => DB::raw('NOW()'),
            'direction' => config('constants.REQUEST_OPERATION_DIRECTION_OUT'),
            'subject' => $subject,
            'body' => $message
        ];

        Message::insert($insertData);
    }

	/*
		Function that handles sending the correct mail of specific call
	*/
    public function sendEmail(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $callObj = Call::select(['id', 'voter_id'])->where('key', $key)->first();
        if ( null == $callObj ) {
            $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
            return;
        }

        $email = $request->input('email', null);
        if ( is_null($email) || !$this->validateEmail($email) ) {
            $jsonOutput->setErrorCode(config('errors.tm.INVALID_EMAIL'));
            return;
        }

        $subject = $request->input('subject', null);
        if ( is_null($subject) ) {
            $jsonOutput->setErrorCode(config('errors.tm.EMAIL_SUBJECT_IS_MISSING'));
            return;
        }

        $message = $request->input('message', null);
        if ( is_null($message) ) {
            $jsonOutput->setErrorCode(config('errors.tm.EMAIL_MESSAGE_IS_MISSING'));
            return;
        }

        Mail::to($email)->send(new GeneralEmail($subject, $message));

        $this->saveMessage($callObj->voter_id, $subject, $message);

        $jsonOutput->setData('OK');
    }

    /**
     * Get updated voter phones
     *
     * @param object $voterData
     * @return object
     */
    private function getUpdatedPhones($voterData) {
        $phoneFields = [
            'voter_phones.id',
            'voter_phones.key',
            'voter_phones.phone_number',
            'voter_phones.voter_id',
            'voter_phones.phone_type_id',
            'voter_phones.sms',
            'voter_phones.call_via_tm',
        ];

        // order by phone query
        $orderByPhoneQuery = "CASE WHEN voter_phones.id = voters.main_voter_phone_id THEN 1 WHEN voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ASC ,voter_phones.updated_at DESC, voter_phones.id";

        $voterPhones = VoterPhone::select($phoneFields)
                        ->withVoters()
                        ->where('voters.id', $voterData->id)
                        ->where('call_via_tm', 1)
                        ->where('wrong', 0)
                        ->orderByRaw($orderByPhoneQuery)
                        ->get();
        //create array of objects for voterData
        $foundBase = false;
        $phones = [];
        foreach($voterPhones as $voterPhone) {
            if (!$foundBase && $voterData->current_phone->base_id == $voterPhone->id) $foundBase = true;
            $phone = new \stdClass;
            $phone->id = $voterPhone->id;
            $phone->key = $voterPhone->key;
            $phone->phone_number = $voterPhone->phone_number;
            $phone->voter_id =$voterPhone->voter_id;
            $phone->phone_type_id = $voterPhone->phone_type_id;
            $phone->sms = $voterPhone->sms;
            $phone->call_via_tm = $voterPhone->call_via_tm;
            $phones[] = $phone;
        }
        //reset base id if missing
        $voterData->phones = $phones; 
        if (!$foundBase && (count($phones) > 0)) {
            $voterData->current_phone->base_id = $phones[0]->id;
        }   
        return $voterData;
    }
    public function downloadCallFile($campaignId, $callsFileName){
        $jsonOutput = app()->make("JsonOutput");

        $jsonOutput->setBypass(true);

        $fileStorage = env('FILES_CALLS_FOLDER', base_path() . '/files');
        $callsFileName = str_replace( 'wav', 'mp3', $callsFileName);
        $filePath = "$fileStorage/$campaignId/$callsFileName";

        $file = file_exists ( $filePath );
        if($file){
            return response()->file( $filePath );
        }
    }
}