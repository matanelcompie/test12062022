<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFavorites extends Model {

    public $primaryKey = 'id';
    protected $table = 'user_favorites';
    protected $fillable = ['key', 'user_id', 'url', 'title', 'deleted'];

}
