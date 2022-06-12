<?php

namespace App\Libraries\Services\ActivistAllocation;

use App\DTO\SearchAllocationDto;
use App\Enums\BallotAssignmentStatus;
use App\Enums\ClusterAssignmentStatus;
use App\Enums\ElectionRoleSystemName;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use PDO;

class SearchAllocation
{

    /**
     * function search cluster by status assignment details
     *
     * @param SearchAllocationDto $searchAllocation
     * @return [clusters:array cluster data include cluster leader,
     * totalClusters:count result
     * ]
     */
    public static function clusterLeaderSearch(SearchAllocationDto $searchAllocation)
    {
        $fields = self::getFieldClusterActivist();
        $clusterLeaderFields = [
            'voters.id as leader_id',
            'voters.personal_identity as leader_personal_identity',
            'voters.first_name as leader_first_name',
            'voters.last_name as leader_last_name',
            'election_roles_by_voters.phone_number as leader_phone_number',
            'election_roles_by_voters.verified_status as leader_verified_status',
            'election_roles_by_voters.user_lock_id as leader_user_lock_id',
            'election_roles_by_voters.lock_date as leader_lock_date',
            'activists_allocations_assignments.id as activists_allocations_assignment_id'
        ];
        $fields = array_merge($fields, $clusterLeaderFields);

        $assignmentStatus = $searchAllocation->assignmentStatus;
        $onlyWithClusterLeader = $assignmentStatus == ClusterAssignmentStatus::WITH_ASSIGNMENT ? true : false;
        $clusterObj = Cluster::select($fields)
            ->withLeader(!$onlyWithClusterLeader)
            ->withCity()
            ->withCount('ballotBoxes');

        if (!is_null($assignmentStatus) && $assignmentStatus == ClusterAssignmentStatus::NOT_WITH_ASSIGNMENT){
            $clusterObj->whereNull('activists_allocations_assignments.id');
        }
            
        $searchCondition = self::getWhereConditionArrayBySearchAllocationDto($searchAllocation);
        $clusterObj->where($searchCondition)->groupBy('clusters.id');

        $allCluster = $clusterObj->get();
        $results = [
            'clusters' =>  $allCluster,
            'totalClusters' => $allCluster->count()
        ];

        return  $results;
    }

    public static function driverSearch(SearchAllocationDto $searchAllocation)
    {
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $fields = self::getFieldClusterActivist();
        $driverFields = [
            DB::raw('count(voter_transportations.id) as count_cluster_transportations'),
            DB::raw('count(voter_transportations_crippled.id) as count_cluster_transportations_crippled')
        ];

        $fields = array_merge($fields, $driverFields);

        $clusterObj = Cluster::select($fields)
            ->withCity()
            ->withCount(['driverGeo' => function ($query) use ($electionCampaignId) {
                $query->leftJoin('election_roles', 'activists_allocations.election_role_id', 'election_roles.id')
                ->leftJoin('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', 'activists_allocations.id')
                ->where('election_roles.system_name', ElectionRoleSystemName::DRIVER)
                    ->whereNotNull('activists_allocations_assignments.id')
                    ->where('activists_allocations.election_campaign_id', $electionCampaignId);
            }])
            ->withCount('ballotBoxes');
        $assignmentStatus = $searchAllocation->assignmentStatus;
        $onlyWithDriver = $assignmentStatus == ClusterAssignmentStatus::WITH_ASSIGNMENT ? true : false;

        $clusterObj->withDriver(!$onlyWithDriver);

        if (!is_null($assignmentStatus) && $assignmentStatus == ClusterAssignmentStatus::NOT_WITH_ASSIGNMENT) {
            $clusterObj->whereNull('activists_allocations_assignments.id');
        }

        $searchCondition = self::getWhereConditionArrayBySearchAllocationDto($searchAllocation);
        $clusterObj->where($searchCondition)->groupBy('clusters.id');

        $allCluster = $clusterObj->get();
        $results = [
            'clusters' =>  $allCluster,
            'totalClusters' => $allCluster->count()
        ];

        return  $results;
    }

    /**
     * search cluster by motivator assignment status
     *
     * @param SearchAllocationDto $searchAllocation
     * @return array[clusters]=array cluster 
     * @return array[totalClusters]=count result array
     */
    public static function motivatorSearch(SearchAllocationDto $searchAllocation)
    {
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $fields = self::getFieldClusterActivist();
        $clusterObj = Cluster::select($fields)
            ->withCity()
            ->withCount(['motivatorGeo' => function ($query) use ($electionCampaignId) {
                $query->leftJoin('election_roles', 'activists_allocations.election_role_id', 'election_roles.id')
                ->leftJoin('activists_allocations_assignments','activists_allocations_assignments.activist_allocation_id','activists_allocations.id')
                ->where('election_roles.system_name', ElectionRoleSystemName::MOTIVATOR)
                ->whereNotNull('activists_allocations_assignments.id')
                ->where('activists_allocations.election_campaign_id', $electionCampaignId);
            }])
            ->withCount('ballotBoxes');
        $assignmentStatus = $searchAllocation->assignmentStatus;
        $onlyWithMotivator = $assignmentStatus == ClusterAssignmentStatus::WITH_ASSIGNMENT ? true : false;

        $clusterObj->withMotivator(!$onlyWithMotivator);

        if (!is_null($assignmentStatus) && $assignmentStatus == ClusterAssignmentStatus::NOT_WITH_ASSIGNMENT) {
            $clusterObj->whereNull('activists_allocations_assignments.id');
        }

        $searchCondition = self::getWhereConditionArrayBySearchAllocationDto($searchAllocation);
        $clusterObj->where($searchCondition)->groupBy('clusters.id');

        $allCluster = $clusterObj->get();
        $results = [
            'clusters' =>  $allCluster,
            'totalClusters' => $allCluster->count()
        ];

        return  $results;
    }


    public static function ballotsSearch(SearchAllocationDto $searchAllocation)
    {
        $limit = config('constants.activists.MAX_RECORDS_FROM_DB');
        $skip = ($searchAllocation->currentPage - 1) * config('constants.activists.MAX_RECORDS_FROM_DB');

        switch ($searchAllocation->assignmentStatus) {
            case BallotAssignmentStatus::ALL_ROWS:
                $ballots = self::getQueryBallotIncludeAllAllocationAndAssignmnet();
                break;
            case BallotAssignmentStatus::NO_ASSIGNMENT:
                $ballots = self::getQueryBallotWithoutAssignment();
                break;

            case BallotAssignmentStatus::PARTIAL_ASSIGNMENT:
            case BallotAssignmentStatus::NO_OR_PARTIAL_ASSIGNMENT:
                $ballots = self::getQueryBallotNoOrPartialAssignment($searchAllocation->assignmentStatus);
                break;

            case BallotAssignmentStatus::FIRST_SHIFT_ASSIGNMENT:
            case BallotAssignmentStatus::SECOND_SHIFT_ASSIGNMENT:
                $ballots = self::getQueryBallotIncludeFirstOrSecondAssignment($searchAllocation->assignmentStatus);
                break;

            case BallotAssignmentStatus::ASSIGNED_WITHOUT_COUNT:
                $ballots = self::getQueryBallotWithoutCounterAssignment();
                break;

            case BallotAssignmentStatus::FULL_ASSIGNMENT:
                $ballots = self::getQueryBallotWithFullAssignment();;
        }

        $ballots = self::getQueryBallotWithAllAssignment($ballots);
        $searchCondition = self::getWhereConditionArrayBySearchAllocationDto($searchAllocation);
        $ballots->where($searchCondition);

        $totalBallots = $ballots->count();
        $ballots = $ballots->skip($skip)->take($limit)->get();

        $result = [
            'ballots' => $ballots,
            'totalBallots' => $totalBallots,
        ];

        return $result;
    }

    //Allocation clusterLeader function
    private static function getFieldClusterActivist()
    {
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('', true);
        return  [
            'clusters.id',
            'clusters.key',
            DB::raw($fullClusterNameQuery . ' as name'),
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name'
        ];
    }


    //Allocation ballot Activist function
    private static function getArrayFieldBallotAllocationSearch()
    {
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('', true);
        return  [
            'cities.name as city_name',

            'clusters.id as cluster_id',
            DB::raw($fullClusterNameQuery . ' as cluster_name'),
            'clusters.city_id',
            'clusters.street',

            'ballot_boxes.id',
            'ballot_boxes.key',
            'ballot_boxes.mi_id as name',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),

            'ballot_box_roles.type as role_type',
            'ballot_box_roles.id as ballot_box_role_id',
            'ballot_box_roles.name as ballot_box_role_name',
            //count assignment
            DB::raw('( select count(*) from activists_allocations_assignments join activists_allocations on activists_allocations_assignments.activist_allocation_id=activists_allocations.id where activists_allocations.ballot_box_id=ballot_boxes.id) as count_assignment')
        ];
    }
    private static function getQueryBallotWithoutAssignment()
    {
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()
            ->withActivistsAllocations(true, true)
            ->leftJoin('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', 'activists_allocations.id')
            ->whereNull('activists_allocations_assignments.id');
    }

    private static function getQueryBallotNoOrPartialAssignment($assignmentStatus)
    {
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()
            ->withActivistsAllocations(false, true)
            ->where(function ($orQuery) use ($assignmentStatus) {
                $orQuery->orWhere(function ($query) {
                    $query->has('ActivistsAllocations', '=', 1)
                        ->whereDoesntHave('ActivistsAllocations', function ($query2) {
                            $query2
                                ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                                ->withElectionRoleShifts()
                                ->where('election_role_shifts.system_name', config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'));
                        });
                });

                $orQuery->orWhere(function ($subQuery) {
                    $subQuery->has('ActivistsAllocations', '=', 2)
                        ->whereDoesntHave('ActivistsAllocations', function ($query) {
                            $query->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                                ->withElectionRoleShifts()
                                ->whereIn('election_role_shifts.system_name', [
                                    config('constants.activists.role_shifts.ALL_DAY'),
                                    config('constants.activists.role_shifts.SECOND_AND_COUNT')
                                ]);
                        });
                });

                if ($assignmentStatus == BallotAssignmentStatus::NO_OR_PARTIAL_ASSIGNMENT) {
                    $orQuery->orWhere(function ($query) {
                        $query->whereDoesntHave('ActivistsAllocations', function ($query2) {
                            $query2
                                ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                                ->withElectionRoleShifts();
                        });
                    });
                }
            });
    }

    private static function getQueryBallotIncludeAllAllocationAndAssignmnet()
    {
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()
            ->withActivistsAllocations(true, true);
    }

    private static function getQueryBallotIncludeFirstOrSecondAssignment($assignmentStatus)
    {

        if ($assignmentStatus == BallotAssignmentStatus::FIRST_SHIFT_ASSIGNMENT) {
            $shiftToCompare = config('constants.activists.role_shifts.FIRST');
            $shiftNotToCompare = [config('constants.activists.role_shifts.SECOND')];
        } else if ($assignmentStatus ==  BallotAssignmentStatus::SECOND_SHIFT_ASSIGNMENT) {
            $shiftToCompare = config('constants.activists.role_shifts.SECOND');
            $shiftNotToCompare = [config('constants.activists.role_shifts.FIRST')];
        }

        $shiftNotToCompare[] = config('constants.activists.role_shifts.COUNT');
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()
            ->withActivistsAllocations(false, true)
            ->whereHas('ActivistsAllocations', function ($qr) use ($shiftToCompare) {
                $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                    ->join('election_role_shifts', 'election_role_shifts.id', 'activists_allocations_assignments.election_role_shift_id')
                    ->where('election_role_shifts.system_name', $shiftToCompare);
            })
            ->whereDoesntHave('ActivistsAllocations', function ($qr) use ($shiftNotToCompare) {
                $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                    ->join('election_role_shifts', 'election_role_shifts.id', 'activists_allocations_assignments.election_role_shift_id')
                    ->whereIn('election_role_shifts.system_name', $shiftNotToCompare);
            });
    }

    private static function  getQueryBallotWithAllAssignment($ballotQuery)
    {
        return $ballotQuery->with(['AllAssignment' => function ($qr) {
            $geoFields = [
                'activists_allocations.ballot_box_id',
                'activists_allocations_assignments.id',
                'activists_allocations_assignments.election_role_by_voter_id',
                'activists_allocations_assignments.election_role_shift_id',
                'election_role_shifts.key as election_role_shift_key',
                'election_role_shifts.name as election_role_shift_name',
                'election_role_shifts.system_name as election_role_shift_system_name',
                'election_roles_by_voters.verified_status',
                'election_roles_by_voters.voter_id',
                'election_roles_by_voters.phone_number',
                'election_roles_by_voters.user_lock_id',
                'voters.first_name',
                'voters.last_name',
                'voters.personal_identity',
                'voters.key as voter_key',

                'election_roles.id as election_role_id',
                'election_roles.name as election_role_name',
                'election_roles.system_name as election_role_system_name'
            ];

            $qr->addSelect($geoFields)
                ->withElectionRoleShifts()
                ->withElectionRoles()
                ->leftJoin('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
                ->leftJoin('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
                ->orderBy('activists_allocations_assignments.election_role_shift_id', 'asc');
        }]);
    }

    private static function getQueryBallotWithFullAssignment()
    {
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()->withActivistsAllocations(false, true)
            ->where(function ($orQuery) {
                $orQuery->orWhere(function ($query) {
                    $query->has('ActivistsAllocations', '=', 1)
                        ->whereHas('ActivistsAllocations', function ($query2) {
                            $query2
                                ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                                ->withElectionRoleShifts()
                                ->where('election_role_shifts.system_name', config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'));
                        });
                });
                $orQuery->orWhere(function ($subQuery) {
                    $subQuery->has('ActivistsAllocations', '=', 2)
                        ->whereHas('ActivistsAllocations', function ($query) {
                            $query
                                ->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                                ->withElectionRoleShifts()
                                ->whereIn('election_role_shifts.system_name', [
                                    config('constants.activists.role_shifts.ALL_DAY'),
                                    config('constants.activists.role_shifts.SECOND_AND_COUNT')
                                ]);
                        });
                });
                $orQuery->orWhere(function ($subQuery) {
                    $subQuery->has('ActivistsAllocations', '=', 3);
                });
            });
    }

    private static function getQueryBallotWithoutCounterAssignment()
    {
        return BallotBox::select(self::getArrayFieldBallotAllocationSearch())
            ->withCluster()
            ->withCity()
            ->withActivistsAllocations(false, true)
            ->where(function ($query) {
                $query->whereHas('ActivistsAllocations', function ($qr) {
                    $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                        ->withElectionRoleShifts()
                        ->whereIn('election_role_shifts.system_name', [
                            config('constants.activists.role_shifts.FIRST'),
                            config('constants.activists.role_shifts.SECOND'),
                            config('constants.activists.role_shifts.ALL_DAY')
                        ]);
                });
            })
            ->where(function ($query) {
                $query->whereDoesntHave('ActivistsAllocations', function ($qr) {
                    $qr->join('activists_allocations_assignments', 'activists_allocations_assignments.activist_allocation_id', '=', 'activists_allocations.id')
                        ->withElectionRoleShifts()
                        ->whereIn('election_role_shifts.system_name', [
                            config('constants.activists.role_shifts.COUNT'),
                            config('constants.activists.role_shifts.SECOND_AND_COUNT'),
                            config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')
                        ]);
                });
            });
    }

    private static function getWhereConditionArrayBySearchAllocationDto(SearchAllocationDto $searchAllocation)
    {
        $where = [];
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;
        $where['clusters.election_campaign_id'] = $electionCampaignId;
        if (!is_null($searchAllocation->ballotBox)) {
            $where['ballot_boxes.id'] = $searchAllocation->ballotBox->id;
        }
        if (!is_null($searchAllocation->cluster)) {
            $where['clusters.id'] = $searchAllocation->cluster->id;
        }
        if (!is_null($searchAllocation->neighborhood)) {
            $where['clusters.neighborhood_id'] = $searchAllocation->neighborhood->id;
        }
        if (!is_null($searchAllocation->city)) {
            $where['clusters.city_id'] = $searchAllocation->city->id;
        }
        if (!is_null($searchAllocation->subArea)) {
            $where['cities.sub_area_id'] = $searchAllocation->subArea->id;
        }
        if (!is_null($searchAllocation->area)) {
            $where['cities.area_id'] = $searchAllocation->area->id;
        }

        if (!is_null($searchAllocation->ballotRole)) {
            $where['ballot_box_roles.id'] = $searchAllocation->ballotRole->id;
        }

        return $where;
    }
}
