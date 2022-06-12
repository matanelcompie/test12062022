<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LanguagesByUsers extends Model {

    public $primaryKey = 'id';
    protected $table = 'languages_by_users';
}
