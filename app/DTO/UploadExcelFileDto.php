<?php

namespace App\DTO;

use App\Libraries\Helper;
use App\Models\City;
use App\Models\CsvDocument;
use App\Models\CsvDocumentTheme;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Exception;
use Illuminate\Http\Request;

class UploadExcelFileDto
{
    /**
     * file object upload
     */
    public  $fileUploader;

    /**
     * @var string
     */
    public  $fileName;

    /**
     * field include header row in excel file 
     *
     * @var int - enum common 
     */
    public $isHeaderRow;

    /**
     *  theme of csv upload
     *
     * @var CsvDocumentTheme
     */
    public  $csvDocumentTheme;

    /**
     * un array of excel column for upload excel file
     *
     * @var array - ExcelColumnDto
     */
    public $excelColumns;

    /**
     * CsvDocument object include all details file , location count rows... and status
     *
     * @var CsvDocument
     */
    public $csvDocument;
}
