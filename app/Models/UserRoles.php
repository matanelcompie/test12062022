<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserRoles extends Model {

    public $primaryKey = 'id';
    protected $table = 'user_roles';

    protected $hidden = array('pivot');

    public function scopeWithModules ( $query ) {

        $query->leftJoin( 'modules', function ( $joinOn ) {

            $joinOn->on( [ [ 'user_roles.module_id',
                             '=',
                             'modules.id' ],
                           [ 'user_roles.deleted',
                             '=',
                             DB::raw( 0 ) ] ] );
        } );
    }
	public function permissions() {
		return $this->belongsToMany('App\Models\Permission', 'permissions_in_user_roles', 'user_role_id', 'permission_id');
	}

    public static function getUserRoleBySystemName($role_system_name){
        $userRole = UserRoles::where('system_name', $role_system_name)->first();

        return $userRole->id;
    }
}
