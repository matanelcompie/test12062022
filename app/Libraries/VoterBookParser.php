<?php

namespace App\Libraries;

use App\Http\Controllers\ActionController;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\VoterBooks;
use App\Models\VoterBookRows;
use App\Models\ElectionCampaigns;
use App\Models\Voters;
use App\Models\City;
use App\Models\Streets;
use App\Models\VotersInElectionCampaigns;
use App\Models\BallotBoxesFiles;
use Illuminate\Support\Facades\Redis;

use App\Libraries\Helper;

use ZipArchive;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;


class VoterBookParser {

    private $csvFieldsIndexes = [
        'personal_identity' => 0,
        'last_name' => 1,
        'first_name' => 2,
        'father_name' => 3,
        'ballot_city_mi_id' => 4,
        'ballot_mi_id' => 5,

        'mi_city_mi_id' => 7,
        'mi_city' => 8,

        'mi_street_mi_id' => 10,
        'mi_street' => 11,
        'mi_house' => 12,
        'mi_house_entry' => 13,
        'mi_flat' => 14,

        'voter_serial_number' => 16,
        'mi_zip' => 19,
    ];

    private function extractZipFile($fileName) {
        $voterBooksDirectory = config( 'constants.VOTER_BOOKS_DIRECTORY' );
        $extractedFilesDirectory = config( 'constants.VOTER_BOOKS_DIRECTORY' ).$fileName.'_files';
        $file = $voterBooksDirectory . $fileName;
        if (!file_exists($extractedFilesDirectory)) mkdir($extractedFilesDirectory);
        $zip = new ZipArchive;
        if ($zip->open($file) === TRUE) {
            $zip->extractTo($extractedFilesDirectory.'/');
            $zip->close();

            return true;
        } else {
            return false;
        }
    }

    private function getTxtFile($fileName) {
        $voterBooksDirectory = config( 'constants.VOTER_BOOKS_DIRECTORY' ).$fileName.'_files/';
        $txtFiles = glob($voterBooksDirectory . "*.txt");

        return $txtFiles[0];
    }

    private function deleteTxtFiles($fileName) {
        $voterBooksDirectory = config( 'constants.VOTER_BOOKS_DIRECTORY' ).$fileName.'_files';
        if (file_exists($voterBooksDirectory)) {
            $txtFiles = glob($voterBooksDirectory . "/*.txt");
            foreach($txtFiles as $file){ // iterate files
                unlink($file); // delete file
            }
        rmdir($voterBooksDirectory);
        }
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
        $os = php_uname();
        if ( preg_match('/Win/', $os) || preg_match('/win/', $os) ) {
            return $this->isWindowsProcessRunning($processId);
        } else {
            return $this->isLinuxProcessRunning($processId);
        }
    }

    private function countFileRows($fileHandle) {
        $count = 0;

        while (($buffer = fgets($fileHandle)) !== false) {
            $count++;
        }

        rewind($fileHandle);

        return $count;
    }

    private function addErrorRow($currentVoterBook) {
        $voterBookRow = new VoterBookRows;
        $voterBookRow->voter_book_id = $currentVoterBook->id;
        $voterBookRow->row_number = $currentVoterBook->current_row;
        $voterBookRow->status = config('constants.VOTER_BOOK_ROW_STATUS_FAILED');
        $voterBookRow->save();
    }

    /**
     * This function updates each row
     * which contains voter details and
     * allocation to a ballot.
     *
     * @param $currentVoterBook
     * @param $csvData
     */
    private function updateVoterDetails($currentVoterBook, $csvData) {
        $personalIdentity = $csvData[ $this->csvFieldsIndexes['personal_identity'] ];
        $firstName = $csvData[ $this->csvFieldsIndexes['first_name'] ];
        $lastName = $csvData[ $this->csvFieldsIndexes['last_name'] ];

        if ( strlen($personalIdentity) == 0) {
            $this->addErrorRow($currentVoterBook);

            $result = [
                'status' => config('constants.VOTER_BOOK_ROW_STATUS_FAILED')
            ];
            return $result;
        }

        $isNewVoter = false;
        $isActualAddressUpdated = false;
        //$addressHasChanged = false;
        $changedValues = [];
        $updatedValues = [];

        $currentVoter = Voters::where('personal_identity', $personalIdentity)
            ->first();
        if ( is_null($currentVoter) ) {
            $isNewVoter = true;
            $currentVoter = new Voters;
            $currentVoter->key = Helper::getNewTableKey('voters', 10, Helper::DIGIT + Helper::LOWER);
            $currentVoter->personal_identity = $personalIdentity;
        } else {
            if (!is_null($currentVoter->actual_address_update_date)) $isActualAddressUpdated = true;
        }

        $newDetailsValues = [
            'father_name' => $csvData[ $this->csvFieldsIndexes['father_name'] ],
        ];
        
        if (strlen($firstName) != 0) $newDetailsValues['first_name'] = $firstName;
        else if ($isNewVoter) $newDetailsValues['first_name'] = "";
        if (strlen($lastName) != 0) $newDetailsValues['last_name'] = $lastName;
        else if ($isNewVoter) $newDetailsValues['last_name'] = "";

        $newMiValues = [
            'mi_city_id' => null,
            'mi_street' => null,
            'mi_street_id' => null,
            'mi_house' => $csvData[ $this->csvFieldsIndexes['mi_house'] ],
            'mi_house_entry' => $csvData[ $this->csvFieldsIndexes['mi_house_entry'] ],
            'mi_flat' => $csvData[ $this->csvFieldsIndexes['mi_flat'] ],
            'mi_zip' => $csvData[ $this->csvFieldsIndexes['mi_zip'] ]
        ];
        $city = City::select(['id'])
            ->where('mi_id', $csvData[ $this->csvFieldsIndexes['mi_city_mi_id'] ])
            ->first();

        if(!empty($city)){
            $cityId = $city->id ;
        } else {
            $cityByName = City::select(['id'])
            ->where('name', $csvData[ $this->csvFieldsIndexes['mi_city'] ])
            ->first();
            $cityId = !empty($cityByName) ? $cityByName->id : null;
        }

        $newMiValues['mi_city_id'] = $cityId;

        if(!$cityId){
            $newMiValues['mi_city'] = $csvData[ $this->csvFieldsIndexes['mi_city'] ];
        }

        $street = null;
        if($cityId){
            $street = Streets::select(['id', 'name'])
                ->where( [
                    'mi_id' => $csvData[ $this->csvFieldsIndexes['mi_street_mi_id'] ],
                    'city_id' => $cityId
                ])
                ->first();
        }
        if ( is_null($street) ) {
            $newMiValues['mi_street_id'] = null;
            $newMiValues['mi_street'] = $csvData[ $this->csvFieldsIndexes['mi_street'] ];
        } else {
            $newMiValues['mi_street_id'] = $street->id;
            $newMiValues['mi_street'] = $street->name;
        }

        if ( $isNewVoter ) {
            foreach ($newDetailsValues as $fieldName => $newFieldValue) {
                $currentVoter->{$fieldName} = $newFieldValue;

                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Voters.' . $fieldName),
                    'new_value' => $newFieldValue
                ];
            }

            foreach ($newMiValues as $fieldName => $newFieldValue) {
                $currentVoter->{$fieldName} = $newFieldValue;

                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Voters.' . $fieldName),
                    'new_value' => $newFieldValue
                ];
            }

            $addressFields = ['zip', 'house_entry', 'city', 'city_id', 'street', 'street_id', 'house', 'flat'];
            for ( $fieldIndex = 0; $fieldIndex < count($addressFields); $fieldIndex++ ) {
                $fieldName = $addressFields[$fieldIndex];
                $currentVoter->{$fieldName} = $currentVoter->{'mi_' . $fieldName};

                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Voters.' . $fieldName),
                    'new_value' => $currentVoter->{$fieldName}
                ];
            }

            $currentVoter->save();
        } else {
            foreach ($newDetailsValues as $fieldName => $newFieldValue) {
                if ( $newFieldValue != $currentVoter->$fieldName ) {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.Voters.' . $fieldName),
                        'old_value' => $currentVoter->{$fieldName},
                        'new_value' => $newFieldValue
                    ];

                    $updatedValues[$fieldName] = $newFieldValue;
                }
            }

            foreach ($newMiValues as $fieldName => $newFieldValue) {
                if ( $newFieldValue != $currentVoter->$fieldName ) {
                    //$addressHasChanged = true;

                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.Voters.' . $fieldName),
                        'old_value' => $currentVoter->{$fieldName},
                        'new_value' => $newFieldValue
                    ];

                    $updatedValues[$fieldName] = $newFieldValue;
                }
            }

            if (!$isActualAddressUpdated) {
                $addressHasChanged = false;
                foreach ($newMiValues as $fieldName => $newFieldValue) {
                    $actualFieldName = str_replace("mi_", "", $fieldName);
                    if ( $newFieldValue != $currentVoter->$actualFieldName ) {
                        $addressHasChanged = true;

                        $changedValues[] = [
                            'field_name' => $actualFieldName,
                            'display_field_name' => config('history.Voters.' . $actualFieldName),
                            'old_value' => $currentVoter->{$actualFieldName},
                            'new_value' => $newFieldValue
                        ];

                        $updatedValues[$actualFieldName] = $newFieldValue;
                    }
                }
                if ($addressHasChanged) $updatedValues['actual_address_update_date'] = Carbon::now();
            } else {
                if ( $currentVoter->city_id == $newMiValues['mi_city_id'] && $currentVoter->street == $newMiValues['mi_street']) {
                    if ( is_null($currentVoter->street_id) ) {
                        $changedValues[] = [
                            'field_name' => 'street_id',
                            'display_field_name' => config('history.Voters.street_id'),
                            'new_value' => $newMiValues['mi_street']
                        ];
                    }

                    $updatedValues['street_id'] = $newMiValues['mi_street_id'];
                } else {
                    // Chance to update street_id if null
                    if ( $cityId && is_null($currentVoter->street_id) ) {
                        $voterStreetByName = Streets::select('id')
                            ->where(['city_id' => $cityId, 'name' => $currentVoter->street])
                            ->first();
                        if ( !is_null($voterStreetByName) ) {
                            $updatedValues['street_id'] = $voterStreetByName->id;
                        }
                    }
                }
            }

            //DO NOT change actual address correct value
            /*if ( $addressHasChanged ) {
                if ( is_null($currentVoter->actual_address_correct) || $currentVoter->actual_address_correct == 1 ) {
                    $changedValues[] = [
                        'field_name' => 'street_id',
                        'display_field_name' => config('history.Voters.street_id'),
                        'old_numeric_value' => $currentVoter->actual_address_correct,
                        'new_numeric_value' => 1
                    ];
                }

                $updatedValues['actual_address_correct'] = 0;
            }*/

            Voters::where('id', $currentVoter->id)->update($updatedValues);
        }

        $result = [
            'status' => config('constants.VOTER_BOOK_ROW_STATUS_SUCCESS'),
            'isNewVoter' => $isNewVoter,
            'voterId' => $currentVoter->id,
            'miCityId' => $cityId
        ];

        if ( count($changedValues) > 0 ) {
            $model = [
                'description' => 'עדכון פרטי תושב מטעינת ספר תושבים',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $currentVoter->id,
                'valuesList' => $changedValues
            ];

            $result['model'] = $model;
        }

        return $result;
    }

    private function getPreviousCampaign($currentCampaignId) {
        $municipalElectionCampaigns = ElectionCampaigns::select('id', 'key', 'name', 'type', 'start_date', 'end_date',
            'election_date', 'vote_start_time', 'vote_end_time')
            ->whereIn('type', [config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'),
                               config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL')
            ])
            ->where('id', '!=', $currentCampaignId)
            ->orderBy('start_date', 'DESC')
            ->take(1)
            ->get();

        return $municipalElectionCampaigns[0];
    }

    private function getNextBallotDetails($previousCampaignId, $currentCampaignId, $cityId, $nextBallotMiId) {
        //Log::info("staring voter's ballots and clusters allocation");
        $ballotObj = BallotBox::select('ballot_boxes.id')
        ->withCluster()
        ->where(['clusters.city_id' => $cityId, 'clusters.election_campaign_id' => $currentCampaignId,
                    'ballot_boxes.mi_id' => $nextBallotMiId])
        ->first();
        

        if ( !is_null($ballotObj) ) {
			//Log::info("warning -   ballotObj already exists for this city");
            // Check if the ballot exists
            // in the current campaign
            return $ballotObj->id;
        } else {
            // Check if the ballot exists
            // in the previous campaign
			//Log::info("ballot doesn't exist for the city , this will create ballot and cluster");
            $ballotObj = BallotBox::select(['ballot_boxes.id as ballot_box_id', 'clusters.id as cluster_id'])
                ->withCluster()
                ->where(['clusters.city_id' => $cityId, 'clusters.election_campaign_id' => $previousCampaignId,
                         'ballot_boxes.mi_id' => $nextBallotMiId])
                ->first();
            if ( !is_null($ballotObj) ) {
				//Log::info("found previous campaign ballot box");
                // The ballot exists in the previous
                // campaign, then replicate cluster
                // to the current campaign
				
                $clusterObj = Cluster::where('id', $ballotObj->cluster_id)->first();
				$existingNewCluster = Cluster::select('id')->where('city_id',$clusterObj->city_id)->where('mi_id',$clusterObj->mi_id)->where('election_campaign_id',$currentCampaignId)->first();
				if(!$existingNewCluster){
					$nextClusterObj = $clusterObj->replicate();
					$nextClusterObj->key = Helper::getNewTableKey('clusters', 5);
					$nextClusterObj->election_campaign_id = $currentCampaignId;
					$nextClusterObj->leader_id = null;
					$nextClusterObj->save();
				
					//Log::info("created new cluster with id ".$nextClusterObj->id ." , cluster_mi_id : ".$nextClusterObj->mi_id." and city_id : ".$nextClusterObj->city_id);
					// replicate ballot
					$previousBallotObj = BallotBox::where('id', $ballotObj->ballot_box_id)->first();

					$existingNewBallot = BallotBox::where('cluster_id',$nextClusterObj->id)->where('mi_id',$previousBallotObj->mi_id)->first();
					if(!$existingNewBallot){
						$nextBallotObj = $previousBallotObj->replicate();
						$nextBallotObj->key = Helper::getNewTableKey('ballot_boxes', 10);
						$nextBallotObj->cluster_id = $nextClusterObj->id;
						$nextBallotObj->ballot_box_role_id = null;
						$nextBallotObj->voter_count = 0;
						$nextBallotObj->votes_count = null;
						$nextBallotObj->invalid_votes_count = null;
						$nextBallotObj->save();
						//Log::info("created new ballot_box with id ".$nextBallotObj->id." , clusterId : ".$nextBallotObj->cluster_id." and ballot_box mi_id : ".$nextBallotObj->mi_id);
				
						return $nextBallotObj->id;
					}
					else{
						return $existingNewBallot->id;
					}
				}
				else{
					$previousBallotObj = BallotBox::where('id', $ballotObj->ballot_box_id)->first();

					$existingNewBallot = BallotBox::where('cluster_id',$existingNewCluster->id)->where('mi_id',$previousBallotObj->mi_id)->first();
					if(!$existingNewBallot){
						$nextBallotObj = $previousBallotObj->replicate();
						$nextBallotObj->key = Helper::getNewTableKey('ballot_boxes', 10);
						$nextBallotObj->cluster_id = $existingNewCluster->id;
						$nextBallotObj->ballot_box_role_id = null;
						$nextBallotObj->voter_count = 0;
						$nextBallotObj->votes_count = null;
						$nextBallotObj->invalid_votes_count = null;
						$nextBallotObj->save();
						//Log::info("created new ballot_box with id ".$nextBallotObj->id." , clusterId : ".$nextBallotObj->cluster_id." and ballot_box mi_id : ".$nextBallotObj->mi_id);
				
						return $nextBallotObj->id;
					}
					else{
						return $existingNewBallot->id;
					}
				}
            } else {
				//Log::info("DIDNT find previous campaign ballot box");
                // The ballot box does not exist
                // in the current campaign, then
                // create it in the current campaign

                $clusterObj = Cluster::select('id')
                    ->where(['name' => config('constants.VOTER_BOOK_TEMP_CLUSTER_NAME'),
                             'election_campaign_id' => $currentCampaignId,
                             'city_id' => $cityId
                            ])
                    ->first();
                if ( is_null($clusterObj) ) {
					
                    // A temporary cluster does not exist in the city
                    // then create a temporary cluster in the city.
                    $clusterObj = new Cluster;
                    $clusterObj->key = Helper::getNewTableKey('clusters', 5);
                    $clusterObj->election_campaign_id = $currentCampaignId;
                    $clusterObj->name = config('constants.VOTER_BOOK_TEMP_CLUSTER_NAME');
                    $clusterObj->street = config('constants.VOTER_BOOK_TEMP_CLUSTER_NAME');
                    $clusterObj->city_id = $cityId;
                    $clusterObj->mi_id = 0;
                    $clusterObj->old_id = 0;
                    $clusterObj->save();
					//Log::info("created new cluster with id ".$clusterObj->id." , mi_id 0");
                }

                // Create new ballot box
                $ballotObj = new BallotBox;
                $ballotObj->key = Helper::getNewTableKey('ballot_boxes', 10);
                $ballotObj->cluster_id = $clusterObj->id;
                $ballotObj->mi_id = $nextBallotMiId;
                $ballotObj->voter_count = 0;
                $ballotObj->save();
				
				//Log::info("created new ballot with id ".$ballotObj->id." , mi_id  ".$nextBallotMiId." and cluster id ".$ballotObj->cluster_id );

                return $ballotObj->id;
            }
        }
    }

    /**
     * This function allocates a voter to
     * a ballot box;
     * It checks if the voter has been in
     * previous campaign.
     *
     * @param $voterId
     * @param $currentVoterBook
     * @param $csvData
     * @return bool - If is a new voter who was
     *                registered in previous campaign
     */
    private function allocateVoterToBallot($voterId, $miCityId, $currentVoterBook, $csvData, $previousCampaign) {
        //Log::info("start allocation of ballot/cluster , previous campaign id :".$previousCampaign ." , mi_city_id : ".$miCityId." , voter id : ".$voterId);
		$miCityMiId = $csvData[ $this->csvFieldsIndexes['mi_city_mi_id'] ];
        $nextBallotCityMiId = $csvData[ $this->csvFieldsIndexes['ballot_city_mi_id'] ];
        $nextBallotMiId = $csvData[ $this->csvFieldsIndexes['ballot_mi_id'] ];
        //get voter serial number (also test neighboring columns if equal to 0)
        $voterSerialNumber = intval($csvData[ $this->csvFieldsIndexes['voter_serial_number'] ]);
        if ($voterSerialNumber == 0) {
            $voterSerialNumber = intval($csvData[ $this->csvFieldsIndexes['voter_serial_number'] +1 ]);
        }
        if ($voterSerialNumber == 0) {
            $voterSerialNumber = intval($csvData[ $this->csvFieldsIndexes['voter_serial_number'] -1 ]);
        }

        if ( strlen($nextBallotCityMiId) == 0 || strlen($nextBallotMiId) == 0 ) {
            $this->addErrorRow($currentVoterBook);
			//Log::info("error occured");
            return false;
        }

        $isNewVoter = false;

        $previousVoterInElectionCampaign = VotersInElectionCampaigns::select('id')
            ->where('voter_id', $voterId)
            ->where('election_campaign_id', '!=', $currentVoterBook->election_campaign_id)
            ->first();
            
        if ( is_null($previousVoterInElectionCampaign) ) {
            $isNewVoter = true;
        }
		//Log::info("is new voter : ".$isNewVoter);
        // If mi ballot city and voter mi city are actual - take city from $miCityId;
        if($miCityMiId == $nextBallotCityMiId){ 
            $cityId = $miCityId;
        }else{ // Search form ballot city:
            $ballotMicity = City::select(['id'])
            ->where('mi_id', $nextBallotCityMiId)
            ->first();
            $cityId = !empty($ballotMicity) ? $ballotMicity->id : null;
        }
		
		//Log::info("mi_city_id : ".$miCityId." , city id :".$cityId);

        if($cityId){ // If not found ballot city - can't search for ballotbox and VotersInElectionCampaigns
            $nextBallotBoxId = $this->getNextBallotDetails($previousCampaign->id, $currentVoterBook->election_campaign_id, $cityId,
            $nextBallotMiId);


            // Checking if the voter is already allocated to the ballot box
            // in the current campaign
            $voterInElectionCampaign = VotersInElectionCampaigns::select(['id', 'voter_serial_number'])
                ->where(['voter_id' => $voterId, 'election_campaign_id' => $currentVoterBook->election_campaign_id])
                ->first();
            if ( is_null($voterInElectionCampaign) ) {
                // If the voter is not allocated to the ballot box
                // in the current campaign, then allocate him
                $insertValues = [
                    'voter_id' => $voterId,
                    'election_campaign_id' => $currentVoterBook->election_campaign_id,
                    'ballot_box_id' => $nextBallotBoxId,
                    'voter_serial_number' => $voterSerialNumber
                ];
                VotersInElectionCampaigns::insert($insertValues);
            } else {
                $changed = false;
                if ( $voterInElectionCampaign->voter_serial_number != $voterSerialNumber) {
                    $voterInElectionCampaign->voter_serial_number = $voterSerialNumber;
                    $changed = true;
                }

                if ( $voterInElectionCampaign->ballot_box_id != $nextBallotBoxId ) {
                    $voterInElectionCampaign->ballot_box_id = $nextBallotBoxId;
                    $changed = true;
                }
                if ($changed) $voterInElectionCampaign->save();
            }
        }

        $insertValues = [
            'voter_book_id' => $currentVoterBook->id,
            'row_number' => $currentVoterBook->current_row,
            'status' => config('constants.VOTER_BOOK_ROW_STATUS_SUCCESS'),
            'voter_id' => $voterId,
            'ballot_box_city_id' => $cityId,
            'ballot_box_mi_id' => $nextBallotMiId,
            'ballot_box_serial_number' => $voterSerialNumber
        ];
        VoterBookRows::insert($insertValues);

        return $isNewVoter;
    }

    private function parseVoterBook($currentVoterBook, $previousCampaign) {
        // Delete all txt files
        $this->deleteTxtFiles($currentVoterBook->file_name);

        if (!$this->extractZipFile($currentVoterBook->file_name)) {
            Log::info('Error extracting zip file');
            return;
        }

        $currentVoterBookFile = $this->getTxtFile($currentVoterBook->file_name);
        $fileHandle = fopen($currentVoterBookFile, 'r');

       // Log::info('START PARSE JOB ' . $currentVoterBook->id . " of file name ".$currentVoterBookFile);
        $startFromRow = 0;

        switch ($currentVoterBook->status) {
            case config('constants.VOTER_BOOK_PARSER_STATUS_DID_NOT_START'):
                $fileRowsCount = $this->countFileRows($fileHandle);

                $updateFields = [
                    'status' => config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK'),
                    'process_id' => getmypid(),
                    'row_count' => $fileRowsCount,
                    'execution_date' => date(config('constants.APP_DATETIME_DB_FORMAT'))
                ];

                VoterBooks::where('id', $currentVoterBook->id)
                    ->update($updateFields);

                // Start from row 0.
                $startFromRow = 0;
                break;

            case config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK'):
                $startFromRow = $currentVoterBook->current_row + 1;
                break;

            // The parsing ended successfully.
            case config('constants.VOTER_BOOK_PARSER_STATUS_SUCCESS'):
                $this->deleteTxtFiles($currentVoterBook->file_name);
                $currentVoterBook->process_id = null;
                $currentVoterBook->save();
				Redis::del('services:voter_book:'.$currentVoterBook->id);
                fclose($fileHandle);
                return;
                break;
			case config('constants.VOTER_BOOK_PARSER_STATUS_CANCELLED'):
				//$this->deleteTxtFiles($currentVoterBook->file_name);
				$currentVoterBook->process_id = null;
                $currentVoterBook->save();
				Redis::del('services:voter_book:'.$currentVoterBook->id);
                fclose($fileHandle);
                return;
                break;
			case config('constants.VOTER_BOOK_PARSER_STATUS_ERROR'):
               // $this->deleteTxtFiles($currentVoterBook->file_name);
                $currentVoterBook->process_id = null;
                $currentVoterBook->save();
				Redis::del('services:voter_book:'.$currentVoterBook->id);
                fclose($fileHandle);
                return;
                break;
			// The will restart at the place it was stopped
            case config('constants.VOTER_BOOK_PARSER_STATUS_RESTARTED'):
                $updates = [
                       'process_id' => getmypid(),
						'status' => config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK')
                ];
                VoterBooks::where('id', $currentVoterBook->id)->update($updates);

                // Start parsing fromn the row after the
                // last row that was processed
                $startFromRow = $currentVoterBook->current_row + 1;
                 
                break;

        }

        $rowNumber = 0;
		$status = $currentVoterBook->status;
        while (($fileData = fgets($fileHandle)) !== false ) {
			Redis::set('services:voter_book:'.$currentVoterBook->id, 1,'EX', 30);
            $rowNumber++;
			//Log::info("Loop entry number ".$rowNumber);
            // Skip to the row to start from
            if ($startFromRow > 0 && $rowNumber < $startFromRow) {
                continue;
            }

            $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');

            $utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
            $csvData = str_getcsv($utf8Data);
            for ( $index = 0; $index < count($csvData); $index++) {
                $csvData[$index] = trim($csvData[$index]);

                if ( $csvData[$index] == '' ) {
                    $csvData[$index] = null;
                }
            }

            $fields = ['personal_identity', 'ballot_city_mi_id', 'ballot_mi_id', 'mi_zip', 'mi_city_mi_id',
                       'mi_street_mi_id', 'mi_house', 'mi_house_entry', 'mi_flat', 'voter_serial_number'];
            for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
                $fieldName = $fields[$fieldIndex];
                $csvIndex = $this->csvFieldsIndexes[$fieldName];

                $csvData[$csvIndex] = ltrim($csvData[$csvIndex], '0');
            }

            for ( $index = 0; $index < count($csvData); $index++) {
                $csvData[$index] = trim($csvData[$index]);

                if ( $csvData[$index] == '' ) {
                    $csvData[$index] = null;
                }
            }

            $inNewVoter = false;

            $historyArgsArr = [
                'topicName' => 'elections.campaigns.voters_book.execute',
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_VOTERS_BOOK_LOAD'),
                'entity_id' => $currentVoterBook->id,
                'user_create_id' => $currentVoterBook->user_create_id,
                'models' => []
            ];

            $currentVoterBook->current_row = $rowNumber;
            $currentVoterBook->save();
			
			//Log::info("start voter info");
            $result = $this->updateVoterDetails($currentVoterBook, $csvData);
			
            if ( $result['status'] == config('constants.VOTER_BOOK_ROW_STATUS_SUCCESS') ) {
				//Log::info("updated voter successfully");
                $currentVoterBook->voter_count = $currentVoterBook->voter_count + 1;
                if ( $result['isNewVoter'] ) {
                    $inNewVoter = true;
                }

                if ( isset($result['model']) ) {
                    $historyArgsArr['models'][] = $result['model'];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

                if ($this->allocateVoterToBallot($result['voterId'], $result['miCityId'], $currentVoterBook, $csvData, $previousCampaign)) {
                    $currentVoterBook->new_voter_count++;
                }

                $currentVoterBook->save();
            }
			
			$currentFileStatus = VoterBooks::select('status')->where('id', $currentVoterBook->id)->first();
			if($currentFileStatus && $currentFileStatus->status != config('constants.VOTER_BOOK_PARSER_STATUS_AT_WORK')){
				Redis::del('services:voter_book:'.$currentVoterBook->id);
				fclose($fileHandle);
				return; // if process not running anymore - break this loop and return from function
			}
        }
		//Log::info("-----------");
        fclose($fileHandle);

        $currentVoterBook->process_id = null;
        $currentVoterBook->status = config('constants.VOTER_BOOK_PARSER_STATUS_SUCCESS');
        $currentVoterBook->save();

        $this->deleteTxtFiles($currentVoterBook->file_name);

        ElectionCampaigns::where('id', $currentVoterBook->election_campaign_id)->update(['loaded_voters' => 1]);
    }

    public function parseVoterBooks($voterBookId) {
		 
        $currentCampaign = ElectionCampaigns::currentCampaign();

		/*
        $BallotBoxFile = BallotBoxesFiles::select('id')
            ->where(['election_campaign_id' => $currentCampaign->id,
                     'status' => config('constants.BALLOT_BOX_FILE_PARSER_STATUS_DID_NOT_START'),
                     'deleted' => 0])
            ->first();
        if ( !is_null($BallotBoxFile) ) {
            return;
        }
		*/

        $currentVoterBook = VoterBooks::where(['id' => $voterBookId,'deleted' => 0])
            ->first();

        if ( $currentVoterBook)  {
 
            // Checking if the process id is running
            //if (!is_null($currentVoterBook->process_id) && $this->isProcessRunning($currentVoterBook->process_id) ) {
              //  return;
         //   }
			if (!is_null($currentVoterBook->process_id) && Redis::get('services:voter_book:'.$currentVoterBook->id)) {
                    // If the file procees is running, don't interupt.
                    return;
            }

            $currentVoterBook->process_id = getmypid();
            $currentVoterBook->save();
            $previousCampaign = $this->getPreviousCampaign($currentVoterBook->election_campaign_id);
            $this->parseVoterBook($currentVoterBook, $previousCampaign);
        }
		else{
		 
		}
 
		/*else {
            $voterBooks = VoterBooks::where(['status' => config('constants.VOTER_BOOK_PARSER_STATUS_DID_NOT_START'),
                                             'election_campaign_id' => $currentCampaign->id,
                                             'deleted' => 0])
                ->get();

            for ( $index = 0; $index < count($voterBooks); $index++ ) {
                $previousCampaign = $this->getPreviousCampaign($voterBooks[$index]->election_campaign_id);
                $this->parseVoterBook($voterBooks[$index], $previousCampaign);
            }
        }*/
    }
}