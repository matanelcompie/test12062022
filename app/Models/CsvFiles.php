<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property string $file_name
 * @property integer $row_count
 * @property integer $current_row
 * @property integer $header
 * @property boolean $status
 * @property integer $error_type
 * @property integer $process_id
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class CsvFiles extends Model {
    public $primaryKey = 'id';
    protected $table = 'csv_files';

    protected $fillable = ['id', 'key', 'name', 'file_name', 'row_count', 'current_row', 'header', 'status', 'error_type',
                           'process_id', 'deleted', 'created_at', 'updated_at'];

    public function scopeWithSupportStatus ( $query ) {
        $query->leftJoin('support_status', 'support_status.id', '=', 'csv_files.support_status_id');
    }

    public function scopeWithUser ( $query ) {
        $query->join('users', 'users.id', '=', 'csv_files.user_create_id')
              ->join('voters', 'voters.id', '=', 'users.voter_id');
    }

    public function scopeWithInstitutes ( $query ) {
        $query->leftJoin('institutes', 'institutes.id', '=', 'csv_files.institute_id');
    }

    public function scopeWithInstitutesRoles ( $query ) {
        $query->leftJoin('institute_roles', 'institute_roles.id', '=', 'csv_files.institute_role_id');
    }

    public function fields() {
        return $this->hasMany('App\Models\CsvFileFields', 'csv_file_id', 'id');
    }

}
