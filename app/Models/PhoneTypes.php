<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $team_id
 * @property integer $user_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class PhoneTypes extends Model {

    public $primaryKey = 'id';
    protected $table = 'phone_types';
	
 

}
