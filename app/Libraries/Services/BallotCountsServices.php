<?php
namespace App\Libraries\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\Voters;
use App\Models\BallotBox;
use App\Models\Cluster;



class BallotCountsServices{


    private $hot = false;

    public function setHot($hot) {
        $this->hot = $hot;
    }

    public function updateBallotboxVotersCount($ballotsToUpdateIdsArray = null, $currentCampaignId){

        $ballotBoxesHash = []; $clustersHash = []; $clustersReportingHash=[];
        $ballotVotersData = Voters::select(
            DB::raw('count(voters_in_election_campaigns.voter_id) as voters_count') ,
            'ballot_boxes.id as ballot_box_id','clusters.id as cluster_id',
            'ballot_boxes.reporting as ballot_box_reporting'
            )
        ->withVoterInElectionCampaigns()
        ->withCluster()
        ->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaignId)
        ->orderBy('cluster_id')
        ->orderBy('ballot_box_id')
        ->groupBy('ballot_box_id')
        ->groupBy('cluster_id');
        if ($this->hot) $ballotVotersData->where('ballot_boxes.hot', 1);

        if($ballotsToUpdateIdsArray != null){ //Update only clusters that has ballots that reporting changed.
            $ballotVotersData->whereIn('ballot_boxes.id' , $ballotsToUpdateIdsArray);
        }
        $ballotVotersData = $ballotVotersData->get();

        // log::info('ballotVotersData_count: ' . count($ballotVotersData));

        foreach($ballotVotersData as $row){ 
            $currentBallotId = $row->ballot_box_id;
            $currentClusterId = $row->cluster_id;
            
            if(empty($clustersHash[$currentClusterId])){ $clustersHash[$currentClusterId] = 0;}
            
            $voters_count = $row->voters_count;
            $ballotBoxesHash[$currentBallotId] = $voters_count;
            $clustersHash[$currentClusterId] += $voters_count;

            if($row->ballot_box_reporting == 1){ // Check if ballot is reporting
                if(empty( $clustersReportingHash[$currentClusterId])){ $clustersReportingHash[$currentClusterId] = 0;}
                $clustersReportingHash[$currentClusterId] +=$voters_count; //Get clusters reporting data

            }
            // log::info('$currentBallotId: ' . $currentBallotId.' $voters_count  '. $voters_count);
        }
        $updateOnlyClusters = $ballotsToUpdateIdsArray == null ? false : true; // Not update the ballots, because they has the reporting Field.
        $this->updateEntitiesCounters('voter_count',$ballotBoxesHash, $clustersHash, $clustersReportingHash, $updateOnlyClusters);
    }


//Households counts methods:
/**
 * method updateBallotboxHouseholdsCount
 * Update ballotbox and clusters, Households counts Summary paramsץ
 * @param [array] $ballotsToUpdateIdsArray - list of ballots IDS for update
 * -> if null it will update all ballots
 * @return void
 */
public function updateBallotboxHouseholdsCount($ballotsToUpdateIdsArray = null, $currentCampaignId){

    $ballotBoxesHash = []; $clustersHash = []; $clustersReportingHash= [];

        $ballotHouseholdsData = Voters::select(
            DB::raw('count(DISTINCT voters.household_id) as households_count') ,
           'ballot_boxes.id as ballot_box_id','clusters.id as cluster_id',
           'ballot_boxes.reporting as ballot_box_reporting'
           )
        ->withVoterInElectionCampaigns()
        ->withCluster()
        ->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaignId)
        ->orderBy('cluster_id')
        ->orderBy('ballot_box_id')
        ->groupBy('ballot_box_id')
        ->groupBy('cluster_id');

        if ($this->hot) $ballotHouseholdsData->where('ballot_boxes.hot', 1);

        if($ballotsToUpdateIdsArray != null){ //Update only clusters that has ballots that reporting changed.
            $ballotHouseholdsData->whereIn('ballot_boxes.id' , $ballotsToUpdateIdsArray);
        }
        $ballotHouseholdsData = $ballotHouseholdsData->get();

        // log::info('$ballotHouseholdsData_count: ' . count($ballotHouseholdsData));

        foreach($ballotHouseholdsData as $row){ 
            $households_count = $row->households_count;

            $currentBallotId = $row->ballot_box_id;
            $currentClusterId = $row->cluster_id;
            
            if(empty($clustersHash[$currentClusterId])){ $clustersHash[$currentClusterId] = 0;}
            
            $ballotBoxesHash[$currentBallotId] = $households_count;
            $clustersHash[$currentClusterId] += $households_count;

            if($row->ballot_box_reporting == 1){ // Check if ballot is reporting
                if(empty( $clustersReportingHash[$currentClusterId])){ $clustersReportingHash[$currentClusterId] = 0;}
                $clustersReportingHash[$currentClusterId] += $households_count;
            }
            // log::info('$currentBallotId: ' . $currentBallotId.' $households_count  '. $households_count);
        }

        $updateOnlyClusters = $ballotsToUpdateIdsArray == null ? false : true; // Not update the ballots, because they has the reporting Field.
        $this->updateEntitiesCounters('household_count', $ballotBoxesHash, $clustersHash,$clustersReportingHash, $updateOnlyClusters);
}
//Support statusess counts methods:
/**
 * method updateBallotboxStatusesCount
 * Update ballotbox and clusters statusess counts Summary params.
 * @param [array] $ballotsToUpdateIdsArray - list of ballots IDS for update
 * -> if null it will update all ballots
 * @return void
 */
public function updateBallotboxStatusesCount($ballotsToUpdateIdsArray = null, $currentCampaignId){


    $whereList= [
        ['support_status.level', '>' , 0],
        ['vssFinal.deleted' , 0],
        ['voters_in_election_campaigns.election_campaign_id' , $currentCampaignId],
        ['vssFinal.election_campaign_id' , $currentCampaignId], //Ask dror!!!
        ['clusters.election_campaign_id' , $currentCampaignId]
    ];

    $ballotBoxesHash = []; $clustersHash = []; $clustersReportingHash= [];
        $ballotSupporterData = Voters::select(
            DB::raw('count(voters_in_election_campaigns.voter_id) as supporter_count') ,
           'ballot_boxes.id as ballot_box_id','clusters.id as cluster_id',
           'ballot_boxes.reporting as ballot_box_reporting'
           )
        ->withVoterInElectionCampaigns()
        ->withCluster()
        ->withFinalSupportStatus($currentCampaignId)
        ->join('support_status','vssFinal.support_status_id','=','support_status.id')
        ->where($whereList)
        ->orderBy('cluster_id')
        ->orderBy('ballot_box_id')
        ->groupBy('ballot_box_id')
        ->groupBy('cluster_id');

        if ($this->hot) $ballotSupporterData->where('ballot_boxes.hot', 1);

        if($ballotsToUpdateIdsArray != null){ //Update only clusters that has ballots that reporting changed.
            $ballotSupporterData->whereIn('ballot_box_id' , $ballotsToUpdateIdsArray);
        }
        $ballotSupporterData = $ballotSupporterData->get();

        foreach($ballotSupporterData as $row){ 
            $supporter_count = $row->supporter_count;
            $currentBallotId = $row->ballot_box_id;
            $currentClusterId = $row->cluster_id;
            
            if(empty($clustersHash[$currentClusterId])){ $clustersHash[$currentClusterId] = 0;}

            $ballotBoxesHash[$currentBallotId] = $supporter_count;
            $clustersHash[$currentClusterId] += $supporter_count;

            if($row->ballot_box_reporting == 1){ // Check if ballot is reporting
                if(empty( $clustersReportingHash[$currentClusterId])){ $clustersReportingHash[$currentClusterId] = 0;}
                $clustersReportingHash[$currentClusterId] +=$supporter_count;
            }

        }
        $updateOnlyClusters = $ballotsToUpdateIdsArray == null ? false : true; // Not update the ballots, because they has the reporting Field.
        $this->updateEntitiesCounters('voter_support_count', $ballotBoxesHash, $clustersHash,$clustersReportingHash, $updateOnlyClusters);

    // dd($ballotBoxesHash,$clustersHash);
}
private function updateEntitiesCounters($totalFieldName, $ballotBoxesHash, $clustersHash, $clustersReportingHash, $updateOnlyClusters){
    // Log::info( $totalFieldName);
    // Log::info( $clustersHash);
    $ballotBoxModelName = ($this->hot)? "App\Models\BallotBoxHotCounter" : "App\Models\BallotBox";
    $clusterModelName = ($this->hot)? "App\Models\ClusterHotCounter" : "App\Models\Cluster";
    if(!$updateOnlyClusters){
        foreach($ballotBoxesHash as $ballotId => $cnt){
            $ballotBoxModelName::where('id', $ballotId)->update([$totalFieldName => $cnt]);
        }
    }
// dd($ballotBoxesHash, $clustersHash);
    foreach($clustersHash as $clusterId => $cnt){
        $updateArray = [];
        $updateArray[$totalFieldName] = $cnt;
        
        if(!empty($clustersReportingHash[$clusterId])){ // If this clusters has reporting ballots
            $updateArray["reporting_ballot_$totalFieldName"] = $clustersReportingHash[$clusterId];
        }
        $clusterModelName::where('id', $clusterId)->update($updateArray);
    }
}

}