<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class BallotBoxesFiles extends Model {
    public $primaryKey = 'id';
    protected $table = 'ballot_boxes_files';

    public function scopeWithUser ( $query ) {
        $query->join('users', 'users.id', '=', 'ballot_boxes_files.user_create_id')
            ->join('voters', 'voters.id', '=', 'users.voter_id');
    }
}