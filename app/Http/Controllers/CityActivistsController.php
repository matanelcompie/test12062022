<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\GlobalController;
use App\Http\Requests\CreateActivistRequest;
use App\Http\Requests\SearchActivistRequest;
use App\Libraries\Services\activists\ActivistsAssignmentsExportService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAssignmentsCreator;
use App\Models\City;

use App\Models\ElectionCampaigns;
use App\Models\Votes;

use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\cityActivists\ClusterBallotsActivistsService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ElectionRoleShiftService;
use App\Models\Quarter;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRoleShiftRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Support\Facades\Log;

class CityActivistsController extends Controller {

	/*
	get cluster data by cluster key only
	*/
	public function getClusterDataByKeyOnly($clusterKey){
		$jsonOutput = app()->make("JsonOutput");
		$resultObj = ClusterBallotsActivistsService::getClusterDataByKeyOnly($jsonOutput, $clusterKey);
		$jsonOutput->setData($resultObj);
	}

	/**
	 *	get cluster data by key
	 * @param string $cityKey
	 * @param string $clusterKey
	 * @return array 
	 *cancel_google_map: 1
	 *captain_fifty: [] array details of captain fifty
	 *cluster_leader_roles: [] array details of captain fifty
	 *driver_roles: [] array details of driver
	 *mamritz_roles [] array details motivator
	 *shas_votes_count: 0
	 * ]
	 */
	public function getClusterActivistsDataByKey($cityKey, $clusterKey)
	{
		try {
			$jsonOutput = app()->make("JsonOutput");
			if (
				is_null($cityKey) || trim($cityKey) == ''
			)
			throw new Exception(config('errors.elections.MISSING_CITY_KEY'));

			if (is_null($clusterKey) || trim($clusterKey) == ''
			)
			throw new Exception(config('errors.elections.MISSING_CLUSTER_KEY'));

			if (!GlobalController::isActionPermitted('elections.activists.cluster_summary'))
			throw new Exception(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));

			if (!GlobalController::isAllowedCitiesForUser($cityKey))
			throw new Exception(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));

			$city = CityRepository::getCityByKey($cityKey);
			$cluster = ClusterRepository::getClusterByKey($clusterKey);
			$resultObj = ClusterBallotsActivistsService::getClusterActivistsDataByKey($city, $cluster);
			$jsonOutput->setData($resultObj);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	/*
	Function that get array of ballot box ids and returns extra data for them - num of 
	shas votes in previous campaign , number of supporters , updated hour of reporting and role shifts : 

	@param cityKey
	@param $request('ballot_box_ids')
	*/
	public function getExtendedDataForBallotBoxes(Request $request , $cityKey){
		try {
			$jsonOutput = app()->make("JsonOutput");
			if(!GlobalController::isActionPermitted('elections.activists.city_summary'))
				throw new Exception(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
	
			if(!GlobalController::isAllowedCitiesForUser($cityKey))
			throw new Exception(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
	
			if($cityKey == null || trim($cityKey) == '')
					throw new Exception(config('errors.elections.MISSING_CITY_KEY'));
			
			$arrayIDS = json_decode($request->input('ballot_box_ids') , true);
	
			$returnedObject = array();
			$currentCampaign = ElectionCampaigns::currentCampaign();
	
			foreach ($arrayIDS as $id) {
				$innerObject = array();
				$ballotBoxQuery = BallotBoxService::getBallotShiftsAndSupportersQuery($currentCampaign->id);
				$electionRoleVotes = $ballotBoxQuery->where('id' , $id)->first();
	
				$innerObject["id"] = $id;
				$innerObject["previous_shas_votes_count"] = ( $electionRoleVotes->calculated_mi_shas_votes) ? $electionRoleVotes->calculated_mi_shas_votes : 0;
	
				$innerObject["voter_supporters_count"] =  $electionRoleVotes->voter_supporters_count ;
				$innerObject["activists_allocations_assignments"] =   $electionRoleVotes->activistsAllocationsAssignments ;
				// dd($electionRoleVotes);
				$votesLastDate = Votes::select('voters_in_election_campaigns.created_at')->withVotersInElectionCampaign()->where('votes.election_campaign_id' , $currentCampaign->id)->where('ballot_box_id',$id)->orderBy('voters_in_election_campaigns.created_at' , 'DESC')->first();
				$innerObject["last_vote_date"] = $votesLastDate;
				array_push($returnedObject ,$innerObject );
			}
			$jsonOutput->setData($returnedObject );
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	
	}
	/**
	 * @method getEntityBallotBoxesAndShifts
	 * For city - entity_type = 1;
	 * For quarter - entity_type = 6;
	 * 1. Get all entity ballot include count final supporters.
	 * 2. Get  assignment details shifts for every ballot.
	 */
	public function getCityBallotsFullData(
		$entityType,
		$entityKey
	) {
		$jsonOutput = app()->make("JsonOutput");

		try {
			$quarterId = null;
			if (!GlobalController::isActionPermitted('elections.activists.city_summary'))
			throw new Exception(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			if (empty($entityKey))
			throw new Exception(config('errors.elections.MISSING_CITY_KEY'));

			$isAllowed = GlobalController::isAllowedCitiesForUser($entityKey);

			if (!$isAllowed)
			throw new Exception(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));

			if ($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER')) {
				$quarter = QuarterRepository::getQuarterByKey($entityKey);
				$city = CityRepository::getById($quarter->city_id);
				$quarterId = $quarter->id;
			} else {
				$city = CityRepository::getCityByKey($entityKey);
			}

			$cityBallotsShifts = MunicipalElectionsRolesService::getEntityBallotBoxesAndShifts($city->id, $quarterId);
			$jsonOutput->setData($cityBallotsShifts);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	/*
		Returns clusters with count of supporters
		
		@param cityKey
	*/	 
	public function getCityClustersVotersSupportsCount($cityKey) {
		$jsonOutput = app()->make("JsonOutput");
		$result = ClusterBallotsActivistsService::getCityClustersVotersSupportsCount($jsonOutput, $cityKey);
		if(!empty($result)){
			$jsonOutput->setData($result);
		}
	}

	/**
	 * Returns clusters and neighborhoods lists by city key , 
	 * every cluster has count voter, count votes and count ballot allocation and assignment
	 * @param [type] cityKey
	 * @return void
	 */
	public function getCityNeighborhoodsAndClusters($cityKey)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			if (
				!GlobalController::isActionPermitted('elections.activists.city_summary') &&
				!GlobalController::isActionPermitted('elections.activists.cluster_summary')
			) {
				throw new Exception(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			}
			if (empty($cityKey))
			throw new Exception(config('errors.elections.MISSING_CITY_KEY'));

			$city = CityRepository::getCityByKey($cityKey);

			$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);
			if (!$isAllowed)
			throw new Exception(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));

			$resultObj = ClusterBallotsActivistsService::getCityNeighborhoodsAndClusters($city);
			$jsonOutput->setData($resultObj);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}


	/**
	 * Returns total number of electors in last election campaign by cityKey
	 *  @param cityKey
	 * 
	 */
	public function getTotalNumberOfShasElectorsCurrentCampaign($cityKey)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			if (!GlobalController::isActionPermitted('elections.activists.city_summary'))
			throw new Exception(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));

			if ($cityKey == null || trim($cityKey) == '')
				throw new Exception(config('errors.elections.MISSING_CITY_KEY'));

			$cityKey = trim($cityKey);

			$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

			if (!$isAllowed)
			throw new Exception(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));


			$city = CityRepository::getCityByKey($cityKey);
			$resultObj = ClusterBallotsActivistsService::getTotalNumberOfShasElectorsCurrentCampaign($city);
			$jsonOutput->setData($resultObj);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}


	// /**
    //  * @method searchForVoterActivist for assignment in activist city
	//  * get voter key, city, election role system name, 
	//  * function search voter and voter details include return phone number
    //  * @param Request $request
	// */
	// public function searchForElectionVoterActivist(Request $request, $cityKey)
	// {
	// 	$jsonOutput = app()->make("JsonOutput");
	// 	try {
	// 		$searchActivistRequest = new SearchActivistRequest($request, $cityKey);
	// 		$activistDetails = ActivistsAllocationsAssignmentsService::getVoterDetailsAndCheckDuplicateRoles($searchActivistRequest->searchActivist);
	// 		$jsonOutput->setData($activistDetails);
	// 	} catch (\Exception $e) {
	// 		$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
	// 	}
	// }


	public function addRoleAndShiftToActivist(Request $request)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$activistCreateDto = new CreateActivistRequest($request);
			ActivistsAssignmentsCreator::createActivistIncludeRoleAndAssignment($activistCreateDto->activistCreateDto);
			$jsonOutput->setData($activistCreateDto);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	public function exportCityAppointmentLettersFromTashbetz($cityKey, $roleType){
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);
		$city = City::select('id')->where('key', $cityKey)->first();
		if(!$city){ 
			$jsonOutput->setErrorCode(config('errors.elections.INVALID_CITY'));	return;
		}
		ActivistsAssignmentsExportService::exportCityAppointmentLettersFromTashbetz($city, $roleType);
	}
	public function exportCityAppointmentLetters($cityKey, $roleType){
        $jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);

		ini_set("pcre.backtrack_limit", "10000000000");

		$city = City::select('id')->where('key', $cityKey)->first();
		if(!$city){ 
			$jsonOutput->setErrorCode(config('errors.elections.INVALID_CITY'));	return;
		}
		return	ActivistsAssignmentsExportService::exportCityAppointmentLetters($city, $roleType);
	}

	public function exportAppointmentLetter($electionRoleKey, $ballotId, $isBase64 = null){
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);

		return ActivistsAssignmentsExportService::exportAppointmentLetter($electionRoleKey, $ballotId, $isBase64);
	}

	public function exportObserverLetterForBallotLeader($electionRoleKey){
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);

		ini_set("pcre.backtrack_limit", "10000000000");
		ActivistsAssignmentsExportService::exportObserverLetterForBallotLeader($electionRoleKey);
	}
	/*
		!! Maybe not in use!!!
		Function that exports of ballots of city into formatted 
		file/print by cityKey and POST params
	*/
	public function exportCityBallotsToFile(Request $request , $cityKey){
		ActivistsAssignmentsExportService::exportCityBallotsToFile($request, $cityKey);
	}
	/**
	 * 1. Get all entity activists summary
	 * 2. Get all sub entities activists summary
	 */
	public function getMunicipalEntitySummary ($entityType, $entityId, Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$getCityClusters = $request->input('get_city_cluster', null); // Get city cluster - insted of city quarters
		$summaryData = MunicipalElectionsRolesService::getMunicipalEntitySummary($entityType, $entityId, $getCityClusters);
		$jsonOutput->setData($summaryData);
	}
	/**
     * Get municipal election role data - by election role key, and user id
	 */
	public function getMunicipalElectionRoleSummary ($electionRoleKey){
		$jsonOutput = app()->make( "JsonOutput" );
		$summaryData = MunicipalElectionsRolesService::getMunicipalElectionRoleSummary($electionRoleKey);
		$jsonOutput->setData($summaryData);
	}

	public function getCityActivistDetails($cityKey)
	{
		$jsonOutput = app()->make("JsonOutput");
		$city = CityRepository::getCityByKey($cityKey);
		$municipalCoordinators = ActivistsAllocationsRepository::getAllocationAndDetailsAssignmentOfCityActivist($city);
		$jsonOutput->setData($municipalCoordinators);
	}

	public function getQuarterActivistDetails($quarterId)
	{
		$jsonOutput = app()->make("JsonOutput");
		$quarter = QuarterRepository::getQuarterById($quarterId);
		$quarterActivists = ActivistsAllocationsRepository::getAllocationAndDetailsAssignmentOfQuarterActivist($quarter);
		$jsonOutput->setData($quarterActivists);
	}


	public function getClusterDetailsIncludeCountBallotAndVotesByCity($cityKey)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$city = CityRepository::getCityByKey($cityKey);
			$cityClusters = ClusterRepository::getClustersIncludeQuarterNameAndCountballotAndVotesByCity($city, $currentCampaign->id);
			$jsonOutput->setData($cityClusters);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	/** Clusters activists functions */

	public function getClusterActivists(Request $request, $clusterId)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$electionCampaignId = ElectionCampaigns::currentCampaign()->id;
			$clusterActivists = ClusterRepository::getClusterActivists($clusterId, $electionCampaignId);
			$jsonOutput->setData($clusterActivists);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

}
