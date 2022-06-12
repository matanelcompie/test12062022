<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesBaseBudget;
use App\Models\GeographicFilterTemplates;
use App\Models\ElectionRolesGeographical;
use App\Repositories\ElectionRolesBaseBudgetRepository;
use App\Repositories\ElectionRoleShiftsBudgetRepository;
use Illuminate\Support\Facades\DB;

class ElectionRoleController extends Controller
{
    static function getAllElectionRoleBudget()
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $electionRoleBudget = ElectionRolesBaseBudgetRepository::getAllElectionRoleBaseBudget();
            $jsonOutput->setData($electionRoleBudget);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    static function getAllElectionRoleShiftsBudget()
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $electionRoleShiftBudget = ElectionRoleShiftsBudgetRepository::getAllElectionRoleShiftBudget();
            $jsonOutput->setData($electionRoleShiftBudget);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
