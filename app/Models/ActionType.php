<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $entity_type
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActionType extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_types';

    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'entity_type',
                            'name',
                            'system_name',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
