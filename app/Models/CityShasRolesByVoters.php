<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class CityShasRolesByVoters extends Model {

    public $primaryKey = 'id';

    protected $table = 'city_shas_roles_by_voters';
    

	public function scopeWithVoter($query) {
        $query->leftJoin('voters', 'city_shas_roles_by_voters.voter_id', '=', 'voters.id');
    }

	public function phones()
    {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'voter_id');
    }
	
	public function scopeWithVoterPhone($query) {
        $query->leftJoin('voter_phones', 'voter_phones.id', '=', 'city_shas_roles_by_voters.voter_phone_id');
    }

	public function scopeWithRole($query) {
        $query->leftJoin('city_shas_roles', 'city_shas_roles_by_voters.city_shas_role_id', '=', 'city_shas_roles.id');
    }
}
