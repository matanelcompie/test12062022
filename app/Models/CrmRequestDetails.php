<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $request_id
 * @property string  $date
 * @property integer $user_id
 * @property string  $details
 * @property string  $created_at
 * @property string  $updated_at
 */
class CrmRequestDetails extends Model {

    public $primaryKey = 'id';
    protected $table = 'request_details';

    /**
     * @var array
     */
    protected $fillable = [ 'request_id',
                            'date',
                            'user_id',
                            'details',
                            'created_at',
                            'updated_at' ];

}
