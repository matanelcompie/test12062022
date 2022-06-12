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
class ActivistPayment extends Model {
    public $primaryKey = 'id';
    public static $length=10;
    protected $table = 'activist_payments';


    public function parentActivistPayment()
    {
        return $this->hasOne('App\Models\ActivistPaymentModels\ActivistPayment', 'id','parent_payment_id');
    }

    public function firstActivistPayment()
    {
        return $this->hasOne('App\Models\ActivistPaymentModels\ActivistPayment', 'id','first_payment_id');
    }

    public function voterDefaultBankDetails()
    {
        return $this->hasOne('App\Models\BankDetails','voter_id', 'voter_id');
    }
    
    public static function scopeWithElectionRoleCampaign($query,$election_campaign_id,$join=true){
        $joinFunc=$join?'join':'leftJoin';
        $query->$joinFunc('election_roles_by_voters',function($joinOn)use($election_campaign_id){
            $joinOn->on('election_roles_by_voters.id', '=', 'activists_allocations.election_role_by_voter_id')
                   ->on('election_roles_by_voters.election_campaign_id','=',DB::raw($election_campaign_id));
        });
    }

    public function scopeWithVoter ( $query ) {
        $query->leftJoin( 'voters', 'voters.id', '=', 'activist_payments.voter_id' );
    }

    public function scopeWithPaymentGroup ( $query ) {
        $query->leftJoin( 'payment_group', 'payment_group.id', '=', 'activist_payments.payment_group_id' );
    }

    
    public function scopeWithReasonStatus ( $query ) {
        $query->leftJoin( 'reason_payment_status', 'reason_payment_status.id', '=', 'activist_payments.reason_status_id' );
    }
    
    public function scopeWithPaymentStatus ( $query ) {
        $query->leftJoin( 'payment_status','payment_status.id','=','activist_payments.status_id');
    }

    public function scopeWithBankBranch ( $query ) {
        $query->leftJoin( 'bank_branches','bank_branches.id','=','activist_payments.bank_branch_id')
              ->leftJoin('banks','banks.id','=','bank_branches.bank_id');
    }




}