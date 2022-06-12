<?php

namespace App\Libraries;

use App\Models\VoterBooks;
use App\Models\BallotBoxesFiles;
use App\Models\ElectionCampaigns;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\VotersInElectionCampaigns;
use Illuminate\Support\Facades\Redis;
use App\Models\City;
use App\Models\Streets;
use App\Models\VoterBookRows;
use App\Libraries\Helper;

use Illuminate\Support\Facades\Log;


class BallotBoxFileParser {
    private $ballotBoxFileIndexes;

    private function isLinuxProcessRunning($processId) {
        exec("ps -ef | awk '{print $2}'", $pids);

        if (in_array($processId, $pids)) {
            return true;
        } else {
            return false;
        }
    }

    private function isWindowsProcessRunning($processId) {
		
		$pids = \App\Http\Controllers\GlobalController::getCurrentPIDsArray();
		$runningFile = BallotBoxesFiles::select("id" , "process_id")->where([ 'deleted'=> 0 , 'id' => $processId])->first();
		if ($runningFile){
			if (!in_array($runningFile->process_id, $pids)){
				return false;
			}
			else{
				return true;
			}
		}
		
        return false;
    }

    private function isProcessRunning($processId) {
        $os = php_uname();
        if ( preg_match('/Win/', $os) || preg_match('/win/', $os) ) {
            return $this->isWindowsProcessRunning($processId);
        } else {
            return $this->isLinuxProcessRunning($processId);
        }
    }

    private function countFileRows($fileName) {
        $directory = config( 'constants.BALLOT_BOXES_FILES_DIRECTORY' );
        $fileHandle = fopen($directory . $fileName, 'r');

        $count = 0;
        while (($buffer = fgets($fileHandle)) !== false) {
            $count++;
        }

        fclose($fileHandle);

        return $count;
    }

    //Delete all election clusters, ballots, and voters in election -> not in use!
/*
    private function deleteTemporaryAllocations($currentCampaignId) {
        $ballotBoxes = BallotBox::select('ballot_boxes.id')->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
            ->where('clusters.election_campaign_id', $currentCampaignId)
            ->get();

        BallotBox::whereIn('id', $ballotBoxes)->delete();

        Cluster::where('election_campaign_id', $currentCampaignId)->delete();

        VotersInElectionCampaigns::where('election_campaign_id', $currentCampaignId)->delete();
    }
*/
    private function getCsvData($fileData) {
        $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
        $utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
        $csvData = str_getcsv($utf8Data);

        return $csvData;
    }

    private function addBallotIfNotExit(&$newBallotBoxesCount, $clusterId, $electionCampaignId, $cityId, $csvData) {
        $ballotChanged = false;
        $ballot_mi_id = trim(str_replace(".", "", $csvData[$this->ballotBoxFileIndexes->ballot_mi_id]));
        $crippled = ($csvData[$this->ballotBoxFileIndexes->crippled] == 'כ')? 1 : 0;
        $specialAccess = ($csvData[$this->ballotBoxFileIndexes->special_access] == 'כ')? 1 : 0;
        $ballot = BallotBox::select('ballot_boxes.id', 'ballot_boxes.cluster_id')
        ->join('clusters', 'clusters.id', 'ballot_boxes.cluster_id')
        ->where([
            'ballot_boxes.mi_id' => $ballot_mi_id,
            'clusters.city_id'=> $cityId,
            'clusters.election_campaign_id' => $electionCampaignId
        ])->first();

        if(!$ballot){
            $ballot = new BallotBox;
            $ballot->key = Helper::getNewTableKey('ballot_boxes', 10);
            $ballot->mi_id = $ballot_mi_id;
            $ballot->voter_count = 0;
            $newBallotBoxesCount++;
            $ballotChanged = true;
        }

        if ($ballot->cluster_id != $clusterId) {
            $ballot->cluster_id = $clusterId;
            $ballotChanged = true;
        }
        
        if ($ballot->crippled != $crippled) {
            $ballot->crippled = $crippled;
            $ballotChanged = true;
        }

        if ($ballot->special_access != $specialAccess) {
            $ballot->special_access = $specialAccess;
            $ballotChanged = true;
        }

        if($ballot->voter_count == 0){
            $ballot->voter_count = $csvData[$this->ballotBoxFileIndexes->voter_count];
            $ballotChanged = true;
        }

        if ($ballotChanged) $ballot->save();

        return $ballot->id;
    }

    private function addClusterIfNotExit(&$clustersChangedData, $currentCampaignId, $cityId, $csvData) {
        $streetArr = explode(',', $csvData[$this->ballotBoxFileIndexes->cluster_address]);

        $streetId = 0;
        $house = null;

        $streetPartsCount = count($streetArr);
 
        if ( $streetPartsCount > 0){
            //Get streety name

            $street = Streets::select('id')->where(['city_id' => $cityId, 'name' => $streetArr[0], 'deleted' => 0])->first();
            if ( !is_null($street) ) { $streetId = $street->id; }

            //Get house number
            if (  $streetPartsCount > 1 ) { $house = $streetArr[1];} 
        }

        $cluster_mi_id = intval($csvData[$this->ballotBoxFileIndexes->cluster_mi_id]);

        $cluster = Cluster::where(['mi_id' => $cluster_mi_id, 'city_id' => $cityId, 'election_campaign_id' => $currentCampaignId])->first();
        $isNewCluster = false;
        $isClusterChanged = false;
        if(!$cluster){
            $cluster = new Cluster;
            $cluster->key = Helper::getNewTableKey('clusters', 5);
            $cluster->election_campaign_id = $currentCampaignId;
            $cluster->old_id = 0;
            $cluster->mi_id = $cluster_mi_id;
            $cluster->city_id = $cityId;

            $isNewCluster = true;
        }
        $clusterData = [
            'name' => $csvData[$this->ballotBoxFileIndexes->cluster_name],
            'street' => $streetArr[0],
            'street_id' => $streetId,
            'house' => $house,
        ];
        foreach ($clusterData as $key => $value) {
            // LOG::info($cluster->$key .' / ' . $clusterData[$key]);
            // LOG::info($cluster->$key != $clusterData[$key]);

            if( trim($cluster->$key) != trim($clusterData[$key])){
                $cluster->$key = $clusterData[$key];
                $isClusterChanged = true;
            }
        }
        // When cluster had changed
        if(!$isNewCluster && $isClusterChanged){  
             $clustersChangedData['changed'][$cityId . '_' . $cluster_mi_id] = true;
            }
            if($isNewCluster){ $clustersChangedData['new']++;}
            
        // LOG::info('$$clustersChangedData[new]:' . $clustersChangedData['new']);
        // LOG::info( count($clustersChangedData['changed']) );

        $cluster->save();
        // LOG::info('$cluster:'. $cluster->id );

        return $cluster->id;
    }

    private function addVoteLocations($currentBallotBoxFile, $startFromRow) {
        $directory = config( 'constants.BALLOT_BOXES_FILES_DIRECTORY' );
        $fileHandle = fopen($directory . $currentBallotBoxFile->file_name, 'r');
        $campaignId = $currentBallotBoxFile->election_campaign_id;

        $rowNumber = 0;

        $this->ballotBoxFileIndexes = new \stdClass;
        $this->ballotBoxFileIndexes->city_mi_id = 2;
        $this->ballotBoxFileIndexes->city_name = 3;
        $this->ballotBoxFileIndexes->ballot_mi_id = 4;
        $this->ballotBoxFileIndexes->cluster_mi_id = 5;
        $this->ballotBoxFileIndexes->cluster_address = 6;
        $this->ballotBoxFileIndexes->cluster_name = 7;
        $this->ballotBoxFileIndexes->crippled = 8;
        $this->ballotBoxFileIndexes->special_access = 9;
        $this->ballotBoxFileIndexes->voter_count = 11;

        $currentLocations = [
            'city' => ['id' => null, 'mi_id' => 0],
            'cluster' => ['id' => null, 'mi_id' => 0],
        ];

        $clustersChangedData = [
            'new' => 0 ,
            'changed' => [] //Hash table for all clusters that had changed
        ];
        $newBallotBoxesCount = 0;

        $city = null;
        while ( ($fileData = fgets($fileHandle)) !== false ) {
				Redis::set('services:ballot_box_file:'.$currentBallotBoxFile->id, 1,'EX', 30);
                $rowNumber++;
                // Skip to the row to start from
                if ($startFromRow > 1 && $rowNumber < $startFromRow) {
                    continue;
                }
                $currentBallotBoxFile->current_row = $rowNumber;
                $currentBallotBoxFile->save();

                $csvData = $this->getCsvData($fileData);
                if ( is_null($csvData[0]) ) { continue; }
                $city_mi_id = $csvData[$this->ballotBoxFileIndexes->city_mi_id];
                $cluster_mi_id = $csvData[$this->ballotBoxFileIndexes->cluster_mi_id];
                $ballot_mi_id = $csvData[$this->ballotBoxFileIndexes->ballot_mi_id];

                // Log::info('mi id:');
                // Log::info("$city_mi_id , $cluster_mi_id , $ballot_mi_id");
                // Check if city exist, when city changed:
                if ( $city_mi_id != $currentLocations['city']['mi_id'] ) {
                    $city = City::select('id')->where('mi_id', $city_mi_id)->first();
                    if (!$city) {
                        $city = City::select('id')->where('name', $csvData[$this->ballotBoxFileIndexes->city_name])->first();
                    }
                    if ( is_null($city) ) { 
                        continue; 
                    } 

                    $currentLocations['city'] = ['id' => $city->id, 'mi_id' => $city_mi_id];
                    $currentLocations['cluster'] = ['id' => null, 'mi_id' => 0];
                }

                if ( $cluster_mi_id != $currentLocations['cluster']['mi_id'] ){
                    $clusterId = $this->addClusterIfNotExit($clustersChangedData, $campaignId, $currentLocations['city']['id'], $csvData);
                    
                    $currentLocations['cluster'] = [
                        'id' => $clusterId,
                        'mi_id' => $cluster_mi_id
                    ];
                }

            $this->addBallotIfNotExit($newBallotBoxesCount, $currentLocations['cluster']['id'], $campaignId, $currentLocations['city']['id'], $csvData);

                // Log::info('currentLocations:');
                // Log::info(json_encode($currentLocations));

                $currentBallotBoxFile->new_clusters_count = $clustersChangedData['new'];
                $currentBallotBoxFile->clusters_update_count = count( $clustersChangedData['changed']);

                $currentBallotBoxFile->ballot_boxes_count++;

                $currentBallotBoxFile->save();
                
                $currentFileStatus = BallotBoxesFiles::select('status')->where('id', $currentBallotBoxFile->id)->first();
				if($currentFileStatus && $currentFileStatus->status != config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK')){
					fclose($fileHandle);
					Redis::del('services:ballot_box_file:'.$currentBallotBoxFile->id);
					return; // if process not running anymore - break this loop and return from function
				} 
            }
			fclose($fileHandle);
			$currentBallotBoxFile->process_id = null;
			$currentBallotBoxFile->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_SUCCESS');
			$currentBallotBoxFile->save();
    }

    private function addVoterInElectionCampaign($campaignId, $voterBookRowObj) {
        $voterInElectionCampaign = VotersInElectionCampaigns::select('voters_in_election_campaigns.id')
            ->withBallotBox()
            ->where(['voters_in_election_campaigns.voter_id' => $voterBookRowObj->voter_id,
                     'voters_in_election_campaigns.election_campaign_id' => $campaignId,
                     'ballot_boxes.mi_id' => $voterBookRowObj->ballot_box_mi_id,
                     'clusters.city_id' => $voterBookRowObj->ballot_box_city_id])
            ->first();
        if ( !is_null($voterInElectionCampaign) ) {
            return;
        } else {
            $ballot = BallotBox::select('ballot_boxes.id')
                ->withCluster()
                ->where(['ballot_boxes.mi_id' => $voterBookRowObj->ballot_box_mi_id,
                         'clusters.election_campaign_id' => $campaignId,
                         'clusters.city_id' => $voterBookRowObj->ballot_box_city_id])
                ->first();

            if ( !is_null($ballot) ) {
                $insert = [
                    'voter_id' => $voterBookRowObj->voter_id,
                    'election_campaign_id' => $campaignId,
                    'ballot_box_id' => $ballot->id,
                    'voter_serial_number' => $voterBookRowObj->ballot_box_serial_number
                ];
                VotersInElectionCampaigns::insert($insert);
            }
        }
    }
    //Re allocate voters to ballots after update ballots -> not in use!
    private function allocateVoterToBallot($campaignId) {
        $currentPage = 1;
        $limit = 100000;

        $fields = [
            'voter_book_rows.row_number',
            'voter_book_rows.status',
            'voter_book_rows.voter_id',
            'voter_book_rows.ballot_box_city_id',
            'voter_book_rows.ballot_box_mi_id',
            'voter_book_rows.ballot_box_serial_number'
        ];

        $continueLoop = true;
        do {
            $skip = ($currentPage - 1) * $limit;

            $voterBookRows = VoterBookRows::select($fields)
                ->withVoterBook()
                ->where(['voter_book_rows.status' => config('constants.VOTER_BOOK_ROW_STATUS_SUCCESS'),
                         'voter_books.election_campaign_id' => $campaignId])
                ->skip($skip)
                ->take($limit)
                ->get();

            if ( count($voterBookRows) == 0 ) {
                $continueLoop = false;
            } else {
                for ( $index = 0; $index < count($voterBookRows); $index++ ) {
                    $this->addVoterInElectionCampaign($campaignId, $voterBookRows[$index]);
                }

                $currentPage++;
            }
        } while ($continueLoop);
    }

    private function parseBallotBoxFile($currentBallotBoxFile, $currentCampaign) {
       // Log::info('START PARSE JOB ' . $currentBallotBoxFile->id);
		Log::info("process status : " .$currentBallotBoxFile->status);
        $startFromRow = 1;

        switch ($currentBallotBoxFile->status) {
            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_DID_NOT_START'):
                $fileRowsCount = $this->countFileRows($currentBallotBoxFile->file_name);

                $updateFields = [
                    'row_count' => $fileRowsCount,
                    'status' => config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK'),
                    'process_id' => getmypid(),
                    'execution_date' => date(config('constants.APP_DATETIME_DB_FORMAT'))
                ];

                BallotBoxesFiles::where('id', $currentBallotBoxFile->id)
                    ->update($updateFields);

                // Start from row 0.
                $startFromRow = 1;
                break;

            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK'):
                $startFromRow = $currentBallotBoxFile->current_row;
                break;

            // The parsing ended successfully.
            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_SUCCESS'):
				Redis::del('services:ballot_box_file:'.$currentBallotBoxFile->id);
                return;
                break;
			case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_CANCELLED'):
			case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_ERROR'):
				Redis::del('services:ballot_box_file:'.$currentBallotBoxFile->id);
                return;
                break;
			case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_RESTARTED'):
                $updates = [
                       'process_id' => getmypid(),
						'status' => config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK')
                ];
                BallotBoxesFiles::where('id', $currentBallotBoxFile->id)->update($updates);

                $startFromRow = $currentBallotBoxFile->current_row;
                 
                break;
        }

        $this->addVoteLocations($currentBallotBoxFile, $startFromRow);
    }

    public function parseBallotBoxesFiles($ballot_box_file_id) {
        $currentCampaign = ElectionCampaigns::currentCampaign();

        $currentBallotBoxFile = BallotBoxesFiles::where(['id'=>$ballot_box_file_id ,
                                                         'election_campaign_id' => $currentCampaign->id,
                                                         'deleted' => 0])
            ->first();
        if ( !is_null($currentBallotBoxFile) ) {
            // Checking if the process id is running
           // if ( $this->isProcessRunning($currentBallotBoxFile->process_id) ) {
               // return;
            //}
			if (Redis::get('services:ballot_box_file:'.$currentBallotBoxFile->id)) {
                    // If the file procees is running, don't interupt.
                    return;
            }

            $currentBallotBoxFile->process_id = getmypid();
            $currentBallotBoxFile->save();

            $this->parseBallotBoxFile($currentBallotBoxFile, $currentCampaign);
        }  
    }
}