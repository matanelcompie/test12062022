<?php
namespace App\Http\Requests;

use App\DTO\SearchAllocationDto;
use App\Enums\SendMessageType;
use App\Libraries\Helper;

use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Models\ElectionCampaigns;
use App\Models\Neighborhood;
use App\Repositories\AreaRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\BallotBoxRolesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\NeighborhoodRepository;
use App\Repositories\SubAreaRepository;

use Exception;
use Illuminate\Http\Request;

class SearchAllocationRequest
{
    /**
     * @var SearchAllocationDto
     */
    public $searchAllocation;

    /**
     * @throws \Exception
     */
    public function __construct(Request $request)
    {
        $this->createSearchAllocationDto($request);
    }

    /**
     * @param Request $request
     * @param string $cityKey
     * @throws \Exception
     */
    private function createSearchAllocationDto(Request $request)
    {
        $searchAllocation = new SearchAllocationDto();

        if (!is_null($request->input('area_id'))) {
            $searchAllocation->area = AreaRepository::getById($request->input('area_id'));
        }

        if (!is_null($request->input('subAreaId'))) {
            $searchAllocation->subArea = SubAreaRepository::getById($request->input('subAreaId'));
        }

        if (!is_null($request->input('city_id'))) {
            $searchAllocation->city = CityRepository::getById($request->input('city_id'));
        }

        if (!is_null($request->input('neighborhood_id'))) {
            $searchAllocation->neighborhood = NeighborhoodRepository::getById($request->input('neighborhood_id'));
        }

        if (!is_null($request->input('cluster_id'))) {
            $searchAllocation->cluster = ClusterRepository::getById($request->input('cluster_id'));
        }

        if (!is_null($request->input('assignment_status'))) {
            $searchAllocation->assignmentStatus = (int)$request->input('assignment_status');
        }

        if (!is_null($request->input('ballot_id'))) {
            $searchAllocation->ballotBox = BallotBoxesRepository::getById($request->input('ballot_id'));
        }

        if (!is_null($request->input('ballot_role_id'))) {
            $searchAllocation->ballotRole = BallotBoxRolesRepository::getById($request->input('ballot_role_id'));
        }

        $this->searchAllocation = $searchAllocation;
    }
}
