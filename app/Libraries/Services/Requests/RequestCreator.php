<?php

namespace App\Libraries\Services\Requests;

use App\Enums\CommonEnum;
use App\Enums\MessageEntityType;
use App\Enums\MessageTemplate;
use App\Libraries\Services\SendMessage\SendEmailMessageDto;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Libraries\Services\ServicesModel\VoterPhoneService;
use App\Models\CrmRequest;
use App\Models\Teams;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\TeamRepository;
use App\Repositories\UserPhonesRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use stdClass;

class RequestCreator
{

  public static function sendSmsToRequest(CrmRequest $request)
  {
    self::sendMessageCreateRequestToManagerTeams($request);
    self::sendMessageCreateRequestToHandlerRequest($request);
  }

  public static function sendMessageCreateRequestToManagerTeams(CrmRequest $request)
  {
    $teamDetails = TeamRepository::getById($request->team_handler_id);
    $phoneNumber = UserPhonesRepository::getMobilePhoneNumberByUserId($teamDetails->leader_id);
    $topicId = $request->sub_topic_id ?? $request->topic_id;
    $request_topic_name = RequestTopicsRepository::getNameById($topicId);

    //Cancel send sms for team leader  if the handler and team leader are the same person
    if ($teamDetails->leader_id == $request->user_handler_id)
      return;

    $voter = VotersRepository::getVoterByUserId($teamDetails->leader_id);
    $data = [
      'request_key' => $request->key,
      'request_topic_name' => $request_topic_name,
      'first_name' => $voter->first_name,
      'last_name' => $voter->last_name
    ];

    $sendMessage = new SendMessageDto();
    $sendMessage->voter_id = $voter->id;
    $sendMessage->isPhoneMessage = CommonEnum::YES;
    $sendMessage->messageTemplate = MessageTemplate::USER_HANDLER_CREATE_REQUEST;
    $sendMessage->phoneNumber = $phoneNumber;
    $sendMessage->dynamicValuesMessage = $data;
    $sendMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
    $sendMessage->messageEntityTypeValue = $request->id;
    $sendMessage->waitToResponse = CommonEnum::NO;

    if ($voter->email) {
      $sendMessage->sendEmailIncludePhoneMessage = CommonEnum::YES;
      $sendMessage->subjectTemplateMessage = MessageTemplate::USER_HANDLER_CREATE_REQUEST_SUBJECT;
      $sendMessage->email = $voter->email;
      $sendMessage->dynamicValuesMessage = $data;
    }

    SendMessageService::sendMessage($sendMessage);
  }

  public static function sendMessageCreateRequestToHandlerRequest(CrmRequest $request)
  {
    $phoneNumber = UserPhonesRepository::getMobilePhoneNumberByUserId($request->user_handler_id);
    $voter = VotersRepository::getVoterByUserId($request->user_handler_id);
    $topicId = $request->sub_topic_id ?? $request->topic_id;
    $request_topic_name = RequestTopicsRepository::getNameById($topicId);
    $data = [
      'request_key' => $request->key,
      'request_topic_name' => $request_topic_name,
      'first_name' => $voter->first_name,
      'last_name' => $voter->last_name
    ];

    $sendMessage = new SendMessageDto();
    $sendMessage->voter_id = $voter->id;
    $sendMessage->isPhoneMessage = CommonEnum::YES;
    $sendMessage->messageTemplate = MessageTemplate::USER_HANDLER_CREATE_REQUEST;
    $sendMessage->phoneNumber = $phoneNumber;
    $sendMessage->dynamicValuesMessage = $data;
    $sendMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
    $sendMessage->messageEntityTypeValue = $request->id;
    $sendMessage->waitToResponse = CommonEnum::NO;

    if ($voter->email) {
      $sendMessage->sendEmailIncludePhoneMessage = CommonEnum::YES;
      $sendMessage->subjectTemplateMessage = MessageTemplate::USER_HANDLER_CREATE_REQUEST_SUBJECT;
      $sendMessage->email = $voter->email;
    }

    SendMessageService::sendMessage($sendMessage);
  }

  /**
   * save voter phone from request source phone number only if the phone not belong to another voter
   * @return void
   */
  public static function saveVoterPhoneForOtherTypeRequest($voterId, $phoneNumber)
  {
    if (!VoterPhoneRepository::isPhoneNumberBelongdifferentHouHoldVoter($phoneNumber, $voterId));
    VoterPhoneRepository::updateVerifiedOrInsertIfNotExist($phoneNumber, $voterId);
  }
}
