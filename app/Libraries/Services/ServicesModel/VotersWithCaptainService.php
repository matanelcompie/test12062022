<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class VotersWithCaptainService {
  //type of source for insert voter with captain fifty
    public static $source_application=1;
    public static $source_csv=2;
    private static $arr_source_type_check=[1];

    private static $hour_checkInsert=24;
    private static $max_insert_in_time=20;
   


    //function add captain and phone by excel file with captain tz and phone
    //excel A-col=captain tz
    //excel B-col=phone of captain
    public static function addVoterForCaptainByCSVFile($csvLocation,$electionCampaign,$user_id=null){
		$count=0;
		$captainTzCSV = storage_path('\\app\\'.$csvLocation);//."\\".$csvLocation;
		$originalFile = fopen($captainTzCSV, 'r');
		
		while ( ($fileData = fgetcsv($originalFile)) !== false ){
			$personal_identity_voter=Helper::trimStartZero($fileData[0]);//tz voter
            $personal_identity_captain=Helper::trimStartZero($fileData[1]);//tz captain

           $captain= VoterDetailsService::getVoteByPersonalIdentity($personal_identity_captain);
           $voter=VoterDetailsService::getVoteByPersonalIdentity($personal_identity_voter);

           if(!$captain)
           {
               Log::info('שר מאה לא נמצא'.$personal_identity_captain);
                continue;
           }

           if(!$voter)
           {
            Log::info('בוחר לא נמצא'.$personal_identity_voter);
            continue;
           }


            $isExist=self::getVoterWithCaptainByDetails($voter->id,$electionCampaign);

            if($isExist!=false){
                if($isExist->captain_id!=$captain->id){
                    Log::info('- בוחר מקושר לשר מאה אחר- ');
                    Log::info('בוחר :'.$voter->id);
                    Log::info('שר מאה :'.$captain->id);
                }
            }
            else{
                self::addVoterWithCaptain($electionCampaign,$voter->id,$captain->id,$user_id,VotersWithCaptainService::$source_csv);
                $count++;
            }
           
        }

        fclose($originalFile);	
	    return $count;
	}


    public static function getVoterWithCaptainByDetails($voter_id,$electionCampaign){
        $connectCaptain=  
        VoterCaptainFifty::select()
        ->where('election_campaign_id',$electionCampaign)
        ->where('deleted',DB::raw(0))
        ->where('voter_id',$voter_id)
        ->first(); 

        if($connectCaptain)
        return $connectCaptain;

        else
        return false;
        
    }
    /**
     * @method addVoterWithCaptain 
     * Bind voter to captain.
     */
    public static function addVoterWithCaptain($election_campaign_id,$voter_id,$captain_voter_id,$recognized=0,$user_create_id=null,$create_source_id=null){
       
        if(self::checkInsertByTypeResourceAndUser($user_create_id,$create_source_id,$election_campaign_id)){
            
            $voterWithCaption=new VoterCaptainFifty();
            $voterWithCaption->key=Helper::getNewTableKey('voters_with_captains_of_fifty', VoterCaptainFifty::$lengthKey);
            $voterWithCaption->election_campaign_id=$election_campaign_id;
            $voterWithCaption->voter_id=$voter_id;
            $voterWithCaption->captain_id=$captain_voter_id;
            $voterWithCaption->recognized=$recognized;
            $voterWithCaption->user_create_id=$user_create_id;
            $voterWithCaption->create_source_id=$create_source_id;
            
            $voterWithCaption->save();
    
            return  $voterWithCaption;
        
        }
        else
        throw new Exception(config('errors.elections.ERROR_CONNECT_VOTER_TO_CAPTAIN'));
    }
        /**
     * @method allocateVoterToCaptain50 
     * Get voter captain
     * -> Maybe it is double function of "getVoterMinisterOfFifty"
    */
    public static function allocateVoterToCaptain50($jsonOutput, $voterKey, $captainKey) {
        if ( is_null($voterKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        if ( is_null($captainKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAPTAIN_KEY_IS_MISSING'));
            return;
        }

        $voterObj = Voters::select(['id'])->where('key', $voterKey)->first();
        if ( is_null($voterObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $captainFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name',
            'voters.personal_identity',
            'c.name as city'
        ];
        $captainObj = Voters::select($captainFields)
            ->withCity()
            ->where('voters.key', $captainKey)
            ->first();
        if ( is_null($captainObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.'));
            return;
        }

        $lastCampaignId = ElectionCampaigns::currentCampaign()->id;

        $referenced_model_action_type = null;
        $changedValues = [];
        $voterCaptainFiftyObj = VoterCaptainFifty::select(['id', 'captain_id'])
            ->where(['election_campaign_id' => $lastCampaignId, 'voter_id' => $voterObj->id, 'deleted' => 0])
            ->first();
        if ( is_null($voterCaptainFiftyObj) ) {
            $voterCaptainFiftyObj = new VoterCaptainFifty;
            $voterCaptainFiftyObj->key = Helper::getNewTableKey('voters_with_captains_of_fifty', 10);
            $voterCaptainFiftyObj->election_campaign_id = $lastCampaignId;
            $voterCaptainFiftyObj->voter_id = $voterObj->id;
            $voterCaptainFiftyObj->captain_id = $captainObj->id;
            $voterCaptainFiftyObj->save();

            $fields = ['election_campaign_id', 'voter_id', 'captain_id'];
            for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
                $fieldName = $fields[$fieldIndex];

                $changedValues[] = [
                    'field_name' => $fieldName, // Fileld name
                    'display_field_name' => config('history.VoterCaptainFifty.' . $fieldName), // display field name
                    'new_numeric_value' => $voterCaptainFiftyObj->{$fieldName} // new value of field
                ];
            }

            $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD');
        } else if ( $captainObj->id != $voterCaptainFiftyObj->captain_id ) {
            $changedValues[] = [
                'field_name' => 'captain_id', // Fileld name
                'display_field_name' => config('history.VoterCaptainFifty.captain_id'), // display field name
                'old_numeric_value' => $voterCaptainFiftyObj->captain_id,
                'new_numeric_value' => $captainObj->id
            ];

            $voterCaptainFiftyObj->captain_id = $captainObj->id;
            $voterCaptainFiftyObj->save();

            $referenced_model_action_type = config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT');
        }

        if ( count($changedValues) > 0 ) {
            $historyArgsArr = [
                'topicName' => 'elections.voter.support_and_elections.election_activity.add',
                'models' => [
                    [
                        'referenced_model' => 'VoterCaptainFifty',
                        'referenced_model_action_type' => $referenced_model_action_type,
                        'referenced_id' => $voterCaptainFiftyObj->id,
                        'valuesList' => $changedValues
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

        return $captainObj;
    }
    /**
     * @method getVoterMinisterOfFifty 
     * GEt voter captain
    */
    public static function getVoterMinisterOfFifty($personal_identity){

        $resultArray = Voters::select(['voters.id',
            'first_name',
            'last_name',
            'mi_city',
            'key', 'household_id'])->withFilters()->where('personal_identity', $personal_identity)->first();
        if ($resultArray) {
            $resultArray->first_name = trim($resultArray->first_name);
            $resultArray->last_name = trim($resultArray->last_name);
            $resultArray->mi_city = trim($resultArray->mi_city);
        }
        return $resultArray;
    }

    /**
     * @method getVoterMinisterOfFifty 
     * Get voter captain
     * -> Maybe it is double function of "getVoterMinisterOfFifty"
    */
    public static function getCaptainOfFifty($jsonOutput, $voterKey) {

        if ( is_null($voterKey) || trim($voterKey) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        $lastCampaignId = ElectionCampaigns::currentCampaign()->id;

        $selectedVoter = Voters::select(['id'])->where('key', $voterKey)->first();
        if ( is_null($selectedVoter) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $captainOfFiftyData = VoterCaptainFifty::select(['captain_id'])
            ->where(['voter_id' => $selectedVoter->id, 'election_campaign_id' => $lastCampaignId, 'deleted' => 0])
            ->first();
        $captain50Obj = null;
        if (  !is_null($captainOfFiftyData) ) {
            $electionRoleCaptain = ElectionRoles::select('id')
                ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
                ->first();

            $captainFields = [
                'voters.id',
                'voters.key',
                'voters.first_name',
                'voters.last_name',
                'voters.personal_identity',
                'c.name as city',
                'election_roles_by_voters.user_lock_id'
            ];
            $captain50Obj = Voters::select($captainFields)
                ->withCity()
                ->join('election_roles_by_voters' , function($joinOn) use($lastCampaignId, $electionRoleCaptain){
                    $joinOn->on('election_roles_by_voters.voter_id' , '=', 'voters.id')
                        ->where('election_roles_by_voters.election_campaign_id', $lastCampaignId)
                        ->where('election_roles_by_voters.election_role_id', $electionRoleCaptain->id);
                })
                ->where('voters.id', $captainOfFiftyData->captain_id)
                ->first();

        } 
        return $captain50Obj;

    }
    /**
     * @method unAllocateVoterToCaptain50 
     * Get voter captain
     * -> Maybe it is double function of "unAllocateVoterToCaptain50"
    */
    public static function unAllocateVoterToCaptain50($jsonOutput, $voterKey) {
        if ( is_null($voterKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        $voterObj = Voters::select(['id'])->where('key', $voterKey)->first();
        if ( is_null($voterObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $lastCampaignId = ElectionCampaigns::currentCampaign()->id;

        $voterCaptainFiftyObj = VoterCaptainFifty::select(['id', 'captain_id'])
            ->where(['election_campaign_id' => $lastCampaignId, 'voter_id' => $voterObj->id, 'deleted' => 0])
            ->first();
        if ( is_null($voterCaptainFiftyObj) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_ALLOCATED_TO_ANY_CAPTAIN'));
            return;
        }

        $electionRoleCaptain = ElectionRoles::select('id')
            ->where(['system_name' => config('constants.activists.election_role_system_names.ministerOfFifty'), 'deleted' => 0])
            ->first();

        $electionRoleByVoter = ElectionRolesByVoters::select(['id', 'user_lock_id'])
            ->where(['voter_id' => $voterCaptainFiftyObj->captain_id, 'election_role_id' => $electionRoleCaptain->id, 'election_campaign_id' => $lastCampaignId])
            ->first();
        if (!$electionRoleByVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            return;
        } elseif ( !is_null($electionRoleByVoter->user_lock_id) ) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
            return;
        }

        $voterCaptainFiftyObj->deleted = 1;
        $voterCaptainFiftyObj->save();

        $historyArgsArr = [
            'topicName' => 'elections.voter.support_and_elections.election_activity.delete',
            'models' => [
                [
                    'referenced_model' => 'VoterCaptainFifty',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterCaptainFiftyObj->id
                ]
            ]
        ];
        ActionController::AddHistoryItem($historyArgsArr);
        return true;
    }

    public static function checkInsertByTypeResourceAndUser($user_id,$source_type,$election_campaign_id){

      if(in_array($source_type,self::$arr_source_type_check)){
        $user=User::where('id',$user_id)->first();

        if(!$user)
        return false;
        //check if user lock insert record voter to captain
      $check_lock_insert=$user->user_activist_lock;
      if($check_lock_insert==1)
        return false;

        //check if need lock
         $limit_day=date('Y-m-d H:i:s', strtotime('-'.self::$hour_checkInsert.' hour', strtotime(date('Y-m-d H:i:s')))); 
        $count=VoterCaptainFifty::select(DB::raw('count(distinct voter_id) as count_in_time'))
        ->where('election_campaign_id',$election_campaign_id)
        ->where('user_create_id',$user_id)
        ->where('deleted',DB::raw(0))
        ->where('created_at','>=',$limit_day)
        ->first();
        
        if($count)
        $count=$count->count_in_time;
        else
        $count=0;
        
        Log::info('count:'.$count);
        if($count>self::$max_insert_in_time){
            //lock user for connect voter to captain
            $user->user_activist_lock=1;
            $user->save();

            return false;
        }
       
      }
       return true;
    }

}