<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Models\Teams;
use App\Models\Tm\CampaignMessages;
use App\Models\Tm\CtiPermission;
use App\Models\User;
use App\Models\VoterFilter\VoterFilter;
use App\Traits\SpecialSoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property string  $created_at
 * @property string  $updated_at
 */
class Campaign extends KeyedModel
{
  use SpecialSoftDeletes;

  public $primaryKey = 'id';
  protected $table = 'campaigns';

  /**
   * @var array
   */
  protected $fillable = [
    'name',
    'description',
    'status',
    'election_campaigns_id',
    'action_call_no_answer',
    'scheduled_time_no_answer',
    'return_call_after',
    'max_return_call',
    'general_election',
    'user_create_id',
    'user_update_id',
    'scheduled_start_date',
    'scheduled_end_date',
    'team_id',
    'user_role_id',
    'telephone_predictive_mode',
    'phone_number',
    'sip_server_id',
    'transportation_coordination_phone',
    'sms_message',
    'email_topic',
    'email_body',
    'team_department_id',
    'single_voter_for_household',
    'single_phone_occurrence',
    'only_users_with_mobile'
  ];

  protected $visible = [
    'id',
    'key',
    'name',
    'description',
    'status',
    'election_campaigns_id',
    'action_call_no_answer',
    'scheduled_time_no_answer',
    'return_call_after',
    'max_return_call',
    'general_election',
    'user_create_id',
    'user_update_id',
    'creator_name',
    'questionnaire_key',
    'scheduled_start_date',
    'scheduled_end_date',
    'activation_start_date',
    'activation_end_date',
    'outbound_campaign',
    'team_id',
    'user_role_id',
    'online_users_count',
    'current_portion_id',
    'last_voter_id',
    'finished_portions',
    'cti_permissions',
    'messages',
    'transportation_coordination_phone',
    'sms_message',
    'email_topic',
    'email_body',
    'user_count',
    'voter_details',
    'telephone_predictive_mode',
    'phone_number',
    'sip_server_id',
    'team_department_id',
    'single_voter_for_household',
    'single_phone_occurrence',
    'only_users_with_mobile',
    'total_active_time_seconds',
  ];

  protected $appends = [
    'creator_name',
    'voter_details',
    'user_count',
    'questionnaire_key',
    'last_user_call_date',
    'average_call_time',
    'average_call_action_time',
    'sum_user_call_action_time',
    'online_users_count'
  ];
  //protected $with = ['creator.voter', 'questionnaire'];

  protected static function boot()
  {

    parent::boot();

    static::saving(function ($model) {
      $model->user_update_id = Auth::user()->id;

      $original = $model->getOriginal();
      if ($model->status && $model->status != $original['status']) {
        if (!$original['activation_start_date'] && $model->status == array_search('ACTIVE', config('tmConstants.campaign.statusConst'))) {
          $model->activation_start_date = DB::raw('NOW()');
        }
        if (in_array($model->status, array(array_search('CLOSED', config('tmConstants.campaign.statusConst')), array_search('CANCELED', config('tmConstants.campaign.statusConst'))))) {
          $model->activation_end_date = DB::raw('NOW()');
        } else {
          $model->activation_end_date = null;
        }
      }
    });

    static::creating(function ($model) {
      $model->description = '';
      $model->status = 0;
      $model->election_campaigns_id = 0;
      $model->action_call_no_answer = 1;
      $model->scheduled_time_no_answer = 0;
      $model->user_create_id = Auth::user()->id;
    });
  }

  const GENERAL = 1;
  const LOCAL = 2;

  const MANUAL_MODE = 1;
  const PREDICTIVE_MODE = 2;

  const TIME_FOR_RECALL = 1;
  const NO_TIME_FOR_RECALL = 0;

  const CALL_RETURN_TO_LINE = 1;
  const CALL_OUT_OF_LINE = 0;

  /**
   * Returns the related questionnaire to this campaign.
   */
  public function questionnaire()
  {
    return $this->hasOne(Questionnaire::class)->where('active', 1)->withDefault();
  }

  public function inactive_questionnaires()
  {
    return $this->hasMany(Questionnaire::class)->where('active', 0);
  }

  public function team()
  {
    return $this->belongsTo(Teams::class, 'team_id');
  }

  public function scopeWithUserTeams($query)
  {
    $query->join('roles_by_users', 'roles_by_users.team_id', '=', 'campaigns.team_id');
  }

  public function creator()
  {
    return $this->belongsTo(User::class, 'user_create_id');
  }

  public function updater()
  {
    return $this->belongsTo(User::class, 'user_update_id');
  }

  public function getCreatorNameAttribute()
  {
    try {
      $voter = $this->creator->voter;
      return $voter->first_name . ' ' . $voter->last_name;
    } catch (\Exception $e) {
      return null;
    }
  }

  public function getUserCountAttribute()
  {
    try {
      $usersCount = $this->users()->count();
      return $usersCount;
    } catch (\Exception $e) {
      return null;
    }
  }

  public function getVoterDetailsAttribute()
  {

    $voterDetails = [
      'processing_count' => 0,
      'processed_count' => 0,
      'unique_voters_count' => 0,
    ];
    try {
      $campaignPortions = $this->portions;
      $voterDetails = [
        'processing_count' => $campaignPortions->pluck('processing_count')->sum(),
        'processed_count' => $campaignPortions->pluck('processed_count')->sum(),
        'unique_voters_count' => $campaignPortions->pluck('unique_voters_count')->sum(),
      ];
      return $voterDetails;
    } catch (\Exception $e) {
      return $voterDetails;
    }
    return $voterDetails;
  }

  public function getQuestionnaireKeyAttribute()
  {
    return $this->questionnaire->key;
  }

  public function portions()
  {
    return $this->hasMany(VoterFilter::class, 'entity_id')
      ->withCampaignPortionProgress()
      ->where('entity_type', VoterFilter::ENTITY_TYPES['portion']['type_id']);
  }

  public function scopeOnlyCurrentTeams($query)
  {
    return $query->whereIn('team_id', Auth::user()->rolesByUsers->pluck('team_id'));
  }

  public function scopeActiveStatus($query)
  {
    return $query->whereIn('status', [
      static::STATUS_READY,
      static::STATUS_ACTIVE,
      static::STATUS_SUSPENDED,
    ]);
  }

  public function userCalls()
  {
    return $this->hasMany('\App\Models\Tm\Call', 'campaign_id', 'id')
      ->where('calls.user_id', Auth::user()->id);
  }

  public function calls()
  {
    return $this->hasMany('\App\Models\Tm\Call', 'campaign_id', 'id');
  }

  public function last_user_call_date_relation()
  {
    return $this->userCalls()->where('calls.call_end_status', config('tmConstants.call.status.SUCCESS'))
      ->selectRaw('max(calls.created_at) as last_user_call_date, campaign_id')
      ->groupBy('campaign_id');
  }

  public function getLastUserCallDateAttribute()
  {
    // if relation is not loaded already, let's do it first
    if (!array_key_exists('last_user_call_date_relation', $this->relations)) {
      $this->load('last_user_call_date_relation');
    }

    $related = $this->getRelation('last_user_call_date_relation');

    // then return the count directly
    if (($related) && (isset($related[0]))) {
      return $related[0]->last_user_call_date;
    } else {
      return null;
    };
  }

  public function average_call_action_time_relation()
  {
    return $this->calls()->where('calls.call_end_status', config('tmConstants.call.status.SUCCESS'))
      ->selectRaw('avg(TIMESTAMPDIFF(SECOND, calls.created_at, calls.call_action_end_date))
                                 as average_call_action_time, campaign_id')->groupBy('campaign_id');
  }

  public function getAverageCallActionTimeAttribute()
  {
    // if relation is not loaded already, let's do it first
    if (!array_key_exists('average_call_action_time_relation', $this->relations)) {
      $this->load('average_call_action_time_relation');
    }

    $related = $this->getRelation('average_call_action_time_relation');

    // then return the count directly
    if (($related) && (isset($related[0]))) {
      return (int) $related[0]->average_call_action_time;
    } else {
      return 0;
    };
  }

  public function average_call_time_relation()
  {
    return $this->calls()->where('calls.call_end_status', config('tmConstants.call.status.SUCCESS'))
      ->selectRaw('avg(TIMESTAMPDIFF(SECOND, calls.created_at, calls.call_end_date))
                                 as average_call_time, campaign_id')->groupBy('campaign_id');
  }

  public function getAverageCallTimeAttribute()
  {
    // if relation is not loaded already, let's do it first
    if (!array_key_exists('average_call_time_relation', $this->relations)) {
      $this->load('average_call_time_relation');
    }

    $related = $this->getRelation('average_call_time_relation');
    // then return the count directly
    if (($related) && (isset($related[0]))) {
      return (int) $related[0]->average_call_time;
    } else {
      return 0;
    };
  }

  public function sum_user_call_action_time_relation()
  {
    return $this->calls()->where('calls.call_end_status', config('tmConstants.call.status.SUCCESS'))
      ->selectRaw('sum(TIMESTAMPDIFF(SECOND, calls.created_at, calls.call_action_end_date))
                                 as sum_user_call_action_time, campaign_id')->groupBy('campaign_id');
  }

  public function getSumUserCallActionTimeAttribute()
  {
    // if relation is not loaded already, let's do it first
    if (!array_key_exists('sum_user_call_action_time_relation', $this->relations)) {
      $this->load('sum_user_call_action_time_relation');
    }

    $related = $this->getRelation('sum_user_call_action_time_relation');
    // then return the count directly
    if (($related) && (isset($related[0]))) {
      return (int) $related[0]->sum_user_call_action_time;
    } else {
      return 0;
    };
  }

  public static function onlineUsersCount($campaignId)
  {
    $ctiCount = Redis::hget('tm:cti_counts', $campaignId);
    if ($ctiCount != null) {
      return $ctiCount;
    } else {
      return "0";
    }
  }

  public function getOnlineUsersCountAttribute()
  {
    $id = $this->id;
    self::onlineUsersCount($id);
  }

  public function getOnBreakUsersCountAttribute()
  {
    $id = $this->id;
    $ctiBreaksCount = Redis::hget('tm:cti_break_counts', $id);
    if ($ctiBreaksCount != null) {
      return $ctiBreaksCount;
    } else {
      return "0";
    }
  }

  public function getWaitingUsersCountAttribute()
  {
    $id = $this->id;
    $ctiBreaksCount = Redis::hget('tm:cti_waiting_counts', $id);
    if ($ctiBreaksCount != null) {
      return $ctiBreaksCount;
    } else {
      return "0";
    }
  }

  /**
   * Cti permissions relationship
   *
   * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
   */
  public function cti_permissions()
  {
    return $this->belongsToMany(CtiPermission::class, 'cti_permissions_in_campaigns', 'campaign_id', 'cti_permission_id');
  }

  /**
   * Campaign messages relationship
   *
   * @return \Illuminate\Database\Eloquent\Relations\HasMany
   */
  public function messages()
  {
    return $this->hasMany(CampaignMessages::class, 'campaign_id');
  }

  /**
   * Campaign VoterFilters relationship
   *
   * @return \Illuminate\Database\Eloquent\Relations\HasMany
   */
  public function voter_filters()
  {
    return $this->hasMany(VoterFilter::class, 'entity_id', 'id');
  }

  public function scopeWithPortions($query, $key)
  {
    $query;
    $query->select(
      'voterFilters.entity_id',
      'voterFilters.key AS portionKey',
      'voterFilters.name',
      'voterFilters.entity_type',
      'campaigns.name AS campaign_name',
      'campaigns.key',
      'campaigns.id'
    )->where('campaigns.key', '!=', $key);
    $query->join('voter_filters AS voterFilters', function ($joinOn) {
      $joinOn->on('voterFilters.entity_id', '=', 'campaigns.id')->where('voterFilters.entity_type', '=', '1');
    });
  }

  public function users()
  {
    return $this->belongsToMany('App\Models\User', 'users_in_campaigns', 'campaign_id', 'user_id')
      ->wherePivot('deleted', 0);
  }

  public function scopewithUsersInCampaigns($query)
  {
    $query->join('users_in_campaigns', function ($joinOn) {
      $joinOn->on('users_in_campaigns.campaign_id', '=', 'campaigns.id')
        ->where('users_in_campaigns.deleted', 0);
    });
  }

  public function scopeWithSipServer($query)
  {
    $query->leftJoin('sip_servers', function ($joinOn) {
      $joinOn->on('sip_servers.id', '=', 'campaigns.sip_server_id')
        ->where('sip_servers.active', 1);
    });
  }
}
