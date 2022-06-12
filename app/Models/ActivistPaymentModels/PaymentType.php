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
class PaymentType extends Model {
    public $primaryKey = 'id';
    protected $table = 'payment_type';
    //---type of status payment
    public static $check = 'check';
    public static $bank_transfer = 'bank_transfer';


    
    public static function getBySystemName($systemName,$onlyId=true){
        $paymentStatusObj=PaymentType::select()->where('system_name',$systemName)->first();
        if($onlyId)
        return $paymentStatusObj->id;

        return $paymentStatusObj;
    }
}