<?php

namespace App\Libraries\Services\UploadFile;

use App\DTO\ExcelColumnDto;
use App\DTO\UploadExcelFileDto;
use App\Enums\CsvDocumentThemeSystemName;
use App\Enums\CsvFileTheme;
use App\Enums\CsvParserStatus;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\UploadFile\UploadFile;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Libraries\Services\UploadFile\UploadExcelFiles\UploadExcelElectionVotesReport;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\CsvDocumentRepository;
use App\Repositories\ElectionCampaignPartyListRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class UploadExcelFile
{
    public static function UploadExcelFile(UploadExcelFileDto $uploadFile)
    {
        $locationFile = UploadFile::uploadFile($uploadFile);
        $fileData = file_get_contents($locationFile);
        $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');

        if ($encoding != "UTF-8") {
            $utf8FileData = mb_convert_encoding($fileData, "UTF-8", $encoding);
            file_put_contents($locationFile, $utf8FileData);
        }

        $uploadFile->filesize = filesize($locationFile);
        $uploadFile = self::setCountRowAndColIncludeExcelData($uploadFile, $locationFile);

        $csvDocument = CsvDocumentRepository::insert(
            $uploadFile->csvDocumentTheme->id,
            $uploadFile->fileName,
            $uploadFile->filesize,
            $uploadFile->countRow,
            $uploadFile->isHeaderRow,
            $locationFile
        );

        return $csvDocument;
    }

    private static function setCountRowAndColIncludeExcelData(UploadExcelFileDto $uploadFile, $locationFile)
    {
        $file = fopen($locationFile, "r");
        $nRowsArray = array();
        $indexer = 0;

        while (($data = fgetcsv($file, 0, ",")) !== false) {

            if ($indexer == 0) {
                $uploadFile->countColumn = count($data);
            }
            // if ($indexer < NUMBER_OF_ROWS_RETURNED) {
            //     $arrRow = [];
            //     $encoding = mb_detect_encoding(implode(",", $data), 'UTF-8, ASCII, ISO-8859-8');
            //     foreach ($data as $rowData) {
            //         if ($encoding != "UTF-8") {
            //             $arrRow[] = mb_convert_encoding($rowData, "UTF-8", $encoding);
            //         } else {
            //             $arrRow[] = $rowData;
            //         }
            //     }
            //     array_push($nRowsArray, $arrRow);
            // }
            $indexer++;
        }

        $uploadFile->countRow = $indexer;

        fclose($file);
        return $uploadFile;
    }

    public static function getExcelFileStatus(string $csvDocumentKey)
    {
        return CsvDocumentRepository::getCsvDocumentWithErrorRows($csvDocumentKey);
    }

    /**
     * function get uploader file and check if all required column is selected in excel file
     *
     * @param array | excelColumnDto  $excelColumnsSelected  un array excel dto that be selected include in uploader excel file
     * @param array | excelColumnDto $excelColumnsRequired un array excel dto that be must include in uploader excel file
     * @return boolean
     */
    public static function isSelectedAllExcelColumn(array $excelColumnsSelected, array $excelColumnsRequired)
    {
        $hashExcelColumnNameSelected = Helper::makeHashCollection($excelColumnsSelected, 'nameColumn');

        foreach ($excelColumnsRequired as $key => $excelColeRequire) {
            if (!isset($hashExcelColumnNameSelected[$excelColeRequire->nameColumn]))
                return false;
        }

        return true;
    }

    public static function parseCsvDocumentByTypeTheme(UploadExcelFileDto $uploadFile)
    {
        try {
            switch ($uploadFile->csvDocumentTheme->system_name) {
                case CsvDocumentThemeSystemName::ELECTION_MUNICIPAL_BALLOT_VOTES:
                    UploadExcelElectionVotesReport::uploadExcelFileBallotVotes($uploadFile);
                    break;
                case CsvDocumentThemeSystemName::ELECTION_BALLOT_VOTES:
                    UploadExcelElectionVotesReport::uploadExcelFileBallotVotes($uploadFile);
                    break;
                case CsvDocumentThemeSystemName::ELECTION_MUNICIPAL_HEAD_COUNCIL_VOTES:
                    UploadExcelElectionVotesReport::uploadExcelFileBallotVotes($uploadFile);
                    break;
                default:
                    # code...
                    break;
            }
        } catch (\Exception $e) {
            $uploadFile->csvDocument->status = CsvParserStatus::CSV_PARSER_STATUS_ERROR;
            $uploadFile->csvDocument->system_error = $e;
            $uploadFile->csvDocument->save();
        }
    }

    /**
     * function return array csv theme list include type csv and array excel column for upload excel
     *
     * @return array [CsvThemeDto]
     */
    public static function getThemesListUploadCsvDocument()
    {
        $csvThemeList = array();
        $csvThemeList[] = UploadExcelElectionVotesReport::getCsvThemeUploadElectionReportVotes();
        $csvThemeList[] = UploadExcelElectionVotesReport::getCsvThemeUploadMunicipalElectionVotes();

        return  $csvThemeList;
    }
}
