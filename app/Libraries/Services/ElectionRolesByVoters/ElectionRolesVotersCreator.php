<?php

namespace App\Libraries\Services\ElectionRolesByVoters;

use App\Enums\ElectionRoleSystemName;
use App\Enums\SendMessageType;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\ActivistsMessagesService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\TransportationCars;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\TransportationCarsRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use App\Repositories\VotersWithCaptainsOfFiftyRepository;
use App\Repositories\VoterTransportationRepository;
use Auth;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Request;
use stdClass;

class ElectionRolesVotersCreator
{

    const TAG = "ElectionRolesVotersCreator";

    /**
     * function create election role voter and user with permission by election role if not exist
     *
     * @param ActivistCreateDto $activistCreateDto
     * @throws Exception
     * @return ElectionRolesByVoters
     */
    public static function createActivistRole(ActivistCreateDto $activistCreateDto)
    {
        self::checkPermissionAddElectionRoleVoter($activistCreateDto->electionRole->system_name);
        //Check if voter has other duplicate role and get details voter by key. 
        self::checkDuplicateRoleBeforeInsertRoleVoter($activistCreateDto->voter->id, $activistCreateDto->electionCampaign->id, $activistCreateDto->electionRole->system_name);
        $electionRoleVoter = self::getOrCreateElectionRoleByVoter($activistCreateDto);
        self::saveEmailAndOtherPhones($activistCreateDto);
        UserCreator::getOrCreateUserByElectionRole($activistCreateDto->voter->id, $activistCreateDto->electionRole->system_name, $activistCreateDto->city->id);
        ActivistsMessagesService::sendMessageActivistAssignedRoleConfirm($activistCreateDto);
        return $electionRoleVoter;
    }


    public static function checkDuplicateRoleBeforeInsertRoleVoter($voterId, $campaignId, $roleSystemName)
    {
        $VoterDetailsDuplicate = ElectionRolesByVotersRepository::getDetailsDuplicateRoleVoter($voterId, $campaignId, $roleSystemName);
        if (!$VoterDetailsDuplicate)
            throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));

        $duplicateElectionRole = $VoterDetailsDuplicate->other_election_roles_by_voters_id;

        if ($duplicateElectionRole)
            throw new Exception(config('errors.elections.ELECTION_ROLE_DUPLICATES_FOR_ACTIVIST'));

        return $VoterDetailsDuplicate;
    }


    private static function checkPermissionAddElectionRoleVoter($roleSystemName)
    {

        $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();

        $addPermission = 'elections.activists.' . $roleSystemName . '.add';
        if (!UserPermissionManager::isAdminUser() && !isset($permissionsHash[$addPermission])) {
            if ($roleSystemName != config('constants.activists.election_role_system_names.driver'))
                throw new Exception(config('errors.system.NO_PERMISSION'));

            else if (!isset($permissionsHash['elections.transportations.edit']))
                throw new Exception(config('errors.system.NO_PERMISSION'));
        }
    }

    private static function getOrCreateElectionRoleByVoter(ActivistCreateDto $activistCreateDto)
    {

        $activistCreateDto->electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleVoterByVoterIdAndRoleId(
            $activistCreateDto->voter->id,
            $activistCreateDto->electionRole->id,
            $activistCreateDto->electionCampaign->id
        );

        if (!$activistCreateDto->electionRoleByVoter) {
            $ElectionRoleByVoter = new ElectionRolesByVoters;
            $ElectionRoleByVoter->election_campaign_id = $activistCreateDto->electionCampaign->id;
            $ElectionRoleByVoter->voter_id = $activistCreateDto->voter->id;
            $ElectionRoleByVoter->election_role_id = $activistCreateDto->electionRole->id;
            $ElectionRoleByVoter->phone_number = $activistCreateDto->phoneNumber;
            $ElectionRoleByVoter->comment = $activistCreateDto->comment;
            $ElectionRoleByVoter->user_create_id = AuthService::getUserId();
            $ElectionRoleByVoter->user_update_id = AuthService::getUserId();
            $ElectionRoleByVoter->assigned_city_id = $activistCreateDto->city->id;
            $ElectionRoleByVoter->allocation_removed_time = Carbon::now()->toDateTimeString();
            $ElectionRoleByVoter->instructed = $activistCreateDto->instructed;
            $ElectionRoleByVoter->key = Helper::getNewTableKey('election_roles_by_voters', 5);


            if ($activistCreateDto->sendSms == SendMessageType::SEND_IN_SPECIFIC_DAY) {
                $ElectionRoleByVoter->day_sending_message = $activistCreateDto->daySendingMessage;
            }

            $ElectionRoleByVoter->save();
            $activistCreateDto->electionRoleByVoter = $ElectionRoleByVoter;
            self::handleNewDriverActivist($activistCreateDto);
        } else {
            $activistCreateDto->electionRoleByVoter->phone_number = $activistCreateDto->phoneNumber;
            $activistCreateDto->electionRoleByVoter->comment = $activistCreateDto->comment;
            self::handleNewAssignmentForExistDriverActivist($activistCreateDto);
        }

        return $activistCreateDto->electionRoleByVoter;
    }

    /**
     * function check if activist is driver after insert activist for create transportation cars details
     * @param ActivistCreateDto $ActivistCreateDto
     * @return void
     */
    private static function handleNewDriverActivist(ActivistCreateDto $ActivistCreateDto)
    {
        $systemNameActivist = $ActivistCreateDto->electionRole->system_name;

        if ($systemNameActivist == config('constants.activists.election_role_system_names.driver')) {
            TransportationCarsRepository::add($ActivistCreateDto);
        }
    }

    /**
     * function check if activist is driver and update details car
     * @param ActivistCreateDto $ActivistCreateDto
     * @return void
     */
    private static function handleNewAssignmentForExistDriverActivist(ActivistCreateDto $activistCreateDto)
    {
        $systemNameActivist = $activistCreateDto->electionRole->system_name;

        if ($systemNameActivist == config('constants.activists.election_role_system_names.driver')) {
            TransportationCarsRepository::updateOrCreateIfNotExist(
                $activistCreateDto->electionRoleByVoter->id,
                $activistCreateDto->carNumber,
                $activistCreateDto->carType,
                $activistCreateDto->passengerCount
            );
        }
    }


    private static function saveEmailAndOtherPhones(ActivistCreateDto $ActivistCreateDto)
    {
        if (!is_null($ActivistCreateDto->email))
            VotersRepository::updateEmail($ActivistCreateDto->voter->id, $ActivistCreateDto->email);

        if (!is_null($ActivistCreateDto->otherPhones)) {
            foreach ($ActivistCreateDto->otherPhones as $key => $phone) {
                VoterPhoneRepository::updateVerifiedOrInsertIfNotExist($phone, $ActivistCreateDto->voter->id,true);
            }
        }
    }

    public static function getElectionRolesSystemNameRequireEmail()
    {
        return  [
            ElectionRoleSystemName::QUARTER_DIRECTOR
        ];
    }
}
