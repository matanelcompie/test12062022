<?php

namespace App\Http\Controllers\dashboards;

namespace App\Http\Controllers;

use App\Libraries\Helper;
use App\Libraries\Services\municipal\MunicipalCaptainActivistReport;
use App\Libraries\Services\municipal\MunicipalQuartersService;
use App\Libraries\Services\municipal\MunicipalQuartersSupportStatusService;
use App\Libraries\Services\municipal\MunicipalQuartersVotesService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;
use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Libraries\Services\ServicesModel\ElectionRoleVoterGeoAreasService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportPartyService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\ServicesModel\VoterInElectionCampaignService;
use App\Models\ActivistsTasksSchedule;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionVotesReportParty;
use App\Models\ElectionVotesReportSource;
use App\Models\VotersInElectionCampaigns;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class QuartersDashboardController extends Controller
{
    /*
		Functions that renders the needed ui by cti URL
	*/
    public function index(Request $request)
    {
        //redirect to login if in maintenance
        $maintenance = config('app.maintenance');
        if ($maintenance) return Redirect::to('logout');

        //Set original url in session
        $originalRoute = $request->path();

        $request->session()->put('original_url', $originalRoute);
        //set base url, username, and csrf token for react
        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0) ? true : false;
        $baseUrl = str_replace("http://", "", $baseUrl);
        $baseUrl = str_replace("https://", "", $baseUrl);
        $baseUrl = str_replace(request()->server('SERVER_NAME'), "", $baseUrl);
        $baseUrl = str_replace(":" . request()->server('SERVER_PORT'), "", $baseUrl);

        $isProdEnv = env('DB_HOST') == config('app.production_db_ip', '10.192.138.3');

        $data['env'] = $isProdEnv ? 'production' : 'dev';
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();

        return view('/quarters-dashboard', $data);
    }

    //get present dashboard activist with present of specific day
    public static function getPresentsDayByType(Request $request, $type, $id = null, $filter_city = null)
    {

        // try {

        $jsonOutput = app()->make("JsonOutput");
        $treeDashboardItems = MunicipalQuartersService::getMunicipalEntityActivistsSummery($type, $id, $filter_city);
        $jsonOutput->setData($treeDashboardItems);

        // } catch (\Throwable $th) {
        //     //throw $th;
        // }


    }

    //dashboard present support status voter by entity geo
    public static function getPresentVoterStatusSupportByGeo(Request $request, $type, $id = null, $filter_city = null)
    {

        $jsonOutput = app()->make("JsonOutput");
        $treeDashboardItems = MunicipalQuartersSupportStatusService::getMunicipalEntitySupportStatusSummery($type, $id, $filter_city);
        $jsonOutput->setData($treeDashboardItems);
    }

    public static function getPresentsDay(Request $request)
    {
        $currentElectionCampaign = ElectionCampaigns::currentCampaign();
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $jsonOutput = app()->make("JsonOutput");
        $presets = round(ActivistsTasksSchedule::getPresentForTodayByRole($role_id, $currentElectionCampaign->id));
        $jsonOutput->setData($presets);
    }

    //function return details votes by geo for all parties
    public static function getDetailsReportVoteByGeo(Request $request, $entityTypeGeo, $arrValueEntity)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $arrValueEntity=json_decode($arrValueEntity,true);
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $LastElectionCampaigns = ElectionCampaigns::previousCampaign();
            $detailsEntityPartyVotes = MunicipalQuartersVotesService::getSumReportVotesByMunicipalTypeForAllParties($entityTypeGeo, $arrValueEntity,$currentElectionCampaign->id,$LastElectionCampaigns->id);
            $jsonOutput->setData($detailsEntityPartyVotes);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    
    public function downLoadExcelActivistCaptainDetails(Request $request,$entityTypeGeo, $entityId){
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
       
        try {
            MunicipalCaptainActivistReport::downloadCsvCaptainActivist($entityTypeGeo,$entityId);
            
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }

    }

    //function return global information for all votes in election-its for global banner in information screen votes
    public static function getGlobalSummeryVotesInformation(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        try {
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $information=new stdClass();
            $information->count_election_voters=intval(VoterInElectionCampaignService::CountVotersInElectionCampaign($currentElectionCampaign->id));
            $information->count_valid_votes=intval(ElectionVotesReportService::getCountValidVotesByElectionCampaign($currentElectionCampaign->id));
            $information->count_not_valid_votes=intval(ElectionVotesReportService::getCountNotValidVotesByElection($currentElectionCampaign->id));
            
            $information->count_all_votes=$information->count_valid_votes+$information->count_not_valid_votes;
            $information->present_votes=Helper::getPresent(intval($information->count_election_voters),$information->count_all_votes,false,false);
           
            $jsonOutput->setData($information);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function downLoadExcelReportVotes(Request $request, $entityTypeGeo, $arrValueEntity){
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        try {
            $arrValueEntity=json_decode($arrValueEntity,true);
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $csv=MunicipalQuartersVotesService::downloadExcelFileReportVotesByGeo($currentElectionCampaign->id,$entityTypeGeo,$arrValueEntity);
           // $jsonOutput->setData($csv);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
        
    }

    public  function getDetailsEndVotesByBallotBox(Request $request,$ballotBoxId){
        $jsonOutput = app()->make("JsonOutput");
        $object = (object)($request->all());
        try {
            $ballotBoxObj=BallotBox::select()->where('id',$ballotBoxId)->first();
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $details = new stdClass();
            $details->count_voters_ballot = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxObj->id, $currentElectionCampaign->id); //count voter in ballot box
            $details->valid_votes_count_activist = $ballotBoxObj->valid_votes_count_activist; //count valid votes
            $details->not_valid_votes_count_activist = $ballotBoxObj->not_valid_votes_count_activist; //count not valid vote
            $details->count_voted_in_ballot = $details->not_valid_votes_count_activist + $details->valid_votes_count_activist;
            $details->sum_valid_parties_votes = BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxObj->id, $currentElectionCampaign->id);
            //list parties details and count activist report votes
            $details->list_parties_ballot = BallotBoxService::getListReportVotesForPartyByBallotBoxId($ballotBoxObj->id,$currentElectionCampaign->id);

            $jsonOutput->setData($details);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function get  count valid votes, not valid votes and count all votes,ballot_mi_id,and 
    //response_message 0- not request after warning 1-yes after warning
    //function check if valid votes+not valid=All count
    //function check if All count = all votes in this ballot its throw warning;
    //function check if all count <= count that can voted in ballot its throw warning
    public  function setValidVotesAndNotValidVotesForballotBox(Request $request)
    {
      
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");
      

        try {
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $ballotBoxId=$object->ballot_box_id;
            $valid_votes = $object->valid_votes_count_activist; //valid
            $not_valid_votes = $object->not_valid_votes_count_activist; //not valid
            $count_votes_report_activist = $object->count_voted_in_ballot; //valid+not valid
          
            //check required
            if (strcmp($valid_votes, '') == 0 || strcmp($not_valid_votes, '') == 0 || strcmp($count_votes_report_activist, '') == 0)
                throw new Exception(config('errors.elections.ERROR_EMPTY_FIELDS'));
                

            //check if its real
            if ($valid_votes + $not_valid_votes != $count_votes_report_activist)
                throw new Exception(config('errors.elections.ERROR_COUNT_VALID_UN_VALID'));



            //count voter need voted
            $countNeedVoted = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxId,$currentElectionCampaign->id);

            if ($count_votes_report_activist > $countNeedVoted)
                throw new Exception(config('errors.elections.ERROR_COUNT_BALLOT_VOTED_MORE_NEED'));

            //check if sum votes in parties== valid votes count
            // $sum_valid_parties_votes = BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxId,$currentElectionCampaign->id);

            // if ($sum_valid_parties_votes != $valid_votes)
            //     throw new Exception(config('errors.elections.ERROR_COUNT_VALID_VOTES'));

            //count mark voted in ballot
            // $countMarkVoted = BallotBoxService::getCountMarkVotedBySystem($ballotBoxId,$this->currentElectionCampaign->id);

            // if (is_null($warning_response) && $countMarkVoted != $count_votes_report_activist) {
            //     $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.elections.WARNING_COUNT_BALLOT_VOTED_MORE_NEED'));
            //     $response = array('warning_message' => $warning_message);
            //     $jsonOutput->setData($response);
            //     return;
            // } else {
                //update votes for ballot box 
                BallotBoxService::updateCountValidAndNotValidCountVotes($ballotBoxId, $valid_votes, $not_valid_votes);
                $AllCountVotes=$valid_votes+$not_valid_votes;
                $reportSourceId=ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$shas_report);
                ElectionVotesReportService::updateCountVotesAndNotValidVotesByReportSource($currentElectionCampaign->id,$reportSourceId,$AllCountVotes,$not_valid_votes,$countNeedVoted,$ballotBoxId);
               
           // }

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


        //function set count votes for party in cluster
        public function setCountVotesForPartyByBallotBox(Request $request)
        {
            $object = (object)($request->all());
            $jsonOutput = app()->make("JsonOutput");
            $currentElectionCampaign = ElectionCampaigns::currentCampaign();
            $ballotBoxId=$object->ballot_box_id;

            try {
                $party_key = $object->party_key;
                $party=ElectionCampaignPartyLists::select()->where('key',$party_key)->first();
                $votes_count = $object->votes_count;
                  //count voter need voted
                $countNeedVoted = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxId, $currentElectionCampaign->id);
                //sum votes for another party for check if exceed countNeedVoted
                $SumValidVotesAnotherParty= BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxId, $currentElectionCampaign->id,$party_key);
                if($SumValidVotesAnotherParty+$votes_count>$countNeedVoted)
                throw new Exception(config('errors.elections.ERROR_COUNT_PARTY_VOTE'));
                
                BallotBoxService::setCountVotesInBallotBoxByParty($ballotBoxId, $party_key, $votes_count);
                //update in table report votes by source
                $reportSourceId=ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$shas_report);
                ElectionVotesReportService::updatePartyCountForReportSource($currentElectionCampaign->id,$reportSourceId,$party->id,$votes_count,$ballotBoxId);
                $jsonOutput->setData(true);
            } catch (\Exception $e) {
                $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
            }
        }

    
}
