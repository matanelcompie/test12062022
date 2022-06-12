<?php
namespace App\Libraries\Services\ServicesModel;

use Illuminate\Support\Facades\Log;




class UploadExcelInNewElectionCampaign
{
    		//load 
		public function loadBallotsFile(){
			$election_campaign_id = ElectionCampaigns::currentCampaign()->id;
			$path = storage_path( 'app/kalpies_report_tofes_b_4_2_21_test.csv');
			$file = fopen($path, "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				$i++;
				if($i == 1 || $i == 2){ continue; }
				Log::info($data);
				$city_mi_id = $data['2']; 
				$cluster_mi_id = intval($data['5']) ; 
				$cluster_address = $data['6'] ; 
				$cluster_name = $data['7'] ; 

				$ballot_mi_id = $data['4'] *  10; 
				$crippled = !empty(trim($data['8'])) ? 1 :0  ; 
				$special_access = !empty(trim($data['9'])) ? 1 :0  ; 
				$ballot_voter_count = $data['10']  ; 
				$city = City::where('mi_id', $city_mi_id)->first();
				if($city){
					$cluster = Cluster::where('city_id', $city->id)->where('clusters.mi_id', $cluster_mi_id)->where('election_campaign_id', $election_campaign_id)->first();
					if(!$cluster){
						$cluster = new Cluster();
						$cluster->key = Helper::getNewTableKey('clusters', 5);
						$cluster->election_campaign_id = $election_campaign_id;
						$cluster->city_id = $city->id;
						$cluster->mi_id = $cluster_mi_id;
					} 

					$cluster->name = $cluster_name;
					$address = explode(',', $cluster_address);
					$cluster->street = $address[0];
					$cluster->house = !empty($address[1]) ?$address[1] : null;
					$cluster->save();
					Log::info('cluster'. json_encode($cluster->toArray()));
					if($cluster){
						$ballot = BallotBox::where('mi_id', $ballot_mi_id)
						->where('cluster_id', $cluster->id)->first();
						if(!$ballot){
							$ballot = new BallotBox();
							$ballot->cluster_id = $cluster->id;
							$ballot->mi_id = $ballot_mi_id;
							$ballot->key = Helper::getNewTableKey('ballot_boxes', 10);
						} 
						$ballot->voter_count = $ballot_voter_count;
						$ballot->crippled = $crippled;
						$ballot->special_access = $special_access;
						$ballot->save();

						$otherBallots = BallotBox::select('ballot_boxes.cluster_id', 'ballot_boxes.id', 'ballot_boxes.mi_id')->withCluster()
						->where('clusters.city_id', $city->id)
						->where('clusters.election_campaign_id', $election_campaign_id)
						->where('ballot_boxes.mi_id', $ballot_mi_id)
						->where('ballot_boxes.id', '!=', $ballot->id)
						->get();
						Log::info('otherBallots'. json_encode($otherBallots));
						foreach($otherBallots as $b){
							VotersInElectionCampaigns::where('ballot_box_id', $b->id)->update(['ballot_box_id' => $ballot->id]);
							$voters = VotersInElectionCampaigns::where('ballot_box_id', $b->id)->where('election_campaign_id', $election_campaign_id)->limit(3)->get();
							if($voters){
								Log::info('voters-array'. json_encode($voters->toArray()));
							}
						}
						Log::info('ballot'. json_encode( $ballot->toArray()));
					}
				}
				
			}
		}

        public function updateCities() {
            $citiesFileLocation = public_path()."\\cities.csv";
            $citiesFile = fopen($citiesFileLocation, 'r');
            $i=0;
            while ( ($fileData = fgets($citiesFile)) !== false ) {
                $i++;
                $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
                $utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
                $csvData = str_getcsv($utf8Data);
                $cityName = $csvData[2];
                $cityMiId = $csvData[1];
                $city = City::select('name')->where('mi_id', $cityMiId)->where('deleted', 0)->first();
                if ($city) {
                    //if (strcmp($city->name,$cityName) <> 0) echo "City name mismatch: ".$city->name." => ".$cityName."<br>";
                } else {
                    echo "City not found: ".$cityName."<br>";
                    /*$newCity = new City;
                    $newCity->key = $this->getNewKey('cities', 10, Helper::DIGIT + Helper::LOWER);
                    $newCity->name = $cityName;
                    $newCity->mi_id = $cityMiId;
                    $newCity->save();*/
                }
            }
            fclose($citiesFile);		
        }

        	//split  voter book to files for upload quickly
	//upload file only zip
	public function splitVoterBook() {
		$voterBookLocation = public_path()."\\voter_book.txt";
		$splitFileLocation = "";
		$splitFile = null;
		$fileCount = 12;
		$splitLimit = 800000;//how muck rows
		$splitCount = 1;//
		$voterBookFile = fopen($voterBookLocation, 'r');
		while ( ($fileData = fgets($voterBookFile)) !== false ) {
			if ($splitCount == 1) {
				$splitFileLocation = public_path()."\\voter_book_".$fileCount.".txt";
				$splitFile = fopen($splitFileLocation, 'w');
			}
			fwrite($splitFile, $fileData);
			if ($splitCount == $splitLimit) {
				fclose($splitFile);
				$fileCount++;
				$splitCount = 0;
			}
			$splitCount++;
		}
		fclose($voterBookFile);
	}
}
