<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionVotesReportSource;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionVotesReportSourceService
{
    //function get election vote source id and return id or object of high priority then parameter
    public static function getHighPriorityByElectionVoteSource($my_priority,$onlyId=false){
        // $my_priority=$electionVoteSource->priority;
        $highPrioritySource=ElectionVotesReportSource::select()->where('priority','<',$my_priority)->get();

        if(!$highPrioritySource)
        return false;

        if(!$onlyId)
        return $highPrioritySource;

        $arrId=$highPrioritySource->map(function($ElectionVoteSource){
            return $ElectionVoteSource->id;
         });
        return $arrId->toArray();
    }
}