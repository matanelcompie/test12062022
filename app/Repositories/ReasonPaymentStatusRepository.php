<?php

namespace App\Repositories;

use App\Models\ActivistPaymentModels\ReasonPaymentStatus;
use App\Models\RequestClosureReason;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class ReasonPaymentStatusRepository
{
    /**
     * 
     * Get all ReasonPaymentStatus by type payment status type
     * @param  $paymentStatusTypeId null
     * @return ReasonPaymentStatus
     */
    public static function getAll($paymentStatusTypeId = null)
    {
        $reasonPaymentStatus = ReasonPaymentStatus::select();
        if ($paymentStatusTypeId)
            $reasonPaymentStatus->where('payment_status_id', $paymentStatusTypeId);

        return  $reasonPaymentStatus->get();
    }

    public static function getById($reasonPaymentStatusId)
    {
        $reasonPaymentStatus = ReasonPaymentStatus::select()->where('id', $reasonPaymentStatusId)->first();
        if (!$reasonPaymentStatus)
            throw new Exception(config('errors.payments.ERROR_REASON_PAYMENT_STATUS_NOT_EXIST'));

        return $reasonPaymentStatus;
    }
}
