<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

use App\Models\User;
use App\Models\RolesByUser;

use Carbon\Carbon;
/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $leader_id
 * @property boolean $deleted
 * @property integer $user_create_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class Teams extends Model {



    public $primaryKey = 'id';
    protected $table = 'teams';

	public static $snakeAttributes = false; //disable converting camel case relations to snake_case
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'leader_id',
                            'deleted',
                            'user_create_id',
                            'created_at',
                            'updated_at' ];
							
	public function departments(){
        return $this->hasMany( 'App\Models\TeamDepartments' ,  'team_id' , 'id')->where('team_departments.deleted',0);
    }
	
	public function geoTemplates(){
        return $this->hasMany( 'App\Models\GeographicFilterTemplates' ,  'team_id' , 'id');
    }
	
	public function sectorialTemplates(){
        return $this->hasMany( 'App\Models\SectorialFilterTemplates' ,  'team_id' , 'id');
    }	
	
	public function total_roles(){
        return $this->hasMany( 'App\Models\RolesByUsers' ,  'team_id' , 'id');
    }

    public function scopeWithUser ( $query ) {

        $query->leftJoin( 'users', function ( $joinOn ) {

            $joinOn->on( [ [ 'teams.leader_id',
                             '=',
                             'users.id' ],
                           [ 'teams.deleted',
                             '=',
                             DB::raw( 0 ) ] ] );
        } )->leftJoin( 'voters', function ( $joinOn ) {

            $joinOn->on( [ [ 'users.voter_id',
                             '=',
                             'voters.id' ],
                           [ 'users.deleted',
                             '=',
                             DB::raw( 0 ) ] ] );
        } );
    }

    public function users() {
        return $this->belongsToMany('App\Models\User', 'roles_by_users', 'team_id', 'user_id')
            ->wherePivot('deleted', 0)
            ->where(function ($query) {
                            $query->whereNull('roles_by_users.from_date')
                            ->orWhere('roles_by_users.from_date', '<=', Carbon::now());
                        })
            ->where(function ($query1) {
                            $query1->whereNull('roles_by_users.to_date')->orWhere('roles_by_users.to_date', '>=', Carbon::now()->addDays(-1));
                        });
    }

    //special relation for users count in team
    public function users_count() {
        return $this->users()->selectRaw('count(Distinct users.id) as users_count')->groupBy('roles_by_users.team_id');
    }

    public function getUsersCountAttribute() {
          // if relation is not loaded already, let's do it first
          if ( ! array_key_exists('users_count', $this->relations)) 
            $this->load('users_count');
         
          $related = $this->getRelation('users_count');
         
          // then return the count directly
          if (($related)&&(isset($related[0]))) return (int) $related[0]->users_count;
          else return 0;
    }

}
