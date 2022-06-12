<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
    	Log::info($request->method()." - ".$request->url());
		DB::listen(function ($query) use ($request) {
			/*if ($query->sql == "select * from `roles_by_users` where `user_id` = ? and 0 = 1 and `deleted` = ?") {
				Log::info("Bad route: ".$request->method()." - ".$request->url());
			}*/
		    Log::info($query->sql);
		});

        return $next($request);
    }
}