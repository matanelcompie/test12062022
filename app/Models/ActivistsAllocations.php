<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer  $city_id
 * @property integer  $quarter_id
 * @property integer  $cluster_id
 * @property integer  $election_role_by_voter_id
 * @property string  $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActivistsAllocations extends Model {
    public $primaryKey = 'id';

    protected $table = 'activists_allocations';

    public function ActivistAllocationAssignment(){
        return $this->hasMany('App\Models\ActivistAllocationAssignment', 'activist_allocation_id', 'id');
    }
  
    public function scopeWithActivistsAssignments($query, $leftJoin=false){  
        
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id');
    }

    public function scopeWithElectionRoleByVoter($query,$leftJoin=false){  
        
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('election_roles_by_voters', function($query){
            $query->on( 'election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id');
        });
    }

    public function scopeWithActivistsAssignmentsFullData($query, $leftJoin=false){  
        $this->scopeWithActivistsAssignments($query, $leftJoin);
        $nameFunc = $leftJoin ? 'leftJoin' : 'join';
        $query->leftJoin('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id' )
            ->$nameFunc('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
            ->$nameFunc('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
            ->leftJoin('election_roles', 'election_roles.id' ,'=', 'activists_allocations.election_role_id');
    }

    public function scopeWithAssignmentActivistsData($query, $electionCampaignId, $leftJoin = true){  
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('activists_allocations_assignments','activists_allocations_assignments.activist_allocation_id','=','activists_allocations.id')   
              ->$joinMethod('election_roles_by_voters', function($query) use($electionCampaignId) {
                        $query->on('election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
                                ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($electionCampaignId));
                    })
                    
        ->$joinMethod( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' )
        ->join('election_roles', 'election_roles.id', 'activists_allocations.election_role_id');
    }

    // Get election activist user data
    public function scopeWithUserData($query){  
        $query->join('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activists_allocations.election_role_by_voter_id')
        ->join( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' )  
        ->join( 'users', 'users.voter_id', '=', 'voters.id' )
        ->join('election_roles', 'election_roles.id', 'activists_allocations.election_role_id');
    }
    public function scopeWithQuarters($query,$leftJoin=false){ 
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('quarters', 'quarters.id', '=', 'activists_allocations.quarter_id');
    }
    public function scopeWithClusters($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id');
    }
    public function scopeWithCity($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('cities', 'cities.id', '=', 'activists_allocations.city_id');
    }
    public function scopeWithArea($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('areas', 'areas.id', '=', 'cities.area_id');
    }
    public function scopeWithSubArea($query,$leftJoin=false){ 
        $nameFunc= $leftJoin?'leftJoin':'join'; 
        $query->$nameFunc('sub_areas', 'sub_areas.id', '=', 'cities.sub_area_id');
    }
    public function scopeWithBallotBox($query,$isLeftJoin=true){  
        $join=$isLeftJoin?'leftJoin':'join';
        $query->$join('ballot_boxes', 'ballot_boxes.id', '=', 'activists_allocations.ballot_box_id')
        ->$join('ballot_box_roles','ballot_box_roles.id','=','activists_allocations.ballot_box_role_id');
    }

    public function scopeWithBallotBoxRole($query,$isLeftJoin=true){  
        $query->join('election_roles','election_roles.id','=','activists_allocations.ballot_box_role_id');
    }

    public function scopeWithElectionRoleShiftId($query){  
        $query->leftJoin('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations.election_role_shift_id');
    } 

    //scope to election_role_by_voter_geographic_areas its by type geo example ballot box and value for specific election role voter
    public function scopeWithElectionRoleGeographicAreas($query,$entityType,$entityId) {
        $query->join('election_role_by_voter_geographic_areas',function($query)use($entityType,$entityId){
            $query->on('election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'activists_allocations.election_role_by_voter_id')
                    ->on('election_role_by_voter_geographic_areas.entity_type', '=', DB::raw($entityType))
                    ->on('election_role_by_voter_geographic_areas.entity_id', '=', DB::raw($entityId));
        });
    }

    public static function scopeWithElectionRoleCampaign($query,$election_campaign_id,$join=true){
        $joinFunc=$join?'join':'leftJoin';
        $query->$joinFunc('election_roles_by_voters',function($joinOn)use($election_campaign_id){
            $joinOn->on('election_roles_by_voters.id', '=', 'activists_allocations.election_role_by_voter_id')
                   ->on('election_roles_by_voters.election_campaign_id','=',DB::raw($election_campaign_id));
        });
    }


    //---------------

    public function scopeWithElectionRoles($query, $join='left') {
        if ( $join == 'left' ) {
            $query->leftjoin('election_roles', 'election_roles.id' ,'=', 'activists_allocations.election_role_id');
        } else {
            $query->join('election_roles', 'election_roles.id' ,'=', 'activists_allocations.election_role_id');
        }
    }

    public function scopeWithElectionRoleShifts($query,$join=false) {
        $nameFun=$join?'join':'leftJoin';
        $query->$nameFun('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id' );
    }

    public function scopeWithVoters($query) {
        $query->leftjoin('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id');
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

    public function scopeWithVoterBankDetails($query){
        $query->leftJoin('bank_details', 'bank_details.voter_id', '=', 'voters.id')
        ->leftJoin('bank_branches', 'bank_branches.id', '=','bank_details.bank_branch_id');
    }

}