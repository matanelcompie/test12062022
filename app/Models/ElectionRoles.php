<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class ElectionRoles extends Model
{

  public $primaryKey = 'id';
  protected $table = 'election_roles';
  //example system role name
  //config('constants.activists.election_role_system_names.captain_of_fifty');


  /**
   * @var array
   */
  protected $fillable = [
    'key',
    'name',
    'deleted',
    'created_at',
    'updated_at'
  ];

  public static function getIdBySystemName($role)
  {

    $ElectionRoles = ElectionRoles::select('id')->where('system_name', $role)->first();
    return  $ElectionRoles->id;
  }

  public static function getSystemNameById($id)
  {
    $ElectionRoles = ElectionRoles::select('system_name')->where('id', $id)->first();
    return  $ElectionRoles->system_name;
  }
  
}
