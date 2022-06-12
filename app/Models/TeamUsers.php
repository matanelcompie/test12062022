<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property integer $team_id
 * @property integer $user_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class TeamUsers extends Model {

    public $primaryKey = 'id';
    protected $table = 'team_users';

    /**
     * @var array
     */
    protected $fillable = [ 'team_id',
                            'user_id',
                            'created_at',
                            'updated_at' ];

    public function scopeWithTeam ( $query ) {

        $query->join( 'teams', function ( $joinOn ) {

            $joinOn->on( 'team_users.team_id', '=', 'teams.id' )
                   ->on( 'teams.deleted', '=', DB::raw( 0 ) );
        } );
    }
	
	public function scopeWithUser ( $query ) {

        $query->join( 'users',  'team_users.user_id', '=', 'users.id' );
    }

}
