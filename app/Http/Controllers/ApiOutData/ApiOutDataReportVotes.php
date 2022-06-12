<?php

namespace App\Http\Controllers\ApiOutData;

use App\Http\Controllers\Controller;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportPartyService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Models\BallotBox;
use Illuminate\Http\Request;
use App\Models\ElectionCampaigns;
use App\Models\GeographicFilterTemplates;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionVotesReport;
use App\Models\ElectionVotesReportParty;
use App\Models\ElectionVotesReportSource;
use Exception;
use Illuminate\Support\Facades\DB;
use stdClass;

class ApiOutDataReportVotes extends Controller {

    public function getReportFinalVotsShasData(Request $request){
        $currentLogin=ElectionCampaigns::currentCampaign();
        $object = (object)($request->all());
        $jsonOutput = app()->make("JsonOutput");
        try {
            $city_mi_id=$object->cityMiId;
            $ballot_mi_id=BallotBox::resetLogicMiBallotBox($object->ballotBoxMiId);

            $ballotBox=BallotBoxService::getBallotBoxByMiBallot_MiCity($currentLogin->id,$city_mi_id,$ballot_mi_id);
            if(!$ballotBox)
            throw new Exception(config('errors.elections.BALLOT_BOX_DOES_NOT_EXIST'));

            $details=new stdClass();
            $details->ballotBoxMiId=$object->ballotBoxMiId;
            $details->cityMiId=$object->cityMiId;
            $details->allVotes=0;
            $details->invalidVotes=0;
            $details->validVotes=0;

            $arrFieldParty=[
                'election_campaign_party_lists.letters',
                'election_votes_report_party.count_votes'
            ];
            $detailsReport=ElectionVotesReportService::isExist($currentLogin->id,ElectionVotesReportSource::$shas_report,$ballotBox->id);
            if($detailsReport){
                $arrPartyReport=ElectionVotesReportParty::select($arrFieldParty)
                ->join('election_campaign_party_lists','election_campaign_party_lists.id','=','election_votes_report_party.party_id')
                ->where('election_votes_report_id',$detailsReport->id)->get();
                $details->invalidVotes=$detailsReport->count_not_valid_votes;

                $countValid=0;
                foreach ($arrPartyReport as $key => $party) {
                    $countValid = $countValid+=$party->count_votes;
                }
                $details->validVotes=$countValid;
                $details->listPartiesVotes=$arrPartyReport;
            }
           
            $jsonOutput->setData($details);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

}
