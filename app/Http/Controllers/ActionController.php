<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\CrmRequestController;


use App\Models\CrmRequest;
use App\Models\Action;
use App\Models\CrmRequestStatus;
use App\Models\History;
use App\Models\HistoryTopics;
use App\Models\ActionHistory;
use App\Models\ActionHistoryDetails;
use App\Models\ActionHistoryTopic;
use App\Models\Voters;
use App\Models\User;
use App\Models\ActionType;
use App\Models\ActionTopic;
use App\Models\ActionStatus;

use Session;
use Auth;
use Carbon\Carbon;
use App\Libraries\Helper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;


class ActionController extends Controller
{
  private $actionDetails = [
    'action_type', 'action_topic_id', 'conversation_direction', 'conversation_with_other',
    'action_date', 'description', 'action_status_id'
  ];
  /*
     *   this function gets all action types by entity type
     */

  public function getRequestActionTypesByEntityType(Request $request)
  {

    $jsonOutput = app()->make("JsonOutput");
    $actionTypes = ActionType::where('entity_type', $request->input('entity_type'))->where('deleted', 0)->get();
    $jsonOutput->setData($actionTypes);
  }

  /**
   * This function gets the actions types
   * from the table.
   *
   * The function determines the entity type
   * by the route name.
   */
  public function getActionTypes()
  {
    $jsonOutput = app()->make("JsonOutput");

    $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
    if (in_array('elections.voter.actions', $routePermissions)) {
      $entity_type = config('constants.ENTITY_TYPE_VOTER');
    }

    $actionTypes = ActionType::where('entity_type', $entity_type)->where('deleted', 0)->get();

    $jsonOutput->setData($actionTypes);
  }

  /*
     *   this function gets all action topics by action type key
     */

  public function getRequestActionTopicsByActionType($actionTypeKey = null)
  {

    $jsonOutput = app()->make("JsonOutput");
    if ($actionTypeKey != null) {
      $actionTopics = ActionTopic::select([
        'action_topics.id',
        'action_topics.key',
        'action_topics.name',
        'action_topics.action_type_id'
      ])->withType()->where('action_types.key', $actionTypeKey)->where('action_topics.deleted', 0)->get();
    } else {
      $actionTopics = ActionTopic::select([
        'action_topics.id',
        'action_topics.key',
        'action_topics.name',
        'action_topics.action_type_id'
      ])->where('action_topics.deleted', 0)->get();
    }

    $jsonOutput->setData($actionTopics);
  }

  /*
     *   This function gets all action topics
     */

  public function getAllActionTopics()
  {

    $jsonOutput = app()->make("JsonOutput");

    $actionTopicsFields = [
      'id',
      'key',
      'name',
      'action_type_id'
    ];
    $actionTopics = ActionTopic::select($actionTopicsFields)->where('deleted', 0)->get();

    $jsonOutput->setData($actionTopics);
  }

  /*
     *   this function gets all action statuses
     */

  public function getRequestActionStatuses()
  {

    $jsonOutput = app()->make("JsonOutput");
    $actionStatuses = ActionStatus::all();
    $jsonOutput->setData($actionStatuses);
  }

  /**
   * This function insert values of
   * fields who have changed in the
   * database.
   *
   * @param $actionHistoryId
   * @param $valuesList
   */
  private static function AddHistoryDetails($actionHistoryId, $valuesList)
  {
    for ($i = 0; $i < count($valuesList); $i++) {
      $arrParts = $valuesList[$i];

      $actionHistoryDetails = new ActionHistoryDetails;

      $actionHistoryDetails->key = Helper::getNewTableKey('action_history_details', 10);

      $actionHistoryDetails->action_history_id = $actionHistoryId;

      $actionHistoryDetails->field_name = $arrParts['field_name'];
      $actionHistoryDetails->display_field_name = $arrParts['display_field_name'];

      if (isset($arrParts['old_value'])) {
        $actionHistoryDetails->old_value = $arrParts['old_value'];
      }

      if (isset($arrParts['new_value'])) {
        $actionHistoryDetails->new_value = $arrParts['new_value'];
      }

      if (!empty($arrParts['old_numeric_value'])) {
        $actionHistoryDetails->old_numeric_value = $arrParts['old_numeric_value'];
      }

      if (!empty($arrParts['new_numeric_value'])) {
        $actionHistoryDetails->new_numeric_value = $arrParts['new_numeric_value'];
      }

      $actionHistoryDetails->save();
    }
  }

  /**
   * This function adds history to actions
   * in the system.
   *
   * It recieves as parameter an associative
   * array with the following keys:
   *   topicName - The history topic
   *   user_create_id - mandatory only in csv parsing
   *                    and indicated the user who activated
   *                    the parsing.
   *   entity_type - A source that updates the data such as
   *                 a job that executes update from csv file
   *                 or job that executes household status
   *                 change.
   *                 This field is not mandatory.
   *   entity_id - This field is the id of the source
   *               that updates the data.
   *               Not a mandatory field.
   *
   *   models - Array of Associative arrays which contain all
   *            the models which are used for the action with
   *            the following keys:
   *      referenced_model - The model which does the action.
   *      referenced_model_action_type - actions the model does:
   *                                     add, delete, edit
   *      referenced_id - The id value of the table of the model.
   *      valuesList - Associative array which is mandatory in add + edit
   *                   with the following keys:
   *          field_name - The field name in the database.
   *          display_field_name - The hebrew name of the field which can
   *                               be found in config/history.php
   *          old_value - The old string value of a field (string fields)
   *          new_value - The new string value of a field(string fields)
   *          old_numeric_value - The old numeric value of a field (numeric fields)
   *          new_numeric_value - The new numeric value of a field (numeric fields)
   *
   * @param $actionArgsArr
   */
  public static function AddHistoryItem($actionArgsArr)
  {
    $topicName = $actionArgsArr['topicName'];
    $userCreateId = isset($actionArgsArr['user_create_id']) ? $actionArgsArr['user_create_id'] : null;
    $entityType = isset($actionArgsArr['entity_type']) ? $actionArgsArr['entity_type'] : null;
    $entityId = isset($actionArgsArr['entity_id']) ? $actionArgsArr['entity_id'] : null;

    $models = $actionArgsArr['models'];

    $historyObj = new History;
    $historyObj->key = Helper::getNewTableKey('history', 10);

    $historyObj->user_create_id = null;

    if (!is_null($userCreateId)) {
      $historyObj->user_create_id = $userCreateId;
    } else {
      $user = Auth::user();
      if (!is_null($user)) {
        $historyObj->user_create_id = $user->id;
      }
    }

    if (Session::get("controlling_user_id")) {
      $historyObj->controlling_user_id = Session::get("controlling_user_id");
    }

    if (!is_null($entityType)) {
      $historyObj->entity_type = $entityType;
    }

    if (!is_null($entityId)) {
      $historyObj->entity_id = $entityId;
    }
    $history_topic = HistoryTopics::select(['id'])->where('operation_name', $topicName)->first();
    $historyObj->history_topic_id = $history_topic ? $history_topic->id : null;
    $historyObj->save();

    for ($modelIndex = 0; $modelIndex < count($models); $modelIndex++) {
      $actionHistoryObj = new ActionHistory;
      $actionHistoryObj->history_id = $historyObj->id;

      if (isset($models[$modelIndex]['description'])) {
        $actionHistoryObj->description = $models[$modelIndex]['description'];
      }

      $actionHistoryObj->key = Helper::getNewTableKey('action_history', 10);
      $actionHistoryObj->referenced_model = $models[$modelIndex]['referenced_model'];
      $actionHistoryObj->referenced_model_action_type = $models[$modelIndex]['referenced_model_action_type'];
      $actionHistoryObj->referenced_id = $models[$modelIndex]['referenced_id'];
      $actionHistoryObj->save();

      if (isset($models[$modelIndex]['valuesList'])) {
        ActionController::AddHistoryDetails($actionHistoryObj->id, $models[$modelIndex]['valuesList']);
      }
    }
  }

  /**
   * This function gets the actions statuses
   * from the table.
   */
  public function getActionStatuses()
  {
    $jsonOutput = app()->make("JsonOutput");

    $actionStatuses = ActionStatus::where('deleted', 0)->get();

    $jsonOutput->setData($actionStatuses);
  }

  /*
     *   this function adds a new action to existing request via post method
     */

  public function addActionRequest(Request $request, $reqKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if ($reqKey == null || trim($reqKey) == '') {
      $jsonOutput->setErrorCode(config('errors.crm.MISSING_REQUEST_KEY'));
      return;
    }
    if ($request->input('entity_type') != 0 && $request->input('entity_type') != 1) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_ENTITY_TYPE'));
      return;
    }
    if ($request->input('action_type') == null || !is_numeric($request->input('action_type'))) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_TYPE'));
      return;
    }
    if ($request->input('action_topic_id') == null || !is_numeric($request->input('action_topic_id'))) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_TOPIC'));
      return;
    }
    if ($request->input('action_status_id') == null || !is_numeric($request->input('action_status_id'))) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_STATUS'));
      return;
    }
    if ($request->input('details') == null || trim($request->input('details')) == '') {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_DETAILS'));
      return;
    }
    if ($request->input('action_date') == null || trim($request->input('action_date')) == '' || !CrmRequestController::checkDateTimeCorrectFormat($request->input('action_date'))) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_DATE'));
      return;
    }
    if ($request->input('conversation_direction') != null && $request->input('conversation_direction') != '-1'  && trim($request->input('conversation_direction')) != '') {
      if ($request->input('conversation_direction') != 0 && $request->input('conversation_direction') != 1) {
        $jsonOutput->setErrorCode(config('errors.global.WRONG_ACTION_DIRECTION'));
        return;
      }
    }
    $actionTP = ActionType::where('id', $request->input('action_type'))->first();
    if (!$actionTP) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_TYPE_NOT_EXISTS'));
      return;
    }
    $actionTopic = ActionTopic::where('id', $request->input('action_topic_id'))->first();
    if (!$actionTopic) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_TOPIC_NOT_EXISTS'));
      return;
    }
    $actionST = ActionStatus::where('id', $request->input('action_status_id'))->first();
    if (!$actionST) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_STATUS_NOT_EXISTS'));
      return;
    }
    $theRequest = CrmRequest::where('key', $reqKey)->first();
    if ($theRequest) { //verify that the request exists

      $statusTypeID = 0;
      $statusType = CrmRequestStatus::select('type_id')->where('id', $theRequest->status_id)->first();
      if ($statusType) {
        $statusTypeID = $statusType->type_id;
      }
      if ($statusTypeID != 3) {
        $this->addNewActionRequest(
          $request->input('entity_type'),
          $request->input('action_type'),
          $request->input('action_topic_id'),
          $request->input('conversation_direction'),
          $request->input('conversation_with'),
          $request->input('action_date'),
          $request->input('details'),
          $request->input('action_status_id'),
          $theRequest->id
        );
      } else {
        $jsonOutput->setErrorCode(config('errors.global.CANT_ADD_ACTION_TO_FINISHED_REQUEST'));
      }
    } else {
      $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
    }
  }

  /*
		Function that add new request/voter action by params
	*/
  public static function addNewActionRequest(
    $entityType,
    $actionType,
    $actionTopicID,
    $conversationDirection,
    $conversationWith,
    $actionDate,
    $actionDetails,
    $actionStatusID,
    $requestId
  ) {

    $jsonOutput = app()->make("JsonOutput");
    $newAction = new Action;
    $newAction->entity_type = $entityType; //1-request;0-voter

    $newAction->entity_id = $requestId;
    $newAction->action_type = $actionType;
    $newAction->action_topic_id = $actionTopicID;
    if ($conversationDirection == 0 || $conversationDirection == 1) {
      $newAction->conversation_direction = $conversationDirection;
    }
    $newAction->conversation_with_other = $conversationWith;
    $newAction->action_date = $actionDate;
    $newAction->description = $actionDetails;
    $newAction->user_create_id = Auth::user()->id;
    $newAction->action_status_id = $actionStatusID;
    $newAction->key = Helper::getNewTableKey('actions', 10);
    $newAction->save();
    $historyDataArray = array();
    $tempObj = ActionType::select(['name'])->where('id', $actionType)->first();
    if ($tempObj) {
      $arrayItem = [
        'field_name' => 'action_type',
        'display_field_name' => config('history.Action.action_type'),
        'new_value' => $tempObj->name,
        'new_numeric_value' => $actionType
      ];

      array_push($historyDataArray, $arrayItem);
    }
    $tempObj = ActionTopic::select(['name'])->where('id', $actionTopicID)->first();
    if ($tempObj) {
      $arrayItem = [
        'field_name' => 'action_topic_id',
        'display_field_name' => config('history.Action.action_topic_id'),
        'new_value' => $tempObj->name,
        'new_numeric_value' => $actionTopicID
      ];

      array_push($historyDataArray, $arrayItem);
    }
    $tempObj = ActionStatus::select(['name'])->where('id', $actionStatusID)->first();
    if ($tempObj) {
      $arrayItem = [
        'field_name' => 'action_status_id',
        'display_field_name' => config('history.Action.action_status_id'),
        'new_value' => $tempObj->name,
        'new_numeric_value' => $actionStatusID
      ];

      array_push($historyDataArray, $arrayItem);
    }

    if ($actionDetails != null && $actionDetails != '') {
      $arrayItem = [
        'field_name' => 'description',
        'display_field_name' => config('history.Action.description'),
        'new_value' => $actionDetails
      ];

      array_push($historyDataArray, $arrayItem);
    }
    if ($conversationWith != null && $conversationWith != '') {
      $arrayItem = [
        'field_name' => 'conversation_with_other',
        'display_field_name' => config('history.Action.conversation_with_other'),
        'new_value' => $conversationWith
      ];

      array_push($historyDataArray, $arrayItem);
    }
    if ($conversationDirection == '0' || $conversationDirection == '1') {
      $arrayItem = [
        'field_name' => 'conversation_direction',
        'display_field_name' => config('history.Action.conversation_direction'),
        'new_numeric_value' => $conversationDirection,
        'new_value' => $conversationDirection == '1' ? 'נכנסת' : 'יוצאת'
      ];

      array_push($historyDataArray, $arrayItem);
    }

    $historyDataArray[] = [
      'field_name' => 'entity_type',
      'display_field_name' => config('history.Action.entity_type.request'),
      'new_numeric_value' => $entityType
    ];

    $historyDataArray[] = [
      'field_name' => 'entity_id',
      'display_field_name' => config('history.Action.entity_id.request'),
      'new_numeric_value' => $requestId
    ];

    $historyArgsArr = [
      'topicName' => 'crm.requests.actions.add',
      'models' => [
        [
          'referenced_model' => 'Action',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
          'referenced_id' => $newAction->id,
          'valuesList' => $historyDataArray
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);

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
    $crmRequestAction = Action::select($fieldsWeNeed)/* = */
      ->withRequest()/* = */
      ->withType()/* = */
      ->withTopic()/* = */
      ->where('actions.id', $newAction->id)
      ->where('actions.deleted', 0)
      ->withUserMetadata()/* = */
      ->first();

    $jsonOutput->setData($crmRequestAction);
  }

  /*
		Private helpful function that returns Id or CrmRequest by key
	*/
  private function getRequestIdByKey($reqKey)
  {
    $requests = CrmRequest::where('key', $reqKey)->first(['id']);

    return $requests->id;
  }

  /*
		Function that adds new voter action
	*/
  public function addVoterCallAction(Request $request, $voterKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentVoter = Voters::where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
      return;
    }

    $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
      return;
    }
    $actionDetails = $this->actionDetails;


    $callActionType = ActionType::select('id')->where('system_name', 'call')->first();
    $callActionTopic = ActionTopic::select('id')->where('system_name', 'call.out')->first();
    $actionStatusDone = config('constants.ACTION_STATUS_DONE');
    $newActionData = [
      'action_type' => $callActionType->id,
      'action_topic_id' => $callActionTopic->id,
      'conversation_direction' => 1, //Call out
      'conversation_with_other' => '',
      'action_date' => Carbon::now(),
      'description' => '',
      'action_status_id' => $actionStatusDone
    ];
    $newAction = $this->addNewAction($currentVoter->id, $newActionData);
    $jsonOutput->setData($newAction);
  }
  /*
		Function that adds new voter action
	*/
  public function addVoterAction(Request $request, $voterKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentVoter = Voters::where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
      return;
    }

    $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
      return;
    }
    $actionDetails = $this->actionDetails;

    $newActionData = [];
    foreach ($actionDetails as $fieldName) {
      $newActionData[$fieldName] = $request->input($fieldName);
    }

    $newAction = $this->addNewAction($currentVoter->id, $newActionData);
    $jsonOutput->setData($newAction);
  }
  private function addNewAction($entity_id, $newActionData)
  {

    $newAction = new Action;
    $newAction->entity_type = config('constants.ENTITY_TYPE_VOTER');
    $newAction->key = Helper::getNewTableKey('actions', 10, Helper::DIGIT);
    $newAction->user_create_id = Auth::user()->id;
    $newAction->entity_id = $entity_id;

    $actionDetails = $this->actionDetails;

    foreach ($actionDetails as $fieldName) {
      $newAction->$fieldName = $newActionData[$fieldName];
    }
    // Save the new action
    $newAction->save();

    // Array of display field names
    $historyFields = $this->actionDetails;
    $historyFields[] = 'entity_type';
    $historyFields[] = 'entity_id';

    $historyFieldsNames = [];
    for ($fieldIndex = 0; $fieldIndex < count($historyFields); $fieldIndex++) {
      $fieldName = $historyFields[$fieldIndex];

      switch ($fieldName) {
        case 'entity_type':
        case 'entity_id':
          $historyFieldsNames[$fieldName] = config('history.Action.' . $fieldName . '.voter');
          break;

        default:
          $historyFieldsNames[$fieldName] = config('history.Action.' . $fieldName);
          break;
      }
    }

    $fieldsArray = [];
    foreach ($historyFieldsNames as $fieldName => $display_field_name) {
      switch ($fieldName) {
        case 'entity_type':
        case 'entity_id':
        case 'action_type':
        case 'action_topic_id':
        case 'action_status_id':
          $fieldsArray[] = [
            'field_name' => $fieldName,
            'display_field_name' => $display_field_name,
            'new_numeric_value' => $newAction->{$fieldName}
          ];
          break;

        case 'conversation_direction':
          switch ($newAction->conversation_direction) {
            case 0;
              $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_value' => 'יוצאת',
                'new_numeric_value' => $newAction->{$fieldName}
              ];
              break;

            case 1;
              $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_value' => 'נכנסת',
                'new_numeric_value' => $newAction->{$fieldName}
              ];
              break;
          }
          break;

        default:
          $fieldsArray[] = [
            'field_name' => $fieldName,
            'display_field_name' => $display_field_name,
            'new_value' => $newAction->{$fieldName}
          ];
          break;
      }
    }

    $historyArgsArr = [
      'topicName' => 'elections.voter.actions.add',
      'models' => [
        [
          'referenced_model' => 'Action',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
          'referenced_id' => $newAction->id,
          'valuesList' => $fieldsArray
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);
    return $newAction;
  }

  /**
   * Function that adds new action
   * @param Request $request
   * @param         $reqKey
   */
  public function addAction(Request $request, $key)
  {
    $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
    if (in_array('elections.voter.actions.add', $routePermissions)) {
      $this->addVoterAction($request, $key);
      return;
    }
    if (in_array('elections.voter.fast_buttons.dial', $routePermissions)) {
      $this->addVoterCallAction($request, $key);
      return;
    }

    if (in_array('crm.requests.actions.add', $routePermissions)) {
      $this->addActionRequest($request, $key);
      return;
    }
  }

  /*
		Private helpful function that deletes crmRequest-action by requestKey and actionKey
	*/
  private function deleteRequestAction($requestKey, $actionKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentReq = CrmRequest::where('key', $requestKey)->first(['requests.id']);
    if ($currentReq == null) {
      $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
      return;
    }

    $actionObj = Action::where('key', $actionKey)->first(['id']);
    if ($actionObj == null) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_DOESNT_EXIST'));
      return;
    }

    $actionObj->deleted = 1;
    $actionObj->save();

    $historyArgsArr = [
      'topicName' => 'crm.requests.actions.delete',
      'models' => [
        [
          'referenced_model' => 'Action',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
          'referenced_id' => $actionObj->id
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);

    $jsonOutput->setData('ok');
  }

  /*
		Private helpful function that deletes voter-action by voterKey and actionKey
	*/
  private function deleteVoterAction($voterKey, $actionKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentVoter = Voters::where('key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
      return;
    }

    $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
      return;
    }

    $actionObj = Action::where('key', $actionKey)->first(['id']);
    if ($actionObj == null) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_DOESNT_EXIST'));
      return;
    }

    $actionObj->deleted = 1;
    $actionObj->save();

    $historyArgsArr = [
      'topicName' => 'elections.voter.actions.delete',
      'models' => [
        [
          'referenced_model' => 'Action',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
          'referenced_id' => $actionObj->id
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);

    $jsonOutput->setData('ok');
  }

  /*
		Function that deletes action - crm or voter action - by route and key
	*/
  public function deleteAction($entityKey, $actionKey)
  {
    $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
    if (in_array('elections.voter.actions.delete', $routePermissions)) {
      $this->deleteVoterAction($entityKey, $actionKey);
      return;
    }

    if (in_array('crm.requests.actions.delete', $routePermissions)) {
      $this->deleteRequestAction($entityKey, $actionKey);
      return;
    }
  }

  /*
		Function that edits specific crmRequest action by its key and POST params
	*/
  public function editActionRequest(Request $request, $requestKey, $actionKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($request->input('conversation_direction') != NULL  &&  $request->input('conversation_direction') != '-1' && $request->input('conversation_direction') != '0' && $request->input('conversation_direction') != '1') {
      $jsonOutput->setErrorCode(config('errors.global.WRONG_ACTION_DIRECTION'));
      return;
    }
    $currentReq = CrmRequest::select()->where('key', $requestKey)->first();
    if ($currentReq == null) {
      $jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
      return;
    }

    $actionObj = Action::where('key', $actionKey)->first(['id']);
    if ($actionObj == null) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_DOESNT_EXIST'));
      return;
    }

    $fieldsArray = [];

    $totalSavesCount = 0;
    if ($request->input('action_type') != null && is_numeric($request->input('action_type'))) {
      $actionObj->action_type = $request->input('action_type');
      $totalSavesCount++;

      if ($actionObj->action_type != $currentReq->action_type) {
        $fieldsArray[] = [
          'field_name' => 'action_type',
          'display_field_name' => config('history.Action.action_type'),
          'old_numeric_value' => $currentReq->action_type,
          'new_numeric_value' => $actionObj->action_type
        ];
      }
    }
    if ($request->input('action_topic_id') != null && is_numeric($request->input('action_topic_id'))) {
      $actionObj->action_topic_id = $request->input('action_topic_id');
      $totalSavesCount++;

      if ($actionObj->action_topic_id != $currentReq->action_topic_id) {
        $fieldsArray[] = [
          'field_name' => 'action_topic_id',
          'display_field_name' => config('history.Action.action_topic_id'),
          'old_numeric_value' => $currentReq->action_topic_id,
          'new_numeric_value' => $actionObj->action_topic_id
        ];
      }
    }
    if ($request->input('action_status_id') != null && is_numeric($request->input('action_status_id'))) {
      $actionObj->action_status_id = $request->input('action_status_id');
      $totalSavesCount++;

      if ($actionObj->action_status_id != $currentReq->action_status_id) {
        $fieldsArray[] = [
          'field_name' => 'action_status_id',
          'display_field_name' => config('history.Action.action_status_id'),
          'old_numeric_value' => $currentReq->action_status_id,
          'new_numeric_value' => $actionObj->action_status_id
        ];
      }
    }
    if ($request->input('description') != null) {
      $actionObj->description = $request->input('description');
      $totalSavesCount++;

      if ($actionObj->description != $currentReq->description) {
        $fieldsArray[] = [
          'field_name' => 'description',
          'display_field_name' => config('history.Action.description'),
          'old_value' => $currentReq->description,
          'new_value' => $actionObj->description
        ];
      }
    }
    if ($request->input('conversation_with_other') != null) {
      $actionObj->conversation_with_other = $request->input('conversation_with_other');
      $totalSavesCount++;

      if ($actionObj->conversation_with_other != $currentReq->conversation_with_other) {
        $fieldsArray[] = [
          'field_name' => 'conversation_with_other',
          'display_field_name' => config('history.Action.conversation_with_other'),
          'old_value' => $currentReq->conversation_with_other,
          'new_value' => $actionObj->conversation_with_other
        ];
      }
    }
    if ($request->input('action_date') != null) {
      $actionObj->action_date = $request->input('action_date');
      $totalSavesCount++;

      if ($actionObj->action_date != $currentReq->action_date) {
        $fieldsArray[] = [
          'field_name' => 'action_date',
          'display_field_name' => config('history.Action.action_date'),
          'old_value' => $currentReq->action_date,
          'new_value' => $actionObj->action_date
        ];
      }
    }
    $actionObj->conversation_direction = $request->input('conversation_direction');
    $totalSavesCount++;

    if ($actionObj->conversation_direction != $currentReq->conversation_direction) {
      $fieldsArray[] = [
        'field_name' => 'conversation_direction',
        'display_field_name' => config('history.Action.conversation_direction'),
        'old_numeric_value' => $currentReq->conversation_direction,
        'new_numeric_value' => $actionObj->conversation_direction
      ];
    }

    if ($totalSavesCount > 0) {
      $actionObj->save();

      if (count($fieldsArray) > 0) {
        $historyArgsArr = [
          'topicName' => 'crm.requests.actions.edit',
          'models' => [
            [
              'referenced_model' => 'Action',
              'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
              'referenced_id' => $actionObj->id,
              'valuesList' => $fieldsArray
            ]
          ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
      }

      $jsonOutput->setData('ok');
    } else {
      $jsonOutput->setErrorCode(config('errors.global.CANT_SAVE_ACTION_WITH_UNCHANGED_DATA'));
    }
  }

  /*
		Private helpful function that edits specific voter action by its key and POST params
	*/
  private function editVoterAction(Request $request, $voterKey, $actionKey, $editCallAction = false)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentVoter = Voters::where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
      return;
    }

    $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
      return;
    }

    $actionObj = Action::where('key', $actionKey)->first();
    if ($actionObj == null) {
      $jsonOutput->setErrorCode(config('errors.global.ACTION_DOESNT_EXIST'));
      return;
    }
    $conversation_with_other = $request->input('conversation_with_other', '');
    if (strlen(utf8_decode($conversation_with_other)) > 100) {
      $jsonOutput->setErrorCode(config('errors.system.WRONG_PARAMS'));
      return;
    }

    if (!$editCallAction) {
      $actionDetails = [
        'action_type', 'action_topic_id', 'conversation_direction', 'conversation_with_other',
        'action_date', 'description', 'action_status_id'
      ];
    } else {
      $actionDetails = [
        'conversation_with_other', 'description'
      ];
    }


    $oldActionValues = [];
    foreach ($actionDetails as $fieldname) {
      $val = $request->input($fieldname, null);
      if (!is_null($val) && $val != $actionObj->$fieldname) { //Check if field value had changed
        $oldActionValues[$fieldname] = $actionObj->$fieldname;
        $actionObj->$fieldname = $val;
      }
    }

    if (empty($oldActionValues)) {  // nothing has not changed
      $jsonOutput->setData($actionObj);
      return;
    }

    $actionObj->save();

    $historyFields = array_keys($oldActionValues); //Get changed values keys

    $historyFieldsNames = [];
    for ($fieldIndex = 0; $fieldIndex < count($historyFields); $fieldIndex++) {
      $fieldName = $historyFields[$fieldIndex];

      $historyFieldsNames[$fieldName] = config('history.Action.' . $fieldName);
    }

    $fieldsArray = [];
    foreach ($historyFieldsNames as $fieldName => $display_field_name) {
      if ($oldActionValues[$fieldName] != $actionObj->{$fieldName}) {
        switch ($fieldName) {
          case 'action_type':
          case 'action_topic_id':
          case 'action_status_id':
            $fieldsArray[] = [
              'field_name' => $fieldName,
              'display_field_name' => $display_field_name,
              'new_numeric_value' => $actionObj->{$fieldName}
            ];
            break;

          case 'conversation_direction':
            $insertFields = [
              'field_name' => $fieldName,
              'display_field_name' => $display_field_name,
            ];

            switch ($oldActionValues[$fieldName]) {
              case 0:
                $insertFields['old_value'] = 'יוצאת';
                $insertFields['old_numeric_value'] = $oldActionValues[$fieldName];
                break;

              case 1:
                $insertFields['old_value'] = 'נכנסת';
                $insertFields['old_numeric_value'] = $oldActionValues[$fieldName];
                break;
            }

            switch ($actionObj->conversation_direction) {
              case 0:
                $insertFields['new_value'] = 'יוצאת';
                $insertFields['new_numeric_value'] = $actionObj->conversation_direction;
                break;

              case 1:
                $insertFields['new_value'] = 'נכנסת';
                $insertFields['new_numeric_value'] = $actionObj->conversation_direction;
                break;
            }

            $fieldsArray[] = $insertFields;
            break;

          default:
            $fieldsArray[] = [
              'field_name' => $fieldName,
              'display_field_name' => $display_field_name,
              'new_value' => $actionObj->{$fieldName}
            ];
            break;
        }
      }
    }

    $historyArgsArr = [
      'topicName' => 'elections.voter.actions.edit',
      'models' => [
        [
          'referenced_model' => 'Action',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
          'referenced_id' => $actionObj->id,
          'valuesList' => $fieldsArray
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);

    $jsonOutput->setData($actionObj);
  }

  /*
		Function that edits specific voter action by its key and POST params
	*/
  public function editAction(Request $request, $entityKey, $actionKey)
  {
    $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
    if (in_array('elections.voter.actions.edit', $routePermissions)) {
      $this->editVoterAction($request, $entityKey, $actionKey);
      return;
    }
    if (in_array('elections.voter.fast_buttons.dial', $routePermissions)) {
      $this->editVoterAction($request, $entityKey, $actionKey, true);
      return;
    }

    if (in_array('crm.requests.actions.edit', $routePermissions)) {
      $this->editActionRequest($request, $entityKey, $actionKey);
      return;
    }
  }

  /*
		Function that returns all actions by route type - VoterActions or CrmRequestActions
	*/
  public function getActions($key)
  {
    $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
    if (in_array('elections.voter.actions', $routePermissions)) {
      $this->getActionsFromVoter($key);
      return;
    }

    if (in_array('crm.requests.actions', $routePermissions)) {
      $this->getActionsFromRequest($key);
      return;
    }
  }

  /*
		Function that gets all actions of specific request by crmRequest key
	*/
  public function getActionsFromRequest($key)
  {

    $entity_id = $this->getRequestIdByKey($key);
    $actions = Action::select([
      'id', 'key', 'action_type', 'action_topic_id', 'more_details', 'conversation_direction as operationCompass', 'conversation_with_other as operationWithWho', 'action_date as operationDate', 'description as operationDetails', 'action_status_id as operationStatus', 'user_create_id', 'conversation_direction', 'action_date'
    ])
      ->where('entity_type', 1)->where('entity_id', $entity_id)->where('deleted', 0)->orderBy('id', 'desc')->get();

    foreach ($actions as $action) {
      if (!is_null($action->more_details)) {
        $action->more_details = json_decode($action->more_details);
      }
      $action->actionTypeName = '';
      $action->actionTopicName = '';
      $action->first_name = '';
      $action->last_name = '';
      $actionTypeName = ActionType::where('id', $action->action_type)->first();
      if ($actionTypeName) {
        $action->actionTypeName = $actionTypeName->name;
      }
      $actionTopic = ActionTopic::where('id', $action->action_topic_id)->first();
      if ($actionTopic) {
        $action->actionTopicName = $actionTopic->name;
      }
      $action->actionStatusName = ($action->operationStatus == 1 ? 'פתוח' : ($action->operationStatus == 2 ? 'בוצע' : ($action->operationStatus == 3 ? 'בוטל' : '')));

      switch ($action->operationCompass) {
        case 0:
          $action->actionConversationDirectionName = 'נכנסת';
          break;

        case 1:
          $action->actionConversationDirectionName = 'יוצאת';
          break;

        default:
          $action->actionConversationDirectionName = "";
          break;
      }

      $userData = User::where('id', $action->user_create_id)->first();
      if ($userData) {
        $action->user_key = $userData->key;
        $action->canEditAction = ($actionTopic->system_name != 'request.new' && $actionTopic->system_name != 'request.description');
        $action->editing = false;
        $voterData = Voters::withFilters()->where('voters.id', $userData->voter_id)->first();
        if ($voterData) {
          $action->first_name = $voterData->first_name;
          $action->last_name = $voterData->last_name;
        }
      }
    }



    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setData($actions);
  }

  /*
		Function that gets all actions of specific voter by voter key
	*/
  public function getActionsFromVoter($voterKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentVoter = Voters::where('key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
      return;
    }

    $currentVoter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
    if ($currentVoter == null) {
      $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
      return;
    }

    $entity_id = $currentVoter->id;
    $voterId = $entity_id;

    $voterActionsFields = [
      'actions.id',
      'actions.key',
      DB::raw("'null' as request_key"),
      'actions.action_type',
      'action_types.name as action_type_name',
      'actions.action_status_id',
      'action_status.name as action_status_name',
      'actions.conversation_direction',
      'users.key as user_create_key',
      'actions.action_date',
      'actions.description',
      'actions.conversation_with_other',
      'actions.action_topic_id',
      'action_topics.name as action_topic_name',
      'voters.first_name',
      'voters.last_name'
    ];

    $requestActionsFields = [
      'actions.id',
      'actions.key',
      'requests.key AS request_key',
      'actions.action_type',
      'action_types.name as action_type_name',
      'actions.action_status_id',
      'action_status.name as action_status_name',
      'actions.conversation_direction',
      'users.key as user_create_key',
      'actions.action_date',
      'actions.description',
      'actions.conversation_with_other',
      'actions.action_topic_id',
      'action_topics.name as action_topic_name',
      'voters.first_name',
      'voters.last_name'
    ];


    $voterActionsQuery = Action::select($voterActionsFields)->withUser()->withTopic()->withType()
      ->withStatus()
      ->where([
        'actions.entity_type' => config('constants.ENTITY_TYPE_VOTER'),
        'actions.entity_id'   => $entity_id,
        'actions.deleted'     => '0'
      ]);


    $voterActions = Action::select($requestActionsFields)->withUser()->withTopic()->withType()
      ->withStatus()->fromRequestsOfVoter($voterId)->union($voterActionsQuery)
      ->get();

    $jsonOutput->setData($voterActions);
  }
}
