<?php

namespace App\Libraries\Services\Users;

use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\GeographicFiltersService;
use App\Libraries\Services\ServicesModel\RoleByUserService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionRolesByVoters;
use App\Models\UserRoles;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\RolesByUsersRepository;
use App\Repositories\UserRepository;
use Auth;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class UserCreator
{

    const TAG = "UserCreator";

    public static function getOrCreateUserByElectionRole($voterId, $ElectionRoleSystemName, $assignmentCityId)
    {
        try {
            $user = UserRepository::getOrCreate($voterId);
            $userRole = UserRoles::select()->where('system_name', $ElectionRoleSystemName)->first();
            $roleByUser = RolesByUsersRepository::getOrCreateUserRoleByUser($userRole->id, $user->id);

            $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
            //add city Geographic permission for user role
            GeographicFiltersService::addGeographicFiltersService($user->id, $userRole, $roleByUser->id, $entityType, $assignmentCityId);
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
