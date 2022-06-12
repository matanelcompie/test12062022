<?php

namespace App\Repositories;

use App\Enums\ElectionRoleSystemName;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistsAllocationsAssignmentsDelete;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistsAllocations;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\Quarter;
use DB;
use Exception;
use Log;

class QuarterRepository
{
    /**
     * @throws Exception
     * @return Quarter
     */
    public static function getQuarterById($id)
    {
        $quarter = Quarter::select()->where('id', $id)->first();
        if (!$quarter)
            throw new Exception(config('errors.global.QUARTER_NOT_EXISTS'));

        return $quarter;
    }

    /**
     * @throws Exception
     * @return Quarter
     */
    public static function getQuarterByKey($key)
    {
        $quarter = Quarter::select()->where('key', $key)->first();
        if (!$quarter)
            throw new Exception(config('errors.global.QUARTER_NOT_EXISTS'));

        return $quarter;
    }

    /**
     * @throws Exception
     * @return array Quarters
     */
    public static function getQuartersByCityId($cityId)
    {
        return Quarter::select()->where('city_id', $cityId)->get();
    }

    /**
     * delete last quarter director and update new quarter id   
     * @return void
     */
    public static function connectQuarterDirectorToQuarter($quarterId, $quarterDirectorVoterId)
    {

        $quarters = Quarter::where('id', $quarterId)->first();

        if (!is_null($quarters->quarter_director_id)) {
            throw new Exception(config('errors.elections.ERROR_CREATE_QUARTER_DIRECTOR_IN_QUARTER_EXIST_DIRECTOR'));
        }

        self::updateQuarterDirector($quarterId, $quarterDirectorVoterId);
    }

    /**
     * update quarter director null by activist assignment
     * @param ActivistAllocationAssignment $assignment
     * @return void
     */
    public static function resetQuarterDirectorByDirectorAssignment(ActivistAllocationAssignment $assignment)
    {
        $activistAllocation = ActivistsAllocationsRepository::getById($assignment->activist_allocation_id);
        self::updateQuarterDirector($activistAllocation->quarter_id, null);
    }

    /**
     * @return void
     */
    private static function updateQuarterDirector($quarterId, $quarterDirectorVoterId)
    {
        Quarter::where('id', $quarterId)->update(['quarter_director_id' => $quarterDirectorVoterId]);
    }

    /**
     * Add quarter  connect list cluster , and add allocation of quarter coordinator
     *
     * @param City $city
     * @param string $quarterName
     * @param array $arrClustersId
     * @return void
     */
    public static function addQuarterAndConnectClusters(City $city, string $quarterName, array $arrClustersId,ElectionCampaigns $electionCampaign)
    {
        DB::beginTransaction();

        try {
            $quarter = new Quarter;
            $quarter->key = Helper::getNewTableKey('quarters');
            $quarter->city_id = $city->id;
            $quarter->name = $quarterName;
            $quarter->election_campaign_id = $electionCampaign->id;
            $quarter->save();

            self::connectClustersToQuarterAndUnConnectClustersNotInArray($quarter, $arrClustersId);
            self::addAllocationQuarterCoordinator($quarter);
            DB::commit();
            return $quarter;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private static function addAllocationQuarterCoordinator(Quarter $quarter)
    {
        $electionCampaign = ElectionCampaigns::currentCampaign();
        $quarterCoordinatorSystem = ElectionRoleSystemName::QUARTER_DIRECTOR;
        $quarterCoordinatorRole = ElectionRolesRepository::getBySystemName($quarterCoordinatorSystem);
        $allocations = ActivistsAllocationsRepository::getAllocationsQuarterByElectionRoleId($quarter, $quarterCoordinatorRole, $electionCampaign);
        if ($allocations && $allocations->count() > 0)
            return;

        ActivistsAllocationsCreator::createAllocationForCityRole($quarter->city_id, null, $electionCampaign->id, $quarterCoordinatorRole->id, $quarter->id);
        
    }

    /**
     * update name quarter by id
     *
     * @param Quarter $quarter
     * @param string $name
     * @return Quarter
     */
    public static function updateQuarterName(Quarter $quarter, $name)
    {
        $quarter = self::getQuarterById($quarter->id);
        $quarter->name = $name;
        $quarter->save();

        return $quarter;
    }

    /**
     * function get array clusters and connect them to quarter
     * function delete connect  clusters that not in array and was connect in pass
     *
     * @param Quarter $quarter
     * @param [type] $arrClustersId
     * @return void
     */
    public static function connectClustersToQuarterAndUnConnectClustersNotInArray(Quarter $quarter, $arrClustersId)
    {
        // Delete other clusters from quarter:
        Cluster::where('quarter_id', $quarter->id)->whereNotIn('id', $arrClustersId)->update(['quarter_id' => null]);
        
        ActivistsAllocations::where('quarter_id', $quarter->id)
        ->whereNotIn('cluster_id', $arrClustersId)
        ->update(['quarter_id' => null]);

        // Add new clusters from quarter:
        Cluster::whereIn('id', $arrClustersId)->update(['quarter_id' => $quarter->id]);

        ActivistsAllocations::whereIn('cluster_id', $arrClustersId)
        ->update(['quarter_id' => $quarter->id]);
        
    }

    public static function getCityQuartersAndDirectorDetails($cityId, $electionCampaignId, $includeEmptyQuarterObj = false)
    {

        $quarterDetails = Quarter::select([
            DB::raw('distinct quarters.id'),
            'quarters.name', 'quarters.key',
            'quarters.city_id',
            'quarters.quarter_director_id',
        ]);
        self::addQuarterDirectorDetailsToQuery($quarterDetails);
        $quarterDetails = $quarterDetails->where('quarters.city_id', '=', $cityId)
            ->where('quarters.election_campaign_id',$electionCampaignId)
            ->groupBy('quarters.id')
            ->get();

        if ($includeEmptyQuarterObj) {
            $emptyQuarter = self::getCityEmptyQuarter($cityId);
            $quarterDetails->push($emptyQuarter);
        }

        return $quarterDetails;
    }

    public static function addQuarterDirectorDetailsToQuery($query)
    {
        $quarterDirector = ElectionRolesRepository::getBySystemName(ElectionRoleSystemName::QUARTER_DIRECTOR);
        $query->with(['quarterDirectorDetails' => function ($query) use ($quarterDirector) {
            $query->select(
                'quarter_director_voter.email',
                'quarter_director_voter.first_name',
                'quarter_director_voter.last_name',
                DB::raw('election_roles_by_voters.id as election_role_voter_id'),
                DB::raw('election_roles_by_voters.phone_number'),
                'quarter_director_voter.personal_identity',
                'activists_allocations.quarter_id',
                DB::raw("activists_allocations.id as activists_allocation_id"),
                DB::raw("activists_allocations_assignments.id as activists_allocations_assignment_id")
            )
            ->leftJoin('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', 'activists_allocations.id')
            ->leftJoin('election_roles_by_voters', 'election_roles_by_voters.id', 'activists_allocations_assignments.election_role_by_voter_id')
            ->leftJoin('election_roles', 'election_roles.id', 'election_roles_by_voters.election_role_id')
            ->leftJoin('voters as quarter_director_voter', 'quarter_director_voter.id', 'election_roles_by_voters.voter_id')
            ->where('activists_allocations.election_role_id',12);
        }]);
    }

    private static function getCityEmptyQuarter($cityId)
    {
        $emptyQuarter = (object)[
            'id' => null,
            'key' => null,
            'name' =>  'אשכולות ללא רובע',
            'quarter_director_id' => null,
            'city_id' => $cityId,
        ];
        return $emptyQuarter;
    }

    /**
     * Function delete quarter if not has any allocation and assignment
     *
     * @param Quarter $quarter
     * @return void
     */
    public static function deleteQuarter(Quarter $quarter)
    {
        DB::beginTransaction();
        try {
            $countQuarterAssignment = self::getCountAssignmentOfActivistQuarter($quarter);
            if ($countQuarterAssignment > 0)
                throw new Exception(config('errors.elections.ERROR_DELETE_QUARTER_WITH_ASSIGNMENT'));

            //delete allocation only activist quarter
            ActivistsAllocations::where('quarter_id', $quarter->id)
                ->whereNull('cluster_id')
                ->delete();

            //unConnect clusters of quarter
            self::connectClustersToQuarterAndUnConnectClustersNotInArray($quarter, []);

            Quarter::where('id', $quarter->id)->delete();
            DB::commit();
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public static function getCountAssignmentOfActivistQuarter(Quarter $quarter)
    {
        $count = ActivistAllocationAssignment::select(DB::raw('count(activists_allocations_assignments.id) as count_quarter_assignment'))
        ->withActivistAllocation()
            ->where('activists_allocations.quarter_id', $quarter->id)
            ->whereNull('activists_allocations.cluster_id')
            ->first();
        return  $count ?  $count->count_quarter_assignment : 0;
    }




  
}
