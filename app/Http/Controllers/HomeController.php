<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\CrmRequest;
use App\Models\User;
use JWT;
use Carbon\Carbon;


use Redirect;

class HomeController extends Controller {

    /*
		Function that handles accessing index (home folder)
	*/
    public function index(Request $request) {

        //redirect to login if in maintenance
        $maintenance = config('app.maintenance');
        if ($maintenance) return Redirect::to('logout');

        //Set original url in session
        $originalRoute = $request->path();
        $request->session()->put('original_url', $originalRoute);

        $key = config('jwt.secret');
        $jwtParams = array(
            "iss" => "https://shass.co.il",
            "aud" => "https://shass.co.il",
            "iat" => Carbon::now()->timestamp,
            "exp" => Carbon::now()->timestamp + 60*60*10,
            "sub" => Auth::user()->id
        );
        $token = JWT::encode($jwtParams, $key);

        //set base url, username, and csrf token for react
        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0)? true : false;
        $baseUrl = str_replace("http://", "", $baseUrl);
        $baseUrl = str_replace("https://", "", $baseUrl);
        $baseUrl = str_replace(request()->server('SERVER_NAME'), "", $baseUrl);
        $baseUrl = str_replace(":" . request()->server('SERVER_PORT'), "", $baseUrl);
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();
        $data['version'] = config('app.version');
        $data['reactHash'] = Cache::get('react_hash', '0');
        
        $isProdEnv = env('DB_HOST') == config('app.production_db_ip', '10.192.138.3');
        $data['env'] = $isProdEnv ? 'production' : 'dev';
        $data['websocketHost'] = env("WEBSOCKET_HOST") . ':'. env('WEBSOCKET_PORT', 8000);
        $data['websocketToken'] = $token;

        $routePermission = Route::currentRouteName();

        if ($routePermission == "home") {
            $data['reactJs'] = "index.js";
            $data['css'] = "shas.v2.css";
        } else if ($routePermission == "v2.home") {
            $data['reactJs'] = "index.v2.js";
            $data['css'] = "shas.v2.css";
        }
        $data['routePermission'] = $routePermission;

        $user = Auth::user();
        if (!$user->admin){
            $userPermissions = $user->permissions(true);

            // If user has only cti permissions
            // redirect him to cti screen
            $permissionsCnt = count($userPermissions);
            if ( count($userPermissions) == 0  ) {
                return Redirect::to('cti');
            }
        }
        return view('/home', $data);
    }

	/*
		Function that returns all crmRequests
	*/
    public function crmSummary() {
        $jsonOutput = app()->make("JsonOutput");
        $dbFields = [
            'requests.key AS req_key', //DB::raw('CAST(requests.key AS UNSIGNED INTEGER) AS req_key'),
            'voters.key AS voter_key',
            'requests.opened',
            'requests.unknown_voter_id',
            'requests.user_handler_id',
            'requests.user_create_id',
            'request_topics.name AS topic_name',
            'request_sub_topics.name AS sub_topic_name',
            'actions.description AS actions_description',
            'request_status.name AS status_name',
            'request_status_type.id AS status_type_id',
            DB::raw('DATE(requests.date) AS date'),
            DB::raw('DATE(requests.close_date) AS close_date'),
            DB::raw('DATE(requests.target_close_date) AS target_close_date'),
            'voters.first_name AS voter_first_name',
            'voters.last_name AS voter_last_name',
            'unknown_voters.first_name AS unknown_voter_first_name',
            'unknown_voters.last_name AS unknown_voter_last_name'];

        $currentUser = Auth::user();
        $users = User::select('users.id')
                        ->distinct()
                        ->withRolesAndTeams()
                        ->where('roles_by_users.from_date', '<=', Carbon::now())->where('roles_by_users.deleted', '=', 0)->where(function ($query1) {
                            $query1->whereNull('roles_by_users.to_date')-> orWhere('roles_by_users.to_date', '>=', Carbon::now()->addDays(-1));
                        })
                        ->where('teams.leader_id', $currentUser->id)
                        ->where('users.deleted', 0)
                        ->where('users.active', 1)->get();
        if (count($users) == 0) {
            $users->push($currentUser);
        }
        //get array if users ids
        $usersIds = [];
        foreach($users as $user) {
            array_push($usersIds, $user->id);
        }

        $userRequests = $this->getRequestsUserHandle($dbFields, $usersIds);
        //get array of requests keys for whereNotIn in the second request search
        $userRequestsKeys = [];
        foreach ($userRequests as $userRequest) {
            array_push($userRequestsKeys, $userRequest->req_key);
        }
        $requestsUserPassedOver = $this->getRequestsUserPassedOver($dbFields, $currentUser, $userRequestsKeys);
        $result = array_merge($userRequests, $requestsUserPassedOver);
        $jsonOutput->setData($result);
    }

	/*
		Private helpfull function that returns all CrmRequests that not handled
	*/
    private function getRequestsUserHandle($dbFields, $users) {
        $requestsQuery = CrmRequest::select($dbFields)
                ->withStatus()
                ->withStatusType()
                ->withTopic(TRUE)
                ->withSubTopic(TRUE)
                ->withVoter(TRUE)
                ->withAction();

        $requestsList = $requestsQuery
                ->where('request_status_type.id', '<>', 4)
                ->whereIn('requests.user_handler_id', $users)
                ->groupBy('requests.key')
                ->orderBy('requests.target_close_date', 'asc')
                ->get()
                ->all(); //convert to array

        return $this->handleRequestsData($requestsList); // prepare requests summary, clear not needed data.
    }

	/*
		Private helpful function that returns all crmRequest from all users
		that aren't the current connected user
	*/
    private function getRequestsUserPassedOver($dbFields, $currentUser, $userRequestsKeys) {
        $requestsQuery = CrmRequest::select($dbFields)
                ->withStatus()
                ->withStatusType()
                ->withTopic(TRUE)
                ->withSubTopic(TRUE)
                ->withVoter(TRUE)
                ->withAction();

        $requestsList = $requestsQuery
                ->where('request_status_type.id', '<>', 4)
                ->where('requests.user_create_id', $currentUser->id)
                ->where('requests.user_handler_id', '<>', $currentUser->id)
                ->whereNotIn('requests.key', $userRequestsKeys)
                ->groupBy('requests.key')
                ->orderBy('requests.target_close_date', 'asc')
                ->get()
                ->all(); //convert to array

        return $this->handleRequestsData($requestsList); // prepare requests summary, clear not needed data. 
    }

	/*
		Private helpful function that handles requestsList
	*/
    private function handleRequestsData(&$requestsList) {
        $userId = Auth::user()->id;
        $requestStatusTypeOpen = array(1, 2);
        $requestStatus = array(1 => 'new', 2 => 'inTherapy', 3 => 'closed', 4 => 'canceled');

        foreach ($requestsList as $request) {
            if ($request['voter_key']) {
                $request['voter_name'] = $request['voter_first_name'] . " " . $request['voter_last_name'];
            } else {
                $request['voter_name'] = $request['unknown_voter_first_name'] . " " . $request['unknown_voter_last_name'];
                unset($request['voter_key']);
            }

            $displayGroups = array();
            $displayGroups[] = $requestStatus[$request['status_type_id']];

            if (in_array($request['status_type_id'], $requestStatusTypeOpen)) {
                $displayGroups[] = 'open';
            }

            if ($request['status_type_id'] == 3) {
                $request['closedBeforeTargetDate'] = $request['close_date'] < $request['target_close_date'] ? true : false;
            }

            if ($request['user_handler_id'] == $userId && $request['user_handler_id'] != $request['user_create_id']) {
                $displayGroups[] = 'passedToMe';
            }

            if ($request['user_handler_id'] != $userId && $request['user_handler_id'] != $request['user_create_id']) {
                $displayGroups[] = 'IPassedOver';
            }

            if (($this->dateDifferenceFromToday($request['target_close_date']) < 0) && in_array($request['status_type_id'], $requestStatusTypeOpen)) {
                $displayGroups[] = 'exceedCloseDate';
            }

            $request['displayGroups'] = $displayGroups;

            unset(
                    $request['voter_first_name']
                    , $request['voter_last_name']
                    , $request['unknown_voter_first_name']
                    , $request['unknown_voter_last_name']
                    , $request['user_handler_id']
                    , $request['user_create_id']
                    , $request['status_type_id']
                    , $request['unknown_voter_id']
                    , $request['close_date']
            );
        }
        return $requestsList;
    }

	/*
		Private helpful function that returns date difference in days from today to parameter date
	*/
    private function dateDifferenceFromToday($target) {
        $targetDate = strtotime($target);
        $today = time();
        $difference = $targetDate - $today;
        return floor($difference / 86400);
    }

}