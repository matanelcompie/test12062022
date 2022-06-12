<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\VoterElectionsController;

use App\Models\ElectionRoles;
use App\Models\AreasGroup;
use App\Models\City;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionRolesByVoters;
use App\Models\GeographicFilters;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

use App\Libraries\Services\ExportService;
use App\Libraries\Services\GeoFilterService;


class ClusterController extends Controller {
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
    }
	/*
		Priate helpful function that generates all roles that related to cluster
	*/
    private function getClusterElectionRolesFromDb() {
        $electionRoles = ElectionRoles::select(['id', 'key', 'name', 'system_name'])
            ->whereIn('system_name', [
                config('constants.activists.election_role_system_names.ministerOfFifty'),
                config('constants.activists.election_role_system_names.motivator'),
                config('constants.activists.election_role_system_names.driver'),
            ])
            ->get();

        return $electionRoles;
    }

	/*
		Function that retusns election-roles  that related to cluster
	*/
    public function getClusterElectionRoles() {
        $jsonOutput = app()->make( "JsonOutput" );

        $electionRoles = $this->getClusterElectionRolesFromDb();

        $jsonOutput->setData($electionRoles);
    }

	/*
		Function that returns clusters by city key
	*/
    public function getCityClusters($cityKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($cityKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
            return;
        }

        $cityObj = City::select(['id'])->where('key', $cityKey)->first();
        if ( is_null($cityObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
            return;
        } else if ( !GlobalController::isAllowedCitiesForUser($cityKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'clusters.id',
            DB::raw($this->fullClusterNameQuery),
            'clusters.neighborhood_id',

            'voters.key as leader_key'
        ];

        $clusters = Cluster::select($fields)
            // ->withElectionsRolesByVoters()
            ->withLeader()
            ->where(['clusters.city_id' => $cityObj->id, 'clusters.election_campaign_id' => $last_campaign_id])
            ;
        $clustersIDSArray=[];

            $geographicFilters = GeoFilterService::getAllUserGeoFilters();

			
			for($i = 0 ; $i < sizeof($geographicFilters);$i++){
				$item = $geographicFilters[$i];
				switch($item->entity_type){
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                        $areaIdList = AreasGroup::getAllAreas($item->entity_id);
                        $whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';

                        $clusterBallots = Cluster::select('id')
                        ->whereRaw("city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery)")
                        ->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                        $clusterBallots = Cluster::select('id')
                        ->whereRaw('city_id in (select id from cities where deleted=0 and area_id='.$item->entity_id.')')
                        ->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                        $clusterBallots = Cluster::select('id')
                        ->whereRaw('city_id in (select id from cities where deleted=0 and sub_area_id='.$item->entity_id.')')
                        ->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
						$clusterBallots = Cluster::select('id')->where('city_id' , $item->entity_id)->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
						$clusterBallots = Cluster::select('id')->where('neighborhood_id' , $item->entity_id)->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
						$clusterBallots = Cluster::select('id')->where('id' , $item->entity_id)->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->id);
						}
						break;
					case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
						$clusterBallots = BallotBox::select('cluster_id')->where('id' , $item->entity_id)->get();
						for($s = 0;$s<sizeof($clusterBallots) ; $s++){
							array_push($clustersIDSArray , $clusterBallots[$s]->cluster_id);
						}
						break;
				}
			}
        $clusters = $clusters->whereIn('clusters.id',$clustersIDSArray );
		
        $clusters  = $clusters->get();		
			
        $jsonOutput->setData($clusters);
    }

	/*
		Private helpful function that validates that value is integer
	*/
    private function validateIntInput($fieldName, $fieldValue) {
        $rules = [
            $fieldName => 'integer'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }
	/*
		Function that finds cluster leaders
	*/
    public function findClusterLeaders(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );
        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $personal_identity = $request->input('personal_identity', null);

        if (is_null($personal_identity) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SEARCH_LEADERS_MISSING_DATA'));
            return;
        }

        $fields = [
            'voters.id as leader_id',
            'voters.key as leader_key',
            'voters.first_name as leader_first_name',
            'voters.last_name as leader_last_name',
            'voters.personal_identity as leader_personal_identity',
            // 'leader_cities.name as leader_city',
        ];
        $where = [
            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
            'election_roles.system_name' => config('constants.activists.election_role_system_names.clusterLeader'),
            'voters.personal_identity' =>  $personal_identity
        ];
        $leaderObj = Cluster::select($fields)
            // ->withElectionsRolesByVoters()
            ->WithElectionRoles()
            ->withLeader(false)
            ->where($where)
            ->first();
        $jsonOutput->setData($leaderObj);

    }
	/*
		Function that returns data of search cluster leaders , by POST params
	*/
    public function searchClusterLeaders(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);

        $first_name = $request->input('first_name', null);
        $last_name = $request->input('last_name', null);
        $personal_identity = $request->input('personal_identity', null);

        if ( is_null($city_id) && is_null($personal_identity) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SEARCH_LEADERS_MISSING_DATA'));
            return;
        }

        if ( !is_null($city_id) ) {
            if ( !$this->validateIntInput('city_id', $city_id) ) {
                return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
            } else {
                $cityObj = City::select(['id', 'key'])->where('id', $city_id)->first();
                if ( is_null($cityObj) ) {
                    return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
                } else if ( !GlobalController::isAllowedCitiesForUser($cityObj->key) ) {
                    return config('errors.elections.STATUS_CHANGE_CITY_IS_NOT_ALLOWED_TO_USER');
                }
            }
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'voters.id as leader_id',
            'voters.key as leader_key',
            'voters.first_name as leader_first_name',
            'voters.last_name as leader_last_name',
            'voters.personal_identity as leader_personal_identity',
            'leader_cities.name as leader_city',

            DB::raw('count(distinct cluster_voters.household_id) as count_clusters_households')
        ];

        $leaderObj = Cluster::select($fields)
            // ->withElectionsRolesByVoters()
            ->withLeader(false)
            ->withLeaderCity()
            ->WithElectionRoles()
            ->withBallotBoxes()
            ->withHouseholds();

        $where = [
            'clusters.election_campaign_id' => $last_campaign_id,
            'election_roles.system_name' => config('constants.activists.election_role_system_names.clusterLeader')
        ];

        if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        }

        if ( !is_null($first_name) ) {
            $where['voters.first_name'] = $first_name;
        }

        if ( !is_null($last_name) ) {
            $where['voters.last_name'] = $last_name;
        }

        if ( !is_null($personal_identity) ) {
            $where['voters.personal_identity'] = $personal_identity;
        }

        $leaderObj->where($where)
            ->groupBy('clusters.leader_id');
        $total_records = DB::table(DB::Raw('( ' . $leaderObj->toSql() . ' ) AS t1'))
            ->setBindings([$leaderObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $records = $leaderObj->get();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $records
        ];

        $jsonOutput->setData($result);
    }

	/*
		Private helpful function that validates personal_identity
	*/
    private function validatePersonalIdentity($personalIdentity) {
        $pattern = '/^[0-9]{2,10}$/';

        return preg_match($pattern, $personalIdentity);
    }

	/*
		Private helpful function that validates election_roles
	*/
    private function validateElectionRoles($selected_roles) {
        $electionRoles = $this->getClusterElectionRolesFromDb();

        $electionRolesHash = [];
        for ( $roleIndex = 0; $roleIndex < count($electionRoles); $roleIndex++ ) {
            $electionRoleKey = $electionRoles[$roleIndex]->key;

            $electionRolesHash[$electionRoleKey] = $electionRoles[$roleIndex];
        }

        for ( $selectedIndex = 0; $selectedIndex < count($selected_roles); $selectedIndex++ ) {
            $selectedRoleKey = $selected_roles[$selectedIndex];

            if ( !isset($electionRolesHash[$selectedRoleKey]) ) {
                return false;
            }
        }

        return true;
    }

	/*
		Private helpful function that validate POST data of needed report
	*/
    private function validateClusterActivistReportData(Request $request) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $neighborhood_id = $request->input('neighborhood_id', null);

        $personal_identity = $request->input('personal_identity', null);

        $selected_roles = $request->input('selected_roles', null);

        if ( is_null($area_id) && is_null($personal_identity) ) {
            return config('errors.elections.SEARCH_LEADERS_MISSING_DATA');
        }

        if ( !is_null($area_id) && !$this->validateIntInput('area_id', $area_id) ) {
            return config('errors.global.AREA_NOT_EXISTS');
        }

        if ( !is_null($sub_area_id) && !$this->validateIntInput('sub_area_id', $sub_area_id) ) {
            return config('errors.system.SUB_AREA_DOESNT_EXIST');
        }

        if ( !is_null($sub_area_id) &&  $neighborhood_id && !$this->validateIntInput('neighborhood_id', $neighborhood_id) ) {
            return config('errors.global.NEIGHBORHOOD_NOT_EXISTS');
        }

        if ( !is_null($city_id) ) {
            if ( !$this->validateIntInput('city_id', $city_id) ) {
                return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
            } else {
                $cityObj = City::select(['id', 'key'])->where('id', $city_id)->first();
                if ( is_null($cityObj) ) {
                    return config('errors.elections.STATUS_CHANGE_INVALID_CITY');
                } else if ( !GlobalController::isAllowedCitiesForUser($cityObj->key) ) {
                    return config('errors.elections.STATUS_CHANGE_CITY_IS_NOT_ALLOWED_TO_USER');
                }
            }
        }

        if ( !is_null($cluster_id) && !$this->validateIntInput('cluster_id', $cluster_id) ) {
            return config('errors.global.CLUSTER_NOT_EXISTS');
        }

        if ( !is_null($personal_identity) && !$this->validatePersonalIdentity($personal_identity) ) {
            return config('errors.elections.PERSONAL_IDENTITY_NOT_VALID');
        }

        if ( is_null($selected_roles) ) {
            return config('errors.system.ROLE_DOESNT_EXIST');
        } else if (!$this->validateElectionRoles($selected_roles)) {
            return config('errors.system.ROLE_DOESNT_EXIST');
        }

        return 'OK';
    }

	/*
		Private helpful function that returns NOT FORMATTED clusters activists data
	*/
    private function getClusterActivistReportResult(Request $request, $exportToFile = false) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $neighborhood_id = $request->input('neighborhood_id', null);

        $first_name = $request->input('first_name', null);
        $last_name = $request->input('last_name', null);
        $personal_identity = $request->input('personal_identity', null);

        $selected_roles = $request->input('selected_roles', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $electionRoles = $this->getClusterElectionRolesFromDb();

        $electionRolesHash = [];
        for ( $roleIndex = 0; $roleIndex < count($electionRoles); $roleIndex++ ) {
            $electionRoleKey = $electionRoles[$roleIndex]->key;

            $electionRolesHash[$electionRoleKey] = $electionRoles[$roleIndex];
        }

        $fields = [
            'clusters.id',
            DB::raw($this->fullClusterNameQuery),
            'clusters.key as cluster_key',
            'clusters.mi_id',
            'clusters.leader_id',
            'clusters.street as cluster_street',
            'cities.name as cluster_city',
            'cities.area_id as area_id',
            'cities.sub_area_id as sub_area_id',
            'cities.id as city_id',
            
            'voters.id as leader_id',
            'voters.key as leader_key',
            'voters.first_name as leader_first_name',
            'voters.last_name as leader_last_name',
            'voters.personal_identity as leader_personal_identity',
            'leader_cities.name as leader_city',
            'voters.street as leader_street',
            'voters.house as leader_house',
            'election_roles_by_voters.phone_number as leader_phone_number',
            'election_roles_by_voters.key as election_role_key'
        ];

        $where = [
            'clusters.election_campaign_id' => $last_campaign_id
        ];

        $clusterObj = Cluster::select($fields)
            // ->withElectionsRolesByVoters(true)
            ->withCity()
            ->withLeader()
            ->withLeaderCity(true);

        if ( !is_null($cluster_id) ) {
            $where['clusters.id'] = $cluster_id;
        } else if ( !is_null($neighborhood_id) ) {
            $where['clusters.neighborhood_id'] = $neighborhood_id;
        } else if ( !is_null($city_id) ) {
            $where['clusters.city_id'] = $city_id;
        } else if ( !is_null($sub_area_id) ) {
            $where['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $where['cities.area_id'] = $area_id;
        }
        if ( !is_null($first_name) ) {
            $where['voters.first_name'] =  $first_name;
        }

        if ( !is_null($last_name) ) {
            $where['voters.last_name'] =  $last_name;
        }

        if ( !is_null($personal_identity) ) {
            $where['voters.personal_identity'] =  $personal_identity;
        }

        $clusterObj->where($where);

        $allowClusterIdList = Self::getOnlyAllowedClustersListForUser($clusterObj->get());  
       
        if(!is_null($allowClusterIdList)){
            $allowLimitedClusterIdList = (!$exportToFile) ? array_slice($allowClusterIdList, $skip, $limit) : $allowClusterIdList;
            $clusterObj->whereIn('clusters.id', $allowLimitedClusterIdList);
        }else{
            if (!$exportToFile) {$clusterObj->skip($skip)->limit($limit);}
        }
        for ( $selectedIndex = 0; $selectedIndex < count($selected_roles); $selectedIndex++ ) {
            $selectedRoleKey = $selected_roles[$selectedIndex];
            $selectedRoleSystemName = $electionRolesHash[$selectedRoleKey]->system_name;

            switch($selectedRoleSystemName) {
                case config('constants.activists.election_role_system_names.driver'):
                    $clusterObj->with(['driverGeo' => function($qr) use ($last_campaign_id) {
                        $fields = [
                            'election_role_by_voter_geographic_areas.entity_id',

                            'voters.key as activist_key',
                            'voters.first_name as activist_first_name',
                            'voters.last_name as activist_last_name',
                            'voters.personal_identity as activist_personal_identity',

                            'voters.street as activit_street',
                            'voters.house as activit_house',
                            'cities.name as activist_city_name',

                            'election_roles_by_voters.phone_number as activist_phone_number',
                            'election_roles_by_voters.key as election_role_key',
                            DB::raw('count(voter_transportations.voter_id) as count_driver_transportation')
                        ];

                        $whereQuery = [
                            'election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                            'election_roles.system_name' => config('constants.activists.election_role_system_names.driver')
                        ];

                        $qr->select($fields)
                            ->withElectionRolesByVoters()
                            ->withElectionRoles()
                            ->withVoters()
                            ->withVoterCity()
                            ->withDriverTransportation($last_campaign_id)
                            ->where($whereQuery)
                            ->groupBy('election_roles_by_voters.voter_id');

                    }]);
                    break;

                case config('constants.activists.election_role_system_names.motivator'):
                    $clusterObj->with(['motivatorGeo' => function($qr) use ($last_campaign_id) {
                        $fields = [
                            'election_role_by_voter_geographic_areas.entity_id',

                            'voters.key as activist_key',
                            'voters.first_name as activist_first_name',
                            'voters.last_name as activist_last_name',
                            'voters.personal_identity as activist_personal_identity',

                            'voters.street as activit_street',
                            'voters.house as activit_house',
                            'cities.name as activist_city_name',

                            'election_roles_by_voters.phone_number as activist_phone_number',
                            'election_roles_by_voters.key as election_role_key',
                        ];

                        $whereQuery = [
                            'election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'),
                            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                            'election_roles.system_name' => config('constants.activists.election_role_system_names.motivator')
                        ];

                        $qr->select($fields)
                            ->withElectionRolesByVoters()
                            ->withElectionRoles()
                            ->withVoters()
                            ->withVoterCity()
                            ->where($whereQuery);

                    }]);
                    break;

                case config('constants.activists.election_role_system_names.observer'):
                    $clusterObj->with(['observerBallotBoxes.electionRolesGeographical' => function($qr) use ($last_campaign_id) {
                        $fields = [
                            'election_role_by_voter_geographic_areas.entity_id',

                            'voters.key as activist_key',
                            'voters.first_name as activist_first_name',
                            'voters.last_name as activist_last_name',
                            'voters.personal_identity as activist_personal_identity',

                            'voters.street as activit_street',
                            'voters.house as activit_house',
                            'cities.name as activist_city_name',

                            'election_roles_by_voters.phone_number as activist_phone_number',
                            'election_roles_by_voters.key as election_role_key',
                        ];

                        $whereQuery = [
                            'election_role_by_voter_geographic_areas.entity_type' => config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'),
                            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
                            'election_roles.system_name' => config('constants.activists.election_role_system_names.observer')
                        ];

                        $qr->select($fields)
                            ->withElectionRolesByVoters(false)
                            ->withElectionRoles()
                            ->withVoters()
                            ->withVoterCity()
                            ->where($whereQuery);
                    }]);
                    break;

                case config('constants.activists.election_role_system_names.ministerOfFifty'):
                    $clusterObj->with(['captain50BallotBoxes.votersInElectionCampaigns' => function($qr) use ($last_campaign_id) {
                        $fields = [
                            'voters_in_election_campaigns.ballot_box_id',

                            'captain_voters.key as activist_key',
                            'captain_voters.first_name as activist_first_name',
                            'captain_voters.last_name as activist_last_name',
                            'captain_voters.personal_identity as activist_personal_identity',

                            'captain_voters.street as activit_street',
                            'captain_voters.house as activit_house',
                            'cities.name as activist_city_name',

                            'election_roles_by_voters.phone_number as activist_phone_number',
                            'election_roles_by_voters.key as election_role_key',

                            DB::raw('count(distinct voters.household_id) as count_captain50_households'),
                            DB::raw('count(voters.id) as count_captain50_voters')
                        ];

                        $whereQuery = [
                            'voters_with_captains_of_fifty.deleted' => 0,
                            'voters_in_election_campaigns.election_campaign_id' => $last_campaign_id,
                            'election_roles.system_name' => config('constants.activists.election_role_system_names.ministerOfFifty')
                        ];
                        
                        $qr->select($fields)
                            ->withVoters()
                            ->withCaptainFifty()
                            ->withCaptain50ElectionsRoles()
                            ->withElectionRoles()
                            ->withCaptainVoter()
                            ->withCaptainCity()
                            ->where($whereQuery)
                            ->groupBy('voters_with_captains_of_fifty.captain_id');
                    }]);
                    break;
            }
        }

        $collection = $clusterObj->get();

        $clusters = $collection->toArray();
        $clustersResult = [];
        
        foreach ($clusters as $index => $cluster ) {
            if(!isset($clustersResult[$cluster['id']])){
                $clustersResult[$cluster['id']] = $cluster;
                $clustersResult[$cluster['id']]['captain50_geo'] = [];
                $clustersResult[$cluster['id']]['observer_geo'] = [];
            }
            if ( isset($cluster['motivator_geo']) ) {
                $motivator_geo = $cluster['motivator_geo'];
                $cluster['motivator_geo'] = $motivator_geo;
                $this->uniqeById($motivator_geo);

                $clustersResult[$cluster['id']]['motivator_geo'] = $motivator_geo;
            }
            if ( isset($cluster['driver_geo']) ) {
                $driver_geo = $cluster['driver_geo'];
                $cluster['driver_geo'] = $driver_geo;
                $this->uniqeById($driver_geo);

                $clustersResult[$cluster['id']]['driver_geo'] = $driver_geo;
            }

            if ( isset($cluster['observer_ballot_boxes']) ) {
                $observer_geo = [];
                for ( $ballotIndex = 0; $ballotIndex < count($cluster['observer_ballot_boxes']); $ballotIndex++ ) {
                    for ( $geoIndex = 0; $geoIndex < count($cluster['observer_ballot_boxes'][$ballotIndex]['election_roles_geographical']); $geoIndex++ ) {
                        $observer_geo[] = $cluster['observer_ballot_boxes'][$ballotIndex]['election_roles_geographical'][$geoIndex];
                    }
                }
                $this->uniqeById($observer_geo);
                $clustersResult[$cluster['id']]['observer_geo'] = $observer_geo;
                $clusters[$index]['observer_geo'] = $observer_geo;
            }
            if ( isset($cluster['captain50_ballot_boxes']) ) {
                $captain50_geo = [];

                for ( $ballotIndex = 0; $ballotIndex < count($cluster['captain50_ballot_boxes']); $ballotIndex++ ) {
                    for ( $geoIndex = 0; $geoIndex < count($cluster['captain50_ballot_boxes'][$ballotIndex]['voters_in_election_campaigns']); $geoIndex++ ) {
                        $captain50_geo[] = $cluster['captain50_ballot_boxes'][$ballotIndex]['voters_in_election_campaigns'][$geoIndex];
                    }
                }
                $this->uniqeById($captain50_geo);
                $clustersResult[$cluster['id']]['captain50_geo'] = $captain50_geo;
                $clusters[$index]['captain50_geo'] = $captain50_geo;
            }
        }
        $countObj = Cluster::select(['clusters.id'])
            // ->withElectionsRolesByVoters()
            ->withLeader()
            ->withCity()
            ->where($where);
            if(!is_null($allowClusterIdList)){
                 $countObj->whereIn('clusters.id', $allowClusterIdList);
            }

        $total_records = DB::table(DB::Raw('( ' . $countObj->toSql() . ' ) AS t1'))
            ->setBindings([$countObj->getBindings()])
            ->select([DB::raw('count(*) as total_records')])
            ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' =>  $clustersResult, 
        ];
        return $result;
    }

	/*
		Function that returns cluster activists report by POST params
	*/
    public function displayClusterActivistReport(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( ($msgCode = $this->validateClusterActivistReportData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($msgCode);
            return;
        }

        $result = $this->getClusterActivistReportResult($request);

        $jsonOutput->setData($result);
    }

	/*
		Function that returns clusters activists report in specific format
		that is needed for UI
	*/
    public function convertClusterActivistReport(Request $request, $result) {
        $electionRoles = $this->getClusterElectionRolesFromDb();

        $electionRolesHash = [];
        for ( $roleIndex = 0; $roleIndex < count($electionRoles); $roleIndex++ ) {
            $electionRoleKey = $electionRoles[$roleIndex]->key;

            $electionRolesHash[$electionRoleKey] = $electionRoles[$roleIndex];
        }

        $selected_roles = $request->input('selected_roles', null);

        $clusterData = [];

        $clusters = $result['records'];

        foreach ($clusters as $cluster ) {
        $exportedRows = [];

            $address = 'כתובת ';

            if ( !is_null($cluster['cluster_street']) ) {
                $address .= $cluster['cluster_street'] . ' ';
            }

            /** Add cluster row */
            $clusterCity = 'עיר ' . $cluster['cluster_city'];

            $headerCluster = [
                'mi_id' => $cluster['mi_id'],
                'name' => $cluster['cluster_name'],
                'address' => $address,
                'city' => $clusterCity,
            ];

            $clusterData[$cluster['id']]['info'] = $headerCluster;
        
            /** Add header row */

            $header1 = [
                'index' => 'מס"ד',
                'election_role' => 'סוג פעיל',
                'full_name' => 'שם מלא',
                'personal_identity' => 'תעודת זהות',
                'address' => 'כתובת מלאה',
                'phone_number' => "מס' טלפון",
                'number_of_voters' => 'מספר תושבים לדיווח'
            ];
    
            $exportedRows[] = $header1;

            $leaderAddress = '';

            if ( !is_null($cluster['leader_street']) ) {
                $leaderAddress .= $cluster['leader_street'] . ' ';
            }

            if ( !is_null($cluster['leader_house']) ) {
                $leaderAddress .= $cluster['leader_house'] . ' ';
            }

            /** Add cluster header row */

            $leaderAddress .= $cluster['leader_city'];
            $headerLeaderName = !empty($cluster['leader_personal_identity']) ?
            $cluster['leader_first_name'] . ' ' . $cluster['leader_last_name'] : 'לא שובץ ראש אשכול';
            $headerLeader = [
                'election_role' => 'ראש אשכול',
                'full_name' => $headerLeaderName,
                'personal_identity' => $cluster['leader_personal_identity'],
                'address' => $leaderAddress,
                'phone_number' => $cluster['leader_phone_number'],
                'number_of_voters' => ''
            ];

            $exportedRows[] = $headerLeader;

            for ( $selectedIndex = 0; $selectedIndex < count($selected_roles); $selectedIndex++ ) {
                $number_of_voters = '';
                $numberOfVotersParam = null;
                $selectedRoleKey = $selected_roles[$selectedIndex];
                $selectedRoleSystemName = $electionRolesHash[$selectedRoleKey]->system_name;
                $selectedRoleName = $electionRolesHash[$selectedRoleKey]->name;

                switch ($selectedRoleSystemName) {
                    case config('constants.activists.election_role_system_names.driver'):
                        $activistArr = $cluster['driver_geo'];
                        break;

                    case config('constants.activists.election_role_system_names.motivator'):
                        $activistArr = $cluster['motivator_geo'];
                        break;

                    case config('constants.activists.election_role_system_names.observer'):
                        $activistArr = $cluster['observer_geo'];
                        break;

                    case config('constants.activists.election_role_system_names.ministerOfFifty'):
                        $activistArr = $cluster['captain50_geo'];
                        break;
                }
            /** Add activist rows */
            $activistCnt = count($activistArr);
                if ( $activistCnt == 0 ) {
                    $newRow = [
                        'election_role' => $selectedRoleName,
                        'full_name' => 'לא שובץ ' . $selectedRoleName,
                        'personal_identity' => '',
                        'address' => '',
                        'phone_number' => '',
                        'number_of_voters' => ''
                    ];

                    $exportedRows[] = $newRow;
                } else {
                    $ids=[];
                    foreach ( $activistArr as $activistIndex => $activistItem ) {

                        $roleNameColumn = (0 == $activistIndex) ? $selectedRoleName : '';

                        $activistFullName = $activistItem['activist_first_name'] . ' ';
                        $activistFullName .= $activistItem['activist_last_name'];

                        $activistAddress = '';

                        if ( !is_null($activistItem['activit_street']) ) {
                            $activistAddress .= $activistItem['activit_street'] . ' ';
                        }

                        if ( !is_null($activistItem['activit_house']) ) {
                            $activistAddress .= $activistItem['activit_house'] . ' ';
                        }

                        $activistAddress .= $activistItem['activist_city_name'];

                        $number_of_voters='';

                        if($selectedRoleSystemName == config('constants.activists.election_role_system_names.driver')){
                            $number_of_voters = $activistItem['count_driver_transportation'] + ' נוסעים';

                        }else if($selectedRoleSystemName == config('constants.activists.election_role_system_names.ministerOfFifty')){
                            $number_of_voters =  $activistItem['count_captain50_voters'] . ' תושבים ב ' . $activistItem['count_captain50_households'] . ' בתי אב';

                        }
                        $activistRow = [
                            'election_role' => $roleNameColumn,
                            'full_name' => $activistFullName,
                            'personal_identity' => $activistItem['activist_personal_identity'],
                            'address' => $activistAddress,
                            'phone_number' => $activistItem['activist_phone_number'],
                            'number_of_voters' => $number_of_voters
                        ];

                        $exportedRows[] = $activistRow;
                    }
                }
                $clusterData[$cluster['id']]['rows'] = $exportedRows;
            }
        }
        return $clusterData;
    }
	
	/*
		Private helpful function that checks if user has permissions to specific action - 
		print or report , by POST params
	*/
    private function clusterActivistReportPermissions(Request $request) {
        $user = Auth::user();
        $isAllowedDownload = $user->admin;

        if ( $isAllowedDownload ) {
            return true;
        }

        $file_type = $request->input('file_type', null);

        $userPermissions = $user->permissions();
        foreach ($userPermissions as $permission) {
            if ( 'elections.reports.cluster_activists.export' == $permission->operation_name && 'pdf' == $file_type) {
                return true;
            }

            if ( 'elections.reports.cluster_activists.print' == $permission->operation_name && 'print' == $file_type) {
                return true;
            }
        }

        return false;
    }
    /*
		Function that exports cluster activist report by POST input params
	*/
    public function exportClusterActivistReport(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( !$this->clusterActivistReportPermissions($request) ) {
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
            return;
        }

        if ( ($code = $this->validateClusterActivistReportData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($code);
            return;
        }

        $jsonOutput->setBypass(true);

        $result = $this->getClusterActivistReportResult($request, true);

        $file_type = $request->input('file_type', null);
        $data = $this->convertClusterActivistReport($request, $result);
        return ExportService::export($data, $file_type, 'clusterReport');
    }
    /**
     * @method uniqeById
     *  Remove duplicates election roles voters.
     * @param [array] $array - elections roles array
     * @return void
     */
    static private function uniqeById(&$array){
        $ids=[];
        foreach($array as $index=> $item){
            if(!empty($item['activist_personal_identity'])&&in_array($item['activist_personal_identity'] , $ids)){
                unset($array[$index]);
            }else{
                $ids[]=$item['activist_personal_identity'];
            }
        }
    }
    
	/**
	 * isAllowedClusterListForUser
	 * static function that checks if list cluster is permitted to user editing.
     * @param $clusterList - cluster collection for check permission.
	 * @return {array} - id list of permitted clusters for user.
	*/
	private static function getOnlyAllowedClustersListForUser($clusterList ){
        $allowClusterIdList = [];
        $allowClusterIdHash = [];

        $geographicFilters = GeoFilterService::getAllUserGeoFilters();
        
        $geographicFiltersCnt = count($geographicFilters);
        if($geographicFiltersCnt == 0){return null;}	

        foreach ($geographicFilters as $geographicFilter){
            $entity_type = $geographicFilter->entity_type;
            $entity_id = $geographicFilter->entity_id;
                switch ($entity_type) {
                    
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                        self::checkCluserPermissions($clusterList, $allowClusterIdList,'areas_group_id', $entity_id);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                        self::checkCluserPermissions($clusterList, $allowClusterIdList,'area_id', $entity_id);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                        self::checkCluserPermissions($clusterList, $allowClusterIdList,'sub_area_id', $entity_id);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                        self::checkCluserPermissions($clusterList, $allowClusterIdList,'city_id', $entity_id);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
                    // self::checkCluserPermissions($clusterList,'city_id'); ???
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                        self::checkCluserPermissions($clusterList, $allowClusterIdList,'id', $entity_id);
                        break;
                    default:
                        break;
                }
        }
        
        return $allowClusterIdList;
    }	
        /**
         * @method  checkCluserPermissions()
         * - Passes on all clusters and check in specific geo filter
         * @param [array] $clusterList - cluster list
         * @param [type] $allowClusterIdList - cluster id list that permitted for user
         * @param [type] $attr - param to check in cluster object 
         * @param [type] $entity_id - geo filter id pointer
         * @return void 
         */
		static private function checkCluserPermissions(&$clusterList, &$allowClusterIdList, $attr, $entity_id){
            foreach ($clusterList as $index => $item) {
              if($item->$attr == $entity_id){
                  if(empty($allowClusterIdHash[$item->id])){
                    $allowClusterIdList[] = $item->id;
                    $allowClusterIdHash[$item->id] = $item;
                    unset($clusterList[$index]);
                  }
              }
            }
		}
}