<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class MunicipalElectionMayorCandidates extends Model {

    public $primaryKey = 'id';

    protected $table = 'municipal_election_mayor_candidates';
    
    public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'municipal_election_mayor_candidates.voter_id', '=', 'voters.id');
    }
	
	public function scopeWithVoterPhone($query) {
        $query->leftJoin('voter_phones', 'voter_phones.id', '=', 'municipal_election_mayor_candidates.voter_phone_id');
    }

    public function scopeWithParty($query) {
        $query->leftJoin('municipal_election_parties', 'municipal_election_mayor_candidates.municipal_election_party_id', '=', 'municipal_election_parties.id');
    }

     public function phones()
    {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
    }

}
