<?php

namespace App\Http\Requests;

use App\Enums\CommonEnum;
use App\Enums\SendMessageType;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Models\ElectionCampaigns;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRoleShiftRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\VotersRepository;
use Illuminate\Http\Request;

class CreateActivistRequest
{
    public $activistCreateDto;

    /**
     * @throws \Exception
     */
    public function __construct(Request $request)
    {
        $this->createActivistCreateDto($request);
    }

    /**
     * @param Request $request
     * @param string $voterKey
     * @param string $cityKey
     * @throws \Exception
     */
    private function createActivistCreateDto(Request $request)
    {
        $activistCreateDto = new ActivistCreateDto();
        $activistCreateDto->voter = VotersRepository::getVoterByKey($request->input('voter_key'));
        $cityId = $request->input('city_id');
        $activistCreateDto->city = CityRepository::getById($cityId);
        $activistCreateDto->electionRole = ElectionRolesRepository::getElectionRoleById($request->input('election_role_id'));
        $sum = $request->input('sum');
        if (!is_null($sum)) {
            $sum = (int)$sum;
        }

        $activistCreateDto->sum = $sum;
        $activistCreateDto->email = $request->input('email');
        $activistCreateDto->comment = $request->input('comment');
        $activistCreateDto->daySendingMessage = $request->input('day_sending_message');
        $activistCreateDto->sendSms = $request->input('send_sms', SendMessageType::SEND_IN_SPECIFIC_DAY);
        $phoneNumber = Helper::removeAllNoneNumericCharacters($request->input('phone_number'));
        $activistCreateDto->phoneNumber = $phoneNumber;
        $activistCreateDto->instructed = $request->input('instructed', CommonEnum::NO);
        $activistCreateDto->carNumber = $request->input('car_number');
        $activistCreateDto->carType = $request->input('car_type');
        $activistCreateDto->passengerCount = $request->input('car_seats');
        $activistCreateDto->otherPhones = $request->input('phones');
        $activistCreateDto->electionCampaign = ElectionCampaigns::currentCampaign();

        /**
         * Optional parameters
         */
        if (!is_null($request->input('activists_allocation_id'))) {
            $activistCreateDto->activistAllocation = ActivistsAllocationsRepository::getById($request->input('activists_allocation_id'));
        }

        if (!is_null($request->input('ballot_id'))) {
            $activistCreateDto->ballotBox = BallotBoxesRepository::getById($request->input('ballot_id'));
        }

        if (!is_null($request->input('cluster_id'))) {
            $activistCreateDto->cluster = ClusterRepository::getById($request->input('cluster_id'));
        }
        if (!is_null($request->input('quarter_id'))) {
            $activistCreateDto->quarter = QuarterRepository::getQuarterById($request->input('quarter_id'));
        }

        if (!is_null($request->input('shift_system_name'))) {
            $activistCreateDto->shiftRole = ElectionRoleShiftRepository::getShiftRoleBySystemName($request->input('shift_system_name'));
        }

        $this->activistCreateDto = $activistCreateDto;
    }
}
