<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CityBudgetActivistExpectedExpenses extends Model {

    public $primaryKey = 'id';
    protected $table = 'city_budget_activist_expected_expenses';
    public function ActionHistory() {
        return $this->hasMany( 'App\Models\ActionHistory' ,  'referenced_id' , 'id');
    }
}
