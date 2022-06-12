<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property integer $csv_file_id
 * @property integer $column_number
 * @property string $field_name
 * @property string $created_at
 * @property string $updated_at
 */

class CsvFileFields extends Model {
    public $primaryKey = 'id';
    protected $table = 'csv_file_fields';

    protected $fillable = ['id', 'key', 'csv_file_id', 'column_number', 'field_name', 'created_at', 'updated_at'];
}