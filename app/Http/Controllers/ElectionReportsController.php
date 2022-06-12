<?php

namespace App\Http\Controllers;

use Sms;

use App\Libraries\Services\ExportService;
use App\Libraries\Services\VoterFilterQueryService;
use App\Libraries\Helper;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\GeneralReportSystemReserved;
use App\Models\Questionaires;
use App\Models\ElectionCampaigns;
use App\Models\Cluster;
use App\Models\Message;
use App\Models\RolesByUsers;
use App\Models\PhoneTypes;
use App\Models\SupportStatus;

class ElectionReportsController extends Controller
{
    const DETAILED_REPORT = 'detailed';
    const COMBINED_REPORT = 'combined';
	const SAVED_REPORT = 'saved';
    const VOTER_LIMIT = 2000;
	const VOTER_PHONE_TYPE_HOME=1;
    const VOTER_PHONE_TYPE_MOBILE=2;
    private $colsElectionCampaignsHash;
    private $supportStatusCombineColumns = [
        'support_status_election',
        'support_status_tm',
        'support_status_final',

        'previous_knesset_support_status_election',
        'previous_municipal_support_status_election',

        'previous_knesset_support_status_tm',
        'previous_municipal_support_status_tm',

        'previous_knesset_support_status_final',
        'previous_municipal_support_status_final'
    ];
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
        $this->fullClusterNameInnerQuery = Cluster::getClusterFullNameQuery('',false);
    }

	/*
		Function that returns all questionairs
	*/
	public function getAllQuestionaires(){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setData(Questionaires::select('id' , 'key' , 'name')->where('deleted' , 0)->where('campaign_id',ElectionCampaigns::currentLoadedVotersCampaign()['id'])->get());
	}
	
	/*
		Function that returns  all types of saved reports
	*/
	public function getAllSaveReportsTypes(){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setData(GeneralReportSystemReserved::select('id' , 'key' , 'name' , 'system_name')->get());
	}
	
    /**
     * Function that generates and returns general report
     *
     * @param Request $request
     * @return void
     */
    public function generalReport(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        $result = [];

        $onlyCount = $request->input('only_count', false);
        
        if ($request->input('report_type') == self::SAVED_REPORT && $request->input('report_system_name')=='questionairs' && ($request->input('questionaireID') == null || trim($request->input('questionaireID')) == '')) {
                          $jsonOutput->setErrorCode(config('errors.elections.QUESTIONAIRE_ID_REQUIRED'));
                          return;
        }

        $query = $this->setReportParameters($request, $onlyCount);
        // dump(array('sql'=>$query->toSql(),'Bindings'=>$query->getBindings()));
        // dd($query->get());
        $user = Auth::user();

         if ($query) {
            if ($request->input('report_type') == self::COMBINED_REPORT) { 
			
                $result['data'] = $query->get();
                $result['count'] = VoterFilterQueryService::getCountFromQuery($query);

				
                $combineColumns = $request->input('combine_columns',false); 
		 
                $combineBy = $request->input('combine_by',false);
                    if(!$combineColumns){
                        $result['sums'] = VoterFilterQueryService::getSumsFromCombinedQuery($query, $combineBy);
                    }else if(in_array($combineColumns, $this->supportStatusCombineColumns)){
                        $result['sums'] = VoterFilterQueryService::getSumsFromCombinedQuery($query, $combineBy, true );
                    }

            }else{
                $page = $request->input('current_load_index');
                $rowsToLoad = $request->input('results_per_load');
                $maxResultsCount = $request->has('max_results_count') ? $request->input('max_results_count') : false;
                $skip = $page * $rowsToLoad;
         
                if ($maxResultsCount) {
                    $query->limit($maxResultsCount);
                    $rowsToLoad = ($maxResultsCount < $rowsToLoad) ? $maxResultsCount : $rowsToLoad;
                }
                if ($page == 0) {
                    $result['count'] = VoterFilterQueryService::getCountFromQuery($query);
    
                }
                // Limit regular user to 2000 results
                if (!$user->admin) {
                    if ($skip >= self::VOTER_LIMIT) {
                        $rowsToLoad = 0;
                    } else if ($skip + $rowsToLoad >= self::VOTER_LIMIT) {
                        $rowsToLoad = self::VOTER_LIMIT - $skip;
                    }
    
                }
    
                if ($onlyCount) {
					 
                    $result['data'] = [];
                } else {
                     $result['data'] = $query->skip($skip)->take($rowsToLoad)->get();
                }
                
                if ($request->input('report_type') == self::SAVED_REPORT) { 
                    $result['header_columns'] = $this->getSaveReportCols( $request->input('report_system_name'));
                }
            }

        }
        $userId = $user->id;
        if($userId == 477 || $userId =626){ // Send sql query to client - for amichai torm. 
            $sql = $query->toSql();
            $bindings = $query->getBindings();
            $result['query'] = $sql;
            $result['bindings'] = $bindings;
        }
        $jsonOutput->setData($result);
    }
    /**
     * @method getSaveReportCols
     * - Define report display cols for display in client. 
     * @param [string] $report_system_name - save report 
     * @return [array] $result_header_columns -> report cols for display.
     */
    private function getSaveReportCols($report_system_name){
        $result_header_columns = [];
        switch($report_system_name){
            case 'mailing_addresses' :
                $result_header_columns = array(["name"=>"household_id" , "label"=>"מס' בית אב"] 
                                                   , ["name"=>"last_name" , "label"=>'שם משפחה' , "sortDirection"=>"asc" , "sortNumber"=>"1"]
                                                   , ["name"=>"city" , "label"=>'עיר']   
                                                   , ["name"=>"street" , "label"=>'רחוב']  
                                                   , ["name"=>"house" , "label"=>'בית']  
                                                   , ["name"=>"house_entry" , "label"=>'כניסה']  
                                                   , ["name"=>"flat" , "label"=>'דירה'] 
                                                     , ["name"=>"zip" , "label"=>'מיקוד']  
                                                   , ["name"=>"household_members_count" , "label"=>'מספר כרטיסים'] 														  
                                                  );
                break;
            case 'questionairs' :
              
                $result_header_columns = array(["name"=>"voter_name_identity_and_city" , "label"=>'תושב'] 
                                                   , ["name"=>"elections_voter_support_status_name" , "label"=>'סטטוס סניף'] 
                                                   , ["name"=>"tm_voter_support_status_name" , "label"=>'סטטוס TM']
                                                   , ["name"=>"city_name" , "label"=>'עיר תושב']  
                                                   , ["name"=>"portion_name" , "label"=>'שם מנה']  
                                                     , ["name"=>"datetime" , "label"=>'תאריך ושעת מנה'] 
                                                   , ["name"=>"voter_answers_to_questionairs" , "label"=>'שאלות לסקרים שנענו']  
                                                 //  , ["name"=>"id" , "label"=>'מזהה בוחר']  
                                                   
                                                  );
                break;
            case 'sms' :
                $result_header_columns = array(["name"=>"phone_number" , "label"=>'מספר לשליחת SMS'] 
                                                                            
                                                  );
                break;
           case 'captain50' :
                $result_header_columns = array(["name"=>"cap_50" , "label"=>'שר מאה'] ,
                                                  ["name"=>"personal_id" , "label"=>'ת.ז. שר מאה'],
                                                  ["name"=>"cap50_households_count" , "label"=>"מס' בתי אב  שנותרו לשיבוץ"],	
                                                  ["name"=>"city_name" , "label"=>"עיר"],	
                                                  ["name"=>"cluster_name" , "label"=>"אשכול"],	
                                                  ["name"=>"ballot_box_id" , "label"=>"קלפי"],															 
                                                  );
                break;
           case 'phones' :
                $result_header_columns = array(["name"=>"phone_number" , "label"=>'מספר'] 
                                                                                         
                                                  );
                break;
            case 'households' :
                $result_header_columns = array(["name"=>"last_name" , "label"=>'משפחה'] ,
                                                  ["name"=>"current_address" , "label"=>'כתובת'],
                                                  ["name"=>"household_members_count" , "label"=>"מס' חברים"],	
                                                  ["name"=>"is_haridi" , "label"=>"חרדי"]	
                                                                                                     
                                                  );
                break;
            
        }
        return $result_header_columns;
    }
   /**
    * @method setSavedReportColumns
    *
    * @param VoterQuery $query - global voters query.
    * @param [string] $reportSystemName - saved form name.
    * @param Request $request - Request obj.
    * @return VoterQuery - $query
    */
    private function setSavedReportColumns($query, $reportSystemName , Request $request){
		$lastElectionCampaignID = ElectionCampaigns::currentCampaign()['id'];
		switch($reportSystemName){
			 case 'mailing_addresses' :
                    $query->select('voters.household_id', 'last_name' , 'cities.name as city' , 'voters.street' , 'voters.house','voters.house_entry' , 'voters.flat' , 'voters.zip' )
                            ->withCount('householdMembers')->orderBy('city', 'asc')->orderBy('street', 'desc')->orderBy('voters.last_name', 'asc')->groupBy('voters.household_id') ;
                    $query->addJoinIfNotExist('ballot_boxes')
                          ->addJoinIfNotExist('clusters')
                          ->addJoinIfNotExist('cities');
                    return $query;
                break;
			
			case 'questionairs' :
			    $query = $query->select(DB::raw('CONCAT(COALESCE(voters.first_name , "" ) , " " , COALESCE(voters.last_name , "") , " " , COALESCE(voters.personal_identity , "") , " , " , COALESCE(cities.name , ""))  as voter_name_identity_and_city'));
		        $query =  $query->addSelect('voters.id' , 'voters.first_name', 'voters.last_name' , 'voters.personal_identity' , 'cities.name as city_name' , 'voter_filters.name as portion_name' , 'voter_filters.created_at as datetime');
                $query = $query->addSelect("zz1.name as elections_voter_support_status_name");
                $query = $query->addSelect("zz2.name as tm_voter_support_status_name")  				
				              ->join('voters_answers' , 'voters_answers.voter_id','=','voters.id')
							  ->join('questions' , 'questions.id' , '=' , 'voters_answers.question_id' )
							  ->join('questionnaires' , 'questionnaires.id' , '=' , 'questions.questionnaire_id' )
							  ->join('calls' , 'calls.id' , '=' , 'voters_answers.call_id')
							  ->join('voter_filters' , 'voter_filters.id' , '=' , 'calls.portion_id')
							  ->leftJoin('voter_support_status as elections_voter_support_status' , function($joinOn) use($lastElectionCampaignID){
								  $joinOn->on('elections_voter_support_status.voter_id' , '=', 'voters.id')
								         ->where('elections_voter_support_status.election_campaign_id',$lastElectionCampaignID)
										 ->where('elections_voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
										  ;
							  })
							   ->leftJoin('support_status as zz1' , 'zz1.id' , '=' , 'elections_voter_support_status.support_status_id')
							  ->leftJoin('voter_support_status as tm_voter_support_status' , function($joinOn) use($lastElectionCampaignID){
								  $joinOn->on('tm_voter_support_status.voter_id' , '=', 'voters.id')
								         ->where('tm_voter_support_status.election_campaign_id',$lastElectionCampaignID)
										 ->where('tm_voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
										  ;
							  })
							  ->leftJoin('support_status as zz2' , 'zz2.id' , '=' , 'tm_voter_support_status.support_status_id')
							  ->where('questionnaires.id',$request->input('questionaireID'))
							  ->where('voters_answers.deleted',0)
							  ->where('questions.deleted',0)
							  ->where('questionnaires.deleted',0)
							  ->where('calls.deleted',0)
		                      ->with(['voterAnswersToQuestionairs'=>function($innerQuery){
								  $innerQuery->select('voters_answers.question_id','voters_answers.possible_answer_id','voters_answers.voter_id' , 'questions.text_general as question' , 'possible_answers.text_general as answer')->where('voters_answers.deleted' , 0)->withQuestionsAndAnswers();
							  }])
                              ->groupBy('voters.id');
                            $query->addJoinIfNotExist('ballot_boxes')
                                  ->addJoinIfNotExist('clusters')
                                  ->addJoinIfNotExist('cities');
				return $query;
				break;

        case 'sms' :
          if($request->input('smsUniqueNumberPerVoter') == '1'){
				    $query= $query->select('voter_phones.phone_number' )->join('voter_phones',function($joinOn){
						$joinOn->on('voter_phones.voter_id', '=', 'voters.id' )
                    ->on('voter_phones.wrong', DB::raw(0))
						        ->where('voter_phones.id', '=', DB::raw("
                    (select v.id from voter_phones as v
                    where v.voter_id = voters.id AND
                    v.wrong = 0 AND
                    v.phone_number like '05%'
                    order by v.updated_at desc
                    limit 1)"));
            });
        } else {
            $query= $query->select('voter_phones.phone_number')
                      ->withPhones()
                      ->where('voter_phones.phone_number', 'like','05%');
        }
        $getNotKoserPhonesWhereList = $this->getNotKoserPhonesWhereList();
        $query = $query->where($getNotKoserPhonesWhereList);

        if($request->input('smsShowBlockedSMSPhones') != '1'){
          $query = $query->where('voter_phones.sms' , 1);
        }

        $query = $query->groupBy('voter_phones.phone_number')
                      ->orderBy('voters.id')
                      ->orderBy('voter_phones.updated_at', 'DESC');

        return $query;
        break;
				  			
			case 'captain50' :
			    $cap50ElectionRoleID = 2;
                $query= $query->addSelect(DB::raw('CONCAT(voters.first_name, " ", voters.last_name , " , " , cities.name) AS cap_50'));
                $query->addJoinIfNotExist('ballot_boxes')
                      ->addJoinIfNotExist('clusters')
                      ->addJoinIfNotExist('cities');

				if($request->has('export_type')){
					$query = $query->addSelect('voters.personal_identity as personal_id','cities.name as city_name',DB::raw($this->fullClusterNameQuery)  , 'ballot_boxes.id as ballot_box_id');
				}
				else{
					$query = $query->addSelect('voters.personal_identity as personal_id','cities.name as city_name',DB::raw($this->fullClusterNameQuery),'voters.key' , 'ballot_boxes.id as ballot_box_id');
				}
			    return  $query->whereHas('electionRolesByVoter' , function($innerQuery) use($lastElectionCampaignID , $cap50ElectionRoleID){$innerQuery->where('election_campaign_id' , $lastElectionCampaignID)->where('election_role_id',$cap50ElectionRoleID);})
		                      ->withCount(['cap50Households' => function($innerQuery) use($lastElectionCampaignID ){$innerQuery->where('deleted' , 0)->where('election_campaign_id',$lastElectionCampaignID );}])
							  ;
				break;
			case 'phones' :
        if($request->input('phonesPreferePhoneType', null)){
          $phoneTypeId = $request->input('phonesPreferePhoneType', null);
          $foundPhoneType = PhoneTypes::select('id')
                                      ->where('id', $phoneTypeId)
                                      ->where('deleted', 0)
                                      ->first();
        }
        $phoneTypeQuery = ($foundPhoneType)? "AND v.phone_type_id = ".$foundPhoneType->id : "";
        if($request->input('phonesUniqueNumberPerVoter') == '1'){
            $query= $query->select('voter_phones.phone_number' )->join('voter_phones',function($joinOn) use ($phoneTypeQuery){
            $joinOn->on('voter_phones.voter_id', '=', 'voters.id' )
                    ->on('voter_phones.wrong', DB::raw(0))
                    ->where('voter_phones.id', '=', DB::raw("
                    (select v.id from voter_phones as v
                    where v.voter_id = voters.id AND
                    v.wrong = 0 $phoneTypeQuery
                    order by v.updated_at desc
                    limit 1)"));
            });
        } else {
					$query= $query->select('voter_phones.phone_number')
                        ->withPhones();
				}

        if ($phoneTypeId && $foundPhoneType) {
					$query = $query->where('voter_phones.phone_type_id' , $phoneTypeId);
        }
    

        $query = $query->groupBy('voter_phones.phone_number')
                ->orderBy('voters.id')
                ->orderBy('voter_phones.updated_at', 'DESC');
				
				//	 $query=$query->whereHas('householdMembers' , function($innerQuery){$innerQuery->whereHas('phones');});
				 
				return  $query;
				break;
			case 'households' :
		        $query= $query->select('voters.household_id', 'last_name' , DB::raw('IF(ballot_boxes.strictly_orthodox = 1 , "כן" , "לא") as is_haridi')  )
				             ->addSelect(DB::raw('CONCAT( COALESCE(voters.street,"")  , " " , COALESCE(IF(voters.house = 0 , "" , voters.house) , "") , "" , COALESCE(voters.house_entry , "") ,  IF(voters.house IS NULL or voters.house = 0 or voters.flat IS NULL or voters.flat = 0 , "" , "/") , COALESCE(voters.flat,"") , " , " , COALESCE(cities.name , "") ) as current_address'))
                             ->withCount('householdMembers')->orderBy('last_name', 'asc')->groupBy('voters.household_id');
                $query->addJoinIfNotExist('ballot_boxes')
                      ->addJoinIfNotExist('clusters')
                      ->addJoinIfNotExist('cities');
				if($request->input('detectValidPhoneInsideHousehold') == '1'){
					 $query=$query->whereHas('householdMembers' , function($innerQuery){
            $innerQuery->whereHas('phones', function($query2) {
              $query2->where('wrong', 0);
            });
          });
				}
				return  $query;
				break;
		}
	}
   

    /*
		Private helpful function that sets the report parameters into query
	*/
    private function setReportParameters(Request $request, $onlyCount)
    {
		$reportType = $request->input('report_type');
		if ($reportType == self::SAVED_REPORT) {
			 $query = VoterFilterQueryService::getQuery($request->all() , 'saved');
		}
	    else{
			 $query = VoterFilterQueryService::getQuery($request->all(),null,($reportType == self::COMBINED_REPORT));
			// echo $query->toSql();
		}
     
        $this->currentElectionCampaignId = $query->getModel()['currentElectionCampaign'];
       

        if (!$query) {
            return false;
        }

        if ($reportType == self::COMBINED_REPORT) { //combined report
            $query->addJoinIfNotExist('ballot_boxes')
                  ->addJoinIfNotExist('clusters')
                  ->addJoinIfNotExist('cities');

            $finalQuery = $this->setCombineQuery($request, $reportType, $query); 
             
        }
        elseif ($reportType == self::SAVED_REPORT) { //saved report
            
            $finalQuery = $this->setSavedReportColumns($query, $request->input('report_system_name') , $request);

            if (isset($request['combine_row_selected_value'])) { //get combine row detailes
              //  $finalQuery = $this->setCombineQuery($request, $reportType, $finalQuery);
            }
        }		
		else { //detailed report
			
            $detailColumns = $request->has('detailed_columns') ? $request->input('detailed_columns') : false; //custom detail columns display
            $query->addSelect('voters.key');

            //set columns if not only count
            if ($onlyCount) {
            	$finalQuery = $query;
            } else {
            	$finalQuery = $this->setDetailsDisplayColumns($query, $detailColumns);
            }

            if (!$onlyCount && isset($request['combine_row_selected_value'])) { //get combine row detailes
                $finalQuery = $this->setCombineQuery($request, $reportType, $finalQuery);
            }
        }
        // dd($finalQuery->get());
        return $finalQuery;
    }

    /**
     * @method setCombineQuery
     * Define combined report according to the combind columns
     * and the combine display by method
     * @param Request $request
     * @param [string] $reportType -report type
     * @param VoterQuery $query - global voters query.
     * @return void
     */
    private function setCombineQuery(Request $request, $reportType, $query)
    {
        $combineBy =  $request->input('combine_by', false) ; //main group by options
        $combineColumns = $request->input('combine_columns', false) ; //custom combine columns display
        $combineDisplayBy = $request->input('combine_display_by', false) ; //statuses or voters and households
        $combineValue =  $request->input('combine_row_selected_value', null) ; // in case of combined row details
        $combineValueColumnKey = $request->input('column_key',false); // in case of combined row, set status column key
        $queryJoins = $query->getModel()['joins'];
        $finalQuery = '';
        
        switch ($combineBy) {
            case 'areas':
                if (!isset($queryJoins['areas'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'));
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('areas.id AS combine_id', 'areas.name AS combine_name');
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('areas.id', $combineValue);
                }
                break;

            case 'mi_cities':
			 
                if (!isset($queryJoins['cities'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'));
                }
				
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('cities.id AS combine_id', DB::raw("IF(cities.name IS NULL,'ללא עיר מוגדרת', cities.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                    $finalQuery->orderBy('combine_name');
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) {
                        $finalQuery->whereNull('cities.id');
                    } else {
                        $finalQuery->where('cities.id', $combineValue);
                    }
                }
                break;
			case 'neighborhoods':
				if (!isset($queryJoins['neighborhoods'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'));
                }
				if ($reportType == self::COMBINED_REPORT) { //combined report

                    $query->addJoinIfNotExist('neighborhoods');
                    
                    $query->addSelect('neighborhoods.id AS combine_id', DB::raw("IF(neighborhoods.name IS NULL,'שכונה לא מוגדרת', neighborhoods.name) AS combine_name"))
                        ->where('neighborhoods.deleted', 0);
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('neighborhoods.id', $combineValue);
                }
				break;
            case 'clusters':
                if (!isset($queryJoins['clusters'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'));
                }
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    if (!isset($queryJoins['cities'])) {
                        $query->join('cities', 'cities.id', '=', 'clusters.city_id');
                    }
                    $clusterFullName = str_replace("AS cluster_name" , "" , $this->fullClusterNameQuery);
                    $query->addSelect('clusters.id AS combine_id', DB::raw( "CONCAT(cities.name, ', ', $clusterFullName) AS combine_name"))
                        ->where('clusters.election_campaign_id', DB::Raw($this->currentElectionCampaignId));

                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                    $finalQuery->orderBy('combine_name');
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('clusters.id', $combineValue);
                }
                break;

            case 'ballot_boxes':
                if (!isset($queryJoins['ballot_boxes'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    if (!isset($queryJoins['clusters'])) {
                        $query->join('clusters', 'clusters.id', 'ballot_boxes.cluster_id');
                    }

                    if (!isset($queryJoins['cities'])) {
                        $query->join('cities', 'cities.id', '=', 'clusters.city_id');
                    }
                    $fields =[
                        'cities.mi_id AS city_mi_id',
                        'ballot_boxes.mi_id AS ballot_mi_id',
                        'ballot_boxes.id AS combine_id',
                         DB::raw("CONCAT(cities.name, ', ',$this->fullClusterNameInnerQuery,', ',IF(LENGTH(ballot_boxes.mi_id) <= 1 , ballot_boxes.mi_id , CONCAT(SUBSTR(ballot_boxes.mi_id , 1 , LENGTH(ballot_boxes.mi_id)-1 ) , '.' , SUBSTR(ballot_boxes.mi_id , LENGTH(ballot_boxes.mi_id) , 1)))) AS combine_name")
                    ];
                    $query->addSelect($fields)
                        ->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                    $finalQuery->addSelect('ballot_mi_id', 'city_mi_id');
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('ballot_boxes.id', $combineValue);
                }
                break;

            case 'cities':
                $query->withCity();
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('c.id AS combine_id', DB::raw("IF(c.name IS NULL,'לא מוגדר',c.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue) {
                        $finalQuery->where('c.id', $combineValue);
                    } else {
                        $finalQuery->whereNull('c.id');
                    }
                }
                break;

            case 'actual_streets':
                if (!isset($queryJoins['actual_streets'])) {
                    $query->withActualStreet()
                        ->join('cities AS actual_streets_city', 'actual_streets_city.id', '=', 'actual_streets.city_id');
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('actual_streets.id AS combine_id', DB::raw("CONCAT(actual_streets_city.name,', ', actual_streets.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('actual_streets.id', $combineValue);
                }
                break;

            case 'mi_streets':
                if (!isset($queryJoins['mi_streets'])) {
                    $query->withMiStreet()
                        ->join('cities AS mi_streets_city', 'mi_streets_city.id', '=', 'mi_streets.city_id');
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('mi_streets.id AS combine_id', DB::raw("CONCAT(mi_streets_city.name,', ', mi_streets.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('mi_streets.id', $combineValue);
                }
                break;

            case 'actual_address_correct':
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect(DB::raw("IF(actual_address_correct = 1,1,0) AS combine_id"), DB::raw("IF(actual_address_correct = 1,'כן', 'לא') AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    if ($combineValue == '1') {
                        $finalQuery = $query->where('actual_address_correct', DB::Raw('1'));
                    } else {
                        $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                        $finalQuery->whereNull('actual_address_correct')->orWhere('actual_address_correct', DB::Raw('0'));
                    }
                }
                break;

            case 'support_status_election': // support status ballotbox
                $query->leftJoin('voter_support_status as vss', function ($joinOn) {
                    $joinOn->on('viec.voter_id', '=', 'vss.voter_id')
                        ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                        ->on('vss.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                        ->on('vss.deleted', DB::Raw(0));
                })
                ->leftJoin('support_status AS ss_elections', 'vss.support_status_id', '=', 'ss_elections.id');

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('vss.support_status_id AS combine_id', DB::raw("IF(ss_elections.name IS NULL,'ללא סטטוס', ss_elections.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    if ($combineValue == null) {
                        $finalQuery = $query->whereNull('vss.support_status_id');
                    } else {
                        $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                        $finalQuery->where('vss.support_status_id', $combineValue);
                    }
                }
                break;

            case 'support_status_tm': // support status telemarketing
                $query->leftJoin('voter_support_status as vss', function ($joinOn) {
                    $joinOn->on('voters.id', '=', 'vss.voter_id')
                        ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')))
                        ->on('vss.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                        ->on('vss.deleted', DB::Raw(0));
                })
                ->leftJoin('support_status AS ss_telemarketing', function($q){
                    $q->on('vss.support_status_id', '=', 'ss_telemarketing.id')
                    ->on('ss_telemarketing.election_campaign_id', DB::raw($this->currentElectionCampaignId));
                });

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect([
                        'vss.support_status_id AS combine_id',
                         DB::raw("IF(ss_telemarketing.name IS NULL,'ללא סטטוס', ss_telemarketing.name) AS combine_name")
                    ]);
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    if ($combineValue == null) {
                        $finalQuery = $query->whereNull('vss.support_status_id');
                    } else {
                        $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                        $finalQuery->where('vss.support_status_id', $combineValue);
                    }
                }
                break;

            case 'support_status_final':
                $query->leftJoin('voter_support_status as vss', function ($joinOn) {
                    $joinOn->on('voters.id', '=', 'vss.voter_id')
                        ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                        ->on('vss.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                        ->on('vss.deleted', DB::Raw(0));
                })->leftJoin('support_status AS ss_final', 'vss.support_status_id', '=', 'ss_final.id');

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('vss.support_status_id AS combine_id', DB::raw("IF(ss_final.name IS NULL,'ללא סטטוס', ss_final.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    if ($combineValue == null) {
                        $finalQuery = $query->whereNull('vss.support_status_id');
                    } else {
                        $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                        $finalQuery->where('vss.support_status_id', $combineValue);
                    }
                }
                break;

            case 'captains_of_fifty':
                $query->leftJoin('voters_with_captains_of_fifty', function ($joinOn) {
                    $joinOn->on('voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
                        ->on('voters_with_captains_of_fifty.deleted', '=', DB::Raw(0))
                        ->on('voters_with_captains_of_fifty.election_campaign_id', DB::Raw($this->currentElectionCampaignId));
                })
                ->leftJoin('voters AS captains', 'captains.id', '=', 'voters_with_captains_of_fifty.captain_id')
                ->leftJoin('election_roles_by_voters', function ($joinOn) {
                    $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
                        ->on('election_roles_by_voters.election_campaign_id', DB::Raw($this->currentElectionCampaignId));
                })->groupBy('voters.id')

                ->leftJoin('cities as captain_fifty_city', function($joinOn) {
                    $joinOn->on('captain_fifty_city.id', '=', 'election_roles_by_voters.assigned_city_id');
                });

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('captain_fifty_city.name as captain_fifty_city_name');
                    $query->addSelect('voters_with_captains_of_fifty.captain_id AS combine_id',
                        DB::Raw("IF(voters_with_captains_of_fifty.captain_id IS NULL,'ללא שר מאה'," .
                        "CONCAT(captains.personal_identity,' ',captains.first_name, ' ', captains.last_name,' '," .
                        "IF(election_roles_by_voters.phone_number IS NULL,'', election_roles_by_voters.phone_number))) AS combine_name"));
                   
                     $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                     $finalQuery->addSelect('captain_fifty_city_name');
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if($combineValue){ $finalQuery->where('voters_with_captains_of_fifty.captain_id', $combineValue);}
                    else{ $finalQuery->whereNull('voters_with_captains_of_fifty.captain_id'); }
                }
                break;

            case 'age': // Combind by voters ages
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect(DB::raw("CASE WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) <= 19 THEN '< 19'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 20 and 29 THEN '20 - 29'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 30 and 39 THEN '30 - 39'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 40 and 49 THEN '40 - 49'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 50 and 59 THEN '50 - 59'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 60 and 69 THEN '60 - 69'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 70 and 79 THEN '70 - 79'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 80 and 89 THEN '80 - 89'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) >= 90 THEN '90 <' ELSE 'none' END AS combine_id"),

                        DB::raw("CASE WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) <= 19 THEN '< 19'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 20 and 29 THEN '20 - 29'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 30 and 39 THEN '30 - 39'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 40 and 49 THEN '40 - 49'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 50 and 59 THEN '50 - 59'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 60 and 69 THEN '60 - 69'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 70 and 79 THEN '70 - 79'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) BETWEEN 80 and 89 THEN '80 - 89'
                WHEN (TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) >= 90 THEN '90 <' ELSE 'לא מוגדר' END AS combine_name")
                    );

                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    switch ($combineValue) {
                        case '< 19':
                            $finalQuery->where(DB::Raw('TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())'), '<', DB::raw(19));
                            break;
                        case '> 90':
                            $finalQuery->where(DB::Raw('TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())'), '>', DB::raw(90));
                            break;
                        case 'none':
                            $finalQuery->whereNull('voters.birth_date');
                            break;
                        case strpos($combineValue, '-') !== false:
                            $values = explode(' - ', $combineValue);
                            $finalQuery->whereBetween(DB::Raw('TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())'), $values);
                            break;
                    }
                }
                break;

            case 'birth_year':  // Combind by voters birth year
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect(DB::raw('YEAR(voters.birth_date) AS combine_id'), DB::raw("IF(voters.birth_date IS NULL,'לא מוגדר', YEAR(voters.birth_date)) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) {
                        $finalQuery->whereNull('voters.birth_date');
                    } else {
                        $finalQuery->where(DB::raw('YEAR(voters.birth_date)'), $combineValue);
                    }
                }
                break;

            case 'origin_country':
                if (!isset($queryJoins['countries'])) {
                    $query->withCountry();
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('origin_country_id AS combine_id', DB::raw("IF(voters.origin_country_id IS NULL,'לא מוגדר', countries.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) {
                        $finalQuery->whereNull('voters.origin_country_id');
                    } else {
                        $finalQuery->where('voters.origin_country_id', $combineValue);
                    }
                }
                break;

            case 'ethnic_group':
                if (!isset($queryJoins['ethnic_groups'])) {
                    $query->withEthnic();
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('ethnic_group_id AS combine_id',
                     DB::raw("IF(ethnic_groups.name IS NULL,'לא מוגדר', ethnic_groups.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) {
                        $finalQuery->whereNull('voters.ethnic_group_id');
                    } else {
                        $finalQuery->where('voters.ethnic_group_id', $combineValue);
                    }
                }
                break;

            case 'religious_group':
                if (!isset($queryJoins['religious_groups'])) {
                    $query->withReligiousGroup();
                }

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('religious_group_id AS combine_id',
                     DB::raw("IF(religious_groups.name IS NULL,'לא מוגדר', religious_groups.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) {
                        $finalQuery->whereNull('voters.religious_group_id');
                    } else {
                        $finalQuery->where('voters.religious_group_id', $combineValue);
                    }
                }
                break;

            case 'sephardi':
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('voters.sephardi AS combine_id',
                     DB::raw("(CASE WHEN voters.sephardi = 1 THEN 'כן' WHEN voters.sephardi = 0 "
                     . "THEN 'לא' ELSE 'לא ידוע' END) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);

                    if ($combineValue == null) {
                        $finalQuery->whereNull('voters.sephardi');
                    } else {
                        $finalQuery->where('voters.sephardi', $combineValue);
                    }
                }
                break;
			case 'voted_in_last_campaign':
                $query->leftJoin('votes', function ($joinOn) {
                    $joinOn->on('votes.voter_id', '=', 'voters.id')
                        ->on('votes.election_campaign_id', DB::Raw($this->currentElectionCampaignId));
                })
               ;

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('votes.election_campaign_id AS combine_id',
                        DB::Raw("IF(votes.id IS NULL,'לא הצביע',
						'הצביע') AS combine_name"));
                  // dd($query->toSql());
                     $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
			 
			   } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if($combineValue){ $finalQuery->where('votes.election_campaign_id', $combineValue);}
                    else{ $finalQuery->whereNull('votes.id'); }
                }
                break;

            case 'election_roles':
                $query->withElectionRolesByVotersInCurrentCampagin($this->currentElectionCampaignId);

                if ($reportType == self::COMBINED_REPORT) { //combined report
				
                    $query->addSelect('election_roles.id AS combine_id',
                     DB::raw("IF(election_roles.name IS NULL,'ללא תפקיד', election_roles.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
					
					 
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if($combineValue){ $finalQuery->where('election_roles.id', $combineValue);}
                    else{ $finalQuery->whereNull('election_roles.id'); }
                }
                break;

            case 'institution_name': 
                $query->withInstitutesRolesByVoters();

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('institutes.id AS combine_id',
                     DB::raw("IF(institutes.name IS NULL,'ללא מוסד', CONCAT(institutes.name , ' , ' , institute_city.name ) ) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if($combineValue){ $finalQuery->where('institutes.id', $combineValue);}
                    else{ $finalQuery->whereNull('institutes.id'); }
                }
                break;

            case 'voter_shas_group':
                $query->withVotersGroups();
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('voter_groups.id AS combine_id',
                     DB::raw("IF(voter_groups.name IS NULL,'ללא קבוצה', voter_groups.name ) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if($combineValue){ $finalQuery->where('voter_groups.id', $combineValue);}
                    else{ $finalQuery->whereNull('voter_groups.id'); }
                }
                break;

            case 'exist_in_election_campaign':
                if (!isset($queryJoins['voters_in_election_campaigns'])) {
                    $query->withVoterInElectionCampaigns();
                }
                $query->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId));

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('viec.election_campaign_id AS combine_id', DB::Raw("'קיים' AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                }
                break;

            case 'new_voters':
                if (!isset($queryJoins['voters_in_election_campaigns'])) {
                    $query->withVoterInElectionCampaigns();
                }

                $query->leftJoin('voters_in_election_campaigns AS old_election_campaigns', function ($joinOn) {
                    $joinOn->on('viec.voter_id', '=', 'old_election_campaigns.voter_id')
                        ->on('viec.id', '!=', 'old_election_campaigns.id');
                })
                    ->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                    ->whereNull('old_election_campaigns.id');

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('viec.election_campaign_id AS combine_id',
                     DB::Raw("'תושב חדש' AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                }
                break;

            case 'willing_volunteer':
                $query->join('voter_metas', 'voters.id', '=', 'voter_metas.voter_id')
                    ->join('voter_meta_keys AS keys', function ($joinOn) {
                        $joinOn->on('voter_metas.voter_meta_key_id', '=', 'keys.id')
                            ->whereIn('keys.key_system_name', ['willing_volunteer', 'agree_sign', 'explanation_material']);
                    })->join('voter_meta_values AS values', 'voter_metas.voter_meta_value_id', '=', 'values.id');

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect(DB::raw("CONCAT(keys.id,'-', values.id) AS combine_id"),
                     DB::raw("CONCAT(keys.key_name,'-', values.value) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $values = explode('-', $combineValue);
                    $finalQuery->where('keys.id', $values[0])->where('values.id', $values[1]);
                }
                break;

            case 'orthodox_ballot_boxes':
                if (!isset($queryJoins['ballot_boxes'])) {
                    $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
                }
              //  dd( $combineBy);
                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('ballot_boxes.strictly_orthodox AS combine_id', DB::raw("IF(ballot_boxes.strictly_orthodox = 1,'כן','לא') AS combine_name"))
                        ->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    $finalQuery->where('ballot_boxes.strictly_orthodox', DB::raw($combineValue));
                }
                break;

            case 'previous_knesset_support_status_final':
            case 'previous_municipal_support_status_final':
                $electionCampaignId = $this->currentElectionCampaignId;

                if ($combineBy == 'previous_knesset_support_status_final') {
                    $previousCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $previousCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }

                $query->leftJoin('voter_support_status as vss', function ($joinOn) use ($previousCampaignId) {
                    $joinOn->on('voters.id', '=', 'vss.voter_id')
                        ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                        ->on('vss.election_campaign_id', '=', DB::Raw($previousCampaignId));
                })->leftJoin('support_status AS ss', 'vss.support_status_id', '=', 'ss.id');

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect('vss.support_status_id AS combine_id', DB::raw("IF(ss.name IS NULL,'ללא סטטוס', ss.name) AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);
                    if ($combineValue == null) { $finalQuery->whereNull('vss.support_status_id');}
                    else {  $finalQuery->where('vss.support_status_id', $combineValue);
                    }
                }
                break;

            case 'previous_knesset_vote_status':
            case 'previous_municipal_vote_status':
            case 'current_knesset_vote_status':

                $electionCampaignId = $this->currentElectionCampaignId;

                if($combineBy == 'current_knesset_vote_status'){
                    $testCampaignId = $electionCampaignId;
                } else if ($combineBy == 'previous_knesset_vote_status') {
                    $testCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $testCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }


                $tableAlias = 'votes_' . $testCampaignId;
                $query->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                    ->leftJoin('votes AS ' . $tableAlias, function ($joinOn) use ($testCampaignId, $tableAlias) {
                        $joinOn->on('viec.voter_id', '=', $tableAlias . '.voter_id')
                            ->on($tableAlias . '.election_campaign_id', '=', DB::Raw($testCampaignId));
                    });

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    $query->addSelect($tableAlias . '.election_campaign_id AS combine_id',
                     DB::raw("IF(" . $tableAlias . ".election_campaign_id IS NULL,'לא הצביע', 'הצביע') AS combine_name"));
                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey, $tableAlias);
                    if ($combineValue == null) {
                        $finalQuery->whereNull($tableAlias . '.election_campaign_id');
                    } else {
                        $finalQuery->where($tableAlias . '.election_campaign_id', $combineValue);
                    }
                }
                break;
            case 'previous_knesset_vote_time':
            case 'previous_municipal_vote_time':
                $electionCampaignId = $this->currentElectionCampaignId;

                if ($combineBy == 'previous_knesset_vote_time') {
                    $previousCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $previousCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }
                $tableAlias = 'votes_' . $previousCampaignId;
                $query->where('viec.election_campaign_id', DB::Raw($this->currentElectionCampaignId))
                    ->leftJoin('votes AS ' . $tableAlias, function ($joinOn) use ($previousCampaignId, $tableAlias) {
                        $joinOn->on('viec.voter_id', '=', $tableAlias . '.voter_id')
                            ->on($tableAlias . '.election_campaign_id', '=', DB::Raw($previousCampaignId));
                    });

                if ($reportType == self::COMBINED_REPORT) { //combined report
                    //use numbers for combine_id to get the results in the relevant order
                    $query->addSelect(DB::raw("CASE WHEN TIME(" . $tableAlias . ".vote_date) < '12:00:00' THEN '1'
                WHEN TIME(" . $tableAlias . ".vote_date) BETWEEN '12:00:00' AND '15:00:00' THEN '2'
                WHEN TIME(" . $tableAlias . ".vote_date) BETWEEN '15:00:00' AND '18:00:00' THEN '3'
                WHEN TIME(" . $tableAlias . ".vote_date) > '18:00:00' THEN '4'
                ELSE '5' END AS combine_id"),
                 DB::raw("CASE WHEN TIME(" . $tableAlias . ".vote_date) < '12:00:00' THEN 'בוקר'
                WHEN TIME(" . $tableAlias . ".vote_date) BETWEEN '12:00:00' AND '15:00:00' THEN 'צהריים'
                WHEN TIME(" . $tableAlias . ".vote_date) BETWEEN '15:00:00' AND '18:00:00' THEN 'אחה\'\'צ'
                WHEN TIME(" . $tableAlias . ".vote_date) > '18:00:00' THEN 'ערב'
                ELSE 'לא הצביע' END AS combine_name"));

                    $finalQuery = $this->generateCombinedQuery($query, $combineColumns, $combineDisplayBy);
                } else {
                    $finalQuery = $this->joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey);

                    switch ($combineValue) {
                        case '1':
                            $finalQuery->where(DB::raw("TIME(" . $tableAlias . ".vote_date)"), '<', DB::raw("'12:00:00'"));
                            break;
                        case '2':
                            $finalQuery->whereBetween(DB::raw("TIME(" . $tableAlias . ".vote_date)"), array('12:00:00', '15:00:00'));
                            break;
                        case '3':
                            $finalQuery->whereBetween(DB::raw("TIME(" . $tableAlias . ".vote_date)"), array('15:00:00', '18:00:00'));
                            break;
                        case '4':
                            $finalQuery->where(DB::raw("TIME(" . $tableAlias . ".vote_date)"), '>', DB::raw("'18:00:00'"));
                            break;
                        case '5':
                            $finalQuery->whereNull(DB::raw("TIME(" . $tableAlias . ".vote_date)"));
                            break;
                    }
                }
                break;

            default:
                dd('TODO ' . $combineBy);
                break;
        }
		// dd(  $finalQuery->toSql());
        return $finalQuery;
    }
    /**
     *  @method getNotKoserPhonesWhereList
     *  - Prepare list of "where" queries
     *  for get only not koser phones.
     * @return array of "where" queries.
     */
    private function getNotKoserPhonesWhereList($phoneTable = 'voter_phones'){
       $whereNotKoserList = [];

       $koserPrefixList= Helper::KOSER_PREFIX_LIST; // All koser phones prefix.
       foreach($koserPrefixList as $phonePrefix){
           $whereNotKoserList[] = ["$phoneTable.phone_number", 'NOT LIKE', "0$phonePrefix%"];
       }
       for($i=0; $i<10; $i++){
           $whereNotKoserList[] = ["$phoneTable.phone_number", 'NOT LIKE', "0500$i%"];
       }
       return $whereNotKoserList;
    }
    
	/*
		Private helpful function that generates and returns combinedQuery by combineColumns
	*/
	private function generateCombinedQuery($query, $combineColumns, $combineDisplayBy)
    {
        $votersIdColumnName = 'voters_id';
        $selectColumns = array('combine_id', 'combine_name'); //basic selected columns
        $query->addSelect('voters.id AS ' . $votersIdColumnName, 'voters.household_id');

        if (!$combineColumns) {
            $selectColumns[] = DB::Raw("COUNT(DISTINCT $votersIdColumnName ) AS voters_count");
            $selectColumns[] = DB::Raw("COUNT(DISTINCT household_id) AS households_count");
        }

        if ($combineColumns && $combineDisplayBy == 'households') {
            $q1 = DB::table(DB::Raw('( ' . $query->toSql() . ' ) AS t1'))
                ->select('t1.*')
                ->setBindings([$query->getBindings()])->groupBy('household_id');

            $finalQuery = DB::table(DB::Raw('( ' . $q1->toSql() . ' ) AS t2'))
                ->select($selectColumns)
                ->setBindings([$q1->getBindings()])->groupBy('combine_id');
        } else {
			 
            $finalQuery = DB::table(DB::Raw('( ' . $query->toSql() . ' ) AS t'))
                ->select($selectColumns)
                ->setBindings([$query->getBindings()])->groupBy('combine_id') ;

        }
        // dd($finalQuery->toSql());

        if ($combineColumns) {
            // Not in use!!!
            $votesCombineColumns = [
                'previous_elecection_municipal_vote',
                'previous_elecection_knesset_vote'
            ];

            if ( in_array($combineColumns, $this->supportStatusCombineColumns) ) {
                $selectedElectionCampaignId = $this->joinWithSupportStatus($finalQuery, $combineColumns, $votersIdColumnName);

                $supportStatuses = SupportStatus::select('id')
                                        ->where('election_campaign_id', $selectedElectionCampaignId)
                                        ->where('deleted', 0)
                                        ->orderBy('level')
                                        ->get()
                                        ->toArray();
                $finalQuery->leftJoin('support_status', 'support_status.id', 'vss.support_status_id');
                $finalQuery->addSelect(DB::raw("SUM(IF(vss.id IS NULL, 1,0 )) AS 'no_status'"));
				 
                foreach ($supportStatuses as $status) {
                    $statusId = $status['id'];
                    $finalQuery->addSelect(DB::raw("ROUND(SUM(IF(vss.support_status_id = '" . $statusId . "', 1/(select count(*) from voter_support_status as vss_dbls where vss_dbls.election_campaign_id=vss.election_campaign_id and vss_dbls.voter_id = vss.voter_id and vss_dbls.deleted=0 and vss_dbls.entity_type=vss.entity_type and vss_dbls.support_status_id=vss.support_status_id),0))) AS 'status_" . $statusId . "'")) ;
                }
			   
            } 
            // Not in use!!!
            elseif ( in_array($combineColumns, $votesCombineColumns) ) {
                $this->joinWithVoteStatus($finalQuery, $combineColumns, $votersIdColumnName);
                $finalQuery->addSelect(DB::raw('COUNT(CASE WHEN previous_campaign_votes_by_type.id IS NULL THEN 1 END ) AS count_did_not_vote'));
                $finalQuery->addSelect(DB::raw('COUNT(CASE WHEN previous_campaign_votes_by_type.id IS NOT NULL THEN 1 END ) AS count_voted'));
            }
        }
		
        return $finalQuery;
    }

	/*
		Private helpful function that joins combineValue with columnKey
	*/
    private function joinCombineValueColumnKey($query, $combineColumns, $combineValueColumnKey)
    {
        if ($combineColumns) {
            $votersIdColumnName = 'voters.id';
            $this->joinWithSupportStatus($query, $combineColumns, $votersIdColumnName);

            if ($combineValueColumnKey == 'no_status') {
                $query->whereNull('vss.support_status_id');
            } else {
                $statusId = str_replace('status_', '', $combineValueColumnKey);
                $query->where('vss.support_status_id', $statusId);
            }
        }
        return $query;
    }

	/*
		Private helpful function that gets the query reference , and join to the query Votes
	*/
    private function joinWithVoteStatus(&$query, $combineColumns, $votersIdColumnName) {
        $electionCampaignId = $this->currentElectionCampaignId;

        switch ($combineColumns) {
            case 'previous_elecection_municipal_vote':
                $previousElectionCampignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                break;

            case 'previous_elecection_knesset_vote':
                $previousElectionCampignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                break;
        }

        $query->leftJoin('votes as previous_campaign_votes_by_type', function ($joinOn) use ($previousElectionCampignId, $votersIdColumnName) {
            $joinOn->on('previous_campaign_votes_by_type.voter_id', '=', $votersIdColumnName)
                ->on('previous_campaign_votes_by_type.election_campaign_id', DB::Raw($previousElectionCampignId));
        });
    }

	/*
		Private helpful function that gets the query reference , and join to the query SupportStatuses
	*/
    private function joinWithSupportStatus(&$query, $combineColumns, $votersIdColumnName)
    {
        $electionCampaignId = $this->currentElectionCampaignId;
 
        switch ($combineColumns) {
            case 'support_status_election':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'));
                break;
            case 'support_status_tm':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'));
                break;
            case 'support_status_final':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'));
                break;

            case 'previous_knesset_support_status_election':
            case 'previous_municipal_support_status_election':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'));

                if ($combineColumns == 'previous_knesset_support_status_election') {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }
                break;

            case 'previous_knesset_support_status_tm':
            case 'previous_municipal_support_status_tm':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'));

                if ($combineColumns == 'previous_knesset_support_status_tm') {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }
                break;

            case 'previous_knesset_support_status_final':
            case 'previous_municipal_support_status_final':
                $voterSupportEntityType = DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'));

                if ($combineColumns == 'previous_knesset_support_status_final') {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousKnessetCampaign($electionCampaignId)->id;
                } else {
                    $electionCampaignId = \App\Models\ElectionCampaigns::previousMunicipalCampaign($electionCampaignId)->id;
                }
                break;
        }
 
        $query->leftJoin('voter_support_status as vss', function ($joinOn) use ($electionCampaignId,
                                                                                $voterSupportEntityType,
                                                                                $votersIdColumnName) {
				
          $joinOn->on($votersIdColumnName, '=', 'vss.voter_id')
                ->on('vss.entity_type', '=', $voterSupportEntityType)
                ->on('vss.election_campaign_id', DB::Raw($electionCampaignId))
                ->on('vss.deleted',DB::Raw(0));
        });

        return $electionCampaignId;
    }
	
	/*
		Function that sets cookie token
	*/
    public function setCookieToken(
        $cookieName, $cookieValue, $httpOnly = true, $secure = false) {
        setcookie(
            $cookieName,
            $cookieValue,
            2147483647, // expires January 1, 2038
            "/", // your path
            $_SERVER["HTTP_HOST"], // your domain
            $secure, // Use true over HTTPS
            $httpOnly // Set true for $AUTH_COOKIE_NAME
        );
    }

	/*
		Private helpful function that gets data that will be exported in CSV
	*/
    private function getCsvReportData($queryParameters, Request $request) {
        $colsElectionCampaignsHash = [];
        $finalQuery = $queryParameters['finalQuery'];
		 
        $reportData = $finalQuery->get()->toArray();
        if($request->input('report_system_name') == 'captain50'){
            for($i = 0 ; $i<sizeof($reportData);$i++){
                $reportData[$i]["cap50_households_count"] = (intval($reportData[$i]["cap50_households_count"]) >= 50 ? 0 : (50 - (intval($reportData[$i]["cap50_households_count"]))));
            }
        }
        if(isset($queryParameters['detailColumns'])){
            $detailColumns = $queryParameters['detailColumns'];
            $colsElectionCampaignsHash = $this->getElectionCampaginNames($detailColumns);
        }
		
        $result = [
            'reportData' => $reportData,
            'colsElectionCampaignsHash' => $colsElectionCampaignsHash
        ];

        return $result;
    }

	/*
		Private helpful function that performs export to CSV
	*/
    private function exportToCsv($queryParameters, Request $request) {

        $reportType = $queryParameters['reportType'];
        $query = $queryParameters['query'];
        $skip = 0;
        $limit = 50000;
        if ($reportType == self::DETAILED_REPORT){
            $queryLimit = $this->getQuerylimit($query, $limit);
        }
        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=export.csv");

        if ($reportType == self::SAVED_REPORT) { //saved report
            $finalQuery = $this->setSavedReportColumns($query, $request->input('report_system_name'), $request);
        }else if ($reportType == self::COMBINED_REPORT) { //combined report
            $query->addJoinIfNotExist('ballot_boxes')
                  ->addJoinIfNotExist('clusters')
                  ->addJoinIfNotExist('cities');
            $finalQuery = $this->setCombineQuery($request, $reportType, $query); 
        } else{
            $detailColumns = $request->input('detailed_columns'); //custom detail columns display
			
            $finalQuery = $this->setDetailsDisplayColumns($query, $detailColumns);
		 
            if (isset($request['combine_row_selected_value'])) { //get combine row detailes
                $finalQuery = $this->setCombineQuery($request, $reportType, $finalQuery);
            }
        }

        $queryParameters['finalQuery'] = $finalQuery;

        $detailColumnsHebrew = ['#'];

        if($reportType == self::DETAILED_REPORT){
            $colsElectionCampaignsHash = $this->getElectionCampaginNames($detailColumns);
            $queryParameters['detailColumns'] = $detailColumns;
            $exportHebrewColumnsNames= ExportService::getColumnsNames(['columnsNamesDefinition' => $colsElectionCampaignsHash]);
            
			for ( $columnIndex = 0; $columnIndex < count($detailColumns); $columnIndex++ ) {
                $columnName = $detailColumns[$columnIndex]['name'];
				
                $detailColumnsHebrew[] = $exportHebrewColumnsNames[$columnName];
            } 

        }else if($reportType == self::COMBINED_REPORT){ 
            $combinedNamesArray = config('constants.combineBy');
            $combineBy = $request->input('combine_by');
            $combinedName= !empty($combinedNamesArray[$combineBy]) ? $combinedNamesArray[$request->input('combine_by')] : 'שם';
            $detailColumnsHebrew = ['#', $combinedName,'מספר תושבים', 'מספר בתי אב'];
            if($combineBy == 'ballot_boxes'){
                $detailColumnsHebrew [] = 'מזהה קלפי';
                $detailColumnsHebrew [] = 'מזהה עיר';
            } else if ($combineBy == 'captains_of_fifty') {
                $detailColumnsHebrew [] = 'מטה שיבוץ שר מאה';
            }
        }   //Need to fixed "SAVED_REPORT"!!!!

        $fullRow = implode(',', $detailColumnsHebrew);

        $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
        echo $rowToPrint;

        $rowNumber = 1;
        do {
            if($reportType == self::DETAILED_REPORT){
                $queryParameters['finalQuery']->skip($skip);
            }
            $result = $this->getCsvReportData($queryParameters, $request);
            $reportData = $result['reportData'];
			
            foreach ($reportData as $reportDataRow) {
                $reportDataRow = (array) $reportDataRow;
                if(!empty($reportDataRow['combine_id'])){unset($reportDataRow['combine_id']);}
                if(!empty($reportDataRow['voter_id'])){unset($reportDataRow['voter_id']); }

                $newRow = array_merge(['row' => $rowNumber++], $reportDataRow);
				
				
				$encoding = mb_detect_encoding(implode(",",$newRow), 'UTF-8, ASCII, ISO-8859-8');
                $fields = array_keys($newRow);
                for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
					
                    $fieldName = $fields[$fieldIndex];
					
					if(trim($fieldName) == 'id'){unset($newRow[$fieldName]);continue;}
					//Log::info(trim($fieldName)." - ".(trim($fieldName) == 'id' ? "true":"false"));
					if(trim($fieldName) != "combine_id"){
						
						$newRow[$fieldName] = '"' . str_replace('"', '""',$newRow[$fieldName])  . '"';
						 
					 
					}
					else{
						unset($newRow[$fieldName]);
					}
					
                }
				//Log::info($newRow);
                $fullRow = implode(',', $newRow);
                $rowToPrint =  mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";

                echo $rowToPrint;
            }

            $skip += $limit;
            $numOfRows = count($reportData);
        } while ($numOfRows == $limit);
    }

	/*
		Function that export report to file or print , by POST params
	*/
    public function exportReport(Request $request) {
		$reportType = $request->input('report_type');
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        $exportType = $request->has('export_type') ? $request->input('export_type') : false;
		
        if (!$exportType) {  die('export type is not set'); }
        
        if ($reportType == self::SAVED_REPORT) {
            $query = VoterFilterQueryService::getQuery($request->all() , 'saved');
       }
       else{
            $query = VoterFilterQueryService::getQuery($request->all(), null, ($reportType == self::COMBINED_REPORT));
       }

        if (!$query) {
            dd('There is no filters');
        }

        $TOKEN = "downloadToken";
        if ($request->has('downloadToken')) { //notification in client side that the download request finished ...
            $this->setCookieToken($TOKEN, $request->input('downloadToken'), false);
        }

        $this->currentElectionCampaignId = $query->getModel()['currentElectionCampaign'];

        $maxResultsCount = $request->input('max_results_count', null);
        
        //only limit result rows if the query is detailed and not combined
        if ($reportType == self::COMBINED_REPORT) {
            $queryLimit = null;
        } else {
            $queryLimit = $this->getQuerylimit($query, $maxResultsCount);
        }
		$colsElectionCampaignsHash = [];

        if ( $exportType == 'xls' && (is_null($queryLimit) || $queryLimit > self::VOTER_LIMIT) ) {
            $queryParameters = [
                'query' => $query,
                'reportType' => $reportType
            ];

            $this->exportToCsv($queryParameters, $request);
        } else {
            if ($reportType == self::SAVED_REPORT) { //saved report
                $finalQuery = $this->setSavedReportColumns($query, $request->input('report_system_name'),$request);
            }else if ($reportType == self::COMBINED_REPORT) { //combined report
                $query->addJoinIfNotExist('ballot_boxes')
                      ->addJoinIfNotExist('clusters')
                      ->addJoinIfNotExist('cities');
    
                $finalQuery = $this->setCombineQuery($request, $reportType, $query); 
            }else {
              if (!$request->has('detailed_columns')) { die('detailed columns not set');}
			
                $detailColumns = $request->input('detailed_columns'); //custom detail columns display
                 $newList = [];
				 $colsElectionCampaignsHash = $this->getElectionCampaginNames($detailColumns);
          if($exportType == "menu"){
            for($k = 0;$k < count($detailColumns) ; $k++){
              if(in_array($detailColumns[$k]["name"] , ["personal_id" , "first_name" , "last_name"])){
                $newList[] = $detailColumns[$k] ;
              }
            }
            $detailColumns = $newList;
          }
          
          $finalQuery = $this->setDetailsDisplayColumns($query, $detailColumns);
                if (isset($request['combine_row_selected_value'])) { //get combine row detailes
                    $finalQuery = $this->setCombineQuery($request, $reportType, $finalQuery);
                }
            }
			 
            $reportData = $finalQuery->get()->toArray();
			if($exportType == "menu"){
				for($k = 0 ; $k < count($reportData);$k++){
					unset($reportData[$k]["id"]);	
				}
			}
			
			 
			
            if($request->input('report_system_name') == 'captain50'){
                for($i = 0 ; $i<sizeof($reportData);$i++){
                    $reportData[$i]["cap50_households_count"] = (intval($reportData[$i]["cap50_households_count"]) >= 50 ? 0 : (50 - (intval($reportData[$i]["cap50_households_count"]))));
                }
            }

            if ($reportType != self::COMBINED_REPORT){
			 
                return ExportService::export($reportData, $exportType, 'general',  ['columnsNamesDefinition' => $colsElectionCampaignsHash]);
            }else{
				 
                $combinedNamesArray = config('constants.combineBy');
                $combinedName= !empty($combinedNamesArray[$request->input('combine_by')]) ? $combinedNamesArray[$request->input('combine_by')] : 'שם';
                // dd($reportData);
                return ExportService::export($reportData, $exportType, 'generalCombined',  ['combinedName' => $combinedName]);
            }
            // dd($reportData, $finalQuery->toSql());
        }
    }

	/*
		Private helpful function that returns hash of election campaigns names , for reuse purposes 
	*/
    private function getElectionCampaginNames($detailColumns){
        $electionCampaigns= ElectionCampaigns::select('id','name')->get();
        $electionCampaignsHash=[];

        foreach($electionCampaigns as $camp){
         $electionCampaignsHash[$camp->id]= $camp->name; 
        }
        $colsElectionCampaignsHash= []; 
 
        foreach($detailColumns as $col){
             if($col['per_election_campaign'] != 'false'){
                 $colsElectionCampaignsHash[$col['name']]= $electionCampaignsHash[$col['election_campaign']];
                }
        }
         return $colsElectionCampaignsHash;
    }

	/*
		Functipn that returns count of voters that can get SMS
	*/
    public function countSmsVoters(Request $request){
        $jsonOutput = app()->make("JsonOutput");

        $finalQuery = $this->getSmsQuery($request);
        $votersQuery = $this->addPhoneNumbersToVoters($finalQuery);

        $jsonOutput->setData($votersQuery->get()->count());
    }
	/*
		Fuction that do sending SMS action for voters list
	*/
    public function sendSms(Request $request){
        $jsonOutput = app()->make("JsonOutput");

        $smsMessage = $request->input('sms_message', null);

        if(!$smsMessage){$jsonOutput->setErrorCode(config('errors.elections.SMS_MESSAGE_TEXT_MISSING'));return;
        }
        $finalQuery = $this->getSmsQuery($request);
        $votersQuery = $this->addPhoneNumbersToVoters($finalQuery);

        $votersData= $finalQuery->get();
        if(count($votersData) > 5000){
            $jsonOutput->setErrorCode(config('errors.elections.SENDING_SMS_FAILED'));return;
        }
        $votersPhoneArray= [];
        foreach($votersData as $voter){
            if($voter->main_phone_number && !Helper::isKosherPhone($voter->main_phone_number)){
                $votersPhoneArray[]= $voter->main_phone_number;
            }else{
                $votersPhoneArray[]= $voter->valid_phone_number;
            }
        }
        // $response= Sms::send($votersPhoneArray, $smsMessage);
        $response= Sms::connection('telemarketing')->send($votersPhoneArray, $smsMessage);
        if($response){
            foreach($votersData as $voter){
                $message = new Message();
                $message->type = config('constants.MESSAGE_TYPE_SMS');
                $message->entity_type = config('constants.ENTITY_TYPE_VOTER');
                $message->direction = config('constants.REQUEST_OPERATION_DIRECTION_OUT');
                $message->entity_id = $voter->voter_id;
                $message->body = $smsMessage;
                $message->key = Helper::getNewTableKey('messages', 10);
                $message->save();
            }
            $jsonOutput->setData(['result' => $response,'phones' => $votersPhoneArray]);
        }else{
            $jsonOutput->setErrorCode(config('errors.elections.SENDING_SMS_FAILED'));
            return;
        }
    }
   
   /*
		Private helpful function that used by saved report and returns SmsQuery 
   */
   private function getSmsQuery(Request $request){

        $reportType = $request->input('report_type', null);
        $type = ($reportType == self::SAVED_REPORT) ? self::SAVED_REPORT : null;

        $query = VoterFilterQueryService::getQuery($request->all() , $type);
        $this->currentElectionCampaignId = $query->getModel()['currentElectionCampaign'];
        $this->getQuerylimit($query, null);
        
        if ($reportType == self::SAVED_REPORT) { //saved report
            $finalQuery = $this->setSavedReportColumns($query, $request->input('report_system_name'),$request);
        }else{
            $detailColumns = $request->input('detailed_columns'); //custom detail columns display
            $finalQuery = $this->setDetailsDisplayColumns($query, $detailColumns);
        }
        return $finalQuery;
    }
	
	/*
		Private helpful function that gets finalQuery referemce , and adds query that
		fetch voter phone numbers
	*/
    private function addPhoneNumbersToVoters(&$finalQuery){
        $getNotKoserPhonesWhereList = $this->getNotKoserPhonesWhereList('voterPhones');

        $whereNotKoserQuery = [
            ['voterPhones.phone_number', 'LIKE', '05%'],
        ];

        $whereNotKoserQuery[]= ['voterPhones.sms', '=', config('constants.SMS_MESSAGES_ALLOW')];
        $votersQuery = $finalQuery
        ->join('voter_phones as voterPhones', 'voterPhones.voter_id', '=', 'voters.id')
        ->where($getNotKoserPhonesWhereList)
        ->addSelect('voterPhones.phone_number as valid_phone_number')
        ->addSelect(DB::Raw("(SELECT voterPhones.phone_number FROM voter_phones AS voterPhones
         WHERE( voterPhones.id = voters.main_voter_phone_id AND voterPhones.phone_number LIKE '05%')) AS main_phone_number"))
        ->addSelect('voters.id as voter_id')
        ->orderBy('voterPhones.phone_number');
        return $votersQuery;
    }

	/*
		Private helpful function that gets query reference and number of rows
		to skip , and applies the skip number to the query
	*/
    private function getQuerySkip(&$query, $skip) {
        $query->skip($skip);
    }

	/*
		Private helpful function that gets as parameter query reference
		and sets a limit to that  - Limit regular user to 2000 results
	*/
    private function getQuerylimit(&$query, $maxResultsCount = null){
        $user = Auth::user();

        $limitResult = !$user->admin ? self::VOTER_LIMIT : null;
        if ($maxResultsCount) { //If limit is set
            $limitResult = $maxResultsCount;
            if ((!$user->admin)&& ($maxResultsCount > self::VOTER_LIMIT)) {
                $limitResult = self::VOTER_LIMIT;
            }
        }

        if($limitResult){
            $query->limit($limitResult);
        }

        return $limitResult;
    }

    
	/*
		Private helpful function that gets query reference and columnsList , 
		and goes through loop of selects,joins and wheres of coumns , and
		add them to query object
		
		// Limit regular user to 2000 results
		
	*/
    private function setDetailsDisplayColumns($query, $detailColumns) {

        $queryJoins = $query->getModel()['joins'];
        $columnsSort = [];

        if (count($detailColumns) > 10) {
            dd('too many columns selected');
        }
        foreach ($detailColumns as $columnData) {
			
            $column = is_string($columnData) ? json_decode($columnData, true) : $columnData;
            $perElectionCampaign = $column['per_election_campaign'];
            $electionCampaign = !empty($column['election_campaign']) ? $column['election_campaign'] : $this->currentElectionCampaignId;
            $columnSettings = $this->getDetailsColumnSettings($column['name'], $electionCampaign, $perElectionCampaign);

            if ($columnSettings) {
				 
                if (count($columnSettings['join'])) {
                    $joins = $columnSettings['join'];

                    foreach ($joins as $join) {
				
					//	var_dump($join);
			       if(is_array($join) !== false){
				  
				   }
				   
   
				   if(is_array($join) !== false && array_key_exists('table' , $join)){
                        
                        $table = $join['table'];
 
			            $joinOptions = [];
						
                        if (!isset($queryJoins[$table])) {
		
                            $queryJoins[$table] = true;

                            foreach ($join['joinOn'] as $joinArray) {
                                $joinOptions[] = [$joinArray['from'], $joinArray['condition'], $joinArray['to']];
                            }
										
                            $query->leftJoin($table, function ($joinVar) use ($joinOptions) {
                                $joinVar->on($joinOptions);
                            });
							
                        }
						else if(!empty($join['prevent_extra_join'])){
							   echo "prevent";
							 $table = $join['table']." As ".($join['table']."_extra");
							 foreach ($join['joinOn'] as $joinArray) {
							   if(gettype($joinArray['to']) == "object"){
								   $joinOptions[] = [str_replace($join['table'] , ($join['table']."_extra") , $joinArray['from']), $joinArray['condition'],  $joinArray['to']];
							   }
							   else{
								   $joinOptions[] = [str_replace($join['table'] , ($join['table']."_extra") , $joinArray['from']), $joinArray['condition'], str_replace($join['table'] , ($join['table']."_extra") , $joinArray['to'])];
							   }
                             }
                            $query->leftJoin($table, function ($joinVar) use ($joinOptions) {
                                $joinVar->on($joinOptions);
                            });
								$columnSettings["select"] = str_replace($join['table'] , ($join['table']."_extra") , $columnSettings["select"]);
							 
						}
					//	
					}   
					
					}
					
                }

                if (count($columnSettings['where'])) {
                    $whereConditions = $columnSettings['where'];

                    foreach ($whereConditions as $condition) {
                        $field = $condition['field'];
                        $where_type = $condition['where_type'];
                        $value = $condition['value'];
                        $query->where($field, $where_type, $value);
                    }
                }

                if ($columnSettings['select'] !== '') {
                    $selectedColumns = $query->getQuery()->columns ? $query->getQuery()->columns : [];

                    if (!in_array($columnSettings['select'], $selectedColumns)) {
                        $query->addSelect($columnSettings['select']);
                    }
					
					
					
                    if ($column['sort_number'] != '' && $column['sort_direction'] != '') {
                        $columnsSort[intval($column['sort_number'])] = $column;
                    }
                }
				
				// echo $query->get()->count()."-";
            }
			
        }

        ksort($columnsSort);

        foreach ($columnsSort as $column) {
            $query->orderBy($column['name'], $column['sort_direction']);
        }

        return $query;
    }

	/*
		Private helpful function that returns full cluster name with prefix
	*/
    private function clusterQuery($tableAlias) {
        return Cluster::getClusterFullNameQuery('',false, $tableAlias);
    }

    /**
     * This function builds the array for
     * each column with election campaign.
     * Each columns is of columnName_electionCampaignId.
     * For example: previous_support_status_election_19
     *
     * @param $columnName
     * @param $electionCampaign
     * @param $detailsData
     * @return bool|mixed
     */
    private function getDetailsColumnPerElectionSettings($columnName, $electionCampaign, $detailsData) {
        $previous_election_cluster_alias = $detailsData['previous_election_cluster_alias'];
        $foundPrevElectionCampIdQuery = $detailsData['foundPrevElectionCampIdQuery'];

        $detailsDisplayColumns = [
            /*previous_support_statuses*/
            'previous_support_status_election_' . $electionCampaign => ['join' => [
                ['table' => "voter_support_status as pre_vss_e_" . $electionCampaign , "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "pre_vss_e_" . $electionCampaign . ".voter_id"],
                    ["from" => "pre_vss_e_" . $electionCampaign . ".entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))],
                    ["from" => "pre_vss_e_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ['table' => "support_status AS pre_ss_" . $electionCampaign, "joinOn" => [["from" => "pre_vss_e_" . $electionCampaign . ".support_status_id", "condition" => "=", "to" => "pre_ss_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(pre_ss_" . $electionCampaign . ".name IS NULL,'ללא סטטוס', pre_ss_" . $electionCampaign . ".name) AS previous_support_status_election_" . $electionCampaign), 'where' => []],

            'previous_support_status_tm_' . $electionCampaign => ['join' => [
                ['table' => "voter_support_status as pre_vss_tm_" . $electionCampaign, "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "pre_vss_tm_" . $electionCampaign . ".voter_id"],
                    ["from" => "pre_vss_tm_" . $electionCampaign . ".entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))],
                    ["from" => "pre_vss_tm_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ['table' => "support_status AS pre_ss_tm_" . $electionCampaign, "joinOn" => [["from" => "pre_vss_tm_" . $electionCampaign . ".support_status_id", "condition" => "=", "to" => "pre_ss_tm_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(pre_ss_tm_" . $electionCampaign . ".name IS NULL,'ללא סטטוס', pre_ss_tm_" . $electionCampaign . ".name) AS previous_support_status_tm_" . $electionCampaign), 'where' => []],

            'previous_support_status_final_' . $electionCampaign => ['join' => [
                ['table' => "voter_support_status as pre_vss_f_" . $electionCampaign, "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "pre_vss_f_" . $electionCampaign . ".voter_id"],
                    ["from" => "pre_vss_f_" . $electionCampaign . ".entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                    ["from" => "pre_vss_f_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ['table' => "support_status AS pre_ss_f_" . $electionCampaign, "joinOn" => [["from" => "pre_vss_f_" . $electionCampaign . ".support_status_id", "condition" => "=", "to" => "pre_ss_f_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(pre_ss_f_" . $electionCampaign . ".name IS NULL,'ללא סטטוס', pre_ss_f_" . $electionCampaign .".name) AS previous_support_status_final_" . $electionCampaign), 'where' => []],

            /*previous_vote fields*/
            'previous_election_vote_' . $electionCampaign => ['join' => [['table' => "votes as prev_votes_" . $electionCampaign, "joinOn" => [["from" => "prev_votes_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "prev_votes_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(prev_votes_" . $electionCampaign . ".election_campaign_id IS NULL,'לא הצביע'" . ",'הצביע') AS previous_election_vote_" . $electionCampaign),
                'where' => []],

            'previous_election_vote_time_' . $electionCampaign => ['join' => [['table' => "votes as prev_vote_time_" . $electionCampaign, "joinOn" => [["from" => "prev_vote_time_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "prev_vote_time_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(prev_vote_time_" . $electionCampaign . ".vote_date IS NULL,'לא הצביע', TIME(prev_vote_time_" . $electionCampaign . ".vote_date)) AS previous_election_vote_time_" . $electionCampaign),
                'where' => []],

            /* Previous voter in election campaigns fields */
            'previous_election_ballot_box_city_id_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_ballot_box_city_id_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_city_id_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_ballot_box_city_id_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "ballot_boxes as previous_election_ballot_box_city_id_ballot_boxes_" . $electionCampaign, "joinOn" =>
                    [["from" => "previous_election_ballot_box_city_id_ballot_boxes_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_ballot_box_city_id_viec_" . $electionCampaign .".ballot_box_id"]]],
                ["table" => "clusters as previous_election_ballot_box_city_id_clusters_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_city_id_clusters_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_ballot_box_city_id_ballot_boxes_" . $electionCampaign . ".cluster_id"],
                    ["from" => "previous_election_ballot_box_city_id_clusters_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]],
                ["table" => "cities as previous_election_ballot_box_city_id_cities_" . $electionCampaign, "joinOn" => [["from" => "previous_election_ballot_box_city_id_clusters_" . $electionCampaign . ".city_id", "condition" => "=", "to" => "previous_election_ballot_box_city_id_cities_" . $electionCampaign . ".id"]]]],

                'select' => 'previous_election_ballot_box_city_id_cities_' . $electionCampaign . '.mi_id AS previous_election_ballot_box_city_id_' . $electionCampaign,
                'where' => []],

            // city's name where the voter is allocated to vote
            'previous_election_ballot_box_city_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_ballot_box_city_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_city_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_ballot_box_city_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "ballot_boxes as previous_election_ballot_box_city_ballot_boxes_" . $electionCampaign, "joinOn" => [[
                    "from" => "previous_election_ballot_box_city_ballot_boxes_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_ballot_box_city_viec_" . $electionCampaign . ".ballot_box_id"]]],
                ["table" => "clusters as previous_election_ballot_box_city_clusters_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_city_clusters_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_ballot_box_city_ballot_boxes_" . $electionCampaign . ".cluster_id"],
                    ["from" => "previous_election_ballot_box_city_clusters_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]],
                ["table" => "cities as previous_election_ballot_box_city_cities_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_city_clusters_" . $electionCampaign . ".city_id", "condition" => "=", "to" => "previous_election_ballot_box_city_cities_" . $electionCampaign . ".id"]]]],
                'select' => 'previous_election_ballot_box_city_cities_' . $electionCampaign . '.name AS previous_election_ballot_box_city_' . $electionCampaign,
                'where' => []
            ],

            // cluster's name where the voter is allocated to vote
            'previous_election_cluster_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_cluster_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_cluster_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_cluster_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "ballot_boxes as previous_election_cluster_ballot_boxes_" . $electionCampaign, "joinOn" =>
                    [["from" => "previous_election_cluster_ballot_boxes_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_cluster_viec_" . $electionCampaign . ".ballot_box_id"]]],
                ["table" => "clusters as previous_election_cluster_clusters_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_cluster_clusters_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_cluster_ballot_boxes_" . $electionCampaign . ".cluster_id"],
                    ["from" => "previous_election_cluster_clusters_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]]],
                'select' => DB::raw("CONCAT ($previous_election_cluster_alias) as previous_election_cluster_" . $electionCampaign),
                'where' => []
            ],

            'previous_election_cluster_address_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_cluster_address_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_cluster_address_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_cluster_address_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],

                ["table" => "ballot_boxes as previous_election_cluster_address_ballot_boxes_" . $electionCampaign, "joinOn" =>
                    [["from" => "previous_election_cluster_address_ballot_boxes_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_cluster_address_viec_" . $electionCampaign . ".ballot_box_id"]]],

                ["table" => "clusters as previous_election_cluster_address_clusters_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_cluster_address_clusters_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_cluster_address_ballot_boxes_" . $electionCampaign . ".cluster_id"],
                    ["from" => "previous_election_cluster_address_clusters_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]]],
                'select' => DB::raw("CONCAT(previous_election_cluster_address_clusters_" . $electionCampaign . ".street,' ', previous_election_cluster_address_clusters_" . $electionCampaign . ".street_id,', ',$this->fullClusterNameInnerQuery) AS previous_election_cluster_address_" . $electionCampaign),
                'where' => []
            ],

            // ballot box's mi_id where the voter is allocated to vote
            'previous_election_ballot_box_mi_id_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_ballot_box_id_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_ballot_box_id_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_ballot_box_id_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]],
                ["table" => "ballot_boxes as previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign, "joinOn" =>
                    [["from" => "previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".id", "condition" => "=", "to" => "previous_election_ballot_box_id_viec_" . $electionCampaign . ".ballot_box_id"]]],

            ],
                //'select' => "previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id as previous_election_ballot_box_mi_id_" . $electionCampaign,
                'select' => DB::Raw("(IF (LENGTH(previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id) <= 1 ,previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id , CONCAT(SUBSTR(previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id , 1 , LENGTH(previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id) - 1) , '.' , SUBSTR(previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id , LENGTH(previous_election_ballot_box_id_ballot_boxes_" . $electionCampaign . ".mi_id) , 1)) ) ) as previous_election_ballot_box_mi_id_" . $electionCampaign),
                'where' => []
            ],

            // Previous voter's serial number in ballot
            'previous_election_voter_number_' . $electionCampaign => ['join' => [
                ["table" => "voters_in_election_campaigns as previous_election_voter_number_viec_" . $electionCampaign, "joinOn" => [
                    ["from" => "previous_election_voter_number_viec_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                    ["from" => "previous_election_voter_number_viec_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]
                ]]
            ],
                'select' => "previous_election_voter_number_viec_" . $electionCampaign . ".voter_serial_number as previous_election_voter_number_" . $electionCampaign,
                'where' => []
            ],

            // field that indicates if voter was a new voter in previous campaign
            'previous_election_new_voter_' . $electionCampaign => [
                'join' => [["table" => "voters_in_election_campaigns AS previous_campaign_" . $electionCampaign,
                    "joinOn" =>[["from" => "previous_campaign_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)],
                        ["from" => "previous_campaign_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => 'voters.id']]
                ]],
                'select' => DB::raw("IF(previous_campaign_" . $electionCampaign . ".election_campaign_id IS NOT NULL AND ($foundPrevElectionCampIdQuery) IS NULL , 'חדש','לא חדש') AS previous_election_new_voter_" . $electionCampaign),
                'where' => []],

            /* Election activity */

            // election role
            'election_role_' . $electionCampaign => ['join' => [["table" => "election_roles_by_voters as election_roles_by_voters_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "election_roles_by_voters_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "election_roles as election_roles_" . $electionCampaign, "joinOn" => [["from" => "election_roles_" . $electionCampaign . ".id", "condition" => "=", "to" => "election_roles_by_voters_" . $electionCampaign . ".election_role_id"]]]],
                'select' => DB::raw("IF(election_roles_" . $electionCampaign . ".name IS NULL,'ללא תפקיד', 
										GROUP_CONCAT(
												DISTINCT CONCAT(
													 election_roles_"  . $electionCampaign . ".name  , ' - ' , 
														(
															CASE 
																WHEN (election_roles_" . $electionCampaign . ".system_name='ballot_member' or election_roles_" . $electionCampaign . ".system_name='observer') 
																	THEN  
																		COALESCE((select CONCAT(' קלפי ' , CONCAT(substr( max(ballotRoles.mi_id) , 1 ,CHAR_LENGTH(max(ballotRoles.mi_id))-1) , '.' , substr( max(ballotRoles.mi_id) , CHAR_LENGTH(max(ballotRoles.mi_id)) ,1) ) , ' ' , cityBallot.name) from election_role_by_voter_geographic_areas,ballot_boxes as ballotRoles , clusters as clusterBallot,cities as cityBallot where ballotRoles.id=election_role_by_voter_geographic_areas.entity_id and ballotRoles.cluster_id = clusterBallot.id and clusterBallot.city_id = cityBallot.id and election_role_by_voter_geographic_areas.entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." and election_role_by_voter_id=election_roles_by_voters_" . $electionCampaign . ".id),'ללא שיבוץ') 
																WHEN election_roles_" . $electionCampaign . ".system_name='motivator'
																	THEN
																		COALESCE((select CONCAT(max(clusterBallot.name) , ' ',max(cityBallot.name)) from election_role_by_voter_geographic_areas, clusters as clusterBallot,cities as cityBallot where clusterBallot.id=election_role_by_voter_geographic_areas.entity_id and  clusterBallot.city_id = cityBallot.id and election_role_by_voter_geographic_areas.entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." and election_role_by_voter_id=election_roles_by_voters_" . $electionCampaign . ".id),'ללא שיבוץ') 
																WHEN election_roles_" . $electionCampaign . ".system_name='cluster_leader'
																	THEN
																		COALESCE((select CONCAT(max(clusterBallot.name) , ' ' , max(cityBallot.name)) from  clusters as clusterBallot,cities as cityBallot where clusterBallot.city_id = cityBallot.id  and clusterBallot.leader_id=election_roles_by_voters_" . $electionCampaign . ".voter_id),'ללא שיבוץ')
																WHEN election_roles_" . $electionCampaign . ".system_name='captain_of_fifty'
																	THEN
																		COALESCE( (select CONCAT(count(*), ' ' , ' תושבים ' , max(voters.city)) from  voters_with_captains_of_fifty , voters where voters_with_captains_of_fifty.captain_id=election_roles_by_voters_" . $electionCampaign . ".voter_id and voters.id=voters_with_captains_of_fifty.voter_id and election_roles_by_voters_" . $electionCampaign . ".election_campaign_id = voters_with_captains_of_fifty.election_campaign_id and voters_with_captains_of_fifty.deleted=0),'ללא שיבוץ')
																WHEN election_roles_" . $electionCampaign . ".system_name='driver'
																	THEN
																		COALESCE( (select CONCAT(count(*), ' ' , ' אשכולות ' , max(cities.name)) from  election_role_by_voter_geographic_areas , clusters , cities where election_role_by_voter_geographic_areas.election_role_by_voter_id=election_roles_by_voters_" . $electionCampaign . ".id and election_role_by_voter_geographic_areas.entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." and  clusters.id=election_role_by_voter_geographic_areas.entity_id and cities.id = clusters.city_id ),'ללא שיבוץ') 
																ELSE 
																	'' 
																END
														 )  
													   ) 
													   ORDER BY 
															(FIND_IN_SET(election_roles_" . $electionCampaign . ".system_name, 'ballot_member,observer,cluster_leader,captain_of_fifty,motivator,driver')) 
													   SEPARATOR ' | '
													 )) AS election_role_" . $electionCampaign), 'where' => [] ],

            'election_role_create_date_' . $electionCampaign => ['join' => [["table" => "election_roles_by_voters as election_roles_by_voters_create_date_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_create_date_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "election_roles_by_voters_create_date_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => 'election_roles_by_voters_create_date_' . $electionCampaign . '.created_at AS election_role_create_date_' . $electionCampaign, 'where' => []],

            'election_role_creator_user_' . $electionCampaign => ['join' => [["table" => "election_roles_by_voters as election_roles_by_voters_creator_user_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_creator_user_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "election_roles_by_voters_creator_user_" . $electionCampaign .".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "users AS roleCreatorUser_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_creator_user_" . $electionCampaign . ".user_create_id", "condition" => "=", "to" => "roleCreatorUser_" . $electionCampaign . ".id"]]],
                ["table" => "voters AS roleCreatorVoter_" . $electionCampaign, "joinOn" => [["from" => "roleCreatorUser_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "roleCreatorVoter_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("CONCAT(roleCreatorVoter_" . $electionCampaign . ".first_name,' ', roleCreatorVoter_" . $electionCampaign . ".last_name) AS election_role_creator_user_" . $electionCampaign), 'where' => []],

            'election_role_verified_status_' . $electionCampaign => ['join' => [["table" => "election_roles_by_voters as election_roles_by_voters_verified_status_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_verified_status_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "election_roles_by_voters_verified_status_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(election_roles_by_voters_verified_status_" . $electionCampaign . ".verified_status =0,'לא',"."'כן') AS election_role_verified_status_" . $electionCampaign), 'where' => []],

            'election_role_phone_number_' . $electionCampaign => ['join' => [["table" => "election_roles_by_voters as election_roles_by_voters_phone_number_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_phone_number_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "election_roles_by_voters_phone_number_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => 'election_roles_by_voters_phone_number_' . $electionCampaign . '.phone_number AS election_role_phone_number_' . $electionCampaign, 'where' => []],

            /*  Meta keys */

            'election_role_willing_volunteer_' . $electionCampaign => ['join' => [["table" => "voter_metas as voter_metas_" . $electionCampaign, "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "voter_metas_" . $electionCampaign . ".voter_id"],
                ["from" => "voter_metas_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voter_meta_keys as voter_meta_keys_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_" . $electionCampaign . ".voter_meta_key_id", "condition" => "=", "to" => "voter_meta_keys_" . $electionCampaign . ".id"],
                    ["from" => "voter_meta_keys_" . $electionCampaign . ".key_system_name", "condition" => "=", "to" => DB::Raw("'willing_volunteer'")]]],
                ["table" => "voter_meta_values as voter_meta_values_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_" . $electionCampaign . ".voter_meta_value_id", "condition" => "=", "to" => "voter_meta_values_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(voter_meta_values_" . $electionCampaign . ".value IS NULL,'',voter_meta_values_" . $electionCampaign . ".value) AS election_role_willing_volunteer_" . $electionCampaign), 'where' => []],

            'election_role_agree_sign_' . $electionCampaign => ['join' => [["table" => "voter_metas as voter_metas_agree_" . $electionCampaign, "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "voter_metas_agree_" . $electionCampaign . ".voter_id"],
                ["from" => "voter_metas_agree_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voter_meta_keys as voter_meta_keys_agree_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_agree_" . $electionCampaign . ".voter_meta_key_id", "condition" => "=", "to" => "voter_meta_keys_agree_" . $electionCampaign . ".id"],
                    ["from" => "voter_meta_keys_agree_" . $electionCampaign . ".key_system_name", "condition" => "=", "to" => DB::Raw("'agree_sign'")]]],
                ["table" => "voter_meta_values as voter_meta_values_agree_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_agree_" . $electionCampaign . ".voter_meta_value_id", "condition" => "=", "to" => "voter_meta_values_agree_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(voter_meta_values_agree_" . $electionCampaign . ".value IS NULL,'',voter_meta_values_agree_" . $electionCampaign . ".value) AS election_role_agree_sign_" . $electionCampaign), 'where' => []],

            'election_role_explanation_material_' . $electionCampaign => ['join' => [["table" => "voter_metas as voter_metas_explanation_material_" . $electionCampaign, "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "voter_metas_explanation_material_" . $electionCampaign . ".voter_id"],
                ["from" => "voter_metas_explanation_material_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voter_meta_keys as voter_meta_keys_explanation_material_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_explanation_material_" . $electionCampaign . ".voter_meta_key_id", "condition" => "=", "to" => "voter_meta_keys_explanation_material_" . $electionCampaign . ".id"],
                    ["from" => "voter_meta_keys_explanation_material_" . $electionCampaign . ".key_system_name", "condition" => "=", "to" => DB::Raw("'agree_sign'")]]],
                ["table" => "voter_meta_values as voter_meta_values_explanation_material_" . $electionCampaign, "joinOn" => [["from" => "voter_metas_explanation_material_" . $electionCampaign . ".voter_meta_value_id", "condition" => "=", "to" => "voter_meta_values_explanation_material_" . $electionCampaign . ".id"]]]],
                'select' => DB::raw("IF(voter_meta_values_explanation_material_" . $electionCampaign . ".value IS NULL,'',voter_meta_values_explanation_material_" . $electionCampaign . ".value) AS election_role_explanation_material_" . $electionCampaign), 'where' => []], //todo

            /* Voter's captain 50 */

            'election_role_captains_of_fifty_id_' . $electionCampaign => ['join' => [["table" => "voters_with_captains_of_fifty as voters_with_captain50_pid_" . $electionCampaign, "joinOn" => [["from" => "voters_with_captain50_pid_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "voters_with_captain50_pid_" . $electionCampaign . ".deleted", "condition" => "=", "to" => DB::Raw(0)],
                ["from" => "voters_with_captain50_pid_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voters AS captains_voters_pid_" . $electionCampaign, "joinOn" => [["from" => "captains_voters_pid_" . $electionCampaign . ".id", "condition" => "=", "to" => "voters_with_captain50_pid_" . $electionCampaign . ".captain_id"]]],
                ["table" => "election_roles_by_voters as election_roles_by_voters_captain50_id_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_captain50_id_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters_with_captain50_pid_" . $electionCampaign . ".captain_id"],
                    ["from" => "election_roles_by_voters_captain50_id_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => 'captains_voters_pid_' . $electionCampaign . '.personal_identity AS election_role_captains_of_fifty_id_' . $electionCampaign, 'where' => []],

            'election_role_captains_of_fifty_name_' . $electionCampaign => ['join' => [["table" => "voters_with_captains_of_fifty as voters_with_captain50_name_" . $electionCampaign, "joinOn" => [["from" => "voters_with_captain50_name_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "voters_with_captain50_name_" . $electionCampaign . ".deleted", "condition" => "=", "to" => DB::Raw(0)],
                ["from" => "voters_with_captain50_name_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voters AS captains_voters_name_" . $electionCampaign, "joinOn" => [["from" => "captains_voters_name_" . $electionCampaign . ".id", "condition" => "=", "to" => "voters_with_captain50_name_" . $electionCampaign . ".captain_id"]]],
                ["table" => "election_roles_by_voters as election_roles_by_voters_captain50_name_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_captain50_name_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters_with_captain50_name_" . $electionCampaign . ".captain_id"],
                    ["from" => "election_roles_by_voters_captain50_name_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::Raw("CONCAT(captains_voters_name_" . $electionCampaign . ".first_name, ' ', captains_voters_name_" . $electionCampaign . ".last_name) AS election_role_captains_of_fifty_name_" . $electionCampaign), 'where' => []],

            'election_role_captains_of_fifty_phone_' . $electionCampaign => ['join' => [["table" => "voters_with_captains_of_fifty as voters_with_captain50_name_" . $electionCampaign, "joinOn" => [["from" => "voters_with_captain50_name_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "voters_with_captain50_name_" . $electionCampaign . ".deleted", "condition" => "=", "to" => DB::Raw(0)],
                ["from" => "voters_with_captain50_name_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "voters AS captains_voters_phone_" . $electionCampaign, "joinOn" => [["from" => "captains_voters_phone_" . $electionCampaign . ".id", "condition" => "=", "to" => "voters_with_captain50_name_" . $electionCampaign . ".captain_id"]]],
                ["table" => "election_roles_by_voters as election_roles_by_voters_captain50_phone_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_captain50_phone_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters_with_captain50_name_" . $electionCampaign . ".captain_id"],
                    ["from" => "election_roles_by_voters_captain50_phone_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => 'election_roles_by_voters_captain50_phone_' . $electionCampaign . '.phone_number As election_role_captains_of_fifty_phone_' . $electionCampaign, 'where' => []],

            'election_role_captains_of_fifty_city_' . $electionCampaign => ['join' => [["table" => "voters_with_captains_of_fifty as voters_with_captain50_city_" . $electionCampaign, "joinOn" => [["from" => "voters_with_captain50_city_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters.id"],
                ["from" => "voters_with_captain50_city_" . $electionCampaign . ".deleted", "condition" => "=", "to" => DB::Raw(0)],
                ["from" => "voters_with_captain50_city_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "election_roles_by_voters as election_roles_by_voters_captain50_city_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_captain50_city_" . $electionCampaign . ".voter_id", "condition" => "=", "to" => "voters_with_captain50_city_" . $electionCampaign . ".captain_id"],
                    ["from" => "election_roles_by_voters_captain50_city_" . $electionCampaign . ".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]],
                ["table" => "cities as captain50_city_" . $electionCampaign, "joinOn" => [["from" => "election_roles_by_voters_captain50_city_" . $electionCampaign . ".assigned_city_id", "condition" => "=", "to" => "captain50_city_" . $electionCampaign . ".id"],
                    ]]],
                'select' => 'captain50_city_' . $electionCampaign . '.name As election_role_captains_of_fifty_city_' . $electionCampaign, 'where' => []],

            /* Voter's driver */

            'driver_role_personal_identity_' . $electionCampaign => ['join' => [['table' => "voter_transportations AS previous_voter_transportations_identity_".$electionCampaign,
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "previous_voter_transportations_identity_".$electionCampaign.".voter_id"],
                    ["from" => "previous_voter_transportations_identity_".$electionCampaign.".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(previous_voter_transportations_identity_".$electionCampaign.".id is NULL , '' , (select voter_drivers_tbll_identity_".$electionCampaign.".personal_identity from voters as voter_drivers_tbll_identity_".$electionCampaign." where voter_drivers_tbll_identity_".$electionCampaign.".id=previous_voter_transportations_identity_".$electionCampaign.".voter_driver_id) ) as driver_role_personal_identity_" . $electionCampaign) , 'where' => []],

            'driver_role_full_name_' . $electionCampaign => ['join' => [['table' => "voter_transportations AS previous_voter_transportations_name_".$electionCampaign,
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "previous_voter_transportations_name_".$electionCampaign.".voter_id"],
                    ["from" => "previous_voter_transportations_name_".$electionCampaign.".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(previous_voter_transportations_name_".$electionCampaign.".id is NULL , '' , (select CONCAT(voter_drivers_tbll_".$electionCampaign.".first_name , ' ' ,voter_drivers_tbll_".$electionCampaign.".last_name) from voters as voter_drivers_tbll_".$electionCampaign." where voter_drivers_tbll_".$electionCampaign.".id=previous_voter_transportations_name_".$electionCampaign.".voter_driver_id) ) as driver_role_full_name_" . $electionCampaign) , 'where' => []],

            'driver_role_phone_number_' . $electionCampaign => ['join' => [['table' => "voter_transportations AS previous_voter_transportations_phone_".$electionCampaign,
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "previous_voter_transportations_phone_".$electionCampaign.".voter_id"],
                    ["from" => "previous_voter_transportations_phone_".$electionCampaign.".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(previous_voter_transportations_phone_".$electionCampaign.".id is NULL , '' , (select phone_number from election_roles_by_voters  where election_campaign_id=".$electionCampaign." and voter_id=previous_voter_transportations_phone_".$electionCampaign.".voter_driver_id) ) as driver_role_phone_number_" . $electionCampaign) , 'where' => []],

        ];
        return isset($detailsDisplayColumns[$columnName]) ? $detailsDisplayColumns[$columnName] : false;
    }

	/*
		Private helpful function that gets columnName , currentElectionCampaign and
		previous election campaign , and returns selects , joins and wheres that 
		needed to add that row into the query correctly
	*/
    private function getDetailsColumnSettings($columnName, $electionCampaign, $perElectionCampaign)
    {
        $current_election_cluster_alias = $this->clusterQuery('current_election_cluster_clusters');
        if ( $perElectionCampaign ) {
            $previous_election_cluster_alias = $this->clusterQuery('previous_election_cluster_clusters_' . $electionCampaign);
        } else {
            $previous_election_cluster_alias = $this->clusterQuery('previous_election_cluster_clusters');
        }
        $current_election_cluster_address_alias = $this->clusterQuery('current_election_cluster_address_clusters');

        $electionTypes  = "(" . config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET') . "," . config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL') . ")";
        $foundPrevElectionCampId = ''; $foundPrevElectionCampIdQuery = '';
        if( $columnName == 'current_election_new_voter' || $columnName == ('previous_election_new_voter_' . $electionCampaign) ){
            $electionCampaignCondition = ($columnName == 'current_election_new_voter') ? "!= $this->currentElectionCampaignId" : "< $electionCampaign";
            $foundPrevElectionCampId = "SELECT election_campaigns.id FROM election_campaigns WHERE election_campaigns.id $electionCampaignCondition and election_campaigns.type in $electionTypes ORDER BY election_campaigns.id desc LIMIT 0,1";
            $foundPrevElectionCampIdQuery = "SELECT viec2.id FROM voters_in_election_campaigns as viec2 WHERE viec2.voter_id = voters.id and viec2.election_campaign_id = ($foundPrevElectionCampId)";
        }

        $phoneQuery=" SELECT vp.phone_number FROM voter_phones AS vp WHERE vp.voter_id = voters.id AND vp.wrong = 0";
        $orderByPhoneQuery=" ORDER BY  CASE WHEN vp.phone_number LIKE '05%' THEN 1 WHEN vp.phone_number NOT LIKE '05%' THEN 2 END ASC ,vp.updated_at DESC, vp.id ";

        $phoneTypeQuery = " SELECT pt.name FROM voter_phones AS vp
                          join phone_types pt on pt.id = vp.phone_type_id
                          WHERE vp.voter_id = voters.id AND vp.wrong = 0";
       
        //Set sort names for Column alias:
        $p = 'previous_election_ballot_box_city';

        //End Set sort names for Column alias.

        if ( $perElectionCampaign === true || $perElectionCampaign === 'true' ) {
            $detailsData = [
                'previous_election_cluster_alias' => $previous_election_cluster_alias,
                'foundPrevElectionCampIdQuery' => $foundPrevElectionCampIdQuery
            ];

            return $this->getDetailsColumnPerElectionSettings($columnName, $electionCampaign, $detailsData);
        }
        if($columnName == 'personal_id' && !GlobalController::isActionPermitted('elections.reports.general.display_personal_identity') ){
            return;
        }
        $detailsDisplayColumns = [
            'voter_key' => ['join' => [], 'select' => DB::raw("voters.key AS voter_key"), 'where' => []],
            'full_name' => ['join' => [], 'select' => DB::raw("CONCAT(voters.first_name,' ', voters.last_name) AS full_name"), 'where' => []],
            'first_name' => ['join' => [], 'select' => 'voters.first_name', 'where' => []],
            'last_name' => ['join' => [], 'select' => 'voters.last_name', 'where' => []],
            'personal_id' => ['join' => [], 'select' => 'voters.personal_identity AS personal_id', 'where' => []],
            'email' => ['join' => [], 'select' => 'voters.email', 'where' => []],
            'previous_name' => ['join' => [], 'select' => 'voters.previous_last_name AS previous_name', 'where' => []],
            'age' => ['join' => [], 'select' => DB::raw("CAST(IF(voters.birth_date IS NULL,'',TIMESTAMPDIFF(YEAR, voters.birth_date, CURDATE())) AS UNSIGNED INTEGER) AS age"), 'where' => []],
            'birth_year' => ['join' => [], 'select' => DB::raw("IF(voters.birth_date IS NULL,'לא מוגדר', YEAR(voters.birth_date)) AS birth_year"), 'where' => []],
            'gender' => ['join' => [], 'select' => DB::raw("CASE voters.gender WHEN 1 THEN 'זכר' WHEN 2 THEN 'נקבה' ELSE 'לא מוגדר' END AS gender"), 'where' => []],
            'origin_country' => ['join' => [['table' => "countries AS origin_country",
                "joinOn" => [["from" => "voters.origin_country_id", "condition" => "=", "to" => "origin_country.id"],
                    ["from" => "origin_country.deleted", "condition" => "=", "to" => DB::Raw('0')]]]],
                'select' => 'origin_country.name AS origin_country', 'where' => []],
            'ethnic' => ['join' => [['table' => "ethnic_groups as ethnic_groups_1", "joinOn" => [
                ["from" => "voters.ethnic_group_id", "condition" => "=", "to" => "ethnic_groups_1.id"],
                ["from" => "ethnic_groups_1.deleted", "condition" => "=", "to" => DB::Raw('0')]]]],
                'select' => 'ethnic_groups_1.name AS ethnic', 'where' => []],
            'religious_group' => ['join' => [['table' => "religious_groups", "joinOn" => [
                ["from" => "voters.religious_group_id", "condition" => "=", "to" => "religious_groups.id"],
                ["from" => "religious_groups.deleted", "condition" => "=", "to" => DB::Raw('0')]]]],
                'select' => 'religious_groups.name AS religious_group', 'where' => []],
            'sephardi' => ['join' => [], 'select' => DB::raw("CASE voters.sephardi WHEN 1 THEN 'כן' WHEN 0 THEN 'לא' ELSE 'לא ידוע' END AS sephardi"), 'where' => []],
            'strictly_orthodox' => ['join' => [], 'select' => DB::raw("CASE voters.strictly_orthodox WHEN 1 THEN 'כן' WHEN 0 THEN 'לא' ELSE 'לא ידוע' END AS strictly_orthodox"), 'where' => []],
            'father_name' => ['join' => [], 'select' => 'voters.father_name', 'where' => []],
            'title' => ['join' => [['table' => "voter_titles", "joinOn" => [["from" => "voters.voter_title_id", "condition" => "=", "to" => "voter_titles.id"],
                ["from" => "voter_titles.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'select' => DB::raw("IF(voter_titles.name IS NULL,'',voter_titles.name) AS title"), 'where' => []],
            'ending' => ['join' => [['table' => "voter_endings", "joinOn" => [["from" => "voters.voter_ending_id", "condition" => "=", "to" => "voter_endings.id"],
                ["from" => "voter_endings.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'select' => DB::raw("IF(voter_endings.name IS NULL,'',voter_endings.name) AS ending"), 'where' => []],
          
            'full_address' => ['join' => [["table" => "cities as actual_city", "joinOn" => [["from" => "voters.city_id", "condition" => "=", "to" => "actual_city.id"]]],
                ["table" => "streets", "joinOn" => [["from" => "voters.street_id", "condition" => "=", "to" => "streets.id"]]]],
                'select' => DB::raw("CONCAT(IF(streets.name IS NULL,voters.street,CONCAT(streets.name,', ')),' ', IF(voters.house IS NULL,'',CONCAT(voters.house,', ')), IF(voters.flat IS NULL,'',CONCAT('דירה ',voters.flat,', ')), actual_city.name) AS full_address"), 'where' => []],
            
            'mi_city_id' => ['join' => [], 'select' => 'voters.mi_city_id', 'where' => []],
            'city' => ['join' => [['table' => "cities as current_cities", "joinOn" => [["from" => "voters.city_id", "condition" => "=", "to" => "current_cities.id"],
                ["from" => "current_cities.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'select' => DB::raw("IF(voters.city_id is NULL , voters.city , current_cities.name) as city"), 'where' => []],
            
            'neighborhood' => ['join' => [], 'select' => 'voters.neighborhood', 'where' => []],
            'mi_street_id' => ['join' => [], 'select' => 'voters.mi_street_id', 'where' => []],
            'street' => ['join' => [['table' => "streets", "joinOn" => [["from" => "voters.street_id", "condition" => "=", "to" => "streets.id"],
                ["from" => "streets.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'select' => 'streets.name AS street', 'where' => []],
            'house' => ['join' => [], 'select' => 'voters.house', 'where' => []],
            'house_entry' => ['join' => [], 'select' => 'voters.house_entry', 'where' => []],
            'flat' => ['join' => [], 'select' => 'voters.flat', 'where' => []],
            'zip' => ['join' => [], 'select' => 'voters.zip', 'where' => []],
            'distribution_code' => ['join' => [], 'select' => 'voters.distribution_code', 'where' => []],
            'actual_address_correct' => ['join' => [], 'select' => 'voters.actual_address_correct', 'where' => []],
            'mi_address_similar_to_real' => [
                'join' => [
                    ["table" => "cities", "joinOn" => [["from" => "voters.city_id", "condition" => "=", "to" => "cities.id"]]],
                    ["table" => "streets", "joinOn" => [["from" => "voters.street_id", "condition" => "=", "to" => "streets.id"]]],
                ],'select' => DB::raw("IF(STRCMP(CONCAT(IF(streets.name IS NULL,voters.street,streets.name),' ', IF(voters.house IS NULL,'',CONCAT(voters.house,', ')) , IF(voters.flat IS NULL,'',CONCAT(voters.flat,', ')),cities.name),
                CONCAT(voters.mi_street,' ', IF(voters.mi_house IS NULL,'',CONCAT(voters.mi_house,', ')) , IF(voters.mi_flat IS NULL,'',CONCAT(voters.mi_flat,', ')),voters.mi_city))=0,'כן'" . ",'לא') AS mi_address_similar_to_real"),
                'where' => [],
            ], //todo
            'mi_full_address' => ['join' => [['table' => "cities as mi_full_addr_city", "joinOn" => [
                ["from" => "voters.mi_city_id", "condition" => "=", "to" => "mi_full_addr_city.id"],
                ["from" => "mi_full_addr_city.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'where' => [],
                'select' => DB::raw("CONCAT(voters.mi_street,' ', IF(voters.mi_house IS NULL,'',CONCAT(voters.mi_house,', ')) , IF(voters.mi_flat IS NULL,'',CONCAT('דירה ',voters.mi_flat,', ')), IF(mi_full_addr_city.name IS null,voters.mi_city , mi_full_addr_city.name)) AS mi_full_address")],

            'mi_city' => ['join' => [['table' => "cities as mi_cities", "joinOn" => [["from" => "voters.mi_city_id", "condition" => "=", "to" => "mi_cities.id"],
                ["from" => "mi_cities.deleted", "condition" => "=", "to" => DB::Raw('0')]]]], 'select' => DB::raw("IF(voters.mi_city_id is NULL , voters.mi_city , mi_cities.name) as mi_city"), 'where' => []], /*['join' => [], 'select' => 'voters.mi_city', 'where' => []], */
            'mi_neighborhood' => ['join' => [], 'select' => 'voters.mi_neighborhood', 'where' => []],

            'mi_street' => ['join' => [], 'select' => 'voters.mi_street', 'where' => []],
            'mi_house' => ['join' => [], 'select' => 'voters.mi_house', 'where' => []],
            'mi_house_entry' => ['join' => [], 'select' => 'voters.mi_house_entry', 'where' => []],
            'mi_flat' => ['join' => [], 'select' => 'voters.mi_flat', 'where' => []],
            'mi_zip' => ['join' => [], 'select' => 'voters.mi_zip', 'where' => []],
            'main_phone_type' => ['join' => [],
                'select' => DB::Raw("(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
                THEN( SELECT pt.name FROM voter_phones AS vp 
                JOIN phone_types pt on pt.id = vp.phone_type_id WHERE ( vp.id = voters.main_voter_phone_id))
                ELSE( $phoneTypeQuery $orderByPhoneQuery LIMIT 1) END) AS main_phone_type"), 
                'where' => []
              ],
            'main_phone' => ['join' => [],
            // 'main_phone' => ['join' => [['table' => "voter_phones", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "voter_phones.voter_id"]]]],
                'select' => DB::Raw("(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
                THEN( SELECT vp.phone_number FROM voter_phones AS vp WHERE ( vp.id = voters.main_voter_phone_id))
                ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1) END) AS main_phone"),
                'where' => []],
            'main_phone_2_type' => ['join' => [],
                'select' => DB::raw("(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
                THEN( $phoneTypeQuery  AND vp.id != voters.main_voter_phone_id $orderByPhoneQuery LIMIT 1 )
                ELSE( $phoneTypeQuery $orderByPhoneQuery LIMIT 1,1) END) AS main_phone_2_type"),
                'where' => []
              ],
            'main_phone_2' => ['join' => [],
                'select' => DB::Raw("(CASE WHEN voters.main_voter_phone_id IS NOT NULL 
                THEN( $phoneQuery  AND vp.id != voters.main_voter_phone_id $orderByPhoneQuery LIMIT 1 )
                ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1,1) END) AS main_phone_2"),
                'where' => []],
            'tm_block' => ['join' => [], 'select' => '', 'where' => []], //todo
            'sms_block' => ['join' => [], 'select' => '', 'where' => []], //todo

            /*current_support_statusess*/
            'current_support_status_election' => ['join' => [['table' => "voter_support_status as vss_gr_e", "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "vss_gr_e.voter_id"],
                    ["from" => "vss_gr_e.entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))],
                    ["from" => "vss_gr_e.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]],
                ['table' => "support_status AS ss", "joinOn" => [["from" => "vss_gr_e.support_status_id", "condition" => "=", "to" => "ss.id"]]]],
                'select' => DB::raw("IF(ss.name IS NULL,'ללא סטטוס', ss.name) AS current_support_status_election"), 'where' => []],
         
            'current_support_status_tm' => ['join' => [['table' => "voter_support_status as vss_tm", "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "vss_tm.voter_id"],
                    ["from" => "vss_tm.entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))],
                    ["from" => "vss_tm.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]],
                ['table' => "support_status AS ss_t", "joinOn" => [["from" => "vss_tm.support_status_id", "condition" => "=", "to" => "ss_t.id"]]]],
                'select' => DB::raw("IF(ss_t.name IS NULL,'ללא סטטוס', ss_t.name) AS current_support_status_tm"), 'where' => []],

            'current_support_status_final' => ['join' => [['table' => "voter_support_status as vss_f", "joinOn" => [["from" => "viec.voter_id", "condition" => "=", "to" => "vss_f.voter_id"],
                    ["from" => "vss_f.entity_type", "condition" => "=", "to" => DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                    ["from" => "vss_f.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]],
                ['table' => "support_status AS ss_f", "joinOn" => [["from" => "vss_f.support_status_id", "condition" => "=", "to" => "ss_f.id"]]]],
                'select' => DB::raw("IF(ss_f.name IS NULL,'ללא סטטוס', ss_f.name) AS current_support_status_final"), 'where' => []],
            
            'exists_in_current_election_campain_voters' => ['join' => [
                ['table' => "voters_in_election_campaigns as viec_exists_in_current",
                "joinOn" => [["from" => "viec_exists_in_current.voter_id", "condition" => "=", "to" => "voters.id"],
                             ["from" => "viec_exists_in_current.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]]],
                'select' => DB::raw("IF(viec_exists_in_current.election_campaign_id IS NOT NULL,'קיים'" . ",'לא קיים') AS exists_in_current_election_campain_voters"), 'where' => []],

            /*current_election_vote*/
            'current_election_vote' => ['join' => [
                ['table' => "votes as prev_campaign_votes",
                    "joinOn" => [
                        ["from" => "prev_campaign_votes.voter_id", "condition" => "=", "to" => "voters.id"],
                        ["from" => "prev_campaign_votes.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]
                    ]
                ]],
                'select' => DB::raw("IF(prev_campaign_votes.election_campaign_id IS NULL,'לא הצביע'" . ", 'הצביע') AS current_election_vote"),
                'where' => []
            ],

            'current_election_vote_time' => ['join' => [
                ['table' => "votes as current_campaign_votes",
                    "joinOn" => [
                        ["from" => "current_campaign_votes.voter_id", "condition" => "=", "to" => "voters.id"],
                        ["from" => "current_campaign_votes.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]
                ]],

                'select' => DB::raw("IF(current_campaign_votes.vote_date IS NULL,'לא הצביע', TIME(current_campaign_votes.vote_date)) AS current_election_vote_time"),
                'where' => []
            ],

            'current_election_ballot_box_city_id' => ['join' => [
                ["table" => "ballot_boxes as current_campaign_ballot_box_city_id_ballot_boxes", "joinOn" => [["from" => "current_campaign_ballot_box_city_id_ballot_boxes.id", "condition" => "=", "to" => "viec.ballot_box_id"]]],
                ["table" => "clusters as current_campaign_ballot_box_city_id_clusters", "joinOn" => [["from" => "current_campaign_ballot_box_city_id_clusters.id", "condition" => "=", "to" => "current_campaign_ballot_box_city_id_ballot_boxes.cluster_id"], ["from" => "current_campaign_ballot_box_city_id_clusters.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]],
                ["table" => "cities as current_campaign_ballot_box_city_id_cities", "joinOn" => [["from" => "current_campaign_ballot_box_city_id_clusters.city_id", "condition" => "=", "to" => "current_campaign_ballot_box_city_id_cities.id"]]]],

                'select' => 'current_campaign_ballot_box_city_id_cities.mi_id AS current_election_ballot_box_city_id',
                'where' => []
            ],

            'current_election_ballot_box_city' => ['join' => [
                ["table" => "ballot_boxes as current_election_ballot_box_city_ballot_boxes", "joinOn" => [["from" => "current_election_ballot_box_city_ballot_boxes.id", "condition" => "=", "to" => "viec.ballot_box_id"]]],
                ["table" => "clusters as current_election_ballot_box_city_clusters", "joinOn" => [["from" => "current_election_ballot_box_city_clusters.id", "condition" => "=", "to" => "current_election_ballot_box_city_ballot_boxes.cluster_id"],
                    ["from" => "current_election_ballot_box_city_clusters.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]],
                ["table" => "cities", "joinOn" => [["from" => "current_election_ballot_box_city_clusters.city_id", "condition" => "=", "to" => "cities.id"]]]],

                'select' => 'cities.name AS current_election_ballot_box_city',
                'where' => []
            ],

            // 'current_election_cluster_id' => ['join' => [], 'select' => '', 'where' => []],//todo
            'current_election_cluster' => ['join' =>
                [
                    ["table" => "ballot_boxes as current_election_cluster_ballot_boxes", "joinOn" => [["from" => "current_election_cluster_ballot_boxes.id", "condition" => "=", "to" => "viec.ballot_box_id"]]],
                    ["table" => "clusters as current_election_cluster_clusters",
                        "joinOn" => [
                            ["from" => "current_election_cluster_clusters.id", "condition" => "=", "to" => "current_election_cluster_ballot_boxes.cluster_id"],
                            ["from" => "current_election_cluster_clusters.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]
                        ]
                    ]
                ],

                'select' => DB::raw("CONCAT ($current_election_cluster_alias) as current_election_cluster"),
                'where' => []
            ],

            'current_election_cluster_address' => ['join' => [
                ["table" => "ballot_boxes as current_election_cluster_address_ballot_boxes", "joinOn" => [["from" => "current_election_cluster_address_ballot_boxes.id", "condition" => "=", "to" => "viec.ballot_box_id"]]],
                ["table" => "clusters as current_election_cluster_address_clusters", "joinOn" => [
                    ["from" => "current_election_cluster_address_clusters.id", "condition" => "=", "to" => "current_election_cluster_address_ballot_boxes.cluster_id"],
                    ["from" => "current_election_cluster_address_clusters.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]
                ]]
            ],

                'select' => DB::raw("CONCAT(current_election_cluster_address_clusters.street,' ', current_election_cluster_address_clusters.street_id,', ',$current_election_cluster_address_alias) AS current_election_cluster_address"),
                'where' => []
            ],

            'current_election_ballot_box_id' => ['join' => [
                ['table' => "ballot_boxes as current_election_ballot_box_id_ballot_boxes", "joinOn" => [["from" => "current_election_ballot_box_id_ballot_boxes.id", "condition" => "=", "to" => "viec.ballot_box_id"]]]],
                'select' => DB::Raw('(IF (LENGTH(current_election_ballot_box_id_ballot_boxes.mi_id) <= 1 ,current_election_ballot_box_id_ballot_boxes.mi_id , CONCAT(SUBSTR(current_election_ballot_box_id_ballot_boxes.mi_id , 1 , LENGTH(current_election_ballot_box_id_ballot_boxes.mi_id) - 1) , "." , SUBSTR(current_election_ballot_box_id_ballot_boxes.mi_id , LENGTH(current_election_ballot_box_id_ballot_boxes.mi_id) , 1)) ) ) AS current_election_ballot_box_id'),
                'where' => []
            ],
            // 'current_election_ballot_box_address' => ['join' => [], 'select' => '', 'where' => []], //todo same as cluster, but there is cluster address ...

            'current_election_voter_number' => ['join' => [["table" => "voters_in_election_campaigns as viec_sn",
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "viec_sn.voter_id"], ["from" => "viec_sn.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]]],
                'select' => 'viec_sn.voter_serial_number as current_election_voter_number',
                'where' => []
            ],

            'current_election_new_voter' => ['join' => [["table" => "voters_in_election_campaigns AS current_campaign", "joinOn" =>
                [["from" => "current_campaign.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)],
                 ["from" => "current_campaign.voter_id", "condition" => "=", "to" => 'voters.id']
                ]]],
                'select' => DB::raw("IF(current_campaign.election_campaign_id IS NOT NULL AND ($foundPrevElectionCampIdQuery) IS NULL , 'חדש','לא חדש') AS current_election_new_voter"),
                'where' => []],

            // getClusterFullNameQuery($varName = 'cluster_name', $withConcat = true, $table = 'clusters')
            //$this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
            //$this->fullClusterNameInnerQuery = Cluster::getClusterFullNameQuery('',false);

            // 'previous_election_ballot_box_address' => ['join' => [], 'select' => '', 'where' => []], //todo same as cluster, but there is cluster address ...

            'institute_name' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institutes", "joinOn" => [["from" => "institute_roles_by_voters.institute_id", "condition" => "=", "to" => "institutes.id"]]], 'prevent_extra_join' => true],
                'select' => 'institutes.name AS institute_name', 'where' => []],
            'institute_city' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institutes", "joinOn" => [["from" => "institute_roles_by_voters.institute_id", "condition" => "=", "to" => "institutes.id"]]],
                ["table" => "cities as institute_cities", "joinOn" => [["from" => "institutes.city_id", "condition" => "=", "to" => "institute_cities.id"]]], 'prevent_extra_join' => true],
                'select' => 'institute_cities.name AS institute_city', 'where' => []],
            'institute_type' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institutes", "joinOn" => [["from" => "institute_roles_by_voters.institute_id", "condition" => "=", "to" => "institutes.id"]]],
                ["table" => "institute_types", "joinOn" => [["from" => "institutes.institute_type_id", "condition" => "=", "to" => "institute_types.id"]]], 'prevent_extra_join' => true],
                'select' => 'institute_types.name AS institute_type', 'where' => []],
            'institute_network' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institutes", "joinOn" => [["from" => "institute_roles_by_voters.institute_id", "condition" => "=", "to" => "institutes.id"]]],
                ["table" => "institute_networks", "joinOn" => [["from" => "institutes.institute_network_id", "condition" => "=", "to" => "institute_networks.id"]]], 'prevent_extra_join' => true],
                 'select' => 'institute_networks.name AS institute_network', 'where' => []],
            'institute_group' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institutes", "joinOn" => [["from" => "institute_roles_by_voters.institute_id", "condition" => "=", "to" => "institutes.id"]]],
                ["table" => "institute_types", "joinOn" => [["from" => "institutes.institute_type_id", "condition" => "=", "to" => "institute_types.id"]]],
                ["table" => "institute_groups", "joinOn" => [["from" => "institute_types.institute_group_id", "condition" => "=", "to" => "institute_groups.id"]]], 'prevent_extra_join' => true],
                'select' => 'institute_groups.name AS institute_group', 'where' => []],
            'institute_role' => ['join' => [["table" => "institute_roles_by_voters", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "institute_roles_by_voters.voter_id"]]],
                ["table" => "institute_roles", "joinOn" => [["from" => "institute_roles_by_voters.institute_role_id", "condition" => "=", "to" => "institute_roles.id"]]], 'prevent_extra_join' => true],
                'select' => 'institute_roles.name AS institute_role', 'where' => []],
            
            'voter_shas_group' => ['join' => [["table" => "voters_in_groups as voters_exist_in_groups", "joinOn" => [["from" => "voters_exist_in_groups.voter_id", "condition" => "=", "to" => "voters.id"]]],
                ["table" => "voter_groups as voter_exist_group", "joinOn" => [["from" => "voter_exist_group.id", "condition" => "=", "to" => "voters_exist_in_groups.voter_group_id"]]],
                 'prevent_extra_join' => true],
                'select' => DB::raw("IF(voters_exist_in_groups.voter_id IS NULL,'לא'" . ",'כן') AS voter_shas_group"), 'where' => []],
           
            'user_key' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"], ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]]],
                'select' => 'users.key AS user_key', 'where' => []],

            'creator_user' => ['join' => [["table" => "users as currentUser","joinOn" => [
                ["from" => "voters.id", "condition" => "=", "to" => "currentUser.voter_id"],
                ["from" => "currentUser.deleted", "condition" => "=", "to" => DB::raw(0)]]],
                ["table" => "users AS creatorUser", "joinOn" => [["from" => "currentUser.user_create_id", "condition" => "=", "to" => "creatorUser.id"]]],
                ["table" => "voters AS creatorVoter", "joinOn" => [["from" => "creatorUser.voter_id", "condition" => "=", "to" => "creatorVoter.id"]]]],

                'select' => DB::raw("CONCAT(creatorVoter.first_name,' ', creatorVoter.last_name) AS creator_user"), 'where' => []],

            'create_date' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]]],
                'select' => 'users.created_at AS create_date', 'where' => []],
            'password_date' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]]],
                'select' => 'users.password_date AS password_date', 'where' => []],
            'is_admin' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]]],
                'select' => DB::raw("IF(users.admin = 1 ,'כן'" . ",'לא') AS is_admin"), 'where' => []],
            'is_active' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]]],
                'select' => DB::raw("IF(users.active = 1 ,'כן'" . ",'לא') AS is_active"), 'where' => []],
            'main_team' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]],
                ["table" => "roles_by_users", "joinOn" => [["from" => "users.id", "condition" => "=", "to" => "roles_by_users.user_id"]
                    , ["from" => "roles_by_users.main", "condition" => "=", "to" => DB::raw(1)], ["from" => "roles_by_users.deleted", "condition" => "=", "to" => DB::raw(0)]]],
                ["table" => "teams", "joinOn" => [["from" => "roles_by_users.team_id", "condition" => "=", "to" => "teams.id"]]]],
                'select' => 'teams.name AS main_team', 'where' => []],
            'main_role' => ['join' => [["table" => "users", "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "users.voter_id"],
                ["from" => "users.deleted", "condition" => "=", "to" => DB::raw(0)]]],
                ["table" => "roles_by_users", "joinOn" => [["from" => "users.id", "condition" => "=", "to" => "roles_by_users.user_id"]
                    , ["from" => "roles_by_users.main", "condition" => "=", "to" => DB::raw(1)], ["from" => "roles_by_users.deleted", "condition" => "=", "to" => DB::raw(0)]]],
                ["table" => "user_roles", "joinOn" => [["from" => "roles_by_users.user_role_id", "condition" => "=", "to" => "user_roles.id"]]]],
                'select' => 'user_roles.name AS main_role', 'where' => []],

			'current_transportation' => ['join' => [['table' => "voter_transportations AS current_voter_transportations",
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "current_voter_transportations.voter_id"],
                    ["from" => "current_voter_transportations.election_campaign_id", "condition" => "=", "to" => DB::Raw($this->currentElectionCampaignId)]]]],
                'select' => DB::raw("IF(current_voter_transportations.id is NULL , 'ללא' , IF(current_voter_transportations.cripple = 1 , 'נכה' 
				, 'רגילה')) as current_transportation") , 'where' => []],
			'previous_transportation' => ['join' => [['table' => "voter_transportations AS previous_voter_transportations_".$electionCampaign,
                "joinOn" => [["from" => "voters.id", "condition" => "=", "to" => "previous_voter_transportations_".$electionCampaign.".voter_id"],
                    ["from" => "previous_voter_transportations_".$electionCampaign.".election_campaign_id", "condition" => "=", "to" => DB::Raw($electionCampaign)]]]],
                'select' => DB::raw("IF(previous_voter_transportations_".$electionCampaign.".id is NULL , 'ללא' , IF(previous_voter_transportations_".$electionCampaign.".cripple = 1 , 'נכה' 
				, 'רגילה')) as previous_transportation") , 'where' => []],

	// 'election_role_ballot_box_representative_phone' => ['join' => [], 'select' => '', 'where' => []], //todo

        ];

        return isset($detailsDisplayColumns[$columnName]) ? $detailsDisplayColumns[$columnName] : false;
    }
    public function test(Request $request){
        $jsonOutput = app()->make("JsonOutput");

        $jsonOutput->setData([]);
    }

    /**
     * Get support status list for general report
     *
     * @return void
     */
    public function getSupportStatus(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $supportStatus = SupportStatus::select('id',
                                              DB::raw("CONCAT('status_', id) as `key`"),
                                              'election_campaign_id',
                                              'name')
                                            ->where('deleted', 0)
                                            ->where('active',1)
                                            ->orderBy('election_campaign_id', 'DESC')
                                            ->orderBy('level', 'DESC');//['deleted'=> 0,'active'=> 1]
        $noSupport = SupportStatus::select(DB::raw("-1 AS id,
                                                    'no_status' AS 'key',
                                                    -1 AS election_campaign_id,
                                                    'ללא סטטוס' AS name"))->limit(1);
        $totalSupportStatus =  $noSupport->union($supportStatus)->get();

        $jsonOutput->setData($totalSupportStatus);
    }
}
