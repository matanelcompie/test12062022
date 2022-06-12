<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\SupportStatus;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ClusterOrCaptainCalculationService
{
        //function get count voter not opposite that connect to captain
        public static function calculateCountVoterSupportOrUnKnowForCluster_captain($election_campaign_id, $is_cluster)
        {
    
            $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';
    
            $CountSupport = self::countVoter($election_campaign_id, $is_cluster)->get();
    
    
    
    
            if (count($CountSupport) > 0) {
                if ($is_cluster) //update count in cluster
                    self::updateSpecificClusterColumnByArrCluster('voter_count_not_opposite', $CountSupport, $columnSelect, 'my_count');
                else //update count in election role voter
                    self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voter_count_not_opposite', $CountSupport, $columnSelect, 'my_count', $election_campaign_id);
            }
    
            //reset counter for all cluster or captain without not opposite voter
            self::updateResetFieldCluster_captainNotIn(['voter_count_not_opposite'], $election_campaign_id, $is_cluster, $CountSupport, $columnSelect);
    
    
            return $CountSupport;
        }  
        
        //function get election campaign and calculate for all cluster or captain count support voter that connect captain
    public static function calculateCountSupportVoterForCluster_captain($election_campaign_id, $is_cluster)
    {
        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountSupport = self::countVoter($election_campaign_id, $is_cluster);
        $CountSupport = $CountSupport
            ->whereIn('voter_support_status.support_status_id', $SupportTypeArr)
            ->get();



        if (count($CountSupport) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voters_count_supporters', $CountSupport, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_supporters', $CountSupport, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voters_count_supporters'], $election_campaign_id, $is_cluster, $CountSupport, $columnSelect);
        return $CountSupport;
    }

    
    //calculate count undecided voter that connect to captain fifty for all cluster and captain by election for all
    public static function calculateCountUndecidedVoterForCluster_captain($election_campaign_id,$is_cluster){
        $UndecidedTypeArr = SupportStatus::getUndecidedTypeObjByElection($election_campaign_id);
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountUndecided = self::countVoter($election_campaign_id, $is_cluster,false);
        $CountUndecided = $CountUndecided
            ->whereIn('voter_support_status.support_status_id', $UndecidedTypeArr);
            // Log::info($CountUndecided->toSql());
            // Log::info($CountUndecided->getBindings());    
            $CountUndecided= $CountUndecided->get();

        if (count($CountUndecided) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voters_count_undecided', $CountUndecided, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_undecided', $CountUndecided, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voters_count_undecided'], $election_campaign_id, $is_cluster, $CountUndecided, $columnSelect);
        return $CountUndecided;
    }

     //function count voter that opposite and connect to captain group captain and cluster
     public static function calculateCountOpposedVoterForCluster_captain($election_campaign_id,$is_cluster){
        $UnSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountOpposed= self::countVoter($election_campaign_id,$is_cluster,false);
        $CountOpposed = $CountOpposed
            ->whereIn('voter_support_status.support_status_id', $UnSupportTypeArr);
           
        $CountOpposed=$CountOpposed->get();

        if (count($CountOpposed) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voters_count_opposed', $CountOpposed, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_opposed', $CountOpposed, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voters_count_opposed'], $election_campaign_id, $is_cluster, $CountOpposed, $columnSelect);
        return $CountOpposed;
    }

    
    //function calculate count voter that connect to captain by cluster or captain
    public static function calculateCountVoterConnectCaptainByCluster_captain($election_campaign_id,$is_cluster){
       
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountVoterConnectCaptain= self::countVoter($election_campaign_id,$is_cluster,false)->get();
   
        if (count($CountVoterConnectCaptain) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voters_count_connect_captain', $CountVoterConnectCaptain, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_connect_captain', $CountVoterConnectCaptain, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voters_count_connect_captain'], $election_campaign_id, $is_cluster, $CountVoterConnectCaptain, $columnSelect);
        return $CountVoterConnectCaptain;

    }

      //function count voter with verified phone only for supporting voters that connect captain by cluster or captain
      public static function calculationCountVerifiedPhoneForSupportByCluster_captain($election_campaign_id,$is_cluster){
        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountSupportWithVerified = self::countVoter($election_campaign_id, $is_cluster,false);
        $CountSupportWithVerified = $CountSupportWithVerified
            ->whereIn('voter_support_status.support_status_id', $SupportTypeArr)
            ->whereExists(function ($query) {
                $query->select('voter_phones.id')->from('voter_phones')
                    ->where('voter_phones.voter_id', DB::raw('voters_with_captains_of_fifty.voter_id'))
                    ->where('wrong', 0)
                    ->where('verified', 1)
                    ->where('phone_number', 'like', '05%')->limit(1);
            });

            $CountSupportWithVerified= $CountSupportWithVerified ->get();



        if (count($CountSupportWithVerified) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voter_count_mobile_verified_supporters', $CountSupportWithVerified, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voter_count_mobile_verified_supporters', $CountSupportWithVerified, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voter_count_mobile_verified_supporters'], $election_campaign_id, $is_cluster, $CountSupportWithVerified, $columnSelect);
        return $CountSupportWithVerified;

    }

      //function calculation count voter supporting that have correct address and connect captain by cluster or captain
      public static function calculateCountVoterCorrectAddressForSupportByCluster_captain($election_campaign_id,$is_cluster){
        $SupportTypeArr = SupportStatus::getSupportStatusByElection($election_campaign_id);
        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $CountSupportWithAddress = self::countVoter($election_campaign_id, $is_cluster,false);
        $CountSupportWithAddress = $CountSupportWithAddress
        ->join('voters', 'voters.id', '=', 'voters_with_captains_of_fifty.voter_id') //join voter for get actual address
        ->where('voters.actual_address_correct', '1')
        ->whereIn('voter_support_status.support_status_id', $SupportTypeArr)
        ->get();



        if (count($CountSupportWithAddress) > 0) {
            if ($is_cluster) //update count in cluster
                self::updateSpecificClusterColumnByArrCluster('voter_count_address_correct_supporters', $CountSupportWithAddress, $columnSelect, 'my_count');
            else //update count in election role voter
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voter_count_address_correct_supporters', $CountSupportWithAddress, $columnSelect, 'my_count', $election_campaign_id);
        }

        //reset counter for all cluster or captain without support voters
        self::updateResetFieldCluster_captainNotIn(['voter_count_address_correct_supporters'], $election_campaign_id, $is_cluster, $CountSupportWithAddress, $columnSelect);
        return $CountSupportWithAddress;

    }

        //function get count voter  that connect captain fifty include correct address
        public static function calculateCountVoterCorrectAdressForCluster_captain($election_campaign_id, $is_cluster)
        {
    
            $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';
    
            $groupCountAddress = self::countVoter($election_campaign_id, $is_cluster);
    
            $groupCountAddress = $groupCountAddress
                ->join('voters', 'voters.id', '=', 'voters_with_captains_of_fifty.voter_id') //join voter for get actual address
                ->where('voters.actual_address_correct', '1')
                ->get();
    
    
            if ($is_cluster)
                self::updateSpecificClusterColumnByArrCluster('voters_count_address_correct', $groupCountAddress, $columnSelect, 'my_count');
            else
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_address_correct', $groupCountAddress, $columnSelect, 'my_count', $election_campaign_id);
    
            //reset counter for all cluster or captain without voter actual address correct
            self::updateResetFieldCluster_captainNotIn(['voters_count_address_correct'], $election_campaign_id, $is_cluster, $groupCountAddress, $columnSelect);
            return $groupCountAddress;
        }

           //function get count voter  that connect captain fifty include verified phone
    public static function calculateCountVoterVerifiedMobileForCluster_captain($election_campaign_id, $is_cluster)
    {

        $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';

        $groupCountVerified = self::countVoter($election_campaign_id, $is_cluster);
        $groupCountVerified = $groupCountVerified->whereExists(function ($query) {
            $query->select('voter_phones.id')->from('voter_phones')
                ->where('voter_phones.voter_id', DB::raw('voters_with_captains_of_fifty.voter_id'))
                ->where('wrong', 0)
                ->where('verified', 1)
                ->where('phone_number', 'like', '05%')->limit(1);
        })
            ->get();

        if ($is_cluster)
            self::updateSpecificClusterColumnByArrCluster('voters_count_mobile_verified', $groupCountVerified, $columnSelect, 'my_count');
        else
            self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voters_count_mobile_verified', $groupCountVerified, $columnSelect, 'my_count', $election_campaign_id);

        //reset counter for all cluster or captain without voter with verified phone
        self::updateResetFieldCluster_captainNotIn(['voters_count_mobile_verified'], $election_campaign_id, $is_cluster, $groupCountVerified, $columnSelect);

        return  $groupCountVerified;
    }

        //function calculate present of details for cluster or captain in voter_present_other_details fields
        public static function calculatePresentOtherDetailsForCluster_captain($election_campaign_id, $is_cluster)
        {
    
            $columnSelect = $is_cluster ? 'cluster_id' : 'captain_id';
            //self::CalculationPresentOtherDetails($election_campaign_id, $is_cluster);
            $groupPresentDetails = self::CalculationPresentOtherDetails($election_campaign_id, $is_cluster);//self::countVoter($election_campaign_id, $is_cluster, true);
            // Log::info($groupPresentDetails->toSql());
            // return ;
            $groupPresentDetails = $groupPresentDetails->get();
    
    
            if ($is_cluster)
                self::updateSpecificClusterColumnByArrCluster('voter_present_other_details', $groupPresentDetails, $columnSelect, 'present', true);
            else
                self::updateSpecificElectionRoleVoterColumnByArrVoterCaptain('voter_present_other_details', $groupPresentDetails, $columnSelect, 'present', $election_campaign_id, true);
    
            //reset counter for all cluster or captain without voter with verified phone
            self::updateResetFieldCluster_captainNotIn(['voter_present_other_details'], $election_campaign_id, $is_cluster, $groupPresentDetails, $columnSelect);
    
            return  $groupPresentDetails;
        }

            //function get name column for update, in table cluster
    //arr object 
    //name field in object for key
    //name field in object for value update

    public static function updateSpecificClusterColumnByArrCluster($nameClusterCol, $arrObj, $nameObjId, $nameObjValue, $divByCountAll = false)
    {
        foreach ($arrObj as $key => $obj) {
            $value = $obj->$nameObjValue;

            Cluster::where('id', $obj->$nameObjId)->update(array($nameClusterCol => $value));
        }
    }

        //function get name column for update, in table ElectionRolesByVoters
    //arr object include key -captain id value -the number for update 
    //name field in object for key
    //name field in object for value update
    //election campaign

    public static function updateSpecificElectionRoleVoterColumnByArrVoterCaptain($nameClusterCol, $arrObj, $nameObjId, $nameObjValue, $election_campaign_id, $divByCountAll = false)
    {
        $rol_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));

        foreach ($arrObj as $key => $obj) {
            $value = $obj->$nameObjValue;

            ElectionRolesByVoters::where('voter_id', $obj->$nameObjId)->where('election_campaign_id', $election_campaign_id)->where('election_role_id', $rol_captain_id)->update(array($nameClusterCol => $value));
        }
    }

    public static function updateResetFieldCluster_captainNotIn($arrColumnsReset, $electionCampaignReset, $is_cluster, $arrNotIn, $name_col_not_in)
    {
        $arrNotInValue = null;

        if ($arrNotIn->count() > 0)
            $arrNotInValue = $arrNotIn->map(function ($object) use ($name_col_not_in) {
                return $object->$name_col_not_in;
            });
        $arrayColumns = array();

        foreach ($arrColumnsReset as $key => $colName) {
            //set value 0 for reset all row by col name
            $arrayColumns[$colName] = 0;
        }

        if ($is_cluster) {
            $query = Cluster::where('election_campaign_id', $electionCampaignReset);
            if (!is_null($arrNotInValue))
                $query->whereNotIn('id', $arrNotInValue)->update($arrayColumns);
            else
                $query->update($arrayColumns);
        } else {
            //------reset ElectionRolesByVoters columns-----
            //get id of role captain
            $rol_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
            //update arr col of captain rol
            $query = ElectionRolesByVoters::where('election_campaign_id', $electionCampaignReset)->where('election_role_id', $rol_captain_id);
            if (!is_null($arrNotInValue)) {
                $query->whereNotIn('voter_id', $arrNotInValue)->update($arrayColumns);
            } else
                $query->update($arrayColumns);
        }
    }

       //function for run command line to calculate summery quarter dashboard
       public static function runCommandLineSummeryVoter($electionCampaignReset, $isCluster = false)
       {
   
           $currentElection = ElectionCampaigns::currentCampaign();
   
           //------------------reset--------------------------
           $arrClusterColReset = [
               'voter_count_not_opposite',
               'voters_count_supporters',
               'voters_count_address_correct',
               'voters_count_mobile_verified',
               'voter_present_other_details',
               'voter_count_address_correct_supporters',
               'voter_count_mobile_verified_supporters',
               'voters_count_opposed',
               'voters_count_undecided'
           ];
   
           // self::updateResetClusterColumnName($arrClusterColReset, $electionCampaignReset, $isCluster);
   
           //--voter not opposite
           self::calculateCountVoterSupportOrUnKnowForCluster_captain($currentElection->id, $isCluster);
           //voter with verified voter for not opposed voter
           self::calculateCountVoterVerifiedMobileForCluster_captain($currentElection->id, $isCluster);
           // voter with actual address for not opposed voter
           self::calculateCountVoterCorrectAdressForCluster_captain($currentElection->id, $isCluster);
           //voter supporting
           self::calculateCountSupportVoterForCluster_captain($currentElection->id, $isCluster);
           //present details for not opposed voter
           self::calculatePresentOtherDetailsForCluster_captain($currentElection->id, $isCluster);
           //count voter undecided for support
           self::calculateCountUndecidedVoterForCluster_captain($currentElection->id, $isCluster);
           //count voter opposed 
           self::calculateCountOpposedVoterForCluster_captain($currentElection->id, $isCluster);
           //count voter connect captain 
           self::calculateCountVoterConnectCaptainByCluster_captain($currentElection->id, $isCluster);
           //count voter supporting with verified mobile phone
           self::calculationCountVerifiedPhoneForSupportByCluster_captain($currentElection->id, $isCluster);
           //count voter supporting with correct address
           self::calculateCountVoterCorrectAddressForSupportByCluster_captain($currentElection->id, $isCluster);
           
       }

       public static function CalculationPresentOtherDetails($election_campaign_id, $cluster = false){
        $sub=self::subCountVoter($election_campaign_id, $cluster);
        $selectCol = $cluster ? 'voters_distinct.cluster_id' : 'voters_distinct.captain_id';
        $count=Voters::
        select(DB::raw($selectCol),DB::raw(VoterDetailsService::getQueryPresentOnlyOtherDetailsVoter($election_campaign_id,'voters_distinct'))
        )->from(DB::raw('('.$sub->toSql().') as voters_distinct'))->setBindings([$sub->getBindings()]);
        
        Log::info($count->toSql());
        Log::info($count->getBindings());

        return $count ->groupBy($selectCol);
    }

    public static function subCountVoter($election_campaign_id, $cluster = false){

        $selectCol = $cluster ? 'clusters.id as cluster_id' : 'voters_with_captains_of_fifty.captain_id';
        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);

        $rol_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));

        $count = VoterCaptainFifty::select(DB::raw('distinct voters.id as my_voter'),DB::raw('voters.*'),DB::raw($selectCol))
        ->withVoter()
        ->leftJoin('voter_support_status', function ($joinOn) use ($election_campaign_id) {
            $joinOn->on('voter_support_status.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')/* = */
                ->on('voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id))/* = */
                ->on('voter_support_status.deleted', '=', DB::raw(0))/* = */
                ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
        });

        if ($cluster)
            $count->withCaptainVotersClusterCity(false, $election_campaign_id);
        else
            $count->join('voters_in_election_campaigns', function ($joinOn) use ($election_campaign_id) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($election_campaign_id));
            });

        //$count->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id);



        $count // join for election role for check all voter with captain with role
            ->join('election_roles_by_voters', function ($joinOn) use ($election_campaign_id, $rol_captain_id) {
                $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
                    ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($election_campaign_id))
                    ->on('election_roles_by_voters.election_role_id', '=', DB::raw($rol_captain_id));
            })
            // ->join('election_roles_by_voters', 'election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
            // ->where('election_roles_by_voters.election_campaign_id', $election_campaign_id)
            // ->where('election_roles_by_voters.election_role_id', $rol_captain_id)


            ->where('voters_with_captains_of_fifty.election_campaign_id', DB::raw($election_campaign_id))->where('voters_with_captains_of_fifty.deleted', DB::raw(0))
            ->where(function ($q) use ($unSupportTypeArr) {
                $q->whereNotIn('voter_support_status.support_status_id', $unSupportTypeArr)
                    ->orWhereNull('voter_support_status.support_status_id');
            });

            return $count;

    }

        //count voter that connect to caption fifty and not opposite
    //function can get parameter that means include or un include only not opposed 
    public static function countVoter($election_campaign_id, $cluster = false,$only_not_opposed=true)//,$presentOtherDetails=false
    {

        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);

        $rol_captain_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));

        //---type group cluster or captain---
        $groupBy = $cluster ? 'clusters.id' : 'voters_with_captains_of_fifty.captain_id';
        $selectCol = $cluster ? 'clusters.id as cluster_id' : 'voters_with_captains_of_fifty.captain_id';

        // //---query
        // if ($presentOtherDetails == false)
             $count = VoterCaptainFifty::select(DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as my_count'), DB::raw($selectCol));
      //  else
         //  $count = VoterCaptainFifty::select(DB::raw('distinct ' . $selectCol), DB::raw(VoterDetailsService::getQueryPresentOnlyOtherDetailsVoter($election_campaign_id)))->withVoter();

        $count = $count->leftJoin('voter_support_status', function ($joinOn) use ($election_campaign_id) {
            $joinOn->on('voter_support_status.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')/* = */
                ->on('voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id))/* = */
                ->on('voter_support_status.deleted', '=', DB::raw(0))/* = */
                ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
        });

        if ($cluster)
            $count->withCaptainVotersClusterCity(false, $election_campaign_id);
        else
            $count->join('voters_in_election_campaigns', function ($joinOn) use ($election_campaign_id) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($election_campaign_id));
            });

        //$count->where('voters_in_election_campaigns.election_campaign_id', $election_campaign_id);



        $count // join for election role for check all voter with captain with role
            ->join('election_roles_by_voters', function ($joinOn) use ($election_campaign_id, $rol_captain_id) {
                $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
                    ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($election_campaign_id))
                    ->on('election_roles_by_voters.election_role_id', '=', DB::raw($rol_captain_id));
            })
            // ->join('election_roles_by_voters', 'election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
            // ->where('election_roles_by_voters.election_campaign_id', $election_campaign_id)
            // ->where('election_roles_by_voters.election_role_id', $rol_captain_id)


            ->where('voters_with_captains_of_fifty.election_campaign_id', DB::raw($election_campaign_id))->where('voters_with_captains_of_fifty.deleted', DB::raw(0));
           
            if($only_not_opposed==true)
            $count->where(function ($q) use ($unSupportTypeArr) {
                $q->whereNotIn('voter_support_status.support_status_id', $unSupportTypeArr)
                    ->orWhereNull('voter_support_status.support_status_id');
            });

            $count=$count->groupBy($groupBy);

        //  Log::info($count->toSql());

        return $count;
    }

    
}