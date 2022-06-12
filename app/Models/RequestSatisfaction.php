<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestSatisfaction extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_satisfaction';

        /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',                            
                            'deleted',
                            'created_at',
                            'updated_at' ];

}
