<?php

namespace App\Models;

use App\Models\ActivistPaymentModels\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


/**
 * @property integer $id
 * @property integer $election_campaign_id
 * @property integer $voter_id
 * @property integer $election_role_id
 * @property string $created_at
 * @property string $updated_at
 */
class ElectionRolesByVoters extends Model
{
    /**
     * @var array
     */
	 
	public $primaryKey = 'id';

    protected $table = 'election_roles_by_voters';
	
    protected $fillable = ['election_campaign_id', 'voter_id', 'election_role_id', 'created_at', 'updated_at'];

    public static $lengthKey=5;

    public function scopeWithCampaign ( $query ) {
        return $query->join( 'election_campaigns', 'election_campaigns.id', '=',
            'election_roles_by_voters.election_campaign_id' );
    }
    //!! Need to delete this function:
	public function scopeWithElectionRoleGeographical ( $query  , $leftJoin = true) {
		if($leftJoin){
			$query->leftJoin( 'election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'election_roles_by_voters.id' );
		}
		else{
			$query->join( 'election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'election_roles_by_voters.id' );
		}
    }
     //TODO::remove
    public function scopeWithRoleLockingUser ( $query ) {

        $query->leftJoin( 'users', 'users.id', '=', 'election_roles_by_voters.user_lock_id' )
        ->leftJoin( 'voters', 'voters.id', '=', 'users.voter_id' );
    }

    public function scopeWithVotersInElectionCampaigns ( $query  ) {
        $query->join('voters_in_election_campaigns' , function($joinOn){
            $joinOn->on('voters_in_election_campaigns.voter_id', '=','election_roles_by_voters.voter_id' )
            ->on('voters_in_election_campaigns.election_campaign_id', '=','election_roles_by_voters.election_campaign_id' );
        });
    }
    
    public function scopeWithVotersInElectionCampaignsWithBallotAndCluster ( $query  , $electionCampaignID) {
        $query->join( 'voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', '=', 'election_roles_by_voters.voter_id' )
              ->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' )
               ->join( 'clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id' )
               ->where('voters_in_election_campaigns.election_campaign_id' , $electionCampaignID);
    }
	
	public function scopeWithElectionRole ( $query, $leftJoin = true ) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
         $query->$joinMethod( 'election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id' );
    }

    public function scopeWithVoterInElectionCampaign ( $query ) {

        $query->join( 'voters_in_election_campaigns', function($joinOn){
             $joinOn->on('voters_in_election_campaigns.election_campaign_id','=' , 'election_roles_by_voters.election_campaign_id')
                ->on('voters_in_election_campaigns.voter_id','=' , 'election_roles_by_voters.voter_id');
        })->join('ballot_boxes' , 'ballot_boxes.id','ballot_box_id')
        ->join('clusters' , 'clusters.id','ballot_boxes.cluster_id');
    }
	
	public function scopeWithVoter ( $query ,$nameTable=false) {
        if(!$nameTable)
        $query->leftJoin( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' );
        else
        $query->leftJoin( 'voters as '.$nameTable, $nameTable.'.id', '=', 'election_roles_by_voters.voter_id' );
    }
	public function scopeWithUser ( $query ) {
        $query->leftJoin( 'users', 'users.voter_id', '=', 'election_roles_by_voters.voter_id' );
    }

    public function scopeWithVoterCity ( $query ) {
        $query->leftJoin( 'cities', 'cities.id', '=', 'voters.city_id' );
    }

    public function scopeWithVoterAndCity ( $query , $leftJoin = false ) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' )
            ->$joinMethod('cities' , 'cities.id' , 'voters.city_id');
    }

	public function totalCountClusterLeaders(){
		return $this->hasMany( 'App\Models\Cluster' ,  'leader_id' , 'voter_id')
                    ->where('system_name' , config('constants.activists.election_role_system_names.clusterLeader'));
	}

    public function clustersLeader() {
        return $this->hasMany( 'App\Models\Cluster' ,  'leader_id' , 'voter_id');
    }

    public function bankDetails()
    {
        return $this->hasOne('App\Models\BankDetails',  'voter_id', 'voter_id');
    }

    public function captain50Households() {
        return $this->hasMany( 'App\Models\VoterCaptainFifty' ,  'captain_id' , 'voter_id');
    }
    //!! Need to delete this function:
    public function electionRolesGeographical () {
        return $this->hasMany( 'App\Models\ElectionRolesGeographical', 'election_role_by_voter_id', 'id' );
    }
    //!! Need to delete this function:
    public function activistsAllocations() {
        return $this->hasMany( 'App\Models\ActivistsAllocations', 'election_role_by_voter_id', 'id' );
    }
    public function activistsAllocationsAssignments() {
        return $this->hasMany( 'App\Models\ActivistAllocationAssignment', 'election_role_by_voter_id', 'id' );
    }
    public function activistRolesPayments() {
        return $this->hasMany( 'App\Models\ActivistPaymentModels\ActivistRolesPayments', 'election_role_by_voter_id', 'id' );
    }
	
	public function votes(){
		  return $this->hasMany('App\Models\Votes', 'voter_id', 'voter_id');
	}
	
	public function reportingVotes(){
		  return $this->hasMany('App\Models\Votes', 'reporting_voter_id', 'voter_id');
	}
	public function lastReportingVote(){
		  return $this->hasOne('App\Models\Votes', 'reporting_voter_id', 'voter_id');
	}

    public function scopeWithCaptain50Household($query, $last_campaign_id) {
        $query->join('voters_with_captains_of_fifty', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_with_captains_of_fifty.captain_id', '=', 'election_roles_by_voters.voter_id'],
                ['voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
            ]);
        })
        ->leftJoin('voters as captain_voters', 'captain_voters.id', '=', 'voters_with_captains_of_fifty.voter_id')
        ->leftJoin('voters_in_election_campaigns', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_in_election_campaigns.voter_id', '=', 'captain_voters.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
        ->leftJoin('clusters', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['clusters.id', '=', 'ballot_boxes.cluster_id'],
                ['clusters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        });
    }

    public function scopeWithCaptain50($query, $last_campaign_id, $isLeftJoin = false) {
        $selectedJoin = ($isLeftJoin)? "leftJoin" : "join";
        $query->{$selectedJoin}('voters_with_captains_of_fifty', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_with_captains_of_fifty.captain_id', '=', 'election_roles_by_voters.voter_id'],
                ['voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
            ]);
        });
    }

    public function messages() {
        return $this->hasMany( 'App\Models\ElectionRolesByVotersMessages', 'election_role_by_voter_id', 'id' );
    }
	 public function lastMessage() {
        return $this->hasOne( 'App\Models\ElectionRolesByVotersMessages', 'election_role_by_voter_id', 'id' );
    }
	
    public function votersTransportations() {
        return $this->hasMany( 'App\Models\VoterTransportation', 'voter_driver_id', 'voter_id' );
    }

    public function scopeWithUserCreate($query) {
        $query->leftJoin('users as user_create', 'user_create.id', '=', 'election_roles_by_voters.user_create_id')
              ->leftJoin('voters as voter_create', 'voter_create.id', '=', 'user_create.voter_id');
    }

    public function scopeWithUserUpdate($query) {
        $query->leftJoin('users as user_update', 'user_update.id', '=', 'election_roles_by_voters.user_update_id')
              ->leftJoin('voters as voter_update', 'voter_update.id', '=', 'user_update.voter_id');
    }

    public function scopeWithUserLock($query) {
        $query->leftJoin('users as user_lock', 'user_lock.id', '=', 'election_roles_by_voters.user_lock_id')
              ->leftJoin('voters as voter_lock', 'voter_lock.id', '=', 'user_lock.voter_id');
    }

    public function captainVoters() {
        return $this->hasMany( 'App\Models\VoterCaptainFifty' ,  'captain_id' , 'voter_id');
    }
    public function scopeWithTransportationCar($query) {
        $query->leftJoin('transportation_cars', 'transportation_cars.election_role_by_voter_id', '=', 'election_roles_by_voters.id');
    }

    public function scopeWithGeographic($query, $leftJoin = false) {
        if($leftJoin){
            $query->leftJoin('election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id',
            'election_roles_by_voters.id');
        }else{
            $query->join('election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id',
            'election_roles_by_voters.id');
        }

    }

    public function scopeWithCaptain50Activist($query, $last_campaign_id)
    {
        $query->leftJoin('voters_with_captains_of_fifty', function ($joinOn) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_with_captains_of_fifty.captain_id', '=', 'election_roles_by_voters.voter_id'],
                ['voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
            ]);
        });
    }


    public function scopeWithClusterLeader($query, $last_campaign_id) {
        $query->join('clusters', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['clusters.leader_id', '=', 'election_roles_by_voters.voter_id'],
                ['clusters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        });
    }
    public function scopeWithGeographicalAreasBallotsData($query) {
            $query->leftJoin('ballot_boxes as areas_ballot_boxes', function ( $joinOn ) {
                $joinOn->on([
                    ['areas_ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                    ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))],
                ]);
            })
            ->leftJoin('clusters as ballots_areas_clusters', function ( $joinOn ) {
                $joinOn->on([
                    ['ballots_areas_clusters.id', '=', 'areas_ballot_boxes.cluster_id'],
                    ['ballots_areas_clusters.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
                ]);
            })
            ->leftJoin('cities as ballots_areas_cities', 'ballots_areas_cities.id', 'ballots_areas_clusters.city_id')

            ->leftJoin('election_role_shifts', 'election_role_shifts.id', 'election_role_by_voter_geographic_areas.election_role_shift_id');
    }

    public function scopeWithAssignmentsBallotFullData($query) {
            $query->leftJoin('ballot_boxes', function ( $joinOn ) {
                $joinOn->on([
                    ['ballot_boxes.id', '=', 'activists_allocations.ballot_box_id'],
                ]);
            })
            ->leftJoin('clusters as ballots_areas_clusters', function ( $joinOn ) {
                $joinOn->on([
                    ['ballots_areas_clusters.id', '=', 'ballot_boxes.cluster_id'],
                    ['ballots_areas_clusters.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
                ]);
            })
            ->leftJoin('cities as ballots_areas_cities', 'ballots_areas_cities.id', 'ballots_areas_clusters.city_id')

            ->leftJoin('election_role_shifts', 'election_role_shifts.id', 'activists_allocations_assignments.election_role_shift_id');
    }

    public function scopeWithRoleBallotGeo($query, $leftJoin = true) {
            $joinMethod = $leftJoin ? 'leftJoin' : 'join';
            $query->$joinMethod('election_role_by_voter_geographic_areas as role_geo', function ( $joinOn ) {
                $joinOn->on([
                    ['role_geo.election_role_by_voter_id', '=', 'election_roles_by_voters.id'],
                    ['role_geo.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))],
                ]);
            });

    }
    public function scopeWithGeographicalAreasClustersData($query) {
        $query->leftJoin('clusters as areas_clusters', function ( $joinOn ) {
            $joinOn->on([
                ['areas_clusters.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))],
                ['areas_clusters.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
            ]);
        })
        ->leftJoin('cities as clusters_areas_cities', 'clusters_areas_cities.id', 'areas_clusters.city_id');
    }
    public function scopeWithActivistAssingedCity($query) {
        $query->leftJoin('cities as assigned_city', 'assigned_city.id', '=', 'election_roles_by_voters.assigned_city_id');
    }
    /*
    public function scopeWithCaptain50ClustersData($query) {

        $query->leftJoin('voters_with_captains_of_fifty', 'voters_with_captains_of_fifty.captain_id', 'election_roles_by_voters.voter_id')
        ->leftJoin('voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', 'voters_with_captains_of_fifty.voter_id')
        ->leftJoin('ballot_boxes as captain_voters_ballot_box', 'captain_voters_ballot_box.id', 'voters_in_election_campaigns.ballot_box_id')
        ->leftJoin('clusters as captain_voters_cluster', 'captain_voters_cluster.id', 'captain_voters_ballot_box.cluster_id')
        ->leftJoin('cities as captain_voters_city', 'captain_voters_city.id', 'captain_voters_cluster.city_id');
    */
    public function scopeWithLeaderClustersData($query) {
        $query->leftJoin('clusters as leader_cluster', function ( $joinOn ) {
            $joinOn->on([
                ['leader_cluster.leader_id', '=', 'election_roles_by_voters.voter_id'],
                ['leader_cluster.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id']
            ]);
        })
        ->leftJoin('cities as leader_city', 'leader_city.id', 'leader_cluster.city_id');
    }
    public function scopeWithActivistSentMessage($query) {
        $query->join('election_role_by_voter_messages as election_role_messages', function ( $joinOn ) {
            $joinOn->on([
                ['election_role_messages.election_role_by_voter_id', '=', 'election_roles_by_voters.ID'],
                ['election_role_messages.verified_status', '=', DB::raw(config('constants.activists.verified_status.MESSAGE_SENT'))],
            ])->orderBy('election_role_messages.created_at', 'DESC');
        });
    
    }
    public function scopeWithVoterBankDetails($query){
        $query->leftJoin('bank_details', 'bank_details.voter_id', '=', 'election_roles_by_voters.voter_id')
              ->leftJoin('bank_branches','bank_branches.id','=','bank_details.bank_branch_id')
              ->leftJoin('banks','banks.id','=','bank_branches.bank_id'); 
    }
    public function scopeWithPaymentGroup($query){
        $query->leftJoin('activist_payments', 'activist_payments.id', '=', 'election_roles_by_voters.payment_id');
        $query->leftJoin('payment_group', 'payment_group.id', '=', 'activist_payments.payment_group_id');
    }

    public function scopeWithRoleActivistPaymentsDetails($query){
        $query
              ->join('activist_roles_payments','activist_roles_payments.election_role_by_voter_id','=','election_roles_by_voters.id')
              ->leftJoin('payment_type_additional', 'payment_type_additional.id', '=', 'activist_roles_payments.payment_type_additional_id')
              ->leftJoin('activist_payments', 'activist_payments.id', '=', 'activist_roles_payments.activist_payment_id')
              ->leftJoin('reason_payment_status','reason_payment_status.id','=','activist_payments.reason_status_id')
              ->leftJoin('payment_status','payment_status.id','=','activist_payments.status_id')
              ->leftJoin('bank_branches as payment_bank_branches','payment_bank_branches.id','=','activist_payments.bank_branch_id')
              ->leftJoin('banks as payment_banks','payment_banks.id','=','payment_bank_branches.bank_id')
              //--paymentGroup
              ->leftJoin('payment_group','payment_group.id','=','activist_payments.payment_group_id')
              ->leftJoin('payment_type','payment_type.id','=','payment_group.payment_type_id')
              ->leftJoin('shas_bank_details','shas_bank_details.id','=','payment_group.shas_bank_details_id')
              ->leftJoin('bank_branches as shas_branch','shas_branch.id','=','shas_bank_details.bank_branch_id')
              ->leftJoin('banks as shas_bank','shas_bank.id','=','shas_branch.bank_id')
              ->leftJoin('users as user_lock','user_lock.id','=','activist_roles_payments.user_lock_id')
              ->leftJoin('voters as voter_user_lock','voter_user_lock.id','=','user_lock.voter_id')
              ->leftJoin('voters as details_user_create','details_user_create.id','=','activist_payments.created_by')
              ->leftJoin('voters as details_masav_user_create','details_masav_user_create.id','=','payment_group.created_by')
              //parent details
              ->leftJoin('activist_payments as parent_activist_payments', 'parent_activist_payments.id', '=', 'activist_payments.parent_payment_id')
              ->leftJoin('payment_status as parent_payment_status','parent_payment_status.id','=','parent_activist_payments.status_id')
              ->leftJoin('reason_payment_status as parent_reason_payment_status','parent_reason_payment_status.id','=','parent_activist_payments.reason_status_id')
              ->leftJoin('payment_group as parent_payment_group','parent_payment_group.id','=','parent_activist_payments.payment_group_id')
              ->leftJoin('payment_type as parent_payment_type','parent_payment_type.id','=','parent_payment_group.payment_type_id')
              //first payment details
              ->leftJoin('activist_payments as first_activist_payments', 'first_activist_payments.id', '=', 'activist_payments.first_payment_id')
              ->leftJoin('payment_status as first_payment_status','first_payment_status.id','=','first_activist_payments.status_id')
              ->leftJoin('reason_payment_status as first_reason_payment_status','first_reason_payment_status.id','=','first_activist_payments.reason_status_id')
              ->leftJoin('payment_group as first_payment_group','first_payment_group.id','=','first_activist_payments.payment_group_id')
              ->leftJoin('payment_type as first_payment_type','first_payment_type.id','=','first_payment_group.payment_type_id');

    }



    public function scopeWithStatusPayments($query,$electionCampaignId,$statusPaymentsSystemName,$nameTable){
        $query
        ->leftJoin('activist_payments as '.$nameTable,
        function($joinOn)use($electionCampaignId,$nameTable,$statusPaymentsSystemName){
            $statusPaymentsId=PaymentStatus::getBySystemName($statusPaymentsSystemName);
            $joinOn->on($nameTable.'.voter_id', '=', 'election_roles_by_voters.voter_id')
                   ->on($nameTable.'.election_campaign_id','=',DB::raw($electionCampaignId))
                   ->on($nameTable.'.status_id','=',DB::raw($statusPaymentsId));
        });
    }


    //!!to do remove this function
    public function scopeWithActivistsAllocation($query) {
        $query->join('activists_allocations', function ($joinOn) {
            $joinOn->on([
                // Not good in ballot boxes allocations:
                ['election_roles_by_voters.id', '=', 'activists_allocations.election_role_by_voter_id'],
                ['election_roles_by_voters.election_campaign_id', '=', 'activists_allocations.election_campaign_id'],
            ]);
        });
    }

    public function scopeWithActivistRolesPayments($query,$onlyBase=false,$leftJoin=false){
        $joinType=$leftJoin?'leftJoin':'join';
        $query->$joinType('activist_roles_payments', function ($joinOn) use($onlyBase){
            $joinOn->on('activist_roles_payments.election_role_by_voter_id','=','election_roles_by_voters.id');
            if($onlyBase)
            $joinOn->whereNull('activist_roles_payments.payment_type_additional_id');
        });
    }

    public function scopeWithActivistsAllocationAssignment($query,$leftJoin=false){
        $nameFunc=$leftJoin?'leftJoin':'join';
        $query->$nameFunc('activists_allocations_assignments', 'activists_allocations_assignments.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
              ->$nameFunc('activists_allocations',function($query){
                $query->on('activists_allocations.id','=','activists_allocations_assignments.activist_allocation_id');
              });  
    }

    

}
