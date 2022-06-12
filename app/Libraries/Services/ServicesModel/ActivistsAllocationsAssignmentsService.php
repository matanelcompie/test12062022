<?php

namespace App\Libraries\Services\ServicesModel;

use App\DTO\SearchActivistDto;
use App\Http\Controllers\ActionController;
use App\Http\Requests\SearchActivistRequest;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRoleShifts;
use App\Models\ElectionRolesShiftsBudgets;
use App\Models\User;
use App\Models\Voters;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\CityRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @class ActivistsAllocationsAssignmentsService
 * Model: ActivistAllocationAssignment
 *
 */
class ActivistsAllocationsAssignmentsService
{

    const TAG = "ActivistsAllocationsAssignmentsService";
    /**
     * @method updateAllocationAssignment
     * Update Activist Assignment.
     * 1. Check if Assignment exists.
     * 2. Add/update activists assignments
     */
    public static function updateAllocationAssignment($activistAllocation, $electionRoleByVoterId, $electionRoleShiftId = null)
    {
        if (!$activistAllocation) return;

        $activistAssignment = ActivistAllocationAssignment::where('activist_allocation_id', $activistAllocation->id)->where('election_role_by_voter_id', $electionRoleByVoterId)->first();

        if (!$activistAssignment) {
            $activistAssignment = new ActivistAllocationAssignment;
            $activistAssignment->activist_allocation_id = $activistAllocation->id;
            $activistAssignment->election_role_by_voter_id = $electionRoleByVoterId;
        }
        $activistAssignment->election_role_shift_id = $electionRoleShiftId;
        $activistAssignment->save();

        return $activistAssignment;
    }

    //!  To delete this method in new Assignments */
    public static function deleteElectionActivistClusters($record_key, $cluster_key)
    {
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
        $jsonOutput = app()->make("JsonOutput");
        if ($cluster_key == null || strlen(trim($cluster_key)) < 3) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_CLUSTER_KEYS'));
            return;
        }

        $voter_key = ElectionRolesByVoters::where('key', $record_key)->first();
        if ($voter_key) {
            $voter_key = $voter_key->voter_id;
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $activistRoles = ElectionRolesByVoters::select(['voter_id'])->withElectionRole()->where('voter_id', $voter_key)->where('election_campaign_id', $last_campaign_id)->where('system_name', 'cluster_leader')->first();
        if ($activistRoles) {

            if (trim($cluster_key) != '') {
                $cluster = Cluster::where('key', $cluster_key)->where('leader_id', $voter_key)->first();
                if ($cluster) {
                    $cluster->leader_id = null;
                    $cluster->save();
                }
            }

            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ACTIVIST_IN_CLUSTER_LEADER'));
        }
    }
    //TODO:remove after finish arrange
    // public static function addElectionActivistClusters(Request $request, $record_key)
    // {
    //     $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
    //     $jsonOutput = app()->make("JsonOutput");
    //     if ($request->input('cluster_keys') == null || strlen(trim($request->input('cluster_keys'))) < 3) {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_CLUSTER_KEYS'));
    //         return;
    //     }
    //     $voter_key = ElectionRolesByVoters::where('key', $record_key)->first();
    //     if ($voter_key) {
    //         $voter_key = $voter_key->voter_id;
    //     } else {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    //         return;
    //     }

    //     $activistRoles = ElectionRolesByVoters::select(['voter_id'])->withElectionRole()->where('voter_id', $voter_key)->where('election_campaign_id', $last_campaign_id)->where('system_name', 'cluster_leader')->first();
    //     if ($activistRoles) {
    //         $arrCluters = explode(',', $request->input('cluster_keys'));
    //         for ($i = 0; $i < sizeof($arrCluters); $i++) {
    //             if (trim($arrCluters[$i]) != '') {
    //                 $cluster = Cluster::where('key', $arrCluters[$i])->first();
    //                 if ($cluster) {
    //                     $cluster->leader_id = $voter_key;
    //                     $cluster->save();
    //                 }
    //             }
    //         }
    //         $jsonOutput->setData('ok');
    //     } else {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ACTIVIST_IN_CLUSTER_LEADER'));
    //     }
    // }
    //!! what is this function???
    public static function getElectionActivistClusters($record_key)
    {
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name', true);

        $jsonOutput = app()->make("JsonOutput");
        $voter_key = ElectionRolesByVoters::where('key', $record_key)->first();
        if ($voter_key) {
            $voter_key = $voter_key->voter_id;
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $activistRoles = ElectionRolesByVoters::select(['voter_id'])->withElectionRole()->where('voter_id', $voter_key)->where('election_campaign_id', $last_campaign_id)->where('system_name', 'cluster_leader')->get();
        if ($activistRoles) {
            $clusters = Cluster::select([DB::raw($fullClusterNameQuery), 'street', 'house', 'city_id', 'cities.name as city_name'])->withCity()->where('leader_id', $voter_key)->get();
            $jsonOutput->setData($clusters);
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ACTIVIST_IN_CLUSTER_LEADER'));
        }
    }
    //!! what is this function???
    public static function getElectionActivist($record_key)
    {
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
        $jsonOutput = app()->make("JsonOutput");
        $tmp_voter_key = ElectionRolesByVoters::where('key', $record_key)->first();
        if ($tmp_voter_key) {
            $voter_key = $tmp_voter_key->voter_id;
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $voter = Voters::select(['id', 'key', 'first_name', 'last_name', 'personal_identity', 'city'])->where('id', $voter_key)->first();
        if ($voter) {

            $activistRoles = ElectionRolesByVoters::select(['election_roles.system_name', 'election_roles.name as role_name', 'phone_number', 'sum'])->withElectionRole()->where('voter_id', $voter->id)->where('election_campaign_id', $last_campaign_id)->get();
            if (sizeof($activistRoles) > 0) {
                $voter->roles = $activistRoles;
                $voter->is_minister_of_fifty = false;
                $voter->households = [];
                $isMinisterOfFiftyRecord = ElectionRolesByVoters::withElectionRole()->where('system_name', 'minister_of_fifty')->where('election_roles.deleted', 0)->where('election_roles_by_voters.key', $record_key)->first();
                if ($isMinisterOfFiftyRecord) {
                    $voter->is_minister_of_fifty = true;
                    /*
                        !! HousholdCaptainOfFifty not exist!!!!! 
                        $voterHouseholds = HousholdCaptainOfFifty::where('deleted', 0)->where('election_campaign_id', $last_campaign_id)->where('captain_id', $voter->id)->withCount('householdMembers')->get();
                        $voter->households = $voterHouseholds;
                    */
                }
                $voter->sum = $tmp_voter_key->sum;
                $voter->phone_number = $tmp_voter_key->phone_number;
                $voter->comment = $tmp_voter_key->comment;
                $voter->created_at = $tmp_voter_key->created_at;
                $voter->creating_user = '';
                $tmp_create_user = User::select('voter_id')->where('id', $tmp_voter_key->user_create_id)->first();
                if ($tmp_create_user) {
                    $tmp_create_voter = Voters::select(['first_name', 'last_name'])->where('id', $tmp_create_user->voter_id)->first();
                    if ($tmp_create_voter) {
                        $voter->creating_user = $tmp_create_voter->first_name . ' ' . $tmp_create_voter->last_name;
                    }
                }
                $jsonOutput->setData($voter);
            } else {
                $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ACTIVIST'));
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
        }
    }

    /**
     * @method get search activist object include voter ,city and election role 
     * return details voter include phone number and check duplicate role
     * @param SearchActivistDto $request
     * @return voters include phone numbers
     * TODO::last-searchForElectionVoterActivist
     */
    public static function getVoterDetailsAndCheckDuplicateRoles(SearchActivistDto $searchActivist)
    {

        if (!$searchActivist->electionCampaign)
            throw new Exception(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
        if (!$searchActivist->voter)
            throw new Exception(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
        if (!$searchActivist->electionRole)
            throw new Exception(config('errors.elections.ELECTION_ROLE_KEY_DOES_NOT_EXIST'));

        $VoterDetailsDuplicate=ElectionRolesVotersCreator::checkDuplicateRoleBeforeInsertRoleVoter(
            $searchActivist->voter->id,
            $searchActivist->electionCampaign->id,
            $searchActivist->electionRole->system_name
        );

        return $VoterDetailsDuplicate;
    }

    /**
     * Undocumented function
     * Request from api
     * @param Request $request
     * @param [string] $election_role_by_voter_key
     * @param [string] $ballot_key
     * @param [string] $shift_key
     * @return void
     */
    public function addGeoBallotToActivistRole(Request $request, $election_role_by_voter_key, $ballot_key, $shift_key)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (is_null($election_role_by_voter_key)) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        if (is_null($shift_key)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_SHIFT'));
            return;
        }

        if (is_null($ballot_key)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_BALLOT_BOX'));
            return;
        }

        $result = self::bindGeoBallotToActivist($request, $jsonOutput, $election_role_by_voter_key, $ballot_key, $shift_key);
        if ($result) {
            $jsonOutput->setData($result);
        }
    }
    /**
     * @method bindGeoClusterToActivist
     *  Bind geo cluster to activist
     *  1. Need to find the cluster
     *  2. Need to check if allocation is free
     *  3. Need to bind allocation to activist in assignments table
     *  @return result (activist and cluster)
     */
     
    public static function bindGeoClusterToActivist($jsonOutput, $election_role_by_voter_key, $cluster_key)
    {
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name', true);

        if (is_null($election_role_by_voter_key)) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        if (is_null($cluster_key)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_CLUSTER_KEYS'));
            return;
        }

        $clusterObj2 = Cluster::select(['id'])->where('key', $cluster_key)->first();
        if (is_null($clusterObj2)) {
            $jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
            return;
        }

        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'voter_id', 'user_lock_id', 'assigned_city_id', 'election_role_id'])
            ->where('key', $election_role_by_voter_key)
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif (!is_null($electionRoleByVoter->user_lock_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }

        $currentVoter = Voters::select(['id'])->where('id', $electionRoleByVoter->voter_id)->first();
        if (is_null($currentVoter)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $clustersFields = [
            'clusters.id as cluster_id',
            'clusters.key as cluster_key',
            DB::raw($fullClusterNameQuery),
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name',
        ];
        $clusterObj = Cluster::select($clustersFields)
            ->withCity()
            ->withCount('ballotBoxes')
            ->where('clusters.key', $cluster_key)
            ->where('clusters.city_id', $electionRoleByVoter->assigned_city_id) //Allow only clusters in role assinged city
            ->first();

        if (is_null($clusterObj)) {
            $jsonOutput->setErrorCode(config('errors.elections.CLUSTER_ROLE_DOES_NOT_EXIST_IN_CITY'));
            return;
        }
        $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');

        $activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation($entityType, $clusterObj->cluster_id, $electionRoleByVoter->election_role_id);
        // dd($activistAllocation->toArray());
        if (!$activistAllocation) {
            $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS'));
            return;
            throw new Exception(config('errors.elections.ALLOCATION_NOT_EXISTS'));
        }
        $activistAssignment = self::updateAllocationAssignment($activistAllocation, $electionRoleByVoter->id);

        /*
            !! Need to add history?
            $actionHistoryFieldsNames = [
                'election_role_by_voter_id' => config('history.ElectionRolesGeographical.election_role_by_voter_id'),
                'entity_type' => config('history.ElectionRolesGeographical.entity_type.cluster'),
                'entity_id' => config('history.ElectionRolesGeographical.entity_type.cluster'),
            ];

            $fieldsArray = [];
            foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
                $fieldsArray[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                    'new_numeric_value' => $electionRoleByVoterGeographicAreas->{$fieldName},
                ];
            }

            $historyArgsArr = [
                'topicName' => 'elections.activists.motivator.edit',
                'models' => [
                    [
                        'referenced_model' => 'ElectionRolesGeographical',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $electionRoleByVoterGeographicAreas->id,
                        'valuesList' => $fieldsArray,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        */
        $result = [
            'id' => $activistAssignment->id,
            'election_role_by_voter_id' => $activistAssignment->election_role_by_voter_id,
            'entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
            'entity_id' => $clusterObj->cluster_id,

            'cluster_id' => $clusterObj->cluster_id,
            'cluster_name' => $clusterObj->cluster_name,
            'cluster_key' => $clusterObj->cluster_key,
            'street' => $clusterObj->street,
            'city_id' => $clusterObj->city_id,
            'city_name' => $clusterObj->city_name,

            'ballot_boxes_count' => $clusterObj->ballot_boxes_count,
        ];

        return $result;
    }

    /**
     * @method bindGeoBallotToActivist
     * Add geo ballot to activist
     */
    public static function bindGeoBallotToActivist(Request $request, $jsonOutput, $election_role_by_voter_key, $ballotKey, $shift_key)
    {

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $last_campaign_id = $currentCampaign->id;


        $electionRoleByVoter = ElectionRolesByVoters::select([
            'election_roles_by_voters.id', 'election_role_id', 'assigned_city_id',
            'system_name', 'phone_number', 'voter_id', 'user_lock_id'
        ])
            ->withElectionRole(false)
            ->where('election_roles_by_voters.key', $election_role_by_voter_key)
            ->first();
        if (is_null($electionRoleByVoter)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif (!is_null($electionRoleByVoter->user_lock_id)) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }
        $currentVoter = Voters::select(['id', 'first_name'])->where('id', $electionRoleByVoter->voter_id)->first();
        if (is_null($currentVoter)) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $electionRoleShiftObj = ElectionRoleShifts::select(['id', 'key', 'name', 'system_name'])
            ->where('key', $shift_key)
            ->first();
        if (is_null($electionRoleShiftObj)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_SHIFT'));
            return;
        }
        $role_shifts = config('constants.activists.role_shifts');
        //* Check if voter already allocate to counter election role.

        if (in_array($electionRoleShiftObj->system_name, [$role_shifts['COUNT'], $role_shifts['SECOND_AND_COUNT'], $role_shifts['ALL_DAY_AND_COUNT']]) && $electionRoleByVoter->system_name != config('constants.activists.election_role_system_names.counter')) {
            $isExistCounterElectionRoleByVoter = ElectionRolesByVoters::select(['election_roles_by_voters.id'])
                ->withElectionRole(false)
                ->where('system_name', config('constants.activists.election_role_system_names.counter'))
                ->where('voter_id', $electionRoleByVoter->voter_id)
                ->where('election_campaign_id', $last_campaign_id)
                ->first();
            if ($isExistCounterElectionRoleByVoter) {
                $jsonOutput->setErrorCode(config('errors.elections.ELECTION_ROLE_DUPLICATES_FOR_ACTIVIST'));
                return;
            }
        }

        $electionRole = ElectionRoles::select(['id', 'name', 'system_name'])->where('id', $electionRoleByVoter->election_role_id)->first();
        if (!$electionRole) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        }

        $editPermission = 'elections.activists.' . $electionRole->system_name . '.edit';

        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        // Getting the ballot details and checking
        // if ballot exists in assigned city
        $ballotBox = BallotBox::select("ballot_boxes.id")
            ->withCluster()
            ->withCity()
            ->where('ballot_boxes.key', $ballotKey)
            ->where('cities.id', $electionRoleByVoter->assigned_city_id) //Allow only ballots in role assinged city
            ->first();
        if (is_null($ballotBox)) {
            $jsonOutput->setErrorCode(config('errors.elections.BALLOT_BOX_ROLE_DOES_NOT_EXIST_IN_CITY'));
            return;
        }

        $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');

        $defaultRoleBudget = ElectionRolesShiftsBudgets::select('budget')
            ->where('election_role_shift_id', $electionRoleShiftObj->id)
            ->where('election_role_id', $electionRoleByVoter->election_role_id)
            ->first();
        $defaultRoleBudgetSum = !is_null($defaultRoleBudget) ? $defaultRoleBudget->budget : 0;

        DB::beginTransaction();

        try {

            $electionRoleByVoter->sum = $defaultRoleBudgetSum;
            $electionRoleByVoter->save();
            //add new geographic area
            $activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation($entityType, $ballotBox->id, $electionRoleByVoter->election_role_id, $electionRoleByVoter->id, $electionRoleShiftObj->id);
            if (!$activistAllocation) {
                $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS'));
                return;
                // $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS')); return;
            }
            self::updateAllocationAssignment($activistAllocation, $electionRoleByVoter->id, $electionRoleShiftObj->id);

            DB::commit();
            // all good
        } catch (\Exception $e) {
            Log::info($e);
            DB::rollback();
            throw $e;
            return;
            // something went wrong
        }
        //!! need to add history:
        /*
        $historyArgsArr = [
            'topicName' => $editPermission,
            'models' => $otherBallotShiftsHistoryModels,
        ];

        $actionHistoryFieldsNames = [
            'election_role_by_voter_id' => config('history.ElectionRolesGeographical.election_role_by_voter_id'),
            'entity_type' => config('history.ElectionRolesGeographical.entity_type.ballot'),
            'entity_id' => config('history.ElectionRolesGeographical.entity_id.ballot'),
            'election_role_shift_id' => config('history.ElectionRolesGeographical.election_role_shift_id'),
        ];

        $fieldsArray = [];
        foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_numeric_value' => $electionRoleByVoterGeographicAreas->{$fieldName},
            ];
        }

        $historyArgsArr['models'][] = [
            'referenced_model' => 'ElectionRolesGeographical',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $electionRoleByVoterGeographicAreas->id,
            'valuesList' => $fieldsArray,
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        // $result = self::getGeoAreaById($electionRoleByVoterGeographicAreas->id, $last_campaign_id);
        */
        // return $result;
        return true;
    }

    /**
     * @method getShiftsToDeleteByShiftName
     * Get other shifts to delete in ballot - by new shifts system name.
     * @return (array) List of shifts to delete.
     */
    public static function getShiftsToDeleteByShiftName($shiftSystemName)
    {
        $deleteShiftsArray = [];
        switch ($shiftSystemName) {
            case config('constants.activists.role_shifts.FIRST'):
                $shiftsToDelete = ['FIRST', 'ALL_DAY', 'ALL_DAY_AND_COUNT'];
                break;
            case config('constants.activists.role_shifts.SECOND'):
                $shiftsToDelete = ['SECOND', 'ALL_DAY', 'SECOND_AND_COUNT', 'ALL_DAY_AND_COUNT'];
                break;
            case config('constants.activists.role_shifts.COUNT'):
                $shiftsToDelete = ['COUNT', 'SECOND_AND_COUNT', 'ALL_DAY_AND_COUNT'];
                break;
            case config('constants.activists.role_shifts.SECOND_AND_COUNT'):
                $shiftsToDelete = ['SECOND', 'COUNT', 'ALL_DAY', 'SECOND_AND_COUNT', 'ALL_DAY_AND_COUNT'];
                break;
            case config('constants.activists.role_shifts.ALL_DAY'):
                $shiftsToDelete = ['FIRST', 'SECOND', 'ALL_DAY', 'SECOND_AND_COUNT', 'ALL_DAY_AND_COUNT'];
                break;
            case config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'):
                $shiftsToDelete = ['FIRST', 'SECOND', 'COUNT', 'ALL_DAY', 'SECOND_AND_COUNT', 'ALL_DAY_AND_COUNT'];
                break;
        }
        foreach ($shiftsToDelete as $item) {
            $deleteShiftsArray[] = config("constants.activists.role_shifts.$item");
        }
        return $deleteShiftsArray;
    }
    public static function editNotCheckLocation($jsonOutput, Request $request, $election_role_geo_key)
    {
        try {
            $not_check_location = $request->input('not_check_location');
            $electionRolesGeo = ElectionRolesGeographical::where('key', $election_role_geo_key)->first();
            $electionRolesGeo->not_check_location = $not_check_location;
            $electionRolesGeo->save();
            $jsonOutput->setData('ok');
        } catch (\Throwable $th) {
            $jsonOutput->setErrorCode();
        }
    }

    /***** Help functions  *****/
    /**
     * Return election role geographic area with details
     *
     * @param int getAraeId
     * @param int $electionCampaignId
     * @return object
     */
    /*
    private static function getGeoAreaById($geoAreaId, $electionCampaignId) {
        $geoFields = [
            'election_role_by_voter_geographic_areas.id',
            'election_role_by_voter_geographic_areas.key',
            'election_role_by_voter_geographic_areas.election_role_by_voter_id',
            'election_role_by_voter_geographic_areas.entity_type',
            'election_role_by_voter_geographic_areas.entity_id',
            'election_role_by_voter_geographic_areas.sum',

            'election_role_by_voter_geographic_areas.election_role_shift_id',
            'election_role_shifts.name as election_role_shift_name',
            'election_role_shifts.key as election_role_shift_key',
            'election_role_shifts.system_name as election_role_shift_system_name',

            // DB::raw($this->fullClusterNameQuery),
            'clusters.name',
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name',

            'ballot_boxes.id as ballot_box_id',
            'ballot_boxes.key as ballot_box_key',
            'ballot_boxes.mi_id',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),

            'ballot_boxes.ballot_box_role_id as ballot_box_role_id',
            'ballot_box_roles.name as ballot_box_role_name'
        ];

        $electionRolesGeographical = ElectionRolesGeographical::select($geoFields)
            ->withBallotBoxes()
            ->withOtherBallotGeo($electionCampaignId)
            ->with(['otherElectionRoles' => function($qr2) {
                $fields = [
                    'election_role_by_voter_geographic_areas.id',
                    'election_role_by_voter_geographic_areas.key',
                    'election_role_by_voter_geographic_areas.entity_id',
                    'election_role_by_voter_geographic_areas.election_role_by_voter_id',

                    'election_roles_other.id as other_activist_role_id',
                    'election_roles_other.key as other_activist_role_key',
                    'election_roles_other.system_name as other_activist_role_system_name',

                    'election_role_shifts_other.id as other_activist_shift_id',
                    'election_role_shifts_other.key as other_activist_shift_key',
                    'election_role_shifts_other.name as other_activist_shift_name',
                    'election_role_shifts_other.system_name as other_activist_shift_system_name',

                    'erbv.phone_number as other_activist_phone_number',
                    'erbv.verified_status as other_activist_verified_status',
                    'erbv.user_lock_id as other_user_lock_id',

                    'voters_other.first_name as other_activist_first_name',
                    'voters_other.last_name as other_activist_last_name',
                    'voters_other.personal_identity as other_activist_personal_identity'                            
                ];
                $qr2->select($fields)
                    ->where('election_role_by_voter_geographic_areas.entity_type',
                    config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
                    ->join('election_roles_by_voters as erbv', 'erbv.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
                    ->leftjoin('election_roles as election_roles_other', 'election_roles_other.id', '=', 'erbv.election_role_id')
                    ->leftjoin('election_role_shifts as election_role_shifts_other', 'election_role_shifts_other.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id')
                    ->leftJoin('voters as voters_other', 'voters_other.id', '=', 'erbv.voter_id')
                    ->orderBy('other_activist_shift_id','ASC');
            }])
            ->where('election_role_by_voter_geographic_areas.id', $geoAreaId)
            ->first();
            // dd($electionRolesGeographical);
        //remove self from other geo shifts
        $removeOtherGeoKey = null;
        $geoRole = $electionRolesGeographical;
        $currentId = $geoRole->id;
        foreach ($geoRole->otherElectionRoles as $key => $otherRole) {
            if ($otherRole->id == $currentId) {
                $removeOtherGeoKey = $key;
                break;
            }
        }
        if ($removeOtherGeoKey !== null) {
            $geoRole->other_election_roles = $geoRole->otherElectionRoles->forget($removeOtherGeoKey)->values();
            unset($geoRole->otherElectionRoles);
        }

        return $electionRolesGeographical;
    }
    */


    
    /**
     * TODO:remove after finish arrange update activist
     * @method editBallotActivistShiftDetails
     * Edit activist election role details 
     * @param Request $request
     * @param [string] $role_key - election role key
     * @return void
     */
    public static function editBallotActivistShiftDetails($jsonOutput, Request $request, $allocationsAssignmentId)
    {

        // $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $appointmentLetter = $request->input('appointment_letter', null);

        if (!is_null($appointmentLetter) && $appointmentLetter != 0 && $appointmentLetter != 1) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_INSTRUCTED'));
            return;
        }

        $allocationsAssignment = ActivistAllocationAssignment::where('id', $allocationsAssignmentId)->first();
        $updatedValuesArray = [];
        if ($allocationsAssignment) {
            if (!is_null($appointmentLetter) && $allocationsAssignment->appointment_letter != $appointmentLetter) {
                $allocationsAssignment->appointment_letter = $appointmentLetter;
                $updatedValuesArray['appointment_letter'] = $allocationsAssignment->appointment_letter;
            }
            if (count($updatedValuesArray) > 0) {
                $allocationsAssignment->save();
                $historyArgsArr = [
                    'topicName' => 'elections.activists.cluster_summary.edit',
                    'models' => []
                ];
                $actionHistoryFieldsNames = [
                    'appointment_letter' => config('history.ActivistAllocationAssignment.appointment_letter'),
                ];

                $fieldsArray = [];
                foreach ($updatedValuesArray as $fieldName => $fieldOldValue) {
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => $actionHistoryFieldsNames[$fieldName],
                        'new_numeric_value' => $allocationsAssignment->{$fieldName},
                    ];
                }

                $historyArgsArr['models'][] = [
                    'referenced_model' => 'ActivistAllocationAssignment',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $allocationsAssignment->id,
                    'valuesList' => $fieldsArray,
                ];
                ActionController::AddHistoryItem($historyArgsArr);
            }

            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
        }
    }
 

    //--------------------------------------helper function for ballot member activist-----------------------------------------------------------
    //function get voter id activist ballot member and ballot box by election
    //return object activist assignment details in ballot box
    public static function getObjectByActivistBallotMember($activist_voter_id, $ballot_box_id, $election_campaign_id)
    {

        $arrFields = [
            DB::raw('distinct election_roles_by_voters.id as election_role_voter'),
            DB::raw('activists_allocations_assignments.*'),
            DB::raw('election_roles_by_voters.election_role_id'),
            DB::raw('activists_allocations.ballot_box_id')
        ];

        $activistAssignmentDetails = ActivistAllocationAssignment::select($arrFields)
            ->withActivistAllocation()
            ->withElectionRoleByVoter()
            ->where('activists_allocations.ballot_box_id', $ballot_box_id)
            ->where('election_roles_by_voters.voter_id', $activist_voter_id)
            ->where('election_roles_by_voters.election_campaign_id', $election_campaign_id);
        //->first();


        $activistAssignmentDetails = $activistAssignmentDetails->first();

        if (!$activistAssignmentDetails)
            throw new Exception(config('errors.elections.ERROR_ELECTION_ROLE_GEOGRAPHIC'));

        return $activistAssignmentDetails;
    }

    //function get election rol geo object and election role of ballot box and election campaign
    //function check if the activist of before shift until in ballot box
    public static function checkIfBeforeBallotMemberInBallot($activists_allocations_assignments, $electionRoleId, $election_campaign_id)
    {
        $arrBeforeRoleGoShift = null;
        $ballot_box_id = $activists_allocations_assignments->ballot_box_id;

        //system name of election role shift
        $electionRoleShiftSystemName = ElectionRoleShifts::where('id', $activists_allocations_assignments->election_role_shift_id)->first()->system_name;

        //get all shift role id before
        $arrRoleShiftBefore = ElectionRoleShiftService::arrShiftRoleBeforeByShiftRole($electionRoleShiftSystemName, true);

        if (count($arrRoleShiftBefore) > 0) {
            $arrBeforeRoleGoShift = ActivistAllocationAssignment::select(DB::raw('distinct election_roles_by_voters.id as election_role_voter'), DB::raw('activists_allocations_assignments.*'))
                ->withElectionRoleByVoter()
                ->withActivistAllocation()
                ->where('activists_allocations.ballot_box_id', $ballot_box_id)
                ->where('election_roles_by_voters.election_campaign_id', $election_campaign_id)
                ->where('election_roles_by_voters.election_role_id', $electionRoleId)
                ->where('activists_allocations_assignments.id', '!=', $activists_allocations_assignments->id)
                ->whereIn('activists_allocations_assignments.election_role_shift_id', $arrRoleShiftBefore); //->get();


            $arrBeforeRoleGoShift = $arrBeforeRoleGoShift->get();
        }

        //if not has before ballot member in activist ballot box
        if (!$arrBeforeRoleGoShift || $arrBeforeRoleGoShift->count() == 0)
            return false;

        else { //filter before ballot member in ballot that not exist
            $arrBeforeBallotMemberInBallot = $arrBeforeRoleGoShift->filter(function ($BeforeBallotMember) {
                return is_null($BeforeBallotMember->report_finished_date) || strcmp($BeforeBallotMember->report_finished_date, '') == 0;
            })->values();


            //if exist next ballot member in ballot box
            if ($arrBeforeBallotMemberInBallot->count() > 0)
                return true;
            else
                return false;
        }
    }

    //set arrival date fo ballot member in ballot box
    //function return object ElectionRoleVoterGeoAreasService with all details and election role id
    public static function setArrivalDateBallotMember($activist_voter_id, $ballot_box_id, $election_campaign_id)
    {
        $needSave = false;
        $activistAssignment = self::getObjectByActivistBallotMember($activist_voter_id, $ballot_box_id, $election_campaign_id);

        //its first time insert to ballot member
        if (is_null($activistAssignment->arrival_date) ||  strcmp($activistAssignment->arrival_date, '') == 0) {
            $activistAssignment->arrival_date = date('Y-m-d H:i:s');
            $needSave = true;
        } else if (!is_null($activistAssignment->report_finished_date) &&  strcmp($activistAssignment->report_finished_date, '') != 0) {
            $activistAssignment->report_finished_date = null;
            $needSave = true;
        }

        if ($needSave)
            $activistAssignment->save();

        return $activistAssignment;
    }

    //function get object election_role_by_voter_geographic_areas
    //function get $electionRoleId from election role by voter of activist
    //function check if the not has next ballot member or the next ballot member in ballot box
    public static function checkIfTheNextBallotMemberInBallot($activists_allocations_assignments, $electionRoleId, $election_campaign_id)
    {
        $arrNextRoleGoShift = null;
        $ballot_box_id = $activists_allocations_assignments->ballot_box_id;


        //system name of election role shift
        $electionRoleShiftSystemName = ElectionRoleShifts::where('id', $activists_allocations_assignments->election_role_shift_id)->first()->system_name;

        $arrRoleShiftNext = ElectionRoleShiftService::getArrShiftRoleByNextShiftRoleBallotBox($electionRoleShiftSystemName, true);

        if (count($arrRoleShiftNext) > 0) {

            $arrNextRoleGoShift = ActivistAllocationAssignment::select(DB::raw('distinct election_roles_by_voters.id as election_role_voter'), DB::raw('activists_allocations_assignments.*'))
                ->withElectionRoleByVoter()
                ->withActivistAllocation()
                ->where('activists_allocations.ballot_box_id', $ballot_box_id)
                ->where('election_roles_by_voters.election_campaign_id', $election_campaign_id)
                ->where('election_roles_by_voters.election_role_id', $electionRoleId)
                ->where('activists_allocations_assignments.id', '!=', $activists_allocations_assignments->id)
                ->whereIn('activists_allocations_assignments.election_role_shift_id', $arrRoleShiftNext); //->get();


            $arrNextRoleGoShift = $arrNextRoleGoShift->get();
        }

        //if not has next ballot member in activist ballot box
        if (!$arrNextRoleGoShift || $arrNextRoleGoShift->count() == 0)
            return true;

        else {
            $arrNextBallotMemberInBallot = $arrNextRoleGoShift->filter(function ($nextBallotMember) {
                return !is_null($nextBallotMember->arrival_date) && strcmp($nextBallotMember->arrival_date, '') != 0;
            })->values();


            //if exist next ballot member in ballot box
            if ($arrNextBallotMemberInBallot->count() > 0)
                return true;
            else
                return false;
        }
    }



    //set finished date of ballot box member 
    //function check before  if its not se
    public static function setFinishedShiftDate($activist_voter_id, $ballot_box_id, $election_campaign_id)
    {
        $needSave = false;
        $activistAssignment = self::getObjectByActivistBallotMember($activist_voter_id, $ballot_box_id, $election_campaign_id);

        if (is_null($activistAssignment->report_finished_date) || strcmp($activistAssignment->report_finished_date, '') == 0) {
            $activistAssignment->report_finished_date = date('Y-m-d H:i:s');
            $needSave = true;
        }

        if ($needSave)
            $activistAssignment->save();
    }

    /**
     * Get shift role for voter activist and check if uts valid shift role for activist
     * function load array shift role that valid with the shift role params 
     * function check if the activist has assignment  that conflict with shift role
     * return bool if the activist hsa duplicate shift and the shift params is not valid
     * @param int $voterId
     * @param int $shiftRoleId
     * @param int $electionCampaignId
     * @return bool
     */
    public static function checkIfVoterHasDuplicateShift($voterId, $shiftRoleId, $electionCampaignId, $allocationsAssignmentId = null)
    {
        $allShiftRoles = config('constants.activists.role_shifts');
        $shiftRolesValid = ElectionRoleShiftService::getValidAnotherShiftRoleByShiftId($allShiftRoles, $shiftRoleId);
        $duplicateShiftRole = ActivistsAllocationsAssignmentsRepository::getAssignmentOfActivistInDifferentShift($voterId, $shiftRolesValid, $electionCampaignId, $allocationsAssignmentId);

        return  $duplicateShiftRole && $duplicateShiftRole->count() > 0;
    }
   
}
