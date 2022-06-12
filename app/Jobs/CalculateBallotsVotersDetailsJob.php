<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\BallotBoxFileParser;

use Exception;
use Illuminate\Support\Facades\Log;


class CalculateBallotsVotersDetailsJob implements ShouldQueue {
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(CalculateBallotsVotersDetailsService $CalculateBallotsVotersDetailsService) {
        $this->CalculateDetailsService = $CalculateBallotsVotersDetailsService;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle() {
        $this->CalculateDetailsService->parseBallotBoxesFiles();
    }

    public function failed(Exception $exception) {
        Log::info('ballot box file job: ' . $exception->getMessage());
    }
}