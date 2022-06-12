<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class CityCouncilMembers extends Model {

    public $primaryKey = 'id';

    protected $table = 'city_council_members';
    
    public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'city_council_members.voter_id', '=', 'voters.id');
    }
	public function phones()
    {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
    }
	public function scopeWithVoterPhone($query) {
        $query->leftJoin('voter_phones', 'voter_id', '=', 'city_council_members.voter_id');
    }
	public function scopeWithParty($query) {
        $query->leftJoin('municipal_election_parties', 'city_council_members.municipal_election_party_id', '=', 'municipal_election_parties.id');
		$query->leftJoin('election_campaigns', 'election_campaigns.id', '=', 'municipal_election_parties.election_campaign_id');
    }

	public function scopeWithDepartment($query) {
        $query->leftJoin('city_departments', 'city_council_members.city_department_id', '=', 'city_departments.id');
    }

}
