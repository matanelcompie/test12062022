<?php

namespace App\Libraries\Services\municipal;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionCampaignPartyListVotesService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportSourceService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistAllocationAssignment;
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
use App\Models\ElectionVotesReport;
use App\Models\ElectionVotesReportSource;
use App\Models\Quarter;
use App\Models\SubArea;
use App\Models\SupportStatus;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VoteSources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class MunicipalCaptainActivistReport {
   
    public static $arrCaptain=[];
    public static $presentVotesBallotIsReporting=90;//אחוז עבור בונוס;


    //פונקציה המחזירה פרטים אודות כל שרי מאה במערכת
    public static function getAllCaptainDetailsByGeo($entityType,$entityId){
        $currentCampaign=ElectionCampaigns::currentCampaign();
        //details of geographic entity(table and title)
        $details=MunicipalQuartersManagement::getDetailsEntity($entityType);

        $electionRoleCaptain=config('constants.activists.election_role_system_names.ministerOfFifty');
        $electionRoleCaptainId=ElectionRoles::getIdBySystemName($electionRoleCaptain);
        $arrFields=[
           'cities.name as city_name',
           'cities.mi_id as city_mi_id',
           'clusters.mi_id as cluster_mi_id',
           'clusters.name as cluster_name',
           'election_roles_by_voters.created_at as date_add',
           'captain_voter.personal_identity',
           'captain_voter.last_name',
           'captain_voter.id as captain_details_id',
           'captain_voter.first_name',
           'election_roles.name as role_name',
           'election_roles_by_voters.phone_number',
           'election_roles_by_voters.voter_count_mobile_verified_supporters',
           'election_roles_by_voters.voter_count_address_correct_supporters',
          // DB::raw('(select count(*) from clusters where leader_id=election_roles_by_voters.voter_id and clusters.election_campaign_id='.$currentCampaign->id.' ) as countClusters')
        ];
        //פרים נוספים לשר מאה הלקוחות מתתי שאילתות
        $subQueryDetails=self::getArrSubQueryCaptainDetails($currentCampaign->id);
        $column=array_merge($arrFields,$subQueryDetails);
        //קבלת מערך של שרי מאה עם הפרטים
        // $arrCaptain=ActivistsAllocations::select($column)  
        //                 ->withElectionRoleCampaign($currentCampaign->id,true)
        //                 ->withCity(true)
        //                 ->withClusters(true)
        //                 ->withArea(true)
        //                 ->withSubArea(true)
        //                 ->join('voters as captain_voter','captain_voter.id','=','election_roles_by_voters.voter_id')
        //                 ->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
        //                 ->where('election_roles_by_voters.election_role_id',DB::raw($electionRoleCaptainId));
        $arrCaptain=ActivistAllocationAssignment::select($column)
                    ->withActivistAllocation()
                    ->WithElectionRoleByVoter()
                    ->withCity(true)
                    ->withClusters(true)
                    ->withArea(true)
                    ->withSubArea(true)
                    ->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
                    ->join('voters as captain_voter','captain_voter.id','=','election_roles_by_voters.voter_id')
                    ->where('election_roles_by_voters.election_role_id',DB::raw($electionRoleCaptainId))
                    ->where('election_roles_by_voters.election_campaign_id',DB::raw($currentCampaign->id));

                        if($details->table)
                        $arrCaptain=$arrCaptain->where($details->table.'.id',DB::raw($entityId));

                        // Log::info($arrCaptain->toSql());
                        $arrCaptain=$arrCaptain->get();
                        return $arrCaptain;
    }

    //פונקציה המנהלת מערך של שדות לתצוגה בקובץ האקסל ושמות השדות לצוגה בעבור כל אובייקט שר מאה
    public static function columnNameExcel(){
        $arrColumnDisplay=[];
        $arrColumnDisplay[]=array('name'=>'city_mi_id','display'=>'קוד ישוב');
        $arrColumnDisplay[]=array('name'=>'city_name','display'=>'עיר שיבוץ');
        $arrColumnDisplay[]=array('name'=>'cluster_mi_id','display'=>'קוד אשכול');
        $arrColumnDisplay[]=array('name'=>'cluster_name','display'=>'שם אשכול');
        $arrColumnDisplay[]=array('name'=>'countBallotBox','display'=>'מספר קלפיות באשכול');
        $arrColumnDisplay[]=array('name'=>'countBallotBoxReport','display'=>'מספר קלפיות מדווחות');
        $arrColumnDisplay[]=array('name'=>'date_add','display'=>'תאריך שיבוץ');
        $arrColumnDisplay[]=array('name'=>'personal_identity','display'=>'תעודת זהות');
        $arrColumnDisplay[]=array('name'=>'last_name','display'=>'שם משפחה');
        $arrColumnDisplay[]=array('name'=>'first_name','display'=>'שם פרטי');
        $arrColumnDisplay[]=array('name'=>'phone_number','display'=>'טלפון שיבוץ');
        $arrColumnDisplay[]=array('name'=>'role_name','display'=>'תפקיד');
        $arrColumnDisplay[]=array('name'=>'countClusters','display'=>'ראש אשכול');
        $arrColumnDisplay[]=array('name'=>'countHouseHold','display'=>'מספר בתי אב');
        $arrColumnDisplay[]=array('name'=>'countVoters','display'=>'בוחרים משוייכים');
        return $arrColumnDisplay;
    }

    //הורדת קובץ המתאר את פרטי הפעילות של שר מאה
    public static function downloadCsvCaptainActivist($entityType,$entityId){
       
        $index=0;
        $nameFile='דוח שרי מאה';
        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=$nameFile.csv");
        $currentCampaign=ElectionCampaigns::currentCampaign();
  
         $column=self::columnNameExcel();
         $columnDisplay=array_map(function($field){return $field['display'];},$column);
         $columnName=array_map(function($field){return $field['name'];},$column);
         //עמודות נוספות לצצוגה בקובץ האקסל הלקוחות מפונקציות חשוביות בתוך הפונקציה
         $columnDisplay=array_merge($columnDisplay,[
            'ללא סטטוס',
            'תומך',
            'לא תומך',
            'מהסס',
            'תומך ב',
            'סהכ סטטוס סניף',
            'סניף ללא תומך ב',
            'אחוז טיוב',
            'בונוס טיוב',
            'מתוכם תומכים חדשים ',

            'כתובת מאומתת',
            'טלפון מאומת',
            'כמות תומכים שנבדקו ב TM',
            'אחוז  הנבדקים TM מהתומכים המסומנים',
            'תומך סניף+תומך TM',
            'אחוז ההתאמה מבין הנבדקים',
            'תומך סופי',
            'תומך סניף',
            'תומכים שהצבעו',
            'אחוז תומך סניף שהצביעו',

            'תומכים מקלפיות מדווחות',
            'תומכים מקלפיות מדווחות שהצביעו',
            'אחוז מצביעים מתוך תומכים משוייכים מקלפיות מדווחות',
            'זכאות לבונוס 1',
            'זכאות לבונוס 2',
            'סהכ בונוס'

        ]);

        $fullRow = implode(',', $columnDisplay);
        $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
        echo $rowToPrint;

        $captainGeoDetails=self::getAllCaptainDetailsByGeo($entityType,$entityId);
        $arrCaptainId=$captainGeoDetails->map(function($captain){return $captain->captain_details_id;});

        if($entityType!=config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'))
        self::$arrCaptain=$arrCaptainId;

        $supportStatusId=62;//תומך 
        $NotSupportStatusId=63;//לא תומך
        $unDecidedStatusId=64;
        $secondSupportId=65;//תןמך ב'
        
        $countNotHave=self::getCountSupportStatus($currentCampaign->id,null);//כמה ללא סטטוס לכל שר מאה
        $countSupport=self::getCountSupportStatus($currentCampaign->id,$supportStatusId);//מספר תומכים לשר מאה
        $NotSupport=self::getCountSupportStatus($currentCampaign->id,$NotSupportStatusId);//מספר לא תומכים
        $unDecided=self::getCountSupportStatus($currentCampaign->id,$unDecidedStatusId);//מספר לא החלטיים לשר מאה
        $secondSupport=self::getCountSupportStatus($currentCampaign->id,$secondSupportId);//כמות תומכים ב'
        $notInLastFinal=self::getCountSupportStatus($currentCampaign->id,$supportStatusId,true);//כמות תומכים חדשים
        $supportInTm=self::getCountSupportStatus($currentCampaign->id,$supportStatusId,null,true);//כמות תומכים TM
        $SupportAndTmSupport=self::getCountSupportStatus($currentCampaign->id,$supportStatusId,null,true,$supportStatusId);//כמות תומכים סניף ותומכים TM
        $GroupCountFinalElection=self::getCountFinalSupportStatus($currentCampaign->id);//כמות תומכים סופית
        $GroupCountSupportVoted=self::getCountSupportInVoted($currentCampaign->id,$supportStatusId);//כמות תומכים סניף שהצביעו
        $GroupCountSupportInBallotReport=self::getCountSupportInBallotReport($currentCampaign->id,$supportStatusId);//כמות תומכים סניף שבקלפיות מדווחות
        $GroupCountSupportInBallotReportVoted=self::getCountSupportInBallotReport($currentCampaign->id,$supportStatusId,true);//כמות תומכים סניף שבקלפיות מדווחות והצביעו
     
        foreach ($captainGeoDetails as $key => $captain) {
            $captainDetails=array();
            foreach ($columnName as $key => $field) {
                $captainDetails[]=$captain->$field;
            }

            $sumNotHave=0;
            $sumSupport=0;
            $sumNotSupport=0;
            $sumUndecided=0;
            $sumSecondSupport=0;
            $countNotLastFinal=0;
            $countSupportInTm=0;
            $countSupportAndTmSupport=0;
            $contFinalSupport=0;
            $countSupportVoted=0;
            $countSupportInBallotReport=0;
            $countSupportInBallotReportVoted=0;

            $captain->captain_details_id=intval($captain->captain_details_id);
            if(array_key_exists($captain->captain_details_id,$countNotHave))
            $sumNotHave=$countNotHave[$captain->captain_details_id]->countVoter;
            

            if(array_key_exists($captain->captain_details_id,$countSupport))
            $sumSupport=$countSupport[$captain->captain_details_id]->countVoter;
          

            if(array_key_exists($captain->captain_details_id,$NotSupport))
            $sumNotSupport=$NotSupport[$captain->captain_details_id]->countVoter;
          

            if(array_key_exists($captain->captain_details_id,$unDecided))
            $sumUndecided=$unDecided[$captain->captain_details_id]->countVoter;
           

            if(array_key_exists($captain->captain_details_id,$secondSupport))
            $sumSecondSupport=$secondSupport[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$notInLastFinal))
            $countNotLastFinal=$notInLastFinal[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$supportInTm))
            $countSupportInTm=$supportInTm[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$SupportAndTmSupport))
            $countSupportAndTmSupport=$SupportAndTmSupport[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$GroupCountFinalElection))
            $contFinalSupport=$GroupCountFinalElection[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$GroupCountSupportVoted))
            $countSupportVoted=$GroupCountSupportVoted[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$GroupCountSupportInBallotReport))
            $countSupportInBallotReport=$GroupCountSupportInBallotReport[$captain->captain_details_id]->countVoter;

            if(array_key_exists($captain->captain_details_id,$GroupCountSupportInBallotReportVoted))
            $countSupportInBallotReportVoted=$GroupCountSupportInBallotReportVoted[$captain->captain_details_id]->countVoter;
            


            $captainDetails[]=$sumNotHave;
            $captainDetails[]=$sumSupport;
            $captainDetails[]=$sumNotSupport;
            $captainDetails[]=$sumUndecided;
            $captainDetails[]=$sumSecondSupport;//תומך ב

            
            $captainDetails[]=$sumSupport+$sumNotSupport+$sumUndecided+$sumSecondSupport;
            $sum=$sumSupport+$sumNotSupport+$sumUndecided;
            $captainDetails[]=$sum;
            $present=Helper::getPresent($captain->countVoters,$sum,false,true,2);///100;
            $captainDetails[]=$present/100;
            $bonus0=$present>90?1:0;
            $captainDetails[]= $bonus0;

            $captainDetails[]=$countNotLastFinal;//חדשים

            $captainDetails[]=$captain->voter_count_address_correct_supporters;//תומכים וקלפי מאומתת
            $captainDetails[]=$captain->voter_count_mobile_verified_supporters;//תומכים וטלפון מאומת

            $captainDetails[]=$countSupportInTm;//תומכים בטלמרקטינג
            $presentTm=Helper::getPresent($sumSupport,$countSupportInTm,false,true,2);//אחוז התומכים בטלמרטינג מתוך תומכים אצלי
            $captainDetails[]=$presentTm/100;
            $captainDetails[]=$countSupportAndTmSupport;
            $presentSnifAntTm=Helper::getPresent($countSupportInTm,$countSupportAndTmSupport,false,true,2);
            $captainDetails[]=$presentSnifAntTm/100;

            $captainDetails[]=$contFinalSupport;//תומך סופי

            $captainDetails[]=$sumSupport;//תומך סניף
            $captainDetails[]=$countSupportVoted;//תומכים שהצביעו
            $presentSupportVoted=Helper::getPresent($sumSupport,$countSupportVoted,false,true,2);
            $captainDetails[]=$presentSupportVoted/100;//אחוז תומך סניף שהצביעו
           
            $captainDetails[]=$countSupportInBallotReport;//תומכים בקלפיות מדווחות
            $captainDetails[]=$countSupportInBallotReportVoted;//תומכים בקלפיות מדווחות שהצביעו
            $presentSupportBallotBoxVoted=Helper::getPresent($countSupportInBallotReport,$countSupportInBallotReportVoted,false,true,2);//אחוז התומכים מקלפיות מדווחות שהצביעו
            $captainDetails[]=$presentSupportBallotBoxVoted/100;

            $bonus1=$presentSupportBallotBoxVoted>78?1:0;//בונוס 1 אם אחוז תומכים מקלפיות מדווחות שהצביעו
            $bonus2=$presentSupportBallotBoxVoted>85?1:0;//בונוס 2 אם אחוז תומכים מקלפיות מדווחות שהצביעו

            $captainDetails[]=$bonus1;//בונוס 1
            $captainDetails[]=$bonus2;//בונוס 2
            $captainDetails[]=$bonus1+$bonus2+$bonus0;//סהכ בונוסים



          
            $fullRow = implode(',', $captainDetails);
            $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
            echo $rowToPrint;
        }
    }

    //פונקציה המחזירה פרטים נוספים על שרי מאה 
    public static function getArrSubQueryCaptainDetails($electionCampaignId){
        $RoleClusterLeader=config('constants.activists.election_role_system_names.clusterLeader');
        $RoleClusterLeaderId=ElectionRoles::getIdBySystemName($RoleClusterLeader);

        $arrSubQuerySelect=[
            DB::raw('(select count(distinct voters.id) from voters_with_captains_of_fifty as vc join voters on vc.voter_id=voters.id   
                    where election_campaign_id='.$electionCampaignId.' and deleted=0  and captain_id=captain_details_id) as countVoters'),//כמות בוחרים משוייכים לשר מאה
            
            DB::raw('(select count(distinct voters.household_id)  from voters_with_captains_of_fifty as vc join voters on vc.voter_id=voters.id   
                    where election_campaign_id='.$electionCampaignId.' and deleted=0  and  captain_id=captain_details_id) as countHouseHold'),//כמות בתי אב

            DB::raw('(select count(ballot_boxes.id) from ballot_boxes where cluster_id=activists_allocations.cluster_id) as countBallotBox'),//מספר קלפיות באשכל
            DB::raw('(select count(ballot_boxes.id) from ballot_boxes where cluster_id=activists_allocations.cluster_id and ballot_boxes.is_ballot_report=1) as countBallotBoxReport'),//מספר קלפיות מדווחות באשכל
            DB::raw('(select count(activists_allocations_assignments.id) from activists_allocations_assignments 
                            join election_roles_by_voters as role_voter_cluster  on role_voter_cluster.id=activists_allocations_assignments.election_role_by_voter_id
                      where role_voter_cluster.election_campaign_id='.$electionCampaignId.' and role_voter_cluster.voter_id=election_roles_by_voters.voter_id  and role_voter_cluster.election_role_id='.$RoleClusterLeaderId.' ) as countClusters
                    '
                 )//מספר אשכולות בהם השר מאה גם ראש אשכל
        ];

        return $arrSubQuerySelect;
    }

    //פונקציה המקבלת סטטוס תמיכה ןמחזירה כמות בוחרים בהתאם לסטטוס התמיכה של תומך סניף
    public static function QuerySupportStatus($electionCampaignId,$support_status_id){
        $groupStatus=VoterCaptainFifty::select(
            [
               'voters_with_captains_of_fifty.captain_id',
                DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as countVoter')
            ]
        )
        ->leftJoin('voter_support_status',function($query)use($electionCampaignId){
                $query->on('voter_support_status.voter_id','=','voters_with_captains_of_fifty.voter_id')
                      ->on('voter_support_status.election_campaign_id','=',DB::raw($electionCampaignId))
                      ->on('voter_support_status.entity_type','=',DB::raw(0));
        })
    
        ->where('voters_with_captains_of_fifty.election_campaign_id',DB::raw($electionCampaignId))
        ->where('voters_with_captains_of_fifty.deleted',DB::raw(0))
        ->where('voter_support_status.support_status_id',$support_status_id);

        return  $groupStatus;

    }

    //הפונקציה מקבלת קוד ססטוס תמיכה
    //ומחזירה את כמות הבוחרים בהתאם לסטטוס ובהתאם לפרטים הנוספים:
    //lastFinal=שלא היו תומכים סופית שנה שעברה
    //isTm-תומכים שנבדקו בTM
    //statusTm-תומכים סניף  שנבדקו בTM והסטטוס שלהם כפי שהתקבל 
    
    public static function getCountSupportStatus($electionCampaignId,$support_status_id=null,$lastFinal=null,$isTm=null,$statusTm=null){
        $groupStatus=VoterCaptainFifty::select(
            [
               'voters_with_captains_of_fifty.captain_id',
                DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as countVoter')
            ]
        )
        ->leftJoin('voter_support_status',function($query)use($electionCampaignId){
                $query->on('voter_support_status.voter_id','=','voters_with_captains_of_fifty.voter_id')
                      ->on('voter_support_status.election_campaign_id','=',DB::raw($electionCampaignId))
                      ->on('voter_support_status.entity_type','=',DB::raw(0));
        })
    
        ->where('voters_with_captains_of_fifty.election_campaign_id',DB::raw($electionCampaignId))
        ->where('voters_with_captains_of_fifty.deleted',DB::raw(0));
       
        if($lastFinal){
            $groupStatus->leftJoin('voter_support_status as lastStatus',function($query){
                $query->on('lastStatus.voter_id','=','voters_with_captains_of_fifty.voter_id')
                      ->on('lastStatus.election_campaign_id','=',DB::raw(24))
                      ->on('lastStatus.support_status_id','=',DB::raw(58))
                      ->on('lastStatus.entity_type','=',DB::raw(2));
            })->whereNull('lastStatus.id');
        }

        if($isTm){
            $groupStatus->join('voter_support_status as tmStatus',function($query)use($electionCampaignId,$statusTm){
                $query->on('tmStatus.voter_id','=','voters_with_captains_of_fifty.voter_id')
                      ->on('tmStatus.election_campaign_id','=',DB::raw($electionCampaignId))
                      ->on('tmStatus.entity_type','=',DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')));

                      if($statusTm)
                      $query->on('tmStatus.support_status_id','=',DB::raw($statusTm));
        });
       
        }
  

        if($support_status_id)
        $groupStatus=$groupStatus->where('voter_support_status.support_status_id',$support_status_id);
        else
        $groupStatus=$groupStatus->whereNull('voter_support_status.support_status_id');

        if(count(self::$arrCaptain)>0)
        $groupStatus->whereIn('voters_with_captains_of_fifty.captain_id',self::$arrCaptain);

        $groupStatus=$groupStatus->groupBy('voters_with_captains_of_fifty.captain_id');
        
        // Log::info($groupStatus->toSql());

        $groupStatus=$groupStatus->get();
        $hash=Helper::makeHashCollection($groupStatus,'captain_id');
        // Log::info(json_encode($hash));
        return $hash;
    }

        public static function getCountSupportInBallotReport($electionCampaignId,$supportStatusId,$onlyVoted=false){
            $query=self::QuerySupportStatus($electionCampaignId,$supportStatusId);
            $query->withVoterInBallot()->where('ballot_boxes.is_ballot_report',DB::raw(1));
            
            if($onlyVoted)
            $query->withVotes();

            $groupStatus=$query->groupBy('voters_with_captains_of_fifty.captain_id');
        
        // Log::info($groupStatus->toSql());

        $groupStatus=$groupStatus->get();
        $hash=Helper::makeHashCollection($groupStatus,'captain_id');
        // Log::info(json_encode($hash));
        return $hash;
        }

        //כמות תומכים סניף לשר מאה שהצביעו 
        public static function getCountSupportInVoted($electionCampaignId,$supportStatusId){
            $query=self::QuerySupportStatus($electionCampaignId,$supportStatusId);
            $query->withVotes();

        $groupStatus=$query->groupBy('voters_with_captains_of_fifty.captain_id');
        $groupStatus=$groupStatus->get();
        $hash=Helper::makeHashCollection($groupStatus,'captain_id');
      
        return $hash;
        }


    
        public static function getCountFinalSupportStatus($electionCampaignId){
            $final=config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
            $arrSupportStatus=SupportStatus::getSupportStatusByElection($electionCampaignId);

            $groupStatus=VoterCaptainFifty::select(
                [
                   'voters_with_captains_of_fifty.captain_id',
                    DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as countVoter')
                ]
            )
            ->join('voter_support_status',function($query)use($electionCampaignId,$final){
                    $query->on('voter_support_status.voter_id','=','voters_with_captains_of_fifty.voter_id')
                          ->on('voter_support_status.election_campaign_id','=',DB::raw($electionCampaignId))
                          ->on('voter_support_status.entity_type','=',DB::raw($final));
            })
        
            ->where('voters_with_captains_of_fifty.election_campaign_id',DB::raw($electionCampaignId))
            ->where('voters_with_captains_of_fifty.deleted',DB::raw(0))
            ->whereIn('voter_support_status.support_status_id',$arrSupportStatus)
            ->groupBy('voters_with_captains_of_fifty.captain_id');

            if(count(self::$arrCaptain)>0)
            $groupStatus=$groupStatus->whereIn('voters_with_captains_of_fifty.captain_id',self::$arrCaptain);

            $groupStatus=$groupStatus->get();

            $hash=Helper::makeHashCollection($groupStatus,'captain_id');
           
            return $hash;
        }


        //עדכון קלפיות אם הם מדווחות
        //הפונקציה בודקת בעבור כל קלפי כמה דיווחי הצבעות היו ובודקת אם זה גדול מתוצאות ועדת בחירות-כמות בוחרים בקלפי בהתאם לאחוז שנקבע לעייל
        public static function updateIfBallotBoxIsReportingForExcelCaptain(){
        $systemNameVotesReport=ElectionVotesReportSource::$commission_report;
        $commissionReportSourceId=ElectionVotesReportSource::getIdBySystemName($systemNameVotesReport);
            $currentCampaign=ElectionCampaigns::currentCampaign();
            $ballotBox=BallotBox::select(
                'ballot_boxes.id',
                 DB::raw('election_votes_report.count_votes as countVoters'),
                 DB::raw('count(distinct votes.voter_id) as countVotes')
            )
                        ->withElectionVotesReport($currentCampaign->id,$commissionReportSourceId)
                        ->withVoterVotesCurrentCampaign($currentCampaign->id)
                        ->withCluster()
                        ->where('clusters.election_campaign_id',DB::raw($currentCampaign->id))
                        ->groupBy('ballot_boxes.id')
                        ->havingRaw('((countVotes)*100/(countVoters))>'.self::$presentVotesBallotIsReporting)->get();
                
                
                $arrBallotBox=$ballotBox->map(function($a){return $a->id;});
                $ballotBox=BallotBox::whereIn('id',$arrBallotBox)->update(['is_ballot_report'=>1]);
          
        }


}