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
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Streets;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\VotersRepository as RepositoriesVotersRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class StreetRepository
{
  public static function getByCityId($cityId)
  {
    return Streets::select()->where('city_id', $cityId)->get();
  }

  public static function getNameStreetListByCityId($cityId)
  {
    return Streets::select(['id', 'name'])->where('city_id', $cityId)->get();
  }

  public static function getStreetByCityIdAndName(int $cityId, string $streetName)
  {
    return Streets::select(['id', 'name'])->where('city_id', $cityId)->where('name', $streetName)->first();
  }
}
