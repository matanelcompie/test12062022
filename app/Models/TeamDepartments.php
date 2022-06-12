<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $team_id
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class TeamDepartments extends Model {

    public $primaryKey = 'id';

    protected $table = 'team_departments';

    /**
     * @var array
     */
    protected $fillable = [ 'team_id',
                            'name',
                            'deleted',
                            'created_at',
                            'updated_at' ];
}
