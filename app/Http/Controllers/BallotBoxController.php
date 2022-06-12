<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\GlobalController;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\City;
use App\Models\Cluster;
use App\Models\VotersInElectionCampaigns;
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesGeographical;
use App\Models\BallotBox;
use App\Models\Neighborhood;
use App\Models\GeographicFilters;
use App\Models\Voters;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoles;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoleShifts;
use App\Models\SupportStatus;
use Auth;

use App\Libraries\Helper;
use App\Libraries\Services\ExportService;
use App\Libraries\Services\GeoFilterService;

class BallotBoxController extends Controller {
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
        // $this->lastClusterNameQuery = Cluster::getClusterFullNameQuery('', true, 'current_cluster');
    }
    private $currentCampaignId = -1;
    private $currentBallotQuery =  "SELECT current_ballot.id from ballot_boxes as current_ballot
        JOIN clusters as current_cluster on current_cluster.id = current_ballot.cluster_id 
        WHERE current_ballot.mi_id = ballot_boxes.mi_id AND current_cluster.city_id = cities.id AND current_cluster.election_campaign_id " ;
   
   private $currentClusterQuery =  "SELECT current_cluster.id from clusters as current_cluster
        WHERE current_cluster.mi_id = clusters.mi_id AND current_cluster.city_id = cities.id AND current_cluster.election_campaign_id " ;

    /**
     * 
     * @param Request $request
     * @return json
     * 
     * provide json with list of the related ballot boxes using filter
     * filters:
     * Geo location: key of: [area, city, cluster, ballot box]
     * only_crippled_boxes: is set only crippled boxes will be returned according to the Geo location.
     */
    public function ballotBox(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $this->currentCampaignId = $currentCampaign['id'];

        $relventFields = [
            'cities.name AS city_name', 'cities.mi_id AS city_mi_id',
             DB::raw($this->fullClusterNameQuery), 'ballot_boxes.mi_id AS ballot_boxes_mi_id',
              'ballot_boxes.key AS ballot_boxes_key',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),
        ];

        $query = BallotBox::select($relventFields)
                ->WithCluster()
                ->WithCity();
        $isGeoFilterExists = $this->addGeographicalFilter($request, $query);

        if (!$isGeoFilterExists) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        if ($request->has('only_crippled_boxes')) {
            $query->where('crippled', 1)->orWhere('special_access', 1);
        }

        $result = $query
                ->where('clusters.election_campaign_id', $this->currentCampaignId)
                ->get();

        $jsonOutput->setData($result);
    }

    /**
     * 
     * @param $ballotBoxKey
     * @return json
     * 
     * provide json of ballot box with list of the related activists
     * the returned json will include:
     *  - ballot_geo: the city, cluster, ballot box
     *  - ballot_details: crippled, if has special access, election campaign id
     *  - shas_votes_count: the count of votes for Shas in this filter area.
     *  - activists: list of voters (name, last name, voter city, election role, voter phone number and shift).
     */
    public function getBallotBox($ballotBoxKey) {
        $jsonOutput = app()->make("JsonOutput");

        if ($ballotBoxKey == null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_BALLOT_BOX_KEY'));
            return;
        }
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $this->currentCampaignId = $currentCampaign['id'];
        
        $relventFields = [
            'ballot_boxes.id AS id', 'cities.name AS city_name', 'cities.mi_id AS city_mi_id',
             DB::raw($this->fullClusterNameQuery), 'ballot_boxes.cluster_id AS cluster_id', 'ballot_boxes.mi_id AS ballot_boxes_mi_id', 'ballot_boxes.key AS ballot_boxes_key',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),
            'voter_count', 'clusters.election_campaign_id AS election_campaign_id'
        ];


        $ballotBox = BallotBox::select($relventFields)
                ->WithCluster()
                ->WithCity()
                ->with(array('activists' => function($query) {
                        $query->select('election_role_by_voter_geographic_areas.election_role_by_voter_id as election_role_by_voter_id'
                                , 'election_role_by_voter_geographic_areas.entity_id AS entity_id', 'election_roles_by_voters.voter_id AS voter_id'
                                , 'voters.first_name AS voter_first_name', 'voters.last_name AS voter_last_name', 'voters.mi_city AS voter_mi_city'
                                , 'election_roles_by_voters.election_role_id AS election_role_id', 'election_roles.name AS election_role_name'
                                , 'election_roles_by_voters.phone_number AS election_role_voter_phone_number', 'election_role_shifts.name AS election_role_shifts_name')
                        ->WithElectionRolesByVoters()
                        ->WithElectionRoles()
                        ->WithElectionRoleShifts()
                        ->WithVoters();
                    }))
                ->where('clusters.election_campaign_id', $this->currentCampaignId)->where('ballot_boxes.key', $ballotBoxKey)
                ->first();


        $jsonOutput->setData($ballotBox);
    }

    
    /**
     * 
     * @param Request $request
     * @return json 
     * 
     * summary about all ballot boxes votes, filtered by the key of [area, city, cluster, ballot box]
     * filters:
     * - Geo location: key of: {area, city, cluster, ballot box}
     * - group_by_param:[ballot, cluster, city, area] group the results using ope of these options
     * - with_support_status: if {&with_support_status=true} is added to the url request, Shas support status on the ballots will be added.
     * **
     * the returned json will include:
     *  - ballots_results: the votes results for the ballots
     *  - shas_votes_count: the count of votes for Shas in this filter area.
     *  - support_status: if requested.
     * **
     * optional requests:
     * ...?ballot_box_key=qehnkqg2z5&group_by_param=ballot
     * ...?cluster_key=r07tq&group_by_param=ballot&with_support_status=true
     * ...?area_key=3hc85k5yyw&group_by_param=city
     * ...area_key=3hc85k5yyw&group_by_param=cluster&with_support_status=true
     */
	 
    public function ballotsResultsSummary(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaign = ElectionCampaigns::currentLoadedVotersCampaign();
        $this->currentCampaignId = $currentCampaign['id'];
        $result = [];

        $relventFields = [
            'ballot_boxes.voter_count', 'ballot_boxes.votes_count'
            , 'ballot_boxes.invalid_votes_count', 'ballot_boxes.cluster_id'
            , DB::raw('sum(election_campaign_party_list_votes.votes) AS valid_votes_count')
        ];

        $query = ElectionCampaignPartyListVotes::select($relventFields)
                ->withBallotBox()
                ->groupBy('ballot_boxes.id');

        // in case of cluster/city grouping, regenerate the query using the basic one.
        $query = $this->addGroupingFilter($request, $query);
        $isGeoFilterExists = $this->addGeographicalFilter($request, $query);

        if (!$isGeoFilterExists) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        $result['ballots_results'] = $query
                ->where('clusters.election_campaign_id', $this->currentCampaignId)
                ->get();

        $result['shas_votes_count'] = $this->shasSupportStatusData($request, $jsonOutput);

        if ($request->has('with_support_status')) {
            $result['support_status'] = $this->supportStatusSummary($request);
        }
        $jsonOutput->setData($result);
    }

	/*
		Private helpful function that adds to query the correct geo-filter query , by entity type
	*/
    private function addGeographicalFilter($request, &$query) {
        if ($request->has('ballot_box_key')) {
            $query->where('ballot_boxes.key', $request->input('ballot_box_key'));
            return TRUE;
        }

        if ($request->has('cluster_key')) {
            $query->where('clusters.key', $request->input('cluster_key'));
            return TRUE;
        }

        if ($request->has('city_key')) {
            $query->where('cities.key', $request->input('city_key'));
            return TRUE;
        }

        if ($request->has('area_key')) {
            $query->withArea()->where('areas.key', $request->input('area_key'));
            return TRUE;
        }
        return FALSE;
    }

	/*
		Private helpful function that adds to query the correct entity-wrapping tables , by entity type
	*/
    private function addGroupingFilter($request, $query) {
        $groupParameter = $request->input('group_by_param');

        if ($groupParameter == 'ballot') {
            return $query->addSelect('cities.name AS city_name', 'cities.mi_id AS city_mi_id'
                                    , 'clusters.id AS cluster_id', DB::raw($this->fullClusterNameQuery)
                                    , 'ballot_boxes.mi_id AS ballot_boxes_mi_id', 'ballot_boxes.id AS ballot_boxes_id')
                            ->withCluster()
                            ->withCity();
        }

        if ($groupParameter == 'cluster') {
            return Cluster::select(
                                    'cities.name AS city_name', 'cities.mi_id AS city_mi_id'
                                    , 'clusters.id AS cluster_id', DB::raw($this->fullClusterNameQuery),
                                     DB::raw('sum(votes.valid_votes_count) AS valid_votes_count')
                                    , DB::raw('sum(votes.voter_count) AS voter_count')
                                    , DB::raw('sum(votes.votes_count) AS votes_count')
                                    , DB::raw('sum(votes.invalid_votes_count) AS invalid_votes_count')
                            )
                            ->join(DB::raw('( ' . $query->toSql() . ' ) AS votes', $query->getBindings()), function($join) {
                                $join->on('clusters.id', '=', 'votes.cluster_id');
                            })
                            ->withCity()
                            ->groupBy('clusters.id');
        }

        if ($groupParameter == 'city') {
            return Cluster::select(
                                    'cities.name AS city_name', 'cities.mi_id AS city_mi_id'
                                    , DB::raw('sum(votes.valid_votes_count) AS valid_votes_count')
                                    , DB::raw('sum(votes.voter_count) AS voter_count')
                                    , DB::raw('sum(votes.votes_count) AS votes_count')
                                    , DB::raw('sum(votes.invalid_votes_count) AS invalid_votes_count')
                            )
                            ->join(DB::raw('( ' . $query->toSql() . ' ) AS votes', $query->getBindings()), function($join) {
                                $join->on('clusters.id', '=', 'votes.cluster_id');
                            })
                            ->withCity()
                            ->groupBy('clusters.city_id');
        }
    }

	/*
		Private helpful function that returns support statuses summary for roles in current election campaign , grouped by 'group_by_param'
	*/
    private function supportStatusSummary($request) {
        $query = VoterElectionCampaigns::select('support_status.name', DB::raw('COUNT(voters_in_election_campaigns.voter_id) AS support_count'))
                ->withVoterSupportStatus($this->currentCampaignId)
                ->withSupportStatus(TRUE)
                ->withBallotBox()
                ->withCluster()
                ->withCity()
                ->withArea()
                ->where('voters_in_election_campaigns.election_campaign_id', $this->currentCampaignId)
                ->groupBy('voter_support_status.support_status_id');

        $groupParameter = $request->input('group_by_param');

        if ($groupParameter == 'ballot') {
            $query->addSelect('ballot_boxes.id AS ballot_boxes_id', 'ballot_boxes.key AS ballot_boxes_key')
                    ->groupBy('voters_in_election_campaigns.ballot_box_id');
        }

        if ($groupParameter == 'cluster') {
            $query->addSelect('clusters.id AS cluster_id', DB::raw($this->fullClusterNameQuery))
                    ->groupBy('ballot_boxes.cluster_id');
        }

        if ($groupParameter == 'city') {
            $query->addSelect('cities.name AS city_name')
                    ->groupBy('cities.id');
        }


        if ($request->has('ballot_box_key')) {
            $query->where('ballot_boxes.key', $request->input('ballot_box_key'));
        }

        if ($request->has('cluster_key')) {
            $query->where('clusters.key', $request->input('cluster_key'));
        }

        if ($request->has('city_key')) {
            $query->where('cities.key', $request->input('city_key'));
        }

        if ($request->has('area_key')) {
            $query->where('areas.key', $request->input('area_key'));
        }
        return $query->get();
    }

	/*
		Private helpful function that returns shas supports statuses data
	*/
    private function shasSupportStatusData($request, $jsonOutput) {
        $relventFields = [
            'ballot_boxes.voter_count', 'ballot_boxes.votes_count'
            , 'ballot_boxes.invalid_votes_count', 'ballot_boxes.cluster_id'
            , DB::raw('sum(election_campaign_party_list_votes.votes) AS valid_votes_count')
        ];

        $query = ElectionCampaignPartyListVotes::select($relventFields)
                ->withBallotBox()
                ->withElectionCampaignPartyLists()
                ->where('election_campaign_party_lists.election_campaign_id', DB::raw($this->currentCampaignId))
                ->where('election_campaign_party_lists.shas', DB::raw(1))
                ->groupBy('ballot_boxes.id')
                ->groupBy('election_campaign_party_list_votes.election_campaign_party_list_id');

        // in case of cluster/city grouping, regenerate the query using the basic one.
        $query = $this->addGroupingFilter($request, $query);
        $isGeoFilterExists = $this->addGeographicalFilter($request, $query);

        if (!$isGeoFilterExists) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        $result = $query
                ->where('clusters.election_campaign_id', $this->currentCampaignId)
                ->get();
        return (count($result)) ? $result[0]['valid_votes_count'] : 0;
    }

	/*
		Private helpful function that checks if input params is valid integer
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
		Private helpful function that get count of support statuses by selected statuses ids + optional without status count
	*/
    private function getCountStatusesFields($supportStatusConnectedHash, $isSupportStausNoneSelected) {
	 
        $statusesFields = [];
        $sumStatusesFields = [];

        for ( $stausIndex = 0; $stausIndex < count($supportStatusConnectedHash); $stausIndex++ ) {
            $selectedSupportStatusIds = $supportStatusConnectedHash[$stausIndex];

            $countField = "COUNT(CASE WHEN voter_support_status.support_status_id IN (" . implode(",", $selectedSupportStatusIds).")";
            $countField .= " THEN 1 END) AS count_voters_support_status" . $selectedSupportStatusIds[0];

            $statusesFields[] = DB::raw($countField);
            $sumStatusesFields[] = DB::raw('sum(count_voters_support_status' . $selectedSupportStatusIds[0] . ') as sum_voters_support_status' . $selectedSupportStatusIds[0]);
        }

        if ($isSupportStausNoneSelected) {
			
            $noStatusField = "COUNT(CASE WHEN voter_support_status.support_status_id IS NULL ";
            $noStatusField .= "THEN 1 END) AS count_voter_support_status_none";

            $statusesFields[] = DB::raw($noStatusField);
            $sumStatusesFields[] = DB::raw('sum(count_voter_support_status_none) as sum_voter_support_status_none');
        }

        $result = [
            'statusesFields' => $statusesFields,
            'sumStatusesFields' => $sumStatusesFields
        ];
 
        return $result;
    }

    private function addGeographicalFiltersToQuery(&$queryObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, $restrictedGeoLists = null){
        if ( count($ballot_id)>0 ) {
            $queryObj->whereIn('ballot_boxes.key', $ballot_id);
       }
       elseif(count($cluster_id ) > 0){
            $queryObj = $queryObj->whereIn('clusters.key',$cluster_id);
       }
       elseif(count($selectedNeighborhoodIDS)>0){
            $queryObj = $queryObj->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
       }
       elseif(count($city_id ) > 0){	
           $queryObj = $queryObj->whereIn('cities.key',$city_id);
       }
       if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
                $queryObj=$queryObj->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
        }
        if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
                $queryObj=$queryObj->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
        }
        if($restrictedGeoLists && $restrictedGeoLists->neighborhoodsIDSArray && count($restrictedGeoLists->neighborhoodsIDSArray) > 0){
                $queryObj=$queryObj->whereIn('clusters.neighborhood_id',$restrictedGeoLists->neighborhoodsIDSArray);
        }

       
    }
	/*
		Function that returns ballots summary by area
    */
    public function displayBallotsPollingSummaryByArea(Request $request, $exportToFile = false , $restrictedGeoLists=null) {
		$city_id = json_decode($request->input('selected_cities'));
        $neighborhood_keys = json_decode($request->input('selected_neighborhoods'));
        $cluster_id = json_decode($request->input('selected_clusters'));
        $ballot_id = json_decode($request->input('selected_ballots'));
 
        $selectedNeighborhoodIDS = [];
        if(!empty($neighborhood_keys)){
            $neighborhoods = Neighborhood::select('id')->where('deleted',0)->whereIn('key' , $neighborhood_keys)->get();
            for($i=0 ; $i<count($neighborhoods) ; $i++){
                if(!in_array($neighborhoods[$i]->id ,$selectedNeighborhoodIDS)){
                    array_push($selectedNeighborhoodIDS  , $neighborhoods[$i]->id);
                }
            }
        }

        $is_district_city = $request->input('is_district_city', null);
		$is_ballot_strictly_orthodox = $request->input('is_ballot_strictly_orthodox', null);
		$selected_statuses = $request->input('selected_statuses', null);
        $display_num_of_votes = $request->input('display_num_of_votes', null);
        $display_vote_statistics = $request->input('display_vote_statistics', null);

        $display_prev_votes_percents = $request->input('display_prev_votes_percents', null);
        $display_strictly_orthodox_percents = $request->input('display_strictly_orthodox_percents', null);
        $display_sephardi_percents = $request->input('display_sephardi_percents', null);

        $is_district_city = $request->input('is_district_city', null);
        $selected_campaigns = $request->input('selected_campaigns', null);

        $support_status_id = $request->input('support_status_id', null);
        $display_statuses_statistics = $request->input('display_statuses_statistics', null);
	 
        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $last_campaign_id = VoterElectionsController::getLastCampaign();

		$citiesObjs = City::select('area_id')->where('deleted',0)
											->whereIn('cities.key',$city_id)
											->get();
        $area_id = [];
		for($i = 0 ; $i<count($citiesObjs);$i++){
			if(!in_array($citiesObjs[$i]->area_id ,$area_id  )){
				array_push($area_id  , $citiesObjs[$i]->area_id);
			}
		}

        $systemSupportStatuses = SupportStatus::select(['id',
                                                        'key',
                                                        'level',
                                                        'election_campaign_id',
                                                        'connected_support_status_id'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $supportStatusConnectedHash = $this->getSupportStatusConnectedHash($systemSupportHashByKey,
                                                                            $systemSupportStatuses,
                                                                            $selected_statuses,
                                                                            $selected_campaigns);

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {             
               $isSupportStausNoneSelected = true;
            }
        }

        foreach($supportStatusConnectedHash as $supportStatusConnected) {
            $selectedStatusesIds = array_merge($selectedStatusesIds, $supportStatusConnected);
        }

        $resultStatuses = $this->getCountStatusesFields($supportStatusConnectedHash, $isSupportStausNoneSelected);
        $statusesFields = $resultStatuses['statusesFields'];
        $statusesSumFields = $resultStatuses['sumStatusesFields'];

        $statusesHash = [];
        $shasVotesHash = [];
        $currentCampaignVotesHash = [];
 
        $areaObj = Area::select([
            'areas.id as area_id' , 'areas.name as area_name',
             DB::raw('count(distinct ballot_boxes.id) as count_ballot_boxes'),
             DB::raw('count(distinct clusters.id) as clusters_count')
         ])->withCities()->withClusters()->withBallotBoxes();
            
            $this->addGeographicalFiltersToQuery($areaObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id);

				
            if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
                $areaObj->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
            }

            if ( 1 == $is_district_city ) {
                $areaObj->where('cities.district', $is_district_city);
            }

            $areaObj->where('clusters.election_campaign_id', $last_campaign_id)
                    ->whereIn('areas.id', $area_id)
                    ->groupBy('areas.id');
 
        $campaigns = $areaObj->get();

        if ( 1 == $display_num_of_votes ) {
 
            $votesFields = [
                'areas.id as area_id',
                DB::raw('count(voters_in_election_campaigns_current.voter_id) as count_total_voters'),
                DB::raw('count(votes.id) as count_elections_votes')
            ];

            $currentCampaignQuery =Area::select($votesFields)
                ->withCurrentElectionVotes($ballot_id, $is_ballot_strictly_orthodox)
                ->where('clusters.election_campaign_id', $last_campaign_id);

            $this->addGeographicalFiltersToQuery($currentCampaignQuery, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, null);

            if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
                $currentCampaignQuery->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
            }

            
            if ( 1 == $is_district_city ) {
                $currentCampaignQuery->where('cities.district', $is_district_city);
            }

            $currentCampaignVotes = $currentCampaignQuery->groupBy('areas.id')
            ->whereIn('areas.id', $area_id)
            ->get();
                foreach($currentCampaignVotes as $areaItem){
                    $areaId = $areaItem->area_id;

                    $currentCampaignVotesHash[$areaId] = [
                        'count_total_voters' => $areaItem->count_total_voters,
                        'count_elections_votes' => $areaItem->count_elections_votes
                    ];
                }
			
        } 

        if ( 1 == $display_statuses_statistics ) {

            $subQuerySelect = 'cities.mi_id';
            $subQueryIn = City::withClusters()
                            ->withBallotBoxes();
            $subQueryIsIn = false;

            $geoFields = [
                'areas.name as area_name',
                'areas.id as area_id',
                'clusters.election_campaign_id'
            ];

            $statusObj= Area::select(array_merge($geoFields, $statusesFields))
                ->withSupportStatus()
                ->whereIn('clusters.election_campaign_id', $selected_campaigns);

            //set where group if with null support status    
            if ( count($selectedStatusesIds) > 0 ) {
                if ($isSupportStausNoneSelected) {
                    $statusObj->where(function($query) use ($selectedStatusesIds) {
                        $query->orWhereIn('voter_support_status.support_status_id', $selectedStatusesIds)
                            ->orWhereNull('voter_support_status.support_status_id');
                    });
                } else {
                    $statusObj->whereIn('voter_support_status.support_status_id', $selectedStatusesIds);
                }
            } else if ($isSupportStausNoneSelected) {
                $statusObj->whereNull('voter_support_status.support_status_id');
            }

            if (count($ballot_id)>0 ) {
                $subQuerySelect = 'ballot_boxes.mi_id';
                $subQueryIn->whereIn('ballot_boxes.key', $ballot_id);
                $subQueryIsIn = true;
            }
            elseif (count($cluster_id)>0 ) {
                $subQuerySelect = 'clusters.mi_id';
                $subQueryIn->whereIn('clusters.key', $cluster_id);
                $subQueryIsIn = true;
            }
            elseif(count($selectedNeighborhoodIDS) > 0){
                $subQuerySelect = 'clusters.mi_id';
                $subQueryIn->whereIn('clusters.neighborhood_id', $selectedNeighborhoodIDS);
                $subQueryIsIn = true;
            }

            if (count($city_id)>0) {
                $statusObj->whereIn('cities.key', $city_id);
            }
            
            if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
                $subQuerySelect = 'ballot_boxes.mi_id';
                $subQueryIn->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
                $subQueryIsIn = true;
            }

            if ( 1 == $is_district_city ) {
                $subQuerySelect = 'cities.mi_id';
                $subQueryIn->where('cities.district', $is_district_city);
                $subQueryIsIn = true;
            }

            if ($subQueryIsIn) {
                $subQueryIn->select($subQuerySelect);
                $statusObj->whereRaw($subQuerySelect.' IN ('.$subQueryIn->toSql().')')->mergeBindings($subQueryIn->getQuery());
            }

            $statusObj->groupBy('areas.id', 'clusters.election_campaign_id')
            ->whereIn('areas.id', $area_id);

            $statuseForSum = clone $statusObj;
            $statusesArr = $statusObj->get();

            foreach($statusesArr as $areasItem){
                $areaId = $areasItem->area_id;
                if ( !isset($statusesHash[$areaId]['election_campaigns']) ) {
                    $statusesHash[$areaId]['election_campaigns'] = [];
                }
                $tempElectionCampaignId = $areasItem->election_campaign_id;

                $statusesHash[$areaId]['election_campaigns'][$tempElectionCampaignId]['count_voter_support_status_none'] = $areasItem->count_voter_support_status_none;

                for ($statusSupportindex = 0; $statusSupportindex < count($selectedStatusesIds); $statusSupportindex++) {
                    $countField = 'count_voters_support_status' . $selectedStatusesIds[$statusSupportindex];

                    $statusesHash[$areaId]['election_campaigns'][$tempElectionCampaignId][$countField] = $areasItem->{$countField};
                }
            }
				
			 $geoFields = [
                        'cities.id',
                        'cities.area_id',
                        'clusters.election_campaign_id',
						'areas.name as area_name'
                    ];	

            $statuseForSum = clone $statusObj;
        }
	 
		$shasVotesFields = [
                        'areas.id as area_id',
                        'election_campaign_party_lists.election_campaign_id',
						'areas.name as area_name',
                        DB::raw('sum(election_campaign_party_list_votes.votes) as shas_votes')
                    ];

        if ( 1 == $display_vote_statistics ) {
			 
            $shasVotesObj = Area::select($shasVotesFields)
                ->whereIn('election_campaign_party_lists.election_campaign_id', $selected_campaigns)
                ->groupBy('areas.id', 'election_campaign_party_lists.election_campaign_id');
            $shasCitiesVotes = null;

            $shasBallotsVotes = clone $shasVotesObj;
            $shasBallotsVotes->withShasVotes();

			if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
					 $shasBallotsVotes->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
			}
			
			if ( count($ballot_id)>0 ) {
                 $shasBallotsVotes->whereIn('ballot_boxes.key', $ballot_id);
            }
			elseif(count($cluster_id ) > 0){
			     $shasBallotsVotes->whereIn('clusters.key',$cluster_id);
			}
			elseif(count($selectedNeighborhoodIDS)>0){
				 $shasBallotsVotes->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
			}
			elseif(count($city_id ) > 0){	
                $shasCitiesVotes = clone $shasVotesObj;
                $shasCitiesVotes->withShasCityVotes();
				$shasCitiesVotes->whereIn('cities.key',$city_id);
                
                $shasBallotsVotes->whereIn('cities.key',$city_id);
		    }
				 
			if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$shasBallotsVotes->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
			}
			if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
				$shasBallotsVotes->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
			}
			if($restrictedGeoLists && $restrictedGeoLists->neighborhoodsIDSArray && count($restrictedGeoLists->neighborhoodsIDSArray) > 0){
				$shasBallotsVotes->whereIn('clusters.neighborhood_id',$restrictedGeoLists->neighborhoodsIDSArray);
            }
            
            $shasFullVotesObj = $shasCitiesVotes ? $shasBallotsVotes->union($shasCitiesVotes) : $shasBallotsVotes;

            $shasVotesForSum = clone $shasFullVotesObj;
            $shasVotes = $shasFullVotesObj->get();
			foreach ($shasVotes as $item) {
                $tempAreaId = $item->area_id;
                $tempElectionCampaignId = $item->election_campaign_id;

                if ( !isset($shasVotesHash[$tempAreaId]['election_campaigns']) ) {
                    $shasVotesHash[$tempAreaId]['election_campaigns'] = [];
                }
                if( !isset($shasVotesHash[$tempAreaId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'])){
                    $shasVotesHash[$tempAreaId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] =0;
                }
                $shasVotesHash[$tempAreaId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] += $item->shas_votes;
            }
		} else {
            $shasVotes = [];
        }
        
        foreach ( $campaigns as $index => $campaignItem ) {
            $campaignAreaId = $campaignItem->area_id;

            if ( isset($currentCampaignVotesHash[$campaignAreaId]) ) {
                $campaigns[$index]->count_total_voters = $currentCampaignVotesHash[$campaignAreaId]['count_total_voters'];
                $campaigns[$index]->count_elections_votes = $currentCampaignVotesHash[$campaignAreaId]['count_elections_votes'];
            }

            if ( isset($statusesHash[$campaignAreaId]) ) {
                $campaigns[$index]->support_statuses = $statusesHash[$campaignAreaId]['election_campaigns'];
            }

            if ( isset($shasVotesHash[$campaignAreaId]) ) {
                $campaigns[$index]->shas_votes = $shasVotesHash[$campaignAreaId]['election_campaigns'];
            }
        }
		
	   $summary = [];
 
        if ( 1 == $display_statuses_statistics ) {
			 
            $summaryStatusesArr = DB::table(DB::Raw('( ' . $statuseForSum->toSql() . ' ) AS t1'))
                ->setBindings([$statuseForSum->getBindings()])
                ->select(array_merge(['t1.election_campaign_id'], $statusesSumFields))
                ->groupBy('t1.election_campaign_id');
			 
             $summaryStatusesArr =  $summaryStatusesArr->get();

            $summary['statuses']['election_campaigns'] = [];
 
            for ( $summaryIndex = 0; $summaryIndex < count($summaryStatusesArr); $summaryIndex++ ) {
                $tempElectionCampaignId = $summaryStatusesArr[$summaryIndex]->election_campaign_id;

                $summary['statuses']['election_campaigns'][$tempElectionCampaignId] = $summaryStatusesArr[$summaryIndex];
            }
        }

        if ( 1 == $display_vote_statistics ) {
            $shasVotesArr = DB::table(DB::Raw('( ' . $shasVotesForSum->toSql() . ' ) AS t1'))
                ->setBindings([$shasVotesForSum->getBindings()])
                ->select(['t1.election_campaign_id', DB::raw('sum(shas_votes) as sum_shas_votes')])
                ->groupBy('t1.election_campaign_id')
                ->get();

            $summary['shas_votes']['election_campaigns'] = [];
            for ( $shasVotesIndex = 0; $shasVotesIndex < count($shasVotesArr); $shasVotesIndex++ ) {
                $tempElectionCampaignId = $shasVotesArr[$shasVotesIndex]->election_campaign_id;

                $summary['shas_votes']['election_campaigns'][$tempElectionCampaignId] = $shasVotesArr[$shasVotesIndex];
            }
        }

        //get count records
        $countRecords = Area::withCities()
                            ->withClusters()
                            ->withBallotBoxes()
                            ->where('clusters.election_campaign_id', $last_campaign_id);

        if(count($ballot_id ) > 0){
            $countRecords->select([DB::raw('count(distinct ballot_boxes.id) as count_records')])
                            ->whereIn('ballot_boxes.key',$ballot_id );
             
        }
        elseif(count($cluster_id) > 0){
            $countRecords->select([DB::raw('count(distinct clusters.id) as count_records')])
                        ->whereIn('clusters.key',$cluster_id );
        }
        elseif(count($selectedNeighborhoodIDS) > 0){
            $countRecords->select([DB::raw('count(distinct clusters.id) as count_records')])
                        ->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS );
        }
        elseif (count($city_id)> 0){
            $countRecords->select([DB::raw('count(distinct cities.id) as count_records')])
                        ->whereIn('cities.key',$city_id );
        } else {
            $countRecords->select([DB::raw('count(distinct areas.id) as count_records')])
                        ->whereIn('areas.id',$area_id );
        }

        if ($is_district_city == 1) {
            $countRecords->where('cities.district',1);
        }

        $countRecords = $countRecords->first();

        $result = [
            'count_records' => $countRecords->count_records,
            'campaigns' => $campaigns , 
			'summary' => $summary
        ];
 
        return $result;

    }

	/*
		Function that returns ballots summary by city
    */
    public function displayBallotsPollingSummaryByCity(Request $request, $exportToFile = false , $restrictedGeoLists=null) {
        $last_campaign_id = VoterElectionsController::getLastCampaign();
        
        
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = json_decode($request->input('selected_cities'));
        $neighborhood_keys = json_decode($request->input('selected_neighborhoods'));
        $cluster_id = json_decode($request->input('selected_clusters'));
        $ballot_id = json_decode($request->input('selected_ballots'));
 
        $selectedNeighborhoodIDS = [];
        if(!empty($neighborhood_keys)){
            $neighborhoods = Neighborhood::select('id')->where('deleted',0)->whereIn('key' , $neighborhood_keys)->get();
            for($i=0 ; $i<count($neighborhoods) ; $i++){
                if(!in_array($neighborhoods[$i]->id ,$selectedNeighborhoodIDS)){
                    array_push($selectedNeighborhoodIDS  , $neighborhoods[$i]->id);
                }
            }
		}
		

        $selected_statuses = $request->input('selected_statuses', null);

        $is_district_city = $request->input('is_district_city', null);
        $is_ballot_strictly_orthodox = $request->input('is_ballot_strictly_orthodox', null);

        $display_num_of_votes = $request->input('display_num_of_votes', null);
        $display_vote_statistics = $request->input('display_vote_statistics', null);
        $display_statuses_statistics = $request->input('display_statuses_statistics', null);

        $display_prev_votes_percents = $request->input('display_prev_votes_percents', null);
        $display_strictly_orthodox_percents = $request->input('display_strictly_orthodox_percents', null);
        $display_sephardi_percents = $request->input('display_sephardi_percents', null);

        $selected_campaigns = $request->input('selected_campaigns', null);

        $current_page = $request->input('current_page', 1);

        $limit = 100;
        $limitByElectionCampaign = 100 * count($selected_campaigns);
        $skip = ($current_page - 1) * $limit;
        $skipByElectionCampaign = ($current_page - 1) * $limitByElectionCampaign;

        $systemSupportStatuses = SupportStatus::select(['id',
                                                        'key',
                                                        'level',
                                                        'election_campaign_id',
                                                        'connected_support_status_id'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $supportStatusConnectedHash = $this->getSupportStatusConnectedHash($systemSupportHashByKey,
                                                                            $systemSupportStatuses,
                                                                            $selected_statuses,
                                                                            $selected_campaigns);

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {             
               $isSupportStausNoneSelected = true;
            }
        }

        foreach($supportStatusConnectedHash as $supportStatusConnected) {
            $selectedStatusesIds = array_merge($selectedStatusesIds, $supportStatusConnected);
        }

        $resultStatuses = $this->getCountStatusesFields($supportStatusConnectedHash, $isSupportStausNoneSelected);
        $statusesFields = $resultStatuses['statusesFields'];
        $statusesSumFields = $resultStatuses['sumStatusesFields'];


        $fields = [
            'cities.id',
            'cities.name as city_name',
            'cities.mi_id as city_mi_id',
            DB::raw('count(ballot_boxes.id) as count_ballot_boxes')
        ];

        $cityObj = City::select($fields);

		 
		if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$cityObj->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
        }
        $this->addGeographicalFiltersToQuery($cityObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, null);
        
	
        $cityObj->withClusters()
            ->withBallotBoxes();
 
        $where = $this->getWhereGeoDetailsQuery($ballot_id ,$cluster_id, $city_id, $sub_area_id, $area_id,
                                                 $is_district_city, $is_ballot_strictly_orthodox);
        $whereNoBallots = $this->getWhereGeoDetailsQuery($ballot_id ,$cluster_id, $city_id, $sub_area_id, $area_id,$is_district_city, 0);

        $statusesHash = [];
        $shasVotesHash = [];
        $currentCampaignVotesHash = [];
        if ( 1 == $display_vote_statistics ) {
        
            $shasVotesFields = [
                'cities.id',
                'election_campaign_party_lists.election_campaign_id',
                DB::raw('sum(election_campaign_party_list_votes.votes) as shas_votes ')
            ];

            $shasVotesObj = City::select($shasVotesFields)
                ->whereIn('election_campaign_party_lists.election_campaign_id', $selected_campaigns)
                ->where($whereNoBallots)
                ->groupBy('cities.id', 'election_campaign_party_lists.election_campaign_id');
            
            $shasCitiesVotes = null;

            $shasBallotsVotes = clone $shasVotesObj;
            $shasBallotsVotes->withShasVotes();
            
            if($is_ballot_strictly_orthodox){
                $shasBallotsVotes->where('ballot_boxes.strictly_orthodox', DB::raw(1));
            }
			if(count($cluster_id ) > 0){
				$shasBallotsVotes->whereIn('clusters.key',$cluster_id);
            }
			elseif(count($selectedNeighborhoodIDS) > 0){
				$shasBallotsVotes->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
			}
			elseif(count($city_id ) > 0){
                $shasCitiesVotes = clone $shasVotesObj;
                $shasCitiesVotes->withShasCityVotes();

				$shasBallotsVotes = $shasBallotsVotes->whereIn('cities.key',$city_id);
				$shasCitiesVotes = $shasCitiesVotes->whereIn('cities.key',$city_id);
			}
            $shasFullVotesObj = $shasCitiesVotes ? $shasBallotsVotes->union($shasCitiesVotes) : $shasBallotsVotes;
            
            $shasVotes = $shasFullVotesObj->get();
            if ( $exportToFile ) {
               $shasVotes = $shasFullVotesObj->get();
            }else{
                $shasVotes = $shasFullVotesObj->skip($skipByElectionCampaign)->limit($limitByElectionCampaign)->get();
            }

            for ($shasVoteIndex = 0; $shasVoteIndex < count($shasVotes); $shasVoteIndex++) {
                $tempCityId = $shasVotes[$shasVoteIndex]->id;
                $tempElectionCampaignId = $shasVotes[$shasVoteIndex]->election_campaign_id;

                if ( !isset($shasVotesHash[$tempCityId]['election_campaigns']) ) {
                    $shasVotesHash[$tempCityId]['election_campaigns'] = [];
                }
                if( !isset($shasVotesHash[$tempCityId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'])){
                    $shasVotesHash[$tempCityId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] =0;
                }
                $shasVotesHash[$tempCityId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] += $shasVotes[$shasVoteIndex]->shas_votes;
            }
        } else {
            $shasVotes = [];
        }

        if ( 1 == $display_statuses_statistics ) {


            $subQuerySelect = 'cities.mi_id';
            $subQueryIn = City::withClusters()
                                ->withBallotBoxes();
            $subQueryIsIn = false;

            $geoFields = [
                'cities.id',
                'clusters.election_campaign_id'
            ];

            $statusObj = City::select(array_merge($geoFields, $statusesFields))
                ->join('clusters', 'clusters.city_id', '=', 'cities.id')
                ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                ->join('voters_in_election_campaigns' , function ( $joinOn ) {
                    $joinOn->on([
                        ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                        ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                    ]);
                })
                ->leftJoin('voter_support_status', function ( $joinOn ) {
                    $joinOn->on([
                        ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                        ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                        ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                        ['voter_support_status.deleted', '=', DB::raw(0)]
                    ]);
                })
                ->whereIn('clusters.election_campaign_id', $selected_campaigns)
                ->where($where);

            //where on geo
			if (count($ballot_id) > 0) {
                $subQueryIn->whereIn('ballot_boxes.key', $ballot_id);
                $subQuerySelect = 'ballot_boxes.mi_id';
                $subQueryIsIn = true;
            }
            elseif ( count($cluster_id) > 0 ) {
                $subQueryIn->whereIn('clusters.key', $cluster_id);
                $subQuerySelect = 'clusters.mi_id';
                $subQueryIsIn = true;
            }
			elseif(count($selectedNeighborhoodIDS) > 0){
				$subQueryIn->whereIn('clusters.neighborhood_id', $selectedNeighborhoodIDS);
                $subQuerySelect = 'clusters.mi_id';
                $subQueryIsIn = true;
			}

			if(count($city_id) > 0 ) {
                $statusObj->whereIn('cities.key', $city_id);
            }

            //set where group if with null support status
            if ( count($selectedStatusesIds) > 0 ) {
                if ($isSupportStausNoneSelected) {
                    $statusObj->where(function($query) use ($selectedStatusesIds) {
                        $query->orWhereIn('voter_support_status.support_status_id', $selectedStatusesIds)
                            ->orWhereNull('voter_support_status.support_status_id');
                    });
                } else {
                    $statusObj->whereIn('voter_support_status.support_status_id', $selectedStatusesIds);
                }
            } else if ($isSupportStausNoneSelected) {
                $statusObj->whereNull('voter_support_status.support_status_id');
            }
            $statusObj->groupBy('cities.id', 'clusters.election_campaign_id');

            //add sub query if inside city
            if ($subQueryIsIn) {
                $subQueryIn->select($subQuerySelect);
                $statusObj->whereRaw($subQuerySelect.' IN ('.$subQueryIn->toSql().')')->mergeBindings($subQueryIn->getQuery());
            }

            if ( $exportToFile ) {
                $statusesArr = $statusObj->get();
            } else {
                $statusesArr = $statusObj->skip($skipByElectionCampaign)
                    ->limit($limitByElectionCampaign)
                    ->get();
            }

            for ($supportIndex = 0; $supportIndex < count($statusesArr); $supportIndex++) {
                $tempCityId = $statusesArr[$supportIndex]->id;
				 
                $tempElectionCampaignId = $statusesArr[$supportIndex]->election_campaign_id;

                if ( !isset($statusesHash[$tempCityId]['election_campaigns']) ) {
                    $statusesHash[$tempCityId]['election_campaigns'] = [];
                }

                if ($isSupportStausNoneSelected) {
                    $statusesHash[$tempCityId]['election_campaigns'][$tempElectionCampaignId]['count_voter_support_status_none'] = $statusesArr[$supportIndex]->count_voter_support_status_none;
                }

                for ($statusSupportindex = 0; $statusSupportindex < count($selectedStatusesIds); $statusSupportindex++) {
                    $countField = 'count_voters_support_status' . $selectedStatusesIds[$statusSupportindex];

                    $statusesHash[$tempCityId]['election_campaigns'][$tempElectionCampaignId][$countField] = $statusesArr[$supportIndex]->{$countField};
                }
            }
        }

        if ( 1 == $display_num_of_votes ) {
            $last_campaign_id = VoterElectionsController::getLastCampaign();

            $votesFields = [
                'cities.id',
                DB::raw('count(voters_in_election_campaigns_current.voter_id) as count_total_voters'),
                DB::raw('count(votes.id) as count_elections_votes')
            ];

            $currentCampaignObj = City::select($votesFields)
                ->withCurrentElectionVotes()
                ->where('clusters.election_campaign_id', $last_campaign_id)
                ->where($where);

            if ( count($ballot_id) > 0 ) {
                $currentCampaignObj->whereIn('ballot_boxes.key', $ballot_id);
            }
            elseif ( count($cluster_id) > 0 ) {
                $currentCampaignObj->whereIn('clusters.key', $cluster_id);
            }
			elseif(count($selectedNeighborhoodIDS) > 0){
				 $currentCampaignObj->whereIn('clusters.neighborhood_id', $selectedNeighborhoodIDS);
			}
			elseif ( count($city_id) > 0 ) {
                $currentCampaignObj->whereIn('cities.key', $city_id);
            }

			if ( count($city_id) == 0 ) {
                 $currentCampaignObj->groupBy('clusters.election_campaign_id');
            } 
		    else{
                 $currentCampaignObj->groupBy('cities.id', 'clusters.election_campaign_id');
            }
			
            if ( $exportToFile ) {
				$currentCampaignVotes = $currentCampaignObj->get();
            } 
			else 
			{
                $currentCampaignVotes =  $currentCampaignObj->skip($skip)->limit($limit)->get();
            }

            for ( $campaignVoteIndex = 0; $campaignVoteIndex < count($currentCampaignVotes); $campaignVoteIndex++) {
                $tempCityId = $currentCampaignVotes[$campaignVoteIndex]->id;

                $currentCampaignVotesHash[$tempCityId] = [
                    "count_total_voters" => $currentCampaignVotes[$campaignVoteIndex]->count_total_voters,
                    "count_elections_votes" => $currentCampaignVotes[$campaignVoteIndex]->count_elections_votes
                ];
            }
        } else {
            $currentCampaignVotesHash = [];
        }
 
        
		if(count($ballot_id ) > 0){
			$countRecords = BallotBox::select([DB::raw('count(distinct ballot_boxes.id) as count_records')])
            ->withCluster()
            ->withCity()
            ->where($where)
			->whereIn('ballot_boxes.key',$ballot_id )
            ->first();
			 
		}
		elseif(count($cluster_id) > 0){
			$countRecords = Cluster::select([DB::raw('count(distinct clusters.id) as count_records')])
            ->withCity()
            ->where($where)
			->whereIn('clusters.key',$cluster_id )
            ->first();
		}
		elseif(count($selectedNeighborhoodIDS) > 0){
			$countRecords = Cluster::select([DB::raw('count(distinct clusters.id) as count_records')]) 
            ->where($where)
			->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS )
            ->first();
		}
		else{
			$countRecords = City::select([DB::raw('count(distinct cities.id) as count_records')]) 
            ->where($where)
			->whereIn('cities.key',$city_id )
            ->first();
		}
        $cityObj->where($where)
        ->groupBy('cities.id', 'clusters.election_campaign_id');

        $ballotsDetailsHash = [];

        if($display_prev_votes_percents || $display_strictly_orthodox_percents || $display_sephardi_percents){
            $ballotsDetailsObj = clone $cityObj;
            $ballotsDetailsHash =  $this->getPrevElectionsVotesPercents($ballotsDetailsObj, $last_campaign_id, 'city', $display_prev_votes_percents, $display_strictly_orthodox_percents ,$display_sephardi_percents);
        }

        $cityObj->withCount(['clusters' => function($qr) use ($cluster_id , $last_campaign_id, $restrictedGeoLists, $selectedNeighborhoodIDS) {
            if ( count($cluster_id) > 0 ) {
                $qr->whereIn('clusters.key', $cluster_id);
            }
			elseif(count($selectedNeighborhoodIDS)){
			    $qr->whereIn('clusters.neighborhood_id', $selectedNeighborhoodIDS);
		    }
			if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
				$qr->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
			}
			
            $qr->where('clusters.election_campaign_id', $last_campaign_id);
        }]);
        $cityObj->where('clusters.election_campaign_id', $last_campaign_id);

 
        if ( $exportToFile ) {
            $campaigns = $cityObj->get();
        } else {
            $campaigns = $cityObj->skip($skip)->limit($limit)->get();
        }
        // dump($campaigns->toArray());
        // dd($ballotsDetailsHash);
        for ( $campaignIndex = 0; $campaignIndex < count($campaigns); $campaignIndex++) {
            $campaignCityId = $campaigns[$campaignIndex]->id;
            // dd($ballotsDetailsHash[$campaignCityId]);
            if ( isset($statusesHash[$campaignCityId]) ) {
                $campaigns[$campaignIndex]->support_statuses = $statusesHash[$campaignCityId]['election_campaigns'];
            }

            if ( isset($shasVotesHash[$campaignCityId]) ) {
                $campaigns[$campaignIndex]->shas_votes = $shasVotesHash[$campaignCityId]['election_campaigns'];
            }

            if ( isset($currentCampaignVotesHash[$campaignCityId]) ) {
                $campaigns[$campaignIndex]->count_total_voters = $currentCampaignVotesHash[$campaignCityId]['count_total_voters'];
                $campaigns[$campaignIndex]->count_elections_votes = $currentCampaignVotesHash[$campaignCityId]['count_elections_votes'];
            }
            if (  isset($ballotsDetailsHash[$campaignCityId]) ) {
                $campaigns[$campaignIndex]->ballot_details = $ballotsDetailsHash[$campaignCityId]['election_campaigns'];
            }
        }

        $summary = [];

        if ( 1 == $display_statuses_statistics ) {
            $summaryStatusesArr = DB::table(DB::Raw('( ' . $statusObj->toSql() . ' ) AS t1'))
                ->setBindings([$statusObj->getBindings()])
                ->select(array_merge(['t1.election_campaign_id'], $statusesSumFields))
                ->groupBy('t1.election_campaign_id')
                ->get();

            $summary['statuses']['election_campaigns'] = [];

            for ( $summaryIndex = 0; $summaryIndex < count($summaryStatusesArr); $summaryIndex++ ) {
                $tempElectionCampaignId = $summaryStatusesArr[$summaryIndex]->election_campaign_id;

                $summary['statuses']['election_campaigns'][$tempElectionCampaignId] = $summaryStatusesArr[$summaryIndex];
            }
        }

        if ( 1 == $display_vote_statistics ) {
            $shasVotesArr = DB::table(DB::Raw('( ' . $shasFullVotesObj->toSql() . ' ) AS t1'))
                ->setBindings([$shasFullVotesObj->getBindings()])
                ->select(['t1.election_campaign_id', DB::raw('sum(shas_votes) as sum_shas_votes')])
                ->groupBy('t1.election_campaign_id')
                ->get();

            $summary['shas_votes']['election_campaigns'] = [];
            for ( $shasVotesIndex = 0; $shasVotesIndex < count($shasVotesArr); $shasVotesIndex++ ) {
                $tempElectionCampaignId = $shasVotesArr[$shasVotesIndex]->election_campaign_id;

                $summary['shas_votes']['election_campaigns'][$tempElectionCampaignId] = $shasVotesArr[$shasVotesIndex];
            }
        }

        $result = [
            'count_records' => $countRecords->count_records,
            'campaigns' => $campaigns,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Function that returns ballots summary by cluster
    */
    public function displayBallotsPollingSummaryByCluster(Request $request, $exportToFile = false , $restrictedGeoLists=null) {
        $last_campaign_id = VoterElectionsController::getLastCampaign();
        
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = json_decode($request->input('selected_cities'));
        $neighborhood_keys = json_decode($request->input('selected_neighborhoods'));
        $cluster_id = json_decode($request->input('selected_clusters'));
        $ballot_id = json_decode($request->input('selected_ballots'));

        $selectedNeighborhoodIDS = [];
        if(!empty($neighborhood_keys)){
		    $neighborhoods = Neighborhood::select('id')->where('deleted',0)->whereIn('key' , $neighborhood_keys)->get();
            for($i=0 ; $i<count($neighborhoods) ; $i++){
                if(!in_array($neighborhoods[$i]->id ,$selectedNeighborhoodIDS)){
                    array_push($selectedNeighborhoodIDS  , $neighborhoods[$i]->id);
                }
            }
		}
	 
  
        $selected_statuses = $request->input('selected_statuses', null);

        $is_district_city = $request->input('is_district_city', null);
        $is_ballot_strictly_orthodox = $request->input('is_ballot_strictly_orthodox', null);
        $is_entity_in_current_election = $request->input('is_entity_in_current_election', null);

        $display_num_of_votes = $request->input('display_num_of_votes', null);
        $display_vote_statistics = $request->input('display_vote_statistics', null);
        $display_statuses_statistics = $request->input('display_statuses_statistics', null);

        $display_prev_votes_percents = $request->input('display_prev_votes_percents', null);
        $display_strictly_orthodox_percents = $request->input('display_strictly_orthodox_percents', null);
        $display_sephardi_percents = $request->input('display_sephardi_percents', null);

        $selected_campaigns = $request->input('selected_campaigns', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $currentClusterQuery = "$this->currentClusterQuery = $last_campaign_id limit 1";

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportStatuses = SupportStatus::select(['id',
                                                        'key',
                                                        'level',
                                                        'election_campaign_id',
                                                        'connected_support_status_id'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $supportStatusConnectedHash = $this->getSupportStatusConnectedHash($systemSupportHashByKey,
                                                                            $systemSupportStatuses,
                                                                            $selected_statuses,
                                                                            $selected_campaigns);

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {             
               $isSupportStausNoneSelected = true;
            }
        }

        foreach($supportStatusConnectedHash as $supportStatusConnected) {
            $selectedStatusesIds = array_merge($selectedStatusesIds, $supportStatusConnected);
        }
         

        $resultStatuses = $this->getCountStatusesFields($supportStatusConnectedHash, $isSupportStausNoneSelected);
        $statusesFields = $resultStatuses['statusesFields'];
        $statusesSumFields = $resultStatuses['sumStatusesFields'];
        // Need to add prefix to clsuter name - $this->lastClusterNameQuery
        $clusterFields = [
            'clusters.id',
            'clusters.city_id',
            'clusters.mi_id',
            DB::raw("(IFNULL(current_cluster.name,clusters.name)) AS cluster_name"),
            'cities.name as city_name',
            'cities.mi_id as city_mi_id',
			'clusters.election_campaign_id',
        ];
        

        $where = $this->getWhereGeoDetailsQuery($ballot_id ,$cluster_id, $city_id, $sub_area_id, $area_id,
                                                $is_district_city, $is_ballot_strictly_orthodox,true);
		


        $statusesHash = [];
        $shasVotesHash = [];
        $currentCampaignVotesHash = [];
 
        if ( 1 == $display_statuses_statistics ) {

            $clustersIsIn = false;
            $selectInField = "clusters.mi_id";
            $clustersIn = Cluster::withBallotBoxes();
			
            $geoFields = [
                'clusters.mi_id',
                'clusters.city_id',
                'clusters.id as cluster_id',
                'clusters.election_campaign_id'
            ];
				
            $statusesObj = Cluster::select(array_merge($geoFields, $statusesFields))
                ->withCity()
                ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
                ->join('voters_in_election_campaigns', function ( $joinOn ) {
                    $joinOn->on([
                        ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                        ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                    ]);
                })->leftJoin('voter_support_status', function ( $joinOn ) {
                    $joinOn->on([
                        ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                        ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                        ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                        ['voter_support_status.deleted', '=', DB::raw(0)]
                    ]);
                })
                ->whereIn('clusters.election_campaign_id', $selected_campaigns);
            if($is_entity_in_current_election){
                $statusesObj->addSelect(DB::raw("($currentClusterQuery) as current_cluster_id"))
                ->havingRaw('current_cluster_id is not null');
            }

            //set where group if with null support status
            if ( count($selectedStatusesIds) > 0 ) {
				 
                if ($isSupportStausNoneSelected) {
                    $statusesObj->where(function($query) use ($selectedStatusesIds) {
                        $query->orWhereIn('voter_support_status.support_status_id', $selectedStatusesIds)
                            ->orWhereNull('voter_support_status.support_status_id');
                    });
                } else {
                    $statusesObj->whereIn('voter_support_status.support_status_id', $selectedStatusesIds);
                }
            } else if ($isSupportStausNoneSelected) {
                $statusesObj->whereNull('voter_support_status.support_status_id');
            }

            //where on geo
			if ( count($ballot_id)>0 ) {
                $clustersIn->whereIn('ballot_boxes.key', $ballot_id);
                $selectInField = "ballot_boxes.mi_id";
                $clustersIsIn = true;
			}
			elseif(count($cluster_id ) > 0){
				$clustersIn->whereIn('clusters.key',$cluster_id);
                $clustersIsIn = true;
			}
			elseif(count($selectedNeighborhoodIDS)>0){
				$clustersIn->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
                $clustersIsIn = true;
			}

			if(count($city_id ) > 0){	
				$statusesObj = $statusesObj->whereIn('cities.key',$city_id);
			}
			
            //limit user geo ballots
			if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$clustersIn->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
                $selectInField = "ballot_boxes.mi_id";
                $clustersIsIn = true;
			}
			if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
				$clustersIn->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
                $clustersIsIn = true;
			}
			if($restrictedGeoLists && $restrictedGeoLists->neighborhoodsIDSArray && count($restrictedGeoLists->neighborhoodsIDSArray) > 0){
				$clustersIn->whereIn('clusters.neighborhood_id',$restrictedGeoLists->neighborhoodsIDSArray);
                $clustersIsIn = true;
			}

            if ($is_ballot_strictly_orthodox == 1) {
                $clustersIn->where('ballot_boxes.strictly_orthodox', 1);
                $selectInField = "ballot_boxes.mi_id";
                $clustersIsIn = true;                
            }

            //add sub query if inside city
            if ($clustersIsIn) {
                $clustersIn->select($selectInField);
                $statusesObj->whereRaw($selectInField.' IN ('.$clustersIn->toSql().')')->mergeBindings($clustersIn->getQuery());
            }
			
            $statusesObj->groupBy('clusters.city_id','clusters.mi_id', 'clusters.election_campaign_id');

            $statuseForSum = clone $statusesObj;
            $statusesArr = $statusesObj->get();
            foreach($statusesArr as $statusesData) {
                $tempClusterMiId = "$statusesData->mi_id-$statusesData->city_id";
                $tempElectionCampaignId = $statusesData->election_campaign_id;

                if ( !isset($statusesHash[$tempClusterMiId]['election_campaigns']) ) {
                    $statusesHash[$tempClusterMiId]['election_campaigns'] = [];
                }

                if ($isSupportStausNoneSelected) {
                    $statusesHash[$tempClusterMiId]['election_campaigns'][$tempElectionCampaignId]['count_voter_support_status_none'] = $statusesData->count_voter_support_status_none;
                }

                for ($statusSupportindex = 0; $statusSupportindex < count($selectedStatusesIds); $statusSupportindex++) {
                    $countField = 'count_voters_support_status' . $selectedStatusesIds[$statusSupportindex];

                    $statusesHash[$tempClusterMiId]['election_campaigns'][$tempElectionCampaignId][$countField] = $statusesData->{$countField};
                }
            }
        }

        if ( 1 == $display_vote_statistics ) {
            $shasVotesFields = [
                'clusters.mi_id',
                'clusters.city_id',
                'clusters.id as cluster_id',
                'clusters.election_campaign_id',
                DB::raw('sum(election_campaign_party_list_votes.votes) as shas_votes ')
            ];
			
			$shasVotesObj = Cluster::select($shasVotesFields)
                    ->withCity()
                    ->withShasVotes($is_ballot_strictly_orthodox)
                    ->where($where)
                    ->whereIn('clusters.election_campaign_id', $selected_campaigns)
                    ->whereIn('election_campaign_party_lists.election_campaign_id', $selected_campaigns)
                    ->groupBy('clusters.city_id', 'clusters.mi_id', 'clusters.election_campaign_id');
            if($is_entity_in_current_election){
                $statusesObj->addSelect(DB::raw("($currentClusterQuery) as current_cluster_id"))
                ->havingRaw('current_cluster_id is not null');
            }
			if ( count($ballot_id)>0 ) {
                 $shasVotesObj->whereIn('ballot_boxes.key', $ballot_id);
            }
			elseif(count($cluster_id ) > 0){
			     $shasVotesObj = $shasVotesObj->whereIn('clusters.key',$cluster_id);
			}
			elseif(count($selectedNeighborhoodIDS)>0){
				 $shasVotesObj = $shasVotesObj->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
			}
			elseif(count($city_id ) > 0){	
				$shasVotesObj = $shasVotesObj->whereIn('cities.key',$city_id);
		    }
				
			if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$shasVotesObj=$shasVotesObj->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
			}
			if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
				$shasVotesObj=$shasVotesObj->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
			}
			if($restrictedGeoLists && $restrictedGeoLists->neighborhoodsIDSArray && count($restrictedGeoLists->neighborhoodsIDSArray) > 0){
				$shasVotesObj=$shasVotesObj->whereIn('clusters.neighborhood_id',$restrictedGeoLists->neighborhoodsIDSArray);
			}
			
			$shasVotesForSum = clone $shasVotesObj;
            $shasVotes = $shasVotesObj->get();

            foreach ($shasVotes as $votesData) {
                $tempClusterMiId = "$votesData->mi_id-$votesData->city_id";
                $tempElectionCampaignId = $votesData->election_campaign_id;

                if ( !isset($shasVotesHash[$tempClusterMiId]['election_campaigns']) ) {
                    $shasVotesHash[$tempClusterMiId]['election_campaigns'] = [];
                }

                $shasVotesHash[$tempClusterMiId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] = $votesData->shas_votes;
            }
     
	   } else {
            $shasVotes = [];
        }
   
        if (  $display_num_of_votes == 1 ) { 
	 
            $votesFields = [
                'clusters.mi_id',
                'clusters.city_id',
                'clusters.id as cluster_id',
                DB::raw('count(voters_in_election_campaigns_current.voter_id) as count_total_voters'),
                DB::raw('count(votes.id) as count_elections_votes')
            ];

			$currentCampaignObj = Cluster::select($votesFields)
                    ->withCity()
                    ->withCurrentElectionVotes($is_ballot_strictly_orthodox, $last_campaign_id)
                    ->where($where)
                    ->where('clusters.election_campaign_id', $last_campaign_id);
					
		    
            $this->addGeographicalFiltersToQuery($currentCampaignObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, $restrictedGeoLists);
			

			$currentCampaignObj = $currentCampaignObj->groupBy('clusters.city_id', 'clusters.mi_id');
			
			 
			
            if ( $exportToFile ) {
                $currentCampaignVotes = $currentCampaignObj->get();
            } else {
			 
                $currentCampaignVotes = $currentCampaignObj->skip($skip)
                    ->limit($limit)
                    ->get();
            }

            foreach ($currentCampaignVotes as $votesData) {
                
                $tempClusterMiIdCityId = "$votesData->mi_id-$votesData->city_id";
				
			 
                $currentCampaignVotesHash[$tempClusterMiIdCityId] = [
                    "count_total_voters" => $votesData->count_total_voters,
                    "count_elections_votes" => $votesData->count_elections_votes
                ];
            }
        } else {
            $currentCampaignVotesHash = [];
        }
		  
		if(count($ballot_id) > 0){ // If ballots had selected - need to check out!
			$countRecords = BallotBox::select([DB::raw('count(distinct(ballot_boxes.cluster_id)) as count_records')])
				->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
				->where($where)
				->whereIn('ballot_boxes.key',$ballot_id);
            if(!$is_entity_in_current_election){
                $countRecords->whereIn('clusters.election_campaign_id', $selected_campaigns);
            } else {
                $countRecords->where('clusters.election_campaign_id', $last_campaign_id);
            }
			$clusterObj = Cluster::select($clusterFields)
                                  ->join('ballot_boxes','ballot_boxes.cluster_id','=','clusters.id')
								  ->whereIn('ballot_boxes.key',$ballot_id)
                                  ->withCity()
                                  ->withLastCluster($last_campaign_id)
								  ->withCount(['ballotBoxes' => function($query) use($ballot_id,$restrictedGeoLists){
									  $query->whereIn('ballot_boxes.key' , $ballot_id);
									  if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
										$query->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
									  }
                                  }])
                                  ->orderBy('cities.name');
            if($is_entity_in_current_election){
                $clusterObj->whereNotNull('current_cluster.id'); 
            }
		} else {
			 
            $clusterObj = Cluster::select($clusterFields)
                ->withBallotBoxes()
                ->withCity()
                ->withLastCluster($last_campaign_id)
                ->whereIn('clusters.election_campaign_id', $selected_campaigns)
                ->where($where)
                ->orderBy('cities.name');

            if($is_entity_in_current_election){
                $clusterObj->whereNotNull('current_cluster.id'); 
            }
			if(count($cluster_id ) > 0){
					$clusterObj = $clusterObj->whereIn('clusters.key',$cluster_id);
			}
			elseif(count($selectedNeighborhoodIDS) > 0){
				$clusterObj = $clusterObj->whereIn('clusters.neighborhood_id',$selectedNeighborhoodIDS);
			}
			elseif(count($city_id ) > 0){
				$citiesIDSArray = [];
				$citiesTmp = City::select('id')->where('deleted',0)->whereIn('key',$city_id)->get();
				 
				$clusterObj = $clusterObj->whereIn('cities.key',$city_id);
			}
		}
 
        
		if($restrictedGeoLists && $restrictedGeoLists->clustersIDSArray && count($restrictedGeoLists->clustersIDSArray) > 0){
            $clusterObj  = $clusterObj->whereIn('clusters.id',$restrictedGeoLists->clustersIDSArray);
        }
        $countRecords = clone $clusterObj;
		if($is_entity_in_current_election){
			$countRecords = $countRecords->select(DB::raw('count(distinct clusters.mi_id,clusters.city_id) as count_records'))->whereRaw("(select count(*) from voters_in_election_campaigns where election_campaign_id=$last_campaign_id and ballot_box_id in (select id from ballot_boxes where cluster_id=clusters.id)) > 0")->first();
		}
		else{
			$countRecords = $countRecords->select(DB::raw('count(distinct clusters.mi_id,clusters.city_id) as count_records'))->first();
        }
		
        $clusterObj->withCount(['ballotBoxes' => function($query) use($restrictedGeoLists, $ballot_id, $is_ballot_strictly_orthodox){
                        if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
                            $query->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
                        }

                        if (count($ballot_id) > 0) {
                            $query->whereIn('ballot_boxes.key', $ballot_id);
                        }

                        if ($is_ballot_strictly_orthodox == 1) {
                            $query->where('ballot_boxes.strictly_orthodox', 1);
                        }
        }])
        ->groupBy('clusters.city_id','clusters.mi_id');

		if($is_entity_in_current_election){
            $clusterObj->whereRaw("(select count(*) from voters_in_election_campaigns where election_campaign_id=$last_campaign_id and ballot_box_id in (select id from ballot_boxes where cluster_id=clusters.id)) > 0");
        }

        $ballotsDetailsHash = [];
        if($display_prev_votes_percents || $display_strictly_orthodox_percents || $display_sephardi_percents){
            $ballotsDetailsObj = clone $clusterObj;
            $ballotsDetailsHash =  $this->getPrevElectionsVotesPercents($ballotsDetailsObj, $last_campaign_id, 'cluster', $display_prev_votes_percents, $display_strictly_orthodox_percents ,$display_sephardi_percents);
        }

        if ( $exportToFile ) {
            $campaigns = $clusterObj->get();
        } else {
            $campaigns = $clusterObj->skip($skip)->limit($limit)->get();
        }
        for ( $campaignIndex = 0; $campaignIndex < count($campaigns); $campaignIndex++) {
            
            $campaignClusterMiId = $campaigns[$campaignIndex]->mi_id . '-' . $campaigns[$campaignIndex]->city_id;

            if ( isset($statusesHash[$campaignClusterMiId]) ) {
                $campaigns[$campaignIndex]->support_statuses = $statusesHash[$campaignClusterMiId]['election_campaigns'];
            }

            if ( isset($shasVotesHash[$campaignClusterMiId]) ) {
                $campaigns[$campaignIndex]->shas_votes = $shasVotesHash[$campaignClusterMiId]['election_campaigns'];
            }
		 
            if ( isset($currentCampaignVotesHash[$campaignClusterMiId]) ) {
                $campaigns[$campaignIndex]->count_total_voters = $currentCampaignVotesHash[$campaignClusterMiId]['count_total_voters'];
                $campaigns[$campaignIndex]->count_elections_votes = $currentCampaignVotesHash[$campaignClusterMiId]['count_elections_votes'];
            }

            if (  isset($ballotsDetailsHash[$campaignClusterMiId]) ) {
                $campaigns[$campaignIndex]->ballot_details = $ballotsDetailsHash[$campaignClusterMiId]['election_campaigns'];
            }
            
        }
        // dd($ballotsDetailsHash);
        $summary = [];

        if ( 1 == $display_statuses_statistics ) {
            $summaryStatusesArr = DB::table(DB::Raw('( ' . $statuseForSum->toSql() . ' ) AS t1'))
                ->setBindings([$statuseForSum->getBindings()])
                ->select(array_merge(['t1.election_campaign_id'], $statusesSumFields))
                ->groupBy('t1.election_campaign_id')
                ->get();

            $summary['statuses']['election_campaigns'] = [];

            for ( $summaryIndex = 0; $summaryIndex < count($summaryStatusesArr); $summaryIndex++ ) {
                $tempElectionCampaignId = $summaryStatusesArr[$summaryIndex]->election_campaign_id;

                $summary['statuses']['election_campaigns'][$tempElectionCampaignId] = $summaryStatusesArr[$summaryIndex];
            }
        }

        if ( 1 == $display_vote_statistics ) {
            $shasVotesArr = DB::table(DB::Raw('( ' . $shasVotesForSum->toSql() . ' ) AS t1'))
                ->setBindings([$shasVotesForSum->getBindings()])
                ->select(['t1.election_campaign_id', DB::raw('sum(shas_votes) as sum_shas_votes')])
                ->groupBy('t1.election_campaign_id')
                ->get();
                // dd($shasVotesArr->toSql(),$shasVotesArr->getBindings());

            $summary['shas_votes']['election_campaigns'] = [];
            for ( $shasVotesIndex = 0; $shasVotesIndex < count($shasVotesArr); $shasVotesIndex++ ) {
                $tempElectionCampaignId = $shasVotesArr[$shasVotesIndex]->election_campaign_id;

                $summary['shas_votes']['election_campaigns'][$tempElectionCampaignId] = $shasVotesArr[$shasVotesIndex];
            }
        }
        $result = [
            'count_records' => $countRecords->count_records,
            'campaigns' => $campaigns,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Function that returns ballots summary by ballot_box
    */
    public function displayBallotsPollingSummaryByBallot(Request $request, $exportToFile = false,$restrictedGeoLists=null) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = json_decode($request->input('selected_cities'));
        $neighborhood_keys = json_decode($request->input('selected_neighborhoods'));
        $cluster_id = json_decode($request->input('selected_clusters'));
        $ballot_id = json_decode($request->input('selected_ballots'));
 
        $selectedNeighborhoodIDS = [];
        if(!empty($neighborhood_keys)){
            $neighborhoods = Neighborhood::select('id')->where('deleted',0)->whereIn('key' , $neighborhood_keys)->get();
            for($i=0 ; $i<count($neighborhoods) ; $i++){
                if(!in_array($neighborhoods[$i]->id ,$selectedNeighborhoodIDS)){
                    array_push($selectedNeighborhoodIDS  , $neighborhoods[$i]->id);
                }
            }
        }


        $selected_statuses = $request->input('selected_statuses', null);

        $is_district_city = $request->input('is_district_city', null);
        $is_ballot_strictly_orthodox = $request->input('is_ballot_strictly_orthodox', null);
        $is_entity_in_current_election = $request->input('is_entity_in_current_election', null);

        $display_num_of_votes = $request->input('display_num_of_votes', null);
        $display_vote_statistics = $request->input('display_vote_statistics', null);
        $display_statuses_statistics = $request->input('display_statuses_statistics', null);

        $display_sephardi_percents = $request->input('display_sephardi_percents', null);
        $display_strictly_orthodox_percents = $request->input('display_strictly_orthodox_percents', null);
        $display_prev_votes_percents = $request->input('display_prev_votes_percents', null);

        $selected_campaigns = $request->input('selected_campaigns', null);

        $current_page = $request->input('current_page', 1);
        $limit = 100;
        /*  limit for statuses and votes not working well!
            $limitByElectionCampaign = 100 * count($selected_campaigns); 
            $skipByElectionCampaign = ($current_page - 1) * $limitByElectionCampaign;
        */
        $skip = ($current_page - 1) * $limit;

        $systemSupportStatuses = SupportStatus::select(['id',
                                                        'key',
                                                        'level',
                                                        'election_campaign_id',
                                                        'connected_support_status_id'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $supportStatusConnectedHash = $this->getSupportStatusConnectedHash($systemSupportHashByKey,
                                                                            $systemSupportStatuses,
                                                                            $selected_statuses,
                                                                            $selected_campaigns);

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {             
			   $isSupportStausNoneSelected = true;
            }
        }

        foreach($supportStatusConnectedHash as $supportStatusConnected) {
            $selectedStatusesIds = array_merge($selectedStatusesIds, $supportStatusConnected);
        }
		 

        $resultStatuses = $this->getCountStatusesFields($supportStatusConnectedHash, $isSupportStausNoneSelected);
		 
		$statusesFields = $resultStatuses['statusesFields'];
        $sumStatusesFields = $resultStatuses['sumStatusesFields'];

        $last_campaign_id = VoterElectionsController::getLastCampaign();

 

        $fields = [
            'ballot_boxes.id',
            'ballot_boxes.mi_id as ballot_box_name', 
            'cities.name as city_name',
            'cities.mi_id as city_mi_id',
            'cities.id as city_id',
        ];

        if ( 1 == $display_num_of_votes ) {
            $fields[] = DB::raw('count(voters_in_election_campaigns_current.voter_id) as count_total_voters');
            $fields[] = DB::raw('count(votes.id) as count_elections_votes');
        }

        $where = $this->getWhereGeoDetailsQuery($ballot_id ,$cluster_id, $city_id, $sub_area_id, $area_id,
                                                $is_district_city, $is_ballot_strictly_orthodox,true);
		
		$ballotBoxIsIn = false;
        $ballotBoxIn = BallotBox::select('ballot_boxes.mi_id')->withCluster();

        $statusesHash = [];
        $currentBallotQuery = "$this->currentBallotQuery = $last_campaign_id limit 1";
        if ( 1 == $display_statuses_statistics ) {
			
            $geoFields = [
                'ballot_boxes.id',
                'ballot_boxes.mi_id as ballot_box_name',
                'clusters.election_campaign_id',
                'cities.id as city_id'
            ];

            $statusesObj = BallotBox::select( array_merge($geoFields, $statusesFields) )
                ->withCluster()
                ->withCity()
                ->join('voters_in_election_campaigns', function ( $joinOn ) {
                    $joinOn->on([
                        ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                        ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                    ]);
                })
                ->leftJoin('voter_support_status', function ( $joinOn ) use ($selected_campaigns){
                    $joinOn->on([
                        ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                        ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                        ['voter_support_status.deleted', DB::raw(0)],
                        ['voter_support_status.election_campaign_id', '=', 'clusters.election_campaign_id']
                    ]);
                })
                ->whereIn('clusters.election_campaign_id', $selected_campaigns)
                ->groupBy('cities.id', 'ballot_boxes.mi_id');

			if($is_entity_in_current_election){
                $statusesObj->addSelect(DB::raw("($currentBallotQuery) as current_ballot_id"))
                ->havingRaw('current_ballot_id is not null');
            }

            //where on geo
            
			if(count($ballot_id)>0){
				$ballotBoxIn->whereIn('ballot_boxes.key', $ballot_id);
                $ballotBoxIsIn = true;
			}
            elseif ( count($ballot_id)==0 && count($cluster_id)>0 ) {
                $ballotBoxIn->whereIn('clusters.key', $cluster_id);
                $ballotBoxIsIn = true;
            } 
			elseif(count($selectedNeighborhoodIDS) > 0){
				 $ballotBoxIn->whereIn('clusters.neighborhood_id', $selectedNeighborhoodIDS);
                 $ballotBoxIsIn = true;
			}

            if (count($city_id ) > 0){
                $statusesObj = $statusesObj->whereIn('cities.key',$city_id);
            }
			
            //limit user geo ballots
			if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$ballotBoxIn->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
                $ballotBoxIsIn = true;
			}

            if (  $is_ballot_strictly_orthodox == 1 ) {
                $ballotBoxIn->where('ballot_boxes.strictly_orthodox', 1);
                $ballotBoxIsIn = true;                
            }

            //set where group if with null support status
            if ( count($selectedStatusesIds) > 0 ) {
                if ($isSupportStausNoneSelected) {
                    $statusesObj->where(function($query) use ($selectedStatusesIds) {
                        $query->orWhereIn('voter_support_status.support_status_id', $selectedStatusesIds)
                            ->orWhereNull('voter_support_status.support_status_id');
                    });
                } else {
                    $statusesObj->whereIn('voter_support_status.support_status_id', $selectedStatusesIds);
                }
            } else if ($isSupportStausNoneSelected) {
                $statusesObj->whereNull('voter_support_status.support_status_id');
            }

            //add sub query if inside city
            if ($ballotBoxIsIn) {
                $statusesObj->whereRaw('ballot_boxes.mi_id IN ('.$ballotBoxIn->toSql().')')->mergeBindings($ballotBoxIn->getQuery());
            }

            $statusesObj->groupBy('cities.id', 'ballot_boxes.mi_id', 'clusters.election_campaign_id');

            $statuseForSum = clone $statusesObj;
            $statusesArr = $statusesObj->get();
            // if ( $exportToFile ) {
            //     $statusesArr = $statusesObj->get();
            // } else {
            //     $statusesArr = $statusesObj->skip($skipByElectionCampaign)
            //         ->limit($limitByElectionCampaign)
            //         ->get();
            // }

            foreach($statusesArr as $statusesData) {
                $tempBallotMiId = "$statusesData->ballot_box_name-$statusesData->city_id";
                
                $tempElectionCampaignId = $statusesData->election_campaign_id;

                if ( !isset($statusesHash[$tempBallotMiId]['election_campaigns']) ) {
                    $statusesHash[$tempBallotMiId]['election_campaigns'] = [];
                }

                if ($isSupportStausNoneSelected) {
                    $statusesHash[$tempBallotMiId]['election_campaigns'][$tempElectionCampaignId]['count_voter_support_status_none'] = $statusesData->count_voter_support_status_none;
                }

                for ($statusSupportindex = 0; $statusSupportindex < count($selectedStatusesIds); $statusSupportindex++) {
                    $countField = 'count_voters_support_status' . $selectedStatusesIds[$statusSupportindex];

                    $statusesHash[$tempBallotMiId]['election_campaigns'][$tempElectionCampaignId][$countField] = $statusesData->{$countField};
                }
            }
        }

        $shasVotesHash = [];
        if ( 1 == $display_vote_statistics ) {
            $geoFields = [
                'ballot_boxes.id',
                'ballot_boxes.mi_id as ballot_box_name',
                'clusters.election_campaign_id',
                'cities.id as city_id',
                DB::raw('sum(election_campaign_party_list_votes.votes) as shas_votes ')
            ];

            $shasVotesObj = BallotBox::select($geoFields)
                ->withCluster()
                ->withCity()
                ->withShasVotes();
			 
			
            $shasVotesObj->whereIn('clusters.election_campaign_id', $selected_campaigns)
                ->where(['election_campaign_party_lists.shas' => 1, 'election_campaign_party_lists.deleted' => 0])
                ->whereIn('election_campaign_party_lists.election_campaign_id', $selected_campaigns)
                ->groupBy('cities.id', 'ballot_boxes.mi_id', 'clusters.election_campaign_id');

            if($is_entity_in_current_election){
                $shasVotesObj->addSelect(DB::raw("($currentBallotQuery) as current_ballot_id"))
                ->havingRaw('current_ballot_id is not null');
            }

            $this->addGeographicalFiltersToQuery($shasVotesObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, $restrictedGeoLists);

			
            $shasVotesForSum = clone $shasVotesObj;
            $shasVotes = $shasVotesObj->get();


            foreach ($shasVotes as $voteData) {
                $tempBallotMiId = "$voteData->ballot_box_name-$voteData->city_id";
                $tempElectionCampaignId = $voteData->election_campaign_id;

                if ( !isset($shasVotesHash[$tempBallotMiId]['election_campaigns']) ) {
                    $shasVotesHash[$tempBallotMiId]['election_campaigns'] = [];
                }

                $shasVotesHash[$tempBallotMiId]['election_campaigns'][$tempElectionCampaignId]['shas_votes'] = $voteData->shas_votes;
            }
        }

        $ballotObj = BallotBox::select($fields)
            ->withCluster()
            ->withLastCluster($last_campaign_id)
            ->withCity()
            ->addSelect( DB::raw("(IFNULL(current_cluster.name,clusters.name)) AS cluster_name"))
            ->orderBy('cities.name', 'ballot_boxes.mi_id')
            ->groupBy('cities.id', 'ballot_boxes.mi_id');
            
        if ( 1 == $display_num_of_votes ) {
            $ballotObj->withVoterVotesCurrentCampaign($last_campaign_id);
        }

        $ballotObj->where($where)
            ->whereIn('clusters.election_campaign_id', $selected_campaigns);

        if($is_entity_in_current_election){
            $ballotObj->addSelect(DB::raw("($currentBallotQuery) as current_ballot_id"))
            ->havingRaw('current_ballot_id is not null');
        }
        $this->addGeographicalFiltersToQuery($ballotObj, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, null);

		
		if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$ballotObj = $ballotObj->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
        }
        $ballotsDetailsHash = [];
        if($display_prev_votes_percents || $display_strictly_orthodox_percents || $display_sephardi_percents){
            $ballotsDetailsObj = clone $ballotObj;
            $ballotsDetailsHash =  $this->getPrevElectionsVotesPercents($ballotsDetailsObj, $last_campaign_id, 'ballot', $display_prev_votes_percents, $display_strictly_orthodox_percents ,$display_sephardi_percents);
        }

        if ( $exportToFile ) {
            $campaigns = $ballotObj->get();
        } else {
            $campaigns = $ballotObj->skip($skip)->limit($limit)->get();
        }
        
        foreach ( $campaigns as $campaignIndex => $camp) {
            $campaignBallotMiId = $camp->ballot_box_name . '-' . $camp->city_id;

            if ( isset($statusesHash[$campaignBallotMiId]) ) {
                $campaigns[$campaignIndex]->support_statuses = $statusesHash[$campaignBallotMiId]['election_campaigns'];
            }

            if ( isset($shasVotesHash[$campaignBallotMiId]) ) {
                $campaigns[$campaignIndex]->shas_votes = $shasVotesHash[$campaignBallotMiId]['election_campaigns'];
            }
            if (  isset($ballotsDetailsHash[$campaignBallotMiId]) ) {
                $campaigns[$campaignIndex]->ballot_details = $ballotsDetailsHash[$campaignBallotMiId]['election_campaigns'];
            }
        }
        $countRecords = BallotBox::select([DB::raw('count(distinct ballot_boxes.mi_id,cities.id) as count_ballot_boxes')])
            ->withCluster()
            ->withCity()
            ->where($where)
            ->whereIn('clusters.election_campaign_id', $selected_campaigns);
        if(!$is_entity_in_current_election){
            $countRecords->whereIn('clusters.election_campaign_id', $selected_campaigns);
        }else{
            $countRecords->where('clusters.election_campaign_id', $last_campaign_id);
        }
        $this->addGeographicalFiltersToQuery($countRecords, $ballot_id, $cluster_id, $selectedNeighborhoodIDS, $city_id, null);

		
		if($restrictedGeoLists && $restrictedGeoLists->ballotsIDSArray && count($restrictedGeoLists->ballotsIDSArray) > 0){
				$countRecords = $countRecords->whereIn('ballot_boxes.id',$restrictedGeoLists->ballotsIDSArray);
		}
        $countRecords = $countRecords->first();

        $summary = [];

        if ( 1 == $display_statuses_statistics ) {
            $summaryStatusesArr = DB::table(DB::Raw('( ' . $statuseForSum->toSql() . ' ) AS t1'))
                ->setBindings([$statuseForSum->getBindings()])
                ->select(array_merge(['t1.election_campaign_id'], $sumStatusesFields))
                ->groupBy('t1.election_campaign_id')
                ->get();

            $summary['statuses']['election_campaigns'] = [];

            for ( $summaryIndex = 0; $summaryIndex < count($summaryStatusesArr); $summaryIndex++ ) {
                $tempElectionCampaignId = $summaryStatusesArr[$summaryIndex]->election_campaign_id;

                $summary['statuses']['election_campaigns'][$tempElectionCampaignId] = $summaryStatusesArr[$summaryIndex];
            }
        }

        if ( 1 == $display_vote_statistics ) {
            $shasVotesArr = DB::table(DB::Raw('( ' . $shasVotesForSum->toSql() . ' ) AS t1'))
                ->setBindings([$shasVotesForSum->getBindings()])
                ->select(['t1.election_campaign_id', DB::raw('sum(shas_votes) as sum_shas_votes')])
                ->groupBy('t1.election_campaign_id');
               
			 $shasVotesArr =  $shasVotesArr->get();

            $summary['shas_votes']['election_campaigns'] = [];
            for ( $shasVotesIndex = 0; $shasVotesIndex < count($shasVotesArr); $shasVotesIndex++ ) {
                $tempElectionCampaignId = $shasVotesArr[$shasVotesIndex]->election_campaign_id;

                $summary['shas_votes']['election_campaigns'][$tempElectionCampaignId] = $shasVotesArr[$shasVotesIndex];
            }
        }
        // if ( 1 == $display_prev_votes_percents ) { 

        // }

        $result = [
            'count_records' => $countRecords->count_ballot_boxes,
            'campaigns' => $campaigns,
            'summary' => $summary
        ];

        return $result;
    }

	/*
		Private helpful function that validates POST inputs 
		for creating ballot-box summary report (by any geo entity)
    */
    private function validateBallotsPollingSummaryData(Request $request) {
        $summary_by_id = $request->input('summary_by_id', null);

        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = json_decode($request->input('selected_cities'));
        $cluster_id = json_decode($request->input('selected_clusters' ));
        $ballot_id = json_decode($request->input('selected_ballots' ));

        $selected_statuses = $request->input('selected_statuses', null);

        $is_district_city = $request->input('is_district_city', null);
        $is_ballot_strictly_orthodox = $request->input('is_ballot_strictly_orthodox', null);

        $display_num_of_votes = $request->input('display_num_of_votes', null);
        $display_vote_statistics = $request->input('display_vote_statistics', null);
        $display_statuses_statistics = $request->input('display_statuses_statistics', null);

        $selected_campaigns = $request->input('selected_campaigns', null);

        if ( is_null($summary_by_id) || !$this->validateIntInput('summary_by_id', $summary_by_id) ) {
           return config('errors.elections.BALLOT_POLLING_INVALID_SUMMARY_BY');
        }

        

        if ( count($city_id)>0 ) {
                $cityObj = City::select(['id', 'key'])->whereIn('key', $city_id)->get();
                if ( count($cityObj) == 0 ) {
                    return config('errors.elections.BALLOT_POLLING_INVALID_CITY');
                } 
        }
		else{
			return config('errors.elections.BALLOT_POLLING_INVALID_CITY');
		}

        if ( is_null($selected_statuses) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_SUPPORT_STATUS');
        }

        if ( is_null($is_district_city) || !in_array($is_district_city, [0,1]) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_IS_DISTRICT');
        }

        if ( is_null($is_ballot_strictly_orthodox) || !in_array($is_ballot_strictly_orthodox, [0,1]) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_STRICTLY_ORTHODOX');
        }

        if ( is_null($display_num_of_votes) || !in_array($display_num_of_votes, [0,1]) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_DISPLAY_NUM_OF_VOTES');
        }

        if ( is_null($display_vote_statistics) || !in_array($display_vote_statistics, [0,1]) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_DISPLAY_VOTE_STATISTICS');
        }

        if ( is_null($display_statuses_statistics) || !in_array($display_statuses_statistics, [0,1]) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_DISPLAY_STATUSES_STATISTICS');
        }

        if ( is_null($selected_campaigns) ) {
            return config('errors.elections.BALLOT_POLLING_INVALID_SELECTED_CAMPAIGNS');
        }

        for ( $index = 0; $index < count($selected_campaigns); $index++ ) {
            if (!$this->validateIntInput('selected_campiain_id', $selected_campaigns[$index]) ) {
                return config('errors.elections.BALLOT_POLLING_INVALID_SELECTED_CAMPAIGNS');
            }
        }

        $systemSupportStatuses = SupportStatus::select(['id', 'key'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        for ( $selectedStatusIndex = 0; $selectedStatusIndex < count($selected_statuses); $selectedStatusIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedStatusIndex];

            if ( $selectedStatusKey != config('constants.status_change_report.SELECTED_SUPPORT_STATUS_NONE') &&
                !isset($systemSupportHashByKey[$selectedStatusKey]) ) {
                return config('errors.elections.STATUS_CHANGE_INVALID_SELECTED_STATUSES');
            }
        }

        return 'OK';
    }
	
	/*
		Helpful function that returns geographical clusters , neighborhoods and ballots
	*/
	private function getStrictedGeoLists(){
		 $last_campaign_id = VoterElectionsController::getLastCampaign();
		 $clustersIDSArray=[];
		 $neighborhoodsIDSArray=[];
		 $ballotsIDSArray=[];

        $geographicFilters = GeoFilterService::getAllUserGeoFilters();
        
        for($i = 0 ; $i < count($geographicFilters);$i++){
            $item = $geographicFilters[$i];
            switch($item->entity_type){

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                    $areaIdList = AreasGroup::getAllAreas($item->entity_id);
                    // dd($areaIdList);
                    if(!empty($areaIdList)){
                        $whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';
                            
                        $clustersArr = Cluster::select('id')->whereRaw("city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery)")->get();
                        for($s = 0;$s<count($clustersArr) ; $s++){
                            array_push($clustersIDSArray , $clustersArr[$s]->id);
                        }
                        
                        $neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw("city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery)")->get();
                        for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                            array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                        }
                        $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted=0 and area_id $whereInIdsQuery))")->get();
                        for($s = 0;$s<count($ballotsArr) ; $s++){
                            array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                        }
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                    $clustersArr = Cluster::select('id')->whereRaw('city_id in (select id from cities where deleted=0 and area_id='.$item->entity_id.')')->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->id);
                    }
                    
                    $neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw('city_id in (select id from cities where deleted=0 and area_id='.$item->entity_id.')')->get();
                    for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                        array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                    }
                    $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted = 0 and area_id=".$item->entity_id."))")->get();
                    for($s = 0;$s<count($ballotsArr) ; $s++){
                        array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                    $clustersArr = Cluster::select('id')->whereRaw('city_id in (select id from cities where deleted=0 and sub_area_id='.$item->entity_id.')')->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->id);
                    }
                    
                    $neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw('city_id in (select id from cities where deleted=0 and sub_area_id='.$item->entity_id.')')->get();
                    for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                        array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                    }
                    $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted = 0 and sub_area_id=".$item->entity_id."))")->get();
                    for($s = 0;$s<count($ballotsArr) ; $s++){
                        array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                    $clustersArr = Cluster::select('id')->where('city_id' , $item->entity_id)->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->id);
                    }
                    $neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->where('city_id' , $item->entity_id)->get();
                    for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                        array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                    }
                    $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id =".$item->entity_id.")")->get();
                    for($s = 0;$s<count($ballotsArr) ; $s++){
                        array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
                    $clustersArr = Cluster::select('id')->where('neighborhood_id' , $item->entity_id)->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->id);
                    }
                    array_push($neighborhoodsIDSArray ,  $item->entity_id);
                    $ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and neighborhood_id =".$item->entity_id.")")->get();
                    for($s = 0;$s<count($ballotsArr) ; $s++){
                        array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                    $clustersArr = Cluster::select('id')->where('id' , $item->entity_id)->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->id);
                    }
                    $neighborhoodsArr = Cluster::select('neighborhood_id')->where('clusters.neighborhood_id' , $item->entity_id)->get();
                    for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                        array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
                    }
                    $ballotsArr=BallotBox::select('ballot_boxes.id')->where("cluster_id",$item->entity_id)->get();
                    for($s = 0;$s<count($ballotsArr) ; $s++){
                        array_push($ballotsIDSArray , $ballotsArr[$s]->id);
                    }
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
                    $clustersArr = BallotBox::select('cluster_id')->where('id' , $item->entity_id)->get();
                    for($s = 0;$s<count($clustersArr) ; $s++){
                        array_push($clustersIDSArray , $clustersArr[$s]->cluster_id);
                    }
                    $neighborhoodsArr = Neighborhood::select('id')->whereRaw('id in (select neighborhood_id from clusters where id in (select cluster_id from ballot_boxes where id='.$item->entity_id.'))')->get();
                    for($s = 0;$s<count($neighborhoodsArr) ; $s++){
                        array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->cluster_id);
                    }
                    array_push($ballotsIDSArray , $item->entity_id);
                    break;
            }
        }

		 $returnedObj = new \stdClass;
		 $returnedObj->clustersIDSArray = $clustersIDSArray;
		 $returnedObj->neighborhoodsIDSArray = $neighborhoodsIDSArray;
		 $returnedObj->ballotsIDSArray = $ballotsIDSArray;
		 return  $returnedObj;
	}

	/*
		Function that returns ballots-summary report by specific entity type that is sent as POST params
	*/
    public function displayBallotsPollingSummary(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        if ( ($code = $this->validateBallotsPollingSummaryData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($code);
            return;
        }
		$restrictedGeoLists = $this->getStrictedGeoLists();
		
        $summary_by_id = $request->input('summary_by_id', null);

        switch ($summary_by_id) {
            case config('constants.ballots_polling_summary_by.NONE'):
                $area_id = $request->input('area_id', null);
                $sub_area_id = $request->input('sub_area_id', null);
                $city_id = json_decode($request->input('selected_cities'));
				$cluster_id = json_decode($request->input('selected_clusters'));
				$ballot_id = json_decode($request->input('selected_ballots'));

                if ( count($ballot_id) >0) {
                    $result = $this->displayBallotsPollingSummaryByBallot($request, false , $restrictedGeoLists);
                } else if ( count($cluster_id)>0 ) {
                    $result = $this->displayBallotsPollingSummaryByBallot($request, false , $restrictedGeoLists);
                } else if ( sizeof( $city_id)>0 ) {
                    $result = $this->displayBallotsPollingSummaryByCluster($request , false , $restrictedGeoLists);
                } else if ( !is_null($sub_area_id) ) {
                    $result = $this->displayBallotsPollingSummaryByCity($request, false , $restrictedGeoLists);
                } else if ( !is_null($area_id) ) {
                    $result = $this->displayBallotsPollingSummaryByCity($request, false , $restrictedGeoLists);
                }

                $jsonOutput->setData($result);
                break;

            case config('constants.ballots_polling_summary_by.BY_AREA'):
                $result = $this->displayBallotsPollingSummaryByArea($request, false , $restrictedGeoLists);
                $jsonOutput->setData($result);
                break;

            case config('constants.ballots_polling_summary_by.BY_CITY'):
                $result = $this->displayBallotsPollingSummaryByCity($request, false , $restrictedGeoLists);
                $jsonOutput->setData($result);
                break;

            case config('constants.ballots_polling_summary_by.BY_CLUSTER'):
                $result = $this->displayBallotsPollingSummaryByCluster($request , false , $restrictedGeoLists);
                $jsonOutput->setData($result);
                break;

            case config('constants.ballots_polling_summary_by.BY_BALLOT'):
                $result = $this->displayBallotsPollingSummaryByBallot($request, false , $restrictedGeoLists);
                $jsonOutput->setData($result);
                break;
        }
    }
    private function getPrevElectionsVotesPercents($queryObj, $last_campaign_id, $summaryBy, $display_prev_votes_percents, $display_strictly_orthodox_percents ,$display_sephardi_percents){
        $fields = ['clusters.election_campaign_id'];
        $detailsList = [];
        if($display_prev_votes_percents){
            $detailsList[] = 'total_votes_percents';
            $detailsList[] = 'shas_votes_percents';
        }
        if($display_strictly_orthodox_percents){ // for voters in current election 
            $detailsList[] = 'strictly_orthodox_percents';
        }
        if($display_sephardi_percents){ // for voters in current election 
            $detailsList[] = 'sephardi_percents';
        }
        // $votesCountQuery = "CASE WHEN ballot_boxes.votes_count IS NOT NULL THEN ballot_boxes.votes_count ELSE 0 END";
        $votesCountQuery = "IFNULL(ballot_boxes.votes_count,0)";
        $votersCountQuery = "IFNULL(ballot_boxes.voter_count,0)";
        // dump('$last_campaign_id', $last_campaign_id);
        foreach ($detailsList as $d){
            if($d == 'strictly_orthodox_percents' || $d == 'sephardi_percents'){
                $countQuery = $votersCountQuery;
                $selectColQuery = "ballot_boxes.$d";
            } else {
                $countQuery = $votesCountQuery;
                $selectColQuery = "(CASE WHEN clusters.election_campaign_id = $last_campaign_id THEN ballot_boxes.calculated_probability_$d ELSE ballot_boxes.calculated_mi_$d END)";
            }
            // $fields[] = DB::raw("(AVG($selectColQuery * $countQuery) / (AVG($countQuery))) as $d");
            $fields[] = DB::raw("(AVG($selectColQuery * $countQuery) / (AVG($countQuery))) as $d");
            // $fields[] = DB::raw("(SUM($selectColQuery * $countQuery)) as `$d-percent`"); 
            // $fields[] = DB::raw("(SUM($countQuery)) as `$d-total`");

        }
        switch ($summaryBy){
            case 'area':
                $queryObj->groupBy('areas.id');
                $fields[] = 'areas.id';
                break;
            case 'city':
                $fields[] = 'cities.id';
                break;
            case 'cluster':
                $queryObj->groupBy( 'clusters.election_campaign_id');
                $fields[] = 'clusters.mi_id';
                $fields[] = 'cities.id as city_id';
                break;
            case 'ballot':
                $queryObj->groupBy('clusters.election_campaign_id');
                $fields[] = 'ballot_boxes.mi_id';
                $fields[] = 'cities.id as city_id';
                break;
        }
        $ballotsDetailsCollection = $queryObj
        ->select($fields)
        // ->whereNotNull('ballot_boxes.votes_count')  //!! Need to get from elections municipal data
        // ->whereNotNull('ballot_boxes.voter_count') //!! Need to calculate in the beginning of service
        ->get();
        // dd('ballotsDetailsCollection', $ballotsDetailsCollection->toArray());
        $ballotsDetailsHash = [];
        foreach($ballotsDetailsCollection as $index => $item) {
            if($summaryBy == 'ballot' || $summaryBy == 'cluster'){
                $tempId = "$item->mi_id-$item->city_id" ;
            }else{
                $tempId = $item->id;
            }
            $tempElectionCampaignId = $item->election_campaign_id;

            if ( !isset($ballotsDetailsHash[$tempId]['election_campaigns']) ) {
                $ballotsDetailsHash[$tempId]['election_campaigns'] = [];
            } 
            foreach ($detailsList as $d){
                if( !isset($ballotsDetailsHash[$tempId]['election_campaigns'][$tempElectionCampaignId])){
                    $ballotsDetailsHash[$tempId]['election_campaigns'][$tempElectionCampaignId] = [];
                }
                if( !isset($ballotsDetailsHash[$tempId]['election_campaigns'][$tempElectionCampaignId][$d])){
                    $ballotsDetailsHash[$tempId]['election_campaigns'][$tempElectionCampaignId][$d] = 0;
                }
                $ballotsDetailsHash[$tempId]['election_campaigns'][$tempElectionCampaignId][$d] = round($item->$d, 1);

            }
        }
        return $ballotsDetailsHash;
    }
	/*
		Private helpful function that  returns a summary row for ballot_box summary report
	*/
    private function getSummaryRowResult(Request $request, $result) {
        $summary = $result['summary'];

        $selected_statuses = $request->input('selected_statuses', null);

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $summaryRow = [
            'mi_id' => '',
            'city_name' => ''
        ];

        $summary_by_id = $request->input('summary_by_id', null);
        switch ($summary_by_id) {
            case config('constants.ballots_polling_summary_by.BY_CITY'):
                $summaryRow['clusters_count'] = '';
                $summaryRow['count_ballot_boxes'] = '';
                break;

            case config('constants.ballots_polling_summary_by.BY_CLUSTER'):
                $summaryRow['cluster_name'] = '';
                $summaryRow['ballot_boxes_count'] = '';
                break;

            case config('constants.ballots_polling_summary_by.BY_BALLOT'):
                $summaryRow['cluster_name'] = '';
                $summaryRow['ballot_box_name'] = '';
                break;
        }

        $display_num_of_votes = $request->input('display_num_of_votes', null);
        if ( 1 == $display_num_of_votes ) {
            $summaryRow['count_total_voters'] = '';
            $summaryRow['votes_percents'] = '';
        }
		$electionCampaignsNamesHash=[];
        $display_vote_statistics = $request->input('display_vote_statistics', null);
        $selected_campaigns = $request->input('selected_campaigns', null);
        if ( 1 == $display_vote_statistics ) {
            for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                $campainId = $selected_campaigns[$campainIndex];
				$campaignName = ElectionCampaigns::select('name')->where('id',$campainId)->first();
                if($campaignName){
					$campaignName = $campaignName->name;
					if(!array_key_exists($campaignName,$electionCampaignsNamesHash)){
						$electionCampaignsNamesHash[$campainId] = $campaignName;
					}
				}
				else{
					$campaignName = $campainId;
					$electionCampaignsNamesHash[$campainId] = $campaignId;
				}
				if ( isset($summary['shas_votes']['election_campaigns'][$campainId]) ) {
                    $summaryRow['הצבעות ש"ס ' . $campaignName] = $summary['shas_votes']['election_campaigns'][$campainId]->sum_shas_votes;
                } else {
                    $summaryRow['הצבעות ש"ס ' . $campaignName] = '';
                }
            }
        }

        $display_statuses_statistics = $request->input('display_statuses_statistics', null);
        if ( 1 == $display_statuses_statistics ) {
            if ($isSupportStausNoneSelected) {
                for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                    $campainId = $selected_campaigns[$campainIndex];

                    if ( isset($summary['statuses']['election_campaigns'][$campainId]) ) {
                        $summaryRow['ללא סטטוס ' . $electionCampaignsNamesHash[$campainId]] = $summary['statuses']['election_campaigns'][$campainId]->sum_voter_support_status_none;
                    } else {
                        $summaryRow['ללא סטטוס ' . $campainId] = '';
                    }
                }
            }

            for ( $supportStatusIndex = 0; $supportStatusIndex < count($selectedStatusesIds); $supportStatusIndex++ ) {
                $supportStatusId = $selectedStatusesIds[$supportStatusIndex];
                $sumField = 'sum_voters_support_status' . $supportStatusId;

				$supportStatusName = SupportStatus::select('name')->where('id',$supportStatusId)->first();
				if($supportStatusName){
					$supportStatusName = $supportStatusName->name;
				}
				else{
					$supportStatusName = $supportStatusId ;
				}
				
                for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                    $campainId = $selected_campaigns[$campainIndex];
					
                    if ( isset($summary['statuses']['election_campaigns'][$campainId]) ) {
                        $summaryRow[$supportStatusName. ' '. $electionCampaignsNamesHash[$campainId]] = $summary['statuses']['election_campaigns'][$campainId]->{$sumField};
                    } else {
                        $summaryRow[$supportStatusName . ' '. $electionCampaignsNamesHash[$campainId]] = '';
                    }
                }
            }
        }

        return $summaryRow;
    }

	/*
		Private helpful function that  returns ballot-summary report in needed formar for UI usage
	*/
    private function convertPollingSummaryByBallot(Request $request, $result) {
        $exportedRows = [];

        $selected_statuses = $request->input('selected_statuses', null);

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $exportedRows[] = $this->getSummaryRowResult($request, $result);
        $records = $result['campaigns']->toArray();

        for ($rowIndex = 0; $rowIndex < count($records); $rowIndex++) {
            $newRow = [
                'city_mi_id' => $records[$rowIndex]['city_mi_id'],
                'city_name' => $records[$rowIndex]['city_name'],
                'cluster_name' => $records[$rowIndex]['cluster_name'],
                'ballot_box_name' => $records[$rowIndex]['ballot_box_name']
            ];

            $display_num_of_votes = $request->input('display_num_of_votes', null);
            if ( 1 == $display_num_of_votes ) {
                if ( isset($records[$rowIndex]['count_total_voters']) ) {
                    $newRow['count_total_voters'] = $records[$rowIndex]['count_total_voters'];
                } else {
                    $newRow['count_total_voters'] = '';
                }

                if ( !empty($records[$rowIndex]['count_total_voters']) && isset($records[$rowIndex]['count_elections_votes']) ) {
                    $newRow['count_elections_votes'] = round(($records[$rowIndex]['count_elections_votes'] * 100) / $records[$rowIndex]['count_total_voters'], 0);
                    $newRow['count_elections_votes'] .= '%';
                } else {
                    $newRow['count_elections_votes'] = '';
                }
            }

            $display_vote_statistics = $request->input('display_vote_statistics', null);
            $selected_campaigns = $request->input('selected_campaigns', null);
            if ( 1 == $display_vote_statistics ) {
                $electionCampaignPartyListVotesHash = [];

                if ( isset($records[$rowIndex]['election_campaign_party_list_votes']) ) {
                    for ( $shasVoteIndex = 0; $shasVoteIndex < count($records[$rowIndex]['election_campaign_party_list_votes']); $shasVoteIndex++ ) {
                        $campaignId = $records[$rowIndex]['election_campaign_party_list_votes'][$shasVoteIndex]['election_campaign_id'];

                        $electionCampaignPartyListVotesHash[$campaignId] = $records[$rowIndex]['election_campaign_party_list_votes'][$shasVoteIndex];
                    }
                }

                for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                    $campainId = $selected_campaigns[$campainIndex];

                    if ( isset($electionCampaignPartyListVotesHash[$campainId]) ) {
                        $newRow['shas_votes_' . $campainId] = $electionCampaignPartyListVotesHash[$campainId]['shas_votes'];
                    } else {
                        $newRow['shas_votes_' . $campainId] = '';
                    }
                }
            }

            $display_statuses_statistics = $request->input('display_statuses_statistics', null);
            if ( 1 == $display_statuses_statistics ) {
                if ($isSupportStausNoneSelected) {
                    for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                        $campainId = $selected_campaigns[$campainIndex];

                        if ( isset($records[$rowIndex]['support_statuses'][$campainId]) ) {
                            $newRow['support_statuse_none_' . $campainId] = $records[$rowIndex]['support_statuses'][$campainId]['count_voter_support_status_none'];
                        } else {
                            $newRow['support_statuse_none_' . $campainId] = '';
                        }
                    }
                }

                for ( $supportStatusIndex = 0; $supportStatusIndex < count($selectedStatusesIds); $supportStatusIndex++ ) {
                    $supportStatusId = $selectedStatusesIds[$supportStatusIndex];
                    $countField = 'count_voters_support_status' . $supportStatusId;

                    for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                        $campainId = $selected_campaigns[$campainIndex];

                        if ( isset($records[$rowIndex]['support_statuses'][$campainId]) ) {
                            $newRow['support_statuse' . $supportStatusId . '_' . $campainId] = $records[$rowIndex]['support_statuses'][$campainId][$countField];
                        } else {
                            $newRow['support_statuse' . $supportStatusId . '_' . $campainId] = '';
                        }
                    }
                }
            }

            $exportedRows[] = $newRow;
        }

        return $exportedRows;
    }

    /**
     * This function converts the summary row
     * of results by cluster
     *
     */
    private function convertPollingSummaryByCluster(Request $request, $result) {
	 
        $exportedRows = [];

        $selected_statuses = $request->input('selected_statuses', null);

        $systemSupportStatuses = SupportStatus::select(['id', 'key', 'level'])
            ->where(['deleted' => 0, 'active' => 1])
            ->get();

        $systemSupportHashByKey = [];
        for ($stausIndex = 0; $stausIndex < count($systemSupportStatuses); $stausIndex++) {
            $supportStatuskey = $systemSupportStatuses[$stausIndex]->key;

            $systemSupportHashByKey[$supportStatuskey] = $systemSupportStatuses[$stausIndex];
        }

        $selectedStatusesIds = [];
        $isSupportStausNoneSelected = false;
        for ( $selectedIndex = 0; $selectedIndex < count($selected_statuses); $selectedIndex++ ) {
            $selectedStatusKey = $selected_statuses[$selectedIndex];

            if ( $selectedStatusKey == config('constants.ballots_summary_report.SELECTED_SUPPORT_STATUS_NONE') ) {
                $isSupportStausNoneSelected = true;
            } else {
                $selectedStatusesIds[] = $systemSupportHashByKey[$selectedStatusKey]->id;
            }
        }

        $exportedRows[] = $this->getSummaryRowResult($request, $result);
 
	    $records = $result['campaigns']->toArray();
        
        for ($rowIndex = 0; $rowIndex < count($records); $rowIndex++) {
            $newRow = [
                'city_mi_id' => $records[$rowIndex]['city_mi_id'],
                'city_name' => $records[$rowIndex]['city_name']
            ];

            $summary_by_id = $request->input('summary_by_id', null);
            switch ($summary_by_id) {
                case config('constants.ballots_polling_summary_by.BY_CITY'):
                    $newRow['clusters_count'] = $records[$rowIndex]['clusters_count'];
                    $newRow['count_ballot_boxes'] = $records[$rowIndex]['count_ballot_boxes'];
                    break;

                case config('constants.ballots_polling_summary_by.BY_CLUSTER'):
                    $newRow['cluster_name'] = $records[$rowIndex]['cluster_name'];
                    $newRow['ballot_boxes_count'] = $records[$rowIndex]['ballot_boxes_count'];
                    break;
            }

            $display_num_of_votes = $request->input('display_num_of_votes', null);
            if ( 1 == $display_num_of_votes ) {
                if ( isset($records[$rowIndex]['count_total_voters']) ) {
                    $newRow['count_total_voters'] = $records[$rowIndex]['count_total_voters'];
                } else {
                    $newRow['count_total_voters'] = '';
                }

                if ( !empty($records[$rowIndex]['count_total_voters']) && isset($records[$rowIndex]['count_elections_votes']) ) {
                    $newRow['count_elections_votes'] = round(($records[$rowIndex]['count_elections_votes'] * 100) / $records[$rowIndex]['count_total_voters'], 0);
                    $newRow['count_elections_votes'] .= '%';
                } else {
                    $newRow['count_elections_votes'] = '';
                }
            }

            $display_vote_statistics = $request->input('display_vote_statistics', null);
            $selected_campaigns = $request->input('selected_campaigns', null);
            if ( 1 == $display_vote_statistics ) {
                for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                    $campainId = $selected_campaigns[$campainIndex];

                    if ( isset($records[$rowIndex]['shas_votes'][$campainId]) ) {
                        $newRow['shas_votes_' . $campainId] = $records[$rowIndex]['shas_votes'][$campainId]['shas_votes'];
                    } else {
                        $newRow['shas_votes_' . $campainId] = '';
                    }
                }
            }

            $display_statuses_statistics = $request->input('display_statuses_statistics', null);
            if ( 1 == $display_statuses_statistics ) {
                if ($isSupportStausNoneSelected) {
                    for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                        $campainId = $selected_campaigns[$campainIndex];

                        if ( isset($records[$rowIndex]['support_statuses'][$campainId]) ) {
                            $newRow['support_statuse_none_' . $campainId] = $records[$rowIndex]['support_statuses'][$campainId]['count_voter_support_status_none'];
                        } else {
                            $newRow['support_statuse_none_' . $campainId] = '';
                        }
                    }
                }

                for ( $supportStatusIndex = 0; $supportStatusIndex < count($selectedStatusesIds); $supportStatusIndex++ ) {
                    $supportStatusId = $selectedStatusesIds[$supportStatusIndex];
                    $countField = 'count_voters_support_status' . $supportStatusId;

                    for ( $campainIndex = 0; $campainIndex < count($selected_campaigns); $campainIndex++ ) {
                        $campainId = $selected_campaigns[$campainIndex];

                        if ( isset($records[$rowIndex]['support_statuses'][$campainId]) ) {
                            $newRow['support_statuse' . $supportStatusId . '_' . $campainId] = $records[$rowIndex]['support_statuses'][$campainId][$countField];
                        } else {
                            $newRow['support_statuse' . $supportStatusId . '_' . $campainId] = '';
                        }
                    }
                }
            }

            $exportedRows[] = $newRow;
        }
  
        return $exportedRows;
    }

	/*
		Function that exports ballot-summary report to PDF/PRINT/other formats , by input POST params
    */
    public function exportBallotsPollingSummaryData(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
		
	
        if ( ($code = $this->validateBallotsPollingSummaryData($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($code);
            return;
        }
		
		$restrictedGeoLists = $this->getStrictedGeoLists();

        $jsonOutput->setBypass(true);

        $summary_by_id = $request->input('summary_by_id', null);
		
        switch ($summary_by_id) {
            case config('constants.ballots_polling_summary_by.NONE'):
 
                $area_id = $request->input('area_id', null);
                $sub_area_id = $request->input('sub_area_id', null);
                $city_id = json_decode($request->input('selected_cities'));
                $cluster_id = json_decode($request->input('selected_cluters'));
                $ballot_id = json_decode($request->input('selected_ballots'));

                if ( count($ballot_id) > 0 ) {
                    $result = $this->displayBallotsPollingSummaryByBallot($request, true , $restrictedGeoLists);
                    $data = $this->convertPollingSummaryByBallot($request, $result);
                } else if ( count($cluster_id) > 0 ) {
                    $result = $this->displayBallotsPollingSummaryByBallot($request, true , $restrictedGeoLists);
                    $data = $this->convertPollingSummaryByBallot($request, $result);
                } else if ( count($city_id) > 0 ) {
                    $result = $this->displayBallotsPollingSummaryByCluster($request , true , $restrictedGeoLists);
                    $data = $this->convertPollingSummaryByCluster($request, $result);
                } else if ( !is_null($sub_area_id) ) {
                    $result = $this->displayBallotsPollingSummaryByCity($request, true , $restrictedGeoLists);
                    $data = $this->convertPollingSummaryByCluster($request, $result);
                } else if ( !is_null($area_id) ) {
                    $result = $this->displayBallotsPollingSummaryByCity($request, true , $restrictedGeoLists);
                    $data = $this->convertPollingSummaryByCluster($request, $result);
                }
                break;

            case config('constants.ballots_polling_summary_by.BY_AREA'):
                $result = $this->displayBallotsPollingSummaryByCity($request, true, $restrictedGeoLists);
                $data = $this->convertPollingSummaryByCluster($request, $result);
                break;

            case config('constants.ballots_polling_summary_by.BY_CITY'):
		
                $result = $this->displayBallotsPollingSummaryByCity($request, true, $restrictedGeoLists);
                $data = $this->convertPollingSummaryByCluster($request, $result);
                break;

            case config('constants.ballots_polling_summary_by.BY_CLUSTER'):
                $result = $this->displayBallotsPollingSummaryByCluster($request, true , $restrictedGeoLists);
				$data = $this->convertPollingSummaryByCluster($request, $result);
                break;

            case config('constants.ballots_polling_summary_by.BY_BALLOT'):
                $result = $this->displayBallotsPollingSummaryByBallot($request, true, $restrictedGeoLists);
                $data = $this->convertPollingSummaryByBallot($request, $result);
                break;
        }
 	
        $file_type = $request->input('file_type', null);
		
        return ExportService::export($data, $file_type);

    }

	/*
		Private helpful function that generates where[] array by geo-entity params sent
	*/
    private function getWhereGeoDetailsQuery($ballot_id ,$cluster_id, $city_id, $sub_area_id, $area_id, $is_district_city,
                                             $is_ballot_strictly_orthodox, $isCluster=false){
        $wherelist = [];

        if ( !is_null($sub_area_id) ) {
            $wherelist['cities.sub_area_id'] = $sub_area_id;
        } else if ( !is_null($area_id) ) {
            $wherelist['cities.area_id'] = $area_id;
        }

        if ( $is_district_city == 1 ) {
            $wherelist['cities.district'] = 1;
        }

        if (  $is_ballot_strictly_orthodox == 1 ) {
            $wherelist['ballot_boxes.strictly_orthodox'] = 1;
        }

        return $wherelist;
    }

    /**
     * Create support status connected hash list
     *
     * @param array $systemSupportHashByKey
     * @param collection $supportStatus
     * @param array $selectedStatus
     * @param array $selectedCampaigns
     * @return array
     */
    private function getSupportStatusConnectedHash($systemSupportHashByKey,
                                                    $supportStatus,
                                                    $selectedStatus,
                                                    $selectedCampaigns) {

        $supportStatusHash = [];
        foreach($supportStatus as $status) {
            $supportStatusHash[$status->id] = $status;
        }

        $campaignsHash = [];
        foreach($selectedCampaigns as $campaign) {
            $campaignsHash[$campaign] = true;
        }

        $connectedHash = [];
        foreach($selectedStatus as $status) {
            if ($status == "support_none") continue;
            $statusId = $systemSupportHashByKey[$status]->id;
            $statusHash = [$statusId];
            while ($supportStatusHash[$statusId]->connected_support_status_id != null) {
                $connectedStatusId = $supportStatusHash[$statusId]->connected_support_status_id;
                $connectedStatus = $supportStatusHash[$connectedStatusId];
                if (isset($campaignsHash[$connectedStatus->election_campaign_id])) $statusHash[] = $connectedStatus->id;
                $statusId = $connectedStatus->id;
            }

            $connectedHash[] = $statusHash;
        }

        return $connectedHash;

    }
    public static function updateBallotDetailsCounters($ballotBoxId = null, $voterId = null, $detailsToUpdate = 'all'  ){
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        if($voterId && !$ballotBoxId){
            $ballotBox = VotersInElectionCampaigns::select('ballot_box_id')->where([
               ['voter_id', '=', DB::raw($voterId) ] ,
               ['election_campaign_id', '=', DB::raw($currentCampaignId)] 
            ])->first();
            $ballotBoxId = $ballotBox ? $ballotBox->ballot_box_id : null;
        }
        if(empty($ballotBoxId)) { return;}

        $whereList = [
           [ 'voters_in_election_campaigns.election_campaign_id' ,'=',   DB::raw($currentCampaignId)],
           [ 'ballot_boxes.id' ,'=', $ballotBoxId]
        ];
        $fields = [
            'ballot_boxes.id as ballot_box_id',
            // DB::raw('sum(voters.strictly_orthodox)'),
            // 'ballot_boxes.voter_count',
        ];
        $strictlyOrthodoxQuery = "CASE WHEN religious_groups.system_name = 'strictly_orthodox' THEN 1 ELSE 0 END";
        $strictlyOrthodoxField = DB::raw("((sum($strictlyOrthodoxQuery) / ballot_boxes.voter_count ) * 100) as strictly_orthodox_percents");
        $sephardiField =  DB::raw('( (sum(voters.sephardi) / ballot_boxes.voter_count) * 100) as sephardi_percents'); 
        switch($detailsToUpdate){
            case 'all':
                // $fields[] = DB::raw('(CASE WHEN strictly_orthodox THEN 1 ELSE 0 END;) as strictly_orthodox_percents');   
                $fields[] = $strictlyOrthodoxField;   
                $fields[] = $sephardiField;  
                $updateList = ['strictly_orthodox_percents', 'sephardi_percents'];
                break;
            case 'strictly_orthodox':
                $fields[] =$strictlyOrthodoxField;   
                $updateList = ['strictly_orthodox_percents'];
                break;
            case 'sephardi':
                $fields[] = $sephardiField;   
                $updateList = [ 'sephardi_percents'];
                break;
        }
        $ballotData = Voters::select($fields)
        ->withBallotBoxes()
        ->withReligiousGroup()
        ->where($whereList)
        ->whereNotNull('ballot_boxes.voter_count')
        ->groupBy('ballot_boxes.id')
        ->first();

        $updateArray = [];
        foreach($updateList as  $item){
            $updateArray[$item] = $ballotData->$item != null ? (int) round ($ballotData->$item) : 0 ;
        }
        ballotBox::where('ballot_boxes.id', $ballotData->ballot_box_id)->update($updateArray);
        // dump([
        //     'updateArray' => $updateArray,
        //     'ballotData' => $ballotData->toArray()
        // ]);
        $jsonOutput->setData(
            [
                'updateArray' => $updateArray,
                'ballotData' => $ballotData
            ]);
    }
}