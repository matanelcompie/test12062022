<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\VoteFiles;
use App\Models\ElectionCampaigns;
use App\Models\PredictedVotesPercentages;
use App\Models\ReportedHourlyVotes;
use App\Models\Votes;
use App\Models\Cluster;

use App\Libraries\Helper;
use App\Libraries\VoteFileParser;
use App\Jobs\voteFileJob;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth ;
use Illuminate\Support\Facades\Redirect;

class VotesController extends Controller {
	/*
		Function that returns all vote files by election campaign key
	*/
    public function getVoteFiles($campaignKey) {
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
            'vote_files.id',
            'vote_files.key',
            'vote_files.name',
            'vote_files.file_size',
            'vote_files.user_create_id',
            'vote_files.execution_date',
            'vote_files.row_count',
            'vote_files.current_row',
            'vote_files.status',

            'voters.first_name',
            'voters.last_name'
        ];
		
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFiles = VoteFiles::select("id" , "process_id")->where([ 'vote_files.election_campaign_id' => $campaign->id, 'vote_files.deleted' => 0, 'status'=>config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningFiles);$i++){
			$item = $runningFiles[$i];
			if (!Redis::get('services:vote_file:'.$item->id)){
				VoteFiles::where('id',$item->id)->update(['status'=> config('constants.VOTE_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($item->process_id, $pids)){
				//VoteFiles::where('id',$item->id)->update(['status'=> config('constants.VOTE_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
				//echo "process died";
			//}
			else{
				  //echo "process running";
			}
		}
		
        $voteFiles = VoteFiles::select($fields)
            ->withUser()
            ->where(['vote_files.election_campaign_id' => $campaign->id, 'vote_files.deleted' => 0])
            ->get();

        $jsonOutput->setData($voteFiles);
    }

	/*
		Private helpful function that validates updloaded-file mime type
	*/
    private function validateFileMimeType($fileUpload) {
        $fileMimeType = $fileUpload->getMimeType();
        return ($fileMimeType == 'text/plain' || $fileMimeType == 'text/csv');
    }

	/*
		Private helpful function that validates updloaded-file extention
	*/
    private function validateFileExtension($fileUpload) {
        $fileExtension = $fileUpload->getClientOriginalExtension();
        return ($fileExtension == 'csv');
    }

	/*
		Private helpful function that builds permission Hash array
		for reusing it and avoiding redundant SQL calls
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
		Private helpful function that get actionPermission , and returns whether
		user has permission for that action
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
		Function that uploads and saves in DB VoteFile
	*/
    public function uploadVoteFile(Request $request, $campaignKey) {
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

        $campaign = ElectionCampaigns::select(['id', 'type'])
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $key = Helper::getNewTableKey('vote_files', 10);

        $voteFile = new VoteFiles;
        $voteFile->key = $key;
        $voteFile->election_campaign_id = $campaign->id;
        $voteFile->name = $fileUpload->getClientOriginalName();
        $voteFile->file_name = $key;
        $voteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_DID_NOT_START');
        $voteFile->user_create_id = Auth::user()->id;
        $voteFile->deleted = 0;

        $newFileName = $key;
        $newFileDestination = config( 'constants.VOTE_FILES_DIRECTORY' );
        $fileUpload->move($newFileDestination, $newFileName);

        $fullPath = config( 'constants.VOTE_FILES_DIRECTORY' ) . $voteFile->file_name;
        $voteFile->file_size = filesize($fullPath);
        $voteFile->save();

        if ( $this->doesUserHavePermission('elections.campaigns.vote_results.execute') ) {
            // Getting the job details
            $job = (new voteFileJob(new VoteFileParser(), $voteFile->id))->onConnection('redis')
                ->onQueue('vote_file');

            // Executing the job which parses the csv file
            $this->dispatch($job);
        }

        $jsonOutput->setData('ok');
    }

	/*
		Function that returns VoteFile by electionCampaignKey and voteFileKey
	*/
    public function getCampaignVoteFile($campaignKey, $voteFileKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($voteFileKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_VOTE_FILE') );
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
		//vote_file
		$runningFile = VoteFiles::select("id" , "process_id")->where([ 'deleted'=> 0 , 'status'=>config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK') , 'key' => $voteFileKey])->first();
		if ($runningFile){
			if (!Redis::get('services:vote_file:'.$runningFile->id)){
				VoteFiles::where('id',$runningFile->id)->update(['status'=> config('constants.VOTE_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($runningFile->process_id, $pids)){
				//VoteFiles::where('id',$runningFile->id)->update(['status'=> config('constants.VOTE_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			//}
		}

        $fields = [
            'id',
            'key',
            'election_campaign_id',
            'row_count',
            'current_row',
            'status',
        ];
        $voteFile = VoteFiles::select($fields)
            ->where(['key' => $voteFileKey, 'deleted' => 0])
            ->first();
        if ( is_null($voteFile) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_VOTER_BOOK') );
            return;
        } else if ($voteFile->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_FILE_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $jsonOutput->setData($voteFile);
    }

	/*
		Function that downloads VoteFile's file by electionCampaignKey and voteFileKey
	*/
    public function downloadVoteFile($campaignKey, $voteFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setBypass(true);

        if ( is_null($campaignKey) ) {
            return Redirect::to('file_not_found');
        }

        if ( is_null($voteFileKey) ) {
            return Redirect::to('file_not_found');
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            return Redirect::to('file_not_found');
        }

        $voteFile = VoteFiles::select(['id', 'name', 'file_name', 'election_campaign_id', 'deleted'])
            ->where('key', $voteFileKey)
            ->first();
        if ( is_null($voteFile) ) {
            return Redirect::to('file_not_found');
        } else if ( $voteFile->deleted == 1 || $voteFile->election_campaign_id != $campaign->id ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.VOTE_FILES_DIRECTORY' ) . $voteFile->file_name;
        $fileSize = filesize($fullPath);

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: text/plain");
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: attachement; filename=" . $voteFile->name);

        while ( !feof($fileHandle) ) {
            $buffer = fread($fileHandle, 1*(1024*1024));
            echo $buffer;
        }

        fclose($fileHandle);
    }

	/*
		Function that returns predicted votes percentages by electionCampaignKey
	*/
    public function getPredictedVotesPercentages($campaignKey) {
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

        $ReportedHourlyVotesSummary = ReportedHourlyVotes::select(
                ['hour',
                    DB::raw('SUM(reported_votes_count) as reported_votes_total'),
                    DB::raw('SUM(reported_supporters_votes_count) as reported_supporters_votes_total'),
                    DB::raw('SUM(reporting_ballot_reported_votes_count) as reporting_ballot_reported_votes_total'),
                    DB::raw('SUM(reporting_ballot_reported_supporters_votes_count) as reporting_ballot_reported_supporters_votes_total')
                ]
            )   
            ->where(['election_campaign_id' => $campaign->id, 'entity_type' => 3 ])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
           $clustersTotalVoters = Cluster::select(
                [
                    DB::raw('SUM(voter_count) as reported_voters_total'),
                    DB::raw('SUM(voter_support_count) as reported_supporters_voters_total'),
                    DB::raw('SUM(reporting_ballot_voter_count) as reporting_ballot_reported_voters_total'),
                    DB::raw('SUM(reporting_ballot_voter_support_count) as reporting_ballot_reported_supporters_voters_total')
                ]
            )
            ->where('election_campaign_id' , $campaign->id)
            ->first();
            // dd($clustersTotalVoters);

            $resultArray = []; 
            $valuesList = [
                'reported_votes_total' => 0, 'reported_supporters_votes_total' => 0,
                'reporting_ballot_reported_votes_total' => 0, 'reporting_ballot_reported_supporters_votes_total' => 0,
            ];

            foreach( $ReportedHourlyVotesSummary as $item){
                if(empty($resultArray[$item->hour])){
                    $resultArray[$item->hour] = [ 'time' => $item->hour];
                }
                foreach ($valuesList as $key => $val){
                    $valuesList[$key] += $item->$key;
                    $resultArray[$item->hour][$key] = $valuesList[$key];

                    $totalKey =  str_replace('votes_total', 'voters_total', $key);

                    $resultArray[$item->hour][$key . '_total'] =  (int) $clustersTotalVoters->$totalKey;
                    // $resultArray[$item->hour][$key . '_percents'] = round((($valuesList[$key] / $clustersTotalVoters->$totalKey)) * 100 , 2);

                }
                
            }


        $jsonOutput->setData($resultArray);
    }

	/*
		Private helpful function that validates time
	*/
    private function validateTime($fieldValue) {
        $rules = [
            'time' => 'date_format:H:i:s'
        ];

        $validator = Validator::make(['time' => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Function that adds predicted votes percentage in specific time 
		by electionCampaignKey and POST params
	*/
    public function addCampaignVotePercentage(Request $request, $campaignKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        $time = $request->input('time', null);
        if ( is_null($time) || !$this->validateTime($time) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_TIME') );
            return;
        }

        $percentage = $request->input('percentage', null);
        if ( is_null($percentage) || !is_numeric($percentage)) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_PERCENTS') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $predictedVotesPercentage = new PredictedVotesPercentages;
        $predictedVotesPercentage->key = Helper::getNewTableKey('predicted_votes_percentages', 5);
        $predictedVotesPercentage->election_campaign_id = $campaign->id;
        $predictedVotesPercentage->time = $time;
        $predictedVotesPercentage->percentage = round( $percentage, 1, PHP_ROUND_HALF_UP);
        $predictedVotesPercentage->save();

        $jsonOutput->setData('ok');
    }

	/*
		Function that updates specific predicted votes percentage in specific time 
		by  percentKey , electionCampaignKey and POST params
	*/
    public function editCampaignVotePercentage(Request $request, $campaignKey, $percentKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($percentKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_KEY') );
            return;
        }

        $percentage = $request->input('percentage', null);
        if ( is_null($percentage) || !is_numeric($percentage)) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_PERCENTS') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $predictedVotesPercentage = PredictedVotesPercentages::where(['key' => $percentKey, 'deleted' => 0])
            ->first();
        if ( is_null($predictedVotesPercentage) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_KEY') );
            return;
        } else if ( $predictedVotesPercentage->election_campaign_id != $campaign->id ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $predictedVotesPercentage->percentage = round( $percentage, 1, PHP_ROUND_HALF_UP);
        $predictedVotesPercentage->save();

        $jsonOutput->setData('ok');
    }

	/*
		Function that deletes specific predicted votes percentage in specific time 
		by percentKey and electionCampaignKey  
	*/
    public function deleteCampaignVotePercentage($campaignKey, $percentKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($percentKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_KEY') );
            return;
        }

        $campaign = ElectionCampaigns::select('id')
            ->where('key', $campaignKey)
            ->first();
        if ( is_null($campaign) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_CAMPAIGN') );
            return;
        }

        $predictedVotesPercentage = PredictedVotesPercentages::where(['key' => $percentKey, 'deleted' => 0])
            ->first();
        if ( is_null($predictedVotesPercentage) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_INVALID_KEY') );
            return;
        } else if ( $predictedVotesPercentage->election_campaign_id != $campaign->id ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_VOTE_PERCENTS_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

        $predictedVotesPercentage->deleted = 1;
        $predictedVotesPercentage->save();

        $jsonOutput->setData('ok');
    }
	
	/*
		Function that updates VoteFile by its key, Default:where edit_type is NULL , then cancells process - status=5 + process_id=NULL
	*/
    public function editCampaignVoteFile(Request $request,$campaignKey, $itemKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_CAMPAIGN') );
            return;
        }

        if ( is_null($itemKey) ) {
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
		

        $voteFile = VoteFiles::where('vote_files.key', $itemKey)
            ->first();
        if ( is_null($voteFile) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } else if ($voteFile->election_campaign_id != $campaign->id) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_SUPPORT_STATUS_UPDATE_KEY_DOES_NOT_BELONG_TO_CAMPAIGN') );
            return;
        }

		if(!$request->input("edit_type")){
			if($voteFile->status == config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK')){
				$voteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_CANCELLED');
				$voteFile->process_id=NULL;
				$voteFile->save();
			}
		}
		else{
			if($request->input("edit_type") == "reload"){ //reload job
				if($voteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_CANCELLED') || $voteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_ERROR')){
					// Getting the job details
					 $job = (new voteFileJob(new VoteFileParser(), $voteFile->id))->onConnection('redis')->onQueue('vote_file');
	 
					// Executing the job which parses the csv file
					 $this->dispatch($job);
					 $voteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_RESTARTED');
					 $voteFile->save();

				}
			}
		}

        $jsonOutput->setData('ok');
    }

    /**
     * Get votes for external API users
     *
     * @param Request $request
     * @return void
     */
    public function getVotes(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $externalUser = Auth::user();
        // $userIsElector = $_SERVER['REMOTE_ADDR'] == $this->ELECTOR_SERVER_IP;
        // dump($_SERVER['REMOTE_ADDR'], $userIsElector);

        $allowedVoteSources = [
            'manual',
            'ivr',
            'form1000',
            'sms',
            'csv_file',
            'mobile',
            'transport',
            'applications'
        ];

        
        $startDate = $request->input('start_date', null);
        $endDate = $request->input('end_date', null);
        
        $getByTimes = $request->input('get_by_times', null);
        if($getByTimes){
            $startDate = date("d/m/Y H:i:s", $startDate);
            if($endDate){
                $endDate = date("d/m/Y H:i:s", $endDate);
            }
        }
        $ballot_mi_id_decimal = $request->input('ballot_mi_id_decimal', true);

        $ballot_mi_id_decimal = is_string($ballot_mi_id_decimal) ? \strtolower($ballot_mi_id_decimal) :$ballot_mi_id_decimal;

        $currentCampaign = ElectionCampaigns::currentCampaign();

        $electionDate = Carbon::parse($currentCampaign->election_date)->startOfDay();
        $now = Carbon::now();
        $today = $now->startOfDay();
        //If today is election day:           
        if (!env('ELECTION_DAY_DEV_MODE', false) && $today->diffInDays($electionDate) != 0) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTIONS_DATE_NOT_ARRIVED') );
            return;            
        }

        if (!$startDate) {
            $jsonOutput->setErrorCode( config('errors.elections.MISSING_START_DATE') );
            return;              
        }
        $regEx = '#([0-2][0-9]/[0-2][0-9]/[0-2][0-9][0-9][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9])#';

        if (!preg_match($regEx, $startDate)) {
            $jsonOutput->setErrorCode( config('errors.elections.WRONG_PARAMS') );
            return;              
        }

        if ($endDate) {
            if (!preg_match($regEx, $endDate)) {
                $jsonOutput->setErrorCode( config('errors.elections.WRONG_PARAMS') );
                return;              
            }            
        }

        $startDate = Carbon::createFromFormat("d/m/Y H:i:s", $startDate);

        $votesQuery = Votes::withVotersInElectionCampaign();
        $votesQuery->withVoteSource();

        if($externalUser->name == "likud"  || $ballot_mi_id_decimal === 'false' || !$ballot_mi_id_decimal ){
            $ballotQuery = 'ballot_boxes.mi_id as ballot_box_mi_id';
        }else{
            $ballotQuery =  DB::raw('insert(ballot_boxes.mi_id, char_length(ballot_boxes.mi_id), 0, ".") as ballot_box_mi_id');
        }
        // dd($ballotQuery);
        $fields = [
            'cities.mi_id as city_mi_id',
            $ballotQuery,
            'voters_in_election_campaigns.voter_serial_number',
            DB::raw('DATE_FORMAT(votes.vote_date, "%d/%m/%Y %H:%i:%s") as vote_date')
        ];
    
        $votesQuery->withCluster()
        ->join('cities', 'cities.id', '=', 'clusters.city_id');

        $votesQuery->select($fields);

        $votesQuery->whereIn('vote_sources.system_name', $allowedVoteSources);

        // if ($externalUser->name == "bingo") {//LIMIT BINGO TO SPECIFIC BALLOTS
        //     $votesQuery->join('external_user_ballots', function($join) use ($externalUser) {
        //         $join->on('external_user_ballots.external_user_id', DB::raw($externalUser->id))
        //             ->on('external_user_ballots.ballot_box_id', 'voters_in_election_campaigns.ballot_box_id');
        //     });
        // }
        $votesQuery->where('votes.created_at' ,'>=', $startDate)
            ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id);
        if ($endDate) {
            $endDate = Carbon::createFromFormat("d/m/Y H:i:s", $endDate);
            $votesQuery->where('votes.created_at' ,'<=', $endDate);
        }
        $votes = $votesQuery->get();
        $jsonOutput->setData($votes);
    }
}