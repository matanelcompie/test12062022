<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\Services\ExternalVotesParserService;

use Exception;
use Illuminate\Support\Facades\Log;


class VotesParserJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(ExternalVotesParserService $ExternalVotesParserService, $fileName, $voteSourceName, $currentCampaign)
    {
        $this->ExternalVotesParserService = $ExternalVotesParserService;
        $this->voteSourceName = $voteSourceName;
        $this->fileName = $fileName;
        $this->currentCampaign = $currentCampaign;

    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->ExternalVotesParserService->parseVotesArray( $this->fileName, $this->voteSourceName, $this->currentCampaign);
    }

    public function failed(Exception $exception)
    {
        Log::info('vote file job: ' . $exception->getMessage());
    }
}