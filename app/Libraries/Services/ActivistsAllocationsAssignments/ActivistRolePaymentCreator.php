<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Enums\ElectionRoleSystemName;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\ElectionRolesBaseBudgetRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRoleShiftsBudgetRepository;
use App\Repositories\ElectionRolesRepository;
use DB;
use Error;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistRolePaymentCreator
{

    const TAG = "ActivistRolePaymentCreator";

    /**
     * create payment after create assignment
     * function create payment role by assignment id the role type is ballot activist
     * function create payment only by role by role voter if the role id not ballot activist  
     * @param int $electionRoleVoterId
     * @param int $activistAssignmentId
     * @param int $sum
     * @return void
     */
    public static function createByActivistRole(ActivistCreateDto $activistCreateDto)
    {
       
        //check election role is type activist need create payment for assignment
        if (in_array($activistCreateDto->electionRole->system_name, self::getSystemRolesNameIncludePaymentForAssignment()))
            self::createForAssignment($activistCreateDto);
        else
            self::createForRoleVoter($activistCreateDto);
    }

    /**
     * function create payment for assignment by ballot box roles  
     *
     * @param ActivistCreateDto $activistCreateDto
     * @return void
     */
    private static function createForAssignment(ActivistCreateDto $activistCreateDto)
    {
        if (is_null($activistCreateDto->sum)) {

            if ($activistCreateDto->electionRole->system_name == ElectionRoleSystemName::COUNTER) {
                $cityBudget = ElectionRolesBaseBudgetRepository::getBaseBudgetByRoleIdAndCityId(
                    $activistCreateDto
                        ->electionRoleByVoter->election_role_id,
                    $activistCreateDto->electionRoleByVoter->assigned_city_id
                );
                if ($cityBudget)
                    $activistCreateDto->sum = $cityBudget;
            }

            if (is_null($activistCreateDto->sum))
                $activistCreateDto->sum = ElectionRoleShiftsBudgetRepository::getShiftRoleBudget(
                    $activistCreateDto->electionRole->id,
                    $activistCreateDto->activistAllocationAssignment->election_role_shift_id
                );
            if (is_null($activistCreateDto->sum) || $activistCreateDto->sum==0)
                throw new Exception(config('errors.elections.ERROR_SUM_BUDGET_INSERT_PAYMENT_ROLE'));
        }

        $rolePayment = ActivistRolesPaymentsRepository::createIfNotExist(
            $activistCreateDto->activistAllocationAssignment->election_role_by_voter_id,
            $activistCreateDto->sum,
            $activistCreateDto->comment,
            $activistCreateDto->activistAllocationAssignment->id
        );
        $activistCreateDto->activistRolePayment = $rolePayment;
    }

    /**
     * function create payment for election role voter, not ballot role
     *
     * @param ActivistCreateDto $activistCreateDto
     * @return void
     */
    private static function createForRoleVoter(ActivistCreateDto $activistCreateDto)
    {
        if (is_null($activistCreateDto->sum)) {
            $activistCreateDto->sum = self::getBaseBudgetForElectionRolePayment($activistCreateDto);
        }

        $rolePayment = ActivistRolesPaymentsRepository::createIfNotExist(
            $activistCreateDto->electionRoleByVoter->id,
            $activistCreateDto->sum,
            $activistCreateDto->comment
        );
        $activistCreateDto->activistRolePayment = $rolePayment;
    }

    /**
     * function return array of system name role type that need create payment role by assignment and not by election role voter
     * @return string[]
     */
    public static function getSystemRolesNameIncludePaymentForAssignment()
    {
        $systemRoles = ElectionRolesRepository::getBallotRolesSystemName();
        return  $systemRoles;
    }

    private static function getBaseBudgetForElectionRolePayment($activistCreateDto)
    {
        $cityBudget = ElectionRolesBaseBudgetRepository::getBaseBudgetByRoleIdAndCityId(
            $activistCreateDto
                ->electionRoleByVoter->election_role_id,
            $activistCreateDto->electionRoleByVoter->assigned_city_id
        );
        if ($cityBudget) {
            return $cityBudget->budget;
        } else {
            $defaultSumRole = $activistCreateDto->electionRole->budget;
            if (!is_null($defaultSumRole) && $defaultSumRole != 0) {
                return $defaultSumRole;
            } else
                throw new Exception(config('errors.elections.ERROR_SUM_BUDGET_INSERT_PAYMENT_ROLE'));
        }
    }
}
