<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class VoterCaptainFifty extends Model {

    public $primaryKey = 'id';
    protected $table = 'voters_with_captains_of_fifty';
    public static $lengthKey=10;

    public function phones() {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'captain_id');
    }

    public function votersInHousehold() {
        return $this->hasMany('App\Models\Voters', 'id', 'voter_id');
    }

    public function filteredVotersInHousehold() {
        return $this->hasMany('App\Models\VoterFilter\VoterQuery', 'id', 'voter_id');
    }

    public function scopeWithCity($query) {
        $query->join('cities', 'cities.id', '=', 'captain.city_id');
    }

    public function scopeWithVoter( $query) {
         $query->join( 'voters', 'voters.id', '=', 'voters_with_captains_of_fifty.voter_id' );
    }

    public function scopeWithVoterInBallot($query)
    {
        $query->join('voters_in_election_campaigns', function($joinOn){
            $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                   ->on('voters_in_election_campaigns.election_campaign_id','=','voters_with_captains_of_fifty.election_campaign_id');
        })->join('ballot_boxes','ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id');
    }

    public function scopeWithVotes($query){
        $query->join('votes', function($joinOn){
            $joinOn->on('votes.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                   ->on('votes.election_campaign_id','=','voters_with_captains_of_fifty.election_campaign_id');
        });
    }

    public function scopeWithVoters($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('voters', 'voters.id', '=', 'voters_with_captains_of_fifty.voter_id');
        } else {
            $query->join('voters', 'voters.id', '=', 'voters_with_captains_of_fifty.voter_id');
        }
    }

    public function scopeWithElectionCampaigns($query, $last_campaign_id, $leftJoin = true) {
        if($leftJoin){
            $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id));
            })
                ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id');

        }else{
            $query->join('voters_in_election_campaigns', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id));
            })
                ->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id');
        }
        $query->leftJoin('clusters', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id')
                ->on('clusters.election_campaign_id', '=', DB::raw($last_campaign_id));
        })
        ->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');

    }

    public function scopeWithElectionRoleByVoters($query)
    {
        $query->join('election_roles_by_voters', function ($joinOn) {
            $joinOn->on([
                ['election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id'],
                ['election_roles_by_voters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id']
            ]);
        })
            ->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
    }

    public function scopeWithCaptainOfFifty($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('voters AS captain', 'captain.id', '=', 'voters_with_captains_of_fifty.captain_id');
        } else {
            $query->join('voters AS captain', 'captain.id', '=', 'voters_with_captains_of_fifty.captain_id');
        }
    }

    public function scopeWithVoterSupportStatus($query, $election_campaign_id = null) {
        if ($election_campaign_id) {
            $query->leftJoin('voter_support_status', function ( $joinOn ) use($election_campaign_id) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')
                    ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                    ->on('voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id));
            });
        } else {
            $query->leftJoin('voter_support_status', function ( $joinOn ) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')
                    ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
            });
        }
    }
    public function scopeWithPrevVoterSupportStatus($query, $election_campaign_id) {
            $query->leftJoin('voter_support_status as prev_voter_support_status', function ( $joinOn ) use($election_campaign_id) {
                $joinOn->on('prev_voter_support_status.voter_id', '=', 'voters.id')
                    ->on('prev_voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                    ->on('prev_voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id));
            })
            ->leftJoin('support_status as prev_support_statuses', function ( $joinOn ) use($election_campaign_id) {
                $joinOn->on('prev_support_statuses.id', '=', 'prev_voter_support_status.support_status_id')
                    ->on('prev_support_statuses.election_campaign_id', '=', DB::raw($election_campaign_id));
            });
            ;
    }

    public function scopeWithCaptainVotersCity($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('cities', 'cities.id', '=', 'voters.city_id');
        } else {
            $query->join('cities', 'cities.id', '=', 'voters.city_id');
        }
    }

    public function scopeWithCaptainVotersClusterCity($query, $leftJoin = true,$election_campaign_id=false) {
        if($leftJoin){
            $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) use ($election_campaign_id) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
                    if($election_campaign_id)
                    $joinOn->on('voters_in_election_campaigns.election_campaign_id', '=',DB::raw($election_campaign_id));//'voters_with_captains_of_fifty.election_campaign_id'
            })
                ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
                ->leftJoin('clusters', function ( $joinOn )  {
                    $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id')
                        ->on('clusters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
                })
                ->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');
        } else{
            $query->join('voters_in_election_campaigns', function ( $joinOn ) use ($election_campaign_id)  {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
                    if($election_campaign_id)
                    $joinOn->on('voters_in_election_campaigns.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');

            })
                ->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
                ->join('clusters', function ( $joinOn )  {
                    $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id')
                        ->on('clusters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
                })
                ->join('cities', 'cities.id', '=', 'clusters.city_id');
        }

    }
}