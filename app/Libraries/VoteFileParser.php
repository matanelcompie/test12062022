<?php

namespace App\Libraries;

use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\VoteFiles;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use Illuminate\Support\Facades\Redis;

use App\Libraries\Helper;

use Illuminate\Support\Facades\Log;


class VoteFileParser {

    private function getCsvData($fileData) {
        $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
        $utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
        $csvData = str_getcsv($utf8Data);

        return $csvData;
    }

    private function getShasIndexByLetter($fileHandle, $shasLetters) {
        $fileData = fgets($fileHandle);

        $csvData = $this->getCsvData($fileData);

        for ( $headerIndex = 0; $headerIndex < count($csvData); $headerIndex++ ) {
            if ( $csvData[$headerIndex] == $shasLetters ) {
                return $headerIndex;
            }
        }

        return -1;
    }

    private function countFileRows($fileName) {
        $directory = config( 'constants.VOTE_FILES_DIRECTORY' );
        $fileHandle = fopen($directory . $fileName, 'r');

        $count = 0;
        while (($buffer = fgets($fileHandle)) !== false) {
            $count++;
        }

        fclose($fileHandle);

        return $count;
    }

    private function loadVotesFromFileKnesset($currentVoteFile,  $startFromRow) {
        $directory = config( 'constants.VOTE_FILES_DIRECTORY' );
        $fileHandle = fopen($directory . $currentVoteFile->file_name, 'r');
        $campaignId = $currentVoteFile->election_campaign_id;

        $rowNumber = 0;

        $voteFileIndexes = new \stdClass;
        $voteFileIndexes->city_mi_id = 1;
        $voteFileIndexes->ballot_mi_id = 2;
        $voteFileIndexes->voter_count = 3;
        $voteFileIndexes->votes_count = 4;
        $voteFileIndexes->invalid_votes_count = 5;
 
        $shasParty = ElectionCampaignPartyLists::select(['id', 'letters'])
            ->where(['election_campaign_id' => $campaignId, 'shas' => 1, 'deleted' => 0])
            ->first();
        if ( is_null($shasParty) ) {
            return;
        }
 
        // Get Shas Index
        $voteFileIndexes->shas_votes = $this->getShasIndexByLetter($fileHandle, $shasParty->letters);
        $rowNumber++;

        $currentCityMiId = 0;

        while ( ($fileData = fgets($fileHandle)) !== false ) {
			Redis::set('services:vote_file:'.$currentVoteFile->id, 1,'EX', 30);
            $rowNumber++;
            // Skip to the row to start from
            if ($startFromRow > 1 && $rowNumber < $startFromRow) {
                continue;
            }
            $currentVoteFile->current_row = $rowNumber;
            $currentVoteFile->save();

            $csvData = $this->getCsvData($fileData);
            if ( is_null($csvData[0]) ) {
                continue;
            }

            $objKeys = ['city_mi_id', 'ballot_mi_id', 'voter_count', 'votes_count', 'invalid_votes_count', 'shas_votes'];
            for ( $keyIndex = 0; $keyIndex < count($objKeys); $keyIndex++ ) {
                $objKeyName = $objKeys[$keyIndex];

                $csvData[$voteFileIndexes->{$objKeyName}] = trim($csvData[$voteFileIndexes->{$objKeyName}]);
                $csvData[$voteFileIndexes->{$objKeyName}] = ltrim($csvData[$voteFileIndexes->{$objKeyName}], '0');
            }

            $csvData[$voteFileIndexes->ballot_mi_id] = str_replace('.0', '', $csvData[$voteFileIndexes->ballot_mi_id]);

            $objKeys = ['voter_count', 'votes_count', 'invalid_votes_count', 'shas_votes'];
            for ( $keyIndex = 0; $keyIndex < count($objKeys); $keyIndex++ ) {
                $objKeyName = $objKeys[$keyIndex];

                if ( $csvData[$voteFileIndexes->{$objKeyName}] == '') {
                    $csvData[$voteFileIndexes->{$objKeyName}] = 0;
                }
            }

            if ( $currentCityMiId != $csvData[$voteFileIndexes->city_mi_id] ) {
                $currentCityMiId = $csvData[$voteFileIndexes->city_mi_id];

                $city = City::select('id')
                    ->where('mi_id', $csvData[$voteFileIndexes->city_mi_id])
                    ->first();
            }

            if ( !is_null($city) ) {
                $ballotMiId = $csvData[$voteFileIndexes->ballot_mi_id];

                $pattern1 = '/^[1-9][0-9]*(\.[1-2])0$/';
                $pattern2 = '/^[1-9][0-9]*(\.[1-2])$/';

                if ( preg_match($pattern1, $ballotMiId) ) {
                    $ballotMiId = str_replace('.', '', $ballotMiId);
                    $ballotMiId = substr($ballotMiId, 0, strlen($ballotMiId) - 1);
                } elseif ( preg_match($pattern2, $ballotMiId) )
                    $ballotMiId = str_replace('.', '', $ballotMiId);
                else {
                    $ballotMiId = $ballotMiId . '0';
                }

                $ballot = BallotBox::select(['ballot_boxes.id'])
                    ->withCluster()
                    ->where(['ballot_boxes.mi_id' => $ballotMiId, 'clusters.city_id' => $city->id,
                        'clusters.election_campaign_id' => $campaignId])
                    ->first();
                if ( !is_null($ballot) ) {
                    $updateValues = [
                        'voter_count' => $csvData[$voteFileIndexes->voter_count],
                        'votes_count' => $csvData[$voteFileIndexes->votes_count],
                        'invalid_votes_count' => $csvData[$voteFileIndexes->invalid_votes_count],
                    ];
                    BallotBox::where('id', $ballot->id)->update($updateValues);

                    $electionCampaignPartyListVotes = ElectionCampaignPartyListVotes::select('id')
                        ->where(['election_campaign_party_list_id' => $shasParty->id, 'ballot_box_id' => $ballot->id])
                        ->first();
                    if ( is_null($electionCampaignPartyListVotes) )  {
                        $electionCampaignPartyListVotes = new ElectionCampaignPartyListVotes;
                        $electionCampaignPartyListVotes->key = Helper::getNewTableKey('election_campaign_party_list_votes', 10);
                        $electionCampaignPartyListVotes->ballot_box_id = $ballot->id;
                        $electionCampaignPartyListVotes->election_campaign_party_list_id = $shasParty->id;
                    }

                    $electionCampaignPartyListVotes->votes = $csvData[$voteFileIndexes->shas_votes];
                    $electionCampaignPartyListVotes->save();
                }
            }
			
			$currentFileStatus = VoteFiles::select('status')->where('id', $currentVoterBook->id)->first();
			if($currentFileStatus && $currentFileStatus->status != config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK')){
				fclose($fileHandle);
				Redis::del('services:vote_file:'.$currentVoteFile->id);
				return; // if process not running anymore - break this loop and return from function
			}
        }

        fclose($fileHandle);
		
    }

    private function isLinuxProcessRunning($processId) {
        exec("ps -ef | awk '{print $2}'", $pids);

        if (in_array($processId, $pids)) {
            return true;
        } else {
            return false;
        }
    }

    private function isWindowsProcessRunning($processId) {
        $processToCheck = $processId . "";

        exec("tasklist 2>NUL", $task_list);

        $found = false;
        foreach ($task_list as $task_line) {
            $pos = strpos($task_line, $processToCheck);
            if ( $pos !== false ) {
                $found = true;
                break;
            }
        }

        return $found;
    }

    private function isProcessRunning($processId) {
        //Log::info('processId: ' . $processId);

        $os = php_uname();
        if ( preg_match('/Win/', $os) || preg_match('/win/', $os) ) {
            return $this->isWindowsProcessRunning($processId);
        } else {
            return $this->isLinuxProcessRunning($processId);
        }
    }

    private function parseVoteFile($currentVoteFile) {
        // Log::info('START PARSE JOB VOTE FILE ' . $currentVoteFile->id);
        $startFromRow = 0;

        switch ($currentVoteFile->status) {
            case config('constants.VOTE_FILE_PARSER_STATUS_DID_NOT_START'):
                $fileRowsCount = $this->countFileRows($currentVoteFile->file_name);

                $updateFields = [
                    'row_count' => $fileRowsCount,
                    'status' => config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK'),
                    'process_id' => getmypid(),
                    'execution_date' => date(config('constants.APP_DATETIME_DB_FORMAT'))
                ];

                VoteFiles::where('id', $currentVoteFile->id)
                    ->update($updateFields);

                // Start from row 0.
                $startFromRow = 1;
                break;

            case config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK'):
                $startFromRow = $currentVoteFile->current_row + 1;
                break;

          
			case config('constants.VOTE_FILE_PARSER_STATUS_SUCCESS'):
			case config('constants.VOTE_FILE_PARSER_STATUS_CANCELLED'):
			case config('constants.VOTE_FILE_PARSER_STATUS_ERROR'):
				$currentVoteFile->process_id = null;
                $currentVoteFile->save();
				Redis::del('services:vote_file:'.$currentVoteFile->id);
                return;
                break;
			case config('constants.VOTE_FILE_PARSER_STATUS_RESTARTED'):
                $updates = [
                       'process_id' => getmypid(),
						'status' => config('constants.VOTE_FILE_PARSER_STATUS_AT_WORK')
                ];
                VoteFiles::where('id', $currentVoteFile->id)->update($updates);

                // Start parsing fromn the row after the
                // last row that was processed
                $startFromRow = $currentVoteFile->current_row + 1;
                 
                break;
        }

        $this->loadVotesFromFileKnesset($currentVoteFile, $startFromRow);
		$currentVoteFile->process_id = null;
        $currentVoteFile->status = config('constants.VOTE_FILE_PARSER_STATUS_SUCCESS');
        $currentVoteFile->save();
    }

    public function parseVoteFiles($voteFileId) {
        $currentVoteFile = VoteFiles::where(['id' => $voteFileId, 'deleted' => 0])
            ->first();

        if ( !is_null($currentVoteFile) ) {
            // Checking if the process id is running
           // if ( !is_null($currentVoteFile->process_id) && $this->isProcessRunning($currentVoteFile->process_id) ) {
            if ( !is_null($currentVoteFile->process_id) &&  Redis::get('services:vote_file:'.$currentVoteFile->id) ) {
                return;
            }

            $currentVoteFile->process_id = getmypid();
            $currentVoteFile->save();

            $this->parseVoteFile($currentVoteFile);
        }
    }
}