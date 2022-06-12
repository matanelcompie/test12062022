<?php


namespace App\Http\Controllers;

use App\Libraries\Services\municipal\MunicipalQuartersService;
use App\Models\ActivistsTasksSchedule;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;

class ActivistsPaymentsController extends Controller
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
        
        $isProdEnv = env('DB_HOST') == config('app.production_db_ip', '10.192.138.3');
        
        $data['env'] = $isProdEnv ? 'production' : 'dev';
        $data['baseURL'] = $baseUrl;
        $data['csrfToken'] = csrf_token();
        $data['css'] = "shas.v2.css";

        return view('/activists-payments', $data);
    }


    // public static function getPresentsDayByType(Request $request,$type,$id=null,$filter_city=null){
       
    //     // try {
           
    //         $jsonOutput = app()->make("JsonOutput");
    //         $treeDashboardItems=MunicipalQuartersService::getMunicipalEntityActivistsSummery($type,$id,$filter_city);
    //         $jsonOutput->setData($treeDashboardItems); 

    //     // } catch (\Throwable $th) {
    //     //     //throw $th;
    //     // }
  

    // }

    //     public static function getPresentsDay(Request $request){
    //         $currentElectionCampaign = ElectionCampaigns::currentCampaign();
    //         $role_id=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
    //         $jsonOutput = app()->make("JsonOutput");
    //         $presets= round(ActivistsTasksSchedule::getPresentForTodayByRole($role_id,$currentElectionCampaign->id));
    //         $jsonOutput->setData($presets); 
    //     }
}
