<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class CsvSources extends Model {
    public $primaryKey = 'id';
    protected $table = 'csv_sources';

    protected $fillable = ['id', 'key', 'name', 'deleted', 'created_at', 'updated_at'];

}
