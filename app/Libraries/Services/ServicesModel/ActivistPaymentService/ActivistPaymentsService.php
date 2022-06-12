<?php

namespace App\Libraries\Services\ServicesModel\ActivistPaymentService;

use App\DTO\PaymentGroupItemDto;
use App\Enums\PaymentStatus as EnumsPaymentStatus;
use App\Enums\TypePaymentGroupRole;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistPayment\PaymentGroupCreator;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ServicePayments\ManagerMasavService;
use App\Libraries\Services\ServicesModel\BankDetailsService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\VotersService;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistPaymentModels\PaymentType;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\BankDetails;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\PaymentStatusRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class ActivistPaymentsService
{


    public static function subQueryAllAmountRole($election_campaign_id)
    {

        return '
        (SELECT sum(activist_roles_payments.sum) as global_amount_role
        FROM  election_roles_by_voters as role_count  join activist_roles_payments on role_count.id=activist_roles_payments.election_role_by_voter_id
        
        where 
        role_count.voter_id=election_roles_by_voters.voter_id
        and (activist_roles_payments.not_for_payment is null or activist_roles_payments.not_for_payment=0)
        and
        role_count.election_campaign_id=' . $election_campaign_id . ') as global_amount_role';
    }


    public static function getSummeryDetailsPaymentActivist($objectSearchDetails = null)
    {

        //status wait paid in payment group
        $statusWaitePayId = PaymentStatus::getBySystemName(PaymentStatus::$statusWaitePay);
        $statusWaiteConfirmId = PaymentStatus::getBySystemName(PaymentStatus::$statusWaiteConfirm);
        $statusPaidId = PaymentStatus::getBySystemName(PaymentStatus::$statusPaid);
        $statusIncorrectId = PaymentStatus::getBySystemName(PaymentStatus::$statusIncorrect);

        $arrDetails = [
            'voters.key as voter_key',
            'voters.personal_identity',
            'voters.first_name',
            'voters.last_name',
            'election_roles_by_voters.phone_number',
            DB::raw('sum((case when activist_roles_payments.not_for_payment is null or activist_roles_payments.not_for_payment = 0 then activist_roles_payments.sum else 0 end)) as SumAmountRole'),
            //sum amount waite to pay
            DB::raw('sum((case when 
            (activist_roles_payments.not_for_payment is null or activist_roles_payments.not_for_payment = 0 ) and
            (activist_payments.status_id =' . $statusWaitePayId . ' or activist_roles_payments.activist_payment_id is null) then activist_roles_payments.sum else 0 end) ) as SumAmountWaitePay'),
            DB::raw('sum((case when activist_payments.status_id =' . $statusWaiteConfirmId . ' then activist_roles_payments.sum else 0 end) ) as SumAmountWaiteConfirm'),
            DB::raw('sum((case when activist_payments.status_id =' . $statusPaidId . ' then activist_roles_payments.sum else 0 end) ) as SumAmountPaid'),
            DB::raw('sum((case when activist_payments.status_id =' . $statusIncorrectId . ' then activist_roles_payments.sum else 0 end) ) as SumAmountIncorrect'),
            'bank_details.is_bank_verified',
            'bank_details.bank_branch_id',
            'bank_branches.branch_number',
            'bank_branches.name as branch_name',
            'bank_branches.bank_id',
            'banks.name as bank_name',
            'bank_details.bank_account_number',
            'bank_details.bank_owner_name',
        ];

        $query = ElectionRolesByVoters::select($arrDetails)
            ->withVoter()
            ->withRoleActivistPaymentsDetails()
            ->withActivistAssingedCity()
            ->withVoterBankDetails();

        $query = searchActivistService::createQueryWithSearchDetails($query, $objectSearchDetails);
        $summeryDetailsActivist = $query->groupBy('voters.id')->get();


        return $summeryDetailsActivist;
    }


    //function return all arr role without record payments
    public static function getArrRoleNeedPayForAllUsers($electionCampaignId, $objectDetailsSearch)
    {
        $arrayFieldSearchPayment = searchActivistService::getArraySearchNameFieldOfPaymentRecordNeedPay();
        $objectDetailsSearchPayment = new stdClass();
        foreach ($objectDetailsSearch as $key => $value) {
            if (in_array($key, $arrayFieldSearchPayment))
                $objectDetailsSearchPayment->$key = $value;
        }

        $arrDetails = [
            DB::raw('distinct election_roles_by_voters.id'),
            'voters.key as voter_key',
            'election_roles_by_voters.voter_id',
            'voters.personal_identity',
            DB::raw("concat(voters.first_name,' ',voters.last_name) as activist_full_name"),
            'election_roles_by_voters.phone_number',
            DB::raw('election_roles_by_voters.key as election_roles_by_voters_key'),
            'election_roles_by_voters.election_role_id',

            'election_roles.name as election_role_name',
            'election_roles.system_name as election_role_system_name',
            DB::raw(self::subQueryAllAmountRole($electionCampaignId))
        ];

        $query = ElectionRolesByVoters::select($arrDetails)
            ->withVoter()
            ->with(['activistRolesPayments' => function ($q) use ($objectDetailsSearchPayment) {
                $q->select([
                    'activist_roles_payments.id',
                    'activist_roles_payments.election_role_by_voter_id',
                    'activist_roles_payments.sum',
                    'activist_roles_payments.user_lock_id'
                ])
                    ->whereNull('activist_roles_payments.activist_payment_id')
                    ->where(function ($query) {
                        $query->whereNull('activist_roles_payments.not_for_payment')
                            ->orWhere('activist_roles_payments.not_for_payment', DB::raw(0));
                    });
                $q = searchActivistService::createQueryWithSearchDetails($q, $objectDetailsSearchPayment);
            }])
            ->with(['bankDetails' => function ($q) {
                $q->select(BankDetailsService::getArrFieldBankDetails())
                    ->leftJoin('bank_branches', 'bank_branches.id', '=', 'bank_details.bank_branch_id')
                    ->leftJoin('banks', 'banks.id', '=', 'bank_branches.bank_id');
            }])
            ->withActivistAssingedCity()
            ->withElectionRole()
            ->withVoterBankDetails()
            ->withActivistRolesPayments()
            ->whereNull('activist_roles_payments.activist_payment_id')
            ->where(function ($query) {
                $query->whereNull('activist_roles_payments.not_for_payment')
                    ->orWhere('activist_roles_payments.not_for_payment', DB::raw(0));
            })
            ->leftJoin('activist_payments', 'activist_payments.id', 'activist_roles_payments.activist_payment_id')
            ->leftJoin('payment_group', 'payment_group.id', 'activist_payments.payment_group_id')
            ->orderBy('voters.id');

        $query = searchActivistService::createQueryWithSearchDetails($query, $objectDetailsSearch);
        
        $allRoleNeedPay = $query->get();

        return $allRoleNeedPay->filter(function ($roleVoter) {
            return $roleVoter->activistRolesPayments &&  $roleVoter->activistRolesPayments->count() > 0;
        });
    }



    /**
     * function get array activist role payment that need paid
     *
     * @param ElectionRolesByVoters $arrActivistRolePayment
     * @return array
     */
    public static function makeHashActivistRoleNeedPayments($electionRoleByVoters)
    {
        $indexRow = 0;
        $hashActivistNeedPayment = array();

        foreach ($electionRoleByVoters as $key => $electionRoleVoter) {
            $amountRoleVoter = 0;
            $amountLockSum = 0; //sum all lock amount of activist role voter 
            $isActivistRolePaymentLock = true;

            $personal_identity = $electionRoleVoter->personal_identity;
            //is role not for shas payment
            if (in_array($electionRoleVoter->election_role_system_name, TypePaymentGroupRole::getRoleNotInShasPayment()))
                $typePaymentGroupRole = TypePaymentGroupRole::VAADAT_BCHIROT;
            else
                $typePaymentGroupRole = TypePaymentGroupRole::SHAS;

            $key_hash = $personal_identity . '-' . $typePaymentGroupRole;

            if (!array_key_exists($key_hash, $hashActivistNeedPayment)) {
                $PaymentGroupItemDto = new PaymentGroupItemDto();
                $PaymentGroupItemDto->indexRow = $indexRow;
                $PaymentGroupItemDto->activistFullName = $electionRoleVoter->activist_full_name;
                $PaymentGroupItemDto->personalIdentity = $electionRoleVoter->personal_identity;
                $PaymentGroupItemDto->phoneNumber = $electionRoleVoter->phone_number;
                $PaymentGroupItemDto->isShasPayment = $typePaymentGroupRole;
                $PaymentGroupItemDto->arrRoleActivist = [$electionRoleVoter];
                $PaymentGroupItemDto->arrRoleLockPayment = [];
                $PaymentGroupItemDto->lockAmountForPaid = 0;
                $PaymentGroupItemDto->globalActiveAmount = $electionRoleVoter->global_amount_role;
                $PaymentGroupItemDto->amount = 0;
                $PaymentGroupItemDto->bankDetails = $electionRoleVoter->bankDetails;

                //$hashActivistNeedPayment[$key_hash] = $PaymentGroupItemDto;
                $indexRow = $indexRow + 1;
            } else {
                $PaymentGroupItemDto = $hashActivistNeedPayment[$key_hash];
                $PaymentGroupItemDto->arrRoleActivist[] = $electionRoleVoter;
                //$hashActivistNeedPayment[$key_hash]->arrRoleActivist[] = $electionRoleVoter;
            }

            foreach ($electionRoleVoter->activistRolesPayments as $key => $activistRolePayment) {
                $amountRoleVoter += $activistRolePayment->sum;

                if (!$activistRolePayment->user_lock_id || is_null($activistRolePayment->user_lock_id)) {
                    $isActivistRolePaymentLock = false;
                } else {
                    $amountLockSum += $activistRolePayment->sum;
                }
            }

            $PaymentGroupItemDto->amount += $amountRoleVoter;
            if ($isActivistRolePaymentLock) {
                $PaymentGroupItemDto->isValidForPaid = self::isValidPaymentGroupItem($PaymentGroupItemDto);
                $PaymentGroupItemDto->lockAmountForPaid += $amountLockSum;
                $PaymentGroupItemDto->arrRoleLockPayment[] = $electionRoleVoter;
            }

            $hashActivistNeedPayment[$key_hash] = $PaymentGroupItemDto;
        }

        return $hashActivistNeedPayment;
    }


    private static function isValidPaymentGroupItem(PaymentGroupItemDto $paymentGroupItem)
    {
        if ($paymentGroupItem->globalActiveAmount > PaymentGroupCreator::$MAX_AMOUNT_ALL_PAYMENT)
            return false;

        if (!$paymentGroupItem->bankDetails || $paymentGroupItem->bankDetails->is_bank_valid == 0)
            return false;

        return true;
    }
    /**
     *the function remove activist payment in groups
     *function get activist payment key
     *function check if group without reference id
     *function remove activist payment, and create new masav without record, the function reset all activist role payment that connect
     *
     * @param string $activist_payment_key
     * @return void
     */
    public static function removeRecordActivistPayment($activist_payment_key)
    {

        try {
            $activistPaymentDetails = ['activist_payments.id as activist_payments_id', 'payment_group.id as payment_group_id', 'payment_group.reference_id', 'activist_payments.first_payment_id'];
            //check if group of activist payment is without reference id
            $activistPaymentDetails = ActivistPayment::select($activistPaymentDetails)->withPaymentGroup()->where('activist_payments.key', $activist_payment_key)->first();

            if (!is_null($activistPaymentDetails->reference_id))
                throw new Exception(config('errors.payments.ERROR_DELETE_ACTIVIST_PAYMENT'));

            //if is not recurring activist payment
            if (is_null($activistPaymentDetails->first_payment_id) || !$activistPaymentDetails->first_payment_id) {

                ActivistRolesPayments::where('activist_payment_id', $activistPaymentDetails->activist_payments_id)->update(['activist_payment_id' => null]);
                //delete record activist payment
                ActivistPayment::where('key', $activist_payment_key)->delete();
            } else {
                //update all ctivist role payment to error parent payment
                ActivistRolesPayments::where('activist_payment_id', $activistPaymentDetails->activist_payments_id)->update(['activist_payment_id' => $activistPaymentDetails->first_payment_id]);
                //not connect the activist payment to group
                ActivistPayment::where('key', $activist_payment_key)->update(['payment_group_id' => null]);
            }


            //create new masav file after remove activist payment record from group
            PaymentGroupCreator::createMasavFileForActivistPaymentGroup($activistPaymentDetails->payment_group_id);
        } catch (\Exception $e) {
            throw $e;
        }
    }



    //update payment id election role voter in activist payment  by key election role voter
    public static function updateElectionRoleGroupPaymentId($arrElectionRole, $paymentId)
    {

        $arrIdElectionRole = array_map(function ($activistRole) {
            return $activistRole->election_roles_by_voters_key;
        }, $arrElectionRole);
        $arr = ElectionRolesByVoters::whereIn('key', $arrIdElectionRole)->update(['payment_id' => $paymentId]);
    }


    public static function getListActivistPaymentByPaymentGroup($payment_group_id)
    {
        $arrFields = [
            DB::raw("concat(voters.first_name,' ',voters.last_name) as full_name"),
            'voters.personal_identity',
            Db::raw('activist_payments.*'),
            'reason_payment_status.name as reason_status_name',
            'payment_status.system_name as payment_status_system_name',
            'payment_status.name as payment_status_name',
            'bank_branches.branch_number',
            'bank_branches.name as branch_name',
            'bank_branches.bank_id',
            'banks.name as bank_name',
        ];


        $activistPayments = ActivistPayment::select($arrFields)
            ->withPaymentStatus()
            ->withReasonStatus()
            ->withVoter()
            ->withBankBranch()
            ->where('payment_group_id', $payment_group_id)
            ->orderBy('activist_payments.id') //order by is must!!! the order by help to know the index row in masav file
            ->get();

        foreach ($activistPayments as $key => $payment)
            $payment->index_in_group = $key + 1;

        return $activistPayments;
    }

    public static function updateActivistPaymentStatusByActivistId($arrActivistPaymentId, $paymentStatusSystemName)
    {
        try {
            DB::beginTransaction();
            // check if the user cancel wrong payment activist 
            if ($paymentStatusSystemName == EnumsPaymentStatus::STATUS_WAITE_CONFIRM && count($arrActivistPaymentId) == 1) {
                $activistPayment = ActivistPaymentRepository::getById($arrActivistPaymentId[0]);
                $lastStatusId = PaymentStatusRepository::getById($activistPayment->status_id);
                if ($lastStatusId->system_name == EnumsPaymentStatus::STATUS_INCORRECT) {
                    self::cancelWrongActivistPaymentStatus($activistPayment);
                }
            } else {
                $paymentStatusId = PaymentStatus::getBySystemName($paymentStatusSystemName);
                ActivistPayment::whereIn('id', $arrActivistPaymentId)->update(['status_id' => $paymentStatusId]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * cancel activist payment wrong status to waite pay
     * function check permission and delete the children payment of the wrong payment, only if all child parent not paid
     *
     * @param ActivistPayment $activistPayment
     * @return void
     */
    private static function cancelWrongActivistPaymentStatus($activistPayment)
    {

        if (AuthService::isMangePayment()) {
            //check if payment has children payment in paid
            if (ActivistPaymentRepository::CheckIfActivistPaymentHasChildrenInPaymentGroup($activistPayment->id)) {
                throw new Exception(config('errors.payments.ERROR_CANCEL_WRONG_PAYMENT_BY_CHILDREN'));
            }
            self::deleteChildPayment($activistPayment->id);
            $paymentStatusId = PaymentStatus::getBySystemName(EnumsPaymentStatus::STATUS_WAITE_CONFIRM);
            $activistPayment->status_id = $paymentStatusId;
            $activistPayment->reason_status_id = null;
            $activistPayment->comment = null;
            $activistPayment->save();
        } else
            throw new Exception(config('errors.system.ERROR_PERMISSION_MANAGE_PAYMENT'));
    }

    /**
     * Delete all children payment only if not paid
     * function update all role payment that connect  children payment to  parent activist payment before delete
     * @param int $parentActivistPaymentId
     * @return void
     */
    private static function deleteChildPayment($parentActivistPaymentId)
    {
        $paymentStatusId = PaymentStatus::getBySystemName(EnumsPaymentStatus::STATUS_WAITE_PAY);
        $activistRolePayments = ActivistRolesPaymentsRepository::getAllChildrenRolePaymentByParentPaymentId($parentActivistPaymentId);
        $activistRolePaymentsIds = $activistRolePayments->map(function ($activistRole) {
            return $activistRole->id;
        });
        
        ActivistRolesPayments::whereIn('id', $activistRolePaymentsIds)->update(['activist_payment_id' => $parentActivistPaymentId]);
        ActivistPayment::select()->where(function ($q) use ($parentActivistPaymentId) {
            $q->where('parent_payment_id', $parentActivistPaymentId)
                ->orWhere('first_payment_id', $parentActivistPaymentId);
        })
            ->where('status_id', $paymentStatusId)
            ->delete();
    }

}
