<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $parent_id
 * @property boolean $active
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActionHistoryTopic extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_history_topics';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'parent_id',
                            'active',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
