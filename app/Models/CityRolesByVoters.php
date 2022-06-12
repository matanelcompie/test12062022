<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class CityRolesByVoters extends Model {

    public $primaryKey = 'id';

    protected $table = 'city_roles_by_voters';
    

	public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'city_roles_by_voters.voter_id', '=', 'voters.id');
    }
	
	public function scopeWithParty($query) {
        $query->leftJoin('municipal_election_parties', 'city_roles_by_voters.municipal_election_party_id', '=', 'municipal_election_parties.id');
		$query->leftJoin('election_campaigns', 'election_campaigns.id', '=', 'municipal_election_parties.election_campaign_id');
    }

	public function scopeWithDepartment($query) {
        $query->leftJoin('city_departments', 'city_roles_by_voters.city_department_id', '=', 'city_departments.id');
    }
}
