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
class VoterTitle extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_titles';

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'deleted', 'created_at', 'updated_at'];

}
