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
class ReasonPaymentStatus extends Model {
    public $primaryKey = 'id';
    protected $table = 'reason_payment_status';

    public static function getObjectById($id){
        $reason=PaymentStatus::select()->where('id',$id)->first();
        return $reason;
    }
}