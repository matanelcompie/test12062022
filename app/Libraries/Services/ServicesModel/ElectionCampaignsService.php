<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionCampaignsService
{
    //check if its time for all ballot box closed
    public static function checkIfTimeBallotBoxClosed(){
        $electionCampaign=ElectionCampaigns::currentCampaign();

        $myTime=date('H:i:s');//my hour
        //time when all the ballot box closed and go to status mark counter votes
        $ballotClosedTime=$electionCampaign->ballot_box_closed_time;

        $myDate=date('Y-m-d');
        $electionDate=$electionCampaign->election_date;
    
        //the ballot box end when the date is bigger then election campaign date or the time bigger then end time ballot closed
        if((!is_null($ballotClosedTime) &&  $myDate==$electionDate &&  $myTime>$ballotClosedTime) || $myDate > $electionDate)
        return true;
        
        return false;
    }

    public static function checkIfStartArriveReportPartyVotes(){
        $electionCampaign=ElectionCampaigns::currentCampaign();

        $myTime=date('H:i:s');//my hour
        //time when all the ballot box closed and go to status mark counter votes
        $startTimeReportParty=$electionCampaign->start_date_report_party;

        $myDate=date('Y-m-d');
        $electionDate=$electionCampaign->election_date;
    
        //the ballot box end when the date is bigger then election campaign date or the time bigger then end time ballot closed
        if((!is_null($startTimeReportParty) &&  $myDate==$electionDate &&  $myTime>$startTimeReportParty) || $myDate > $electionDate)
        return true;
        
        return false;
    }


    public static function getValidVotesByElectionCampaign($election_campaign_id){
        $countValid=ElectionCampaigns::select(DB::raw('sum(valid_votes_count_activist) as sum_valid_votes'))
        ->withBallotBox(false,$election_campaign_id)
        ->first();
        return $countValid?$countValid->sum_valid_votes:0;
    }

    public static function getNotValidVotesByElectionCampaign($election_campaign_id){
        $countNotValid=ElectionCampaigns::select(DB::raw('sum(not_valid_votes_count_activist) as not_sum_valid_votes'))
        ->withBallotBox(false,$election_campaign_id)
        ->first();
        return $countNotValid?$countNotValid->not_sum_valid_votes:0;
    }

    public static function getListAllElectionCampaign(){
        $fields=['id','name', 'key', 'end_date'];
       
        $listElection=ElectionCampaigns::select($fields)
        ->orderBy('id', 'DESC')
        ->get();

        return $listElection;
    }
}