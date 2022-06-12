<?php

namespace App\Jobs;

use App\DTO\UploadExcelFileDto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\CsvParser;
use App\Libraries\Services\UploadFile\UploadExcelFile;
use App\Libraries\Services\UploadFile\UploadExcelFiles\UploadExcelElectionVotesReport;
use App\Models\CsvDocument;
use Exception;
use Illuminate\Support\Facades\Log;


/**
 * Class UploadExcelJob
 *
 * This class executes a job
 * for parsing csv file.
 *
 * @package App\Jobs
 */
class UploadExcelJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(UploadExcelFile $uploadExcelFileService,UploadExcelFileDto $uploadFileDto)
    {
        $this->uploadExcelFileService = $uploadExcelFileService;
        $this->uploadFileDto = $uploadFileDto; 
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
         Log::info('In job, csv document id: ' . $this->uploadFileDto->csvDocument->id);
         $this->uploadExcelFileService->parseCsvDocumentByTypeTheme( $this->uploadFileDto );
    }

    public function failed(Exception $exception)
    {
        Log::info('csv document job: ' . $exception->getMessage());
    }
}
