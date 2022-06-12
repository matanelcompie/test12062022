<?php

namespace App\Repositories;

use App\Enums\ElectionRoleSystemName;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistsAllocations;
use App\Models\City;
use App\Models\Cluster;
use DB;
use Exception;

use stdClass;

class ClusterRepository
{
   /**
    * @throws Exception
    * @return Cluster
    */
   public static function getClusterByKey($key)
   {
      $cluster = Cluster::select()->where('key', $key)->first();
      if (!$cluster)
         throw new Exception(config('errors.elections.INVALID_CLUSTER_KEY'));

      return $cluster;
   }

   /**
    * @throws Exception
    * @return Cluster
    */
   public static function getById($id)
   {
      $cluster = Cluster::select()->where('id', $id)->first();
      if (!$cluster)
         throw new Exception(config('errors.elections.INVALID_CLUSTER_KEY'));

      return $cluster;
   }


   /**
    * @return Cluster[]
    */
   public static function getBallotBoxClusterAndClusterLeaderIdByKey($clusterKey)
   {
      return Cluster::select('clusters.id', DB::raw('voters.id as leader_id'), 'ballot_boxes.id as ballot_box_id')
         ->withBallotBoxes()
         ->withLeader()
         ->where('clusters.key', $clusterKey)
         ->get();
   }

   public static function getClusterDetailsWithLeaderByClusterId($clusterId)
   {
      return Cluster::select('clusters.id', DB::raw('voters.id as leader_id'))
         ->withLeader()
         ->where('clusters.id', $clusterId)
         ->get();
   }

   /**
    * Get cluster id and election campaign ,
    * function return array assignment activist details of cluster activist in by cluster id
    * @param int $clusterId
    * @param int $electionCampaignId
    * @return 
    */
   public static function  getClusterActivists($clusterId, $electionCampaignId)
   {
      // non ballot activists allocation
      $muniElectionsRolesNames = [
         ElectionRoleSystemName::DRIVER,
         ElectionRoleSystemName::MINISTER_OF_FIFTY,
         ElectionRoleSystemName::CLUSTER_LEADER,
         ElectionRoleSystemName::MOTIVATOR,
      ];

      $fields = [
         'first_name', 'last_name', 'personal_identity',
         'election_roles_by_voters.key',
         'election_roles_by_voters.phone_number',
         'election_roles.name as role_name',
         'election_roles.system_name',
         'activists_allocations_assignments.id as activists_allocations_assignments_id'
      ];

      $cityMunicipalActivists = ActivistsAllocations::select($fields)
         ->withAssignmentActivistsData($electionCampaignId)
         ->where('activists_allocations.cluster_id', $clusterId)
         ->where('activists_allocations.election_campaign_id', $electionCampaignId)
         ->whereIn('election_roles.system_name', $muniElectionsRolesNames)
         ->whereNotNull('election_roles_by_voters.id')
         ->get();
      return $cityMunicipalActivists ? $cityMunicipalActivists : [];
   }

   /**
    * Get city and election campaign id , function return array of clusters include name and quarter name , count ballot, and sun votes
    *
    * @param City $city
    * @param int $electionCampaignId
    * @return Cluster
    */
   public static function getClustersIncludeQuarterNameAndCountballotAndVotesByCity(City $city, $electionCampaignId)
   {

      $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name', true);
      $fields = [
         'clusters.id',
         'quarters.id as quarter_id',
         'quarters.name as quarter_name',
         DB::raw($fullClusterNameQuery),
         DB::raw('SUM(ballot_boxes.voter_count) as voter_count'),
         DB::raw('count( DISTINCT ballot_boxes.id) as ballot_count')
      ];

      return Cluster::select($fields)
         ->withBallotBoxes()
         ->withQuarter()
         ->where('clusters.city_id', $city->id)
         ->where('clusters.election_campaign_id', $electionCampaignId)
         ->groupBy('clusters.id')
         ->get();
   }

   public static function addArrBallotDetailsToClusterQuery($query)
   {
      $query->with(
         ['ballotBoxes' =>
         function ($query) {
            $ballotMainMiId = 'SUBSTR(ballot_boxes.mi_id , 1 , LENGTH(ballot_boxes.mi_id) - 1)';
            $miIdFormatSql = "CONCAT($ballotMainMiId , '.', SUBSTR(ballot_boxes.mi_id, LENGTH(ballot_boxes.mi_id), 1))";
            $query->select(
               'ballot_boxes.id',
               'ballot_boxes.key',
               'ballot_boxes.cluster_id',
               DB::raw("($miIdFormatSql) as name"),
               'mi_id',
               'crippled',
               'voter_count',
               'votes_count',
               'activists_allocations.ballot_box_role_id as role',
               'ballot_box_roles.type as role_type'
            )
               ->withBallotBoxRole()
               ->orderBy('id', 'asc');
         }]
      );
   }

   public static function addCountBallotAllocationToClusterQuery($query)
   {
      $query->withCount(['activated_ballots' => function ($query) {
         $query->whereHas('ActivistsAllocations');
      }]);
   }

   public static function addCountBallotWithAssignemtToClusterQuery($query)
   {
      $query->withCount(['allocated_ballots' => function ($query) {
         $query->whereHas('activistsAllocationsAssignments');
      }]);
   }

   public static function addCountTotalVotesClusterQuery($query, $electionCampaignId)
   {
      $query->withCount(['total_voters' => function ($query) use ($electionCampaignId) {
         $query->join('voters_in_election_campaigns', 'voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id')->where("election_campaign_id", $electionCampaignId);
      }]);
   }

   public static function addCountCaptainInClusterQuery($query, $electionCampaignId)
   {
      $query->with(['total_captains' => function ($query) use ($electionCampaignId) {
         $query
            ->join('voters_in_election_campaigns', function ($joinOn) {
               $joinOn->on('voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id');
            })

            ->join('voters_with_captains_of_fifty', function ($joinOn) {
               $joinOn->on('voters_with_captains_of_fifty.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                  ->on('voters_with_captains_of_fifty.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
            })
            ->join('election_roles_by_voters', function ($joinOn) {
               $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters_with_captains_of_fifty.captain_id')
                  ->on('election_roles_by_voters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
            })
            ->where('voters_in_election_campaigns.election_campaign_id', $electionCampaignId)
            ->where('voters_with_captains_of_fifty.deleted', 0)
            ->groupBy('voters_with_captains_of_fifty.captain_id', 'ballot_boxes.cluster_id');
      }]);
   }

   public static function addCountVotesOfPastElectionsInClusterQuery($query, $preLastCampaign, $city)
   {

      $query->with(['previous_shas_votes' => function ($query) use ($preLastCampaign, $city) {
         $query->select("ballot_boxes.id", "ballot_boxes.mi_id", "ballot_boxes.cluster_id")
            ->selectRaw("(select 
									election_campaign_party_list_votes.votes 
								from 
									ballot_boxes as b_temp,
									clusters as c_temp , 
									election_campaign_party_list_votes ,
									election_campaign_party_lists
								where 
									election_campaign_party_list_votes.ballot_box_id=b_temp.id and 
									election_campaign_party_lists.id = election_campaign_party_list_votes.election_campaign_party_list_id and 
									election_campaign_party_lists.election_campaign_id = " . $preLastCampaign->id . " and
									election_campaign_party_lists.deleted = 0 and
									election_campaign_party_lists.shas = 1 and
									b_temp.cluster_id=c_temp.id and 
									c_temp.election_campaign_id=" . $preLastCampaign->id . " and 
									c_temp.city_id=" . $city->id . " and 
									b_temp.mi_id=ballot_boxes.mi_id limit 1) as votes");
      }])
         ->orderBy('activated_ballots_count', 'DESC')
         ->orderBy('name', 'ASC');
   }


   public static function addBallotDetailsIncludeAssignmentByCityAndRoleAllocationToClusterQuery($query, City $city, $electionRoleId)
   {
      $miIdFormatQuery = Helper::getFormattedMiIdQuery('mi_id');
      $query
         ->with(['ballotBoxes' => function ($query) use ($city, $electionRoleId, $miIdFormatQuery) {
            $query->select(['ballot_boxes.id', 'key', DB::raw($miIdFormatQuery), 'ballot_boxes.cluster_id'])
               //arr allocation assignment of ballot allocation
               ->with(['activistsAllocationsAssignments' => function ($query) {
                  $query->select(['activists_allocations.ballot_box_id', DB::raw('election_role_shifts.system_name as role_shift_system_name'), 'activists_allocations_assignments.id as activists_allocations_assignments_id', 'activists_allocations_assignments.election_role_shift_id']);
               }])
               //only all ballot box with allocation
               ->withActivistsAllocations(false)
               ->where('activists_allocations.city_id', $city->id)
               ->where('activists_allocations.election_role_id', $electionRoleId);
         }]);
   }
}
