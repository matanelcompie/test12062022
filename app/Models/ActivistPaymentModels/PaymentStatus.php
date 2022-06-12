<?php

namespace App\Models\ActivistPaymentModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
class PaymentStatus extends Model {
    public $primaryKey = 'id';
    protected $table = 'payment_status';
    //---type of status payment
    
    public static $statusWaitePay = 'waite_for_pay';
    public static $statusWaiteConfirm = 'waite_for_confirm_payment';
    public static $statusPaid = 'payment_paid';
    public static $statusIncorrect = 'incorrect_payment';

    
    public static function getBySystemName($systemName,$onlyId=true){
        $paymentStatusObj=PaymentStatus::select('*')->where('system_name',$systemName)->first();
        if($onlyId)
        return $paymentStatusObj->id;

        return $paymentStatusObj;
    }

}