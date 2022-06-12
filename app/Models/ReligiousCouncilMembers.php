<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class ReligiousCouncilMembers extends Model {

    public $primaryKey = 'id';

    protected $table = 'religious_council_members';
    
	
	public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'religious_council_members.voter_id', '=', 'voters.id');
    }

	public function phones()
    {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
    }
	
	public function scopeWithVoterPhone($query) {
        $query->leftJoin('voter_phones', 'voter_phones.id', '=', 'religious_council_members.voter_phone_id');
    }

	public function scopeWithRole($query) {
        $query->leftJoin('religious_council_roles', 'religious_council_members.religious_council_role_id', '=', 'religious_council_roles.id');
    }
}
