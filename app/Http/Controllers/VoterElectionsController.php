<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OriginCountry;
use App\Models\Voters;
use App\Models\Area;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\TempVoter;
use App\Models\VoterPhone;
use App\Models\CrmRequest;
use App\Models\SupportStatus;
use App\Models\VoterElectionCampaigns;
use App\Models\ElectionCampaigns;
use App\Models\VoterSupportStatus;
use App\Models\VoteSources;
use App\Models\VoterTransportation;
use App\Models\VoterVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\BallotBox;
use Auth;
use App\Libraries\Helper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;


use App\Http\Controllers\ActionController;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use PDOException;
use Barryvdh\Debugbar\Facade as Debugbar;


class VoterElectionsController extends Controller {
    private $errorMessage;

	/*
		Constructor function
	*/
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
    }

	/*
		Function that returns all support_statuses list
	*/
    public function getAllSupportStatus () {
        $jsonOutput = app()->make( "JsonOutput" );
        $electionCampaign = ElectionCampaigns::currentCampaign();
        $resultArray = SupportStatus::select('id', 'key', 'name', 'system_name', 'likes', 'active')
        							->where('election_campaign_id', $electionCampaign->id)
        							->where('deleted', 0)
        							->where('active',1)
        							->orderBy('level', 'DESC')
        							->orderBy('name', 'ASC')
        							->get();

        $jsonOutput->setData( $resultArray );
    }
	
	/*
		Function that returns search results of clusters by POST params
	*/
	public function searchClustersByParams(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$geoCounter = 0;
		$entity_id = -1; //geo-entity id for search
		if($request->input('area_key') != null && strlen(trim($request->input('area_key'))) > 0){
			$area = Area::select('id')->where('key',$request->input('area_key'))->where('deleted',0)->first();
			if($area){
				$entity_id = $area->id;
			}
			else{
				$jsonOutput->setErrorCode(config('errors.global.AREA_NOT_EXISTS'));
				return;
			}
			$geoCounter++;
		}
		if($request->input('city_key') != null && strlen(trim($request->input('city_key'))) > 0){
			$city = City::select('id')->where('key',$request->input('city_key'))->where('deleted',0)->first();
			if($city){
				$entity_id = $city->id;
			}
			else{
				$jsonOutput->setErrorCode(config('errors.global.CITY_NOT_EXISTS'));
				return;
			}
			$geoCounter++;
		}
		if($request->input('neighborhood_key') != null && strlen(trim($request->input('neighborhood_key'))) > 0){
			$neighborhood = Neighborhood::select('id')->where('key',$request->input('neighborhood_key'))->where('deleted',0)->first();
			if($neighborhood){
				$entity_id = $neighborhood->id;
			}
			else{
				$jsonOutput->setErrorCode(config('errors.global.NEIGHBORHOOD_NOT_EXISTS'));
				return;
			}
			$geoCounter++;
		}
		
		if($request->input('cluster_key') != null && strlen(trim($request->input('cluster_key'))) > 0){
			$tempCluster = Cluster::select('id')->where('key',$request->input('cluster_key'))->first();
			if($tempCluster){
				$entity_id = $tempCluster->id;
			}
			else{
				$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
				return;
			}
			$geoCounter++;
		}
		if($geoCounter > 1){ // error - only one search param allowed
			$jsonOutput->setErrorCode(config('errors.elections.TOO_MANY_GEOGRAPHICAL_SEARCH_PARAMS'));
			return;
		}
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		$clusters = Cluster::select(['clusters.id' , 'clusters.key' ,DB::raw($this->fullClusterNameQuery.' as name'), 'clusters.street' , 'cities.name as city_name'])->withCity()->where('clusters.election_campaign_id',$last_campaign_id);
		
		if($request->input('area_key') != null && strlen(trim($request->input('area_key'))) > 0){
			$clusters = $clusters->where('area_id' , $entity_id );
			 
		}
		if($request->input('city_key') != null && strlen(trim($request->input('city_key'))) > 0){
			$clusters = $clusters->where('city_id' , $entity_id );
			 
		}
		if($request->input('neighborhood_key') != null && strlen(trim($request->input('neighborhood_key'))) > 0){
			$clusters = $clusters->where('neighborhood_id' , $entity_id );
			 
		}
		if($request->input('cluster_key') != null && strlen(trim($request->input('cluster_key'))) > 0){
			$clusters = $clusters->where('clusters.id' , $entity_id );
		}
		
		$clusters->withCount('ballotBoxes');
		
		if($request->input('show_leader') == 'true'){
		     $clusters = $clusters->withLeader();
		}
		if($request->input('show_drivers') == 'true'){
			
		}
		
		$jsonOutput->setData($clusters->get());
	}
	
	/*
		Function that returns all ElectionRolesByVoters by cluster_key
	*/
	public function getElectionRoleByVoterGeographical($cluster_key){
		$jsonOutput = app()->make( "JsonOutput" );
		$cluster = Cluster::where('key' , $cluster_key)->first();
		if(!$cluster)
		{
			$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
			return;
		}
		
		$driverElectionRole = ElectionRoles::select(['id'])->where('type' , 1)->where('system_name' , 'driver')->first();
		if(!$driverElectionRole){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		
		$election_roles_by_voters = ElectionRolesByVoters::select(['voters.key as key' , 'voters.personal_identity' , 'voters.first_name' , 'voters.last_name' , 'election_roles_by_voters.sum' , 'election_roles_by_voters.phone_number' , 'election_roles_by_voters.comment'])->withVoter()->withElectionRoleGeographical()->where('election_role_by_voter_geographic_areas.entity_type' ,  3)->where('election_role_by_voter_geographic_areas.entity_id' , $cluster->id)->where('election_roles_by_voters.election_campaign_id' , $last_campaign_id)->where('election_roles_by_voters.election_role_id',$driverElectionRole->id)->get();
		$jsonOutput->setData($election_roles_by_voters);
		
	}
	
	/*
		Function that deletes specific ElectionRolesByVoters  
		
		@param request
		@param cluster_key
		@param election_role_by_voter_key
	*/
	public function deleteElectionRoleByVoterGeographical(Request $request , $cluster_key , $election_role_by_voter_key){
		$jsonOutput = app()->make( "JsonOutput" );
		$cluster = Cluster::where('key' , $cluster_key)->first();
		if(!$cluster)
		{
			$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
			return;
		}
		
		$driverElectionRole = ElectionRoles::select(['id'])->where('type' , 1)->where('system_name' , 'driver')->first();
		if(!$driverElectionRole){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		
		$electionRoleByVoter = ElectionRolesByVoters::where('key' , $election_role_by_voter_key)->where('election_role_id' , $driverElectionRole->id)->where('election_campaign_id' , $last_campaign_id)->first();
		if(!$electionRoleByVoter){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		$relatedGeographicRow = ElectionRolesGeographical::where('election_role_by_voter_id' , $electionRoleByVoter->id)->first();
		if($relatedGeographicRow){
			$relatedGeographicRow->forceDelete();
		}
		$electionRoleByVoter->forceDelete();
		$jsonOutput->setData('ok');
	}

	/*
		Function that edits specific ElectionRolesByVoters  
		
		@param request
		@param cluster_key
		@param election_role_by_voter_key
	*/
	public function editElectionRoleByVoterGeographical(Request $request , $cluster_key , $election_role_by_voter_key){
		$jsonOutput = app()->make( "JsonOutput" );
		$cluster = Cluster::where('key' , $cluster_key)->first();
		if(!$cluster)
		{
			$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
			return;
		}
		
		if($request->input('sum') == null || !is_numeric($request->input('sum')) || (int)$request->input('sum') <= 0){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_SUM'));
			return;
		}
		if($request->input('phone_number') == null  || !Helper::isIsraelPhone($request->input('phone_number')) ){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));
			return;
		}
		
		$driverElectionRole = ElectionRoles::select(['id'])->where('type' , 1)->where('system_name' , 'driver')->first();
		if(!$driverElectionRole){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		
		$electionRoleByVoter = ElectionRolesByVoters::where('key' , $election_role_by_voter_key)->where('election_role_id' , $driverElectionRole->id)->where('election_campaign_id' , $last_campaign_id)->first();
		if(!$electionRoleByVoter){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		$electionRoleByVoter->sum = $request->input('sum');
		$electionRoleByVoter->phone_number = $request->input('phone_number');
		$electionRoleByVoter->comment = $request->input('comment');
		$electionRoleByVoter->save();
		$jsonOutput->setData('ok');
	}
	
	/*
		Function that adds new ElectionRolesByVoters  
		
		@param request
		@param cluster_key
	*/
	public function addElectionRoleByVoterGeographical(Request $request , $cluster_key){
		$jsonOutput = app()->make( "JsonOutput" );
		
		$cluster = Cluster::where('key' , $cluster_key)->first();
		if(!$cluster)
		{
			$jsonOutput->setErrorCode(config('errors.global.CLUSTER_NOT_EXISTS'));
			return;
		}
		
		if($request->input('voter_key') == null || trim($request->input('voter_key')) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
			return;
		}
		
		$voter = Voters::where('key' , $request->input('voter_key'))->first();
		if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;	
		}
		
		if($request->input('sum') == null || !is_numeric($request->input('sum')) || (int)$request->input('sum') <= 0){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_SUM'));
			return;
		}
		if($request->input('phone_number') == null  || !Helper::isIsraelPhone($request->input('phone_number')) ){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));
			return;
		}
		
		$driverElectionRole = ElectionRoles::select(['id'])->where('type' , 1)->where('system_name' , 'driver')->first();
		if(!$driverElectionRole){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_DRIVER_ROLE_RECORD'));
			return;
		}
		
		$last_campaign_id = VoterElectionsController::getLastCampaign();
        $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');

		$activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation($entityType, $cluster->id, $driverElectionRole->id);
        if(!$activistAllocation){
            $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS')); return;
        }
		DB::beginTransaction();

		try {
	
			$newElectionRoleByVoter = new ElectionRolesByVoters;
			$newElectionRoleByVoter->election_campaign_id = $last_campaign_id;
			$newElectionRoleByVoter->election_role_id = $driverElectionRole->id;
			$newElectionRoleByVoter->voter_id = $voter->id;
			$newElectionRoleByVoter->sum = $request->input('sum');
			$newElectionRoleByVoter->phone_number = $request->input('phone_number');
			$newElectionRoleByVoter->comment = $request->input('comment');
			$newElectionRoleByVoter->key = Helper::getNewTableKey('election_roles_by_voters', 5);
			$newElectionRoleByVoter->save();

			ActivistsAllocationsAssignmentsService::updateAllocationAssignment($activistAllocation, $newElectionRoleByVoter->id);
			
			DB::commit();
			
		} catch (\Exception $e) {
            Log::info($e);
			DB::rollback();
			$jsonOutput->setErrorCode(config('errors.system.SOMETHING_WENT_WRONG')); return;
			// something went wrong
		}

		$jsonOutput->setData('ok');
	}
	
	/*
		Function that returns all Transportations by driver's voterKey
	*/
	public function getTransportationsByDriver($driver_key){
		$jsonOutput = app()->make("JsonOutput");
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		$allTransportations = VoterTransportation::select([
		'cities.name as city_name' ,'voter_transportations.voter_id as voter_id', 
		'voter_driver_id' , 'voters.street as street' ,'mi_city','mi_street',
		'mi_street' , 'mi_house' , 'mi_house_entry','mi_flat' ,
		'first_name' , 'last_name' , 'voter_transportations.date as date'])
		->withDriverVoter()->where('voter_transportations.election_campaign_id' ,$last_campaign_id )->where('voters.key' , $driver_key)->get();
		$jsonOutput->setData($allTransportations);
	}
	
	/*
		Function that returns search results of transportations by POST params
	*/
	public function searchTransportations(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		$voterTransportations = VoterTransportation::select(['cities.name as city_name' ,'voter_transportations.voter_id as voter_id', 'voter_driver_id' , 'voters.street as street' ,'mi_city','mi_street' , 'mi_street' , 'mi_house' , 'mi_house_entry','mi_flat' , 'first_name' , 'last_name' , 'voter_transportations.date as date'])->withVoter()->where('voter_transportations.election_campaign_id' ,$last_campaign_id );
		if($request->input('city_key') != null){
			$voterTransportations = $voterTransportations->where('cities.key' , $request->input('city_key'));
		}
		if($request->input('has_driver') != null){
			if($request->input('has_driver') == '0'){
				$voterTransportations = $voterTransportations->whereNull('voter_driver_id');
			}
			elseif($request->input('has_driver') == '1'){
			 	$voterTransportations = $voterTransportations->whereNotNull('voter_driver_id');
			}
			else{
               $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
               return;
			}				
		}
		if($request->input('is_cripple') != null){
			if($request->input('is_cripple') == '0'){
				$voterTransportations = $voterTransportations->where('cripple' , 0);
			}
			elseif($request->input('is_cripple') == '1'){
			 	$voterTransportations = $voterTransportations->where('cripple' , 1);
			}
			else{
               $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
               return;
			}				
		}
		if($request->input('cluster_key') != null || $request->input('ballot_key') != null){
			$voterTransportations = $voterTransportations->withVoterInElectionCampaings()->where('voters_in_election_campaigns.election_campaign_id',$last_campaign_id);
			if($request->input('cluster_key') != null){
				$voterTransportations = $voterTransportations->where('clusters.key' , $request->input('cluster_key'));
			}
			if($request->input('ballot_key') != null){
				$voterTransportations = $voterTransportations->where('ballot_boxes.key' , $request->input('ballot_key'));
			}
		}
		
		
		$voterTransportations = $voterTransportations->get();
		$returnedArray = array();
		
		for($i=0;$i<sizeof($voterTransportations);$i++){
			$pushToArray = true;
			$voterTransportations[$i]->first_name = trim($voterTransportations[$i]->first_name);
			$voterTransportations[$i]->last_name = trim($voterTransportations[$i]->last_name);
		    $phones = VoterPhone::select(['phone_type_id' , 'phone_number' , 'phone_types.name as phone_type_name'])->withPhoneTypes()->where('voter_id' , $voterTransportations[$i]->voter_id)->get();
		    $voterTransportations[$i]->phones =  $phones;
			
			if($request->input('from_time') != null){
			$fromTimeParts =  explode(':' , $request->input('from_time'));
            if(sizeof($fromTimeParts) == 2){
				  if(strlen($fromTimeParts[0]) != 2 || strlen($fromTimeParts[1]) != 2){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
                  if((int)$fromTimeParts[0] < 0 || (int)$fromTimeParts[0] >=24){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
				  if((int)$fromTimeParts[1] < 0 || (int)$fromTimeParts[1] >=60){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
				  $timeFromRecord = $voterTransportations[$i]->date;
				  $timeFromRecord= explode(' ',$timeFromRecord)[1];
				  $timeFromRecord = explode(':' ,$timeFromRecord );
				  $timeFromRecord = (int)$timeFromRecord[0]*60 + (int)$timeFromRecord[1];
				  
				  $timeProvided = (int)$fromTimeParts[0]*60+(int)$fromTimeParts[1];
				  if($timeFromRecord < $timeProvided){
					  $pushToArray = false;
				  }
			}	
            else{
               $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
               return;
			}			
		}
		
		if($request->input('to_time') != null){
			$toTimeParts =  explode(':' , $request->input('to_time'));
            if(sizeof($toTimeParts) == 2){
				  if(strlen($toTimeParts[0]) != 2 || strlen($toTimeParts[1]) != 2){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
                  if((int)$toTimeParts[0] < 0 || (int)$toTimeParts[0] >=24){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
				  if((int)$toTimeParts[1] < 0 || (int)$toTimeParts[1] >=60){
					  $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
                      return;
				  }
				  $timeToRecord = $voterTransportations[$i]->date;
				  $timeToRecord= explode(' ',$timeToRecord)[1];
				  $timeToRecord = explode(':' ,$timeToRecord );
				  $timeToRecord = (int)$timeToRecord[0]*60 + (int)$timeToRecord[1];
				  
				  $timeProvided = (int)$toTimeParts[0]*60+(int)$toTimeParts[1];
				  if( $timeToRecord > $timeProvided){
					  $pushToArray = false;
				  }
			}	
            else{
               $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
               return;
			}			
		}
		
		if($request->input('driver_key') != null){
			$driver_voter = Voters::where('id' ,$voterTransportations[$i]->voter_driver_id)->where('key' ,$request->input('driver_key') )->first();
			if(!$driver_voter){
				$pushToArray = false;
			}
		}
		
		if($pushToArray){
			   array_push($returnedArray , $voterTransportations[$i]);
		}
	  }
	  $jsonOutput->setData($returnedArray);
	}
	
	/*
		Function that returns sets driver to VoterTransportation
		
		@param request
		@param driver_key
	*/
	public function setTransportationDrivers(Request $request , $driver_key){
		$jsonOutput = app()->make("JsonOutput");
		if($driver_key == null){
			 $jsonOutput->setErrorCode(config('errors.elections.SET_TRANSPORTATION_MISSING_DRIVER'));
			 return;
		}
		
		$driver_voter = Voters::where('key' , $driver_key)->first();
		$driver_voter_id = -1;
		if($driver_voter){
			$driver_voter_id = $driver_voter->id;
		}
		else{
			$jsonOutput->setErrorCode(config('errors.elections.SET_TRANSPORTATION_DRIVER_NOT_FOUND'));
			 return;
		}
		
		if($request->input('transportation_keys') == null){
			 $jsonOutput->setErrorCode(config('errors.elections.SET_TRANSPORTATION_MISSING_TRANSPORT_KEYS'));
			 return;
		}
		
		$allTransportationsOfDriver = VoterTransportation::where('voter_driver_id' , $driver_voter_id)->get();
		for($i = 0 ; $i < sizeof($allTransportationsOfDriver); $i++){
			$allTransportationsOfDriver[$i]->voter_driver_id = NULL;
			$allTransportationsOfDriver[$i]->save();
		}
		
		
		$totalCount = 0;
		$transports_array = explode(',' , $request->input('transportation_keys'));
		for($i=0;$i<sizeof($transports_array);$i++){
			if(trim($transports_array[$i]) != ''){
				$transportRecord = VoterTransportation::where('key' , $transports_array[$i])->first();
				if($transportRecord){
					$transportRecord->voter_driver_id = $driver_voter_id;
					$transportRecord->save();
					$totalCount++;
				}
			}
		}
		if($totalCount == 0){
			 $jsonOutput->setErrorCode(config('errors.elections.SET_TRANSPORTATION_NO_DATA_UPDATED'));
			 return;
		}
		
		 $jsonOutput->setData('ok');
	}
	
	/*
		Function that returns current(last) election campaign as object
	*/
    public function getGeneralLastCampaign () {

        $fieldsWeNeed = [ 'id' , 'name' ];
        $jsonOutput = app()->make( "JsonOutput" );
        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );

        $resultArray = ElectionCampaigns::select( $fieldsWeNeed )->whereNull( 'end_date' )->first();

        if ( null == $resultArray ) {
            $resultArray = ElectionCampaigns::select( $fieldsWeNeed )
                                            ->where( 'end_date', '>=', $currentDate )
                                            ->where( 'start_date', '<=', $currentDate )
                                            ->orderBy( 'end_date', 'desc' )->first();
        }

        $jsonOutput->setData( $resultArray );
    }

	/*
		Static function that returns current(last) election campaign id only
	*/
    public static function getLastCampaign () {
        $fieldsWeNeed = [ 'id' ];
        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );

		$resultArray = ElectionCampaigns::select( $fieldsWeNeed )->whereNull( 'end_date' )
		->orWhere('end_date', '>=', $currentDate)->orderBy('end_date', 'DESC')
		->first();

        if ( null == $resultArray ) {
            $resultArray = ElectionCampaigns::select( $fieldsWeNeed )
                ->where( 'end_date', '>=', $currentDate )
                ->where( 'start_date', '<=', $currentDate )
                ->orderBy( 'end_date', 'desc' )->first();
        }

        return $resultArray['id'];
    }

	/*
		Function that returns voter's election campaign data by voterKey
	*/
    public function getLastCurrentCampaign ( $votKey ) {

        $supportStatusFields = [ 'voter_support_status.id as id',
                                 'voter_support_status.key as key',
                                 'voter_support_status.election_campaign_id as election_campaign_id',
                                 'voter_support_status.voter_id as voter_id',
                                 'voter_support_status.entity_type as entity_type',
                                 'voter_support_status.support_status_id as support_status_id',
                                 'voter_support_status.create_user_id as create_user_id',
                                 'voter_support_status.created_at as created_at',
                                 'voter_support_status.updated_at as updated_at',
                                 'first_name',
                                 'last_name' ];

        $fieldsWeNeed = [ 'voters_in_election_campaigns.id AS electtion_campaign_id',
                          'voters.id as voter_id'

        ];
        $jsonOutput = app()->make( "JsonOutput" );
        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );

        $resultArray = ElectionCampaigns::select( $fieldsWeNeed )->withVoterElectionCampaign()->withVoter()->where( 'voters.key', $votKey )->where( 'end_date', '>=', $currentDate )->where( 'start_date', '<=', $currentDate )->orderBy( 'end_date', 'desc' )->first();

        if ( $resultArray ) {
            $firstTypeSupport = VoterSupportStatus::withUser()->select( $supportStatusFields )->where( 'voter_support_status.voter_id', $resultArray->voter_id )->where( 'entity_type', 0 )->where( 'election_campaign_id', '=', $resultArray->electtion_campaign_id )->first();
            if ( $firstTypeSupport ) {
                $firstTypeSupport->support_status_name = SupportStatus::select( [ 'name as support_status_name' ] )->where( 'id', $firstTypeSupport->support_status_id )->first();
            }
            $secondTypeSupport = VoterSupportStatus::withUser()->select( $supportStatusFields )->where( 'voter_support_status.voter_id', $resultArray->voter_id )->where( 'entity_type', 1 )->where( 'election_campaign_id', '=', $resultArray->electtion_campaign_id )->first();
            $firstTypeSupportHistory = ElectionCampaigns::withVoterElectionCampaign()->where( 'election_campaigns.type', 0 )->where( 'voter_id', $resultArray->voter_id )->where( 'election_campaign_id', '<>', $resultArray->electtion_campaign_id )->get();
            $secondTypeSupportHistory = ElectionCampaigns::withVoterElectionCampaign()->where( 'election_campaigns.type', 1 )->where( 'voter_id', $resultArray->voter_id )->where( 'election_campaign_id', '<>', $resultArray->electtion_campaign_id )->get();

            for ( $i = 0; $i < sizeof( $firstTypeSupportHistory ); $i++ ) {
                $firstTypeSupportHistory[$i]->support_data = VoterSupportStatus::where( 'election_campaign_id', $firstTypeSupportHistory[$i]->election_campaign_id )->get();
            }

            for ( $i = 0; $i < sizeof( $secondTypeSupportHistory ); $i++ ) {
                $secondTypeSupportHistory[$i]->support_data = VoterSupportStatus::where( 'election_campaign_id', $secondTypeSupportHistory[$i]->election_campaign_id )->get();
            }

            $resultArray->firstTypeSupport = $firstTypeSupport;
            $resultArray->secondTypeSupport = $secondTypeSupport;
            $resultArray->firstTypeSupportHistory = $firstTypeSupportHistory;
            $resultArray->secondTypeSupportHistory = $secondTypeSupportHistory;

            if ( $resultArray->firstTypeSupport ) {
                $resultArray->firstTypeSupport->first_name = trim( $resultArray->firstTypeSupport->first_name );
                $resultArray->firstTypeSupport->last_name = trim( $resultArray->firstTypeSupport->last_name );
            } else {
                $resultArray->firstTypeSupport = array();
            }

            if ( $resultArray->secondTypeSupport ) {
                $resultArray->secondTypeSupport->first_name = trim( $resultArray->secondTypeSupport->first_name );
                $resultArray->secondTypeSupport->last_name = trim( $resultArray->secondTypeSupport->last_name );
            }

        }
        $jsonOutput->setData( $resultArray );
    }

	/*
		Function that returns all voter's ballots roles by voterKey 
	*/
    public function getVoterBallots ( $reqKey ) {

        $fieldsWeNeed = [ 'voters_in_election_campaigns.id AS electtion_campaign_id',
                          'election_campaigns.name as name',
                          'election_campaigns.type as election_camp_type',
                          'ballot_boxes.id as ballot_box_id',
                          DB::raw($this->fullClusterNameQuery . ' as cluster_name'),
                          'cities.name as city_name',
                          'STREETS.STREET as street_name',
                          'votes.vote_source_id as vote_source_id',
                          'votes.updated_at as updated_at',
                          'vote_sources.name as vote_source_name',
                          'ballot_boxes.reporting as is_reporting',
                          'voter_transportations.cripple as transport_is_cripple',
                          'voter_transportations.from_time as transport_from_time',  //Need to change voter_transportations date in the UI!
                          'voter_transportations.to_time as transport_to_time',  //Need to change voter_transportations date in the UI!
                          'voter_transportations.date as transport_date' ];

        $jsonOutput = app()->make( "JsonOutput" );
        $voterElectionCampaigns = VoterElectionCampaigns::select( $fieldsWeNeed )->withVoter()->withElectionCampaign()->withBallotBox()->withCluster()->withCity()->withStreet()->withVote()->withTransportation()->where( 'voters.key', $reqKey )->get();
        $jsonOutput->setData( $voterElectionCampaigns );
    }

	/*
		Function that returns all VoteSources list
	*/
    public function getVoteSources () {

        $jsonOutput = app()->make( "JsonOutput" );

        $voteSources = VoteSources::all();

        $jsonOutput->setData( $voteSources );
    }

	/*
		Private helpful function that adds new transportation for voter
		
		@param voterId
		@param transportData
	*/
    private function addTransport ( $voterId, $transportData ) {

        $voterTransport = new VoterTransportation;
        $voterTransport->election_campaign_id = $this->getLastCampaign();
        $voterTransport->from_time = $transportData['voter_transport_from_time'];
        $voterTransport->to_time = $transportData['voter_transport_to_time'];
        $voterTransport->cripple = $transportData['voter_transport_crippled'];
        $voterTransport->voter_id = $voterId;
        $voterTransport->key = Helper::getNewTableKey('voter_transportations', 5);
        $voterTransport->save();

        // Array of display field names
        $historyFieldsNames = [
            "election_campaign_id",
            "voter_id",
            "cripple",
            "from_time",
            "to_time",
        ];

        $changedValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($historyFieldsNames); $fieldIndex++ ) {
            $fieldName = $historyFieldsNames[$fieldIndex];

            if (  $fieldName =='from_time' || $fieldName == 'to_time') {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.VoterTransportation.' . $fieldName),
                    'new_value' => $voterTransport->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.VoterTransportation.' . $fieldName),
                    'new_numeric_value' => $voterTransport->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.ballot.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterTransport->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that edits existing transportation for voter
		
		@param voterTransport
		@param transportData
	*/
    private function editTransport ( $voterTransport, $transportData ) {
		
        $voterTransportFromTime = $transportData['voter_transport_from_time'];
        $voterTransportToTime = $transportData['voter_transport_to_time'];

        $oldValues = [
            "cripple" => $voterTransport->cripple,
            "from_time"    => $voterTransport->from_time,
            "to_time"    => $voterTransport->to_time
        ];

        $voterTransport->from_time = $voterTransportFromTime;
        $voterTransport->to_time = $voterTransportToTime;
        $voterTransport->cripple = $transportData['voter_transport_crippled'];
        $voterTransport->save();

        // Array of display field names
        $historyFieldsNames = [
            "cripple" => config('history.VoterTransportation.cripple'),
            "from_time" => config('history.VoterTransportation.from_time'),
            "to_time" => config('history.VoterTransportation.to_time'),
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            if ( $oldValues[$fieldName] != $voterTransport->{$fieldName} ) {
                if ( 'cripple' == $fieldName ) {
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => $display_field_name,
                        'old_numeric_value' => $oldValues[$fieldName],
                        'new_numeric_value' => $voterTransport->{$fieldName}
                    ];
                } else {
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => $display_field_name,
                        'old_value' => $oldValues[$fieldName],
                        'new_value' => $voterTransport->{$fieldName}
                    ];
                }
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.ballot.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $voterTransport->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that delete transportation that is assigned for voter
		
		@param voterTransport
	*/
    private function deleteTransport ( $voterTransport ) {
        $voterTransportId = $voterTransport->id;
        $voterTransport->delete();

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.ballot.edit',
            'models' => [
                [
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterTransportId
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Function that adds new VoterVote  
		
		@param voterId
		@param vote_source_id
		@param voteExtraData
	*/
    public function addVote ( $voterId, $vote_source_id, $voteExtraData = null) {
        $date = date('Y-m-d H:i:s');
		try {
			$currentCampaignId =  self::getLastCampaign();
			$voteVotes = new VoterVotes;
			$voteVotes->election_campaign_id =$currentCampaignId;
			$voteVotes->vote_date = $date;
			$voteVotes->vote_source_id = $vote_source_id;
			$voteVotes->reporting_voter_id = !empty($voteExtraData['reporting_voter_id']) ? $voteExtraData['reporting_voter_id'] : null;
			$voteVotes->voter_id = $voterId;
			$voteVotes->key = Helper::getNewTableKey('votes', 10);
			$voteVotes->save();
		} catch (PDOException $e) {
			Log::error("Error adding vote: ".$e->getMessage());
      Debugbar::error("VoterElectionsController@addVote " . $e->getMessage());
			return false;
		}

        $ballotBox = BallotBox::select('ballot_boxes.id')
					->withVoterElectionCampaign()
					->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId)
					->where('voters_in_election_campaigns.voter_id', $voterId)
					->first();

		//add ballot box id to votes calculation in redis
		if ($ballotBox) Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $ballotBox->id, $ballotBox->id);

        // Array of display field names
        $historyFieldsNames = [
            "election_campaign_id" =>  config('history.VoterVotes.election_campaign_id'),
            "voter_id"             =>  config('history.VoterVotes.voter_id'),
            "vote_date"            =>  config('history.VoterVotes.vote_date'),
            "vote_source_id"       =>  config('history.VoterVotes.vote_source_id')
        ];

        $fieldsArray = [];
        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            if ( "vote_date" == $fieldName ) {
                $fieldsArray[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                    'new_value' => $voteVotes->{$fieldName}
                ];
            } else {
                $fieldsArray[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => $display_field_name,
                    'new_numeric_value' => $voteVotes->{$fieldName}
                ];
            }
        }
		$topicName = 'elections.voter.support_and_elections.ballot.edit';
        $historyArgsArr = [
			'topicName' => !empty($voteExtraData['topicName']) ? $voteExtraData['topicName'] : $topicName,
			'user_create_id' => isset($voteExtraData['user_create_id']) ? $voteExtraData['user_create_id'] : null,
			'entity_type' => !empty($voteExtraData['entity_type']) ? $voteExtraData['entity_type'] : null,
			'entity_id' => !empty($voteExtraData['entity_id']) ? $voteExtraData['entity_id'] : null,
            'models' => [
                [
                    'referenced_model' => 'Votes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voteVotes->id,
                    'valuesList' => $fieldsArray
                ]
            ]
        ];
		ActionController::AddHistoryItem($historyArgsArr);
		return $voteVotes;
    }

	/*
		Function that saves voter's ballot data  
		
		@param request
		@param voterKey
	*/
    public function saveVoterBallot(Request $request, $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );
		$currentVoter = Voters::select( ['voters.id'] )->where( 'voters.key', $voterKey )->first();
		if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode( config('errors.elections.VOTER_DOES_NOT_EXIST') );
			return;
		}

		$currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
		if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode( config('errors.elections.VOTER_IS_NOT_PERMITED') );
			return;
		}

        $electionData = $request->input( 'election_data', null );

        if ( !in_array( $electionData['did_vote'], [0, 1] ) ) {
			$jsonOutput->setErrorCode( config('errors.elections.INVALID_VOTE') );
            return;
        }

        if ( !is_null($electionData['voter_transport_crippled']) &&
             !in_array( $electionData['voter_transport_crippled'], [0, 1] ) ) {
			$jsonOutput->setErrorCode( config('errors.elections.INVALID_TRANSPORTATION') );
            return;
        }

        if ( 1 == $electionData['did_vote'] ) {
			$voteSourceId = VoteSources::select('id')->where('system_name', 'manual')->first()->id;
            $this->addVote($currentVoter->id, $voteSourceId);
        }

        if ( !is_null($electionData['voter_transport_crippled']) ) {
            $this->addTransport($currentVoter->id, $electionData);
        }

        $jsonOutput->setData( $electionData );
    }

	/*
		Function that saves voter's ballot data  and transportation data
		
		@param request
		@param voterKey
		@param transportKey
	*/
    public function saveVoterBallotWithTransportKey(Request $request, $voterKey, $transportKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::select( ['voters.id'] )->where( 'key', $voterKey )->first();
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterTransport = VoterTransportation::where('key', $transportKey)->first();
        if ( null == $voterTransport ) {
			$jsonOutput->setErrorCode( config('errors.elections.INVALID_TRANSPORTATION') );
            return;
        }

        $electionData = $request->input( 'election_data', null );

        if ( !in_array( $electionData['did_vote'], [0, 1] ) ) {
			$jsonOutput->setErrorCode( config('errors.elections.INVALID_VOTE') );
            return;
        }

        if ( !is_null($electionData['voter_transport_crippled']) &&
             !in_array( $electionData['voter_transport_crippled'], [0, 1] ) ) {
			$jsonOutput->setErrorCode( config('errors.elections.INVALID_TRANSPORTATION') );
            return;
        }

        if ( is_null($electionData['voter_transport_crippled']) ) {
            $this->deleteTransport($voterTransport);
        } else {
            $this->editTransport($voterTransport, $electionData);
        }

        if ( 1 == $electionData['did_vote'] ) {
			$voteSource = VoteSources::select('id')->where('system_name', 'manual');
			$voteSourceId = !empty($voteSource) ? $voteSource->id : null;
            $this->addVote($currentVoter->id, $voteSource);
        }

        $jsonOutput->setData( $electionData );
    }
}