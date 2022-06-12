<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsTasksSchedule;
use App\Models\Area;
use App\Models\AreasGroup;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Quarter;
use App\Models\SubArea;
use App\Models\Voters;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class MunicipalQuartersService {


    //function that return entity type parent city/area/sub_area... and children with present details voter 
    public static function getMunicipalEntityActivistsSummery($entityType, $entityId,$city_filter){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
       
        //object that menage item in tree
        $entityFullData =self::getMunicipalEntitiesQuartesByType($entityType, $entityId,'quarters.dashboard',$electionCampaignId,$city_filter);
        $currentEntity = $entityFullData->currentEntity;
        $parentEntityType = $entityFullData->parentEntityType;
        $subEntities = $entityFullData->subEntities;
        $subEntityType = $entityFullData->subEntityType;


        $EntitySummary = new stdClass();
        $subEntitiesSummary = [];

        if($currentEntity){
             $summery = self::getPresentsDetailsByTypeEntityCategory($entityType, [$currentEntity->id], $electionCampaignId);
           
            $summery=$summery[$currentEntity->id];
            $EntitySummary->parent_entity_id = $currentEntity->parent_entity_id;
            $EntitySummary->parent_entity_type = $parentEntityType;
            $EntitySummary->entity_id=$currentEntity->id;
            $EntitySummary->entity_type=intval($entityType);
            $EntitySummary->name=$entityType==-1?'ארצי':$currentEntity->name;

            //---summery
            $EntitySummary->count_voters=intval($summery->sum_voter_count_not_opposite);

            $address=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_address_correct,false,false); 
            $EntitySummary->present_actual_address=round($address);

            $support=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_supporters,false,false);
            $EntitySummary->present_support_voter=round($support);

            $verified=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_mobile_verified,false,false);
            $EntitySummary->presents_mobile_phone_verified=round($verified);
            
            $other=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voter_present_other_details/ActivistsTasksSchedule::sumOtherDetails(),false,false);
            $EntitySummary->presents_voter_present_other_details=round($other);

            //$EntitySummary->presentDestination=self::calculatePresentDestination($EntitySummary->present_actual_address,$EntitySummary->present_support_voter,$EntitySummary->presents_mobile_phone_verified,$EntitySummary->presents_voter_present_other_details);
            $EntitySummary->presentDestination=self::calculatePresentDestination($address,$support,$verified,$other);
            //---calculate summery sub 
            if(count($subEntities)>0){
             $arrSubEntityId=$subEntities->map(function($sub){return $sub->id;});
             $summeryAllSub = self::getPresentsDetailsByTypeEntityCategory($subEntityType, $arrSubEntityId, $electionCampaignId);
            }

            foreach($subEntities as $subItem){
                 $subItemDataSummary = new stdClass();
                 
               if(isset($summeryAllSub[$subItem->id])){

                $summerySub=$summeryAllSub[$subItem->id];
                //---summery
                $subItemDataSummary->count_voters=intval($summerySub->sum_voter_count_not_opposite);

                $subAddress=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_address_correct,false,false); 
                $subItemDataSummary->present_actual_address=round($subAddress);

                $subSupport=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_supporters,false,false);
                $subItemDataSummary->present_support_voter=round($subSupport);

                $subVerified=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_mobile_verified,false,false);
                $subItemDataSummary->presents_mobile_phone_verified=round($subVerified);

                $subOther=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voter_present_other_details/ActivistsTasksSchedule::sumOtherDetails(),false,false);
                $subItemDataSummary->presents_voter_present_other_details=round($subOther);

               // $subItemDataSummary->presentDestination=self::calculatePresentDestination($subItemDataSummary->present_actual_address,$subItemDataSummary->present_support_voter,$subItemDataSummary->presents_mobile_phone_verified,$subItemDataSummary->presents_voter_present_other_details);
                $subItemDataSummary->presentDestination=self::calculatePresentDestination($subAddress,$subSupport,$subVerified,$subOther);
                $subItemDataSummary->name=$subItem->name;
                //---
                $subItemDataSummary->entity_type=$subEntityType;
                $subItemDataSummary->entity_id=$subItem->id;

                $subItemDataSummary->parent_entity_id=$currentEntity->id;
                $subItemDataSummary->parent_entity_type=$entityType;
    
               
               $subEntitiesSummary[] = $subItemDataSummary;

               }
               
            }
        }

        return  ['parent_entities_voter_summary' => $EntitySummary, 'sub_entities_voter_summary' => $subEntitiesSummary];
    }

    public static function getPresentsDetailsByTypeEntityCategory($entityType, $arrValue, $electionCampaignId,$city_filter=null){
        $arrColumnsSum=[
            'voter_count_not_opposite',
            'voters_count_supporters',
            'voters_count_address_correct',
            'voters_count_mobile_verified',
            'voter_present_other_details'
        ];

      return  ClusterService::getSumClusterColumnByGeoEntityType(intval($entityType), $arrValue, $electionCampaignId,$arrColumnsSum);//['voter_present_other_details'],'voter_count_not_opposite'
    }


    public static function getMunicipalEntitiesQuartesByType($entityType, $entityId,$screenPermissions,$electionCampaignId,$type_filter_city=null){


        //check type is city / need check filter by captain or cluster
        if($entityType==config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'))
        {
            $currentEntity = City::select('id','name' ,'key', 'sub_area_id as parent_entity_id')->where('id', $entityId)->first();
            $parentEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
            $citiesIDS = GeoFilterService::getGeoFiltersForUser($screenPermissions, false, false, true)['citiesIDS'];
            //check if filter by cluster
            if(!is_null($type_filter_city) && $type_filter_city==0){
               
                return MunicipalElectionsRolesService::getMunicipalEntitiesByType($entityType, $entityId,$screenPermissions,true);
                
            }
            else if($type_filter_city==1) //1 is type filter city by captain
            {
                
              $rol_captain_id=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
              $subEntities=ElectionRolesByVoters::select('election_roles_by_voters.voter_id as id','election_roles_by_voters.key',DB::raw("CONCAT(voters.first_name,' ',voters.last_name) as name"))
              ->where('election_roles_by_voters.assigned_city_id',$entityId)
              ->withVoter()
              ->whereIn('election_roles_by_voters.assigned_city_id', $citiesIDS)
              ->where('election_campaign_id',$electionCampaignId)
              ->where('election_role_id',$rol_captain_id)->orderBy('name')->get();

              $subEntityType =config('constants.GEOGRAPHIC_ENTITY_TYPE_CAPTAIN_100');
            }
            
            $entityFullData = new stdClass();
            $entityFullData->currentEntity = $currentEntity;
            $entityFullData->subEntities = $subEntities;
            $entityFullData->subEntityType = $subEntityType;
            $entityFullData->parentEntityType = $parentEntityType;
            return $entityFullData;
        }
        else
        return MunicipalElectionsRolesService::getMunicipalEntitiesByType($entityType, $entityId,$screenPermissions);
    }


    public static function calculatePresentDestination($address,$support,$verifiedPhone,$otherDetails){
        $present=0;
        $present+=($address*ActivistsTasksSchedule::$p_actual_address_correct);
        $present+=($support*ActivistsTasksSchedule::$p_status);
        $present+=($verifiedPhone*ActivistsTasksSchedule::$p_phone_verified);
        $present+=($otherDetails*ActivistsTasksSchedule::sumOtherDetails());

        $destination=$present/100;

        return  round($destination);
    }

}