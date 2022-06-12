<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ElectionRolesByVotersMessages extends Model {
    public $primaryKey = 'id';

    protected $table = 'election_role_by_voter_messages';
}