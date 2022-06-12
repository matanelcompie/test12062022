<?php

namespace App\Http\Controllers\Activist;

use App\Enums\ElectionRoleSystemName;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAllocationRequest;
use App\Http\Requests\SearchAllocationRequest;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ActivistAllocation\GeographicAllocationDto;
use App\Libraries\Services\ActivistAllocation\SearchAllocation;
use App\Libraries\Services\UserLogin\AuthService;
use Illuminate\Http\Request;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\BallotBoxRolesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRolesRepository;
use Exception;
use Illuminate\Support\Facades\DB;


class ActivistAllocationController extends Controller
{

    /**
     * Get ballot key and ballot role , function add allocation for ballot if not exist for ballot role
     * or update ballot role if exist allocation
     * if the ballot role is null thr function remove thr allocation if not has assignment
     * @throws Exception If user not has permission
     * @param string $ballotBoxKey
     * @param string $ballotBoxRoleKey
     */
    public function updateCreateOrDeleteBallotAllocation($ballotBoxKey, $ballotBoxRoleKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {

            if (is_null($ballotBoxKey))
                throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_BALLOT_BOX'));
            $ballotBox = BallotBoxesRepository::getBallotBoxByKey($ballotBoxKey);

            if (is_null($ballotBoxRoleKey) || $ballotBoxRoleKey == "null") {
                $ballotAllocationExist = ActivistsAllocationsRepository::getByBallotBoxId($ballotBox->id);
                if (!$ballotAllocationExist)
                    throw new Exception(config('errors.elections.VOTER_ACTIVIST_MISSING_BALLOT_BOX_ROLE'));
                ActivistsAllocationsRepository::deleteActivistAllocation($ballotAllocationExist->id);
                $jsonOutput->setData(true);
            } else {
                $ballotBoxRole = BallotBoxRolesRepository::getByKey($ballotBoxRoleKey);
                ActivistsAllocationsCreator::updateBallotRoleOrCreateBallotAllocationIfNotExist($ballotBox, $ballotBoxRole);

                $ballotAllocationDetails = BallotBoxesRepository::getBallotBoxRoleByBallotBoxId($ballotBox->id);
                $jsonOutput->setData($ballotAllocationDetails);
            }
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function deleteBallotAllocationByKey($ballotBoxKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $ballotBox = BallotBoxesRepository::getBallotBoxByKey($ballotBoxKey);
            $allocation = BallotBoxesRepository::getAllocationByBallotId($ballotBox->id);
            if (!$allocation)
                throw new Exception(config('errors.elections.ERROR_ALLOCATION_ID'));
            ActivistsAllocationsRepository::deleteActivistAllocation($allocation->id);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function getBallotArrayWithAssignmentBySearchDetails(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $searchAllocationRequest = new SearchAllocationRequest($request);
            $result = SearchAllocation::ballotsSearch($searchAllocationRequest->searchAllocation);
            $jsonOutput->setData($result);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public static function getClustersWithAssignmentStatusForClusterActivist(Request $request, $electionRoleByVoterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRoleByKey($electionRoleByVoterKey);
            $searchAllocationRequest = new SearchAllocationRequest($request);
            if (!$electionRoleByVoter)
                throw new Exception(config('errors.elections.VOTER_ELECTION_ROLE_RECORD_DOESNT_EXIST'));
            switch ($electionRoleByVoter->system_name) {
                case ElectionRoleSystemName::CLUSTER_LEADER:
                    $result = SearchAllocation::clusterLeaderSearch($searchAllocationRequest->searchAllocation);
                    break;
                case ElectionRoleSystemName::MOTIVATOR:
                    $result = SearchAllocation::motivatorSearch($searchAllocationRequest->searchAllocation);
                    break;
                case ElectionRoleSystemName::DRIVER:
                    $result = SearchAllocation::driverSearch($searchAllocationRequest->searchAllocation);
                    break;
                default:
                    # code...
                    break;
            }

            $jsonOutput->setData($result);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function deleteAllocationById($activistAllocationId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            ActivistsAllocationsRepository::deleteActivistAllocation($activistAllocationId);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public  function addAllocationNotForBallot(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            if (!AuthService::isAdmin())
                throw new Exception(config('errors.elections.ERROR_ADD_ALLOCATION_PERMISSION'));

            $createAllocationRequest = new CreateAllocationRequest();
            $createAllocationRequest->GeographicEntityType = $request->input('GeographicEntityType', null);
            $createAllocationRequest->GeographicEntityValue = $request->input('GeographicEntityValue', null);
            $createAllocationRequest->ElectionRoleId = $request->input('ElectionRoleId', null);

            ActivistsAllocationsCreator::createAllocationByGeoEntityTypeAndRole($createAllocationRequest);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getElectionRolesForAddAllocationByGeoEntityType(Request $request, $geoEntityType)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $electionRoles = ActivistsAllocationsCreator::getElectionRolesByGeoEntityTypeForAddAllocation(intval($geoEntityType));
            $jsonOutput->setData($electionRoles);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getCityClustersAllocations(Request $request, $cityId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $city = CityRepository::getById($cityId);
            $electionRoleId = $request->input('election_role_id', null);
            $electionRole = ElectionRolesRepository::getElectionRoleById($electionRoleId);
            $cityClusters = ActivistsAllocationsRepository::getCityClustersAllocations($city, $electionRole);
            $jsonOutput->setData($cityClusters);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getAllocationBallotBoxByCity(Request $request, $cityId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $electionRoleId = $request->input('election_role_id', null);
            $cityClusters = ActivistsAllocationsRepository::getAllocationBallotBoxByCity($cityId, $electionRoleId);
            $jsonOutput->setData($cityClusters);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getCityQuarterAllocationByElectionRole(Request $request, $cityId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $city = CityRepository::getById($cityId);
            $electionRoleId = $request->input('election_role_id', null);
            $electionRole = ElectionRolesRepository::getElectionRoleById($electionRoleId);
            $cityQuarters = ActivistsAllocationsRepository::getCityQuarterAllocationByElectionRole($city, $electionRole);
            $jsonOutput->setData($cityQuarters);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    /**
     * function get GeographicEntityType and GeographicEntityValue ,
     * and return GeographicAllocationDto with geographic details
     */
    public static function getGeographicDetailsByGeographicEntityValue(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $geographicAllocation = new GeographicAllocationDto(
                $request->input('geographicType', null),
                $request->input('geographicValue', null)
            );

            $geographicAllocation->setDetailsGeographic();

            $jsonOutput->setData($geographicAllocation);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
