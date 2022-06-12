<?php

namespace App\Libraries\Services\cityActivists;

use App\Enums\ElectionRoleSystemName;
use App\Enums\GeographicEntityType;
use App\Http\Controllers\GlobalController;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\Neighborhood;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionCampaignPartyListVotesRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\NeighborhoodRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClusterBallotsActivistsService {

	/************************************ City Municipal activists counters ************************************************************** */
	/**
	 * get geographic entity values and name field , 
	 * function return count cluster, count ballot box to allocation,count allocation ballot box with assignment
	 *
	 * @param string $entity_column
	 * @param array $entitiesIds
	 * @param int   $electionCampaignId
	 * @param [type] $currentEntityEmptyId an object of  quarter object without id but with city, for get all cluster in city not in cluster 
	 * @return BallotBox return $counterFields[cluster_cnt,allocated_ballot_cnt,activists_allocations_count]
	 */
	public static function getCountBallotAllocationAndAssignemtIncludeCountCluster($entityColumn, $entitiesIds, $electionCampaignId, $currentEntityEmptyId = null)
	{

		$subQuery = self::queryCountAllocateShiftGroupBallot($electionCampaignId, $entityColumn, $entitiesIds, null, $currentEntityEmptyId);
		$ballotAllocationsQuery = "select count(count_allocate_shift_ballot) from ($subQuery) as Table_allocate_ballot";
		$counterFields = [
			DB::raw('count(distinct(clusters.id)) as cluster_cnt'), //מספר אשכולות
			DB::raw("($ballotAllocationsQuery) as allocated_ballot_cnt"), //מספר קלפיות מאוישות
			DB::raw('count(distinct(activists_allocations.ballot_box_id)) as activists_allocations_count'), //מספר קלפיות לשיבוץ
			// DB::raw('CASE WHEN votes.id IS NOT NULL THEN true ELSE false END as vote_status'),
		];

		$counters = BallotBox::select($counterFields)
			->withActivistsAllocations()
			->withCluster()
			->where('clusters.election_campaign_id', $electionCampaignId);

		if (!$currentEntityEmptyId) {
			$counters->whereIn("clusters.$entityColumn", $entitiesIds);
		} else {
			$counters->whereNull("activists_allocations.$entityColumn");
			$counters->where('activists_allocations.city_id', $currentEntityEmptyId->city_id);
		}

		$counters->addBinding($counters->getBindings());
		return $counters->first();
	}

		/**
	 * Get array cluster id and return count ballot box, count votes in ballot and count ballot allocation
	 *
	 * @param array $arrClusterId
	 * @return void
	 */
	public static function getBallotCountVotesAndAllocationByArrClusterId($arrClusterId)
	{

		$counterFields = [
			DB::raw('SUM(ballot_boxes.voter_count) as voter_count'),
			DB::raw('count(distinct(ballot_boxes.id)) as ballot_boxes_cnt'),
			DB::raw('count(distinct(activists_allocations.ballot_box_id)) as activists_allocations_count'),
		];
		$counters = BallotBox::select($counterFields)
		->withCluster()
		->withActivistsAllocations()
		->whereIn("clusters.id", $arrClusterId)
		->groupBy('clusters.id')
		->first();

		return $counters;
	}



	//get query group all ballot box and count shift in ballot with allocate activist
	public static function queryCountAllocateShiftGroupBallot($electionCampaignId,$fieldWhere,$valueField,$ballotRoleSystemName=null,$currentEntityEmptyId=null){

		$counter=ElectionRoles::getIdBySystemName(ElectionRoleSystemName::COUNTER);
		$counterShift=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.COUNT'),true);
		if (!$ballotRoleSystemName) {
			$observe = ElectionRoles::getIdBySystemName(ElectionRoleSystemName::OBSERVER);
			$ballotMember = ElectionRoles::getIdBySystemName(ElectionRoleSystemName::BALLOT_MEMBER);
			$arrRole = [$observe, $ballotMember];
		} else {
			$arrRole = [ElectionRoles::getIdBySystemName($ballotRoleSystemName)];
		}

		$arrRoleMultiShift = implode(", ", $arrRole);
		
		$FIRST=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.FIRST'),true);
		$SECOND=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.SECOND'),true);
		$SECOND_AND_COUNT=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.SECOND_AND_COUNT'),true);
		$ALL_DAY_AND_COUNT=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'),true);
		$ALL_DAY=ElectionRoleShifts::getObjectBySystemName(config('constants.activists.role_shifts.ALL_DAY'),true);

		$arrOneShift=implode(", ",[$FIRST,$SECOND,$counterShift]);
		$arrTwoShift=implode(", ",[$SECOND_AND_COUNT,$ALL_DAY]);
		$arrThreeShift=implode(", ",[$ALL_DAY_AND_COUNT]);
		
		$query=ActivistsAllocations::select([
			DB::raw('activists_allocations.ballot_box_id'),
			DB::raw("sum(
				case when activists_allocations.election_role_id=$counter and activists_allocations_assignments.election_role_shift_id=$counterShift   then 3 
				when activists_allocations.election_role_id in ($arrRoleMultiShift) and activists_allocations_assignments.election_role_shift_id in ($arrOneShift)   then 1 
				when activists_allocations.election_role_id in ($arrRoleMultiShift) and activists_allocations_assignments.election_role_shift_id in ($arrTwoShift)   then 2 
				when activists_allocations.election_role_id in ($arrRoleMultiShift) and activists_allocations_assignments.election_role_shift_id in ($arrThreeShift) then 3 
				else 0 end
			) as count_allocate_shift_ballot")]
		)
		->withActivistsAssignments()
		->whereNotNull('activists_allocations.ballot_box_id')
		->whereRaw("activists_allocations.election_campaign_id = $electionCampaignId");

		if($ballotRoleSystemName){
			$query->whereRaw("activists_allocations.election_role_id in ($arrRoleMultiShift)");
		}

		if ($currentEntityEmptyId) {
			$query->whereNull("activists_allocations.$fieldWhere");
			$query->whereRaw("activists_allocations.city_id=$currentEntityEmptyId->city_id");
		} else {

			if (is_array($valueField)) {
				$valueField = implode(", ", $valueField);
				$query->whereRaw("activists_allocations.$fieldWhere in($valueField)");
			} else {
				$query->whereRaw("activists_allocations.$fieldWhere=$valueField");
			}
		}

		$query->groupBy('activists_allocations.ballot_box_id');
		
		$query->having('count_allocate_shift_ballot','=',DB::raw(3));
	

		$query->addBinding($query->getBindings());
		$query=$query->toSql();
		return $query;
	}


    /************************************ End City Municipal activists counters ************************************************************** */
    

    public static function getVoterMuniRoleData(string $roleSystemName, array $where, array $fields, array $messagesFields){
        $muniElectionRole = ElectionRolesByVoters::select($fields)
        // ->addSelect() // Need to select activist user phone number!!!!
        ->withCampaign()
        ->withElectionRole()
        ->withUserCreate()
        ->withUserUpdate()
        ->withUserLock()
        ->withActivistAssingedCity()
        ->with(['messages' => function ($qr) use($messagesFields) {
            $qr->select($messagesFields)->where('deleted', 0);
        }])

        ->where($where)
        ->where('election_roles.system_name', $roleSystemName)
        ->first();
        // dump($roleSystemName, $muniElectionRole->toSql(), $muniElectionRole->getBindings());
        return $muniElectionRole;
    }



	/**
	 * Returns total number of electors in last election campaign by cityKey
	 *  @param cityKey
	 * 
	*/	
	public static function getTotalNumberOfShasElectorsCurrentCampaign(City $city){
	
		$resultObj = new \stdClass; 
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$electionCampaignID = $currentCampaign->id;
		$clusterRoles = [
			config('constants.activists.election_role_system_names.motivator'),
			config('constants.activists.election_role_system_names.driver')
		];

		$electionsRolesByVoters = ElectionRolesByVoters::selectRaw('activists_allocations.cluster_id,  activists_allocations.election_role_id, count(*) as count')
		->withElectionRole()
		->withActivistsAllocationAssignment()
		->where('election_roles_by_voters.election_campaign_id', $electionCampaignID)
		->where('activists_allocations.city_id', $city->id)
		->whereNotNull('activists_allocations.cluster_id')
		->whereIn('election_roles.system_name', $clusterRoles)
		->groupBy('activists_allocations.cluster_id', 'activists_allocations.election_role_id')
		->get();

		 $resultObj->clusters_regular_roles = $electionsRolesByVoters;
		$ballotBoxedIDS = array();
        
		$ballotBoxes=BallotBoxesRepository::getByCityIdAndCampaignId($city->id,ElectionCampaigns::currentCampaign()->id);
        if($ballotBoxes->count()>0);
		$ballotBoxedIDS=$ballotBoxes->map(function($ballot){
			return $ballot->id;
		});

		$resultObj->current_shas_votes_sum = ElectionCampaignPartyListVotesRepository::getCountShasVotesByBallotBoxArrId($ballotBoxedIDS);
		$clustersActivatedBallotsCount = Cluster::select('id')->where('election_campaign_id', $electionCampaignID)->where('city_id', $city->id);
		ClusterRepository::addCountBallotAllocationToClusterQuery($clustersActivatedBallotsCount);
		ClusterRepository::addCountBallotWithAssignemtToClusterQuery($clustersActivatedBallotsCount);
		$clustersActivatedBallotsCount = $clustersActivatedBallotsCount->with(['ballotBoxes' => function ($query) {
			$query->select('id', 'cluster_id', 'ballot_box_role_id');
		}])
			->get();

		$resultObj->clusters_activated_ballots_countings = $clustersActivatedBallotsCount;
		return $resultObj;
		
	}

	/*
		Returns clusters with count of supporters
		
		@param cityKey
	*/	 
	public static function getCityClustersVotersSupportsCount($jsonOutput, $cityKey) {
		if(!GlobalController::isActionPermitted('elections.activists.city_summary')){
				$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
				return;
		}

		if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		}
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$electionCampaignID = $currentCampaign->id;
		$cityKey = trim($cityKey);
		$city=City::select('id')->where('key', $cityKey)->first();
		if(!$city){	
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		}
		$cityID = $city->id; 		 
		$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey); 
			
		if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		}
			
		$clusters = Cluster::selectRaw('clusters.id , count(clusters.id) as support_votes_count')
								->withBallotBoxVoterElectionCampaignVotersSupportStatuses()
								->where('clusters.election_campaign_id' , $electionCampaignID)
								->where('city_id', $cityID)
								->where('support_status.level' , '>', 0)
								->where('voter_support_status.deleted' ,0)
								->where('entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
								->groupBy('clusters.id')
								->get();
        return $clusters;
	}
    /*
        Returns clusters and neighborhoods lists by city key
        @param cityKey
	*/
	public static function getCityNeighborhoodsAndClusters(City $city) {
	
		$currentCampaign = ElectionCampaigns::currentCampaign();
	    $electionCampaignId = $currentCampaign->id;
	    $preLastCampaign = ElectionCampaigns::previousCampaign();


		$arrayResult = new \stdClass;
		$arrayResult->prev_last_campagin_name = $preLastCampaign->name;
		$arrayResult->neighborhoods = NeighborhoodRepository::getByCityId($city->id);

        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('name',true);
		$tempClusters = Cluster::select('clusters.id', DB::raw($fullClusterNameQuery) ,'clusters.key','clusters.street' ,  'clusters.neighborhood_id' , 'voters.id as leader_id','cancel_google_map')
		->withLeader()
		->where('clusters.election_campaign_id' , $electionCampaignId)
		->where('clusters.city_id', $city->id);

		ClusterRepository::addArrBallotDetailsToClusterQuery($tempClusters);
		ClusterRepository::addCountBallotAllocationToClusterQuery($tempClusters);
		ClusterRepository::addCountBallotWithAssignemtToClusterQuery($tempClusters);
		ClusterRepository::addCountTotalVotesClusterQuery($tempClusters,$electionCampaignId);
		//ClusterRepository::addCountCaptainInClusterQuery($tempClusters,$electionCampaignId);
		ClusterRepository::addCountVotesOfPastElectionsInClusterQuery($tempClusters,$preLastCampaign,$city);

		$arrayResult->clusters = $tempClusters->get();

		for ($i = 0; $i < count($arrayResult->clusters); $i++) {
			$ballotBoxes = $arrayResult->clusters[$i]->ballotBoxes;
			$arrayResult->clusters[$i]->voters_count = $ballotBoxes->sum('voter_count');
			$arrayResult->clusters[$i]->votes_count = $ballotBoxes->sum('votes_count');
			$arrayResult->clusters[$i]->ballot_boxes_count =  count($ballotBoxes);
			$arrayResult->clusters[$i]->leaders_count = (is_null($arrayResult->clusters[$i]->leader_id)) ? 0 : 1;
			//$arrayResult->clusters[$i]->caps_of_fifty = count($arrayResult->clusters[$i]->total_captains);
			unset($arrayResult->clusters[$i]->total_captains);
			$arrayResult->clusters[$i]->previous_shas_votes_count = $arrayResult->clusters[$i]->previous_shas_votes->sum('votes');
			unset($arrayResult->clusters[$i]->previous_shas_votes);
		}
		 
		return $arrayResult; 
 	}	
	 /** Get Cluster activists data */
	/**
	 * @method getClusterActivistsDataByKey
	 * Get cluster activists data:
	 * 1.  Cluster leader. 
	 * 2.  captains. 
	 * 3.  drivers.
	 * 4.  Motivators(mamritzs).
	*/
	public static function getClusterActivistsDataByKey(City $city ,Cluster $cluster){

		$clusterWithBallotBoxes = ClusterRepository::getBallotBoxClusterAndClusterLeaderIdByKey($cluster->key);
		$currentCampaign=ElectionCampaigns::currentCampaign();
		$arrayBallotBoxesIDS = array();
		$electionRolesByVoters = array();
	
		for($i = 0;$i < count($clusterWithBallotBoxes) ; $i++){
			array_push($arrayBallotBoxesIDS , $clusterWithBallotBoxes[$i]->ballot_box_id);
		}

		$electionRolesByVoters ['cancel_google_map'] = $cluster->cancel_google_map;

		$motivator=config('constants.activists.election_role_system_names.motivator');
		$electionRolesByVoters["mamritz_roles"] = ActivistsAllocationsAssignmentsRepository::getQueryClusterActivistDataByClusterIdAndRoleType(
			$cluster->id,
			$motivator
		)->get();

		$driver=config('constants.activists.election_role_system_names.driver');
		$electionRolesByVoters["driver_roles"] = ActivistsAllocationsAssignmentsRepository::getQueryClusterActivistDataByClusterIdAndRoleType(
			$cluster->id,
			$driver
		)->get();


		$clusterLeader=config('constants.activists.election_role_system_names.clusterLeader');
		$electionRolesByVoters["cluster_leader_roles"] = ActivistsAllocationsAssignmentsRepository::getQueryClusterActivistDataByClusterIdAndRoleType(
			$cluster->id,
			$clusterLeader
		)->get(); 

		$captain50=config('constants.activists.election_role_system_names.ministerOfFifty');
		$countCaptain50Query = DB::raw('count(voters_with_captains_of_fifty.id) as voters_count');
		$Captain50Query=ActivistsAllocationsAssignmentsRepository::getQueryClusterActivistDataByClusterIdAndRoleType(
			$cluster->id,
			$captain50
		);

		$electionRolesByVoters["captain_fifty"]=$Captain50Query
		->addSelect($countCaptain50Query)
		->withCaptain50Activist($currentCampaign->id)
		->groupBy('election_roles_by_voters.voter_id')
		->get();
	
		$electionRolesByVoters["shas_votes_count"] =ElectionCampaignPartyListVotesRepository::getCountShasVotesByClusterId($cluster->id);

		$clusterRoles = ElectionRolesRepository::getClusterRolesSystemName();
		$roleKeysList = ElectionRolesRepository::getBySystemNameArray($clusterRoles);
		for($i = 0 ; $i<count($roleKeysList) ; $i++){
			$electionRolesByVoters[$roleKeysList[$i]->system_name."_role_key"] = $roleKeysList[$i]->key;
		}
		return $electionRolesByVoters;
	}
	

	/** 
	 * get cluster data by cluster key only
	*/
	public static function getClusterDataByKeyOnly($jsonOutput, $clusterKey){
		$fullClusterNameQuery = Cluster::getClusterFullNameQuery('name',true);

		if(!GlobalController::isActionPermitted('elections.activists.cluster_summary')){
				$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
				return;
		}
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$electionCampaignID = $currentCampaign->id;
		$electionCampaignType = $currentCampaign->type;
		$preLastCampaign = ElectionCampaigns::select('id')->where('type', $electionCampaignType)->where('id', '!=', $electionCampaignID)->orderBy('end_date', 'DESC')->first();
		
		$fields = [
			'clusters.id as id',
			DB::raw($fullClusterNameQuery),
			'clusters.key as cluster_key',
			'city_id',
			'cities.key as city_key',
			'cities.name as city_name'
		];

		$clusterData = Cluster::select($fields)
		->with(['ballotBoxes' => function($query){
			$query->select(
				'id' , 'key','cluster_id' , 'mi_id' ,'voter_count' , 'votes_count' , 'ballot_box_role_id as role',
				DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'));}])
			->withCity()
			->where('cities.deleted',0)
			->where('clusters.key' , $clusterKey)
			->where('election_campaign_id' ,$electionCampaignID)->first(); 

		if(!$clusterData){
			$jsonOutput->setErrorCode(config('errors.elections.CLUSTER_NOT_EXISTS'));
			return;
		}
		
		$arrayBallotsIDS  = [];
		$ballotBoxes = $clusterData->ballotBoxes;
		$clusterData->ballot_boxes_count = 0;
		foreach($ballotBoxes as $ballot){
				$clusterData->ballot_boxes_count++;
		}
		
		
		$jsonOutput->setData($clusterData);
	}

}