<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserVoterActivities extends Model {

    public $primaryKey = 'id';
    protected $table = 'user_voter_activities';
}
