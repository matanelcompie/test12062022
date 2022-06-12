<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $callbiz_id
 * @property integer $user_create_id
 * @property string  $date
 * @property string  $details
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class CrmRequestCallBiz extends Model {

    public $primaryKey = 'id';

    protected $table = 'request_callbiz';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'callbiz_id',
                            'user_create_id',
                            'request_id',
                            'date',
                            'details',
                            'deleted',
                            'created_at',
                            'updated_at' ];

    public function scopeWithRequest ( $query ) {

        $query->join( 'requests', 'request_callbiz.request_id', '=', 'requests.id' );
    }

    public function scopeWithUser ( $query ) {

        $query->join( 'users', 'request_callbiz.user_create_id', '=', 'users.id' )
              ->join( 'voters', 'voters.id', '=', 'users.voter_id' );
    }

}
