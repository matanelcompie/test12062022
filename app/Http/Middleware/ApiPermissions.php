<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Response;
use App\Http\Controllers\Tm\CampaignController;
class ApiPermissions {

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure                 $next
     * @param  string|null              $guard
     *
     * @return mixed
     */
    public function handle ( $request, Closure $next, $guard = null ) {
 
        $jsonOutput = app()->make( "JsonOutput" );
        $authenticated = false;

        //transfer permissions from route to hash table
        $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
        $tempArray = [];
        foreach($routePermissions as $routePermission) {
            $tempArray[$routePermission] = true;
        }
        $routePermissions = $tempArray;
	 
        //if external user
        if (Auth::guard('api')->check()) {
            config([
                    'auth.defaults' => [
                        'guard'=> 'api'
                    ]
            ]);
            
            $foundPermission = false;
            $user = Auth::user();
			 
            if(count($routePermissions) > 0){  //Check app permissions
                if (isset($routePermissions['allow'])) {
                    $foundPermission = true;
                } else {
                    $foundPermission = $this->checkInUserPermissions($user, $user->permissions, $routePermissions);
                }
            }
            
            if (!$foundPermission)  {
                $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'), 401);
                return new Response;
            } else {
                return $next( $request );
            }
        }
        elseif ( Auth::guard('web')->check() ) $authenticated = true;

        if (!$authenticated) {
			 
            $jsonOutput->setErrorCode(config('errors.system.NOT_AUTHORIZED'), 401);
            return new Response;
        // if regular web user
        } else {
            $checkCtiPermission = isset($routePermissions['cti']);
            unset($routePermissions['cti']); // Cti is not a regular app permission. 

            $foundPermission = false;
            $user = Auth::user();
            
            if(count($routePermissions) > 0){  //Check app permissions
                if (isset($routePermissions['allow'])) {
                    $foundPermission = true;
                } else {
                    $foundPermission = $this->checkInUserPermissions($user, $user->permissions(), $routePermissions);
                }
            }
            if(!$foundPermission && $checkCtiPermission){ //Check cti Campaign permission:
                $foundPermission =  $this->checkCtiRoutePermissions($request, $user);
            }

            if (!$foundPermission)  {
                $jsonOutput->setErrorCode(config('errors.system.NO_PERMISSION'), 401);
                return new Response;
            } else {
                return $next( $request );
            }
        }
    }

    private function checkCtiRoutePermissions($request, $user){
        $campaignKey = $request->route('campaignKey', null);

        $userInCampaigns = CampaignController::getUsersInCampaigns($user->id, $campaignKey);
        $foundPermission = !is_null($userInCampaigns) ? true : false;

        return $foundPermission;

    }
    public static function checkInUserPermissions($user, $userPermissions, $routePermissions){
        $foundPermission = false;
        if ($user->admin) {
            $foundPermission = true;
        } else { // Check not admin user:
            foreach ( $userPermissions as $permission ) {
                if ( isset($routePermissions[$permission->operation_name])) {
                        $foundPermission = true;
                        break;
                }
            }
        }
        return $foundPermission; 
    }
}