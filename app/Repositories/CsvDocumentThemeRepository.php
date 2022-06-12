<?php

namespace App\Repositories;

use App\Enums\CsvParserStatus;
use App\Libraries\Helper;
use App\Models\CsvDocument;
use App\Models\CsvDocumentTheme;
use DB;
use Exception;

class CsvDocumentThemeRepository
{

    public static function getBySystemName(string $systemName)
    {
        $csvDocumentTheme = CsvDocumentTheme::select()->where('system_name', $systemName)->first();
        if (!$csvDocumentTheme)
            throw new Exception(config('errors.global.NOT_SELECTED_ALL_EXCEL_COLUMN_ON_UPLOADER'));

        return $csvDocumentTheme;
    }

    public static function getById(int $id)
    {
        $csvDocumentTheme = CsvDocumentTheme::select()->where('id', $id)->first();
        if (!$csvDocumentTheme)
            throw new Exception(config('errors.global.NOT_SELECTED_ALL_EXCEL_COLUMN_ON_UPLOADER'));

        return $csvDocumentTheme;
    }
}
