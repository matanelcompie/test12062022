<?php

namespace App\Libraries\Services\ActivistPayment;

use App\Enums\PaymentStatus as EnumsPaymentStatus;
use App\Enums\ReasonPaymentStatus;
use App\Http\Requests\ActivistPaymentRequest;
use App\Libraries\Helper;
use App\Libraries\Services\ServicesModel\BankDetailsService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\PaymentStatusRepository;
use App\Repositories\ReasonPaymentStatusRepository;
use Exception;
use Illuminate\Http\Request;

class ActivistPaymentUpdator
{
    public static function update(ActivistPaymentRequest $activistPaymentRequest)
    {
        try {
            $activistPayment = ActivistPaymentRepository::getById($activistPaymentRequest->id);
            if ($activistPayment->status_id != $activistPaymentRequest->status_id) {
                $activistPayment->status_id = $activistPaymentRequest->status_id;
                $activistPayment->reason_status_id = $activistPaymentRequest->reason_status_id;
                if (!$activistPaymentRequest->reason_status_id)
                    throw new Exception(config('errors.payments.ERROR_PAYMENT_STATUS_REASON'));

                self::createChildActivistPaymentRecordInvalid($activistPayment);
            }
            $activistPayment->reason_status_id = $activistPaymentRequest->reason_status_id;
            $activistPayment->comment = $activistPaymentRequest->comment;
            $activistPayment->save();
        } catch (\Exception $e) {
            throw $e;
        }
    }

    private static function createChildActivistPaymentRecordInvalid($activistPayment)
    {
        $paymentStatusType = PaymentStatusRepository::getById($activistPayment->status_id);
        $reasonPaymentStatus = ReasonPaymentStatusRepository::getById($activistPayment->reason_status_id);
        if ($paymentStatusType->system_name == EnumsPaymentStatus::STATUS_INCORRECT) {
            if ($reasonPaymentStatus->system_name == ReasonPaymentStatus::WRONG_BANK_DETAILS) {
                BankDetailsService::updateBankDetailsWrongByVoterId($activistPayment->voter_id);
            }
            $childPaymentStatus = new ActivistPayment();
            $childPaymentStatus->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
            $childPaymentStatus->voter_id = $activistPayment->voter_id;
            $childPaymentStatus->amount = $activistPayment->amount;
            $childPaymentStatus->status_id = 1;
            $childPaymentStatus->parent_payment_id = $activistPayment->id;
            $childPaymentStatus->first_payment_id = $activistPayment->first_payment_id ? $activistPayment->first_payment_id : $activistPayment->id;
            $childPaymentStatus->is_shas_payment = $activistPayment->is_shas_payment;
            $childPaymentStatus->election_campaign_id = $activistPayment->election_campaign_id;
            $childPaymentStatus->created_by = AuthService::getUserVoterId();

            $childPaymentStatus->save();
        }
    }

}
