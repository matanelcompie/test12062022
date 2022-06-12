<?php

namespace App\Libraries\Services\ActivistsAllocationsAssignments;


use App\Libraries\Services\ElectionRolesByVoters\ElectionRoleByVoterUpdator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesVotersCreator;
use App\Models\VoterPhone;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class ActivistUpdator
{
    const TAG = "ActivistUpdator";

    /**
     * @var ActivistUpdateDto
     */

    public static function updateActivist(ActivistUpdateDto $activistUpdate)
    {
        try {
            DB::beginTransaction();
            $activistUpdate->validate();
            self::updateOtherPhones($activistUpdate);
            self::updateEmail($activistUpdate);
            $activistUpdate = ElectionRoleByVoterUpdator::update($activistUpdate);
            $activistUpdate = ActivistAllocationAssignmentUpdator::update($activistUpdate);
            $activistUpdate = ActivistRolePaymentUpdator::updateSumPaymentByActivistUpdateDto($activistUpdate);
            DB::commit();
            return $activistUpdate;
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }


    /**
     * save other phone if its was change
     *
     * @param ActivistUpdateDto $activistUpdate
     * @return void
     */
    private static function updateOtherPhones(ActivistUpdateDto $activistUpdate)
    {
        if (!is_null($activistUpdate->otherPhones)) {
            foreach ($activistUpdate->otherPhones as $key => $phone) {
                if (array_key_exists('isDelete', $phone) && $phone['isDelete'])
                VoterPhoneRepository::deleteById($phone['id']);
                else
                    VoterPhoneRepository::updateVerifiedOrInsertIfNotExist($phone['phone_number'], $activistUpdate->electionRoleByVoter->voter_id, true);
            }
        }
    }

    private static function updateEmail(ActivistUpdateDto $activistUpdate)
    {
        if (!is_null($activistUpdate->email)) {
            if ($activistUpdate->email == '') {
                $systemRoleRequireEmail = ElectionRolesVotersCreator::getElectionRolesSystemNameRequireEmail();
                $electionRoleSystemName = ElectionRolesRepository::getSystemNameById($activistUpdate->electionRoleByVoter->election_role_id);
                if (in_array($electionRoleSystemName, $systemRoleRequireEmail))
                    throw new Exception(config('errors.elections.ERROR_ROLE_REQUIRE_EMAIL'));
            }

            VotersRepository::updateEmail($activistUpdate->electionRoleByVoter->voter_id, $activistUpdate->email);
        }
    }
}
