<?php

namespace App\Console\Commands;

use App\Libraries\Services\ServicesModel\ClusterOrCaptainCalculationService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\ServicesModel\VoterSupportStatusService;
use App\Models\ElectionCampaigns;
use App\Models\ElectionVotesReportSource;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class UploadCsvVotesFromCommission extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'votes:upload-commission-ballot-votes';

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
        $objectIndexList=array();

       
        $partyList=ELectionCampaignPartyListsService::getListByElectionCampaignId($electionCampaignId);
        foreach ($partyList as $key => $party) {
            $objectIndexList[$party->id]=$party->excel_index;
        }
        
        echo 'start';
        ElectionVotesReportService::LoadVotesFromCsvByCommissionResource($electionCampaignId,'votes-24',0,1,2,3,4,$objectIndexList);
        Log::info("Elapsed time is: ". (microtime(true) - $startTime) ." seconds");
        echo 'end';
    }

   
}
