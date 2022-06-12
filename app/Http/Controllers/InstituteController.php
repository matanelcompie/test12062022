<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\Voters;
use App\Models\InstituteGroup;
use App\Models\InstituteTypes;
use App\Models\InstituteRole;
use App\Models\InstituteNetwork;
use App\Models\Institutes;
use App\Models\InstituteRolesByVoters;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Http\Controllers\ActionController;


class InstituteController extends Controller {

    private $errorMessage;

	/*
		Function that returns all institute groups
	*/
    public function getInstituteGroups() {
        $jsonOutput = app()->make("JsonOutput");

        $instituteGroups = InstituteGroup::where('deleted', 0)->get();

        $jsonOutput->setData($instituteGroups);
    }

	/*
		Function that returns all institute types
	*/
    public function getInstituteTypes() {
        $jsonOutput = app()->make("JsonOutput");

        $fields = [
            'institute_types.id',
            'institute_types.key',
            'institute_types.name',
            'institute_types.institute_group_id',
            'institute_groups.name as institute_group_name',
        ];
        $instituteTypes = InstituteTypes::select($fields)->withGroups()->where('institute_types.deleted', 0)
                                        ->orderBy('institute_types.institute_group_id', 'asc')->get();

        $jsonOutput->setData($instituteTypes);
    }

	/*
		Function that returns all institute roles
	*/
    public function getInstituteRoles() {
        $jsonOutput = app()->make("JsonOutput");

        $instituteRoles = InstituteRole::where('deleted', 0)->orderBy('institute_type_id', 'asc')->get();

        $jsonOutput->setData($instituteRoles);
    }

	/*
		Function that returns all institute networks
	*/
    public function getInstituteNetworks() {
        $jsonOutput = app()->make("JsonOutput");

        $instituteNetworks = InstituteNetwork::where('deleted', 0)->get();

        $jsonOutput->setData($instituteNetworks);
    }

	/*
		Function that returns all institutes
	*/
    public function getAllInstitutes() {
        $jsonOutput = app()->make("JsonOutput");

        $institutes = Institutes::where('deleted', 0)->get();

        $jsonOutput->setData($institutes);
    }
	
	/*
		Function that performs search of institutes by POST params
	*/
	public function searchInstitutes(Request $request) {
		$fields = [
            'institutes.id',
            'institutes.key',
            'institutes.name',
			'typeGroup.id as type_id',
            'typeGroup.name as type_name',
            'cities.name as city_name'
        ];
		
        $jsonOutput = app()->make("JsonOutput");
        $institutes = Institutes::select($fields)->where('institutes.deleted', 0)->withCity()->withTypeGroup();
		$searchParamsCounter = 0;
		
		if(!is_null($request->input('group_key')) && trim($request->input('group_key')) != '')
		{
			$searchParamsCounter++;
			$institutes->where('institute_groups.key' , $request->input('group_key'));
		}
		
		if(!is_null($request->input('type_key')) && trim($request->input('type_key')) != '')
		{
			$searchParamsCounter++;
			$institutes->where('typeGroup.key' , $request->input('type_key'));
		}
		
        if(!is_null($request->input('network_key')) && trim($request->input('network_key')) != ''){
            $searchParamsCounter++;
			$institutes->withStrictNetwork()->where('institute_networks.key' , $request->input('network_key'));
        }

        if(!is_null($request->input('city_key')) && trim($request->input('city_key')) != '')
        {
            $searchParamsCounter++;
            $institutes->where('cities.key' , $request->input('city_key'));
        }

		if(!is_null($request->input('institute_name_text')) && trim($request->input('institute_name_text')) != '')
		{
			$searchParamsCounter++;
			$institutes->where('institutes.name' , 'like' , '%'.$request->input('institute_name_text').'%');
		}
         
		if($searchParamsCounter == 0){
			 $jsonOutput->setData(array()); // if no search param was sent - it will return empty result
		}
		else{
            $currentPage = $request->input('current_page', 1);
            $limit = $request->input('max_rows', 100);
            $skip = ( $currentPage -1 ) * $limit;

             $result = [
                 'totalInstitutes' => $institutes->count(),
                  'institutes' => $institutes->skip($skip)->take($limit)->get()
             ];

			 $jsonOutput->setData($result); // else return result set
		}
		
        
    }

	/*
		Function that returns all institutes of specific voter , by voterKey
	*/
    public function getVoterInstitutes($voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $voterId = $currentVoter->id;

        $fields = [
                   'institute_roles_by_voters.id',
                   'institute_roles_by_voters.institute_role_id',
                   'institute_roles.name as institute_role_name',
                   'institute_roles_by_voters.institute_id',
                   'institutes.name as institute_name',
                   'institutes.institute_type_id',
                   'institute_types.name as institute_type_name',
                   'institutes.city_id',
                   'cities.name as city_name',
                   'institute_types.institute_group_id',
                   'institute_groups.name as institute_group_name',
                   'institutes.institute_network_id',
                   'institute_networks.name as institute_network_name'
                  ];

        $institutes = InstituteRolesByVoters::select($fields)->withInstitutesRoles()
                                            ->withInstitutes()->withInstitutesNetworks()
                                            ->where('institute_roles_by_voters.voter_id', $voterId)->get();

        $jsonOutput->setData($institutes);
    }

	/*
		Private helpful function that returns voterInstitutesHash by voterID , in order
		to reuse it and not to call to DB each time
	*/
    private function getVoterInstitutesHash($voterId) {
        $voterInstitutes = InstituteRolesByVoters::select( ['id', 'institute_id', 'institute_role_id'] )
                                                 ->where('voter_id', $voterId)->get();

        $voterInstitutesHash = [];
        for ( $index = 0; $index < count($voterInstitutes); $index++ ) {
            $id = $voterInstitutes[$index]->id;

            $voterInstitutesHash[$id] = [
                'id'                => $id,
                'institute_id'      => $voterInstitutes[$index]->institute_id,
                'institute_role_id' => $voterInstitutes[$index]->institute_role_id
            ];
        }

        return $voterInstitutesHash;
    }

	/*
		Private helpful function that validates role by roleID
	*/
    private function validateRole($roleId) {
        $rules = [
            'institute_role_id' => 'required|integer|exists:institute_roles,id'
        ];

        $validator = Validator::make(['institute_role_id' => $roleId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('institute_role_id');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates institute by instituteID
	*/
    private function validateInstitute($instituteId) {
        $rules = [
            'institute_id' => 'required|integer|exists:institutes,id'
        ];

        $validator = Validator::make(['institute_id' => $instituteId], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('institute_id');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that adds voter to institute
	*/
    private function addVoterInstitute($voterId, $newInstituteItem) {
        $instituteRolesByVoters = new InstituteRolesByVoters;

        $instituteRolesByVoters->voter_id = $voterId;
        $instituteRolesByVoters->institute_id = $newInstituteItem['institute_id'];
        $instituteRolesByVoters->institute_role_id = $newInstituteItem['institute_role_id'];
        $instituteRolesByVoters->save();

        // Array of display field names
        $historyFieldsNames = [
            'voter_id'           =>  config('history.InstituteRolesByVoters.voter_id'),
            'institute_id'       =>  config('history.InstituteRolesByVoters.institute_id'),
            'institute_role_id'  =>  config('history.InstituteRolesByVoters.institute_role_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_numeric_value' => $instituteRolesByVoters->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.political_party.shas_institutes.add',
            'models' => [
                [
                    'referenced_model' => 'InstituteRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $instituteRolesByVoters->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that updates voter's institute
	*/
    private function updateVoterInstitute( $currentVoterInstitute, $newVoterInstitute ) {
        $id = $newVoterInstitute['id'];

        $updates = [
            'institute_id'      => $newVoterInstitute['institute_id'],
            'institute_role_id' => $newVoterInstitute['institute_role_id']
        ];

        InstituteRolesByVoters::where('id', $id)->update($updates);

        // Array of display field names
        $historyFieldsNames = [
            'institute_id'       =>  config('history.InstituteRolesByVoters.institute_id'),
            'institute_role_id'  =>  config('history.InstituteRolesByVoters.institute_role_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            if ( $currentVoterInstitute[$fieldName] != $newVoterInstitute[$fieldName] ) {
                $fieldsArray[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                    'old_numeric_value' => $currentVoterInstitute[$fieldName],
                    'new_numeric_value' => $newVoterInstitute[$fieldName]
                ];
            }
        }

        if ( count($fieldsArray) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.political_party.shas_institutes.edit',
                'models' => [
                    [
                        'referenced_model' => 'InstituteRolesByVoters',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $id,
                        'valuesList' => $fieldsArray
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

	/*
		Private helpful function that deletes voter's institute by row id inside the pivot table
	*/
    private function deleteVoterInstitute( $id) {
        InstituteRolesByVoters::where('id', $id)->delete();

        $historyArgsArr = [
            'topicName' => 'elections.voter.political_party.shas_institutes.delete',
            'models' => [
                [
                    'referenced_model' => 'InstituteRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }
	
	/*
		Function that saves voter institute by POST data , voterKey and the id of the row (pivot table)
	*/
	public function saveVoterInstituteByRowID(Request $request, $voterKey , $instituteRoleByVoterID){
		$jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
		$voterId = $currentVoter->id;
		InstituteRolesByVoters::where( ['id'=>$instituteRoleByVoterID, 'voter_id'=> $voterId])->update(['institute_id'=>$request->input('institute_id') , 'institute_role_id'=>$request->input('institute_role_id')]);
		$jsonOutput->setData('institues role was updated successfully');
	}
	
	/*
		Function that deletes voter institute by POST data , voterKey and the id of the row (pivot table)
	*/
	public function deleteVoterInstituteByRowID(Request $request, $voterKey , $instituteRoleByVoterID){
		$jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
        $voterId = $currentVoter->id;
		InstituteRolesByVoters::where( 'id',$instituteRoleByVoterID)->where('voter_id', $voterId)->delete();
		
		$historyArgsArr = [
            'topicName' => 'elections.voter.political_party.shas_institutes.delete',
            'models' => [
                [
                    'referenced_model' => 'InstituteRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $instituteRoleByVoterID
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
		
		$jsonOutput->setData('institues role was deleted successfully');
	}
	
	/*
		Function that adds new voter institute by POST data and  voterKey  
	*/
	public function addNewVoterInstituteRole(Request $request, $voterKey){
		$jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
        $voterId = $currentVoter->id;
		$newInstituteItem = [];
		$newInstituteItem['institute_id'] = $request->input('institute_id');
		$newInstituteItem['institute_role_id'] = $request->input('institute_role_id');
		$this->addVoterInstitute($voterId, $newInstituteItem);
		$jsonOutput->setData('institues role was added to voter');
	}

	/*
		Function that saves voter institutes by voterKey and POST data
	*/
    public function saveVoterInstitutes(Request $request, $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }
        $voterId = $currentVoter->id;

        $newVoterInstitutes = $request->input('institutes_data');

        // Validating data
        for ( $instituteIndex = 0; $instituteIndex < count($newVoterInstitutes); $instituteIndex++ ) {
            if ( !$this->validateInstitute( $newVoterInstitutes[$instituteIndex]['institute_id']) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_INSTITUTE'));
            }

            if ( !$this->validateRole( $newVoterInstitutes[$instituteIndex]['institute_role_id']) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_INSTITUTE_ROLE'));
            }
        }

        $voterInstitutesHash = $this->getVoterInstitutesHash($voterId);

        for ( $instituteIndex = 0; $instituteIndex < count($newVoterInstitutes); $instituteIndex++ ) {
            $id = $newVoterInstitutes[$instituteIndex]['id'];


            if ( isset($voterInstitutesHash[$id]) ) {
                $this->updateVoterInstitute($voterInstitutesHash[$id], $newVoterInstitutes[$instituteIndex]);
                unset($voterInstitutesHash[$id]);
            } else {
                $this->addVoterInstitute($voterId, $newVoterInstitutes[$instituteIndex]);
            }
        }

        if ( count($voterInstitutesHash) ) {
            foreach ( $voterInstitutesHash as $id => $value ) {
                $this->deleteVoterInstitute($id);
            }
        }

        $jsonOutput->setData('institues were saved');
    }
}