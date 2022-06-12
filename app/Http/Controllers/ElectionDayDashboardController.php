<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterSupportStatus;
use App\Models\VoterElectionCampaigns;
use App\Models\ElectionCampaigns;
use App\Models\ReportedHourlyVotes;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
use App\Models\GeographicFilters;
use App\Models\PredictedVotesPercentages;
use App\Models\Votes;

use Auth;
use Illuminate\Http\Request;
use App\Models\VoterFilter\VoterQuery;
use App\Models\VoterFilter\VoterFilterDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ExportService;


class ElectionDayDashboardController extends Controller
{
	public  function __construct() {
		$this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('name',true);
		$this->hot = false;
    }

	/*
		Mediator function that calls to other service function by params :
	*/
	public function getStatsByParams(Request $request){
		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		//set hot
		$this->hot = ($request->input("hot") == "true")? true : false;

		$search_type = $request->input("search_type");
		switch($search_type){
			case 'all_country_stats':// All country details
				$this->getAllCountryBasicStats($request);
				break;
			case 'all_votes_predictions'://hours votes diagram-gray line for know the expected votes hours
				$this->getAllVotesPredictions();
				break;
			case 'geographical_stats': //get all details voters and votes by array id of entities
				$this->getGeoStatsByTypeAndKey($request);
				break;
			case 'geographical_hourly_stats'://get all details voters and votes by array id of entities by hour
				$this->getHourlyGeoStatsByTypeAndKey($request);
				break;
			case 'sub_entities'://geo entity details
				$this->getCityGeoSubEntities($request);
				break;
		}
	}
	
	/*
		Function thta returns global votes predictions per election day
	*/
	private function getAllVotesPredictions(){
		$jsonOutput = app()->make("JsonOutput");
		$currentCampaignObj =  ElectionCampaigns::currentCampaign();
		$currentCampaign  = $currentCampaignObj['id'];
		$electionCampaignDay = $currentCampaignObj['election_date'];
		$predictedVotesData = PredictedVotesPercentages::select('id' , 'time' , 'percentage')
													     ->where('deleted',0)
														 ->where('election_campaign_id' , $currentCampaign)
														 ->orderBy('time')
														 ->get();
		$jsonOutput->setData($predictedVotesData);
	}
  
	/*
		Helpful function that returns array of clusters id 
		
		@param entityType
		@param entityKey
		@param electionCampaignID
	*/
	private function getEntitiesCounts(&$arrOutput, $entityType , $entityArrayKeys , $currentCampaignObj, $parentEntityId = null){
		$isBallotBoxEntity = ($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))  ? true : false;

		$countBallotsArray = null;
		$noParentCountArray = null;

		$countEntitiesQuery = $this->getEntitiesCountsByType($entityType , $entityArrayKeys , $currentCampaignObj, 'clustersCounts');
		if(!$isBallotBoxEntity){
			$countBallotsQuery = $this->getEntitiesCountsByType($entityType , $entityArrayKeys , $currentCampaignObj, 'countBallots');
			$countBallotsArray = $countBallotsQuery->get();
		}

		$countEntitiesArray = $countEntitiesQuery->get();
		$AREA_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
		$SUB_AREA_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
		$CITY_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
		$NEIGHBORHOO_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD');

		if(($entityType == $NEIGHBORHOO_TYPE || $entityType == $SUB_AREA_TYPE) && $parentEntityId){ //For clusters with no Neighborhood | or cities with no sub area
			$PARENT_TYPE = $entityType == $NEIGHBORHOO_TYPE ? $CITY_TYPE : $AREA_TYPE;
			$noParentCountQuery = $this->getEntitiesCountsByType($PARENT_TYPE, null , $currentCampaignObj, 'clustersCounts', $parentEntityId); 
			$noParentCountArray = $noParentCountQuery->get();
			// dd($noParentCountQuery->toSql());
			if(!empty($noParentCountArray[0])){

				$noParentCount = $noParentCountArray[0];
				$noParentBallotsCountQuery = $this->getEntitiesCountsByType($PARENT_TYPE, null , $currentCampaignObj, 'countBallots', $parentEntityId);
				$noParentBallotsCountArray = $noParentBallotsCountQuery->get(); 
				$value = isset($noParentBallotsCountArray[0]) ? $noParentBallotsCountArray[0] : [];
				$countBallotsArray->push($value);
			} else {
				$noParentCount = new \stdClass;
				$noParentCount->id = $parentEntityId;
				$noParentCount->key = $parentEntityId;
				$noParentCount->name = '';
			}
			$noParentCount->noParentEntities = true;

			$countEntitiesArray->push($noParentCount);

		}

		// dd($countEntitiesArray->toArray(),$countBallotsArray->toArray(), $noParentCountArray);
		$detailsList = [
			'total_voters_count', 'total_households_count', 'total_supporters_count', 'total_votes_count',
			'total_supporters_votes_count' 
		];
		$detailsReportingList = [
			'total_reporting_voters_count' => 'total_voters_count' ,
			'total_reporting_households_count'  => 'total_households_count',
			'total_reporting_voter_supporters_count' => 'total_supporters_count' ,
		   'total_reporting_votes_count' => 'total_votes_count',
		   'total_reporting_supporters_votes_count' =>'total_supporters_votes_count',
	   ];
	   $countEntitiesOutput = [];

	   $i = 0;
		$entitiesHasClustersKeysArray = [];
	   foreach($countEntitiesArray as $entityCountData){
			array_push($entitiesHasClustersKeysArray, $entityCountData->key);
			$id  = isset($entityCountData->noParentEntities) ? $entityCountData->id . '_0' : $entityCountData->id  ;

			$currentCounts = ['ballots_count_data' => [],'ballots_reporting_count_data' =>[], 'id' => $id, 'name' => $entityCountData->name];

			foreach($detailsList as $detailName){
				$detailValue = isset($entityCountData->{$detailName}) ? $entityCountData->{$detailName} : 0;
				$currentCounts['ballots_count_data'][$detailName] =  $detailValue ;
			}

			//Insert all the reporting values to object - by alias name;
			$currentCounts['ballots_count_data']['ballots_count'] = 1;
			$currentCounts['ballots_reporting_count_data']['ballots_count'] = 1;
			
			if(!$isBallotBoxEntity){
				if(!empty($countBallotsArray[$i])){
					$currentCounts['ballots_count_data']['ballots_count'] = $countBallotsArray[$i]->all_ballots_count;
					$currentCounts['ballots_reporting_count_data']['ballots_count'] = $countBallotsArray[$i]->ballot_boxes_reporting ;
				}
				foreach($detailsReportingList as $detailKey => $detailName){
					$detailValue =  isset($entityCountData->{$detailKey}) ? $entityCountData->{$detailKey} : 0;
					$currentCounts['ballots_reporting_count_data'][$detailName] = $detailValue;
				}
			}else{
				$currentCounts['ballots_reporting_count_data'] = $currentCounts['ballots_count_data'];
			}
			array_push($countEntitiesOutput, $currentCounts);
			$i++;
		}
		$this->addCountsForEmptyEntities($countEntitiesOutput, $entityArrayKeys,$entitiesHasClustersKeysArray, $entityType);
		// dump($entityArrayKeys,$entitiesHasClustersKeysArray);
		// Add Empty by request array keys:
		return $countEntitiesOutput;
	}
	/**
	 * addCountsForEmptyEntities
	 * Get all entities that not has clusters in current campaign
	 * @param [type] $countEntitiesOutput
	 * @param [type] $entityArrayKeys
	 * @param [type] $entitiesHasClustersKeysArray
	 * @param [type] $entityType
	 * @return void
	 */
	private function addCountsForEmptyEntities(&$countEntitiesOutput, $entityArrayKeys, $entitiesHasClustersKeysArray, $entityType){

		if($entityArrayKeys && count($entitiesHasClustersKeysArray) > 0){
		$emptyEntitiesArrayKeys = array_diff($entityArrayKeys,$entitiesHasClustersKeysArray);
			
			switch($entityType){
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
					$emptyEntitiesArray = AreasGroup::select('id', 'key')->whereIn('key', $emptyEntitiesArrayKeys)->get();
				break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
					$emptyEntitiesArray = Area::select('id', 'key')->whereIn('key', $emptyEntitiesArrayKeys)->get();
				break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
					$emptyEntitiesArray = SubArea::select('id', 'key')->whereIn('key', $emptyEntitiesArrayKeys)->get();
				break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
					$emptyEntitiesArray = City::select('id', 'key' ,'name')->whereIn('key', $emptyEntitiesArrayKeys)->get();
				break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
					$emptyEntitiesArray = Neighborhood::select('id', 'key')->whereIn('key', $emptyEntitiesArrayKeys)->get();
				break;
			}
			if(!empty($emptyEntitiesArray)){
				foreach($emptyEntitiesArray as $entity){
					$entity->empty = true;
					array_push($countEntitiesOutput, $entity);
				}
			}
		}

	}
	
	/*
	  Get all entities that have clusters in current campaign
	 * @param [type] $countEntitiesOutput
	 * @param [type] $entityArrayKeys
	 * @param [type] $entitiesHasClustersKeysArray
	 * @param [type] $entityType
	 * @return void
	*/
	private function getEntitiesHoursCounts(&$arrOutput, $entityType , $entityArrayKeys , $currentCampaignObj, $parentEntityId = null, $previousHours = false){
		// $isBallotBoxEntity = ($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))  ? true : false;
		$allCountryStats = $entityType == -1 ? true : false;

		$countEntitiesQuery = $this->getEntitiesCountsByType($entityType , $entityArrayKeys , $currentCampaignObj, 'clustersCounts');
		$countVotesHoursQuery = $this->getEntitiesCountsByType($entityType , $entityArrayKeys , $currentCampaignObj, 'hoursReportsCounts', $parentEntityId, $previousHours);

		$countEntitiesArray = $countEntitiesQuery->get();
		$countVotesHoursArray = $countVotesHoursQuery->get();

		$AREA_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
		$SUB_AREA_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
		$CITY_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
		$NEIGHBORHOO_TYPE =config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD');

		if(($entityType == $NEIGHBORHOO_TYPE || $entityType == $SUB_AREA_TYPE)  && $parentEntityId){ //For clusters with no Neighborhood | or cities with no sub area
			$PARENT_TYPE = $entityType == $NEIGHBORHOO_TYPE ? $CITY_TYPE : $AREA_TYPE;
			
			$noParentCountQuery = $this->getEntitiesCountsByType($PARENT_TYPE, null , $currentCampaignObj, 'clustersCounts', $parentEntityId);
			$noParentCountArray = $noParentCountQuery->get();
			if(!empty($noParentCountArray[0])){
				$noParentCount = $noParentCountArray[0];
				$noParentCount->noParentEntities = true;
				$noParenthoursReportsCountQuery = $this->getEntitiesCountsByType($PARENT_TYPE, null , $currentCampaignObj, 'hoursReportsCounts', $parentEntityId, $previousHours);

				$noParenthoursReportsCountArray = $noParenthoursReportsCountQuery->get();
				foreach($noParenthoursReportsCountArray as $row){
					$row->noParentEntities = true;
					$countVotesHoursArray->push($row);
				}
			} else {
				$noParentCount = new \stdClass;
				$noParentCount->id = $parentEntityId;
				$noParentCount->key = $parentEntityId;
				$noParentCount->name = '';

				$noParentHourRow = new \stdClass;
				$noParentHourRow->id = $parentEntityId;
				$noParentHourRow->name = 'ללא';
				$noParentHourRow->noParentEntities = true;
				$noParentHourRow->current_hour = 0;
				$noParentHourRow->total_voters_count = 0;
				$noParentHourRow->votes_count_per_hour = 0;
				$noParentHourRow->reporting_votes_count_per_hour = 0;
				$noParentHourRow->supporters_votes_count_per_hour = 0;
				$noParentHourRow->reporting_supporters_votes_count_per_hour = 0;
				$countVotesHoursArray->push($noParentHourRow);
			}
			$countEntitiesArray->push($noParentCount);
		}
		$countEntitiesOutput = [];
		$i = 0;

		$countEntitiesHash = [];
		$countVotesHoursHash = [];
		$id = 'all';
		$entitiesHasClustersKeysArray = [];

		foreach($countEntitiesArray as $entityCountData){
			array_push($entitiesHasClustersKeysArray, $entityCountData->key);

			if(!$allCountryStats){ 
				$id  = isset($entityCountData->noParentEntities) ? $entityCountData->id . '_0' : $entityCountData->id  ;
			}
			$countEntitiesHash[$id] =  $entityCountData;
		}
		foreach($countVotesHoursArray as $hourVoteCountRow){
			if(!$allCountryStats){ 
				$id  = isset($hourVoteCountRow->noParentEntities) ? $hourVoteCountRow->id . '_0' : $hourVoteCountRow->id  ;
			}
			if(empty($countVotesHoursHash[$id])){$countVotesHoursHash[$id] = [];}
			  array_push($countVotesHoursHash[$id], $hourVoteCountRow);
		}

		foreach($countVotesHoursHash as $id => $hourVoteCountArray){

			// Reset values for entity
			$totalSupportersVotesCountInHour = 0; //This will store the accumulating number of supporters votes per each hour : 
			$totalVotesCountInHour = 0; //This will store the accumulating number of all votes per each hour : 
			$totalReportingSupportersVotesCountInHour = 0; //This will store the accumulating number of supporters votes per each hour : 
			$totalReportingVotesCountInHour = 0; //This will store the accumulating number of all votes per each hour :
			
			$totalVotersCount  = isset($countEntitiesHash[$id]->total_voters_count) ? (int) $countEntitiesHash[$id]->total_voters_count : 0;
			$totalSupportersCount  = isset($countEntitiesHash[$id]->total_supporters_count) ?(int)$countEntitiesHash[$id]->total_supporters_count : 0;
			$totalReportingVotersCount  = isset($countEntitiesHash[$id]->total_reporting_voters_count) ? (int)$countEntitiesHash[$id]->total_reporting_voters_count : 0;
			$totalReportingSupportersCount  = isset($countEntitiesHash[$id]->total_reporting_voter_supporters_count) ? (int)$countEntitiesHash[$id]->total_reporting_voter_supporters_count : 0;
		

			if(!$allCountryStats){
				$currentHour = (int)date('H');
				$total_supporters_votes_count_h1 = 0;																						
				$total_supporters_votes_count_h2 = 0;																						
				$total_supporters_votes_count_h3 = 0;
				$h1 = 0;
				$h2 = -1;
				$h3 = -2;
			}
	   
			// $arrayGeoSupportersVotes = ['ballots_count_data'=> [] , 'ballots_reporting_count_data'=> [], 'ballots_count_data_numbers' => [], 'ballots_reporting_count_data_numbers' => []];
			// $arrayAllGeoVotersVotes = ['ballots_count_data'=> [] , 'ballots_reporting_count_data'=> [], 'ballots_count_data_numbers' => [], 'ballots_reporting_count_data_numbers' => []];
			$arrayGeoSupportersVotes = ['ballots_count_data'=> [] , 'ballots_reporting_count_data'=> []];
			$arrayAllGeoVotersVotes = ['ballots_count_data'=> [] , 'ballots_reporting_count_data'=> []];

			// End Reset values for entity

			// Going over values for entity hours
			foreach($hourVoteCountArray as $hourVoteCountRow){


			$totalVotesCountInHour += $hourVoteCountRow->votes_count_per_hour;
			$totalReportingVotesCountInHour += $hourVoteCountRow->reporting_votes_count_per_hour;

			$totalSupportersVotesCountInHour += $hourVoteCountRow->supporters_votes_count_per_hour;
			$totalReportingSupportersVotesCountInHour += $hourVoteCountRow->reporting_supporters_votes_count_per_hour;

				if(!$allCountryStats){
					$timeDiffFromNow = intval($hourVoteCountRow->current_hour) - $currentHour;

					switch($timeDiffFromNow){
						case $h1: 
							$total_supporters_votes_count_h1 = $totalSupportersVotesCountInHour;
							break; 
						case $h2: 
							$total_supporters_votes_count_h2 = $totalSupportersVotesCountInHour;
							break;
						case $h3:
							$total_supporters_votes_count_h3 = $totalSupportersVotesCountInHour;
							break;
					}
				}
				// Get total percent:
				$percentage = 0; $reportingPercentage = 0;
				if($totalVotersCount > 0 ){
					$percentage = floor(( (int)$totalVotesCountInHour * 100)/$totalVotersCount );
				}
				if( $totalReportingVotersCount > 0){
					$reportingPercentage = floor(( (int)$totalReportingVotesCountInHour * 100)/$totalReportingVotersCount);
				}

				// Get supporters percent:
				$percentageSupporters = 0; $reportingPercentageSupporters = 0;
				if($totalSupportersCount > 0 ){
					$percentageSupporters= floor(( (int)$totalSupportersVotesCountInHour * 100)/$totalSupportersCount);
				}
				if($totalReportingSupportersCount > 0){
					$reportingPercentageSupporters= floor(( (int)$totalReportingSupportersVotesCountInHour * 100)/$totalReportingSupportersCount);
				}

				$hour = intval($hourVoteCountRow->current_hour);
				if($hour < 10) {$hour = "0$hour" ;}
				$hour .= ":00:00";
				// dump(["time"=> $hour , "percentage" => $percentageSupporters]);

				array_push($arrayAllGeoVotersVotes['ballots_count_data'] , ["time"=> $hour , "percentage" => $percentage , "count" => $totalVotesCountInHour, 'total' => $totalVotersCount]);
				array_push($arrayAllGeoVotersVotes['ballots_reporting_count_data'] , ["time"=> $hour , "percentage" => $reportingPercentage , "count" => $totalReportingVotesCountInHour, 'total' => $totalReportingVotersCount]);

				// array_push($arrayAllGeoVotersVotes['ballots_count_data_numbers'] , ["time"=> $hour , "count" => $totalVotesCountInHour, 'total' => $totalVotersCount]);
				// array_push($arrayAllGeoVotersVotes['ballots_reporting_count_data_numbers'] , ["time"=> $hour , "count" => $totalReportingVotesCountInHour, 'total' => $totalReportingVotersCount]);

				array_push($arrayGeoSupportersVotes['ballots_count_data'] , ["time"=> $hour , "percentage" => $percentageSupporters , "count" => $totalSupportersVotesCountInHour, 'total' => $totalSupportersCount]);
				array_push($arrayGeoSupportersVotes['ballots_reporting_count_data'] , ["time"=> $hour , "percentage" => $reportingPercentageSupporters , "count" => $totalReportingSupportersVotesCountInHour, 'total' => $totalReportingSupportersCount]);

				// array_push($arrayGeoSupportersVotes['ballots_count_data_numbers'] , ["time"=> $hour , "count" => $totalSupportersVotesCountInHour, 'total' => $totalSupportersCount]);
				// array_push($arrayGeoSupportersVotes['ballots_reporting_count_data_numbers'] , ["time"=> $hour , "count" => $totalReportingSupportersVotesCountInHour, 'total' => $totalReportingSupportersCount]);
		}

		$currentCounts = [
			'id' => $id,
			'name' => $hourVoteCountRow->name,
			'geo_supporters_votes' => $arrayGeoSupportersVotes,	
			'geo_all_voters_votes' => $arrayAllGeoVotersVotes
		];
		if(!$allCountryStats){
			$currentCounts['total_supporters_votes_count_h1'] = $total_supporters_votes_count_h1;
			$currentCounts['total_supporters_votes_count_h2'] = $total_supporters_votes_count_h2;
			$currentCounts['total_supporters_votes_count_h3'] = $total_supporters_votes_count_h3;
		}
		array_push($countEntitiesOutput, $currentCounts);
	}

	$this->addCountsForEmptyEntities($countEntitiesOutput, $entityArrayKeys,$entitiesHasClustersKeysArray, $entityType);
		
		return $countEntitiesOutput;
	}

	/**
	 * getEntitiesCountsByType function
	 * Get all details counts for entity
	 *  area,city,cluster -> by clusters ids.
	 *  Ballotbox -> by key
	 * @param [type] $selectType
	 * @param [type] $entityType
	 * @param [type] $entityKey
	 * @param [type] $currentCampaign
	 * @return void
	 */
	private function getEntitiesCountsByType($entityType , $entityArrayKeys , $currentCampaignObj, $selectType, $parentEntityId = null, $previousHours = false){
		$isBallotBoxEntity = false;

		$currentCampaign = $currentCampaignObj['id'];
		// dump($entityType , $entityArrayKeys , $currentCampaign, $selectType);
		$areaType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');

		$hot = $this->hot;
		$clusterModelName = ($hot)? "App\Models\ClusterHotCounter" : "App\Models\Cluster";
		$clusterTableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
		$ballotBoxModelName = ($hot)? "App\Models\BallotBoxHotCounter" : "App\Models\BallotBox";
		$ballotBoxTableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";

		$countsQuery = null;
		switch($entityType){
			case -1: // All areas 
				$countsQuery = new $clusterModelName;
				if ($hot) $countsQuery->as('clusters');
				$countsQuery = $countsQuery->select(DB::raw('sum(clusters.reporting_ballot_voter_count) as total_voters_count')); //Need to check how to not select speific data for cluster

				if($entityArrayKeys){
					$countsQuery->whereIn('clusters.key', $entityArrayKeys);
				}
			break;
			case $areaType:
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
				$table = $entityType == $areaType ? 'areas' : 'sub_areas';

				$fields = ["$table.id","$table.key","$table.name"];
				if($entityType == $areaType){$countsQuery = Area::select($fields);}
				 else { $countsQuery = SubArea::select($fields);}
				$countsQuery->withCities()
				->withClusters(false, $hot)
				->where("$table.deleted",0)
				->orderBy("$table.id")->groupBy("$table.id");

				if(count($entityArrayKeys) > 0){
					$countsQuery->whereIn("$table.key", $entityArrayKeys);
				}
				if($entityType == $areaType && $parentEntityId && !$entityArrayKeys){ // Get cities with no sub area
					$countsQuery->where('cities.area_id', $parentEntityId)
					->where('cities.sub_area_id', null);
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):

				$countsQuery = City::select('cities.id','cities.key','cities.name')
				->withClusters(false, $hot)
				->where('cities.deleted', 0)
				->orderBy('cities.id')
				->groupBy('cities.id');

				if($entityArrayKeys){
					$countsQuery->whereIn('cities.key' , $entityArrayKeys );
				}
				if($parentEntityId && !$entityArrayKeys){ // Get clusters with no Neighborhood 
					$countsQuery->where('clusters.city_id', $parentEntityId)
					->where('clusters.neighborhood_id', null);
				}

				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
				$countsQuery = Neighborhood::select('neighborhoods.id','neighborhoods.key','neighborhoods.name') 
				->withClusters(false, $hot)
				->where('neighborhoods.deleted', 0)
				->orderBy('neighborhoods.id')
				->groupBy('neighborhoods.id');

				$countsQuery->whereIn('neighborhoods.key' , $entityArrayKeys );

				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
				$countsQuery = new $clusterModelName;
				if ($hot) $countsQuery->as('clusters');
				$countsQuery = $countsQuery->select('clusters.id','clusters.key','clusters.name') 
				 ->whereIn('clusters.key' , $entityArrayKeys )				 
				 ->groupBy('clusters.id')
				 ->orderBy('clusters.id');
				
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
				$isBallotBoxEntity = true;
				$countsQuery = new $ballotBoxModelName;
				if ($hot) $countsQuery->as('ballot_boxes');
				$countsQuery = $countsQuery->select('ballot_boxes.id','ballot_boxes.key') 
				->withCluster($hot)
				->whereIn('ballot_boxes.key' , $entityArrayKeys )
				->groupBy('ballot_boxes.id')
				->orderBy('ballot_boxes.id');

				if ($this->hot) $countsQuery->where('ballot_boxes.hot', 1);

				break;
		}
			if($selectType == 'clustersCounts'){
				$countsQuery =	$this->addVotersCountsToQuery($countsQuery, $isBallotBoxEntity);
			}else if($selectType == 'countBallots'){
				$countsQuery = $this->addBallotsCountsToQuery($countsQuery);
			}else if($selectType == 'hoursReportsCounts'){
				$countsQuery = $this->addHoursReportCountsToQuery($countsQuery, $currentCampaignObj, $isBallotBoxEntity, $previousHours);
			}
			$fixedCurrentCampaignObj =  ElectionCampaigns::currentCampaign();
			$fixedCurrentCampaign  = $fixedCurrentCampaignObj->id;
			$countsQuery->where('clusters.election_campaign_id', DB::raw($fixedCurrentCampaign));
		return $countsQuery;
	}
	/*
		Helpful function that returns array of clusters id 
		
		@param entityType
		@param entityKey
		@param electionCampaignID
	*/
	private function getClustersIDSByEntityAndCampaing($entityType , $entityKey , $electionCampaignID ){
		$clustersIDSArray = [];
		
		switch($entityType){
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
				$AreasGroup = AreasGroup::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$AreasGroup){ break;}
				$clustersArray = Cluster::select('clusters.id')
										  ->withCity()
										  ->withArea()
										  ->where('clusters.election_campaign_id' ,$electionCampaignID)
										  ->where('areas.areas_group_id' , $AreasGroup->id)
				 					  	  ->get();
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
				$area = Area::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$area){ break;}
				$clustersArray = Cluster::select('clusters.id')
										  ->withCity()
										  ->where('clusters.election_campaign_id' ,$electionCampaignID)
										  ->where('cities.area_id' , $area->id)
				 					  	  ->get();
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
				$subArea = SubArea::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$area){ break;}
				$clustersArray = Cluster::select('clusters.id')
										  ->withCity()
										  ->where('clusters.election_campaign_id' ,$electionCampaignID)
										  ->where('cities.sub_area_id' , $subArea->id)
				 					  	  ->get();
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
			    $city = City::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$city){ break;}
				$clustersArray = Cluster::select('clusters.id')
										  ->where('clusters.election_campaign_id' ,$electionCampaignID)
										  ->where('clusters.city_id' , $city->id)
										  ->get();
				 					  
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
		 
			    $neighborhood = Neighborhood::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$neighborhood){ break;}
				$clustersArray = Cluster::select('clusters.id')
										  ->where('clusters.election_campaign_id' ,$electionCampaignID)
										  ->where('clusters.neighborhood_id' , $neighborhood->id)
								 		  ->get();
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
		 
			    $cluster = Cluster::select('id')->where('key' , $entityKey )->first();
				$clustersArray[] = $cluster;
				break;
		}
		if(!empty($clustersArray)){
			foreach($clustersArray as $cluster){
				array_push($clustersIDSArray , $cluster->id);
			}
		}

		return $clustersIDSArray;
	}
	/*
		Function that returns neighborhoods , clusters and their ballot boxes
	*/
	private function getCityGeoSubEntities($request){
		$jsonOutput = app()->make("JsonOutput");
		$cityKey = $request->input("city_key");
		if(!GlobalController::isActionPermitted('elections.dashboards.election_day')){
			$jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
			return;
		}
		$currentCampaignObj =  ElectionCampaigns::currentCampaign();
		$currentCampaign  = $currentCampaignObj['id'];
		$electionCampaignDay = $currentCampaignObj['election_date'];
		
		$city= City::select('id','name')->where('deleted' , 0)->where('key' , $cityKey)->first();
		if(!$city){
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		}
		$arrOutput = new \stdClass;

		//Remove Neighborhood from the array 
		// -> it is doing problems on the client side!
		$hot = $this->hot;
		$neighborhoods = Neighborhood::select('id' , 'key' , 'name' , 'city_id')->where('deleted' , 0)
								->whereHas('clusters', function($query) use($currentCampaign, $hot) {
									$query->whereHas('ballotBoxes', function($query) use($hot) {
										if ($hot) $query->where('ballot_boxes.hot', 1);
									})->where('election_campaign_id' , $currentCampaign);
								})
								->with(['clusters'=>function($query) use($currentCampaign, $hot){
									$query->select('id' , 'key' , DB::raw($this->fullClusterNameQuery) , 'city_id' , 'neighborhood_id')
									->where('election_campaign_id' , $currentCampaign)
									->orderBy('name')
									->whereHas('ballotBoxes', function($query) use ($hot) {
										if ($hot) $query->where('ballot_boxes.hot', 1);
									})
									->with(['ballotBoxes'=>function($query2) use ($hot) {
									$query2->select('id' , 'key' , 'cluster_id' , 'mi_id as name')
										->orderBy('ballot_boxes.mi_id');

										if ($hot) $query2->where('ballot_boxes.hot', 1);
									}]);
								}])
								->where('city_id',$city->id)
								->get();
								
		$clusters = Cluster::select('id', DB::raw($this->fullClusterNameQuery), 'key')->where('election_campaign_id' , $currentCampaign)
							->where('city_id',$city->id)
							->whereNull('neighborhood_id')
							->whereHas('ballotBoxes', function($query) use ($hot) {
								if ($hot) $query->where('ballot_boxes.hot', 1);
							})
							->with(['ballotBoxes'=>function($query2) use ($hot) {
								$query2->select('id' , 'key' , 'cluster_id' , 'mi_id as name')
								->orderBy('ballot_boxes.mi_id');

								if ($hot) $query2->where('ballot_boxes.hot', 1);
							}])
							->orderBy('clusters.name')

							->get();

		if(count($clusters) > 0){
			$neighborhoodClusters = [
				'id' => $city->id. '_0',
				'key' => $city->id. '_0',
				'name' => 'ללא שכונה',
				'city_id' => $city->id,
				'clusters' => $clusters
			];
			$neighborhoods->push($neighborhoodClusters);
		}

		
		$arrOutput->city_sub_entities  = $neighborhoods;								
		$jsonOutput->setData($arrOutput);
	}
	
	/*
		Function that returns HOURLY stats of geographical region by its type and its key : 
		h1- current hour
		h2- previous hour
		h3 - pre-previos hour
	*/
	private function getHourlyGeoStatsByTypeAndKey(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		if(!GlobalController::isActionPermitted('elections.dashboards.election_day')){
			$jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
			return;
		}
		
		$entityType = $request->input('entity_type',null);
		$parentEntityId = $request->input('entity_id',null);
		$entityArrayKeys = $request->input('entity_arrays_keys');

		if(count($entityArrayKeys) == 0){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
			return;
		}
		if($entityType == null || trim($entityType) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_TYYPE'));
			return;
		}
		if(!in_array($entityType , ['0', '1', '2', '3', '4', '5'])){
			$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
			return;
		}
		
		$currentCampaignObj =  ElectionCampaigns::currentCampaign(true);
		 
		$arrOutput = new \stdClass;

		//$entityCountArray = $this->getEntitiesCounts($arrOutput, $entityType, $entityArrayKeys, $currentCampaignObj, $parentEntityId);

		$totalVotesCountsByHours = $this->getEntitiesHoursCounts($arrOutput, $entityType, $entityArrayKeys, $currentCampaignObj, $parentEntityId );
		$arrOutput->count_entities_output = $totalVotesCountsByHours;

		$previousHours = true;
		$totalVotesCountsByHoursPrev = $this->getEntitiesHoursCounts($arrOutput, $entityType, $entityArrayKeys, $currentCampaignObj, $parentEntityId, $previousHours );
		$arrOutput->count_entities_output_prev = $totalVotesCountsByHoursPrev;

		$jsonOutput->setData($arrOutput);
 
       //echo "This script took $seconds to execute.";
	}
	
	/*
		Function that returns stats of geographical region by its type and its key : 
	*/
	private function getGeoStatsByTypeAndKey(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$entityType = 1;
		$entityType = $request->input('entity_type');
		$entityArrayKeys = $request->input('entity_arrays_keys');
		$parentEntityId = $request->input('entity_id', null);

		if(count($entityArrayKeys) == 0){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
			return;
		}
		if($entityType == null || trim($entityType) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_TYYPE'));
			return;
		}
		if(!in_array($entityType , ['0','1','2','3','4','5'])){
			$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
			return;
		}
		if(!GlobalController::isActionPermitted('elections.dashboards.election_day')){
			$jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
			return;
		}
		$currentCampaignObj =  ElectionCampaigns::currentCampaign();
		// $electionCampaignDay = $currentCampaignObj['election_date'];
 
		$arrOutput = new \stdClass;
		$arrOutput->count_entities_output = $this->getEntitiesCounts($arrOutput, $entityType, $entityArrayKeys, $currentCampaignObj, $parentEntityId );

		$jsonOutput->setData($arrOutput);
	}


	/*
		Private helpful function that gets query reference , and adds to that query hours counts
	*/
	private function addHoursReportCountsToQuery($query, $currentCampaignObj, $isBallotBoxEntity = null, $previousHours = false){
		$electionCampaignID = $currentCampaignObj->id;

		$reportedHourlyVotesTable = (!$previousHours)? 'reported_hourly_votes' : 'previous_elections_hourly_votes';
		$tableSuffix = ($this->hot)? '_hot_counters' : "";
		$reportedHourlyVotesTable = $reportedHourlyVotesTable.$tableSuffix;
		if ($previousHours || $tableSuffix != "") $reportedHourlyVotesTable .= " as reported_hourly_votes";
		//$reportedHourlyVotesTable =  'reported_hourly_votes' : 'previous_elections_hourly_votes as reported_hourly_votes';
		$query->leftJoin($reportedHourlyVotesTable, function ( $joinOn ) use ( $isBallotBoxEntity, $electionCampaignID ) {
			$entityTypeName = !$isBallotBoxEntity ? 'CLUSTER' : 'BALLOT_BOX';
			$entityJoinTable = !$isBallotBoxEntity ? 'clusters' : 'ballot_boxes';
			$entityType = config("constants.GEOGRAPHIC_ENTITY_TYPE_$entityTypeName");
            $joinOn->on([
                ['reported_hourly_votes.entity_id', '=', "$entityJoinTable.id"],
                ['reported_hourly_votes.entity_type', '=', DB::raw($entityType) ],
                ['reported_hourly_votes.election_campaign_id', '=', DB::raw($electionCampaignID)]
            ]);
		});
		$query->addSelect(
			['hour as current_hour',
			DB::raw('sum(reported_hourly_votes.reported_votes_count) as votes_count_per_hour'),
			DB::raw('sum(reported_hourly_votes.reported_supporters_votes_count) as supporters_votes_count_per_hour'),
			DB::raw('sum(reported_hourly_votes.reporting_ballot_reported_votes_count) as reporting_votes_count_per_hour'),
			DB::raw('sum(reported_hourly_votes.reporting_ballot_reported_supporters_votes_count) as reporting_supporters_votes_count_per_hour'),
		])
		//->where('reported_hourly_votes.created_at','>',$currentCampaignObj['election_date'] .' '. $currentCampaignObj['vote_start_time'])
		->orderBy("current_hour")
		->groupBy("current_hour");
		if($isBallotBoxEntity){
			if ($this->hot) $query->where('ballot_boxes.hot', 1);	
		}
		// dump($currentCampaignObj['election_date'] .' '. $currentCampaignObj['vote_start_time']);
		return $query;
	}
	
	/*
		Private helpful function that gets query reference , and adds to that query ballot-boxes counts
	*/
	private function addBallotsCountsToQuery($query){
		$query->addSelect([
			DB::raw('count(ballot_boxes.id) as all_ballots_count'),
			DB::raw('count(case when ballot_boxes.reporting = 1 then 1 end)  as ballot_boxes_reporting')
		])
		->withBallotBoxes(false, $this->hot);
		if ($this->hot) $query->where('ballot_boxes.hot', 1);
		
		return $query;
	}
	
	/*
		Private helpful function that gets query reference , and adds to that Voters hours counts
	*/
	private function addVotersCountsToQuery($query, $isBallotBoxEntity = null){
		 $table = !$isBallotBoxEntity ? 'clusters' : 'ballot_boxes';
		 $fields=[
				DB::raw("sum($table.voter_count) as total_voters_count"),//count voters
				DB::raw("sum($table.household_count) as total_households_count"),//count households
				DB::raw("sum($table.voter_support_count) as total_supporters_count"),//count supporters final
				DB::raw("sum($table.reported_votes_count) as total_votes_count"),//count votes
				DB::raw("sum($table.reported_supporters_votes_count) as total_supporters_votes_count"),//count supporters votes
			];
		if($isBallotBoxEntity){
			$query->addSelect($fields)->addSelect('ballot_boxes.mi_id as name');
			if ($this->hot) $query->where('ballot_boxes.hot', 1);
			
		}else{
			//ballot box reporting details
			$query->addSelect($fields)->addSelect([
				//reporting ballots
				DB::raw('sum(clusters.reporting_ballot_voter_count) as total_reporting_voters_count'),
				DB::raw('sum(clusters.reporting_ballot_household_count) as total_reporting_households_count'),
				DB::raw('sum(clusters.reporting_ballot_voter_support_count) as total_reporting_voter_supporters_count'),
				DB::raw('sum(clusters.reporting_ballot_reported_votes_count) as total_reporting_votes_count'),
				DB::raw('sum(clusters.reporting_ballot_reported_supporters_votes_count) as total_reporting_supporters_votes_count'),
			]);
		 } 
		 return $query;
    } 
	
	/*
		Private helpful function that gets query reference , and adds to that query ballot-boxes count
	*/
	private function addBallotBoxCountToQuery($query){
		$query->addSelect([
			DB::raw('count(ballot_boxes.id) as all_ballots_count'),
			DB::raw('count(case when ballot_boxes.reporting = 1 then 1 end)  as ballot_boxes_reporting'),
		])->withBallotBoxes();
		return $query;
	}
	/*
		Private helppful function that returns global inter-country stats for elections: 
	*/
	private function getAllCountryBasicStats(Request $request){
			$jsonOutput = app()->make("JsonOutput");
			$currentCampaignObj =  ElectionCampaigns::currentCampaign(true);
			$currentCampaign  = $currentCampaignObj['id'];

			$prevCampaignObj =  ElectionCampaigns::previousCampaign(true);
			$prevCampaign  = $currentCampaignObj['id'];

			$userGeoFilters = GeoFilterService::getGeoFiltersForUser('elections.dashboards.election_day');
			$areasIDS = $userGeoFilters['areasIDS'];
			$citiesIDS = $userGeoFilters['citiesIDS'];
			// dd($userGeoFilters);
			$hot = $this->hot;
			$clusterModelName = ($hot)? "App\Models\ClusterHotCounter" : "App\Models\Cluster";
			$clusterTableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
			$ballotBoxModelName = ($hot)? "App\Models\BallotBoxHotCounter" : "App\Models\BallotBox";
			$ballotBoxTableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";
			
			$areas = Area::select('id' , 'name' , 'key')->where('deleted' , 0)->orderBy('name')
				->whereHas('cities', function($query) use($currentCampaign, $citiesIDS, $hot, $clusterTableName, $ballotBoxTableName) {
					  $query->join($clusterTableName, 'clusters.city_id', '=', 'cities.id')
							->join($ballotBoxTableName, 'ballot_boxes.cluster_id', '=', 'clusters.id')
							->where('clusters.election_campaign_id', $currentCampaign);
						if ($hot) $query->where('ballot_boxes.hot', 1);
							
					if($citiesIDS){
						$query->whereIn('cities.id',$citiesIDS);
					}
				})
				->with(['SubArea'=>function($query) use($areasIDS, $citiesIDS, $currentCampaign, $hot, $clusterTableName, $ballotBoxTableName){
					$query->select('sub_areas.id', 'sub_areas.name', 'sub_areas.key', 'sub_areas.area_id')
						->join('cities', 'cities.sub_area_id', '=', 'sub_areas.id')
						->join($clusterTableName, 'clusters.city_id', '=', 'cities.id')
						->join($ballotBoxTableName, 'ballot_boxes.cluster_id', '=', 'clusters.id')
						->orderBy('sub_areas.name')
						->groupBy('sub_areas.id');

						if ($hot) $query->where('ballot_boxes.hot', 1);
					if($areasIDS){
						$query->whereIn('sub_areas.area_id',$areasIDS);
					}
					$this->addCitiesToQuery($query, $citiesIDS, $currentCampaign, false);
				}]);
			$this->addCitiesToQuery($areas, $citiesIDS, $currentCampaign, true);
 
			if($areasIDS){	$areas->whereIn('areas.id' , $areasIDS); }

			$areas = $areas->get();

			$arrOutput = new \stdClass;
			
			$arrOutput->areas = $areas;
			
			$electionCampaginHours =[
				'vote_start_time' => $currentCampaignObj['vote_start_time'],
				'vote_end_time' => $currentCampaignObj['vote_end_time']
			];
			$arrOutput->vote_election_hours = $electionCampaginHours;

			$cacheName = "election_day:dashboard:vote_count_updated_date:end:*";
			$arrOutput->voting_updated_date = '';
		
			$cacheStartTimes = Redis::keys($cacheName); 
			if(!empty($cacheStartTimes)){
				rsort($cacheStartTimes);
				$arrOutput->voting_updated_date = Redis::get($cacheStartTimes[0]);
			}
			// This code will run if user has no geo-filter limitations :
			$clustersKeysArray = [];

			if(!empty($citiesIDS)){

				// This code will run if user has geo-filters defined : 
				$clustersKeys = Cluster::selectRaw("clusters.key")
										->where('clusters.election_campaign_id',$currentCampaign)
										->whereIn('clusters.city_id',$citiesIDS) 
										->get();
				foreach($clustersKeys as $cluster){ 
					array_push($clustersKeysArray , $cluster->key);
				} 
			}	
			$allCountryVotersCounts = $this->getEntitiesCounts($arrOutput, -1, $clustersKeysArray, $currentCampaignObj);
			$allCountryVotersHoursCounts = $this->getEntitiesHoursCounts($arrOutput, -1, $clustersKeysArray, $currentCampaignObj);

			// $allCountryVotersCountsPrev = $this->getEntitiesCounts($arrOutput, -1, $clustersKeysArray, $prevCampaignObj);
			$allCountryVotersHoursCountsPrev = $this->getEntitiesHoursCounts($arrOutput, -1, $clustersKeysArray, $prevCampaignObj);
			//The following loop will go through the array of hours votes count by hours :
			// dd($allCountryVotersCounts,$allCountryVotersHoursCounts);

			//  STATIC CALULACTION FOR ELECTION CAPMAIGN 23:
			$arrOutput->global_votes_count =0 ;
			$arrOutput->all_voters_count = 0;
			$arrOutput->all_supporters_count = 0;

			$arrOutput->count_entities_output = $allCountryVotersCounts[0];
			$arrOutput->geo_all_voters_votes = !empty($allCountryVotersHoursCounts[0]) ? $allCountryVotersHoursCounts[0]['geo_all_voters_votes'] : [];
			$arrOutput->geo_supporters_votes = !empty($allCountryVotersHoursCounts[0]) ? $allCountryVotersHoursCounts[0]['geo_supporters_votes'] : [];

			$arrOutput->geo_all_voters_votes_prev = !empty($allCountryVotersHoursCountsPrev[0]) ? $allCountryVotersHoursCountsPrev[0]['geo_all_voters_votes'] : [];
			$arrOutput->geo_supporters_votes_prev = !empty($allCountryVotersHoursCountsPrev[0]) ? $allCountryVotersHoursCountsPrev[0]['geo_supporters_votes'] : [];

			$jsonOutput->setData($arrOutput);
	    // echo "This script took $seconds to execute.";
	}
	/**
	 * addCitiesToQuery
	 * 	Add cities to area or subarea query
	 * @param [Model] $mainQuery
	 * @return void
	 */
	private function addCitiesToQuery($mainQuery, $citiesIDS, $currentCampaign, $noInSubarea){
		$hot = ($this->hot);
		$mainQuery->with(['cities' => function($query) use($citiesIDS, $noInSubarea, $currentCampaign, $hot){
			$query->select('cities.id','cities.name' , 'cities.key', 'cities.area_id', 'cities.sub_area_id')
				->withClusters(false, $hot)
				->withBallotBoxes(false, $hot)
				->orderBy('cities.name')
				->groupBy('cities.id')
				->where('clusters.election_campaign_id',$currentCampaign);

				if ($hot) $query->where('ballot_boxes.hot', 1);
			if($citiesIDS){
				$query->whereIn('cities.id', $citiesIDS);
			}
			if($noInSubarea){
				$query->whereNull('cities.sub_area_id');
			}
		}]);
	}
	/*
		Function that exports voters data into Excel
	*/
	public function printVotersDataToExcel(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');

		$currentCampaignObj =  ElectionCampaigns::currentCampaign();
		$currentCampaignID = $currentCampaignObj['id'];

		$clustersIDSArray = $this->getClustersIDSByEntityAndCampaing($entityType , $entityKey , $currentCampaignID);
		$phoneQuery=" SELECT vp.phone_number FROM voter_phones AS vp WHERE vp.voter_id = voters.id ";
		$orderByPhoneQuery=" ORDER BY  CASE WHEN vp.phone_number LIKE '05%' THEN 1 WHEN vp.phone_number NOT LIKE '05%' THEN 2 END ASC ,vp.updated_at DESC, vp.id ";
		
		$query = Voters::select([
									'voters.personal_identity', 'voters.first_name', 'voters.last_name', 
									
									// 	Voter phones:
									DB::raw( "(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
									THEN( SELECT vp.phone_number FROM voter_phones AS vp WHERE ( vp.id = voters.main_voter_phone_id))
									ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1) END) AS main_phone"),
								   DB::raw("(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
								   THEN( $phoneQuery  AND vp.id != voters.main_voter_phone_id $orderByPhoneQuery LIMIT 1 )
								   ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1,1) END) AS main_phone_2"),

									// captain data:
									'captain_voters.first_name as election_role_captains_of_fifty_name',
									 'captain_voters.last_name as election_role_captains_of_fifty_last_name',
									 'captain_election_role.phone_number as election_role_captains_of_fifty_phone'

								])
								->withVoterInElectionCampaigns()
								->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
								->WithCaptain50Only($currentCampaignID, false)
								->WithCaptainVoterDetails(false,true)
								->withFinalSupportStatus($currentCampaignID)
								->join('support_status', 'support_status.id', 'vssFinal.support_status_id')

								->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignID)
								->where('support_status.level', '>' , 0)
								->whereIn('ballot_boxes.cluster_id',$clustersIDSArray);

		$supportedVotersNotVotedData = $query->get()->toArray();
		ExportService::export($supportedVotersNotVotedData,'xls');
		$jsonOutput->setData($supportedVotersNotVotedData);

	}

	////////// For election day - get voter address!!!!!!!!
	public function getVoterBallotAddress(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);

		ini_set("pcre.backtrack_limit", "10000000000");
		$currentCampaign =  ElectionCampaigns::currentCampaign();
		$personalIdentity = ltrim($request['personal_identity'],0);
		$voterAddressData = [];
		if($personalIdentity){
			$voterAddressObj =  VoterElectionCampaigns::select([
				'voters.first_name', 'voters.last_name', 'voters.id as voter_id',
				DB::raw(" CONCAT(SUBSTR(CONCAT(ballot_boxes.mi_id,''), 1, LENGTH(CONCAT(ballot_boxes.mi_id,''))-1) ,'.' , SUBSTR(CONCAT(ballot_boxes.mi_id,''),-1)) AS ballot_box_mi_id "),
				'clusters.mi_id as clusters_mi_id',
				'clusters.street as street_name',
				'clusters.name as cluster_name',
				'cities.name as city_name'
			])
			->withVoter()
			->withBallotBox()
			->withCluster()
			->withCity()
			->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id)
			->where('voters.personal_identity', $personalIdentity)
			->first();
			 if($voterAddressObj) {
					$voterAddressData =  $voterAddressObj->toArray();
				}
		}

		$voterAddressData['personal_identity'] = $personalIdentity;
		// dd($voterAddressData);
		return view("voter_address_page", $voterAddressData);

	}
 }
