<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\BallotBox;
use App\Models\BallotBoxRoles;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Neighborhood;
use App\Models\Streets;
use App\Models\VoterElectionCampaigns;
use App\Models\Voters;
use App\Models\ElectionRolesByVoters;
use App\Models\GeographicFilters;

use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Models\ActivistsAllocations;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\BallotBoxRolesRepository;
use App\Repositories\CityRepository;
use App\Repositories\QuarterRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GeographicController extends Controller
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
    }
     
	/*
		Function that returns all cities , or all cities in specific area_id
	*/ 
    public function getCities(Request $request, $area_id = null)
    {
        $jsonOutput = app()->make("JsonOutput");

        $checkPermissions = $request->input('check_permissions', null);
        $screenPermission = $request->input('screen_permissions', null);

        $query = City::select('cities.id', 'cities.key', 'cities.name', 'cities.mi_id', 'areas.id as area_id', 'sub_areas.id as sub_area_id')
            ->withAreaAndSubArea() //documentation in the scope function
            ->orderBy('cities.name', 'asc')
            ->where('cities.deleted', 0);

        $areaId = trim($area_id);
        if ($areaId) {
            $query->where('cities.area_id', $areaId);
        }
        $sub_area_key = $request->input('sub_area_key');
        if($sub_area_key){
            $subArea = SubArea::where('key',$sub_area_key)->first();
            if($subArea){
             $query->where('cities.sub_area_id', $subArea->id);
            }
        }
        // Check suer geo permissions:
        if(!empty($checkPermissions)){
            $userGeoFilters = GeoFilterService::getGeoFiltersForUser($screenPermission);
            $citiesIDS = $userGeoFilters['citiesIDS'];
            $query->whereIn('cities.id', $citiesIDS);
        }
        // dd($citiesIDS, $screenPermission);

        $cities = $query->get();
        $jsonOutput->setData($cities);
    }

	/*
		Function that returns all neighborhoods , or all neighborhoods in specific city_id
	*/ 
    public function getNeighborhoods(Request $request, $city_id = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($city_id == null) {
            $neighborhoods = Neighborhood::orderBy('name', 'asc')->select('id', 'name')->where('deleted', 0)->get();
            $jsonOutput->setData($neighborhoods);
        } else {
            $neighborhoods = Neighborhood::orderBy('name', 'asc')->select('id', 'name')->where('city_id', $city_id)->where('deleted', 0)->get();
            $jsonOutput->setData($neighborhoods);
        }
    }

	/*
		Function that returns all clusters , or all clusters in specific city_id
	*/
    public function getClusters(Request $request, $neighborhood_id = null)
    {
        $currentCampaign = ElectionCampaigns::currentLoadedVotersCampaign();
        $lastCampID = $currentCampaign['id'];

        $jsonOutput = app()->make("JsonOutput");
        if ($neighborhood_id == null) {
            $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->get();
            $jsonOutput->setData($clusters);
        } else {
            if ($request->input('city_id') == null) {
                $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('neighborhood_id', $neighborhood_id)->get();
            } else {
                if ($neighborhood_id == -1) {
                    $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('city_id', $request->input('city_id'))->get();
                } else {
                    $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('neighborhood_id', $neighborhood_id)->where('city_id', $request->input('city_id'))->get();
                }
            }
            $jsonOutput->setData($clusters);
        }
    }

	/*
		Function that returns all clusters of a city , by cityKey
	*/
    public function getCityClusters($cityKey, Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!$cityKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
		
		$currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
		 
		if($cityKey=="all" && $request->input("cities_keys") != null && sizeof(json_decode($request->input("cities_keys"))) > 0){
			 $citiesKeys = json_decode($request->input("cities_keys"));
			 $clusters = City::select(['clusters.id', 'clusters.key',  DB::raw($this->fullClusterNameQuery.' as name'), 'clusters.neighborhood_id'])
            ->withClusters(true)
			->whereIn('cities.key' , $citiesKeys)
            ->where(['election_campaign_id' => $currentCampaignId])
             ;
		}
		else{
			$clusters = City::select(['clusters.id', 'clusters.key',  DB::raw($this->fullClusterNameQuery.' as name'), 'clusters.neighborhood_id'])
            ->withClusters(true)
            ->where(['cities.key' => $cityKey, 'election_campaign_id' => $currentCampaignId])
             ;
        }
        if($request->input('get_only_hot_ballots', false)){
            $clusters->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                    ->where('ballot_boxes.hot', 1)
                    ->groupBy('clusters.id');
        }

        $geographicFilters = GeoFilterService::getAllUserGeoFilters();
        // dd($geographicFilters->toArray());
			$clustersIDSArray=[];
			for($i = 0 ; $i < sizeof($geographicFilters);$i++){
				$item = $geographicFilters[$i];
				switch($item->entity_type){
                    
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'): //Add area group filter
                        $areaIdList = AreasGroup::getAllAreas($item->entity_id);

                        $whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';

                        $areaGroupClusters = Cluster::where('election_campaign_id',$currentCampaignId)->whereRaw("city_id in (select id from cities where cities.deleted=0 and cities.area_id $whereInIdsQuery)")->get();
						for($s = 0 ; $s < sizeof($areaGroupClusters); $s++){
							 array_push($clustersIDSArray , $areaGroupClusters[$s]->id);
						}
                        break;
                    
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
						$areaClusters = Cluster::where('election_campaign_id',$currentCampaignId)->whereRaw('city_id in (select id from cities where cities.deleted=0 and cities.area_id='.$item->entity_id.')')->get();
						for($s = 0 ; $s < sizeof($areaClusters); $s++){
							 array_push($clustersIDSArray , $areaClusters[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
						$subAreaClusters = Cluster::where('election_campaign_id',$currentCampaignId)->whereRaw('city_id in (select id from cities where cities.deleted=0 and cities.sub_area_id='.$item->entity_id.')')->get();
						for($s = 0 ; $s < sizeof($subAreaClusters); $s++){
							 array_push($clustersIDSArray , $subAreaClusters[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
						$cityClusters = Cluster::where('election_campaign_id',$currentCampaignId)->where('city_id',$item->entity_id)->get();
						for($s = 0 ; $s < sizeof($cityClusters); $s++){
							 array_push($clustersIDSArray , $cityClusters[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
						$neighborhoodsClusters = Cluster::where('election_campaign_id',$currentCampaignId)->where('neighborhood_id',$item->entity_id)->get();
						for($s = 0 ; $s < sizeof($neighborhoodsClusters); $s++){
							 array_push($clustersIDSArray , $neighborhoodsClusters[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
					    array_push($clustersIDSArray , $item->entity_id);
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
						$ballotCluster = BallotBox::select("cluster_id")->where("ballot_boxes.id",$item->entity_id)->first();
					    if($ballotCluster){
							array_push($clustersIDSArray , $ballotCluster->cluster_id);
						}
						break;
				}
			}
        $clusters = $clusters->whereIn('clusters.id',$clustersIDSArray);
		 
		
		$clusters = $clusters->get();

        $jsonOutput->setData($clusters);
    }
	/*
		Function that returns ballots of neighborhood by neighborhoodKey
	*/
	public function getNeighborhoodsBallots($neighborhoodKey){
		$jsonOutput = app()->make("JsonOutput");

        if(!$neighborhoodKey){
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
        $ballotBoxes = BallotBox::select('ballot_boxes.id' , 'ballot_boxes.key' , 'ballot_boxes.mi_id as name')->withCluster()->LeftJoin('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id')->withCity()->where('neighborhoods.key',$neighborhoodKey)->where('clusters.election_campaign_id' , $currentCampaignId )->get();
        $jsonOutput->setData($ballotBoxes);
	}

	public function getNeighborhoodClusters(Request $request, $neighborhoodKey){
		$jsonOutput = app()->make("JsonOutput");

        if(!$neighborhoodKey){
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
        
        $result = [];
        $neighborhood = Neighborhood::select('id')->where('key', $neighborhoodKey)->first();
        if ($neighborhood) {
            $clusters = Cluster::select('clusters.id', 'clusters.key', 'name', 'prefix')
            ->where('neighborhood_id', $neighborhood['id'])
            ->where('election_campaign_id', $currentCampaignId);
            if($request->input('get_only_hot_ballots', false)){
                $clusters->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                        ->where('ballot_boxes.hot', 1)
                        ->groupBy('clusters.id');
            }
            $result = $clusters->get();
        }

        $jsonOutput->setData($result);
	}

	/*
		Function that returns ballot's electors of last election campaign by ballot_box key
	*/
    public function getBallotElectors($ballotKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!$ballotKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
        $electors = VoterElectionCampaigns::select('voters.key', 'voters_in_election_campaigns.voter_serial_number')
        ->withVoter()->withBallotBox()->where('ballot_boxes.key', $ballotKey)
        ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId)
        ->orderBy('voter_serial_number', 'asc')
        ->get();

        $jsonOutput->setData($electors);
    }

	/*
		Function that returns city's neiborhoods by cityKey
	*/
    public function getCityNeighborhoods($cityKey , Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
		
        if (!$cityKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
		
		$currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
		
		if($cityKey=="all" && $request->input("cities_keys") != null && sizeof(json_decode($request->input("cities_keys"))) > 0){
			 $citiesKeys = json_decode($request->input("cities_keys"));
			 $cityObj = City::select('id')
            ->whereIn('key', $citiesKeys)
            ->get();
			
			if (sizeof($cityObj) == 0) {
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
			}
			
			$citisIDSArr = [];
			for($i = 0 ; $i < sizeof($cityObj); $i++){
				array_push($citisIDSArr , $cityObj[$i]->id);
			}
			
			$neighborhoods = Neighborhood::select(['id', 'key', 'name'])
			->whereIn('city_id',$citisIDSArr)
            ->where(['deleted' => 0]);
		}
		else{
			 $cityObj = City::select('id')
            ->where('key', $cityKey)
            ->first();
			
			if (is_null($cityObj)) {
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
			}
			
			$neighborhoods = Neighborhood::select(['id', 'key', 'name'])
            ->where(['city_id' => $cityObj->id, 'deleted' => 0]);
		}
        
		if(Auth::user()['admin'] != '1'){
            $geographicFilters = GeoFilterService::getAllUserGeoFilters();

			$neighborhoodsIDSArray=[];
			$clustersIDSArray=[];
			$ballotsIDSArray=[];
			for($i = 0 ; $i < sizeof($geographicFilters);$i++){
				$item = $geographicFilters[$i];
				switch($item->entity_type){
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
					    array_push($neighborhoodsIDSArray , $item->entity_id);
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
						$clusterItm = Cluster::where('id',$item->entity_id)->first();
						if($clusterItm){
							if($clusterItm->neighborhood_id){
								array_push($neighborhoodsIDSArray , $clusterItm->neighborhood_id);
							}
							else{
								array_push($neighborhoodsIDSArray , 'NULL');
							}
						}
						break;
				    case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
						$clusterBallotItm = BallotBox::join('clusters','clusters.id','=','ballot_boxes.cluster_id')->where('clusters.election_campaign_id',$currentCampaignId)->where('ballot_boxes.id',$item->entity_id)->first();
						if($clusterBallotItm){
							if($clusterBallotItm->neighborhood_id){
								array_push($neighborhoodsIDSArray , $clusterBallotItm->neighborhood_id);
							}
							else{
								array_push($neighborhoodsIDSArray , 'NULL');
							}
						}
						break;
				}
			}
			 
			if(sizeof($neighborhoodsIDSArray)>0){
			 
				  $neighborhoods = $neighborhoods->whereIn('neighborhoods.id',$neighborhoodsIDSArray);
			}
			 
        }
        if($request->input('get_only_hot_ballots', false)){
            $neighborhoods->whereHas('clusters', function($query) use ($currentCampaignId) {
                $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                        ->where('election_campaign_id' , $currentCampaignId)
                        ->where('ballot_boxes.hot', 1);
			});
        }
		$neighborhoods = $neighborhoods->get();
        $jsonOutput->setData($neighborhoods);
    }

	/*
		Function that returns city's streets by cityKey
	*/
    public function getCityStreets($cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!$cityKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $cityObj = City::select('id')
            ->where('key', $cityKey)
            ->first();

        if (is_null($cityObj)) {
            $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
            return;
        }

        $streets = Streets::select(['id', 'key', 'name', 'mi_id', 'city_id'])
            ->where(['city_id' => $cityObj->id, 'deleted' => 0])
            ->get();

        $jsonOutput->setData($streets);
    }

    public function getListBallotBoxByClusterId(Request $request ,$clusterKey){
        $jsonOutput = app()->make("JsonOutput");
        $ballotBoxFields = [
            'ballot_boxes.id',
            'ballot_boxes.key',
            'ballot_boxes.mi_id as name',
			'ballot_boxes.cluster_id',
            'ballot_boxes.ballot_box_role_id',
        ];
        $ballotBoxes=BallotBoxService::getBallotBoxListByClusterKey($clusterKey,$ballotBoxFields);
        for ( $ballotIndex = 0; $ballotIndex < count($ballotBoxes); $ballotIndex++ ){
            $ballotBoxes[$ballotIndex]->name = BallotBox::getLogicMiBallotBox($ballotBoxes[$ballotIndex]->name);
        }
        
        $jsonOutput->setData($ballotBoxes);
    }

	/*
		Function that returns cluster's ballot boxes by clusterKey , 
		in last election campaign id
	*/
    public function getClusterBallots(Request $request ,$clusterKey) {
        $jsonOutput = app()->make("JsonOutput");
		$currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
		$clustersIDS = [];
		if($clusterKey=="all" && $request->input("clusters_keys") != null && sizeof(json_decode($request->input("clusters_keys"))) > 0){
			$clusterObj = Cluster::select(['id'])->whereIn('key', json_decode($request->input("clusters_keys")))->get();
			if (sizeof($clusterObj) == 0) {
				$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
				return;
			}
			for($i = 0 ; $i<sizeof($clusterObj) ; $i++){
				array_push($clustersIDS , $clusterObj[$i]->id);
			}
		}
		else{
			$clusterObj = Cluster::select(['id'])->where('key', $clusterKey)->first();
			if (is_null($clusterObj)) {
				$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
				return;
			}
			array_push($clustersIDS , $clusterObj->id);
		}
        $ballotBoxFields = [
            'ballot_boxes.id',
            'ballot_boxes.key',
            'ballot_boxes.mi_id as name',
			'ballot_boxes.cluster_id',
            'ballot_boxes.ballot_box_role_id',
        ];
        $withRoles = $request->input('with_roles', null);
        if ($withRoles) {
            if ( !GlobalController::isActionPermitted('elections.activists') && !GlobalController::isActionPermitted('elections.transportations.edit')) {
                $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
                return;
            }
            $ballotBoxFields = array_merge($ballotBoxFields, ['ballot_boxes.ballot_box_role_id', 'ballot_box_roles.name as ballot_box_role_name']);
        }

        $ballotsQuery = BallotBox::select($ballotBoxFields);
        if ($withRoles) {
            $ballotsQuery->withBallotBoxRole();
        }

        $ballotData = $ballotsQuery->whereIn('ballot_boxes.cluster_id', $clustersIDS) ;
		
            $geographicFilters = GeoFilterService::getAllUserGeoFilters();

			$ballotsIDSArray=[];
        for($i = 0 ; $i < sizeof($geographicFilters);$i++){
            $item = $geographicFilters[$i];
            switch($item->entity_type){
                
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                    $areaIdList = AreasGroup::getAllAreas($item->entity_id);

                    $whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';

                    $areaBallots = BallotBox::select("ballot_boxes.id as id")->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
                                                                            ->join('cities','cities.id','=','clusters.city_id')
                                                                            ->where('election_campaign_id',$currentCampaignId)
                                                                            ->whereRaw("clusters.city_id in (select cities.id where cities.deleted = 0 and area_id $whereInIdsQuery)")->get();
                    for($s = 0 ; $s < sizeof($areaBallots); $s++){
                            array_push($ballotsIDSArray , $areaBallots[$s]->id);
                    }
                    break;
                
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                    $areaBallots = BallotBox::select("ballot_boxes.id as id")->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
                                                                            ->join('cities','cities.id','=','clusters.city_id')
                                                                            ->where('election_campaign_id',$currentCampaignId)
                                                                            ->whereRaw('clusters.city_id in (select cities.id where cities.deleted = 0 and area_id='.$item->entity_id.')')->get();
                    for($s = 0 ; $s < sizeof($areaBallots); $s++){
                            array_push($ballotsIDSArray , $areaBallots[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                    $cityBallots = BallotBox::select("ballot_boxes.id as id")->join('clusters','clusters.id','=','ballot_boxes.cluster_id')->where('election_campaign_id',$currentCampaignId)->where('clusters.city_id',$item->entity_id)->get();
                    for($s = 0 ; $s < sizeof($cityBallots); $s++){
                            array_push($ballotsIDSArray , $cityBallots[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
                    $clusterBallots = BallotBox::select('id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$currentCampaignId." and neighborhood_id=".$item->entity_id.")")->get();
                    for($s = 0;$s<sizeof($clusterBallots) ; $s++){
                        array_push($ballotsIDSArray , $clusterBallots[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                    $clusterBallots = BallotBox::select('id')->where('cluster_id' , $item->entity_id)->get();
                    for($s = 0;$s<sizeof($clusterBallots) ; $s++){
                        array_push($ballotsIDSArray , $clusterBallots[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
                    array_push($ballotsIDSArray , $item->entity_id);
                    break;
            }
        }
            
        $ballotData = $ballotData->whereIn('ballot_boxes.id',$ballotsIDSArray);
		$ballotData = $ballotData->get();
		
		
        for ( $ballotIndex = 0; $ballotIndex < count($ballotData); $ballotIndex++ ) {
            $ballotData[$ballotIndex]->name = $this->getBallotMiId($ballotData[$ballotIndex]->name);
        }

        $jsonOutput->setData($ballotData);
    }

	/*
		Private helpful function that gets as parameter mi_id of ballot-boxes
		and returns formatted mi_id in form of "x.0"
	*/
    private function getBallotMiId($ballotMiId) {
        $lastDigit = substr($ballotMiId, -1);

        return substr($ballotMiId, 0, strlen($ballotMiId) - 1) . '.' . $lastDigit;
    }

	/*
		Function that returns all city's ballot boxes in last(current) election
		campaign , by cityKey
		
	*/
	public function getCityBallots($cityKey, Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $cityObj = City::select(['id'])->where('key', $cityKey)->where('deleted',0)->first();
        if ( is_null($cityObj) ) {
            $jsonOutput->setErrorCode(config('errors.global.CITY_NOT_EXISTS'));
            return;
        }

        $ballotBoxFields = [
            'ballot_boxes.id',
            'ballot_boxes.key',
            'ballot_boxes.mi_id as name',
			'ballot_boxes.cluster_id',
            'ballot_boxes.ballot_box_role_id',
            'ballot_box_roles.name as ballot_box_role_name'
        ];
		$currentCampaign = ElectionCampaigns::currentLoadedVotersCampaign();
        $lastCampID = $currentCampaign['id'];
        $ballots = BallotBox::select($ballotBoxFields)
            ->join('clusters' , 'clusters.id','=','ballot_boxes.cluster_id')
            ->where('clusters.election_campaign_id' , $lastCampID)
            ->where('clusters.city_id' , $cityObj->id)
            ->withBallotBoxRole() ;
			

		$ballots = $ballots->get();
        for ( $ballotIndex = 0; $ballotIndex < count($ballots); $ballotIndex++ ) {
            $ballots[$ballotIndex]->name = $this->getBallotMiId($ballots[$ballotIndex]->name);
        }

        $jsonOutput->setData($ballots);
    }

	/*
		Function that performs clusters search by POST params
	*/
    public function clustersSearch(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $areaId = $request->input('area_id', null);
        $subAreaId = $request->input('sub_area_id', null);
        $cityId = $request->input('city_id', null);
        $neighborhood_id = $request->input('neighborhood_id', null);
        $clusterId = $request->input('cluster_id', null);
        $assignmentStatus = $request->input('assignment_status', null);

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'clusters.id',
            'clusters.key',
            DB::raw($this->fullClusterNameQuery.' as name'),
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name',

            'clusters.leader_id',
            'voters.personal_identity as leader_personal_identity',
            'voters.first_name as leader_first_name',
            'voters.last_name as leader_last_name',

            'election_roles_by_voters.phone_number as leader_phone_number',
            'election_roles_by_voters.verified_status as leader_verified_status'
        ];

        $where = [
            'clusters.election_campaign_id' => $last_campaign_id
        ];

        $clusterObj = Cluster::select($fields)
            ->withLeader($last_campaign_id)
            // ->withElectionsRolesByVoters(true)
            ->withElectionRoles(true)
            ->withActivistsAllocations()
            ->withActivistsAllocationsAssignment()
            ->withCount('ballotBoxes');

        $countObj = Cluster::select('clusters.id')
            ->withLeader($last_campaign_id)
            // ->withElectionsRolesByVoters(true)
            ->withCity();

        if (!is_null($clusterId)) {
            $where['clusters.id'] = $clusterId;
        } else if (!is_null($neighborhood_id)) {
            $where['clusters.neighborhood_id'] = $neighborhood_id;
        } else if (!is_null($cityId)) {
            $where['clusters.city_id'] = $cityId;
        } else if (!is_null($subAreaId)) {
            $where['cities.sub_area_id'] = $subAreaId;
        } else if (!is_null($areaId)) {
            $where['cities.area_id'] = $areaId;
        }

        if (!is_null($assignmentStatus)) {
            if (1 == $assignmentStatus) {
                $clusterObj->whereNotNull('activists_allocations_assignments.election_role_by_voter_id');
                $countObj->whereNotNull('activists_allocations_assignments.election_role_by_voter_id');
            } else if (0 == $assignmentStatus) {
                $clusterObj->whereNull('activists_allocations_assignments.election_role_by_voter_id');
                $countObj->whereNull('activists_allocations_assignments.election_role_by_voter_id');
            }
        }

        $clusterObj->where($where)->groupBy('clusters.id');
        $countObj->where($where)->groupBy('clusters.id');

        $summaryClusters = DB::table(DB::Raw('( ' . $countObj->toSql() . ' ) AS t1'))
            ->setBindings([$countObj->getBindings()])
            ->select(DB::raw('count(t1.id) as total_clusters'))
            ->first();

        $clusters = $clusterObj->get();

        $results = [
            'clusters' => $clusters,
            'totalClusters' => $summaryClusters->total_clusters
        ];

        $jsonOutput->setData($results);
    }

	/*
		Function that gets electionRoleByVoterKey and POST params , and
		returns the corresponding clusters to allocate
	*/
    public function getClustersToAllocate(Request $request, $electionRoleByVoterKey) {
        $jsonOutput = app()->make("JsonOutput");

        //search details
        $areaId = $request->input('area_id', null);
        $subAreaId = $request->input('sub_area_id', null);
        $cityId = $request->input('city_id', null);
        $neighborhood_id = $request->input('neighborhood_id', null);
        $clusterId = $request->input('cluster_id', null);
        $assignmentStatus = $request->input('assignment_status', null);

        if (is_null($electionRoleByVoterKey)) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        //get role voter object for find role type 
        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'voter_id', 'election_role_id'])
            ->where('key', $electionRoleByVoterKey)
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        }

        //get role object
        $electionRoleObj = ElectionRoles::select(['id', 'system_name'])
            ->where(['id' => $electionRoleByVoter->election_role_id, 'deleted' => 0])
            ->first();
        if (is_null($electionRoleObj)) {
            $jsonOutput->setErrorCode(config('errors.elections.ELECTION_ROLE_KEY_DOES_NOT_EXIST'));
            return;
        } else {
            //arr type role cluster
            $clusterRoles = [config('constants.activists.election_role_system_names.driver'),
                             config('constants.activists.election_role_system_names.clusterLeader'),
                             config('constants.activists.election_role_system_names.motivator')];

                             //check if  type in cluster role
            if (!in_array($electionRoleObj->system_name, $clusterRoles)) {
                $jsonOutput->setErrorCode(config('errors.elections.ILLEGAL_ROLE_TO_CLUSTER'));
                return;
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $clusterRoles = [
            config('constants.activists.election_role_system_names.clusterLeader'),
            config('constants.activists.election_role_system_names.driver'),
            config('constants.activists.election_role_system_names.motivator')
        ];

        $electionRoles = ElectionRoles::select(['id', 'system_name'])
            ->whereIn('system_name', $clusterRoles)
            ->where('deleted', 0)
            ->get();

        $electionRolesHash = [];
        for ( $roleIndex = 0; $roleIndex < count($electionRoles); $roleIndex++ ) {
            $currentSystemName = $electionRoles[$roleIndex]->system_name;
            $electionRolesHash[$currentSystemName] = $electionRoles[$roleIndex]->id;
        }

        $fields = [
            'clusters.id',
            'clusters.key',
            DB::raw($this->fullClusterNameQuery . ' as name'),
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name'
        ];

        //another field by specific role type
        switch ($electionRoleObj->system_name) {
            case config('constants.activists.election_role_system_names.clusterLeader'):
                $clusterLeaderFields = [
                    'clusters.leader_id',
                    'voters.personal_identity as leader_personal_identity',
                    'voters.first_name as leader_first_name',
                    'voters.last_name as leader_last_name',

                    'election_roles_by_voters.phone_number as leader_phone_number',
                    'election_roles_by_voters.verified_status as leader_verified_status',
                    'election_roles_by_voters.user_lock_id as leader_user_lock_id',
                    'election_roles_by_voters.lock_date as leader_lock_date'
                ];
                $fields = array_merge($fields, $clusterLeaderFields);
                break;

            case config('constants.activists.election_role_system_names.driver'):
                $driverFields = [
                    DB::raw('count(election_roles_by_voters.id) as count_clusters_drivers'),
                    DB::raw('count(voter_transportations.id) as count_cluster_transportations'),
                    DB::raw('count(voter_transportations_crippled.id) as count_cluster_transportations_crippled')
                ];
                $fields = array_merge($fields, $driverFields);
                break;

            case config('constants.activists.election_role_system_names.motivator'):
                $motivatorFields = [
                    DB::raw('count(election_roles_by_voters.id) as count_clusters_motivators')
                ];
                $fields = array_merge($fields, $motivatorFields);
                break;
        }

        $where = [
            'clusters.election_campaign_id' => $last_campaign_id
        ];

        $clusterObj = null;
        $countObj = null;

        switch ($electionRoleObj->system_name) {
            case config('constants.activists.election_role_system_names.clusterLeader'):
                $clusterObj = Cluster::select($fields)
                    ->withLeader($last_campaign_id)
                    ->withCity()
                    ->withCount('ballotBoxes');

                $countObj = Cluster::select('clusters.id')
                    ->withLeader($last_campaign_id)
                    ->withCity();
                break;

            case config('constants.activists.election_role_system_names.driver'):
                $clusterObj = Cluster::select($fields)
                    ->withCity()
                    ->withCount(['driverGeo' => function($query) use ($last_campaign_id, $electionRolesHash){
                        $query->withElectionRolesByVoters(false)
                            ->where(['election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                                'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                                'election_roles_by_voters.election_role_id' => $electionRolesHash[config('constants.activists.election_role_system_names.driver')]]);
                    }])
                    ->withCount('ballotBoxes')
                    ->withDriversGeographicAreas($last_campaign_id);

                $countObj = Cluster::select(['clusters.id', DB::raw('count(election_roles_by_voters.id) as count_clusters_drivers')])
                    ->withCity()
                    ->withCount(['driverGeo' => function($query) use ($last_campaign_id){
                        $query->withElectionRolesByVoters(false)
                            ->where(['election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                                'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                                'election_roles.system_name' => config('constants.activists.election_role_system_names.driver')]);
                    }])
                    ->withDriversGeographicAreas($last_campaign_id);
                break;

            case config('constants.activists.election_role_system_names.motivator'):
                $clusterObj = Cluster::select($fields)
                    ->withCity()
                    ->withCount(['motivatorGeo' => function($query) use ($last_campaign_id, $electionRolesHash){
                        $query->withElectionRolesByVoters(false)
                            ->where(['election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                                'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                                'election_roles_by_voters.election_role_id' => $electionRolesHash[config('constants.activists.election_role_system_names.motivator')]]);
                    }])
                    ->withCount('ballotBoxes')
                    ->withMotivatorsGeographicAreas($last_campaign_id);

                $countObj = Cluster::select(['clusters.id', DB::raw('count(election_roles_by_voters.id) as count_clusters_motivators')])
                    ->withCity()
                    ->withCount(['motivatorGeo' => function($query) use ($last_campaign_id, $electionRolesHash){
                        $query->withElectionRolesByVoters(false)
                            ->where(['election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                                'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                                'election_roles_by_voters.election_role_id' => $electionRolesHash[config('constants.activists.election_role_system_names.motivator')]]);
                    }])
                    ->withMotivatorsGeographicAreas($last_campaign_id);
                break;
        }

        if (!is_null($clusterId)) {
            $where['clusters.id'] = $clusterId;
        } else if (!is_null($neighborhood_id)) {
            $where['clusters.neighborhood_id'] = $neighborhood_id;
        } else if (!is_null($cityId)) {
            $where['clusters.city_id'] = $cityId;
        } else if (!is_null($subAreaId)) {
            $where['cities.sub_area_id'] = $subAreaId;
        } else if (!is_null($areaId)) {
            $where['cities.area_id'] = $areaId;
        }

        if (!is_null($assignmentStatus)) {
            switch ($electionRoleObj->system_name) {
                case config('constants.activists.election_role_system_names.clusterLeader'):
                    if (1 == $assignmentStatus) {
                        $clusterObj->whereNotNull('clusters.leader_id');
                        $countObj->whereNotNull('clusters.leader_id');
                    } else if (0 == $assignmentStatus) {
                        $clusterObj->whereNull('clusters.leader_id');
                        $countObj->whereNull('clusters.leader_id');
                    }
                    break;

                case config('constants.activists.election_role_system_names.driver'):
                    if (1 == $assignmentStatus) {
                        $clusterObj->having('driver_geo_count', '>', 0);
                        $countObj->having('driver_geo_count', '>', 0);
                    } else if (0 == $assignmentStatus) {
                        $clusterObj->having('driver_geo_count', '=', 0);
                        $countObj->having('driver_geo_count', '=', 0);
                    }
                    break;

                case config('constants.activists.election_role_system_names.motivator'):
                    if (1 == $assignmentStatus) {
                        $clusterObj->having('motivator_geo_count', '>', 0);
                        $countObj->having('motivator_geo_count', '>', 0);
                    } else if (0 == $assignmentStatus) {
                        $clusterObj->having('motivator_geo_count', '=', 0);
                        $countObj->having('motivator_geo_count', '=', 0);
                    }
                    break;
            }
        }

        $clusterObj->where($where)->groupBy('clusters.id');
        $countObj->where($where)->groupBy('clusters.id');

        $summaryClusters = DB::table(DB::Raw('( ' . $countObj->toSql() . ' ) AS t1'))
            ->setBindings([$countObj->getBindings()])
            ->select(DB::raw('count(t1.id) as total_clusters'))
            ->first();

        $clusters = $clusterObj->get();

        $results = [
            'clusters' => $clusters,
            'totalClusters' => $summaryClusters->total_clusters
        ];

        $jsonOutput->setData($results);
    }

    //TODO::remove after finish arrange
    // public function ballotsSearch(Request $request, $electionRoleKey)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     $currentPage = $request->input('current_page', 1);
    //     $limit = config('constants.activists.MAX_RECORDS_FROM_DB');
    //     $skip = ($currentPage - 1) * config('constants.activists.MAX_RECORDS_FROM_DB');

    //     $areaId = $request->input('area_id', null);
    //     $subAreaId = $request->input('sub_area_id', null);
    //     $cityId = $request->input('city_id', null);
    //     $neighborhoodId = $request->input('neighborhood_id', null);
    //     $clusterId = $request->input('cluster_id', null);
    //     $ballotId = $request->input('ballot_id', null);
    //     $ballotRoleId = $request->input('ballot_role_id', null);
    //     $assignmentStatus = $request->input('assignment_status', null);
    //     $assignmentStatus = (int) $assignmentStatus;
    //     $ballotRoleOnly = $request->input('with_ballot_roles', null);

    //     $fields = [
    //         'ballot_boxes.id',
    //         'ballot_boxes.key',
    //         'ballot_boxes.mi_id as name',
    //         DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),

    //         'ballot_box_roles.type as role_type',
    //         'ballot_box_roles.id as ballot_box_role_id',
    //         'ballot_box_roles.name as ballot_box_role_name',

    //         'clusters.id as cluster_id',
    //         DB::raw($this->fullClusterNameQuery . ' as cluster_name'),
    //         'clusters.city_id',
    //         'cities.name as city_name',
    //         'clusters.street',
    //     ];

    //     $electionCampaignId = ElectionCampaigns::currentCampaign()->id; //VoterElectionsController::getLastCampaign();

    //     $ballotObj = BallotBox::select($fields)
    //         ->withCluster()
    //         ->withCity()
    //         ->where('clusters.election_campaign_id', $electionCampaignId);


    //     switch ($assignmentStatus) {
    //         case config('constants.activists.ballot_assignment_status.ALL_ROWS'):
    //             $ballotObj->withActivistsAllocations(true, true);
    //             break;

    //         case config('constants.activists.ballot_assignment_status.NO_ASSIGNMENT'):
    //             $ballotObj
    //                 ->withActivistsAllocations(true, true)
    //                 ->leftJoin('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', 'activists_allocations.id')
    //                 ->whereNull('activists_allocations_assignments.id');
    //             break;

    //         case config('constants.activists.ballot_assignment_status.PARTIAL_ASSIGNMENT'):
    //         case config('constants.activists.ballot_assignment_status.NO_OR_PARTIAL_ASSIGNMENT'):

    //             $ballotObj
    //             ->withActivistsAllocations(false, true)
    //             ->where(function ($orQuery) use ($assignmentStatus) {
    //                 $orQuery->orWhere(function ($query) {
    //                     $query->has('ActivistsAllocations', '=', 1)
    //                     ->whereDoesntHave('ActivistsAllocations', function ($query2) {
    //                         $query2
    //                             ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                             ->withElectionRoleShifts()
    //                             ->where('election_role_shifts.system_name', config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'));
    //                     });
    //                 });

    //                 $orQuery->orWhere(function ($subQuery) {
    //                     $subQuery->has('ActivistsAllocations', '=', 2)
    //                     ->whereDoesntHave('ActivistsAllocations', function ($query) {
    //                         $query->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                         ->withElectionRoleShifts()
    //                             ->whereIn('election_role_shifts.system_name', [
    //                                 config('constants.activists.role_shifts.ALL_DAY'),
    //                                 config('constants.activists.role_shifts.SECOND_AND_COUNT')
    //                             ]);
    //                     });
    //                 });

    //                 if ($assignmentStatus == config('constants.activists.ballot_assignment_status.NO_OR_PARTIAL_ASSIGNMENT')) {
    //                     $orQuery->orWhere(function ($query) {
    //                         $query->whereDoesntHave('ActivistsAllocations', function ($query2) {
    //                             $query2
    //                                 ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                                 ->withElectionRoleShifts();
    //                         });
    //                     });
    //                 }
    //             });
    //             break;

    //         case config('constants.activists.ballot_assignment_status.FIRST_SHIFT_ASSIGNEMT'):
    //         case config('constants.activists.ballot_assignment_status.SECOND_SHIFT_ASSIGNEMT'):

    //             if ($assignmentStatus == config('constants.activists.ballot_assignment_status.FIRST_SHIFT_ASSIGNEMT')) {
    //                 $shiftToCompare = config('constants.activists.role_shifts.FIRST');
    //                 $shiftNotToCompare = [config('constants.activists.role_shifts.SECOND')];
    //             } else if ($assignmentStatus == config('constants.activists.ballot_assignment_status.SECOND_SHIFT_ASSIGNEMT')) {
    //                 $shiftToCompare = config('constants.activists.role_shifts.SECOND');
    //                 $shiftNotToCompare = [config('constants.activists.role_shifts.FIRST')];
    //             }
    //             $shiftNotToCompare[] = config('constants.activists.role_shifts.COUNT');
    //             $ballotObj
    //             ->withActivistsAllocations(false, true)
    //             ->whereHas('ActivistsAllocations', function ($qr) use ($shiftToCompare) {
    //                 $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                 ->join('election_role_shifts', 'election_role_shifts.id', 'activists_allocations_assignments.election_role_shift_id')
    //                 ->where('election_role_shifts.system_name', $shiftToCompare);
    //             })
    //                 ->whereDoesntHave('ActivistsAllocations', function ($qr) use ($shiftNotToCompare) {
    //                     $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                     ->join('election_role_shifts', 'election_role_shifts.id', 'activists_allocations_assignments.election_role_shift_id')
    //                     ->whereIn('election_role_shifts.system_name', $shiftNotToCompare);
    //                 });
    //             break;

    //         case config('constants.activists.ballot_assignment_status.ASSIGNED_WITHOUT_COUNT'):
    //             $ballotObj
    //             ->withActivistsAllocations(false, true)
    //             ->where(function ($query) {
    //                 $query->whereHas('ActivistsAllocations', function ($qr) {
    //                     $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                     ->withElectionRoleShifts()
    //                         ->whereIn('election_role_shifts.system_name', [
    //                             config('constants.activists.role_shifts.FIRST'),
    //                             config('constants.activists.role_shifts.SECOND'),
    //                             config('constants.activists.role_shifts.ALL_DAY')
    //                         ]);
    //                 });
    //             })
    //                 ->where(function ($query) {
    //                     $query->whereDoesntHave('ActivistsAllocations', function ($qr) {
    //                         $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                         ->withElectionRoleShifts()
    //                             ->whereIn('election_role_shifts.system_name', [
    //                                 config('constants.activists.role_shifts.COUNT'),
    //                                 config('constants.activists.role_shifts.SECOND_AND_COUNT'),
    //                                 config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')
    //                             ]);
    //                     });
    //                 });
    //             break;

    //         case config('constants.activists.ballot_assignment_status.FULL_ASSIGNMENT'):
    //             $ballotObj
    //             ->withActivistsAllocations(false, true)
    //             ->where(function ($orQuery) {
    //                 $orQuery->orWhere(function ($query) {
    //                     $query->has('ActivistsAllocations', '=', 1)
    //                     ->whereHas('ActivistsAllocations', function ($query2) {
    //                         $query2
    //                             ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                             ->withElectionRoleShifts()
    //                             ->where('election_role_shifts.system_name', config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'));
    //                     });
    //                 });
    //                 $orQuery->orWhere(function ($subQuery) {
    //                     $subQuery->has('ActivistsAllocations', '=', 2)
    //                     ->whereHas('ActivistsAllocations', function ($query) {
    //                         $query
    //                             ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
    //                             ->withElectionRoleShifts()
    //                             ->whereIn('election_role_shifts.system_name', [
    //                                 config('constants.activists.role_shifts.ALL_DAY'),
    //                                 config('constants.activists.role_shifts.SECOND_AND_COUNT')
    //                             ]);
    //                     });
    //                 });
    //                 $orQuery->orWhere(function ($subQuery) {
    //                     $subQuery->has('ActivistsAllocations', '=', 3);
    //                 });
    //             });
    //             break;
    //     }

    //     $ballotObj->with(['AllAssignment' => function ($qr) {
    //         $geoFields = [
    //             'activists_allocations.ballot_box_id',
    //             'activists_allocations_assignments.id',
    //             'activists_allocations_assignments.election_role_by_voter_id',
    //             'activists_allocations_assignments.election_role_shift_id',
    //             'election_role_shifts.key as election_role_shift_key',
    //             'election_role_shifts.name as election_role_shift_name',
    //             'election_role_shifts.system_name as election_role_shift_system_name',
    //             'election_roles_by_voters.verified_status',
    //             'election_roles_by_voters.voter_id',
    //             'election_roles_by_voters.phone_number',
    //             'election_roles_by_voters.user_lock_id',
    //             'voters.first_name',
    //             'voters.last_name',
    //             'voters.personal_identity',
    //             'voters.key as voter_key',

    //             'election_roles.id as election_role_id',
    //             'election_roles.name as election_role_name',
    //         ];

    //         $qr->addSelect($geoFields)
    //             ->withElectionRoleShifts()
    //             ->withElectionRoles()
    //             ->leftJoin('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
    //             ->leftJoin('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
    //             ->orderBy('activists_allocations_assignments.election_role_shift_id', 'asc');
    //     }]);

    //     $ballotObj->addSelect(
    //         DB::raw('( select count(*) from 
    //         activists_allocations_assignments join activists_allocations on activists_allocations_assignments.activist_allocation_id=activists_allocations.id where activists_allocations.ballot_box_id=ballot_boxes.id) as count_assignment')
    //     );

    //     if (!is_null($ballotId)) {
    //         $where['ballot_boxes.id'] = $ballotId;
    //     } else if (!is_null($clusterId)) {
    //         $where['clusters.id'] = $clusterId;
    //     } else if (!is_null($neighborhoodId)) {
    //         $where['clusters.neighborhood_id'] = $neighborhoodId;
    //     } else if (!is_null($cityId)) {
    //         $where['clusters.city_id'] = $cityId;
    //     } else if (!is_null($subAreaId)) {
    //         $where['cities.sub_area_id'] = $subAreaId;
    //     } else if (!is_null($areaId)) {
    //         $where['cities.area_id'] = $areaId;
    //     }

    //     if (!is_null($ballotRoleId)) {
    //         $where['ballot_box_roles.id'] = $ballotRoleId;
    //     }
    //     $ballotObj->where($where);
    //     $totalBallots = $ballotObj->count();
    //     $ballots = $ballotObj->skip($skip)->take($limit)->get();

    //     $result = [
    //         'ballots' => $ballots,
    //         'totalBallots' => $totalBallots,
    //     ];

    //     $jsonOutput->setData($result);
    // }

	/*
		Function that updates cluster leader by clusterKey and voterKey(leader)
	*/
    // public function updateClusterLeader($clusterKey, $voterKey) {
    //     $jsonOutput = app()->make("JsonOutput");
		 
    //     $result = $this->addClusterLeader($jsonOutput, $clusterKey, $voterKey);
    //     if(!empty($result)){
    //         $jsonOutput->setData($result);
    //     }
    // }
    // public function addClusterLeader($jsonOutput, $clusterKey, $voterKey) {

    //     $clusterFields = [
    //         'clusters.id',
    //         'clusters.key',
    //         DB::raw($this->fullClusterNameQuery . ' as name'),
    //         'clusters.street',
    //         'clusters.city_id',
    //         'cities.name as city_name',
    //     ];

    //     $clusterObj = Cluster::select(['id'])->where('key', $clusterKey)->first();
    //     if (is_null($clusterObj)) {
    //         $jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
    //         return;
    //     }
	// 	$lastCampID = ElectionCampaigns::currentCampaign()['id'];
		
    //     $currentVoter = Voters::select(['voters.id', 'assigned_city_id',
    //     'election_roles.id as election_role_id', 'election_roles_by_voters.id as election_role_by_voter_id'])
    //     ->withElectionRolesByVoters()
    //     ->where('voters.key', $voterKey)
    //     ->where('election_roles.system_name', 'cluster_leader')
	// 	->where('election_roles_by_voters.election_campaign_id',$lastCampID)
    //     ->first();
        
    //     if ( is_null($currentVoter) ) {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    //         return;
    //     } 
		 
    //     $clusterId = $clusterObj->id;


    //     $clusterObj2 = Cluster::select($clusterFields)
    //         ->withCity()
    //         ->withCount('ballotBoxes')
    //         ->where('clusters.id', $clusterId)
    //         ->where('clusters.city_id', $currentVoter->assigned_city_id)
	// 		->where('clusters.election_campaign_id',$lastCampID)
    //         ->first();
			 
    //     if(!$clusterObj2){
    //         $jsonOutput->setErrorCode(config('errors.elections.CLUSTER_ROLE_DOES_NOT_EXIST_IN_CITY'));
    //         return;
    //     }
    //     DB::beginTransaction();
        
    //     try {
    //         $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');

    //         $activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation($entityType, $clusterObj->id, $currentVoter->election_role_id, $currentVoter->election_role_by_voter_id);
    //         if(!$activistAllocation){
    //             $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS')); return;
    //         }
    //         ActivistsAllocationsAssignmentsService::updateAllocationAssignment($activistAllocation, $currentVoter->election_role_by_voter_id);
            
    //         DB::commit();

    //         // all good
    //     } catch (\Exception $e) {
    //         Log::info($e);

    //         DB::rollback(); return;
    //         // something went wrong
    //     }


    //     return $clusterObj2;
    // }

	/*
		Function that deletes current cluster's leader by clusterKey  
	*/
    // public function deleteClusterLeader($clusterKey)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     $clusterObj = Cluster::select(['id', 'leader_id'])->where('key', $clusterKey)->first();
    //     if (is_null($clusterObj)) {
    //         $jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
    //         return;
    //     }

    //     $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

    //     $electionRoleByVoter = ElectionRolesByVoters::select(['election_roles_by_voters.id', 'election_roles_by_voters.user_lock_id', 'election_role_id'])
    //         ->join('election_roles' , function($joinOn) {
    //             $joinOn->on('election_roles.id' , '=', 'election_roles_by_voters.election_role_id')
    //                 ->where('election_roles.system_name', DB::raw('"' . config('constants.activists.election_role_system_names.clusterLeader') . '"'))
    //                 ->where('election_roles.deleted', DB::raw(0));
    //         })
    //         ->where(['election_roles_by_voters.voter_id' => $clusterObj->leader_id, 'election_roles_by_voters.election_campaign_id' => $last_campaign_id])
    //         ->first();
    //     if (!$electionRoleByVoter) {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
    //         return;
    //     } elseif ( !is_null($electionRoleByVoter->user_lock_id) ) {
    //         $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
    //         return;
    //     }

    //     $oldLeaderId = $clusterObj->leader_id;

    //     $clusterObj->leader_id = null;
    //     $clusterObj->save();
        
    //     ActivistsAllocations::where('cluster_id', $clusterObj->id)
    //     ->where('election_role_by_voter_id', $electionRoleByVoter->id)
    //     ->where('election_campaign_id', $last_campaign_id)
    //     ->where('election_role_id', $electionRoleByVoter->election_role_id)
    //     ->update(['election_role_by_voter_id' => null]);

    //     $actionHistoryFields = [];
    //     $actionHistoryFields[] = [
    //         'field_name' => 'leader_id',
    //         'display_field_name' => config('history.Cluster.leader_id'),
    //         'old_numeric_value' => $oldLeaderId,
    //     ];

    //     $historyArgsArr = [
    //         'topicName' => 'elections.activists.cluster_leader.edit',
    //         'models' => [
    //             [
    //                 'referenced_model' => 'Cluster',
    //                 'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
    //                 'referenced_id' => $clusterObj->id,
    //                 'valuesList' => $actionHistoryFields,
    //             ],
    //         ],
    //     ];

    //     ActionController::AddHistoryItem($historyArgsArr);

    //     $jsonOutput->setData($clusterObj->id);
    // }

	/*
		Function that returns all ballot boxes , or all ballot boxes of specific cluster id
	*/
    public function getBallots(Request $request, $cluster_id = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($cluster_id == null) {
            $ballots = BallotBox::select('id', 'mi_id as name')->get();
            $jsonOutput->setData($ballots);
        } else {
            $ballots = BallotBox::select('id', 'mi_id as name')->where('cluster_id', $cluster_id)->get();
            for ($i = 0; $i < count($ballots); $i++) {
                $ballots[$i]->name = 'קלפי ' . $ballots[$i]->name;
            }
            $jsonOutput->setData($ballots);
        }
    }

    public function getCityQuarters($key = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $city = CityRepository::getCityByKey($key);
            $quarters = QuarterRepository::getQuartersByCityId($city->id);
            $jsonOutput->setData($quarters);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

	/*
		Function that returns all possible ballot boxes roles
	*/
    public function getBallotBoxRoles()
    {
        $jsonOutput = app()->make("JsonOutput");

        $ballotBoxRoles = BallotBoxRoles::select(['id', 'key', 'name', 'type'])->where('deleted', 0)->get();

        $jsonOutput->setData($ballotBoxRoles);
    }

	/*
		Function that returns all areas
	*/
    public function getAreas(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $checkPermissions = $request->input('check_permissions', null);
        $screenPermission = $request->input('screen_permissions', null);

        $resultArray = Area::select('id','key','name', 'areas_group_id')->where('deleted', 0);

        if(!empty($checkPermissions)){
            $userGeoFilters = GeoFilterService::getGeoFiltersForUser($screenPermission);
            $areasIDS = $userGeoFilters['areasIDS'];
            $resultArray->whereIn('areas.id',$areasIDS );
        }

        
        $resultArray = $resultArray->get();
        $jsonOutput->setData($resultArray);
    }
    
    public function getSubAreas(Request $request, $areaKey){

        $checkPermissions = $request->input('check_permissions', null);
        $screenPermission = $request->input('screen_permissions', null);

        if ($areaKey) {
            $areaKey = trim($areaKey);
            $areaId = Area::select('id')->where('key', $areaKey)->first()['id'];
            $result = SubArea::select('id','key', 'name', 'area_id')->where('area_id', $areaId)->where('deleted', 0);
        } else {
            $result = SubArea::select('id','key', 'name' , 'area_id')->where('deleted', 0);
        }
        if(!empty($checkPermissions)){
            $userGeoFilters = GeoFilterService::getGeoFiltersForUser($screenPermission);
            $sub_areasIDS = $userGeoFilters['sub_areasIDS'];
            $result->whereIn('sub_areas.id', $sub_areasIDS);
        }
        $result = $result->get();

        return $result;
    }

    public function getSubAreasData(Request $request, $areaKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $result = $this->getSubAreas($request, $areaKey);
        $jsonOutput->setData($result);
    }

    public function setClusterGoogleMap(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $object = (object)($request->all());
        $cluster_id= $object->cluster_id;
        $cancel_google_map=$object->cancel_google_map;
            try {
               $cluster=Cluster::select()->where('id',$cluster_id)->first();
               $cluster->cancel_google_map=$cancel_google_map;
               $cluster->save();
               $jsonOutput->setData(true);
            } catch (\Throwable $th) {
                $jsonOutput->setErrorCode();
            }
    }

}
