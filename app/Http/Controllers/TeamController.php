<?php

namespace App\Http\Controllers;

use App\DTO\TeamRequestDetailsDto;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Libraries\HelpFunctions;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\GeographicFilterTemplates;
use App\Models\Neighborhood;
use App\Models\RolesByUsers;
use App\Models\SectorialFilterDefinitions;
use App\Models\SectorialFilterDefinitionsValues;
use App\Models\SectorialFilterItems;
use App\Models\SectorialFilterItemValues;
use App\Models\SectorialFilters;
use App\Models\SectorialFilterTemplates;
use App\Models\SubArea;
use App\Models\TeamDepartments;
use App\Models\TeamLeaderHistory;
use App\Models\Teams;
use App\Models\User;
use App\Models\Voters;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use App\Repositories\TeamRepository;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class TeamController
 * This controller handles the actions
 * and information regarding the user.
 *
 * @package App\Http\Controllers
 */
class TeamController extends Controller
{

    /**
     * This function returns all the teams if gets no id in URL,
     * returns error if no team with id found, else it
     * returns the data of the found team.
     *
     * @param null $id
     */
    public function addNewSectorialTemplate(Request $request, $teamKey)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($teamKey == null || trim($teamKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($request->input('filter_name_header') == null || trim($request->input('filter_name_header')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_SECTORIAL_TEMPLATE_NAME'));
            return;
        }

        $team = Teams::select(['id'])->where('key', $teamKey)->where('deleted', 0)->first();
        if ($team) {
            $sectorial_filters = $request->input('sectorial_filters');
            $filtersArr = explode(';', $sectorial_filters);
            if (sizeof($filtersArr) == 0) {
                $jsonOutput->setErrorCode(config('errors.system.MISSING_SECROTIAL_TEMPLATES'));
                return;
            }
            $sectorialFilter = new SectorialFilterTemplates;

            $sectorialFilter->name = $request->input('filter_name_header');
            $sectorialFilter->team_id = $team->id;
            $sectorialFilter->key = Helper::getNewTableKey('sectorial_filter_templates', 5);
            $sectorialFilter->save();
            for ($i = 0; $i < sizeof($filtersArr); $i++) {
                $filterItems = explode('|', $filtersArr[$i]);
                $sectorialFilterItem = new SectorialFilterItems;
                $sectorialFilterItem->entity_type = 1;
                $sectorialFilterItem->entity_id = $sectorialFilter->id;
                $sectorialFilterItem->sectorial_filter_definition_id = $filterItems[0];
                $sectorialFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
                $sectorialFilterItem->save();

                if ($filterItems[2] == 1 || $filterItems[2] == 2) {
                    if ($filterItems[3] == 0) { //not multiselect
                        $sectorialFilterItem->numeric_value = $filterItems[4];
                    } elseif ($filterItems[3] == 1) { //multiselect
                        $itemValuesArr = explode(',', $filterItems[4]);
                        for ($m = 0; $m < sizeof($itemValuesArr); $m++) {
                            $newSectorialItemValus = new SectorialFilterItemValues;
                            $newSectorialItemValus->sectorial_filter_item_id = $sectorialFilterItem->id;
                            $newSectorialItemValus->value = $itemValuesArr[$m];
                            $newSectorialItemValus->key = Helper::getNewTableKey('sectorial_filter_item_values', 5);
                            $newSectorialItemValus->save();
                        }
                    }
                } elseif ($filterItems[2] == 0 || $filterItems[2] == 3 || $filterItems[2] == 4) {
                    $sectorialFilterItem->numeric_value = $filterItems[4];
                } elseif ($filterItems[2] == 5) {
                    $sectorialFilterItem->string_value = $filterItems[4];
                }
                $sectorialFilterItem->save();
            }

            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }
	
	/*
		Function that updates existing sectorial template
		
		@param request - POST params
		@param teamKey
		@param sectorialKey
	*/
    public function updateExistingSectorialTemplate(Request $request, $teamKey, $sectorialKey)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($teamKey == null || trim($teamKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($sectorialKey == null || trim($sectorialKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_SECTORIAL_TEMPLATE_KEY'));
            return;
        }
        if ($request->input('filter_name_header') == null || trim($request->input('filter_name_header')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_SECTORIAL_TEMPLATE_NAME'));
            return;
        }
        $team = Teams::select(['id'])->where('key', $teamKey)->where('deleted', 0)->first();
        if ($team) {
            $sectorialFilter = SectorialFilterTemplates::where('key', $sectorialKey)->first();
            if ($sectorialFilter) {
                $sectorialFilter->name = $request->input('filter_name_header');
                $sectorialFilter->save();
            } else {
                $jsonOutput->setErrorCode(config('errors.system.SECTORIAL_TEMPLATE_NOT_EXISTS'));
                return;
            }
            if ($request->input('add_filter_string') != null && trim($request->input('add_filter_string')) != '') {
                $tempArray = explode(';', $request->input('add_filter_string'));
                if (sizeof($tempArray) == 0) {
                    $jsonOutput->setErrorCode(config('errors.system.WRONG_UPDATE_FORMAT'));
                    return;
                }
                for ($i = 0; $i < sizeof($tempArray); $i++) {
                    $tempArrayElements = explode('|', $tempArray[$i]);

                    $newFilterFilterItem = new SectorialFilterItems;
                    $newFilterFilterItem->entity_type = 1;
                    $newFilterFilterItem->entity_id = $sectorialFilter->id;
                    $newFilterFilterItem->sectorial_filter_definition_id = $tempArrayElements[0];

                    if ($tempArrayElements[2] <= 4) {
                        $newFilterFilterItem->numeric_value = $tempArrayElements[3];
                    } elseif ($tempArrayElements[2] == 5) {
                        $newFilterFilterItem->string_value = $tempArrayElements[3];
                    }

                    $newFilterFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
                    $newFilterFilterItem->save();
                }
            }
            if ($request->input('edit_filter_string') != null && trim($request->input('edit_filter_string')) != '') {
                $tempArray = explode(';', $request->input('edit_filter_string'));
                if (sizeof($tempArray) == 0) {
                    $jsonOutput->setErrorCode(config('errors.system.WRONG_UPDATE_FORMAT'));
                    return;
                }
                for ($i = 0; $i < sizeof($tempArray); $i++) {
                    $tempArrayElements = explode('|', $tempArray[$i]);
                    $newSectorialFilter = SectorialFilterTemplates::where('key', $sectorialKey)->where('team_id', $team->id)->first();
                    if ($newSectorialFilter) {

                        $newFilterFilterItem = SectorialFilterItems::where('entity_type', 1)->where('entity_id', $newSectorialFilter->id)->where('sectorial_filter_definition_id', $tempArrayElements[0])->first();
                        if ($newFilterFilterItem) {
                            if ($tempArrayElements[2] <= 4) {
                                $newFilterFilterItem->numeric_value = $tempArrayElements[3];
                            } elseif ($tempArrayElements[2] == 5) {
                                $newFilterFilterItem->string_value = $tempArrayElements[3];
                            }

                            $newFilterFilterItem->save();
                        }
                    }
                }
            }

            if ($request->input('delete_filter_string') != null && trim($request->input('delete_filter_string')) != '') {
                $deleteArr = explode(',', $request->input('delete_filter_string'));
                if (sizeof($deleteArr) == 0) {
                    $jsonOutput->setErrorCode(config('errors.system.WRONG_UPDATE_FORMAT'));
                    return;
                }
                $sectorialFilterID = null;
                for ($i = 0; $i < sizeof($deleteArr); $i++) {
                    $sectorialFilterDefinition = SectorialFilterDefinitions::where('id', $deleteArr[$i])->first();
                    if ($sectorialFilterDefinition) {
                        $sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id', $sectorialFilterDefinition->id)->first();
                        if ($sectorialFilterItem) {
                            if ($sectorialFilterID == null) {
                                $sectorialFilterID = $sectorialFilterItem->entity_id;
                            }
                            if ($sectorialFilterItem->entity_type == 1) {
                                $sectorialFilter = SectorialFilterTemplates::where('id', $sectorialFilterItem->entity_id)->first();
                                if ($sectorialFilter) {
                                    if ($sectorialFilter->team_id == $team->id) {
                                        $sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id', $sectorialFilterItem->id)->get();
                                        for ($c = 0; $c < sizeof($sectorialFilterItemValues); $c++) {
                                            $sectorialFilterItemValues[$c]->forceDelete();
                                        }
                                        $sectorialFilterItem->forceDelete();
                                    }
                                }
                            }
                        }
                    }
                }

                $foundFilterItems = SectorialFilterItems::where('entity_id', $sectorialFilterID)->get();
                if ($foundFilterItems) {
                    if (sizeof($foundFilterItems) == 0) {
                        $sectorialFilter = SectorialFilters::where('id', $sectorialFilterID)->first();
                        if ($sectorialFilter) {
                            $sectorialFilter->forceDelete();
                        }
                    }
                }
            }
            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that returns SectorialFilterTemplates of specific 
		template in specific team
		
		@param request - POST params
		@param teamKey
		@param tplKey
	*/
    public function getSectorialTPLDefenitionGroupValues(Request $request, $teamKey, $tplKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $team = Teams::select(['id'])->where('key', $teamKey)->where('deleted', 0)->first();
        if ($team) {
            $sectorialFilters = SectorialFilterTemplates::select(['id',
                'name',
                'key'])->where('team_id', $team->id)->where('key', $tplKey)->get();

            for ($i = 0; $i < sizeof($sectorialFilters); $i++) {
                $sectorialFilterItems = SectorialFilterItems::select(['sectorial_filter_items.id as id',
                    'type',
                    'numeric_value',
                    'string_value',
                    'multiselect',
                    'sectorial_filter_definition_id as definition_id',
                    'model',
                    'model_list_function',
                    'model_list_dependency_id'])->withSectorialFilterDefs()->where('entity_type', 1)->where('entity_id', $sectorialFilters[$i]->id)->get();
                $extraArray = array();
                for ($j = 0; $j < sizeof($sectorialFilterItems); $j++) {
                    if ($sectorialFilterItems[$j]->type == 0) {
                        if ($sectorialFilterItems[$j]->numeric_value == 1) {
                            $sectorialFilterItems[$j]->value = 'כן';
                        } elseif ($sectorialFilterItems[$j]->numeric_value == 0) {
                            $sectorialFilterItems[$j]->value = 'לא';
                        }
                    } elseif ($sectorialFilterItems[$j]->type == 1 || $sectorialFilterItems[$j]->type == 3 || $sectorialFilterItems[$j]->type == 4) {
                        if ($sectorialFilterItems[$j]->type == 1) {
                            if ($sectorialFilterItems[$j]->multiselect == 1) {
                                $sectorialFilterItems[$j]->value = '';
                                $sectorialFilterItem = SectorialFilterItems::where('sectorial_filter_definition_id', $sectorialFilterItems[$j]->definition_id)->where('entity_type', 0)->first();
                                if ($sectorialFilterItem) {
                                    $sectorialFilterItems[$j]->values = SectorialFilterItemValues::where('sectorial_filter_item_id', $sectorialFilterItem->id)->get();
                                }
                            } else {
                                $defValue = SectorialFilterDefinitionsValues::select(['value'])->where('id', $sectorialFilterItems[$j]->numeric_value)->where('sectorial_filter_definition_id', $sectorialFilterItems[$j]->definition_id)->first();
                                if ($defValue) {
                                    $sectorialFilterItems[$j]->value = $defValue->value;
                                }
                            }
                        } else {
                            $sectorialFilterItems[$j]->value = $sectorialFilterItems[$j]->numeric_value;
                        }
                    } elseif ($sectorialFilterItems[$j]->type == 2) {
                        if ($sectorialFilterItems[$j]->multiselect == 1) {
                            $sectorialFilterItems[$j]->values = SectorialFilterItemValues::select(['id',
                                'value as name',
                                'key'])->where('sectorial_filter_item_id', $sectorialFilterItems[$j]->id)->get();
                        } else {
                            $model = new $sectorialFilterItems[$j]->model;
                            $method = $sectorialFilterItems[$j]->model_list_function;
                            if ($sectorialFilterItems[$j]->model_list_dependency_id == null) {
                                $list = $model->{$method}();
                                $param = $sectorialFilterItems[$j]->numeric_value;
                                $dependedList = SectorialFilterDefinitions::select(['id as definition_id',
                                    'type',
                                    'name',
                                    'model',
                                    'multiselect',
                                    'model_list_function',
                                    'model_list_dependency_id'])->where('model_list_dependency_id', $sectorialFilterItems[$j]->definition_id)->get();
                                for ($u = 0; $u < sizeof($dependedList); $u++) {
                                    if ($dependedList[$u]->model != '') {
                                        $innerModel = new $dependedList[$u]->model;
                                        $innerMethod = $dependedList[$u]->model_list_function;

                                        $dependedList[$u]->def_values = $innerModel->{$innerMethod}($param);

                                        array_push($extraArray, $dependedList[$u]);
                                    }
                                }

                                // $sectorialFilterItems[$j]->dependedList = $dependedList;
                            } else {
                                $model = new $sectorialFilterItems[$j]->model;
                                $method = $sectorialFilterItems[$j]->model_list_function;
                                $param = '';
                                if ($sectorialFilterItems[$j]->numeric_value != null) {
                                    $param = $sectorialFilterItems[$j]->numeric_value;
                                }
                                $list = $model->{$method}($param);
                            }
                            $sectorialFilterItems[$j]->def_values = array_merge(get_object_vars($list), $extraArray);

                            $tempTable1 = SectorialFilterItems::select(['entity_id',
                                'numeric_value'])->where('sectorial_filter_definition_id', $sectorialFilterItems[$j]->definition_id)->first();
                            if ($tempTable1) {
                                $tempTable2 = SectorialFilters::where('id', $tempTable1->entity_id)->where('role_by_user_id', $request->input("user_role_id"))->first();
                                if ($tempTable2) {
                                    $numericValue = $tempTable1->numeric_value;
                                    $sectorialFilterItems[$j]->value = $numericValue;
                                } else {
                                    $sectorialFilterItems[$j]->value = "";
                                }
                            } else {
                                $sectorialFilterItems[$j]->value = "";
                            }

                            //  $ttt = array_merge($sectorialFilterItems[$j]->def_values , $extraArray);

                            for ($n = 0; $n < sizeof($list); $n++) {
                                if ($list[$n]->id == $sectorialFilterItems[$j]->numeric_value) {
                                    $sectorialFilterItems[$j]->value = $list[$n]->name;
                                    break;
                                }
                            }
                        }
                    } elseif ($sectorialFilterItems[$j]->type == 5) {
                        $sectorialFilterItems[$j]->value = $sectorialFilterItems[$j]->string_value;
                    }
                }

                $sectorialFilters[$i]->values_list = $sectorialFilterItems;
                // $sectorialFilters[$i]->values_list = array_merge(get_object_vars($sectorialFilterItems) , $extraArray);
            }
            $jsonOutput->setData($sectorialFilters);
        }
    }
	
	/*
		Function that returns all Teams with extended data
	*/
    public function getTeams($id = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        /* get all teams if teamKey does not exists in URL */
        if ($id == null) {
            $teams = Teams::select(['teams.id',
                'teams.key',
                'teams.name',
                'teams.leader_id',
                'teams.viewable',
				])
				->selectRaw("COALESCE (CONCAT(team_leader_voters.first_name , ' ' ,team_leader_voters.last_name ) , ' ') as  leader_name ")
                ->where('teams.deleted', 0)
				->with('departments')
				->with(['geoTemplates' => function($query){
					$query->select("id" , "key", "name" , "team_id" , 
									"entity_type" , "entity_id" , "created_at" , "updated_at" ,
									DB::raw("0 as inherited") , 
									DB::raw("
											 COALESCE(
											 CASE
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA')."
													THEN
														 (select(name) from areas where areas.id=entity_id)
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA')."
													THEN
                                                         (select (CONCAT(areas.name , ' >> ' ,sub_areas.name)) from sub_areas , areas where areas.id = sub_areas.area_id and sub_areas.id=entity_id)
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY')."
													THEN
														 (select (CONCAT(areas.name , ' >> ' ,cities.name)) from cities , areas where areas.id = cities.area_id and cities.id=entity_id)
											    WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD')."
													THEN
														 (select (CONCAT(  areas.name , ' >> ' ,cities.name , ' >> ' , neighborhoods.name)) from neighborhoods , cities , areas where neighborhoods.city_id=cities.id and areas.id = cities.area_id and neighborhoods.id=entity_id)
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')."
													THEN
														(select CONCAT(  areas.name , ' >> ' ,cities.name , ' >> ' , IF(neighborhoods.name is NULL , clusters.name , CONCAT(neighborhoods.name , ' >> ' , clusters.name)))
														 from 
															areas inner join cities 
																on areas.id=cities.area_id
															left join neighborhoods
																on neighborhoods.city_id=cities.id
															inner join clusters
																on (clusters.city_id=cities.id)
														 where clusters.id = entity_id		
														)
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')."
													THEN
														(select CONCAT(  areas.name , ' >> ' ,cities.name , ' >> ' , IF(neighborhoods.name is NULL , clusters.name , CONCAT(neighborhoods.name , ' >> ' , clusters.name)) , ' >> ' , ballot_boxes.mi_id)
														 from 
															areas inner join cities 
																on areas.id=cities.area_id
															left join neighborhoods
																on neighborhoods.city_id=cities.id
															inner join clusters
																on (clusters.city_id=cities.id)
															inner join ballot_boxes
																on ballot_boxes.cluster_id = clusters.id
														 where ballot_boxes.id = entity_id		
														)
												
											 END
											  , '') as full_path_name")
									);
				}])
				->with('sectorialTemplates')
				->leftJoin('users as team_leader_user', 'team_leader_user.id','=','teams.leader_id')
				->leftJoin('voters as team_leader_voters', 'team_leader_voters.id','=','team_leader_user.voter_id')
                ->with(['total_roles' => function($query){
					$query->select(['roles_by_users.id as id',
									'roles_by_users.user_role_id as user_role_id',
									'roles_by_users.user_id as user_id',
									'roles_by_users.team_id',
									'first_name',
									'last_name',
									'users.key as user_key',
									'personal_identity',
									'user_roles.name as role_name',
									'roles_by_users.team_department_id as team_department_id',
									'team_departments.name as dep_name',
									'from_date',
									'to_date',
									'main'])
									->withExtraData()
									->where('roles_by_users.deleted', 0)
									->where(function ($query1) {
										$query1->whereNull('to_date')
												->orWhere('to_date', '>=', Carbon::now()->addDays(-1));
									})
									->where(function ($query1) {
										$query1->whereNull('from_date')
												->orWhere('from_date', '<=', Carbon::now());
									});
				}])
				->get();
            $jsonOutput->setData($teams);
        } else {
            /* first try to find team by team key */
            $teamDepartments = TeamDepartments::select(['id',
                'team_id',
                'name']) /* = */
                ->where('team_id', $id) /* = */
                ->get();

            if ($teamDepartments != null) {
                $jsonOutput->setData($teamDepartments);
            } else {
                /* return error message */
                $jsonOutput->setData('');
            }
        }
    }

	/*
		Function that performs editing TeamDepartment by its id
	*/
    public function editTeamDepartment(Request $request, $key, $id)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($id == null || trim($id) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_KEY'));
            return;
        }
        if ($request->input('dep_name') == null || trim($request->input('dep_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_NAME'));
            return;
        }
        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $dep = TeamDepartments::where('id', $id)->where('team_id', $team->id)->where('deleted', 0)->first();
            if ($dep) {
                $oldValue = $dep->name;
                $dep->name = $request->input('dep_name');
                $dep->save();

                if ( $dep->name != $oldValue ) {
                    $historyArgsArr = [
                        'topicName' => 'system.teams.departments.edit',
                        'models' => [
                            [
                                'referenced_model' => 'TeamDepartments',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $dep->id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'name',
                                        'display_field_name' => config('history.TeamDepartments.name'),
                                        'old_value' => $oldValue,
                                        'new_value' => $dep->name
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

                $jsonOutput->setData('ok');
            } else {
                $jsonOutput->setErrorCode(config('errors.system.TEAM_DEPARTMENT_NOT_EXISTS'));
                return;
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

    /*
		Function that deletes existing TeamDepartment by its id
	*/
    public function deleteTeamDepartment($key, $id)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($id == null || trim($id) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_KEY'));
            return;
        }
        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $dep = TeamDepartments::where('id', $id)->where('team_id', $team->id)->where('deleted', 0)->first();
            if ($dep) {
                $dep->deleted = 1;
                $dep->save();
                //ActionController::AddHistoryItem('system.teams.departments.delete', $dep->id, 'TeamDepartments', null);
                $historyArgsArr = [
                    'topicName' => 'system.teams.departments.delete',
                    'models' => [
                        [
                            'referenced_model' => 'TeamDepartments',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $dep->id
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);

                $data = TeamDepartments::select(['id',
                    'name'])->where('deleted', 0)->where('team_id', $team->id)->get();
                for ($i = 0; $i < sizeof($data); $i++) {
                    $data[$i]->is_editing = 0;
                    $data[$i]->is_deletable = 1;
                    $roleByUsers = RolesByUsers::where(['team_department_id' => $data[$i]->id, 'deleted' => 0] )->first();
                    if ($roleByUsers) {
                        $data[$i]->is_deletable = 0;
                    }
                }
                $jsonOutput->setData($data);
            } else {
                $jsonOutput->setErrorCode(config('errors.system.TEAM_DEPARTMENT_NOT_EXISTS'));
                return;
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that adds new TeamDepartment by POST params and teamKey
	*/
    public function addNewTeamDepartment(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }

        if ($request->input('dep_name') == null || trim($request->input('dep_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_NAME'));
            return;
        }

        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $dep = new TeamDepartments;
            $dep->team_id = $team->id;
            $dep->deleted = 0;
            $dep->name = $request->input('dep_name');
            $dep->save();

            $historyArgsArr = [
                'topicName' => 'system.teams.departments.add',
                'models' => [
                    [
                        'referenced_model' => 'TeamDepartments',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $dep->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.TeamDepartments.name'),
                                'new_value' => $dep->name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);

            $data = TeamDepartments::select(['id',
                'name'])->where('deleted', 0)->where('team_id', $team->id)->get();
            for ($i = 0; $i < sizeof($data); $i++) {
                $data[$i]->is_editing = 0;
                $data[$i]->is_deletable = 1;
                $roleByUsers = RolesByUsers::where('team_department_id', $data[$i]->id)->first();
                if ($roleByUsers) {
                    $data[$i]->is_deletable = 0;
                }
            }

            $jsonOutput->setData($data);
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that edits existing GeographicFilterTemplate by its teamKey and geoKey
	*/
    public function editExistingGeoTemplate(Request $request, $key, $geoKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($geoKey == null || trim($geoKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_FILTER_KEY'));
            return;
        }
        if ($request->input('label_name') == null || trim($request->input('label_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_TEMPLATE_NAME'));
            return;
        }
        $geoEntitiesIdList = [-1, 0, 1, 2, 3, 4, 5];
        if ( !in_array($request->input('entity_type'), $geoEntitiesIdList)) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_GEO_TEMPLATE_TYPE'));
            return;
        }
        if ($request->input('entity_id') == null || !is_numeric($request->input('entity_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_GEO_TEMPLATE_ENTITY_ID'));
            return;
        }

        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $geoTemplate = GeographicFilterTemplates::where('key', $geoKey)->first();
            if ($geoTemplate) {
                $geoTemplate->name = $request->input('label_name');
                $geoTemplate->entity_type = $request->input('entity_type');
                $geoTemplate->entity_id = $request->input('entity_id');
                $geoTemplate->save();
                $jsonOutput->setData('ok');
            } else {
                $jsonOutput->setErrorCode(config('errors.system.GEO_TEMPLATE_NOT_EXISTS'));
                return;
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that adds new GeographicFilterTemplate to existing team by teamKey
		and POST params
	*/
    public function addTeamGeoTemplate(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($request->input('label_name') == null || trim($request->input('label_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_TEMPLATE_NAME'));
            return;
        }
        $geoEntitiesIdList = [-1, 0, 1, 2, 3, 4, 5];
        if ( !in_array($request->input('entity_type'), $geoEntitiesIdList)) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_GEO_TEMPLATE_TYPE'));
            return;
        }

        if ($request->input('entity_id') == null || !is_numeric($request->input('entity_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_GEO_TEMPLATE_ENTITY_ID'));
            return;
        }

        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $geoTemplate = new GeographicFilterTemplates;
            $geoTemplate->team_id = $team->id;
            $geoTemplate->name = $request->input('label_name');
            $geoTemplate->entity_type = $request->input('entity_type');
            $geoTemplate->entity_id = $request->input('entity_id');
            $geoTemplate->key = Helper::getNewTableKey('geographic_filter_templates', 10);
            $geoTemplate->save();
            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that deletes existing SectorialFilterItems by  its sectorialKey and
		teamKey
	*/
    public function deleteTeamSectorialTemplate($key, $sectorialKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($sectorialKey == null || trim($sectorialKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_SECTORIAL_TEMPLATE_KEY'));
            return;
        }
        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $sectorialTpl = SectorialFilterTemplates::where('key', $sectorialKey)->first();
            if ($sectorialTpl) {
                $sectorialFilterItems = SectorialFilterItems::where('entity_type', 1)->where('entity_id', $sectorialTpl->id)->get();
                if ($sectorialFilterItems) {
                    for ($i = 0; $i < sizeof($sectorialFilterItems); $i++) {
                        $sectorialFilterItemValues = SectorialFilterItemValues::where('sectorial_filter_item_id', $sectorialFilterItems[$i]->id)->get();
                        for ($j = 0; $j < sizeof($sectorialFilterItemValues); $j++) {
                            $sectorialFilterItemValues[$j]->forceDelete();
                        }
                        $sectorialFilterItems[$i]->forceDelete();
                    }
                }
                $sectorialTpl->forceDelete();
                $jsonOutput->setData('ok');
            } else {
                $jsonOutput->setErrorCode(config('errors.system.SECTORIAL_TEMPLATE_NOT_EXISTS'));
                return;
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }

	/*
		Function that deletes existing GeographicFilterTemplate by its key and team_id(id)
	*/
    public function deleteTeamGeoTemplate($key, $id)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key == null || trim($key) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($id == null || trim($id) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_FILTER_KEY'));
            return;
        }
        $team = Teams::select(['id'])->where('key', $key)->where('deleted', 0)->first();
        if ($team) {
            $geoTemplate = GeographicFilterTemplates::where('id', $id)->first();
            if ($geoTemplate) {
                if ($geoTemplate->team_id == $team->id) {
                    $geoTemplate->forceDelete();
                    $jsonOutput->setData('ok');
                } else {
                    $jsonOutput->setErrorCode(config('errors.system.INCONSISTENCY_BETWEEN_GEO_TEMPLATE_AND_TEAM'));
                    return;
                }
            } else {
                $jsonOutput->setErrorCode(config('errors.system.GEO_TEMPLATE_NOT_EXISTS'));
                return;
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
    }
    
    public function getTeamRequestsTopics($teamKey){
        $jsonOutput = app()->make("JsonOutput");

        $teamCityData = Teams::select('teams.id','team_city.id as team_city_id')
        ->join('cities as team_city', 'team_city.crm_team_id', 'teams.id')
        ->where('teams.key', $teamKey)
        ->where('teams.deleted', 0)
        ->first();

        $fields =[
            'request_topics.id', 'request_topics.key', 'request_topics.name',
            'request_topics.active', 'request_topics.topic_order', 'request_topics.parent_id',
            'user_handler.id as user_handler_id', 'request_topics_by_users.id as request_topic_user_id',
            DB::raw('CONCAT(user_handler_voter.first_name," ", user_handler_voter.last_name) as user_handler_name'),
        ];
        
        $teamUsersQuery = HelpFunctions::getUsersWithRequestModuleRole($jsonOutput, $teamKey, true);
        if(is_null($teamUsersQuery)) { return;}

        $municipalTopic = null;

        if($teamCityData){ // If team is Assigned to city
            $municipalTopic = RequestTopic::where('system_name', config('constants.request_topic_municipally_system_name'))->first();

            $municipalRequestSubTopics = RequestTopic::select($fields)
            ->where('request_topics.deleted', 0)
            ->where('request_topics.parent_id', $municipalTopic->id)
            ->withUserTeamHandler($teamCityData->team_city_id)
            ->groupBy('request_topics.id')
            ->get();

            $teamUsers = $teamUsersQuery->where('request_topics.parent_id', '!=', $municipalTopic->id)->get();

        } else {
            $teamUsers = $teamUsersQuery->get();
            $municipalRequestSubTopics = [];
        }


        

        $jsonOutput->setData(['all' => $teamUsers, 'municipally' => $municipalRequestSubTopics]);

    }
	public function updateTeamRequestTopic(Request $request, $teamKey, $topicKey){
        $jsonOutput = app()->make("JsonOutput");

        $newUserHandlerId = $request->input('user_handler_id');
        $userRequestTopicId = $request->input('user_request_topic_id');

        if($userRequestTopicId){ //Update exist requests user:
            $requestTopicUser = RequestTopicUsers::where('id', $userRequestTopicId)->first(); 
        }
        $subTopic = RequestTopic::where('key', $topicKey)->first();
        // dump($topicKey, $subTopic);
        if(!$subTopic){$jsonOutput->setErrorCode(config('errors.crm.REQUEST_SUB_TOPIC_NOT_EXISTS')); return;}

        $team = Teams::select('id')->where('key', $teamKey)->first();
        if(!$team){ $jsonOutput->setErrorCode(config('errors.global.TEAM_NOT_EXISTS')); return;}

        $municipalTopic = RequestTopic::where('system_name', config('constants.request_topic_municipally_system_name'))->first();

        $cityId = null;
        if($subTopic->parent_id == $municipalTopic->id){ // if is municipal sub topic.

            $city = City::select('id')->where('crm_team_id', $team->id)->where('deleted', 0)->first();
            if(!$city){ $jsonOutput->setErrorCode(config('errors.global.CITY_NOT_EXISTS')); return;}
            $cityId = $city->id;
        }

        $newRequestTopicUser = RequestTopicUsers::where('id', $subTopic)->where('city_id',  $cityId)->first();
        if($newRequestTopicUser){$jsonOutput->setErrorCode(config('errors.crm.REQUEST_SUB_TOPIC_USER_HANDLER_ALREADY_EXISTS')); return;}

        if(empty($requestTopicUser)){ 
            $requestTopicUser = new RequestTopicUsers();
            $requestTopicUser->city_id = $cityId;
            $requestTopicUser->request_topic_id = $subTopic->id;
        }

        // !! todo history!
        $requestTopicUser->team_handler_id = $team->id; 
        $requestTopicUser->user_handler_id = $newUserHandlerId; 
        $requestTopicUser->save();

        $jsonOutput->setData($requestTopicUser);
    }
	/*
		Function that returns team data of specific team by teamKey
	*/
    public function getTeamDataByKey($key)
    {

        $jsonOutput = app()->make("JsonOutput");
        $teamData = Teams::where('teams.key', $key)->where('teams.deleted', 0)->first();
        if ($teamData) {
            $teamData->leader_name = '';
            $tempUser = User::where('id', $teamData->leader_id)->first();
            if ($tempUser) {
                $tempVoter = Voters::select(['voters.first_name', 'voters.last_name'])->withFilters()->where('voters.id', $tempUser->voter_id)->first();
                if ($tempVoter) {
                    $teamData->leader_name = trim($tempVoter->first_name) . ' ' . trim($tempVoter->last_name);
                }
            }
        }

        $teamData->total_roles = RolesByUsers::select([
                    'roles_by_users.id as id',
                    'roles_by_users.user_role_id as user_role_id',
                    'roles_by_users.user_id as user_id',
                    'first_name',
                    'last_name',
					'users.key as user_key',
                    'personal_identity',
                    'user_roles.name as role_name',
                    'roles_by_users.team_department_id as team_department_id',
                    'team_departments.name as dep_name',
                    'from_date','to_date','main',
                    ])
                ->withExtraData()
                ->where('roles_by_users.team_id', $teamData->id)
                ->where('roles_by_users.deleted', 0)
                ->get();
      

        $teamData->leaders_history = TeamLeaderHistory::select(['first_name',
            'last_name',
            'personal_identity',
            'start_date',
            'end_date'])->withExtraData()->where('team_id', $teamData->id)->orderBy('team_leader_history.id', 'DESC')->get();
        for ($i = 0; $i < sizeof($teamData->leaders_history); $i++) {
            $teamData->leaders_history[$i]->first_name = trim($teamData->leaders_history[$i]->first_name);
            $teamData->leaders_history[$i]->last_name = trim($teamData->leaders_history[$i]->last_name);
        }

        $teamData->team_departments = TeamDepartments::select(['id',
            'name'])->where('deleted', 0)->where('team_id', $teamData->id)->get();
        for ($i = 0; $i < sizeof($teamData->team_departments); $i++) {
            $teamData->team_departments[$i]->is_editing = 0;
            $teamData->team_departments[$i]->is_deletable = 1;
            $roleByUsers = RolesByUsers::where(['team_department_id'=> $teamData->team_departments[$i]->id, 'deleted' => 0])->first();
            if ($roleByUsers) { 
                $teamData->team_departments[$i]->is_deletable = 0;
            }
        }

        $teamData->geographic_templates = GeographicFilterTemplates::where('team_id', $teamData->id)->get();
        // dd($teamData->geographic_templates->toArray());
        for ($i = 0; $i < sizeof($teamData->geographic_templates); $i++) {
            $teamData->geographic_templates[$i]->full_path = '';
            switch ($teamData->geographic_templates[$i]->entity_type) {
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                    $areasGroup = AreasGroup::where('id', $teamData->geographic_templates[$i]->entity_id)->where('deleted', 0)->first();
                    if($areasGroup){
                        $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                        $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;

                        $teamData->geographic_templates[$i]->full_path = $areasGroup->name ;

                        $teamData->geographic_templates[$i]->area_id = -1;
                        $teamData->geographic_templates[$i]->city_id = -1;
                        $teamData->geographic_templates[$i]->neighborhood_id = -1;
                        $teamData->geographic_templates[$i]->cluster_id = -1;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                    $area = Area::where('id', $teamData->geographic_templates[$i]->entity_id)->where('deleted', 0)->first();
                    if($area){
                        $teamData->geographic_templates[$i]->area_id = $area->id;
                        $teamData->geographic_templates[$i]->area_name = $area->name;
                        $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                        
                        if ($areasGroup) {
                            $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                            $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                            $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                        }
                        $teamData->geographic_templates[$i]->full_path .= $area->name ;
                        $teamData->geographic_templates[$i]->city_id = -1;
                        $teamData->geographic_templates[$i]->neighborhood_id = -1;
                        $teamData->geographic_templates[$i]->cluster_id = -1;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                    $subArea = SubArea::where('id', $teamData->geographic_templates[$i]->entity_id)->where('deleted', 0)->first();

                    if ($subArea) {
                        $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                        $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;

                        $area = Area::where('id', $subArea->area_id)->where('deleted', 0)->first();
                        if($area){
                            $teamData->geographic_templates[$i]->area_id = $area->id;
                            $teamData->geographic_templates[$i]->area_name = $area->name;
                            $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                            if ($areasGroup) {
                                $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                            }
                            $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                        }
                        $teamData->geographic_templates[$i]->full_path .= $subArea->name;
                        $teamData->geographic_templates[$i]->sub_area_id = $subArea->id;

                        $teamData->geographic_templates[$i]->city_id = -1;
                        $teamData->geographic_templates[$i]->neighborhood_id = -1;
                        $teamData->geographic_templates[$i]->cluster_id = -1;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):

                    $city = City::where('id', $teamData->geographic_templates[$i]->entity_id)->where('deleted', 0)->first();

                    if ($city) {
                        $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                        if ($subArea) {
                            $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                            $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                        }
                        $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                        if ($area) {
                            $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();

                            if ($areasGroup) {
                                $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                            }
                            $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                            $teamData->geographic_templates[$i]->area_id = $area->id;
                        }
                        $teamData->geographic_templates[$i]->full_path .= $city->name;
                        $teamData->geographic_templates[$i]->city_id = $teamData->geographic_templates[$i]->entity_id;
                        $teamData->geographic_templates[$i]->city_name = $city->name;
                        $teamData->geographic_templates[$i]->neighborhood_id = -1;
                        $teamData->geographic_templates[$i]->cluster_id = -1;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):

                    $neighborhood = Neighborhood::where('id', $teamData->geographic_templates[$i]->entity_id)->first();
                    if ($neighborhood) {
                        $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                        if ($city) {
                            $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                            if ($subArea) {
                                $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                                $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                            }
                            $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                            if ($area) {

                                $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                                if ($areasGroup) {
                                    $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                    $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                    $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                                }
                                $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                                $teamData->geographic_templates[$i]->area_id = $area->id;
                            }
                            $teamData->geographic_templates[$i]->full_path .= $city->name . ' >> ';
                            $teamData->geographic_templates[$i]->city_id = $city->id;
                            $teamData->geographic_templates[$i]->city_name = $city->name;
                        }
                        $teamData->geographic_templates[$i]->full_path .= $neighborhood->name;
                        $teamData->geographic_templates[$i]->neighborhood_id = $teamData->geographic_templates[$i]->entity_id;
                        $teamData->geographic_templates[$i]->neighborhood_name = $neighborhood->name;
                        $teamData->geographic_templates[$i]->cluster_id = -1;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):

                    $cluster = Cluster::where('id', $teamData->geographic_templates[$i]->entity_id)->first();
                    if ($cluster) {
                        $neighborhood = Neighborhood::where('id', $cluster->neighborhood_id)->first();
                        if ($neighborhood) {
                            $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                            if ($city) {
                                $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                                if ($subArea) {
                                    $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                                    $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                                }
                                $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                                if ($area) {
                                    $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                                    if ($areasGroup) {
                                        $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                        $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                        $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                                    }
                                    $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                                    $teamData->geographic_templates[$i]->area_id = $area->id;
                                }
                                $teamData->geographic_templates[$i]->full_path .= $city->name . ' >> ';
                                $teamData->geographic_templates[$i]->city_id = $city->id;
                                $teamData->geographic_templates[$i]->city_name = $city->name;
                            }
                            $teamData->geographic_templates[$i]->full_path .= $neighborhood->name . ' >> ';
                            $teamData->geographic_templates[$i]->neighborhood_id = $neighborhood->id;
                            $teamData->geographic_templates[$i]->neighborhood_name = $neighborhood->name;
                        } else {
                            $city = City::where('id', $cluster->city_id)->where('deleted', 0)->first();
                            if ($city) {
                                $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                                if ($subArea) {
                                    $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                                    $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                                }
                                $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                                if ($area) {
                                    $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                                    if ($areasGroup) {
                                        $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                        $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                        $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                                    }
                                    $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                                    $teamData->geographic_templates[$i]->area_id = $area->id;
                                }
                                $teamData->geographic_templates[$i]->full_path .= $city->name . ' >> ';
                                $teamData->geographic_templates[$i]->city_id = $city->id;
                                $teamData->geographic_templates[$i]->city_name = $city->name;
                            }
                        }
                        $teamData->geographic_templates[$i]->full_path .= $cluster->name;
                        $teamData->geographic_templates[$i]->cluster_id = $teamData->geographic_templates[$i]->entity_id;
                        $teamData->geographic_templates[$i]->cluster_name = $cluster->name;
                        $teamData->geographic_templates[$i]->ballot_id = -1;
                    }
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):

                    $ballot = BallotBox::where('id', $teamData->geographic_templates[$i]->entity_id)->first();
                    if ($ballot) {
                        $cluster = Cluster::where('id', $ballot->cluster_id)->first();
                        if ($cluster) {
                            $neighborhood = Neighborhood::where('id', $cluster->neighborhood_id)->first();
                            if ($neighborhood) {
                                $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                                if ($city) {
                                    $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                                    if ($subArea) {
                                        $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                                        $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                                    }
                                    $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                                    if ($area) {
                                        $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                                        if ($areasGroup) {
                                            $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                            $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                            $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                                        }
                                        $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                                        $teamData->geographic_templates[$i]->area_id = $area->id;
                                    }
                                    $teamData->geographic_templates[$i]->full_path .= $city->name . ' >> ';
                                    $teamData->geographic_templates[$i]->city_id = $city->id;
                                    $teamData->geographic_templates[$i]->city_name = $city->name;
                                }
                                $teamData->geographic_templates[$i]->full_path .= $neighborhood->name . ' >> ';
                                $teamData->geographic_templates[$i]->neighborhood_id = $neighborhood->id;
                                $teamData->geographic_templates[$i]->neighborhood_name = $neighborhood->name;
                            } else {
                                $city = City::where('id', $cluster->city_id)->where('deleted', 0)->first();
                                if ($city) {
                                    $subArea = SubArea::where('id', $city->sub_area_id)->where('deleted', 0)->first();
                                    if ($subArea) {
                                        $teamData->geographic_templates[$i]->sub_area_key = $subArea->key;
                                        $teamData->geographic_templates[$i]->sub_area_name = $subArea->name;
                                    }
                                    $area = Area::where('id', $city->area_id)->where('deleted', 0)->first();
                                    if ($area) {
                                        $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            
                                        if ($areasGroup) {
                                            $teamData->geographic_templates[$i]->area_group_id = $areasGroup->id;
                                            $teamData->geographic_templates[$i]->area_group_name = $areasGroup->name;
                                            $teamData->geographic_templates[$i]->full_path = $areasGroup->name . ' >> ';
                                        }
                                        $teamData->geographic_templates[$i]->full_path .= $area->name . ' >> ';
                                        $teamData->geographic_templates[$i]->area_id = $area->id;
                                    }
                                    $teamData->geographic_templates[$i]->full_path .= $city->name . ' >> ';
                                    $teamData->geographic_templates[$i]->city_id = $city->id;
                                    $teamData->geographic_templates[$i]->city_name = $city->name;
                                }
                            }
                            $teamData->geographic_templates[$i]->full_path .= $cluster->name . ' >> ';
                            $teamData->geographic_templates[$i]->cluster_id = $cluster->id;
                            $teamData->geographic_templates[$i]->cluster_name = $cluster->name;
                        }
                        $teamData->geographic_templates[$i]->full_path .= ' קלפי ' . $ballot->mi_id;
                        $teamData->geographic_templates[$i]->ballot_id = $ballot->id;
                        $teamData->geographic_templates[$i]->ballot_name = ' קלפי ' . $ballot->mi_id;
                    }
                    break;
            }
        }

        $teamData->sectorial_templates = SectorialFilterTemplates::where('team_id', $teamData->id)->get();

        $jsonOutput->setData($teamData);
    }
	
	/*
		Function that edits specific Team by teamKey and POST params (request)
	*/
    public function editExistingTeam(Request $request, $teamKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($teamKey == null || trim($teamKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($request->input('team_name') == null || trim($request->input('team_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_NAME'));
            return;
        }
        if ($request->input('leader_id') == null || !is_numeric($request->input('leader_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_LEADER'));
            return;
        }
        if ($request->input('leader_id') != -1) {
            $teamLDR = User::where('id', $request->input('leader_id'))->first();
            if (!$teamLDR) {
                $jsonOutput->setErrorCode(config('errors.system.TEAM_LEADER_NOT_EXISTS_IN_USERS_LIST'));
                return;
            }
        }

        $team = Teams::where('key', $teamKey)->first();

        if ($team) {

            $oldTeamValues = [
                'name' => $team->name,
                'leader_id' => $team->leader_id,
                'viewable' => $team->viewable,
            ];

            $team->name = $request->input('team_name');
            $team->leader_id = $request->input('leader_id');
            $viewable = $request->input('viewable');
            if (is_bool($viewable)) {
                $team->viewable = $viewable;
            }

            if ($request->input('leader_id') != -1) {
                $history = new TeamLeaderHistory;
                $history->team_id = $team->id;
                $history->user_id = $request->input('leader_id');
                $history->key = Helper::getNewTableKey('team_leader_history', 5);
                $history->save();

                $existingHistory = TeamLeaderHistory::where('id', '!=', $history->id)->where('end_date', null)->first();
                if ($existingHistory) {
                    $existingHistory->end_date = date(config('constants.APP_DATE_DB_FORMAT'));
                    $existingHistory->save();
                }
            }

            $changedValues = [];
            if ( $team->name != $oldTeamValues['name'] ) {
                $changedValues[] = [
                    'field_name' => 'name',
                    'display_field_name' => config('history.Teams.name'),
                    'old_value' => $oldTeamValues['name'],
                    'new_value' => $team->name
                ];
            }

            if ( $team->leader_id != $oldTeamValues['leader_id'] ) {
                $changedValues[] = [
                    'field_name' => 'leader_id',
                    'display_field_name' => config('history.Teams.leader_id'),
                    'old_numeric_value' => $oldTeamValues['leader_id'],
                    'new_numeric_value' => $team->leader_id
                ];
            }

            if ( count($changedValues) > 0 ) {
                $historyArgsArr = [
                    'topicName' => 'system.teams.edit',
                    'models' => [
                        [
                            'referenced_model' => 'Teams',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $team->id,
                            'valuesList' => $changedValues
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
            $crm_center = $request->input('crm_center');
            if($crm_center){ $team->crm_center = $crm_center; }
            $team->save();

            if ($crm_center) { 
                $otherCrmTeams = Teams::select('id')->where('id', '!=' , $team->id)->where('crm_center', 1)->get(); // Remove all others crm teams!
                foreach($otherCrmTeams as $otherTeam){ // Need to add history!!!
                    $otherTeam->crm_center = 0;
                    $otherTeam->save();
                }
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
        $jsonOutput->setData('ok');
    }
	
	/*
		Function that adds new Team by POST params
	*/
    public function addNewTeam(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        if ($request->input('team_name') == null || trim($request->input('team_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_NAME'));
            return;
        }

        $teamName = trim($request->input('team_name'));
        $team = Teams::select('id')->where('name', $teamName)->where('deleted', 0)->first();
        if ($team != null) {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_ALREADY_EXIST'));
            return;            
        }

        $newTeam = new Teams;
        $newTeam->deleted = 0;
        $newTeam->user_create_id = Auth::user()->id;
        $newTeam->name = $teamName;
        $newTeam->key = Helper::getNewTableKey('teams', 10);
        $newTeam->save();

        $historyArgsArr = [
            'topicName' => 'system.teams.add',
            'models' => [
                [
                    'referenced_model' => 'Teams',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newTeam->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Teams.name'),
                            'new_value' => $newTeam->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($newTeam->key);
    }

    public static function updateTeamRequestField(Request $request, $teamKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {

            $TeamRequestDetails = new TeamRequestDetailsDto(
                $teamKey,
                $request->input('title'),
                $request->input('phone_number'),
                $request->input('signature')
            );
            
            $team = TeamRepository::updateTeamRequestDetails($TeamRequestDetails);
            $jsonOutput->setData($team);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
