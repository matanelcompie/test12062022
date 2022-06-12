<?php

namespace App\Libraries\Services\activists;

use App\Enums\ElectionRolesAdditions;
use App\Http\Controllers\GlobalController;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistCreateDto;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Libraries\Services\UserPermissions\UserPermissionManager;
use App\Models\ActivistAllocationAssignment;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\Voters;
use App\Models\Votes;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\ClusterRepository;
use App\Repositories\ElectionRoleShiftRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\VotersRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VotersActivistsService{

    public static function checkIfActivistHasBallotAllocation($electionRoleKey, $ballotId){
		$currentCampaignId = ElectionCampaigns::currentCampaign()->id;

		$ballot = BallotBox::select('ballot_boxes.id', 'ballot_boxes.mi_iron_number')
					->where('ballot_boxes.id', $ballotId)
					->first();
		if(!$ballot || !$ballot->mi_iron_number){ return null;}
		$fields = ['voters.personal_identity'];

		$electionRoleData = ElectionRolesByVoters::select($fields)
		->withElectionRole(false)
		->withVoter()
		->withElectionRoleGeographical(false)
		->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
		->where('election_role_by_voter_geographic_areas.entity_id', $ballotId)
		->where('election_roles_by_voters.key', $electionRoleKey)
		->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
		->whereIn('election_roles.system_name', ['observer', 'ballot_member', 'counter'])
		->first();
        if($electionRoleData){
            $electionRoleData->ballot_mi_iron_number = $ballot->mi_iron_number;
        }
        return $electionRoleData;
    }

    public static function searchElectionActivists($jsonOutput, Request $request) {
        $votersObj = self::getElectionActivistsData($request);
        // dd($votersObj->toSql());
        $votersArray = [];
        $recordsCount = 0;
        if($votersObj){
            $currentPage = $request->input('current_page', 1);

            $limit = config('constants.activists.MAX_RECORDS_FROM_DB');
            $skip = ($currentPage - 1) * config('constants.activists.MAX_RECORDS_FROM_DB');
    
            $recordsCount = $votersObj->count(DB::raw('distinct voters.id'));
            
            $electionRoleId = $request->input('election_role_id', null);
            $assignmentStatus = $request->input('assignment_status', null);
    
            // dump($electionRoleId, $assignmentStatus,0 == $assignmentStatus, config('constants.activists.election_roles_additions.NONE'));
            // Fix display non allocation activists:
            if ($electionRoleId != config('constants.activists.election_roles_additions.NONE') && !is_null($assignmentStatus) &&  $assignmentStatus == 0 ){
                $votersArray = $votersObj->orderBy('maxBallot')->get()->toArray();
                $recordsCount = count($votersArray);
            }else{
                $votersObj=$votersObj->orderBy('maxBallot');
                $votersArray = $votersObj->skip($skip)->take($limit)->get();
            }
        }

        $result = [
            'voters' => $votersArray,
            'recordsCount' => $recordsCount,
        ];
        return $result;
    }
    /** @method getElectionActivistsData
     *  Get activists details by Request params
     *  Use for multiple functions.
     *  @return Activists Collection by voters.
    */
    public static function getElectionActivistsData(Request $request, $exportType = null ) {
		 $countMultiRolesOnly = null;
         $election_roles_additions = config('constants.activists.election_roles_additions');
         $election_role_system_names = config('constants.activists.election_role_system_names');
         $muni_elections_roles_names = config('constants.activists.muni_elections_roles_names');

         $detailsSearch=searchActivistService::getSearchActivistByPrams($request);
         if(!isset($detailsSearch->electionRoleId))
         $detailsSearch->electionRoleId=ElectionRolesAdditions::ALL_ROLE_TYPE;
         if(isset($detailsSearch->electionRoleId) && is_array($detailsSearch->electionRoleId) &&  in_array($detailsSearch->electionRoleId[0],$election_roles_additions))
         $detailsSearch->electionRoleId=$detailsSearch->electionRoleId[0];

         $votersObj=self::getQueryVoterSearchActivist($request,$detailsSearch,$exportType);
         $detailsSearch=self::argumentSearchActivist($detailsSearch);
        
        // The filter no role has not been chosen
        if ( $detailsSearch->electionRoleId != ElectionRolesAdditions::NONE_ROLE_TYPE){
            $votersObj->join('election_roles_by_voters', function($joinOn) use ($detailsSearch) {
                $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters.id')
                    ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($detailsSearch->electionCampaignId));
                })
                ->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');

            $votersObj->whereHas('electionRolesByVoter', function ($query) use ($detailsSearch,$exportType, $election_role_system_names) {
                $query=self::getQueryRoleVoter( $query,$detailsSearch, $exportType,$election_role_system_names,true);
            });

            $votersObj->with(['electionRolesByVoter' => function ($query) use ($detailsSearch, $exportType) {
                $query=self::getQueryRoleVoter( $query,$detailsSearch, $exportType);
            }]);


        } else {
            $votersObj->whereDoesntHave('electionRolesByVoter', function ($query) use ($detailsSearch) {
                $query->where('election_roles_by_voters.election_campaign_id', $detailsSearch->electionCampaignId);
            });

            if (!is_null($detailsSearch->phoneNumber)) {
                $votersObj->withPhone($detailsSearch->phoneNumber);
                $where['voter_phones.phone_number'] = $detailsSearch->phoneNumber;
            }
        }
        // if (isset($multi_personals_identities) && count($multi_personals_identities) > 0) {
        //     $votersObj->whereIn('',$multi_personals_identities);
        // }

        if($detailsSearch->countMultiRolesOnly){//activist with multi active
            $votersObj->whereRaw("voters.id in (select voter_id  
            from election_roles_by_voters , 
            election_roles where election_roles_by_voters.election_role_id=election_roles.id and election_roles.deleted=0 and election_campaign_id=".$detailsSearch->electionCampaignId." group by voter_id having count(voter_id) > 1)"); 
        }
      
        return $votersObj;
    }

    public static function SearchByBankDetails($votersObj, $verifyBankStatus, $lastCampaignId)
    {
        searchActivistService::addVerifyStatusToQuery($votersObj, $verifyBankStatus, $lastCampaignId);
    }

    public static function getQueryRoleVoter($query,$detailsSearch, $exportType, $isWhereHas=false){
    
            $election_role_system_names = config('constants.activists.election_role_system_names');
            $countHouseholdsQuery = self::getCountHouseholdQuery($detailsSearch->electionCampaignId);

            $fields = [
                'election_roles_by_voters.id',
                'election_roles_by_voters.key',
                'election_roles_by_voters.voter_id',
                'election_roles_by_voters.verified_status',
                'election_roles_by_voters.phone_number',
                'election_roles_by_voters.election_role_id',
                'election_roles_by_voters.assigned_city_id',
                'election_roles.name as election_role_name',
                'election_roles.system_name',
                'assigned_city.name as assigned_city_name',
            ];

            if (!$isWhereHas && $detailsSearch->countCaptain50Voters ) {
                $fields[] = DB::raw($countHouseholdsQuery);
            }

            if(empty($assignedCitiesArray)){ // Temp Remove history activists
                $historyAraeId = 57;
                $query->where('assigned_city.area_id','!=', $historyAraeId );
            }

            $query->addSelect($fields)
                ->leftJoin('cities as assigned_city','assigned_city.id','election_roles_by_voters.assigned_city_id')
                ->withElectionRole();

            if(is_null($exportType)){ 
                $query->leftJoin('activists_allocations_assignments', function($joinOn) {
                    $joinOn->on('activists_allocations_assignments.election_role_by_voter_id', '=', 'election_roles_by_voters.id');
                });
            }

            if (!$isWhereHas && $detailsSearch->contGeoItems ) { 
                $query->withCount(['activistsAllocationsAssignments' => function($sql) use ($detailsSearch) {
                   
                }]);
            }
       
            $query->where('election_roles_by_voters.election_campaign_id',$detailsSearch->electionCampaignId);

            // That means that there is a filter for a specific role
            if ($detailsSearch->electionRoleId !=ElectionRolesAdditions::ALL_ROLE_TYPE && $detailsSearch->electionRoleId != ElectionRolesAdditions::MULTI_ROLE_TYPE) {
                if(is_array($detailsSearch->electionRoleId))
                $query->whereIn('election_roles_by_voters.election_role_id', $detailsSearch->electionRoleId);
                else
                $query->where('election_roles_by_voters.election_role_id',$detailsSearch->electionRoleId);
            }

            if (!is_null($detailsSearch->verifyStatus)) {
                $query->where('election_roles_by_voters.verified_status', $detailsSearch->verifyStatus);
            }

            if (!is_null($detailsSearch->phoneNumber)) {
                $query->where('election_roles_by_voters.phone_number', $detailsSearch->phoneNumber);
            }
        

            $query=self::getQueryRoleVoterWithPayment($query,$detailsSearch->activistLocked,$isWhereHas);
          
            if(!is_null($detailsSearch->cityAssignedId)){
                $query->whereIn('election_roles_by_voters.assigned_city_id',[$detailsSearch->cityAssignedId]);
            }

            if(!$isWhereHas)
            $query->groupBy('election_roles_by_voters.id');
            return $query;
    
    }
    public static function getQueryVoterSearchActivist($request,$detailsSearch,$exportType){
        $fields = [
            DB::raw('distinct voters.id as id'),
            'voters.key',
            'voters.personal_identity',
            'voters.last_name',
            'voters.first_name',
            'voters.birth_date',

            'voters.house',
            'voters.house_entry',
            'voters.email',

            'c.id as city_id',
            'c.name as city_name',

            'voters.street',
            'voters.street_id',
            'streets.name as street_name',

            //bank details:
            'bank_details.verify_bank_document_key',
            'bank_details.bank_account_number',
            'bank_branches.bank_id as bank_number',
            'bank_branches.branch_number as bank_branch_number',
            'bank_branches.id as bank_branch_id',
            DB::raw("CONCAT(bank_branches.name,' (',branch_number,')') AS bank_branch_name"),
            'bank_details.bank_owner_name',
            'bank_details.other_owner_type',
            'bank_details.is_activist_bank_owner',
            'bank_details.is_bank_verified',
            'bank_details.validation_election_campaign_id',
        ];

        $votersObj = Voters::select($fields)
        ->withCity()
        ->withBankDetails()
        ->WithStreet(true);
        $votersObj->addSelect(DB::raw(self::orderByBallotBox($detailsSearch->electionRoleId,$detailsSearch->verifyStatus,$detailsSearch->activistLocked,$detailsSearch->phoneNumber, $detailsSearch->electionCampaignId).' as maxBallot'));
        if($exportType == null){
            $votersObj->with(['voterPhones' => function($query) {
                $query->where('wrong', 0);
            }]);
        }

        if(!UserPermissionManager::isAdminUser())
        $votersObj = $votersObj->withFilters();
        self::SearchByBankDetails($votersObj,$detailsSearch->verifyBankStatus,$detailsSearch->electionCampaignId);
        $where=self::searchVoterDetails($detailsSearch);
        if(count($where))
        $votersObj->where($where);

        return $votersObj;
    }
    public static function searchVoterDetails($detailsRequest)
    {
        $where = [];

        if (!is_null($detailsRequest->firstName)) {
            $where['voters.first_name'] = $detailsRequest->firstName;
        }

        if (!is_null($detailsRequest->lastName)) {
            $where['voters.last_name'] = $detailsRequest->lastName;
        }

        if (!is_null($detailsRequest->personalIdentity)) {
            $where['voters.personal_identity'] = $detailsRequest->personalIdentity;
        }

        if (!is_null($detailsRequest->cityId)) {
            $where['c.id'] = $detailsRequest->cityId;
        } else if (!is_null($detailsRequest->subAreaId)) {
            $where['c.sub_area_id'] = $detailsRequest->subAreaId;
        } else if (!is_null($detailsRequest->areaId)) {
            $where['c.area_id'] = $detailsRequest->areaId;
        }
        return $where;
    }

    public static function argumentSearchActivist($detailsRequest)
    {
        $electionRolesHash = ElectionRolesRepository::getHashElectionRole();

        $electionRoleId = $detailsRequest->electionRoleId;
       
        $detailsRequest->countCaptain50Voters = true;
        $detailsRequest->contGeoItems = true;
        $detailsRequest->countMultiRolesOnly=false;
        if ($electionRoleId ==  ElectionRolesAdditions::ALL_ROLE_TYPE || is_array($electionRoleId)) {
            $detailsRequest->countCaptain50Voters = true;

            $detailsRequest->contGeoItems = true;
        } elseif ($electionRoleId == ElectionRolesAdditions::MULTI_ROLE_TYPE) {
            $detailsRequest->countCaptain50Voters = true;

            $detailsRequest->contGeoItems = true;
            $detailsRequest->countMultiRolesOnly = true;
        } else if ($electionRoleId != ElectionRolesAdditions::NONE_ROLE_TYPE) {
            $roleSystemName = $electionRolesHash[$electionRoleId];
            switch ($roleSystemName) {
                case config('constants.activists.election_role_system_names.ministerOfFifty'):
                    $detailsRequest->countCaptain50Voters = true;
                    break;

                case config('constants.activists.election_role_system_names.ballotMember'):
                case config('constants.activists.election_role_system_names.observer'):
                case config('constants.activists.election_role_system_names.driver'):
                case config('constants.activists.election_role_system_names.motivator'):
                    $detailsRequest->contGeoItems = true;
                    break;
                default:
                    $detailsRequest->countCaptain50Voters = true;
                    $detailsRequest->contGeoItems = true;
                    $detailsRequest->countMultiRolesOnly=false;
                    break;
            }
        }

        return $detailsRequest;
    }


    public static function getQueryRoleVoterWithPayment($query,$activistLocked,$whereHas=false){
        if(!$whereHas)
        $query=$query->with(['activistRolesPayments'=>function($q)use($activistLocked){
            $q=self::detailsPaymentBySearchDetailsActivist($q,$activistLocked);
        }]);

        else {
            $query=$query->whereHas('activistRolesPayments',function($q)use($activistLocked){
                $q=self::detailsPaymentBySearchDetailsActivist($q,$activistLocked);
            });
        }
     

        return $query;
    }

    public static function detailsPaymentBySearchDetailsActivist($q,$activistLocked){
    
            $q->select([
                DB::raw('distinct activist_roles_payments.id as activist_roles_payments_id'),
                'activist_roles_payments.election_role_by_voter_id',
                'activist_roles_payments.activists_allocations_assignment_id',
                DB::raw('payment_type_additional.name as payment_type_additional_name'), 
                'activists_allocations.id as activists_allocations_id',
                'activists_allocations.cluster_id',
                'activists_allocations.ballot_box_id',
                'activists_allocations.election_role_id',
                'clusters.name as cluster_name',
                DB::raw("CONCAT(clusters.street,' ',clusters.house) as cluster_address"),
                'activist_roles_payments.sum',
                'activist_roles_payments.user_lock_id',
                'activist_roles_payments.lock_date',
                'activist_roles_payments.comment',
                'activist_roles_payments.not_for_payment',
                'ballot_boxes.mi_id as areas_ballot_boxes_mi_id',
                'election_role_shifts.name as shift_name',
                'election_role_shifts.name as election_role_shift_system_name',
                'cities.name as city_name',
                'clusters.street',
                'election_role_shifts.id as election_role_shift_id',
                'ballot_box_roles.name as ballot_box_role_name',
                'ballot_boxes.special_access',
                'activist_roles_payments.created_at'
                ])
                ->withActivistsAllocationsAssignments()
                ->withActivistAllocation()
                ->withActivistPaymentAdditionalType()
                ->leftJoin('cities','cities.id','=','activists_allocations.city_id')
                ->leftJoin('clusters','clusters.id','=','activists_allocations.cluster_id')
                ->leftJoin('ballot_boxes','ballot_boxes.id','=','activists_allocations.ballot_box_id')
                ->leftJoin('ballot_box_roles','ballot_box_roles.id','activists_allocations.ballot_box_role_id')
                ->leftJoin('election_role_shifts','activists_allocations_assignments.election_role_shift_id','=','election_role_shifts.id');
                if (!is_null($activistLocked) && $activistLocked!=0) {
                    $nameFunc=$activistLocked==1?'whereNull':'whereNotNull';
                    $q->$nameFunc('activist_roles_payments.user_lock_id');
                }

                return $q;
      
    }
 

    /*---------------function for load activist page-------------
    /**
     * return voter with details bank,and address
     * @throws Exception
     * @return Voters
     */
    public static function getActivistFullDetailsByKey($voterKey){
        $voterFields = [
            // Voter details
            'voters.id as id',
            'voters.key',
            'voters.personal_identity',
            'voters.first_name',
            'voters.last_name',
            'voters.email',
            
            // Voter address
            'voters.street',
            'voters.street_id',
            'voters.house',
            'streets.name as street_name',

            'c.id as city_id',
            'c.key as city_key',
            'c.name as city_name',

            // Voters bank details
            'bank_branches.bank_id as bank_number',
            'bank_branches.branch_number as bank_branch_number',
            'bank_branches.id as bank_branch_id',
            DB::raw("CONCAT(bank_branches.name,' (',branch_number,')') AS bank_branch_name"),
            'bank_details.bank_account_number',
            'bank_details.bank_owner_name',
            'bank_details.other_owner_type',
            'bank_details.is_activist_bank_owner',
            'bank_details.is_bank_verified',
            'bank_details.is_bank_wrong',
            'bank_details.verify_bank_document_key',
            'bank_details.validation_election_campaign_id'
        ];

        $currentVoter = Voters::select($voterFields)
            ->withBankDetails()
            ->withStreet(true)
            ->withCity()
            ->with('voterPhones')
            ->where('voters.key', DB::raw($voterKey))
            ->first();
          
        if(!$currentVoter)
        throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));


        return $currentVoter;
    }

    /**
     * return string array with name field role voter for query
     * @return string[]
     */
    public static function getActivistRoleVoterFields(){
        return [
            'election_roles_by_voters.id',
            'election_roles_by_voters.key',
            'election_roles_by_voters.voter_id',

            'election_roles_by_voters.instructed',
            'election_roles_by_voters.verified_status',
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.vote_reporting_key',
            'election_roles_by_voters.user_lock_id',
            'election_roles_by_voters.assigned_city_id',
            'assigned_city.name as assigned_city_name',
            'election_roles_by_voters.assigned_city_id',

            'election_roles_by_voters.user_create_id',
            'voter_create.first_name as user_create_first_name',
            'voter_create.last_name as user_create_last_name',
            'election_roles_by_voters.created_at',
            'election_roles_by_voters.allocation_removed_time',

            'election_roles_by_voters.user_update_id',
            'voter_update.first_name as user_update_first_name',
            'voter_update.last_name as user_update_last_name',
            'election_roles_by_voters.updated_at',

            'voter_lock.first_name as user_lock_first_name',
            'voter_lock.last_name as user_lock_last_name',
            'election_roles_by_voters.lock_date',

            'election_roles.id as election_role_id',
            'election_roles.name as election_role_name',
            'election_roles.system_name',

            'election_roles_by_voters.election_campaign_id',
            'election_campaigns.name as CampaignName',
        ];
    }

    public static function getActivistAssignmentFields(){
        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
        return  [
            'activists_allocations_assignments.id',
            'activists_allocations_assignments.election_role_by_voter_id',
            'activists_allocations_assignments.not_check_location',
            'activists_allocations_assignments.appointment_letter',
            'activists_allocations_assignments.not_check_location',
            'activists_allocations.id as activists_allocation_id',
            'activists_allocations.cluster_id',
            'activists_allocations_assignments.election_role_shift_id',
            'election_role_shifts.name as election_role_shift_name',
            'election_role_shifts.key as election_role_shift_key',
            'election_role_shifts.system_name as election_role_shift_system_name',
            DB::raw($fullClusterNameQuery),
            'clusters.key as cluster_key',
            'clusters.street',
            'clusters.city_id',
            'cities.name as city_name',
            'quarters.name as quarter_name',
            'clusters.mi_id as cluster_mi_id',
            'ballot_boxes.id as ballot_box_id',
            'ballot_boxes.key as ballot_box_key',
            'ballot_boxes.mi_id',
            DB::raw('IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access'),
            'activists_allocations.ballot_box_role_id as ballot_box_role_id',
            'activists_allocations.election_role_id',
            'ballot_box_roles.name as ballot_box_role_name',
            //only for roles that payment by assignment
             'activist_roles_payments.sum',
             'activist_roles_payments.id as activist_roles_payments_id',
             DB::raw('(select count(*) from ballot_boxes where ballot_boxes.cluster_id=clusters.id) as countBallotBox')
        ];         
    }

    public static function getRoleMessageField(){
       return [
            'election_role_by_voter_messages.id',
            'election_role_by_voter_messages.key',
            'election_role_by_voter_messages.election_role_by_voter_id',
            'election_role_by_voter_messages.direction',
            'election_role_by_voter_messages.text',
            'election_role_by_voter_messages.phone_number',
            'election_role_by_voter_messages.verified_status',
            'election_role_by_voter_messages.created_at',
        ];

    }


    // public static function getClusterLeaderRoleDetails($where)
    // {

    //     $election_role_cluster_leader = self::getBasicQueryDetailsVoterRoles();

    //     $election_role_cluster_leader = $election_role_cluster_leader->where($where)
    //         ->where('election_roles.system_name', config('constants.activists.election_role_system_names.clusterLeader'));


    //     self::addClustersAssignmentsToQuery($election_role_cluster_leader);

    //     $election_role_cluster_leader = $election_role_cluster_leader->get();

    //     return $election_role_cluster_leader;
    // }

    // public static function getMotivatorRoleDetails($where)
    // {
    //     $election_role_motivator = self::getBasicQueryDetailsVoterRoles();

    //     $election_role_motivator = $election_role_motivator->where($where)
    //         ->where('election_roles.system_name', config('constants.activists.election_role_system_names.motivator'));

    //     self::addClustersAssignmentsToQuery($election_role_motivator);

    //     $election_role_motivator = $election_role_motivator->get();

    //     return $election_role_motivator;
    // }


    // public static function getBallotMemberDetails($where)
    // {

    //     $election_role_ballot_member = self::getBasicQueryDetailsVoterRoles();
    //     $election_role_ballot_member 
    //         ->where($where)
    //         ->where('election_roles.system_name', config('constants.activists.election_role_system_names.ballotMember'));

    //     self::addBallotAssignmentsToQuery($election_role_ballot_member);
    //     $election_role_ballot_member = $election_role_ballot_member->get();
    // }

    // public static function getObserveDetails($where){

    //     $election_role_observer =self::getBasicQueryDetailsVoterRoles();

    //     $election_role_observer=$election_role_observer
    //     ->where($where)
    //         ->where('election_roles.system_name', config('constants.activists.election_role_system_names.observer'));

    //         self::addBallotAssignmentsToQuery($election_role_observer);
    //         $election_role_observer = $election_role_observer->get();

    //         return $election_role_observer;

    //         if (!is_null($election_role_observer)) {
    //             foreach($election_role_observer as $item){
    //                 for ($i=0; $i<count($item->activistsAllocationsAssignments); $i++) {
    //                     $removeOtherGeoKey = null;
    //                     $geoRole = $item->activistsAllocationsAssignments[$i];
    //                     $currentId = $geoRole->id;
    //                     foreach ($geoRole->otherActivistAllocationAssignment as $key => $otherRole) {
    //                         if ($otherRole->id == $currentId) {
    //                             $removeOtherGeoKey = $key;
    //                             break;
    //                         }
    //                     }
    //                     if ($removeOtherGeoKey !== null) {
    //                         $geoRole->other_election_roles = $geoRole->otherActivistAllocationAssignment->forget($removeOtherGeoKey)->values();
    //                         unset($geoRole->otherActivistAllocationAssignment);
    //                     }
    //                 }
    //                 $election_roles_by_voter[] = $item;
    //             }

    //         }
    // }

    // public static function getCounterDetails($where){
    //     //* Counter elections role:
    //     $election_role_counter = self::getBasicQueryDetailsVoterRoles();
    //     $election_role_counter=$election_role_counter->where($where)
    //         ->where('election_roles.system_name', config('constants.activists.election_role_system_names.counter'));
    //         self::addBallotAssignmentsToQuery($election_role_counter);
    //         $election_role_counter = $election_role_counter->get();

    //     return $election_role_counter;
    //     if (!is_null($election_role_counter)) {
    //         foreach($election_role_counter as $item){
    //             for ($i=0; $i<count($item->activistsAllocationsAssignments); $i++) {
    //                 $removeOtherGeoKey = null;
    //                 $geoRole = $item->activistsAllocationsAssignments[$i];
    //                 $currentId = $geoRole->id;
    //                 foreach ($geoRole->otherActivistAllocationAssignment as $key => $otherRole) {
    //                     if ($otherRole->id == $currentId) {
    //                         $removeOtherGeoKey = $key;
    //                         break;
    //                     }
    //                 }
    //                 if ($removeOtherGeoKey !== null) {
    //                     $geoRole->other_election_roles = $geoRole->otherActivistAllocationAssignment->forget($removeOtherGeoKey)->values();
    //                     unset($geoRole->otherActivistAllocationAssignment);
    //                 }
    //             }
    //             $election_roles_by_voter[] = $item;
    //         }
    //     }
    // }

    // public static function getGeneralWorker($where){

    //     $election_role_general_worker = self::getBasicQueryDetailsVoterRoles();
    //     $election_role_general_worker=$election_role_general_worker->where($where)
    //     ->where('election_roles.system_name', config('constants.activists.election_role_system_names.electionGeneralWorker'));

    //     $election_role_general_worker = $election_role_general_worker->get();
    //     return  $election_role_general_worker;
    // }

    public static function getCaptainDetails($voterId, $electionCampaignId)
    {
        $roleCaptainSystemName = config('constants.activists.election_role_system_names.ministerOfFifty');
        $captainDetails = self::getQueryDetailsVoterRolesAndAssignment([$roleCaptainSystemName], $voterId, $electionCampaignId);

        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name', true);

        $captainDetails = $captainDetails->with(['captain50Households' => function ($qr) use ($electionCampaignId, $voterId, $fullClusterNameQuery) {
            $fields = [
                'voters.last_name',
                'voters.household_id',
                'voters.mi_city_id',
                'voters.mi_street',

                'voters_with_captains_of_fifty.id',
                'voters_with_captains_of_fifty.key',
                'voters_with_captains_of_fifty.captain_id',

                'clusters.id as cluster_id',
                DB::raw($fullClusterNameQuery),
                'cities.name as city_name',

                'ballot_boxes.id as ballot_box_id',
                'ballot_boxes.mi_id',

                DB::raw('COUNT(distinct voters.id) as household_members_count')
            ];

            $qr->select($fields)
                ->withVoters()
                ->withElectionCampaigns($electionCampaignId, false);

            $qr->where([
                'voters_with_captains_of_fifty.election_campaign_id' => $electionCampaignId,
                'voters_with_captains_of_fifty.captain_id' => $voterId,
                'voters_with_captains_of_fifty.deleted' => 0
            ]);
            $qr->groupBy('voters.household_id');
        }]);

        $captainDetails = $captainDetails->get();

        if (!is_null($captainDetails)) {
            foreach ($captainDetails as $item) {
                for ($i = 0; $i < sizeof($item->captain50Households); $i++) {
                    $householdItem = $item->captain50Households[$i];
                    $householdItem->household_members =  Voters::select('voters.personal_identity', 'voters.first_name', 'voters.last_name', 'voters.household_id')
                    ->join('voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', '=', 'voters.id')
                    ->where('voters_in_election_campaigns.election_campaign_id', $electionCampaignId)
                        ->where('voters.household_id', $householdItem->household_id)
                        ->get();
                }
                //$election_roles_by_voter[] = $item;
            }
        }

        return $captainDetails;
    }

    // public static function getActivistMunicipalDetails( $where){

    //     foreach(config('constants.activists.muni_elections_roles_names') as $roleSystemName){
    //         $muniElectionRole = self::getVoterMunicipalRoleData($roleSystemName, $where, $activistsFields, $messagesFields);
    //         if($muniElectionRole){
    //             $election_roles_by_voter[] = $muniElectionRole;
    //         }
    //     }
    // }

    public static function getDriverDetails($voterId, $electionCampaignId)
    {
        $roleDriverSystemName = config('constants.activists.election_role_system_names.driver');
        $transportationCarFields = [
            'transportation_cars.type as transportation_car_type',
            'transportation_cars.number as transportation_car_number',
            'transportation_cars.passenger_count',
        ];

        $driverDetails = self::getQueryDetailsVoterRolesAndAssignment([$roleDriverSystemName], $voterId, $electionCampaignId);
        $driverDetails->addSelect($transportationCarFields)
            ->withTransportationCar();


        return $driverDetails->get();
    }

    public static function getElectionActivistRoles($voterKey, $onlyCurrentCampaign = true,$specificCampaignId=false)
    {
        $lastCampaignId = null;
        $currentVoter = self::getActivistFullDetailsByKey($voterKey);
        $voterId = $currentVoter->id;

        if($specificCampaignId)
        $lastCampaignId=$specificCampaignId;
        else if ($onlyCurrentCampaign)
            $lastCampaignId = ElectionCampaigns::currentCampaign()->id;
        $allActivistDetails = new \Illuminate\Support\Collection;
        //special role type with another details
        $driverDetails = self::getDriverDetails($voterId, $lastCampaignId);
        $allActivistDetails = $allActivistDetails->merge($driverDetails);
        //לטפל בשר מאה
        $captainFifty = self::getCaptainDetails($voterId, $lastCampaignId);
        $allActivistDetails = $allActivistDetails->merge($captainFifty);
        //another activist role type details
        $activistRoleType = [
            config('constants.activists.election_role_system_names.clusterLeader'),
            config('constants.activists.election_role_system_names.motivator'),
            config('constants.activists.election_role_system_names.ballotMember'),
            config('constants.activists.election_role_system_names.counter'),
            config('constants.activists.election_role_system_names.electionGeneralWorker'),
            config('constants.activists.election_role_system_names.observer'),
        ];
        $activistRoleType = array_merge($activistRoleType, config('constants.activists.muni_elections_roles_names'));
        $anotherActivistRoleDetailsQuery = self::getQueryDetailsVoterRolesAndAssignment($activistRoleType, $voterId, $lastCampaignId);
        $anotherActivistRoleDetails = $anotherActivistRoleDetailsQuery->get();
        $allActivistDetails = $allActivistDetails->merge($anotherActivistRoleDetails);

        foreach ($allActivistDetails as &$electionRole) {
            $electionRole->mobile_link = ($electionRole->vote_reporting_key) ? config('app.url') . $electionRole->vote_reporting_key : "";
        }

        $currentVoter->election_roles_by_voter = $allActivistDetails;
        return $currentVoter;

        // if (!is_null($election_role_motivator)) {
        //     foreach($election_role_motivator as $item){
        //         foreach ($item->electionRolesGeographical as $geo) {
        //             $geo->setAppends(['countBallotBox']);
        //         }
        //         $election_roles_by_voter[] = $item;
        //     }
        // }


        // if (!is_null($election_role_driver)) {
        //     foreach($election_role_driver as $item){
        //         foreach ($item->electionRolesGeographical as $geo) {
        //             $geo->setAppends(['countBallotBox']);
        //         }
        //         $election_roles_by_voter[] = $item;
        //     }

        // }



        // if (!is_null($election_role_ballot_member)) {
        //     foreach($election_role_ballot_member as $item){
        //         // Remove other ballot member ballots:
        //         for ($i=0; $i<count($item->activistsAllocationsAssignments); $i++) {
        //             $removeOtherGeoKey = null;
        //             $geoRole = $item->activistsAllocationsAssignments[$i];
        //             $currentId = $geoRole->id;
        //             // foreach ($geoRole->otherElectionRoles as $key => $otherRole) {
        //             //     if ($otherRole->id == $currentId) {
        //             //         $removeOtherGeoKey = $key;
        //             //         break;
        //             //     }
        //             // }
        //             // if ($removeOtherGeoKey !== null) {
        //             //     $geoRole->other_election_roles = $geoRole->otherElectionRoles->forget($removeOtherGeoKey)->values();
        //             //     unset($geoRole->otherElectionRoles);
        //             // }
        //         }
        //         $election_roles_by_voter[] = $item;
        //     }

        // }





        // $election_role_ministerOf50 = ElectionRolesByVoters::select($activistsFields)
        // //      //!! to remove in new allocations version
        //     ->addSelect('election_roles_by_voter_bonus.sum as bonus', 'election_roles_by_voter_bonus.user_lock_id as bonus_user_lock_id' , 'election_roles_by_voter_bonus.key as bonus_key')
        //     ->leftJoin('election_roles_by_voters as election_roles_by_voter_bonus' , function ($q) {
        //         $q->on('election_roles_by_voter_bonus.voter_id', 'election_roles_by_voters.voter_id')
        //         ->where('election_roles_by_voter_bonus.election_role_id', 18); 
        //     })
        // //      //!! to remove in new allocations version

    }

    public static function getQueryDetailsVoterRolesAndAssignment($activistRoleType,$voterId, $electionCampaignId = null)
    {
        $activistsFields = self::getActivistRoleVoterFields();

        $messagesFields = self::getRoleMessageField();
        $basicQuery = ElectionRolesByVoters::select($activistsFields)
            ->withCampaign()
            ->withActivistRolesPayments(true,true)
            ->withElectionRole()
            ->withUserCreate()
            ->withUserUpdate()
            ->withUserLock()
            ->withActivistAssingedCity()
            ->where('election_roles_by_voters.voter_id', $voterId)
            ->whereIn('election_roles.system_name',$activistRoleType)
            ->with(['messages' => function ($qr) use ($messagesFields) {
                $qr->addSelect($messagesFields)
                    ->where('deleted', 0);
            }]);

        if ($electionCampaignId)
            $basicQuery->where('election_roles_by_voters.election_campaign_id', $electionCampaignId);

        self::queryWithAssignmentDetails($basicQuery);
        
        return $basicQuery;
    }

    // private static function addActivistsMessagesHistory($query, $messagesFields){
    //     $query->with(['messages' => function ($qr) use($messagesFields) {
    //         $qr->addSelect($messagesFields)
    //             ->where('deleted', 0);
    //     }]);
    // }

    // public static function getVoterMunicipalRoleData(string $roleSystemName, array $where, array $fields, array $messagesFields){
    //     $municipalElectionRole = ElectionRolesByVoters::select($fields)
    //     // ->addSelect() // Need to select activist user phone number!!!!
    //     ->withCampaign()
    //     ->withElectionRole()
    //     ->withActivistRolesPayments(true)
    //     ->withUserCreate()
    //     ->withUserUpdate()
    //     ->withUserLock()
    //     ->withActivistAssingedCity()
        

    //     ->where($where)
    //     ->where('election_roles.system_name', $roleSystemName);
    //     self::addActivistsMessagesHistory($municipalElectionRole, $messagesFields);
    //     return $municipalElectionRole->first();
    // }

    private static function queryWithAssignmentDetails($query){
        $assignmentField = self::getActivistAssignmentFields();
        $query->with(['activistsAllocationsAssignments' => function ($qr) use ($assignmentField) {
            $qr->addSelect($assignmentField)
            ->withActivistAllocation()
            ->withActivistRolesPayments()//only for payment roles by assignment
            ->leftJoin('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id')
            ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'activists_allocations.ballot_box_id')
            ->leftJoin('ballot_box_roles', 'ballot_box_roles.id', '=', 'ballot_boxes.ballot_box_role_id')
            ->leftJoin('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id')
            ->leftJoin('cities', 'cities.id', '=', 'activists_allocations.city_id')
            ->leftJoin('quarters', 'quarters.id', '=', 'activists_allocations.quarter_id');
        }]);
    }

    public static function getDetailsAssignmentByAssignmentId($id)
    {
        return ActivistAllocationAssignment::select(self::getActivistAssignmentFields())
            ->withActivistAllocation()
            ->withActivistRolesPayments() //only for payment roles by assignment
            ->leftJoin('election_role_shifts', 'election_role_shifts.id', '=', 'activists_allocations_assignments.election_role_shift_id')
            ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'activists_allocations.ballot_box_id')
            ->leftJoin('ballot_box_roles', 'ballot_box_roles.id', '=', 'ballot_boxes.ballot_box_role_id')
            ->leftJoin('clusters', 'clusters.id', '=', 'activists_allocations.cluster_id')
            ->leftJoin('quarters', 'quarters.id', '=', 'activists_allocations.quarter_id')
            ->leftJoin('cities', 'cities.id', '=', 'activists_allocations.city_id')
            ->where('activists_allocations_assignments.id', $id)
            ->first();
    }

    /** 
     * @method  getAssignedCitiesArray
     * Need to be in permissions service
     * 
     * Get user allow cities: */

    private static function getAssignedCitiesArray($cityAssignedId, $subareaAssignedId, $areaAssignedId ){
        
        $assignedCitiesArray = [];
        $cities = City::select('id', 'key')
        ->where('cities.deleted', 0);

        if($cityAssignedId){
            $cities->where('cities.id', $cityAssignedId);
        } else if ($subareaAssignedId){
            $cities->where('sub_area_id', $subareaAssignedId);
        } else if($areaAssignedId){
            $cities->where('area_id', $areaAssignedId);
        }
        $cities = $cities->get();
        if($cities){
            $assignedCitieskeysArray = [];
            foreach($cities as $c){ 
                $assignedCitieskeysArray[] = $c->key;
            }
                $assignedCitiesArray = GlobalController::isAllowedCitiesForUser($assignedCitieskeysArray);
        }
        // dd($assignedCitiesArray);
        return $assignedCitiesArray;
    }
 
    /**
     * @method getCountHouseholdQuery
     * !! need to fix in the new allocations assignment 
     * Get sub query for Count captain50 households.
     */
    private static function getCountHouseholdQuery($last_campaign_id) {
        $countHouseholdsQuery = "(SELECT COUNT(DISTINCT voters_allocated_to_captain50.household_id) FROM ";
        $countHouseholdsQuery .= "voters as voters_allocated_to_captain50 INNER JOIN voters_with_captains_of_fifty ";
        $countHouseholdsQuery .= "ON voters_with_captains_of_fifty.voter_id=voters_allocated_to_captain50.id ";
        $countHouseholdsQuery .=  "AND voters_with_captains_of_fifty.election_campaign_id=" . $last_campaign_id;
        $countHouseholdsQuery .=  " AND voters_with_captains_of_fifty.deleted=0 ";
        $countHouseholdsQuery .=  "JOIN election_roles_by_voters as election_roles_by_voters2 ON ";
        $countHouseholdsQuery .=  "election_roles_by_voters2.voter_id=voters_with_captains_of_fifty.captain_id ";
        $countHouseholdsQuery .= "WHERE election_roles_by_voters2.id=election_roles_by_voters.id) ";
        $countHouseholdsQuery .=  "as total_count_minister_of_fifty_count";

        return $countHouseholdsQuery;
    }

    /**
     *  @method orderByBallotBox
     * Get order by ballot mi_id query.
     * !! Shany What to do if no ballot box ?!
     * */
    public static function orderByBallotBox($electionRoleId,$verifyStatus,$activistLocked,$phoneNumber,$last_campaign_id){

        $query='(select max(ballot_boxes.mi_id) 
                from activists_allocations_assignments 
                join election_roles_by_voters on activists_allocations_assignments.election_role_by_voter_id=election_roles_by_voters.id 
                join  activists_allocations on activists_allocations.id=activists_allocations_assignments.activist_allocation_id 
                join  ballot_boxes on ballot_boxes.id=activists_allocations.ballot_box_id 
                where election_roles_by_voters.voter_id=voters.id and election_roles_by_voters.election_campaign_id='.$last_campaign_id;
                if(is_array($electionRoleId))
                    $query= $query.' and election_roles_by_voters.election_role_id in ('.implode(',',$electionRoleId).')';
                    else
                    $query= $query.' and election_roles_by_voters.election_role_id in ('.implode(',',[$electionRoleId]).')';
          
                if (!is_null($verifyStatus)) {
                    $query= $query.' and election_roles_by_voters.verified_status='.$verifyStatus;
                }

                if (!is_null($activistLocked) && $activistLocked!=0) {
                    $nameFunc=$activistLocked==1?'is null':'is not null';
                    $query= $query.' and election_roles_by_voters.user_lock_id '.$nameFunc;
                }

                if (!is_null($phoneNumber)) {
                    $query= $query.' and election_roles_by_voters.phone_number like '.$phoneNumber;
                }
                // dd($query);
                return  $query.')';
    }
    //  no need to get Captain50 cluster data!!!
    public static function addExportDataToActivistsQuery(&$query){
        $selectClusterAddress = "CONCAT(clusters_areas_cities.name,', ',areas_clusters.street,', ',areas_clusters.house)";
        $selectLeaderClusterAddress = "CONCAT(leader_city.name,', ',leader_cluster.street,', ',leader_cluster.house)";
        // $selectCaptain50ClusterAddress = "CONCAT(captain_voters_city.name,', ',captain_voters_cluster.street,', ',captain_voters_cluster.house)";
        $extraFields = [

            DB::raw("(CASE WHEN (areas_clusters.id IS NOT NULL) THEN $selectClusterAddress " .
            // " WHEN (captain_voters_cluster.id IS NOT NULL) THEN $selectCaptain50ClusterAddress" .
            " WHEN (leader_cluster.id IS NOT NULL) THEN $selectLeaderClusterAddress ELSE '' END )  as cluster_address"),

            DB::raw("(CASE WHEN (areas_clusters.id IS NOT NULL) THEN areas_clusters.name " .
            // " WHEN (captain_voters_cluster.id IS NOT NULL) THEN captain_voters_cluster.name" .
            " WHEN (leader_cluster.id IS NOT NULL) THEN leader_cluster.name  ELSE '' END )  as cluster_name"
            ),

        ];
        //Need to add election campaign!!!!
        $query->addSelect($extraFields)
        ->withLeaderClustersData()
        // ->withCaptain50ClustersData()
        ->withGeographic(true)
        ->withGeographicalAreasClustersData()
        ->groupBy('election_roles_by_voters.id');
    }
    /**
     * !! Need to add to search for activists
     * Check bank verify statuses on activists search 
    */ 
    public static function addBankVerifyStatusToQuery($votersObj, $verifyBankStatuses, $last_campaign_id){
        $verifyBankStatusesArray = config('constants.activists.verifyBankStatuses');

        $verifyBankStatusesHash = [];
        foreach($verifyBankStatuses as $item){
            $verifyBankStatusesHash[$item] = true;
        }
        // All bank details are valid
        if(!empty($verifyBankStatusesHash[$verifyBankStatusesArray['allDetailsCompleted']])){
            $votersObj->where(function ($query) use($last_campaign_id) {
                $query->whereNotNull('bank_details.bank_account_number')
                ->whereNotNull('bank_details.verify_bank_document_key')
                ->where('bank_details.is_bank_verified', 1)
                ->where('bank_details.validation_election_campaign_id', $last_campaign_id); 
            });
            return;
        }
        // Even single bank details is not valid

        if(!empty($verifyBankStatusesHash[$verifyBankStatusesArray['notAllDetailsCompleted']])){
            $votersObj->where(function ($query) use($last_campaign_id)  {
                $query->orWhereNull('bank_details.id')
                ->orWhereNull('bank_details.bank_account_number')
                ->orWhereNull('bank_details.verify_bank_document_key')
                ->orWhere('bank_details.is_bank_verified', 0)
                ->orWhere('bank_details.validation_election_campaign_id', '!=', $last_campaign_id); 
            });
            return;
        }

        $DisplayBankDetailsMissing = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankDetailsMissing']]);
        $DisplayVerifyDocumentMissing = isset($verifyBankStatusesHash[$verifyBankStatusesArray['VerifyDocumentMissing']]);
        $DisplayBankNotVerified = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankNotVerified']]);
        $DisplayBankNotUpdated = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankNotUpdated']]);
        // dump($DisplayBankDetailsMissing, $DisplayVerifyDocumentMissing, $DisplayBankNotVerified, $DisplayBankNotUpdated);
        // die;

        /**
         * For multiple selection:
         * Manage by bank details levels
         *  1. if "bank not updated" chosen
         *  2. if "bank not verify" chosen
         *  3. if "bank document missing" chosen
         *  4. if "bank details missing" chosen
         *  -> Inside the top level - check also the low levels
        */ 

        if($DisplayBankNotUpdated){ // if bank not updated also chosen
            $votersObj->where(function ($query) use($last_campaign_id,
                $DisplayVerifyDocumentMissing, $DisplayBankNotVerified, $DisplayBankDetailsMissing)  {
                $query->where('validation_election_campaign_id', '!=', $last_campaign_id);
                if(!$DisplayBankNotVerified){
                    $query->where('bank_details.is_bank_verified', 1);
                } else {
                    $query->orWhere('bank_details.is_bank_verified', 0);
                }
                if(!$DisplayVerifyDocumentMissing){
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else{
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                }else{
                    $query->orWhereNull('bank_details.id')
                    ->orWhereNull('bank_details.bank_account_number');
                }
 
            });
        } else if($DisplayBankNotVerified){
            $votersObj->where(function ($query) use($DisplayVerifyDocumentMissing, $DisplayBankDetailsMissing)  {
                $query->where('bank_details.is_bank_verified', 0);
                if(!$DisplayVerifyDocumentMissing){
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else {
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                } else{
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if($DisplayVerifyDocumentMissing){
            $votersObj->where(function ($query) use( $DisplayBankDetailsMissing)  {
                $query->whereNull('bank_details.verify_bank_document_key');

                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                }else{
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if($DisplayBankDetailsMissing){
            $votersObj->where(function ($query) use($last_campaign_id)  {
                $query->whereNull('bank_details.bank_account_number')
                    ->orWhereNull('bank_details.id');
                });
        }
    }

}
