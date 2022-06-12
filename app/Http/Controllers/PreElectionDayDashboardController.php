<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Streets;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\Voters;
use App\Models\VoterPhone;
use App\Models\VoterSupportStatus;
use App\Models\VoterElectionCampaigns;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\SupportStatus;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesGeographical;
use App\Models\CityBudget;
use App\Models\Votes;
use App\Models\CityBudgetActivistExpectedExpenses;
use App\Models\ElectionRolesByVoters;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
use App\Models\GeographicFilters;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaignPartyLists;
use Auth;
use Illuminate\Http\Request;
use App\Models\VoterFilter\VoterQuery;
use App\Models\VoterFilter\VoterFilterDefinition;
use Illuminate\Support\Facades\DB;


class PreElectionDayDashboardController extends Controller
{
	
	public $VOTER_ROLE_CAPTAIN_FIFTY_ROLE_ID=2;
	public $STATIONARY_PHONE_TYPE_ID = 1;
	public $DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE = 3;
	public $DEFAULT_CURRENT_PAGE = 1;
 
	public function __construct(){
		$this->entityTypesArray = [config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'), config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'),config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'), config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'), config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')];
	}
   	/**
	 * getEntitiesCountsByType function
	 * Get all details counts quesr for entity
	 *  area,city,cluster -> by clusters ids.
	 *  Ballotbox -> by key
	 * @param [type] $entityType
	 * @param [type] $entityKey
	 * @param [type] $currentCampaign
	 * @return void
	 */
	private function getEntitiesCountsByType($entityType , $entityKey , $currentCampaign){
		$isBallotBoxEntity = false;

		$countsQuery = null;
		switch($entityType){
			case null: // All areas 
				$countsQuery =  Cluster::select(DB::raw('sum(clusters.voter_count) as total_voters_count')); //Need to check how to not select speific data for cluster
				break;
			//!! ToDo GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP

				/*
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
				$countsQuery = Area::select('areas.id','areas.key','areas.name')
								->withCities()
								->withClusters()
								->where('areas.deleted',0)
								->where('areas.key', $entityKey);

				break;
			*/
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
				$countsQuery = Area::select('areas.id','areas.key','areas.name')
								->withCities()
								->withClusters()
								->where('areas.deleted',0)
								->where('areas.key', $entityKey);

				break;
			//!! ToDo GEOGRAPHIC_ENTITY_TYPE_SUB_AREA:
			/*case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
				$countsQuery = SubArea::select('sub_areas.id','sub_areas.key','sub_areas.name')
								->withCities()
								->withClusters()
								->where('sub_areas.deleted',0)
								->where('sub_areas.key', $entityKey);

				break;
				*/
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
				$countsQuery = City::select('cities.id','cities.key','cities.name')
									->withClusters()
									->where('cities.deleted', 0)
									->where('cities.key' , $entityKey );
				break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
				$countsQuery = Neighborhood::select('neighborhoods.id','neighborhoods.key','neighborhoods.name') 
									->withClusters()
									->where('neighborhoods.key' , $entityKey )
									->where('neighborhoods.deleted', 0);
				break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):

				 $countsQuery = Cluster::select('clusters.id','clusters.key','clusters.name') 
									 ->where('clusters.key' , $entityKey );			 
				
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
				$isBallotBoxEntity = true;
				$countsQuery = BallotBox::select('ballot_boxes.id','ballot_boxes.key') 
									->withCluster()
									->where('ballot_boxes.key', $entityKey );

				break;
		}
			$this->addVotersCountsToQuery($countsQuery, $isBallotBoxEntity);
			$countsQuery->where('clusters.election_campaign_id', $currentCampaign);
		return $countsQuery;
	}
	 	/*
		Private helpful function that gets query reference , and adds to that Voters hours counts
	*/
	private function addVotersCountsToQuery($query, $isBallotBoxEntity = null){
		$table = !$isBallotBoxEntity ? 'clusters' : 'ballot_boxes';
		$fields=[
			   DB::raw("sum($table.voter_count) as total_voters_count"),
			   DB::raw("sum($table.household_count) as total_households_count"),
			   DB::raw("sum($table.voter_support_count) as total_supporters_count"),
		   ];
		$query->addSelect($fields);

		return $query;
   } 
    /*
		Helpful function that returns array of ballotboxes 
		
		@param entityType
		@param entityKey
		@param electionCampaignID
	*/
	private function getBallotBoxesQueryByEntityAndCampaing($entityType , $entityKey , $electionCampaignID , $withBallotRoles = false){
		$ballotBoxes = null;
		switch($entityType){
			case '0':
				$area = Area::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$area){
					return null;
				}
				$ballotBoxes = BallotBox::select('ballot_boxes.id')
										  ->join('clusters' , 'clusters.id' , '=' , 'ballot_boxes.cluster_id')
										  ->join('cities' , 'cities.id','=','clusters.city_id')
										  ->where('cities.area_id' , $area->id);
				 					  
				if($withBallotRoles){
					$ballotBoxes = $ballotBoxes->whereNotNull('ballot_boxes.ballot_box_role_id');
				}						  
				break;
			case '1':
			    $city = City::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$city){
					return null;
				}
				$ballotBoxes = BallotBox::select('ballot_boxes.id')
										  ->join('clusters' , 'clusters.id' , '=' , 'ballot_boxes.cluster_id')
										  ->where('clusters.city_id' , $city->id);
				 					  
				if($withBallotRoles){
					$ballotBoxes = $ballotBoxes->whereNotNull('ballot_boxes.ballot_box_role_id');
				}						  
				break;
			case '2':
			    $neighborhood = Neighborhood::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$neighborhood){
					return null;
				}
				$ballotBoxes = BallotBox::select('ballot_boxes.id')
										  ->join('clusters' , 'clusters.id' , '=' , 'ballot_boxes.cluster_id')
										  ->where('clusters.neighborhood_id' , $neighborhood->id);
				 					  
				if($withBallotRoles){
					$ballotBoxes = $ballotBoxes->whereNotNull('ballot_boxes.ballot_box_role_id');
				}						  
				break;
			case '3':
			    $cluster = Cluster::select('id')->where('key' , $entityKey )->first();
				if(!$cluster){
					return null;
				}
				$ballotBoxes = BallotBox::select('ballot_boxes.id')
										  ->join('clusters' , 'clusters.id' , '=' , 'ballot_boxes.cluster_id')
										  ->where('clusters.id' , $cluster->id);
				 					  
				if($withBallotRoles){
					$ballotBoxes = $ballotBoxes->whereNotNull('ballot_boxes.ballot_box_role_id');
				}						  
				break;
			case '4':
			    $ballotBox = BallotBox::select('id')->where('key' , $entityKey )->first();
				if(!$ballotBox){
					return null;
				}
				$ballotBoxes = BallotBox::select('ballot_boxes.id')
										  ->join('clusters' , 'clusters.id' , '=' , 'ballot_boxes.cluster_id')
										  ->where('ballot_boxes.id' ,  $ballotBox ->id );
				 					  
				if($withBallotRoles){
					$ballotBoxes = $ballotBoxes->whereNotNull('ballot_boxes.ballot_box_role_id');
				}						  
				break;
		}
		if($ballotBoxes){
			$ballotBoxes->where('clusters.election_campaign_id' , $electionCampaignID);
		}

		return $ballotBoxes;
	}
	private function getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey , $electionCampaignID , $withBallotRoles = false){
		$ballotBoxesQuery = $this->getBallotBoxesQueryByEntityAndCampaing($entityType , $entityKey , $electionCampaignID , $withBallotRoles);
		$ballotBoxesIDSArray = [];
		
		$ballotBoxes = $ballotBoxesQuery->get();

		for($i = 0 ; $i<sizeof($ballotBoxes);$i++){
			array_push($ballotBoxesIDSArray , $ballotBoxes[$i]->id);
		}
		
		return $ballotBoxesIDSArray;
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
					$area = Area::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
					if(!$area){ break;}
					$clustersArray = Cluster::select('clusters.id')
											  ->withCity()
											  ->where('clusters.election_campaign_id' ,$electionCampaignID)
											  ->where('cities.sub_area_id' , $area->id)
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
		Function that returns basic sums and count per entity by its type and key
	*/
    public function getBasicCountStatsByEntity(Request $request){
        $jsonOutput = app()->make("JsonOutput");

		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');

		if($entityType){
			if($entityKey == null || trim($entityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
				return;
			}
			if(!in_array($entityType , $this->entityTypesArray)){
				$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
				return;
			}
		}
		
		if(!GlobalController::isActionPermitted('elections.dashboards.pre_election_day')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;
		$arrOutput = [];
		
		$countQuery = $this->getEntitiesCountsByType($entityType , $entityKey, $currentCampaign);
		$countsArray = $countQuery->first();
		$arrOutput['total_voters_count'] = $countsArray->total_voters_count;
		$arrOutput['total_households_count'] = $countsArray->total_households_count;
		$arrOutput['total_supporters_count'] = $countsArray->total_supporters_count;

		$total_voters_count = Voters::selectRaw('count(voters.id) as cnt')
								  ->join('voters_in_election_campaigns','voter_id' , '=' , 'voters.id')
								  ->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign);

		$total_households_count = Voters::selectRaw('count(distinct voters.household_id) as cnt')
								  ->join('voters_in_election_campaigns','voter_id' , '=' , 'voters.id')
								  ->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign);
								  
		$total_supporters_count = Voters::selectRaw('count(voters.id) as cnt')
								  ->join('voters_in_election_campaigns','voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
								  ->join('voter_support_status' , 'voter_support_status.voter_id','=' , 'voters.id')
								  ->join('support_status', 'voter_support_status.support_status_id', '=', 'support_status.id')
								  ->where('voter_support_status.deleted' , 0)
								  ->where('voter_support_status.election_campaign_id' , $currentCampaign)
								  ->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
								  ->where('support_status.level', '>', 0)
								  ->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign);	

		$total_potentials_count = Voters::selectRaw('count(voters.id) as cnt')
								  ->join('voters_in_election_campaigns','voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
								  ->join('voter_support_status' , 'voter_support_status.voter_id','=' , 'voters.id')
								  ->join('support_status', 'voter_support_status.support_status_id', '=', 'support_status.id')
								  ->where('voter_support_status.deleted' , 0)
								  ->where('voter_support_status.election_campaign_id' , $currentCampaign)
								  ->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
								  ->where('support_status.level', 0)
								  ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign);

			if($entityType){
				$ballotBoxesQuery = $this->getBallotBoxesQueryByEntityAndCampaing($entityType , $entityKey ,$currentCampaign);
				$total_potentials_count->whereRaw("ballot_boxes.id IN (" . $ballotBoxesQuery->toSql() . ')')
				->join('ballot_boxes' , 'ballot_boxes.id' , '=', 'voters_in_election_campaigns.ballot_box_id');
				$total_potentials_count->addBinding($ballotBoxesQuery->getBindings());
			}
			$arrOutput['total_potentials_count'] = $total_potentials_count->first()->cnt;

		$arrOutput['last_campaign_start_date'] =  ElectionCampaigns::select('start_date')->where('id',$currentCampaign)->first()['start_date'];
		if($arrOutput['last_campaign_start_date']){
			$arrOutput['last_campaign_start_date'] = explode(' ' , $arrOutput['last_campaign_start_date'])[0];
		}
		$previousCampID = ElectionCampaigns::select('id','name')->where('type', $currentCampaignType)->where('id' , '!=',$currentCampaign )->orderBy('id' ,'DESC')->first();
		if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
		}

		$previousCampID = $previousCampID->id;
		
		$previous_votes_count = ElectionCampaignPartyListVotes::selectRaw('sum(votes) as cnt')->withElectionCampaignPartyLists()
															->where([ 'election_campaign_id' => $previousCampID,
																'shas' => 1, 'deleted' => 0 ]);
		if($entityType){
			$previousBallotBoxesQuery = $this->getBallotBoxesQueryByEntityAndCampaing($entityType , $entityKey ,$previousCampID);

			$previous_votes_count->whereRaw("ballot_box_id IN (" . $previousBallotBoxesQuery->toSql() . ')');
			$previous_votes_count->addBinding($previousBallotBoxesQuery->getBindings());
		}
		$cnt = $previous_votes_count->first()->cnt;
		$arrOutput["previous_votes_count"] = $cnt ? $cnt : 0;	

		$previous_supporters_count = Voters::selectRaw('count(voters.id) as cnt')
								  ->join('voters_in_election_campaigns','voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
								  ->join('ballot_boxes' , 'ballot_boxes.id' , '=', 'voters_in_election_campaigns.ballot_box_id')
								  ->join('voter_support_status' , 'voter_support_status.voter_id','=' , 'voters.id')
								  ->join('support_status', 'voter_support_status.support_status_id', '=', 'support_status.id')
								  ->where('voter_support_status.deleted' , 0)
								  ->where('voter_support_status.election_campaign_id' , $previousCampID)
								  ->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
								  ->where('support_status.level' , '>', 0)
								  ->where('voters_in_election_campaigns.election_campaign_id', $previousCampID);
		if($entityType){
			$previous_supporters_count->whereRaw("ballot_box_id IN (" . $previousBallotBoxesQuery->toSql() . ')');
			$previous_supporters_count->addBinding($previousBallotBoxesQuery->getBindings());
		}
		$arrOutput['previous_supporters_count'] = $previous_supporters_count->first()->cnt;

		$jsonOutput->setData($arrOutput);
	}
	
	/*
		Function that returns all support statuses counts of geo entity by its type and key
	*/
	public function getSupportStatusesCounts(Request $request){
		$jsonOutput = app()->make("JsonOutput");	
		
		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');

		if($entityType){
			if($entityKey == null || trim($entityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
				return;
			}
			if(!in_array($entityType , $this->entityTypesArray)){
				$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
				return;
			}
		}
		
		if(!GlobalController::isActionPermitted('elections.dashboards.pre_election_day')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaignId = $currentCampaignData->id;
		
		$supportFinalType =	config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');											
		$supportTmType = config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM');												
		$supportElectionsType =	config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');

		//get support counts
		$supportCount = VoterElectionCampaigns::select(
						DB::raw("COUNT(DISTINCT voters_in_election_campaigns.id) as total_voters_per_geo_filter"),
						DB::raw("SUM(CASE WHEN support_status.level > 0 AND vss.entity_type = $supportElectionsType THEN 1
								ELSE 0 END) as elections_supporters_count"),
						DB::raw("SUM(CASE WHEN support_status.level = 0 AND vss.entity_type = $supportElectionsType THEN 1
								ELSE 0 END) as elections_potential_count"),
						DB::raw("SUM(CASE WHEN support_status.level < 0 AND vss.entity_type = $supportElectionsType THEN 1
								ELSE 0 END) as elections_not_supporters_count"),
						DB::raw("SUM(CASE WHEN support_status.level > 0 AND vss.entity_type = $supportTmType THEN 1
								ELSE 0 END) as tm_supporters_count"),
						DB::raw("SUM(CASE WHEN support_status.level = 0 AND vss.entity_type = $supportTmType THEN 1
								ELSE 0 END) as tm_potential_count"),
						DB::raw("SUM(CASE WHEN support_status.level < 0 AND vss.entity_type = $supportTmType THEN 1
								ELSE 0 END) as tm_not_supporters_count"),
						DB::raw("SUM(CASE WHEN support_status.level > 0 AND vss.entity_type = $supportFinalType THEN 1
								ELSE 0 END) as final_supporters_count"),
						DB::raw("SUM(CASE WHEN support_status.level = 0 AND vss.entity_type = $supportFinalType THEN 1
								ELSE 0 END) as final_potential_count"),
						DB::raw("SUM(CASE WHEN support_status.level < 0 AND vss.entity_type = $supportFinalType THEN 1
								ELSE 0 END) as final_not_supporters_count"),
						DB::raw("COUNT(DISTINCT (CASE WHEN support_status.level > 0 THEN voters_in_election_campaigns.voter_id END)) as total_supporters_count"),
						DB::raw("COUNT(DISTINCT (CASE WHEN support_status.level = 0 THEN voters_in_election_campaigns.voter_id END)) as total_potential_count"),
						DB::raw("COUNT(DISTINCT (CASE WHEN support_status.level < 0 THEN voters_in_election_campaigns.voter_id END)) as total_not_supporters_count"),
						DB::raw("SUM(CASE WHEN vss.id is null THEN 1 END) as total_voters_without_status"))
					->leftJoin('voter_support_status as vss', function($query) use ($currentCampaignId) {
						$query->on('vss.voter_id', '=', 'voters_in_election_campaigns.voter_id')
								->on('vss.election_campaign_id', DB::raw($currentCampaignId))
								->on('vss.deleted', DB::raw(0));
					})
					->leftJoin('support_status', 'support_status.id', '=', 'vss.support_status_id')
					->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId);

		//add ballots limit
		if($entityType !== null){
			$ballotBoxesIDSArray = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaignId);
			if($ballotBoxesIDSArray == null){
				$ballotBoxesIDSArray = [];
			}
			$supportCount->whereIn('voters_in_election_campaigns.ballot_box_id' , $ballotBoxesIDSArray);
		}

		$result = $supportCount->first();

		$jsonOutput->setData($result);
	}
	
	/*
		function that returns official roles stats of specific geographic area
	*/
	public function getRolesStats(Request $request){
		$jsonOutput = app()->make("JsonOutput");		
		
		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');
		
		if($entityType){
			if($entityKey == null || trim($entityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
				return;
			}
			if(!in_array($entityType , $this->entityTypesArray)){
				$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
				return;
			}
		}
		
		if(!GlobalController::isActionPermitted('elections.dashboards.pre_election_day')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		$currentCampaign = -1;
		if(!$request->input("campaign_key")){
			$currentCampaign =  ElectionCampaigns::currentCampaign();
		}
		else{
			$electionCamp = ElectionCampaigns::select('id')->where('key' , $request->input("campaign_key"))->first();
			if(!$electionCamp){
				$jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_DOESNT_EXIST'));
				return;
			}
		
			$currentCampaign = $electionCamp->id;
		}
		 
		$arrOutput = [];

		if($entityType){
			$ballotBoxesIDSArray = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaign , true);
		}

		$arrOutput["motivator_needed"] = 0;
		switch($entityType){
			case  null: // All areas 
				$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
				->where('election_campaign_id', $currentCampaign)
				->where('city_budget.deleted' , 0)
				->where('city_budget.budget_type' , 1)
				->where('city_budget_activist_expected_expenses.deleted',0)
				->where('city_budget.system_name' , 'motivator')
				->sum('activist_count');
				$arrOutput["motivator_needed"] = $cityBudget;
			break;
			case '0':
				$area = Area::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				$cities = null;
				if($area){
					$cities = City::select('id')->where('area_id' , $area->id)->where('deleted' , 0)->get();
				}
				$citiesIDSArray = [];
				for($i = 0 ; $i<sizeof($cities ) ; $i++){
					array_push($citiesIDSArray , $cities[$i]->id);
				}
				$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->whereIn('city_id' , $citiesIDSArray)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'motivator')
											->sum('activist_count');
			     
				$arrOutput["motivator_needed"] = $cityBudget;
				 
				break;
			case '1':
			    $city = City::select('id')->where('key' , $entityKey)->first();
				$cityBudget = null;
				if($city){

					$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $city->id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'motivator')
											->first()
											;
				}
			    if($cityBudget){
					$arrOutput["motivator_needed"] = $cityBudget->activist_count;
				}
				break;
			case '2':
				$totalNeighborhoods = 0;
				$cityBudget = null;
				$neighborhood = Neighborhood::select('id' , 'city_id')->where('key' , $entityKey )->where('deleted',0)->first();
				if($neighborhood){
				 
					$totalNeighborhoods =  Neighborhood::where('city_id' , $neighborhood->city_id)->where('deleted' , 0)->count();	
					$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $neighborhood->city_id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'motivator')
											->first()
											;
				}
				if($cityBudget && $totalNeighborhoods > 0){
					$arrOutput["motivator_needed"] = ceil(intval($cityBudget->activist_count)/$totalNeighborhoods);
				}
				break;
			case '3':
				$cluster = Cluster::select('id' , 'city_id')->where('election_campaign_id' , $currentCampaign)->where('key' , $entityKey )->first();
				$totalClusters =0 ;
				$cityBudget = null;
				if($cluster){
			 
				
					$totalClusters =  Cluster::where('city_id' , $cluster->city_id)->where('election_campaign_id' , $currentCampaign)->count();	
					$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $cluster->city_id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'motivator')
											->first()
											;
				}
				if($cityBudget && $totalClusters > 0){
					$arrOutput["motivator_needed"] = ceil(intval($cityBudget->activist_count)/$totalClusters);
				}
				break;
			case '4':
				$arrOutput["is_ballots"]  = '1';
				break;
		}
		$arrOutput["shifted_ballots_count"] = 0;
		$arrOutput["all_ballots_count"] = 0;
		$arrOutput["ballot_activists_count"] = 0;
			/* //Check if ballotbox is in full  Scheduling - no in use!


			
			$shiftetBallotsCount = 0;
		    for($i = 0 ; $i<sizeof($ballotBoxesIDSArray) ; $i++){
				$ballotRolesShiftCountAll = ElectionRolesGeographical::join('election_role_shifts' , 'election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles_by_voters' , 'election_roles_by_voters.id' , '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
																		->where('election_role_shifts.deleted' , '0')
																		->where('entity_type',config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
																		->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		->where('election_role_shifts.system_name' , 'all_day')
																		->where('entity_id' , $ballotBoxesIDSArray[$i])->count();
				if($ballotRolesShiftCountAll >= 1){
					$shiftetBallotsCount++;
					continue;
				}	
				else{
					$ballotRolesShiftCountFirst = ElectionRolesGeographical::join('election_role_shifts' , 'election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles_by_voters' , 'election_roles_by_voters.id' , '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
																		->where('election_role_shifts.deleted' , '0')
																		->where('entity_type',config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
																		->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		->where('election_role_shifts.system_name' , 'first')
																		->where('entity_id' , $ballotBoxesIDSArray[$i])->count();
					$ballotRolesShiftCountSecond = ElectionRolesGeographical::join('election_role_shifts' , 'election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles_by_voters' , 'election_roles_by_voters.id' , '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
																		->where('election_role_shifts.deleted' , '0')
																		->where('entity_type',config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
																		->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		->where('election_role_shifts.system_name' , 'second')
																		->where('entity_id' , $ballotBoxesIDSArray[$i])->count();
					if($ballotRolesShiftCountFirst >= 1 && $ballotRolesShiftCountSecond >= 1){
						$shiftetBallotsCount++;
					}
				}
			}
			$arrOutput["shifted_ballots_count"] = $shiftetBallotsCount;
			
		}
		*/
		if($entityType){
			$ballotBoxesIDSArrayRegular = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaign , false);
			if(!$ballotBoxesIDSArrayRegular ){
				$ballotBoxesIDSArrayRegular  = [];
			}	
		}
	

		$arrOutput["needed_observers_count"] = 0;
		$arrOutput["needed_ballot_activists_count"] = 0;
		$arrOutput["ballot_activists_count"] = 0;
		$arrOutput["observers_count"] = 0;
		$arrOutput["motivator_count"] = 0;

		//all day system name
		$allDaySystemName = config('constants.activists.role_shifts.ALL_DAY_AND_COUNT');

		//tow points in full day calculation
		$twoPoints = [
			"'".config('constants.activists.role_shifts.ALL_DAY')."'",
			"'".config('constants.activists.role_shifts.SECOND_AND_COUNT')."'"
			
		];
		$twoPointsString = implode(",", $twoPoints);

		//	Count ballots with with full geo allocation.
		$ballotsRolesData = BallotBox::select(
			'ballot_boxes.id',
			'ballot_box_roles.type as ballot_role_type',
			DB::raw("SUM(CASE 
					WHEN election_role_shifts.system_name = '$allDaySystemName' THEN 3
					WHEN election_role_shifts.system_name in ($twoPointsString) THEN 2
			 		ELSE 1 END) as full_day_points"))
		->join('election_role_by_voter_geographic_areas as role_geo','role_geo.entity_id', 'ballot_boxes.id')
		->join('election_role_shifts', 'election_role_shifts.id', 'role_geo.election_role_shift_id')
		->join('ballot_box_roles', 'ballot_box_roles.id', 'ballot_boxes.ballot_box_role_id')
		->WithCluster()
		->where('clusters.election_campaign_id' , $currentCampaign)
		->groupBy('ballot_boxes.id')
		->having('full_day_points', '=', 3);

		$ballotNeededRolesData = BallotBox::select('ballot_box_roles.type as ballot_role_type')
								->join('ballot_box_roles', 'ballot_box_roles.id', 'ballot_boxes.ballot_box_role_id')
								->WithCluster()
								->where('clusters.election_campaign_id' , $currentCampaign)
								->groupBy('ballot_boxes.id');
		if($entityType){
			$ballotsRolesData->whereIn('ballot_boxes.id' , $ballotBoxesIDSArray);
			$ballotNeededRolesData->whereIn('ballot_boxes.id' , $ballotBoxesIDSArray);
			$arrOutput["all_ballots_count"] = sizeof($ballotBoxesIDSArray);
		}else{
			$ballotCount = BallotBox::selectRaw('count(distinct ballot_boxes.id) as cnt')->WithCluster()
			->where('clusters.election_campaign_id' , $currentCampaign)->first();
			$arrOutput["all_ballots_count"] = $ballotCount->cnt;
		}
		$ballotsRolesData = $ballotsRolesData->get();						

		foreach($ballotsRolesData as $ballotRoleData){
			if($ballotRoleData->ballot_role_type == 1){ //observers type
				$arrOutput["observers_count"] ++;
			}else{
				$arrOutput["ballot_activists_count"] ++;
			}

		}
		$ballotNeededRolesData = $ballotNeededRolesData->get();

		foreach($ballotNeededRolesData as $ballotRole){  //observers type
			if($ballotRole->ballot_role_type == 1){
				$arrOutput["needed_observers_count"] ++;
			} else {
				$arrOutput["needed_ballot_activists_count"] ++;
			}
		
		}

		$allClusters = Cluster::select('clusters.id as cluster_id' , 'leader_id')
		->withBallotBoxes()
		->where('clusters.election_campaign_id',$currentCampaign)
		->groupBy('cluster_id');
		
		if($entityType){
			$allClusters->whereIn('ballot_boxes.id' , $ballotBoxesIDSArrayRegular);
		}
		$allClusters = $allClusters->get();

		$arrOutput["all_clusters_count"] = $allClusters->count();
		$arrOutput["shifted_clusters_count"] = 0;
		for($i = 0 ;$i < $arrOutput["all_clusters_count"]  ; $i++ ){
 
			if($allClusters[$i]->leader_id){
				$arrOutput["shifted_clusters_count"]++ ;
			}
		}

		// Need to fix this out!!!
		$cap50_count = VotersInElectionCampaigns::select(DB::raw('count(distinct voters_with_captains_of_fifty.captain_id) as cnt'))
													->withCaptainFifty()
													->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign);
		if($entityType){
			$cap50_count->whereIn('voters_in_election_campaigns.id' , $ballotBoxesIDSArrayRegular);
		}											
		$arrOutput['cap50_count'] = $cap50_count->first()->cnt;

		$cap50_needed = VoterSupportStatus::selectRaw('count(distinct(voters.household_id)) as cnt')
							->join('voters_in_election_campaigns' , function($joinOn){
										$joinOn->on('voters_in_election_campaigns.voter_id','=','voter_support_status.voter_id')
										->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id');
							})
								
							->join('voters' , 'voters.id' , '=' , 'voter_support_status.voter_id')
							->where('voter_support_status.election_campaign_id',$currentCampaign)
							//->where('voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
							->whereIn('voter_support_status.support_status_id',
								[config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING') , config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING')]);
		if($entityType){
			$cap50_needed->whereIn('voters_in_election_campaigns.id' , $ballotBoxesIDSArrayRegular);
		}				
		$cap50_needed_cnt = $cap50_needed->first()->cnt;						
		$arrOutput["cap50_needed"] = ceil($cap50_needed_cnt /config('constants.NUMBER_OF_HOUSEHOLDS_PER_CAP50'));
				
		$jsonOutput->setData($arrOutput);
	}

	
	/*
		Function that returns all transportations of geo entity by its type and key
	*/
	public function getTransportations(Request $request){
		$jsonOutput = app()->make("JsonOutput");
	
		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');
		
		if($entityType){
			if($entityKey == null || trim($entityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
				return;
			}
			if(!in_array($entityType , $this->entityTypesArray)){
				$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
				return;
			}
		}
		
		if(!GlobalController::isActionPermitted('elections.dashboards.pre_election_day')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		$arrOutput = [];
		if($entityType == '4'){
			$arrOutput["voter_transportations_count"] = '-';
			$arrOutput["drivers_count"] = '-';
			$arrOutput["budgeted_drivers_count"] = '-';
			$arrOutput["transportations_per_driver"] = '-';
			$jsonOutput->setData($arrOutput);
			return;
		}
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;
 
		
		if($entityType){
			$ballotBoxesIDSArray = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaign);
			if($ballotBoxesIDSArray == null){
				$ballotBoxesIDSArray = [];
			}
			$clustersIDSArray = $this->getClustersIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaign);
		}

		$voter_transportations_count = VoterTransportation::selectRaw('count(distinct voter_transportations.id) as cnt')
											->where('voter_transportations.election_campaign_id' , $currentCampaign)
											->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
											->join('voters_in_election_campaigns' , 'voters_in_election_campaigns.voter_id','=','voter_transportations.voter_id');

		$drivers_count = ElectionRolesByVoters::selectRaw('count(distinct election_roles_by_voters.voter_id) as cnt') 
								->withElectionRoleGeographical(false)
								->withElectionRole()
								->where('election_role_by_voter_geographic_areas.entity_type' , 3)
								->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
								->where('election_roles.system_name','driver');
		if($entityType){
			$drivers_count->whereIn('election_role_by_voter_geographic_areas.entity_id', $clustersIDSArray);
			$voter_transportations_count->whereIn('ballot_box_id', $ballotBoxesIDSArray);
		}
		$arrOutput["drivers_count"] = $drivers_count->first()->cnt;
		$arrOutput["voter_transportations_count"] = $voter_transportations_count->first()->cnt;
		$arrOutput["budgeted_drivers_count"] = 0;
		switch($entityType){
			case null:
			$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
			->where('election_campaign_id',$currentCampaign)
			->where('city_budget.deleted' , 0)
			->where('city_budget.budget_type' , 1)
			->where('city_budget_activist_expected_expenses.deleted',0)
			->where('city_budget.system_name' , 'driver')
			->sum('activist_count');

			$arrOutput["budgeted_drivers_count"] = $cityBudget;
			break;
			case '0':
				$cities = [];
				$area = Area::select('id')->where('key' , $entityKey )->where('deleted',0)->first();
				if($area){
				$cities = City::select('id')->where('area_id' , $area->id)->where('deleted' , 0)->get();
				}
				$citiesIDSArray = [];
				for($i = 0 ; $i<sizeof($cities ) ; $i++){
					array_push($citiesIDSArray , $cities[$i]->id);
				}
				$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->whereIn('city_id' , $citiesIDSArray)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'driver')
											->sum('activist_count');
			     
				$arrOutput["budgeted_drivers_count"] = $cityBudget;
				 
				break;
			case '1':
			    $cityBudget  = null;
			    $city = City::select('id')->where('key' , $entityKey)->first();
				if( $city){

			    $cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $city->id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'driver')
											->first()
											;
				}
			    if($cityBudget){
					$arrOutput["budgeted_drivers_count"] = $cityBudget->activist_count;
				}
				break;
			case '2':
			    $totalNeighborhoods = 0;
				$cityBudget = null;
				$neighborhood = Neighborhood::select('id' , 'city_id')->where('key' , $entityKey )->where('deleted',0)->first();
				if(!$neighborhood){
				
				$totalNeighborhoods =  Neighborhood::where('city_id' , $neighborhood->city_id)->where('deleted' , 0)->count();	
				$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $neighborhood->city_id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'driver')
											->first()
											;
				}
				if($cityBudget && $totalNeighborhoods > 0){
					$arrOutput["budgeted_drivers_count"] = ceil(intval($cityBudget->activist_count)/$totalNeighborhoods);
				}
				break;
			case '3':
				$cluster = Cluster::select('id' , 'city_id')->where('election_campaign_id' , $currentCampaign)->where('key' , $entityKey )->first();
				$cityBudget = null;
				$totalClusters = 0;
				if($cluster){
				$totalClusters =  Cluster::where('city_id' , $cluster->city_id)->where('election_campaign_id' , $currentCampaign)->count();	
				$cityBudget =  CityBudget::join('city_budget_activist_expected_expenses' , 'city_budget_activist_expected_expenses.city_budget_id' , '=','city_budget.id')
											->where('election_campaign_id',$currentCampaign)
											->where('city_id' , $cluster->city_id)
											->where('city_budget.deleted' , 0)
											->where('city_budget.budget_type' , 1)
											->where('city_budget_activist_expected_expenses.deleted',0)
											->where('city_budget.system_name' , 'driver')
											->first();
				}
				if($cityBudget && $totalClusters > 0){
					$arrOutput["budgeted_drivers_count"] = ceil(intval($cityBudget->activist_count)/$totalClusters);
				}
				break;
		}
		
		
		$arrOutput["transportations_per_driver"] = 0;
		if($arrOutput["voter_transportations_count"]  > 0 && $arrOutput["drivers_count"] > 0){
			$arrOutput["transportations_per_driver"] = ceil($arrOutput["voter_transportations_count"]/$arrOutput["drivers_count"]);
		}
		$jsonOutput->setData($arrOutput);
	}
	
	
	/*
		Function that returns supports statuses of last campaign and previous/selected other election campaign
	*/
	public function getSupportStatusesComparison(Request $request){
		$jsonOutput = app()->make("JsonOutput");		
		
		$entityType = $request->input('entity_type');
		$entityKey = $request->input('entity_key');

		if($entityType){
			if($entityKey == null || trim($entityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_ENTITY_KEY'));
				return;
			}
			if(!in_array($entityType , $this->entityTypesArray)){
				$jsonOutput->setErrorCode(config('errors.elections.INVALID_ENTITY_TYPE'));
				return;
			}
		}
		
		if(!GlobalController::isActionPermitted('elections.dashboards.pre_election_day')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		$arrOutput = [];
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;
		$previousCampID = -1;
		if(!$request->input('previous_camp_key')){
			$electionTypes = [config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'), config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL')];
			$previousCampID = ElectionCampaigns::select('id','name')->whereIn('type', $electionTypes)->where('id' , '!=',$currentCampaign )->orderBy('id' ,'DESC')->first();
			if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
			}
			$arrOutput["previous_camp_name"] = $previousCampID->name;
			$previousCampID = $previousCampID->id;
		}
		else{
			$previousCampID = ElectionCampaigns::select('id','name')->where('key' ,$request->input('previous_camp_key'))->where('id' , '!=',$currentCampaign )->first();
			if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
			}
			$arrOutput["previous_camp_name"] = $previousCampID->name;
			$previousCampID = $previousCampID->id;
		}
		
		$without_status_count = VoterElectionCampaigns::selectRaw('count(voters_in_election_campaigns.voter_id) as cnt')
													->leftJoin('voter_support_status' , function($joinOn){
														$joinOn->on('voter_support_status.voter_id' , '=', 'voters_in_election_campaigns.voter_id')
																->on('voter_support_status.election_campaign_id' , '=', 'voters_in_election_campaigns.election_campaign_id')
																->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'));
													})
													->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
													->whereNull('support_status_id');

		/////////////////////////////////////////////////////
		$SURE_SUPPORTING = config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING');
		$SUPPORTING = config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING');
		$POTENTIAL = config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL');
		$HESITATING = config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING');
		$TOGEATHER = config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER');
		$NOT_SUPPORTING = config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING');

		$currentStatusesCounts = VoterSupportStatus::select([
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$SURE_SUPPORTING' THEN 1 END)) as current_sure_support_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$SUPPORTING' THEN 1 END)) as current_support_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$POTENTIAL' THEN 1 END)) as current_potential_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$HESITATING' THEN 1 END)) as current_hesitating_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$NOT_SUPPORTING' THEN 1 END)) as current_not_supporting_count"),
											])
											->join('voters_in_election_campaigns' , function($joinOn){
												$joinOn->on('voters_in_election_campaigns.voter_id' , '=', 'voter_support_status.voter_id')
														->on('voters_in_election_campaigns.election_campaign_id' , '=', 'voter_support_status.election_campaign_id');
											})
											->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign)
											->where('voter_support_status.election_campaign_id' , $currentCampaign)
											->where('voter_support_status.deleted' , 0)
											->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'));

		$previousStatusesCounts = VoterElectionCampaigns::select([
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$SURE_SUPPORTING' THEN 1 END)) as previous_sure_support_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$SUPPORTING' THEN 1 END)) as previous_support_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$POTENTIAL' THEN 1 END)) as previous_potential_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$HESITATING' THEN 1 END)) as previous_hesitating_count"),
												DB::raw("(COUNT(CASE WHEN voter_support_status.support_status_id ='$NOT_SUPPORTING' THEN 1 END)) as previous_not_supporting_count"),
											])
											->join('voter_support_status' , function($joinOn){
												$joinOn->on('voter_support_status.voter_id' , '=', 'voters_in_election_campaigns.voter_id')
														->on('voter_support_status.election_campaign_id' , '=', 'voters_in_election_campaigns.election_campaign_id');
											})
											->where('voter_support_status.deleted' , 0)
											->where('voter_support_status.entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
											->where('voters_in_election_campaigns.election_campaign_id' , $previousCampID)
											->where('voter_support_status.election_campaign_id' , $previousCampID);

						
		if($entityType){
			$ballotBoxesCurrentIDSArray = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$currentCampaign);
			$ballotBoxesPreviousIDSArray = $this->getBallotBoxesIDSByEntityAndCampaing($entityType , $entityKey ,$previousCampID);
			if($ballotBoxesCurrentIDSArray == null ){
				$ballotBoxesCurrentIDSArray = [];
			}
			if($ballotBoxesPreviousIDSArray == null){
				$ballotBoxesPreviousIDSArray  = [];
			}
			//Current
			$currentStatusesCounts->whereIn('ballot_box_id', $ballotBoxesCurrentIDSArray);
			//Previous
			$previousStatusesCounts->whereIn('ballot_box_id', $ballotBoxesCurrentIDSArray);
		}
		$statusNamesList = [
					'sure_support_count', 'support_count', 'potential_count',
					'hesitating_count', 'not_supporting_count',
		];

		$currentStatusesCounts = $currentStatusesCounts->first();
		$previousStatusesCounts = $previousStatusesCounts->first();

		foreach($statusNamesList as $name){
			$currentName = "current_$name";
			$previousName = "previous_$name";
			$arrOutput[$currentName] = $currentStatusesCounts->$currentName;
			$arrOutput[$previousName] = $previousStatusesCounts->$previousName;
		}
		$arrOutput['without_status_count'] = $without_status_count->first()->cnt;
		$jsonOutput->setData($arrOutput);
	}
	
	/*
		Function that returns user's geo filters in form of areas , subareas , cities
	*/
	private function getRelevantGeoFilters(){
		$fields = [
                   'geographic_filters.id',
                   'geographic_filters.key',
                   'geographic_filters.name',
                   'geographic_filters.entity_type',
                   'geographic_filters.entity_id',
                   'cities.id as city_id',
				   'cities.key as city_key',
                   'cities.name as city_name',
                   'sub_areas.id as sub_area_id',
                   'sub_areas.name as sub_area_name',
                   'areas.id as area_id',
                   'areas.name as area_name'
        ];
		
		$geoFilters = GeographicFilters::select($fields)->withRoles()->withBallotBoxes()->withClusters()->withNeighborhoods()
                                              ->withCities()->withSubAreas()->withAreas()
                                              ->where(['roles_by_users.user_id' => Auth::user()->id, 'roles_by_users.deleted' => 0])
                                              ->where(function($query) {
                                                   $query->orWhere('geographic_filters.inherited_id', '>=', '0')
                                                         ->orWhereRaw(" (geographic_filters.inherited_id is NULL and not exists (select id from geographic_filters  as g1 where g1.inherited_id = geographic_filters.id)) ");
                                                })->get();
		$areas = null;
        $subAreas = null;
        $cities = null;
		$citiesIDS = [];
												
		$returnLists = new \stdClass;
		//!! what to do with allGeoFilters ??

        if(sizeof($geoFilters ) == 0){
             $areas = Area::select('id' , 'name' , 'key')->where('deleted' , 0)
							->with(['cities'=>function($query) {
									$query->select('id','name' , 'key','area_id')->where('deleted',0)->orderBy('name');
							}])
							->orderBy('name')->get();
			
             $subAreas = SubArea::select('id' , 'name' , 'key' , 'area_id')->where('deleted' , 0)->get();
             $cities = City::select('id' , 'name' , 'key' , 'area_id','sub_area_id')->where('deleted' , 0)->get();
			 for($i = 0 ; $i< sizeof($cities );$i++){
				 array_push($citiesIDS , $cities[$i]->id);
			 }
			 $returnLists->allGeoFilters = true;
        }
        else{
			$areasIDS = array();
            $citiesIDS = array();
			for($i = 0 ; $i< sizeof($geoFilters);$i++){
				if($geoFilters[$i]->area_id != null && array_search($geoFilters[$i]->area_id , $areasIDS) == false){
					array_push($areasIDS , $geoFilters[$i]->area_id);   
				}
                if($geoFilters[$i]->city_id != null && array_search($geoFilters[$i]->city_id , $citiesIDS) == false){
					array_push($citiesIDS , $geoFilters[$i]->city_id);
				}
				 
				if($geoFilters[$i]->entity_type == 0){
                    $cities= City::select('id' , 'name' , 'key' , 'area_id','sub_area_id')->where('deleted' , 0)->where('area_id' , $geoFilters[$i]->entity_id)->get();
				  
                   for($j = 0 ; $j < sizeof($cities);$j++){
                       
					   if(array_search($cities[$j]->id, $citiesIDS , true) == false){
						  array_push($citiesIDS , $cities[$j]->id);
					   }
				   }
				 
				} 
			}
		//!! what to do with allGeoFilters ??

			$returnLists->allGeoFilters = false;
		   $areas = Area::select('id' , 'name' , 'key')->where('deleted' , 0)->whereIn('id' , $areasIDS)
							->with(['cities'=>function($query) use($citiesIDS){
								$query->select('id','name' , 'key','area_id')->whereIn('id',$citiesIDS)->orderBy('name');
							}])
							->orderBy('name')->get();
           $subAreas= SubArea::select('id' , 'name' , 'key' , 'area_id')->where('deleted' , 0)->whereIn('area_id' , $areasIDS)->get();
           $cities= City::select('id' , 'name' , 'key' , 'area_id','sub_area_id')->where('deleted' , 0)->whereIn('id' , $citiesIDS)->get();
        }
	 
		$returnLists->areas = $areas;										
		$returnLists->subAreas = $subAreas;										
		$returnLists->cities = $cities;		
		$returnLists->citiesIDS = $citiesIDS;		
 		return $returnLists;	
	}
	
	
	/*
		Function that returns global inter-country supports statuses stats of user : 
	*/
	public function getGlobalStats(Request $request){
		$jsonOutput = app()->make("JsonOutput");	
		
		$currentPage = $request->input('current_page');
		$resultsPerPage = $request->input('results_per_page');
		if(!$currentPage){
			$currentPage = $this->DEFAULT_CURRENT_PAGE;
		}
		if(!$resultsPerPage ){
			$resultsPerPage = $this->DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE;
		}
			
		$areasAndCities = $this->getRelevantGeoFilters();
	 	
		$areas = $areasAndCities->areas;
        $subAreas = $areasAndCities->subAreas;
        $cities = $areasAndCities->cities;
        $citiesIDS = $areasAndCities->citiesIDS;
		 
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;

		$previousCampID = ElectionCampaigns::select('id','name')->where('type', $currentCampaignType)->where('id' , '!=',$currentCampaign )->orderBy('id' ,'DESC')->first();
		if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
		}
		$previousCampID = $previousCampID->id;
		
	    $arrOutput = [];
		
		//!! what to do with allGeoFilters ??
		/*
		if($areasAndCities->allGeoFilters){
			$arrOutput["total_voters_count"] = VoterElectionCampaigns::where('election_campaign_id',$currentCampaign)->count();
			$arrOutput["total_households_count"] = DB::select('SELECT count(distinct(household_id))  as cnt FROM `voters`')[0]->cnt;
			$arrOutput["previous_votes_count"] = Votes::where('election_campaign_id' , $previousCampID)->count();
			$arrOutput["previous_supporters_count"] = VoterSupportStatus::where('election_campaign_id' , $previousCampID)->where('deleted' , 0)->whereIn('support_status_id' , [config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING') , config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING')])->count();
			
			$arrOutput["tm_sure_supporters"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->count();
			$arrOutput["tm_supporters"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->count();
			$arrOutput["tm_potential"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->count(); 
			$arrOutput["tm_hesitate"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->count();
			$arrOutput["tm_not_support"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->count();
			$arrOutput["tm_together"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->count();
						 
		    $arrOutput["el_sure_supporters"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->count();
			$arrOutput["el_supporters"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->count();
			$arrOutput["el_potential"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->count();
			$arrOutput["el_hesitate"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->count();
			$arrOutput["el_not_support"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->count(); 
			$arrOutput["el_together"] = VoterSupportStatus::where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->count();
						 
			$arrOutput["tm_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->count();
			$arrOutput["tm_supporters_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->count();
			$arrOutput["tm_potential_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->count();
			$arrOutput["tm_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->count(); 
			$arrOutput["tm_not_support_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->count();
			$arrOutput["tm_together_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->count();
			
			$arrOutput["el_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->count();
			$arrOutput["el_supporters_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->count();
			$arrOutput["el_potential_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->count();
			$arrOutput["el_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->count();
			$arrOutput["el_not_support_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->count(); 
			$arrOutput["el_together_today"] = VoterSupportStatus::whereRaw('datediff(updated_at , now()) = 0')
																->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->count();
			
			$arrOutput["total_final_supporters"] = VoterSupportStatus::selectRaw("distinct(voter_support_status.voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)->whereIn('support_status_id' , [config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING') , config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING')])->where('entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))->count();
		
		
			$arrOutput['total_sure_support_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->count();
			$arrOutput['total_support_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->count();
			$arrOutput['total_potential_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->count();
			$arrOutput['total_hesitate_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->count();
			$arrOutput['total_not_support_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->count();
			$arrOutput['total_together_voters'] = VoterSupportStatus::selectRaw("distinct(voter_id)")->where('election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->count();
			
		}
		else{
			*/
			

			$ballotBoxIDSArray = [];
			$previosBallotBoxIDSArray = [];
			
			$strCities = implode(",", $citiesIDS );
			
			$ballotBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
			                            from `voters_in_election_campaigns`
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
										where  `clusters`.`city_id` in( ".$strCities ." )
												and `clusters`.`election_campaign_id` = ".$currentCampaign." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$currentCampaign);
			for($i = 0 ; $i < sizeof($ballotBoxIDS) ; $i++){
				array_push($ballotBoxIDSArray , $ballotBoxIDS[$i]->id);
			}

			$previosBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
										from `voters_in_election_campaigns` 
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
										where  `clusters`.`city_id` in( ".$strCities ." )
												and `clusters`.`election_campaign_id` = ".$previousCampID." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$previousCampID);
			for($i = 0 ; $i < sizeof($previosBoxIDS) ; $i++){
				array_push($previosBallotBoxIDSArray , $previosBoxIDS[$i]->id);
			}
			
			$arrOutput['total_voters_count'] =  DB::select("select count(distinct(`voters_in_election_campaigns`.`voter_id`)) as `cnt` 
													from `voters_in_election_campaigns` 
															inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
															inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
													where  `clusters`.`city_id` in( ".$strCities ." )
															and `clusters`.`election_campaign_id` = ".$currentCampaign." 
															and `voters_in_election_campaigns`.`election_campaign_id` = ".$currentCampaign)[0]->cnt;
															
			$arrOutput['total_households_count'] = Voters::selectRaw("count(distinct(household_id)) as cnt")->join('voters_in_election_campaigns' , 'voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
												->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
												->whereIn('ballot_box_id',$ballotBoxIDSArray)->get()[0]->cnt;
			$arrOutput['previous_supporters_count'] = VoterSupportStatus::selectRaw("count(support_status_id) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	->where('voter_support_status.deleted',0)
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $previousCampID)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$previosBallotBoxIDSArray)->get()[0]->cnt;
			$arrOutput['previous_votes_count'] = Votes::selectRaw("count(*) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'votes.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'votes.voter_id');
																	})
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $previousCampID)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$previosBallotBoxIDSArray)->get()[0]->cnt;
		
			$arrOutput["tm_sure_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)
																->count();
			$arrOutput["tm_potential"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
			$arrOutput["tm_hesitate"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_not_support"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_together"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
						 
			$arrOutput["el_sure_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_potential"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_hesitate"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_not_support"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
			$arrOutput["el_together"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
						 
			$arrOutput["tm_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_potential_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
			$arrOutput["tm_not_support_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["tm_together_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			
			$arrOutput["el_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_potential_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput["el_not_support_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
			$arrOutput["el_together_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		
		 
			$arrOutput['total_final_supporters'] = VoterSupportStatus::selectRaw("count(support_status_id) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	->where('voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
																	->where('voter_support_status.deleted',0)
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$ballotBoxIDSArray)->get()[0]->cnt;
			$arrOutput['total_sure_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput['total_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput['total_potential_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput['total_hesitate_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			$arrOutput['total_not_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		    $arrOutput['total_together_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			
			
		//}
					 
	 
		$jsonOutput->setData($arrOutput);
 
		 
	//	echo "This script took $seconds to execute.";
	}
	
	
	/*
		Function that returns citie's supports statuses stats of user : 
	*/
	public function getCitiesPanelsStats(Request $request){
		$executionStartTime = microtime(true);
		$jsonOutput = app()->make("JsonOutput");		
		
		$currentPage = $request->input('current_page');
		$resultsPerPage = $request->input('results_per_page');
		if(!$currentPage){
			$currentPage = $this->DEFAULT_CURRENT_PAGE;
		}
		if(!$resultsPerPage ){
			$resultsPerPage = $this->DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE;
		}
			
		$areasAndCities = $this->getRelevantGeoFilters($currentPage,$resultsPerPage);
	 	
		$areas = $areasAndCities->areas;
        $subAreas = $areasAndCities->subAreas;
        $cities = $areasAndCities->cities;
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;

		$previousCampID = ElectionCampaigns::select('id','name')->where('type', $currentCampaignType)->where('id' , '!=',$currentCampaign )->orderBy('id' ,'DESC')->first();
		if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
		}
		$previousCampID = $previousCampID->id;
		 
		$jsonOutput->setData($areas);
		$executionEndTime = microtime(true);
 
        $seconds = $executionEndTime - $executionStartTime;
 

       // echo "This script took $seconds to execute.";
	}
	
	/*
		This function returns only citie's area's stats by key
	*/
	public function getAreaOrCityOnlyStats(Request $request){
		$executionStartTime = microtime(true);
		$jsonOutput = app()->make("JsonOutput");	
		
		$currentCampaignData = ElectionCampaigns::currentCampaign();
		$currentCampaign = $currentCampaignData->id;
		$currentCampaignType = $currentCampaignData->type;

		$previousCampID = ElectionCampaigns::select('id','name')->where('type', $currentCampaignType)->where('id' , '!=',$currentCampaign )->orderBy('id' ,'DESC')->first();
		if(!$previousCampID ){
				$jsonOutput->setErrorCode(config('errors.import_csv.NOTHING_TO_COMPARE_TO'));
				return;
		}
		$previousCampID = $previousCampID->id;
		$arrData = [];
		
		$ballotBoxIDSArray = [];
		$ballotBoxIDS = null;
		$previosBallotBoxIDSArray = [];
		$previosBoxIDS = null;
		$entity = null;
		
		if($request->input("is_city") == '1'){
			$entity = City::select('id')->where('key' , $request->input('entity_key'))->where('deleted',0)->first();
			if(!$entity){
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
			}
			$ballotBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
			                            from `voters_in_election_campaigns`
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
										where  `clusters`.`city_id` = ".$entity->id." 
												and `clusters`.`election_campaign_id` = ".$currentCampaign." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$currentCampaign);
			for($i = 0 ; $i < sizeof($ballotBoxIDS) ; $i++){
				array_push($ballotBoxIDSArray , $ballotBoxIDS[$i]->id);
			}

			$previosBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
										from `voters_in_election_campaigns` 
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
										where  `clusters`.`city_id` = ".$entity->id." 
												and `clusters`.`election_campaign_id` = ".$previousCampID." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$previousCampID);
			for($i = 0 ; $i < sizeof($previosBoxIDS) ; $i++){
				array_push($previosBallotBoxIDSArray , $previosBoxIDS[$i]->id);
			}
	
			$arrData['total_voters_count'] =  DB::select("select count(distinct(`voters_in_election_campaigns`.`voter_id`)) as `cnt` 
													from `voters_in_election_campaigns` 
															inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
															inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
													where  `clusters`.`city_id` = ".$entity->id." 
															and `clusters`.`election_campaign_id` = ".$previousCampID." 
															and `voters_in_election_campaigns`.`election_campaign_id` = ".$previousCampID)[0]->cnt;
		}
		else{
			$entity = Area::select('id')->where('key' , $request->input('entity_key'))->where('deleted',0)->first();
			if(!$entity){
				$jsonOutput->setErrorCode(config('errors.elections.AREA_DOESNT_EXIST'));
				return;
			}
			$ballotBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
			                            from `voters_in_election_campaigns`
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
											inner join `cities` on `cities`.`id` = `clusters`.`city_id` 
										where `cities`.`deleted` = 0 
												and `cities`.`area_id` = ".$entity->id." 
												and `clusters`.`election_campaign_id` = ".$currentCampaign." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$currentCampaign);
			for($i = 0 ; $i < sizeof($ballotBoxIDS) ; $i++){
				array_push($ballotBoxIDSArray , $ballotBoxIDS[$i]->id);
			}

			$previosBoxIDS = DB::select("select distinct(`ballot_boxes`.`id`) as `id` 
										from `voters_in_election_campaigns` 
											inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
											inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
											inner join `cities` on `cities`.`id` = `clusters`.`city_id` 
										where `cities`.`deleted` = 0 
												and `cities`.`area_id` = ".$entity->id." 
												and `clusters`.`election_campaign_id` = ".$previousCampID." 
												and `voters_in_election_campaigns`.`election_campaign_id` = ".$previousCampID);
			for($i = 0 ; $i < sizeof($previosBoxIDS) ; $i++){
				array_push($previosBallotBoxIDSArray , $previosBoxIDS[$i]->id);
			}
	
			$arrData['total_voters_count'] =  DB::select("select count(distinct(`voters_in_election_campaigns`.`voter_id`)) as `cnt` 
													from `voters_in_election_campaigns` 
															inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id` 
															inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id` 
															inner join `cities` on `cities`.`id` = `clusters`.`city_id` 
													where `cities`.`deleted` = 0 
															and `cities`.`area_id` = ".$entity->id." 
															and `clusters`.`election_campaign_id` = ".$previousCampID." 
															and `voters_in_election_campaigns`.`election_campaign_id` = ".$previousCampID)[0]->cnt;
		}
		$arrData['total_households_count'] = Voters::selectRaw("count(distinct(household_id)) as cnt")->join('voters_in_election_campaigns' , 'voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
												->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
												->whereIn('ballot_box_id',$ballotBoxIDSArray)->get()[0]->cnt;
		$arrData['previous_supporters_count'] = VoterSupportStatus::selectRaw("count(support_status_id) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	->where('voter_support_status.deleted',0)
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $previousCampID)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$previosBallotBoxIDSArray)->get()[0]->cnt;
		$arrData['previous_votes_count'] = Votes::selectRaw("count(*) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'votes.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'votes.voter_id');
																	})
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $previousCampID)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$previosBallotBoxIDSArray)->get()[0]->cnt;
		
		$arrData["tm_sure_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)
																->count();
		$arrData["tm_potential"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
	    $arrData["tm_hesitate"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_not_support"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_together"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
						 
		$arrData["el_sure_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_supporters"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_potential"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_hesitate"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_not_support"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
		$arrData["el_together"] = VoterSupportStatus::where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
						 
		$arrData["tm_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_potential_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
		$arrData["tm_not_support_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["tm_together_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
			
		$arrData["el_sure_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_supporters_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_potential_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_hesitate_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData["el_not_support_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count(); 
		$arrData["el_together_today"] = VoterSupportStatus::whereRaw('datediff(voter_support_status.updated_at , now()) = 0')
																->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		
		 
		$arrData['total_final_supporters'] = VoterSupportStatus::selectRaw("count(support_status_id) as cnt")
															        ->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																	->where('voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
																	->where('voter_support_status.deleted',0)
												                    ->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
												                    ->whereIn('voters_in_election_campaigns.ballot_box_id',$ballotBoxIDSArray)->get()[0]->cnt;
		$arrData['total_sure_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
	    $arrData['total_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData['total_potential_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData['total_hesitate_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData['total_not_support_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		$arrData['total_together_voters'] = VoterSupportStatus::selectRaw("distinct(voters_in_election_campaigns.voter_id)")->where('voter_support_status.election_campaign_id' , $currentCampaign)->where('deleted' , 0)
																->join('voters_in_election_campaigns' , function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
																				->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
																	})
																->where('support_status_id', config('constants.VOTER_SUPPORT_STATUS_TYPE_TOGEATHER'))
																->whereIn('ballot_box_id' , $ballotBoxIDSArray)->count();
		
		$jsonOutput->setData($arrData);
		$executionEndTime = microtime(true);
 
		 
		$seconds = $executionEndTime - $executionStartTime;
 
	 
		//  echo "This script took $seconds to execute.";
	}
}
