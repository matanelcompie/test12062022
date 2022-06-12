<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ElectionRolesGeographical;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $mi_id
 * @property integer $area_id
 * @property integer $sub_area_id
 * @property integer $old_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class BallotBoxHotCounter extends Model {

    public $primaryKey = 'id';
    protected $table = 'ballot_boxes_hot_counters';

    /**
     * Add alias to table name
     * 
     * @param string tableName
     * @return this;
     */
    public function as($tableName) {
        $this->table .= " as ".$tableName;
        return $this;
    }

    public function scopeWithVoterElectionCampaignVotersSupportStatuses($query , $electionCampaignId , $entityTypeID) {
        $query->join('voters_in_election_campaigns', 'voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id')
              ->join('voter_support_status', 'voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
              ->where('voter_support_status.entity_type',$entityTypeID)
              ->where('voter_support_status.election_campaign_id',$electionCampaignId)
              ->where('voters_in_election_campaigns.election_campaign_id',$electionCampaignId)
        ;
    }

    public function scopeWithCluster($query, $hot = false) {
        $tableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
        $query->join($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
    }
    public function scopeWithLastCluster($query, $last_campaign_id) {
        $query->leftJoin('clusters as current_cluster', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['current_cluster.mi_id', '=', 'clusters.mi_id'],
                ['current_cluster.city_id', '=', 'clusters.city_id'],
                ['current_cluster.election_campaign_id', '=', DB::raw($last_campaign_id)]]);
        });
    }

    public function scopeWithCity($query) {
        $query->join('cities', 'cities.id', '=', 'clusters.city_id');
    }

    public function scopeWithArea($query) {
        $query->join('areas', 'areas.id', '=', 'cities.area_id');
    }
    
    public function scopeFindByCity($query) {
        $query->join('clusters', 'ballot_boxes.cluster_id', '=', 'clusters.id');
    }
	
	public function scopeWithVoterElectionCampaign($query) {
        return $query->join('voters_in_election_campaigns', 'voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id');
    }

    public function votersInElectionCampaigns() {
        return $this->hasMany('App\Models\VotersInElectionCampaigns', 'ballot_box_id', 'id');
    }

    public function activists() {
        return $this->hasMany('App\Models\ElectionRolesGeographical', 'entity_id', 'id')
                    ->where('election_role_by_voter_geographic_areas.entity_type', '=', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
    }
    public function activistsAllocations() {
        return $this->hasMany('App\Models\ActivistsAllocations', 'ballot_box_id', 'id');
    }

    public function electionRolesGeographical() {
        return $this->hasMany('App\Models\ElectionRolesGeographical', 'entity_id', 'id')
                    ->where('election_role_by_voter_geographic_areas.entity_type', '=', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
    }

    public function scopeWithElectionRolesGeographical($query) {
        $query->leftJoin('election_role_by_voter_geographic_areas', function($joinOn){
            $joinOn->on('election_role_by_voter_geographic_areas.entity_id', '=', 'ballot_boxes.id');
        });
    }
    public function scopeWithElectionRolesBallotGeographical($query, $leftJoin = true) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('election_role_by_voter_geographic_areas', function ( $joinOn ) {
            $joinOn->on([
                ['election_role_by_voter_geographic_areas.entity_id', '=', 'ballot_boxes.id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
            ]);
        });
    }
    public function scopeWithElectionRolesByVoters($query) {
        $query->leftJoin('election_roles_by_voters', 'election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
        ->leftJoin('election_roles','election_roles.id', '=', 'election_roles_by_voters.election_role_id');
    }

    public function scopeWithBallotBoxRoles($query ,$leftJoin=true) {
        $nameFun=$leftJoin?'leftJoin':'join';
            $query->$nameFun('activists_allocations', 'activists_allocations.ballot_box_id', '=', 'ballot_boxes.id');
			$query->$nameFun('ballot_box_roles', 'ballot_box_roles.id', '=', 'activists_allocations.ballot_box_role_id');
		
	}
	
    public function scopeWithCurrentActivistShift($query, $last_campaign_id) {
        $query->join('election_role_by_voter_geographic_areas', function ( $joinOn ) {
            $joinOn->on([
                ['election_role_by_voter_geographic_areas.entity_id', '=', 'ballot_boxes.id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
            ]);
        })
        ->join('election_roles_by_voters', function ( $joinOn ) use ( $last_campaign_id) {
            $joinOn->on([
                ['election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id'],
                ['election_roles_by_voters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->join('election_role_shifts', 'election_role_shifts.id', '=', 'election_role_by_voter_geographic_areas.election_role_shift_id');
    }

    public function scopeWithSupportStatusChange($query) {
        $query->join('voters_in_election_campaigns', function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
            ]);
        })
        ->join('voter_support_status', function ( $joinOn ) {
            $joinOn->on([
                ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id']
            ]);
        })
        ->join('action_history', function ( $joinOn ) {
            $referencedModel = 'VoterSupportStatus';

            $joinOn->on([
                ['action_history.referenced_id', '=', 'voter_support_status.id'],
                ['action_history.referenced_model', '=',  DB::raw('"'. $referencedModel . '"')]
            ]);
        })
        ->join('action_history_details', function ( $joinOn ) {
            $fieldName = 'support_status_id';

            $joinOn->on([
                ['action_history_details.action_history_id', '=', 'action_history.id'],
                ['action_history_details.field_name', '=',  DB::raw('"'. $fieldName . '"')]
            ]);
        });
    }

    public function electionCampaignPartyListVotes() {
        return $this->hasMany('App\Models\ElectionCampaignPartyListVotes', 'ballot_box_id', 'id');
    }

    public function scopeWithVoterVotesCurrentCampaign($query, $last_campaign_id) {
        $query->leftJoin('voters_in_election_campaigns as voters_in_election_campaigns_current' , function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_in_election_campaigns_current.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns_current.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->leftJoin('votes', function ( $joinOn ) {
            $joinOn->on([
                ['votes.voter_id', '=', 'voters_in_election_campaigns_current.voter_id'],
                ['votes.election_campaign_id', '=', 'voters_in_election_campaigns_current.election_campaign_id']
            ]);
        });
    }

    /**
     * This function gets the supports statuses
     * of type final of ballots.
     *
     * @param $query
     */
    public function scopeWithVoterSupportStatus($query, $leftJoin = true) {
        if ( $leftJoin ) {
            $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) {
                $joinOn->on([
                    ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                    ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            });
        } else {
            $query->join('voters_in_election_campaigns', function ( $joinOn ) {
                $joinOn->on([
                    ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                    ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            });
        }

        $query->leftJoin('voter_support_status', function ( $joinOn ) {
            $joinOn->on([
                ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                ['voter_support_status.deleted', DB::raw(0)]
            ]);
        });
    }

    public function scopeWithShasVotes($query, $electionCampaignId = null, $isLeftJoin = false ) {
        $query->join('election_campaign_party_list_votes', 'election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id')
        ->join('election_campaign_party_lists', 'election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id');
    }
    public function scopeWithOnlyShasVotes($query, $electionCampaignId = null, $isLeftJoin = false ) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('election_campaign_party_list_votes', 'election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id')
            ->$joinMethod('election_campaign_party_lists', function ( $joinOn ) use($electionCampaignId) {
                $joinOn->on([
                    ['election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id'],
                    ['election_campaign_party_lists.shas', '=', DB::raw(1)],
                    ['election_campaign_party_lists.election_campaign_id', '=', DB::raw($electionCampaignId)],
                ]);
            });
    }

    public function scopeWithVoters($query) {
        $query->join('election_campaign_party_list_votes', 'election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id')
            ->join('election_campaign_party_lists', function ( $joinOn ) {
                $joinOn->on([
                    ['election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id'],
                    ['election_campaign_party_lists.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            });
    }

    public function scopeWithAreaCityNeighborhoodCluster($query){
      $query->join('clusters', 'ballot_boxes.cluster_id', '=', 'clusters.id')
              ->LeftJoin('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id')
              ->join('cities', 'cities.id', '=', 'clusters.city_id')
              ->join('areas', 'areas.id', '=', 'cities.area_id');
    }

    public function votersElectionCampaigns() {
        return $this->hasMany('App\Models\VoterElectionCampaigns', 'ballot_box_id', 'id');
    }
    public function ballotBoxVoters() {
        return $this->hasMany('App\Models\VoterElectionCampaigns', 'ballot_box_id', 'id');
    }

    public function scopeWithMunicipalElectionParties($query, $last_campaign_id) {
        $query->leftJoin('municipal_election_parties', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['municipal_election_parties.city_id', '=', 'cities.id'],
                ['municipal_election_parties.election_campaign_id', '=', DB::raw($last_campaign_id)],
                ['municipal_election_parties.shas', '=', DB::raw(1)],
                ['municipal_election_parties.deleted', '=', DB::raw(0)]
            ]);
        });
    }
    public function scopeWithActivistsAllocations($query, $leftJoin = true) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('activists_allocations', function ( $joinOn ) {
            $joinOn->on([['activists_allocations.ballot_box_id', '=', 'ballot_boxes.id']]);
        });
    }

    //---------------------------
    //get mi ballot box after sum logic
    //if is one digit return digit else rturn 
    //
    public static function getLogicMiBallotBox($mi_ballot_box){
       return (strlen($mi_ballot_box) == 1)? $mi_ballot_box : substr_replace($mi_ballot_box, ".", strlen($mi_ballot_box)-1, 0);
    }


    //return ballot box number with logic for mi id in data base
    public static function resetLogicMiBallotBox($ballot_box_number){
        if(strlen($ballot_box_number) == 1)
        return $ballot_box_number;
        else
        return $ballot_box_number*10;
    }

    //function get arr cluster in the same city and number mi ballot box the function return id of ballotBox
    public static function getBallotBoxIdByMi_id_ClusterId($miId,$arr_cluster_id,$allProp=false){
        $ballotBox=BallotBox::select()->where('mi_id',$miId)->whereIn('cluster_id',$arr_cluster_id)->get();
        if(!$ballotBox)
        return false;
        else if(count($ballotBox)>1)
        throw new Exception(config('errors.elections.SAME_NUMBER_BALLOT_BOX_IN_ARR_CLUSTER'));

        else
        return $allProp?$ballotBox[0]:$ballotBox[0]->id;
    }

    //function return ballotBox id by mi id and activist that connect to ballot
    //the activist can not connect for toe ballot box with the same number
    public static function getBallotBoxIdByMiId_Activist_voter_id($miId,$voter_activist_id,$electionCampaignId){
                //---check if user connect to ballot box
        //get list ballot box that user connected
      
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ballotMember'));

       $ballotBox= ActivistsAllocations::select(DB::raw('distinct ballot_boxes.*'))
       ->withBallotBox(false)
       ->withElectionRoleCampaign($electionCampaignId)
       ->where('mi_id',$miId)
       ->where('election_roles_by_voters.voter_id','=',DB::raw($voter_activist_id))->get();

       if(!$ballotBox || $ballotBox->count()==0)
       return false;

       if($ballotBox->count()>1)
       throw new Exception(config('errors.elections.ACTIVIST_CONNECT_SAME_BALLOT_BOX_NUMBER'));
      // Log::info(self::getLogicMiBallotBox(50));
       return  $ballotBox[0];
      
    }

}
