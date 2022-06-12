<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ManageCommandLine;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionVotesReportParty;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionVotesReportPartyService
{
  public static function updateCountElectionVotesReportParty($election_votes_report_id, $party_id, $count_votes, $checkIsExist = true)
  {
    $user = Auth::user() ? Auth::user() : ManageCommandLine::user();
    $ElectionVotesReportParty = false;

    if ($checkIsExist) {
      $ElectionVotesReportParty = ElectionVotesReportParty::select()
        ->where('election_votes_report_id', $election_votes_report_id)
        ->where('party_id', $party_id)->first();
    }

    if (!$ElectionVotesReportParty) {
      $ElectionVotesReportParty = new ElectionVotesReportParty();
      $ElectionVotesReportParty->key = Helper::getNewTableKey('election_votes_report_party', ElectionVotesReportParty::$lengthKey);
      $ElectionVotesReportParty->election_votes_report_id = $election_votes_report_id;
      $ElectionVotesReportParty->party_id = $party_id;
      $ElectionVotesReportParty->created_voter_id = $user->voter_id;
    } else
      $ElectionVotesReportParty->updated_voter_id = $user->voter_id;

    $ElectionVotesReportParty->count_votes = $count_votes;
    $ElectionVotesReportParty->save();

    return $ElectionVotesReportParty;
  }
}
