<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class FileGroups extends Model {

    public $primaryKey = 'id';

    public $table = 'file_groups';
	
	public function modules()
    {
        return $this->belongsToMany('App\Models\Modules' , 'modules_in_file_groups' , 'file_group_id' , 'module_id');
    }
	
	public function files() {
        return $this->hasMany('App\Models\Files', 'file_group_id', 'id');
    }
}
