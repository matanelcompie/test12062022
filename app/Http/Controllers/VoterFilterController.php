<?php

namespace App\Http\Controllers;

use App\Libraries\ListFunctions;
use App\Libraries\Services\FilterUniqueVotersService;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\VoterFilterQueryService;
use App\Libraries\Services\VoterFilterService;
use App\Models\VoterFilter\GeographicVoterFilter;
use App\Models\VoterFilter\VoterFilter;
use App\Models\VoterFilter\VoterFilterDefinition;
use App\Models\Tm\TelemarketingVoterPhone;
use Illuminate\Http\Request;
use App\Models\Tm\Campaign;

class VoterFilterController extends Controller
{
	/*
		Function that returns VoterFilterDefinitionValues by id and POST params , 
		and calls to dynamic function if it's needed
	*/
    public function getDefinitionValues(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $modelListFunction = VoterFilterDefinition::select(['model_list_function'])
            ->where('id', $key)->first()->makeVisible(['model_list_function'])['model_list_function'];

        $values = $request->has('values') ? json_decode($request->input('values'), true) : array();
        $electionCampaign = $request->has('election_campaign') ? $request->input('election_campaign') : false;
        $result = array();

        if (count($values) && (method_exists(new ListFunctions(), $modelListFunction))) {
            $result = ListFunctions::$modelListFunction($values, $electionCampaign);
        }

        $jsonOutput->setData($result);
    }

    public function getVotersFilterQuery($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $voterFilter = VoterFilter::findByKey($key)->fresh();
        $result = VoterFilterQueryService::generateVoterFilterQuery($voterFilter);
        $jsonOutput->setData($result);
    }

	/*
		Function that returns VoterFilterDefinitions by moduleName
	*/
    public function getDefinitions($moduleName)
    {
        $jsonOutput = app()->make("JsonOutput");
        $filterDefinitions = VoterFilterService::getFilterDefinitions($moduleName);
        $jsonOutput->setData($filterDefinitions);
 
    }

    public function getVoterFilter($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $voterFilter = VoterFilter::findByKey($key);
        $jsonOutput->setData($voterFilter);
    }

	/*
		Function that add new VoterFilter
		
		@param $request
		@param $parentKey
		@param $moduleName
	*/
    public function addVoterFilter(Request $request, $parentKey, $moduleName)
    {
        $jsonOutput = app()->make("JsonOutput");
        $apiPayload = $request->all();
        $entityType = VoterFilter::ENTITY_TYPES[$moduleName];
        $apiPayload['entity_type'] = $entityType['type_id'];
        $apiPayload['entity_id'] = null;

		$modelsList = [];
		$fieldsArray = [];

        if($entityType['parent_model']){
            $fields = ($moduleName != 'portion') ? ['id'] : ['id', 'finished_portions'];
            $parentEntity = $entityType['parent_model']::select($fields)->where('key', $parentKey)->first();
            if(!$parentEntity){
                $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY')); return;
            }
            $apiPayload['entity_id'] = $parentEntity->id;
        }else{
            $jsonOutput->setErrorCode(config('errors.system.MISSING_PARAMS')); return;
        }

        $filterItems = [];

        if (isset($apiPayload['filter_items'])) {
            $filterItems = $apiPayload['filter_items'];
            unset($apiPayload['filter_items']);
        }
        if (!empty($apiPayload['name'])) {
			
			
			
            // Define last filter order:
            $lastFilterRaw =  VoterFilter::select('order')
            ->where(['entity_type' => $apiPayload['entity_type'], 'entity_id' => $apiPayload['entity_id']])
            ->orderBy('order','desc')->first();
            if(isset($lastFilterRaw->order)){ $apiPayload['order'] = $lastFilterRaw->order + 1; }
            
            $voterFilter = VoterFilter::create($apiPayload); 
            if($moduleName == 'portion' && $parentEntity->finished_portions == 1){ //Update finished portions mode in campaign.
                $parentEntity->finished_portions = 0;
                $parentEntity->save();
            }
        } else {
            $jsonOutput->setErrorCode(400);
            $jsonOutput->setErrorMessage('Missing name!');
            return;
        }

        if (count($filterItems)) {
            VoterFilterService::updateFilterItems($filterItems, $voterFilter);
        }
		if($request->input('module_src') == 'telemarketing'){
			    //json_encode($filterItems);
				$fieldsArray[] = [
						'field_name' => 'name',
						'display_field_name' => config('history.CampaignPortions.name'),
						'new_value' => $apiPayload['name'] 
				];
				$fieldsArray[] = [
						'field_name' => 'items',
						'display_field_name' => config('history.CampaignPortions.items'),
						'new_value' => json_encode($filterItems) 
				];
				
				$modelsList[] = [
						'description' => 'הוספת מנה לקמפיין קיים',
						'referenced_model' => 'TmCampaignPortion',
						'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
						'referenced_id' => $voterFilter->id,
						'valuesList' => $fieldsArray
				];
		
				$historyArgsArr = [
						'topicName' => ('tm.campaign.portions.add'),
						'models' => $modelsList,
				];
				ActionController::AddHistoryItem($historyArgsArr);
		
		}
		
        $jsonOutput->setData($voterFilter->fresh());
    }

	/*
		Function that updates specific VoterFilter by its key and POST params
	*/
    public function updateVoterFilter(Request $request, $key = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        $voterFilter = VoterFilter::findByKey($key)->makeVisible('entity_type', 'entity_id');

        if (!$voterFilter) {
            $jsonOutput->setErrorCode(config('errors.tm.THERE_IS_NO_REFERENCE_KEY_OR_KEY_NOT_EXISTS'));
            return;
        }
		
		$fieldsArray=[];
		$modelsList=[];
		$oldPortionName = $voterFilter->name;
		
		$oldPortionItems=json_encode($voterFilter->voter_filter_items()->get());

		
        $portionType =VoterFilter::ENTITY_TYPES['portion']['type_id'];

        if($voterFilter->entity_type == $portionType){ // If type is campaign portion.
            $campaign = Campaign::select('id', 'current_portion_id', 'finished_portions')
            ->where('id', $voterFilter->entity_id)->first();
            if(!$campaign){
                $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY')); return;
            }
            $voterFilterId = $voterFilter->id;
            $allowToEdit = VoterFilterService::checkIfCanEditPortion($campaign, [$voterFilterId]);
            if(!$allowToEdit){
                $jsonOutput->setErrorCode(config('errors.tm.NOT_ALLOW_TO_EDIT_PORTION')); return;
            }
            if( $campaign->finished_portions == 1){ //Update finished portions mode in campaign.
                $campaign->finished_portions = 0;
                $campaign->save();
            }
        }
		
		$data = $request->all();
		if($request->input('module_src') == 'telemarketing'){
			if($data['name'] != $voterFilter->name){
				$fieldsArray[] = [
						'field_name' => 'name',
						'display_field_name' => config('history.CampaignPortions.name'),
						'new_value' => $data['name'],
						'old_value' => $voterFilter->name ,
				];
			}
			if(json_encode($data['filter_items']) != $oldPortionItems){
				$fieldsArray[] = [
						'field_name' => 'name',
						'display_field_name' => config('history.CampaignPortions.items'),
						'new_value' => json_encode($data['filter_items']),
						'old_value' => $oldPortionItems ,
				];
			} 
			
		}
		
        if ($request->has('groupKey')) {
            VoterFilterService::updateFilterItemsByType($request->input('filterItems'), $voterFilter, $request->input('groupKey'));
        } else {
            
            if (isset($data['filter_items'])) {
                $filterItems = $data['filter_items'];
                unset($data['filter_items']);
                VoterFilterService::updateFilterItems($filterItems, $voterFilter);
            }
            $voterFilter->update($data);
        }
		if($request->input('module_src') == 'telemarketing'){
			if(count($fieldsArray) > 0){
				$modelsList[] = [
						'description' => 'עריכת מנה קיימת בקמפיין',
						'referenced_model' => 'TmCampaignPortion',
						'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
						'referenced_id' => $voterFilter->id,
						'valuesList' => $fieldsArray
				];
		
				$historyArgsArr = [
						'topicName' => ('tm.campaign.portions.EDIT'),
						'models' => $modelsList,
				];
				ActionController::AddHistoryItem($historyArgsArr);
			}
		}
		
        $jsonOutput->setData('');
    }

	/*
		Function that deletes specific VoterFilter by its key and POST params
	*/
    public function deleteVoterFilter(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key) {
            $voterFilter = VoterFilter::select('id', 'entity_type', 'entity_id')->where('key', $key)->first();
            if (!$voterFilter) {
                $jsonOutput->setErrorCode(config('errors.tm.THERE_IS_NO_REFERENCE_KEY_OR_KEY_NOT_EXISTS'));
                return;
            }
            $portionType =VoterFilter::ENTITY_TYPES['portion']['type_id'];
            if($voterFilter->entity_type == $portionType){ // If type is campaign portion.
                $campaign = Campaign::select('id', 'current_portion_id')
                ->with(['portions' => function ($query) { $query->orderBy('order'); }])
                ->where('id', $voterFilter->entity_id)->first();
                
                if($campaign){ 
                    $voterFilterId = $voterFilter->id;
                    $allowToEdit = VoterFilterService::checkIfCanEditPortion($campaign, [$voterFilterId]);
                    if(!$allowToEdit){
                        $jsonOutput->setErrorCode(config('errors.tm.NOT_ALLOW_TO_EDIT_PORTION')); return;
                    }
                }

            }
			if($request->input('module_src') == 'telemarketing'){
				$historyArgsArr = [
					'topicName' => 'tm.campaign.portions.delete',
					'models' => [
						[
							'referenced_model' => 'TmCampaignPortion',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
							'referenced_id' =>  $voterFilter->id
						]
					]
				];

				ActionController::AddHistoryItem($historyArgsArr);
			}
            $voterFilter->delete();
            $jsonOutput->setData('Ok');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that performs mass update of VoterFilter by POST params
	*/
    public function massUpdateVoterFilters(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData(VoterFilterService::massUpdate($request->all()));
    }

	/*
		Function that returns count of voters of VoterFilter
		
		@param $request
		@param $key
	*/
    public function getCountVoters(Request $request, $key = null)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.tm.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $voterFilter = VoterFilter::findByKey($key);
        $calculate = $request->has('calculate') ? filter_var($request->input('calculate'), FILTER_VALIDATE_BOOLEAN) : false;
        $unique = $request->has('unique') ? filter_var($request->input('unique'), FILTER_VALIDATE_BOOLEAN) : false;
        $result = false;

        if (empty($voterFilter)) {
            $jsonOutput->setErrorCode(config('errors.tm.REFERENCE_KEY_NOT_EXISTS'));
            return;
        }

        if ($calculate) {
            if ($unique) {
                //if voter filter is tm portion and already have voters in static table don't calculate
                if ($voterFilter->entity_type == config('constants.voterFilterEntityTypes.CAMPAIGN')) {
                    $firstVoter = TelemarketingVoterPhone::where('campaign_id', $voterFilter->entity_id)
                                    ->first();
                    if ($firstVoter) {
                        //only retrive data
                        $result =  $voterFilter->unique_voters_count;
                    } else {
                        //calculate unique voter count
                        $result = FilterUniqueVotersService::calculateUniqueVotersCountPerVoterFilter($voterFilter);
                    }
                } else {
                    //calculate unique voter count
                    $result = FilterUniqueVotersService::calculateUniqueVotersCountPerVoterFilter($voterFilter);
                }
            } else {
                //calculate voter count
                $result = VoterFilterService::getCountVoters($voterFilter);
            }
        } else { //only retrive data
            $result = $unique ? $voterFilter->unique_voters_count :$voterFilter->voters_count;
        }

        $jsonOutput->setData($result);
    }

	/*
		Function that returns all inital values of GeoOptions
	*/
    public function getGeoOptionsInit(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $screenPermission = $request->input('screen_permission', null);
        
        $jsonOutput->setData(GeoFilterService::getInitOptions($screenPermission));
    }

	/*
		Function that returns all GeoOptions
		
		@param $request
		@param $entityType
		@param $entityId
	*/
    public function getGeoOptions(Request $request, $entityType, $entityId)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData(GeoFilterService::getOptions($entityType, $entityId, isset($request->partial)));
    }

	/*
		Function that updates GeoVoterFilter by its key and POST params
	*/
    public function updateGeoVoterFilter(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $gvf = GeographicVoterFilter::findByKey($key);
        $gvf->update($request->all());
        $jsonOutput->setData($gvf->fresh());
    }

	/*
		Function that adds new GeoVoterFilter by voterFilterKey and POST params
	*/
    public function addGeoVoterFilter(Request $request, $vfKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($request->input('entity_id') != 0) {
            $vf = VoterFilter::findByKey($vfKey);
            if($vf){
                $gvf = $vf->geo_items()->create($request->all());
                $jsonOutput->setData($gvf->fresh());
            }
        } else {
            $jsonOutput->setErrorMessage('Filter is empty');
        }
    }
	
	/*
		Function that returns GeoVoterFilter by its key
	*/
    public function deleteGeoVoterFilter($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key) {
            GeographicVoterFilter::findByKey($key)->delete();
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }
}
