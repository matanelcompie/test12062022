<?php

namespace App\Extensions;

use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\EloquentUserProvider as EloquentUserProvider;
use Illuminate\Support\Facades\DB;
use Log;

class ActivistUserProvider extends EloquentUserProvider
{

    public function retrieveByCredentials(array $credentials)
    {
        return $this->getUserActivist($credentials);
    }


    public function getUserActivist($credentials, $checkCode = null)
    {
        $personalIdentity = ltrim($credentials['personal_identity'], '0');
        $code = $credentials['code'];
        $checkCode = isset($credentials['checkCode']) ? $credentials['checkCode'] : false;
        $applicationType = isset($credentials['application_type']) ? $credentials['application_type'] : false;
        $user = null;
        switch ($applicationType) {
            case 'global':
                $user = $this->getActivistUserGlobalApplication($personalIdentity, $code, $credentials, $checkCode);
                break;

            default:
                $user = $this->getActivistUserElectionRolesLogin($personalIdentity, $code, $credentials, $checkCode);
                break;
        }

        return $user;
    }

    private static function checkDevLogin($personalIdentity, $code)
    {
        $isDevUser = ($personalIdentity == env('allow_apps_dev_personal_id_1') || $personalIdentity == env('allow_apps_dev_personal_id_2'));

        if ($isDevUser && $code == env('dev_code')) {
            return true;
        }
    }

    private static function getActivistUserElectionRolesLogin($personalIdentity, $code = null, $credentials, $checkCode = false)
    {
        $currentCampaign =  ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;
        $roleKey = $credentials['role_key'];

        $fields = [
            'users.id', 'election_roles_by_voters.phone_number as activist_phone_number',
            'users.activist_sms_code', 'users.activist_sms_code_date', 'voters.first_name', 'voters.last_name'
        ];
        $electionRole = ElectionRoles::where('key', $roleKey)->first();

        $isBallotRole = in_array($electionRole->system_name, config('constants.activists.ballot_elections_roles_names'));

        $ACTIVISTS_SYSTEM_DEV_MODE = env('ACTIVISTS_SYSTEM_DEV_MODE', false);
        if ($isBallotRole && !$ACTIVISTS_SYSTEM_DEV_MODE) {
            $isCounterRole = $electionRole->system_name == config('constants.activists.election_role_system_names.counter');
            $ifValidVoteTime = ElectionCampaigns::checkIfElectionDayArrival(false, $isCounterRole, $currentCampaign);
            if (!$ifValidVoteTime) {
                return false;
            }
        }
        $userActivist = User::select($fields)
            ->withVoter()
            ->withElectionRoleByVoter($currentCampaignId, $electionRole->id)
            ->where('voters.personal_identity', $personalIdentity);
        // dd($credentials, $userActivist->first(), $personalIdentity, $currentCampaignId, $roleId);

        if ($checkCode) {
            $isDevLogin = self::checkDevLogin($personalIdentity, $code);
            if (!$isDevLogin) {
                $userActivist->where('activist_sms_code', $code);
            }
        }

        return $userActivist->first();
    }

    private  function getActivistUserGlobalApplication($personalIdentity, $code, $credentials, $checkCode)
    {

        $user = UserRepository::getUserCanEnterToWebSiteByPasswordAndPersonalIdentity($personalIdentity);
        if (!$user)
            return false;
        if ($checkCode && $user->sms_code != $code)
            return false;
        //check password
        if ($this->validateCredentials($user, $credentials))
            return $user;
        return false;
    }
}
