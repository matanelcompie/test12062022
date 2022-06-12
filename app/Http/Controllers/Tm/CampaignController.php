<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\ActionController;
use App\API\Dialer;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Tm\GlobalController;
use App\Http\Controllers\Tm\CtiController;
use App\Http\Controllers\UserController;
use App\Libraries\Helper;
use App\Libraries\Services\CampaignService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\QuestionnaireService;
use App\Libraries\Services\ServicesModel\CallsService;
use App\Libraries\Services\VoterFilterQueryService;
use App\Libraries\Services\VoterFilterService;
use App\Models\ElectionCampaigns;
use App\Models\Languages;
use App\Models\LanguagesByUsers;
use App\Models\RolesByUsers;
use App\Models\UserRoles;
use App\Models\Modules;
use App\Models\SupportStatus;
use App\Models\Teams;
use App\Models\Tm\UserExtensions;
use App\Models\Tm\Call;
use App\Models\Tm\Campaign;
use App\Models\Tm\SimpleCampaign;
use App\Models\Tm\CampaignActiveTimes;
use App\Models\Tm\UsersInCampaigns;
use App\Models\Tm\CampaignBreakTimes;
use App\Models\Tm\CampaignWaitingTimes;
use App\Models\Tm\CampaignMessages;
use App\Models\Tm\CtiPermission;
use App\Models\Tm\Questionnaire;
use App\Models\Tm\FinishedVoter;
use App\Models\User;
use App\Models\UserPhones;
use App\Models\VoterFilter\VoterFilter;
use App\Models\Voters;
use App\Models\FinishedVotersInCampaign;
use App\Models\CallNote;
use App\Models\Tm\CallsLog;
use App\Models\Tm\TelemarketingVoterPhone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Redirect;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use ThatsUs\RedLock\Facades\RedLock;
use Barryvdh\Debugbar\Facade as Debugbar;
use App\Repositories\Tm\CampaignRepository;
use Mpdf\Tag\Th;

class CampaignController extends Controller
{

  private $errorMessageList = [
    'There is no reference key to delete element.',
    'There is no reference key to update element.',
    'There are missing data to update.',
    'submitted order is not valid.',
    'submitted keys are not valid.',
    'questionnaire belong to this campaign',
    'invalid operation'
  ];

  /*
		Function that returns all campaigns
	*/
  public function getCampaigns(Request $request)
  {
    try {
      $jsonOutput = app()->make("JsonOutput");

      if (!GlobalController::isActionPermitted('tm.campaigns') && !GlobalController::isActionPermitted('elections.reports.general')) {
        $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
        return;
      }

      $allCampaigns = [];

      if ($request->input("slim") == "1") {
        $allCampaigns = DB::select("select id , name , campaigns.key from campaigns where deleted=0");
      } else {
        $allCampaigns = Auth::user()->admin  ?
          CampaignRepository::getAll() :
          CampaignRepository::getAllByUser(Auth::user()->id);
      }

      $jsonOutput->setData($allCampaigns);
    } catch (\Throwable $th) {
      throw $th;
    }
  }
  /* Campaigns -> portions */

  public function getCampaignsPortions(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    if (!GlobalController::isActionPermitted('tm.campaigns')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    $campaignKey = $request->input('key', null);

    $allCampaignsPortions = Campaign::withPortions($campaignKey)->get()->makeVisible(['campaign_name', 'campaigns.id', 'portionKey']);

    $jsonOutput->setData($allCampaignsPortions);
  }

  /**
   * Get campaign by key
   *
   * @param string $key
   * @return void
   */
  public function getCampaign($key)
  {

    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //get campaign with seleted fields
    $campaign = Campaign::where('key', $key)
      ->with(['cti_permissions' => function ($query) {
        $query->select(
          'cti_permissions.key',
          'cti_permissions.name',
          'cti_permissions.label',
          'cti_permissions_in_campaigns.value'
        );
      }, 'messages' => function ($query) {
        $query->select(
          'key',
          'name',
          'file_name',
          'file_type',
          'link',
          'shareable',
          'order',
          'campaign_id',
          'active'
        )
          ->orderBy('order', 'ASC')
          ->where('deleted', 0);
      }])
      ->first();
    $campaign->transportation_coordination_phone = Helper::addHyphenToPhoneNumber($campaign->transportation_coordination_phone);

    $campaign->total_active_time_seconds = CampaignActiveTimes::selectRaw("sum(TIMESTAMPDIFF(SECOND, created_at , end_date)) as total_time")->where("campaign_id", $campaign->id)->first()->total_time;
    $jsonOutput->setData($campaign);
  }

  /*
		Function that deletes campaign by key
	*/
  public function deleteCampaign($key)
  {
    $jsonOutput = app()->make("JsonOutput");
    if ($key) {
      Campaign::findByKey($key)->delete();
      $jsonOutput->setData('');
    } else {
      $jsonOutput->setErrorMessage($this->errorMessageList[0]);
    }
  }

  /**
   * Update campaign
   *  Update campaign details in DB
   *  -> Check if details had been changed.
   *  -> Update dialer details for campaign.
   * @param Request $request - update details.
   * @param string $campaignKey - campaign key.
   * @return void
   */

  public function updateCampaign(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    if (!GlobalController::isActionPermitted('tm.campaign.edit')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    //check campaign exists
    $campaign = Campaign::findByKey($campaignKey);
    if ($campaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    $historyTopicName = 'tm.campaign.edit';

    $modelsList = [];
    $fieldsArray = [];


    //update cti_permissions, if exists
    $ctiPermissions = $request->input('cti_permissions', null);
    if ($ctiPermissions) {
      if (!is_array($ctiPermissions)) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_PARAMETER_IS_NOT_VALID'));
        return;
      }
      CampaignService::updateCtiPermissions($campaign, $ctiPermissions);
    }

    $parameters = [];

    $name = $request->input('name', null);
    if ($name) {
      $name = trim($name);
      if (strlen($name) <= 3) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_PARAMETER_IS_NOT_VALID'));
        $jsonOutput->setErrorData('name is wrong');
        return;
      } else {
        $parameters['name'] = $name;
        if ($name  != $campaign->name) {
          $fieldsArray[] = [
            'field_name' => 'name',
            'display_field_name' => config('history.Campaign.name'),
            'new_value' => $name,
            'old_value' => $campaign->name,
          ];
        }
      }
    }

    $generalElection = $request->input('general_election', null);
    if ($generalElection) {
      $generalElection = intval($generalElection);
      if ($generalElection != 1 && $generalElection != 2) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_PARAMETER_IS_NOT_VALID'));
        $jsonOutput->setErrorData('general_election is wrong');
        return;
      } else {
        $parameters['general_election'] = $generalElection;
        if ($campaign->general_election != $generalElection) {
          $fieldsArray[] = [
            'field_name' => 'general_election',
            'display_field_name' => config('history.Campaign.general_election'),
            'new_value' => ($generalElection == '1' ? '×›×œ×œ×™' : '×ž×§×•×ž×™'),
            'new_numeric_value' => $generalElection,
            'old_value' => ($campaign->general_election == '1' ? '×›×œ×œ×™' : '×ž×§×•×ž×™'),
            'old_numeric_value' => $campaign->general_election,
          ];
        }
      }
    }

    $scheduleStartDate = $request->input('scheduled_start_date', null);
    if ($scheduleStartDate != null) {
      if (!Helper::validateDate($scheduleStartDate, 'Y-m-d')) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_PARAMETER_IS_NOT_VALID'));
        $jsonOutput->setErrorData('scheduled_start_date is wrong');
        return;
      } else {
        $parameters['scheduled_start_date'] = $scheduleStartDate;
        if ($campaign->scheduled_start_date != $scheduleStartDate) {
          $fieldsArray[] = [
            'field_name' => 'scheduled_start_date',
            'display_field_name' => config('history.Campaign.scheduled_start_date'),
            'new_value' => $scheduleStartDate,
            'old_value' => $campaign->scheduled_start_date,
          ];
        }
      }
    }

    $scheduleEndDate = $request->input('scheduled_end_date', null);
    if ($scheduleEndDate) {
      if (!Helper::validateDate($scheduleEndDate, 'Y-m-d')) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_PARAMETER_IS_NOT_VALID'));
        $jsonOutput->setErrorData('scheduled_end_date is wrong');
        return;
      } else {
        $parameters['scheduled_end_date'] = $scheduleEndDate;
        if ($campaign->scheduled_end_date != $scheduleEndDate) {
          $fieldsArray[] = [
            'field_name' => 'scheduled_end_date',
            'display_field_name' => config('history.Campaign.scheduled_end_date'),
            'new_value' => $scheduleEndDate,
            'old_value' => $campaign->scheduled_end_date,
          ];
        }
      }
    }

    $departmentId = $request->input('department_id', false);
    if ($departmentId !== false) {
      $departmentId = ($departmentId == null) ? null : intval($departmentId);
      $parameters['team_department_id'] = $departmentId;
    }
    $ctiCampaignImportantDetails = [
      'transportation_coordination_phone',
      'email_body', 'email_topic', 'sms_message',
    ];
    $campaignDetailsChanged = false;
    // Get more parameters of the campaign for update.
    $campaignOptionalParams = [
      'status',
      'description',
      'user_role_id' => 'roleId',

      //Default cti details
      'transportation_coordination_phone', 'email_body',
      'email_topic', 'sms_message',

      //advanced settings
      'action_call_no_answer', 'max_return_call',  'single_voter_for_household', 'single_phone_occurrence', 'return_call_after',
      'scheduled_time_no_answer', 'telephone_predictive_mode', 'phone_number', 'sip_server_id', 'only_users_with_mobile'
    ];
    foreach ($campaignOptionalParams as $dbKey => $requestKey) {
      $key = is_int($dbKey) ? $requestKey : $dbKey;
      $value = $request->input($requestKey, null);
      if (isset($value)) {
        if (in_array($requestKey, $ctiCampaignImportantDetails)) { //Check if CTI parameters had changed
          $campaignDetailsChanged = true;
        }
        $parameters[$key] = $value;
        if ($key == "description") {
          if ($campaign[$key] != $value) {
            $historyTopicName = 'tm.campaign.general.edit';
            $fieldsArray[] = [
              'field_name' => $key,
              'display_field_name' => config('history.Campaign.' . $key),
              'new_value' => $value,
              'old_value' => $campaign[$key],
            ];
          }
        }
      }
    }
    $team_id = $request->input('team_id', null);
    if (!is_null($team_id) && $campaign->team_id != $team_id) {
      $parameters['team_id'] = $team_id;
    }


    $updateDialerData = [];
    $status = isset($parameters['status']) ? $parameters['status'] : null;
    //update Dialer API status, with campaign status
    if ($status && $campaign->status != $status) {
      $isActive = intval($status) == config('tmConstants.campaign.statusNameToConst.ACTIVE');
      $updateDialerData['active'] = $isActive;
    }
    $phone_number = isset($parameters['phone_number']) ? $parameters['phone_number'] : null;

    //remember the phone_number not change the phone number because its send with the voter phone ist
    //update Dialer API phone_number, with campaign phone_number
    if ($phone_number && $campaign->phone_number != $phone_number) {
      $updateDialerData['phone_number'] = $phone_number;
    }
    if (count($updateDialerData) > 0) {
      Dialer::updateQueueDialerProps($campaignKey, $updateDialerData);
    }

    //update campaign parameters
    if (count($parameters) > 0) {
      $campaign->update($parameters);

      //update campaign dates to user roles
      if ($scheduleStartDate || $scheduleEndDate) {
        RolesByUsers::where('campaign_id', $campaign->id)
          ->where('deleted', 0)
          ->update([
            'from_date' => $scheduleStartDate,
            'to_date' => $scheduleEndDate
          ]);
      }

      //update department id to user roles
      if ($departmentId !== false) {
        RolesByUsers::where('campaign_id', $campaign->id)
          ->where('team_id', $team_id)
          ->where('deleted', 0)
          ->update([
            'team_department_id' => $departmentId
          ]);
      }

      if (!is_null($team_id)) $this->addTeamUsersToCampaign($campaign, $team_id, $departmentId, $scheduleStartDate, $scheduleEndDate);
    }
    //Details for update redis that campaign changed:
    $ctiPermissionsChanged = !empty($ctiPermissions) ? true : false;
    $campaignDetailsChanged = [
      'ctiPermissions' => $ctiPermissionsChanged,
      'campaignDetails' => $campaignDetailsChanged,
      'questionnaire' => false,
    ];
    CampaignService::updateRedisCampaignDetailsChanged($campaign->id, $campaignDetailsChanged);

    if (count($fieldsArray) > 0) { //add updates history
      $modelsList[] = [
        'description' => '×¢×¨×™×›×ª ×§×ž×¤×™×™×Ÿ ×§×™×™×',
        'referenced_model' => 'TmCampaign',
        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
        'referenced_id' => $campaign->id,
        'valuesList' => $fieldsArray
      ];

      $historyArgsArr = [
        'topicName' => ($historyTopicName),
        'models' => $modelsList,
      ];

      ActionController::AddHistoryItem($historyArgsArr);
    }
    $jsonOutput->setData("ok");
  }

  private function addTeamUsersToCampaign($campaign, $teamId, $departmentId, $scheduleStartDate, $scheduleEndDate)
  {
    $tmModule = null;
    $tmRole = null;
    $startDate = ($scheduleStartDate) ? $scheduleStartDate : $campaign->scheduled_start_date;
    $endDate = ($scheduleEndDate) ? $scheduleEndDate : $campaign->scheduled_end_date;

    $UserController = new UserController;
    $teamUsers = User::select('id')
      ->whereHas('rolesByUsers', function ($query) use ($teamId) {
        $query->where('team_id', $teamId)
          ->where('deleted', 0);
      })
      ->withCount(['rolesByUsers' => function ($query) {
        $query->where('deleted', 0);
      }])
      ->get();
    // $teamUsers =  $UserController->getUsersByRoles([$teamId])
    // ->select('users.id')->get();
    $usersIds = [];
    foreach ($teamUsers as $user) {
      if (!$this->getUserInCampaign($campaign->id, $user->id)) {
        $newUserICampaign = new UsersInCampaigns;
        $newUserICampaign->key = Helper::getNewTableKey('users_in_campaigns', 5);
        $newUserICampaign->campaign_id = $campaign->id;
        $newUserICampaign->user_id = $user->id;
        $newUserICampaign->save();

        if (!$tmModule) $tmModule = Modules::select('id')
          ->where('system_name', config('tmConstants.campaign.employees.module'))
          ->first();

        if (!$tmRole) $tmRole = UserRoles::select('id')
          ->where('system_name', config('tmConstants.campaign.employees.userRole'))
          ->where('deleted', 0)
          ->first();

        $user->rolesByUsers()->create([
          'user_role_id'          => $tmRole->id,
          'team_id'               => $teamId,
          'team_department_id'    => ($departmentId !== false) ? $departmentId : $campaign->team_department_id,
          'from_date'             => $startDate,
          'to_date'               => $endDate,
          'main'                  => ($user->roles_by_users_count > 0) ? 0 : 1,
          'campaign_id'           => $campaign->id
        ]);
      }
    }
  }

  /*
		Function that adds campaign by POST params
	*/
  public function addCampaign(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaigns.add')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    //default params for cti permissions:

    $campaign = Campaign::create($request->all());
    $permissionFields = [
      'key',
      'name',
      'type',
    ];
    $emptyArr = ['cti.activity_area.transportation.phone_coordinate', 'cti.activity_area.messages'];
    //get cti permissions
    $ctiPermissions = CtiPermission::select($permissionFields)
      ->orderBy('name')
      ->get();
    foreach ($ctiPermissions as $ctiPermission) {
      $value = $ctiPermission->type == 0 ? 1 : 2;
      if (in_array($ctiPermission->name, $emptyArr)) {
        $value = 0;
      }
      $ctiPermission->value = $value;
    }
    CampaignService::updateCtiPermissions($campaign, $ctiPermissions->toArray());

    $modelsList = [];
    $fieldsArray = [];
    foreach ($request->all() as $key => $value) {
      if ($key == "general_election") {
        $fieldsArray[] = [
          'field_name' => 'general_election',
          'display_field_name' => config('history.Campaign.general_election'),
          'new_value' => ($value == '1' ? '×›×œ×œ×™' : '×ž×§×•×ž×™'),
          'new_numeric_value' => $value
        ];
      } else {
        $fieldsArray[] = [
          'field_name' => $key,
          'display_field_name' => config('history.Campaign.' . $key),
          'new_value' => $value
        ];
      }
    }

    $modelsList[] = [
      'description' => '×”×•×¡×¤×ª ×§×ž×¤×™×™×Ÿ ×—×“×©',
      'referenced_model' => 'TmCampaign',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $campaign->id,
      'valuesList' => $fieldsArray
    ];

    $historyArgsArr = [
      'topicName' => ('tm.campaigns.add'),
      'models' => $modelsList,
    ];

    ActionController::AddHistoryItem($historyArgsArr);

    // dump($ctiPermissions);
    $jsonOutput->setData($campaign->fresh());
  }

  /*
		Function that returns a questionare of campaign by campaign key
	*/
  public function getQuestionnaire($key)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    $campaign = SimpleCampaign::where('key', $key)->first();
    $questionnaire = CampaignRepository::questionnaire($campaign->id);
    $jsonOutput->setData($questionnaire);
  }

  /*
		Function that returns a questionare + campaign data by campaign key
	*/
  public function getQuestionnaireFull($key)
  {
    $jsonOutput = app()->make("JsonOutput");
    $campaign = Campaign::where('key', $key)->first();
    $questionnaire = $campaign->Questionnaire;
    $jsonOutput->setData(['questionnaire' => $questionnaire, 'campaignData' => $campaign]);
  }

  /*
		Function that returns all inactive questionairs of campaign , by campaign key
	*/
  public function getInactiveQuestionnaires($key)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $questionnaires = Campaign::findByKey($key)->inactive_questionnaires()
      ->compact()->get()->makeHidden('questions');
    $jsonOutput->setData($questionnaires);
  }

  /*
		Function that gets as parameter a campaign key ,
		and returns all questionairs that DO NOT belong to that campaign
	*/
  public function getOtherQuestionnaires($key)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $campaign = Campaign::findByKey($key);
    $otherQuestionnaires = Questionnaire::where('campaign_id', '!=', $campaign->id)
      ->compact()->get()->makeHidden('questions');

    $jsonOutput->setData($otherQuestionnaires);
  }

  /*
		Function that gets campaign key and questionaire key , and create a copy of
		that questionaire into the given campaign
	*/
  public function copyQuestionnaire($campaignKey, $questionnaireKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add') && !GlobalController::isActionPermitted('tm.campaign.questionnaire.edit')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $campaign = Campaign::findByKey($campaignKey);
    //get current campaign and support status
    $currentElectionCampaign = ElectionCampaigns::currentCampaign();
    $currentSupportStatuses = SupportStatus::where([
      'election_campaign_id' => $currentElectionCampaign->id,
      'deleted' => 0,
      'active' => 1
    ])
      ->pluck('id')->toArray();
    $questionnaire = Questionnaire::findByKey($questionnaireKey);
    if ($questionnaire->campaign->id != $campaign->id) {
      $questionnaireArray = $questionnaire->toArray();
      unset($questionnaireArray['questions']);
      // dd($questionnaireArray);
      $newQuestionnaire = $campaign->questionnaire()->create($questionnaireArray);
      $newQuestionnaire->active = 1;
      $newQuestionnaire->save();
      QuestionnaireService::copyQuestionsToQuestionnaire($questionnaire->questions, $newQuestionnaire->id, $currentSupportStatuses);

      CampaignService::updateRedisCampaignQuestionnaireChanged($campaign->id, $questionnaire->active);

      $modelsList = [];
      $fieldsArray = [];

      $fieldsArray[] = [
        'field_name' => 'name',
        'display_field_name' => config('history.CampaignQst.name'),
        'new_value' => $questionnaire->name
      ];

      $fieldsArray[] = [
        'field_name' => 'description',
        'display_field_name' => config('history.CampaignQst.description'),
        'new_value' => $questionnaire->description
      ];

      $modelsList[] = [
        'description' => '×”×•×¡×¤×ª ×©××œ×•×Ÿ ×—×“×© ×œ×§×ž×¤×™×™×Ÿ TM ×ž×©××œ×•×Ÿ ×§×™×™×',
        'referenced_model' => 'TmCampaignQuestionnaire',
        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
        'referenced_id' => $newQuestionnaire->id,
        'valuesList' => $fieldsArray
      ];

      $historyArgsArr = [
        'topicName' => ('tm.campaign.questionnaire.add'),
        'models' => $modelsList,
      ];

      ActionController::AddHistoryItem($historyArgsArr);


      $jsonOutput->setData($newQuestionnaire->fresh());
    } else {
      $jsonOutput->setErrorMessage($this->errorMessageList[5]);
    }
  }

  public function getPortionsProgress($campaignId)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $result = CampaignRepository::campaignPortionProgress($campaignId);
      $jsonOutput->setData($result->first());
    } catch (\Throwable $th) {
      $jsonOutput->setErrorMessage($this->errorMessageList[6] . " " . $th->getMessage());
    }
  }

  public function getCampaignUserCount($campaignId)
  {
    $jsonOutput = app()->make("JsonOutput");
    try {
      $usersCountInCampaign = UsersInCampaigns::usersCountInCampaign($campaignId)->first();
      $onlineUsersCount = Campaign::onlineUsersCount($campaignId);
      $jsonOutput->setData(
        [
          'user_count' => $usersCountInCampaign ? $usersCountInCampaign->users_count : $usersCountInCampaign,
          'online_users_count' => $onlineUsersCount
        ]
      );
    } catch (\Throwable $th) {
      $jsonOutput->setErrorMessage($this->errorMessageList[6] . "-> " . $th->getMessage());
    }
  }

  /*
		Function that returns all portion of specific campaign
	*/
  public function getPortions(Request $request, $key)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.portions')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $campaignID = Campaign::select('id')->where('key', $key)->first();
    if (!$campaignID) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }
    $campaignID = $campaignID->id;


    $portions = VoterFilter::where('entity_type', 1)->where('entity_id', $campaignID)
      ->withCount('calls')
      ->withCount('answeredCalls')
      ->get();

    $portionsWaitingUsersHashArray = [];
    $keys = Redis::keys('tm:campaigns:' . $campaignID . ':waiting_phones:*');
    for ($i = 0; $i < sizeof($keys); $i++) {
      $tempArray = Redis::mget("" . $keys[$i]);
      if ($tempArray) {
        $tempJson = json_decode($tempArray[0]);
        if (isset($tempJson->portion_id)) {
          if (!array_key_exists($tempJson->portion_id, $portionsWaitingUsersHashArray)) {
            $portionsWaitingUsersHashArray[$tempJson->portion_id] = 0;
          }
          $portionsWaitingUsersHashArray[$tempJson->portion_id]++;
        }
      }
    }
    $returnedArray = [];
    for ($i = 0; $i < sizeof($portions); $i++) {
      $portions[$i]->sent_to_dialer = 0;
      $portions[$i]->answered_percentage = 0;
      if ($portions[$i]->answered_calls_count && $portions[$i]->calls_count) {
        $portions[$i]->answered_percentage = (intval($portions[$i]->answered_calls_count) * 100) / intval($portions[$i]->calls_count);
        $portions[$i]->answered_percentage = round($portions[$i]->answered_percentage * 100) / 100;
      }
      if (isset($portions[$i]->id) && array_key_exists($portions[$i]->id, $portionsWaitingUsersHashArray)) {
        $portions[$i]->sent_to_dialer = $portionsWaitingUsersHashArray[$portions[$i]->id];
      }
    }

    $jsonOutput->setData($portions);
  }

  public function addQuestionnaire(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    if (!$request->input('name')) {
      $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_DETAILS'));
      return;
    }
    $campaign = Campaign::findByKey($campaignKey);
    $questionnaire = $campaign->questionnaire()->create($request->all());
    CampaignService::updateRedisCampaignQuestionnaireChanged($campaign->id, true);

    $modelsList = [];
    $fieldsArray = [];
    foreach ($request->all() as $key => $value) {
      if ($value) {
        $fieldsArray[] = [
          'field_name' => $key,
          'display_field_name' => config('history.CampaignQst.' . $key),
          'new_value' => $value
        ];
      }
    }

    $modelsList[] = [
      'description' => '×”×•×¡×¤×ª ×©××œ×•×Ÿ ×—×“×© ×œ×§×ž×¤×™×™×Ÿ TM',
      'referenced_model' => 'TmCampaignQuestionnaire',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $questionnaire->id,
      'valuesList' => $fieldsArray
    ];

    $historyArgsArr = [
      'topicName' => ('tm.campaign.questionnaire.add'),
      'models' => $modelsList,
    ];

    ActionController::AddHistoryItem($historyArgsArr);

    $jsonOutput->setData(Campaign::findByKey($campaignKey)->questionnaire);
  }

  /*
		Function that updates portions of specific campaign by POST data and campaign key
	*/
  public function updatePortions(Request $request, $currentCampaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.portions.edit')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    $portionsOrederList = $request->all();
    $portionIdList = [];
    foreach ($portionsOrederList as $portion) {
      $portionIdList[] = $portion['id'];
    }
    $campaign = Campaign::select('id', 'current_portion_id')
      ->with(['portions' => function ($query) {
        $query->orderBy('order');
      }])
      ->where('key', $currentCampaignKey)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
      return;
    }
    //Check if can edit all portions:
    $allowToEdit = VoterFilterService::checkIfCanEditPortion($campaign, $portionIdList);
    if (!$allowToEdit) {
      $jsonOutput->setErrorCode(config('errors.tm.NOT_ALLOW_TO_EDIT_PORTION'));
      return;
    }
    VoterFilterService::massUpdate($portionsOrederList);
    $jsonOutput->setData($campaign->portions);
  }

  /*
		Function that gets as parameter campaign portions and campaign key ,
		and copies all that portions for the campaign
	*/
  public function copyPortions(Request $request, $key)
  {
    $jsonOutput = app()->make("JsonOutput");
    $portionKey = $request->input('portionKey', null);
    $VoterFilterToCopy = VoterFilter::findByKey($portionKey)->makeVisible('entity_type', 'entity_id');

    $campaignData = Campaign::select('id')
      ->where('key', $key)->first();

    $uid = Auth::user()->id;

    if (!GlobalController::isActionPermitted('tm.campaign.portions.add')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }
    if (!$campaignData) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
    }
    if (!$VoterFilterToCopy) {
      $jsonOutput->setErrorCode(config('errors.tm.VOTER_DOES_NOT_EXIST'));
    }
    $lastFilter =  VoterFilter::select('order')
      ->where(['entity_type' => 1, 'entity_id' => $campaignData->id])
      ->orderBy('order', 'desc')->first();
    $lastFilterRaw  = $lastFilter ? $lastFilter->order  : 0;
    $data = [
      'name' => $VoterFilterToCopy->name,
      'order' => $lastFilterRaw + 1,
      'user_create_id' => $uid,
      'active' => true,
      'entity_type' => $VoterFilterToCopy->entity_type,
      'entity_id' => $campaignData->id,
    ];
    $newVoterFilter = VoterFilter::create($data);

    if (!empty($VoterFilterToCopy->filter_items)) {
      VoterFilterService::copyFiltersItems($VoterFilterToCopy->filter_items, $newVoterFilter, 'filter_item');
    }
    if (!empty($VoterFilterToCopy->geo_items)) {
      VoterFilterService::copyFiltersItems($VoterFilterToCopy->geo_items, $newVoterFilter, 'geo_item');
    }
    $newVoterFilter->update($data);

    $modelsList = [];
    $fieldsArray = [];
    $fieldsArray[] = [
      'field_name' => 'name',
      'display_field_name' => config('history.CampaignPortions.name'),
      'new_value' => $newVoterFilter->name
    ];
    $fieldsArray[] = [
      'field_name' => 'items',
      'display_field_name' => config('history.CampaignPortions.items'),
      'new_value' => json_encode($newVoterFilter->voter_filter_items())
    ];

    $modelsList[] = [
      'description' => '×”×¢×ª×§×ª ×ž× ×” ×§×™×™×ž×ª',
      'referenced_model' => 'TmCampaignPortion',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $newVoterFilter->id,
      'valuesList' => $fieldsArray
    ];

    $historyArgsArr = [
      'topicName' => ('tm.campaign.portions.add'),
      'models' => $modelsList,
    ];
    ActionController::AddHistoryItem($historyArgsArr);


    $jsonOutput->setData($newVoterFilter);
  }
  public function addManualNextVoterCall(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $campaign = Campaign::select('id')
      ->where('key', $campaignKey)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
      return;
    }

    $votersPhones = $this->getVoterPhones($request, $campaignKey, true, 1);
    if (is_null($votersPhones)) {
      $jsonOutput->setErrorCode(config('errors.system.PHONE_ID_MISSING'));
      return;
    }

    $jsonOutput->setData($votersPhones);
  }
  /**
   * Get voters from campaign portions, process them to waiting voters list
   * and return array of phones
   */
  public function getVoterPhones(Request $request, $key, $isManual = false, $manualPhoneCount = null)
  {
    Debugbar::startMeasure("get_voter_phones");
    Debugbar::addMessage('get voter phones request phone count->' . $request->input('phone_count', 10) . " ,campaign key=" . $key, 'call_log');
    //set reading from master
    $master = DB::connection('master')->getPdo();
    DB::setReadPdo($master);

    $jsonOutput = app()->make("JsonOutput");

    $phoneCount = !is_null($manualPhoneCount) ? $manualPhoneCount : $request->input('phone_count', 10);

    //set phone count up to 10000
    if (!is_int($phoneCount)) $phoneCount = intval($phoneCount);
    if ($phoneCount > 10000) $phoneCount = 10000;
    // Log::info('phoneCount'. $phoneCount);

    //campaign fields
    $campaignFields = [
      'id',
      'status',
      'current_portion_id',
      'finished_portions',
      'telephone_predictive_mode',
      'phone_number'
    ];

    //get tm campaign
    $campaign = Campaign::select($campaignFields)
      ->where('key', $key)
      ->first();

    if (!$campaign) {
      CampaignService::saveVoterPhonesLog(null, $phoneCount, config('errors.tm.CAMPAIGN_KEY_IS_WRONG'));
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_KEY_IS_WRONG'));
      Debugbar::stopMeasure("get_voter_phones");
      return null;
    }
    if ($campaign->status != config('tmConstants.campaign.statusNameToConst.ACTIVE')) { // Is campaign not ready
      CampaignService::saveVoterPhonesLog(null, $phoneCount, config('errors.tm.CAMPAIGN_IS_PREDICTIVE'));
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_IS_MANUAL'));
      Debugbar::stopMeasure("get_voter_phones");
      return null;
    }
    if (!$isManual && $campaign->telephone_predictive_mode == Campaign::MANUAL_MODE) { // Is manual campaign mode
      CampaignService::saveVoterPhonesLog(null, $phoneCount, config('errors.tm.CAMPAIGN_IS_PREDICTIVE'));
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_IS_DELAYED'));
      Debugbar::stopMeasure("get_voter_phones");
      return null;
    }
    //check if not already running on campaign and lock resource
    $campaignLoadingKey = 'tm:campaigns:' . $campaign->id . ':loading_voters';
    $lockToken = RedLock::lock($campaignLoadingKey, 10000);
    if (!$lockToken) {
      CampaignService::saveVoterPhonesLog(null, $phoneCount, config('errors.tm.CAMPAIGN_CURRENTLY_LOADING_VOTERS'));
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_CURRENTLY_LOADING_VOTERS'));
      Debugbar::stopMeasure("get_voter_phones");
      return null;
    }

    //set voters collection
    $voters = new \Illuminate\Support\Collection;
    //get redial voters
    $voters = $voters->merge(CampaignService::getRedialVoters($phoneCount, $campaign->id));

    //if request count limit is reached return voters phones list
    if (count($voters) == $phoneCount) {
      $voterPhones = CampaignService::getPhonesFromVoters($voters, $campaign->id);
      // Log::info('getPhonesFromVoters');
      // Log::info(json_encode($voterPhones));
      //add caller phone number to voter phones
      $voterPhones = CampaignService::addCallerPhoneToVoterPhonesList($voterPhones, $campaign->phone_number);
      CampaignService::saveVoterPhonesLog($campaign->id, $phoneCount, $voterPhones);
      $jsonOutput->setData($voterPhones);
      //remove lock
      RedLock::unlock($lockToken);
      Debugbar::stopMeasure("get_voter_phones");
      return $voterPhones;
    }

    //if finished loading voters from voter phones table return voters phones list
    if ($campaign->finished_portions) {
      $voterPhones = CampaignService::getPhonesFromVoters($voters, $campaign->id);
      //add caller phone number to voter phones
      $voterPhones = CampaignService::addCallerPhoneToVoterPhonesList($voterPhones, $campaign->phone_number);
      CampaignService::saveVoterPhonesLog($campaign->id, $phoneCount, $voterPhones);
      $jsonOutput->setData($voterPhones);

      //remove lock
      RedLock::unlock($lockToken);
      Debugbar::stopMeasure("get_voter_phones");
      return $voterPhones;
    }

    //load remaining voter count from voter phones table
    $leftVotersCount = $phoneCount - count($voters);
    $staticVoters = CampaignService::getStaticVoterPhones($campaign, $leftVotersCount);

    //if portion list is finised, update campaign
    if (count($staticVoters) < $leftVotersCount) {
      // $campaign->finished_portions = 1;
      $campaign->save();
    }

    $voters = $voters->merge($staticVoters);

    //generate voters phones list and return it, also sets voters in awating list
    $votersPhones = CampaignService::getPhonesFromVoters($voters, $campaign->id);
    //add caller phone number to voter phones
    $votersPhones = CampaignService::addCallerPhoneToVoterPhonesList($votersPhones, $campaign->phone_number);
    CampaignService::saveVoterPhonesLog($campaign->id, $phoneCount, $votersPhones);
    $jsonOutput->setData($votersPhones);
    //remove lock
    RedLock::unlock($lockToken);
    Debugbar::stopMeasure("get_voter_phones");
    return $votersPhones;
  }

  /**
   *Helper function to get next portion from campaign
   */

  public function getNextPortion($campaign, $currentPortion)
  {
    $portions = $campaign->portions;
    $current_portion_id = $campaign->current_portion_id;
    $portionsCount = count($portions);

    if ($portionsCount == 0) {
      return null;
    }

    if ($currentPortion == null) {
      if ($current_portion_id == null) {
        return $this->getNextActivePortion(0, $portions);
      } else {
        foreach ($portions as $index => $portion) {
          if ($portion->id == $current_portion_id) {
            return $this->getNextActivePortion($index, $portions);
          }
        }
      }
      return null;
    } else {
      foreach ($portions as $index => $portion) {
        if ($portion->id == $currentPortion->id) {
          if ($portionsCount == $index + 1) { //If arrive to end of portions
            return null;
          } else {
            return $this->getNextActivePortion($index + 1, $portions);
          }
        }
      }
      return null;
    }
  }
  /** Return next active portion */
  private function getNextActivePortion($startIndex, $portions)
  {
    $portionsCount = count($portions);

    for ($i = $startIndex; $i < $portionsCount; $i++) {
      if ($portions[$i]->active == 1) {
        return $portions[$i];
      }
    }
    return null;
  }

  public function addNewCall(Request $request, $campaignKey)
  {
    $callData = [
      'sip_number' => $request->input('sip_number', null),
      'phone_id' => $request->input('phone_id', null),
      'sip_server_key' => $request->input('sip_server_key', null),
      'status' => $request->input('status', null),
    ];
    $this->addNewVoterCall($callData, $campaignKey);
  }
  /**
   *Add new call from dialer API
   */
  private function addNewVoterCall($callData, $campaignKey)
  {
    Debugbar::addMessage("addNewVoterCall campaign key = " . $campaignKey . " sip number " . $callData['sip_number'], 'call');
    $jsonOutput = app()->make("JsonOutput");

    $sipNumber = $callData['sip_number'];
    $voterPhoneId = $callData['phone_id'];
    $sipServerKey = $callData['sip_server_key'];
    $status = $callData['status'];

    if (($voterPhoneId) && (!is_int($voterPhoneId))) $voterPhoneId = intval($voterPhoneId);
    if ($sipServerKey == '') $sipServerKey = null;

    if ($sipNumber == null) {
      $user = Auth::user();
      if ($user) {
        $userExtension = UserExtensions::select([
          'id',
          'dialer_user_id'
        ])
          ->where('user_id', $user->id)
          ->first();
        if ($userExtension) $sipNumber = $userExtension->dialer_user_id;
      }
    }

    //get campaign
    $campaign = $this->getCampaignByKey($campaignKey);
    if ($campaign == null) {
      CampaignService::saveNewCallLog(null, $sipNumber, $voterPhoneId, $status, config('errors.tm.CAMPAIGN_KEY_IS_WRONG'));
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_KEY_IS_WRONG'));
      return;
    }

    //validate input
    if ($voterPhoneId == null) {
      CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.PHONE_ID_MISSING'));
      $jsonOutput->setErrorCode(config('errors.tm.PHONE_ID_MISSING'));
      return;
    }
    // Log::info('$sipServerKey-'. $sipServerKey . '----' . $voterPhoneId. '----'. $status);
    //if status != 0 the call is not open
    if ($status) {

      //switch on status
      switch ($status) {
        case config('tmConstants.call.status.SUCCESS'):
          break;

          //call needs to be redialed
        case config('tmConstants.call.status.ANSWERING_MACHINE'):
        case config('tmConstants.call.status.GOT_MARRIED'):
        case config('tmConstants.call.status.CHANGED_ADDRESS'):
        case config('tmConstants.call.status.FAX_TONE'):
        case config('tmConstants.call.status.HANGED_UP'):
        case config('tmConstants.call.status.WRONG_NUMBER'):
        case config('tmConstants.call.status.BUSY'):
        case config('tmConstants.call.status.DISCONNECTED_NUMBER'):
        case config('tmConstants.call.status.UNANSWERED'):
        case config('tmConstants.call.status.ABANDONED'):

          //get waiting voter
          $voter = CampaignService::getAwaitingVoterFromRedis($campaign->id, $voterPhoneId);
          if ($voter == null) {
            CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.PHONE_ID_WRONG'));
            $jsonOutput->setErrorCode(config('errors.tm.PHONE_ID_WRONG'));
            return;
          }
          //create new call
          $call = new Call;
          $call->voter_id = $voter->id;
          $call->phone_number = $voter->current_phone->phone_number;
          $call->questionnaire_id = $campaign->questionnaire->id;
          $call->campaign_id = $campaign->id;
          $call->portion_id = $voter->portion_id;
          $call->call_end_status = $status;
          $call->save();
          Debugbar::addMessage("new call added campaign key " . $campaign->key . ' phone number ' . $call->phone_number . ' status ' . $status, 'call_log');

          //remove current phone if can't be used
          if (($status == config('tmConstants.call.status.GOT_MARRIED')) ||
            ($status == config('tmConstants.call.status.CHANGED_ADDRESS')) ||
            ($status == config('tmConstants.call.status.WRONG_NUMBER')) ||
            ($status == config('tmConstants.call.status.DISCONNECTED_NUMBER'))
          ) {
            $wrongNumber = true;
          } else {
            $wrongNumber = false;
          }
          // phone fax ton status
          if ($status == config('tmConstants.call.status.FAX_TONE')) {
            $callViaTm = false;
          } else {
            $callViaTm = true;
          }
          // Phone hanged up status
          if ($status == config('tmConstants.call.status.HANGED_UP')) {
            $sameNumber = true;
          } else {
            $sameNumber = false;
          }

          $updatedPhones = false;

          //add voter to redial
          try {
            CampaignService::setVoterToRedial(
              $campaign,
              $voter,
              $voterPhoneId,
              $status,
              $wrongNumber,
              $callViaTm,
              $sameNumber,
              $updatedPhones
            );
          } catch (\Throwable $th) {
            //throw $th;
          }

          CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, '');
          $jsonOutput->setData('');
          return;
          break;

          //call need to be redial without phone iteration and without creating new call
          /*
                case config('tmConstants.call.status.ABANDONED'):

                    //get waiting voter
                    $voter = CampaignService::getAwaitingVoterFromRedis($campaign->id, $voterPhoneId);
                    if ($voter == null) {
                        CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.PHONE_ID_WRONG'));
                        $jsonOutput->setErrorCode(config('errors.tm.PHONE_ID_WRONG'));
                        return;
                    }

                    //add voter to redial without iteration phone numbers
                    $now = Carbon::now();
                    CampaignService::setCallbackToVoter($campaign->id, $voter, $now, $status);
                    CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, '');
                    $jsonOutput->setData('');
                    return;
                    break;
                */
          //error in status
        default:
          CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.CALL_STATUS_WRONG'));
          $jsonOutput->setErrorCode(config('errors.tm.CALL_STATUS_WRONG'));
          return;
          break;
      }
    }

    //from here the call is a new open call
    if ($sipNumber == null) {
      CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.SIP_NUMBER_MISSING'));
      $jsonOutput->setErrorCode(config('errors.tm.SIP_NUMBER_MISSING'));
      return;
    }

    if (intval($sipNumber) <= 0) {
      CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.SIP_NUMBER_MISSING'));
      $jsonOutput->setErrorCode(config('errors.tm.SIP_NUMBER_WRONG'));
      return;
    }

    //get userId from sip number via redis
    $sipUser = Redis::hgetAll('tm:sip_numbers:' . $sipNumber);

    if ($sipUser == null) {
      CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.SIP_NUMBER_MISSING'));
      $jsonOutput->setErrorCode(config('errors.tm.SIP_NUMBER_WRONG'));
      return;
    }

    //get waiting voters list
    $voter = CampaignService::getAwaitingVoterFromRedis($campaign->id, $voterPhoneId);
    $voterJson = json_encode($voter);

    if ($voter == null) {
      CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, config('errors.tm.PHONE_ID_WRONG'));
      $jsonOutput->setErrorCode(config('errors.tm.PHONE_ID_WRONG'));
      return;
    }

    //create new call
    if ($voter != null) {
      $call = new Call;
      $call->user_id = $sipUser['user_id'];
      $call->voter_id = $voter->id;
      $call->phone_number = $voter->current_phone->phone_number;
      $call->questionnaire_id = $campaign->questionnaire->id;
      $call->campaign_id = $campaign->id;
      $call->portion_id = $voter->portion_id;
      $call->sip_server_key = $sipServerKey;
      $call->save();
    }

    //add call and voter info to active calls
    if (!empty($voter->current_phone)) {
      Redis::del("tm:campaigns:$campaign->id:waiting_phones:" . $voter->current_phone->id);
    }
    Redis::set('tm:campaigns:' . $campaign->id . ':active_calls:' . $call->id, $voterJson);

    //send call and voter info to CTI via redis and websocket
    $redisObject = new \stdClass;
    $redisObject->action = "new_call";
    $redisObject->sip_number = $sipNumber;
    $redisObject->call_key = $call->key;
    $redisObject->call_id = $call->id;
    $redisObject->voter_data = $voter;

    Redis::publish('system', json_encode($redisObject));

    //return call key
    $returnObject = new \stdClass;
    $returnObject->call_key = $call->key;

    CampaignService::saveNewCallLog($campaign->id, $sipNumber, $voterPhoneId, $status, $returnObject);
    $jsonOutput->setData($returnObject);
  }

  /**
   *Get campaign by key
   */

  public function getCampaignByKey($campaignKey)
  {
    return Campaign::select('id', 'action_call_no_answer', 'max_return_call',  'single_voter_for_household', 'single_phone_occurrence', 'only_users_with_mobile', 'return_call_after', 'scheduled_time_no_answer')
      ->with(['questionnaire' => function ($query) {
        $query->select('id', 'campaign_id');
      }])
      ->where('key', $campaignKey)->first();
  }

  /*
		Function that gets campaignKey as parameter , and returns all its messages
	*/
  public function getCampaignFiles($campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $currentCampaign = Campaign::select('id')->where('key', $campaignKey)->first();
    if ($currentCampaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    $fields = ['id', 'key', 'name', 'file_name', 'file_type', 'link', 'shareable', 'share_key', 'order'];
    $where = [
      'campaign_id' => $currentCampaign->id,
      'deleted' => 0,
      'active' => 1,
    ];
    $campaignFiles = CampaignMessages::select($fields)->where($where)->orderBy('order')->get();

    $jsonOutput->setData($campaignFiles);
  }

  /**
   * This function downloads or displays a sharable file
   * which can be viewd by everyone.
   *
   * @param $fileKey
   * @return mixed
   */
  public function downloadSharedFile($fileKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);

    $fields = ['id', 'name', 'file_name', 'file_type'];

    $fileObj = CampaignMessages::select($fields)->where('share_key', $fileKey)->first();
    if ($fileObj == null) {
      return Redirect::to('file_not_found');
    }

    if (!FileService::checkFileExists(config('tmConstants.campaign.messages.FILE_DIRECTORY'), $fileObj->file_name)) {
      return Redirect::to('file_not_found');
    }

    FileService::downloadFile(
      config('tmConstants.campaign.messages.FILE_DIRECTORY'),
      $fileObj->file_name,
      $fileObj->name,
      $fileObj->file_type
    );
  }

  /**
   * This function displays or downloads a file
   * that can be viewd only by Shas system.
   *
   * @param $fileKey
   * @return mixed     *
   */
  public function downloadFile($fileKey)
  {
    $jsonOutput = app()->make("JsonOutput");
    $jsonOutput->setBypass(true);

    $fields = ['id', 'name', 'file_name', 'file_type'];
    $fileObj = CampaignMessages::select($fields)->where('key', $fileKey)->first();
    if ($fileObj == null) {
      return Redirect::to('file_not_found');
    }

    if (!FileService::checkFileExists(config('tmConstants.campaign.messages.FILE_DIRECTORY'), $fileObj->file_name)) {
      return Redirect::to('file_not_found');
    }

    FileService::downloadFile(
      config('tmConstants.campaign.messages.FILE_DIRECTORY'),
      $fileObj->file_name,
      $fileObj->name,
      $fileObj->file_type
    );
  }

  /**
   * Add campaign message
   *
   * @param Request $request
   * @param string $campaignKey
   * @return void
   */
  public function addMessage(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    //check campaign key
    $campaign = Campaign::select('id')
      ->where('key', $campaignKey)
      ->where('deleted', 0)
      ->first();
    if ($campaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    //get request parameters
    $name = $request->input('name', null);
    $shareable = intval($request->input('shareable', 0));
    $file = $request->file('file');
    $link = $request->input('link', null);
    $type = $request->input('type', null);

    //validate mesage name
    if (($name == null) || (strlen($name) < 3)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_NAME_WRONG'));
      return;
    }

    //validate message shareable
    if (($shareable != 0) && ($shareable != 1)) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_SHAREABLE_WRONG'));
      return;
    }

    //validate message type
    if (($type == null) || ((intval($type) != config('tmConstants.campaign.messages.types.FILE')) && (intval($type) != config('tmConstants.campaign.messages.types.LINK')))) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_TYPE_WRONG'));
      return;
    }

    //validate file
    $type = intval($type);
    if ($type == config('tmConstants.campaign.messages.types.FILE')) {
      $file = $request->file('file');
      if ((!$request->hasFile('file')) || (!$file->isValid()) || ($file->getSize() > 20971520)) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_FILE_WRONG'));
        return;
      }
    }

    //validate link
    if ($type == config('tmConstants.campaign.messages.types.LINK')) {
      if (!filter_var($link, FILTER_VALIDATE_URL)) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_LINK_WRONG'));
        return;
      }
    }

    //create message
    $messageKey = Helper::getNewTableKey('campaign_messages', 10);
    $messageOrder = 1;
    $lastMessage = $campaign->messages()
      ->where('deleted', 0)
      ->orderBy('order', 'DESC')
      ->first();
    if ($lastMessage != null) {
      $messageOrder = $lastMessage->order + 1;
    }

    $campaignMessage = new CampaignMessages;
    $campaignMessage->key = $messageKey;
    $campaignMessage->name = $name;
    $campaignMessage->order = $messageOrder;

    if ($type == config('tmConstants.campaign.messages.types.LINK')) {
      $campaignMessage->link = $link;
    } else {
      $campaignMessage->file_name = $messageKey;
      $campaignMessage->file_type = $file->getClientOriginalExtension();

      $newFileName = $messageKey;
      $newFileDestination = config('tmConstants.campaign.messages.FILE_DIRECTORY');
      $file->move($newFileDestination, $newFileName);
    }

    //create share link if shareable
    $campaignMessage->shareable = $shareable;
    if ($shareable == 1) {
      $shareKey = null;
      do {
        $shareKey = Helper::random(20);
        $row = CampaignMessages::where('share_key', $shareKey)->first();
      } while ($row != null);
      $campaignMessage->share_key = $shareKey;
    }

    $campaign->messages()->save($campaignMessage);

    $jsonOutput->setData("ok");
  }

  /**
   * Update campaign message
   *
   * @param Request $request
   * @param string $campaignKey
   * @param string $messageKey
   * @return void
   */
  public function updateMessage(Request $request, $campaignKey, $messageKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $saveCount = 0;

    //check campaign key
    $campaign = Campaign::select('id')
      ->where('key', $campaignKey)
      ->where('deleted', 0)
      ->first();
    if ($campaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    //check message key
    $message = $campaign->messages()->where('key', $messageKey)
      ->where('deleted', 0)
      ->first();
    if ($message == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_DOES_NOT_EXIST'));
      return;
    }

    //validate message name
    $messageName = $request->input('name', null);
    if ($messageName != null) {
      if ($messageName == '') {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_NAME_WRONG'));
        return;
      } else {
        $message->name = $messageName;
        $saveCount++;
      }
    }

    //validate and update link
    $link = $request->input('link', null);
    if (($message->link != null) && ($link != null)) {
      if (!filter_var($link, FILTER_VALIDATE_URL)) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_LINK_WRONG'));
        return;
      } else {
        $message->link = $link;
      }
    }

    //validate and update shareable
    $shareable = $request->input('shareable', null);
    if ($shareable != null) {
      $shareable = intval($shareable);
      if (($shareable != 0) && ($shareable != 1)) {
        $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_SHAREABLE_WRONG'));
        return;
      } else {
        $message->shareable = $shareable;
        $saveCount++;
        if (($shareable == 1) && ($message->share_key == null)) {
          $shareKey = null;
          do {
            $shareKey = Helper::random(20);
            $row = CampaignMessages::where('share_key', $shareKey)->first();
          } while ($row != null);
          $message->share_key = $shareKey;
        }
        if (($shareable == 0) && ($message->share_key != null)) {
          $message->share_key = null;
        }
      }
    }

    //update active
    $active = $request->input('active', null);
    if ($active !== null) {
      $message->active = intval($active);
      $saveCount++;
    }

    //save message
    if ($saveCount > 0) {
      $message->save();
    }

    $jsonOutput->setData("ok");
  }

  /**
   * Delete campaign message
   *
   * @param Request $request
   * @param string $campaignKey
   * @param string $messageKey
   * @return void
   */
  public function deleteMessage(Request $request, $campaignKey, $messageKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    //check campaign key
    $campaign = Campaign::select('id')
      ->where('key', $campaignKey)
      ->where('deleted', 0)
      ->first();
    if ($campaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    //check message key
    $message = $campaign->messages()->where('key', $messageKey)
      ->where('deleted', 0)
      ->first();
    if ($message == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_MESSAGE_DOES_NOT_EXIST'));
      return;
    }

    //delete message
    $message->deleted = 1;
    $message->save();

    //delete file if message type is file and file exists
    if ($message->file_name != null) {
      $fullFileName = config('tmConstants.campaign.messages.FILE_DIRECTORY') . $message->file_name;
      if (file_exists($fullFileName)) {
        unlink($fullFileName);
      }
    }

    //reorder messages
    $campaign->messages()->where('order', '>', $message->order)
      ->where('deleted', 0)
      ->orderBy('order', 'asc')
      ->increment('order', -1);
    $jsonOutput->setData("ok");
  }

  /**
   * Get campaign cti permissions
   *
   * @param \Illuminate\Http\Request $request
   * @param string $CampaignKey
   * @return void
   */
  public function getCampaignPermissions(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    //check campaign key
    $campaign = Campaign::select('id')
      ->where('key', $campaignKey)
      ->where('deleted', 0)
      ->first();
    if ($campaign == null) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    //get permissions
    $permissions = $campaign->cti_permissions()
      ->select(
        'cti_permissions.key',
        'cti_permissions.name',
        'cti_permissions.label',
        'cti_permissions_in_campaigns.value'
      )
      ->get();

    $jsonOutput->setData($permissions);
  }

  /*
		Function that returns all employees by campaign key
	*/
  public function getEmployees(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $campaignData = Campaign::select('id')->where('key', $campaignKey)
      ->with(['users' => function ($query) {
        $query->select(
          'personal_identity',
          'first_name',
          'last_name',
          'users_in_campaigns.active',
          'users.id',
          'users.key',
          'users.email AS user_email',
          'mobile_phone.phone_number AS mobile_phone_number',
          'mobile_phone.key AS mobile_phone_key',
          'home_phone.phone_number AS home_phone_number',
          'home_phone.key AS home_phone_key'
        )
          ->join('voters', 'users.voter_id', '=', 'voters.id')
          ->LeftJoin('user_phones AS mobile_phone', function ($q) {
            $q->on([
              ['users.id', '=', 'mobile_phone.user_id'],
              ['mobile_phone.phone_type_id', '=', DB::raw(config('constants.PHONE_TYPE_MOBILE'))],
            ]);
          })
          ->LeftJoin('user_phones AS home_phone', function ($q) {
            $q->on([
              ['users.id', '=', 'home_phone.user_id'],
              ['home_phone.phone_type_id', '=', DB::raw(config('constants.PHONE_TYPE_HOME'))],
            ]);
          })
          ->groupBy('users.id');
      }, 'users.languages' => function ($query) {
        $query->select('language_id AS value', 'languages_by_users.main', 'user_id', 'languages_by_users.id', 'languages.name AS label')
          ->join('languages', 'languages_by_users.language_id', '=', 'languages.id');
      }]);
    $employees = $campaignData->first()['users']->makeHidden('pivot');
    foreach ($employees as $employee) {
      $employee['mobilePhone'] = ['key' => $employee['mobile_phone_key'], 'value' => ($employee['mobile_phone_number'] ? $employee['mobile_phone_number'] : ''), 'type' => 'mobile'];
      $employee['homePhone'] = ['key' => $employee['home_phone_key'], 'value' => ($employee['home_phone_number'] ? $employee['home_phone_number'] : ''), 'type' => 'home'];
      unset($employee['mobile_phone_key'], $employee['mobile_phone_number'], $employee['home_phone_key'], $employee['home_phone_number']);
    }

    $jsonOutput->setData($employees);
  }

  /*
		Function that saves employee (user) data by user key
		and POST params
	*/
  public function saveEmployee(Request $request, $campaignKey, $userKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $user = User::where('key', $userKey)->first();
    if ($user == null) {
      $jsonOutput->setErrorCode(config('errors.tm.THERE_IS_NO_REFERENCE_KEY_OR_KEY_NOT_EXISTS'));
      return;
    }
    $userId = $user->id;

    $campaign = Campaign::select('id', 'team_id')->where('key', $campaignKey)->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }

    if (!$campaign->team_id) {
      $jsonOutput->setErrorCode(config('CAMPAIGN_PARAMETER_IS_NOT_VALID'));
      return;
    }

    $currentUserInCampaign = $this->getUserInCampaign($campaign->id, $userId);

    if (!$currentUserInCampaign) {
      $jsonOutput->setErrorCode(config('errors.tm.THERE_IS_NO_REFERENCE_KEY_OR_KEY_NOT_EXISTS'));
      return;
    }
    $active =  $request->input('active', null);

    if (!is_null($active)) {
      $currentUserInCampaign->active = $active;
      $currentUserInCampaign->save();
    }

    $modelsList = [];
    $fieldsArray = [];

    $userEmail = $request->input('user_email', null);
    $mobilePhone = $request->input('mobilePhone', null);
    $homePhone = $request->input('homePhone', null);
    $languages = $request->input('languages', null);

    if (!is_null($userEmail) && $user->email != $userEmail) {
      if (!$this->isValidEmail($userEmail)) {
        $jsonOutput->setErrorCode(config('errors.tm.MISSING_EMAIL'));
        return;
      }
      $fieldsArray[] = [
        'field_name' => 'user_email',
        'display_field_name' => config('history.CampaignWorkers.user_email'),
        'new_value' => $userEmail,
        'old_value' => $user->email
      ];
      $user->update(['email' => $userEmail]);
    }

    //save mobile number
    if (!is_null($mobilePhone)) {
      if (!Helper::isIsraelMobilePhone($mobilePhone['value'])) {
        $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
        return;
      }
      $this->saveUserPhoneNumber($mobilePhone, $userId, $fieldsArray,  false, 'mobile_phone');
    }

    //save home phone number
    if (!is_null($homePhone)) {
      if (!Helper::isIsraelMobilePhone($mobilePhone['value']) && !Helper::isIsraelLandPhone($mobilePhone['value'])) {
        $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
        return;
      }
      $this->saveUserPhoneNumber($homePhone, $userId, $fieldsArray, false, 'home_phone');
    }
    $languagesList = Languages::where('deleted', '0')->get()->pluck('id')->toArray();
    //save languages
    if (!is_null($languages)) {
      foreach ($languages as $lang) {
        if (!in_array($lang['value'], $languagesList)) {
          $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
          return;
        }
      }
      $this->saveUserLanguages($request->input('languages'), $userId, $fieldsArray,  false);
    }
    if (count($fieldsArray) > 0) {
      $modelsList[] = [
        'description' => '×¢×¨×™×›×ª ×¢×•×‘×“ ×§×™×™× ×‘×˜×œ×ž×¨×§×˜×™× ×’',
        'referenced_model' => 'User',
        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
        'referenced_id' => $currentUserInCampaign->id,
        'valuesList' => $fieldsArray
      ];

      $historyArgsArr = [
        'topicName' => ('tm.campaign.employees.edit'),
        'models' => $modelsList,
      ];

      ActionController::AddHistoryItem($historyArgsArr);
    }
    $jsonOutput->setData('Ok');
  }

  /*
		Function that deletes employee(user) from specific campaign by user key and campaign key
	*/
  public function deleteEmployee($campaign_key, $user_key)
  {
    $jsonOutput = app()->make("JsonOutput");

    $campaign = Campaign::select('id')->where('key', $campaign_key)->first();
    $user = User::select('id')->where('key', $user_key)->first();

    if ($campaign->id && $user->id) {
      $employee = UsersInCampaigns::where([
        'campaign_id' => $campaign->id, 'user_id' => $user->id, 'deleted' => 0
      ])
        ->first();

      UsersInCampaigns::where([
        'campaign_id' => $campaign->id, 'user_id' => $user->id, 'deleted' => 0
      ])
        ->update(['deleted' => 1]);

      $historyArgsArr = [
        'topicName' => 'tm.campaign.employees.delete',
        'models' => [
          [
            'referenced_model' => 'UsersInCampaigns',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
            'referenced_id' => $employee->id
          ]
        ]
      ];

      $userRoles = $user->rolesByUsers()->select('id', 'main', 'campaign_id')
        ->where('deleted', 0)
        ->get();

      foreach ($userRoles as $index => $userRole) {
        if ($userRole->campaign_id == $campaign->id) {
          $userRole->deleted = 1;
          $userRole->save();
          if (count($userRoles) > 1 && $userRole->main) {
            $mainIndex = 0;
            if ($index == 0) {
              $mainIndex = 1;
            }
            $userRoles[$mainIndex]->main = 1;
            $userRoles[$mainIndex]->save();
          }
          $historyArgsArr['models'][] = [
            'referenced_model' => 'RolesByUsers',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
            'referenced_id' => $userRole->id
          ];

          break;
        }
      }

      ActionController::AddHistoryItem($historyArgsArr);
    }
    $jsonOutput->setData('ok');
  }

  /*
		Function that adds new employee to specific campaign by userKey(inside request)
		and campaignKey and POST DATA
	*/
  public function addEmployee(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign.employees.add')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $personalIdentity = $request->input('personal_identity', null);

    if ($personalIdentity == null) {
      $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
      return;
    }
    $userEmail = $request->input('user_email', null);
    $mobilePhone = $request->input('mobilePhone', null);
    $homePhone = $request->input('homePhone', null);
    $languages = $request->input('languages', null);

    //Valid user email
    if (!$this->isValidEmail($userEmail)) {
      $jsonOutput->setErrorCode(config('errors.tm.MISSING_EMAIL'));
      return;
    }
    //Valid mobile number
    if (!Helper::isIsraelMobilePhone($mobilePhone['value'])) {
      $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
      return;
    }

    //Valid home phone number
    if (!Helper::isIsraelMobilePhone($mobilePhone['value']) && !Helper::isIsraelLandPhone($mobilePhone['value'])) {
      $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
      return;
    }
    $languagesList = Languages::where('deleted', '0')->get()->pluck('id')->toArray();

    //Valid languages
    foreach ($languages as $lang) {
      if (!in_array($lang['value'], $languagesList)) {
        $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
        return;
      }
    }

    $voter = Voters::where('personal_identity', $personalIdentity)->first();
    if (!$voter) {
      $jsonOutput->setErrorCode(config('errors.tm.INVALID_DATA'));
      return;
    }
    $campaign = Campaign::select(
      'id',
      'scheduled_start_date',
      'scheduled_end_date',
      'team_id',
      'team_department_id'
    )
      ->where('key', $campaignKey)
      ->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_DOES_NOT_EXIST'));
      return;
    }
    if (!$campaign->team_id) {
      $jsonOutput->setErrorCode(config('CAMPAIGN_PARAMETER_IS_NOT_VALID'));
      return;
    }
    $user = User::where('voter_id', $voter->id)->first();
    $addUserRole = false;
    $totalUserRoles = 0;

    if (!$user) { //if there is no user for this voter, create user ...
      $checkUserEmail = User::select('key')->where('email', $userEmail)->where('deleted', 0)->first();
      if ($checkUserEmail) {
        $jsonOutput->setErrorCode(config('errors.elections.USER_WITH_THE_SAME_EMAIL_ALREADY_EXIST'));
        return;
      }
      $newUser = new User;
      $newUser->voter_id = $voter->id;
      $newUser->key = Helper::getNewTableKey('users', 10);
      $randNewPWD = Str::random(6);
      $newUser->password = Hash::make($randNewPWD);
      $newUser->user_create_id = Auth::user()->id;
      $newUser->email = $userEmail;
      $newUser->two_step_authentication = 0;

      $newUser->save();

      if (config('settings.send_new_user_email')) {
        UserController::sendEmailNewUserPassword($userEmail, $randNewPWD, $voter->first_name, $voter->last_name);
      }
      $user = $newUser;
      $currentUserInCampaign = false;
      $addUserRole = true;
    } else { //update the user data...

      $userRoles = $user->rolesByUsers()->select(
        'id',
        'campaign_id'
      )
        ->where('deleted', 0)
        ->get();
      $totalUserRoles = count($userRoles);
      $campaignRole = null;
      foreach ($userRoles as $userRole) {
        if ($userRole->campaign_id == $campaign->id) {
          $campaignRole = $userRole;
          break;
        }
      }


      if ($campaignRole) {
        $campaignRole->team_id              = $campaign->team_id;
        $campaignRole->team_department_id   = $campaign->team_department_id;
        $campaignRole->from_date            = $campaign->scheduled_start_date;
        $campaignRole->to_date              = $campaign->scheduled_end_date;
        $campaignRole->save();
      } else {
        $addUserRole = true;
      }
      if ($user->email != $userEmail) {
        $user->update(['email' => $userEmail]);
      }
      $currentUserInCampaign = $this->getUserInCampaign($campaign->id, $user->id);
    }

    if ($addUserRole) {
      $tmModule = Modules::select('id')
        ->where('system_name', config('tmConstants.campaign.employees.module'))
        ->first();

      $tmRole = UserRoles::select('id')
        ->where('system_name', config('tmConstants.campaign.employees.userRole'))
        ->where('deleted', 0)
        ->first();

      $user->rolesByUsers()->create([
        'user_role_id'          => $tmRole->id,
        'team_id'               => $campaign->team_id,
        'team_department_id'    => $campaign->team_department_id,
        'from_date'             => $campaign->scheduled_start_date,
        'to_date'               => $campaign->scheduled_end_date,
        'main'                  => ($totalUserRoles > 0) ? 0 : 1,
        'campaign_id'           => $campaign->id
      ]);
    }

    $userId = $user->id;

    if (!$currentUserInCampaign) {
      $currentUserInCampaign = new UsersInCampaigns;
      $currentUserInCampaign->key = Helper::getNewTableKey('users_in_campaigns', 5);
      $currentUserInCampaign->campaign_id = $campaign->id;
      $currentUserInCampaign->user_id = $user->id;
      $currentUserInCampaign->active = 1;
      $currentUserInCampaign->save();
    }

    $modelsList = [];
    $fieldsArray = [];

    if ($userEmail) {
      $fieldsArray[] = [
        'field_name' => 'user_email',
        'display_field_name' => config('history.CampaignWorkers.user_email'),
        'new_value' => $userEmail
      ];
    }
    //$userEmail

    //save mobile number
    $this->saveUserPhoneNumber($mobilePhone, $userId, $fieldsArray, true, 'mobile_phone');

    //save home phone number×—×™×™×
    $this->saveUserPhoneNumber($homePhone, $userId, $fieldsArray, true, 'home_phone');

    //save languages
    $this->saveUserLanguages($request->input('languages'), $userId, $fieldsArray, true);

    if (count($fieldsArray) > 0) {
      $modelsList[] = [
        'description' => '×”×•×¡×¤×ª ×¢×•×‘×“ ×—×“×© ×œ×§×ž×¤×™×™×Ÿ ×˜×œ×ž×¨×§×˜×™× ×’',
        'referenced_model' => 'UsersInCampaigns',
        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
        'referenced_id' => $currentUserInCampaign->id,
        'valuesList' => $fieldsArray
      ];

      $historyArgsArr = [
        'topicName' => ('tm.campaign.employees.add'),
        'models' => $modelsList,
      ];

      ActionController::AddHistoryItem($historyArgsArr);
    }

    $jsonOutput->setData('Ok');
  }

  private function getUserInCampaign($campaignId, $userId)
  {
    return UsersInCampaigns::where([
      'campaign_id' => $campaignId, 'user_id' => $userId, 'deleted' => 0
    ])
      ->first();
  }

  /*
		Private helpful function that saves languages for user
	*/
  private function saveUserLanguages($languages, $userId, &$fieldsArray, $isAddMode) //isAddMode = add , otherwise edit
  {
    LanguagesByUsers::where('user_id', $userId)->delete();
    $params = array();
    foreach ($languages as $language) {
      $params[] = array(
        'user_id' => $userId,
        'language_id' => $language['value'],
        'main' => $language['main'],
      );
    }
    if ($isAddMode) {
      if (count($languages) > 0) {
        $fieldsArray[] = [
          'field_name' => 'languages',
          'display_field_name' => config('history.CampaignWorkers.languages'),
          'new_value' => json_encode($languages)
        ];
      }
    } else {
      $fieldsArray[] = [
        'field_name' => 'languages',
        'display_field_name' => config('history.CampaignWorkers.languages'),
        'new_value' => json_encode($languages)
      ];
    }
    LanguagesByUsers::insert($params);
    return;
  }

  /*
		Private helpful function that saves phone numbers for user
	*/
  private function saveUserPhoneNumber($userPhone, $userId, &$fieldsArray, $isAddMode, $phoneType)
  {
    $currentPhone = null;
    $newPhoneNumber = str_replace('-', '', $userPhone['value']);
    if (trim($newPhoneNumber) == "") return;

    if ($userPhone['key']) { //update if there is key for the phone
      $currentPhone = UserPhones::where('key', $userPhone['key'])->first();
      if ($isAddMode) {
        $fieldsArray[] = [
          'field_name' => $phoneType,
          'display_field_name' => config('history.CampaignWorkers.' . $phoneType),
          'new_value' => $newPhoneNumber
        ];
      } else {
        if ($currentPhone->phone_number != $newPhoneNumber) {
          $fieldsArray[] = [
            'field_name' => $phoneType,
            'display_field_name' => config('history.CampaignWorkers.' . $phoneType),
            'new_value' => $newPhoneNumber,
            'old_value' => $currentPhone->phone_number
          ];
        }
      }

      if ($currentPhone && $currentPhone->phone_number != $newPhoneNumber) {
        $currentPhone->phone_number = $newPhoneNumber;
        $currentPhone->save();
      }
    } else { //else insert the phone
      UserPhones::where('user_id', $userId)->delete();

      $userMobile = new UserPhones;
      $key = Helper::getNewTableKey('user_phones', 5);
      $userMobile->key = $key;
      $userMobile->phone_type_id = ($userPhone['type'] == 'mobile') ? config('constants.PHONE_TYPE_MOBILE') : config('constants.PHONE_TYPE_HOME');
      $userMobile->phone_number = $newPhoneNumber;
      $userMobile->user_id = $userId;
      $userMobile->save();

      if ($newPhoneNumber) {
        $fieldsArray[] = [
          'field_name' => $phoneType,
          'display_field_name' => config('history.CampaignWorkers.' . $phoneType),
          'new_value' => $newPhoneNumber
        ];
      }
    }
  }

  /*
		Private helpful function that validates email
	*/
  private function isValidEmail($email)
  {
    $isValid = false;
    $rules = ['email' => 'email'];

    if ((trim($email) == '') && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $isValid = false;
    } else {
      $isValid = true;
    }

    if ($isValid) {
      $validator = Validator::make(['email' => $email], $rules);
      if ($validator->fails()) {
        $messages = $validator->messages();
        $this->errorMessage = $messages->first('email');
        $isValid = false;
      }
    }
    return $isValid;
  }

  /*
		Function that returns statistics of campaign by campaign key
	*/
  public function getStatistics($campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    if (!GlobalController::isActionPermitted('tm.campaign')) {
      $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
      return;
    }

    $currentCampaign = SimpleCampaign::where('key', $campaignKey)->first();

    $data = [
      "voters_count" => 0, // not in use
      "unique_voters_count" => 0,
      "support_status" => [
        ['value' => 1, 'combine_id' => 1, 'label' => '××™×Ÿ × ×ª×•× ×™×!']
      ],
    ];

    $processed = CampaignRepository::getTotalProcessedCount($currentCampaign->id);

    $data = array_merge($data, $processed);

    if (false) { // this is relevant to a try in CampaignRepository@getTotalProcessedCount
      $data["total_changed_status"] =  CampaignRepository::changedStatusStatistics($currentCampaign->id);

      $totalChangedStatusCount = $data["total_changed_status"]->sum('voters_count');

      $data["changed_status_count"] = $totalChangedStatusCount;
    }

    $data["unique_voters_count"] = TelemarketingVoterPhone::select(DB::raw('count(id) as voters_count'))
      ->where('campaign_id', $currentCampaign->id)
      ->first()
      ->voters_count;

    $timingStatus = CampaignRepository::campaignCallsStats($currentCampaign->key, $currentCampaign->id);

    $data = array_merge($data, $timingStatus);

    $jsonOutput->setData($data);
  }

  public static function getUsersInCampaigns($userId, $campaignKey = null)
  {
    $activeCampaignStatus = config('tmConstants.campaign.statusNameToConst.ACTIVE');

    $userInCampaigns = Campaign::select('users_in_campaigns.id')
      ->join('users_in_campaigns', 'users_in_campaigns.campaign_id', '=', 'campaigns.id')
      ->where([
        'campaigns.status' => $activeCampaignStatus, 'campaigns.deleted' => 0,
        'users_in_campaigns.user_id' => $userId,
        'users_in_campaigns.deleted' => 0, 'users_in_campaigns.active' => 1
      ]);
    if ($campaignKey) {
      $userInCampaigns->where('campaigns.key', $campaignKey);
    }
    $userInCampaigns = $userInCampaigns->first();
    return $userInCampaigns;
  }

  /**
   * Add new call recording
   *
   * @param string call_key
   * @param string file_name
   * @return void
   */
  public function addNewRecording(Request $request, $campaignKey)
  {
    $jsonOutput = app()->make("JsonOutput");

    $callKey = $request->input('call_key', null);
    $fileName = $request->input('file_name', null);

    $campaign = Campaign::select('id', 'key')
      ->where('key', $campaignKey)
      ->first();
    if (!$campaign) {
      $jsonOutput->setErrorCode(config('errors.tm.CAMPAIGN_KEY_IS_WRONG'));
      return;
    }

    if (!$callKey) {
      $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
      return;
    }

    if (!$fileName) {
      $jsonOutput->setErrorCode(config('errors.tm.FILE_NAME_MISSING'));
      return;
    }

    $call = Call::select('id')
      ->where('sip_server_key', $callKey)
      ->first();
    if (!$call) {
      $jsonOutput->setErrorCode(config('errors.tm.CALL_DOES_NOT_EXIST'));
      return;
    }

    $call->audio_file_name = $fileName;
    $convertMp3FileName = CallsService::transferWavFilesToMp3($fileName, $campaign->id);
    if (!empty($convertMp3FileName)) {
      $call->audio_file_name = $convertMp3FileName;
    }
    $call->save();

    $jsonOutput->setData('ok');
  }

  public function monitor(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    $message = $request->input('message', '');
    DEBUGBAR::addMessage($message, 'campaign_monitor');
    $jsonOutput->setData([]);
  }

  public function monitorNewCall(Request $request)
  {
    $jsonOutput = app()->make("JsonOutput");
    $message = $request->input('message', '');
    DEBUGBAR::addMessage($message, 'redisListener');
    $jsonOutput->setData([]);
  }
}
