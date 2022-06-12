<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ExternalUser extends Model {

    public $primaryKey = 'id';
    protected $table = 'external_users';

    public function geographicInheritedOnlyFilters() {
        return array();
    }

    /**
     * Get user external user permissions
     *
     * @return void
     */
    public function permissions() {
    	return $this->belongsToMany('App\Models\ExternalUserPermission',
    								'external_user_permissions_by_external_users',
    								'external_user_id',
    								'external_user_permission_id');
    }

    public function tokens() {
        return $this->hasMany('App\Models\ExternalUserToken', 'external_user_id');
    }
}