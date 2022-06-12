<?php

namespace App\DTO;

use App\Libraries\Helper;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Exception;
use Illuminate\Http\Request;

class TeamRequestDetailsDto
{

    public function __construct($teamKey, $title, $phoneNumber, $signature)
    {
        $this->team_key = $teamKey;
        $this->title = $title;
        $this->phone_number = $phoneNumber;
        $this->signature = $signature;
    }

    public $team_key;
    /**
     * @var string
     */
    public $title;

    /**
     * @var string
     */
    public $phone_number;

    /**
     * @var string
     */
    public $signature;

}
