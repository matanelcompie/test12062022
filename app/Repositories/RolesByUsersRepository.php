<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\RolesByUsers;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\Votes;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class RolesByUsersRepository
{

    public static function getRoleByUserByRoleSystemName($userId, $roleSystemName)
    {
        $roleByUser = RolesByUsers::select(DB::raw('roles_by_users.*'))
            ->join('user_roles', 'user_roles.id', 'roles_by_users.user_role_id')
            ->where('user_roles.system_name', $roleSystemName)
            ->where('roles_by_users.user_id', $userId)
            ->where('roles_by_users.deleted', 0)
            ->first();

        return  $roleByUser;
    }

    public static function getOrCreateUserRoleByUser($userRoleId, $activistUserId)
    {
        $RoleByUser = self::getByUserAndUserRole($activistUserId, $userRoleId);

        if (!$RoleByUser) {
            $RoleByUser = new RolesByUsers();
            $RoleByUser->user_id =  $activistUserId;
            $RoleByUser->user_role_id = $userRoleId;
            $RoleByUser->from_date = Carbon::now();
            $RoleByUser->save();
        }

        return $RoleByUser;
    }

    public static function getByUserAndUserRole($userId, $userRoleId)
    {
        return RolesByUsers::select(DB::raw('roles_by_users.*'))
        ->join('user_roles', 'user_roles.id', 'roles_by_users.user_role_id')
        ->where('user_roles.id', $userRoleId)
            ->where('roles_by_users.user_id', $userId)
            ->first();
    }

    public static function deleteIfNotExistGeoFilter($roleByUserId)
    {
        if (GeographicFiltersRepository::countGeoFilterOfRoleByUser($roleByUserId) == 0) {
            RolesByUsers::select()
                ->where('id', $roleByUserId)
                ->delete();
        }
    }

    public static function getUsersByRoles($teams = null, $moduleSystemName = null, $onlyActiveUser = false,$specificFields=false)
    {
        $selectFields = [
            'user_id as id',
            'teams.key as team_key',
            'users.key as key',
            'voter_id',
            'voters.first_name',
            'voters.last_name',
            'voters.personal_identity',
            DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS name'),
        ];
        $usersQuery = RolesByUsers::select($specificFields?$specificFields:$selectFields)
            ->withTeamMates()
            ->withUserRoleOnly()
            ->leftJoin('modules', 'modules.id', '=', 'user_roles.module_id')
            ->where('from_date', '<=', Carbon::now())
            ->where('roles_by_users.deleted', '=', 0)
            ->where(function ($query1) {
                $query1->whereNull('to_date')
                ->orWhere('to_date', '>=', Carbon::now()
                    ->addDays(-1));
            })->where('users.deleted', 0);

        if ($teams) $usersQuery->whereIn('teams.id', $teams);
        if ($moduleSystemName) {
            $usersQuery->where('modules.system_name', $moduleSystemName);
        }
        if ($onlyActiveUser) {
            $usersQuery->where('users.active', 1);
        }
        //  Log::info( $usersQuery->toSql());
        //  Log::info( $usersQuery->getBindings());
        return $usersQuery->get();
    }

    
}
