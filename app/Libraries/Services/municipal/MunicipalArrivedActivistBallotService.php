<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;
use App\Libraries\Services\ServicesModel\ElectionRoleVoterGeoAreasService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
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

class MunicipalArrivedActivistBallotService
{

     public static function downloadCsvDetailsBallotBoxActivistByGeo($entityType, $arrEntityKey)
     {
         
          $nameFile=MunicipalQuartersManagement::getTitleByEntityGeo($entityType,$arrEntityKey);
          header("Content-Type: application/txt");
          header("Content-Disposition: attachment; filename=$nameFile.csv");
          $column=['עיר','אשכול','קלפי','משמרת','תפקיד','שם','אימות הודעה','הגעה','דווח אחרון','יציאה'];
          $fullRow = implode(',', $column);
          $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
          echo $rowToPrint;


          $currentElection = ElectionCampaigns::currentCampaign();
          $detailsEntity = MunicipalQuartersManagement::getDetailsEntity($entityType);
          $table = $detailsEntity->table;
          Log::info( $table);
          $ballotBoxDetailsShift=self::getReportArrivedTimeForBallotBoxes($currentElection->id,$table,$arrEntityKey);
          $yesVerifiedStatus = config('constants.activists.verified_status.VERIFIED');

          foreach ($ballotBoxDetailsShift as $key => $ballotBoxDetails) {
            $rowBallotDetails=array();
            $rowBallotDetails[]=$ballotBoxDetails->city_name;
            $rowBallotDetails[]=$ballotBoxDetails->cluster_name;
            $rowBallotDetails[]=BallotBox::getLogicMiBallotBox($ballotBoxDetails->mi_id);
            $rowBallotDetails[]=$ballotBoxDetails->role_shifts_name;
            $rowBallotDetails[]=$ballotBoxDetails->role_name;
            $rowBallotDetails[]=$ballotBoxDetails->voter_full_name;
            $rowBallotDetails[]=$ballotBoxDetails->verified_status==$yesVerifiedStatus?'1':'0';
            $rowBallotDetails[]=$ballotBoxDetails->arrival_date;
            $rowBallotDetails[]=$ballotBoxDetails->last_report_votes;
            $rowBallotDetails[]=$ballotBoxDetails->report_finished_date;

            $fullRow = implode(',', $rowBallotDetails);
            $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
            echo $rowToPrint;
          }
     }

     //function get 
     public static function getReportArrivedTimeForBallotBoxes($election_campaign_id, $entityTable = false, $arrEntityKey)
     {
          $entityBallotBox = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
          $yesVerifiedStatus = config('constants.activists.verified_status.VERIFIED');
          $counterShiftSystemName = config("constants.activists.role_shifts.COUNT");
          $lastReportVoteByActivist =
               "
               (case when election_role_shifts.system_name='$counterShiftSystemName'
               then
               (
                    select (case when election_votes_report.updated_at > election_votes_report_party.updated_at then election_votes_report.updated_at else election_votes_report_party.updated_at end ) as last_time
                    FROM  election_votes_report
                    join  election_votes_report_party on election_votes_report_party.election_votes_report_id=election_votes_report.id
                    where (election_votes_report.created_voter_id=election_roles_by_voters.voter_id or election_votes_report.updated_voter_id=election_roles_by_voters.voter_id) and election_campaign_id=$election_campaign_id
                    order by last_time desc   
                    limit 1
               )
               else
               (select vote_date  from votes where votes.reporting_voter_id=election_roles_by_voters.voter_id and election_campaign_id=$election_campaign_id order by vote_date desc limit 1)
                end ) as last_report_votes";

          $columns = [
               'cities.name as city_name',
               'clusters.name as cluster_name',
               'ballot_boxes.mi_id',
               'election_roles.name as role_name',
               'election_role_shifts.system_name as role_shifts_system_name',
               'election_role_shifts.name as role_shifts_name',
               DB::raw("CONCAT(voters.first_name,' ',voters.last_name) as voter_full_name"),
               'election_roles_by_voters.verified_status',
               'election_role_by_voter_geographic_areas.arrival_date',
               DB::raw($lastReportVoteByActivist),
               'election_role_by_voter_geographic_areas.report_finished_date'
          ];

          $detailsActivistInBallot = ElectionRolesGeographical::select($columns)
               ->withElectionRolesByVotersCampaignBallotCityArea($election_campaign_id)
               ->withElectionRoleShifts()
               ->where('election_role_by_voter_geographic_areas.entity_type', $entityBallotBox);

               if($entityTable)
               $detailsActivistInBallot=$detailsActivistInBallot->whereIn($entityTable . '.key', $arrEntityKey);
             //  Log::info($detailsActivistInBallot->toSql());
              // Log::info($detailsActivistInBallot->getBindings());
             //  die();
               $detailsActivistInBallot=$detailsActivistInBallot->get();

       return $detailsActivistInBallot;
     }

     public static function getSummeryActivistElectionInShift($election_campaign_id, $entityType, $arrEntityKey)
     {

          $detailsEntity = MunicipalQuartersManagement::getDetailsEntity($entityType);
          $table = $detailsEntity->table;

          $countBallotBoxRole=BallotBoxService::getCountBallotRoleByGeoGroupCity($election_campaign_id, $table, $arrEntityKey);
          $hashBallotRoleCounter=Helper::makeHashCollection($countBallotBoxRole,'city_id');
         
          //counter ballot box by geo entity
          $countersBallotByCity = ActivistsAllocationsService::getCountActivistBallotByEntityGeo($election_campaign_id, $table, $arrEntityKey);
          $hashCounter=Helper::makeHashCollection($countersBallotByCity,'city_id');

          //shift-all day and all day_counter
          $arrAllDayShiftRole = [
               config('constants.activists.role_shifts.ALL_DAY'),
               config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')
          ];
          $cityAllDayShiftDetails = ElectionRoleVoterGeoAreasService::getCountersDetailsForElectionRoleInBallotByShift($election_campaign_id, $arrAllDayShiftRole, $table, $arrEntityKey);
          $hashAllDayDetails=Helper::makeHashCollection($cityAllDayShiftDetails,'city_id');
          //shift first
          $arrFirstShiftRole = [
               config('constants.activists.role_shifts.FIRST'),
          ];
          $cityFirstShiftDetails = ElectionRoleVoterGeoAreasService::getCountersDetailsForElectionRoleInBallotByShift($election_campaign_id, $arrFirstShiftRole, $table, $arrEntityKey);
          $hashFirstShift=Helper::makeHashCollection($cityFirstShiftDetails,'city_id');

          //shift-second and second+counter

          $arrSecondShiftRole = [
               config('constants.activists.role_shifts.SECOND'),
               config('constants.activists.role_shifts.SECOND_AND_COUNT')
          ];
          $citySecondShiftDetails = ElectionRoleVoterGeoAreasService::getCountersDetailsForElectionRoleInBallotByShift($election_campaign_id, $arrSecondShiftRole, $table, $arrEntityKey);
          $hashSecondShift=Helper::makeHashCollection($citySecondShiftDetails,'city_id');

          //shift counter
          $arrCounterShiftRole = [
               config('constants.activists.role_shifts.COUNT')
          ];
          $cityCountShiftDetails = ElectionRoleVoterGeoAreasService::getCountersDetailsForElectionRoleInBallotByShift($election_campaign_id, $arrCounterShiftRole, $table, $arrEntityKey);
          $hashCountShift=Helper::makeHashCollection($cityCountShiftDetails,'city_id');

          $detailsShiftActivist=new stdClass();
          $detailsShiftActivist->hashBallotRoleCounter=$hashBallotRoleCounter;
          $detailsShiftActivist->hashCityCounterEmbed=$hashCounter;
          $detailsShiftActivist->hashAllDayShiftDetails=$hashAllDayDetails;
          $detailsShiftActivist->hashFirstShiftDetails=$hashFirstShift;
          $detailsShiftActivist->hashSecondShiftDetails=$hashSecondShift;
          $detailsShiftActivist->hashCountShiftDetails=$hashCountShift;
          return $detailsShiftActivist;

     }

     public static function getCSVByDetailsAllShiftTypeByGeo($election_campaign_id,$entityGeoType, $arrEntityGeoKey){

          $nameFile=MunicipalQuartersManagement::getTitleByEntityGeo($entityGeoType,$arrEntityGeoKey);
          header("Content-Type: application/txt");
          header("Content-Disposition: attachment; filename=$nameFile.csv");
    
          $column=['אזור','תת אזור','עיר','קלפיות','קלפיות משובצות','כל היום '];
          $columnDetails=['אימות','הגעה','דווח','יציאה'];
          $column=array_merge($column,$columnDetails);
          $column[]='משמרת א';
          $column=array_merge($column,$columnDetails);
          $column[]='משמרת ב';
          $column=array_merge($column,$columnDetails);
          $column[]='ספירה';
          $column=array_merge($column,$columnDetails);

          $fullRow = implode(',', $column);
          $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
          echo $rowToPrint;

          $detailsAllShiftType=self::getSummeryActivistElectionInShift($election_campaign_id,$entityGeoType,$arrEntityGeoKey);
          $cityGroup=$detailsAllShiftType->hashBallotRoleCounter;
          $hashCounterEmbed=$detailsAllShiftType->hashCityCounterEmbed;
          
          $detailsAllShiftType->hashAllDayShiftDetails;
          $detailsAllShiftType->hashFirstShiftDetails;
          $detailsAllShiftType->hashSecondShiftDetails;
          $detailsAllShiftType->hashCountShiftDetails;

          foreach ($cityGroup as $key => $cityGroup) {
               $rowCityShiftDetails=array();
               $rowCityShiftDetails[]=$cityGroup->area_name;//area
               $rowCityShiftDetails[]=$cityGroup->sub_area_name;//sub area
               $rowCityShiftDetails[]=$cityGroup->city_name;//city
               $rowCityShiftDetails[]=$cityGroup->countBallotWithRole;//count ballot with role

               $countBallotEmbed=0;
               if(array_key_exists($cityGroup->city_id,$detailsAllShiftType->hashCityCounterEmbed))
               $countBallotEmbed=$detailsAllShiftType->hashCityCounterEmbed[$cityGroup->city_id]->countBallotRole;

               $rowCityShiftDetails[]=$countBallotEmbed;


               $detailsAllDayShift=self::getHelperObjectTypeShiftArrDetails($cityGroup->city_id,$detailsAllShiftType->hashAllDayShiftDetails);
               $rowCityShiftDetails=array_merge($rowCityShiftDetails,$detailsAllDayShift);

               $detailsFirstShift=self::getHelperObjectTypeShiftArrDetails($cityGroup->city_id,$detailsAllShiftType->hashFirstShiftDetails);
               $rowCityShiftDetails=array_merge($rowCityShiftDetails,$detailsFirstShift);

               $detailsSecondShift=self::getHelperObjectTypeShiftArrDetails($cityGroup->city_id,$detailsAllShiftType->hashSecondShiftDetails);
               $rowCityShiftDetails=array_merge($rowCityShiftDetails,$detailsSecondShift);

               $detailsCounterShift=self::getHelperObjectTypeShiftArrDetails($cityGroup->city_id,$detailsAllShiftType->hashCountShiftDetails);
               $rowCityShiftDetails=array_merge($rowCityShiftDetails,$detailsCounterShift);


               $fullRowDetails = implode(',', $rowCityShiftDetails);
               $rowToPrint = mb_convert_encoding($fullRowDetails, "ISO-8859-8", "UTF-8") . "\n";
               echo $rowToPrint;
          }

     }

     private static function getHelperObjectTypeShiftArrDetails($city_id,$hashDetailsShift){

          $countActivist=0;
          $countVerified=0;
          $countEnter=0;
          $countReport=0;
          $countExit=0;

          if(array_key_exists($city_id,$hashDetailsShift)){
               $countActivist=$hashDetailsShift[$city_id]->count_activist;
               $countVerified=$hashDetailsShift[$city_id]->count_verified_status;
               $countEnter=$hashDetailsShift[$city_id]->count_arrival_date;
               $countReport=$hashDetailsShift[$city_id]->count_correct_reporting;
               $countExit=$hashDetailsShift[$city_id]->count_report_finished_date;
          };

          return [
               $countActivist, 
               $countVerified,
               $countEnter,
               $countReport,
               $countExit
          ];
     }
}
