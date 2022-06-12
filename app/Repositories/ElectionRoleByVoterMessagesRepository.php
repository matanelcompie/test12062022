<?php

namespace App\Repositories;

use App\Enums\VerifiedStatus;
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
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesByVotersMessages;
use App\Models\ElectionRolesShiftsBudgets;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterTransportation;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ElectionRoleByVoterMessagesRepository
{
    /**
     * Create an object about information by sending the message to active
     *
     * @param ElectionRolesByVoters $electionRoleVoter
     * @param int $direction - config@messageDirections
     * @param string $text
     * @param string $verifiedStatusName config@verified_status
     * @return ElectionRolesByVotersMessages
     */
    public static function create(ElectionRolesByVoters $electionRoleVoter, $direction, $text, $verifiedStatus = VerifiedStatus::MESSAGE_SENT)
    {
        $electionRolesByVotersMessages = new ElectionRolesByVotersMessages();
        $electionRolesByVotersMessages->key = Helper::getNewTableKey('election_role_by_voter_messages', 10);
        $electionRolesByVotersMessages->election_role_by_voter_id = $electionRoleVoter->id;
        $electionRolesByVotersMessages->direction = $direction;
        $electionRolesByVotersMessages->text = $text;
        $electionRolesByVotersMessages->phone_number = $electionRoleVoter->phone_number;
        $electionRolesByVotersMessages->verified_status = $verifiedStatus;
        $electionRolesByVotersMessages->save();

        return $electionRolesByVotersMessages;
    }
}
