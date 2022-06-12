<?php

namespace App\DTO;

use App\Libraries\Helper;
use App\Models\City;
use App\Models\CsvDocument;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Exception;
use Illuminate\Http\Request;

class CsvThemeDto
{
    /**
     * @var string
     */
    public  $fileThemeName;

    /**
     * enum file theme
     *
     * @var int
     */
    public  $fileThemeId;

    /**
     * un array of excel column for upload excel file
     *
     * @var array - ExcelColumnDto
     */
    public $excelColumns;

    /**
     * is must be header in excel uploader
     *
     * @var bool
     */
    public $mustHeader;
}
