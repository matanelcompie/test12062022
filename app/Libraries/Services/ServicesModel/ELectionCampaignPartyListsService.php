<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ELectionCampaignPartyListsService
{
    public static function getListByElectionCampaignId($election_campaign_id){
        $arrParties=ElectionCampaignPartyLists::select()
        ->where('election_campaign_id',$election_campaign_id)
        ->where('deleted',DB::raw(0))
        ->orderBy('shas','DESC')
        ->get();

        return  $arrParties;
    }

    public static function getLastELectionCampaignPartyShas(){
        $LastElectionCampaigns = ElectionCampaigns::previousCampaign();
        $LastShasParty=ElectionCampaignPartyLists::select()
        ->where('election_campaign_id',$LastElectionCampaigns->id)
        ->where('shas',DB::raw(1))
        ->where('deleted',DB::raw(0))
        ->first();
        return $LastShasParty;
    }

    //update excel index of party in election campaign for upload excel votes data comm
    public static function updateExcelIndexFromCsvVotes($csvLocation,$election_campaign_id){
        $captainTzCSV = storage_path('app\\'.$csvLocation.'.csv');//."\\".$csvLocation;
		$originalFile = fopen($captainTzCSV,'r');

        //first row in csv
        $firstRow = fgetcsv($originalFile);

        for ($i=0; $i < count($firstRow); $i++) { 
            $lettersParty=$firstRow[$i];
            ElectionCampaignPartyLists::where('election_campaign_id',$election_campaign_id)->where('letters',$lettersParty)->update(
                ['excel_index'=>$i]
            );
        }

    }
}