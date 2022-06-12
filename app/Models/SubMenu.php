<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubMenu extends Model {

    public $primaryKey = 'id';
    protected $table = 'sub_menus';

    public function menu () {

        return $this->belongsTo( 'App\Modes\Menu', 'menu_id' );
    }
}