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
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\VotersRepository as RepositoriesVotersRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class VotersRepository
{
  public static function updateEmail($voterId, $email)
  {
    if (!is_null($email) && !Helper::validateEmail($email))
      throw new Exception(config('errors.elections.INVALID_EMAIL'));
    $voter = self::getVoterById($voterId);

    if ($voter->email != $email) {
      $voter->email = $email;
      $voter->save();
    }
  }

  public static function getVoterById($voterId)
  {
    $voter = Voters::select()->where('id', $voterId)->first();
    if (!$voter)
      throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));

    return $voter;
  }

  public static function getVoterByKey($key)
  {
    $voter = Voters::select()->where('key', $key)->first();
    if (!$voter)
      throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    return $voter;
  }

  public static function getVoterByKeyWithFilter($key)
  {
    $voter = Voters::select(DB::raw('voters.*'))->withFilters()->where('voters.key', $key)->first();
    if (!$voter)
      throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    return $voter;
  }

  public static function getVoterByPersonalIdentity($personalIdentity, $throwException = true)
  {
    $personalIdentity = Helper::trimStartZero($personalIdentity);
    $voter = Voters::select()->where('personal_identity', $personalIdentity)->first();
    if (!$voter && $throwException)
      throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    return $voter;
  }

  public static function getVoterByUserId(int $userId)
  {
    $user = UserRepository::getById($userId);
    return self::getVoterById($user->voter_id);
  }

  /**
   * function return if the user have permission for specific voter
   *
   * @param string $voterKey
   * @return boolean
   */
  public static function isValidAuthPermissionToSpecificVoter($voterId)
  {
    $voter = Voters::withFilters()->where('voters.id', DB::raw($voterId))->first();
    return $voter ? true : false;
  }


  public static function getFieldNameQueryVoterOrUnknownVoter()
  {
    return collect([
      DB::raw('voters.key as voter_key'),
      DB::raw('voters.id as voter_id'),
      'requests.unknown_voter_id',
      DB::raw('CASE WHEN voters.id is not null then voters.first_name else unknown_voters.first_name end as first_name '),
      DB::raw('CASE WHEN voters.id is not null then voters.last_name else unknown_voters.last_name end as last_name '),
      DB::raw("CASE WHEN voters.id is not null then concat(voters.first_name,' ',voters.last_name)   else concat(unknown_voters.first_name,' ',unknown_voters.last_name) end as full_name "),
      DB::raw('CASE WHEN voters.id is not null then voters.email else unknown_voters.email end as  email'),
      DB::raw('CASE WHEN voters.id is not null then voters.personal_identity else unknown_voters.personal_identity end as personal_identity'),
      DB::raw('CASE WHEN voters.id is not null then voters.gender else unknown_voters.gender end as gender'),
    ]);
  }

  public static function getFieldNameQueryVoterOrUnknownVoterAddress()
  {
    return collect([
      DB::raw('CASE WHEN voters.id is not null then voters.city_id else unknown_voters.city_id end as city_id'),
      DB::raw('CASE WHEN voters.id is not null then voters_city.name else unknown_voters_city.name end as city_name'),
      DB::raw('CASE WHEN voters.id is not null then voters.street_id else unknown_voters.street_id end as street_id'),
      DB::raw('CASE WHEN voters.id is not null then voter_street.name else unknown_voter_street.name end as street_name'),
      DB::raw('CASE WHEN voters.id is not null then voters.house else unknown_voters.house end as house'),
    ]);
  }

  public static function getVoterDetailsOrmWithFilterByPersonalIdentity($personalIdentity)
  {
    $voter = Voters::select([
      'voters.key as voter_key',
      'first_name',
      'last_name',
      DB::raw("concat(first_name,' ' ,last_name) as full_name"),
      'email',
      'personal_identity',
      'gender',
      'voters.city_id',
      'cities.name as city_name',
      'street_id',
      'streets.name as street_name',
      'house'
    ])
      ->withFilters()
      ->leftJoin('cities', 'cities.id', '=', 'voters.city_id')
      ->leftJoin('streets', 'streets.id', '=', 'voters.street_id')
      ->where('voters.personal_identity', $personalIdentity)
      ->get()
      ->first();

    return $voter ? self::transformerVoterOrm($voter) : false;
  }

  public static function transformerVoterOrm($voter)
  {
    return [
      'personal_identity' => $voter->personal_identity,
      'voter_key' => $voter->voter_key,
      'unknown_voter_id' => null,
      'first_name' => $voter->first_name,
      'last_name' => $voter->last_name,
      'gender' => $voter->gender,
      'email' => $voter->email,
      'city' => [
        'id' => $voter->city_id,
        'name' => $voter->city_name,
      ],
      'street' => [
        'id' => $voter->street_id,
        'name' => $voter->street_name,
      ],
      'house' => $voter->house,
    ];
  }


  /**
   * get old voter modal and voter orm for update details include address
   * checks if the fields are empty and only then updates.Because there is a possibility of receiving blank data.
   * @param Voters $voterOld
   * @param  $voter orm
   * @return Voters
   */
  public static function updateVoterIncludeComparisonOldVoter(Voters $voterOld, $voter)
  {
    if ($voter->email && $voter->email != '') {
      $valid = Helper::isValidEmail($voter->email);
      if (!$valid) {
        throw new Exception(config('errors.elections.INVALID_EMAIL'));
      }
      $voterOld->email = $voter->email;
    }

    if ($voter->gender && $voter->gender != '') {
      $voterOld->gender = $voter->gender;
    }

    if ($voter->house && $voter->house != '') {
      $voterOld->house = $voter->house;
    }

    if ($voter->city && $voter->city->id &&  $voter->city->id != '' &&  $voter->city->id != $voterOld->city_id) {
      $voterOld->city_id = $voter->city->id;
      $voterOld->street_id = null;
    }

    if ($voter->street) {
      if ($voter->street->id && $voter->street->id != '') {
        if ($voterOld->street_id != $voter->street->id) {
          $voterOld->street_id = $voter->street->id;
        }
      } else if ($voter->street->name && $voter->street->name != '') {
        $street = StreetRepository::getStreetByCityIdAndName($voterOld->city_id, $voter->street->name);
        if ($street &&  $street->id != $voterOld->street_id) {
          $voterOld->street_id = $street->id;
        }
      }
    }

    if ($voterOld->isDirty()) {
      $voterOld->save();
    }

    return $voterOld;
  }
}
