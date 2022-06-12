<?php

namespace App\Repositories;

use App\Enums\GeographicEntityType;
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
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class CityRepository
{
   /**
    * @throws Exception
    * @return City
    */
   public static function getCityByKey($key)
   {
      $city = City::select()->where('key', $key)->first();
      if (!$city)
         throw new Exception(config('errors.elections.INVALID_CITY'));

      return $city;
   }

   /**
    * @throws Exception
    * @return City
    */
   public static function getById($id)
   {
      $city = City::select()->where('id', $id)->first();
      if (!$city)
         throw new Exception(config('errors.elections.INVALID_CITY'));

      return $city;
   }

   /**
    * @throws Exception
    * @return City
    */
   public static function getByMiId($miId, $exception = true)
   {
      $city = City::select()->where('mi_id', intval($miId))->first();
      if (!$city && $exception)
         throw new Exception(config('errors.elections.INVALID_CITY'));

      return $city;
   }

   /**
    * function get GeographicEntityType enum type and entity value
    * Return array city in GeographicEntityType details
    * @param int $GeographicEntityType | GeographicEntityType enum
    * @param int $GeographicEntityValue
    * @return array
    */
   public static function getArrCityIdByGeographicTypeAndValue($GeographicEntityType, $GeographicEntityValue)
   {
      $cities = [];
      switch ($GeographicEntityType) {
         case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP:
            $citiesList = City::select('cities.id')->withAreas()->where('areas_group_id', $GeographicEntityValue)->get();
            break;
         case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA:
            $citiesList = City::select('cities.id')->where('area_id', $GeographicEntityValue)->get();
            break;
         case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_SUB_AREA:
            $citiesList = City::select('cities.id')->where('sub_area_id', $GeographicEntityValue)->get();
            break;
      }
      if ($citiesList) {
         foreach ($citiesList as $c) {
            $cities[] = $c->id;
         }
      }
      return $cities;
   }

   public static function getNameAndIdCityList()
   {
      return  City::select(['id', 'name'])->get();
   }
}
