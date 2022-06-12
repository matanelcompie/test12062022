<?php

namespace App\Models\ActivistPaymentModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string   $key
 * @property integer  $voter_id
 * @property integer  $amount
 * @property integer  $status_id
 * @property integer  $reason_status_id
 * @property string   $comment

 * @property integer  $bank_branch_id
 * @property integer  $bank_account_number
 * @property integer  $bank_account_owner_id
 * @property string   $bank_account_owner_name
 * @property integer  $payment_group_id

 * @property integer  $parent_payment_id
 * @property integer  $first_payment_id
 * @property integer  $election_campaign_id
 * @property bool     $is_shas_payment
 */
class ActivistRolesPayments extends Model {
    public $primaryKey = 'id';
    public static $length=10;
    protected $table = 'activist_roles_payments';
    
    public function otherActivistAllocationAssignment() {
        return $this->hasMany('App\Models\ActivistAllocationAssignment', 'activist_allocation_id', 'activist_allocation_id')->withActivistsAllocationsAssignments();
    }
    public function scopeWithElectionRoleByVoter($query,$withAssignmentAllocationRoleVoter=false){
        $query->join('election_roles_by_voters','election_roles_by_voters.id', '=', 'activist_roles_payments.election_role_by_voter_id');
        if($withAssignmentAllocationRoleVoter){
            $query->join('activists_allocations_assignments as role_voter_allocations_assignments','role_voter_allocations_assignments.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
                  ->join('activists_allocations as role_voter_activists_allocations','role_voter_activists_allocations.id', '=', 'role_voter_allocations_assignments.activist_allocation_id');
        }
        
    }

    public function scopeWithVoterBankDetails($query){
        $query->leftJoin('bank_details', 'bank_details.voter_id', '=', 'election_roles_by_voters.voter_id')
              ->leftJoin('bank_branches','bank_branches.id','=','bank_details.bank_branch_id')
              ->leftJoin('banks','banks.id','=','bank_branches.bank_id'); 
    }

    public function scopeWithActivistsAllocationsAssignments($query){
        $query->leftJoin('activists_allocations_assignments','activists_allocations_assignments.election_role_by_voter_id', '=', 'activist_roles_payments.election_role_by_voter_id');
        // ->whereRaw('(CASE
        //     WHEN activists_allocations_assignment_id is not null THEN (activists_allocations_assignments.id = activists_allocations_assignment_id)
        //     ELSE true
        // END)');
    }

    public function scopeWithActivistAllocation( $query ) {
        $query->leftJoin('activists_allocations','activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id');
    }

    public function scopeWithBallotBox( $query ) {
        $query->leftJoin('ballot_boxes','ballot_boxes.id', '=', 'activists_allocations.ballot_box_id');
    }

    public function scopeWithActivistPaymentAdditionalType( $query ) {
        $query->leftJoin( 'payment_type_additional', 'payment_type_additional.id', '=', 'activist_roles_payments.payment_type_additional_id' );
    }

    public function scopeWithActivistPayment( $query ) {
        $query->leftJoin( 'activist_payments', 'activist_payments.id', '=', 'activist_roles_payments.activist_payment_id' );
    }

    public function scopeWithPaymentGroup ( $query ) {
        $query->leftJoin( 'payment_group', 'payment_group.id', '=', 'activist_payments.payment_group_id' );
    }

   //must activists_allocations_assignments
    public function scopeWithElectionRoleShifts ( $query, $leftJoin = true ) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
         $query->$joinMethod( 'election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id' );
    }

    //---election role by voter details
    public function scopeWithVoter ( $query ,$nameTable=false) {
        if(!$nameTable)
        $query->leftJoin( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' );
        else
        $query->leftJoin( 'voters as '.$nameTable, $nameTable.'.id', '=', 'election_roles_by_voters.voter_id' );
    }


    public function scopeWithVoterUserLock($query)
    {
        $query->leftJoin('users', 'users.id', '=', 'activist_roles_payments.user_lock_id')
        ->leftJoin('voters as voter_user_lock', 'voter_user_lock.id', '=', 'users.voter_id');
    }

    //-----activist_payments-------------
    public function scopeWithPaymentStatus($query)
    {
        $query->leftJoin('payment_status', 'payment_status.id', '=', 'activist_payments.status_id');
    }

    public function scopeWithReasonPaymentStatus($query)
    {
        $query->leftJoin('reason_payment_status', 'reason_payment_status.id', '=', 'activist_payments.reason_status_id');
    }

    public function scopeWithBankBranch($query)
    {
        $query->leftJoin('bank_branches', 'bank_branches.id', '=', 'activist_payments.bank_branch_id')
        ->leftJoin('banks', 'banks.id', '=', 'bank_branches.bank_id');
    }
}