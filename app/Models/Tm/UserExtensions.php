<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property integer $user_id
 * @property string  $dialer_user_id
 * @property string  $password
 * @property string  $extension_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class UserExtensions extends Model {

    public $primaryKey = 'id';
    protected $table = 'user_extensions';

    protected $fillable = ['id', 'user_id,', 'dialer_user_id', 'password', 'extension_id', 'created_at', 'updated_at'];
}