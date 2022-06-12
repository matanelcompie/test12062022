<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoteFiles extends Model {
    public $primaryKey = 'id';
    protected $table = 'vote_files';

    public function scopeWithUser ( $query ) {
        $query->join('users', 'users.id', '=', 'vote_files.user_create_id')
            ->join('voters', 'voters.id', '=', 'users.voter_id');
    }
}