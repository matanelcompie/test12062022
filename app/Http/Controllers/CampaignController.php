<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\ActionController;

use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\VoterBooks;
use App\Models\BudgetFiles;
use App\Models\ElectionRoles;
use App\Models\ElectionRoleShifts;
use App\Models\ElectionRolesShiftsBudgets;
use App\Models\CityBudget;
use App\Models\CityBudgetActivistExpectedExpenses;
use App\Models\CityBudgetOngoingActivityExpenses;
use App\Models\BallotBoxesFiles;
use App\Models\SupportStatusUpdates;
use App\Models\SupportStatus;
use App\Models\ReportedHourlyVotes;


use App\Libraries\Helper;
use App\Libraries\VoterBookParser;
use App\Libraries\BallotBoxFileParser;
use App\Libraries\SupportStatusUpdateParser;
use App\Libraries\Services\BallotVotesCountsService;
use App\Jobs\voterBookJob;
use App\Jobs\BallotBoxFileJob;
use App\Jobs\supportStatusUpdateJob;

use Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use ZipArchive;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Redis;
use Session;


class CampaignController extends Controller
{

	/*
		Function that returns the current last election campaign
	*/
    public function getCurrentCampaign() {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $jsonOutput->setData($currentCampaign);
    }

	/*
		Function that returns all Election Campaigns
	*/
    public function getAllElectionCampaigns() {
        $jsonOutput = app()->make("JsonOutput");
        $dataArray = array();
        $electionCampaigns = ElectionCampaigns::select('id', 'key', 'name', 'type', 'start_date', 'end_date',
                                                                'election_date', 'vote_start_time', 'vote_end_time')
            ->orderBy('start_date', 'DESC')
            ->get();
        $dataArray["campaigns_list"] = $electionCampaigns;
        $cnt = count($electionCampaigns);
        for ($i = 0; $i < $cnt; $i++) {
            $campaign = $electionCampaigns[$i];
            if ($campaign->type == config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL')) {
                $dataArray["latest_campaign"] = $electionCampaigns[$i];
                break;
            }
        }

        $jsonOutput->setData($dataArray);
    }

	/*
		Function that edits election campaign by electionCampaignKey and POST input
	*/
    public function editElectionCampaign(Request $request, $campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        $electionDate = $request->input('election_date', null);
        $voteStartTime = $request->input('vote_start_time', null);
        $voteEndTime = $request->input('vote_end_time', null);
        $startDate = $request->input('start_date', null);
        $endDate = $request->input('end_date', null);

        if ( is_null($electionDate) && !$this->validateDate('election_date', $electionDate, 'Y-m-d') ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_ELECTION_DATE'));
            return;
        }

        if ( is_null($voteStartTime) && !$this->validateTime('voteStartTime', $voteStartTime) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_VOTE_START_TIME'));
            return;
        }

        if ( is_null($voteEndTime) && !$this->validateTime('voteEndTime', $voteEndTime) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_VOTE_END_TIME'));
            return;
        }

        if ( is_null($startDate)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_VOTE_END_TIME'));
            return;
        }

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_IS_MISSING'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_DOES_NOT_EXIST'));
            return;
        }

        $electionCampaign->election_date = $electionDate;
        $electionCampaign->vote_start_time = $voteStartTime;
        $electionCampaign->vote_end_time = $voteEndTime;
        $electionCampaign->start_date = $startDate;
        $electionCampaign->end_date = $endDate;
        $electionCampaign->save();

        $jsonOutput->setData($electionCampaign);
    }

	/*
		Function that returns all campaigns that AREN'T the current , for usage in UI of ballot_box summary report
	*/
    public function getCampaignsForBallotPolling()
    {
        $jsonOutput = app()->make("JsonOutput");

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $lastElectionCampaigns = ElectionCampaigns::select(['id', 'key', 'name', 'start_date'])
            ->where('id', '!=', $last_campaign_id)
            ->whereIn('type', [config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'),config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL')])
            ->orderBy('start_date', 'DESC')
            ->get();

        $jsonOutput->setData($lastElectionCampaigns);
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
		Private helpful function that validates time
	*/
    private function validateTime($fieldName, $fieldValue) {
        $rules = [
            $fieldName => 'date_format:H:i:s'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Function that adds new ElectionCampagin
	*/
    public function addElectionCampaign(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $name = $request->input('name', null);
        $type = $request->input('type', null);
        $electionDate = $request->input('election_date', null);
        $voteStartTime = $request->input('vote_start_time', null);
        $voteEndTime = $request->input('vote_end_time', null);

        if ( is_null($name) || strlen($name) == 0 ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_NAME'));
            return;
        }

        if ( is_null($type) || !in_array($type, [config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'), config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL') , config('constants.ELECTION_CAMPAIGN_TYPE_ROUTINE')]) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_TYPE'));
            return;
        }
        if($type == config('constants.ELECTION_CAMPAIGN_TYPE_ROUTINE')){
            if ( is_null($electionDate) && !$this->validateDate('election_date', $electionDate, 'Y-m-d') ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_ELECTION_DATE'));
                return;
            }
    
            if ( is_null($voteStartTime) && !$this->validateTime('voteStartTime', $voteStartTime) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_VOTE_START_TIME'));
                return;
            }
    
            if ( is_null($voteEndTime) && !$this->validateTime('voteEndTime', $voteEndTime) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_ELECTION_CAMPAIGN_VOTE_END_TIME'));
                return;
            }
        }


        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaign->end_date = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $currentCampaign->save();

        $electionCampaign = new ElectionCampaigns;
        $electionCampaign->key = Helper::getNewTableKey('election_campaigns', 10);
        $electionCampaign->name = $name;
        $electionCampaign->start_date = date(config('constants.APP_DATE_DB_FORMAT'), time());
        $electionCampaign->type = $type;
        $electionCampaign->election_date = !empty($electionDate) ? $electionDate : null;
        $electionCampaign->vote_start_time = !empty($voteStartTime) ? $voteStartTime : null;
        $electionCampaign->vote_end_time =!empty($voteEndTime) ? $voteEndTime : null ;
        $electionCampaign->active = 1;
        $electionCampaign->save();

        $this->addDefaultBudgetToElectionRoles($electionCampaign->id);
        
        // dd('$currentCampaign'. $currentCampaign->id);

        $x = DB::table('reported_hourly_votes')->where('election_campaign_id', $currentCampaign->id)->delete();
        Log::info('$currentCampaign'. $currentCampaign->id . ' deleted:'. $x);

        // $job = (new \App\Jobs\PrevElectionsVotesHourlyCounts(new \App\Libraries\Services\BallotVotesCountsService(), $currentCampaign->id))->onConnection('redis')->onQueue('prev_elections_hourly_votes');
        // $this->dispatch($job);
        

        $fields = [
            'type',
            'name',
            'start_date',
            'end_date',
            'vote_start_time',
            'vote_end_time'
        ];

        $changedValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
            $fieldName = $fields[$fieldIndex];

            if ( 'type' == $fieldName ) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.ElectionCampaigns.' . $fieldName),
                    'new_numeric_value' => $electionCampaign->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.ElectionCampaigns.' . $fieldName),
                    'new_value' => $electionCampaign->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.campaigns.add',
            'models' => [
                [
                    'referenced_model' => 'ElectionCampaigns',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $electionCampaign->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('ok');
    }
    private function addDefaultBudgetToElectionRoles ($electionCampaignId){
        if(is_null($electionCampaignId)){ return; }

        $election_role_system_names = config('constants.activists.election_role_system_names');
        
        $electionRoles = ElectionRoles::select(['id', 'system_name'])
        ->where('deleted', DB::raw(0))
        ->get(); 
        $electionRolesShifts = ElectionRoleShifts::select(['id', 'system_name'])->get(); 
        foreach($electionRoles as $role){
            $role_system_name = $role->system_name;
            // Ballot role:
            if($role_system_name == $election_role_system_names['ballotMember'] || $role_system_name == $election_role_system_names['observer'] ){
                foreach($electionRolesShifts as $shift){

                    $newElectionRolesShiftsBudget = new ElectionRolesShiftsBudgets;
                    $newElectionRolesShiftsBudget->key = Helper::getNewTableKey('election_role_shifts_budget', 5);;
                    $newElectionRolesShiftsBudget->election_role_id = $role->id;
                    $newElectionRolesShiftsBudget->election_role_shift_id = $shift->id;
                    $newElectionRolesShiftsBudget->election_campaign_id = $electionCampaignId;
                    $newElectionRolesShiftsBudget->save();
                }
            } else {
                $newElectionRolesShiftsBudget = new ElectionRolesShiftsBudgets;
                $newElectionRolesShiftsBudget->key = Helper::getNewTableKey('election_role_shifts_budget', 5);;
                $newElectionRolesShiftsBudget->election_role_id = $role->id;
                $newElectionRolesShiftsBudget->election_role_shift_id = null;
                $newElectionRolesShiftsBudget->election_campaign_id = $electionCampaignId;
                $newElectionRolesShiftsBudget->save();
            }
        }
    }
	/*
		Function that get details of specific ElectionCampaign by electionCampaingKey
	*/
    public function getCampaignDetails($campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        if (is_null($campaignKey)  ) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)
            ->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_DOES_NOT_EXIST'));
            return;
        }
		
		$savingsCounter = 0;
		if(!$electionCampaign->vote_start_time){
			$electionCampaign->vote_start_time = config('constants.ELECTIONS_START_TIME');
			$savingsCounter++;
		}
		if(!$electionCampaign->vote_end_time){
			$electionCampaign->vote_end_time = config('constants.ELECTIONS_END_TIME');
			$savingsCounter++;
		}
		if($savingsCounter > 0){
			$electionCampaign->save();
		}

        $jsonOutput->setData($electionCampaign);
    }

	/*
		Private helpful function that validates csv file mime type
	*/
    private function validateCsvFileMimeType($fileUpload) {
        $fileMimeType = $fileUpload->getMimeType();
        return ($fileMimeType == 'text/plain' || $fileMimeType == 'text/csv');
    }

	/*
		Private helpful function that validates general file  mime type
	*/
    private function validateFileMimeType($fileUpload, $mimeType = 'application/zip') {

        $fileMimeType = $fileUpload->getMimeType();
        return ($fileMimeType == $mimeType);
    }

	/*
		Private helpful function that validates extension of file
	*/
    private function validateFileExtension($fileUpload, $extenstion = 'zip') {
        $fileExtension = $fileUpload->getClientOriginalExtension();
        return ($fileExtension == $extenstion);
    }

	/*
		Private helpful function that build and returns
		permissions hash in order to reuse it and not to go to Database
	*/
    private function buildPermissionsHash($permissions)
    {
        $permissionsHash = [];
        for ($index = 0; $index < count($permissions); $index++) {
            $permissionName = $permissions[$index]->operation_name;

            $permissionsHash[$permissionName] = 1;
        }
        return $permissionsHash;
    }

	/*
		Private helpful function that checks if user has permission for specific action
	*/
    private function doesUserHavePermission($actionPermission) {
        $user = Auth::user();
        $isAdmin = ($user->admin == 0) ? false : true;

        if ( $isAdmin ) {
            return true;
        } else {
            $permissions = $user->permissions($user->id);
            $permissionsHash = $this->buildPermissionsHash($permissions);

            return isset($permissionsHash[$actionPermission]);
        }
    }

	/*
		Function that uploades for electionCampaign new VoterBook
	*/
    public function uploadVoterBook(Request $request, $campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        $fileUpload = $request->file('file_upload');

        if ( is_null($this->validateFileExtension($fileUpload)) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_FILE') );
            return;
        }

        if ( !$this->validateFileExtension($fileUpload) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_FILE') );
            return;
        }

        if ( !$this->validateFileMimeType($fileUpload) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_FILE') );
            return;
        }

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $key = Helper::getNewTableKey('voter_books', 10);

        $voterBook = new VoterBooks;
        $voterBook->key = $key;
        $voterBook->election_campaign_id = $campaign->id;
        $voterBook->name = $fileUpload->getClientOriginalName();
        $voterBook->file_name = $key;
        $voterBook->user_create_id = Auth::user()->id;

        $newFileName = $key;
        $newFileDestination = config( 'constants.VOTER_BOOKS_DIRECTORY' );
        $fileUpload->move($newFileDestination, $newFileName);

        $fullPath = config( 'constants.VOTER_BOOKS_DIRECTORY' ) . $voterBook->file_name;
        $voterBook->file_size = filesize($fullPath);
        $voterBook->save();

        if ( $this->doesUserHavePermission('elections.campaigns.voters_book.execute') ) {
            // Getting the job details
            $job = (new voterBookJob(new VoterBookParser(), $voterBook->id))->onConnection('redis')->onQueue('voter_book');

            // Executing the job which parses the voter book file
            $this->dispatch($job);
        }

        $fields = [
            'election_campaign_id',
            'name',
            'file_name'
        ];

        $changedValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
            $fieldName = $fields[$fieldIndex];

            if ( 'election_campaign_id' == $fieldName ) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.VoterBooks.' . $fieldName),
                    'new_numeric_value' => $voterBook->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.VoterBooks.' . $fieldName),
                    'new_value' => $voterBook->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.campaigns.voters_book.add',
            'models' => [
                [
                    'referenced_model' => 'VoterBooks',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterBook->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('ok');
    }

	/*
		Function that returns voter books of specific ElectionCampaign by electionCampaignKey
	*/
    public function getCampaignVoterBooks($campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }
		
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningVoterBooks = VoterBooks::select("id" , "process_id")->where(['voter_books.election_campaign_id' => $campaign->id, 'voter_books.deleted' => 0 , 'status'=>config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningVoterBooks);$i++){
			$item = $runningVoterBooks[$i];
			 
			if (!Redis::get('services:voter_book:'.$item->id)){
				VoterBooks::where('id',$item->id)->update(['status'=> config('constants.VOTER_BOOK_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($item->process_id, $pids)){
				//VoterBooks::where('id',$item->id)->update(['status'=> config('constants.VOTER_BOOK_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
				//echo "process died";
			//}
			else{
				  //echo "process running";
			}
		}

        $fields = [
            'voter_books.id',
            'voter_books.key',
            'voter_books.name',
            'voter_books.file_size',
            'voter_books.user_create_id',
            'voter_books.execution_date',
            'voter_books.voter_count',
            'voter_books.row_count',
            'voter_books.current_row',
            'voter_books.new_voter_count',
            'voter_books.status',

            'voters.first_name',
            'voters.last_name'
        ];
        $voterBooks = VoterBooks::select($fields)
            ->withUser()
            ->where(['voter_books.election_campaign_id' => $campaign->id, 'voter_books.deleted' => 0])
            ->get();

        $jsonOutput->setData($voterBooks);
    }

	/*
		Function that returns specific VoterBook by electionCampaignKey and VoterBookKey
	*/
    public function getCampaignVoterBook($campaignKey, $voterBookKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($voterBookKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_VOTER_BOOK') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }
		
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFile = VoterBooks::select("id" , "process_id")->where([ 'voter_books.deleted'=> 0 , 'status'=>config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK') , 'voter_books.key' => $voterBookKey])->first();
		if ($runningFile){
			if (!Redis::get('services:voter_book:'.$runningFile->id)){
				VoterBooks::where('id',$runningFile->id)->update(['status'=> config('constants.VOTER_BOOK_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			/*
			if (!in_array($runningFile->process_id, $pids)){
				VoterBooks::where('id',$runningFile->id)->update(['status'=> config('constants.VOTER_BOOK_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			*/
		}

        $fields = [
            'id',
            'key',
            'election_campaign_id',
            'row_count',
            'current_row',
            'voter_count',
            'new_voter_count',
            'status',
        ];
        $voterBook = VoterBooks::select($fields)
            ->where(['key' => $voterBookKey, 'deleted' => 0])
            ->first();
        if ( is_null($voterBook) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_VOTER_BOOK') );
            return;
        } else if ($voterBook->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTER_BOOK_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $jsonOutput->setData($voterBook);
    }

	/*
		Function that download specific voterBook as file , by electionCampaignKey and voterBookKey
	*/
    public function downloadVoterBook($campaignKey, $voterBookKey) {
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setBypass(true);

        if ( is_null($campaignKey) ) {
            return Redirect::to('file_not_found');
        }

        if ( is_null($voterBookKey) ) {
            return Redirect::to('file_not_found');
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            return Redirect::to('file_not_found');
        }

        $voterBook = VoterBooks::select(['id', 'name', 'file_name', 'election_campaign_id', 'deleted'])
            ->where('key', $voterBookKey)
            ->first();
        if ( is_null($voterBook) ) {
            return Redirect::to('file_not_found');
        } else if ( $voterBook->deleted == 1 || $voterBook->election_campaign_id != $campaign->id ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.VOTER_BOOKS_DIRECTORY' ) . $voterBook->file_name;
        $fileSize = filesize($fullPath);

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: application/zip");
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: attachement; filename=" . $voterBook->name);

        while ( !feof($fileHandle) ) {
            $buffer = fread($fileHandle, 1*(1024*1024));
            echo $buffer;
        }
        fclose($fileHandle);
    }

	/*
		Private helpful function that gets electionCampaignID and xmlFile , and
		creates cityBudget and expenses from that xml file
	*/
    private function updateCityBudgetFromXml($campaignId, $xmlFile) {
        $xml = simplexml_load_file($xmlFile);

        $cityData = $xml->CITY_DETAILS->CITY_DATA;
        $cityMiId = $cityData->SYMBOL_CITY;
        $city = City::select('id')
            ->where('mi_id', $cityMiId)
            ->first();
        if ( is_null($city) ) {
            return;
        }

        $cityBudget = new CityBudget;
        $cityBudget->key = Helper::getNewTableKey('city_budget', 5);
        $cityBudget->election_campaign_id = $campaignId;
        $cityBudget->city_id = $city->id;
        $cityBudget->budget_type = config( 'constants.CITY_BUDGET_TYPE_ONGOING' );
        $cityBudget->name = (string)$cityData->BUDGET_TYPE_NAME;
        $cityBudget->amount = intval($cityData->BUDGET_AMOUNT);
        $cityBudget->save();

        for ( $index = 0; $index < count($xml->BUDGET_ITEMS->BUDGET_ITEM); $index++ ) {
            $cityBudgetOngoingActivityExpenses = new CityBudgetOngoingActivityExpenses;
            $cityBudgetOngoingActivityExpenses->key = Helper::getNewTableKey('city_budget_ongoing_activity_expenses', 5);
            $cityBudgetOngoingActivityExpenses->city_budget_id = $cityBudget->id;
            $cityBudgetOngoingActivityExpenses->date = date(config('constants.APP_DATETIME_DB_FORMAT'));
            $cityBudgetOngoingActivityExpenses->amount = intval($xml->BUDGET_ITEMS->BUDGET_ITEM[$index]->BUDGET_ITEM_AMOUNT);
            $cityBudgetOngoingActivityExpenses->description = (string)$xml->BUDGET_ITEMS->BUDGET_ITEM[$index]->BUDGET_ITEM_NAME;
            $cityBudgetOngoingActivityExpenses->save();
        }
    }

	/*
		Private helpful function that loads data from given xml filename
	*/
    private function loadDataFromXml($campaignId, $fileName) {
        $directory = config( 'constants.BUDGET_DIRECTORY' );
        $file = $directory . $fileName;

        // Delete all xml files
        $files = glob($directory . '*.*');
        for ( $fileIndex = 0; $fileIndex < count($files); $fileIndex++ ) {
            unlink($files[$fileIndex]);
        }

        $zip = new ZipArchive;
        if ($zip->open($file) === TRUE) {
            $zip->extractTo($directory);
            $zip->close();
        } else {
            return;
        }

        // update data according to extracted xml files
        $files = glob($directory . '*.*');
        for ( $fileIndex = 0; $fileIndex < count($files); $fileIndex++ ) {
            $this->updateCityBudgetFromXml($campaignId, $files[$fileIndex]);
            unlink($files[$fileIndex]);
        }
    }

	/*
		Function that uploads budget file to the server , and creates budget data for it
	*/
    public function uploadBudgetFile(Request $request, $campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        $fileUpload = $request->file('file_upload');

        if ( is_null($this->validateFileExtension($fileUpload)) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_FILE') );
            return;
        }

        if ( !$this->validateFileMimeType($fileUpload) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_FILE') );
            return;
        }

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $key = Helper::getNewTableKey('budget_files', 10);

        $budgetFile = new BudgetFiles;
        $budgetFile->key = $key;
        $budgetFile->election_campaign_id = $campaign->id;
        $budgetFile->name = $fileUpload->getClientOriginalName();
        $budgetFile->file_name = $key;
        $budgetFile->execution_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
        $budgetFile->user_create_id = Auth::user()->id;
        $budgetFile->deleted = 0;

        $newFileName = $key;
        $newFileDestination = config( 'constants.BUDGET_DIRECTORY' );
        $fileUpload->move($newFileDestination, $newFileName);

        $fullPath = config( 'constants.BUDGET_DIRECTORY' ) . $budgetFile->file_name;
        $budgetFile->file_size = filesize($fullPath);
        $budgetFile->save();

        $this->loadDataFromXml($campaign->id, $budgetFile->file_name);

        $jsonOutput->setData('ok');
    }

	/*
		Function that gets electionCampaignKey , and returns a list of all its budget files
	*/
    public function getCampaignBudgetFiles($campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $fields = [
            'budget_files.id',
            'budget_files.key',
            'budget_files.name',
            'budget_files.file_size',
            'budget_files.user_create_id',
            'budget_files.execution_date',

            'voters.first_name',
            'voters.last_name'
        ];
        $budgetFiles = BudgetFiles::select($fields)
            ->withUser()
            ->where(['budget_files.election_campaign_id' => $campaign->id, 'budget_files.deleted' => 0])
            ->get();

        $jsonOutput->setData($budgetFiles);
    }

	/*
		Function that performa download of budget file by electionCampaiginId and budgetFileKey
	*/
    public function downloadBudgetFile($campaignKey, $budgetFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setBypass(true);

        if ( is_null($campaignKey) ) {
            return Redirect::to('file_not_found');
        }

        if ( is_null($budgetFileKey) ) {
            return Redirect::to('file_not_found');
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            return Redirect::to('file_not_found');
        }

        $budgetFile = BudgetFiles::select(['id', 'name', 'file_name', 'election_campaign_id', 'deleted'])
            ->where('key', $budgetFileKey)
            ->first();
        if ( is_null($budgetFile) ) {
            return Redirect::to('file_not_found');
        } else if ( $budgetFile->deleted == 1 || $budgetFile->election_campaign_id != $campaign->id ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.BUDGET_DIRECTORY' ) . $budgetFile->file_name;
        $fileSize = filesize($fullPath);

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: application/zip");
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: attachement; filename=" . $budgetFile->name);

        while ( !feof($fileHandle) ) {
            $buffer = fread($fileHandle, 1*(1024*1024));
            echo $buffer;
        }

        fclose($fileHandle);
    }

	/*
		Private helpful function that updates city budget activists expected expenses by parameters
	*/
    private function updateCityBudgetActivistExpectedExpenses($parameters) {
        $campaignId = $parameters['campaignId'];
        $electionRoleSystemName = $parameters['electionRoleSystemName'];
        $oldBudget = $parameters['oldBudget'];
        $newBudget = $parameters['newBudget'];
        $budgetType = $parameters['budgetType'];

        $fields = [
            'city_budget_activist_expected_expenses.id'
        ];
        $cityBudgetActivistExpectedExpensesObj = CityBudget::select($fields)
            ->withCityBudgetActivistExpectedExpenses()
            ->where(['city_budget.budget_type' => config('constants.CITY_BUDGET_TYPE_ACTIVIST'),
                     'city_budget.election_campaign_id' => $campaignId, 'city_budget.system_name' => $electionRoleSystemName,
                     'city_budget.deleted' => 0, 'city_budget_activist_expected_expenses.deleted' => 0]);

        if ( $budgetType == config('constants.election_campaigns.budget.election_roles_edit_types.UPDATE_FOR_CITIES_WITH_EQUAL_AMOUNT') ) {
            $cityBudgetActivistExpectedExpensesObj->where('city_budget_activist_expected_expenses.activist_salary', $oldBudget);
        } elseif ( $budgetType == config('constants.election_campaigns.budget.election_roles_edit_types.UPDATE_FOR_CITIES_WITH_INEQUAL_AMOUNT') ) {
            $cityBudgetActivistExpectedExpensesObj->where('city_budget_activist_expected_expenses.activist_salary', '!=' ,$oldBudget);
        }
        $cityBudgetActivistExpectedExpenses = $cityBudgetActivistExpectedExpensesObj->get();

        $ids = [];
        for ( $index = 0; $index < count($cityBudgetActivistExpectedExpenses); $index++ ) {
            $ids[] = $cityBudgetActivistExpectedExpenses[$index]->id;
        }
        if ( count($ids) > 0 ) {
            CityBudgetActivistExpectedExpenses::whereIn('id', $ids)->update(['activist_salary' => $newBudget]);
        }
    }

	/*
		Function that edits city budget of specific campaign 
		by electionRoleKey , campaignKey and POST params
	*/
    public function editCampaignElectionRoleBudget(Request $request, $campaignKey,  $electionRoleShiftBudgetKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        if (  is_null($electionRoleShiftBudgetKey)) {
            $jsonOutput->setErrorCode( config('errors.elections.MISSING_ELECTION_ROLE_KEY') );
            return;
        }

        $electionRoleShiftBudget = ElectionRolesShiftsBudgets::where('key', $electionRoleShiftBudgetKey)
            ->first();
        if ( is_null($electionRoleShiftBudget) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_ROLE_KEY_DOES_NOT_EXIST') );
            return;
        }

        $electionRole = ElectionRoles::where('id', $electionRoleShiftBudget->election_role_id)
            ->first();
        if ( is_null($electionRole) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_ROLE_KEY_DOES_NOT_EXIST') );
            return;
        }

        $electionRolesEditType = $request->input('type', null);
        $electionRolesEditTypes = array_values(config('constants.election_campaigns.budget.election_roles_edit_types'));
        if ( is_null($electionRolesEditType) || !in_array($electionRolesEditType, $electionRolesEditTypes) ) {
            $jsonOutput->setErrorCode( config('errors.elections.INVALID_ELECTION_ROLE_EDIT_BUDGET_TYPE') );
            return;
        }

        $newBudget = $request->input('budget', null);
        if ( is_null($newBudget) || !preg_match('/^[1-9][0-9]*$/', $newBudget) ) {
            $jsonOutput->setErrorCode( config('errors.elections.INVALID_ELECTION_ROLE_EDIT_BUDGET') );
            return;
        } else if ( $electionRoleShiftBudget->budget == $newBudget ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_ROLE_BUDGET_IS_EQUAL_TO_NEW_BUDGET') );
            return;
        }

        $oldBudget = $electionRoleShiftBudget->budget;
        $electionRoleShiftBudget->budget = $newBudget;
        $electionRoleShiftBudget->save();

        if ( $electionRolesEditType != config('constants.election_campaigns.budget.election_roles_edit_types.UPDATE_WITHOUT_CITIES') ) {
            $parameters = [
                'campaignId' => $campaign->id,
                'electionRoleSystemName' => $electionRole->system_name,
                'budgetType' => $electionRolesEditType,
                'oldBudget' => $oldBudget,
                'newBudget' => $newBudget

            ];
            $this->updateCityBudgetActivistExpectedExpenses($parameters);
        }

        $jsonOutput->setData('OK');
    }

	/*
		Function that returns all ballot box files of specific election campaign , by campaignKey
	*/
    public function getCampaignBallotBoxesFiles($campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $fields = [
            'ballot_boxes_files.id',
            'ballot_boxes_files.key',
            'ballot_boxes_files.name',
            'ballot_boxes_files.file_size',
            'ballot_boxes_files.user_create_id',
            'ballot_boxes_files.execution_date',
            'ballot_boxes_files.ballot_boxes_count',
            'ballot_boxes_files.new_clusters_count',
            'ballot_boxes_files.clusters_update_count',
            'ballot_boxes_files.status',

            'voters.first_name',
            'voters.last_name'
        ];
		//ballot_box_file
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFiles = BallotBoxesFiles::select("id" , "process_id")->where(['ballot_boxes_files.election_campaign_id' => $campaign->id, 'ballot_boxes_files.deleted' => 0, 'status'=>config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningFiles);$i++){
			$item = $runningFiles[$i];
			 
			if (!Redis::get('services:ballot_box_file:'.$item->id)){
				BallotBoxesFiles::where('id',$item->id)->update(['status'=> config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($item->process_id, $pids)){
				//BallotBoxesFiles::where('id',$item->id)->update(['status'=> config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
				//echo "process died";
			//}
			else{
				 //  echo "process running";
			}
		}
		
        $ballotBoxesFiles = BallotBoxesFiles::select($fields)
            ->withUser()
            ->where(['ballot_boxes_files.election_campaign_id' => $campaign->id, 'ballot_boxes_files.deleted' => 0])
            ->get();

        $jsonOutput->setData($ballotBoxesFiles);
    }

	/*
		Function that returns specific ballot box file of specific election 
		campaigm , by campaignKey and ballotBoxFileKey
	*/
    public function getCampaignBallotBoxFile($campaignKey, $ballotBoxFileKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($ballotBoxFileKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_BALLOT_BOX_FILE') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $fields = [
            'id',
            'key',
            'election_campaign_id',
            'row_count',
            'current_row',
            'ballot_boxes_count',
            'new_clusters_count',
            'clusters_update_count',
            'status',
        ];
		
		//ballot_box_file
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFile = BallotBoxesFiles::select("id" , "process_id")->where([ 'deleted'=> 0 , 'status'=>config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK') , 'key' => $ballotBoxFileKey])->first();
		if ($runningFile){
			/*
			if (!in_array($runningFile->process_id, $pids)){
				BallotBoxesFiles::where('id',$runningFile->id)->update(['status'=> config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			*/
			if (!Redis::get('services:ballot_box_file:'.$runningFile->id)){
				BallotBoxesFiles::where('id',$runningFile->id)->update(['status'=> config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
		}
		
        $ballotBoxFile = BallotBoxesFiles::select($fields)
            ->where(['key' => $ballotBoxFileKey, 'deleted' => 0])
            ->first();
        if ( is_null($ballotBoxFile) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_BALLOT_BOX_FILE') );
            return;
        } else if ($ballotBoxFile->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_BALLOT_BOX_FILE_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $jsonOutput->setData($ballotBoxFile);
    }

	/*
		Function that uploads and creates new ballotBox file for
		specific election campaign , by electionCampaignKey
	*/
    public function uploadBallotBoxFile(Request $request, $campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        $fileUpload = $request->file('file_upload');

        if ( is_null($this->validateFileExtension($fileUpload, 'csv')) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_FILE') );
            return;
        }

        if ( !$this->validateCsvFileMimeType($fileUpload) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_FILE') );
            return;
        }

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $key = Helper::getNewTableKey('ballot_boxes_files', 10);

        $ballotBoxFile = new BallotBoxesFiles;
        $ballotBoxFile->key = $key;
        $ballotBoxFile->election_campaign_id = $campaign->id;
        $ballotBoxFile->name = $fileUpload->getClientOriginalName();
        $ballotBoxFile->file_name = $key;
        $ballotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_DID_NOT_START');
        $ballotBoxFile->execution_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
        $ballotBoxFile->user_create_id = Auth::user()->id;
        $ballotBoxFile->deleted = 0;

        $newFileName = $key;
        $newFileDestination = config( 'constants.BALLOT_BOXES_FILES_DIRECTORY' );
        $fileUpload->move($newFileDestination, $newFileName);

        $fullPath = config( 'constants.BALLOT_BOXES_FILES_DIRECTORY' ) . $ballotBoxFile->file_name;
        $ballotBoxFile->file_size = filesize($fullPath);
        $ballotBoxFile->save();

        if ( $this->doesUserHavePermission('elections.campaigns.ballots.ballot_files.execute') ) {
            // Getting the job details
            $job = (new BallotBoxFileJob(new BallotBoxFileParser(), $ballotBoxFile->id))->onConnection('redis')->onQueue('ballot_box_file');

            // Executing the job which parses the voter book file
            $this->dispatch($job);
        }

        $jsonOutput->setData('ok');
    }

	/*
		Function that downloads specific ballotbox file , by electionCampaignKey
		and ballotBoxFileKey
	*/
    public function downloadBallotBoxFile($campaignKey, $ballotBoxFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setBypass(true);

        if ( is_null($campaignKey) ) {
            return Redirect::to('file_not_found');
        }

        if ( is_null($ballotBoxFileKey) ) {
            return Redirect::to('file_not_found');
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            return Redirect::to('file_not_found');
        }

        $ballotBoxFile = BallotBoxesFiles::select(['id', 'name', 'file_name', 'election_campaign_id', 'deleted'])
            ->where('key', $ballotBoxFileKey)
            ->first();
        if ( is_null($ballotBoxFile) ) {
            return Redirect::to('file_not_found');
        } else if ( $ballotBoxFile->deleted == 1 || $ballotBoxFile->election_campaign_id != $campaign->id ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.BALLOT_BOXES_FILES_DIRECTORY' ) . $ballotBoxFile->file_name;
        $fileSize = filesize($fullPath);

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: text/plain");
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: attachement; filename=" . $ballotBoxFile->name);

        while ( !feof($fileHandle) ) {
            $buffer = fread($fileHandle, 1*(1024*1024));
            echo $buffer;
        }

        fclose($fileHandle);
    }

	/*
		Function that gets SupportStatusUpdates by electionCampaignKey 
	*/
    public function getCampaignSupportStatusUpdates($campaignKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $fields = [
            'support_status_updates.key',
            'support_status_updates.election_campaign_id',
            'support_status_updates.type',
            'support_status_updates.status',
            'support_status_updates.type',
            'support_status_updates.execution_date',

            'support_status_updates.total_voters_count',
            'support_status_updates.total_voters_processed',
            'support_status_updates.updated_voters_count',

            'support_status_updates.user_create_id',
            'voter_create.first_name as user_create_first_name',
            'voter_create.last_name as user_create_last_name',

            'support_status_updates.user_execute_id',
            'voter_execute.first_name as user_execute_first_name',
            'voter_execute.last_name as user_execute_last_name'
        ];
		//support_status_update
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFiles = SupportStatusUpdates::select("id" , "process_id")->where([ 'support_status_updates.election_campaign_id'=> $campaign->id , 'status'=>config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningFiles);$i++){
			$item = $runningFiles[$i];
			if (!Redis::get('services:support_status_update:'.$item->id)){
				SupportStatusUpdates::where('id',$item->id)->update(['status'=> config('constants.SUPPORT_STATUS_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($item->process_id, $pids)){
				//SupportStatusUpdates::where('id',$item->id)->update(['status'=> config('constants.SUPPORT_STATUS_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
				//echo "process died";
			//}
			else{
				  //echo "process running";
			}
		}
		
        $supportStatusUpdates = SupportStatusUpdates::select($fields)
            ->withUserCreate()
            ->withUserExecuute()
            ->where('support_status_updates.election_campaign_id', $campaign->id)
            ->get();

        $jsonOutput->setData($supportStatusUpdates);
    }

	/*
		Function that adds new SupportStatusUpdates to existing electionCampaign
	*/
    public function addCampaignSupportStatusUpdate(Request $request, $campaignKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $updateType = $request->input('update_type', null);
        $conversionList = $request->input('conversion_list', null);
        $sourceSupportStatusType = $request->input('source_support_status_type', null);
        $supportUpdateTypes = array_values(config('constants.election_campaigns.supportStatusUpdate.types'));
        $supportStatusTypes = [
            config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'),
            config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
            config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')
        ];
        if ( is_null($updateType) || !in_array($updateType, $supportUpdateTypes) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_TYPE') );
            return;
        }

        if ($updateType == config('constants.election_campaigns.supportStatusUpdate.types.ELECTION')) {
            if ( is_null($sourceSupportStatusType) || !in_array($sourceSupportStatusType, $supportStatusTypes) ) {
                $jsonOutput->setErrorCode( config('errors.elections.WRONG_PARAMS') );
                return;
            }            
        }

        if (!is_array($conversionList)) {
            $jsonOutput->setErrorCode( config('errors.elections.WRONG_PARAMS') );
            return;            
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        //get support status list for conversion list
        $supportStatusList = SupportStatus::select('id', 'key')
                                ->where('deleted', 0)
                                ->get();
        //generate support status key => id hash
        $supportStatusHash = array();
        foreach($supportStatusList as $supportStatus) {
            $supportStatusHash[$supportStatus->key] = $supportStatus->id;
        }
        //convers list from keys to ids
        $idConversionList = [];
        foreach($conversionList as $conversion) {
            if (is_array($conversion)) {
                foreach($conversion as $key => $value) {
                    $idConversion = array();
                    $idConversion[$supportStatusHash[$key]] = $supportStatusHash[$value];
                    $idConversionList[] = $idConversion;
                }
            }
        }

        $supportStatusUpdate = new SupportStatusUpdates;
        $supportStatusUpdate->key = Helper::getNewTableKey('support_status_updates', 5);
        $supportStatusUpdate->election_campaign_id = $campaign->id;
        $supportStatusUpdate->type = $updateType;
        $supportStatusUpdate->source_support_status_type = $sourceSupportStatusType;
        $supportStatusUpdate->conversion_list = json_encode($idConversionList);
        $supportStatusUpdate->status = config('constants.SUPPORT_STATUS_PARSER_STATUS_DID_NOT_START');
        $supportStatusUpdate->user_create_id = Auth::user()->id;
        $supportStatusUpdate->user_execute_id = Auth::user()->id;
        $supportStatusUpdate->save();

        if ( $this->doesUserHavePermission('elections.campaigns.support_status_update.execute') ) {
            // Getting the job details
            $job = (new supportStatusUpdateJob(new SupportStatusUpdateParser() , $supportStatusUpdate->id))->onConnection('redis')
                ->onQueue('support_status_update');

            // Executing the job which parses the voter book file
            $this->dispatch($job);
        }

        $jsonOutput->setData('ok');
    }

	/*
		Function that gets SupportStatusUpdates by electionCampaignKey and supportStatusUpdateKey
	*/
    public function getCampaignSupportStatusUpdate($campaignKey, $supportStatusUpdateKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($supportStatusUpdateKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }
		
		//support_status_update
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFile = SupportStatusUpdates::select("id" , "process_id")->where([ 'status'=>config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK') , 'key' => $supportStatusUpdateKey])->first();
		if ($runningFile){
			if (!Redis::get('services:support_status_update:'.$runningFile->id)){
				SupportStatusUpdates::where('id',$runningFile->id)->update(['status'=> config('constants.SUPPORT_STATUS_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($runningFile->process_id, $pids)){
			//	SupportStatusUpdates::where('id',$runningFile->id)->update(['status'=> config('constants.SUPPORT_STATUS_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			//}
		}

        $fields = [
            'support_status_updates.key',
            'support_status_updates.election_campaign_id',
            'support_status_updates.type',
            'support_status_updates.status',
            'support_status_updates.type',
            'support_status_updates.execution_date',

            'support_status_updates.total_voters_count',
            'support_status_updates.total_voters_processed',
            'support_status_updates.updated_voters_count',

            'support_status_updates.user_create_id',
            'voter_create.first_name as user_create_first_name',
            'voter_create.last_name as user_create_last_name',

            'support_status_updates.user_execute_id',
            'voter_execute.first_name as user_execute_first_name',
            'voter_execute.last_name as user_execute_last_name'
        ];
        $supportStatusUpdate = SupportStatusUpdates::select($fields)
            ->withUserCreate()
            ->withUserExecuute()
            ->where('support_status_updates.key', $supportStatusUpdateKey)
            ->first();
        if ( is_null($supportStatusUpdate) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } else if ($supportStatusUpdate->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_SUPPORT_STATUS_UPDATE_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $jsonOutput->setData($supportStatusUpdate);
    }

	/*
		Function that updates supportStatusUpdate by its key, Default:where edit_type is NULL , then cancells process - status=5 + process_id=NULL
	*/
    public function editCampaignSupportStatusUpdate(Request $request,$campaignKey, $supportStatusUpdateKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($supportStatusUpdateKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $supportStatusUpdate = SupportStatusUpdates::where('support_status_updates.key', $supportStatusUpdateKey)
            ->first();
        if ( is_null($supportStatusUpdate) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } else if ($supportStatusUpdate->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_SUPPORT_STATUS_UPDATE_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

		if(!$request->input("edit_type")){
			if($supportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
				$supportStatusUpdate->status = config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED');
				$supportStatusUpdate->process_id=NULL;
				$supportStatusUpdate->save();
			}
		}
		else{
			 $job = (new supportStatusUpdateJob(new SupportStatusUpdateParser() , $supportStatusUpdate->id))->onConnection('redis')
                ->onQueue('support_status_update');
			 $this->dispatch($job);
			 $supportStatusUpdate->status = config('constants.SUPPORT_STATUS_PARSER_STATUS_RESTARTED');
			 $supportStatusUpdate->save();
		}
		
		

        $jsonOutput->setData('ok');
    }
	
	/*
		Function that updates VoterBookFile by its key, Default:where edit_type is NULL , then cancells process - status=5 + process_id=NULL
	*/
    public function editCampaignVoterBookUpdate(Request $request , $campaignKey, $voterBookUpdateKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($voterBookUpdateKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $voterBookUpdate = VoterBooks::where('voter_books.key', $voterBookUpdateKey)
            ->first();
        if ( is_null($voterBookUpdate) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } else if ($voterBookUpdate->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_SUPPORT_STATUS_UPDATE_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

		if(!$request->input("edit_type")){
			if($voterBookUpdate->status == config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK')){
				$voterBookUpdate->status = config('constants.VOTER_BOOK_PARSER_STATUS_CANCELLED');
				$voterBookUpdate->process_id=NULL;
				$voterBookUpdate->save();
			}
		}
		else{
			if($request->input("edit_type") == "reload"){ //reload job
				if($voterBookUpdate->status = config('constants.VOTER_BOOK_PARSER_STATUS_CANCELLED') || $voterBookUpdate->status = config('constants.VOTER_BOOK_PARSER_STATUS_ERROR')){
					// Getting the job details
					 $job =   $job = (new voterBookJob(new VoterBookParser(), $voterBookUpdate->id))->onConnection('redis')->onQueue('voter_book');
	 
					// Executing the job which parses the csv file
					 $this->dispatch($job);
					 $voterBookUpdate->status = config('constants.VOTER_BOOK_PARSER_STATUS_RESTARTED');
					 $voterBookUpdate->save();

				}
			}
		}

        $jsonOutput->setData('ok');
    }
	
	/*
		Function that updates BallotBoxFile by its key, Default:where edit_type is NULL , then cancells process - status=5 + process_id=NULL
	*/
    public function editCampaignBallotBoxFile(Request $request,$campaignKey, $ballotBoxFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($ballotBoxFileKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }
		

        $ballotBoxFile = BallotBoxesFiles::where('ballot_boxes_files.key', $ballotBoxFileKey)
            ->first();
        if ( is_null($ballotBoxFile) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } else if ($ballotBoxFile->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_SUPPORT_STATUS_UPDATE_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

		if(!$request->input("edit_type")){
			if($ballotBoxFile->status == config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK')){
				$ballotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_CANCELLED');
				$ballotBoxFile->process_id=NULL;
				$ballotBoxFile->save();
			}
		}
		else{
			if($request->input("edit_type") == "reload"){ //reload job
				if($ballotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_CANCELLED') || $ballotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR')){
					// Getting the job details
					 //$job =   $job = (new voterBookJob(new VoterBookParser(), $voterBookUpdate->id))->onConnection('redis')->onQueue('voter_book');
					 $job = (new BallotBoxFileJob(new BallotBoxFileParser(), $ballotBoxFile->id))->onConnection('redis')->onQueue('ballot_box_file');
					// Executing the job which parses the csv file
					 $this->dispatch($job);
					 $ballotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_RESTARTED');
					 $ballotBoxFile->save();

				}
			}
		}

        $jsonOutput->setData('ok');
    }
}