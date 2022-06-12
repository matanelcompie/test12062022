<?php

namespace App\Http\Middleware;

use Illuminate\Http\Response;

use Closure;

class CheckMaintenance
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
        $jsonOutput = app()->make( "JsonOutput" );
        $maintenance = config('app.maintenance');
        if ($maintenance) {
            $jsonOutput->setErrorCode(config('errors.system.MAINTENANCE'), 401);
            return new Response;
        } else {
            return $next($request);
        }
    }
}
