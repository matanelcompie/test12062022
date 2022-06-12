<?php

namespace App\Libraries\Services\UserLogin;


use Auth;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public static function getUserVoterId()
    {
        return Auth::user()->voter_id;
    }

    public static function getUserId()
    {
        return Auth::user()->id;
    }

    public static function isAdmin()
    {
        return Auth::user()->admin ? true : false;
    }

    public static function isMangePayment()
    {
        return Auth::user()->cancel_payment ? true : false;
    }

    public static function getHashPermissionByAuthUser()
    {
        $user = Auth::user();
        $permissions = $user->permissions($user->id);
        $permissionsHash = [];
        for ($index = 0; $index < count($permissions); $index++) {
            $permissionName = $permissions[$index]->operation_name;
            $permissionsHash[$permissionName] = 1;
        }
        return $permissionsHash;
    }

    /**
     * function get name permission and return boolean if the user has permission
     *
     * @param string $namePermission
     * @return boolean
     */
    public static function isUserHasPermission(string $namePermission)
    {
        $allUserPermission = self::getHashPermissionByAuthUser();
        if (!isset($allUserPermission[$namePermission]))
            return false;

        return true;
    }
}
