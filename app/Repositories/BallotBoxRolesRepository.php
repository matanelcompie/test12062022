<?php

namespace App\Repositories;

use App\Enums\ElectionRoleShiftSystemName;
use App\Enums\ElectionRoleSystemName;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\BallotBoxRole;
use App\Models\BallotBoxRoles;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
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

class BallotBoxRolesRepository
{
    public static function getArrBallotBoxRoleByArrSystemName($arrSystemNameBallotRole)
    {
        $arrBallotBoxRole = BallotBoxRole::select()->whereIn('system_name', $arrSystemNameBallotRole)->get();
        $arrBallotBoxRoleId =  $arrBallotBoxRole->map(function ($role) {
            return $role->id;
        });
        return $arrBallotBoxRoleId;
    }

    /**
     * @throws Exception
     * @return BallotBoxRole
     */
    public static function getByKey($key)
    {
        $ballotBoxRole = BallotBoxRole::select()->where('key', $key)->first();
        if (!$ballotBoxRole)
            throw new Exception(config('errors.elections.ERROR_BALLOT_ROLE_ID'));

        return $ballotBoxRole;
    }

    /**
     * @throws Exception
     * @return BallotBoxRole
     */
    public static function getById($id)
    {
        $ballotBoxRole = BallotBoxRole::select()->where('id', $id)->first();
        if (!$ballotBoxRole)
            throw new Exception(config('errors.elections.ERROR_BALLOT_ROLE_ID'));

        return $ballotBoxRole;
    }

    /**
     * @param string $ballotRoleSystemName
     * @return ElectionRoles
     */
    public static function getElectionRoleByBallotRoleSystemName($ballotRoleSystemName)
    {
        switch ($ballotRoleSystemName) {
            case 'observer':
                $electionRoleSystemName = ElectionRoleSystemName::OBSERVER;
                break;
            case 'counter':
                $electionRoleSystemName = ElectionRoleSystemName::COUNTER;
                break;
            default:
                $electionRoleSystemName = ElectionRoleSystemName::BALLOT_MEMBER;
        }

        return ElectionRolesRepository::getBySystemName($electionRoleSystemName);
    }

}
