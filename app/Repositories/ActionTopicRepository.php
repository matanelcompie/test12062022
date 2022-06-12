<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\Action;
use App\Models\ActionTopic;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Teams;
use App\Models\User;
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

class ActionTopicRepository
{
    /**
     * function get string system name from ActionTopic enum ad return ActionTopic model
     * @throws Exception
     * @param string | enum ActionTopic $systemName
     * @return ActionTopic
     */
    public static function getBySystemName($systemName)
    {
        $actionTopic = ActionTopic::select('id', 'system_name')
            ->where('system_name', $systemName)
            ->first();
        if (!$actionTopic)
            throw new Exception(config('errors.crm.MISSING_ACTION_TOPIC_SYSTEM_NAME'));

        return $actionTopic;
    }
}
