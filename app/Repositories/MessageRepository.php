<?php

namespace App\Repositories;

use App\Enums\MessageEntityType;
use App\Enums\MessageType;
use App\Libraries\Helper;
use App\Models\Message;
use DB;
use Log;

/**
 * repository class on send mail
 */
class MessageRepository
{
    public static function getMessageByVoterIdAndMessageEntityType($voterId, $messageEntityType)
    {
        $queryMessageEntity = self::getQueryMessageByVoterIdAndType($voterId, $messageEntityType);

        switch ($messageEntityType) {
            case MessageEntityType::ENTITY_TYPE_REQUEST:
                $queryMessageEntity->addSelect(['requests.key as reqKey'])
                ->withRequest()
                    ->where(function ($q) use ($voterId) {
                        $q->where('requests.voter_id', $voterId)
                        ->orWhere('messages.voter_id', $voterId);
                    });
                break;
            case MessageEntityType::ENTITY_TYPE_VOTER:
                $queryMessageEntity->where('entity_id', $voterId);
                break;
            case MessageEntityType::ENTITY_TYPE_ACTIVIST:
                $queryMessageEntity
                    ->addSelect(['election_roles_by_voters.key as election_roles_by_voters_key'])
                    ->withRoleVoter()
                    ->where('election_roles_by_voters.voter_id', $voterId);
                break;

            default:
                break;
        }

        return $queryMessageEntity->get();
    }


    private static function getQueryMessageByVoterIdAndType($voterId, $messageEntityType)
    {
        $messageFields = [DB::raw('messages.*')];
        return Message::select($messageFields)
            ->where('entity_type', $messageEntityType)
            ->where(function ($q) use ($voterId) {
                $q->whereNull('messages.voter_id')
                    ->orWhere('messages.voter_id', $voterId);
            })
            ->orderBy('id', 'DESC');
    }

    public static function getMessageByEntityTypeAndKeyEntity($messageEntityType, $entityKey)
    {

        switch ($messageEntityType) {
            case MessageEntityType::ENTITY_TYPE_REQUEST:
                return self::getRequestMessageByKeyRequest($entityKey);
                break;
            case MessageEntityType::ENTITY_TYPE_VOTER:
                return self::getVoterVoterMessageByKeyVoter($entityKey);
                break;
            case MessageEntityType::ENTITY_TYPE_ACTIVIST:
                return self::getActivistMessageByElectionRoleVoterKey($entityKey);
                break;
            default:
                break;
        }
    }

    private static function getRequestMessageByKeyRequest($requestKey)
    {
        $messageFields = [DB::raw('messages.*')];
        return Message::select($messageFields)
            ->withRequest()
            ->where('messages.entity_type', MessageEntityType::ENTITY_TYPE_REQUEST)
            ->where('requests.key', $requestKey)
            ->where(function ($q) {
                $q->whereRaw('requests.voter_id = messages.voter_id')
                ->orWhereNull('messages.voter_id');
            })
            ->orderBy('id', 'DESC')
            ->get();
    }

    private static function getVoterVoterMessageByKeyVoter($voterKey)
    {
        $messageFields = [DB::raw('messages.*')];
        return Message::select($messageFields)
            ->withVoter()
            ->where('messages.entity_type', MessageEntityType::ENTITY_TYPE_VOTER)
            ->where('voters.key', $voterKey)
            ->orderBy('id', 'DESC')
            ->get();
    }

    private static function getActivistMessageByElectionRoleVoterKey($electionRoleVoterKey)
    {
        $messageFields = [DB::raw('messages.*')];
        return Message::select($messageFields)
            ->withRoleVoter()
            ->where('messages.entity_type', MessageEntityType::ENTITY_TYPE_ACTIVIST)
            ->where('election_roles_by_voters.key', $electionRoleVoterKey)
            ->orderBy('id', 'DESC')
            ->get();
    }
}
