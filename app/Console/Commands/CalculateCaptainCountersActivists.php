<?php

namespace App\Console\Commands;

use App\Libraries\Services\ServicesModel\ClusterOrCaptainCalculationService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\VoterSupportStatusService;
use App\Models\ElectionCampaigns;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class CalculateCaptainCountersActivists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activists:calculate-captains-counters';

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

        $startTime = microtime(true);
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        VoterSupportStatusService::deleteDoubleRecord();
        ClusterOrCaptainCalculationService::runCommandLineSummeryVoter($electionCampaignId,false);
        ClusterOrCaptainCalculationService::runCommandLineSummeryVoter($electionCampaignId,true);
        Log::info("Elapsed time is: ". (microtime(true) - $startTime) ." seconds");

    }

   
}
