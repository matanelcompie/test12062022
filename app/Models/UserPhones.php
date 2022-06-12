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
class UserPhones extends Model {

    public $primaryKey = 'id';
    protected $table = 'user_phones';
	
	  public function scopeWithType ( $query ) 
	  {

        $query->join( 'phone_types', 'phone_types.id', '=', 'user_phones.phone_type_id' );
      }
	  
	  public function scopeWithUser ( $query ) 
	  {

        $query->join( 'users',  'users.id' , '=' ,  'user_phones.user_id' );
      }


}
