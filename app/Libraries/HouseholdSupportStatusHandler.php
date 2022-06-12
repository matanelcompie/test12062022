<?php

namespace App\Libraries;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Redis;
use App\Libraries\Helper;
use App\Libraries\Address;


use App\Models\Voters;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
use App\Models\HouseholdSupportStatusChanges;
use App\Models\SupportStatus;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\VoterElectionCampaigns;
use App\Models\VoterSupportStatus;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Streets;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\VotersUpdateByHouseholdSupportStatusChnages;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\CrmRequestController;
use Psr\Log\Test\LoggerInterfaceTest;


// This is the actual parser of HouseholdStatusChangeController
class HouseholdSupportStatusHandler {

    private $electionCampaignId;

 
	private $totalRowsChanged = 0;
 
    public function test( ) {
        exec("ps -ef | awk '{print $2} 2>&1'", $pids);

        return json_encode($pids);
    }

    private function processIdRunning( $processId ) {
        exec("ps -ef | awk '{print $2}'", $pids);

        if ( in_array($processId, $pids) ) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     *  This function going through relevant rows and update them
     */
    private function saveVotersSupportStatuses($taskId, $householdRow, $startFromRow) {
         $householdRow = HouseholdSupportStatusChanges::where('id' , $taskId)->first();
		 $electionsEntityType = $householdRow->household_voters_inclusion_support_status_type;
		 $entity_type = $householdRow->geographic_entity_type;
		 $entity_id = $householdRow->geographic_entity_id;
		 $ballotBoxes = BallotBox::select('ballot_boxes.id' , 'cluster_id')->withAreaCityNeighborhoodCluster()
		                          ->where('clusters.election_campaign_id' , $householdRow->election_campaign_id)
								  ->where('cities.deleted' , 0);
	    	 
		switch($entity_type){
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
			    $ballotBoxes = $ballotBoxes->where('cities.id' , $entity_id );
			    break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
			    $ballotBoxes = $ballotBoxes->where('neighborhoods.id' , $entity_id );
			    break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $ballotBoxes = $ballotBoxes->where('clusters.id' , $entity_id );
			    break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
			    $ballotBoxes = $ballotBoxes->where('ballot_boxes.id' , $entity_id );
			    break;
		}

        $ballotBoxes = $ballotBoxes->get();
        $ballotBoxIDS = 	'';
        $ballotBoxIDSArray = [];
        for($i = 0;$i < sizeof($ballotBoxes);$i++){
            $ballotBoxIDS .= $ballotBoxes[$i]->id .",";
            array_push( $ballotBoxIDSArray , $ballotBoxes[$i]->id);
        }
        $ballotBoxIDS = substr($ballotBoxIDS , 0 , strlen($ballotBoxIDS)-1);

        $electionCampaignID = $householdRow->election_campaign_id;

        $findNullDefinitionStatuses = (strpos($householdRow->household_voters_inclusion_support_status_ids , "-1") !== false ? true : false);
        $findNullActualStatuses = (strpos($householdRow->voters_inclusion_support_status_ids , "-1") !== false ? true : false);
		
		/*
        $arrayVoterIDS = [];
        //$votersArray = DB::select("select  voter_id ,household_id  from voters,voters_in_election_campaigns where voters.id = voters_in_election_campaigns.voter_id and  election_campaign_id=".$electionCampaignID." and ballot_box_id in (".$ballotBoxIDS.")");
        $votersArray =VoterElectionCampaigns::select("voter_id","household_id")
            ->join('voters' , 'voters.id' , '=','voters_in_election_campaigns.voter_id')
            ->where('election_campaign_id' , $electionCampaignID)->whereIn('ballot_box_id',$ballotBoxIDSArray)->get();

        for($i = 0 ; $i < sizeof($votersArray) ; $i++){
            array_push($arrayVoterIDS , $votersArray[$i]->voter_id);
        }
		*/

        $supportStatusesArray= str_replace("-1," , "" , $householdRow->household_voters_inclusion_support_status_ids) ;
        $supportStatusesArray = substr($supportStatusesArray , 0 , strlen($supportStatusesArray)-1);
        if($findNullDefinitionStatuses){
            if($supportStatusesArray != ''){
                //$combindexArray = DB::select("select voters.id , household_id , support_status_id , entity_type from voters left join voter_support_status on voter_support_status.voter_id = voters.id where voters.id in (".join(",",$arrayVoterIDS).")  and (support_status_id is NULL or (support_status_id in(".$supportStatusesArray.") and voter_support_status.election_campaign_id=".$electionCampaignID." and entity_type=".$householdRow->household_voters_inclusion_support_status_type." )) order by household_id");
                $combindexArray = Voters::select('voters.id' , 'household_id' , 'support_status_id','entity_type')
                    ->leftJoin('voter_support_status', function($query) {
                        $query->on('voter_support_status.voter_id' , '=' , 'voters.id')
                                ->on('voter_support_status.deleted', '=', DB::raw(0));
                    });
                    
                    //->whereIn('voters.id' , $arrayVoterIDS )
				if (count($ballotBoxIDSArray) > 0){
					$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID." and ballot_box_id in (".implode(",",$ballotBoxIDSArray)."))");
				}
				else{
					$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID.")");
				}
				Log::info("first votersIDSArray fix");
				
                $combindexArray = $combindexArray->where(function ($query) use($supportStatusesArray , $electionCampaignID , $electionsEntityType) {
                        $query->whereNull('support_status_id')->orWhere(function ($query) use($supportStatusesArray , $electionCampaignID , $electionsEntityType)
                        {
                            $query->whereIn('support_status_id', explode(",",$supportStatusesArray))
                                ->where('voter_support_status.election_campaign_id',$electionCampaignID)
                                ->where('entity_type' , $electionsEntityType)
                                ->where('voter_support_status.deleted', '=', DB::raw(0));

                        });

                    })
                    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                    ->withReligiousGroup(true)->where('religious_groups.system_name','strictly_orthodox')
                    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                    ->orderBy('household_id')
                    ->get();
            }
            else{
                //  $combindexArray = DB::select("select voters.id , household_id , support_status_id , entity_type from voters left join voter_support_status on voter_support_status.voter_id = voters.id where voters.id in (".join(",",$arrayVoterIDS).")  and (support_status_id is NULL or (voter_support_status.election_campaign_id=".$electionCampaignID." and entity_type=".$householdRow->household_voters_inclusion_support_status_type." )) order by household_id");
                $combindexArray = Voters::select('voters.id' , 'household_id' , 'support_status_id','entity_type')
                    ->join('voter_support_status' , 'voter_support_status.voter_id' , '=' , 'voters.id');
					if (count($ballotBoxIDSArray) > 0){
						$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID." and ballot_box_id in (".implode(",",$ballotBoxIDSArray)."))");
					}
					else{
						$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID.")");
					}
                    Log::info("second votersIDSArray fix");

                    //->whereIn('voters.id' , $arrayVoterIDS )
                    $combindexArray = $combindexArray->whereNull('support_status_id')
                    ->orderBy('household_id')
                    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                    ->withReligiousGroup(true)->where('religious_groups.system_name','strictly_orthodox')
                    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                    ->get();


            }
        }
        else{
            //  $combindexArray = DB::select("select voters.id , household_id , support_status_id , entity_type from voters , voter_support_status  where voters.id in (".join(",",$arrayVoterIDS).") and voter_support_status.voter_id = voters.id  and support_status_id in(".$supportStatusesArray.") and voter_support_status.election_campaign_id=".$electionCampaignID."  and entity_type=".$householdRow->household_voters_inclusion_support_status_type."  order by household_id");
            $combindexArray = Voters::select('voters.id' , 'household_id' , 'support_status_id','entity_type')
                ->join('voter_support_status' , 'voter_support_status.voter_id' , '=' , 'voters.id');
				if (count($ballotBoxIDSArray) > 0){
					$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID." and ballot_box_id in (".implode(",",$ballotBoxIDSArray)."))");
				}
				else{
					$combindexArray = $combindexArray->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID.")");
				}
				Log::info("third votersIDSArray fix");
                //->whereIn('voters.id' , $arrayVoterIDS )
                $combindexArray  = $combindexArray ->whereIn('support_status_id', explode(",",$supportStatusesArray))
                ->where('voter_support_status.election_campaign_id',$electionCampaignID)
                ->where('entity_type' , $electionsEntityType)
                ->orderBy('household_id')
                ->on('voter_support_status.deleted', '=', DB::raw(0))
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                ->withReligiousGroup(true)->where('religious_groups.system_name','strictly_orthodox')
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                ->get();
        }
        Log::info('$combindexArray');
        Log::info($combindexArray);

        $arr = array();

        $householdsCount = 0;

        foreach($combindexArray as $key => $item)
        {
            if(!array_key_exists ($item->household_id , $arr)){
                $arr[$item->household_id] = array();
            }

            array_push( $arr[$item->household_id], $item);
        }
        $foundVotersArray = array();
        $foundHouseholds = array();
        $sum=0;
        foreach($arr as $key=>$item){
            $conditionNumber = $householdRow->household_voters_inclusion_limit;
            if($householdRow->household_voters_inclusion_type == 1){

                if(sizeof($item) >= $conditionNumber )
                {
                    $householdsCount++;
                    array_push($foundHouseholds , $key);

                }

            }
            else{
                if(sizeof($item) <= $conditionNumber )
                {
                    $householdsCount++;
                    for( $j = 0;$j < sizeof($item) ;$j++){
                        array_push($foundVotersArray,$item[$j]);
                        array_push($foundHouseholds , $key);
                    }
                }
            }
        }

		/*
        $definedVotersIDS = '';
        for( $j = 0;$j < sizeof($votersArray) ;$j++){
            if(in_array($votersArray[$j]->household_id ,$foundHouseholds  )){
                array_push($foundVotersArray,$votersArray[$j]);
                $definedVotersIDS .= $votersArray[$j]->voter_id .",";
            }

        }
		*/

        $actualSupportStatusesArray= str_replace("-1," , "" , $householdRow->voters_inclusion_support_status_ids) ;
        $actualSupportStatusesArray = substr($actualSupportStatusesArray , 0 , strlen($actualSupportStatusesArray)-1);
        $definedVotersSupportStatuses = [];
        //$definedVotersIDS = substr($definedVotersIDS , 0 , strlen($definedVotersIDS)-1);
        if($findNullActualStatuses){
            $definedVotersSupportStatuses = Voters::select('voter_support_status.id as id ' , 'voters.id as voter_id' , 'support_status_id')
                ->leftJoin('voter_support_status', function($query) {
                        $query->on('voter_support_status.voter_id' , '=' , 'voters.id')
                                ->on('voter_support_status.deleted', '=', DB::raw(0));
                    });
			if (count($ballotBoxIDSArray) > 0){
				$definedVotersSupportStatuses = $definedVotersSupportStatuses->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID." and ballot_box_id in (".implode(",",$ballotBoxIDSArray)."))");
			}
			else{
				$definedVotersSupportStatuses = $definedVotersSupportStatuses->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID.")");
			}
			Log::info("fourth votersIDSArray fix");
                //->whereIn('voters.id' , explode("," , $definedVotersIDS) )
            $definedVotersSupportStatuses = $definedVotersSupportStatuses->where(function ($query) use($supportStatusesArray , $electionCampaignID , $electionsEntityType , $actualSupportStatusesArray) {
                    $query->whereNull('support_status_id')->orWhere(function ($query) use($supportStatusesArray , $electionCampaignID , $electionsEntityType , $actualSupportStatusesArray)
                    {
                        $query->whereIn('support_status_id', explode("," , $actualSupportStatusesArray))
                            ->where('voter_support_status.election_campaign_id',$electionCampaignID)
                            ->where('entity_type' , $electionsEntityType);
                    });

                })
                ->orderBy('household_id')
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                ->withReligiousGroup(true)->where('religious_groups.system_name','strictly_orthodox')
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                ->get();
            //$definedVotersSupportStatuses = DB::select("select voter_support_status.id as id , voters.id as voter_id,support_status_id from voters left join voter_support_status on voters.id = voter_support_status.voter_id  where  voters.id in(".$definedVotersIDS .") and (support_status_id is NULL or ( election_campaign_id=".$electionCampaignID." and entity_type=".$householdRow->household_voters_inclusion_support_status_type."  and support_status_id in(".$actualSupportStatusesArray.")) )");
        }
        else{
            // $definedVotersSupportStatuses = DB::select("select voter_support_status.id as id, voters.id as voter_id,support_status_id  from voters left join voter_support_status on voters.id = voter_support_status.voter_id  where  voters.id in(".$definedVotersIDS .") and election_campaign_id=".$electionCampaignID." and entity_type=".$householdRow->household_voters_inclusion_support_status_type."  and support_status_id in(".$actualSupportStatusesArray." )");
            $definedVotersSupportStatuses = Voters::select('voter_support_status.id as id ' , 'voters.id as voter_id' , 'support_status_id')
                ->leftJoin('voter_support_status', function($query) {
                        $query->on('voter_support_status.voter_id' , '=' , 'voters.id')
                                ->on('voter_support_status.deleted', '=', DB::raw(0));
                    });
                //->whereIn('voters.id' , explode("," , $definedVotersIDS) )
				if (count($ballotBoxIDSArray) > 0){
					$definedVotersSupportStatuses = $definedVotersSupportStatuses->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID." and ballot_box_id in (".implode(",",$ballotBoxIDSArray)."))");
				}
				else{
					$definedVotersSupportStatuses = $definedVotersSupportStatuses->whereRaw("voters.id in (select distinct(voter_id) from voters_in_election_campaigns,voters where voters.id=voters_in_election_campaigns.voter_id and voters_in_election_campaigns.election_campaign_id=".$electionCampaignID.")");
				}
				Log::info("fifth votersIDSArray fix");
                $definedVotersSupportStatuses = $definedVotersSupportStatuses->whereIn('support_status_id', explode("," , $actualSupportStatusesArray))
                ->where('voter_support_status.election_campaign_id',$electionCampaignID)
                ->where('entity_type' , $electionsEntityType)
                ->orderBy('household_id')
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                ->withReligiousGroup(true)->where('religious_groups.system_name','strictly_orthodox')
                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                ->get();
        }

        $supportStatuses = SupportStatus::select('id','name')->where('deleted' , 0)->where('active',1)->orderBy('id' , 'ASC')->get();
        $supportStatusesHash = [$supportStatuses];
        for($i = 0 ; $i<sizeof($supportStatuses) ;$i++){
            $supportStatusesHash[$supportStatuses[$i]->id] = $supportStatuses[$i]->name;

        }

        $fieldsArray = [];
        $changedValues = [];
        $historyArgsArr = [
            'topicName' => 'elections.household_support_status_change.execute',
            'user_create_id' => $householdRow->user_create_id,
            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_HOUSEHOLD_STATUS_CHANGE'),
            'entity_id' => $householdRow->id,
            'models' => []
        ];

        for($i = 0 ; $i<sizeof( $definedVotersSupportStatuses ) ; $i++){
			Redis::set('services:status:'.$householdRow->id, 1,'EX', 30);
            //  Log::info("process row number ".$i);
            if($i >= $startFromRow ){
                if(!$definedVotersSupportStatuses[$i]->support_status_id){
                    VotersUpdateByHouseholdSupportStatusChnages::insert(['household_support_status_change_id'=>$taskId ,
                        'voter_id'=>$definedVotersSupportStatuses[$i]->voter_id ,
                        'old_support_status_id'=>NULL ,
                        'new_support_status_id'=>$householdRow->selected_support_status_id]);

                    $householdRow->updated_voters_count =  $householdRow->updated_voters_count + 1;
                    $householdRow->save();

                    array_push($fieldsArray , ['support_status_id', 'סטטטוס תמידה', NULL,
                        $supportStatusesHash[$householdRow->selected_support_status_id]]);

                    $newVoterSupportStatus = new VoterSupportStatus;
                    $newVoterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
                    $newVoterSupportStatus->election_campaign_id = $electionCampaignID;
                    $newVoterSupportStatus->voter_id = $definedVotersSupportStatuses[$i]->voter_id ;
                    $newVoterSupportStatus->entity_type = $householdRow->household_voters_inclusion_support_status_type;
                    $newVoterSupportStatus->support_status_id = $householdRow->selected_support_status_id;
                    $newVoterSupportStatus->create_user_id = $householdRow->user_create_id;
                    $newVoterSupportStatus->update_user_id = $householdRow->user_create_id;
                    $newVoterSupportStatus->save();

                    $supportStatusFields = [
                        'election_campaign_id',
                        'voter_id',
                        'entity_type',
                        'support_status_id'
                    ];

                    for ( $fieldIndex = 0; $fieldIndex < count($supportStatusFields); $fieldIndex++ ) {
                        $fieldName = $supportStatusFields[$fieldIndex];

                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                            'new_numeric_value' => $newVoterSupportStatus->{$fieldName}
                        ];
                    }

                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $newVoterSupportStatus->id,
                        'valuesList' => $changedValues
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
                else{
                    VotersUpdateByHouseholdSupportStatusChnages::insert(['household_support_status_change_id'=>$taskId , 'voter_id'=>$definedVotersSupportStatuses[$i]->voter_id , 'old_support_status_id'=>$definedVotersSupportStatuses[$i]->support_status_id , 'new_support_status_id'=>$householdRow->selected_support_status_id]);

                    $householdRow->updated_voters_count =  $householdRow->updated_voters_count + 1;
                    $householdRow->save();

                    $voterSupportStatus = VoterSupportStatus::where('id' , $definedVotersSupportStatuses[$i]->id)->first();

                    $oldValue = $voterSupportStatus->support_status_id;
                    $voterSupportStatus->support_status_id  = $householdRow->selected_support_status_id;
                    $voterSupportStatus->update_user_id     = $householdRow->user_create_id;
                    $voterSupportStatus->save();

                    if ( $oldValue != $voterSupportStatus->support_status_id ) {
                        $historyArgsArr['models'][] = [
                            'referenced_model' => 'VoterSupportStatus',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $voterSupportStatus->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'support_status_id',
                                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                    'old_numeric_value' => $oldValue,
                                    'new_numeric_value' => $voterSupportStatus->support_status_id
                                ]
                            ]
                        ];
                    }
                }
            }
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }

        $householdRow->change_status =  config('constants.SERVICE_STATUS_FINISHED');
        $householdRow->save();
    }

 


 
    public function updateSupportStatuses( $taskId ) {
		$householdRow = HouseholdSupportStatusChanges::where('id' , $taskId)->first();
		$startFromRow = 0;
		if($householdRow){
			  switch ( $householdRow->change_status ) {
                  // The process didn't start yet
                  case config('constants.SERVICE_STATUS_DID_NOT_START'):

                      $updates = [
                         'process_id' => getmypid(),
                         'change_status'     => config('constants.SERVICE_STATUS_AT_WORK')
                     ];
                     HouseholdSupportStatusChanges::where('id' , $taskId)->update( $updates );

                    // Start from row 0.
                    $startFromRow = 0;
                    break;

                 // The process at work or has been stopped
                 case config('constants.SERVICE_STATUS_AT_WORK'):
                    // Checking if the process id is running
					 if ( !is_null($householdRow->process_id) &&  Redis::get('services:status:'.$householdRow->id)) {
                    //if ( $this->processIdRunning($householdRow->process_id) ) {
                        // If the file procees is running, don't interupt.
                        return;
                    } 
					else 
					{
                    // If the procees is not running, then the parsing
                    // has been stopped, and will be executed from the
                    // last row taht was processed.
                    $updates = [
                        'process_id' => getmypid()
                    ];
                    HouseholdSupportStatusChanges::where('id' , $taskId)->update( $updates );

                    // Start processing the row after the
                    // last row that was processed
					 
					$startFromRow = $householdRow->updated_voters_count ;
					 
                    }
                break;

                // The parsing ended successfully.
               case config('constants.SERVICE_STATUS_FINISHED'):
                   return;
                   break;
             }
			 $this->saveVotersSupportStatuses($taskId, $householdRow, $startFromRow);
			// echo json_encode( "Command pid: " . getmypid() );
		}
        else{
		//	Log::info("Error:row doesn't exist in database so won't be processed");
			
		}
    }
}