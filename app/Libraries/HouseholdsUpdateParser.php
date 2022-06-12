<?php

namespace App\Libraries;

use App\Http\Controllers\ActionController;

use App\Models\HouseholdUpdate;
use App\Models\HouseholdUpdatePart;
use App\Models\Voters;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdsUpdateParser {

	private function parsehouseholdUpdatePart($householdUpdatePart) {

		switch ($householdUpdatePart->status) {
            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_DID_NOT_START'):

                $householdUpdatePart->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK');
                $householdUpdatePart->process_id = getmypid();
                $householdUpdatePart->execution_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
                $householdUpdatePart->save();
                break;

            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK'):
                break;

            // The parsing ended successfully.
            case config('constants.BALLOT_BOX_FILE_PARSER_STATUS_SUCCESS'):
                return;
                break;
        }

        $voterFields = [
        	'voters.id',
        	'last_name',
        	'household_id',
        	'mi_city',
        	'voters.mi_city_id',
        	DB::raw('IFNULL(mi_streets.name, voters.mi_street) AS mi_street'),
        	'mi_street_id',
        	'mi_house',
        	'mi_flat'
        ];
        do {
	        $voter = Voters::select($voterFields)
	        			->where('voters.id', '>=', $householdUpdatePart->current_voter_id)
	        			->where('voters.id', '<=', $householdUpdatePart->end_voter_id)
	        			->where('household_update', 0)
	        			->orderBy('voters.id')
						->withMiStreet(true)
	        			->first();
	        if (is_null($voter)) return;
			Log::info("household_update". $voter->id);
	       	$householdUpdatePart->current_voter_id = $voter->id;
	        $householdUpdatePart->save();
			
	        $householdVoters = Voters::select('id', 'household_id')
	        					->where('id', '!=', $voter->id)
	        					->where('last_name', $voter->last_name)

	        					->where(function($query) use ($voter) {
	        						$query->orWhere(function($query) use($voter) {
	        							$query->where('mi_city_id', 0)
	        								->where('mi_city', $voter->mi_city);
	        						});
	        						$query->orWhere(function($query) use ($voter) {
	        							$query->where('mi_city_id', '>', 0)
	        								->where('mi_city_id', $voter->mi_city_id);
	        						});
	        					})
								->where(function($query) use ($voter) {
	        						$query->orWhere('mi_street', $voter->mi_street)
	        						->orWhere('mi_street_id', $voter->mi_street_id);
	        					})
	        					->where('mi_house', $voter->mi_house);

								if(!is_null($voter->mi_flat)){
									$householdVoters->where('mi_flat', $voter->mi_flat);
								} else{
									$householdVoters->whereNull('mi_flat');
								}

			$householdVoters = $householdVoters->get();
	        $differentHousholdId = false;
	        $householdIdUpdated = false;
	        $totalVoters = [$voter];
	        $votersIds = [$voter->id];
	        foreach($householdVoters as $householdVoter) {
	        	if ($householdVoter->household_id != $voter->household_id) $differentHousholdId = true;
	        	$votersIds[] = $householdVoter->id;
	        	$totalVoters[] = $householdVoter;
	        }
	        if ($differentHousholdId) {
	        	$this->updateHousehold($totalVoters, $votersIds, $householdUpdatePart);
	        	$householdIdUpdated = true;
	        } else {
	        	$leftMembersInHousehold = Voters::select('id')
	        								->where('household_id', $voter->household_id)
	        								->whereNotIn('id', $votersIds)
	        								->get();
	        	if (count($leftMembersInHousehold) > 0) {
	        		$this->updateHousehold($totalVoters, $votersIds, $householdUpdatePart);
	        		$householdIdUpdated = true;
	        	}
	        }

		    if (!$householdIdUpdated) {
		        Voters::whereIn('id', $votersIds)
		        			->update([
		        				'household_update' => 1
        			]);
	        }
        } while (!is_null($voter));
	}

	private function updateHousehold($totalVoters, $votersIds, $householdUpdatePart) {
		$lastHouseholdId = Voters::select('household_id')
							->orderBy('household_id', 'DESC')
							->first()->household_id + 1;
							
							//get only the relevant household:
			$newHouseholdId = $householdUpdatePart->id . substr($lastHouseholdId, 2, 9);
		Log::info("lastHouseholdId". $lastHouseholdId . ' -> '. $newHouseholdId . ' -> '. $householdUpdatePart->id);
	    $historyArgsArr = [
            'topicName' => 'elections.household_update.execute',
            'entity_type' => config('constants.HISTORY_ENTITY_HOUSEHOLD_UPDATE'),
            'entity_id' => $householdUpdatePart->household_update_id,
            'user_create_id' => $householdUpdatePart->user_create_id,
            'models' => []
        ];
        $models = [];
        foreach($totalVoters as $voter) {
        	$model = [
                'description' => 'עדכון מספר בית אב',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voter->id,
                'valuesList' => [
                	[
	        	        'field_name' => 'household_id',
	                    'display_field_name' => config('history.Voters.household_id'),
	                    'old_value' => $voter->household_id,
	                    'new_value' => $newHouseholdId
	                ]
                ]
            ];
            $models[] = $model;
        }
        Voters::whereIn('id', $votersIds)
      			->update([
      				'household_id' => $newHouseholdId,
      				'household_update' => 1
      			]);

        $historyArgsArr['models'] = $models;
        ActionController::AddHistoryItem($historyArgsArr);
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

	public function updateHouseholdPart($householdUpdatePartId) {
		$householdUpdatePart = HouseholdUpdatePart::select('household_update_parts.*', 'household_updates.user_create_id')
								->join('household_updates', 'household_updates.id', '=', 'household_update_parts.household_update_id')
								->where('household_update_parts.id', $householdUpdatePartId)
								->where('household_update_parts.deleted', 0)
								->first();

		if ( !is_null($householdUpdatePart) ) {
            // Checking if the process id is running
            if (!is_null($householdUpdatePart->process_id) && $this->isProcessRunning($householdUpdatePart->process_id) ) {
                return;
            }

            $householdUpdatePart->process_id = getmypid();
            $householdUpdatePart->save();

            $this->parsehouseholdUpdatePart($householdUpdatePart);
            $householdUpdatePart->status = config('constants.BALLOT_BOX_FILE_PARSER_STATUS_SUCCESS');
            $householdUpdatePart->process_id = null;
            $householdUpdatePart->save();        
        }
	}
}