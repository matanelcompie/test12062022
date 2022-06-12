<?php

namespace App\Http\Controllers\votes;

use Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;

use Carbon\Carbon;
use App\API\Sms\Sms;

use App\Models\Voters;
use App\Models\Votes;
use App\Models\VoteSources;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;

use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\ActionController;
use App\Libraries\Services\IncomingMessageService;

use Redirect;


class VoteReportingController extends Controller {
    private $fullClusterNameQuery = 'CONCAT (IFNULL(clusters.prefix,"") ,IF((IsNull(clusters.prefix) OR clusters.prefix = "") ,""," - "), clusters.name)';
    
	/**
	 * Base function for returning the base view of mobile reporting screen
	 *
	 * @return view
	 */
    public function index(Request $request, $vote_reporting_key) {
        $VoteReporting = app()->make("VoteReporting");

        //redirect to login if in maintenance
        $maintenance = config('app.maintenance');
        if ($maintenance) return Redirect::to('logout');

        //set base url, username, and csrf token for react
        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0)? true : false;
        $baseUrl = str_replace(["http://", "https://", request()->server('SERVER_NAME'),
        ":" . request()->server('SERVER_PORT')], ['','','',''], $baseUrl);

        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();
        $data['reactHash'] = Cache::get('react_hash', '0');
        $data['env'] = config('app.env');

        $data['reactJs'] = "mobile.js";
        $data['css'] = "mobile.css";
		$data['cityPhone'] = '';
        $reporterId = ElectionRolesByVoters::select('election_roles_by_voters.id' , 'election_roles_by_voters.assigned_city_id' , 'cities.assign_leader_phone_number as assign_phone_number')
        ->where('election_roles_by_voters.vote_reporting_key', $vote_reporting_key)->leftJoin('cities','cities.id','=','election_roles_by_voters.assigned_city_id')->first();

        $data['isValidReporter'] = $reporterId ? 1 : 0;
		
		if($reporterId && $reporterId->assign_phone_number){
			$data['cityPhone']= $reporterId->assign_phone_number;
		}
        // dd($data);
        $VoteReporting->resetVotingReportHistoryInSession();

        //returning the view
        return view('votes/mobile', $data);
    }
    public function login(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");

       $ballot_mi_id = $request->input('ballot_mi_id');
       $vote_reporting_key = $request->input('vote_reporting_key');

        $currentCampaign = ElectionCampaigns::currentCampaign(true);
        $currentCampaignId = $currentCampaign->id;

        if(!$this->checkVoteDate($currentCampaign)){
            $jsonOutput->setErrorCode(config('errors.mobile.ELECTIONS_DATE_NOT_ARRIVED'));
            $jsonOutput->setErrorData($currentCampaign, 400);
			return;
        }
        $ballotEntitytype = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');

        $fileds=[
            //voters
            'voters.id as reporting_voter_id', 'voters.key', 'voters.first_name', 'voters.last_name', 'voters.personal_identity',
            //election role
			'election_roles_by_voters.id as election_role_voter_id',
			'election_roles.system_name as role_system_name',
	 
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.vote_reporting_key',
            //cluster address
            DB::raw($this->fullClusterNameQuery . ' as cluster_name'),
            'clusters.street as cluster_street', 'clusters.house as cluster_house',
            'cities.name as cluster_city_name',
            // ballot boxes
            'ballot_boxes.mi_id as ballot_mi_id',
            'ballot_boxes.id as ballot_id',
            //geographic areas
            'election_role_by_voter_geographic_areas.id as role_geographic_area_id',
            'election_role_by_voter_geographic_areas.id as geographic_areas_id',
            ];
        $whereArray=[
            'election_role_by_voter_geographic_areas.entity_type' => $ballotEntitytype,
            'election_roles_by_voters.election_campaign_id' => $currentCampaignId,
            'ballot_boxes.mi_id' => $ballot_mi_id,
            'election_roles_by_voters.vote_reporting_key' => $vote_reporting_key,
        ];
        
        $voteReportingRole = ElectionRolesByVoters::select($fileds)
            ->withElectionRoleGeographical()
            ->withElectionRole()
            ->withVoter() 
            ->join('ballot_boxes','election_role_by_voter_geographic_areas.entity_id','ballot_boxes.id')
            ->join('clusters','ballot_boxes.cluster_id','clusters.id')
            ->join('cities','clusters.city_id','cities.id')
            ->where($whereArray)
            ->first();

        $VoteReporting->resetVotingReportHistoryInSession();

        if(!$voteReportingRole){
            $jsonOutput->setErrorCode(config('errors.mobile.ELECTIONS_ROLE_NOT_FOUND'));
            $jsonOutput->setErrorData(['ballot_mi_id' => $ballot_mi_id], 400);
            return;
        }

        //Delete all other geo reportes:
        ElectionRolesGeographical::where('entity_type', $ballotEntitytype)
        ->where('entity_id', $voteReportingRole->ballot_id)->update([ 'current_reporting' => false]);

        //Delete for current reporter other geo reportes:
        $currentReporterRolesGeographical = ElectionRolesGeographical::select('election_role_by_voter_geographic_areas.id as role_geographic_area_id')
        ->withElectionRolesByVoters()->where('election_roles_by_voters.voter_id', '=', $voteReportingRole->reporting_voter_id)->get();
        $ids = [];
        foreach ($currentReporterRolesGeographical as $role) { $ids[] = $role->role_geographic_area_id; }

        ElectionRolesGeographical::whereIn('id', $ids)->update([ 'current_reporting' => false]);

        // Save current reporter
        $electionRolesGeographical =  ElectionRolesGeographical::find($voteReportingRole->role_geographic_area_id);
    
         
		 
		$voteSource = VoteSources::select('id')->where('system_name', 'mobile')->first();
		$voteSourceId = !empty($voteSource) ? $voteSource->id : null;
		
		$electionRolesGeographical->current_reporting = true;
		$electionRolesGeographical->vote_source_id= $voteSourceId;
	  
        $firstLogin = false;
        if($electionRolesGeographical->arrival_date == null){
            $firstLogin = true;
            $electionRolesGeographical->arrival_date = Carbon::now();
        }
        $electionRolesGeographical->save();
		
        if ($firstLogin) {
    		$verificationBallotMessageSMS = config('constants.activists.verificationBallotMessageSMS');
    		$smsSendCode = (Sms::connection('telemarketing')->send($voteReportingRole->phone_number, $verificationBallotMessageSMS)) ? true : false;
    		if($smsSendCode){
    				IncomingMessageService::saveSmsMessage($voteReportingRole->election_role_voter_id, $voteReportingRole->role_system_name, $verificationBallotMessageSMS , $voteReportingRole->phone_number);
    		}
        }
		
        $sessionData = [
            'ballot_box_id' => $voteReportingRole->ballot_id,
            'reporting_voter_id' => $voteReportingRole->reporting_voter_id,
            'geographic_areas_id' => $voteReportingRole->geographic_areas_id
        ];
        $VoteReporting->saveVoteReportSession($sessionData);

        $jsonOutput->setData($voteReportingRole);
    }
    private function checkVoteDate(&$currentCampaign){
        $currentFullDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $currentDate = substr ($currentFullDate, 0, 10);
        $currentTime = substr ($currentFullDate, 11);
        $valid = true;
        if($currentDate != $currentCampaign->election_date){
            $valid = false;
        }
        if($currentTime < $currentCampaign->vote_start_time || $currentTime > $currentCampaign->vote_end_time){
            $valid = false;
        }
        if(!$valid){
            $jd = gregoriantojd(substr($currentDate, 5, 2), substr($currentDate, 8, 2),  substr($currentDate, 0, 4));
            $str = jdtojewish($jd, true, CAL_JEWISH_ADD_GERESHAYIM);
            $str1 = iconv ('WINDOWS-1255', 'UTF-8', $str);
            $currentCampaign->hebrewDate = $str1;
        
        }
        // dd($currentCampaign->toArray());
        return $valid;
    }
    public function logout(){
        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");

        $VoteReporting->resetVotingReportHistoryInSession();
        $VoteReporting->resetVotingReportSession();
        $jsonOutput->setData('ok');
    }
    public function searchVoter(Request $request){

        //set reading from master
        $master = DB::connection('master')->getPdo();
        DB::setReadPdo($master);

        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");
        
        $reporterData = $VoteReporting->getVoteReportSession();
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $voter_serial_number = $request->input('voter_serial_number');
        $fileds = [
            //voters
            'voters.id as voter_id', 'voters.key as voter_key', 'voters.first_name',
            'voters.last_name', 'voters.personal_identity','voters_in_election_campaigns.voter_serial_number',
            //votes
            DB::raw("(SELECT votes.id FROM votes WHERE votes.election_campaign_id = $currentCampaignId
            AND  votes.voter_id = voters.id limit 1) as vote_id")
            ];
        $whereArray = [
            'voters_in_election_campaigns.voter_serial_number' => $voter_serial_number,
            'voters_in_election_campaigns.election_campaign_id' => $currentCampaignId,
            'voters_in_election_campaigns.ballot_box_id' => $reporterData->ballot_box_id,
        ];
        
        $voterData = Voters::select($fileds)
        ->withVoterInElectionCampaigns()
        ->where($whereArray)
        ->first();
        $jsonOutput->setData($voterData);

    }
    public function addVoteToVoter(Request $request, $voterKey ){

        //set reading from master
        $master = DB::connection('master')->getPdo();
        DB::setReadPdo($master);

        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");
        $reporterData = $VoteReporting->getVoteReportSession();

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;
        
        $fileds = [
            //voters
            'voters.id as voter_id','voters.key as voter_key', 'voters.first_name','voters.last_name',
             'voters.personal_identity','voters_in_election_campaigns.voter_serial_number',
             'voters_in_election_campaigns.id as voters_in_election_campaigns_id',
             'votes.id as vote_id',
        ];
        $currentVoter = Voters::select($fileds)
        ->withVoterInElectionCampaigns()
        ->withVotes()
        ->where( 'voters.key', $voterKey )
        ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId)
        ->first();
        // dd($currentVoter->toArray());

        if ( !$currentVoter) { $jsonOutput->setErrorCode(config('errors.mobile.VOTER_DOES_NOT_EXIST')); return;}
        if ( !is_null($currentVoter->vote_id) ) { $jsonOutput->setErrorCode(config('errors.mobile.VORER_ALREADY_HAD_VOTED')); return;}
        
        $newVote = null;
        
        $VoterElectionsController = new VoterElectionsController();
        $voteSource = VoteSources::select('id')->where('system_name', 'mobile')->first();
        $voteSourceId = !empty($voteSource) ? $voteSource->id : null;
         //Need to add entity_type!!!
        $voteExtraData = [
            'topicName' => 'elections.votes.mobile',
            'user_create_id' => 0,
            'reporting_voter_id' => $reporterData->reporting_voter_id,
            'entity_id' => $currentVoter->voters_in_election_campaigns_id
        ];
        $newVote =  $VoterElectionsController->addVote($currentVoter->voter_id, $voteSourceId, $voteExtraData); 
        if($newVote){
            $VoteReporting->addVotingReportHistoryInSession($currentVoter->toArray());
            $electionRolesGeographical= ElectionRolesGeographical::find($reporterData->geographic_areas_id);

            // Update reporter reporting status
            if(!$electionRolesGeographical->correct_reporting){
                $electionRolesGeographical->correct_reporting = 1;
                $electionRolesGeographical->save();
                $ballotBox = BallotBox::find($reporterData->ballot_box_id);
            // Update ballotBox reporting status
               if(!$ballotBox->reporting)
                $ballotBox->reporting = 1;
                $ballotBox->save();

                $VoteReporting->addBallotToUpdateInCommandsCounters($reporterData->ballot_box_id);
           }
        }
        $jsonOutput->setData($newVote);
    }
    public function cancelVoteToVoter ($voterKey ) {
        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");
        $reporterData = $VoteReporting->getVoteReportSession();

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;


        $currentVoter = Voters::select('id')->where( 'key', $voterKey )->first();
        if ( !$currentVoter ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        } 
        $votingReportHistoryData = $VoteReporting->deleteVotingReportHistoryFromSession($currentVoter->id);
        if($votingReportHistoryData['voteExistInSession']){
            $vote = Votes::select('id')
            ->where( 'voter_id', $currentVoter->id )
            ->where( 'election_campaign_id',$currentCampaignId )
            ->first();
            if($vote){
                $vote->delete();
                $historyArgsArr = [
                    'topicName' => 'elections.votes.manual.delete',
                    'user_create_id' => 0,
                    'models' => [
                        [
                            'referenced_model' => 'Votes',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $vote->id,
                        ]
                    ]
                ];
                ActionController::AddHistoryItem($historyArgsArr);
            }
        }
        $jsonOutput->setData($votingReportHistoryData['votingReportHistory']);
	}

    public function getVotingReportHistory(){
        $jsonOutput = app()->make("JsonOutput");
        $VoteReporting = app()->make("VoteReporting");

       $votingReportHistory = $VoteReporting->getVotingReportHistoryInSession();
       if(!$votingReportHistory){
            $votingReportHistory = [];
       }
       $jsonOutput->setData($votingReportHistory);
    }

    /**
     * redirect tiny url for mobile link
     *
     * @param Request $request
     * @param string $voteKey
     *
     * @return void
     */
    public function tinyUrl(Request $request, $voteKey) {
        return redirect('votes/reporting/'.$voteKey);
    }

}