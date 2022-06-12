<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ShasBankDetails extends Model {
    public $primaryKey = 'id';

    protected $table = 'shas_bank_details';

    public function scopeWithBankBranch ( $query ) {
        $query->leftJoin( 'bank_branches','bank_branches.id','=','shas_bank_details.bank_branch_id')
              ->leftJoin('banks','banks.id','=','bank_branches.bank_id');
    }


}