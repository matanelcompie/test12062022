<?php

namespace App\Libraries\Services\ServicesModel\ElectionRolesByVotersService;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\GlobalController;
use App\Http\Controllers\VoterActivistController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\VoterElectionsController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\ActivistsMessagesService;
use App\Libraries\Services\ElectionRolesByVotersMessagesService;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Permission;
use App\Models\PhoneTypes;
use App\Models\TransportationCars;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\Votes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionRoleByVoterService{

    //the function get role_id voter_id and election election_campaign_id
    //and return true if the voter has the role in election_campaign 
    //default is the basic payment additional type (null) election role by voter

    public static function checkIsExistRoleByKeyVoter($role_id,$voter_id,$election_campaign_id,$paymentAdditionalType=false){
        $ElectionRolesByVoters=ElectionRolesByVoters::select()
                                ->where('election_campaign_id',$election_campaign_id)
                                ->where('election_role_id',$role_id)
                                ->where('voter_id',$voter_id);

                                if($paymentAdditionalType==false)
                                $ElectionRolesByVoters=$ElectionRolesByVoters->whereNull('payment_type_additional_id');
                                else
                                $ElectionRolesByVoters=$ElectionRolesByVoters->where('payment_type_additional_id',$paymentAdditionalType);

                                $ElectionRolesByVoters=$ElectionRolesByVoters->first();

        if($ElectionRolesByVoters)
            return true;

        return false;
    }

    public static function getElectionRoleVoterVyRoleVoter($voter_id, $role_id, $electionCampaign, $assigned_city_id){
        $electionVoterRole =
        ElectionRolesByVoters::select()
        ->where('election_campaign_id', $electionCampaign)
        // ->where('deleted',DB::raw(0))
        ->where('voter_id', $voter_id)
        ->where('assigned_city_id', $assigned_city_id)
        ->where('election_role_id', $role_id)
        ->get();

        if ($electionVoterRole->count() > 1)
        Log::info('hi have duplicate-' . $voter_id . '/' . $role_id . '/' . $assigned_city_id);

        if ($electionVoterRole && $electionVoterRole->count() > 0)
        return $electionVoterRole[0];

        else
        return false;
    }




    /************************************ Edit inline specific param activist functions************************************************** */


    /**
     * @method editElectionActivistInstructed
     * Edit inline activist election Instructed status
     * @param Request $request
     * @param [string] $role_key - election role key
     * @return void
    */
    
    public static function editElectionActivistInstructed($jsonOutput, Request $request, $role_key){
        $instructed = $request->input('instructed', null);

        if (!is_null($instructed) && $instructed != 0 && $instructed != 1) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_INSTRUCTED'));
            return;
        }

        $electionRoleByVoter = ElectionRolesByVoters::where('election_roles_by_voters.key', $role_key)->first();

        $updatedValuesArray = [];
        if ($electionRoleByVoter) {
            if (!is_null($instructed) && $electionRoleByVoter->instructed != $instructed) {
                $updatedValuesArray['instructed'] = $electionRoleByVoter->instructed;

                $electionRoleByVoter->instructed = $instructed;
            }
            if(count($updatedValuesArray) > 0){

                $electionRoleByVoter->save();
                $historyArgsArr = [
                    'topicName' => 'elections.activists.cluster_summary.edit',
                    'models' => []
                ];
                $actionHistoryFieldsNames = [
                    'instructed' => config('history.ElectionRolesByVoters.instructed'),
                ];
        
                $fieldsArray = [];
                foreach ($updatedValuesArray as $fieldName => $fieldOldValue) {
                    $fieldsArray[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => $actionHistoryFieldsNames[$fieldName],
                        'new_numeric_value' => $electionRoleByVoter->{$fieldName},
                    ];
                }
        
                $historyArgsArr['models'][] = [
                    'referenced_model' => 'ElectionRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $electionRoleByVoter->id,
                    'valuesList' => $fieldsArray,
                ];
                ActionController::AddHistoryItem($historyArgsArr);
            }

            return true;
        } else {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
        }
    }
    
    /************************************ End specific param functions************************************************** */


    /**
     * Return all the roles that contradict each other.
     *
     * @param string $election_role_system_name
     * @return array
    */
    public static function getRolesListToCheckDuplicates($election_role_system_name){
        $duplicatesRoleIdList = [];
        if(in_array($election_role_system_name, config("constants.activists.muni_elections_roles_names"))){
                return [];
        }
            $duplicatesRoleSystemNames = null;
            switch ($election_role_system_name) {
                case config('constants.activists.election_role_system_names.electionGeneralWorker'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.electionGeneralWorker')
                    ];
                case config('constants.activists.election_role_system_names.quarterDirector'):
                    $duplicatesRoleSystemNames = [];
                    break;
                case config('constants.activists.election_role_system_names.ministerOfFifty'):
                    $duplicatesRoleSystemNames = [];
                    break;
                case config('constants.activists.election_role_system_names.clusterLeader'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.motivator'),
                        config('constants.activists.election_role_system_names.driver'),
                        config('constants.activists.election_role_system_names.ballotMember'),
                        config('constants.activists.election_role_system_names.observer')
                    ];
                    break;
                case config('constants.activists.election_role_system_names.motivator'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.clusterLeader'),
                        config('constants.activists.election_role_system_names.motivator'),
                        config('constants.activists.election_role_system_names.driver'),
                        config('constants.activists.election_role_system_names.ballotMember'),
                        config('constants.activists.election_role_system_names.observer')
                    ];
                    break;
                case config('constants.activists.election_role_system_names.driver'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.clusterLeader'),
                        config('constants.activists.election_role_system_names.motivator'),
                        config('constants.activists.election_role_system_names.ballotMember'),
                        config('constants.activists.election_role_system_names.observer')
                    ];
                    break;
                case config('constants.activists.election_role_system_names.ballotMember'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.clusterLeader'),
                        config('constants.activists.election_role_system_names.motivator'),
                        config('constants.activists.election_role_system_names.driver'),
                        config('constants.activists.election_role_system_names.observer')
                    ];
                    break;

                case config('constants.activists.election_role_system_names.observer'):
                    $duplicatesRoleSystemNames = [
                        config('constants.activists.election_role_system_names.clusterLeader'),
                        config('constants.activists.election_role_system_names.motivator'),
                        config('constants.activists.election_role_system_names.driver'),
                        config('constants.activists.election_role_system_names.ballotMember'),
                        // config('constants.activists.election_role_system_names.observer')
                    ];
                    break;  
                case config('constants.activists.election_role_system_names.counter'):
                    $duplicatesRoleSystemNames = [
                        // config('constants.activists.election_role_system_names.counter'),
                    ];
                    break;     
            }

            $election_roles = ElectionRoles::select('id')->whereIn('system_name', $duplicatesRoleSystemNames)->get();
            foreach($election_roles as $role){
                $duplicatesRoleIdList[] = $role->id;
            }

            return $duplicatesRoleIdList;
    }
        
    // /**
    //  * @method buildPermissionsHash
    //  * Get current user activists permissions hash
    //  * ->for check if user has permissions for edit activists
    //  * ->By activists election role.
    //  * @return PermissionHash
    //  * 
    // */
    // private static function buildPermissionsHash($permissions){
    //     $permissionsHash = [];

    //     for ($index = 0; $index < count($permissions); $index++) {
    //         $permissionName = $permissions[$index]->operation_name;

    //         $permissionsHash[$permissionName] = 1;
    //     }

    //     return $permissionsHash;
    // }
    
}
