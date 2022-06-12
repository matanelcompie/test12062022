<?php

namespace App\Libraries\Services\SendMessage;

use App\API\Ivr\IvrManager;
use App\Enums\CommonEnum;
use App\Enums\IvrType;
use App\Enums\MessageDirection;
use App\Enums\MessageType;
use App\Enums\SendMessageStatus;
use App\Libraries\Helper;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Mail\GeneralEmail;
use App\Mail\ResetUserPassword;
use App\Models\Message;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Ivr;
use phpDocumentor\Reflection\Types\Boolean;
use Sms;

class SendMessageService
{
  /**
   *  Get details of message .
   *  send ivr/sms/email by details
   * @param SendMessageDto $sendMessage
   * @return void
   */
  public static function sendMessage(SendMessageDto $sendMessage)
  {
    if (!env("SEND_MESSAGE_ENABLED")) {
      return false;
    }
    $sendMessage->validation();
    $template = trans('messages.sms.' . $sendMessage->messageTemplate);
    $sendMessage->messageText = self::insertDynamicValuesMessageInTemplate($template, $sendMessage->dynamicValuesMessage);
    $sendCode = SendMessageStatus::SUCCESS;
    if ($sendMessage->isPhoneMessage == CommonEnum::YES) {
      if (Helper::isKosherPhone($sendMessage->phoneNumber)) {
        $sendCode = self::sendIvrMessage($sendMessage);
      } else {
        $sendCode = self::sendSmsMessage($sendMessage);
      }
    }

    if ($sendMessage->isPhoneMessage == CommonEnum::NO || $sendMessage->sendEmailIncludePhoneMessage == CommonEnum::YES) {
      self::sendEmailMessage($sendMessage);
    }

    return $sendCode;
  }

  private static function insertDynamicValuesMessageInTemplate($template, $dynamicValuesMessage)
  {
    //extract dynamic field
    $nameDynamicField = array_keys($dynamicValuesMessage);
    //extract dynamic value field
    $valueDynamicField = array_values($dynamicValuesMessage);
    $nameDynamicField = array_map(function ($field) {
      return '[' . $field . ']';
    }, $nameDynamicField);

    return str_replace($nameDynamicField, $valueDynamicField, $template);
  }

  private static function sendIvrMessage(SendMessageDto $sendMessage)
  {
    $sendCode = null;
    if (\Lang::has('messages.ivr_voice.' . $sendMessage->messageTemplate))
      $templateIvr = trans('messages.ivr_voice.' . $sendMessage->messageTemplate);
    else
      $templateIvr = trans('messages.ivr.' . $sendMessage->messageTemplate);

    $templateTextIvr = self::insertDynamicValuesMessageInTemplate($templateIvr, $sendMessage->dynamicValuesMessage);
    if ($sendMessage->specialIvrType) {
      $sendCode = self::sendSpecialIvr($sendMessage, $templateTextIvr);
    } else {
      $sendCode = Ivr::send($sendMessage->phoneNumber, $templateTextIvr, IvrType::TYPE_DEFAULT, null);
    }
    if ($sendCode) {
      self::CreateDocumentationForSendingMessage($sendMessage, MessageType::MESSAGE_TYPE_IVR, $sendMessage->phoneNumber);
    }

    return $sendCode ? SendMessageStatus::SUCCESS : SendMessageStatus::FAIL;
  }

  /**
   *
   * @param SendMessageDto $sendMessage
   * @return boolean
   */
  private static function sendSmsMessage(SendMessageDto $sendMessage)
  {
    $sendMessageStatus = (Sms::send($sendMessage->phoneNumber, $sendMessage->messageText, $sendMessage->waitToResponse)) ? SendMessageStatus::SUCCESS : SendMessageStatus::FAIL;
    self::CreateDocumentationForSendingMessage($sendMessage, MessageType::MESSAGE_TYPE_SMS, $sendMessage->phoneNumber);
    return $sendMessageStatus;
  }


  private static function sendEmailMessage(SendMessageDto $sendMessage)
  {
    //send general email template by subject and body
    $templateSubject = trans('messages.sms.' . $sendMessage->subjectTemplateMessage);
    $sendMessage->subjectText = self::insertDynamicValuesMessageInTemplate($templateSubject, $sendMessage->dynamicValuesMessage);


    if (!$sendMessage->emailBlade) {
      Mail::to($sendMessage->email)->send(new GeneralEmail($sendMessage->subjectText, $sendMessage->messageText));
    } else {
      //send email by specific blade
      $emailBladeUrl = 'App\\Mail\\' . $sendMessage->emailBlade;
      $emailBladeObject =  new $emailBladeUrl($sendMessage->dynamicValuesMessage);
      Mail::to($sendMessage->email)->send($emailBladeObject);
    }

    self::CreateDocumentationForSendingMessage($sendMessage, MessageType::MESSAGE_TYPE_EMAIL, $sendMessage->email);
  }

  /**
   * create message object model for add documentation of sending message
   *
   * @param SendMessageDto $sendMessage
   * @param integer $messageType | MessageType enum
   * @return Message
   */
  private static function CreateDocumentationForSendingMessage(SendMessageDto $sendMessage, int $messageType, $voter_communication_details)
  {
    $message = new Message();
    $message->key = Helper::getNewTableKey('messages', 10);
    $message->type = $messageType;
    $message->voter_id = $sendMessage->voter_id;
    $message->entity_type = $sendMessage->messageEntityType;
    $message->entity_id = $sendMessage->messageEntityTypeValue;
    $message->direction = MessageDirection::MESSAGE_DIRECTION_OUT;
    $message->subject = $sendMessage->subjectText;
    $message->body = $sendMessage->messageText;
    $message->voter_communication_details = $voter_communication_details;
    $message->save();
  }

  /**
   * Send ivr of TYPE_ACTIVIST_VERIFICATION or TYPE_VOTE_REPORTING
   *
   * @param SendMessageDto $sendMessage
   * @param string $templateIvr
   * @return bool if the ivr success send
   */
  private static function sendSpecialIvr(SendMessageDto $sendMessage, $templateIvr)
  {
    $TYPE_VOTE_REPORTING = ['first_name', 'last_name', 'ballot', 'city', 'city_name'];
    $ACTIVIST_VERIFICATION_FIELDS = ['first_name', 'last_name', 'role_name'];
    $arrDynamicField = array_keys($sendMessage->dynamicValuesMessage);
    $sendCode = false;
    if ($sendMessage->specialIvrType == IvrType::TYPE_ACTIVIST_VERIFICATION)
      $arrayField = $ACTIVIST_VERIFICATION_FIELDS;
    else if ($sendMessage->specialIvrType == IvrType::TYPE_VOTE_REPORTING)
      $arrayField = $TYPE_VOTE_REPORTING;


    if (!empty(array_intersect($arrDynamicField, $arrayField))) {
      $sendCode = Ivr::send($sendMessage->phoneNumber, $templateIvr, $sendMessage->specialIvrType, $sendMessage->dynamicValuesMessage);
    } else
      throw new Exception(config('errors.system.ERROR_DATA_IN_SPECIAL_IVR'));

    return  $sendCode;
  }

  public static function sendIvrVoiceToArrPhoneNumber()
  {
    $phoneNumbers = storage_path('\\app\\' . 'phoneNumbers.csv'); //."\\".$csvLocation;
    $originalFile = fopen($phoneNumbers, 'r');
    $arrPhone = array();
    while (($fileData = fgetcsv($originalFile)) !== false) {
      $phone = preg_replace('/\s+/', '', $fileData[0]);
      $phone = Helper::removeAllNoneNumericCharacters($phone); //tz captain
      $arrPhone[] = $phone;
    }
    fclose($originalFile);

    foreach ($arrPhone as $key => $phone) {
      Log::info('send:' . $phone);
    }
  }
}
