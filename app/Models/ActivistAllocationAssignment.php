<?php

namespace App\Models;

use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use Exception;
use Illuminate\Database\Eloquent\Model;


class ActivistAllocationAssignment extends Model {

    public $primaryKey = 'id';
    protected $table = 'activists_allocations_assignments';

    public function otherActivistAllocationAssignment()
    {
        return $this->hasMany('App\Models\ActivistAllocationAssignment', 'activist_allocation_id', 'activist_allocation_id');
    }

    public function allocation()
    {
        return $this->hasOne('App\Models\ActivistsAllocations', 'id', 'activist_allocation_id');
    }

    public function electionRoleByVoter()
    {
        return $this->hasOne('App\Models\ElectionRolesByVoters', 'id', 'election_role_by_voter_id');
    }

    public function scopeWithActivistAllocation($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('activists_allocations', 'activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id');
    }

    public function scopeWithElectionRoleShifts($query, $leftJoin = true)
    {
        $nameFunc = $leftJoin ? 'leftJoin' : 'join';
        $query->$nameFunc('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id');
    }

    public function scopeWithActivistRolesPayments($query,$leftJoin=true,$includeBonus=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('activist_roles_payments',function($onJoin)use($includeBonus){
            $onJoin->on('activist_roles_payments.activists_allocations_assignment_id', '=', 'activists_allocations_assignments.id');
            if($includeBonus==false)
            $onJoin->whereNull('activist_roles_payments.payment_type_additional_id');
        });
    }

    //must with scopeWithActivistAllocation
    public function scopeWithBallotBox($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('ballot_boxes', 'ballot_boxes.id', '=', 'activists_allocations.ballot_box_id');
    }
     //must with scopeWithActivistAllocation
    public function scopeWithClusters($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id');
    }
     //must with scopeWithActivistAllocation
    public function scopeWithCity($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('cities', 'cities.id', '=', 'activists_allocations.city_id');
    }
     //must with scopeWithActivistAllocation
    public function scopeWithArea($query,$leftJoin=false){  
        $nameFunc= $leftJoin?'leftJoin':'join';
        $query->$nameFunc('areas', 'areas.id', '=', 'cities.area_id');
    }

    //must with scopeWithActivistAllocation
    public function scopeWithQuarter($query, $leftJoin = false)
    {
        $nameFunc = $leftJoin ? 'leftJoin' : 'join';
        $query->$nameFunc('quarters', 'quarters.id', '=', 'activists_allocations.quarter_id');
    }

     //must with scopeWithActivistAllocation
    public function scopeWithSubArea($query,$leftJoin=false){ 
        $nameFunc= $leftJoin?'leftJoin':'join'; 
        $query->$nameFunc('sub_areas', 'sub_areas.id', '=', 'cities.sub_area_id');
    }

    public function scopeWithElectionRoleByVoter($query, $leftJoin = false)
    {
        $nameFunc = $leftJoin ? 'leftJoin' : 'join';
        $query->$nameFunc('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
        ->$nameFunc('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
    }

}