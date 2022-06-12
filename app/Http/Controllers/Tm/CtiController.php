<?php

namespace App\Http\Controllers\Tm;

use App\API\Dialer;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Languages;
use App\Models\SupportStatus;
use App\Models\Tm\Campaign;
use App\Models\Tm\CtiVoter;
use App\Models\Tm\UserExtensions;
use App\Models\Tm\CampaignBreakTimes;
use App\Models\Tm\CampaignWaitingTimes;
use App\Models\ElectionCampaigns;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Barryvdh\Debugbar\Facade as Debugbar;

use App\Libraries\Helper;

use Redirect;

use JWT;

class CtiController extends Controller
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

    $key = config('jwt.secret');
    $jwtParams = array(
      "iss" => "https://shass.co.il",
      "aud" => "https://shass.co.il",
      "iat" => Carbon::now()->timestamp,
      "exp" => Carbon::now()->timestamp + 60 * 60 * 10,
      "sub" => Auth::user()->id,
      "laravel_session" => session()->getId(),
    );
    $token = JWT::encode($jwtParams, $key);

    //set base url, username, and csrf token for react
    $baseUrl = config('app.url');
    $data['secure'] = (stripos($baseUrl, 'https') === 0) ? true : false;
    $baseUrl = str_replace("http://", "", $baseUrl);
    $baseUrl = str_replace("https://", "", $baseUrl);
    $baseUrl = str_replace(request()->server('SERVER_NAME'), "", $baseUrl);
    $baseUrl = str_replace(":" . request()->server('SERVER_PORT'), "", $baseUrl);
    $data['baseURL'] = $baseUrl;
    $data['csrfToken'] = csrf_token();
    $data['reactCtiHash'] = Cache::get('react_cti_hash', '0');
    $data['websocketHost'] = env("WEBSOCKET_HOST") . ':' . env('WEBSOCKET_PORT', 8000);
    $data['websocketToken'] = $token;

    return view('/cti', $data);
  }

  /*
		Function that returns all needed lists - cities,support_statuses,languages
	*/
  public function getLists()
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign =  ElectionCampaigns::currentCampaign();

    $result = [
      'cities' => City::select('id as value', 'key as city_key', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get(),
      'support_statuses' => SupportStatus::select('id as value', 'name as label')
        ->where('election_campaign_id', $currentCampaign->id)
        ->where('deleted', 0)
        ->where('active', 1)
        ->orderBy('level', 'DESC')
        ->get(),
      'languages' => Languages::select(['id', 'key', 'name'])->where(['main' => 0, 'deleted' => 0])->get(),
      'questionTypeConst' => config('tmConstants.question.typeConst'),
    ];
    $jsonOutput->setData($result);
  }

  /*
		Function that returns cti-voter by key
	*/
  public function getVoter($key)
  {
    $jsonOutput = app()->make("JsonOutput");
    $result = CtiVoter::findByKey($key);
    $jsonOutput->setData($result);
  }

  /**
   * This function returns the user extenstion
   * from the datbase.
   * If the user doesn't have any extension, the
   * function adds an extension for the user.
   *
   * @return array
   */
  public function getDialerDetails($sipServerId = null, $sipServerIp = null)
  {

    $userId = Auth::user()->id;
    if ($sipServerId) {
      $serverId = $sipServerId;
      $serverIp = $sipServerIp;
    } else {
      $sipServer = Dialer::getMainSipServer();
      $serverId = $sipServer->id;
      $serverIp = $sipServer->ip;
    }

    // Get the user extenstion from table user_extenstions
    $userExtensionObj = UserExtensions::select(['dialer_user_id', 'password', 'extension_id'])
      ->where('user_id', $userId)
      ->where('sip_server_id', $serverId)
      ->first();
    if (is_null($userExtensionObj)) {

      // The user doesn't have any extension, so we create a new extesnion

      //get extesnion list from dialer and find max extenion number
      $currentExtensionList = Dialer::getExtensionList($serverIp);
      // Log::info('$currentExtensionList '. $serverIp);
      // Log::info(json_encode($currentExtensionList));

      $maxExtension = 0;
      foreach ($currentExtensionList as $extesnion) {
        if (intval($extesnion->user) > $maxExtension) $maxExtension = intval($extesnion->user);
      }
      //set new extension number (accroding to server id if no extension exists in the server)
      if ($maxExtension == 0) $maxDialerUserId = $serverId * 10000;
      else $maxDialerUserId = $maxExtension + 1;

      //add extension to the sip server
      Debugbar::addMessage("add user extension(inside get dialer details user id = $userId, server id = $serverId",  'call_log');

      $dialerDetailsObj = Dialer::addUserExtension($serverId, $serverIp, $userId, $maxDialerUserId);
    } else {
      $dialerDetailsObj = $userExtensionObj;
    }

    return $dialerDetailsObj;
  }

  /*
		Function that gets all campaigns data
	*/
  public function getCampaigns()
  {
    $jsonOutput = app()->make("JsonOutput");

    $fields = [
      'campaigns.id',
      'campaigns.key',
      'campaigns.name',
      'campaigns.description',
      'campaigns.activation_start_date',
      'campaigns.activation_end_date',
      'campaigns.outbound_campaign',
      'campaigns.telephone_predictive_mode',
      'sip_servers.key as sip_server_key',
    ];
    $user = Auth::user();
    $activeCampaignStatus = config('tmConstants.campaign.statusNameToConst.ACTIVE');
    $allUserActiveCampaigns = Campaign::select($fields)
      ->withUsersInCampaigns()
      ->where([
        'campaigns.status' => $activeCampaignStatus, 'campaigns.deleted' => 0,
        'users_in_campaigns.user_id' => $user->id, 'users_in_campaigns.active' => 1
      ])
      ->withSipServer()
      ->groupBy('campaigns.id')
      ->get()
      ->makeVisible([
        'average_call_action_time', 'average_call_time',
        'sum_user_call_action_time', 'last_user_call_date', 'sip_server_key'
      ]);
    // dd($allUserActiveCampaigns->toArray());

    $jsonOutput->setData($allUserActiveCampaigns);
  }

  /*
		Function that gets all extentions of users
	*/
  public function getExtension($campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    $dialerDetails = $this->getUserExtension($campaignKey, $jsonOutput);
    if (!$dialerDetails) {
      return;
    }
    $jsonOutput->setData($dialerDetails);
  }

  public  function getUserExtension($campaignKey, $jsonOutput)
  {
    $currentCampaign = Campaign::select(
      'campaigns.id',
      'sip_servers.id as sip_server_id',
      'sip_servers.ip as sip_server_ip',
      'sip_servers.name as sip_server_name',
      'sip_servers.key as sip_server_key'
    )
      ->withSipServer()->where('campaigns.key', $campaignKey)->first();

    if (is_null($currentCampaign)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return null;
    }
    if (is_null($currentCampaign->sip_server_ip)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_SIP_SERVER_NOT_DEFINED'));
      return null;
    }

    $dialerDetails = $this->getDialerDetails($currentCampaign->sip_server_id, $currentCampaign->sip_server_ip);
    $dialerDetails->server_name = $currentCampaign->sip_server_name;
    $dialerDetails->server_key = $currentCampaign->sip_server_key;
    /*if(strpos($request->path(), 'cti') !==  false){
        $redisObject = new \stdClass;
        $redisObject->action = "update_sip";
        $redisObject->laravel_session = session()->getId();
        $redisObject->sip_number = $dialerDetails->dialer_user_id;
        $redisObject->campaign_id = '';

        Redis::publish('system', json_encode($redisObject));
        }*/
    return $dialerDetails;
  }
  /**
   * This function assigns an extension to a campaign.
   *
   * @param $campaignKey
   */
  public function assignExtensionToCampaign(Request $request, $campaignKey)
  {
    Debugbar::addMessage("assign extension to campaign campaign key " . $campaignKey, 'call_log');
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign = Campaign::select('campaigns.id', 'sip_servers.id as sip_server_id', 'sip_servers.ip as sip_server_ip')
      ->withSipServer()->where('campaigns.key', $campaignKey)->first();

    if (is_null($currentCampaign)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }
    if (is_null($currentCampaign->sip_server_ip)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_SIP_SERVER_NOT_DEFINED'));
      return;
    }

    $onlyDialer = $request->input('only_dialer', false);

    $dialerDetails = $this->getDialerDetails($currentCampaign->sip_server_id, $currentCampaign->sip_server_ip);

    // add the extension to the campaign
    do {
      $response = Dialer::addQueueExtension($currentCampaign->sip_server_ip, $campaignKey, $dialerDetails->dialer_user_id);
    } while (!$response);

    /*if (!$onlyDialer) {
            $redisObject = new \stdClass;
            $redisObject->action = "update_campaign";
            $redisObject->laravel_session = session()->getId();
            $redisObject->campaign_id = $currentCampaign->id;

            Redis::publish('system', json_encode($redisObject));
        }*/

    $jsonOutput->setData('OK');
  }

  /*
     * This functions deleted an extension from a campaign
     */
  public function deleteExtensionFromCampaign(Request $request, $campaignKey)
  {
    Debugbar::addMessage("delete extension from campaign key= $campaignKey", 'call_log');
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign = Campaign::select('campaigns.id', 'sip_servers.id as sip_server_id', 'sip_servers.ip as sip_server_ip')
      ->withSipServer()->where('campaigns.key', $campaignKey)->first();

    if (is_null($currentCampaign)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }
    if (is_null($currentCampaign->sip_server_ip)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_SIP_SERVER_NOT_DEFINED'));
      return;
    }

    $onlyDialer = $request->input('only_dialer', false);

    $dialerDetails = $this->getDialerDetails($currentCampaign->sip_server_id, $currentCampaign->sip_server_ip);

    // remove the extension to the campaign
    do {
      Debugbar::addMessage("delete queue extension campaign key= $campaignKey, dialer details = $dialerDetails->dialer_user_id");
      $response = Dialer::deleteQueueExtension($currentCampaign->sip_server_ip, $campaignKey, $dialerDetails->dialer_user_id);
    } while (!$response);

    $jsonOutput->setData('OK');
  }

  /**
   * Add campaign break
   *
   * @param string $campaignKey
   * @return void
   */
  public function addCampaignBreak($campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign = Campaign::select('id')->where('key', $campaignKey)->first();
    if ($currentCampaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    $user = Auth::user();

    $campaignBreak = new CampaignBreakTimes;
    $campaignBreak->key = Helper::getNewTableKey('campaign_break_times', 10);
    $campaignBreak->campaign_id = $currentCampaign->id;
    $campaignBreak->user_id = $user->id;
    $campaignBreak->save();

    $jsonOutput->setData($campaignBreak->key);
  }

  /**
   * Update campaign break end date
   *
   * @param Request $request
   * @param string $breakKey
   * @return void
   */
  public function updateCampaignBreak(Request $request, $breakKey = null)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($breakKey) {
      $campaignBreak = CampaignBreakTimes::select('id')->where('key', $breakKey)->first();
      if ($campaignBreak == null) {
        $jsonOutput->setErrorCode(config('errors.tm.BREAK_DOES_NOT_EXIST'));
        return;
      }
      CampaignBreakTimes::where('id', $campaignBreak->id)->update([
        'end_date' => DB::raw("now()"),
        'total_seconds' => DB::raw("timestampdiff(second, created_at, now())")
      ]);
    } else {
      $campaignBreak = CampaignBreakTimes::select('id')
        ->where('user_id', Auth::user()->id)
        ->whereNull('end_date')
        ->orderBy('id', 'DESC')
        ->first();

      if ($campaignBreak) {
        CampaignBreakTimes::where('id', $campaignBreak->id)->update([
          'end_date' => DB::raw("now()"),
          'total_seconds' => DB::raw("timestampdiff(second, created_at, now())")
        ]);
      }
    }

    $jsonOutput->setData('');
  }

  /**
   * Add campaign waiting
   *
   * @param string $campaignKey
   * @return void
   */
  public function addCampaignWaiting($campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign = Campaign::select('id')->where('key', $campaignKey)->first();
    if ($currentCampaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    $user = Auth::user();

    $campaignWaitingTime = new CampaignWaitingTimes;
    $campaignWaitingTime->key = Helper::getNewTableKey('campaign_waiting_times', 10);
    $campaignWaitingTime->campaign_id = $currentCampaign->id;
    $campaignWaitingTime->user_id = $user->id;
    $campaignWaitingTime->save();

    $jsonOutput->setData($campaignWaitingTime->key);
  }

  /**
   * Update campaign waiting end date
   *
   * @param Request $request
   * @param string $waitingKey
   * @return void
   */
  public function updateCampaignWaiting(Request $request, $waitingKey = null)
  {
    $jsonOutput = app()->make("JsonOutput");

    if ($waitingKey) {
      $campaignWaitingTime = CampaignWaitingTimes::select('id')->where('key', $waitingKey)->first();
      if ($campaignWaitingTime == null) {
        $jsonOutput->setErrorCode(config('errors.tm.WAITING_DOES_NOT_EXIST'));
        return;
      }
    } else {
      $campaignWaitingTime = CampaignWaitingTimes::select('id')
        ->where('user_id', Auth::user()->id)
        ->whereNull('end_date')
        ->orderBy('id', 'DESC')
        ->first();
    }
    if ($campaignWaitingTime) {
      CampaignWaitingTimes::where('id', $campaignWaitingTime->id)->update([
        'end_date' => DB::raw("now()"),
        'total_seconds' => DB::raw("timestampdiff(second, created_at, now())")
      ]);
    }

    $jsonOutput->setData('');
  }
}
