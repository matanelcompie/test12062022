<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRoleShifts;
use App\Models\VoterElectionCampaigns;
use App\Models\Voters;
use App\Models\Votes;
use App\Models\VoteSources;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PDF;

/*
Controller that handles only form-1000 methods.
 */
class ElectionsForm1000Controller extends Controller
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
    }

    const maxSupportingStatusNumber = 2; // 2=support , 1=sure support
    const possibleExportTypes = ['print', 'pdf'];
    const pdfFileName = "טופס1000-";

	/*
		This function gets cityKey only or cityKey and clusterKey , and prints the list of all clusters and their
		ballot boxes in the format of regular ballot printing - it shows ballot data and the votes result table
	*/
	public function exportAllCityOrClustersBallots(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$cityKey = $request->input("cityKey");
		if(!$cityKey){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
            return;
		}
		$city = City::select('id' , 'name')->where('key', $cityKey)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
            return;
        }
        $electionRoleShiftsHash = $this->getElectionRoleShiftsHash();
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$clusterKey = $request->input("clusterKey");
        $ballotBoxKey = $request->input("ballotBoxKey");

        if ($ballotBoxKey) {
            $ballotBoxes = BallotBox::select('key')->where('key' , $ballotBoxKey)->get();
			if ($clusterKey){ // if search by cityKey and cluster key
				$cluster = Cluster::selectRaw('id,name,(IF(house is NULL , street , CONCAT(street , " " , house))) as street')->where('key', $clusterKey)->where('election_campaign_id', $currentCampaign)->first();
			}
        } elseif ($clusterKey){ // if search by cityKey and cluster key
			$cluster = Cluster::selectRaw('id,name,(IF(house is NULL , street , CONCAT(street , " " , house))) as street')->where('key', $clusterKey)->where('election_campaign_id', $currentCampaign)->first();
			if (!$cluster) {
				$jsonOutput->setErrorCode(config('errors.elections.CLUSTER_DOES_NOT_EXIST'));
				return;
			}
			$ballotBoxes = BallotBox::select('key')->where('cluster_id' , $cluster->id)->orderBy('mi_id')->get();
		} else{ // else search only by city key
			$ballotBoxes = BallotBox::selectRaw('ballot_boxes.key  ,  clusters.name as cluster_name ,  clusters.key as cluster_key , (IF(clusters.house is NULL , clusters.street , CONCAT(clusters.street , " " , house)))  as cluster_address  ,  ballot_boxes.id as ballot_box_id  ,  ballot_boxes.mi_id as ballot_box_mi_id')
                    ->withCluster()
                    ->whereNotNull('ballot_box_role_id')
                    ->where('clusters.city_id',$city->id)
                    ->where('clusters.election_campaign_id' , $currentCampaign)
                    ->orderBy('ballot_box_mi_id')
                    ->get();
		}
		$jsonOutput->setBypass(true);
		//$request->merge(["type" =>'print']);
		$allBallotsData = [];
		for($i = 0 ; $i<sizeof($ballotBoxes);$i++){
			array_push($allBallotsData , $this->generateBallotBoxData($ballotBoxes[$i]->key,
                                                $currentCampaign,
                                                $electionRoleShiftsHash,
                                                $city->name,
                                                ($clusterKey ? $cluster->name :  $ballotBoxes[$i]->cluster_name ),
                                                ($clusterKey ? $cluster->street :$ballotBoxes[$i]->cluster_address ),
                                                $ballotBoxes[$i]->ballot_box_id,
                                                $ballotBoxes[$i]->ballot_box_mi_id));
		}

		return view('reports.tofes1000Collective', array('allBallotsData' => $allBallotsData, 'print' => true  ));
	}
	
	/*
		This is private helpful function for all types of printing , that from specific
		ballotKey generates associative array of data that describes the ballot box
	*/
	private function generateBallotBoxData($ballotBoxKey, 
                                        $currentCampaign,
                                        $electionRoleShiftsHash,
                                        $cityName=null,
                                        $clusterName=null,
                                        $clusterAddress=null,
                                        $ballotBoxID=null,
                                        $ballotBoxMIID = null){
		$arrData = [];
		
		if(!$ballotBoxID){
			$ballotBox = BallotBox::selectRaw('cities.name as cityName  ,  ballot_boxes.id as ballotbox_id , ballot_boxes.mi_id as ballotbox_mi_id ,  clusters.id as cluster_id ,
            '.$this->fullClusterNameQuery.' as cluster_name ,  (IF(clusters.house is NULL , clusters.street , CONCAT(clusters.street , " " , house)))  as cluster_address ,  ballot_boxes.key as ballot_box_key')
            ->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
            ->join('cities', 'cities.id', '=', 'clusters.city_id')
            ->where('clusters.election_campaign_id', $currentCampaign)
            ->where('cities.deleted', 0)
            ->where('ballot_boxes.key', $ballotBoxKey)
            ->first();
			if (!$ballotBox) 
			{
				$jsonOutput->setErrorCode(config('errors.system.BALLOT_BOX_NOT_EXISTS'));
				return null;
			}
		}
			
		$arrData['cityName']=$ballotBoxID  ? $cityName  : $ballotBox->cityName;
		$arrData['clusterName']=$ballotBoxID ? $clusterName  : $ballotBox->cluster_name;
		$arrData['clusterAddress']=$ballotBoxID  ? $clusterAddress  : $ballotBox->cluster_address;
	    $ballotIDStr = ($ballotBoxID ? $ballotBoxMIID : $ballotBox->ballotbox_mi_id)."";
		$ballotBoxFullStrExport = substr($ballotIDStr , 0 , strlen($ballotIDStr)-1).".".substr($ballotIDStr,-1);
        $ballotBoxFullStrExport .= " (במערכת ".$ballotIDStr.") ";
		$arrData['ballotBoxFullStrExport'] = $ballotBoxFullStrExport;
       
        $ballotBoxVoters = VoterElectionCampaigns::select('voter_id', 'first_name', 'last_name' , 'voter_serial_number')->where('election_campaign_id', $currentCampaign)
            ->join('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id')
            ->where('ballot_box_id', ($ballotBoxID ? $ballotBoxID : $ballotBox->ballotbox_id))
            ->with(['votes' => function ($query) use ($currentCampaign) {$query->where('election_campaign_id', $currentCampaign);}])
            ->withCount(['supportStatuses' => function ($query) use ($currentCampaign) {
                $query->where('deleted', 0)->where('election_campaign_id', $currentCampaign)
                    ->where('entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                    ->where('support_status_id', '<=', self::maxSupportingStatusNumber);
            }])
			->orderBy('voters_in_election_campaigns.voter_serial_number')
            ->get();
		
		$arrData['ballotBoxVoters'] = $ballotBoxVoters;
		
		$electionRolesShifts = ElectionRolesGeographical::select('election_roles.name as role_name',
                                                'voters.first_name',
                                                'voters.last_name',
                                                'election_role_shifts.system_name as election_role_shift_system_name',
                                                'election_role_shifts.name as election_role_shift_name')
															  ->withElectionRolesByVotersAndCampaignBallot()
															  ->join('election_role_shifts', 'election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id' )
															  ->where('entity_type' , config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
															  ->where('entity_id',($ballotBoxID ? $ballotBoxID : $ballotBox->ballotbox_id))
															  ->orderBy('election_role_shifts.id' , 'ASC')
															  ->get();
        $noShift = " - ללא שיבוץ";
		$electionRoleShiftsDetails = [];
        $shiftsCount = count($electionRolesShifts);
        foreach($electionRolesShifts as $index => $currentShift) {
            $currentShiftDetails = $currentShift->election_role_shift_name.
                                    " - ".
                                    $currentShift->first_name.
                                    ' '.
                                    $currentShift->last_name.
                                    " - ".
                                    $currentShift->role_name;
            $electionRoleShiftsDetails[] = $currentShiftDetails;
        }

        //add missing shifts text
        switch ($shiftsCount) {
            case 0:
                $electionRoleShiftsDetails = [
                    $electionRoleShiftsHash[config('constants.activists.role_shifts.FIRST')]->name.$noShift,
                    $electionRoleShiftsHash[config('constants.activists.role_shifts.SECOND')]->name.$noShift,
                    $electionRoleShiftsHash[config('constants.activists.role_shifts.COUNT')]->name.$noShift
                ];
                break;
            case 1:
                switch ($electionRolesShifts[0]->election_role_shift_system_name) {
                    case config('constants.activists.role_shifts.FIRST'): 
                        $electionRoleShiftsDetails[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.SECOND')]->name.
                                                        $noShift;
                        $electionRoleShiftsDetails[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.COUNT')]->name.
                                                        $noShift;
                        break;

                    case config('constants.activists.role_shifts.SECOND'): 
                        array_unshift($electionRoleShiftsDetails,
                                    $electionRoleShiftsHash[config('constants.activists.role_shifts.FIRST')]->name.
                                    $noShift);
                        $electionRoleShiftsDetails[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.COUNT')]->name.
                                                        $noShift;
                        break;

                    case config('constants.activists.role_shifts.COUNT'):
                        $electionRoleShiftsDetails = array_merge([
                                        $electionRoleShiftsHash[config('constants.activists.role_shifts.FIRST')]->name.
                                        $noShift,
                                        $electionRoleShiftsHash[config('constants.activists.role_shifts.SECOND')]->name.
                                        $noShift], $electionRoleShiftsDetails);
                        break;

                    case config('constants.activists.role_shifts.ALL_DAY'): 
                        $electionRoleShiftsDetails[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.COUNT')]->name.
                                                        $noShift;                           
                        break; 

                    case config('constants.activists.role_shifts.SECOND_AND_COUNT'): 
                        array_unshift($electionRoleShiftsDetails,
                                    $electionRoleShiftsHash[config('constants.activists.role_shifts.FIRST')]->name.
                                    $noShift);
                        break; 
                                
                }

                break;

            case 2:
                if ($electionRolesShifts[0]->election_role_shift_system_name == config('constants.activists.role_shifts.FIRST') and
                    $electionRolesShifts[1]->election_role_shift_system_name == config('constants.activists.role_shifts.SECOND')) {
                        $electionRoleShiftsDetails[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.COUNT')]->name.
                                                        $noShift;                    
                } else if ($electionRolesShifts[0]->election_role_shift_system_name == config('constants.activists.role_shifts.FIRST') and
                    $electionRolesShifts[1]->election_role_shift_system_name == config('constants.activists.role_shifts.COUNT')) {
                        array_splice($electionRoleShiftsDetails,
                                                        1,
                                                        0,
                                                        $electionRoleShiftsHash[config('constants.activists.role_shifts.SECOND')]->name.
                                                        $noShift);
                } else if ($electionRolesShifts[0]->election_role_shift_system_name == config('constants.activists.role_shifts.SECOND')) {
                    array_unshift($electionRoleShiftsDetails,
                                $electionRoleShiftsHash[config('constants.activists.role_shifts.FIRST')]->name.
                                $noShift);                  
                }
                break;
        }

        //fill shifts not needed with empty text
        for ($i = count($electionRoleShiftsDetails); $i<=3; $i++) {
            $electionRoleShiftsDetails[] = '';
        }

        $arrData['electionRoleShiftsDetails'] = $electionRoleShiftsDetails;
		return $arrData;
	}
	
    /*
    Get minimal clusters and ballot boxes data by city key

    @param  :cityKey
    @author :Pnina Alon
     */
    public function loadMinimalClustersAndBallotsByCityKey($cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaign = ElectionCampaigns::currentCampaign()['id'];
        $city = City::select('id')->where('key', $cityKey)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
            return;
        }

        $isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

        if (!$isAllowed) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }

        $clusters = Cluster::selectRaw('id ,  '.$this->fullClusterNameQuery. 'as name key ,(IF(house is NULL , street , CONCAT(street , " " , house))) as street ' )->where('election_campaign_id', $currentCampaign)->where('city_id', $city->id)->with(['ballotBoxes' => function ($query) {$query->select('id', 'key', 'cluster_id' , 'mi_id');}])->get();

        $jsonOutput->setData($clusters);
    }

    /*
    Get votes data by ballot box key

    @param  :ballotBoxKey
    @author :Pnina Alon
     */
    public function loadBallotBoxVotesData(Request $request, $ballotBoxKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.form1000')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $currentCampaign = ElectionCampaigns::currentCampaign()['id'];
        $ballotBox = BallotBox::selectRaw('cities.key as city_key,cities.name as city_name ,
            '. $this->fullClusterNameQuery . ' as cluster_name,  (IF(house is NULL , street , CONCAT(street , " " , house)))  as cluster_address ,
             ballot_boxes.id as ballotbox_id  ,  clusters.id as cluster_id ,  ballot_boxes.key as ballot_box_key')
            ->selectRaw("(CONCAT(SUBSTR(ballot_boxes.mi_id , 1 , LENGTH(ballot_boxes.mi_id) - 1) , '.' , SUBSTR(ballot_boxes.mi_id ,LENGTH(ballot_boxes.mi_id) , 1) )) as name")
			->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
            ->join('cities', 'cities.id', '=', 'clusters.city_id')
            ->where('clusters.election_campaign_id', $currentCampaign)
            ->where('cities.deleted', 0)
            ->where('ballot_boxes.key', $ballotBoxKey)
            ->first();
        if (!$ballotBox) {
            $jsonOutput->setErrorCode(config('errors.system.BALLOT_BOX_NOT_EXISTS'));
            return;
        }

        $city = City::select('id', 'name', 'key')->where('key', $ballotBox->city_key)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
            return;
        }

        $isAllowed = GlobalController::isAllowedCitiesForUser($ballotBox->city_key);

        if (!$isAllowed) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }

        $ballotBoxVoters = VoterElectionCampaigns::select('voter_id', 'first_name', 'last_name', 'personal_identity' ,'voter_serial_number')->where('election_campaign_id', $currentCampaign)
            ->join('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id')
            ->where('ballot_box_id', $ballotBox->ballotbox_id)
            ->with(['votes' => function ($query) use ($currentCampaign) {
                $query->select('votes.id', 'votes.voter_id', 'votes.election_campaign_id', 'vote_date', 'vote_sources.name as vote_source_name', 'user_voter.first_name as user_first_name', 'user_voter.last_name as user_last_name', 'votes.created_at')
                    ->where('election_campaign_id', $currentCampaign)
                    ->join('vote_sources', 'vote_sources.id', '=', 'vote_source_id')
                    ->leftJoin('users', 'users.id', '=', 'votes.user_create_id')
                    ->leftJoin('voters as user_voter', 'user_voter.id', '=', 'users.voter_id');
            }])
                  ->withCount(['supportStatuses' => function ($query) use ($currentCampaign) {
                $query->leftJoin('support_status','voter_support_status.support_status_id','=','support_status.id')
                
                    ->where('voter_support_status.deleted', 0)->where('voter_support_status.election_campaign_id', $currentCampaign)
                    ->where('entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                    ->where('support_status.level', '>' , 0 );
            }])
            ->orderBy('voters_in_election_campaigns.voter_serial_number')
            ->get();

        $fullData = [];
        $array_voters_ids = [];

        $fullData['voters_roles_shifts'] = ElectionRolesByVoters::select('election_roles.name as role_name', 'election_role_shifts.name as role_shift_name', 'election_roles_by_voters.phone_number', 'voters.first_name', 'voters.last_name', 'voters.key as voter_key')
            ->where('election_roles_by_voters.election_campaign_id', $currentCampaign)
            ->join('election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
            ->join('election_role_shifts', 'election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id')
            ->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id')
            ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
            ->where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
            ->where('entity_id', $ballotBox->ballotbox_id)
            ->where('election_role_shift_id', '>', 0)
            ->where('election_role_shifts.deleted', 0)
            ->where('election_roles.deleted', 0)
            ->get();

        $fullData['ballotbox_voters_array'] = $ballotBoxVoters;
        $fullData['city_name'] = $ballotBox->city_name;
        $fullData['cluster_name'] = $ballotBox->cluster_name;
        $fullData['cluster_address'] = $ballotBox->cluster_address;

		
        $fullData['voted_support_status_percentage'] = $this->getVotedSupportStatusPercentage($ballotBoxVoters,$array_voters_ids);

		for ($i = 0; $i < sizeof($ballotBoxVoters); $i++) {
            if(!in_array ($ballotBoxVoters[$i]->voter_id , $array_voters_ids)){
                array_push($array_voters_ids, $ballotBoxVoters[$i]->voter_id);
            }
		}
		
        $fullData['last_voted_voter_data'] = Votes::select('id','voter_id' , 'user_create_id' , 'reporting_voter_id' , 'votes.vote_date')
        ->where('votes.election_campaign_id', $currentCampaign)
            ->whereIn('voter_id', $array_voters_ids)
            ->orderBy('votes.vote_date', 'Desc')
            ->first();
		if($fullData['last_voted_voter_data']){
			if(!$fullData['last_voted_voter_data']->user_create_id){
				$reportingVoterData = Voters::select("first_name" , "last_name")->where('id',$fullData['last_voted_voter_data']->reporting_voter_id)->first();
			}
			else{
				$reportingVoterData = Voters::select("first_name" , "last_name")->whereRaw("id = (select voter_id from users where id=".$fullData['last_voted_voter_data']->user_create_id."  and deleted=0)")->first();
			}
			if($reportingVoterData ){
				
					$fullData['last_voted_voter_data']->first_name = $reportingVoterData->first_name;
					$fullData['last_voted_voter_data']->last_name = $reportingVoterData->last_name;
			}
			if(!$fullData['last_voted_voter_data']->first_name  || !$fullData['last_voted_voter_data']->last_name ){
				$fullData['last_voted_voter_data']->first_name  = "";
				$fullData['last_voted_voter_data']->last_name  = "";
			}
		}
        if ($request->input('extended') == '1') {
            $fullData['extended_data'] = [];
            $fullData['extended_data']['selected_city'] = $city;
            $fullData['extended_data']['clusters'] = Cluster::selectRaw('id , '.$this->fullClusterNameQuery. 'as name  ,  clusters.key ,  (IF(house is NULL , street , CONCAT(street , " " , house))) as street')->where('election_campaign_id', $currentCampaign)->where('city_id', $city->id)->with(['ballotBoxes' => function ($query) {$query->select('id', 'key', 'cluster_id')->selectRaw("(CONCAT(SUBSTR(mi_id , 1 , LENGTH(mi_id) - 1) , '.' , SUBSTR(mi_id ,LENGTH(mi_id) , 1) )) as mi_id");}])->get();
            $fullData['extended_data']['selected_cluster'] = Cluster::selectRaw('id , '.$this->fullClusterNameQuery. 'as name ,  clusters.key ,  (IF(house is NULL , street , CONCAT(street , " " , house))) as street')
                ->where('election_campaign_id', $currentCampaign)->where('id', $ballotBox->cluster_id)->with(['ballotBoxes' => function ($query) {$query->select('id', 'key', 'cluster_id')->selectRaw("(CONCAT(SUBSTR(mi_id , 1 , LENGTH(mi_id) - 1) , '.' , SUBSTR(mi_id ,LENGTH(mi_id) , 1) )) as name");}])->first();
            $fullData['extended_data']['selected_ballotBox'] = [
                'id' => $ballotBox->ballotbox_id,
                'name' => $ballotBox->name,
                'key' => $ballotBox->ballot_box_key];
        }
        $jsonOutput->setData($fullData);
    }
    /**
     * @method getVotedSupportStatusPercentage
     *
     * @param [type] $ballotBoxVoters - voters of ballotBox data 
     * @param [type] $array_voters_ids - id list for get the voters full data.
     * @return int percent of support voters, from total voters.
     */
    private function getVotedSupportStatusPercentage($ballotBoxVoters,$array_voters_ids=[])
    {
        $percent=0;
        $votesCount = 0;
        $supportersVotesCount = 0;

        $size = sizeof($ballotBoxVoters);
		$totalSupportersCount = 0;
        for ($i = 0; $i < $size; $i++) {
            if($array_voters_ids){
                array_push($array_voters_ids, $ballotBoxVoters[$i]->voter_id);
            }
			if ($ballotBoxVoters[$i]->support_statuses_count == 1) {
				$totalSupportersCount++;
			}
            if (sizeof($ballotBoxVoters[$i]->votes) > 0) {
                $votesCount++;
                if ($ballotBoxVoters[$i]->support_statuses_count == 1) {
                    $supportersVotesCount++;
                }
            }
        }
		
		 
		 
        
        if ($totalSupportersCount != 0 && $supportersVotesCount != 0) {
            $percent= intval(($supportersVotesCount * 100) / $totalSupportersCount);
        }
         
        return $percent;
        

    }

    /*
    Add votes data by ballot box key

    @param  :ballotBoxKey
    @author :Pnina Alon
     */
    public function addBallotBoxVotesData(Request $request, $ballotBoxKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!GlobalController::isActionPermitted('elections.form1000.add')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $currentCampaign = ElectionCampaigns::currentCampaign()['id'];
        $ballotBox = BallotBox::select('cities.key as city_key', 'ballot_boxes.id as ballotbox_id', 'clusters.id as cluster_id', 'ballot_boxes.key as ballot_box_key', 'ballot_boxes.reporting')->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
            ->join('cities', 'cities.id', '=', 'clusters.city_id')
            ->where('clusters.election_campaign_id', $currentCampaign)
            ->where('cities.deleted', 0)
            ->where('ballot_boxes.key', $ballotBoxKey)
            ->first();
        if (!$ballotBox) {
            $jsonOutput->setErrorCode(config('errors.system.BALLOT_BOX_NOT_EXISTS'));
            return;
        }

        $city = City::select('id', 'name', 'key')->where('key', $ballotBox->city_key)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
            return;
        }

        $isAllowed = GlobalController::isAllowedCitiesForUser($ballotBox->city_key);

        if (!$isAllowed) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }
        $votersList = json_decode($request->input('voters'), false);
        $notExistingVotersInBallotBox = VoterElectionCampaigns::select('id')->where('election_campaign_id', $currentCampaign)->whereIn('voter_id', $votersList)->where('ballot_box_id', '!=', $ballotBox->ballotbox_id)->get();
        if (sizeof($notExistingVotersInBallotBox) > 0) {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_BALLOTBOX_VOTERS'));
            return;
        }

        $vote_source_id = -1;
        $voteSource = VoteSources::select('id')->where('system_name', 'form1000')->first();
        if ($voteSource) {
            $vote_source_id = $voteSource->id;
        }
        $last_vote_voter = '';
        $last_vote_date = '';
        $updatedCountCalculation = false;
        for ($i = 0; $i < sizeof($votersList); $i++) {
            $existingVote = Votes::where('election_campaign_id', $currentCampaign)->where('voter_id', $votersList[$i])->first();
            if (!$existingVote) {

                $voteNewDatetime = Carbon::now();
                $newVote = new Votes;
				$newVote->key = Helper::getNewTableKey('votes', 10);
				$newVote->election_campaign_id = $currentCampaign;
				$newVote->voter_id = $votersList[$i];
				$newVote->vote_date= $voteNewDatetime;
				$newVote->vote_source_id = $vote_source_id;
				$newVote->user_create_id =Auth::user()->id;
				$newVote->save();

                //add ballot box id to votes calculation in redis
                if (!$updatedCountCalculation) {
                    Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $ballotBox->ballotbox_id, $ballotBox->ballotbox_id);
                    $updatedCountCalculation = true;
                }

                $votesFields = [
                    'election_campaign_id',
                    'voter_id',
                    'vote_date',
                    'vote_source_id'
                ];

                $changedValues = [];
                for ( $fieldIndex = 0; $fieldIndex < count($votesFields); $fieldIndex++ ) {
                    $fieldName = $votesFields[$fieldIndex] ;

                    if ( 'vote_date' == $fieldName ) {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Votes.' . $fieldName),
                            'new_value' => $newVote->{$fieldName}
                        ];
                    } else {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Votes.' . $fieldName),
                            'new_numeric_value' => $newVote->{$fieldName}
                        ];
                    }
                }

                $historyArgsArr = [
                    'topicName' => 'elections.form1000.add',
                    'models' => [
                        [
                            'description' => 'הוספת הצבעה מטופס 1000',
                            'referenced_model' => 'Votes',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $newVote->id,
                            'valuesList' => $changedValues
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);
				
				if($i == sizeof($votersList) - 1){
					$last_vote_voter = Voters::select('first_name' , 'last_name')->where('id',$votersList[$i])->first();
					if($last_vote_voter){
						$last_vote_voter = $last_vote_voter->first_name . ' ' .$last_vote_voter->last_name;
					}
					$last_vote_date = $voteNewDatetime;
				}
			}
		}
        //check if not reporting and more than 20 voters voted - update as reporting - COMMENTED
        /*if ($ballotBox->reporting == 0) {
            $ballotVoteCount = BallotBox::select(DB::raw('count(votes.id) as votes_count'))
                                        ->WithVoterElectionCampaign()
                                        ->join('votes', function($query) {
                                            $query->on('votes.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                                                    ->on('voters_in_election_campaigns.election_campaign_id', '=', 'votes.election_campaign_id');
                                        })
                                        ->where('votes.election_campaign_id', $currentCampaign)
                                        ->where('ballot_boxes.id', $ballotBox->ballotbox_id)
                                        ->first();
            if ($ballotVoteCount->votes_count >= 20) {
                BallotBox::where('id', $ballotBox->ballotbox_id)->update([
                        'reporting' => 1
                    ]);
            }
        }*/

		
		$ballotBoxVoters = VoterElectionCampaigns::select('voter_id' , 'first_name','last_name' , 'personal_identity' , 'voter_serial_number')->where('election_campaign_id' ,$currentCampaign )
                                                ->join('voters' , 'voters.id','=','voters_in_election_campaigns.voter_id')
                                                ->where('ballot_box_id', $ballotBox->ballotbox_id)
                                                ->with(['votes' => function($query) use ($currentCampaign){
                                                    $query->select('votes.id' , 'votes.voter_id','votes.election_campaign_id' , 'vote_date','vote_sources.name as vote_source_name' , 'user_voter.first_name as user_first_name' , 'user_voter.last_name as user_last_name' , 'votes.created_at')
                                                            ->where('election_campaign_id' , $currentCampaign)
                                                            ->join('vote_sources' , 'vote_sources.id' , '=' ,'vote_source_id')
                                                            ->leftJoin('users' , 'users.id' , '=','votes.user_create_id')
                                                            ->leftJoin('voters as user_voter' , 'user_voter.id' , '=','users.voter_id' );
                                                }]) 
                                                ->withCount(['supportStatuses' => function($query)use ($currentCampaign){
                                                    $query->where('deleted' , 0)->where('election_campaign_id' , $currentCampaign)
                                                            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                                                            ->where('support_status_id' , '<=' , self::maxSupportingStatusNumber);
                                                }])
												->orderBy('voter_serial_number')
                                                ->get();
         $data= [
          'ballot_boxes'=>$ballotBoxVoters ,
          'last_vote_date'=>$last_vote_date ,
          'last_vote_voter'=>$last_vote_voter
        ];                                      
        $data['voted_support_status_percentage'] = $this->getVotedSupportStatusPercentage($ballotBoxVoters);
                                
                                                
		$jsonOutput->setData($data);
	}
	
	
	
	/*
		Function that handles exporting to print/pdf the ballot box data with votes table
	*/
	public function exportBallotBoxVotesData(Request $request ,  $ballotBoxKey ){
		$jsonOutput = app()->make("JsonOutput");
		if($request->input("type")=='print' && !GlobalController::isActionPermitted('elections.form1000.print')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
        if (!in_array($request->input("type"), self::possibleExportTypes)) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_EXPORT_TYPE'));
            return;
        }

        $electionRoleShiftsHash = $this->getElectionRoleShiftsHash();
        $currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$wholeBallotBoxData = $this->generateBallotBoxData($ballotBoxKey, $currentCampaign, $electionRoleShiftsHash);
		if(!$wholeBallotBoxData){
			return;
		}
		
		$jsonOutput->setBypass(true);
        $dataArray = $wholeBallotBoxData['ballotBoxVoters'];		
		$electionRoleShiftsDetails = $wholeBallotBoxData['electionRoleShiftsDetails'];
		//$mishmeretSecondDataVoter = $wholeBallotBoxData['mishmeretSecondDataVoter'];
        //$mishmeretThirdDataVoter = $wholeBallotBoxData['mishmeretThirdDataVoter'];
		$ballotBoxFullStrExport = $wholeBallotBoxData['ballotBoxFullStrExport']  ;
		$cityName = $wholeBallotBoxData['cityName']  ;
		$clusterAddress = $wholeBallotBoxData['clusterAddress']  ;
		$clusterName = $wholeBallotBoxData['clusterName']  ;
		
        switch ($request->input("type")) {
            case 'print':
                return view('reports.tofes1000',
                            array('data' => $dataArray,
                                'print' => true,
                                'ballotBoxID' => ($ballotBoxFullStrExport),
                                'cityName' => ($cityName),
                                'clusterName' => ($clusterName),
                                'clusterAddress' => ($clusterAddress),
                                'electionRoleShiftsDetails'=> $electionRoleShiftsDetails));
                break;
            case 'pdf':
                ini_set("pcre.backtrack_limit", "1000000000");
                $pdf = PDF::loadView('reports.tofes1000',
                            array('data' => $dataArray,
                                'print' => false,
                                'ballotBoxID' => ($ballotBoxFullStrExport),
                                'cityName' => ($cityName),
                                'clusterName' => ($clusterName),
                                'clusterAddress' => ($clusterAddress),
                                'electionRoleShiftsDetails'=> $electionRoleShiftsDetails),
                            [],
                            ['mode' => 'utf-8', 'format' => 'A4-L']);
                return $pdf->download((self::pdfFileName . time()) . ".pdf");
                break;
        }

    }

    /**
     * Get election roles shifts hash per system name
     *
     * @return array
     */
    private function getElectionRoleShiftsHash() {
        $electionRoleShifts = ElectionRoleShifts::select('id', 'key','name', 'system_name')
                                    ->where('deleted', 0)
                                    ->get();
        $electionRoleShiftsHash = [];
        foreach($electionRoleShifts as $electionRoleShift) {
            $electionRoleShiftsHash[$electionRoleShift->system_name] = $electionRoleShift;
        }

         return $electionRoleShiftsHash;
    }

   

}
