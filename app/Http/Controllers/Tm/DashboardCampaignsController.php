<?php

namespace App\Http\Controllers\Tm;

use App\API\Dialer;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Tm\GlobalController;
use App\Http\Controllers\UserController;
use App\Libraries\Helper;
use App\Libraries\Services\CampaignService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\QuestionnaireService;
use App\Libraries\Services\VoterFilterQueryService;
use App\Libraries\Services\VoterFilterService;
use App\Libraries\Services\ExportService;
use App\Models\ElectionCampaigns;
use App\Models\Languages;
use App\Models\LanguagesByUsers;
use App\Models\Teams;
use App\Models\FinishedVotersInCampaign;
use App\Models\Tm\Call;
use App\Models\Tm\CallNote;
use App\Models\Tm\Campaign;
use App\Models\Tm\CampaignBreakTimes;
use App\Models\Tm\CampaignMessages;
use App\Models\Tm\CtiPermission;
use App\Models\Tm\Questionnaire;
use App\Models\Tm\DashboardQuestion;
use App\Models\Tm\CampaignActiveTimes;
use App\Models\Tm\DashboardVotersAnswers;
use App\Models\Tm\CampaignPortionProgress;
use App\Models\Tm\CampaignWaitingTimes;
use App\Models\Tm\UserExtensions;
use App\Models\User;
use App\Models\UserPhones;
use App\Models\VoterFilter;
use App\Models\Voters;
use App\Models\VoterMetaKeys;
use App\Models\VoterMetaValues;
use App\Models\History;
use App\Models\HistoryTopics;
use App\Models\ActionHistory;
use App\Models\ActionHistoryDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

use Carbon\Carbon;
use Redirect;

class DashboardCampaignsController extends Controller
{
  /**
   * Get basic campaign stats for main dashboard screen by campaign's key
   *
   * @param string $key
   * @return void
   */
  public function getBasicCampaignDashboardStats(Request $request, $key)
  {
    try {
      $jsonOutput = app()->make("JsonOutput");

      if (!GlobalController::isActionPermitted('tm.dashboard')) {
        $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
        return;
      }

      //get campaign with seleted fields
      $campaign = Campaign::select('id', 'name', 'key', 'team_id', 'sip_server_id')->where('key', $key)->first();
      if (!$campaign) {
        $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_DOESNT_EXIST'));
        return;
      }
      $returnedObject = new \stdClass;
      $returnedObject->campaign_name = $campaign->name;

      if ($request->input("part") == "stats") {
        $arrayNeededCallStatuses = [
          config('tmConstants.call.status.SUCCESS'),
          config('tmConstants.call.status.GET_BACK'),
          config('tmConstants.call.status.LANGUAGE'),
          config('tmConstants.call.status.GOT_MARRIED'),
          config('tmConstants.call.status.CHANGED_ADDRESS'),
          config('tmConstants.call.status.WRONG_NUMBER'),
          config('tmConstants.call.status.NON_COOPERATIVE')
        ];

        $returnedObject->campaign_key = $campaign->key;

        $returnedObject->total_voters_count = VoterFilter::where('entity_type', 1)->where('entity_id', $campaign->id)->sum('unique_voters_count');

        $callsDataQuery = DB::select("select
                    count(*) as total_calls_count  ,
                    (select
                        sum(voters_count)
                      from
                        (select
                            count(distinct voter_id) as voters_count
                          from
                            finished_voters_in_campaign
                          where
                            campaign_id=" . $campaign->id . "
                          group by
                            status
                        ) as temp_finished_voters
                    ) as processed_voters_count ,
                    (select
                        count(*)
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        call_end_status in (" . implode(",", $arrayNeededCallStatuses) . ")
                    ) as answered_calls_count ,
                    (select
                        count(*)
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        call_end_status in (" . implode(",", $arrayNeededCallStatuses) . ")
                        and calls.id in
                              (select call_id from voters_answers where deleted=0 and answered=1)

                    ) as answered_calls_answered_questionary_count,

                    (select
                        sum(TIMESTAMPDIFF(SECOND, created_at , call_action_end_date))/count(*) as cnt
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        call_action_end_date > created_at

                    ) as average_action_calls_time,
                    (select
                        sum(TIMESTAMPDIFF(SECOND, created_at , call_end_date))/count(*) as cnt
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        call_end_date > created_at

                    ) as average_regular_calls_time,
                    (select
                        count(*)/(sum(TIMESTAMPDIFF(SECOND, created_at , LEAST(call_action_end_date ,call_end_date)))/3600) as cnt
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        LEAST(call_action_end_date ,call_end_date)  > created_at

                    ) as whole_campaign_calls_per_hour,
                    (select
                        avg(avg) as global_average
                      from
                        (SELECT user_id , count(*) /(sum(TIMESTAMPDIFF(SECOND, created_at , call_action_end_date))/3600) as avg FROM `calls` WHERE campaign_id=" . $campaign->id . " and call_action_end_date > created_at and campaign_id and deleted=0 group by user_id) as temp

                    ) as average_agent_calls,
                    (select
                        count(*)
                      from
                        calls
                      where
                        calls.deleted=0 and
                        calls.campaign_id=" . $campaign->id . " and
                        TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 15

                    ) as calls_quarter_hour



                   from
                    (select * from calls where calls.deleted=0 and calls.campaign_id=" . $campaign->id . ") as filtered_calls");




        if ($callsDataQuery && isset($callsDataQuery[0])) {
          $result = $callsDataQuery[0];
          $returnedObject->total_calls_count = $result->total_calls_count;
          $returnedObject->processed_voters_count = $result->processed_voters_count;
          $returnedObject->answered_calls_count = $result->answered_calls_count;
          $returnedObject->answered_calls_answered_questionary_count = $result->answered_calls_answered_questionary_count;
          $returnedObject->active_time_seconds = CampaignActiveTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date)) as total_time")->where("campaign_id", $campaign->id)->first()->total_time;
          $returnedObject->average_action_calls_time = $result->average_action_calls_time;
          $returnedObject->average_regular_calls_time = $result->average_regular_calls_time;
          $returnedObject->whole_campaign_calls_per_hour = round($result->whole_campaign_calls_per_hour);
          $returnedObject->average_agent_calls = round($result->average_agent_calls);
          $returnedObject->calls_quarter_hour = $result->calls_quarter_hour;
          $returnedObject->calls_hours_distributions = DB::select("SELECT TIMESTAMPDIFF(HOUR,created_at,now() ) as timeDF  , count(*) as callsCount FROM `calls` WHERE deleted = 0 and campaign_id=" . $campaign->id . " group by TIMESTAMPDIFF(HOUR,created_at,now() )having timeDF < 10");
        }
      }

      if ($request->input("part") == "agents") {
        $employeesArray = $this->getCampaignEmployees($key);

        $usersExtentionsHashArray = [];
        $userExtentions = UserExtensions::select('user_id', 'dialer_user_id')
          ->where('sip_server_id', $campaign->sip_server_id)
          ->get();
        for ($i = 0; $i < count($userExtentions); $i++) {
          $usersExtentionsHashArray[$userExtentions[$i]->user_id] =  $userExtentions[$i]->dialer_user_id;
        }

        $totalCallingCount = 0;
        $totalWaitingCount = 0;
        $totalBreakingCount = 0;

        for ($i = 0; $i < count($employeesArray); $i++) {
          $employee = $employeesArray[$i];
          if (array_key_exists($employee->user_id, $usersExtentionsHashArray)) {
            $tempUserID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$employee->user_id], "user_id");
            $tempUserStatus = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$employee->user_id], "status");
            $tempUserCampaignID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$employee->user_id], "campaign_id");
            if ($tempUserID == $employee->user_id) {
              switch ($tempUserStatus) {
                case "call":
                  if ($tempUserCampaignID == $campaign->id) {
                    $totalCallingCount++;
                  }
                  break;
                case "waiting":
                  if ($tempUserCampaignID == $campaign->id) {
                    $totalWaitingCount++;
                  }
                  break;
                case "break":
                  if ($tempUserCampaignID == $campaign->id) {
                    $totalBreakingCount++;
                  }
                  break;
              }
            }
            $employeesArray[$i]->dialer_id = $usersExtentionsHashArray[$employee->user_id];
          }
        }
        $returnedObject->total_agents_count = count($employeesArray);


        $returnedObject->online_agents_count = (string) ($totalWaitingCount + $totalCallingCount);
        $returnedObject->on_break_agents_count = (string) $totalBreakingCount; // $campaign->getOnBreakUsersCountAttribute();
        $returnedObject->waiting_agents_count = (string) $totalWaitingCount; //$campaign->getWaitingUsersCountAttribute();
        $returnedObject->active_calls_count = (string) $totalCallingCount;
      }

      if ($request->input("part") == "portions") {
        $returnedObject->portions_list = CampaignPortionProgress::select('processed_count', 'name', 'unique_voters_count')->withPortions()->where('entity_type', 1)->where('entity_id', $campaign->id)->get();
      }

      $jsonOutput->setData($returnedObject);
    } catch (\Throwable $th) {
    }
  }

  /**
   * Get calling voter's data of agent by agent(user) key
   *
   * @param  string $key - campaignKey
   * @param  string $userKey - user(employee) key
   * @return void
   */
  public function getSpecificAgentCallingVoterData($key, $userKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //get campaign with seleted fields
    $campaign = Campaign::select('id', 'key', 'name', 'team_id', 'sip_server_id')->where('key', $key)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_DOESNT_EXIST'));
      return;
    }
    $employeesArray = $this->getCampaignEmployees($key);
    $currentEmployee = null;
    for ($i = 0; $i < count($employeesArray); $i++) {
      $item = $employeesArray[$i];
      if ($item->key == $userKey) {
        $currentEmployee = $item;
        break;
      }
    }

    if (!$currentEmployee) {
      $jsonOutput->setErrorCode(config('errors.elections.USER_IN_CAMPAIGN_DOESNT_EXIST'));
      return;
    }

    $usersExtentionsHashArray = [];
    $userExtentions = UserExtensions::select('user_id', 'dialer_user_id')
      ->where('sip_server_id', $campaign->sip_server_id)
      ->get();
    for ($i = 0; $i < sizeof($userExtentions); $i++) {
      $usersExtentionsHashArray[$userExtentions[$i]->user_id] =  $userExtentions[$i]->dialer_user_id;
    }
    $user_sip_number = $usersExtentionsHashArray[$currentEmployee->user_id];
    $tempUserID = null;
    $sipData = Redis::hgetAll('tm:sip_numbers:' . $user_sip_number);
    if ($sipData) {
      $tempUserID = $sipData['user_id'];
      $tempUserStatus = $sipData['status'];
      $tempUserCampaignID = $sipData['campaign_id'];
    }
    $currentEmployee->status_id = 0;
    if ($tempUserID == $currentEmployee->user_id) {
      $fields = [
        'user_id', 'first_name', 'last_name', 'phone_number',
        'voter_id', 'voters.key as voter_key',
        DB::raw('TIMESTAMPDIFF(SECOND,calls.created_at,now() ) as duration')
      ];
      $voterData = Call::select($fields)
        ->join('voters', 'voters.id', '=', 'calls.voter_id')
        ->where('calls.deleted', 0)
        ->where('calls.user_id', $currentEmployee->user_id)
        ->where('calls.campaign_id', $campaign->id)
        ->where(function ($query) {
          $query->whereNull('call_end_date')->orWhereNull('call_action_end_date');
        })
        ->orderBy('calls.created_at', 'DESC')
        ->first();
      if ($voterData) {
        $currentEmployee->voter_id = $voterData->voter_id; // voter who gets the call
        $currentEmployee->voter_key = $voterData->voter_key;
        $currentEmployee->voter_name = $voterData->first_name . ' ' . $voterData->last_name;
        if ($voterData->phone_number) {
          $currentEmployee->phone_number = $voterData->phone_number;
        }
      }

      switch ($tempUserStatus) {
        case "call":
          if ($tempUserCampaignID == $campaign->id) {
            $currentEmployee->status_id = config('tmConstants.agent.callingStatus.CALL');
            $currentEmployee->user_sip_number = $user_sip_number;

            if ($voterData) {
              $currentEmployee->state_duration_seconds = $voterData->duration;
            }
          }
          break;
        case "waiting":
          $currentEmployee->status_id = config('tmConstants.agent.callingStatus.WAITING');
          $waitingTimeObject = CampaignWaitingTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id', $currentEmployee->user_id)->where('campaign_id', $campaign->id)->orderBy('created_at', 'DESC')->first();
          if ($waitingTimeObject) {
            $currentEmployee->state_duration_seconds = $waitingTimeObject->duration;
          }
          break;
        case "break":
          $currentEmployee->status_id = config('tmConstants.agent.callingStatus.BREAK');
          $breakTimeObject = CampaignBreakTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id', $currentEmployee->user_id)->where('campaign_id', $campaign->id)->orderBy('created_at', 'DESC')->first();
          if ($breakTimeObject) {
            $currentEmployee->state_duration_seconds = $breakTimeObject->duration;
          }
          break;
      }
    }
    $currentEmployee->dialer_id = $usersExtentionsHashArray[$currentEmployee->user_id];

    $jsonOutput->setData($currentEmployee);
  }
  /**
   * Get agents performance by campaign key
   *
   * @param string $key
   * @return void
   */
  public function getAgentsPerformance(Request $request, $key)
  {
    $executionStartTime = microtime(true);
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //get campaign with seleted fields
    $campaign = Campaign::select('id', 'key', 'name', 'team_id', 'sip_server_id')->where('key', $key)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_DOESNT_EXIST'));
      return;
    }
    $returnedObject = new \stdClass;
    $returnedObject->campaign_name = $campaign->name;
    if ($request->input("part") == "stats") {
      $returnedObject->campaign_key = $campaign->key;

      $returnedObject->houry_average_action_calls_time = floor(Call::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , call_action_end_date))/count(*) as cnt ")->whereRaw("call_action_end_date > created_at")->where("campaign_id", $campaign->id)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60")->where("deleted", 0)->first()->cnt); // in seconds
      $returnedObject->houry_average_regular_calls_time = floor(Call::selectRaw("sum(TIMESTAMPDIFF(SECOND,created_at , call_end_date ))/count(*) as cnt ")->whereRaw("call_end_date > created_at")->where("campaign_id", $campaign->id)->where("deleted", 0)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60")->first()->cnt); // in seconds
      $returnedObject->houry_average_calls_time = floor(DB::select("select avg(avg) as global_average from (SELECT user_id , count(*) /(sum(TIMESTAMPDIFF(SECOND, created_at , call_action_end_date))/3600) as avg FROM `calls` WHERE campaign_id=" . $campaign->id . " and call_action_end_date > created_at and TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and campaign_id and deleted=0 group by user_id) as temp")[0]->global_average);
      $returnedObject->houry_average_waiting_time = floor(CampaignWaitingTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date))/count(*) as cnt ")->whereRaw("end_date > created_at")->where("campaign_id", $campaign->id)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60")->first()->cnt);
      $returnedObject->houry_break_time = floor(CampaignBreakTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date)) as cnt ")->whereRaw("end_date > created_at")->where("campaign_id", $campaign->id)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60")->first()->cnt);
    }

    if ($request->input("part") == "employees") {
      $returnedObject->total_average_action_calls_time = floor(Call::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , call_action_end_date))/count(*) as cnt ")->whereRaw("call_action_end_date > created_at")->where("campaign_id", $campaign->id)->where("deleted", 0)->whereNotNull("call_action_end_date")->first()->cnt); // in seconds
      $returnedObject->total_average_regular_calls_time = floor(Call::selectRaw("sum(TIMESTAMPDIFF(SECOND,created_at , call_end_date ))/count(*) as cnt ")->whereRaw("call_end_date > created_at")->where("campaign_id", $campaign->id)->where("deleted", 0)->whereNotNull("call_end_date")->first()->cnt); // in seconds
      $returnedObject->total_average_calls_time = round(Call::selectRaw("count(*)/(sum(TIMESTAMPDIFF(SECOND, created_at , LEAST(call_action_end_date ,call_end_date)))/3600) as cnt ")->whereRaw("calls.deleted=0 and calls.campaign_id=" . $campaign->id . " and LEAST(call_action_end_date ,call_end_date)  > created_at")->first()->cnt);
      $returnedObject->total_average_waiting_time = floor(CampaignWaitingTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date))/count(*) as cnt ")->whereRaw("end_date > created_at")->where("campaign_id", $campaign->id)->first()->cnt);
      $returnedObject->total_break_time = floor(CampaignBreakTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date)) as cnt ")->whereRaw("end_date > created_at")->where("campaign_id", $campaign->id)->first()->cnt);


      $employeesArray = $this->getCampaignEmployees($key);
      $usersIDSArray =  $employeesArray->pluck('user_id')->toArray();

      $usersExtentionsHashArray = [];
      $userExtentions = UserExtensions::select('user_id', 'dialer_user_id')
        ->where('sip_server_id', $campaign->sip_server_id)
        ->whereIn('user_id', $usersIDSArray)
        ->get();

      //get hash array of extensions with sip data
      $connectedUserIdsArray = [];
      for ($i = 0; $i < sizeof($userExtentions); $i++) {

        $userDialerId = $userExtentions[$i]->dialer_user_id;
        $sipData = Redis::hgetAll('tm:sip_numbers:' . $userDialerId);
        //add user id to connected ids array
        if ($sipData && ($sipData['campaign_id'] == $campaign->id)) {
          $connectedUserIdsArray[] = $sipData['user_id'];
        }
        //create hash
        $usersExtentionsHashArray[$userExtentions[$i]->user_id] = [
          "dialer_user_id" => $userDialerId,
          "sip_data" => $sipData
        ];
      }

      $fields = [
        'user_id', 'first_name', 'last_name', 'phone_number',
        'voter_id', 'voters.key as voter_key', 'calls.created_at',
        DB::raw('TIMESTAMPDIFF(SECOND,calls.created_at,now() ) as duration')
      ];
      //get calls summary
      $callsArrays =  Call::select($fields)
        ->join('voters', 'voters.id', '=', 'calls.voter_id')
        ->where('calls.deleted', 0)
        ->whereIn('calls.user_id', $connectedUserIdsArray)
        ->where('calls.campaign_id', $campaign->id)
        ->where(function ($query) {
          $query->whereNull('call_end_date')->orWhereNull('call_action_end_date');
        })
        ->whereRaw("calls.created_at=(select max(c1.created_at) from calls c1 where c1.user_id=calls.user_id and c1.deleted=0 and c1.campaign_id=" . $campaign->id . " and (c1.call_end_date is null or c1.call_action_end_date is null))")
        //->orderBy('calls.created_at','DESC')
        ->groupBy('calls.user_id')
        ->get();
      $callsArrayHash = [];
      for ($i = 0; $i < count($callsArrays); $i++) {
        $item = $callsArrays[$i];
        $callsArrayHash[$item->user_id] = ["voter_id" => $item->voter_id, "voter_key" => $item->voter_key, "voter_name" => ($item->first_name . ' ' . $item->last_name), "phone_number" => $item->phone_number, "duration" => $item->duration];
      }
      //loop on employees
      foreach ($employeesArray as $i => $employee) {
        $employee->status_id = 0;
        if (array_key_exists($employee->user_id, $usersExtentionsHashArray)) {

          $voterData = null;
          if (array_key_exists($employee->user_id, $callsArrayHash)) {
            $voterData = $callsArrayHash[$employee->user_id];
          }
          if ($voterData && isset($voterData)) {
            $employee->voter_id = $voterData["voter_id"]; // voter who gets the call
            $employee->voter_key = $voterData["voter_key"];
            $employee->voter_name = $voterData["voter_name"];
            if ($voterData["phone_number"]) {
              $employee->phone_number = $voterData["phone_number"];
            }
          }

          $user_sip_number = $usersExtentionsHashArray[$employee->user_id]['dialer_user_id'];
          $tempUserID = null;
          $sipData = $usersExtentionsHashArray[$employee->user_id]['sip_data'];

          if ($sipData) {
            $tempUserID = $sipData['user_id'];
            $tempUserStatus = $sipData['status'];
            $tempUserCampaignID = $sipData['campaign_id'];
          } else {
            $tempUserCampaignID = null;
          }
          if ($tempUserCampaignID && ($tempUserID == $employee->user_id) && ($tempUserCampaignID == $campaign->id)) {
            switch ($tempUserStatus) {

              case "call":
                $employee->status_id = config('tmConstants.agent.callingStatus.CALL');
                $employee->user_sip_number = $user_sip_number;
                if ($voterData) {
                  $employee->state_duration_seconds = $voterData["duration"];
                }
                break;

              case "waiting":
                $employee->status_id = config('tmConstants.agent.callingStatus.WAITING');
                $waitingTimeObject = CampaignWaitingTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id', $employee->user_id)->where('campaign_id', $campaign->id)->orderBy('created_at', 'DESC')->first();
                if ($waitingTimeObject) {
                  $employee->state_duration_seconds = $waitingTimeObject->duration;
                }
                break;
              case "break":
                $employee->status_id = config('tmConstants.agent.callingStatus.BREAK');
                $breakTimeObject = CampaignBreakTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id', $employee->user_id)->where('campaign_id', $campaign->id)->orderBy('created_at', 'DESC')->first();
                if ($breakTimeObject) {
                  $employee->state_duration_seconds = $breakTimeObject->duration;
                }
                break;
            }
          }
          $employee->dialer_id = $usersExtentionsHashArray[$employee->user_id]['dialer_user_id'];
          $employees[$i] = $employee;
        }
      }
      $returnedObject->all_agents = $employeesArray;
    }
    $jsonOutput->setData($returnedObject);
    // $executionEndTime = microtime(true);

    // $seconds = $executionEndTime - $executionStartTime;
  }

  /**
   * Get calls(campaign) performance by campaign key
   *
   * @param string $key
   * @return void
   */
  public function getCallsPerformance(Request $request, $key)
  {


    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //get campaign with seleted fields
    $campaign = Campaign::select('id', 'name', 'team_id')->where('key', $key)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_DOESNT_EXIST'));
      return;
    }
    $returnedObject = new \stdClass;

    if ($request->input("part") == "portions") {
      $returnedObject->campaign_name = $campaign->name;
      $returnedObject->portions = VoterFilter::select('voter_filters.id', 'voter_filters.name', 'voter_filters.unique_voters_count')
        ->where('entity_type', 1)
        ->leftjoin('campaign_portion_progress', 'campaign_portion_progress.portion_id', '=', 'voter_filters.id')
        ->where('entity_id', $campaign->id)
        ->withCount(['answeredQuestsCallsCountTotal' => function ($query) use ($campaign) {
          $query
            ->whereRaw("voter_id in (select voter_id from voters_answers where voters_answers.call_id = calls.id and voters_answers.deleted=0 and answered=1 and campaign_id=" . $campaign->id . " )")
            ->where('calls.deleted', 0)
            ->where('calls.campaign_id', $campaign->id)
            ->whereIn('calls.call_end_status', [
              config('tmConstants.call.status.SUCCESS'),
              config('tmConstants.call.status.GOT_MARRIED'),
              config('tmConstants.call.status.CHANGED_ADDRESS'),
              config('tmConstants.call.status.NON_COOPERATIVE'),
            ]);
        }])

        ->with(['callLaterCallsToday' => function ($query) use ($campaign) {
          $query->where('redial_voter_phones.campaign_id', $campaign->id)
            ->selectRaw("redial_voter_phones.id,redial_voter_phones.portion_id,redial_voter_phones.status as call_end_status, count(*) as count_total")
            ->whereRaw('datediff(now(),redial_voter_phones.created_at)=0')
            ->groupBy("redial_voter_phones.portion_id", "redial_voter_phones.status", "redial_voter_phones.voter_id");
        }])

        ->with(['callLaterCallsLastHour' => function ($query) use ($campaign) {
          $query->where('redial_voter_phones.campaign_id', $campaign->id)
            ->selectRaw("redial_voter_phones.id,redial_voter_phones.portion_id,redial_voter_phones.status as call_end_status, count(*) as count_total")
            ->whereRaw('TIMESTAMPDIFF(MINUTE,redial_voter_phones.created_at , now())<=60')
            ->groupBy("redial_voter_phones.portion_id", "redial_voter_phones.status", "redial_voter_phones.voter_id");
        }])
        ->with(['callLaterCallsTotal' => function ($query) use ($campaign) {
          $query
            ->where('redial_voter_phones.campaign_id', $campaign->id)
            ->selectRaw("redial_voter_phones.id,redial_voter_phones.portion_id,redial_voter_phones.status as call_end_status, count(*) as count_total")
            ->groupBy("redial_voter_phones.portion_id", "redial_voter_phones.status", "redial_voter_phones.voter_id");
        }])
        ->with(['FinishedCallsTotal' => function ($query) use ($campaign) {
          $query
            ->where('calls.deleted', 0)
            ->where('calls.campaign_id', $campaign->id)
            ->whereIn('call_end_status', [
              config('tmConstants.call.status.SUCCESS'),
              config('tmConstants.call.status.GOT_MARRIED'),
              config('tmConstants.call.status.CHANGED_ADDRESS'),
              config('tmConstants.call.status.NON_COOPERATIVE'),
            ])
            ->whereRaw("calls.voter_id in (select voter_id from finished_voters_in_campaign where finished_voters_in_campaign.campaign_id=" . $campaign->id . " and finished_voters_in_campaign.voter_id=calls.voter_id)")

            ->selectRaw("calls.portion_id,call_end_status , count(*) as count_total , sum(TIMESTAMPDIFF(SECOND , calls.created_at ,  calls.call_action_end_date)) as handle_time_seconds")
            ->groupBy("calls.portion_id", "call_end_status");
        }])
        ->with(['FinishedCallsToday' => function ($query) use ($campaign) {
          $query
            ->where('calls.deleted', 0)
            ->where('calls.campaign_id', $campaign->id)
            ->whereIn('call_end_status', [
              config('tmConstants.call.status.SUCCESS'),
              config('tmConstants.call.status.GOT_MARRIED'),
              config('tmConstants.call.status.CHANGED_ADDRESS'),
              config('tmConstants.call.status.NON_COOPERATIVE'),
            ])
            ->whereRaw('datediff(now(),calls.created_at)=0')
            ->whereRaw("calls.voter_id in (select voter_id from finished_voters_in_campaign where finished_voters_in_campaign.campaign_id=" . $campaign->id . " and finished_voters_in_campaign.voter_id=calls.voter_id)")
            ->selectRaw("calls.id,calls.portion_id,call_end_status , count(*) as count_total")
            ->groupBy("calls.portion_id", "call_end_status");
        }])
        ->with(['FinishedCallsLastHour' => function ($query) use ($campaign) {
          $query
            ->where('calls.deleted', 0)
            ->where('calls.campaign_id', $campaign->id)
            ->whereIn('call_end_status', [
              config('tmConstants.call.status.SUCCESS'),
              config('tmConstants.call.status.GOT_MARRIED'),
              config('tmConstants.call.status.CHANGED_ADDRESS'),
              config('tmConstants.call.status.NON_COOPERATIVE'),
            ])

            ->whereRaw("calls.voter_id in (select voter_id from finished_voters_in_campaign where finished_voters_in_campaign.campaign_id=" . $campaign->id . " and finished_voters_in_campaign.voter_id=calls.voter_id)")
            ->groupBy("calls.portion_id", "call_end_status")
            ->selectRaw("calls.id,calls.portion_id,call_end_status , count(*) as count_total")
            ->whereRaw('TIMESTAMPDIFF(MINUTE,calls.created_at , now())<=60');
        }])

        ->get();


      $portionsWaitingUsersHashArray = [];
      $keys = Redis::keys('tm:campaigns:' . $campaign->id . ':waiting_phones:*');
      for ($i = 0; $i < sizeof($keys); $i++) {
        $tempArray = Redis::mget("" . $keys[$i]);
        if ($tempArray) {
          $tempJson = json_decode($tempArray[0]);
          if (isset($tempJson->portion_id)) {
            if (!array_key_exists($tempJson->portion_id, $portionsWaitingUsersHashArray)) {
              $portionsWaitingUsersHashArray[$tempJson->portion_id] = 0;
            }
            $portionsWaitingUsersHashArray[$tempJson->portion_id]++;
          }
        }
      }
      for ($i = 0; $i < sizeof($returnedObject->portions); $i++) {

        $returnedObject->portions[$i]->sent_to_dialer_count  = 0;

        $returnedObject->portions[$i]->languagesTotal = Call::selectRaw("language_id , languages.name , count(*) as count_total")
          ->where('calls.deleted', 0)
          ->where('calls.portion_id', $returnedObject->portions[$i]->id)

          ->join('finished_voters_in_campaign', function ($joinOn) use ($campaign) {
            $joinOn->on('finished_voters_in_campaign.voter_id', '=', 'calls.voter_id')
              ->where('finished_voters_in_campaign.campaign_id', '=', $campaign->id)
              ->where('finished_voters_in_campaign.status', '=', DB::raw(config('tmConstants.call.status.LANGUAGE')));
          })
          ->leftJoin('call_notes', 'call_notes.call_id', '=', 'calls.id')
          ->leftJoin('languages', function ($joinOn) {
            $joinOn->on('languages.id', '=', 'language_id')
              ->where('languages.deleted', 0);
          })
          ->whereNotNull('language_id')
          ->groupBy("language_id")
          ->get();



        $returnedObject->portions[$i]->languagesToday = Call::selectRaw("language_id , languages.name , count(*) as count_total")
          ->where('calls.deleted', 0)
          ->where('calls.portion_id', $returnedObject->portions[$i]->id)
          ->join('finished_voters_in_campaign', function ($joinOn) use ($campaign) {
            $joinOn->on('finished_voters_in_campaign.voter_id', '=', 'calls.voter_id')
              ->where('finished_voters_in_campaign.campaign_id', '=', $campaign->id)
              ->where('finished_voters_in_campaign.status', '=', DB::raw(config('tmConstants.call.status.LANGUAGE')));
          })
          ->leftJoin('call_notes', 'call_notes.call_id', '=', 'calls.id')
          ->leftJoin('languages', function ($joinOn) {
            $joinOn->on('languages.id', '=', 'language_id')
              ->where('languages.deleted', 0);
          })
          ->whereNotNull('language_id')
          ->whereRaw("datediff(calls.created_at , now()) = 0")
          ->groupBy("language_id")
          ->get();

        $returnedObject->portions[$i]->languagesLastHour = Call::selectRaw("language_id , languages.name , count(*) as count_total")
          ->where('calls.deleted', 0)
          ->where('calls.portion_id', $returnedObject->portions[$i]->id)
          ->join('finished_voters_in_campaign', function ($joinOn) use ($campaign) {
            $joinOn->on('finished_voters_in_campaign.voter_id', '=', 'calls.voter_id')
              ->where('finished_voters_in_campaign.campaign_id', '=', $campaign->id)
              ->where('finished_voters_in_campaign.status', '=', DB::raw(config('tmConstants.call.status.LANGUAGE')));
          })
          ->leftJoin('call_notes', 'call_notes.call_id', '=', 'calls.id')
          ->leftJoin('languages', function ($joinOn) {
            $joinOn->on('languages.id', '=', 'language_id')
              ->where('languages.deleted', 0);
          })
          ->whereRaw("TIMESTAMPDIFF(MINUTE,calls.created_at , now())<=60 ")
          ->whereNotNull('language_id')
          ->groupBy("language_id")
          ->get();


        $returnedObject->portions[$i]->outOfQueueCallsTotal = DB::select("select
                                        portion_id ,
                                        call_end_status ,
                                        count(*) as count_total
                                      from
                                          (
                                            SELECT
                                              portion_id ,
                                              status as call_end_status ,
                                              calls.voter_id
                                            FROM
                                              `calls` inner join finished_voters_in_campaign on (calls.voter_id = finished_voters_in_campaign.voter_id and calls.campaign_id = finished_voters_in_campaign.campaign_id)
                                            WHERE
                                              deleted=0  and
                                              calls.campaign_id=" . $campaign->id . " and
                                              portion_id=" . $returnedObject->portions[$i]->id . " and
                                              status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")   and
                                              call_end_status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")
                                            group by
                                              status , calls.voter_id
                                          ) as temp
                                      group by   call_end_status");

        $returnedObject->portions[$i]->outOfQueueCallsToday = DB::select("select
                                        portion_id ,
                                        call_end_status ,
                                        count(*) as count_total
                                      from
                                          (
                                            SELECT
                                              portion_id ,
                                              status as call_end_status ,
                                              calls.voter_id
                                            FROM
                                              `calls` inner join finished_voters_in_campaign on (calls.voter_id = finished_voters_in_campaign.voter_id and calls.campaign_id = finished_voters_in_campaign.campaign_id)
                                            WHERE
                                              deleted=0  and
                                              calls.campaign_id=" . $campaign->id . " and
                                              datediff(now(),calls.created_at)=0 and
                                              portion_id=" . $returnedObject->portions[$i]->id . " and
                                              status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")   and
                                              call_end_status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")
                                            group by
                                              status , calls.voter_id
                                          ) as temp
                                      group by   call_end_status");

        $returnedObject->portions[$i]->outOfQueueCallsLastHour = DB::select("select
                                        portion_id ,
                                        call_end_status ,
                                        count(*) as count_total
                                      from
                                          (
                                            SELECT
                                              portion_id ,
                                              status as call_end_status ,
                                              calls.voter_id
                                            FROM
                                              `calls` inner join finished_voters_in_campaign on (calls.voter_id = finished_voters_in_campaign.voter_id and calls.campaign_id = finished_voters_in_campaign.campaign_id)
                                            WHERE
                                              deleted=0  and
                                              calls.campaign_id=" . $campaign->id . " and
                                              TIMESTAMPDIFF(MINUTE,calls.created_at , now())<=60 and
                                              datediff(now(),calls.created_at)=0 and
                                              portion_id=" . $returnedObject->portions[$i]->id . " and
                                              status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")   and
                                              call_end_status in (" . config('tmConstants.call.status.WRONG_NUMBER') . "," .
          config('tmConstants.call.status.FAX_TONE') . "," .
          config('tmConstants.call.status.ANSWERING_MACHINE') . "," .
          config('tmConstants.call.status.DISCONNECTED_NUMBER') . "," .
          config('tmConstants.call.status.LANGUAGE') . "," .
          config('tmConstants.call.status.BUSY') . "," .
          config('tmConstants.call.status.HANGED_UP') . "," .
          config('tmConstants.call.status.UNANSWERED') . ")
                                            group by
                                              status , calls.voter_id
                                          ) as temp
                                      group by   call_end_status");

        $returnedObject->portions[$i]->answeredQuestsCallsCountToday = Call::where('calls.portion_id', $returnedObject->portions[$i]->id)
          ->where('calls.campaign_id', $campaign->id)
          ->whereIn('calls.call_end_status', [
            config('tmConstants.call.status.SUCCESS'),
            config('tmConstants.call.status.GOT_MARRIED'),
            config('tmConstants.call.status.CHANGED_ADDRESS'),
            config('tmConstants.call.status.NON_COOPERATIVE'),
          ])

          ->join('voters_answers', 'voters_answers.call_id', '=', 'calls.id')
          ->where('voters_answers.deleted', 0)
          ->where('voters_answers.answered', 1)
          ->whereRaw("DATEDIFF(voters_answers.created_at,now() )  = 0")
          ->where('calls.campaign_id', $campaign->id)
          ->selectRaw('count(distinct(voters_answers.voter_id)) as cnt')
          ->first()->cnt;

        $returnedObject->portions[$i]->answeredQuestsCallsCountHour = Call::where('calls.portion_id', $returnedObject->portions[$i]->id)
          ->where('calls.campaign_id', $campaign->id)
          ->whereIn('calls.call_end_status', [
            config('tmConstants.call.status.SUCCESS'),
            config('tmConstants.call.status.GOT_MARRIED'),
            config('tmConstants.call.status.CHANGED_ADDRESS'),
            config('tmConstants.call.status.NON_COOPERATIVE'),
          ])
          ->join('voters_answers', 'voters_answers.call_id', '=', 'calls.id')
          ->where('voters_answers.deleted', 0)
          ->where('voters_answers.answered', 1)
          ->whereRaw("TIMESTAMPDIFF(MINUTE,voters_answers.created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,voters_answers.created_at,now() ) >= 0")
          ->selectRaw('count(distinct(voters_answers.voter_id)) as cnt')
          ->first()->cnt;

        $returnedObject->portions[$i]->answeredQuestsCallsCountHandleTime = Call::where('calls.portion_id', $returnedObject->portions[$i]->id)
          ->where('calls.campaign_id', $campaign->id)
          ->whereIn('calls.call_end_status', [
            config('tmConstants.call.status.SUCCESS'),
            config('tmConstants.call.status.GOT_MARRIED'),
            config('tmConstants.call.status.CHANGED_ADDRESS'),
            config('tmConstants.call.status.NON_COOPERATIVE'),
          ])
          ->whereRaw("calls.id in (select call_id from voters_answers where voters_answers.deleted=0 and voters_answers.voter_id=calls.voter_id and voters_answers.answered=1)")
          //->join('voters_answers','voters_answers.call_id','=','calls.id')
          //->where('voters_answers.deleted',0)
          ->where('calls.deleted', 0)
          ->whereRaw('calls.created_at <   calls.call_action_end_date')
          ->selectRaw("portion_id , sum(TIMESTAMPDIFF(SECOND , calls.created_at ,  calls.call_action_end_date)) as handle_time_seconds")
          ->first();

        if ($returnedObject->portions[$i]->answeredQuestsCallsCountHandleTime) {
          $returnedObject->portions[$i]->answeredQuestsCallsCountHandleTime =  $returnedObject->portions[$i]->answeredQuestsCallsCountHandleTime->handle_time_seconds;
        }

        if (array_key_exists($returnedObject->portions[$i]->id, $portionsWaitingUsersHashArray)) {
          $returnedObject->portions[$i]["sent_to_dialer_count"] = $portionsWaitingUsersHashArray[$returnedObject->portions[$i]->id];
        }
      }
    }

    if ($request->input("part") == "stats") {

      $generalCallsStats = [];

      $keys = Redis::keys('tm:campaigns:' . $campaign->id . ':waiting_phones:*');

      $allCallsStats = new \StdClass;
      $answersQuestionsCallsStats = new \StdClass;


      $allCallsStats->per_15_minutes = Call::where('deleted', 0)->where("campaign_id", $campaign->id)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 15 and TIMESTAMPDIFF(MINUTE,created_at,now() ) >= 0")->count();
      $allCallsStats->per_hour = Call::where('deleted', 0)->where("campaign_id", $campaign->id)->whereRaw("TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,created_at,now() ) >= 0")->count();
      $allCallsStats->per_today = Call::where('deleted', 0)->where("campaign_id", $campaign->id)->whereRaw("DATEDIFF(created_at,now() )  = 0")->count();
      $allCallsStats->per_campaign = floor(Call::selectRaw("(count(*) /(sum(TIMESTAMPDIFF(SECOND, created_at , call_end_date))/3600)) as avg")->where('deleted', 0)->whereRaw('call_end_date > created_at')->where("campaign_id", $campaign->id)->first()->avg);

      $answersQuestionsCallsStats->per_15_minutes = Call::where('calls.deleted', 0)->where("calls.campaign_id", $campaign->id)
        ->whereRaw("TIMESTAMPDIFF(MINUTE,calls.created_at,now() )  <= 15 and TIMESTAMPDIFF(MINUTE,calls.created_at,now() ) >= 0")
        ->join('voters_answers', function ($joinOn) {
          $joinOn->on('voters_answers.voter_id', '=', 'calls.voter_id')
            ->on('voters_answers.call_id', '=', 'calls.id');
        })
        ->join('questions', 'questions.id', '=', 'voters_answers.question_id')
        ->join('questionnaires', 'questionnaires.id', '=', 'questions.questionnaire_id')
        ->where('voters_answers.deleted', 0)
        ->where('questions.deleted', 0)
        ->where('questionnaires.deleted', 0)
        ->where('questionnaires.campaign_id', $campaign->id)
        ->where("calls.campaign_id", $campaign->id)
        ->count();
      $answersQuestionsCallsStats->per_hour = Call::where('calls.deleted', 0)->where("calls.campaign_id", $campaign->id)
        ->whereRaw("TIMESTAMPDIFF(MINUTE,calls.created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,calls.created_at,now() ) >= 0")
        ->join('voters_answers', function ($joinOn) {
          $joinOn->on('voters_answers.voter_id', '=', 'calls.voter_id')
            ->on('voters_answers.call_id', '=', 'calls.id');
        })
        ->join('questions', 'questions.id', '=', 'voters_answers.question_id')
        ->join('questionnaires', 'questionnaires.id', '=', 'questions.questionnaire_id')
        ->where('voters_answers.deleted', 0)
        ->where('questions.deleted', 0)
        ->where('questionnaires.deleted', 0)
        ->where('questionnaires.campaign_id', $campaign->id)
        ->where("calls.campaign_id", $campaign->id)
        ->count();
      $answersQuestionsCallsStats->per_today = Call::where('calls.deleted', 0)->where("calls.campaign_id", $campaign->id)->whereRaw("DATEDIFF(calls.created_at,now() )  = 0")
        ->join('voters_answers', function ($joinOn) {
          $joinOn->on('voters_answers.voter_id', '=', 'calls.voter_id')
            ->on('voters_answers.call_id', '=', 'calls.id');
        })
        ->join('questions', 'questions.id', '=', 'voters_answers.question_id')
        ->join('questionnaires', 'questionnaires.id', '=', 'questions.questionnaire_id')
        ->where('voters_answers.deleted', 0)
        ->where('questions.deleted', 0)
        ->where('questionnaires.deleted', 0)
        ->where('questionnaires.campaign_id', $campaign->id)
        ->where("calls.campaign_id", $campaign->id)
        ->count();
      $answersQuestionsCallsStats->per_campaign = floor(Call::selectRaw("(count(*) /(sum(TIMESTAMPDIFF(SECOND, calls.created_at , calls.call_end_date))/3600)) as avg")
        ->join('voters_answers', function ($joinOn) {
          $joinOn->on('voters_answers.voter_id', '=', 'calls.voter_id')
            ->on('voters_answers.call_id', '=', 'calls.id');
        })
        ->join('questions', 'questions.id', '=', 'voters_answers.question_id')
        ->join('questionnaires', 'questionnaires.id', '=', 'questions.questionnaire_id')
        ->where('calls.deleted', 0)->whereRaw('calls.call_end_date > calls.created_at')
        ->where('voters_answers.deleted', 0)
        ->where('questions.deleted', 0)
        ->where('questionnaires.deleted', 0)
        ->where('questionnaires.campaign_id', $campaign->id)
        ->where("calls.campaign_id", $campaign->id)->first()->avg);

      array_push($generalCallsStats, $allCallsStats);
      array_push($generalCallsStats, $answersQuestionsCallsStats);
      $returnedObject->general_calls_stats = $generalCallsStats;
    }

    if ($request->input("part") == "avgs") {
      $averageCallsStats = [];
      $allAverageCallsStats = new \StdClass;
      $averageAnswersQuestionsCallsStats = new \StdClass;

      $dbQuery = DB::select("select avg(cnt) as avg_num   from (SELECT day(created_at) , month(created_at) , year(created_at) , count(*) as cnt   FROM `calls` WHERE deleted=0 and campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   <= 15  and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   >=0
                   group by  day(created_at) , month(created_at) , year(created_at)) as temp
                   union
                   select avg(cnt) as avg_num    from (SELECT day(created_at) , month(created_at) , year(created_at) , count(*) as cnt   FROM `calls` WHERE deleted=0 and campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   <= 60  and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   >=0
                   group by  day(created_at) , month(created_at) , year(created_at)) as temp
                   union
                   select avg(cnt) as avg_num    from (SELECT day(created_at) , month(created_at) , year(created_at) , count(*) as cnt   FROM `calls` WHERE deleted=0 and campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   <= 1440  and ((60*hour(now())+minute(now())) - 60*hour(created_at)-minute(created_at))   >=0
                   group by  day(created_at) , month(created_at) , year(created_at)) as temp");

      if (count($dbQuery) == 3) {
        $allAverageCallsStats->per_15_minutes =  round($dbQuery[0]->avg_num);
        $allAverageCallsStats->per_hour =  round($dbQuery[1]->avg_num);
        $allAverageCallsStats->per_today =  round($dbQuery[2]->avg_num);
      } else {
        $allAverageCallsStats->per_15_minutes = 0;
        $allAverageCallsStats->per_hour = 0;
        $allAverageCallsStats->per_today = 0;
      }

      $dbQuery = DB::select("select avg(cnt) as avg_num   from (SELECT day(calls.created_at) , month(calls.created_at) , year(calls.created_at) , count(*) as cnt   FROM `calls`  inner join voters_answers on(calls.id=voters_answers.call_id and calls.voter_id=voters_answers.voter_id and voters_answers.deleted=0 and voters_answers.answered=1)  WHERE calls.deleted=0 and calls.campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   <= 15  and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   >=0
                   group by  day(calls.created_at) , month(calls.created_at) , year(calls.created_at)) as temp
                   union
                   select avg(cnt) as avg_num    from (SELECT day(calls.created_at) , month(calls.created_at) , year(calls.created_at) , count(*) as cnt   FROM `calls`  inner join voters_answers on(calls.id=voters_answers.call_id and calls.voter_id=voters_answers.voter_id and voters_answers.deleted=0 and voters_answers.answered=1)  WHERE calls.deleted=0 and calls.campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   <= 60  and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   >=0
                   group by  day(calls.created_at) , month(calls.created_at) , year(calls.created_at)) as temp
                   union
                   select avg(cnt) as avg_num    from (SELECT day(calls.created_at) , month(calls.created_at) , year(calls.created_at) , count(*) as cnt   FROM `calls`  inner join voters_answers on(calls.id=voters_answers.call_id and calls.voter_id=voters_answers.voter_id and voters_answers.deleted=0 and voters_answers.answered=1)  WHERE calls.deleted=0 and calls.campaign_id=" . $campaign->id . " and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   <= 1440  and ((60*hour(now())+minute(now())) - 60*hour(calls.created_at)-minute(calls.created_at))   >=0
                   group by  day(calls.created_at) , month(calls.created_at) , year(calls.created_at)) as temp");
      if (count($dbQuery) == 3) {
        $averageAnswersQuestionsCallsStats->per_15_minutes =  round($dbQuery[0]->avg_num);
        $averageAnswersQuestionsCallsStats->per_hour =  round($dbQuery[1]->avg_num);
        $averageAnswersQuestionsCallsStats->per_today =  round($dbQuery[2]->avg_num);
      } else {
        $averageAnswersQuestionsCallsStats->per_15_minutes = 0;
        $averageAnswersQuestionsCallsStats->per_hour = 0;
        $averageAnswersQuestionsCallsStats->per_today = 0;
      }
      $returnedObject->hours_running_today = Call::selectRaw("((hour(now())*60 + minute(now())) -  (hour(created_at)*60 + minute(created_at)))/60 as hours_running_today")->where("campaign_id", $campaign->id)->whereRaw("datediff(now() , created_at) = 0")->orderBy("created_at", "asc")->first();
      if ($returnedObject->hours_running_today) {
        $returnedObject->hours_running_today = $returnedObject->hours_running_today->hours_running_today;
      } else {
        $returnedObject->hours_running_today = 0;
      }
      array_push($averageCallsStats, $allAverageCallsStats);
      array_push($averageCallsStats, $averageAnswersQuestionsCallsStats);
      $returnedObject->average_calls_stats = $averageCallsStats;
    }

    if ($request->input("part") == "comparison") {
      $returnedObject->todays_start_time = DB::select("SELECT  created_at from`calls` where deleted=0 and campaign_id=" . $campaign->id . " and datediff(created_at , now())=0
       order by created_at asc
      limit 1");
      if ($returnedObject->todays_start_time) {
        $returnedObject->todays_start_time = $returnedObject->todays_start_time[0];
        if ($returnedObject->todays_start_time) {
          $returnedObject->todays_start_time = $returnedObject->todays_start_time->created_at;
        } else {
          $returnedObject->todays_start_time = null;
        }
        if ($returnedObject->todays_start_time) {
          $todaysComparisonStats = [];
          $todaysAllComparisonStats = new \StdClass;
          $todaysAnsweredComparisonStats = new \StdClass;

          $todaysAllComparisonStats->todays_15mins_stats = DB::select("SELECT
                                  FLOOR((hour(now())*60+minute(now()) - hour(created_at)*60 - minute(created_at))/15 ) as mins15interval ,
                                  count(*) as calls_count
                                 FROM
                                  `calls`
                                 WHERE
                                  deleted=0 and
                                  campaign_id=" . $campaign->id . " and
                                  datediff(created_at , now())=0
                                 GROUP BY mins15interval
                                 ORDER BY created_at ASC");
          $todaysAllComparisonStats->average_15mins_stats = DB::select("SELECT
                                        rel_date ,
                                        round(avg(IFNULL(count_all_calls,0))) as avg_previous
                                        FROM
                                        (
                                          SELECT
                                            full_date ,
                                            rel_date ,
                                            sum(total_count) as count_all_calls
                                          FROM
                                          (
                                            SELECT
                                              concat(year(created_at) , '-',month(created_at) , '-' , day(created_at)) as full_date  ,
                                              hour(created_at) as hour_data , minute(created_at) as minute_data ,
                                              FLOOR(60*hour(created_at) + minute(created_at)) as real_minutes ,
                                              FLOOR(TIMESTAMPDIFF(MINUTE  , created_at , CONCAT(concat(year(created_at) , '-',month(created_at) , '-' , day(created_at)) , ' ' , hour(now()) , ':' , minute(now()) , ':' , second(now())) )/15) as rel_date , count(*) as total_count
                                            FROM
                                              calls
                                            WHERE
                                              deleted=0 and
                                              campaign_id=" . $campaign->id . " and
                                              datediff(created_at , now()) <> 0 and
                                              hour(created_at) >= hour('" . $returnedObject->todays_start_time . "') and minute(created_at) >= minute('" . $returnedObject->todays_start_time . "')
                                            GROUP BY
                                              full_date,
                                              hour_data ,
                                              minute_data
                                            ORDER BY
                                              year(created_at) desc,
                                              month(created_at) desc ,
                                              day(created_at) desc ,
                                              hour(created_at) asc ,
                                              minute(created_at) asc
                                          ) AS inner_temp
                                          WHERE
                                            rel_date >= 0
                                          GROUP BY
                                            full_date ,
                                            rel_date
                                          ORDER BY
                                            full_date desc
                                        ) as outer_temp
                                        GROUP BY

                                          rel_date desc");
          $todaysAnsweredComparisonStats->todays_15mins_stats = DB::select("SELECT
                                  FLOOR((hour(now())*60+minute(now()) - hour(calls.created_at)*60 - minute(calls.created_at))/15 ) as mins15interval ,
                                  count(*) as calls_count
                                 FROM
                                  `calls`
                                 WHERE
                                  calls.deleted=0 and
                                  calls.campaign_id=" . $campaign->id . " and
                                  datediff(calls.created_at , now())=0
                                  and calls.id in (select call_id from voters_answers where voters_answers.call_id = calls.id and voters_answers.voter_id=calls.voter_id and voters_answers.deleted=0 and voters_answers.answered=1)
                                 GROUP BY mins15interval
                                 ORDER BY calls.created_at ASC");
          $todaysAnsweredComparisonStats->average_15mins_stats = DB::select("SELECT
                                        rel_date ,
                                        round(avg(IFNULL(count_all_calls,0))) as avg_previous
                                        FROM
                                        (
                                          SELECT
                                            full_date ,
                                            rel_date ,
                                            sum(total_count) as count_all_calls
                                          FROM
                                          (
                                            SELECT
                                              concat(year(created_at) , '-',month(created_at) , '-' , day(created_at)) as full_date  ,
                                              hour(created_at) as hour_data , minute(created_at) as minute_data ,
                                              FLOOR(60*hour(created_at) + minute(created_at)) as real_minutes ,
                                              FLOOR(TIMESTAMPDIFF(MINUTE  , created_at , CONCAT(concat(year(created_at) , '-',month(created_at) , '-' , day(created_at)) , ' ' , hour(now()) , ':' , minute(now()) , ':' , second(now())) )/15) as rel_date , count(*) as total_count
                                            FROM
                                              calls
                                            WHERE
                                              deleted=0 and
                                              campaign_id=" . $campaign->id . "
                                              and calls.id in (select call_id from voters_answers where voters_answers.call_id = calls.id and voters_answers.voter_id=calls.voter_id and voters_answers.deleted=0 and voters_answers.answered=1)
                                              and datediff(created_at , now()) <> 0 and
                                              hour(created_at) >= hour('" . $returnedObject->todays_start_time . "') and minute(created_at) >= minute('" . $returnedObject->todays_start_time . "')
                                            GROUP BY
                                              full_date,
                                              hour_data ,
                                              minute_data
                                            ORDER BY
                                              year(created_at) desc,
                                              month(created_at) desc ,
                                              day(created_at) desc ,
                                              hour(created_at) asc ,
                                              minute(created_at) asc
                                          ) AS inner_temp
                                          WHERE
                                            rel_date >= 0
                                          GROUP BY
                                            full_date ,
                                            rel_date
                                          ORDER BY
                                            full_date desc
                                        ) as outer_temp
                                        GROUP BY

                                          rel_date desc");
          array_push($todaysComparisonStats, $todaysAllComparisonStats);
          array_push($todaysComparisonStats, $todaysAnsweredComparisonStats);
          $returnedObject->todays_comparison_stats = $todaysComparisonStats;
        } else {
          $returnedObject->todays_comparison_stats = null;
        }
      } else {
        $returnedObject->todays_comparison_stats = null;
      }
    }

    $jsonOutput->setData($returnedObject);
  }



  /**
   * Get agents work stats by campaign key
   *
   * @param string $key
   * @return void
   */
  public function getAgentsWork(Request $request, $key)
  {
    $executionStartTime = microtime(true);
    $jsonOutput = app()->make("JsonOutput");

    $currentPage = $request->input('current_page', 1);
    $up2Page = false;
    if ($request->input('up_to_page') == 'true') {
      $up2Page = true;
    }

    if ($up2Page) {
      $skip = 0;
      $limit = $currentPage * config('tmConstants.MAX_RECORDS_FROM_DB');
    } else {
      $skip = ($currentPage - 1) * config('tmConstants.MAX_RECORDS_FROM_DB');
      $limit = config('tmConstants.MAX_RECORDS_FROM_DB');
    }


    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $all_campaigns = false;
    if ($request->input("all_campaigns") == '1') {
      $all_campaigns = true;
    }

    //get campaign with seleted fields
    $campaign = Campaign::select('id', 'name', 'team_id', 'sip_server_id')->where('key', $key)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_DOESNT_EXIST'));
      return;
    }
    $campaignID = $campaign->id;

    $returnedObject = new \stdClass;
    $returnedObject->campaign_name = $campaign->name;

    $usersExtentionsHashArray = [];
    if ($all_campaigns) {
      $totalCampaignsUsers =   User::withUsersInCampaigns()->groupBy('users.id')->pluck('users.id');
      $userExtentions = UserExtensions::select('user_id', 'dialer_user_id')
        ->whereIn('user_id', $totalCampaignsUsers)
        ->groupBy('user_id')
        ->get();
    } else {
      $totalCampaignsUsers =   Campaign::where('campaigns.key', $key)
        ->with(['users' => function ($query) {
          $query->groupBy('users.id');
        }])->first()['users']->pluck('id');
      $userExtentions = UserExtensions::select('user_id', 'dialer_user_id')
        ->where('sip_server_id', $campaign->sip_server_id)
        ->whereIn('user_id', $totalCampaignsUsers)
        ->get();
    }



    for ($i = 0; $i < sizeof($userExtentions); $i++) {
      $usersExtentionsHashArray[$userExtentions[$i]->user_id] =  $userExtentions[$i]->dialer_user_id;
    }




    $onlineUsersArrayIDS = [];
    $callingIDSArray = [];
    $waitingIDSArray = [];
    $breakingIDSArray = [];
    $allOnlineEmployees = [];
    $load_connected_only = $request->input("load_connected_only");
    if ($load_connected_only == '1') {
      foreach ($totalCampaignsUsers as $uid) {
        if (array_key_exists($uid, $usersExtentionsHashArray)) {

          $tempUserID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$uid], "user_id");
          $tempUserStatus = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$uid], "status");
          $tempUserCampaignID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$uid], "campaign_id");

          if ($tempUserID == $uid) {
            switch ($tempUserStatus) {
              case "call":
                if ($tempUserCampaignID == $campaign->id) {
                  array_push($callingIDSArray, $uid);
                }
                break;
              case "waiting":
                array_push($waitingIDSArray, $uid);
                break;
              case "break":
                array_push($breakingIDSArray, $uid);
                break;
            }
          }
        }
      }
      $allOnlineEmployees = array_merge($callingIDSArray, $waitingIDSArray, $breakingIDSArray);
      $returnedObject->total_count  = Campaign::where('campaigns.key', $key)
        ->with(['users' => function ($query) use ($campaignID, $load_connected_only, $allOnlineEmployees) {
          $query->whereIn('users.id', $allOnlineEmployees)->groupBy('users.id');
        }])->first()['users']->count();
    } else {
      $returnedObject->total_count = $totalCampaignsUsers->count();
    }


    if ($all_campaigns) {

      $votersArray = User::withUsersInCampaigns();
      if ($load_connected_only == '1') {

        $votersArray = $votersArray->whereIn('users.id', $allOnlineEmployees);
      }
      $votersArray = $votersArray->select(
        'users.id as id',
        'users.id as user_id',
        'employee_voter.first_name',
        'employee_voter.last_name',
        'users.active',
        DB::raw("CONCAT(first_name,' ',last_name) as full_name"),
        'users.key'
      )
        ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,call_action_end_date)) from calls where calls.deleted=0 and calls.campaign_id=users_in_campaigns.campaign_id and call_action_end_date >= created_at and user_id=users.id) as total_action_calls_time")
        ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,call_end_date)) from calls where calls.deleted=0 and calls.campaign_id=users_in_campaigns.campaign_id and call_end_date >= created_at and user_id=users.id) as total_regular_calls_time")
        ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,end_date)) from campaign_break_times where campaign_break_times.campaign_id=users_in_campaigns.campaign_id and end_date >= created_at and user_id=users.id) as total_break_time")
        ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,end_date)) from campaign_waiting_times where campaign_waiting_times.campaign_id=users_in_campaigns.campaign_id and end_date >= created_at and user_id=users.id) as total_waiting_time")
        ->selectRaw("(select count(*) from calls where calls.campaign_id=users_in_campaigns.campaign_id and user_id=users.id and TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,created_at,now() )  >=0 ) as total_calls_last_hour")
        ->selectRaw("(select count(*)/24 from calls where calls.campaign_id=users_in_campaigns.campaign_id and user_id=users.id and DATEDIFF(calls.created_at,now() )  = 0 ) as calls_per_hour_today")
        ->selectRaw("(select count(*) from calls where calls.campaign_id=users_in_campaigns.campaign_id and user_id=users.id and TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,created_at,now() )  >=0 and calls.id in (select call_id from voters_answers where call_id=calls.id and voters_answers.deleted=0 and answered=1)  ) as quests_answered_last_hour")
        ->selectRaw("(select count(*)/24 from calls where calls.campaign_id=users_in_campaigns.campaign_id and user_id=users.id and DATEDIFF(calls.created_at,now() )  = 0 and calls.id in (select call_id from voters_answers where call_id=calls.id and voters_answers.deleted=0 and answered=1)  ) as quests_answered_today_per_hour")
        ->selectRaw("(select TIMESTAMPDIFF(SECOND,created_at,now() ) from campaign_break_times where campaign_break_times.campaign_id=users_in_campaigns.campaign_id  and user_id=users.id order by created_at DESC limit 1) as current_break_state_duration")
        ->selectRaw("(select TIMESTAMPDIFF(SECOND,created_at,now() ) from campaign_waiting_times where campaign_waiting_times.campaign_id=users_in_campaigns.campaign_id and user_id=users.id order by created_at DESC limit 1) as current_waiting_state_duration ")
        ->with(['currentCallingVoter' => function ($query1) use ($campaignID) {
          $query1->selectRaw('calls.id ,calls.user_id ,first_name ,last_name , personal_identity,phone_number , TIMESTAMPDIFF(SECOND,calls.created_at,now() ) as duration')
            ->join('voters', 'voters.id', '=', 'calls.voter_id')
            ->where('deleted', 0)
            //->whereRaw('calls.campaign_id',$campaignID )
            ->where(function ($query2) {
              $query2->whereNull('call_end_date')->orWhereNull('call_action_end_date');
            })
            ->orderBy('calls.created_at', 'DESC');
        }]);

      $votersArray = $votersArray->join('voters as employee_voter', 'users.voter_id', '=', 'employee_voter.id')


        ->where('users.deleted', 0)
        ->where('users_in_campaigns.deleted', 0)
        ->groupBy('users.id');
      if ($request->input("export") != "print") {
        $votersArray = $votersArray->skip($skip)->limit($limit);
      }
      $votersArray =  $votersArray->get();
    } else {
      $campaignQuery = Campaign::where('campaigns.key', $key)
        ->with(['users' => function ($query) use ($skip, $limit, $campaignID, $load_connected_only, $allOnlineEmployees, $request) {
          $query->select(
            'users.id as id',
            'users.id as user_id',
            'employee_voter.first_name',
            'employee_voter.last_name',
            'users.active',
            DB::raw("CONCAT(first_name,' ',last_name) as full_name"),
            'users.key'
          );
          if ($load_connected_only == '1') {
            $query->whereIn('users.id', $allOnlineEmployees);
          }
          $query->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,call_action_end_date)) from calls where calls.deleted=0 and calls.campaign_id=" . $campaignID . " and call_action_end_date >= created_at and user_id=users.id) as total_action_calls_time")
            ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,call_end_date)) from calls where calls.deleted=0 and calls.campaign_id=" . $campaignID . " and call_end_date >= created_at and user_id=users.id) as total_regular_calls_time")
            ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,end_date)) from campaign_break_times where campaign_break_times.campaign_id=" . $campaignID . " and end_date >= created_at and user_id=users.id) as total_break_time")
            ->selectRaw("(select sum(TIMESTAMPDIFF(SECOND, created_at ,end_date)) from campaign_waiting_times where campaign_waiting_times.campaign_id=" . $campaignID . " and end_date >= created_at and user_id=users.id) as total_waiting_time")
            ->selectRaw("(select count(*) from calls where calls.campaign_id=" . $campaignID . " and user_id=users.id and TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,created_at,now() )  >=0 ) as total_calls_last_hour")
            ->selectRaw("(select count(*)/24 from calls where calls.campaign_id=" . $campaignID . " and user_id=users.id and DATEDIFF(calls.created_at,now() )  = 0 ) as calls_per_hour_today")
            ->selectRaw("(select count(*) from calls where calls.campaign_id=" . $campaignID . " and user_id=users.id and TIMESTAMPDIFF(MINUTE,created_at,now() )  <= 60 and TIMESTAMPDIFF(MINUTE,created_at,now() )  >=0 and calls.id in (select call_id from voters_answers where call_id=calls.id and voters_answers.deleted=0 and answered=1)  ) as quests_answered_last_hour")
            ->selectRaw("(select count(*)/24 from calls where calls.campaign_id=" . $campaignID . " and user_id=users.id and DATEDIFF(calls.created_at,now() )  = 0 and calls.id in (select call_id from voters_answers where call_id=calls.id and voters_answers.deleted=0 and answered=1)  ) as quests_answered_today_per_hour")
            ->selectRaw("(select TIMESTAMPDIFF(SECOND,created_at,now() ) from campaign_break_times where campaign_break_times.campaign_id=" . $campaignID . "  and user_id=users.id order by created_at DESC limit 1) as current_break_state_duration")
            ->selectRaw("(select TIMESTAMPDIFF(SECOND,created_at,now() ) from campaign_waiting_times where campaign_waiting_times.campaign_id=" . $campaignID . " and user_id=users.id order by created_at DESC limit 1) as current_waiting_state_duration ")
            ->with(['currentCallingVoter' => function ($query1) use ($campaignID) {
              $query1->selectRaw('calls.id ,calls.user_id ,first_name ,last_name , personal_identity,phone_number , TIMESTAMPDIFF(SECOND,calls.created_at,now() ) as duration')
                ->join('voters', 'voters.id', '=', 'calls.voter_id')
                ->where('deleted', 0)
                ->where('campaign_id', $campaignID)
                ->where(function ($query2) {
                  $query2->whereNull('call_end_date')->orWhereNull('call_action_end_date');
                })
                ->orderBy('calls.created_at', 'DESC');
            }])
            ->join('voters as employee_voter', 'users.voter_id', '=', 'employee_voter.id')
            ->groupBy('users.id');
          if ($request->input("export") != "print") {
            $query = $query->skip($skip)->limit($limit);
          }
        }]);
      $votersArray = $campaignQuery->first()['users']->makeHidden('pivot');
    }

    for ($i = 0; $i < sizeof($votersArray); $i++) {

      if (array_key_exists($votersArray[$i]->user_id, $usersExtentionsHashArray)) {

        $voterData =  $votersArray[$i]->currentCallingVoter;
        if ($voterData) {

          $votersArray[$i]->voter_name = $voterData->first_name . ' ' . $voterData->last_name;
          $votersArray[$i]->personal_identity = $voterData->personal_identity;

          if ($voterData->phone_number) {
            $votersArray[$i]->phone_number = $voterData->phone_number;
          }
        }
        $votersArray[$i]->total_activity_time = $votersArray[$i]->total_action_calls_time + $votersArray[$i]->total_regular_calls_time + $votersArray[$i]->total_break_time + $votersArray[$i]->total_waiting_time;
        if ($load_connected_only == '1') {
          if (in_array($votersArray[$i]->user_id, $callingIDSArray)) {
            $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.CALL');
            $votersArray[$i]->state_duration_seconds = $voterData->duration;
          } elseif (in_array($votersArray[$i]->user_id, $waitingIDSArray)) {
            $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.WAITING');
            $votersArray[$i]->state_duration_seconds = $votersArray[$i]->current_waiting_state_duration;
          } elseif (in_array($votersArray[$i]->user_id, $breakingIDSArray)) {
            $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.BREAK');
            $votersArray[$i]->state_duration_seconds = $votersArray[$i]->current_break_state_duration;
          }
        } else {
          $tempUserID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$votersArray[$i]->user_id], "user_id");
          $tempUserStatus = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$votersArray[$i]->user_id], "status");
          $tempUserCampaignID = Redis::hget('tm:sip_numbers:' . $usersExtentionsHashArray[$votersArray[$i]->user_id], "campaign_id");
          if ($tempUserID == $votersArray[$i]->user_id) {
            switch ($tempUserStatus) {
              case "call":
                if ($tempUserCampaignID == $campaign->id) {
                  $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.CALL');
                  if ($voterData) {
                    $votersArray[$i]->state_duration_seconds = $voterData->duration;
                  }
                }
                break;
              case "waiting":
                $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.WAITING');
                $waitingTimeObject = null; //CampaignWaitingTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id' ,$votersArray[$i]->user_id)->where('campaign_id' , $campaign->id)->orderBy('created_at' , 'DESC')->first();
                $votersArray[$i]->state_duration_seconds = $votersArray[$i]->current_waiting_state_duration;
                break;
              case "break":
                $votersArray[$i]->status_id = config('tmConstants.agent.callingStatus.BREAK');
                $breakTimeObject = null; // CampaignBreakTimes::selectRaw("TIMESTAMPDIFF(SECOND,created_at,now() ) as duration")->where('user_id' ,$votersArray[$i]->user_id)->where('campaign_id' , $campaign->id)->orderBy('created_at' , 'DESC')->first();
                $votersArray[$i]->state_duration_seconds = $votersArray[$i]->current_break_state_duration;
                break;
            }
          }
        }

        $votersArray[$i]->dialer_id = $usersExtentionsHashArray[$votersArray[$i]->user_id];
      }
      unset($votersArray[$i]->current_break_state_duration);
      unset($votersArray[$i]->current_waiting_state_duration);
      unset($votersArray[$i]->currentCallingVoter);
    }


    if ($request->input("export") == "print") {
      $result = $this->printAgentsWorks($votersArray, $returnedObject->total_count, $campaign->name);
      return $result;
    }

    $returnedObject->agents_list = $votersArray;

    $jsonOutput->setData($returnedObject);
    $executionEndTime = microtime(true);

    $seconds = $executionEndTime - $executionStartTime;

    //echo "This script took $seconds to execute.";
  }

  /*
    Helpful function that printing agents works list
  */
  private function printAgentsWorks($dataArray, $totalCount, $campaignName)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);
    for ($i = 0; $i < sizeof($dataArray); $i++) {
      ///echo intval($dataArray[$i]->quests_answered_last_hour)  ."---";
      $dataArray[$i]->ratio = ((!$dataArray[$i]->quests_answered_today_per_hour || !$dataArray[$i]->quests_answered_last_hour || intval($dataArray[$i]->quests_answered_today_per_hour) == 0) ? "---" : round((intval($dataArray[$i]->quests_answered_last_hour) / intval($dataArray[$i]->quests_answered_today_per_hour)) * 1000) / 1000);
      $dataArray[$i]->total_activity_time =  $this->getFormattedTimeFromSeconds($dataArray[$i]->total_activity_time);
      $dataArray[$i]->total_waiting_time =  $this->getFormattedTimeFromSeconds($dataArray[$i]->total_waiting_time);
      $dataArray[$i]->total_break_time =  $this->getFormattedTimeFromSeconds($dataArray[$i]->total_break_time);
      $dataArray[$i]->total_regular_calls_time =  $this->getFormattedTimeFromSeconds($dataArray[$i]->total_regular_calls_time);
      $dataArray[$i]->total_action_calls_time =  $this->getFormattedTimeFromSeconds($dataArray[$i]->total_action_calls_time);
      $dataArray[$i]->state_duration_seconds = $this->getFormattedTimeFromSeconds($dataArray[$i]->state_duration_seconds);
      $statusName = "לא מחובר";
      $dialerNumber = "----";
      $connected = false;
      switch ($dataArray[$i]->status_id) {
        case config('tmConstants.agent.callingStatus.CALL'):
          $statusName = "בשיחה";
          $dialerNumber = $dataArray[$i]->dialer_id;
          $connected = true;
          break;
        case config('tmConstants.agent.callingStatus.WAITING'):
          $statusName = "ממתין";
          $dialerNumber = $dataArray[$i]->dialer_id;
          $connected = true;
          break;
        case config('tmConstants.agent.callingStatus.BREAK'):
          $statusName = "בהפסקה";
          $dialerNumber = $dataArray[$i]->dialer_id;
          $connected = true;
          break;
      }
      $dataArray[$i]->status_name = $statusName;
      $dataArray[$i]->connected = $connected;
      $dataArray[$i]->dialer_number = $dialerNumber;
    }
    return view('tm.agentsWorks', array('data' => $dataArray, 'campaignName' => $campaignName));
  }

  /*
    Helpful function that returns formatted time in needed format
  */
  private function getFormattedTimeFromSeconds($seconds, $isInHoursAndMinutes = true)
  {
    if ($isInHoursAndMinutes) { // return in hours and minutes
      $returnedValueInHours = "--";
      $returnedValueInMinutes = "--";
      if ($seconds) {
        $seconds = intval($seconds);
        $returnedValueInHours =  floor($seconds / 3600);
        $returnedValueInMinutes =   floor(($seconds - $returnedValueInHours * (3600)) / 60);
        if ($returnedValueInHours < 10) {
          $returnedValueInHours = "0" . $returnedValueInHours;
        }
        if ($returnedValueInMinutes < 10) {
          $returnedValueInMinutes = "0" . $returnedValueInMinutes;
        }
      }
      $returnedValue = $returnedValueInHours . ":" . $returnedValueInMinutes;
      return $returnedValue;
    } else { //return in minutes and seconds
      $returnedValueInMinutes = "--";
      $returnedValueInSeconds = "--";
      if ($seconds) {
        $seconds = intval($seconds);
        $returnedValueInMinutes = floor($seconds / 60);
        $returnedValueInSeconds =  floor($seconds - $returnedValueInMinutes * 60);
        if ($returnedValueInMinutes < 10) {
          $returnedValueInMinutes = "0" . $returnedValueInMinutes;
        }
        if ($returnedValueInSeconds < 10) {
          $returnedValueInSeconds = "0" . $returnedValueInSeconds;
        }
      }
      $returnedValue = $returnedValueInMinutes . ":" . $returnedValueInSeconds;
      return $returnedValue;
    }
  }
  public function getAgentsWorkSummary(Request $request, $key)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);
    ini_set('memory_limit', '-1');

    $all_campaigns = $request->input('all_campaigns', null);
    $summary_date = $request->input('summary_date', null);

    $campaignID = null;
    if (!$all_campaigns) {
      $campaign = Campaign::select('id')->where('key', $key)->first();
      if (!$campaign) {
        echo "<h1 style='color:red;text-align: center;margin-top:30px;'>קמפיין לא קיים!</h1>";
        return;
      }
      $campaignID = $campaign->id;
    } else if (!$summary_date) {
      echo "<h1 style='color:red;text-align: center;margin-top:30px;'>חסר תאריך לתצוגת הדוח!</h1>";
      return;
    }


    $totalWaitingWhereQuery = 'WHERE(`campaign_waiting_times`.`campaign_id` = users_in_campaigns.campaign_id AND
     `campaign_waiting_times`.`user_id` = users_in_campaigns.user_id AND DATE (campaign_waiting_times.created_at) = work_date)';

    $totalWaitingQuery = CampaignWaitingTimes::select(
      DB::raw('SUM( TIMESTAMPDIFF(SECOND,campaign_waiting_times.created_at,campaign_waiting_times.end_date)) / 60')
    );

    $totalCallsWhereQuery = 'AND(`calls`.`campaign_id` = users_in_campaigns.campaign_id AND
    `calls`.`user_id` = users_in_campaigns.user_id AND DATE (calls.created_at) = work_date)';

    $totalCallsQuery = Call::select(
      DB::raw('SUM( TIMESTAMPDIFF(SECOND,calls.created_at,calls.call_action_end_date)) / 60')
    );

    $totalWaitingMinQuery = CampaignWaitingTimes::select(
      DB::raw('MIN(waiting_times.created_at)')
    );
    $totalCallsMaxQuery = Call::select(
      DB::raw('MAX(calls.call_action_end_date)')
    );
    $totalWaitingMaxQuery = CampaignWaitingTimes::select(
      DB::raw('MAX(waiting_times.end_date)')
    );
    $fields = [
      'campaigns.id as campaign_id', 'campaigns.name as campaign_name',
      'users.id as user_id', 'teams.name as team_name', //* campaign team!!!
      'employee_voter.personal_identity', 'employee_voter.first_name', 'employee_voter.last_name',
      DB::raw('MIN(waiting_times.created_at) as user_login_time'),

      DB::raw('MAX(calls.call_action_end_date) as user_logout_time1'),
      DB::raw('MAX(waiting_times.end_date) as user_logout_time2'),

      DB::raw('DATE(calls.call_action_end_date) as user_logout_date1'),
      DB::raw('DATE(waiting_times.end_date) as user_logout_date2'),

      DB::raw('DATE(waiting_times.created_at) as work_date'),
      DB::raw("(" . $totalWaitingQuery->toSql()  . " $totalWaitingWhereQuery ) as total_calls_waiting_time"),
      DB::raw("(" . $totalCallsQuery->toSql() . " $totalCallsWhereQuery ) as total_calls_action_time"),
      // DB::raw("(" . $totalWaitingMinQuery->toSql() . " $totalWaitingWhereQuery limit 1) as user_login_time"),
      // DB::raw("(" . $totalCallsMaxQuery->toSql() . " $totalCallsWhereQuery limit 1 ) as user_logout_time1"),
      // DB::raw("(" . $totalWaitingMaxQuery->toSql() . " $totalWaitingWhereQuery  limit 1) as user_logout_time2"),
    ];

    $groupByList = ['work_date', 'users.id'];

    $votersQuery = User::select($fields)
      ->withUsersInCampaigns($campaignID)
      ->join('voters as employee_voter', 'users.voter_id', 'employee_voter.id')
      ->leftJoin('campaigns', 'campaigns.id', 'users_in_campaigns.campaign_id')
      ->leftJoin('teams', 'teams.id', 'campaigns.team_id')
      ->join('campaign_waiting_times as waiting_times', function ($joinOn) {
        $joinOn->on([
          ['waiting_times.user_id', '=', 'users.id'],
          ['waiting_times.campaign_id', '=', 'users_in_campaigns.campaign_id']
        ]);
      })
      ->leftJoin('calls', function ($joinOn) {
        $joinOn->on([
          ['calls.user_id', '=', 'users.id'],
          ['calls.campaign_id', '=', 'users_in_campaigns.campaign_id'],
          [DB::raw('DATE(calls.created_at)'), '=', DB::raw('DATE(waiting_times.created_at)')]
        ]);
      })
      ->addBinding([
        $totalWaitingQuery->getBindings(),
        $totalCallsQuery->getBindings(),
        // $totalWaitingMinQuery->getBindings(),
        // $totalCallsMaxQuery->getBindings(),
        // $totalWaitingMaxQuery->getBindings(),
      ])
      ->where('users.deleted',  DB::raw(0))
      ->where('users_in_campaigns.deleted', DB::raw(0))
      ->groupBy($groupByList);

    if (!$all_campaigns) {
      $votersQuery = $votersQuery->where('users_in_campaigns.campaign_id', DB::raw($campaignID));
    }
    if ($summary_date) {
      $votersQuery = $votersQuery->where(DB::raw('DATE(waiting_times.created_at)'), $summary_date);
    }
    $votersArray =  $votersQuery->get();

    // echo (json_encode($votersArray->toArray()));
    // die;
    if (count($votersArray) == 0) {
      echo "<h1 style='color:red;text-align: center;margin-top:30px;'>אין תוצאות</h1>";
      return;
    }

    header("Content-Type: application/txt");
    header("Content-Disposition: attachment; filename=user_tellers_report.csv");
    $header = [
      '#',
      'מספר קמפיין',
      'שם קמפיין',
      'תאריך שיחה',
      'ת"ז',
      'שם פרטי',
      'שם משפחה',
      'זמן כניסה',
      'זמן יציאה',
      'זמן פעילות כולל',
      'זמן הפסקה כולל',

    ];
    $csvRow = implode(',', $header);
    $rowToPrint =  mb_convert_encoding($csvRow, "ISO-8859-8", "UTF-8") . "\n";
    echo $rowToPrint;

    $currentRow = 0;

    foreach ($votersArray as $row) {
      $currentRow++;
      $user_login_time = $row->user_login_time;

      $logout_time1 = new \DateTime($row->user_logout_time1);
      $logout_time2 = new \DateTime($row->user_logout_time2);

      if ($logout_time1->getTimestamp() > $logout_time2->getTimestamp()) {
        $user_logout_time = (strpos($row->user_logout_time1, $row->work_date) !== false) ? $row->user_logout_time1 : $row->user_logout_time2;
      } else {
        $user_logout_time = (strpos($row->user_logout_time2, $row->work_date) !== false) ? $row->user_logout_time2 : $row->user_logout_time1;
      }
      $totalWorkTime = $row->total_calls_waiting_time + $row->total_calls_action_time;

      $d1 = new \DateTime($user_logout_time);
      $d2 = new \DateTime($user_login_time);
      $workLoginTotalTime =  ($d1->getTimestamp() - $d2->getTimestamp()) / 60;
      $totalBreakTime = $workLoginTotalTime - $totalWorkTime;

      // echo strpos($row->user_logout_time1, $row->work_date)  . ',' . $row->user_logout_time1 . ', xxx' .$row->user_logout_time2 .
      // ',' .$totalBreakTime /60 . ', bbb' . $workLoginTotalTime /60 . ', rrr' . $totalWorkTime /60;
      // echo $d1->getTimestamp() . ',' . $d2->getTimestamp() . ', xxx' .$totalBreakTime /60 . ', bbb' . $workLoginTotalTime /60 . ', rrr' . $totalWorkTime /60;

      $workFormatedTime = $this->getFormatedTime($totalWorkTime);
      $breakFormatedTime = $this->getFormatedTime($totalBreakTime);

      $csvData = [
        $currentRow,
        $row->campaign_id,
        $row->campaign_name,
        $row->work_date,
        $row->personal_identity,
        $row->first_name,
        $row->last_name,
        $user_login_time,
        $user_logout_time,
        $workFormatedTime,
        $breakFormatedTime
      ];
      $csvRow = implode(',', $csvData);
      $rowToPrint =  mb_convert_encoding($csvRow, "ISO-8859-8", "UTF-8") . "\n";
      echo $rowToPrint;
    }
  }
  private function getFormatedTime($totalTime)
  {

    $minutes = $totalTime % 60;
    $hours = round(($totalTime - $minutes) / 60);

    $minutes = strlen($minutes) == 1 ? "0$minutes" : $minutes;
    $hours = strlen($hours) == 1 ? "0$hours" : $hours;

    return "$hours:$minutes"; // hh:ii;
  }
  /**
   * Get agent calls list stats by campaign key and agent user key
   *
   * @param string $key
   * @return void
   */
  public function getAgentCalls(Request $request, $key, $agentUserKey)
  {
    $executionStartTime = microtime(true);
    $jsonOutput = app()->make("JsonOutput");

    $isExport = ($request->input('export', null)) ? true : false;

    $currentPage = $request->input('current_page', 1);
    $loadUntilPage = $request->input('load_until_page', 1);
    if (intval($loadUntilPage) > 1) {
      $limit = config('tmConstants.MAX_RECORDS_FROM_DB') * ($loadUntilPage +  config('tmConstants.MAX_RECORDS_FROM_DB') * 3);
      $skip = 0;
    } else {
      $limit = config('tmConstants.MAX_RECORDS_FROM_DB');
      $skip = ($currentPage - 1) * config('tmConstants.MAX_RECORDS_FROM_DB');
    }


    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //get campaign with seleted fields
    $campaign = Campaign::select('id', 'name', 'team_id')->where('key', $key)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    $user = User::select('users.id', 'voters.personal_identity', 'voters.first_name', 'voters.last_name')
      //->selectRaw("CONCAT(voters.first_name  , ' ' , voters.last_name) as name")
      ->join('voters', 'voters.id', '=', 'users.voter_id')
      ->where('users.key', $agentUserKey)
      ->where('users.deleted', 0)
      ->first();

    if (!$user) {
      $jsonOutput->setErrorCode(config('errors.system.USER_DOESNT_EXIST'));
      return;
    }
    $fullEmployeesArray = $this->getCampaignEmployees($key);

    $votersArray = [];
    $usersArrayIDS = [];
    foreach ($fullEmployeesArray as $employees) {
      if (!in_array($employees->user_id, $usersArrayIDS)) {
        array_push($usersArrayIDS, $employees->user_id);
        array_push($votersArray, $employees);
      }
    }

    $returnedObject = new \stdClass;
    $returnedObject->campaign_name = $campaign->name;
    $returnedObject->all_agents_list = $votersArray;
    $returnedObject->user_agent_data = $user;
    if ($isExport) {
      $callsFields = [
        'calls.key as call_key',
        'calls.campaign_id',
        'campaigns.name as campaign_name',
        'calls.created_at',
        'voters.first_name',
        'voters.last_name',
        'voters.personal_identity',
        DB::raw('CASE
            WHEN calls.call_end_status = 0 THEN "בוצעה בהצלחה"
            WHEN calls.call_end_status = 1 THEN "חזור אלי"
            WHEN calls.call_end_status = 2 THEN "קושי בשפה"
            WHEN calls.call_end_status = 3 THEN "משיבון"
            WHEN calls.call_end_status = 4 THEN "התחתן"
            WHEN calls.call_end_status = 5 THEN "עבר דירה"
            WHEN calls.call_end_status = 6 THEN "צליל פקס"
            WHEN calls.call_end_status = 7 THEN "שיחה נותקה"
            WHEN calls.call_end_status = 8 THEN "טעות במספר"
            WHEN calls.call_end_status = 9 THEN "לא משת\"פ"
            WHEN calls.call_end_status = 10 THEN "עסוק"
            WHEN calls.call_end_status = 11 THEN "מספר מנותק"
            WHEN calls.call_end_status = 12 THEN "אין תשובה" END as call_end_status'),
        DB::raw("SEC_TO_TIME(TIMESTAMPDIFF(SECOND, calls.created_at , calls.call_action_end_date)) as action_call_seconds"),
        DB::raw("SEC_TO_TIME(TIMESTAMPDIFF(SECOND, calls.created_at , calls.call_end_date)) as regular_call_seconds")
      ];
    } else {
      $callsFields = [
        'calls.key as call_key',
        'calls.campaign_id',
        'campaigns.name as campaign_name',
        'calls.created_at',
        'calls.audio_file_name',
        'voters.first_name',
        'voters.last_name',
        'voters.personal_identity',
        'calls.call_end_status',
        DB::raw("TIMESTAMPDIFF(SECOND, calls.created_at , calls.call_action_end_date) as action_call_seconds"),
        DB::raw("TIMESTAMPDIFF(SECOND, calls.created_at , calls.call_end_date) as regular_call_seconds")
      ];
    }
    $baseListQuery = Call::select($callsFields)
      ->join('campaigns', 'campaigns.id', '=', 'calls.campaign_id')
      ->join('voters', 'voters.id', '=', 'calls.voter_id')
      ->where('calls.user_id', $user->id)
      ->where('calls.deleted', 0)
      ->withCount(['voters_answers' => function ($query) {
        $query->where('answered', 1);
      }]);
    if ($request->input('show_all_campaigns') != '1') {
      $baseListQuery = $baseListQuery->where('calls.campaign_id', $campaign->id);
    }
    if ($request->input('to_date_time')) {
      $baseListQuery = $baseListQuery->whereRaw("TIMESTAMPDIFF(SECOND, calls.created_at , '" . $request->input('to_date_time') . "') >= 0");
    }
    if ($request->input('from_date_time')) {
      $baseListQuery = $baseListQuery->whereRaw("TIMESTAMPDIFF(SECOND, calls.created_at , '" . $request->input('from_date_time') . "') <= 0");
    }
    if (!$isExport) {
      $baseListQuery = $baseListQuery->orderBy("calls.created_at", "DESC");
    }

    if ($isExport) {

      $jsonOutput->setBypass(true);
      $limit = 5000;
      $currentPage = 0;
      $currentRow = 0;

      do {
        $currentPage++;
        $skip = ($currentPage - 1) * $limit;
        $exportData = $baseListQuery->skip($skip)->take($limit)->get();
        if ($currentPage == 1 and count($exportData) == 0) {
          echo "<h1 style='color:red;text-align: center;margin-top:30px;'>אין תוצאות</h1>";
          return;
        }

        if ($currentPage == 1) {
          header("Content-Type: application/txt");
          header("Content-Disposition: attachment; filename=user_calls.csv");
          $header = [
            '#',
            'מספר קמפיין',
            'שם קמפיין',
            'תאריך שיחה',
            'זמן טיפול',
            'זמן שיחה',
            'ת"ז תושב',
            'שם פרטי',
            'שם משפחה',
            'סיכום שיחה',
            'מענה לשאלון'

          ];
          $csvRow = implode(',', $header);
          $rowToPrint =  mb_convert_encoding($csvRow, "ISO-8859-8", "UTF-8") . "\n";
          echo $rowToPrint;
        }
        foreach ($exportData as $row) {
          $currentRow++;
          $csvData = [
            $currentRow,
            $row->campaign_id,
            '"' . str_replace('"', '""', $row->campaign_name) . '"',
            $row->created_at,
            $row->action_call_seconds,
            $row->regular_call_seconds,
            $row->personal_identity,
            '"' . str_replace('"', '""', $row->first_name) . '"',
            '"' . str_replace('"', '""', $row->last_name) . '"',
            '"' . str_replace('"', '""', $row->call_end_status) . '"',
            ($row->voters_answers_count > 0) ? "כן" : "לא"
          ];
          $csvRow = implode(',', $csvData);
          $rowToPrint =  mb_convert_encoding($csvRow, "ISO-8859-8", "UTF-8") . "\n";
          echo $rowToPrint;
        }
      } while (count($exportData) == $limit);
    } else {
      $returnedObject->total_count = $baseListQuery->count();
      $returnedObject->all_calls_list = $baseListQuery->skip($skip)->take($limit)->get();
      $jsonOutput->setData($returnedObject);
    }




    //echo $this->url_exists("https://calls.shass.co.il/a1553450663.96557.wav")?"1":"0";


    $executionEndTime = microtime(true);

    $seconds = $executionEndTime - $executionStartTime;
    //echo "This script took $seconds to execute.";
  }


  /**
   * Get call detailed data by campaign key and call key
   *
   * @param string $key
   * @return void
   */
  public function getCallDetails($campaignKey, $agentKey, $callKey)
  {
    $executionStartTime = microtime(true);
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.dashboard')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $currentElectionCampaign = ElectionCampaigns::currentCampaign()['id'];
    $call = Call::select(
      'calls.id',
      'calls.user_id',
      'calls.questionnaire_id',
      'calls.campaign_id',
      'calls.portion_id',
      'calls.voter_id',
      'calls.phone_number',
      'calls.audio_file_name',
      'handledVoter.personal_identity as personal_identity',
      'handledVoter.first_name as first_name',
      'handledVoter.last_name as last_name',
      'dialer_user_id',
      'agentVoter.first_name as agent_first_name',
      'agentVoter.last_name as agent_last_name',
      'calls.created_at',
      'call_end_status',
      'call_notes.note',
      'call_notes.call_me_later',
      'call_notes.call_me_later_time',
      'call_notes.language_id',
      'languages.name as language_name',
      'support_status.name as support_status_name'
    )
      ->selectRaw("TIMESTAMPDIFF(SECOND , calls.created_at , calls.call_end_date   ) as call_duration_seconds")
      ->join('voters as handledVoter', 'handledVoter.id', '=', 'calls.voter_id')
      ->join('user_extensions', 'user_extensions.user_id', '=', 'calls.user_id')
      ->join('users', 'users.id', '=', 'calls.user_id')
      ->join('voters as agentVoter', 'agentVoter.id', '=', 'users.voter_id')
      ->leftJoin('call_notes', 'call_notes.call_id', '=', 'calls.id')
      ->leftJoin('languages', function ($joinOn) {
        $joinOn->on('languages.id', '=', 'language_id')
          ->where('languages.deleted', 0);
      })
      ->leftJoin('voter_support_status', function ($joinOn) use ($currentElectionCampaign) {
        $joinOn->on('voter_support_status.voter_id', '=', 'calls.voter_id')
          ->where('voter_support_status.deleted', 0)
          ->where('voter_support_status.entity_type',  config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'))
          ->where('election_campaign_id', $currentElectionCampaign);
      })
      ->leftJoin('support_status', function ($joinOn) {
        $joinOn->on('support_status.id', '=', 'voter_support_status.support_status_id')
          ->where('support_status.deleted', 0);
      })
      ->where('calls.key', $callKey)
      ->where('calls.deleted', 0)

      ->first();
    if (!$call) {
      $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
      return;
    }

    $call->questions = DashboardQuestion::select('questions.text_general', 'voters_answers.answer_text')
      ->leftJoin('voters_answers', function ($joinOn) use ($call) {
        $joinOn->on('voters_answers.question_id', '=', 'questions.id')
          ->where('voters_answers.deleted', 0)
          ->where('voters_answers.call_id', $call->id)
          ->where('voters_answers.voter_id', $call->voter_id);
      })
      ->where('questions.questionnaire_id', $call->questionnaire_id)
      ->where('questions.deleted', 0)
      ->get();



    $returnedObject = new \stdClass;
    $returnedObject->calls_data = $call;
    $callHistoryValues = [];

    $callHistoryID = History::select('history_id')->where('history_topic_id', (HistoryTopics::select('id')->where('operation_name', 'cti.call.edit')->first()->id))
      ->join('action_history', 'action_history.history_id', '=', 'history.id')
      ->where('action_history.referenced_model', 'Call')
      ->where('action_history.referenced_id', $call->id)
      ->first();
    if ($callHistoryID) {
      $callHistoryID = $callHistoryID->history_id;

      $callHistoryDetails = ActionHistory::where('history_id', $callHistoryID)
        ->where('referenced_model', '<>', 'Call')
        ->with('details')
        ->get();

      for ($i = 0; $i < sizeof($callHistoryDetails); $i++) {
        switch ($callHistoryDetails[$i]->referenced_model) {
          case 'Voters':
            $voterData = Voters::select("city", "street", "house", "flat")->where('id', $callHistoryDetails[$i]->referenced_id)->first();
            $newAddressElements = [];
            $newAddressElements["city"] = $voterData->city;
            $newAddressElements["street"] = $voterData->street;
            $newAddressElements["house"] = $voterData->house;
            $newAddressElements["flat"] = $voterData->flat;
            $newAddress = ($newAddressElements["city"] ? $newAddressElements["city"] . ',' : '');
            $newAddress .= ($newAddressElements["street"] ? $newAddressElements["street"] . ' ' : '');
            $newAddress .= ($newAddressElements["house"] ? $newAddressElements["house"] . ' ' : '');
            $newAddress .= ($newAddressElements["flat"] ? '/' . $newAddressElements["flat"] . ' ' : '');

            for ($j = 0; $j < sizeof($callHistoryDetails[$i]->details); $j++) {
              if (array_key_exists($callHistoryDetails[$i]->details[$j]->field_name, $newAddressElements)) {
                $newAddressElements[$callHistoryDetails[$i]->details[$j]->field_name] = $callHistoryDetails[$i]->details[$j]->old_value;
              }
            }

            $oldAddress = ($newAddressElements["city"] ? $newAddressElements["city"] . ',' : '');
            $oldAddress .= ($newAddressElements["street"] ? $newAddressElements["street"] . ' ' : '');
            $oldAddress .= ($newAddressElements["house"] ? $newAddressElements["house"] . ' ' : '');
            $oldAddress .= ($newAddressElements["flat"] ? '/' . $newAddressElements["flat"] . ' ' : '');
            array_push($callHistoryValues, ['name' => 'כתובת', 'oldValue' => $oldAddress, 'newValue' => $newAddress]);
            break;
          case 'VoterPhones':
            for ($j = 0; $j < sizeof($callHistoryDetails[$i]->details); $j++) {
              array_push($callHistoryValues, ['name' => ('טלפון' . (sizeof($callHistoryDetails[$i]->details) == 1 ? '' : ' ' . ($j + 1))), 'oldValue' => $callHistoryDetails[$i]->details[$j]->old_value, 'newValue' => $callHistoryDetails[$i]->details[$j]->new_value]);
            }
            break;
          case 'VoteTransportation':
            array_push($callHistoryValues, ['name' => 'הסעה', 'oldValue' => '', 'newValue' => 'כן']);
            $fromTimeToTime = "";
            for ($j = 0; $j < sizeof($callHistoryDetails[$i]->details); $j++) {
              if ($callHistoryDetails[$i]->details[$j]->field_name == 'from_time') {
                $fromTimeToTime = $fromTimeToTime . substr($callHistoryDetails[$i]->details[$j]->new_value, 0, 5);
              } elseif ($callHistoryDetails[$i]->details[$j]->field_name == 'to_time') {
                $fromTimeToTime .= '-' . substr($callHistoryDetails[$i]->details[$j]->new_value, 0, 5);
              }
            }
            if ($fromTimeToTime != "") {
              array_push($callHistoryValues, ['name' => 'שעות הסעה', 'oldValue' => '', 'newValue' => $fromTimeToTime]);
            }
            break;
          case 'VoterMetas':
            for ($j = 0; $j < sizeof($callHistoryDetails[$i]->details); $j++) {
              $voterMetaKey = VoterMetaKeys::select("key_name")->where('id', $callHistoryDetails[$i]->details[$j]->new_value)->where('deleted', 0)->first();
              if ($voterMetaKey) {
                $voterMetaValue = VoterMetaValues::select("value")->where('id', $callHistoryDetails[$i]->details[$j]->new_numeric_value)->where('deleted', 0)->first();
                if ($voterMetaValue) {
                  array_push($callHistoryValues, ['name' => $voterMetaKey->key_name, 'oldValue' => '', 'newValue' => $voterMetaValue->value]);
                }
              }
            }
            break;
        }
      }
    }
    $returnedObject->call_history_details = $callHistoryValues;
    $jsonOutput->setData($returnedObject);
    $executionEndTime = microtime(true);

    $seconds = $executionEndTime - $executionStartTime;
    // echo "This script took $seconds to execute.";
  }

  private function getCampaignEmployees($campaignKey)
  {

    $campaignQuery = Campaign::where('campaigns.key', $campaignKey)
      ->with(['users' => function ($query) {
        $query->select(
          'personal_identity',
          'first_name',
          'last_name',
          'users.active',
          DB::raw("CONCAT(first_name,' ',last_name) as full_name"),
          'users.id',
          'voters.id as voter_id',
          'users.key',
          'users.email AS user_email',
          'users.id as user_id'
        )
          ->join('voters', 'users.voter_id', '=', 'voters.id')
          ->groupBy('users.id');
      }]);
    $employeesArray = $campaignQuery->first()['users']->makeHidden('pivot');
    return $employeesArray;
  }
}
