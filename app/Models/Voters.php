<?php

namespace App\Models;

use App\Enums\CommonEnum;
use App\Models\ActivistPaymentModels\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\GeographicFilters;
use App\Models\SectorialFilters;
use App\Models\ElectionCampaigns;
use Illuminate\Support\Facades\Log;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $personal_identity
 * @property string  $first_name
 * @property string  $last_name
 * @property integer $voter_title_id
 * @property integer $voter_ending_id
 * @property string  $mi_city
 * @property integer $mi_city_id
 * @property string  $mi_neighborhood
 * @property string  $mi_street
 * @property integer $mi_street_id
 * @property string  $mi_house
 * @property string  $mi_house_entry
 * @property string  $mi_flat
 * @property string  $mi_mark
 * @property string  $mi_zip
 * @property string  $city
 * @property integer $city_id
 * @property string  $neighborhood
 * @property string  $street
 * @property integer $street_id
 * @property string  $house
 * @property string  $house_entry
 * @property string  $flat
 * @property string  $mark
 * @property string  $zip
 * @property string  $birth_date
 * @property boolean $birth_date_type
 * @property integer $origin_country_id
 * @property boolean $gender
 * @property integer $ethnic_group_id
 * @property boolean $sephardi
 * @property string  $deceased_date
 * @property boolean $can_vote
 * @property string  $father_name
 * @property string  $father_personal_identity
 * @property integer $father_id
 * @property string  $mother_name
 * @property string  $mother_personal_identity
 * @property integer $mother_id
 * @property integer $household_id
 * @property boolean $phone_from_table
 * @property boolean $actual_address_correct
 * @property boolean $contact_via_email
 * @property boolean $sms
 * @property integer $main_voter_phone_id
 * @property boolean $shas_representative
 * @property string  $created_at
 * @property string  $updated_at
 */
class Voters extends Model {

    public $primaryKey = 'id';
    protected $table = 'voters';

    /**
     * @var array
     */
    protected $fillable = ['key',
        'personal_identity',
        'first_name',
        'last_name',
        'voter_title_id',
        'voter_ending_id',
        'mi_city',
        'mi_city_id',
        'mi_neighborhood',
        'mi_street',
        'mi_street_id',
        'mi_house',
        'mi_house_entry',
        'mi_flat',
        'mi_mark',
        'mi_zip',
        'city',
        'city_id',
        'neighborhood',
        'street',
        'street_id',
        'house',
        'house_entry',
        'flat',
        'mark',
        'zip',
        'birth_date',
        'birth_date_type',
        'origin_country_id',
        'gender',
        'ethnic_group_id',
        'sephardi',
        'deceased_date',
        'can_vote',
        'father_name',
        'father_personal_identity',
        'father_id',
        'mother_name',
        'mother_personal_identity',
        'mother_id',
        'household_id',
        'phone_from_table',
        'actual_address_correct',
        'contact_via_email',
        'sms',
        'main_voter_phone_id',
        'shas_representative',
        'created_at',
        'updated_at'];
    protected $joins = array();

    public function scopeGetJoins(){
        return $this->joins;
    }
    public function scopeAddJoinIfNotExist(&$query, $joinTable, $isLeftJoin = false){
        if(!array_key_exists($joinTable , $this) && !isset($this->joins[$joinTable])){
            switch($joinTable){
                case 'ballot_boxes':
                    $query->withFilterBallotBoxes($isLeftJoin);
                break;
                case 'clusters':
                    $query->withFilterClusters($isLeftJoin);
                break;
                case 'cities':
                    $query->withFilterCities($isLeftJoin);
                break;
                case 'sub_areas':
                    $query->withFilterSubAreas();
                break;
                case 'areas':
                    $query->withFilterAreas();
                break;
                case 'areas_groups':
                    $query->withFilterAreasGroups();
                break;
                case 'neighborhoods':
                    $query->withFilterNeighborhoods();
                break;
            }

        }
    }
	public function instituteRoles() {

        return $this->hasMany('App\Models\InstituteRolesByVoters', 'voter_id', 'id');
    }
	
	public function votersInElectionCampaigns() {

        return $this->hasMany('App\Models\VoterElectionCampaigns', 'voter_id', 'id');
    }
	
    public function scopeWithPhones($query, $join = 'inner', $withWrong = false) {

        if ('left' == $join) {
            $query->leftJoin('voter_phones', function($joinOn) use ($withWrong) {
                    $joinOn->on('voters.id', '=', 'voter_phones.voter_id');
                    if (!$withWrong) $joinOn->on('voter_phones.wrong', DB::raw(0));
                    })/* = */
                    ->leftJoin('phone_types', function ( $joinOn ) {

                        $joinOn->on('voter_phones.phone_type_id', '=', 'phone_types.id')/* = */
                        ->on('phone_types.deleted', '=', DB::raw(0));
                    });
        } else {
            $query->join('voter_phones', function($joinOn) use ($withWrong) {
                    $joinOn->on('voters.id', '=', 'voter_phones.voter_id');
                    if (!$withWrong) $joinOn->on('voter_phones.wrong', DB::raw(0));
                    })/* = */
                  ->leftJoin('phone_types', 'phone_types.id', '=', 'voter_phones.phone_type_id');
        }
    }

    public function scopeWithPhone($query, $phoneNumber) {
        $query->join('voter_phones', function ( $joinOn ) use ($phoneNumber) {
            $joinOn->on('voter_phones.voter_id', '=', 'voters.id')
                    ->on('voter_phones.wrong', DB::raw(0))
                    ->on('voter_phones.phone_number', '=',  DB::raw($phoneNumber));
        });
    }

    public function crmRequests() {

        return $this->hasMany('App\Models\CrmRequest', 'voter_id', 'id');
    }

    public function documents() {

        return $this->belongsToMany('App\Models\Document', 'documents_in_entities', 'entity_id', 'document_id')/* = */
                    ->wherePivot('entity_type', '=', config('constants.ENTITY_TYPE_VOTER'));
    }

    public function actions() {

        return $this->hasMany('App\Models\Action', 'entity_id', 'id')/* = */
                    ->where('actions.entity_type', config('constants.ENTITY_TYPE_VOTER'));
    }

    /**
     *  This function gets the voter's
     *  system details from table users.
     */
    public function user() {

        return $this->hasOne('App\Models\User', 'voter_id');
    }

    /**
     *  This function returns the representative details
     */
    public function getRepresentativeDetails() {

        return $this->hasMany('App\Models\ShasRepresentative', 'voter_id', 'id')/* = */
                        ->where('shas_representatives.deleted', 0);
    }

    public function getVoterNearBy($query){
        return $this->hasMany('App\Models\voter', 'voter_id', 'id')/* = */
        ->where('shas_representatives.deleted', 0);
    }


    public function groups() {
        return $this->hasMany('App\Models\VotersInGroups', 'voter_id', 'id');
    }

    public function scopeWithHousehold($query, $lastcampaignId) {
        //check if voters in election campaigns is left join or not
        $viecIsLeft = false;
        $joins = $query->getQuery()->joins;
            if($joins == null) {
                return false;
            }
            foreach ($joins as $join) {
                if (strpos($join->table, "viec")  !== false) {
                    if ($join->type == "left") $viecIsLeft = true;
                }
            }
        $query->join('voters AS v2', 'v2.household_id', '=', 'voters.household_id');

        if (!$viecIsLeft) {
            //show only household voters in current election campaign
            $query->join('voters_in_election_campaigns AS viec2', function($query2) use($lastcampaignId) {
                $query2->on('viec2.voter_id', '=', 'v2.id')
                        ->on('viec2.election_campaign_id', '=', DB::raw($lastcampaignId));
            });
        }
        $query->leftJoin('voter_support_status AS vs0', function ( $joinOn ) use ( $lastcampaignId ) {
            $joinOn->on('vs0.voter_id', '=', 'v2.id')/* = */
                   ->on('vs0.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                   ->on('vs0.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                   ->on('vs0.deleted', DB::raw(0));
        })
        ->leftJoin('voter_support_status AS vs1', function ( $joinOn ) use ( $lastcampaignId ) {
            $joinOn->on('vs1.voter_id', '=', 'v2.id')/* = */
                   ->on('vs1.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                   ->on('vs1.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')))
                   ->on('vs1.deleted', DB::raw(0));
        });
    }

    public function scopeWithSupportStatuses($query, $lastcampaignId) {

        //vs0 SUPPORT_ELECTION
        //vs1 SUPPORT_TM
        //vs2 SUPPORT_FINAL
        $query->leftJoin('voter_support_status AS vs0', function ( $joinOn ) use ( $lastcampaignId ) {
                    $joinOn->on('vs0.voter_id', '=', 'voters.id')/* = */
                    ->on('vs0.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                    ->on('vs0.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                    ->on('vs0.deleted', '=', DB::raw(0));
                })
               
                ->leftJoin('support_status as support_status0', 'vs0.support_status_id', '=', 'support_status0.id')
                ->leftJoin('users as users0', 'vs0.create_user_id', '=', 'users0.id')
                ->leftJoin('voters as voters0', 'voters0.id', '=', 'users0.voter_id')
                ->leftJoin('voter_support_status AS vs1', function ( $joinOn ) use ( $lastcampaignId ) {
                    $joinOn->on('vs1.voter_id', '=', 'voters.id')/* = */
                    ->on('vs1.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                    ->on('vs1.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')))
                    ->on('vs1.deleted', '=', DB::raw(0));
                })
                ->leftJoin('support_status as support_status1', 'vs1.support_status_id', '=', 'support_status1.id')
                ->leftJoin('users as users1', 'vs1.create_user_id', '=', 'users1.id')
                ->leftJoin('voters as voters1', 'voters1.id', '=', 'users1.voter_id')
                ->leftJoin('voter_support_status AS vs2', function ( $joinOn ) use ( $lastcampaignId ) {
                    $joinOn->on('vs2.voter_id', '=', 'voters.id')/* = */
                    ->on('vs2.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                    ->on('vs2.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                    ->on('vs2.deleted', '=', DB::raw(0));
            })
                ->leftJoin('support_status as support_status2', 'vs2.support_status_id', '=', 'support_status2.id')
                ->leftJoin('users as users2', 'vs2.create_user_id', '=', 'users2.id')
                ->leftJoin('voters as voters2', 'voters2.id', '=', 'users2.voter_id');
    }

    public function scopeWithSupportStatus0($query, $lastcampaignId) {
        $query->leftJoin('voter_support_status AS vs0', function ( $joinOn ) use ( $lastcampaignId ) {
                    $joinOn->on('vs0.voter_id', '=', 'voters.id')/* = */
                    ->on('vs0.election_campaign_id', '=', DB::raw($lastcampaignId))/* = */
                    ->on('vs0.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')))
                    ->on('vs0.deleted', '=', DB::raw(0));
        })
        ->leftJoin('support_status', 'support_status.id', '=', 'vs0.support_status_id');
    }
	public function scopeWithPreviousSupportStatus($query, $previouscampaignId) {
        $query->leftJoin('voter_support_status AS vs1', function ( $joinOn ) use ( $previouscampaignId ) {
                    $joinOn->on('vs1.voter_id', '=', 'voters.id')/* = */
                    ->on('vs1.election_campaign_id', '=', DB::raw($previouscampaignId))/* = */
                    ->on('vs1.deleted', '=', DB::raw(0))
                    ->on('vs1.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
        })
                ->leftJoin('support_status as previos_support_status', 'previos_support_status.id', '=', 'vs1.support_status_id');
    }
	public function scopeWithOtherCampaignSupportStatusAndType($query, $othercampaignId , $supportStatusType ) {
        $query->leftJoin('voter_support_status AS vs2'.$supportStatusType, function ( $joinOn ) use ( $othercampaignId ,$supportStatusType) {
                    $joinOn->on('vs2'.$supportStatusType.'.voter_id', '=', 'voters.id')/* = */
                    ->on('vs2.deleted', '=', DB::raw(0))
                    ->on('vs2'.$supportStatusType.'.election_campaign_id', '=', DB::raw($othercampaignId))/* = */
                    ->on('vs2'.$supportStatusType.'.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
                })
                ->leftJoin('support_status as previos_support_status2'.$supportStatusType, 'previos_support_status2'.$supportStatusType.'.id', '=', 'vs2'.$supportStatusType.'.support_status_id');
    }

    public function scopeWithCountry($query) {
        if (!isset($this->joins['countries'])) {
            $query->leftJoin('countries', 'countries.id', '=', 'voters.origin_country_id');
            $this->joins['countries'] = true;
        }
    }

    public function scopeWithEthnic($query) {
        if (!isset($this->joins['ethnic_groups'])) {
            $query->leftJoin('ethnic_groups', 'ethnic_groups.id', '=', 'voters.ethnic_group_id');
        }
    }

    public function scopeWithReligiousGroup($query, $isLeftJoin = true) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        if (!isset($this->joins['religious_groups'])) {
            $query->$joinMethod('religious_groups', 'religious_groups.id', '=', 'voters.religious_group_id');
        }
    }

    public function scopeWithVotersGroups($query, $leftJoin = true) {
        if (!isset($this->joins['voters_in_groups'])) {
            if($leftJoin){
                $query->leftJoin('voters_in_groups', 'voters_in_groups.voter_id', '=', 'voters.id')
                ->leftJoin('voter_groups', 'voter_groups.id', '=', 'voters_in_groups.voter_group_id');
            }
        }
    }

    public function scopeWithTitle($query) {

        $query->leftJoin('voter_titles', 'voter_titles.id', '=', 'voters.voter_title_id');
    }

    public function scopeWithEnding($query) {

        $query->leftJoin('voter_endings', 'voter_endings.id', '=', 'voters.voter_ending_id');
    }

    public function electionRolesByVoter() {

        return $this->hasMany('App\Models\ElectionRolesByVoters', 'voter_id', 'id');
    }
	
	public function cap50Households() {

        return $this->hasMany('App\Models\VoterCaptainFifty', 'captain_id', 'id');
    }

    public function voterPhones() {
        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'id');
    }
	
	 public function voterAnswersToQuestionairs() {
        return $this->hasMany('App\Models\VoterAnswers', 'voter_id', 'id');
    } 

    public function scopeWithCity($query, $clean = false) {

        if (false == $clean) {
            $query->leftJoin('cities AS c', 'c.id', '=', 'voters.city_id');
        } else {
            $query->leftJoin('cities AS c', function ( $joinOn ) {

                $joinOn->on('c.id', '=', 'voters.city_id')
                        ->on('c.deleted', '=', DB::raw(0));
            });
        }
    }

    public function scopeWithElectionRolesByVoters($query, $leftJoin = true) {
        if($leftJoin){
            $query->leftJoin('election_roles_by_voters', 'election_roles_by_voters.voter_id', '=', 'voters.id')
            ->leftJoin('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
        }else{
            $query->join('election_roles_by_voters', 'election_roles_by_voters.voter_id', '=', 'voters.id')
            ->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
        }

    }
    
    public function scopeWithElectionRolesByVotersInCurrentCampagin($query, $currentElectionCampaignId, $election_roles_id_list = null) {
        $query->leftJoin('election_roles_by_voters',function($joinOn) use($currentElectionCampaignId, $election_roles_id_list){
          $joinOn->on('election_roles_by_voters.voter_id', '=', 'voters.id')
          ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($currentElectionCampaignId));  
          if(isset($election_roles_id_list)){
            $joinOn->whereIn('election_roles_by_voters.election_role_id', $election_roles_id_list);  
          }
        })
        ->leftJoin('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
}
	public function scopeWithInstitutesRolesByVoters($query) {
        $query->leftJoin('institute_roles_by_voters', 'institute_roles_by_voters.voter_id', '=', 'voters.id')
              ->leftJoin('institutes', 'institutes.id', '=', 'institute_roles_by_voters.institute_id')
			  ->leftJoin('cities as institute_city','institute_city.id','=','institutes.city_id');
    }

    public function scopeWithMiCity($query) {
        if (!isset($this->joins['mi_cities'])) {
            $query->leftJoin('cities AS mi_cities', 'mi_cities.id', '=', 'voters.mi_city_id');
            $this->joins['mi_cities'] = true;
        }
    }

    public function scopeWithVoterInElectionCampaigns($query) {
        $query->join('voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', '=', 'voters.id');
    }
	
	public function scopeWithVoterInElectionCampaignsFullAddressData($query , $lastcampaignId) {
          $query->leftJoin('voters_in_election_campaigns', function($joinOn) use($lastcampaignId){
			$joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
			->on('voters_in_election_campaigns.election_campaign_id' , '=' , DB::raw($lastcampaignId));
		})->join('ballot_boxes' , 'ballot_boxes.id' , '=' , 'ballot_box_id')
		->join('clusters' , function($joinOn) use($lastcampaignId){
			$joinOn->on( 'clusters.id', '=', 'ballot_boxes.cluster_id' )
			       ->on('clusters.election_campaign_id' , '=' , DB::raw($lastcampaignId));
		})
		->leftJoin('neighborhoods' , 'neighborhoods.id' , 'clusters.neighborhood_id')
		->join('cities' , 'cities.id' , 'clusters.city_id')
		->join('areas' , 'areas.id' , 'cities.area_id');
    }

    public function scopeWithCheckVoterInElectionCampaigns($query) {

        $query->leftJoin('voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', '=', 'voters.id');
    }
	
	 public function scopeWithVoterBallotAddressDetails($query , $lastcampaignId) {
        $query->leftJoin('voters_in_election_campaigns', function($joinOn) use($lastcampaignId){
			$joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
			->on('voters_in_election_campaigns.election_campaign_id' , '=' , DB::raw($lastcampaignId));
		})->leftJoin('ballot_boxes' , 'ballot_boxes.id' , '=' , 'voters_in_election_campaigns.ballot_box_id')
		->leftJoin('clusters' , 'ballot_boxes.cluster_id' , 'clusters.id')
		->leftJoin('neighborhoods' , 'neighborhoods.id' , 'clusters.neighborhood_id')
		->leftJoin('cities' , 'cities.id' , 'clusters.city_id');
     }

     //needs connect to ballot box before
    public function scopeWithCluster_leader($query,$includeBallotBox=false){
        if($includeBallotBox) $this->scopeWithBallotBoxes($query);
        
        $query->join('activists_allocations as activists_allocate', 'activists_allocate.cluster_id', '=', 'ballot_boxes.cluster_id')
              ->join('activists_allocations_assignments','activists_allocations_assignments.activist_allocation_id','=','activists_allocate.id')
              ->join('election_roles_by_voters as election_roles_cluster',function($query){
                  $query->on('election_roles_cluster.id','=','activists_allocations_assignments.election_role_by_voter_id')
                        ->whereNull('election_roles_cluster.payment_type_additional_id');
              });     
    }

    public function scopeWithElectionCampaigns($query) {

        $query->join('election_campaigns', 'election_campaigns.id', '=', 'voters_in_election_campaigns.election_campaign_id');
    }
    public function scopeWithBallotBoxes($query,$electionCampaignId=false) {
        $query->join('voters_in_election_campaigns',function($joinOn)use($electionCampaignId){
            $joinOn->on( 'voters_in_election_campaigns.voter_id', '=', 'voters.id');
            if($electionCampaignId)
            $joinOn->on( 'voters_in_election_campaigns.election_campaign_id', '=',DB::raw($electionCampaignId));
        })
              ->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id');
    }
    public function scopeWithBallots($query) {

        $query->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')/* = */
                ->join('clusters', function ( $joinOn ) {
                    $joinOn->on('clusters.id', '=', 'ballot_boxes.cluster_id')/* = */
                    ->on('clusters.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
                })/* = */
                ->join('cities', 'cities.id', '=', 'clusters.city_id');
    }
    public function scopeWithCluster($query) {

        $query->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')/* = */
              ->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id');
    }

    public function scopeWithVotes($query) {

        $query->leftJoin('votes', function ( $joinOn ) {

                    $joinOn->on('votes.voter_id', '=', 'voters.id')/* = */
                    ->on('votes.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
                })/* = */
                ->leftJoin('vote_sources', 'vote_sources.id', '=', 'votes.vote_source_id');
    }
	
	 public function votes() {

         return $this->hasMany('App\Models\Votes', 'voter_id', 'id');
     }
	 public function votersTransportations() {
        return $this->hasMany('App\Models\VoterTransportation', 'voter_driver_id', 'id');
    }
    public function scopeWithVoterTransportations($query) {

        $query->leftJoin('voter_transportations', function ( $joinOn ) {

            $joinOn->on('voter_transportations.voter_id', '=', 'voters.id')/* = */
                    ->on('voter_transportations.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id');
        });
    }

    public function scopeWithTransportation($query, $last_campaign_id, $isLeftJoin = true) {
        $roleDriver=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.driver'));
        if($isLeftJoin){
            $query->leftJoin('voter_transportations', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on('voter_transportations.voter_id', '=', 'voters.id')/* = */
                ->on('voter_transportations.election_campaign_id', '=', DB::raw($last_campaign_id));
            })->leftJoin('election_roles_by_voters as role_driver',function ( $joinOn ) use ($last_campaign_id,$roleDriver){
                $joinOn->on('role_driver.voter_id', '=', 'voter_transportations.voter_driver_id')/* = */
                ->on('role_driver.election_campaign_id', '=', DB::raw($last_campaign_id))
                ->on('role_driver.election_role_id', '=', DB::raw($roleDriver));
                //,'role_driver.voter_id','voter_transportations.'
            });
        }else{
            $query->join('voter_transportations', function ( $joinOn ) use ($last_campaign_id) {
                $joinOn->on('voter_transportations.voter_id', '=', 'voters.id')/* = */
                ->on('voter_transportations.election_campaign_id', '=', DB::raw($last_campaign_id));
            })->leftJoin('election_roles_by_voters as role_driver',function ( $joinOn ) use ($last_campaign_id,$roleDriver){
                $joinOn->on('role_driver.voter_id', '=', 'voter_transportations.voter_driver_id')/* = */
                ->on('role_driver.election_campaign_id', '=', DB::raw($last_campaign_id))
                ->on('role_driver.election_role_id', '=', DB::raw($roleDriver));
                //,'role_driver.voter_id','voter_transportations.'
            }); 
        }

    }
    public function scopeWithVoterDriver($query) {
        $query->leftJoin('voters as voter_driver','voter_transportations.voter_driver_id', '=', 'voter_driver.id');
        $query->leftJoin('election_roles_by_voters', function ( $joinOn ) {
            $joinOn->on('voter_driver.id', '=', 'election_roles_by_voters.voter_id')
                    ->on('voter_transportations.election_campaign_id', '=', 'election_roles_by_voters.election_campaign_id');
        });
        // ->leftJoin('election_roles', 'election_roles.id', '=', 'voters_in_election_campaigns.election_role_id')
        // ->where('election_roles.system_name', '=', 'driver');
    }
    public function phones() {

        return $this->hasMany('App\Models\VoterPhone', 'voter_id', 'id');
    }

    public function scopeWithBranchSupportStatus($query) {
        $query->leftJoin('voter_support_status as vss', function($joinOn) {
            $joinOn->on('voters.id', '=', 'vss.voter_id')
                    ->on('vss.deleted', '=', DB::raw(0))
                    ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
        })->leftJoin('support_status AS ss', 'vss.support_status_id', '=', 'ss.id');
    }

    public function scopeWithCrmRequestCount($query) {
        $query->leftJoin('requests', 'requests.voter_id', '=', 'voters.id');
    }

    public function supportStatus() {
        return $this->hasMany('App\Models\VoterSupportStatus', 'voter_id', 'id');
    }

	public function householdMembers() {
        return $this->hasMany('App\Models\Voters', 'household_id', 'household_id');
    }
	
	public function onlyCurrentVoter() {
        return $this->hasMany('App\Models\Voters', 'id', 'id');
    }
	
	 
	
    /**
     * Sets the geographic and sectorial filters for a voter search
     * @param int $userId - user filters
     * -> Default is the current user.
     *
     * */
    public function scopeWithFilters($query, $userId = null, $isService = false) {
        //get the user and the last knesset election campaign
        $currentUserFilters = ($userId==null);
        if (!$isService) $user = $currentUserFilters ? Auth::user() : User::where('id', $userId)->first();
        else $user = null;
        $currentCampaign = ElectionCampaigns::currentLoadedVotersCampaign();

        if (!$isService && $user && $user->admin) {
            $isViewAllVoters = $user->is_view_all_voters;
            if ($isViewAllVoters == CommonEnum::YES) {
                $query->leftjoin('voters_in_election_campaigns AS viec',
                    'viec.voter_id',
                    '=',
                    'voters.id'
                );
            } else {
                //only voter in election campaign
                $query->join('voters_in_election_campaigns AS viec', function ($query) use ($currentCampaign) {
                    $query->on('viec.voter_id', '=', 'voters.id')
                        ->on('viec.election_campaign_id', '=', DB::raw($currentCampaign->id));
                });
            }
            $this->joins['voters_in_election_campaigns'] = true;

            return $query;
        } else{
            //set base join for voters_in_election_campaign
			$query->join('voters_in_election_campaigns AS viec', function($query) use($currentCampaign) {
				$query->on('viec.voter_id', '=', 'voters.id')
						->on('viec.election_campaign_id', '=', DB::raw($currentCampaign->id));
			});

            $this->joins['voters_in_election_campaigns'] = true;

            //return query if is service
            if ($isService) return $query;
            //get the geographic filters and loop over them, adding each one to the query as needed
            $geographicFilters = $user->geographicInheritedOnlyFilters();

            //set where group array
            // dd($geographicFilters->toArray());
            $whereGroup = [];
            foreach ($geographicFilters as $geographicFilter) {
                switch ($geographicFilter->entity_type) {
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'): //Add area filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'));
                        array_push($whereGroup, ['areas_groups.id' => $geographicFilter->entity_id]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'): //Add area filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'));
                        array_push($whereGroup, ['areas.id' => $geographicFilter->entity_id]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'): //Add sub area filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'));
                        array_push($whereGroup, ['sub_areas.id' => $geographicFilter->entity_id]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'): //Add city filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'));
                        array_push($whereGroup, ['cities.id' => $geographicFilter->entity_id]);
                        break;

                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'): //Add neighborhood filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'));
                        array_push($whereGroup, ['neighborhoods.id' => $geographicFilter->entity_id]);
                        break;

                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'): //Add cluster filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'));
                        array_push($whereGroup, ['clusters.id' => $geographicFilter->entity_id]);
                        break;
                        
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'): //Add ballot box filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
                        array_push($whereGroup, ['ballot_boxes.id' => $geographicFilter->entity_id]);
                        break;
                    default:
                        break;
                }
            }

            //loop and generate where group
            $query->where(function($whereQuery) use($whereGroup) {
                 foreach($whereGroup as $where) {
                    foreach ($where as $key => $value) {
                        $whereQuery->orWhere($key, $value);
                    }
                }
            });

            return $query;
        }
    }

    public function scopeGeoEntity($query, $geoEntity)
    {
        
        switch ($geoEntity) {
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'): //Add area group filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
            $this->scopeAddJoinIfNotExist($query,'cities');
            $this->scopeAddJoinIfNotExist($query,'areas');
            $this->scopeAddJoinIfNotExist($query,'areas_groups');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'): //Add area filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
            $this->scopeAddJoinIfNotExist($query,'cities');
            $this->scopeAddJoinIfNotExist($query,'areas');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'): //Add sub area filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
            $this->scopeAddJoinIfNotExist($query,'cities');
            $this->scopeAddJoinIfNotExist($query,'sub_areas');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'): //Add city filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
            $this->scopeAddJoinIfNotExist($query,'cities');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'): //Add neighborhood filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
            $this->scopeAddJoinIfNotExist($query,'neighborhoods');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'): //Add cluster filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
            $this->scopeAddJoinIfNotExist($query,'clusters');
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'): //Add ballot box filter
            $this->scopeAddJoinIfNotExist($query,'ballot_boxes');
                break;
            default:
                break;
        }

        return $query;
    }


    //Join cities to filter query
    public function scopeWithFilterCities($query, $isLeftJoin = false) {
        if($isLeftJoin){
            $query->leftJoin('cities', 'clusters.city_id', '=', 'cities.id');
        }else{
            $query->join('cities', 'clusters.city_id', '=', 'cities.id');
        }
        $this->joins['cities'] = true;
    }

    //join areas to filter query
    public function scopeWithFilterAreasGroups($query) {
        $query->join('areas_groups', 'areas.areas_group_id', '=', 'areas_groups.id');
        $this->joins['areas_groups'] = true;
    }
    //join areas to filter query
    public function scopeWithFilterAreas($query) {
        $query->join('areas', 'cities.area_id', '=', 'areas.id');
        $this->joins['areas'] = true;
    }

    // sub areas to filter query
    public function scopeWithFilterSubAreas($query) {
        $query->join('sub_areas', 'cities.sub_area_id', '=', 'sub_areas.id');
        $this->joins['sub_areas'] = true;
    }

    //join neighborhoods to filter query
    public function scopeWithFilterNeighborhoods($query) {
        $query->leftJoin('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id');
        $this->joins['neighborhoods'] = true;
    }

    //join clusters to filter query
    public function scopeWithFilterClusters($query, $isLeftJoin = false) {
        if($isLeftJoin){
            $query->leftJoin('clusters', function($queryOn) {
                $queryOn->on('clusters.id', 'ballot_boxes.cluster_id')
                        ->on('clusters.election_campaign_id', 'viec.election_campaign_id');
            });
        }else{
            $query->join('clusters', function($queryOn) {
                $queryOn->on('clusters.id', 'ballot_boxes.cluster_id')
                        ->on('clusters.election_campaign_id', 'viec.election_campaign_id');
            });
        }

        $this->joins['clusters'] = true;
    }

    //join ballot_boxes to filter query
    public function scopeWithFilterBallotBoxes($query, $isLeftJoin = false) {
        if($isLeftJoin){
            $query->leftJoin('ballot_boxes', 'ballot_boxes.id', '=', 'viec.ballot_box_id');
        }else{
            $query->join('ballot_boxes', 'ballot_boxes.id', '=', 'viec.ballot_box_id');
        }
        $this->joins['ballot_boxes'] = true;
    }

    //join ballot_boxes. clusters and cities to query if missing for base voters search
    public function scopeWithCitiesIfMissing($query, $isLeftJoin = FALSE) {
        $this->scopeAddJoinIfNotExist($query,'ballot_boxes', $isLeftJoin);
        $this->scopeAddJoinIfNotExist($query,'clusters', $isLeftJoin);
        $this->scopeAddJoinIfNotExist($query,'cities', $isLeftJoin);
    }

    public function scopeWithUser($query) {
        $query->leftJoin('users', 'users.voter_id', '=', 'voters.id');
    }

    public function scopeWithRolesByUsers($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('roles_by_users', 'roles_by_users.user_id', '=', 'users.id');
        } else {
            $query->join('roles_by_users', 'roles_by_users.user_id', '=', 'users.id');
        }
    }

    public function scopeWithUserRules($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id');
        } else {
            $query->join('user_roles', 'user_roles.id', '=', 'roles_by_users.user_role_id');
        }
    }

    public function scopeWithUsersMainRole($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('roles_by_users', function($join) {
                $join->on('roles_by_users.user_id', '=', 'users.id')
                        ->on('roles_by_users.main', '=', DB::raw(1));
            });
        } else {
            $query->join('roles_by_users', function($join) {
                $join->on('roles_by_users.user_id', '=', 'users.id')
                        ->on('roles_by_users.main', '=', DB::raw(1));
            });
        }
    }

    public function scopeWithStreet($query, $leftJoin = FALSE) {
        if ($leftJoin) {
            $query->leftJoin('streets', 'streets.id', '=', 'voters.street_id');
        } else {
            $query->join('streets', 'streets.id', '=', 'voters.street_id');
        }
    }

    public function scopeWithMiStreet($query, $leftJoin = FALSE) {
        $this->joins['mi_streets'] = true;
        if ($leftJoin) {
            $query->leftJoin('streets as mi_streets', 'mi_streets.id', '=', 'voters.mi_street_id');
        } else {
            $query->join('streets as mi_streets', 'mi_streets.id', '=', 'voters.mi_street_id');
        }
    }

    public function scopeWithActualStreet($query, $leftJoin = FALSE) {
        $this->joins['actual_streets'] = true;
        if ($leftJoin) {
            $query->leftJoin('streets as actual_streets', 'actual_streets.id', '=', 'voters.street_id');
        } else {
            $query->join('streets as actual_streets', 'actual_streets.id', '=', 'voters.street_id');
        }
    }

    //Captain50 and address ballot voter
    public function scopeWithCaptain50($query, $last_campaign_id) {
        $query->leftJoin('voters_with_captains_of_fifty', function($join) use ($last_campaign_id) {
            $join->on('voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
                ->on('voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($last_campaign_id))
                ->on('voters_with_captains_of_fifty.deleted', '=', DB::raw(0));
        })
            ->leftJoin('voters_in_election_campaigns', function($join) use ($last_campaign_id) {
                $join->on('voters_in_election_campaigns.voter_id', '=', 'voters.id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id));
            })
            ->leftJoin('ballot_boxes as captain_ballot_boxes', 'captain_ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
            ->leftJoin('clusters as captain_clusters', function($join) use ($last_campaign_id) {
                $join->on('captain_clusters.id', '=', 'captain_ballot_boxes.cluster_id')
                    ->on('captain_clusters.election_campaign_id', '=', DB::raw($last_campaign_id));
            })
            ->leftJoin('neighborhoods as captain_neighborhoods' , 'captain_neighborhoods.id' , 'captain_clusters.neighborhood_id')
            ->leftJoin('cities as captain_cities', 'captain_cities.id', '=', 'captain_clusters.city_id');
    }

    public function scopeWithCaptain50Only($query, $currentCampaignId, $leftJoin = false) {
        $joinOnArray = [ ['voters_with_captains_of_fifty.voter_id', '=', 'voters.id'],
        ['voters_with_captains_of_fifty.election_campaign_id', '=', DB::raw($currentCampaignId)],
        ['voters_with_captains_of_fifty.deleted', '=', DB::raw(0)]
    ];
    if($leftJoin){
        $query->leftJoin('voters_with_captains_of_fifty', function($join) use ($currentCampaignId, $joinOnArray) {
            $join->on($joinOnArray);
        });
    }else{
        $query->join('voters_with_captains_of_fifty', function($join) use ($currentCampaignId, $joinOnArray) {
            $join->on($joinOnArray);
        }); 
    }
    }

    // !!לשאול האם צריך לעשות עוד ON ל JOIN
    public function scopeWithCaptainVoterDetails($query, $captainRequired = false, $withExtraDetails=  false) {
        if(!$captainRequired){
            $query->leftJoin('voters as captain_voters', 'captain_voters.id', '=', 'voters_with_captains_of_fifty.captain_id');
        }else{
            $query->join('voters as captain_voters', 'captain_voters.id', '=', 'voters_with_captains_of_fifty.captain_id');
        }
        if($withExtraDetails){
            $query->leftJoin('election_roles_by_voters as captain_election_role', function($join) {
                $join->on('captain_voters.id', '=', 'captain_election_role.voter_id');
            }); 
        }
    }

    public function scopeWithCaptainOnly($query, $currentCampaignId , $leftJoin = false) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('voters_with_captains_of_fifty as voters_with_captain', function($join) use ($currentCampaignId) {
            $join->on('voters_with_captain.voter_id', '=', 'voters.id')
                 ->on('voters_with_captain.election_campaign_id', '=', DB::raw($currentCampaignId))
                 ->on('voters_with_captain.deleted', '=', DB::raw(0));
        })

        ->$joinMethod('voters as captain_voters', 'captain_voters.id', '=', 'voters_with_captain.captain_id')
        ->leftJoin('cities as captain_city', 'captain_city.id', '=', 'captain_voters.city_id');
    }

    public function scopeWithSupportStatusUpdatePotential($query, $last_campaign_id) {
        $query->leftJoin('voter_support_status as vs_potential', function($join) use ($last_campaign_id) {
            $join->on('vs_potential.voter_id', '=', 'voters.id')
                ->on('vs_potential.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                ->on('vs_potential.election_campaign_id', '!=', DB::raw($last_campaign_id))
                ->on('vs_potential.deleted', '=', DB::raw(0));
            });
    }

    public function scopeWithSupportStatusUpdateUnSupportive($query, $last_campaign_id) {
        $query->leftJoin('voter_support_status as vs_unsupport', function($join) use ($last_campaign_id) {
            $join->on('vs_unsupport.voter_id', '=', 'voters.id')
                ->on('vs_unsupport.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                ->on('vs_unsupport.election_campaign_id', '!=', DB::raw($last_campaign_id))
                ->on('vs_unsupport.deleted', '=', DB::raw(0));
            });
    }      
    public function scopeWithTmSupportStatus($query, $electionCampaignId, $leftJoin = false) {
        if ($leftJoin) {
            $query->leftJoin('voter_support_status AS vss', function ( $joinOn ) use ( $electionCampaignId ) {
                    $joinOn->on('vss.voter_id', '=', 'voters.id')/* = */
                           ->on('vss.election_campaign_id', '=', DB::raw($electionCampaignId))/* = */
                           ->on('vss.deleted', '=', DB::raw(0))
                           ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')));
            });
        } else {
            $query->join('voter_support_status AS vss', function ( $joinOn ) use ( $electionCampaignId ) {
                    $joinOn->on('vss.voter_id', '=', 'voters.id')/* = */
                           ->on('vss.election_campaign_id', '=', DB::raw($electionCampaignId))/* = */
                           ->on('vss.deleted', '=', DB::raw(0))
                           ->on('vss.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')));     
            });      
        }
    }
        public function scopeWithFinalSupportStatus($query, $electionCampaignId, $leftJoin = false) {
            
        if ($leftJoin) {
            $query->leftJoin('voter_support_status AS vssFinal', function ( $joinOn ) use ( $electionCampaignId ) {
                $joinOn->on('vssFinal.voter_id', '=', 'voters.id')/* = */
                ->on('vssFinal.election_campaign_id', '=', DB::raw($electionCampaignId))/* = */
                ->on('vssFinal.deleted', '=', DB::raw(0))/* = */
                ->on('vssFinal.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                ;
            })->leftJoin('support_status as support_status_Last_Final', 'vssFinal.support_status_id', '=', 'support_status_Last_Final.id');
        } else {
            $query->join('voter_support_status AS vssFinal', function ( $joinOn ) use ( $electionCampaignId ) {
                $joinOn->on('vssFinal.voter_id', '=', 'voters.id')/* = */
                ->on('vssFinal.election_campaign_id', '=', DB::raw($electionCampaignId))/* = */
                ->on('vssFinal.deleted', '=', DB::raw(0))/* = */
                ->on('vssFinal.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')));
            })->join('support_status as support_status_Last_Final', 'vssFinal.support_status_id', '=', 'support_status_Last_Final.id');
        }
    }

    public function scopeWithElectionVotes($query, $electionCampaignId, $leftJoin = false,$voteSourceId=false) {
        if ($leftJoin) {
            $query->leftJoin('votes', function ( $joinOn ) use ( $electionCampaignId,$voteSourceId) {
                    $joinOn->on('votes.voter_id', '=', 'voters.id')/* = */
                           ->on('votes.election_campaign_id', '=', DB::raw($electionCampaignId));

                           if($voteSourceId)
                           $joinOn->on('votes.vote_source_id', '=',  DB::raw($voteSourceId));
            });
        } else {
            $query->join('votes', function ( $joinOn ) use ( $electionCampaignId ,$voteSourceId) {
                    $joinOn->on('votes.voter_id', '=', 'voters.id')/* = */
                           ->on('votes.election_campaign_id', '=', DB::raw($electionCampaignId));

                    if($voteSourceId)
                      $joinOn->on('votes.vote_source_id', '=', DB::raw($voteSourceId));
            });
        }
    }

    public function scopeWithElectionTransportation($query, $electionCampaignId, $leftJoin = false) {
        if ($leftJoin) {
            $query->leftJoin('voter_transportations', function ( $joinOn ) use ( $electionCampaignId ) {
                $joinOn->on('voter_transportations.voter_id', '=', 'voters.id')/* = */
                       ->on('voter_transportations.election_campaign_id', '=', DB::raw($electionCampaignId));
            });
        } else {
            $query->join('voter_transportations', function ( $joinOn ) use ( $electionCampaignId ) {
                $joinOn->on('voter_transportations.voter_id', '=', 'voters.id')/* = */
                       ->on('voter_transportations.election_campaign_id', '=', DB::raw($electionCampaignId));
            });
        }
    }
    public function calls() {
        return $this->hasMany('\App\Models\Tm\Call', 'voter_id', 'id');
    }

    public function scopeWithBankDetails($query){
        $query->leftJoin('bank_details', 'bank_details.voter_id', '=', 'voters.id')
        ->leftJoin('bank_branches', 'bank_branches.id', '=','bank_details.bank_branch_id');
    }




    ///---------------------------------------------------------------




	public static  function orderPhoneQuery($voterTable='voters',$include_main_phone=true){
        $main_phone="";
        
        if($include_main_phone)
        $main_phone="WHEN voter_phones.id = $voterTable.main_voter_phone_id THEN 1";
		$orderByPhoneQuery = "CASE ".$main_phone." WHEN voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ASC ,wrong,voter_phones.updated_at DESC, voter_phones.id";
		 return $orderByPhoneQuery;
    }
    

    //----geo
    //function get name field for where condition by geo entity  
    public static function getNameConditionForWhereInByGeo($GeographicalEntity){

     $nameConditionByGeo='';
            switch ($GeographicalEntity) {
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                    $nameConditionByGeo='areas_groups.id';
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'): 
                    $nameConditionByGeo='areas.id';
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                    $nameConditionByGeo='sub_areas.id';
                    break;
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                    $nameConditionByGeo='cities.id';
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'):
                    $nameConditionByGeo='neighborhoods.id';
                    break;

                case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'): 
                    $nameConditionByGeo='clusters.id';
                    break;
                    
                case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'): 
                    $nameConditionByGeo='ballot_boxes.id';
                    break;
                default:
                    break;
            }

            return $nameConditionByGeo;
    }

    
    public function scopeWithConditionVoterCluster($query,$electionCampaignId){
        $unSupportTypeArr=SupportStatus::getUnSupportStatusByElection($electionCampaignId);
        $query
        ->where(function($q){
            $q->whereNull('voters.sephardi')->orWhere('voters.sephardi','<>',DB::raw(0));
        })
        ->where(function ($q) use ($unSupportTypeArr){
            $q->where(function($q)use($unSupportTypeArr){
                $q->whereNotIn('support_status0.id', $unSupportTypeArr)->whereNotNull('support_status0.id');
            })
            ->orWhere(function($q)use($unSupportTypeArr){
                $q->whereNull('support_status0.id')
                ->where(function($q)use($unSupportTypeArr){
                    $q->whereNull('support_status1.id')
                    ->orWhereNotIn('support_status1.id', $unSupportTypeArr);
                });
                
            });
        
        });
          
    }

}
