<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\VoteFileParser;

use Exception;
use Illuminate\Support\Facades\Log;


class voteFileJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(VoteFileParser $VoteFileParser, $voteFileId)
    {
        $this->VoteFileParser = $VoteFileParser;
        $this->vote_file_id = $voteFileId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->VoteFileParser->parseVoteFiles($this->vote_file_id);
    }

    public function failed(Exception $exception)
    {
        Log::info('vote file job: ' . $exception->getMessage());
    }
}