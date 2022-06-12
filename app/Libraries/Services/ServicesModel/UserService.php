<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\GeographicFilters;
use App\Models\RolesByUsers;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class UserService
{
    /** Define new muni activist user:
     * 1. Check if activist allocation is Busy
     * 2. Add user in app for activist.
     * 3. Add user role.
     * 4. Add user geo filter- according to the activist role.
     * 5. Add geo area for activist
     * */ 

    public static function defineMuniRolesActivistUser(&$jsonOutput, $roleSystemName, &$newElectionRoleByVoter, $fromAddRoleShift = false) {
        //all roles type
        $election_role_system_names = config('constants.activists.election_role_system_names');

        $muni_elections_roles_names = config('constants.activists.muni_login_elections_roles_names');
        $ballot_elections_roles_names = config('constants.activists.ballot_elections_roles_names');
        
        $activistsBallotAllocations = in_array($roleSystemName, $ballot_elections_roles_names);
        $activistsMuniAllocations = in_array($roleSystemName, $muni_elections_roles_names);

		$muni_elections_roles_names = config('constants.activists.muni_elections_roles_names');

        $notNeedAllocation = ( $roleSystemName == $election_role_system_names['electionGeneralWorker']);

        $tempNotNeedAllocation = ( in_array($roleSystemName, $muni_elections_roles_names));
        
		if($notNeedAllocation){ return true;}

        // Need to define entity geo level!
        $entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
        $entityId = $newElectionRoleByVoter->assigned_city_id;

        $activistAllocation = null;
        
        if(!$fromAddRoleShift && !$tempNotNeedAllocation){
            $activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation($entityType, $entityId, $newElectionRoleByVoter->election_role_id);
            if(!$activistAllocation){
                $jsonOutput->setErrorCode(config('errors.elections.ALLOCATION_NOT_EXISTS')); return;
            }
        }
        if(!$activistsMuniAllocations && !$activistsBallotAllocations){
            return true;
        }
 

        $res = self::defineMunicipalActivistsUser($roleSystemName, $newElectionRoleByVoter, $fromAddRoleShift, $tempNotNeedAllocation, $activistAllocation, $entityType, $entityId);
        return $res;
    }
    private static function defineMunicipalActivistsUser($roleSystemName, $newElectionRoleByVoter, $fromAddRoleShift, $tempNotNeedAllocation, $activistAllocation, $entityType, $entityId){
        // Save election roles by voter - after check all details.
        DB::beginTransaction();

        try {
            if(!$fromAddRoleShift && !$tempNotNeedAllocation){
                $activistAllocation->election_role_by_voter_id = $newElectionRoleByVoter->id;
                $activistAllocation->save();
            }
            // Check if geo area is already allocated

            $activistUser = User::select('users.id')
            ->where('voter_id', $newElectionRoleByVoter->voter_id)
            ->first();

            $checkUserRole = true; $userMuniRole = null;
            if(!$activistUser){
                $checkUserRole = false;

                $activistUser = new User();  
                $activistUser->key = Helper::getNewTableKey('users');
                $activistUser->voter_id = $newElectionRoleByVoter->voter_id;
                $activistUser->password = Helper::generateRandomString(40);
                $activistUser->email = 'fake_email.shas.co.il';
                $activistUser->user_create_id = Auth::user()->id;
                // $activistUser->user_create_id =  Auth::user() ? Auth::user()->id: 626;
                $activistUser->active = 0;
                $activistUser->save();
            }
            if($checkUserRole){
                $userMuniRole = RolesByUsers::select('user_roles.id')
                ->join('user_roles', 'user_roles.id', 'roles_by_users.user_role_id')
                ->where('user_roles.system_name', $roleSystemName)
                ->where('roles_by_users.user_id', $activistUser->id)
                ->where('roles_by_users.deleted', 0)
                ->first();
            }
            $userRole = UserRoles::where('system_name', $roleSystemName)->first();
            // dump($roleSystemName, $userRole, $userMuniRole);

            if(!$userMuniRole){
                $userMuniRole = new RolesByUsers();
                $userMuniRole->user_id =  $activistUser->id;
                $userMuniRole->user_role_id =  $userRole->id;
                $userMuniRole->from_date =  Carbon::now();
                $userMuniRole->save();
            }

            $geoFilter = GeographicFilters::where('user_id', $activistUser->id)
            ->where('role_by_user_id', $userMuniRole->id)
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->first();

            // Add user role geo filter
            if(!$geoFilter){
                $newGeoFilter = new GeographicFilters();
                $newGeoFilter->name = "שיבוץ תפקיד - $userRole->name";
                $newGeoFilter->user_id = $activistUser->id;
                $newGeoFilter->role_by_user_id = $userMuniRole->id;
                $newGeoFilter->entity_type = $entityType;
                $newGeoFilter->entity_id = $entityId;
                $newGeoFilter->inherited_id = null;
                $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
                $newGeoFilter->save();
            }

            DB::commit();
            return true;

            // all good
        } catch (\Exception $e) {
            DB::rollback();
            Log::info($e);
            return false;
            // something went wrong
        }
        // self::updateActivistUserElectionRoles($newElectionRoleByVoter->voter_id);
    }
    // Update login server - specific activist relevant election roles
    public static function updateActivistUserElectionRoles($voterId){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $electionRolesByVoter = ElectionRolesByVoters::select('personal_identity', 'election_roles.key')
        ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
        ->where('election_roles_by_voters.voter_id', $voterId)
        ->withVoter()
        ->withElectionRole()
        ->get();
        $activistsElectionsRoles = [];
        foreach($electionRolesByVoter as $roleData){
            array_push($activistsElectionsRoles, $roleData->key);
        }
        $postFields = [
            'personal_identity' => $electionRolesByVoter[0]->personal_identity,
            'activist_election_roles' => json_encode($activistsElectionsRoles),
        ];
        // Log::info($postFields);
        // self::sentRequestToMuniLoginServer('update-activists-election-role', $postFields);
    }
    // Update login server - all activists relevant election roles
    // Hash by personal_identity
    public static function updateAllActivistsUsersElectionsRoles(){
        $activistsElectionsRolesData = [];

        $muni_elections_roles_names = config('constants.activists.muni_login_elections_roles_names');


        $fields = [
            'personal_identity', 'election_roles.key'
        ];
        $municipalActivists = self::getAllMunicipalActivists($muni_elections_roles_names, $fields);
        // dump($muni_elections_roles_names);
        foreach($municipalActivists as $roleData){
            if(!isset($activistsElectionsRolesData[$roleData->personal_identity])){
                $activistsElectionsRolesData[$roleData->personal_identity] = [];
            }
            array_push($activistsElectionsRolesData[$roleData->personal_identity], $roleData->key);
        }

        $postFields = [
            'all_activist_election_roles' => json_encode($activistsElectionsRolesData)
        ];
        // self::sentRequestToMuniLoginServer('update-all-activists-election-role', $postFields);
        echo json_encode($activistsElectionsRolesData);
        // die;
    }
    // Update login server election roles list:
    public static function updateLoginServerElectionsRoles(){
        $electionRoles = ElectionRoles::select('election_roles.key', 'name')
        ->where('deleted', DB::raw(0))
        ->whereNotIn('system_name', config('constants.activists.non_muni_elections_roles_names'))
        ->get();
        $postFields = [
            'elections_roles' => json_encode($electionRoles)
        ];
        // self::sentRequestToMuniLoginServer('update-elections-roles', $postFields);
        echo json_encode($electionRoles);
        // die;
    }
            /************************************************************************************************** */
    private static function getAllMunicipalActivists($muniElectionsRolesNames, $fields){
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $municipalActivists = ElectionRolesByVoters::select($fields)
        ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
        ->whereIn('election_roles.system_name', $muniElectionsRolesNames)
        ->withVoter()
        ->withElectionRole()
        ->get();
        return $municipalActivists;
    }
    private static function sentRequestToMuniLoginServer($path, $postFields){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, env('MUNI_LOGIN_BASE_URL') . "$path");
        curl_setopt($ch, CURLOPT_VERBOSE, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json')); 
    
        //turning off the server and peer verification(TrustManager Concept).
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    
        $res = curl_exec($ch);
        // Log::info('$postFields');
        // Log::info(json_encode($postFields));
        // Log::info('$res');
        // Log::info(json_encode($res));
        // echo(json_encode($postFields));
        // die;
    }

}