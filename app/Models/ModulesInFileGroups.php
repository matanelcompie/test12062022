<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class ModulesInFileGroups extends Model {

    public $primaryKey = 'id';

    protected $table = 'modules_in_file_groups';
    
	/*
    public function subArea() {
        return $this->hasMany('App\Models\SubArea');
    }
	*/
   

}
