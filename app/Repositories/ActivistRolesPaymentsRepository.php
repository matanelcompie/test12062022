<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistRolePaymentCreator;
use App\Libraries\Services\FileService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ActivistRolesPaymentsRepository
{
    /**
     * function create election role payment
     * @return ActivistRolesPayments
     */
    public static function createIfNotExist(int $electionRoleByVoterId, int $sum, string $comment = null, int $activistsAllocationsAssignmentId = null, int $paymentTypeAdditionalId = null)
    {
        $ActivistRolePayment = self::isExist($electionRoleByVoterId, $paymentTypeAdditionalId, $activistsAllocationsAssignmentId);
        if (!$ActivistRolePayment) {
            $ActivistRolePayment = new ActivistRolesPayments();
            $ActivistRolePayment->election_role_by_voter_id = $electionRoleByVoterId;
            $ActivistRolePayment->activists_allocations_assignment_id = $activistsAllocationsAssignmentId;
            $ActivistRolePayment->payment_type_additional_id = $paymentTypeAdditionalId;
            $ActivistRolePayment->sum = $sum;
            $ActivistRolePayment->comment = $comment;
            $ActivistRolePayment->save();
        }

        return $ActivistRolePayment;
    }

    //function check if activist role payment by voter id and role voter id
    //for ballot member need get activist allocate assignment 
    //for bonus need get payment additional
    public static function isExist($election_role_by_voter_id, $payment_type_additional_id = null, $activists_allocations_assignment_id = null)
    {
        $ActivistRolesPayments = ActivistRolesPayments::select()
            ->where('election_role_by_voter_id', $election_role_by_voter_id);

        //check by additional payment
        if ($payment_type_additional_id)
            $ActivistRolesPayments = $ActivistRolesPayments->where('payment_type_additional_id', $payment_type_additional_id);
        //check by activists_allocations_assignment_id for ballot member
        if ($activists_allocations_assignment_id)
            $ActivistRolesPayments = $ActivistRolesPayments->where('activists_allocations_assignment_id', $activists_allocations_assignment_id);

        $ActivistRolesPayments = $ActivistRolesPayments->first();

        if ($ActivistRolesPayments)
            return $ActivistRolesPayments;

        return false;
    }


    public static function getSystemRoleNameByPaymentRoleId(int $activistRolePaymentId)
    {
        $payment = ActivistRolesPayments::select('activist_roles_payments.id', 'election_roles.system_name')
            ->withElectionRoleByVoter()
            ->join('election_roles', 'election_roles.id', 'election_roles_by_voters.election_role_id')
            ->where('activist_roles_payments.id', $activistRolePaymentId)->first();

        if (!$payment)
            throw new Exception(config('errors.payments.ERROR_NOT_EXIST_ROLE_PAYMENT'));

        return $payment->system_name;
    }

    /**
     * Get ActivistRolesPayments by id
     *
     * @param int $activistRolesPaymentId
     * @return ActivistRolesPayments
     * @throws Exception
     */
    public static function getById($activistRolesPaymentId)
    {
        $payment = ActivistRolesPayments::select()
            ->where('id', $activistRolesPaymentId)->first();
        if (!$payment)
            throw new Exception(config('errors.payments.ERROR_NOT_EXIST_ROLE_PAYMENT'));
        return $payment;
    }

    public static function getBasicActivistRolePaymentByAssignment(ActivistAllocationAssignment $assignment)
    {
        $activistsAllocationsAssignmentId = null;
        $systemRole = ActivistsAllocationsAssignmentsRepository::getSystemNameByAssignmentId($assignment->id);
        if (in_array($systemRole, ActivistRolePaymentCreator::getSystemRolesNameIncludePaymentForAssignment()))
            $activistsAllocationsAssignmentId = $assignment->id;

        $activistPaymentRole = ActivistRolesPaymentsRepository::isExist($assignment->election_role_by_voter_id, null, $activistsAllocationsAssignmentId);
        if (!$activistPaymentRole)
            throw new Exception(config('errors.system.ERROR_NOT_EXIST_ROLE_PAYMENT'));

        return $activistPaymentRole;
    }


    /***
     * get assignment and return array lock payment of assignment
     * the array payment by the type role assignment
     */
    public static function getLockPaymentsByAssignmentId(ActivistAllocationAssignment $assignment)
    {
        $activistsAllocationsAssignmentId = null;
        $systemRole = ActivistsAllocationsAssignmentsRepository::getSystemNameByAssignmentId($assignment->id);
        if (in_array($systemRole, ActivistRolePaymentCreator::getSystemRolesNameIncludePaymentForAssignment())) {
            $activistsAllocationsAssignmentId = $assignment->id;
        }

        $lockPayment = ActivistRolesPayments::select()
            ->where('election_role_by_voter_id', $assignment->election_role_by_voter_id)
            ->whereNotNull('user_lock_id');

        if (!is_null($activistsAllocationsAssignmentId))
            $lockPayment->where('activists_allocations_assignment_id', $assignment->id);

        return $lockPayment->get();
    }



    /**
     * function get election role voter and return array lock payment 
     *
     * @param int $electionRoleVoterId
     * @return ActivistRolesPayments
     */
    public static function getLockPaymentActivistRoleByElectionRoleVoterId($electionRoleVoterId)
    {
        return ActivistRolesPayments::select()
            ->where('election_role_by_voter_id', $electionRoleVoterId)
            ->whereNotNull('user_lock_id')
            ->get();
    }

    public static function getPaymentsDetailsByRoleVoterId($electionRoleByVoterId){
       return ElectionRolesByVoters::select(self::getArrFieldPaymentDetails())
       ->withVoter()
       ->withActivistAssingedCity()
       ->withElectionRole()
       ->withRoleActivistPaymentsDetails()
       ->leftJoin('activists_allocations_assignments','activists_allocations_assignments.id','=','activist_roles_payments.activists_allocations_assignment_id')
       ->leftJoin('activists_allocations','activists_allocations.id','=','activists_allocations_assignments.activist_allocation_id')
        ->leftJoin('cities','cities.id','=','election_roles_by_voters.assigned_city_id')
        ->leftJoin('clusters','clusters.id','=','activists_allocations.cluster_id')
        ->leftJoin('ballot_boxes','ballot_boxes.id','=','activists_allocations.ballot_box_id')
        ->leftJoin('bank_details','bank_details.voter_id','=','election_roles_by_voters.voter_id')
        ->leftJoin('bank_branches','bank_branches.id','=','bank_details.bank_branch_id')
        ->where('election_roles_by_voters.id',$electionRoleByVoterId)
        ->get();
    }

    public static function getArrFieldPaymentDetails(){
        return [
            DB::raw("concat(voters.first_name,' ',voters.last_name) as voter_name"),
            'voters.personal_identity',
            'election_roles.name as election_roles_name',
            'activist_roles_payments.election_role_by_voter_id',
            'activist_roles_payments.id',
            'activist_roles_payments.id as activist_roles_payments_id',
            'activist_roles_payments.sum',
            'activist_roles_payments.payment_type_additional_id',
            'activist_roles_payments.activist_payment_id',
            'activist_roles_payments.lock_date',
            'activist_roles_payments.comment',
            'activist_roles_payments.not_for_payment',
            'activist_roles_payments.user_lock_id',
            DB::raw("concat(voter_user_lock.first_name,' ',voter_user_lock.last_name) as voter_user_lock"),
            'payment_type_additional.name as payment_type_additional_name',
            'assigned_city.name as city_name',
            'clusters.name as cluster_name',
            'ballot_boxes.mi_id as ballot_box_mi_id',

            'activist_payments.id as activist_payments_id',
            'activist_payments.key as payment_key',
            'activist_payments.status_id',
            'payment_status.name as payment_status_name',
            'payment_status.system_name as payment_status_system_name',
            'activist_payments.reason_status_id',
            'reason_payment_status.name as reason_payment_status',

            'payment_banks.name as bank_name',
            'payment_bank_branches.name as bank_branch_name',
            'activist_payments.bank_account_number',
            'activist_payments.bank_account_owner_id',
            'activist_payments.bank_account_owner_name',
            'activist_payments.payment_group_id',
            'activist_payments.created_at',
            DB::raw("concat(payment_bank_branches.bank_id,'/',payment_bank_branches.branch_number,'/',activist_payments.bank_account_number)as transfer_details"),
            DB::raw("concat(details_user_create.first_name,' ',details_user_create.last_name) as user_create"),


            'payment_group.name as payment_group_name',
            'payment_group.reference_id',
            'payment_group.transfer_date',
            'payment_group.created_at as payment_group_created_at',
            DB::raw("concat(details_masav_user_create.first_name,' ',details_masav_user_create.last_name) as masav_user_create"),

            'shas_branch.branch_number as shas_branch_number',
            'shas_branch.name as shas_branch_name',
            'shas_branch.bank_id as shas_bank_id',
            'shas_bank.name as shas_bank_name',
            'shas_bank_details.bank_account_number as shas_bank_account_number',
            'shas_bank_details.bank_account_owner_id as shas_bank_account_owner_id',
            'shas_bank_details.bank_account_owner_name as shas_bank_account_owner_name',



            'payment_group.shas_bank_details_id',
            'payment_group.election_campaign_id',
            'payment_group.transfer_date',
            'payment_type.system_name as payment_type_system_name',
            'payment_type.name as payment_type_name',

            'first_payment_group.reference_id as first_reference_id',
            'first_payment_group.created_at as first_payment_group_created_at',

            'bank_branches.branch_number as original_branch_number',
            'bank_branches.bank_id as original_bank_id',
            'bank_details.bank_account_number as original_bank_account_number'


        ];
    }


    /**
     * return payment details for voter in election campaign
     * @param $objectSearchDetails
     * @return ElectionRolesByVoters
     */
    public static function getListPaymentsByVoter($objectSearchDetails = null)
    {
        $query = ElectionRolesByVoters::select(self::getArrFieldPaymentDetails())
            ->withVoter()
            ->withRoleActivistPaymentsDetails()
            ->withElectionRole()
            ->withActivistAssingedCity()
            ->leftJoin('activists_allocations_assignments', 'activists_allocations_assignments.id', '=', 'activist_roles_payments.activists_allocations_assignment_id')
            ->leftJoin('activists_allocations', 'activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id')
            ->leftJoin('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id')
            ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'activists_allocations.ballot_box_id')
            ->leftJoin('bank_details', 'bank_details.voter_id', '=', 'voters.id')
            ->leftJoin('bank_branches', 'bank_branches.id', '=', 'bank_details.bank_branch_id');


        $arrRoleVoterAndPayments = searchActivistService::createQueryWithSearchDetails($query, $objectSearchDetails);
        $arrRoleVoterAndPayments = $arrRoleVoterAndPayments->get();
        return $arrRoleVoterAndPayments;
    }

    public static function getAllChildrenRolePaymentByParentPaymentId($parentPaymentId)
    {
        return ActivistRolesPayments::select('activist_roles_payments.*')
            ->withActivistPayment()
            ->where(function ($q) use ($parentPaymentId) {
                $q->where('parent_payment_id', $parentPaymentId)
                    ->orWhere('first_payment_id', $parentPaymentId);
            })->get();
    }

}
