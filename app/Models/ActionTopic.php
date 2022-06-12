<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property boolean $active
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActionTopic extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_topics';

    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'action_type_id',
                            'name',
                            'system_name',
                            'active',
                            'deleted',
                            'created_at',
                            'updated_at' ];

    public function scopeWithType ( $query ) {

        $query->join( 'action_types', 'action_topics.action_type_id', '=', 'action_types.id' );
    }

}
