<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;
use Illuminate\Auth\EloquentUserProvider as EloquentUserProvider;
//use App\Models\User;
use Carbon\Carbon;
use DB;
use Exception;

use stdClass;

class UserRepository
{
  // Define user for municipal activists:
  public static function getOrCreate($voterId, $userCreated = null)
  {
    $activistUser = self::getByVoterId($voterId);

    if (!$activistUser) {
      $activistUser = new User();
      $activistUser->key = Helper::getNewTableKey('users');
      $activistUser->voter_id = $voterId;
      $activistUser->password = Helper::generateRandomString(40);
      $activistUser->email = 'fake_email.shas.co.il';
      $activistUser->user_create_id = is_null($userCreated) ? AuthService::getUserId() : $userCreated;
      $activistUser->active = CommonEnum::NO;
      $activistUser->save();
    }

    return $activistUser;
  }

  public static function getByVoterId($voterId)
  {
    return User::select()
      ->where('voter_id', $voterId)
      ->first();
  }

  public static function getById($userId)
  {
    return User::select()
      ->where('id', $userId)
      ->first();
  }

  public static function getByIdWithVoter($userId)
  {

    try {
      return User::select('users.*', 'voters.first_name as P_N', 'voters.last_name as F_N')
        ->withVoter()
        ->where('users.id', $userId)
        ->first();
    } catch (\Throwable $e) {
      var_dump(User::select()
        ->withVoter()
        ->where('users.id', $userId)->toSql(), $userId);
      throw $e;
    }
  }
  public static function updateIsViewAllVoter($user, $isViewAllVoters)
  {
    $user->is_view_all_voters = $isViewAllVoters;
    $user->save();
  }

  public static function getUserCanEnterToWebSiteByPasswordAndPersonalIdentity($personalIdentity)
  {
    $activeCampaignStatus = config('tmConstants.campaign.statusNameToConst.ACTIVE');

    $user = User::where('deleted', 0)
      ->whereHas("voter", function ($query) use ($personalIdentity) {
        $query->where('personal_identity', 'like', $personalIdentity);
      })
      ->where(function ($query) {
        $query->whereDoesntHave('userAllowedIps')
          ->OrWhereHas('userAllowedIps', function ($query2) {
            $query2->where('ip', request()->ip());
          });
      })
      ->where(function ($query) use ($activeCampaignStatus) {
        $query->whereHas("rolesByUsers", function ($q) {
          $q->where('from_date', '<=', Carbon::now())->where('deleted', '=', 0)->where(function ($q1) {
            $q1->whereNull('to_date')->orWhere('to_date', '>=', Carbon::now()->addDays(-1));
          });
        })
          ->orWhereHas("campaigns", function ($q) use ($activeCampaignStatus) {
            $q->where([
              'campaigns.status' => $activeCampaignStatus, 'campaigns.deleted' => 0,
              'users_in_campaigns.active' => 1
            ]);
          });
      })
      ->first();
    return $user;
  }

  /**
   * get user by key and sms code enter
   *
   * @param string $userKey
   * @param string $smsCode
   * @return User
   */
  public static function getUserBySmsCodeEnterAndUserKey($userKey, $smsCode)
  {
    return User::where('key', $userKey)->where('sms_code', $smsCode)->first();
  }

  public static function getUserNameAndMainRoleTeamId($userId)
  {

    return User::select(
      [
        DB::raw("concat(voters.first_name,' ' ,voters.last_name) as user_name"),
        'users.id',
        'roles_by_users.team_id as user_team_id',
        'teams.name as user_team_name'
      ]
    )
      ->withVoter()
      ->leftJoin('roles_by_users', function ($q) {
        $q->on(
          'roles_by_users.user_id',
          '=',
          'users.id'
        )
          ->on('roles_by_users.main', '=', DB::raw(1));
      })
      ->leftJoin('teams', 'teams.id', 'roles_by_users.team_id')
      ->where('users.id', $userId)
      ->first();
  }

  public static function getUserListByUserTeamLeader(int $userId)
  {
    return User::select('users.id')
      ->distinct()
      ->withRolesAndTeams()
      ->where(
        'roles_by_users.from_date',
        '<=',
        Carbon::now()
      )->where('roles_by_users.deleted', '=', 0)->where(function ($query1) {
        $query1->whereNull('roles_by_users.to_date')->orWhere('roles_by_users.to_date', '>=', Carbon::now()->addDays(-1));
      })
      ->where('teams.leader_id', $userId)
      ->where('users.deleted', 0)
      ->where('users.active', 1)->get();
  }
}
