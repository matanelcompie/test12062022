<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */

class BallotBoxRoles extends Model {

    public $primaryKey = 'id';
    protected $table = 'ballot_box_roles';
}