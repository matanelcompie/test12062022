<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ElectionRoleShifts extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_role_shifts';

    
    public static function getObjectBySystemName($system_name,$onlyId=false){
        $electionRoleShifts=ElectionRoleShifts::select()->where('system_name',$system_name)->first();
        if($onlyId)
        return  $electionRoleShifts->id;
        return $electionRoleShifts;
    }
}