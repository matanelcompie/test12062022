<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model of add csv file for all situation
 * @property integer $id
 * @property string $file_name
 * @property integer $row_count
 * @property integer $current_row
 * @property integer $header
 * @property boolean $status
 * @property string $created_at
 * @property string $updated_at
 */
class CsvDocumentTheme extends Model
{
    public $primaryKey = 'id';
    protected $table = 'csv_document_theme';

    protected $fillable = [
        'id', 'name'
    ];
}
