<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use Illuminate\Http\Request;
use PDF;

class GeneralWalkerReportController extends Controller {

    /*
		Private helpful function that validates the POST params that needed
		to generate the general walker report
	*/
    private function validateWalkerReportParams(Request $request) {
        $result = [
            'error' => false,
            'errorCode' => null
        ];

        $ballotBoxKey = $request->input('ballotbox_key', null);
        $clusterKeys = $request->input('cluster_keys', null);
        $cityKey = $request->input('city_key', null);

        if ( is_null($cityKey) ) {
            $result['error'] = true;
            $result['errorCode'] = config('errors.elections.INVALID_CITY');

            return $result;
        } else {
            $cityObj = City::select('id')
                ->where('key', $cityKey)
                ->first();

            if ( is_null($cityObj) ) {
                $result['error'] = true;
                $result['errorCode'] = config('errors.elections.INVALID_CITY');

                return $result;
            }
        }

        if ( !is_null($clusterKeys) && is_null($ballotBoxKey) ) {
            $currentCampaign = ElectionCampaigns::currentCampaign();
            $currentCampaignId = $currentCampaign->id;

            $clusters = Cluster::select('id')
                ->whereIn('key', $clusterKeys)
                ->where('election_campaign_id', $currentCampaignId)
                ->get();

            if ( count($clusterKeys) != count($clusters) ) {
                $result['error'] = true;
                $result['errorCode'] = config('errors.elections.CLUSTER_DOES_NOT_EXIST');

                return $result;
            }
        }

        if ( !is_null($ballotBoxKey) ) {
            $ballotObj = BallotBox::select('id')
                ->where('key', $ballotBoxKey)
                ->first();

            if ( is_null($ballotObj) ) {
                $result['error'] = true;
                $result['errorCode'] = config('errors.elections.BALLOT_BOX_DOES_NOT_EXIST');

                return $result;
            }
        }

        return $result;
    }

	/*
		Function that generates general walker report by POST params
		using this class's private helpful functions
	*/
    public function getWalkerReport(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $result = $this->validateWalkerReportParams($request);
        if ( $result['error'] ) {
            $jsonOutput->setErrorCode($result['errorCode']);
            return;
        }

        $ballotBoxsVotersJson = $this->getVotersByQueryParams($request);

        $jsonOutput->setData($ballotBoxsVotersJson);
    }
    /**
     * @method getVotersByQueryParams
     * Get walker report data by params
     * 1. get ballotBox data.
     * -> by ballotBox key
     * -> or by cluster key
     * -> or by city key
     * 2. join cluster data to get city.
     *
     * @param request
     * {
     *  skip_rows: row to skip in query
     *  ballotbox_key, cluster_key, city_key => geo data
     * }
     * @return {obj}
     * ballotbox_voters_data - list of ballotBox result.
     * total_voters_count -total voters in all the ballotBoxes.
     */
    public function getVotersByQueryParams(Request $request, $fromPrint = false) {
        $ballotBoxsKey = $request->input('ballotbox_key', null);
        $clusterKeys = $request->input('cluster_keys', null);
        $cityKey = $request->input('city_key', null);

        $skipRows = $request->input('skip_rows', 0);
        $limit = !$fromPrint ? 100 : 2000000;
        // $limit=2000000;
        $totalVotersCount = 0;

        $ballotBoxsVotersData = [];
        $ballotBoxsVotersList = [];

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        if ($ballotBoxsKey) { //Search for single ballotBox by ballotBox key.
            $ballotBoxQuery = BallotBox::withCluster()
                ->where('ballot_boxes.key', $ballotBoxsKey)
                ->where('clusters.election_campaign_id', $currentCampaignId);
            $this->getBallotVotersQuery($ballotBoxQuery, $skipRows, $limit, $currentCampaignId , $fromPrint);
            $ballotBoxsVotersData = $ballotBoxQuery->get();
        } else if ($clusterKeys) { //Search for multiple ballotBox by cluster key.
            $ballotBoxQuery = BallotBox::withCluster()
                ->whereIn('clusters.key', $clusterKeys)
                ->where('clusters.election_campaign_id', $currentCampaignId);
            $this->getBallotVotersQuery($ballotBoxQuery, $skipRows, $limit, $currentCampaignId , $fromPrint);
            $ballotBoxsVotersData = $ballotBoxQuery->get();
        } else if ($cityKey) { //Search for multiple ballotBox (and clusters) by city key.
            $ballotBoxQuery = BallotBox::withCluster()->withCity()
                ->where('cities.key', $cityKey)
                ->where('clusters.election_campaign_id', $currentCampaignId);
            $this->getBallotVotersQuery($ballotBoxQuery, $skipRows, $limit, $currentCampaignId , $fromPrint);
            $ballotBoxsVotersData = $ballotBoxQuery->get();
        }

        foreach ($ballotBoxsVotersData as $key => $data) {
            $totalVotersCount += $data->voter_count;
            if ($fromPrint || $data->ballotBoxVoters->count() != 0) { //Check if ballot box has voters, if not it will not sent to client.
                $ballotBoxsVotersList[] = $ballotBoxsVotersData[$key];
            }
        }

        return ['ballotbox_voters_data' => $ballotBoxsVotersList, 'total_voters_count' => $totalVotersCount];
    }
    /**
     * @method getBallotVotersQuery()
     *  prepare the voters query
     *
     * 1. Get voters of the choosen ballotboxes
     * 2. just of the current campaign.
     * -> join for voters the support status.
     * -> with the phone numbers list of every voter
     * -> join street name of the mi_steet_id (if exist).
     * 3. order voters by ballotBoxes id.
     * 4. order  voters by street name!
     * 5. limit the voters for pagination.
     * 6. skip for voters to get more voters data every reqest
     *
     * @param [type] $ballotBoxQuery -query of all the ballotBoxes, (according to all the geo details)
     * @param [type] $skipRows -rows to skip in DB
     * @param [type] $limit - rows limit in DB
     * @return void
     */
    private function getBallotVotersQuery(&$ballotBoxQuery, $skipRows, $limit, $currentCampaignId , $fromPrint)
    {
		$additionToPrint = "";
		if($fromPrint){
			$additionToPrint = " CONCAT(SUBSTR(CONCAT(ballot_boxes.mi_id,''), 1, LENGTH(CONCAT(ballot_boxes.mi_id,''))-1) ,'.' , SUBSTR(CONCAT(ballot_boxes.mi_id,''),-1)) AS formattedBallotBox ";
		}
        $ballotBoxQuery = $ballotBoxQuery->with(['ballotBoxVoters' => function ($query) use ($skipRows, $limit, $currentCampaignId , $fromPrint) {
            $query->withVoter()->withVoterSupportStatus($currentCampaignId, 'ENTITY_TYPE_VOTER_SUPPORT_FINAL')
                ->leftJoin('support_status', 'support_status.id', '=', 'support_status_id')
                ->leftJoin('streets', 'streets.id', '=', 'voters.mi_street_id')
                ->with(['voterPhones' => function ($query) {
                    $query->select('phone_number', 'voter_id');
                }])
                ->select('voter_support_status.support_status_id', 'support_status.name as supportStatusName',
                    'voters_in_election_campaigns.voter_serial_number',
                    'voters_in_election_campaigns.voter_id', 'voters_in_election_campaigns.ballot_box_id',
                    'voters.first_name', 'voters.last_name', 'voters.personal_identity',
                    'voters.mi_street', 'voters.mi_street_id', 'streets.name as street_name', 'voters.house', 'voters.house'
                )
                ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId)
                ->orderBy('voters_in_election_campaigns.ballot_box_id')
                ->orderByRaw(
                    "CASE WHEN street_name IS NOT NULL THEN street_name ELSE mi_street END ASC"
                );
				if(!$fromPrint){
					$query->skip($skipRows)->limit($limit);
				}
        }])->select('ballot_boxes.cluster_id', 'clusters.name as cluster_name', 'ballot_boxes.id',
            'ballot_boxes.voter_count', 'ballot_boxes.mi_id');
		if($fromPrint){	
			$ballotBoxQuery =  $ballotBoxQuery->selectRaw($additionToPrint);
		}
        $ballotBoxQuery = $ballotBoxQuery->orderBy('ballot_boxes.id');
    }

    /**
     * @method  exportReportByParamsAndType()
     *  Print/export to pdf file voter search results
     * -> print all the results, according to the geographical data required (city,cluster,ballotbox).
     * -> not doing pagination
     * $request:
     * @param {string} format - request format (pdf or print).
     * @return view blade file
     * pdf -> download the data in pdf file.
     * print -> print view of the data.
     *
     */
    public function exportReportByParamsAndType(Request $request) {
        ini_set('memory_limit', '-1');

        $jsonOutput = app()->make("JsonOutput");

        $result = $this->validateWalkerReportParams($request);
        if ( $result['error'] ) {
            $jsonOutput->setErrorCode($result['errorCode']);
            return;
        }

        $jsonOutput->setBypass(true);

        $ballotBoxsVotersJson = $this->getVotersByQueryParams($request, true);
        $ballotBoxsVotersData = collect($ballotBoxsVotersJson['ballotbox_voters_data'])->toArray();

        $cityKey = $request->input('city_key', null);
        $city = City::select('name')->where('key', $cityKey)->first();
        $format = $request->input('format');
        if ($format == 'print') {
            return view('reports.generalWalker', ['data' => $ballotBoxsVotersData, 'cityName' => $city->name]);
        } elseif ($format == 'pdf') {
          //  error_reporting(0);
            ini_set("pcre.backtrack_limit", "10000000000");
            $pdf = PDF::loadView('reports.generalWalker', 
            ['data' => $ballotBoxsVotersData, 'print' => false,'columnsNames' => [], 'cityName' => $city->name],
             [], ['mode' => 'utf-8', 'format' => 'A4-L']);

            return $pdf->stream("תוצאות הליכון" . ".pdf");
        }
    }
    /**
     * Development only!
     * Delete in production!
     */
    public function setVoterCount()
    {
        return false;
        $resultList = [];
        $jsonOutput = app()->make("JsonOutput");

        $ballotBoxes = BallotBox::select('ballot_boxes.id')
            ->withCount('votersElectionCampaigns')
            ->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
            ->where('clusters.election_campaign_id', 21)
            ->get();
        foreach ($ballotBoxes as $ballotBox) {
            // echo $ballotBox->voters_election_campaigns_count . ' ' . $ballotBox->id . "<br>";
            $ballotBox->voter_count = $ballotBox->voters_election_campaigns_count;
            $result = $ballotBox->save();
            $resultList[$ballotBox->id] = ['result' => $result, 'voter_count' => $ballotBox->voter_count];
        }
        $jsonOutput->setData(['resultList' => $resultList]);
    }

}
