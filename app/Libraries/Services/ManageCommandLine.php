<?php

namespace App\Libraries\Services;

use App\Models\VoterFilter\VoterFilter;
use App\Models\VoterFilter\VoterFilterGroup;
use App\Models\Tm\Campaign;
use App\Models\User;

class ManageCommandLine
{

    public static $voter_id_run_command=7476327;

    public static function user(){
        $user=User::select()->where('voter_id',self::$voter_id_run_command)->first();
        return $user;
    }

}