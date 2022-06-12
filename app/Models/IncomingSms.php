<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class IncomingSms extends Model {

    public $primaryKey = 'id';
    protected $table = 'incoming_sms';
}