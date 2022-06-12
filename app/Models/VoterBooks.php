<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterBooks extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_books';

    public function scopeWithUser ( $query ) {
        $query->join('users', 'users.id', '=', 'voter_books.user_create_id')
            ->join('voters', 'voters.id', '=', 'users.voter_id');
    }
}