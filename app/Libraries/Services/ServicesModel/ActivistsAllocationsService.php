<?php

namespace App\Libraries\Services\ServicesModel;

use App\Enums\GeographicEntityType;
use App\Http\Controllers\CityActivistsController;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\municipal\MunicipalQuartersManagement;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistsAllocations;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRoleShifts;
use App\Models\BallotBox;
use App\Models\BallotBoxRole;
use App\Models\City;
use App\Models\Cluster;
use App\Models\VoterPhone;
use App\Models\Voters;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class ActivistsAllocationsService{

    //delete activists_allocations without cluster
    public static  function deleteActivistAllocateWithoutCluster(){
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $allocationsWithOutClusters = ActivistsAllocations::select([
            DB::raw('activists_allocations.*'),
            // DB::raw('election_roles_by_voters.*'),
        'election_roles_by_voters.key as election_roles_by_voters_key'])
        ->withElectionRoleCampaign($currentCampaignId, false)
        ->leftJoin('clusters', 'clusters.id', 'activists_allocations.cluster_id')
        ->where('activists_allocations.election_campaign_id',$currentCampaignId)
        ->whereNull('clusters.id')
        ->get();
        $v_Controller = new VoterActivistController();
        Log::info(json_encode($allocationsWithOutClusters));

        foreach ($allocationsWithOutClusters as $key => $activistAllocate) {
            if(!is_null($activistAllocate->election_roles_by_voters_key)){
                $v_Controller->deleteElectionActivistRole($activistAllocate->election_roles_by_voters_key, false);
            }
            $activistAllocate->delete();
        }

    }
    
    public static function getCountActivistBallotByEntityGeo($election_campaign_id,$entityGeoType,$arrEntityGeoKey){
        $objectEntity=MunicipalQuartersManagement::getDetailsEntity($entityGeoType);
        $tableGeo=$objectEntity->table;
        $countBallotBoxWithActivist=
        ActivistsAllocations::select(DB::raw('count(distinct activists_allocations.ballot_box_id ) as countBallotRole,cities.id as city_id'))
        ->withBallotBox(false)
        ->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
        ->join('cities','cities.id','=','clusters.city_id')
        ->leftJoin('sub_areas','sub_areas.id','=','cities.sub_area_id')
        ->leftJoin('areas','areas.id','=','cities.area_id')
        ->whereNotNull('activists_allocations.ballot_box_id')
        ->where('activists_allocations.election_campaign_id',DB::raw($election_campaign_id));

        if($tableGeo)
        $countBallotBoxWithActivist=$countBallotBoxWithActivist->whereIn($tableGeo.'.key',$arrEntityGeoKey);
        $countBallotBoxWithActivist=$countBallotBoxWithActivist
        ->groupBy('city_id');
        // Log::info( $countBallotBoxWithActivist->toSql());
        // Log::info( $countBallotBoxWithActivist->getBindings());
       $countBallotBoxWithActivist= $countBallotBoxWithActivist->get();
       return $countBallotBoxWithActivist;
    }
    public static function checkIfExistActivistAllocationByKey($entityType, $entityKey, $electionRoleId, $electionRoleShiftId = null){
        $entityId = Helper::getEntityByKey($entityType, $entityKey);
        if(!$entityId) { return null;}
        return self::checkIfExistFreeAllocation($entityType, $entityId, $electionRoleId, null, $electionRoleShiftId);
    }
    /** 
     *  @method getActivistAllocation
     *  Get activists allocation data:
     *  1. Check if the allocation exists 
     *  2. and not allocated to other activist.
    */ 
    public static function checkIfExistFreeAllocation($entityType, $entityId, $electionRoleId, $electionRoleByVoterId = null, $electionRoleShiftId = null, $toDelete = false){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $entity_column = self::getActivistAllocationColByType($entityType);

        $activistsAllocation = ActivistsAllocations::select('activists_allocations.*')
        ->where($entity_column, '=', $entityId)
        ->where('election_campaign_id', '=', $electionCampaignId)
        ->where('election_role_id', '=', DB::raw($electionRoleId));

        if ($entityType == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY) {
            $activistsAllocation->whereNull('quarter_id');
        }
        if ($entityType == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER || $entityType == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY) {
            $activistsAllocation->whereNull('cluster_id');
        }

        if ($entityType != GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX)
        $activistsAllocation->whereNull('ballot_box_id');

        if($electionRoleShiftId){ // For ballot election roles
           $activistsAllocation = self::checkIfBallotAllocationIsCatch($activistsAllocation, $electionRoleShiftId, $electionRoleByVoterId);
        } else {
            $activistsAllocation = self::checkIfClusterAllocationIsCatch($activistsAllocation, $electionRoleShiftId, $electionRoleByVoterId);
        }
      
        return $activistsAllocation;
    }


        //TODO:remove after finish arrange 
    // // Add or change new activist allocation:
    // public static function changeActivistAllocation($allocationData, $electionRoleSystemName){
    //     $allocationDetails = ['city_id', 'quarter_id', 'cluster_id', 'ballot_box_id','election_campaign_id'];
    //     $electionRoleId = ElectionRoles::select('id')->where('system_name', $electionRoleSystemName)->first()->id;

    //     $whereList = [];

    //     $insertDataList = ['election_role_id' => $electionRoleId];
    //     foreach($allocationDetails as $item){
    //         if($allocationData->$item){
    //             $whereList[] = [$item,'=', DB::raw($allocationData->$item)];
    //             $insertDataList[$item] =  $allocationData->$item;
    //         }
    //     }

    //     $activistAllocation = ActivistsAllocations::where($whereList);

    //     if(empty($allocationData->ballot_box_id)){ // For other election roles:
    //         $activistAllocation->where('activists_allocations.election_role_id' ,$electionRoleId);
    //     }
    //     $activistAllocation = $activistAllocation->first();
    //     // If is not ballot allocation
    //         // Check if allocation exists:

    //     if(!$activistAllocation){
    //         ActivistsAllocations::insert($insertDataList);
    //     } else {
    //         $activistAllocation->election_role_id = $electionRoleId;
    //         $activistAllocation->save();
    //         // $activistAllocation->update($insertDataList); // Need to check what to update?
    //     }
    //     return true;
    // }

    //TODO:remove after finish arrange 
    // public static function deleteActivistBallotAllocation($allocationData){
    //     $allocationDetails = ['city_id', 'quarter_id', 'cluster_id', 'ballot_box_id', 'election_campaign_id'];
    //     $whereList = [];
    //     foreach($allocationDetails as $item){
    //         $whereList[] = [$item,'=', $allocationData->$item];
    //     }
    //     $ROLE_SHIFTS = config('constants.activists.role_shifts'); 

    //     $roleShifts = [$ROLE_SHIFTS['FIRST'], $ROLE_SHIFTS['SECOND'], $ROLE_SHIFTS['COUNT']];
    //     $activistsAllocation = ActivistsAllocations::where($whereList)->whereNull('election_role_by_voter_id');
    //     foreach($roleShifts as $shiftName){
    //         $activistsAllocation->whereNull($shiftName . self::$shiftFieldName); 
    //     }
    //     $activistsAllocation = $activistsAllocation->first();
    //     // Check if allocation exists:
    //     if(!$activistsAllocation){ return false; }
    //     $activistsAllocation->delete();
    //     return true;
    // }
    
    // Import activists allocations file:
    public static function uploadActivistsAllocationsFile(Request $request){
        if (!$request->hasFile('activist_allocations_file')) {
            return false;
        }
            $uploadFileData =  $request->file('activist_allocations_file');
            Log::info($uploadFileData);
            $election_campaign_id = ElectionCampaigns::currentCampaign()->id;
			// $path = storage_path( $uploadFileData);
			$file = fopen($uploadFileData, "r");
			$i = 0;
            $election_role_system_names = config('constants.activists.election_role_system_names');
            $allocationsSystemNames = [ // File election roles file cols:
                4 => $election_role_system_names['clusterLeader'],
                5 => $election_role_system_names['ministerOfFifty'],
                6 => $election_role_system_names['motivator'],
                7 => $election_role_system_names['electionGeneralWorker'],
                8 => $election_role_system_names['driver'],
                9 => $election_role_system_names['muniDirector'],
                10 => $election_role_system_names['muniSecretary'],
                11 => $election_role_system_names['quarterDirector'],
                12 => $election_role_system_names['optimizerCoordinator'],
                13 => $election_role_system_names['driversCoordinator'],
                14 => $election_role_system_names['motivatorCoordinator'],
                15 => $election_role_system_names['allocationCoordinator'],
            ];
            $electionRoles = ElectionRoles::whereIn('system_name', $allocationsSystemNames)->get();
            // dd($electionRoles->toArray(), $allocationsSystemNames);
			while ($data = fgetcsv($file)) {
				$i++;
				if($i == 1){ continue; }
				$city_mi_id = $data['0']; 
				$cluster_mi_id = $data['2']; 

				$city = City::where('mi_id', $city_mi_id)->first();
				$cluster = Cluster::where('city_id', $city->id)->where('clusters.mi_id', $cluster_mi_id)->where('election_campaign_id', $election_campaign_id)->first();
                dump( $data, $city ,$cluster);
				if($city && $cluster){
                    // dump( $city->id, $cluster->id);
                    $clusterCurrentAllocations = self::getClusterActivistsAllocations($cluster, $election_campaign_id, $electionRoles);
                    // dump($clusterCurrentAllocations->toArray());

                    // Go throw all election roles
                    foreach($electionRoles as $role){
                        $roleIndex = array_search($role->system_name, $allocationsSystemNames);
                        $neededAllocations = $data[$roleIndex]; // Number requested for current election role
                        if(!is_numeric($neededAllocations)) { continue;}
                        $neededAllocations = intval($neededAllocations);
                        
                        $electionRoleCntName = "cnt_$role->system_name";
                        $currentAllocations = $clusterCurrentAllocations->$electionRoleCntName;
                        
                        // dump($role->system_name,$role->id, $neededAllocations ,$neededAllocations > $currentAllocations);

                        if($neededAllocations > $currentAllocations) { // Need to add activists allocations:
                            for($x = $currentAllocations; $x < $neededAllocations; $x++){
                                ActivistsAllocationsCreator::createAllocationForCityRole($city->id, $cluster->id, $election_campaign_id, $role->id);
                            }
                        } else { // Need to add activists allocations:
                            $deleteNumber = ($currentAllocations - $neededAllocations);
                            // dump($deleteNumber, $currentAllocations , $neededAllocations);
                            self::deleteMultipleActivistAllocation($deleteNumber, $city->id, $cluster->id, $election_campaign_id, $role->id);
                        }
 
                    }
				} else {
					// dump($i-1, $data, $city_mi_id, 'not found');
				}
            }
            return true;

    }  
    /** 
     * @method addBallotsAndAllocationsFromFile
     * 1. Add new cluster.
     * 2. Add new ballot.
     * 3. Add new activists allocation for ballot.
     * 3. Add new election role by voters.
     * 4. Add new geo activist allocation.
    */
    public static function addBallotsAndAllocationsFromFile(){
        $path = storage_path( 'app/new_covid19_ballots.csv');
        $file = fopen($path, "r");
        $i = 0;
        $clusterMiId = 999999;
        $currentCityId = null;
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        while ($data = fgetcsv($file)) {
            $i++;
            Log::info(json_encode($data) . $i);

            if($i < 3){ //Titles
                continue;
            }

            // $city_mi_id = $data[1];
            $city_mi_id = 999993;
            $ballot_mi_id = $data[2] * 10;
            $clusterName = $data[8] . ',' . $data[0];
            $streetName = $data[8];
            $houseNumber = null;

            $roleName = $data[4];
            $personal_identity = ltrim($data[5], '0');
     
            $ballot_box_role = BallotBoxRole::where('name', $roleName)->first();
            if(!$ballot_box_role){
                Log::info("לא נמצא תפקיד $roleName -> $i");
                Log::info(json_encode($data));

                continue;
            }
            $ballot_box_role_id = $ballot_box_role->id;
            $city = City::where('mi_id', $city_mi_id)->first();


            if(!$city){
                Log::info("לא נמצא $city_mi_id -> $i");
                Log::info(json_encode($data));
                continue;
            }

            if($currentCityId != $city->id) {
                $clusterMiId = 999999;
                $currentCityId = $city->id;
            }

            $ballot = BallotBox::where('ballot_boxes.mi_id', $ballot_mi_id)
            ->where('city_id', $city->id)
            ->withCluster()
            ->first();

            if(!$ballot){
                $name ='בית חולים - ' . $clusterName;
                $cluster = Cluster::where('name', $name)->where('street', $streetName)->where('city_id', $city->id)->where('election_campaign_id', $currentCampaignId)->first();
                if(!$cluster){
                    $cluster = new Cluster();
                    $cluster->name = $name;
                    $cluster->street = $streetName;
                    $cluster->house = $houseNumber;
                    $cluster->mi_id = $clusterMiId;
                    $cluster->city_id = $city->id;
                    $cluster->election_campaign_id = $currentCampaignId;
                    $cluster->key = Helper::getNewTableKey('clusters', 5);
                    $cluster->save();
                }
                $cluster_key = $cluster->key;

                $ballot_key = Helper::getNewTableKey('ballot_boxes', 10);

                $ballot = new BallotBox();
                $ballot->mi_id = $ballot_mi_id;
                $ballot->cluster_id = $cluster->id;
                $ballot->ballot_box_role_id = $ballot_box_role_id;
                $ballot->voter_count = 0;
                $ballot->key = $ballot_key;
                $ballot->save();

                $voter = Voters::select('voters.id', 'voters.key', 'phone_number')
                ->leftJoin('election_roles_by_voters', 'election_roles_by_voters.voter_id', '=', 'voters.id')
                ->where('personal_identity', $personal_identity)
                ->orderBy('election_campaign_id', 'desc')
                ->first();

                if(!$voter ){
                    Log::info("לא נמצא בוחר $personal_identity -> $i");
                    Log::info(json_encode($data));
                    continue;
                }

                // Prepare allocations data:
                $phoneNumber = $voter->phone_number;
                if(!$phoneNumber){
                    $phone = VoterPhone::where('voter_id', $voter->id)->first();
                    if($phone){
                        $phoneNumber = $phone->phone_number;
                    }
                }
                if(!$phoneNumber ){
                    $phoneNumber = $personal_identity;
                    Log::info("לא נמצא טלפון לבוחר $personal_identity -> $i");
                    Log::info(json_encode($data));
                    // continue;
                }
                $requestData =  [
                    'election_role_key' => 'mT3Ar', // Ballot box election role key
                    'ballot_key' => $ballot_key,
                    'cluster_key' => $cluster_key,
                    'shift_system_name' => 'all_day_and_count',
                    'assigned_city_id' => $city->id,
                    'sum' => 1181,
                    'email' => '',
                    'phone_number' => $phoneNumber,
                    'send_sms' => 1,
                ];
                // Send allocations request:
                $new_election_role_id = 8;
                $newAllocation = ActivistsAllocations::where([
                    'ballot_box_id' => $ballot->id,
                    'city_id' => $cluster->city_id,
                    'cluster_id' => $cluster->id,
                    'election_role_id' => $new_election_role_id,
                ])->first();

                //TODO 01/07/21
                if(!$newAllocation){
                    $newAllocation = new ActivistsAllocations();
                    $newAllocation->ballot_box_id =  $ballot->id;
                    $newAllocation->city_id =  $cluster->city_id;
                    $newAllocation->cluster_id =  $cluster->id;
                    $newAllocation->election_role_id =  $new_election_role_id;
                    $newAllocation->election_campaign_id =  $currentCampaignId;
                    $newAllocation->save();
                }

                $request = new Request($requestData);
                // $CityActivistsController = new CityActivistsController();
                // $result = ActivistsAllocationsAssignmentsService::addRoleAndShiftToActivist($jsonOutput, $request, $city->key, $voter->key);
                // if(!$result){
                //     Log::info("שיבוץ לא הצליח! $personal_identity -> $i");
                //     Log::info(json_encode($data));
                //     continue;
                // }

            }
            $clusterMiId = $clusterMiId - 1;
        }
        die;
    }
    
    //Delete Unnecessary activist allocation
    private static function deleteMultipleActivistAllocation($deleteNumber, $cityId, $clusterId, $election_campaign_id, $roleId){
        ActivistsAllocations::
        where('city_id', $cityId)
        ->where('cluster_id', $clusterId)
        ->where('election_campaign_id', $election_campaign_id)
        ->where('election_role_id', $roleId)
        ->whereNull('election_role_by_voter_id')
        ->limit($deleteNumber)
        ->delete();
        // dump("ActivistsAllocations-> $newAllocation->id ,$city->id, $cluster->id");
    } 
    // Get current allocation count by election roles:
    private static function getClusterActivistsAllocations($cluster, $election_campaign_id, $electionRoles){
        $electionRolesCols = [];
        foreach($electionRoles as $role){
            $electionRolesCols[] =  DB::raw("(SUM(CASE WHEN election_role_id = $role->id THEN 1 ELSE 0 END)) AS cnt_$role->system_name");
        }
        return ActivistsAllocations::select($electionRolesCols)
            ->where('city_id', $cluster->city_id)
            ->where('cluster_id', $cluster->id)
            ->where('election_campaign_id', $election_campaign_id)
            ->first();
    }

    // Get column for 
    public static function getActivistAllocationColByType($entityType)
    {
        $entity_column = null;
        switch ($entityType) {
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER:
                $entity_column = 'cluster_id';
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER:
                $entity_column = 'quarter_id';
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX:
                $entity_column = 'ballot_box_id';
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY:
            default:
                $entity_column = 'city_id';
                break;
        }
        return $entity_column;
    }
    /**
     * @param  $activistsAllocation
     * @param int $electionRoleShiftId new shift role before assignment
     * @param int $electionRoleByVoterId of activist
     * @method checkIfBallotAllocationIsCatch
     * Check if ballot allocation has free shift.
     * 1. Get all allocation assignments.
     * 2. Check if the new shift is not catch.
     * @return bool
    */
    public static function checkIfBallotAllocationIsCatch($activistsAllocation, $electionRoleShiftId, $electionRoleByVoterId ){
        $activistsAllocation = $activistsAllocation->with(['ActivistAllocationAssignment' => function($q) use($electionRoleByVoterId){ 
            if($electionRoleByVoterId){
                $q->where('activists_allocations_assignments.election_role_by_voter_id', '!=', $electionRoleByVoterId);
            }
        }])->first();
        if(!$activistsAllocation){ return false;}
 
       $isFree = ElectionRoleShiftService::checkValidShiftForActivist($electionRoleShiftId, $activistsAllocation->ActivistAllocationAssignment);
       return $isFree  ? $activistsAllocation : null;
    }

    private static function checkIfClusterAllocationIsCatch($activistsAllocation, $electionRoleByVoterId)
    {
        if (!$electionRoleByVoterId) {
            $activistsAllocation->withActivistsAssignments(true)->whereNull('activists_allocations_assignments.id');
        } else {
            $activistsAllocation->withActivistsAssignments(true)
                ->where(function ($q) use ($electionRoleByVoterId) {
                    $q->whereNull('activists_allocations_assignments.id')
                    ->orWhere('activists_allocations_assignments.election_role_by_voter_id', $electionRoleByVoterId);
                });
        }

        return $activistsAllocation->first();
    }


}
