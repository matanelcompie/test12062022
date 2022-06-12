<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ManageCommandLine;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionVotesReport;
use App\Models\ElectionVotesReportParty;
use App\Models\ElectionVotesReportSource;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

//class that mange all vote report by report source type
class ElectionVotesReportService
{
    public static $limit=500;
    public static function addElectionVotesReportForBallotBox($election_campaign_id,$vote_report_source_id,$ballot_box_id=null,$city_id=null,$count_votes=0,$count_not_valid_votes=0){
     
        $ElectionVotersReport=self::isExist($election_campaign_id,$vote_report_source_id,$ballot_box_id,$city_id);
     
        if(!$ElectionVotersReport){
         $ElectionVotersReport=self::insertElectionVotesReportForBallotBox($election_campaign_id,$vote_report_source_id,$ballot_box_id,$city_id,$count_votes,$count_not_valid_votes);
        }
        return $ElectionVotersReport;
    }

    //function helper for addElectionVotesReportForBallotBox function
    private static function insertElectionVotesReportForBallotBox($election_campaign_id,$vote_report_source_id,$ballot_box_id,$city_id=null,$count_votes=0,$count_not_valid_votes=0,$count_have_votes=0){
        $isHighPriority=self::IsHighPriorityOfSourceReportByBallotBox($election_campaign_id,$vote_report_source_id,$ballot_box_id,$city_id,true);
        $ElectionVotersReport=new ElectionVotesReport();
        $ElectionVotersReport->key=Helper::getNewTableKey('election_votes_report',ElectionVotesReport::$lengthKey);
        $user=Auth::user()?Auth::user():ManageCommandLine::user();
        $ElectionVotersReport->created_voter_id=$user->voter_id;
        $ElectionVotersReport->election_campaign_id=$election_campaign_id;
        $ElectionVotersReport->vote_report_source_id=$vote_report_source_id;
        $ElectionVotersReport->ballot_box_id=$ballot_box_id;
        //if ballot box need insert city
        if(!is_null($ballot_box_id) && is_null($city_id))
        $city_id=BallotBoxService::getCityIdByBallotBox($ballot_box_id);

        $ElectionVotersReport->city_id=$city_id;
        $ElectionVotersReport->count_votes=$count_votes;
        $ElectionVotersReport->count_not_valid_votes=$count_not_valid_votes;
        $ElectionVotersReport->count_have_votes=$count_have_votes;
        if($isHighPriority)
        $ElectionVotersReport->high_priority=1;
        $ElectionVotersReport->save();

        return $ElectionVotersReport;

    }

    public static function isExist($election_campaign_id,$vote_report_source_id,$ballot_box_id=null,$city_id=null){
        $ElectionVotersReport=ElectionVotesReport::select()
        ->where('election_campaign_id',$election_campaign_id)
        ->where('vote_report_source_id',$vote_report_source_id);
        
        if($ballot_box_id)
        $ElectionVotersReport=$ElectionVotersReport->where('ballot_box_id',$ballot_box_id)->first();
        else
        $ElectionVotersReport=$ElectionVotersReport->where(function($q)use($city_id){
            $q->whereNull('ballot_box_id')->where('city_id',$city_id);
        })->first();

        if(!$ElectionVotersReport)
        return false;
        return $ElectionVotersReport;
    }



    //function check if have bigger priority before insert , function return 
    private static function IsHighPriorityOfSourceReportByBallotBox($election_campaign_id,$vote_report_source_id,$ballot_box_id=null,$city_id=null,$reset=false){
        $voteReportSource=ElectionVotesReportSource::select()->where('id',$vote_report_source_id)->first();
        $arrHighPriorityVoteSource=ElectionVotesReportSourceService::getHighPriorityByElectionVoteSource($voteReportSource->priority,true);
        $query=ElectionVotesReport::select(DB::raw('election_votes_report.*,election_votes_report_source.priority'))
        ->withElectionVotesReportSource()
        ->where('election_campaign_id',$election_campaign_id)
        ->where('high_priority',DB::raw(1))
        //->whereIn('election_votes_report_source.priority',$arrHighPriorityVoteSource)
        ->where('vote_report_source_id','<>',$vote_report_source_id);
        if($ballot_box_id)
        $query->where('ballot_box_id',$ballot_box_id);
        else
        $query->where(function($q)use($city_id){
            $q->whereNull('ballot_box_id')->where('city_id',$city_id);
        });

        $ElectionVotersReport=$query->get();

        if(!$ElectionVotersReport || $ElectionVotersReport->count()==0)
        return true;

        else//check if the record with high priority is higher then mi-vote_report_source_id
        {
            $priority=$ElectionVotersReport[0]->priority;
            if(in_array($priority,$arrHighPriorityVoteSource))
            return false;
            else if($reset)
            $query->update(['high_priority'=>0]);
        }

        return true;
       
    }

    //function get details of details votes for 
    public static function updatePartyCountForReportSource($election_campaign_id,$election_report_source_id,$party_id,$count_votes,$ballot_box_id=null,$city_id=null,$recordReportSourceVote=null){
      
      if(!$recordReportSourceVote)
      $recordReportSourceVote= self::addElectionVotesReportForBallotBox($election_campaign_id,$election_report_source_id,$ballot_box_id,$city_id);
      $recordReportParty=ElectionVotesReportPartyService::updateCountElectionVotesReportParty($recordReportSourceVote->id,$party_id,$count_votes);
       return $recordReportParty;
    }

    //function update count votes and not valid count votes for ballot box at end 
    public static function updateCountVotesAndNotValidVotesByReportSource($election_campaign_id, $election_report_source_id, $count_votes, $count_not_valid_votes, $countHaveVotes, $ballot_box_id = null, $city_id = null, $checkExist = true)
    {
        $recordReportingSource = false;
        if ($checkExist) {
            $recordReportingSource = self::isExist($election_campaign_id, $election_report_source_id, $ballot_box_id, $city_id);
        }
        if (!$recordReportingSource)
            $recordReportingSource = self::insertElectionVotesReportForBallotBox($election_campaign_id, $election_report_source_id, $ballot_box_id, $city_id, $count_votes, $count_not_valid_votes, $countHaveVotes);
        else {
            $recordReportingSource->count_votes = $count_votes;
            $recordReportingSource->count_not_valid_votes = $count_not_valid_votes;
            $recordReportingSource->count_have_votes = $countHaveVotes;

            $user = Auth::user() ? Auth::user() : ManageCommandLine::user();
            $recordReportingSource->updated_voter_id = $user->voter_id;
            $recordReportingSource->save();
        }

        return $recordReportingSource;
    }

    //
    public static function LoadVotesFromCsvByCommissionResource($election_campaign_id,$csvLocation,$indexMiCity,$index_ballot_box,$indexHaveCount,$indexCountVote,$indexNotValid,$objectIndexParty){
        $indexRecord = 0;

        $captainTzCSV = storage_path('app/'.$csvLocation.'.csv');//."\\".$csvLocation;
		$originalFile = fopen($captainTzCSV, 'r');
        $listBallotBoxDetails=array();
        $commissionSourceId=ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$commission_report);

		
		while (($fileData = fgetcsv($originalFile)) !== false ) {
            if($indexRecord>0){
            // Log::info('excel_record'.$indexRecord);
            $mi_city_id=$fileData[$indexMiCity];
            $mi_ballot_box=$fileData[$index_ballot_box];
            if(strpos($mi_ballot_box ,"." ) !== false){
                $mi_ballot_box = str_replace("." , "",$mi_ballot_box);
            }
            else{
                $mi_ballot_box = $mi_ballot_box.'0';	
            }
           
            $isSpecialBallot=intval($mi_city_id)==9999?true:false;
            $ballot_city=$mi_city_id.'-'.$mi_ballot_box;

            if(!array_key_exists($ballot_city,$listBallotBoxDetails) && !$isSpecialBallot)
            $listBallotBoxDetails[$ballot_city]=BallotBoxService::getBallotBoxByMiBallot_MiCity($election_campaign_id,$mi_city_id,$mi_ballot_box);
            
            if(!$isSpecialBallot)
            $ballotBoxDetails=$listBallotBoxDetails[$ballot_city];
           
            if(!$ballotBoxDetails && !$isSpecialBallot){
                Log::info('errorRecordCsv'.$mi_city_id.'-'.$mi_ballot_box);
                continue;
            }
            // else
            // Log::info('details:'.$mi_city_id.'-'.$mi_ballot_box);

           
            $ballot_box_id=$isSpecialBallot?$mi_ballot_box:$ballotBoxDetails->ballot_box_id;
            $city_id=$isSpecialBallot?$mi_city_id:$ballotBoxDetails->city_id;
            $countHaveVotes=$fileData[$indexHaveCount];
            $countVoteInBallot=$fileData[$indexCountVote];
            $countNotValid=$fileData[$indexNotValid];

            $recordReportSourceVote=self::updateCountVotesAndNotValidVotesByReportSource($election_campaign_id,$commissionSourceId,$countVoteInBallot,$countNotValid,$countHaveVotes,$ballot_box_id,$city_id);
           // Log::info('sourceRecord:'.$recordReportSourceVote->id.'___________________________________');
            $txt='';
            foreach ($objectIndexParty as $party_id => $index){
                $countVotes=$fileData[$index];
                $reportParty=self::updatePartyCountForReportSource($election_campaign_id,$commissionSourceId,$party_id,$countVotes,$ballot_box_id,$city_id,$recordReportSourceVote);
                $txt=$txt.','.$reportParty->id;
            }
           // Log::info($txt);
           // Log::info('____________________________________');
         
     //  return
        }
        $indexRecord++;
       
        }
      
        Log::info('insert-'.$indexRecord);
       
        fclose($originalFile);
		
    }


    public static function getBallotBoxPriorityReportVotesByGeo($entityType,$entity_arr_value,$electionCampaignID,&$indexRow){

        $columns=[
        DB::raw('distinct election_votes_report.id as votes_report'),
        DB::raw('election_votes_report.*'),
        DB::raw('cities.name as city_name'),
        DB::raw('ballot_boxes.mi_id as ballot_box_mi_id'),
        DB::raw('SUM(election_votes_report_party.count_votes) as sum_party_votes'),
        DB::raw('election_votes_report_source.name as report_source_name,election_votes_report_source.id as report_source_id')];
        $condition=ElectionVotesReport::getConditionByGeoEntity($entityType);
        $query =ElectionVotesReport::select($columns)
        ->with([
            'reportParty' => function ($innerQuery){
                $innerQuery->select()
                            ->get();
            }])
        ->withElectionVotesReportParty(true)
        ->WithElectionVotesReportSource()
        ->withBallotBox(true)
        ->withCluster(true)
        ->WithCity(true)
        ->where('election_votes_report.high_priority',DB::raw(1))
        ->where('election_votes_report.election_campaign_id',DB::raw($electionCampaignID))
        ->groupBy('votes_report')
        ;
       
        if($condition)
        $query=$query->whereIn($condition,$entity_arr_value);
        $query=$query->skip($indexRow);
        $query=$query->limit(self::$limit)->orderBy('cities.name','election_votes_report.ballot_box_id');
        $query=$query->get(); 

        $indexRow = $indexRow + self::$limit;
        return $query;

    }

    public static function checkConflictForBallotBox($ballot_box_id,$electionCampaignID,$mySourceReportId,$notValid,$countVotes,$sumPartVotes){
        $query =ElectionVotesReport::select(DB::raw('election_votes_report.*'))
       
        ->where('election_votes_report.election_campaign_id',$electionCampaignID)
        ->where('election_votes_report.vote_report_source_id','!=',$mySourceReportId)
        ->where('election_votes_report.ballot_box_id',$ballot_box_id)
        ->where(function($query)use($notValid,$countVotes,$sumPartVotes){
            $query->where('count_not_valid_votes','!=',$notValid)
            ->orWhere('election_votes_report.count_votes','!=',$countVotes)
            ->orWhere(DB::raw('(select  SUM(election_votes_report_party.count_votes) from election_votes_report_party  where election_votes_report_party.election_votes_report_id=`election_votes_report`.`id`)'),'!=',$sumPartVotes);
        })
       
        ->get();
        return $query->count()>0?true:false;
    }


    //--count not valid votes
    public static function getCountNotValidVotesByElection($electionCampaignID){
        $countNotValid=ElectionVotesReport::select(DB::raw('sum(election_votes_report.count_not_valid_votes) as count_not_valid_votes'))
        ->where('election_campaign_id',$electionCampaignID)
        ->where('high_priority',DB::raw(1))
        ->first();
        if($countNotValid)
        return $countNotValid->count_not_valid_votes;

        return 0;
    }

         //function count all votes for party by in ballot by election and priority
         public static function getCountValidVotesByElectionCampaign($electionCampaignID) {
            $countValidVotes=ElectionVotesReportParty::select(DB::raw('sum(election_votes_report_party.count_votes) as count_valid_votes'))
            ->WithElectionReportVotesSource($electionCampaignID)
            ->where('election_votes_report.high_priority',DB::raw(1))
            ->first();
    
            if($countValidVotes)
            return $countValidVotes->count_valid_votes;
    
            return 0;
    
        }


    /**
     * delete election votes reports by "vaadat b
     *
     * @param integer $electionCampaignId
     * @param City|null $city
     * @return void
     */
    public static function deleteByElectionVotesReportSourceVaadatBchirot(int $electionCampaignId, City $city = null)
    {
        $votesSourceVaadatBchirotId = ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$commission_report);
        $whereConditions = [
            ['election_votes_report.vote_report_source_id', $votesSourceVaadatBchirotId],
            ['election_votes_report.election_campaign_id', $electionCampaignId]
        ];
        if ($city) {
            $whereConditions['election_votes_report.city_id'] = $city->id;
        }

        //delete election votes party before
        ElectionVotesReportParty::withElectionReportVotes()
            ->where($whereConditions)->delete();

        ElectionVotesReport::where($whereConditions)->delete();
    }

}