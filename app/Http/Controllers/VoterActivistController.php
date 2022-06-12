<?php

namespace App\Http\Controllers;

use App\Enums\CommonEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateActivistRequest;
use App\Libraries\Services\activists\ActivistsAssignmentsExportService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistUpdateDto;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistUpdator;
use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersDelete;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;

use App\Libraries\Services\ServicesModel\ActivistsAllocationsAssignmentsService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\VotersWithCaptainService;
use App\Models\ElectionCampaigns;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionCampaignRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\ElectionRoleShiftRepository;
use Exception;
use File;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use View;

class VoterActivistController extends Controller
{

    //TODO::remove after finish arrange
    // public function addElectionActivistClusters(Request $request, $record_key)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     $result = ActivistsAllocationsAssignmentsService::addElectionActivistClusters($request, $record_key);
    //     if (!empty($result)) {
    //         $jsonOutput->setData($result);
    //     }
    // }

    // public function editElectionActivistRole(Request $request, $election_role_by_voter_key)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     $result = ElectionRoleByVoterService::editElectionActivistRole($jsonOutput, $request, $election_role_by_voter_key);
    //     if (!empty($result)) {
    //         $jsonOutput->setData($result);
    //     }
    // }

    public function deleteElectionActivistRole($electionRoleByVoterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $electionRoleVoter = ElectionRolesByVotersRepository::getByKey($electionRoleByVoterKey);
            ElectionRolesByVotersDelete::deleteElectionRoleByVoterId($electionRoleVoter->id);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getElectionActivistClusters($record_key)
    {
        $jsonOutput = app()->make("JsonOutput");

        $result = ActivistsAllocationsAssignmentsService::getElectionActivistClusters($record_key);
        if (!empty($result)) {
            $jsonOutput->setData($result);
        }
    }

    public function getElectionActivist($record_key)
    {
        $jsonOutput = app()->make("JsonOutput");

        $result = ActivistsAllocationsAssignmentsService::getElectionActivist($record_key);
        if (!empty($result)) {
            $jsonOutput->setData($result);
        }
    }

    // public function editElectionActivistInstructed(Request $request, $election_role_by_voter_key)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     $result = ElectionRoleByVoterService::editElectionActivistInstructed($jsonOutput, $request, $election_role_by_voter_key);
    //     if (!empty($result)) {
    //         $jsonOutput->setData($result);
    //     }
    // }

    public function searchElectionActivists(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        $resultArray = VotersActivistsService::searchElectionActivists($jsonOutput, $request);
        if (!empty($resultArray)) {
            $jsonOutput->setData($resultArray);
        }
    }

    public function getVoterMinisterOfFifty($personal_identity)
    {

        $jsonOutput = app()->make("JsonOutput");

        $resultArray = VotersWithCaptainService::getVoterMinisterOfFifty($personal_identity);
        if (!empty($resultArray)) {
            $jsonOutput->setData($resultArray);
        }
    }

    public function getCaptainOfFifty($voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $captainObj = VotersWithCaptainService::getCaptainOfFifty($jsonOutput, $voterKey);
            $jsonOutput->setData($captainObj);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function allocateVoterToCaptain50($voterKey, $captainKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $captainObj = VotersWithCaptainService::allocateVoterToCaptain50($jsonOutput, $voterKey, $captainKey);
        if (!empty($captainObj)) {
            $jsonOutput->setData($captainObj);
        }
    }

    public function unAllocateVoterToCaptain50($voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $result = VotersWithCaptainService::unAllocateVoterToCaptain50($jsonOutput, $voterKey);
        if (!empty($result)) {
            $jsonOutput->setData('ok');
        }
    }

    public function getCityElectionRoleBudget(Request $request)
    {
        MunicipalElectionsRolesService::getCityElectionRoleBudget($request);
    }

    /**
     * Get all voter activist roles.
     * -> include also old election campaigns.
     */
    public function getAllHistoryElectionActivistRoles($voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $currentVoter = VotersActivistsService::getElectionActivistRoles($voterKey, false);
        $jsonOutput->setData($currentVoter);
    }

    public function getElectionActivistRoles($voterKey, $specificElectionKey = false)
    {
        $jsonOutput = app()->make("JsonOutput");
        if($specificElectionKey && $specificElectionKey!='')
        $electionCampaign=ElectionCampaignRepository::getByKey($specificElectionKey);
        else
        $electionCampaign=ElectionCampaigns::currentCampaign();
        $currentVoter = VotersActivistsService::getElectionActivistRoles($voterKey, true,$electionCampaign->id);
        $jsonOutput->setData($currentVoter);
    }

    public function getRoleVoterDetailsByKey($electionRoleByVoterKey){
     
        $jsonOutput = app()->make("JsonOutput");
        $currentVoter = ElectionRolesByVotersRepository::getRoleVoterDetailsAndCampaignByKey($electionRoleByVoterKey);
        $jsonOutput->setData($currentVoter);
    }


    public function deleteActivistAllocationAssignment($activistAllocationAssignmentId, $isDeleteRoleVoter = false)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            ActivistsAllocationsAssignmentsDelete::deleteActivistAllocationAssignment($activistAllocationAssignmentId, $isDeleteRoleVoter);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    



    //TODO::remove after finish arrange
    // public function deleteDriverCluster($election_role_by_voter_geographic_areas_key)
    // {
    //     $jsonOutput = app()->make("JsonOutput");
    //     try {
    //         $result = ActivistsAllocationsAssignmentsDelete::deleteActivistAllocationAssignment($election_role_by_voter_geographic_areas_key);
    //         if ($result)
    //             $jsonOutput->setData(true);
    //     } catch (\Exception $e) {
    //         $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
    //     }
    // }

    public function bindGeoClusterToActivist(&$jsonOutput, $election_role_by_voter_key, $cluster_key)
    {
        $result = ActivistsAllocationsAssignmentsService::bindGeoClusterToActivist($jsonOutput, $election_role_by_voter_key, $cluster_key);
        if (!empty($result)) {
            $jsonOutput->setData($result);
        }
    }

    //TODO:remove after finish arrange
    // public function bindGeoBallotToActivist(Request $request, &$jsonOutput, $election_role_by_voter_key, $ballotKey, $shift_key)
    // {
    //     $jsonOutput = app()->make("JsonOutput");

    //     if (is_null($election_role_by_voter_key)) {
    //         $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
    //         return;
    //     }

    //     if (is_null($shift_key)) {
    //         $jsonOutput->setErrorCode(config('errors.elections.INVALID_SHIFT'));
    //         return;
    //     }

    //     if (is_null($ballotKey)) {
    //         $jsonOutput->setErrorCode(config('errors.elections.VOTER_ACTIVIST_MISSING_BALLOT_BOX'));
    //         return;
    //     }

    //     $result = ActivistsAllocationsAssignmentsService::bindGeoBallotToActivist($request, $jsonOutput, $election_role_by_voter_key, $ballotKey, $shift_key);
    //     if ($result) {
    //         $jsonOutput->setData($result);
    //     }
    // }


    // Edit ballot shift details
    // public function editBallotActivistShiftDetails(Request $request, $allocationsAssignmentId)
    // {
    //     $jsonOutput = app()->make("JsonOutput");
    //     ActivistsAllocationsAssignmentsService::editBallotActivistShiftDetails($jsonOutput, $request,  $allocationsAssignmentId);
    // }

    // Edit ballot shift details
    public function editBallotActivistShift($allocationsAssignmentId, $shiftRoleKey)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $Assignment = ActivistsAllocationsAssignmentsRepository::getById($allocationsAssignmentId);
            $shiftRole = ElectionRoleShiftRepository::getShiftRoleByKey($shiftRoleKey);
            $activistUpdate = new ActivistUpdateDto();
            $activistUpdate->activistAllocationAssignment = $Assignment;
            $activistUpdate->shiftRole = $shiftRole;
            $activistUpdate = ActivistUpdator::updateActivist($activistUpdate);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function editRolePaymentComments(Request $request, $rolePaymentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $jsonOutput = app()->make("JsonOutput");
            $payment = ActivistRolesPaymentsRepository::getById($rolePaymentId);
            $activistUpdate = new ActivistUpdateDto();
            $activistUpdate->activistRolesPayment = $payment;
            $activistUpdate->comment = $request->input('value', '');
            $activistUpdate = ActivistUpdator::updateActivist($activistUpdate);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function changeLockStatus(Request $request, $rolePaymentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $activistUpdate = new ActivistUpdateDto();
            $activistUpdate->isPaymentLock = $request->input('value') ? CommonEnum::YES : CommonEnum::NO;
            $activistUpdate->activistRolesPayment = ActivistRolesPaymentsRepository::getById($rolePaymentId);
            ActivistUpdator::updateActivist($activistUpdate);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function editElectionActivistSum(Request $request, $rolePaymentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $activistUpdate = new ActivistUpdateDto();
            $activistUpdate->sum = $request->input('value');
            $activistUpdate->activistRolesPayment = ActivistRolesPaymentsRepository::getById($rolePaymentId);
            ActivistUpdator::updateActivist($activistUpdate);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    //edit not check location of ballot member
    public function editNotCheckLocation(Request $request, $election_role_geo_key)
    {
        $jsonOutput = app()->make("JsonOutput");
        ActivistsAllocationsAssignmentsService::editNotCheckLocation($jsonOutput, $request, $election_role_geo_key);
    }
    public function uploadActivistsAllocationsFile(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $result = false;
        try {
            $result = ActivistsAllocationsService::uploadActivistsAllocationsFile($request);
        } catch (\Throwable $th) {
            Log::info($th);
        }
        if (!$result) {
            $jsonOutput->setErrorCode(config('constants.system.SYSTEM_ERROR'));
            return;
        }
        $jsonOutput->setData($result);
    }
    public function exportActivists(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        ActivistsAssignmentsExportService::exportActivists($request);
    }

    public function exportClusterActivists(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        ActivistsAssignmentsExportService::exportClusterActivists($request);
    }

    public function exportActivistsBankPaymentData(Request $request, $electionRoleByVoterKey)
    {
        // $jsonOutput = app()->make("JsonOutput");
        // $jsonOutput->setBypass(true);
        // ActivistsAssignmentsExportService::exportActivistsBankPaymentData($request, $electionRoleByVoterKey);
    }

    public function printCityActivistsTotalPaymentLetter(Request $request, $city_key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        $electionCampaignId=$request->input('electionCampaignId');
        $view_result=ActivistsAssignmentsExportService::printCityActivistsTotalPaymentLetter($city_key,$electionCampaignId);
        return   $view_result;
    }

    public function printElectionActivistTotalPaymentDoc(Request $request, $electionRoleByVoterKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        return  ActivistsAssignmentsExportService::printElectionActivistTotalPaymentDoc($electionRoleByVoterKey);
    }


    public function exportTashbetzCsv()
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        ActivistsAssignmentsExportService::exportTashbetzCsv();
    }

    public function exportElectionActivists(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        ActivistsAssignmentsExportService::exportElectionActivists($request);
    }

    /**
     * function return all assignment details of allocation by allocation id
     *
     * @param Request $request
     * @param int $allocationId
     * @return void
     */
    public static function getAssignmentByAllocationId(Request $request, $allocationId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $assignments = ActivistsAllocationsAssignmentsRepository::getByActivistAllocationId($allocationId);
            $jsonOutput->setData($assignments);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    /**
     * update activist details of activistUpdateDto
     *
     * @param Request with details UpdateActivistRequest
     * @return void
     */
    public static function updateActivistDto(Request $request)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $updateActivistRequest = new UpdateActivistRequest($request);
            ActivistUpdator::updateActivist($updateActivistRequest->activistUpdateDto);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
