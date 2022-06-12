<?php

namespace App\Repositories;

use App\Models\GeographicFilters;
use App\Models\UserRoles;



class GeographicFiltersRepository
{
    /**
     * delete geographic filters of activist by specific role in city
     * @return void
     */
    public static function deleteByElectionRole($userId, $electionRoleSystemName, $cityId)
    {
        $userRole = UserRoles::select()->where('system_name', $electionRoleSystemName)->first();
        $roleByUser = RolesByUsersRepository::getByUserAndUserRole($userId, $userRole->id);

        $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
        GeographicFilters::select()
            ->where('role_by_user_id', $roleByUser->id)
            ->where('entity_type', $entityType)
            ->where('entity_id', $cityId)
            ->delete();

        RolesByUsersRepository::deleteIfNotExistGeoFilter($roleByUser->id);
    }

    public static function countGeoFilterOfRoleByUser($roleByUserId)
    {
        return GeographicFilters::select()
            ->where('role_by_user_id', $roleByUserId)
            ->get()
            ->count();
    }
}
