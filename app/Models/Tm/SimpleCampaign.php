<?php

namespace App\Models\Tm;

use Illuminate\Support\Facades\DB;


class SimpleCampaign extends Campaign
{
  protected $appends = [];
  protected $visible = [];

  public function scopeWithCreatorName($query)
  {
    $query->leftJoin("users", "campaigns.user_create_id", "=", "users.id")
      ->leftJoin("voters", "users.voter_id", "=", "voters.id")
      ->addSelect(DB::raw('CONCAT(first_name, " " , last_name) as creator_name'));
  }

  public function scopeByUser($query, $userId)
  {
    $query->join('users_in_campaigns', function ($joinOn) {
      $joinOn->on('users_in_campaigns.campaign_id', '=', 'campaigns.id')
        ->where('users_in_campaigns.deleted', "0");
    })
      ->where('users_in_campaigns.user_id', "=", $userId);
  }



  /**
   * this overrides the Campaign creator name unless there can be some not expected behavior
   */
  public function getCreatorNameAttribute()
  {
    return $this->attributes['creator_name'];
  }
}
