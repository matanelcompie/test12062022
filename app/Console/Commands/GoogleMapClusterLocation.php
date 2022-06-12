<?php

namespace App\Console\Commands;

use App\Libraries\Services\GoogleMap\GoogleMapsClusterService;
use App\Models\ElectionCampaigns;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class GoogleMapClusterLocation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'googl-map:cluster-location';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for long transfer proccess';

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

        Log::info('google map start updating....');
        $startTime = microtime(true);
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        GoogleMapsClusterService::updateGoogleMapLocationClusterCampaign($electionCampaignId);
        Log::info("Elapsed time is: ". (microtime(true) - $startTime) ." seconds");

    }

   
}
