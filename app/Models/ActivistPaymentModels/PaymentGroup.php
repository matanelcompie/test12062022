<?php

namespace App\Models\ActivistPaymentModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer  $city_id
 * @property integer  $quarter_id
 * @property integer  $cluster_id
 * @property integer  $election_role_by_voter_id
 * @property string  $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class PaymentGroup extends Model {
    public $primaryKey = 'id';
    protected $table = 'payment_group';
    public static $length=7;

    public function scopeWithPaymentType ( $query ) {

        $query->join( 'payment_type', 'payment_group.payment_type_id', '=', 'payment_type.id' );
    }

    public function scopeWithVoterCreate ( $query ) {

        $query->join( 'voters as voters_create', 'payment_group.created_by', '=', 'voters_create.id' );
    }

    public function scopeWithActivistPayment ( $query,$includeElectionRoleVoter=false,$includeVoterDetails=false ) {

        $query->join( 'activist_payments', 'activist_payments.payment_group_id', '=', 'payment_group.id' );
        if($includeElectionRoleVoter){
            $query
            ->join('activist_roles_payments','activist_roles_payments.activist_payment_id','=','activist_payments.id')
            ->join( 'election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activist_roles_payments.election_role_by_voter_id' );
        }
         
        
        if($includeVoterDetails)
           $query->join( 'voters', 'voters.id', '=', 'activist_payments.voter_id' );
        
    }


    

}