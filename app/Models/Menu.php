<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model {

    public $primaryKey = 'id';
    protected $table = 'menus';

    public function subMenus () {

        return $this->hasMany( 'App\Models\SubMenu' );
    }
}