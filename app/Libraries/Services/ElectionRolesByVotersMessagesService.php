<?php

namespace App\Libraries\Services;

use App\Models\ElectionRolesByVotersMessages;
use App\Libraries\Helper;


class ElectionRolesByVotersMessagesService {

    public static function sendMessageToActivist($messageArgs) {
        $verified_status_name = isset($messageArgs['verified_status_name']) ? $messageArgs['verified_status_name'] : 'MESSAGE_SENT';
        $electionRolesByVotersMessages = new ElectionRolesByVotersMessages;
        $electionRolesByVotersMessages->key = Helper::getNewTableKey('election_role_by_voter_messages', 10);
        $electionRolesByVotersMessages->election_role_by_voter_id = $messageArgs['election_role_by_voter_id'];
        $electionRolesByVotersMessages->direction = config('constants.activists.messageDirections.OUT');
        $electionRolesByVotersMessages->text = $messageArgs['text'];
        $electionRolesByVotersMessages->phone_number = $messageArgs['phone_number'];

        $electionRolesByVotersMessages->verified_status = config("constants.activists.verified_status.$verified_status_name" );
        $electionRolesByVotersMessages->save();

        return $electionRolesByVotersMessages;
    }
}