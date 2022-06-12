<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;



class VotersInElectionCampaigns extends Model {
    public $primaryKey = 'id';
    protected $table = 'voters_in_election_campaigns';

    public function scopeWithBallotBox($query) {
        $query->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
            ->leftJoin('clusters', function ( $joinOn ) {
                $joinOn->on([
                    ['clusters.id', '=', 'ballot_boxes.cluster_id'],
                    ['clusters.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id']
                ]);
            })
            ->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');
    }

    /**
     * This function gets the supports statuses
     * of type final.
     *
     * @param $query
     */
    public function scopeWithSupportStatus($query, $leftJoin = true, $supportStatusType = null) {
        
        if(!isset($supportStatusType)){ $supportStatusType = config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'); }

        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('voter_support_status', function ( $joinOn ) use ($supportStatusType){
            $joinOn->on([
                ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                ['voter_support_status.entity_type', '=', DB::raw($supportStatusType)]
            ]);
        });
    }
    public function scopeWithVoters($query) {
        $query->leftJoin('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id');
    }
    public function scopeWithVoterPhone($query , $leftJoin = false) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';

        $query->$joinMethod('voter_phones', 'voter_phones.voter_id', '=', 'voters_in_election_campaigns.voter_id');
    }
    public function scopeWithVotes($query) {
        $query->leftJoin('votes', function ( $joinOn ) {
            $joinOn->on('votes.voter_id', '=', 'voters_in_election_campaigns.voter_id')/* = */
            ->on('votes.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
        });
    }

    public function scopeWithCaptainFifty($query , $leftJoin = false)  {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('voters_with_captains_of_fifty', function ( $joinOn ) {
            $joinOn->on([
                ['voters_with_captains_of_fifty.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voters_with_captains_of_fifty.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
            ]);
        });
    }
	
	public function scopeWithCaptain50ElectionsRoles($query)
    {
        $query->leftJoin('election_roles_by_voters', function ($join) {
            $join->on('election_roles_by_voters.voter_id', '=', 'voters_in_election_campaigns.id');
            $join->on('election_roles_by_voters.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
        })->leftJoin('election_roles as cap50_roles','cap50_roles.id','=','election_roles_by_voters.election_role_id')
		  ->where('cap50_roles.system_name','captain_of_fifty');
    }

    public function scopeWithCaptain50ElectionsRole($query) {
        $query->leftJoin('election_roles_by_voters', function ( $joinOn ) {
            $joinOn->on([
                ['election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id'],
                ['election_roles_by_voters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id']
            ]);
        });
    }

    public function scopeWithElectionRoles($query) {
        $query->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
    }

    public function scopeWithCaptainVoter($query) {
        $query->leftJoin('voters as captain_voters', 'captain_voters.id', '=', 'election_roles_by_voters.voter_id');
    }

    public function scopeWithCaptainCity($query) {
        $query->leftJoin('cities', 'cities.id', '=', 'captain_voters.city_id');
    }

    public function scopeWithCluster ( $query ) {
        $query->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' );
    }

    public function scopeWithBallot ( $query ) {
        $query->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' );
    }
    public function scopeWithBallotCluster ( $query ) {
        $query->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' );
        $query->join( 'clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id');
    }
    public function scopeWithBallotCity ( $query ) {
        $query->join( 'cities', 'cities.id', '=', 'clusters.city_id' );
    }
}