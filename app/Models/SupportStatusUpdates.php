<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class SupportStatusUpdates extends Model {
    public $primaryKey = 'id';
    protected $table = 'support_status_updates';

    public function scopeWithUserCreate ( $query ) {
        $query->join('users as user_create', 'user_create.id', '=', 'support_status_updates.user_create_id')
            ->join('voters as voter_create', 'voter_create.id', '=', 'user_create.voter_id');
    }

    public function scopeWithUserExecuute ( $query ) {
        $query->join('users as user_execute', 'user_execute.id', '=', 'support_status_updates.user_execute_id')
            ->join('voters as voter_execute', 'voter_execute.id', '=', 'user_execute.voter_id');
    }
}