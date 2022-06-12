<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class VoterInElectionCampaignService
{

    public static function getObjectByVoterKey($voter_key,$election_campaign_id,$arrFields=null){
        $arrFields=$arrFields?$arrFields:DB::raw('voters_in_election_campaigns.*');

        $voterInCampaign=VotersInElectionCampaigns::select($arrFields)->withVoters()
        ->where('voters.key',$voter_key)
        ->where('voters_in_election_campaigns.election_campaign_id',$election_campaign_id)
        ->first();

        return $voterInCampaign;
    }

    public static function CountVotersInElectionCampaign($election_campaign_id){
       $countVoter= VotersInElectionCampaigns::select(DB::raw('count(distinct voter_id) as count_voters'))
        ->where('election_campaign_id',DB::raw($election_campaign_id))
        ->first();
        return $countVoter?$countVoter->count_voters:0;
    }
    
}