<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Jobs\updateSupportStatusesJob;
use App\Libraries\Helper;
use App\Libraries\HouseholdSupportStatusHandler;
use App\Models\Area;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\HouseholdSupportStatusChanges;
use App\Models\Neighborhood;
use App\Models\SubArea;
use App\Models\SupportStatus;
use App\Models\VoterElectionCampaigns;
use App\Models\Voters;
use App\Models\VotersUpdateByHouseholdSupportStatusChnages;
use Illuminate\Support\Facades\Redis;

use Auth;
use Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseholdStatusChangeController extends Controller
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('name',true);
    }
    /*
    Get support-status-update excel file of updated voters
     */
    public function getUpdateJobExcelFileDataByKey($key)
    {
        
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.household_support_status_change')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $newData = VotersUpdateByHouseholdSupportStatusChnages::select('first_name', 'last_name', 'personal_identity', 'voters_update_by_household_support_status_chnages.voter_id', 'old_support_status_id', 'new_support_status_id')->withUpdateSourceRow()->withVoter()->where('household_support_status_changes.key', $key)->get();
        $data = array();
        $supportStatuses = SupportStatus::select('id', 'name')->where('deleted', 0)->where('active',1)->orderBy('id', 'ASC')->get();
        $supportStatusesHash = [];
        for ($i = 0; $i < sizeof($supportStatuses); $i++) {
            $supportStatusesHash[$supportStatuses[$i]->id] = $supportStatuses[$i]->name;

        }
        for ($i = 0; $i < sizeof($newData); $i++) {
            array_push($data, ["ת.ז." => $newData[$i]->personal_identity, "שם תושב" => ($newData[$i]->first_name . ' ' . $newData[$i]->last_name), "סטטוס קודם" => ($newData[$i]->old_support_status_id ? $supportStatusesHash[$newData[$i]->old_support_status_id] : '-'), "סטטוס נוכחי" => $supportStatusesHash[$newData[$i]->new_support_status_id]]);
        }
        //array_push($data , ["שם תושב" , "סטטוס קודם" , "סטטוס נוכחי"]);
        Excel::create("תושבים שעודכנו", function ($excel) use ($data) {
            $excel->sheet('ExportFile', function ($sheet) use ($data) {
                $sheet->fromArray($data);
                $sheet->setRightToLeft(true);
            });
        })->export('xls');
        $jsonOutput->setData("ok");
    }

    /*
    Get support-status-update stats data by row-key
     */
    public function getUpdateJobDataByKey($updateKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.household_support_status_change')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
		
		$runningFile = HouseholdSupportStatusChanges::select("id" , "process_id")->where(['change_status'=>config('constants.SERVICE_STATUS_AT_WORK') , 'key' => $updateKey])->first();
		if ($runningFile){
			if (!Redis::get('services:status:'.$runningFile->id)){
				HouseholdSupportStatusChanges::where('id',$runningFile->id)->update(['change_status'=> config('constants.SERVICE_STATUS_ERROR') , 'process_id'=>NULL]);
			}
			//if (!in_array($runningFile->process_id, $pids)){
				//VoteFiles::where('id',$runningFile->id)->update(['status'=> config('constants.VOTE_FILE_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			//}
		}
		
        if (Auth::user()->admin == 1) {
            $updateJob = HouseholdSupportStatusChanges::where('key', $updateKey)->first();
        } else {
            $updateJob = HouseholdSupportStatusChanges::where('key', $updateKey)->where('user_create_id', Auth::user()->id)->first();
        }
        if ($updateJob) {
            $finalSupportStatus = SupportStatus::select('name')->where('deleted', 0)->where('active',1)->where('id', $updateJob->selected_support_status_id)->first();
            if ($finalSupportStatus) {
                $updateJob->final_support_status_name = $finalSupportStatus->name;
            } else {
                $updateJob->final_support_status_name = '';

            }
            $updateJob->support_status_type_name = ($updateJob->household_voters_inclusion_support_status_type == 0 ? 'סניף' : ($updateJob->household_voters_inclusion_support_status_type == 1 ? 'TM' : 'סופי'));
            $updateJob->area_name = '';
            $updateJob->sub_area_name = '';
            $updateJob->city_name = '';
            $updateJob->neighborhood_name = '';
            $updateJob->cluster_name = '';
            $updateJob->ballotbox_name = '';

            switch ($updateJob->geographic_entity_type) {
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'): //city
                    $city = City::select('id', 'name', 'area_id', 'sub_area_id')->where('deleted', 0)->where('id', $updateJob->geographic_entity_id)->first();
                    if ($city) {
                        $updateJob->city_name = $city->name;
                        $subArea = SubArea::select('name')->where('deleted', 0)->where('id', $city->sub_area_id)->first();
                        if ($subArea) {
                            $updateJob->sub_area_name = $subArea->name;
                        }
                        $area = Area::select('name')->where('deleted', 0)->where('id', $city->area_id)->first();
                        if ($area) {
                            $updateJob->area_name = $area->name;
                        }
                    }
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'): //neighborhood
                    $neighborhood = Neighborhood::select('id', 'name', 'city_id')->where('deleted', 0)->where('id', $updateJob->geographic_entity_id)->first();
                    if ($neighborhood) {
                        $updateJob->neighborhood_name = $neighborhood->name;
                        $city = City::select('id', 'name', 'area_id', 'sub_area_id')->where('deleted', 0)->where('id', $neighborhood->city_id)->first();
                        if ($city) {
                            $updateJob->city_name = $city->name;
                            $subArea = SubArea::select('name')->where('deleted', 0)->where('id', $city->sub_area_id)->first();
                            if ($subArea) {
                                $updateJob->sub_area_name = $subArea->name;
                            }
                            $area = Area::select('name')->where('deleted', 0)->where('id', $city->area_id)->first();
                            if ($area) {
                                $updateJob->area_name = $area->name;
                            }
                        }
                    }
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'): //cluster
                    $cluster = Cluster::select('id', DB::raw($this->fullClusterNameQuery), 'city_id', 'neighborhood_id')->where('election_campaign_id', ElectionCampaigns::currentCampaign()['id'])->where('id', $updateJob->geographic_entity_id)->first();
                    if ($cluster) {
                        $neighborhood = Neighborhood::select('id', 'name', 'city_id')->where('deleted', 0)->where('id', $cluster->neighborhood_id)->first();
                        if ($neighborhood) {
                            $updateJob->neighborhood_name = $neighborhood->name;
                        }
                        $updateJob->cluster_name = $cluster->name;
                        $city = City::select('id', 'name', 'area_id', 'sub_area_id')->where('deleted', 0)->where('id', $cluster->city_id)->first();
                        if ($city) {
                            $updateJob->city_name = $city->name;
                            $subArea = SubArea::select('name')->where('deleted', 0)->where('id', $city->sub_area_id)->first();
                            if ($subArea) {
                                $updateJob->sub_area_name = $subArea->name;
                            }
                            $area = Area::select('name')->where('deleted', 0)->where('id', $city->area_id)->first();
                            if ($area) {
                                $updateJob->area_name = $area->name;
                            }
                        }
                    }
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'): //ballotbox_id

                    $ballotbox = BallotBox::select('id', 'cluster_id', 'mi_id')->where('id', $updateJob->geographic_entity_id)->first();
                    if ($ballotbox) {
                        $updateJob->ballotbox_name = $ballotbox->id;
                        $cluster = Cluster::select('id',DB::raw($this->fullClusterNameQuery), 'city_id', 'neighborhood_id')->where('election_campaign_id', ElectionCampaigns::currentCampaign()['id'])->where('id', $ballotbox->id)->first();
                        if ($cluster) {
                            $neighborhood = Neighborhood::select('id', 'name', 'city_id')->where('deleted', 0)->where('id', $cluster->neighborhood_id)->first();
                            if ($neighborhood) {
                                $updateJob->neighborhood_name = $neighborhood->name;
                            }
                            $updateJob->cluster_name = $cluster->name;
                            $city = City::select('id', 'name', 'area_id', 'sub_area_id')->where('deleted', 0)->where('id', $neighborhood->city_id)->first();
                            if ($city) {
                                $updateJob->city_name = $city->name;
                                $subArea = SubArea::select('name')->where('deleted', 0)->where('id', $city->sub_area_id)->first();
                                if ($subArea) {
                                    $updateJob->sub_area_name = $subArea->name;
                                }
                                $area = Area::select('name')->where('deleted', 0)->where('id', $city->area_id)->first();
                                if ($area) {
                                    $updateJob->area_name = $area->name;
                                }
                            }
                        }
                    }
                    break;
            }
        }
        $jsonOutput->setData($updateJob);
    }

    /*
    for admin it will return all jobs of all users ,and for regular user-  the jobs he created only
     */
    public function getUserJobsList()
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.household_support_status_change')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
		$runningFiles = HouseholdSupportStatusChanges::select("id" , "process_id")->where([   'change_status'=>config('constants.SERVICE_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningFiles);$i++){
			$item = $runningFiles[$i];
			if (!Redis::get('services:status:'.$item->id)){
				HouseholdSupportStatusChanges::where('id',$item->id)->update(['change_status'=> config('constants.SERVICE_STATUS_ERROR') , 'process_id'=>NULL]);
			}
		}
		
        $electionCampaignID = ElectionCampaigns::currentCampaign()['id'];
        $fieldsToSelect = ['household_support_status_changes.key as update_key', 'household_support_status_changes.name', 'selected_households_count', 'updated_voters_count', 'first_name', 'last_name', 'household_support_status_changes.updated_at'];
        if (Auth::user()->admin == 1) {
            $jsonOutput->setData(HouseholdSupportStatusChanges::select($fieldsToSelect)->where('election_campaign_id', $electionCampaignID)->withUserVoter()->get());
        } else {
            $jsonOutput->setData(HouseholdSupportStatusChanges::select($fieldsToSelect)->where('election_campaign_id', $electionCampaignID)->where('household_support_status_changes.user_create_id', Auth::user()->id)->withUserVoter()->get());
        }
    }

    /*
    Add new task of household-status-update to database and task scheduler
     */
    public function addSupportStatusChangeTask(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.household_support_status_change.add') || !GlobalController::isActionPermitted('elections.household_support_status_change.execute')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $newUpdateTask = new HouseholdSupportStatusChanges;
        $name = $request->input('name');
        $newUpdateTask->name = $name;
        $newUpdateTask->key = Helper::getNewTableKey('household_support_status_changes', 5);
        $newUpdateTask->election_campaign_id = ElectionCampaigns::currentCampaign()['id'];
        $newUpdateTask->user_create_id = Auth::user()->id;

        $newUpdateTask->household_voters_inclusion_type = (int) $request->input('household_voters_inclusion_type');
        $newUpdateTask->household_voters_inclusion_limit = (int) $request->input('household_voters_inclusion_limit');
        $newUpdateTask->household_voters_inclusion_support_status_type = (int) $request->input('household_voters_inclusion_support_status_type');

        $newUpdateTask->geographic_entity_type = (int) $request->input('entity_type');
        $newUpdateTask->geographic_entity_id = (int) $request->input('entity_id');

        $newUpdateTask->household_voters_inclusion_support_status_ids = $request->input('defined_support_statuses');
        $newUpdateTask->voters_inclusion_support_status_ids = $request->input('actual_support_statuses');

        $newUpdateTask->selected_support_status_id = (int) $request->input('selected_support_status_id');
        $newUpdateTask->geographic_households_count = (int) $request->input('total_households_count_in_geo_entity');
        $newUpdateTask->geographic_voters_count = (int) $request->input('total_voters_count_in_geo_entity');
        $newUpdateTask->selected_households_count = (int) $request->input('total_households_count');
        $newUpdateTask->selected_voters_count = (int) $request->input('total_voters_count');

        $newUpdateTask->change_status = 0;
        $newUpdateTask->updated_voters_count = 0;
        $newUpdateTask->save();

        /*ActionController::AddHistoryItem('elections.household_support_status_change.add', $newUpdateTask->id,
        'UpdateSupportStatusHousehold');*/
        $taskFields = [
            'name',
            'election_campaign_id',
            'geographic_entity_type',
            'geographic_entity_id',
            'household_voters_inclusion_type',
            'household_voters_inclusion_limit',
            'household_voters_inclusion_support_status_ids',
            'household_voters_inclusion_support_status_type',
            'voters_inclusion_support_status_ids',
            'selected_support_status_id',
            'change_status',
            'geographic_households_count',
            'geographic_voters_count',
            'selected_households_count',
            'selected_voters_count',
            'updated_voters_count',
        ];

        $changedValues = [];
        for ($fieldIndex = 0; $fieldIndex < count($taskFields); $fieldIndex++) {
            $fieldName = $taskFields[$fieldIndex];

            switch ($fieldName) {
                case 'name':
                case 'household_voters_inclusion_support_status_ids':
                case 'voters_inclusion_support_status_ids':
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.HouseholdSupportStatusChanges.' . $fieldName),
                        'new_value' => $newUpdateTask->{$fieldName},
                    ];
                    break;

                default:
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.HouseholdSupportStatusChanges.' . $fieldName),
                        'new_numeric_value' => $newUpdateTask->{$fieldName},
                    ];
                    break;
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.household_support_status_change.add',
            'models' => [
                [
                    'referenced_model' => 'HouseholdSupportStatusChanges',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newUpdateTask->id,
                    'valuesList' => $changedValues,
                ],
            ],
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $job = (new updateSupportStatusesJob(new HouseholdSupportStatusHandler(), $newUpdateTask->id))->onConnection('redis')->onQueue('status');
        
        $this->dispatch($job);

        $jsonOutput->setData("ok");
    }

    /*
    Fetch stat-results about voters that are going to be updated in service
     */
    public function searchVotersByParams(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.household_support_status_change')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $returnedDataArray = [];
        $areaKey = $request->input('area_key' , null);
        $cityKey = $request->input('city_key', null);
        $neighborhoodKey = $request->input('neighborhood_key', null);
        $clusterKey = $request->input('cluster_key', null);
        $ballotBoxID = $request->input('ballotbox_id', null);

	 
        if ($request->input('selected_support_status_entity_type') == null || trim($request->input('selected_support_status_entity_type')) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }
        if ($request->input('defined_support_statuses') == null || trim($request->input('defined_support_statuses')) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }

        $supportStatusEntityTypeID = null;
        if (true) {
            $supportStatusEntityTypeID = 0;
        }
        $electionCampaignID = ElectionCampaigns::currentCampaign()['id'];

        $ballotBoxes = BallotBox::select('ballot_boxes.id', 'cluster_id')->withAreaCityNeighborhoodCluster()
            ->where('clusters.election_campaign_id', $electionCampaignID)
            ->where('cities.deleted', 0);

        $andAreaKey = "";
        $andCityKey = "";
        $andNeighborhoodKey = "";
        $andClusterKey = "";
        $andBallotboxId = "";
        if ($areaKey) {
            $ballotBoxes = $ballotBoxes->where('areas.key', $areaKey);
        }
        if ($cityKey) {
            $isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

            if (!$isAllowed) {
                $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
                return;
            }
            $ballotBoxes = $ballotBoxes->where('cities.key', $cityKey);
        }
        if ($neighborhoodKey) {
            $ballotBoxes = $ballotBoxes->where('neighborhoods.key', $neighborhoodKey);
        }
        if ($clusterKey) {
            $ballotBoxes = $ballotBoxes->where('clusters.key', $clusterKey);
        }
        if ($ballotBoxID) {
            $ballotBoxes = $ballotBoxes->where('ballot_boxes.id', $ballotBoxID);
        }
        $ballotBoxes = $ballotBoxes->get();
        $ballotBoxIDS = '';
        $ballotBoxIDSArray = [];
        for ($i = 0; $i < sizeof($ballotBoxes); $i++) {
            $ballotBoxIDS .= $ballotBoxes[$i]->id . ",";
            array_push($ballotBoxIDSArray, $ballotBoxes[$i]->id);
        }
        $ballotBoxIDS = substr($ballotBoxIDS, 0, strlen($ballotBoxIDS) - 1);
        $returnedDataArray['geographic_voters_count'] = VoterElectionCampaigns::where('election_campaign_id', $electionCampaignID)
        // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
        ->withVoter()->join('religious_groups', 'religious_groups.id', 'voters.religious_group_id')->where('religious_groups.system_name','strictly_orthodox')
        // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
        ->whereIn('ballot_box_id', $ballotBoxIDSArray)->count()
        ;
        $returnedDataArray['geographic_households_count'] = Voters::select('household_id')
        // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
        ->join('religious_groups', 'religious_groups.id', 'voters.religious_group_id')->where('religious_groups.system_name','strictly_orthodox')
        // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
        ->whereIn('voters.id', function ($query) use ($electionCampaignID, $ballotBoxIDSArray) {
            $query->select('voter_id')
                ->from(with(new VoterElectionCampaigns)->getTable())
                ->where('election_campaign_id', $electionCampaignID)
                ->whereIn('ballot_box_id', $ballotBoxIDSArray);
                
        })->groupBy('household_id')->pluck('household_id')->count();
            

        $aboveBelowNumber = (int) $request->input('definition_above_number');
        if ($aboveBelowNumber == 0) {$aboveBelowNumber++;}

        $supportStatusesArray = json_decode($request->input('defined_support_statuses'), true);

        if (!is_array($supportStatusesArray) || sizeof($supportStatusesArray) == 0) {$jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));return;}
        $isNotNumericArray = false;
        $findNullStatuses = false;
        for ($i = 0; $i < sizeof($supportStatusesArray); $i++) {
            if ((int) $supportStatusesArray[$i] == 0) {
                $isNotNumericArray = true;
                break;
            }
            if ((int) $supportStatusesArray[$i] == -1) {
                $findNullStatuses = true;
            }
        }

        if ($isNotNumericArray) {$jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));return;}
        $arrayVoterIDS = [];
        $votersArray = VoterElectionCampaigns::select("voter_id", "household_id")
            ->join('voters', 'voters.id', '=', 'voters_in_election_campaigns.voter_id')
            ->where('election_campaign_id', $electionCampaignID)->whereIn('ballot_box_id', $ballotBoxIDSArray)
            // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
            ->join('religious_groups', 'religious_groups.id', 'voters.religious_group_id')->where('religious_groups.system_name','strictly_orthodox')
            
            // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
            ->get();

        for ($i = 0; $i < sizeof($votersArray); $i++) {
            array_push($arrayVoterIDS, $votersArray[$i]->voter_id);

        }
        Log::info('$arrayVoterIDS');
        Log::info($arrayVoterIDS);

        $combindexCollection =collect([]);
        $electionsEntityType = (int) $request->input('selected_support_status_entity_type');

        if ($findNullStatuses) {
			//   $start = microtime(true);
			// echo(20000);
            foreach (array_chunk($arrayVoterIDS, 20000) as $voterIDSBatch) { //Get only 20000 votersId every query
            $combindexArrayBatch = Voters::select('voters.id', 'household_id', 'support_status_id', 'entity_type')
                ->leftJoin('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
                ->whereIn('voters.id', $voterIDSBatch)
                ->where(function ($query) use ($supportStatusesArray, $electionCampaignID, $electionsEntityType) {
                    $query->whereNull('support_status_id')->orWhere(function ($query) use ($supportStatusesArray, $electionCampaignID, $electionsEntityType) {
                        $query->whereIn('support_status_id', $supportStatusesArray)
                            ->where('voter_support_status.election_campaign_id', $electionCampaignID)
                            ->where('entity_type', $electionsEntityType)
                            ->where('voter_support_status.deleted', '=', DB::raw(0));
                    });
                })
                // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                ->join('religious_groups', 'religious_groups.id', 'voters.religious_group_id')->where('religious_groups.system_name','strictly_orthodox')
                // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                ->orderBy('household_id')
				->get();
                $combindexCollection = $combindexCollection->merge( $combindexArrayBatch);
            }
            // echo $combindexArray->toSql();
            //echo "select voters.id , household_id , support_status_id , entity_type from voters left join voter_support_status on voter_support_status.voter_id = voters.id where  voters.id in (".join(",",$arrayVoterIDS).")   and (support_status_id is NULL or (support_status_id in(".join(",",$supportStatusesArray).")  and voter_support_status.election_campaign_id=".$electionCampaignID." and entity_type=".(int)$request->input('selected_support_status_entity_type')." )) order by household_id";
            //echo PHP_EOL;
            //$combindexArray = DB::select("select voters.id , household_id , support_status_id , entity_type from voters left join voter_support_status on voter_support_status.voter_id = voters.id where  voters.id in (".join(",",$arrayVoterIDS).")   and (support_status_id is NULL or (support_status_id in(".join(",",$supportStatusesArray).")  and voter_support_status.election_campaign_id=".$electionCampaignID." and entity_type=".(int)$request->input('selected_support_status_entity_type')." )) order by household_id");
            //  $time_elapsed_secs = microtime(true) - $start;
        } else {
            foreach (array_chunk($arrayVoterIDS, 20000) as $voterIDSBatch) { //Get only 20000 votersId every query
                $combindexArrayBatch = Voters::select('voters.id', 'household_id', 'support_status_id', 'entity_type')
                    ->join('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
                    ->whereIn('voters.id', $voterIDSBatch)
                    ->whereIn('support_status_id', $supportStatusesArray)
                    ->where('voter_support_status.deleted', '=', DB::raw(0))
                    ->where('voter_support_status.election_campaign_id', $electionCampaignID)
                    ->where('entity_type', $electionsEntityType)
                    ->orderBy('household_id')
                    // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only strictly_orthodox
                    ->join('religious_groups', 'religious_groups.id', 'voters.religious_group_id')->where('religious_groups.system_name','strictly_orthodox')
                    // //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! End only strictly_orthodox
                    ->get();
                // dd($voterIDSBatch,$combindexArrayBatch);
				$combindexCollection = $combindexCollection->merge($combindexArrayBatch);
            }

            //$combindexArray = DB::select("select voters.id , household_id , support_status_id , entity_type from voters , voter_support_status  where voters.id in (".join(",",$arrayVoterIDS).") and voter_support_status.voter_id = voters.id  and support_status_id in(".join(",",$supportStatusesArray).") and voter_support_status.election_campaign_id=".$electionCampaignID."  and entity_type=".(int)$request->input('selected_support_status_entity_type')."  order by household_id");
        }
        $arr = [];
        Log::info('$combindexCollection');
        Log::info($combindexCollection->toArray());
        $householdsCount = 0;
// dd($combindexCollection);
        foreach ($combindexCollection as $item) {
            if (!array_key_exists($item->household_id, $arr)) {
                $arr[$item->household_id] = [];
            }

            array_push($arr[$item->household_id], $item);
        }
        $foundVotersArray = array();
        $foundHouseholds = array();
        $sum = 0;
        foreach ($arr as $key => $item) {
            $conditionNumber = (int) $request->input('definition_above_number');
            if ((int) $request->input('definition_above') == 1) {

                if (sizeof($item) >= $conditionNumber) {
                    $householdsCount++;
                    array_push($foundHouseholds, $key);

                }

            } else {
                if (sizeof($item) < $conditionNumber) {
                    $householdsCount++;
                    for ($j = 0; $j < sizeof($item); $j++) {
                        array_push($foundVotersArray, $item[$j]);
                        array_push($foundHouseholds, $key);
                    }
                }
            }
        }

        for ($j = 0; $j < sizeof($votersArray); $j++) {
            if (in_array($votersArray[$j]->household_id, $foundHouseholds)) {
                array_push($foundVotersArray, $votersArray[$j]);
            }

        }

        ksort($arr, SORT_NUMERIC);
        $returnedDataArray['selected_voters_count'] = sizeof($foundVotersArray);
        $returnedDataArray['selected_households_count'] = $householdsCount;

        //  echo  $time_elapsed_secs;
        $jsonOutput->setData($returnedDataArray);

    }

}
