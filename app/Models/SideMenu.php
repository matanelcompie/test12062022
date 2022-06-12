<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SideMenu extends Model {

    public $primaryKey = 'id';
    protected $table = 'side_menus';

    public function scopeWithPermissionName($query) {
    	$query->join('permissions', 'permissions.id', '=', 'side_menus.permission_id')->addSelect('permissions.operation_name AS permission_name');
    }
}