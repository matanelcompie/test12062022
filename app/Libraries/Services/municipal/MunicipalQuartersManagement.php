<?php

namespace App\Libraries\Services\municipal;

use App\Enums\GeographicEntityType;
use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsTasksSchedule;
use App\Models\Area;
use App\Models\AreasGroup;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\Quarter;
use App\Models\SubArea;
use App\Models\Voters;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class MunicipalQuartersManagement
{

  public static function getDetailsEntity($entityType)
  {
    $details = new stdClass();
    $table = null;
    $txtLevel = '';
    $parentEntityType = null;
    switch ($entityType) {
      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP:
        $txtLevel = 'ארצית';
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA:
        $table = "areas";
        $txtLevel = 'אזור';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP;
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_SUB_AREA:
        $table = "sub_areas";
        $txtLevel = 'תת אזור';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_AREA;
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY:
        $table = "cities";
        $txtLevel = 'עיר';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_SUB_AREA;
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER:
        $table = 'clusters';
        $txtLevel = 'אשכול';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY;
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER:
        $table = 'quarters';
        $txtLevel = 'רובע';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY;
        break;

      case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX:
        $table = 'ballot_boxes';
        $txtLevel = 'קלפי';
        $parentEntityType = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER;
    }

    $details->table = $table;
    $details->txtLevel = $txtLevel;
    $details->parentEntityType = $parentEntityType;

    return $details;
  }

  public static  function getTitleByEntityGeo($entityTypeGeo, $arrEntityGeoValueKey)
  {

    $details = self::getDetailsEntity($entityTypeGeo);
    $title = $details->txtLevel;
    $txtValue = '';
    if ($details->table) {
      $recordGeo = DB::table($details->table)
        ->whereIn('key', $arrEntityGeoValueKey)
        ->get();


      foreach ($recordGeo as $key => $entity) {
        $txtValue = $txtValue . '/' . $entity->name;
      }

      if ($txtValue != '')
        $title = $title . '-' . $txtValue;

      return $title;
    }
  }
}
