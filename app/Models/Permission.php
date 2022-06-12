<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model {

	public $primaryKey = 'id';
	protected $table = 'permissions';

	protected $hidden = array('pivot');
}