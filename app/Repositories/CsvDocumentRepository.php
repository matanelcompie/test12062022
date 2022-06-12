<?php

namespace App\Repositories;

use App\Enums\CsvParserStatus;
use App\Libraries\Helper;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\CsvDocument;
use DB;
use Illuminate\Support\Facades\Log;

class CsvDocumentRepository
{
    public static function insert($fileThemeId, $fileName, $fileSize, $rowCount, $header, $locationFile)
    {
        $csvDocument = new CsvDocument();
        $csvDocument->file_theme_id = $fileThemeId;
        $csvDocument->key = Helper::getNewTableKey('csv_document', 5);
        $csvDocument->file_name = $fileName;
        $csvDocument->file_size = $fileSize;
        $csvDocument->row_count = intval($rowCount);
        $csvDocument->header = $header;
        $csvDocument->user_create_id = AuthService::getUserId();
        $csvDocument->location_file = $locationFile;
        $csvDocument->status = CsvParserStatus::CSV_PARSER_STATUS_DID_NOT_START;

        $csvDocument->save();

        return $csvDocument;
    }

    public static function getCsvDocumentWithErrorRows($csvDocumentKey)
    {
        return CsvDocument::select(
            DB::raw('csv_document.*'),
            DB::raw("concat(voters.first_name,' ',voters.last_name) as user_creator"),
            DB::raw('csv_document_theme.name as csv_document_theme_name')
        )
            ->withFileTheme()
            ->withUserCreator()
            ->with(['errorRows' => function ($q) {
            }])
            ->where('csv_document.key', $csvDocumentKey)
            ->first();
    }

    public static function getAllCsvUploadedDetails()
    {
        return CsvDocument::select(
            DB::raw('csv_document.*'),
            DB::raw("concat(voters.first_name,' ',voters.last_name) as user_creator"),
            DB::raw('csv_document_theme.name as csv_document_theme_name')
        )
            ->withFileTheme()
            ->withUserCreator()
            ->with(['errorRows' => function ($q) {
            }])
            ->orderBy('id','DESC')
            ->get();
    }

    public static function getById($csvDocumentId)
    {
        return CsvDocument::select()
            ->where('csv_document.id', $csvDocumentId)
            ->first();
    }

    public static function downloadById(int $csvDocumentId)
    {
        $csvDocument = self::getById($csvDocumentId);
        FileService::downloadFile($csvDocument->location_file, null, 'csv_uploaded', 'csv');
    }

    public static function downloadCsvErrorRowDataByTypeErrorAndNameField($csvDocumentId, $csvDocumentErrorRowType, $nameField = null)
    {
        $csvDocument = self::getById($csvDocumentId);
        $csvErrorRows = CsvDocumentErrorRowRepository::getByCsvIdErrorTypeAndNameFieldError($csvDocumentId, $csvDocumentErrorRowType, $nameField);
        $arrayIndexRowsError = $csvErrorRows->map(function ($row) {
            return $row->row_index;
        });

        $file = fopen($csvDocument->location_file, "r");
        $indexRow = 0;

        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=csv_errors_rows.csv");

        while (($data = fgetcsv($file, 0, ",")) !== false) {

            if ($arrayIndexRowsError->contains($indexRow) || ($indexRow == 0 && $csvDocument->header == 1)) {
                $fullRow = implode(',', $data);
                $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
                echo $rowToPrint;
            }

            $indexRow++;
        }

        fclose($file);
    }

    public static function stopUploadById($id)
    {
        CsvDocument::where('id', $id)->update([
            'status' => CsvParserStatus::CSV_PARSER_STATUS_CANCELLED
        ]);
    }
}
