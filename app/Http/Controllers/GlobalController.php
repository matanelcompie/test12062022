<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Libraries\Helper;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\GeographicFilters;
use App\Models\RolesByUsers;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;
use Illuminate\Support\Facades\Auth;

use App\Libraries\Services\GeoFilterService;
 

/**
 * Class GlobalController
 * This controller handles global actions
 * in all controllers type - it contain static functions only
 *
 * @package App\Http\Controllers
 */
class GlobalController extends Controller {
	/*
		Function that returns for user his filtered votergroups by their permissions
	*/
	public static function FilterVoterGroupsByPermissions($originalVoterGroupsArray){
		
		//set variables
		$user = Auth::user();
		$geographicFilters = null;
		//set hash map for teams roles
		$teamsRolesHash = [];
		 if($user['admin'] == '1'){return $originalVoterGroupsArray;}
		 $returnedValue = [];
		 for($k = 0 ; $k < sizeof($originalVoterGroupsArray) ;  $k++){
			 switch($originalVoterGroupsArray[$k]->permission_type){
				 case config('constants.VOTER_GROUP_PERMISSION_TYPE_NONE'): 
					array_push($returnedValue,$originalVoterGroupsArray[$k]);
					break;
				 case config('constants.VOTER_GROUP_PERMISSION_TYPE_GEOGRAPHIC'):
					$voterGroupPermissionsItem = $originalVoterGroupsArray[$k]->voterGroupPermissions;
					//only load user geo filters once
					if ($geographicFilters == null) {
						$geographicFilters = GeoFilterService::getAllUserGeoFilters(false);
					}


					if(sizeof($geographicFilters) == 0){array_push($returnedValue,$originalVoterGroupsArray[$k]);}
					else{
						for($i = 0 ; $i < sizeof($voterGroupPermissionsItem) ; $i++){
							for ($j = 0 ; $j < sizeof($geographicFilters) ; $j++){
								if($geographicFilters[$j]->entity_type == $voterGroupPermissionsItem[$i]->entity_type && $geographicFilters[$j]->entity_id == $voterGroupPermissionsItem[$i]->entity_id){
									array_push($returnedValue , $originalVoterGroupsArray[$k]); 
									break 2;
								}
								elseif($geographicFilters[$j]->entity_type > $voterGroupPermissionsItem[$i]->entity_type){
									switch($voterGroupPermissionsItem[$i]->entity_type){
										case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
											$voterPermisionCity = City::select("area_id")->where('id' , $voterGroupPermissionsItem[$i]->entity_id)->first();
											if($voterPermisionCity && ($voterPermisionCity->area_id == $geographicFilters[$j]->entity_id)){
												array_push($returnedValue , $originalVoterGroupsArray[$k]); 
												break 2;
											}
											break;
										case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
											if($geographicFilters[$j]->entity_type == config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA')){
												$voterPermisionNeighborhood = Neighborhood::select("city_id")->where('id' , $voterGroupPermissionsItem[$i]->entity_id)->first();
												if($voterPermisionNeighborhood){
													$voterPermisionCity = City::select("area_id")->where('id' , $voterPermisionNeighborhood[$i]->city_id)->first();
													if($voterPermisionCity && ($voterPermisionCity->area_id == $geographicFilters[$j]->entity_id)){
														array_push($returnedValue , $originalVoterGroupsArray[$k]); 
														break 2;
													}
												}
											}
											elseif($geographicFilters[$j]->entity_type == config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY')){ //else - this ic city
												$voterPermisionNeighborhood = Neighborhood::select("city_id")->where('id' , $voterGroupPermissionsItem[$i]->entity_id)->first();
												if($voterPermisionNeighborhood && ($voterPermisionNeighborhood->city_id == $geographicFilters[$j]->entity_id)){
													array_push($returnedValue , $originalVoterGroupsArray[$k]); 
													break 2;
												}
											}
											break;
									}
								}
							}
						}
					}
					break;
				 case config('constants.VOTER_GROUP_PERMISSION_TYPE_TEAM'):
				    $voterGroupPermissionsItem = $originalVoterGroupsArray[$k]->voterGroupPermissions;
					if(sizeof($voterGroupPermissionsItem) == 0){array_push($returnedValue,$originalVoterGroupsArray[$k]);}
					$teamsIDSArray = [];
					for($j = 0 ; $j< sizeof($voterGroupPermissionsItem) ; $j++){
						array_push($teamsIDSArray , $voterGroupPermissionsItem[$j]->team_id); 
					}
					//calculate roles by user for teams and save to hash map for later uses
					$roleByUserCount = 0;
					$teamsIDsString = implode(",", $teamsIDSArray);
					if (!isset($teamsRolesHash[$teamsIDsString])) {
						$roleByUserCount = RolesByUsers::where('user_id' , $user['id'])->whereIn('team_id' ,$teamsIDSArray )->where('deleted' , 0)->count();
						$teamsRolesHash[$teamsIDsString] = $roleByUserCount;
					} else {
						$roleByUserCount = $teamsRolesHash[$teamsIDsString];
					}
					if($roleByUserCount > 0){
						array_push($returnedValue , $originalVoterGroupsArray[$k]); 
					}
					break;
				case config('constants.VOTER_GROUP_PERMISSION_TYPE_USER'):
					$voterGroupPermissionsItem = $originalVoterGroupsArray[$k]->voterGroupPermissions;
					for($j = 0 ; $j< sizeof($voterGroupPermissionsItem) ; $j++){
						if($voterGroupPermissionsItem[$j]->user_id ==  $user['id']){
							$roleByUserItem = RolesByUsers::where('user_id' , $user['id'])->where('team_id' , $voterGroupPermissionsItem[$j]->team_id )->where('deleted',0)->first();
							if($roleByUserItem){
								array_push($returnedValue , $originalVoterGroupsArray[$k]); 
								break;
							}
						}
					}
					break;
					
			 }
		 }
		 return $returnedValue;
	 }						
	 
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
	public static function isAllowedCitiesForUser($cityKey){
		$cityFieldsList = ['cities.id as city_id'];
		$citiesKeysArrayList = [];
		$isMultipleCities = \is_array($cityKey);
		if($isMultipleCities){
			$response = false;
			$citiesKeysArrayList = $cityKey;
		} else {
			$response = true;
			$citiesKeysArrayList[] = $cityKey;
		}

		 $geographicFilters = GeoFilterService::getAllUserGeoFilters(false);

	     	 
		 $isAllowed = false;
		$areaGroupType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP');
		$areaType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
		$subAreaType = config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
		$cityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');

		// dd($geographicFilters->toArray());
		 foreach($geographicFilters as $geoFilter){

			$cities = City::select('cities.id')
			->whereIn('cities.key' , $citiesKeysArrayList)
			->where('cities.deleted' , 0);

			
			 switch($geoFilter->entity_type){
				case $areaGroupType:
					$cities->withAreas()
					->where('areas.deleted', 0)
					->where('areas_group_id' , $geoFilter->entity_id);
					break;
				case $areaType:
					$cities->where('cities.area_id' , $geoFilter->entity_id);
					break;
				case $subAreaType:
					$cities->where('cities.sub_area_id' , $geoFilter->entity_id);
					break;
				case $cityType:
					$cities->where('cities.id' , $geoFilter->entity_id);
					break;
				default:
				continue;
			 }
			 $cities = $cities->get();

			 if($isMultipleCities){
				 foreach($cities as $c){ $response[] = $c->id; }
			 } else {
				if(count($cities)> 0){ return true; }
			 }

		 }
		//  dd($response);
		return $response ;
	}


/*
	Function that returns for not-admin user ONLY all entities ids by his geographic filters : 
*/	
public static function getNotAdminGeoEntitiesIDS(){

		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		$returnedArr = [];
		$returnedArr["allowed_areas_ids"]=[];
		$returnedArr["allowed_sub_areas_ids"]=[];
		$returnedArr["allowed_cities_ids"]=[];
		$returnedArr["allowed_neighborhoods_ids"]=[];
		$returnedArr["allowed_clusters_ids"]=[];
		$returnedArr["allowed_ballots_ids"]=[];
		
		$geographicFilters = GeoFilterService::getAllUserGeoFilters(false);

											
		foreach($geographicFilters as $key=>$item){
				
			$cities = [];
			$clusters = [];
			$ballotBoxes = [];
			switch($item->entity_type){
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
					$areaIdList = AreasGroup::getAllAreas($item->entity_id);
					// dd($areaIdList);
					$whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';
					
					foreach($areaIdList as $areaId){
						if(!in_array($areaId, $returnedArr["allowed_areas_ids"])){
							array_push( $returnedArr["allowed_areas_ids"] , $areaId);
						}
					}
					
					$cities = City::select('cities.id')->join('areas','areas.id','=','cities.area_id')->whereIn('areas.id', $areaIdList)
					->where('cities.deleted',0)->where('areas.deleted',0)->get();
					$clusters = Cluster::select('clusters.id')->join('cities','cities.id','=','clusters.city_id')->join('areas','areas.id','=','cities.area_id')
					->where('clusters.election_campaign_id', $currentCampaign)->whereIn('areas.id', $areaIdList)->where('cities.deleted',0)
					->where('areas.deleted',0)->get();
					$ballotBoxes = BallotBox::select('ballot_boxes.id')->withCluster()->join('cities','cities.id','=','clusters.city_id')
					->join('areas','areas.id','=','cities.area_id')->where('clusters.election_campaign_id', $currentCampaign)->whereIn('areas.id', $areaIdList)
					->where('cities.deleted',0)->where('areas.deleted',0)->get();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
					if(!in_array($item->entity_id,$returnedArr["allowed_sub_areas_ids"])){
						array_push( $returnedArr["allowed_areas_ids"] , $item->entity_id);
					}
					$cities = City::select('cities.id')
					->join('sub_areas','sub_areas.id','=','cities.sub_area_id')
					->where('sub_areas.id', $item->entity_id)->where('cities.deleted',0)->where('sub_areas.deleted',0)->get();
					$clusters = Cluster::select('clusters.id')->join('cities','cities.id','=','clusters.city_id')
					->join('sub_areas','sub_areas.id','=','cities.sub_area_id')
					->where('clusters.election_campaign_id', $currentCampaign)->where('sub_areas.id', $item->entity_id)->where('cities.deleted',0)->where('sub_areas.deleted',0)->get();
					$ballotBoxes = BallotBox::select('ballot_boxes.id')->withCluster()
					->join('cities','cities.id','=','clusters.city_id')
					->join('sub_areas','sub_areas.id','=','cities.sub_area_id')
					->where('clusters.election_campaign_id', $currentCampaign)->where('sub_areas.id', $item->entity_id)->where('cities.deleted',0)->where('sub_areas.deleted',0)->get();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
			 
					if(!in_array($item->entity_id,$returnedArr["allowed_cities_ids"])){
						array_push( $returnedArr["allowed_cities_ids"] , $item->entity_id);
					}
					$clusters = Cluster::select('clusters.id')->join('cities','cities.id','=','clusters.city_id')->where('clusters.election_campaign_id', $currentCampaign)->where('cities.id', $item->entity_id)->where('cities.deleted',0)->get();
					$ballotBoxes = BallotBox::select('ballot_boxes.id')->withCluster()->join('cities','cities.id','=','clusters.city_id')->where('clusters.election_campaign_id', $currentCampaign)->where('cities.id', $item->entity_id)->where('cities.deleted',0)->get();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
					if(!in_array($item->entity_id,$returnedArr["allowed_neighborhoods_ids"])){
						array_push( $returnedArr["allowed_neighborhoods_ids"] , $item->entity_id);
					}
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
					if(!in_array($item->entity_id,$returnedArr["allowed_clusters_ids"])){
						array_push( $returnedArr["allowed_clusters_ids"] , $item->entity_id);
					}
					$ballotBoxes = BallotBox::select('ballot_boxes.id')->withCluster()->where('clusters.election_campaign_id', $currentCampaign)->where('ballot_boxes.id', $item->entity_id)->get();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
					if(!in_array($item->entity_id,$returnedArr["allowed_ballots_ids"])){
						array_push( $returnedArr["allowed_ballots_ids"] , $item->entity_id);
					}
					break;
			}
			
			for($i = 0 ; $i < sizeof($cities);$i++){
				$item = $cities[$i];
				if(!in_array($item->id , $returnedArr["allowed_cities_ids"])){
					array_push($returnedArr["allowed_cities_ids"] ,$item->id );
				}
			}
			for($i = 0 ; $i < sizeof($clusters);$i++){
				$item = $clusters[$i];
				if(!in_array($item->id , $returnedArr["allowed_clusters_ids"])){
					array_push($returnedArr["allowed_clusters_ids"] ,$item->id );
				}
			}
			for($i = 0 ; $i < sizeof($ballotBoxes);$i++){
				$item = $ballotBoxes[$i];
				if(!in_array($item->id , $returnedArr["allowed_ballots_ids"])){
					array_push($returnedArr["allowed_ballots_ids"] ,$item->id );
				}
			}
		}
 
		return $returnedArr;
}

/*
	Function that returns list of current PID of processes
*/
public static function getCurrentPIDsArray(){
	$pids = [];
	$isWindowsOS = false;
	$os = php_uname();
    if ( preg_match('/Win/', $os) || preg_match('/win/', $os) ) {
        $isWindowsOS = true;
		exec("tasklist 2>NUL", $pids);
		array_splice($pids,0,3);
		for($i = 0 ; $i<count($pids);$i++){
			$whereToStart =substr($pids[$i] , 0 , strpos($pids[$i] , '  ' ));
			$whereToStart =  (strpos($pids[$i] , $whereToStart) + strlen($whereToStart));
			$pids[$i] = ltrim(substr($pids[$i] , $whereToStart));
			$pids[$i] = (substr($pids[$i] , 0 , strpos($pids[$i] , ' ')));
		}
       }
	else{
			exec("ps -ef | awk '{print $2}'", $pids);
	}
	return $pids;
}	
	
}
