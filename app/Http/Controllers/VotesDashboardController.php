<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Libraries\Services\ElectionRolesByVotersMessagesService;
use App\Libraries\Services\IncomingMessageService;
use App\Models\AreasGroup;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\ElectionRolesByVotersMessages;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\ElectionRoles;
use App\Models\VoterElectionCampaigns;
use App\Models\ElectionRolesGeographical;
use App\Models\Voters;
use App\Models\Votes;
use App\Models\VoteSources;
use App\Models\ElectionDayReportingWrongMessages;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\API\Sms\Sms;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;
use App\Libraries\Services\municipal\MunicipalArrivedActivistBallotService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VotesDashboardController extends Controller
{   

    private $entitiesIDSArrays = null; 
    private $currentCampaign = null; 
	/*
		Function that sends collective sms/ivr messages to voters by election_role_by_voter_geographic_areas keys - it 
		fetches the voter and his phone number by table row key , and checks if it has Kosher phone or nor , and then sends the message.
		It also gets as parameter the "list_type" - "unverified" or "missed" , and by this it decides which message template to send.
	*/
	public function sendMessageToActivist(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		if($request->input("list_type") == "unverified"){ //send collective message to "unverified" voter role entries
			$election_role_geo_shift_keys = json_decode($request->input("election_role_geog_row_keys") , false);
			
			$sms_message = config('constants.activists.verificationMessageText');
			$ivr_message = config('constants.activists.verificationMessageTextIvr'); 
			$ivr_send_message = config('constants.activists.verificationMessageTextSendIvr');

			$relevantData = ElectionRolesGeographical::select('election_roles_by_voters.phone_number' , 'voters.first_name', 'voters.last_name' , 'election_roles.name as role_name' , 'election_roles_by_voters.id as activist_id')->whereIn('election_role_by_voter_geographic_areas.key',$election_role_geo_shift_keys)
													   ->withElectionRolesByVoters(false)
													   ->join('election_roles' , 'election_roles.id','=','election_roles_by_voters.election_role_id')
													   ->join('voters','voters.id','=','election_roles_by_voters.voter_id')
													   ->where('election_roles_by_voters.election_campaign_id',$currentCampaign)
														->get();
			for($i = 0 ; $i < count($relevantData);$i++){
				$voterItem = $relevantData[$i];
				if(Helper::isKosherPhone($voterItem->phone_number)) {
					//replace message placeholders
					$first_name = $voterItem->first_name;
					$last_name = $voterItem->last_name;
					$role_name = $voterItem->role_name;
	
					$activistMessage = str_replace(['[first_name]', '[last_name]', '[role_name]'],
					[$first_name, $last_name, $role_name], $ivr_message);
	
					// $ivr_send_message = str_replace(['[first_name]', '[last_name]', '[role_name]'],
					// [$first_name, $last_name, $role_name], $ivr_send_message);
					$ivrData = [
						'first_name' => $first_name,
						'last_name' => $last_name,
						'role_name' => $role_name,
					];
					$sendCode = (Ivr::send($voterItem->phone_number, $activistMessage, IvrConst::TYPE_ACTIVIST_VERIFICATION , $ivrData)) ? 'OK' : 'Error';
				} else {
					//replace message placeholders
					$activistMessage = str_replace('[first_name]', $voterItem->first_name, $sms_message);
					$activistMessage = str_replace('[role_name]', $voterItem->role_name, $activistMessage);
					$sendCode = (Sms::connection('telemarketing')->send($voterItem->phone_number, $activistMessage)) ? 'OK' : 'Error';
				}
				if ( 'OK' == $sendCode ) {
					$messageArgs = [
						'election_role_by_voter_id' => $voterItem->activist_id,
						'text' => $activistMessage,
						'phone_number' => $voterItem->phone_number,
					];
                   $electionRolesByVotersMessages = ElectionRolesByVotersMessagesService::sendMessageToActivist($messageArgs);
				   $electionRolesByVotersMessagesId = $electionRolesByVotersMessages->id;
				}
			}
			$jsonOutput->setData("ok");
		}
		elseif($request->input("list_type") == "missed"){ //send collective message to "missed" voter role entries
		    $smsCount = 0;
		    $smsFailCount = 0;
		    $ivrCount = 0;
		    $ivrFailCount = 0;
		    $election_role_geo_shift_keys = json_decode($request->input("election_role_geog_row_keys") , false);
			$relevantData = ElectionRolesGeographical::select('election_roles_by_voters.phone_number' , 'ballot_boxes.mi_id','clusters.street as ballot_address' ,
																'election_roles_by_voters.vote_reporting_key' ,'election_role_by_voter_geographic_areas.id','cities.assign_leader_phone_number',
																'voters.first_name' , 'voters.last_name' , 'election_roles.name as role_name' ,
																'election_roles_by_voters.id as activist_id','election_role_by_voter_geographic_areas.current_reporting',
																'cities.name as city_name' ,'cities.mi_id as city_mi_id')
													   ->withElectionRolesByVoters(false)
													   ->join('election_roles' , 'election_roles.id','=','election_roles_by_voters.election_role_id')
													   ->join('voters','voters.id','=','election_roles_by_voters.voter_id')
													   ->join('ballot_boxes', 'ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id')
													   ->join('clusters', function($joinOn) use($currentCampaign){
															$joinOn->on('clusters.id' , '=' , 'ballot_boxes.cluster_id' )
																	->on('clusters.election_campaign_id' , '=' , DB::raw($currentCampaign));
														})
														->join('cities', 'cities.id', '=', 'clusters.city_id') 
														->whereIn('election_role_by_voter_geographic_areas.key',$election_role_geo_shift_keys)
													  	->where('election_roles_by_voters.election_campaign_id',$currentCampaign)
														->get();
			for($i = 0 ; $i < count($relevantData);$i++){
				$fail = false; 
				$voterItem = $relevantData[$i];
				if ($voterItem->vote_reporting_key == null) {
					$reportingKey = mt_rand(1,9). Helper::random(9, Helper::DIGIT);
					ElectionRolesByVoters::where('id' ,$voterItem->activist_id )->update(['vote_reporting_key'=>$reportingKey]);
					$voterItem->vote_reporting_key = $reportingKey; 
				}
 
				if (!Helper::isKosherPhone($voterItem->phone_number)) {
						$link = config('app.url').$voterItem->vote_reporting_key;
						$miId = $voterItem->mi_id;
						$clusterAddress= $voterItem->ballot_address;
						$miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);
						$message = config('constants.activists.BallotReportingMessge');
						$message = str_replace("[first_name]", $voterItem->first_name, $message);
						//$message = str_replace("[last_name]", $voterItem->last_name, $message);
						$message = str_replace("[global_phone_number]", $voterItem->assign_leader_phone_number, $message);
						 $message = str_replace("[ballot_addr]", $clusterAddress." , קלפי ".$miId , $message);
					 
						$message = str_replace("[mobile_link]", $link, $message);
						$response = Sms::connection('telemarketing')->send($voterItem->phone_number, $message);
						if ($response) {
							$smsCount++;
						} else {
							$smsFailCount++;
							$fail = true;
						}

                }else{
					$message = config('constants.activists.BallotReportingMessgeIvr');
					$messageSendIvr = config('constants.activists.BallotReportingMessgeSendIvr');
					$first_name = $voterItem->first_name;
					$last_name = $voterItem->last_name;

					$miId = $voterItem->mi_id;
					$miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);
					$city_name = $voterItem->city_name;
					$city_mi_id = $voterItem->city_mi_id;

					$message = str_replace(['[first_name]', '[last_name]', '[ballot_mi_id]','[city_name]'],
					[$first_name, $last_name, $miId, $city_name], $message);

					// $messageSendIvr = str_replace(['[first_name]', '[last_name]', '[ballot_mi_id]','[city_name]'],
					// [$first_name, $last_name, $miId, $city_name], $messageSendIvr);
					$ivrData = [
						'first_name' => $first_name,
						'last_name' => $last_name,
						'ballot' => $miId,
						'city' => $city_mi_id,
						'city_name' => $city_name,
					];
					Ivr::resetActivists($voterItem->phone_number);
					sleep(1);
					$response = Ivr::send($voterItem->phone_number, $message, IvrConst::TYPE_VOTE_REPORTING, $ivrData);
					if ($response) {
						$ivrCount++;
					} else {
						$ivrFailCount++;
						$fail = true;
					}   
				}
				if(!$fail) { 
					
					if($voterItem->current_reporting == '1'){
						ElectionRolesGeographical::where('id', $voterItem->id)->update(['current_reporting' => '0']);
					}

					IncomingMessageService::saveActivistMessage($voterItem->activist_id, 
																$voterItem->phone_number, 
																$message, 
																config('constants.MESSAGE_DIRECTION_OUT'), 
																null, 
																null, 
																null);
				}
			}
			$result =[
				'ivr' =>['success' => $ivrCount, 'failed' => $ivrFailCount],
				'sms' =>['success' => $smsCount, 'failed' => $smsFailCount]
			];
			$jsonOutput->setData([
				'results' => $result
			]);
		}

	}

	/*
		Helpful function that returns entity id by type and key , or -1 in case of error
	*/
	private function getEntityIDByTypeAndKey($entityType , $entityKey){
		$entityID = -1;
		switch($entityType){
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
				$areasGroup = AreasGroup::select('id')->where('key',$entityKey)->where('deleted',0)->first();
				if($areasGroup){
					$entityID = $areasGroup->id;
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
				$area = Area::select('id')->where('key',$entityKey)->where('deleted',0)->first();
				if($area){
					$entityID = $area->id;
				}
				break;

			case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
				$subArea = SubArea::select('id')->where('key',$entityKey)->where('deleted',0)->first();
				if($subArea){
					$entityID = $subArea->id;
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
				$city = City::select('id')->where('key',$entityKey)->where('deleted',0)->first();
				if($city){
					$entityID = $city->id;
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
				$neighborhood = Neighborhood::select('id')->where('key',$entityKey)->where('deleted',0)->first();
				if($neighborhood){
					$entityID = $neighborhood->id;
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
				$cluster = Cluster::select('id')->where('key',$entityKey)->first();
				if($cluster){
					$entityID = $cluster->id;
				}
				break;
			case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
				$cluster = BallotBox::select('id')->where('key',$entityKey)->first();
				if($cluster){
					$entityID = $cluster->id;
				}
				break;
		}
		return $entityID;
	}
	
	/*
		Private helpful function that adds to queryObject geoEntities filters
	*/
	private function addGeoEntitiesToQuery($baseQuery , $entityType , $entityID){
		$userIsAdmin = (Auth::user()['admin'] == '1');
		$in_allowed_ballots_ids_query = '';
		$in_allowed_cities_ids_query = '';
		$allowed_ballots_ids_entity_query = '';

		if(!$userIsAdmin){
			
			if(!$this->entitiesIDSArrays){
				$this->entitiesIDSArrays = GlobalController::getNotAdminGeoEntitiesIDS();
			}
			$in_allowed_cities_ids_query = !empty($this->entitiesIDSArrays['allowed_cities_ids']) ? ' and id in(' . implode("," , $this->entitiesIDSArrays['allowed_cities_ids']) . ') ' :'';
			$in_allowed_ballots_ids_query = !empty($this->entitiesIDSArrays['allowed_ballots_ids']) ? ' id in(' .implode("," , $this->entitiesIDSArrays['allowed_ballots_ids']) . ') and ' :'';
			$allowed_ballots_ids_entity_query =  $in_allowed_cities_ids_query ? str_replace('id', 'enitity_id', $in_allowed_cities_ids_query) .' and ' :'' ;
		
		}
		$allowed_ballots_ids = $this->entitiesIDSArrays['allowed_cities_ids'];
		if(!$this->currentCampaign){
				$this->currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		}
		switch($entityType){

						case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):

							if($userIsAdmin){
								$areaIdList = AreasGroup::getAllAreas($entityID);
								$whereInIdsQuery = ' in('. \implode(',', $areaIdList).') ';
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
								or (
								CASE 
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
										entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign."))
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
										entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and city_id in (select id from cities where area_id $whereInIdsQuery )))
									ELSE
										false
								END
							)
																										
								)");
							}
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
							if($userIsAdmin){
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
								or (
								CASE 
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
										entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign."))
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
										entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and city_id in (select id from cities where area_id=".$entityID.")))
									ELSE
										false
								END
							)
																										
								)");
							}
							else{
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
									or (
									CASE 
										WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
											entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query 
											cluster_id in (select id from clusters where id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign." ))
										WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
											entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query 
											cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." 
											and  city_id in (select id from cities where area_id=".$entityID." $in_allowed_cities_ids_query)))
										ELSE
											false
									END
								))");
							}
							break;
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
							 if($userIsAdmin){
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
								or (
								CASE 
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
										entity_id in (select id from ballot_boxes where cluster_id =".$entityID." )
									WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
										entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id="
										.$this->currentCampaign." and city_id in (select id from cities where cities.deleted=0 and sub_area_id=".$entityID.")))
									ELSE
										false
								END
							)
																										
								)");
							}
							else{
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
									or (
									CASE 
										WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
											entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query 
											cluster_id in (select id from clusters where id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign." ))
										WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
											entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query 
											cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." 
											and  city_id in (select id from cities where sub_area_id=".$entityID." $in_allowed_cities_ids_query)))
										ELSE
											false
									END
								))");
							}
							break;
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
						    if($userIsAdmin){
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
																										 or (
																											CASE 
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
																													entity_id in (select id from ballot_boxes where cluster_id =".$entityID." )
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
																													entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and city_id=".$entityID."))
																												ELSE
																													false
																											END
																										)
																										
								)");
							}
							else{
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
																										 or (
																											CASE 
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
																													entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query cluster_id =".$entityID." )
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
																													entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and city_id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign."))
																												ELSE
																													false
																											END
																										)
																										
								)");
							}
							break;
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
							if($userIsAdmin){
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
																										 or (
																											CASE 
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
																													entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and neighborhood_id =".$entityID."))
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
																													entity_id in (select id from ballot_boxes where cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and neighborhood_id=".$entityID."))
																												ELSE
																													false
																											END
																										)
																										
								)");
							}
							else{
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".$entityID." and  entity_type=".$entityType.")
																										 or (
																											CASE 
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')." THEN
																													entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and neighborhood_id=".$entityID.") )
																												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
																													entity_id in (select id from ballot_boxes where $in_allowed_ballots_ids_query cluster_id in (select id from clusters where clusters.election_campaign_id=".$this->currentCampaign." and neighborhood_id=".$entityID." and clusters.election_campaign_id=".$this->currentCampaign."))
																												ELSE
																													false
																											END
																										)
																										
								)");
							}
							break;
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
								$baseQuery = $baseQuery->whereRaw("((election_role_by_voter_geographic_areas.entity_id=".
								$entityID." and  entity_type=".$entityType.")
											or (
											CASE 
												WHEN entity_type=".config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')." THEN
													entity_id in (select id from ballot_boxes where cluster_id =".$entityID.")
												ELSE
													false
											END
										)
								)");

							break;
						case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
							if($userIsAdmin){
								$baseQuery = $baseQuery->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
							}
							else{
								$baseQuery = $baseQuery->whereIn('election_role_by_voter_geographic_areas.entity_id',$allowed_ballots_ids)->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
							}
							break;
					}
					return $baseQuery;
	}
	
	/*
		Returns all needed data for votes dashboard main screen
	*/
	public function getMainDashboardData(Request $request){
		$time_start = microtime(true); 
		$executionStartTime = microtime(true);
		$jsonOutput = app()->make("JsonOutput");

		$isHotBallots = $request->input("hot_ballots", null);
		
		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$neededElectionsRoles = $this->getRelevantElectionRoles();
		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		$returnedObj = new \stdClass;
		$electionRoles = ElectionRoles::select('id','name' , 'system_name')->whereIn('system_name',$neededElectionsRoles)->get();
		$electionRoleShifts = ElectionRoleShifts::select('id','name', 'system_name')
						->where('deleted',0)
						->get();
		//create hash for shift system name to id
		$electionRoleShiftsHash = [];
		foreach($electionRoleShifts as $index => $shift) {
			$electionRoleShiftsHash[$shift->system_name] = $shift->id;
			//remove shift + count
			if (in_array($shift->system_name, [
				config('constants.activists.role_shifts.SECOND_AND_COUNT'),
				config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')])) $electionRoleShifts->forget($index);
		}
		$entityType = $request->input("entity_type");
		$entityKey = $request->input("entity_key");
		$entityID = null;
		
		$userIsAdmin = (Auth::user()['admin'] == '1');
		if(!$userIsAdmin){
			if((!$entityType && $entityType!="0")  || !$entityKey){
				$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			    return;
			}
		}
		
		 
		if($entityType != null && $entityKey != null){
			 $entityID = $this->getEntityIDByTypeAndKey($entityType , $entityKey);
			 if($entityID  == -1){
				 $jsonOutput->setErrorCode(config('errors.system.ENTITY_DOESNT_EXISTS'));
				 return;
			 }
		}
		 
	    
		$notShiftedRoles = ElectionRolesByVoters::selectRaw("election_roles.system_name , election_roles_by_voters.election_role_id , verified_status")->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
												  ->whereIn('election_roles.system_name',$neededElectionsRoles)
												  ->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
												  ->whereRaw("not exists(select election_role_by_voter_id  from election_role_by_voter_geographic_areas where election_role_by_voter_id = election_roles_by_voters.id)")
												  ->get();
		 
		 
		for($i = 0 ; $i<count($electionRoles);$i++){
			$totalsArray = [];
			$allRoleVoters = ElectionRolesByVoters::selectRaw("voter_id , verified_status")
																		->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
																		->join('election_role_shifts','election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('voters' , 'voters.id','=','election_roles_by_voters.voter_id');
			if(!empty($isHotBallots)){
				$allRoleVoters = $allRoleVoters->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($allRoleVoters, $isHotBallots);														  
			}

			$allRoleVoters = $allRoleVoters->where('election_role_id',$electionRoles[$i]->id)
											->where('election_campaign_id' , $currentCampaign);
		    if($entityID > 0){
				    $allRoleVoters = $this->addGeoEntitiesToQuery($allRoleVoters , $entityType , $entityID);	
			}
			$allRoleVoters = $allRoleVoters->groupBy("voter_id")->get();
			 
			$electionRoles[$i]->total_enrolled_count = count($allRoleVoters);
			
			$totalVerifiedEnrolledCount = 0;
			for($k = 0;$k<count($allRoleVoters);$k++){
				if($allRoleVoters[$k]->verified_status == config('constants.activists.verified_status.VERIFIED')){
					$totalVerifiedEnrolledCount ++;
				}
			}
			$electionRoles[$i]->total_enrolled_verified_count = $totalVerifiedEnrolledCount;
			
			$electionRoles[$i]->all_arrived_role_voters = ElectionRolesByVoters::selectRaw("distinct(election_roles_by_voters.voter_id)")
																		->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id');

			if(!empty($isHotBallots)){
				$electionRoles[$i]->all_arrived_role_voters = $electionRoles[$i]->all_arrived_role_voters->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($electionRoles[$i]->all_arrived_role_voters, $isHotBallots);														  
			}
			$electionRoles[$i]->all_arrived_role_voters  = $electionRoles[$i]->all_arrived_role_voters->where('election_role_id',$electionRoles[$i]->id)
																		->whereNotNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
			if($entityID > 0){
				$electionRoles[$i]->all_arrived_role_voters = $this->addGeoEntitiesToQuery($electionRoles[$i]->all_arrived_role_voters , $entityType , $entityID) ;//$tempRoleShift->arrived_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
			}															
			$electionRoles[$i]->all_arrived_role_voters = $electionRoles[$i]->all_arrived_role_voters->count();
			
			
			$electionRoles[$i]->all_reporting_role_voters =  ElectionRolesByVoters::selectRaw("distinct(election_roles_by_voters.voter_id)")->withElectionRoleGeographical();

			if(!empty($isHotBallots)){
				$electionRoles[$i]->all_reporting_role_voters = $electionRoles[$i]->all_reporting_role_voters->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($electionRoles[$i]->all_reporting_role_voters, $isHotBallots);														  
			}

			$electionRoles[$i]->all_reporting_role_voters = $electionRoles[$i]->all_reporting_role_voters->where('election_role_id',$electionRoles[$i]->id)
																		 ->where('correct_reporting',1)
																		 ->where('election_campaign_id' , $currentCampaign);
			if($entityID > 0){
				$electionRoles[$i]->all_reporting_role_voters = $this->addGeoEntitiesToQuery($electionRoles[$i]->all_reporting_role_voters , $entityType , $entityID) ; //$tempRoleShift->reporting_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
			}	
			$electionRoles[$i]->all_reporting_role_voters = $electionRoles[$i]->all_reporting_role_voters->count();
 
			
			 
			$electionRoles[$i]->all_not_reporting_30mins_count =  ElectionRolesByVoters::selectRaw("count(distinct election_roles_by_voters.voter_id) as total_count")->selectRaw("election_roles_by_voters.voter_id")
																		->withElectionRoleGeographical()
																		->join('votes',function($joinOn){
																			$joinOn->on('votes.reporting_voter_id','=','election_roles_by_voters.voter_id')
																				   ->on('votes.election_campaign_id','=','election_roles_by_voters.election_campaign_id')
																				   
																				   ;
																		});

			if(!empty($isHotBallots)){
				$electionRoles[$i]->all_not_reporting_30mins_count = $electionRoles[$i]->all_not_reporting_30mins_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($electionRoles[$i]->all_not_reporting_30mins_count, $isHotBallots);														  
			}
			$electionRoles[$i]->all_not_reporting_30mins_count = $electionRoles[$i]->all_not_reporting_30mins_count->whereRaw("not votes.id in (select id from votes as temp where temp.reporting_voter_id=votes.reporting_voter_id and temp.election_campaign_id = votes.election_campaign_id and  temp.created_at  <= (30+".time().") )")
																		->where('election_role_id',$electionRoles[$i]->id)
																		 ->where('correct_reporting',1)
																		 
																		 ->where('election_roles_by_voters.election_campaign_id' , $currentCampaign);
				if($entityID > 0){
					$electionRoles[$i]->all_not_reporting_30mins_count  = $this->addGeoEntitiesToQuery($electionRoles[$i]->all_not_reporting_30mins_count , $entityType , $entityID) ; //$tempRoleShift->not_reporting_30mins_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
				}	
				$electionRoles[$i]->all_not_reporting_30mins_count = $electionRoles[$i]->all_not_reporting_30mins_count->first()->total_count;
			 
			$roleShiftsArr = [];
			for($j = 0 ; $j < count($electionRoleShifts);$j++){
				$tempRoleShift = new \stdClass;
				$tempRoleShift->id = $electionRoleShifts[$j]->id;
				$tempRoleShift->name = $electionRoleShifts[$j]->name;
				$tempRoleShift->system_name = $electionRoleShifts[$j]->system_name;

				//create list of id's for current shift, add count shift if needed
				$shiftList = [$electionRoleShifts[$j]->id];
				if ($electionRoleShifts[$j]->system_name == config('constants.activists.role_shifts.SECOND')) {
					$shiftList[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.SECOND_AND_COUNT')];
				} else if ($electionRoleShifts[$j]->system_name == config('constants.activists.role_shifts.ALL_DAY')) {
					$shiftList[] = $electionRoleShiftsHash[config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')];
				}

				$tempRoleShift->enrolled_count =  ElectionRolesByVoters::selectRaw("distinct(election_roles_by_voters.voter_id)")->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
																		->join('election_role_shifts','election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('voters' , 'voters.id','=','election_roles_by_voters.voter_id');
			if(!empty($isHotBallots)){
				$tempRoleShift->enrolled_count = $tempRoleShift->enrolled_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($tempRoleShift->enrolled_count, $isHotBallots);														  
			}

			$tempRoleShift->enrolled_count = $tempRoleShift->enrolled_count->whereIn('election_role_shift_id',$shiftList)
																			->where('election_role_id',$electionRoles[$i]->id)
																			 ->where('election_campaign_id' , $currentCampaign);
																			 
						
			if($entityID > 0){
				   $tempRoleShift->enrolled_count = $this->addGeoEntitiesToQuery($tempRoleShift->enrolled_count , $entityType , $entityID);	
			}
			$tempRoleShift->enrolled_count = $tempRoleShift->enrolled_count->get();															
			$tempRoleShift->enrolled_count = count($tempRoleShift->enrolled_count);
				
				
			////////////////////////////////////////////////////
			$tempRoleShift->verified_count = ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id');
			if($isHotBallots){
				$tempRoleShift->verified_count = $tempRoleShift->verified_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($tempRoleShift->verified_count, $isHotBallots);														  
			}
			$tempRoleShift->verified_count = $tempRoleShift->verified_count->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		->where('verified_status',config('constants.activists.verified_status.VERIFIED'))
																		 ->where('election_campaign_id' , $currentCampaign) ;
			if($entityID > 0){
				$tempRoleShift->verified_count =  $this->addGeoEntitiesToQuery($tempRoleShift->verified_count , $entityType , $entityID) ; //$tempRoleShift->verified_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
			}														
			$tempRoleShift->verified_count = $tempRoleShift->verified_count->count();														
				
				
			////////////////////////////////////////////////////														
			$tempRoleShift->arrived_count = ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id');
			if($isHotBallots){
				$tempRoleShift->arrived_count = $tempRoleShift->arrived_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($tempRoleShift->arrived_count, $isHotBallots);														  
			}
			$tempRoleShift->arrived_count = $tempRoleShift->arrived_count->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		->whereNotNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
																		 
														
			$tempRoleShift->arrived_count_sms = ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('vote_sources' , 'vote_sources.id','=','election_role_by_voter_geographic_areas.vote_source_id');
			if($isHotBallots){
				$tempRoleShift->arrived_count_sms = $tempRoleShift->arrived_count_sms->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($tempRoleShift->arrived_count_sms, $isHotBallots);														  
			}
			$tempRoleShift->arrived_count_sms = $tempRoleShift->arrived_count_sms->where('vote_sources.system_name','sms')
																		->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		->whereNotNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
				
				
			$tempRoleShift->arrived_count_mobile = ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('vote_sources' , 'vote_sources.id','=','election_role_by_voter_geographic_areas.vote_source_id');
			if($isHotBallots){
					$tempRoleShift->arrived_count_mobile = $tempRoleShift->arrived_count_mobile->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
					$this->addHotToQuery($tempRoleShift->arrived_count_mobile, $isHotBallots);														  
			}
			$tempRoleShift->arrived_count_mobile = $tempRoleShift->arrived_count_mobile->where('vote_sources.system_name','mobile')
																		->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		->whereNotNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
																		 
			$tempRoleShift->arrived_count_ivr = ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('vote_sources' , 'vote_sources.id','=','election_role_by_voter_geographic_areas.vote_source_id');
			if($isHotBallots){
					$tempRoleShift->arrived_count_ivr = $tempRoleShift->arrived_count_ivr->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
					$this->addHotToQuery($tempRoleShift->arrived_count_ivr, $isHotBallots);														  
				}
			$tempRoleShift->arrived_count_ivr = $tempRoleShift->arrived_count_ivr->where('vote_sources.system_name','ivr')
																		->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		->whereNotNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
																		 
			if($entityID > 0){
				$tempRoleShift->arrived_count = $this->addGeoEntitiesToQuery($tempRoleShift->arrived_count , $entityType , $entityID) ;//$tempRoleShift->arrived_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
				$tempRoleShift->arrived_count_sms = $this->addGeoEntitiesToQuery($tempRoleShift->arrived_count_sms , $entityType , $entityID) ; 
				$tempRoleShift->arrived_count_mobile = $this->addGeoEntitiesToQuery($tempRoleShift->arrived_count_mobile , $entityType , $entityID) ; 
				$tempRoleShift->arrived_count_ivr = $this->addGeoEntitiesToQuery($tempRoleShift->arrived_count_ivr , $entityType , $entityID) ; 
			}															
			$tempRoleShift->arrived_count = $tempRoleShift->arrived_count->count();
			$tempRoleShift->arrived_count_sms = $tempRoleShift->arrived_count_sms->count();
			$tempRoleShift->arrived_count_mobile = $tempRoleShift->arrived_count_mobile->count();
			$tempRoleShift->arrived_count_ivr = $tempRoleShift->arrived_count_ivr->count();
				 												
			////////////////////////////////////////////////////	
			$tempRoleShift->reporting_count =  ElectionRolesByVoters::withElectionRoleGeographical();
			if($isHotBallots){
					$tempRoleShift->reporting_count = $tempRoleShift->reporting_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
					$this->addHotToQuery($tempRoleShift->reporting_count, $isHotBallots);														  
			}
			$tempRoleShift->reporting_count  = $tempRoleShift->reporting_count->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		 ->where('correct_reporting',1)
																		 ->where('election_campaign_id' , $currentCampaign);
			if($entityID > 0){
				$tempRoleShift->reporting_count = $this->addGeoEntitiesToQuery($tempRoleShift->reporting_count , $entityType , $entityID) ; //$tempRoleShift->reporting_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
			}
			$tempRoleShift->reporting_count = $tempRoleShift->reporting_count->groupBy('election_roles_by_voters.voter_id')->get();
			
			$tempRoleShift->reporting_count = count($tempRoleShift->reporting_count);
				////////////////////////////////////////////////////
				 
			$tempRoleShift->not_reporting_30mins_count =  ElectionRolesByVoters::selectRaw("count(distinct election_roles_by_voters.voter_id) as total_count")
																		->withElectionRoleGeographical()
																		->join('votes',function($joinOn){
																			$joinOn->on('votes.reporting_voter_id','=','election_roles_by_voters.voter_id')
																				   ->on('votes.election_campaign_id','=','election_roles_by_voters.election_campaign_id')
																				   
																				   ;
																		});
			if($isHotBallots){
				$tempRoleShift->not_reporting_30mins_count = $tempRoleShift->not_reporting_30mins_count->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($tempRoleShift->not_reporting_30mins_count, $isHotBallots);														  
			}
			$tempRoleShift->not_reporting_30mins_count = $tempRoleShift->not_reporting_30mins_count->whereRaw("not (votes.id in (select id from votes as temp where temp.reporting_voter_id=votes.reporting_voter_id and temp.election_campaign_id = votes.election_campaign_id and  temp.created_at <= (30 + ".time().") ))")
																		->whereIn('election_role_shift_id',$shiftList)
																		->where('election_role_id',$electionRoles[$i]->id)
																		 ->where('correct_reporting',1)
																		 ->where('election_roles_by_voters.election_campaign_id' , $currentCampaign);
				if($entityID > 0){
					$tempRoleShift->not_reporting_30mins_count = $this->addGeoEntitiesToQuery($tempRoleShift->not_reporting_30mins_count , $entityType , $entityID) ; //$tempRoleShift->not_reporting_30mins_count->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
				}	
				$tempRoleShift->not_reporting_30mins_count = $tempRoleShift->not_reporting_30mins_count->first()->total_count;
				 
				////////////////////////////////////////////////////					
				array_push($roleShiftsArr , $tempRoleShift);
			}
			$electionRoles[$i]->role_shifts = $roleShiftsArr;
		}
		
		$returnedObj->roles_summary = $electionRoles;
		$returnedObj->activists_reports_count_today = 0;
		$returnedObj->all_votes_count_today = 0;
		$returnedObj->activists_reports_count_last_hour = 0;

		$fieldName = $isHotBallots == 1 ? 'disregard' : 'hot';
		$operation = $isHotBallots == 1 ? '!=' : '=';
	 
		$sumsObject = null;
		if($entityType !="0" && !$entityType){
				if($isHotBallots){
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")
											->whereRaw("clusters.id in (select cluster_id from ballot_boxes where ballot_boxes.hot=1)")
											->where('clusters.election_campaign_id',$currentCampaign)
											->first();
					$returnedObj->all_votes_count_today = Votes::join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																})
																->where('votes.election_campaign_id',$currentCampaign)
																->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign)
																->join('ballot_boxes' , 'ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id')
																->where("ballot_boxes.$fieldName",$operation,1)	
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																				$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																				->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																			 })
																			->join('ballot_boxes' , 'ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id')
																			->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign)
																			->where("ballot_boxes.$fieldName",$operation,1)
																			->count();
					$returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->join('voters_in_election_campaigns',function($joinOn){
																				$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																				->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																			 })
																	->join('ballot_boxes' , 'ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id')
																	->where('voters_in_election_campaigns.election_campaign_id',$currentCampaign)
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->where("ballot_boxes.$fieldName",$operation,1)
																	->groupBy("hr")->orderBy("hr","DESC")->get();
				}
				else{
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")->where('clusters.election_campaign_id',$currentCampaign)->first();
					$returnedObj->all_votes_count_today = Votes::where('election_campaign_id',$currentCampaign)->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, created_at , now() ) <= 60")->count();
					$returnedObj->agents_performance_hourly = Votes::selectRaw("hour(created_at) as hr , CONCAT(hour(created_at) , ':00') as label , count(*) as value")->where('election_campaign_id' , $currentCampaign)->whereRaw(" not (reporting_voter_id is NULL)")->groupBy("hr")->orderBy("hr","DESC")->get();
				}
		} 
		else{
			switch($entityType){
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
					$returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->groupBy("hr")
																	->orderBy("hr","DESC")
																	->join('voters_in_election_campaigns',function($joinOn){
																		$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																	});
					if($isHotBallots){
						$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' );
						$this->addHotToQuery($tempRoleShift->agents_performance_hourly, $isHotBallots);														  

					}
					$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->where('ballot_box_id',$entityID)
																	->get();
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")
										->join('ballot_boxes' , 'ballot_boxes.cluster_id' , '=' , 'clusters.id');
					if($isHotBallots){
						$this->addHotToQuery($sumsObject, $isHotBallots);														  
					}
					$sumsObject = $sumsObject->where('ballot_boxes.id',$entityID)
										->where('clusters.election_campaign_id',$currentCampaign)
										->first();
					$returnedObj->all_votes_count_today = Votes::where('votes.election_campaign_id',$currentCampaign)
																->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																});
					if($isHotBallots){
						$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today
																			->join('ballot_boxes' , 'ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id');
						$this->addHotToQuery($returnedObj->all_votes_count_today, $isHotBallots);														  
					}
					$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today->where('ballot_box_id',$entityID)
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																					$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																							->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																					});
				    if($isHotBallots){
						$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->join('ballot_boxes' , 'ballot_boxes.id','=','voters_in_election_campaigns.ballot_box_id');
						$this->addHotToQuery($returnedObj->activists_reports_count_last_hour, $isHotBallots);														  
					}
					$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->where('ballot_box_id',$entityID)
																			->count();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
					$returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->groupBy("hr")
																	->orderBy("hr","DESC")
																	->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																	})
																	->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																	->join('clusters','clusters.id','=','ballot_boxes.cluster_id');
																	
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->agents_performance_hourly, $isHotBallots);														  

					}
					$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->where('clusters.election_campaign_id',$currentCampaign)
																	->where('clusters.id',$entityID)
																	->get();
																	
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ");
					if($isHotBallots){
						$sumsObject = $sumsObject = $sumsObject->whereRaw("clusters.id in (select distinct cluster_id from ballot_boxes where ballot_boxes.$fieldName $operation 1)");
					}
					$sumsObject = $sumsObject->where('clusters.id',$entityID)
										->where('clusters.election_campaign_id',$currentCampaign)
										->first();
					$returnedObj->all_votes_count_today = Votes::where('votes.election_campaign_id',$currentCampaign)
																->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																})
																->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																->join('clusters','clusters.id','=','ballot_boxes.cluster_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->all_votes_count_today, $isHotBallots);														  
					}
					$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today->where('clusters.election_campaign_id',$currentCampaign)
																->where('clusters.id',$entityID)
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																					$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																							->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																					})
																			->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																			->join('clusters','clusters.id','=','ballot_boxes.cluster_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->activists_reports_count_last_hour, $isHotBallots);														  
					}
					$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->where('clusters.election_campaign_id',$currentCampaign)
																			->where('clusters.id',$entityID)
																			->count();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
				    $returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->groupBy("hr")
																	->orderBy("hr","DESC")
																	->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																	})
																	->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																	->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																	->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->agents_performance_hourly, $isHotBallots);														  
					}
					$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->where('clusters.election_campaign_id',$currentCampaign)
																	->where('cities.id',$entityID)
																	->where('cities.deleted',0)
																	->get();
																	
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")
										->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$sumsObject = $sumsObject = $sumsObject->whereRaw("clusters.id in (select cluster_id from ballot_boxes where ballot_boxes.hot=1)");
					
					}
					$sumsObject = $sumsObject->where('cities.id',$entityID)
										->where('cities.deleted',0)
										->where('clusters.election_campaign_id',$currentCampaign)
										->first();
					$returnedObj->all_votes_count_today = Votes::where('votes.election_campaign_id',$currentCampaign)
																->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																})
																->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->all_votes_count_today, $isHotBallots);														  
					}
																
																
																
					$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today->where('clusters.election_campaign_id',$currentCampaign)
																->where('cities.id',$entityID)
																->where('cities.deleted',0)
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																					$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																							->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																					})
																			->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																			->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																			->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->activists_reports_count_last_hour, $isHotBallots);														  
					}
																			
																			
					$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->where('clusters.election_campaign_id',$currentCampaign)
																			->where('cities.id',$entityID)
																			->where('cities.deleted',0)
																			->count();
					break;
				case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
				    $returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->groupBy("hr")
																	->orderBy("hr","DESC")
																	->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																	})
																	->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																	->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																	->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->agents_performance_hourly, $isHotBallots);														  
					}
					$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->where('clusters.election_campaign_id',$currentCampaign)
																	->where('cities.sub_area_id',$entityID)
																	->where('cities.deleted',0)
																	->get();
																	
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")
										->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$sumsObject = $sumsObject = $sumsObject->whereRaw("clusters.id in (select cluster_id from ballot_boxes where ballot_boxes.$fieldName $operation 1)");
					}
					$sumsObject = $sumsObject->where('cities.sub_area_id',$entityID)
										->where('cities.deleted',0)
										->where('clusters.election_campaign_id',$currentCampaign)
										->first();
					$returnedObj->all_votes_count_today = Votes::where('votes.election_campaign_id',$currentCampaign)
																->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																})
																->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->all_votes_count_today, $isHotBallots);														  
					}
																
																
																
					$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today->where('clusters.election_campaign_id',$currentCampaign)
																->where('cities.sub_area_id',$entityID)
																->where('cities.deleted',0)
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																					$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																							->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																					})
																			->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																			->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																			->join('cities','cities.id','=','clusters.city_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->activists_reports_count_last_hour, $isHotBallots);														  
					}
																			
																			
					$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->where('clusters.election_campaign_id',$currentCampaign)
																			->where('cities.sub_area_id',$entityID)
																			->where('cities.deleted',0)
																			->count();
					break;
				//!! ToDo GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP - (maybe not needed...)

				case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
					$returnedObj->agents_performance_hourly = Votes::selectRaw("hour(votes.created_at) as hr , CONCAT(hour(votes.created_at) , ':00') as label , count(*) as value")
																	->where('votes.election_campaign_id' , $currentCampaign)
																	->whereRaw(" not (reporting_voter_id is NULL)")
																	->groupBy("hr")
																	->orderBy("hr","DESC")
																	->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																	})
																	->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																	->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																	->join('cities','cities.id','=','clusters.city_id')
																	->join('areas','areas.id','=','cities.area_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->agents_performance_hourly, $isHotBallots);														  
					}
					$returnedObj->agents_performance_hourly = $returnedObj->agents_performance_hourly->where('clusters.election_campaign_id',$currentCampaign)
																	->where('areas.id',$entityID)
																	->where('cities.deleted',0)
																	->where('areas.deleted',0)->get()
																	;
					$sumsObject = Cluster::selectRaw("sum(reporting_ballot_reported_votes_count) as total_reported_votes  ")
										->join('cities','cities.id','=','clusters.city_id')
										->join('areas','areas.id','=','cities.area_id');
										
				    if($isHotBallots){
						$sumsObject = $sumsObject = $sumsObject->whereRaw("clusters.id in (select cluster_id from ballot_boxes where ballot_boxes.hot=1)");
					}
					$sumsObject = $sumsObject->where('areas.id',$entityID)
										->where('cities.deleted',0)
										->where('areas.deleted',0)
										->where('clusters.election_campaign_id',$currentCampaign)
										->first();
					$returnedObj->all_votes_count_today = Votes::where('votes.election_campaign_id',$currentCampaign)
																->join('voters_in_election_campaigns',function($joinOn){
																	$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																		   ->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																})
																->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																->join('cities','cities.id','=','clusters.city_id')
																->join('areas','areas.id','=','cities.area_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->all_votes_count_today, $isHotBallots);														  
					}
																
																
					$returnedObj->all_votes_count_today = $returnedObj->all_votes_count_today->where('clusters.election_campaign_id',$currentCampaign)
																->where('areas.id',$entityID)
																->where('cities.deleted',0)
																->where('areas.deleted',0)
																->count();
					$returnedObj->activists_reports_count_last_hour = Votes::whereRaw("votes.election_campaign_id=".$currentCampaign." and TIMESTAMPDIFF(MINUTE, votes.created_at , now() ) <= 60")
																			->join('voters_in_election_campaigns',function($joinOn){
																					$joinOn->on('voters_in_election_campaigns.voter_id','=','votes.voter_id')
																							->on('voters_in_election_campaigns.election_campaign_id','=','votes.election_campaign_id');
																					})
																			->join('ballot_boxes' , 'ballot_boxes.id','=' ,'voters_in_election_campaigns.ballot_box_id' )
																			->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
																			->join('cities','cities.id','=','clusters.city_id')
																			->join('areas','areas.id','=','cities.area_id');
					if($isHotBallots){
						$this->addHotToQuery($returnedObj->activists_reports_count_last_hour, $isHotBallots);														  
					}
																			
																			
					$returnedObj->activists_reports_count_last_hour = $returnedObj->activists_reports_count_last_hour->where('clusters.election_campaign_id',$currentCampaign)
																			->where('areas.id',$entityID)
																			->where('cities.deleted',0)
																			->where('areas.deleted',0)
																			->count();
					break;
			}
		}
	    if($sumsObject){
					$returnedObj->activists_reports_count_today = ($sumsObject->total_reported_votes ? $sumsObject->total_reported_votes : 0 );
					
		}
		
        
		///////////////////////////////////////////////////////////////
		
		
		$returnedObj->wrong_phones = ElectionDayReportingWrongMessages::where('deleted',0)->whereNotNull('phone_number')
																		  ->where('phone_number' , '<>' , '')
																		  ->whereNull('election_role_by_voter_id')
																		  ->where('election_campaign_id' , $currentCampaign)
																		  ->count();
		$addedJoinTable = false;
		$returnedObj->wrong_ballots = ElectionDayReportingWrongMessages::join('election_roles_by_voters','election_roles_by_voters.id','=','election_day_reporting_wrong_messages.election_role_by_voter_id');
		if($isHotBallots){
				$addedJoinTable = true;
				$returnedObj->wrong_ballots = $returnedObj->wrong_ballots->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																			  ->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($returnedObj->wrong_ballots, $isHotBallots);														  

		}
		$returnedObj->wrong_ballots = $returnedObj->wrong_ballots->where('election_day_reporting_wrong_messages.deleted',0)->whereNotNull('election_day_reporting_wrong_messages.election_role_by_voter_id')
																		  ->where('election_day_reporting_wrong_messages.election_campaign_id' , $currentCampaign)
																		  // ->groupBy('election_day_reporting_wrong_messages.phone_number') 
																		  // ->groupBy('election_day_reporting_wrong_messages.election_role_by_voter_id')
																		   ->groupBy('election_roles_by_voters.voter_id')
																		  ;
																		   
		if($entityID > 0){
				if(!$addedJoinTable){
					$returnedObj->wrong_ballots = $returnedObj->wrong_ballots->join('election_role_by_voter_geographic_areas','election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=' , 'election_roles_by_voters.id');
				}
				$returnedObj->wrong_ballots  = $this->addGeoEntitiesToQuery($returnedObj->wrong_ballots  , $entityType , $entityID) ; //$globalConditionalCounter->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
		}
		$returnedObj->wrong_ballots = $returnedObj->wrong_ballots->get()->count();
		////////////////////////////////////////////////////	
		$returnedObj->missed_activists_first_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->missed_activists_first_shift  = $returnedObj->missed_activists_first_shift ->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name', config('constants.activists.role_shifts.FIRST'))
																		->whereNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////
		
		$returnedObj->missed_activists_second_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->missed_activists_second_shift = $returnedObj->missed_activists_second_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.SECOND'),
																			config('constants.activists.role_shifts.SECOND_AND_COUNT')])
																		->whereNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);

		////////////////////////////////////////////////////
		
		
		$returnedObj->missed_activists_allday_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->missed_activists_allday_shift = $returnedObj->missed_activists_allday_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.ALL_DAY'),
																			config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')])
																		->whereNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);

		////////////////////////////////////////////////////

		$returnedObj->missed_activists_count_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->missed_activists_count_shift = $returnedObj->missed_activists_count_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name', config('constants.activists.role_shifts.COUNT'))
																		->whereNull('arrival_date')
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////
		
		$returnedObj->unverified_activists_first_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->unverified_activists_first_shift = $returnedObj->unverified_activists_first_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name', config('constants.activists.role_shifts.FIRST'))
																		->where('verified_status' , '<>' , config('constants.activists.verified_status.VERIFIED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		
		////////////////////////////////////////////////////
		
		$returnedObj->unverified_activists_second_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->unverified_activists_second_shift = $returnedObj->unverified_activists_second_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.SECOND'),
																			config('constants.activists.role_shifts.SECOND_AND_COUNT')])
																		->where('verified_status' , '<>' , config('constants.activists.verified_status.VERIFIED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////
		
		
		$returnedObj->unverified_activists_allday_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->unverified_activists_allday_shift = $returnedObj->unverified_activists_allday_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.ALL_DAY'),
																			config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')])
																		->where('verified_status' , '<>' , config('constants.activists.verified_status.VERIFIED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////

		$returnedObj->unverified_activists_count_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

		$returnedObj->unverified_activists_count_shift = $returnedObj->unverified_activists_count_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name',
																			config('constants.activists.role_shifts.COUNT'))
																		->where('verified_status' , '<>' , config('constants.activists.verified_status.VERIFIED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		
		////////////////////////////////////////////////////
		
		$returnedObj->refused_activists_first_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');
																		

		$returnedObj->refused_activists_first_shift = $returnedObj->refused_activists_first_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name', config('constants.activists.role_shifts.FIRST'))
																		->where('verified_status'   , config('constants.activists.verified_status.REFUSED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		
		////////////////////////////////////////////////////
		
		$returnedObj->refused_activists_second_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');
																		
	
		$returnedObj->refused_activists_second_shift = $returnedObj->refused_activists_second_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.SECOND'),
																			config('constants.activists.role_shifts.SECOND_AND_COUNT')])
																		->where('verified_status'  , config('constants.activists.verified_status.REFUSED'))
																		 ->where('election_campaign_id' , $currentCampaign);

		////////////////////////////////////////////////////
		
		
		$returnedObj->refused_activists_allday_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

																	    
																		
		$returnedObj->refused_activists_allday_shift = $returnedObj->refused_activists_allday_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereIn('election_role_shifts.system_name', [
																			config('constants.activists.role_shifts.ALL_DAY'),
																			config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')])
																		->where('verified_status'   , config('constants.activists.verified_status.REFUSED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////

		$returnedObj->refused_activists_count_shift =  ElectionRolesByVoters::join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->join('election_role_shifts' , 'election_role_shifts.id' , '=' ,'election_role_by_voter_geographic_areas.election_role_shift_id')
																		->join('election_roles','election_roles.id' , '=','election_roles_by_voters.election_role_id');

																	    
																		
		$returnedObj->refused_activists_count_shift = $returnedObj->refused_activists_count_shift->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('election_role_shifts.system_name',
																			config('constants.activists.role_shifts.COUNT'))
																		->where('verified_status'   , config('constants.activists.verified_status.REFUSED'))
																		 ->where('election_campaign_id' , $currentCampaign);
		////////////////////////////////////////////////////
		
		$queriesNames = [
			'missed_activists_first_shift', 'missed_activists_second_shift', 'missed_activists_allday_shift', 'refused_activists_count_shift',
			'refused_activists_allday_shift', 'refused_activists_second_shift', 'refused_activists_first_shift', 'unverified_activists_count_shift',
			'unverified_activists_allday_shift', 'unverified_activists_second_shift', 'unverified_activists_first_shift', 'missed_activists_count_shift',
		];
		if($isHotBallots){
			foreach($queriesNames as $item){
				$returnedObj->$item = $returnedObj->$item->join('ballot_boxes','ballot_boxes.id','=','election_role_by_voter_geographic_areas.entity_id');
				$this->addHotToQuery($returnedObj->$item, $isHotBallots);
			}
		}

		foreach($queriesNames as $item){
			if($entityID > 0){
				$returnedObj->$item = $this->addGeoEntitiesToQuery($returnedObj->$item , $entityType , $entityID) ;
			}	
			$returnedObj->$item = $returnedObj->$item->count();
		}

		$jsonOutput->setData($returnedObj);
		$executionEndTime = microtime(true);
		$seconds = $executionEndTime - $executionStartTime;
		//echo "This script took $seconds to execute.";
		
		$time_end = microtime(true);

		//dividing with 60 will give the execution time in minutes otherwise seconds
		$execution_time = ($time_end - $time_start);

		//execution time of the script
		//echo '<b>Total Execution Time:</b> '.$execution_time.' Seconds';
	}	
	
	/*
		Returns all enrolled activists , possible to filter by geo filters and other params
	*/
	public function getEnrolledActivists(Request $request){
		 
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null) ;

		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$neededElectionsRoles = $this->getRelevantElectionRoles();

		$currentPage = $request->input('current_page', 1);
		$limit = 10; //number of items per page
        $skip = ($currentPage - 1) * $limit;
		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		$entityType = $request->input("entity_type");
		$entityKey = $request->input("entity_key");
		$entityID = null;
		if($entityType != null && $entityKey != null){
			 $entityID = $this->getEntityIDByTypeAndKey($entityType , $entityKey);
			 if($entityID  == -1){
				 $jsonOutput->setErrorCode(config('errors.system.ENTITY_DOESNT_EXISTS'));
				 return;
			 }
		}
		$baseQuery =  ElectionRolesByVoters::selectRaw("election_roles_by_voters.voter_id,
							election_roles.system_name as election_role_system_name,
							phone_number,
							sum(election_role_by_voter_geographic_areas.sum) as sum,
							election_roles.name as election_role_name,
							election_role_shifts.name as role_shift_name,
							election_role_shifts.system_name as role_shift_system_name,
							verified_status ,first_name,
							last_name,
							personal_identity,
							election_role_id,
							election_role_shift_id as shift_id,
							arrival_date,
							correct_reporting,
							cities.name as ballot_city_name,
							ballot_boxes.mi_id,
							voters.key as voter_key,
							election_roles_by_voters.key as election_role_key")
												->selectRaw("(select max(vote_sources.system_name)  from vote_sources where vote_sources.id=election_role_by_voter_geographic_areas.vote_source_id) as vote_source_name")
												->selectRaw("IF((election_role_by_voter_geographic_areas.correct_reporting=0 and not(election_role_by_voter_geographic_areas.arrival_date is NULL)) , 1 , 0) as not_reporting")
																		->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
																		->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		->where('election_role_by_voter_geographic_areas.entity_type' , config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
																		->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
																		->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->join('election_role_shifts','election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
																		
																		->join('ballot_boxes' , 'ballot_boxes.id' , '=', 'election_role_by_voter_geographic_areas.entity_id')
																		->join('clusters' , 'clusters.id' , '=', 'ballot_boxes.cluster_id')
																		->where('clusters.election_campaign_id' , $currentCampaign)
																		->join('cities' , 'cities.id' , '=', 'clusters.city_id')
																		->join('voters' , 'voters.id','=','election_roles_by_voters.voter_id');
		if($isHotBallots){
			$this->addHotToQuery($baseQuery, $isHotBallots);														  
		}
		$baseQuery->where('cities.deleted' , 0)
																		//->leftJoin('vote_sources','vote_sources.id' , '=','election_role_by_voter_geographic_areas.vote_source_id')
																		 ->withCount(['reportingVotes' => function($query) use($currentCampaign){
																			 $query->where('election_campaign_id',$currentCampaign);
																		 }])
																		 ->with(['lastReportingVote' => function($query) use($currentCampaign){
																			 $query->select('created_at','reporting_voter_id')->where('election_campaign_id',$currentCampaign)
																					->orderBy('created_at','DESC')  ;
																		 }]);
		if($entityID > 0){
			 $baseQuery = $this->addGeoEntitiesToQuery($baseQuery , $entityType , $entityID);//$baseQuery->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
		}																 
		$arrData = new \stdClass;
		$arrData->activists_list = $baseQuery->groupBy(['election_roles_by_voters.voter_id' , 'election_role_id' , 'election_role_shift_id'])->get();
		$arrData->total_count = count($arrData->activists_list);
		$jsonOutput->setData($arrData);
	}

	/*
		Helpful private function that returns wrong lists - it's usefull for few functions
	*/
	private function getWrongActivistsListArrays($request , $isHotBallots){
		$jsonOutput = app()->make("JsonOutput");

		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		$returnedArray = new \stdClass;
		$returnedArray->wrong_phones = ElectionDayReportingWrongMessages::select('id','key' , 'phone_number' , 'message')
																		  ->where('deleted',0)->whereNotNull('phone_number')
																		  ->whereNull('election_role_by_voter_id')
																		  ->where('phone_number' , '<>' , '')
																		  ->where('election_campaign_id' , $currentCampaign)
																		  ->get();
		$returnedArray->wrong_ballots = ElectionDayReportingWrongMessages::selectRaw('election_day_reporting_wrong_messages.phone_number , election_day_reporting_wrong_messages.id,election_day_reporting_wrong_messages.key , election_day_reporting_wrong_messages.ballot_box_id, election_day_reporting_wrong_messages.message  , ballot_boxes.mi_id , COALESCE(  CONCAT(voters.first_name , " " , voters.last_name )) as activist_name ,  cities.name as ballot_box_city,election_day_reporting_wrong_messages.created_at')
																		  ->leftJoin('ballot_boxes', 'ballot_boxes.id' , '=' , 'election_day_reporting_wrong_messages.ballot_box_id' )
																		  ->leftJoin('clusters','clusters.id','=','ballot_boxes.cluster_id')
																		  ->leftJoin('cities','cities.id','=','clusters.city_id')
																		  ->leftJoin('election_roles_by_voters' , 'election_roles_by_voters.id' , '=' , 'election_day_reporting_wrong_messages.election_role_by_voter_id')
																		  ->leftJoin('voters','voters.id' , '=','election_roles_by_voters.voter_id');
		$this->addHotToQuery($returnedArray->wrong_ballots, $isHotBallots);														  

		$returnedArray->wrong_ballots = $returnedArray->wrong_ballots->where('election_day_reporting_wrong_messages.deleted',0)
																		  ->whereNotNull('election_day_reporting_wrong_messages.election_role_by_voter_id')
																		  ->where('election_day_reporting_wrong_messages.election_campaign_id' , $currentCampaign)
																		  ->where(function($query) use($currentCampaign){$query->whereNull('election_roles_by_voters.election_campaign_id')->orWhere('election_roles_by_voters.election_campaign_id' , $currentCampaign);})
																		  ->where(function($query) use($currentCampaign){$query->whereNull('clusters.election_campaign_id')->orWhere('clusters.election_campaign_id' , $currentCampaign);})
																		  ->where(function($query){$query->whereNull('cities.deleted')->orWhere('cities.deleted' , 0);})
																		  
																		  ;
																		
																		  
		$entityType = $request->input("entity_type");
		$entityKey = $request->input("entity_key");
		$entityID = null;
		if($entityType != null && $entityKey != null){
			 $entityID = $this->getEntityIDByTypeAndKey($entityType , $entityKey);
			 if($entityID  == -1){
				 $jsonOutput->setErrorCode(config('errors.system.ENTITY_DOESNT_EXISTS'));
				 return;
			 }
		}
		
		if($entityID > 0){
				$returnedArray->wrong_ballots =$returnedArray->wrong_ballots 
														//->join('election_roles_by_voters','election_roles_by_voters.id','=','election_day_reporting_wrong_messages.election_role_by_voter_id')
														->join('election_role_by_voter_geographic_areas','election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=' , 'election_roles_by_voters.id')
														;
				$returnedArray->wrong_ballots   = $this->addGeoEntitiesToQuery($returnedArray->wrong_ballots   , $entityType , $entityID) ; //$globalConditionalCounter->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
		}
		$returnedArray->wrong_ballots = $returnedArray->wrong_ballots
	//	->groupBy('election_day_reporting_wrong_messages.phone_number')
		//->groupBy('election_day_reporting_wrong_messages.election_role_by_voter_id')
		->orderBy('election_day_reporting_wrong_messages.phone_number')->get();
 
		return $returnedArray;
	}
	
	
	/*
		Returns 2 lists of wrong activists - wrong phone numbers and wrong ballot boxes
	*/
	public function getWrongActivists(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null);

		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$jsonOutput->setData($this->getWrongActivistsListArrays($request,$isHotBallots));
	}
    
	/*
		Private helpful function that returns array of missed activists , and it's used in few places
	*/
	private function getMissedActivistsArrayList($request , $isHotBallots){
		$jsonOutput = app()->make("JsonOutput");

		$neededElectionsRoles = $this->getRelevantElectionRoles();
		
		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
	 
		$entityType = $request->input("entity_type");
		$entityKey = $request->input("entity_key");
		$entityID = null;
		if($entityType != null && $entityKey != null){
			 $entityID = $this->getEntityIDByTypeAndKey($entityType , $entityKey);
			 if($entityID  == -1){
				 $jsonOutput->setErrorCode(config('errors.system.ENTITY_DOESNT_EXISTS'));
				 return;
			 }
		}
		$baseQuery = ElectionRolesByVoters::selectRaw("election_role_by_voter_geographic_areas.id,
									election_role_by_voter_geographic_areas.key as role_shift_key,
									election_roles.system_name as election_role_system_name,
									election_roles_by_voters.key as election_roles_by_voter_key,
									election_role_shift_id,
									election_role_id,
									election_role_by_voter_id,
									election_roles.name as election_role_name,
									election_role_shifts.name as role_shift_name,
									election_role_shifts.system_name as role_shift_system_name,
									election_roles_by_voters.voter_id,
									phone_number,
									sum(election_role_by_voter_geographic_areas.sum) as sum,
									verified_status,
									activist.first_name,
									activist.last_name,
									activist.personal_identity,
									election_role_id,
									CONCAT(voter_create.first_name , ' ' , voter_create.last_name) as creating_user_full_name,
									cities.name as ballot_city_name,
									ballot_boxes.mi_id,
									voters.key as voter_key,
									election_roles.key as election_role_key")
									->leftJoin('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
									->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
									->join('election_role_shifts','election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
									->join('voters as activist' , 'activist.id','=','election_roles_by_voters.voter_id')
									->join('ballot_boxes' , 'ballot_boxes.id' , '=', 'election_role_by_voter_geographic_areas.entity_id')
									->join('clusters' , 'clusters.id' , '=', 'ballot_boxes.cluster_id')
									->join('cities' , 'cities.id' , '=', 'clusters.city_id')
									->join('voters' , 'voters.id' , '=', 'election_roles_by_voters.voter_id');

		$this->addHotToQuery($baseQuery, $isHotBallots);														  

		$baseQuery = $baseQuery->whereIn('election_roles.system_name',$neededElectionsRoles)
																		 ->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		 ->where('clusters.election_campaign_id' , $currentCampaign)
																		 ->where('cities.deleted' , 0)
																		->withUserCreate()
																		->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->whereNull('arrival_date')
																		->withCount(['messages' => function($query){$query->where('deleted',0)->where('direction' , config('constants.activists.messageDirections.OUT'));}])
																		->with(['lastMessage' => function($query){$query->select('election_role_by_voter_id','created_at')->where('deleted',0)->where('direction' , config('constants.activists.messageDirections.OUT'))->orderBy('created_at' , 'DESC');}])
																		 ;
		if($entityID > 0){
			 $baseQuery =  $this->addGeoEntitiesToQuery($baseQuery , $entityType , $entityID);//$baseQuery->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
		}
		$baseQuery =  $baseQuery->groupBy(['election_roles_by_voters.voter_id' , 'election_role_id' , 'election_role_shift_id'])->get();
		//echo sizeof($baseQuery );
		$arrData = new \stdClass;
		$arrData->activists_list = $baseQuery;
		$arrData->total_count = count($arrData->activists_list);
	    return $arrData;		
	}
	
	/*
		Handles deleting role shift by role shift key
	*/
	public function deleteMissedActivist(Request $request , $roleShiftKey){
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		ElectionRolesGeographical::where('key' ,$roleShiftKey )->delete();
		$arrData = $this->getMissedActivistsArrayList($request,$isHotBallots);
		$jsonOutput->setData($arrData);
	}
	
	/*
		Returns all missing activists , possible to filter by geo filters and other params
	*/
	public function getMissedActivists(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null);

		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$arrData = $this->getMissedActivistsArrayList($request,$isHotBallots);
		$jsonOutput->setData($arrData);
	}
	
	/*
		Function that does 2 types of deleting - by param sent - or delete role shift by key , or delete all refused role shifts
	*/
	public function generalDeleteUnverifiedActivists(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$isHotBallots = $request->input("hot_ballots", null);

		$neededElectionsRoles = $this->getRelevantElectionRoles();

		$electionRoles = ElectionRoles::select('id')->where('deleted',0)->whereIn('system_name' , $neededElectionsRoles )->get();
		$electionRolesIDSArray = [];
		for($i = 0 ; $i < count($electionRoles); $i++){
			array_push($electionRolesIDSArray , $electionRoles[$i]->id);
		}
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		if($request->input("delete_type") == 'all_refused'){ // delete all refused activists
			//ElectionRolesByVoters::whereIn('election_role_id' , $electionRolesIDSArray )->where('verified_status',config('constants.activists.verified_status.REFUSED'))->delete();
			ElectionRolesGeographical::whereIn('key' ,json_decode($request->input("role_shift_keys_to_delete") , false) )->delete();
		}
		elseif($request->input("delete_type") == 'row'){ // delete specific row
		
			ElectionRolesGeographical::where('key' ,$request->input("row_key") )->delete();
		}
		$arrData = $this->getUnverifiedActivistsArrayList($request,$isHotBallots);
		$jsonOutput->setData($arrData);
	}
	
	/*
		Helpful function that returns all needed lists of unverified voters
	*/
	private function getUnverifiedActivistsArrayList($request,$isHotBallots){
		$jsonOutput = app()->make("JsonOutput");

		$neededElectionsRoles = $this->getRelevantElectionRoles();
		
		$currentCampaign =  ElectionCampaigns::currentCampaign()['id'];
		$entityType = $request->input("entity_type");
		$entityKey = $request->input("entity_key");
		//echo $entityType."---".$entityKey."$$$";
		$entityID = null;
		if($entityType != null && $entityKey != null){
			
			 $entityID = $this->getEntityIDByTypeAndKey($entityType , $entityKey);
			 if($entityID  == -1){
				 $jsonOutput->setErrorCode(config('errors.system.ENTITY_DOESNT_EXISTS'));
				 return;
			 }
		}
		$baseQuery = ElectionRolesByVoters::selectRaw("election_role_by_voter_geographic_areas.id,
									election_role_by_voter_geographic_areas.election_role_shift_id,
									election_roles.system_name as election_role_system_name,
									election_role_by_voter_geographic_areas.key as role_shift_key,
									election_roles_by_voters.voter_id,
									election_roles_by_voters.key as election_roles_by_voter_key,
									election_roles.name as election_role_name,
									election_role_id , election_role_shift_id,
									election_role_shifts.name as role_shift_name,
									election_role_shifts.system_name as role_shift_system_name,
									phone_number,
									sum(election_role_by_voter_geographic_areas.sum) as sum,
									verified_status,
									activist.first_name,
									activist.last_name,
									activist.personal_identity,
									election_role_id,
									CONCAT(voter_create.first_name , ' ' , voter_create.last_name) as creating_user_full_name,
									cities.name as ballot_city_name,
									ballot_boxes.mi_id,
									voters.key as voter_key,
									election_roles.key as election_role_key")
									->join('election_role_by_voter_geographic_areas' , 'election_role_by_voter_geographic_areas.election_role_by_voter_id' , '=', 'election_roles_by_voters.id')
									->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
									->join('election_role_shifts','election_role_shifts.id','=','election_role_by_voter_geographic_areas.election_role_shift_id')
									->join('voters as activist' , 'activist.id','=','election_roles_by_voters.voter_id')
									->join('ballot_boxes' , 'ballot_boxes.id' , '=', 'election_role_by_voter_geographic_areas.entity_id')
									->join('clusters' , 'clusters.id' , '=', 'ballot_boxes.cluster_id')
									->join('cities' , 'cities.id' , '=', 'clusters.city_id')
									->join('voters' , 'voters.id' , '=', 'election_roles_by_voters.voter_id');

		$this->addHotToQuery($baseQuery, $isHotBallots);														  
		
		$baseQuery = $baseQuery->whereIn('election_roles.system_name',$neededElectionsRoles)
																		 ->where('election_roles_by_voters.election_campaign_id' , $currentCampaign)
																		 ->where('clusters.election_campaign_id' , $currentCampaign)
																		 ->where('cities.deleted' , 0)
																		->withUserCreate()
																		->whereIn('election_roles.system_name',$neededElectionsRoles)
																		->where('verified_status' , '<>' , config('constants.activists.verified_status.VERIFIED'))
																		 ->withCount(['messages' => function($query){$query->where('deleted',0)->where('direction' , config('constants.activists.messageDirections.OUT'))->orderBy('created_at' , 'DESC');}])
																		 ->with(['lastMessage' => function($query){$query->where('deleted',0)->where('direction' , config('constants.activists.messageDirections.OUT'))->orderBy('created_at' , 'DESC');}])
																		;
																		
		if($entityID > 0){
			 $baseQuery =  $this->addGeoEntitiesToQuery($baseQuery , $entityType , $entityID);//$baseQuery->where('election_role_by_voter_geographic_areas.entity_id' , $entityID)->where('entity_type' , $entityType);
		}	
		//echo sizeof($baseQuery->get());
		$arrData = new \stdClass;
		$arrData->activists_list = $baseQuery->groupBy(['election_roles_by_voters.voter_id' , 'election_role_id' , 'election_role_shift_id'])->get();
		$arrData->total_count = count($arrData->activists_list);
		return $arrData;
	}
	
	/*
		Returns all unverified activists , possible to filter by geo filters and other params
	*/
	public function getUnverifiedActivists(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null);

		//change read DB to salve
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$arrData = $this->getUnverifiedActivistsArrayList($request,$isHotBallots);
		$jsonOutput->setData($arrData);
	}

	/*
		Wrong records screen - removes row by its key
	*/
	public function removeWrongRow(Request $request , $key){
		
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots", null);

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		ElectionDayReportingWrongMessages::where('election_campaign_id',$currentCampaign)->where('key',$key)->update(['deleted'=>1]);
		$updatedLists =  $this->getWrongActivistsListArrays($request,$isHotBallots);
		$jsonOutput->setData($updatedLists);
	}
	
	/*
		Wrong records screen - fixes ballot box of row by its key
	*/
	public function fixWrongRow(Request $request , $key){
		$jsonOutput = app()->make("JsonOutput");
		$isHotBallots = $request->input("hot_ballots");

		if(!GlobalController::isActionPermitted('elections.votes.dashboard')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$wrongRow = ElectionDayReportingWrongMessages::where('key' , $key)->where('deleted',0)->first();
		if(!$wrongRow){
			$jsonOutput->setErrorCode(config('errors.system.ROW_DOESNT_EXIST'));
            return;
		}
		$ballotID = $wrongRow->ballot_box_id;
		//ElectionRolesGeographical::where('election_role_by_voter_id' , $wrongRow->election_role_by_voter_id)->update(['entity_id'=>$ballotID , 'entity_type'=>config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')]);
		ElectionDayReportingWrongMessages::where('election_campaign_id',$currentCampaign)->where('key',$key)->update(['deleted'=>1]);
		$updatedLists =  $this->getWrongActivistsListArrays($request,$isHotBallots);
		$jsonOutput->setData($updatedLists);
	}

	public static function downloadExcelFileByEntityGeo(Request $request,$entity_type,$entity_key){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);
		try {
			$currentElection=ElectionCampaigns::currentCampaign();
			MunicipalArrivedActivistBallotService::getCSVByDetailsAllShiftTypeByGeo($currentElection->id,$entity_type,[$entity_key]);
			//$jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
	}

	public static function downloadExcelFileByEntityGeoGroupBallot(Request $request,$entity_type,$entity_key){
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);
		try {
			$currentElection=ElectionCampaigns::currentCampaign();
			MunicipalArrivedActivistBallotService::downloadCsvDetailsBallotBoxActivistByGeo($entity_type,[$entity_key]);
			
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
	}
		
	
	/*
		Destructor function
	*/
	function __destruct() {
		 $this->entitiesIDSArrays = null;
	}
	private function getRelevantElectionRoles(){
		$neededElectionsRoles = [
			config('constants.activists.election_role_system_names.ballotMember'),
			config('constants.activists.election_role_system_names.observer'),
			config('constants.activists.election_role_system_names.counter'),
		];
		return $neededElectionsRoles;
	}
	private function addHotToQuery($query, $isHotBallots, $ballotsTableElias = 'ballot_boxes'){

		switch($isHotBallots){
			case 1: 
				$fieldName ='disregard';
				$operation = '!=';
				break;
			case 2: 
				$fieldName ='hot';
				$operation = '=';
				break;
			default:
			return $query;
		}
		$query->where($ballotsTableElias. '.'. $fieldName, $operation, 1);
		return $query;
	}
}
