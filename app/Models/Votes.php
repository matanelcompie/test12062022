<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class Votes extends Model {

    public $primaryKey = 'id';
    protected $table = 'votes';

    public static $lengthKey = 10;

	public function scopeWithVotersInElectionCampaign($query) {
        $query->join('voters_in_election_campaigns' , function($joinOn){
			$joinOn->on('voters_in_election_campaigns.election_campaign_id' ,'='  , 'votes.election_campaign_id')
			->on('voters_in_election_campaigns.voter_id' ,'=', 'votes.voter_id');
		});
    }
	
	public function scopeWithVoterSupportStatus($query) {
        $query->join('voter_support_status' , function($joinOn){
			$joinOn->on('voter_support_status.election_campaign_id' ,'='  , 'votes.election_campaign_id')
			->on('voter_support_status.voter_id' ,'='  , 'votes.voter_id');
		});
    }
    public function scopeWithFinalSupportStatus($query){
        $query->join('voter_support_status AS vssFinal', function ( $joinOn ) {
            $joinOn->on('vssFinal.voter_id', '=', 'votes.voter_id')/* = */
            ->on('vssFinal.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
            ->on('vssFinal.election_campaign_id', '=', 'votes.election_campaign_id');
        })
        ->join('support_status','vssFinal.support_status_id','=','support_status.id');
    }

    public function scopeWithCluster($query) {
        $query->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' )
        ->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id');
    }
    public function scopeWithClusterLeader($query, $last_campaign_id) {
        $query->join('clusters' , function($joinOn) use ($last_campaign_id) {
            $joinOn->on([
                ['clusters.id', '=', 'ballot_boxes.cluster_id'],
                ['clusters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
            ->join('election_roles_by_voters' , function($joinOn) use ($last_campaign_id) {
                $joinOn->on([
                    ['election_roles_by_voters.voter_id', '=', 'clusters.leader_id'],
                    ['election_roles_by_voters.election_campaign_id', '=', DB::raw($last_campaign_id)]
                ]);
            })
            ->join('election_roles' , function($joinOn) {
                $joinOn->on([
                    ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                    ['election_roles.system_name', '=', DB::raw('"' . config('constants.activists.election_role_system_names.clusterLeader') . '"')],
                    ['election_roles.deleted', '=', DB::raw(0)]
                ]);
            });
    }

    public function scopeWithVoteVoterSupportStatus($query, $last_campaign_id) {
        $query->join('voter_support_status' , function($joinOn) use ($last_campaign_id) {
            $joinOn->on([
                ['voter_support_status.voter_id' ,'='  , 'votes.voter_id'],
                ['voter_support_status.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                ['voter_support_status.deleted', '=', DB::raw(0)]
            ]);
        })
        ->join('support_status' , function($joinOn) {
            $joinOn->on([
                ['support_status.id', '=', 'voter_support_status.support_status_id'],
                ['support_status.active', '=', DB::raw(1)],
                ['support_status.deleted', '=', DB::raw(0)]
            ]);
        });
    }

    public function scopeWithCaptain50($query, $last_campaign_id) {
        $query->join('voters_with_captains_of_fifty' , function($joinOn) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_with_captains_of_fifty.voter_id', '=', 'votes.voter_id'],
                ['voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
            ]);
        })
        ->join('election_roles_by_voters' , function($joinOn) use ($last_campaign_id) {
            $joinOn->on([
                ['election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id'],
                ['election_roles_by_voters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->join('election_roles' , function($joinOn) {
            $joinOn->on([
                ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                ['election_roles.system_name', '=', DB::raw('"' . config('constants.activists.election_role_system_names.ministerOfFifty') . '"')],
                ['election_roles.deleted', '=', DB::raw(0)]
            ]);
        });
    }

    public function scopeWithVoterInElectionCampaign($query, $electionCampaignId) {
        $query->join('voters_in_election_campaigns' , function($joinOn) use ($electionCampaignId) {
            $joinOn->on([
                ['voters_in_election_campaigns.voter_id', '=', 'votes.voter_id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', DB::raw($electionCampaignId)]
            ]);
        })
        ->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' );
    }

    public static function scopeWithVoteSource($query){
        $query->join('vote_sources','vote_sources.id','=','votes.vote_source_id');
    }
}
