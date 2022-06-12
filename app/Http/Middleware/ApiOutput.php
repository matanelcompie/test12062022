<?php

namespace App\Http\Middleware;

use Closure;

class ApiOutput {

    public function handle ( $request, Closure $next ) {
    	$response = $next( $request );

    	$jsonOutput = app()->make( "JsonOutput" );
    	//bypass json response
    	if ($jsonOutput->bypass()) return $response;
    	//else check for laravel error and return it
    	if ($response->status() >= 500) {
    		return $response;
    	//return json output
		} else {
			return $jsonOutput->returnJson();
		}
    }
}
