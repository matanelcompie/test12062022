<?php

namespace App\Http\Controllers\Transfer;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\activists\VotersActivistsService;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaigns;
use Illuminate\Support\Facades\DB;

class ElectionsActionsController extends Controller {
    public function updateBallotsRolesAndAllocations(){
		$file = fopen( storage_path( 'app\ballotRoles2021_03_03.csv'), "r");

		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;
		$i = 0;
		while ($data = fgetcsv($file)) {
			$i++;
			if($i == 1){ continue; }
            $cityMiId = $data[0];
			$ballot_mi_id = $data[2] * 10;
            $isHot = ($data[4] === 'כן');
            $ballotRoleName = $data[6];

            $ballotRolesIds = [
                1 => 'יור',
                2 => 'סגן',
                3 => 'חבר',
                4 => 'משקיף',
                5 => 'סופר',
            ];

			$ballot = BallotBox::select(
                'ballot_boxes.id as ballot_id',
                'ballot_boxes.mi_id as ballot_mi',
                'clusters.id as cluster_id',
                'cities.id as city_id',
                'cities.mi_id as city_mi_id',
                'cities.name'
             )
			->withCluster()
			->withCity()
			->where('clusters.election_campaign_id' , $last_campaign_id)
			->where('ballot_boxes.mi_id' , $ballot_mi_id)
			->where('cities.mi_id' , $cityMiId)
			->first();
			dump($data);
            $ballotRoleId = array_search($ballotRoleName, $ballotRolesIds) ;

			if($ballot && $ballotRoleId){
				 BallotBox::where('id', $ballot->ballot_id)
				->update(['ballot_box_role_id' => $ballotRoleId, 'hot' => $isHot]);
				dump($ballot->toArray());
                $allocationData = (object) [
                    'ballot_box_id' => $ballot->ballot_id,
                    'cluster_id' => $ballot->cluster_id,
                    'quarter_id' => null,
                    'city_id' => $ballot->city_id,
                    'election_campaign_id' => $last_campaign_id,
                ];
                $electionRoleSystemName = config('constants.activists.election_role_system_names.ballotMember');
                if($ballotRoleId == 4) {
                    $electionRoleSystemName = config('constants.activists.election_role_system_names.observer');
                } else if($ballotRoleId == 5){
                    $electionRoleSystemName = config('constants.activists.election_role_system_names.counter');
                }
                dump($electionRoleSystemName);
                $result = ActivistsAllocationsService::changeActivistAllocation($allocationData, $electionRoleSystemName);
				dump($result);
			}else{
				dump('not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			}
		}

	}
    public function updateRegionalElectionCommitteesByCities(){
		
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;
		$path = storage_path( 'app/regional_commitees2021.csv');
        $file = fopen($path, "r");

		$i = 0;
		while ($data = fgetcsv($file)) {
			$i++;
			if($i == 1){
				continue;
			}
			dump($data);
			$regional_election_mi_id = $data[0];
			$regionalElectionCommittees = DB::table('regional_election_committees')
			->select('id')
			->where('mi_id', $data[0])
			->where('election_campaign_id', $last_campaign_id)
			->first();

			if(!$regionalElectionCommittees){

			$regionalId = DB::table('regional_election_committees')
				->insertGetId(
					[
						'key' => Helper::getNewTableKey('regional_election_committees' , 5),
						'election_campaign_id' => $last_campaign_id,
						'mi_id' => $regional_election_mi_id,
						'name' => $data[1]
					]
				);
			}else{
				$regionalId = $regionalElectionCommittees->id;
			}
			dump($regionalId);

			$city = City::select('id')->where('mi_id', $data[2])->first();

			if(!$city){continue; dump('not found!!!!!!!!!!!!!!!!!!!!!!!!!');}
			dump($city->toArray());

			dump($city->id);
			$data = [
				'regional_election_committee_id' => $regionalId,
				'city_id' => $city->id,
			];
			$itemExist = DB::table('cities_in_regional_election_committees')
			->where($data)->first();
			if($itemExist) {continue;}

			DB::table('cities_in_regional_election_committees')
			->select('cities_in_regional_election_committees.city_id', 'regional_election_committees.mi_id')
			->insert($data)
			;
		}

	}
}