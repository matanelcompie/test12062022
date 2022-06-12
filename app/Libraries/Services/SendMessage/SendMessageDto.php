<?php

namespace App\Libraries\Services\SendMessage;

use App\Enums\CommonEnum;
use App\Enums\MessageTemplate;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use Doctrine\DBAL\Schema\Constraint;
use Exception;

class SendMessageDto
{

    public $voter_id;
    /**
     * value if the type of message is emil or sms and ivr
     * @var int | CommonEnum - 1 true, 0 false
     */
    public $isPhoneMessage;
    

    public $sendEmailIncludePhoneMessage;

    /**
     * message entity type from MessageEntityType enum -voter/request/activist
     *
     * @var int
     */
    public $messageEntityType;


    /**
     * value id of entity by type voter or request or election role voter
     *
     * @var int
     */
    public $messageEntityTypeValue;

    /**
     * @var string | MessageTemplate enum
     */
    public $messageTemplate;

    /**
     * The end message that send with dynamic value
     * @var string
     */
    public $messageText;


    /**
     * @var string |MessageTemplate  enum for message type email only in message type email
     */
    public $subjectTemplateMessage;

    /**
     * The end subject that send with dynamic value only in message type email
     * @var string
     */
    public $subjectText;


    /**
     * dynamic value for include in message text
     * array[{nameField}] = dynamic value
     * @var array
     */
    public $dynamicValuesMessage;


    /**
     * @var string
     */
    public $phoneNumber;


    /**
     * @var string | only of message type email
     */

    public $email;

    /**
     * name of specific email blade if not 
     *
     * @var string
     */
    public $emailBlade;


    public $waitToResponse;

    /**
     * special ivr type with data that send to astriks system 
     *
     * @var string |enum ivr type
     */
    public $specialIvrType;

    public function validation()
    {
        if (!$this->isPhoneMessage && $this->isPhoneMessage!=0)
            throw new Exception(config('errors.system.ERROR_NOT_EXIST_IN_MESSAGE_EMAIL'));

        if ($this->isPhoneMessage == CommonEnum::NO || $this->sendEmailIncludePhoneMessage == CommonEnum::YES) {
            if (!$this->email)
                throw new Exception(config('errors.system.ERROR_NOT_EMAIL_EXIST_IN_SEND_MESSAGE'));

            if (!$this->subjectTemplateMessage)
                throw new Exception(config('errors.system.ERROR_SUBJECT_EXIST_IN_EMAIL_MESSAGE'));
        }

        if ($this->isPhoneMessage == CommonEnum::YES && !$this->phoneNumber) {
            throw new Exception(config('errors.system.ERROR_NOT_PHONE_NUMBER_EXIST_IN_SEND_MESSAGE'));
        }

        if (!$this->messageEntityType) {
            throw new Exception(config('errors.system.ERROR_NOT_EXIST_MESSAGE_ENTITY_TYPE'));
        }

        if (!$this->messageEntityTypeValue) {
            throw new Exception(config('errors.system.ERROR_NOT_EXIST_MESSAGE_TEMPLATE_VALUE'));
        }

        if (!$this->messageTemplate) {
            throw new Exception(config('errors.system.ERROR_NOT_EXIST_MESSAGE_TEMPLATE'));
        }

        if ($this->specialIvrType && !$this->dynamicValuesMessage) {
            throw new Exception(config('errors.system.ERROR_DATA_IN_SPECIAL_IVR'));
        }
    }
}
