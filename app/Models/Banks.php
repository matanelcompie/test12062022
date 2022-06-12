<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Banks extends Model {
    public $primaryKey = 'id';

    protected $table = 'banks';

    public function branches() {
        return $this->hasMany( BankBranches::class ,  'bank_id' , 'id');
    }
}