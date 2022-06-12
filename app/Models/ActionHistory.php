<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $user_create_id
 * @property integer $action_history_topic_id
 * @property integer $action_history_sub_topic_id
 * @property string  $referenced_model
 * @property integer $referenced_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActionHistory extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_history';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'user_create_id',
                            'action_history_topic_id',
                            'action_history_sub_topic_id',
                            'referenced_model',
                            'referenced_id',
                            'created_at',
                            'updated_at' ];
							
    public function scopeWithRequest ( $query ) {

        $query->join( 'requests', 'action_history.referenced_id', '=', 'requests.id' );
    }
		
    public function scopeWithUser ( $query ) {
        $query->join( 'users', 'action_history.user_create_id', '=', 'users.id' )
		->join( 'voters', 'voters.id', '=', 'users.voter_id' );
    }
	 public function scopeWithHistoryUser ( $query ) {
        $query->join( 'history', 'action_history.history_id', '=', 'history.id' );
        $query->join( 'users', 'history.user_create_id', '=', 'users.id' )
		->join( 'voters', 'voters.id', '=', 'users.voter_id' );
    }

    public function scopeWithHistoryDetails ( $query ) {
        $query->leftJoin( 'action_history_details', 'action_history.id', '=', 'action_history_details.action_history_id' );
    }
	
	public function details() {
        return $this->hasMany('App\Models\ActionHistoryDetails', 'action_history_id', 'id');
    }

}
