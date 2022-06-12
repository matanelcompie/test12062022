<?php

namespace App\Libraries\Services;


use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\VoterFilter\GeographicVoterFilter;
use App\Models\GeographicFilters;
use App\Models\ElectionCampaigns;
use App\Models\RolesByUsers;
use Illuminate\Database\Eloquent\Collection;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GeoFilterService
{
    public static function getInitOptions($screenPermission)
    {
        $userGeoFilters = self::getGeoFiltersForUser($screenPermission);
        // dd($userGeoFilters);
        $areasIDS = $userGeoFilters['areasIDS'];
        $citiesIDS = $userGeoFilters['citiesIDS'];
        $sub_areasIDS = $userGeoFilters['sub_areasIDS'];

        $cities = City::select('id', 'key', 'name', 'mi_id', 'area_id', 'sub_area_id', 'district')
        ->orderBy('name', 'asc')->where('deleted', DB::Raw('0'));

        $areas = Area::select('id', 'key', 'name')
        ->orderBy('name', 'asc')->where('deleted', DB::Raw('0'));

        $subAreas = SubArea::select('id', 'key', 'name', 'area_id')
        ->orderBy('name', 'asc')->where('deleted', DB::Raw('0'));

        $cities = $cities->whereIn('id', $citiesIDS);

        if($sub_areasIDS){
            $subAreas = $subAreas->whereIn('id', $sub_areasIDS);
            $cities = $cities->whereIn('sub_area_id', $sub_areasIDS);
        }

        $areas = $areas->whereIn('id', $areasIDS);
        $subAreas = $subAreas->whereIn('area_id', $areasIDS);


        $areas = $areas->get();
        $subAreas = $subAreas->get();
        $cities = $cities->get();
        
        return [
            'area' => $areas,
            'sub_area' => $subAreas,
            'city' => $cities,
            'neighborhood' => [],
            'cluster' => [],
            'ballot_box' => [],
        ];
    }

    /**
     * @method getGeoFiltersForUser
     * function return all geo type -
     * city/area/sub area that allow for user by name permission
     * @param string screenPermission-option in permissions
     * @param bool getGeoAreasIds if return area id that allow in permission  
     * @param bool getGeoSubAreasIds if return sub area id list
     * @param bool getGeoCitiesIds if return cities id list
     * 
     * @return array
     */
    public static function getGeoFiltersForUser($screenPermission = null, $getGeoAreasIds = true, $getGeoSubAreasIds = true, $getGeoCitiesIds = true){
        
        $geoFilters = self::getGeographicFilters($screenPermission);
        $areasIDS = [];
        $sub_areasIDS = [];
        $citiesIDS = [];

        $allGeoFilters = false;
        if (sizeof($geoFilters) > 0) {

            foreach ($geoFilters as $geoFilterRow) {

                if ($getGeoAreasIds) {
                    if ($geoFilterRow->area_id != null && array_search($geoFilterRow->area_id, $areasIDS) == false) {
                        array_push($areasIDS, $geoFilterRow->area_id);
                    }
                }
                if ($getGeoSubAreasIds) {
                    if ($geoFilterRow->sub_area_id != null && array_search($geoFilterRow->sub_area_id, $sub_areasIDS) == false) {
                        array_push($sub_areasIDS, $geoFilterRow->sub_area_id);
                    }
                }
                if ($getGeoCitiesIds || $getGeoSubAreasIds) {
                    if ($geoFilterRow->city_id != null && array_search($geoFilterRow->city_id, $citiesIDS) == false) {
                        array_push($citiesIDS, $geoFilterRow->city_id);
                    }

                    $areaGroupType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP');
                    $areaType = config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA');
                    $subAreaType = config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA');
                    // dump($geoFilterRow->toArray());
                    $highEntitiesList = [$areaType , $subAreaType, $areaGroupType];

                    if(in_array($geoFilterRow->entity_type, $highEntitiesList)){
                        $cities = City::select('cities.id')->where('cities.deleted', 0);
                        $subAreas = SubArea::select('sub_areas.id')->where('sub_areas.deleted', 0);

                        switch($geoFilterRow->entity_type){
                            case $areaGroupType:
                                $areaIdList = AreasGroup::getAllAreas($geoFilterRow->entity_id);

                                $cities->whereIn('area_id', $areaIdList);

                                $subAreas->whereIn('area_id', $areaIdList);

                                foreach($areaIdList as $areaId){
                                    if (array_search($areaId, $areasIDS, true) == false) {
                                        array_push($areasIDS, $areaId);
                                    }
                                }

                                break;
                            case $areaType:
                                $cities->where('area_id', $geoFilterRow->entity_id);
                                $subAreas->where('area_id', $geoFilterRow->entity_id);
                                break;
                            case $subAreaType:
                                $cities->where('sub_area_id', $geoFilterRow->entity_id);
                                $subAreas->where('id', $geoFilterRow->entity_id);
                                break;
                        }
                        $cities = $cities->get();
                        $subAreas = $subAreas->get();

                        foreach ($cities as $city) {
                            if (array_search($city->id, $citiesIDS, true) == false) {
                                array_push($citiesIDS, $city->id);
                            }
                        }
                        foreach ($subAreas as $subArea) {
                            if (array_search($subArea->id, $sub_areasIDS, true) == false) {
                                array_push($sub_areasIDS, $subArea->id);
                            }
                        }
                    }

                }
            }
            // dd($citiesIDS);
        }
        // dd($areasIDS, $sub_areasIDS ,$citiesIDS);
        return [
            'areasIDS' => $areasIDS ,
            'sub_areasIDS' => $sub_areasIDS ,
            'citiesIDS' => $citiesIDS,
        ];
    }
    /**
     * This function gets the geographical
     * filters of the current user.
     *
    */
    public static function getGeographicFilters($screenPermission = null)
    {
        $roleIds = null;
        $user = Auth::user();
        if(!$user->admin && $screenPermission){
            $rolesByUsers = RolesByUsers::select('roles_by_users.id')
            ->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
            ->join('permissions_in_user_roles', 'permissions_in_user_roles.user_role_id', '=', 'user_roles.id')
            ->join('permissions', 'permissions.id', '=', 'permissions_in_user_roles.permission_id')
            ->where('roles_by_users.user_id', $user->id)
            ->where('permissions.operation_name', $screenPermission)
            ->get();
            $roleIds = [];
            foreach ($rolesByUsers as $userRole) { $roleIds[]= $userRole->id; }
        }
        $geographicFilters = self::getAllUserGeoFilters(true, $roleIds);

        return $geographicFilters;
    }
    public static function getOptions($entityType, $entityId, $partial = false)
    {
		$currentElectionCampaign =ElectionCampaigns::currentCampaign()->id;
		$last_campaign_id = $currentElectionCampaign;  
		
		
        // First, we collect the appropriate Laravel model for our entity type
        $entityClass = GeographicVoterFilter::ENTITY_TYPES[$entityType]['model'];
        // Then, if we have a valid Laravel model, we can simply find the instance via ID
        $entity = $entityClass::find($entityId);
 
        $response = []; // prepare the response array

        $getEntitiesForCluster = false;
        switch ($entityType) {
            case 'ballot_box':
			
                if ($partial) {break;} // if we're only here for the children, we're done - break out of the switch
                // Here, we don't have any child options to collect, so we simply move up the tree
                $getEntitiesForCluster = true;
                $clusterEntity = Cluster::find($entity->cluster_id);
                $response['ballot_box'] = $clusterEntity->ballotBoxes; // collect all the ballot boxes for this cluster

				break;
            case 'cluster':
                $response['ballot_box'] = $entity->ballotBoxes; // collect all the ballot boxes for this cluster
                if ($partial) {break;} // if we're only here for the children, we're done - break out of the switch
                $getEntitiesForCluster = true;
                $clusterEntity = $entity;
				break;
            case 'neighborhood':
                // since we're using the fall-through switch behavior, we should check how we got here
                if (get_class($entity) == Neighborhood::class) {
                    $response['cluster'] = $entity->clusters; // collect all clusters for this neighborhood
                    for($k = 0 ; $k < count($entity->clusters) ; $k++){
						$entity->clusters[$k]->name = $entity->clusters[$k]->name ." , ".$entity->clusters[$k]->street;
					}
					  
					//$response['ballot_box'] = BallotBox::select("id","key","cluster_id","crippled","ballot_box_role_id")->selectRaw("IF(LENGTH(ballot_boxes.mi_id) = 1 , CONCAT(ballot_boxes.mi_id,'.0') , CONCAT(SUBSTR(ballot_boxes.mi_id , 1 , LENGTH(ballot_boxes.mi_id) - 1) , '.',SUBSTR(ballot_boxes.mi_id , LENGTH(ballot_boxes.mi_id),1))) as mi_id")->whereRaw('cluster_id in (select id from clusters where neighborhood_id='.$entityId.' and election_campaign_id='.$currentElectionCampaign.')');
					//$response['ballot_box'] = $response['ballot_box']->orderBy('ballot_boxes.mi_id','asc')->get();
					if ($partial) {break;} // as before, break out when appropriate
                    $entity = $entity->city; // and if we're still here, we need to move on
					
				}
				break;
            case 'city':
			
                if (isset($response['cluster']) && get_class($response['cluster']) == Collection::class) {
					// if the clusters are a Laravel collection, we stopped by neighborhood first,
                    // and we should perform a union instead of direct assignment
					$response['cluster'] = $response['cluster']->merge($entity->clusters);
                } else {
					 
					$clustersIDSArray=[];
					$neighborhoodsIDSArray=[];
					$ballotsIDSArray=[];
		
					if(Auth::user()['admin'] != '1'){
		 
                        $geographicFilters = self::getAllUserGeoFilters();

			
						for($i = 0 ; $i < sizeof($geographicFilters);$i++){
							$item = $geographicFilters[$i];
							switch($item->entity_type){
                                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                                    $areaIdList = AreasGroup::getAllAreas($item->entity_id);
                                    // dd($areaIdList);
                                    if(!empty($areaIdList)){
                                        $whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';
                                        $clustersArr = Cluster::select('id')->whereRaw("city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery )")->get();
                                        for($s = 0;$s<count($clustersArr) ; $s++){
                                            array_push($clustersIDSArray , $clustersArr[$s]->id);
                                        }
                                        
                                        $neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw("city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery )")->get();
                                        for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                                            array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                                        }
                                        $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted = 0 and area_id $whereInIdsQuery))")->get();
                                        for($s = 0;$s<count($ballotsArr) ; $s++){
                                            array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                                        }
                                    }
                                    break;
								case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
									$clustersArr = Cluster::select('id')->whereRaw('city_id in (select id from cities where deleted=0 and sub_area_id='.$item->entity_id.')')->get();
									for($s = 0;$s<sizeof($clustersArr) ; $s++){
										array_push($clustersIDSArray , $clustersArr[$s]->id);
									}
						
									$neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw('city_id in (select id from cities where deleted=0 and sub_area_id='.$item->entity_id.')')->get();
									for($s = 0;$s<sizeof($neighborhoodsArr) ; $s++){
										array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
									}
									$ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted = 0 and sub_area_id=".$item->entity_id."))")->get();
									for($s = 0;$s<sizeof($ballotsArr) ; $s++){
										array_push($ballotsIDSArray , $ballotsArr[$s]->id);
									}	
									break;
								case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
									$clustersArr = Cluster::select('id')->where('city_id' , $item->entity_id)->where('election_campaign_id',$last_campaign_id)->get();
									for($s = 0;$s<sizeof($clustersArr) ; $s++){
										array_push($clustersIDSArray , $clustersArr[$s]->id);
									}
									$neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->where('city_id' , $item->entity_id)->whereRaw("neighborhoods.id in (select neighborhood_id from clusters where election_campaign_id=".$last_campaign_id.")")->get();
									for($s = 0;$s<sizeof($neighborhoodsArr) ; $s++){
										array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
									}
									$ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id =".$item->entity_id.")")->get();
									for($s = 0;$s<sizeof($ballotsArr) ; $s++){
										array_push($ballotsIDSArray , $ballotsArr[$s]->id);
									}
									break;
								case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
									$clustersArr = Cluster::select('id')->where('neighborhood_id' , $item->entity_id)->get();
									for($s = 0;$s<sizeof($clustersArr) ; $s++){
										array_push($clustersIDSArray , $clustersArr[$s]->id);
									}
									array_push($neighborhoodsIDSArray ,  $item->entity_id);
									$ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and neighborhood_id =".$item->entity_id.")")->get();
									for($s = 0;$s<sizeof($ballotsArr) ; $s++){
										array_push($ballotsIDSArray , $ballotsArr[$s]->id);
									}
									break;
								case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
									$clustersArr = Cluster::select('id')->where('id' , $item->entity_id)->get();
									for($s = 0;$s<sizeof($clustersArr) ; $s++){
										array_push($clustersIDSArray , $clustersArr[$s]->id);
									}
									$neighborhoodsArr = Cluster::select('neighborhood_id')->where('clusters.neighborhood_id' , $item->entity_id)->get();
									for($s = 0;$s<sizeof($neighborhoodsArr) ; $s++){
										array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
									}
									$ballotsArr=BallotBox::select('ballot_boxes.id')->where("cluster_id",$item->entity_id)->get();
									for($s = 0;$s<sizeof($ballotsArr) ; $s++){
										array_push($ballotsIDSArray , $ballotsArr[$s]->id);
									}
									break;
								case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
									$clustersArr = BallotBox::select('cluster_id')->where('id' , $item->entity_id)->get();
									for($s = 0;$s<sizeof($clustersArr) ; $s++){
										array_push($clustersIDSArray , $clustersArr[$s]->cluster_id);
									}
									$neighborhoodsArr = Neighborhood::select('id')->whereRaw('id in (select neighborhood_id from clusters where id in (select cluster_id from ballot_boxes where id='.$item->entity_id.'))')->get();
									for($s = 0;$s<sizeof($neighborhoodsArr) ; $s++){
										array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->cluster_id);
									}
									array_push($ballotsIDSArray , $item->entity_id);
									break;
							}
						}
					}

                    // otherwise, just collect all clusters for this city
                    $clusters=$entity->clusters()->where('election_campaign_id',$currentElectionCampaign);
					if(sizeof($clustersIDSArray) > 0){
						$clusters = $clusters->whereIn('clusters.id',$clustersIDSArray);
					}
					$clusters = $clusters->orderBy('clusters.name' , 'asc')->get();
                    $clusters->each(function ($row) {
                        $row['name']=$row['name'] . ', '.$row['street'];
                        $row->setHidden(['created_at', 'updated_at','leader_id','old_id','street_id','mi_id','street','house']);
                    });
                    $response['cluster'] = $clusters;
                }
				 
                // lastly, collect all neighborhoods for this city
                $response['neighborhood'] = $entity->neighborhoods()/*->whereRaw("neighborhoods.id in (select neighborhood_id from clusters where election_campaign_id=".$last_campaign_id.")")*/->where('deleted', 0);
				if(sizeof($neighborhoodsIDSArray) > 0){
					$response['neighborhood'] = $response['neighborhood']->whereIn('neighborhoods.id',$neighborhoodsIDSArray);
				}
				$response['neighborhood'] = $response['neighborhood']->orderBy('neighborhoods.name' , 'asc')->get();
				$response['ballot_box'] = BallotBox::select("id","key","cluster_id","crippled","ballot_box_role_id")->selectRaw("IF(LENGTH(ballot_boxes.mi_id) = 1 , CONCAT(ballot_boxes.mi_id,'.0') , CONCAT(SUBSTR(ballot_boxes.mi_id , 1 , LENGTH(ballot_boxes.mi_id) - 1) , '.',SUBSTR(ballot_boxes.mi_id , LENGTH(ballot_boxes.mi_id),1))) as mi_id")->whereRaw('cluster_id in (select id from clusters where city_id='.$entityId.' and election_campaign_id='.$currentElectionCampaign.')');
				if(sizeof($ballotsIDSArray) > 0){
					$response['ballot_box']= $response['ballot_box']->whereIn('ballot_boxes.id',$ballotsIDSArray);
				}
				$response['ballot_box'] = $response['ballot_box']->orderBy('ballot_boxes.mi_id','asc')->get();
				break;
        }

        if($getEntitiesForCluster && !$partial){
			
            $clusterCity = City::find($clusterEntity->city_id);
            if ($clusterEntity->neighborhood_id) {
                // if this cluster has a specific neighborhood defined,
                // we should go there to collect clusters first
                $response['cluster'] = Neighborhood::find($clusterEntity->neighborhood_id)->clusters; // collect all clusters for this neighborhood
            } else {
                // if neighborhood is null (or deleted), skip to the city
                $response['cluster'] = $clusterCity->clusters; // collect all clusters for this neighborhood
            }
            $response['neighborhood'] = $clusterCity->neighborhoods()->where('deleted', 0)->get();
        }
        return $response;
    }
    public static function getAllUserGeoFilters($withGeoEntities = true, $roleIds = null){
        $geographicFilters = [];

        if($withGeoEntities) {
            $fields = [
                'geographic_filters.id',
                'geographic_filters.key',
                'geographic_filters.name',
                'geographic_filters.entity_type',
                'geographic_filters.entity_id',
                'cities.id as city_id',
                'cities.key as city_key',
                'cities.name as city_name',
                'sub_areas.id as sub_area_id',
                'sub_areas.name as sub_area_name',
                'areas.id as area_id',
                'areas.name as area_name'
            ];
            $geographicFilters = GeographicFilters::select($fields)
                                    ->withRoles()->withBallotBoxes()->withClusters()->withNeighborhoods()
                                    ->withCities()->withSubAreas()->withAreas()
                                    ->where(['roles_by_users.user_id' => Auth::user()->id, 'roles_by_users.deleted' => 0])
                                    ->where(function($query) {
                                       $query->orWhere('geographic_filters.inherited_id', '>=', '0')
                                             ->orWhereRaw(" (geographic_filters.inherited_id is NULL and not exists (select id from geographic_filters  as g1 where g1.inherited_id = geographic_filters.id)) ");
                                    });
            if($roleIds){
                $geographicFilters->whereIn('roles_by_users.id',$roleIds);
            }
            $geographicFilters= $geographicFilters->get();
    
        } else {
            $fields = [
                'geographic_filters.id',
                'geographic_filters.key',
                'geographic_filters.name',
                'geographic_filters.entity_type',
                'geographic_filters.entity_id',
            ];
            $geographicFilters = GeographicFilters::select($fields)->withRoles()
                                    ->where(['roles_by_users.user_id' => Auth::user()->id, 'roles_by_users.deleted' => 0])
                                    ->where(function($query) {
                                        $query->orWhere('geographic_filters.inherited_id', '>=', '0')
                                                ->orWhereRaw(" (geographic_filters.inherited_id is NULL and not exists (select id from geographic_filters  as g1 where g1.inherited_id = geographic_filters.id)) ");
                                        })->get();
        }

        return $geographicFilters;

    }
}
