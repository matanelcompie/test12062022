<?php

namespace App\Http\Controllers;

use Auth;
use Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\Voters;
use App\Models\VoterPhone;
use App\Models\City;
use App\Models\Cluster;
use App\Models\Neighborhood;
use App\Models\BallotBox;
use App\Models\Teams;
use App\Models\UserPhones;
use App\Models\GeographicFilters;
use App\Models\VoterSupportStatus;
use App\Http\Controllers\ActionController;
use App\Models\ElectionCampaigns;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
 
use App\Models\MunicipalElectionParties;
use App\Models\MunicipalElectionCities;
use App\Models\MunicipalElectionMayorCandidates;
use App\Models\MunicipalElectionCouncilCandidates;
use App\Models\CityRolesByVoters;
use App\Models\CityDepartments;
use App\Models\CityCouncilMembers;
use App\Models\ReligiousCouncilRoles;
use App\Models\ReligiousCouncilMembers;
use App\Models\CityShasRoles;
use App\Models\CityShasRolesByVoters;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesBaseBudget;
use App\Models\CityBudget;
use App\Models\CityBudgetOngoingActivityExpenses;
use App\Models\CityBudgetActivistExpectedExpenses;
use App\Models\RequestTopic;

use App\Libraries\Services\GeoFilterService;
use App\Libraries\HelpFunctions;

/*
controller that handles only elections cities screen
*/ 
class ElectionsCitiesController extends Controller {

     private $cityFieldsList = ['cities.id as city_id' , 
		                    'cities.name as city_name' , 
							'cities.mi_id as city_mi_id',
                            'areas.name as area_name',

                            // City team
                            'teams.id as team_id' ,
							'teams.key as team_key',
                            'teams.name as team_name',
							'voters.first_name',
							'voters.last_name',
                            'voters.last_name',
                            'voters.key as voter_key',
                            'user_phones.phone_number',
                            
							'cities.district' , 
                            'headquarters_phone_number',
                            'assign_leader_phone_number',
                            'assign_leader_email',
		                    ];

    /*
        Get activists roles summary grouped by city and campaign

        @param $cityKey
        @param $campaignKey
    */
    public function getActivistsBudgetRolesSummary($cityKey , $campaignKey){
          $jsonOutput = app()->make("JsonOutput");

            if(!$this->isActionPermitted('elections.cities.budget')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }

           if($cityKey == null || trim($cityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
			return;
		   }

           $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->first();
		   if(!$electionCampaign){
			$jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()
           ->withTeam()->where('cities.key' ,$cityKey)->where('cities.deleted' , 0)->first();
		   if(!$city){	
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			return;
		   }

           $arrayElectionRolesByVoters = array();

           // Get city ballotboxes election roles:
           $cityBallotsElectionRolesGeographical = ElectionRolesGeographical::select('election_role_by_voter_id')
                                          ->WithClusters()
                                          ->where('cities.id' , $city->city_id);
           // Get city clusters election roles:
            
           $cityClustersElectionRolesGeographical = ElectionRolesGeographical::select('election_role_by_voter_id')
                                          ->WithBallotBoxes()
                                          ->where('cities.id' , $city->city_id);
           //( Maye need to get also city and neighborhoods election roles)

           $fullElectionRolesList = $cityBallotsElectionRolesGeographical
           ->union($cityClustersElectionRolesGeographical)
           ->groupBy('election_role_by_voter_id')->get();
           foreach($fullElectionRolesList as $row){
                $arrayElectionRolesByVoters[] = $row->election_role_by_voter_id;
           }
           $fields = [
                'name as role_name' ,
                DB::raw('count(voter_id) as voters_count') ,
                DB::raw('sum(sum) as total_sum')
           ];
           $electionRolesByVoters = ElectionRolesByVoters::select( $fields)
           ->withElectionRole()->whereIn('election_roles_by_voters.id',$arrayElectionRolesByVoters)
           ->where('election_campaign_id' , $electionCampaign->id)
           ->where('election_roles.deleted' , 0)
           ->groupBy('name')->get();
           $jsonOutput->setData($electionRolesByVoters);
    }
	
	/*
		Function that gets as parameter a voter_id , and returns he has roles in council as shas member or other shas role
	*/
	public static function IsShasRepresentative($voter_id){
		$shasRoleRecord = CityCouncilMembers::where('deleted' , 0)->where('voter_id',$voter_id)->where('shas',1)->first();
		if($shasRoleRecord){return true;}
	 
		$shasRoleRecord = CityRolesByVoters::where('deleted' , 0)->where('voter_id',$voter_id)->where('shas',1)->first();
	    if($shasRoleRecord){return true;}
		
		$shasRoleRecord = CityShasRolesByVoters::where('deleted' , 0)->where('voter_id',$voter_id)->first();
	    if($shasRoleRecord){return true;}
	 
		return false;
	}

    /*
	Save activist budget expenses by row key of 'city_budget_activist_expected_expenses'

    @param $cityKey 
    @param $rowKey
    @request - contains activist_count and activist_salary
    @return json 
	*/
    public function updateCityBudgetActivistExpectedExpenses(Request $request , $cityKey , $campaignKey , $rowKey){
           $jsonOutput = app()->make("JsonOutput");
           if(!$this->isActionPermitted('elections.cities.budget.expected_activists.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
           if($cityKey == null || trim($cityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
			return;
		   }

           $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->first();
		   if(!$electionCampaign){
			$jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){	
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			return;
		   }

           $changedValues = [];

		if($rowKey == "-1"){
			 $cityBudget = new CityBudget;
			 $cityBudget->key = Helper::getNewTableKey('city_budget', 5) ;
			 $cityBudget->election_campaign_id = $electionCampaign->id;
			 $cityBudget->city_id = $city->city_id;
			 $cityBudget->budget_type = config("constants.CITY_BUDGET_TYPE_ACTIVIST");
			 $cityBudget->name = $request->input("name");
			 $cityBudget->system_name = $request->input("system_name");
			 $cityBudget->amount = 0;
			 $cityBudget->save();
			 
			 $activistExpectedExpenses = new CityBudgetActivistExpectedExpenses;
			 $activistExpectedExpenses->key = Helper::getNewTableKey('city_budget_activist_expected_expenses', 5) ;
			 $activistExpectedExpenses->city_budget_id = $cityBudget->id;
			 $activistExpectedExpenses->activist_count = 0;
			 $activistExpectedExpenses->activist_salary = 0;
			 $activistExpectedExpenses->save();
			 
		}
		else{
           $activistExpectedExpenses = CityBudgetActivistExpectedExpenses::where('deleted' , 0)
               ->where('key' , $rowKey)
               ->first();
		}
           if($activistExpectedExpenses){
               $cityBudget = CityBudget::where('deleted' , 0)
                   ->where('id' , $activistExpectedExpenses->city_budget_id)
                   ->where('budget_type' , config("constants.CITY_BUDGET_TYPE_ACTIVIST"))
                   ->where('city_id' , $city->city_id)
                   ->where('election_campaign_id' , $electionCampaign->id)
                   ->first();
               if($cityBudget){ // if all data is ok - do save action : 
                    $updatesCount = 0; 
                    $fieldsArray = []; 
                    if($request->input('activist_count') != NULL &&
                       is_numeric($request->input('activist_count')) &&
                       $request->input('activist_count') != $activistExpectedExpenses->activist_count ) { //different value - save
                        $changedValues[] = [
                            'field_name' => 'activist_count',
                            'display_field_name' => config('history.CityBudgetActivistExpectedExpenses.activist_count'),
                            'old_numeric_value' => $activistExpectedExpenses->activist_count,
                            'new_numeric_value' => $request->input('activist_count')
                        ];

                        $activistExpectedExpenses->activist_count = $request->input('activist_count');
                        $updatesCount++;
                        
                    }
                    if($request->input('activist_salary') != NULL &&
                        is_numeric($request->input('activist_salary')) &&
                        $request->input('activist_salary') != $activistExpectedExpenses->activist_salary ) { //different value - save
                        $changedValues[] = [
                            'field_name' => 'activist_salary',
                            'display_field_name' => config('history.CityBudgetActivistExpectedExpenses.activist_salary'),
                            'old_numeric_value' => $activistExpectedExpenses->activist_salary,
                            'new_numeric_value' => $request->input('activist_salary')
                        ];

                        $activistExpectedExpenses->activist_salary = $request->input('activist_salary');
                        $updatesCount++;
                    }
                    if($updatesCount > 0){
                        $activistExpectedExpenses->save();

                        $historyArgsArr = [
                            'topicName' => 'elections.cities.budget.expected_activists.edit',
                            'models' => [
                                [
                                    'referenced_model' => 'CityBudgetActivistExpectedExpenses',
                                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                    'referenced_id' => $activistExpectedExpenses->id,
                                    'valuesList' => $changedValues
                                ]
                            ]
                        ];

                        ActionController::AddHistoryItem($historyArgsArr);

                        $topic = ActionHistoryTopic::select('id')
                            ->where('operation_name', 'elections.cities.budget.expected_activists.edit')
                            ->first();
                        if ($topic) {
                        $savedActionHistory = ActionHistory::select(
                            'users.voter_id', 'voters.id',
                            'first_name', 'last_name' ,
                            'users.id', 'display_field_name',
                            'action_history.created_at',
                            'old_numeric_value as old_value',
                             'new_numeric_value as new_value')
                            ->withHistoryDetails()->withHistoryUser()
                            ->where('referenced_model' , 'CityBudgetActivistExpectedExpenses')
                            ->where('referenced_id' , $activistExpectedExpenses->id)
                            ->get();

                            $jsonOutput->setData($savedActionHistory);
                        }
                        else{
                               $jsonOutput->setData(null);

                        }
                    }
                    else{
                        $jsonOutput->setData(null);
                    }
               }
               else{
                     $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_EXPECTED_EXPENSES_ROW_DOESNT_EXIST'));
			         return;
               }
           }
           else{
                  $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_EXPECTED_EXPENSES_ROW_DOESNT_EXIST'));
			     return;

            }

           
    }

    /*
	Get budget of city by campaign key

    @param $cityKey 
    @param $campaignKey
	*/	
    public function getCityBudgetByElectionCampaign($cityKey , $campaignKey){
        $jsonOutput = app()->make("JsonOutput");
        if(!$this->isActionPermitted('elections.cities.budget')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
        if($cityKey == null || trim($cityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
			return;
		}
        
        if($campaignKey == null || trim($campaignKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		    return;
		}
		$electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->first();
		if(!$electionCampaign){
			$jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			return;
		}

        $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		if(!$city){	
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		}
		 		 
        $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		if(!$isAllowed ){
			$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			return;
        }
        
        $cityBudgetList = CityBudget::select(
            'city_budget.id' ,
            'city_budget.key' ,
            'city_budget.name' ,
            'city_budget.city_id',
            'city_budget.budget_type',
            'city_budget.amount',
            'city_budget.system_name',
            'election_roles.id as election_roles_id' ,
            'election_roles.budget as election_roles_budget',
            'election_roles.name as election_roles_name',
            'election_budget.id as election_budget_id',
            'election_budget.budget as election_budget'
            )
            ->withElectionRoles()
            ->withElectionRolesBaseBudget()
            ->with('ongoingActivityExpenses')
            ->with(['budgetExpectedExpenses'=>function($query){
            $query->with(['ActionHistory'=>function($innerQuery) {
                $innerQuery->select(
                'users.voter_id','voters.id',
                'first_name' , 'last_name' ,
                'users.id','display_field_name',
                'old_numeric_value as old_value' ,
                 'new_numeric_value as new_value',
                'action_history.id',
                'history.user_create_id',
                'action_history.referenced_id',
                'action_history_details.created_at',
                'action_history_details.id',
                'action_history_details.action_history_id',
                'action_history.action_history_topic_id'
                )
                ->withHistoryDetails()->withHistoryUser()
                ->where('action_history.referenced_model','=' , 'CityBudgetActivistExpectedExpenses')->get();
                }])->get();
        }])
        ->where('city_budget.deleted' , 0)->whereIn('city_budget.budget_type' , [0,1])
        ->where('city_budget.city_id' , $city->city_id)
        ->where('city_budget.election_campaign_id',$electionCampaign->id)
        ->groupBy('election_roles.id')
        ->get();
 
        foreach($cityBudgetList as $cityBudget){
            if($cityBudget->budget_type == config("constants.CITY_BUDGET_TYPE_ACTIVIST") && $cityBudget->system_name){
                $defaultBudget=0;
                    if($cityBudget->election_budget){$defaultBudget = $cityBudget->election_budget;}
                    else if($cityBudget->election_roles_budget){$defaultBudget = $cityBudget->election_roles_budget;}
                    $cityBudget->budgetExpectedExpenses->recomended_salary = $defaultBudget; ;
            }
        }
		//var_dump ($cityBudgetList);
		$electionRoles = ElectionRoles::select('id' , 'name' , 'system_name')->where('deleted',0)->whereRaw('not system_name in(select system_name from city_budget where budget_type=1 and deleted=0 and election_campaign_id='.$electionCampaign->id.' and city_id='.$city->city_id.')')->get();
        for($i = 0 ; $i < sizeof($electionRoles) ; $i++){
			$tempBudgetRole = new \stdClass;
			$tempBudgetRole->id = -1;
			$tempBudgetRole->budget_type = config("constants.CITY_BUDGET_TYPE_ACTIVIST");
			$tempBudgetRole->system_name = $electionRoles[$i]->system_name;
			$tempBudgetRole->election_roles_name = $electionRoles[$i]->name;
			$tempBudgetRole->name = $electionRoles[$i]->name;
			$tempBudgetRole->recomended_salary = 0;
			$tempBudgetRole->activist_salary = 0;
			$tempBudgetRole->amount = 0;
			$tempBudgetRole->activist_count = 0;
			$tempBudgetRole->budget_expected_expenses = ["activist_count"=>0 , "amount"=>0 , "activist_salary"=>0 , "recomended_salary"=>0];
			 $cityBudgetList[] =  $tempBudgetRole ;
		}
		$jsonOutput->setData($cityBudgetList);
    }
	
    /*
	Get data of municipal and global election campaigns :

    @param $cityKey 
	*/	
	public function getHistoricalElectionCampaignsData($cityKey){
           $jsonOutput = app()->make("JsonOutput");
           if(!$this->isActionPermitted('elections.cities.vote_results')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
            if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				
  				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
  				return;
		    }
		 		 
        $isAllowed = $this->isAllowedCityForUser($city);
		  
		    if(!$isAllowed ){
  				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
  				return;
		    }

        $currentCampaignID = NULL;
        $currentCampaign = ElectionCampaigns::currentCampaign();
        if($currentCampaign){
          $currentCampaignID = $currentCampaign->id;
        }
        $historicalElectionCampaigns = ElectionCampaigns::select('id','key','name' , 'type')
                                        ->whereIn('type' , [0,1])
                                        ->get();
        for($i=0 ; $i < count($historicalElectionCampaigns);$i++){
          $historicalElectionCampaigns[$i]->allVotedSupportStatuses = VoterSupportStatus::selectRaw(
                    "(CASE 
                        WHEN support_status.level > 0 THEN 1
                        WHEN support_status.level = 0 THEN 0
                        WHEN support_status.level < 0 THEN -1
                      END) AS group_level,
                      COUNT(support_status.level) AS cnt")
                      ->withSupportStatus()
                      ->where('voter_support_status.election_campaign_id' , $historicalElectionCampaigns[$i]->id)
                      ->where('entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                      ->where('voter_support_status.deleted', 0)
                      ->groupBy('group_level')
                      ->orderBy('group_level', 'DESC')
                      ->get(); 
          $historicalElectionCampaigns[$i]->all_voted_support_statuses_count = 0;
          $historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_supporting_count = 0;
          $historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_potential_count = 0;
          $historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_not_supporting_count = 0;
          for($k = 0 ; $k < count($historicalElectionCampaigns[$i]->allVotedSupportStatuses) ; $k++){
            $item = $historicalElectionCampaigns[$i]->allVotedSupportStatuses[$k];
            $historicalElectionCampaigns[$i]->all_voted_support_statuses_count += $item->cnt;
            switch($item->group_level){
              case 1:
    						$historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_supporting_count += $item->cnt;
    						break;
              case 0:
    						$historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_potential_count += $item->cnt;
    						break;
              case -1:
    						$historicalElectionCampaigns[$i]->all_voted_support_statuses_of_type_not_supporting_count += $item->cnt;
    						break;	
				    }
          }
          unset($historicalElectionCampaigns[$i]->allVotedSupportStatuses);
          if($historicalElectionCampaigns[$i]->type == '1'){
            $historicalElectionCampaigns[$i]->mandats_count = 0;
            $municipalElectionCity = MunicipalElectionCities::select('seats')->where('city_id',$city->city_id)->where('election_campaign_id' , $historicalElectionCampaigns[$i]->id)->first();
            if($municipalElectionCity){
              $historicalElectionCampaigns[$i]->mandats_count = $municipalElectionCity->seats;
            }
            $historicalElectionCampaigns[$i]->council_members_count = CityCouncilMembers::select('municipal_election_party_id')->withParty()->where('city_council_members.deleted' , 0 )->where('city_council_members.city_id' , $city->city_id)->where('municipal_election_parties.election_campaign_id' , $historicalElectionCampaigns[$i]->id)->where('municipal_election_parties.deleted',0)->count();
            $historicalElectionCampaigns[$i]->has_budget = CityBudget::where('deleted' , 0)->where('budget_type' , config("constants.CITY_BUDGET_TYPE_ACTIVIST"))->where('city_id' , $city->city_id)->where('election_campaign_id' , $historicalElectionCampaigns[$i]->id)->first() ? 1 : 0;  
          }
        }

        $jsonOutput->setData($historicalElectionCampaigns);
	}

    /*
     Function than complements 'getHistoricalElectionCampaignsData' function and returns votes per campaign of the city
    */
    public function getHistoricalCityElectionCampaignsVotes($cityKey){
         $jsonOutput = app()->make("JsonOutput");

            if(!$this->isActionPermitted('elections.cities.vote_results')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
            if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		    }
		 		 
            $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		    if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		    }
 
         $cluster = Cluster::selectRaw('clusters.election_campaign_id , shas ,sum(ballot_boxes.voter_count) as total_voters ,
                    sum(ballot_boxes.votes_count) as total_votes, sum(election_campaign_party_list_votes.votes) as total_party_votes' )
                             ->where('clusters.city_id',$city->city_id)->withBallotBoxesAndListPartyVotes()
                             ->groupBy(['clusters.election_campaign_id' , 'shas'])
                             ->get();

         $jsonOutput->setData($cluster);
    }	
			
							
	/*
	Edit changes in city-role/city-council-member by cityKey and roleKey
	
	@param $request - role_type - 0(religeous) or 1(city shas) required
	@param $cityKey
	@param $recordKey
	*/
	public function editReligeousOrShaseRoleItem(Request $request , $cityKey , $recordKey){
		$jsonOutput = app()->make("JsonOutput");
		
		    if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            if($recordKey == null || trim($recordKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_ROLE_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		    }
		 		 
            $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		    if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		    }
			$rowItemToEdit = null;
			if($request->input('role_type') != '0' && $request->input('role_type') != '1' ){
				$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				return;
			}

            $changedValues = [];
            $historyModelName = '';
            $historyTopicName = '';

			$rowItemToEdit = null;
			if ($request->input('role_type') == '0' ) {
               if(!$this->isActionPermitted('elections.cities.roles.religious_council.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }

               $historyModelName = 'ReligiousCouncilMembers';
               $historyTopicName = 'elections.cities.roles.religious_council.edit';

			   $rowItemToEdit = ReligiousCouncilMembers::where('city_id' , $city->city_id)
                   ->where('key' , $recordKey )
                   ->where('deleted' , 0)
                   ->first();
			}
			elseif ($request->input('role_type') == '1') {
               if(!$this->isActionPermitted('elections.cities.roles.shas.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }

               $historyModelName = 'CityShasRolesByVoters';
               $historyTopicName = 'elections.cities.roles.shas.edit';

			   $rowItemToEdit = CityShasRolesByVoters::where('city_id' , $city->city_id)
                   ->where('key' , $recordKey )
                   ->where('deleted' , 0)
                   ->first();
			}
		 
			if($rowItemToEdit){
                $historyDataArray = array();    
	
				$updatesCount = 0;
				if($request->input('role_type') == '0'){
					if($request->input('shas') == '0' || $request->input('shas') == '1' ){
                        if($request->input('shas') == '1'){$this->changeVoterShasRepresentative(null,$rowItemToEdit->voter_id,$changedValues);}

						if($request->input('shas') != $rowItemToEdit->shas){
							$updatesCount ++;

                            $changedValues[] = [
                                'field_name' => 'shas',
                                'display_field_name' => config('history.' . $historyModelName . '.shas'),
                                'old_numeric_value' => $rowItemToEdit->shas,
                                'new_numeric_value' => $request->input('shas')
                            ];

                            $rowItemToEdit->shas = $request->input('shas');
						}
					}
				}
				elseif ($request->input('role_type') == '1') {
					if($request->input('council_number') != null && trim($request->input('council_number')) != '' && is_numeric($request->input('council_number')) ){
						if($request->input('council_number') != $rowItemToEdit->council_number){
							$updatesCount ++;

                            $changedValues[] = [
                                'field_name' => 'council_number',
                                'display_field_name' => config('history.' . $historyModelName . '.council_number'),
                                'old_numeric_value' => $rowItemToEdit->council_number,
                                'new_numeric_value' => $request->input('council_number')
                            ];

							$rowItemToEdit->council_number = $request->input('council_number');
						}
					}
				}
				
				if($request->input('role_key') != null && trim($request->input('role_key')) != '' ){
					$role = null;
					if($request->input('role_type') == '0'){
						$role = ReligiousCouncilRoles::select('id' , 'name')
                            ->where('deleted',0)
                            ->where('key' , $request->input('role_key'))
                            ->first();
				    }
					elseif ($request->input('role_type') == '1') {
						$role = CityShasRoles::select('id' , 'name')
                            ->where('deleted',0)
                            ->where('key' , $request->input('role_key'))
                            ->first();
					}
					if($role){
						if($request->input('role_type') == '0'){
							if($rowItemToEdit->religious_council_role_id != $role->id){
                                $changedValues[] = [
                                    'field_name' => 'religious_council_role_id',
                                    'display_field_name' => config('history.' . $historyModelName . '.religious_council_role_id'),
                                    'old_numeric_value' => $rowItemToEdit->religious_council_role_id,
                                    'new_numeric_value' => $role->id
                                ];

								$rowItemToEdit->religious_council_role_id = $role->id;
								$updatesCount ++;
							}
						}
						elseif($request->input('role_type') == '1'){
							if($rowItemToEdit->city_shas_role_id != $role->id){
                                $changedValues[] = [
                                    'field_name' => 'city_shas_role_id',
                                    'display_field_name' => config('history.' . $historyModelName . '.city_shas_role_id'),
                                    'old_numeric_value' => $rowItemToEdit->city_shas_role_id,
                                    'new_numeric_value' => $role->id
                                ];

                                $rowItemToEdit->city_shas_role_id = $role->id;
								$updatesCount ++;
							}
						}
					}
					else{
						$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				        return;
					}
				}
				else
				{
					if(trim($request->input('role_key')) == '')
					{
						if($request->input('role_type') == '0'){
                            if($rowItemToEdit->religious_council_role_id  != NULL){
                                $changedValues[] = [
                                    'field_name' => 'religious_council_role_id',
                                    'display_field_name' => config('history.' . $historyModelName . '.religious_council_role_id'),
                                    'old_numeric_value' => $rowItemToEdit->religious_council_role_id
                                ];


                                $rowItemToEdit->religious_council_role_id = NULL;
							    $updatesCount ++;
                            }
						}
						elseif($request->input('role_type') == '1'){
                            if($rowItemToEdit->city_shas_role_id != NULL){
                                $changedValues[] = [
                                    'field_name' => 'city_shas_role_id',
                                    'display_field_name' => config('history.' . $historyModelName . '.city_shas_role_id'),
                                    'old_numeric_value' => $rowItemToEdit->city_shas_role_id
                                ];

                                $rowItemToEdit->city_shas_role_id = NULL;
							    $updatesCount ++;
                            }
						}

					}					
				}
				
				if($request->input('voter_phone_key') != null && trim($request->input('voter_phone_key')) != '' ){
					$phone = VoterPhone::select('id' , 'phone_number')->where('key' , $request->input('voter_phone_key'))->first();
				    if($phone){
						if($rowItemToEdit->voter_phone_id != $phone->id){
                            $changedValues[] = [
                                'field_name' => 'voter_phone_id',
                                'display_field_name' => config('history.UserPhones.voter_phone_id'),
                                'old_numeric_value' => $rowItemToEdit->voter_phone_id,
                                'new_numeric_value' => $phone->id
                            ];

							$rowItemToEdit->voter_phone_id = $phone->id;
							$updatesCount ++;
						}
					}
					else{
						$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				        return;
					}
				}
				else{
					if(trim($request->input('voter_phone_key')) == ''){
                         if($rowItemToEdit->voter_phone_id != NULL){
                             $changedValues[] = [
                                 'field_name' => 'voter_phone_id',
                                 'display_field_name' => config('history.UserPhones.voter_phone_id'),
                                 'old_numeric_value' => $rowItemToEdit->voter_phone_id
                             ];

                            $rowItemToEdit->voter_phone_id = NULL;
                        
							$updatesCount ++;
                      }
					}					
				}
				
				 
				if($request->input('role_start') != null && trim($request->input('role_start')) != '' ){
					if($request->input('role_start') != $rowItemToEdit->role_start){
						$updatesCount ++;
						if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('role_start'))){
							   $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				               return;
						}

                        $changedValues[] = [
                            'field_name' => 'role_start',
                            'display_field_name' => config('history.' . $historyModelName . '.role_start'),
                            'old_value' => $rowItemToEdit->role_start,
                            'new_value' => $request->input('role_start')
                        ];

						$rowItemToEdit->role_start = $request->input('role_start');
					}
				}
				
				if($request->input('role_end') != $rowItemToEdit->role_end){
						if($request->input('role_end') == ''){
                         if($request->input('role_end') != NULL){
                             $changedValues[] = [
                                 'field_name' => 'role_end',
                                 'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                                 'old_value' => $rowItemToEdit->role_end
                             ];

							 $rowItemToEdit->role_end = NULL;
                             $updatesCount ++;
                          }
						}
						else{
						   if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('role_end'))){
							   $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				               return;
						   }
                           $updatesCount ++;

                            $changedValues[] = [
                                'field_name' => 'role_end',
                                'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                                'old_value' => $rowItemToEdit->role_end,
                                'new_value' => $request->input('role_end')
                            ];

						    $rowItemToEdit->role_end = $request->input('role_end');
						}
				}
				
				if($updatesCount  > 0){
                    $historyArgsArr = [
                        'topicName' => $historyTopicName,
                        'models' => [
                            [
                                'referenced_model' => $historyModelName,
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $rowItemToEdit->id,
                                'valuesList' => $changedValues
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);

                    $rowItemToEdit->save();
				}
				 $jsonOutput->setData("ok");
				
			}
			else{
				$jsonOutput->setErrorCode(config('errors.elections.CITY_ROLE_NOT_EXISTS'));
				return;
			}
		
	}
	
	
	
	/*
	Delete religeous-role/shas-role by cityKey and itemKey
	 
	@param $cityKey
	@param $itemKey
	@route name - will define on which table to operate - city_roles_by_voters/city_council_members
	*/
	public function deleteReligeousOrShaseRoleItem(Request $request , $cityKey , $itemKey){
		    $jsonOutput = app()->make("JsonOutput");
			$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
			if($request->input('delete_type') != '0' && $request->input('delete_type') != '1' ){
					$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
					return;
			}
		    if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            if($itemKey == null || trim($itemKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_ROLE_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		    }
		 		 
            $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		    if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		    }

            $historyTopicName = '';
            $historyModelName = '';

			$itemToDelete = null;
		    if ( $request->input('delete_type') == '0') {
                if(!$this->isActionPermitted('elections.cities.roles.religious_council.delete')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }

                $historyTopicName = 'elections.cities.roles.religious_council.delete';
                $historyModelName = 'ReligiousCouncilMembers';

				$itemToDelete = ReligiousCouncilMembers::where('city_id' , $city->city_id)
                    ->where('key' , $itemKey )
                    ->where('deleted' , 0)
                    ->first();
		    }
            elseif ( $request->input('delete_type') == '1' ) {
                if(!$this->isActionPermitted('elections.cities.roles.shas.delete')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }

                $historyTopicName = 'elections.cities.roles.shas.delete';
                $historyModelName = 'CityShasRolesByVoters';

			    $itemToDelete = CityShasRolesByVoters::where('city_id' , $city->city_id)
                    ->where('key' , $itemKey )
                    ->where('deleted' , 0)
                    ->first();
		    }
				if($itemToDelete){
					$itemToDelete->deleted = 1;
					$itemToDelete->save();

                    $historyArgsArr = [
                        'topicName' => $historyTopicName,
                        'models' => [
                            [
                                'referenced_model' => $historyModelName,
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                                'referenced_id' => $itemToDelete->id
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
				}
				else{
					$jsonOutput->setErrorCode(config('errors.elections.CITY_ROLE_NOT_EXISTS'));
					return;
				}
			
			$jsonOutput->setData("ok");
	}
	
	/*
       function that adds new religeous council role/shas city role

       @param $cityKey
       @param $request  - the following : voter_key ,shas , role_name_key , voter_phone_key(optional)
	                     ,role_type_id (0 -religious council role , 1-city shas role ) , from_date , to_date(optional) : 
    */
	public function addNewReligeousOrShaseRoleItem(Request $request , $cityKey ){
		   $jsonOutput = app()->make("JsonOutput");
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
		   
		   if($request->input("voter_key") == null || trim($request->input("voter_key")) == ''){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		    if($request->input("role_name_key") == null || trim($request->input("role_name_key")) == ''){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		   
		   
		    if($request->input("role_type_id") != '1' && $request->input("role_type_id") != '0'){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		    }
		  
		    if($request->input("role_type_id") == '0'){
                if(!$this->isActionPermitted('elections.cities.roles.religious_council.add')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }
				if($request->input("shas") != '1' && $request->input("shas") != '0'){
					$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
					return; 
				}
			}
            elseif($request->input("role_type_id") == '1'){
                if(!$this->isActionPermitted('elections.cities.roles.shas.add')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                     }
				 
			}
		   
		   if($request->input("from_date") == null || trim($request->input("from_date")) == ''){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		   
		   if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('from_date'))){
					 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				       return;
		   }
		   
		   if($request->input("to_date") != null && trim($request->input("to_date")) != ''){
			 if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('to_date'))){
				
				$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				return;
			 }				
		   }
		   
           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   
		   $voter = Voters::select('id' , 'first_name','last_name')->where('key' ,$request->input("voter_key") )->first();
		   if(!$voter){
				    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return;
		   }
		   

		    $changedValues = [];
		    $historyModelName = '';
            $historyTopicName = '';

			$roleData = null;
			$newRoleRow = null;
            $historyDataArray = array();
			if($request->input("role_type_id") == '0') {
                $historyTopicName = 'elections.cities.roles.religious_council.add';

                $roleData = ReligiousCouncilRoles::select('id' , 'name')
                    ->where('key' , $request->input('role_name_key'))
                    ->where('deleted',0)
                    ->first();
			    if($roleData){
                    $historyModelName = 'ReligiousCouncilMembers';

					$newRoleRow = new ReligiousCouncilMembers;
				    $newRoleRow->key = Helper::getNewTableKey('religious_council_members', 5);
					$newRoleRow->religious_council_role_id = $roleData->id;
					$newRoleRow->shas = $request->input('shas');
                    if($newRoleRow->shas == '1'){$this->changeVoterShasRepresentative($voter,null,$changedValues);}

                    $changedValues[] = [
                        'field_name' => 'religious_council_role_id',
                        'display_field_name' => config('history.ReligiousCouncilMembers.religious_council_role_id'),
                        'new_numeric_value' => $newRoleRow->religious_council_role_id
                    ];

                    $changedValues[] = [
                        'field_name' => 'shas',
                        'display_field_name' => config('history.ReligiousCouncilMembers.shas'),
                        'new_numeric_value' => $newRoleRow->shas
                    ];
				}
			}
			elseif($request->input("role_type_id") == '1') {
                $historyTopicName = 'elections.cities.roles.shas.add';

                $roleData = CityShasRoles::select('id' , 'name')
                    ->where('key' , $request->input('role_name_key'))
                    ->where('deleted',0)
                    ->first();
			    if($roleData){
                    $historyModelName = 'CityShasRolesByVoters';

                    $newRoleRow = new CityShasRolesByVoters;
				    $newRoleRow->key = Helper::getNewTableKey('city_shas_roles_by_voters', 5);
					$newRoleRow->city_shas_role_id = $roleData->id;
					$newRoleRow->council_number = -1;

                    $changedValues[] = [
                        'field_name' => 'city_shas_role_id',
                        'display_field_name' => config('history.CityShasRolesByVoters.city_shas_role_id'),
                        'new_numeric_value' => $newRoleRow->city_shas_role_id
                    ];
					/*
                    $changedValues[] = [
                        'field_name' => 'council_number',
                        'display_field_name' => config('history.CityShasRolesByVoters.council_number'),
                        'new_numeric_value' => $newRoleRow->council_number
                    ];
					*/
                }
			}
            if(!$roleData){
				$jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_EDIT_PARAMS'));
				return;
			}

            $voterPhone = null;
            if( $request->input('phone_key') != NULL && trim( $request->input('phone_key')) != ''){
                 $voterPhone = VoterPhone::select('id' , 'phone_number')->where('voter_id',$voter->id)->where('key' , $request->input('phone_key'))->first();
                 if(!$voterPhone){
                     $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_EDIT_PARAMS'));
                     return;
                 }
             }else{
                 $voterPhone = $this->addNewPhone($request->input('new_phone_number'), $voter->id, $changedValues);
             }
             if($voterPhone){
                     $newRoleRow->voter_phone_id = $voterPhone->id;
                $changedValues[] = [
                    'field_name' => 'voter_phone_id',
                    'display_field_name' => config('history.UserPhones.voter_phone_id'),
                    'new_numeric_value' => $newRoleRow->voter_phone_id
                ];
             }
			$newRoleRow->city_id = $city->city_id;
            $changedValues[] = [
                'field_name' => 'city_id',
                'display_field_name' => config('history.' . $historyModelName . '.city_id'),
                'new_numeric_value' => $newRoleRow->city_id
            ];


            $newRoleRow->voter_id = $voter->id;
            $changedValues[] = [
                'field_name' => 'voter_id',
                'display_field_name' => config('history.' . $historyModelName . '.voter_id'),
                'new_numeric_value' => $newRoleRow->voter_id
            ];
            


            $newRoleRow->role_start = $request->input('from_date');
            $changedValues[] = [
                'field_name' => 'role_start',
                'display_field_name' => config('history.' . $historyModelName . '.role_start'),
                'new_value' => $newRoleRow->role_start
            ];

            if($request->input('to_date') != NULL && trim($request->input('to_date')) != '' ) {
				 $newRoleRow->role_end = $request->input('to_date');

                $changedValues[] = [
                    'field_name' => 'role_end',
                    'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                    'new_value' => $newRoleRow->role_end
                ];
			}
            $newRoleRow->save();

            $historyArgsArr = [
                'topicName' => $historyTopicName,
                'models' => [
                    [
                        'referenced_model' => $historyModelName,
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $newRoleRow->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);

            $newRoleRow->first_name = $voter->first_name;
			$newRoleRow->last_name = $voter->last_name;

            $newRoleRow->phones = VoterPhone::where('voter_id' , $voter->id)->get();
			$newRoleRow->role_name = $roleData->name;
            $jsonOutput->setData($newRoleRow);			
	}
	
	/*
       function that gets a list of city-council-members keys , and changes their order from 1 to n :

       @param $cityKey
       @param $request  - contains ordered keys of council members
    */	
    public function saveCouncilMembersOrders(Request $request , $cityKey  ){
           $jsonOutput = app()->make("JsonOutput");
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   
		     $councilMembersKeys = json_decode($request->input('ordered_council_members'), true);
			 for($i = 0 ; $i < sizeof($councilMembersKeys) ; $i++){
				 CityCouncilMembers::where('city_id' , $city->city_id)
                     ->where('deleted' , 0)
                     ->where('key' , $councilMembersKeys[$i] )
                     ->update(array('order'=>($i+1)));
			 }
		      
           $jsonOutput->setData("ok");
	}	
	
	/*
	Edit changes in city-role/city-council-member by cityKey and roleKey
	
	@param $request - role_type - 0 or 1 required
	@param $cityKey
	@param $roleKey
	@route name - will define on which table to operate - city_roles_by_voters/city_council_members
	*/
	public function editCityMunicipalItem(Request $request , $cityKey , $roleKey){
		$jsonOutput = app()->make("JsonOutput");
		    if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            if($roleKey == null || trim($roleKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_ROLE_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		    }
		 		 
            $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		    if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		    }
            $historyDataArray = array(); 
			$rowItemToEdit = null;
			$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
            $historyPersmissionName = '';
            $historyObjectName='';

            $historyModelName = '';
            $changedValues = [];

            if ( in_array('elections.cities.municipal_roles', $routePermissions) ) {
			   $rowItemToEdit = CityRolesByVoters::where('city_id' , $city->city_id)
                   ->where('key' , $roleKey )
                   ->where('deleted' , 0)
                   ->first();

                $historyModelName = 'CityRolesByVoters';
			}
			elseif ( in_array('elections.cities.council_members', $routePermissions) ) {
               if(!$this->isActionPermitted('elections.cities.roles.council.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
               }
               $historyPersmissionName = 'elections.cities.roles.council.edit';
               $historyObjectName='CityCouncilMemberRole';

               $rowItemToEdit = CityCouncilMembers::where('city_id' , $city->city_id)
                   ->where('key' , $roleKey )
                   ->where('deleted' , 0)
                   ->first();

                $historyModelName = 'CityCouncilMembers';
			}
            
			if($rowItemToEdit){
               if ( in_array('elections.cities.municipal_roles', $routePermissions) ) {
                   if($rowItemToEdit->role_type == 0){
                       if(!$this->isActionPermitted('elections.cities.roles.mayor.edit')){
                           $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                           return;
                       }
                       $historyPersmissionName = 'elections.cities.roles.mayor.edit';
                       $historyObjectName='CityMayorRole';
                   }
                   else{
                       if(!$this->isActionPermitted('elections.cities.roles.deputy.edit')){
                           $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                           return;
                       }
                       $historyPersmissionName = 'elections.cities.roles.deputy.edit';
                       $historyObjectName='CityDeputyRole';
                   }
               }
                $updatesCount = 0;
                $shasInput = $request->input('shas');

				if($shasInput == '0' || $shasInput == '1' ){
                    if($shasInput == '1'){$this->changeVoterShasRepresentative(null,$rowItemToEdit->voter_id,$changedValues);}

					if($shasInput != $rowItemToEdit->shas){

						$updatesCount ++;

                        $changedValues[] = [
                            'field_name' => 'shas',
                            'display_field_name' => config('history.' . $historyModelName . '.shas'),
                            'old_numeric_value' => $rowItemToEdit->shas,
                            'new_numeric_value' => $shasInput
                        ];

						$rowItemToEdit->shas = $shasInput;
					}
				}
				
				if($request->input('council_number') != null && trim($request->input('council_number')) != '' && is_numeric($request->input('council_number')) ){
					if($request->input('council_number') != $rowItemToEdit->council_number){
						$updatesCount ++;

                        $changedValues[] = [
                            'field_name' => 'council_number',
                            'display_field_name' => config('history.' . $historyModelName . '.council_number'),
                            'old_numeric_value' => $rowItemToEdit->council_number,
                            'new_numeric_value' => $request->input('council_number')
                        ];

						$rowItemToEdit->council_number = $request->input('council_number');
					}
				}
				
				if($request->input('term_of_office') != null && trim($request->input('term_of_office')) != '' && is_numeric($request->input('term_of_office')) ){
					if($request->input('term_of_office') != $rowItemToEdit->term_of_office){
						$updatesCount ++;

                        $changedValues[] = [
                            'field_name' => 'term_of_office',
                            'display_field_name' => config('history.' . $historyModelName . '.term_of_office'),
                            'old_numeric_value' => $rowItemToEdit->term_of_office,
                            'new_numeric_value' => $request->input('term_of_office')
                        ];

                        $rowItemToEdit->term_of_office = $request->input('term_of_office');
					}
				}

                $voter_phone_id = $request->input('voter_phone_id',null);
                // dd($rowItemToEdit->voter_phone_id);
                if($rowItemToEdit->voter_phone_id != $voter_phone_id){
                    $updatesCount ++;
                    $rowItemToEdit->voter_phone_id = $voter_phone_id;
                    $changedValues[] = [
                        'field_name' => 'voter_phone_id',
                        'display_field_name' => config('history.UserPhones.voter_phone_id'),
                        'old_value' => $rowItemToEdit->voter_phone_id,
                        'new_value' => $voter_phone_id 
                    ];
                }
				if($request->input('role_start') != null && trim($request->input('role_start')) != '' ){
					if($request->input('role_start') != $rowItemToEdit->role_start){
						 
						if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('role_start'))){
							   $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				               return;
						}

                        $updatesCount ++;

                        $changedValues[] = [
                            'field_name' => 'role_start',
                            'display_field_name' => config('history.' . $historyModelName . '.role_start'),
                            'old_value' => $rowItemToEdit->role_start,
                            'new_value' => $request->input('role_start')
                        ];

						$rowItemToEdit->role_start = $request->input('role_start');
					}
				}

				if($request->input('role_end') != $rowItemToEdit->role_end){
						$updatesCount ++;
						if($request->input('role_end') == ''){
                            if ( !is_null($rowItemToEdit->role_end) ) {
                                $changedValues[] = [
                                    'field_name' => 'role_end',
                                    'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                                    'old_value' => $rowItemToEdit->role_end
                                ];
                            }

							$rowItemToEdit->role_end = NULL;
						}
						else{
						   if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('role_end'))){
							   $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				               return;
						   }

                           $changedValues[] = [
                              'field_name' => 'role_end',
                              'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                              'old_value' => $rowItemToEdit->role_end,
                              'new_value' => $request->input('role_end')
                           ];

						   $rowItemToEdit->role_end = $request->input('role_end');
						}
				}
				
                $oldDepartment =  CityDepartments::select('id' , 'name')->where('deleted',0)->where('id',$rowItemToEdit->city_department_id)->first();
				if($request->input('department_key') != null && trim($request->input('department_key')) != '' ){
					$department = CityDepartments::select('id' , 'name')->where('deleted',0)->where('key' , $request->input('department_key'))->first();
				    if($department){
						if($rowItemToEdit->city_department_id != $department->id){
                            $changedValues[] = [
                                'field_name' => 'city_department_id',
                                'display_field_name' => config('history.' . $historyModelName . '.city_department_id'),
                                'old_numeric_value' => $rowItemToEdit->city_department_id,
                                'new_numeric_value' => $department->id
                            ];

							$rowItemToEdit->city_department_id = $department->id;
							$updatesCount ++;
						}
					}
					else{
						$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				        return;
					}
				}
				else{
					if(trim($request->input('department_key')) == ''){
                        if($rowItemToEdit->city_department_id  != NULL){
                            $changedValues[] = [
                                'field_name' => 'city_department_id',
                                'display_field_name' => config('history.' . $historyModelName . '.city_department_id'),
                                'old_numeric_value' => $rowItemToEdit->city_department_id
                            ];

                            $rowItemToEdit->city_department_id = NULL;
							$updatesCount ++;
                      }
					}					
				}
				$oldParty = MunicipalElectionParties::select('id' , 'letters')->where('deleted',0)->where('id' ,$rowItemToEdit->municipal_election_party_id )->first();
				
				if($request->input('party_key') != null && trim($request->input('party_key')) != '' ){
					$party = MunicipalElectionParties::select('id' , 'letters')
                        ->where('deleted',0)
                        ->where('key' , $request->input('party_key'))
                        ->first();
				    if($party){
						if($rowItemToEdit->municipal_election_party_id != $party->id){
                            $changedValues[] = [
                                'field_name' => 'municipal_election_party_id',
                                'display_field_name' => config('history.' . $historyModelName . '.municipal_election_party_id'),
                                'old_numeric_value' => $rowItemToEdit->municipal_election_party_id,
                                'new_numeric_value' => $party->id
                            ];

                            $rowItemToEdit->municipal_election_party_id = $party->id;
							$updatesCount ++;
						}
					}
					else{
						$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				        return;
					}
				}
				else{
					if(trim($request->input('party_key')) == ''){
                       if($rowItemToEdit->municipal_election_party_id != NULL){
                           $changedValues[] = [
                               'field_name' => 'municipal_election_party_id',
                               'display_field_name' => config('history.' . $historyModelName . '.municipal_election_party_id'),
                               'old_numeric_value' => $rowItemToEdit->municipal_election_party_id
                           ];

                           $rowItemToEdit->municipal_election_party_id = NULL;
						   $updatesCount ++;
                       }
					}					
				}
				
				if($updatesCount  > 0){
					$rowItemToEdit->save();
                    //ActionController::AddHistoryItem($historyPersmissionName , $rowItemToEdit->id, $historyObjectName, $historyDataArray);

                    $historyArgsArr = [
                        'topicName' => $historyPersmissionName,
                        'models' => [
                            [
                                'referenced_model' => $historyModelName,
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $rowItemToEdit->id,
                                'valuesList' => $changedValues
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
				}
				 $jsonOutput->setData($rowItemToEdit);
				
			}
			else{
				$jsonOutput->setErrorCode(config('errors.elections.CITY_ROLE_NOT_EXISTS'));
				return;
			}
	}
	
	/*
	Delete city-role/city-council-member by cityKey and itemKey
	
	@param $cityKey
	@param $itemKey
	@route name - will define on which table to operate - city_roles_by_voters/city_council_members
	*/
	public function deleteCityMunicipalItem(Request $request , $cityKey , $itemKey){
		    $jsonOutput = app()->make("JsonOutput");
			$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
			if ( in_array('elections.cities.municipal_roles', $routePermissions) ) {
				if($request->input('role_type') != '0' && $request->input('role_type') != '1' ){
					$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
					return;
				}
			}
		    if($cityKey == null || trim($cityKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
				return;
		    }
            if($itemKey == null || trim($itemKey) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_ROLE_KEY'));
				return;
		    }
            $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		    if(!$city){
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
		    }
		 		 
            $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		    if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
		    }
			
			$itemToDelete = null;
            $historyModelName = null;

		    if ( in_array('elections.cities.municipal_roles', $routePermissions) ) {
                $historyModelName = 'CityRolesByVoters';

				$itemToDelete = CityRolesByVoters::where('city_id' , $city->city_id)
                    ->where('key' , $itemKey )
                    ->where('deleted' , 0)
                    ->first();
		    }
            elseif ( in_array('elections.cities.council_members', $routePermissions) ) {
                $historyModelName = 'CityCouncilMembers';

                $itemToDelete = CityCouncilMembers::where('city_id' , $city->city_id)
                    ->where('key' , $itemKey )
                    ->where('deleted' , 0)
                    ->first();
            }
				if($itemToDelete){
                    if(in_array('elections.cities.municipal_roles', $routePermissions) ){
                           if($itemToDelete->role_type==0){
                              if(!$this->isActionPermitted('elections.cities.roles.mayor.delete')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                              }
                            }
                            elseif($itemToDelete->role_type==1){
                              if(!$this->isActionPermitted('elections.cities.roles.deputy.delete')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                              }
                           }
                           //ActionController::AddHistoryItem(($itemToDelete->role_type==0?'elections.cities.roles.mayor.delete':'elections.cities.roles.deputy.delete'), $itemToDelete->id, ($itemToDelete->role_type==0?'CityMayorRole':'CityDeputyRole'), array());
                    }
                    elseif ( in_array('elections.cities.council_members', $routePermissions) ) {
                           if(!$this->isActionPermitted('elections.cities.roles.council.delete')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
                           }
                           //ActionController::AddHistoryItem('elections.cities.roles.council.delete', $itemToDelete->id, 'CityCouncilMemberRole', array());
                    }
 
					$itemToDelete->deleted = 1;
					$itemToDelete->save();

                    $historyArgsArr = [
                        'topicName' => 'elections.cities.roles.council.delete',
                        'models' => [
                            [
                                'referenced_model' => $historyModelName,
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                                'referenced_id' => $itemToDelete->id
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
				}
				else{
					$jsonOutput->setErrorCode(config('errors.elections.CITY_ROLE_NOT_EXISTS'));
					return;
				}
			
			$jsonOutput->setData("ok");
	}

	/*
	Add new city-role/city-council-member by role_type
	
	@param $request - voter_key , shas , council_number , term_of_office , from_date  - required
	                  department_key , campaign_key ,party_key , to_date - not required   
    @param cityKey					  
	@route name - will define on which table to operate - city_roles_by_voters/city_council_members
	*/
    public function addNewCityMunicipalItem(Request $request , $cityKey){
		$jsonOutput = app()->make("JsonOutput");
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
		  
		   
		   if($request->input("voter_key") == null || trim($request->input("voter_key")) == ''){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		 
		   if($request->input("council_number") == null || trim($request->input("council_number")) == '' || !is_numeric($request->input("council_number"))){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
 
		    if($request->input("shas") != '1' && $request->input("shas") != '0'){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		   
		   if($request->input("from_date") == null || trim($request->input("from_date")) == ''){
			 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return; 
		   }
		   
		   if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('from_date'))){
					 $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				       return;
		   }
		   
		   if($request->input("to_date") != null && trim($request->input("to_date")) != ''){
			 if(!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/",$request->input('to_date'))){
				
				$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
				return;
			 }				
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   
		  
		   
		   $voter = Voters::select('id' , 'first_name','last_name','key')->where('key' ,$request->input("voter_key") )->first();
		   if(!$voter){
				    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			 return;
		   }
		   

           $historyDataArray = array(); 

           array_push($historyDataArray , [
							           'voter_details', // Fileld name
							            'פרטי תושב' ,// display field name
							            '', // old value of field
							            ($voter->first_name . ' ' . $voter->last_name) // new value of field
					                ]);

		   $departmentID = NULL;
		   $campaignID = NULL;
		   $partyID = NULL;
		   $departmentName = '';
		   $partyName= '';
		   $campaignName = '';
		   
		   if($request->input("department_key") != null && trim($request->input("department_key") )  != ''){
			   
			   $department = CityDepartments::select('id' , 'name')->where('deleted',0)->where('key' ,$request->input("department_key") )->first();
			   if($department){
				   $departmentID = $department->id;
				   $departmentName = $department->name;
                   array_push($historyDataArray , [
							           'department_name', // Fileld name
							            'מחזיק בתיק' ,// display field name
							            '', // old value of field
							            $department->name // new value of field
					                ]);
                   
			   }
			   else{
				    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			        return; 	   
			   }
		   }
		    if($request->input("campaign_key") != null && trim($request->input("campaign_key") )  != ''){
			   
			   $campaign = ElectionCampaigns::select('id' , 'name')->where('key' ,$request->input("campaign_key") )->first();
			   if($campaign){
				   $campaignID = $campaign->id;
				   $campaignName= $campaign->name;
				    array_push($historyDataArray , [
							           'elections_campaign_name', // Fileld name
							            'קמפיין בחירות' ,// display field name
							            '', // old value of field
							            $campaignName // new value of field
					                ]);
			   }
			   else{
				    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			        return; 	   
			   }
		   }
		    if($request->input("party_key") != null && trim($request->input("party_key") )  != ''){
			   
			   $party = MunicipalElectionParties::select('id','letters')->where('deleted',0)->where('key' ,$request->input("party_key") )->first();
			   if($party){
				   $partyID = $party->id;
				   $partyName = $party->letters;
                    array_push($historyDataArray , [
							           'party_letters', // Fileld name
							            'אותיות מפלגה' ,// display field name
							            '', // old value of field
							            $partyName // new value of field
					                ]);
			   }
			   else{
				    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_ROLE_PARAMS'));
			        return; 	   
			   }
		   }

		   $changedValues = [];
		   $historyModelName = '';

           $historyPersmissionName = '';
           $historyObjectName='';
		   $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
		   if ( in_array('elections.cities.municipal_roles', $routePermissions) ) {
              $historyModelName = 'CityRolesByVoters';

		      $newItem = new CityRolesByVoters;
		      $newItem->key = Helper::getNewTableKey('city_roles_by_voters', 5);
			  $newItem->role_type = $request->input("role_type");
              if($request->input("role_type") == 0){
                      if(!$this->isActionPermitted('elections.cities.roles.mayor.add')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                      }
                      $historyPersmissionName = 'elections.cities.roles.mayor.add';
                      $historyObjectName='CityMayorRole';
              }
              elseif($request->input("role_type") == 1){
                      if(!$this->isActionPermitted('elections.cities.roles.deputy.add')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                      }
                      $historyPersmissionName = 'elections.cities.roles.deputy.add';
                      $historyObjectName='CityDeputyRole';
              }

               $changedValues[] = [
                   'field_name' => 'role_type',
                   'display_field_name' => config('history.CityRolesByVoters.role_type'),
                   'new_numeric_value' => $newItem->role_type
               ];
		   }
           elseif ( in_array('elections.cities.council_members', $routePermissions) ) {
              if(!$this->isActionPermitted('elections.cities.roles.council.add')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
              }

              $historyModelName = 'CityCouncilMembers';

		      $newItem = new CityCouncilMembers;
		      $newItem->key = Helper::getNewTableKey('city_council_members', 5);
			  $newItem->order = CityCouncilMembers::where('deleted' , 0)
		                                                   ->where('city_id' , $city->city_id)
														   ->get()->count() + 1;
              $historyPersmissionName = 'elections.cities.roles.council.add';
              $historyObjectName='CityCouncilMemberRole';

               $changedValues[] = [
                   'field_name' => 'order',
                   'display_field_name' => config('history.CityCouncilMembers.order'),
                   'new_numeric_value' => $newItem->order
               ];
		   }
           $voterPhone = null;
           if($request->input('phone_key') != null && trim($request->input('phone_key')) != ''){
               $voterPhone = VoterPhone::select('id' , 'phone_number')->where('voter_id' , $voter->id)
                   ->where('key',$request->input('phone_key'))
                   ->first();
           }else {
              $voterPhone = $this->addNewPhone($request->input('new_phone_number'), $voter->id, $changedValues);
           }
   
           if($voterPhone){
               $newItem->voter_phone_id = $voterPhone->id;
                //   array_push($changedValues , ['voter_phone_number','טלפון תושב' ,'', $voterPhone->phone_number]);
           }
		   $newItem->city_id = $city->city_id;
		   $newItem->voter_id = $voter->id;
		   $newItem->city_department_id = $departmentID;
		   $newItem->municipal_election_party_id = $partyID;
		   $newItem->shas = $request->input("shas");
		   $newItem->council_number = $request->input("council_number");
		   $newItem->term_of_office = ($request->input("term_of_office") ? $request->input("term_of_office") : -1);
		   $newItem->role_start = $request->input("from_date");

		   $itemFields = [
               'city_id',
               'voter_id',
               'city_department_id',
               'municipal_election_party_id',
               'shas',
               'council_number',
               'term_of_office',
               'role_start'
           ];
           if($newItem->shas=='1'){$this->changeVoterShasRepresentative(null,$newItem->voter_id,$changedValues);}

		   for ( $fieldIndex = 0; $fieldIndex < count($itemFields); $fieldIndex++ ) {
               $fieldName = $itemFields[$fieldIndex];

               if ( 'role_start' == $fieldName ) {
                   $changedValues[] = [
                       'field_name' => 'role_start',
                       'display_field_name' => config('history.' . $historyModelName . '.role_start'),
                       'new_value' => $newItem->role_start
                   ];
               } else {
                   $changedValues[] = [
                       'field_name' => $fieldName,
                       'display_field_name' => config('history.' . $historyModelName . '.' . $fieldName),
                       'new_numeric_value' => $newItem->{$fieldName}
                   ];
               }
           }

		   if( $request->input("to_date") != NULL && trim( $request->input("to_date")) != '') {
               $newItem->role_end = $request->input("to_date");

               $changedValues[] = [
                   'field_name' => 'role_end',
                   'display_field_name' => config('history.' . $historyModelName . '.role_end'),
                   'new_value' => $newItem->order
               ];
		   }

		   $newItem->save();

           $historyArgsArr = [
                'topicName' => $historyPersmissionName,
                'models' => [
                    [
                        'referenced_model' => $historyModelName,
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $newItem->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

           //ActionController::AddHistoryItem($historyPersmissionName , $newItem->id, $historyObjectName, $historyDataArray);
           ActionController::AddHistoryItem($historyArgsArr);

		   $newItem->voter_key = $voter->key;
		   $newItem->first_name = $voter->first_name;
		   $newItem->last_name = $voter->last_name;
		   $newItem->election_campaign_name = $campaignName;
		   $newItem->letters = $partyName;
           $newItem->city_department_name = $departmentName;
           $newItem->phones = VoterPhone::where('voter_id' , $newItem->voter_id)->get();
           
		   $jsonOutput->setData($newItem);
		
	}
	
	/*
	Gell all city-roles/city-council-members by city key
	
	@param cityKey
	@route name - will define on which table to operate - city_roles_by_voters/city_council_members
	*/						
	public function getAllMunicipalItemsData($cityKey){
           $jsonOutput = app()->make("JsonOutput");
           if(!$this->isActionPermitted('elections.cities.roles')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
           }
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   $arrayAllDatta = array();
		   $voterRolesFieldsToSelect = [
		      'city_roles_by_voters.id' ,
			  'city_roles_by_voters.key' , 
		      'voters.first_name' ,
              'voters.last_name',
              'voters.key as voter_key',
			  'voters.main_voter_phone_id',
			  'city_departments.name as city_department_name',
			  'municipal_election_parties.letters',
			  'city_roles_by_voters.shas',
			  'city_roles_by_voters.council_number',
			  'city_roles_by_voters.term_of_office',
			  'city_roles_by_voters.role_start',
			  'city_roles_by_voters.role_end',
			  'election_campaigns.name as election_campaign_name'
              			  
		   ];
		   $councilMembersFieldsToSelect = [
		      'city_council_members.id' ,
			  'city_council_members.key' , 
		      'voters.first_name' ,
              'voters.last_name',
              'voters.key as voter_key',
			  'city_departments.name as city_department_name',
			  'municipal_election_parties.letters',
			  'city_council_members.shas',
			  'city_council_members.council_number',
			  'city_council_members.term_of_office',
			  'city_council_members.role_start',
			  'city_council_members.role_end',
              'city_council_members.voter_id',
			  'city_council_members.voter_phone_id',
              'city_council_members.order',
			  'election_campaigns.name as election_campaign_name'
		   ];
		   $religiousCouncilMembersFieldsToSelect = [
		      'religious_council_members.id' ,
			  'religious_council_members.key' , 
		      'voters.first_name' ,
              'voters.last_name',
              'voters.key as voter_key',
			  'religious_council_members.shas',
			  'religious_council_members.voter_phone_id',
			  'religious_council_members.role_start',
			  'religious_council_members.role_end',
			  'religious_council_roles.name as role_name'
              			  
		   ];
		   $cityShasRolesFieldsToSelect = [
		      'city_shas_roles_by_voters.id' ,
			  'city_shas_roles_by_voters.key' , 
			  'city_shas_roles_by_voters.voter_id',
		      'voters.first_name' ,
              'voters.last_name',
			  'voters.key as voter_key',
			  'city_shas_roles_by_voters.voter_phone_id',
			  'city_shas_roles_by_voters.council_number',
			  'city_shas_roles_by_voters.role_start',
			  'city_shas_roles_by_voters.role_end',
			  'city_shas_roles.name as role_name'
              			  
		   ];
           if($this->isActionPermitted('elections.cities.roles.shas.headquarter_phone')){
              $arrayAllDatta["headquarters_phone_number"] = $city->headquarters_phone_number;
           }
 
           if($this->isActionPermitted('elections.cities.roles.mayor')){
              $arrayAllDatta["city_roles_mayors"] =CityRolesByVoters::select($voterRolesFieldsToSelect)->where('city_roles_by_voters.city_id',$city->city_id)
              ->where('city_roles_by_voters.role_type' ,0)->where('city_roles_by_voters.deleted' , 0)->withVoter()->withParty()->withDepartment()->get();
           }
           else{
              $arrayAllDatta["city_roles_mayors"] = array();
           }

           if($this->isActionPermitted('elections.cities.roles.deputy')){
                $arrayAllDatta["city_roles_deputy_mayors"] = CityRolesByVoters::select($voterRolesFieldsToSelect)->where('city_roles_by_voters.city_id',$city->city_id)
                ->where('city_roles_by_voters.role_type' ,1)->where('city_roles_by_voters.deleted' , 0)->withVoter()->withParty()->withDepartment()->get();
		   }
           else{
              $arrayAllDatta["city_roles_deputy_mayors"] = array();
           }

           if($this->isActionPermitted('elections.cities.roles.council')){
              $arrayAllDatta["city_council_members"] = CityCouncilMembers::select($councilMembersFieldsToSelect)
              ->where('city_council_members.city_id',$city->city_id)->where('city_council_members.deleted' , 0)
              ->withVoter()->withParty()->withDepartment()->with('phones')
            //   ->with(['phones'=>function($query){$query->orderBy('updated_at');}])
              ->orderBy('city_council_members.order','ASC')->get();
		   }
           else{
                 $arrayAllDatta["city_council_members"] = array();
           }

           if($this->isActionPermitted('elections.cities.roles.religious_council')){
                $arrayAllDatta["religious_council_members"] = ReligiousCouncilMembers::select($religiousCouncilMembersFieldsToSelect)
                ->where('religious_council_members.city_id',$city->city_id)->withVoter()->withRole()->with('phones')->where('religious_council_members.deleted',0)->get();
		   }
           else{
                $arrayAllDatta["religious_council_members"]  = array();
           }
           
           if($this->isActionPermitted('elections.cities.roles.shas')){
               $arrayAllDatta["city_shas_roles_by_voters"] = CityShasRolesByVoters::select($cityShasRolesFieldsToSelect)->with('phones')
               ->where('city_shas_roles_by_voters.city_id',$city->city_id)->withVoter()->withRole()->with('phones')->where('city_shas_roles_by_voters.deleted',0)->get();
           }
           else{
               $arrayAllDatta["city_shas_roles_by_voters"]  = array();
           }		   


           $arrayAllDatta["all_city_departments"] = CityDepartments::select('id' , 'name','key')->where('deleted',0)->get();
		   $arrayAllDatta["all_city_parties"] = MunicipalElectionParties::select('id' , 'name' , 'letters','key' , 'election_campaign_id')->where('deleted',0)->where('city_id',$city->city_id)->get();
           $arrayAllDatta["religious_council_roles"] = ReligiousCouncilRoles::select('id' , 'name','key')->where('deleted',0)->get();
		   $arrayAllDatta["city_shas_roles"] = CityShasRoles::select('id' , 'name','key')->where('deleted',0)->get();
		   $jsonOutput->setData($arrayAllDatta);
	}	
	
    /*
       function that gets a list of council-candidate keys , and changes their order from 1 to n :

       @param $cityKey
       @param $campaignKey
       @param $request - request data that contains : 'candidate_type'  and non mandanoty fields (can be null) : party_key , voter_phone_key , shas , favorite 
    */	
    public function saveCandidatesOrders(Request $request , $cityKey , $campaignKey ){
           $jsonOutput = app()->make("JsonOutput");
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
		   if($campaignKey == null || trim($campaignKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		   }
		   $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		   if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		  
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   
		     $candidatesKeys = json_decode($request->input('ordered_candidates'), true);
			 for($i = 0 ; $i < sizeof($candidatesKeys) ; $i++){
				 MunicipalElectionCouncilCandidates::where('city_id' , $city->city_id)->where('election_campaign_id' , $electionCampaign->id)->where('deleted' , 0)->where('key' , $candidatesKeys[$i] )->update(array('order'=>($i+1)));
			 }
		     $candidates = MunicipalElectionCouncilCandidates::where('city_id' , $city->city_id)->where('election_campaign_id' , $electionCampaign->id)->where('deleted' , 0)->orderBy('order' , 'ASC')->get();
		 
           $jsonOutput->setData("ok");
	}	
							
	/*
       saves fields of existing candidate by its type - mayor/council :

       @param $cityKey
       @param $campaignKey
       @param $candidateKey
       @param $request - request data that contains : 'candidate_type'  and non mandanoty fields (can be null) : party_key , voter_phone_key , shas , favorite 
    */						
	public function saveCandidateByType(Request $request , $cityKey , $campaignKey , $candidateKey){
           $jsonOutput = app()->make("JsonOutput");
		   if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
		   if($campaignKey == null || trim($campaignKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		   }

           if($candidateKey == null || trim($candidateKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CANDIDATE_KEY'));
		       return;
		   }

           if($request->input('candidate_type') != 'mayor' && $request->input('candidate_type') != 'council'){
             $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_TYPE'));
			 return;
           }
 
           $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		   if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		   $modelChangedOldMayorFavorite = null; // stores old mayor candidate who was favorite - for history saving purposes	 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }
		   
		    $updatesCount = 0;
		    $changedValues = [];
		    $historyModelName = '';
            $historyPersmissionName = '';
		    if($request->input('candidate_type') == "mayor"){
                 if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.mayor.edit')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                   }
                $historyPersmissionName = 'elections.cities.parameters_candidates.candidates.mayor.edit';
                $historyObjectName='CityMayorCandidate';
                $historyModelName = 'MunicipalElectionMayorCandidates';
                $candidate = MunicipalElectionMayorCandidates::where('city_id' , $city->city_id)
                    ->where('election_campaign_id' , $electionCampaign->id)
                    ->where('deleted' , 0)
                    ->where('key' , $candidateKey )
                    ->first();
			}
		    elseif($request->input('candidate_type') == "council"){
                 if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.council.edit')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                   }
                $historyPersmissionName = 'elections.cities.parameters_candidates.candidates.council.edit';
                $historyObjectName='CityCouncilCandidate';
                $historyModelName = 'MunicipalElectionCouncilCandidates';
                $candidate = MunicipalElectionCouncilCandidates::where('city_id' , $city->city_id)
                    ->where('election_campaign_id' , $electionCampaign->id)
                    ->where('deleted' , 0)
                    ->where('key' , $candidateKey )
                    ->first();
            }
            if($candidate){
            if($request->input('shas') == '1'){$this->changeVoterShasRepresentative(null,$candidate->voter_id,$changedValues);}

                if($candidate->shas != $request->input('shas')){
                    $changedValues[] = [
                        'field_name' => 'shas',
                        'display_field_name' => config('history.' . $historyModelName . '.shas'),
                        'old_numeric_value' => $candidate->shas,
                        'new_numeric_value' => $request->input('shas')
                    ];

                    $candidate->shas = $request->input('shas');
                    $updatesCount ++;
                }
                if($request->input('candidate_type') == "mayor"){
                    if($candidate->favorite != $request->input('favorite')) {
                        $changedValues[] = [
                            'field_name' => 'favorite',
                            'display_field_name' => config('history.' . $historyModelName . '.favorite'),
                            'old_numeric_value' => $candidate->favorite,
                            'new_numeric_value' => $request->input('favorite')
                        ];


						
						if($request->input('favorite') == '1'){
							$oldMayorCandidate = MunicipalElectionMayorCandidates::where('deleted' , 0)
								->where('city_id' , $city->city_id)
								->where('election_campaign_id' , $electionCampaign->id)
								->where('key' , '<>', $candidate->key )
								->where('favorite',1)
								->first();

								if($oldMayorCandidate ){
									//$historyArgsArr['models'][]
									$modelChangedOldMayorFavorite = [
									'description' => 'עדכון מועמד לראשות העיר',
									'referenced_model' => 'MunicipalElectionMayorCandidates',
									'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
									'referenced_id' => $oldMayorCandidate->id,
									'valuesList' => [
														[
															'field_name' => 'favorite',
															'display_field_name' => config('history.MunicipalElectionMayorCandidates.favorite'),
															'old_numeric_value' => 1,
															'new_numeric_value' => 0
														]
													]
									];
									MunicipalElectionMayorCandidates::where('deleted' , 0)
										->where('city_id' , $city->city_id)
										->where('election_campaign_id' , $electionCampaign->id)
										->where('key' , '<>', $candidate->key )
										->update(array('favorite'=>0));
								}
						}
                        $candidate->favorite = $request->input('favorite');
                        $updatesCount ++;
                    }
                }
                $partyData = MunicipalElectionParties::select('id' , 'letters')->where('city_id' , $city->city_id)->where('election_campaign_id' , $electionCampaign->id)->where('deleted' , 0)->where('key' , $request->input('party_key') )->first();
                if($partyData){
                    if($partyData->id != $candidate->municipal_election_party_id){
                        $changedValues[] = [
                            'field_name' => 'municipal_election_party_id',
                            'display_field_name' => config('history.' . $historyModelName . '.municipal_election_party_id'),
                            'old_numeric_value' => $candidate->municipal_election_party_id,
                            'new_numeric_value' => $partyData->id
                        ];

                        $candidate->municipal_election_party_id = $partyData->id;
                        $updatesCount ++;
                    }
                }
                else{
                    $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_EDIT_PARAMS'));
                    return;
                }

                if( $request->input('phone_key') != NULL && trim( $request->input('phone_key')) != ''){
                    $voterPhoneData = VoterPhone::select('id' , 'phone_number')->where('voter_id',$candidate->voter_id)->where('key' , $request->input('phone_key'))->first();
                    if($voterPhoneData){
                        if($voterPhoneData->id != $candidate->voter_phone_id){
                            $changedValues[] = [
                                'field_name' => 'voter_phone_id',
                                'display_field_name' => config('history.UserPhones.voter_phone_id'),
                                'old_numeric_value' => $candidate->voter_phone_id,
                                'new_numeric_value' => $voterPhoneData->id
                            ];

                        }
                        $updatesCount++;
                        $candidate->voter_phone_id = $voterPhoneData->id;
                    }
                    else{
                        $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_EDIT_PARAMS'));
                        return;
                    }
                }
                if($updatesCount>0){
                    $candidate->save();

                    $historyArgsArr = [
                        'topicName' => $historyPersmissionName,
                        'models' => [
                            [
                                'referenced_model' => $historyModelName,
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $candidate->id,
                                'valuesList' => $changedValues
                            ]
                        ]
                    ];
					if($modelChangedOldMayorFavorite){
						$historyArgsArr['models'][] = $modelChangedOldMayorFavorite;
					}

                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }
            else{
                $jsonOutput->setErrorCode(config('errors.elections.CANDIDATE_NOT_EXISTS'));
                return;
            }
            
		   $jsonOutput->setData("ok");
		   
	}

    /*
       deletes candidate by key and type : request->input("candidate_type") - if it's "mayor" - then it
       will delete it from 'municipal_election_mayor_candidates' table , and if it's "council" - then it
       will delete it from 'municipal_election_council_candidates' table.

       @param $cityKey
       @param $campaignKey
       @param $candidateKey
       @param $request - request data that contains : 'candidate_type'  
    */
    public function deleteCandidateByType(Request $request , $cityKey , $campaignKey , $candidateKey){
           $jsonOutput = app()->make("JsonOutput");
            
           if($cityKey == null || trim($cityKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		   }
		   if($campaignKey == null || trim($campaignKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		   }

           if($candidateKey == null || trim($candidateKey) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CANDIDATE_KEY'));
		       return;
		   }

           if($request->input('candidate_type') != 'mayor' && $request->input('candidate_type') != 'council'){
             $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_TYPE'));
			 return;
           }
 
           $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		   if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		   }

           $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		   if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		   }
		 		 
           $isAllowed = $this->isAllowedCityForUser($city);
		 
		   if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		   }

           if($request->input('candidate_type') == "mayor"){
                   if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.mayor.delete')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                   }
                   $candidateObj = MunicipalElectionMayorCandidates::where('city_id' , $city->city_id)
                       ->where('election_campaign_id' , $electionCampaign->id)
                       ->where('deleted' , 0)
                       ->where('key' , $candidateKey )
                       ->first();
                   if( $candidateObj) {
                      $candidateObj->deleted = 1;
                      $candidateObj->save();

                       $historyArgsArr = [
                           'topicName' => 'elections.cities.parameters_candidates.candidates.mayor.delete',
                           'models' => [
                               [
                                   'referenced_model' => 'MunicipalElectionMayorCandidates',
                                   'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                                   'referenced_id' => $candidateObj->id
                               ]
                           ]
                       ];

                       ActionController::AddHistoryItem($historyArgsArr);
                   }
                   else{
                        $jsonOutput->setErrorCode(config('errors.elections.CANDIDATE_NOT_EXISTS'));
			            return;
                   }
                   
                   $jsonOutput->setData(1);
                   return;
           }
           elseif($request->input('candidate_type') == "council"){
                   if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.council.delete')){
						$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						return;
                   }
                  $candidateObj= MunicipalElectionCouncilCandidates::where('city_id' , $city->city_id)
                      ->where('election_campaign_id' , $electionCampaign->id)
                      ->where('deleted' , 0)
                      ->where('key' , $candidateKey )
                      ->first();
                    if( $candidateObj){
                      $candidateObj->deleted = 1;
                      $candidateObj->save();

                        $historyArgsArr = [
                            'topicName' => 'elections.cities.parameters_candidates.candidates.council.delete',
                            'models' => [
                                [
                                    'referenced_model' => 'MunicipalElectionCouncilCandidates',
                                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                                    'referenced_id' => $candidateObj->id
                                ]
                            ]
                        ];

                        ActionController::AddHistoryItem($historyArgsArr);
                   }
                   else{
                        $jsonOutput->setErrorCode(config('errors.elections.CANDIDATE_NOT_EXISTS'));
			            return;
                   }
                   
                   $jsonOutput->setData(1);
                   return;
           }

           $jsonOutput->setData("ok");
    }


    /*
       adds new candidate by request->input("candidate_type") - if it's "mayor" - then it
       will add it to 'municipal_election_mayor_candidates' table , and if it's "council" - then it
       will add it to 'municipal_election_council_candidates' table.

       @param $cityKey
       @param $campaignKey
       @param $request - request data that contains : 'candidate_type' , 'voter_key' , 'party_key' , 'phone_type_key' , 'shas'  , 'favorite'/'order'  
    */
    public function addNewCandidateByType(Request $request , $cityKey , $campaignKey){
         $jsonOutput = app()->make("JsonOutput");

         if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }

		 if($campaignKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		 }

         if($request->input('candidate_type') != 'mayor' && $request->input('candidate_type') != 'council'){
             $jsonOutput->setErrorCode(config('errors.elections.WRONG_CANDIDATE_TYPE'));
			 return;
         }

         if($request->input('party_key') == null || trim($request->input('party_key')) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_PARTY_KEY'));
		       return;
		 }
  

         if($request->input('voter_key') == null || trim($request->input('voter_key')) == ''){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
		       return;
		 }
        

         $electionCampaign = ElectionCampaigns::select('id' , 'name' )->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }

         $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
 

         $voter = Voters::select('id' , 'personal_identity' , 'first_name' , 'last_name','city')
             ->where('key' , $request->input('voter_key') )
             ->first();
         if(!$voter){
             $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			 return;

         }

         $municipalElectionParty = MunicipalElectionParties::select('id' , 'letters')->where('deleted' , 0)
		                                                   ->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)
														   ->where('key' , $request->input('party_key'))
														   ->first();
														   
		if(!$municipalElectionParty){
             $jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_PARTY_DOESNT_EXIST'));
			 return;

        }

        $historyDataArray = array(); 
        $modelChangedOldMayorFavorite = null;
        $historyPersmissionName = '';
        $historyObjectName='';
        $changedValues = [];

        //array_push($historyDataArray , ['voter_data','פרטי תושב' ,'', ($voter->first_name.' '.$voter->last_name)]);

        $voterPhone = null;
        if($request->input('phone_key') != null && trim($request->input('phone_key')) != ''){
            $voterPhone = VoterPhone::select('id' , 'phone_number')->where('voter_id' , $voter->id)
                ->where('key',$request->input('phone_key'))
                ->first();
        }else {
           $voterPhone = $this->addNewPhone($request->input('new_phone_number'), $voter->id, $changedValues);
        }

        if($voterPhone){
            $municipalElectionParty->voter_phone_id = $voterPhone->id;
               //array_push($historyDataArray , ['voter_phone_number','טלפון תושב' ,'', $voterPhone->phone_number]);
        }


        if($request->input('candidate_type') == 'mayor'){
              if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.mayor.add')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
              }

              $historyPersmissionName = 'elections.cities.parameters_candidates.candidates.mayor.add';
              $historyObjectName='CityMayorCandidate';
			  $existingVoterPerList = MunicipalElectionMayorCandidates::select('id')
                  ->where('city_id' , $city->city_id)
                  ->where('election_campaign_id' , $electionCampaign->id)
                  ->where('voter_id' , $voter->id)->where('deleted',0)
                  ->first();
			  if($existingVoterPerList ){
				   $jsonOutput->setErrorCode(config('errors.elections.VOTER_ALREADY_EXISTS_IN_CANDIDATES_LIST'));
			       return;
			  }

              $candidateModelName = 'MunicipalElectionMayorCandidates';
              $candidateTopicName = 'elections.cities.parameters_candidates.candidates.mayor.add';

              $newCandidate = new MunicipalElectionMayorCandidates;
              $newCandidate->key = Helper::getNewTableKey('municipal_election_mayor_candidates', 5);     
              $newCandidate->favorite = ($request->input('favorite') == '1' ? 1 : 0);
              //array_push($historyDataArray , ['favorite','מועדף' ,'', ($request->input('favorite') == '1' ? 'כן' : 'לא')]);

              $changedValues[] = [
                  'field_name' => 'favorite',
                  'display_field_name' => config('history.MunicipalElectionMayorCandidates.favorite'),
                  'new_numeric_value' => $newCandidate->favorite
              ];
			  if($request->input('favorite') == '1'){
					$oldMayorCandidate = MunicipalElectionMayorCandidates::where('deleted' , 0)
							->where('city_id' , $city->city_id)
							->where('election_campaign_id' , $electionCampaign->id)
							->where('favorite',1)
							->first();

							if($oldMayorCandidate ){
								//$historyArgsArr['models'][]
								$modelChangedOldMayorFavorite = [
									'description' => 'עדכון מועמד לראשות העיר',
									'referenced_model' => 'MunicipalElectionMayorCandidates',
									'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
									'referenced_id' => $oldMayorCandidate->id,
									'valuesList' => [
														[
															'field_name' => 'favorite',
															'display_field_name' => config('history.MunicipalElectionMayorCandidates.favorite'),
															'old_numeric_value' => 1,
															'new_numeric_value' => 0
														]
													]
								];
								MunicipalElectionMayorCandidates::where('deleted' , 0)
										->where('city_id' , $city->city_id)
										->where('election_campaign_id' , $electionCampaign->id)
										->where('id' , '=', $oldMayorCandidate->id )
										->update(array('favorite'=>0));
								}
			}
			  
        }
        else{
            if(!$this->isActionPermitted('elections.cities.parameters_candidates.candidates.council.add')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
            }
            $historyPersmissionName = 'elections.cities.parameters_candidates.candidates.council.add';
            $historyObjectName='CityCouncilCandidate';

            $candidateModelName = 'MunicipalElectionCouncilCandidates';
            $candidateTopicName = 'elections.cities.parameters_candidates.candidates.council.add';

            $newCandidate = new MunicipalElectionCouncilCandidates;
			$existingVoterPerList = MunicipalElectionCouncilCandidates::select('id')->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)
														   ->where('voter_id' , $voter->id)->where('deleted',0)->first();
			  if($existingVoterPerList ){
				   $jsonOutput->setErrorCode(config('errors.elections.VOTER_ALREADY_EXISTS_IN_CANDIDATES_LIST'));
			       return;
			  }
				
			
            $newCandidate->key = Helper::getNewTableKey('municipal_election_council_candidates', 5);
            $newCandidate->order = MunicipalElectionCouncilCandidates::where('deleted' , 0)
		                                                   ->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)->get()
                                                           ->count() + 1;

            $changedValues[] = [
                'field_name' => 'order',
                'display_field_name' => config('history.MunicipalElectionCouncilCandidates.order'),
                'new_numeric_value' => $newCandidate->order
            ];
		}
        //array_push($historyDataArray , ['election_campaign_name','שם קמפיין בחירות' ,'', $electionCampaign->name]);

        if($voterPhone){
            $newCandidate->voter_phone_id = $voterPhone->id;

            $changedValues[] = [
                'field_name' => 'voter_phone_id',
                'display_field_name' => config('history.' . $candidateModelName . '.voter_phone_id'),
                'new_numeric_value' => $newCandidate->voter_phone_id
            ];
        }

        $newCandidate->election_campaign_id = $electionCampaign->id;
        $newCandidate->city_id = $city->city_id;
        $newCandidate->voter_id = $voter->id;

        //array_push($historyDataArray , ['party_letters','אותיות שס' ,'', $municipalElectionParty->letters]);

        $newCandidate->municipal_election_party_id = $municipalElectionParty->id;
        $newCandidate->shas = ($request->input('shas') == '1' ? 1 : 0);
        if($request->input('shas') == '1'){$this->changeVoterShasRepresentative(null,$newCandidate->voter_id,$changedValues);}

        //array_push($historyDataArray , ['shas','שס' ,'', ($request->input('shas') == '1' ? 'כן' : 'לא')]);

        $newCandidate->save();
        //ActionController::AddHistoryItem($historyPersmissionName , $newCandidate->id, $historyObjectName, $historyDataArray);

        $candidateFields = [
            'election_campaign_id',
            'city_id',
            'voter_id',
            'municipal_election_party_id',
            'shas'
        ];

        for ( $fieldIndex = 0; $fieldIndex < count($candidateFields); $fieldIndex++ ) {
            $fieldName = $candidateFields[$fieldIndex];

            $changedValues[] = [
                'field_name' => $fieldName,
                'display_field_name' => config('history.' . $candidateModelName . '.' . $fieldName),
                'new_numeric_value' => $newCandidate->{$fieldName}
            ];
        }

        $historyArgsArr = [
            'topicName' => $candidateTopicName,
            'models' => [
                [
                    'referenced_model' => $candidateModelName,
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newCandidate->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];
		if($modelChangedOldMayorFavorite){
			$historyArgsArr['models'][] = $modelChangedOldMayorFavorite;
		}

        ActionController::AddHistoryItem($historyArgsArr);

		if($voterPhone){
			 $newCandidate->voter_phone_number = $voterPhone->phone_number;
		}

        $newCandidate->personal_identity = $voter->personal_identity;
        $newCandidate->first_name = $voter->first_name;
        $newCandidate->last_name = $voter->last_name;
        $newCandidate->voter_city = $voter->city;
        $newCandidate->party_letters = $municipalElectionParty->letters;
        $newCandidate->phones = VoterPhone::select('id' , 'key' , 'phone_number')->where('voter_id' , $voter->id)->get();

        $jsonOutput->setData($newCandidate);
    }

    /*
        function that finds voter by personal identity

        @param request->input('personal_identity')
    */
    public function searchVoterByPersonalIdentity(Request $request){
           $jsonOutput = app()->make("JsonOutput");
           if($request->input('personal_identity') == NULL ||  
               trim($request->input('personal_identity')) == '' ||
                           $request->input('personal_identity') <= 0 || 
                           !is_numeric($request->input('personal_identity')) || 
                           strpos($request->input('personal_identity') , ".") !== false ||
                           strlen($request->input('personal_identity')) > 9){
                  $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
		          return;
           }


           $fieldsToSelect = [
                               'voters.id' ,
                               'voters.key' ,
                               'voters.first_name' ,
                               'voters.last_name',
                               'voters.city' , 
                             ];
           $voter = Voters::select($fieldsToSelect)->withFilters()->where('personal_identity' , ltrim($request->input('personal_identity') , '0'))->first();
           if($voter){
               $voter->phones = VoterPhone::select(['id' , 'key' , 'phone_number'])->where('voter_id' , $voter->id)->get();

           }
           $jsonOutput->setData($voter);
    }

    /* 
	   update municipal_campaign_cities tables - selected party (if not null) , seats , trashold , questionaire text : 
	   
       @param request - may contain partyKey or null
	   @param cityKey
	   @param campaignKey
	*/	
    public function updateMunicipalElectionsCityDetails(Request $request , $cityKey , $campaignKey){
         $jsonOutput = app()->make("JsonOutput");

         if(!$this->isActionPermitted('elections.cities.parameters_candidates.parameters.edit')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
         }
         
         if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 if($campaignKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		 }

         $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }
		 
		 
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
         $historyDataArray = array(); 
         $municipalCampaignCity = MunicipalElectionCities::where('city_id' , $city->city_id )
             ->where('election_campaign_id' , $electionCampaign->id)
             ->first();

         $historyArgsArr = [
            'topicName' => 'elections.cities.parameters_candidates.parameters.edit',
            'models' => []
         ];

         if($request->input('party_key') == null || trim($request->input('party_key')) == ''){
              if($request->input('party_name') == null || trim($request->input('party_name')) == '' ){
			     $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_NAME'));
		         return;
		      }
		      if($request->input('letters') == null || trim($request->input('letters')) == '' ){
			     $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_LETTERS'));
		         return;
		      }
              
              if($municipalCampaignCity) {
                    $innerHistoryDataArray = array(); 
                    array_push($innerHistoryDataArray , ['name','שם מפלגה' ,'', $request->input('party_name')]);
                    
                    array_push($innerHistoryDataArray , ['letters','אותיות מפלגה' ,'', $request->input('letters')]);
                    array_push($innerHistoryDataArray , ['shas','שס' ,'', ($request->input('is_shas') == '1' ? 'כן':'לא')]);                    
     
                    $newMunicipalCampaignParty = new MunicipalElectionParties;
					$newMunicipalCampaignParty->city_id = $city->city_id;
					$newMunicipalCampaignParty->election_campaign_id = $electionCampaign->id;
					$newMunicipalCampaignParty->name = $request->input('party_name');
					$newMunicipalCampaignParty->letters = $request->input('letters');
					$newMunicipalCampaignParty->shas = ($request->input('is_shas') == '1' ? 1:0);
					$newMunicipalCampaignParty->key = Helper::getNewTableKey('municipal_election_parties', 5);
					$newMunicipalCampaignParty->save();

					/*ActionController::AddHistoryItem('elections.cities.parameters_candidates.council_parties.add',
                                                      $newMunicipalCampaignParty->id, 'CityCouncilParty', $innerHistoryDataArray);*/

                    $partyFields = [
                        'city_id',
                        'election_campaign_id',
                        'name',
                        'letters',
                        'shas'
                    ];

                    $changedValues = [];

                    for ( $fieldIndex = 0; $fieldIndex < count($partyFields); $fieldIndex++ ) {
                        $fieldName = $partyFields[$fieldIndex];

                        if ( 'letters' == $fieldName || 'shas' == $fieldName ) {
                            $changedValues[] = [
                                'field_name' => $fieldName,
                                'display_field_name' => config('history.MunicipalElectionParties.' . $fieldName),
                                'new_value' => $newMunicipalCampaignParty->{$fieldName}
                            ];
                        } else {
                            $changedValues[] = [
                                'field_name' => $fieldName,
                                'display_field_name' => config('history.MunicipalElectionParties.' . $fieldName),
                                'new_numeric_value' => $newMunicipalCampaignParty->{$fieldName}
                            ];
                        }
                    }

                  $historyArgsArr['models'][] = [
                      'referenced_model' => 'MunicipalElectionParties',
                      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                      'referenced_id' => $newMunicipalCampaignParty->id,
                      'valuesList' => $changedValues
                  ];

                    if($request->input('is_shas') == '1'){
                         $oldMunicipalShasParty = MunicipalElectionParties::where('deleted' , 0)
                             ->where('city_id' , $city->city_id)
                             ->where('election_campaign_id' , $electionCampaign->id)
                             ->where('key' , '<>', $newMunicipalCampaignParty->key )
                             ->where('shas' , 1)
                             ->first();
                         /*if($oldMunicipalShasParty ){
                               ActionController::AddHistoryItem('elections.cities.parameters_candidates.council_parties.edit',
                                                                 $oldMunicipalShasParty->id, 'CityCouncilParty',
                                                                 array(['shas' , 'שס' , 'כן' , 'לא']));
                         
                         }*/

                        $historyArgsArr['models'][] = [
                            'description' => 'עדכון שהמפלגה הזו אינה מפלגת ש"ס',
                            'referenced_model' => 'MunicipalElectionParties',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $oldMunicipalShasParty->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'shas',
                                    'display_field_name' => config('history.MunicipalElectionParties.shas'),
                                    'old_numeric_value' => 1,
                                    'new_numeric_value' => 0
                                ]
                            ]
                        ];

						 MunicipalElectionParties::where('deleted' , 0)
                             ->where('city_id' , $city->city_id)
                             ->where('election_campaign_id' , $electionCampaign->id)
                             ->where('key' , '<>', $newMunicipalCampaignParty->key )
                             ->update(array('shas'=>0));
                    }
                    
                    $oldShasParty = MunicipalElectionParties::where('deleted' , 0)
                        ->where('city_id' , $city->city_id)
                        ->where('election_campaign_id' , $electionCampaign->id)
                        ->where('id' ,$municipalCampaignCity->municipal_election_party_id)
                        ->first();

                    $changedValues = [];

                    if($oldShasParty){
                         array_push($historyDataArray , ['party_letters','אותיות מפלגה' ,$oldShasParty->letters,
                                    $request->input('letters')]);
                    } else{
                        array_push($historyDataArray , ['party_letters','אותיות מפלגה' ,'', $request->input('letters')]); 
                    }

                    if ( $newMunicipalCampaignParty->id != $municipalCampaignCity->municipal_election_party_id ) {
                        $changedValues[] = [
                            'field_name' => 'municipal_election_party_id',
                            'display_field_name' => config('history.MunicipalElectionCities.municipal_election_party_id'),
                            'old_numeric_value' => $municipalCampaignCity->municipal_election_party_id,
                            'new_numeric_value' => $newMunicipalCampaignParty->id
                        ];
                    }
                    $municipalCampaignCity->municipal_election_party_id = $newMunicipalCampaignParty->id;


                    if($request->input('hasima') != null && intval($request->input('hasima')) > 0){
                          if($municipalCampaignCity->election_threshold != $request->input('hasima')){
                              $changedValues[] = [
                                  'field_name' => 'election_threshold',
                                  'display_field_name' => config('history.MunicipalElectionCities.election_threshold'),
                                  'old_numeric_value' => $municipalCampaignCity->election_threshold,
                                  'new_numeric_value' => $request->input('hasima')
                              ];

                              $municipalCampaignCity->election_threshold = $request->input('hasima');
                          }
                    }

                    if($request->input('mandat') != null && intval($request->input('mandat')) > 0){
                          if($municipalCampaignCity->seats != $request->input('mandat')) {
                              $changedValues[] = [
                                  'field_name' => 'seats',
                                  'display_field_name' => config('history.MunicipalElectionCities.seats'),
                                  'old_numeric_value' => $municipalCampaignCity->seats,
                                  'new_numeric_value' => $request->input('mandat')
                              ];

                              $municipalCampaignCity->seats = $request->input('mandat');
                          }
                    }                    
 
                    if($request->input('questionaire_text') != null && trim($request->input('questionaire_text')) != ''){
                       if($municipalCampaignCity->questionnaire_initial_message != $request->input('questionaire_text')) {
                           $changedValues[] = [
                               'field_name' => 'questionnaire_initial_message',
                               'display_field_name' => config('history.MunicipalElectionCities.questionnaire_initial_message'),
                               'old_numeric_value' => $municipalCampaignCity->questionnaire_initial_message,
                               'new_numeric_value' => $request->input('questionaire_text')
                           ];

                           $municipalCampaignCity->questionnaire_initial_message = $request->input('questionaire_text');
                       }
                    }

                    $municipalCampaignCity->save();

                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'MunicipalElectionCities',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $municipalCampaignCity->id,
                        'valuesList' => $changedValues
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);

                    $jsonOutput->setData($newMunicipalCampaignParty); 
                    return;
             }
         }
         else{
                $newMunicipalCampaignParty = MunicipalElectionParties::where('key' ,$request->input('party_key'))
                    ->where('deleted',0)->where('city_id' , $city->city_id)
                    ->where('election_campaign_id' , $electionCampaign->id)
                    ->first();
                if($newMunicipalCampaignParty ){
                       if($municipalCampaignCity){
                           
                           $updatesCount = 0;

                           $changedValues = [];
                           
                           if($municipalCampaignCity->municipal_election_party_id != $newMunicipalCampaignParty->id){
                               $updatesCount++;
                               $oldShasParty = MunicipalElectionParties::where('deleted' , 0)
                                   ->where('city_id' , $city->city_id)
                                   ->where('election_campaign_id' , $electionCampaign->id)
                                   ->where('id' ,$municipalCampaignCity->municipal_election_party_id)
                                   ->first();
                               if($oldShasParty){
                                    array_push($historyDataArray , ['party_letters','אותיות מפלגה' ,$oldShasParty->letters, $newMunicipalCampaignParty->letters]); 
                               }
                               else{ 
                                    array_push($historyDataArray , ['party_letters','אותיות מפלגה' ,'', $newMunicipalCampaignParty->letters]); 
                               }

                               if ( $newMunicipalCampaignParty->id != $municipalCampaignCity->municipal_election_party_id ) {
                                   $changedValues[] = [
                                       'field_name' => 'municipal_election_party_id',
                                       'display_field_name' => config('history.MunicipalElectionCities.municipal_election_party_id'),
                                       'old_numeric_value' => $municipalCampaignCity->municipal_election_party_id,
                                       'new_numeric_value' => $newMunicipalCampaignParty->id
                                   ];
                               }
                               $municipalCampaignCity->municipal_election_party_id = $newMunicipalCampaignParty->id;
                           }
                           if($request->input('hasima') != null && intval($request->input('hasima')) > 0){
                             if($municipalCampaignCity->election_threshold != $request->input('hasima')){
                                 $updatesCount++;

                                 $changedValues[] = [
                                     'field_name' => 'election_threshold',
                                     'display_field_name' => config('history.MunicipalElectionCities.election_threshold'),
                                     'old_numeric_value' => $municipalCampaignCity->election_threshold,
                                     'new_numeric_value' => $request->input('hasima')
                                 ];

                                 $municipalCampaignCity->election_threshold = $request->input('hasima');
                              }
                           }

                           if($request->input('mandat') != null && intval($request->input('mandat')) > 0){
                             if($municipalCampaignCity->seats != $request->input('mandat')){
                                $updatesCount++;

                                $changedValues[] = [
                                     'field_name' => 'seats',
                                     'display_field_name' => config('history.MunicipalElectionCities.seats'),
                                     'old_numeric_value' => $municipalCampaignCity->seats,
                                     'new_numeric_value' => $request->input('mandat')
                                ];

                                $municipalCampaignCity->seats = $request->input('mandat');
                             }
                           }                    
 
                           if($request->input('questionaire_text') != null && trim($request->input('questionaire_text')) != ''){
                              if($municipalCampaignCity->questionnaire_initial_message != $request->input('questionaire_text')){
                                $updatesCount++;

                                $changedValues[] = [
                                      'field_name' => 'questionnaire_initial_message',
                                      'display_field_name' => config('history.MunicipalElectionCities.questionnaire_initial_message'),
                                      'old_numeric_value' => $municipalCampaignCity->questionnaire_initial_message,
                                      'new_numeric_value' => $request->input('questionaire_text')
                                ];

                                $municipalCampaignCity->questionnaire_initial_message = $request->input('questionaire_text');
                              }
                           }

                           if($updatesCount > 0){
                               $municipalCampaignCity->save();
                               /*ActionController::AddHistoryItem('elections.cities.parameters_candidates.parameters.edit',
                                                                 $municipalCampaignCity->id, 'CityParameterCandidates',
                                                                  $historyDataArray);*/
                           }

                           if ( count($changedValues) > 0 ) {
                               $historyArgsArr['models'][] = [
                                   'referenced_model' => 'MunicipalElectionCities',
                                   'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                   'referenced_id' => $municipalCampaignCity->id,
                                   'valuesList' => $changedValues
                               ];

                               ActionController::AddHistoryItem($historyArgsArr);
                           }

                           $municipalCampaignCity->party_data=MunicipalElectionParties::where('city_id' , $city->city_id)
                               ->where('election_campaign_id' , $electionCampaign->id)
                               ->where('deleted' , 0)
                               ->where('id' , $municipalCampaignCity->municipal_election_party_id)
                               ->first();

                           $jsonOutput->setData($municipalCampaignCity);
                           return ;
                       }
                }
                else{
                        $jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_PARTY_DOESNT_EXIST'));
                        return;

                }
         }

         
    }
	
				
	/* 
	   edit existing municipal city party : 
	   
       @param request - may contain letters/name/shas
	   @param cityKey
	   @param campaignKey
	   @param partyKey
	*/	
    public function editMunicipalElectionsCampaignParty(Request $request , $cityKey , $campaignKey , $partyKey){
          $jsonOutput = app()->make("JsonOutput");
		
          if(!$this->isActionPermitted('elections.cities.parameters_candidates.council_parties.edit')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
         }

		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 if($campaignKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		 }
		 
		 if($partyKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_PARTY_KEY'));
		       return;
		 }
		 
		 $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }
		 
		 
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
		 
		 $existingMunicipalCampaignParty = MunicipalElectionParties::select('id')
                  ->where('city_id' , $city->city_id)
                  ->where('election_campaign_id' , $electionCampaign->id)
				   ->where('key' , '<>' , $partyKey)
                  ->where(function($query) use ($request){
					  $query->where('name' , $request->input('name'))->orWhere('letters',$request->input('letters'));
				  })->where('deleted',0)
                  ->first();
		 if($existingMunicipalCampaignParty ){
				$jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_PARTY_ALREADY_EXISTS'));
			    return;
		 }
		 
		  $municipalElectionParty = MunicipalElectionParties::where('deleted' , 0)
		                                                   ->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)
														   ->where('key' , $partyKey)
														   ->first();
		$changedValues = [];

		if($municipalElectionParty){
             $historyDataArray = array(); 
             $numberOfUpdates = 0;
			 if($request->input('letters') != null && trim($request->input('letters')) != '' && strlen($request->input('name')) <= 10){
                 if($municipalElectionParty->letters != $request->input('letters')){
                       $numberOfUpdates ++;

                       $changedValues[] = [
                           'field_name' => 'letters',
                           'display_field_name' => config('history.MunicipalElectionParties.letters'),
                           'old_value' => $municipalElectionParty->letters,
                           'new_value' => $request->input('letters')
                       ];

                       $municipalElectionParty->letters = $request->input('letters');
                  }
             }

             if($request->input('name') != null && trim($request->input('name')) != '' && strlen($request->input('name')) <= 100){
                 if($municipalElectionParty->name != $request->input('name')){
                       $numberOfUpdates ++;

                       $changedValues[] = [
                          'field_name' => 'name',
                          'display_field_name' => config('history.MunicipalElectionParties.name'),
                          'old_value' => $municipalElectionParty->name,
                          'new_value' => $request->input('name')
                       ];

                       $municipalElectionParty->name = $request->input('name');
                  }
             }
             $shasRequest=$request->input('shas');
             if($shasRequest == '1' || $shasRequest == '0'){

                 if($municipalElectionParty->shas != $shasRequest){
                       $numberOfUpdates ++;

                       $changedValues[] = [
                          'field_name' => 'shas',
                          'display_field_name' => config('history.MunicipalElectionParties.shas'),
                          'old_numeric_value' => $municipalElectionParty->shas,
                          'new_numeric_value' => $shasRequest
                       ];

                       $municipalElectionParty->shas = $shasRequest;
                  }
             }

            if($numberOfUpdates > 0){
			    $municipalElectionParty->save();
                /*ActionController::AddHistoryItem('elections.cities.parameters_candidates.council_parties.edit',
                                                  $municipalElectionParty->id, 'CityCouncilParty', $historyDataArray);*/

                $historyArgsArr = [
                    'topicName' => 'elections.cities.parameters_candidates.council_parties.edit',
                    'models' => [
                        [
                            'referenced_model' => 'MunicipalElectionParties',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $municipalElectionParty->id,
                            'valuesList' => $changedValues
                        ]
                    ]
                ];

                if($request->input('shas') == '1'){
                      $oldShasParty = MunicipalElectionParties::where('deleted' , 0)
                          ->where('city_id' , $city->city_id)
                          ->where('election_campaign_id' , $electionCampaign->id)
                          ->where('key' , '<>', $partyKey)
                          ->where('shas',1)
                          ->first();

                      if($oldShasParty){
                            //ActionController::AddHistoryItem('elections.cities.parameters_candidates.council_parties.edit',
                                                              //$oldShasParty->id, 'CityCouncilParty', array(['shas','שס' , 'כן', 'לא']));

                          $historyArgsArr['models'][] = [
                              'description' => 'עדכון שהמפלגה הזו אינה מפלגת ש"ס',
                              'referenced_model' => 'MunicipalElectionParties',
                              'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                              'referenced_id' => $oldShasParty->id,
                              'valuesList' => [
                                  [
                                      'field_name' => 'shas',
                                      'display_field_name' => config('history.MunicipalElectionParties.shas'),
                                      'old_numeric_value' => 1,
                                      'new_numeric_value' => 0
                                  ]
                              ]
                          ];
                      }

                      MunicipalElectionParties::where('deleted' , 0)
                          ->where('city_id' , $city->city_id)
                          ->where('election_campaign_id' , $electionCampaign->id)
                          ->where('key' , '<>', $partyKey)
                          ->update(array('shas'=>0));
                }

                if ( count($historyArgsArr['models']) > 0 ) {
                    ActionController::AddHistoryItem($historyArgsArr);
                }
            }
			$jsonOutput->setData("ok");
        
		}
		else{
			$jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_PARTY_DOESNT_EXIST'));
			 
		}
    }
					
	/* 
	   delete existing municipal city party : 
	   
	   @param cityKey
	   @param campaignKey
	   @param partyKey
	*/	
	public function deleteMunicipalElectionsCampaignParty($cityKey , $campaignKey , $partyKey){
		$jsonOutput = app()->make("JsonOutput");
		
        if(!$this->isActionPermitted('elections.cities.parameters_candidates.council_parties.delete')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
         }

		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 if($campaignKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		 }
		 
		 if($partyKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_PARTY_KEY'));
		       return;
		 }
		 
		 $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }
		 
		
		 
		 
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
		  
          

		  $municipalElectionParty = MunicipalElectionParties::where('deleted' , 0)
		                                                   ->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)
														   ->where('key' , $partyKey)
														   ->first();
														   
		if($municipalElectionParty){
             $municipalElectionCity = MunicipalElectionCities::where('municipal_election_party_id' , $municipalElectionParty->id)
		                                                   ->where('city_id' , $city->city_id)
														   ->where('election_campaign_id' , $electionCampaign->id)
                                                           ->first();
			 if($municipalElectionCity){
                // dont delete if party is connected to municipalElectionCity :
                $jsonOutput->setErrorCode(config('errors.elections.CANT_DELETE_PARTY_THAT_IS_USED_IN_CITY'));
             }	
             else{										   
			    $municipalElectionParty->deleted = 1;
			    $municipalElectionParty->save();

                $historyArgsArr = [
                    'topicName' => 'elections.cities.parameters_candidates.council_parties.delete',
                    'models' => [
                        [
                            'referenced_model' => 'MunicipalElectionParties',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $municipalElectionParty->id
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);

                $jsonOutput->setData("ok");
             }
		}
		else{
			$jsonOutput->setErrorCode(config('errors.elections.ELECTION_CAMPAIGN_PARTY_DOESNT_EXIST'));
			 
		}
		 
		 
	}
							
	
   /* 
	   add new municipal city party to city's election campaign : 
	   @param request - post params : name , letters , is_shas
	   @param cityKey
	   @param campaignKey
	*/	
	public function addMunicipalElectionsCampaignParty(Request $request , $cityKey , $campaignKey){
 
		$jsonOutput = app()->make("JsonOutput");
        		 
         if(!$this->isActionPermitted('elections.cities.parameters_candidates.council_parties.add')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
         }

		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 if($campaignKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
		       return;
		 }
		 if($request->input('name') == null || trim($request->input('name')) == '' ){
			 $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_NAME'));
		       return;
		 }
		 if($request->input('letters') == null || trim($request->input('letters')) == '' ){
			 $jsonOutput->setErrorCode(config('errors.elections.MISSING_ELECTION_CAMPAIGN_LETTERS'));
		       return;
		 }
		 
		 $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }
		 
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
		 
		 $existingMunicipalCampaignParty = MunicipalElectionParties::select('id')
                  ->where('city_id' , $city->city_id)
                  ->where('election_campaign_id' , $electionCampaign->id)
                  ->where(function($query) use ($request){
					  $query->where('name' , $request->input('name'))->orWhere('letters',$request->input('letters'));
				  })->where('deleted',0)
                  ->first();
		 if($existingMunicipalCampaignParty ){
				$jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_PARTY_ALREADY_EXISTS'));
			    return;
		 }
		 
		 $historyDataArray = array(); 
         array_push($historyDataArray , ['name','שם מפלגה' ,'', $request->input('name')]);
         array_push($historyDataArray , ['letters','אותיות מפלגה' ,'', $request->input('letters')]);
         array_push($historyDataArray , ['shas','שס' ,'', ($request->input('is_shas') == '1' ? 'כן':'לא')]);
		 
		 $newMunicipalCampaignParty = new MunicipalElectionParties;
		 $newMunicipalCampaignParty->city_id = $city->city_id;
		 $newMunicipalCampaignParty->election_campaign_id = $electionCampaign->id;
		 $newMunicipalCampaignParty->name = $request->input('name');
		 $newMunicipalCampaignParty->letters = $request->input('letters');
		 $newMunicipalCampaignParty->shas = ($request->input('is_shas') == '1' ? 1:0);
		 $newMunicipalCampaignParty->key = Helper::getNewTableKey('municipal_election_parties', 5);
		 $newMunicipalCampaignParty->save();

		 $changedValues = [];
		 $partyFields = [
             'city_id',
             'election_campaign_id',
             'name',
             'letters',
             'shas'
         ];

		 for ( $fieldIndex = 0; $fieldIndex < count($partyFields); $fieldIndex++ ) {
             $fieldName = $partyFields[$fieldIndex];

             if ( 'name' == $fieldName || 'letters' == $fieldName ) {
                 $changedValues[] = [
                     'field_name' => $fieldName,
                     'display_field_name' => config('history.MunicipalElectionParties.' . $fieldName),
                     'new_value' => $newMunicipalCampaignParty->{$fieldName}
                 ];
             } else {
                 $changedValues[] = [
                     'field_name' => $fieldName,
                     'display_field_name' => config('history.MunicipalElectionParties.' . $fieldName),
                     'new_numeric_value' => $newMunicipalCampaignParty->{$fieldName}
                 ];
             }
         }

        $historyArgsArr = [
            'topicName' => 'elections.cities.parameters_candidates.council_parties.add',
            'models' => [
                [
                    'referenced_model' => 'MunicipalElectionParties',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newMunicipalCampaignParty->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        if($request->input('is_shas') == '1'){
            $oldShasCouncilParty = MunicipalElectionParties::where('deleted' , 0)
                ->where('city_id' , $city->city_id)
                ->where('election_campaign_id' , $electionCampaign->id)
                ->where('key' , '<>', $newMunicipalCampaignParty->key )
                ->where('shas',1)
                ->first();

            if($oldShasCouncilParty ){
                $historyArgsArr['models'][] = [
                    'description' => 'עדכון מפלגת ש"ס',
                    'referenced_model' => 'MunicipalElectionParties',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $oldShasCouncilParty->id,
                    'valuesList' => [
                        [
                            'field_name' => 'shas',
                            'display_field_name' => config('history.MunicipalElectionParties.shas'),
                            'old_numeric_value' => 1,
                            'new_numeric_value' => 0
                        ]
                    ]
                ];
            }

            MunicipalElectionParties::where('deleted' , 0)
                ->where('city_id' , $city->city_id)
                ->where('election_campaign_id' , $electionCampaign->id)
                ->where('key' , '<>', $newMunicipalCampaignParty->key )
                ->update(array('shas'=>0));


        }

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($newMunicipalCampaignParty);
	}
							
    /* 
	   get municipal parties , cities and other data by city key and campaign id
	   
	   @param cityKey
	   @param campaignKey
	*/
    public function loadMunicipalElectionsCampaignData($cityKey , $campaignKey){
		$jsonOutput = app()->make("JsonOutput");
		
         if(!$this->isActionPermitted('elections.cities.parameters_candidates')){
                $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                return;
         }

		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
		 
		 $electionCampaign = ElectionCampaigns::select('id')->where('key' , $campaignKey)->where('type' , 1)->first();
		 if(!$electionCampaign){
			 $jsonOutput->setErrorCode(config('errors.elections.MUNICIPAL_ELECTION_CAMPAIGN_DOESNT_EXIST'));
			 return;
		 }
		 
		$arrayData = array();
		$municipalElectionCitiesFields = ['id','key','municipal_election_party_id' , 'seats', 'election_threshold','questionnaire_initial_message'];
		$municipalElectionsCityParty= MunicipalElectionCities::select($municipalElectionCitiesFields)->where('city_id' , $city->city_id)->where('election_campaign_id' , $electionCampaign->id)->first();
		if(!$municipalElectionsCityParty){
			$municipalElectionsCityParty = new MunicipalElectionCities;
			$municipalElectionsCityParty->election_campaign_id = $electionCampaign->id;
			$municipalElectionsCityParty->city_id = $city->city_id;
			$municipalElectionsCityParty->key = Helper::getNewTableKey('municipal_election_cities', 10);
			$municipalElectionsCityParty->save();
		}
        if($this->isActionPermitted('elections.cities.parameters_candidates.parameters')){
			$municipalElectionsCityParty->partyData=MunicipalElectionParties::where('city_id' , $city->city_id)->where('election_campaign_id' , $electionCampaign->id)->where('deleted' , 0)->where('id' , $municipalElectionsCityParty->municipal_election_party_id)->first();
			$arrayData["municipal_election_city"] = $municipalElectionsCityParty;
		}
        else{
            $arrayData["municipal_election_city"]=array();
        }

        if($this->isActionPermitted('elections.cities.parameters_candidates.council_parties')){	
			$municipalElectionPartiesFields = ['id','key','name' , 'letters', 'shas'];
			$municipalElectionsParty= MunicipalElectionParties::select($municipalElectionPartiesFields)
		                          ->where('city_id' , $city->city_id)
								  ->where('election_campaign_id' , $electionCampaign->id)
								  ->where('deleted' , 0)->get();
			$arrayData["municipal_election_parties"] = $municipalElectionsParty;
        }
        else{
            $arrayData["municipal_election_parties"]=array();
        }

        if($this->isActionPermitted('elections.cities.parameters_candidates.candidates.mayor')){	
			$mayorCandidatesFieldsToSelect = [
             'municipal_election_mayor_candidates.id as id' , 
             'municipal_election_mayor_candidates.key as key' ,
             'municipal_election_mayor_candidates.voter_id as voter_id' , 
             'municipal_election_mayor_candidates.voter_phone_id as voter_phone_id',
             'municipal_election_mayor_candidates.municipal_election_party_id as municipal_election_party_id' , 
             'municipal_election_mayor_candidates.shas as shas' , 
             'municipal_election_mayor_candidates.favorite as favorite',
             'voters.first_name',
             'voters.last_name',
			 'voters.key as voter_key',
             'voters.personal_identity',
             'voters.city as voter_city',
             'municipal_election_parties.id as party_id',
             'municipal_election_parties.key as party_key',
             'municipal_election_parties.name as party_name' , 
             'municipal_election_parties.letters as party_letters',
			];
            $arrayData["mayor_candidates"] = MunicipalElectionMayorCandidates::select($mayorCandidatesFieldsToSelect)->with('phones')
            ->where('municipal_election_mayor_candidates.deleted',0)->where('municipal_election_mayor_candidates.city_id' , $city->city_id)
            ->where('municipal_election_mayor_candidates.election_campaign_id' , $electionCampaign->id)->withVoter()->withParty()->get();
         }
         else{
               $arrayData["mayor_candidates"] = array();

         }

         if($this->isActionPermitted('elections.cities.parameters_candidates.candidates.council')){
			$councilCandidatesFieldsToSelect = [
             'municipal_election_council_candidates.id as id' , 
			 'municipal_election_council_candidates.order as order',
             'municipal_election_council_candidates.key as key' ,
             'municipal_election_council_candidates.voter_id as voter_id' , 
             'municipal_election_council_candidates.voter_phone_id as voter_phone_id',
             'municipal_election_council_candidates.municipal_election_party_id as municipal_election_party_id' , 
             'municipal_election_council_candidates.shas as shas' , 
             'municipal_election_council_candidates.order as order',
             'municipal_election_council_candidates.voter_phone_id',
             'voters.first_name',
             'voters.last_name',
			 'voters.key as voter_key',
             'voters.personal_identity',
             'voters.city as voter_city',
             'municipal_election_parties.id as party_id',
             'municipal_election_parties.key as party_key',
             'municipal_election_parties.name as party_name' , 
             'municipal_election_parties.letters as party_letters',
			];
             $arrayData["council_candidates"] = MunicipalElectionCouncilCandidates::select($councilCandidatesFieldsToSelect)
             ->with('phones')->where('municipal_election_council_candidates.deleted',0)->where('municipal_election_council_candidates.city_id' , $city->city_id)
             ->where('municipal_election_council_candidates.election_campaign_id' , $electionCampaign->id)->withVoter()->withVoterPhone()->withParty()
             ->orderBy('municipal_election_council_candidates.order' , 'ASC')->get();
          }
          else{
              $arrayData["council_candidates"] = array();
          }

		$jsonOutput->setData($arrayData);
	}

    /* return all teams */

    public function getTeams() {

        $jsonOutput = app()->make("JsonOutput");
        $result = Teams::select('teams.key', 'teams.name', 'teams.leader_id', 'voters.first_name AS leader_first_name', 'voters.last_name AS leader_last_name')
                        ->where('teams.deleted', 0)->withUser()->get();
		for($i = 0 ; $i < count($result);$i++){
			$result[$i]->leader_user_phones = UserPhones::where('user_id' , $result[$i]->leader_id)->where('deleted' , 0)->get();
		}
	 		 
        $jsonOutput->setData($result);
    }
	
	/*
	    private function that checks if city is permitted to user editing : 
		
		@param city
	*/
	private function isAllowedCityForUser($city){

        $userGeoFilters = GeoFilterService::getGeoFiltersForUser(null, false, false, true);
	    // dd(in_array($city->city_id, $userGeoFilters['citiesIDS']), $city->city_id);	 
		return in_array($city->city_id, $userGeoFilters['citiesIDS']) ;
	}

    /*
	function that returns basic city data by city key
	
	@param cityKey
	*/
    public function getCityData($cityKey){
         $jsonOutput = app()->make("JsonOutput");
		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
         $requestTeamFields = [ // City requests team
            'crm_team.id as crm_team_id' ,
            'crm_team.key as crm_team_key',
            'crm_team.name as crm_team_name'
        ];
         $city = City::select($this->cityFieldsList)->addSelect($requestTeamFields)
         ->withAreaAndSubArea()->withTeam()->withRequestsTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 		 
         $isAllowed = $this->isAllowedCityForUser($city);
		 
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }
		 $jsonOutput->setData($city);
	}	
	
	/*
		Function that updates city data by cityKey and POST data
	*/
	public function updateCityData(Request $request , $cityKey){
		$jsonOutput = app()->make("JsonOutput");
         if($request->input('is_headquarters_phone_number') != '1'){
			if(!Auth::user()->admin){ // check if updater  user is admin
				$jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'));
				return;
			}
         }
		 if($cityKey == null){
			   $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
		       return;
		 }
		 $city = City::select($this->cityFieldsList)->withAreaAndSubArea()->withTeam()->where('cities.key' ,$cityKey)->first();
		 if(!$city){
			 $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			 return;
		 }
		 $isAllowed = $this->isAllowedCityForUser($city);
		  
		 if(!$isAllowed ){
			 $jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			 return;
		 }


         if($request->input('is_headquarters_phone_number') == '1'){
            if(!$this->isActionPermitted('elections.cities.roles.shas.headquarter_phone.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
            $oldHeadquartersPhone = City::select('id','headquarters_phone_number')->where('key',$cityKey )->first();
            if($request->input('headquarters_phone_number') != null && trim($request->input('headquarters_phone_number')) != ''){
                     if(Helper::isIsraelPhone($request->input('headquarters_phone_number'))){
                        /*if($oldHeadquartersPhone){
                             ActionController::AddHistoryItem('elections.cities.roles.shas.headquarter_phone.edit',
                                                               $oldHeadquartersPhone->id, 'CityHeadquarterPhone',
                                                               array(['headquarter_phone_number','מספר טלפון מטה',
                                                                      $oldHeadquartersPhone->headquarter_phone_number,
                                                                      $request->input('headquarters_phone_number') ]));
                        }*/

                        if ( $request->input('headquarters_phone_number') != $oldHeadquartersPhone->headquarters_phone_number ) {
                            $historyArgsArr = [
                                'topicName' => 'elections.cities.parameters_candidates.parameters.edit',
                                'models' => [
                                    [
                                        'referenced_model' => 'City',
                                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                        'referenced_id' => $city->city_id,
                                        'valuesList' => [
                                            [
                                                'field_name' => 'headquarters_phone_number',
                                                'display_field_name' => config('history.City.headquarters_phone_number'),
                                                'old_value' => $oldHeadquartersPhone->headquarters_phone_number,
                                                'new_value' => $request->input('headquarters_phone_number')
                                            ]
                                        ]
                                    ]
                                ]
                            ];

                            ActionController::AddHistoryItem($historyArgsArr);
                        }

                        City::where('key',$cityKey )->update(['headquarters_phone_number'=>$request->input('headquarters_phone_number')]);
                     }
                     else{
                           $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                     }
            }
            else{
                if ( !is_null($city->headquarters_phone_number) ) {
                    $historyArgsArr = [
                        'topicName' => 'elections.cities.parameters_candidates.parameters.edit',
                        'models' => [
                            [
                                'referenced_model' => 'City',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $city->city_id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'headquarters_phone_number',
                                        'display_field_name' => config('history.City.headquarters_phone_number'),
                                        'old_value' => $city->headquarters_phone_number
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

				City::where('key',$cityKey )->update(['headquarters_phone_number'=>NULL]);
            }
         }
         elseif($request->input('is_assign_leader_phone_number') == '1'){
			if(!$this->isActionPermitted('elections.cities.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
            $oldPhone = City::select('id','assign_leader_phone_number')->where('key',$cityKey )->first();
            if($request->input('assign_leader_phone_number') != null && trim($request->input('assign_leader_phone_number')) != ''){
                     if(Helper::isIsraelPhone($request->input('assign_leader_phone_number'))){
                        

                        if ( $request->input('assign_leader_phone_number') != $oldPhone->assign_leader_phone_number ) {
                            $historyArgsArr = [
                                'topicName' => 'elections.cities.edit',
                                'models' => [
                                    [
                                        'referenced_model' => 'City',
                                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                        'referenced_id' => $city->city_id,
                                        'valuesList' => [
                                            [
                                                'field_name' => 'assign_leader_phone_number',
                                                'display_field_name' => config('history.City.assign_leader_phone_number'),
                                                'old_value' => $oldPhone->assign_leader_phone_number,
                                                'new_value' => $request->input('assign_leader_phone_number')
                                            ]
                                        ]
                                    ]
                                ]
                            ];

                            ActionController::AddHistoryItem($historyArgsArr);
                        }

                        City::where('key',$cityKey )->update(['assign_leader_phone_number'=>$request->input('assign_leader_phone_number')]);
                     }
                     else{
                           $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                     }
            }
            else{
                if ( !is_null($city->assign_leader_phone_number) ) {
                    $historyArgsArr = [
                        'topicName' => 'elections.cities.edit',
                        'models' => [
                            [
                                'referenced_model' => 'City',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $city->city_id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'assign_leader_phone_number',
                                        'display_field_name' => config('history.City.assign_leader_phone_number'),
                                        'old_value' => $city->assign_leader_phone_number
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

				City::where('key',$cityKey )->update(['assign_leader_phone_number'=>NULL]);
            }
		 }
         elseif($request->input('is_assign_leader_email') == '1'){
			if(!$this->isActionPermitted('elections.cities.edit')){
						          $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
						          return;
            }
            $oldPhone = City::select('id','assign_leader_email')->where('key',$cityKey )->first();
            if($request->input('assign_leader_email') != null && trim($request->input('assign_leader_email')) != ''){
                     if(Helper::isValidEmail($request->input('assign_leader_email'))){
                        

                        if ( $request->input('assign_leader_email') != $oldPhone->assign_leader_email ) {
                            City::where('key',$cityKey )->update(['assign_leader_email'=>$request->input('assign_leader_email')]);
                        }
                     }else{
                           $jsonOutput->setErrorCode(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));
                     }
            }
            else{
                if ( !is_null($city->assign_leader_phone_number) ) {
                    $historyArgsArr = [
                        'topicName' => 'elections.cities.edit',
                        'models' => [
                            [
                                'referenced_model' => 'City',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $city->city_id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'assign_leader_phone_number',
                                        'display_field_name' => config('history.City.assign_leader_phone_number'),
                                        'old_value' => $city->assign_leader_phone_number
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

				City::where('key',$cityKey )->update(['assign_leader_phone_number'=>NULL]);
            }
		 }
		 else{
			if($request->input('team_key')){
			 $team = Teams::select('id')->where('deleted' , 0)->where('key' , $request->input('team_key'))->first();
             if($team){
                  $updatesArray = array();
                  $teamFieldName = $request->input('change_crm_team') ? 'crm_team_id' : 'team_id';
				  $updatesArray[$teamFieldName] = $team->id ;

				  if ( $team->id != $city->team_id ) {
                      $historyArgsArr = [
                          'topicName' => 'elections.cities.parameters_candidates.parameters.edit',
                          'models' => [
                              [
                                  'referenced_model' => 'City',
                                  'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                  'referenced_id' => $city->city_id,
                                  'valuesList' => [
                                      [
                                          'field_name' => $teamFieldName,
                                          'display_field_name' => config("history.City.$teamFieldName"),
                                          'old_numeric_value' => $city->team_id,
                                          'new_numeric_value' => $team->id
                                      ]
                                  ]
                              ]
                          ]
                      ];

                      ActionController::AddHistoryItem($historyArgsArr);
                  }

				  City::where('key',$cityKey )->update($updatesArray);
			 }
             else{
				  $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS'));
			      return;
             }	
			}
			else{
			    $updatesArray['team_id'] =NULL ;

			    if ( !is_null($city->team_id) ) {
                    $historyArgsArr = [
                        'topicName' => 'elections.cities.parameters_candidates.parameters.edit',
                        'models' => [
                            [
                                'referenced_model' => 'City',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $city->city_id,
                                'valuesList' => [
                                    [
                                        'field_name' => 'team_id',
                                        'display_field_name' => config('history.City.team_id'),
                                        'old_numeric_value' => $city->team_id
                                    ]
                                ]
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }

				City::where('key',$cityKey )->update($updatesArray);
				 
			}
         }
		 $jsonOutput->setData('ok');
	}
	public function updateCityRequestTopic(Request $request, $cityKey, $topicKey){
        $jsonOutput = app()->make("JsonOutput");
        $sourceScreen = 'cities'; 

        $topic = RequestTopic::select('request_topics.*')->where('deleted', 0)->where('request_topics.key', $topicKey)->first();

        if(!$topic){ $jsonOutput->setErrorCode(config('errors.crm.REQUEST_TOPIC_NOT_EXISTS')); return;}

        $city = City::where('key', $cityKey)->where('deleted', 0)->first();
        if(!$city){ $jsonOutput->setErrorCode(config('errors.global.CITY_NOT_EXISTS')); return;}

        $result = HelpFunctions::updateRequestTopicUserHandler($jsonOutput, $sourceScreen, $topic->id, $city->id, $request->input('user_handler_id'), null);
        
        if(!$result){ return; }
        $jsonOutput->setData('ok');
    }
    /*
         Private function that gets as parameter operation name , and checks if user has permission for it.

         @param $operationName  
     */
    private function isActionPermitted($operationName){
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
    /**
     * @metho addNewPhone
     *
     * @param [int] $newPhoneNumber - new phone number.
     * @param [string] $voterId - phone voter id.
     * @param [array] $changedValues - history array.
     * @return [object] - the new phone object.
     */
    private function addNewPhone($newPhoneNumber,$voterId,&$changedValues){
       if(!empty($newPhoneNumber)){
            $voterPhone = new VoterPhone;
            $voterPhone->voter_id = $voterId;
            $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
            $voterPhone->phone_type_id = 2;
            $voterPhone->phone_number = $newPhoneNumber;
            $voterPhone->save();
            $this->addToHistory($changedValues,'phone_number', 'history.VoterPhone.phone_number', $newPhoneNumber);
            
            return $voterPhone;
       }
    }
    /**
     * @method changeVoterShasRepresentative 
     *  Update Voter "shas representative" status
     *  -> set the Voter shas status to '1' only!
     *
     * @param [Model] $voter - Voter model if exist.
     * @param [string] $voterId - voter id to get voter model (if no Voter model).
     * @param [array] $changedValues - history array.
     * @return void
     */
    private function changeVoterShasRepresentative( $voter = null,$voterId = null,&$changedValues){
        if(!$voter){
            $voter = Voters::select('id','shas_representative')->where('id',$voterId)->first();
        }
        if($voter && $voter->shas_representative == 0){
                $voter->shas_representative = 1;
                $voter->save();
                $this->addToHistory($changedValues,'shas_representative', 'history.Voters.shas_representative', 1, 0);
            }
        }
        /**
         * @method addToHistory
         * add item to history array.
         * 
         * @param [array] $changedValues - history array.
         * @param [string] $field_name -
         * @param [string] $display_field_name -to get from history config.
         * @param [*] $new_numeric_value
         * @param [*] $old_numeric_value
         * @return void
         */
        private function addToHistory(&$changedValues,$field_name, $display_field_name, $new_numeric_value, $old_numeric_value=null){
                $data = [
                    'field_name' => $field_name,
                    'display_field_name' => config($display_field_name),
                    'new_numeric_value' => $new_numeric_value,
                ];

                if($old_numeric_value){
                    $data['old_numeric_value']=$old_numeric_value;
                }
                  $changedValues[] = $data;
        }
}