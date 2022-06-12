<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class VoterElectionCampaigns extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voters_in_election_campaigns';

    public function scopeWithVoter($query)
    {
        $query->join('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id');
    }

    public function scopeWithElectionCampaign($query)
    {
        $query->join('election_campaigns', 'election_campaigns.id', '=', 'voters_in_election_campaigns.election_campaign_id');
    }

    public function scopeWithBallotBox($query)
    {
        $query->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id');
    }
    public function scopeWithBallotBoxAreaCityNeighborhoodCluster($query)
    {
        $query->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')->join('clusters', 'ballot_boxes.cluster_id', '=', 'clusters.id')
            ->LeftJoin('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id')
            ->join('cities', 'cities.id', '=', 'clusters.city_id')
            ->join('areas', 'areas.id', '=', 'cities.area_id');
    }

    public function scopeWithCluster($query)
    {
        $query->join('clusters', 'ballot_boxes.cluster_id', '=', 'clusters.id');
    }

    public function scopeWithCity($query)
    {
        $query->join('cities', 'cities.id', '=', 'clusters.city_id');
    }

    public function scopeWithStreet($query)
    {
        $query->join('STREETS', 'STREETS.id', '=', 'clusters.street_id');
    }

    public function scopeWithArea($query)
    {
        $query->join('areas', 'areas.id', '=', 'cities.area_id');
    }

    public function scopeWithVote($query ,$isLeftJoin=true) {
		if($isLeftJoin){
			$query->leftJoin('votes', function($join) {
                    $join->on('votes.voter_id', '=', 'voters.id');
                    $join->on('votes.election_campaign_id', '=', 'election_campaigns.id');
                })
                ->leftJoin('vote_sources', 'vote_sources.id', '=', 'votes.vote_source_id');
		}
		else{
			$query->join('votes', function($join) {
                    $join->on('votes.voter_id','=','voters_in_election_campaigns.voter_id')
						 ->on('votes.election_campaign_id','=','voters_in_election_campaigns.election_campaign_id');
                });
		}
    }

    public function scopeWithTransportation($query)
    {
        $query->leftJoin('voter_transportations', function ($join) {
            $join->on('voter_transportations.voter_id', '=', 'voters.id');
            $join->on('voter_transportations.election_campaign_id', '=', 'election_campaigns.id');
        });
    }

	public function scopeWithVoterSupportStatusStrictly($query , $isLeftJoin=true){
		if($isLeftJoin){
			$query->leftJoin('voter_support_status' , function($joinOn){
			 $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
			        ->on('voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id')
                    ->on('voter_support_status.deleted', DB::raw(0));
			
			})->leftJoin('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
		}
		else{
			$query->join('voter_support_status' , function($joinOn){
			 $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
			        ->on('voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id')
                    ->on('voter_support_status.deleted', DB::raw(0));
			
			});
		}
	}
	
    public function scopeWithVoterSupportStatus($query, $scopeWithCurrentCampaign = false, $statusType = null)
    {
        $statusConstant = !$statusType ? 'ENTITY_TYPE_VOTER_SUPPORT_ELECTION' : $statusType;
        if ($scopeWithCurrentCampaign) {
            $query->LeftJoin('voter_support_status', function ($joinOn) use ($scopeWithCurrentCampaign, $statusConstant) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                    ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.' . $statusConstant)))
                    ->on('voter_support_status.election_campaign_id', '=', DB::raw($scopeWithCurrentCampaign));
            });
        } else {
            $query->LeftJoin('voter_support_status', function ($joinOn) use( $statusConstant) {
                $joinOn->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                    ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.' . $statusConstant)));
            });
        }
    }

    public function scopeWithSupportStatus($query, $leftJoin = false)
    {
        if ($leftJoin) {
            $query->leftJoin('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        } else {
            $query->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        }
    }

    public function scopeWithElectionRoleByVoters($query)
    {
        $query->join('election_roles_by_voters', function ($joinOn) {
            $joinOn->on('election_roles_by_voters.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id')
                ->on('election_roles_by_voters.voter_id', '=', 'voters_in_election_campaigns.voter_id');
        })->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
    }

    public function ballotBoxes()
    {
        return $this->hasMany('App\Models\BallotBox', 'id', 'ballot_box_id');
    }

    public function votes()
    {
        return $this->hasMany('App\Models\Votes', 'voter_id', 'voter_id');
    }

    public function supportStatuses()
    {
        return $this->hasMany('App\Models\VoterSupportStatus', 'voter_id', 'voter_id');
    }
    public function voterPhones()
    {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
    }
}
