<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\VoterBookParser;
use Exception;
use Illuminate\Support\Facades\Log;


class voterBookJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(VoterBookParser $VoterBookParser, $voterBookId)
    {
        $this->VoterBookParser = $VoterBookParser;
        $this->voterBookId = $voterBookId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->VoterBookParser->parseVoterBooks($this->voterBookId);
    }

    public function failed(Exception $exception)
    {
        Log::info('voter book job: ' . $exception->getMessage());
    }
}
