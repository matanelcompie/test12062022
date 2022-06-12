<?php

namespace App\Repositories;

use App\Enums\ActionEntityType;
use App\Enums\CommonEnum;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\Action;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Teams;
use App\Models\User;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;
use App\Libraries\Services\History\HistoryItemGenerator;


class ActionRepository
{
  /**
   * Insert new action history
   *
   * @param ActionEntityType | enum $entityTypeHistory
   * @param int $entityId value of entity type
   * @param ActionTypeHistory | enum $actionTypeHistory
   * @param int $actionTopicId
   * @param string $description
   * @param string $moreDetails
   * @param ActionTypeHistory | enum $actionStatusId
   * @return Action
   */
  public static function insert($entityTypeHistory, $entityId, $actionTypeHistory, $actionTopicId, $description, $moreDetails, $actionStatusId)
  {
    $action = new Action();
    $action->entity_type = $entityTypeHistory;
    $action->entity_id = $entityId;
    $action->action_type = $actionTypeHistory;
    $action->action_topic_id = $actionTopicId;
    $action->description = $description;
    $action->more_details = $moreDetails;
    $action->action_status_id = $actionStatusId;
    $action->user_create_id = Auth::user()->id;
    $action->key = Helper::getNewTableKey('actions', 10);
    $action->save();

    return $action;
  }

  /**
   * entity,
   * type Insert / Edit / Delete,
   * description
   */
  public static function createHistoryItemModel($data)
  {
    return HistoryItemGenerator::create([
      'entity' => $data['entity'],
      'description' => $data['description'], // @todo move to constant
      'referenced' => [
        'model' => 'Action',
        'type' => $data['type'],
      ],
      'fields' => [
        'entity_type' => ['format' => 'numeric', 'display' => config('history.Action.entity_type.request')],
        'entity_id' => ['format' => 'numeric', 'display' => config('history.Action.entity_id.request')],
        'action_type' => ['format' => 'numeric', 'display' => config('history.Action.action_type')],
        'action_topic_id' => ['format' => 'numeric', 'display' => config('history.Action.action_topic_id')],
        'action_status_id' => ['format' => 'numeric', 'display' => config('history.Action.action_status_id')],
        'description' => ['format' => 'string', 'display' => config('history.Action.description')]
      ]
    ]);
  }

  public static function getActionListByRequestId($id)
  {
    return  Action::select(
      [
        'id',
        'entity_id',
        'action_type',
        'action_topic_id',
        'action_status_id',
        'action_date',
        'description',
      ]
    )->with(['actionType' => function ($q) {
      $q->select(['id', 'name', 'system_name']);
    }])
      ->with(['actionStatus' => function ($q) {
        $q->select(['id', 'name']);
      }])
      ->with(['actionTopic' => function ($q) {
        $q->select(['id', 'name']);
      }])
      ->where('entity_type', ActionEntityType::ENTITY_TYPE_REQUEST)
      ->where('entity_id', $id)
      ->get();
  }
}
