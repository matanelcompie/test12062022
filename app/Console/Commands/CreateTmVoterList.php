<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tm\Campaign;
use App\Models\ElectionCampaigns;
use App\Libraries\Services\CampaignService;
use App\Models\Tm\TelemarketingVoterPhone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use ThatsUs\RedLock\Facades\RedLock;

class CreateTmVoterList extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'tm:list {campaign_list?}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create TM Voter list';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct()
  {
    parent::__construct();
  }

  /**
   * Execute the console command.
   *
   * @return mixed
   */
  public function handle()
  {

    //set reading from master
    $master = DB::connection('master')->getPdo();
    DB::setReadPdo($master);

    $campaignFields = [
      'id',
      'status',
      'current_portion_id',
      'last_voter_id',
      'finished_portions',
      'single_phone_occurrence',
      'single_voter_for_household',
      'only_users_with_mobile',
    ];
    $campaignListArray = null;
    $campaignList = $this->argument("campaign_list");
    Log::info('tm:list ');

    if (!empty($campaignList)) {
      $campaignListArray = explode(',', $campaignList);
      Log::info(json_encode($campaignListArray));
    }
    //get current election campaign
    $electionCampaign = ElectionCampaigns::currentCampaign();

    //get tm and election campaigns
    $campaigns = Campaign::select($campaignFields)
      ->with(['portions' => function ($query) {
        $query->where('active', 1)
          ->orderBy('order');
      }])
      ->where('status', config('tmConstants.campaign.statusNameToConst.ACTIVE'));

    if (is_array($campaignListArray)) {
      $campaigns->whereIn('campaigns.id', $campaignListArray);
    }

    $campaigns = $campaigns->get();

    //loop on campaigns and generate voter phone table
    foreach ($campaigns as $campaign) {

      //check if not already running on campaign and add service campaign lock
      $keyTimeout = 1000 * 60 * 20;
      $campaignServiceKey = 'tm:campaigns:' . $campaign->id . ':service';
      $lockToken = RedLock::lock($campaignServiceKey, $keyTimeout);
      if (!$lockToken) {
        continue;
      }

      //initialize helpers arrays
      $votersPhonesHash = array();
      $processedVoters = array();
      //get existing voters from table that weren't sent to dialer
      $existingVoters = CampaignService::getExistingTelemarketingVoterPhones($campaign->id);

      $campaign->makeVisible(['portions']);
      //loop on each active portion and generate voter phone table
      foreach ($campaign->portions as $portion) {
        $lockToken = RedLock::refreshLock($lockToken);
        CampaignService::getVotersToTable($portion, $campaign, $electionCampaign->id, $existingVoters, $processedVoters, $votersPhonesHash);
      }
      //delete voters in table that are not in the portions any more
      foreach ($existingVoters as $existingVoterId => $existingVoterPhoneId) {
        $lockToken = RedLock::refreshLock($lockToken);
        CampaignService::deleteExistingTelemarketingVoterPhone($campaign->id, $existingVoterId);
      }

      //calculate unique voter count for portion
      $lockToken = RedLock::refreshLock($lockToken);
      CampaignService::calculateUniquePortionsVoterCount($campaign);

      //remove service lock
      RedLock::unlock($lockToken);
    }
  }
}
