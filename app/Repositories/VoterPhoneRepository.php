<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Enums\PhoneType;
use App\Libraries\Helper;
use App\Models\UnknownVoterPhone;
use App\Models\VoterPhone;
use Exception;
use Illuminate\Support\Facades\DB;
use Log;

class VoterPhoneRepository
{
  /**
   * insert voter phone number or update verified if exist
   *
   * @param string $phoneNumber
   * @param int $voterId
   * @param bool|false $exception whether to throw an error exception
   * @return VoterPhone
   */
  public static function updateVerifiedOrInsertIfNotExist($phoneNumber, $voterId, $exception = false)
  {
    $voterPhone = self::getVoterPhoneByVoterIdAndNumber($voterId, $phoneNumber);
    if ($voterPhone)
      return self::updateVerifiedVoterPhone($voterPhone);

    $voterPhone = new VoterPhone;
    $voterPhone->phone_number = Helper::removeAllNoneNumericCharacters($phoneNumber);
    $voterPhone->voter_id = $voterId;
    $voterPhone->key = Helper::getNewTableKey('voter_phones', VoterPhone::$lengthKey);
    $voterPhone->phone_type_id = self::getPhoneTypeByNumber($phoneNumber, $exception);
    $voterPhone->verified = CommonEnum::YES;
    $voterPhone->save();


    return $voterPhone;
  }

  /**
   * function get voter id and phone number , function return voter phone model or voter phone model array 
   */
  public static function getVoterPhoneByVoterIdAndNumber($voterId, $phoneNumber, $duplicate = false)
  {
    $phoneNumber = Helper::removeAllNoneNumericCharacters($phoneNumber);
    $phoneExist = VoterPhone::select()
      ->where('voter_id', $voterId)
      ->where('phone_number', DB::raw($phoneNumber))
      ->orderBy('id', 'DESC');

    if (!$duplicate)
      return $phoneExist->first();
    else
      return $phoneExist->get();
  }

  public static function updateVerifiedVoterPhone(VoterPhone $voterPhone)
  {
    $voterPhone->wrong = 0;
    $voterPhone->verified = 1;
    $voterPhone->deleted = 0;
    $voterPhone->updated_at = date("Y-m-d H:i:s");

    $voterPhone->save();

    return $voterPhone;
  }

  public static function getPhoneTypeByNumber($phoneNumber, $exception = false)
  {
    if (Helper::isIsraelMobilePhone($phoneNumber))
      return PhoneType::PHONE_TYPE_MOBILE;
    else if (Helper::isIsraelLandPhone($phoneNumber))
      return PhoneType::PHONE_TYPE_HOME;
    else
        if ($exception)
      throw new Exception(config('errors.elections.PHONE_TYPE_IS_NOT_VALID'));
    return false;
  }

  /**
   * check if phone number connect to voter in different house hold id
   * @return boolean
   */
  public static function isPhoneNumberBelongdifferentHouHoldVoter($phoneNumber, $voterId)
  {
    $voter = VotersRepository::getVoterById($voterId);
    $phoneNumber = Helper::removeAllNoneNumericCharacters($phoneNumber);
    $isBelong = VoterPhone::select()
      ->withVoters()
      ->where('voter_phones.phone_number', $phoneNumber)
      ->where('voters.household_id', '<>', $voter->household_id)
      ->where('wrong', DB::raw(0))
      ->first();

    return $isBelong ? true : false;
  }



  /**
   * get voter phone by id
   * @param int $id
   * @throws Exception
   * @return VoterPhone
   */
  public static function getById($id)
  {
    $phone = VoterPhone::where('id', $id)->first();
    if (!$phone)
      throw new Exception(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
    return $phone;
  }

  public static function deleteById($voterPhoneId)
  {
    $phone = self::getById($voterPhoneId);
    $phone->delete();
  }


  public static function validate($phoneNumber)
  {
    if (is_null($phoneNumber) || !is_numeric($phoneNumber))
      return false;

    if (!Helper::isIsraelMobilePhone($phoneNumber))
      return false;
    return true;
  }

  public static function validateAndThrowException($phoneNumber)
  {
    if (is_null($phoneNumber) || !is_numeric($phoneNumber))
      throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));

    if (!Helper::isIsraelMobilePhone($phoneNumber))
      throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));
  }


  public static function deleteVoterPhoneFromExcel()
  {
    $path = storage_path('app/votersPhone.csv');
    $file = fopen($path, "r");
    $i = 0;

    while ($data = fgetcsv($file)) {
      $phoneNumber = Helper::removeAllNoneNumericCharacters($data[0]);
      $voterId = Helper::removeAllNoneNumericCharacters($data[1]);
      $voterPhoneDuplicate = self::getVoterPhoneByVoterIdAndNumber($voterId, $phoneNumber, true);
      if ($voterPhoneDuplicate->count() == 0)
        Log::info('not find voter- ' . $voterId . ' : ' . $phoneNumber);
      else {
        foreach ($voterPhoneDuplicate as $key => $phone) {
          $phone->delete();
        }
        Log::info('delete- ' . $voterId . ' : ' . $phoneNumber);
      }
    }
  }


  public static function updateOrInsertUnknownPhone($unknownVoterId, $phoneNumber)
  {
    $phoneNumber = Helper::removeAllNoneNumericCharacters($phoneNumber);
    $unKnownVoterPhone = self::getByUnknownIdAndPhoneNumber($unknownVoterId, $phoneNumber);
    if (!$unKnownVoterPhone) {
      $unKnownVoterPhone = new UnknownVoterPhone();
      $unKnownVoterPhone->phone_type_id = self::getPhoneTypeByNumber($phoneNumber, false);
      $unKnownVoterPhone->unknown_voter_id = $unknownVoterId;
      $unKnownVoterPhone->phone_number = $phoneNumber;
      $unKnownVoterPhone->save();
    } else if ($unKnownVoterPhone->phone_number != $phoneNumber) {
      $unKnownVoterPhone->phone_type_id = self::getPhoneTypeByNumber($phoneNumber, false);
      $unKnownVoterPhone->phone_number = $phoneNumber;
      $unKnownVoterPhone->save();
    }
  }

  /**
   * Get unknownVoterId and phone number and return UnknownVoterPhone
   * @param int $unknownVoterId
   * @param string|int $phoneNumber
   * @return UnknownVoterPhone
   */
  public static function getByUnknownIdAndPhoneNumber($unknownVoterId, $phoneNumber)
  {
    return UnknownVoterPhone::select()->where('unknown_voter_id', $unknownVoterId)
      ->where('phone_number', DB::raw($phoneNumber))
      ->orderBy('id', 'DESC')
      ->get()
      ->first();
  }

  public static function getPhoneVoterByVoterId($voterId)
  {
    return VoterPhone::select()
      ->where('voter_id', DB::raw($voterId))
      ->orderBy('id', 'DESC')
      ->where('wrong', DB::raw(0))
      ->get()
      ->first();
  }

  public static function getPhoneVoterByUnknownVoterId($unknownVoterId)
  {
    return UnknownVoterPhone::select()
      ->where('unknown_voter_id', DB::raw($unknownVoterId))
      ->orderBy('id', 'DESC')
      ->get()
      ->first();
  }
}
