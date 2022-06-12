<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Menu;
use App\Models\SideMenu;
use App\Models\Voters;
use App\Models\CrmRequest;

class MenuController extends Controller {
   
	 /* OLD UI FUNCTION - TO DELETE */
    public function index(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
        $menus = Menu::all();
        for ($i = 0; $i < count($menus); $i++) {
            $menus[$i]->sub_menus = $menus[$i]->subMenus()->where('display_in_menu', 1)->orderBy('menu_order', 'asc')->get();
            $menus[$i]->side_menus = $menus[$i]->subMenus()->where('name', '!=', 'DIVIDER')->orderBy('side_menu_order', 'asc')->get();
        }
        $jsonOutput->setData($menus);
    }

	/*
		Function that returns side menu to UI
	*/
    public function getSideMenu() {
        $jsonOutput = app()->make("JsonOutput");
        $sideMenu = SideMenu::select("side_menus.id",
                                    "side_menus.name",
                                    "permission_id",
                                    "url", "action_name",
                                    "menu_order",
                                    "side_menus.parent_id",
                                    "side_menus.external_link")
                            ->withPermissionName()
                            ->where("active", 1)
                            ->where("side_menus.deleted", 0)
                            ->orderBy("side_menus.parent_id", "asc")
                            ->orderBy("menu_order", "asc")
                            ->get();
        $jsonOutput->setData($sideMenu);
    }

	/*
		Function that get POST params of UI's top header search , and performs 
		the search operation and returns the results
	*/
    public function headerSearch(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $isError = false;
        $searchType = $request->input('type', null);
        $searchValue = trim($request->input('value', ''));

        if ($searchType == null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_SEARCH_TYPE'));
            $isError = true;
        }
        if (!$isError) {
            if (($searchType != 'voter') && ($searchType != 'request')) {
                $jsonOutput->setErrorCode(config('errors.system.INVALID_SEARCH_TYPE'));
                $isError = true;
            }
        }
        if (!$isError) {
            if ($searchValue == '') {
                $jsonOutput->setErrorCode(config('errors.system.MISSING_SEARCH_VALUE'));
                $isError = true;
            }
        }
        if (!$isError) {
            switch ($searchType) {
                case 'voter':
                    //remove '-' from input for numbers check
                    $cleanSearchValue = str_replace("-", "", $searchValue);
                    $voters = Voters::withFilters()
                                    ->select('voters.key',
                                            'voters.personal_identity',
                                            'voters.first_name',
                                            'voters.last_name',
                                            DB::raw('(CASE WHEN voters.city_id is null THEN voters.city
                                                        ELSE c.name END) as city'))
                                    ->withCity(true)
                                    ->where(function($query) use ($searchValue, $cleanSearchValue) {
                                        if (preg_match('/^[0-9]+$/', $cleanSearchValue)) {
                                            $query->where('personal_identity', 'like', ltrim($cleanSearchValue, '0') . '%');
                                        } else {
                                            $valueArray = explode(' ', $searchValue);
                                            if (count($valueArray) == 1) {
                                               $query->orWhere('first_name', 'like', $valueArray[0] . '%')
                                                     ->orWhere('last_name', 'like', $valueArray[0] . '%');
											        $query->whereRaw(" MATCH (first_name, last_name) AGAINST ('+". $valueArray[0]."')");
                                            } else {
												 $query->whereRaw(" MATCH (first_name, last_name) AGAINST ('+". $valueArray[0]. ' +'.$valueArray[1]."' IN BOOLEAN MODE) ");
                                                ///$query->where('first_name', 'like', $valueArray[0] . '%')
                                                ///->where('last_name', 'like', $valueArray[1] . '%');
                                            }
                                        }
                                    })
                                    ->withCount('user')
                                    ->withCount('getRepresentativeDetails')
                                    ->withCount('crmRequests')
                                    ->limit(10)
                                    ->groupBy('voters.key')
                                    ->get();
                    if ((preg_match('/^[0-9]+$/', $cleanSearchValue)) && (count($voters) < 10)) {
                        $votersWithPhone = Voters::withFilters()
                                        ->select('voters.key',
                                                'voters.personal_identity',
                                                'voters.first_name',
                                                'voters.last_name' ,
                                                DB::raw('(CASE WHEN voters.city_id is null THEN voters.city
                                                            ELSE c.name END) as city'))
                                        ->withCity(true)
                                        ->withPhones()
                                        ->where('phone_number', 'like', $cleanSearchValue . '%')
                                        ->withCount('user')
                                        ->withCount('getRepresentativeDetails')
                                        ->withCount('crmRequests')
                                        ->groupBy('voters.personal_identity')
                                        ->limit(10 - count($voters))->get();
                        foreach ($votersWithPhone as $voterWithPhone) {
                            $voters->add($voterWithPhone);
                        }
                    }
                    $jsonOutput->setData($voters);
                    break;

                case 'request':
				    $cleanSearchValue = str_replace("-", "", $searchValue);
                    $requests = CrmRequest::select('requests.key', DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS voter_name')
                                            , DB::raw('CONCAT(unknown_voters.first_name, " ", unknown_voters.last_name) AS unknown_voter_name'))
                                    ->withVoter(TRUE)
                                    ->withTopic(FALSE)
                                    ->where('requests.deleted', '=', DB::raw(0))
                                    ->where(function($query) use ($cleanSearchValue) {
                                        if (preg_match('/^[0-9]+$/', $cleanSearchValue)) {
                                            $query->orWhere('requests.key', 'like', $cleanSearchValue . '%')
                                            ->orWhere('voters.personal_identity', 'like', $cleanSearchValue . '%')
                                            ->orWhere('unknown_voters.personal_identity', 'like', $cleanSearchValue . '%');
                                        } else {
                                            $valueArray = explode(' ', $cleanSearchValue);
                                            if (count($valueArray) == 1) {
                                                $query->orWhere('voters.first_name', 'like', $valueArray[0] . '%')
                                                ->orWhere('voters.last_name', 'like', $valueArray[0] . '%')
                                                ->orWhere('unknown_voters.first_name', 'like', $valueArray[0] . '%')
                                                ->orWhere('unknown_voters.last_name', 'like', $valueArray[0] . '%');
                                            } else {
                                                $query->orWhere([['voters.first_name', 'like', $valueArray[0] . '%'], ['voters.last_name', 'like', $valueArray[1] . '%']])
                                                ->orWhere([['unknown_voters.first_name', 'like', $valueArray[0] . '%'], ['unknown_voters.last_name', 'like', $valueArray[1] . '%']]);
                                            }
                                        }
                                    })->limit(10)->get();
							if ((preg_match('/^[0-9]+$/', $cleanSearchValue)) && (count($requests) < 10)) {
                                $requestsWithPhones = CrmRequest::select('requests.key', DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS voter_name')
                                            , DB::raw('CONCAT(unknown_voters.first_name, " ", unknown_voters.last_name) AS unknown_voter_name'))
                                    ->withVoter(TRUE)
                                    ->withTopic(FALSE)
                                    ->where('requests.deleted', '=', DB::raw(0))
                                    ->withPhones()
                                    ->where('phone_number', 'like', $cleanSearchValue . '%')
                                    ->limit(10 - count($requests))->get();
                                foreach ($requestsWithPhones as $requestWithPhones) {
                                   $requests->add($requestWithPhones);
                                }
                                
                            }
							
							if ((preg_match('/^[0-9]+$/', $cleanSearchValue)) && (count($requests) < 10)) {
                                $requestsWithUnknownVoterPhones = CrmRequest::select('requests.key' , DB::raw('CONCAT(voters.first_name, " ", voters.last_name) AS voter_name')
                                            , DB::raw('CONCAT(unknown_voters.first_name, " ", unknown_voters.last_name) AS unknown_voter_name'))
                                    ->withVoter(TRUE)
                                    ->withTopic(FALSE)
                                    ->where('requests.deleted', '=', 0)->withUnknownVoterPhones()->where('phone_number', 'like', $cleanSearchValue . '%')
                                        ->limit(10 - count($requests))->get();
                                         foreach ($requestsWithUnknownVoterPhones as $requestWithUnknownVoterPhones) {
                                           $requests->add($requestWithUnknownVoterPhones);
                                        }
                                
                            }

                    $jsonOutput->setData($requests);
                    break;
            }
        }
    }

}
