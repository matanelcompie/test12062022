<?php

namespace App\Repositories;

use App\DTO\PaginationDto;
use App\Enums\ActionEntityType;
use App\Enums\RequestPriority;
use App\Enums\RequestSource;
use App\Enums\RequestStatus;
use App\Enums\RequestStatusType;
use App\Enums\RequestUserFilterBy;
use App\Libraries\Helper;
use App\Libraries\JsonOutput;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\Action;
use App\Models\CrmRequest;
use App\Models\CrmRequestDetails;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class CrmRequestRepository
{
  public static function getByKey($key)
  {
    $crmRequest = CrmRequest::select()->where('key', $key)->first();
    if (!$crmRequest)
      throw new Exception(config('errors.crm.REQUEST_DOESNT_EXIST'));

    return $crmRequest;
  }

  public static function getRequestIncludeStatusNameByKey($key)
  {
    $crmRequest = CrmRequest::select(
      DB::raw('requests.*'),
      DB::raw('request_status.name as request_status_name'),
      DB::raw('request_status.type_id as request_status_type'),
      DB::raw('user_handler_voters.first_name as user_handler_first_name'),
      DB::raw('user_handler_voters.last_name as user_handler_last_name'),
      DB::raw('request_callbiz.callbiz_id as callbiz_id '),
      DB::raw('request_callbiz.date as callbiz_datetime '),
      DB::raw('request_callbiz.details as callbiz_details')
    )
      ->withStatus()
      ->withTopic()
      ->withSubTopic()
      ->WithPriority()
      ->WithRequestSource()
      ->WithHandlerUser()
      ->WithHandlerTeam()
      ->withCallBiz()
      ->where('requests.key', $key);
    $result = $crmRequest->first();
    if (!$result) {
      throw new Exception(config('errors.crm.REQUEST_DOESNT_EXIST'));
    }
    return $result;
  }

  public static function getRequestFields()
  {
    return [
      'requests.id AS reqId',
      'requests.key AS reqKey',
      'requests.date',
      'requests.close_date',
      'requests.target_close_date',
      'requests.request_source_id',
      'requests.request_source_fax',
      'requests.request_source_email',
      'requests.request_source_phone',
      'requests.request_source_first_name',
      'requests.request_source_last_name',
      'requests.request_priority_id',
      'requests.status_id',
      'requests.user_create_id',
      'requests.user_update_id',
      'requests.user_handler_id',
      'requests.created_at',
      'requests.updated_at',
      'requests.voter_id',
      'teams.name AS team_name',
      'teams.key AS teamKey',
      'teams.leader_id AS team_leader_id',
      'requests.voter_id',
      'requests.unknown_voter_id',
      DB::raw("concat(UM_USER_CREATE.first_name,' ',UM_USER_CREATE.last_name) as user_create_name"),
      'users_user_create.key as user_create_key',
      DB::raw("concat(UM_USER_UPDATE.first_name,' ',UM_USER_UPDATE.last_name) as user_update_name"),
      DB::raw("concat(user_handler_voters.first_name,' ',user_handler_voters.last_name) as user_handler_name"),
      "request_status.type_id as status_type_id",
      "request_status.name as status_name",
      "request_priority.name as priority_name",
      "request_source.name as request_source_name"
    ];
  }

  public static function getRequestDetailsByKey($key)
  {
    $checkPermissionDisplayVoter = false;
    $requestQuery = self::getRequestDetailsQuery();
    $crmRequest = CrmRequestRepository::getByKey($key);

    if (!is_null($crmRequest->voter_id) && $crmRequest->voter_id != 0) {
      $checkPermissionDisplayVoter = VotersRepository::isValidAuthPermissionToSpecificVoter($crmRequest->voter_id);
    }

    if ($checkPermissionDisplayVoter) {
      $requestQuery->withVoter();
      $requestQuery->addSelect(DB::raw('voters.key as voter_key'));
    }

    $requestQuery = $requestQuery->where('requests.key', $key)->first();
    return $requestQuery;
  }

  private static function getRequestDetailsQuery()
  {
    return CrmRequest::select(self::getRequestFields())
      ->withTopic()
      ->withSubTopic()
      ->withHandlerTeam()
      ->withHandlerUserOfTeam()
      ->withCreatorUser()
      ->withUpdaterUser()
      ->withHandlerUser()
      ->withStatus()
      ->withPriority()
      ->withRequestSource();
  }

  public static function getAllRequest()
  {
    return self::getRequestDetailsQuery()->get();
  }

  public static function updateCrmRequestOpenedByRequestKey($key)
  {
    $userId = $userId = Auth::user()->id;
    CrmRequest::where('user_handler_id', $userId)->where('key', trim($key))->update(['opened' => 1]);
  }

  /*
     returns request Action's description by crm request id
	*/
  public static function getRequestDescriptionAction($id)
  {
    $currentAction = Action::select('actions.description', 'actions.id')->withTopic()
      ->where('actions.entity_type', 1)
      ->where('actions.entity_id', $id)
      ->whereIn('action_topics.system_name', ['request.new', 'request.description'])
      ->where('actions.deleted', 0)
      ->orderBy('actions.created_at', 'desc')->first();
    return $currentAction;
  }

  /**
   * @return \Illuminate\Database\Query\Expression
   */
  public static function getRequestPriorityFieldValueByTargetCloseDate($nameField = "request_priority_id")
  {
    $highPriorityId = RequestPriority::HIGH;
    $requestStatusOpen = collect([RequestStatusType::REQUEST_STATUS_NEW, RequestStatusType::REQUEST_STATUS_PROCESS]);
    $requestStatusOpen = $requestStatusOpen->implode(',');
    $maxDayCloseForHighPriority = 6;
    return DB::raw("CASE WHEN request_status.type_id!=$highPriorityId and 
        request_status.type_id in($requestStatusOpen)and target_close_date <NOW() + INTERVAL $maxDayCloseForHighPriority 
        DAY then $highPriorityId  else request_priority_id end as $nameField ");
  }



  public static function getFieldNameQueryRequestDetails()
  {
    return collect([
      'requests.id',
      'requests.key',
      'requests.created_at',
      'requests.updated_at',
      self::getRequestPriorityFieldValueByTargetCloseDate(),
      'requests.description',
      'requests.team_handler_id',
      'teams.name as team_handler_name',
      'requests.user_handler_id',
      DB::raw("concat(user_handler_voters.first_name,' ',user_handler_voters.last_name) as user_handler_name"),
      'requests.voter_satisfaction',
      'requests.user_create_id',
      DB::raw("concat(UM_USER_CREATE.first_name,' ',UM_USER_CREATE.last_name) as user_create_name"),
      'requests.target_close_date',
      'requests.opened',
      'requests.date',
      'requests.close_date',
      "request_status.name as status_name",
      DB::raw('request_status_type.name as status_type_name'),
      "request_status.type_id as status_type_id",
      'sub_topic_id',
      'sub_topic.name as sub_topic_name',
      'topic_id',
      'requests.status_id',
    ]);
  }

  public static function getFieldNameQueryRemainderDateForRequest()
  {
    $actionTypeReminder = ActionTypeRepository::getBySystemName('reminder');
    $actionEntityType = ActionEntityType::ENTITY_TYPE_REQUEST;
    return    DB::raw(
      "(select action_date 
              from  actions 
              where actions.entity_type={$actionEntityType} and actions.action_type={$actionTypeReminder->id}
              order by id limit 1 ) as reminder_date"
    );
  }

  public static function getListRequestsUserInOrm(PaginationDto $pagination = null)
  {
    $userRequestList = self::getListRequestsUser($pagination);
    $userRequestOrmList = [];
    foreach ($userRequestList as $key => $request) {
      $requestOrm = self::transformerRequestOrm($request);
      $requestOrm['voter'] = Helper::transformerOrm($request, [
        'key',
        'last_name',
        'first_name',
        'full_name',
        'personal_identity',
        'unknown_voter_id'
      ]);
      $userRequestOrmList[] = $requestOrm;
    }

    return  $userRequestOrmList;
  }

  public static function transformerRequestOrm(CrmRequest $request)
  {

    return [
      'key' => $request->key,
      'close_date' => $request->close_date,
      'target_close_date' => $request->target_close_date,
      'voter_satisfaction' => $request->voter_satisfaction,
      'description' => $request->description,
      'topic' => [
        'id' => $request->topic_id,
        'name' => $request->topic_name,
      ],
      'sub_topic' => [
        'id' => $request->sub_topic_id,
        'name' => $request->sub_topic_name,
      ],
      'status' => [
        'id' => $request->status_id,
        'name' => $request->status_name,
        'status_type_id' => $request->status_type_id,
        'status_type_name' => $request->status_type_name,
      ],
      'team' => [
        'id' => $request->team_handler_id,
        'name' => $request->team_handler_name
      ],
      'user_handler' => [
        'id' => $request->user_handler_id,
        'name' => $request->user_handler_name
      ],
      'priority' => [
        'id' => $request->request_priority_id,
        'name' =>  RequestPriority::HASH_NAME[$request->request_priority_id]
      ],
      'user_create' => [
        'id' => $request->user_create_id,
        'name' => $request->user_create_name
      ],
      'message_title' => self::getMessageTitleUserRequest($request),
      'reminder_date' => $request->reminder_date,
      'created_at' => $request->created_at,
      'updated_at' => $request->updated_at,
    ];
  }

  /**
   * message title for request user
   *
   * @param CrmRequest $request
   * @return string
   */
  public static function getMessageTitleUserRequest($request)
  {
    $targetCloseDate = strtotime($request->target_close_date);
    $targetCloseDate = date('Y-m-d', $targetCloseDate);
    if ($targetCloseDate == date('Y-m-d')) {
      return 'משימה פתוחה באחריותך חייבת לקבל התייחסות וסיום טיפול היום ';
    }

    if ($request->user_create_id != AuthService::getUserId()) {
      return 'התקבלה פניה חדשה לטיפולך';
    }

    return '';
  }

  /**
   * insert request by orm - the request source default its from application 
   *
   * @param [type] $requestOrm
   * @param [type] $voterOrUnKnownId
   * @param boolean $isUnknownVoter
   * @return CrmRequest
   */
  public static function CreateByOrmStruct($requestOrm, $voterOrUnKnownId, $isUnknownVoter = false)
  {
    $crmRequest = new CrmRequest();
    $crmRequest->voter_id = $isUnknownVoter ? null : $voterOrUnKnownId;
    $crmRequest->unknown_voter_id = $isUnknownVoter ? $voterOrUnKnownId : null;
    $crmRequest->topic_id = $requestOrm->topic->id;
    $crmRequest->sub_topic_id = $requestOrm->sub_topic->id;
    $crmRequest->target_close_date = $requestOrm->target_close_date;
    $crmRequest->request_priority_id = RequestPriority::NORMAL;
    $crmRequest->user_handler_id = $requestOrm->user_handler->id;
    $crmRequest->team_handler_id = $requestOrm->team->id;
    $crmRequest->description = $requestOrm->description;
    $crmRequest->opened = 1;
    $crmRequest->status_id = RequestStatus::DEFAULT_STATUS_NEW_CRM_REQUEST;
    $requestSourceId = isset($requestOrm->request_source) && $requestOrm->request_source->id ? $requestOrm->request_source->id :  RequestSourceRepository::geIdtBySystemName(RequestSource::APPLICATION);
    $crmRequest->request_source_id = $requestSourceId;

    $crmRequest->user_update_id = AuthService::getUserId();
    $crmRequest->user_create_id = AuthService::getUserId();
    $crmRequest->save();
    return $crmRequest;
  }

  public static function validateCrmRequestOrm($requestOrm)
  {
    if (!$requestOrm->voter || !$requestOrm->voter->last_name) {
      throw new Exception(config('errors.crm.MISSING_VOTER_NAME'));
    }
    if (!$requestOrm->voter->phone || !$requestOrm->voter->phone->phone_number || $requestOrm->voter->phone->phone_number == '') {
      throw new Exception(config('errors.crm.MISSING_VOTER_PHONE'));
    }
    if (!$requestOrm->team || !$requestOrm->team->id) {
      throw new Exception(config('errors.crm.REQUEST_TEAM_HANDLER_NOT_EXISTS'));
    }
    if (!$requestOrm->user_handler || !$requestOrm->user_handler->id) {
      throw new Exception(config('errors.crm.REQUEST_USER_HANDLER_NOT_EXISTS'));
    }
    if (!$requestOrm->topic || !$requestOrm->topic->id) {
      throw new Exception(config('errors.crm.MISSING_REQUEST_TOPIC'));
    }
    if (!$requestOrm->sub_topic || !$requestOrm->sub_topic->id) {
      throw new Exception(config('errors.crm.REQUEST_SUB_TOPIC_NOT_EXISTS'));
    }
    if (!$requestOrm->target_close_date || $requestOrm->target_close_date == "") {
      throw new Exception(config('errors.crm.WRONG_REQUEST_TARGET_CLOSE_DATE'));
    }

    if (!$requestOrm->description || $requestOrm->description == "") {
      throw new Exception(config('errors.crm.WRONG_REQUEST_TARGET_CLOSE_DATE'));
    }
  }

  /**
   * Get all request details include voter details actions and document by request id
   *
   * @param [type] $requestId
   * @return array
   */
  public static function getRequestDetailsIncludeActionAndDocumentInOrmByKey(string $requestKey)
  {

    $request = self::getQueryRequestDetailsIncludeMultiVoterDetails()
      ->with('documents')
      ->where('requests.key', $requestKey)
      ->first();

    $requestOrm = self::transformerRequestOrm($request);
    $requestOrm['documents'] = $request->documents;
    $requestOrm['voter'] = [
      'personal_identity' => $request->personal_identity,
      'voter_key' => $request->voter_key,
      'unknown_voter_id' => $request->unknown_voter_id,
      'first_name' => $request->first_name,
      'last_name' => $request->last_name,
      'gender' => $request->gender,
      'email' => $request->email,
      'city' => [
        'id' => $request->city_id,
        'name' => $request->city_name,
      ],
      'street' => [
        'id' => $request->street_id,
        'name' => $request->street_name,
      ],
      'house' => $request->house,
    ];
    $phone = $request->voter_id ? VoterPhoneRepository::getPhoneVoterByVoterId($request->voter_id) : VoterPhoneRepository::getPhoneVoterByUnknownVoterId($request->unknown_voter_id);
    $requestOrm['voter']['phone'] = ['id' => $phone->id, 'phone_number' => $phone->phone_number];
    $requestOrm['actions'] = ActionRepository::getActionListByRequestId($request->id);
    return $requestOrm;
  }


  /**
   * Query crm request details with voter details
   *
   * @param integer $requestId
   * @return 
   */
  public static function getQueryRequestDetailsIncludeMultiVoterDetails()
  {
    $fields = self::getFieldNameQueryRequestDetails()
      ->merge(VotersRepository::getFieldNameQueryVoterOrUnknownVoter())
      ->merge(VotersRepository::getFieldNameQueryVoterOrUnknownVoterAddress())
      ->toArray();

    return  CrmRequest::select($fields)
      ->addSelect(self::getFieldNameQueryRemainderDateForRequest())
      ->withTopic()
      ->withHandlerTeam()
      ->withHandlerUserOfTeam()
      ->withCreatorUser()
      ->withUpdaterUser()
      ->withHandlerUser()
      ->withStatus()
      ->withStatusType()
      ->withPriority()
      ->withRequestSource()
      ->withVoter(TRUE)
      ->join('request_topics as sub_topic', 'sub_topic.id', '=', 'requests.sub_topic_id')
      ->leftJoin('cities as voters_city', 'voters_city.id', '=', 'voters.city_id')
      ->leftJoin('cities as unknown_voters_city', 'unknown_voters_city.id', '=', 'unknown_voters.city_id')
      ->leftJoin('streets as voter_street', 'voter_street.id', '=', 'voters.street_id')
      ->leftJoin('streets as unknown_voter_street', 'unknown_voter_street.id', '=', 'unknown_voters.street_id')
      ->leftJoinQueryFirstActiveVoterPhone('voters')
      ->leftJoinQueryFirstActiveUnknownVoterPhone('unknown_voters');
  }

  /**
   *
   * function return request list that auth user creator or handler user and team member requests if the auth user team leader
   *  
   * @param int $userId
   * @param PaginationDto $pagination
   * @return CrmRequest
   */
  public static function getListRequestsUser(PaginationDto $pagination = null)
  {
    $requestQuery = CrmRequest::select(
      VotersRepository::getFieldNameQueryVoterOrUnknownVoter()
        ->merge(self::getFieldNameQueryRequestDetails())->toArray()
    )
      ->withTopic()
      ->withHandlerTeam()
      ->withHandlerUserOfTeam()
      ->withCreatorUser()
      ->withUpdaterUser()
      ->withHandlerUser()
      ->withStatus()
      ->withStatusType()
      ->withPriority()
      ->withRequestSource()
      ->withVoter(TRUE)
      ->join('request_topics as sub_topic', 'sub_topic.id', '=', 'requests.sub_topic_id')
      ->where('request_status_type.id', '<>', RequestStatusType::REQUEST_STATUS_CANCELED);

    if ($pagination && $pagination->searchText) {
      $requestQuery->searchRequestByVoterDetails($pagination->searchText);
    } 

    if ($pagination && $pagination->orderBy) {
      $requestQuery->orderBy($pagination->orderBy, $pagination->orderByDesc ? 'DESC' : 'ASC');
    } else {
      $requestQuery->orderBy('request_priority_id', 'DESC')->orderBy('requests.id', 'DESC');
    }

    if ($pagination->filterBy) {
      $requestQuery->authUserRequestSortByType($pagination->filterBy, $pagination->filterByValue);
    } else {
      $requestQuery->authUserRequestSortByType(RequestUserFilterBy::ALL_AUTH_USER_REQUEST);
    }

    if ($pagination) {
      $requestQuery->limit(20)->offset($pagination->offsetIndex);
    }
    
    return $requestQuery->get();
  }

  public static function getSummaryCountRequestUserByRequestPriorityId()
  {
    return CrmRequest::select(
      [
        DB::raw('count(requests.id) as count_requests'),
        self::getRequestPriorityFieldValueByTargetCloseDate('request_priority'),
      ]
    )
      ->withStatus()
      ->withStatusType()
      ->allAuthUserRequestByConditionRequestOpen()
      ->where('request_status_type.id', '<>', RequestStatusType::REQUEST_STATUS_CANCELED)
      ->groupBy('request_priority')
      ->get();
  }

  public static function getCrmRequestFieldsForSortBy()
  {
    return [
      ['id' => 'request_priority_id', 'name' => 'רמת דחיפות'],
      ['id' => 'full_name', 'name' => 'שם  פונה'],
      ['id' => 'created_at', 'name' => 'תאריך פתיחת פניה'],
      ['id' => 'topic_name', 'name' => 'נושא פניה'],
    ];
  }

  /**
   * Undocumented function
   *
   * @param Request $request - form data type include files and request-details json details
   * @return void
   */
  public static function createCrmRequest(Request $request)
  {
    try {
      DB::beginTransaction();
      $crmRequest = $request->input('request-details');
      $crmRequest = json_decode($crmRequest);
      $files = $request->file('files');
      $isUnknownVoter = false;
      self::validateCrmRequestOrm($crmRequest);
      $personalIdentity = $crmRequest->voter->personal_identity;

      //insert request by exist voter
      if ($personalIdentity && $personalIdentity != '') {
        $voter = VotersRepository::getVoterByPersonalIdentity($personalIdentity, false);
        if (!$voter) {
          $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.crm.WARNING_VOTER_ADD_REQUEST'));
          $response = array('warning_message' => $warning_message);
          return  $response;
        } else {
          VotersRepository::updateVoterIncludeComparisonOldVoter($voter, $crmRequest->voter);
          $crmRequest->voter->voter_key = $voter->key;
          VoterPhoneRepository::updateVerifiedOrInsertIfNotExist($crmRequest->voter->phone->phone_number, $voter->id);
        }
      } else {
        //insert request for unknown voter
        $unKnownVoter = UnknownVoterRepository::insertByOrm($crmRequest->voter);
        $crmRequest->voter->unknown_voter_id = $unKnownVoter->id;
        VoterPhoneRepository::updateOrInsertUnknownPhone($unKnownVoter->id, $crmRequest->voter->phone->phone_number);
        $isUnknownVoter = true;
      }

      $newRequest = self::CreateByOrmStruct($crmRequest, $isUnknownVoter ? $unKnownVoter->id : $voter->id, $isUnknownVoter);

      //upload request files attach
      if ($request->hasFile('files')) {
        self::addRequestFiles($newRequest, $files);
      }


      DB::commit();
      $allDetails = self::getRequestDetailsIncludeActionAndDocumentInOrmByKey($newRequest->key);

      return  $allDetails;
    } catch (\Throwable $e) {
      DB::rollback();
      throw $e;
    }
  }


  public static function addRequestFiles($request, $files)
  {
    if (!$files) {
      throw new Exception(config('errors.global.MISSING_DOCUMENT_FILE'));
    }

    return array_map(function ($file) use ($request) {
      return DocumentRepository::createEntityFile($file, null, ActionEntityType::ENTITY_TYPE_REQUEST, $request->id);
    }, $files);
  }
}
