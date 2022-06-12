<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;

use App\DTO\TransportationCarDto;
use App\Enums\CommonEnum;
use App\Libraries\Helper;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
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
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\MessageBag;

class ActivistUpdateDto
{
  const TAG = "ActivistUpdateDto";

  /**
   * email of activist that include in voter details
   *
   * @var string
   */
  public $email;

  /**
   * @var int CommonEnum 
   */
  public $isActivistRoleLock;

  /**
   * CommonEnum::YES if the activist instructed
   * CommonEnum::NO if not instructed
   *
   * @var int
   */
  public $instructed;

  /**
   * shift role for ballot activist
   *
   * @var ElectionRoleShifts
   */
  public $shiftRole;


  public $sum;


  /**
   * comment for activist  role
   *
   * @var string
   */
  public $comment;


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
  public $activistRolesPayment;

  /**
   * @var Voters
   */
  public $voter;


  /**
   * other phone numbers for activist
   *
   * @var array
   */
  public $otherPhones;

  /**
   * phone number for contact with activist
   * @var number
   */
  public $phoneNumber;

  /**
   * CommonEnum::YES if the activist instructed
   * CommonEnum::NO if not instructed
   *
   * @var int
   */
  public $appointmentLetter;

  /**
   * CommonEnum::YES if the activist instructed
   * CommonEnum::NO if not instructed
   *
   * @var int
   */

  public $notCheckLocation;
  /**
   * transportation car details of driver activist
   *
   * @var TransportationCarDto
   */
  public $transportationCar;

  /**
   * @throws Exception
   */

  public function validate()
  {
    //check if update voter details and not has voter object
    if ((!is_null($this->email) || !is_null($this->otherPhones)) && !$this->electionRoleByVoter) {
      throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));
    }

    //check if update role voter details and not has role voter object  
    if ((!is_null($this->isActivistRoleLock) || (!is_null($this->phoneNumber))) && !$this->electionRoleByVoter)
      throw new Exception(config('errors.elections.MISSING_ELECTION_ROLE_KEY'));

    //check if update assignment details and not has assignment object
    if ((!is_null($this->shiftRole) || !is_null($this->appointmentLetter) || !is_null($this->notCheckLocation)) && !$this->activistAllocationAssignment)
      throw new Exception(config('errors.elections.ERROR_ACTIVIST_ASSIGNMENT_ID'));

    //check if update payment sum
    if (!is_null($this->sum)) {
      if (!$this->activistRolesPayment)
        throw new Exception(config('errors.payments.ERROR_NOT_EXIST_ROLE_PAYMENT'));

      if (!is_null($this->sum))
        ActivistRolePaymentUpdator::checkIsValidUpdateSumPaymentByUser($this->activistRolesPayment);
    }

    $this->isValidPhoneNumber();
    $this->isValidShiftRole();
  }

  /**
   * check if the phone number is valid and that no other activist has the same phone number
   */
  private function isValidPhoneNumber()
  {
    if (!is_null($this->phoneNumber)) {
      if (!is_numeric($this->phoneNumber))
        throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));

      if (!Helper::isIsraelMobilePhone($this->phoneNumber))
        throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_VALID_PHONE'));

      // Checking if another activists have the same phone number
      $otherActivistObj = ElectionRolesByVotersRepository::getOtherActivistByPhoneNumber($this->electionRoleByVoter->voter_id, $this->phoneNumber, $this->electionRoleByVoter->election_campaign_id);
      if (!is_null($otherActivistObj))
        throw new Exception(config('errors.elections.ANOTHER_ACTIVIST_OWNS_THAT_PHONE'));
    }
  }

  /**
   * The function checks if the shift contradicts another existing shift in the active
   * only if the activist role is update shift role
   */
  private function isValidShiftRole()
  {
    if (!is_null($this->shiftRole)) {
      $electionRoleVoter = ActivistsAllocationsAssignmentsRepository::getElectionRoleVoterDetailsByAssignment($this->activistAllocationAssignment->id);
      $hasDuplicateShift = ActivistsAllocationsAssignmentsService::checkIfVoterHasDuplicateShift(
        $electionRoleVoter->voter_id,
        $this->shiftRole->id,
        $electionRoleVoter->election_campaign_id,
        $this->activistAllocationAssignment->id
      );

      if ($hasDuplicateShift)
        throw new Exception(config('errors.elections.ERROR_ASSIGNMENT_SHIFT_ROLE_VOTER'));
    }
  }
    
}
