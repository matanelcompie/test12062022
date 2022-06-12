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
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;

class ElectionCampaignRepository
{
    /**
     * @throws Exception
     * @return ElectionCampaigns
     */
    public static function getElectionById($id)
    {
        $electionCampaign = ElectionCampaigns::select()->where('id', $id)->first();
        if (!$electionCampaign)
            throw new Exception(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));

        return $electionCampaign;
    }

    /**
     * @throws Exception
     * @return ElectionCampaigns
     */
    public static function getByKey($key)
    {
        $electionCampaign = ElectionCampaigns::select()->where('key', $key)->first();
        if (!$electionCampaign)
            throw new Exception(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));

        return $electionCampaign;
    }
}
