<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class VoterFilter extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_filters';
	
	public static $snakeAttributes = false; //disable converting camel case relations to snake_case
 
    public function answeredQuestsCallsCountTotal()
    {
        return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
    }
	
	public function outOfQueueCallsToday(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
	
	public function outOfQueueCallsLastHour(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
	
	public function outOfQueueCallsTotal(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
	
	public function callLaterCallsToday(){
		 return $this->hasMany('App\Models\RedialVoterPhone', 'portion_id', 'id');
	}
	
	public function callLaterCallsLastHour(){
		 return $this->hasMany('App\Models\RedialVoterPhone', 'portion_id', 'id');
	}
	
	public function callLaterCallsTotal(){
		 return $this->hasMany('App\Models\RedialVoterPhone', 'portion_id', 'id');
	}
	
	
 	public function FinishedCallsTotal(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
		
 	public function FinishedCallsToday(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
	
	public function FinishedCallsLastHour(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
	
  	public function answeredQuestsCallsCountHandleTime(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
 
  	public function answeredQuestsCallsCountToday(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
  
  	public function answeredQuestsCallsCountHour(){
		 return $this->hasMany('App\Models\Tm\Call', 'portion_id', 'id');
	}
 
}
