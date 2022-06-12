<?php

namespace App\Repositories\Tm;

use App\Models\Tm\SimpleCampaign;
use App\Models\Tm\CampaignPortionProgress;
use App\Models\Tm\FinishedVoter;
use App\Models\Tm\CallNote;
use App\Models\Tm\Call;
use App\Models\Tm\CampaignBreakTimes;
use App\Models\Tm\CampaignWaitingTimes;
use Illuminate\Support\Facades\DB;
use stdClass;

class CampaignRepository
{

  public static function getAll()
  {
    return SimpleCampaign::select(
      "campaigns.id",
      "campaigns.key",
      "name",
      "scheduled_start_date",
      "activation_start_date",
      "status"
    )->withCreatorName()->get();
  }

  public static function getAllByUser($userId)
  {
    return SimpleCampaign::select(
      "campaigns.id",
      "campaigns.key",
      "name",
      "scheduled_start_date",
      "activation_start_date",
      "status"
    )->withCreatorName()
      ->byUser($userId)
      ->get();
  }

  public static function campaignPortionProgress($campaignId)
  {
    return CampaignPortionProgress::select(
      DB::raw("sum(processing_count) as processing_count"),
      DB::raw("sum(processed_count) as processed_count"),
      DB::raw("sum(unique_voters_count) as unique_voters_count")
    )->withPortions()
      ->where('voter_filters.entity_id', '=', $campaignId)
      ->get();
  }

  public static function changedStatusStatistics($campaignId)
  {
    $queryBuilder = CallNote::selectRaw('call_notes.support_status_id , support_status.name as support_status_name ,support_status.deleted as support_status_deleted, count(*) as voters_count')
      ->join('calls', 'calls.id', '=', 'call_notes.call_id')
      ->leftJoin('support_status', 'support_status.id', '=', 'call_notes.support_status_id')
      ->where('calls.campaign_id', $campaignId)
      ->where('call_notes.deleted', 0)
      ->where('calls.deleted', 0)
      //->where('support_status.deleted', 0)
      ->where(function ($query) {
        $query->where('call_notes.support_status_id', '!=', DB::raw('call_notes.previous_support_status_id'))
          ->orWhere(function ($query1) {
            $query1->whereNotNull('call_notes.support_status_id')->whereNull('call_notes.previous_support_status_id');
          });
      })
      ->groupBy('call_notes.support_status_id');

    return   $queryBuilder->get();
  }

  public static function getTotalProcessedCount($campaignId)
  {
    $data["total_processed"] = [];
    $data['processed_count'] = 0;

    $data['processed_count'] = FinishedVoter::successCalls($campaignId);
    //try this since changedStatusStatistics beside 1 place all where equals
    // and the success changed takes a lot of time
    if (false) {
      $succeedChangedCount =  FinishedVoter::getSucceedChanged($campaignId);
    } else {
      $data["total_changed_status"] =  CampaignRepository::changedStatusStatistics($campaignId);
      $succeedChangedCount = $data["total_changed_status"]->sum('voters_count');
      $data["changed_status_count"] = $succeedChangedCount;
    }

    $succeedUnchangedCount = $data['processed_count'] - $succeedChangedCount;
    $data["total_processed"] = [
      ['status' => config('tmConstants.call.status.SUCCESS_WITH_SUPPORT_STATUS'), 'voters_count' => $succeedChangedCount],
      ['status' => config('tmConstants.call.status.SUCCESS_WITHOUT_SUPPORT_STATUS'), 'voters_count' => $succeedUnchangedCount]
    ];

    $dataContainer = FinishedVoter::notSuccessCalls($campaignId);
    $dataContainer->map(function ($value, $key) use (&$data) {
      array_push($data["total_processed"], ['status' => $key, 'voters_count' => $value]);
      $data['processed_count'] += $value;
    });
    return $data;
  }

  public static function campaignCallsStats($campaignKey, $campaignId)
  {

    $data["calls_time_in_seconds"] = 0;
    $data["calls_action_time_in_seconds"] = 0;
    $data["breaks_time_in_seconds"] = 0;
    $data["answered_calls"] = 0;
    $data["not_answered_calls"] =  0;


    $data["calls_waiting_time_in_seconds"] = CampaignWaitingTimes::select(DB::raw('sum(TIME_TO_SEC(TIMEDIFF(campaign_waiting_times.end_date, campaign_waiting_times.created_at))) total_calls_sum'))
      ->where('campaign_id', $campaignId)
      ->whereNotNull('campaign_waiting_times.end_date')
      ->first()->total_calls_sum;

    $data["calls_time_in_seconds"] = Call::select(DB::raw('sum(TIME_TO_SEC(TIMEDIFF(calls.call_end_date, calls.created_at))) total_calls_sum'))
      ->where('campaign_id', $campaignId)
      ->whereNotNull('calls.call_end_date')
      ->first()->total_calls_sum;

    $data["calls_action_time_in_seconds"] = Call::select(DB::raw('sum(TIME_TO_SEC(TIMEDIFF(calls.call_action_end_date, calls.created_at))) total_action_calls_sum'))
      ->where('campaign_id', $campaignId)
      ->whereNotNull('calls.call_action_end_date')
      ->first()->total_action_calls_sum;

    $data["breaks_time_in_seconds"] = CampaignBreakTimes::select(DB::raw('sum(TIME_TO_SEC(TIMEDIFF(campaign_break_times.end_date, campaign_break_times.created_at))) total_breaks_sum'))
      ->withCampaigns()
      ->where('campaigns.key', $campaignKey)
      ->whereNotNull('campaign_break_times.end_date')
      ->first()->total_breaks_sum;

    $data["answered_calls"] = Call::select(DB::raw('count(*) as count'))
      ->where('campaign_id', $campaignId)
      ->where('call_end_status', 0)
      ->first()->count;

    $data["not_answered_calls"] = Call::select(DB::raw('count(*) as count'))
      ->where('campaign_id', $campaignId)
      ->where('call_end_status', '!=', 0)
      ->first()->count;

    // set up default values
    $statusDetails = [
      'calls_time_in_seconds', 'calls_action_time_in_seconds',
      'breaks_time_in_seconds', 'answered_calls', 'not_answered_calls'
    ];
    foreach ($statusDetails as $detail) {
      if (!$data[$detail]) {
        $data[$detail] = 0;
      }
    }
    return $data;
  }

  public static function questionnaire($campaignId)
  {
    $questionnaire = DB::table("questionnaires")
      ->where('campaign_id', $campaignId)
      ->where('active', 1)
      ->first(); //get single questionnaire
    if (!$questionnaire) {
      $obj = new stdClass();
      $obj->questions = [];
      return $obj;
    }
    $questions = DB::table("questions")->where("questionnaire_id", $questionnaire->id)->get();

    $questionsIds = $questions->map(function ($question) {
      return $question->id;
    })->toArray();

    $answered = DB::table("voters_answers")
      ->select(DB::raw("voters_answers.question_id, count(voters_answers.question_id) as count"))
      ->whereIn("voters_answers.question_id",  $questionsIds)
      ->groupBy('voters_answers.question_id')
      ->get();

    $answered = $answered->pluck('count', 'question_id')->toArray();

    $possibleAnswered = DB::table('possible_answers')
      ->whereIn("question_id", $questionsIds)
      ->get();

    $possibleAnsweredItems = $possibleAnswered->reduce(function ($carry, $item) {
      $carry[$item->question_id][] = $item;
      return $carry;
    }, []);


    $questions = $questions->map(function ($question) use ($answered, $possibleAnsweredItems) {
      if (array_key_exists($question->id, $answered)) {
        $question->answered = true;
      } else {
        $question->answered = false;
      }
      if (array_key_exists($question->id, $possibleAnsweredItems)) {
        $question->possible_answers = $possibleAnsweredItems[$question->id];
      } else {
        $question->possible_answers = [];
      }
      return $question;
    });

    $questionnaire->questions = $questions;
    return $questionnaire;
  }
}
