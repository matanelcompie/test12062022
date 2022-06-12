<?php

namespace App\Libraries;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Redis;
use Session;

class VoteReporting {
    private $sessionTimeout = 1800; //Ttl seconds for session 
    private function getRedisConnection(){
        return Redis::connection('session');
    }
    public function saveVoteReportSession ($sessionData) {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $redis->del("election_day:mobile:vote_reporting_session:$sessionId");
        $redis->set("election_day:mobile:vote_reporting_session:$sessionId", json_encode($sessionData), 'EX', $this->sessionTimeout);
    }
    public function getVoteReportSession () {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $voteReportData = json_decode( $redis->get("election_day:mobile:vote_reporting_session:$sessionId"));
        return  $voteReportData;
    }
    public function extendVoteReportSession ($sessionData) { 
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $redis->set("election_day:mobile:vote_reporting_session:$sessionId", json_encode($sessionData), 'EX', $this->sessionTimeout);
    }
    public function resetVotingReportSession () {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $redis->del("election_day:mobile:vote_reporting_session:$sessionId");
    }

    public function addVotingReportHistoryInSession ($voteReportData) {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $voteKey = "election_day:mobile:voting_report_history_session:$sessionId";
        $votingReportHistory = $this->getVotingReportHistoryInSession();
        // dd($votingReportHistory,$voteReportData);
        if(isset($votingReportHistory)){
            array_unshift($votingReportHistory, $voteReportData);
            $redis->set($voteKey, json_encode($votingReportHistory), 'EX', $this->sessionTimeout);
        }else{
            $votingReportHistory = [];
            $votingReportHistory[] = $voteReportData;
            $redis->set($voteKey, json_encode($votingReportHistory), 'EX', $this->sessionTimeout);
        }
    }

    public function deleteVotingReportHistoryFromSession ($voterId) {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $voteExistInSession = false;
        $votingReportHistory = $this->getVotingReportHistoryInSession();
        if(isset($votingReportHistory)){
            foreach($votingReportHistory as $index => $reportData){
                if($reportData->voter_id == $voterId){
                    $voteExistInSession = true;
                    array_splice($votingReportHistory, $index, 1);
                }
            }
            $redis->set("election_day:mobile:voting_report_history_session:$sessionId", json_encode($votingReportHistory), 'EX', $this->sessionTimeout);
        }else{
            $votingReportHistory = [];
        }

        return ['votingReportHistory' => $votingReportHistory, 'voteExistInSession' => $voteExistInSession];
    }
    public function getVotingReportHistoryInSession () {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        $votingReportHistoryData = json_decode($redis->get("election_day:mobile:voting_report_history_session:$sessionId"));
        return  $votingReportHistoryData;
    }
    public function resetVotingReportHistoryInSession () {
        $redis = $this->getRedisConnection();
        $sessionId = $this->sessionId = Session::getId();
        return $redis->del("election_day:mobile:voting_report_history_session:$sessionId");
    }

    // Save in cash that need to run again counters for this ballots!
    public function addBallotToUpdateInCommandsCounters ($ballotBoxId) {
        Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $ballotBoxId, $ballotBoxId);
    }

}
