<?php

namespace App\Extensions;

use Illuminate\Support\Str;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;
use Illuminate\Auth\EloquentUserProvider as EloquentUserProvider;
//use App\Models\User;
use Carbon\Carbon;

class ShasUserProvider extends EloquentUserProvider {


	public function retrieveByCredentials(array $credentials) {

		if (empty($credentials)) {
            return;
        }

		$model = $this->createModel();
        $activeCampaignStatus = config('tmConstants.campaign.statusNameToConst.ACTIVE');
		
		$user = $model->where('deleted', 0)
		->whereHas( "voter", function ( $query ) use ( $credentials ) {
        	foreach ($credentials as $key => $value) {
	            if (! Str::contains($key, 'password')) {
	                $query->where($key,'like', $value);
	            }
	        }
		})
		->where(function ( $query ) {
			$query->whereDoesntHave('userAllowedIps')
			->OrWhereHas('userAllowedIps', function($query2) {
				$query2->where('ip', request()->ip());
			});
		})
		->where(function ( $query ) use ($activeCampaignStatus) {
			$query->whereHas( "rolesByUsers", function ( $q ) {
        		$q->where('from_date', '<=', Carbon::now())->where('deleted', '=', 0)->where(function ($q1) {
        			$q1->whereNull('to_date')->orWhere('to_date', '>=', Carbon::now()->addDays(-1));
        		});
			} )
			->orWhereHas( "campaigns", function ( $q ) use ($activeCampaignStatus) {
				$q->where(['campaigns.status' => $activeCampaignStatus, 'campaigns.deleted' => 0,
				'users_in_campaigns.active' => 1]);
			});
		})
		->first();
       return $user;
        
	}

}