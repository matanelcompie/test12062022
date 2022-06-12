<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionsInUserRole extends Model {

	public $primaryKey = 'id';
	protected $table = 'permissions_in_user_roles';

	public function scopeWithPermissions ( $query ) {

        $query->join( 'permissions', 'permissions_in_user_roles.permission_id', '=', 'permissions.id' );
    }
 
}