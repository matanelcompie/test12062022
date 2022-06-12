<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Country;
use App\Models\Ethnic;
use App\Models\ReligiousGroup;
use App\Models\City;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\Neighborhood;
use App\Models\Streets;
use App\Models\PhoneTypes;
use App\Models\VoterTitle;
use App\Models\VoterEndings;
use App\Models\SupportStatus;
use App\Models\Action;
use App\Models\ActionType;
use App\Models\ActionTopic;
use App\Models\VoterMetaKeys;
use App\Models\VoterMetaValues;
use App\Models\ElectionRoles;
use App\Models\UserRoles;
use App\Models\PermissionGroup;
use App\Models\RequestStatus;
use App\Models\RequestStatusType;
use App\Models\Modules;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use App\Models\Voters;
use App\Models\VoterMetas;
use App\Models\CrmRequest;
use App\Models\ShasRepresentativeRoles;
use App\Models\ReligiousCouncilRoles;
use App\Models\CityShasRoles;
use App\Models\Institutes;
use App\Models\InstituteGroup;
use App\Models\InstituteTypes;
use App\Models\InstituteNetwork;
use App\Models\InstituteRole;
use App\Models\VoterGroups;
use App\Models\VoterGroupPermissions;
use App\Models\Cluster;
use App\Models\Teams;
use App\Models\User;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaigns;
use App\Models\RequestSource;
use App\Models\RequestClosureReason;
use App\Models\Languages;
use App\Models\CityDepartments;
use App\Models\CsvSources;
use App\Models\SmsProvider;

use Auth;
use App\Libraries\Helper;
use App\Http\Controllers\ActionController;
use App\Libraries\HelpFunctions;
use App\Repositories\RequestTopicsRepository;
use Illuminate\Support\Facades\Log;
use App\Libraries\Services\system\ListsService;
use App\Models\ElectionRoleShifts;
use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Libraries\Services\ServicesModel\ShasBankDetailsService;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistPaymentModels\PaymentType;
use App\Models\ActivistPaymentModels\PaymentTypeAdditional;
use App\Models\ActivistPaymentModels\ReasonPaymentStatus;
use App\Models\ShasBankDetails;
use App\Repositories\CityRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\ReasonPaymentStatusRepository;
use App\Repositories\StreetRepository;
use App\Repositories\TeamRepository;

class ListsController extends Controller {
    
	/*
		Function that returns all countries
	*/
	public function getCountries() {

        $jsonOutput = app()->make("JsonOutput");
        $countries = Country::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($countries);
    }

	/*
		Function that deletes existing country by countryKey and POST params
	*/
    public function deleteCountry(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = Country::select('id')->where('key', $key)->first()['id'];

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = Voters::select('voters.id')->withFilters()->where('origin_country_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        Country::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.countries.delete',
            'models' => [
                [
                    'referenced_model' => 'Country',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing country by countryKey and POST params
	*/
    public function updateCountry(Request $request, $key) {

        $name = trim($request->input('name'));
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = Country::select('id', 'name')->where('key', $key)->first();
        Country::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.countries.edit',
                'models' => [
                    [
                        'referenced_model' => 'Country',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.Country.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new country by  POST params
	*/
    public function addCountry(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('countries', 5);
        $country = new Country;
        $country->key = $key;
        $country->name = $name;
        $country->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.countries.add',
            'models' => [
                [
                    'referenced_model' => 'Country',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $country->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Country.name'),
                            'new_value' => $country->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /*
		Function that returns all ethnic groups
	*/
    public function getEthnic() {

        $jsonOutput = app()->make("JsonOutput");
        $ethnic = Ethnic::select('id', 'key', 'name', 'sephardi')->where('deleted', 0)->get();
        $jsonOutput->setData($ethnic);
    }

	/*
		Function that deletes existing ethnic group by ethnicKey and POST params
	*/
    public function deleteEthnic(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = Ethnic::select('id')->where('key', $key)->first()->id;
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        $isItemInUse = Voters::select('voters.id')->withFilters()->where('ethnic_group_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        Ethnic::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.ethnic_groups.delete',
            'models' => [
                [
                    'referenced_model' => 'Ethnic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing ethnic group by ethnicKey and POST params
	*/
    public function updateEthnic(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));
        $sephardi = trim($request->input('sephardi'));
        $sephardiValue = is_numeric($sephardi) ? intval($sephardi) : null;

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = Ethnic::select('id', 'name', 'sephardi')->where('key', $key)->first();
        Ethnic::where('key', $key)->update(['name' => $name, 'sephardi' => $sephardiValue]);

        $changedValues = [];

        if ( $name != $item->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.Ethnic.name'),
                'old_value' => $item->name,
                'new_value' => $name
            ];
        }

        if ( $sephardiValue != $item->sephardi ) {
            $changedValues[] = [
                'field_name' => 'sephardi',
                'display_field_name' => config('history.Ethnic.sephardi'),
                'old_numeric_value' => $item->sephardi,
                'new_numeric_value' => $sephardiValue
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.ethnic_groups.edit',
                'models' => [
                    [
                        'referenced_model' => 'Ethnic',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new ethnic group by  POST params
	*/
    public function addEthnic(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $key = Helper::getNewTableKey('ethnic_groups', 5);
        $newRow = new Ethnic;
        $newRow->key = $key;
        $newRow->name = $name;
        $newRow->old_id = 0;
        $newRow->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.ethnic_groups.add',
            'models' => [
                [
                    'referenced_model' => 'Ethnic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newRow->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Ethnic.name'),
                            'new_value' => $newRow->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /*
        Function that returns all religious groups
    */
    public function getReligiousGroups() {

        $jsonOutput = app()->make("JsonOutput");
        $religiousGroups = ReligiousGroup::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($religiousGroups);
    }

    /*
        Function that deletes existing religious group by key and POST params
    */
    public function deleteReligiousGroup(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $item = ReligiousGroup::select('id')->where('key', $key)
                                            ->where('deleted', 0)
                                            ->first();
        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = $item->id;

        $isItemInUse = Voters::select('voters.id')->withFilters()->where('religious_group_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        ReligiousGroup::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.religious_groups.delete',
            'models' => [
                [
                    'referenced_model' => 'ReligiousGroup',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /*
        Function that updates existing religious group by ethnicKey and PUT params
    */
    public function updateReligiousGroup(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = ReligiousGroup::select('id', 'name')->where('key', $key)
                                                    ->where('deleted', 0)
                                                    ->first();
        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $existItemName = ReligiousGroup::select('id')
                                ->where('name', $name)
                                ->where('id', '!=', $item->id)
                                ->where('deleted', 0)
                                ->first();
        if ($existItemName) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return;            
        } 
        
        $oldName = $item->name;                                             
        $item->name= $name;
        $item->save();

        $changedValues = [];

        if ( $name != $item->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.Ethnic.name'),
                'old_value' => $oldName,
                'new_value' => $name
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.ereligious_groups.edit',
                'models' => [
                    [
                        'referenced_model' => 'ReligiousGroup',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

    /*
        Function that adds new religious group by POST params
    */
    public function addReligiousGroup(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (mb_strlen($name, 'UTF8') < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = ReligiousGroup::select('id')
                                ->where('name', $name)
                                ->where('deleted', 0)
                                ->first();
        if ($item) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return;            
        }
        $key = Helper::getNewTableKey('religious_groups', 5);
        $newRow = new ReligiousGroup;
        $newRow->key = $key;
        $newRow->name = $name;
        $newRow->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.religious_groups.add',
            'models' => [
                [
                    'referenced_model' => 'Religious',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newRow->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ReligiousGroup.name'),
                            'new_value' => $newRow->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /*
		Function that returns all cities
	*/
	public function getCities() {

        $jsonOutput = app()->make("JsonOutput");
        $result = City::select('cities.id AS city_id', 'cities.key AS city_key', 'cities.name AS city_name', 'cities.mi_id')
                ->withAreaAndSubArea()//documentation in the scope function
                ->where('cities.deleted', 0)
                ->orderBy('cities.name', 'asc')
                ->get();
        $jsonOutput->setData($result);
    }

    public function getNameAndIdCityList()
    {
        $jsonOutput = app()->make("JsonOutput");
        $cities = CityRepository::getNameAndIdCityList();
        $jsonOutput->setData($cities);
    }

    public function getNameStreetListByCityId(Request $request, $cityId)
    {
        $jsonOutput = app()->make("JsonOutput");
        $streets = StreetRepository::getNameStreetListByCityId($cityId);
        $jsonOutput->setData($streets);
    }

	/*
		Function that deletes existing city by cityKey and POST params
	*/
    public function deleteCity(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = City::select('id', 'name')->where('key', $key)->first();
        $itemId = $item->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = Voters::select('voters.id')->withFilters()->where('mi_city_id', $itemId)->first() ||
                Voters::select('voters.id')->withFilters()->where('voters.city_id', $itemId)->first() ||
                Streets::select('id')->where('city_id', $itemId)->first() ||
                Neighborhood::select('id')->where('city_id', $itemId)->first() ||
                \App\Models\User::select('id')->where('work_city_id', $itemId)->first() ||
                Institutes::select('id')->where('city_id', $itemId)->first() ||
                \App\Models\TempVoter::select('id')->where('city_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        City::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.cities.delete',
            'models' => [
                [
                    'referenced_model' => 'City',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing city by cityKey and POST params
	*/
    public function updateCity(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $cityData = $request->input('city');
        $cityValues = [];

        if (!is_array($cityData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($cityData as $key1 => $value) {
            $cityValues[$key1] = trim($value);
        }

        $cityName = $cityValues['cityName'];
        $miId = $cityValues['miId'];
        $areaId = $cityValues['areaKey'] ? Area::select('id')->where('key', $cityValues['areaKey'])->first()['id'] : null;
        $subAreaId = $cityValues['subAreaKey'] ? SubArea::select('id')->where('key', $cityValues['subAreaKey'])->first()['id'] : null;

        if (strlen($cityName) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = City::select('id', 'name', 'mi_id', 'area_id', 'sub_area_id')->where('key', $key)->first();
        $changedValues = array();

        if ($item['name'] != $cityName) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.City.name'),
                'old_value' => $item->name,
                'new_value' => $cityName
            ];
        }

        if ($item['mi_id'] != $miId) {
            $changedValues[] = [
                'field_name' => 'mi_id',
                'display_field_name' => config('history.City.mi_id'),
                'old_numeric_value' => $item->mi_id,
                'new_numeric_value' => $miId
            ];
        }

        if ($item['area_id'] != $areaId) {
            $changedValues[] = [
                'field_name' => 'area_id',
                'display_field_name' => config('history.City.area_id'),
                'old_numeric_value' => $item->area_id,
                'new_numeric_value' => $areaId
            ];
        }

        if ($item['sub_area_id'] != $subAreaId) {
            $changedValues[] = [
                'field_name' => 'sub_area_id',
                'display_field_name' => config('history.City.sub_area_id'),
                'old_numeric_value' => $item->sub_area_id,
                'new_numeric_value' => $subAreaId
            ];
        }

        if (count($changedValues) > 0) {// if there is changes, add to history and update
            $city = City::where('key', $key)->first();
            $city->name = $cityName;
            $city->mi_id = $miId;
            $city->area_id = $areaId;
            $city->sub_area_id = $subAreaId;
            $city->save();

            $historyArgsArr = [
                'topicName' => 'system.lists.general.cities.edit',
                'models' => [
                    [
                        'referenced_model' => 'City',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $city->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);

            $jsonOutput->setData('');
        }
    }

	/*
		Function that adds new city by  POST params
	*/
    public function addCity(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $cityData = $request->input('city');
        $cityValues = [];

        if (!is_array($cityData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($cityData as $key1 => $value) {
            $cityValues[$key1] = trim($value);
        }

        $cityName = $cityValues['cityName'];
        $miId = $cityValues['miId'];
        $areaId = $cityValues['areaKey'] ? Area::select('id')->where('key', $cityValues['areaKey'])->first()['id'] : null;
        $subAreaId = $cityValues['subAreaKey'] ? SubArea::select('id')->where('key', $cityValues['subAreaKey'])->first()['id'] : null;

        if (strlen($cityName) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $city = new City;
        $key = Helper::getNewTableKey('cities', 10);
        $city->key = $key;
        $city->name = $cityName;
        $city->mi_id = $miId;
        $city->area_id = $areaId;
        $city->sub_area_id = $subAreaId;
        $city->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.cities.add',
            'models' => [
                [
                    'referenced_model' => 'City',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $city->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.City.name'),
                            'new_value' => $city->name
                        ],
                        [
                            'field_name' => 'mi_id',
                            'display_field_name' => config('history.City.mi_id'),
                            'new_numeric_value' => $city->mi_id
                        ],
                        [
                            'field_name' => 'area_id',
                            'display_field_name' => config('history.City.area_id'),
                            'new_numeric_value' => $city->area_id
                        ],
                        [
                            'field_name' => 'sub_area_id',
                            'display_field_name' => config('history.City.sub_area_id'),
                            'new_numeric_value' => $city->sub_area_id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that returns all neighborhoods of city by cityKey and POST params
	*/
    public function getCityNeighborhoods(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $cityKey = trim($key);
            $areaId = City::select('id')->where('key', $cityKey)->first()['id'];
            $result = Neighborhood::select('id', 'key', 'name')->where('city_id', $areaId)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $result = Neighborhood::select('id', 'key', 'name', 'city_id')->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that returns all streets of city by cityKey and POST params
	*/
    public function getCityStreets(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $cityKey = trim($key);
            $areaId = City::select('id')->where('key', $cityKey)->first()['id'];
            $result = Streets::select('id', 'key', 'name', 'mi_id')->where('city_id', $areaId)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $result = Streets::select('id', 'key', 'name', 'city_id', 'mi_id')->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        }
    }

    /*
		Function that returns all areas
	*/ 
	public function getAreas() {
        $jsonOutput = app()->make("JsonOutput");
        $result = Area::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that returns all areas groups
	*/
    public function getAreasGroups()
    {
        $jsonOutput = app()->make("JsonOutput");
        $resultArray = AreasGroup::all();
        $jsonOutput->setData($resultArray);
    }

	/*
		Function that deletes existing area by areaKey and POST params
	*/
    public function deleteArea(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = Area::select('id')->where('key', $key)->first()->id;
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = SubArea::select('id')->where('area_id', $itemId)->first() ||
                City::select('id')->where('area_id', $itemId)->first() ||
                \App\Models\ElectionRolesGeographical::select('id')->where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'))->where('entity_id', $itemId)->first() ||
                \App\Models\GeographicFilters::select('id')->where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'))->where('entity_id', $itemId)->first() ||
                \App\Models\GeographicFilterTemplates::select('id')->where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'))->where('entity_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        Area::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.areas.delete',
            'models' => [
                [
                    'referenced_model' => 'Area',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing area by areaKey and POST params
	*/
    public function updateArea(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $name = trim($request->input('name'));
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = Area::select('id', 'name')->where('key', $key)->first();
        Area::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.areas.edit',
                'models' => [
                    [
                        'referenced_model' => 'Area',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.Area.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that add new area by  POST params
	*/
    public function addArea(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('areas', 10);
        $row = new Area;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.areas.add',
            'models' => [
                [
                    'referenced_model' => 'Area',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Area.name'),
                            'new_value' => $name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }


	/*
		Function that returns all sub-areas , or all sub-areas by areaKey
	*/
    public function getSubAreas( $areaKey = null) {
        $jsonOutput = app()->make("JsonOutput");
        $geoCon = new GeographicController;
        $result = $geoCon->getSubAreas($areaKey);

        $jsonOutput->setData($result);
    }

	/*
		Function that deletes existing sub-area by subAreaKey and POST params
	*/
    public function deleteSubArea(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = SubArea::select('id')->where('key', $key)->first()['id'];
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = City::select('id')->where('sub_area_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        SubArea::where('key', $key)->update(['deleted' => 1]);
        $item = SubArea::select('id')->where('key', $key)->first();

        //ActionController::AddHistoryItem('system.lists.general.areas.sub_areas.delete', $item['id'], 'SubArea');
        $historyArgsArr = [
            'topicName' => 'system.lists.general.areas.sub_areas.delete',
            'models' => [
                [
                    'referenced_model' => 'SubArea',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing sub-area by subAreaKey and POST params
	*/
    public function updateSubArea(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = SubArea::select('id', 'name')->where('key', $key)->first();
        SubArea::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.areas.sub_areas.edit',
                'models' => [
                    [
                        'referenced_model' => 'SubArea',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                         'valuesList' => [
                             [
                                 'field_name' => 'name',
                                 'display_field_name' => config('history.SubArea.name'),
                                 'old_value' => $item->name,
                                 'new_value' => $name
                             ]
                         ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new sub-area by POST params
	*/
    public function addSubArea(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $subAreaData = $request->input('item');

        if (!is_array($subAreaData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $key = Helper::getNewTableKey('sub_areas', 10);
        $subAreaValues = [];

        foreach ($subAreaData as $k => $v) {
            $subAreaValues[$k] = trim($v);
        }

        $name = $subAreaValues['name'];
        $areaId = $subAreaValues['area_id'];

        if (strlen($name) < 2 || !isset($subAreaValues['area_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $row = new SubArea;
        $row->key = $key;
        $row->name = $name;
        $row->area_id = $areaId;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.areas.sub_areas.add',
            'models' => [
                [
                    'referenced_model' => 'SubArea',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.SubArea.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'area_id',
                            'display_field_name' => config('history.SubArea.area_id'),
                            'new_numeric_value' => $row->area_id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    
	/*
		Function that returns all neighborhoods , or specific neighborhood by neighborhoodKey
	*/
    public function getNeighborhoods(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $neighborhoodKey = trim($key);
            $result = Neighborhood::select('key', 'name', 'city_id')->where('key', $neighborhoodKey)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $result = Neighborhood::select('key', 'name', 'city_id')->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that deletes existing neighborhood by neighborhoodKey and POST params
	*/
    public function deleteNeighborhood(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = Neighborhood::select('id', 'name', 'city_id')->where('key', $key)->first();

        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = 
        Voters::select('voters.id')->withFilters()->where('mi_neighborhood', $item['name'])->where('voters.city_id', $item['city_id'])->first() ||
                Cluster::select('id')->where('neighborhood_id', $item['id'])->first() ||
                \App\Models\TempVoter::select('id')->where('neighborhood', $item['name'])->where('unknown_voters.city_id', $item['city_id'])->first() ||
                \App\Models\User::select('id')->where('work_neighborhood', $item['name'])->where('users.work_city_id', $item['city_id'])->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        Neighborhood::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.neighborhoods.delete',
            'models' => [
                [
                    'referenced_model' => 'Neighborhood',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);


        $jsonOutput->setData('');
    }

	/*
		Function that updates existing neighborhood by neighborhoodKey and POST params
	*/
    public function updateNeighborhood(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = Neighborhood::select('id', 'name')->where('key', $key)->first();
        Neighborhood::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.neighborhoods.edit',     
                'models' => [
                    [
                        'referenced_model' => 'Neighborhood',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.Neighborhood.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that add new neighborhood by  POST params
	*/
    public function addNeighborhood(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $neighborhoodData = $request->input('item');

        if (!is_array($neighborhoodData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $neighborhoodValues = [];

        foreach ($neighborhoodData as $k => $v) {
            $neighborhoodValues[$k] = trim($v);
        }
        $name = $neighborhoodValues['name'];
        $cityId = $neighborhoodValues['city_id'];

        if (strlen($name) < 2 || !isset($neighborhoodValues['city_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $key = Helper::getNewTableKey('neighborhoods', 5);
        $row = new Neighborhood;
        $row->key = $key;
        $row->name = $name;
        $row->city_id = $cityId;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.neighborhoods.add',
            'models' => [
                [
                    'referenced_model' => 'Neighborhood',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Neighborhood.name'),
                            'new_value' => $name
                        ],
                        [
                            'field_name' => 'city_id',
                            'display_field_name' => config('history.Neighborhood.city_id'),
                            'new_numeric_value' => $cityId
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

     
	/*
		Function that returns all clusters of city in current elections campaign ,  by cityKey
	*/
    public function getCityClusters($key = null) {
        $jsonOutput = app()->make("JsonOutput");
		
        if(!$key){
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
        $result = City::select('clusters.id', 'clusters.key', 'clusters.name','clusters.prefix', 'clusters.neighborhood_id')
                      ->withClusters(true)
                      ->where(['cities.key' => $key, 'election_campaign_id' => $currentCampaignId])
                      ->whereNull('clusters.neighborhood_id')
                      ->get();

        $jsonOutput->setData($result);
    }


	/*
		Function that returns all clusters in  neighborhood  by neighborhoodKey
	*/
    public function getNeighborhoodClusters($key = null) {

        $jsonOutput = app()->make("JsonOutput");
		$currentCampaignId = ElectionCampaigns::currentCampaign()['id'];
        $result = [];

        if ($key) {

            $item = Neighborhood::select('id')->where('key', $key)->first();
            if ($item) {
                $result = Cluster::select('id', 'key', 'name', 'prefix')->where('neighborhood_id', $item['id'])->where('election_campaign_id',$currentCampaignId)->get();
            }
        } else {
            $result = Cluster::select('id', 'key', 'name' ,'prefix')->whereNull('neighborhood_id')->where('election_campaign_id',$currentCampaignId)->get();
        }
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes neighborhood_id of specific cluster by setting it to NULL
	*/
    public function deleteNeighborhoodCluster($neighborhoodKey, $clusterKey) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$clusterKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = Cluster::select('id')->where('key', $clusterKey)->first();
        $neighborhood = Neighborhood::select('id')->where('key', $neighborhoodKey)->first();

        if (!$item || !$neighborhood) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = $item['id'];

        Cluster::where('key', $clusterKey)
            ->where('neighborhood_id', $neighborhood['id'])
            ->update(['neighborhood_id' => NULL]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.neighborhoods.delete',
            'models' => [
                [
                    'referenced_model' => 'Cluster',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $item->id,
                    'valuesList' => [
                        [
                            'field_name' => 'neighborhood_id',
                            'display_field_name' => config('history.Cluster.neighborhood_id'),
                            'old_numeric_value' => $neighborhood->id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that gets clusterKeyList from POST params  , and deletes neighborhood_id
		of this clusters - sets this field to NULL
	*/
    public function deleteNeighborhoodClusterList(Request $request, $neighborhoodKey) {
        $jsonOutput = app()->make("JsonOutput");

        $clusterKeyList = $request->input('cluster_key_list');
        if (!$neighborhoodKey || count($clusterKeyList)==0) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $clusterList = Cluster::select('id')->whereIn('key', $clusterKeyList)->get();
        $neighborhood = Neighborhood::select('id')->where('key', $neighborhoodKey)->first();
        // dd($clusterList->toArray(),$neighborhood->toArray());

        if (count($clusterList)==0 || !$neighborhood) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        Cluster::whereIn('key', $clusterKeyList)
            ->where('neighborhood_id', $neighborhood['id'])
            ->update(['neighborhood_id' => NULL]);
        $historyModels = [];
        foreach($clusterList as $item){
            $historyModels[] = [
                'referenced_model' => 'Cluster',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $item->id,
                'valuesList' => [
                    [
                        'field_name' => 'neighborhood_id',
                        'display_field_name' => config('history.Cluster.neighborhood_id'),
                        'old_numeric_value' => $neighborhood->id
                    ]
                ]
            ];
        }
        if(count($historyModels) > 0){
            $historyArgsArr = [
                'topicName' => 'system.lists.general.neighborhoods.delete',
                'models' =>$historyModels
            ];
            ActionController::AddHistoryItem($historyArgsArr);
            
        }
        $jsonOutput->setData('');
    }
    
	/*
		Function that updates neighborhood_id of specific cluster  
	*/
	public function updateNeighborhoodCluster(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $clusterKey = trim($request->input('clusterKey'), FALSE);

        if (!$key || !$clusterKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $neighborhood = Neighborhood::select('id')->where('key', $key)->first();

        if (!$neighborhood) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }
        $item = Cluster::select('id', 'neighborhood_id')->where('key', $clusterKey)->first();

        if ( $item->neighborhood_id != $neighborhood->id ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.neighborhoods.edit',
                'models' => [
                    [
                        'referenced_model' => 'Cluster',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'neighborhood_id',
                                'display_field_name' => config('history.Cluster.neighborhood_id'),
                                'old_numeric_value' => $item->neighborhood_id,
                                'new_numeric_value' => $neighborhood->id
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        Cluster::where('key', $clusterKey)->update(['neighborhood_id' => $neighborhood->id]);

        $jsonOutput->setData('');
    }
    
	/*
		Function that gets neighborhoodKey and clusterKeyList from POST params  , and updates neighborhood_id
		for this clusters  
	*/
	public function updateNeighborhoodClusterList(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $clusterKeyList = $request->input('cluster_key_list');

        if (!$key || count($clusterKeyList)==0) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $neighborhood = Neighborhood::select('id')->where('key', $key)->first();
        if (!$neighborhood) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }
        $clusterList = Cluster::select('id', 'neighborhood_id')->whereIn('key', $clusterKeyList)->get();

        $historyModels=[];
        foreach($clusterList as $item){
            // dump($item->toArray(),$neighborhood->id);
            if ( $item->neighborhood_id != $neighborhood->id ) {
                
                $historyModel = [
                    'referenced_model' => 'Cluster',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $item->id,
                    'valuesList' => [
                        [
                            'field_name' => 'neighborhood_id',
                            'display_field_name' => config('history.Cluster.neighborhood_id'),
                            'old_numeric_value' => $item->neighborhood_id,
                            'new_numeric_value' => $neighborhood->id
                        ]
                    ]
                ];
                $item->neighborhood_id = $neighborhood->id;
                $item->save();
            }
        }

        if(count($historyModels)>0){
            $historyArgsArr = [
                'topicName' => 'system.lists.general.neighborhoods.edit',
                'models' =>$historyModels
            ];
            ActionController::AddHistoryItem($historyArgsArr);
            
        }
        $jsonOutput->setData($clusterList);
    }

	/*
		Function that performs bulk update of prefixes inside clustersList
	*/
    public function updatePrefixClusterList(Request $request, $key){
        $jsonOutput = app()->make("JsonOutput");

        $cityKey = $request->input('city_key',null);
        $clusterKeyList = $request->input('cluster_key_list',null);
        $updatePrefixMethod = $request->input('update_prefix_method',null);
        $newPrefix = $request->input('new_prefix',null);


        switch($updatePrefixMethod){
            case 'cluster_key_list':
            $clusterList = Cluster::select('clusters.id as cluster_id', 'clusters.prefix')->whereIn('key', $clusterKeyList);
            if($key != 'null'){
                $neighborhood = Neighborhood::select('id')->where('key', $key)->first();
                $clusterList->where('clusters.neighborhood_id', $neighborhood->id);
            }else{
                $clusterList->whereNull('clusters.neighborhood_id');
            }
            $clusterList = $clusterList->get();
            // $clusterList = Cluster::select('id')->where('neighborhood_id',$neighborhood->id)->get(); //For clusters by neighborhood id
            if (!count($clusterList)) {
                $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
                return;
            }  
            $this->updateClustersPrefix($clusterList,$updatePrefixMethod, $newPrefix);
                break;
            case 'update_by_neighborhood_and_city':
                $city = City::select('id')->where('key', $cityKey)->first();
                if (!$city) {$jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID')); return;}  

                $clusterList = Cluster::select('cities.name as city_name','neighborhoods.name as neighborhood_name','clusters.prefix','clusters.id as cluster_id')
                ->withCity()->withNeighborhood(true)->where('clusters.city_id', $city->id)->get();
                // dd($clusterList->toArray());
                $this->updateClustersPrefix($clusterList, $updatePrefixMethod);
                break;
            case 'update_by_neighborhood_only':
                $city = City::select('id')->where('key', $cityKey)->first();
                if (!$city) {$jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID')); return;}  

                $clusterList = Cluster::select('neighborhoods.name as neighborhood_name','clusters.prefix','clusters.id as cluster_id')
                ->withNeighborhood()->withCity()->where('clusters.city_id', $city->id)->where('clusters.neighborhood_id','!=',null)->get();
                // dd($clusterList->toArray());

                $this->updateClustersPrefix($clusterList, $updatePrefixMethod);
                break;
            case 'reset_all_city_prefix':
                $city = City::select('id')->where('key', $cityKey)->first();
                if (!$city) {$jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID')); return;}  

                $clusterList = Cluster::select('clusters.prefix','clusters.id as cluster_id')->where('clusters.city_id', $city->id)->get();
 
                $this->updateClustersPrefix($clusterList, $updatePrefixMethod, '');
                break;
        }



        $jsonOutput->setData('');
        }

	/*
		Private helpful function that performs update of single prefix of cluster by params
	*/
    private function updateClustersPrefix($clusterList, $updatePrefixMethod, $newPrefix = ''){
            $historyModels = [];
            foreach($clusterList as $item){
                $newItemPrefix = $this->getNewItemPrefix($item, $updatePrefixMethod, $newPrefix);
                if ( $item->prefix !== $newItemPrefix ) {
                    
                    $historyModel = [
                        'referenced_model' => 'Cluster',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'prefix',
                                'display_field_name' => config('history.Cluster.prefix'),
                                'old_value' => $item->prefix,
                                'new_value' => $newItemPrefix
                            ]
                        ]
                    ];
                    Cluster::where('id', $item->cluster_id)->update(['prefix'=>$newItemPrefix]);
                }
            }

            if(count($historyModels)>0){
                $historyArgsArr = [
                    'topicName' => 'system.lists.general.neighborhoods.edit', //Or system.lists.general.clusters.edit?
                    'models' => $historyModels
                ];
                ActionController::AddHistoryItem($historyArgsArr);
            }
        }
    /*
		Private helpful function that  generates dynamicly prefix per cluster by params
	*/
	private function getNewItemPrefix($item, $updatePrefixMethod, $newPrefix = ''){
            $newItemPrefix = '';
            switch($updatePrefixMethod){
                case 'cluster_key_list':
                case 'reset_all_city_prefix':
                    $newItemPrefix = $newPrefix;
                    break;
                case 'update_by_neighborhood_and_city':
                    if($item->neighborhood_name){
                        $newItemPrefix = $item->neighborhood_name;
                    }else if($item->city_name){
                        $newItemPrefix = $item->city_name;

                    }
                    break;
                case 'update_by_neighborhood_only':
                    if($item->neighborhood_name){
                        $newItemPrefix = $item->neighborhood_name;
                    }
                    break;
            } 
            // dump($item->neighborhood_name,$newItemPrefix,$updatePrefixMethod);
            return $newItemPrefix;
        }
    
	/*
		Function that updates cluster by clusterKey and POST params
	*/
	public function updateCluster(Request $request, $key, $clusterKey){
        $jsonOutput = app()->make("JsonOutput");
        // $cluster_name = $request->input('name',null);  
        // $cluster_prefix = $request->input('prefix',null);  

        if ( !$clusterKey) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $cluster = Cluster::select('clusters.name','clusters.prefix','clusters.id')
        ->where('clusters.key', $clusterKey)->first();
        
        if($key){
            $cluster->withNeighborhood()->where('neighborhoods.key',  $key);
        }else{
            $cluster->where('clusters.neighborhood_id',  null);
        }

        if(!$cluster){
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;   
        }
        $historyModels = [];
        $valueList = [];
        $updateList = [];
        $detailsList = ['name','prefix'];
        foreach($detailsList as $detail){
            $newValue = $request->input($detail,null);
            if($cluster->$detail != $newValue){
                $valueList[] = [
                        'field_name' => $detail,
                        'display_field_name' => config('history.Cluster.' . $detail),
                        'old_value' => $cluster->$detail,
                        'new_value' => $newValue
                ];
            }
            $updateList[$detail]=$newValue;
        }

        if(count($valueList) > 0){
            $historyArgsArr = [
                'topicName' => 'system.lists.general.neighborhoods.edit', //Or system.lists.general.clusters.edit???
                'models' =>[
                    [
                    'referenced_model' => 'Cluster',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $cluster->id,
                    'valuesList' => $valueList 
                ]
                ]
            ];
            // dd($historyArgsArr,$cluster->prefix);
            ActionController::AddHistoryItem($historyArgsArr);

            Cluster::where('id', $cluster->id)->update($updateList);
        }


        $jsonOutput->setData($cluster);
    }
   

	/*
		Function that returns all streets list , or specific street by streetKey
	*/
    public function getStreets(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $streetKey = trim($key);
            $result = Streets::select('id', 'key', 'name', 'city_id', 'mi_id')->where('key', $streetKey)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $result = Streets::select('id', 'key', 'name', 'city_id', 'mi_id')->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that deletes existing street by streetKey and POST params
	*/
    public function deleteStreet(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $item = Streets::select('id', 'name')->where('key', $key)->first();
        $itemId = $item['id'];

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = Voters::select('voters.id')->withFilters()->where('mi_street', $itemId)->first() ||
                Cluster::select('id')->where('street_id', $itemId)->first() ||
                \App\Models\TempVoter::select('id')->where('street', $item['name'])->first() ||
                \App\Models\User::select('id')->where('work_street', $item['name'])->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        Streets::where('key', $key)->update(['deleted' => 1]);
        $item = Streets::select('id')->where('key', $key)->first();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.streets.delete',
            'models' => [
                [
                    'referenced_model' => 'Streets',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing street by streetKey and POST params
	*/
    public function updateStreet(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $streetData = $request->input('item');

        if (!is_array($streetData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        $name = trim($streetData['name']);
        $miId = trim($streetData['mi_id']);

        if (strlen($name) < 2 || !isset($streetData['mi_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = Streets::select('id', 'name', 'mi_id')->where('key', $key)->first();
        $changedValues = [];

        if ($item->name != $name) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.Streets.name'),
                'old_value' => $item->name,
                'new_value' => $name
            ];
        }

        if ($item->mi_id != $miId) {
            $changedValues[] = [
                'field_name' => 'mi_id',
                'display_field_name' => config('history.Streets.mi_id'),
                'old_numeric_value' => $item->mi_id,
                'new_numeric_value' => $miId
            ];
        }

        if ( count($changedValues) > 0 ) {
            $row = Streets::where('key', $key)->first();
            $row->name = $name;
            $row->mi_id = $miId ? $miId : NULL;
            $row->save();

            $historyArgsArr = [
                'topicName' => 'system.lists.general.streets.edit',
                'models' => [
                    [
                        'referenced_model' => 'Streets',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $row->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);

            $jsonOutput->setData('');
        }
    }

	/*
		Function that adds new street by  POST params
	*/
    public function addStreet(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $streetData = $request->input('item');

        if (!is_array($streetData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $key = Helper::getNewTableKey('streets', 5);
        $streetValues = [];

        foreach ($streetData as $k => $v) {
            $streetValues[$k] = trim($v);
        }

        $name = $streetValues['name'];
        $cityId = $streetValues['city_id'];
        $miId = $streetValues['mi_id'] ? $streetValues['mi_id'] : NULL;

        if (strlen($name) < 2 || !isset($streetValues['city_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $row = new Streets;
        $row->key = $key;
        $row->name = $name;
        $row->city_id = $cityId;
        $row->mi_id = $miId;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.streets.add',
            'models' => [
                [
                    'referenced_model' => 'Streets',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Streets.name'),
                            'new_value' => $name
                        ],
                        [
                            'field_name' => 'city_id',
                            'display_field_name' => config('history.Streets.city_id'),
                            'new_numeric_value' => $cityId
                        ],
                        [
                            'field_name' => 'mi_id',
                            'display_field_name' => config('history.Streets.mi_id'),
                            'new_numeric_value' => $miId
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* PhoneTypes */

	/*
		Function that returns all phone types list  
	*/
    public function getPhoneTypes(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = PhoneTypes::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes existing phoneType by phoneTypeKey
	*/
    public function deletePhoneType(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = PhoneTypes::select('id', 'system_name')->where('key', $key)->first();
        $itemId = $item->id;
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\VoterPhone::select('id')->where('phone_type_id', $itemId)->first() ||
                \App\Models\UserPhones::select('id')->where('phone_type_id', $itemId)->first();

        if ($item->system_name || $isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        PhoneTypes::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.phone_types.delete',
            'models' => [
                [
                    'referenced_model' => 'PhoneTypes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($itemId);
    }

	/*
		Function that updates existing phoneType by phoneTypeKey and POST params
	*/
    public function updatePhoneType(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = PhoneTypes::select('id', 'name')->where('key', $key)->first();
        PhoneTypes::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.phone_types.edit',
                'models' => [
                    [
                        'referenced_model' => 'PhoneTypes',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.PhoneTypes.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new phoneType by POST params
	*/
    public function addPhoneType(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('phone_types', 5);
        $row = new PhoneTypes;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.phone_types.add',
            'models' => [
                [
                    'referenced_model' => 'PhoneTypes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.PhoneTypes.name'),
                            'new_value' => $name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* VoterTitles */

	/*
		Function that returns all voter titles list  
	*/
    public function getVoterTitles() {

        $jsonOutput = app()->make("JsonOutput");
        $result = VoterTitle::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes existing voterTitle by voterTitleKey
	*/
    public function deleteVoterTitle(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = VoterTitle::select('id')->where('key', $key)->first()->id;
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = Voters::select('voters.id')->withFilters()->where('voter_title_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        VoterTitle::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_titles.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterTitle',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing voterTitle by voterTitleKey and POST params
	*/
    public function updateVoterTitle(Request $request, $key) {

        $name = trim($request->input('name'));
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = VoterTitle::select('id', 'name')->where('key', $key)->first();

        VoterTitle::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.voter_titles.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterTitle',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.VoterTitle.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new voterTitle by POST params
	*/
    public function addVoterTitle(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('voter_titles', 5);
        $VoterTitle = new VoterTitle;
        $VoterTitle->key = $key;
        $VoterTitle->name = $name;
        $VoterTitle->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_titles.add',
            'models' => [
                [
                    'referenced_model' => 'VoterTitle',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $VoterTitle->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.VoterTitle.name'),
                            'new_value' => $VoterTitle->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* VoterEndings */

	/*
		Function that returns all voter endings list  
	*/
    public function getVoterEndings() {

        $jsonOutput = app()->make("JsonOutput");
        $result = VoterEndings::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes existing voterEnding by voterEndingKey
	*/
    public function deleteVoterEnding(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = VoterEndings::select('id')->where('key', $key)->first()->id;
        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = Voters::select('voters.id')->withFilters()->where('voter_ending_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        VoterEndings::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_endings.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterEndings',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing voterEnding by voterEndingKey and POST params
	*/
    public function updateVoterEnding(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = VoterEndings::select('id', 'name')->where('key', $key)->first();
        VoterEndings::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.voter_endings.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterEndings',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.VoterEndings.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new voterEnding by POST params
	*/
    public function addVoterEnding(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('voter_endings', 5);
        $VoterEnding = new VoterEndings;
        $VoterEnding->key = $key;
        $VoterEnding->name = $name;
        $VoterEnding->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_endings.add',
            'models' => [
                [
                    'referenced_model' => 'VoterEndings',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $VoterEnding->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.VoterEndings.name'),
                            'new_value' => $VoterEnding->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Voter Support Status */

	/*
		Function that returns all support statuses list  
	*/
    public function getSupportStatus() {

        $jsonOutput = app()->make("JsonOutput");
        $result = SupportStatus::select('id', 'key', 'name', 'level')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes support-statuse by supportStatusKey, only if it's not in use !
	*/
    public function deleteSupportStatus(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = SupportStatus::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = \App\Models\VoterSupportStatus::select('id')->where('support_status_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        SupportStatus::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.support_status.delete',
            'models' => [
                [
                    'referenced_model' => 'SupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing supportStatus by supportStatusKey and POST params
	*/
    public function updateSupportStatus(Request $request, $key) {

        $name = trim($request->input('name'));
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = SupportStatus::select('id', 'name')->where('key', $key)->first();
        SupportStatus::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.support_status.edit',
                'models' => [
                    [
                        'referenced_model' => 'SupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.SupportStatus.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that add new support status by POST params
	*/
    public function addSupportStatus(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('support_status', 3, 1);
        $levelsCount = SupportStatus::count();
        $supportStatus = new SupportStatus;
        $supportStatus->key = $key;
        $supportStatus->name = $name;
        $supportStatus->level = $levelsCount + 1;
        $supportStatus->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.support_status.add',
            'models' => [
                [
                    'referenced_model' => 'SupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $supportStatus->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.SupportStatus.name'),
                            'new_value' => $supportStatus->name
                        ],
                        [
                            'field_name' => 'level',
                            'display_field_name' => config('history.SupportStatus.level'),
                            'new_numeric_value' => $supportStatus->level
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates orders of list of support statuses   by POST params
	*/
    public function updateSupportStatusOrder(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $statusData = $request->input('list');
        $isError = FALSE;
        $statusKeys = [];

        if (!is_array($statusData)) {
            $isError = TRUE;
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
        }

        if (!$isError) {
            //check order validation
            usort($statusData, function($a, $b) {
                return strcmp($a['level'], $b['level']);
            });

            $orderIndex = 1;
            foreach ($statusData as $item) {
                $statusKeys[] = trim($item['key']);
                $order = trim($item['level']);

                if ($order != $orderIndex) {
                    $isError = TRUE;
                    $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_ORDER_IS_NOT_VALID'));
                    break;
                }
                $orderIndex++;
            }
        }

        if (!$isError) {
            //check if all the keys exist in the db.
            $itemsCount = SupportStatus::whereIn('key', $statusKeys)->count();

            if (count($statusKeys) != $itemsCount) {
                $isError = TRUE;
                $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            }
        }

        if (!$isError) {
            foreach ($statusData as $item) {
                $key = trim($item['key']);
                $order = trim($item['level']);

                $itemRow = SupportStatus::select('id', 'level')->where('key', $key)->first();

                $row = SupportStatus::where('key', $key)->first();
                $row->level = $order;
                $row->save();

                if ( $row->level != $itemRow->level ) {
                    $historyArgsArr = [
                        'topicName' => 'system.lists.elections.support_status.edit',
                        'models' => [
                            [
                                'referenced_model' => 'SupportStatus',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $itemRow->id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'level',
                                        'display_field_name' => config('history.SupportStatus.level'),
                                        'old_value' => $itemRow->level,
                                        'new_value' => $row->level
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }

            $jsonOutput->setData('');
        }
    }

    /*  Action Types */

	/*
		Function that returns all actionTypes by entity_type that is determined by route path
	*/
    public function getActionTypes(Request $request) {
        $routeName = Route::currentRouteName();
        $entityType = (strpos($routeName, 'system.lists.elections.action_types') === false ? config('constants.ENTITY_TYPE_REQUEST') : config('constants.ENTITY_TYPE_VOTER'));
        $jsonOutput = app()->make("JsonOutput");
        $results = ActionType::select('id', 'key', 'name', 'system_name')->where('deleted', 0)->where('entity_type', $entityType)->get();
        $jsonOutput->setData($results);
    }

	/*
		Function that deletes actionType by key, only if it's not in use 
	*/
    public function deleteActionType(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $routeName = Route::currentRouteName();

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = ActionType::select('id', 'system_name')->where('key', $key)->first();

        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if ($item['system_name']!=NULL) {
            $jsonOutput->setErrorCode(config('errors.system.CANT_DELETE_SYSTEM_CONFIGURATION'));
            return;
        }

        $isItemInUse = ActionTopic::select('id')->where(['action_type_id'=> $item['id'],'deleted'=>0])->first() ||
                \App\Models\Action::select('id')->where(['action_type'=> $item['id'],'deleted'=>0])->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        ActionType::where('key', $key)->update(['deleted' => 1]);
        $item = ActionType::select('id')->where('key', $key)->first();

        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => [
                [
                    'referenced_model' => 'ActionType',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates actionType by key and POST params
	*/
    public function updateActionType(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $routeName = Route::currentRouteName();
        $item = ActionType::select('id', 'name', 'system_name')->where('key', $key)->first();

        if ($item['system_name']!=NULL) {
            $jsonOutput->setErrorCode(config('errors.system.CANT_EDIT_SYSTEM_CONFIGURATION'));
            return;
        }

        ActionType::where('key', $key)->update(['name' => $name]);

        if ( !$name != $item->name ) {
            $historyArgsArr = [
                'topicName' => $routeName,
                'models' => [
                    [
                        'referenced_model' => 'ActionType',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.ActionType.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new actionType py POST params
	*/
    public function addActionType(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $routeName = Route::currentRouteName();
        $entityType = (strpos($routeName, 'system.lists.elections.action_types') === false ? config('constants.ENTITY_TYPE_REQUEST') : config('constants.ENTITY_TYPE_VOTER'));
        $key = Helper::getNewTableKey('action_types', 7);

        $row = new ActionType;
        $row->key = $key;
        $row->name = $name;
        $row->entity_type = $entityType;
        $row->save();

        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => [
                [
                    'referenced_model' => 'ActionType',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ActionType.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'entity_type',
                            'display_field_name' => config('history.ActionType.entity_type'),
                            'new_value' => ($row->entity_type == config('constants.ENTITY_TYPE_VOTER')) ? 'עבור תושב' : 'עבור פניה',
                            'new_numeric_value' => $row->entity_type
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /*  Action Topic */

	/*
		Function that returns all actionTopics , or actionsTopics by actionType key
	*/
    public function getActionTopics(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $parentKey = trim($key);
            $id = ActionType::select('id')->where('key', $parentKey)->first()['id'];
            $result = ActionTopic::select('id', 'key', 'name', 'active', 'system_name')->where('action_type_id', $id)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $requestTopics = ActionTopic::select('id', 'key', 'name', 'active', 'action_type_id', 'system_name')->where('deleted', 0)->get();
            $jsonOutput->setData($requestTopics);
        }
    }

	/*
		Function that deletes actionTopic by key, only if it's not in use 
	*/
    public function deleteActionTopic(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = ActionTopic::select('id','system_name')->where('key', $key)->first();

        if (!$item['id']) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if ($item['system_name'] !=NULL) {
            $jsonOutput->setErrorCode(config('errors.system.CANT_DELETE_SYSTEM_CONFIGURATION'));
            return;
        }

        $isItemInUse = Action::select('id')->where('action_topic_id', $item['id'])->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        ActionTopic::where('key', $key)->update(['deleted' => 1]);

        $routeName = Route::currentRouteName();

        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => [
                [
                    'referenced_model' => 'ActionTopic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates actionTopic by key and POST params
	*/
    public function updateActionTopic(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $topicData = $request->input('item');
        $topicValues = [];

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (!is_array($topicData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        foreach ($topicData as $k => $v) {
            $topicValues[$k] = trim($v);
        }

        if (strlen($topicValues['name']) < 2 || !isset($topicValues['active'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = ActionTopic::select('id', 'name', 'active', 'system_name')->where('key', $key)->first();

        if ($item['system_name'] != NULL) {
            $jsonOutput->setErrorCode(config('errors.system.CANT_EDIT_SYSTEM_CONFIGURATION'));
            return;
        }

        $name = $topicValues['name'];
        $active = $topicValues['active'] ? '1' : '0';
        $routeName = Route::currentRouteName();

        $topic = ActionTopic::where('key', $key)->first();
        $topic->name = $name;
        $topic->active = $active;
        $topic->save();

        $changedValues = [];

        if ( $topic->name != $item->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.ActionTopic.name'),
                'old_value' => $item->name,
                'new_value' => $topic->name
            ];
        }

        if ( $topic->active != $item->active ) {
            $changedValues[] = [
                'field_name' => 'active',
                'display_field_name' => config('history.ActionTopic.active'),
                'old_numeric_value' => $item->active,
                'new_numeric_value' => $topic->active
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => $routeName,
                'models' => [
                    [
                        'referenced_model' => 'ActionTopic',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new actionTopic py POST params
	*/
    public function addActionTopic(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $topicData = $request->input('item');
        $topicValues = [];

        if (!is_array($topicData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($topicData as $k => $v) {
            $topicValues[$k] = trim($v);
        }
        $name = $topicValues['name'];

        if (strlen($name) < 2 || !isset($topicValues['actionTypeId']) || !isset($topicValues['active'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('action_topics', 10);
        $actionTypeId = $topicValues['actionTypeId'];
        $active = $topicValues['active'] ? '1' : '0';

        $topic = new ActionTopic;
        $topic->key = $key;
        $topic->name = $name;
        $topic->action_type_id = $actionTypeId;
        $topic->active = $active;
        $topic->save();

        $routeName = Route::currentRouteName();

        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => [
                [
                    'referenced_model' => 'ActionTopic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $topic->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ActionTopic.name'),
                            'new_value' => $topic->name
                        ],
                        [
                            'field_name' => 'action_type_id',
                            'display_field_name' => config('history.ActionTopic.action_type_id'),
                            'new_numeric_value' => $topic->action_type_id
                        ],
                        [
                            'field_name' => 'active',
                            'display_field_name' => config('history.ActionTopic.active'),
                            'new_numeric_value' => $topic->active
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Voter Meta Keys */

	/*
		Function that returns list of all not-protected VoterMetaKeys
	*/
    public function getVoterMetaKeys() {

        $jsonOutput = app()->make("JsonOutput");
        $results = VoterMetaKeys::select('id', 'key', 'key_type', 'key_name', 'per_campaign', 'max')
                        ->where('deleted', 0)->where('protected', config('constants.VOTER_META_KEY_NOT_PROTECTED'))->get();
        $jsonOutput->setData($results);
    }

	/*
		Function that deletes voterMetaKey by key, only if it's not in use 
	*/
    public function deleteVoterMetaKey(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = VoterMetaKeys::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = VoterMetas::select('id')->where(['voter_meta_key_id'=> $itemId])->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        VoterMetaKeys::where('key', $key)->update(['deleted' => 1]);

        $deletedVoterMetaValues = $this->deleteKeyValues($key);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.metas.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterMetaKeys',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        for ( $metaValueIndex = 0; $metaValueIndex < count($deletedVoterMetaValues); $metaValueIndex++ ) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'VoterMetaValues',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $deletedVoterMetaValues[$metaValueIndex]->id
            ];
        }

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Private helpful function that constructs historyObject for updading voterMetaKey
	*/
    private function getUpdateVoterMetaKeyModel($item, $topic) {
        $fields = ['key_name', 'key_type', 'per_campaign', 'max'];

        $changedValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
            $fieldName = $fields[$fieldIndex];

            $oldValue = null;
            $newValue = null;

            if ( $topic->{$fieldName} != $item->{$fieldName} ) {
                switch ( $fieldName ) {
                    case 'key_name':
                        $changedValues[] = [
                            'field_name' => 'key_name',
                            'display_field_name' => config('history.VoterMetaKeys.key_name'),
                            'old_value' => $item->key_name,
                            'new_value' => $topic->key_name
                        ];
                        break;

                    case 'key_type':
                        switch ($item->key_type) {
                            case config('constants.VOTER_META_KEY_TYPE_WITH_VALUES'):
                                $oldValue = 'רשימת ערכים סגורה';
                                break;

                            case config('constants.VOTER_META_KEY_TYPE_FREE_TEXT'):
                                $oldValue = 'נתון עם ערך חופשי';
                                break;

                            case config('constants.VOTER_META_KEY_TYPE_NUMBER'):
                                $oldValue = 'נתון עם ערך מספרי';
                                break;
                        }

                        switch ($topic->key_type) {
                            case config('constants.VOTER_META_KEY_TYPE_WITH_VALUES'):
                                $newValue = 'רשימת ערכים סגורה';
                                break;

                            case config('constants.VOTER_META_KEY_TYPE_FREE_TEXT'):
                                $newValue = 'נתון עם ערך חופשי';
                                break;

                            case config('constants.VOTER_META_KEY_TYPE_NUMBER'):
                                $newValue = 'נתון עם ערך מספרי';
                                break;
                        }

                        $changedValues[] = [
                            'field_name' => 'key_type',
                            'display_field_name' => config('history.VoterMetaKeys.key_type'),
                            'old_value' => $oldValue,
                            'new_value' => $newValue,
                            'old_numeric_value' => $item->key_type,
                            'new_numeric_value' => $topic->key_type
                        ];
                        break;

                    case 'max':
                        if ( $topic->key_type != config('constants.VOTER_META_KEY_TYPE_WITH_VALUES') ) {
                            $changedValues[] = [
                                'field_name' => 'max',
                                'display_field_name' => config('history.VoterMetaKeys.max.' . $topic->key_type),
                                'old_numeric_value' => $item->max,
                                'new_numeric_value' => $topic->max
                            ];
                        }
                        break;

                    case 'per_campaign':
                    default:
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.VoterMetaKeys.' . $fieldName),
                            'old_numeric_value' => $item->{$fieldName},
                            'new_numeric_value' => $topic->{$fieldName}
                        ];
                        break;
                }
            }
        }

        return $changedValues;
    }

	/*
		Function that updates voterMetaKey by key and POST params 
	*/
    public function updateVoterMetaKey(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $metaData = $request->input('metaKey');
        $metaValues = [];

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if (!is_array($metaData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        foreach ($metaData as $k => $v) {
            $metaValues[$k] = trim($v);
        }
        $name = $metaValues['key_name'];

        if (strlen($name) < 2 || !isset($metaValues['key_type']) || !isset($metaValues['per_campaign'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $key_type = config('constants.VOTER_META_KEY_TYPE_WITH_VALUES');

        if ($metaValues['key_type'] == config('constants.VOTER_META_KEY_TYPE_FREE_TEXT')) {
            $key_type = config('constants.VOTER_META_KEY_TYPE_FREE_TEXT');
        }

        if ($metaValues['key_type'] == config('constants.VOTER_META_KEY_TYPE_NUMBER')) {
            $key_type = config('constants.VOTER_META_KEY_TYPE_NUMBER');
        }

        $item = VoterMetaKeys::select('id', 'key_name', 'key_type', 'per_campaign', 'max')->where('key', $key)->first();

        if ( $key_type != $item->key_type ) {
            $isItemInUse = VoterMetas::select('id')->where(['voter_meta_key_id'=> $item->id])->first();

            if ($isItemInUse) {
                $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
                return;
            }
        }

        $per_campaign = $metaValues['per_campaign'] ? config('constants.VOTER_META_KEY_PER_CAMPAIGN') : config('constants.VOTER_META_KEY_PER_VOTER');
        $max = intval($metaValues['max']);

        $topic = VoterMetaKeys::where('key', $key)->first();
        $topic->key_name = $name;
        $topic->key_type = $key_type;
        $topic->per_campaign = $per_campaign;

        if ( $key_type == config('constants.VOTER_META_KEY_TYPE_WITH_VALUES') ) {
            $topic->max = null;
        } else {
            $topic->max = $max;
        }
        $topic->save();

        $changedValues = $this->getUpdateVoterMetaKeyModel($item, $topic);

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.metas.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterMetaKeys',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            if ($key_type == config('constants.VOTER_META_KEY_TYPE_FREE_TEXT') ||
                $key_type == config('constants.VOTER_META_KEY_TYPE_NUMBER')) {
                $deletedVoterMetaValues = $this->deleteKeyValues($key);

                for ( $metaValueIndex = 0; $metaValueIndex < count($deletedVoterMetaValues); $metaValueIndex++ ) {
                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'VoterMetaValues',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                        'referenced_id' => $deletedVoterMetaValues[$metaValueIndex]->id
                    ];
                }
            }

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new voterMetaKey by POST params
	*/
    public function addVoterMetaKey(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('voter_meta_keys', 5);
        $row = new VoterMetaKeys;
        $row->key = $key;
        $row->key_name = $name;
        $row->key_type = config('constants.VOTER_META_KEY_TYPE_WITH_VALUES');
        $row->per_campaign = config('constants.VOTER_META_KEY_PER_VOTER');
        $row->protected = config('constants.VOTER_META_KEY_NOT_PROTECTED');
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.metas.add',
            'models' => [
                [
                    'referenced_model' => 'VoterMetaKeys',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'key_name',
                            'display_field_name' => config('history.VoterMetaKeys.key_name'),
                            'new_value' => $row->key_name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that gets as parameter voterMetaKey , and returns whether it's in use
	*/
    public function isKeyValuesInUse($id) {
        $voterValues = VoterMetaValues::select('id')->where(['voter_meta_key_id'=> $id, 'key_type'=> 0, 'deleted'=>0])->get();
        $isItemInUse = VoterMetas::select('id')->whereIn('voter_meta_value_id', $voterValues)->count();
        return $isItemInUse ? TRUE : FALSE;
    }

	/*
		Function that gets voterMetaKey , and deletes all its metaValues
	*/
    public function deleteKeyValues($key) {
        $id = VoterMetaKeys::select('id')->where('key', $key)->first()['id'];

        $voterMetaValues = VoterMetaValues::select('id')
            ->where('voter_meta_key_id', $id)
            ->where('deleted', 0)
            ->get();

        VoterMetaValues::where('voter_meta_key_id', $id)->update(['deleted' => 1]);

        return $voterMetaValues;
    }

    /* Voter Meta Values */

	/*
		Function that returns list of all VoterMetaValues , or VoterMetaValues by voterMetaKey
	*/
    public function getVoterMetaValues(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $metaKey = trim($key);
            $id = VoterMetaKeys::select('id')->where('key', $metaKey)->first()['id'];
            $result = VoterMetaValues::select('key', 'value')->where('voter_meta_key_id', $id)->where('deleted', 0)->get();
            $jsonOutput->setData($result);
        } else {
            $metaValues = VoterMetaValues::select('key', 'voter_meta_key_id', 'value')->where('deleted', 0)->get();
            $jsonOutput->setData($metaValues);
        }
    }

	/*
		Function that deletes VoterMetaValue by its key, only if it's not in use 
	*/
    public function deleteVoterMetaValue(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = VoterMetaValues::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = VoterMetas::select('id')->where('voter_meta_value_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        VoterMetaValues::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.metas.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterMetaValues',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates VoterMetaValue by its key and POST params 
	*/
    public function updateVoterMetaValue(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        $value = trim($request->input('value'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($value) < 1) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = VoterMetaValues::select('id', 'value')->where('key', $key)->first();

        VoterMetaValues::where('key', $key)->update(['value' => $value]);

        if ( $value != $item->value ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.metas.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterMetaValues',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'value',
                                'display_field_name' => config('history.VoterMetaValues.value'),
                                'old_value' => $item->value,
                                'new_value' => $value
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }


        $jsonOutput->setData('');
    }

	/*
		Function that adds new VoterMetaValue by POST params
	*/
    public function addVoterMetaValue(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $metaData = $request->input('item');

        if (!is_array($metaData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }
        $metaValues = [];
        foreach ($metaData as $k => $v) {
            $metaValues[$k] = trim($v);
        }
        $value = $metaValues['value'];

        if (strlen($value) < 1 || !isset($metaValues['voterMetaKeyId'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('voter_meta_values', 5);
        $voterMetaKeyId = $metaValues['voterMetaKeyId'];

        $row = new VoterMetaValues;
        $row->key = $key;
        $row->value = $value;
        $row->voter_meta_key_id = $voterMetaKeyId;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.metas.add',
            'models' => [
                [
                    'referenced_model' => 'VoterMetaValues',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'voter_meta_key_id',
                            'display_field_name' => config('history.VoterMetaValues.voter_meta_key_id'),
                            'new_numeric_value' => $row->voter_meta_key_id
                        ],
                        [
                            'field_name' => 'value',
                            'display_field_name' => config('history.VoterMetaValues.value'),
                            'new_value' => $row->value
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);


        $jsonOutput->setData('');
    }

    /* Voter Election Roles */

	
	/*
		Function that returns list of all ElectionRoles list
	*/
    public function getVoterElectionRoles(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = ElectionRoles::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }


    /* UserRoles */

	/*
		Function that returns list of all UserRoles list  
	*/
    public function getUserRoles(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        $result = UserRoles::select('user_roles.key',
                                    'user_roles.module_id',
                                    'user_roles.name AS role_name',
                                    'user_roles.system_name as role_system_name',
                                    'user_roles.team_leader',
                                    'modules.name AS module_name')
                        ->where('user_roles.deleted', 0)->withModules()->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes UserRole by its key, only if it's not in use 
	*/
    public function deleteUserRole(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $item = UserRoles::select('id', 'system_name')
                        ->where('key', $key)
                        ->where('deleted', 0)
                        ->first();
        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if ($item->system_name != null) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;            
        }

        $isItemInUse = \App\Models\RolesByUsers::select('id')
        ->where(['user_role_id' => $item->id,'deleted' => DB::raw(0)])->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        UserRoles::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.system.user_roles.delete',
            'models' => [
                [
                    'referenced_model' => 'UserRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' =>$item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates UserRole by its key and POST params 
	*/
    public function updateUserRole(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemData = $request->input('item');
        $itemValues = [];

        if (!is_array($itemData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($itemData as $key1 => $value) {
            $itemValues[$key1] = trim($value);
        }
        $name = $itemValues['role_name'];

        if (strlen($name) < 2 || !isset($itemValues['module_id'])  || !isset($itemValues['team_leader'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $modelId = $itemValues['module_id'];
        $isTeamLeader = $itemValues['team_leader'] ? '1' : '0';

        $existingRole = UserRoles::select('id')
                            ->where('module_id', $modelId)
                            ->where('name', $name)
                            ->where('key', '!=', $key)
                            ->where('deleted', 0)
                            ->first();
        if ($existingRole) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return; 
        }

        $item = UserRoles::select('id', 'name', 'module_id', 'team_leader')->where('key', $key)->first();

        $row = UserRoles::where('key', $key)->first();
        $row->name = $name;
        $row->module_id = $modelId;
        $row->team_leader = $isTeamLeader;
        $row->save();

        $userRoleFields = [
            'name',
            'module_id',
            'team_leader'
        ];

        $changedValues = [];
        for ($fieldIndex = 0; $fieldIndex < count($userRoleFields); $fieldIndex++) {
            $fieldName = $userRoleFields[$fieldIndex];

            if ( $row->{$fieldName} != $item->{$fieldName} ) {
                if ( 'name' == $fieldName ) {
                    $changedValues[] = [
                        'field_name' => 'name',
                        'display_field_name' => config('history.UserRoles.name'),
                        'old_value' => $item->name,
                        'new_value' => $row->name
                    ];
                } else {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.UserRoles.' . $fieldName),
                        'old_numeric_value' => $item->{$fieldName},
                        'new_numeric_value' => $row->{$fieldName}
                    ];
                }
            }
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.system.user_roles.edit',
                'models' => [
                    [
                        'referenced_model' => 'UserRoles',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new UserRole by POST params
	*/
    public function addUserRole(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $itemData = $request->input('item');

        if (!is_array($itemData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $key = Helper::getNewTableKey('user_roles', 5);
        $itemValues = [];

        foreach ($itemData as $k => $v) {
            $itemValues[$k] = trim($v);
        }
        $name = $itemValues['role_name'];

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $modelId = $itemValues['module_id'];
        $isTeamLeader = $itemValues['team_leader'] ? '1' : '0';

        $existingRole = UserRoles::select('id')
                            ->where('module_id', $modelId)
                            ->where('name', $name)
                            ->where('deleted', 0)
                            ->first();
        if ($existingRole) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return; 
        }

        $row = new UserRoles;
        $row->key = $key;
        $row->name = $name;
        $row->module_id = $modelId;
        $row->team_leader = $isTeamLeader;
        $row->save();

        $userRoleFields = [
            'name',
            'module_id',
            'team_leader'
        ];

        $insertFields = [];
        for ($fieldIndex = 0; $fieldIndex < count($userRoleFields); $fieldIndex++) {
            $fieldName = $userRoleFields[$fieldIndex];

            if ( 'name' == $fieldName ) {
                $insertFields[] = [
                    'field_name' => 'name',
                    'display_field_name' => config('history.UserRoles.name'),
                    'new_value' => $row->name
                ];
            } else {
                $insertFields[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.UserRoles.' . $fieldName),
                    'new_numeric_value' => $row->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.lists.system.user_roles.add',
            'models' => [
                [
                    'referenced_model' => 'UserRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => $insertFields
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* 
		Function that returns all Modules
	*/
    public function getModules() {

        $jsonOutput = app()->make("JsonOutput");
        $result = Modules::select('id', 'name')->get();
        $jsonOutput->setData($result);
    }

    /* 
		Function that returns all Permission groups 
	*/
    public function getPermissionGroups() {

        $jsonOutput = app()->make("JsonOutput");
        $result = PermissionGroup::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

    /* 
		Function that returns all Teams 
	*/
    public function getTeams() {

        $jsonOutput = app()->make("JsonOutput");
        $result = Teams::select('teams.id', 'teams.key', 'teams.name', 'teams.leader_id', 'voters.first_name AS leader_first_name', 'voters.last_name AS leader_last_name')
                        ->where('teams.deleted', 0)->withUser()->get();
        $jsonOutput->setData($result);
    }

    public function getListTeams()
    {
        $jsonOutput = app()->make("JsonOutput");
        $listTeams = TeamRepository::getAll(['id', 'name']);
        $jsonOutput->setData($listTeams);
    }

    /* 
		Function that returns all Teams 
	*/
    public function getSmsProviders() {
        $jsonOutput = app()->make("JsonOutput");
        $smsProviders = $currentSmsProviders = SmsProvider::select('key','provider','type','phone_number')->get();
        $smsProvidersOptions = array_keys(config('sms.stores'));
        foreach($smsProvidersOptions as $index => $option){
            $smsProvidersOptions[$index] = ['id' => $index, 'name'=> $option];
        }
        $result = [
            'sms_providers' => $currentSmsProviders,
            'sms_providers_options' => $smsProvidersOptions
        ];
        $jsonOutput->setData($result);
    }
    /* 
		Function that returns all Teams 
	*/
    public function updateSmsProvider(Request $request, $providerKey) {
        $jsonOutput = app()->make("JsonOutput");
        $smsProvider = $currentSmsProviders = SmsProvider::select('id', 'key','provider','type','phone_number')
        ->where('key', $providerKey)
        ->first();
        if(!$smsProvider){
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY')); return;
        }
        $updatedValues = [ 'provider', 'phone_number' ];
        $phoneNumber = $request->input('phone_number', null);

        if(!isset($phoneNumber) || strlen($phoneNumber) < 1 || strlen($phoneNumber) > 15){
            $jsonOutput->setErrorCode(config('errors.system.PROVIDER_PHONE_NUMBER_NOT_VALID')); return;
        }
        if( $phoneNumber != $smsProvider->phone_number){
            $smsProvider->phone_number = $phoneNumber;
        }
        $smsProvidersOptions = array_keys(config('sms.stores'));

        $provider = $request->input('provider', null);
        
        if(!isset($provider) || !in_array($provider, $smsProvidersOptions)){
            $jsonOutput->setErrorCode(config('errors.system.PROVIDER_PHONE_NUMBER_NOT_VALID')); return;
        }
        if( $provider != $smsProvider->provider){
            $smsProvider->provider = $provider;
        }
        $smsProvider->save();

        $jsonOutput->setData($smsProvider);
    }

	/*
		Function that deletes Team by its key, only if it's not in use 
	*/
    public function deleteTeam(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = Teams::select('id')->where('key', $key)->where('deleted', 0)->first();

        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\RolesByUsers::select('id')->where(['team_id' => $item->id, 'deleted' => 0])->first() ||
                \App\Models\TeamUsers::select('id')->where('team_id', $item->id)->first() ||
                \App\Models\TeamDepartments::select('id')->where(['team_id' => $item->id, 'deleted' => 0])->first() ||
                // \App\Models\TeamLeaderHistory::select('id')->where('team_id', $item->id)->first() ||
                \App\Models\CrmRequest::select('id')->where(['team_handler_id'=> $item->id, 'deleted' => 0 ])->first() ||
                \App\Models\GeographicFilterTemplates::select('id')->where('team_id', $item->id)->first() ||
                \App\Models\SectorialFilterTemplates::select('id')->where('team_id', $item->id)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        Teams::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.system.teams.delete',
            'models' => [
                [
                    'referenced_model' => 'Teams',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* RequestStatus */
	
	/* 
		Function that returns all RequestStatuses 
	*/
    public function getRequestStatus() {
        $jsonOutput = app()->make("JsonOutput");
        $countries = RequestStatus::select('request_status.order', 'request_status.id', 'request_status.key', 'request_status.name', 'request_status.type_id', 'request_status_type.name AS type_name')->where('request_status.deleted', 0)->withStatusType()->orderBy('request_status.order', 'asc')->get();
        $jsonOutput->setData($countries);
    }

	/*
		Function that deletes RequestStatus by its key, only if it's not in use 
	*/
    public function deleteRequestStatus(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = RequestStatus::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = CrmRequest::select('id')->where('status_id', $itemId)->first() ||
                RequestTopic::select('id')->where('default_request_status_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        RequestStatus::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.status.delete',
            'models' => [
                [
                    'referenced_model' => 'RequestStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing RequestStatus by its key and POST params
	*/
    public function updateRequestStatus(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemData = $request->input('item');
        $itemValues = [];

        if (!is_array($itemData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($itemData as $key1 => $value) {
            $itemValues[$key1] = trim($value);
        }
        $name = $itemValues['name'];

        if (strlen($name) < 2 || !isset($itemValues['type_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $typeId = $itemValues['type_id'];
        $item = RequestStatus::select('id', 'name', 'type_id')->where('key', $key)->first();

        $row = RequestStatus::where('key', $key)->first();
        $row->name = $name;
        $row->type_id = $typeId;
        $row->save();

        $changedValues = [];

        if ( $row->name != $item->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.RequestStatus.name'),
                'old_value' => $item->name,
                'new_value' => $row->name
            ];
        }

        if ( $row->type_id != $item->type_id ) {
            $changedValues[] = [
                'field_name' => 'type_id',
                'display_field_name' => config('history.RequestStatus.type_id'),
                'old_numeric_value' => $item->type_id,
                'new_numeric_value' => $row->type_id
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.requests.status.edit',
                'models' => [
                    [
                        'referenced_model' => 'RequestStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that performs bulk updates of orders of RequestStatuses list by POST params
	*/
    public function updateRequestStatusOrder(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $statusData = $request->input('list');
        $isError = FALSE;
        $statusKeys = [];

        if (!is_array($statusData)) {
            $isError = TRUE;
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
        }

        if (!$isError) {
            //check order validation
            usort($statusData, function($a, $b) {
                return strcmp($a['order'], $b['order']);
            });

            $orderIndex = 1;
            foreach ($statusData as $item) {
                $statusKeys[] = trim($item['key']);
                $order = trim($item['order']);

                if ($order != $orderIndex) {
                    $isError = TRUE;
                    $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_ORDER_IS_NOT_VALID'));
                    break;
                }
                $orderIndex++;
            }
        }

        if (!$isError) {
            //check if all the keys exist in the db.
            $itemsCount = RequestStatus::whereIn('key', $statusKeys)->count();

            if (count($statusKeys) != $itemsCount) {
                $isError = TRUE;
                $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            }
        }

        if (!$isError) {
            foreach ($statusData as $item) {
                $itemDB = RequestStatus::where('key', trim($item['key']))->first();
                $oldOrder = $itemDB->order;

                if ($itemDB) {
                    $itemDB->order = $item['order'];
                    $itemDB->save();
                }

                if ( $itemDB->order != $oldOrder ) {
                    $historyArgsArr = [
                        'topicName' => 'system.lists.requests.status.edit',
                        'models' => [
                            [
                                'referenced_model' => 'RequestStatus',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $itemDB->id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'order',
                                        'display_field_name' => config('history.RequestStatus.order'),
                                        'old_numeric_value' => $oldOrder,
                                        'new_numeric_value' => $itemDB->order
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }

            $jsonOutput->setData('');
        }
    }

	/*
		Function that adds new RequestStatus by POST params
	*/
    public function addRequestStatus(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $itemData = $request->input('item');

        if (!is_array($itemData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $key = Helper::getNewTableKey('request_status', 5);
        $itemValues = [];

        foreach ($itemData as $k => $v) {
            $itemValues[$k] = trim($v);
        }
        $name = $itemValues['name'];

        if (strlen($name) < 2 || !isset($itemValues['type_id'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $lastRow = RequestStatus::max('order');
        $typeId = $itemValues['type_id'];
        $row = new RequestStatus;
        $row->key = $key;
        $row->name = $name;
        $row->type_id = $typeId;
        $row->order = $lastRow + 1;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.status.add',
            'models' => [
                [
                    'referenced_model' => 'RequestStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.RequestStatus.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'type_id',
                            'display_field_name' => config('history.RequestStatus.type_id'),
                            'new_numeric_value' => $row->type_id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* RequestStatusType */

	/* 
		Function that returns all RequestStatuseTypes 
	*/
    public function getRequestStatusTypes() {

        $jsonOutput = app()->make("JsonOutput");
        $countries = RequestStatusType::select('id', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($countries);
    }

    /* Topics */

	/* 
		Function that returns all Topics 
	*/
    public function getAllTopics() {
        $jsonOutput = app()->make("JsonOutput");
        $requestTopics = RequestTopic::select('id', 'key', 'name', 'active', 'parent_id', 'topic_order'
                        , 'target_close_days', 'default_request_status_id')->where('deleted', 0)->get();

        foreach ($requestTopics as $topic) {
            $topicFullName = $topic['name'];

            if ($topic['parent_id'] != 0) {
                foreach ($requestTopics as $topic2) {
                    if ($topic['parent_id'] == $topic2['id']) {
                        $topicFullName = $topic2['name'] . ' | ' . $topic['name'];
                        break;
                    }
                }
            }
            $topic['full_name'] = $topicFullName;
        }

        $jsonOutput->setData($requestTopics);
    }

	/* 
		Function that returns all Topics by parent topicKey , or where parentTopic 
		in 0 if key param in NULL
	*/
    public function getTopics(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");
        $fields =[
            'request_topics.id', 'request_topics.key', 'request_topics.name',
            'request_topics.active', 'request_topics.topic_order', 'request_topics.parent_id',
            'user_handler.id as user_handler_id',
            DB::raw('CONCAT(user_handler_voter.first_name," ", user_handler_voter.last_name) as user_handler_name'),
        ];
        $topicSystemName = $request->input('topic_system_name'); // For municipal topic
        $cityKey = $request->input('city_key');// For municipal topic

        if ($key || $topicSystemName) { // Sup topics
            $topic = RequestTopic::select('id');
            if($key){
                $topic = $topic->where('key', trim($key))->first();
            } else {
                $topic = $topic->where('system_name', $topicSystemName)->first();
            }
            if(!$topic){
                $jsonOutput->setErrorCode(config('errors.crm.REQUEST_TOPIC_NOT_EXISTS'));
                return;
            }
            $cityId = null;
            if($cityKey){
                $city = City::where('key', $cityKey)->first();
                if(!$city){ $jsonOutput->setErrorCode(config('errors.crm.CITY_NOT_EXISTS'));}
                $cityId = $city->id;
            }
            $requestTopics = RequestTopic::select($fields)->addSelect('request_topics.target_close_days', 'request_topics.default_request_status_id', 'request_status.name AS request_status_name')->withRequestStatus()
                            ->where('parent_id', $topic->id)->where('request_topics.deleted', 0)
                            ->withUserTeamHandler($cityId)
                            ->groupBY('request_topics.id')->get();
                            // dump($key, $topicId,$result);
        } else { // Main topics
            $requestTopics = RequestTopic::select($fields)->addSelect('team_handler.name as team_handler_name', 'team_handler.id as team_handler_id')
                ->withUserTeamHandler()
                ->where('request_topics.deleted', 0)->where('parent_id', 0)->get();
        }
        $jsonOutput->setData($requestTopics);
    }

	/*
		Function that deletes Topic by its key, only if it's not in use 
	*/
    public function deleteTopic(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $item = RequestTopic::select('id','system_name')->where('key', $key)->first();

        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        if ($item->system_name) {
            $jsonOutput->setErrorCode(config('errors.system.CANT_DELETE_SYSTEM_CONFIGURATION'));
            return;
        }
        $itemId = $item->id;

        $isItemInUse = RequestTopic::select('id')->where(['parent_id' => $itemId,'deleted'=>0])->first()['id'] ||
                CrmRequest::select('id')->where(['topic_id'=> $itemId,'deleted'=>0])->first()['id'] ||
                CrmRequest::select('id')->where(['sub_topic_id'=> $itemId,'deleted'=>0])->first()['id'];

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        RequestTopic::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.topics.delete',
            'models' => [
                [
                    'referenced_model' => 'RequestTopic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing Topic by its key and POST params
	*/
    public function updateTopic(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        $topicData = $request->input('topic');

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (!is_array($topicData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        $topicValues = [];

        foreach ($topicData as $k => $v) {
            $value  = null;
            if ($v !== null) $value = trim($v);
            $topicValues[$k] = $value;
        }

        $name = $topicValues['name'];

        if (strlen($name) < 2 || !isset($topicValues['topic_order']) || !isset($topicValues['active'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $topicOrder = $topicValues['topic_order'];
        $active = $topicValues['active'] ? '1' : '0';
        $targetCloseDays = isset($topicValues['target_close_days']) ? $topicValues['target_close_days'] : NULL;
        $defaultRequestStatusId = isset($topicValues['default_request_status_id']) ? $topicValues['default_request_status_id'] : NULL;



        $topic = RequestTopic::select('request_topics.*')->where('request_topics.key', $key)->first();
        $item = $topic->toArray(); // Old values

        $isNameValid = $this->checkTopicName($name, $topic->parent_id, $topic->id);
        if(!$isNameValid){
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return;
        }

        $newUserHandlerId = !empty($topicValues['user_handler_id']) ? $topicValues['user_handler_id']: null;

        $newTeamHandlerId = !empty($topicValues['team_handler_id']) ? $topicValues['team_handler_id']: null;

        if (is_null($newTeamHandlerId))
        $newTeamHandlerId = RequestTopicsRepository::getParentTopicTeamHandlerId($topic);

        $subTopicsKeys = $request->input('multi_sub_topics_keys', null);

        // dd($subTopicsKeys);
        if(isset($subTopicsKeys)){ //* multi sub topics for update user handler:
            $multiSubTopics = RequestTopic::select('request_topics.id')->whereIn('request_topics.key', $subTopicsKeys)->get();
            // dd($multiSubTopics->toArray());
            foreach($multiSubTopics as $item){
                $result = HelpFunctions::updateRequestTopicUserHandler($jsonOutput, 'system', $item->id, null, $newUserHandlerId, $newTeamHandlerId);
                if(!$result){ return; }
            }
        } else { //* Update topic user handler
            $result = HelpFunctions::updateRequestTopicUserHandler($jsonOutput, 'system', $topic->id, null, $newUserHandlerId, $newTeamHandlerId);
            if(!$result){ return; }
        }

        $topic->name = $name;
        $topic->topic_order = $topicOrder;
        $topic->active = $active;
        $topic->target_close_days = $targetCloseDays;
        $topic->default_request_status_id = $defaultRequestStatusId;
        $topic->save();

        $fields = [
            'name',
            'topic_order',
            'active',
            'target_close_days',
            'default_request_status_id',
            'parent_id',
        ];

        $changedValues = [];

        for ( $index = 0; $index < count($fields); $index++ ) {
            $fieldName = $fields[$index];

            if ($item[$fieldName] != $topic->{$fieldName}) {
                if ( 'name' == $fieldName ) {
                    $changedValues[] = [
                        'field_name' => 'name',
                        'display_field_name' => config('history.RequestTopic.name'),
                        'old_value' => $item[$fieldName],
                        'new_value' => $topic->name
                    ];
                } else {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.RequestTopic.' . $fieldName),
                        'old_numeric_value' => $item[$fieldName],
                        'new_numeric_value' => $topic->{$fieldName}
                    ];
                }
            }
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.requests.topics.edit',
                'models' => [
                    [
                        'referenced_model' => 'RequestTopic',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $topic->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }
    /**
     * @method checkTopicName
     * Check if parent already has sub topic with same name
     * @return (bool) 
     */
    private function checkTopicName($name, $parentId, $topicId = null)
    {
        $otherTopicWithSameName = RequestTopic::select('id')
        ->where('name', $name)->where('parent_id', $parentId)
        ->where('id', '!=', $topicId);
        if ($topicId)
        $otherTopicWithSameName->where('deleted', 0);
        $otherTopicWithSameName = $otherTopicWithSameName->first();
        return !$otherTopicWithSameName;
    }
	/*
		Function that adds new Topic by POST params
	*/
    public function addTopic(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $topicData = $request->input('topic');
        $topicValues = [];

        if (!is_array($topicData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($topicData as $k => $v) {
            $value  = null;
            if ($v !== null) $value = trim($v);
            $topicValues[$k] = $value;
        }

        $name = $topicValues['name'];
        if (strlen($name) < 2 || !isset($topicValues['parent_id']) || !isset($topicValues['active'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $isNameValid = $this->checkTopicName($name, $topicValues['parent_id']);
        if(!$isNameValid){
            $jsonOutput->setErrorCode(config('errors.system.VALUE_ALREADY_EXIST'));
            return;
        }
        $lastTopic = RequestTopic::select('id','topic_order')
            ->where('parent_id', $topicValues['parent_id'])
            ->where('deleted', 0)
            ->orderBy('topic_order', 'desc')
            ->first();
        $newTopicOrder = 1;
        if ($lastTopic != null) $newTopicOrder = $lastTopic->topic_order + 1;
        $key = \App\Libraries\Helper::getNewTableKey('request_topics', 10);
        $topicOrder = $newTopicOrder;
        $parentId = $topicValues['parent_id'];
        $active = $topicValues['active'] ? '1' : '0';
        $targetCloseDays = isset($topicValues['target_close_days']) ? $topicValues['target_close_days'] : NULL;
        $defaultRequestStatusId = isset($topicValues['default_request_status_id']) ? $topicValues['default_request_status_id'] : NULL;


        $topic = new RequestTopic;
        $topic->key = $key;
        $topic->name = $name;
        $topic->topic_order = $topicOrder;
        $topic->parent_id = $parentId;
        $topic->active = $active;
        $topic->deleted = 0;
        $topic->target_close_days = $targetCloseDays;
        $topic->default_request_status_id = $defaultRequestStatusId;
        $topic->save();

        $fields = [
            'name',
            'topic_order',
            'active',
            'target_close_days',
            'default_request_status_id',
            'parent_id'
        ];

        $insertedValues = [];
        for ( $index = 0; $index < count($fields); $index++ ) {
            $fieldName = $fields[$index];

            if ( 'name' == $fieldName ) {
                $insertedValues[] = [
                    'field_name' => 'name',
                    'display_field_name' => config('history.RequestTopic.name'),
                    'new_value' => $topic->name
                ];
            } else {
                $insertedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.RequestTopic.' . $fieldName),
                    'new_numeric_value' => $topic->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.topics.add',
            'models' => [
                [
                    'referenced_model' => 'RequestTopic',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $topic->id,
                    'valuesList' => $insertedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that performs bulk updates of orders of Topics list by POST params
	*/
    public function updateTopicsOrder(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $topicData = $request->input('topics');
        $isError = FALSE;
        $topicsKeys = [];

        if (!is_array($topicData)) {
            $isError = TRUE;
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
        }

        if (!$isError) {
            //check order validation
            usort($topicData, function($a, $b) {
                return strcmp($a['order'], $b['order']);
            });

            // $orderIndex = 1;
            foreach ($topicData as $item) {
                $topicsKeys[] = trim($item['key']);
            }
        }

        if (!$isError) {
            //check if topics keys exist in the db.
            $topicsCount = RequestTopic::whereIn('key', $topicsKeys)->count();

            if (count($topicsKeys) != $topicsCount) {
                $isError = TRUE;
                $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            }
        }

        if (!$isError) {
            foreach ($topicData as $item) {
                $key = trim($item['key']);
                $order = trim($item['order']);

                $item = RequestTopic::select('id', 'topic_order')->where('key', $key)->first();

                $topic = RequestTopic::where('key', $key)->first();
                $topic->topic_order = $order;
                $topic->save();

                if ( $topic->topic_order != $item->order ) {
                    $historyArgsArr = [
                        'topicName' => 'system.lists.requests.topics.edit',
                        'models' => [
                            [
                                'referenced_model' => 'RequestTopic',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $topic->id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'topic_order',
                                        'display_field_name' => config('history.RequestTopic.topic_order'),
                                        'old_numeric_value' => $item->topic_order,
                                        'new_numeric_value' => $topic->topic_order
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }
            $jsonOutput->setData('');
        }
    }

    /* RequestSource */

	/* 
		Function that returns all RequestSources 
	*/
    public function getRequestSource(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = RequestSource::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

    /* RequestClosureReason */

	/* 
		Function that returns all RequestClosureReasons 
	*/
    public function getRequestClosureReason(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = RequestClosureReason::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes RequestClosureReason by its key 
	*/
    public function deleteRequestClosureReason(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $itemId = RequestClosureReason::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        RequestClosureReason::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.closure_reason.delete',
            'models' => [
                [
                    'referenced_model' => 'RequestClosureReason',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($itemId);
    }

	/*
		Function that updates existing RequestClosureReason by its key and POST params
	*/
    public function updateRequestClosureReason(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = RequestClosureReason::select('id', 'name')->where('key', $key)->first();
        RequestClosureReason::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.requests.closure_reason.edit',
                'models' => [
                    [
                        'referenced_model' => 'RequestClosureReason',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.RequestClosureReason.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new RequestClosureReason by POST params
	*/
    public function addRequestClosureReason(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('request_closure_reason', 5);
        $row = new RequestClosureReason;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.requests.closure_reason.add',
            'models' => [
                [
                    'referenced_model' => 'RequestClosureReason',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.RequestClosureReason.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Voter shas representative roles */

	/* 
		Function that returns all ShasRepresentativeRoles 
	*/
    public function getShasRepresentativeRoles() {

        $jsonOutput = app()->make("JsonOutput");
        $result = ShasRepresentativeRoles::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes ShasRepresentativeRole by its key 
	*/
    public function deleteShasRepresentativeRole(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = ShasRepresentativeRoles::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\ShasRepresentative::select('id')->where('shas_representative_role_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        ShasRepresentativeRoles::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.shas_representative_role.delete',
            'models' => [
                [
                    'referenced_model' => 'ShasRepresentativeRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' =>$itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing ShasRepresentativeRole by its key and POST params
	*/
    public function updateShasRepresentativeRole(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = ShasRepresentativeRoles::select('id', 'name')->where('key', $key)->first();
        ShasRepresentativeRoles::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.shas_representative_role.edit',
                'models' => [
                    [
                        'referenced_model' => 'ShasRepresentativeRoles',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.ShasRepresentativeRoles.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }
    
	/*
		Function that adds new ShasRepresentativeRole by POST params
	*/
	public function addShasRepresentativeRole(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('shas_representative_roles', 5);
        $row = new ShasRepresentativeRoles;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.shas_representative_role.add',
            'models' => [
                [
                    'referenced_model' => 'ShasRepresentativeRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ShasRepresentativeRoles.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Voter religious Council roles */

	/* 
		Function that returns all ReligiousCouncilRoles 
	*/
    public function getReligiousCouncilRoles() {

        $jsonOutput = app()->make("JsonOutput");
        $result = ReligiousCouncilRoles::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes ReligiousCouncilRole if it's not in use ,  by its key 
	*/
    public function deleteReligiousCouncilRole(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = ReligiousCouncilRoles::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        // Check if this role in use:
        $isItemInUse = \App\Models\ReligiousCouncilMembers::select('id')->where('religious_council_role_id', $itemId)->first();
        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        ReligiousCouncilRoles::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.shas_representative_role.delete',
            'models' => [
                [
                    'referenced_model' => 'ReligiousCouncilRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' =>$itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing ReligiousCouncilRole by its key and POST params
	*/
    public function updateReligiousCouncilRole(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = ReligiousCouncilRoles::select('id', 'name')->where('key', $key)->first();
        ReligiousCouncilRoles::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.shas_representative_role.edit',
                'models' => [
                    [
                        'referenced_model' => 'ReligiousCouncilRoles',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.ReligiousCouncilRoles.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new ReligiousCouncilRole by POST params
	*/
    public function addReligiousCouncilRole(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('shas_representative_roles', 5);
        $row = new ReligiousCouncilRoles;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.shas_representative_role.add',
            'models' => [
                [
                    'referenced_model' => 'ReligiousCouncilRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ReligiousCouncilRoles.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }
	
	/* Voter City Shas roles */

	/* 
		Function that returns all CityShasRoles 
	*/
	public function getCityShasRoles() {
		$jsonOutput = app()->make("JsonOutput");
		$result = CityShasRoles::select('key', 'name')->where('deleted', 0)->get();
		$jsonOutput->setData($result);
	}

	/*
		Function that deletes CityShasRoles if it's not in use ,  by its key 
	*/
	public function deleteCityShasRole(Request $request, $key = null) {
		$jsonOutput = app()->make("JsonOutput");
		if (!$key) {
			$jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
			return;
		}
		$itemId = CityShasRoles::select('id')->where('key', $key)->first()->id;

		if (!$itemId) {
			$jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
			return;
		}
		// Check if this role in use: 
		$isItemInUse = \App\Models\CityShasRolesByVoters::select('id')->where('city_shas_role_id', $itemId)->first();
		if ($isItemInUse) {
			$jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
			return;
		}
		CityShasRoles::where('key', $key)->update(['deleted' => 1]);

		$historyArgsArr = [
			'topicName' => 'system.lists.elections.shas_representative_role.delete',
			'models' => [
				[
					'referenced_model' => 'CityShasRoles',
					'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
					'referenced_id' =>$itemId
				]
			]
		];

		ActionController::AddHistoryItem($historyArgsArr);

		$jsonOutput->setData('');
	}

	/*
		Function that updates existing CityShasRoles by its key and POST params
	*/
	public function updateCityShasRole(Request $request, $key = null) {
		$jsonOutput = app()->make("JsonOutput");

		if (!$key) {
			$jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
			return;
		}
		$name = trim($request->input('name'));

		if (strlen($name) < 2) {
			$jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
			return;
		}

		$item = CityShasRoles::select('id', 'name')->where('key', $key)->first();
		CityShasRoles::where('key', $key)->update(['name' => $name]);

		if ( $name != $item->name ) {
			$historyArgsArr = [
				'topicName' => 'system.lists.elections.shas_representative_role.edit',
				'models' => [
					[
						'referenced_model' => 'CityShasRoles',
						'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
						'referenced_id' => $item->id,
						'valuesList' => [
							[
								'field_name' => 'name',
								'display_field_name' => config('history.CityShasRoles.name'), 
								'old_value' => $item->name,
								'new_value' => $name
							]
						]
					]
				]
			];

			ActionController::AddHistoryItem($historyArgsArr);
		}

		$jsonOutput->setData('');
	}

	/*
		Function that adds new CityShasRoles by POST params
	*/
	public function addCityShasRole(Request $request) {

		$jsonOutput = app()->make("JsonOutput");
		$name = trim($request->input('name'));

		if (strlen($name) < 2) {
			$jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
			return;
		}

		$key = Helper::getNewTableKey('shas_representative_roles', 5);
		$row = new CityShasRoles;
		$row->key = $key;
		$row->name = $name;
		$row->save();

		$historyArgsArr = [
			'topicName' => 'system.lists.elections.shas_representative_role.add',
			'models' => [
				[
					'referenced_model' => 'CityShasRoles',
					'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
					'referenced_id' => $row->id,
					'valuesList' => [
						[
							'field_name' => 'name',
							'display_field_name' => config('history.CityShasRoles.name'),
							'new_value' => $row->name
						]
					]
				]
			]
		];

		ActionController::AddHistoryItem($historyArgsArr);

		$jsonOutput->setData('');
	}
    
	/* institutes */

	/* 
		Function that returns all Institutes 
	*/
    public function getInstitutes() {
        $jsonOutput = app()->make("JsonOutput");
        $result = Institutes::select('institutes.key', 'institutes.name', 'institute_types.name AS type'
                                , 'institute_networks.name AS network', 'cities.name AS city', 'institute_groups.name AS group'
                                , 'institute_groups.key AS group_key', 'institute_types.key AS type_key', 'institute_networks.key AS network_key'
                                , 'cities.key AS city_key')
                        ->withType()->withNetwork()->withCity()->withTypeGroup()->where('institutes.deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes Institute if it's not in use ,  by its key 
	*/
    public function deleteInstitute(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = Institutes::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $isItemInUse = \App\Models\InstituteRolesByVoters::select('id')->where('institute_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        Institutes::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.delete',
            'models' => [
                [
                    'referenced_model' => 'Institutes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing Institute by its key and POST params
	*/
    public function updateInstitute(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        $instituteData = $request->input('institute');
        $instituteValues = [];

        if (!is_array($instituteData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($instituteData as $key1 => $value) {
            $instituteValues[$key1] = trim($value);
        }

        $name = $instituteValues['name'];
        $typeKey = $instituteValues['type'];
        $networkKey = isset($instituteValues['network']) ? $instituteValues['network'] : FALSE;
        $cityKey = $instituteValues['city'];

        $typeId = InstituteTypes::select('id')->where('key', $typeKey)->first()['id'];
        $networkId = $networkKey ? InstituteNetwork::select('id')->where('key', $networkKey)->first()['id'] : NULL;
        $cityId = City::select('id')->where('key', $cityKey)->first()['id'];

        if ((strlen($name) < 2) || !$typeId || (($networkKey) && (!$networkId)) || !$cityId) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }
        if ($networkKey && !$networkId) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }        

        $item = Institutes::select('id', 'name', 'institute_type_id', 'institute_network_id', 'city_id')->where('key', $key)->first();
        Institutes::where('key', $key)->update(['name' => $name, 'institute_type_id' => $typeId, 'institute_network_id' => $networkId,
                                                'city_id' => $cityId]);

        $newFieldsValues = [
            'name' => $name,
            'institute_type_id' => $typeId,
            'institute_network_id' => $networkId,
            'city_id' => $cityId
        ];

        $changedValues = [];

        foreach ($newFieldsValues as $fieldName => $newValue) {
            if ( $newValue != $item->{$fieldName} ) {
                if ( 'name' == $fieldName ) {
                    $changedValues[] = [
                        'field_name' => 'name',
                        'display_field_name' => config('history.Institutes.name'),
                        'old_value' => $item->name,
                        'new_value' => $name
                    ];
                } else {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.Institutes.' . $fieldName),
                        'old_numeric_value' => $item->{$fieldName},
                        'new_numeric_value' => $newValue
                    ];
                }
            }
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.institute.edit',
                'models' => [
                    [
                        'referenced_model' => 'Institutes',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new Institute by POST params
	*/
    public function addInstitute(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $instituteData = $request->input('institute');
        $instituteValues = [];

        if (!is_array($instituteData)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }

        foreach ($instituteData as $key1 => $value) {
            $instituteValues[$key1] = trim($value);
        }

        $name = $instituteValues['name'];
        $typeKey = $instituteValues['type'];
        $networkKey = isset($instituteValues['network']) ? $instituteValues['network'] : FALSE;
        $cityKey = $instituteValues['city'];

        $typeId = InstituteTypes::select('id')->where('key', $typeKey)->first()['id'];
        $networkId = $networkKey ? InstituteNetwork::select('id')->where('key', $networkKey)->first()['id'] : NULL;
        $cityId = City::select('id')->where('key', $cityKey)->first()['id'];

        if ((strlen($name) < 2) || !$typeId || !$cityId) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }
        if ($networkKey && !$networkId) {
            $jsonOutput->setErrorCode(config('errors.system.SUBMITTED_DATA_IS_NOT_VALID'));
            return;
        }   

        $key = Helper::getNewTableKey('institutes', 5);
        $row = new Institutes;
        $row->key = $key;
        $row->name = $name;
        $row->institute_type_id = $typeId;
        $row->institute_network_id = $networkId;
        $row->city_id = $cityId;
        $row->save();

        $fields = [
            'name',
            'institute_type_id',
            'institute_network_id',
            'city_id'
        ];

        $insertedValues = [];

        for ( $index = 0; $index < count($fields); $index++ ) {
            $fieldName = $fields[$index];

            if ( 'name' == $fieldName ) {
                $insertedValues[] = [
                    'field_name' => 'name',
                    'display_field_name' => config('history.Institutes.name'),
                    'new_value' => $row->name
                ];
            } else {
                $insertedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Institutes.' . $fieldName),
                    'new_numeric_value' => $row->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.add',
            'models' => [
                [
                    'referenced_model' => 'Institutes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => $insertedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* institute groups */

	/* 
		Function that returns all InstituteGroups 
	*/
    public function getInstituteGroups() {

        $jsonOutput = app()->make("JsonOutput");
        $result = InstituteGroup::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes InstituteGroup if it's not in use ,  by its key 
	*/
    public function deleteInstituteGroup(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = InstituteGroup::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = InstituteTypes::select('id')->where('institute_group_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        InstituteGroup::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.groups.delete',
            'models' => [
                [
                    'referenced_model' => 'InstituteGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing InstituteGroup by its key and POST params
	*/
    public function updateInstituteGroup(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = InstituteGroup::select('id', 'name')->where('key', $key)->first();
        InstituteGroup::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.institute.groups.edit',
                'models' => [
                    [
                        'referenced_model' => 'InstituteGroups',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.InstituteGroups.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/*
		Function that adds new InstituteGroup by POST params
	*/
    public function addInstituteGroup(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('institute_groups', 5);
        $row = new InstituteGroup;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.groups.add',
            'models' => [
                [
                    'referenced_model' => 'InstituteGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.InstituteGroups.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* institute types */
	/* 
		Function that returns all InstituteTypes , or InstituteTypes by InstituteGroupKey
	*/
    public function getInstituteTypes(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        $result = array();

        if ($key) {
            $metaKey = trim($key);
            $id = InstituteGroup::select('id')->where('key', $metaKey)->first()['id'];
            $result = InstituteTypes::select('id', 'key', 'name')->where('institute_group_id', $id)->where('deleted', 0)->get();
        } else {
            $instituteGroups = InstituteGroup::select('id', 'key', 'name')->where('deleted', 0)->get();
            $groups = [];

            foreach ($instituteGroups as $group) {
                $groups[$group['id']] = $group['name'];
            }

            $result = InstituteTypes::select('id', 'key', 'institute_group_id', 'name')->where('deleted', 0)->get();
            foreach ($result as $row) {
                $row['name'] = $groups[$row['institute_group_id']] . " | " . $row['name'];
            }
        }
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes InstituteType if it's not in use ,  by its key 
	*/
    public function deleteInstituteType(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = InstituteTypes::select('id')->where('key', $key)->first()['id'];

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = InstituteRole::select('id')->where('institute_type_id', $itemId)->first() ||
                Institutes::select('id')->where('institute_type_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        InstituteTypes::where('key', $key)->update(['deleted' => 1]);
        $jsonOutput->setData('');
        ActionController::AddHistoryItem('system.lists.elections.institute.types.delete', $itemId, 'InstituteTypes');
    }

	/*
		Function that updates existing InstituteType by its key and POST params
	*/
    public function updateInstituteType(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = InstituteTypes::select('id', 'name')->where('key', $key)->first();
        ActionController::AddHistoryItem('system.lists.elections.institute.types.edit', $item['id'], 'InstituteTypes'
                , array(array('name', 'שם קבוצה', $item['name'], $name)));
        InstituteTypes::where('key', $key)->update(['name' => $name]);
        $jsonOutput->setData('');
    }

	/*
		Function that adds new InstituteType by POST params
	*/
    public function addInstituteType(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $insertItem = $request->input('item');

        if (!is_array($insertItem)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }
        $itemValues = [];

        foreach ($insertItem as $k => $v) {
            $itemValues[$k] = trim($v);
        }

        $name = $itemValues['name'];

        if (strlen($name) < 2 || !isset($itemValues['instituteGroupId'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('institute_types', 5);
        $row = new InstituteTypes;
        $row->key = $key;
        $row->name = $name;
        $row->institute_group_id = $itemValues['instituteGroupId'];
        $row->save();
        $jsonOutput->setData('');

        $itemId = InstituteTypes::select('id')->where('key', $key)->first()['id'];
        ActionController::AddHistoryItem('system.lists.elections.institute.types.add', $itemId
                , 'InstituteTypes', array(array('name', 'שם סוג', '', $name), array('institute_group_id', 'מספר קבוצה', '', $itemValues['instituteGroupId'])));
    }

    /* institute networks */

	/* 
		Function that returns all InstituteNetworks 
	*/
    public function getInstituteNetworks() {

        $jsonOutput = app()->make("JsonOutput");
        $result = InstituteNetwork::select('id', 'key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes InstituteNetwork if it's not in use ,  by its key 
	*/
    public function deleteInstituteNetwork(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = InstituteNetwork::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = Institutes::select('id')->where('institute_network_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        InstituteNetwork::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.networks.delete',
            'models' => [
                [
                    'referenced_model' => 'InstituteNetworks',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/*
		Function that updates existing InstituteNetwork by its key and POST params
	*/
    public function updateInstituteNetwork(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $item = InstituteNetwork::select('id', 'name')->where('key', $key)->first();
        InstituteNetwork::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.institute.networks.edit',
                'models' => [
                    [
                        'referenced_model' => 'InstituteNetworks',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.InstituteNetworks.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }


        $jsonOutput->setData('');
    }

	/*
		Function that adds new InstituteNetwork by POST params
	*/
    public function addInstituteNetwork(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('institute_networks', 5);
        $row = new InstituteNetwork;
        $row->key = $key;
        $row->name = $name;
        $row->save();
        $jsonOutput->setData('');

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.networks.add',
            'models' => [
                [
                    'referenced_model' => 'InstituteNetworks',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.InstituteNetworks.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

    /* institute roles */

	/* 
		Function that returns all InstituteRoles , or InstituteRoles by  InstituteTypeKey
	*/
    public function getInstituteRoles(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        $result = array();

        if ($key) {
            $metaKey = trim($key);
            $id = InstituteTypes::select('id')->where('key', $metaKey)->first()['id'];
            $result = InstituteRole::select('key', 'name')->where('institute_type_id', $id)->where('deleted', 0)->get();
        } else {
            $result = InstituteRole::select('key', 'institute_type_id', 'name')->where('deleted', 0)->get();
        }
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing InstituteRole if it's not in use  , by its key 
	*/
    public function deleteInstituteRole(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = InstituteRole::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\InstituteRolesByVoters::select('id')->where('institute_role_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
        InstituteRole::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.roles.delete',
            'models' => [
                [
                    'referenced_model' => 'InstituteRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/* 
		Function that updates existing InstituteRole by its key and POST params
	*/
    public function updateInstituteRole(Request $request, $key = null) {

        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = InstituteRole::select('id', 'name')->where('key', $key)->first();
        InstituteRole::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.institute.roles.edit',
                'models' => [
                    [
                        'referenced_model' => 'InstituteRoles',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.InstituteRoles.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new InstituteRole by POST params 
	*/
    public function addInstituteRole(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $insertItem = $request->input('item');

        if (!is_array($insertItem)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }
        $itemValues = [];

        foreach ($insertItem as $k => $v) {
            $itemValues[$k] = trim($v);
        }

        $name = $itemValues['name'];

        if (strlen($name) < 2 || !isset($itemValues['instituteTypeId'])) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('institute_roles', 5);
        $row = new InstituteRole;
        $row->key = $key;
        $row->name = $name;
        $row->institute_type_id = $itemValues['instituteTypeId'];
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.institute.roles.add',
            'models' => [
                [
                    'referenced_model' => 'InstituteRoles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.InstituteRoles.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'institute_type_id',
                            'display_field_name' => config('history.InstituteRoles.institute_type_id'),
                            'new_numeric_value' => $row->institute_type_id
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Voter Groups */

	/* 
		Function that returns all VoterGroups with permissions
	*/
    public function getVoterGroups() {

        $jsonOutput = app()->make("JsonOutput");
        $result = VoterGroups::select('id', 'key', 'name', 'parent_id', 'group_order' , 'created_at' , 'permission_type' , 'user_create_id')
								->orderBy('parent_id', 'asc')->orderBy('group_order', 'asc')
								->where('deleted', 0)
								->with(['user' => function($query){
									$query->select('users.id' , 'users.admin' , 'users.voter_id' , 'voters.first_name' , 'voters.last_name')
									->withVoter();
								}])
								->withCount('votersInGroups')
								->with(['voterGroupPermissions'=>function($query){
									$query->select('id' , 'voter_group_id' , 'team_id' , 'user_id', 'entity_type' , 'entity_id');
								}])
								->get();
		$result = GlobalController::FilterVoterGroupsByPermissions($result);
		for($i = 0 ; $i < sizeof($result) ; $i++){
			$result[$i]->name = $result[$i]->name;
			$voterGroupPermissionsItem = $result[$i]->voterGroupPermissions;
			switch($result[$i]->permission_type){
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_GEOGRAPHIC'):
					for($j = 0 ; $j< sizeof($voterGroupPermissionsItem) ; $j++){
						$voterGroupPermissionsItem[$j]->title = "";
						switch($voterGroupPermissionsItem[$j]->entity_type){
							case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
								$area = Area::select('name')->where('id' , $voterGroupPermissionsItem[$j]->entity_id)->first();
								if($area){
									$voterGroupPermissionsItem[$j]->title = $area->name;
								}
								break;
							case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
								$city = City::select('name','area_id')->where('id' , $voterGroupPermissionsItem[$j]->entity_id)->first();
								if($city){
									
									$area = Area::select('name')->where('id' , $city->area_id)->first();
									if($area){
										$voterGroupPermissionsItem[$j]->title .=  $area->name  ;
									}
									$voterGroupPermissionsItem[$j]->title .=  ">" .$city->name;
								}
								break;
							case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
								$neighborhood = Neighborhood::select('name' , 'city_id')->where('id' , $voterGroupPermissionsItem[$j]->entity_id)->first();
								if($neighborhood){
									
									$city = City::select('name','area_id')->where('id' ,$neighborhood->city_id)->first();
									if($city){
										$area = Area::select('name')->where('id' , $city->area_id)->first();
										if($area){
											$voterGroupPermissionsItem[$j]->title .=  $area->name;
										}
										$voterGroupPermissionsItem[$j]->title .= ">" .$city->name;
									}
									$voterGroupPermissionsItem[$j]->title .= ">" .$neighborhood->name;
								}
								break;
						}
					}
					 
					break;
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_TEAM'):
					for($j = 0 ; $j< sizeof($voterGroupPermissionsItem) ; $j++){
						$voterGroupPermissionsItem[$j]->title = "";
						$teamName = Teams::select('name' , 'key as team_key')->where('id' , $voterGroupPermissionsItem[$j]->team_id)->first();
						if($teamName){
							$voterGroupPermissionsItem[$j]->title = $teamName->name;
							$voterGroupPermissionsItem[$j]->team_key = $teamName->team_key;
						}
					}
					 
					break;
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_USER'):
					for($j = 0 ; $j< sizeof($voterGroupPermissionsItem) ; $j++){
						$voterGroupPermissionsItem[$j]->title = "";
						$teamName = Teams::select('name' , 'key')->where('id' , $voterGroupPermissionsItem[$j]->team_id)->first();
						if($teamName){
							$voterGroupPermissionsItem[$j]->title = $teamName->name;
							$userName = User::withVoter()->select('first_name' , 'last_name' , 'users.key as user_key')->where('users.id' , $voterGroupPermissionsItem[$j]->user_id)->first();
							if($userName){
								$voterGroupPermissionsItem[$j]->title .=  ">" .$userName->first_name." ".$userName->last_name;
								$voterGroupPermissionsItem[$j]->user_key =  $userName->user_key;
							}
							$voterGroupPermissionsItem[$j]->team_key =  $teamName->key;
						}
					}
					break;
			}
		}
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing VoterGroup if it's not in use  , by its key 
	*/
    public function deleteVoterGroup(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $voterGroup = VoterGroups::select('id')->where('key', $key)->first();

        if ($voterGroup == null) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = VoterGroups::select('id')->where('parent_id', $voterGroup->id)->first() ||
                \App\Models\VotersInGroups::select('id')->where('voter_group_id', $voterGroup->id)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }
		$voterGroupID = VoterGroups::select('id')->where('key', $key)->first()['id'];
		VoterGroupPermissions::where('voter_group_id' , $voterGroupID )->delete();
        VoterGroups::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_groups.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' =>$voterGroupID
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/* 
		Function that updates existing VoterGroup by its key and POST params
	*/
    public function updateVoterGroup(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));
        
        $item = VoterGroups::select('id', 'name' , 'permission_type')->where('key', $key)->first();

		$changedValues = [];
		$arrayUpdates = [];
		
        if ($item->name != $name) {
			 $changedValues[] = [
                                'field_name' => 'name',
                                'display_field_name' => config('history.VoterGroups.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
								];
			$arrayUpdates['name']=$name;
		}
		if ($item->permission_type != $request->input("permission_type")) {
			 $changedValues[] = [
                                'field_name' => 'permission_type',
                                'display_field_name' => config('history.VoterGroups.permission_type'),
                                'old_numeric_value' => $item->permission_type,
                                'new_numeric_value' => $request->input("permission_type")
								];
			 $arrayUpdates['permission_type']=$request->input("permission_type");
		}
		$row = VoterGroups::where('key', $key)->first(); //This will save voter row
		if(sizeof($changedValues) > 0){
			VoterGroups::where('key', $key)->update($arrayUpdates);

            $historyArgsArr = [
                'topicName' => 'system.lists.elections.voter_groups.edit',
                'models' => [
                    [
                        'referenced_model' => 'VoterGroups',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];
            ActionController::AddHistoryItem($historyArgsArr);
        }
		
		if($request->input("voter_groups_permissions")){
			VoterGroupPermissions::where('voter_group_id' , $row->id )->delete();
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
        $jsonOutput->setData('');
    }

	/*
		Function that performs bulk updates of orders of VoterGroup list by POST params
	*/
    public function updateVoterGroupOrder(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $items = $request->input('items');

        if (!is_array($items)) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }
        $itemValues = [];

        foreach ($items as $item) {
            $item = array_map('trim', $item);
            if (isset($item['key']) && isset($item['parent_id']) && isset($item['group_order'])) {
                $itemValues[$item['key']] = array('parent_id' => $item['parent_id'], 'group_order' => $item['group_order']);
            }
        }

        foreach ($itemValues as $key => $value) {
            $item = VoterGroups::select('id', 'parent_id', 'group_order')->where('key', $key)->first();

            $changedValues = [];

            if ( $value['parent_id'] != $item->parent_id ) {
                $changedValues[] = [
                    'field_name' => 'parent_id',
                    'display_field_name' => config('history.VoterGroups.parent_id'),
                    'old_numeric_value' => $item->parent_id,
                    'new_numeric_value' => $value['parent_id']
                ];
            }

            if ( $value['group_order'] != $item->group_order ) {
                $changedValues[] = [
                    'field_name' => 'group_order',
                    'display_field_name' => config('history.VoterGroups.group_order'),
                    'old_numeric_value' => $item->group_order,
                    'new_numeric_value' => $value['group_order']
                ];
            }

            if ( count($changedValues) > 0 ) {
                VoterGroups::where('key', $key)->update(['parent_id' => $value['parent_id'], 'group_order' => $value['group_order']]);

                $historyArgsArr = [
                    'topicName' => 'system.lists.elections.voter_groups.edit',
                    'models' => [
                        [
                            'referenced_model' => 'VoterGroups',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $item->id,
                            'valuesList' => $changedValues
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new VoterGroup by POST params 
	*/
    public function addVoterGroup(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));
        $parentId = $request->input('parent_id');
		$permissionType = $request->input("permission_type");
         
        if ($parentId != 0 && $parentId == null) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_ARE_MISSING_DATA_TO_UPDATE'));
            return;
        }
        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
		if ($permissionType != 0 && $permissionType == null) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }
        $groupOrder = 0;

        $key = Helper::getNewTableKey('voter_groups', 10);
        $row = new VoterGroups;
        $row->key = $key;
        $row->name = $name;
        $row->parent_id = $parentId;
        $row->group_order = $groupOrder;
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
		
        $historyArgsArr = [
            'topicName' => 'system.lists.elections.voter_groups.add',
            'models' => [
                [
                    'referenced_model' => 'VoterGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.VoterGroups.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'parent_id',
                            'display_field_name' => config('history.VoterGroups.parent_id'),
                            'new_numeric_value' => $row->parent_id
                        ],
                        [
		 
                            'field_name' => 'permission_type',
                            'display_field_name' => config('history.VoterGroups.permission_type'),
                            'new_numeric_value' => $request->input("permission_type")
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($groupOrder);
    }

    /* Party Lists */

	/* 
		Function that returns all PartyLists in current(last) election campaign
	*/
    public function getPartyLists() {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign['id'];

        $result = ElectionCampaignPartyLists::select('key', 'name', 'letters', 'shas')
                        ->where('election_campaign_id', $currentCampaignId)->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing PartyList if it's not in use  , by its key 
	*/
    public function deletePartyList(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = ElectionCampaignPartyLists::select('id')->where('key', $key)->pluck('id')->first();

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\ElectionCampaignPartyListVotes::select('id')->where('election_campaign_party_list_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        ElectionCampaignPartyLists::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.party_lists.delete',
            'models' => [
                [
                    'referenced_model' => 'ElectionCampaignPartyLists',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/* 
		Function that updates existing PartyList by its key and POST params
	*/
    public function updatePartyList(Request $request, $key = null) {
        $jsonOutput = app()->make("JsonOutput");

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = trim($request->input('name'));
        $letters = trim($request->input('letters'));

        if ((strlen($name) < 2) || (strlen($letters) < 1)) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = ElectionCampaignPartyLists::select('id', 'name', 'letters', 'shas')
            ->where('key', $key)
            ->first();
        $shas = trim($request->input('shas')) ? 1 : 0;

        ElectionCampaignPartyLists::where('key', $key)->update(['name' => $name, 'letters' => $letters, 'shas' => $shas]);

        $changedValues = [];

        if ( $name != $item->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.ElectionCampaignPartyLists.name'),
                'old_value' => $item->name,
                'new_value' => $name
            ];
        }

        if ( $letters != $item->letters ) {
            $changedValues[] = [
                'field_name' => 'letters',
                'display_field_name' => config('history.ElectionCampaignPartyLists.letters'),
                'old_value' => $item->letters,
                'new_value' => $letters
            ];
        }

        if ( $shas != $item->shas ) {
            $changedValues[] = [
                'field_name' => 'shas',
                'display_field_name' => config('history.ElectionCampaignPartyLists.shas'),
                'old_value' => ($item->shas) ? 'כן' : 'לא',
                'new_value' => ($shas) ? 'כן' : 'לא',
                'old_numeric_value' => $item->shas,
                'new_numeric_value' => $shas
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.elections.party_lists.edit',
                'models' => [
                    [
                        'referenced_model' => 'ElectionCampaignPartyLists',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new PartyList by POST params , into last election campaign
	*/
    public function addPartyList(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));
        $letters = trim($request->input('letters'));
        $shas = trim($request->input('shas')) ? 1 : 0;
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign['id'];

        if ((strlen($name) < 2) || (strlen($letters) < 1)) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('election_campaign_party_lists', 5);
        $row = new ElectionCampaignPartyLists;
        $row->key = $key;
        $row->name = $name;
        $row->letters = $letters;
        $row->shas = $shas;
        $row->election_campaign_id = $currentCampaignId;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.elections.party_lists.add',
            'models' => [
                [
                    'referenced_model' => 'ElectionCampaignPartyLists',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.ElectionCampaignPartyLists.name'),
                            'new_value' => $row->name
                        ],
                        [
                            'field_name' => 'letters',
                            'display_field_name' => config('history.ElectionCampaignPartyLists.letters'),
                            'new_value' => $row->letters
                        ],
                        [
                            'field_name' => 'shas',
                            'display_field_name' => config('history.ElectionCampaignPartyLists.shas'),
                            'new_value' => ($row->shas) ? 'כן' : 'לא',
                            'new_numeric_value' => $row->shas
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    /* Languages */

	/* 
		Function that returns all Languages
	*/
    public function getLanguages(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = Languages::select('key', 'name', 'main')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing Language by its key  
	*/
    public function deleteLanguage(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = Languages::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        Languages::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.languages.delete',
            'models' => [
                [
                    'referenced_model' => 'Languages',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($itemId);
    }

	/* 
		Function that updates existing Language by its key and POST params
	*/
    public function updateLanguage(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $item = array_map('trim', $request->input('item'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = isset($item['name']) ? $item['name'] : '';
        $main = isset($item['main']) ? $item['main'] : 0;

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        if ($main) {
            Languages::where(['main' => '1'])->where('key', '<>', $key)->update(['main' => '0']);
        }

        $itemRow = Languages::select('id', 'name', 'main')->where('key', $key)->first();
        Languages::where('key', $key)->update(['name' => $name, 'main' => $main]);

        $changedValues = [];

        if ( $name != $itemRow->name ) {
            $changedValues[] = [
                'field_name' => 'name',
                'display_field_name' => config('history.Languages.name'),
                'old_value' => $itemRow->name,
                'new_value' => $name
            ];
        }

        if ( $main != $itemRow->main ) {
            $changedValues[] = [
                'field_name' => 'main',
                'display_field_name' => config('history.Languages.main'),
                'old_numeric_value' => $itemRow->main,
                'new_numeric_value' => $main
            ];
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.languages.edit',
                'models' => [
                    [
                        'referenced_model' => 'Languages',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $itemRow->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new Language by POST params
	*/
    public function addLanguage(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('languages', 5);
        $row = new Languages;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.languages.add',
            'models' => [
                [
                    'referenced_model' => 'Languages',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.Languages.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

    
    /* CityDepartments */

	/* 
		Function that returns all CityDepartments
	*/
    public function getCityDepartment(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $result = CityDepartments::select('key', 'name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing CityDepartment by its key  
	*/
    public function deleteCityDepartment(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = CityDepartments::select('id')->where('key', $key)->first()->id;

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        CityDepartments::where('key', $key)->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'system.lists.general.city_departments.delete',
            'models' => [
                [
                    'referenced_model' => 'CityDepartments',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $itemId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);


        $jsonOutput->setData($itemId);
    }

	/* 
		Function that updates existing CityDepartment by its key and POST params
	*/
    public function updateCityDepartment(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        $item = array_map('trim', $request->input('item'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $name = isset($item['name']) ? $item['name'] : '';

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $itemRow = CityDepartments::select('id', 'name')->where('key', $key)->first();
        CityDepartments::where('key', $key)->update(['name' => $name]);

        if ( $name != $itemRow->name ) {
            $historyArgsArr = [
                'topicName' => 'system.lists.general.city_departments.edit',
                'models' => [
                    [
                        'referenced_model' => 'CityDepartments',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $itemRow->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.CityDepartments.name'),
                                'old_value' => $itemRow->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new CityDepartment by POST params
	*/
    public function addCityDepartment(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('city_departments', 5);
        $row = new CityDepartments;
        $row->key = $key;
        $row->name = $name;
        $row->save();

        $historyArgsArr = [
            'topicName' => 'system.lists.general.city_departments.add',
            'models' => [
                [
                    'referenced_model' => 'CityDepartments',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.CityDepartments.name'),
                            'new_value' => $row->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }
    
    /* CsvSource */

	/* 
		Function that returns all CsvSources
	*/
    public function getCsvSource() {
        $jsonOutput = app()->make("JsonOutput");
        $result = CsvSources::select('id', 'key', 'name', 'system_name')->where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/* 
		Function that deletes existing CsvSource by its key  
	*/
    public function deleteCsvSource(Request $request, $key) {

        $jsonOutput = app()->make("JsonOutput");
        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $itemId = CsvSources::select('id')->where('key', $key)->first()['id'];

        if (!$itemId) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }
        $isItemInUse = \App\Models\CsvFiles::select('id')->where('csv_source_id', $itemId)->first();

        if ($isItemInUse) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;
        }

        $item = CsvSources::select('id', 'name', 'system_name')->where('key', $key)->first();
        if ($item->system_name != null) {
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
            return;            
        }

        $item->update(['deleted' => 1]);

        $historyArgsArr = [
            'topicName' => 'elections.import.csv_sources.delete',
            'models' => [
                [
                    'referenced_model' => 'CsvSource',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $item->id
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }

	/* 
		Function that updates existing CsvSource by its key and POST params
	*/
    public function updateCsvSource(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (!$key) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            return;
        }

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $item = CsvSources::select('id', 'name', 'system_name')->where('key', $key)->first();
        if (!$item) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_PARAMS'));
            return;            
        }
        if ($item->system_name != null) {
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
            return;            
        }

        CsvSources::where('key', $key)->update(['name' => $name]);

        if ( $name != $item->name ) {
            $historyArgsArr = [
                'topicName' => 'elections.import.csv_sources.edit',
                'models' => [
                    [
                        'referenced_model' => 'CsvSource',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $item->id,
                        'valuesList' => [
                            [
                                'field_name' => 'name',
                                'display_field_name' => config('history.CsvSource.name'),
                                'old_value' => $item->name,
                                'new_value' => $name
                            ]
                        ]
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData('');
    }

	/* 
		Function that adds new CsvSource by POST params
	*/
    public function addCsvSource(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $name = trim($request->input('name'));

        if (strlen($name) < 2) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            return;
        }

        $key = Helper::getNewTableKey('csv_sources', 5);
        $CsvSource = new CsvSources;
        $CsvSource->key = $key;
        $CsvSource->name = $name;
        $CsvSource->save();

        $historyArgsArr = [
            'topicName' => 'elections.import.csv_sources.add',
            'models' => [
                [
                    'referenced_model' => 'CsvSource',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $CsvSource->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.CsvSource.name'),
                            'new_value' => $CsvSource->name
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData('');
    }
    public function getAllElectionCampaigns(){

        $jsonOutput = app()->make("JsonOutput");
        $resultArray = ListsService::getAllElectionCampaigns();
        $jsonOutput->setData($resultArray);
    }

	public function getAllElectionRoles(){
        $jsonOutput = app()->make("JsonOutput");
        $resultArray = ListsService::getAllElectionRoles();
        $jsonOutput->setData($resultArray);
    }
    	/*
	Function that will return array of ballot-box roles
	*/
	public function getBallotBoxRoles(){
		$jsonOutput = app()->make("JsonOutput");
		$result = ListsService::getBallotBoxRoles();
		$jsonOutput->setData($result);
	}

	/*
	Function that will return array of all elections roles
	*/
	public function getAllElectionsRoles(){
        $jsonOutput = app()->make("JsonOutput");
		$result = ListsService::getAllElectionRoles();
		$jsonOutput->setData($result);
    }
    public function getAllElectionRoleShifts(){
        $jsonOutput = app()->make("JsonOutput");

        $fields = ['id', 'key', 'name', 'system_name'];
        $resultArray = ElectionRoleShifts::select($fields)->where('deleted', 0)->get();

        $jsonOutput->setData($resultArray);
    }	
	

    public function getPaymentStatus(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $listPaymentType=PaymentStatus::select()->get();
        $jsonOutput->setData($listPaymentType);
    }

    public function getPaymentType(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $listPaymentType=PaymentType::select()->get();
        $jsonOutput->setData($listPaymentType);
    }

    public function getListShasBank(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $listShasBank=ShasBankDetailsService::getListShasBankDetails();
        $jsonOutput->setData($listShasBank);
    }

    public function getListElectionCampaign(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $listElection=ElectionCampaignsService::getListAllElectionCampaign();
    $jsonOutput->setData($listElection);
    }

    public function getListPaymentTypeAdditional(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $listElection=PaymentTypeAdditional::select()->get();
        $jsonOutput->setData($listElection);
    }

    public function getListReasonPaymentStatus(Request $request, $paymentStatusId=null)
    {  
        $jsonOutput = app()->make("JsonOutput");
        $listReason = ReasonPaymentStatusRepository::getAll($paymentStatusId);
        $jsonOutput->setData($listReason);
    }
    
}
