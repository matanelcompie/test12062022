<?php

namespace App\Repositories;

use App\Enums\PaymentStatus;
use App\Libraries\Helper;
use App\Libraries\Services\ServicesModel\BankDetailsService;
use App\Models\Action;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\PaymentStatus as ActivistPaymentModelsPaymentStatus;
use DB;
use Illuminate\Support\Facades\Auth;
use Log;

class ActivistPaymentRepository
{

    public static function getById($id)
    {
        return ActivistPayment::select()->where('id',$id)->first();
    }

    /**
     * Get details activist payment for group
     *
     * @param int $paymentGroupId
     * @return ActivistPayment
     */
    public static function getActivistPaymentDetailsByGroupId($paymentGroupId)
    {
        return ActivistPayment::select(
            DB::raw("concat(voters.first_name,' ',voters.last_name) as voter_name"),
            'amount',
            'banks.id as bank_id',
            'bank_branches.branch_number',
            'bank_account_number',
            'bank_account_owner_name',
            'bank_account_owner_id',
            DB::raw("concat(banks.id,'/',bank_branches.branch_number,'/',bank_account_number) as full_bank_details"),
            'payment_group.name as payment_group_name',
            'payment_group.transfer_date',
            'payment_status.name as payment_status_name',
            'payment_group.reference_id',
            'payment_type.system_name as payment_type_system_name',
            'check_number'
        )
            ->withVoter()
            ->withReasonStatus()
            ->withPaymentStatus()
            ->withBankBranch()
            ->withPaymentGroup()
            ->leftJoin('payment_type','payment_type.id','=','payment_group.payment_type_id')
            ->where('payment_group_id', $paymentGroupId)
            ->get();
    }

    public static function getRecurringActivistPaymentToPay()
    {
        $details= ActivistPayment::select(
            'activist_payments.is_shas_payment',
            'activist_payments.id',
            'activist_payments.voter_id',
            'activist_payments.parent_payment_id',
            'activist_payments.first_payment_id',
            'voters.personal_identity',
            DB::raw('voters.key as voter_key'),
            DB::raw("concat(voters.first_name,' ',voters.last_name) as voter_name"),
            'amount'
        )
            ->with(['voterDefaultBankDetails' => function ($q) {
                $q->select(BankDetailsService::getArrFieldBankDetails())
                    ->leftJoin('bank_branches', 'bank_branches.id', '=', 'bank_details.bank_branch_id')
                    ->leftJoin('banks', 'banks.id', '=', 'bank_branches.bank_id');
            }])
            ->with(['parentActivistPayment'=> function ($p)
            {
                self::detailsParentPayment($p);
            }])
            ->with(['firstActivistPayment'=> function ($p)
            {
                self::detailsParentPayment($p);
            }])
            ->withVoter()
            ->whereNotNull('parent_payment_id')
            ->whereNull('payment_group_id')
            ->get();

            return $details;
    }


    public static function detailsParentPayment($query){
        $query->select(
        'activist_payments.id',
        'amount',
        'activist_payments.comment',
        'banks.id as bank_id',
        'bank_branches.branch_number',
        'bank_account_number',
        'bank_account_owner_name',
        'bank_account_owner_id',
        'payment_group.name as payment_group_name',
        'payment_group.reference_id',
        'payment_group.transfer_date',
        'reason_payment_status.name as reason_payment_status_name',
        'payment_status.name as payment_status_name')
        ->withReasonStatus()
        ->withPaymentStatus()
        ->withBankBranch()
        ->withPaymentGroup();
    }

    /**
     * check if activist payment has children payment that paid
     *
     * @param int $parentActivistPaymentId
     * @return bool
     */
    public static function CheckIfActivistPaymentHasChildrenInPaymentGroup($parentActivistPaymentId)
    {
        $childrenPayment = ActivistPayment::select()->where(function ($q) use ($parentActivistPaymentId) {
            $q->where('parent_payment_id', $parentActivistPaymentId)
                ->orWhere('first_payment_id', $parentActivistPaymentId);
        })
            ->whereNotNull('payment_group_id')
            ->get();

        return $childrenPayment->count() > 0 ? true : false;
    }

}
