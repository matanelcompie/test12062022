<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\HousholdCaptainOfFifty;
use App\Models\VoterCaptainFifty;
use App\Models\Neighborhood;
use App\Models\VoterFilter\VoterQuery;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PDF;

class ElectionDayWalkerReportController extends Controller
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
    }
    public $VOTER_ROLE_CAPTAIN_FIFTY_ROLE_ID = 2;
    public $VOTER_ROLE_CLUSTER_LEADER = 5;
    public $STATIONARY_PHONE_TYPE_ID = 1;
    public $DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE = 100;
    public $DEFAULT_CURRENT_PAGE = 1;

    private $CAPTAIN_FIFTY_TYPE = 1;
    private $CLUSTER_LEADER_TYPE = 0;

 
    /**
     * @method  exportReportByParamsAndType()
     * Print/export to pdf file voter search results
     * 
     * @param Request $request
     * @return void
     */

    public function exportReportByParamsAndType(Request $request)
    {
        ini_set('memory_limit', '-1');
        $jsonOutput = app()->make("JsonOutput");
        if ($request->input('format') == 'print' && !GlobalController::isActionPermitted('elections.reports.walkers.election_day.print')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        if ($request->input('format') == 'pdf' && !GlobalController::isActionPermitted('elections.reports.walkers.election_day.export')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaign = $currentCampaign->id;
		
        $jsonOutput->setBypass(true);
        $regular_search_filters = json_decode($request->input('regular_search_filters'), true);
        
        $resultArray = $this->getVotersByQueryParams($request, true, $regular_search_filters);
        $resultArray = $resultArray->toArray();
        // dd($resultArray);
        if ($request->input('order_by_captain_fifties') == $this->CAPTAIN_FIFTY_TYPE ||  // show by captains of fifty
        $regular_search_filters['order_by_captain_fifties'] == $this->CAPTAIN_FIFTY_TYPE) {
            $fullResult = $this->getCaptian50ExportData($resultArray);
            $exportPage = 'electionDayWalker';
        } else { 
            $fullResult =  $this->getBallotsExportData($resultArray);
            $exportPage = 'electionDayWalkerByBallotboxes';
        }
        // dd($fullResult);


        if ($request->input('format') == 'print') {
            return view("reports.$exportPage", array('data' => $fullResult['formattedResultsData'], 'itemsHash' => $fullResult['itemsHash'] , 'printMode' => true));
        } elseif ($request->input('format') == 'pdf') {
            ini_set("pcre.backtrack_limit", "10000000000");
            $pdf = PDF::loadView("reports.$exportPage", [
            'data' => $fullResult['formattedResultsData'],
            'itemsHash' => $fullResult['itemsHash'],
            'printMode' => false, 'columnsNames' => []
            ], [], ['mode' => 'utf-8', 'format' => 'A4-L']);

            return $pdf->stream("תוצאות הליכון יום בחירות" . ".pdf");
        }
    }
    /**
     * @method getCaptian50ExportData
     * Prepare captian50  data for print, from voters data.

     * @param [array] $resultArray - voters array from DB.
     * @return [array]
     * 1. $formattedResultsArray -> Voter list for print
     * 2. $captainHash -> Captain hash - captain50 data hash table.
     */
    private function getCaptian50ExportData(&$resultArray){
        $formattedResultsArray = [];
        $captainHash = [];
        $currentHouseholdId = null;
        $voterIndexInHousehold = 1;
        $indexInCaptain = 1;

        foreach ($resultArray as $index => $voter) {
            $currentCaptain = $voter['captain_voter_id'];
            //Create new voter row for print.

            $voterRow = [
                'firstCaptainVoter' => false,
                'first_name' => $voter['first_name'],
                'last_name' => $voter['last_name'],
                'cluster_name' => $voter['cluster_name'],
                'cluster_city_name' => $voter['cluster_city_name'],
                'personal_identity' => $voter['personal_identity'],
                'voter_serial_number' => $voter['voter_serial_number'],
                'support_status_name' => $voter['support_status_name'],
                'prev_vote_time' => $voter['prev_vote_time'],
                'voter_key' => $voter['voter_key'],
                'captain_voter_id' => $currentCaptain,
            ];
            //Add captain50 to hash table 
            if (!array_key_exists($currentCaptain, $captainHash)) {
                $voterIndexInHousehold = 1;
                $indexInCaptain = 1;
                $voterRow['firstCaptainVoter'] = true;
                $captainHash[$currentCaptain] = [
                    'captain_first_name' => $voter['captain_first_name'] ,
                    'captain_last_name' => $voter['captain_last_name'] ,
                    'captain_personal_identity' => $voter['captain_personal_identity'] ,
                    'captain_phone_number' => $voter['captain_phone_number'] ,
                    'households_count' => 0 ,
                    'voters_count' => 0,
                ] ;
            }
            
            $address = '';

            if ($voter['street']) { $address .= $voter['street']; }
            if ($voter['house']) { $address .= ' ' . $voter['house']; }
            if ($voter['flat']) { $address .= '/' . $voter['flat']; }

            $voterRow['address'] = $address;

            $voterRow['age'] = date("Y") - explode('-', $voter['birth_date'])[0];

            // Get voter phones
            $voterRow['first_phone'] = '';
            $voterRow['second_phone'] = '';
            if (sizeof($voter['voter_phones']) >= 1) {
                $voterRow['first_phone'] = $voter['voter_phones'][0]['phone_number'];
            }
            if (sizeof($voter['voter_phones']) >= 2) {
                $voterRow['second_phone'] = $voter['voter_phones'][1]['phone_number'];
            }
            $ballotMiId = $voter['ballot_box_id'];
            $lastDigit = substr($ballotMiId, -1);
            $ballotMiId = substr($ballotMiId, 0, strlen($ballotMiId) - 1) . '.' . $lastDigit;
            $voterRow['mi_id'] = $ballotMiId;

            $voterRow['transport'] = ($voter['voter_transportation_id'] && $voter['voter_transportation_id'] != -1) ? 'כן' : '';

            // Count households and voter count
            if($currentHouseholdId != $voter['household_id']){
                $captainHash[$currentCaptain]['households_count'] ++;
                $voterIndexInHousehold = 1;
            }else{
                $voterIndexInHousehold ++;
            }
            // Define the voter position in household and captain50.

            $voterRow['index_in_household'] = $voterIndexInHousehold;
            $voterRow['index_in_captain'] = $indexInCaptain;

            $captainHash[$currentCaptain]['voters_count'] ++;
            $indexInCaptain ++;
            
            $formattedResultsArray[]= $voterRow;
        }
      return ['formattedResultsData' => $formattedResultsArray, 'itemsHash' => $captainHash];
    }
    /**
     * @method getBallotsExportData
     * Prepare ballotboxes data for print, from voters data
     * @param [array] $resultArray - voters array from DB.
     * @return [array]
     * $formattedResultsArray ->hash table for ballotboxes
     * ->every ballotbox has voters array.
     */
    private function getBallotsExportData($resultArray){
        $formattedResultsArray = array();
        $voterIndexerInsideHousehold = 1;

        foreach ($resultArray as $index => $voter) {
                if ($voter['mi_id'] != null) {
                    $ballotMiId = $voter['ballot_box_id'];
                    $lastDigit = substr($ballotMiId, -1);
                    $ballotMiId = substr($ballotMiId, 0, strlen($ballotMiId) - 1) . '.' . $lastDigit;

                    if (!array_key_exists($voter['mi_id'], $formattedResultsArray)) {
						$formattedMiId = $voter['mi_id'];
						$formattedMiId = substr($formattedMiId  , 0 , strlen($formattedMiId ) - 1 ).".".substr($formattedMiId  , strlen($formattedMiId ) - 1,1);
                        $formattedResultsArray[$voter['mi_id']]['cluster_city_name'] = $voter['cluster_city_name'];
                        $formattedResultsArray[$voter['mi_id']]['cluster_name'] = $voter['cluster_name'];
                        $formattedResultsArray[$voter['mi_id']]['cluster_address'] = $voter['cluster_street'];
                        $formattedResultsArray[$voter['mi_id']]['ballotbox_name'] = $formattedMiId;
                        $formattedResultsArray[$voter['mi_id']]['num_of_voters'] = 0;
                        $formattedResultsArray[$voter['mi_id']]['num_of_households'] = 0;
                        $formattedResultsArray[$voter['mi_id']]['voters'] = array();
                    }

                    $formattedResultsArray[$voter['mi_id']]['num_of_voters']++;
                    $voter['age'] = date("Y") - explode('-', $voter['birth_date'])[0];

                    $address = '';

                    if ($voter['street']) { $address .= $voter['street']; }
                    if ($voter['house']) { $address .= ' ' . $voter['house']; }
                    if ($voter['flat']) { $address .= '/' . $voter['flat']; }

                    $voter['address'] = $address;

                    // Get voter phones
                    $voter['first_phone'] = '';
                    $voter['second_phone'] = '';
                    if (sizeof($voter["voter_phones"]) >= 1) {
                        $voter['first_phone'] = $voter['voter_phones'][0]['phone_number'];
                    }
                    if (sizeof($voter['voter_phones']) >= 2) {
                        $voter['second_phone'] = $voter['voter_phones'][1]['phone_number'];
                    }

                    $voter['transport'] = ($voter['voter_transportation_id'] && $voter['voter_transportation_id'] != -1) ? 'כן' : '';


                    $prevVoter = $index > 0 ? $resultArray[$index - 1] : null;
                    
                    if ($index == 0  || $voter['household_id'] != $prevVoter['household_id']) {
                        $voterIndexerInsideHousehold = 1;
                        $formattedResultsArray[$voter['mi_id']]['num_of_households']++;
                    } else {
                        $voterIndexerInsideHousehold++;
                    }
                    $voter["index_in_household"] = $voterIndexerInsideHousehold;
                    array_push($formattedResultsArray[$voter['mi_id']]['voters'], $voter);

            }
        }
        // ksort($formattedResultsArray);

      return ['formattedResultsData' => $formattedResultsArray, 'itemsHash' => []];
    }
    /*
    Performs generating captain-of-50-walker report by parama

    @params request
     */
    public function getWalkerReportByParams(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!GlobalController::isActionPermitted('elections.reports.walkers.election_day')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $searhResult = $this->getVotersByQueryParams($request, false, null);
        $jsonOutput->setData($searhResult);
    }


    /**
     * getVotersByQueryParams
     * Get all the search result data.
     * Used for:
     * 1. Get view pagination data. 
     * 2. Get all data for print.
     * @param Request $request
     * @param [type] $isPrintableVersion - print or page view 
     * @param [type] $searchFilters -search request filters
     * @return void
     */

    private function getVotersByQueryParams(Request $request, $isPrintableVersion, $searchFilters)
    {
        $electionCampaignID = -1;
        $currentCampaign = ElectionCampaigns::currentCampaign();
        if ($currentCampaign) {
            $electionCampaignID = $currentCampaign->id;
        }

        $cityKey = $request->input('city_key');
        if (!$cityKey && $searchFilters && array_key_exists('city_key', $searchFilters)) {

            $cityKey = $searchFilters["city_key"];
        }
        $cityID = null;
        if ($cityKey) {
            $cityIDObject = City::select('id')->where('key', $cityKey)->where('deleted', 0)->first();
            if ($cityIDObject) {
                $cityID = $cityIDObject->id;
            }
        }
        $neighborhoodKey = $request->input('neighborhood_key');
        if (!$neighborhoodKey && $searchFilters && array_key_exists('neighborhood_key', $searchFilters)) {

            $neighborhoodKey = $searchFilters["neighborhood_key"];
        }

        $clusterKey = $request->input('cluster_key');
        if (!$clusterKey && $searchFilters && array_key_exists('cluster_key', $searchFilters)) {

            $clusterKey = $searchFilters["cluster_key"];
        }
        $ballotBoxKey = $request->input('ballot_box');
        if (!$ballotBoxKey && $searchFilters && array_key_exists('ballot_box', $searchFilters)) {

            $ballotBoxKey = $searchFilters["ballot_box"];
        }

        if(!$searchFilters){
            $votersVoteStatus = $request->input('voters_vote_status',null);
            $voterFilterType = $request->input("voter_type",null);
            $voterFilterIdentityNumber = $request->input("voter_personal_identity",null);
            $personal_identity = $request->input("personal_identity",null);
            $displayMode = $request->input("order_by_captain_fifties",null);
        }else{
            $votersVoteStatus = isset($searchFilters['voters_vote_status']) ? $searchFilters['voters_vote_status']: null;
            $voterFilterType = isset($searchFilters['voter_type']) ? $searchFilters['voter_type']: null;
            $voterFilterIdentityNumber = !empty($searchFilters['voter_personal_identity']) ? $searchFilters['voter_personal_identity']: null;
            $personal_identity = !empty($searchFilters['personal_identity']) ? $searchFilters['personal_identity']: null;
            $displayMode = isset($searchFilters['order_by_captain_fifties']) ? $searchFilters['order_by_captain_fifties']: null;
        }
        /* Pagination: */
        $skipRows = $request->input('skip_rows', 0);


        $resultsPerPage = $this->DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE;
        

        $filtersData = [
            'cityID' => $cityID,
            'isPrintableVersion' => $isPrintableVersion,
            'resultsPerPage' => $resultsPerPage,
            'neighborhoodKey' => $neighborhoodKey,
            'clusterKey' => $clusterKey,
            'ballotBoxKey' => $ballotBoxKey,
            'electionCampaignID' => $electionCampaignID,
            'votersVoteStatus' => $votersVoteStatus,
            'voterFilterType' => $voterFilterType,
            'displayMode' => $displayMode,
            'voterFilterIdentityNumber' => $voterFilterIdentityNumber,
        ];
        if ($displayMode == $this->CAPTAIN_FIFTY_TYPE) {
            $mainQuery = $this->getVotersByCaptainsOfFifty($filtersData);
        }else {
            $mainQuery = $this->getVotersByBallots($filtersData);
        }

        // dd($mainQuery->toSql());

		if (!$isPrintableVersion) {
            $resultArray = [];
            if($skipRows == 0){
                $countQuery = VoterQuery::select('id');
                $this->addWhereConditionsToQuery($countQuery, $filtersData);
                $resultArray['total_voters_count'] =  $countQuery->select(DB::raw('count(distinct voters.id) as voter_count'))->first()->voter_count;
            }
            $voterList = $mainQuery->skip($skipRows)->take($resultsPerPage)->get();
            $itemsHash = $this->getItemsHash($voterList, $filtersData);
            $resultArray["items_hash"] = $itemsHash ;
            $resultArray["voters_list"] = $voterList;
        }
		else{
            $resultArray = $mainQuery->get();
		}
        return $resultArray;

    }
    /**
     * @method getItemsHash
     * Get the hash table for main entities
     * 1. Cpatains of 50
     * 2. Ballotboxes
     * Return the voters and households counters
     * -> Used for pagintion display counters.
     * -Acording to the query Conditions.
     * @param [array] $voterList - array of voters from query result.
     * @param [array] $filtersData - request query params.
     * @return void
     */
	private function getItemsHash($voterList, $filtersData){
        $displayMode = $filtersData['displayMode'];
        $itemsHash = [];
        $displayId = $displayMode == $this->CAPTAIN_FIFTY_TYPE ? 'captain_voter_id' : 'ballot_box_id';
        $dbTable = $displayMode == $this->CAPTAIN_FIFTY_TYPE ? 'captain_voters' : 'ballot_boxes';
		foreach($voterList as $voter){
			$itemId = $voter->$displayId;
			if(empty($itemsHash[$itemId])){ //get captain data.
				$countData = [];

                $countQuery = VoterQuery::where("$dbTable.id", $itemId);
                self::addWhereConditionsToQuery($countQuery, $filtersData);
                $countQuery->select([
                       DB::raw('count(distinct voters.id) as voter_count'),
                       DB::raw('count(distinct voters.household_id) as household_count'),
                ]);
                
				$itemsHash[$itemId] = $countQuery->first();
			}
		}
		return $itemsHash;
    }
    /**
     * @method getVotersByBallots()
     *  Prepare ballotboxes full voters query.
     *  -> Add ballotboxes order by fileds
     * @param [array] $filtersData - request filters data.
     * @return void
     */
    private function getVotersByBallots($filtersData){
        $mainQuery = VoterQuery::select('voters.id')
        ->orderBy('ballot_boxes.mi_id', 'ASC')
        ->orderBy('clusters.name', 'ASC')
        ->orderBy('voter_serial_number')
        ->orderBy('voters.household_id');

        self::getVotersFullQuery($mainQuery, $filtersData);

        return $mainQuery;
    }
    /**
     * @method getVotersByCaptainsOfFifty()
     *  Prepare captain50 full voters query.
     *  -> Add captain 50 fields details
     *  -> Add captain 50 order by fileds
     * @param [array] $filtersData  - request filters data.
     * @return void
     */
    private function getVotersByCaptainsOfFifty($filtersData){

        $mainQuery = VoterQuery::select('voters.id');

        self::getVotersFullQuery($mainQuery, $filtersData);

        $mainQuery->addSelect([
            'captain_voters.id as captain_voter_id',
            'captain_voters.personal_identity as captain_personal_identity',
            'captain_city.name as captain_city_name',
            'election_roles_by_voters.phone_number as captain_phone_number'
        ]);
        
        $mainQuery
        ->leftJoin('election_roles_by_voters', 'captain_voters.id', 'election_roles_by_voters.voter_id')
        ->orderBy('captain_voters.first_name' , 'ASC')
        ->orderBy('captain_voters.last_name' , 'ASC')
        ->orderBy('ballot_boxes.mi_id', 'ASC')
        ->orderBy('voters.household_id');

        return $mainQuery;
    }
    /**
     * @method getVotersFullQuery 
     * Create voters query.
     * -> Get all the voters fields data.
     * -> Join tables that not belong to "where" Conditions.
     * @param [Model] $query - voters query builder
     * @param [array] $filtersData - request filters data.
     * @return void
     */
    private function getVotersFullQuery(&$query, $filtersData)
    {
		 
            $electionCampaignID = $filtersData['electionCampaignID'];
            $prevElectionCampaignID = ElectionCampaigns::previousCampaign()->id;

            $orderByPhoneQuery = "CASE WHEN voter_phones.id = voters.main_voter_phone_id THEN 1 WHEN ".
            "voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ".
            "ASC ,voter_phones.updated_at DESC, voter_phones.id";


            $prevVotesTimeQuery ="(CASE WHEN TIME(prev_votes.vote_date) < '12:00:00' THEN 'בוקר'
            WHEN TIME(prev_votes.vote_date) BETWEEN '12:00:00' AND '15:00:00' THEN 'צהריים'
            WHEN TIME(prev_votes.vote_date) BETWEEN '15:00:00' AND '18:00:00' THEN 'אחה\'\'צ'
            WHEN TIME(prev_votes.vote_date) > '18:00:00' THEN 'ערב'
            ELSE 'לא הצביע' END) AS prev_vote_time";

            $fieldsList = [
                'voters.id as id', 'voters.key as voter_key', 'voters.personal_identity', 'voters.first_name', 'voters.last_name',
                'voters.birth_date', 'voters.city_id', 'c.name as city_name', 'voters.street' , 'voters.street_id' ,
                 'streets.name as direct_voter_street_name', 'voters.actual_address_correct', 'voters.main_voter_phone_id',
                'voters.email', 'voters.house', 'voters.main_voter_phone_id', 'voters.house_entry', 'voters.flat',
                'voters.zip', 'voters.household_id', 'c.key as city_key', 'voters.not_at_home', 'voters.additional_care',
                'ballot_box_id', 'voter_serial_number', 'ballot_boxes.key as ballot_box_key', 'ballot_boxes.mi_id',
                'support_status.name as support_status_name', 'voter_support_status.support_status_id',
                'neighborhoods.key as neighborhood_key', 'clusters.city_id as cluster_city_id',
                DB::raw($this->fullClusterNameQuery .' as cluster_name'),
                'clusters.key as cluster_key', 'cities.name as cluster_city_name', 'clusters.street as cluster_street',
                'voter_transportations.id as voter_transportation_id',
                'voter_transportations.from_time', 'voter_transportations.to_time', 'voter_transportations.cripple',
                'captain_voters.first_name as captain_first_name',
                'captain_voters.last_name as captain_last_name',
                DB::raw($prevVotesTimeQuery)
            ];

            self::addWhereConditionsToQuery($query, $filtersData);

            $query->with(['voterPhones' => function ($innerQuery) use ($orderByPhoneQuery) {
                $innerQuery->select('voter_phones.id as phone_id','voter_phones.phone_number',
                'voter_phones.phone_type_id' , 'voter_phones.voter_id')
                ->withVoters()->orderByRaw($orderByPhoneQuery);
            }])
            ->leftJoin('votes as prev_votes',function($joinOn) use($prevElectionCampaignID){
                $joinOn->on([
                    'prev_votes.voter_id' => 'voters.id',
                    'prev_votes.election_campaign_id' => DB::raw($prevElectionCampaignID),
                ]);
            })

            ->withVoterTransportations()
            ->leftJoin('streets','streets.id','=','voters.street_id')
            ->select($fieldsList)
			->where('voter_support_status.deleted',0)
            ->groupBy('voters.id');
            
        // dd($query->toSql());
    }
    /**
     * @method  addWhereConditionsToQuery()
     * Create the query "where" filters
     * 1. Get the voters for view pagination.
     * 2. Get the counters for ballotboxes and captain50.
     * 3. Get the counters for global voters counter.
     * 4. Get all voters for export to print.
     *    
     * @param [Model] $query - voters query builder
     * @param [array] $filtersData - request filters data.
     * @return void
     */
    private function addWhereConditionsToQuery($query, $filtersData){
        
        $electionCampaignID = $filtersData['electionCampaignID'];
        $votersVoteStatus = $filtersData['votersVoteStatus'];
        $voterFilterType = $filtersData['voterFilterType'];
        $voterFilterIdentityNumber = $filtersData['voterFilterIdentityNumber'];

        $query->withCity()
        ->withVoterBallotAddressDetails($electionCampaignID)

        // Only voters that supported (Final status).
        ->join('voter_support_status',function($joinOn) use($electionCampaignID){
            $joinOn->on(['voter_support_status.voter_id' => 'voters.id',
            'voter_support_status.election_campaign_id' => DB::raw($electionCampaignID),
            'voter_support_status.entity_type' => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')),
            'voter_support_status.deleted' => DB::raw('0')]);
        })
        ->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id')
        ->where('support_status.level', '>', 0);

        if ($votersVoteStatus == '1') {
            $query->whereHas('votes', function ($deepQuery) use ($electionCampaignID) {
                $deepQuery->where('election_campaign_id', $electionCampaignID);});
        } elseif ($votersVoteStatus == '0') {
            $query->whereDoesntHave('votes', function ($deepQuery) use ($electionCampaignID) {
                $deepQuery->where('election_campaign_id', $electionCampaignID);});
        }
        $clusterIds = [];

        if ($voterFilterType != null && $voterFilterIdentityNumber != null) {
            if($voterFilterType == $this->CLUSTER_LEADER_TYPE) { //If cluster leader filter had selected 
                $leaderClusters = Cluster::select('clusters.id')->withLeader(false)
                ->where('voters.personal_identity', $voterFilterIdentityNumber)->get();
                foreach($leaderClusters as $cluster){$clusterIds[] = $cluster->id;}
                $query->whereIn('clusters.id' ,  $clusterIds);

            }
            if ($voterFilterType == $this->CAPTAIN_FIFTY_TYPE) { //If captain 50 filter had selected 
               $query->where('captain_voters.personal_identity', $voterFilterIdentityNumber);
            }
        }
        // Only voters with captain 50.
        $captain50leftJoin = true;
        if($filtersData['displayMode'] == $this->CAPTAIN_FIFTY_TYPE || $filtersData['voterFilterType'] == $this->CAPTAIN_FIFTY_TYPE){
            $captain50leftJoin = false;
        } 
        $query->withCaptainOnly($electionCampaignID , $captain50leftJoin);
        self::AddGeoFiltersToQuery($query, $filtersData);
        return $query;
    }
    /**
     * Undocumented function
     *
     * @param [type] $query
     * @param [type] $filtersData
     * @return void
     */
    private function AddGeoFiltersToQuery($query, $filtersData)
    {
        $cityID = $filtersData['cityID'];
        $neighborhoodKey = $filtersData['neighborhoodKey'];
        $clusterKey = $filtersData['clusterKey'];
        $ballotBoxKey = $filtersData['ballotBoxKey'];

        if ($cityID) {
            $query->where('clusters.city_id', $cityID);
        }
        if ($neighborhoodKey) {
            $query->where('neighborhoods.key', $neighborhoodKey);
        }
        if ($clusterKey) {
            $query->where('clusters.key', $clusterKey);
        }
        if ($ballotBoxKey) {
            $query->where('ballot_box_id', $ballotBoxKey);
        }
        return $query;
    }
    /*
    Function that search captain of 50 voters by params , in current election campaign.
    search params :
    cityKey , clusterKey , voterPersonalName , voterFirstName , voterLastName

    mandatory :  cityKey or clusterKey or PersonalIdentity
    search types : 1 - by captain 50 , 0 - by cluster leader
     */
    public function searchVoterByParams(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $cityKey = $request->input("city_key");
        $clusterKey = $request->input("cluster_key");
        $personalIdentity = $request->input("personal_identity");
        $searchByCap50 = ($request->input("search_type") == '1' ? true : false);
        $city = null;
        $cluster = null;
        if ($cityKey != null && trim($cityKey) != '') {
            $city = City::select('id')->where('key', $cityKey)->where('deleted', 0)->first();
            if (!$city) {
                $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
                return;
            }
            $cityID = $city->id;
            $isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

            if (!$isAllowed) {
                $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
                return;
            }
        }
        if ($clusterKey != null && trim($clusterKey) != '') {
            if ($cityKey != null && trim($cityKey) != '') {
                $cluster = Cluster::select('id')->where('city_id', $cityID)->where('key', $clusterKey)->first();
                if (!$cluster) {
                    $jsonOutput->setErrorCode(config('errors.elections.CLUSTER_NOT_EXISTS'));
                    return;
                }
            } else {

                $cluster = Cluster::select('id', 'city_id')->where('key', $clusterKey)->first();
                if (!$cluster) {
                    $jsonOutput->setErrorCode(config('errors.elections.CLUSTER_NOT_EXISTS'));
                    return;
                }
                $clusterCity = City::select('id', 'key')->where('id', $cluster->city_id)->where('deleted', 0)->first();
                if (!$clusterCity) {
                    $jsonOutput->setErrorCode(config('errors.global.CITY_DOESNT_EXIST'));
                    return;
                } else {
                    $isAllowed = GlobalController::isAllowedCitiesForUser($clusterCity->key);

                    if (!$isAllowed) {
                        $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
                        return;
                    }
                }
            }

        }

        if ($personalIdentity != null && trim($personalIdentity) != '') {
            $personalIdentity = trim($personalIdentity);
            $personalIdentity = ltrim($personalIdentity, '0');

            if (preg_match('|^[1-9][0-9]*$|', $personalIdentity) != true) {
                $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                return;
            }
        }

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $electionCampaignID = $currentCampaign->id;
        $electionRolesByVoters = ElectionRolesByVoters::select('ballot_box_id', 'election_roles_by_voters.voter_id',
            'election_roles_by_voters.election_role_id', 'personal_identity',
            'first_name', 'last_name', 'voters.city_id as voter_city_id', 'clusters.city_id as cluster_city_id', 'clusters.id as cluster_id',
            'cities.name as city_name')->withVoterAndCity()->withVoterInElectionCampaign()
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignID);

        if ($searchByCap50) {
            $electionRolesByVoters->where('election_roles_by_voters.election_role_id', $this->VOTER_ROLE_CAPTAIN_FIFTY_ROLE_ID)->with(['ministersOfFifty' => function ($query)
                 use ($electionCampaignID) {$query->select('captain_id', 'household_id')->where('election_campaign_id', $electionCampaignID);}]);
        } else {
            $electionRolesByVoters->where('election_roles_by_voters.election_role_id', $this->VOTER_ROLE_CLUSTER_LEADER);
        }
        if ($city) {
            $electionRolesByVoters->where(function ($query) use ($city) {
                $query->where('voters.city_id', $city->id)
                    ->orWhere('clusters.city_id', $city->id);
            });
        }
        if ($cluster) {
            $electionRolesByVoters->where('clusters.id', $cluster->id);
        }
        if ($personalIdentity) {
            $electionRolesByVoters->where('personal_identity', $personalIdentity);
        }
        if ($request->input('first_name') != null && trim($request->input('first_name')) != '') {
            $electionRolesByVoters->where('first_name', 'like', '%' . $request->input('first_name') . '%');
        }
        if ($request->input('last_name') != null && trim($request->input('last_name')) != '') {
            $electionRolesByVoters->where('last_name', 'like', '%' . $request->input('last_name') . '%');
        }
        $electionRolesByVotersArr = $electionRolesByVoters->get();

        $arrayVoterIDS = [];
        $returnedArray = [];
        for ($i = 0; $i < sizeof($electionRolesByVotersArr); $i++) {
            if (in_array(trim($electionRolesByVotersArr[$i]->voter_id), $arrayVoterIDS) == false) {
                array_push($arrayVoterIDS, trim($electionRolesByVotersArr[$i]->voter_id));
                array_push($returnedArray, ['first_name' => $electionRolesByVotersArr[$i]->first_name,
                    'last_name' => $electionRolesByVotersArr[$i]->last_name,
                    'personal_identity' => $electionRolesByVotersArr[$i]->personal_identity,
                    'captains_50_count' => $electionRolesByVotersArr[$i]->ministersOfFifty->count(),
                    'city_name' => $electionRolesByVotersArr[$i]->city_name,
                    'cluster_city_id' => $electionRolesByVotersArr[$i]->cluster_city_id]
                );
            }
        }

        $jsonOutput->setData($returnedArray);
    }

    /*
    Function that returns clusters list by cityKey

    @param cityKey
     */
    public function getClustersByCityKey($cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.activists.cluster_summary')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        if ($cityKey == null || trim($cityKey) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
            return;
        }
        $city = City::select('id')->where('key', $cityKey)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
            return;
        }
        $cityID = $city->id;
        $isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

        if (!$isAllowed) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }
        $clusters = Cluster::select('id', 'key', DB::raw($this->fullClusterNameQuery.' as name'))->where('city_id', $cityID)->get();
        $jsonOutput->setData($clusters);
    }

    /*
    Function that returns clusters list and neighborhoods list by cityKey

    @param cityKey
     */
    public function getClustersAndNeightborhoodsAndBallotBoxesByCityKey($cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.activists.cluster_summary')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        if ($cityKey == null || trim($cityKey) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
            return;
        }
        $city = City::select('id')->where('key', $cityKey)->where('deleted', 0)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
            return;
        }
        $cityID = $city->id;
        $isAllowed = GlobalController::isAllowedCitiesForUser($cityKey);

        if (!$isAllowed) {
            $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
            return;
        }
        $clusters = Cluster::select('id', 'key',DB::raw($this->fullClusterNameQuery.' as name'), 'neighborhood_id', 'city_id')->where('city_id', $cityID)->get();
        $neighborhoods = Neighborhood::select('id', 'key', 'name')->where('city_id', $cityID)->where('deleted', 0)->get();
        $clustersIDS = array();
        for ($i = 0; $i < sizeof($clusters); $i++) {
            array_push($clustersIDS, $clusters[$i]->id);
        }
        $ballotBoxes = BallotBox::select('ballot_boxes.id', 'ballot_boxes.mi_id', 'cluster_id', 'neighborhood_id')
        ->whereIn('cluster_id', $clustersIDS)->withCluster()->get();

        for ($i = 0; $i < sizeof($ballotBoxes); $i++) {
            $mi_id =$this->getBallotMiId($ballotBoxes[$i]->mi_id);
			$ballotBoxes[$i]->mi_id = $mi_id;
        }
        $jsonOutput->setData(['clusters' => $clusters, 'neighborhoods' => $neighborhoods, 'ballotBoxes' => $ballotBoxes]);
    }

}
