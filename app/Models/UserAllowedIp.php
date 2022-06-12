<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property boolean $active
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class UserAllowedIp extends Model {

    public $primaryKey = 'id';

    protected $table = 'user_allowed_ips';
}
