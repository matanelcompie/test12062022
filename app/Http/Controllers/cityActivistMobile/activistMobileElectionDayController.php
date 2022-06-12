<?php

namespace App\Http\Controllers\cityActivistMobile;

use App\Http\Controllers\CityActivistsController;
use Session;

use Carbon\Carbon;
use App\Libraries\Helper;
use App\Libraries\JsonOutput;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Libraries\Services\ActivistApi\ActivitiesCityMobileServices;
use App\Libraries\Services\GoogleMap\GoogleMapService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\BannerLinkService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\ElectionRoleShiftService;
use App\Libraries\Services\ServicesModel\ElectionRoleVoterGeoAreasService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportSourceService;
use App\Libraries\Services\ServicesModel\VoterInElectionCampaignService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionVotesReportSource;
use App\Models\Voters;
use DateTime;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use stdClass;

//class manage function in election day 
class activistMobileElectionDayController
{


    protected $currentElectionCampaign;

    public function __construct()
    {
        $this->currentElectionCampaign = ElectionCampaigns::currentCampaign();
    }
    //-----------------------------captain fifty ---------------------------------------

    public function ElectionDay_updateVoterByCaptain(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {

            $object = (object)($request->all());
            //voter key
            $voter_key = $object->personal_identity;
            $voter = VoterDetailsService::getVoterByKey($voter_key);

            //-------------------set handled------------------------
            //captain voter key
            $captain_voter_id = Auth::user()->voter_id;

            //set handled by captain fifty for voter in  connect him
            ActivitiesCityMobileServices::setHandledByCaptainFifty($captain_voter_id, $voter->id, $this->currentElectionCampaign->id, $object->handled);
            //-----------------------set transport--------------------------


            //save need Transportations
            $tans = VoterDetailsService::SaveVoterTransportations($voter->id, $this->currentElectionCampaign->id, $object->need_transportation, 0, null);

            $VoterAfterSave = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, null);
            $jsonOutput->setData($VoterAfterSave);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }



    //--------------------------------cluster--------------------------------------------

    public function getBallotDetailsOfBallotMemberByClusterLeader(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $ballot_mi_id = $object->ballot_mi_id;
            $activist_voter_key = $object->personal_identity;

            //activist key
            $activist_voter = VoterDetailsService::getVoterByKey($activist_voter_key);
            //ballot box id by activist key and ballot mi id
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($ballot_mi_id, $activist_voter->id, $this->currentElectionCampaign->id);


            $countVoterInBallot = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxId, $this->currentElectionCampaign->id);
            $countSupportVoted = BallotBoxService::getCountFinalSupportMarkVoted($ballotBoxId, $this->currentElectionCampaign->id);
            $countMarkVoted = BallotBoxService::getCountMarkVotedBySystem($ballotBoxId, $this->currentElectionCampaign->id);

            $detailsBallot = new stdClass();
            $detailsBallot->count_voter = $countVoterInBallot;
            $detailsBallot->present_voted = Helper::getPresent($countVoterInBallot, $countMarkVoted);
            $detailsBallot->present_support_voted = Helper::getPresent($countVoterInBallot, $countSupportVoted);
            $detailsBallot->list_activist_ballot_member = BallotBoxService::getCountVotesByPartTimeForActivistInBallot($activist_voter->id, $ballotBoxId, $this->currentElectionCampaign->id);

            $jsonOutput->setData($detailsBallot);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function mark voted or un voted for voter by voter_key
    //function get vote 1- mark voted and 0-mark not voted by application
    public function ClusterVotedVoteByVoterKey(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voter_key = $object->personal_identity; //voter key
            $vote = $object->vote; // mak vote oe un vote

            $voterInCampaign = VoterInElectionCampaignService::getObjectByVoterKey($voter_key,$this->currentElectionCampaign->id);
            ActivitiesCityMobileServices::setVotedVoter($voterInCampaign->voter_id, $this->currentElectionCampaign->id, $vote);

            $VoterAfterSave = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, null);
            $jsonOutput->setData($VoterAfterSave);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //------------------------------ballot member-----------------------------------------

    //function check if user is ballot member by specific ballot box
    //function get ballot mi id and tz of voter in ballot
    //function check if user is ballot member and has this voter in ballot box
    //function return banner link and ballot mi id
    public  function getDashboardBallotMember(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $voterActivistId = Auth::user()->voter_id;
            $object = (object)($request->all());
            $warning_response = null;

            //its warning for checking if another ballot member in ballot box
            if (isset($object->warning_response))
            $warning_response = $object->warning_response;

            $voter_personal_identity = $object->personal_id_number;
            //remove start zero of personal tz
            $voter_personal_identity = Helper::trimStartZero($voter_personal_identity);

            $ballot_box_Number = BallotBox::resetLogicMiBallotBox($object->ballot_mi_id); //remove logic ballot box number
            //get ballotBox by activist voter id and ballotBox mi id
            $ballotBoxObj = BallotBox::getBallotBoxIdByMiId_Activist_voter_id($ballot_box_Number, $voterActivistId, $this->currentElectionCampaign->id); //search id of ballot box number
            if (!$ballotBoxObj)
                throw new Exception(config('errors.payments.ERROR_DELETE_PAYMENT_BY_ELECTION_ROLE_VOTER'));

            $userLocation=$object->location;
            $cluster=Cluster::select('clusters.*','cities.name as city_name')->withCity()->where('clusters.id',$ballotBoxObj->cluster_id)->first();
           
            
            $ballotBoxId = $ballotBoxObj->id;
            $electionRoleVoterGeographic = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($voterActivistId, $ballotBoxId, $this->currentElectionCampaign->id);
            //if need check user location
            if($electionRoleVoterGeographic->not_check_location!=1)
            $inBallotBox=$this->checkLocationBallotMemberInBallot($cluster,$userLocation,$voterActivistId);
            $ballotVoter = VoterDetailsService::getDetailsBallotBoxByPersonalIdentity($voter_personal_identity, $this->currentElectionCampaign->id);

            //check if the voter in ballot box
            if (env('ACTIVISTS_SYSTEM_DEV_MODE')==false && (!$ballotVoter || $ballotVoter->id != $ballotBoxObj->id))
                throw new Exception(config('errors.elections.PERSONAL_IDENTITY_NOT_FIRST'));

            
            //check if the next ballot member in ballot
            if(is_null($warning_response)){
                $electionRoleId = ElectionRolesByVoters::where('id', $electionRoleVoterGeographic->election_role_by_voter_id)->first()->election_role_id;
                $beforeInBallot = ActivistsAllocationsAssignmentsService::checkIfBeforeBallotMemberInBallot($electionRoleVoterGeographic, $electionRoleId,$this->currentElectionCampaign->id);

                if ($beforeInBallot == true) {
                    $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.elections.WARNING_ENTER_BALLOT_SHIFT'));
                    $response = array('warning_message' => $warning_message);
                    $jsonOutput->setData($response);
                    return;
                }
            }
            //set arrival date on insert ballot member in ballot
            $electionRoleGeo=ActivistsAllocationsAssignmentsService::setArrivalDateBallotMember($voterActivistId, $ballotBoxObj->id, $this->currentElectionCampaign->id);

            //check if the activist is counter activist return ballot_box is closed, or its time for all ballot closed
            $systemNameRole=ElectionRoles::getSystemNameById($electionRoleGeo->election_role_id);
            $allBallotClosed=ElectionCampaignsService::checkIfTimeBallotBoxClosed();
            if($allBallotClosed || strcmp($systemNameRole,config('constants.activists.election_role_system_names.counter'))==0)
            $votes_closed=1;
            else
            $votes_closed=0;//$ballotBoxObj->votes_closed;
            
            $Dashboard = new stdClass();
            $Dashboard->banner_link = BannerLinkService::getBannerLinksByName('election-day');
            $Dashboard->ballot_mi_id = BallotBox::getLogicMiBallotBox($ballotBoxObj->mi_id);
            $Dashboard->votes_closed=$votes_closed;
            $Dashboard->city_name =$cluster->city_name;
            $jsonOutput->setData($Dashboard);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //first the function check if ballot member arrived in ballot anf not exit
    //function mark voted or un voted for voter by voter_key
    //function get vote 1- mark voted and 0-mark not voted by application
    public function BallotMemberVotedVoteByVoterKey(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voter_key = $object->personal_identity; //voter key
            $vote = $object->vote; // mak vote oe un vote

            $voterInCampaign = VoterInElectionCampaignService::getObjectByVoterKey($voter_key, $this->currentElectionCampaign->id);
            $allBallotClosed=ElectionCampaignsService::checkIfTimeBallotBoxClosed();
            
            if($allBallotClosed)
            throw new Exception(config('errors.elections.ERROR_CLOSE_BALLOT_BOX'));

            
            $isCanMark = $this->checkMarkVotedIfBallotMemberInBallots(Auth::user()->voter_id, $voterInCampaign->ballot_box_id, $this->currentElectionCampaign->id, $vote);

            if ($isCanMark) {
                ActivitiesCityMobileServices::setVotedVoter($voterInCampaign->voter_id, $this->currentElectionCampaign->id, $vote);
                $VoterAfterSave = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, null);
                $jsonOutput->setData($VoterAfterSave);
            } else
                $jsonOutput->setErrorCode(config('errors.elections.ERROR_MARK_VOTED'), 400);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }



    //function get details of ballot member and check if ballot member at ballot
    //before mark voted to vote
    //if the value vote is true , the function update current_reporting field
    public function checkMarkVotedIfBallotMemberInBallots($ballot_member_voter_id, $ballot_box_id, $election_campaign_id, $value_vote)
    {
        $statusBallotMember = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($ballot_member_voter_id, $ballot_box_id, $election_campaign_id);
        //$statusBallotMember=
        //ballot member not start shift;
        if (is_null($statusBallotMember->arrival_date) || strcmp($statusBallotMember->arrival_date, '') == 0)
            throw new Exception(config('errors.elections.ERROR_MARK_VOTED_NOT_ENTER'));

        //ballot member exit shift       
        if (!is_null($statusBallotMember->report_finished_date) || strcmp($statusBallotMember->report_finished_date, '') != 0)
            throw new Exception(config('errors.elections.ERROR_MARK_VOTED_EXIT'));

        if ($value_vote == true || $value_vote == 1) {

            if ($statusBallotMember->correct_reporting != 1)
                $statusBallotMember->correct_reporting = 1; //first time vote voted

            $statusBallotMember->current_reporting = 1;

            $statusBallotMember->save();
        }

        return true;
    }

    //function check if  if activist is in shift counter
    public static function checkCanReportPartyVotes($statusBallotMember){

        //--check if activist in shift include counter
        $election_role_shift_id=$statusBallotMember->election_role_shift_id;
        $roleShiftObj=ElectionRoleShiftService::getShiftRoleObjectById($election_role_shift_id);
        
        $inCounter=ElectionRoleShiftService::isInCounterShift($roleShiftObj->system_name);

        if(!$inCounter)
        throw new Exception(config('errors.elections.ERROR_NOT_COUNTER'));

        //--check if arrive time counter
        $isStartReportPartyTime=ElectionCampaignsService::checkIfStartArriveReportPartyVotes();
        if(!$isStartReportPartyTime && !env('ACTIVISTS_SYSTEM_DEV_MODE'))
        throw new Exception(config('errors.elections.ERROR_NOT_START_REPORT_PARTY'));

        return true;
    }


    //function get  count valid votes, not valid votes and count all votes,ballot_mi_id,and 
    //response_message 0- not request after warning 1-yes after warning
    //function check if valid votes+not valid=All count
    //function check if All count = all votes in this ballot its throw warning;
    //function check if all count <= count that can voted in ballot its throw warning
    public  function setValidVotesAndNotValidVotesForballotBox(Request $request)
    {
        $voterActivistId = Auth::user()->voter_id;
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");
        $warning_response = null;

        try {
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($object->ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id);

            $valid_votes = $object->valid_votes_count_activist; //valid
            $not_valid_votes = $object->not_valid_votes_count_activist; //not valid
            $count_votes_report_activist = $object->count_voted_in_ballot; //valid+not valid

            if (isset($object->warning_response))
                $warning_response = $object->warning_response;

            //check if activist can report end votes
            $statusBallotMember = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($voterActivistId,$ballotBoxId,$this->currentElectionCampaign->id); 
            self::checkCanReportPartyVotes($statusBallotMember);
            
            //check required
            if (strcmp($valid_votes, '') == 0 || strcmp($not_valid_votes, '') == 0 || strcmp($count_votes_report_activist, '') == 0)
                throw new Exception(config('errors.elections.ERROR_EMPTY_FIELDS'));
                

            //check if its real
            if ($valid_votes + $not_valid_votes != $count_votes_report_activist)
                throw new Exception(config('errors.elections.ERROR_COUNT_VALID_UN_VALID'));



            //count voter need voted
            $countNeedVoted = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxId, $this->currentElectionCampaign->id);

            if ($count_votes_report_activist > $countNeedVoted)
                throw new Exception(config('errors.elections.ERROR_COUNT_BALLOT_VOTED_MORE_NEED'));

            //check if sum votes in parties== valid votes count
             //$sum_valid_parties_votes = BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxId, $this->currentElectionCampaign->id);

            // if ($sum_valid_parties_votes != $valid_votes)
            //     throw new Exception(config('errors.elections.ERROR_COUNT_VALID_VOTES'));

            //count mark voted in ballot
            $countMarkVoted = BallotBoxService::getCountMarkVotedBySystem($ballotBoxId, $this->currentElectionCampaign->id);

            if (is_null($warning_response) && $countMarkVoted != $count_votes_report_activist) {
                $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.elections.WARNING_COUNT_BALLOT_VOTED_MORE_NEED'));
                $response = array('warning_message' => $warning_message);
                $jsonOutput->setData($response);
                return;
            } else {
                //update votes for ballot box 
                BallotBoxService::updateCountValidAndNotValidCountVotes($ballotBoxId, $valid_votes, $not_valid_votes);
                $AllCountVotes=$valid_votes+$not_valid_votes;
                $reportSourceId=ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$shas_report);
                ElectionVotesReportService::updateCountVotesAndNotValidVotesByReportSource($this->currentElectionCampaign->id,$reportSourceId,$AllCountVotes,$not_valid_votes,$countNeedVoted,$ballotBoxId);
                self::updateCorrectBallotMember($statusBallotMember);
            }

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function get ballot mi id of activist and return details to result voted in ballot box
    public function getElectionResultByBallotBox(Request $request)
    {
        $voterActivistId = Auth::user()->voter_id;
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");

        try {
            $ballotBoxObj = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($object->ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id, true);
            $cluster=Cluster::select('clusters.*','cities.name as city_name')->withCity()->where('clusters.id',$ballotBoxObj->cluster_id)->first();
            // if(!$ballotBoxObj)
            $details = new stdClass();
            $details->city_name=$cluster->city_name;
            $details->count_voters_ballot = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxObj->id, $this->currentElectionCampaign->id); //count voter in ballot box
            $details->valid_votes_count_activist = $ballotBoxObj->valid_votes_count_activist; //count valid votes
            $details->not_valid_votes_count_activist = $ballotBoxObj->not_valid_votes_count_activist; //count not valid vote
            $details->count_voted_in_ballot = $details->not_valid_votes_count_activist + $details->valid_votes_count_activist;
            $details->sum_valid_parties_votes = BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxObj->id, $this->currentElectionCampaign->id);
            //list parties details and count activist report votes
            $details->list_parties_ballot = BallotBoxService::getListReportVotesForPartyByBallotBoxId($ballotBoxObj->id, $this->currentElectionCampaign->id);

            $jsonOutput->setData($details);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function set count votes for party in cluster
    public function setCountVotesForPartyByBallotBox(Request $request)
    {

        $voterActivistId = Auth::user()->voter_id;
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");

        try {
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($object->ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id);

            $party_key = $object->party_key;
            $party=ElectionCampaignPartyLists::select()->where('key',$party_key)->first();
            $votes_count = $object->votes_count;

            //check if activist can report end votes
            $statusBallotMember = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($voterActivistId,$ballotBoxId,$this->currentElectionCampaign->id); 
            self::checkCanReportPartyVotes($statusBallotMember);

              //count voter need voted
            $countNeedVoted = BallotBoxService::getCountHaveVotedInBallotBox($ballotBoxId, $this->currentElectionCampaign->id);
            //sum votes for another party for check if exceed countNeedVoted
            $SumValidVotesAnotherParty= BallotBoxService::getSumCountVotePartyByBallotBox($ballotBoxId, $this->currentElectionCampaign->id,$party_key);
            if($SumValidVotesAnotherParty+$votes_count>$countNeedVoted)
            throw new Exception(config('errors.elections.ERROR_COUNT_PARTY_VOTE'));
            
            BallotBoxService::setCountVotesInBallotBoxByParty($ballotBoxId, $party_key, $votes_count);
            self::updateCorrectBallotMember($statusBallotMember);
            //update in table report votes by source
            $reportSourceId=ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$shas_report);
            ElectionVotesReportService::updatePartyCountForReportSource($this->currentElectionCampaign->id,$reportSourceId,$party->id,$votes_count,$ballotBoxId);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    //finish shift in ballot by ballot member
    public function finishedShift(Request $request)
    {
        $voterActivistId = Auth::user()->voter_id;
        $warning_response = null;
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");
        $nextInBallot = true; //variable that include if the next ballot member in ballot
        try {
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($object->ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id);

            if (isset($object->warning_response))
                $warning_response = $object->warning_response;

            //check if the next ballot member in ballot
            if(is_null($warning_response)){
                $electionRoleVoterGeographic = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($voterActivistId, $ballotBoxId, $this->currentElectionCampaign->id);
                $electionRoleId = ElectionRolesByVoters::where('id', $electionRoleVoterGeographic->election_role_by_voter_id)->first()->election_role_id;
                $nextInBallot = ActivistsAllocationsAssignmentsService::checkIfTheNextBallotMemberInBallot($electionRoleVoterGeographic, $electionRoleId,$this->currentElectionCampaign->id);

                if ($nextInBallot == false) {
                    $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.elections.WARNING_FINISHED_BALLOT_SHIFT'));
                    $response = array('warning_message' => $warning_message);
                    $jsonOutput->setData($response);
                    return;
                }
            }

            ActivistsAllocationsAssignmentsService::setFinishedShiftDate($voterActivistId, $ballotBoxId, $this->currentElectionCampaign->id);
            $jsonOutput->setData(true);

        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function get cluster id and google map location lat and lang
    public function checkLocationBallotMemberInBallot($cluster,$location,$voter_activist_id){
     
        //if user not have location
        //dev
        //cancel google map
        //cluster not have location
        //($location && ($location['lat']==0 || $location['lng']==0)) ||
        if(env('CANCEL_GOOGLE_MAP')==true || (env('ACTIVISTS_SYSTEM_DEV_MODE')==true && $voter_activist_id!=3964766) || $cluster->cancel_google_map==1 || is_null($cluster->lat_location) || is_null($cluster->lng_location))
        return true;

        if($location && ($location['lat']==0 || $location['lng']==0))
        {
            throw new Exception(config('errors.elections.ERROR_LOCATION_ZERO_BALLOT_MEMBER'));  
        }

        //ballot box location google map
        $BallotBoxLocation=array('lat'=>$cluster->lat_location,'lng'=>$cluster->lng_location);
        //check if need increasing range if house in null or fields increasing range On
        $is_increasing_range=$cluster->increasing_range_map==1 || strcmp($cluster->house,'')==0 || is_null($cluster->house) ?true:false;
        $range=$is_increasing_range?GoogleMapService::$increasing_range:GoogleMapService::$default_range;
        // Log::info($range);
        //location activist user check if user in ballot box
        $isUserNearBy=GoogleMapService::arePointsNear($location,$BallotBoxLocation,$range);

        if(!$isUserNearBy){
            $voter=Voters::select('personal_identity')->where('id',$voter_activist_id)->first();
            Log::info(' לא בקלפי '.$voter->personal_identity);
            Log::info('מיקום קלפי'.json_encode($BallotBoxLocation));
            Log::info('מיקום פעיל'.json_encode($location));
            Log::info('--------------------------------');
            throw new Exception(config('errors.elections.ERROR_LOCATION_BALLOT_MEMBER'));
        }
        return true;
    }

    //
    public function uploadProtocolBallotBox(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $voterActivistId = Auth::user()->voter_id;
        $object = (object)($request->all());
        $newFileName = $object->protocol_image; //$request->input('protocol_image');

        $newFileDestination = config( 'constants.BALLOT_BOXES_PROTOCOLS_FILES_DIRECTORY' );
        $urlFile="$newFileDestination/$newFileName.jpg";
        //if (!file_exists($urlFile)) 
        //  throw new Exception(config('errors.global.UPLOAD_FILE_CANCEL'));
        //$file = fopen($urlFile, 'w');

        try {
            $ballot_mi_id=$object->ballot_mi_id;
            // Log::info('קלפי'.$ballot_mi_id);
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id);
            $ballotBoxObj=BallotBox::select()->where('id', $ballotBoxId)->first();
            $ballotKey = $ballotBoxObj->key;
            
           // rename($file, $ballotKey);

            $ballotBoxObj->name_protocol_image =$urlFile; //$ballotKey;
            $ballotBoxObj->save();

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            //unlink($file);
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }

    }

    //close ballot box by ballot member
    public function closeBallotMox(Request $request){
        $voterActivistId = Auth::user()->voter_id;
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");
        $votes_closed=$object->votes_closed;

        try {
            $ballotBoxId = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($object->ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id);
            $ballotBoxObj=BallotBox::select()->where('id', $ballotBoxId)->first();
            $ballotBoxObj->votes_closed=$votes_closed;
            $ballotBoxObj->save();
            $jsonOutput->setData(true);

        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public function downloadAppointmentFile(Request $request,$ballot_mi_id){

        $jsonOutput = app()->make("JsonOutput");
        try {
            $voterActivistId = Auth::user()->voter_id;
            $voter=Voters::select()->where('id', $voterActivistId)->first();
            $ballotBox = BallotBoxService::getBallotBoxIdByActivistAndBallotMiId($ballot_mi_id, $voterActivistId, $this->currentElectionCampaign->id, true);
            //get object role voter by ballot box for check if its counter or observe for download different file location
            $electionRoleVoterGeographic = ActivistsAllocationsAssignmentsService::getObjectByActivistBallotMember($voterActivistId, $ballotBox->id, $this->currentElectionCampaign->id);
            $electionRoleId=$electionRoleVoterGeographic->election_role_id;
            $roleSystemName=ElectionRoles::getSystemNameById($electionRoleId);

            $res=new stdClass();
            $res->personal_identity=$voter->personal_identity;
            $res->ballot_mi_iron_number=$ballotBox->mi_iron_number;
            
            if($roleSystemName == config('constants.activists.election_role_system_names.counter') || $roleSystemName == config('constants.activists.election_role_system_names.observer') )
            {
                // echo($electionRoleVoterGeographic->election_role_voter);die;
                $electionRoleVoter=ElectionRolesByVoters::select('key')->where('id',$electionRoleVoterGeographic->election_role_voter)->first();

                $CityActivistsController=new CityActivistsController();
                $viewHtmlReport = $CityActivistsController->exportAppointmentLetters($electionRoleVoter->key, $ballotBox->id, true);
                $res->appointment_html = $viewHtmlReport;

                echo(json_encode($res));die;
            }
            
            $jsonOutput->setData($res);
            return;

        }
        catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }

    }

    public static function updateCorrectBallotMember($objectElectionRoleGeoActivist){
        
        if ($objectElectionRoleGeoActivist->correct_reporting != 1)
            $objectElectionRoleGeoActivist->correct_reporting = 1; //first time reporting

        $objectElectionRoleGeoActivist->current_reporting = 1;

        $objectElectionRoleGeoActivist->save();

    }
    
}
