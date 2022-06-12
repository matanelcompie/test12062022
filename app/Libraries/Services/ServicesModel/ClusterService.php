<?php

namespace App\Libraries\Services\ServicesModel;

use App\Libraries\Helper;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\SupportStatus;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class ClusterService
{

    public static function getClusterByKeyAndElectionCampaign($cluster_key, $election_campaign_id)
    {
        $cluster = Cluster::select()->where('clusters.key', $cluster_key)->where('election_campaign_id', $election_campaign_id);
        return $cluster;
    }




    //function get arr columns in cluster or captain  table for reset zero by election campaign 

    public static function updateResetClusterColumnName($arrColumnsReset, $electionCampaignReset, $is_cluster)
    {
        $arrayColumns = array();

        foreach ($arrColumnsReset as $key => $colName) {
            //set value 0 for reset all row by col name
            $arrayColumns[$colName] = 0;
        }

        if ($is_cluster)
            Cluster::where('election_campaign_id', $electionCampaignReset)->update($arrayColumns);

        else {
            //------reset ElectionRolesByVoters columns-----
            //get id of role captain
            $rol_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
            //update arr col of captain rol
            ElectionRolesByVoters::where('election_campaign_id', $electionCampaignReset)->where('election_role_id', $rol_captain_id)->update($arrayColumns);
        }
    }

 
    
    public static function getSumClusterColumnByGeoEntityType($entityType, $arrValue, $electionCampaignID, $arrColumnName, $arrColumnDivided = [], $colDivided = false)
    {
        $groupBy = null;
        $selectColId = null;
        $columns = [];
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));


        $query =
            ElectionRolesByVoters::leftJoin('cities', 'cities.id', '=', 'election_roles_by_voters.assigned_city_id')
            ->where('election_campaign_id', $electionCampaignID)
            ->where('election_role_id', $role_id);
           


        switch ($entityType) {
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):

                $selectColId = "areas.areas_group_id as entity_id";
                $groupBy = "areas.areas_group_id";
                $query->join("areas", "areas.id", "=", "cities.area_id")
                    ->whereIn('areas.areas_group_id', $arrValue);


                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):

                $selectColId = "cities.area_id as entity_id";
                $groupBy = "cities.area_id";
                $query->whereIn('cities.area_id', $arrValue);


                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):

                $selectColId = "cities.sub_area_id as entity_id";
                $groupBy = "cities.sub_area_id";
                $query->whereIn('cities.sub_area_id', $arrValue);


                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):


                $selectColId = "election_roles_by_voters.assigned_city_id as entity_id";
                $groupBy = "election_roles_by_voters.assigned_city_id";
                $query->whereIn('election_roles_by_voters.assigned_city_id', $arrValue);


                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $query = Cluster::withCity();
                $query->where('clusters.election_campaign_id', $electionCampaignID);
                $selectColId = "clusters.id as entity_id";
                $groupBy = null;
                $query->whereIn('clusters.id', $arrValue);
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CAPTAIN_100'):
                $selectColId = 'voter_id as entity_id';
                $groupBy = null;
                $query->whereIn('election_roles_by_voters.voter_id', $arrValue);


                break;
        }




        $query->addSelect($selectColId);


        if (!is_null($groupBy) && count($arrValue) > 0) {
            $query->groupBy($groupBy);
            foreach ($arrColumnName as $key => $columnName) {
                if (in_array($columnName, $arrColumnDivided))
                    $columns[] = DB::raw("sum($columnName/$colDivided) as sum_$columnName");
                else
                    $columns[] = DB::raw("sum($columnName) as sum_$columnName");
            }
        } else {
            foreach ($arrColumnName as $key => $columnName) {
                if (in_array($columnName, $arrColumnDivided))
                    $columns[] = DB::raw("($columnName/$colDivided) as sum_$columnName");
                else
                    $columns[] = DB::raw("($columnName) as sum_$columnName");
            }
        }

        $query->addSelect($columns);



        $allCounts = $query->get();

        $arrCounts = array();
        if ($allCounts->count() > 0) {
            foreach ($allCounts as $Group) {
                $arrCounts[$Group->entity_id] = $Group;
            }
        }

        return $arrCounts;
    }



    //not use
    // public static function getSummeryCaptainByCityId($arr_value, $arrColumnName,$electionCampaignID)
    // {
    //     $columns = [];
    //     foreach ($arrColumnName as $key => $columnName) {
    //         $columns[] = DB::raw("$columnName as sum_$columnName");
    //     }
    //     $role_id=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
    //     $query = ElectionRolesByVoters::select($columns);
    //     $query->addSelect('voter_id as entity_id')->whereIn('voter_id', $arr_value)
    //     ->where('election_campaign_id',$electionCampaignID)
    //     ->where('election_role_id',$role_id);


    //     Log::info('sdd');
    //     Log::info($query->toSql());
    //     $allCounts = $query->get();

    //     $arrCounts = array();
    //     if ($allCounts->count() > 0) {
    //         foreach ($allCounts as $Group) {
    //             $arrCounts[$Group->entity_id] = $Group;
    //         }
    //     }

    //     return $arrCounts;
    // }

    //-----------------------------ballot box and cluster--------

    //get number voter by arr cluster group ballot box or specific ballot mi id
    //function return hash of group ballot that include key-id ballot,value-object include count and id
    public static function getCountVoterGroupBallotBox($arr_cluster_id, $election_campaign_id, $specificBallotBoxId, $onlyVoted = false)
    {
        $query = Voters::select(
            [DB::raw(' COUNT(distinct voters_in_election_campaigns.voter_id) as count_voters'), 'ballot_boxes.id as ballot_boxes_id']
        )
            ->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id);

        if ($onlyVoted) //count voter by ballot box only voter voted
            $query->withElectionVotes($election_campaign_id, false);

        if ($specificBallotBoxId)
            $query->where('ballot_boxes.id', $specificBallotBoxId);
        else
            $query->groupBy('ballot_boxes.id');
        //  Log::info( $query->toSql());
        //  Log::info( $query->getBindings());
        $ballotCount = $query->get();
        $ballotCount = Helper::makeHashCollection($ballotCount, 'ballot_boxes_id');

        return $ballotCount;
    }
    //get number voter by arr cluster group ballot box or specific ballot mi id
    //function return hash of group ballot that include key-id ballot,value-object include count and id
    public static function getCountVoterGroupBallotBoxOnlyFinalSupport($arr_cluster_id, $election_campaign_id, $specificBallotBoxId, $onlyVoted = false)
    {
        $entityTypeFinalId = config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);

        $query = VoterDetailsService::getQueryCountVoterSupportType($election_campaign_id, $SupportTypeArr, false, $entityTypeFinalId);
        $query->addSelect('ballot_boxes.id as ballot_boxes_id');

        if ($onlyVoted) //count voter final support by ballot box only voter voted
            $query = $query->withElectionVotes($election_campaign_id, false);

        $query = $query->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id);


        if ($specificBallotBoxId)
            $query->where('ballot_boxes.id', $specificBallotBoxId);
        else
            $query->groupBy('ballot_boxes.id');

        $ballotCount = $query->get();
        $ballotCount = Helper::makeHashCollection($ballotCount, 'ballot_boxes_id');

        return $ballotCount;
    }

    //----------------
    //get number voter by arr cluster
    public static function getCountVoterByClusterId($arr_cluster_id, $election_campaign_id)
    {

        $query = Voters::select(DB::raw(' COUNT(distinct voters_in_election_campaigns.voter_id) as count_voters'))
            ->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)->first();

        return $query->count_voters;
    }

    //get number voter voted by arr cluster id
    public static function getCountVotedVoterByClustersId($arr_cluster_id, $election_campaign_id)
    {
        $query = Voters::select(DB::raw(' COUNT(distinct voters_in_election_campaigns.voter_id) as count_voters_voted'))
            ->withBallotBoxes()
            ->withElectionVotes($election_campaign_id, false)
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)->first();

        return $query->count_voters_voted;
    }

    //get count voter support in specific cluster
    //by entity status id/final/tm/election
    //function get prams for count only support voted
    public static function getCountSupportVoterByClusterId($arr_cluster_id, $election_campaign_id, $entityStatusId = null, $onlyVoted = false, $includeUnDecided = false)
    {
        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);
        if ($includeUnDecided) {
            $UndecidedTypeArr = SupportStatus::getUndecidedTypeObjByElection($election_campaign_id);
            $SupportTypeArr = $SupportTypeArr->merge($UndecidedTypeArr);
        }

        $query = VoterDetailsService::getQueryCountVoterSupportType($election_campaign_id, $SupportTypeArr, false, $entityStatusId);

        if ($onlyVoted) //only voter final support shas and voted
            $query = $query->withElectionVotes($election_campaign_id, false);

        $data = $query->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
            ->first();

        if ($data)
            return $data->count_voters_support_type;
        else
            return 0;
    }

    //function return count voter that no opposed-only support/null/undecided by cluster arr
    public static function getCountVoterNotOpposedClusterArr($arr_cluster_id, $election_campaign_id)
    {

        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $query = Voters::select(DB::raw(' COUNT(distinct voters_in_election_campaigns.voter_id) as count_voters'))
            ->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
            ->leftJoin('voter_support_status', function ($joinOn) use ($election_campaign_id) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')/* = */
                    ->on('voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id))/* = */
                    ->on('voter_support_status.deleted', '=', DB::raw(0))/* = */
                    ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
            })
            ->where(function ($q) use ($unSupportTypeArr) {
                $q->whereNotIn('voter_support_status.support_status_id', $unSupportTypeArr)
                    ->orWhereNull('voter_support_status.support_status_id');
            });
        // Log::info($query->toSql());   
        $query = $query->first();
        // Log::info($query->count_voters);
        return $query->count_voters;
    }

    //get count voter support in specific cluster
    public static function getCountSupportVoterWithVerifiedPhoneByClusterId($arr_cluster_id, $election_campaign_id, $includeUndecided)
    {

        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);

        if ($includeUndecided) {
            $UndecidedTypeArr = SupportStatus::getUndecidedTypeObjByElection($election_campaign_id);
            $SupportTypeArr = $SupportTypeArr->merge($UndecidedTypeArr);
        }
        $query = VoterDetailsService::getQueryCountVoterSupportType($election_campaign_id, $SupportTypeArr, true);
        $data = $query->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
            ->first();
        if ($data)
            return $data->count_voters_support_type;
        else
            return 0;
    }


    //get count voter not support in specific cluster
    public static function getCountNotSupportVoterByClusterId($arr_cluster_id, $election_campaign_id)
    {

        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $query = VoterDetailsService::getQueryCountVoterSupportType($election_campaign_id, $unSupportTypeArr, false);
        $data = $query->withBallotBoxes()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
            ->first();


        if ($data)
            return $data->count_voters_support_type;
        else
            return 0;
    }


    //get present of insert voter details by cluster id
    public static function getPresentVoterDetailsDon($arr_cluster_id, $election_campaign_id)
    {
        $sub=self::subQueryPresentVoterDetailsDonByClusterDeshboard($arr_cluster_id, $election_campaign_id);
     
        $count=Voters::select(
        DB::raw(VoterDetailsService::getQueryPresentDetailsVoter($election_campaign_id))
        )->from(DB::raw('('.$sub->toSql().') as voter1'))
        ->setBindings([$sub->getBindings()]);
        
        // Log::info($count->toSql());
        $count= $count->first();
        if($count)
        return $count->present;
        else return 0;

        // $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);

        // $query = Voters::select(
        //     DB::raw(VoterDetailsService::getQueryPresentDetailsVoter($election_campaign_id))
        // )
        //     ->withSupportStatus0($election_campaign_id) //not include not support
        //     ->withBallotBoxes()
        //     ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
        //     ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
        //     ->where(function ($q) use ($unSupportTypeArr) { //not include not support
        //         $q->whereNotIn('vs0.support_status_id', $unSupportTypeArr)
        //             ->orWhereNull('vs0.support_status_id');
        //     })
        //     ->first();

        // //return $query;
        // if ($query)
        //     return $query->present;
        // else
        //     return 0;
        
    }

    public static function subQueryPresentVoterDetailsDonByClusterDeshboard($arr_cluster_id, $election_campaign_id){

        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $sub= Voters::select(DB::raw('distinct voters.id as voter_id, voters.*')) 
        ->withSupportStatus0($election_campaign_id) //not include not support
        ->withBallotBoxes()
        ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
        ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
        ->where(function ($q) use ($unSupportTypeArr) { //not include not support
            $q->whereNotIn('vs0.support_status_id', $unSupportTypeArr)
                ->orWhereNull('vs0.support_status_id');
        });

        return $sub;

    }

    //get all details of activist voter in cluster or ballot_number
    public static function getListVoterActivistByCluster_ballot($arr_cluster_id = null, $ballot_Box_id = null, $election_campaign_id)
    {

        $allActivist = array();
        $arrNotActivist = array(config('constants.activists.election_role_system_names.ministerOfFifty'), config('constants.activists.election_role_system_names.clusterLeader'));
        //get all activist in arr cluster without captain and without ballot box activist
        $arrSelect = [
            'voters.key as personal_identity', 'voters.first_name', 'voters.last_name',
            'election_roles_by_voters.election_role_id', 'election_roles_by_voters.phone_number',
            'ballot_boxes.mi_id as mi_ballot_box',
            'election_roles.system_name', 'election_roles.name as activist_description',
            'activists_allocations.id',
            'activists_allocations.cluster_id'
        ];
        $query = ActivistsAllocations::select($arrSelect)
            ->withActivistsAssignmentsFullData()
            //->withActivistsData($election_campaign_id, false)
            ->withBallotBox()
            ->withClusters()
            ->whereNotIn('election_roles.system_name', $arrNotActivist)
            ->whereNull('activists_allocations.ballot_box_id')//only activist not ballot box activist
            ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id)
            ->whereIn('activists_allocations.cluster_id', $arr_cluster_id);


        $activist = $query->get();
        //get captain by voter in the clusters    
        $captain = self::getArrCaptainInArrCluster($arr_cluster_id, $election_campaign_id);
        $activistBallot = self::getListBallotActivistByCluster_ballotBox($arr_cluster_id, $ballot_Box_id, $election_campaign_id);

        $allActivist = array_merge($allActivist, $activist->toArray()); //activist cluster
        $allActivist = array_merge($allActivist, $captain->toArray());  //captain fifty
        $allActivist = array_merge($allActivist, $activistBallot); //activist ballot
        return $allActivist;
    }

    public static function getListBallotActivistByCluster_ballotBox($arr_cluster_id, $ballot_Box_id = null, $election_campaign_id)
    {

        //get all activist in arr cluster without captain 
        $arrSelect = [
            'voters.key as personal_identity', 'voters.first_name', 'voters.last_name',
            'election_roles_by_voters.election_role_id', 'election_roles_by_voters.phone_number',
            'ballot_boxes.mi_id as mi_ballot_box',
            'ballot_box_roles.system_name', 'ballot_box_roles.name as activist_description',
            'election_role_shifts.name', 'election_role_shifts.system_name as role_shift_system_name',
            'activists_allocations_assignments.arrival_date', 'activists_allocations_assignments.correct_reporting', 'activists_allocations_assignments.current_reporting', 'activists_allocations_assignments.report_finished_date'
        ];
        //an old method
        // $query = ActivistsAllocations::select($arrSelect)
        //     ->withActivistsData($election_campaign_id, false)
        //     ->withBallotBox(false)
        //     ->withElectionRoleGeographicAreas(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'), 'ballot_boxes.id')
        //     ->withElectionRoleShiftId()
        //     ->withClusters()
        //     ->whereNotNull('election_roles_by_voters.id');

          $query = ActivistsAllocations::select($arrSelect)
            ->withActivistsAssignmentsFullData()
            ->withBallotBox(false)
            ->withClusters()
            ->whereNotNull('activists_allocations.ballot_box_id')//only ballot box activist
            ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id);


        if ($ballot_Box_id)
            $query->where('activists_allocations.ballot_box_id', $ballot_Box_id);
        else
            $query->whereIn('activists_allocations.cluster_id', $arr_cluster_id);

        $activistBallots = $query->get();

        $allActivist = self::arrangeRoleShiftByArrActivist($activistBallots);

        return $allActivist;
    }

    
    public static function getArrClustersByUserClusterLeader($Cluster_voter_id, $election_campaign_id, $specificFieldsArr = null)
    {
        //role cluster
        $role_cluster_id=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));

        //get cluster details by activist allocation details
        $electionRoleClusterList=$specificFieldsArr ? ActivistsAllocations::select($specificFieldsArr) : ActivistsAllocations::select(DB::raw('clusters.*'));
        $electionRoleClusterList=$electionRoleClusterList
        ->withActivistsAssignments()
        ->withElectionRoleByVoter()
        ->withClusters()
        ->where('election_roles_by_voters.election_campaign_id',$election_campaign_id)
        ->where('election_roles_by_voters.election_role_id',$role_cluster_id)
        ->where('election_roles_by_voters.voter_id',$Cluster_voter_id)
        ->get();

        return $electionRoleClusterList;
        
        //an old method
        // $clusters = $specificFieldsArr ? Cluster::select($specificFieldsArr) : Cluster::select();
        // $clusters = $clusters->where('leader_id', $Cluster_leader_id)->where('election_campaign_id', $election_campaign_id)->get();
        // return  $clusters;
    }

    public static function getArrCaptainInArrCluster($arr_cluster_id, $election_campaign_id)
    {
        $arrFields = [
            'captain.key as personal_identity', 'captain.first_name', 'captain.last_name', DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as total_voters'), 'election_roles_by_voters.phone_number',
            'ballot_boxes.cluster_id',
            'captain.key as captain_id',
            'election_roles.system_name', 'election_roles.name as activist_description'

        ];
        $captains = VoterCaptainFifty::select($arrFields)
            ->withCaptainVotersClusterCity($election_campaign_id)
            ->withElectionRoleByVoters()
            ->withCaptainOfFifty()
            ->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id)
            ->whereIn('ballot_boxes.cluster_id', $arr_cluster_id)
            ->where('voters_with_captains_of_fifty.deleted', 0)
            ->where('election_roles.system_name', config('constants.activists.election_role_system_names.ministerOfFifty'))
            ->groupBy('voters_with_captains_of_fifty.captain_id')->get();

        return $captains;
    }

    public static function titleTypeShift()
    {
    }
    public static function getTitleByActivist($role_system, $object)
    {
        $title = '';
        switch ($role_system) {
            case 'captain_of_fifty':
                $title = $title . $object->total_voters;
                $title = $title . ' בוחרים באשכול ';
                break;
            case 'observer':
                $title = 'קלפי מספר ' . BallotBox::getLogicMiBallotBox($object->mi_ballot_box);
                break;
            case 'driver':
                $title = '';
                break;
            case 'motivator':
            case 'ballot_member':
            case 'ballot_leader':
            case 'ballot_vice_leader':
            case 'counter':
                $title = 'קלפי מספר ' . BallotBox::getLogicMiBallotBox($object->mi_ballot_box);
                break;
            default:

                break;
        }

        return $title;
    }

    public static function getTitleShiftActivity($activist)
    {

        $title = '';
        if (is_null($activist->arrival_date) || strcmp($activist->arrival_date, '') == 0)
            $title = 'לא התחיל משמרת';
        else if (!is_null($activist->report_finished_date) || strcmp($activist->report_finished_date, '') != 0)
            $title = 'סיים משמרת';
        //התחיל משמרת
        else if (!is_null($activist->arrival_date)) {
            if (!is_null($activist->correct_reporting) && $activist->correct_reporting == 1)
                $title = 'דיווח';
            else
                $title = "התחיל משמרת";
        }
        return  $title;
    }

    //function get arr activist ballot with role shift and arrange the role shift in one field
    public static function arrangeRoleShiftByArrActivist($arrBallotActivist)
    {
        $arrRes = array();

        foreach ($arrBallotActivist as $key => $activist) {
            $find = false;
            foreach ($arrRes as $key => $activistRes) {
                //check if have the same role in specific ballot box
                if (
                    strcmp($activistRes->system_name, $activist->system_name) == 0 &&
                    strcmp($activistRes->personal_identity, $activist->personal_identity) == 0 &&
                    strcmp($activistRes->mi_ballot_box, $activist->mi_ballot_box) == 0
                ) {
                    $find = true;
                    $activistRes->shiftArr[] = $activist->role_shift_system_name;
                }
            }

            if ($find == false) {
                //arr role shift
                $activist->shiftArr = [$activist->role_shift_system_name];
                $arrRes[] = (object)($activist->toArray());
            }
        }


        foreach ($arrRes as $key => $activistBallot)
            $activistBallot = self::getRoleShiftNameByArrRoleShiftOfActivist($activistBallot);

        return $arrRes;
    }

    //function get activist object with shiftArr field include arr of system name election_role_shifts
    //function return activist by system name after check all shift
    public static function getRoleShiftNameByArrRoleShiftOfActivist($activist)
    {
        $shift_role_activist = $activist->shiftArr;
        $activist->role_shift_system = null;
        $ROLE_SHIFTS = config('constants.activists.role_shifts');

        if (count($shift_role_activist) > 0) {
            //one shift role
            if (count($shift_role_activist) == 1)
                $activist->role_shift_system = $shift_role_activist[0];

            //a and b
            else if (in_array($ROLE_SHIFTS['FIRST'], $shift_role_activist) && in_array($ROLE_SHIFTS['SECOND'], $shift_role_activist)) {
                //a and b and count
                if (in_array($ROLE_SHIFTS['COUNT'], $shift_role_activist))
                    $activist->role_shift_system = $ROLE_SHIFTS['ALL_DAY_AND_COUNT'];
                else
                    $activist->role_shift_system = $ROLE_SHIFTS['ALL_DAY'];
            } else if (in_array($ROLE_SHIFTS['SECOND'], $shift_role_activist) && in_array($ROLE_SHIFTS['COUNT'], $shift_role_activist))
                $activist->role_shift_system = $ROLE_SHIFTS['SECOND_AND_COUNT'];
        }

        $roleShift = ElectionRoleShifts::getObjectBySystemName($activist->role_shift_system);
        $activist->role_shift_system_description = $roleShift->name;
    }

        

}

 
    //function get election campaign and calculate for all cluster count voter
    // public static function calculateCountVoterForCluster($election_campaign_id,$reset=false){
    //     $groupCountSupport=Voters::select(DB::raw('count(voters.id) as count_voter'),DB::raw('clusters.id'))
    //     ->leftJoin('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
    //     ->join('voters_in_election_campaigns','voters_in_election_campaigns.voter_id', '=', 'voters.id')
    //     ->join('voters_with_captains_of_fifty','voters_with_captains_of_fifty.voter_id','=','voters_in_election_campaigns.voter_id')
    //     ->WithCluster()
    //     ->where('voters_in_election_campaigns.election_campaign_id',$election_campaign_id)
    //     ->groupBy('clusters.id')
    //     ->get();

    //     if($reset)
    //     self::updateResetClusterColumnName('voter_count',$election_campaign_id);

    //     self::updateSpecificClusterColumnByArrCluster('voter_count',$groupCountSupport,'id','count_voter');
    //     return $groupCountSupport;
    // }
