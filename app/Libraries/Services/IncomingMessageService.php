<?php

namespace App\Libraries\Services;

use App\Http\Controllers\ActionController;

use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRolesByVotersMessages;
use App\Models\ElectionDayReportingWrongMessage;
use App\Models\VoterElectionCampaigns;
use App\Models\Votes;
use App\Models\Voters;
use App\Models\VoteSources;
use App\Models\VoterPhone;
use App\Models\BallotBox;
use App\Libraries\Helper;
use App\API\Sms\Sms;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;
use App\Libraries\Services\activists\ActivistsMessagesService;
use App\Libraries\Services\activists\MessagesService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;
class IncomingMessageService {

    const TYPE_ROLE = 1;
    const TYPE_BALLOT	 = 2;
    const TYPE_VOTE = 3;
	
	public static function activistsIncomingSms($message, $realSource, $incomingSms){

        $notWantSmsList= ['הסר', 'הסרה'];
        if(in_array($message, $notWantSmsList)){
			$unrecognizedMessage = false;
            self::removeVoterFromSms($realSource, $incomingSms->id);
        }
		
        $currentCampaign = ElectionCampaigns::currentCampaign();
		
        // 1. Load all activist roles by phone number.
        $activists = ElectionRolesByVoters::select('election_roles_by_voters.id', 'verified_status', 'election_roles.system_name as election_role_name' , 'phone_number')
		->withElectionRole(false)
		->with(['activistsAllocationsAssignments' => function($query) {
			$query->select('activists_allocations_assignments.id', 'activists_allocations_assignments.election_role_by_voter_id'
			)->withActivistAllocation()->whereNotNull('activists_allocations.ballot_box_id');           
		}])
		// !! to delete old method 
		// ->with(['electionRolesGeographical' => function($query) {
			//     $query->select('election_role_by_voter_geographic_areas.id', 
			//         'election_role_by_voter_geographic_areas.election_role_by_voter_id'
			//     )->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));           
			// }])
		->where('election_campaign_id', $currentCampaign->id)
		->where('phone_number', $realSource)
		->get();
								
		//check and update activist verification status & add message
		$ivrMsg = null;
		$verifiedStatus = self::activistsVerification($realSource, $message, $currentCampaign, $activists, 'sms' , $ivrMsg , $unrecognizedMessage);
		
		$hasBallot = false; 

        //save activists message
        foreach($activists as $activist) {
            //check if activist has ballot for election day reporting
            if (count($activist->activistsAllocationsAssignments) > 0 && !$hasBallot) $hasBallot = true;
            self::saveActivistMessage($activist->id, 
                                $realSource, 
                                $message, 
                                config('constants.MESSAGE_DIRECTION_IN'), 
                                $incomingSms->id, 
                                null, 
                                $verifiedStatus);
        }
		 
        if ($verifiedStatus == config('constants.activists.verified_status.MORE_INFO')) {
            //check election day reporting arrived
            $ifValidVoteTime = ElectionCampaigns::checkIfElectionDayArrival(true, false, $currentCampaign);

            if ($ifValidVoteTime && ($hasBallot)) {
				$unrecognizedMessage = false;
				$ivrRef = null;
                self::electionDayReporting($realSource, $message, $currentCampaign, $activists , null,$ivrRef,$unrecognizedMessage);
				 
			}
        }

        if($unrecognizedMessage){ // unrecognized message
            $phoneNumber = $realSource;
            $garbageMessageSMSText = config('constants.activists.garbageMessageSMSText');

            $smsSendCode1 = (Sms::connection('telemarketing')->send($phoneNumber, $garbageMessageSMSText)) ? true : false;
            if($smsSendCode1){
                foreach($activists as $activist) {
                    self::saveSmsMessage($activist->id, $activist->election_role_name, $garbageMessageSMSText, $phoneNumber);
                }
            }
		}
    }
	/**
	 * Check and update activist verification & add message
	 *
	 * @param string $phoneNumber
	 * @param string $message
	 * @param \Illuminate\Database\Eloquent\Model $currentCampaign
	 * @return void
	 */
	public static function activistsVerification($phoneNumber, $message, $currentCampaign, $activists, $reportingSource, &$responseIvrMessage = null , &$unrecognizedMessage=null) {
		$cleanMessage = trim($message);
 
		$messageAccept = null;
		$messageDeny = null;
		switch ($reportingSource) {
			case 'sms':
				$messageAccept = config('constants.activists.verificationMessage.ACCEPT');
				$messageDeny = config('constants.activists.verificationMessage.DENY');
				$messageInvertAccept = config('constants.activists.verificationMessage.ACCEPT_INVERT');
				$messageInvertDeny = config('constants.activists.verificationMessage.DENY_INVERT');
				break;

			case 'ivr':
				$messageAccept = $messageInvertAccept = config('constants.activists.verificationMessage.ACCEPT_IVR');
				$messageDeny = $messageInvertDeny = config('constants.activists.verificationMessage.DENY_IVR');				
		}
		$isRefused = false;
		//switch verified status
		switch ($cleanMessage) {
			case $messageAccept:
			case $messageInvertAccept:
				$verifiedStatus = config('constants.activists.verified_status.VERIFIED');
				$unrecognizedMessage = false;
				$verifiedMessageOk = true;
				break;

			case $messageDeny:
			case $messageInvertDeny:
				$verifiedStatus = config('constants.activists.verified_status.REFUSED');
				$unrecognizedMessage = false;
				$verifiedMessageOk = true;
				$isRefused = true;
				break;

			default:
				$verifiedStatus = config('constants.activists.verified_status.MORE_INFO');
				$verifiedMessageOk = false;
				break;
		}
		$responseIvrMessage = 'ok';
		//add activist message and update activist verified status if needed
		foreach($activists as $activist) {
			$electionRoleName = $activist->election_role_name;
			$isBallotRole = in_array($electionRoleName, config('constants.activists.ballot_elections_roles_names'));
			//echo $activist;
			if ($verifiedMessageOk) {
				if($isRefused && $isBallotRole){
						$geoRolesCnt = ActivistAllocationAssignment::where('election_role_by_voter_id' , $activist->id)->count();
						if( $geoRolesCnt > 0){
							$verificationDeleteShibutzSms = config('constants.activists.verificationDeleteShibutzSms');
							$verificationDeleteShibutzIvr = config('constants.activists.verificationDeleteShibutzIvr');
						
							$phoneNumber = $activist->phone_number;
							if($reportingSource == 'ivr') {
								$responseIvrMessage = $verificationDeleteShibutzIvr;
							}else{
								$smsSendCode1 = (Sms::connection('telemarketing')->send($phoneNumber, $verificationDeleteShibutzSms)) ? true : false;
								if($smsSendCode1){
									IncomingMessageService::saveSmsMessage($activist->id, $activist->election_role_name, $verificationDeleteShibutzSms, $phoneNumber);
								}
							}
						}
				} 
				// $ballot_elections_roles_names
				$isLoginRole = in_array($electionRoleName, config('constants.activists.muni_login_elections_roles_names'));
				if($reportingSource != 'ivr' &&  $isLoginRole  && $verifiedStatus == config('constants.activists.verified_status.VERIFIED')){
					$message = MessagesService::getApplicationLinkMsg($activist->election_role_name);
					$smsSendCode2 =Sms::connection('telemarketing')->send($phoneNumber, $message);
					if($smsSendCode2){
						IncomingMessageService::saveSmsMessage($activist->id, $activist->election_role_name, $message, $phoneNumber);
					}
				}

				$activist->verified_status = $verifiedStatus;
				$activist->save();
			} 

		}
		return $verifiedStatus;
	}

	/**
	 * @method electionDayReporting
	 * Election day votes reporting
	 * 1. Get activist allocations assignments
	 * 2. Check if activist is assign to ballot

	 */
	public static function electionDayReporting($phoneNumber, $message, $currentCampaign, $activists, $type=null, &$responseIvrMessage = null , &$unrecognizedMessage=null) {

		//Activist not coming to ballot - set "not_coming" on all geographic areas
		/*
		if ($type == IncomingMessageService::TYPE_BALLOT && $message == 3) {
			ElectionRolesGeographical::whereIn('election_role_by_voter_id', $activists)
						->update([
							'not_coming' => 1
						]);						
			return true;
		}
		*/
		// Get all activist is ballots assigned:
		$activistsBallotRoles = ElectionRolesGeographical::select(
									'election_role_by_voter_geographic_areas.id',
									'election_role_by_voter_geographic_areas.arrival_date',
									'election_role_by_voter_geographic_areas.correct_reporting',
									'election_role_by_voter_geographic_areas.current_reporting',
									'election_roles_by_voters.voter_id',
									'election_roles_by_voters.id as election_role_id',
									'ballot_boxes.id AS ballot_box_id',
									'ballot_boxes.mi_id AS ballot_box_mi_id',
									'ballot_boxes.reporting AS ballot_box_reporting',
									'election_roles.system_name as election_role_name',
									'cities.name as city_name',
									'cities.mi_id as city_mi_id',
									'cities.assign_leader_phone_number as assign_leader_phone_number',
									'streets.name as cluster_street_id_name',
									'clusters.street as cluster_street_name',
									'clusters.house as clusters_house_num',
									'voter_activist.first_name'
								)
								->withElectionRolesByVoters(false)
								->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
								->withBallotBoxes()
								->leftJoin('streets' , 'streets.id','=','clusters.street_id')
								->join('voters as voter_activist' , 'voter_activist.id' , '=' , 'election_roles_by_voters.voter_id')
								->where('election_roles_by_voters.election_campaign_id', $currentCampaign->id)
								->where('election_roles_by_voters.phone_number', $phoneNumber)
								->orderBy(DB::raw("FIELD(election_role_shifts.system_name,'all_day','first','second')"))
								->get();

		if(count($activistsBallotRoles) == 0){ // If not found ballots role for activist!
			$responseIvrMessage = 'BAD_BALLOT_BOX_NUMBER';
			return false;
		}
		$currentReportingBallotRole = NULL;

		foreach($activistsBallotRoles as $activistRole){ // check if activist is already report arraving
			if($activistRole->current_reporting){
				$currentReportingBallotRole = $activistRole;
			}
		}
		// Clean message 
		$trimmedMessage = trim(preg_replace('/(\x{200e}|\x{200f})/u', '', $message));

		//
		if(!$currentReportingBallotRole && $trimmedMessage == '0'){
			$BallotInfoMessage = config('constants.activists.BallotInfoMessage');
				$firstBallotRole = $activistsBallotRoles[0];
				$secondBallotRole = !empty($activistsBallotRoles[1]) ? $activistsBallotRoles[1] : null;
				if($secondBallotRole && $firstBallotRole->election_role_name == config('constants.activists.election_role_system_names.counter')){
					$currentBallotRole = $secondBallotRole;
				}else{
					$currentBallotRole = $firstBallotRole;
				}

				$miId = $currentBallotRole->ballot_box_mi_id;
				$miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);
				
				if(!is_null($type)) { // Ivr type
					$responseIvrMessage = 'MISSING_PARAMS';
					return false;
				}else{
					$fullAddress = "";
					if($currentBallotRole->cluster_street_id_name){
						$fullAddress = $currentBallotRole->cluster_street_id_name;
					}
					elseif($currentBallotRole->cluster_street_name){
						$fullAddress = $currentBallotRole->cluster_street_name;
					}
					if($fullAddress && $currentBallotRole->clusters_house_num){
						$fullAddress = $fullAddress." ".$currentBallotRole->clusters_house_num;
					}
					if($fullAddress){
						$BallotInfoMessage = str_replace("[cluster_street]" ,$fullAddress  , $BallotInfoMessage);
					}
					$BallotInfoMessage = str_replace("[mi_id]" ,$miId  , $BallotInfoMessage);
					$BallotInfoMessage = str_replace("[city_name]" ,$currentBallotRole->city_name  , $BallotInfoMessage);
					$unrecognizedMessage = false;
					// Sent response to the activist:
					$smsSendCode1 = (Sms::connection('telemarketing')->send($phoneNumber, $BallotInfoMessage)) ? true : false;
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($currentBallotRole->election_role_id, $currentBallotRole->election_role_name, $BallotInfoMessage, $phoneNumber);
					}
				}
			return;
		}
 
		if (is_null($type)) { //* from sms type
			 
			$emptyParam = null;
			if(!$currentReportingBallotRole){
				self::ballotVerification($phoneNumber, $message, $currentCampaign, $activists, $activistsBallotRoles, 'sms', $emptyParam ,$unrecognizedMessage);
			} else {
				// Clean sms message from chars:
				$votersSerialNumbers = str_replace(array(" ","\n", "\r", "/", "\\", "*", "#"), ",", $message);
				$votersSerialNumbers = explode(",", $votersSerialNumbers);
				if (count($votersSerialNumbers) > 0) {
					self::votesReporting($phoneNumber, $votersSerialNumbers, [], $currentCampaign, $activists, $currentReportingBallotRole, 'sms' , $message, $emptyParam, $currentReportingBallotRole);
				}
			}			
		} else { //* from ivr

			switch ($type) {
				case self::TYPE_BALLOT:
					return self::ballotVerification($phoneNumber, $message, $currentCampaign, $activists, $activistsBallotRoles, 'ivr', $responseIvrMessage , $unrecognizedMessage);
					break;
				case self::TYPE_VOTE:
					if(!$currentReportingBallotRole){ // If activist doesn't do the ballot Verification.
						$responseIvrMessage = 'ACTIVIST_MISSING_ARRAIVEAL_REPORTING';
						return false;
					}
					$deleteVotesSent = (strpos($message, 'del:') === 0);
					$votersDeleteSerialNumbers = [];
					if(!$deleteVotesSent){ //Only new votes for voters serial numbers
						$votersVotesMessage = $message;
					} else { // If need also delete votes
						$messageArray = explode(':', $message);
						$votersDeleteVotesMessage = $messageArray[1];
						$votersVotesMessage = $messageArray[2];

						$votersDeleteSerialNumbers = str_replace([' ', '*'], ['',','], $votersDeleteVotesMessage);
						$votersDeleteSerialNumbers = explode(",", $votersDeleteSerialNumbers);
					}
					$votersSerialNumbers = str_replace([' ', '*'], ['',','], $votersVotesMessage);
					$votersSerialNumbers = explode(",", $votersSerialNumbers);

					return self::votesReporting($phoneNumber, $votersSerialNumbers, $votersDeleteSerialNumbers, $currentCampaign, $activists, $currentReportingBallotRole, 'ivr', $message, $responseIvrMessage);
					break;		
			}
		}
		
	}
	/**
	 * Verify activist ballot coming
	 * 1. Check if the activist send a valid 
	 * - personal identity of one of the voters in ballot
	 * 2. -> If not exists -> send wrong number message.
	 * 	  -> If exists - Mark the activist as:
	 * 	a. current_reporting.
	 * 	b. Arrival date
	 * 3. Mark all other activists in ballot as  no current reporting.
	 *  
	 * 
	*/
	public static function ballotVerification($phoneNumber, $message, $currentCampaign, $activists, $activistsBallotRoles, $sourceSystemName, &$responseIvrMessage , &$unrecognizedMessage) 
	{
		//list of activist roles
		$firstBallotRole = $activistsBallotRoles[0];
		$roleBallotsIds = [];
		foreach($activistsBallotRoles as $ballotRole){
			$roleBallotsIds[]= $ballotRole->ballot_box_id;
		}

		$electionRoleSystemNames = [
			'ballot_member',
			'observer'
		];
		 
		$cityName = $firstBallotRole->city_name;
		$miId = $firstBallotRole->ballot_box_mi_id;
		$miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);

		if(!is_numeric($message) || strlen($message) > 10){
			
			$unrecognizedMessage = true;
			$responseIvrMessage = 'PERSONAL_IDENTITY_WORNG_FORMAT';
			return false;
		} 
		$returnWrongKalfiMessage = config('constants.activists.correctIdentityWrongKalfi');
		$returnWrongKalfiMessage = str_replace("[mi_id]" , $miId , $returnWrongKalfiMessage);
		$returnWrongKalfiMessage = str_replace("[city_name]" , $cityName , $returnWrongKalfiMessage);
		$returnWrongKalfiMessage = str_replace("[global_phone_number]" , $firstBallotRole->assign_leader_phone_number , $returnWrongKalfiMessage);

		$MESSAGES_SYSTEM_DEV_MODE = env('ACTIVISTS_MESSAGES_SYSTEM_DEV_MODE', false);
		 
		if($MESSAGES_SYSTEM_DEV_MODE){
			if($message != 123456789){
				if ($sourceSystemName == 'ivr') {
					$responseIvrMessage = [
						'error' => 'PERSONAL_IDENTITY_NOT_EXIST_IN_BLLOT',
						'data' => ['city' => $firstBallotRole->city_mi_id, 'city_name' => $cityName, 'ballot' => $miId]
					];
					return false;
				} else {
					$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnWrongKalfiMessage);	
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($firstBallotRole->election_role_id, $firstBallotRole->election_role_name, $returnWrongKalfiMessage, $phoneNumber);
					}
					return;
				}
			}
		} else {
			$personal_identity = ltrim($message, '0');
			$checkIdentity = Voters::select("id")->where("personal_identity",$personal_identity)->first();
			if(!$checkIdentity){
				
				$returnMessage = '';
				if ($sourceSystemName == 'ivr') {
					$responseIvrMessage = 'PERSONAL_IDENTITY_WORNG_FORMAT';
					return false;
				} else {
					$returnMessage = config('constants.activists.wrongIdentityNumberFormat');
					$returnMessage = str_replace("[personal_identity]" , $personal_identity , $returnMessage);
					$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnMessage);	
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($firstBallotRole->election_role_id, $firstBallotRole->election_role_name, $returnMessage, $phoneNumber);
					}	
				}
				return;
			}
			$checkFirstSerialNumberQuery = "SELECT voter_serial_number FROM voters_in_election_campaigns AS other_viec
				WHERE other_viec.election_campaign_id = $currentCampaign->id AND other_viec.ballot_box_id = voters_in_election_campaigns.ballot_box_id
				ORDER BY other_viec.voter_serial_number LIMIT 1 ";

			 $voterInElectionCampaign = VoterElectionCampaigns::select('voter_serial_number','ballot_box_id', DB::raw("($checkFirstSerialNumberQuery) as first_ballot_serial_number") )
																->where('voter_id',$checkIdentity->id)
																->where('election_campaign_id',$currentCampaign->id)
																->first();
			if($voterInElectionCampaign){
				if(in_array($voterInElectionCampaign->ballot_box_id, $roleBallotsIds)){ //Check if voter is exist in activist ballots
					foreach($activistsBallotRoles as $ballotRole){
						if($ballotRole->ballot_box_id == $voterInElectionCampaign->ballot_box_id){
							$currentBallotRole = $ballotRole;
						}
					}
				} else { // voter not exist in any of activist ballots
					$returnWrongKalfiMessageName = 'correctIdentityWrongKalfi';
					if($voterInElectionCampaign->voter_serial_number == $voterInElectionCampaign->first_ballot_serial_number){
						$returnWrongKalfiMessageName = 'correctFirstIdentityWrongKalfi';
					}
					$returnWrongKalfiMessage = config("constants.activists.$returnWrongKalfiMessageName");

					$returnWrongKalfiMessage = str_replace("[mi_id]" , $miId , $returnWrongKalfiMessage);
					$returnWrongKalfiMessage = str_replace("[city_name]" , $cityName , $returnWrongKalfiMessage);
					$returnWrongKalfiMessage = str_replace("[global_phone_number]" , $firstBallotRole->assign_leader_phone_number , $returnWrongKalfiMessage);
			
					$returnMessage = '';
					if ($sourceSystemName == 'ivr') {
						$responseIvrMessage = [
							'error' => 'PERSONAL_IDENTITY_NOT_EXIST_IN_BLLOT',
							'data' => ['city' => $firstBallotRole->city_mi_id, 'city_name' => $cityName, 'ballot' => $miId]
						];
						return false;
					} else {
						$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnWrongKalfiMessage);	
						if($smsSendCode1){
							IncomingMessageService::saveSmsMessage($firstBallotRole->election_role_id, $firstBallotRole->election_role_name, $returnWrongKalfiMessage, $phoneNumber);
						}
					}
					return;
				}
			}else{ // voter doesn't belong to any kalfi
				 
				$returnMessage = '';
				if ($sourceSystemName == 'ivr') { 
					$responseIvrMessage = 'PERSONAL_IDENTITY_WORNG_FORMAT';
					return false;
				}else {
					$returnMessage = config('constants.activists.wrongIdentityNumberFormat');
					$returnMessage = str_replace("[mi_id]" , $miId , $returnMessage);
					$returnMessage = str_replace("[city_name]" , $cityName , $returnMessage);
					$returnMessage = str_replace("[global_phone_number]" , $firstBallotRole->assign_leader_phone_number , $returnMessage);
					$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnMessage);	
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($firstBallotRole->election_role_id, $firstBallotRole->election_role_name, $returnMessage, $phoneNumber);
					}
				}
				return;
			}
		}

		//load activist ballot box
		$activistBallot = ActivistAllocationAssignment::select(
				'election_role_by_voter_geographic_areas.id',
				'election_role_by_voter_geographic_areas.vote_source_id',
				'election_role_by_voter_geographic_areas.arrival_date',
				'election_role_by_voter_geographic_areas.current_reporting',
				'ballot_boxes.id AS ballot_box_id',
				'election_roles_by_voters.voter_id as activist_voter_id'
			)
			->withElectionRolesByVoters(false)
			->withBallotBoxes()
			->join('voters_in_election_campaigns', function ( $joinOn ) {
				$joinOn->on([['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
					['voters_in_election_campaigns.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']]);
			})
			->where('election_roles_by_voters.election_campaign_id', $currentCampaign->id)
			->where('election_roles_by_voters.phone_number', $phoneNumber);
		if(!$MESSAGES_SYSTEM_DEV_MODE){
				$activistBallot->where('voters_in_election_campaigns.ballot_box_id', $voterInElectionCampaign->ballot_box_id);				
				$activistBallot = $activistBallot->first();
		}else {
			$currentBallotRole = $activistsBallotRoles[0];
		}
		$activistBallot = $activistBallot->first();
		//ballot box found
		if ($activistBallot) {

			//update arrival date if missing
			if (is_null($activistBallot->arrival_date)) {
				$activistBallot->arrival_date = Carbon::now();
			}
			//set ballot vote source  if missing
			if (is_null($activistBallot->vote_source_id)) {
				$voteSource = VoteSources::select('id')->where('system_name', $sourceSystemName)->first();

				$voteSourceId = ($voteSource != null)? $voteSource->id : 0;
				$activistBallot->vote_source_id = $voteSourceId;
			}

			//set ballot to reporting
			ElectionDayReportingWrongMessage::where('election_day_reporting_wrong_messages.election_campaign_id',$currentCampaign->id)
				->whereRaw('election_role_by_voter_id in (select id from election_roles_by_voters as roles_temp where roles_temp.election_campaign_id = '.$currentCampaign->id.' and voter_id='.$activistBallot->activist_voter_id.')')
				->update(['deleted'=>1]);
			
			//clear same ballot reporting by other activists
			$currentWorkingActivists = ElectionRolesGeographical::select('election_role_by_voter_geographic_areas.id',
																		'voters.first_name',
																		'election_roles_by_voters.phone_number',
																		'election_roles_by_voters.id as election_role_id',
																		'election_roles.system_name as election_role_name')
							->withElectionRolesByVoters(false)
							->join('election_roles','election_roles.id','=','election_roles_by_voters.election_role_id')
							->join('voters','voters.id','=','election_roles_by_voters.voter_id')
							->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
							->where('election_role_by_voter_geographic_areas.entity_id', $activistBallot->ballot_box_id)
							->where('election_role_by_voter_geographic_areas.id', '!=', $activistBallot->id)
							->where('election_role_by_voter_geographic_areas.current_reporting' ,1)
							->where('election_roles_by_voters.election_campaign_id', $currentCampaign->id)
							->get();
	
			for($i=0;$i < count($currentWorkingActivists) ; $i++){
				$item = $currentWorkingActivists[$i];
				$firstName = $item->first_name;
						
				$currentMiId = $currentBallotRole->ballot_box_mi_id;
				$currentMiId = (strlen($currentMiId) == 1)? $currentMiId : substr_replace($currentMiId, ".", strlen($currentMiId)-1, 0);
				$returnMessage = '';
				if (Helper::isKosherPhone($item->phone_number)) {
					Ivr::resetActivists($item->phone_number);
				}else {
					$returnMessage = config('constants.activists.disconnectedActivistMessage');
					$returnMessage = str_replace("[mi_id]" , $currentMiId , $returnMessage);
					$returnMessage = str_replace("[first_name]" , $item->first_name , $returnMessage);
					$returnMessage = str_replace("[global_phone_number]" , $currentBallotRole->assign_leader_phone_number , $returnMessage);
					$smsSendCode1 = Sms::connection('telemarketing')->send($item->phone_number, $returnMessage);	
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($item->election_role_id, $item->election_role_name, $returnMessage, $item->phone_number);
					}
				}
			}
			ElectionRolesGeographical::where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
							->where('entity_id', $activistBallot->ballot_box_id)
							->where('id', '!=', $activistBallot->id)
							->where('current_reporting', 1)
							->update([ 'current_reporting' => 0 ]);	
							
			$activistBallot->current_reporting = 1;
			$activistBallot->save();
			//clear reporting from other ballots
			$activistsIds = [];
			foreach($activists as $activisttemp) {
				array_push($activistsIds, $activisttemp->id);
			}
			ElectionRolesGeographical::where('id', '!=', $activistBallot->id)
							->where('entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
							->whereIn('election_role_by_voter_id', $activistsIds)
							->update([ 'current_reporting' => false ]);	

			//send confirmation message
			$currentMiId = $currentBallotRole->ballot_box_mi_id;
			$currentMiId = (strlen($currentMiId) == 1)? $currentMiId : substr_replace($currentMiId, ".", strlen($currentMiId)-1, 0);

			$firstName= $currentBallotRole->first_name;
			$cityName= $currentBallotRole->city_name;
			$returnMessage = '';
			if ($sourceSystemName == 'ivr') {
				$responseIvrMessage = ['ballot' => $currentMiId, 'city' => $currentBallotRole->city_mi_id];
				return true;
			} 
			else {
				$returnMessage = config('constants.activists.arrivalMessageText');
				$returnMessage = str_replace("[mi_id]" , $currentMiId , $returnMessage);
				$returnMessage = str_replace("[first_name]" , $firstName , $returnMessage);
				$returnMessage = str_replace("[city_name]" , $cityName , $returnMessage);
				$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnMessage);	
				if($smsSendCode1){
					IncomingMessageService::saveSmsMessage($currentBallotRole->election_role_id, $currentBallotRole->election_role_name, $returnMessage, $phoneNumber);
				}
			}
			return true;

			//ballot box not found
		} else { // Not supposed to arrive to here!
			//get right ballot box
			$activistRealBallots = ElectionRolesGeographical::select(
					'election_role_by_voter_geographic_areas.id',
					'election_role_by_voter_geographic_areas.arrival_date',
					'ballot_boxes.id AS ballot_box_id'
				)
				->withElectionRolesByVoters(false)
				->withBallotBoxes()
				->where('election_roles_by_voters.election_campaign_id', $currentCampaign->id)
				->where('election_roles_by_voters.phone_number', $phoneNumber)
				->orderBy(DB::raw("FIELD(election_role_shifts.system_name,'all_day','first','second')"))
				->orderBy('election_role_by_voter_geographic_areas.arrival_date')
				->get();

			//get correct ballot box 
			$ballotBoxId = null;
			foreach($activistRealBallots as $realBallot) {
				if (is_null($realBallot->arrival_date)) {
					$ballotBoxId = $realBallot->ballot_box_id;
					break;
				}
			}
			if (is_null($ballotBoxId) && (count($activistRealBallots) > 0)) $ballotBoxId = $activistRealBallots[0]->ballot_box_id;

			//remove activists from all ballots

			//save to table
			$wrongMessage = new ElectionDayReportingWrongMessage;
			$wrongMessage->key = Helper::getNewTableKey('election_day_reporting_wrong_messages', 5);
			$wrongMessage->election_campaign_id = $currentCampaign->id;
			$wrongMessage->phone_number = $phoneNumber;
			$wrongMessage->election_role_by_voter_id = $activists[0]->id;
			$wrongMessage->ballot_box_id = $ballotBoxId;
			$wrongMessage->message = $message;
			$wrongMessage->save();

			//send ballot box not found message
			$returnMessage = '';
			if ($sourceSystemName == 'ivr') {
				$responseIvrMessage = 'BAD_BALLOT_BOX_NUMBER';
				return false;
			} else {
				$badBallot = BallotBox::select('mi_id')->where('id', $voterInElectionCampaign->ballot_box_id);
				if($badBallot){ $returnBallotMiId = $badBallot->mi_id; }
				$returnBallotMiId = (strlen($returnBallotMiId) == 1)? $returnBallotMiId : substr_replace($returnBallotMiId, ".", strlen($returnBallotMiId)-1, 0);
				$returnMessage = config('constants.activists.badBallotBoxNumberSms');
				$returnMessage = str_replace("[ballot_number]", $returnBallotMiId, $returnMessage);	
				Sms::connection('telemarketing')->send($phoneNumber, $returnMessage);
			
				//save activists message
				foreach($activists as $activistRole) {
					if (in_array($activistRole->election_role_name, $electionRoleSystemNames)) {
						self::saveActivistMessage($activistRole->id, 
											$phoneNumber, 
											$returnMessage, 
											config('constants.MESSAGE_DIRECTION_OUT'), 
											null, 
											null, 
											null);
					}
				}
			}
			return false;
		}

	}
	/**
	 * @method deleteVotesReporting
	 * delete votes for voters serial numbers.
	 * @return void
	 */
	private static function deleteVotesReporting($votersSerialNumbers, $currentCampaign, $currentReportingBallotRole){
			$votesList = Votes::select('votes.id')
			->withVotersInElectionCampaign()
			->whereIn('voter_serial_number', $votersSerialNumbers )
			->where('voters_in_election_campaigns.ballot_box_id', $currentReportingBallotRole->ballot_box_id )
			->where('votes.reporting_voter_id', $currentReportingBallotRole->voter_id )
			->where('votes.election_campaign_id', $currentCampaign->id )
			->get();

			foreach($votesList as $vote){
				$vote->delete();
				$historyArgsArr = [
					'topicName' => 'elections.votes.manual.delete',
					'user_create_id' => 0,
					'models' => [
						[
							'referenced_model' => 'Votes',
							'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
							'referenced_id' => $vote->id,
						]
					]
				];
				ActionController::AddHistoryItem($historyArgsArr);
			}
	}
	/**
	 * 	Send voters ballot by voter_serial_number
	 * 	1. Check if voter exists in ballot.
	 * 	2. 
	 */
	private static function votesReporting($phoneNumber, $votersSerialNumbers, $votersDeleteSerialNumbers, $currentCampaign, $activists, $currentReportingBallotRole, $sourceSystemName, $originalMessage, &$responseIvrMessage) {
		//list of activist roles
		$electionRoleSystemNames = [
			'ballot_member',
			'observer'
		];
			$badSerialNumbers = array();
			$successSerialNumbers = array();
			if(!empty($votersDeleteSerialNumbers)){
				self::deleteVotesReporting($votersDeleteSerialNumbers, $currentCampaign, $currentReportingBallotRole);
			}

				$status = false;
				$updateCorrectReporting = false;
				$voteSource = VoteSources::select('id')->where('system_name', $sourceSystemName)->first();

				$voteSourceId = ($voteSource != null)? $voteSource->id : 0;

				foreach($votersSerialNumbers as $voterSerialNumber) {
					$trimSerialNumber = trim($voterSerialNumber);
					$value = intval($trimSerialNumber);
					if (!is_numeric($trimSerialNumber) || ((is_numeric($trimSerialNumber)) && (($value <= 0) || ($value > 999)))) {
						array_push($badSerialNumbers, $voterSerialNumber);
					} elseif (is_numeric($trimSerialNumber)) {
						$viec = VoterElectionCampaigns::select('id', 'voter_id')
											->where('election_campaign_id', $currentCampaign->id)
											->where('ballot_box_id', $currentReportingBallotRole->ballot_box_id)
											->where('voter_serial_number', $voterSerialNumber)
											->first();

						if ($viec) {
							if (!$status) $status = true;
							if (!$updateCorrectReporting) $updateCorrectReporting = true;
							$vote = Votes::where('voter_id', $viec->voter_id)
										 ->where('election_campaign_id', $currentCampaign->id)
										 ->first();
							if (!$vote) {
								$newVote = new Votes;
								$newVote->key = Helper::getNewTableKey('votes', 10);
								$newVote->voter_id = $viec->voter_id;
								$newVote->election_campaign_id = $currentCampaign->id;
								$newVote->vote_date = Carbon::now();
								$newVote->vote_source_id = $voteSourceId;
								$newVote->reporting_voter_id = $currentReportingBallotRole->voter_id;
								$newVote->save();
							}
							array_push($successSerialNumbers, $voterSerialNumber);

						} else {
							array_push($badSerialNumbers, $voterSerialNumber);
						}
					}
				}
				 

				//update correct reporting and set ballot box to reporting if not already
				if ($updateCorrectReporting) {
					$ballotBoxId = $currentReportingBallotRole->ballot_box_id;
					Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $ballotBoxId, $ballotBoxId);

					if (!$currentReportingBallotRole->correct_reporting) {
						ElectionRolesGeographical::where('id', $currentReportingBallotRole->id)
						->update([	'correct_reporting' => 1 ]);

						// COMMENTED OUT
						/*if (!$currentReportingBallotRole->ballot_box_reporting) {
							BallotBox::where('id', $ballotBoxId)
							->update([ 'reporting' => 1 ]);
						}*/
					}
				}
				if($sourceSystemName == 'ivr'){
					$responseIvrMessage = ['oklist' => $successSerialNumbers, 'errlist' => $badSerialNumbers];
					return true;
				}else{
					if (count($badSerialNumbers) > 0) {
						$returnMessage = config('constants.activists.responseSmsMessageSuccessAndFailure');
						$returnMessage = str_replace("[num_success]" , count($successSerialNumbers) , $returnMessage);
						$returnMessage = str_replace("[num_fail]" , count($badSerialNumbers) , $returnMessage);
						$allGoodNumbersStr = implode("," , $successSerialNumbers);
					 
						$returnMessage = str_replace("[success_numbers_list]" ,$allGoodNumbersStr  , $returnMessage);
					}
					else{
						$returnMessage = config('constants.activists.responseSmsMessageAllSuccess');
						$returnMessage = str_replace("[num_success]" , count($successSerialNumbers) , $returnMessage);
					}
					$smsSendCode1 = Sms::connection('telemarketing')->send($phoneNumber, $returnMessage);	
					if($smsSendCode1){
						IncomingMessageService::saveSmsMessage($currentReportingBallotRole->election_role_id, $currentReportingBallotRole->election_role_name, $returnMessage, $phoneNumber);
					}
					return $status;
				}
			 
		 
		}
 

	/**
	 * Remove activists from ballot box reporting
	 *
	 * @param collection $activists
	 * @return void
	 */
	public static function removeActivistsFromBallots($activists) {
		//get array of activists Ids
		$activistsIds = [];
		foreach ($activists as $activist) {
			$activistsIds[] = $activist->id;
		}
		//remove current reporting from activists ballots
		ElectionRolesGeographical::whereIn('election_role_by_voter_id', $activistsIds)
			->where('current_reporting', 1)
			->update([
				'current_reporting' => 0
			]);
	}

	public static function saveActivistMessage($activistId, $phoneNumber, $message, $direction, $incomingSmsId, $incomingIvrId, $verifiedStatus = null) 
	{
			$verified = !is_null($verifiedStatus)? $verifiedStatus : config('constants.activists.verified_status.MORE_INFO');
			
			$incomingMessage = new ElectionRolesByVotersMessages;
			$incomingMessage->key = Helper::getNewTableKey('election_role_by_voter_messages', 10);
			$incomingMessage->election_role_by_voter_id = $activistId;
			$incomingMessage->incoming_sms_id = $incomingSmsId;
			$incomingMessage->incoming_ivr_id = $incomingIvrId;
			$incomingMessage->direction = $direction;
			$incomingMessage->text = $message;
			$incomingMessage->phone_number = $phoneNumber;
			$incomingMessage->verified_status = $verified;
			$incomingMessage->save();
	}
	
	 public static function saveSmsMessage($electionRoleId, $system_name, $msgText, $phoneNumber)
	 {
        $messageArgs = [
            'election_role_by_voter_id' => $electionRoleId,
            'text' => $msgText,
            'phone_number' => $phoneNumber,
        ];
        $message = ElectionRolesByVotersMessagesService::sendMessageToActivist($messageArgs);
		$messageId = $message->id;
		 
        ActivistsMessagesService::addMessageToHistory($messageId, $electionRoleId, $system_name, $msgText, $phoneNumber);
     }

	 
    public static function removeVoterFromSms($sourceNumber, $incomingSmsId= null)
	{
        $phoneCollection = VoterPhone::where('phone_number', $sourceNumber)
        ->where('sms', '1')
        ->get();
        $historyModels= [];
        foreach($phoneCollection as $phoneModel){
            $phoneModel->sms= 0;
            $phoneModel->save();
            $phoneHistoryModel= [
                'referenced_model' => 'VoterPhone',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $phoneModel->id,
                'valuesList' =>   [[
                    'field_name' => 'sms',
                    'display_field_name' => config('history.VoterPhone.sms_status'),
                    'new_numeric_value' => '0'
                ]]];
                $historyModels[]= $phoneHistoryModel;
        }
        if(!empty($historyModels)){
            $historyArgsArr = [
                'topicName' => 'elections.voter.additional_data.contact_details.phone.edit',
                'user_create_id' =>  null,
                'entity_type' => config('constants.HISTORY_ENTITY_VOTER_UPDATE'),
                'entity_id' => $incomingSmsId,
                'models' => $historyModels
            ];
            ActionController::AddHistoryItem($historyArgsArr);
        }
    }
 
}