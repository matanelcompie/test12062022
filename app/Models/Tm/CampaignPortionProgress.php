<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;


class CampaignPortionProgress extends Model
{

  public $primaryKey = 'id';
  protected $table = 'campaign_portion_progress';

  public function scopeWithPortions($query)
  {

    $query->rightJoin('voter_filters', function ($joinOn) {
      $joinOn->on('voter_filters.id', '=', 'campaign_portion_progress.portion_id');
    });
  }
}
