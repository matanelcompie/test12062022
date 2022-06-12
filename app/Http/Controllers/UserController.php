<?php

namespace App\Http\Controllers;

use App\Enums\CommonEnum;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CrmRequestController;
use App\Http\Controllers\Tm\CampaignController;
use App\Http\Controllers\VoterController;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Address;
use App\Libraries\Helper;
use App\Libraries\HelpFunctions;
use App\Mail\NewUserPassword;
use Session;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\GeographicFilters;
use App\Models\GeographicFilterTemplates;
use App\Models\Modules;
use App\Models\Neighborhood;
use App\Models\PhoneTypes;
use App\Models\RolesByUsers;
use App\Models\SectorialFilterDefinitions;
use App\Models\SectorialFilterItems;
use App\Models\SectorialFilters;
use App\Models\SectorialFilterTemplates;
use App\Models\Streets;
use App\Models\SubArea;
use App\Models\TeamDepartments;
use App\Models\Teams;
use App\Models\User;
use App\Models\RequestTopicUsers;
use App\Models\Tm\UsersInCampaigns;
use App\Models\UserFavorites;
use App\Models\UserPhones;
use App\Models\UserRoles;
use App\Models\Voters;
use App\Models\VoterPhone;
use App\Models\Permission;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * Class UserController
 * This controller handles the actions
 * and information regarding the user screen.
 *
 * @package App\Http\Controllers
 */
class UserController extends Controller
{

    /**
     * @method getUserGeographicalLists
     * Get user geo lists-> define by the specific user Geographic Filters permissios
     * optional lists: (areas, subAreas, cities).
     * @param  $request[areas,subAreas,cities],
     * -> must to define the requested geo list!
     * @return {obj} geo lists for user.
     */
    public function getUserGeographicalLists(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $user = Auth::user();
        $screenPermission = $request->input('screen_permission', null);

        $hotBallotsScreens = ['elections.dashboards.election_day'];
        if (in_array($screenPermission, $hotBallotsScreens)) {
            $hotBallots = true;
        } else {
            $hotBallots = false;
        }

        $getAreasList = $request->input('areas', null);
        $getSubAreasList = $request->input('sub_areas', null);
        $getCitiesList = $request->input('cities', null);
        $inCurrentElectionCampaign = $request->input('in_current_election_campaign', null);
        if($inCurrentElectionCampaign){
            $currentCampaignObj =  ElectionCampaigns::currentCampaign();
            $electionCampaignId = $currentCampaignObj['id'];
        }
        $returnLists= new \stdClass;
        $userGeoFilters = GeoFilterService::getGeoFiltersForUser($screenPermission);
        $areasIDS = $userGeoFilters['areasIDS'];
        $citiesIDS = $userGeoFilters['citiesIDS'];
        $sub_areasIDS = $userGeoFilters['sub_areasIDS'];
 

        $areas = [];
        $subAreas = [];
        $cities = [];

        if ($getAreasList) {
            $areas = Area::select('id', 'name', 'key')->where('deleted', 0);
            if($inCurrentElectionCampaign){
                $areas->whereHas('cities.clusters' , function($query) use ($electionCampaignId, $hotBallots){
                    $query->where('clusters.election_campaign_id', $electionCampaignId);
                    if ($hotBallots) {
                        $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                                ->where('ballot_boxes.hot', 1);
                    }
                });
            }
            // if($areasIDS){
                $areas = $areas->whereIn('id', $areasIDS);
            // }
            $areas = $areas->orderBy('areas.name')->get();
        }
        if ($getSubAreasList) {
            $subAreas = SubArea::select('sub_areas.id', 'sub_areas.name', 'sub_areas.key', 'sub_areas.area_id')
								->join('areas','areas.id','=','sub_areas.area_id')
								->where('sub_areas.deleted', 0)
								->where('areas.deleted', 0);
								
            // if($sub_areasIDS){
                $subAreas = $subAreas->whereIn('sub_areas.id', $sub_areasIDS);
            // }

            if ($hotBallots) {
                $subAreas->join('cities', 'cities.sub_area_id', '=', 'sub_areas.id')
                        ->join('clusters', 'clusters.city_id', '=', 'cities.id')
                        ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                        ->where('clusters.election_campaign_id', $electionCampaignId)
                        ->where('ballot_boxes.hot', 1)
                        ->groupBy('sub_areas.id');
            }
            $subAreas  = $subAreas->get();
        }
        if ($getCitiesList) {
            $cities = City::select('cities.id', 'cities.name', 'cities.key', 'cities.area_id', 'cities.sub_area_id')
							->join('areas','areas.id','=','cities.area_id')
							->orderBy('name','asc')
							->where('areas.deleted', 0)
							->where('cities.deleted', 0);
            if($inCurrentElectionCampaign){
                $cities->whereHas('clusters' , function($query) use ($electionCampaignId, $hotBallots){
                    $query->where('clusters.election_campaign_id', $electionCampaignId);
                    if ($hotBallots) {
                        $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                                ->where('ballot_boxes.hot', 1);
                    }                    
                });
            }
            // if($citiesIDS){
                $cities = $cities->whereIn('cities.id', $citiesIDS);
            // }

            $cities = $cities->get();
  
        }


        $returnLists->areas = $areas;
        $returnLists->sub_areas = $subAreas;
        $returnLists->cities = $cities;
        $jsonOutput->setData($returnLists);
    }

    private function getUserPhonesHash($userKey)
    {

        $userPhonesFields = ['user_phones.id', 'user_phones.key'];

        $userPhones = UserPhones::where('users.key', $userKey)->withUser()->where('user_phones.deleted', 0)
            ->select($userPhonesFields)->get();

        $userPhonesHash = [];
        for ($index = 0; $index < count($userPhones); $index++) {
            $key = $userPhones[$index]->key;

            $userPhonesHash[$key] = ["id" => $userPhones[$index]->id,
                "key" => $key,
            ];
        }

        return $userPhonesHash;
    }

    /**
     * This function returns all user roles from user_roles table
     */
    public function getUserRoles()
    {

        $jsonOutput = app()->make("JsonOutput");
        $userRoles = UserRoles::select(['user_roles.id','user_roles.name','module_id','modules.system_name AS module_name', 'user_roles.key'])
            ->join('modules','modules.id','=','user_roles.module_id')
            ->where('deleted', 0)
            ->get();
        $jsonOutput->setData($userRoles);
    }
    public function getUserRolePermissions($userRoleKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $userRole = UserRoles::select('id', 'key', 'name')->where('deleted', 0)->where('key', $userRoleKey)->first();
        if ($userRole) {
            $userRole->permissions = $userRole->permissions()->select('permissions.key')->get();
            $jsonOutput->setData($userRole);
        } else {
            $jsonOutput->setErrorCode(config('errors.system.GROUP_NOT_EXIST'));
        }
    }
    public function updateUserRolePermissions(Request $request, $userRoleKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $isError = false;
        $userRole = UserRoles::where('key', $userRoleKey)->first();
        if (!$userRole) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            $isError = true;
        }

        if (!$isError) {

            $permissions = $request->input('permissions', null);
            if ($permissions) {
                $permissionHash = [];

                foreach ($permissions as $per) {$permissionHash[$per] = true;}

                $currentPermissions = $userRole->permissions;
                // dd('$permissions', $permissions, $currentPermissions->toArray());

                forEach ($currentPermissions as $currentPermission) {
                    if (!array_key_exists($currentPermission->key, $permissionHash))
                        $userRole->permissions()->detach($currentPermission->id);
                    else
                        unset($permissionHash[$currentPermission->key]);
                }
                forEach ($permissionHash as $permissionKey => $permissionValue) {
                    $permission = Permission::select('id')->where('key', $permissionKey)->first();

                    if ($permission) $userRole->permissions()->attach($permission->id);
                }
            }
            $jsonOutput->setData('ok');
        }
    }

    public function getPhoneTypes()
    {

        $jsonOutput = app()->make("JsonOutput");
        $phoneTypes = PhoneTypes::select(['id',
            'name'])->where('deleted', 0)->get();
        $jsonOutput->setData($phoneTypes);
    }

    public function addNewUserPhone(Request $request, $userKey)
    {

        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        }

        $jsonOutput = app()->make("JsonOutput");

        UserPhones::where('user_id', $userID)->delete();

        $newPhone = new UserPhones;
        $newPhone->phone_type_id = $request->input('phone_type_id');
        $newPhone->phone_number = str_replace('-', '', $request->input('phone_number'));
        $newPhone->user_id = $userID;
        $newPhone->save();

        $historyArgsArr = [
            'topicName' => 'system.users.edit',
            'models' => [
                'referenced_model' => 'UserPhones',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newPhone->id,
                'valuesList' => [
                    [
                        'field_name' => 'user_id',
                        'display_field_name' => config('history.UserPhones.user_id'),
                        'new_numeric_value' => $newPhone->user_id,
                    ],
                    [
                        'field_name' => 'phone_type_id',
                        'display_field_name' => config('history.UserPhones.phone_type_id'),
                        'new_numeric_value' => $newPhone->phone_type_id,
                    ],
                    [
                        'field_name' => 'phone_number',
                        'display_field_name' => config('history.UserPhones.phone_number'),
                        'new_value' => $newPhone->phone_number,
                    ],
                ],
            ],
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $userPhones = UserPhones::select(['user_phones.id as id',
            'phone_type_id',
            'phone_number',
            'phone_types.name as name'])->withType()->where('user_id', $user->id)->where('user_phones.deleted', 0)->get();

        for ($phoneIndex = 0; $phoneIndex < count($userPhones); $phoneIndex++) {
            $userPhones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($userPhones[$phoneIndex]->phone_number);
        }

        $jsonOutput->setData($userPhones);
    }

    public function deleteUserPhone($userKey, $recordID)
    {
        $jsonOutput = app()->make("JsonOutput");

        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        }

        $phoneToDelete = UserPhones::where('user_id', $userID)->where('id', $recordID)->first();
        if ($phoneToDelete) {
            $phoneToDelete->deleted = 1;
            $phoneToDelete->save();

            $historyArgsArr = [
                'topicName' => 'system.users.edit',
                'models' => [
                    'referenced_model' => 'UserPhones',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $phoneToDelete->id,
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $userPhones = UserPhones::select(['user_phones.id as id',
            'phone_type_id',
            'phone_number',
            'phone_types.name as name'])->withType()->where('user_id', $user->id)->where('user_phones.deleted', 0)->get();

        for ($phoneIndex = 0; $phoneIndex < count($userPhones); $phoneIndex++) {
            $userPhones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($userPhones[$phoneIndex]->phone_number);
        }

        $jsonOutput->setData($userPhones);
    }

    public function updateUserPhone(Request $request, $userKey, $recordID)
    {
        $jsonOutput = app()->make("JsonOutput");

        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        }

        $phoneToDelete = UserPhones::where('user_id', $userID)->where('id', $recordID)->first();
        if ($phoneToDelete) {
            $changedValues = [];

            $oldPhoneValues = [
                'phone_type_id' => $phoneToDelete->phone_type_id,
                'phone_number' => $phoneToDelete->phone_number,
            ];

            $phoneToDelete->phone_type_id = $request->input('phone_type_id');
            $phoneToDelete->phone_number = str_replace('-', '', $request->input('phone_number'));
            $phoneToDelete->save();

            if ($phoneToDelete->phone_type_id != $oldPhoneValues['phone_type_id']) {
                $changedValues[] = [
                    'field_name' => 'phone_type_id',
                    'display_field_name' => config('history.UserPhones.phone_type_id'),
                    'old_numeric_value' => $oldPhoneValues['phone_type_id'],
                    'new_numeric_value' => $phoneToDelete->phone_type_id,
                ];
            }

            if ($phoneToDelete->phone_number != $oldPhoneValues['phone_number']) {
                $changedValues[] = [
                    'field_name' => 'phone_number',
                    'display_field_name' => config('history.UserPhones.phone_number'),
                    'old_value' => $oldPhoneValues['phone_number'],
                    'new_value' => $phoneToDelete->phone_number,
                ];
            }

            if (count($changedValues) > 0) {
                $historyArgsArr = [
                    'topicName' => 'system.users.edit',
                    'models' => [
                        [
                            'referenced_model' => 'UserPhones',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $phoneToDelete->id,
                            'valuesList' => $changedValues,
                        ],
                    ],
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }

        $userPhones = UserPhones::select(['user_phones.id as id', 'phone_type_id', 'phone_number', 'phone_types.name as name'])
            ->withType()
            ->where('user_id', $user->id)
            ->where('user_phones.deleted', 0)
            ->get();

        for ($phoneIndex = 0; $phoneIndex < count($userPhones); $phoneIndex++) {
            $userPhones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($userPhones[$phoneIndex]->phone_number);
        }

        $jsonOutput->setData($userPhones);
    }

    private function validateEmail($email)
    {
        $rules = [
            'email' => 'email',
        ];
        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            $messages = $validator->messages();
            $this->errorMessage = $messages->first('email');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that returns all users list
	*/
	private function getAllUsersList(){
		 $users = User::all();
         for ($i = 0; $i < sizeof($users); $i++) {
              $users[$i]->password = '';
              $users[$i]->remember_token = '';
              $tempMetaData = $users[$i]->metadata()->first(['first_name','last_name']);
              if ($tempMetaData) {
                     $users[$i]->full_name = $tempMetaData->first_name . ' ' . $tempMetaData->last_name;
              }
         }
		 return $users;
	}
	
    /*
		API function that returns all users list if no parametes is specified , 
		or returns user by metadata_id or personal_identity
	*/
    public function getUsers(Request $request, $userKey = null)
    {
        $jsonOutput = app()->make("JsonOutput");
		if(!$userKey && !$request->input("metadata_id") && !$request->input("identity")){ 
		//if not loaded by userKey niether by personal_identity/metadata_id(voter_id) - it will load all users : 
			$jsonOutput->setData($this->getAllUsersList()); // return all users
			return;
		}
        if ($userKey == null) { // search by personal_identity or metadata_id
                if ($request->input("metadata_id")) {
                    $user = User::select(['id',
                        'key',
                        'voter_id',
                        'password_date',
                        'user_create_id',
                        'work_city_id',
                        'work_neighborhood',
                        'work_street_id',
                        'work_house',
                        'work_house_entry',
                        'work_flat',
                        'email',
                        'active',
                        'cancel_payment',
                        'deleted',
                        'created_at',
                        'updated_at', 'admin'])->where('voter_id', $request->input("metadata_id"))->first();
						
					$voterByID =  Voters::select('personal_identity')->where('id',$request->input("metadata_id"))->first();
					if(!$voterByID ){
						$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                        return;
					}
					$unnulled_personal_identity = $voterByID->personal_identity;
                }
                if ($request->input("identity")) {
                    $unnulled_personal_identity = ltrim($request->input("identity"), '0'); //identity number without zeros from left

                    $voter_data = Voters::withFilters()->where('personal_identity', $unnulled_personal_identity)->first(['voters.id']);
                    $voter_data_unfiltered = Voters::where('personal_identity', $unnulled_personal_identity)->first(['voters.id']);

                    $user = null;

                    if (!$voter_data_unfiltered) {
                        $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                        return;
                    } elseif (!$voter_data) {
                        $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
                        return;
                    }

                    $user = User::where('voter_id', $voter_data->id)->first();
                }
 
                if ($user) { //if found user
                    $user_voter_data = Voters::withFilters()->where('voters.id', $user->voter_id)->first(['voters.id']);
                    $user_voter_data_unfiltered = Voters::where('id', $user->voter_id)->first(['voters.id']);

                    if (!$user_voter_data_unfiltered) {
                        $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                        return;
                    } elseif (!$user_voter_data) {
                        $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
                        return;
                    }

                    $theStreet = Streets::where('id', $user->work_street_id)->first();
                    if ($theStreet) {
                        $user->work_street = $theStreet->name;
                    }
                    $formattedCreationDate = substr($user->created_at, 0, 10);
                    $formattedPasswordDate = substr($user->password_date, 0, 10);
                    $formattedCreationDateArray = explode("-", $formattedCreationDate);
                    $formattedPasswordDateArray = explode("-", $formattedPasswordDate);
                    $userMetadata = $user->metadata()->first(['personal_identity',
                        'last_name',
                        'first_name',
                        'gender']);
                    $user->personal_identity = $userMetadata->personal_identity;
                    $user->last_name = $userMetadata->last_name;
                    $user->first_name = $userMetadata->first_name;
                    $user->gender = $userMetadata->gender;
                    $user->languages=$user->languages()->select('language_id AS value', 'languages_by_users.main', 'user_id', 'languages_by_users.id', 'languages.name AS label')
                    ->join('languages', 'languages_by_users.language_id', '=', 'languages.id')->get()->toArray();

                    $user->password_created_at = $formattedPasswordDateArray[2] . "/" . $formattedPasswordDateArray[1] . "/" . $formattedPasswordDateArray[0];
                    $user->user_created_at = $formattedCreationDateArray[2] . "/" . $formattedCreationDateArray[1] . "/" . $formattedCreationDateArray[0];
                    $userVoterData = $user->voter()->first(['shas_representative']);
                    if ($userVoterData) {
                        $user->shas_representative = $userVoterData->shas_representative;
                    } else {
                        $newVoter = new Voters;
                        $newVoter->main_voter_phone_id = 2;
                        $newVoter->save();
                        $user->shas_representative = 0;
                    }

                    $city = City::where('id', $user->work_city_id)->where('deleted', 0)->first();
                    if ($city) {
                        $user->work_city_name = $city->name;
                        $user->work_city_key = $city->key;
                    }

                    $phones = UserPhones::select(['user_phones.id as id',
                        'user_phones.key as key',
                        'phone_type_id',
                        'phone_number',
                        'phone_types.name as name'])
                        ->withType()
                        ->where('user_id', $user->id)
                        ->where('user_phones.deleted', 0)
                        ->limit(1)
                        ->get();

                    for ($phoneIndex = 0; $phoneIndex < sizeof($phones); $phoneIndex++) {
                        $phones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($phones[$phoneIndex]->phone_number);
                    }
                    $user->userPhones = $phones;
                    if ($user->user_create_id > 0) {
                        $tempUser = User::where('id', $user->user_create_id)->first();
                        if ($tempUser) {
                            $tempUserMetadata = $tempUser->metadata()->first(['last_name',
                                'first_name']);
                            if ($tempUserMetadata) {
                                $user->user_create_name = trim($tempUserMetadata->first_name) . ' ' . trim($tempUserMetadata->last_name);
                            } else {
                                $user->user_create_name = '';
                            }
                        } else {
                            $user->user_create_name = '';
                        }
                    } else {
                        $user->user_create_name = '';
                    }
                    //$user->is_new = false;
                    $user->roles_by_user = RolesByUsers::where(['user_id' => $user->id,'deleted' => DB::raw(0)])->get();

                    $userRolesLength = sizeof($user->roles_by_user);
                    for ($i = 0; $i < $userRolesLength; $i++) {
                        $userTeam = Teams::where('id', $user->roles_by_user[$i]->team_id)->first();
                        if ($userTeam) {
                            $user->roles_by_user[$i]->team_name = $userTeam->name;
                            $user->roles_by_user[$i]->team_key = $userTeam->key;
                        } else {
                            $user->roles_by_user[$i]->team_name = '';
                            $user->roles_by_user[$i]->team_key = '';
                        }

                        $userDep = TeamDepartments::where('id', $user->roles_by_user[$i]->team_department_id)->first();
                        if ($userDep) {
                            $user->roles_by_user[$i]->team_department_name = $userDep->name;
                        } else {
                            $user->roles_by_user[$i]->team_department_name = '';
                        }

                        $user->roles_by_user[$i]->is_editing = false;

                        $user->roles_by_user[$i]->sectorial_filters = SectorialFilters::select(['id',
                            'name'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->get();
                        for ($m = 0; $m < sizeof($user->roles_by_user[$i]->sectorial_filters); $m++) {
                            $tempFilterItem = SectorialFilterItems::select(['entity_type',
                                'sectorial_filter_definition_id'])->where('entity_id', $user->roles_by_user[$i]->sectorial_filters[$m]->id)->get();
                            $tempArray = array();
                            for ($a = 0; $a < sizeof($tempFilterItem); $a++) {
                                if ($tempFilterItem[$a]->entity_type == 0) {
                                    $user->roles_by_user[$i]->sectorial_filters[$m]->inherited = 0;
                                    $tempDefinition = SectorialFilterDefinitions::select(['id',
                                        'sectorial_filter_definitions_group_id'])->where('id', $tempFilterItem[$a]->sectorial_filter_definition_id)->get();

                                    for ($s = 0; $s < sizeof($tempDefinition); $s++) {
                                        //$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                                        if (!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id, $tempArray)) {
                                            array_push($tempArray, $tempDefinition[$s]->sectorial_filter_definitions_group_id);
                                        }
                                    }
                                } else {
                                    $user->roles_by_user[$i]->sectorial_filters[$m]->inherited = 1;
                                }
                            }

                            $user->roles_by_user[$i]->sectorial_filters[$m]->definition_group_ids = $tempArray;
                        }

                        $filters = GeographicFilters::select(['id',
                            'name',
                            'inherited_id',
                            'entity_type',
                            'entity_id'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->orderBy('inherited_id', 'ASC')->get();

                        $this->getUserGeoFiltersPath($filters);

                        $user->roles_by_user[$i]->filters;

                        $team_geo_filters = GeographicFilters::select(['id',
                            'name',
                            'entity_type',
                            'entity_id'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->whereNull('inherited_id')->orderBy('inherited_id', 'ASC')->get();

                        $user->roles_by_user[$i]->team_geo_filters =$this->getUserGeoFiltersPath($team_geo_filters);

                        $userRoles = UserRoles::where('id', $user->roles_by_user[$i]->user_role_id)->first();
                        
                        if ($userRoles) {
                            $user->roles_by_user[$i]->name = $userRoles->name;
                            $module = Modules::where('id', $userRoles->module_id)->first();
                            if ($module) {
                                $user->roles_by_user[$i]->module_name = $module->name;
                            }
                        }
                    }

                    $jsonOutput->setData($user);
                } 
				else { // else it will return error message
                    $user = Voters::select(['voters.id',
                        'personal_identity',
                        'first_name',
                        'last_name',
                        'mi_house as work_house',
                        'mi_neighborhood as work_neighborhood',
                        'mi_house_entry as work_house_entry',
                        'mi_street as work_street',
                        'mi_flat as work_flat' ])
						->selectRaw('IF(mi_city_details.name IS NULL , mi_city , mi_city_details.name) as work_city_name')
						->leftJoin('cities as mi_city_details' , 'mi_city_details.id','=','voters.mi_city_id')
						->where('personal_identity', $unnulled_personal_identity)->first();
                    if ($user) {
                        //$user->is_new = true;
                        $user->key = 'new';
                        $user->personal_identity = $user->personal_identity;
                        $user->first_name = trim($user->first_name);
                        $user->last_name = trim($user->last_name);

                        $user->userPhones = array();
                        $user->email = '';
                        $jsonOutput->setData($user);
                    } else {
                        $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
                    }
                }
				 
		 
        } 
		else { // else - search by user key only
            $user = User::select(['id',
                'key',
                'voter_id',
                'password_date',
                'two_step_authentication',
                'sms_wrong_attempts_cnt',
                'permission_group_id',
                'user_create_id',
                'work_city_id',
                'work_neighborhood',
                'work_street_id',
                'work_house',
                'work_house_entry',
                'work_flat',
                'email',
                'active',
                'cancel_payment',
                'deleted',
                'created_at',
                'updated_at', 'admin'])->where('key', $userKey)->first(); //first try to find user by user key
            if ($user != null) { // if found - ther it will return user metadata

                $user_voter_data = Voters::withFilters()->where('voters.id', $user->voter_id)->first(['voters.id']);
                $user_voter_data_unfiltered = Voters::where('id', $user->voter_id)->first(['voters.id']);

                if (!$user_voter_data_unfiltered) {
                    $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                    return;
                } elseif (!$user_voter_data) {
                    $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
                    return;
                }

                $formattedCreationDate = substr($user->created_at, 0, 10);
                $formattedPasswordDate = substr($user->password_date, 0, 10);
                $formattedCreationDateArray = explode("-", $formattedCreationDate);
                $formattedPasswordDateArray = explode("-", $formattedPasswordDate);
                $userMetadata = $user->metadata()->first(['personal_identity',
                    'last_name',
                    'first_name',
                    'gender']);
                $user->personal_identity = $userMetadata->personal_identity;
                $user->work_street = '';
                $theStreet = Streets::where('id', $user->work_street_id)->first();
                if ($theStreet) {
                    $user->work_street = $theStreet->name;
                }
                $user->last_name = $userMetadata->last_name;
                $user->first_name = $userMetadata->first_name;
                $user->gender = $userMetadata->gender;
                $user->password_created_at = $formattedPasswordDateArray[2] . "/" . $formattedPasswordDateArray[1] . "/" . $formattedPasswordDateArray[0];
                $user->user_created_at = $formattedCreationDateArray[2] . "/" . $formattedCreationDateArray[1] . "/" . $formattedCreationDateArray[0];

                $user->is_user_locked = $user->sms_wrong_attempts_cnt >= config('constants.users.MAX_WRONG_ATTEMPTS');

                $userVoterData = $user->voter()->first(['shas_representative']);
                if ($userVoterData) {
                    $user->shas_representative = $userVoterData->shas_representative;
                } else {
                    $newVoter = new Voters;
                    $newVoter->main_voter_phone_id = 2;
                    $newVoter->save();
                    $user->shas_representative = 0;
                }
                /* if found, return user metadata */

                $city = City::where('id', $user->work_city_id)->where('deleted', 0)->first();
                if ($city) {
                    $user->work_city_name = $city->name;
                    $user->work_city_key = $city->key;
                }

                $phones = UserPhones::select(['user_phones.id as id',
                    'user_phones.key as key',
                    'phone_type_id',
                    'phone_number',
                    'phone_types.name as name'])->withType()->where('user_id', $user->id)->where('user_phones.deleted', 0)->get();

                for ($phoneIndex = 0; $phoneIndex < count($phones); $phoneIndex++) {
                    $phones[$phoneIndex]->phone_number = Helper::addHyphenToPhoneNumber($phones[$phoneIndex]->phone_number);
                }

                $user->userPhones = $phones;

                if ($user->user_create_id > 0) {
                    $tempUser = User::where('id', $user->user_create_id)->first();
                    if ($tempUser) {
                        $tempUserMetadata = $tempUser->metadata()->first(['last_name',
                            'first_name']);
                        if ($tempUserMetadata) {
                            $user->user_create_name = trim($tempUserMetadata->first_name) . ' ' . trim($tempUserMetadata->last_name);
                        } else {
                            $user->user_create_name = '';
                        }
                    } else {
                        $user->user_create_name = '';
                    }
                } else {
                    $user->user_create_name = '';
                }

                $user->roles_by_user = RolesByUsers::where(['user_id' => $user->id, 'deleted' => DB::raw(0)])->get();

                $userRolesLength = sizeof($user->roles_by_user);
                for ($i = 0; $i < $userRolesLength; $i++) {
                    $userTeam = Teams::where('id', $user->roles_by_user[$i]->team_id)->where('deleted', 0)->first();
                    if ($userTeam) {
                        $user->roles_by_user[$i]->team_name = $userTeam->name;
                        $user->roles_by_user[$i]->team_key = $userTeam->key;
                    } else {
                        $user->roles_by_user[$i]->team_name = '';
                        $user->roles_by_user[$i]->team_key = '';
                    }

                    $userDep = TeamDepartments::where('id', $user->roles_by_user[$i]->team_department_id)->first();
                    if ($userDep) {
                        $user->roles_by_user[$i]->team_department_name = $userDep->name;
                    } else {
                        $user->roles_by_user[$i]->team_department_name = '';
                    }

                    $user->roles_by_user[$i]->is_editing = false;

                    $user->roles_by_user[$i]->sectorial_filters = SectorialFilters::select(['id',
                        'name'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->get();

                    $user->roles_by_user[$i]->sectorial_filters = SectorialFilters::select(['id',
                        'name'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->get();
                    for ($m = 0; $m < sizeof($user->roles_by_user[$i]->sectorial_filters); $m++) {
                        $tempFilterItem = SectorialFilterItems::select(['entity_type',
                            'sectorial_filter_definition_id'])->where('entity_id', $user->roles_by_user[$i]->sectorial_filters[$m]->id)->get();
                        $tempArray = array();
                        for ($a = 0; $a < sizeof($tempFilterItem); $a++) {
                            if ($tempFilterItem[$a]->entity_type == 0) {
                                $user->roles_by_user[$i]->sectorial_filters[$m]->inherited = 0;
                                $tempDefinition = SectorialFilterDefinitions::select(['id',
                                    'sectorial_filter_definitions_group_id'])->where('id', $tempFilterItem[$a]->sectorial_filter_definition_id)->get();

                                for ($s = 0; $s < sizeof($tempDefinition); $s++) {
                                    //$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                                    if (!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id, $tempArray)) {
                                        array_push($tempArray, $tempDefinition[$s]->sectorial_filter_definitions_group_id);
                                    }
                                }
                            } else {
                                $user->roles_by_user[$i]->sectorial_filters[$m]->inherited = 1;
                            }
                        }
                        $user->roles_by_user[$i]->sectorial_filters[$m]->definition_group_ids = $tempArray;
                    }

                    $filters = GeographicFilters::select(['id',
                        'name',
                        'inherited_id',
                        'entity_type',
                        'entity_id'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->orderBy('inherited_id', 'ASC')->get();

                    $this->getUserGeoFiltersPath($filters);

                    $user->roles_by_user[$i]->geo_filters = $filters;

                    $team_geo_filters = GeographicFilters::select(['id',
                        'name',
                        'entity_type',
                        'entity_id'])->where('role_by_user_id', $user->roles_by_user[$i]->id)->where('user_id', $user->id)->whereNull('inherited_id')->orderBy('inherited_id', 'ASC')->get();

                    $this->getUserGeoFiltersPath($team_geo_filters);
                    // $this->getUserTeamGeoFiltersPath($team_geo_filters);
                    $user->roles_by_user[$i]->team_geo_filters = $team_geo_filters;

                    $userRoles = UserRoles::where('id', $user->roles_by_user[$i]->user_role_id)->first();
                    if ($userRoles) {
                        $user->roles_by_user[$i]->name = $userRoles->name;
                        $module = Modules::where('id', $userRoles->module_id)->first();
                        if ($module) {
                            $user->roles_by_user[$i]->module_name = $module->name;
                        }
                    }
                }

                $jsonOutput->setData($user);
            } 
			else { // else it will return error message
                $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            }
        }
    }

    public function unlockOtherUser(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $otherUserKey = $request->input('other_user_key', null);
        $currentUser = Auth::user();

        if (!$currentUser || $currentUser->admin == 0){
            $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
            return;
        }
        $otherUser = User::select('users.id','password', 'voters.id as voter_id')
        ->withVoter()
        ->where('users.key', $otherUserKey)->first();
        if (!$otherUser){
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        $otherUser->sms_wrong_attempts_cnt = 0;
        $otherUser->save();
        /*
            $historyArgsArr = [
                'topicName' => 'user.password.change',
                'models' => [
                    [
                        
                        // 'voter_id' => $otherUser->voter_id,
                        'referenced_model' => 'User',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $otherUser->id,
                        'valuesList' => [],
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        */
        $jsonOutput->setData('ok');
        return;
    }
    public function updateOtherUserPassword(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $otherUserKey = $request->input('other_user_key', null);
        $newPassword = $request->input('new_password', null);
        // dd($request->toArray());
        $currentUser = Auth::user();

        if (!$currentUser || $currentUser->admin == 0){
            $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
            return;
        }
        $otherUser = User::select('users.id','password', 'voters.id as voter_id')
        ->withVoter()
        ->where('users.key', $otherUserKey)->first();
        if (!$otherUser){
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }
        $userHashedPassword = $otherUser->password;

        if ( !HelpFunctions::validatePasswordFormat($newPassword)){
            $jsonOutput->setErrorMessage( trans( 'auth.invalid_password' ) );
            return;
        }

        if (Hash::check($newPassword, $userHashedPassword)) {
            $jsonOutput->setErrorCode(config('errors.system.NEW_AND_OLD_PASSWORDS_ARE_IDENTICAL'));
            return;
        }

        $otherUser->password = Hash::make($newPassword);
        $currentDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $otherUser->password_date = $currentDate;
        $otherUser->initial_password = 0;
        $otherUser->save();

        $historyArgsArr = [
            'topicName' => 'user.password.change',
            'models' => [
                [
                    
                    // 'voter_id' => $otherUser->voter_id,
                    'referenced_model' => 'User',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $otherUser->id,
                    'valuesList' => [],
                ],
            ],
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('ok');
        return;
    }

    /**
     * this function changes users password (the user who's logged in)
     * type = 1: changes user password
     * type = 2: sets is view all voters for user in the session (admin user can view all voters)
     * @param Request $request
     */
    public function updateCurrentUser(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $switchUserKey = $request->input('switch_user_key', null);

        $user = Auth::user();

        if (!$user){
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        if ($request->input('type') == 1) {
            $oldPassword = $request->input('old_password');
            $newPassword = $request->input('new_password');

            //password validation
            if ($oldPassword == null || $newPassword == null) {
                $jsonOutput->setErrorCode(config('errors.system.MISSING_PASSWORD'));
                return;
            }

            $userHashedPassword = $user->password;
            if (!Hash::check($oldPassword, $userHashedPassword)) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_OLD_PASSWORD'));
                return;
            }

            if ( !HelpFunctions::validatePasswordFormat($newPassword)){
                $jsonOutput->setErrorMessage( trans( 'auth.invalid_password' ) );
                return;
            }

            if (Hash::check($newPassword, $userHashedPassword)) {
                $jsonOutput->setErrorCode(config('errors.system.NEW_AND_OLD_PASSWORDS_ARE_IDENTICAL'));
                return;
            }

            $user->password = Hash::make($newPassword);
            $currentDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
            $user->password_date = $currentDate;
            $user->initial_password = 0;
            $user->save();

            $jsonOutput->setData($user->password);
            return;

        }else if ($request->input('type') == 2) { // type = 2
            if (!$user->admin){
                $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
                return;
            }
            $isViewAllVoters = $request->input('is_view_all_voters');
            $request->session()->put('isViewAllVotersField', $isViewAllVoters);
            UserRepository::updateIsViewAllVoter($user,$isViewAllVoters);

            $jsonOutput->setData('ok');
            return;
        }

        //switch current logged in user to the selected user
        if ($switchUserKey != null) {

            if (!$user->admin){
                $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
                return;
            }

            $userToSwitch = User::where('key', $switchUserKey)->first();
            if ($userToSwitch == null) {
                $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
                return ;
            }
            Session::set('controlling_user_id', Auth::user()->id);
            Auth::login($userToSwitch, false);
        }

        $jsonOutput->setData('ok');
        return;
    }

    /**
     * This function saves existing user data by sent fields.
     *
     * @param Request $request
     */
    public function saveUser(Request $request, $user_key)
    {
        $jsonOutput = app()->make("JsonOutput");

        $changedUserFields = [];
        $changedVoterFields = [];

        if ($user_key == null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }

        $user = User::where('key', $user_key)->first();
        if (!$user) {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        if ($request->input("city_id") != null) {
            if (!is_numeric($request->input('city_id'))) {
                $jsonOutput->setErrorCode(config('errors.system.MISSING_CITY_ID'));
                return;
            }
            $check_city = City::where('id', $request->input("city_id"))->where('deleted', 0)->first();
            if (!$check_city) {
                $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
                return;
            }

            if ($user->work_city_id != $request->input("city_id")) {
                $changedUserFields[] = [
                    'field_name' => 'work_city_id',
                    'display_field_name' => config('history.User.work_city_id'),
                    'old_numeric_value' => $user->work_city_id,
                    'new_numeric_value' => $request->input("city_id"),
                ];
            }
            $user->work_city_id = $request->input("city_id");
        }

        if ($request->input("neighborhood") != null) {
            if ($user->work_neighborhood != $request->input("neighborhood")) {
                $changedUserFields[] = [
                    'field_name' => 'work_neighborhood',
                    'display_field_name' => config('history.User.work_neighborhood'),
                    'old_value' => $user->work_neighborhood,
                    'new_value' => $request->input("neighborhood"),
                ];
            }
            $user->work_neighborhood = $request->input("neighborhood");
        }

        if ($user->work_street_id != $request->input("street")) {
            $changedUserFields[] = [
                'field_name' => 'work_street_id',
                'display_field_name' => config('history.User.work_street_id'),
                'old_numeric_value' => $user->work_street_id,
                'new_numeric_value' => $request->input("street"),
            ];
        }
        $user->work_street_id = $request->input("street");

        if ($request->input("house_number") != null) {
            if (!is_numeric($request->input('house_number'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_HOUSE_NUMBER'));
                return;
            }

            if ($user->work_house != $request->input("house_number")) {
                $changedUserFields[] = [
                    'field_name' => 'work_house',
                    'display_field_name' => config('history.User.work_house'),
                    'old_value' => $user->work_house,
                    'new_value' => $request->input("house_number"),
                ];
            }
            $user->work_house = $request->input("house_number");
        }

        //    if ($request->input("house_entry") != null) { // house entry can become null
        if (sizeof($request->input("house_entry")) > config('constants.MAX_SIZE_OF_HOUSE_ENTRY')) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_HOUSE_ENTRY'));
            return;
        }
        if ($user->work_house_entry != $request->input("house_entry")) {
            $changedUserFields[] = [
                'field_name' => 'work_house_entry',
                'display_field_name' => config('history.User.work_house_entry'),
                'old_value' => $user->work_house_entry,
                'new_value' => $request->input("house_entry"),
            ];
        }
        $user->work_house_entry = $request->input("house_entry");
        //    }

        if ($request->input("flat") != null) {
            if (!is_numeric($request->input('flat'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_FLAT_NUMBER'));
                return;
            }

            if ($user->work_flat != $request->input("flat")) {
                $changedUserFields[] = [
                    'field_name' => 'work_flat',
                    'display_field_name' => config('history.User.work_flat'),
                    'old_value' => $user->work_flat,
                    'new_value' => $request->input("flat"),
                ];
            }
            $user->work_flat = $request->input("flat");
        }

        if ($request->input("active") != null) {
            if ($request->input("active") != 0 && $request->input("active") != 1) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ACTIVE_STATUS'));
                return;
            }

            if ($user->active != $request->input("active")) {
                $changedUserFields[] = [
                    'field_name' => 'active',
                    'display_field_name' => config('history.User.active'),
                    'old_numeric_value' => $user->active,
                    'new_numeric_value' => $request->input("active"),
                ];
            }
            $user->active = $request->input("active");
        }

        if ($request->input("cancel_payment") != null) {
            if ($request->input("cancel_payment") != 0 && $request->input("cancel_payment") != 1) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ACTIVE_STATUS'));
                return;
            }
            $user->cancel_payment = $request->input("cancel_payment");
        }

        if ($request->input("admin") != null) {
            if ($request->input("admin") != '0' && $request->input("admin") != '1') {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_IS_ADMIN_STATUS'));
                return;
            }
            if (Auth::user()->admin != 1) {
                $jsonOutput->setErrorCode(config('errors.system.IS_ADMIN_FIELD_IS_UNEDITABLE'));
                return;
            }

            if ($user->admin != $request->input("admin")) {
                $changedUserFields[] = [
                    'field_name' => 'admin',
                    'display_field_name' => config('history.User.admin'),
                    'old_numeric_value' => $user->admin,
                    'new_numeric_value' => $request->input("admin"),
                ];
            }
            $user->admin = $request->input("admin");
        }
        $twoStepAuth= $request->input("two_step_authentication");
        if ($twoStepAuth != null) {
            if ($twoStepAuth != '0' && $twoStepAuth != '1') {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_PARAMS'));
                return;
            }
            if (Auth::user()->admin != 1) {
                $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
                return;
            }

            if ($user->two_step_authentication != $twoStepAuth) {
                $changedUserFields[] = [
                    'field_name' => 'two_step_authentication',
                    'display_field_name' => config('history.User.two_step_authentication'),
                    'old_numeric_value' => $user->admin,
                    'new_numeric_value' => $twoStepAuth,
                ];
            }
            $user->two_step_authentication =$twoStepAuth;
        }

        if ($request->input("shas_representative") != null) {
            if ($request->input("shas_representative") != '0' && $request->input("shas_representative") != '1') {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_IS_SHAS_STATUS'));
                return;
            }
            $userVoterData = Voters::select(['voters.id','voters.shas_representative'])->withFilters()->where('voters.id', $user->voter_id)->first();
            if ($userVoterData) {
                if ($userVoterData->shas_representative != $request->input("shas_representative")) {
                    $changedVoterFields[] = [
                        'field_name' => 'shas_representative',
                        'display_field_name' => config('history.Voters.shas_representative'),
                        'old_numeric_value' => $userVoterData->shas_representative,
                        'new_numeric_value' => $request->input("shas_representative"),
                    ];
                }

                $userVoterData->shas_representative = $request->input("shas_representative");
            }
            $userVoterData->save();
        }

        $voter = Voters::select('id','email', 'main_voter_phone_id')
                    ->where('id', $user->voter_id)
                    ->first();
        $updatedVoter = false;

        if ($request->input('email') != null) {
            $email = $request->input("email");
            if (!$this->validateEmail($email) || trim($email) == '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_EMAIL'));
                return;
            }

            $userEmail = User::select('key')->where('key', '!=', $user_key)->where('email', $email)->where('deleted', 0)->first();
            if ($userEmail) {
                $jsonOutput->setErrorCode(config('errors.elections.USER_WITH_THE_SAME_EMAIL_ALREADY_EXIST'));
                return;
            }
            $userEmail = trim($request->input("email"));
            if ($user->email != $userEmail) {
                $changedUserFields[] = [
                    'field_name' => 'email',
                    'display_field_name' => config('history.User.email'),
                    'old_value' => $user->email,
                    'new_value' => $request->input("email"),
                ];
            }
            $user->email = $userEmail;
            if ($voter->email != $user->email) {
                $oldVoterEmail = $voter->email;
                $voter->email = $user->email;
                $updatedVoter = true;

                $changedVoterFields[] = [
                    'field_name' => 'email',
                    'display_field_name' => config('history.Voters.email'),
                    'old_value' => $oldVoterEmail,
                    'new_value' => $voter->email,
                ];
            }  
        }
        $user->save();

        $historyArgsArr = [
            'topicName' => 'system.users.edit',
            'models' => [],
        ];

        if (count($changedUserFields) > 0) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'User',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $user->id,
                'valuesList' => $changedUserFields,
            ];
        }

        $modelPhones = [];

        $arrPhones = $request->input("phones");
        if (sizeof($arrPhones) <= 0) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_PHONES_LIST'));
            return;
        } else {
            $currentPhonesHash = $this->getUserPhonesHash($user_key);
            for ($i = 0; $i < sizeof($arrPhones); $i++) {
                $phoneKey = $arrPhones[$i]['key'];
                if (!Helper::isIsraelPhone(str_replace('-', '', $arrPhones[$i]['phone_number']))) {
                    continue;
                }
                if ($arrPhones[$i]['key'] == '') {
                    UserPhones::where('user_id', $user->id)->delete();

                    $userPhone = new UserPhones;
                    $userPhone->user_id = $user->id;
                    $userPhone->key = Helper::getNewTableKey('user_phones', 5);
                    $userPhone->phone_type_id = $arrPhones[$i]['phone_type'];
                    $userPhone->phone_number = str_replace('-', '', $arrPhones[$i]['phone_number']);
                    $userPhone->save();

                    $modelPhones[] = [
                        'description' => 'הוספת טלפון למשתמש קיים',
                        'referenced_model' => 'UserPhones',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $userPhone->id,
                        'valuesList' => [
                            [
                                'field_name' => 'user_id',
                                'display_field_name' => config('history.UserPhones.user_id'),
                                'new_numeric_value' => $userPhone->user_id,
                            ],
                            [
                                'field_name' => 'phone_type_id',
                                'display_field_name' => config('history.UserPhones.phone_type_id'),
                                'new_numeric_value' => $userPhone->phone_type_id,
                            ],
                            [
                                'field_name' => 'phone_number',
                                'display_field_name' => config('history.UserPhones.phone_number'),
                                'new_value' => $userPhone->phone_number,
                            ],
                        ],
                    ];
                } else {
                    if (isset($currentPhonesHash[$phoneKey])) {
                        $userPhone = UserPhones::where('key', $arrPhones[$i]['key'])->first();

                        $oldPhoneValues = [
                            'phone_type_id' => $userPhone->phone_type_id,
                            'phone_number' => $userPhone->phone_number,
                        ];

                        if ($userPhone) {
                            $userPhone->phone_type_id = $arrPhones[$i]['phone_type'];
                            $userPhone->phone_number = str_replace('-', '', $arrPhones[$i]['phone_number']);
                            $userPhone->save();

                            $changedValues = [];
                            if ($userPhone->phone_type_id != $oldPhoneValues['phone_type_id']) {
                                $changedValues[] = [
                                    'field_name' => 'phone_type_id',
                                    'display_field_name' => config('history.UserPhones.phone_type_id'),
                                    'old_numeric_value' => $oldPhoneValues['phone_type_id'],
                                    'new_numeric_value' => $userPhone->phone_type_id,
                                ];
                            }

                            if ($userPhone->phone_number != $oldPhoneValues['phone_number']) {
                                $changedValues[] = [
                                    'field_name' => 'phone_number',
                                    'display_field_name' => config('history.UserPhones.phone_number'),
                                    'old_value' => $oldPhoneValues['phone_number'],
                                    'new_value' => $userPhone->phone_number,
                                ];
                            }

                            if (count($changedValues) > 0) {
                                $modelPhones[] = [
                                    'description' => 'עדכון טלפון למשתמש קיים',
                                    'referenced_model' => 'UserPhones',
                                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                    'referenced_id' => $userPhone->id,
                                    'valuesList' => $changedValues,
                                ];
                            }
                        }
                        unset($currentPhonesHash[$phoneKey]);
                    }
                }

            }

            if (count($currentPhonesHash) > 0) {
                foreach ($currentPhonesHash as $phoneKey => $value) {
                    $userPhone = UserPhones::where('key', $phoneKey)->where('deleted', 0)->first();
                    if ($userPhone) {
                        $userPhone->deleted = 1;
                        $userPhone->save();

                        $modelPhones[] = [
                            'description' => 'מחיקת טלפון למשתמש קיים',
                            'referenced_model' => 'UserPhones',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $userPhone->id,
                        ];
                    }
                }
            }

            $currentPhone = $arrPhones[0];

            $voterPhones = $voter->phones;
            $currentPhoneNumber = str_replace('-', '', $currentPhone['phone_number']);
            $foundPhone = false;
            foreach($voterPhones as $voterPhone) {
                if ($voterPhone->phone_number == $currentPhoneNumber) $foundPhone = true;
            }
            if (!$foundPhone) {
                $voterPhone = new VoterPhone;
                $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
                $voterPhone->phone_type_id = $currentPhone['phone_type'];
                $voterPhone->phone_number = $currentPhoneNumber;
                $voterPhone->voter_id = $voter->id;
                $voterPhone->sms = 1;
                $voterPhone->call_via_tm = 1;
                $voterPhone->save();

                $oldMainVoterPhoneId = $voter->main_voter_phone_id;
                $voter->main_voter_phone_id = $voterPhone->id;

                $changedVoterFields[] = [
                    'field_name' => 'main_voter_phone_id',
                    'display_field_name' => config('history.Voters.main_voter_phone_id'),
                    'old_numeric_value' => $oldMainVoterPhoneId,
                    'new_numeric_value' => $voterPhone->id,
                ];

                $historyFieldsNames = [
                    "phone_number" => config('history.VoterPhone.phone_number'),
                    "call_via_tm" => config('history.VoterPhone.call_via_tm'),
                    "sms" => config('history.VoterPhone.sms'),
                    "phone_type_id" => config('history.VoterPhone.phone_type_id'),
                    "voter_id" => config('history.VoterPhone.voter_id'),
                ];
                // Do history of adding phone
                $phoneAddHistoryElement = VoterController::phoneHistoryAdd($voterPhone->id, $voterPhone, $historyFieldsNames);
                if (count($phoneAddHistoryElement) > 0) {
                    $historyArgsArr['models'][] = $phoneAddHistoryElement;
                }             

                $updatedVoter = true;
            }

            if ($updatedVoter) {
                $voter->save();
            }

            if (count($changedVoterFields) > 0) {
                $historyArgsArr['models'][] = [
                    'description' => 'עדכון נתוני תושב של משתמש',
                    'referenced_model' => 'Voters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $userVoterData->id,
                    'valuesList' => $changedVoterFields,
                ];
            }

            if (count($modelPhones) > 0) {
                $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $modelPhones);
            }

            if (count($historyArgsArr['models']) > 0) {
                ActionController::AddHistoryItem($historyArgsArr);
            }
        }

        $jsonOutput->setData($user->key);
    }

    public static function sendEmailNewUserPassword($to, $passwordValue, $firstName, $lastName)
    {
        Mail::to($to)->send(new NewUserPassword($passwordValue, $firstName, $lastName, config('app.url')));
    }

    private static function addUserRoleGeoFilters($userId, $roleByUserId, $teamId, $arrGeoFilters)
    {
        $geoFiltersInsert = [];

        for ($geoIndex = 0; $geoIndex < count($arrGeoFilters); $geoIndex++) {
            $geoFiltersInsert[] = [
                "name" => $arrGeoFilters[$geoIndex]['name'],
                "user_id" => $userId,
                "role_by_user_id" => $roleByUserId,
                "entity_type" => $arrGeoFilters[$geoIndex]['entity_type'],
                "entity_id" => $arrGeoFilters[$geoIndex]['entity_id'],
                "inherited_id" => $arrGeoFilters[$geoIndex]['inherited_id'],
                "key" => Helper::getNewTableKey('geographic_filters', 10),
            ];
        }

        $allTeamFilters = GeographicFilterTemplates::where('team_id', $teamId)->get();
        for ($geoIndex = 0; $geoIndex < count($allTeamFilters); $geoIndex++) {
            $geoFiltersInsert[] = [
                "name" => $allTeamFilters[$geoIndex]->name,
                "user_id" => $userId,
                "role_by_user_id" => $roleByUserId,
                "entity_type" => $allTeamFilters[$geoIndex]->entity_type,
                "entity_id" => $allTeamFilters[$geoIndex]->entity_id,
                "inherited_id" => null,
                "key" => Helper::getNewTableKey('geographic_filters', 10),
            ];
        }

        $modelFilters = [];

        for ($geoIndex = 0; $geoIndex < count($geoFiltersInsert); $geoIndex++) {
            $newGeographicFilter = new GeographicFilters;

            $fieldsArray = [];
            foreach ($geoFiltersInsert[$geoIndex] as $fieldName => $fieldValue) {
                $newGeographicFilter->{$fieldName} = $fieldValue;

                switch ($fieldName) {
                    case 'key':
                        break;

                    case 'name':
                        $fieldsArray[] = [
                            'field_name' => 'name',
                            'display_field_name' => config('history.GeographicFilters.name'),
                            'new_value' => $fieldValue,
                        ];
                        break;

                    default:
                        $fieldsArray[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                            'new_numeric_value' => $fieldValue,
                        ];
                        break;
                }
            }

            $newGeographicFilter->save();

            $modelFilters[] = [
                'description' => 'הוספת מיקוד גיאוגרפי לתפקיד',
                'referenced_model' => 'GeographicFilters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newGeographicFilter->id,
                'valuesList' => $fieldsArray,
            ];
        }

        return $modelFilters;
    }

    private static function addUserRoles2($userId, $arrRoles)
    {
        $modelRoles = [];

        $userRolesFields = [
            'user_id',
            'user_role_id',
            'team_id',
            'team_department_id',
            'from_date',
            'to_date',
            'main',
        ];

        for ($index = 0; $index < count($arrRoles); $index++) {
            $userRole = new RolesByUsers;

            $fieldsArray = [];
            for ($fieldIndex = 0; $fieldIndex < count($userRolesFields); $fieldIndex++) {
                $fieldName = $userRolesFields[$fieldIndex];

                switch ($fieldName) {
                    case 'user_id':
                        $userRole->user_id = $userId;

                        $fieldsArray[] = [
                            'field_name' => 'user_id',
                            'display_field_name' => config('history.RolesByUsers.user_id'),
                            'new_numeric_value' => $userId,
                        ];
                        break;

                    case 'from_date':
                    case 'to_date':
                        $userRole->{$fieldName} = $arrRoles[$index][$fieldName];

                        $fieldsArray[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                            'new_value' => $arrRoles[$index][$fieldName],
                        ];
                        break;

                    default:
                        $userRole->{$fieldName} = $arrRoles[$index][$fieldName];

                        $fieldsArray[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                            'new_numeric_value' => $arrRoles[$index][$fieldName],
                        ];
                        break;
                }
            }

            $userRole->save();

            $modelRoles[] = [
                'description' => 'הוספת תפקיד למשתמש חדש',
                'referenced_model' => 'RolesByUsers',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $userRole->id,
                'valuesList' => $fieldsArray,
            ];

            $modelGeoFilter = UserController::addUserRoleGeoFilters($userId, $userRole->id, $arrRoles[$index]['team_id'],
                $arrRoles[$index]['geoFilters']);

            if (count($modelGeoFilter) > 0) {
                $modelRoles = array_merge($modelRoles, $modelGeoFilter);
            }
        }

        return $modelRoles;
    }

    private static function addUserRoles($userId, $arrRoles)
    {
        for ($i = 0; $i < sizeof($arrRoles); $i++) {
            $arrParts = explode('$', $arrRoles[$i]);

            $userRole = new RolesByUsers;
            $userRole->user_id = $userId;
            $userRole->user_role_id = $arrParts[0];
            $userRole->team_id = $arrParts[1];
            $userRole->team_department_id = ($arrParts[2] == 'null' ? null : $arrParts[2]);
            $userRole->from_date = $arrParts[4] == '' ? null : $arrParts[4];
            $userRole->to_date = $arrParts[5] == '' ? null : $arrParts[5];
            $userRole->main = $arrParts[6];
            $userRole->save();

            if ($arrParts[3] != null && $arrParts[3] != '') {
                $strAllExtraFiltersArr = explode('%', $arrParts[3]);
                for ($k = 0; $k < sizeof($strAllExtraFiltersArr); $k++) {
                    $strArrParts = explode('^', $strAllExtraFiltersArr[$k]);
                    $newGeoFilter = new GeographicFilters;
                    $newGeoFilter->name = $strArrParts[0];
                    $newGeoFilter->user_id = $userId;
                    $newGeoFilter->role_by_user_id = $userRole->id;
                    $newGeoFilter->entity_type = $strArrParts[1];
                    $newGeoFilter->entity_id = $strArrParts[2];
                    $newGeoFilter->inherited_id = $strArrParts[3];
                    $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
                    $newGeoFilter->save();
                }
            }

            $allTeamFilters = GeographicFilterTemplates::where('team_id', $arrParts[1])->get();
            for ($j = 0; $j < sizeof($allTeamFilters); $j++) {
                $newGeoFilter = new GeographicFilters;
                $newGeoFilter->name = $allTeamFilters[$j]->name;
                $newGeoFilter->user_id = $userId;
                $newGeoFilter->role_by_user_id = $userRole->id;
                $newGeoFilter->entity_type = $allTeamFilters[$j]->entity_type;
                $newGeoFilter->entity_id = $allTeamFilters[$j]->entity_id;
                $newGeoFilter->inherited_id = null;
                $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
                $newGeoFilter->save();
            }

            if ($arrParts[7] != null && $arrParts[7] != '') { //sectorial filter templates
                $strAllSectorialFiltersArr = explode('@', $arrParts[7]);
                for ($k = 0; $k < sizeof($strAllSectorialFiltersArr); $k++) {
                    $strArrParts = explode('#', $strAllSectorialFiltersArr[$k]);
                    $newSectorialFilter = new SectorialFilters;
                    $newSectorialFilter->name = $strArrParts[0];
                    $newSectorialFilter->user_id = $userId;
                    $newSectorialFilter->role_by_user_id = $userRole->id;
                    $newSectorialFilter->key = Helper::getNewTableKey('sectorial_filters', 10);
                    $newSectorialFilter->save();

                    $strFilterParts = explode('%', $strArrParts[1]);
                    for ($m = 0; $m < sizeof($strFilterParts); $m++) {
                        $strFilterItemParts = explode('^', $strFilterParts[$m]);
                        $newStaticFilterItem = new SectorialFilterItems;
                        $newStaticFilterItem->entity_type = 0;
                        $newStaticFilterItem->entity_id = $newSectorialFilter->id;
                        $newStaticFilterItem->sectorial_filter_definition_id = $strFilterItemParts[0];
                        $newStaticFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
                        $newStaticFilterItem->save();
                    }
                }
            }
        }
    }

    private static function addUserPhones($userId, $arrPhones)
    {
        $modelPhones = [];

        for ($i = 0; $i < sizeof($arrPhones); $i++) {
            if ($arrPhones[$i]['key'] == '') {
                UserPhones::where('user_id', $userId)->delete();

                $userPhone = new UserPhones;
                $userPhone->user_id = $userId;
                $userPhone->key = Helper::getNewTableKey('user_phones', 5);
                $userPhone->phone_type_id = $arrPhones[$i]['phone_type'];
                $userPhone->phone_number = str_replace('-', '', $arrPhones[$i]['phone_number']);
                $userPhone->save();

                $modelPhones[] = [
                    'description' => 'הוספת טלפון למשתמש חדש',
                    'referenced_model' => 'UserPhones',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $userPhone->id,
                    'valuesList' => [
                        [
                            'field_name' => 'user_id',
                            'display_field_name' => config('history.UserPhones.user_id'),
                            'new_numeric_value' => $userPhone->user_id,
                        ],
                        [
                            'field_name' => 'phone_type_id',
                            'display_field_name' => config('history.UserPhones.phone_type_id'),
                            'new_numeric_value' => $userPhone->phone_type_id,
                        ],
                        [
                            'field_name' => 'phone_number',
                            'display_field_name' => config('history.UserPhones.phone_number'),
                            'new_value' => $userPhone->phone_number,
                        ],
                    ],
                ];
            }
        }

        return $modelPhones;
    }

    public static function addUserInfo($voterId, $addressObj, $email, $active, $admin, $twoStepAuth, $arrPhones, $arrRoles,$cancel_payment=0)
    {
        $newUser = new User;

        $voterObj = Voters::select(['first_name', 'last_name'])->where('id', $voterId)->first();

        $firstName = $voterObj->first_name;
        $lastName = $voterObj->last_name;

        $newUser->voter_id = $voterId;
        $newUser->key = Helper::getNewTableKey('users', 10);
        $randNewPWD = Str::random(6);
        $newUser->password = Hash::make($randNewPWD);
        $newUser->initial_password = 1;
        $newUser->user_create_id = Auth::user()->id;

        $newUser->work_city_id = $addressObj->city_id;
        $newUser->work_neighborhood = $addressObj->neighborhood;
        $newUser->work_street_id = $addressObj->street;
        $newUser->work_house = $addressObj->house_number;
        $newUser->work_house_entry = $addressObj->house_entry;
        $newUser->work_flat = $addressObj->flat;

        $newUser->email = $email;
        $newUser->active = $active;
        $newUser->admin = $admin;
        $newUser->two_step_authentication = $twoStepAuth;
        $newUser->cancel_payment = $cancel_payment;

        $newUser->save();

        $userFields = [
            'work_city_id',
            'work_neighborhood',
            'work_street_id',
            'work_house',
            'work_house_entry',
            'work_flat',
            'email',
            'active',
            'admin',
        ];

        $fieldsArray = [];
        for ($fieldIndex = 0; $fieldIndex < count($userFields); $fieldIndex++) {
            $fieldName = $userFields[$fieldIndex];

            switch ($fieldName) {
                case 'active':
                case 'admin':
                case 'work_city_id':
                case 'work_street_id':
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.User.' . $fieldName),
                        'new_numeric_value' => $newUser->{$fieldName},
                    ];
                    break;

                default:
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.User.' . $fieldName),
                        'new_value' => $newUser->{$fieldName},
                    ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.users.add',
            'models' => [
                [
                    'referenced_model' => 'User',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newUser->id,
                    'valuesList' => $fieldsArray,
                ],
            ],
        ];

        if (config('settings.send_new_user_email')) {
            UserController::sendEmailNewUserPassword($email, $randNewPWD, $firstName, $lastName);
        }

        $modelRoles = UserController::addUserRoles2($newUser->id, $arrRoles);

        $modelPhones = UserController::addUserPhones($newUser->id, $arrPhones);

        if (count($modelPhones)) {
            $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $modelPhones);
        }

        if (count($modelRoles)) {
            $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $modelRoles);
        }

        ActionController::AddHistoryItem($historyArgsArr);

        return $newUser->key;
    }

    /**
     * This function added a new user.
     *
     * @param Request $request
     */
    public function addUser(Request $request)
    {
        $totalMissingPhonesCount = 0;

        $voterid = $request->input('voter_id');
        $voterId = $voterid;

        $jsonOutput = app()->make("JsonOutput");

        $isUserExist = User::select('voter_id')->where('voter_id', $voterid)->first();
        if ($isUserExist) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ALREADY_EXISTS'));
            return;
        }
        $voter_data = Voters::select(['voters.id as idd'])->withFilters()->where('voters.id', $voterid)->first();
        $city = '';

        if ($voter_data) {
            $city = $voter_data->mi_city;
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        if ($request->input("city_id") == null || !is_numeric($request->input("city_id"))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_CITY_ID'));
            return;
        }

        $check_city = City::where('id', $request->input("city_id"))->where('deleted', 0)->first();
        if (!$check_city) {
            $jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
            return;
        }

        if ($request->input("house_number") == null || !is_numeric($request->input("house_number"))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_HOUSE_NUMBER'));
            return;
        }

        if ($request->input("house_entry") != null) {
            if (sizeof($request->input("house_entry")) > config('constants.MAX_SIZE_OF_HOUSE_ENTRY')) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_HOUSE_ENTRY'));
                return;
            }
        }

        if ($request->input("flat") != null) {
            if (!is_numeric($request->input("flat"))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_FLAT_NUMBER'));
                return;
            }
        }

        if (!$this->validateEmail($request->input("email")) || trim($request->input("email")) == '' ||
            !filter_var($request->input("email"), FILTER_VALIDATE_EMAIL)) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_EMAIL'));
            return;
        }

        if ($request->input("active") != '0' && $request->input("active") != '1') {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_ACTIVE_STATUS'));
            return;
        }

        $admin = intval($request->input("admin", 0));

        if ($admin != 0 && $admin != 1) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_IS_ADMIN_STATUS'));
            return;
        }
        $twoStepAuth = $request->input("two_step_authentication", 1);

        if ($twoStepAuth != 0 && $twoStepAuth != 1) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_PARAMS'));
            return;
        }

        $arrPhones = $request->input("phones");
        $arrRoles = $request->input("roles");

        if (sizeof($arrPhones) <= 0) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_PHONES_LIST'));
            return;
        }
        if (sizeof($arrRoles) <= 0) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_ROLES_LIST'));
            return;
        }

        for ($i = 0; $i < sizeof($arrPhones); $i++) {
            if (!Helper::isIsraelPhone(str_replace('-', '', $arrPhones[$i]['phone_number']))) {
                $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                return;
            }
        }

        $addressObj = new Address();

        $addressObj->city_id = $request->input("city_id");
        $addressObj->neighborhood = $request->input("neighborhood");
        $addressObj->street = $request->input("street");
        $addressObj->house_number = $request->input("house_number");
        $addressObj->house_entry = $request->input("house_entry");
        $addressObj->flat = $request->input("flat");

        $userKey = $this->addUserInfo($voterId, $addressObj, $request->input('email'), $request->input('active'),
                                      $admin, $twoStepAuth, $arrPhones, $arrRoles,$request->input("cancel_payment"));

        $jsonOutput->setData($userKey);
    }

    /**
     * @param Request $request
     */
    public function getCurrentUser(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");

        $user = Auth::user();
        $returnUser = new \stdClass;
        $returnUser->key = $user->key;
        $returnUser->first_name = trim($user->metadata->first_name);
        $returnUser->last_name = trim($user->metadata->last_name);
        $returnUser->id = ($user->id);
        $returnUser->admin = ($user->admin == 0) ? false : true;
        $permissions = $user->permissions($user->id);

        $returnUser->geographicFilters = GeoFilterService::getGeographicFilters();
        $returnUser->is_view_all_voters = $user->is_view_all_voters == CommonEnum::YES ? true : false;
        $returnUser->cancel_payment = $user->cancel_payment == CommonEnum::YES ? true : false;
        if(!$user->admin){ // Check if user has permission to cti:
            $userInCampaigns = CampaignController::getUsersInCampaigns($user->id);
            if(!is_null($userInCampaigns)){
                $permissions[]= ['operation_name' => 'cti'];
                $permissions[]= ['operation_name' => 'tm'];
            }
        }
 
        $returnUser->permissions = $permissions;

        $jsonOutput->setData($returnUser);
    }
    public function getCurrentActivistUser(Request $request){
        $jsonOutput = app()->make("JsonOutput");

        $user = Auth::user();
        $returnUser = new \stdClass;
        $returnUser->key = $user->key;
        $returnUser->first_name = trim($user->metadata->first_name);
        $returnUser->last_name = trim($user->metadata->last_name);
        $returnUser->id = $user->id;
        $returnUser->permissions = $user->permissions($user->id);

        $returnUser->geographicFilters = GeoFilterService::getGeographicFilters();

        $jsonOutput->setData($returnUser);
    }
    public function getModulesWithRoles()
    {

        $jsonOutput = app()->make("JsonOutput");
        $modules = Modules::select(['id','name', 'system_name'])->get();
        for ($i = 0; $i < sizeof($modules); $i++) {
            $modules[$i]->roles = UserRoles::select(['id',
                'name'])->where('module_id', $modules[$i]->id)->where('deleted', 0)->get();
        }
        $jsonOutput->setData($modules);
    }

    public function addNewUserRole(Request $request, $userKey)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($userKey == null || trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }
        if ($request->input('role_id') == null || !is_numeric($request->input('role_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_ROLE_KEY'));
            return;
        }
        $check_role = UserRoles::where('id', $request->input('role_id'))->first();
        if (!$check_role) {
            $jsonOutput->setErrorCode(config('errors.system.ROLE_DOESNT_EXIST'));
            return;
        }
        if ($request->input('team_id') == null || !is_numeric($request->input('team_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        $check_team = Teams::where('id', $request->input('team_id'))->where('deleted', 0)->first();
        if (!$check_team) {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
        /*
        if ($request->input('dep_id') == null || !is_numeric($request->input('dep_id'))) {
        $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_KEY'));
        return;
        }
         */
        /*
        $check_dep = TeamDepartments::where('id', $request->input('dep_id'))->first();
        if (!$check_dep) {
        $jsonOutput->setErrorCode(config('errors.system.TEAM_DEPARTMENT_NOT_EXISTS'));
        return;
        }
         */
        if ($request->input('is_main') != '0' && $request->input('is_main') != '1') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_ROLE_IS_MAIN'));
            return;
        }
        if ($request->input('from_date') != null && trim($request->input('from_date')) != '') {
            if (!CrmRequestController::checkDateTimeCorrectFormat($request->input('from_date'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ROLE_START_DATE'));
                return;
            }
        }
        if ($request->input('to_date') != null && trim($request->input('to_date')) != '') {
            if (!CrmRequestController::checkDateTimeCorrectFormat($request->input('to_date'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ROLE_END_DATE'));
                return;
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.users.roles.add',
            'models' => [],
        ];

        $newRole = new RolesByUsers;
        $newRole->user_id = $userID;
        $newRole->user_role_id = $request->input('role_id');
        $newRole->team_id = $request->input('team_id');
        $newRole->team_department_id = ($request->input('dep_id') == 'null' ? null : $request->input('dep_id'));
        $newRole->from_date = $request->input('from_date') == '' ? null : $request->input('from_date');
        $newRole->to_date = $request->input('to_date') == '' ? null : $request->input('to_date');
        $newRole->main = $request->input('is_main');
        $newRole->save();

        $roleFields = [
            'user_id',
            'user_role_id',
            'team_id',
            'team_department_id',
            'from_date',
            'to_date',
            'main',
        ];

        $insertedValues = [];
        for ($fieldIndex = 0; $fieldIndex < count($roleFields); $fieldIndex++) {
            $fieldName = $roleFields[$fieldIndex];

            if ('from_date' == $fieldName || 'to_date' == $fieldName) {
                $insertedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                    'new_value' => $newRole->{$fieldName},
                ];
            } else {
                $insertedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                    'new_numeric_value' => $newRole->{$fieldName},
                ];
            }
        }

        $historyArgsArr['models'][] = [
            'referenced_model' => 'RolesByUsers',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $newRole->id,
            'valuesList' => $insertedValues,
        ];

        $geographicFilters = GeographicFilters::where('user_id', $userID)->orderBy('inherited_id', 'ASC')->get();
        for ($i = 0; $i < sizeof($geographicFilters); $i++) {
            //$geographicFilters[$i]->forceDelete();
        }

        $filterFields = [
            'name',
            'user_id',
            'inherited_id',
            'role_by_user_id',
            'entity_type',
            'entity_id',
        ];
        $allTeamFilters = GeographicFilterTemplates::where('team_id', $request->input('team_id'))->get();
        $tpls = array();
        for ($i = 0; $i < sizeof($allTeamFilters); $i++) {
            $newGeoFilter = new GeographicFilters;
            $newGeoFilter->name = $allTeamFilters[$i]->name;
            $newGeoFilter->user_id = $userID;
            $newGeoFilter->inherited_id = null;
            $newGeoFilter->role_by_user_id = $newRole->id;
            $newGeoFilter->entity_type = $allTeamFilters[$i]->entity_type;
            $newGeoFilter->entity_id = $allTeamFilters[$i]->entity_id;
            $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
            $newGeoFilter->save();
            array_push($tpls, array($newGeoFilter->id, $newGeoFilter->entity_id));

            $insertedValues = [];
            for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
                $fieldName = $filterFields[$fieldIndex];

                if ('name' == $fieldName) {
                    $insertedValues[] = [
                        'field_name' => 'name',
                        'display_field_name' => config('history.GeographicFilters.name'),
                        'new_value' => $newGeoFilter->name,
                    ];
                } else {
                    $insertedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                        'new_numeric_value' => $newGeoFilter->{$fieldName},
                    ];
                }
            }

            $historyArgsArr['models'][] = [
                'referenced_model' => 'GeographicFilters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newGeoFilter->id,
                'valuesList' => $insertedValues,
            ];
        }

        $extraFilters = $request->input('extra_geo_filters');
        $extraFiltersArr = explode(';', $extraFilters);
        for ($i = 0; $i < sizeof($extraFiltersArr); $i++) {
            $elementsArray = explode('~', $extraFiltersArr[$i]);
            if (sizeof($elementsArray) >= 2) {
                $newGeoFilter = new GeographicFilters;
                $newGeoFilter->name = $elementsArray[0];
                $newGeoFilter->user_id = $userID;
                if ($elementsArray[3] == '-1') {
                    $newGeoFilter->inherited_id = 0;
                } else {
                    for ($s = 0; $s < sizeof($tpls); $s++) {
                        if ($tpls[$s][1] == $elementsArray[3]) {
                            $newGeoFilter->inherited_id = $tpls[$s][0];
                        }
                    }
                }
                $newGeoFilter->role_by_user_id = $newRole->id;
                $newGeoFilter->entity_type = $elementsArray[1];
                $newGeoFilter->entity_id = $elementsArray[2];
                $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
                $newGeoFilter->save();

                $insertedValues = [];
                for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
                    $fieldName = $filterFields[$fieldIndex];

                    if ('name' == $fieldName) {
                        $insertedValues[] = [
                            'field_name' => 'name',
                            'display_field_name' => config('history.GeographicFilters.name'),
                            'new_value' => $newGeoFilter->name,
                        ];
                    } else {
                        $insertedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                            'new_numeric_value' => $newGeoFilter->{$fieldName},
                        ];
                    }
                }

                $historyArgsArr['models'][] = [
                    'referenced_model' => 'GeographicFilters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newGeoFilter->id,
                    'valuesList' => $insertedValues,
                ];
            }
        }

        ActionController::AddHistoryItem($historyArgsArr);

        $staticSectorialFilterTemplates = SectorialFilterTemplates::select(['id',
            'name'])->where('team_id', $request->input('team_id'))->get();
        for ($k = 0; $k < sizeof($staticSectorialFilterTemplates); $k++) {
            $newStaticFilter = new SectorialFilters;
            $newStaticFilter->name = $staticSectorialFilterTemplates[$k]->name;
            $newStaticFilter->role_by_user_id = $newRole->id;
            $newStaticFilter->user_id = $userID;
            $newStaticFilter->key = Helper::getNewTableKey('sectorial_filters', 10);
            $newStaticFilter->save();

            $newStaticFilterItem = new SectorialFilterItems;
            $newStaticFilterItem->entity_type = 1;
            $newStaticFilterItem->entity_id = $newStaticFilter->id;
            $newStaticFilterItem->sectorial_filter_definition_id = -1;
            $newStaticFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
            $newStaticFilterItem->save();
        }

        if ($request->input('sectorial_filters') != '') {
            $sectorialFilters = explode('^', $request->input('sectorial_filters'));
            for ($i = 0; $i < sizeof($sectorialFilters); $i++) {
                $filterItemsData = explode('~', $sectorialFilters[$i]);
                $filterName = $filterItemsData[0];
                $allFilterItems = explode(';', $filterItemsData[1]);
                $newTblSectorialFilter = new SectorialFilters;
                $newTblSectorialFilter->name = $filterName;
                $newTblSectorialFilter->role_by_user_id = $newRole->id;
                $newTblSectorialFilter->user_id = $userID;
                $newTblSectorialFilter->key = Helper::getNewTableKey('sectorial_filters', 10);
                $newTblSectorialFilter->save();
                for ($j = 0; $j < sizeof($allFilterItems); $j++) {
                    $arrParts = explode('|', $allFilterItems[$j]);
                    $newTblFilterItem = new SectorialFilterItems;
                    $newTblFilterItem->entity_type = 0;
                    $newTblFilterItem->entity_id = $newTblSectorialFilter->id;
                    $newTblFilterItem->sectorial_filter_definition_id = $arrParts[0];
                    if ($arrParts[2] == 5) {
                        $newTblFilterItem->string_value = $arrParts[3];
                    } else {
                        $newTblFilterItem->numeric_value = $arrParts[3];
                    }
                    $newTblFilterItem->key = Helper::getNewTableKey('sectorial_filter_items', 5);
                    $newTblFilterItem->save();
                }
            }
        }

        $newUserRoles = RolesByUsers::where(['user_id' => $userID, 'deleted' => DB::raw(0)])->get();

        $userRolesLength = sizeof($newUserRoles);
        for ($i = 0; $i < $userRolesLength; $i++) {
            $userTeam = Teams::where('id', $newUserRoles[$i]->team_id)->where('deleted', 0)->first();
            if ($userTeam) {
                $newUserRoles[$i]->team_name = $userTeam->name;
                $newUserRoles[$i]->team_key = $userTeam->key;
            }

            $userDep = TeamDepartments::where('id', $newUserRoles[$i]->team_department_id)->first();
            if ($userDep) {
                $newUserRoles[$i]->team_department_name = $userDep->name;
            }
            $newUserRoles[$i]->is_editing = false;

            $filters = GeographicFilters::select(['id',
                'name',
                'inherited_id',
                'entity_type',
                'entity_id'])->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $userID)->orderBy('inherited_id', 'ASC')->get();

            $this->getUserGeoFiltersPath($filters);
            
            $newUserRoles[$i]->geo_filters = $filters; 

            $team_geo_filters = GeographicFilters::select(['id', 'name', 'entity_type', 'entity_id'])
            ->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $user->id)->whereNull('inherited_id')
            ->orderBy('inherited_id', 'ASC')->get();

            $team_geo_filters = $this->getUserGeoFiltersPath($team_geo_filters);
            // $team_geo_filters = $this->getUserTeamGeoFiltersPath($team_geo_filters);

            $newUserRoles[$i]->team_geo_filters = $team_geo_filters;

            $newUserRoles[$i]->sectorial_filters = SectorialFilters::select(['id',
                'name'])->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $user->id)->get();
            for ($m = 0; $m < sizeof($newUserRoles[$i]->sectorial_filters); $m++) {
                $tempFilterItem = SectorialFilterItems::select(['entity_type',
                    'sectorial_filter_definition_id'])->where('entity_id', $newUserRoles[$i]->sectorial_filters[$m]->id)->get();
                $tempArray = array();
                for ($a = 0; $a < sizeof($tempFilterItem); $a++) {
                    if ($tempFilterItem[$a]->entity_type == 0) {
                        $newUserRoles[$i]->sectorial_filters[$m]->inherited = 0;
                        $tempDefinition = SectorialFilterDefinitions::select(['id',
                            'sectorial_filter_definitions_group_id'])->where('id', $tempFilterItem[$a]->sectorial_filter_definition_id)->get();

                        for ($s = 0; $s < sizeof($tempDefinition); $s++) {
                            //$user->roles_by_user[$i]->sectorial_filters[$m]->definition_id = $tempDefinition->id;
                            if (!in_array($tempDefinition[$s]->sectorial_filter_definitions_group_id, $tempArray)) {
                                array_push($tempArray, $tempDefinition[$s]->sectorial_filter_definitions_group_id);
                            }
                        }
                    } else {
                        $newUserRoles[$i]->sectorial_filters[$m]->inherited = 1;
                    }
                }
                $newUserRoles[$i]->sectorial_filters[$m]->definition_group_ids = $tempArray;
            }

            $userRoles = UserRoles::where('id', $newUserRoles[$i]->user_role_id)->first();
            if ($userRoles) {
                $newUserRoles[$i]->name = $userRoles->name;
                $module = Modules::where('id', $userRoles->module_id)->first();
                if ($module) {
                    $newUserRoles[$i]->module_name = $module->name;
                }
            }
        }

        $jsonOutput->setData($newUserRoles);
    }

    public function editExistingUserRoleFilter(Request $request, $userKey, $recordKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if ($userKey == null || trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        if ($recordKey == null || trim($recordKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_FILTER_KEY'));
            return;
        }
        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        $historyArgsArr = [
            'topicName' => 'system.users.geographic_filter.edit',
            'models' => [],
        ];

        $newFilter = GeographicFilters::where('id', $recordKey)
            ->where('user_id', $userID)
            ->where('role_by_user_id', $request->input('role_user_id'))
            ->first();
        if ($newFilter) {
            $filterFields = [
                'name',
                'entity_type',
                'entity_id',
                'inherited_id',
            ];

            $oldFilterValues = [];
            for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
                $fieldName = $filterFields[$fieldIndex];

                $oldFilterValues[$fieldName] = $newFilter->{$fieldName};
            }

            $newFilter->name = $request->input('path_name');
            $newFilter->entity_type = $request->input('entity_type');
            $newFilter->entity_id = $request->input('entity_id');
            $newFilter->inherited_id = $request->input('inherited_id');
            $newFilter->save();

            $changedValues = [];
            for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
                $fieldName = $filterFields[$fieldIndex];

                if ($newFilter->{$fieldName} != $oldFilterValues[$fieldName]) {
                    if ('name' == $fieldName) {
                        $changedValues[] = [
                            'field_name' => 'name',
                            'display_field_name' => config('history.GeographicFilters.name'),
                            'old_value' => $oldFilterValues['name'],
                            'new_value' => $newFilter->name,
                        ];
                    } else {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                            'old_numeric_value' => $oldFilterValues[$fieldName],
                            'new_numeric_value' => $newFilter->{$fieldName},
                        ];
                    }
                }
            }

            if (count($changedValues) > 0) {
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'GeographicFilters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $newFilter->id,
                    'valuesList' => $changedValues,
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }

        $filters = GeographicFilters::where('role_by_user_id', $request->input('role_user_id'))
            ->where('user_id', $userID)
            ->orderBy('inherited_id', 'ASC')
            ->get();

        $this->getUserGeoFiltersPath($filters);

        $jsonOutput->setData($filters);
    }

    public function deleteExistingUserRoleFilter(Request $request, $userKey, $recordKey)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($userKey == null || trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        if ($recordKey == null || trim($recordKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_GEO_FILTER_KEY'));
            return;
        }
        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }
        $filterToDelete = GeographicFilters::where('id', $recordKey)->first();
        if ($filterToDelete) {
            if ($filterToDelete->user_id == $userID && $filterToDelete->role_by_user_id == $request->input('role_user_id')) {
                $historyArgsArr = [
                    'topicName' => 'system.users.geographic_filter.delete',
                    'models' => [
                        [
                            'referenced_model' => 'GeographicFilters',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $filterToDelete->id,
                        ],
                    ],
                ];

                ActionController::AddHistoryItem($historyArgsArr);

                $filterToDelete->forceDelete();
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.GEO_FILTER_NOT_EXISTS'));
            return;
        }
        $filters = GeographicFilters::where('role_by_user_id', $request->input('role_user_id'))->where('user_id', $userID)->orderBy('inherited_id', 'ASC')->get();

        $this->getUserGeoFiltersPath($filters);

        $jsonOutput->setData($filters);
    }

    public function addNewUserRoleFilter(Request $request, $userKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if ($userKey == null || trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }
        $newFilter = new GeographicFilters;
        $newFilter->inherited_id = $request->input('inherited_id');
        $newFilter->name = $request->input('path_name');
        $newFilter->role_by_user_id = $request->input('role_user_id');
        $newFilter->user_id = $userID;
        $newFilter->entity_type = $request->input('entity_type');
        $newFilter->entity_id = $request->input('entity_id');
        $newFilter->key = Helper::getNewTableKey('geographic_filters', 10);
        $newFilter->save();

        $filterFields = [
            'name',
            'entity_type',
            'entity_id',
            'inherited_id',
            'role_by_user_id',
        ];

        $insertedValues = [];
        for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
            $fieldName = $filterFields[$fieldIndex];

            if ('name' == $fieldName) {
                $insertedValues[] = [
                    'field_name' => 'name',
                    'display_field_name' => config('history.GeographicFilters.name'),
                    'new_value' => $newFilter->name,
                ];
            } else {
                $insertedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                    'new_numeric_value' => $newFilter->{$fieldName},
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.users.geographic_filter.add',
            'models' => [
                [
                    'referenced_model' => 'GeographicFilters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newFilter->id,
                    'valuesList' => $insertedValues,
                ],
            ],
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $filters = GeographicFilters::where('role_by_user_id', $request->input('role_user_id'))
            ->where('user_id', $userID)->orderBy('inherited_id', 'ASC')
            ->get();
        $this->getUserGeoFiltersPath($filters);

        $jsonOutput->setData($filters);
    }

    public function deleteExistingUserRole($userKey, $recordKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if ($userKey == null && trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        if ($recordKey == null && trim($recordKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_ROLE_KEY'));
            return;
        }

        $historyArgsArr = [
            'topicName' => 'system.users.roles.delete',
            'models' => [],
        ];

        $user = User::select(['id'])->where('key', $userKey)->first();
        $userID = -1;
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }

        $rowToDelete = RolesByUsers::where('id', $recordKey)->where('user_id', $userID)->first();
        if ($rowToDelete) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'RolesByUsers',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $rowToDelete->id,
            ];

            $rowToDelete->deleted = 1;
            $rowToDelete->save();

            //remove user from campaign if role is connected to campaign
            if ($rowToDelete->campaign_id != null) {
                $userInCampaign = UsersInCampaigns::select('id')
                                    ->where('campaign_id', $rowToDelete->campaign_id)
                                    ->where('user_id', $rowToDelete->user_id)
                                    ->where('deleted', 0)
                                    ->first();
                if ($userInCampaign) {

                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'UsersInCampaigns',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                        'referenced_id' => $userInCampaign->id,
                    ];

                    $userInCampaign->deleted = 1;
                    $userInCampaign->save();
                }
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_ROLE_DOESNT_EXIST'));
            return;
        }

        $filters = GeographicFilters::where('role_by_user_id', $recordKey)->get();
        for ($i = 0; $i < sizeof($filters); $i++) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'GeographicFilters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $filters[$i]->id,
            ];

            $filters[$i]->forceDelete();
        }

        ActionController::AddHistoryItem($historyArgsArr);

        $newUserRoles = RolesByUsers::where(['user_id' => $userID, 'deleted' => DB::raw(0)])->get();

        $userRolesLength = sizeof($newUserRoles);
        for ($i = 0; $i < $userRolesLength; $i++) {
            $userTeam = Teams::where('id', $newUserRoles[$i]->team_id)->where('deleted', 0)->first();
            if ($userTeam) {
                $newUserRoles[$i]->team_name = $userTeam->name;
                $newUserRoles[$i]->team_key = $userTeam->key;
            }

            $userDep = TeamDepartments::where('id', $newUserRoles[$i]->team_department_id)->first();
            if ($userDep) {
                $newUserRoles[$i]->team_department_name = $userDep->name;
            }
            $newUserRoles[$i]->is_editing = false;
            $filters = GeographicFilters::select(['id',
                'name',
                'inherited_id',
                'entity_type',
                'entity_id'])->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $userID)->orderBy('inherited_id', 'ASC')->get();

            $this->getUserGeoFiltersPath($filters);

            $newUserRoles[$i]->geo_filters = $filters;

            // $newUserRoles[$i]->team_geo_filters = GeographicFilters::select(['id',
            $team_geo_filters = GeographicFilters::select(['id',
                'name',
                'entity_type',
                'entity_id'])->where('role_by_user_id', $newUserRoles[$i]->id)
                ->where('user_id', $user->id)->whereNull('inherited_id')
                ->orderBy('inherited_id', 'ASC')->get();

            // $this->getUserTeamGeoFiltersPath($team_geo_filters);

            $this->getUserGeoFiltersPath($team_geo_filters);

            $newUserRoles[$i]->team_geo_filters = $team_geo_filters;
            

            $userRoles = UserRoles::where('id', $newUserRoles[$i]->user_role_id)->first();
            if ($userRoles) {
                $newUserRoles[$i]->name = $userRoles->name;
                $module = Modules::where('id', $userRoles->module_id)->first();
                if ($module) {
                    $newUserRoles[$i]->module_name = $module->name;
                }
            }
        }

        $jsonOutput->setData($newUserRoles);
    }

    public function saveExistingUserRole(Request $request, $userKey, $recordKey)
    {

        $jsonOutput = app()->make("JsonOutput");
        if ($userKey == null || trim($userKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_KEY'));
            return;
        }
        if ($recordKey == null || trim($recordKey) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_USER_ROLE_KEY'));
            return;
        }
        $user = User::select(['id'])->where('key', $userKey)->first();
        if ($user) {
            $userID = $user->id;
        } else {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
            return;
        }
        if ($request->input('role_id') == null || !is_numeric($request->input('role_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_ROLE_KEY'));
            return;
        }
        $check_role = UserRoles::where('id', $request->input('role_id'))->first();
        if (!$check_role) {
            $jsonOutput->setErrorCode(config('errors.system.USER_ROLE_DOESNT_EXIST'));
            return;
        }
        if ($request->input('team_id') == null || !is_numeric($request->input('team_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        $check_team = Teams::where('id', $request->input('team_id'))->where('deleted', 0)->first();
        if (!$check_team) {
            $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
            return;
        }
        if ($request->input('department_id') != null && !is_numeric($request->input('department_id'))) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_DEPARTMENT_KEY'));
            return;
        }
        /*
        $check_dep = TeamDepartments::where('id', $request->input('department_id'))->first();
        if (!$check_dep) {
        $jsonOutput->setErrorCode(config('errors.system.TEAM_DEPARTMENT_NOT_EXISTS'));
        return;
        }
         */
        if ($request->input('from_date') != null && trim($request->input('from_date')) != '') {
            if (!CrmRequestController::checkDateTimeCorrectFormat($request->input('from_date'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ROLE_START_DATE'));
                return;
            }
        }
        if ($request->input('to_date') != null && trim($request->input('to_date')) != '') {
            if (!CrmRequestController::checkDateTimeCorrectFormat($request->input('to_date'))) {
                $jsonOutput->setErrorCode(config('errors.system.WRONG_ROLE_END_DATE'));
                return;
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.users.roles.edit',
            'models' => [],
        ];

        $filterFields = [
            'name',
            'user_id',
            'inherited_id',
            'role_by_user_id',
            'entity_type',
            'entity_id',
        ];

        $rowToEdit = RolesByUsers::where('id', $recordKey)->where(['user_id' => $userID ,'deleted' => DB::raw(0)])->first();
        if ($rowToEdit->team_id != $request->input('team_id')) {
            $rowToEdit->team_id = $request->input('team_id');
            $filters = GeographicFilters::where('role_by_user_id', $recordKey)->get();
            for ($i = 0; $i < sizeof($filters); $i++) {
                $historyArgsArr['models'][] = [
                    'description' => 'מחיקת מיקוד גיאוגרפי בעריכת משתמש',
                    'referenced_model' => 'GeographicFilters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $filters[$i]->id,
                ];

                $filters[$i]->forceDelete();
            }

            $allTeamFilters = GeographicFilterTemplates::where('team_id', $request->input('team_id'))->get();
            for ($i = 0; $i < sizeof($allTeamFilters); $i++) {
                $newGeoFilter = new GeographicFilters;
                $newGeoFilter->name = $allTeamFilters[$i]->name;
                $newGeoFilter->user_id = $userID;
                $newGeoFilter->role_by_user_id = $rowToEdit->id;
                $newGeoFilter->inherited_id = null;
                $newGeoFilter->entity_type = $allTeamFilters[$i]->entity_type;
                $newGeoFilter->entity_id = $allTeamFilters[$i]->entity_id;
                $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
                $newGeoFilter->save();

                $insertedValues = [];
                for ($fieldIndex = 0; $fieldIndex < count($filterFields); $fieldIndex++) {
                    $fieldName = $filterFields[$fieldIndex];

                    if ('name' == $fieldName) {
                        $insertedValues[] = [
                            'field_name' => 'name',
                            'display_field_name' => config('history.GeographicFilters.name'),
                            'new_value' => $newGeoFilter->name,
                        ];
                    } else {
                        $insertedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.GeographicFilters.' . $fieldName),
                            'new_numeric_value' => $newGeoFilter->{$fieldName},
                        ];
                    }
                }

                $historyArgsArr['models'][] = [
                    'description' => 'הוספת מיקוד גיאוגרפי בעריכת משתמש',
                    'referenced_model' => 'GeographicFilters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newGeoFilter->id,
                    'valuesList' => $insertedValues,
                ];
            }
        }

        $roleFields = [
            'from_date',
            'to_date',
            'main',
            'user_role_id',
            'team_id',
            'team_department_id',
        ];

        $oldRoleFields = [];
        for ($fieldIndex = 0; $fieldIndex < count($roleFields); $fieldIndex++) {
            $fieldName = $roleFields[$fieldIndex];

            $oldRoleFields[$fieldName] = $rowToEdit->{$fieldName};
        }

        $rowToEdit->from_date = $request->input('from_date') == '' ? null : $request->input('from_date');
        $rowToEdit->to_date = $request->input('to_date') == '' ? null : $request->input('to_date');
        $rowToEdit->main = $request->input('main');
        $rowToEdit->user_role_id = $request->input('role_id');
        $rowToEdit->team_id = $request->input('team_id');
        $rowToEdit->team_department_id = ($request->input('department_id') == 'null' ? null : $request->input('department_id'));
        $rowToEdit->save();

        $changedValues = [];
        for ($fieldIndex = 0; $fieldIndex < count($roleFields); $fieldIndex++) {
            $fieldName = $roleFields[$fieldIndex];

            if ($rowToEdit->{$fieldName} != $oldRoleFields[$fieldName]) {
                if ('from_date' == $fieldName || 'to_date' == $fieldName) {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                        'old_value' => $oldRoleFields[$fieldName],
                        'new_value' => $rowToEdit->{$fieldName},
                    ];
                } else {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.RolesByUsers.' . $fieldName),
                        'old_numeric_value' => $oldRoleFields[$fieldName],
                        'new_numeric_value' => $rowToEdit->{$fieldName},
                    ];
                }
            }
        }

        if (count($changedValues) > 0) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'RolesByUsers',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $rowToEdit->id,
                'valuesList' => $changedValues,
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $newUserRoles = RolesByUsers::where(['user_id' => $userID, 'deleted' => DB::raw(0)])->get();

        $userRolesLength = sizeof($newUserRoles);
        for ($i = 0; $i < $userRolesLength; $i++) {
            $userTeam = Teams::where('id', $newUserRoles[$i]->team_id)->where('deleted', 0)->first();
            if ($userTeam) {
                $newUserRoles[$i]->team_name = $userTeam->name;
                $newUserRoles[$i]->team_key = $userTeam->key;
            }

            $userDep = TeamDepartments::where('id', $newUserRoles[$i]->team_department_id)->first();
            if ($userDep) {
                $newUserRoles[$i]->team_department_name = $userDep->name;
            }
            $newUserRoles[$i]->is_editing = false;

            $filters = GeographicFilters::select(['id',
                'name',
                'inherited_id', 'entity_type', 'entity_id'])->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $userID)->orderBy('inherited_id', 'ASC')->get();

            $this->getUserGeoFiltersPath($filters);

            $newUserRoles[$i]->geo_filters = $filters;

            $team_geo_filters = GeographicFilters::select(['id',
                'name',
                'inherited_id', 'entity_type', 'entity_id'])->where('role_by_user_id', $newUserRoles[$i]->id)->where('user_id', $userID)->whereNull('inherited_id')->orderBy('inherited_id', 'ASC')->get();

            $this->getUserGeoFiltersPath($team_geo_filters);
            // $this->getUserTeamGeoFiltersPath($team_geo_filters);

            $newUserRoles[$i]->team_geo_filters = $team_geo_filters;

            $userRoles = UserRoles::where('id', $newUserRoles[$i]->user_role_id)->first();
            if ($userRoles) {
                $newUserRoles[$i]->name = $userRoles->name;
                $module = Modules::where('id', $userRoles->module_id)->first();
                if ($module) {
                    $newUserRoles[$i]->module_name = $module->name;
                }
            }
        }

        $jsonOutput->setData($newUserRoles);
    }

    public function getCurrentUserTeams(Request $request, $user_key = null)
    {
        $jsonOutput = app()->make("JsonOutput");

        $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
        //var_dump($routePermissions);
        $foundPermission = false;
        foreach ($routePermissions as $routePermission) {
            if ($routePermissions = 'crm.requests.add' || $routePermissions = 'crm.requests.edit') {
                $foundPermission = true;
            }
        }

        $arrayIds = array();
        $teams = array();
        $getAllTeams= false;
        //get teams relevant for current user
        if ($user_key == null || $user_key == '') {
            //get all teams if user logged in is admin
            if (Auth::user()->admin == 1) {
                $tempTeams = Teams::select('id', 'teams.name', 'key', 'leader_id', 'crm_center')
                    ->where('teams.deleted', '=', 0)
                    ->get();

            } else if ($request->input('viewable') == 1 && Auth::user()->admin == 0) {
                if ($foundPermission == true/*|| Auth::user()->admin*/) {
                    $tempUserTeams = RolesByUsers::select('team_id as id', 'teams.name', 'teams.key as key', 'teams.leader_id as leader_id', 'teams.viewable')
                        ->withTeam()->withUser()->where('users.id', Auth::user()->id)
                        ->where('teams.deleted', '0')->where('from_date', '<=', Carbon::now())
                        ->where('roles_by_users.deleted', '=', 0)
                        ->where(function ($query1) {
                            $query1->whereNull('to_date')
                                ->orWhere('to_date', '>=', Carbon::now()
                                        ->addDays(-1));
                        });
                        
                    $tempUserTeamsArray = $tempUserTeams->get();
                    
                    foreach ($tempUserTeamsArray as $tmpTeam){
                        // If user has team with viewable permissions
                        if($tmpTeam->viewable == 1){ $getAllTeams = true; }
                    }

                    if($getAllTeams){
                        $tempTeams = Teams::select('id', 'teams.name', 'key', 'leader_id', 'crm_center')
                        ->where('teams.deleted', '=', 0)
                        ->get();
                    } else{
                        //get all the crm center teams and the relevant teams for user roles
                        $tempTeams = Teams::select('id', 'teams.name', 'key', 'leader_id', 'crm_center')
                        ->where('teams.crm_center', '=', 1)->where('teams.deleted', '=', 0)
                        ->union($tempUserTeams)->get();
                    }

                } else {
                    $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
                    return;
                }
            } else {
                $tempTeams = RolesByUsers::select('team_id as id', 'teams.name', 'teams.key as key', 'teams.leader_id as leader_id', 'teams.viewable', 'teams.crm_center')->withTeam()->withUser()
                //->where('users.key', $user_key)
                    ->where('users.id', Auth::user()->id)
                    ->where('teams.deleted', '0')->where('from_date', '<=', Carbon::now())
                    ->where('roles_by_users.deleted', '=', 0)
                    ->where(function ($query1) {
                        $query1->whereNull('to_date')
                            ->orWhere('to_date', '>=', Carbon::now()
                                    ->addDays(-1));
                    })->get();
            }
        } else {
            if ($request->input('viewable') == 1) {

                if ($foundPermission == true || Auth::user()->admin) {
                    $tempUserTeams = RolesByUsers::select('team_id as id', 'teams.name', 'teams.key as key', 'teams.leader_id as leader_id', 'teams.viewable', 'teams.crm_center')
                        ->withTeam()->withUser()->where('users.key', $user_key)
                        ->where('teams.deleted', '0')->where('from_date', '<=', Carbon::now())
                        ->where('roles_by_users.deleted', '=', 0)
                        ->where(function ($query1) {
                            $query1->whereNull('to_date')
                                ->orWhere('to_date', '>=', Carbon::now()
                                        ->addDays(-1));
                        });
                        $tempUserTeamsArray = $tempUserTeams->get();
                        
                        foreach ($tempUserTeamsArray as $tmpTeam){
                            // If user has team with viewable permissions
                            if($tmpTeam->viewable == 1){ $getAllTeams = true; }
                        }
                       if($getAllTeams){
                           $tempTeams = Teams::select('id', 'teams.name', 'key', 'leader_id', 'teams.viewable', 'teams.crm_center')
                           ->where('teams.deleted', '=', 0)
                           ->get();
                       } else{
                           //get all the crm center teams and the relevant teams for user roles
                           $tempTeams = Teams::select('id', 'teams.name', 'key', 'leader_id', 'teams.viewable', 'teams.crm_center')
                           ->where('teams.crm_center', '=', 1)->where('teams.deleted', '=', 0)
                           ->union($tempUserTeams)->get();
                       };
                } else {
                    $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'));
                    return;
                }
            } else {
                $tempTeams = RolesByUsers::select('team_id as id', 'teams.name', 'teams.key as key', 'teams.leader_id as leader_id', 'teams.viewable', 'teams.crm_center')->withTeam()->withUser()
                //->where('users.key', $user_key)
                    ->where('users.key', $user_key)
                    ->where('teams.deleted', '0')->where('from_date', '<=', Carbon::now())
                    ->where('roles_by_users.deleted', '=', 0)
                    ->where(function ($query1) {
                        $query1->whereNull('to_date')
                            ->orWhere('to_date', '>=', Carbon::now()
                                    ->addDays(-1));
                    })->get();
            }
        }

        for ($i = 0; $i < sizeof($tempTeams); $i++) {
            //remove duplicates from array of teams
            if (array_search($tempTeams[$i]->id, $arrayIds) === false) {
                $tmpUser = User::select(['first_name' , 'last_name', 'users.key AS leader_key'])->where('users.id' ,$tempTeams[$i]->leader_id)->withVoter()->first();
                if($tmpUser){
                    $tempTeams[$i]->first_name=$tmpUser->first_name;
                    $tempTeams[$i]->last_name=$tmpUser->last_name;
                    $tempTeams[$i]->leader_key=$tmpUser->leader_key;
                }
                else{
                    $tempTeams[$i]->first_name='';
                    $tempTeams[$i]->last_name='';
                    $tempTeams[$i]->leader_key=null;
                }
                array_push($arrayIds, $tempTeams[$i]->id);
                array_push($teams, $tempTeams[$i]);
            }
        }

        $jsonOutput->setData($teams);
    }

    public function getCurrentUserRoles()
    {
        $jsonOutput = app()->make("JsonOutput");
        $roles = Auth::user()->roles()->select('user_roles.key', 'user_roles.name AS role_name', 'teams.name AS team_name', 'teams.key AS team_key', 'main')
            ->join('teams', 'teams.id', '=', 'roles_by_users.team_id')
            ->orderBy('main', 'desc')->get();
        $jsonOutput->setData($roles);
    }

    public function getCurrentUserTeamMates(Request $request, $team_key = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        $arrayIds = array();
        $users = array();
        $teamId = Teams::select('id')->where('key', $team_key)->where('deleted', 0)->first();
        $system_name_module = $request->input('system_name_module', false);
        $onlyActiveUser = $request->input('only_active_user', false);
       

        if ($teamId == null && $team_key != null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_TEAM_KEY'));
            return;
        }
        if ($team_key == null) {
            $onlyUsersWithCrmRole = $request->input('only_users_with_crm_role', false);
            if (Auth::user()->admin == 0) {
                $teams = $this->getUserTeams($onlyUsersWithCrmRole);
                $roleUsers = $this->getUsersByRoles($teams,$system_name_module,$onlyActiveUser)->get();
            } else {
                //get all users if user loged in is admin and no team selected
                $roleUsers = $this->getUsersByRoles(null,$system_name_module,$onlyActiveUser)->get();
            }

        } else {
            // $teamData = Teams::where('key', $team_key)->where('viewable', 1)->first();
            $teamData = Teams::where('key', $team_key)->first();
            if ($teamData) {
                $roleUsers = $this->getUsersByRoles([$teamData->id],$system_name_module,$onlyActiveUser)->get();
            }
        }
        if (!empty($roleUsers)) {
            $users = $roleUsers->uniqueStrict();
        }

        $jsonOutput->setData($users);
    }
    public function getUserRequestsTopics($userKey){
        $jsonOutput = app()->make("JsonOutput");

        $userTopics = User::select(['request_topics_by_users.id as request_topic_user_id','request_topics.id as request_topic_id', 'request_topics.name as sub_topic_name', 'request_topic_parent.name as topic_name',])
        ->withRequestsTopics()
        ->where('users.key', $userKey)
        ->where('request_topics.parent_id', '!=' , DB::raw(0))
        ->get();

        if (!$userTopics) {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST')); return;
        }

        $jsonOutput->setData($userTopics);

    }
    public function removeTopicFromUser($userKey, $requestUserId){
        $jsonOutput = app()->make("JsonOutput");
        $user = User::select('id','voter_id')->where('key', $userKey)->first();
        if (!$user) {
            $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST')); return;
        }
        $requestTopicUser =  RequestTopicUsers::where('id', $requestUserId)->where('user_handler_id', $user->id)->first();

        // dd($requestTopicUser->toArray());
        if($requestTopicUser){
            $result = HelpFunctions::updateRequestTopicUserHandler($jsonOutput, 'users', $requestTopicUser->request_topic_id, $requestTopicUser->city_id, null, null);
            if(!$result){ return;}
        }
        $jsonOutput->setData('OK');
    }
    private function getUserTeams($onlyUsersWithCrmRole)
    {
        $userTeams = RolesByUsers::select('team_id as id', 'teams.name')->withTeam()->withUser()
            ->where('user_id', Auth::user()->id)
            ->where('teams.deleted', '0')->where('from_date', '<=', Carbon::now())
            ->where('roles_by_users.deleted', '=', 0)
            ->where(function ($query1) {
                $query1->whereNull('to_date')
                    ->orWhere('to_date', '>=', Carbon::now()
                            ->addDays(-1));
            });
            if($onlyUsersWithCrmRole){
               $userTeams->join('modules', 'modules.id', '=', 'user_roles.module_id')->where('modules.system_name', 'requests');
            }

        $userTeams = $userTeams->get();
        $teams = [];
        foreach ($userTeams as $team) {
            if (array_search($team->id, $teams) === false) {
                array_push($teams, $team->id);
            }
        }
        return $teams;
    }

    public function getUsersByRoles($teams = null, $moduleSystemName = null ,$onlyActiveUser = false)
    {
        $selectFields = [
            'user_id as id',
            'teams.key as team_key',
            'users.key as key',
            'voter_id',
            'voters.first_name',
            'voters.last_name',
            'voters.personal_identity',
            DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS name'),
        ];
        $usersQuery = RolesByUsers::select($selectFields)
            ->withTeamMates()
            ->withUserRoleOnly()
            ->leftJoin('modules', 'modules.id', '=', 'user_roles.module_id')
            ->where('from_date', '<=', Carbon::now())
            ->where('roles_by_users.deleted', '=', 0)
            ->where(function ($query1) {
                $query1->whereNull('to_date')
                ->orWhere('to_date', '>=', Carbon::now()
                    ->addDays(-1));
            })->where('users.deleted', 0);

        if ($teams) $usersQuery->whereIn('teams.id', $teams);
        if ($moduleSystemName) {
            $usersQuery->where('modules.system_name', $moduleSystemName);
        }
        if($onlyActiveUser){
            $usersQuery->where('users.active',1);
        }
        // Log::info( $usersQuery->toSql());
        // Log::info( $usersQuery->getBindings());
        return $usersQuery;
    }
    /** User Favorites */
    public function getFavorites()
    {
        $jsonOutput = app()->make("JsonOutput");
        $user = Auth::user();
        $favorites = UserFavorites::select('key', 'url', 'title')
            ->where('user_id', $user->id)->where('deleted', 0)
            ->orderBy('updated_at', 'DESC')->get();
        $jsonOutput->setData($favorites);
    }

    public function addToFavorites(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $url = trim($request->input('url', false));
        $title = trim($request->input('title', false));

        if (!$url || !$title) {
            $jsonOutput->setErrorCode(config('errors.system.ADD_FAVORITES_MISSING_DATA'));
            return;
        }

        $user = Auth::user();
        $key = Helper::getNewTableKey('user_favorites', 5);
        $item = new UserFavorites;
        $item->key = $key;
        $item->url = $url;
        $item->title = $title;
        $item->user_id = $user->id;
        $item->save();
        $jsonOutput->setData('');
    }

    public function removeFromFavorites($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $userId = Auth::user()->id;
        UserFavorites::where('user_id', $userId)->where('key', $key)->update(['deleted' => 1]);
        $jsonOutput->setData('');
    }
    private function getUserGeoFiltersPath(&$filters){
        // dump($filters->toArray());
        $filtersCnt = count($filters);
        for ($k = 0; $k < $filtersCnt; $k++) {
            $filters[$k]->inherited = (is_null($filters[$k]->inherited_id) ? 0 : 1);
            $filters[$k]->full_path_name = '';
            switch ($filters[$k]->entity_type) {
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                    $areasGroup = AreasGroup::where('id', $filters[$k]->entity_id)->where('deleted', 0)->first();

                    if ($areasGroup) {
                        $filters[$k]->area_group_id = $areasGroup->id;
                        $filters[$k]->area_group_name = $areasGroup->name;
                        $filters[$k]->full_path_name = $areasGroup->name ;
                    }
                    
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                    $area = Area::where('id', $filters[$k]->entity_id)->where('deleted', 0)->first();
                    if ($area) {
                        $filters[$k]->area_id = $area->id;
                        $filters[$k]->area_name = $area->name;
                        $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();

                        if ($areasGroup) {
                            $filters[$k]->area_group_id = $areasGroup->id;
                            $filters[$k]->area_group_name = $areasGroup->name;
                            $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                        }
                        $filters[$k]->full_path_name .= $area->name;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):

                    $subarea = SubArea::where('id', $filters[$k]->entity_id)->where('deleted', 0)->first();
                    if ($subarea) {
                        $filters[$k]->sub_area_name = $subarea->name;
                        $filters[$k]->sub_area_key = $subarea->key;

                        $area = Area::where('id', $subarea->area_id)->first();
                        if ($area) {
                            $filters[$k]->area_id = $area->id;
                            $filters[$k]->area_name = $area->name;
                            $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                            if ($areasGroup) {
                                $filters[$k]->area_group_id = $areasGroup->id;
                                $filters[$k]->area_group_name = $areasGroup->name;
                                $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                            }
                            $filters[$k]->full_path_name = $area->name . ' >> ';
                        }

                        $filters[$k]->full_path_name .= $subarea->name;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):

                    $city = City::where('id', $filters[$k]->entity_id)->where('deleted', 0)->first();
                    if ($city) {
                        $filters[$k]->sub_area_id = $city->sub_area_id;
                        if ($city->sub_area_id != null) {
                            $subArea = SubArea::where('id', $city->sub_area_id)->first();
                            if ($subArea) {
                                $filters[$k]->sub_area_name = $subArea->name;
                                $filters[$k]->sub_area_key = $subArea->key;
                            }
                        }
                        $filters[$k]->city_id = $city->id;
                        $filters[$k]->city_name = $city->name;
                        $area = Area::where('id', $city->area_id)->first();
                        if ($area) {
                            $filters[$k]->area_id = $area->id;
                            $filters[$k]->area_name = $area->name;
                            $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();

                            if ($areasGroup) {
                                $filters[$k]->area_group_id = $areasGroup->id;
                                $filters[$k]->area_group_name = $areasGroup->name;
                                $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                            }
                            $filters[$k]->full_path_name .= $area->name . ' >> ';
                        }
                        $filters[$k]->full_path_name .= $city->name;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):

                    $neighborhood = Neighborhood::where('id', $filters[$k]->entity_id)->where('deleted', 0)->first();
                    if ($neighborhood) {
                        $filters[$k]->neighborhood_id = $neighborhood->id;
                        $filters[$k]->neighborhood_name = $neighborhood->name;
                        $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                        if ($city) {
                            $filters[$k]->sub_area_id = $city->sub_area_id;
                            if ($city->sub_area_id != null) {
                                $subArea = SubArea::where('id', $city->sub_area_id)->first();
                                if ($subArea) {
                                    $filters[$k]->sub_area_name = $subArea->name;
                                    $filters[$k]->sub_area_key = $subArea->key;
                                }
                            }
                            $filters[$k]->city_id = $city->id;
                            $filters[$k]->city_name = $city->name;
                            $area = Area::where('id', $city->area_id)->first();
                            if ($area) {
                                $filters[$k]->area_id = $area->id;
                                $filters[$k]->area_name = $area->name;
                                $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
                                if ($areasGroup) {
                                    $filters[$k]->area_group_id = $areasGroup->id;
                                    $filters[$k]->area_group_name = $areasGroup->name;
                                    $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                                }
                                $filters[$k]->full_path_name .= $area->name . ' >> ';
                            }
                            $filters[$k]->full_path_name .= $city->name . ' >> ';
                        }
                        $filters[$k]->full_path_name .= $neighborhood->name;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):

                    $cluster = Cluster::where('id', $filters[$k]->entity_id)->first();
                    if ($cluster) {
                        $filters[$k]->cluster_id = $cluster->id;
                        $filters[$k]->cluster_name = $cluster->name;
                        $neighborhood = Neighborhood::where('id', $cluster->neighborhood_id)->where('deleted', 0)->first();
                        if ($neighborhood) {
                            $filters[$k]->neighborhood_id = $neighborhood->id;
                            $filters[$k]->neighborhood_name = $neighborhood->name;
                            $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                        } else {
                            $filters[$k]->neighborhood_id = -1;
                            $filters[$k]->neighborhood_name = '';
                            $city = City::where('id', $cluster->city_id)->where('deleted', 0)->first();
                        }
                        if ($city) {
                            $filters[$k]->sub_area_id = $city->sub_area_id;
                            if ($city->sub_area_id != null) {
                                $subArea = SubArea::where('id', $city->sub_area_id)->first();
                                if ($subArea) {
                                    $filters[$k]->sub_area_name = $subArea->name;
                                    $filters[$k]->sub_area_key = $subArea->key;
                                }
                            }
                            $filters[$k]->city_id = $city->id;
                            $filters[$k]->city_name = $city->name;
                            $area = Area::where('id', $city->area_id)->first();
                            if ($area) {
                                $filters[$k]->area_id = $area->id;
                                $filters[$k]->area_name = $area->name;
                                $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
    
                                if ($areasGroup) {
                                    $filters[$k]->area_group_id = $areasGroup->id;
                                    $filters[$k]->area_group_name = $areasGroup->name;
                                    $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                                }
                                $filters[$k]->full_path_name .= $area->name . ' >> ';
                            }
                            $filters[$k]->full_path_name .= $city->name . ' >> ';
                        }
                        if ($neighborhood) {
                            $filters[$k]->full_path_name .= $neighborhood->name . ' >> ';
                        }
                        $filters[$k]->full_path_name .= $cluster->name;
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):

                    $ballot = BallotBox::where('id', $filters[$k]->entity_id)->first();
                    if ($ballot) {
                        $filters[$k]->ballot_id = $ballot->id;
                        $filters[$k]->ballot_name = 'קלפי ' . $ballot->id;
                        $cluster = Cluster::where('id', $ballot->cluster_id)->first();
                        if ($cluster) {
                            $filters[$k]->cluster_id = $cluster->id;
                            $filters[$k]->cluster_name = $cluster->name;
                            $neighborhood = Neighborhood::where('id', $cluster->neighborhood_id)->where('deleted', 0)->first();
                            if ($neighborhood) {
                                $filters[$k]->neighborhood_id = $neighborhood->id;
                                $filters[$k]->neighborhood_name = $neighborhood->name;
                                $city = City::where('id', $neighborhood->city_id)->where('deleted', 0)->first();
                            } else {
                                $filters[$k]->neighborhood_id = -1;
                                $filters[$k]->neighborhood_name = '';
                                $city = City::where('id', $cluster->city_id)->where('deleted', 0)->first();
                            }
                            if ($city) {
                                $filters[$k]->sub_area_id = $city->sub_area_id;
                                if ($city->sub_area_id != null) {
                                    $subArea = SubArea::where('id', $city->sub_area_id)->first();
                                    if ($subArea) {
                                        $filters[$k]->sub_area_name = $subArea->name;
                                        $filters[$k]->sub_area_key = $subArea->key;
                                    }
                                }
                                $filters[$k]->city_id = $city->id;
                                $filters[$k]->city_name = $city->name;
                                $area = Area::where('id', $city->area_id)->first();
                                if ($area) {
                                    $filters[$k]->area_id = $area->id;
                                    $filters[$k]->area_name = $area->name;
                                    $areasGroup = AreasGroup::where('id', $area->areas_group_id)->first();
        
                                    if ($areasGroup) {
                                        $filters[$k]->area_group_id = $areasGroup->id;
                                        $filters[$k]->area_group_name = $areasGroup->name;
                                        $filters[$k]->full_path_name = $areasGroup->name . ' >> ';
                                    }
                                    $filters[$k]->full_path_name .= $area->name . ' >> ';
                                }
                                $filters[$k]->full_path_name .= $city->name . ' >> ';
                            }
                            if ($neighborhood) {
                                $filters[$k]->full_path_name .= $neighborhood->name . ' >> ';
                            }
                            $filters[$k]->full_path_name .= $cluster->name . ' >> ';
                        }
                        $filters[$k]->full_path_name .= 'קלפי ' . $ballot->id;
                    }
                    break;
            }
        }
        return $filters;
    }
   

}
