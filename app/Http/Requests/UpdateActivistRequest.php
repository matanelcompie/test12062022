<?php

namespace App\Http\Requests;

use App\DTO\TransportationCarDto;
use App\Enums\CommonEnum;
use App\Enums\SendMessageType;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistUpdateDto;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRoleShiftRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UpdateActivistRequest extends Request
{
    public $activistUpdateDto;

    /**
     * @throws \Exception
     */
    public function __construct(Request $request)
    {
        $this->createActivistUpdateDto($request);
    }

    /**
     * @param Request $request
     * @throws \Exception
     */
    private function createActivistUpdateDto(Request $request)
    {

        $activistUpdateDto = new ActivistUpdateDto();


        $activistUpdateDto->sum = $request->input('sum');

        $activistUpdateDto->email = $request->input('email');

        $activistUpdateDto->comment = $request->input('comment');

        if (!is_null($request->input('electionRoleByVoterKey'))) {
            $activistUpdateDto->electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRoleByKey($request->input('electionRoleByVoterKey'));
        }

        if (!is_null($request->input('electionRoleByVoterId'))) {
            $activistUpdateDto->electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRole($request->input('electionRoleByVoterId'));
        }

        if (!is_null($request->input('isActivistRoleLock'))) {
            $activistUpdateDto->isActivistRoleLock = $request->input('isActivistRoleLock');
        }

        if (!is_null($request->input('instructed'))) {
            $instructed = $request->input('instructed');
            if ($instructed != CommonEnum::NO && $instructed != CommonEnum::YES)
                throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_INSTRUCTED'));
            $activistUpdateDto->instructed = $instructed;
        }

        if (!is_null($request->input('notCheckLocation'))) {
            $notCheckLocation = $request->input('notCheckLocation');
            if ($notCheckLocation != CommonEnum::NO && $notCheckLocation != CommonEnum::YES)
                throw new Exception(config('errors.elections.ERROR_NOT_CHECK_LOCATION_VALUE'));
            $activistUpdateDto->notCheckLocation = $notCheckLocation;
        }

        if (!is_null($request->input('appointmentLetter'))) {
            $appointmentLetter = $request->input('appointmentLetter');
            if ($appointmentLetter != CommonEnum::NO && $appointmentLetter != CommonEnum::YES)
                throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_INSTRUCTED'));
            $activistUpdateDto->appointmentLetter = $appointmentLetter;
        }


        if (!is_null($request->input('shiftRoleId'))) {
            $activistUpdateDto->shiftRole = ElectionRoleShiftRepository::getShiftRoleById($request->input('shiftRoleId'));
        }

        if (!is_null($request->input('activistAllocationAssignmentId'))) {
            $activistUpdateDto->activistAllocationAssignment = ActivistsAllocationsAssignmentsRepository::getAssignmentAndElectionRoleById(
                $request->input('activistAllocationAssignmentId')
            );
        }

        if (!is_null($request->input('activistRolesPaymentsId'))) {
            $activistUpdateDto->activistRolesPayment = ActivistRolesPaymentsRepository::getById(
                $request->input('activistRolesPaymentsId')
            );
        }
        

        if (!is_null($request->input('electionRoleVoterId'))) {
            $activistUpdateDto->electionRoleByVoter = ElectionRolesByVotersRepository::getById(
                $request->input('electionRoleVoterId')
            );
        }

        if (!is_null($request->input('electionRoleVoterId'))) {
            $email = $request->input('electionRoleVoterId');
            if (!Helper::validateEmail($email))
                throw new Exception(config('errors.elections.INVALID_EMAIL'));

            $activistUpdateDto->email = $email;
        }
        if (!is_null($request->input('phoneNumber'))) {
            $phoneNumber = Helper::removeAllNoneNumericCharacters($request->input('phoneNumber'));
            $activistUpdateDto->phoneNumber = $phoneNumber;
        }

        if (!is_null($request->input('otherPhoneNumber'))) {
            $activistUpdateDto->otherPhones = $request->input('otherPhoneNumber');
        }

        if (!is_null($request->input('transportationCars'))) {
            $activistUpdateDto->transportationCar = new TransportationCarDto($request->input('transportationCars'));
        }

        $this->activistUpdateDto = $activistUpdateDto;
    }
}
