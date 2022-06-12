<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property integer $institute_type_id
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class InstituteRole extends Model {

    public $primaryKey = 'id';
    protected $table = 'institute_roles';

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'institute_type_id', 'deleted', 'created_at', 'updated_at'];
}
