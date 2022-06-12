<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
class RequestTopicUsers extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_topics_by_users';
}
