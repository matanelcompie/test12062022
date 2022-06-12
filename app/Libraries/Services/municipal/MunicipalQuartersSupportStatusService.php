<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Models\ElectionCampaigns;

use stdClass;

class MunicipalQuartersSupportStatusService {

    
        //function that return entity type parent city/area/sub_area... and children with present details voter 
        public static function getMunicipalEntitySupportStatusSummery($entityType, $entityId,$city_filter){
            $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
           
            //object that menage item in tree
            $entityFullData =MunicipalQuartersService::getMunicipalEntitiesQuartesByType($entityType, $entityId,'quarters.dashboard',$electionCampaignId,$city_filter);
            $currentEntity = $entityFullData->currentEntity;
            $parentEntityType = $entityFullData->parentEntityType;
            $subEntities = $entityFullData->subEntities;
            $subEntityType = $entityFullData->subEntityType;
    
    
            $EntitySummary = new stdClass();
            $subEntitiesSummary = [];
    
            if($currentEntity){
                 $summery = self::getPresentsSupportStatusByTypeEntityCategory($entityType, [$currentEntity->id], $electionCampaignId);
               
                $summery=$summery[$currentEntity->id];
                $EntitySummary->parent_entity_id = $currentEntity->parent_entity_id;
                $EntitySummary->parent_entity_type = $parentEntityType;
                $EntitySummary->entity_id=$currentEntity->id;
                $EntitySummary->entity_type=intval($entityType);
                $EntitySummary->name=$entityType==-1?'ארצי':$currentEntity->name;
    
                //---summery
                $EntitySummary->count_voters=intval($summery->sum_voters_count_connect_captain);
               
                // Log::info($EntitySummary->count_voters);
                // Log::info($summery->sum_voters_count_supporters);
                // Log::info($summery->sum_voters_count_undecided);
                // Log::info($summery->sum_voters_count_opposed);

                //present voter support
                $support=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_supporters,false,false);
                $EntitySummary->present_support_voter=round($support);

                //present supporting voter with actual address
                $address=Helper::getPresent($summery->sum_voters_count_supporters,$summery->sum_voter_count_address_correct_supporters,false,false); 
                $EntitySummary->present_actual_address=round($address);
    
                //present supporting voter with verified mobile phone
                $verified=Helper::getPresent($summery->sum_voters_count_supporters,$summery->sum_voter_count_mobile_verified_supporters,false,false);
                $EntitySummary->presents_mobile_phone_verified=round($verified);

                //present voter undecided
                $undecided=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_undecided,false,false);
                $EntitySummary->present_undecided_voter=round($undecided);

                //present voter opposed
                $opposed=Helper::getPresent($EntitySummary->count_voters,$summery->sum_voters_count_opposed,false,false);
                $EntitySummary->present_opposed_voter=round($opposed);

                $don=$summery->sum_voters_count_opposed+$summery->sum_voters_count_undecided+$summery->sum_voters_count_supporters;
                $presentDon=Helper::getPresent($EntitySummary->count_voters,$don,false,false);
                $EntitySummary->present_don_voter=round($presentDon);

                //---calculate summery sub 
                if(count($subEntities)>0){
                 $arrSubEntityId=$subEntities->map(function($sub){return $sub->id;});
                 $summeryAllSub = self::getPresentsSupportStatusByTypeEntityCategory($subEntityType, $arrSubEntityId, $electionCampaignId);
                }
    
                foreach($subEntities as $subItem){
                     $subItemDataSummary = new stdClass();
                     
                   if(isset($summeryAllSub[$subItem->id])){
    
                    $summerySub=$summeryAllSub[$subItem->id];
                    //---summery
                    //count voter connect captain
                    $subItemDataSummary->count_voters=intval($summerySub->sum_voters_count_connect_captain);
                    //present voter support
                  
                    $subSupport=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_supporters,false,false);
                    $subItemDataSummary->present_support_voter=round($subSupport);

                    //present supporting voter with address correct
                    $subAddress=Helper::getPresent($summerySub->sum_voters_count_supporters,$summerySub->sum_voter_count_address_correct_supporters,false,false); 
                    $subItemDataSummary->present_actual_address=round($subAddress);
    
                    //present supporting voter with verified phone
                    $subVerified=Helper::getPresent($summerySub->sum_voters_count_supporters,$summerySub->sum_voter_count_mobile_verified_supporters,false,false);
                    $subItemDataSummary->presents_mobile_phone_verified=round($subVerified);

                    //present voter undecided
                    $subUndecided=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_undecided,false,false);
                    $subItemDataSummary->present_undecided_voter=round($subUndecided);

                    //present voter opposed
                    $subOpposed=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voters_count_opposed,false,false);
                    $subItemDataSummary->present_opposed_voter=round($subOpposed);


                    $donSub=$summerySub->sum_voters_count_opposed+$summerySub->sum_voters_count_undecided+$summerySub->sum_voters_count_supporters;
                    $subPresentDon=Helper::getPresent($subItemDataSummary->count_voters,$donSub,false,false);
                    $subItemDataSummary->present_don_voter=round($subPresentDon);


                    // $subOther=Helper::getPresent($subItemDataSummary->count_voters,$summerySub->sum_voter_present_other_details/ActivistsTasksSchedule::sumOtherDetails(),false,false);
                    // $subItemDataSummary->presents_voter_present_other_details=round($subOther);
                    //$subItemDataSummary->presentDestination=self::calculatePresentDestination($subAddress,$subSupport,$subVerified,$subOther);
                   
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


        public static function getPresentsSupportStatusByTypeEntityCategory($entityType, $arrValue, $electionCampaignId,$city_filter=null){
            $arrColumnsSum=[
                'voters_count_undecided',
                'voters_count_supporters',
                'voters_count_opposed',
                'voters_count_connect_captain',
                'voter_count_mobile_verified_supporters',
                'voter_count_address_correct_supporters'
            ];
    
          return  ClusterService::getSumClusterColumnByGeoEntityType(intval($entityType), $arrValue, $electionCampaignId,$arrColumnsSum);//['voter_present_other_details'],'voter_count_not_opposite'
        }


}