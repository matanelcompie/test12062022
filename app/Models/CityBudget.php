<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CityBudget extends Model {

    public $primaryKey = 'id';
    protected $table = 'city_budget';

 
    
    public function ongoingActivityExpenses() {
        return $this->hasMany( 'App\Models\CityBudgetOngoingActivityExpenses' ,  'city_budget_id' , 'id');
    }

    public function budgetExpectedExpenses() {
        return $this->hasOne( 'App\Models\CityBudgetActivistExpectedExpenses' ,  'city_budget_id' , 'id');
    }
    public function scopeWithElectionRoles($query){
        $query->leftJoin('election_roles as election_roles', function ($query) {
            $query->on('election_roles.system_name', 'city_budget.system_name' )->where('election_roles.deleted',0);
        });
    }
    public function scopeWithElectionRolesBaseBudget($query){
        $query->leftJoin('election_roles_base_budget as election_budget', function ($query) {
            $query->on('election_budget.election_role_id','election_roles.id' )->where('election_budget.deleted',0);
        });
    }

    public function scopeWithCityBudgetActivistExpectedExpenses($query) {
        $query->join('city_budget_activist_expected_expenses', 'city_budget_activist_expected_expenses.city_budget_id', '=', 'city_budget.id');
    }
}
