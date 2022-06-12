<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterVotes extends Model {

    public $primaryKey = 'id';
    protected $table = 'votes';
}