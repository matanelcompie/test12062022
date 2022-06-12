<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class ElectionRolesGeographical extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_role_by_voter_geographic_areas';

    protected $hidden = ['countBallotBoxRelation'];


    public function role() {
        return $this->belongsToMany( 'App\Models\VoterElectionsRoles', 'election_role_by_voter_id');
    }

	public function scopeWithElectionRolesByVotersCampaignBallotCityArea($query,$election_campaign_id=false) {
        $query->join('election_roles_by_voters',function($query)use($election_campaign_id){
            $query->on( 'election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id');
            if($election_campaign_id)
            $query->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($election_campaign_id));
        })
              ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
			  ->join('election_roles', 'election_roles.id' ,'=', 'election_roles_by_voters.election_role_id')
			  ->join('ballot_boxes','ballot_boxes.id','=','entity_id')
			  ->join('ballot_box_roles','ballot_box_roles.id','=','ballot_boxes.ballot_box_role_id')
			  ->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
			  ->join('cities','cities.id','=','clusters.city_id')
			  ->leftJoin('areas','areas.id','=','cities.area_id')
              ->leftJoin('sub_areas','sub_areas.id','=','cities.sub_area_id');
			  
    }
	
	public function scopeWithElectionRolesByVotersAndCampaignBallot($query) {
        $query->join('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
              ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
			  ->leftJoin('election_roles', 'election_roles.id' ,'=', 'election_roles_by_voters.election_role_id');
    }
	
	public function phones(){
		  return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
	}
	
	
	
    public function scopeWithElectionRolesByVoters($query, $leftJoin = true) {
	    if ( $leftJoin ) {
            $query->leftJoin('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id');
        } else {
            $query->join('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id');
        }
    }

    public function scopeWithElectionRoles($query, $join='left') {
        if ( $join == 'left' ) {
            $query->leftjoin('election_roles', 'election_roles.id' ,'=', 'election_roles_by_voters.election_role_id');
        } else {
            $query->join('election_roles', 'election_roles.id' ,'=', 'election_roles_by_voters.election_role_id');
        }
    }

    public function scopeWithElectionRoleShifts($query) {
        $query->leftjoin('election_role_shifts', 'election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id' );
    }

    public function scopeWithVoters($query) {
        $query->leftjoin('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id');
    }

    public function scopeWithVoterCity($query) {
	    $query->leftjoin('cities', 'cities.id', '=', 'voters.city_id');
    }

    public function scopeWithClusters($query) {
        $query->leftJoin('clusters', function ( $joinOn ) {
            $joinOn->on([
                ['clusters.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))]
            ]);
        })->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');
    }

    public function scopeWithBallotBoxes($query, $getAllData = true) {
        $query->leftJoin('ballot_boxes', function ( $joinOn ) {
            $joinOn->on([
                ['ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
            ]);
        })
        ->leftJoin('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
        ->leftJoin('cities', 'cities.id', '=', 'clusters.city_id');
        if($getAllData){
            $query->leftJoin('ballot_box_roles', 'ballot_box_roles.id', '=', 'ballot_boxes.ballot_box_role_id')
            ->leftJoin('election_role_shifts', 'election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id');
        }

    }
    public function scopeWithBallotBoxesOnly($query) {
        $query->leftJoin('ballot_boxes', function ( $joinOn ) {
            $joinOn->on([
                ['ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
            ]);
        });
    }

    public function ballot_boxes() {
        return $this->hasMany('App\Models\BallotBox', 'cluster_id', 'entity_id');
    }

    public function countBallotBoxRelation() {
        return $this->ballot_boxes()
                    ->selectRaw('cluster_id, count(ballot_boxes.id) as ballot_boxes_count')
                    ->groupBy('cluster_id');
    }

    public function getCountBallotBoxAttribute() {
        // if relation is not loaded already, let's do it first
        if ( ! array_key_exists('countBallotBoxRelation', $this->relations))
            $this->load('countBallotBoxRelation');
        $related = $this->getRelation('countBallotBoxRelation');
        // then return the count directly
        if ( ($related)&&(isset($related[0])) ) {
            return (int) $related[0]->ballot_boxes_count;
        } else {
            return 0;
        };
    }

    public function scopeWithOtherBallotGeo($query, $last_campaign_id) {
        $query->leftJoin('election_role_by_voter_geographic_areas as other_geo', function ( $joinOn ) {
            $joinOn->on([
                ['other_geo.id', '<>', 'election_role_by_voter_geographic_areas.id'],
                ['other_geo.entity_id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['other_geo.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
            ]);
        })
        ->leftJoin('election_roles_by_voters as election_roles_by_voters_other', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['election_roles_by_voters_other.id', '=', 'other_geo.election_role_by_voter_id'],
                ['election_roles_by_voters_other.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->leftjoin('election_roles as election_roles_other', 'election_roles_other.id', '=', 'election_roles_by_voters_other.election_role_id')
        ->leftjoin('election_role_shifts as election_role_shifts_other', 'election_role_shifts_other.id', '=', 'other_geo.election_role_shift_id')
        ->leftJoin('voters as voters_other', 'voters_other.id', '=', 'election_roles_by_voters_other.voter_id');
    }

    public function scopeWithDriverTransportation($query) {
        $query->leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'election_role_by_voter_geographic_areas.entity_id')
            ->leftJoin('voters_in_election_campaigns', function ( $joinOn ) {
                $joinOn->on([
                    ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                    ['voters_in_election_campaigns.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
                ]);
            })
            ->leftJoin('voter_transportations', function ( $joinOn ) {
                $joinOn->on([
                    ['voter_transportations.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                    ['voter_transportations.voter_driver_id', '=', 'election_roles_by_voters.voter_id'],
                    ['voter_transportations.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
                ]);
            });

    }

    public function scopeWithElectionCampaignBallots($query, $last_campaign_id) {
        $query->join('ballot_boxes', function ( $joinOn ) {
                $joinOn->on([
                    ['ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                    ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
                ]);
            })
            ->join('clusters', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on([
                    ['clusters.id', '=', 'ballot_boxes.cluster_id'],
                    ['clusters.election_campaign_id', '=', DB::raw($last_campaign_id)]
                ]);
            })
            ->join('cities', 'cities.id', '=', 'clusters.city_id')
            ->join('ballot_box_roles', 'ballot_box_roles.id', '=', 'ballot_boxes.ballot_box_role_id')
            ->join('election_role_shifts', function ( $joinOn ) {
                $joinOn->on([
                    ['election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id'],
                    ['election_role_shifts.deleted', '=', DB::raw(0)]
                ]);
            })
            ->leftJoin('municipal_election_parties', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on([
                    ['municipal_election_parties.city_id', '=', 'cities.id'],
                    ['municipal_election_parties.election_campaign_id', '=', DB::raw($last_campaign_id)],
                    ['municipal_election_parties.shas', '=', DB::raw(1)],
                    ['municipal_election_parties.deleted', '=', DB::raw(0)]
                ]);
            });
    }

    public function scopeWithElectionCampaignMiCities($query) {
        $query->leftJoin('cities as mi_cities', 'mi_cities.id', '=', 'voters.mi_city_id');
    }

    public function scopeWithElectionCampaignMiStreets($query) {
        $query->leftJoin('streets', function ( $joinOn ) {
            $joinOn->on([
                ['streets.id', '=', 'voters.mi_street_id'],
                ['streets.deleted', '=', DB::raw(0)]
            ]);
        });
    }

    public function otherElectionRoles() {
        return $this->hasMany('App\Models\ElectionRolesGeographical', 'entity_id', 'entity_id');
    }
    public function scopeWithVoterBankDetails($query){
        $query->leftJoin('bank_details', 'bank_details.voter_id', '=', 'voters.id')
        ->leftJoin('bank_branches', 'bank_branches.id', '=','bank_details.bank_branch_id');
    }

    // public function LastReportVotesDetails(){

    // }
}