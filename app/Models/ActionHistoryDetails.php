<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $action_history_id
 * @property string  $field_name
 * @property string  $old_value
 * @property string  $new_value
 * @property string  $created_at
 * @property string  $updated_at
 */
class ActionHistoryDetails extends Model {

    public $primaryKey = 'id';

    protected $table = 'action_history_details';

    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'action_history_id',
                            'field_name',
                            'old_value',
                            'new_value',
                            'created_at',
                            'updated_at' ];

}
