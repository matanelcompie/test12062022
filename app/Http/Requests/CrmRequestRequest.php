<?php

namespace App\Http\Requests;

use App\DTO\CrmRequestDto;
use App\DTO\RequestSourceDetailsDto;
use App\Enums\CommonEnum;
use App\Enums\MessageTemplate;
use App\Enums\RequestSource;
use App\Libraries\Helper;
use App\Libraries\HelperDate;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Libraries\Services\ServicesModel\VoterPhoneService;
use App\Models\CrmRequest;
use App\Models\Teams;
use App\Repositories\CrmRequestPriorityRepository;
use App\Repositories\CrmRequestRepository;
use App\Repositories\RequestClosureReasonRepository;
use App\Repositories\RequestSourceRepository;
use App\Repositories\RequestStatusRepository;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\TeamRepository;
use App\Repositories\UserPhonesRepository;
use App\Repositories\UserRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CrmRequestRequest
{

  /**
   * @var CrmRequestDto
   */
  public  $crmRequestDto;

  function __construct(Request $request, $reqKey)
  {
    $this->crmRequestDto = new CrmRequestDto();

    $this->crmRequestDto->crmRequestKey = $reqKey;

    //@todo this can be received with 1 query
    if ($request->input('topic_id')) {
      $this->crmRequestDto->requestTopic = RequestTopicsRepository::getById($request->input('topic_id'));
    }

    if ($request->input('sub_topic_id')) {
      $this->crmRequestDto->requestSubTopic = RequestTopicsRepository::getById($request->input('topic_id'), true);
    }

    $newDescription = $request->input('new_description');
    if ($newDescription && trim($newDescription) != '') {
      $this->crmRequestDto->requestDescription = $newDescription;
    }

    if ($request->input('static_request_closure_reason')) {
      $this->crmRequestDto->requestClosureReason = RequestClosureReasonRepository::getById($request->input('static_request_closure_reason'));
    }


    if ($request->input('static_voter_satisfaction')) {
      $reqVoterSatisfaction = $request->input('static_voter_satisfaction');
      if ($reqVoterSatisfaction < 1 || $reqVoterSatisfaction > 5) {
        throw new Exception(config('errors.crm.INVALID_VOTER_SATISFACTION'));
      }
      $this->crmRequestDto->requestClosureReason = RequestClosureReasonRepository::getById($request->input('static_request_closure_reason'));
    }
    if ($request->input('status_id')) {
      $this->crmRequestDto->requestStatus = RequestStatusRepository::getById($request->input('status_id'));
    }

    if ($request->input('static_is_include_closing_reason')) {
      $this->crmRequestDto->requestClosureReasonDescription = $request->input('static_is_include_closing_reason');
    }

    if ($request->input('request_priority_id')) {
      $this->crmRequestDto->crmRequestPriority = CrmRequestPriorityRepository::getById($request->input('request_priority_id'));
    }

    if ($request->input('request_source_id')) {
      $this->crmRequestDto->requestSource = RequestSourceRepository::getById($request->input('request_source_id'));
      $this->getRequestSourceDetailsBySourceType($request, $reqKey);
    }

    if ($request->input('user_handler_id')) {
      $this->crmRequestDto->userHandler = UserRepository::getByIdWithVoter($request->input('user_handler_id'));
      // var_dump($this->crmRequestDto->userHandler);
      if (!$this->crmRequestDto->userHandler) {
        throw new Exception(config('errors.crm.REQUEST_USER_HANDLER_NOT_EXISTS'));
      }
    }

    if ($request->input('team_handler_id')) {
      $this->crmRequestDto->teamHandler = TeamRepository::getById($request->input('team_handler_id'));
    }

    if ($request->input('static_is_send_email')) {
      $this->crmRequestDto->sendEmailOfCloseRequestToVoter = $request->input('static_is_send_email') ? CommonEnum::YES : CommonEnum::NO;
      if ($request->input('static_is_include_closing_reason')) {
        $this->crmRequestDto->sendEmailOfCloseRequestToVoterIncludeResson = $request->input('static_is_include_closing_reason') ? CommonEnum::YES : CommonEnum::NO;
      }
    }

    if ($request->input('target_close_date')) {
      if (!HelperDate::isDateTimeCorrectFormat($request->input('target_close_date'))) {
        throw new Exception(config('errors.crm.WRONG_REQUEST_TARGET_CLOSE_DATE'));
      }

      $this->crmRequestDto->targetCloseDate = $request->input('target_close_date');
    }

    if ($request->input('request_date')) {
      if (!HelperDate::isDateTimeCorrectFormat($request->input('request_date'))) {
        throw new Exception(config('errors.crm.WRONG_REQUEST_DATE'));
      }

      $this->crmRequestDto->requestDate = $request->input('request_date');
    }

    if ($request->input('new_action_details') && $request->input('new_action_type')) {
      $this->crmRequestDto->requestActionDetails = $request->input('new_action_details');
      $this->crmRequestDto->requestActionType = $request->input('new_action_type');
    }

    if ($request->input('document_name')) {
      $this->crmRequestDto->documentName = $request->input('document_name');
    }

    if ($request->input('file_upload')) {
      $this->crmRequestDto->fileToUpload = $request->input('file_upload');
    }

    return $this->crmRequestDto;
  }

  /**
   * @return void
   */
  public function getRequestSourceDetailsBySourceType(Request $request, $reqKey)
  {
    $this->crmRequestDto->requestSourceDetails = new RequestSourceDetailsDto();
    switch ($this->crmRequestDto->requestSource->system_name) {
      case RequestSource::EMAIL:
        if ($request->input('request_source_email')) {
          $this->crmRequestDto->requestSourceDetails->requestSourceEmail = $request->input('request_source_email');
        }
        break;
      case RequestSource::OTHER:
        if ($request->input('request_source_first_name')) {
          $this->crmRequestDto->requestSourceDetails->requestSourceFirstName = $request->input('request_source_first_name');
        }


        if ($request->input('request_source_last_name')) {
          $this->crmRequestDto->requestSourceDetails->requestSourceLastName = $request->input('request_source_last_name');
        }

        if ($request->input('request_source_phone')) {
          $this->crmRequestDto->requestSourceDetails->requestSourcePhone = Helper::removeAllNoneNumericCharacters($request->input('request_source_phone'));
        }
        break;

      case RequestSource::CALLBIZ:
        if ($request->input('new_callBiz_ID')) {
          if (strlen($request->input('new_callBiz_ID')) <= 20 && trim($request->input('new_callBiz_ID')) != '') {
            throw new Exception(config('errors.crm.CALLBIZ_ID_LENGTH_INVALID'));
          }
          $this->crmRequestDto->requestSourceDetails->newCallBizID = $request->input('new_callBiz_ID');
        }

        if (HelperDate::isDateTimeCorrectFormat($request->input('new_callBiz_datetime'))) {
          $this->crmRequestDto->requestSourceDetails->newCallBizDatetime = $request->input('new_callBiz_datetime');
        }

        if ($request->input('new_callBiz_details')) {
          $this->crmRequestDto->requestSourceDetails->newCallBizDetails = $request->input('new_callBiz_details');
        }
        break;

      case RequestSource::FAX:
        if ($request->input('request_source_fax')) {
          $this->crmRequestDto->requestSourceDetails->requestSourceFax = $request->input('request_source_fax');
        }
        break;

      default:
        break;
    }
  }
}
