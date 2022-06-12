<?php

namespace App\DTO;

use App\Libraries\Helper;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Exception;
use Illuminate\Http\Request;

class ExcelColumnDto
{
    public function __construct(string $nameColumn, string $displayNameColumn, bool $require = true, $multiple = false)
    {
        $this->nameColumn = $nameColumn;
        $this->displayNameColumn = $displayNameColumn;
        $this->multiple = $multiple;
        $this->nameColumn = $nameColumn;
        $this->require = $require;
    }
    public $nameColumn;
    public $displayNameColumn;
    public $multiple;
    public $excelIndexColumn;
    public $require;
}
