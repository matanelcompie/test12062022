<?php

use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\SupportStatus;
use App\Models\VoterCaptainFifty;
use App\Models\VoterFilter\VoterFilterDefinition;
use App\Models\VoterFilter\VoterQuery;
use App\Models\Voters;
use App\Models\VoterSupportStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class HouseHoldsService{
    /**
     *  @method household
     *  Search for households by params
     *  Function that returns households list with data stats
     *  @return (array) - list of households.
     */

    public static function household(Request $request) {
        $currentPage = $request->input('current_page', 1);
        $limit = config('constants.activists.MAX_RECORDS_FROM_DB');
        $skip = ( $currentPage -1 ) * config('constants.activists.MAX_RECORDS_FROM_DB');

        $city_id = $request->input('city_id', null);
        $street_id = $request->input('street_id', null);
        $street_name = $request->input('street_name', null);
        $neighborhood_id = $request->input('neighborhood_id', null);
        $cluster_id = $request->input('cluster_id', null);
        $ballot_id = $request->input('ballot_id', null);
        $captain_id = $request->input('captain_id', null);

        $last_name = $request->input('last_name', null);

        $allocated_to_captain50 = $request->input('allocated_to_captain50', null);

        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $electionRoleCaptain = ElectionRoles::select('id')
            ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
            ->first();
 
        $with_no_households = ($request->input('with_no_households', null) === 1);
        $countVotersQuery =  !$with_no_households ? self::getCountVotersInHouseholdQuery() : 'count(voters.id) as household_members_count';
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true, 'captain_clusters');
        
        $fields = [
            'voters.key as voter_key',
            'voters.last_name',
            'voters.household_id',
            'voters.mi_city_id',
            'voters.mi_house',
            'voters.mi_street',
            'captain_clusters.prefix',
            'captain_clusters.id as cluster_id',
            DB::raw($fullClusterNameQuery),
            'captain_cities.name as city_name',

            'captain_ballot_boxes.id as ballot_box_id',
            'captain_ballot_boxes.mi_id',

            'captain_voters.id as captain_id',
            'captain_voters.key as captain_key',
            'captain_voters.personal_identity as captain_personal_identity',
            'captain_voters.first_name as captain_first_name',
            'captain_voters.last_name as captain_last_name',

            'election_roles_by_voters.user_lock_id',
            'election_roles_by_voters.lock_date',
            'election_roles_by_voters.key as captain_election_role_key',
            DB::raw($countVotersQuery)
        ];

        $where = [];
        $countField = !$with_no_households ? 'voters.household_id' : 'voters.id';
        $countFields = [
            DB::raw("count(distinct $countField) as numOfHouseholds")
        ];
        
        if ( !is_null($captain_id) ) {
            $where['captain_voters.id'] = $captain_id;
        }

        $householdObj = VoterQuery::withFilters()->select($fields)
            ->withCaptain50($last_campaign_id)
            ->withCaptainVoterDetails()
            ->where('voters_in_election_campaigns.election_campaign_id', $last_campaign_id)
            ->leftJoin('election_roles_by_voters',function($joinOn) use($last_campaign_id, $electionRoleCaptain){
                $joinOn->on('election_roles_by_voters.voter_id','=','captain_voters.id')
                    ->where('election_roles_by_voters.election_campaign_id', $last_campaign_id)
                    ->where('election_roles_by_voters.election_role_id', $electionRoleCaptain->id);
            });
        $countObj = VoterQuery::withFilters()->select($countFields)
            ->withCaptain50($last_campaign_id)
            ->withCaptainVoterDetails();

        if ( !is_null($ballot_id) ) {
            $where['captain_ballot_boxes.id'] = $ballot_id;
        } else if ( !is_null($cluster_id) ) {
            $where['captain_clusters.id'] = $cluster_id;
        } else if ( !is_null($street_id) ) {
            $householdObj->where(function ($query) use ($street_id, $street_name) {
                $query->orWhere('voters.mi_street_id', $street_id)
                    ->orWhere('voters.mi_street', $street_name);
            });

            $countObj->where(function ($query) use ($street_id, $street_name) {
                $query->orWhere('voters.mi_street_id', $street_id)
                    ->orWhere('voters.mi_street', $street_name);
            });

            $where['voters.mi_city_id'] = $city_id;
        } else if ( !is_null($neighborhood_id) ) {
            $where['voters.neighborhood'] = $neighborhood_id;
            $where['voters.mi_city_id'] = $city_id;
        } else if ( !is_null($city_id) ) {
            $where['voters.mi_city_id'] = $city_id;
        }

        if ( count($where) > 0 ) {
            $householdObj->where($where);
            $countObj->where($where);
        }

        if ( !is_null($last_name) ) {
            $householdObj->where('voters.last_name', 'LIKE', '%' . $last_name . '%');
            $countObj->where('voters.last_name', 'LIKE', '%' . $last_name . '%');
        }

        if ( !is_null($allocated_to_captain50) ) {
            if ( 0 == $allocated_to_captain50 ) {
                $householdObj->whereNull('captain_voters.id');
                $countObj->whereNull('captain_voters.id');
            } else if ( 1 == $allocated_to_captain50 ) {
                $householdObj->whereNotNull('captain_voters.id');
                $countObj->whereNotNull('captain_voters.id');
            }
        }

        $filter_items = $request->input('filter_items', null);
        if ( !is_null($filter_items) ) {
            $filterItems = json_decode($filter_items, true);

            $filterDefinitions = VoterFilterDefinition::get()
                ->groupBy('id')
                ->makeVisible(['model', 'model_list_function', 'model_list_dependency_id', 'join', 'constrains', 'where_type', 'field'])
                ->each(function ($row) {
                    $row[0]->setHidden(['values']);
                });

            $householdObj->filterItems($filterItems, $filterDefinitions);
            $countObj->filterItems($filterItems, $filterDefinitions);
        }
	 
            $householdObj->with(['householdMembers' => function($query) use($last_campaign_id){
                $query->select('voters.id','household_id','personal_identity','first_name','last_name')
                ->join('voters_in_election_campaigns' , 'voters_in_election_campaigns.voter_id' , '=' , 'voters.id')
                ->where('voters_in_election_campaigns.election_campaign_id', $last_campaign_id);
            }]);

            if(!$with_no_households){ // Get only voters - and no households.
                $householdObj->groupBy('voters.household_id');
                $countObj->groupBy('voters.household_id');
            } else{
                $householdObj->groupBy('voters.id');
                $countObj->groupBy('voters.id');
            }

        $households = $householdObj->skip($skip)->take($limit)->get();
        $sumObj = DB::table(DB::Raw('( ' . $countObj->toSql() . ' ) AS t1'))
            ->setBindings([$countObj->getBindings()])
            ->select(DB::raw('sum(numOfHouseholds) as totalHouseholds'))
            ->first();

        $result = [
            'totalHouseholds' => is_null($sumObj->totalHouseholds) ? 0 : $sumObj->totalHouseholds,
            'households' => $households
        ];
        return $result;
    }
    /** 
     * @method search
     * Function that performs search of households , by POST params
	*/
    public static function search(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        $result = [];

        $query = ElectionCampaigns::select('voters.household_id', 'voters.last_name'
                        , 'cities.name AS city', 'voters.street', 'voters.house', 'voters.house_entry', 'voters.flat')
                ->withVoterElectionCampaign($currentCampaignId)
                ->withVoter()
                ->withCity();

        $isGeoFilterExists = self::addGeographicalFilter($request, $query);

        if (!$isGeoFilterExists) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        $result['geoVotersCount'] = $query->count();
        $households = $query->groupBy('voters.household_id')->pluck('household_id')->all();
        $result['geoHouseholdsCount'] = count($households);

        $isSupportStatusExists = self::addSupportStatusFilter($request, $query, $currentCampaignId);

        if (!$isSupportStatusExists) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        $relevantHouseHolders = $query->groupBy('voters.household_id')->addSelect(DB::raw('count(voters.id) AS voters_count'))->get();
        $result['relevantHouseHolders'] = self::handleSearchResults($relevantHouseHolders);

        $jsonOutput->setData($result);
    }

	/*
		Function that adds households to captain fifty
	*/
    public static function addHouseholdsToCaptain50($jsonOutput, Request $request, $captain_key) {

        if ( is_null($captain_key) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_CAPTAIN'));
            return;
        }

        $households = $request->input('households', null);
        if ( is_null($households) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_HOUSEHOLD_KEYS'));
            return;
        }

        for ( $householdIndex = 0; $householdIndex < count($households); $householdIndex++ ) {
            if ( !self::validateHousehold($households[$householdIndex]) ) {
                $jsonOutput->setErrorCode(config('errors.elections.HOUSEHOLD_DOESNT_EXIST'));
                return;
            }
        }

        $voterFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name'
        ];
        $voterObj = Voters::select($voterFields)->where('voters.key', $captain_key)->first();
        if ( is_null($voterObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_VOTER_DOESNT_EXIST'));
            return;
        } /*else {
            $voterObj2 = Voters::withFilters()->select('voters.id')->where('voters.key', $captain_key)->first();
            if ( is_null($voterObj2) ) {
                $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_VOTER_IS_NOT_PERMITTED'));
                return;
            }
        }*/

        $captainId = $voterObj->id;
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $electionRoleCaptain = ElectionRoles::select('id')
            ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
            ->first();

        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'user_lock_id', 'assigned_city_id'])
            ->where(['voter_id' => $captainId, 'election_role_id' => $electionRoleCaptain->id, 'election_campaign_id' => $last_campaign_id])
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif ( !is_null($electionRoleByVoter->user_lock_id) ) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }

        $householdVoters = Voters::withFilters()->select(DB::raw('distinct voters.household_id'))
            ->whereIn('voters.household_id', $households)
            ->get();
        if ( count($householdVoters) != count($households) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_HOUSEhOLDS_ARE_NOT_PERMITTED'));
            return;
        }

        $countVotersQuery = self::getCountVotersInHouseholdQuery();
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true, 'captain_clusters');

        $fields = [
            'voters.id',
            'voters.personal_identity',
            'voters.last_name',
            'voters.household_id',
            'voters.mi_city_id',
            'voters.mi_street',
            'clusters.city_id',

            'captain_clusters.id as cluster_id',
            DB::raw($fullClusterNameQuery),
            'captain_cities.name as city_name',

            'captain_ballot_boxes.id as ballot_box_id',
            'captain_ballot_boxes.mi_id',

            'captain_voters.id as captain_id',
            'captain_voters.key as captain_key',
            'captain_voters.first_name as captain_first_name',
            'captain_voters.last_name as captain_last_name',

            'voters_with_captains_of_fifty.id as voters_with_captains_of_fifty_id',
            DB::raw($countVotersQuery)
        ];


        $updatedVotersCaptain = [];
        $insertedVotersCaptain = [];

        $assigned_city_id = $electionRoleByVoter->assigned_city_id;
        // check if city in global
        $isCityInGlobalHeadquarterArea = City::checkIfCityInGlobalHeadquarterArea($assigned_city_id);
        $with_no_households = $request->input('with_no_households', null) === 1; 

        $newHouseholds = Voters::select($fields)
            ->withCaptain50($last_campaign_id)
            ->withCaptainVoterDetails()
            ->withBallots();

            if(!$with_no_households) {  //* Get all voter households
                $newHouseholds->with(['householdMembers' => function($query) use ($last_campaign_id, $assigned_city_id, $isCityInGlobalHeadquarterArea) {
                    $query->select(
                        'voters.id as id','household_id','personal_identity','first_name','last_name',
                        'voters_with_captains_of_fifty.id as voters_with_captains_of_fifty_id',
                        'voters_with_captains_of_fifty.captain_id as captain_id')
                    ->WithCaptain50($last_campaign_id, true);
                    if(!$isCityInGlobalHeadquarterArea){
                        $query = $query->where('captain_cities.id', $assigned_city_id);
                    }
                }])->whereIn('voters.household_id', $households)
                ->groupBy('voters.household_id');
            } else { //* Bind only voters - no all household
                $newHouseholds->whereIn('voters.key', $request->input('voters_keys'))
                ->groupBy('voters.id');
            }

            if(!$isCityInGlobalHeadquarterArea){
                $newHouseholds->where('clusters.city_id', $assigned_city_id);
            }
            $newHouseholds = $newHouseholds->get();
            if(count($newHouseholds) == 0 ){
                $jsonOutput->setErrorCode(config('errors.elections.NOT_FOUND_HOUSEHOLDS_IN_CITY'));
                return;
            }
        $historyArgsArr = [
            'topicName' => 'elections.activists.captain_of_fifty.edit',
            'models' => []
        ];

        $newHouseholdsArr = $newHouseholds->toArray();
        
        if(!$with_no_households) { 
            for ( $householdIndex = 0; $householdIndex < count($newHouseholdsArr); $householdIndex++ ) {
                if ( is_null($newHouseholdsArr[$householdIndex]['captain_id']) ) {
                    for ( $memberIndex = 0; $memberIndex < count($newHouseholdsArr[$householdIndex]['household_members']); $memberIndex++) {
                        $insertedVotersCaptain[] = $newHouseholdsArr[$householdIndex]['household_members'][$memberIndex]['id'];
                    }
                } else if ( $newHouseholdsArr[$householdIndex]['captain_id'] != $captainId) {
                    for ( $memberIndex = 0; $memberIndex < count($newHouseholdsArr[$householdIndex]['household_members']); $memberIndex++) {
                        $updatedVotersCaptain[] = [
                            'voter_id' => $newHouseholdsArr[$householdIndex]['household_members'][$memberIndex]['id'],
                            'old_captain_id' => $newHouseholdsArr[$householdIndex]['household_members'][$memberIndex]['captain_id'],
                            'voters_with_captains_of_fifty_id' => $newHouseholdsArr[$householdIndex]['household_members'][$memberIndex]['voters_with_captains_of_fifty_id'],
                        ];
                    }
                }
            }
        } else { //* For Bind only voters
            for ( $householdIndex = 0; $householdIndex < count($newHouseholdsArr); $householdIndex++ ) {
                if ( is_null($newHouseholdsArr[$householdIndex]['captain_id']) ) {
                    $insertedVotersCaptain[] = $newHouseholdsArr[$householdIndex]['id'];
                } else {
                    $updatedVotersCaptain[] = [
                        'voter_id' => $newHouseholdsArr[$householdIndex]['id'],
                        'old_captain_id' => $newHouseholdsArr[$householdIndex]['captain_id'],
                        'voters_with_captains_of_fifty_id' => $newHouseholdsArr[$householdIndex]['voters_with_captains_of_fifty_id'],
                    ];
                }
            }
            
        }

        // dd($captainId,$newHouseholdsArr,$updatedVotersCaptain, $insertedVotersCaptain);
        for ( $voterIndex = 0; $voterIndex < count($updatedVotersCaptain); $voterIndex++ ) {
            if ($updatedVotersCaptain[$voterIndex]['voters_with_captains_of_fifty_id'] != null) {
                VoterCaptainFifty::where('id', $updatedVotersCaptain[$voterIndex]['voters_with_captains_of_fifty_id'])
                    ->where(['deleted' => 0, 'election_campaign_id' => $last_campaign_id])
                    ->update(['captain_id' => $captainId]);

                $actionHistoryFields = [];
                $actionHistoryFields[] = [
                    'field_name' => 'captain_id',
                    'display_field_name' => config('history.VoterCaptainFifty.captain_id'),
                    'old_numeric_value' => $updatedVotersCaptain[$voterIndex]['old_captain_id'],
                    'new_numeric_value' => $captainId
                ];

                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterCaptainFifty',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $updatedVotersCaptain[$voterIndex]['voters_with_captains_of_fifty_id'],
                    'valuesList' => $actionHistoryFields
                ];
            }
        }

        for ( $voterIndex = 0; $voterIndex < count($insertedVotersCaptain); $voterIndex++ ) {
            $newVoterCaptainFifty = new VoterCaptainFifty;
            $newVoterCaptainFifty->key = Helper::getNewTableKey('voters_with_captains_of_fifty', 10);
            $newVoterCaptainFifty->election_campaign_id = $last_campaign_id;
            $newVoterCaptainFifty->voter_id = $insertedVotersCaptain[$voterIndex];
            $newVoterCaptainFifty->captain_id = $captainId;
            $newVoterCaptainFifty->save();

            $actionHistoryFieldsNames = [
                'election_campaign_id' => config('history.VoterCaptainFifty.election_campaign_id'),
                'voter_id' => config('history.VoterCaptainFifty.voter_id'),
                'captain_id' => config('history.VoterCaptainFifty.captain_id')
            ];

            $fieldsArray = [];
            foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
                $fieldsArray[] = [
                    'field_name' => $fieldName, // Fileld name
                    'display_field_name' => $display_field_name, // display field name
                    'new_numeric_value' => $newVoterCaptainFifty->{$fieldName} // new value of field
                ];
            }

            $historyArgsArr['models'][] = [
                'referenced_model' => 'VoterCaptainFifty',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newVoterCaptainFifty->id,
                'valuesList' => $fieldsArray
            ];
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }

        for ( $householdIndex = 0; $householdIndex < count($newHouseholds); $householdIndex++ ) {
            $newHouseholds[$householdIndex]->captain_id = $voterObj->id;
            $newHouseholds[$householdIndex]->captain_key = $voterObj->key;
            $newHouseholds[$householdIndex]->captain_first_name = $voterObj->first_name;
            $newHouseholds[$householdIndex]->captain_last_name = $voterObj->last_name;
            if($with_no_households){ //* For Bind only voters
                $newHouseholds[$householdIndex]->household_members =  [$voterObj];
            }
        }
        return $newHouseholds;
    }
    /*
		Function that adds all ballot households to captain fifty
        ! Maybe need to merge this function with addHouseholdsToCaptain50
	*/
    public static function addAllBallotBoxHouseholdsToCaptain50($jsonOutput, $captain_key, $ballot_key = null) {

        if ( is_null($captain_key) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_CAPTAIN'));
            return;
        }

        $ballotBox = BallotBox::select('id')
        ->where('ballot_boxes.key', $ballot_key)
        ->first();
        if ( is_null($ballotBox) ) {
            $jsonOutput->setErrorCode(config('errors.elections.BALLOT_BOX_DOES_NOT_EXIST'));
            return;
        }
        

        $voterFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name'
        ];
        $voterObj = Voters::select($voterFields)->where('voters.key', $captain_key)->first();
        if ( is_null($voterObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_VOTER_DOESNT_EXIST'));
            return;
        } /*else {
            $voterObj2 = Voters::withFilters()->select('voters.id')->where('voters.key', $captain_key)->first();
            if ( is_null($voterObj2) ) {
                $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_VOTER_IS_NOT_PERMITTED'));
                return;
            }
        }*/

        $captainId = $voterObj->id;
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $electionRoleCaptain = ElectionRoles::select('id')
            ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
            ->first();

        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'user_lock_id', 'assigned_city_id'])
            ->where(['voter_id' => $captainId, 'election_role_id' => $electionRoleCaptain->id, 'election_campaign_id' => $last_campaign_id])
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif ( !is_null($electionRoleByVoter->user_lock_id) ) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }
        $countVotersQuery = self::getCountVotersInHouseholdQuery();
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true, 'captain_clusters');

        $fields = [
            'voters.id as voter_id',
            'voters.last_name',
            'voters.household_id',
            'voters.mi_city_id',
            'voters.mi_street',
            'clusters.city_id',

            'captain_clusters.id as cluster_id',
            DB::raw($fullClusterNameQuery),
            'captain_cities.name as city_name',

            'captain_ballot_boxes.id as ballot_box_id',
            'captain_ballot_boxes.mi_id',

            'captain_voters.id as captain_id',
            'captain_voters.key as captain_key',
            'captain_voters.first_name as captain_first_name',
            'captain_voters.last_name as captain_last_name',

            'voters_with_captains_of_fifty.id as voters_with_captains_of_fifty_id',
            DB::raw($countVotersQuery)
        ];


        $updatedVotersCaptain = [];
        $insertedVotersCaptain = [];

        $ballot_id = $ballotBox->id;

        $newHouseholds = Voters::select($fields)
            ->withCaptain50($last_campaign_id)
            ->withCaptainVoterDetails()
            ->withBallots()
            // ->withFilters()
            ->where('clusters.city_id', $electionRoleByVoter->assigned_city_id)
            ->where('voters_in_election_campaigns.ballot_box_id', $ballot_id);
        

        $newHouseholds = $newHouseholds->get();
        // echo (json_encode( $newHouseholds));
        // die;
        if(count($newHouseholds) == 0 ){
            $jsonOutput->setErrorCode(config('errors.elections.NOT_FOUND_HOUSEHOLDS_IN_CITY'));
            return;
        }

 
        $newHouseholdsArr = $newHouseholds->toArray();

        for ( $householdIndex = 0; $householdIndex < count($newHouseholdsArr); $householdIndex++ ) {
            if ( is_null($newHouseholdsArr[$householdIndex]['captain_id']) ) {
                $insertedVotersCaptain[] = $newHouseholdsArr[$householdIndex]['voter_id'];
            } else if ( $newHouseholdsArr[$householdIndex]['captain_id'] != $captainId) {
                $updatedVotersCaptain[] = [
                    'voter_id' => $newHouseholdsArr[$householdIndex]['voter_id'],
                    'old_captain_id' => $newHouseholdsArr[$householdIndex]['captain_id'],
                    'voters_with_captains_of_fifty_id' => $newHouseholdsArr[$householdIndex]['voters_with_captains_of_fifty_id'],
                ];
            }
        }   
        
        $historyArgsArr = [
            'topicName' => 'elections.activists.captain_of_fifty.edit',
            'models' => []
        ];

        // dd($captainId,$newHouseholdsArr,$updatedVotersCaptain, $insertedVotersCaptain);
        for ( $voterIndex = 0; $voterIndex < count($updatedVotersCaptain); $voterIndex++ ) {
            VoterCaptainFifty::where('id', $updatedVotersCaptain[$voterIndex]['voters_with_captains_of_fifty_id'])
                ->where(['deleted' => 0, 'election_campaign_id' => $last_campaign_id])
                ->update(['captain_id' => $captainId]);

            $actionHistoryFields = [];
            $actionHistoryFields[] = [
                'field_name' => 'captain_id',
                'display_field_name' => config('history.VoterCaptainFifty.captain_id'),
                'old_numeric_value' => $updatedVotersCaptain[$voterIndex]['old_captain_id'],
                'new_numeric_value' => $captainId
            ];

            $historyArgsArr['models'][] = [
                'referenced_model' => 'VoterCaptainFifty',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $updatedVotersCaptain[$voterIndex]['voters_with_captains_of_fifty_id'],
                'valuesList' => $actionHistoryFields
            ];
        }

        for ( $voterIndex = 0; $voterIndex < count($insertedVotersCaptain); $voterIndex++ ) {
            $newVoterCaptainFifty = new VoterCaptainFifty;
            $newVoterCaptainFifty->key = Helper::getNewTableKey('voters_with_captains_of_fifty', 10);
            $newVoterCaptainFifty->election_campaign_id = $last_campaign_id;
            $newVoterCaptainFifty->voter_id = $insertedVotersCaptain[$voterIndex];
            $newVoterCaptainFifty->captain_id = $captainId;
            $newVoterCaptainFifty->save();

            $actionHistoryFieldsNames = [
                'election_campaign_id' => config('history.VoterCaptainFifty.election_campaign_id'),
                'voter_id' => config('history.VoterCaptainFifty.voter_id'),
                'captain_id' => config('history.VoterCaptainFifty.captain_id')
            ];

            $fieldsArray = [];
            foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
                $fieldsArray[] = [
                    'field_name' => $fieldName, // Fileld name
                    'display_field_name' => $display_field_name, // display field name
                    'new_numeric_value' => $newVoterCaptainFifty->{$fieldName} // new value of field
                ];
            }

            $historyArgsArr['models'][] = [
                'referenced_model' => 'VoterCaptainFifty',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newVoterCaptainFifty->id,
                'valuesList' => $fieldsArray
            ];
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
        
        $householdHash = [];
        for ( $householdIndex = 0; $householdIndex < count($newHouseholds); $householdIndex++ ) {
            $currentVoter = $newHouseholds[$householdIndex]->toArray();
            $household_id = $currentVoter['household_id'];
            if(empty($householdHash[ $household_id])){
                $currentVoter['captain_id']= $voterObj->id;
                $currentVoter['captain_key'] = $voterObj->key;
                $currentVoter['captain_first_name'] = $voterObj->first_name;
                $currentVoter['captain_last_name'] = $voterObj->last_name;
                $currentVoter['household_members'] = [];
                $householdHash[ $household_id] = $currentVoter;
            }
            // dump($householdHash[ $household_id]);
            $householdHash[ $household_id]['household_members'][] = $currentVoter;

        }
        $newHouseholds = [];

        foreach($householdHash as $item){
            $newHouseholds [] = $item;
        }
        // echo (json_encode( $householdHash));
        // die;
        return $newHouseholds;
        $jsonOutput->setData($newHouseholds);
    }
	/*
		Function that deletes households from  captain fifty
	*/
    public static function deleteHouseholdsOfCaptain50($jsonOutput, Request $request, $captain_key) {

        if ( is_null($captain_key) ) {
            $jsonOutput->setErrorCode(config('errors.elections.INVALID_CAPTAIN'));
            return;
        }

        $households = $request->input('households', null);
        if ( is_null($households) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_HOUSEHOLD_KEYS'));
            return;
        }

        for ( $householdIndex = 0; $householdIndex < count($households); $householdIndex++ ) {
            if ( !self::validateHousehold($households[$householdIndex]) ) {
                $jsonOutput->setErrorCode(config('errors.elections.HOUSEHOLD_DOESNT_EXIST'));
                return;
            }
        }

        $voterFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name'
        ];
        $voterObj = Voters::select($voterFields)->where('voters.key', $captain_key)->first();
        if ( is_null($voterObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_VOTER_DOESNT_EXIST'));
            return;
        } 
        $captainId = $voterObj->id;
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $electionRoleCaptain = ElectionRoles::select('id')
            ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
            ->first();

        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'user_lock_id'])
            ->where(['voter_id' => $captainId, 'election_role_id' => $electionRoleCaptain->id, 'election_campaign_id' => $last_campaign_id])
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif ( !is_null($electionRoleByVoter->user_lock_id) ) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }

        $householdVoters = Voters::withFilters()->select(DB::raw('distinct voters.household_id'))
            ->whereIn('voters.household_id', $households)
            ->get();
        if ( count($householdVoters) != count($households) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_HOUSEhOLDS_ARE_NOT_PERMITTED'));
            return;
        }

        $votersToUnAllocate = Voters::select(['voters.id', 'voters_with_captains_of_fifty.id as voters_with_captains_of_fifty_id'])
            ->withCaptain50Only($last_campaign_id)
            ->whereIn('voters.household_id', $households)
            ->where(['voters_with_captains_of_fifty.captain_id' => $captainId,
                     'voters_with_captains_of_fifty.deleted' => 0
                     ])
            ->get();

        $historyArgsArr = [
            'topicName' => 'elections.activists.captain_of_fifty.edit',
            'models' => []
        ];

        for ( $voterIndex = 0; $voterIndex < count($votersToUnAllocate); $voterIndex++ ) {
            VoterCaptainFifty::where('id', $votersToUnAllocate[$voterIndex]->voters_with_captains_of_fifty_id)
                ->update(['deleted' => 1]);

            $historyArgsArr['models'][] = [
                'referenced_model' => 'VoterCaptainFifty',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $votersToUnAllocate[$voterIndex]->voters_with_captains_of_fifty_id
            ];
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
        return true;
    }
    /*
        Function that updates support statuses -for multi households - by POST params
    */
    public static function updateSupportStatus($jsonOutput, Request $request) {
        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;

        $query = ElectionCampaigns::select('voters.household_id')
                ->withVoterElectionCampaign($currentCampaignId)
                ->withVoter()
                ->withCity();

        $isGeoFilterExists = self::addGeographicalFilter($request, $query);
        $isSupportStatusExists = self::addSupportStatusFilter($request, $query, $currentCampaignId);

        if (!$isGeoFilterExists || !$isSupportStatusExists || !$request->has('support_key')) {
            $jsonOutput->setErrorCode(config('errors.crm.MISSED_FILTERS'));
            return;
        }

        $householderIds = $query->groupBy('voters.household_id')->pluck('household_id')->all();
        $voterIds = self::getVotersByHousehold($householderIds);
        $supportId = self::getSupportStatusId($request->input('support_key'));

        foreach ($voterIds as $voterId) {
            $result = VoterSupportStatus::where([['election_campaign_id', $currentCampaignId]
                        , ['entity_type', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))]
                        , ['voter_id', $voterId]])
                    ->update([
                        'support_status_id' => $supportId,
                        'update_user_id'    => Auth::user()->id
                    ]);

            if ($result) {//support status updated
            } else {
                $key = Helper::getNewTableKey('voter_support_status', 10);
                $createUserId = Auth::user()->id;
                $row = new VoterSupportStatus;
                $row->key = $key;
                $row->create_user_id = $createUserId;
                $row->update_user_id = $createUserId;
                $row->election_campaign_id = $currentCampaignId;
                $row->entity_type = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'));
                $row->voter_id = $voterId;
                $row->support_status_id = $supportId;
                $row->save();
            }
        }

        $jsonOutput->setData($voterIds);
    }
    /***************************************** Helper functions ***************************************** */
	/*
		Private helpful function that gets househol_id  , and returns all
		the voters in that household
	*/
    private static function getVotersByHousehold($householdNumber) {
        return Voters::select('id')
                        ->whereIn('household_id', $householdNumber)
                        ->pluck('id')->all();
    }

	/*
		Private helpful function that returns support-status id by supportStatusKey
	*/
    private static function getSupportStatusId($supportStatusKey) {
        return SupportStatus::select('id')->where('key', $supportStatusKey)->pluck('id')->first();
    }

	/*
		Private helpful function that adds to query(param) geographic filter query
	*/
    private static function addGeographicalFilter($request, &$query) {
        if ($request->has('ballot_box_id')) {
            $query->where('voters_in_election_campaigns.ballot_box_id', $request->input('ballot_box_id'));
            return TRUE;
        }

        if ($request->has('cluster_key')) {
            $query->withCluster()->where('clusters.key', $request->input('cluster_key'));
            return TRUE;
        }

        if ($request->has('neighborhood_key')) {
            $query->withNeighborhood()->where('neighborhoods.key', $request->input('neighborhood_key'));
            return TRUE;
        }

        if ($request->has('city_key')) {
            $query->where('cities.key', $request->input('city_key'));
            return TRUE;
        }

        if ($request->has('subarea_key')) {
            $query->withSubArea()->where('areas.key', $request->input('subarea_key'));
            return TRUE;
        }

        if ($request->has('area_key')) {
            $query->withArea()->where('areas.key', $request->input('area_key'));
            return TRUE;
        }
        return FALSE;
    }

	/*
		Private helpful function that adds to query(param) support status filtering
	*/
    private static function addSupportStatusFilter($request, &$query, $currentCampaignId) {
        $isSupportStatusExists = ($request->has('support_status_key') && $request->has('support_status_count')) ? TRUE : FALSE;

        if ($isSupportStatusExists) {
            $query->withVoterSupportStatus($currentCampaignId)->withSupportStatus()
                    ->where(function($query) use($request) {
                        $query->whereIn('support_status.key', $request->input('voters_current_support_status_key'))
                        ->orWhereNull('voter_support_status.id');
                    });

            $supportStatusCompare = $request->input('support_status_compare');
            $compateSymbol = (($supportStatusCompare == 'less_than' ? '<' : ($supportStatusCompare == 'big_than' ? '>' : '=')));
            $query->having(DB::raw('count(voters.id)'), $compateSymbol, $request->input('support_status_count'));
        }
        return $isSupportStatusExists;
    }

	/*
		Private helpful function that gets results array , and returns
		new formatted array with column of address instead of city,street,house,etc...
	*/
    private static function handleSearchResults($results) {
        foreach ($results as $row) {
            $row['address'] = $row['city'] . ", " . $row['house'] . " " . $row['street']
                    . ($row['house_entry'] ? " " . $row['house_entry'] : '')
                    . ($row['flat'] ? " " . $row['flat'] : '');
            unset($row['city']);
            unset($row['street']);
            unset($row['house']);
            unset($row['house_entry']);
            unset($row['flat']);
        }
        return $results;
    }

	/*
		Private helpful function that returns string of query
		that returns count of  voters inside household
	*/
    private static function getCountVotersInHouseholdQuery() {
        $countVotersQuery = "(select count(voters2.id) from voters as voters2 ";
        $countVotersQuery .= "where voters2.household_id=voters.household_id ";
        $countVotersQuery .= "group by voters2.household_id) as household_members_count";

        return $countVotersQuery;
    }
	/*
		Private helpful function that validates household by householdId
	*/
    private static function validateHousehold($householdId) {
        $rules = [
            'household_id' => 'integer'
        ];

        $validator = Validator::make(['household_id' => $householdId], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

}
