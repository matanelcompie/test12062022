<?php

namespace App\Repositories;

use App\Enums\PhoneType;
use App\Libraries\Helper;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use App\Models\UnknownVoters;
use App\Models\UserPhones;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UnknownVoterRepository
{
  /**
   * Insert unknown voter by array field
   *
   * @param array $unKnownVoterDetails
   * @return UnknownVoters
   */
  public static function insert(array $unKnownVoterDetails)
  {
    $unKnownVoter = new UnknownVoters();
    $unKnownVoter->fill($unKnownVoterDetails);
    $unKnownVoter->save();
    return $unKnownVoter;
  }


  /**
   * Insert unknown voter with address details by orm
   *
   * @param  $unKnownVoterOrm
   * @return UnknownVoters
   * @throws Exception if email is invalid
   */
  public static function insertByOrm($unKnownVoterOrm)
  {
    if ($unKnownVoterOrm->email != '' &&  !Helper::isValidEmail($unKnownVoterOrm->email)) {
      throw new Exception(config('errors.elections.INVALID_EMAIL'));
    }

    return self::insert(
      [
        'personal_identity' => $unKnownVoterOrm->personal_identity != "" ? $unKnownVoterOrm->personal_identity : null,
        'last_name' => $unKnownVoterOrm->last_name,
        'first_name' => $unKnownVoterOrm->first_name,
        'email' => $unKnownVoterOrm->email != '' ? $unKnownVoterOrm->email : null,
        'gender' => $unKnownVoterOrm->gender,
        'house' => $unKnownVoterOrm->house ? intval($unKnownVoterOrm->house) : null,
        'city_id' => $unKnownVoterOrm->city ? $unKnownVoterOrm->city->id : null,
        'street_id' => $unKnownVoterOrm->street ? $unKnownVoterOrm->street->id : null,
      ]
    );
  }
}
