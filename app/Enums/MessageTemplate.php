<?php

namespace App\Enums;

abstract class MessageTemplate
{
    const VERIFICATION_MESSAGE_TEXT = 'verificationMessageText';
    const USER_HANDLER_CREATE_REQUEST = 'userHandlerRequest';
    const USER_HANDLER_CREATE_REQUEST_SUBJECT = 'userHandlerRequestSubject';
    const CLOSE_CRM_REQUEST = 'closeCrmRequest';
    const CLOSE_CRM_REQUEST_SUBJECT = 'closeCrmRequestSubject';
    const CANCRL_CRM_REQUEST = 'cancelCrmRequestSubject';
    const REQUEST_VOTER_MESSAGE_CLOSE_REQUEST = 'sendOfCloseRequestToVoterRequest';
    const VOTER_MESSAGE_ON_CREATE_REQUEST = 'voterMessageOnCreateRequest';
    const VOTER_MESSAGE_ON_CREATE_REQUEST_SUBJECT = 'voterMessageOnCreateRequestSubject';
}
