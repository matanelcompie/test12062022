<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;

use stdClass;

class MunicipalStatisticVotesService {
   
     public static function getStatisticForShasPartyByGeo($entity_type,$arr_value_entity,$last_election_campaign){

          if($entity_type!=config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')){
               $arrVotesPartiesEntityLast=ElectionCampaignPartyListVotesService::getSumVotesForPartiesByGeoEntity($entity_type,$arr_value_entity,$last_election_campaign,'votes');
               $objectLastPartiesVotesEntity=ElectionCampaignPartyListVotesService::mapListPartiesVotesByEntity($entity,$arrVotesPartiesEntityLast);
          }
     }

     public static function getStatisticVoteForBallotBox($arrBallotBox,$election_campaign_id){
          $statisticBallotBox=array();

          foreach ($arrBallotBox as $key => $ballotBoxId){
            $numberStatistic=BallotBoxService::getStatisticsNumberVotesInBallotBox($ballotBoxId,$election_campaign_id); 
            $statistic=new stdClass();
            $statistic->sum_votes_party=round($numberStatistic);

            $statisticBallotBox[$ballotBoxId]= $statistic;
          }

          return $statisticBallotBox;
     }
}