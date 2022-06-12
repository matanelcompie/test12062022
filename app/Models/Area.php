<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $mi_id
 * @property integer $old_id
 * @property string  $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class Area extends Model {

    public $primaryKey = 'id';

    protected $table = 'areas';
    
    public function subArea() {
        return $this->hasMany('App\Models\SubArea');
    }
    public function cities() {
        return $this->hasMany( 'App\Models\City' ,  'area_id' , 'id');
    }
	public function scopeWithShasVotes($query) {
        $query->join('cities','cities.area_id','=','areas.id')
            ->join('clusters', 'clusters.city_id', '=', 'cities.id')
            ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        $query->join('election_campaign_party_list_votes', function ( $joinOn ) {
            $joinOn->on('election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id');
        })
        ->join('election_campaign_party_lists', function ( $joinOn ) {
            $joinOn->on([
                ['election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id'],
                ['election_campaign_party_lists.election_campaign_id', '=', 'clusters.election_campaign_id'],
                ['election_campaign_party_lists.shas', '=',  DB::raw(1)],
                ['election_campaign_party_lists.deleted', '=', DB::raw(0)]
            ]);
        });
    }
    public function scopeWithShasCityVotes($query) {
        $query->join('cities','cities.area_id','=','areas.id')
            ->join('election_campaign_party_list_votes', function ( $joinOn ) {
                $joinOn->on('election_campaign_party_list_votes.city_id', '=', 'cities.id');
            })
            ->join('election_campaign_party_lists', function ( $joinOn ) {
                $joinOn->on([
                    ['election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id'],
                    // ['election_campaign_party_lists.election_campaign_id', '=', 'clusters.election_campaign_id'],
                    ['election_campaign_party_lists.shas', '=',  DB::raw(1)],
                    ['election_campaign_party_lists.deleted', '=', DB::raw(0)]
                ]);
            });
    }
    public function scopeWithCurrentElectionVotes($query) {
        $query->join('cities','cities.area_id','=','areas.id')
            ->leftJoin('clusters', 'clusters.city_id', '=', 'cities.id')
            ->leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        $query->leftJoin('voters_in_election_campaigns as voters_in_election_campaigns_current' , function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns_current.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns_current.election_campaign_id', '=', 'clusters.election_campaign_id']
            ]);
        })
        ->leftJoin('votes', function ( $joinOn ) {
            $joinOn->on([
                ['votes.voter_id', '=', 'voters_in_election_campaigns_current.voter_id'],
                ['votes.election_campaign_id', '=', 'voters_in_election_campaigns_current.election_campaign_id']
            ]);
        });
    }
    public function scopeWithSupportStatus($query) {
        $query->join('cities', 'cities.area_id', '=', 'areas.id')
            ->join('clusters', 'clusters.city_id', '=', 'cities.id')
            ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        $query->join('voters_in_election_campaigns' , function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
            ]);
        });
        $query->leftJoin('voter_support_status', function ( $joinOn ) {
            $joinOn->on([
                ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))],
                ['voter_support_status.deleted', '=', DB::raw(0)]
            ]);
        });
    }
    public function areasListForSectorialFilter() {
    	 $query = $this->newQuery();
    	 return $query->select("id" , "key", "name")->orderBy("name", "DESC")->get();
    }
    public function scopeWithCities($query, $isLeftJoin = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('cities', 'cities.area_id', '=', 'areas.id');
    }

    public function scopeWithClusters($query, $isLeftJoin = false, $hot = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $tableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
        $query->$joinMethod( $tableName , 'cities.id', '=', 'clusters.city_id');
    }
    public function scopeWithBallotBoxes($query, $isLeftJoin = false, $hot = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $tableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";
        $query->$joinMethod($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
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

}
