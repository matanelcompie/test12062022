<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response as FacadesResponse;

class apiActivistsPermissions {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     * @param  string|null              $guard
     *
     * @return mixed
     */
    public function handle (Request $request, Closure $next, $guard = null ) {
 
        $jsonOutput = app()->make( "JsonOutput" );
    try {
        $user = Auth::guard('activists_api')->user();
        //transfer permissions from route to hash table
        $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
        $tempArray = [];
        foreach($routePermissions as $routePermission) {
            $tempArray[$routePermission] = true;
        }
        $routePermissions = $tempArray;
        if ($user) {
            config(['auth.defaults' => [ 'guard'=> 'activists_api' ]]);

            $foundPermission = false;
			 
            if(count($routePermissions) > 0){  //Check app permissions
                if (isset($routePermissions['allow'])) {
                    $foundPermission = true;
                } else {
                    $foundPermission = ApiPermissions::checkInUserPermissions($user, $user->permissions(), $routePermissions);
                }
            }
            
            if (!$foundPermission)  {
                $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'), 401);
                return new Response;
            } else {
                return $next( $request );
            }

        } else {
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'), 401);
            return new Response;
        } 
    } catch (\Throwable $th) {
        $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'), 401);
            return new Response;
    }

    }
}