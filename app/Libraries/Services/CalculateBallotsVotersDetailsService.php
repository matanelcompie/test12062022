<?php

namespace App\Libraries\Services;

use App\Models\Voters;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CalculateBallotsVotersDetailsService
{
    /**
     * The name and signature of the console command.
     *  Calculate for ballot: 
     * 1. voters prev elections votes percentages 
     * 2. voters sephardi percents 
     * 3. voters strictly_orthodox percents 
     * @var string
     */


    public function calculateBallotCounts($updateBallotsDetailsCounts = true, $calcMiShasPercents = true, $shasVotingProbability = true)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '-1');
        $prevCampaignId = ElectionCampaigns::previousCampaign()->id;
        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        // echo "prevCampaignId: $prevCampaignId - $currentCampaignId";
        if($updateBallotsDetailsCounts){
            $this->updateAllBallotsDetailsCounters($currentCampaignId);
        }

        // get the current shass votes directly - not from current_voters_in_election_campaigns!!!
        if($calcMiShasPercents){
            $this->calculateMiShasVotesPercents($currentCampaignId , $prevCampaignId); 
        }
        if($shasVotingProbability){
            $this->calculateShasVotesProbabilityPercents($currentCampaignId, $prevCampaignId);
        }
      
    }
    private function calculateMiShasVotesPercents($currentCampaignId , $prevCampaignId){

        $fields = [
            'ballot_boxes.id as ballot_box_id',
            'election_campaign_party_list_votes.votes',
            'ballot_boxes.votes_count',
            DB::raw("(( ballot_boxes.votes_count / ballot_boxes.voter_count ) * 100)  as calculated_mi_total_votes_percents"),
            DB::raw("(( election_campaign_party_list_votes.votes / ballot_boxes.votes_count) * 100) as calculated_mi_shas_votes_percents"),
        ];

      $ballotsMiShasVotesPercentages = BallotBox::select($fields)
      ->withOnlyShasVotes($prevCampaignId, false) // Bring only ballots with shass votes!!!
      ->whereNotNull('ballot_boxes.votes_count')  
      ->whereNotNull('ballot_boxes.voter_count') 
      ->join('clusters','clusters.id', 'ballot_boxes.cluster_id')
      ->where('clusters.election_campaign_id', $prevCampaignId)
      ->groupBy('ballot_boxes.id')
      ->get()
      ;
      foreach ($ballotsMiShasVotesPercentages as  $ballotItem){
        Log::info( $ballotItem->ballot_box_id .' - ' . $ballotItem->votes . ' - ' . $ballotItem->votes_count 
           . ' - ' . $ballotItem->calculated_mi_total_votes_percents . ' - '. $ballotItem->calculated_mi_shas_votes_percents );
        BallotBox::where('ballot_boxes.id', '=', $ballotItem->ballot_box_id)
        ->update([
            'calculated_mi_total_votes_percents' =>  $ballotItem->calculated_mi_total_votes_percents ,
            'calculated_mi_shas_votes_percents' =>  $ballotItem->calculated_mi_shas_votes_percents
        ]); 
      }
      Log::info('ballotsMiShasVotesPercentages'. json_encode($ballotsMiShasVotesPercentages));

    //   dd($ballotsMiShasVotesPercentages->toArray());
    }
    private function calculateShasVotesProbabilityPercents($currentCampaignId, $prevCampaignId){

        $fields = [
            'ballot_boxes.id as ballot_box_id',
            'current_voters_in_election_campaigns.ballot_box_id as current_ballot_box_id',
            DB::raw("AVG( ballot_boxes.calculated_mi_total_votes_percents) as calculated_probability_total_votes_percents"),
            DB::raw("AVG( ballot_boxes.calculated_mi_shas_votes_percents) as calculated_probability_shas_votes_percents"),
        ];
        // $whereList = [
        //     'voters_in_election_campaigns.election_campaign_id' => $currentCampaignId ,
        // ];
      $ballotsVotersVotesPercentages = BallotBox::select($fields)
        ->join('voters_in_election_campaigns', function ( $joinOn ) use ($prevCampaignId){
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', DB::raw($prevCampaignId)]
            ]);
        })
        ->join('voters_in_election_campaigns as current_voters_in_election_campaigns', function ( $joinOn ) use ($currentCampaignId){
            $joinOn->on([
                ['current_voters_in_election_campaigns.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['current_voters_in_election_campaigns.election_campaign_id', '=', DB::raw($currentCampaignId)]
            ]);
        })
        // ->where($whereList)
        ->whereNotNull('ballot_boxes.calculated_mi_total_votes_percents')  // Need to get from elections municipal data
        ->whereNotNull('ballot_boxes.calculated_mi_shas_votes_percents') // Need to calculate in the beginning of service
        ->groupBy('current_ballot_box_id')
        ->get();
        // ->limit(10000) // 10000
        // Log::info($ballotsVotersVotesPercentages->toArray());
        $ballotBoxesVotesHash = [];

        foreach ($ballotsVotersVotesPercentages as  $ballotItem){
            Log::info($ballotItem->current_ballot_box_id .' - ' .  $ballotItem->calculated_probability_shas_votes_percents . ' - '. $ballotItem->calculated_probability_total_votes_percents );
                BallotBox::where('ballot_boxes.id', '=', $ballotItem->current_ballot_box_id)
                ->update([
                    'calculated_probability_total_votes_percents' =>  $ballotItem->calculated_probability_total_votes_percents ,
                    'calculated_probability_shas_votes_percents' =>  $ballotItem->calculated_probability_shas_votes_percents
                ]);
        }
        Log::info('ballotsVotersVotesPercentages'. json_encode($ballotsVotersVotesPercentages));

    }
    private function updateAllBallotsDetailsCounters($currentCampaignId){

        $whereList = [
           [ 'voters_in_election_campaigns.election_campaign_id' ,'=',   DB::raw($currentCampaignId)],
        ];
        $strictlyOrthodoxQuery = "CASE WHEN religious_groups.system_name = 'strictly_orthodox' THEN 1 ELSE 0 END";
        $fields = [
            DB::raw('ballot_boxes.id as ballot_box_id'),
            DB::raw("(sum($strictlyOrthodoxQuery )) as strictly_orthodox_count"),
            DB::raw('(sum(voters.sephardi)) as sephardi_count'),
            DB::raw('(count(distinct voters.id)) as voter_count'),
        ];
        $allBallots = Voters::select($fields)
        ->withBallotBoxes()
        ->withReligiousGroup()
        ->where($whereList)
        ->groupBy('ballot_boxes.id')
        ->get();
        // dump($allBallots->toArray());
        foreach ($allBallots as $ballotItem){
            Log::info($ballotItem->ballot_box_id .' - ' .  $ballotItem->voter_count . ' - '. $ballotItem->sephardi_count .  '-' . $ballotItem->strictly_orthodox_count );

            $updateArray = [
                'strictly_orthodox_percents' => ($ballotItem->strictly_orthodox_count / $ballotItem->voter_count) * 100,
                'sephardi_percents' => ($ballotItem->sephardi_count / $ballotItem->voter_count) * 100,
                'voter_count' => $ballotItem->voter_count
            ];
            ballotBox::where('ballot_boxes.id', $ballotItem->ballot_box_id)->update($updateArray);

        }
        // dd($allBallots->toArray());

    }
}
