<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class Files extends Model {

    public $primaryKey = 'id';

    protected $table = 'files';
    
	 
    public function scopeWithUserVoter($query) {

        $query->join('users', 'users.id', '=', 'files.user_create_id')
		->join('voters', 'voters.id', '=', 'users.voter_id');
    }
	 
   

}
