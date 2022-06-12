<?php

namespace App\Models;

use App\Enums\RequestStatusType;
use App\Enums\RequestUserFilterBy;
use App\Libraries\Helper;
use App\Repositories\UserRepository;
use Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Log;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $voter_id
 * @property integer $temp_voter_id
 * @property integer $topic_id
 * @property integer $sub_topic_id
 * @property string  $date
 * @property string  $close_date
 * @property string  $target_close_date
 * @property integer $request_priority_id
 * @property integer $user_handler_id
 * @property integer $team_handler_id
 * @property integer $status_id
 * @property integer $user_create_id
 * @property integer $user_update_id
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class CrmRequest extends Model
{

  public $primaryKey = 'id';


  protected $table = 'requests';
  protected static function boot()
  {
    parent::boot();
    static::creating(function ($model) {
      $model->attributes['key'] =  Helper::getNewTableKey('requests', 6, 1);
    });
  }

  /**
   * @var array
   */
  protected $fillable = [
    'key',
    'voter_id',
    'unknown_voter_id',
    'topic_id',
    'sub_topic_id',
    'date',
    'close_date',
    'target_close_date',
    'request_priority_id',
    'request_source_id',
    'user_handler_id',
    'team_handler_id',
    'status_id',
    'user_create_id',
    'user_update_id',
    'deleted',
    'created_at',
    'updated_at'
  ];

  public function topic()
  {

    return $this->belongsTo('App\Models\CrmRequestTopic', 'topic_id');
  }

  public function subTopic()
  {

    return $this->belongsTo('App\Models\CrmRequestTopic', 'sub_topic_id');
  }

  public function voter()
  {

    return $this->belongsTo('App\Models\Voters', 'voter_id');
  }

  public function requestStatus()
  {
    return $this->belongsTo('App\Models\RequestStatus', 'status_id');
  }

  public function team()
  {
    return $this->belongsTo('App\Models\Teams', 'team_handler_id');
  }

  public function userHandler()
  {
    return $this->belongsTo('App\Models\User', 'user_handler_id');
  }


  public function scopeWithTopic($query, $clean = false)
  {

    $query->join('request_topics', function ($joinOn) {

      $joinOn->on('requests.topic_id', '=', 'request_topics.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_topics.deleted', '=', DB::raw(0))/*=*/
        ->on('request_topics.active', '=', DB::raw(1))/*=*/
        ->on('request_topics.parent_id', '=', DB::raw(0));
    });

    if (false == $clean) {
      $query->addSelect('request_topics.name AS topic_name');
    }
  }



  public function scopeWithUser($query, $clean = false)
  {

    $query->join('users', 'users.id', '=', 'requests.user_create_id')/*=*/
      ->join('voters', 'voters.id', '=', 'users.voter_id');

    if (false == $clean) {
      $query->addSelect('first_name')/*=*/
        ->addSelect('last_name');
    }
  }

  public function scopeWithPhones($query)
  {

    $query->leftJoin('voter_phones', function ($joinOn) {
      $joinOn->on('voter_phones.voter_id', '=', 'requests.voter_id')
        ->on('voter_phones.wrong', DB::raw(0));
    });
  }

  public function scopeWithUnknownVoterPhones($query)
  {
    $query->leftJoin('unknown_voter_phones', function ($joinOn) {
      $joinOn->on('unknown_voter_phones.unknown_voter_id', '=', 'requests.unknown_voter_id')
        ->on('unknown_voter_phones.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithSubTopic($query, $clean = false)
  {

    $query->join('request_topics AS request_sub_topics', function ($joinOn) {

      $joinOn->on('requests.sub_topic_id', '=', 'request_sub_topics.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_sub_topics.deleted', '=', DB::raw(0))/*=*/
        ->on('request_sub_topics.active', '=', DB::raw(1))/*=*/
        ->on('request_sub_topics.parent_id', '<>', DB::raw(0));
    });

    if (false == $clean) {
      $query->addSelect('request_sub_topics.name AS sub_topic_name');
    }
  }

  public function scopeWithVoter($query, $normal = false)
  {

    if (false == $normal) {
      $query->join('voters', 'requests.voter_id', '=', 'voters.id')
        ->where(['requests.deleted' => '0']);
    } else {
      $query->leftJoin('voters', [['requests.voter_id', '=', 'voters.id'], ['requests.deleted', '=', DB::raw(0)]])
        ->leftJoin('unknown_voters', [['requests.unknown_voter_id', '=', 'unknown_voters.id'], ['requests.deleted', '=', DB::raw(0)]]);
    }
  }



  /**
   * @param        $query
   * @param string $join
   */
  public function scopeWithTempVoter($query, $join = 'inner')
  {

    if ('left' == $join) {
      $query->leftJoin('unknown_voters', 'requests.unknown_voter_id', '=', 'unknown_voters.id');
    } else {
      $query->join('unknown_voters', 'requests.unknown_voter_id', '=', 'unknown_voters.id');
    }
    $query->where(['requests.deleted' => '0']);
  }

  public function scopeWithHandlerTeam($query)
  {

    $query->leftJoin('teams', function ($joinOn) {

      $joinOn->on('requests.team_handler_id', '=', 'teams.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('teams.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithHandlerTeamAlias($query)
  {

    $query->leftJoin('teams AS team_for_request', function ($joinOn) {

      $joinOn->on('requests.team_handler_id', '=', 'team_for_request.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('team_for_request.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithHandlerUserOfTeam($query)
  {

    $query->leftJoin('users', function ($joinOn) {

      $joinOn->on('requests.team_handler_id', '=', 'users.id')
        ->on('requests.deleted', '=', DB::raw(0))
        ->on('users.deleted', '=', DB::raw(0));
    })
      ->leftJoin('voters as handler_user_of_team', 'users.voter_id', '=', 'handler_user_of_team.id');
  }

  /**
   * Foo! But it's better this duplicate.
   *
   * @param $query
   */
  public function scopeWithHandlerUserOfTeamAlias($query)
  {

    $query->leftJoin('users AS users_of_team', function ($joinOn) {

      $joinOn->on('requests.team_handler_id', '=', 'users_of_team.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('users_of_team.deleted', '=', DB::raw(0));
    })/*=*/
      ->leftJoin('voters AS team_members', 'users_of_team.voter_id', '=', 'team_members.id');
  }

  public function scopeWithCreatorUser($query)
  {

    $query->leftJoin('users AS users_user_create', function ($joinOn) {

      $joinOn->on('requests.user_create_id', '=', 'users_user_create.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('users_user_create.deleted', '=', DB::raw(0));
    })/*=*/
      ->leftJoin('voters AS UM_USER_CREATE', 'users_user_create.voter_id', '=', 'UM_USER_CREATE.id');
  }

  public function scopeWithUpdaterUser($query)
  {

    $query->leftJoin('users AS users_user_update', function ($joinOn) {

      $joinOn->on('requests.user_update_id', '=', 'users_user_update.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('users_user_update.deleted', '=', DB::raw(0));
    })/*=*/
      ->leftJoin('voters AS UM_USER_UPDATE', 'users_user_update.voter_id', '=', 'UM_USER_UPDATE.id');
  }

  public function scopeWithShasRepresentative($query)
  {

    $query->leftJoin('voters', function ($joinOn) {

      $joinOn->on('requests.voter_id', '=', 'voters.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('voters.shas_representative', '=', DB::raw(1));
    });
  }

  public function scopeWithPriority($query, $clean = false)
  {

    $query->leftJoin('request_priority', function ($joinOn) {

      $joinOn->on('requests.request_priority_id', '=', 'request_priority.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_priority.deleted', '=', DB::raw(0));
    });
    if (false == $clean) {
      $query->addSelect('request_priority.name as request_priority_name');
    }
  }

  public function scopeWithRequestSource($query, $clean = false)
  {

    $query->leftJoin('request_source', function ($joinOn) {

      $joinOn->on('requests.request_source_id', '=', 'request_source.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_source.deleted', '=', DB::raw(0));
    });
    if (false == $clean) {
      $query->addSelect('request_source.name as request_source_name');
    }
  }

  public function documents()
  {

    return $this->belongsToMany('App\Models\Document', 'documents_in_entities', 'entity_id', 'document_id')->wherePivot('entity_type', '=', config('constants.ENTITY_TYPE_REQUEST'));
  }

  public function scopeWithAction($query)
  {

    $query->leftJoin('actions', function ($joinOn) {

      $joinOn->on('requests.id', '=', 'actions.entity_id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('actions.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_REQUEST')))/*=*/
        ->on('actions.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithStatus($query)
  {

    $query->leftJoin('request_status', function ($joinOn) {

      $joinOn->on('requests.status_id', '=', 'request_status.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_status.deleted', '=', DB::raw(0));
    });
  }
  public function scopeWithSatisfaction($query)
  {

    $query->leftJoin('request_satisfaction', function ($joinOn) {
      $joinOn->on('requests.voter_satisfaction', '=', 'request_satisfaction.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_satisfaction.deleted', '=', DB::raw(0));
    });
  }
  public function scopeWithRequestClosure($query)
  {
    $query->leftJoin('request_closure_reason', function ($joinOn) {
      $joinOn->on('requests.request_closure_reason_id', '=', 'request_closure_reason.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_closure_reason.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithStatusType($query)
  {

    $query->leftJoin('request_status AS request_status_spec', function ($joinOn) {

      $joinOn->on('requests.status_id', '=', 'request_status_spec.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_status_spec.deleted', '=', DB::raw(0));
    })->join('request_status_type', function ($joinOn) {

      $joinOn->on('request_status_spec.type_id', '=', 'request_status_type.id')/*=*/
        ->on('request_status_type.deleted', '=', DB::raw(0));
    });
  }

  public function actions()
  {

    return $this->hasMany('App\Models\Action', 'entity_id')/*=*/
      ->where('actions.entity_type', config('constants.ENTITY_TYPE_REQUEST'));
  }

  public function scopeWithCallBiz($query)
  {

    $query->leftJoin('request_callbiz', function ($joinOn) {

      $joinOn->on('requests.id', '=', 'request_callbiz.request_id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('request_callbiz.deleted', '=', DB::raw(0));
    });
  }

  public function scopeWithUserByField($query, $fieldName)
  {

    $usersTableAlias = str_replace('id', 'users', $fieldName);
    $votersTableAlias = str_replace('id', 'voters', $fieldName);
    $userFirstNameAlias = str_replace('id', 'first_name', $fieldName);
    $userLastNameAlias = str_replace('id', 'last_name', $fieldName);

    $query->join('users AS ' . $usersTableAlias, 'requests.' . $fieldName, '=', $usersTableAlias . '.id')/*=*/
      ->join('voters AS ' . $votersTableAlias, $usersTableAlias . '.voter_id', '=', $votersTableAlias . '.id');
    $query->addSelect($votersTableAlias . '.first_name as ' . $userFirstNameAlias);
    $query->addSelect($votersTableAlias . '.last_name as ' . $userLastNameAlias);
  }

  public function scopeWithHandlerUser($query)
  {

    $query->leftJoin('users AS users_user_handler', function ($joinOn) {

      $joinOn->on('requests.user_handler_id', '=', 'users_user_handler.id')/*=*/
        ->on('requests.deleted', '=', DB::raw(0))/*=*/
        ->on('users_user_handler.deleted', '=', DB::raw(0));
    })/*=*/
      ->leftJoin('voters AS user_handler_voters', 'users_user_handler.voter_id', '=', 'user_handler_voters.id');
  }

  public function scopeWithRequestCity($query, $city_keys)
  {
    $query->leftJoin('cities', 'cities.id', '=', 'voters.city_id')
      ->leftJoin('cities AS mi_cities', 'mi_cities.id', '=', 'voters.mi_city_id')
      ->where(function ($query) use ($city_keys) {
        $query->whereIn('cities.key', $city_keys)
          ->orWhereIn('mi_cities.key', $city_keys);
      });
  }

  public static function scopeLeftJoinQueryFirstActiveUnknownVoterPhone($query)
  {
    $query->leftJoin(
      "unknown_voter_phones",
      function ($query) {
        $query->on("unknown_voter_phones.id", '=', DB::raw(
          "(select unknown_voter_phones.id
        from unknown_voter_phones
        where  unknown_voter_phones.unknown_voter_id=unknown_voters.id
        order by created_at desc,unknown_voter_phones.phone_type_id limit 1)
        "
        ));
      }
    );
  }

  /**
   * Get query and connect by left join to active phone voter that is not wrong or deleted and order by mobile phone,created date
   *
   * @param [type] $query
   * @param string $nameTable
   * @return void
   */
  public static function scopeLeftJoinQueryFirstActiveVoterPhone($query, $nameTable = 'voters')
  {
    $namePhoneTable = $nameTable . '_phones';
    $id = $nameTable == 'voters' ? 'id' : 'voter_id';
    $query->leftJoin(
      "voter_phones as {$namePhoneTable}",
      function ($query) use ($nameTable, $namePhoneTable, $id) {
        $query->on("{$namePhoneTable}.id", '=', DB::raw(
          "(select voter_phones.id
        from voter_phones
        where  voter_phones.voter_id={$nameTable}.{$id} and deleted=0 and wrong =0
        order by created_at desc,voter_phones.phone_type_id limit 1)
        "
        ));
      }
    );
  }

  public function scopeAllAuthUserRequestByConditionRequestOpen($query, $onlyOpen = false)
  {
    $currentUser = Auth::user();
    $userId = $currentUser->id;
    //when user is team leader, get users list in auth user team leader and include the auth id
    $users = UserRepository::getUserListByUserTeamLeader($userId);
    if ($users->count() == 0) {
      $users = $users->push($currentUser);
    }
    $usersHandlerIds = $users->map(function ($user) {
      return $user->id;
    });

    if ($onlyOpen) {
      $query->whereIn('request_status_type.id', [RequestStatusType::REQUEST_STATUS_PROCESS, RequestStatusType::REQUEST_STATUS_NEW]);
    }
    $query->where(function ($q) use ($usersHandlerIds, $userId) {
      $q->whereIn('requests.user_handler_id', $usersHandlerIds)
        ->orWhere(function ($s) use ($userId) {
          $s->where('requests.user_handler_id', '<>', $userId)
            ->where('requests.user_create_id', '=', $userId);
        });
    });
  }

  public function scopeAuthUserHandlerByConditionRequestOpen($query, $onlyOpen = false)
  {
    $currentUser = Auth::user();
    $query->where('requests.user_handler_id', '=', $currentUser->id);

    if ($onlyOpen) {
      $query->whereIn('request_status_type.id', [RequestStatusType::REQUEST_STATUS_PROCESS, RequestStatusType::REQUEST_STATUS_NEW]);
    }
  }

  public function scopeAuthUserReceivedRequest($query)
  {
    $currentUser = Auth::user();
    $query->where('requests.user_create_id', '<>', $currentUser->id)
      ->where('requests.user_handler_id', '=', $currentUser->id);
  }

  public function scopeAuthUserTransferredRequest($query)
  {
    $currentUser = Auth::user();
    $query->where('requests.user_create_id', '=', $currentUser->id)
      ->where('requests.user_handler_id', '<>', $currentUser->id);
  }


  public function scopeAllUserLeaderTeamRequestByOpenCondition($query, $onlyOpen = false)
  {
    $currentUser = Auth::user();
    $userId = $currentUser->id;
    //when user is team leader, get users list in auth user team leader and include the auth id
    $users = UserRepository::getUserListByUserTeamLeader($userId);
    $usersHandlerIds = $users->map(function ($user) {
      return $user->id;
    });

    $query->where('requests.user_handler_id', '<>', $currentUser->id)
      ->whereIn('requests.user_handler_id', $usersHandlerIds);
    if ($onlyOpen) {
      $query->whereIn('request_status_type.id', [RequestStatusType::REQUEST_STATUS_PROCESS, RequestStatusType::REQUEST_STATUS_NEW]);
    }
  }

  public function scopeHandlerUserIdTeamUserMember($query, $userHandlerId)
  {
    $currentUser = Auth::user();
    $userId = $currentUser->id;
    //when user is team leader, get users list in auth user team leader and include the auth id
    $users = UserRepository::getUserListByUserTeamLeader($userId);
    $usersHandlerIds = $users->map(function ($user) {
      return $user->id;
    });

    $query->where('requests.user_handler_id', '=', $userHandlerId)
      ->whereIn('requests.user_handler_id', $usersHandlerIds);
  }


  /**
   * sort by condition user request
   *
   * @param string $RequestUserFilterBy | RequestUserFilterBy enum
   * @return void
   */
  public function scopeAuthUserRequestSortByType($query, $RequestUserFilterBy, $requestSortValue = null)
  {
    switch ($RequestUserFilterBy) {
      case RequestUserFilterBy::ALL_AUTH_USER_REQUEST:
        $query->allAuthUserRequestByConditionRequestOpen();
        break;
      case RequestUserFilterBy::ALL_AUTH_USER_OPEN_REQUEST:
        $query->allAuthUserRequestByConditionRequestOpen(true);
        break;
      case RequestUserFilterBy::ALL_REQUEST_AUTH_USER_HANDLER:
        $query->authUserHandlerByConditionRequestOpen();
        break;
      case RequestUserFilterBy::OPEN_REQUEST_AUTH_USER_HANDLER:
        $query->authUserHandlerByConditionRequestOpen(true);
        break;
      case RequestUserFilterBy::ALL_TEAM_REQUESTS:
        $query->allUserLeaderTeamRequestByOpenCondition();
        break;
      case RequestUserFilterBy::ALL_TEAM_OPEN_REQUESTS:
        $query->allUserLeaderTeamRequestByOpenCondition(true);
        break;
      case RequestUserFilterBy::REQUEST_AUTH_USER_RECEIVED:
        $query->AuthUserReceivedRequest(true);
        break;
      case RequestUserFilterBy::REQUEST_AUTH_USER_TRANSFERRED:
        $query->authUserTransferredRequest(true);
        break;
      case RequestUserFilterBy::REQUEST_BY_HANDLE_USER:
        $query->handlerUserIdTeamUserMember($requestSortValue);
        break;

      default:
        # code...
        break;
    }
  }

  public function scopeSearchRequestByVoterDetails($query, $searchValue)
  {

    if (is_numeric($searchValue)) {
      $query->where(function ($q) use ($searchValue) {
        $q->where('voters.personal_identity', 'like', ltrim($searchValue, '0') . '%')
          ->orWhere('unknown_voters.personal_identity', 'like', ltrim($searchValue, '0') . '%')
          ->orWhere('requests.key', 'like', $searchValue . '%');
      });
    } else {
      $valueArray = explode(' ', $searchValue);
      if (count($valueArray) == 1) {
        $query->searchByFirstNameOrLastName($valueArray[0]);
      } else {
        $query->searchByFirstNameAndLastName($valueArray);
      }
    }
  }

  public function scopeSearchByFirstNameOrLastName($query, $text)
  {
    $query->where(function ($q) use ($text) {
      $q->where('voters.last_name', 'like', $text . '%')
        ->orWhere('voters.first_name', 'like', $text . '%')
        ->orWhere('unknown_voters.first_name', 'like', $text . '%')
        ->orWhere('unknown_voters.last_name', 'like', $text . '%');
    });
  }

  public function scopeSearchByFirstNameAndLastName($query, $valueArray)
  {

    $query->where(function ($q) use ($valueArray) {
      $q->whereRaw(DB::raw(self::getStringQuerySearchByFirstAndLastName($valueArray)))
        ->orWhereRaw(DB::raw(self::getStringQuerySearchByFirstAndLastName($valueArray, 'unknown_voters')));
    });
  }

  /**
   * function get array string full name and return query string for search request by full name
   * @param array string $valueArray array string for search voter full name
   * @param string $nameTable name table for search in , voter or unknown voter
   * @return string
   */
  public static function getStringQuerySearchByFirstAndLastName($valueArray, $nameTable = 'voters')
  {
    $countWord = count($valueArray);
    //check if the first word search and the end word in first name or last name
    $stringQuery = " MATCH ($nameTable.first_name, $nameTable.last_name) AGAINST ('+" . $valueArray[0] . " +" . $valueArray[($countWord - 1)] . "' IN BOOLEAN MODE) 
    and $nameTable.first_name like '" . $valueArray[0] . "%' " .
      " and $nameTable.last_name like '%" . $valueArray[($countWord - 1)] . "%'";
    //check if the first name include the start words in string text or the last name include the end word in string text
    if ($countWord > 2) {
      $firstName = $valueArray[0] . " " . $valueArray[1];
      $lastName = $valueArray[$countWord - 2] . " " . $valueArray[$countWord - 1];
      $stringQuery = $stringQuery . " and ($nameTable.first_name like '%$firstName%' or  $nameTable.last_name like '%$lastName%') ";
    }
    return $stringQuery;
  }
}
