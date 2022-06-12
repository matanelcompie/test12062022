<?php

namespace App\Repositories;

use App\Enums\ElectionRoleSystemName;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ActivistAllocation\GeographicAllocationDto;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAssignmentsCreator;
use App\Libraries\Services\FileService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Quarter;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ActivistsAllocationsRepository
{
    /**
     * @throws Exception
     * @return ActivistsAllocations
     */
    public static function getById($id)
    {
        $allocation = ActivistsAllocations::select()->where('id', $id)->first();
        if (!$allocation)
            throw new Exception(config('errors.elections.ERROR_ALLOCATION_ID'));
        return $allocation;
    }

    public static function getByBallotBoxId($ballotBoxId)
    {
        return ActivistsAllocations::select()->where('ballot_box_id', $ballotBoxId)->first();
    }

    private static function getActivistAllocationQueryByGeographicalTypeAndValue($geographicalType, $valueGeographical, $electionRoleId, $electionCampaignId)
    {
        $nameField = ActivistsAllocationsService::getActivistAllocationColByType($geographicalType);
        return ActivistsAllocations::select('activists_allocations.*')
            ->where($nameField, $valueGeographical)
            ->where('election_campaign_id', $electionCampaignId)
            ->where('election_role_id', DB::raw($electionRoleId));
    }

    public static function getAllocationsByGeographicAllocation(GeographicAllocationDto $GeographicAllocationDto, $electionRoleId, $electionCampaignId)
    {
        $queryActivistAllocation = self::getActivistAllocationQueryByGeographicalTypeAndValue(
            $GeographicAllocationDto->geographicType,
            $GeographicAllocationDto->geographicValue,
            $electionRoleId,
            $electionCampaignId
        );
        return $queryActivistAllocation->get();
    }

    /**
     * @throws Exception if allocation have assignment or user is not admin
     * @param int $activistAllocationId
     * @return void
     */
    public static function deleteActivistAllocation($activistAllocationId)
    {
        $assignment = ActivistsAllocationsAssignmentsRepository::getByActivistAllocationId($activistAllocationId);
        if ($assignment->count() > 0)
            throw new Exception(config('errors.elections.ERROR_DELETE_ALLOCATION_EXIST_ASSIGNMENT'));

        $activistAllocation = self::getById($activistAllocationId);
        ActivistsAllocationsCreator::checkPermissionAddDeleteInsertOrUpdateAllocation($activistAllocation->election_role_id);
        $activistAllocation->delete();
    }

    public static function getAllocationAndDetailsAssignmentOfQuarterActivist(Quarter $quarter)
    {

        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $fields = [
            'activists_allocations.id as activists_allocation_id',
            'activists_allocations_assignments.id as activists_allocations_assignment_id',
            'first_name', 'last_name', 'personal_identity',
            'election_roles_by_voters.phone_number',
            'election_roles.id as role_id', 'election_roles.key as role_key',
            'election_roles.name as role_name', 'election_roles.system_name',
        ];

        return ActivistsAllocations::select($fields)
            ->withActivistsAssignmentsFullData(true)
            ->where('activists_allocations.quarter_id', $quarter->id)
            ->whereNull('cluster_id')
            ->whereNull('ballot_box_id')
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->get();
    }

    public static function getAllocationAndDetailsAssignmentOfCityActivist(City $city)
    {

        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $fields = [
            'activists_allocations.id as activists_allocation_id',
            'activists_allocations_assignments.id as activists_allocations_assignment_id',
            'first_name', 'last_name', 'personal_identity',
            'election_roles_by_voters.phone_number',
            'election_roles.id as role_id', 'election_roles.key as role_key',
            'election_roles.name as role_name', 'election_roles.system_name',
        ];

        return ActivistsAllocations::select($fields)
            ->withActivistsAssignmentsFullData(true)
            ->where('activists_allocations.city_id', $city->id)
            ->whereNull('quarter_id')
            ->whereNull('cluster_id')
            ->whereNull('ballot_box_id')
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->get();
    }

    public static function getAllocationsQuarterByElectionRoleId(Quarter $quarter, ElectionRoles $electionRole, ElectionCampaigns $electionCampaign)
    {
        return ActivistsAllocations::select()
            ->where('quarter_id', $quarter->id)
            ->where('election_role_id', $electionRole->id)
            ->where('election_campaign_id', $electionCampaign->id)
            ->get();
    }

    /**
     * function get city and role, and return only free allocation
     *
     * @param City $city
     * @param ElectionRoles $electionRole
     * @return array
     */
    public static function getCityClustersAllocations(City $city, ElectionRoles $electionRole)
    {
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('name', true);

        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;


        $fields = [
            DB::raw('distinct clusters.id'),
            DB::raw('clusters.key'),
            DB::raw('clusters.quarter_id'),
            DB::raw($fullClusterNameQuery)
        ];

        $ClusterAllocationFree = ActivistsAllocations::select($fields)
            ->withActivistsAssignments(true)
            ->withClusters(true)
            ->where('activists_allocations.election_role_id', $electionRole->id)
            ->whereNull('activists_allocations_assignments.id')
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->where('activists_allocations.city_id', $city->id)
            ->whereNotNull('cluster_id')
            ->get();

        return !empty($ClusterAllocationFree) ? $ClusterAllocationFree : [];
    }


    public static function getAllocationBallotBoxByCity($cityId, $electionRoleId)
    {
        $city = CityRepository::getById($cityId);
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $miIdQuery = Helper::getFormattedMiIdQuery('name');

        $fields = [
            'ballot_boxes.id',
            DB::raw($miIdQuery),
            'activists_allocations.cluster_id',
            'activists_allocations.quarter_id',
        ];

        $ballotFreeAllocation = BallotBox::select($fields)
            ->withActivistsAllocations()
            ->with(['activistsAllocationsAssignments'=>function($query){
                $query->select(
                    'activists_allocations.ballot_box_id',
                    'activists_allocations_assignments.id as activists_allocations_assignment_id',
                    DB::raw('election_role_shifts.system_name as role_shift_system_name')
                );
            }])
            ->where('activists_allocations.election_role_id', $electionRoleId)
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->where('activists_allocations.city_id', $city->id)
            ->groupBy('ballot_boxes.id')
            ->get();

        return !empty($ballotFreeAllocation) ? $ballotFreeAllocation : [];
    }

    public static function getCityQuarterAllocationByElectionRole(City $city, ElectionRoles $electionRole)
    {
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;


        $fields = [
            DB::raw('distinct quarters.id'),
            'quarters.name',
            'quarters.city_id',
        ];

        $quarterAllocationFree = ActivistsAllocations::select($fields)
            ->withActivistsAssignments(true)
            ->withQuarters()
            ->where('activists_allocations.election_role_id', $electionRole->id)
            ->whereNull('activists_allocations_assignments.id')
            ->where('activists_allocations.election_campaign_id', $electionCampaignId)
            ->where('activists_allocations.city_id', $city->id)
            ->whereNotNull('quarter_id')
            ->get();

        return !empty($quarterAllocationFree) ? $quarterAllocationFree : [];
    }
}
