<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ExternalUserToken extends Model {

    public $primaryKey = 'id';
    protected $table = 'external_user_tokens';
    
}