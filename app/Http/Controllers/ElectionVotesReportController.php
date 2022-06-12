<?php

namespace App\Http\Controllers;

use App\DTO\UploadExcelElectionVotesDto;
use App\DTO\UploadExcelFileDto;
use App\Enums\CsvFileTheme;
use App\Jobs\UploadExcelJob;
use App\Libraries\Services\UploadFile\UploadExcelFile;
use App\Libraries\Services\UploadFile\UploadExcelFiles\UploadExcelElectionVotesReport;
use App\Repositories\CityRepository;
use App\Repositories\ElectionVotesReportRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Auth;

class ElectionVotesReportController extends Controller
{

}
