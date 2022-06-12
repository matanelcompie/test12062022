<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $election_role_id
 * @property integer $city_id
 * @property integer $budget
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
// This model "ElectionRolesBaseBudget" now not in use!!!

class ElectionRolesBaseBudget extends Model {
    public $primaryKey = 'id';
    protected $table = 'election_roles_base_budget';
    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'election_role_id',
        'city_id',
        'budget',
        'deleted',
        'created_at',
        'updated_at' ];

}