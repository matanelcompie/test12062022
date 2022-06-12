<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class BudgetFiles extends Model {

    public $primaryKey = 'id';
    protected $table = 'budget_files';

    public function scopeWithUser ( $query ) {
        $query->join('users', 'users.id', '=', 'budget_files.user_create_id')
            ->join('voters', 'voters.id', '=', 'users.voter_id');
    }
}