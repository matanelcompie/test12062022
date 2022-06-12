<?php

namespace App\DTO;

use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Illuminate\Http\Request;

class TransportationCarDto
{

  public function __construct(array $properties = null)
  {
    if ($properties)
      foreach ($properties as $key => $value) {
        $this->{$key} = $value;
      }
  }

  /**
   * @var int
   */
  public $PassengerCount;

  /**
   * @var int
   */
  public $CarNumber;

  /**
   * @var int
   */
  public $CarType;

  /**
   * @var int
   */
  public $electionRoleByVoterId;
}
