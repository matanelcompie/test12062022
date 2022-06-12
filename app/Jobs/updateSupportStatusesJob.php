<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\HouseholdSupportStatusHandler;
use Exception;
use Illuminate\Support\Facades\Log;


/**
 * Class updateSupportStatusesJob
 *
 * This class executes a job
 * for updating support statuses of household voters
 *
 * @package App\Jobs
 */
class updateSupportStatusesJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(HouseholdSupportStatusHandler $HouseholdSupportStatusHandler, $taskId)
    {
 
        $this->HouseholdSupportStatusHandler = $HouseholdSupportStatusHandler;
        $this->taskId = $taskId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Log::info('In job, support status id: ' . $this->taskId);
        $this->HouseholdSupportStatusHandler->updateSupportStatuses( $this->taskId );
    }

    public function failed(Exception $exception)
    {
      //  Log::info('update support status job: ' . $exception->getMessage());
    }
}
