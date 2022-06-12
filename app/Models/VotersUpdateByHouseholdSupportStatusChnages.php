<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VotersUpdateByHouseholdSupportStatusChnages extends Model {

    public $primaryKey = 'id';
    protected $table = 'voters_update_by_household_support_status_chnages';

	
  public function scopeWithUpdateSourceRow($query) {
        $query->join('household_support_status_changes', 'household_support_status_changes.id', '=', 'voters_update_by_household_support_status_chnages.household_support_status_change_id');
  }

  public function scopeWithVoter($query) {
        $query->join('voters', 'voters.id', '=', 'voters_update_by_household_support_status_chnages.voter_id');
  }	
 
}