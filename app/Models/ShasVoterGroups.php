<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/*
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $parent_id
 * @property boolean $deleted
 * @property integer $created_at
 * @property integer $updated_at
 */


class ShasVoterGroups extends Model {

    public $primaryKey = 'id';

    protected $table = 'voter_groups';
}