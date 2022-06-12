<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\ElectionRolesGeographical;


class AuthMobileVoter {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     * @param  string|null              $guard
     *
     * @return mixed
     */
    public function handle (Request $request, Closure $next ) {
        $jsonOutput = app()->make("JsonOutput");

        $VoteReporting = app()->make( "VoteReporting" );
        $sessionData = $VoteReporting->getVoteReportSession();
        if($sessionData && !empty($sessionData->geographic_areas_id)){
            $geographicalRole =  ElectionRolesGeographical::find( $sessionData->geographic_areas_id);
            if($geographicalRole && $geographicalRole->current_reporting != 0){
                $VoteReporting->extendVoteReportSession($sessionData);
            }else{
                $jsonOutput->setErrorCode(config('errors.mobile.ROLE_HAS_BEEN_TAKEN'), 401);
                return new Response;   
            }
        }else {
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'), 401);
            return new Response;
        }

        return $next( $request );
    }
}