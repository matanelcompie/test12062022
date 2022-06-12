<?php

namespace App\Repositories;

use App\DTO\TeamRequestDetailsDto;
use App\Enums\CommonEnum;
use App\Enums\ModulesSystemName;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\RolesByUsers;
use App\Models\Teams;
use App\Models\User;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class TeamRepository
{

    public static function getById($teamId)
    {
        $team = Teams::select(DB::raw('teams.*'))
            ->where('id', $teamId)
            ->first();
        if (!$team)
            throw new Exception(config('errors.system.TEAM_NOT_EXISTS'));

        return $team;
    }

    public static function getByKey($teamKey)
    {
        $team = Teams::select(DB::raw('teams.*'))
        ->where('key', $teamKey)
            ->first();
        if (!$team)
            throw new Exception(config('errors.system.TEAM_NOT_EXISTS'));

        return $team;
    }

    /**
     * 
     *
     * @param TeamRequestDetailsDto $teamRequestDetails
     * @return Teams
     */
    public static function updateTeamRequestDetails(TeamRequestDetailsDto $teamRequestDetails)
    {
        $team = self::getByKey($teamRequestDetails->team_key);
        $team->title = $teamRequestDetails->title;
        $team->phone_number = $teamRequestDetails->phone_number;
        $team->signature = $teamRequestDetails->signature;

        $team->save();

        return $team;
    }

    public static function getAll($arrFieldName = false)
    {
        return Teams::select($arrFieldName ? $arrFieldName : DB::raw('teams.*'))->get();
    }

    public static function getUserLeaderIdAndNameById($teamId)
    {
        return Teams::select(['users.id', DB::raw("concat(voters.first_name,' ',voters.last_name) as name")])
        ->leftJoin('users', 'users.id', '=', 'teams.leader_id')
        ->leftJoin('voters', 'voters.id', '=', 'users.voter_id')
        ->where('id', $teamId)
            ->get()
            ->first();
    }

    public static function getDefaultTeamCrmRequestIncludeUserLeaderDetailsById()
    {
        $default = Teams::select([
            'teams.id',
            'teams.name',
            DB::raw('users.id as user_leader_id'),
            DB::raw("concat(voters.first_name,' ',voters.last_name) as user_leader_name")
        ])
            ->leftJoin('users', 'users.id', '=', 'teams.leader_id')
            ->leftJoin('voters', 'voters.id', '=', 'users.voter_id')
            ->where('crm_center', 1)
            ->get()
            ->first();

        return
            [
                'team' => ['id' => $default->id, 'name' => $default->name],
                'user_handler' => ['id' => $default->user_leader_id, 'name' => $default->user_leader_name]
            ];
    }


  public static function getUsersCrmRequestTeamByTeamId($teamId, $onlyActiveUser = false)
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
    $usersQuery = RolesByUsers::select($selectFields)
    ->withTeamMates()
    ->withUserRoleOnly()
    ->leftJoin('modules', 'modules.id', '=', 'user_roles.module_id')
    ->where('from_date', '<=', Carbon::now())
    ->where('roles_by_users.deleted', '=', 0)
    ->where(function ($query1) {
      $query1->whereNull('to_date')
      ->orWhere('to_date', '>=', Carbon::now()
        ->addDays(-1));
    })->where('users.deleted', 0)
    ->where('teams.id', $teamId)
    ->where('modules.system_name', ModulesSystemName::REQUEST);

    if ($onlyActiveUser) {
      $usersQuery->where('users.active', 1);
    }

    return $usersQuery->get();
  }
    
}
