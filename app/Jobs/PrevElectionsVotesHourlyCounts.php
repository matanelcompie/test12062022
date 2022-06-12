<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\Services\BallotVotesCountsService;
use App\Models\ElectionCampaigns;

use Exception;
use Illuminate\Support\Facades\Log;


class PrevElectionsVotesHourlyCounts implements ShouldQueue {
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(BallotVotesCountsService $BallotVotesCountsService, $prevCampaignId) {
        Log::info('PrevElectionsVotesHourlyCounts');
        $this->BallotVotesCountsService = $BallotVotesCountsService;
        $this->prevCampaignId = $prevCampaignId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle() {
        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        $this->BallotVotesCountsService->updateVotesForClustersBallots(null, $currentCampaignId, $this->prevCampaignId);
    }

    public function failed(Exception $exception) {
        Log::info('Prev Elections Votes Hourly Counts fail: ' . $exception->getMessage());
    }
}