<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsProvider extends Model {

    public $primaryKey = 'id';
    protected $table = 'sms_providers';
}