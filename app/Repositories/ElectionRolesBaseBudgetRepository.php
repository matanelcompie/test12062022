<?php

namespace App\Repositories;

use App\Enums\VerifiedStatus;
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
use App\Models\ElectionRolesBaseBudget;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesByVotersMessages;
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

class ElectionRolesBaseBudgetRepository
{
    public static function getBaseBudgetByRoleIdAndCityId($electionRoleId, $cityId)
    {
        return ElectionRolesBaseBudget::select()
            ->where('election_role_id', $electionRoleId)
            ->where('city_id', $cityId)
            ->first();
    }

    public static function getAllElectionRoleBaseBudget()
    {
        return ElectionRolesBaseBudget::select()->get();
    }
}
