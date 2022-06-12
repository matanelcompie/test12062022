<?php

namespace App\Http\Controllers\Tm;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use App\Libraries\Helper;
use App\Libraries\Services\GeoFilterService;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\City;
 use App\Models\GeographicFilters;
 
use Illuminate\Support\Facades\Auth;
 

/**
 * Class GlobalController
 * This controller handles global actions
 * in all controllers type - it contain static functions only
 *
 * @package App\Http\Controllers
 */
class GlobalController extends Controller {
	 

							
							
     /*
         Static function that gets as parameter operation name , and checks if user has permission for it.

         @param $operationName  
     */
    public static function isActionPermitted($operationName){
        $actionIsAllowed = false;
		$userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
                if ($permission->operation_name == $operationName) {
                    $actionIsAllowed = true;
                    break;
                }
        }
		if(!$actionIsAllowed && Auth::user()->admin != '1'){
            return false;
		}
        else{
              return true;
        }
    }
    

/*
	    static function that checks if city is permitted to user editing : 
		
		@param city
*/

public static function isAllowedCityForUser($cityKey){
	$cityFieldsList = ['cities.id as city_id' , 
		                    'cities.name as city_name' , 
							'cities.mi_id as city_mi_id',
							'areas.name as area_name' ,
							'teams.key as team_key' ,
							'teams.name as team_name' ,
							'voters.first_name',
							'voters.last_name',
							'voters.last_name',
							'user_phones.phone_number',
							'cities.district' , 
                            'headquarters_phone_number',
		                    ];

		 $city = City::select($cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
        

		 $userGeoFilters = GeoFilterService::getGeoFiltersForUser(null, false, false, true);
		 // dd(in_array($city->city_id, $userGeoFilters['citiesIDS']), $city->city_id);	 
		 return in_array($city->city_id, $userGeoFilters['citiesIDS']) ;
	}	
	
}
