<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $budget
 * @property integer $election_role_id
 * @property integer $election_role_shift_id
 * @property integer $election_campaign_id
 * @property string  $key
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ElectionRolesShiftsBudgets extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_role_shifts_budget';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'budget',
                            'election_role_id',
                            'election_role_shift_id',
                            'election_campaign_id',
                            'deleted',
                            'created_at',
                            'updated_at' ];
	
    public function scopeWithElectionRoles ( $query, $innerJoin = true ) {
        $joinMethod = $innerJoin ? 'join' : 'leftJoin';
        $query->$joinMethod( 'election_roles', 'election_roles.id', '=', 'election_role_shifts_budget.election_role_id' );
    }
    public function scopeWithElectionRoleShifts ( $query, $innerJoin = true ) {
        $joinMethod = $innerJoin ? 'join' : 'leftJoin';
        $query->$joinMethod( 'election_role_shifts', 'election_role_shifts.id', 'election_role_shifts_budget.election_role_shift_id');
    }
}