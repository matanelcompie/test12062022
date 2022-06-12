<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionGroup extends Model {

	public $primaryKey = 'id';
	protected $table = 'permission_groups';

	public function permissions() {
		return $this->belongsToMany('App\Models\Permission', 'permissions_in_group', 'group_id', 'permission_id');
	}

	public function users() {
		return $this->hasMany('App\Models\User', 'permission_group_id');
	}
}