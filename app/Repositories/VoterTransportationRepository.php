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

class VoterTransportationRepository
{

    public static function getVoterTransportationByDriverInCampgain($voterDriverId, $electionCampaignId)
    {
        return VoterTransportation::select(['voter_transportations.id'])
            ->withVoter()
            ->withVoterInElectionCampaings()
            ->where([
                'voter_transportations.voter_driver_id' => $voterDriverId,
                'voters_in_election_campaigns.election_campaign_id' => $electionCampaignId
            ])
            ->get();
    }
}
