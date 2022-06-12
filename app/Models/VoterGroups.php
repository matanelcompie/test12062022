<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterGroups extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_groups';

    protected $hidden = ['pivot'];
	
	public function user() {
        return $this->hasOne('App\Models\User', 'id', 'user_create_id');
    }
	
	public function votersInGroups() {
        return $this->hasMany('App\Models\VotersInGroups', 'voter_group_id', 'id');
    }
	public function scopeWithVotersInGroups($query) {
        $query ->join('voters_in_groups', 'id', '=', 'voter_group_id');
    }
	
	public function voterGroupPermissions() {
        return $this->hasMany('App\Models\VoterGroupPermissions', 'voter_group_id', 'id');
    }
}