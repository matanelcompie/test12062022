<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\BallotBox;
use App\Models\Vote;
use App\Models\ElectionCampaigns;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

use Carbon\Carbon;

class CalculateReportingBallots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ballots:calculate-reporting';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate reporting ballots';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        //get current campaign
        $currentCampaign = ElectionCampaigns::currentCampaign();
        //get limits
        $voteCountLimit = Redis::get('election_day:dashboard:reporting_vote_count_limit');
        // $voteCountLimit = 20;
        $voteTimeLimit = Redis::get('election_day:dashboard:reporting_vote_time_limit');
        $voteTimeLimit = Carbon::now()->subMinutes($voteTimeLimit)->format('Y-m-d H:i:s');
        $voteArray = explode(" ", $voteTimeLimit);
        $limitHour = ($voteArray[0] == $currentCampaign->election_date)? $voteArray[1] : "00:00:00";
        // clear reporting ballots in campaign
        BallotBox::select('ballot_boxes.id')
            ->WithCluster()
            ->where('clusters.election_campaign_id', $currentCampaign->id)
            ->where('ballot_boxes.reporting', 1)
            ->getQuery()
            ->update([
                'ballot_boxes.reporting' => 0,
                'ballot_boxes.updated_at' => Carbon::now()
            ]);
        $startHour = 7; // Election start hour
        $endHour = 22; // Election end hour
        $reportingHoursCountsQuery = "(COUNT(distinct votes.id) / ( IF(hour(NOW())>$endHour,$endHour,hour(NOW()) ) - $startHour)) as vote_count";
        //calculate new reporting ballots
        $ballotBoxReporting = BallotBox::select('ballot_boxes.id',
                            DB::raw($reportingHoursCountsQuery))
                    ->withVoterElectionCampaign()
                    ->join('votes', function($query) use ($currentCampaign, $limitHour) {
                        $query->on('votes.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                            ->on('votes.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id')
                            ->on('votes.created_at', '>=', DB::raw("'".$currentCampaign->election_date." ".$limitHour."'"));
                    })
                    ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id)
                    ->groupBy('ballot_boxes.id')
                    ->having('vote_count', '>=', $voteCountLimit)
                    ->get();
                    // dd($ballotBoxReporting)
        //generate reporting ballots Ids
        $reportingIds = [];
        foreach($ballotBoxReporting as $reporting) {
            $reportingIds[] = $reporting->id;
        }

        //update reporting ballots by Ids
        BallotBox::whereIn('id', $reportingIds)
                    ->update([
                       'reporting' => 1
                    ]);
    }
}
