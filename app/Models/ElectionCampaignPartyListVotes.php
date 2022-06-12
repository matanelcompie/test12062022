<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ElectionCampaignPartyListVotes extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_campaign_party_list_votes';

    public static $lengthKey = 10;

    public function scopeWithVoter($query) {
        $query->join('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id');
    }

    public function scopeWithBallotBox($query,$leftJoin=false) {
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('ballot_boxes', 'ballot_boxes.id', '=', 'election_campaign_party_list_votes.ballot_box_id');
    }

    public function scopeWithCluster($query,$leftJoin=false) {
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('clusters', 'ballot_boxes.cluster_id', '=', 'clusters.id');
    }

    public function scopeWithCity($query,$leftJoin=false) {
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('cities', 'cities.id', '=', 'clusters.city_id');
    }

    public function scopeWithBallotBoxCity($query,$leftJoin=false){
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('cities as ballot_box_city','clusters.city_id','=','ballot_box_city.id');
    }
    public function scopeWithAreaBallotBox($query,$leftJoin=false) {
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('areas as ballot_boxes_areas', 'ballot_boxes_areas.id', '=', 'ballot_box_city.area_id');
    }


    public function scopeWithElectionCampaignPartyLists($query,$election_campaign_id=null,$leftJoin=false) {

        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('election_campaign_party_lists', function($joinOn)use($election_campaign_id){
            $joinOn->on('election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id');
            if($election_campaign_id) 
            $joinOn->on('election_campaign_party_lists.election_campaign_id','=',DB::raw($election_campaign_id)); 
        });
    }

    public function scopeWithArea($query,$leftJoin=false) {
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('areas', 'areas.id', '=', 'cities.area_id');
    }
    

    public function scopeWithVoterElectionCampaign($query, $scopeWithCurrentCampaign = false) {
        if ($scopeWithCurrentCampaign) {
            $query->leftJoin('voters_in_election_campaigns', function($joinOn) use($scopeWithCurrentCampaign) {
                $joinOn->on('voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id')
                        ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($scopeWithCurrentCampaign));
            });
        } else {
            $query->leftJoin('voters_in_election_campaigns', 'voters_in_election_campaigns.election_campaign_id', '=', 'election_campaigns.id');
        }
    }

}
