<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

//
class ElectionVotesReportParty extends Model {
    public $primaryKey = 'id';
    protected $table = 'election_votes_report_party';
    public static $lengthKey=5;



    public function scopeWithElectionReportVotesSource($query,$election_campaign_id=null){
        $query->join('election_votes_report', function($query)use($election_campaign_id){
            $query->on('election_votes_report.id', '=', 'election_votes_report_party.election_votes_report_id');
            if($election_campaign_id)
            $query->on('election_votes_report.election_campaign_id',DB::raw($election_campaign_id));
        })
              ->join('election_votes_report_source','election_votes_report_source.id','=','election_votes_report.vote_report_source_id');
    }

    public function scopeWithElectionReportVotes($query,$election_campaign_id=null,$highPriority=false){
        $query->join('election_votes_report', function($query)use($election_campaign_id,$highPriority){
            $query->on('election_votes_report.id', '=', 'election_votes_report_party.election_votes_report_id');
            if($election_campaign_id)
            $query->on('election_votes_report.election_campaign_id',DB::raw($election_campaign_id));

            if($highPriority)
                $query->on('election_votes_report.high_priority',DB::raw(1));
        });
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

    public function scopeWithPartyDetails($query){
        $query->join('election_campaign_party_lists','election_campaign_party_lists.id','=','election_votes_report_party.party_id');
    }

    




}