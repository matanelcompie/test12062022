<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property boolean $entity_type
 * @property integer $entity_id
 * @property integer $action_type
 * @property integer $action_topic_id
 * @property integer $conversation_direction
 * @property string  $conversation_with_other
 * @property string  $action_date
 * @property string  $description
 * @property integer $user_create_id
 * @property integer $action_status_id
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class Message extends Model {

    public $primaryKey = 'id';

    protected $table = 'messages';
 
 


    /**
     * This query gets the request handler of the message
     *
     * @param $query
     */
    public function scopeWithRequest ( $query ) {

        $query->join( 'requests', 'requests.id', '=', 'messages.entity_id' );
    }


	 /**
     * This query gets the request voter of the message
     *
     * @param $query
     */
    public function scopeWithVoter ( $query ) {

        $query->join( 'voters', 'voters.id', '=', 'messages.entity_id' );
    }


    /**
     * This query gets the message of role voter
     *
     * @param $query
     */
    public function scopeWithRoleVoter($query)
    {
        $query->join('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'messages.entity_id');
    }
}
