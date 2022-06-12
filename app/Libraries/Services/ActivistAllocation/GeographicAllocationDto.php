<?php

namespace App\Libraries\Services\ActivistAllocation;

use App\Enums\GeographicEntityType;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\QuarterRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class GeographicAllocationDto
{

    const TAG = "GeographicAllocationDto";

    public $geographicType;
    public $geographicValue;

    public $city;
    public $cluster;
    public $quarter;
    public $ballotBox;

    public function __construct($GeographicType, $GeographicValue)
    {
        $this->geographicType = $GeographicType;
        $this->geographicValue = $GeographicValue;
    }

    public function setDetailsGeographic()
    {
        switch ($this->geographicType) {
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY:
                $this->city = CityRepository::getById($this->geographicValue);
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER:
                $this->cluster = ClusterRepository::getById($this->geographicValue);
                $this->city = CityRepository::getById($this->cluster->city_id);
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER:
                $this->quarter = QuarterRepository::getQuarterById($this->geographicValue);
                $this->city = CityRepository::getById($this->quarter->city_id);
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX:
                $this->ballotBox = BallotBoxesRepository::getById($this->geographicValue);
                $this->cluster = ClusterRepository::getById($this->ballotBox->cluster_id);
                if ($this->cluster->quarter_id)
                    $this->quarter = QuarterRepository::getQuarterById($this->cluster->quarter_id);
                $this->city = CityRepository::getById($this->cluster->city_id);
                break;

            default:
                break;
        }

    }
}
