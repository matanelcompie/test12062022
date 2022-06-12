<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property integer $csv_source_id
 * @property integer $data_bring_voter_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class ManualVoterUpdates extends Model {
    public $primaryKey = 'id';
    protected $table = 'manual_voter_updates';
}