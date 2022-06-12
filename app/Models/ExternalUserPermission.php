<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ExternalUserPermission extends Model {

    public $primaryKey = 'id';
    protected $table = 'external_user_permissions';
    
}