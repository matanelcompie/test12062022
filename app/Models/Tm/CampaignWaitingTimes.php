<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Models\User;
use App\Traits\SpecialSoftDeletes;
use Illuminate\Support\Facades\Auth;

 
class CampaignWaitingTimes extends KeyedModel
{
  
    public $primaryKey = 'id';
    protected $table = 'campaign_waiting_times';

 
	public function scopeWithCampaigns($query) {

        $query->join('campaigns', 'campaigns.id', '=', 'campaign_waiting_times.campaign_id');
    }
 
}
