<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ActivistAllocation\GeographicAllocationDto;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\ElectionRoleShiftService;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistsAllocations;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\TransportationCarsRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistsAssignmentsCreator
{
    const TAG = "ActivistsAssignmentsCreator";


    /**
     * function get ActivistCreateDto and insert activist include
     * create voter role
     * create  user and permission if not exist
     * create activist allocation by specific roles
     * create assignment
     * create payment by assignment
     *
     * @param ActivistCreateDto $ActivistCreateDto
     * @throws Exception
     */
    public static function createActivistIncludeRoleAndAssignment(ActivistCreateDto $activistCreateDto)
    {
        //check activist object before create activist
        $activistCreateDto->validate();
        try {
            DB::beginTransaction();
            $electionRoleVoter = ElectionRolesVotersCreator::createActivistRole($activistCreateDto);
            //get activist allocation type
            $geographicAllocationDto = ActivistsAllocationsCreator::getGeographicAllocationDtoByActivistDtoDetails($activistCreateDto);
            
            if (!$activistCreateDto->activistAllocation) {
                //check is free allocation
                $activistCreateDto->activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation(
                    $geographicAllocationDto->geographicType,
                    $geographicAllocationDto->geographicValue,
                    $electionRoleVoter->election_role_id,
                    $electionRoleVoter->id,
                    $activistCreateDto->shiftRole ? $activistCreateDto->shiftRole->id : null
                );
                //add allocation only for specific election roles
                if (!$activistCreateDto->activistAllocation)
                    $activistCreateDto->activistAllocation = self::addAllocationForActivistCreateDto($activistCreateDto);
            }

            //create assignment
            self::createActivistAssignmentAndPaymentRole($activistCreateDto, $electionRoleVoter->id, $activistCreateDto->activistAllocation->id);
            
            self::handleNewQuarterDirector($activistCreateDto);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            Log::info(self::TAG . '@createAssignment:' . $e);
            throw $e;
        }
    }


    /**
     * function get ActivistCreateDto details and add activist allocation if the role type not need manual allocation
     * @throws Exception  when the activist role need manual allocation
     * @param ActivistCreateDto $ActivistCreateDto
     * @return ActivistsAllocations
     */
    public static function addAllocationForActivistCreateDto(ActivistCreateDto $activistCreateDto)
    {
        if (!in_array($activistCreateDto->electionRole->system_name, ActivistsAllocationsCreator::getElectionRolesNotNeedManualAllocation()))
            throw new Exception(config('errors.elections.ALLOCATION_NOT_EXISTS'));
        //create activist allocation
        $activistAllocation = ActivistsAllocationsCreator::createByActivistCreateDto($activistCreateDto);
        return $activistAllocation;
    }

    /**
     * @param ElectionRolesByVoters $electionRoleVoter
     * @param GeographicAllocationDto $GeographicAllocation
     * @param ElectionRoleShifts|null $shitRole
     * @return ActivistCreateDto
     */
    public static function addAssignmentToActivist(ElectionRolesByVoters $electionRoleVoter, GeographicAllocationDto $GeographicAllocationDto, ElectionRoleShifts $shitRole = null)
    {
        try {
            DB::beginTransaction();
            $activistAllocation = ActivistsAllocationsService::checkIfExistFreeAllocation(
                $GeographicAllocationDto->geographicType,
                $GeographicAllocationDto->geographicValue,
                $electionRoleVoter->election_role_id,
                $electionRoleVoter->id,
                $shitRole ? $shitRole->id : null
            );

            if (!is_null($shitRole))
                self::isValidShiftRole($electionRoleVoter, $shitRole);

            $activistCreateDto  = new ActivistCreateDto();
            $activistCreateDto->electionRoleByVoter = $electionRoleVoter;
            $activistCreateDto->activistAllocation = $activistAllocation;
            $activistCreateDto->shiftRole = $shitRole;
            $activistCreateDto->electionRole = ElectionRolesRepository::getElectionRoleById($electionRoleVoter->election_role_id);
            if (!$activistAllocation) {
                $activistCreateDto->activistAllocation = self::addAllocationForActivistCreateDto($activistCreateDto);
            }
            self::createActivistAssignmentAndPaymentRole($activistCreateDto, $electionRoleVoter->id, $activistCreateDto->activistAllocation->id);

            DB::commit();
            return $activistCreateDto;
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * check if the shift role is valid for activist
     * @throws Exception
     */
    private static function isValidShiftRole(ElectionRolesByVoters $electionRoleVoter, ElectionRoleShifts $shitRole)
    {
        $hasDuplicateShift = ActivistsAllocationsAssignmentsService::checkIfVoterHasDuplicateShift(
            $electionRoleVoter->voter_id,
            $shitRole->id,
            $electionRoleVoter->election_campaign_id
        );
        if ($hasDuplicateShift)
            throw new Exception(config('errors.elections.ERROR_ASSIGNMENT_SHIFT_ROLE_VOTER'));
    }


    /**
     * function check if activist is quarter director for update in quarter director in quarters list
     * @param ActivistCreateDto $ActivistCreateDto
     * @return void
     */
    private static function handleNewQuarterDirector(ActivistCreateDto $ActivistCreateDto)
    {
        $systemNameActivist = $ActivistCreateDto->electionRole->system_name;

        if ($systemNameActivist == config('constants.activists.election_role_system_names.quarterDirector')) {
            QuarterRepository::connectQuarterDirectorToQuarter($ActivistCreateDto->quarter->id, $ActivistCreateDto->voter->id);
        }
    }

    /**
     * create assignment and payment 
     * @throws Exception throw exception if the payment role is lock check if the payment not by assignment
     * @param ActivistCreateDto $ActivistCreateDto
     * @return void
     */
    private static function createActivistAssignmentAndPaymentRole(ActivistCreateDto $activistCreateDto)
    {
        $arrRolesWithAssignmentPayment=ActivistRolePaymentCreator::getSystemRolesNameIncludePaymentForAssignment();
        //check if the payment not by assignment those by election role voter and it's lock
        if(!in_array($activistCreateDto->electionRole->system_name,$arrRolesWithAssignmentPayment))
        {
            $lockPayment=ActivistRolesPaymentsRepository::getLockPaymentActivistRoleByElectionRoleVoterId($activistCreateDto->electionRoleByVoter->id);
            if($lockPayment && $lockPayment->count()>0)
            throw new Exception(config('errors.payments.ERROR_ADD_ASSIGNMENT_PAYMENT_IS_LOCK'));
        }
      
        //insert activist allocation assignment record
        $activistCreateDto->activistAllocationAssignment = ActivistsAllocationsAssignmentsRepository::addAssignments(
            $activistCreateDto->electionRoleByVoter->id,
            $activistCreateDto->activistAllocation->id,
            $activistCreateDto->shiftRole ? $activistCreateDto->shiftRole->id : null
        );
        //add payment record for activist roles
        ActivistRolePaymentCreator::createByActivistRole($activistCreateDto);
    }
}
