<?php

namespace App\Libraries\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;

use App\Models\Votes;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ReportedHourlyVotes;
use App\Models\VotersInElectionCampaigns;

class BallotVotesCountsService{
    private $ballotsToUpdateHash = null;

    private $hot = false;

    public function setHot($hot) {
        $this->hot = $hot;
    }


    public function updateVotesForClustersBallots($ballotsToUpdateIdsArray = null, $currentCampaignId , $prevCampaignId = null){
        Log::info('updateVotesForClustersBallots' .$ballotsToUpdateIdsArray. ' '.  $currentCampaignId . ' '.  $prevCampaignId );
    
        $this->currentCampaignId = $currentCampaignId;
        $this->prevCampaignId = $prevCampaignId;

        $ballotBoxesHash = []; $clustersHash = [];
        if($ballotsToUpdateIdsArray != null && count($ballotsToUpdateIdsArray) > 0){

            $ballotsToUpdateHash = [];
            foreach($ballotsToUpdateIdsArray as $ballotId){
                $ballotsToUpdateHash[$ballotId] = $ballotId;
            }
         $this->ballotsToUpdateHash = $ballotsToUpdateHash;
        }

        $this->getBallotboxVotesCount($ballotBoxesHash, $clustersHash, $ballotsToUpdateIdsArray);
        $this->getBallotboxSupportsVotesCount($ballotBoxesHash, $clustersHash, $ballotsToUpdateIdsArray);
        $this->updateClustersBallots($ballotBoxesHash, $clustersHash);

    }
    private function getBallotboxVotesCount(&$ballotBoxesHash, &$clustersHash, $ballotsToUpdateIdsArray){
        $currentCampaignId = $this->currentCampaignId;
        $prevCampaignId = $this->prevCampaignId;
        $votesCampaignId = !$prevCampaignId ? $currentCampaignId : $prevCampaignId;

        // Log::info('getBallotboxVotesCount:' . $votesCampaignId);

        $ballotVotesData = Votes::select(
        'clusters.id as cluster_id','ballot_boxes.id as ballot_box_id',
            'ballot_boxes.reporting as ballot_box_reporting',
            DB::raw('Hour(IFNULL(votes.vote_date,votes.created_at)) as current_hour'),
            DB::raw('count(votes.id) as hour_count')
           )
           ->join('voters_in_election_campaigns' , function($joinOn) use($currentCampaignId){
            $joinOn->on('voters_in_election_campaigns.election_campaign_id' ,'='  , DB::raw($currentCampaignId))
            ->on('voters_in_election_campaigns.voter_id' ,'=', 'votes.voter_id');
        })
        ->withCluster()
        // ->where('votes.created_at','>','2019-04-09 07:00:00')//Need to update this hour
        ->where('votes.election_campaign_id' , $votesCampaignId)
        ->orderBy('cluster_id', 'asc')
        ->orderBy('ballot_box_id', 'asc')
        ->orderBy('current_hour', 'asc')
        ->groupBy('cluster_id')
        ->groupBy('ballot_box_id')
        ->groupBy('current_hour');

        if ($this->hot) $ballotVotesData->where('ballot_boxes.hot', 1);
        
        // Log::info( json_encode($ballotVotesData->get()->toArray()));
        
        if($ballotsToUpdateIdsArray != null){ //Update only clusters that has ballots that reporting changed.
            $ballotVotesData->whereIn('ballot_boxes.id' , $ballotsToUpdateIdsArray);
        }
        $ballotVotesData = $ballotVotesData->get();
        $this->updateHashData($ballotBoxesHash, $clustersHash, $ballotVotesData, 'reported_votes_count');
}
private function getBallotboxSupportsVotesCount(&$ballotBoxesHash, &$clustersHash, $ballotsToUpdateIdsArray){
    $currentCampaignId = $this->currentCampaignId;
    $prevCampaignId = $this->prevCampaignId;
    $votesCampaignId = !$prevCampaignId ? $currentCampaignId : $prevCampaignId;

    $whereList= [
        ['support_status.level', '>' , 0],
        ['vssFinal.deleted' , 0],
        ['votes.election_campaign_id' , $votesCampaignId]
    ];

    $ballotSupportsVotesData = Votes::select(
        'clusters.id as cluster_id','ballot_boxes.id as ballot_box_id',
        'ballot_boxes.reporting as ballot_box_reporting',
        DB::raw('Hour(IFNULL(votes.vote_date,votes.created_at)) as current_hour'),
        DB::raw('count(votes.id) as hour_count')
    ) 
    ->join('voters_in_election_campaigns' , function($joinOn) use($currentCampaignId){
        $joinOn->on('voters_in_election_campaigns.election_campaign_id' ,'='  , DB::raw($currentCampaignId))
        ->on('voters_in_election_campaigns.voter_id' ,'=', 'votes.voter_id');
    })
    ->withCluster()
    ->withFinalSupportStatus()
    ->where($whereList)
    // ->where('votes.created_at','>','2019-04-09 07:00:00') //Need to update this hour
    ->orderBy('cluster_id', 'asc')
    ->orderBy('ballot_box_id', 'asc')
    ->orderBy('current_hour', 'asc')
    ->groupBy('cluster_id')
    ->groupBy('ballot_box_id')
    ->groupBy('current_hour');

    if ($this->hot) $ballotSupportsVotesData->where('ballot_boxes.hot', 1);
    // Log::info('ballotSupportsVotesData');
    // Log::info( json_encode($ballotSupportsVotesData->get()->toArray()));

    
    if($ballotsToUpdateIdsArray != null){ //Update only clusters that has ballots that reporting changed.
        $ballotSupportsVotesData->whereIn('ballot_boxes.id' , $ballotsToUpdateIdsArray);
    }
    $ballotSupportsVotesData = $ballotSupportsVotesData->get();
    
        // log::info($ballotSupportsVotesData->toSql());

    $this->updateHashData($ballotBoxesHash, $clustersHash, $ballotSupportsVotesData, 'reported_supporters_votes_count');

}
private function updateHashData(&$ballotBoxesHash, &$clustersHash, $ballotVotesData, $field){
    foreach($ballotVotesData as $row){ 
        $currentBallotId = $row->ballot_box_id;
        $currentClusterId = $row->cluster_id;

        // If need to check only for new ballotboxes , and ballotbox is not exist in new ballotboxes.
        // -> Not update this ballotbox data...

        if($this->ballotsToUpdateHash != null && empty($this->ballotsToUpdateHash[$currentBallotId]) ){
            continue;
        }
        if(empty($ballotBoxesHash[$currentBallotId])){ //Check if ballot exist in ballot hash table
            $ballotBoxesHash[$currentBallotId] = [
                    'total' => ['reported_votes_count' => 0,'reported_supporters_votes_count' => 0,]
               ];
       }
        if(empty($clustersHash[$currentClusterId])){//Check if cluster exist in ballot hash table
             $clustersHash[$currentClusterId] = [
                        'total' => [
                            'reported_votes_count' => 0,
                            'reported_supporters_votes_count' => 0,
                            'reporting_ballot_reported_votes_count' => 0,
                            'reporting_ballot_reported_supporters_votes_count' => 0
                        ]
                ];
        }
        //Insert fields data acording to the ballotVotesData ("$field" is the field in DB)
        $votesCountByHour = $row->hour_count;
        $currentHour = $row->current_hour ;

        $ballotBoxesHash[$currentBallotId]['total'][$field] += $votesCountByHour;
        $clustersHash[$currentClusterId]['total'][$field] +=$votesCountByHour;


        if(empty($ballotBoxesHash[$currentBallotId][$currentHour] )){
            $ballotBoxesHash[$currentBallotId][$currentHour] = [
                'reported_votes_count' => 0,
                'reported_supporters_votes_count' => 0,
                'reporting_ballot_reported_votes_count' => 0,
                'reporting_ballot_reported_supporters_votes_count' => 0
            ];
        }
        if(empty($clustersHash[$currentClusterId][$currentHour] )){
            $clustersHash[$currentClusterId][$currentHour] = [
                'reported_votes_count' => 0,
                'reported_supporters_votes_count' => 0,
                'reporting_ballot_reported_votes_count' => 0,
                'reporting_ballot_reported_supporters_votes_count' => 0
            ];
        }
        $ballotBoxesHash[$currentBallotId][$currentHour][$field] = $votesCountByHour;
        $clustersHash[$currentClusterId][$currentHour][$field] += $votesCountByHour;
        if(!empty($row->ballot_box_reporting)){
            $ballotBoxesHash[$currentBallotId][$currentHour]["reporting_ballot_$field"] = $votesCountByHour;
            $clustersHash[$currentClusterId][$currentHour]["reporting_ballot_$field"] +=$votesCountByHour;
            $clustersHash[$currentClusterId]['total']["reporting_ballot_$field"] +=$votesCountByHour;
        }
    }
    // log::info('ballotBoxesHash', $ballotBoxesHash );
    // log::info('clustersHash', $clustersHash );
}
private function updateClustersBallots($ballotBoxesHash, $clustersHash){
    // Log::info( 'votes');
    // Log::info( $ballotBoxesHash);
    $clusterEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
    $ballotEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');

    $ballotBoxModelName = ($this->hot)? "App\Models\BallotBoxHotCounter" : "App\Models\BallotBox";
    foreach($ballotBoxesHash as $ballotId => $ballotVotesCountObj){
        if (!$this->prevCampaignId) {
            $BallotBox =  $ballotBoxModelName::where('id', $ballotId)->update(
                [ 
                    'reported_votes_count' => $ballotVotesCountObj['total']['reported_votes_count'] ,
                    'reported_supporters_votes_count' => $ballotVotesCountObj['total']['reported_supporters_votes_count'] ,
                ]);
        }
        $this->insertHoursVotesForEntity($ballotVotesCountObj, $ballotEntityType, $ballotId);
    }

    $clusterModelName = ($this->hot)? "App\Models\ClusterHotCounter" : "App\Models\Cluster";
    foreach($clustersHash as $clusterId => $clusterVotesCountObj){
        if (!$this->prevCampaignId) {
            $clusterModelName::where('id', $clusterId)->update(
                [
                    'reported_votes_count' => $clusterVotesCountObj['total']['reported_votes_count'] ,
                    'reported_supporters_votes_count' => $clusterVotesCountObj['total']['reported_supporters_votes_count'] ,
                    'reporting_ballot_reported_votes_count' => $clusterVotesCountObj['total']['reporting_ballot_reported_votes_count'] ,
                    'reporting_ballot_reported_supporters_votes_count' => $clusterVotesCountObj['total']['reporting_ballot_reported_supporters_votes_count'] 
                ]);
        }
        $this->insertHoursVotesForEntity($clusterVotesCountObj, $clusterEntityType, $clusterId);

    }
}

private function insertHoursVotesForEntity($hoursCountObj, $entityType, $entityId){
    $currentCampaignId = $this->currentCampaignId;
    $prevCampaignId = $this->prevCampaignId;

    $hourlyVotesModelName =  ($prevCampaignId)? "App\Models\PreviousElectionsReportedHourlyVotes" : "App\Models\ReportedHourlyVotes";
    if ($this->hot) $hourlyVotesModelName .= "HotCounter";

    foreach($hoursCountObj as $currentHour => $hourRowCount){
        if($currentHour == 'total' || empty($currentHour)){continue;}

        $reportedHourlyVotes = $hourlyVotesModelName::select([
                                'id',
                                'reported_votes_count',
                                'reported_supporters_votes_count',
                                'reporting_ballot_reported_votes_count',
                                'reporting_ballot_reported_supporters_votes_count'
        ])
        ->where('hour', $currentHour)
        ->where('entity_type', $entityType)
        ->where('entity_id', $entityId)
        ->where('election_campaign_id', $currentCampaignId)
        ->first();
        if (!$reportedHourlyVotes) {
            $reportedHourlyVotes = new $hourlyVotesModelName;
            $reportedHourlyVotes->election_campaign_id = $currentCampaignId;
            $reportedHourlyVotes->entity_type = $entityType;
            $reportedHourlyVotes->entity_id = $entityId;
            $reportedHourlyVotes->hour = $currentHour;
            $reportedHourlyVotes->reported_votes_count = $hourRowCount['reported_votes_count'];
            $reportedHourlyVotes->reported_supporters_votes_count = $hourRowCount['reported_supporters_votes_count'];
            $reportedHourlyVotes->reporting_ballot_reported_votes_count = $hourRowCount['reporting_ballot_reported_votes_count'];
            $reportedHourlyVotes->reporting_ballot_reported_supporters_votes_count = $hourRowCount['reporting_ballot_reported_supporters_votes_count'];
        } else {
            if ($reportedHourlyVotes->reported_votes_count != $hourRowCount['reported_votes_count'] ||
                $reportedHourlyVotes->reported_supporters_votes_count != $hourRowCount['reported_supporters_votes_count'] ||
                $reportedHourlyVotes->reporting_ballot_reported_votes_count != $hourRowCount['reporting_ballot_reported_votes_count'] ||
                $reportedHourlyVotes->reporting_ballot_reported_supporters_votes_count != $hourRowCount['reporting_ballot_reported_supporters_votes_count']) {
                //update only if different in one or more count
                $reportedHourlyVotes->reported_votes_count = $hourRowCount['reported_votes_count'];
                $reportedHourlyVotes->reported_supporters_votes_count = $hourRowCount['reported_supporters_votes_count'];
                $reportedHourlyVotes->reporting_ballot_reported_votes_count = $hourRowCount['reporting_ballot_reported_votes_count'];
                $reportedHourlyVotes->reporting_ballot_reported_supporters_votes_count = $hourRowCount['reporting_ballot_reported_supporters_votes_count'];   
            }
        }
        
        $reportedHourlyVotes->save();
    }
}
}