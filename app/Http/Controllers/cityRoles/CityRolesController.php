<?php

namespace App\Http\Controllers\polls;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;


class CityRolesController extends Controller
{
	/*
		Functions that renders the needed ui by cti URL
	*/
    public function index(Request $request)
    {

        //redirect to login if in maintenance
        $maintenance = config('app.maintenance');
        if ($maintenance) return Redirect::to('logout');

        //Set original url in session
        $originalRoute = $request->path();

        $request->session()->put('original_url', $originalRoute);
        //set base url, username, and csrf token for react
        $baseUrl = config('app.url');
        $data['secure'] = (stripos($baseUrl, 'https') === 0)? true : false;
        $baseUrl = str_replace("http://", "", $baseUrl);
        $baseUrl = str_replace("https://", "", $baseUrl);
        $baseUrl = str_replace(request()->server('SERVER_NAME'), "", $baseUrl);
        $baseUrl = str_replace(":" . request()->server('SERVER_PORT'), "", $baseUrl);
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();


        return view('/city_elections_roles', $data);
    }
}