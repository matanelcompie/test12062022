<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class IncomingIvr extends Model {

    public $primaryKey = 'id';
    protected $table = 'incoming_ivr';
}