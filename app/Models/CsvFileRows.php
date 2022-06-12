<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property integer $csv_file_id
 * @property integer $row_number
 * @property integer $voter_id
 * @property integer $status
 * @property string $error_type
 * @property string $created_at
 * @property string $updated_at
 */

class CsvFileRows extends Model {
    public $primaryKey = 'id';
    protected $table = 'csv_file_rows';

    protected $fillable = ['id', 'key', 'csv_file_id', 'row_number', 'voter_id', 'status', 'error_type', 'created_at',
                           'updated_at'];
						   
						   
    public function scopeWithVoter ( $query ) {
        $query->join('voters', 'voters.id', '=', 'csv_file_rows.voter_id');
    }
}