<?php

namespace App\Libraries\Services\ActivistApi;

use App\Libraries\Helper;
use App\Libraries\HelperDate;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\VoterPhoneService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsTasksSchedule;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\Banner;
use App\Models\ElectionRolesByVoters;
use App\Models\SupportStatus;
use App\Models\User;
use App\Models\Votes;
use App\Models\VoteSources;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

//class that manage all function activist city mobile
class ActivitiesCityMobileServices
{

    private static $countVoterByCaptainId = null;
    private static $countSupportVoterByCaptainId = null;
    private static $countVoterByCluster = null;
    private static $countSupportVoterByCluster = null;

    //-----voter----
    public static function getVoterDetailsByVoterKey($voter_key, $horizontalPhone = false, $arrCondition = null, $includeCluster = false,$includeVote=false)
    {
        $voter = Voters::select('id')->where('key', $voter_key)->first();
        if (!$voter)
            throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));

        $arr_cond = [['voters.id', $voter->id]];
        if ($arrCondition)
            $arr_cond = array_merge($arr_cond, $arrCondition);

        $voterDetails = self::getVotersDetails($arr_cond, $horizontalPhone, $includeCluster,$includeVote);

        if ($voterDetails && count($voterDetails) > 0) {
            $voterDetails[0]['near_by'] = VoterDetailsService::getNearByVoterByVoterObject($voterDetails[0]);
            return $voterDetails[0];
        } else
            throw new Exception(config('errors.elections.VOTER_NOT_CONNECT_ACTIVIST_USER'));
    }

    public static function getQueryVoterDetails($arrWhereCondition){

        $currentElectionCampaigns = ElectionCampaigns::currentCampaign();
        $LastElectionCampaigns = ElectionCampaigns::previousCampaign();
        $query = Voters::select(self::ListSelectVoterColumn()) //self::ListSelectVoterColumn()['voters.first_name','voters.last_name']
            
            ->with([
                'voterPhones' => function ($innerQuery) {
                    $innerQuery->select('voter_phones.id as phone_id', 'voter_phones.phone_number', 'voter_phones.phone_type_id', 'voter_phones.voter_id', 'verified', 'wrong')
                        ->where('voter_phones.deleted', 0) 
                        ->withVoters()->orderBy(DB::raw('voter_phones.wrong,voter_phones.updated_at DESC, voter_phones.id'));//orderBy('voter_phones.id', 'DESC');//Voters::orderPhoneQuery()
                        // if(env('APP_ENV') != 'staging'){ //--להוריד בעלאת גירסה
                        //     $innerQuery->where('voter_phones.wrong', 0);
                        // }
                }
            ])
            //--joins
            ->withActualStreet(true)
            ->withFinalSupportStatus($LastElectionCampaigns->id, true)
            ->withTransportation($currentElectionCampaigns->id)
            ->leftJoin('voters as voter_driver','voter_transportations.voter_driver_id', '=', 'voter_driver.id')
            //->withVoterDriver()
            ->withCity()
            ->withSupportStatuses($currentElectionCampaigns->id) //status_voter
            ->withVoterBallotAddressDetails($currentElectionCampaigns->id) //address ballot
            ->withCaptain50Only($currentElectionCampaigns->id, true) //connect to captain 50
            ->WithCaptainVoterDetails() //connect to captain 50 details
            ->withUser();
            $query->addSelect('votes.key as voted');
            $query->withElectionVotes($currentElectionCampaigns->id,true)
             //---where
            ->where($arrWhereCondition);

            return  $query;
    }

    public static function getVotersDetails($arrWhereCondition, $horizontalPhone = false, $includeCluster = false,$includeVote=false,$arrCluster=false)
    {
        $query=self::getQueryVoterDetails($arrWhereCondition);

        if($arrCluster)
            $query=$query->whereIn('ballot_boxes.cluster_id',$arrCluster);
        if ($includeCluster) {
            $query = $query->withCluster_leader();
        }

        $result=self::resultVoterDetails( $query,$horizontalPhone);

        return $result;
    }

    public static function resultVoterDetails($query,$horizontalPhone){
        $allVoterDetails = $query->get()->makeHidden('id');

        if (count($allVoterDetails) > 0) {

            foreach ($allVoterDetails as $key => $voterDetails) {
                //phones
                if ($horizontalPhone) {

                    $voterDetails = VoterDetailsService::horizontalPhone($voterDetails);
                } //--end phone

                $voterDetails->ballot_mi_id = BallotBox::getLogicMiBallotBox($voterDetails->ballot_mi_id); //ballot box
                $voterDetails['near_by'] = VoterDetailsService::getNearByVoterByVoterObject($voterDetails);
            }
        }

        return $allVoterDetails;
    }

    public static function searchVoterByPersonalIdentityAndArrCluster($personal_identity,$arrCluster){
      
       $voter=self::getVotersDetails([['voters.personal_identity',$personal_identity]],true,false,false,$arrCluster);
       
       if($voter && count($voter))
       return $voter[0];
   return false;
    }

    public static function searchVoterByBallotDetails($cluster_id,$ballot_box_id,$voter_serial_number){
        $arrFields=[
            ['voters_in_election_campaigns.voter_serial_number',$voter_serial_number],
            ['ballot_boxes.cluster_id',$cluster_id],
            ['ballot_boxes.id',$ballot_box_id]
        ];
        $voter=self::getVotersDetails($arrFields,true);

        if($voter && count($voter))
        return $voter[0];
    return false;
     }
    // public static function getVoterPersonalIdentityOrVoterSerialNumber($personal_identity,$cluster_id=null,$Ballot_box_id=null,$voter_serial_number=null){
    //     $funcWhere = function($query)use($personal_identity)
    //         {  
    //             $query->where('voters.personal_identity',$personal_identity);
    //         };
     
    //         $voter=self::getVotersDetails($funcWhere,true);
    //         if($voter)
    //         return $voter[0];
    //         else
    //         return false;
    //  }
    //
    public static function setVoterDetails($object_Voter, $role_id, $activist_voter_id)
    {
        $arrFieldUpdate = [];
        $driver_id = null;
        //  DB::beginTransaction();
        $role_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        try {
            $currentElectionCampaigns = ElectionCampaigns::currentCampaign();
            $voter = Voters::select('id')->where('key', $object_Voter->personal_identity)->first();
            if (null == $voter) throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));

            

            $voterFieldsUpdate = ['first_name', 'last_name', 'ethnic_group_id', 'religious_group_id', 'gender', 'email', 'sephardi', 'city_id', 'street_id', 'house', 'house_entry', 'flat', 'actual_address_correct'];
            //save voter details
            $arrFieldUpdate = VoterDetailsService::updateVoterDetails($object_Voter, $voter->id, $voterFieldsUpdate,false)->arrFieldUpdate;


            //save phone
            if (property_exists($object_Voter, 'home_phone_number'))
                $isSaveMobile = VoterDetailsService::saveHorizontalPhoneByVoterKey($object_Voter, $voter->id);

            if ($isSaveMobile)
                $arrFieldUpdate[] = 'mobile_phone';


            //check if voter has any phone before update status support or update un support not need check phone
          
            if($object_Voter->is_shas_supporter==0 || VoterPhoneService::checkVoterHasAnyPhone($voter->id)){
                   //save supportStatus
                $isUpdate = VoterDetailsService::saveVoterSupportStatus($voter->id, $currentElectionCampaigns->id, $object_Voter->is_shas_supporter);
                if ($isUpdate)
                    $arrFieldUpdate[] = 'voter_support_status';
            }
         

         

            //its update by captain fifty
            if ($role_id == $role_captain_id) {
                //save recognized to captain fifty
                //$voterCaptain=VoterDetailsService::getVoterByKey();
                //if($voterCaptain)
                VoterDetailsService::saveRecognizedCaptain($voter->id, $currentElectionCampaigns->id, $activist_voter_id, $object_Voter->recognized);
            } else { //update by cluster
                // $captain_key=$object_Voter->captain_tz;//fields not use we can not connect captain by cluster
                $driver_key = $object_Voter->voter_driver_tz;
                if (!is_null($driver_key) && strcmp($driver_key, '') != 0)
                    $driver_id = self::checkDriverByKey($driver_key, $currentElectionCampaigns->id);
            }

            //save need Transportations
            $tans = VoterDetailsService::SaveVoterTransportations($voter->id, $currentElectionCampaigns->id, $object_Voter->need_transportation, 0, $driver_id);

            //-----------after save-------
            //if the user activist update sum details
            if (count($arrFieldUpdate) > 0)
                VoterDetailsService::putUserActivistOnVoterDetails($arrFieldUpdate, $role_id, $activist_voter_id, $voter->id, $currentElectionCampaigns->id);


            $objectAfterSave = self::getVoterDetailsByVoterKey($object_Voter->personal_identity, true, null);
            return $objectAfterSave;
        } catch (\Exception $e) {
            // DB::rollback();
            throw $e;
            // return $e;
        }


        // return $object;
    }

    //arr column voter details
    public static function ListSelectVoterColumn()
    {
        $ClusterFullNameQuery = Cluster::getClusterFullNameQuery('cluster_name', true);
        $arrCol = [
            DB::raw('distinct voters.key as personal_identity'),
            //'personal_identity',
            'voters.household_id',
            'voters.key',
            'voters.id',
            'voters.first_name',
            'voters.last_name',
            'voters.ethnic_group_id', //as ethnic_id
            'voters.religious_group_id',
            'voters.gender',
            'voters.email',
            'voters.sephardi', //as is_sephardi
            'voters.actual_address_correct',
            'c.name as cityName',
            'actual_streets.name as street_name',
            //phones
            DB::raw('(CASE WHEN  support_status0.level > 0 then 1 
                           WHEN  support_status0.level < 0 then 0 
                           WHEN  support_status0.level = 0 then 2 
                           End) as is_shas_supporter
                           '),

            DB::raw('(CASE WHEN  support_status2.level > 0 then 1 
                           WHEN  support_status2.level < 0 then 0 
                           WHEN  support_status2.level = 0 then 2 
                           End) as is_shas_final_supporter
                           '),
            //'support_status0.likes as is_shas_supporter', //shas support 
            //'support_status1.likes as is_shas_tm_supporter', //tm support 
            //'support_status2.likes as is_shas_final_supporter', //final support
            'support_status_Last_Final.likes as last_final_supporter',

            DB::raw('if(voters.city_id is null,voters.mi_city_id,voters.city_id) as city_id'),
            DB::raw('if(voters.street_id is null,voters.mi_street_id,voters.street_id) as street_id'),
            DB::raw('if(voters.house is null,voters.mi_house,voters.house) as house'),
            DB::raw('if(voters.house_entry is null,voters.mi_house_entry,voters.house_entry) as house_entry'),
            DB::raw('if(voters.flat is null,voters.mi_flat,voters.flat) as flat'),
            //--transporation
            DB::raw('If(voter_transportations.id is null,0,1) as need_transportation'),
            'voter_driver.key as voter_driver_tz',
            'role_driver.phone_number as phone_voter_driver',
            //address ballot
            'ballot_boxes.mi_id as ballot_mi_id',
            'ballot_boxes.cluster_id',
            DB::raw($ClusterFullNameQuery),
            DB::raw("concat(cities.name,' - ',clusters.street,' ', clusters.house) As cluster_address "),

            //captain
            'captain_voters.key as captain_tz',
            'captain_voters.key as captain_id',
            DB::raw("concat(captain_voters.last_name,' ',captain_voters.first_name) As captain_fifty_full_name"),
            'voters_with_captains_of_fifty.recognized',
            'voters_with_captains_of_fifty.handled',
            'voters_in_election_campaigns.voter_serial_number'

        ];
        return  $arrCol;
    }

    //--------------------captain voter details------------------------

    public static function getAllVoterByUserCaptain($election_campaign_id, $personal_id_number = null,$finalSupports=false)
    {
        $arrCondition = [
            ['voters_with_captains_of_fifty.captain_id', Auth::user()->voter_id],
            ['voters_with_captains_of_fifty.election_campaign_id', $election_campaign_id]
        ];
        if ($personal_id_number)
            $arrCondition[] = ['voters.personal_identity', $personal_id_number];

        if($finalSupports)
            $arrCondition[] = ['support_status2.likes', DB::raw(1)];

        $voterForCaptainFifty = self::getVotersDetails($arrCondition, true,false,$finalSupports);
        return $voterForCaptainFifty;
    }


    //presents details
    public static function getPresentsVoterWithAllDetailsByUseCaptainId($election_campaign_id)
    {
        $countVoter = self::getCountVoterByCaptainId(Auth::user()->voter_id, $election_campaign_id);
        if ($countVoter == 0 || is_null($countVoter))
            return 0;
        $countVoterAllDetails = VoterDetailsService::getCountVoterByCaptainIdWithAllPresent(Auth::user()->voter_id, $election_campaign_id);

        return ($countVoterAllDetails * 100) / $countVoter;
    }

    //present support voter captain 50
    public static function getPresentsVoterSupportVoterByUseCaptainId($election_campaign_id)
    {

        $countVoter = self::getCountVoterByCaptainId(Auth::user()->voter_id, $election_campaign_id);
        if ($countVoter == 0 || is_null($countVoter))
            return 0;

        $countSupportVoter = self::getCountSupportVoterByCaptainId(Auth::user()->voter_id, $election_campaign_id);
        $present = Helper::getPresent($countVoter, $countSupportVoter, true);

        return $present;
    }

    //present un_support voter captain 50
    public static function getPresentsVoterUnSupportVoterByUseCaptainId($election_campaign_id)
    {
        $countVoter = self::getCountVoterByCaptainId(Auth::user()->voter_id, $election_campaign_id);
        if ($countVoter == 0 || is_null($countVoter))
            return 0;
        $countUnSupportVoter = VoterDetailsService::getPresentUnSupportByUserCaptainId(Auth::user()->voter_id, $election_campaign_id);
        $present = Helper::getPresent($countVoter, $countUnSupportVoter, true);
        return  $present;
    }

    //present support or un decided voter by captain with phone verified and present without phone
    public static function getPresentsSupportVoterWithPhoneByUseCaptainId($election_campaign_id)
    {
        $countNotOpposedVoter =VoterDetailsService::getCountVoterNotOpposedByCaptainId(Auth::user()->voter_id, $election_campaign_id);
        if ($countNotOpposedVoter == 0 || is_null($countNotOpposedVoter))
            return 0;
        //count support voter and undecided voter with verified phone
        $countSupportVoterWithVerified = VoterDetailsService::getCountVoterSupportByUserCaptainId(Auth::user()->voter_id, $election_campaign_id, true,true);
       // count support and undecided voter
       $countSuppAndUnDecided= VoterDetailsService::getCountVoterSupportByUserCaptainId(Auth::user()->voter_id, $election_campaign_id, false,true);
       //count support and undecided without verified phone
       $countWithoutVerified=$countSuppAndUnDecided-$countSupportVoterWithVerified;

       $presentVerifiedPhone = Helper::getPresent($countNotOpposedVoter, $countSupportVoterWithVerified, true);
       $presentNotVerifiedPhone= Helper::getPresent($countNotOpposedVoter, $countWithoutVerified, true);
        return  array("present_with_verified"=>$presentVerifiedPhone,"present_without_verified"=>$presentNotVerifiedPhone);
    }

    //function get role id and election campaign and return num task present for today
    public static function getPresentForTodayByRole($role_id, $election_campaign_id)
    {

        //defulte value present;
        $today_presents = 0;
        $presents = ActivistsTasksSchedule::select()->where('role_id', $role_id)->where('election_campaign_id', $election_campaign_id)->where('active', 1)->first();


        if ($presents) {
            $startDateTask = $presents->start_date;
            $endDateTask = $presents->end_date;

            //---calculate present grow all day
            $numberTaskDays = HelperDate::getNumDayBetween($startDateTask, $endDateTask) + 1;
            
            //grow presents day ,calculate by  num days task / num present
            $present_day = ($presents->end_percents - $presents->start_percents) / $numberTaskDays;

            $date_now = date("Y-m-d"); // this format is string comparable

            //check if today between date task
            if ($date_now >= $startDateTask && $date_now <= $endDateTask) {
                //check number day passed
                $passedDay = HelperDate::getNumDayBetween($startDateTask, $date_now) + 1;

                //calculate today presents by num day passed * presents day + startPresents
                $today_presents = ($passedDay * $present_day) + $presents->start_percents;
            }
            //today passed end date
            else if ($date_now > $endDateTask)
                return $presents->end_percents;
        }

        return  $today_presents;
    }

    //present none exist phone
    // public static function getPresentsVoterNotWithPhoneByUseCaptainId($election_campaign_id){
    //     $countVoter=self::getCountVoterByCaptainId(Auth::user()->voter_id,$election_campaign_id);
    //     $countVoterNotExistPhone=VoterDetailsService::getCountVoterParamsExistPelePhone(Auth::user()->voter_id,$election_campaign_id,false);

    //     return  ($countVoterNotExistPhone*100)/$countVoter;
    // }

    //count voter by captain id
    public static function getCountVoterByCaptainId($captain_voter_id, $election_campaign_id)
    {
        if (is_null(self::$countVoterByCaptainId))
            self::$countVoterByCaptainId = VoterDetailsService::getCountVoterByCaptainId($captain_voter_id, $election_campaign_id);

        return self::$countVoterByCaptainId;
    }

    //count support voter by captain id
    public static function getCountSupportVoterByCaptainId($captain_voter_id, $election_campaign_id)
    {
        if (!self::$countSupportVoterByCaptainId)
            self::$countSupportVoterByCaptainId = VoterDetailsService::getCountVoterSupportByUserCaptainId($captain_voter_id, $election_campaign_id);

        return self::$countSupportVoterByCaptainId;
    }

    //present of details that captain has 
    public static function getPresentDetailsVoterDon($election_campaign_id)
    {
        //sum voter in group of captain 
       // $countVoter = self::getCountVoterByCaptainId(Auth::user()->voter_id, $election_campaign_id);
       $countNotOpposedVoter =VoterDetailsService::getCountVoterNotOpposedByCaptainId(Auth::user()->voter_id, $election_campaign_id);
      
        if ($countNotOpposedVoter == 0 || is_null($countNotOpposedVoter))
            return 0;
        //sum present of details by voter with share present 
        $countPresentDon = VoterDetailsService::getCountPresentVoterDetailDon(Auth::user()->voter_id, $election_campaign_id);
       
        return $countPresentDon / $countNotOpposedVoter;
    }

    //function return count of voter for captain that final support
    public static function getCountVoterShasSupportByCaptain($election_campaign_id){
        $captain_voter_id=Auth::user()->voter_id;
        $SupportTypeArr=SupportStatus::getSupportStatusByElection($election_campaign_id);
        $entityTypeFinal=config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
        $countFinalShasSupporter=VoterDetailsService::getCountVoterSupportTypetByUserCaptainId($captain_voter_id, $election_campaign_id,$SupportTypeArr,false,$entityTypeFinal);
    return $countFinalShasSupporter;
    }

    //function return count voters that final support and votes in campaign by captain id
    public static function getCountVoterShasSupportAndVotesInCampaignByCaptain($election_campaign_id){
        $captain_voter_id=Auth::user()->voter_id;
        $SupportTypeArr=SupportStatus::getSupportStatusByElection($election_campaign_id);
        $entityTypeFinal=config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
        $countFinalShasSupporterVotes=VoterDetailsService::getCountVoterSupportTypetByUserCaptainId($captain_voter_id, $election_campaign_id,$SupportTypeArr,false,$entityTypeFinal,true);
    return $countFinalShasSupporterVotes;
    }

    //function return count of voter final support shas need transportations
    public static function getCountFinalSupportNeedTransporationByCaptain($election_campaign_id){
        $captain_voter_id=Auth::user()->voter_id;
        $SupportTypeArr=SupportStatus::getSupportStatusByElection($election_campaign_id);
        $entityTypeFinal=config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
        $countFinalShasSupporterTrans=VoterDetailsService::getCountVoterSupportTypetByUserCaptainId($captain_voter_id, $election_campaign_id,$SupportTypeArr,false,$entityTypeFinal,false,true);
    return $countFinalShasSupporterTrans;

    }
    //-----------------cluster voter------------

    //function election campaign and return all voter in specific cluster of user
    //the function can get personal_id_number and return the person in the cluster
    public static function getAllVoterByClusterVoterId($election_campaign_id, $personal_id_number = null,$finalSupports=false,$ballot_box_id=false)
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
        $arrCondition = [
            ['election_roles_cluster.voter_id', Auth::user()->voter_id],
            ['election_roles_cluster.election_role_id', $role_id],
            ['election_roles_cluster.election_campaign_id', $election_campaign_id],
        ];

        if ($personal_id_number)
            $arrCondition[] = ['voters.personal_identity', $personal_id_number];
        
        if($finalSupports)
        $arrCondition[] = ['support_status2.likes', DB::raw(1)];

        if($ballot_box_id)
        $arrCondition[] = ['ballot_boxes.id', DB::raw($ballot_box_id)];
        
      
        $voterForCaptainFifty = self::getVotersDetails($arrCondition,true,true,$finalSupports);

        return $voterForCaptainFifty;
    }

    public static function getListVotersForClusterBySpecificCondition($election_campaign_id){

        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
        $arrCondition = [
            ['election_roles_cluster.voter_id', Auth::user()->voter_id],
            ['election_roles_cluster.election_role_id', $role_id],
            ['election_roles_cluster.election_campaign_id', $election_campaign_id],
        ];

        $query = self::getQueryVoterDetails($arrCondition);
        $query->withCluster_leader();
        $query->withConditionVoterCluster($election_campaign_id);

        //  $query->whereIn('ballot_boxes.cluster_id',$arrCluster);
        // Log::info($query->toSql());
        // Log::info($query->getBindings());
        
        $voterForCaptainFifty=self::resultVoterDetails($query,true);
        // Log::info($voterForCaptainFifty);
        return $voterForCaptainFifty;

    }


    public static function addVoteToCaptainFiftyByCaptain($key, $phone_number, $election_campaign_id)
    {

        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        VoterDetailsService::addVoterWithCaptainFifty($key, $phone_number, Auth::user()->voter_id, $election_campaign_id, Auth::user()->voter_id, $role_id);
    }

    public static function addVoteToCaptainFiftyCluster($key, $phone_number, $election_campaign_id, $captain_id, $driver_id = null)
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
        VoterDetailsService::addVoterWithCaptainFifty($key, $phone_number, $captain_id, $election_campaign_id, Auth::user()->voter_id, $role_id, $driver_id);
    }

    //----counters
    public static function getCountVoterByCluster($arr_cluster_id, $election_campaign_id)
    {
        if (is_null(self::$countVoterByCluster))
            self::$countVoterByCluster = ClusterService::getCountVoterByClusterId($arr_cluster_id, $election_campaign_id);

        return self::$countVoterByCluster;
    }

    public static function getCountSupportVoterByCluster($arr_cluster_id, $election_campaign_id)
    {
        if (is_null(self::$countSupportVoterByCluster))
            self::$countSupportVoterByCluster = ClusterService::getCountSupportVoterByClusterId($arr_cluster_id, $election_campaign_id);

        return self::$countSupportVoterByCluster;
    }

    //calculate present not voter support 
    public static function getPresentNotSupportVoterByCluster($arr_cluster_id, $election_campaign_id)
    {
        $countVoterInCluster = self::getCountVoterByCluster($arr_cluster_id, $election_campaign_id);
        $countNotSupportVoters = ClusterService::getCountNotSupportVoterByClusterId($arr_cluster_id, $election_campaign_id);
        $present = Helper::getPresent($countVoterInCluster, $countNotSupportVoters, true);
        return  $present;
    }

    //calculate present voter support by cluster
    public static function getPresentSupportVoterByCluster($arr_cluster_id, $election_campaign_id)
    {
        $countVoterInCluster = self::getCountVoterByCluster($arr_cluster_id, $election_campaign_id);
        $countSupportVoters = self::getCountSupportVoterByCluster($arr_cluster_id, $election_campaign_id);
        $present = Helper::getPresent($countVoterInCluster, $countSupportVoters, true);
        return  $present;
    }

    //calculate present support voter and undecided with verified phone and without verified phone
    public static function getPresentVoterWithVerifiedPhoneByCluster($arr_cluster_id, $election_campaign_id)
    {
        //count support voter
        $countNotOpposedVoter = ClusterService::getCountVoterNotOpposedClusterArr($arr_cluster_id, $election_campaign_id);
        $countWithVerifiedPhone = ClusterService::getCountSupportVoterWithVerifiedPhoneByClusterId($arr_cluster_id, $election_campaign_id,true);
        $countSupportAndUnDecided=ClusterService::getCountSupportVoterByClusterId($arr_cluster_id, $election_campaign_id,null,false,true);
        $countVoterWithoutVerified=$countSupportAndUnDecided-$countWithVerifiedPhone;

        $presentWithVerified = Helper::getPresent($countNotOpposedVoter, $countWithVerifiedPhone, true);
        $presentWithoutVerified=Helper::getPresent($countNotOpposedVoter, $countVoterWithoutVerified, true);
        return array('presentWithVerified'=>$presentWithVerified,'presentWithoutVerified'=>$presentWithoutVerified);
    }

    //calculate present of details voter
    public static function getPresetDetailsVoterDonByCluster($arr_cluster_id, $election_campaign_id)
    {
       // $countVoterInCluster = self::getCountVoterByCluster($arr_cluster_id, $election_campaign_id);
       
       $countNotOpposedVoter = ClusterService::getCountVoterNotOpposedClusterArr($arr_cluster_id, $election_campaign_id);

        $presentVoterDetails = ClusterService::getPresentVoterDetailsDon($arr_cluster_id, $election_campaign_id);
        if ($countNotOpposedVoter == 0)
            return 0;
        return round($presentVoterDetails / $countNotOpposedVoter);
    }



    //-------------------------------------------
    //search voter by details
    public static function searchVoterByDetails($object, $election_campaign_id)
    {

        $personal_identity = $object->personal_id_number;
        $personal_identity=Helper::trimStartZero($personal_identity);
        $city_id = strcmp($object->city_id, '') == 0 ? null : $object->city_id;
        $street_id = strcmp($object->street_id, '') == 0 ? null : $object->street_id;
        $house = strcmp($object->house, '') == 0 ? null : $object->house;
        $last_name = $object->last_name;
        $first_name = $object->first_name;
        $mobile_phone_number = $object->mobile_phone_number;

        if (strcmp($mobile_phone_number, '') == 0 || is_null($mobile_phone_number))
            throw new Exception(config('errors.elections.VOTER_PHONE_REQUIRED_ON_ADD_VOTE'));

        $voter = VoterDetailsService::getVoterByPersonalIdentityOrAddress($personal_identity, $city_id, $street_id, $house, $last_name, $first_name, $mobile_phone_number, $election_campaign_id, Auth::user()->voter_id);

        return  $voter;
    }

    public static function getBannerLink()
    {
        $banner = Banner::select('link')->where('active', 1)->orderBy('updated_at', 'DESC')->first();
        if ($banner)
            return $banner->link;
        else
            return null;
    }

    public static function checkDriverByKey($voter_driver_key, $election_campaign_id)
    {

        $role_id_driver = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.driver'));

        $voterDriver = Voters::select()->where('key', $voter_driver_key)->first();
        if (!$voterDriver)
            throw new Exception(config('errors.elections.VOTER_DRIVER_NOT_EXIST'));
        if (!ElectionRoleByVoterService::checkIsExistRoleByKeyVoter($role_id_driver, $voterDriver->id, $election_campaign_id))
            throw new Exception(config('errors.elections.VOTER_DRIVER_NOT_EXIST'));
        $voter_driver_id = $voterDriver->id;

        return $voter_driver_id;
    }


    //get all details of activist voter in cluster or ballot_number
    public static function getListVoterActivist($arrClusterId,$ballot_number=null,$election_campaign_id){

        $ballotBoxId=null;
        $arrActivistRes=array();
        if(!is_null($ballot_number)){//if insert ballot number for get activist voter
            $ballot_box_Number=BallotBox::resetLogicMiBallotBox($ballot_number);//remove logic ballot box number
            $ballotBoxId=BallotBox::getBallotBoxIdByMi_id_ClusterId($ballot_box_Number,$arrClusterId);//search id of ballot box number
        }
        
        if(!is_null($ballotBoxId))
        $arrActivist=ClusterService::getListBallotActivistByCluster_ballotBox($arrClusterId,$ballotBoxId,$election_campaign_id);
        else
        $arrActivist=ClusterService::getListVoterActivistByCluster_ballot($arrClusterId,$ballotBoxId,$election_campaign_id);
      
        if($arrActivist && count($arrActivist)>0){
            foreach ($arrActivist as $key => $activist) {
                $activist=(object)$activist;
                $appRole=new MobileApplicationRole();
                $role=$activist->system_name;
                if(property_exists ($appRole,$role)){
                    $activeVoter=array('last_name'=>$activist->last_name,
                    'first_name'=>$activist->first_name,
                    'personal_identity'=>$activist->personal_identity,
                    'image_url'=>null,
                    'role_id'=>MobileApplicationRole::$$role,
                    'system_name'=>$activist->system_name,
                    'phone_number'=>$activist->phone_number,
                    'additionalRoleInfo'=>ClusterService::getTitleByActivist($role,$activist),
                    'activist_description'=>isset($activist->role_shift_system_description)?$activist->activist_description.' - '. $activist->role_shift_system_description:$activist->activist_description,
                    'role_name'=>$activist->activist_description
                );

                if(isset($activist->mi_ballot_box)){
                    $activeVoter['ballot_mi_id']=BallotBox::getLogicMiBallotBox($activist->mi_ballot_box);
                    $activeVoter['title_shift']=ClusterService::getTitleShiftActivity($activist);
                }
               


                //if its active by ballot its include title description status in shift
                // if(!is_null($ballotBoxId)){
                //     $activeVoter['title_shift']=ClusterService::getTitleShiftActivity($activist);
                // }
               

                $arrActivistRes[]=$activeVoter;
                }
            } 
        }
        return $arrActivistRes;
    }

    public static function getDetailsBallotBoxArr($arrClusterId,$election_campaign_id,$ballot_box_Number=null){
        $ballotBoxId=null;
        $arrDetailsBallot=array();
        $hashBallotCountVoter=array();//hash ballot key and count voter in ballot
        $hashBallotCountVoterVoted=array();//hash ballot key and count voter only voted in ballot
        $hashBallotCountVoterFinalSup=array();//hash ballot key and count voter final support in ballot
        $hashBallotCountVoterVotedFinalSup=array();//hash ballot key and count voter only voted final support in ballot
        
        if(!is_null($ballot_box_Number)){//if insert ballot number for get activist voter
            $ballot_box_Number=BallotBox::resetLogicMiBallotBox($ballot_box_Number);//remove logic ballot box number
            $ballotBoxObj=BallotBox::getBallotBoxIdByMi_id_ClusterId($ballot_box_Number,$arrClusterId,true);//search id of ballot box number
            $arrBallotBox=[$ballotBoxObj];
            $ballotBoxId=$ballotBoxObj->id;
        }
        else
        $arrBallotBox=BallotBox::select()->whereIn('cluster_id',$arrClusterId)->get();

        //count voter by ballots
        $hashBallotCountVoter=ClusterService::getCountVoterGroupBallotBox($arrClusterId,$election_campaign_id,$ballotBoxId);
        //count voter voted in ballot boxes
        $hashBallotCountVoterVoted=ClusterService::getCountVoterGroupBallotBox($arrClusterId,$election_campaign_id,$ballotBoxId,true);
        //count voter final support in ballot boxes
        $hashBallotCountVoterFinalSup=ClusterService::getCountVoterGroupBallotBoxOnlyFinalSupport($arrClusterId,$election_campaign_id,$ballotBoxId);
        //count voter final support only voted in ballot boxes
        $hashBallotCountVoterVotedFinalSup=ClusterService::getCountVoterGroupBallotBoxOnlyFinalSupport($arrClusterId,$election_campaign_id,$ballotBoxId,true);
        

        foreach ($arrBallotBox as $key => $ballot){
           $arrDetailsBallot[]=array(
            'ballot_mi_id'  =>BallotBox::getLogicMiBallotBox($ballot->mi_id),
            'total_voters'=>isset($hashBallotCountVoter[$ballot->id])?$hashBallotCountVoter[$ballot->id]->count_voters:0,
            'total_voted_voters'=>isset($hashBallotCountVoterVoted[$ballot->id])?$hashBallotCountVoterVoted[$ballot->id]->count_voters:0,
            'total_shas_voters'=>isset($hashBallotCountVoterFinalSup[$ballot->id])?$hashBallotCountVoterFinalSup[$ballot->id]->count_voters_support_type:0,
            'total_shas_voted_voters'=>isset($hashBallotCountVoterVotedFinalSup[$ballot->id])?$hashBallotCountVoterVotedFinalSup[$ballot->id]->count_voters_support_type:0
           );
        }

        return  $arrDetailsBallot;
    }

    //function set specific voter that voted in election campaign
    //or not voted
    //vote can be 1-voted, 0-not voted
    public static function setVotedVoter($voter_id,$election_campaign_id,$vote){
        $vote_source_id=VoteSources::getIdBySystemName('applications');
        $votedRecord=Votes::select()->where('voter_id',$voter_id)->where('election_campaign_id',$election_campaign_id)->first();
        //mark that the voter voted
        if($vote==1){
            if($votedRecord){
                if($votedRecord->vote_source_id==$vote_source_id)
                throw new Exception(config('errors.elections.VOTER_VOTED_IN_THIS_CAMPAIGN'));
                else
                {
                    $dateTime=date('Y-m-d H:i:s');
                    $votedRecord->vote_source_id=$vote_source_id;
                    $votedRecord->vote_date=$dateTime;
                    $votedRecord->reporting_voter_id=Auth::user()->voter_id;
                    $votedRecord->user_create_id=Auth::user()->id;
                    $votedRecord->save();
                }
            }
            
            else{
                $dateTime=date('Y-m-d H:i:s');
                $voted=new Votes();
                $voted->key=Helper::getNewTableKey('votes',Votes::$lengthKey);
                $voted->election_campaign_id=$election_campaign_id;
                $voted->vote_source_id=VoteSources::getIdBySystemName(VoteSources::$systemNameApplication);
                $voted->voter_id=$voter_id;
                $voted->vote_date=$dateTime;
                $voted->reporting_voter_id=Auth::user()->voter_id;
                $voted->user_create_id=Auth::user()->id;
                $voted->save();
            }
          
        }
        //delete the voted of voted
        else if($votedRecord && $vote==0 && $votedRecord->user_create_id==Auth::user()->id) 
        {
          $votedRecord->delete();
        }
    }


    public static function setHandledByCaptainFifty($captain_voter_id,$voter_id,$election_campaign_id,$handled=1){
       $voterWithCaptain= VoterCaptainFifty::select()
        ->where('captain_id',$captain_voter_id)->where('voter_id',$voter_id)->where('election_campaign_id',$election_campaign_id)->where('deleted',DB::raw(0))->first();
       
        if(!$voterWithCaptain)
        throw new Exception(config('errors.elections.VOTER_NOT_CONNECT_TO_USER'));

        $voterWithCaptain->handled=$handled;
        $voterWithCaptain->save();

        return true;
    }

    
}
