<?php
namespace App\DTO;

use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\Area;
use App\Models\BallotBox;
use App\Models\BallotBoxRole;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionRolesByVoters;
use App\Models\Neighborhood;
use App\Models\SubArea;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;

class SearchAllocationDto
{

    const TAG = "SearchAllocationDto";

    /**
     * @var Area
     */
    public $area;

    /**
     * @var SubArea
     */
    public $subArea;

    /**
     * @var City
     */
    public $city;

    /**
     * @var Neighborhood
     */
    public $neighborhood;

    /**
     * @var Cluster
     */
    public $cluster;

    /**
     * @var BallotBox
     */
    public $ballotBox;


    /**
     * @var BallotBoxRole
     */
    public $ballotRole;

    /**
     * @var int
     */
    public $assignmentStatus;

    /**
     * @var int
     */
    public $currentPage;
}
