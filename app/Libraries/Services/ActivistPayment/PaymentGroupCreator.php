<?php

namespace App\Libraries\Services\ActivistPayment;

use App\DTO\PaymentGroupCreatorDto;
use App\DTO\PaymentGroupItemDto;
use App\Enums\SendMessageType;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Mapper;
use App\Libraries\Services\activists\ActivistsMessagesService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Libraries\Services\ServicePayments\ManagerMasavService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistPaymentModels\PaymentType;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\TransportationCars;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\PaymentGroupRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\TransportationCarsRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use App\Repositories\VotersWithCaptainsOfFiftyRepository;
use App\Repositories\VoterTransportationRepository;
use Auth;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Request;
use stdClass;

class PaymentGroupCreator
{

    const TAG = "PaymentGroupCreator";

    public static $MAX_AMOUNT_ALL_PAYMENT = 6000;

    //function create new group payment and activist payment record
    public static function CreatePaymentsGroup(PaymentGroupCreatorDto $paymentGroupCreatorDetails)
    {
        DB::beginTransaction();
        try {
            $paymentGroup = PaymentGroupRepository::insertNewGroupPayments(
                $paymentGroupCreatorDetails->paymentTypeId,
                $paymentGroupCreatorDetails->shasBankId,
                $paymentGroupCreatorDetails->paymentGroupName,
                $paymentGroupCreatorDetails->electionCampaignId
            );

            if($paymentGroupCreatorDetails->isRecurringActivistPayment)
            {
                self::addRecurringActivistPaymentForGroup($paymentGroup,$paymentGroupCreatorDetails->arrActivistPayment);
            }
            else{
                self::createActivistPaymentInGroup($paymentGroup, $paymentGroupCreatorDetails->arrPaymentGroupItem);
            }
           
            //create new masav file after add new record for group payment
            self::createMasavFileForActivistPaymentGroup($paymentGroup->id);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }



    //function get payment group id and arr payment details the function create activist payment rows for payment group
    private static function createActivistPaymentInGroup(PaymentGroup $paymentGroup, $arrPaymentGroupItem)
    {

        //for each all record payment
        foreach ($arrPaymentGroupItem as $key => $paymentGroupItem) {

            if ($paymentGroupItem->globalAmountRole > self::$MAX_AMOUNT_ALL_PAYMENT)
                throw new Exception(config('errors.payments.ERROR_SUM_ALL_AMOUNT_ROLE'));

            self::createActivistPaymentForPaymentGroupItem($paymentGroupItem, $paymentGroup);
        }
    }


    private static function createActivistPaymentForPaymentGroupItem($paymentGroupItem, PaymentGroup $paymentGroup)
    {

        if ($paymentGroupItem->globalAmountRole > self::$MAX_AMOUNT_ALL_PAYMENT)
            throw new Exception(config('errors.payments.ERROR_SUM_ALL_AMOUNT_ROLE'));
        $sumAmountForPaid = $paymentGroupItem->lockAmountForPaid;

        $newActivistPayment = new ActivistPayment();
        $newActivistPayment->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
        $voter = VotersRepository::getVoterByPersonalIdentity($paymentGroupItem->personalIdentity);
        $newActivistPayment->voter_id = $voter->id;
        $newActivistPayment->amount = $sumAmountForPaid;

        $newActivistPayment->status_id = PaymentStatus::getBySystemName(PaymentStatus::$statusWaitePay);


        $paymentTypeAccountId = PaymentType::getBySystemName(PaymentType::$bank_transfer);

        //insert details bank for new payment if payment type is bank transfer
        if ($paymentGroup->payment_type_id == $paymentTypeAccountId) {
            $newActivistPayment->bank_branch_id = $paymentGroupItem->bankDetails->bank_branch_id;
            $newActivistPayment->bank_account_number = $paymentGroupItem->bankDetails->bank_account_number;
            $newActivistPayment->bank_account_owner_id = $paymentGroupItem->personalIdentity;
            $newActivistPayment->bank_account_owner_name = $paymentGroupItem->bankDetails->bank_owner_name;
        }

        $newActivistPayment->payment_group_id = $paymentGroup->id;
        $newActivistPayment->parent_payment_id = null; //$detailsPayment->parent_payment_id;
        $newActivistPayment->first_payment_id = null; //$detailsPayment->first_payment_id;
        $newActivistPayment->is_shas_payment = $paymentGroupItem->isShasPayment;
        $newActivistPayment->election_campaign_id = $paymentGroup->election_campaign_id;
        $newActivistPayment->created_by = AuthService::getUserVoterId();


        $newActivistPayment->save();

        //loop all role voter that all activist role payment is lock
        foreach ($paymentGroupItem->arrRoleLockPayment as $roleVoterLock) {
            self::updateActivistPaymentIdForActivistRolePayment($roleVoterLock->activist_roles_payments, $newActivistPayment->id);
        }


        return $newActivistPayment;
    }

    public static function updateActivistPaymentIdForActivistRolePayment($arrActivistRolePayment, $paymentId)
    {

        $arrActivistRolePaymentIds = array_map(function ($activistRolePayment) {
            return $activistRolePayment->id;
        }, $arrActivistRolePayment);
        $arr = ActivistRolesPayments::whereIn('id', $arrActivistRolePaymentIds)->update(['activist_payment_id' => $paymentId]);
    }

    /**
     * function get paymentGroup details and arr of activist payment 
     * that recurring because there was an error in last transference
     *
     * function update all recurring activist payment in new group
     * function connect all activist payment role to recurring activist payment 
     * @param PaymentGroup $paymentGroup
     * @param array[] ActivistPayment $arrPaymentsDetails
     * @return void
     */
    public static function addRecurringActivistPaymentForGroup($paymentGroup, $arrPaymentsDetails)
    {
        foreach ($arrPaymentsDetails as $key => $activistPayment) {
            //connect all activist role payment to new recurring payment record
            self::updateActivsitPaymentIdOfRecurringActivistPayment($activistPayment->parent_payment_id, $activistPayment->id);
            $activistPaymentSave = ActivistPaymentRepository::getById($activistPayment->id);
            $activistPaymentSave->bank_branch_id = $activistPayment->voter_default_bank_details->bank_branch_id;
            $activistPaymentSave->bank_account_number = $activistPayment->voter_default_bank_details->bank_account_number;
            $activistPaymentSave->bank_account_owner_id = $activistPayment->personal_identity;
            $activistPaymentSave->bank_account_owner_name = $activistPayment->voter_default_bank_details->bank_owner_name;
            $activistPaymentSave->payment_group_id = $paymentGroup->id;
            $activistPaymentSave->save();
        }
    }

        /**
     * function get  last error activist payment id and update all activist role payment to recurring activist payment
     */
    private static function updateActivsitPaymentIdOfRecurringActivistPayment($parentActivistPaymentId, $recurringActivistPaymentId)
    {
        ActivistRolesPayments::where('activist_payment_id', $parentActivistPaymentId)
            ->update(['activist_payment_id' => $recurringActivistPaymentId]);
    }

    /**
     *function get payment group id 
     *function load all payment record in group and create masav file
     *function return location of masav file for update payment group object
     * @param [type] $paymentGroupId
     * @return void
     */
    public static function createMasavFileForActivistPaymentGroup($paymentGroupId)
    {
        $detailsForMasav = [
            'activist_payments.payment_group_id',
            'activist_payments.voter_id',
            'activist_payments.amount',
            'bank_branches.bank_id',
            'bank_branches.branch_number',
            'activist_payments.bank_account_owner_id',
            'activist_payments.bank_account_number',
            DB::raw("concat(voters.last_name,' ',voters.first_name) as full_name")
        ];

        $arrActivistPaymentForMasav = ActivistPayment::select($detailsForMasav)
            ->withVoter()
            ->withBankBranch()
            ->orderBy('activist_payments.id') //order by is must!!! the order by help to know the index row in masav file
            ->where('payment_group_id', $paymentGroupId)->get();

        $nameFileMasav = ManagerMasavService::createMasavFiles($arrActivistPaymentForMasav, $paymentGroupId);

        //updateNameMasavFile
        PaymentGroup::where('id', $paymentGroupId)->update(['location_file' => $nameFileMasav]);
    }



    //function get arr paymentDetails and payment group id
    //function connect new activist payment for existing group
    public static function addActivistPaymentsForExistingGroup($paymentGroupId, $arrPaymentsDetails)
    {
        DB::beginTransaction();
        try {
            $paymentGroup = PaymentGroup::select()->where('id', $paymentGroupId)->first();
            //create record activist payment
            self::createActivistPaymentInGroup($paymentGroup, $arrPaymentsDetails);
            //create new masav file after add new record for group payment
            self::createMasavFileForActivistPaymentGroup($paymentGroup->id);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }


}
