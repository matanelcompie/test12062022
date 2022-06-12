<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;
use Predis\Collection\Iterator;
use Predis;


/**
 * @property integer $id
 * @property string  $key
 * @property integer $voter_id
 * @property string  $password
 * @property string  $password_date
 * @property integer $permission_group_id
 * @property string  $remember_token
 * @property integer $user_create_id
 * @property integer $team_department_id
 * @property integer $work_city_id
 * @property string  $work_neighborhood
 * @property string  $work_street
 * @property integer $work_house
 * @property string  $work_house_entry
 * @property string  $work_flat
 * @property string  $email
 * @property boolean $active
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class User extends Authenticatable {

    use Notifiable;

    public $primaryKey = 'id';
    protected $table = 'users';

    /**
     * @var array
     */
    protected $fillable = ['key',
        'voter_id',
        'password',
        'password_date',
        'permission_group_id',
        'remember_token',
        'user_create_id',
        'team_department_id',
        'work_city_id',
        'work_neighborhood',
        'work_street',
        'work_house',
        'work_house_entry',
        'work_flat',
        'email',
        'active',
        'deleted',
        'created_at',
        'updated_at'];

    public function metadata() {

        return $this->hasOne('App\Models\Voters', 'id', 'voter_id');
    }

    public function departments() {

        return $this->hasOne('App\Models\TeamDepartments', 'id', 'team_department_id');
    }
	
	public function currentCallingVoter() {

        return $this->hasOne('App\Models\Tm\Call', 'user_id', 'id');
    }
	
	public function calls() {

        return $this->hasMany('App\Models\Tm\Call', 'user_id', 'id');
    }

    public function scopeWithMetadata($query) {

        $query->join('voters', 'users.voter_id', '=', 'voters.id')/* = */
                ->addSelect('last_name AS F_N')->addSelect('first_name AS P_N');
    }

    public function scopeWithVoter($query) {

        $query->join('voters', 'voters.id', '=', 'users.voter_id');
    }


    public function scopeWithElectionRoleByVoter($query, $currentCampaignId, $roleId) {

        $query
        ->join('election_roles_by_voters' , function($joinOn) use($currentCampaignId, $roleId) {
            $joinOn->on('election_roles_by_voters.voter_id' , '=','users.voter_id')
                ->on('election_roles_by_voters.election_campaign_id' , '=', DB::raw($currentCampaignId))
                ->on('election_roles_by_voters.election_role_id' , '=', DB::raw($roleId));
         })
         ->join('activists_allocations_assignments','activists_allocations_assignments.election_role_by_voter_id','=','election_roles_by_voters.id')
         ->join('activists_allocations','activists_allocations.id','=','activists_allocations_assignments.activist_allocation_id');
    
    }

    public function voter() {

        return $this->hasOne('App\Models\Voters', 'id', 'voter_id');
    }

    public function permissionGroup() {

        return $this->hasOne('App\Models\PermissionGroup', 'id', 'permission_group_id');
    }

    public function rolesByUsers() {
        return $this->hasMany('App\Models\RolesByUsers', 'user_id', 'id');
    }

    public function phones() {
        return $this->hasMany('App\Models\UserPhones', 'user_id', 'id');
    }

    public function roles() {
        return $this->belongsToMany('App\Models\UserRoles', 'roles_by_users', 'user_id', 'user_role_id');
    }
    public function campaigns() {
        return $this->belongsToMany('App\Models\Tm\Campaign', 'users_in_campaigns', 'user_id', 'campaign_id')
        ->wherePivot('deleted', 0);
    }
    public function campaignBreakTimes() {
        return $this->hasMany('App\Models\Tm\CampaignBreakTimes', 'id', 'user_id');
    }
	
	public function scopeWithUsersInCampaigns($query, $campaignId = null){
        if(!$campaignId){
            $query->join('users_in_campaigns' , 'users_in_campaigns.user_id','=','users.id');
        }else{
            $query->join('users_in_campaigns' , function ($joinOn) use($campaignId){
                $joinOn->on('users_in_campaigns.campaign_id', DB::raw($campaignId))
                ->on('users_in_campaigns.user_id','=','users.id');
            });
        }
	}
    /* Quick fix to get permissions from user because eloquent doesn't have hasManyThroughMany */

    public function permissions() {

        $userId = $this->getKey();
        $query = $this->newQuery();

        return $query->select('permissions.operation_name')
                        ->join('roles_by_users', 'roles_by_users.user_id', '=', 'users.id')
                        ->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
                        ->join('permissions_in_user_roles', 'permissions_in_user_roles.user_role_id', '=', 'user_roles.id')
                        ->join('permissions', 'permissions.id', '=', 'permissions_in_user_roles.permission_id')
                        ->where('users.id', $userId)
                        ->where('roles_by_users.deleted', DB::raw(0))
                        ->where(function ($query) {
                            $query->whereNull('from_date')
                            ->orWhere('from_date', '<=', Carbon::now());
                        })->where(function ($query1) {
                            $query1->whereNull('to_date')->orWhere('to_date', '>=', Carbon::now()->addDays(-1));
                        })->groupBy('permissions.id')
                        ->orderBy('permissions.operation_name')->get();
    }

    public function scopeWithSlimMetadata($query) {

        $query->join('voters', function ( $joinOn ) {

            $joinOn->on('users.voter_id', '=', 'voters.id')/* = */
                    ->on('users.deleted', '=', DB::raw(0))/* = */
                    ->on('users.active', '=', DB::raw(1));
        });
    }

    public function scopeWithMainRole($query , $leftJoin=false) {
		if($leftJoin){
			$query->leftjoin('roles_by_users', 'users.id', '=', 'roles_by_users.user_id')
                ->leftjoin('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
                ->leftjoin('teams', 'teams.id', '=', 'roles_by_users.team_id')
				->where(function($qr){$qr->whereNull('roles_by_users.main')->orWhere('roles_by_users.main', 1);});
		}
		else{
			$query->join('roles_by_users', 'users.id', '=', 'roles_by_users.user_id')
                ->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
                ->join('teams', 'teams.id', '=', 'roles_by_users.team_id')->where('roles_by_users.main', 1);
		}
        
    }

    public function geographicFilters() {
        $userId = $this->getKey();
        $query = $this->newQuery();

        return $query->select('geographic_filters.key', 'geographic_filters.name', 'geographic_filters.entity_type', 'geographic_filters.entity_id')
                        ->join('roles_by_users', 'roles_by_users.user_id', '=', 'users.id')
                        ->join('geographic_filters', 'geographic_filters.role_by_user_id', '=', 'roles_by_users.user_role_id')
                        ->where('users.id', $userId)
                        ->get();
    }

    public function geographicInheritedOnlyFilters() {
        $userId = $this->getKey();
        $query = $this->newQuery();

        return $query->select('geographic_filters.key', 'geographic_filters.name', 'geographic_filters.entity_type', 'geographic_filters.entity_id')
                        ->join('roles_by_users', 'roles_by_users.user_id', '=', 'users.id')
                        ->join('geographic_filters', 'geographic_filters.role_by_user_id', '=', 'roles_by_users.id')
                        ->where('users.id', '=', $userId)
                        ->where(function($query) {
                         $query->where('geographic_filters.inherited_id', '>=', '0')
                            ->orWhereRaw(" (geographic_filters.inherited_id is NULL and not exists (select id from geographic_filters  as g1 where g1.inherited_id = geographic_filters.id)) ");
                        })
                        ->get();
    }

    public function sectorialFilterNames() {
        $userId = $this->getKey();
        $query = $this->newQuery();

        return $query->select('sectorial_filters.name')
                        ->leftJoin('roles_by_users', 'roles_by_users.user_id', '=', 'users.id')
                        ->leftJoin('sectorial_filters', 'sectorial_filters.role_by_user_id', '=', 'roles_by_users.user_role_id')
                        ->where('users.id', $userId)
                        ->get();
    }

    public function sectorialFilters() {
        $userId = $this->getKey();
        $query = $this->newQuery();
        $sectorialFilters = sectorialFilters::select('sectorial_filters.*')->with(['sectorialFilterItems' => function($query) {
                                $query->select(
                                        'sectorial_filter_items.*', 'sectorial_filter_definitions.model', 'sectorial_filter_definitions.type', 'sectorial_filter_definitions.multiselect', 'sectorial_filter_definitions.join', 'sectorial_filter_definitions.constrains', 'sectorial_filter_definitions.where_type', 'sectorial_filter_definitions.field')->where('entity_type', 0)->withSectorialFilterDefs();
                            },
                            'sectorialFilterItems.values'])->join('roles_by_users', 'roles_by_users.id', '=', 'sectorial_filters.role_by_user_id')
                        ->where('roles_by_users.user_id', $userId)->where('roles_by_users.deleted', 0)->get();
        return $sectorialFilters;
    }

    public function scopeWithRolesAndTeams($query, $checkDate = false) {

        $query->join('roles_by_users', function ( $joinOn ) use ($checkDate) {
                    $joinOn->on('users.id', '=', 'roles_by_users.user_id')
                    ->on('users.deleted', '=', DB::raw(0))
                    ->on('users.active', '=', DB::raw(1))
                    ->on(function ($query) {
                        $query->whereNull('from_date')
                        ->orWhere('from_date', '<=', Carbon::now());
                    })->on(function ($query1) {
                        $query1->whereNull('to_date')->orWhere('to_date', '>=', Carbon::now()->addDays(-1));
                    })
                    ->where('roles_by_users.deleted', '=', DB::raw(0));
                })
                ->join('teams', function ( $joinOn ) {
                    $joinOn->on('teams.id', '=', 'roles_by_users.team_id')
                    ->on('teams.deleted', '=', DB::raw(0));
                });
    }

    public function scopeWithRequestsTopics($query, $withParent = false){
        $query->leftJoin('request_topics_by_users', 'request_topics_by_users.user_handler_id', 'users.id')
        ->leftJoin('request_topics', 'request_topics.id', 'request_topics_by_users.request_topic_id')
        ->leftJoin('request_topics as request_topic_parent', 'request_topic_parent.id', 'request_topics.parent_id');
    }

    public function lastViewedVoters() {
        return $this->hasMany('App\Models\LastViewedVoter', 'user_id');
    }

    /**
    *   Get online users IDs from redis
    **/
    public static function getOnlineUsersIds() {
        $userIds = array();
        $pointer = null;
        $redis = Redis::connection('session');
		 
        foreach (new Iterator\Keyspace($redis) as $key) {
           $user = unserialize(unserialize($redis->get($key)));
           foreach($user as $key => $value) {
            if (substr($key, 0, 6) === "login_") $userIds[] = $value;
           }

        }  
        return $userIds;
    }

    public function languages() {
        return $this->hasMany('App\Models\LanguagesByUsers', 'user_id', 'id');
    }

    public function userAllowedIps() {
        return $this->hasMany('App\Models\UserAllowedIp', 'user_id', 'id');
    }

}
