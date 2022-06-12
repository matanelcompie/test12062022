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
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ElectionRoleShiftRepository
{
    public static function getShiftRoleByKey($key)
    {
        $shiftRole = ElectionRoleShifts::select()->where('key', $key)->first();
        if (!$shiftRole)
            throw new Exception(config('errors.elections.INVALID_SHIFT'));

        return $shiftRole;
    }

    public static function getShiftRoleById($id)
    {
        $shiftRole = ElectionRoleShifts::select()->where('id', $id)->first();
        if (!$shiftRole)
            throw new Exception(config('errors.elections.INVALID_SHIFT'));

        return $shiftRole;
    }

    public static function getShiftRoleBySystemName($systemName)
    {
        $shiftRole = ElectionRoleShifts::select()->where('system_name', $systemName)->first();
        if (!$shiftRole)
            throw new Exception(config('errors.elections.INVALID_SHIFT'));

        return $shiftRole;
    }
}
