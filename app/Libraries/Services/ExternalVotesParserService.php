<?php
namespace App\Libraries\Services;

use App\Models\VoteSources;
use ErrorException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Barryvdh\Debugbar\Facade as Debugbar;


class ExternalVotesParserService{
    public function parseVotesArray( $fileName, $voteSourceName, $currentCampaign){

            $redis = Redis::connection('external_votes');
            //get vote source
            $voteSource = VoteSources::select('id')
            ->where('system_name', $voteSourceName)
            ->first();

            $voteSourceId = $voteSource ? $voteSource->id : null; 
            $externalVotesDirectory = config( 'constants.EXTERNAL_VOTES_DIRECTORY' );
            $newVotesIdList = [];

            Log::info("Start parsing votes file name: ".$fileName);
            $votesLimit = 1000;
            if (!file_exists($externalVotesDirectory.$fileName)) {
                Log::info('File name '.$fileName." doesn't exists");
                return;
            }
            if (($fileHandler = fopen($externalVotesDirectory.$fileName, 'r')) !== FALSE) {
                while (($row = fgetcsv($fileHandler, 1000, ",")) !== FALSE) {
                    $redisKey = 'votes:'.$row[1].":".$row[2].":".$row[3];
                    if (!$redis->exists($redisKey)) {
                        $redis->set($redisKey, 1);
                        $cityMiId = $row[1];
                        $ballotMiId = $row[2];
                        $voterSerialNumber = $row[3];
                        $hour = explode(" ", $row[4])[1];
                        
                        \App\Console\Commands\GetExternalVotes::addVote($currentCampaign, $cityMiId, $ballotMiId, $voterSerialNumber, $hour, $voteSourceId);
                    }
                    
                    if ($voteSourceName == "elector") {
                        $newVotesIdList[]= $row[0];
                        if(count($newVotesIdList) == $votesLimit){
                            $this->sentVotesIdListToElector($newVotesIdList);
                            $newVotesIdList = [];
                        }
                    }  
                }
                fclose($fileHandler);
                try {
                    rename($externalVotesDirectory.$fileName, $externalVotesDirectory.$fileName.".checked");
                } catch (ErrorException $e) {
                    Log::error($e->getMessage());
                    Debugbar::error('ExternalVotesParserService@parseVotesArray '. $e->getMessage())
                }
            }
            if ($voteSourceName == "elector") {
                if(count($newVotesIdList) > 0){
                    $this->sentVotesIdListToElector($newVotesIdList);
                    $newVotesIdList = [];
                }
            }
            Log::info("Finished parsing votes file name: ".$fileName);
    }
    private function sentVotesIdListToElector($newVotesIdList){
        if(!empty($newVotesIdList)){
            Log::info("Sending checked votes to elector, count: ".count($newVotesIdList));
            $authToken = Redis::get('elector_auth_token');
    
            $myHeader = [
                "Authorization: Basic:$authToken",
            ];
            // Get cURL resource
            $curl = curl_init();
            $url = 'https://app.elector.co.il/api-votes/updated-voters-client?data=' . implode(',', $newVotesIdList);
            // Log::info('$url' . $url);
            curl_setopt($curl, CURLOPT_URL, $url);
		    curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $myHeader);
    
            // Send the request & save response to $resp
            $resp = curl_exec($curl);
            Log::info('Sent to elector');
            Log::info($resp);
            curl_close($curl);
        }
    }
}