<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\BallotBoxRole;
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

class ElectionRolesByVotersRepository
{

    /**
     * @throws Exception
     * @return ElectionRolesByVoters
     */
    public static function getByKey($key)
    {
        $electionRolesByVoters = ElectionRolesByVoters::select()->where('key', $key)->first();
        if (!$electionRolesByVoters)
            throw new Exception(config('errors.elections.ERROR_VOTER_ROLE_ID'));
        return $electionRolesByVoters;
    }

    public static function getRoleVoterDetailsAndCampaignByKey($key)
    {
        $electionRolesByVoters = ElectionRolesByVoters::select(
            DB::raw('election_roles_by_voters.*'),
            DB::raw('election_campaigns.key as election_campaign_key')
        )
            ->withCampaign()
            ->where('election_roles_by_voters.key', $key)->first();
        if (!$electionRolesByVoters)
            throw new Exception(config('errors.elections.ERROR_VOTER_ROLE_ID'));
        return $electionRolesByVoters;
    }

    /**
     * @throws Exception
     * @return ElectionRolesByVoters
     */
    public static function getById($id)
    {
        $electionRolesByVoters = ElectionRolesByVoters::select()->where('id', $id)->first();
        if (!$electionRolesByVoters)
            throw new Exception(config('errors.elections.ERROR_VOTER_ROLE_ID'));
        return $electionRolesByVoters;
    }

    //function get $election_role_voter_id and check if $activist_allocation_assignment_id is single assignment of role voter
    public static function checkIsSingleAssignmentOfElectionRoleVoters($electionRoleVoterId, $activistAllocationAssignmentId)
    {

        $assignmentRoleVoter = ActivistAllocationAssignment::select()->where('election_role_by_voter_id', $electionRoleVoterId)->get();
        if ($assignmentRoleVoter->count() == 1 && $assignmentRoleVoter[0]->id == $activistAllocationAssignmentId)
            return true;

        return false;
    }

    public static function getElectionRoleByVoterWithSystemRole($electionRoleByVoterId)
    {
        $electionRoleVoter = ElectionRolesByVoters::select([DB::raw('election_roles_by_voters.*'), 'election_roles.system_name'])
            ->withElectionRole()
            ->where('election_roles_by_voters.id', $electionRoleByVoterId)->first();
        return  $electionRoleVoter;
    }

    public static function getElectionRoleByVoterWithSystemRoleByKey($electionRoleByVoterKey)
    {
        $electionRoleVoter = ElectionRolesByVoters::select([DB::raw('election_roles_by_voters.*'), 'election_roles.system_name'])
            ->withElectionRole()
            ->where('election_roles_by_voters.key', $electionRoleByVoterKey)->first();
        return  $electionRoleVoter;
    }

    public static function getSystemNameElectionRoleVoterByKey($electionRoleByVoterKey)
    {
        $electionRoleVoter =  ElectionRolesByVoters::select('system_name')
            ->withElectionRole()
            ->where('election_roles_by_voters.key', $electionRoleByVoterKey)
            ->first();
        return  $electionRoleVoter->system_name;
    }


    public static function countAssignmentOfElectionRoleVoter($electionRoleByVoterId)
    {
        $arrAnotherAssignment = ActivistAllocationAssignment::select()->where('election_role_by_voter_id', $electionRoleByVoterId)->get();
        return  $arrAnotherAssignment->count();
    }

    public static function getArrayAssignmentByElectionRoleByVoterId($electionRoleByVoterId)
    {
        $arrAnotherAssignment = ActivistAllocationAssignment::select()->where('election_role_by_voter_id', $electionRoleByVoterId)->get();
        return $arrAnotherAssignment;
    }

    /**
     *@method return details of counter or observe for create Appointment letter by election role voter
     *@param electionRoleByVoterKey
     *@param ballotRoleId-role of activist in ballot
     *@param currentCampaignId
     */
    public static function getDetailsAssignmentObserveOrCounterForAppointmentLetter($electionRoleByVoterKey, $ballotRoleId, $currentCampaignId)
    {
        $observeOrCounterDetails = self::getQueryDetailsForAppointmentLetter([$ballotRoleId], $currentCampaignId);
        $observeOrCounterDetails = $observeOrCounterDetails->where('election_roles_by_voters.key', $electionRoleByVoterKey)
            ->first();

        return $observeOrCounterDetails;
    }

    public static function getDetailsActivistForAppointmentLetterByBallotBoxRole($ballotRolesSystemNames, $currentCampaignId, $city)
    {
        $arrayBallotBoxRoleId = BallotBoxRolesRepository::getArrBallotBoxRoleByArrSystemName($ballotRolesSystemNames);
        $detailActivistBallotRole = self::getQueryDetailsForAppointmentLetter($arrayBallotBoxRoleId, $currentCampaignId);
        $detailActivistBallotRole = $detailActivistBallotRole
            ->where('activists_allocations.city_id', $city->id)
            ->whereNotNull('activists_allocations.ballot_box_id')
            ->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
            ->whereIn('election_roles.system_name', ['observer', 'ballot_member', 'counter'])
            ->whereIn('ballot_box_roles.system_name', $ballotRolesSystemNames)
            ->orderBy('activists_allocations.ballot_box_role_id')
            ->get();
        return  $detailActivistBallotRole;
    }

    private static function getQueryDetailsForAppointmentLetter($arrBallotRoleId, $currentCampaignId)
    {
        $fields = [
            'election_roles_by_voters.id',
            'voters.first_name', 'voters.last_name', 'voters.personal_identity', 'voters.house',
            DB::raw('IFNULL(cities.name, voters.mi_city) as city_name'),
            DB::raw('IFNULL(streets.name, voters.mi_street) as street_name'),
            'election_roles.system_name',
            'activists_allocations.ballot_box_id',
        ];
        $queryDetails = ElectionRolesByVoters::select($fields)
            //->withVoterAndCity()
            ->withElectionRole(false)
            ->withVoter()
            ->leftJoin('cities', 'cities.id', '=', 'voters.mi_city_id')
            ->leftJoin('streets', 'streets.id', 'voters.mi_street_id')
            ->withActivistsAllocationAssignment()
            ->join('ballot_box_roles', 'ballot_box_roles.id', '=', 'activists_allocations.ballot_box_role_id');

        $queryDetails = self::assignmentElectionVoterForAppointmentLetter($queryDetails, $arrBallotRoleId);

        $queryDetails = $queryDetails
            ->whereHas('activistsAllocationsAssignments', function ($q) use ($arrBallotRoleId, $currentCampaignId) {
                $q->withActivistAllocation()
                    ->whereIn('activists_allocations.ballot_box_role_id', $arrBallotRoleId)
                    ->where('activists_allocations.election_campaign_id', $currentCampaignId);
            });

        return  $queryDetails;
    }
    private static function assignmentElectionVoterForAppointmentLetter($queryRoleVoter, $ArrBallotBoxRoleId)
    {
        return $queryRoleVoter->with(['activistsAllocationsAssignments' => function ($q) use ($ArrBallotBoxRoleId) {
            $q->select([
                'activists_allocations_assignments.election_role_by_voter_id',
                'activists_allocations_assignments.id as geo_id',

                'activists_allocations.ballot_box_id',
                'activists_allocations.ballot_box_role_id',

                'ballot_boxes.id',
                'ballot_boxes.mi_id as ballot_mi_id',
                'ballot_boxes.mi_iron_number as ballot_iron_number',
                'ballot_box_roles.system_name as ballot_box_role_system_name',
                'ballot_box_roles.appointment_letter_name AS ballot_box_role_appointment_letter_name',
                'election_role_shifts.system_name AS election_role_shift_system_name',

                // Cluster address:
                'cities.name as cluster_city_name',
                'clusters.name as cluster_name',
                DB::raw('IFNULL(cluster_street.name,clusters.street) as cluster_street_name'),
                'clusters.house as cluster_house',
                DB::raw('IFNULL(regional_election_committees.name,"כל האזורים") as regional_committees_name'),
            ])
                ->withActivistAllocation()
                ->withElectionRoleShifts()
                ->withBallotBox()
                ->withClusters()
                ->withCity()
                ->leftJoin('ballot_box_roles', 'ballot_box_roles.id', 'activists_allocations.ballot_box_role_id')
                ->leftJoin('streets as cluster_street', 'cluster_street.id', 'clusters.street_id')
                ->leftJoin('cities_in_regional_election_committees', 'cities_in_regional_election_committees.city_id', 'cities.id')
                //Need to Check election capmaign id!
                ->leftJoin('regional_election_committees', 'regional_election_committees.id', 'cities_in_regional_election_committees.regional_election_committee_id')
                ->with(['otherActivistAllocationAssignment' => function ($query2) {
                    $query2->select([
                        'activists_allocations_assignments.id',
                        'activists_allocations.ballot_box_id',
                        DB::raw('election_role_shifts.system_name AS election_role_shift_system_name'),
                        'voters.personal_identity',
                        'voters.first_name',
                        'voters.last_name',
                    ])
                        ->withElectionRoleShifts()
                        ->withActivistAllocation()
                        ->withElectionRoleByVoter()
                        ->join('voters', 'voters.id', 'election_roles_by_voters.voter_id')
                        ->orderBy("election_role_shifts.id", 'ASC');
                }])
                ->whereIn('activists_allocations.ballot_box_role_id', $ArrBallotBoxRoleId)
                ->groupBy('activists_allocations_assignments.id')
                ->orderBy("election_role_shifts.id", 'ASC');
        }]);
    }

    //get voter key and role system name
    //return details of duplicate role voter 
    public static function getDetailsDuplicateRoleVoter($voterId, $electionCampaignId, $electionRoleSystemName)
    {
        $duplicatesRoleIdList = ElectionRoleByVoterService::getRolesListToCheckDuplicates($electionRoleSystemName);
        $fields = [
            DB::raw('distinct voters.id as id'),
            'voters.key',
            'voters.personal_identity',
            'voters.last_name',
            'voters.first_name',
            'voters.email',
            'election_roles_by_voters.id as other_election_roles_by_voters_id',
            'election_roles.name as election_role_name',
            'election_roles.system_name'
        ];

        return Voters::select($fields)
            ->where('voters.id', $voterId)
            ->with([
                'voterPhones' => function ($q) {
                    $q->select('id', 'voter_id', 'key', 'phone_number');
                },
                'electionRolesByVoter' => function ($query) use ($electionCampaignId) {
                    $query->select(
                        'voter_id',
                        'election_role_id',
                        'election_roles.name as election_role_name',
                        'election_roles_by_voters.phone_number',
                        'election_roles_by_voters.comment',
                        'election_roles.system_name as election_role_system_name'
                    )
                        ->withElectionRole(false)
                        ->where('election_campaign_id', $electionCampaignId);
                }
            ])
            ->withElectionRolesByVotersInCurrentCampagin($electionCampaignId, $duplicatesRoleIdList)
            ->first();
    }

    public static function getElectionRoleVoterByVoterIdAndRoleId($voterId, $roleId, $electionCampaignId)
    {

        return ElectionRolesByVoters::select(DB::raw('election_roles_by_voters.*'))
            ->where('election_roles_by_voters.election_role_id', $roleId)
            ->where('election_roles_by_voters.voter_id', $voterId)
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
            ->first();
    }

    /** */
    public static function getOtherActivistByPhoneNumber($voterId, $phoneNumber, $electionCampaignId)
    {
        return ElectionRolesByVoters::select('id')
            ->where(['phone_number' => $phoneNumber, 'election_campaign_id' => $electionCampaignId])
            ->where('voter_id', '!=', $voterId)
            ->first();
    }

    /**
     * return election role voter of specific roles in Different city params
     * @param int $voterId
     * @param string[] $systemNameRoles
     * @param int $cityId
     * @param int $electionCampaignId
     * @return Collection <ElectionRolesByVoters>
     */
    public static function getByActivistRoleIdInDifferentCity(
        $voterId,
        $systemNameRoles,
        $cityId,
        $electionCampaignId
    ) {
        return ElectionRolesByVoters::select()
            ->withElectionRole()
            ->where('election_campaign_id', $electionCampaignId)
            ->where('voter_id', $voterId)
            ->where('assigned_city_id', '<>', $cityId)
            ->whereIn('election_roles.system_name', $systemNameRoles)
            ->get();
    }


    /**
     *
     * @param int $voterId
     * @param string $systemName election role
     * @param int $electionCampaignId
     * @return ElectionRolesByVoters
     */
    public static function getElectionRoleVoterByElectionRoleSysteName($voterId, $systemName, $electionCampaignId)
    {
        return ElectionRolesByVoters::select(DB::raw('election_roles_by_voters.*'))
            ->withElectionRole()
            ->where('election_campaign_id', $electionCampaignId)
            ->where('voter_id', $voterId)
            ->where('election_roles.system_name', $systemName)
            ->first();
    }


    public static function getRoleVoterActivistIncludeBasicRolePaymendAndBankDetails($electionRoleByVoterKey,$electionCampaignId){
      
        $fields = [
            // Voter details:
            'voters.personal_identity','voters.first_name', 'voters.last_name', 'voters.birth_date',
    
            //Voter Address:
            DB::Raw("IF(voter_streets.name IS NULL , voters.street , voter_streets.name) as street"),
            DB::Raw("IF(voter_city.name IS NULL , voters.city , voter_city.name) as city"),
            'voters.house',
    
            // election_role details:
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.id',
            'election_roles.system_name as election_role_system_name',
            'election_roles.name as election_role_name',
            'assigned_city.name as assigned_city_name',
    
            // Activist bank details:
            'bank_branches.bank_id as bank_number',
            'bank_branches.branch_number as bank_branch_number',
            'bank_branches.name as bank_branch_name',
            'bank_details.bank_account_number',
            'bank_details.bank_owner_name',
            'bank_details.other_owner_type',
            'bank_details.is_activist_bank_owner',
            'bank_details.is_bank_verified',
        ];
    
        return ElectionRolesByVoters::select($fields)
        ->withVoter()
        ->withVoterBankDetails()
        ->leftJoin("streets as voter_streets" , "voter_streets.id","=", "voters.street_id")
        ->leftJoin("cities as voter_city" , "voter_city.id","=","voters.city_id")
        ->withElectionRole(false)
        ->withActivistAssingedCity()
        ->with(['activistRolesPayments'=>function($q){
            $q->select(
                'activist_roles_payments.id', 'ballot_boxes.mi_id as ballot_mi_id', 'election_role_shifts.name as election_role_shift_name',
                'activist_roles_payments.sum', 'activist_roles_payments.election_role_by_voter_id'
            )
            ->withActivistsAllocationsAssignments()
            ->withActivistAllocation()
            ->withBallotBox()
            ->withElectionRoleShifts()
            ->whereNull('activist_roles_payments.payment_type_additional_id');//only base not with bonus
        }])
        ->where('election_roles_by_voters.key',$electionRoleByVoterKey)
        ->where('election_roles_by_voters.election_campaign_id',$electionCampaignId)
        ->first();
    
    }
}
