<?php

namespace App\Repositories;

use App\Libraries\Helper;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\ActivistPaymentModels\PaymentGroup;

class PaymentGroupRepository
{
    public static function insertNewGroupPayments($payment_type_id = null, $shas_bank_details_id, $paymentGroupName, $election_campaign_id, $reference_id = null, $transfer_date = null)
    {
        $newPaymentsGroup = new PaymentGroup();
        $newPaymentsGroup->key = Helper::getNewTableKey('payment_group', PaymentGroup::$length);
        $newPaymentsGroup->name = $paymentGroupName;
        $newPaymentsGroup->payment_type_id = $payment_type_id;
        $newPaymentsGroup->shas_bank_details_id = $shas_bank_details_id;
        $newPaymentsGroup->election_campaign_id = $election_campaign_id;
        $newPaymentsGroup->created_at = date('Y-m-d');
        $newPaymentsGroup->created_by = AuthService::getUserVoterId();
        $newPaymentsGroup->reference_id = $reference_id;
        $newPaymentsGroup->transfer_date = $transfer_date;
        $newPaymentsGroup->save();

        return $newPaymentsGroup;
    }
}
