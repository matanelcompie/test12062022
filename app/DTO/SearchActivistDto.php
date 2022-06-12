<?php

namespace App\DTO;

use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Illuminate\Http\Request;

class SearchActivistDto
{
    /**
     * @var City
     */
    public $city;

    /**
     * @var Voters
     */
    public $voter;

    /**
     * @var ElectionRoles
     */
    public $electionRole;

    /**
     * @var ElectionCampaigns
     */
    public $electionCampaign;
}
