<?php

namespace App\Http\Controllers;

use App\DTO\PaginationDto;
use App\Enums\CommonEnum;
use App\Enums\MessageEntityType;
use App\Enums\MessageTemplate;
use App\Enums\RequestUserFilterBy;
use App\Http\Controllers\Controller;
use App\Http\Requests\CrmRequestRequest;
use Illuminate\Http\Request;
use App\Models\CrmRequest;
use App\Models\RequestTopic;
use App\Models\CrmRequestTopic;
use App\Models\CrmRequestStatus;
use App\Models\Teams;
use App\Models\CrmRequestStatusType;
use App\Models\CrmRequestPriority;
use App\Models\Action;
use App\Models\ActionStatus;
use App\Models\ActionHistory;
use App\Models\ActionType;
use App\Models\ActionTopic;
use App\Models\CrmRequestCallBiz;
use App\Models\RequestSource;
use App\Models\RequestClosureReason;
use App\Models\RequestSatisfaction;
use App\Models\Document;
use App\Models\DocumentEntity;
use App\Models\Voters;
use App\Models\TempVoter;
use App\Models\UnknownVoterPhone;
use App\Models\User;
use App\Models\City;
use Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\GeneralEmail;
use App\Mail\RequestClosed;
use App\Mail\RequestTransfered;
use App\Libraries\Helper;
use App\Libraries\HelpFunctions;
use App\Libraries\Services\ExportFile\ExcelFileService;
use App\Libraries\Services\Requests\RequestCreator;
use App\Libraries\Services\Requests\RequestUpdator;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Repositories\CrmRequestRepository;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\StreetRepository;
use App\Repositories\TempVoterRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Illuminate\Support\Facades\DB;
use DateTime;
use Barryvdh\Debugbar\Facade as Debugbar;
use App\Enums\RequestAction;
use App\Enums\RequestStatus;
use App\Enums\RequestStatusType;
use App\Libraries\JsonOutput;
use App\Repositories\DocumentRepository;
use App\Repositories\RequestStatusRepository;
use App\Repositories\TeamRepository;
use Exception;
use Log;

class CrmRequestController extends Controller
{

  private $messageMoldNew = 'בס"ד <br/> שלום רב,
    בהמשך פנייתך לצוות %s,
                                נפתחה פניית שרות מספר [%s#] והיא בטיפול.
                                נא לציין מספר זה בכל פניה חוזרת.

                                נושא הפנייה: %s , %s
                                אנו נעמוד עמך בקשר ונעדכן על התקדמות הטיפול-.
                                <br/>
                                בברכה,
                                %s
                                <br/>
                                טלפון לפניות הציבור %s
                                       ';
  private $messageMoldClosed = 'בס"ד <br/> שלום רב,
                                       הננו להודיעך כי הטיפול בפנייתך מספר  [%s#] למפלגת ש"ס הסתיים.
                                       נא לציין מספר זה בכל פניה חוזרת.

                                       נושא הפנייה: %s , %s
                                       <br/><br/>

                                       בברכה,
                                       הלשכה הארצית לפניות הציבור, סניף %s
                                       מפלגת ש"ס
                                       טלפון לפניות הציבור 1-800-888-444
                                       ';
  private $messageMoldToHandler = 'בס"ד <br/> שלום רב,
                                       תוכן פנית שרות מספר
                                        [%s]
                                         הועברה לטיפולך על ידי המשתמש
                                             [%s]
                                       <br/><br/>

                                       נושא הפנייה: %s , %s
                                       <br/><br/>
                                       פרטי הפונה :
                                        %s %s %s %s
                                        <br/><br/>
                                        תיאור הפניה : <br/>
                                        %s
                                        <br/><br/>';
  public $history_fields_heb = array(
    'topic_name' => 'נושא',
    'new_description' => 'תיאור',
    'new_request' => 'פנייה חדשה',
    'sub_topic_name' => 'תת נושא',
    'target_close_date' => 'תאריך יעד לסגירה',
    'request_source_name' => 'מקור הפניה',
    'priority_name' => 'עדיפות',
    'request_source_fax' => 'מקור פקס',
    'request_source_email' => 'מקור מייל',
    'request_source_phone' => 'מקור טלפון',
    'request_source_first_name' => 'מקור שם פרטי',
    'request_source_last_name' => 'מקור שם משפחה',
    'status_name' => 'סטטוס',
    'user_handle_name' => 'משתמש מטפל',
    'team_handle_name' => 'צוות מטפל',
    'close_date' => 'תאריך יעד לסגירה',
    'request_date' => 'תאריך פנייה'
  );

  /**
   * The current logged in user.
   *
   * @var int
   */
  static $userId = -1;

  /**
   * The team that the current logged in user belongs.
   *
   * @var array
   */
  static $userTeamId = [];

  /*
    Function that adds temp voter to database
  */
  public function addTempVoter(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($request->input('first_name') == null || trim($request->input('first_name')) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_TEMP_VOTER_FIRST_NAME'));
      return;
    }
    if (($request->input('email') == null || trim($request->input('email')) == '') && ($request->input('phone1') == null || trim($request->input('phone1')) == '') && ($request->input('phone2') == null || trim($request->input('phone2')) == '')) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_TEMP_VOTER_CONTACT_DATA'));
      return;
    }
    if ($request->input('email') != null && trim($request->input('email')) != '') {
      if (filter_var($request->input('email'), FILTER_VALIDATE_EMAIL) === false) {
        $jsonOutput->setErrorCode(config('errors.crm.WRONG_EMAIL_OF_TEMP_VOTER'));
        return;
      }
    }

    if ($request->input('house') != null && trim($request->input('house')) != '') {
      if (!is_numeric($request->input('house'))) {
        $jsonOutput->setErrorCode(config('errors.crm.WRONG_HOUSE_NUMBER'));
        return;
      }
    }

    if ($request->input('personal_identity') != null && trim($request->input('personal_identity')) != '') {
      $existingVoter = Voters::withFilters()->where('personal_identity', $request->input('personal_identity'))->first(['voters.id']);
      if ($existingVoter) {
        $jsonOutput->setData(false);
        return;
      }
    }

    $tempVoter = new TempVoter;
    if ($request->input('personal_identity') != null && trim($request->input('personal_identity')) != '') {
      $tempVoter->personal_identity = $request->input('personal_identity');
    }
    if ($request->input('first_name') != null && trim($request->input('first_name')) != '') {
      $tempVoter->first_name = $request->input('first_name');
    }
    if ($request->input('last_name') != null && trim($request->input('last_name')) != '') {
      $tempVoter->last_name = $request->input('last_name');
    }
    if ($request->input('passport') != null && trim($request->input('passport')) != '') {
      $tempVoter->passport = $request->input('passport');
    }

    if ($request->input('birth_date') != null && trim($request->input('birth_date')) != '') {
      if ($request->input('birth_date_type') != null && trim($request->input('birth_date_type')) != '') {
        $tempVoter->birth_date = $request->input('birth_date');
        $tempVoter->birth_date_type = $request->input('birth_date_type');
      }
    }
    if (trim($request->input('gender_id')) != '') {
      $tempVoter->gender = $request->input('gender_id');
    }
    if ($request->input('city_id') != null && trim($request->input('city_id')) != '') {
      $tempVoter->city_id = $request->input('city_id');
    }
    if ($request->input('neighborhood') != null && trim($request->input('neighborhood')) != '') {
      $tempVoter->neighborhood = $request->input('neighborhood');
    }
    if ($request->input('street_id') != null && trim($request->input('street_id')) != '') {
      $tempVoter->street_id = $request->input('street_id');
    }
    if ($request->input('house') != null && trim($request->input('house')) != '') {
      $tempVoter->house = $request->input('house');
    }
    if ($request->input('house_entry') != null && trim($request->input('house_entry')) != '') {
      $tempVoter->house_entry = $request->input('house_entry');
    }
    if ($request->input('flat') != null && trim($request->input('flat')) != '') {
      $tempVoter->flat = $request->input('flat');
    }
    if ($request->input('zip') != null && trim($request->input('zip')) != '') {
      $tempVoter->zip = $request->input('zip');
    }
    if ($request->input('email') != null && trim($request->input('email')) != '') {
      $tempVoter->email = $request->input('email');
    }
    $tempVoter->key = Helper::getNewTableKey('unknown_voters', 10);
    $tempVoter->save();
    if ($request->input('phone1') != null && trim($request->input('phone1')) != '') {
      $phone1 = new UnknownVoterPhone;
      $phone1->unknown_voter_id = $tempVoter->id;
      $phone1->phone_number = $request->input('phone1');
      $phone1->phone_type_id = 1; //regular phone
      $phone1->save();
    }
    if ($request->input('phone2') != null && trim($request->input('phone2')) != '') {
      $phone2 = new UnknownVoterPhone;
      $phone2->unknown_voter_id = $tempVoter->id;
      $phone2->phone_number = $request->input('phone2');
      $phone2->phone_type_id = 2; //cell  phone
      $phone2->save();
    }
    $jsonOutput->setData($tempVoter->key);
  }

  /*
    Function that edits tempVoter by its key and POST params
  */
  public function editTempVoter(Request $request, $key)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($request->input('first_name') == null || trim($request->input('first_name')) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_TEMP_VOTER_FIRST_NAME'));
      return;
    }
    if (($request->input('email') == null || trim($request->input('email')) == '') && ($request->input('phone1') == null || trim($request->input('phone1')) == '') && ($request->input('phone2') == null || trim($request->input('phone2')) == '')) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_TEMP_VOTER_CONTACT_DATA'));
      return;
    }
    if ($request->input('email') != null && trim($request->input('email')) != '') {
      if (filter_var($request->input('email'), FILTER_VALIDATE_EMAIL) === false) {
        $jsonOutput->setErrorCode(config('errors.crm.WRONG_EMAIL_OF_TEMP_VOTER'));
        return;
      }
    }

    if ($request->input('house') != null && trim($request->input('house')) != '') {
      if (!is_numeric($request->input('house'))) {
        $jsonOutput->setErrorCode(config('errors.crm.WRONG_HOUSE_NUMBER'));
        return;
      }
    }

    if ($request->input('personal_identity') != null && trim($request->input('personal_identity')) != '') {
      $existingVoter = Voters::withFilters()->where('personal_identity', $request->input('personal_identity'))->first(['voters.id']);
      if ($existingVoter) {
        $jsonOutput->setData(false);
        return;
      }
    }

    $tempVoter = TempVoter::where('key', $key)->first();

    if ($request->input('first_name') != null && trim($request->input('first_name')) != '') {
      $tempVoter->first_name = $request->input('first_name');
    }
    $tempVoter->personal_identity = $request->input('personal_identity');
    // if ($request->input('last_name') != null && trim($request->input('last_name')) != '') {
    $tempVoter->last_name = $request->input('last_name');
    // }
    //if ($request->input('passport') != null && trim($request->input('last_name')) != '') {
    $tempVoter->passport = $request->input('passport');
    //}
    // if ($request->input('birth_date') != null && trim($request->input('birth_date')) != '') {
    if ($request->input('birth_date_type') != null && trim($request->input('birth_date_type')) != '') {
      $tempVoter->birth_date = $request->input('birth_date');
      $tempVoter->birth_date_type = $request->input('birth_date_type');
    }
    // }
    //if (trim($request->input('gender_id')) != '') {
    $tempVoter->gender = $request->input('gender_id');
    //}
    // if ($request->input('city_id') != null && trim($request->input('city_id')) != '') {
    $tempVoter->city_id = $request->input('city_id');
    //}
    //if ($request->input('neighborhood') != null && trim($request->input('neighborhood')) != '') {
    $tempVoter->neighborhood = $request->input('neighborhood');
    // }
    //if ($request->input('street') != null && trim($request->input('street')) != '') {
    if ($request->input('street_id') != null && trim($request->input('street_id')) != '') {
      $tempVoter->street_id = $request->input('street_id');
    }
    // }
    //if ($request->input('house') != null && trim($request->input('house')) != '') {
    $tempVoter->house = $request->input('house');
    // }
    //if ($request->input('house_entry') != null && trim($request->input('house_entry')) != '') {
    $tempVoter->house_entry = $request->input('house_entry');
    // }
    // if ($request->input('flat') != null && trim($request->input('flat')) != '') {
    $tempVoter->flat = $request->input('flat');
    // }
    // if ($request->input('zip') != null && trim($request->input('zip')) != '') {
    $tempVoter->zip = $request->input('zip');
    // }
    //  if ($request->input('email') != null && trim($request->input('email')) != '') {
    $tempVoter->email = $request->input('email');
    // }
    $phones = UnknownVoterPhone::where('unknown_voter_id', $tempVoter->id)->get();
    for ($i = 0; $i < sizeof($phones); $i++) {
      $phones[$i]->forceDelete();
    }
    $tempVoter->save();
    if ($request->input('phone1') != null && trim($request->input('phone1')) != '') {
      $phone1 = new UnknownVoterPhone;
      $phone1->unknown_voter_id = $tempVoter->id;
      $phone1->phone_number = $request->input('phone1');
      $phone1->phone_type_id = 1; //regular phone
      $phone1->save();
    }
    if ($request->input('phone2') != null && trim($request->input('phone2')) != '') {
      $phone2 = new UnknownVoterPhone;
      $phone2->unknown_voter_id = $tempVoter->id;
      $phone2->phone_number = $request->input('phone2');
      $phone2->phone_type_id = 2; //cell  phone
      $phone2->save();
    }
    $jsonOutput->setData($tempVoter->key);
  }

  /**
   * Get all request if key is null , or get specific request by requestKey
   *
   * @param null $reqKey
   */
  public function getRequest($reqKey = null)
  {

    $jsonOutput = app()->make("JsonOutput");

    try {
      if (null == $reqKey) {
        $crmRequests = CrmRequestRepository::getAllRequest();
      } else {
        $crmRequests = CrmRequestRepository::getRequestDetailsByKey($reqKey);

        if ($crmRequests != null && $crmRequests->unknown_voter_id > 0) {
          $crmRequests->unknown_voter_data = TempVoterRepository::getTempVoterDetailsById($crmRequests->unknown_voter_id);
          if ($crmRequests->unknown_voter_data && $crmRequests->unknown_voter_data->city_id) {
            $crmRequests->unknown_voter_data->streets = StreetRepository::getByCityId($crmRequests->unknown_voter_data->city_id);
          } else
            $crmRequests->unknown_voter_data->streets = array();
        }

        $crmRequests->first_desc = '';
        $currentAction = CrmRequestRepository::getRequestDescriptionAction($crmRequests->reqId);
        if ($currentAction) {
          $crmRequests->first_desc = $currentAction->description;
        }

        $crmRequests->target_close_date = substr($crmRequests->target_close_date, 0, 10);
        $arrDateParts = explode('-', $crmRequests->target_close_date);
        $crmRequests->target_close_date = $arrDateParts[2] . '/' . $arrDateParts[1] . '/' . $arrDateParts[0];

        $arrDateTimeParts = explode(' ', $crmRequests->date);
        $arrDateOnlyParts = explode('-', $arrDateTimeParts[0]);
        $crmRequests->date = $arrDateOnlyParts[2] . '/' . $arrDateOnlyParts[1] . '/' . $arrDateOnlyParts[0] . ' ' . $arrDateTimeParts[1];

        //mark request as opened.
        CrmRequestRepository::updateCrmRequestOpenedByRequestKey($reqKey);
      }

      $jsonOutput->setData($crmRequests);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  /*
    Private helpful function that casll to function 'addRequestSourceItemsHistory'
    with correct params by systemName
  */
  private function addRequestSourceHistory(&$historyArrayFileds, $requestArray, $systemName = false)
  {
    switch ($systemName) {
      case 'email':
        $this->addRequestSourceItemsHistory($historyArrayFileds, $requestArray, ['email']);
        break;
      case 'fax':
        $this->addRequestSourceItemsHistory($historyArrayFileds, $requestArray, ['fax']);
        break;
      case 'other':
        $this->addRequestSourceItemsHistory($historyArrayFileds, $requestArray, ['first_name', 'last_name', 'phone']);
        break;
      case 'callbiz':
        $this->addRequestSourceItemsHistory(
          $historyArrayFileds,
          $requestArray,
          ['new_callBiz_datetime', 'new_callBiz_ID', 'new_callBiz_details'],
          true
        );
        break;
    }
  }

  /*
    Private helpful function that constructs historyFieldsArray by parameters
  */
  private function addRequestSourceItemsHistory(&$historyArrayFileds, $requestArray, $historyFields, $isCallBizz = false)
  {
    $exp = !$isCallBizz ? 'request_source_' : '';
    foreach ($historyFields as $field) {
      $key = $exp . $field;

      $newValue = !empty($requestArray[$key]) ? $requestArray[$key] : null;
      $oldValue = !empty($requestArray['old_' . $key]) ? $requestArray['old_' . $key] : null;
      if ($newValue != $oldValue) {
        $insertFields = [
          'field_name' => $key,
          'display_field_name' => config('history.CrmRequest.' . $key)
        ];
        $insertFields['old_value'] = $oldValue;
        $insertFields['new_value'] = $newValue;
        $historyArrayFileds[] = $insertFields;
      }
    }
  }

  /*
    Private helpful that sets history old and new values
  */
  private function getEditedRequestModel(&$fieldsArray, $requestArray, $oldRequestValues, $requestFields, $updatedRequest)
  {
    foreach ($requestFields as $fieldName => $fieldValueName) {
      $oldFieldNumValue = $oldRequestValues[$fieldName];
      $oldFieldValue = !empty($requestArray['old_' . $fieldValueName]) ? $requestArray['old_' . $fieldValueName] : '';
      $newFieldValue = !empty($requestArray[$fieldValueName]) ? $requestArray[$fieldValueName] : '';

      if ($oldFieldNumValue != $updatedRequest[$fieldName]) {
        $insertFields = [
          'field_name' => $fieldName,
          'display_field_name' => config('history.CrmRequest.' . $fieldName)
        ];
        switch ($fieldName) {
          case 'date':
          case 'close_date':
          case 'target_close_date':
            $insertFields['old_value'] = date('d/m/Y', strtotime($updatedRequest->{$fieldName}));
            $insertFields['new_value'] = date('d/m/Y', strtotime($oldFieldNumValue));
            break;

          default:
            $insertFields['old_numeric_value'] = $updatedRequest->{$fieldName};
            $insertFields['new_numeric_value'] = $oldFieldNumValue;
            $insertFields['old_value'] = $oldFieldValue;
            $insertFields['new_value'] = $newFieldValue;
            break;
        }

        $fieldsArray[] = $insertFields;
      }
    }
  }

  /**
   * Function that edits request by request key and POST params
   * @param Request $request
   * @param $reqKey
   */
  public function editRequest(Request $request, $reqKey)
  {
    try {
      $jsonOutput = app()->make("JsonOutput");
      $crmRequestRequest = new CrmRequestRequest($request, $reqKey);
      $crmRequestRequest->crmRequestDto->requestActionType = RequestAction::REQUEST_ACTION_UPDATE_REQUEST;
      $crmRequest = RequestUpdator::update($crmRequestRequest->crmRequestDto);
      $jsonOutput->setData($crmRequest); //,
    } catch (\Throwable $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  /*
    Private helpful function that performs sending email
  */
  private function sendEmail($to, $title, $body)
  {
    if (config('settings.send_request_email')) {
      Mail::to($to)->send(new GeneralEmail($title, $body));
    }
  }

  /*
    Private helpful function that sends email at creating new crmRequest
  */
  private function sendEmailNewRequest($to, $requestDetails, $topicName, $subTopicName, $teamName, $teamDetails)
  {
    //  if (config('settings.send_request_email')) {
    $data = [
      'requestKey' => $requestDetails->key,
      'topicName' => $topicName,
      'subTopicName' => $subTopicName,
      'teamName' => $teamName,
      'teamTitle' => $teamDetails->title,
      'teamSignature' => $teamDetails->signature,
      'teamPhoneNumber' => $teamDetails->phone_number
    ];

    $sendEmailMessage = new SendMessageDto();
    $sendEmailMessage->voter_id = $requestDetails->voter_id;
    $sendEmailMessage->messageEntityType = MessageEntityType::ENTITY_TYPE_REQUEST;
    $sendEmailMessage->messageEntityTypeValue = $requestDetails->id;
    $sendEmailMessage->isPhoneMessage = CommonEnum::NO;
    $sendEmailMessage->emailBlade = 'RequestOpened';
    $sendEmailMessage->dynamicValuesMessage = $data;
    $sendEmailMessage->email = $to;
    $sendEmailMessage->messageTemplate = MessageTemplate::VOTER_MESSAGE_ON_CREATE_REQUEST;
    $sendEmailMessage->subjectTemplateMessage = MessageTemplate::VOTER_MESSAGE_ON_CREATE_REQUEST_SUBJECT;
    SendMessageService::sendMessage($sendEmailMessage);
  }

  /*
    Private helpful function that sends email at setting status of existing crmRequest as closed
  */
  private function sendEmailClosedRequest($to, $requestKey, $topicName, $subTopicName, $teamName, $closingReason)
  {
    if (config('settings.send_request_email')) {
      Mail::to($to)->send(new RequestClosed($requestKey, $topicName, $subTopicName, $teamName, $closingReason));
    }
  }

  /*
    Private helpful function that sends RequestTransfered email
  */
  private function sendEmailTransferedRequest($to, $requestKey, $fullName, $topicName, $subTopicName, $personalIdentity, $firstName, $LastName, $Address, $firstDesc)
  {
    if (config('settings.send_request_email')) {
      Mail::to($to)->send(new RequestTransfered($requestKey, $fullName, $topicName, $subTopicName, $personalIdentity, $firstName, $LastName, $Address, $firstDesc));
    }
  }

  /*
    Function that update voter_id of crmRequest
  */
  public function updateRequestVoter(Request $request, $reqKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if ($reqKey == null || trim($reqKey) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_KEY'));
      return;
    }

    $crmRequest = CrmRequest::select('id')->where('key', $reqKey)->first();
    if ($crmRequest) {
      $requestId = $crmRequest['id'];
      $voterKey = trim($request->input('voterKey'));

      if ($voterKey) {
        $voter = Voters::select('voters.id')->withFilters()->where('voters.key', $voterKey)->first();
        CrmRequest::where('id', $requestId)->update(['voter_id' => $voter['id']]);
      }
    }
    $jsonOutput->setData('');
  }

  /**
   * Function that checks and returns whether dateTime variable is in correct format
   * @param Request $request
   */
  public static function checkDateTimeCorrectFormat($dateTimeStr)
  {
    $returnedValue = false;
    if ($dateTimeStr != null && $dateTimeStr != '' && trim($dateTimeStr) != '') {
      $len = strlen($dateTimeStr);
      if ($len == 19) {
        $dtArr = explode(' ', $dateTimeStr);
        if (sizeof($dtArr) == 2) {

          $dateArray = explode('-', $dtArr[0]);
          $timeArray = explode(':', $dtArr[1]);
          if (sizeof($dateArray) == 3 && sizeof($timeArray) == 3) {

            if (is_numeric($dateArray[0]) && is_numeric($dateArray[1]) && is_numeric($dateArray[2])) {
              if (checkdate($dateArray[1], $dateArray[2], $dateArray[0])) {

                if (is_numeric($timeArray[0]) && is_numeric($timeArray[1]) && is_numeric($timeArray[2])) {
                  $hours = intval($timeArray[0]);
                  $minutes = intval($timeArray[1]);
                  $seconds = intval($timeArray[1]);
                  if ($hours >= 0 && $hours <= 24) {
                    if ($minutes >= 0 && $minutes <= 60) {
                      if ($seconds >= 0 && $seconds <= 60) {
                        $returnedValue = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } elseif ($len == 10) {
        $dateArray = explode('-', $dateTimeStr);
        if (sizeof($dateArray) == 3) {
          if (checkdate($dateArray[1], $dateArray[2], $dateArray[0])) {
            $returnedValue = true;
          }
        }
      }
    }

    return $returnedValue;
  }

  /*
    Private helpful that constructs history array for crmRequest-Message
  */
  private function getNewRequestMessageModel($newMessage)
  {
    $messageFields = [
      ['name' => 'entity_type', 'type' => 'numeric', 'value' => $newMessage->entity_type],
      ['name' => 'entity_id', 'type' => 'numeric', 'value' => $newMessage->entity_id],
      ['name' => 'subject', 'type' => 'char', 'value' => $newMessage->subject],
      ['name' => 'body', 'type' => 'char', 'value' => $newMessage->body]
    ];

    $fieldsArray = [];
    for ($fieldIndex = 0; $fieldIndex < count($messageFields); $fieldIndex++) {
      $fieldName = $messageFields[$fieldIndex]['name'];

      $insertField = [
        'field_name' => $fieldName,
        'display_field_name' => config('history.Message.' . $fieldName)
      ];

      if ('numeric' == $messageFields[$fieldIndex]['type']) {
        $insertField['new_numeric_value'] = $messageFields[$fieldIndex]['value'];
      } else {
        $insertField['new_value'] = $messageFields[$fieldIndex]['value'];
      }

      $fieldsArray[] = $insertField;
    }

    $fieldsArray[] = [
      'field_name' => 'type',
      'display_field_name' => config('history.Message.type'),
      'new_value' => 'אימייל',
      'new_numeric_value' => config('constants.MESSAGE_TYPE_EMAIL')
    ];

    $fieldsArray[] = [
      'field_name' => 'direction',
      'display_field_name' => config('history.Message.direction'),
      'new_value' => 'יוצאת',
      'new_numeric_value' => config('constants.MESSAGE_DIRECTION_OUT')
    ];

    $model = [
      'description' => 'הוספת הודעה להוספת פניה',
      'referenced_model' => 'Message',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $newMessage->id,
      'valuesList' => $fieldsArray
    ];

    return $model;
  }

  /*
    Private helpful that constructs history array for crmRequest-Callbiz
  */
  private function getNewRequestCallbizModel($newCallbiz)
  {
    $callBizFields = [
      'request_id',
      'callbiz_id',
      'user_create_id',
      'date',
      'details'
    ];


    $historyFieldsNames = [];
    for ($fieldIndex = 0; $fieldIndex < count($callBizFields); $fieldIndex++) {
      $fieldName = $callBizFields[$fieldIndex];

      $historyFieldsNames[$fieldName] = config('history.CrmRequestCallBiz.' . $fieldName);
    }

    $fieldsArray = [];
    foreach ($historyFieldsNames as $fieldName => $display_field_name) {
      $insertFields = [
        'field_name' => $fieldName,
        'display_field_name' => $display_field_name
      ];

      if ('details' == $fieldName || 'date' == $fieldName) {
        $insertFields['new_value'] = $newCallbiz->{$fieldName};
      } else {
        $insertFields['new_numeric_value'] = $newCallbiz->{$fieldName};
      }

      $fieldsArray[] = $insertFields;
    }

    $model = [
      'description' => 'הוספת פניה ממוקד פניות',
      'referenced_model' => 'CrmRequestCallBiz',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $newCallbiz->id,
      'valuesList' => $fieldsArray
    ];

    return $model;
  }

  /*
    Private helpful that constructs history array for crmRequest-Action
  */
  private function  getNewRequestActionModel($newAction)
  {
    $actionFields = [
      'entity_type',
      'entity_id',
      'action_type',
      'action_topic_id',
      'action_status_id',
      'description'
    ];

    $historyFieldsNames = [];
    for ($fieldIndex = 0; $fieldIndex < count($actionFields); $fieldIndex++) {
      $fieldName = $actionFields[$fieldIndex];

      switch ($fieldName) {
        case 'entity_type':
        case 'entity_id':
          $historyFieldsNames[$fieldName] = config('history.Action.' . $fieldName . '.request');
          break;

        default:
          $historyFieldsNames[$fieldName] = config('history.Action.' . $fieldName);
          break;
      }
    }

    $fieldsArray = [];
    foreach ($historyFieldsNames as $fieldName => $display_field_name) {
      $insertFields = [
        'field_name' => $fieldName,
        'display_field_name' => $display_field_name
      ];

      if ('description' == $fieldName) {
        $insertFields['new_value'] = $newAction->description;
      } else {
        $insertFields['new_numeric_value'] = $newAction->{$fieldName};
      }

      $fieldsArray[] = $insertFields;
    }

    $model = [
      'description' => 'הוספת פעולה לפניה',
      'referenced_model' => 'Action',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $newAction->id,
      'valuesList' => $fieldsArray
    ];

    return $model;
  }

  /*
    Private helpful that constructs history array for crmRequest generally
  */
  private function getNewRequestModel($newCrmRequest, $request)
  {
    $requestFields = [
      'date' => null,
      'target_close_date' => null,
      'request_priority_id' => 'priority_name',
      'request_source_id' => 'request_source_name',
      'status_id' => 'status_name',
      'user_handler_id' => 'user_handle_name',
      'team_handler_id' => 'team_handle_name',
      'user_create_id' => null
    ];


    $dateFields = ['date', 'target_close_date'];
    $fieldsArray = [];
    foreach ($requestFields as $fieldName => $name) {
      $insertFields = [
        'field_name' => $fieldName,
        'display_field_name' => config('history.CrmRequest.' . $fieldName)
      ];

      if (in_array($fieldName, $dateFields)) {
        $insertFields['new_value'] = $newCrmRequest->{$fieldName};
      } else {
        if ($request->input($fieldName, null)) {
          $insertFields['new_value'] = $request->input($name, '');
        } else {
          $insertFields['new_numeric_value'] = $newCrmRequest->{$fieldName} ? $newCrmRequest->{$fieldName} : '';
        }
      }
      $fieldsArray[] = $insertFields;
    }
    $model = [
      'referenced_model' => 'CrmRequest',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $newCrmRequest->id,
      'valuesList' => $fieldsArray
    ];
    return $model;
  }

  /*
    Function that adds new crmRequest to database by POST params
  */
  public function addRequest(Request $request)
  {
    Debugbar::info('Add New Request');


    $jsonOutput = app()->make("JsonOutput");
    if (!$this->checkDateTimeCorrectFormat($request->input('target_close_date_timestamp'))) {
      $jsonOutput->setErrorCode(config('errors.crm.WRONG_REQUEST_TARGET_CLOSE_DATE'));
    } elseif ($request->input('close_date') != null && $request->input('close_date') != 'null' && trim($request->input('close_date')) != '' && !$this->checkDateTimeCorrectFormat($request->input('close_date'))) {
      $jsonOutput->setErrorCode(config('errors.crm.WRONG_REQUEST_CLOSE_DATE'));
    } elseif ($request->input('request_date') != null && trim($request->input('request_date')) != '' && !$this->checkDateTimeCorrectFormat($request->input('request_date'))) {
      $jsonOutput->setErrorCode(config('errors.crm.WRONG_REQUEST_DATE'));
    } elseif ($request->input('topic_id') == null || trim($request->input('topic_id')) == '' || !is_numeric($request->input('topic_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_TOPIC'));
    } elseif ($request->input('sub_topic_id') == null || trim($request->input('sub_topic_id')) == '' || !is_numeric($request->input('sub_topic_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_SUB_TOPIC'));
    } elseif ($request->input('request_priority_id') == null || trim($request->input('request_priority_id')) == '' || !is_numeric($request->input('request_priority_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_PRIOTIY'));
    }  //excluded for production!
    elseif ($request->input('request_source_id') == null || trim($request->input('request_source_id')) == '' || !is_numeric($request->input('request_source_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_SOURCE'));
    } elseif ($request->input('status_id') == null || trim($request->input('status_id')) == '' || !is_numeric($request->input('status_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_STATUS'));
    } elseif ($request->input('user_handler_id') == null || trim($request->input('user_handler_id')) == '' || !is_numeric($request->input('user_handler_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_USER_HANDLER'));
    } elseif ($request->input('team_handler_id') == null || trim($request->input('team_handler_id')) == '' || !is_numeric($request->input('team_handler_id'))) {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_TEAM_HANDLER'));
    } else {
      $reqTpcID = $request->input('topic_id'); //CrmRequestTopic::where('id', $request->input('topic_id'))->where('parent_id', 0)->first();
      $reqSubTpcID = $request->input('sub_topic_id'); //CrmRequestTopic::where('id', $request->input('sub_topic_id'))->first();
      $reqPrioID = $request->input('request_priority_id'); //CrmRequestPriority::where('id', $request->input('request_priority_id'))->first();
      //excluded for production!
      $reqSourceID = RequestSource::where('id', $request->input('request_source_id'))->first();
      $reqStaID = $request->input('status_id'); //CrmRequestStatus::where('id', $request->input('status_id'))->first();
      $reqUsrID = $request->input('user_handler_id'); //User::where('id', $request->input('user_handler_id'))->first();
      $reqTimID = Teams::where('id', $request->input('team_handler_id'))->where('deleted', 0)->first();

      if (!$reqSourceID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_SOURCE_NOT_EXISTS'));
      } else {
        if ($reqSourceID->system_name == "fax" || $reqSourceID->system_name == "email") {
          if ($request->input('document_name') == null || trim($request->input('document_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.DOCUMENT_MISSING_FILE_KEY'));
          }
          if ($request->file('file_upload') == null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_DOCUMENT_FILE'));
          }
        }
        if ($reqSourceID->system_name == "fax") {
          if ($request->input('request_source_fax') == null || trim($request->input('request_source_fax')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_SOURCE_FAX'));
          }
        }
        if ($reqSourceID->system_name == "email") {
          if ($request->input('request_source_email') == null || trim($request->input('request_source_email')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_SOURCE_EMAIL'));
          }
        }
        if ($reqSourceID->system_name == "other") {
          if ($request->input('request_source_first_name') == null || trim($request->input('request_source_first_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_SOURCE_FIRST_NAME'));
          }
          /*if($request->input('request_source_last_name') == null || trim($request->input('request_source_last_name')) == ''){
                        $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_SOURCE_LAST_NAME'));
                    }*/
          if ($request->input('request_source_phone') == null || trim($request->input('request_source_phone')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_SOURCE_PHONE'));
          } else {
            if (!VoterPhoneRepository::validate($request->input('request_source_phone')))
              $jsonOutput->setErrorCode(config('errors.system.VOTER_ACTIVIST_MISSING_VALID_PHONE'));
          }
        }
        if ($reqSourceID->system_name == "callbiz") {
          if ($request->input('callBiz_id') == null || trim($request->input('callBiz_id')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_CALLBIZ_DETAILS'));
          }
          if (strlen($request->input('callBiz_id')) > 25) {
            $jsonOutput->setErrorCode(config('errors.system.CALLBIZ_ID_LENGTH_INVALID'));
          }
          if ($request->input('callbiz_datetime') == null || trim($request->input('callbiz_datetime')) == '' || !$this->checkDateTimeCorrectFormat($request->input('callbiz_datetime'))) {
            $jsonOutput->setErrorCode(config('errors.system.INVALID_REQUEST_CALLBIZ_DATETIME'));
          }
          if ($request->input('callBiz_details') == null || trim($request->input('callBiz_details')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_REQUEST_CALLBIZ_DETAILS'));
          }
          if (strlen($request->input('callBiz_details')) > 3000) {
            $jsonOutput->setErrorCode(config('errors.system.CALLBIZ_DETAILS_LENGTH_INVALID'));
          } else {
            $callBizTestExistingRow = CrmRequestCallBiz::where('callbiz_id', $request->input('callbiz_id'))->first();
            if (trim($request->input('callbiz_id')) != '' && $callBizTestExistingRow) {
              $jsonOutput->setErrorCode(config('errors.crm.CALLBIZ_REQUEST_INCONSISTENCY'));
              return;
            }
          }
        }
      }
      if (!$reqTpcID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_TOPIC_NOT_EXISTS'));
      } elseif (!$reqSubTpcID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_SUB_TOPIC_NOT_EXISTS'));
      } elseif (!$reqPrioID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_PRIOTIY_NOT_EXISTS'));
      } elseif (!$reqStaID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_STATUS_NOT_EXISTS'));
      } elseif (!$reqUsrID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_USER_HANDLER_NOT_EXISTS'));
      } elseif (!$reqTimID) {
        $jsonOutput->setErrorCode(config('errors.crm.REQUEST_TEAM_HANDLER_NOT_EXISTS'));
      } else {
        $newTempVoterID = 0;
        $newCrmRequest = new CrmRequest;
        if ($request->input('is_temp_voter') == 'false') {
          $newCrmRequest->voter_id = $request->input('voter_id');
          $newCrmRequest->unknown_voter_id = 0;
        } else {
          $newCrmRequest->voter_id = 0;
          $existingTempVoter = TempVoter::where('key', $request->input('temp_voter_key'))->first();
          if (!is_null($existingTempVoter->personal_identity) && $existingTempVoter->personal_identity != '') {
            $voter = VotersRepository::getVoterByPersonalIdentity($existingTempVoter->personal_identity);
            $newCrmRequest->voter_id = $voter->id;
          }

          if ($existingTempVoter) {
            $newCrmRequest->unknown_voter_id = $existingTempVoter->id;
          }
        }
        if ($reqSourceID->system_name == "fax") {
          $newCrmRequest->request_source_fax = $request->input('request_source_fax');
        }
        if ($reqSourceID->system_name == "email") {
          $newCrmRequest->request_source_email = $request->input('request_source_email');
        }
        if ($reqSourceID->system_name == "other") {
          $newCrmRequest->request_source_first_name = $request->input('request_source_first_name');
          $newCrmRequest->request_source_last_name = $request->input('request_source_last_name');
          $newCrmRequest->request_source_phone = str_replace('-', '', $request->input('request_source_phone'));
          if ($newCrmRequest->request_source_phone)
            $newCrmRequest->request_source_phone = Helper::removeAllNoneNumericCharacters($newCrmRequest->request_source_phone);

          $savePhone = $request->input('save_voter_phone', 0);

          if ($newCrmRequest->voter_id != 0 &&  $newCrmRequest->request_source_phone != '' && $savePhone == CommonEnum::YES) {
            RequestCreator::saveVoterPhoneForOtherTypeRequest($newCrmRequest->voter_id, $newCrmRequest->request_source_phone);
          }
        }
        $newCrmRequest->topic_id = $request->input('topic_id');
        $newCrmRequest->sub_topic_id = $request->input('sub_topic_id');
        if ($request->input('close_date') == 'null') {
          $newCrmRequest->close_date = null;
        } else {
          $newCrmRequest->close_date = $request->input('close_date');
        }
        $newCrmRequest->date = $request->input('request_date');
        $newCrmRequest->target_close_date = $request->input('target_close_date_timestamp');
        $newCrmRequest->request_priority_id = $request->input('request_priority_id');
        $newCrmRequest->request_source_id = $request->input('request_source_id'); //excluded for production
        $newCrmRequest->status_id = $request->input('status_id');
        $newCrmRequest->user_handler_id = $request->input('user_handler_id');
        $newCrmRequest->team_handler_id = $request->input('team_handler_id');
        $newCrmRequest->user_create_id = Auth::user()->id;
        $newCrmRequest->user_update_id = Auth::user()->id;
        $keyCrmReq = Helper::getNewTableKey('requests', 6, 1);
        $newCrmRequest->key = $keyCrmReq;
        $newCrmRequest->save();
        //send sms or ivr to user hundeld request
        RequestCreator::sendSmsToRequest($newCrmRequest);

        $historyArgsArr = [
          'topicName' => 'crm.requests.add',
          'models' => []
        ];

        $historyArgsArr['models'][] = $this->getNewRequestModel($newCrmRequest, $request);

        if ($reqSourceID) {
          if (($reqSourceID->system_name == "fax" || $reqSourceID->system_name == "email") && ($request->file('file_upload') != null)) { //excluded for production
            $entity_type = config('constants.ENTITY_TYPE_REQUEST');
            $routeName = '';
            $modelDoc = DocumentController::addDocumentRequest(
              $request->input('document_name'),
              $request->file('file_upload'),
              $newCrmRequest,
              $entity_type,
              $routeName,
              true
            );

            $historyArgsArr['models'][] = $modelDoc;
          }
          if ($reqSourceID->system_name == "callbiz") {
            $newCallbiz = $this->AddCallBizRequest(
              $request->input('callBiz_id'),
              $request->input('callbiz_datetime'),
              $request->input('callBiz_details'),
              $newCrmRequest->key
            );

            $historyArgsArr['models'][] = $this->getNewRequestCallbizModel($newCallbiz);
          }
        }

        if ($newCrmRequest->user_handler_id != $newCrmRequest->user_create_id) {
          $userHdlData = User::select(['email', 'voter_id'])->where('id', $newCrmRequest->user_handler_id)->first();
          $userCrtData = User::select(['email', 'voter_id'])->where('id', $newCrmRequest->user_create_id)->first();
          if ($userHdlData) {
            if (!filter_var($userHdlData->email, FILTER_VALIDATE_EMAIL) === false) {

              $fullName = '';
              if ($userCrtData) {
                $prevHdlName = Voters::select(['first_name', 'last_name'])->withFilters()->where('voters.id', $userCrtData->voter_id)->first();

                if ($prevHdlName) {
                  $fullName = $prevHdlName->first_name . ' ' . $prevHdlName->last_name;
                }
              }
              $subjectPersonalIdentity = '';
              $subjectFirstName = '';
              $subjectLastName = '';
              $subjectAddress = '';
              if ($newCrmRequest->unknown_voter_id == 0 && $newCrmRequest->voter_id > 0) {
                //existing voter :
                $existingVoterData = Voters::select('voters.*')->withFilters()->where('voters.id', $newCrmRequest->voter_id)->first();
                if ($existingVoterData) {
                  $subjectPersonalIdentity = $existingVoterData->personal_identity;
                  $subjectFirstName = $existingVoterData->first_name;
                  $subjectLastName = $existingVoterData->last_name;
                  if ($existingVoterData->city != NULL && trim($existingVoterData->city) != '') {
                    $subjectAddress .= $existingVoterData->city . ' ';
                  }
                  if ($existingVoterData->street != NULL && trim($existingVoterData->street) != '') {
                    $subjectAddress .= $existingVoterData->street . ' ';
                  }
                  if ($existingVoterData->house != NULL && trim($existingVoterData->house) != '') {
                    $subjectAddress .= $existingVoterData->house;
                    if ($existingVoterData->flat != NULL && trim($existingVoterData->flat) != '') {
                      $subjectAddress .= '/' . $existingVoterData->flat;
                    }
                  }
                }
              } else if ($newCrmRequest->voter_id == 0 && $newCrmRequest->unknown_voter_id > 0) {
                //unknown voter :
                $existingVoterData = TempVoter::where('id', $newCrmRequest->unknown_voter_id)->first();
                if ($existingVoterData) {
                  $subjectPersonalIdentity = $existingVoterData->personal_identity == NULL ? '' : $existingVoterData->personal_identity;
                  $subjectFirstName = $existingVoterData->first_name;
                  $subjectLastName = $existingVoterData->last_name == NULL ? '' : $existingVoterData->last_name;
                  if ($existingVoterData->city_id != NULL) {
                    $cityData = City::where('id', $existingVoterData->city_id)->first();
                    if ($cityData) {
                      $subjectAddress .= $cityData->name . ' ';
                    }
                  }
                  if ($existingVoterData->street != NULL && trim($existingVoterData->street) != '') {
                    $subjectAddress .= $existingVoterData->street . ' ';
                  }
                  if ($existingVoterData->house != NULL && trim($existingVoterData->house) != '') {
                    $subjectAddress .= $existingVoterData->house;
                    if ($existingVoterData->flat != NULL && trim($existingVoterData->flat) != '') {
                      $subjectAddress .= '/' . $existingVoterData->flat;
                    }
                  }
                }
              }
              $first_desc = $request->input('first_desc', '');
              $this->sendEmailTransferedRequest($userHdlData->email, $newCrmRequest->key, $fullName, $request->input('static_topic_name'), $request->input('static_sub_topic_name'), $subjectPersonalIdentity, $subjectFirstName, $subjectLastName, $subjectAddress, $first_desc);
            }
          }
        }
        $actionTopic = ActionTopic::select('id', 'system_name')->where('system_name', 'request.new')->first();

        $action = new Action;
        $action->entity_type = config('constants.ENTITY_TYPE_REQUEST');
        $action->entity_id = $newCrmRequest->id;
        $action->action_type = 1;
        $action->action_topic_id = $actionTopic->id;
        $action->action_status_id = config('constants.ACTION_STATUS_DONE');
        $action->conversation_direction = NULL;
        $action->conversation_with_other = '';
        $action->description = $request->input('first_desc', '');
        $action->user_create_id = Auth::user()->id;
        $action->key = Helper::getNewTableKey('actions', 10);
        $action->save();

        $historyArgsArr['models'][] = $this->getNewRequestActionModel($action);
        //$title = $reqTimID->title ? $reqTimID->title : 'מפלגת שס';

        ActionController::AddHistoryItem($historyArgsArr);

        $usrVtr = User::select(['voter_id', 'email'])->where('id', $newCrmRequest->user_handler_id)->first();
        if ($request->input('is_temp_voter') == 'false') {
          $voterEmail = Voters::select(['voters.id', 'email'])->withFilters()->where('voters.id', $request->input('voter_id'))->first();
          if ($voterEmail) {
            if ($voterEmail->email != NULL && trim($voterEmail->email) != '') {
              if (!filter_var($voterEmail->email, FILTER_VALIDATE_EMAIL) === false) {
                if ($usrVtr && $usrVtr->voter_id == $request->input('voter_id')) {
                  // $this->sendEmail($voterEmail->email , 'פנייתך כמשתמש מטפל שמספרה  ' . $newCrmRequest->key . ' למפלגת ש"ס' + ' ' + 'התקבלה', $addMessage->body);
                } else {
                  $this->sendEmailNewRequest($voterEmail->email, $newCrmRequest, $request->input('topic_name'), $request->input('sub_topic_name'), $request->input('team_handle_name'), $reqTimID);
                  //old email
                  // $this->sendEmail($voterEmail->email, $addMessage->subject, $addMessage->body);
                  if (!filter_var($usrVtr->email, FILTER_VALIDATE_EMAIL) === false) {
                    //  $this->sendEmail($usrVtr->email , 'התקבלה פנייה מתושב שמספרה  ' . $newCrmRequest->key . ' למפלגת ש"ס' , $addMessage->body);
                  }
                }
              }
            }
          }
        } else {
          $existingTempVoter = TempVoter::select('email')->where('key', $request->input('temp_voter_key'))->first();
          if ($existingTempVoter) {
            if ($existingTempVoter->email != NULL && trim($existingTempVoter->email) != '') {
              if (!filter_var($existingTempVoter->email, FILTER_VALIDATE_EMAIL) === false) {
                $this->sendEmailNewRequest($existingTempVoter->email, $newCrmRequest, $request->input('topic_name'), $request->input('sub_topic_name'), $request->input('team_handle_name'), $reqTimID);
                //old email
                //$this->sendEmail($existingTempVoter->email, $addMessage->subject, $addMessage->body);
                if (!filter_var($usrVtr->email, FILTER_VALIDATE_EMAIL) === false) {
                  //$this->sendEmail($usrVtr->email , 'התקבלה פנייה מתושב שמספרה  ' . $newCrmRequest->key . ' למפלגת ש"ס' , $addMessage->body);
                }
              }
            }
          }
        }
        $jsonOutput->setData($keyCrmReq);
      }
    }
  }

  /*
    Function that update email of voter by voterKey
  */
  public function updateVoterByTypeEmail(Request $request, $votKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($request->input('new_email') != NULL && trim($request->input('new_email')) != '') {
      if (!filter_var($request->input('new_email'), FILTER_VALIDATE_EMAIL) === false) {
      } else {
        $jsonOutput->setErrorCode(config('errors.crm.INVALID_EMAIL'));
        return;
      }
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_EMAIL'));
      return;
    }
    if ($request->input('unknown_voter') == '0') { //regular voter
      $voter = Voters::where('key', $votKey)->first();
      if ($voter) {
        $voter->email = $request->input('new_email');
        $voter->save();
        $jsonOutput->setData('ok' . $request->input('new_email'));
        return;
      } else {
        $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
        return;
      }
    } elseif ($request->input('unknown_voter') == '1') { //unknown voter
      $voter = TempVoter::where('key', $votKey)->first();
      if ($voter) {
        $voter->email = $request->input('new_email');
        $jsonOutput->setData('ok');
        $voter->save();
        return;
      } else {
        $jsonOutput->setErrorCode(config('errors.crm.TEMP_VOTER_DOESNT_EXIST'));
        return;
      }
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.INVALID_VOTER_TYPE'));
    }
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param Request $request
   * @param null    $topicKey
   */
  public function getTopic(Request $request, $topicKey = null)
  {

    $fieldsWeNeed = [
      'request_topics.id', 'name', 'topic_order', 'system_name', 'parent_id', 'active',
      'deleted', 'target_close_days', 'default_request_status_id'
    ];

    $jsonOutput = app()->make("JsonOutput");

    $parent_id = $request->input("parent_id");
    if ($parent_id != null) {

      $crmRequestTopic = CrmRequestTopic::select($fieldsWeNeed)/* = */
        ->where(['parent_id' => $parent_id, 'active' => '1', 'deleted' => '0'])
        ->addSelect('request_topics_by_users.user_handler_id', 'request_topics_by_users.city_id')
        ->leftJoin('request_topics_by_users', 'request_topics_by_users.request_topic_id', '=', 'request_topics.id')
        ->orderBy('topic_order', 'asc')/* = */
        ->get();

      $municipalTopic = RequestTopic::select('id')->where('system_name', config('constants.request_topic_municipally_system_name'))->first();
      // dd($municipalTopic->id == $parent_id, $municipalTopic->toArray() , $parent_id,  config('constants.request_topic_municipally_system_name'));
      if ($municipalTopic->id == $parent_id) {
        $crmRequestTopic = HelpFunctions::getRequestsTopicsUsersByCity($crmRequestTopic);
      }

      $jsonOutput->setData($crmRequestTopic);
    } else {

      /*
             * The select fields are open to debate...
             */

      if (null == $topicKey) {
        $crmRequestTopic = CrmRequestTopic::select($fieldsWeNeed)->addSelect('request_topics_by_users.team_handler_id')
          ->leftJoin('request_topics_by_users', 'request_topics_by_users.request_topic_id', '=', 'request_topics.id')
          ->where(['parent_id' => '0', 'active' => '1', 'deleted' => '0'])/* = */
          ->orderBy('topic_order', 'asc')/* = */
          ->get();
      } elseif (-1 == $topicKey) {
        /**
         * 28.12.2016 valieg - In order to get a combined list of topics and sub-topics and to not harm the others code.
         *                     All the necessary acrobatics will be done on the client side.
         */
        $crmRequestTopic = $this->getSubTopic($topicKey);
      } else {
        $crmRequestTopic = CrmRequestTopic::select($fieldsWeNeed)->addSelect('request_topics_by_users.team_handler_id')
          ->leftJoin('request_topics_by_users', 'request_topics_by_users.request_topic_id', '=', 'request_topics.id')
          ->where(['parent_id' => '0', 'active' => '1', ' deleted' => '0'])/* = */
          ->orderBy('topic_order', 'asc')/* = */
          ->get();
      }

      $jsonOutput->setData($crmRequestTopic);
    }
  }

  public function getAllRequestTopics()
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $requestList = RequestTopicsRepository::getAll();
      $jsonOutput->setData($requestList);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $topicKey
   */
  public function getSubTopic($topicKey = null)
  {

    $fieldsWeNeed = [
      'request_topics.id',
      'request_topics.name',
      'request_topics.topic_order',
      'request_topics.parent_id',
      'request_topics.active',
      'request_topics.deleted',
      'request_sub_topics.id AS sub_topic_id',
      'request_sub_topics.name AS sub_topic_name',
      'request_sub_topics.topic_order AS sub_topic_order',
      'request_sub_topics.parent_id AS sub_topic_parent_id',
      'request_sub_topics.active AS sub_topic_active',
      'request_sub_topics.deleted AS sub_topic_deleted'
    ];

    /* $jsonOutput = app()->make( "JsonOutput" ); */

    $crmRequestTopic = CrmRequestTopic::select($fieldsWeNeed)/* = */
      ->withSubTopic()/* = */
      /* Not now ->orderBy( 'request_topics.topic_order', 'asc' )
                  ->orderBy( 'request_sub_topics.topic_order', 'asc' ) */
      ->get();

    /* $jsonOutput->setData( $crmRequestTopic ); */

    return $crmRequestTopic;
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   */
  public function getStatusTypes()
  {

    $jsonOutput = app()->make("JsonOutput");
    $statusTypes = CrmRequestStatusType::where('deleted', 0)->get();
    $jsonOutput->setData($statusTypes);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $statusKey
   */
  public function getStatusesByType($statusKey = null)
  {

    $jsonOutput = app()->make("JsonOutput");
    if ($statusKey != null) {

      $crmRequestStatus = CrmRequestStatus::where([
        'deleted' => '0',
        'type_id' => $statusKey
      ])->orderBy('request_status.order', 'asc')->get();
      $jsonOutput->setData($crmRequestStatus);
    } else {
      $jsonOutput->setData(array());
    }
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $statusKey
   */
  public function getStatus($statusKey = null)
  {

    $jsonOutput = app()->make("JsonOutput");

    if (null == $statusKey) {
      $crmRequestStatus = CrmRequestStatus::select([
        'request_status.id',
        'request_status.key',
        'request_status.name',
        'request_status.type_id',
        'request_status.order',
        'request_status_type.id AS status_type_id',
        'request_status_type.name AS status_type_name'
      ])/* = */
        ->withStatusType()/* = */
        ->orderBy('request_status.order', 'asc')
        ->get();
    } else {
      $crmRequestStatus = CrmRequestStatus::select([
        'id',
        'name',
        'type_id'
      ])/* = */
        ->where([
          'deleted' => '0',
          'key' => $statusKey
        ])/* = */
        ->get();
    }

    $jsonOutput->setData($crmRequestStatus);
  }

  /*
    Function that gets typeKey , and if it's null , then it
    returns all crmRequestStatuses , else it returns
    crmRequestStatus by type_id
  */
  public function getStatusByType($typeKey = null)
  {

    $jsonOutput = app()->make("JsonOutput");

    // if type = null returns all statuses of type CLOSED (3)
    if (null == $typeKey) {
      $crmRequestStatus = CrmRequestStatus::select([
        'id',
        'name',
        'type_id'
      ])/* = */
        ->where(['deleted' => '0'])
        ->get();
    } else {
      $crmRequestStatus = CrmRequestStatus::select([
        'id',
        'name',
        'type_id'
      ])/* = */
        ->where([
          'deleted' => '0',
          'request_status.type_id' => $typeKey
        ])/* = */
        ->get();
    }

    $jsonOutput->setData($crmRequestStatus);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $priorityKey
   */
  public function getPriority($priorityKey = null)
  {

    $crmRequestPriority = [];
    $jsonOutput = app()->make("JsonOutput");

    if (null == $priorityKey) {

      $crmRequestPriority = CrmRequestPriority::select([
        'id',
        'module_id',
        'name',
        'deleted'
      ])/* = */
        ->where('deleted', '0')/* = */
        ->get();

      /*        } else {
              $crmRequestPriority = CrmRequestPriority::select( [ 'id',
              'module_id',
              'name',
              'deleted' ] )->where( 'deleted', '0' )->get(); */
    }

    $jsonOutput->setData($crmRequestPriority);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $sourceKey
   */
  public function getSource($sourceKey = null)
  {

    $crmRequestSource = [];
    $jsonOutput = app()->make("JsonOutput");

    if (null == $sourceKey) {

      $crmRequestSource = RequestSource::select([
        'id',
        'key',
        'name',
        'system_name',
        'deleted'
      ])/* = */
        ->where('deleted', '0')/* = */
        ->get();
      // $crmRequestSource = array(['id'=>'1','name'=>'פקס'],['id'=>'3423','name'=>'אימייל'],['id'=>'3','name'=>'CallBiz'],['id'=>'4','name'=>'הופנה בעל פה']);
    }

    $jsonOutput->setData($crmRequestSource);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $closureReasonKey
   */
  public function getClosureReason($closureReasonKey = null)
  {

    $crmRequestClosureReason = [];
    $jsonOutput = app()->make("JsonOutput");

    if (null == $closureReasonKey) {

      $crmRequestClosureReason = RequestClosureReason::select([
        'id',
        'key',
        'name',
        'deleted'
      ])/* = */
        ->where('deleted', '0')/* = */
        ->get();
    }

    $jsonOutput->setData($crmRequestClosureReason);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   */
  public function getSatisfaction()
  {

    $crmRequestSatisfaction = [];
    $jsonOutput = app()->make("JsonOutput");


    $crmRequestSatisfaction = RequestSatisfaction::select([
      'id',
      'key',
      'name',
      'deleted'
    ])/* = */
      ->where('deleted', '0')/* = */
      ->get();

    $jsonOutput->setData($crmRequestSatisfaction);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $zKey
   */
  public function getAction($zKey = null)
  {

    /*
         * Not all the fields have proper values!
         */
    $fieldsWeNeed = [
      'actions.key AS operationType',
      'actions.action_type AS actionType',
      'actions.action_topic_id AS operationTopic',
      'actions.action_status_id AS operationStatus',
      'actions.conversation_direction AS operationCompass',
      'actions.user_create_id AS operationUser',
      'actions.action_date AS operationDate',
      'actions.description AS operationDetails',
      'actions.conversation_with_other AS operationWithWho',
      'action_types.name as actionTypeName',
      'action_topics.name as actionTopicName'
    ];

    $jsonOutput = app()->make("JsonOutput");

    if (null == $zKey) {

      /* $crmRequestAction = Action::select( $fieldsWeNeed )->withUser()->get(); */
      $crmRequestAction = Action::select($fieldsWeNeed)/* = */
        ->withUser()/* = */
        ->withType()/* = */
        ->withTopic()/* = */
        ->get();
    } else {
      $crmRequestAction = Action::select($fieldsWeNeed)/* = */
        ->withRequest()/* = */
        ->withType()/* = */
        ->withTopic()/* = */
        ->where('requests.key', $zKey)/* = */
        ->where('actions.entity_type', config('constants.ENTITY_TYPE_REQUEST'))->withUserMetadata()/* = */
        ->get();
    }

    $jsonOutput->setData($crmRequestAction);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $zKey
   */
  public function getHistory($zKey = null)
  {

    /*
         * Not all the fields have proper values!
         */
    $fieldsWeNeed = [
      'action_history.created_at AS historyUpdateDate',
      'action_history.user_create_id AS historyUser',
      'action_history.referenced_id AS historyField',
      'action_history.referenced_model AS historyFieldNewValue',
      'action_history.action_history_topic_id AS historyFieldPreviousValue',
      'voters.first_name',
      'voters.last_name',
      'field_name',
      'display_field_name',
      'old_value',
      'new_value',
      'old_numeric_value',
      'new_numeric_value',
    ];

    $jsonOutput = app()->make("JsonOutput");
    $crmRequestHistory = [];
    if ($zKey) {
      $crmRequestHistory = ActionHistory::select($fieldsWeNeed)->withRequest()->withHistoryUser()->withHistoryDetails()
        ->where('requests.key', $zKey)->where('referenced_model', 'CrmRequest')->get();
    }

    $jsonOutput->setData($crmRequestHistory);
  }

  /**
   * delete callbiz by key . the delete is done by updating deleted = 1
   *
   * @param null $zKey
   */
  public function deleteCallBiz(Request $request, $zKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($zKey == null || trim($zKey) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_KEY'));
      return;
    }
    if ($request->input('callbiz_key') == null || trim($request->input('callbiz_key')) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_CALLBIZ'));
      return;
    }
    $deletedSuccessfully = false;
    if ($zKey != null) {
      $callBizRow = CrmRequestCallBiz::where('key', $request->input('callbiz_key'))->first();

      if ($callBizRow) {
        $oldCallbizId = $callBizRow->id;

        $crmRequest = CrmRequest::where('key', $zKey)->first();
        if ($crmRequest) {

          $statusType = CrmRequestStatus::select('type_id')->where('id', $crmRequest->status_id)->first();
          if ($statusType && $statusType->type_id != config('constants.REQUEST_STATUS_CLOSED')) {


            if ($crmRequest->id == $callBizRow->request_id) { /* validate that request corresponding to callbiz */
              $callBizRow->deleted = 1;
              $callBizRow->save();
              $deletedSuccessfully = true;
            } else {
              $jsonOutput->setErrorCode(config('errors.crm.CALLBIZ_REQUEST_INCONSISTENCY'));
              return;
            }
          } else {
            $jsonOutput->setErrorCode(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));
            return;
          }
        } else {
          $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
          return;
        }
      } else {
        $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_CALLBIZ'));
        return;
      }
    }
    if ($deletedSuccessfully) {
      $this->getCallBiz($zKey);

      $historyArgsArr = [
        'topicName' => 'crm.requests.callbiz.delete',
        'models' => [
          [
            'referenced_model' => 'CrmRequestCallBiz',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
            'referenced_id' => $oldCallbizId
          ]
        ]
      ];

      ActionController::AddHistoryItem($historyArgsArr);
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.ERROR_IN_DELETE'));
    }
  }

  /**
   * add callbiz by to existing request .
   *
   * @param null $zKey
   */
  public function addCallBiz(Request $request, $zKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if ($zKey == null || trim($zKey) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_KEY'));
      return;
    }
    if ($request->input('details') == null || trim($request->input('details')) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_CALLBIZ_DETAILS'));
      return;
    }

    if ($request->input('date') == null || trim($request->input('date')) == '' || !$this->checkDateTimeCorrectFormat($request->input('date'))) {
      $jsonOutput->setErrorCode(config('errors.crm.INVALID_REQUEST_CALLBIZ_DATETIME'));
      return;
    }
    $addedSuccessfully = false;
    $errorMessage = 'אירעה שגיאה בזמן ההוספה';

    if ($zKey != null) {
      $callBizTestExistingRow = CrmRequestCallBiz::where('callbiz_id', $request->input('callbiz_id'))->first();

      if (trim($request->input('callbiz_id')) != '' && $callBizTestExistingRow) {
        $errorMessage = 'מזהה callbiz כבר קיים במערכת';
        $jsonOutput->setErrorCode(config('errors.crm.CALLBIZ_REQUEST_INCONSISTENCY'));
        return;
      } else {
        $newCallbiz = $this->AddCallBizRequest(
          $request->input('callbiz_id'),
          $request->input('date'),
          $request->input('details'),
          $zKey
        );

        $model = $this->getNewRequestCallbizModel($newCallbiz);

        $historyArgsArr = [
          'topicName' => 'crm.requests.callbiz.add',
          'models' => [
            $model
          ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
      }
    }
  }

  /*
    Function that adds new callbiz to existing crmRequest
  */
  public static function AddCallBizRequest($callbizID, $callBizDateTime, $callBizDetails, $reqKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    $crmRequest = CrmRequest::where('key', $reqKey)->first();
    if ($crmRequest) {

      $statusType = CrmRequestStatus::select('type_id')->where('id', $crmRequest->status_id)->first();

      if ($statusType && $statusType->type_id != config('constants.REQUEST_STATUS_CLOSED')) {
        $newCallbiz = new CrmRequestCallBiz;
        $newCallbiz->request_id = $crmRequest->id;
        $newCallbiz->callbiz_id = $callbizID;
        $newCallbiz->user_create_id = Auth::user()->id;

        $callBizDateTime = date("Y-m-d H:i:s", strtotime($callBizDateTime));
        $newCallbiz->date = $callBizDateTime;


        $newCallbiz->details = $callBizDetails;
        $newCallbiz->key = Helper::getNewTableKey('request_callbiz', 10);
        $newCallbiz->save();
        $addedSuccessfully = true;
      } else {
        $jsonOutput->setErrorCode(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));
        return;
      }
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
      return;
    }

    if ($addedSuccessfully) {
      // using self because it's a static function
      $_this = new self;
      $_this->getCallBiz($reqKey);

      return $newCallbiz;
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.ERROR_IN_ADD'));
    }
  }

  /*
    Private helpful function that save the history of callbiz that was updated
  */
  private function saveEditedCallbizHistory($oldCallbizValues, $newCallBizValues)
  {
    $fieldsArray = [];
    foreach ($oldCallbizValues as $fieldName => $oldFieldValue) {
      if ($oldFieldValue != $newCallBizValues->{$fieldName}) {
        $fieldsArray[] = [
          'field_name' => $fieldName,
          'display_field_name' => config('history.CrmRequestCallBiz.' . $fieldName),
          'old_value' => $oldFieldValue,
          'new_value' => $newCallBizValues->{$fieldName}
        ];
      }
    }

    if (count($fieldsArray) > 0) {
      $historyArgsArr = [
        'topicName' => 'crm.requests.callbiz.edit',
        'models' => [
          [
            'referenced_model' => 'CrmRequestCallBiz',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
            'referenced_id' => $newCallBizValues->id,
            'valuesList' => $fieldsArray
          ]
        ]
      ];

      ActionController::AddHistoryItem($historyArgsArr);
    }
  }

  /**
   * edit existing callbiz by of a request .
   *
   * @param null $zKey
   */
  public function editCallBiz(Request $request, $zKey)
  {
    $jsonOutput = app()->make('JsonOutput');
    if ($zKey == null || trim($zKey) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_KEY'));
      return;
    }
    if ($request->input('details') == null || trim($request->input('details')) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_CALLBIZ_DETAILS'));
      return;
    }
    if ($request->input('date') == null || trim($request->input('date')) == '' || !$this->checkDateTimeCorrectFormat($request->input('date'))) {
      $jsonOutput->setErrorCode(config('errors.crm.INVALID_REQUEST_CALLBIZ_DATETIME'));
      return;
    }
    $editedSuccessfully = false;
    $errorMessage = 'אירעה שגיאה בעתת העריכה!';
    if ($zKey != null) {
      $callBizRow = CrmRequestCallBiz::where('key', $request->input('callbiz_key'))->first();

      $oldCallbizValues = [
        'date' => $callBizRow->date,
        'details' => $callBizRow->details
      ];

      if ($callBizRow) {
        $crmRequest = CrmRequest::where('key', $zKey)->first();
        if ($crmRequest) {
          $statusType = CrmRequestStatus::select('type_id')->where('id', $crmRequest->status_id)->first();

          if ($statusType && $statusType->type_id != config('constants.REQUEST_STATUS_CLOSED')) {
            if ($crmRequest->id == $callBizRow->request_id) { /* validate that request corresponding to callbiz */
              if (trim($callBizRow->callbiz_id) == '') {
                $callBizRow->callbiz_id = $request->input('callbiz_id');
                $now = new \DateTime();
                $sentDate = \DateTime::createFromFormat('Y-m-d H:i:s', $request->input('date'));
                $timestampDiff = $now->getTimestamp() - $sentDate->getTimestamp();
                $timestampDiff = $timestampDiff / (1000 * 60 * 60 * 24);

                if (($timestampDiff <= 1 && $timestampDiff >= 0) || $timestampDiff < 0) {
                  $callBizRow->date = $now;
                } else {
                  $callBizRow->date = $request->input('date');
                }
                $callBizRow->details = $request->input('details');
                $callBizRow->save();
                $editedSuccessfully = true;
              } else {
                $callBizTestExistingRow = CrmRequestCallBiz::where('callbiz_id', $request->input('callbiz_id'))->first();
                if ($callBizTestExistingRow) { /* callbiz_id not empty and already exists - throw error */
                  if ($callBizTestExistingRow->id != $callBizRow->id) {
                    $errorMessage = 'מזהה callbiz כבר קיים';
                  } else {
                    $callBizRow->callbiz_id = $request->input('callbiz_id');
                    $now = new \DateTime();
                    $sentDate = \DateTime::createFromFormat('Y-m-d H:i:s', $request->input('date'));
                    $timestampDiff = $now->getTimestamp() - $sentDate->getTimestamp();
                    $timestampDiff = $timestampDiff / (1000 * 60 * 60 * 24);

                    if (($timestampDiff <= 1 && $timestampDiff >= 0) || $timestampDiff < 0) {
                      $callBizRow->date = $now;
                    } else {
                      $callBizRow->date = $request->input('date');
                    }
                    $callBizRow->details = $request->input('details');
                    $callBizRow->save();
                    $editedSuccessfully = true;
                  }
                } else {
                  $callBizRow->callbiz_id = $request->input('callbiz_id');
                  $now = new \DateTime();
                  $sentDate = \DateTime::createFromFormat('Y-m-d H:i:s', $request->input('date'));
                  $timestampDiff = $now->getTimestamp() - $sentDate->getTimestamp();
                  $timestampDiff = $timestampDiff / (1000 * 60 * 60 * 24);

                  if (($timestampDiff <= 1 && $timestampDiff >= 0) || $timestampDiff < 0) {
                    $callBizRow->date = $now;
                  } else {
                    $callBizRow->date = $request->input('date');
                  }
                  $callBizRow->details = $request->input('details');
                  $callBizRow->save();
                  $editedSuccessfully = true;
                }
              }
            }
          } else {
            $jsonOutput->setErrorCode(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));

            return;
          }
        } else {
          $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
          return;
        }
      } else {
        $jsonOutput->setErrorCode(config('errors.crm.CALLBIZ_NOT_EXISTS'));

        return;
      }
    }

    if ($editedSuccessfully) {
      $this->getCallBiz($zKey);

      $this->saveEditedCallbizHistory($oldCallbizValues, $callBizRow);
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.ERROR_IN_DELETE'));
    }
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $zKey
   */
  public function getCallBiz($zKey = null)
  {

    /*
         * Not all the fields have proper values!
         */
    $fieldsWeNeed = [
      'request_callbiz.id as callBizCenterIdentity',
      'request_callbiz.callbiz_id AS callBizCenterKey',
      'request_callbiz.key AS callBizIdentifierKey',
      'request_callbiz.date AS callBizCenterDate',
      'request_callbiz.details AS callBizCenterDetails'
    ];

    $jsonOutput = app()->make("JsonOutput");

    if (null == $zKey) {

      $crmRequestCallBiz = CrmRequestCallBiz::select($fieldsWeNeed)->get();
    } else {
      $crmRequestCallBiz = CrmRequestCallBiz::select($fieldsWeNeed)->withRequest()->withUser()->where('requests.key', $zKey)->where('request_callbiz.deleted', 0)->get();;
      for ($i = 0; $i < sizeof($crmRequestCallBiz); $i++) {
        $crmRequestCallBiz[$i]->is_editing = false;
      }
    }

    $jsonOutput->setData($crmRequestCallBiz);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * @param null $zKey
   */
  public function getDocument($zKey = null)
  {

    /*
         * Not all the fields have proper values!
         */
    $fieldsWeNeed = [
      'documents.key AS documentKey',
      'documents.type AS documentType',
      'documents.created_at AS documentCreatedDate',
      'documents.name AS documentName'
    ];

    $jsonOutput = app()->make("JsonOutput");

    if (null == $zKey) {

      $crmRequestDocument = Document::select($fieldsWeNeed)->get();
    } else {
      $crmRequestDocument = DocumentEntity::select($fieldsWeNeed)->withRequest()->withDocument()->where('entity_type', 1)->where('requests.key', $zKey)->get();
    }

    $jsonOutput->setData($crmRequestDocument);
  }

  /**
   * Basically we get list of data for fueling the Combo(s).
   *
   * For a couple of reasons we'll force here the loading
   * of "pure lists".
   */
  public function getRequestMinMax()
  {

    $result = [];

    $fieldsWeNeed = [
      'requests.id AS requests_id',
      'requests.key AS requests_key',
      'requests.date AS requests_date',
      'requests.created_at AS requests_created_at',
      'requests.close_date AS requests_close_date'
    ];
    //SELECT MIN(requests.id), MAX(requests.id), MIN(requests.date), MAX(requests.date), MIN(requests.created_at), MAX(requests.created_at), MIN(requests.close_date), MAX(requests.close_date) FROM requests WHERE requests.deleted = 0;

    $jsonOutput = app()->make("JsonOutput");
    /*
         * 02.01.2017 - valieg not now!
          $crmRequestStuff = CrmRequest::select( $fieldsWeNeed )
          ->where( 'deleted', '0' )
          ->get();
         */
    /*
         * Load topics for requests.
         * Here we have a "DISTINCT" issue...
         */
    $result['reqTopic'] = CrmRequestTopic::select([
      'id',
      'name AS topic_name'
    ])/* = */
      ->where([
        'parent_id' => '0',
        'active' => '1',
        'deleted' => '0'
      ])/* = */
      ->orderBy('topic_order', 'asc')/* = */
      ->get();
    /*
         * Load sub-topics for requests.
         */
    $result['reqSubTopic'] = CrmRequestTopic::select([
      'request_topics.id',
      'request_topics.name AS topic_name',
      'request_sub_topics.id AS sub_topic_id',
      'request_sub_topics.name AS sub_topic_name',
      'request_sub_topics.parent_id AS sub_topic_parent_id'
    ])/* = */
      ->withSubTopic()/* = */
      ->where([
        'request_topics.parent_id' => '0',
        'request_topics.active' => '1',
        'request_topics.deleted' => '0'
      ])/* = */
      ->orderBy('request_sub_topics.topic_order', 'asc')/* = */
      ->get();
    /*
         * Load status types for requests.
         */
    $result['reqStatusType'] = CrmRequestStatusType::select([
      'id',
      'name'
    ])/* = */
      ->where('deleted', '0')/* = */
      ->get();
    /*
         * Load statuses for requests.
         */
    $result['reqStatus'] = CrmRequestStatus::select([
      'id',
      'key',
      'name',
      'type_id'
    ])/* = */
      ->where('deleted', '0')/* = */
      ->get();
    /*
         * Load priority for requests.
         */
    $result['reqPriority'] = CrmRequestPriority::select([
      'id',
      'module_id',
      'name'
    ])/* = */
      ->where('deleted', '0')/* = */
      ->get();
    /*
         * Load action status types for requests.
         * We add here the default value corresponding to Adi docx file in order
         * to avoid the balaganaj on the client side.
         */
    $result['reqActionStatus'] = [[
      'id' => 0,
      'key' => '',
      'name' => 'הכל'
    ]];
    $tmp = ActionStatus::select([
      'id',
      'key',
      'name'
    ])/* = */
      ->where('deleted', '0')/* = */
      ->get();

    foreach ($tmp as $v) {
      $result['reqActionStatus'][] = $v;
    }
    /*
         * Load shas representative list.
         */
    $result['reqShasRepresentative'] = Voters::select([
      'voters.id',
      'personal_identity AS user_metadata_id',
      'last_name AS shas_representative_last_name',
      'first_name AS shas_representative_first_name',
      'father_name AS shas_representative_father_first_name'
    ])->withFilters()/* = */
      ->where('shas_representative', '1')
      ->get();
    /*
         * Ugly, but fast
         */
    foreach ($result['reqShasRepresentative'] as &$v) {
      $tmpFirstName = trim($v['shas_representative_first_name']);
      $tmpLastName = trim($v['shas_representative_last_name']);

      $v['shas_representative_first_name'] = $tmpFirstName;
      $v['shas_representative_last_name'] = $tmpLastName;

      $v['full_name'] = $tmpFirstName . ' ' . $tmpLastName;
      $v['shas_representative_father_first_name'] = trim($v['shas_representative_father_first_name']);
    }
    /*
         * Load a slim user list.
         */
    $result['reqSlimUser'] = User::select([
      'users.id',
      'users.key',
      'voter_id as user_metadata_id',
      'last_name',
      'first_name',
      'father_name AS father_first_name'
    ])/* = */
      ->withSlimMetadata()/* = */
      ->get();

    foreach ($result['reqSlimUser'] as &$v) {
      $tmpFirstName = $v['first_name'];
      $tmpLastName = $v['last_name'];

      $v['first_name'] = $tmpFirstName;
      $v['last_name'] = $tmpLastName;

      $v['full_name'] = $tmpFirstName . ' ' . $tmpLastName;
      $v['father_first_name'] = trim($v['father_first_name']);
    }
    /*
         * Load min-max values for requests.
         */
    /*
         * 02.01.2017 - valieg not now!
          $result['reqLimit'] = [ 'reqMinId'        => $crmRequestStuff->min( 'requests_id' ),
          'reqMaxId'        => $crmRequestStuff->max( 'requests_id' ),
          'reqMinDate'      => $crmRequestStuff->min( 'requests_date' ),
          'reqMaxDate'      => $crmRequestStuff->max( 'requests_date' ),
          'reqMinCreatedAt' => $crmRequestStuff->min( 'requests_created_at' ),
          'reqMaxCreatedAt' => $crmRequestStuff->max( 'requests_created_at' ),
          'reqMinCloseDate' => $crmRequestStuff->min( 'requests_close_date' ),
          'reqMaxCloseDate' => $crmRequestStuff->max( 'requests_close_date' ) ];
         */
    $jsonOutput->setData($result);
  }

  /**
   * Build the "where clause" for the big query that filter out the requests.
   * For the moment let's go this way. Eloquent make troubles with the integer zeroes(see the
   * '$joinOn->on' in CrmRequest model. So we'll handle later the ON optimizations.
   *
   * @param $queryObj
   * @param $request
   *
   * @return bool
   */
  private function assemblyWhereArray(&$queryObj, $request)
  {

    /* Log::info( 'log from assemblyWhereArray 1: ' . json_encode( $request ) ); */
    $result = false;

    /*
         * requests.date field
         */
    if (isset($request['date_from']) && isset($request['date_to'])) {
      $dateFrom = $this->validateDate($request['date_from']);
      $dateTo = $this->validateDate($request['date_to']);
      if (false != $dateFrom && false != $dateTo) {
        /*
                 * Okay, we have valid dates. Let's squeeze them into the query
                 */
        list($_dateFrom, $_dateTo) = $this->dateTimeEndianizer($dateFrom, $dateTo);

        $queryObj = $queryObj->where('requests.date', '>=', $_dateFrom)/* = */
          ->where('requests.date', '<=', $_dateTo);
      } else {
        /*
                 * We have BAD date(s).
                 */
      }
      $result = true;
    }
    /*
         * requests.created_at field
         */
    if (isset($request['created_at_from']) && isset($request['created_at_to'])) {
      $dateFrom = $this->validateDate($request['created_at_from']);
      $dateTo = $this->validateDate($request['created_at_to']);
      if (false != $dateFrom && false != $dateTo) {
        /*
                 * Okay, we have valid dates. Let's squeeze them into the query
                 */
        list($_dateFrom, $_dateTo) = $this->dateTimeEndianizer($dateFrom, $dateTo);

        $queryObj = $queryObj->where('requests.created_at', '>=', $_dateFrom)/* = */
          ->where('requests.created_at', '<=', $_dateTo);
      } else {
        /*
                 * We have BAD date(s).
                 */
      }
      $result = true;
    }
    /*
         * requests.close_date field
         */
    if (isset($request['close_date_from']) && isset($request['close_date_to'])) {
      $dateFrom = $this->validateDate($request['close_date_from']);
      $dateTo = $this->validateDate($request['close_date_to']);
      if (false != $dateFrom && false != $dateTo) {
        /*
                 * Okay, we have valid close_dates. Let's squeeze them into the query
                 */
        list($_dateFrom, $_dateTo) = $this->dateTimeEndianizer($dateFrom, $dateTo);

        $queryObj = $queryObj->where('requests.close_date', '>=', $_dateFrom)/* = */
          ->where('requests.close_date', '<=', $_dateTo);
      } else {
        /*
                 * We have BAD close_date(s).
                 */
      }
      $result = true;
    }
    /*
         * topic_id field
         */
    if (isset($request['topic_name'])) {

      $tmpArray = $this->convertJsonToInArray($request['topic_name']);
      if (!empty($tmpArray)) {
        $queryObj = $queryObj->whereIn('request_topics.name', $tmpArray);
        $result = true;
      }
    }
    /*
         * sub_topic_id field
         */
    if (isset($request['sub_topic_name'])) {
      $tmpArray = $this->convertJsonToInArray($request['sub_topic_name']);
      if (!empty($tmpArray)) {
        $queryObj = $queryObj->whereIn('request_sub_topics.name', $tmpArray);
        $result = true;
      }
    }
    /*
         * status_type_id field
         */
    if (isset($request['status_type_name'])) {
      $tmpArray = $this->convertJsonToInArray($request['status_type_name']);
      if (!empty($tmpArray)) {
        $queryObj = $queryObj->withStatusType()->whereIn('request_status_type.name', $tmpArray);
        $result = true;
      }
    }
    /*
         * status_id field
         */
    if (isset($request['status_name'])) {
      $tmpArray = $this->convertJsonToInArray($request['status_name']);
      if (!empty($tmpArray)) {
        $queryObj = $queryObj->whereIn('request_status.name', $tmpArray);
        $result = true;
      }
    }
    /*
         * request_priority_id field
         */
    if (isset($request['request_priority_name'])) {
      $tmpArray = $this->convertJsonToInArray($request['request_priority_name']);
      if (!empty($tmpArray)) {
        $queryObj = $queryObj->whereIn('request_priority.name', $tmpArray);
        $result = true;
      }
    }

    return $result;
  }

  /**
   * The method do a little bit more than validation. If the date is a valid "shas date",
   * then the string is converted to a classic MySQL datetime format.
   *
   * @param      $date
   * @param null $timeZone
   *
   * @return string
   */
  private function validateDate($date, $timeZone = null)
  {

    /* $timeZone = new \DateTimeZone( config( 'constants.APP_DATETIME_ZONE' ) ); */

    if (null == $timeZone) {
      $tmpDate = \DateTime::createFromFormat(config('constants.SHAS_DATE_FORMAT'), $date);
    } else {
      $tmpDate = \DateTime::createFromFormat(config('constants.SHAS_DATE_FORMAT'), $date, $timeZone);
    }

    return (false == $tmpDate) ? false : $tmpDate->format(config('constants.APP_DATETIME_DB_FORMAT'));
  }

  /**
   * The method arrange ascending the 2 dates.
   *
   * @param $dateSmall in 'Y-m-d H:i:s' format
   * @param $dateBig   in 'Y-m-d H:i:s' format
   *
   * @return array
   */
  private function dateTimeEndianizer($dateSmall, $dateBig)
  {

    $result = [];

    /* $timeZone = new \DateTimeZone( config( 'constants.APP_DATETIME_ZONE' ) ); */

    $dtSmall = new \DateTime($dateSmall);
    $dtBig = new \DateTime($dateBig);

    $dateSmallStamp = $dtSmall->getTimestamp();
    $dateBigStamp = $dtBig->getTimestamp();

    if ($dateSmallStamp == $dateBigStamp) {
      /*
             * The following is debatable, but we need some "space" between "equal" dates!
             *
             * Explanations for the following 3-4 lines:
             * We're in the case of
             *
             * $dateSmall == $dateBig = '2016-12-25 11:14:51'. In order to get something for
             * the date '2016-12-25' we have to make the dates as:
             *
             * $dateSmall = '2016-12-25 00:00:00' and
             * $dateBig   = '2016-12-25 23:59:59' and
             */
      $date = new \DateTime($dtBig->format(config('constants.APP_DATE_DB_FORMAT')));
      $dateSmall = $date->format(config('constants.APP_DATETIME_DB_FORMAT'));
      $dateBig = $date->add(new \DateInterval('PT23H59M59S'))->format(config('constants.APP_DATETIME_DB_FORMAT'));
    } else {
      if ($dateSmallStamp > $dateBigStamp) {
        $t = $dateSmall;
        $dateSmall = $dateBig;
        $dateBig = $t;
      }
    }

    $result = [
      $dateSmall,
      $dateBig
    ];

    return $result;
  }

  /**
   * We get a JSON string and convert the values to a right "...WHERE xyz IN(...)" array;
   * The method is not "super-generic"!
   *
   * @param $jsonString
   *
   * @return array
   */
  private function convertJsonToInArray($jsonString)
  {

    $result = [];

    $tmp = json_decode($jsonString);

    if (null == $tmp) {
      /*
             * Foo, this is bad!
             */
    } else {
      $result = $this->formatIN($tmp);
    }

    return $result;
  }

  /**
   * @param $jsonDecoded
   *
   * @return array
   */
  private function formatIN($jsonDecoded)
  {

    $result = [];

    foreach ($jsonDecoded as $v) {
      if (true == property_exists($v, 'name')) {
        $result[] = $v->name;
      }
      if (true == property_exists($v, 'full_name')) {
        $result[] = $v->full_name;
      }
      if (true == property_exists($v, 'topic_name') && false == property_exists($v, 'sub_topic_name')) {
        $result[] = $v->topic_name;
      }
      if (true == property_exists($v, 'sub_topic_name')) {
        $result[] = $v->sub_topic_name;
      }
      if (true == property_exists($v, 'voter_key')) {
        $result[] = $v->voter_key;
      }
    }

    return $result;
  }

  /**
   * Here we learn how we should assembly the query(queries).
   *
   * @param Request $request
   *
   * @return array
   */
  private function requestParamAnalyzer(Request $request)
  {

    $result = [];
    $reqParams = $request->all();

    if (isset($reqParams['operation_pile']) || isset($reqParams['operation_status_pile']) || isset($reqParams['operation_date_pile'])) {
      $operationFlag = true;
    } else {
      $operationFlag = false;
    }
    $result['operationFlag'] = $operationFlag;

    if (isset($reqParams['voter_key_pile']) || isset($reqParams['city'])) {
      $voterFlag = true;
    } else {
      $voterFlag = false;
    }
    $result['voterFlag'] = $voterFlag;

    if (isset($reqParams['user_handler_name']) || isset($reqParams['user_create_name']) || isset($reqParams['user_update_name']) || isset($reqParams['shas_representative_pile'])) {
      $userFlag = true;
    } else {
      $userFlag = false;
    }
    $result['userFlag'] = $userFlag;

    if (isset($reqParams['team_handler_name'])) {
      $teamFlag = true;
    } else {
      $teamFlag = false;
    }
    $result['teamFlag'] = $teamFlag;

    return $result;
  }

  /**
   * If we call this method we already presume that we have a demand
   * for $request['voter_key_pile'] ) and/or $request['city']. At least
   * one of them has something.
   *
   * @param Request $request
   *
   * @return array
   */
  private function getVoterList(Request $request)
  {

    $result = [];
    $tmpArray = [];
    /*
         * voter_id field OR temp_voter_id
         */
    if (isset($request['voter_key_pile'])) {
      $tmp = json_decode($request['voter_key_pile']);

      foreach ($tmp as $v) {
        $result[$v->voter_key] = $v->full_name;
      }
    }
    /*
         * city
         */
    if (isset($request['city'])) {
      /*
             * This is the normal part, for voter_id
             */
      $tmp = json_decode($request['city']);

      foreach ($tmp as $v) {
        $tmpArray[] = $v->mi_id;
      }

      if (count($tmpArray) > 0) {

        $reqCityVoter = City::select([
          'voters.key AS voter_key',
          'last_name',
          'first_name',
          'father_name'
        ])/* = */
          ->withVoter()
          ->whereIn('cities.mi_id', $tmpArray)
          ->get();

        foreach ($reqCityVoter as $v) {
          $result[$v['voter_key']] = $v['first_name'] . ' ' . $v['last_name'];
        }
      }
    }

    return $result;
  }

  /**
   * In order to get the 'distinct by request key'results.
   *
   * @param $reqList
   *
   * @return array
   */
  private function doDistinct($reqList)
  {

    $result = [];
    $keyList = [];

    foreach ($reqList as $v) {

      $keyList[$v['reqKey']] = $v;
    }
    foreach ($keyList as $v) {
      $result[] = $v;
    }

    return $result;
  }

  /**
   * @param $hayStack
   * @param $pagLen
   * @param $reqPag
   *
   * @return array
   */
  private function arrayPaginator(&$hayStack, $pagLen, $reqPag)
  {

    $result = [];
    $i = 0;

    if (!is_int($pagLen) || !is_int($reqPag) || $pagLen < 1 || $reqPag < 1) {
      return $result;
    }

    $startPoint = $pagLen * ($reqPag - 1);
    $endPoint = $startPoint + $pagLen; //$pagLen * $reqPag;

    if ($startPoint > count($hayStack)) {
      return $result;
    }

    foreach ($hayStack as $k => $v) {
      if ($i < $startPoint) {
        $i = $i + 1;
        continue;
      }

      $result[] = $v;

      $i = $i + 1;
      if ($endPoint <= $i) {
        break;
      }
    }

    return $result;
  }

  /*
    Private helpful function the returns crmRequests by SEARCH params
  */
  private function getRequestData(Request $request)
  {
    $filters = $request->all();
    //fields to return from the db
    $resultFields = [
      'requests.id AS requests_id', 'requests.key AS requests_key',
      DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS voter_name'),
      DB::raw('CASE WHEN voters.id is not null then CONCAT(voters.first_name, " ", voters.last_name) else CONCAT(COALESCE(unknown_voters.first_name,""), " ", COALESCE(unknown_voters.last_name,"")) end as final_voter_name'),
      DB::raw('voters.id as voter_id'),
      DB::raw('CONCAT(COALESCE(unknown_voters.first_name,""), " ", COALESCE(unknown_voters.last_name,"")) AS unknown_voter_name'),
      'actions.description', 'teams.name AS team_handler_name', 'request_status.name AS request_status_name', 'voter_satisfaction', 'request_closure_reason_id',
      DB::raw('DATE(requests.date) AS request_date'), DB::raw('DATE(requests.target_close_date) AS target_close_date'),
      DB::raw('CONCAT(user_handler_voters.first_name, " ", user_handler_voters.last_name) AS user_handler'),
      'request_status_type.name AS request_status_type', 'requests.request_source_phone',
      'request_satisfaction.name AS request_satisfaction_name', 'request_closure_reason.name as request_closure_reason_name'
    ];

    //single value filters with db column name
    $singleValueFilters = [
      'fromCloseDate' => 'requests.close_date', 'toCloseDate' => 'requests.close_date', 'fromCreateDate' => 'requests.created_at',
      'toCreateDate' => 'requests.created_at', 'fromRequestDate' => 'requests.date', 'toRequestDate' => 'requests.date',
      'inDate' => 'requests.target_close_date', 'callbizId' => 'request_callbiz.callbiz_id', 'includingOperation' => 'actions.action_type', 'requestKey' => 'requests.key'
    ];

    //multi value filters with db column name
    $multiValueFilters = [
      'creatorUser' => 'user_create_id', 'handlerUser' => 'users_user_handler.key', 'updaterUser' => 'user_update_id',
      'handlerTeam' => 'teams.key', 'priority' => 'requests.request_priority_id', 'status' => 'request_status.key',
      'topics' => 'request_topics.key', 'subTopics' => 'request_sub_topics.key',  'closure_reason' => 'request_closure_reason.key',
      'satisfaction' => 'request_satisfaction.key', 'statusType' => 'request_status.type_id', 'voterRequests' => 'voters.key'
    ];

    $crmRequestQuery = CrmRequest::select($resultFields)
      ->withAction()
      ->withPriority()
      ->withHandlerTeam()
      ->withTopic()
      ->withSubTopic()
      ->withStatus()
      ->withStatusType()
      ->withSatisfaction()
      ->withRequestClosure()
      ->withHandlerUser()
      ->withVoter(TRUE);

    $this->parseSearchSingleValuesFilters($filters, $singleValueFilters, $crmRequestQuery);
    $this->parseSearchMultiValuesFilters($filters, $multiValueFilters, $crmRequestQuery);
    $this->parseSearchRequestCityFilter($filters, $crmRequestQuery);


    if ($request->input('firstName') != null && trim($request->input('firstName')) != '' && $request->input('lastName') != null && trim($request->input('lastName')) != '') {
      $crmRequestQuery->where(function ($crmRequestQuery) use ($request) {
        $crmRequestQuery->where('voters.first_name', "LIKE", '%' . $request->input('firstName') . '%')
          ->where('voters.last_name', "LIKE", '%' . $request->input('lastName') . '%');
      })
        ->orWhere(function ($crmRequestQuery) use ($request) {
          $crmRequestQuery->where('unknown_voters.first_name', "LIKE", '%' . $request->input('firstName') . '%')
            ->where('unknown_voters.last_name', "LIKE", '%' . $request->input('lastName') . '%');
        });
    } else {
      if ($request->input('firstName') != null && trim($request->input('firstName')) != '') {
        $crmRequestQuery->where('voters.first_name', 'LIKE', '%' . $request->input('firstName') . '%')->orWhere('unknown_voters.first_name', 'LIKE', '%' . $request->input('firstName') . '%');
      }
      if ($request->input('lastName') != null && trim($request->input('lastName')) != '') {
        $crmRequestQuery->where('voters.last_name', 'LIKE', '%' . $request->input('lastName') . '%')->orWhere('unknown_voters.last_name', 'LIKE', '%' . $request->input('lastName') . '%');
      }
    }
    if ($request->input('phone') != null && trim($request->input('phone')) != '') {
      $phoneNumber = str_replace("-", "", trim($request->input('phone')));
      $crmRequestQuery->withPhones()->withUnknownVoterPhones()
        ->where('voter_phones.phone_number', 'LIKE', '%' . $phoneNumber . '%')
        ->orWhere('unknown_voter_phones.phone_number', 'LIKE', '%' . $phoneNumber . '%');
    }

    if (!empty($request['order_by'])) {
      $direction = $request['direction']; //check also type
      $orderBy = $request['order_by'];
      $crmRequestQuery->orderBy($orderBy, $direction);
    }
    $crmRequestQuery->where('requests.deleted', 0)->groupBy('requests.key');
    $searchResult = $crmRequestQuery->get();
    return $searchResult;
  }

  public function getUsersWithRequestModuleRole($teamKey = null)
  {
    $jsonOutput = app()->make("JsonOutput");

    $usersQuery = HelpFunctions::getUsersWithRequestModuleRole($jsonOutput, $teamKey, false);

    $jsonOutput->setData($usersQuery->get());
  }

  /*
    Function that performs crmRequests search
  */
  public function searchV2(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    $searchResult = $this->getRequestData($request);
    $jsonOutput->setData($searchResult);
  }

  /*
    Function that prints the search results by POST params
  */
  public function printSearchResult(Request $request)
  {
    ini_set('memory_limit', '-1');
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);
    $searchResult = $this->getRequestData($request);
    return view('reports.requestSearchResults', ['data' => $searchResult]);
  }

  public  function printExcelSearchResult(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);
    $searchResult = $this->getRequestData($request);
    $headers = [
      'מזהה פניה' => 'requests_key',
      'מזהה תושב' => 'voter_id',
      'תאריך פניה' => 'request_date',
      'נושא הפניה' => 'topic_name',
      'תת נושא הפניה' => 'sub_topic_name',
      'תיאור' => 'description',
      'שם התושב' => 'final_voter_name',
      'יעד סיום לטיפול' => 'target_close_date',
      'צוות מטפל' => 'team_handler_name',
      'עובד מטפל' => 'user_handler',
      'סטטוס' => 'request_status_name',
      'רמת דחיפות' => 'request_priority_name',
      'סיבת סגירה' => 'request_closure_reason_name'
    ];
    ExcelFileService::download($headers, $searchResult, 'פניות ציבור - שאילתת פניות');
  }

  /*
    Private helpful function that parses SINGLE search filters from POST params  and addes
    this to the search-query
  */
  private function parseSearchSingleValuesFilters($filters, $singleValueFields, &$crmRequestQuery)
  {
    $dateFilters = ['fromCloseDate', 'toCloseDate', 'fromCreateDate', 'toCreateDate', 'fromRequestDate', 'toRequestDate'];

    foreach ($singleValueFields as $field => $dbName) {
      if (isset($filters[$field])) {
        $value = trim($filters[$field]);

        //if the field is date filter
        if (in_array($field, $dateFilters)) {
          if ($this->isValidDate($value)) {
            $compareSign = (strpos($field, 'from') !== false) ? '>=' : '<=';
            $crmRequestQuery->where($dbName, $compareSign, $value);
          }
        }

        //if inDate filter, check with the current date.
        if ($field == 'inDate') {
          $compareSign = ($value == '1') ? '<=' : '>=';
          $crmRequestQuery->where($dbName, $compareSign, DB::raw('NOW()'));
        }

        if ($field == 'callbizId') {
          $crmRequestQuery->withCallBiz()->where($dbName, $value);
        }

        if ($field == 'includingOperation') {
          $value = $this->getActionTypeIdByKey($value);
          $crmRequestQuery->where($dbName, $value);
        }

        if ($field == 'requestKey') {
          $crmRequestQuery->where($dbName, '' . $value);
        }
      }
    }
  }

  /*
    Private helpful function that parses MULTIPLE search filters from POST params  and addes
    this to the search-query
  */
  private function parseSearchMultiValuesFilters($filters, $multiValueFields, &$crmRequestQuery)
  {
    $usersFilds = ['creatorUser', 'updaterUser'];

    foreach ($multiValueFields as $field => $dbName) {
      if (isset($filters[$field])) {

        $values = (is_array($filters[$field]) ? array_map('trim', $filters[$field]) : $filters[$field]);
        //get user ids using user keys
        if (in_array($field, $usersFilds)) {

          $values = $this->getUsersIdByKey($values);
          $crmRequestQuery->withUserByField($dbName);
          $dbName = ($field == 'creatorUser') ? 'requests.' . $dbName : $dbName;
        }
        if (is_array($filters[$field])) {
          $crmRequestQuery->whereIn($dbName, $values);
        } else {
          $crmRequestQuery->where($dbName, '=', $values);
        }
      }
    }
  }

  private function parseSearchRequestCityFilter($filters, &$crmRequestQuery)
  {
    if (isset($filters['requestsFromCity'])) {
      $values = array_map('trim', $filters['requestsFromCity']);
      $crmRequestQuery->withRequestCity($values);
    }
  }

  /**
      Private helpful function that validates date
   */
  private function isValidDate($dateString)
  {
    try {
      $dt = new DateTime(trim($dateString));
    } catch (\Exception $e) {
      return false;
    }
    $month = $dt->format('m');
    $day = $dt->format('d');
    $year = $dt->format('Y');

    return checkdate($month, $day, $year) ? true : false;
  }

  /*
    Private helpful function that returns users IDS array by users keys array
  */
  private function getUsersIdByKey($userKeys)
  {
    return User::select('id')->whereIn('key', $userKeys)->pluck('id');
  }

  /*
    Private helpful function that returns ActionTypes IDS array by statusesKeys
  */
  private function getActionTypeIdByKey($statusKeys)
  {
    return ActionType::select('id')->where('key', $statusKeys)->pluck('id');
  }

  public function  getRequestListByUser(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $pagination = new PaginationDto($request->all());
      $requestList = CrmRequestRepository::getListRequestsUserInOrm($pagination);
      $jsonOutput->setData($requestList);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function getRequestDetailsOrmByKey(Request $request, $request_key)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $requestList = CrmRequestRepository::getRequestDetailsIncludeActionAndDocumentInOrmByKey($request_key);
      $jsonOutput->setData($requestList);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public function getSubTopicDefaultTeamAndUserHandler(Request $request, $subTopicId, $cityId = null)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $defualtTeamAndUser = RequestTopicsRepository::getDefaultTeamAndHandlerUserBySubTopic($subTopicId, $cityId);
      $jsonOutput->setData($defualtTeamAndUser);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function getRequestUserFilterType()
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $jsonOutput->setData(RequestUserFilterBy::getAllTypeArray());
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function getRequestUserSortType()
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $jsonOutput->setData(CrmRequestRepository::getCrmRequestFieldsForSortBy());
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function getSummaryRequestByPriority()
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $requestSummary = CrmRequestRepository::getSummaryCountRequestUserByRequestPriorityId();
      $jsonOutput->setData($requestSummary);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function addCrmRequestFromApplication(Request $request)
  {
    try {
      $jsonOutput = app()->make("JsonOutput");
      $requestAdd = CrmRequestRepository::createCrmRequest($request);
      $jsonOutput->setData($requestAdd);
    } catch (\Throwable $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function getUsersHandlerRequestByTeamId(Request $request, $teamId)
  {
    try {
      $jsonOutput = app()->make("JsonOutput");
      $requestAdd = TeamRepository::getUsersCrmRequestTeamByTeamId($teamId);
      $jsonOutput->setData($requestAdd);
    } catch (\Throwable $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  /**
   * Get voter detils for add request from application
   * return voter details or warning if the voter not exist
   * @param Request $request
   * @param int|string $personalIdentity
   * @return void
   */
  public static function getVoterDetailsOrm(Request $request, $personalIdentity)
  {

    $jsonOutput = app()->make("JsonOutput");
    try {
      $voter = VotersRepository::getVoterDetailsOrmWithFilterByPersonalIdentity($personalIdentity);
      if ($voter) {
        $jsonOutput->setData($voter);
        return;
      }
      $warning_message = JsonOutput::getMessageErrorByErrorCode(config('errors.crm.WARNING_VOTER_ADD_REQUEST'));
      $response = array('warning_message' => $warning_message);
      $jsonOutput->setData($response);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function addCrmRequestFiles(Request $request, $requestKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $crmRequest = CrmRequestRepository::getByKey($requestKey);
      $files = CrmRequestRepository::addRequestFiles($crmRequest, $request->file('files'));
      $jsonOutput->setData($files);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  /**
   * Delete request file only thar request not close
   *
   * @param Request $request
   * @param string|int $requestKey
   * @param string|int $docummentKey
   * @return void
   */
  public static function deleteRequestFile(Request $request, $requestKey, $docummentKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $crmRequest = CrmRequestRepository::getByKey($requestKey);
      $statusRequest = RequestStatusRepository::getById($crmRequest->status_id);
      if ($statusRequest->type_id == RequestStatusType::REQUEST_STATUS_CLOSED) {
        throw new Exception(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));
      }

      DocumentRepository::deleteByKey($docummentKey);
      $jsonOutput->setData(true);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }

  public static function downloadRequestFile(Request $request, $requestKey, $docummentKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);
    try {
      return DocumentRepository::downloadByKey($docummentKey);
    } catch (\Exception $e) {
      $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    }
  }
}
