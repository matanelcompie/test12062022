<?php

namespace App\Libraries\Services\municipal;

use App\Enums\ElectionRoleSystemName;
use App\Enums\GeographicEntityType;
use App\Libraries\Helper;
use App\Libraries\Services\cityActivists\ClusterBallotsActivistsService;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\VotersService;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\GeographicFilters;
use App\Models\ActivistsAllocations;
use App\Models\Area;
use App\Models\AreasGroup;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\CityBudget;
use App\Models\Quarter;
use App\Models\RolesByUsers;
use App\Models\SubArea;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\Voters;
use App\Models\Votes;
use App\Repositories\CityRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\VotersRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class MunicipalElectionsRolesService {

    /** Get City municipal summary data: */
    public static function getMunicipalEntitySummary($entityType, $entityId, $getCityClusters){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $entityFullData = self::getMunicipalEntitiesByType($entityType, $entityId, 'elections.activists', $getCityClusters);
        $currentEntity = $entityFullData->currentEntity;
        $parentEntityType = $entityFullData->parentEntityType;
        $subEntities = $entityFullData->subEntities;
        $subEntityType = $entityFullData->subEntityType;
        // dd($subEntities->toArray());
        $parentEntitySummary = new stdClass;
        $subEntitiesSummary = [];
        if($currentEntity){
            $parentEntitySummary = self::getMunicipalEntityActivistsAllocations($entityType, $currentEntity, $electionCampaignId);
            $parentEntitySummary->parent_entity_id = $currentEntity->parent_entity_id;
            // $parentEntitySummary->parent_entity_key = $currentEntity->parent_entity_key;
            $parentEntitySummary->parent_entity_type = $parentEntityType;
            foreach($subEntities as $subItem){
                $subItemDataSummary = self::getMunicipalEntityActivistsAllocations($subEntityType, $subItem, $electionCampaignId);
                $subEntitiesSummary[] = $subItemDataSummary;
            }
        }

        return ['parent_entities_activists_summary' => $parentEntitySummary, 'sub_entities_activists_summary' => $subEntitiesSummary];
    }
    /** 
    * @method getMunicipalEntitiesByType
    *  Get municipal entity full data:
    *  subEntities => sub entities array.
    *  subEntityType => sub entities type.
    *  currentEntity => current entity.
    */

    public static function getMunicipalEntitiesByType($entityType, $entityId, $screenPermissions, $getCityClusters=null){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $subEntities = [];
        $parentEntityType = null;
        $subEntityType = null;
        $currentEntity = null;
        switch($entityType){
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                $currentEntity = AreasGroup::select('id','name', 'key')->where('id', $entityId)->first();
                $areasIds = GeoFilterService::getGeoFiltersForUser($screenPermissions, true)['areasIDS'];
                // dd($areasIds);
                $subEntities = Area::select('id','name', 'key')->where('areas_group_id', $entityId)->whereIn('id', $areasIds)->get();
                $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
                $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                $currentEntity = Area::select('id','name' ,'key','areas_group_id as parent_entity_id')->where('id', $entityId)->first();
                $sub_areasIDS = GeoFilterService::getGeoFiltersForUser($screenPermissions, false, true)['sub_areasIDS'];
                $subEntities = SubArea::select('id','name' ,'key')->where('area_id', $entityId)
                                //only sub area with city
                                ->whereRaw('sub_areas.id in (
                                select sub_areas.id from cities where sub_area_id=sub_areas.id
                                )')
                              ->whereIn('id', $sub_areasIDS)->get();
                $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
                $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP');

                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):// Sub area type
                $currentEntity = SubArea::select('id','name' ,'key', 'area_id as parent_entity_id')->where('id', $entityId)->first();
                $citiesIDS = GeoFilterService::getGeoFiltersForUser($screenPermissions, false, false, true)['citiesIDS'];
                $subEntities = City::select('cities.id','cities.name', 'cities.key')->where('sub_area_id', $entityId)->whereIn('id', $citiesIDS)->get();
                $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
                $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'): // City type
                $citiesIDS = GeoFilterService::getGeoFiltersForUser($screenPermissions, false, false, true)['citiesIDS'];
                $currentEntity = City::select('id','name' ,'key', 'sub_area_id as parent_entity_id')->whereIn('cities.id', $citiesIDS)->where('id', $entityId)->first();
                if(!$getCityClusters){ // Get city quarters
                    $subEntities = QuarterRepository::getCityQuartersAndDirectorDetails($currentEntity->id, $electionCampaignId,true);
   
                    $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER');
                } else { // Get city clusters
                    $subEntities = Cluster::select('clusters.id','clusters.name', 'clusters.key', 'clusters.neighborhood_id')
                    ->where('clusters.city_id', '=', $currentEntity->id)
                    ->where('clusters.election_campaign_id', '=', $electionCampaignId);
                    if($screenPermissions == 'elections.activists'){ // Get clusters ballots
                        $subEntities->with(['ballotBoxes'=>function($query2){
                            $query2->select('ballot_boxes.id' , 'key' , 'ballot_boxes.cluster_id' , 'mi_id', 'voter_count' ,'crippled',
                             'activists_allocations.ballot_box_role_id as role' )
                            ->withActivistsAllocations()
                            ->orderBy('ballot_boxes.id');
                        }]);
                    }

                    $subEntities =$subEntities->get();
                    $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
                }

                $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
                
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER'): // Quarter type
                $currentEntity = Quarter::select('id','name' ,'key', 'city_id as parent_entity_id')->where('id', $entityId)->first();

                $subEntities = Cluster::select('clusters.id','clusters.name', 'clusters.key', 'clusters.neighborhood_id')
                ->where('clusters.election_campaign_id', '=', $electionCampaignId)
                ->where('clusters.quarter_id', '=', $currentEntity->id);

                if($screenPermissions == 'elections.cities'){ // Get clusters ballots
                    $subEntities->with(['ballotBoxes'=>function($query2){
                        $query2->select('id' , 'key' , 'cluster_id' , 'mi_id', 'voter_count', 'ballot_box_role_id as role' ,'crippled')->orderBy('ballot_boxes.id');
                    }]);
                }
                $subEntities =$subEntities->get();
                $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
                $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
                break;
        }
        $entityFullData = new stdClass  ();
        $entityFullData->currentEntity = $currentEntity;
        $entityFullData->subEntities = $subEntities;
        $entityFullData->subEntityType = $subEntityType;
        $entityFullData->parentEntityType = $parentEntityType;
        return $entityFullData;
    }
    /**
     * @method getMunicipalElectionRoleSummary 
     * !! For city activists extrnal screen!
     * 1. Get municipal election role data
     * 2. Get all election role summary data
     * 3. Get all election role sub entities summary data
     * 4. Get all entities types.
     * 5. Only for geo low then city! 
     */
    public static function getMunicipalElectionRoleSummary($electionRoleKey){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $userId = Auth::user()->id;
        $fields = [
            'election_roles.name as election_role_name', 'election_roles.system_name as election_role_system_name',
             'activists_allocations.*'
        ];
        $whereList = [
            ['election_roles_by_voters.election_campaign_id', '=', $electionCampaignId],
            ['activists_allocations.election_campaign_id', '=', $electionCampaignId],
            ['election_roles.key', '=', $electionRoleKey],
            ['users.id', '=', $userId],
        ];
        $electionRoleData =  ActivistsAllocations::select($fields)
        ->withUserData()
        ->where($whereList)
        ->first();
        // Get election role geo level: 
        $geoEntityData = self::getElectionRoleAllocationGeoLevel($electionRoleData);

        if(empty($geoEntityData['parent_entity'])){ return []; }

        $subEntities = self::getElectionRoleAllocationSubEntities($geoEntityData);

        $parentEntitySummary = self::getMunicipalEntityActivistsAllocations($geoEntityData['entity_type'], $geoEntityData['parent_entity'], $electionCampaignId);
        $subEntitiesSummary = [];
        foreach($subEntities as $subItem){
            $subEntitiesSummary[] = self::getMunicipalEntityActivistsAllocations($geoEntityData['sub_entity_type'], $subItem, $electionCampaignId);
        }
        return [
            'parent_entities_activists_summary' => $parentEntitySummary, 'sub_entities_activists_summary' => $subEntitiesSummary,
            'entity_type' => $geoEntityData['entity_type'] ,'current_entity' => $geoEntityData['parent_entity']
        ];
    }
    // Todo merge this function with getMunicipalEntitiesByType
    /** Get election role geo data:
     * 1. entity level
     * 2. sub entity level
     * 3. current entity
     * */ 
    private static function getElectionRoleAllocationGeoLevel(ActivistsAllocations $electionRoleData){
        $entity = null;
        $entityType = null;
        $subEntityType = null;
        if($electionRoleData->ballot_box_id){
        } else if ($electionRoleData->cluster_id){
            $entity  = Cluster::select('id', 'name', 'key')->where('id', $electionRoleData->cluster_id)->first();
            $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
            $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
        } else if ($electionRoleData->quarter_id){
            $entity  = Quarter::select('id', 'name', 'key')->where('id', $electionRoleData->quarter_id)->first();
            $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER');
            $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
        }  else {
            $entity  = City::select('id', 'name', 'key')->where('id', $electionRoleData->city_id)->first();
            $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
            $subEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER');
        }     
        return [
            'parent_entity' => $entity,
            'entity_type' => $entityType,
            'sub_entity_type' => $subEntityType
        ];
    }
    // Todo merge this function with getMunicipalEntitiesByType
    private static function getElectionRoleAllocationSubEntities($geoEntityData){
        $subEntities = [];
        $entityId = $geoEntityData['parent_entity']->id;
        switch($geoEntityData['entity_type']){
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                $subEntities = Quarter::select('quarters.id', 'quarters.name')
                ->withActivistsAllocations()
                ->where('quarters.city_id', $entityId)
                ->groupBy('quarters.id')
                ->get();
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER'):
                $subEntities = ActivistsAllocations::select('clusters.id', 'clusters.name')->withClusters()
                ->where('activists_allocations.quarter_id', $entityId)->whereNull('ballot_box_id')
                ->groupBy('clusters.id')
                ->get();
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                // $subEntities = ActivistsAllocations::select('quarter_id as sub_entity_id')
                // ->where('city_id', $entityId)->whereNull('cluster_id')->get();
                break;
        }
        return $subEntities;

    }
    /** Get entity municipal activists allocations counters*/
    public static function getMunicipalEntityActivistsAllocations(int $entityType, $currentEntity, int $electionCampaignId)
    {

        $entityId = $currentEntity->id;
        $entityColumn = ActivistsAllocationsService::getActivistAllocationColByType($entityType);
        $currentEntityEmptyId = null;
        // Geo areas types
        $areaGeoItems = [
            GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP,
            GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA,
            GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_SUB_AREA
        ];

        $geoAreaCities = null;
        $entityCounters = [];
        if (!in_array($entityType, $areaGeoItems)) {
            //The entityId is null when select city and need display all cluster without quarter
            if (is_null($entityId) || (is_array($entityId) && count($entityId) == 0)) {
                $currentEntityEmptyId =  $currentEntity;
            }

            if ($entityType != GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER) {
                $entityCounters = ClusterBallotsActivistsService::getCountBallotAllocationAndAssignemtIncludeCountCluster($entityColumn, [$entityId], $electionCampaignId, $currentEntityEmptyId);
            } else { // Cluster entity have other counters:
                $entityCounters = ClusterBallotsActivistsService::getBallotCountVotesAndAllocationByArrClusterId([$entityId]);
            }
        } else {
            $geoAreaCities = CityRepository::getArrCityIdByGeographicTypeAndValue($entityType, $entityId);
            $entityCounters = ClusterBallotsActivistsService::getCountBallotAllocationAndAssignemtIncludeCountCluster('city_id', $geoAreaCities, $electionCampaignId);
        }

        //details count allocation for all role type not ballot
        $ActivistsAllocations = self::getCountAllocationForAllRoleNotInBallot($entityColumn, $entityId, $electionCampaignId, $geoAreaCities, $currentEntityEmptyId);
        $ActivistsAssignment = self::getCountAssignmentForAllRoleNotInBallot($entityColumn, $entityId, $electionCampaignId, $geoAreaCities, $currentEntityEmptyId);
        $ActivistsAllocations = Helper::mergeEloquentProperty($ActivistsAllocations, $ActivistsAssignment);
        //details count allocation ballot role
        if ($entityType != GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER) {
            self::getCountAllocationAndAssignmentForBallotRoles($entityColumn, $entityId, $ActivistsAllocations, $electionCampaignId, $geoAreaCities, $currentEntityEmptyId);
        }
        // Build entity data for send client:
        self::createObjectResultEntityData($ActivistsAllocations, $entityId, $currentEntity, $entityType, $entityCounters);

        return $ActivistsAllocations;
    }

    private static function createObjectResultEntityData(&$ActivistsAllocations, $entityId, $currentEntity, $entityType, $entityCounters){
        $ActivistsAllocations->entity_id = $entityId;
        $ActivistsAllocations->entity_key = $currentEntity->key;
        $ActivistsAllocations->entity_name = $currentEntity->name;
        $ActivistsAllocations->entity_type = $entityType;
        $ActivistsAllocations->entities_counters = $entityCounters;

        if($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')){ // Get clusters ballots:
            $ActivistsAllocations->ballot_boxes = $currentEntity->ballotBoxes;
            $ActivistsAllocations->neighborhood_id = $currentEntity->neighborhood_id;
        }
        if($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER')){
            
            if(!empty($currentEntity->quarter_director_id)){
                $ActivistsAllocations->quarter_director_data = $currentEntity->quarterDirectorDetails;
            }
        }
    }

    /**
     * function get entity type anf value of geographic  and return count allocation and count assignment for all role type activist not in ballot
     *
     * @param [type] $entityType
     * @param [type] $entityId
     * @param [type] $electionRolesHash
     * @param [type] $whereList
     * @param [type] $geoAreaCities
     * @return ActivistsAllocations
     */
    private static function getCountAllocationForAllRoleNotInBallot($entityColumn, $entityId, $electionCampaignId, $geoAreaCities, $currentEntityEmptyId = null)
    {
        $electionRolesHash = ElectionRolesRepository::getHashElectionRole('system_name');
        $rolesForSum = [
            ElectionRoleSystemName::DRIVER,
            ElectionRoleSystemName::MINISTER_OF_FIFTY,
            ElectionRoleSystemName::CLUSTER_LEADER,
            ElectionRoleSystemName::MOTIVATOR,
            ElectionRoleSystemName::QUARTER_DIRECTOR
        ];

        $fields = [];
        // Prepare counters fields:
        foreach ($rolesForSum as $roleSystemName) {
            $roleId = ($electionRolesHash[$roleSystemName])->id;
            $fields[] = DB::raw("SUM(CASE WHEN $roleId = election_role_id THEN 1 ELSE 0 END) as $roleSystemName");
        }

        // Get non ballot activists allocation
        $ActivistsAllocations = ActivistsAllocations::select($fields)
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->whereNull('ballot_box_id');

        //For entities higher then city:
        if (isset($geoAreaCities)) {
            $ActivistsAllocations->whereIn('activists_allocations.city_id', $geoAreaCities);
        } else {
            if (!is_null($currentEntityEmptyId)) {
                $ActivistsAllocations->whereNull($entityColumn)
                    ->where('activists_allocations.city_id', $currentEntityEmptyId->city_id);
            } else {
                $ActivistsAllocations->where($entityColumn, $entityId);
            }
        }

        return $ActivistsAllocations->first();
    }

       /**
     * function get entity type anf value of geographic  and return count allocation and count assignment for all role type activist not in ballot
     *
     * @param [type] $entityType
     * @param [type] $entityId
     * @param [type] $electionRolesHash
     * @param [type] $whereList
     * @param [type] $geoAreaCities
     * @return ActivistsAllocations
     */
    private static function getCountAssignmentForAllRoleNotInBallot($entityColumn, $entityId, $electionCampaignId, $geoAreaCities, $currentEntityEmptyId = null)
    {
        $electionRolesHash = ElectionRolesRepository::getHashElectionRole('system_name');
        $rolesForSum = [
            ElectionRoleSystemName::DRIVER,
            ElectionRoleSystemName::MINISTER_OF_FIFTY,
            ElectionRoleSystemName::CLUSTER_LEADER,
            ElectionRoleSystemName::MOTIVATOR,
            ElectionRoleSystemName::QUARTER_DIRECTOR
        ];

        $fields = [];
        // Prepare counters fields:
        foreach ($rolesForSum as $roleSystemName) {
            $roleId = ($electionRolesHash[$roleSystemName])->id;
            $fields[] = DB::raw("SUM(CASE WHEN $roleId = election_role_id  and activists_allocations_assignments.election_role_by_voter_id is not null THEN 1 ELSE 0 END) as allocated_$roleSystemName");
        }

        // Get non ballot activists allocation
        $ActivistsAllocations = ActivistsAllocations::select($fields)
            ->withActivistsAssignments(true)
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->whereNull('ballot_box_id');

        //For entities higher then city:
        if (isset($geoAreaCities)) {
            $ActivistsAllocations->whereIn('activists_allocations.city_id', $geoAreaCities);
        } else {
            if (!is_null($currentEntityEmptyId)) {
                $ActivistsAllocations->whereNull($entityColumn)
                    ->where('activists_allocations.city_id', $currentEntityEmptyId->city_id);
            } else {
                $ActivistsAllocations->where($entityColumn, $entityId);
            }
        }

        return $ActivistsAllocations->first();

    }

        //* Ballots activists counters:
    private static function getCountAllocationAndAssignmentForBallotRoles($entityColumn, $entityId, &$ActivistsAllocations,$electionCampaignId, $geoAreaCities,$currentEntityEmptyId=null){
        
        if(isset($geoAreaCities)){
            $entityColumn="city_id";
            $entityId=$geoAreaCities;
        }

        $electionRolesHash=ElectionRolesRepository::getHashElectionRole('system_name');
        //Ballot roles:
        $ballotRolesForSum = [
            ElectionRoleSystemName::BALLOT_MEMBER,
            ElectionRoleSystemName::OBSERVER,
            ElectionRoleSystemName::COUNTER,
        ];

        $ballotFields = [];

        foreach($ballotRolesForSum as $roleSystemName){
            $roleId = ($electionRolesHash[$roleSystemName])->id;
            $allocatedFieldName = "allocated_$roleSystemName";
            $ballotFields[] = DB::raw("SUM(CASE WHEN $roleId = election_role_id THEN 1 ELSE 0 END) as $roleSystemName");
            $subQuery = ClusterBallotsActivistsService::queryCountAllocateShiftGroupBallot($electionCampaignId,$entityColumn, $entityId, $roleSystemName,$currentEntityEmptyId);
            $querySumAssignment = "select count(count_allocate_shift_ballot) from ($subQuery) as Table_allocate_ballot";
            $ballotFields[] = DB::raw("($querySumAssignment) as $allocatedFieldName"); //DB::raw("SUM(CASE WHEN $roleId = election_role_id AND  $countQuery THEN 1 ELSE 0 END) as $allocatedFieldName");
      
            $ActivistsAllocations->$roleSystemName = 0;
            $ActivistsAllocations->$allocatedFieldName = 0;
        }
        // Get ballot activists allocation
        $activistsBallotAllocations = ActivistsAllocations::select($ballotFields)
        ->where('activists_allocations.election_campaign_id',$electionCampaignId)
        ->whereNotNull('ballot_box_id');

          //For entities higher then city:
          if (isset($geoAreaCities)) {
            $activistsBallotAllocations->whereIn('activists_allocations.city_id', $geoAreaCities);
        } else {
            if (!is_null($currentEntityEmptyId)) {
                $activistsBallotAllocations->whereNull($entityColumn)
                ->where('activists_allocations.city_id', $currentEntityEmptyId->city_id);
            } else {
          
                $activistsBallotAllocations->where($entityColumn, $entityId);
            }
        }

        $activistsBallotAllocations = $activistsBallotAllocations->get();

        foreach($activistsBallotAllocations as $ballotCountItem){
            foreach($ballotRolesForSum as $key ){
                $allocatedKeyName = "allocated_$key";
                $ActivistsAllocations->$key +=  $ballotCountItem->$key;
                $ActivistsAllocations->$allocatedKeyName +=  $ballotCountItem->$allocatedKeyName;
            }
        }
    }


    /**
     * @method getCityBallotsAppointmentLetters
     * Get city 
     */
    public static function getCityBallotsAppointmentLetters($electionRoleId,  $ballotRolesSystemNames, $cityId){
        // get list of activist and there ballot number:
        $currentCampaign = ElectionCampaigns::currentCampaign();
		$electionCampaignId = $currentCampaign->id;

        return ElectionRolesByVoters::select('ballot_boxes.mi_iron_number as ballot_iron_number', 'voters.personal_identity')
        // ->withGeographic()
		// ->withElectionRole(false)
        ->withActivistsAllocationAssignment()
		->withVoter()
		->join('ballot_boxes', function ( $joinOn ) {
			$joinOn->on([
				['ballot_boxes.id', '=', 'activists_allocations.ballot_box_id'],
				// ['ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
				// ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))],
			]);
		})
		->leftJoin('ballot_box_roles', 'activists_allocations.ballot_box_role_id', 'ballot_box_roles.id')
		->leftJoin('clusters', 'ballot_boxes.cluster_id', 'clusters.id')
		->whereNotNull('mi_iron_number')
		->where('clusters.city_id', $cityId)
		->where('activists_allocations.election_role_id', $electionRoleId)
		->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
		->whereIn('ballot_box_roles.system_name', $ballotRolesSystemNames)
		->get();
    }

    /**
     * @method  getEntityBallotBoxesAndShifts
     * Get city/cluster ballots allocations and assignments
     * 1. Get ballots counters:
     *    a. Last vote date
     *    b. Count of expected shas votes.
     * 2. Get other counters with services: BallotBoxService::getBallotShiftsAndSupportersQuery.
     * @return $ballots (collection)
     */
    public static function getEntityBallotBoxesAndShifts($cityId, $quarterId){
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $electionCampaignId = $currentCampaign->id;
        $ClusterNameQuery = Cluster::getClusterFullNameQuery();
		$ballotBoxQuery = BallotBoxService::getBallotShiftsAndSupportersQuery($electionCampaignId);

        $ballotBoxQuery->withCluster()
        ->withBallotBoxRole()
        ->addSelect(DB::raw($ClusterNameQuery), 'ballot_boxes.mi_id', 'ballot_boxes.key', 'activists_allocations.ballot_box_role_id as role', 
        'ballot_box_roles.system_name as ballot_role_system_name')
        ->where('clusters.city_id', $cityId)
        ->where('clusters.election_campaign_id', $electionCampaignId)
        ->orderBy('ballot_boxes.mi_id');

        if(!empty($quarterId)){
            $ballotBoxQuery->where('clusters.quarter_id', $quarterId);
        }
        $ballots = $ballotBoxQuery->get();
        foreach($ballots as $i => $ballot){

            $votesLastDate = Votes::select('voters_in_election_campaigns.created_at')
            ->withVotersInElectionCampaign()->where('votes.election_campaign_id' , $electionCampaignId)->where('ballot_box_id', $ballot->id)
            ->orderBy('voters_in_election_campaigns.created_at' , 'DESC')
            ->first();

            $ballots[$i]->last_vote_date = $votesLastDate;

            $ballots[$i]->previous_shas_votes_count = $ballots[$i]->calculated_mi_shas_votes;
        }

        return $ballots;
    }

    /**
     * @method getCityElectionRoleBudget
     *  Get activists default payment 
     */
    public static function getCityElectionRoleBudget(Request $request){
        $jsonOutput = app()->make("JsonOutput");

        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $cityKey = $request->input('city_key', null);
        $city = City::where('key', $cityKey)->first();
        if(!$city){$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST')); return;}

        $fields = ['system_name', 'activist_salary as budget'];
        $electionRolesCityBudget = CityBudget::select($fields)
        ->withCityBudgetActivistExpectedExpenses()
        ->where('city_budget.deleted', 0)
        ->where('city_budget_activist_expected_expenses.deleted', 0)
        ->where('city_budget.election_campaign_id', $last_campaign_id)
        ->where('city_budget.city_id', $city->id)
        ->groupBy('system_name')->get();
        $jsonOutput->setData($electionRolesCityBudget);
    }
}
