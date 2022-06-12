<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmRequestTopic extends Model {

    public $primaryKey = 'id';

    protected $table = 'request_topics';

    public function requests () {

        return $this->hasMany( 'App\Models\CrmRequests', 'topic_id' );
    }

    public function scopeWithSubTopic ( $query ) {

        $query->leftJoin( 'request_topics AS request_sub_topics', 'request_topics.id', '=', 'request_sub_topics.parent_id' )/*=*/
              ->where( 'request_topics.parent_id', '0' )/*=*/
              ->where( 'request_topics.active', '1' )/*=*/
              ->where( 'request_topics.deleted', '0' )/*=*/
              ->where( 'request_sub_topics.id', '>', '0' )/*=*/
              ->where( 'request_sub_topics.active', '1' )/*=*/
              ->where( 'request_sub_topics.deleted', '0' );
        //->where( [ 'request_topics.parent_id'   => '0', 'request_topics.active'      => '1', 'request_topics.deleted'     => '0', /*'request_sub_topics.id > 0',*/ 'request_sub_topics.active'  => '1', 'request_sub_topics.deleted' => '0' ] );
    }

}
