<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Enums\CommonEnum;
use App\Enums\ElectionRoleSystemName;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersDelete;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistsAllocationsAssignmentsDelete
{

    const TAG = "ActivistsAllocationsAssignmentsDelete";
    /**
     * @method
     * delete activist allocation assignment
     * check if role voter is lock
     * check if payment of assignment is locked or in group payment before delete
     * @param $removeElectionRoleByVoter-default true to delete election role voter if assignment delete is single assignment
     */

    public static function deleteActivistAllocationAssignment($activistAllocationAssignmentId, $removeElectionRoleByVoter = CommonEnum::YES)
    {

        if (is_null($activistAllocationAssignmentId))
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_GEO_KEY_MISSING'));

        $assignmentDetails = ActivistsAllocationsAssignmentsRepository::getAssignmentElectionRoleAndAllocationById($activistAllocationAssignmentId);
        $electionRoleByVoter = $assignmentDetails->electionRoleByVoter;
        if ($electionRoleByVoter->user_lock_id && !is_null($electionRoleByVoter->user_lock_id))
        throw new Exception(config('errors.elections.ACTIVIST_ALLOCATION_IS_LOCKED'));

        self::checkLockPayment($assignmentDetails);

        DB::beginTransaction();
        try {
            
            self::deleteLinkedModelsOfAssignmentByRoleType($electionRoleByVoter,$assignmentDetails);
            //delete activist allocation assignment
            ActivistAllocationAssignment::select()->where('id', $activistAllocationAssignmentId)->delete();

            //remove election role by voter if not has more assignment
            if ((int)$removeElectionRoleByVoter==CommonEnum::YES && ElectionRolesByVotersRepository::countAssignmentOfElectionRoleVoter($electionRoleByVoter->id) == 0) {
                ElectionRolesByVotersDelete::deleteElectionRoleByVoterId($electionRoleByVoter->id);
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::info(self::TAG . '@deleteActivistAllocationAssignment error valid:' . $e);
            throw $e;
        }

        //TODO::History-insert in history on history project
        // $historyArgsArr = [
        //     'topicName' => 'elections.activists.motivator.edit',
        //     'models' => [
        //         [
        //             'referenced_model' => 'ElectionRolesGeographical',
        //             'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
        //             'referenced_id' => $electionRoleByVoterGeographicAreasId,
        //         ],
        //     ],
        // ];

        // ActionController::AddHistoryItem($historyArgsArr);


    }

    /**
     * check if the assignment has lock payment
     * @throws Exception
     */
    private static function checkLockPayment(ActivistAllocationAssignment $activistAllocationAssignment)
    {
        $lockPayment = ActivistRolesPaymentsRepository::getLockPaymentsByAssignmentId($activistAllocationAssignment);
        if ($lockPayment->count() > 0)
            throw new Exception(config('errors.payments.ERROR_DELETE_PAYMENT_ITS_IN_GROUP'));
    }

    /**
     * delete all models that linked to assignment by role type
     * delete payment role by assignment id
     * @param ActivistAllocationAssignment $assignment
     * @param ElectionRolesByVoters $electionRoleByVoter
     * @return void
     */
    private static function deleteLinkedModelsOfAssignmentByRoleType(ElectionRolesByVoters $electionRoleByVoter, ActivistAllocationAssignment $assignment)
    {
        $systemName = $electionRoleByVoter->system_name;
        if (!$systemName) {
            $quarterDirectorRoleId = $electionRoleByVoter->election_role_id;
            $quarterDirectorRole = ElectionRolesRepository::getElectionRoleById($quarterDirectorRoleId);
            $systemName = $quarterDirectorRole->system_name;
        }
        switch ($systemName) {
            case ElectionRoleSystemName::QUARTER_DIRECTOR:
                QuarterRepository::resetQuarterDirectorByDirectorAssignment($assignment);
                break;
        }

        ActivistRolesPaymentService::deletePaymentByElectionRoleAndAssignment($electionRoleByVoter->id, $assignment->id);
    }
}
