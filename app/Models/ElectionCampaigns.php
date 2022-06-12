<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ElectionCampaigns extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_campaigns';

    public function allVotedSupportStatuses()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'election_campaign_id', 'id')->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'));
    }

    public function allVotedSupportStatusesOfTypePotential()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'election_campaign_id', 'id')
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('support_status_id' , config('constants.VOTER_SUPPORT_STATUS_TYPE_POTENTIAL'));
    }

    public function allVotedSupportStatusesOfTypeNotSupporting()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'election_campaign_id', 'id')
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('support_status_id' , config('constants.VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING'));
    }

    public function allVotedSupportStatusesOfTypeHesitating()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'election_campaign_id', 'id')
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('support_status_id' , config('constants.VOTER_SUPPORT_STATUS_TYPE_HESITATING'));
    }

    public function allVotedSupportStatusesOfTypeSupporting()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'election_campaign_id', 'id')
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->where('support_status_id' , config('constants.VOTER_SUPPORT_STATUS_TYPE_SUPPORTING'));
    }

    public function scopeWithVoterElectionCampaign($query, $scopeWithCurrentCampaign = false) {
        if ($scopeWithCurrentCampaign) {
            $query->leftJoin('voters_in_election_campaigns', function($joinOn) use($scopeWithCurrentCampaign) {
                $joinOn->on('voters_in_election_campaigns.election_campaign_id', '=', 'election_campaigns.id')
                        ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($scopeWithCurrentCampaign));
            });
        } else {
            $query->leftJoin('voters_in_election_campaigns', 'voters_in_election_campaigns.election_campaign_id', '=', 'election_campaigns.id');
        }
    }

    public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id');
    }

    /**
     * Get the current election campaign
     * this is determined by the end _date field: if it is null or if the date has not yet passed	
     * */
    public static function currentCampaign($withVoteHours = false)
    {
        $currentDate = date(config('constants.APP_DATE_DB_FORMAT'), time());
        //('id', 'key','name','type' , 'election_date'
        $query = self::select('election_campaigns.*')->where('end_date', null)->orWhere('end_date', '>=', $currentDate)->orderBy('election_campaigns.id', 'DESC');
        return $query->first();
    }
    public static function checkIfElectionDayArrival($checkVoteTime, $isCounterRole = null, $currentCampaign = null){
            if(!$currentCampaign){
                $currentCampaign = self::currentCampaign();
            }
            $startElectionsTime = strtotime("$currentCampaign->election_date $currentCampaign->vote_start_time"); 
            $currentTime = time();
            $endElectionsHour = $currentCampaign->vote_end_time;

            $hourSeconds = 60 * 60;
            if(!$checkVoteTime){
                $startElectionsTime = $startElectionsTime - 2 * $hourSeconds;  // Users Can Login two hours before elections time.
                $endElectionsHour = $currentCampaign->ballot_box_closed_time; // Users Can Login until ballots closed
            }
            $endElectionsTime = strtotime("$currentCampaign->election_date $endElectionsHour" ); 
            if($isCounterRole){
                $endElectionsTime += (4 * $hourSeconds); 
            }
            Log::info($currentTime . ' ---' . $startElectionsTime .' ---' . $endElectionsTime . ' --- '. $currentCampaign->election_date . $endElectionsHour);

            if($currentTime < $startElectionsTime || $endElectionsTime < $currentTime){
                return false;
            }
            return true;
    }

    /**
     * Get the current loaded voters campaign
     * If the last campaign is with loaded voters then it is returned
     * else it returns the last Knesset campaign with loaded voters
     * */
    public static function currentLoadedVotersCampaign() {
        return self::where(function($query) {
            $query->where('loaded_voters', 1)->where('id', function($query) {
                $query->select(DB::raw('MAX(id)'))->from('election_campaigns')->first();
            });
        })->orWhere(function($query) {
          $query->where('loaded_voters', 1)->where('type', config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'));
        })->orderBy('id', 'DESC')->first();       
    }

    /**
     * Get the previous election campaign
     * this is determined by the end_date field: if it is null or if the date has not yet passed, then get the type and find the previous of the same type
     * */
    public static function previousCampaign() {
        $currentCampaign = self::currentCampaign();
        return self::where('id','<',DB::raw($currentCampaign['id']))->where('type', DB::raw($currentCampaign['type']))->orderBy('end_date', 'DESC')->first();
    }

    public static function previousKnessetCampaign($currentCampaignId) {
        return self::where('id', '<', $currentCampaignId)
            ->where('type', config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'))
            ->orderBy('id', 'DESC')
            ->first();
    }

    public static function previousMunicipalCampaign($currentCampaignId) {
        return self::where('id', '<', $currentCampaignId)
            ->where('type', config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL'))
            ->orderBy('id', 'DESC')
            ->first();
    }



    public function scopeWithCity($query) {
        $query->join('cities', 'cities.id', '=', 'voters.city_id');
    }

    public function scopeWithBallotBox($query,$leftJoin=true,$election_campaign_id){
        $join=$leftJoin?'leftJoin':'join';
        $query->$join('clusters', function ( $joinOn ) use($election_campaign_id){
            if($election_campaign_id)
            $joinOn->on('clusters.election_campaign_id', '=', DB::raw($election_campaign_id));
            else
            $joinOn->on('clusters.election_campaign_id', '=', 'election_campaigns.id');
        })
        ->$join('ballot_boxes', function ( $joinOn ) {
            $joinOn->on('ballot_boxes.cluster_id', '=', 'clusters.id');
        });
    }

    public function scopeWithCluster($query) {
        $query->leftJoin('ballot_boxes', function ( $joinOn ) {
            $joinOn->on('ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id');
        })->leftJoin('clusters', function ( $joinOn ) {
            $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id');
        });
    }

    public function scopeWithNeighborhood($query) {
        $query->join('neighborhoods', 'neighborhoods.city_id', '=', 'cities.id');
    }

    public function scopeWithArea($query) {
        $query->join('areas', 'areas.id', '=', 'cities.area_id');
    }

    public function scopeWithSubArea($query) {
        $query->join('areas', 'areas.id', '=', 'cities.sub_area_id');
    }

    public function scopeWithSupportStatus($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        } else {
            $query->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        }
    }

    public function scopeWithVoterSupportStatus($query, $scopeWithCurrentCampaign = false) {
        if ($scopeWithCurrentCampaign) {
            $query->LeftJoin('voter_support_status', function ( $joinOn ) use($scopeWithCurrentCampaign) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                        ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                        ->on('voter_support_status.election_campaign_id', '=', DB::raw($scopeWithCurrentCampaign));
            });
        } else {
            $query->LeftJoin('voter_support_status', function ( $joinOn ) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                        ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
            });
        }
    }

}
