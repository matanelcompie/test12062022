<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $module_id
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class CrmRequestPriority extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_priority';

    /**
     * @var array
     */
    protected $fillable = [ 'module_id',
                            'name',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
