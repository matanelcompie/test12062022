<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $type_id
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class RequestStatus extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_status';

    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'type_id',
                            'order',
                            'deleted',
                            'created_at',
                            'updated_at' ];

    public function scopeWithStatusType ( $query ) {

        $query->leftJoin( 'request_status_type', 'request_status.type_id', '=', 'request_status_type.id' )/*=*/
              ->where( [ 'request_status.deleted'      => '0',
                         'request_status_type.deleted' => '0', ] );
    }

}

