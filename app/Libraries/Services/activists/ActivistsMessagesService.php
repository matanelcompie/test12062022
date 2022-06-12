<?php

namespace App\Libraries\Services\activists;

use App\API\Sms\Sms;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;
use App\Enums\CommonEnum;
use App\Enums\MessageEntityType;
use App\Enums\MessageTemplate;
use App\Enums\SendMessageStatus;
use App\Enums\SendMessageType;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ElectionRolesByVotersMessagesService;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Models\ElectionRoles;
use App\Repositories\ElectionRoleByVoterMessagesRepository;
use App\Repositories\ElectionRolesRepository;
use Log;

class ActivistsMessagesService {
    //Const Messages:
    private static $ANDROID_LINK_TEXT = ' מצורף קישור לכניסה לאפליקציית פעילים ';
    private static $MINI_SITE_LINK_TEXT = ' ובנוסף קישור לכניסה למערכת פעילים: ';

    public static function getApplicationLinkMsg($electionRoleName = null){
        $message =  env('ANDROID_APPLICATIONS_LINK');

        if(!is_null($electionRoleName)){
            $message =   (self::$ANDROID_LINK_TEXT ." \n ".  $message) ;
        } 
        if($electionRoleName == config('constants.activists.election_role_system_names.ministerOfFifty')){
            $miniSiteMsg = self::getMiniSiteLink();
            $message =  " $message \n $miniSiteMsg ";
        }
        return $message;
    }
    private static function getMiniSiteLink(){
        return self::$MINI_SITE_LINK_TEXT ." \n ". env('MUNI_LOGIN_BASE_URL');
    }

     
     public static function addMessageToHistory($messageId, $electionRoleId, $system_name, $msgText, $phoneNumber){

        $actionHistoryFieldsNames = [
            'election_role_by_voter_id' => config('history.ElectionRolesByVotersMessages.election_role_by_voter_id'),
            'direction' => config('history.ElectionRolesByVotersMessages.direction'),
            'text' => config('history.ElectionRolesByVotersMessages.text'),
            'phone_number' => config('history.ElectionRolesByVotersMessages.phone_number'),
        ];

        foreach ($actionHistoryFieldsNames as $item){

        }

        $historyArgsArr = [ 
            'topicName' => 'elections.activists.' . $system_name . '.edit',
            'models' => [],
        ];


        $actionHistoryFields = [];

        foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
            $actionInsertFields = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name, // display field name
            ];

            switch ($fieldName) {
                case 'election_role_by_voter_id':
                    $actionInsertFields['new_numeric_value'] = $electionRoleId;
                    break;
                case 'text':
                    $actionInsertFields['new_value'] = $msgText;
                    break;
                case 'phone_number':
                    $actionInsertFields['new_value'] = $phoneNumber;
                    break;
                case 'direction':
                    $actionInsertFields['new_value'] = 'יוצא';
                    $actionInsertFields['new_numeric_value'] = config('constants.activists.messageDirections.OUT');
                    break;
            }

            $actionHistoryFields[] = $actionInsertFields;
        }
        $historyArgsArr['models'][] = [
            'description' => 'שליחת הודעה לפעיל',
            'referenced_model' => 'ElectionRolesByVotersMessages',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
            'referenced_id' => $messageId,
            'valuesList' => $actionHistoryFields,
        ];
        ActionController::AddHistoryItem($historyArgsArr);
     }


    public static function sendMessageActivistAssignedRoleConfirm(ActivistCreateDto $activistCreateDto)
    {
        $dynamicValuesMessage = [
            'first_name' => $activistCreateDto->voter->first_name,
            'role_name' => $activistCreateDto->electionRole->name
        ];

        //if the activist is role ballot, check if the params sendSms is true
        if (in_array($activistCreateDto->electionRole->system_name, ElectionRolesRepository::getBallotRolesSystemName())) {
            if ($activistCreateDto->sendSms == CommonEnum::NO) {
                return;
            }
        }

        $sendMessage = new SendMessageDto();
        $sendMessage->voter_id = $activistCreateDto->voter->id;
        $sendMessage->isPhoneMessage = CommonEnum::YES;
        $sendMessage->messageTemplate = MessageTemplate::VERIFICATION_MESSAGE_TEXT;
        $sendMessage->phoneNumber = $activistCreateDto->phoneNumber;
        $sendMessage->dynamicValuesMessage = $dynamicValuesMessage;
        $sendMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_ACTIVIST;
        $sendMessage->messageEntityTypeValue = $activistCreateDto->electionRoleByVoter->id;

        $sendCode = SendMessageService::sendMessage($sendMessage);

        if ($sendCode == SendMessageStatus::SUCCESS) {
            ElectionRoleByVoterMessagesRepository::create(
                $activistCreateDto->electionRoleByVoter,
                config('constants.activists.messageDirections.OUT'),
                $sendMessage->messageText
            );
        }
    }
        
}