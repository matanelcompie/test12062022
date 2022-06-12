<?php

namespace App\Libraries\Services\ElectionRolesByVoters;

use App\Enums\CommonEnum;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistUpdateDto;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Repositories\TransportationCarsRepository;
use Carbon\Carbon;
use Exception;


class ElectionRoleByVoterUpdator
{
    const TAG = "ElectionRoleByVoterUpdator";

    private static $activistUpdate;

    public static function update(ActivistUpdateDto $activistUpdate)
    {

        self::$activistUpdate = $activistUpdate;
        if (self::$activistUpdate->electionRoleByVoter) {
            self::checkEditRoleVoterPermission($activistUpdate);

            if(is_null(self::$activistUpdate->isActivistRoleLock))
            self::checkIfTheRoleVoterIsLock();

            if (!is_null(self::$activistUpdate->phoneNumber))
                self::$activistUpdate->electionRoleByVoter->phone_number = self::$activistUpdate->phoneNumber;
            if (!is_null(self::$activistUpdate->comment))
                self::$activistUpdate->electionRoleByVoter->comment = self::$activistUpdate->comment;

            if (!is_null(self::$activistUpdate->instructed))
                self::$activistUpdate->electionRoleByVoter->instructed = self::$activistUpdate->instructed;
            if (!is_null(self::$activistUpdate->isActivistRoleLock)) {
                self::updateRoleLock(self::$activistUpdate->isActivistRoleLock);
            }
            if (!is_null(self::$activistUpdate->transportationCar)) {
                self::updateDriverDetailsTransportationCar();
            }

            if (self::$activistUpdate->electionRoleByVoter->isDirty()) {
                self::$activistUpdate->electionRoleByVoter->updated_by = AuthService::getUserId();
                self::$activistUpdate->electionRoleByVoter->save();
            }
        }

        return  self::$activistUpdate;
    }

    /**
     * check permission edit role voter details
     * @throws Exception
     * @param ActivistUpdateDto $activistUpdate
     * @return void
     */
    public static function checkEditRoleVoterPermission(ActivistUpdateDto $activistUpdate)
    {
        $roleSystemName = $activistUpdate->electionRoleByVoter->system_name;
        $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();
        $namePermission = 'elections.activists.' . $roleSystemName . '.edit';
        if (!isset($permissionsHash[$namePermission]))
            throw new Exception(config('errors.system.NO_PERMISSION'));
    }

    /**
     * @throws Exception
     * @return void
     */
    private static function checkIfTheRoleVoterIsLock()
    {
        $userLock = self::$activistUpdate->electionRoleByVoter->user_lock_id;
        if ($userLock && $userLock != null)
            throw new Exception(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
    }


    /**
     * Update status lock role voter
     * @throws Exception if the user dose not have permission
     * @param integer $isActivistRoleLock  CommonEnum
     * @return void
     */
    private static function updateRoleLock($isActivistRoleLock)
    {
        $roleSystemName = self::$activistUpdate->electionRoleByVoter->system_name;
        $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();
        $namePermission = 'elections.activists.' . $roleSystemName . '.lock';
        if (!isset($permissionsHash[$namePermission]))
            throw new Exception(config('errors.system.NO_PERMISSION'));

        $now = Carbon::now()->toDateTimeString();

        if ($isActivistRoleLock == CommonEnum::YES) { // Lock user
            self::$activistUpdate->electionRoleByVoter->user_lock_id = AuthService::getUserId();
            self::$activistUpdate->electionRoleByVoter->lock_date = $now;
        } else { // Unlock user
            self::$activistUpdate->electionRoleByVoter->user_lock_id = null;
            self::$activistUpdate->electionRoleByVoter->lock_date = null;
        }
    }


    private static function updateDriverDetailsTransportationCar()
    {
        TransportationCarsRepository::updateOrCreateIfNotExist(
            self::$activistUpdate->electionRoleByVoter->id,
            self::$activistUpdate->transportationCar->CarNumber,
            self::$activistUpdate->transportationCar->CarType,
            self::$activistUpdate->transportationCar->PassengerCount
        );
    }
}
