<?php

namespace App\Repositories;

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

class ElectionRolesRepository
{
    public static function getList()
    {
        return ElectionRoles::select()
            ->where('deleted', 0)
            ->get();
    }

    public static function getElectionRoleByKey($roleKey)
    {
        $electionRole = ElectionRoles::select()->where('key', $roleKey)->first();
        if (!$electionRole)
            throw new Exception(config('errors.elections.ERROR_ELECTION_ROLE_ID'));
        return  $electionRole;
    }

    public static function getElectionRoleById($roleId)
    {
        $electionRole = ElectionRoles::select()->where('id', $roleId)->first();
        if (!$electionRole)
            throw new Exception(config('errors.elections.ERROR_ELECTION_ROLE_ID'));
        return  $electionRole;
    }

    public static function getSystemNameById($electionRoleId)
    {
        $electionRole = self::getElectionRoleById($electionRoleId);
        return  $electionRole->system_name;
    }

    /**
     * @throws Exception
     * @param string $systemName
     * @return ElectionRoles
     */
    public static function getBySystemName($systemName)
    {
        $electionRole = ElectionRoles::select()->where('system_name', $systemName)->first();
        if (!$electionRole)
            throw new Exception(config('errors.elections.ELECTION_ROLE_KEY_DOES_NOT_EXIST'));
        return  $electionRole;
    }

    /**
     * @param string $systemNameArray
     * @return ElectionRoles[]
     */
    public static function getBySystemNameArray($systemNameArray)
    {
        return ElectionRoles::select()->whereIn('system_name', $systemNameArray)->get();
    }

    public static function getHashElectionRole($fieldKeyHash = null)
    {
        if (!$fieldKeyHash)
            $fieldKeyHash = 'id';
        $electionRole = self::getList();
        return Helper::makeHashCollection($electionRole, $fieldKeyHash);
    }

    public static function getBallotRolesSystemName()
    {
        return [
            ElectionRoleSystemName::BALLOT_MEMBER,
            ElectionRoleSystemName::COUNTER,
            ElectionRoleSystemName::OBSERVER,
        ];
    }
    public static function getClusterRolesSystemName()
    {
        return [
            ElectionRoleSystemName::CLUSTER_LEADER,
            ElectionRoleSystemName::DRIVER,
            ElectionRoleSystemName::MINISTER_OF_FIFTY,
        ];
    }

    public static function getQuarterRolesSystemName()
    {
        return [
            ElectionRoleSystemName::QUARTER_DIRECTOR,
            ElectionRoleSystemName::DRIVER,
        ];
    }

    public static function getCityRolesSystemName()
    {
        return [
            ElectionRoleSystemName::ELECTION_GENERAL_WORKER,
            ElectionRoleSystemName::DRIVER,
            ElectionRoleSystemName::DRIVERS_COORDINATOR,
            ElectionRoleSystemName::MINISTER_OF_FIFTY,
            ElectionRoleSystemName::MOTIVATOR,
            ElectionRoleSystemName::MOTIVATOR_COORDINATOR,
            ElectionRoleSystemName::MUNI_DIRECTOR,
            ElectionRoleSystemName::MUNI_SECRETARY,
            ElectionRoleSystemName::OPTIMIZER_COORDINATOR,

        ];
    }

 
}
