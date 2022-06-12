<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRoleShifts;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionRoleVoterGeoAreasService
{
    //function get voter id activist ballot member and ballot box by election
    //return object geographic role activist
     public static function getObjectByActivistBallotMember($activist_voter_id,$ballot_box_id,$election_campaign_id){
         $geographic_ballot=config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
         $arrFields=[
            DB::raw('distinct election_roles_by_voters.id as election_role_voter'),
            DB::raw('election_role_by_voter_geographic_areas.*'),
            DB::raw('election_roles_by_voters.election_role_id'),
         ];
       
        $geographicActivistBallot= ElectionRolesGeographical::
        select($arrFields)
        ->WithElectionRolesByVoters(false)
        ->where('election_roles_by_voters.voter_id',$activist_voter_id)
        ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id)
        ->where('election_role_by_voter_geographic_areas.entity_type',$geographic_ballot)
        ->where('election_role_by_voter_geographic_areas.entity_id',$ballot_box_id)->first();//->toSql();
        //  Log::info( $geographicActivistBallot->getBindings());
        //  Log::info( $geographicActivistBallot->toSql());
       
        //  die();
        if(!$geographicActivistBallot)
        throw new Exception(config('errors.elections.ERROR_ELECTION_ROLE_GEOGRAPHIC'));

        return $geographicActivistBallot;
     }


     //set arrival date fo ballot member in ballot box
     //function return object ElectionRoleVoterGeoAreasService with all details and election role id
     public static function setArrivalDateBallotMember($activist_voter_id,$ballot_box_id,$election_campaign_id){
         $needSave=false;
         $objectGeographic=self::getObjectByActivistBallotMember($activist_voter_id,$ballot_box_id,$election_campaign_id);

         //its first time insert to ballot member
         if(is_null($objectGeographic->arrival_date) ||  strcmp($objectGeographic->arrival_date,'')==0){
            $objectGeographic->arrival_date=date('Y-m-d H:i:s');
            $needSave=true;
         }
        
         //check if its not first time insert to ballot member
         //and ballot member insert again -check if need to unset exist date only if the election campaign not finished
        //  $nowDate=date('Y-m-d');
        //  $nowTime=date('H:i:s');
        //  $startDate=ElectionCampaigns::currentCampaign()->election_date;
        //  $endTime=ElectionCampaigns::currentCampaign()->vote_end_time;

        else if(!is_null($objectGeographic->report_finished_date) &&  strcmp($objectGeographic->report_finished_date,'')!=0){
            $objectGeographic->report_finished_date=null;
            $needSave=true;
        }
   
        if($needSave)
         $objectGeographic->save();

         return $objectGeographic;

     }

     //set finished date of ballot box member 
     //function check before  if its not se
     public static function setFinishedShiftDate($activist_voter_id,$ballot_box_id,$election_campaign_id){
        $needSave=false;
        $objectGeographic=self::getObjectByActivistBallotMember($activist_voter_id,$ballot_box_id,$election_campaign_id); 

        if(is_null($objectGeographic->report_finished_date) || strcmp($objectGeographic->report_finished_date,'')==0){
            $objectGeographic->report_finished_date=date('Y-m-d H:i:s');
            $needSave=true;
        }

        if($needSave)
        $objectGeographic->save();
     }

     //function get object election_role_by_voter_geographic_areas
     //function get $electionRoleId from election role by voter of activist
     //function check if the not has next ballot member or the next ballot member in ballot box
     public static function checkIfTheNextBallotMemberInBallot($electionRoleVoterGeoObject,$electionRoleId,$election_campaign_id){
        $arrNextRoleGoShift=null;
        $ballot_box_id=$electionRoleVoterGeoObject->entity_id;
        $geographicBallotBox=config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');

        //system name of election role shift
        $electionRoleShiftSystemName=ElectionRoleShifts::where('id',$electionRoleVoterGeoObject->election_role_shift_id)->first()->system_name;

        $arrRoleShiftNext=ElectionRoleShiftService::getArrShiftRoleByNextShiftRoleBallotBox($electionRoleShiftSystemName,true);

        if(count($arrRoleShiftNext)>0){
            $arrNextRoleGoShift=ElectionRolesGeographical::select(DB::raw('distinct election_roles_by_voters.id as election_role_voter'),DB::raw('election_role_by_voter_geographic_areas.*'))
            ->withElectionRolesByVoters(false)
            ->where('election_role_by_voter_geographic_areas.entity_id',$ballot_box_id)
            ->where('election_role_by_voter_geographic_areas.entity_type',$geographicBallotBox)
            ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id)
            ->where('election_roles_by_voters.election_role_id', $electionRoleId)
            ->where('election_role_by_voter_geographic_areas.id','!=',$electionRoleVoterGeoObject->id)
            ->whereIn('election_role_by_voter_geographic_areas.election_role_shift_id', $arrRoleShiftNext);//->get();

            // Log::info(json_encode($electionRoleVoterGeoObject));
            // Log::info(json_encode($arrNextRoleGoShift->toSql()));
            // Log::info(json_encode($arrNextRoleGoShift->getBindings()));
            $arrNextRoleGoShift=$arrNextRoleGoShift->get();
            // Log::info(json_encode($arrNextRoleGoShift));
        }
       
            //if not has next ballot member in activist ballot box
            if(!$arrNextRoleGoShift || $arrNextRoleGoShift->count()==0)
            return true;

            else{
                $arrNextBallotMemberInBallot=$arrNextRoleGoShift->filter(function($nextBallotMember){
                    return !is_null($nextBallotMember->arrival_date) && strcmp($nextBallotMember->arrival_date,'')!=0;
                })->values();


                //if exist next ballot member in ballot box
                if($arrNextBallotMemberInBallot->count()>0)
                return true;
                else
                return false;
            }
     }

     //function get election rol geo object and election role of ballot box and election campaign
     //function check if the activist of before shift until in ballot box
     public static function checkIfBeforeBallotMemberInBallot($electionRoleVoterGeoObject,$electionRoleId,$election_campaign_id){
        $arrBeforeRoleGoShift=null;
        $ballot_box_id=$electionRoleVoterGeoObject->entity_id;
        $geographicBallotBox=config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');

        //system name of election role shift
        $electionRoleShiftSystemName=ElectionRoleShifts::where('id',$electionRoleVoterGeoObject->election_role_shift_id)->first()->system_name;

        //get all role before
        $arrRoleShiftBefore=ElectionRoleShiftService::arrShiftRoleBeforeByShiftRole($electionRoleShiftSystemName,true);

        if(count($arrRoleShiftBefore)>0){
            $arrBeforeRoleGoShift=ElectionRolesGeographical::select(DB::raw('distinct election_roles_by_voters.id as election_role_voter'),DB::raw('election_role_by_voter_geographic_areas.*'))
            ->withElectionRolesByVoters(false)
            ->where('election_role_by_voter_geographic_areas.entity_id',$ballot_box_id)
            ->where('election_role_by_voter_geographic_areas.entity_type',$geographicBallotBox)
            ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id)
            ->where('election_roles_by_voters.election_role_id', $electionRoleId)
            ->where('election_role_by_voter_geographic_areas.id','!=',$electionRoleVoterGeoObject->id)
            ->whereIn('election_role_by_voter_geographic_areas.election_role_shift_id', $arrRoleShiftBefore);//->get();

            $arrBeforeRoleGoShift=$arrBeforeRoleGoShift->get();
           
        }
       
            //if not has before ballot member in activist ballot box
            if(!$arrBeforeRoleGoShift || $arrBeforeRoleGoShift->count()==0)
            return false;

            else{//filter before ballot member in ballot that not exist
                $arrBeforeBallotMemberInBallot=$arrBeforeRoleGoShift->filter(function($BeforeBallotMember){
                    return is_null($BeforeBallotMember->report_finished_date) || strcmp($BeforeBallotMember->report_finished_date,'')==0;
                })->values();


                //if exist next ballot member in ballot box
                if($arrBeforeBallotMemberInBallot->count()>0)
                return true;
                else
                return false;
            }

     }


     public static function getCountersDetailsForElectionRoleInBallotByShift($election_campaign_id,$arrRoleShiftSystemName,$tableEntityGo=null,$arrEntityGeoKey=null){
       
        $yesVerifiedStatus=config('constants.activists.verified_status.VERIFIED');

        $columnCounter=[
            DB::raw('cities.id as city_id'),
            DB::raw('count(election_role_by_voter_geographic_areas.id) as count_activist'),
            DB::raw('count(arrival_date) as count_arrival_date'),
            DB::raw('count((case when election_roles_by_voters.verified_status='.$yesVerifiedStatus.' then 1 else null end)) as count_verified_status'),
            DB::raw('count((case when election_role_by_voter_geographic_areas.correct_reporting=1 then 1 else null end)) as count_correct_reporting'),
            DB::raw('count(report_finished_date) as count_report_finished_date'),
        ];
        
       $entityBallotBox=config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
       $countersElectionRoleShift= ElectionRolesGeographical::select($columnCounter)
        ->withElectionRolesByVotersCampaignBallotCityArea($election_campaign_id)
        ->withElectionRoleShifts()
        ->where('election_role_by_voter_geographic_areas.entity_type',$entityBallotBox)
        ->whereIn('election_role_shifts.system_name',$arrRoleShiftSystemName);
        if($tableEntityGo)
        $countersElectionRoleShift->whereIn($tableEntityGo.'.key',$arrEntityGeoKey);
        $countersElectionRoleShift=$countersElectionRoleShift->groupBy('city_id');

        // Log::info($countersElectionRoleShift->toSql());
        // Log::info($countersElectionRoleShift->getBindings());
        $countersElectionRoleShift=$countersElectionRoleShift->get();
        return $countersElectionRoleShift;
        
     }

     
}