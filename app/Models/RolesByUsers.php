<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolesByUsers extends Model {

    public $primaryKey = 'id';
    protected $table = 'roles_by_users';

    protected $fillable = [
        'user_role_id',
        'team_id',
        'team_department_id',
        'from_date',
        'to_date',
        'main',
        'campaign_id',
    ];

    public function scopeWithTeam($query) {
        $query->leftJoin('teams', function ( $joinOn ) {
            $joinOn->on('roles_by_users.team_id', '=', 'teams.id');
        });
    }

    public function scopeWithTeamMates($query) {
        $query->leftJoin('users', function ( $joinOn ) {
            $joinOn->on('roles_by_users.user_id', '=', 'users.id');
        })->leftJoin('voters', function ( $joinOn ) {
            $joinOn->on('users.voter_id', '=', 'voters.id');
        })->leftJoin('teams', function ( $joinOn ) {
            $joinOn->on('roles_by_users.team_id', '=', 'teams.id');
        });
    }

    public function scopeWithExtraData($query) {

        $query->join('users', 'users.id', '=', 'roles_by_users.user_id')
                ->join('voters', 'voters.id', '=', 'users.voter_id')
                ->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
                ->leftJoin('team_departments', 'team_departments.id', '=', 'roles_by_users.team_department_id')
                ->where('users.deleted', 0);
    }

    public function scopeWithUser($query) {
        $query->leftJoin('users', function ( $joinOn ) {
            $joinOn->on('roles_by_users.user_id', '=', 'users.id');
        });
    }
	
	public function scopeWithUserRoleOnly($query){
		  $query->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id');
	}

	public function calls() {
        return $this->hasOne('App\Models\Tm\Call', 'user_id', 'user_id');
    }

}
