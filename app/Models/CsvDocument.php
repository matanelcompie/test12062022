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
class CsvDocument extends Model
{
    public $primaryKey = 'id';
    protected $table = 'csv_document';

    protected $fillable = [
        'id','key', 'type', 'file_name', 'file_size', 'row_count', 'header', 'status', 'location_file', 'user_create_id',
        'created_at', 'updated_at'
    ];

    public function scopeWithUserCreator($query)
    {
        $query->join('users', 'users.id', '=', 'csv_document.user_create_id')
            ->join('voters', 'voters.id', '=', 'users.voter_id');
    }

    public function scopeWithFileTheme($query)
    {
        $query->join('csv_document_theme', 'csv_document_theme.id', '=', 'csv_document.file_theme_id');
    }

    public function errorRows()
    {
        return $this->hasMany('App\Models\CsvDocumentErrorRow', 'csv_document_id', 'id');
    }
}
