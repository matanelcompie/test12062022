<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\CalculateMandatesService;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\ServicesModel\VoterSupportStatusService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsTasksSchedule;
use App\Models\Area;
use App\Models\AreasGroup;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyLists;
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

class MunicipalQuartersVotesService
{


  /*
  */
  public static function getSumReportVotesByMunicipalTypeForAllParties($entity_type, $arr_value_entity, $election_campaign_id, $last_election_campaign)
  {

    if($entity_type==-1){
      $AllMandates=CalculateMandatesService::calculateMandates();
      // log::info(json_encode($AllMandates));
    }
    
    
    $arrEntityDetails = array();
    $listParties = ELectionCampaignPartyListsService::getListByElectionCampaignId($election_campaign_id);
    //getCountEndVotesByGeoEntity
    //getSumVotesForPartiesByGeoEntity
    $arrVotesPartiesEntity = ElectionCampaignPartyListVotesService::getCountEndVotesByGeoEntity($entity_type, $arr_value_entity, $election_campaign_id);
    $arrAnotherReportSourceEntity = null;
    if ($entity_type != config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
      $arrVotesPartiesEntityLast = ElectionCampaignPartyListVotesService::getCountEndVotesByGeoEntity($entity_type, $arr_value_entity, $last_election_campaign);
    else
      $statisticBallotBoxes = MunicipalStatisticVotesService::getStatisticVoteForBallotBox($arr_value_entity, $election_campaign_id);

    $countAllVotesByEntity = self::countAllVotesPartiesByEntity($arrVotesPartiesEntity);
    $countFinalSupportersByEntity = VoterSupportStatusService::getEntityFinalSupporters($entity_type, $arr_value_entity, $election_campaign_id);

    $lastShasParty = ELectionCampaignPartyListsService::getLastELectionCampaignPartyShas();
    //for of all entity value request
    foreach ($arr_value_entity as $key => $entity) {

      $entityObject = new stdClass();
      $entityObject->entity_type = $entity_type;
      $entityObject->entity_values = $entity;
      $entityObject->report_source_name = null;

      $objectPartiesVotesEntity = ElectionCampaignPartyListVotesService::mapListPartiesVotesByEntity($entity, $arrVotesPartiesEntity);

      if ($entity_type == config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
        //another report source for ballot box and party
        $arrAnotherReportSourceEntity = ElectionCampaignPartyListVotesService::getObjectAnotherReportSourceByBallotBox($entity, $election_campaign_id);



      $arrSummeryEntityParties = array(); //list parties details of entity
      $arrSummeryParties = [];
      //for of all parties in election campaign
      foreach ($listParties as $key => $party) {
        $summeryParty = new stdClass();
        $summeryParty->key = $party->key;
        $summeryParty->name = $party->name;
        $summeryParty->letters = $party->letters;
        $summeryParty->image_url = $party->image_url;
        $summeryParty->is_shas = $party->shas;
        $summeryParty->count_voted_party = 0;
        $summeryParty->percent_votes_party = 0;
        $mandates=0;
        if($entity_type==-1 && $AllMandates && array_key_exists($party->id,$AllMandates)){
          $mandates=$AllMandates[$party->id];
        }
        $summeryParty->mandates = $mandates;
        $summeryParty->party_statistic = 0;

        if (array_key_exists($party->id, $objectPartiesVotesEntity)) {
          if (isset($objectPartiesVotesEntity[$party->id]->report_source_name) && is_null($entityObject->report_source_name)){
            $entityObject->report_source_id = $objectPartiesVotesEntity[$party->id]->report_source_id;
            $entityObject->report_source_name = $objectPartiesVotesEntity[$party->id]->report_source_name;
          }
           

          $summeryParty->count_voted_party = intval($objectPartiesVotesEntity[$party->id]->sum_votes_party);
          $summeryParty->percent_votes_party = Helper::getPresent($countAllVotesByEntity, $summeryParty->count_voted_party);
        }

        //another report by party
        if ($arrAnotherReportSourceEntity)
          $summeryParty->another_report_source = self::mapperReportSourceByParty($arrAnotherReportSourceEntity,$party->id);

        //votes last for shas statistic
        if ($party->shas == 1) {

          if (isset($arrVotesPartiesEntityLast)) //statistic not by ballot box
          {
            //map list vote of parties in last election campaign
            $objectLastPartiesVotesEntity = ElectionCampaignPartyListVotesService::mapListPartiesVotesByEntity($entity, $arrVotesPartiesEntityLast);
            $statistic = array_key_exists($lastShasParty->id, $objectLastPartiesVotesEntity) ? intval($objectLastPartiesVotesEntity[$lastShasParty->id]->sum_votes_party) : 0;
          } else { //statistic by ballot box by calculation
            $statistic = $statisticBallotBoxes[$entity]->sum_votes_party;
          }
          $summeryParty->party_statistic = $statistic;
        }

        $arrSummeryParties[] = $summeryParty;
      }

      $entityObject->list_parties_details = $arrSummeryParties;
      $arrEntityDetails[] = $entityObject;
    }


    $result = array(
      'entities_details' => $arrEntityDetails,
      'sum_all_votes_entity' => $countAllVotesByEntity,
      'sum_final_supporters_entity' => $countFinalSupportersByEntity,
    );
    return $result;
  }



  public static function getEntityFinalSupporters($SumVotesGroupParty)
  {
    $sumByEntity = 0;
    foreach ($SumVotesGroupParty as $key => $partyDetails) {
      $sumByEntity += $partyDetails->sum_votes_party;
    }
    return  $sumByEntity;
  }
  public static function countAllVotesPartiesByEntity($SumVotesGroupParty)
  {
    $sumByEntity = 0;
    foreach ($SumVotesGroupParty as $key => $partyDetails) {
      $sumByEntity += $partyDetails->sum_votes_party;
    }
    return  $sumByEntity;
  }

  public static function mapperReportSourceByParty($AnotherReportSource, $party_id)
  {
    Log::info('g'.$party_id);
    $arrAnotherReport = array();
    foreach ($AnotherReportSource as $key => $anotherPartyReportSource) {
      Log::info($anotherPartyReportSource->party_id);
      if ($anotherPartyReportSource->party_id == $party_id) {
        $reportSource = new stdClass();
        $reportSource->report_source_id= $anotherPartyReportSource->report_source_id;
        $reportSource->report_source_name = $anotherPartyReportSource->report_source_name;
        $reportSource->count_voted_party = $anotherPartyReportSource->count_votes;
        $arrAnotherReport[] = $reportSource;
      }
    }
    return $arrAnotherReport;
  }

    public static function downloadExcelFileReportVotesByGeo($election_campaign_id,$entityType,$entityArrValue)
    {
      //return $arrBallotReportVotes=ElectionVotesReportService::getBallotBoxPriorityReportVotesByGeo($entityType,$entityArrValue,$election_campaign_id);
      $index=0;
      $nameFile=self::getNameFileByEntityGeo($entityType);
      header("Content-Type: application/txt");
      header("Content-Disposition: attachment; filename=$nameFile.csv");

      $column=['עיר','קלפי','מדווח ראשי','דווח סותר','בזב','כשרים','פסולים'];
      $arrParties=ELectionCampaignPartyListsService::getListByElectionCampaignId($election_campaign_id);
      foreach ($arrParties as $key => $party)
      $column[]=$party->letters;

      $fullRow = implode(',', $column);
      $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
      echo $rowToPrint;
   
      do {

        $arrBallotReportVotes=ElectionVotesReportService::getBallotBoxPriorityReportVotesByGeo($entityType,$entityArrValue,$election_campaign_id,$index);
      
        foreach ($arrBallotReportVotes as $key => $reportVotes){
          $rowDetailsReport=self::ballotBoxReportVotesSource($reportVotes,$arrParties,$election_campaign_id);
          $fullRow = implode(',', $rowDetailsReport);
          $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
          echo $rowToPrint;
        }

       
     
      } while ($arrBallotReportVotes && $arrBallotReportVotes->count()>0);

    }

    //function get report object and return object mapping
    public static function ballotBoxReportVotesSource($reportVotes,$arrListPartyElection,$election_campaign_id){
      $rowDetailsReport=array();
      $rowDetailsReport[]=$reportVotes->city_name;//city
      $rowDetailsReport[]=BallotBox::getLogicMiBallotBox($reportVotes->ballot_box_mi_id);//ballot Box
      $rowDetailsReport[]=$reportVotes->report_source_name;//report_source_name
      $haveConflict=ElectionVotesReportService::checkConflictForBallotBox($reportVotes->ballot_box_id,$election_campaign_id,$reportVotes->vote_report_source_id,$reportVotes->count_not_valid_votes,$reportVotes->count_votes,$reportVotes->count_votes,$reportVotes->sum_party_votes);
      $rowDetailsReport[]=$haveConflict?'כן':'לא';
      $rowDetailsReport[]=$reportVotes->count_have_votes;//count have votes
      $rowDetailsReport[]=$reportVotes->count_votes-$reportVotes->count_not_valid_votes;//count valid
      $rowDetailsReport[]=$reportVotes->count_not_valid_votes;//count not valid

      //object that include all details 
      $objectPartyDetailsReport=Helper::makeHashCollection($reportVotes->reportParty,'party_id');
      // Log::info(json_encode($objectPartyDetailsReport));
      // Log::info(json_encode($arrListPartyElection));
      foreach ($arrListPartyElection as $key => $party) {
        if(array_key_exists($party->id,$objectPartyDetailsReport))
        $rowDetailsReport[]=$objectPartyDetailsReport[$party->id]->count_votes;
        else
        $rowDetailsReport[]=0;
      }

      return $rowDetailsReport;
    }

    public static function getNameFileByEntityGeo($entityType,$arrValue=null){
      $nameFile='דיווחי קולות-';
      $level='';
        switch ($entityType) {
          case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
            $level='ארצית';
            break;

        case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
            $level='אזור';
            $table='';
            break;

        case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
           $level='תת אזור';
            break;

        case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
          $level='עיר';
            break;

        case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
          $level='אשכול';
          $table='clusters';
          break;

        case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
          $level='קלפי';
          $table='ballot_boxes';
        }

        return $nameFile.'סינון-'.$level;

    }

    
}
