<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class FinishedVoter extends Model
{

  public $primaryKey = 'id';
  protected $table = 'finished_voters_in_campaign';

  public static function getSucceedChanged($campaignId)
  {
    $dataContainerBuilder = self::selectRaw("count(distinct(finished_voters_in_campaign.voter_id)) as result")
      ->where('finished_voters_in_campaign.campaign_id', $campaignId)
      ->where('finished_voters_in_campaign.status', config('tmConstants.call.status.SUCCESS'))
      ->join('calls', function ($joinOn) {
        $joinOn->on('calls.campaign_id', '=', 'finished_voters_in_campaign.campaign_id')
          ->on('calls.voter_id', '=', 'finished_voters_in_campaign.voter_id')
          ->where('calls.deleted', 0);
      })
      ->join('call_notes', 'call_notes.call_id', '=', 'calls.id')
      ->where('calls.call_end_status', config('tmConstants.call.status.SUCCESS'))
      ->where('call_notes.deleted', 0)
      ->where(function ($query) {
        $query->where('call_notes.support_status_id', '!=', DB::raw('call_notes.previous_support_status_id'))
          ->orWhere(function ($query1) {
            $query1->whereNotNull('call_notes.support_status_id')->whereNull('call_notes.previous_support_status_id');
          });
      });
    return $dataContainerBuilder->get()->pluck('result')->first();
  }

  public static function successCalls($campaignId)
  {
    $queryBuilder = self::selectRaw("count(distinct(finished_voters_in_campaign.voter_id)) as result")
      ->where('finished_voters_in_campaign.campaign_id', $campaignId)
      ->where('finished_voters_in_campaign.status', config('tmConstants.call.status.SUCCESS'));
    return $queryBuilder->get()->pluck('result')->first();
  }

  public static function notSuccessCalls($campaignId)
  {
    $queryBuilder = self::selectRaw("status , count(distinct voter_id ) as voters_count")
      ->where('campaign_id', $campaignId)
      ->where('status', '!=', config('tmConstants.call.status.SUCCESS'))
      ->groupBy("status");

    return $queryBuilder->get()->pluck('voters_count', 'status'); // order does meter
  }
}
