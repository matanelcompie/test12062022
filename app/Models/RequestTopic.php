<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
/**
 * @property integer id
 * @property string key
 * @property string name
 * @property integer topic_order
 * @property integer parent_id
 * @property integer active
 * @property integer deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class RequestTopic extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_topics';

    public function scopeWithRequestStatus($query) {
        $query->leftJoin('request_status', 'request_topics.default_request_status_id', '=', 'request_status.id');
    }
    public function scopeWithUserTeamHandler ( $query, $cityId = null ) {
        $query->leftJoin('request_topics_by_users', function ($q) use ($cityId){
            $q->on('request_topics_by_users.request_topic_id', '=', 'request_topics.id');
            if($cityId){ $q->on('request_topics_by_users.city_id', '=', DB::raw($cityId)); }
        } )
        ->leftJoin('users AS user_handler', 'user_handler.id', '=', 'request_topics_by_users.user_handler_id' )
        ->leftJoin('voters as user_handler_voter', 'user_handler_voter.id', 'user_handler.voter_id')
        ->leftJoin('teams AS team_handler', 'team_handler.id', '=', 'request_topics_by_users.team_handler_id');
    }
}
