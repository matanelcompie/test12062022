<?php

namespace App\Http\Controllers\Activist;

use App\Enums\CommonEnum;
use App\Enums\ElectionRoleSystemName;
use App\Enums\GeographicEntityType;
use App\Http\Controllers\Controller;
use App\Http\Requests\SearchActivistRequest;
use App\Libraries\Services\ActivistAllocation\GeographicAllocationDto;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAssignmentsCreator;
use App\Libraries\Services\BallotCountsServices;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Models\ActivistAllocationAssignment;
use Illuminate\Http\Request;
use App\Models\ElectionCampaigns;
use App\Models\GeographicFilterTemplates;
use App\Models\ElectionRolesGeographical;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRoleShiftRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActivistAssignmentController extends Controller
{

    public static function addAssignmentForBallotActivist($electionRoleVoterKey, $ballotKey, $shiftRoleKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {

            $electionRoleByVoter = ElectionRolesByVotersRepository::getByKey($electionRoleVoterKey);
            $ballotBox = BallotBoxesRepository::getBallotBoxByKey($ballotKey);
            $geographicAllocation = new GeographicAllocationDto(GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX, $ballotBox->id);
            $shiftRole = ElectionRoleShiftRepository::getShiftRoleByKey($shiftRoleKey);

            $activist = ActivistsAssignmentsCreator::addAssignmentToActivist($electionRoleByVoter, $geographicAllocation, $shiftRole);
            $assignmentDetails = VotersActivistsService::getDetailsAssignmentByAssignmentId($activist->activistAllocationAssignment->id);
            $jsonOutput->setData($assignmentDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function addAssignmentForClusterLeaderActivist($clusterKey, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
            $voter = VotersRepository::getVoterByKey($voterKey);
            $cluster = ClusterRepository::getClusterByKey($clusterKey);
            $electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleVoterByElectionRoleSysteName($voter->id, ElectionRoleSystemName::CLUSTER_LEADER, $electionCampaignId);
            $geographicAllocation = new GeographicAllocationDto(GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER, $cluster->id);
            $activist = ActivistsAssignmentsCreator::addAssignmentToActivist($electionRoleByVoter, $geographicAllocation);
            $clusterDetails = VotersActivistsService::getDetailsAssignmentByAssignmentId($activist->activistAllocationAssignment->id);
            $jsonOutput->setData($clusterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    /**
     * Add multi assignment for driver activist
     *
     * @param Request $request include driver_clusters prams as array cluster key
     * @param string  $electionRoleByVoterKey
     * @return void
     */
    public static function addAssignmentForDriverActivist(Request $request, $electionRoleByVoterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $arrayClusterKey = $request->input('driver_clusters', null);
        $arrayNewAssignment = [];
        try {
            $electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRoleByKey($electionRoleByVoterKey);
            foreach ($arrayClusterKey as $key => $clusterKey) {
                $cluster = ClusterRepository::getClusterByKey($clusterKey);
                $geographicAllocation = new GeographicAllocationDto(GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER, $cluster->id);
                $activist = ActivistsAssignmentsCreator::addAssignmentToActivist($electionRoleByVoter, $geographicAllocation);
                $clusterDetails = VotersActivistsService::getDetailsAssignmentByAssignmentId($activist->activistAllocationAssignment->id);
                $arrayNewAssignment[] = $clusterDetails;
            }

            $jsonOutput->setData($arrayNewAssignment);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public static function addClusterAssignmentToClusterActivist($electionRoleByVoterKey, $clusterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $cluster = ClusterRepository::getClusterByKey($clusterKey);
            $electionRoleByVoter = ElectionRolesByVotersRepository::getByKey($electionRoleByVoterKey);
            $geographicAllocation = new GeographicAllocationDto(GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER, $cluster->id);
            $activist = ActivistsAssignmentsCreator::addAssignmentToActivist($electionRoleByVoter, $geographicAllocation);
            $clusterDetails = VotersActivistsService::getDetailsAssignmentByAssignmentId($activist->activistAllocationAssignment->id);
            $jsonOutput->setData($clusterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    

    /**
     * Get assignment id of cluster leader and voter key for another activist
     * Function delete the assignment and connect the allocation to the another activist
     * @return void
     */
    public static function deleteAssignmentAndConnectAllocationToActivist($activistAllocationAssignmentId, $voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $voter = VotersRepository::getVoterByKey($voterKey);
            $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
            $electionRoleByVoter = ElectionRolesByVotersRepository::getElectionRoleVoterByElectionRoleSysteName($voter->id, ElectionRoleSystemName::CLUSTER_LEADER, $electionCampaignId);
            $allocationDetails = ActivistsAllocationsAssignmentsRepository::getAllocationDetailsByAssignmentId($activistAllocationAssignmentId);
            $geographicAllocation = new GeographicAllocationDto(GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER, $allocationDetails->cluster_id);

            ActivistsAllocationsAssignmentsDelete::deleteActivistAllocationAssignment($activistAllocationAssignmentId, CommonEnum::YES);
            $activist = ActivistsAssignmentsCreator::addAssignmentToActivist($electionRoleByVoter, $geographicAllocation);

            $clusterDetails = VotersActivistsService::getDetailsAssignmentByAssignmentId($activist->activistAllocationAssignment->id);
            $jsonOutput->setData($clusterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function searchVoterAndCheckIfNotHasConflictRole(Request $request,$cityId=null)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $searchActivistRequest = new SearchActivistRequest($request,$cityId);
            $activistDetails = ActivistsAllocationsAssignmentsService::getVoterDetailsAndCheckDuplicateRoles($searchActivistRequest->searchActivist);
            $jsonOutput->setData($activistDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getAssignmentDetails(Request $request, $assignmentId = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $assignmentDetails = ActivistsAllocationsAssignmentsRepository::getAssignmentDetailsAndAllocationDetailsByAssignmentId($assignmentId);
            $jsonOutput->setData($assignmentDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

}
