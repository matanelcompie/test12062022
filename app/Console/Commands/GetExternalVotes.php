<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

use App\Jobs\VotesParserJob;
use App\Models\VotersInElectionCampaigns;
use App\Models\ElectionCampaigns;
use App\Models\Votes;
use App\Models\BallotBox;
use App\Models\VoteSources;

use App\Libraries\Helper;
use App\Libraries\Services\ExternalVotesParserService;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;
use PDOException;
use PhpParser\Node\Stmt\Else_;
use stdClass;
use Barryvdh\Debugbar\Facade as Debugbar;

class GetExternalVotes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'votes:get_external';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get External votes';

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
        ini_set('memory_limit','-1');
        $lastDate = Redis::get('election_day:external_votes:last_date');
        $lastLikudDate = Redis::get('election_day:external_votes:likud:last_date');
        $commandRunning = Redis::get('election_day:external_votes:running');

        $commandRunning = false;
        if ($commandRunning) {
            $this->info("command already running");
            return;
        }

        Redis::set('election_day:external_votes:running', 1);
        Redis::set('election_day:external_votes:last_date', Carbon::now()->format('Y-m-d H:i'));

        //get current campaign
        $currentCampaign =  ElectionCampaigns::currentCampaign();

        // $this->getDegelVotesFromDate($lastDate, $currentCampaign);
        $this->getBingoVotesFromDate($lastDate, $currentCampaign);
        $this->getAllLikudVotesFromDate($lastLikudDate, $currentCampaign);
        // $this->getAgudaVotesFromDate($lastDate, $currentCampaign);
        // $this->getElectorNewVotes($currentCampaign);

        Redis::del('election_day:external_votes:running');
    }

    /**
     * Get degel votes
     *
     * @param date $lastDate
     * @param object $currentCampaign
     * @return void
     */
    public function getDegelVotesFromDate($lastDate, $currentCampaign) {

        //get degel vote source
        $voteSource = VoteSources::select('id')
                            ->where('system_name', 'degel')
                            ->first();
        if ($lastDate == null) $lastDate = '2019-09-17 06:00';
        //set real date
        $realDate = Carbon::parse($lastDate)->subMinutes(2)->format('Y-m-d H:i');

        //get votes
        // Get cURL resource
        $curl = curl_init();
        $url = 'http://elections-api.azurewebsites.net/api/electionapi/getvotes?exclude=shass&from='.str_replace(" ", "%20", $realDate);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        // Close request to clear up some resources
        curl_close($curl);

        $resp = substr($resp, 1, strlen($resp)-1);

        $votes = explode("\\r\\n", $resp);
        
        foreach($votes as $vote) {
            $voteData = explode(',', $vote);
            //date exists
            if (count($voteData) > 1) {
                $cityMiId = $voteData[0];
                $ballotMiId = str_replace(["-", "0."], "", $voteData[1]);
                $ballotMiId = str_replace(".", "", $ballotMiId);
                $voterSerialNumber = $voteData[2];
                $hour = $voteData[3];

                self::addVote($currentCampaign, $cityMiId, $ballotMiId, $voterSerialNumber, $hour, $voteSource->id);

            }
        }
    }

    /**
     * Get bingo votes
     *
     * @param date $lastDate
     * @param object $currentCampaign
     * @return void
     */
    public function getBingoVotesFromDate($lastDate, $currentCampaign) {

        //get bingo vote source
        // $voteSource = VoteSources::select('id')
        //                     ->where('system_name', 'bingo')
        //                     ->first();
        if ($lastDate == null) $lastDate = '2019-09-17 05:00:00';
        //set real date
        $realDate = Carbon::parse($lastDate)->subMinutes(2)->format('Y-m-d\TH:i:s');
        //set basic auth user name and password
        $username = config('votes.external_votes.bingo.username');
        $password = config('votes.external_votes.bingo.password');

        //get votes
        // Get cURL resource
        $curl = curl_init();
        $url = 'https://bigbingo.elcvote.com/getvotes?from='.$realDate;
        curl_setopt($curl, CURLOPT_USERPWD, $username . ":" . $password);  
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl,CURLOPT_ENCODING , "gzip");
        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        // Close request to clear up some resources
        curl_close($curl);

        $responseVotes = explode("\r\n", $resp);
        if (count($responseVotes) > 0) {
            $votesData = array();
            foreach($responseVotes as  $dataVote) {
                $voteData = explode(',', $dataVote);
                //data exists
                if (count($voteData) > 1) {
                    $vote = new stdClass;
                    $vote->identifier = '';
                    $vote->cityMiId = $voteData[0];
                    $vote->ballotMiId = $voteData[1];
                    $vote->voterSerialNumber = $voteData[2];
                    $vote->date = $voteData[3];
                    array_push($votesData, $vote);
                }
            }
            $this->sendToServices($votesData, 'bingo', $currentCampaign);
            // while(count($votesData) > $currentRow){
            //     $votesArray = array_slice($votesData , $currentRow, $votesForProcess);
            //     $job = (new VotesParserJob(new ExternalVotesParserService(), $votesArray, 'bingo', $currentCampaign))->onConnection('redis')->onQueue('external_votes_Parser');
            //     // Executing the job which parses the the votes array
            //     dispatch($job);

            //     $currentRow += $votesForProcess;
            // }
        }
    }  
    private function getAllLikudVotesFromDate($startTime, $currentCampaign){
        $likudLimitResult = env('LIKUD_API_LIMIT', 1000);
        // if ($lastDate == null) $lastDate = '2021-03-23 05:00:00';
        //set real date
        // $startTime = Carbon::parse($lastDate)->subMinutes(2)->timestamp ;
        Log::info("start time: $startTime");

        $resultCount = 0;
        do {

            $resultCount = $this->getLikudVotesFromDate($startTime, $currentCampaign);
            Log::info("$resultCount ---- resultCount - , time: $startTime");
        } while ($resultCount >= $likudLimitResult);
        Redis::set('election_day:external_votes:likud:last_date', $startTime + 10);

    }
    /**
     * Get likud votes
     *
     * @param date $lastDate
     * @param object $currentCampaign
     * @return void
     */
    private function getLikudVotesFromDate(&$currentTime, $currentCampaign) {

        $systemName = 'likud';
        //get bingo vote source
        $voteSource = VoteSources::select('id')
                            ->where('system_name', $systemName)
                            ->first();

        //set basic auth user name and password
        $likudToken = env('LIKUD_VOTES_TOKEN');
        $likudServerUrl = env('LIKUD_SERVER_URL');
        $headers = array("X-API-KEY:$likudToken");

        //get votes
        // Get cURL resource
        $curl = curl_init();
        $url = "$likudServerUrl/prod/api/1/voters/get-votes/$currentTime";
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        // Close request to clear up some resources
        curl_close($curl);

        $responseVotes = json_decode($resp);
        $resultCount = count($responseVotes);
        Log::info('likud-response->' . is_array($responseVotes). '->'. $resultCount);
        if (is_array($responseVotes) && $resultCount > 0) {
            $votesData = array();
            foreach($responseVotes as  $dataVote) {
                //data exists
                $vote = new stdClass;
                $vote->identifier = '';
                $vote->cityMiId = $dataVote->cityMiId;
                $vote->ballotMiId = $dataVote->ballotBoxMiId; //!! Need to check ballot my id
                $vote->voterSerialNumber = $dataVote->voterSerialNumber;
                $date = strtotime($dataVote->voteDate);
                $hour = date('Y-m-d H:i:s', $date);
                $vote->date = $hour;
                array_push($votesData, $vote);
            }
            // Log::info('likud-votes->' . json_encode($votesData));
            $this->sendToServices($votesData, $systemName, $currentCampaign);

            // Set pagination from last voterDate;

            $lastVoterDate = $responseVotes[$resultCount -1]->voteDate;
            $lastVoterDate = str_replace( ['T','.000Z'], [' ', ''], $lastVoterDate);
            $currentTime = Carbon::parse($lastVoterDate)->addHour(2)->timestamp ;
            Log::info('$lastVoterDate'. $lastVoterDate .' '. $responseVotes[$resultCount -1]->voteDate. ' '. $currentTime);
        } 

        return $resultCount;
    }  

    /**
     * Get Aguda votes
     *
     * @param date $lastDate
     * @param object $currentCampaign
     * @return void
     */
    public function getAgudaVotesFromDate($lastDate, $currentCampaign) {

        //get degel vote source
        $voteSource = VoteSources::select('id')
                            ->where('system_name', 'aguda')
                            ->first();
        if ($lastDate == null) $lastDate = '2019-09-17 05:00:00';
        //set real date
        $realDate = Carbon::parse($lastDate)->subMinutes(2)->format('Y-m-d\TH:i:s');

        //get votes
        // Get cURL resource
        $curl = curl_init();
        $url = 'https://www.g2018.net/elections/votes/'.$realDate;
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        // Close request to clear up some resources
        curl_close($curl);

        $votes = explode(" ", $resp);

        foreach($votes as $vote) {
            $voteData = explode(',', $vote);
            //date exists
            if (count($voteData) > 1) {
                $cityMiId = $voteData[0];
                $ballotMiId = str_replace(".", "", $voteData[1]);
                $voterSerialNumber = $voteData[2];
                $hour = $voteData[3];
                self::addVote($currentCampaign, $cityMiId, $ballotMiId, $voterSerialNumber, $hour, $voteSource->id);
            }
        }
    }  
    private function getElectorLoginToken(){
        $username = config('votes.external_votes.elector.username');
        $password = config('votes.external_votes.elector.password');
        // Get cURL resource
        $curl = curl_init();
        $url = "https://app.elector.co.il/api-votes/login?username=$username&password=$password";
        curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        // Send the request & save response to $resp
        $resp = curl_exec($curl);

        $authToken = null;
        $respJson = json_decode($resp);
        if($respJson && $respJson->token){
            $authToken = $respJson->token;
            Redis::set('elector_auth_token', $authToken);
        }
        return $authToken;
        // Close request to clear up some resources
        curl_close($curl);
    }
    private function getElectorNewVotes($currentCampaign){
        $authToken = Redis::get('elector_auth_token');
        if(!$authToken){
            $authToken = $this->getElectorLoginToken();
            if(!$authToken){Log::info('Elector login failed!'); return;}
        } 

        $myHeader = [
		    "Authorization: Basic:$authToken",
		    // "Content-type: application/x-www-form-urlencoded"
		];
        // Get cURL resource
        $curl = curl_init();
        $url = 'https://app.elector.co.il/api-votes/get-votes';
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $myHeader);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

        // Send the request & save response to $resp
        $resp = curl_exec($curl);
        $respJson = json_decode($resp);
        if($respJson && !empty($respJson->data)){
            $votesData = array();
            foreach($respJson->data as  $dataVote) {
                $dateArray = explode('_', $dataVote->date);
                $date = $dateArray[0]."-".$dateArray[1]."-".$dateArray[2]." ".$dateArray[3] . ':' . $dateArray[4] . ':00';//$dateArray[3] . ':' . $dateArray[4] . ':00';
                $vote = new stdClass;
                $vote->identifier = $dataVote->identifier;
                $vote->cityMiId = $dataVote->citySymbol;
                $vote->ballotMiId = $dataVote->pollingStationNumber;
                $vote->voterSerialNumber = $dataVote->voterNumber;
                $vote->date = $date;
                array_push($votesData, $vote);
            }
            $this->sendToServices($votesData, 'elector', $currentCampaign);
            // while(count($votesData) > $currentRow){
            //     $votesArray = array_slice($votesData , $currentRow, $votesForProcess);
            //     $job = (new VotesParserJob(new ExternalVotesParserService(), $votesArray, 'elector', $currentCampaign))->onConnection('redis')->onQueue('external_votes_Parser');
            //     // Executing the job which parses the the votes array
            //     dispatch($job);

            //     $currentRow += $votesForProcess;
            // }
        } else {
            $error = $respJson ? $respJson->error : 'no error';
            Log::info("Elector response empty data, error: $error");
        }

        // Close request to clear up some resources
        curl_close($curl);

    }

    private function sendToServices($votes, $voteSource, $currentCampaign) {
        $currentRow = 0;
        $processInServer = config('votes.process_count');
        $votesForProcess = round(count($votes) / $processInServer);
        Log::info('votesForProcess '.$voteSource);
        Log::info($votesForProcess . ' ' . count($votes));
        $index = 0;
        $fileCount = 0;
        $fileHandler = null;
        $externalVotesDirectory = config( 'constants.EXTERNAL_VOTES_DIRECTORY' );
        $files = array();
        while ($currentRow < count($votes)) {
            if ($index == 0) {
                $fileCount++;
                do {
                    $fileCountString = ($fileCount < 10)? "0".$fileCount : $fileCount;
                    $fileName = $voteSource."_".Carbon::now()->format('Y-m-d_H-i-s')."_".$fileCountString.".txt";
                    $exists = file_exists($externalVotesDirectory.$fileName);
                    if ($exists) sleep(1);
                } while ($exists);
                $fileHandler = fopen($externalVotesDirectory.$fileName, 'w');
                array_push($files, $fileName);
            }
            $vote = $votes[$currentRow];
            fputcsv($fileHandler, [
                        $vote->identifier,
                        $vote->cityMiId,
                        $vote->ballotMiId,
                        $vote->voterSerialNumber,
                        $vote->date
                    ]);
            $index++;
            $currentRow++;
            if ($index == $votesForProcess) {
                fclose($fileHandler);
                $index = 0;
            }
        }
        foreach($files as $file) {
            $job = (new VotesParserJob(new ExternalVotesParserService(), $file, $voteSource, $currentCampaign))->onConnection('redis')->onQueue('external_votes_Parser');
            // Executing the job which parses the the votes array
            dispatch($job);            
        }
    }

    /**
     * Add vote to voter if not exists
     *
     * @param object $currentCampaign
     * @param integer $cityMiId
     * @param integer $ballotMiId
     * @param integer $voterSerialNumber
     * @param string $hour
     * @param integer $voteSourceId
     * @return void
     */
    public static function addVote($currentCampaign, $cityMiId, $ballotMiId, $voterSerialNumber, $hour, $voteSourceId) {
        //get voter with vote
        $voter = VotersInElectionCampaigns::select('voters_in_election_campaigns.voter_id',
                                                    'ballot_boxes.id as ballot_box_id',
                                                    'votes.id as vote_id')
                    ->withBallotCluster()
                    ->join('cities', 'cities.id', '=', 'clusters.city_id')
                    ->leftJoin('votes', function($query) {
                        $query->on('votes.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                            ->on('votes.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
                    })
                    ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id)
                    ->where('cities.mi_id', $cityMiId)
                    ->where('ballot_boxes.mi_id', $ballotMiId)
                    ->where('voters_in_election_campaigns.voter_serial_number', $voterSerialNumber)
                    ->first();
        if ($voter) {
            if ($voter->vote_id == null) {
                try {
                    //create new vote
                    Votes::insert([
                        'key' => Helper::getNewTableKey('votes', 10),
                        'voter_id' => $voter->voter_id,
                        'election_campaign_id' => $currentCampaign->id,
                        'vote_date' => $currentCampaign->election_date." ".$hour,
                        'vote_source_id' => $voteSourceId
                    ]);
                } catch (PDOException $e) {
                    Log::error($e->getMessage());
                    Debugbar::error("GetExternalVotes@addVote ". $e->getMessage());
                }

                return true;
                //update ballotbox to reporting if not set - COMMENTED
                /*BallotBox::where('id', $voter->ballot_box_id)
                            ->where('reporting', 0)
                            ->update([
                                'reporting' => 1
                            ]);*/
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
