<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\HouseholdsUpdateParser;

use Exception;
use Illuminate\Support\Facades\Log;


class CreateHouseHoldVoterJob implements ShouldQueue {
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(HouseholdsUpdateParser $householdsUpdateParser, $householdUpdatePartId) {
        $this->householdsUpdateParser = $householdsUpdateParser;
        $this->householdUpdatePartId = $householdUpdatePartId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle() {
        $this->householdsUpdateParser->updateHouseholdPart($this->householdUpdatePartId);
    }

    public function failed(Exception $exception) {
        Log::info('households update part fail: ' . $exception->getMessage());
    }
}