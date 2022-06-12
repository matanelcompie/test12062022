<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class BallotBoxesRepository
{
    /**
     * @param int $ballotBoxId
     * @return BallotBox
     */
    public static function getBallotBoxRoleByBallotBoxId($ballotBoxId)
    {
        $ballotBoxRole = BallotBox::select(
            'activists_allocations.ballot_box_role_id',
            'activists_allocations.election_role_id',
            'ballot_box_roles.system_name as ballot_box_role_system_name'
        )
            ->where('ballot_boxes.id', $ballotBoxId)
            ->withActivistsAllocations(true, true)
            ->first();

        return $ballotBoxRole;
    }

    public static function getBallotBoxByKey($key)
    {
        $ballotBox = BallotBox::select()->where('key', $key)->first();
        if (!$ballotBox)
            throw new Exception(config('errors.elections.BALLOT_BOX_DOES_NOT_EXIST'));

        return $ballotBox;
    }

    /**
     * Get ballot box id and return ballot box object include cluster and city id
     * @param int $ballotBoxId
     * @return BallotBox
     */
    public static function getBallotBoxDetailsAndClusterDetailsByBallotId($ballotBoxId)
    {
        return  BallotBox::select(
            DB::raw('ballot_Boxes.*'),
            'clusters.id as cluster_id',
            'clusters.city_id',
            'clusters.election_campaign_id'
        )
            ->withCluster()
            ->where('ballot_boxes.id', $ballotBoxId)
            ->first();
    }

    public static function getAllocationByBallotId($id)
    {
        return ActivistsAllocations::select()
            ->where('ballot_box_id', $id)->first();
    }

    public static function getById($id)
    {
        $ballotBox = BallotBox::select()->where('id', $id)->first();
        if (!$ballotBox)
            throw new Exception(config('errors.elections.BALLOT_BOX_DOES_NOT_EXIST'));

        return $ballotBox;
    }

    public static function getByCityIdAndCampaignId($cityId, $electionCampaignId)
    {
        return BallotBox::select(DB::raw('ballot_boxes.*'))->withCluster()
            ->where('clusters.city_id', $cityId)
            ->where('election_campaign_id', $electionCampaignId)
            ->get();
    }

    /**
     * 
     * Get ballot id and election campaign function return the last votes object with created at in ballot box
     * @param int $ballotBoxId
     * @param int $electionCampaignId
     * @return Votes
     */
    public static function getLastDateVoteInBallotBox($ballotBoxId, $electionCampaignId)
    {
        return Votes::select('voters_in_election_campaigns.created_at')
        ->withVotersInElectionCampaign()
            ->where('votes.election_campaign_id', $electionCampaignId)
            ->where('ballot_box_id', $ballotBoxId)
            ->orderBy('voters_in_election_campaigns.created_at', 'DESC')
            ->first();
    }

    //---
    /**
     *  Add count final voter support in ballot query
     *
     * @param $query
     * @param int$electionCampaignId
     * @return void
     */
    public static function addCountFinalVoterSupportToBallotQuery($query, $electionCampaignId)
    {
        $query->withCount(['votersElectionCampaigns AS voter_supporters' => function ($query) use ($electionCampaignId) {
            $query
                ->where('voter_support_status.election_campaign_id', $electionCampaignId)
                ->withVoterSupportStatusStrictly()
                ->where('entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                ->where('support_status.level', '>', 0)
                ->where('voter_support_status.deleted', 0);
        }]);
    }
    

    public static function addVoterAssignmentDetailsToBallotQuery($query, $electionCampaignId)
    {

        $ballotGeoShiftsFields =  [
            'voters.first_name', 'voters.last_name', 'voters.key as voter_key',
            'election_role_shifts.name as shift_name',
            'election_role_shifts.system_name as shift_system_name',
            'election_roles.name as role_name', 'election_roles.system_name as role_system_name', 'election_roles.key as role_key',
            'election_roles_by_voters.voter_id', 'election_roles_by_voters.phone_number', 'verified_status',
            'election_roles_by_voters.instructed',
            'election_roles_by_voters.key as election_role_key',
            'activists_allocations.ballot_box_id',
            'activists_allocations_assignments.arrival_date',
            'activists_allocations_assignments.appointment_letter',
            'activists_allocations_assignments.id as activist_assignment_id',
            'election_roles_by_voters.user_lock_id',
        ];
        $query->with(['activistsAllocationsAssignments' => function ($query) use ($electionCampaignId, $ballotGeoShiftsFields) { //role_shifts
            $query->select($ballotGeoShiftsFields)
                ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
                ->groupBy('election_roles_by_voters.voter_id')
                ->groupBy('activists_allocations_assignments.election_role_shift_id')
                ->orderBy('activists_allocations_assignments.election_role_shift_id');
        }]);
    }

    /**
     * Get ballot mi id and city mi id and return ballot object include id , cluster_id and city_ia
     *
     * @param int $electionCampaignId
     * @param int $cityMi
     * @param int $ballotMiId
     * @return BallotBox
     */
    public static function getBallotBoxByBallotMiIdAndCityMiId($electionCampaignId, $cityMi, $ballotMiId)
    {
        $ballotBox = BallotBox::select('ballot_boxes.id', 'clusters.id as clusters_id', 'clusters.city_id')->withCluster()->withCity()
            ->where('clusters.election_campaign_id', DB::raw($electionCampaignId))
            ->where('ballot_boxes.mi_id', DB::raw($ballotMiId))
            ->where('cities.mi_id', DB::raw($cityMi))
            ->first();
        if (!$ballotBox)
            return false;
        return $ballotBox;
    }
}
