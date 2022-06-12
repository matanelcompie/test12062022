<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class HousholdCaptainOfFifty extends Model {

    public $primaryKey = 'id';
    protected $table = 'households_with_captains_of_fifty';

	public function phones() {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'captain_id');
    }
	
    public function votersInHousehold() {
        return $this->hasMany('App\Models\Voters', 'household_id', 'household_id');
    }
	
	 public function filteredVotersInHousehold() {
        return $this->hasMany('App\Models\VoterFilter\VoterQuery', 'household_id', 'household_id');
    }

    public function houseHolderDetails() {
        return $this->hasMany('App\Models\Voters', 'household_id', 'household_id');
    }

    public function scopeWithCaptainOfFifty($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('voters AS captain', 'captain.id', '=', 'households_with_captains_of_fifty.captain_id');
        } else {
            $query->join('voters AS captain', 'captain.id', '=', 'households_with_captains_of_fifty.captain_id');
        }
    }

    public function scopeWithVoters($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('voters', 'voters.household_id', '=', 'households_with_captains_of_fifty.household_id');
        } else {
            $query->join('voters', 'voters.household_id', '=', 'households_with_captains_of_fifty.household_id');
        }
    }

    public function scopeWithElectionCampaigns($query, $last_campaign_id) {
        $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
                   ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id));
        })
        ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
        ->leftJoin('clusters', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id')
                   ->on('clusters.election_campaign_id', '=', DB::raw($last_campaign_id));
        })
        ->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');
    }

    public function scopeWithCity($query) {
        $query->join('cities', 'cities.id', '=', 'captain.city_id');
    }

    public function scopeWithCluster($query) {
        $query->join('clusters', 'clusters.city_id', '=', 'captain.city_id');
    }
	
	public function householdMembers(){
        return $this->hasMany( 'App\Models\Voters', 'household_id', 'household_id' );
	}

    public function scopeWithVoterSupportStatus($query, $scopeWithCurrentCampaign = false) {
        if ($scopeWithCurrentCampaign) {
            $query->leftJoin('voter_support_status', function ( $joinOn ) use($scopeWithCurrentCampaign) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')
                        ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                        ->on('voter_support_status.election_campaign_id', '=', DB::raw($scopeWithCurrentCampaign));
            });
        } else {
            $query->leftJoin('voter_support_status', function ( $joinOn ) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')
                        ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
            });
        }
    }

    public function scopeWithSupportStatus($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        } else {
            $query->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        }
    }

    public function scopeWithCaptainVotersCity($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('cities', 'cities.id', '=', 'voters.city_id');
        } else {
            $query->join('cities', 'cities.id', '=', 'voters.city_id');
        }
    }
}