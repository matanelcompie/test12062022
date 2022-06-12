<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class BankBranches extends Model {
    public $primaryKey = 'id';

    protected $table = 'bank_branches';
}