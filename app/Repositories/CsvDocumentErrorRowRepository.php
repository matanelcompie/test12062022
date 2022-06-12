<?php

namespace App\Repositories;

use App\Enums\CsvParserStatus;
use App\Libraries\Helper;
use App\Models\CsvDocument;
use App\Models\CsvDocumentErrorRow;
use DB;


class CsvDocumentErrorRowRepository
{
    public static function insert($csvDocumentId, $rowIndex, $colIndex, $errorType, $nameFieldError, $errorMessage=null)
    {
        $csvDocumentErrorRow = new CsvDocumentErrorRow();
        $csvDocumentErrorRow->csv_document_id = $csvDocumentId;
        $csvDocumentErrorRow->row_index = $rowIndex;
        $csvDocumentErrorRow->col_index = $colIndex;
        $csvDocumentErrorRow->error_type = $errorType;
        $csvDocumentErrorRow->name_field_error = $nameFieldError;
        $csvDocumentErrorRow->error_message = $errorMessage;

        $csvDocumentErrorRow->save();

        return $csvDocumentErrorRow;
    }

    /**
     * get error rows in csv document upload , by error type row or specific field error
     *
     * @param int $csvDocumentId
     * @param int | CsvDocumentErrorRowType enum $csvDocumentErrorRowType
     * @param string|null $nameFieldError
     * @return CsvDocumentErrorRow
     */
    public static function getByCsvIdErrorTypeAndNameFieldError($csvDocumentId, $csvDocumentErrorRowType, string $nameFieldError = null)
    {
        $csvDocumentErrorRow = CsvDocumentErrorRow::select()->where('csv_document_id', $csvDocumentId)
            ->where('error_type', $csvDocumentErrorRowType);

        if ($nameFieldError) {
            $csvDocumentErrorRow->where('name_field_error', $nameFieldError);
        }

        return $csvDocumentErrorRow->get();
    }
}
