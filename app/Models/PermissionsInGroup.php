<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionsInGroup extends Model {

	public $primaryKey = 'id';
	protected $table = 'permissions_in_group';

	public function scopeWithPermissions ( $query ) {

        $query->join( 'permissions', 'permissions_in_group.permission_id', '=', 'permissions.id' );
    }
 
}