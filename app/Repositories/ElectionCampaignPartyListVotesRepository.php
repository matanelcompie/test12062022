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
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use stdClass;

class ElectionCampaignPartyListVotesRepository
{
    public static function getCountShasVotesByClusterId($clusterId)
    {
        $sumVotes = ElectionCampaignPartyListVotes::select(DB::raw('sum(election_campaign_party_list_votes.votes) as sum_votes'))
            ->withBallotBox()
            ->withElectionCampaignPartyLists()
            ->where('election_campaign_party_lists.shas', 1)
            ->where('election_campaign_party_lists.deleted', 0)
            ->where('ballot_boxes.cluster_id', $clusterId)
            ->first();
        if ($sumVotes)
            return $sumVotes->sum_votes ?? 0;
        return 0;
    }

    public static function getCountShasVotesByBallotBoxArrId($ballotBoxArrId)
    {
        $sumVotes = ElectionCampaignPartyListVotes::select(DB::raw('sum(election_campaign_party_list_votes.votes) as sum_votes'))
        ->withElectionCampaignPartyLists()
            ->where('election_campaign_party_lists.shas', 1)
            ->where('election_campaign_party_lists.deleted', 0)
            ->whereIn('ballot_box_id', $ballotBoxArrId)
            ->first();
        if ($sumVotes)
            return $sumVotes->sum_votes ?? 0;
        return 0;
    }
}
