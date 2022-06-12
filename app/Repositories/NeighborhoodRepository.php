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
use App\Models\Area;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Neighborhood;
use App\Models\SubArea;
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

class NeighborhoodRepository
{
    public static function getById($id)
    {
        $neighborhood = Neighborhood::select()->where('id', $id)->first();
        if (!$neighborhood)
            throw new Exception(config('errors.global.NEIGHBORHOOD_NOT_EXISTS'));
        return $neighborhood;
    }

    public static function getByCityId($cityId)
    {
        return  Neighborhood::select('id', 'key', 'name')
        ->where('city_id', $cityId)
            ->where('deleted', 0)->get();
    }
}
