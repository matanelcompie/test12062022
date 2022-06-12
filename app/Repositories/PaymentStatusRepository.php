<?php

namespace App\Repositories;

use App\Libraries\Helper;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;

class PaymentStatusRepository
{
    public static function getBySystemName($systemName,$onlyId=true){
        $paymentStatusObj=PaymentStatus::select('*')->where('system_name',$systemName)->first();
        if($onlyId)
        return $paymentStatusObj->id;

        return $paymentStatusObj;
    }

    public static function getById($id)
    {
        return PaymentStatus::select()->where('id', $id)->first();
    }
}
