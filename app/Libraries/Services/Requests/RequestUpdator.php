<?php

namespace App\Libraries\Services\Requests;

use App\DTO\CrmRequestDto;
use App\Enums\ActionStatusHistory;
use App\Enums\ActionTopic as EnumsActionTopic;
use App\Enums\ActionTypeHistory;
use App\Enums\ActionTypes;
use App\Enums\CommonEnum;
use App\Enums\ActionEntityType;
use App\Enums\MessageEntityType;
use App\Enums\MessageTemplate;
use App\Enums\RequestAction;
use App\Enums\RequestSource;
use App\Enums\RequestStatusType;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\DocumentController;
//use App\Libraries\Helper;
//use App\Libraries\Services\SendMessage\SendEmailMessageDto;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
//use App\Libraries\Services\ServicesModel\VoterPhoneService;
//use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Models\Action;
use App\Models\ActionType;
//use App\Models\ActionHistoryTopic;
use App\Models\ActionTopic;
use App\Models\CrmRequest;
//use App\Models\RequestSource as ModelsRequestSource;
//use App\Models\Teams;
use App\Repositories\ActionRepository;
use App\Repositories\ActionTopicRepository;
use App\Repositories\CrmRequestCallBizRepository;
//use App\Repositories\CrmRequestPriorityRepository;
use App\Repositories\CrmRequestRepository;
use App\Repositories\RequestSourceRepository;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\TeamRepository;
use App\Repositories\TempVoterRepository;
use App\Repositories\UserPhonesRepository;
// use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;
use App\Libraries\Services\History\HistoryItemGenerator;
use Barryvdh\Debugbar\Facade as Debugbar;

class RequestUpdator
{
  /**
   * @var CrmRequest
   */
  private static $activeCrmRequest;
  /**
   * @var CrmRequestDto
   */
  private static $incomingCrmRequest;

  private static $historyArgsArr;

  private static $historyFields;
  private static $actionType;

  public static function update(CrmRequestDto $crmRequest)
  {
    try {
      DB::beginTransaction();
      self::$incomingCrmRequest = $crmRequest;
      self::$actionType = ActionType::where('system_name', '=', ActionTypes::REQUEST)->first();
      self::$activeCrmRequest = CrmRequestRepository::getRequestIncludeStatusNameByKey($crmRequest->crmRequestKey);
      self::$historyArgsArr = ['topicName' => 'crm.requests.edit', 'models' => []];

      if (self::$activeCrmRequest->request_status_type === RequestStatusType::REQUEST_STATUS_CLOSED) {
        if (Auth::user()->admin) {
          self::updateStatus();
        } else {
          $e = new Exception(config('errors.crm.REQUEST_NOT_ENOGH_PERMISSIONS_TO_SPECIAL_FIELDS_UPDATE'));
          Debugbar::addThrowable($e);
          throw $e;
        }
      }
      self::updateRequestDescription();
      self::updateTopic();
      self::updateSubTopic();
      self::updateRequestPriority();
      self::updateStatus();
      self::updateRequestSource();
      self::updateUploadFile();
      self::updateUserHandler();
      self::updateTeamHandler();
      self::updateRequestDate(); // @todo can this filled be updated
      self::updateTargetCloseDate();

      //@todo what is this updating since update the status of the request does not go through here
      self::newRequestAction();

      if (self::$activeCrmRequest->isDirty()) {
        self::$activeCrmRequest->user_update_id = Auth::user()->id;
        //$x = self::$activeCrmRequest->getDirty();
        self::createUpdateHistoryAction();

        // if we are updating only the description
        if (self::$historyFields) {
          self::$historyArgsArr['models'][] = HistoryItemGenerator::create([
            'description' => 'עדכון פעולה לפניה',
            'referenced' => [
              'model' => 'CrmRequest',
              'type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT')
            ],
            'entity' => self::$activeCrmRequest,
            'valueListType' => 'fields',
            'fields' => self::$historyFields
          ]);
        }
        self::$activeCrmRequest->touch();
        ActionController::AddHistoryItem(self::$historyArgsArr);
      }
      Debugbar::info('update success ' . json_encode(self::$historyFields, JSON_UNESCAPED_UNICODE));
      DB::commit();
      return  self::$activeCrmRequest;
    } catch (\Throwable $e) {
      DB::rollback();
      Debugbar::addThrowable($e);
      throw $e;
    }
  }

  private static function createUpdateHistoryAction()
  {

    $actionTopic = ActionTopicRepository::getBySystemName('request.update');
    $action = ActionRepository::insert(
      ActionEntityType::ENTITY_TYPE_REQUEST,
      self::$activeCrmRequest->id,
      self::$actionType->id,
      $actionTopic->id,
      'עדכון פעולה לפניה',
      '""',
      ActionStatusHistory::ACTION_STATUS_DONE
    );
    $historyArgsArr['models'][] = ActionRepository::createHistoryItemModel([
      'entity' => $action,
      'type' => ActionTypeHistory::EDIT,
      'description' => 'עדכון פעולה לפניה'
    ]);
  }

  private static function updateRequestDescription()
  {

    if (!self::$incomingCrmRequest->requestDescription || trim(self::$incomingCrmRequest->requestDescription) === '') {
      return;
    }

    self::$activeCrmRequest->description = self::$incomingCrmRequest->requestDescription;
    $currentAction = CrmRequestRepository::getRequestDescriptionAction(self::$activeCrmRequest->id);

    if (!$currentAction || ($currentAction->description === self::$incomingCrmRequest->requestDescription)) {
      return;
    }

    $actionTopic = ActionTopic::select('id', 'system_name')->where('system_name', 'request.description')->first();
    $currentActionDesc = '';
    $moreDetails = null;
    if ($currentAction) {
      $currentActionDesc =  $currentAction->description;
      $moreDetails = json_encode(['old_description' => $currentActionDesc]);
    }

    $action = ActionRepository::insert(
      ActionEntityType::ENTITY_TYPE_REQUEST,
      self::$activeCrmRequest->id,
      ActionTypeHistory::EDIT,
      $actionTopic->id,
      self::$incomingCrmRequest->requestDescription,
      $moreDetails,
      ActionStatusHistory::ACTION_STATUS_DONE
    );

    $historyArgsArr['models'][] = ActionRepository::createHistoryItemModel([
      'entity' => $action,
      'type' => ActionTypeHistory::EDIT,
      'description' => 'עדכון תוכן פעולה לפניה',
    ]);
  }

  private static function updateTopic()
  {
    if (!self::$incomingCrmRequest->requestTopic) {
      return;
    }
    if (!self::isThereEditPermission()) {
      return;
    }

    if (self::$activeCrmRequest->topic_id !== self::$incomingCrmRequest->requestTopic->id) {
      self::$historyFields['topic_id'] = [
        'display' => config('history.CrmRequest.topic_id'),
        'new' => self::$incomingCrmRequest->requestTopic->name,
        'old' => self::$activeCrmRequest->topic_name,
        'format' => 'string'
      ];
      self::$activeCrmRequest->topic_id = self::$incomingCrmRequest->requestTopic->id;
    }
  }

  private static function updateSubTopic()
  {
    if (!self::$incomingCrmRequest->requestTopic) {
      return;
    }
    if (!self::isThereEditPermission()) {
      return;
    }
    if (self::$activeCrmRequest->sub_topic_id !== self::$incomingCrmRequest->requestSubTopic->id) {
      self::$historyFields['sub_topic_id'] = [
        'display' => config('history.CrmRequest.sub_topic_id'),
        'new' => self::$incomingCrmRequest->requestSubTopic->name,
        'old' => self::$activeCrmRequest->sub_topic_name,
        'format' => 'string'
      ];
      self::$activeCrmRequest->sub_topic_id = self::$incomingCrmRequest->requestSubTopic->id;
    }
  }

  private static function updateStatus()
  {
    if (!self::$incomingCrmRequest->requestStatus) {
      return;
    }
    if (self::$activeCrmRequest->status_id === self::$incomingCrmRequest->requestStatus->id) {
      return;
    }
    self::$historyFields['status_id'] = [
      'display' => config('history.CrmRequest.status_id'),
      'new' => self::$incomingCrmRequest->requestStatus->name,
      'old' => self::$activeCrmRequest->request_status_name,
      'format' => 'string'
    ];
    self::$activeCrmRequest->status_id = self::$incomingCrmRequest->requestStatus->id;
  }

  private static function updateRequestPriority()
  {
    if (!self::$incomingCrmRequest->crmRequestPriority) {
      return null;
    }
    if (self::$activeCrmRequest->request_priority_id === self::$incomingCrmRequest->crmRequestPriority->id) {
      return;
    }
    self::$historyFields['request_priority_id'] = [
      'display' => config('history.CrmRequest.request_priority_id'),
      'new' => self::$incomingCrmRequest->crmRequestPriority->name,
      'old' => self::$activeCrmRequest->request_priority_name,
      'format' => 'string'
    ];
    self::$activeCrmRequest->request_priority_id = self::$incomingCrmRequest->crmRequestPriority->id;
  }

  private static function updateRequestSource()
  {
    if (!self::$incomingCrmRequest->requestSource) {
      return null;
    }
    if (self::$activeCrmRequest->request_source_id !== self::$incomingCrmRequest->requestSource->id) {
      self::resetLastRequestSourceField(self::$activeCrmRequest->request_source_id);
      self::$historyFields['request_source_id'] = [
        'display' => config('history.CrmRequest.request_source_id'),
        'new' => self::$incomingCrmRequest->requestSource->name,
        'old' => self::$activeCrmRequest->request_source_name,
        'format' => 'string'
      ];
    }
    try {
      self::$activeCrmRequest->request_source_id = self::$incomingCrmRequest->requestSource->id;
      switch (self::$incomingCrmRequest->requestSource->system_name) {
        case RequestSource::FAX:
          // if we want to change the source type but there is no fac
          if (self::$activeCrmRequest->request_source_id !== self::$incomingCrmRequest->requestSource->id) {
            if (!self::$incomingCrmRequest->requestSourceDetails->requestSourceFax) {
              throw new Exception(config('errors.crm.MISSING_REQUEST_SOURCE_FAX'));
            }
          }
          // if there is no change in the fax number then the data comes as null so we want to avoid that
          if (self::$incomingCrmRequest->requestSourceDetails->requestSourceFax) {
            if (self::$activeCrmRequest->request_source_fax !== self::$incomingCrmRequest->requestSourceDetails->requestSourceFax) {
              self::$historyFields['request_source_fax'] = [
                'display' => config('history.CrmRequest.request_source_fax'),
                'new' => self::$incomingCrmRequest->requestSourceDetails->requestSourceFax,
                'old' => self::$activeCrmRequest->request_source_fax,
                'format' => 'string'
              ];
              self::$activeCrmRequest->request_source_fax = self::$incomingCrmRequest->requestSourceDetails->requestSourceFax;
            }
          }
          break;

        case RequestSource::EMAIL:
          if (!self::$incomingCrmRequest->requestSourceDetails->requestSourceEmail) {
            throw new Exception(config('errors.crm.MISSING_REQUEST_SOURCE_EMAIL'));
          }
          if (self::$activeCrmRequest->request_source_email !== self::$incomingCrmRequest->requestSourceDetails->requestSourceEmail) {
            self::$historyFields['request_source_email'] = [
              'display' => config('history.CrmRequest.request_source_email'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->requestSourceEmail,
              'old' => self::$activeCrmRequest->request_source_email,
              'format' => 'string'
            ];
            self::$activeCrmRequest->request_source_email = self::$incomingCrmRequest->requestSourceDetails->requestSourceEmail;
          }

          break;

        case RequestSource::OTHER:

          if (
            self::$incomingCrmRequest->requestSourceDetails->requestSourceFirstName &&
            self::$activeCrmRequest->request_source_first_name !== self::$incomingCrmRequest->requestSourceDetails->requestSourceFirstName
          ) {
            self::$historyFields['request_source_first_name'] = [
              'display' => config('history.CrmRequest.request_source_first_name'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->requestSourceFirstName,
              'old' => self::$activeCrmRequest->request_source_first_name,
              'format' => 'string'
            ];
            self::$activeCrmRequest->request_source_first_name = self::$incomingCrmRequest->requestSourceDetails->requestSourceFirstName;
          }

          if (
            self::$incomingCrmRequest->requestSourceDetails->requestSourceLastName &&
            self::$activeCrmRequest->request_source_last_name !== self::$incomingCrmRequest->requestSourceDetails->requestSourceLastName
          ) {
            self::$historyFields['request_source_last_name'] = [
              'display' => config('history.CrmRequest.request_source_last_name'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->requestSourceLastName,
              'old' => self::$activeCrmRequest->request_source_last_name,
              'format' => 'string'
            ];
            self::$activeCrmRequest->request_source_last_name = self::$incomingCrmRequest->requestSourceDetails->requestSourceLastName;
          }

          if (
            self::$incomingCrmRequest->requestSourceDetails->requestSourcePhone &&
            self::$activeCrmRequest->request_source_phone !== self::$incomingCrmRequest->requestSourceDetails->requestSourcePhone
          ) {
            self::$historyFields['request_source_phone'] = [
              'display' => config('history.CrmRequest.request_source_phone'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->requestSourcePhone,
              'old' => self::$activeCrmRequest->request_source_phone,
              'format' => 'string'
            ];
            self::$activeCrmRequest->request_source_phone = self::$incomingCrmRequest->requestSourceDetails->requestSourcePhone;
          }


          break;

        case RequestSource::CALLBIZ:
          if (!self::$incomingCrmRequest->requestSourceDetails->newCallBizID) {
            throw new Exception(config('errors.crm.MISSING_REQUEST_CALLBIZ_DETAILS'));
          }

          if (!self::$incomingCrmRequest->requestSourceDetails->newCallBizDetails) {
            throw new Exception(config('errors.crm.MISSING_REQUEST_CALLBIZ_DETAILS'));
          }

          if (!self::$incomingCrmRequest->requestSourceDetails->newCallBizDatetime) {
            throw new Exception(config('errors.crm.INVALID_REQUEST_CALLBIZ_DATETIME'));
          }
          //@todo check here what is actually changing and how we can detect the changes
          $newCallBiz = CrmRequestCallBizRepository::insert(
            self::$activeCrmRequest->id,
            self::$incomingCrmRequest->requestSourceDetails->newCallBizID,
            self::$incomingCrmRequest->requestSourceDetails->newCallBizDatetime,
            self::$incomingCrmRequest->requestSourceDetails->newCallBizDetails
          );
          $historyArgsArr['models'][] = CrmRequestCallBizRepository::getHistoryModelInsertCallBiz($newCallBiz);

          if (self::$activeCrmRequest->callbiz_id !== self::$incomingCrmRequest->requestSourceDetails->newCallBizID) {
            self::$historyFields['new_callBiz_ID'] = [
              'display' => config('history.CrmRequest.new_callBiz_ID'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->newCallBizID,
              'old' => self::$activeCrmRequest->callbiz_id,
              'format' => 'string'
            ];
          }
          if (self::$activeCrmRequest->callbiz_datetime !== self::$incomingCrmRequest->requestSourceDetails->newCallBizDatetime) {
            self::$historyFields['new_callBiz_datetime'] = [
              'display' => config('history.CrmRequest.new_callBiz_datetime'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->newCallBizDatetime,
              'old' => self::$activeCrmRequest->callbiz_datetime,
              'format' => 'string'
            ];
          }
          if (self::$activeCrmRequest->callbiz_details !== self::$incomingCrmRequest->requestSourceDetails->newCallBizDetails) {
            self::$historyFields['new_callBiz_details'] = [
              'display' => config('history.CrmRequest.new_callBiz_details'),
              'new' => self::$incomingCrmRequest->requestSourceDetails->newCallBizDetails,
              'old' => self::$activeCrmRequest->callbiz_details,
              'format' => 'string'
            ];
          }

          break;
        default:
          break;
      }
    } catch (\Throwable $e) {
      //Haim Arbel asked to lower the charge of entering details
      throw $e;
    }
  }

  private static function updateUploadFile()
  {

    if (self::$incomingCrmRequest->fileToUpload) {
      $routeName = 'crm.requests.documents.add';
      $modelDoc = DocumentController::addDocumentRequest(
        self::$incomingCrmRequest->documentName,
        self::$incomingCrmRequest->fileUpload,
        self::$activeCrmRequest,
        ActionEntityType::ENTITY_TYPE_REQUEST,
        $routeName,
        true
      );

      // @todo check if this is satisfying for history
      self::$historyArgsArr['models'][] = $modelDoc;
    }
  }

  private static function updateUserHandler()
  {
    if (!self::$incomingCrmRequest->userHandler) {
      return null;
    }

    if (self::$activeCrmRequest->user_handler_id !== self::$incomingCrmRequest->userHandler->id) {

      self::$historyFields['user_handler_id'] = [
        'display' => config('history.CrmRequest.user_handler_id'),
        'new' => self::$incomingCrmRequest->userHandler->P_N . " " . self::$incomingCrmRequest->userHandler->F_N,
        'old' => self::$activeCrmRequest->user_handler_first_name . ' ' . self::$activeCrmRequest->user_handler_last_name,
        'format' => 'string'
      ];

      self::$activeCrmRequest->user_handler_id = self::$incomingCrmRequest->userHandler->id;
      RequestCreator::sendMessageCreateRequestToHandlerRequest(self::$activeCrmRequest);
    }
  }

  private static function updateTeamHandler()
  {
    if (!self::$incomingCrmRequest->teamHandler) {
      return;
    }
    if (self::$activeCrmRequest->team_handler_id !== self::$incomingCrmRequest->teamHandler->id) {
      self::$historyFields['team_handler_id'] = [
        'display' => config('history.CrmRequest.user_handler_id'),
        'new' => self::$incomingCrmRequest->teamHandler->name,
        'old' => self::$activeCrmRequest->name,
        'format' => 'string'
      ];
      self::$activeCrmRequest->team_handler_id = self::$incomingCrmRequest->teamHandler->id;
      RequestCreator::sendMessageCreateRequestToManagerTeams(self::$activeCrmRequest);
    }
  }

  private static function updateTargetCloseDate()
  {
    if (!self::$incomingCrmRequest->targetCloseDate) {
      return null;
    }
    if (self::$activeCrmRequest->target_close_date === self::$incomingCrmRequest->targetCloseDate) {
      return;
    }
    if (!self::isThereEditPermission()) {
      return;
    }
    self::$historyFields['target_close_date'] = [
      'display' => config('history.CrmRequest.target_close_date'),
      'new' => self::$incomingCrmRequest->targetCloseDate,
      'old' => self::$activeCrmRequest->target_close_date,
      'format' => 'string'
    ];
    self::$activeCrmRequest->target_close_date = self::$incomingCrmRequest->targetCloseDate;
  }

  private static function updateRequestDate()
  {
    if (!self::$incomingCrmRequest->requestDate) {
      return;
    }
    if (self::$activeCrmRequest->date !== self::$incomingCrmRequest->requestDate) {
      self::$historyFields['date'] = [
        'display' => config('history.CrmRequest.date'),
        'new' => self::$incomingCrmRequest->requestDate,
        'old' => self::$activeCrmRequest->date,
        'format' => 'string'
      ];
      self::$activeCrmRequest->date = self::$incomingCrmRequest->requestDate;
    }
  }

  private static function resetLastRequestSourceField($lastRequestSourceId)
  {
    $oldRequestSource = RequestSourceRepository::getById($lastRequestSourceId);
    switch ($oldRequestSource->system_name) {
      case RequestSource::FAX:
        self::$activeCrmRequest->request_source_fax = NULL;
        break;
      case RequestSource::EMAIL:
        self::$activeCrmRequest->request_source_email = NULL;
        break;

      case RequestSource::OTHER:
        self::$activeCrmRequest->request_source_first_name = NULL;
        self::$activeCrmRequest->request_source_last_name = NULL;
        self::$activeCrmRequest->request_source_phone = NULL;
        break;

      case RequestSource::CALLBIZ:
        self::$activeCrmRequest->request_source_first_name = NULL;
        self::$activeCrmRequest->request_source_last_name = NULL;
        self::$activeCrmRequest->request_source_phone = NULL;
        break;

      default:

        break;
    }
  }

  private static function newRequestAction()
  {
    if (self::$incomingCrmRequest->requestActionType) {
      switch (self::$incomingCrmRequest->requestActionType) {
        case RequestAction::REQUEST_ACTION_CLOSE_REQUEST:
          self::updateCloseRequest();
          self::createActionModelWithRequestActionDetailsByActionTopic(EnumsActionTopic::CLOSE_REQUEST);
          break;
        case RequestAction::REQUEST_ACTION_CANCEL_REQUEST:
          self::createActionModelWithRequestActionDetailsByActionTopic(EnumsActionTopic::CANCEL_REQUEST);
          break;
        case RequestAction::REQUEST_ACTION_TRANSFER_REQUEST:
          self::createActionModelWithRequestActionDetailsByActionTopic(EnumsActionTopic::TRANSFER_REQUEST);
          break;

        default:

          break;
      }

      self::sendSmsOfStatusRequestByTypeAction();
    }
  }

  /**
   * get action topic enum string anf create action model with details of request action
   *
   * @param string | action topic enum $actionTopicSystemName
   * @return void
   */
  private static function createActionModelWithRequestActionDetailsByActionTopic($actionTopicSystemName)
  {
    $actionTopic = ActionTopicRepository::getBySystemName($actionTopicSystemName);
    $actionType = ActionType::where('system_name', '=', ActionTypes::REQUEST);
    return ActionRepository::insert(
      ActionEntityType::ENTITY_TYPE_REQUEST,
      self::$activeCrmRequest->id,
      self::$actionType->id,
      $actionTopic->id,
      self::$incomingCrmRequest->requestActionDetails,
      '',
      ActionStatusHistory::ACTION_STATUS_DONE
    );
  }

  private static function updateCloseRequest()
  {
    if (is_null(self::$incomingCrmRequest->requestClosureReason))
      throw new Exception(config('errors.crm.MISSING_CLOSURE_REQUEST_REASON'));

    self::$activeCrmRequest->request_closure_reason_id = self::$incomingCrmRequest->requestClosureReason->id;

    if (self::$incomingCrmRequest->voterSatisfaction) {
      self::$activeCrmRequest->voter_satisfaction = self::$incomingCrmRequest->voterSatisfaction;
    }

    if (self::$incomingCrmRequest->sendEmailOfCloseRequestToVoter) {
      self::sendEmailOfCloseRequestToVoterRequest();
    }
  }

  /**
   * @throws Exception if not have edit permission
   *
   * @return boolean
   */
  private static function isThereEditPermission()
  {
    $permissionsHash = UserPermissionManager::getHashPermissionByAuthUser();
    $namePermission = 'crm.requests.admin_edit';
    if (!isset($permissionsHash[$namePermission])) {
      $e = new Exception(config('errors.crm.REQUEST_NOT_ENOGH_PERMISSIONS_TO_SPECIAL_FIELDS_UPDATE'));
      Debugbar::addThrowable($e);
      throw $e;
    }
    return true;
  }

  /**
   * function check if the request is for anonymous request or with voter
   * and return the details by the type request voter
   */
  private static function getRequestVoterDetails()
  {
    if (self::$activeCrmRequest->voter_id && self::$activeCrmRequest->voter_id != 0) {
      return VotersRepository::getVoterById(self::$activeCrmRequest->voter_id);
    } else {
      return TempVoterRepository::getTempVoterDetailsById(self::$activeCrmRequest->unknown_voter_id);
    }
  }

  private static function sendEmailOfCloseRequestToVoterRequest()
  {
    $voterRequestDetails = self::getRequestVoterDetails();
    $topicRequest = RequestTopicsRepository::getById(self::$activeCrmRequest->topic_id);
    $subTopicRequest = RequestTopicsRepository::getById(self::$activeCrmRequest->sub_topic_id, true);

    if (!filter_var($voterRequestDetails->email, FILTER_VALIDATE_EMAIL) === false) {
      $data = [
        'request_topic_sub' => $topicRequest->name,
        'request_topic' => $subTopicRequest->name,
        'request_key' => self::$activeCrmRequest->key
      ];

      $sendEmailMessageDto = new SendMessageDto();
      $sendEmailMessageDto->voter_id = self::$activeCrmRequest->voter_id;
      $sendEmailMessageDto->isPhoneMessage = CommonEnum::NO;
      $sendEmailMessageDto->email = $voterRequestDetails->email;
      $sendEmailMessageDto->subjectTemplateMessage = MessageTemplate::CLOSE_CRM_REQUEST_SUBJECT;
      $sendEmailMessageDto->messageTemplate = MessageTemplate::REQUEST_VOTER_MESSAGE_CLOSE_REQUEST;
      $sendEmailMessageDto->dynamicValuesMessage = $data;
      $sendEmailMessageDto->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
      $sendEmailMessageDto->messageEntityTypeValue = self::$activeCrmRequest->id;
      SendMessageService::sendMessage($sendEmailMessageDto);
    }
  }

  /**
   * Undocumented function
   *
   * @param Voters $voter details of voter that mail will send
   * @param string $phoneNumber of voter that mail will send
   * @param string $full name  of request voter
   * @return void
   */
  private static function sendSmsAndEmailOfCloseRequest($voter, $phoneNumber, $RequestVoterFullName)
  {
    $topicId = self::$activeCrmRequest->sub_topic_id ?? self::$activeCrmRequest->topic_id;
    $request_topic_name = RequestTopicsRepository::getNameById($topicId);
    $data = [
      'request_key' => self::$activeCrmRequest->key,
      'request_topic_name' => $request_topic_name,
      'first_name' => $voter->first_name,
      'last_name' => $voter->last_name,
      'request_closure_reason' => self::$incomingCrmRequest->requestClosureReason->name,
      'full_name_voter_request' => $RequestVoterFullName
    ];
    $sendMessage = new SendMessageDto();
    $sendMessage->voter_id = $voter->id;
    $sendMessage->isPhoneMessage = CommonEnum::YES;
    $sendMessage->phoneNumber = $phoneNumber;
    $sendMessage->messageTemplate = MessageTemplate::CLOSE_CRM_REQUEST;
    $sendMessage->dynamicValuesMessage = $data;
    $sendMessage->waitToResponse = CommonEnum::NO;
    $sendMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
    $sendMessage->messageEntityTypeValue = self::$activeCrmRequest->id;

    if ($voter->email) {
      $sendMessage->sendEmailIncludePhoneMessage = CommonEnum::YES;
      $sendMessage->subjectTemplateMessage = MessageTemplate::CLOSE_CRM_REQUEST_SUBJECT;
      $sendMessage->email = $voter->email;
    }

    SendMessageService::sendMessage($sendMessage);
  }

  private static function sendSmsAndEmailOfCancelRequest($voter, $phoneNumber, $RequestVoterFullName)
  {
    $topicId = self::$activeCrmRequest->sub_topic_id ?? self::$activeCrmRequest->topic_id;
    $request_topic_name = RequestTopicsRepository::getNameById($topicId);
    $data = [
      'request_key' => self::$activeCrmRequest->key,
      'request_topic_name' => $request_topic_name,
      'first_name' => $voter->first_name,
      'last_name' => $voter->last_name,
      'request_cancel_reason' => self::$incomingCrmRequest->requestActionDetails,
      'full_name_voter_request' => $RequestVoterFullName
    ];

    $sendMessage = new SendMessageDto();
    $sendMessage->voter_id = $voter->id;
    $sendMessage->isPhoneMessage = CommonEnum::YES;
    $sendMessage->phoneNumber = $phoneNumber;
    $sendMessage->messageTemplate = MessageTemplate::CANCRL_CRM_REQUEST;
    $sendMessage->dynamicValuesMessage = $data;
    $sendMessage->waitToResponse = CommonEnum::NO;
    $sendMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
    $sendMessage->messageEntityTypeValue = self::$activeCrmRequest->id;
    SendMessageService::sendMessage($sendMessage);
  }

  public static function sendSmsOfStatusRequestByTypeAction()
  {
    $voterRequestDetails = self::getRequestVoterDetails();
    $voterRequestFullName = '';
    $voterRequestFullName = $voterRequestDetails->first_name ? $voterRequestDetails->first_name : '';
    $voterRequestFullName = $voterRequestDetails->last_name ? $voterRequestFullName . ' ' . $voterRequestDetails->last_name : $voterRequestFullName;
    $voterRequestFullName = $voterRequestFullName == '' ? '---' : $voterRequestFullName;

    if (!filter_var($voterRequestDetails->email, FILTER_VALIDATE_EMAIL) === false) {
    }

    $phoneHandlerUser = UserPhonesRepository::getMobilePhoneNumberByUserId(self::$activeCrmRequest->user_handler_id);
    $voterHandlerUser = VotersRepository::getVoterByUserId(self::$activeCrmRequest->user_handler_id);

    $teamDetails = TeamRepository::getById(self::$activeCrmRequest->team_handler_id);
    $phoneTeamUser = UserPhonesRepository::getMobilePhoneNumberByUserId($teamDetails->leader_id);
    $voterTeamUser = VotersRepository::getVoterByUserId($teamDetails->leader_id);

    $phoneUserCreated = UserPhonesRepository::getMobilePhoneNumberByUserId(self::$activeCrmRequest->user_create_id);
    $voterUserCreated = VotersRepository::getVoterByUserId(self::$activeCrmRequest->user_create_id);
    $requestActionType = self::$incomingCrmRequest->requestActionType;
    $nameFunctionSendMessage = null;
    switch ($requestActionType) {
      case RequestAction::REQUEST_ACTION_CLOSE_REQUEST:
        $nameFunctionSendMessage = 'sendSmsAndEmailOfCloseRequest';
        break;
      case RequestAction::REQUEST_ACTION_CANCEL_REQUEST:
        $nameFunctionSendMessage = 'sendSmsAndEmailOfCancelRequest';
        break;
    }

    if ($nameFunctionSendMessage) {
      self::$nameFunctionSendMessage($voterHandlerUser, $phoneHandlerUser, $voterRequestFullName);
      if ($voterHandlerUser->id != $voterTeamUser->id)
        self::$nameFunctionSendMessage($voterTeamUser, $phoneTeamUser, $voterRequestFullName);

      if ($voterUserCreated->id != $voterTeamUser->id && $voterUserCreated->id != $voterHandlerUser->id) {
        self::$nameFunctionSendMessage($voterUserCreated, $phoneUserCreated, $voterRequestFullName);
      }
    }
  }
}
