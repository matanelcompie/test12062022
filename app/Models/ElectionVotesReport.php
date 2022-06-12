<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ElectionVotesReport extends Model {
    public $primaryKey = 'id';
    protected $table = 'election_votes_report';
    public static $lengthKey=5;

    public function scopeWithElectionVotesReportParty($query,$leftJoin=false){
        $join=$leftJoin?'leftJoin':'join';
        $query->$join('election_votes_report_party','election_votes_report_party.election_votes_report_id','=','election_votes_report.id');
    }

    public function scopeWithElectionVotesReportSource($query){
        $query->join('election_votes_report_source','election_votes_report_source.id','=','election_votes_report.vote_report_source_id');
    }

    public function scopeWithCity($query,$leftJoin=false){
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('cities', 'cities.id', '=', 'election_votes_report.city_id');
    }

    public function scopeWithBallotBox($query,$leftJoin=false){
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('ballot_boxes', 'ballot_boxes.id', '=', 'election_votes_report.ballot_box_id');
    }

    public function scopeWithCluster($query,$leftJoin=false){
        $joinFunc=$leftJoin?'leftJoin':'join';
        $query->$joinFunc('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id');
    }

    public function reportParty() {
        return $this->hasMany('App\Models\ElectionVotesReportParty', 'election_votes_report_id', 'id');
    }

    public static function getConditionByGeoEntity($entityType){
        $Condition=null;
        switch ($entityType) {
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                $Condition='cities.area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                $Condition='cities.sub_area_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                $Condition='cities.id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $Condition='ballot_boxes.cluster_id';
                break;

            case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
              
                $Condition='ballot_boxes.id';
                break;
        }
        
        return $Condition;
    }

    
}