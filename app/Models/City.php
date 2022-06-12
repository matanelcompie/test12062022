<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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
class City extends Model {

    public $primaryKey = 'id';
    protected $table = 'cities';
    protected static $ModelList=null;
    protected static $HashModelList=null;

    /**
     * @var array
     */
    protected $fillable = ['key',
        'name',
        'mi_id',
        'area_id',
		'team_id',
        'sub_area_id',
        'old_id',
        'created_at',
        'updated_at'];
  
    public function scopeWithClusters($query, $isLeftJoin=false, $hot = false) {
        $tableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
        if($isLeftJoin){
            $query->leftJoin($tableName, 'cities.id', '=', 'clusters.city_id');
        }else{
            $query->join($tableName, 'cities.id', '=', 'clusters.city_id');
        }
    }

    public function scopeWithBallotBoxes($query, $isLeftJoin=false, $hot = false) {
        $tableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";
        if($isLeftJoin){
            $query->leftJoin($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }else{
            $query->join($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }
    }
	
	 public function scopeWithTeam($query) {
            $query->leftJoin('teams',  function ( $joinOn ) {
				 $joinOn->on('cities.team_id', '=', 'teams.id')->where('cities.deleted' , 0);
			})->leftJoin('users','users.id' , '=' , 'teams.leader_id')
			->leftJoin('user_phones','user_phones.user_id' , '=' , 'users.id')
			  ->leftJoin('voters' , 'voters.id' , '=' , 'users.voter_id');
    }
	 public function scopeWithRequestsTeam($query) {
            $query->leftJoin('teams as crm_team', 'crm_team.id', '=', 'cities.crm_team_id');
    }

    public function clusters() {
        return $this->hasMany('App\Models\Cluster', 'city_id', 'id');
    }

    public function neighborhoods() {

        return $this->hasMany('App\Models\Neighborhood', 'city_id', 'id');
    }

    public function scopeWithAreas($query) {

        $query->join('areas', 'areas.id', '=', 'cities.area_id');
    }
    public function scopeWithVoter($query) {

        $query->join('voters', 'cities.mi_id', '=', 'voters.city_id');
    }

    public function scopeWithTempVoter($query) {

        $query->join('unknown_voters', 'cities.mi_id', '=', 'unknown_voters.city_id');
    }

    /**
     * scope with areas and sub_areas, in two ways:
     * *- cities->areas (using cities.area_id), cities->sub_areas (using cities.sub_area_id) **leftJoin: (cities.area_id is not NULL)
     * *- cities->sub_areas (using cities.sub_area_id), sub_areas->areas (using sub_areas.area_id) **leftJoin: (ONLY where cities.area_id is NULL)
     * scope will addSelect the id, key, name of area and sub_area to the query
     */
    public function scopeWithAreaAndSubArea($query) {
        $query->leftJoin('areas', function ( $joinOn ) {
                    $joinOn->on([['cities.area_id', '=', 'areas.id'], ['cities.deleted', '=', DB::raw(0)]]);
                })->leftJoin('sub_areas', function ( $joinOn ) {
                    $joinOn->on([['cities.sub_area_id', '=', 'sub_areas.id'], ['cities.deleted', '=', DB::raw(0)]]);
                })
                ->leftJoin('sub_areas AS sub_area2', function ( $joinOn ) {
                    $joinOn->on([['cities.sub_area_id', '=', 'sub_area2.id'], ['cities.deleted', '=', DB::raw(0)]])
                    ->whereNull('cities.area_id');
                })
                ->leftJoin('areas AS area2', function ( $joinOn ) {
                    $joinOn->on([['sub_area2.area_id', '=', 'area2.id'], ['cities.deleted', '=', DB::raw(0)]])
                    ->whereNull('cities.area_id');
                })
                ->addSelect(
                        DB::raw('IF(cities.area_id IS NOT NULL,areas.id,area2.id) AS area_id')
                        , DB::raw('IF(cities.area_id IS NOT NULL,areas.key,area2.key) AS area_key')
                        , DB::raw('IF(cities.area_id IS NOT NULL,areas.name,area2.name) AS area_name')
                        , DB::raw('IF(cities.sub_area_id IS NOT NULL,sub_areas.id,sub_area2.id) AS sub_area_id')
                        , DB::raw('IF(cities.sub_area_id IS NOT NULL,sub_areas.key,sub_area2.key) AS sub_area_key')
                        , DB::raw('IF(cities.sub_area_id IS NOT NULL,sub_areas.name,sub_area2.name) AS sub_area_name'));
    }

    public function citiesListForSectorialFilter($area_id) {
        $query = $this->newQuery();
        return $query->select("id", "key", "name")->where('area_id', '=', $area_id)->orderBy("name", "DESC")->get();
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

    public function scopeWithShasVotes($query) {
        $query->join('clusters', 'clusters.city_id', '=', 'cities.id')
            ->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
            ->join('election_campaign_party_list_votes', function ( $joinOn ) {
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
        $query->join('election_campaign_party_list_votes', function ( $joinOn ) {
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

    public function scopeWithSupportStatus($query) {
        $query->leftJoin('clusters', 'clusters.city_id', '=', 'cities.id')
            ->leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        $query->leftJoin('voters_in_election_campaigns' , function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
            ]);
        });
        $query->leftJoin('voter_support_status', function ( $joinOn ) {
            $joinOn->on([
                ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))]
            ]);
        });
    }

    public function scopeWithCurrentElectionVotes($query) {
        $query->leftJoin('clusters', 'clusters.city_id', '=', 'cities.id')
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

    public static function getHashList(){
        
        if(is_null(self::$HashModelList))
        {
            $cities=self::getList();
            $hash=array();
            foreach ($cities as $key => $city) {
                $hash[$city->id]=$city;
            }
            self::$HashModelList= $hash;
        }
      //  Log::info(json_encode(self::$HashModelList));
        return self::$HashModelList;

    }

    public static function getList(){
        if(is_null(self::$ModelList))
        self::$ModelList=City::select()->get();

        return self::$ModelList;
    }
    // Check if city exists in global Headquarter Area
    public static function checkIfCityInGlobalHeadquarterArea($cityId){
        $city = City::select('area_id')->where('id', $cityId)->first();
        $areaId = $city ? $city->area_id : null;
        return in_array($areaId, config('constants.globalHeadquartersAreas'));
    }
}
