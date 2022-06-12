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
class DocumentTypes extends Model {
    public $primaryKey = 'id';

    protected $table = 'document_types';

    protected $fillable = [
        'key',
        'name',
        'deleted',
        'created_at',
        'updated_at'
    ];
}