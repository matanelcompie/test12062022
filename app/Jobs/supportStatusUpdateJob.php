<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\SupportStatusUpdateParser;

use Exception;
use Illuminate\Support\Facades\Log;


class supportStatusUpdateJob implements ShouldQueue {
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(SupportStatusUpdateParser $supportStatusUpdateParser , $support_status_update_id)
    {
        $this->supportStatusUpdateParser = $supportStatusUpdateParser;
		$this->support_status_update_id = $support_status_update_id;
		
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->supportStatusUpdateParser->parseSupportStatusUpdates($this->support_status_update_id);
    }

    public function failed(Exception $exception)
    {
        Log::info('support status update job: ' . $exception->getMessage());
    }
}