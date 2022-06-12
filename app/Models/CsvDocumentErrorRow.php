<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model of error row in csv document model

 */
class CsvDocumentErrorRow extends Model
{
    public $primaryKey = 'id';
    protected $table = 'csv_document_error_row';

    protected $fillable = ['id', 'csv_document_id', 'row_index', 'col_index', 'error_type', 'name_field_error', 'error_message'];
}
