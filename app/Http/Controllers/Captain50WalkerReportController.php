<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Streets;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\Voters;
use App\Models\VoterPhone;
use App\Models\VoterSupportStatus;
use App\Models\VoterTransportation;
use App\Models\SupportStatus;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
use App\Models\GeographicFilters;

use App\Libraries\Services\GeoFilterService;

use Auth;
use Illuminate\Http\Request;
use App\Models\VoterFilter\VoterQuery;
use App\Models\VoterFilter\VoterFilterDefinition;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;


class Captain50WalkerReportController extends Controller
{
	/*
		Constructor function
	*/
	public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('name',true);
    }
	
	public $VOTER_ROLE_CAPTAIN_FIFTY_ROLE_ID=2;
	public $STATIONARY_PHONE_TYPE_ID = 1;
	public $DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE = 100;
	public $DEFAULT_CURRENT_PAGE = 1;
	
	/*
	Print voter search results 
	
	@params request
	*/
	public function printCap50WalkerReportByParams(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);
		$dataObj = $this->getVotersByQueryParams($request , true );
		$dataToPrint = collect($dataObj)->toArray();
		$voterList = $dataToPrint['voterList'];
		$captainHash = $this->getCaptian50HashForPrint($voterList , $request->input('show_support_status'));
	 	return view('reports.cap50Walker' , ['captainHash'=>$captainHash,'voterList'=>$voterList]);
	}
	/*
	Print voter search results 
	
	@params request
	*/
	public function printCap50WalkerReportByCaptainKeys(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);
		$captain50_key_list = explode(',', $request->captain50_key_list);
		
		$currentCampaign = ElectionCampaigns::currentCampaign();
	    if(!$currentCampaign){
			echo 'לא הוגדר קמפיין במערכת!'; return;
		}
	    if(count($captain50_key_list) == 0){
			echo 'לא נבחרו שרי 100!'; return;
		}
		$electionCampaignID = $currentCampaign->id;
		$electionCampaignType = $currentCampaign->type;
			
	    $previousCampaignID = ElectionCampaigns::select('id')
		                     ->where('type', $electionCampaignType)
							 ->where('id', '!=', $electionCampaignID)
							 ->orderBy('end_date', 'DESC')->first()['id'];

		$votersQuery = $this->getVotersQuery($electionCampaignID, $previousCampaignID );
		$votersQuery->withCaptainOnly($electionCampaignID)->withCity()
		->whereIn('captain_voters.key', $captain50_key_list);

		$voterList = $votersQuery->get()->toArray();
		$captainHash = $this->getCaptian50HashForPrint($voterList , $request->input('show_support_status'));
	//  dd($voterList[count($voterList)-1]);
	 	return view('reports.cap50Walker' , ['captainHash'=>$captainHash,'voterList'=>$voterList]);
	}
		/**
	 * @method getCaptian50HashForPrint
	 * - Get captain hash details for all voter
	 * -> only for print view!
	 * -> Not sent query to DB, but get the data from the user list
	 * @param [array] $voterList - voter list of all voters details
	 * @return {object} captainHash - hash table for the captain details
	 * voters_count -> total number of voters
	 * households_count -> total number of households
	 */
	private function getCaptian50HashForPrint(&$voterList , $showSupportStatus){
		$captainHash = [];
		$currentHouseholdId = null;
		$currentCaptainId = null;
		for($i = 0 ; $i < sizeof($voterList) ; $i++){
			$voterRow = $voterList[$i];
			$currentCaptainId = $voterRow['captain_personal_identity'];
 
			if($showSupportStatus != "1"){
				$voterList[$i]['support_status_name'] = "";
			}
			if(empty($captainHash[$currentCaptainId])){
				$captainHash[$currentCaptainId]=[
					'voters_count' => 0,
					'households_count'=>0,
				];
			}
			$captainHash[$currentCaptainId]['voters_count']++;
			if($currentHouseholdId != $voterRow['household_id']){
				$captainHash[$currentCaptainId]['households_count']++;
				$currentHouseholdId = $voterRow['household_id'];
			}
		}
		 
	return $captainHash;
	}
	/**
	 * @method updateCap50WalkerReportVoterRowData
	 * Save the row data only:
	 * 1. not_at_home 
	 * 2. support_status
	 * @todo save  support_status_key can be in private function 
	 * -> it is equal to updateCap50WalkerReportVoterData support_status_key.
	 * @param Request $request
	 * @param [string] $voterKey
	 * @return void
	 */
	public function updateCap50WalkerReportVoterRowData(Request $request , $voterKey){
		$jsonOutput = app()->make("JsonOutput");

		$currentCampaign = ElectionCampaigns::currentCampaign();
	    if($currentCampaign){ 
			$electionCampaignID = $currentCampaign->id;
		    $electionCampaignType = $currentCampaign->type;
		}
		$updatesCount=0;
		$voter = Voters::where('key' , $voterKey)->first();
		if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
		    return;	
		}

		if(!GlobalController::isActionPermitted('elections.reports.captain_of_fifty_walker.edit')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }

        $historyArgsArr = [
            'topicName' => 'elections.reports.captain_of_fifty_walker.edit',
            'models' => []
		];
		if($voter->not_at_home != $request->input('not_at_home')){
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'not_at_home',
                'display_field_name' => config('history.Voters.not_at_home'),
                'old_numeric_value' => ($voter->not_at_home == '1' ? 1 : 0),
                'new_numeric_value' => ($request->input('not_at_home') == '1' ? 1 : 0)
            ];

			$voter->not_at_home = ($request->input('not_at_home') == '1' ? 1 : 0);
		}
		$voterCurrentSupportStatus = VoterSupportStatus::where('election_campaign_id' , $electionCampaignID)
		->where('voter_id' , $voter->id)
		->where('deleted' , DB::raw(0))
		->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
		->first();

	if($request->input('support_status_key') != null && trim($request->input('support_status_key')) != ''){

		$support_status = SupportStatus::select('id','key','name')->where('key',$request->input('support_status_key'))->where('deleted',0)->where('active',1)->first();
		if(!$support_status){
			$jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
			return;	
		}
		// Log::info('$voterCurrentSupportStatus ' . $support_status->id);
		// Log::info(json_encode($voterCurrentSupportStatus));

		if($voterCurrentSupportStatus){
			if($voterCurrentSupportStatus->support_status_id != $support_status->id){
				$updatesCount++;
				$oldSupportStatus = '';
				$old_support_status = SupportStatus::select('id','key','name')
					->where('id',$voterCurrentSupportStatus->support_status_id)
					->where('deleted',0)
					->where('active',1)
					->first();
				if($old_support_status){
					$oldSupportStatus = $old_support_status->name;
				}

				//array_push($fieldsArray , ['current_support_status', 'סטטוס תמיכה נוכחי',$oldSupportStatus,$support_status->name]);
				$historyArgsArr['models'][] = [
					'description' => 'עדכון סטטוס תמיכה נוכחי',
					'referenced_model' => 'VoterSupportStatus',
					'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
					'referenced_id' => $voterCurrentSupportStatus->id,
					'valuesList' => [
						[
							'field_name' => 'support_status_id',
							'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
							'old_value' => $oldSupportStatus,
							'new_value' => $support_status->name,
							'old_numeric_value' => $voterCurrentSupportStatus->support_status_id,
							'new_numeric_value' => $support_status->id
						]
					]
				];

				$voterCurrentSupportStatus->support_status_id = $support_status->id;
				$voterCurrentSupportStatus->update_user_id =  Auth::user()->id;
				$voterCurrentSupportStatus->save();
			}
		}
		else{
			$voterCurrentSupportStatus = new VoterSupportStatus;
			$voterCurrentSupportStatus->election_campaign_id = $electionCampaignID;
			$voterCurrentSupportStatus->voter_id = $voter->id;
			$voterCurrentSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
			$voterCurrentSupportStatus->support_status_id = $support_status->id;
			$voterCurrentSupportStatus->create_user_id = Auth::user()->id;
			$voterCurrentSupportStatus->update_user_id = Auth::user()->id;
			$voterCurrentSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
			$voterCurrentSupportStatus->save();

			$updatesCount++;
			//array_push($fieldsArray , ['current_support_status', 'סטטוס תמיכה נוכחי','',$support_status->name]);
			$statusFields = [
				'election_campaign_id',
				'voter_id',
				'entity_type',
				'support_status_id'
			];

			$insertedValues = [];
			for ( $fieldIndex = 0; $fieldIndex < count($statusFields); $fieldIndex++ ) {
				$fieldName = $statusFields[$fieldIndex];

				$insertedValues[] = [
					'field_name' => $fieldName,
					'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
					'new_numeric_value' => $voterCurrentSupportStatus->{$fieldName}
				];
			}

			$historyArgsArr['models'][] = [
				'description' => 'הוספת סטטוס תמיכה נוכחי',
				'referenced_model' => 'VoterSupportStatus',
				'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
				'referenced_id' => $voterCurrentSupportStatus->id,
				'valuesList' => $insertedValues
			];
		}	
	}
	$saves = $voter->save();
	if (  count($historyArgsArr['models']) > 0 ) {
		ActionController::AddHistoryItem($historyArgsArr);
	}
	
	$jsonOutput->setData($voter);	
	}
	
	/*
     Update specific voter by key in captain-of-50-walker report screen
	
	@params request
	@params voterKey
	*/
	public function updateCap50WalkerReportVoterData(Request $request , $voterKey){
		$jsonOutput = app()->make("JsonOutput");

		if(!GlobalController::isActionPermitted('elections.reports.captain_of_fifty_walker.edit')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$isResetCorrectAddress = false;

        $historyArgsArr = [
            'topicName' => 'elections.reports.captain_of_fifty_walker.edit',
            'models' => []
        ];

        $addressWasUpdated = false;
		$updatesCount = 0;

		$fieldsArray = [];
		$voterFieldsArray = [];
		$transportationFieldsArray = [];

        $voterPhones = null;
		$householdVoters = null;
	    $currentCampaign = ElectionCampaigns::currentCampaign();
	    if($currentCampaign){
			$electionCampaignID = $currentCampaign->id;
		    $electionCampaignType = $currentCampaign->type;
		}
	    $previousCampaignID = ElectionCampaigns::select('id')->where('type', $electionCampaignType)->where('id', '!=', $electionCampaignID)->orderBy('end_date', 'DESC')->first()['id'];

		$voter = Voters::where('key' , $voterKey)->first();
		if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
		    return;	
		}
		if($voter->comment != $request->input('comment')){
			$updatesCount++;

			array_push($voterFieldsArray , ['comment', 'הערה',$voter->comment,$request->input('comment')]);
            $voterFieldsArray[] = [
                'field_name' => 'comment',
                'display_field_name' => config('history.Voters.comment'),
                'old_value' => $voter->comment,
                'new_value' => $request->input('comment')
            ];

			$voter->comment = $request->input('comment');
		}
		$ethnic_group_id =  $request->input('ethnic_group_id');
		
		// dump($ethnic_group_id, $voter->ethnic_group_id);
		if($voter->ethnic_group_id != $ethnic_group_id){
			// dump('$ethnic_group_id');

			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'ethnic_group_id',
                'display_field_name' => config('history.Voters.ethnic_group_id'),
                'old_numeric_value' =>$voter->ethnic_group_id ,
                'new_numeric_value' => $ethnic_group_id
            ];

			$voter->ethnic_group_id = $ethnic_group_id;
		}
		$religious_group_id =  $request->input('religious_group_id');

		if($voter->religious_group_id != $religious_group_id){
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'religious_group_id',
                'display_field_name' => config('history.Voters.religious_group_id'),
                'old_numeric_value' => $voter->religious_group_id ,
                'new_numeric_value' => $religious_group_id
            ];

			$voter->religious_group_id = $religious_group_id;
		}
		$sephardi =  $request->input('sephardi');
		// dump($voter->sephardi , $sephardi ,$voter->sephardi !== $sephardi);
		if($voter->sephardi !== $sephardi){
			$updatesCount++;
			$sephardi = !is_null($sephardi) ? (int) $sephardi : null;

            $voterFieldsArray[] = [
                'field_name' => 'sephardi',
                'display_field_name' => config('history.Voters.sephardi'),
                'old_numeric_value' => $voter->sephardi ,
                'new_numeric_value' => $sephardi
            ];

			$voter->sephardi = $sephardi;
		}

		if($voter->not_at_home != $request->input('not_at_home')){
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'not_at_home',
                'display_field_name' => config('history.Voters.not_at_home'),
                'old_numeric_value' => ($voter->not_at_home == '1' ? 1 : 0),
                'new_numeric_value' => ($request->input('not_at_home') == '1' ? 1 : 0)
            ];

			$voter->not_at_home = ($request->input('not_at_home') == '1' ? 1 : 0);
	    }
		if($voter->additional_care != $request->input('additional_care')){
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'additional_care',
                'display_field_name' => config('history.Voters.additional_care'),
                'old_numeric_value' => ($voter->additional_care == '1' ? 1 : 0),
                'new_numeric_value' => ($request->input('additional_care') == '1' ? 1 : 0)
            ];

			$voter->additional_care = ($request->input('additional_care') == '1' ? 1 : 0);
		}
		if($voter->house != $request->input('house')){
            $addressWasUpdated = true;
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'house',
                'display_field_name' => config('history.Voters.house'),
                'old_value' => $voter->house,
                'new_value' => $request->input('house')
            ];

		    $voter->house = $request->input('house');
			$isResetCorrectAddress = true;
			 
		}
		if($voter->house_entry != $request->input('house_entry')){
            $addressWasUpdated = true;
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'house_entry',
                'display_field_name' => config('history.Voters.house_entry'),
                'old_value' => $voter->house_entry,
                'new_value' => $request->input('house_entry')
            ];

			$voter->house_entry = $request->input('house_entry');
		 
		}
		if($voter->flat != $request->input('flat')){
            $addressWasUpdated = true;
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'flat',
                'display_field_name' => config('history.Voters.flat'),
                'old_value' => $voter->flat,
                'new_value' => $request->input('flat')
            ];

			$voter->flat = $request->input('flat');
		}
		if($voter->zip != $request->input('zip')){
            $addressWasUpdated = true;
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'zip',
                'display_field_name' => config('history.Voters.zip'),
                'old_value' => $voter->zip,
                'new_value' => $request->input('zip')
            ];

			$voter->zip = $request->input('zip');
	    }
		if($voter->email != $request->input('email')){
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'email',
                'display_field_name' => config('history.Voters.email'),
                'old_value' => $voter->email,
                'new_value' => $request->input('email')
            ];

		    $voter->email = $request->input('email');
		}
		if($voter->actual_address_correct != $request->input('actual_address_correct')){
            $addressWasUpdated = true;
			$updatesCount++;

            $voterFieldsArray[] = [
                'field_name' => 'actual_address_correct',
                'display_field_name' => config('history.Voters.actual_address_correct'),
                'old_value' => ($voter->actual_address_correct=='1' ? 'מאומת' : ($voter->actual_address_correct =='0' ? 'שגוי' : 'חסר') ),
                'new_value' => ($request->input('actual_address_correct')=='1' ? 'מאומת' : ($request->input('actual_address_correct') =='0' ? 'שגוי' : 'חסר') ),
                'old_numeric_value' => $voter->actual_address_correct,
                'new_numeric_value' => $request->input('actual_address_correct')

            ];

			$voter->actual_address_correct = $request->input('actual_address_correct');
		}
		if($isResetCorrectAddress){
			$voter->actual_address_correct = NULL;
		}
		 
		$voterTransportation = VoterTransportation::where('voter_id' , $voter->id)->where('election_campaign_id',$electionCampaignID)->first();
		if($request->input('voter_transportations_id')){
			if(!$voterTransportation ) {
				$updatesCount++;
				//array_push($fieldsArray , ['voter_transportations_id', 'הסעה',"לא","כן"]);

				$voterTransportation = new VoterTransportation;
				$voterTransportation->election_campaign_id = $electionCampaignID;
				$voterTransportation->voter_id = $voter->id;
				$voterTransportation->key = Helper::getNewTableKey('voter_transportations', 5);

                $transportationFieldsArray[] = [
                    'field_name' => 'election_campaign_id',
                    'display_field_name' => config('history.VoterTransportation.election_campaign_id'),
                    'new_numeric_value' => $voterTransportation->election_campaign_id
                ];

                $transportationFieldsArray[] = [
                    'field_name' => 'voter_id',
                    'display_field_name' => config('history.VoterTransportation.voter_id'),
                    'new_numeric_value' => $voterTransportation->voter_id
                ];

                $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');
			} else {
                $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');
            }

			if($voterTransportation->from_time!=$request->input('from_time')){
				$updatesCount++;

				//array_push($fieldsArray , ['from_time', 'הסעה משעה',$voterTransportation->from_time,$request->input('from_time')]);
                $transportationFieldsArray[] = [
                    'field_name' => 'from_time',
                    'display_field_name' => config('history.VoterTransportation.from_time'),
                    'old_value' => $voterTransportation->from_time,
                    'new_value' => $request->input('from_time')
                ];

				$voterTransportation->from_time=$request->input('from_time');
			}
			if($voterTransportation->to_time!=$request->input('to_time')){
				$updatesCount++;

				//array_push($fieldsArray , ['to_time', 'הסעה עד שעה',$voterTransportation->to_time,$request->input('to_time')]);
                $transportationFieldsArray[] = [
                    'field_name' => 'to_time',
                    'display_field_name' => config('history.VoterTransportation.to_time'),
                    'old_value' => $voterTransportation->to_time,
                    'new_value' => $request->input('to_time')
                ];

				$voterTransportation->to_time=$request->input('to_time');
			}
			if($voterTransportation->cripple != ($request->input('crippled')=='1' ? 1 : 0)){
				$updatesCount++;

				//array_push($fieldsArray , ['cripple', 'הסעת נכה',($voterTransportation->cripple == 1 ? 'כן' : 'לא'),
                                          //($request->input('crippled')=='1' ? 'כן' : 'לא')]);
                $transportationFieldsArray[] = [
                    'field_name' => 'cripple',
                    'display_field_name' => config('history.VoterTransportation.cripple'),
                    'old_numeric_value' => $request->input('crippled'),
                    'new_numeric_value' => $voterTransportation->cripple
                ];

				$voterTransportation->cripple=($request->input('crippled')=='1' ? 1 : 0);
			}
			$voterTransportation->save();

			if ( count($transportationFieldsArray) > 0 ) {
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => $referenced_model_action_type,
                    'referenced_id' => $voterTransportation->id,
                    'valuesList' => $transportationFieldsArray
                ];
            }
		} else {
			if($voterTransportation){
				$updatesCount++;

				//array_push($fieldsArray , ['voter_transportations_id', 'הסעה',"כן","לא"]);
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterTransportation->id
                ];

				$voterTransportation->forceDelete();
			}
		}

		 $firstPhoneID = null;
		 $secondPhoneID = null;
		 $firstPhoneNumber = '';
		 $secondPhoneNumber = '';
			$voterPhones = VoterPhone::where('voter_id' , $voter->id)->orderBy('phone_type_id' , 'DESC')->get();
			// dd($voterPhones->toArray(), sizeof($voterPhones), $request->input('first_phone'), $request->input('second_phone')); 
		    if(sizeof($voterPhones) >= 2){
					if(trim($request->input('first_phone')) == '' || $request->input('first_phone') == null){
						$updatesCount++;

				        //array_push($fieldsArray , ['first_phone', 'טלפון עיקרי',$voterPhones[0]->phone_number,""]);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון עיקרי',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $voterPhones[0]->id
                        ];

                        $voterPhones[0]->forceDelete();
					}
				    else{
						$firstPhoneID = $voterPhones[0]->id;
						$firstPhoneNumber = $voterPhones[0]->phone_number;
						$historyModel = [
							'description' => 'טלפון עיקרי',
							'referenced_model' => 'VoterPhone',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
							'referenced_id' => $voterPhones[0]->id,
							'valuesList' => []
						];
						if($voterPhones[0]->phone_number != $request->input('first_phone')){
							$updatesCount++;

							//array_push($fieldsArray , ['first_phone', 'טלפון עיקרי',$voterPhones[0]->phone_number,
																				   //$request->input('first_phone')])
							
							$historyModel['valuesList'] [] = [
								'field_name' => 'phone_number',
								'display_field_name' => config('history.VoterPhone.phone_number'),
								'old_value' => $voterPhones[0]->phone_number,
								'new_value' => $request->input('first_phone')
							];
						
							if($voterPhones[0]->wrong == 1){
								$voterPhones[0]->wrong = 0;
								$historyModel['valuesList'] [] =                                    [
									'field_name' => 'phone_number',
									'display_field_name' => config('history.VoterPhone.wrong'),
									'old_value' => 1,
									'new_value' => 0
								];
							}
                            $historyArgsArr['models'][] = $historyModel;

							$voterPhones[0]->phone_number = $request->input('first_phone');
							$voterPhones[0]->save();
						} else {
							if($voterPhones[0]->wrong == 1){
								$voterPhones[0]->wrong = 0;
								$historyModel['valuesList'] [] =                                    [
									'field_name' => 'phone_number',
									'display_field_name' => config('history.VoterPhone.wrong'),
									'old_value' => 1,
									'new_value' => 0
								];
								$historyArgsArr['models'][] = $historyModel;
							}
						}
				    }
					if(trim($request->input('second_phone')) == '' || $request->input('second_phone') == null){
						$updatesCount++;

						//array_push($fieldsArray , ['second_phone', 'טלפון נוסף',$voterPhones[0]->phone_number,'']);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון נוסף',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $voterPhones[1]->id
                        ];

						$voterPhones[1]->forceDelete();
					}
				    else{
						$secondPhoneID = $voterPhones[1]->id;
						$secondPhoneNumber = $voterPhones[1]->phone_number;
						$historyModel = [
							'description' => 'טלפון נוסף',
							'referenced_model' => 'VoterPhone',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
							'referenced_id' => $voterPhones[1]->id,
							'valuesList' => []
						];
						if($voterPhones[1]->phone_number != $request->input('second_phone')){
							$updatesCount++;

							//array_push($fieldsArray , ['second_phone', 'טלפון נוסף',$voterPhones[1]->phone_number,
													   //$request->input('second_phone')]);
							$historyModel['valuesList'] [] = [
								'field_name' => 'phone_number',
								'display_field_name' => config('history.VoterPhone.phone_number'),
								'old_value' => $voterPhones[1]->phone_number,
								'new_value' => $request->input('second_phone')
							];
							if($voterPhones[1]->wrong == 1){
								$voterPhones[1]->wrong = 0;
								$historyModel['valuesList'] [] =                                    [
									'field_name' => 'phone_number',
									'display_field_name' => config('history.VoterPhone.wrong'),
									'old_value' => 1,
									'new_value' => 0
								];
							}
							$historyArgsArr['models'][] = $historyModel;
							
							$voterPhones[1]->phone_number = $request->input('second_phone');
							$voterPhones[1]->save();
						} else {
							if($voterPhones[1]->wrong == 1){
								$updatesCount++;

								$voterPhones[1]->wrong = 0;
								$historyModel['valuesList'] [] =                                    [
									'field_name' => 'phone_number',
									'display_field_name' => config('history.VoterPhone.wrong'),
									'old_value' => 1,
									'new_value' => 0
								];
								$voterPhones[1]->save();
								$historyArgsArr['models'][] = $historyModel;
							}
						}
				    }

			}
			elseif(sizeof($voterPhones) ==1){
					if(trim($request->input('first_phone')) == '' || $request->input('first_phone') == null){
						$updatesCount++;

						//array_push($fieldsArray , ['first_phone', 'טלפון עיקרי',$voterPhones[0]->phone_number,'']);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון עיקרי',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $voterPhones[0]->id
                        ];

						$voterPhones[0]->forceDelete();
					}
				    else{
						$firstPhoneID = $voterPhones[0]->id;
						$firstPhoneNumber = $voterPhones[0]->phone_number;
						$historyModel = [
							'description' => 'טלפון עיקרי',
							'referenced_model' => 'VoterPhone',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
							'referenced_id' => $voterPhones[0]->id,
							'valuesList' => []
						];
						if( $voterPhones[0]->phone_number != $request->input('first_phone')){
							$updatesCount++;

							array_push($fieldsArray , ['first_phone', 'טלפון עיקרי',$voterPhones[0]->phone_number, $request->input('first_phone')]);

							$historyModel['valuesList'] [] =[
								'field_name' => 'phone_number',
								'display_field_name' => config('history.VoterPhone.phone_number'),
								'old_value' => $voterPhones[0]->phone_number,
								'new_value' => $request->input('first_phone')
							];
							if($voterPhones[0]->wrong == 1){
								$voterPhones[0]->wrong = 0;
								$historyModel['valuesList'] [] =                                    [
									'field_name' => 'phone_number',
									'display_field_name' => config('history.VoterPhone.wrong'),
									'old_value' => 1,
									'new_value' => 0
								];
							}
                            $historyArgsArr['models'][] = $historyModel;

							$voterPhones[0]->phone_number = $request->input('first_phone');
							$voterPhones[0]->save();
						}else{
							if($voterPhones[0]->wrong == 1){
									$voterPhones[0]->wrong = 0;
									$historyModel['valuesList'] [] =                                    [
										'field_name' => 'phone_number',
										'display_field_name' => config('history.VoterPhone.wrong'),
										'old_value' => 1,
										'new_value' => 0
									];
									$voterPhones[0]->save();
									$historyArgsArr['models'][] = $historyModel;

							}
						}
				    }

					if(trim($request->input('second_phone')) != '' && $request->input('second_phone') != null ){
						$newVoterPhone = new VoterPhone;
						$newVoterPhone->phone_number = $request->input('second_phone');
						$newVoterPhone->voter_id = $voter->id;
						$newVoterPhone->key = Helper::getNewTableKey('voter_phones', 10);
						$newVoterPhone->phone_type_id = 2;
						$newVoterPhone->save();

						$secondPhoneID = $newVoterPhone->id;
						$secondPhoneNumber = $newVoterPhone->phone_number;

						$updatesCount++;

						//array_push($fieldsArray , ['second_phone', 'טלפון נוסף','',$request->input('second_phone')]);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון נוסף',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $newVoterPhone->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'phone_number',
                                    'display_field_name' => config('history.VoterPhone.phone_number'),
                                    'new_value' => $newVoterPhone->phone_number
                                ],
                                [
                                    'field_name' => 'voter_id',
                                    'display_field_name' => config('history.VoterPhone.voter_id'),
                                    'new_numeric_value' => $newVoterPhone->voter_id
                                ],
                                [
                                    'field_name' => 'phone_type_id',
                                    'display_field_name' => config('history.VoterPhone.phone_type_id'),
                                    'new_numeric_value' => $newVoterPhone->phone_type_id
                                ]
                            ]
                        ];
				    }
			}
			else{
					if(trim($request->input('first_phone')) != '' && $request->input('first_phone') != null){
						$newVoterPhone = new VoterPhone;
						$newVoterPhone->phone_number = $request->input('first_phone');
						$newVoterPhone->voter_id = $voter->id;
						$newVoterPhone->key = Helper::getNewTableKey('voter_phones', 10);
						$newVoterPhone->phone_type_id = 2;
						$newVoterPhone->save();

						$firstPhoneNumber = $newVoterPhone->phone_number;
						$firstPhoneID = $newVoterPhone->id;

						$updatesCount++;

						//array_push($fieldsArray , ['second_phone', 'טלפון עיקרי','',$request->input('first_phone')]);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון עיקרי',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $newVoterPhone->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'phone_number',
                                    'display_field_name' => config('history.VoterPhone.phone_number'),
                                    'new_value' => $newVoterPhone->phone_number
                                ],
                                [
                                    'field_name' => 'voter_id',
                                    'display_field_name' => config('history.VoterPhone.voter_id'),
                                    'new_numeric_value' => $newVoterPhone->voter_id
                                ],
                                [
                                    'field_name' => 'phone_type_id',
                                    'display_field_name' => config('history.VoterPhone.phone_type_id'),
                                    'new_numeric_value' => $newVoterPhone->phone_type_id
                                ]
                            ]
                        ];
				    }
					if(trim($request->input('second_phone')) != '' && $request->input('second_phone') != null){
						$newVoterPhone = new VoterPhone;
						$newVoterPhone->phone_number = $request->input('second_phone');
						$newVoterPhone->voter_id = $voter->id;
						$newVoterPhone->key = Helper::getNewTableKey('voter_phones', 10);
						$newVoterPhone->phone_type_id = 1;
						$newVoterPhone->save();

						$secondPhoneID = $newVoterPhone->id;
						$secondPhoneNumber = $newVoterPhone->phone_number;

						$updatesCount++;

						//array_push($fieldsArray , ['second_phone', 'טלפון נוסף','',$request->input('second_phone')]);
                        $historyArgsArr['models'][] = [
                            'description' => 'טלפון נוסף',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $newVoterPhone->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'phone_number',
                                    'display_field_name' => config('history.VoterPhone.phone_number'),
                                    'new_value' => $newVoterPhone->phone_number
                                ],
                                [
                                    'field_name' => 'voter_id',
                                    'display_field_name' => config('history.VoterPhone.voter_id'),
                                    'new_numeric_value' => $newVoterPhone->voter_id
                                ],
                                [
                                    'field_name' => 'phone_type_id',
                                    'display_field_name' => config('history.VoterPhone.phone_type_id'),
                                    'new_numeric_value' => $newVoterPhone->phone_type_id
                                ]
                            ]
                        ];
				    }
			}
		 
		
		if($request->input('main_phone_id')){
			if($request->input('main_phone_id') != $voter->main_voter_phone_id){
				if($request->input('main_phone_id') == '1'){
					
					if($firstPhoneID){
						if($voter->main_voter_phone_id != $firstPhoneID){
							$updatesCount++;
							//array_push($fieldsArray , ['main_voter_phone', 'טלפון ראשי של תושב',$firstPhoneNumber,
                                                       //$request->input('first_phone')]);
                            $voterFieldsArray[] = [
                                'field_name' => 'main_voter_phone_id',
                                'display_field_name' => config('history.Voters.main_voter_phone_id'),
                                'old_numeric_value' => $voter->main_voter_phone_id,
                                'new_numeric_value' => $request->input('first_phone')
                            ];

							$voter->main_voter_phone_id = $firstPhoneID;	
						}
					}
				}
				elseif($request->input('main_phone_id') == '2'){
					if($secondPhoneID){
						if($voter->main_voter_phone_id != $secondPhoneID){
							$updatesCount++;
							//array_push($fieldsArray , ['main_voter_phone', 'טלפון ראשי של תושב',$secondPhoneNumber,
                                                       //$request->input('second_phone')]);
                            $voterFieldsArray[] = [
                                'field_name' => 'main_voter_phone_id',
                                'display_field_name' => config('history.Voters.main_voter_phone_id'),
                                'old_numeric_value' => $voter->main_voter_phone_id,
                                'new_numeric_value' => $request->input('second_phone')
                            ];

							$voter->main_voter_phone_id = $secondPhoneID;
						}						
					}
				}
			}
		}

		$addressFields = [
            'city',
            'city_id',
            'neighborhood',
            'street',
            'street_id',
            'house',
            'house_entry',
            'flat',
            'mark',
            'zip'
        ];

        $oldVoterAddressValues = [];
		for ( $fieldIndex = 0; $fieldIndex < count($addressFields); $fieldIndex++ ) {
		    $fieldName = $addressFields[$fieldIndex];

            $oldVoterAddressValues[$fieldName] = $voter->{$fieldName};
		}

		$cityIndexInVoterFieldsArray = null;
        $cityIdIndexInVoterFieldsArray = null;

        $streetIndexInVoterFieldsArray = null;
        $streetIdIndexInVoterFieldsArray = null;

		if($request->input('city_key') != null && trim($request->input('city_key')) !=''){
			$city = City::select('id' , 'name')->where('key' , $request->input('city_key') )->where('deleted',0)->first();
			if(!$city){
				$jsonOutput->setErrorCode(config('errors.system.CITY_NOT_EXISTS'));
		        return;	
			}
			if ($city->id != $voter->city_id){
                $updatesCount++;

                //array_push($fieldsArray , ['city', 'עיר',$voter->city,$city->name]);
                $voterFieldsArray[] = [
                    'field_name' => 'city_id',
                    'display_field_name' => config('history.Voters.city_id'),
                    'old_numeric_value' => $oldVoterAddressValues['city_id'],
                    'new_numeric_value' => $city->id
                ];
                $cityIdIndexInVoterFieldsArray = count($voterFieldsArray);

                $voterFieldsArray[] = [
                    'field_name' => 'city',
                    'display_field_name' => config('history.Voters.city'),
                    'old_value' => $oldVoterAddressValues['city'],
                    'new_value' => $city->name
                ];
                $cityIndexInVoterFieldsArray = count($voterFieldsArray);

			    $voter->city_id = $city->id;
				$voter->city = $city->name;
				$voter->actual_address_correct = NULL;
				$isResetCorrectAddress = true;
			}
			if($request->input('street_key') != null && trim($request->input('street_key'))){
				$street = Streets::select('id' , 'name')->where('deleted' , 0)->where('key' ,$request->input('street_key'))->where('city_id',$city->id )->first(); 
			    if(!$street){
					$jsonOutput->setErrorCode(config('errors.system.STREET_NAME_NOT_VALID'));
		            return;	
				}
				if($voter->street != $street->name){
                    $updatesCount++;

                    //array_push($fieldsArray , ['street', 'רחוב',$voter->street,$street->name]);
                    $voterFieldsArray[] = [
                        'field_name' => 'street_id',
                        'display_field_name' => config('history.Voters.street_id'),
                        'old_numeric_value' => $oldVoterAddressValues['street_id'],
                        'new_numeric_value' => $street->id
                    ];
                    $streetIdIndexInVoterFieldsArray = count($voterFieldsArray);

                    $voterFieldsArray[] = [
                        'field_name' => 'street',
                        'display_field_name' => config('history.Voters.street'),
                        'old_value' => $oldVoterAddressValues['street'],
                        'new_value' => $street->name
                    ];
                    $streetIndexInVoterFieldsArray = count($voterFieldsArray);

			         $voter->street_id = $street->id;
					 $voter->street = $street->name;
					 $voter->actual_address_correct = NULL;
					 $isResetCorrectAddress = true;
				}
			}
			else{
				$voter->street_id = NULL;
			}
		}
		
		if($request->input('actual_address_correct') == '0'){
            $addressWasUpdated = true;
			$updatesCount++;
			//array_push($fieldsArray , ['copying', 'העתקת כתובת משרד הפנים לכתובת העדכנית',($voter->city." ".$voter->neighborhood." ".$voter->street." ".$voter->house." ".$voter->house_entry." ".$voter->flat." ".$voter->mark." ".$voter->zip),($voter->mi_city." ".$voter->mi_neighborhood." ".$voter->mi_street." ".$voter->mi_house." ".$voter->mi_house_entry." ".$voter->mi_flat." ".$voter->mi_mark." ".$voter->mi_zip)]);
		
			$voter->city = $voter->mi_city;
			$voter->city_id = $voter->mi_city_id;
			$voter->neighborhood = $voter->mi_neighborhood;
			$voter->street = $voter->mi_street;
			$voter->street_id = $voter->mi_street_id;
			$voter->house = $voter->mi_house;
			$voter->house_entry = $voter->mi_house_entry;
			$voter->flat = $voter->mi_flat;
			$voter->mark = $voter->mi_mark;
			$voter->zip = $voter->mi_zip;

			for ( $fieldIndex = 0; $fieldIndex < count($addressFields); $fieldIndex++ ) {
                $fieldName = $addressFields[$fieldIndex];

                if ( $voter->{$fieldName} != $oldVoterAddressValues[$fieldName] ) {
                    switch ( $fieldName ) {
                        case 'city':
                            if ( !is_null($cityIndexInVoterFieldsArray) ) {
                                $voterFieldsArray[$cityIndexInVoterFieldsArray]['new_value'] = $voter->city;
                            } else {
                                $voterFieldsArray[] = [
                                    'field_name' => 'city',
                                    'display_field_name' => config('history.Voters.city'),
                                    'old_value' => $oldVoterAddressValues['city'],
                                    'new_value' => $voter->city
                                ];
                            }
                            break;

                        case 'city_id':
                            if ( !is_null($cityIdIndexInVoterFieldsArray) ) {
                                $voterFieldsArray[$cityIdIndexInVoterFieldsArray]['new_numeric_value'] = $voter->city_id;
                            } else {
                                $voterFieldsArray[] = [
                                    'field_name' => 'city_id',
                                    'display_field_name' => config('history.Voters.city_id'),
                                    'old_numeric_value' => $oldVoterAddressValues['city_id'],
                                    'new_numeric_value' => $voter->city_id
                                ];
                            }
                            break;

                        case 'street':
                            if ( !is_null($streetIndexInVoterFieldsArray) ) {
                                $voterFieldsArray[$streetIndexInVoterFieldsArray]['new_value'] = $voter->street;
                            } else {
                                $voterFieldsArray[] = [
                                    'field_name' => 'street',
                                    'display_field_name' => config('history.Voters.street'),
                                    'old_value' => $oldVoterAddressValues['street'],
                                    'new_value' => $voter->street
                                ];
                            }
                            break;

                        case 'street_id':
                            if ( !is_null($streetIdIndexInVoterFieldsArray) ) {
                                $voterFieldsArray[$streetIdIndexInVoterFieldsArray]['new_numeric_value'] = $voter->street_id;
                            } else {
                                $voterFieldsArray[] = [
                                    'field_name' => 'street_id',
                                    'display_field_name' => config('history.Voters.street_id'),
                                    'old_numeric_value' => $oldVoterAddressValues['street_id'],
                                    'new_numeric_value' => $voter->street_id
                                ];
                            }
                            break;

                        default:
                            $voterFieldsArray[] = [
                                'field_name' => $fieldName,
                                'display_field_name' => config('history.Voters.' . $fieldName),
                                'old_value' => $oldVoterAddressValues[$fieldName],
                                'new_value' => $voter->{$fieldName}
                            ];
                            break;
                    }
                }
            }
	   }

		$voterCurrentSupportStatus = VoterSupportStatus::where('election_campaign_id' , $electionCampaignID)
			->where('voter_id' , $voter->id)
			->where('deleted',DB::raw(0))
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
            ->first();
		$voterPreviousSupportStatus = VoterSupportStatus::where('election_campaign_id' , $previousCampaignID)
			->where('voter_id' , $voter->id)
			->where('deleted',DB::raw(0))
            ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
			->first();
			
		if($request->input('support_status_key') == null || trim($request->input('support_status_key')) == ''){
			if($voterCurrentSupportStatus){
				$updatesCount++;
				$oldSupportStatus = '';
				$old_support_status = SupportStatus::select('id','key','name')
                    ->where('id',$voterCurrentSupportStatus->support_status_id)
                    ->where('deleted',0)
                    ->where('active',1)
                    ->first();
				if($old_support_status){
					$oldSupportStatus = $old_support_status->name;
				}
			    //array_push($fieldsArray , ['current_support_status', 'סטטוס תמיכה נוכחי',$oldSupportStatus,'']);

				//$voterCurrentSupportStatus->support_status_id = -1;

                $historyArgsArr['models'][] = [
                    'description' => 'מחיקת סטטוס תמיכה נוכחי',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterCurrentSupportStatus->id
                ];
                $voterCurrentSupportStatus->delete();
			}
		}
		else{
			$support_status = SupportStatus::select('id','key','name')->where('key',$request->input('support_status_key'))->where('deleted',0)->where('active',1)->first();
			if(!$support_status){
				$jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
		        return;	
			}
			if($voterCurrentSupportStatus){
				if($voterCurrentSupportStatus->support_status_id != $support_status->id){
					$updatesCount++;
					$oldSupportStatus = '';
					$old_support_status = SupportStatus::select('id','key','name')
                        ->where('id',$voterCurrentSupportStatus->support_status_id)
                        ->where('deleted',0)
                        ->where('active',1)
                        ->first();
					if($old_support_status){
						$oldSupportStatus = $old_support_status->name;
					}

					//array_push($fieldsArray , ['current_support_status', 'סטטוס תמיכה נוכחי',$oldSupportStatus,$support_status->name]);
                    $historyArgsArr['models'][] = [
                        'description' => 'עדכון סטטוס תמיכה נוכחי',
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterCurrentSupportStatus->id,
                        'valuesList' => [
                            [
                                'field_name' => 'support_status_id',
                                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                'old_value' => $oldSupportStatus,
                                'new_value' => $support_status->name,
                                'old_numeric_value' => $voterCurrentSupportStatus->support_status_id,
                                'new_numeric_value' => $support_status->id
                            ]
                        ]
                    ];

					$voterCurrentSupportStatus->support_status_id = $support_status->id;
					$voterCurrentSupportStatus->update_user_id = Auth::user()->id;
					$voterCurrentSupportStatus->save();
				}
			}
			else{
				$voterCurrentSupportStatus = new VoterSupportStatus;
				$voterCurrentSupportStatus->election_campaign_id = $electionCampaignID;
				$voterCurrentSupportStatus->voter_id = $voter->id;
				$voterCurrentSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
				$voterCurrentSupportStatus->support_status_id = $support_status->id;
				$voterCurrentSupportStatus->create_user_id =Auth::user()->id;
				$voterCurrentSupportStatus->update_user_id =Auth::user()->id;
				$voterCurrentSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
				$voterCurrentSupportStatus->save();

				$updatesCount++;
				//array_push($fieldsArray , ['current_support_status', 'סטטוס תמיכה נוכחי','',$support_status->name]);
                $statusFields = [
                    'election_campaign_id',
                    'voter_id',
                    'entity_type',
                    'support_status_id'
                ];

                $insertedValues = [];
                for ( $fieldIndex = 0; $fieldIndex < count($statusFields); $fieldIndex++ ) {
                    $fieldName = $statusFields[$fieldIndex];

                    $insertedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                        'new_numeric_value' => $voterCurrentSupportStatus->{$fieldName}
                    ];
                }

                $historyArgsArr['models'][] = [
                    'description' => 'הוספת סטטוס תמיכה נוכחי',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterCurrentSupportStatus->id,
                    'valuesList' => $insertedValues
                ];
			}	
		}
		
		//////////
		
		if($request->input('previous_support_status_key') == null || trim($request->input('previous_support_status_key')) == ''){
			if($voterPreviousSupportStatus){
				$updatesCount++;
				$oldPreviousSupportStatus = '';
				$old_previous_support_status = SupportStatus::select('id','key','name')->where('id',$voterPreviousSupportStatus->support_status_id)->where('deleted',0)->where('active',1)->first();
				if($old_previous_support_status){
					$oldPreviousSupportStatus = $old_previous_support_status->name;
				}
			    //array_push($fieldsArray , ['previous_support_status', 'סטטוס תמיכה קודם',$oldPreviousSupportStatus,'']);
				
				//support_status_id

                $historyArgsArr['models'][] = [
                    'description' => 'מחיקת סטטוס תמיכה קודם',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterPreviousSupportStatus->id
                ];
                $voterPreviousSupportStatus->delete();
			}
		}
		else{
			$previos_support_status = SupportStatus::select('id','key','name')->where('key',$request->input('previous_support_status_key'))->where('deleted',0)->where('active',1)->first();
			if(!$previos_support_status){
				$jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
		        return;	
			}
			if($voterPreviousSupportStatus){
				if($voterPreviousSupportStatus->support_status_id != $previos_support_status->id){
					$updatesCount++;
					$oldPreviousSupportStatus = '';
					$old_previous_support_status = SupportStatus::select('id','key','name')->where('id',$voterPreviousSupportStatus->support_status_id)->where('deleted',0)->where('active',1)->first();
					if($old_previous_support_status){
						$oldPreviousSupportStatus = $old_previous_support_status->name;
					}

                    //array_push($fieldsArray , ['previous_support_status', 'סטטוס תמיכה קודם',$oldPreviousSupportStatus,
                                                 //$previos_support_status->name]);
                    $historyArgsArr['models'][] = [
                        'description' => 'עדכון סטטוס תמיכה קודם',
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterPreviousSupportStatus->id,
                        'valuesList' => [
                            [
                                'field_name' => 'support_status_id',
                                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                'old_value' => $oldPreviousSupportStatus,
                                'new_value' => $previos_support_status->name,
                                'old_numeric_value' => $voterPreviousSupportStatus->support_status_id,
                                'new_numeric_value' => $previos_support_status->id
                            ]
                        ]
                    ];

					$voterPreviousSupportStatus->support_status_id = $previos_support_status->id;
					$voterPreviousSupportStatus->update_user_id =  Auth::user()->id;
                    $voterPreviousSupportStatus->save();
				}
			}
			else{
				$voterPreviousSupportStatus = new VoterSupportStatus;
				$voterPreviousSupportStatus->election_campaign_id = $previousCampaignID;
				$voterPreviousSupportStatus->voter_id = $voter->id;
				$voterPreviousSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
				$voterPreviousSupportStatus->support_status_id = $previos_support_status->id;
				$voterPreviousSupportStatus->create_user_id =Auth::user()->id;
				$voterPreviousSupportStatus->update_user_id =Auth::user()->id;
				$voterPreviousSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
				$voterPreviousSupportStatus->save();

				$updatesCount++;
				//array_push($fieldsArray , ['previous_support_status', 'סטטוס תמיכה קודם','',$previos_support_status->name]);

                $statusFields = [
                    'election_campaign_id',
                    'voter_id',
                    'entity_type',
                    'support_status_id'
                ];

                $insertedValues = [];
                for ( $fieldIndex = 0; $fieldIndex < count($statusFields); $fieldIndex++ ) {
                    $fieldName = $statusFields[$fieldIndex];

                    $insertedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                        'new_numeric_value' => $voterPreviousSupportStatus->{$fieldName}
                    ];
                }

                $historyArgsArr['models'][] = [
                    'description' => 'הוספת סטטוס תמיכה קודם',
                    'referenced_model' => 'VoterSupportStatus',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterPreviousSupportStatus->id,
                    'valuesList' => $insertedValues
                ];
			}	
		}
		$household_update_actual_address = $request->input('household_update_actual_address') == '1' ? true: false;

		if ( $addressWasUpdated || $household_update_actual_address) {
            $voter->actual_address_update_date = date(config('constants.APP_DATETIME_DB_FORMAT'));
        }
		$saves = $voter->save();
		/*if($updatesCount > 0){
			ActionController::AddHistoryItem('elections.reports.captain_of_fifty_walker.update', $voter->id,
                                             'Captain50WalkerReport', $fieldsArray);
		}*/

		$updatesArray = array();
		$specialUpdatesCount = 0;
		if($request->input('household_update_additional_care') == '1'){
			$specialUpdatesCount++;
			$updatesArray["additional_care"] = ($request->input('additional_care') == '1' ? 1 : 0);
		}
		if($request->input('household_update_not_at_home') == '1'){
			$specialUpdatesCount++;
			$updatesArray["not_at_home"] = ($request->input('not_at_home') == '1' ? 1 : 0);
		}

        $householdVoters = Voters::where('household_id', $voter->household_id)->get();

		if($household_update_actual_address){
			$specialUpdatesCount++;	
			$updatesArray["city"]=$voter->city;
			$updatesArray["city_id"]=$voter->city_id;
			$updatesArray["neighborhood"]=$voter->neighborhood;
			$updatesArray["street"]=$voter->street;
			$updatesArray["street_id"]=$voter->street_id;
			$updatesArray["house"]=$voter->house;
			$updatesArray["house_entry"]=$voter->house_entry;
			$updatesArray["flat"]=$voter->flat;
			$updatesArray["mark"]=$voter->mark;
			$updatesArray["zip"]=$voter->zip;
            $updatesArray["actual_address_update_date"] = date(config('constants.APP_DATETIME_DB_FORMAT'));
		}
		if($specialUpdatesCount > 0){
		    for ( $householdIndex = 0; $householdIndex < count($householdVoters); $householdIndex++ ) {
		        $changedValues = [];
		        foreach ( $updatesArray as $fieldName => $newFieldValue ) {
				if(empty($updatesArray[$fieldName])){continue;}

					$oldValue=!empty($householdVoters[$householdIndex]->{$fieldName}) ? $householdVoters[$householdIndex]->{$fieldName}:'';
                    if ( "city_id" == $fieldName || "street_id" == $fieldName ) {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Voters.' . $fieldName),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $updatesArray[$fieldName]
                        ];
                    } else {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Voters.' . $fieldName),
                            'old_value' =>$oldValue,
                            'new_value' => $updatesArray[$fieldName]
                        ];
                    }
				}
				if ( count($changedValues) > 0 ) {
					$historyArgsArr['models'][] = [
						'description' => 'עדכון פרטי בית אב',
						'referenced_model' => 'Voters',
						'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
						'referenced_id' => $householdVoters[$householdIndex]->id,
						'valuesList' => $changedValues
					];
				}
            }

		    Voters::where('household_id', $voter->household_id)->update($updatesArray);
		}

		if($request->input('household_update_support_status') == '1'){
			
			if($voterCurrentSupportStatus){
				 for($i = 0 ; $i < sizeof($householdVoters) ; $i++){
	                 $existingVoterSupportStatus = VoterSupportStatus::where('election_campaign_id' , $electionCampaignID)
                         ->where('voter_id' , $householdVoters[$i]->id)
                         ->where('entity_type' , config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
                         ->first();

	                 $changedValues = [];

	                 $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');

				     if(!$existingVoterSupportStatus) {
						$existingVoterSupportStatus = new VoterSupportStatus;
						$existingVoterSupportStatus->election_campaign_id = $electionCampaignID;
						$existingVoterSupportStatus->voter_id = $householdVoters[$i]->id;
						$existingVoterSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
						$existingVoterSupportStatus->create_user_id =Auth::user()->id;
						$existingVoterSupportStatus->update_user_id =Auth::user()->id;
						$existingVoterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);

                         $changedValues = [
                             [
                                'field_name' => 'election_campaign_id',
                                'display_field_name' => config('history.VoterSupportStatus.election_campaign_id'),
                                'new_numeric_value' => $existingVoterSupportStatus->election_campaign_id
                             ],
                             [
                                 'field_name' => 'voter_id',
                                 'display_field_name' => config('history.VoterSupportStatus.voter_id'),
                                 'new_numeric_value' => $existingVoterSupportStatus->voter_id
                             ],
                             [
                                 'field_name' => 'entity_type',
                                 'display_field_name' => config('history.VoterSupportStatus.entity_type'),
                                 'new_numeric_value' => $existingVoterSupportStatus->entity_type
                             ],
                         ];

                         $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');
					 } else {
					 	$existingVoterSupportStatus->update_user_id =  Auth::user()->id;

					 }

					 if ( $voterCurrentSupportStatus->support_status_id != $existingVoterSupportStatus->support_status_id ) {
                         $changedValues[] = [
                             'field_name' => 'support_status_id',
                             'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                             'old_numeric_value' => $existingVoterSupportStatus->support_status_id,
                             'new_numeric_value' => $voterCurrentSupportStatus->support_status_id
                         ];
                     }

					 $existingVoterSupportStatus->support_status_id = $voterCurrentSupportStatus->support_status_id;
					 $existingVoterSupportStatus->save();

                     if ( count($changedValues) > 0 ) {
                         $historyArgsArr['models'][] = [
                             'description' => 'עדכון סטטוס תמיכה לבית אב',
                             'referenced_model' => 'VoterSupportStatus',
                             'referenced_model_action_type' => $referenced_model_action_type,
                             'referenced_id' => $existingVoterSupportStatus->id,
                             'valuesList' => $changedValues
                         ];
                     }
				 }
			} /*else {
				 for($i = 0 ; $i < sizeof($householdVoters) ; $i++){
					 $householdVoters[$i]->support_status_id = NULL;
					 $householdVoters[$i]->save();

                     $historyArgsArr['models'][] = [
                         'description' => 'עדכון סטטוס תמיכה לבית אב',
                         'referenced_model' => 'VoterSupportStatus',
                         'referenced_model_action_type' => $referenced_model_action_type,
                         'referenced_id' => $householdVoters[$i]->id,
                         'valuesList' => $changedValues
                     ];
				 }
			}*/
		}

		$phoneNumber = null;
		if($request->input('household_update_contact_info') == '1'){
			
			$voterPhones = VoterPhone::where('voter_id' , $voter->id)->orderBy('phone_type_id' , 'DESC')->get();
			if($request->input('first_phone') && Helper::isIsraelPhone($request->input('first_phone')) && substr($request->input('first_phone'),0 ,2) != "05"){
				$phoneNumber = $request->input('first_phone');
			} elseif($request->input('second_phone') && Helper::isIsraelPhone($request->input('second_phone')) && substr($request->input('second_phone'),0 ,2) != "05"){
				$phoneNumber = $request->input('second_phone');
			}

			if($phoneNumber){
				echo sizeof($householdVoters);
				for($i = 0 ; $i < sizeof($householdVoters) ; $i++){
                    $voterPhone = VoterPhone::where('voter_id' , $householdVoters[$i]->id)->where('phone_type_id' , $this->STATIONARY_PHONE_TYPE_ID)->orderBy('phone_type_id' , 'DESC')->first();

                    $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');

                    $changedValues = [];
                    if(!$voterPhone){
                        $voterPhone = new VoterPhone;
                        $voterPhone->voter_id=$householdVoters[$i]->id;
                        $voterPhone->phone_type_id = $this->STATIONARY_PHONE_TYPE_ID;
                        $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);

                        $changedValues = [
                            [
                                'field_name' => 'voter_id',
                                'display_field_name' => config('history.VoterPhone.voter_id'),
                                'new_numeric_value' => $voterPhone->voter_id
                            ],
                            [
                                'field_name' => 'phone_type_id',
                                'display_field_name' => config('history.VoterPhone.phone_type_id'),
                                'new_numeric_value' => $voterPhone->phone_type_id
                            ]
                        ];

                        $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');
                    }

                    if ( $phoneNumber != $voterPhone->phone_number ) {
                        $changedValues[] = [
                            'field_name' => 'phone_number',
                            'display_field_name' => config('history.VoterPhone.phone_number'),
                            'old_value' => $voterPhone->phone_number,
                            'new_value' => $phoneNumber
                        ];
                    }

                    $voterPhone->phone_number = $phoneNumber;
                    $count = $voterPhone->save();

                    if ( count($changedValues) > 0 ) {
                        $historyArgsArr['models'][] = [
                            'description' => 'עדכון טלפון לבית אב',
                            'referenced_model' => 'VoterPhone',
                            'referenced_model_action_type' => $referenced_model_action_type,
                            'referenced_id' => $voterPhone->id,
                            'valuesList' => $changedValues
                        ];
                    }

                    $householdVoters[$i]->main_voter_phone_id =$voterPhone->id;
                    $householdVoters[$i]->save();
                }
            }
		}
		$voter->isResetCorrectAddress = $isResetCorrectAddress;

        if (  count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
		
        $jsonOutput->setData($voter);	
	}
	/*
	Performs generating captain-of-50-walker report by parama
	
	@params request
	*/
	public function printRenovationCap50WalkerReportByParams(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);

		$dataObj = $this->getVotersByQueryParams($request , true , true);
		$dataToPrint = collect($dataObj)->toArray();
		$voterList = $dataToPrint['voterList'];

		$captainHash = $this->getCaptian50HashForPrint($voterList , $request->input('show_support_status'));
		// echo(json_encode($voterList));
		// die;
		if(!GlobalController::isActionPermitted('elections.reports.captain_of_fifty_walker')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}
		return view('reports.cap50Renovation' , ['captainHash'=>$captainHash,'voterList'=>$voterList]);
	}
	
	/*
	Performs generating captain-of-50-walker report by parama
	
	@params request
	*/
	public function getCap50WalkerReportByParams(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		if(!GlobalController::isActionPermitted('elections.reports.captain_of_fifty_walker')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$data = $this->getVotersByQueryParams($request , false);
		$jsonOutput->setData($data);
	}
	
	/*
		Helpful function for getCap50WalkerReportByParams and printCap50WalkerReportByParams that does the search calculations :
	*/
	private function getVotersByQueryParams(Request $request, $isPrintableVersion, $isRenovationReport = false){
		$filter_items= json_decode( $request->input('filter_items'),true);
		$regular_search_filters= json_decode( $request->input('regular_search_filters'),true);
		 
		$filterDefinitions=VoterFilterDefinition::get()
        ->groupBy('id')
        ->makeVisible(['model', 'model_list_function', 'model_list_dependency_id', 'join', 'constrains', 'where_type', 'field'])
        ->each(function ($row) {
            $row[0]->setHidden(['values']);
        }); 
		 
		$previousCampaignID = -1;
		$electionCampaignID = -1;
		$electionCampaignType = -1;
		$currentCampaign = ElectionCampaigns::currentCampaign();
	    if($currentCampaign){
			$electionCampaignID = $currentCampaign->id;
		    $electionCampaignType = $currentCampaign->type;
		}
	    $previousCampaignID = ElectionCampaigns::select('id')
		                     ->where('type', $electionCampaignType)
							 ->where('id', '!=', $electionCampaignID)
							 ->orderBy('end_date', 'DESC')->first()['id'];
	
		$cityKey= (array_key_exists ('city_key',$regular_search_filters) ?$regular_search_filters['city_key'] : null);
		$cityID = null;
		if($cityKey){
			$cityIDObject = City::select('id')->where('key' , $cityKey)->where('deleted',0)->first();
			if($cityIDObject){
				$cityID = $cityIDObject->id;
			}
		}
		$neighborhoodKey= (array_key_exists ('neighborhood_key',$regular_search_filters) ?$regular_search_filters['neighborhood_key'] : null);
		$clusterKey= (array_key_exists ('cluster_key',$regular_search_filters) ?$regular_search_filters['cluster_key'] : null);
		$ballotBoxKey= (array_key_exists ('ballot_box',$regular_search_filters) ?$regular_search_filters['ballot_box'] : null);

		$skipRows = $request->input('skip_rows');
		$resultsPerPage =  $this->DEFAULT_SEARCH_RESULTS_NUMBER_PER_PAGE;
		if(!$skipRows){
			$skipRows = $this->DEFAULT_CURRENT_PAGE;
		}

			$votersQuery= $this->getVotersQuery($electionCampaignID, $previousCampaignID, $isRenovationReport);

			$this->addDetailsToQuery($votersQuery, $electionCampaignID, $filter_items, $filterDefinitions);

			$this->addGeoDetailsToWhereQuery($votersQuery, $cityID, $neighborhoodKey, $clusterKey, $ballotBoxKey);
			$this->addCaptainDetailsToWhereQuery($votersQuery, $regular_search_filters);

			$totalVotersCount = null;

			if(!$isPrintableVersion){
				$votersQuery->skip(($skipRows-1) )->take($resultsPerPage );
			}
			$voterList = $votersQuery->get();
			$captainHash = [];
			if(!$isPrintableVersion){

				$countQuery = VoterQuery::select('voters.id')
				->withVoterBallotAddressDetails($electionCampaignID);
				$this->addDetailsToQuery($countQuery, $electionCampaignID, $filter_items, $filterDefinitions);
 
				$this->addGeoDetailsToWhereQuery($countQuery, $cityID, $neighborhoodKey, $clusterKey, $ballotBoxKey);
				$this->addCaptainDetailsToWhereQuery($countQuery, $regular_search_filters);
				$countQuery = $countQuery->join('election_roles_by_voters' , 'election_roles_by_voters.voter_id', '=', 'captain_voters.id')
										->where('election_roles_by_voters.election_campaign_id' ,  $electionCampaignID  );
				$totalVotersCount = $countQuery->count(DB::raw('DISTINCT voters.id')); //Total voters count 

				$captainHash = $this->getCaptian50Hash($voterList,$electionCampaignID, $filter_items, $filterDefinitions,$cityID, $neighborhoodKey
				,$clusterKey, $ballotBoxKey,$votersQuery, $regular_search_filters);
			}
 
			return ['voterList' => $voterList, 'captainHash' => $captainHash, 'totalVotersCount'=>$totalVotersCount];
	}
	/**
	 * @method getCaptian50Hash
	 * - Get captain hash details for current voters
	 * -> only for web pagination!
	 * -> to get only the current captains data
	 * -> Get all the params for query - 
	 * In order to accurately calculate the number of voters and householdsץ
	 * @param [array] $voterList - voter list in current api response
	 * @return {object} captainHash - hash table for the captain details
	 * voters_count -> total number of voters
	 * households_count -> total number of households
	 */
	private function getCaptian50Hash($voterList,$electionCampaignID, $filter_items, $filterDefinitions,$cityID, $neighborhoodKey
	, $clusterKey, $ballotBoxKey,$votersQuery, $regular_search_filters){
		$captainHash=[];
		foreach($voterList as $voter){
			$captain_personal_identity = $voter->captain_personal_identity;
			if(empty($captainHash[$voter->captain_personal_identity])){ //get captain data.
				$captainData = [];

				$countQuery = VoterQuery::where('captain_voters.id',$voter->captain_voters_id)
				
				->withVoterBallotAddressDetails($electionCampaignID);
				$this->addDetailsToQuery($countQuery, $electionCampaignID, $filter_items, $filterDefinitions);
				$this->addGeoDetailsToWhereQuery($countQuery, $cityID, $neighborhoodKey, $clusterKey, $ballotBoxKey);
				
				$this->addCaptainDetailsToWhereQuery($votersQuery, $regular_search_filters);
				$votersQuery->groupBy('voters.id');
 
				$captainData['voters_count'] = $countQuery->count(DB::raw('DISTINCT voters.id'));
				$captainData['households_count'] = count($countQuery->groupBy('voters.household_id')->get()); //select only specific
				$captainHash[$captain_personal_identity] = $captainData;
			}
		}
		return $captainHash;
	}
	
	/*
		Private helpful function that returns the needed VoterQuery
	*/
	private function getVotersQuery($electionCampaignID, $previousCampaignID, $isRenovationReport = false){
		$orderByPhoneQuery = $this->orderPhoneQuery('voters');
		$orderByVoterCaptainPhoneQuery = $this->orderPhoneQuery('captain_voters');

		$captainPhoneQuery="SELECT voter_phones.phone_number FROM voter_phones WHERE voter_phones.voter_id = captain_voters.id ORDER BY $orderByVoterCaptainPhoneQuery LIMIT 1";
		// dd($captainPhoneQuery);
		$fullClusterNameQuery = 'CONCAT (IFNULL(clusters.prefix,"") ,IF((IsNull(clusters.prefix) OR clusters.prefix = "") ,""," - "), clusters.name) as cluster_name';
		if(!$isRenovationReport){
			$fields = [
			//voter details
			'voters.id as id','voters.key as voter_key' , 'voters.personal_identity', 'voters.first_name' , 'voters.last_name' , 
			'voters.birth_date' , 'voters.city_id as city_id' ,'voter_city.key as city_key', 'voter_city.name as city_name' ,
			'voters.email','voters.house' , 'voters.main_voter_phone_id' , 'voters.house_entry','voters.flat' , 
			'voters.zip'  , 'voters.household_id'  , 'voters.not_at_home','voters.comment' , 'voters.actual_address_correct' ,
			'support_status.name as support_status_name' , 'previos_support_status.name as previous_support_status_name' ,
			'voters.household_id', 'voters_in_election_campaigns.voter_serial_number','voters.additional_care',
			'voters.sephardi', 'voters.religious_group_id','voters.ethnic_group_id',
			'ethnic_groups.name as ethnic_group_name','religious_groups.name as religious_group_name',

			//Mi address
			'voters.mi_city_id','voters.mi_city','voters.mi_neighborhood','voters.mi_street','voters.mi_street_id',
			'voters.mi_house','voters.mi_house_entry','voters.mi_flat','voters.mi_zip',
			// voter transportations
			'voter_transportations.cripple as crippled' ,
			'voter_transportations.id as voter_transportations_id',
			'voter_transportations.from_time','vs0.support_status_id'  , 'voter_transportations.to_time',
			//cluster address
			'ballot_box_id' , 'ballot_boxes.key as ballot_box_key', 'ballot_boxes.mi_id' , 
			'neighborhoods.key as neighborhood_key' , 'clusters.city_id as cluster_city_id' , DB::raw($fullClusterNameQuery),
			'clusters.key as cluster_key','clusters.street as cluster_street','clusters.house as cluster_house','cities.name as cluster_city_name',
			//captain details
			'captain_voters.first_name as captain_first_name','captain_voters.last_name as captain_last_name',
			'captain_voters.id as captain_voters_id','captain_city.name as captain_city_name',
			'captain_voters.personal_identity as captain_personal_identity',
			DB::Raw("($captainPhoneQuery) as captain_phone_number"),
			DB::Raw("IF(voter_streets.name IS NULL , voters.street , voter_streets.name) as street")
			];
		} else {
			$fields = [
				//voter details
				'voters.id as id','voters.key as voter_key' , 'voters.personal_identity', 'voters.first_name' , 'voters.last_name' , 
				 'voters.city_id as city_id' ,'voter_city.name as city_name' ,
				'voters.email','voters.house' , 'voters.main_voter_phone_id' , 'voters.house_entry','voters.flat' ,  'voters.household_id' ,
				'support_status.name as support_status_name' ,
				'voters.household_id','voters.additional_care',
				DB::Raw("IF(voter_streets.name IS NULL , voters.street , voter_streets.name) as street"),

				'voters.sephardi', 'ethnic_groups.name as ethnic_group_name','religious_groups.name as religious_group_name',
				
				//captain details
				'captain_voters.first_name as captain_first_name','captain_voters.last_name as captain_last_name',
				'captain_voters.id as captain_voters_id','captain_city.name as captain_city_name',
				'captain_voters.personal_identity as captain_personal_identity',
				DB::Raw("($captainPhoneQuery) as captain_phone_number"),
			];
		}


		$votersQuery = VoterQuery::select($fields)
			->leftJoin("streets as voter_streets" , "voter_streets.id","=","voters.street_id")
			->with(['voterPhones'=>function($innerQuery) use($orderByPhoneQuery)
					{$innerQuery->select('voter_phones.id as phone_id','voter_phones.phone_number' , 'voter_phones.phone_type_id' , 'voter_phones.voter_id')
						->where('wrong', 0)
						->withVoters()->orderByRaw($orderByPhoneQuery);
					}
			]) // Need to remove "->withVoters()"
			->withEthnic()
			->withReligiousGroup()
			->withVoterBallotAddressDetails($electionCampaignID)
			->withSupportStatus0($electionCampaignID)
			->leftJoin('cities AS voter_city', 'voter_city.id', '=', 'voters.city_id');

			//Captain order by details:
			$votersQuery
			->orderBy('captain_voters.last_name','ASC')
			->orderBy('captain_voters.first_name','ASC')
			->orderBy('captain_city.name','ASC');

			// Need to check geo filters source (Need to update addGeoDetailsToWhereQuery() method also):
			//Voters order by details:
			$votersQuery->orderBy('voter_city.name','ASC')
			->orderBy('street','ASC')
            ->orderBy('voters.house','ASC')
			->orderBy('voters.last_name','ASC')
            ->orderBy('voters.flat','ASC')
			->orderBy('voters.birth_date','ASC');
			$votersQuery->groupBy('voters.id');

			if(!$isRenovationReport){
				$votersQuery
				->withPreviousSupportStatus($previousCampaignID)
				->withVoterTransportations();
			} 


			return $votersQuery;
	}
	
	/*
		Private helpful function that returns a string with order-by query that is needed , by voterTable param
	*/
	private function orderPhoneQuery($voterTable){
		$orderByPhoneQuery = "CASE WHEN voter_phones.id = $voterTable.main_voter_phone_id THEN 1 WHEN voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ASC ,voter_phones.updated_at DESC, voter_phones.id";
		 return $orderByPhoneQuery;
	}
	/*
		Private helpful function that gets query reference object  , some params and addes to 
		that query joins and conditions
	*/
	private function addDetailsToQuery(&$query, $electionCampaignID,$filter_items, $filterDefinitions){
		$query->withCaptainOnly($electionCampaignID)->withCity()
		->filterItems($filter_items, $filterDefinitions);
	}
	
	/*
		Private helpful function that gets query reference object  , and addes
		captain details to that query
	*/
	private function addCaptainDetailsToWhereQuery(&$query, $regular_search_filters){
        if(!empty($regular_search_filters['minister_personal_identity'])){
			$query->where('captain_voters.personal_identity', $regular_search_filters['minister_personal_identity']);
		}
		if(!empty($regular_search_filters['minister_first_name'])){
			$query->where('captain_voters.first_name', $regular_search_filters['minister_first_name']);
		}
		if(!empty($regular_search_filters['minister_last_name'])){
			$query->where('captain_voters.last_name', $regular_search_filters['minister_last_name']);
		}
	}
	
	/*
		Private helpful function that gets query reference object  , and addes
		geo-details to that query
	*/
	private function addGeoDetailsToWhereQuery(&$query, $cityID, $neighborhoodKey, $clusterKey, $ballotBoxKey){
		if($cityID)
		{
			$query->where('clusters.city_id',$cityID);
		}
		if($neighborhoodKey)
		{
			$query->where('neighborhoods.key',$neighborhoodKey);
		}
		if($clusterKey)
		{
			$query->where('clusters.key',$clusterKey);
		}
		if($ballotBoxKey)
		{
			$query->where('ballot_box_id',$ballotBoxKey);
		} 
	}
	/*
		Function that search captain of 50 voters by params , in current election campaign.
		search params : 
		   cityKey , clusterKey , voterPersonalName , voterFirstName , voterLastName
		   
		mandatory :  cityKey or clusterKey or PersonalIdentity
	*/
	public function searchCaptain50ByParams(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$cityKey = $request->input("city_key");
		$clusterKey = $request->input("cluster_key");
		$personalIdentity = $request->input("personal_identity");
		if(($personalIdentity == null || trim($personalIdentity) == '') && ($cityKey == null || trim($cityKey) == '') && ($clusterKey == null || trim($clusterKey) == '')){
			$jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
		    return;
		}
		
		
	    $city = null;
		$cluster = null;
		if($cityKey != null && trim($cityKey) != ''){
			$city=City::select('id')->where('key', $cityKey)->where('deleted',0)->first();
			if(!$city){	
				$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
				return;
			}
			$cityID = $city->id; 		 
			$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey); 
		  
			if(!$isAllowed ){
				$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
				return;
			}
		}
		if($clusterKey != null && trim($clusterKey) != ''){
			if($cityKey != null && trim($cityKey) != ''){
				$cluster = Cluster::select('id')->where('city_id' , $cityID)->where('key' , $clusterKey)->first();
			    if(!$cluster){
					$jsonOutput->setErrorCode(config('errors.elections.CLUSTER_NOT_EXISTS'));
				    return;
				}
			}
			else{
			 
				$cluster = Cluster::select('id' , 'city_id')->where('key' , $clusterKey)->first();
	            if(!$cluster){
					$jsonOutput->setErrorCode(config('errors.elections.CLUSTER_NOT_EXISTS'));
				    return;
				}
                $clusterCity = City::select('id','key')->where('id' , $cluster->city_id)->where('deleted',0)->first();	
                if(!$clusterCity){
                     $jsonOutput->setErrorCode(config('errors.global.CITY_DOESNT_EXIST'));
				     return;
                }	
                else{
                    $isAllowed = GlobalController::isAllowedCitiesForUser($clusterCity->key); 
		  
					if(!$isAllowed ){
						$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
						return;
					}
				}				
			}
			
		}
	
		if($personalIdentity != null && trim($personalIdentity) != ''){
			$personalIdentity = trim($personalIdentity);
			$personalIdentity = ltrim($personalIdentity , '0');
			
			if( preg_match('|^[1-9][0-9]*$|' , $personalIdentity)!=true){
				$jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
				return;
			}
			
			$voterByPersonalIdentity = Voters::select('id')->where('personal_identity' , $personalIdentity)->first();
			if(!$voterByPersonalIdentity){
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
				return;
			}
		}
		
		$currentCampaign = ElectionCampaigns::currentCampaign();
	    $electionCampaignID = $currentCampaign->id;
	 
		$electionRolesByVoters = ElectionRolesByVoters::select('ballot_box_id','election_roles_by_voters.voter_id' , 'personal_identity' ,
																'first_name' , 'last_name' ,  'voters.city_id as voter_city_id' ,
																'clusters.city_id as cluster_city_id' , 'clusters.id as cluster_id' ,
																'cities.name as city_name')
														->withElectionRole()
														->withVoterAndCity()
														->withVoterInElectionCampaign()
														->where('election_roles_by_voters.election_campaign_id',$electionCampaignID)
														->where('election_roles.system_name' , 'captain_of_fifty')
														->with(['captainVoters' => function($query) use($electionCampaignID){
															$query->select('captains_voters.household_id',
																				'voters_with_captains_of_fifty.voter_id',
																				'voters_with_captains_of_fifty.captain_id',
																				'captains_voters.id')
															->join( 'voters as captains_voters', 'voters_with_captains_of_fifty.voter_id', '=','captains_voters.id' )
															->groupBy('captains_voters.household_id')
															->get();
														}
															]
														);
		if($city){
			$electionRolesByVoters = $electionRolesByVoters->where(function($query) use ($city){
				$query->where('voters.city_id' , $city->id)->orWhere('clusters.city_id' , $city->id);
			});
		}
		if($cluster){
			$electionRolesByVoters = $electionRolesByVoters->where('clusters.id' , $cluster->id);
		}
		if($personalIdentity){
			$electionRolesByVoters->where('personal_identity' , $personalIdentity);
		}
		if($request->input('first_name') !=null && trim($request->input('first_name')) != ''){
			$electionRolesByVoters->where('first_name' , 'like' , '%'.$request->input('first_name').'%');
		}
		if($request->input('last_name') !=null && trim($request->input('last_name')) != ''){
			$electionRolesByVoters->where('last_name' , 'like' , '%'.$request->input('last_name').'%');
		}
		$electionRolesByVoters=$electionRolesByVoters->get();
		 
		if($personalIdentity != null && trim($personalIdentity) != ''){
			if(sizeof($electionRolesByVoters) == 0){
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ACTIVIST_IN_MINISTER_OF_FIFTY'));
				return;
			}
		}		

		$arrayVoterIDS = array();
		$returnedArray = array();
		for($i = 0 ; $i < sizeof($electionRolesByVoters) ; $i++){
			if(in_array(trim($electionRolesByVoters[$i]->voter_id) ,$arrayVoterIDS ) == false){
				array_push($arrayVoterIDS , trim($electionRolesByVoters[$i]->voter_id));
				array_push($returnedArray , ['first_name'=>$electionRolesByVoters[$i]->first_name , 'last_name'=>$electionRolesByVoters[$i]->last_name ,
				 'personal_identity'=>$electionRolesByVoters[$i]->personal_identity , 'captains_50_count'=>$electionRolesByVoters[$i]->captainVoters->count(), 'city_name'=>$electionRolesByVoters[$i]->city_name]);
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
		if(!GlobalController::isActionPermitted('elections.activists.cluster_summary')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
		}

		if($cityKey == null || trim($cityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
			return;
		}
		$city=City::select('id')->where('key', $cityKey)->where('deleted',0)->first();
		if(!$city){	
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		}
		$cityID = $city->id; 		 
		$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey); 
		  
		if(!$isAllowed ){
			$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			return;
		}
		$currentCampaign = ElectionCampaigns::currentCampaign()->id;
		$clusters = Cluster::select('id' , 'key' ,DB::raw($this->fullClusterNameQuery))->where('election_campaign_id',$currentCampaign)->where('city_id' , $cityID)->get();
        $jsonOutput->setData($clusters);
    }

	/*
		Private helpful function that returns formatted ballot mi_id in format like 'x.0' , '2.1'
	*/
    private function getBallotMiId($ballotMiId) {
        $lastDigit = substr($ballotMiId, -1);

        return substr($ballotMiId, 0, strlen($ballotMiId) - 1) . '.' . $lastDigit;
    }
  
    /*
		Function that returns clusters list and neighborhoods list by cityKey
	
		@param cityKey
	*/
    public function getClustersAndNeightborhoodsAndBallotBoxesByCityKey($cityKey){
        $jsonOutput = app()->make("JsonOutput");
		// if(!GlobalController::isActionPermitted('elections.activists.cluster_summary')){
		// 	$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
		// 	return;
		// }

		if($cityKey == null || trim($cityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
			return;
		}
		$city=City::select('id')->where('key', $cityKey)->where('deleted',0)->first();
		if(!$city){	
			$jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
			return;
		}
		$cityID = $city->id; 		 
		$isAllowed = GlobalController::isAllowedCitiesForUser($cityKey); 
		  
		if(!$isAllowed ){
			$jsonOutput->setErrorCode(config('errors.elections.NOT_AUTHORIZED_CITY_FOR_USER'));
			return;
		}
		
		$last_campaign_id = VoterElectionsController::getLastCampaign();
		
		$clusters = Cluster::select('id' , 'key' ,DB::raw($this->fullClusterNameQuery) , 'neighborhood_id' , 'city_id')
							->where('election_campaign_id',ElectionCampaigns::currentCampaign()['id'])
							->where('city_id' , $cityID);
							
        $neighborhoods = Neighborhood::select('id' , 'key' ,'name' )
								->where('city_id' , $cityID)
								->where('deleted',0) ;
								
		 $clustersIDSArray=[];
		 $neighborhoodsIDSArray=[];
		 $ballotsIDSArray=[];

		$geographicFilters = GeoFilterService::getAllUserGeoFilters();


		$userHasGeoFilters = sizeof($geographicFilters)> 0 ? true : false;
		if($userHasGeoFilters){
				
			for($i = 0 ; $i < sizeof($geographicFilters);$i++){
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
						for($s = 0;$s<sizeof($clustersArr) ; $s++){
							array_push($clustersIDSArray , $clustersArr[$s]->id);
						}
						
						$neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->whereRaw('city_id in (select id from cities where deleted=0 and area_id='.$item->entity_id.')')->get();
						for($s = 0;$s<sizeof($neighborhoodsArr) ; $s++){
							array_push($neighborhoodsIDSArray , $neighborhoodsArr[$s]->id);
						}
						$ballotsArr=BallotBox::select('ballot_boxes.id')->whereRaw("cluster_id in (select id from clusters where election_campaign_id=".$last_campaign_id." and city_id in (select id from cities where deleted = 0 and area_id=".$item->entity_id."))")->get();
						for($s = 0;$s<sizeof($ballotsArr) ; $s++){
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
						for($s = 0;$s<sizeof($clustersArr) ; $s++){
							array_push($clustersIDSArray , $clustersArr[$s]->id);
						}
						$neighborhoodsArr = Neighborhood::select('id')->where('neighborhoods.deleted',0)->where('city_id' , $item->entity_id)->get();
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


		$clusters = $clusters->whereIn('clusters.id',$clustersIDSArray );
		$neighborhoods = $neighborhoods->whereIn('neighborhoods.id',$neighborhoodsIDSArray );
								
								
		$clusters = $clusters->get();

		$neighborhoods = $neighborhoods->get();
		 
		if(!$userHasGeoFilters){
			foreach($clusters as $cluster){
				$clustersIDSArray[] = $cluster->id; 
			}
		}


		$ballotBoxes = BallotBox::select('ballot_boxes.id', 'ballot_boxes.key' , 'ballot_boxes.mi_id' , 'cluster_id' , 'neighborhood_id')
            ->whereIn('cluster_id',$clustersIDSArray)
			->withCluster()
			->orderBy('ballot_boxes.mi_id');
		
		$ballotBoxes = $ballotBoxes->whereIn('ballot_boxes.id',$ballotsIDSArray );
		
		$ballotBoxes = $ballotBoxes->get();
			 
		for($i = 0 ; $i<sizeof($ballotBoxes);$i++){
			$mi_id =$this->getBallotMiId($ballotBoxes[$i]->mi_id);
			$ballotBoxes[$i]->mi_id = $mi_id;
		}
        $jsonOutput->setData(['clusters'=>$clusters , 'neighborhoods'=>$neighborhoods , 'ballotBoxes'=>$ballotBoxes ]);
	}

}
