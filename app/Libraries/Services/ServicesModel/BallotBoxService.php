<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\municipal\MunicipalQuartersManagement;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\BallotBoxesRepository;
use DateInterval;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class BallotBoxService
{

    private static $numTimeMinute = 20;

    public static function getCityIdByBallotBox($ballotBoxId){
        $ballotBox=BallotBox::select('ballot_boxes.id','clusters.city_id')
        ->withCluster()
        ->where('ballot_boxes.id',$ballotBoxId)->first();

        return $ballotBox->city_id;
    }

    public static function getBallotBoxListByClusterKey($clusterKey,$arrField){

        $ballotBoxes=BallotBox::select($arrField)
                    ->withCluster()
                    ->where('clusters.key',$clusterKey)->get();

        return $ballotBoxes;
    }

    public static function convertBallot_miInSql(){
     
        $ballotMiId='(case when ballot_boxes.mi_id is null then ballot_boxes.mi_id else ballot_boxes.mi_id/10 end)';
        return $ballotMiId;
    }

    public static function getBallotBoxByMiBallot_MiCity($election_campaign_id,$city_mi,$ballot_mi_id){
        $ballotBox=BallotBox::select('ballot_boxes.id as ballot_box_id','clusters.city_id')->withCluster()->withCity()
        ->where('clusters.election_campaign_id',DB::raw($election_campaign_id))
        ->where('ballot_boxes.mi_id',DB::raw($ballot_mi_id))
        ->where('cities.mi_id',DB::raw($city_mi))
        ->first();
        if(!$ballotBox)
        return false;
        return $ballotBox;

    }

    //function return list of votes in ballot every party   
    public static function getListReportVotesForPartyByBallotBoxId($ballot_box_id, $election_campaign_id)
    {
        $arrFields = [
            'election_campaign_party_lists.name',
            'election_campaign_party_lists.letters',
            'election_campaign_party_lists.key',
            'election_campaign_party_lists.image_url',
            DB::raw('if(election_campaign_party_list_votes.votes_report is null,0,election_campaign_party_list_votes.votes_report) as votes_count')
        ];
        $listPartyCounter = ElectionCampaignPartyLists::select($arrFields)
            ->withVotesAndBallots(true,$ballot_box_id)
            ->where('election_campaign_party_lists.election_campaign_id', $election_campaign_id)
            ->where('election_campaign_party_lists.deleted', DB::raw(0));
            // Log::info($listPartyCounter->toSql());
            // Log::info($ballot_box_id);
           $listPartyCounter=$listPartyCounter->get();

        return $listPartyCounter;
    }

    //function set count votes for party in ballot box
    public static function setCountVotesInBallotBoxByParty($ballot_box_id, $party_key, $count_votes,$nameVotesField=false)
    {
        if(!$nameVotesField)//the default is count by ballot member report 
        $nameVotesField="votes_report";
        $party = ElectionCampaignPartyLists::select()->where('key', $party_key)->first();
        //check if exist count votes for party in ballot box
        $votesPartyInBallot =
            ElectionCampaignPartyListVotes::select([DB::raw('election_campaign_party_list_votes.*')])
            ->where('election_campaign_party_list_votes.ballot_box_id', $ballot_box_id)
            ->where('election_campaign_party_list_votes.election_campaign_party_list_id', $party->id)->first();

        if (!$votesPartyInBallot) {
            $votesPartyInBallot = new ElectionCampaignPartyListVotes();
            $votesPartyInBallot->key = Helper::getNewTableKey('election_campaign_party_list_votes', ElectionCampaignPartyListVotes::$lengthKey);
            $votesPartyInBallot->ballot_box_id = $ballot_box_id;
            $votesPartyInBallot->city_id = null;
            $votesPartyInBallot->election_campaign_party_list_id = $party->id;
        }

        $votesPartyInBallot->$nameVotesField = $count_votes;
        $votesPartyInBallot->save();

        

        return true;
    }

    public static function updateCountValidAndNotValidCountVotes($ballot_box_id, $count_valid, $count_not_valid)
    {

        $arrFieldUpdate = array(
            'valid_votes_count_activist' => DB::raw($count_valid),
            'not_valid_votes_count_activist' => DB::raw($count_not_valid)
        );
        BallotBox::where('id', $ballot_box_id)->update($arrFieldUpdate);

        return true;
    }

    //function get ballot box id and return count votes in ballot box 
    public static function getCountMarkVotedBySystem($ballot_box_id, $election_campaign_id)
    {
        $count =  Votes::select(DB::raw('count(distinct votes.voter_id) as count_mark_voted'))
            ->withVotersInElectionCampaign()
            ->WithCluster()
            ->where('ballot_boxes.id', $ballot_box_id)
            ->where('votes.election_campaign_id', $election_campaign_id)->first();

        if ($count)
            return $count->count_mark_voted;
    }

    //function return count of voted in ballot box
    public static function getCountHaveVotedInBallotBox($ballot_box_id, $election_campaign_id)
    {
        $count = VotersInElectionCampaigns::select(DB::raw('count(distinct voters_in_election_campaigns.voter_id) as count_voted'))
            ->where('election_campaign_id', $election_campaign_id)
            ->where('ballot_box_id', $ballot_box_id)
            ->first();

        if ($count)
            return $count->count_voted;

        return 0;
    }

    //function return count voted in ballot that final support
    public static function getCountFinalSupportMarkVoted($ballot_box_id, $election_campaign_id)
    {
        $count = Votes::select(DB::raw('count(distinct votes.voter_id) as count_final_voted'))
            ->withVotersInElectionCampaign()
            ->WithCluster()
            ->withFinalSupportStatus()
            ->where('ballot_boxes.id', $ballot_box_id)
            ->where('votes.election_campaign_id', $election_campaign_id)->first();

        if ($count)
            return $count->count_final_voted;
        return 0;
    }

    //function get ballot box and calculate sum of votes in ballot box for all party 
    public static function getSumCountVotePartyByBallotBox($ballot_box_id, $election_campaign_id,$notPartyKey=false)
    {
        $listPartyCounter = ElectionCampaignPartyLists::select(DB::raw('sum(election_campaign_party_list_votes.votes_report) as count_parties_voted'))
            ->withVotesAndBallots()
            ->where('election_campaign_party_lists.election_campaign_id', $election_campaign_id)
            ->where('election_campaign_party_lists.deleted', DB::raw(0))
            ->where('election_campaign_party_list_votes.ballot_box_id', $ballot_box_id);

            if($notPartyKey)
            $listPartyCounter->where('election_campaign_party_lists.key','!=',$notPartyKey);

            $listPartyCounter=$listPartyCounter->first();

        if ($listPartyCounter)
            return intval($listPartyCounter->count_parties_voted);
        else
            return 0;
    }

    //
    public static function getCountVotesByPartTimeForActivistInBallot($activist_voter_id, $ballot_box_id, $election_campaign_id)
    {


        //arr include count voted in part time self::numTimeMinute
        $arrTimeVoted = [];
        $tempTime = null;
        $UserRecordVotes = Votes::select()
            ->withVotersInElectionCampaign()
            ->WithCluster()
            ->where('ballot_boxes.id', $ballot_box_id)
            ->where('votes.election_campaign_id', $election_campaign_id)
            ->where('votes.reporting_voter_id', $activist_voter_id)->orderBy('votes.id');



        $UserRecordVotes = $UserRecordVotes->get();

        //Log::info($UserRecordVotes->toArray());
        if ($UserRecordVotes && $UserRecordVotes->count() > 0) {
            $tempTime = $UserRecordVotes[0]->vote_date;
            $endPart = new DateTime($tempTime);
            $endPart->add(new DateInterval('PT' . self::$numTimeMinute . 'M'));
            $end = $endPart->format('Y-m-d H:i');

            $part = new stdClass();
            $start = new DateTime($tempTime);
            $part->startDate = $start->format('H:i');
            $part->endDate = $endPart->format('H:i');
            // $part->arrVoter=[];
            $part->count = 0;

            for ($i = 0; $i < $UserRecordVotes->count(); $i++) {
                $vote = $UserRecordVotes[$i];

                if ($vote->vote_date <= $end) {
                    //$part->arrVoter[]=$vote;
                    $part->count++;
                }

                if ($i == $UserRecordVotes->count() - 1  || ($i < $UserRecordVotes->count() - 1 && ($UserRecordVotes[$i + 1])->vote_date > $end)) {
                    $arrTimeVoted[] = $part;

                    $tempTime = $end;
                    $endPart = new DateTime($tempTime);
                    $endPart->add(new DateInterval('PT' . self::$numTimeMinute . 'M'));
                    $end = $endPart->format('Y-m-d H:i');

                    $part = new stdClass();
                    $start = new DateTime($tempTime);
                    $part->startDate = $start->format('H:i');
                    $part->endDate = $endPart->format('H:i');
                    //$part->arrVoter=[];
                    $part->count = 0;
                }
            }
        }
        return $arrTimeVoted;
    }


    public static function getBallotBoxIdByActivistAndBallotMiId($ballot_mi, $voterActivistId, $election_campaign_id, $allObject = false)
    {
        $ballot_box_Number = BallotBox::resetLogicMiBallotBox($ballot_mi); //remove logic ballot box number
        $ballotBoxObj = BallotBox::getBallotBoxIdByMiId_Activist_voter_id($ballot_box_Number, $voterActivistId, $election_campaign_id); //search id of ballot box number
        if (!$ballotBoxObj)
            throw new Exception(config('errors.elections.ACTIVIST_NOT_BALLOT_MEMBER'));

        $ballotBoxId = $ballotBoxObj->id;
        if ($allObject)
            return $ballotBoxObj;

        return  $ballotBoxId;
    }
    //function get statistic voter in ballot by election campaign 
    public static function getStatisticsNumberVotesInBallotBox($ballotBoxId,$election_campaign_id){
        //present statistic voter in ballot
        $presentStatisticVotes=BallotBox::select('calculated_probability_total_votes_percents','calculated_probability_shas_votes_percents')->where('id',$ballotBoxId)->first();
        //number voter needs in ballot
        $numNeedVotesInBallot=self::getCountHaveVotedInBallotBox($ballotBoxId,$election_campaign_id);

        $presentStatisticNeedVote=$presentStatisticVotes->calculated_probability_total_votes_percents;
        $presentStatisticNeedVote=is_null($presentStatisticNeedVote)?0:$presentStatisticNeedVote;

        $presentStatisticShasVote=$presentStatisticVotes->calculated_probability_shas_votes_percents;
        $presentStatisticShasVote=is_null($presentStatisticShasVote)?0:$presentStatisticShasVote;
        
        //number statistic vote in ballot
        $statisticNumVoterInBallot=(intval($numNeedVotesInBallot)*intval($presentStatisticNeedVote)/100);
        //number statistic shas vote in ballot box
        $statisticNumShasVoter=($statisticNumVoterInBallot*intval($presentStatisticShasVote)/100);

        return $statisticNumShasVoter;
    }

    public static function getCountBallotRoleByGeoGroupCity($election_campaign_id,$tableGeo,$arrEntityGeoKey){
        $column=[
            'cities.name as city_name',
            'areas.name as area_name',
            'sub_areas.name as sub_area_name'
            ];
  
        $countBallotBoxWithRole=
        BallotBox::select(DB::raw('count(distinct ballot_boxes.id ) as countBallotWithRole,cities.id as city_id'))
        ->addSelect($column)
        ->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
        ->join('cities','cities.id','=','clusters.city_id')
        ->leftJoin('sub_areas','sub_areas.id','=','cities.sub_area_id')
        ->leftJoin('areas','areas.id','=','cities.area_id')
        ->whereNotNull('ballot_boxes.ballot_box_role_id')
        ->where('clusters.election_campaign_id',DB::raw($election_campaign_id));

        if($tableGeo)
        $countBallotBoxWithRole=$countBallotBoxWithRole->whereIn($tableGeo.'.key',$arrEntityGeoKey);
        $countBallotBoxWithRole=$countBallotBoxWithRole->groupBy('city_id');
        //  Log::info( $countBallotBoxWithRole->toSql());
        //  Log::info( $countBallotBoxWithRole->getBindings());
       $countBallotBoxWithRole= $countBallotBoxWithRole->get();
       return $countBallotBoxWithRole;
    }


    /**
     * @method getBallotShiftsAndSupportersQuery
     * 
     */
    public static function getBallotShiftsAndSupportersQuery($electionCampaignId)
    {
        $calculated_mi_shas_votes = BallotBox::getCalculatedProbabilityShasVotesQuery();
        $ballotQuery = BallotBox::select(
            'ballot_boxes.voter_count',
            'ballot_boxes.id',
            'ballot_boxes.hot',
            'special_access',
            DB::raw("$calculated_mi_shas_votes as calculated_mi_shas_votes"),
            'calculated_probability_shas_votes_percents'
        );
        BallotBoxesRepository::addCountFinalVoterSupportToBallotQuery($ballotQuery, $electionCampaignId);
        BallotBoxesRepository::addVoterAssignmentDetailsToBallotQuery($ballotQuery, $electionCampaignId);

        return $ballotQuery;
    }
}
