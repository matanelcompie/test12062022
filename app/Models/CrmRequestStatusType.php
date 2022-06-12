<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class CrmRequestStatusType extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_status_type';

    /**
     * @var array
     */
    protected $fillable = [ 'name',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
