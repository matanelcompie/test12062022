<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class HouseholdSupportStatusChanges extends Model {

    public $primaryKey = 'id';
    protected $table = 'household_support_status_changes';

	public function scopeWithUserVoter($query) {
        $query->join('users', 'users.id', '=', 'household_support_status_changes.user_create_id')
		      ->join('voters', 'voters.id', '=', 'users.voter_id');
    }
 
}