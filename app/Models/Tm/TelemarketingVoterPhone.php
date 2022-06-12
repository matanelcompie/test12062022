<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

 
class TelemarketingVoterPhone extends Model {

    public $primaryKey = 'id';
    protected $table = 'telemarketing_voter_phones';

    public function scopeWithPortions($query) {
    	$query->leftJoin('voter_filters', 'voter_filters.id', '=', 'telemarketing_voter_phones.portion_id');
    }
 
}
