<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\BallotBoxFileParser;

use Exception;
use Illuminate\Support\Facades\Log;


class BallotBoxFileJob implements ShouldQueue {
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(BallotBoxFileParser $BallotBoxFileParser , $ballot_box_file_id) {
        $this->BallotBoxFileParser = $BallotBoxFileParser;
		$this->ballot_box_file_id = $ballot_box_file_id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle() {
        $this->BallotBoxFileParser->parseBallotBoxesFiles($this->ballot_box_file_id);
    }

    public function failed(Exception $exception) {
        Log::info('ballot box file job: ' . $exception->getMessage());
    }
}