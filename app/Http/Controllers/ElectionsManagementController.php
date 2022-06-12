<?php

namespace App\Http\Controllers;

use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesGeographical;
use Illuminate\Support\Facades\DB;

class ElectionsManagementController extends Controller
{
	/*
		Function that gets cityKey and returns all data about its clusters
	*/
    public function getCityClustersDetails($cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        $this->currentCampaignId = ElectionCampaigns::currentLoadedVotersCampaign()['id'];
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
        $dbFields = [
            'clusters.id',
            DB::raw($fullClusterNameQuery),
        ];

        $data = Cluster::select($dbFields)
            ->withCity()
            ->with(['ballotBoxes' => function ($joinWith) {
                $joinWith->select(
                    'ballot_boxes.id',
                    'ballot_boxes.cluster_id', 'ballot_boxes.mi_id AS ballot_box_id',
                    DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),
                    'ballot_boxes.voter_count', DB::raw("IF(ballot_box_roles.name IS NULL,'',ballot_box_roles.name) AS role_name"),
                    DB::raw("IF(ballot_boxes.votes_count IS NULL,COUNT(votes.id),ballot_boxes.votes_count) AS votes_count"),
                    DB::raw("TIME(MAX(votes.created_at)) AS last_update_time"),
                    DB::raw("IF(ballot_boxes.ballot_box_role_id IS NULL,0,1) AS to_assign")
                    // 'election_role_shifts.name AS shift_name',
                    // 'election_roles.name AS role_name'
                )
                    ->leftJoin('ballot_box_roles', function ($join) {
                        $join->on('ballot_boxes.ballot_box_role_id', '=', 'ballot_box_roles.id')
                            ->on('ballot_box_roles.deleted', '=', DB::raw(0));
                    })
                    ->join('voters_in_election_campaigns', function ($query) {
                        $query->on('ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
                            ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($this->currentCampaignId));
                    })
                    ->join('votes', function ($join) {
                        $join->on('voters_in_election_campaigns.voter_id', '=', 'votes.voter_id')
                            ->on('votes.election_campaign_id', '=', DB::raw($this->currentCampaignId));
                    })
                // ->leftJoin('election_role_by_voter_geographic_areas', function ($join) {
                //     $join->on('ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id')
                //         ->on('election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')));
                // })
                // ->leftJoin('election_roles_by_voters', function ($join) {
                //     $join->on('election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
                //         ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($this->currentCampaignId));
                // })

                // ->leftJoin('election_role_shifts', 'election_role_by_voter_geographic_areas.election_role_shift_id', '=', 'election_role_shifts.id')
                // ->where('election_role_shifts.deleted', DB::raw(0))

                // ->leftJoin('election_roles', 'election_roles_by_voters.election_role_id', '=', 'election_roles.id')
                // ->where('election_roles.deleted', DB::raw(0))

                    ->groupBy('voters_in_election_campaigns.ballot_box_id')
                ;
            }])
        // ->join('ballot_boxes', 'clusters.id', '=', 'ballot_boxes.cluster_id')
        // ->join('voters_in_election_campaigns', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
        // ->join('votes', function ($join) {
        //     $join->on('voters_in_election_campaigns.voter_id', '=', 'votes.voter_id')
        //         ->on('votes.election_campaign_id', '=', DB::raw($this->currentCampaignId));
        // })
            ->where('cities.key', $cityKey)
        // ->where('voters_in_election_campaigns.election_campaign_id', DB::raw($this->currentCampaignId))
            ->where('clusters.election_campaign_id', DB::raw($this->currentCampaignId))
            ->limit(1)
            ->get();

        $jsonOutput->setData($data);
    }

	/*
		Function that gets cityKey and returns SUMMARY data about its clusters
	*/
    public function getCityClustersSummary($cityKey)
    {
        /**
         * TODO:: shas_voters_count
         */
        $jsonOutput = app()->make("JsonOutput");
        $this->currentCampaignId = ElectionCampaigns::currentLoadedVotersCampaign()['id'];
        $this->previousCampaignId = ElectionCampaigns::previousCampaign()['id'];

        $dbFields = ['cities.name AS city_name',
            DB::raw("COUNT(DISTINCT clusters.id) AS clusters_count"),
            DB::raw("COUNT(ballot_boxes.id) AS ballot_boxes_count"),
            DB::raw("SUM(ballot_boxes.voter_count) AS voters_count"),
            DB::raw("SUM(CASE WHEN ballot_boxes.ballot_box_role_id IS NULL THEN 0 ELSE 1 END) AS to_assign_count"),
            DB::raw("COUNT(entities.entity_id) AS assigned_count"),
            //shas_voters_count
        ];

        $data = Cluster::select($dbFields)
            ->withCity()
            ->withBallotBoxes()
            ->leftJoin(DB::raw("(" .
                ElectionRolesGeographical::distinct()->select('entity_type', 'entity_id')
                    ->leftJoin('election_roles_by_voters', function ($join) {
                        $join->on('election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
                            ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($this->currentCampaignId));
                    })
                    ->where('election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')))
                    ->toSql() . ") AS entities"),
                'entity_id', '=', 'ballot_boxes.id')

                
            ->leftJoin(DB::raw("(" .
                ElectionRolesGeographical::distinct()->select('entity_type', 'entity_id')
                    ->leftJoin('election_roles_by_voters', function ($join) {
                        $join->on('election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
                            ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($this->currentCampaignId));
                    })
                    ->where('election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')))
                    ->toSql() . ") AS entities"),
                'entity_id', '=', 'ballot_boxes.id')



            ->where('cities.key', $cityKey)
            ->where('clusters.election_campaign_id', DB::raw($this->currentCampaignId))
            ->get();

        $jsonOutput->setData($data);
    }
}

