<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionVotesReportParty;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionCampaignPartyListVotesService
{

    private static $fieldSumVotes='case when votes is null 
                                   or votes=0  
                                   then votes_report else votes end';
    /*
    entity type-type of geo entity 
    arrValue-arr value of geo type
    electionCampaignID
    nameFieldCount-name field specific in ElectionCampaignPartyListVotes  for sum votes party
    */
    public static function getSumVotesForPartiesByGeoEntity($entityType, $arrValue, $electionCampaignID,$nameFieldCount=null)
    {
     
        $ConditionBallotBox=null;
        $conditionCity=null;
        $defaultFields=ElectionCampaignPartyListVotesService::$fieldSumVotes;
        // $defaultFields='case when votes is null or votes=0  then 
        //                 case when votes_report is null or votes_report=0 then votes_report_likud else votes_report end';
        //default sum value is vote_report that ballot member reports
        $nameFieldCount=$nameFieldCount?$nameFieldCount:$defaultFields;
      //details party and sum votes
        $columns = [
            DB::raw('distinct election_campaign_party_lists.id as election_campaign_party_id'),
                    'election_campaign_party_lists.key',                  
            DB::raw("sum($nameFieldCount) as sum_votes_party")
                   ];

     
        $query =ElectionCampaignPartyListVotes::select($columns)
                ->withElectionCampaignPartyLists($electionCampaignID)
                ->withBallotBox(true)
                ->withCluster(true)
                ->WithCity(true)
                ->withBallotBoxCity(true)
                ->withArea(true)
                ->withAreaBallotBox(true);

    
        switch ($entityType) {
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                $query->addSelect(DB::raw('1 as entity_value'));
                // $ConditionBallotBox='ballot_boxes_areas.areas_group_id';
                // $conditionCity='areas.areas_group_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                $ConditionBallotBox='ballot_box_city.area_id';
                $conditionCity='cities.area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                $ConditionBallotBox='ballot_box_city.sub_area_id';
                $conditionCity='cities.sub_area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                $ConditionBallotBox='ballot_box_city.id';
                $conditionCity='cities.id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $ConditionBallotBox='ballot_boxes.cluster_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
                $ConditionBallotBox='ballot_boxes.id';
                    break;
        }
    
       
        //if have condition-is not all country
        if($ConditionBallotBox){
           if($conditionCity){//if 
            $query->addSelect(DB::raw("if($ConditionBallotBox is null,$conditionCity,$ConditionBallotBox) as entity_value"));
           }
           else{
            $query->addSelect(DB::raw("$ConditionBallotBox as entity_value"));
           }

            $query->where(function($query)use($ConditionBallotBox,$conditionCity,$arrValue){
                $query->whereIn($ConditionBallotBox,$arrValue);//condition by ballot box
                if($conditionCity)
                $query->orWhereIn($conditionCity,$arrValue);//and condition by city
            });

            $query=$query->groupBy(DB::raw('election_campaign_party_lists.id,entity_value'));
        }
        else
        $query=$query->groupBy(DB::raw('election_campaign_party_lists.id'));

        Log::info($query->toSql());
        Log::info($query->getBindings());
        $votesPartiesByGeo=$query->get();

     return $votesPartiesByGeo;
    }

    //map entity geo parties list by entity geo value-the function is helper for getSumVotesForPartiesByGeoEntity function
    //function return arr with 
    //key=election_campaign_party_id
    //value=object details vote for party
    public static function mapListPartiesVotesByEntity($entity_value,$arrAllEntityParties){
        $objectParties=array();
          foreach ($arrAllEntityParties as $key => $party_entity) {
            if($party_entity->entity_value==$entity_value)
            $objectParties[$party_entity->election_campaign_party_id]=$party_entity;
          }

        return  $objectParties;
      }


    //
    public static function getSumVotesInElection($electionCampaignID){
        $field=ElectionCampaignPartyListVotesService::$fieldSumVotes;
        $columns="sum($field) as count_votes";
        $count=ElectionCampaignPartyListVotes::select(DB::raw($columns))
        ->withElectionCampaignPartyLists($electionCampaignID)
        ->first();
        return $count?$count->count_votes:0;
        
    } 
    
    //---------------------------in new state-----------------------------------------------

  

    public static function getCountEndVotesByGeoEntity($entityType, $arrValue, $electionCampaignID)
    {
     
        $Condition=null;
        $groupReportSource=null;
        $arrGroupBy=['election_votes_report_party.party_id'];//group by for country
  
       //details party and sum votes
        $columns = [
            DB::raw('distinct election_votes_report_party.party_id as election_campaign_party_id'),
            DB::raw("sum(election_votes_report_party.count_votes) as sum_votes_party")
                   ];

        $query =ElectionVotesReportParty::select($columns)
                ->withElectionReportVotesSource($electionCampaignID)
                ->withBallotBox(true)
                ->withCluster(true)
                ->WithCity(true);
                
    
        switch ($entityType) {
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                $query->addSelect(DB::raw('1 as entity_value'));
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                $Condition='cities.area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                $Condition='cities.sub_area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                $Condition='cities.id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $Condition='ballot_boxes.cluster_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
              
                $Condition='ballot_boxes.id';
                $groupReportSource=DB::raw('election_votes_report_source.name as report_source_name,election_votes_report_source.id as report_source_id');
                $query->addSelect($groupReportSource);
                break;
        }
        
        
        $query->where('election_votes_report.high_priority',DB::raw(1));
      

        //if have condition-is not all country
        if($Condition){
            $query->addSelect(DB::raw("$Condition as entity_value"))
                  ->whereIn($Condition,$arrValue);
            $arrGroupBy[]='entity_value';

            if($groupReportSource)//ballot box include group by 
            {
                $arrGroupBy[]='report_source_name';
                $arrGroupBy[]='report_source_id';
            }
        }
        
        $query=$query->groupBy($arrGroupBy);
        // Log::info($query->toSql());
        // Log::info($query->getBindings());
        $votesPartiesByGeo=$query->get();

     return $votesPartiesByGeo;
    }

 

    

    public static function getObjectAnotherReportSourceByBallotBox($ballot_box_id,$electionCampaignID){
        $arrFields=['election_votes_report_party.party_id',
                    'election_votes_report_party.count_votes',
                    'election_votes_report_source.id as report_source_id',
                    'election_votes_report_source.name as report_source_name'];
                    
        $arrAnotherReportSource=ElectionVotesReportParty::select($arrFields)
                                ->withElectionReportVotesSource($electionCampaignID)
                                ->where('election_votes_report.ballot_box_id',$ballot_box_id)
                                ->where('high_priority',DB::raw(0))
                                ->get();

                            
        return $arrAnotherReportSource;
    }



    
}
  