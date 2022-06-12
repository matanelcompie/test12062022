<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestSource extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_source';

        /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'system_name',
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
