<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\Enums\CommonEnum;
use App\Enums\ElectionRoleShiftSystemName;
use App\Enums\ElectionRoleSystemName;
use App\Enums\GeographicEntityType;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\Quarter;
use App\Models\Voters;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use Exception;


class ActivistCreateDto
{
    const TAG = "ActivistCreateDto";

    /**
     * @var Voters
     */
    public $voter;

    /**
     * @var City
     */
    public $city;

    /**
     * @var Cluster
     */
    public $cluster;

    /**
     * @var Quarter
     */
    public $quarter;

    /**
     * @var BallotBox
     */
    public $ballotBox;

    /**
     * @var ElectionRoles
     */
    public $electionRole;

    /**
     * payment amount for activist
     *
     * @var int
     */
    public $sum;

    /**
     * option to send sms
     * CommonEnum::NO-send sms to activist immediately on create
     * CommonEnum::YES-send sms to activist in specific day
     *
     * @var CommonEnum
     */
    public $sendSms;

    /**
     * phone number for contact with activist
     * @var number
     */
    public $phoneNumber;

    /**
     * day send the message to activist that the he created
     *
     * @var int
     */
    public $daySendingMessage;

    /**
     * @var ElectionCampaigns
     */
    public $electionCampaign;

    /**
     * email of activist that include in voter details
     *
     * @var string
     */
    public $email;

    /**
     * comment for activist payment role
     *
     * @var string
     */
    public $comment;

    /**
     * CommonEnum::YES if the activist instructed
     * CommonEnum::NO if not instructed
     *
     * @var int
     */
    public $instructed;

    /**
     * other phone numbers for activist
     *
     * @var string[]
     */
    public $otherPhones;

    /**
     * shift role for ballot activist
     *
     * @var ElectionRoleShifts
     */
    public $shiftRole;

    /**
     * for driver activist
     *
     * @var int
     */
    public $carType;

    /**
     * for driver activist
     *
     * @var int
     */
    public $carNumber;

    /**
     * passenger count in car for driver activist
     *
     * @var int
     */
    public $passengerCount;

    /**
     * activist details
     *
     * @var ElectionRolesByVoters
     */
    public $electionRoleByVoter;

    /**
     * @var ActivistsAllocations
     */
    public $activistAllocation;

    /**
     * @var ActivistAllocationAssignment
     */
    public $activistAllocationAssignment;

    /**
     * @var ActivistRolesPayments
     */
    public $activistRolePayment;


    /**
     * Checking the integrity of the object properties
     *
     * @throws Exception
     */
    public function validate()
    {
        $this->isValidCampaign();
        $this->isValidVoter();
        $this->isValidRole();
        $this->isValidCity();
        $this->isValidCluster();
        $this->isValidBallotBox();
        $this->isValidQuarter();
        $this->isValidShiftRole();
        $this->isValidEmail();
        $this->isValidSum();
        $this->isValidPhoneNumber();
        $this->isValidSendSms();
        $this->isValidInstructed();
        $this->isValidDriverDetails();
    }

    private function isValidCampaign()
    {
        if (is_null($this->electionCampaign))
            throw new Exception(config('errors.elections.MISSING_ELECTION_CAMPAIGN'));
    }

    private function isValidVoter()
    {
        if (is_null($this->voter))
            throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    }

    private function isValidRole()
    {
        if (is_null($this->electionRole))
            throw new Exception(config('errors.elections.ERROR_ELECTION_ROLE_ID'));
    }

    private function isValidCity()
    {
        if (is_null($this->city))
            throw new Exception(config('errors.elections.INVALID_CITY'));
        //array system name roles conflict in different city 
        $conflictCityRoles = [$this->electionRole->system_name];
        if (in_array($this->electionRole->system_name, ElectionRolesRepository::getBallotRolesSystemName()))
            $conflictCityRoles = ElectionRolesRepository::getBallotRolesSystemName();

        $ActivistInDifferentCity = ElectionRolesByVotersRepository::getByActivistRoleIdInDifferentCity(
            $this->voter->id,
            $conflictCityRoles,
            $this->city->id,
            $this->electionCampaign->id
        );
        if ($ActivistInDifferentCity && $ActivistInDifferentCity->count() > 0) {
            if (in_array($this->electionRole->system_name, ElectionRolesRepository::getBallotRolesSystemName()))
                throw new Exception(config('errors.elections.ERROR_CITY_ON_INSERT_BALLOT_ACTIVIST'));
            else
                throw new Exception(config('errors.elections.ERROR_CITY_ON_INSERT_ACTIVIST'));
        }
    }

    /**
     * throw exception if the cluster is null and the activist role is only  for cluster geo type
     */
    private function isValidCluster()
    {
        $systemNameRole = $this->electionRole->system_name;
        $geoEntityOption = ActivistsAllocationsCreator::getAllocationGeoEntityOptionByElectionRoleSystemName($systemNameRole);

        if (
            is_null($this->cluster) &&
            count($geoEntityOption) == 1 && $geoEntityOption[0] == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER
        ) {
            throw new Exception(config('errors.elections.ERROR_NOT_INSERT_CLUSTER'));
        }
    }

    /**
     * @throws Exception if the ballotBox is null and the activist is ballot type
     * and throw exception if the activist at ballot box in another city
     */
    private function isValidBallotBox()
    {
        $systemNameRole = $systemNameRole = $this->electionRole->system_name;
        $geoEntityOption = ActivistsAllocationsCreator::getAllocationGeoEntityOptionByElectionRoleSystemName($systemNameRole);

        if (
            is_null($this->ballotBox)
            && count($geoEntityOption) == 1 && $geoEntityOption[0] == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX
        )
            throw new Exception(config('errors.elections.ERROR_NOT_INSERT_BALLOT_BOX'));

        return $this;
    }

    /**
     * throw exception if the quarter is null and the activist is quarter type
     */
    private function isValidQuarter()
    {
        $systemNameRole = $this->electionRole->system_name;
        $geoEntityOption = ActivistsAllocationsCreator::getAllocationGeoEntityOptionByElectionRoleSystemName($systemNameRole);

        if (
            is_null($this->quarter)
            && count($geoEntityOption) == 1 && $geoEntityOption[0] == GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER
        )
            throw new Exception(config('errors.elections.ERROR_NOT_INSERT_QUARTER'));
    }

    /**
     * The function checks if the shift contradicts another existing shift in the active
     *  only if the activist role is ballot activist
     */
    private function isValidShiftRole()
    {
        $systemNameRole = $this->electionRole->system_name;
        if (in_array($systemNameRole, ElectionRolesRepository::getBallotRolesSystemName())) {
            if (is_null($this->shiftRole))
                throw new Exception(config('errors.elections.ERROR_NOT_INSERT_SHIFT_ROLE'));

            $hasDuplicateShift = ActivistsAllocationsAssignmentsService::checkIfVoterHasDuplicateShift(
                $this->voter->id,
                $this->shiftRole->id,
                $this->electionCampaign->id
            );
            if ($hasDuplicateShift)
                throw new Exception(config('errors.elections.ERROR_ASSIGNMENT_SHIFT_ROLE_VOTER'));
        }
    }

    private function isValidEmail()
    {
        $systemNameRole = $this->electionRole->system_name;
        $systemRoleRequireEmail = ElectionRolesVotersCreator::getElectionRolesSystemNameRequireEmail();
        if ((is_null($this->email) || $this->email == '') && in_array($systemNameRole, $systemRoleRequireEmail))
            throw new Exception(config('errors.elections.ERROR_ROLE_REQUIRE_EMAIL'));
        if (!is_null($this->email) && !Helper::validateEmail($this->email))
            throw new Exception(config('errors.elections.INVALID_EMAIL'));
    }

    private function isValidSum()
    {
        if (!is_null($this->sum) && !is_int($this->sum))
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_SUM'));
    }

    private function isValidSendSms()
    {
        if (!in_array($this->sendSms, [CommonEnum::NO, CommonEnum::YES]))
            throw new Exception(config('errors.elections.INVALID_SEND_SMS_VALUE'));

        if ($this->sendSms == CommonEnum::NO && !in_array($this->daySendingMessage, [1, 2, 3, 4, 5, 6]))
            throw new Exception(config('errors.elections.ACTIVIST_INVALID_DAY_SENDING_MESSAGE'));
    }

    public function isValidInstructed()
    {
        if (is_null($this->instructed))
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_INSTRUCTED'));
    }

    /**
     * check if the phone number is valid and that no other activist has the same phone number
     */
    private function isValidPhoneNumber()
    {
        if (is_null($this->phoneNumber) || !is_numeric($this->phoneNumber))
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));

        if (!Helper::isIsraelMobilePhone($this->phoneNumber))
            throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));

        // Checking if another activists have the same phone number
        $otherActivistObj = ElectionRolesByVotersRepository::getOtherActivistByPhoneNumber($this->voter->id, $this->phoneNumber, $this->electionCampaign->id);
        if (!is_null($otherActivistObj))
            throw new Exception(config('errors.elections.ANOTHER_ACTIVIST_OWNS_THAT_PHONE'));
    }

    /**
     * check if the activist is driver and all driver details is valid
     */
    private function isValidDriverDetails()
    {
        if ($this->electionRole->system_name == config('constants.activists.election_role_system_names.driver')) {
            if (is_null($this->carType) || is_null($this->passengerCount) || is_null($this->carNumber))
                throw new Exception(config('errors.elections.ERROR_DETAILS_DRIVER'));
        }
    }
}
