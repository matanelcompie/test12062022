<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property integer $institute_group_id
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class InstituteTypes extends Model {

    public $primaryKey = 'id';
    protected $table = 'institute_types';

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'institute_group_id', 'deleted', 'created_at', 'updated_at'];

    public function scopeWithGroups( $query ) {
        $query->join('institute_groups', 'institute_groups.id', 'institute_types.institute_group_id');
    }
}