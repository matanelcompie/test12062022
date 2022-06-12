<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class TeamLeaderHistory extends Model {

    public $primaryKey = 'id';
    protected $table = 'team_leader_history';
 
 
    public function scopeWithExtraData ( $query ) {

        $query->join( 'users', 'users.id', '=', 'team_leader_history.user_id' )
              ->join( 'voters', 'voters.id', '=', 'users.voter_id' )
			  ;
    }

}
