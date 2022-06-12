<?php

namespace App\Models;

use Illuminate\Contracts\Logging\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property boolean $entity_type
 * @property integer $entity_id
 * @property integer $action_type
 * @property integer $action_topic_id
 * @property integer $conversation_direction
 * @property string  $conversation_with_other
 * @property string  $action_date
 * @property string  $description
 * @property integer $user_create_id
 * @property integer $action_status_id
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class Action extends Model
{

  public $primaryKey = 'id';
  protected $table = 'actions';

  /**
   * @var array
   */
  protected $fillable = [
    'key',
    'entity_type',
    'entity_id',
    'action_type',
    'action_topic_id',
    'conversation_direction',
    'conversation_with_other',
    'action_date',
    'description',
    'user_create_id',
    'action_status_id',
    'deleted',
    'created_at',
    'updated_at'
  ];


  public function actionType()
  {
    return $this->belongsTo('App\Models\ActionType', 'action_type');
  }

  public function actionStatus()
  {
    return $this->belongsTo('App\Models\ActionStatus', 'action_status_id');
  }

  public function actionTopic()
  {
    return $this->belongsTo('App\Models\ActionTopic', 'action_topic_id');
  }

  /**
   * This query gets the user handler of the actions
   *
   * @param $query
   */
  public function scopeWithUser($query)
  {
    $query->join('users', 'users.id', '=', 'actions.user_create_id')
      ->join('voters', 'voters.id', '=', 'users.voter_id');
  }

  /**
   * @param $query
   */
  public function scopeWithUserFromVoters($query)
  {

    $query->join('users', function ($joinOn) {

      $joinOn->on('users.id', '=', 'actions.user_create_id')/* = */
        ->on('users.deleted', '=', DB::raw(0))/* = */
        ->on('users.active', '=', DB::raw(1))/* = */
        ->on('actions.deleted', '=', DB::raw(0));
    })/* = */
      ->join('voters', function ($joinOn) {

        $joinOn->on('users.voter_id', '=', 'voters.id');
      });
  }

  /**
   * This query gets the user-metadata handler of the actions
   *
   * @param $query
   */
  public function scopeWithUserMetadata($query)
  {
    $query->join('users', 'users.id', '=', 'actions.user_create_id')
      ->join('voters', 'voters.id', '=', 'users.voter_id')
      ->addSelect('voters.first_name')
      ->addSelect('voters.last_name');
  }

  /**
   * This query gets the request handler of the actions
   *
   * @param $query
   */
  public function scopeWithRequest($query)
  {

    $query->join('requests', 'requests.id', '=', 'actions.entity_id');
  }

  /**
   * @param $query
   */
  public function scopeWithRequestStrict($query, $leftJoin = false)
  {
    if ($leftJoin) {
      $query->leftJoin('requests', function ($joinOn) {
        $joinOn->on('requests.id', '=', 'actions.entity_id')/* = */
          ->on('requests.deleted', '=', DB::raw(0))/* = */
          ->on('actions.deleted', '=', DB::raw(0))/* = */
          ->on('actions.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_REQUEST')));
      });
    } else {
      $query->join('requests', function ($joinOn) {
        $joinOn->on('requests.id', '=', 'actions.entity_id')/* = */
          ->on('requests.deleted', '=', DB::raw(0))/* = */
          ->on('actions.deleted', '=', DB::raw(0))/* = */
          ->on('actions.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_REQUEST')));
      });
    }
  }

  public function scopeWithRequestStrictVoters($query, $leftJoin = false)
  {
    if ($leftJoin) {
      $query->leftJoin('requests AS request_voters', function ($joinOn) {
        $joinOn->on('request_voters.id', '=', 'actions.entity_id')/* = */
          ->on('request_voters.deleted', '=', DB::raw(0))/* = */
          ->on('actions.deleted', '=', DB::raw(0))/* = */
          ->on('actions.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_REQUEST')));
      })
        ->leftJoin('voters AS known_voters', [['request_voters.voter_id', '=', 'known_voters.id'], ['request_voters.deleted', '=', DB::raw(0)]])
        ->leftJoin('unknown_voters', [['request_voters.unknown_voter_id', '=', 'unknown_voters.id'], ['request_voters.deleted', '=', DB::raw(0)]]);
    } else {
      $query->join('requests AS request_voters', function ($joinOn) {
        $joinOn->on('request_voters.id', '=', 'actions.entity_id')/* = */
          ->on('request_voters.deleted', '=', DB::raw(0))/* = */
          ->on('actions.deleted', '=', DB::raw(0))/* = */
          ->on('actions.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_REQUEST')));
      })
        ->leftJoin('voters AS known_voters', [['request_voters.voter_id', '=', 'known_voters.id'], ['request_voters.deleted', '=', DB::raw(0)]])
        ->leftJoin('unknown_voters', [['request_voters.unknown_voter_id', '=', 'unknown_voters.id'], ['request_voters.deleted', '=', DB::raw(0)]]);
    }
  }

  /**
   * This query gets the action type handler of the actions
   *
   * @param $query
   */
  public function scopeWithType($query)
  {
    $query->join('action_types', 'action_types.id', '=', 'actions.action_type');
  }

  public function scopeFromRequestsOfVoter($query, $voterId)
  {
    return $query->join('requests', 'requests.id', '=', 'actions.entity_id')
      ->where([
        'actions.entity_type' => config('constants.ENTITY_TYPE_REQUEST'),
        'requests.voter_id' => $voterId,
        'actions.deleted' => '0'
      ]);
  }

  /**
   * @param $query
   */
  public function scopeWithActionTypeStrict($query)
  {

    $query->join('action_types', function ($joinOn) {

      $joinOn->on('actions.action_type', '=', 'action_types.id')/* = */
        ->on('actions.deleted', '=', DB::raw(0))/* = */
        ->on('action_types.deleted', '=', DB::raw(0));
    });
  }

  /**
   * This query gets the action topic handler of the actions
   *
   * @param $query
   */
  public function scopeWithTopic($query)
  {

    $query->join('action_topics', 'action_topics.id', '=', 'actions.action_topic_id');
  }

  /**
   * @param $query
   */
  public function scopeWithTopicStrict($query)
  {

    $query->join('action_topics', function ($joinOn) {

      $joinOn->on('action_topics.id', '=', 'actions.action_topic_id')/* = */
        ->on('action_topics.deleted', '=', DB::raw(0))/* = */
        ->on('action_topics.active', '=', DB::raw(1))/* = */
        ->on('action_types.id', '=', 'action_topics.action_type_id'); // perhaps a little bit exaggerated
    });
  }

  public function scopeWithStatus($query)
  {

    $query->join('action_status', 'action_status.id', '=', 'actions.action_status_id');
  }

  public function doTempUserTable($tableName)
  {

    $sql = 'CREATE TEMPORARY TABLE %s AS ( SELECT * FROM users WHERE users.id < 191 );';

    return $productList = DB::statement(DB::raw(sprintf($sql, $tableName)));
  }
}
