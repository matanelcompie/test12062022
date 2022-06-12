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
class ActionStatus extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_status';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'active',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
