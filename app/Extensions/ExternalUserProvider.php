<?php

namespace App\Extensions;

use Illuminate\Auth\EloquentUserProvider as EloquentUserProvider;
use Illuminate\Support\Facades\DB;

class ExternalUserProvider extends EloquentUserProvider {


	//override function check
	public function retrieveByCredentials(array $credentials) {

		if (empty($credentials)) {
            return;
        }

        $model = $this->createModel();
        //return user that has active token
        $user = $model->whereHas('tokens', function($query) use ($credentials) {
        	$query->where('token', $credentials['token'])
        		  ->where('token_start_date', '<=', DB::raw('NOW()'))
        		  ->where(function($orQuery) {
        		  	$orQuery->whereNull('token_end_date')
        		  			->orWhere('token_end_date', '>=', DB::raw('NOW()'));
        		  });
        })->first();
        return $user;
        
	}

}