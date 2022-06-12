<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\TransportationCars;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class TransportationCarsRepository
{
    /**
     * add TransportationCars after insert driver activist
     * @param ActivistCreateDto $activistCreateDto
     * @return TransportationCars
     */
    public static function add(ActivistCreateDto $activistCreateDto)
    {
        if (is_null($activistCreateDto->carType || $activistCreateDto->carNumber || $activistCreateDto->passengerCount))
            throw new Exception(config('errors.elections.ERROR_DETAILS_DRIVER'));
        $transportationCars = self::getTransportationCarsByCarNumber($activistCreateDto->carNumber);
        if ($transportationCars)
            throw new Exception(config('errors.elections.ERROR_CAR_NUMBER_TRANSPORTATION'));
        $newTransportationCars = new TransportationCars();
        $newTransportationCars->key = Helper::getNewTableKey('transportation_cars', 5);
        $newTransportationCars->election_role_by_voter_id = $activistCreateDto->electionRoleByVoter->id;
        $newTransportationCars->type = $activistCreateDto->carType;
        $newTransportationCars->number = $activistCreateDto->carNumber;
        $newTransportationCars->passenger_count = $activistCreateDto->passengerCount;
        $newTransportationCars->save();

        return $newTransportationCars;
    }

    public static function getByElectionRoleId($electionRoleByVoterId)
    {
        $transportationCars = TransportationCars::select()
            ->where('election_role_by_voter_id', $electionRoleByVoterId)->first();

        return $transportationCars;
    }


    /**
     * create or update transportation car details 
     *
     * @param int $electionRoleByVoterId
     * @param int $number
     * @param int $type
     * @param int $passengerCount
     * @return TransportationCars
     */
    public static function updateOrCreateIfNotExist($electionRoleByVoterId, $number, $type, $passengerCount)
    {
        $transportationCars = self::getByElectionRoleId($electionRoleByVoterId);
        if (is_null($number) || is_null($type) || is_null($passengerCount))
            throw new Exception(config('errors.elections.ERROR_DETAILS_DRIVER'));

        $transportationCarsNUmber = self::getTransportationCarsByCarNumber($number);

        if (!$transportationCars) {
            $transportationCars = new TransportationCars;
            $transportationCars->key = Helper::getNewTableKey('transportation_cars', 5);
            $transportationCars->election_role_by_voter_id = $electionRoleByVoterId;
        }

        $transportationCars->type = $type;
        $transportationCars->number = $number;
        $transportationCars->passenger_count = $passengerCount;

        if ($transportationCarsNUmber && $transportationCarsNUmber->id != $transportationCars->id)
            throw new Exception(config('errors.elections.ERROR_CAR_NUMBER_TRANSPORTATION'));

        if ($transportationCars->isDirty())
            $transportationCars->save();

        return $transportationCars;
    }

    private static function getTransportationCarsByCarNumber(int $carNumber)
    {
        return TransportationCars::select()->where('number',$carNumber)->first();
    }
}
