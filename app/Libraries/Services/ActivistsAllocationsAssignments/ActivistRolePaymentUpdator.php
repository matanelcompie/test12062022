<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Enums\CommonEnum;
use App\Http\Requests\ActivistRolePaymentRequest;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\ElectionRoleShiftService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistRolePaymentUpdator
{
    const TAG = "ActivistRolePaymentUpdator";

    private static $activistRolePayment;
    public static function update(ActivistRolePaymentRequest $activistRolePaymentRequest)
    {

        self::$activistRolePayment = ActivistRolesPaymentsRepository::getById($activistRolePaymentRequest->id);
        if (self::$activistRolePayment) {

            self::checkIsValidUpdateSumPaymentByUser(self::$activistRolePayment);

            if (!is_null(self::$activistRolePayment->activist_payment_id))
                throw new Exception(config('errors.payments.START_PAYMENT_ERROR_UPDATE_PAYMENT_IS'));

            if (!is_null($activistRolePaymentRequest->comment)) {
                self::$activistRolePayment->comment = $activistRolePaymentRequest->comment;
            }

            if (!is_null($activistRolePaymentRequest->sum)) {
                self::$activistRolePayment->sum = $activistRolePaymentRequest->sum;
            }

            if (!is_null($activistRolePaymentRequest->not_for_payment)) {
                self::$activistRolePayment->not_for_payment = $activistRolePaymentRequest->not_for_payment;
            }


            if (!is_null($activistRolePaymentRequest->user_lock_id)) {
                self::updateRolesPaymentLockById($activistRolePaymentRequest->user_lock_id);
            }



            if (self::$activistRolePayment->isDirty()) {
                self::$activistRolePayment->updated_by = AuthService::getUserId();
                self::$activistRolePayment->save();
            }
        }

        return  self::$activistRolePayment;
    }

    /**
     * Update sum by ActivistUpdateDto
     *
     * @param ActivistUpdateDto $activistUpdateDto
     * @return ActivistUpdateDto
     */
    public static function updateSumPaymentByActivistUpdateDto(ActivistUpdateDto $activistUpdateDto)
    {
        if ($activistUpdateDto->activistRolesPayment) {
            self::$activistRolePayment = $activistUpdateDto->activistRolesPayment;
            self::checkIsValidUpdateSumPaymentByUser(self::$activistRolePayment);

            if (!is_null($activistUpdateDto->sum)) {
                self::$activistRolePayment->sum = $activistUpdateDto->sum;
            }

            if (self::$activistRolePayment->isDirty()) {
                self::$activistRolePayment->updated_by = AuthService::getUserId();
                self::$activistRolePayment->save();
            }

            $activistUpdateDto->activistRolesPayment = self::$activistRolePayment;
        }

        return $activistUpdateDto;
    }

    /**
     * Update status lock payment role 
     * @throws Exception if the user dose not have permission
     * @param integer $activistUpdateDto->activistRolesPaymentId
     * @param integer $isPaymentLock 
     * @return void
     */
    private static function updateRolesPaymentLockById($user_lock_id)
    {
        $roleSystemName = ActivistRolesPaymentsRepository::getSystemRoleNameByPaymentRoleId(self::$activistRolePayment->id);
        $namePermission = 'elections.activists.' . $roleSystemName . '.lock';
        if (!AuthService::isUserHasPermission($namePermission))
            throw new Exception(config('errors.system.NO_PERMISSION'));

        $now = Carbon::now()->toDateTimeString();
        if (self::$activistRolePayment->activist_payment_id)
            throw new Exception("Error Processing Request", 1);

        if (is_null($user_lock_id) || $user_lock_id == 0 || $user_lock_id == '') { // Unlock user
            self::$activistRolePayment->user_lock_id = null;
            self::$activistRolePayment->lock_date = null;
        } else {
            self::$activistRolePayment->user_lock_id = AuthService::getUserId();
            self::$activistRolePayment->lock_date = $now;
        }
    }

    public static function getElectionRoleSystemNameUserCanNotUpdateSum()
    {
        return [
            config('constants.activists.election_role_system_names.ballotMember'),
        ];
    }

    /**
     *  function check if is valid update sum payment
     *  user admin can update all role type activist
     *  user with permission update sum can not update all type role activist
     *  function check the type role activist of payment role
     * @param ActivistRolesPayments $activistRolePayment
     * @throws Exception
     */

    public static function checkIsValidUpdateSumPaymentByUser(ActivistRolesPayments $activistRolePayment)
    {
        if (!UserPermissionManager::isAdminUser()) {
            $roleSystemName = ActivistRolesPaymentsRepository::getSystemRoleNameByPaymentRoleId($activistRolePayment->id);
            $namePermission = 'elections.activists.' . $roleSystemName . '.sum_edit';
            if (!AuthService::isUserHasPermission($namePermission))
                throw new Exception(config('errors.payments.ERROR_NOT_PERMISSION_UPDATE_SUM'));

            $roleCanNotUpdateSum = ActivistRolePaymentUpdator::getElectionRoleSystemNameUserCanNotUpdateSum();

            if (in_array($roleSystemName, $roleCanNotUpdateSum))
                throw new Exception(config('errors.payments.ERROR_UPDATE_SUM_IN_UN_EDIT_ROLE_PAYMENT'));
        }
    }
}
