<?php

namespace App\Libraries\Services\ActivistAllocation;

use App\Enums\BallotRoleSystemName;
use App\Enums\ElectionRoleSystemName;
use App\Enums\GeographicEntityType;
use App\Http\Controllers\GlobalController;
use App\Http\Controllers\VoterElectionsController;
use App\Http\Requests\CreateAllocationRequest;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;

use App\Libraries\Services\ElectionRolesByVoters\ElectionRolesByVotersCreator;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Libraries\Services\Users\UserCreator;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\BallotBoxRole;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\BallotBoxRolesRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\QuarterRepository;
use App\Repositories\UserRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use stdClass;

class ActivistsAllocationsCreator
{

    /**
     * create allocation record for city role activist
     */
    public static function createAllocationForCityRole(int $cityId, int $clusterId = null, int $electionCampaignId, int $roleId, int $quarterId = null, int $createdBy = null)
    {
        self::checkPermissionAddDeleteInsertOrUpdateAllocation($roleId);
        $allocation = new ActivistsAllocations();
        $allocation->city_id = $cityId;
        $allocation->cluster_id = $clusterId;
        if ($allocation->cluster_id && !$quarterId) {
            $clusterDetails = ClusterRepository::getById($allocation->cluster_id);
            $quarterId = $clusterDetails->quarter_id;
        }
        $allocation->quarter_id = $quarterId;
        $allocation->election_campaign_id = $electionCampaignId;
        $allocation->election_role_id = $roleId;
        $allocation->created_by = $createdBy ?? AuthService::getUserVoterId();

        $electionRole = ElectionRolesRepository::getElectionRoleById($roleId);
        if (in_array($electionRole->system_name, self::getRolesSystemNameCanNotBeDuplicateAllocation())) {
            $existAllocation = self::getAllocationsArrayByAllocationDetails($allocation);
            if ($existAllocation && count($existAllocation) > 0)
                throw new Exception(config('errors.elections.ERROR_ADD_EXIST_ALLOCATION'));
        }

        $allocation->save();

        return $allocation;
    }

    /**
     * create allocation by ActivistCreateDto details
     * 
     * @param ActivistCreateDto $activistCreateDto
     * @param int $createdBy-voter_id
     * @return ActivistsAllocations
     */
    public static function createByActivistCreateDto(ActivistCreateDto $activistCreateDto, $createdBy = null)
    {
        $cityId = $activistCreateDto->city->id;
        $clusterId = $activistCreateDto->cluster ? $activistCreateDto->cluster->id : null;
        $quarterId = $activistCreateDto->quarter ? $activistCreateDto->quarter->id : null;
        $electionCampaignId = $activistCreateDto->electionCampaign->id;
        $electionRoleId = $activistCreateDto->electionRole->id;
        $createdBy = $createdBy ?? AuthService::getUserVoterId();
        self::createAllocationForCityRole($cityId, $clusterId, $electionCampaignId, $electionRoleId, $quarterId, $createdBy);
    }

    /**
     * create ballot activist
     *
     * @param int $cityId
     * @param int $clusterId
     * @param int $ballotBoxId
     * @param int $electionCampaignId
     * @param int $roleId
     * @param int $ballotBoxRoleId
     * @param int $createdBy
     * @throws Exception
     * @return ActivistsAllocations
     */
    private static function createAllocationForBallotRole($cityId, $clusterId, $ballotBoxId, $electionCampaignId, $roleId, $ballotBoxRoleId, $createdBy = null)
    {
        self::checkPermissionAddDeleteInsertOrUpdateAllocation($roleId);
        //check if exist not be multiple

        //check if exist - activist allocation of ballot box can not be multiple
        $activistAllocationBallot = ActivistsAllocationsRepository::getByBallotBoxId($ballotBoxId);
        if ($activistAllocationBallot)
            throw new Exception(config('errors.elections.ERROR_ADD_BALLOT_ALLOCATION'));
        $clusterDetails = ClusterRepository::getById($clusterId);
        $allocation = new ActivistsAllocations();
        $allocation->city_id = $cityId;
        $allocation->cluster_id = $clusterId;
        $allocation->quarter_id = $clusterDetails->quarter_id;
        $allocation->election_campaign_id = $electionCampaignId;
        $allocation->election_role_id = $roleId;
        $allocation->ballot_box_id = $ballotBoxId;
        $allocation->ballot_box_role_id = $ballotBoxRoleId;
        $allocation->created_by = $createdBy ?? AuthService::getUserVoterId();

        $electionRole = ElectionRolesRepository::getElectionRoleById($roleId);
        if (in_array($electionRole->system_name, self::getRolesSystemNameCanNotBeDuplicateAllocation())) {
            $existAllocation = self::getAllocationsArrayByAllocationDetails($allocation);
            if ($existAllocation && count($existAllocation) > 0)
                throw new Exception(config('errors.elections.ERROR_ADD_EXIST_ALLOCATION'));
        }

        $allocation->save();

        return $allocation;
    }

    /**
     * update ballot role for ballot allocation or create allocation if not exist allocation
     * and check if the ballot role  is counter and the assignment of the allocation not in counter shift
     * @throws Exception if is not admin user
     * @param BallotBox $ballotBox
     * @param BallotBoxRole $ballotBoxRole
     * @param int $userId
     * @return void
     */
    public static function updateBallotRoleOrCreateBallotAllocationIfNotExist(BallotBox $ballotBox, BallotBoxRole $ballotBoxRole, $userId = false)
    {
        $clusterDetails = ClusterRepository::getById($ballotBox->cluster_id);
        $activistAllocationBallot = ActivistsAllocationsRepository::getByBallotBoxId($ballotBox->id);
        $electionRole = BallotBoxRolesRepository::getElectionRoleByBallotRoleSystemName($ballotBoxRole->system_name);
        self::checkPermissionAddDeleteInsertOrUpdateAllocation($electionRole->id);
        if ($activistAllocationBallot) {
            if ($ballotBoxRole->system_name == BallotRoleSystemName::COUNTER) {
                $assignmentNotInCountShift = ActivistsAllocationsAssignmentsRepository::isBallotAllocationHasAssignmentNotInCounterShift($activistAllocationBallot->id);
                if ($assignmentNotInCountShift)
                    throw new Exception(config('errors.elections.ERROR_UPDATE_BALLOT_ROLE_IS_COUNT'));
            }

            $activistAllocationBallot->election_role_id = $electionRole->id;
            $activistAllocationBallot->ballot_box_role_id = $ballotBoxRole->id;
            $activistAllocationBallot->updated_by = $userId ?? AuthService::getUserId();
            $activistAllocationBallot->save();
        } else {
            self::createAllocationForBallotRole(
                $clusterDetails->city_id,
                $ballotBox->cluster_id,
                $ballotBox->id,
                $clusterDetails->election_campaign_id,
                $electionRole->id,
                $ballotBoxRole->id
            );
        }
    }

    /**
     * function get activistCreateDto and return GeographicAllocationDto by election role type and details allocation
     * @return GeographicAllocationDto
     */
    public static function getGeographicAllocationDtoByActivistDtoDetails(ActivistCreateDto $activistCreateDto)
    {
        $geographicalTypeRoleOptions = self::getAllocationGeoEntityOptionByElectionRoleSystemName($activistCreateDto->electionRole->system_name);
        //role by on allocation geographic option
        if (count($geographicalTypeRoleOptions) == 1) {
            $geographicalTypeRole = $geographicalTypeRoleOptions[0];
            switch ($geographicalTypeRole) {
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
                    $geographicAllocationValue = $activistCreateDto->ballotBox->id;
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                    $geographicAllocationValue = $activistCreateDto->cluster->id;
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                    $geographicAllocationValue = $activistCreateDto->city->id;
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_QUARTER'):
                    $geographicAllocationValue = $activistCreateDto->quarter->id;
                    break;

                default:
                    throw new Exception(config('errors.elections.ALLOCATION_NOT_EXISTS'));
            }
        } else {
            //role by multi geographic option like driver - is in quarter,city,cluster
            if ($geographicAllocationValue = $activistCreateDto->cluster) {
                $geographicAllocationValue = $activistCreateDto->cluster->id;
                $geographicalTypeRole = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER;
            } else if ($geographicAllocationValue = $activistCreateDto->quarter) {
                $geographicAllocationValue = $activistCreateDto->quarter->id;
                $geographicalTypeRole = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER;
            } else {
                $geographicAllocationValue = $activistCreateDto->city->id;
                $geographicalTypeRole = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY;
            }
        }


        $detailsTypeAllocation = new GeographicAllocationDto($geographicalTypeRole, $geographicAllocationValue);

        return $detailsTypeAllocation;
    }


    /**
     * function get system role name and return array of geographic that allocation can be,usually its be one in array
     * return array of type GeographicEntityType | enum 
     * @param string $electionRoleSystemName
     * @return array
     */
    public static function getAllocationGeoEntityOptionByElectionRoleSystemName($electionRoleSystemName)
    {

        $geographicEntityTypeOptions = array();
        if (in_array($electionRoleSystemName, ElectionRolesRepository::getBallotRolesSystemName()))
            $geographicEntityTypeOptions[] = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX;


        if (in_array($electionRoleSystemName, ElectionRolesRepository::getClusterRolesSystemName()))
            $geographicEntityTypeOptions[] = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER;

        if (in_array($electionRoleSystemName, ElectionRolesRepository::getQuarterRolesSystemName()))
            $geographicEntityTypeOptions[] = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER;


        if (in_array($electionRoleSystemName, ElectionRolesRepository::getCityRolesSystemName()))
            $geographicEntityTypeOptions[] = GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY;

        return $geographicEntityTypeOptions;
    }

    /*
    return array of system name election role not need manual allocation
     */
    public static function getElectionRolesNotNeedManualAllocation()
    {
        return [
            // config('constants.activists.election_role_system_names.muniDirector'),
            // config('constants.activists.election_role_system_names.muniSecretary'),
            // config('constants.activists.election_role_system_names.optimizerCoordinator'),
            // config('constants.activists.election_role_system_names.driversCoordinator'),
            // config('constants.activists.election_role_system_names.quarterDirector'),
            // config('constants.activists.election_role_system_names.motivatorCoordinator'),
            // config('constants.activists.election_role_system_names.allocationCoordinator'),
        ];
    }

    public static function getElectionRolesByGeoEntityTypeForAddAllocation(int $geoEntityType)
    {
        $rolesSystemName = array();
        switch ($geoEntityType) {
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY:
                $rolesSystemName = ElectionRolesRepository::getCityRolesSystemName();
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER:

                $rolesSystemName = ElectionRolesRepository::getClusterRolesSystemName();
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER:
                $rolesSystemName = ElectionRolesRepository::getQuarterRolesSystemName();
                break;
        }

        return ElectionRolesRepository::getBySystemNameArray($rolesSystemName);
    }

    public static function createAllocationByGeoEntityTypeAndRole(CreateAllocationRequest $createAllocationRequest)
    {
        $electionCampaign = ElectionCampaigns::currentCampaign();
        $geoEntityValue = $createAllocationRequest->GeographicEntityValue;
        $cityId = null;
        $clusterId = null;
        $quarterId = null;
        switch ($createAllocationRequest->GeographicEntityType) {
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CITY:
                $cityId = $geoEntityValue;
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_CLUSTER:
                $cluster = ClusterRepository::getById($geoEntityValue);
                $clusterId = $geoEntityValue;
                $cityId = $cluster->city_id;
                $quarterId = $cluster->quarter_id;
                break;
            case GeographicEntityType::GEOGRAPHIC_ENTITY_TYPE_QUARTER:
                $quarter = QuarterRepository::getQuarterById($geoEntityValue);
                $cityId = $quarter->city_id;
                $quarterId = $quarter->id;
                break;

            default:
                break;
        }

        $electionRole = ElectionRolesRepository::getElectionRoleById($createAllocationRequest->ElectionRoleId);
        self::createAllocationForCityRole(
            $cityId,
            $clusterId,
            $electionCampaign->id,
            $electionRole->id,
            $quarterId
        );
    }

    /**
     * function check if user has permission for add allocation
     * and check if the user is admin only if the allocation is ballot member 
     * @throws Exception if not has permission
     * @param integer $electionRoleId
     * @return void
     */
    public static function checkPermissionAddDeleteInsertOrUpdateAllocation(int $electionRoleId)
    {
        $ballotMemberSystemName = ElectionRoleSystemName::BALLOT_MEMBER;
        $ballotMemberRole = ElectionRolesRepository::getBySystemName($ballotMemberSystemName);
        $isHasPermission = AuthService::isUserHasPermission('elections.activists.add_allocations');
        if (!$isHasPermission)
            throw new Exception(config('errors.elections.ERROR_PERMISSION_UPDATE_ALLOCATION'));

        //ballot member must be admin 
        if ($ballotMemberRole->id == $electionRoleId && !AuthService::isAdmin())
            throw new Exception(config('errors.elections.ERROR_PERMISSION_UPDATE_ALLOCATION'));
    }

    private static function getRolesSystemNameCanNotBeDuplicateAllocation()
    {
        return [
            ElectionRoleSystemName::MUNI_DIRECTOR,
            ElectionRoleSystemName::QUARTER_DIRECTOR
        ];
    }

    /**
     * Get ActivistsAllocations with details and return array ActivistsAllocations with the same details
     *
     * @param ActivistsAllocations $activistsAllocation
     * @return array
     */
    public static function getAllocationsArrayByAllocationDetails(ActivistsAllocations $activistsAllocation)
    {
        $allocation = ActivistsAllocations::select()
            ->where('election_campaign_id', $activistsAllocation->election_campaign_id)
            ->where('election_role_id', $activistsAllocation->election_role_id)
            ->where('city_id', $activistsAllocation->city_id);

        if ($activistsAllocation->cluster_id)
            $allocation->where('cluster_id', $activistsAllocation->cluster_id);
        else
            $allocation->whereNull('cluster_id');

        if ($activistsAllocation->ballot_box_id)
            $allocation->where('ballot_box_id', $$activistsAllocation->ballot_box_id);
        else
            $allocation->whereNull('ballot_box_id');

        if ($activistsAllocation->quarter_id)
            $allocation->where('quarter_id', $activistsAllocation->quarter_id);
        else
            $allocation->whereNull('quarter_id');
            
        $allocation = $allocation->get();

        return  $allocation;
    }
}
