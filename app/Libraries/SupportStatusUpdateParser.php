<?php

namespace App\Libraries;

use App\Http\Controllers\ActionController;

use App\Models\ElectionCampaigns;
use App\Models\SupportStatusUpdates;
use App\Models\Voters;
use App\Models\VoterSupportStatus;
use App\Models\SupportStatus;
use Illuminate\Support\Facades\Redis;

use App\Libraries\Helper;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class SupportStatusUpdateParser {
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
		$runningFile = SupportStatusUpdates::select("id" , "process_id")->where([ 'id' => $processId])->first();
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

    private function getSupportHash($supportStatusList) {
        $supportStatusHash = [];
        foreach($supportStatusList as $supportStatus) {
            foreach($supportStatus as $key => $value) {
                $supportStatusHash[$key] = $value;
            }
        }

        return $supportStatusHash;
    }

    private function getNewSupportStatusFinal($voterSupportStatusFinalSystemName, $supportsHash) {
        $newSystemName = null;

        switch ($voterSupportStatusFinalSystemName) {
            case config('constants.supportStatusSystemNames.DEFINITE_SUPPORTER'):
            case config('constants.supportStatusSystemNames.SUPPORTER'):
                $newSystemName = config('constants.supportStatusSystemNames.SUPPORTER');
                break;

            case config('constants.supportStatusSystemNames.HESITATE'):
            case config('constants.supportStatusSystemNames.POTENTIAL'):
                $newSystemName = config('constants.supportStatusSystemNames.HESITATE');
                break;

            case config('constants.supportStatusSystemNames.UNSUPPORT'):
                $newSystemName = config('constants.supportStatusSystemNames.UNSUPPORT');
                break;
        }

        return $supportsHash[$newSystemName]->id;
    }

    /**
     * Update final status to a voter
     * in the current campaign.
     *
     * @param $voterObj
     * @param $currentSupportStatusUpdate
     * @param $supportsHash
     * @return bool
     */
    private function updateVoterFinalStatus($voterObj, $currentSupportStatusUpdate, $entityTypes, $supportStatusHash) {
        $statusWasUpdated = false;

        $baseVoterSupportStatus = VoterSupportStatus::select(['id', 'support_status_id'])
                                        ->where('voter_id', $voterObj->id)
                                        ->where('election_campaign_id', $currentSupportStatusUpdate->election_campaign_id)
                                        ->whereIn('entity_type', $entityTypes)
                                        ->where('deleted', 0)
                                        ->orderBy('updated_at', 'DESC')
                                        ->first();

        if ( is_null($baseVoterSupportStatus) ) {
            return false;
        }
        
        $newVoterSupportStatusFinal = $supportStatusHash[$baseVoterSupportStatus->support_status_id];

        $historyReferencedModelActionType = null;
        $changedValues = [];
        $voterSupportStatus = VoterSupportStatus::select(['id', 'support_status_id'])
            ->where(['voter_id' => $voterObj->id,
                     'election_campaign_id' => $currentSupportStatusUpdate->election_campaign_id,
                     'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'),
                     'deleted' => 0
					 ])
            ->first();
        if ( is_null($voterSupportStatus) ) {
            $voterSupportStatus = new VoterSupportStatus;
            $voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
            $voterSupportStatus->election_campaign_id = $currentSupportStatusUpdate->election_campaign_id;
            $voterSupportStatus->voter_id = $voterObj->id;
            $voterSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
            $voterSupportStatus->support_status_id  = $newVoterSupportStatusFinal;
            $voterSupportStatus->create_user_id     = $currentSupportStatusUpdate->user_execute_id;
            $voterSupportStatus->update_user_id     = $currentSupportStatusUpdate->user_execute_id;
            $voterSupportStatus->save();

            $fields = ['election_campaign_id', 'voter_id', 'entity_type', 'support_status_id'];
            for ( $fielIndex = 0; $fielIndex < count($fields); $fielIndex++ ) {
                $fieldName = $fields[$fielIndex];

                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                    'new_numeric_value' => $voterSupportStatus->{$fieldName}
                ];
            }

            $historyReferencedModelActionType = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');

            $statusWasUpdated = true;
        } else {
            $historyReferencedModelActionType = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');

            if ( $newVoterSupportStatusFinal != $voterSupportStatus->support_status_id ) {
                $changedValues[] = [
                    'field_name' => 'support_status_id',
                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                    'old_numeric_value' => $voterSupportStatus->support_status_id,
                    'new_numeric_value' => $newVoterSupportStatusFinal
                ];

                VoterSupportStatus::where('id', $voterSupportStatus->id)
                                    ->update([
                                        'support_status_id' => $newVoterSupportStatusFinal,
                                        'update_user_id'    => $currentSupportStatusUpdate->user_execute_id
                                    ]);

                $statusWasUpdated = true;
            }
        }

        if ( count($changedValues) > 0 ) {

            $historyArgsArr = [
                'topicName' => 'elections.campaigns.support_status_update.execute',
                'user_create_id' => $currentSupportStatusUpdate->user_execute_id,
                'entity_type' => config('constants.HISTORY_ENTITY_TYPE_SUPPORT_STATUS_UPDATE'),
                'entity_id' => $currentSupportStatusUpdate->id,
                'models' => [
                    [
                        'description' => 'עדכון סטטוס סופי מעדכון סטטוס רוחבי',
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => $historyReferencedModelActionType,
                        'referenced_id' => $voterSupportStatus->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        return $statusWasUpdated;
    }

    private function getSql($builder) {
        $sql = $builder->toSql();
        foreach($builder->getBindings() as $binding)
        {
            $value = is_numeric($binding) ? $binding : "'".$binding."'";
            $sql = preg_replace('/\?/', $value, $sql, 1);
        }
        return $sql;
    }

    /**
     * This function returns the number of
     * voters to be deleted.
     * The voters who should be deleted are those
     * who have final status in the current campaign
     * and don't have a telemarketing status and
     * election status.
     *
     * @param $last_campaign_id
     * @return mixed
     */
    private function getTotalVotersToDelete($last_campaign_id, $selectedSupportStatusIds) {
        $entityTypes = [config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
                        config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')];

        $votersQuery = VoterSupportStatus::selectRaw('DISTINCT voter_support_status.voter_id')
            ->where(['voter_support_status.election_campaign_id' => $last_campaign_id,
                     'voter_support_status.deleted' => 0])
            ->whereIn('voter_support_status.entity_type', $entityTypes)
            ->whereIn('voter_support_status.support_status_id', $selectedSupportStatusIds);

        $votersToDelete = VoterSupportStatus::selectRaw('COUNT(voter_support_status.voter_id) as total_voters_to_delete')
            ->where(['voter_support_status.election_campaign_id' => $last_campaign_id,
                     'voter_support_status.entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'),
                     'voter_support_status.deleted' => 0])
            ->whereRaw("voter_support_status.voter_id NOT IN (" . $this->getSql($votersQuery) . ")")
            ->first();

        return $votersToDelete->total_voters_to_delete;
    }

    /**
     * This function returns the number of
     * voters to be updated.
     * The voters who should be updated are those
     * who have telemarketing status or election
     * status in the current campaign.
     *
     * @param integer $last_campaign_id
     * @param array $supportStatusHash
     * @return mixed
     */
    private function getTotalVotersToUpdate($last_campaign_id, $supportStatusHash) {
        $fields = DB::raw('count( distinct voters.id) as total_voters_to_update');

        $entityTypes = [config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
                config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')];

        $votersToUpdateObj = Voters::select($fields);
        foreach($supportStatusHash as $key => $value) {
            $supportStatusQuery = VoterSupportStatus::select(DB::raw('distinct voter_support_status.voter_id'))
                                ->leftJoin('voter_support_status as vss2', function($query) use ($last_campaign_id) {
                                    $query->on('vss2.voter_id', '=', 'voter_support_status.voter_id')
                                            ->on('vss2.id', '!=', 'voter_support_status.id')
                                            ->on('vss2.election_campaign_id', DB::raw($last_campaign_id))
                                            ->on('vss2.election_campaign_id', DB::raw($last_campaign_id))
                                            ->on('vss2.deleted', DB::raw(0))
                                            ->on('vss2.entity_type', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')));
                                })
                                ->where('voter_support_status.election_campaign_id', $last_campaign_id)
                                ->where('voter_support_status.deleted', 0)
                                ->whereIn('voter_support_status.entity_type', $entityTypes)
                                ->where('voter_support_status.support_status_id', $key)
                                ->where(function($query) use ($value) {
                                    $query->whereNull('vss2.id')
                                            ->orWhere('vss2.support_status_id','!=', $value);
                                });
            $votersToUpdateObj->orWhereRaw("voters.id IN (" . $this->getSql($supportStatusQuery) . ")");
        }
        $votersToUpdate = $votersToUpdateObj->first();

        return $votersToUpdate->total_voters_to_update;
    }

    /**
     * This function deletes a voter who has final
     * status in the current campaign and doesn't have
     * a telemarketing status and election status.
     *
     * @param $voterSupportStatusObj
     * @param $currentSupportStatusUpdate
     */
    private function deleteVoterWithFinalStatus($voterSupportStatusObj, $currentSupportStatusUpdate) {
        VoterSupportStatus::where('id', $voterSupportStatusObj->id)
                            ->update([
                                'deleted'           => 1,
                                'update_user_id'    => $currentSupportStatusUpdate->user_execute_id
                            ]);

        $historyArgsArr = [
            'topicName' => 'elections.campaigns.support_status_update.execute',
            'user_create_id' => $currentSupportStatusUpdate->user_execute_id,
            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_SUPPORT_STATUS_UPDATE'),
            'entity_id' => $currentSupportStatusUpdate->id,
            'models' => [
                [
                    'description' => 'מחיקת תושבים מעדכון סטטוס רוחבי',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterSupportStatusObj->id,
                    'valuesList' => [
                        [
                            'field_name' => 'support_status_id',
                            'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                            'old_numeric_value' => $voterSupportStatusObj->support_status_id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

    /**
     * This function deletes voters who have final
     * status in the current campaign and don't have
     * a telemarketing status and election status.
     *
     * @param $currentSupportStatusUpdate
     * @return mixed
     */
    private function deleteVotersWithFinalStatus($currentSupportStatusUpdate, $selectedSupportStatusIds) {
        $entityTypes = [config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
                        config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')];

        $votersQuery = VoterSupportStatus::selectRaw('DISTINCT voter_support_status.voter_id')
            ->where(['voter_support_status.election_campaign_id' => $currentSupportStatusUpdate->election_campaign_id,
                     'voter_support_status.deleted' => 0])
            ->whereIn('voter_support_status.entity_type', $entityTypes)
            ->whereIn('voter_support_status.support_status_id', $selectedSupportStatusIds);
        $votersQuerySql = $this->getSql($votersQuery);

        $limit = 10000;

        $status = $currentSupportStatusUpdate->status;
        $continueLoop = true;
        $fields  = [
            'voter_support_status.id',
            'voter_support_status.support_status_id',
            'voter_support_status.voter_id'
        ];
        while ( $continueLoop && $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
            Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
            $voters = VoterSupportStatus::select($fields)
                ->where(['voter_support_status.election_campaign_id' => $currentSupportStatusUpdate->election_campaign_id,
                         'voter_support_status.entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'),
                         'voter_support_status.deleted' => 0])
                ->whereRaw("voter_support_status.voter_id NOT IN (" . $votersQuerySql . ")")
                ->orderBy('voter_support_status.voter_id')
                ->take($limit)
                ->get();

            if ( count($voters) == 0 ) {
                $continueLoop = false;
            }  else {
                for ($voterIndex = 0; $voterIndex < count($voters); $voterIndex++) {
                    $supportStatusUpdateObj = SupportStatusUpdates::select('id', 'status', 'total_voters_processed')
                                                    ->where('id', $currentSupportStatusUpdate->id)->first();
                    $status = $supportStatusUpdateObj->status;
					if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
						Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
                        return;
					}
                    if ($status == config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED')) {
                        break;
                    } else {
                        Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
                        $this->deleteVoterWithFinalStatus($voters[$voterIndex], $currentSupportStatusUpdate);

                        SupportStatusUpdates::where('id', $currentSupportStatusUpdate->id)
                            ->update([
                                'total_voters_processed' => $supportStatusUpdateObj->total_voters_processed + 1
                            ]);
                    }
                }
            }
        }

        return $status;
    }

    /**
     * This function return the last update date
     * of the process who was executed successfuly
     * in the current campaign.
     *
     * @param $currentSupportStatusUpdate
     * @return null
     */
    private function getLastProcessUpdatedDate($currentSupportStatusUpdate) {
        $supportStatusUpdate = SupportStatusUpdates::select('execution_date')
            ->where(['election_campaign_id' => $currentSupportStatusUpdate->election_campaign_id,
                     'status' => config('constants.SUPPORT_STATUS_PARSER_STATUS_SUCCESS')])
            ->orderBy('created_at', 'DESC')
            ->limit(1)
            ->first();

        if ( is_null($supportStatusUpdate) ) {
            return null;
        } else {
            return $supportStatusUpdate->execution_date;
        }
    }

    /**
     * This function updates voters's
     * final status.
     *
     * @param $last_campaign_id
     * @param $currentSupportStatusUpdate
     * @return mixed
     */
    private function updateFinalStatusToVoters($currentSupportStatusUpdate,
                                                $supportStatusHash) {
        $entityTypes = [config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
                        config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')];

        $last_campaign_id = $currentSupportStatusUpdate->election_campaign_id;

        $limit = 10000;

        $status = $currentSupportStatusUpdate->status;
        $continueLoop = true;

        //loop on voters
        while ( $continueLoop && $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {

            if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
						Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
                        return $status;
			} else{
				Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
			}
            //get voters
            $votersToUpdateObj = Voters::select(DB::raw('distinct voters.id'));
            foreach($supportStatusHash as $key => $value) {
                $supportStatusQuery = VoterSupportStatus::select(DB::raw('distinct voter_support_status.voter_id'))
                                    ->leftJoin('voter_support_status as vss2', function($query) use ($last_campaign_id) {
                                        $query->on('vss2.voter_id', '=', 'voter_support_status.voter_id')
                                                ->on('vss2.id', '!=', 'voter_support_status.id')
                                                ->on('vss2.election_campaign_id', DB::raw($last_campaign_id))
                                                ->on('vss2.election_campaign_id', DB::raw($last_campaign_id))
                                                ->on('vss2.deleted', DB::raw(0))
                                                ->on('vss2.entity_type', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')));
                                    })
                                    ->where('voter_support_status.election_campaign_id', $last_campaign_id)
                                    ->where('voter_support_status.deleted', 0)
                                    ->whereIn('voter_support_status.entity_type', $entityTypes)
                                    ->where('voter_support_status.support_status_id', $key)
                                    ->where(function($query) use ($value) {
                                        $query->whereNull('vss2.id')
                                                ->orWhere('vss2.support_status_id','!=', $value);
                                    });
                $votersToUpdateObj->orWhereRaw("voters.id IN (" . $this->getSql($supportStatusQuery) . ")");
            }
            $votersToUpdateObj->orderBy('voters.id');
            $voters = $votersToUpdateObj->take($limit)
                        ->get();

            if ( count($voters) == 0 ) {
                $continueLoop = false;
            } else {
                //loop on each voter
                for ( $voterIndex = 0; $voterIndex < count($voters); $voterIndex++ ) {
                    $supportStatusUpdateObj = SupportStatusUpdates::select(
                                                'id',
                                                'status',
                                                'updated_voters_count',
                                                'total_voters_processed')
                            ->where('id', $currentSupportStatusUpdate->id)->first();
                    $status = $supportStatusUpdateObj->status;
                    if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
						Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
					}
					else{
						Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
					}
					
                    if ( $status == config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
                        break;
                    } else {
                        $update = [];
                        //update voter final status
                        if ( $this->updateVoterFinalStatus($voters[$voterIndex],
                                                            $currentSupportStatusUpdate,
                                                            $entityTypes,
                                                            $supportStatusHash) ) {
                            $update['updated_voters_count'] = $supportStatusUpdateObj->updated_voters_count + 1;
                        }
                        $update['total_voters_processed'] = $supportStatusUpdateObj->total_voters_processed + 1;
                        SupportStatusUpdates::where('id', $currentSupportStatusUpdate->id)->update($update);
                    }
                }
            }
        }

        return $status;
    }

    private function parseTypeFinal($currentSupportStatusUpdate) {
        $status = $currentSupportStatusUpdate->status;
		if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
			Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
            return;
		}
		else{
			Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
		}

        $supportStatusList = json_decode($currentSupportStatusUpdate->conversion_list);

        //generate support status hash and Ids
        $supportStatusHash = $this->getSupportHash($supportStatusList);
        $selectedSupportStatusIds = [];
        foreach($supportStatusHash as $key => $value) {
            $selectedSupportStatusIds[] = $key;
        }
		
        //calculate total voters to process
        $totalVotersCount = $this->getTotalVotersToDelete($currentSupportStatusUpdate->election_campaign_id, $selectedSupportStatusIds);
        $totalVotersCount += $this->getTotalVotersToUpdate($currentSupportStatusUpdate->election_campaign_id,
                                        $supportStatusHash);

        $currentSupportStatusUpdate->total_voters_count = $totalVotersCount;
        $currentSupportStatusUpdate->total_voters_processed = 0;
        $currentSupportStatusUpdate->updated_voters_count = 0;
        $currentSupportStatusUpdate->save();

        //delete final status in voters that doesn't need it
        $status = $this->deleteVotersWithFinalStatus($currentSupportStatusUpdate, $selectedSupportStatusIds);

        if ( $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
            //update final status to voters
            $status = $this->updateFinalStatusToVoters($currentSupportStatusUpdate,
                                                        $supportStatusHash);
        }

        $update = [];
        if ( $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
            $update['status'] = config('constants.SUPPORT_STATUS_PARSER_STATUS_SUCCESS');
            $update['current_update_voter_id'] = null;
        }

        SupportStatusUpdates::where('id', $currentSupportStatusUpdate->id)->update($update);
		Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
    }

    private function updateElectionStatus($voterId, $currentSupportStatusUpdate, $supportStatusHash, $previousCampaignId) {
        //get previous support status
        $previousVoterSupportStatus = VoterSupportStatus::select(['id', 'support_status_id'])
            ->where(['voter_id' => $voterId,
                'election_campaign_id' => $previousCampaignId,
                'entity_type' => $currentSupportStatusUpdate->source_support_status_type,
                'deleted' => 0])
            ->first();
        if ( is_null($previousVoterSupportStatus) ) {
            return false;
        }

        //check if voter doesn't have current campaign support status
        $currentSupportStatus = VoterSupportStatus::select('id')
            ->where(['voter_id' => $voterId,
                'election_campaign_id' => $currentSupportStatusUpdate->election_campaign_id,
                'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'),
                'deleted' => 0])
            ->first();

        if (!is_null($currentSupportStatus)) return false;

        //create new support status
        $newVoterSupportStatus = new VoterSupportStatus;
        $newVoterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
        $newVoterSupportStatus->election_campaign_id = $currentSupportStatusUpdate->election_campaign_id;
        $newVoterSupportStatus->voter_id = $voterId;
        $newVoterSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
        $newVoterSupportStatus->support_status_id = $supportStatusHash[$previousVoterSupportStatus->support_status_id];
        $newVoterSupportStatus->create_user_id     = $currentSupportStatusUpdate->user_execute_id;
        $newVoterSupportStatus->update_user_id     = $currentSupportStatusUpdate->user_execute_id;
        $newVoterSupportStatus->save();

        //save history
        $changedValues = [];
        $fields = ['election_campaign_id', 'voter_id', 'entity_type', 'support_status_id'];
        for ( $fielIndex = 0; $fielIndex < count($fields); $fielIndex++ ) {
            $fieldName = $fields[$fielIndex];

            $changedValues[] = [
                'field_name' => $fieldName,
                'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                'new_numeric_value' => $newVoterSupportStatus->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => 'elections.campaigns.support_status_update.execute',
            'user_create_id' => $currentSupportStatusUpdate->user_execute_id,
            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_SUPPORT_STATUS_UPDATE'),
            'entity_id' => $currentSupportStatusUpdate->id,
            'models' => [
                [
                    'description' => 'עדכון סטטוס סופי מעדכון סטטוס רוחבי',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newVoterSupportStatus->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        return true;
    }

    private function parseTypeElection($currentSupportStatusUpdate) {
		$status = $currentSupportStatusUpdate->status;
	 
		if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
			 Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
             return;
		}
		else{
			
			Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
		}

        $currentSupportStatusUpdate->total_voters_processed = 0;
        $currentSupportStatusUpdate->updated_voters_count = 0;
        $currentSupportStatusUpdate->save();
        
        Log::info('START PARSE JOB ' . $currentSupportStatusUpdate->id);

        $currentCampaignId = $currentSupportStatusUpdate->election_campaign_id;

        $supportStatusList = json_decode($currentSupportStatusUpdate->conversion_list);

        //generate support status hash and Ids
        $supportStatusHash = $this->getSupportHash($supportStatusList);
        $previousSupportStatusIds = [];
        foreach($supportStatusHash as $key => $value) {
            $previousSupportStatusIds[] = $key;
        }

        $previousCampaign = ElectionCampaigns::select('id')
                                    ->where('id', '<', $currentCampaignId)
                                    ->orderBy('start_date', 'DESC')
                                    ->first();

        //get base query
        $voterObj = Voters::select('voters.id')
            ->whereHas('supportStatus', function($query) use ($previousSupportStatusIds, $previousCampaign, $currentSupportStatusUpdate) {
                $query->where([
                    'voter_support_status.election_campaign_id' => $previousCampaign->id,
                    'voter_support_status.entity_type' => $currentSupportStatusUpdate->source_support_status_type,
                    'voter_support_status.deleted' => 0
                ])
                ->whereIn('voter_support_status.support_status_id', $previousSupportStatusIds);
            })
            ->whereDoesntHave('supportStatus', function($query) use ($currentCampaignId) {
                $query->where([
                    'voter_support_status.election_campaign_id' => $currentCampaignId,
                    'voter_support_status.entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'),
                    'voter_support_status.deleted' => 0                    
                ]);
            })
            ->orderBy('voters.id');

        //calculate voters count
        $summaryVoters = DB::table(DB::Raw('( ' . $voterObj->toSql() . ' ) AS t1'))
            ->setBindings([$voterObj->getBindings()])
            ->select(DB::raw('count(t1.id) as count_voters'))
            ->first();
        $currentSupportStatusUpdate->total_voters_count = $summaryVoters->count_voters;
        $currentSupportStatusUpdate->save();

        //loop and generate support status
        $limit = 1000;
        $continueLoop = true;
        while ( $continueLoop && $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
			Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
            $voters = $voterObj->take($limit)
                ->get();
            if ( count($voters) == 0 ) {
                $continueLoop = false;
            } else {
                for ( $voterIndex = 0; $voterIndex < count($voters); $voterIndex++ ) {
                    $supportStatusUpdateObj = SupportStatusUpdates::select('id','status', 'updated_voters_count', 'total_voters_processed')
                                                ->where('id', $currentSupportStatusUpdate->id)->first();
                    $status = $supportStatusUpdateObj->status;
					if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
						Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
                        return;
					}
                    if ( $status == config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
                        break;
                    } 
					else {
                        $update = [];
                        Redis::set('services:support_status_update:'.$currentSupportStatusUpdate->id, 1,'EX', 300);
                        if ( $this->updateElectionStatus($voters[$voterIndex]->id, 
                                                    $currentSupportStatusUpdate, 
                                                    $supportStatusHash,
                                                    $previousCampaign->id) ) {
                            $update['updated_voters_count'] = $supportStatusUpdateObj->updated_voters_count + 1;
                        }
                        $update['total_voters_processed'] = $supportStatusUpdateObj->total_voters_processed + 1;
                        SupportStatusUpdates::where('id', $currentSupportStatusUpdate->id)->update($update);
                    }
                }
            }
        }

        $update = [];
		if($status != config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')){
			Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
            return;
		}
        if ( $status != config('constants.SUPPORT_STATUS_PARSER_STATUS_CANCELLED') ) {
            $update['status'] = config('constants.SUPPORT_STATUS_PARSER_STATUS_SUCCESS');
            $update['total_voters_processed'] = $currentSupportStatusUpdate->total_voters_count;
        }

        SupportStatusUpdates::where('id', $currentSupportStatusUpdate->id)->update($update);
		Redis::del('services:support_status_update:'.$currentSupportStatusUpdate->id);
    }

    private function parseSupportStatusUpdate($currentSupportStatusUpdate) {
        Log::info('START PARSE JOB ' . $currentSupportStatusUpdate->id);

        if ( $currentSupportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK')) return;

        if ( $currentSupportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_DID_NOT_START') ||
                $currentSupportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_RESTARTED')) {
            if ( $currentSupportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_DID_NOT_START') ) {
                $currentSupportStatusUpdate->execution_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
                $currentSupportStatusUpdate->status = config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK');
            }
			if ( $currentSupportStatusUpdate->status == config('constants.SUPPORT_STATUS_PARSER_STATUS_RESTARTED') ) {
                $currentSupportStatusUpdate->status = config('constants.SUPPORT_STATUS_PARSER_STATUS_AT_WORK');
            } 

            $currentSupportStatusUpdate->save();

            switch ( $currentSupportStatusUpdate->type) {
                case config('constants.election_campaigns.supportStatusUpdate.types.ELECTION'):
                    $this->parseTypeElection($currentSupportStatusUpdate);
                    break;

                case config('constants.election_campaigns.supportStatusUpdate.types.FINAL'):
                    $this->parseTypeFinal($currentSupportStatusUpdate);
                    break;
            }
        }
    }

    public function parseSupportStatusUpdates($support_status_update_id) {
	 
        $currentCampaign = ElectionCampaigns::currentCampaign();

        $currentSupportStatusUpdate = SupportStatusUpdates::where(['id' => $support_status_update_id]) ->first();
		if (Redis::get('services:support_status_update:'.$currentSupportStatusUpdate->id)) {
			return;
		}
        $this->parseSupportStatusUpdate($currentSupportStatusUpdate);
    }
}