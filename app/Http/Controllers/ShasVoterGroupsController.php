<?php

namespace App\Http\Controllers;

use App\Models\Voters;
use App\Models\VoterGroups;
use App\Models\VoterGroupPermissions;
use App\Models\VotersInGroups;
use App\Models\Teams;
use App\Models\User;
use App\Models\City;
use App\Models\Area;
use App\Models\Neighborhood;

use App\Libraries\Helper;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Auth;
use App\Http\Controllers\ActionController;


class ShasVoterGroupsController extends Controller {

    private $errorMessage;

	/*
		Function that returns VoterGroups of Voter (Voter groups in_array
		 whick the voter appears
		)
		
		@param voterKey
	*/
    public function getVoterInGroups( $voterKey ) {
        $jsonOutput = app()->make( "JsonOutput" );

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)->first();
        if (null == $voterExist) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterFields = [
            'voters.id'
        ];

        $currentVoter = Voters::select($voterFields)
                                ->withFilters()
                                ->where('voters.key', $voterKey)
                                ->first();
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $groupFields = ['voter_groups.id',
                        'voter_groups.name',
                        'voter_groups.parent_id',
                        'voter_groups.permission_type',
                        'voter_groups.key',
                       ];
        $groupFieldsVoter = array_merge($groupFields,['voters_in_groups.id as voters_in_groups_id']);
        $voterInGroups = Voters::where('voters.key', $voterKey)
            ->first( ['voters.id'] )->groups()
            ->select($groupFieldsVoter)
            ->withGroups()
            ->get();

		$allVotersGroups = VoterGroups::where('deleted', 0)->select($groupFields)
										->orderBy('parent_id', 'asc')->with(['voterGroupPermissions'=>function($query){
														$query->select('id' , 'voter_group_id' , 'team_id' , 'user_id', 'entity_type' , 'entity_id');
										}])->get();
		$allVotersGroups = GlobalController::FilterVoterGroupsByPermissions($allVotersGroups);
		$allVotersGroupsList = [];
		for($i = 0 ; $i<sizeof($allVotersGroups) ; $i++){
			//echo (in_array($allVotersGroups[$i]->id , $allVotersGroupsList) ? "1":"0");
			if(in_array($allVotersGroups[$i]->id , $allVotersGroupsList) === false){
				array_push($allVotersGroupsList , $allVotersGroups[$i]->id);
			}
		}
		
		$filteredVoterGroups = [];
		for($i = 0 ; $i < sizeof($voterInGroups) ; $i++){
			if(in_array($voterInGroups[$i]->id,$allVotersGroupsList)){
				array_push($filteredVoterGroups , $voterInGroups[$i]);
			}
		}
		
        $jsonOutput->setData( $filteredVoterGroups );
    }

	/*
		Function that returns all VoterGroups that are georaphically-filters 
	*/
    public function getVoterGroups() {
        $groupFields = ['id', 'name', 'parent_id' , 'permission_type' , 'key'];
        $voterGroups = VoterGroups::where('deleted', 0)->select($groupFields)
										->orderBy('parent_id', 'asc')->with(['voterGroupPermissions'=>function($query){
														$query->select('id' , 'voter_group_id' , 'team_id' , 'user_id', 'entity_type' , 'entity_id');
										}])->get();
		$voterGroups = GlobalController::FilterVoterGroupsByPermissions($voterGroups);
        $jsonOutput = app()->make( "JsonOutput" );

        $jsonOutput->setData( $voterGroups );
    }

	/*
		Private helpful function that adds voter to VoterGroupPermissions
		
		@param $voterId
		@param $newVoterGroupId
	*/
    private function addVoterGroup($voterId, $newVoterGroupId) {
        $voterInGroup = new VotersInGroups;

        $voterInGroup->voter_id = $voterId;
        $voterInGroup->voter_group_id = $newVoterGroupId;
        $voterInGroup->save();

        // Array of display field names
        $historyFieldsNames = [
            "voter_id"        =>  config('history.VotersInGroups.voter_id'),
            "voter_group_id"  =>  config('history.VotersInGroups.voter_group_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_numeric_value' =>  $voterInGroup->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.political_party.shas_groups.add',
            'models' => [
                [
                    'referenced_model' => 'VotersInGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterInGroup->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that deletes voter from specific voterGroup
		
		@param $voterInGroupId - id of pivot table
	*/
    private function deleteVoterGroup($voterInGroupId) {
        VotersInGroups::where('id', $voterInGroupId)->delete();

        $historyArgsArr = [
            'topicName' => 'elections.voter.political_party.shas_groups.delete',
            'models' => [
                [
                    'referenced_model' => 'VotersInGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterInGroupId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that edits specific VotersInGroups row 
		
		@param $voterInGroupId
		@param $oldVoterGroupId
		@param $newVoterGroupId
	*/
    private function editVoterGroup($voterInGroupId, $oldVoterGroupId, $newVoterGroupId) {
        $fieldsArray = [];
        if ( $oldVoterGroupId != $newVoterGroupId ) {
            VotersInGroups::where('id', $voterInGroupId)
                             ->update( ['voter_group_id' => $newVoterGroupId] );

            $fieldsArray[] = [
                'field_name' => 'voter_group_id',
                'display_field_name' => config('history.VotersInGroups.voter_group_id'),
                'old_numeric_value' => $oldVoterGroupId,
                'new_numeric_value' =>  $newVoterGroupId
            ];

            $historyArgsArr = [
                'topicName' => 'elections.voter.political_party.shas_groups.edit',
                'models' => [
                    [
                        'referenced_model' => 'VotersInGroups',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterInGroupId,
                        'valuesList' => $fieldsArray
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }
    }

	/*
		Private helpful function that returns all VotersInGroups 
		by specific voterId as reusable Hash
	*/
    private function getVoterCurrentGroupsHash( $voterId ) {
        $voterCurrentGroups = VotersInGroups::select( ['id as voters_in_groups_id', 'voter_group_id'] )
                                               ->where('voter_id', $voterId)->get();

        $currentGroupsHash = [];
        foreach($voterCurrentGroups as $voterGroup){
            $voterInGroupId = $voterGroup->voters_in_groups_id;

            $currentGroupsHash[$voterInGroupId] = [
                'voter_group_id' => $voterGroup->voter_group_id
            ];
        }

        return $currentGroupsHash;
    }

	/*
		Private helpful function that validates VoterInGroup row by voterInGroupId
	*/
    private function validateVoterInGroupId( $voterInGroupId ) {
        $rules = [
            'voter_in_group_id' => 'integer'
        ];

        $validator = Validator::make( ['voter_in_group_id' => $voterInGroupId], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('voter_in_group_id');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpfu function that validates group by groupId
	*/
    private function validateGroupId( $groupId ) {
        $rules = [
            'group_id' => 'required|integer|exists:voter_groups,id'
        ];

        $validator = Validator::make( ['group_id' => $groupId], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('group_id');

            return false;
        } else {
            return true;
        }
    }

	/*
		Function that gets a list of groups , and performs bulk update
		
		@param request
		@param voterKey	
	*/
    public function saveVoterGroups(Request $request, $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ["voters.id"]);
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterId = $currentVoter->id;
        $currentVoterGroupsHash = $this->getVoterCurrentGroupsHash($voterId);
        $voterGroups = $request->input( 'voter_groups', null );
        foreach($voterGroups as $voterGroup){
        // for ( $groupIndex = 0; $groupIndex < count($voterGroups); $groupIndex++ ) {
            $newGroupId = $voterGroup['voter_group_new_id'];
            if ( !$this->validateGroupId($newGroupId) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_GROUP'));
                return;
            }

            $voterInGroupId = $voterGroup['voter_in_group_id'];
            if ( !is_null($voterInGroupId) ) {
                if ( !$this->validateVoterInGroupId( $voterInGroupId ) ) {
                    $jsonOutput->setErrorCode(config('errors.elections.INVALID_VOTER_GROUP'));
                    return;
                }

                if ( !isset( $currentVoterGroupsHash[$voterInGroupId] ) ) {
                    $jsonOutput->setErrorCode(config('errors.elections.INVALID_VOTER_GROUP'));
                    return;
                }
            }
        }

        foreach($voterGroups as $voterGroup){
            $voterInGroupId = $voterGroup['voter_in_group_id'];
            $newGroupId = $voterGroup['voter_group_new_id'];

            if ( isset( $currentVoterGroupsHash[$voterInGroupId] ) ) {
                $oldGroupId = $currentVoterGroupsHash[$voterInGroupId]['voter_group_id'];

                $this->editVoterGroup($voterInGroupId, $oldGroupId, $newGroupId);

                unset($currentVoterGroupsHash[$voterInGroupId]);
            } else {
                $this->addVoterGroup($voterId, $newGroupId);
            }
        }

        if ( count($currentVoterGroupsHash) > 0 ) {
            foreach ( $currentVoterGroupsHash as $voterInGroupId => $value ) {
                $this->deleteVoterGroup($voterInGroupId);
            }
        }

        $jsonOutput->setData('Voter Groups saved');
    }

	/*
		Function that adds new VoterGroup by POST params
	*/
    public function addNewGroup(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $name = trim($request->input('name', null));
		$permissionType = $request->input("permission_type");
		
        if ( is_null($name) || strlen($name) < 2 ) {
            $jsonOutput->setErrorCode(config('errors.global.VOTER_GROUP_MODAL_GROUP_NAME_MISSING'));
            return;
        }
		
		if ($permissionType != 0 && $permissionType == null) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $parentId = 0;

        $parentKey = $request->input('parent_key', null);
        if ( !is_null($parentKey) ) {
            $parentObj = VoterGroups::select('id')
                ->where('key', $parentKey)
                ->first();

            if ( is_null($parentObj) ) {
                $jsonOutput->setErrorCode(config('errors.global.VOTER_GROUP_MODAL_INVALID_PARENT_GROUP'));
                return;
            }

            $parentId = $parentObj->id;
        }

        $row = new VoterGroups;
        $row->key = Helper::getNewTableKey('voter_groups', 10);
        $row->name = $name;
        $row->parent_id = $parentId;
        $row->group_order = VoterGroups::where('parent_id', $parentId)->count();
		$row->permission_type = $permissionType;
		$row->user_create_id = Auth::user()->id;
        $row->save();
		
		if($request->input("voter_groups_permissions")){
			$arrPermissions = json_decode($request->input("voter_groups_permissions"));
			$inertsArray = [];
			switch($request->input("permission_type")){
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_GEOGRAPHIC'):
					for($i = 0 ; $i< sizeof($arrPermissions) ; $i++){
						$inertsArray[] = array('voter_group_id'=>$row->id,'entity_type'=>$arrPermissions[$i]->entity_type,'entity_id'=>$arrPermissions[$i]->entity_id);
					}
					VoterGroupPermissions::insert($inertsArray);
					break;
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_TEAM'):
					for($i = 0 ; $i< sizeof($arrPermissions) ; $i++){
						$teamID = Teams::select('id')->where('key' , $arrPermissions[$i]->team_key)->first()['id'];
						$inertsArray[] = array('voter_group_id'=>$row->id,'team_id'=>$teamID);
					}
					VoterGroupPermissions::insert($inertsArray);
					break;
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_USER'):
					for($i = 0 ; $i< sizeof($arrPermissions) ; $i++){
						$teamID = Teams::select('id')->where('key' , $arrPermissions[$i]->team_key)->first()['id'];
						$userID = User::select('id')->where('key' , $arrPermissions[$i]->user_key)->first()['id'];
						$inertsArray[] = array('voter_group_id'=>$row->id,'team_id'=>$teamID , 'user_id'=>$userID);
					}
					VoterGroupPermissions::insert($inertsArray);
					break;
			}
		}
		

        $jsonOutput->setData($row);
    }
}