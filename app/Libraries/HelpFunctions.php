<?php

/**
 * |---------------
 * | A Helper class
 * |----------------
 **/

namespace App\Libraries;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\ElectionCampaigns;
use App\Models\VoterCaptainFifty;
use App\Models\VotersUpdatesByCaptains;
use App\Models\RequestTopicUsers;
use App\Models\Teams;
use App\Models\User;

class HelpFunctions {

    public static function reportVoterCaptainUpdate($updatedFields, $voterId, $captainId = null){

        $currentCampaign = ElectionCampaigns::currentCampaign();
		$current_campaign_id = $currentCampaign->id;

        if(!$captainId){
            $captain = VoterCaptainFifty::select('captain_id')
                ->where('voter_id', $voterId)
                ->where('deleted', DB::raw(0))
                ->where('election_campaign_id', $current_campaign_id)
                ->first();
            if(!$captain){ return; }
            $captainId = $captain->captain_id;
        }
        // dump('captainId', $captainId);
        $voterUpdateRow = VotersUpdatesByCaptains::select('id')
        ->where('captain_id', $captainId)
        ->where('voter_id', $voterId)
        ->first();

        if(!$voterUpdateRow){
            $voterUpdateRow = new VotersUpdatesByCaptains;
            $voterUpdateRow->voter_id = $voterId;
            $voterUpdateRow->captain_id = $captainId;
            $voterUpdateRow->election_campaign_id = $current_campaign_id;
        }
        foreach ($updatedFields as $field){
            $fieldFullName = "is_$field" . "_changed";
            $voterUpdateRow->$fieldFullName = 1;
        }

        $voterUpdateRow->save();

    } 
    public static function updateRequestTopicUserHandler($jsonOutput, $sourceScreen, $topicId, $cityId, $newUserHandlerId, $newTeamHandlerId){ // !! todo history!
        
        $requestTopicUser = RequestTopicUsers::where('request_topic_id', $topicId);
        if($cityId){$requestTopicUser->where('city_id',  $cityId);}

        $requestTopicUser = $requestTopicUser->first();


        if(!is_null($newUserHandlerId)){ // Check user handler
            $user = User::select('id')->where('id', $newUserHandlerId)->first();
            if(!$user) { $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST')); return;}
        }

        if(!is_null($newTeamHandlerId)){ // Check team handler
            $team = Teams::select('id', 'leader_id')->where('id', $newTeamHandlerId)->first();
            if(!$team) { $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS')); return;}
            // if(is_null($newUserHandlerId)){ // Set team leader if not user handler not defined.
            //     $user_leader = User::select('id')->where('id', $team->leader_id)->first();
            //     if($user_leader){
            //         $newUserHandlerId =  $team->leader_id; 
            //     }else{ //!! Need to Define main requests user
            //         $newUserHandlerId = null;
            //     }
            // }
        }


        if(is_null($requestTopicUser)){ // Add new topic user handler 
            if(is_null($newUserHandlerId) && is_null($newTeamHandlerId)){ $jsonOutput->setErrorCode(config('errors.system.TEAM_HANDLER_ERROR')); return;}
            $requestTopicUser = new RequestTopicUsers();
            $requestTopicUser->city_id = $cityId;
            $requestTopicUser->request_topic_id = $topicId;
        } 

        $requestTopicUser->team_handler_id = $newTeamHandlerId; 
        $requestTopicUser->user_handler_id = $newUserHandlerId; 
        

        $requestTopicUser->save();

        return $requestTopicUser;
    }
    public static function getUsersWithRequestModuleRole($jsonOutput, $teamKey = null, $withRequestsTopics = false){
        $fields = [
            DB::raw('CONCAT(voters.first_name , " ", voters.last_name) as name'),
                'users.id', 'teams.id as team_id', 
        ];
        $team = null;

       $users = User::WithRolesAndTeams(true)->withVoter()
        ->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id')
        ->join('modules', 'modules.id', '=', 'user_roles.module_id')
        ->groupBy('users.id')
        ->where('modules.system_name', 'requests');

        if(!is_null($teamKey)){
            $team  = Teams::where('key', $teamKey)->first();
            if(!$team){ $jsonOutput->setErrorCode(config('errors.system.TEAM_NOT_EXISTS')); return null; }
            $users->where('teams.id',$team->id);
        } 
        if($withRequestsTopics){
            $fields =[
                'request_topics.id', 'request_topics.key', 'request_topics.name',
                'request_topics.active', 'request_topics.topic_order', 'request_topics.parent_id',
                'users.id as user_handler_id', 'request_topics_by_users.id as request_topic_user_id',
                DB::raw('CONCAT(voters.first_name," ", voters.last_name) as user_handler_name'),
            ];
            $users->withRequestsTopics();
            $users->addSelect('request_topics.id as request_topic_id', 'request_topics.name as request_topic_name');
        }
        // echo $users->toSql();
        // die;
        return $users->select($fields);
    }
    public static function getRequestsTopicsUsersByCity($crmRequestTopic){ // For municipal request topic.
        $requestTopicsHash = [];
        $crmRequestTopicArray = $crmRequestTopic->toArray();
        foreach ($crmRequestTopicArray as $topicData){
            $id = $topicData['id'];
            $city_id = $topicData['city_id'];
            if(!isset($requestTopicsHash[$id])){
                $topicData['users_handler_by_city'] = [];
                $requestTopicsHash[$id] = $topicData;
            }
            $requestTopicsHash[$id]['users_handler_by_city'][$city_id] =  $topicData['user_handler_id'];
        }
        return array_values($requestTopicsHash);
    }
    /**
     * @method validPasswordFormat
     *   Checking if password is 5 characters long and contains at lt least
     * 1 uppercase letter, 1 lowercase letter and at least 1 digit
     */
    public  static function validatePasswordFormat($password){

        if ( !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) ||
                !preg_match('/[0-9]/', $password) || strlen($password) < 5){
            
            return false;
        }
        return true;
    }

}