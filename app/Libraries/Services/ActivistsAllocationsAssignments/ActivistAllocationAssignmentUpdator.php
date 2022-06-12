<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Enums\CommonEnum;
use App\Enums\ElectionRoleShiftSystemName;
use App\Enums\ElectionRoleSystemName;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\ElectionRoleShiftService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRoleShiftsBudgetRepository;
use App\Repositories\ElectionRolesRepository;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistAllocationAssignmentUpdator
{
    const TAG = "ActivistAllocationAssignmentUpdator";
    private static $activistUpdate;

    public static function update(ActivistUpdateDto $activistUpdate)
    {
        self::$activistUpdate = $activistUpdate;
        if (self::$activistUpdate->activistAllocationAssignment) {
            self::checkEditAssignmentPermission($activistUpdate);


            if (!is_null(self::$activistUpdate->appointmentLetter)) {
                $activistUpdate->activistAllocationAssignment->appointment_letter = self::$activistUpdate->appointmentLetter;
            }

            if (!is_null(self::$activistUpdate->notCheckLocation)) {
                $activistUpdate->activistAllocationAssignment->not_check_location = self::$activistUpdate->notCheckLocation;
            }

            if (!is_null(self::$activistUpdate->shiftRole)) {
                self::checkIfTheRoleVoterIsLock();
                self::checkIfPaymentRoleIsLock();
                self::updateShiftRoleAndSumDefaultBudget(self::$activistUpdate);
            }

            if (self::$activistUpdate->activistAllocationAssignment->isDirty()) {
                self::$activistUpdate->activistAllocationAssignment->save();
            }
        }

        return self::$activistUpdate;
    }

    /**
     * check permission edit assignment details
     * @throws Exception
     * @param ActivistUpdateDto $activistUpdate
     * @return void
     */
    public static function checkEditAssignmentPermission(ActivistUpdateDto $activistUpdate)
    {
        $roleSystemName = ActivistsAllocationsAssignmentsRepository::getSystemNameByAssignmentId(
            $activistUpdate->activistAllocationAssignment->id
        );
        $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();
        $namePermission = 'elections.activists.' . $roleSystemName . '.edit';
        if (!isset($permissionsHash[$namePermission]))
            throw new Exception(config('errors.elections.ERROR_PERMISSION_UPDATE_ACTIVIST'));
    }

    /**
     * @throws Exception
     * @return void
     */
    private static function checkIfTheRoleVoterIsLock()
    {
        $userLock = self::$activistUpdate->activistAllocationAssignment->electionRoleByVoter->user_lock_id;
        if ($userLock && $userLock != null)
            throw new Exception(config('errors.payments.ERROR_PAYMENT_IS_LOCK'));
    }


    /**
     * @throws  Exception if payment role is lock
     */
    private static function checkIfPaymentRoleIsLock()
    {
        if (!self::$activistUpdate->activistRolesPayment) {
            self::$activistUpdate->activistRolesPayment = ActivistRolesPaymentsRepository::getBasicActivistRolePaymentByAssignment(
                self::$activistUpdate->activistAllocationAssignment
            );

            if (self::$activistUpdate->activistRolesPayment->user_lock_id && self::$activistUpdate->activistRolesPayment->user_lock_id != null)
                throw new Exception(config('errors.payments.ERROR_PAYMENT_IS_LOCK'));
        }
    }



    /**
     * Update shift role , and update default sum budget only if the user not insert sum 
     * function check the type election role for update sum
     * the user can update sum for ballot role only for counter and motivator active 
     * 
     * @return void
     */
    private static function updateShiftRoleAndSumDefaultBudget()
    {

        $electionRole = ActivistsAllocationsAssignmentsRepository::getElectionRoleByAssignmentId(
            self::$activistUpdate->activistAllocationAssignment->id
        );

        $shiftRole = self::$activistUpdate->shiftRole;

        if ($electionRole->system_name == ElectionRoleSystemName::COUNTER && $shiftRole->system_name != ElectionRoleShiftSystemName::COUNT)
            throw new Exception(config('errors.elections.ERROR_SHIFT_FOR_COUNTER_ACTIVIST'));

        //check is free allocation
        if (ActivistsAllocationsAssignmentsRepository::isFreeAllocationBallotShiftRole(self::$activistUpdate->activistAllocationAssignment, $shiftRole)) {
            self::$activistUpdate->activistAllocationAssignment->election_role_shift_id = $shiftRole->id;

            $defaultBudgetSum = ElectionRoleShiftsBudgetRepository::getShiftRoleBudget(
                $electionRole->id,
                $shiftRole->id
            );
            if (!self::$activistUpdate->sum || ($defaultBudgetSum == self::$activistUpdate->sum)) {
                self::$activistUpdate->sum = $defaultBudgetSum;
            }
        }
    }
}
