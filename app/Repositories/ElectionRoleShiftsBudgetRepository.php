<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesShiftsBudgets;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ElectionRoleShiftsBudgetRepository
{
    public static function getShiftRoleBudget($electionRoleId, $electionRoleShiftId = null)
    {
        $campaign = ElectionCampaigns::currentCampaign();
        $defaultRoleBudget = ElectionRolesShiftsBudgets::select('budget')
            ->where(function ($query) use ($electionRoleShiftId) {
                $query->where('election_role_shift_id', $electionRoleShiftId)
                    ->orWhereNull('election_role_shift_id');
            })
            ->where('election_role_id', $electionRoleId)
            ->where('election_campaign_id', $campaign->id)
            ->where('deleted', DB::raw(0))
            ->first();

        return $defaultRoleBudget ? $defaultRoleBudget->budget : 0;
    }


    public static function getAllElectionRoleShiftBudget($electionCampaignKey = null)
    {
        if ($electionCampaignKey)
            $campaign = ElectionCampaignRepository::getByKey($electionCampaignKey);
        else
            $campaign = ElectionCampaigns::currentCampaign();

        return ElectionRolesShiftsBudgets::select(
            'election_role_shifts_budget.id',
            'election_role_shifts_budget.key',
            'election_role_shifts_budget.budget',
            'election_roles.id as election_role_id',
            'election_roles.system_name as election_role_system_name',
            'election_roles.name as election_role_name',
            'election_role_shifts.name as election_role_shift_name',
            'election_role_shifts.system_name as election_role_shift_system_name',
            'election_role_shifts.id as election_role_shift_id'
        )
            ->withElectionRoles()
            ->withElectionRoleShifts(false)
            ->where('election_role_shifts_budget.election_campaign_id', $campaign->id)
            ->where('election_role_shifts_budget.deleted', DB::raw(0))
            ->get();
    }
}
