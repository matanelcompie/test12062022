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

class UploadExcelElectionVotesDto extends UploadExcelFileDto
{
    /**
     *election campaign upload votes
     *
     * @var int
     */
    public $electionCampaignId;

    /**
     * upload votes ballot for municipal
     *
     * @var City
     */
    public $city;
}
