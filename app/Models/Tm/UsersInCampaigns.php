<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UsersInCampaigns extends Model
{

  public $primaryKey = 'id';
  protected $table = 'users_in_campaigns';


  public static function usersCountInCampaign($campaignId)
  {
    return UsersInCampaigns::select(
      DB::raw("count(campaign_id) as users_count")
    )
      ->where('campaign_id', $campaignId)
      ->groupBy('campaign_id')
      ->get();
  }
}
