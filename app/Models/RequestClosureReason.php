<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestClosureReason extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_closure_reason';

        /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',                            
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
