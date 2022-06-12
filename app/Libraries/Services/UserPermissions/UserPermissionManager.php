<?php

namespace App\Libraries\Services\UserPermissions;

use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use Auth;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class UserPermissionManager
{

    const TAG = "UserPermissionManager";
    /**
     * @method
     */
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

    public static function isAdminUser()
    {
        return Auth::user()->admin === 1;
    }
}
