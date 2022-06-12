<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiError extends Model {

    public $primaryKey = 'id';
    protected $table = 'api_errors';
}
