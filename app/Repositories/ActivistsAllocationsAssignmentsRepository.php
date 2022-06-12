<?php

namespace App\Repositories;

use App\Enums\ElectionRoleShiftSystemName;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
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

class ActivistsAllocationsAssignmentsRepository
{
    /**
     * @throws Exception if not exist
     * @return ActivistAllocationAssignment
     */
    public static function getById($assignmentId)
    {
        $assignment = ActivistAllocationAssignment::select()
            ->where('id', $assignmentId)->first();

        if (!$assignment)
            throw new Exception(config('errors.elections.ERROR_ACTIVIST_ASSIGNMENT_ID'));
        return $assignment;
    }

    /**
     * @return ActivistAllocationAssignment
     */
    public static function getAssignmentAndElectionRoleById($assignmentId)
    {
        return ActivistAllocationAssignment::select()
            ->with(['electionRoleByVoter'])
            ->where('activists_allocations_assignments.id', $assignmentId)
            ->first();
    }

    /**
     * @return ActivistAllocationAssignment
     */
    public static function getAssignmentElectionRoleAndAllocationById($assignmentId)
    {
        return ActivistAllocationAssignment::select()
            ->with(['electionRoleByVoter'])
            ->with(['allocation'])
            ->where('activists_allocations_assignments.id', $assignmentId)
            ->first();
    }

    /**
     * add  new assignment
     * @param int $electionRoleByVoterId
     * @param int $activistAllocationId
     * @param int $electionRoleShiftId
     * @return ActivistAllocationAssignment
     */
    public static function addAssignments(int $electionRoleByVoterId, int $activistAllocationId, $electionRoleShiftId = null)
    {
        if (self::isExistAllocationsAssignments($electionRoleByVoterId, $activistAllocationId))
            throw new Exception(config('errors.elections.ERROR_INSERT_ALLOCATION_ASSIGNMENT'));

        $ActivistAllocation = new ActivistAllocationAssignment();
        $ActivistAllocation->election_role_by_voter_id = $electionRoleByVoterId;
        $ActivistAllocation->activist_allocation_id = $activistAllocationId;
        $ActivistAllocation->election_role_shift_id = $electionRoleShiftId;
        $ActivistAllocation->save();

        return $ActivistAllocation;
    }

    /**
     * @param int $ActivistAllocationAssignmentId
     * @return ElectionRolesByVoters
     */
    public static function getElectionRoleVoterDetailsByAssignment($ActivistAllocationAssignmentId)
    {
        $electionRoleVoter = ActivistAllocationAssignment::select(DB::raw('election_roles_by_voters.*'))
        ->withElectionRoleByVoter(false)
            ->where('activists_allocations_assignments.id', $ActivistAllocationAssignmentId)->first();
        return $electionRoleVoter;
    }

    /**
     * function check ExistAllocationsAssignments by role voter and allocation before insert assignment
     *
     * @param int $electionRoleByVoterId
     * @param int $activistAllocationId
     * @return boolean
     */
    public static function isExistAllocationsAssignments(int $electionRoleByVoterId, int $activistAllocationId)
    {
        $assignment = ActivistAllocationAssignment::select()
            ->where('election_role_by_voter_id', $electionRoleByVoterId)
            ->where('activist_allocation_id', $activistAllocationId)
            ->first();

        return $assignment ? true : false;
    }

    /**
     *function get voter id and array shift role
     *function check if the voters has another shift role different array param for check before insert assignment in ballot 
     *function can  get activistAllocationAssignmentId for another condition to not include in query
     * @param int $voterId
     * @param string[] $arrShiftRoleSystemName
     * @param int $electionCampaignId
     * @param  int  $activistAllocationAssignmentId 
     * @return ActivistAllocationAssignment
     */
    public static function getAssignmentOfActivistInDifferentShift(int $voterId, array $arrShiftRoleSystemName, int $electionCampaignId, $activistAllocationAssignmentId = null)
    {
        $query = ActivistAllocationAssignment::select()
            ->withElectionRoleByVoter()
            ->withElectionRoleShifts()
            ->whereNotNull('activists_allocations_assignments.election_role_shift_id')
            ->whereNotIn('election_role_shifts.system_name', $arrShiftRoleSystemName)
            ->where('election_roles_by_voters.voter_id', $voterId)
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId);
        if ($activistAllocationAssignmentId)
            $query->where('activists_allocations_assignments.id', '<>', $activistAllocationAssignmentId);

        return  $query->get();
    }

    /**
     * @param int $assignmentId
     * @return ActivistAllocationAssignment;
     */
    public static function getAssignmentIncludeRoleVoterAndAllocation($assignmentId)
    {
        return ActivistAllocationAssignment::select()
            ->withElectionRoleByVoter()
            ->withActivistAllocation()
            ->where('activists_allocations_assignments.id', $assignmentId)
            ->first();
    }

    /**
     * return assignment of quarter director by voter id for specific election campaign
     * @return ActivistAllocationAssignment
     */
    public static function getAssignmentQuarterDirectorByVoterId(int $voterId, int $electionCampaignId)
    {
        $systemNameQuarterDirector = config('constants.activists.election_role_system_names.quarterDirector');
        return ActivistAllocationAssignment::select(DB::raw('activists_allocations_assignments.*'))
            ->withElectionRoleByVoter()
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
            ->where('election_roles.system_name', $systemNameQuarterDirector)
            ->where('election_roles_by_voters.voter_id', $voterId)
            ->first();
    }

    /**
     *
     * @param int $clusterId
     * @param string $roleSystemName
     */
    public static function getQueryClusterActivistDataByClusterIdAndRoleType($clusterId, $roleSystemName)
    {

        $electionRoleVoterField = [
            'election_roles_by_voters.voter_id', 'election_roles_by_voters.key as election_role_key', 'election_roles_by_voters.user_lock_id',
            'activists_allocations_assignments.id as activist_assignment_id',
            'election_roles.name as election_role_name', 'election_roles.system_name as election_role_system_name',
            'phone_number',  'verified_status',
            'voters.first_name', 'voters.last_name', 'voters.key as voter_key',
            'assigned_city.name as assigned_city_name',
            'clusters.key as cluster_key'
        ];

        $paymentField = [
            DB::raw('IF(activist_roles_payments.not_for_payment,"לא זכאי לתשלום",activist_roles_payments.sum) as sum'),
        ];

        $voterLockFields = ['voter_lock.first_name as voter_lock_first_name', 'voter_lock.last_name as voter_lock_last_name', 'voter_lock.key as voter_lock_key'];

        $fieldsQuery = array_merge($electionRoleVoterField, $paymentField, $voterLockFields);
        return ElectionRolesByVoters::select($fieldsQuery)
            ->withVoter()
            ->withElectionRole()
            ->withActivistAssingedCity()
            ->withActivistsAllocationAssignment()
            ->withActivistRolesPayments()
            ->withUserLock()
            ->join('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id')
            ->where('clusters.id', $clusterId)
            ->where('election_roles.system_name', $roleSystemName);
    }

    /**
     * @param int $activistAllocationId
     * @return ActivistAllocationAssignment
     */
    public static function getByActivistAllocationId($activistAllocationId)
    {
        return ActivistAllocationAssignment::select(
            [
                'activists_allocations_assignments.id',
                'voters.last_name as other_activist_last_name',
                'voters.personal_identity as other_activist_personal_identity',
                'voters.first_name as other_activist_first_name',
                'election_role_shifts.name as other_activist_shift_name',
                'election_role_shifts.system_name as other_activist_shift_system_name',
                'activist_roles_payments.user_lock_id as other_user_lock_id',
                'election_roles_by_voters.phone_number as other_activist_phone_number'
            ]
        )->withActivistRolesPayments()
            ->withElectionRoleShifts()
            ->withElectionRoleByVoter()
            ->join('voters', 'voters.id', 'election_roles_by_voters.voter_id')
            ->where('activist_allocation_id', $activistAllocationId)
            ->get();
    }

    /**
     * get system name role by assignment id
     *
     * @param integer $activistAllocationAssignmentId
     * @return string
     */
    public static function getSystemNameByAssignmentId(int $activistAllocationAssignmentId)
    {
        return self::getElectionRoleByAssignmentId($activistAllocationAssignmentId)->system_name;
    }

    /**
     * get election role by assignment id
     *
     * @param integer $activistAllocationAssignmentId
     * @return ElectionRoles
     */
    public static function getElectionRoleByAssignmentId(int $activistAllocationAssignmentId)
    {
        $assignment = ActivistAllocationAssignment::select([DB::raw('election_roles.*'), 'election_roles.system_name'])
            ->withElectionRoleByVoter()
            ->where('activists_allocations_assignments.id', $activistAllocationAssignmentId)
            ->first();
        if (!$assignment)
            if (!$assignment)
                throw new Exception(config('errors.elections.ERROR_ACTIVIST_ASSIGNMENT_ID'));

        return $assignment;
    }


    /**
     * Function get assignment and shift role for update its. the function check if the shift role not use in another assignment of the same ballot allocation
     *
     * @param ActivistAllocationAssignment $activistAllocationAssignment
     * @param ElectionRoleShifts $shiftRole
     * @return boolean
     */
    public static function isFreeAllocationBallotShiftRole(ActivistAllocationAssignment $activistAllocationAssignment, ElectionRoleShifts $shiftRole)
    {
        $activistAllocation = ActivistsAllocations::where('id', $activistAllocationAssignment->activist_allocation_id);
        return ActivistsAllocationsService::checkIfBallotAllocationIsCatch(
            $activistAllocation,
            $shiftRole->id,
            $activistAllocationAssignment->election_role_by_voter_id
        );
    }


    public static function getAllocationDetailsByAssignmentId($activistAllocationAssignmentId)
    {
        return ActivistAllocationAssignment::select(DB::raw('activists_allocations.*'))
            ->withActivistAllocation()
            ->where('activists_allocations_assignments.id', $activistAllocationAssignmentId)->first();
    }


    /**
     * function get id of ballot allocation , and check if the allocation has assignment not in counter shift
     *
     * @param int $activistAllocationAssignmentId
     * @return boolean
     */
    public static function isBallotAllocationHasAssignmentNotInCounterShift($activistAllocationAssignmentId)
    {
        $counterShiftSystemName = ElectionRoleShiftSystemName::COUNT;
        $countShift = ElectionRoleShiftRepository::getShiftRoleBySystemName($counterShiftSystemName);
        $assignmentNotCounterShift = ActivistAllocationAssignment::select()
            ->where('activists_allocations_assignments.election_role_shift_id', '<>', $countShift->id)
            ->where('activists_allocations_assignments.activist_allocation_id', $activistAllocationAssignmentId)->first();
        return  $assignmentNotCounterShift ? true : false;
    }

    public static function getAssignmentDetailsAndAllocationDetailsByAssignmentId($activistAllocationAssignmentId)
    {
        $field = [
            'activists_allocations_assignments.id as activists_allocations_assignment_id',
            'election_roles_by_voters.id as election_role_voter_id',
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.comment',
            'voters.personal_identity',
            DB::raw("concat(voters.last_name,' ',voters.first_name) as voter_full_name"),
            'voters.email',
            'cities.name as city_name',
            'clusters.name as cluster_name',
            'quarters.name as quarter_name',
            'ballot_boxes.mi_id as ballot_mi_id',
            'election_roles.name as election_role_name',
            'election_roles.system_name as election_role_system_name'

        ];

        return ActivistAllocationAssignment::select($field)
            ->withElectionRoleByVoter()
            ->withActivistAllocation()
            ->withElectionRoleShifts()
            ->withCity()
            ->withClusters(true)
            ->withQuarter(true)
            ->withBallotBox(true)
            ->join('voters', 'election_roles_by_voters.voter_id', '=', 'voters.id')
            ->where('activists_allocations_assignments.id',$activistAllocationAssignmentId)
            ->first();

    }
}
