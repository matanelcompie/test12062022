<?php

namespace App\Libraries\Services\ElectionRolesByVoters;

use App\Http\Controllers\ActionController;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\TransportationCars;
use App\Models\VoterCaptainFifty;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\GeographicFiltersRepository;
use App\Repositories\UserRepository;
use App\Repositories\VotersWithCaptainsOfFiftyRepository;
use App\Repositories\VoterTransportationRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ElectionRolesByVotersDelete
{

    const TAG = "ElectionRolesByVotersDelete";
    /**
     * @method
     */

    public static function deleteElectionRoleByVoterId($electionRoleByVoterId)
    {
        if (is_null($electionRoleByVoterId))
            throw new Exception(config('errors.elections.MISSING_VOTER_KEY'));

        $electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRole($electionRoleByVoterId);

        if (!$electionRoleByVoter)
            throw new Exception(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
        if (!self::checkPermissionDeleteElectionRoleVoter($electionRoleByVoter->system_name))
            throw new Exception(config('errors.system.NO_PERMISSION'));
        if ($electionRoleByVoter->user_lock_id && !is_null($electionRoleByVoter->user_lock_id))
            throw new Exception(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));
           
            DB::beginTransaction();

            try {
                $electionRoleByVoterId = $electionRoleByVoter->id;

                self::deleteLinkedModelsOfActivist($electionRoleByVoter);
                $user = UserRepository::getByVoterId($electionRoleByVoter->voter_id);
                GeographicFiltersRepository::deleteByElectionRole($user->id, $electionRoleByVoter->system_name, $electionRoleByVoter->assigned_city_id);

                $electionRoleByVoter->delete();
                self::writeInHistoryDeleteAction($electionRoleByVoter);
                
                DB::commit();
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        
    }

    private static function checkPermissionDeleteElectionRoleVoter($systemNameRole)
    {

        if (UserPermissionManager::isAdminUser())
            return true;
        $deletePermission = 'elections.activists.' . $systemNameRole . '.delete';
        $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();
        if (isset($permissionsHash[$deletePermission]))
            return true;

        return false;
    }

    /**
     * delete all models that linked to election role by voter by specific roles include assignment
     * @param ElectionRolesByVoters $electionRoleByVoter
     * @return void
     */
    private static function deleteLinkedModelsOfActivist(ElectionRolesByVoters $electionRoleByVoter)
    {
        $arrRoleSystemName = config('constants.activists.election_role_system_names');
        switch ($electionRoleByVoter->system_name) {
            case $arrRoleSystemName['ministerOfFifty']:
                self::deleteMinisterOfFiftyActivist($electionRoleByVoter);
                break;
            case $arrRoleSystemName['driver']:
                self::deleteDriverActivist($electionRoleByVoter);
                break;
        }

        self::deleteActivistAllocationAssignment($electionRoleByVoter);
    }

    private static function deleteMinisterOfFiftyActivist($electionRoleByVoter)
    {
        //delete all voter that connect to MinisterOfFifty  
        VotersWithCaptainsOfFiftyRepository::deleteVoterOfCaptainByCaptainId($electionRoleByVoter->voter_id);
    }

    private static function deleteDriverActivist($electionRoleByVoter)
    {
        $campaign_id =  ElectionCampaigns::currentCampaign();
        $voterTransportation = VoterTransportationRepository::getVoterTransportationByDriverInCampgain($electionRoleByVoter->voter_id, $campaign_id);
        //the driver have voter - can not delete driver 
        if (count($voterTransportation) > 0)
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_DRIVER_ASSIGNED_TRANSPORTATION_IN_CLUSTER'));

        TransportationCars::where('election_role_by_voter_id', $electionRoleByVoter->id)->delete();
    }

    private static function writeInHistoryDeleteAction($electionRoleByVoter)
    {
        $deletePermission = 'elections.activists.' . $electionRoleByVoter->system_name . '.delete';
        $historyArgsArr = [
            'topicName' => $deletePermission,
            'models' => [
                [
                    'referenced_model' => 'ElectionRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $electionRoleByVoter->id,
                ],
            ],
        ];
        ActionController::AddHistoryItem($historyArgsArr);
    }

    //function that mange to delete all activist assignment of election role voter before delete  role voter
    private static function deleteActivistAllocationAssignment($electionRoleByVoter)
    {
        $arrayActivistAssignment = ElectionRolesByVotersRepository::getArrayAssignmentByElectionRoleByVoterId($electionRoleByVoter->id);
        foreach ($arrayActivistAssignment as $key => $activist_allocation_assignment){
            ActivistsAllocationsAssignmentsDelete::deleteActivistAllocationAssignment($activist_allocation_assignment->id, false);
        }
    }
}
