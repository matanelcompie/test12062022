<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\CsvParser;
use Exception;
use Illuminate\Support\Facades\Log;


/**
 * Class csvJob
 *
 * This class executes a job
 * for parsing csv file.
 *
 * @package App\Jobs
 */
class csvJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(CsvParser $CsvParser, $csvId)
    {
        $this->CsvParser = $CsvParser;
        $this->csv_id = $csvId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Log::info('In job, csv id: ' . $this->csv_id);
        $this->CsvParser->parseCsv( $this->csv_id );
    }

    public function failed(Exception $exception)
    {
        Log::info('csv job: ' . $exception->getMessage());
    }
}
