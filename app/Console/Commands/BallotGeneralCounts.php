<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

use App\Models\Votes;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;

use App\Libraries\Services\BallotCountsServices;
use App\Libraries\Services\BallotVotesCountsService;

class BallotGeneralCounts extends Command
{
    private $sessionTimeout = 86400; //Ttl seconds for session 
    private $currentCampaignId = null;
    private $curentRunStart = null;
    private $updateTimePrefix = 'election_day:dashboard:vote_count_updated_date';
    private $ballotBoxesToUpdateHash = [];
    private $commandsCountsToRun = ['votes', 'voters', 'households', 'supports'];
    private $hot = false;
    /**
     * The name and signature of the console command.
     *  their is several options:
     *  1. full update -> 'all' '{any}'
     *  2. only new update -> 'all' 'new'
     *  ->the total votes will update all the time!
     * @var string
     */
    protected $signature = 'ballots-clusters:general-count {counts_commands_list} {update_new_only} {hot}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate Ballotboxes and clusters all summary counts';

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
        ini_set('memory_limit', '10000M');
        $currentCampaign =  ElectionCampaigns::currentCampaign();
        $this->currentCampaignId = $currentCampaign->id;

        if($this->argument("counts_commands_list") == 'update_prev_elections_only'){ // !! Need to check what means this Feature?

            $prevCampaign = ElectionCampaigns::previousCampaign();
            $prev_campaign_id = $prevCampaign->id;
            $ballotVotesCountsService = new BallotVotesCountsService;
            Log::info('counts_commands_list2:' .' ' . $this->argument("counts_commands_list") . ' prev_campaign_id:' .' ' . $prev_campaign_id. ' currentCampaignId:' .' ' . $this->currentCampaignId);

            $ballotVotesCountsService->updateVotesForClustersBallots(null,  $this->currentCampaignId, $prev_campaign_id);
            return;
        }

        $consoleDetails = $this->getConsoleDetails(); //Must be before setting the start time, to get the prev start time!!!

        $this->runCountsCommands($consoleDetails);
        $this->saveTimeToCache('end'); //End of vote count proccess

        // $this->checkBallotsToUpdateInSession();
    }
    private function getConsoleDetails(){

        $consoleDetails = [];
        $commandsCountsToRun = (explode(",", $this->argument("counts_commands_list")));

        // Check if it has a valid commands to run: 
        if(empty($commandsCountsToRun)){ echo 'No commands to run!'; die;}
        if(empty(array_intersect($commandsCountsToRun, $this->commandsCountsToRun)) && $commandsCountsToRun[0] != 'all'){
             echo 'No valid commands to run!'; die;}

        $ballotsToUpdateIdsArray = null;

        $updateNewOnly = $this->argument("update_new_only"); // If need to update only new ballots!
        if($updateNewOnly === 'new'){
            $ballotsToUpdateIdsArray = $this->getBallotsIdsForUpdate();
        }else{
             Redis::del('election_day:dashboard:ballot_boxes_counters_to_update');
        }

        $hot = $this->argument("hot"); // If need to update hot or all
        if ($hot == "hot") {
            $this->hot = true;
        } else {
            $this->hot = false;
        }

        // Log::info('$ballotsToUpdateIdsArray');
        // Log::info($ballotsToUpdateIdsArray);

        $consoleDetails['ballotsToUpdateIdsArray'] = $ballotsToUpdateIdsArray;
        $consoleDetails['commandsCountsToRun'] = $commandsCountsToRun;
        return $consoleDetails;
    }
    private function runCountsCommands($consoleDetails){
        $currentCampaignId = $this->currentCampaignId;
        $this->curentRunStart = time();
        $this->saveTimeToCache('start'); //Start of vote count proccess 
        
        $ballotCountsServices = new BallotCountsServices;
        $ballotVotesCountsService = new BallotVotesCountsService;

        $ballotCountsServices->setHot($this->hot);
        $ballotVotesCountsService->setHot($this->hot);
        
        $commandsCountsToRun = $consoleDetails['commandsCountsToRun'];
        $ballotsToUpdateIdsArray = $consoleDetails['ballotsToUpdateIdsArray'];
        
        // print_r($consoleDetails['commandsCountsToRun']);
        // var_dump($ballotsToUpdateIdsArray);
        // die;
        if($ballotsToUpdateIdsArray !== null && count($ballotsToUpdateIdsArray) == 0){ //Need to check only new ballotboxes and no new ballotBoxes!
            echo 'No found new ballotBoxes to update!'; return;
        }
        if($commandsCountsToRun[0] == 'all'){
            $commandsCountsToRun = $this->commandsCountsToRun;
        }
        
        if(in_array('votes', $commandsCountsToRun)){
            $ballotVotesCountsService->updateVotesForClustersBallots($ballotsToUpdateIdsArray, $currentCampaignId);
        }
        if(in_array('voters', $commandsCountsToRun)){
            $ballotCountsServices->updateBallotboxVotersCount($ballotsToUpdateIdsArray, $currentCampaignId);
        }
        if(in_array('households', $commandsCountsToRun)){
            $ballotCountsServices->updateBallotboxHouseholdsCount($ballotsToUpdateIdsArray, $currentCampaignId);
        }
        if(in_array('supports', $commandsCountsToRun)){
            $ballotCountsServices->updateBallotboxStatusesCount($ballotsToUpdateIdsArray, $currentCampaignId);
        }

    }
    private function getBallotsIdsForUpdate(){
        $allBallotBoxesToUpdate = [];
        $newBallotBoxesHashForUpdate = $this->getBallotsToUpdateInSession();
        $ballotsToUpdateByNewVotes = $this->getBallotToUpdateByVotes();

        if(!empty($ballotsToUpdateByNewVotes)){
            foreach($ballotsToUpdateByNewVotes as $ballotRow){
                $newBallotBoxesHashForUpdate[$ballotRow->ballot_box_id] = $ballotRow->ballot_box_id;
            }
        }
        // Log::info('$ballotsToUpdateByNewVotes');
        // Log::info($ballotsToUpdateByNewVotes);

        if(!empty($newBallotBoxesHashForUpdate)){ //Get all the ballotBoxes that belongs to the clusters that has changed
            $newBallotBoxesClustersIds = BallotBox::select('ballot_boxes.cluster_id')
            ->groupBy('ballot_boxes.cluster_id')
            ->whereIn('ballot_boxes.id' , array_values($newBallotBoxesHashForUpdate))->get();

            $clustersIdArray = array_values($newBallotBoxesClustersIds->toArray());
            // Log::info('$clustersIdArray');
            // Log::info($clustersIdArray);

            $newAllClustersBallotBoxes = Cluster::select('ballot_boxes.id')
            ->withBallotBoxes()
            ->whereIn('clusters.id', $clustersIdArray)
            ->groupBy('ballot_boxes.id')
            ->get();

            // Log::info('$newAllClustersBallotBoxes');
            // Log::info($newAllClustersBallotBoxes);

            foreach($newAllClustersBallotBoxes as $ballot){
                $allBallotBoxesToUpdate[] = $ballot->id;
            }
            // Log::info('$allBallotBoxesToUpdate');
            // Log::info($allBallotBoxesToUpdate);
        }
        return $allBallotBoxesToUpdate;
    }
    /**
     * method getBallotsToUpdateInSession
     *  Get new ballots that reported as changed
     * -> the report is Occurs in vote sourecs (sms, ivr, mobile)
     *  Need to check form1000!
     * @return void
     */
    private function getBallotsToUpdateInSession(){
        $newBallotBoxesList = [];

        $newBallotsList = Redis::hkeys('election_day:dashboard:ballot_boxes_counters_to_update'); // array of ballots ids to update counters.
        Redis::del('election_day:dashboard:ballot_boxes_counters_to_update');
        if(!empty($newBallotsList) && is_array($newBallotsList)){
            foreach($newBallotsList as $ballotId){
                $newBallotBoxesList[$ballotId] = $ballotId;
            }
        }
        return $newBallotBoxesList;
        
    }
    /**
     * method getBallotToUpdateByVotes
     *  Get ballots that has new votes
     *  -> from the last cmd run process
     * @return void
     */
    private function getBallotToUpdateByVotes(){

        $prevCmdRunTime = $this->getTimeFromCache();
        $newVotesByBallots = null;
        if($prevCmdRunTime){
            $newVotesByBallots = Votes::select('voters_in_election_campaigns.ballot_box_id')
             ->withVotersInElectionCampaign()
             ->where('votes.election_campaign_id', $this->currentCampaignId)
             ->where('votes.vote_date','>', $prevCmdRunTime)
             ->groupBy('ballot_box_id')
             ->get();

        }
        return $newVotesByBallots;
    }
  
    private function saveTimeToCache($type){
        //After vote data update: '2018-10-24 14:34:09'
        $curreteTime = time();
        $format = $type == 'end' ? 'd/m/Y H:i:s': 'Y-m-d H:i:s';
        $time = date($format, time());
        Redis::set("$this->updateTimePrefix:$type:$this->curentRunStart", $time, 'EX', $this->sessionTimeout);

    }
    private function getTimeFromCache(){
        $cacheName = "$this->updateTimePrefix:start:*";
        
        $cacheStartTimes = Redis::keys($cacheName);
        $cacheStartTimesCount = count($cacheStartTimes);
       if($cacheStartTimesCount > 0){
           
            sort($cacheStartTimes);
            // Log::info($cacheStartTimes);
            $firstStartTime = $cacheStartTimes[0];
            $prevStartTimeDate = Redis::get($firstStartTime);

            if($cacheStartTimesCount > 4){
                $firstEndTime = str_replace('start','end', $firstStartTime);
                Redis::del($firstStartTime);
                Redis::del($firstEndTime);
            }

            return $prevStartTimeDate;
       }else{
            return null;
       }
    }

   
    
}
