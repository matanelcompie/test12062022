<?php

namespace App\Http\Controllers;

use App\DTO\UploadExcelElectionVotesDto;
use App\DTO\UploadExcelFileDto;
use App\Enums\CsvDocumentThemeSystemName;
use App\Enums\CsvFileThemeSystemName;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Jobs\UploadExcelJob;
use App\Libraries\Services\ExportFile\ExcelFileService;
use App\Libraries\Services\UploadFile\UploadExcelFile;
use App\Models\CsvDocumentTheme;
use App\Repositories\CityRepository;
use App\Repositories\CsvDocumentErrorRowRepository;
use App\Repositories\CsvDocumentRepository;
use App\Repositories\CsvDocumentThemeRepository;
use Illuminate\Support\Facades\Redis;
use Log;
use Illuminate\Http\Request;

class CsvDocumentController extends Controller
{
    public function getCsvDocumentThemeList()
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $csvDocumentThemes = UploadExcelFile::getThemesListUploadCsvDocument();
            $jsonOutput->setData($csvDocumentThemes);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    public function getCsvDocumentDetails(Request $request, $csvDocumentKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $csvDocument = CsvDocumentRepository::getCsvDocumentWithErrorRows($csvDocumentKey);
            $jsonOutput->setData($csvDocument);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function uploadExcelByCsvDocumentThemeId(Request $request, $csvDocumentThemeId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $csvDocumentTheme = CsvDocumentThemeRepository::getById($csvDocumentThemeId);

            switch ($csvDocumentTheme->system_name) {
                case CsvDocumentThemeSystemName::ELECTION_BALLOT_VOTES:
                    $uploaderFileDto = self::getUploadExcelElectionVotesDto($request);
                    break;
                case CsvDocumentThemeSystemName::ELECTION_MUNICIPAL_BALLOT_VOTES:
                    $uploaderFileDto = self::getUploadExcelMunicipalElectionVotesDto($request);
                    break;
                default:
                    $uploaderFileDto = new UploadExcelFileDto();
                    break;
            }

            $uploaderFileDto->fileUploader = $request->file('fileUploader');
            $uploaderFileDto->fileName = $request->input('fileName');
            $uploaderFileDto->excelColumns = json_decode($request->input('excelColumns'));
            $uploaderFileDto->isHeaderRow = $request->input('isHeaderRow');
            $uploaderFileDto->csvDocumentTheme = $csvDocumentTheme;

            $csvDocument = UploadExcelFile::UploadExcelFile($uploaderFileDto);
            $uploaderFileDto->csvDocument = $csvDocument;
            $uploaderFileDto->fileUploader = null;
            $job = (new UploadExcelJob(new UploadExcelFile(), $uploaderFileDto))->onConnection('redis')->onQueue('upload_excel_file');
            $this->dispatch($job);
            //UploadExcelFile::parseCsvDocumentByTypeTheme($uploaderFileDto);
            $csvDocument = CsvDocumentRepository::getCsvDocumentWithErrorRows($csvDocument->key);
            $jsonOutput->setData($csvDocument);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    private function getUploadExcelElectionVotesDto(Request $request)
    {
        $moreDetails = json_decode($request->input('moreDetails'));
        $uploaderFileDto = new UploadExcelElectionVotesDto();
        $uploaderFileDto->electionCampaignId = $moreDetails->electionCampaignId;
        return $uploaderFileDto;
    }

    private function getUploadExcelMunicipalElectionVotesDto(Request $request)
    {
        $moreDetails = json_decode($request->input('moreDetails'));
        $uploaderFileDto = new UploadExcelElectionVotesDto();
        $city = CityRepository::getById($moreDetails->cityId);
        $electionCampaignId = $moreDetails->electionCampaignId;
        $uploaderFileDto->electionCampaignId = $electionCampaignId;
        $uploaderFileDto->city = $city;
        return $uploaderFileDto;
    }

    public function downloadById(Request $request, $csvDocumentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        CsvDocumentRepository::downloadById($csvDocumentId);
    }

    /**
     * download csv file include error rows in csv document upload , by error type row or specific field error
     *
     * @param Request $request
     * @param int $csvDocumentId
     * @param int | CsvDocumentErrorRowType enum $csvDocumentErrorRowType
     * @param string|null $nameFieldError
     * @return void
     */
    public function downloadExcelErrorRowsByTypeErrorAndNameField(Request $request, $csvDocumentId, $csvDocumentErrorRowType, $nameField = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        CsvDocumentRepository::downloadCsvErrorRowDataByTypeErrorAndNameField($csvDocumentId, $csvDocumentErrorRowType, $nameField);
    }

    public function stopCsvDocumentUpload(Request $request, $csvDocumentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            CsvDocumentRepository::stopUploadById($csvDocumentId);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public  function getAllCsvDocumentUploaded()
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $allCsvUploaded = CsvDocumentRepository::getAllCsvUploadedDetails();
            $jsonOutput->setData($allCsvUploaded);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
