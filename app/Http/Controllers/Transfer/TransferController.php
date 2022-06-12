<?php
namespace App\Http\Controllers\Transfer;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;

use App\Libraries\VoterBookParser;
use App\Jobs\voterBookJob;
use Carbon\Carbon;

use App\Models\Voters;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Cluster;
use App\Models\VoterBookRows;
use App\Models\BallotBox;
use App\Models\VotersInElectionCampaigns;
use App\Models\ElectionCampaigns;
use App\Models\VoteSources;
use App\Models\Votes;
use App\Models\BankDetails;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionRolesByVoters;
use App\Models\ReportedHourlyVotes;
use App\Models\VotersUpdatesByCaptains;

use App\Models\Institutes;
use App\Models\InstituteTypes;
use App\Models\InstituteRolesByVoters;

use Illuminate\Http\Request;
use App\Libraries\Helper;
use App\Libraries\HelpFunctions;
use App\Libraries\Services\ExportService;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Libraries\Services\ServicesModel\VoterSupportStatusService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistsAllocations;
use App\Models\BallotBoxRole;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRoleShifts;
use App\Models\History;
use App\Models\SupportStatus;
use App\Models\Tm\Call;
use App\Models\UserRoles;
use App\Models\VoterSupportStatus;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

// use App\Console\Commands\CalculateVotersVotesPercentages;

class TransferController extends Controller {

	public function transferAreas() {
		$areas = DB::table('AREAS')->select('ID as id', 'NAME as name')->orderBy('id')->get();
		foreach($areas as $area) {
			do {
				$key = Helper::random(10, Helper::DIGIT + Helper::LOWER);
				$areaWithKey = DB::table('areas')->select('id')->where('key', $key)->first();
			} while ($areaWithKey != null);
			DB::table('areas')->insert([
				'key' => $key,
				'name' => $area->name,
				'old_id' => $area->id
			]);
		}
		echo $areas;
	}
	
	public function insertPreviousPartiesFullData(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$index = 0;
		$file = fopen(env('FILES_FOLDER') ."/" . 'FORMATTED_CSV_FILE_2018.csv', "r");
		$election_campaign_id = 21;
		$secondRowIdxs = [];
		$secondRowStartIndex =8;
		$totalZeroCells = 0;
		$totalInsertedCells = 0;
		$totalInsertedCellsWithoutBalts = 0;
		$totalInsertedCellsWithBalts = 0;
		while ($data = fgetcsv($file)) {
			
			
			$index++;
			if($index == 1){
				continue;
			}
			elseif($index == 2){
				$secondRowIdxs = $data;
				continue;
			}
			elseif($index <= 3865){ //because process was interrupted
				continue;
			}
			$ballot_mi_id = $data[2];
	 
			if(strpos($ballot_mi_id , ".") !== false){
				 $ballot_mi_id = str_replace("." , "" , $ballot_mi_id);
			}
			else{
				 $ballot_mi_id =  $ballot_mi_id."0";
			}
			$city_mi_id = $data[1];
			$city_id = 0;
			$existingBallotBox = BallotBox::select("id")->whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id=".$election_campaign_id." and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->first();
			if(!$existingBallotBox){
			
					$city_id = City::select('id')->where('mi_id' ,$city_mi_id )->where('deleted',0)->first();
					if($city_id){
						$city_id = $city_id['id'];
					}
					else{
						$city_id = 0;
					}
					
					//echo $city_mi_id.":".$city_id."--";
			}
			
			
		
			for($i = $secondRowStartIndex ; $i < sizeof($data) ; $i++){
				//echo $secondRowIdxs[$i]."-";
				if($data[$i]){
					$totalInsertedCells ++;
					echo $index." - ";
					if(!$existingBallotBox){
						ElectionCampaignPartyListVotes::insert(['key'=>Helper::getNewTableKey('election_campaign_party_list_votes',10) , 'city_id'=>$city_id , 'election_campaign_party_list_id'=>$secondRowIdxs[$i] , 'votes'=>str_replace(",","",$data[$i])]);
						$totalInsertedCellsWithoutBalts ++;
						echo "inserted row WITHOUT ballot - only city ".$city_mi_id."-".$ballot_mi_id. "<br/>";
					}
					else{
						ElectionCampaignPartyListVotes::insert(['key'=>Helper::getNewTableKey('election_campaign_party_list_votes',10) , 'ballot_box_id'=>$existingBallotBox->id , 'election_campaign_party_list_id'=>$secondRowIdxs[$i] , 'votes'=>str_replace("," , "",$data[$i])]);
						$totalInsertedCellsWithBalts ++;
						echo "inserted row with ballot - only city ".$city_mi_id."-".$ballot_mi_id. "<br/>";
					}
				}
				else{
					$totalZeroCells ++;
				}
			}
			//echo "<br/>";
			//$mi_voter_count = $data[4];
			//$banned_votes_count = $data[6];
			//$valid_votes_count = $data[7];
			//$mi_voter_count = str_replace(",","",$mi_voter_count);
			//$banned_votes_count = str_replace(",","",$banned_votes_count);
			//$valid_votes_count = str_replace(",","",$valid_votes_count);
			
			// BallotBox::whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id=".$election_campaign_id." and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->update(['mi_voter_count'=>$mi_voter_count,'invalid_votes_count'=>$banned_votes_count,'votes_count'=>$valid_votes_count]) ;
			// echo "inserted row ".$index."<br/>";
			
			//echo "updated row ".$index."<br/>";
			//echo $secondRowIdxs[$secondRowStartIndex]."--"; this returns first party ID that corresponds to table
			//echo $data[0]."---";
		}
		echo "total inserted rows :".$totalInsertedCells."<br/>" ;
		echo "total inserted WITH ballot :".$totalInsertedCellsWithBalts."<br/>" ;
		echo "total inserted WITHOUT ballot :".$totalInsertedCellsWithoutBalts."<br/>" ;
		echo "total NULL rows :".$totalZeroCells."<br/>" ;
		echo "total number : ".($totalInsertedCells + $totalZeroCells);
		//dd($secondRowIdxs[8]);
		$jsonOutput->setData("ok");
	}
	
	public function insertPreviousPartiesList(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );
		$file = fopen(env('FILES_FOLDER') ."/" . 'PARTIES_LIST_2018.csv', "r");
		$election_campaign_id = 21;
		
		while ($data = fgetcsv($file)) {
			//Helper::getNewTableKey('election_campaign_party_lists', 5)
			ElectionCampaignPartyLists::insert(['key'=>Helper::getNewTableKey('election_campaign_party_lists', 5) , 'election_campaign_id'=>$election_campaign_id , 'name'=>'' , 'letters'=>$data[0]]);
			echo $data[0] ."-";
		}
		$jsonOutput->setData("ok");
	}
	public function insertPreviousShassVotesData(){
		$jsonOutput = app()->make( "JsonOutput" );
		$index = 0;
		$file = fopen( storage_path( '/app/votes_results_23.csv'), "r");
		$election_campaign_id = 24;
		// $secondRowIdxs = [];
		$totalZeroCells = 0;
		$totalInsertedCells = 0;
		$totalInsertedCellsWithoutBalts = 0;
		$totalInsertedCellsWithBalts = 0;
		$shassPartyId =222;

		while ($data = fgetcsv($file)) {
			
			$index++;
			if($index == 1 || $index == 2){
				continue;
			}
			// elseif($index == 2){
			// 	$secondRowIdxs = $data;
			// 	continue;
			// }
			$city_id = 0;
				// dd($data,$data[1], $data[2]);
			$city_mi_id = $data[1];

			$ballot_mi_id = $data[2];
	 
			if(strpos($ballot_mi_id , ".") !== false){
				 $ballot_mi_id = str_replace("." , "" , $ballot_mi_id);
			}
			else{
				 $ballot_mi_id =  $ballot_mi_id . "0";
			}
			$existingBallotBox = BallotBox::select("id")
			->whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id="
			.$election_campaign_id." and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->first();
			// if(!$existingBallotBox){
			
			// 		$city_id = City::select('id')->where('mi_id' ,$city_mi_id )->where('deleted',0)->first();
			// 		if($city_id){
			// 			$city_id = $city_id['id'];
			// 		}else{
			// 			$city_id = 0;
			// 		}
			// }
			
			
		// $shassVotes = $data[6];
		$totalVoters = $data[4];
		$totalVotes = $data[5];

		if($existingBallotBox){
			$ballotId = $existingBallotBox->id;
			BallotBox::where('id',$ballotId)->update([
				'voter_count' => $totalVoters,
				'votes_count' => $totalVotes
				]);
				echo "Updated ballot".$city_mi_id."-".$ballot_mi_id .'-' . $ballotId .'-' . $totalVoters .'-' . $totalVotes ."<br/>";
		}
		/*
			$totalInsertedCells ++;
			echo $index." - ";
			if(!$existingBallotBox){
				ElectionCampaignPartyListVotes::insert(['key'=>Helper::getNewTableKey('election_campaign_party_list_votes',10) , 'city_id'=>$city_id , 'election_campaign_party_list_id'=> 221 , 'votes'=>str_replace(",","",$shassVotes)]);
				$totalInsertedCellsWithoutBalts ++;
				echo "inserted row WITHOUT ballot - only city ".$city_mi_id."-".$ballot_mi_id . '-' . $city_id. "<br/>";
			}
			else{
				ElectionCampaignPartyListVotes::insert(['key'=>Helper::getNewTableKey('election_campaign_party_list_votes',10) , 'ballot_box_id'=>$existingBallotBox->id , 'election_campaign_party_list_id'=> 221 , 'votes'=>str_replace("," , "",$shassVotes)]);
				$totalInsertedCellsWithBalts ++;
				echo "inserted row with ballot - only city ".$city_mi_id."-".$ballot_mi_id .'-' . $existingBallotBox->id ."<br/>";
			}
		*/

		}
		// echo "total inserted rows :".$totalInsertedCells."<br/>" ;
		// echo "total inserted WITH ballot :".$totalInsertedCellsWithBalts."<br/>" ;
		// echo "total inserted WITHOUT ballot :".$totalInsertedCellsWithoutBalts."<br/>" ;
		// echo "total NULL rows :".$totalZeroCells."<br/>" ;
		// echo "total number : ".($totalInsertedCells + $totalZeroCells);
		//dd($secondRowIdxs[8]);
		$jsonOutput->setData("ok");
	}
	public function transferRealVotesPartyListsBallots(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );

		$file = fopen(env('FILES_FOLDER') ."/" . 'real_votes_results_2019.csv', "r");
		$election_campaign_id = 22;
		$index = 0;
		$partyIDSRplaceArr = [
			'7'=>'29' , 
			'8'=>'30' , 
			'9'=>'31' , 
			'10'=>'33' , 
			'11'=>'34' , 
			'12'=>'35' , 
			'13'=>'36' , 
			'14'=>'37' , 
			'15'=>'38' , 
			'16'=>'39' , 
			'17'=>'40' , 
			'18'=>'41' , 
			'19'=>'42' , 
			'20'=>'43' , 
			'21'=>'45' , 
			'22'=>'46' , 
			'23'=>'47' , 
			'24'=>'48' , 
			'25'=>'49' ,
			'26'=>'50' , 
			'27'=>'51' , 
			'28'=>'52' , 
			'29'=>'53' , 
			'30'=>'54' , 
			'31'=>'57' , 
			'32'=>'58' , 
			'33'=>'59' , 
			'34'=>'60' , 
			'35'=>'61' , 
			'36'=>'62' , 
			'37'=>'63' , 
			'38'=>'64' , 
			'39'=>'65' , 
			'40'=>'66' , 
			'41'=>'67' , 
			'42'=>'69' , 
			'43'=>'70' , 
			'44'=>'71' , 
			'45'=>'72' , 
			'46'=>'73' , 
			'47'=>'74' ,
			'48'=>'75' , 
			'49'=>'76'  
		];
	 
		$updatesCount = 0;
		
		$insertsArr = [];
		 while ($data = fgetcsv($file)) {
			 if($index >= 1){
				//echo ($data[1])."<br/>";
				$city_mi_id=$data[1];
				$ballot_mi_id = $data[2].'';
				 
				if(strpos($ballot_mi_id ,"." ) !== false){
					$ballot_mi_id = str_replace("." , "",$ballot_mi_id);
				}
				else{
					$ballot_mi_id = $ballot_mi_id.'0';	
				}

				 $existingBallotBox = BallotBox::select('id')->whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id=22 and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->first(); 
				 if(!$existingBallotBox){
					 continue;
				 }
				 $insertsArr = [];
				 echo "current row : ".$index."<br/>";
				 /*
				 foreach($partyIDSRplaceArr as $key=>$value){
					//echo $key."-".$value."-".$data[$key]."---<br/>";
					if(!$data[$key]){
						//echo "will NOT insert NULL value ".$data[$key]."<br/>";
					}
					else{
							//echo "ballot id".$existingBallotBox->id."<br/>";
							 $existingPartyList = ElectionCampaignPartyListVotes::where('ballot_box_id',$existingBallotBox->id)->where('election_campaign_party_list_id',$value)->first();
							 if( $existingPartyList ){
								  $existingPartyList->votes = $data[$key];
								  $existingPartyList->save();
								// echo "will UPDATE value of ".$data[$key]. " to party id ".$value."<br/>";
								echo "performed update<br/>";
							}
							  else{
								echo "added insert<br/>";
								 $insertsArr[] = ['key'=>Helper::getNewTableKey('election_campaign_party_list_votes', 10) , 'ballot_box_id'=>$existingBallotBox->id , 'election_campaign_party_list_id'=>$value , 'votes'=>$data[$key]];
								// echo "will INSERT value of ".$data[$key]. " to party id ".$value."<br/>";
							  }
							 
					 
					}
				 }
				 if(count($insertsArr) > 0){
					 ElectionCampaignPartyListVotes::insert($insertsArr);
					 echo "inserted total ".count($insertsArr)." rows<Br/>";
				 }
				 */
				// echo "--------------<br/>";
				 //echo ($valid_votes_count)."<br/>";
				//$mi_voter_count = $data[3];
				//$banned_votes_count = $data[5];
				//$valid_votes_count = $data[6];
			   // BallotBox::whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id=22 and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->update(['mi_voter_count'=>$mi_voter_count,'invalid_votes_count'=>$banned_votes_count,'votes_count'=>$valid_votes_count]) ;
				//echo "inserted row ".$index."<br/>";
			 }
			 $index ++;
		 }
		//echo "total inserts count : ".count($insertsArr);
		fclose($file);
		$jsonOutput->setData("ok");
	}

	public function transferSubAreas() {
		$subAreas = DB::table('SUB_AREAS')->select('ID as id', 'SUB_AREA as name', 'AREA_ID as area_id')->orderBy('id')->get();
		foreach($subAreas as $subArea) {
			$key = $this->getNewKey('sub_areas', 10, Helper::DIGIT + Helper::LOWER);
			$area = DB::table('areas')->select('id')->where('old_id', $subArea->area_id)->first();
			DB::table('sub_areas')->insert([
				'key' => $key,
				'name' => $subArea->name,
				'area_id' => $area->id,
				'old_id' => $subArea->id
			]);
		}
		echo $subAreas;
	}

	public function transferCities() {
		$cities = DB::table('CITIES')->select('ID as id', 'CITY as name', 'SYMBOL_CITY as mi_id', 'AREA_ID as area_id', 'SUB_AREA as sub_area_id')->orderBy('id')->get();
		echo $cities;
		foreach($cities as $city) {
			$key = $this->getNewKey('cities', 10, Helper::DIGIT + Helper::LOWER);
			$area = DB::table('areas')->select('id')->where('old_id', $city->area_id)->first();
			$subArea = DB::table('sub_areas')->select('id')->where('old_id', $city->sub_area_id)->first();
			DB::table('cities')->insert([
				'key' => $key,
				'name' => $city->name,
				'mi_id' => $city->mi_id,
				'area_id' => $area->id,
				'sub_area_id' => ($subArea != null)? $subArea->id : null,
				'old_id' => $city->id
			]);
		}
	}

	public function transferVoters() {
		set_time_limit(0);
		$lastVoter = DB::table('voters_temp')->select('id', 'user_metadata_id')->orderBy('user_metadata_id', 'DESC')->first();
		if ($lastVoter != null) {
			$lastId = $lastVoter->id;
			$offset = $lastVoter->user_metadata_id;
		} else {
			$lastId = 0;
			$offset = 0;
		}
		$limit  = 100000;
		$votersCount = 1;
		while ($votersCount > 0) {
			$metadata = DB::table('voters')->select(
				'id',
				'personal_identity',
				'first_name',
				'last_name',
				'mi_city',
				'mi_neighborhood',
				'mi_street',
				'mi_house',
				'mi_house_entry',
				'mi_flat',
				'mi_mark',
				'mi_zip',
				'city',
				'neighborhood',
				'street',
				'house',
				'house_entry',
				'flat',
				'mark',
				'zip'
				)->orderBy('id')->where('id', '>', $offset)->limit($limit)->get();
			$votersCount = count($metadata);
			foreach($metadata as $voter) {
				if (\File::exists(public_path()."\stop.txt")) {
				    die('stop file');
				}
				$key = $this->getNewKey('voters_temp', 10, Helper::DIGIT + Helper::LOWER);
				DB::table('voters_temp')->insert([
					'key' => $key,
					'personal_identity' => $voter->personal_identity,
					'first_name' => $voter->first_name,
					'last_name' => $voter->last_name,
					'mi_city' => $voter->mi_city,
					'mi_neighborhood' => $voter->mi_neighborhood,
					'mi_street' => $voter->mi_street,
					'mi_house' => $voter->mi_house,
					'mi_house_entry' => $voter->mi_house_entry,
					'mi_flat' => $voter->mi_flat,
					'mi_mark' => $voter->mi_mark,
					'mi_zip' => $voter->mi_zip,
					'city' => $voter->city,
					'neighborhood' => $voter->neighborhood,
					'street' => $voter->street,
					'house' => $voter->house,
					'house_entry' => $voter->house_entry,
					'flat' => $voter->flat,
					'mark' => $voter->mark,
					'zip' => $voter->zip,
					'user_metadata_id' =>$voter->id
					]);
			}
			$offset += $votersCount;
			$lastId += $votersCount;
		}
		
	}
	
	public function transferRealVotesStatsBallots(Request $request){
		$jsonOutput = app()->make( "JsonOutput" );

		$file = fopen(env('FILES_FOLDER') ."/" . 'real_votes_results_2019.csv', "r");
		$election_campaign_id = 22;
		$index = 0;
		 while ($data = fgetcsv($file)) {
			 if($index >= 1){
				//echo ($data[1])."<br/>";
				$city_mi_id=$data[1];
				$ballot_mi_id = $data[2].'';
				 
				if(strpos($ballot_mi_id ,"." ) !== false){
					$ballot_mi_id = str_replace("." , "",$ballot_mi_id);
				}
				else{
					$ballot_mi_id = $ballot_mi_id.'0';	
				}
				$mi_voter_count=  $data[3];
				$banned_votes_count=  $data[5];
				$valid_votes_count=  $data[4];
				 //echo ($valid_votes_count)."<br/>";
				 BallotBox::whereRaw(" mi_id=".$ballot_mi_id ." and  cluster_id in(select id from clusters where election_campaign_id=22 and city_id in (select id from cities where mi_id=".$city_mi_id."))" )->update(['mi_voter_count'=>$mi_voter_count,'invalid_votes_count'=>$banned_votes_count,'votes_count'=>$valid_votes_count]) ;
				echo "updated row ".$index."<br/>";
			 }
			 $index ++;
		 }
		fclose($file);
		$jsonOutput->setData("ok");
	}

	public function insertShasVotesDataFormCsv(Request $request){
        $jsonOutput = app()->make( "JsonOutput" );

		$file = fopen(env('FILES_FOLDER') . 'prev_elections_campaigns_2013.csv', "r");
		$election_campaign_id = 15;
		$partyId = ElectionCampaignPartyLists::select('id')
					->where('election_campaign_id', $election_campaign_id )
					->where('shas', DB::raw(1) ) // Only shas
					->first()->id;
		// dd($partyId);
		$successList = ['new' => [], 'old' => []];
		$failedList = [];
        while ($data = fgetcsv($file)) {
			$city_mi_id = $data[0]; 
			$ballot_mi_id = $data[2];
			$fullBallot_mi_id = strpos($ballot_mi_id, '.') ? str_replace('.', '', $ballot_mi_id) : $ballot_mi_id * 10; 
			$votesCount = $data[5]; 
			// dump($data[1], $city_mi_id, $ballot_mi_id, $fullBallot_mi_id, $votesCount);
			$ballotbox = BallotBox::select('ballot_boxes.id')
			->withCluster()
			->withCity()
			->where('cities.mi_id', $city_mi_id)
			->where('ballot_boxes.mi_id', $fullBallot_mi_id)
			->where('clusters.election_campaign_id', $election_campaign_id)
			->first();
			if($ballotbox){
				$partyListVotes = ElectionCampaignPartyListVotes::where([ 
						'election_campaign_party_list_id' => $partyId,
						'ballot_box_id' => $ballotbox->id ]
				)->first();
				if(!$partyListVotes){
					$successList['new'][] = $ballotbox;
					$partyListVotes = new ElectionCampaignPartyListVotes;
					$partyListVotes->key = Helper::getNewTableKey('election_campaign_party_list_votes', 10);
					$partyListVotes->election_campaign_party_list_id = $partyId;
					$partyListVotes->ballot_box_id = $ballotbox->id;
					// dump('found new', $ballotbox->toArray());
				}else{
					$successList['old'][] = $ballotbox;
					// dump('found old', $ballotbox->toArray());
				}

				$partyListVotes->votes = $votesCount;
				$partyListVotes->save();

			}else{
				$failedList[] = $data;
			}

		}
		fclose($file);
		$jsonOutput->setData(['successList' => $successList, 'failedList' => $failedList]);
	}

		public function createSmallVoterBook() {
		$originalBook = public_path()."\originalBook.txt";
		$originalFile = fopen($originalBook, 'r');
		$i = 0;
		$newFile = true;
		while ( ($fileData = fgets($originalFile)) !== false ) {
			$i++;
			if ($i <= 2594165) continue;
			if ($newFile) {
				$newBook = public_path().'\newProdBook_'.$i.'.txt';
				$newBookHandler = fopen($newBook, 'w');
				$newFile = false;
			}
			fputs($newBookHandler, $fileData);
			if (($i % 500000) == 0) {
				fclose($newBookHandler);
				$newFile = true;
			}
			if ($i == 100000) die();
        }
        fclose($originalFile);
        /*$job = (new \App\Jobs\voterBookJob(new \App\Libraries\VoterBookParser(), 43))->onConnection('redis')->onQueue('voter_book');

        // Executing the job which parses the voter book file
        $this->dispatch($job);*/
	}

	public function shrinkClusters() {
		$clusters = \App\Models\Cluster::leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
					->where('election_campaign_id', 21)
					->whereNull('ballot_boxes.id')
					->get();
		echo count($clusters);
		/*$ballots = \App\Models\BallotBox::select('ballot_boxes.id', 'ballot_boxes.cluster_id', 'clusters.city_id', 'clusters.mi_id')
					->withCluster()
					->where('clusters.election_campaign_id', 21)
					->orderBy('ballot_boxes.id')
					//->limit(100)
					//->skip(200)
					->get();
		echo "count ballots:".count($ballots)."<br>";
		$needFix = 0;
		foreach($ballots as $ballot) {
			$cluster = \App\Models\Cluster::select('id')
						->where('election_campaign_id', 21)
						->where('city_id', $ballot->city_id)
						->where('mi_id', $ballot->mi_id)
						->first();
			//echo $ballot->id.' '.$cluster->id.' '.$ballot->cluster_id.' '.$ballot->city_id.' '.$ballot->mi_id."<br>";
			if ($cluster && ($cluster->id != $ballot->cluster_id)) {
				$needFix++;
				//echo "ballot id ".$ballot->id.' is not with first cluster<br>';
				$ballot->cluster_id = $cluster->id;
				$ballot->save();
			}
			
		}
		echo "count ballot sneed fix:".$needFix;*/
	}

	public function createHouseholdUpdateParts($householdUpdateId) {
		$householdUpdate = \App\Models\HouseholdUpdate::where('id', $householdUpdateId)
							->where('deleted', 0)
							->first();
		if (is_null($householdUpdate)) return;
		$householdUpdate->status = 1;
		$householdUpdate->save();
		$startVoter = \App\Models\Voters::select('id')->orderBy('id', 'ASC')->first();
		$endVoter = \App\Models\Voters::select('id')->orderBy('id', 'DESC')->first();
		$votersCount = $endVoter->id - $startVoter->id +1;
		$partSize = floor($votersCount/$householdUpdate->parts);
		echo $partSize;
		for($i=0; $i<$householdUpdate->parts; $i++) {
			$householdUpdatePart = new \App\Models\HouseholdUpdatePart;
			$householdUpdatePart->key = Helper::getNewTableKey('household_update_parts', 5);
			$householdUpdatePart->household_update_id = $householdUpdate->id;
			if ($i == 0) $startVoterId = $startVoter->id;
			else $startVoterId = (($i * $partSize) + $startVoter->id + 1);
			$householdUpdatePart->start_voter_id = $startVoterId;
			if ($i + 1 < $householdUpdate->parts) $endVoterId = (($i+1) * $partSize) + $startVoter->id;
			else $endVoterId = $endVoter->id;
			$householdUpdatePart->end_voter_id = $endVoterId;
			$householdUpdatePart->save();
		}

	}

	public function startHouseholdJob($partId) {
	    // Getting the job details
        $job = (new \App\Jobs\HouseholdsUpdateJob(new \App\Libraries\HouseholdsUpdateParser(), $partId))->onConnection('redis')->onQueue('household_update');

        // Executing the job which parses the voter book file
        $this->dispatch($job);
		echo $partId;
		die;
	}

	public function transferHouseholdForCaptain() {
		set_time_limit(0);
		$voters = \DB::table('households_with_captains_of_fifty')
							->join('voters', 'voters.household_id', '=', 'households_with_captains_of_fifty.household_id')
							->where('deleted', 0)
							->get(['voters.id', 'captain_id', 'election_campaign_id']);
		foreach($voters as $voter) {
			$voterExists = \DB::table('voters_with_captains_of_fifty')
								->where('election_campaign_id', $voter->election_campaign_id)
								->where('voter_id', $voter->id)
								->first();
			if (!$voterExists) {
				\DB::table('voters_with_captains_of_fifty')->insert([
					'key' => Helper::getNewTableKey('voters_with_captains_of_fifty', 10),
					'election_campaign_id' => $voter->election_campaign_id,
					'voter_id' => $voter->id,
					'captain_id' => $voter->captain_id
				]);
			}
		}
	}

	public function jerusalemNeighborhoods() {
		set_time_limit(0);
		$fileName = public_path().'\jerusalem_neighborhoods.csv';
		$fileHandle = fopen($fileName, 'r');
		$streets = [];
		while (($row = fgetcsv($fileHandle)) !== false) {
			$miId = intval($row[5]);
			if ($miId > 0) $streets[$miId] = trim($row[2]);
		}
		$totalCount = 0;
		foreach($streets as $streetMiId => $neighborhood) {
			echo $streetMiId." - ";
			$voters = \App\Models\Voters::select('voters.id')
						->join('streets', 'streets.id', '=', 'voters.street_id')
						->where('streets.mi_id', $streetMiId)
						->where('streets.city_id', 146)
						->where('voters.city_id', 146)
						->whereNull('neighborhood')
						->get();
			$totalCount += count($voters);
			echo count($voters)." - ".$neighborhood."<br>";

			$historyArgsArr = [
	            'topicName' => 'elections.voter.additional_data.address.edit',
	            'user_create_id' => 1,
	            'models' => []
	        ];

	        $models = [];
	        $votersIds = [];
	        foreach($voters as $voter) {
	        	$votersIds[] = $voter->id;
	        	$model = [
	                'description' => 'עדכון כתובת',
	                'referenced_model' => 'Voters',
	                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
	                'referenced_id' => $voter->id,
	                'valuesList' => [
	                	[
		        	        'field_name' => 'neighborhood',
		                    'display_field_name' => config('history.Voters.neighborhood'),
		                    'old_value' => null,
	                    	'new_value' => $neighborhood
	                	]
                	]
            	];
            	$models[] = $model;
        	}
        	if (count($voters) > 0) {
        		//echo "found voters to change: " . $neighborhood;die();
	        	\App\Models\Voters::whereIn('id', $votersIds)
							->update([
								'neighborhood' => $neighborhood
							]);

		        $historyArgsArr['models'] = $models;
		        ActionController::AddHistoryItem($historyArgsArr);
		        //die();
	    	}
		}
		echo "total count: ".$totalCount;
		fclose($fileHandle);
	}

	public function updateStreets() {
		set_time_limit(0);
		$fileName = public_path().'\streets.csv';
		$fileHandle = fopen($fileName, 'r');
		$newCount = 0;
		$changedCount = 0;
		$i=0;
		$city = null;
		$cityMiIdIndex = 1;
		$streetMiIdIndex = 3;
		$streetNameIndex = 4;
		while (($row = fgetcsv($fileHandle)) !== false) {
			$i++;
			$street = \App\Models\Streets::select('streets.id', 'streets.name', 'cities.name as city_name')
					->join('cities', 'cities.id', '=', 'streets.city_id')
					->where('cities.mi_id', $row[$cityMiIdIndex])
					->where('streets.mi_id', $row[$streetMiIdIndex])
					->where('cities.deleted', 0)
					->where('streets.deleted', 0)
					->orderBy('id', 'asc')
					->first();
			if ($street) {
				$updatedStreetName = trim($row[$streetNameIndex]);
				if ($street->name != $updatedStreetName) {
					echo $street->name."<br>";
					echo $updatedStreetName."<br>";
					$historyArgsArr = [
			            'topicName' => 'system.lists.general.streets.edit',
			            'user_create_id' => 1,
			            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
			            'models' => [
			            	[
				                'description' => 'עדכון רחוב',
				                'referenced_model' => 'Streets',
				                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
				                'referenced_id' => $street->id,
				                'valuesList' => [
				                	[
					        	        'field_name' => 'name',
					                    'display_field_name' => config('history.Streets.name'),
					                    'old_value' => $street->name,
				                    	'new_value' => $updatedStreetName
				                	]
			                	]
			            	]
			            ]
			        ];
					


					$street->name = $updatedStreetName;
					$street->save();
					ActionController::AddHistoryItem($historyArgsArr);
					$changedCount++;
				}
			}  else {
				if (!$city || $city->mi_id != $row[$cityMiIdIndex]) {
					$city = City::where('mi_id', $row[$cityMiIdIndex])->where('deleted', 0)->first();
				}
				if (!$city) continue;
				$streetName = trim($row[$streetNameIndex]);

				$newStreet = new \App\Models\Streets;
				$newStreet->key = Helper::getNewTableKey('streets', 5);
				$newStreet->name = $streetName;
				$newStreet->city_id = $city->id;
				$newStreet->mi_id = $row[$streetMiIdIndex];
				$newStreet->save();

				$historyArgsArr = [
		            'topicName' => 'system.lists.general.streets.add',
		            'user_create_id' => 1,
		            'entity_type' => config('constants.HISTORY_ENTITY_TYPE_CSV_FILE'),
		            'models' => [
		            	[
			                'description' => 'עדכון רחוב',
			                'referenced_model' => 'Streets',
			                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
			                'referenced_id' => $newStreet->id,
			                'valuesList' => [
			                	[
				        	        'field_name' => 'name',
				                    'display_field_name' => config('history.Streets.name'),
			                    	'new_value' => $streetName
			                	],
			                	[
				        	        'field_name' => 'city_id',
				                    'display_field_name' => config('history.Streets.city_id'),
			                    	'new_value' => $newStreet->city_id
			                	],
			                	[
				        	        'field_name' => 'mi_id',
				                    'display_field_name' => config('history.Streets.mi_id'),
			                    	'new_value' => $newStreet->mi_id
			                	]
		                	]
		            	]
		            ]
		        ];

				ActionController::AddHistoryItem($historyArgsArr);
				$newCount++;
			}
		}
		echo "total new count: ".$newCount."<br>";
		echo "total changed count: ".$changedCount."<br>";
		fclose($fileHandle);		
	}

	public function getCsv() {
		header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=test.csv");
		for($i=0; $i<10; $i++) {
			$voters = \App\Models\Voters::select('id', 'personal_identity','first_name', 'last_name')
					->where('id', '>=', $i*10)
					->limit(10)
					->get();
			foreach($voters as $voter) {
				$row = $voter->id.",".$voter->personal_identity.",".$voter->first_name.",".$voter->last_name."\n";
				$row = mb_convert_encoding($row, "ISO-8859-8","UTF-8");
				echo $row;
			}
		}
	}

	public function getHouseholdCount() {
		$start = time();
		$clusters = \App\Models\Voters::select('clusters.id', 'ballot_boxes.id as ballot_box_id', DB::raw('count(distinct voters.household_id) as household_count'))
						->join('voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id' ,'=', 'voters.id')
						->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
						->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
						->where('voters_in_election_campaigns.election_campaign_id', 21)
						->orderBy('clusters.id')
						->groupBy('ballot_boxes.id')
						->get();
		$end = time();
		echo ($end - $start)."<br>";
		/*foreach($clusters as $cluster) {
			echo $cluster->id." ".$cluster->ballot_box_id." ".$cluster->household_count."<br>";
		}*/
		echo count($clusters);
	}

	public function testPdfMerger() {
		$tofes1 = public_path()."\\tofes1000-1539931510.pdf";
		$tofes2 = public_path()."\\tofes1000-1539931523.pdf";	
		$tofes3 = public_path()."\\tofes1000-1539931532.pdf";
		$tofes4 = public_path()."\\tofes1000-1539931544.pdf";	

		// Create an instance of PDFMerger
        $pdf = new PDFMerger();

        // Add 2 PDFs to the final PDF
        $pdf->addPDF($tofes1, 'all');
        $pdf->addPDF($tofes2, 'all');
        $pdf->addPDF($tofes3, 'all');
        $pdf->addPDF($tofes4, 'all');

        // Generate download of "mergedpdf.pdf"
        $pdf->merge('download', "mergedpdf.pdf");
	}

	public function generateBallotActivists() {
		$existingBallots = \App\Models\ElectionRolesGeographical::select('entity_id')
									->withElectionRolesByVoters(true)
									->where('election_campaign_id', 21)
									->get();
		$ballots = \App\Models\BallotBox::select('ballot_boxes.id')
								->withCluster()
								->whereNotNull('ballot_box_role_id')
								->where('clusters.election_campaign_id', 21)
								->whereNotIn('ballot_boxes.id', $existingBallots)
								->limit(2000)
								->get();
		$voters = \App\Models\VoterElectionCampaigns::select('voter_id')
							->where('election_campaign_id', 21)
							->skip(10000)
							->limit(2000)
							->get();
		$i=0;
		foreach($ballots as $ballot) {
			$activist = new \App\Models\ElectionRolesByVoters;
			$activist->key = Helper::getNewTableKey('election_roles_by_voters', 5);
			$activist->election_campaign_id = 21;
			$activist->voter_id = $voters[$i]->voter_id;
			$activist->election_role_id = 8;
			$activist->phone_number = "05".Helper::random(8, Helper::DIGIT);
			$activist->sum = 120;
			$activist->verified_status = 2;
			$activist->vote_reporting_key = mt_rand(1,9).Helper::random(9, Helper::DIGIT);
			$activist->user_create_id = 1;
			$activist->user_update_id = 1;
			$activist->save();
			
			$geo = new \App\Models\ElectionRolesGeographical;
			$geo->key = Helper::getNewTableKey('election_role_by_voter_geographic_areas', 10);
			$geo->election_role_by_voter_id = $activist->id;
			$geo->entity_type = 4;
			$geo->entity_id = $ballot->id;
			$geo->election_role_shift_id = mt_rand(1,3);
			$geo->save();
			$i++;

		}
	}

	public function slaveTest() {
		$secondary = DB::connection('slave1')->getPdo();
	    DB::setReadPdo($secondary);

		DB::connection('slave1')->enableQueryLog();
		$voters = \App\Models\Voters::select("*")
						->with(['phones' => function($query) {
							//var_dump($query->getConnection());
							//$query->on('slave1');
						}])->limit(10000)->skip(1000)->get();
		var_dump(DB::connection('slave1')->getQueryLog());
	}

	public function sendIvrMessage() {
		$activists = \App\Models\ElectionRolesByVoters::select([
			'election_roles_by_voters.id',
			'phone_number',
			'voters.first_name',
			'voters.last_name',
			'ballot_boxes.mi_id'
		])->withVoter()
			->WithElectionRoleGeographical(false)
			->where('election_role_by_voter_geographic_areas.entity_type', 4)
			->whereIn('election_role_shift_id',[1,3])
			->join('ballot_boxes', 'ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id')
			->get();
		$count = 0;
		foreach($activists as $activist) {
			
			if (Helper::isKosherPhone($activist->phone_number)) {
				if ($count > 0) {
					$ballotMiId = (strlen($activist->mi_id) == 1)? $activist->mi_id : substr_replace($activist->mi_id, ".", strlen($activist->mi_id)-1, 0);
					$message = "פָּעִיל יָקָר, בַּדַּקּוֹת הַקְּרוֹבוֹת יַחֵל פיילוט המדמה אֶת יוֹם הַבְּחִירוֹת - מִס' הַקַּלְפִּי בָּהּ אַתָּה מֻצָּב [ballot_number], פָּעַל לְפִי הַהַנְחָיוֹת שֶׁתְּקַבֵּל, קַּלְפִּי [ballot_number], קַּלְפִּי [ballot_number]";
					$message = str_replace("[ballot_number]", $ballotMiId, $message);
					$recipients[$activist->phone_number] = $message;
					echo $activist->id." ".$activist->phone_number." ".$activist->mi_id." ".$ballotMiId."<br>";
					if (Ivr::send("0544492776", $message, IvrConst::TYPE_DEFAULT)) echo "ok<br>";
					else echo "fail<br>";
				}
				$count++;
				if ($count == 100) die();
			}
		}
		//Ivr::sendArray($recipients, IvrConst::TYPE_DEFAULT);
		echo $count;

	}

	public function fixHousehold() {
		$newHouseholdId = DB::table("households")->insertGetId(["household" => 1]);
		echo $newHouseholdId;die();
		$voterFields = [
        	'id',
        	'last_name',
        	'household_id',
        	'city',
        	'city_id',
        	'street',
        	'street_id',
        	'house',
        	'flat'
        ];

		$households = \App\Models\Voters::select("household_id", DB::raw("COUNT(DISTINCT voters.last_name) AS count_last_name"))
								->groupBy('household_id')
								->having("count_last_name", ">", 1)
								->limit(10)
								->get();
		$i = Redis::get();
		foreach($households as $household) {
			echo $household->household_id." => ";
	        $voter = \App\Models\Voters::select($voterFields)
	        			->where('household_id', $household->household_id)
	        			->orderBy('id')
	        			->first();
	        if (is_null($voter)) return;
	        
	        $householdVoters = \App\Models\Voters::select('id', 'household_id')
	        					->where('id', '!=', $voter->id)
	        					->where('last_name', $voter->last_name)
	        					->where(function($query) use ($voter) {
	        						$query->orWhere(function($query) use($voter) {
	        							$query->where('city_id', 0)
	        								->where('city', $voter->city);
	        						});
	        						$query->orWhere(function($query) use ($voter) {
	        							$query->where('city_id', '>', 0)
	        								->where('city_id', $voter->city_id);
	        						});
	        					})
	        					->where('street', $voter->street)
	        					->where('street_id', $voter->street_id)
	        					->where('house', $voter->house)
	        					->where('flat', $voter->flat)
	        					->get();

	        $differentHousholdId = false;
	        $householdIdUpdated = false;
	        $totalVoters = [$voter];
	        $votersIds = [$voter->id];
	        foreach($householdVoters as $householdVoter) {
	        	if ($householdVoter->household_id != $voter->household_id) $differentHousholdId = true;
	        	$votersIds[] = $householdVoter->id;
	        	$totalVoters[] = $householdVoter;
	        }
	        $householdNewId = 0;
	        if ($differentHousholdId) {
	        	$householdNewId = $this->updateHousehold($totalVoters, $votersIds);
	        	$householdIdUpdated = true;
	        } else {
	        	$leftMembersInHousehold = \App\Models\Voters::select('id')
	        								->where('household_id', $voter->household_id)
	        								->whereNotIn('id', $votersIds)
	        								->get();
	        	if (count($leftMembersInHousehold) > 0) {
	        		$householdNewId = $this->updateHousehold($totalVoters, $votersIds);
	        		$householdIdUpdated = true;
	        	}
	        }

		    if (!$householdIdUpdated) {
		        \App\Models\Voters::whereIn('id', $votersIds)
		        			->update([
		        				'household_update' => 1
        			]);
	        }
	        $i++;
	        Redis::hset('fix_houshold_updates', $household->household_id, $householdNewId);
	        Redis::set("fixhousehold_updates_count", $i);
		}
	}

	private function updateHousehold($totalVoters, $votersIds) {
		$newHouseholdId = \App\Models\Voters::select('household_id')
							->orderBy('household_id', 'DESC')
							->first()->household_id + 1;
		echo $newHouseholdId."<br>";
	    $historyArgsArr = [
            'topicName' => 'elections.household_update.execute',
            'user_create_id' => 1,
            'models' => []
        ];
        $models = [];
        foreach($totalVoters as $voter) {
        	$model = [
                'description' => 'עדכון מספר בית אב',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voter->id,
                'valuesList' => [
                	[
	        	        'field_name' => 'household_id',
	                    'display_field_name' => config('history.Voters.household_id'),
	                    'old_value' => $voter->household_id,
	                    'new_value' => $newHouseholdId
	                ]
                ]
            ];
            $models[] = $model;
        }
        \App\Models\Voters::whereIn('id', $votersIds)
      			->update([
      				'household_id' => $newHouseholdId,
      			]);

        $historyArgsArr['models'] = $models;
        ActionController::AddHistoryItem($historyArgsArr);
        return $newHouseholdId;
	}

	public function updatedFinal() {
		$voters = DB::table('voter_support_status')
					->select('id','voter_id','support_status_id')
					->where('election_campaign_id', 21)
					->where('entity_type', 0)
					->whereIn('support_status_id',[1,2])
					->where(DB::raw("voter_id not in (select voter_id from voter_support_status where election_campaign_id = 21 and entity_type = 2)"))
					->get();
		echo count($voters);

	}

	public function fixHouseholdSupportUpdate() {
		$households = DB::select(DB::raw("select 
	`household_id`, 
	sum(case when voter_support_status.support_status_id = 1 then 1 when voter_support_status.support_status_id = 2 then 1 else 0 end) as count_support, 
    count(voters.id) as count_voters 
from `voters`
left join `voter_support_status` on `voter_support_status`.`voter_id` = `voters`.`id` and `voter_support_status`.`election_campaign_id` = 21 and voter_support_status.entity_type = 0
where voters.id in (
select voters.id
    from voters
    inner join `voters_in_election_campaigns` on `voters_in_election_campaigns`.`voter_id` = `voters`.`id`
inner join `ballot_boxes` on `ballot_boxes`.`id` = `voters_in_election_campaigns`.`ballot_box_id`
inner join `clusters` on `clusters`.`id` = `ballot_boxes`.`cluster_id`
inner join `cities` on `cities`.`id` = `clusters`.`city_id`
    where cities.id = 146 and voters_in_election_campaigns.election_campaign_id = 21
)
group by `household_id`
having `count_support` > 0 and count_voters > 1"));
		$housholdIds = array();
		foreach($households as $household) {
			$housholdIds[] = $household->household_id;
		}

		$voters = \App\Models\Voters::select('voters.id','voters.personal_identity', 'voter_support_status.support_status_id')
										->leftJoin('voter_support_status', function($query) {
											$query->on('voter_support_status.voter_id', '=', 'voters.id')
											->on('voter_support_status.election_campaign_id', DB::raw(21))
											->on('voter_support_status.entity_type', DB::raw(0));
										})
										->where(function($query) {
											$query->orWhere('voter_support_status.support_status_id', DB::raw(3))
											->orWhere('voter_support_status.support_status_id', DB::raw(5))
											->orWhereNull('voter_support_status.support_status_id');
										})
										->whereIn('household_id', $housholdIds)
										->limit(100)
										->get();
		echo count($voters)."<br>";

		foreach($voters as $voter) {
			$historyArgsArr = [
	            'topicName' => 'elections.household_support_status_change.execute',
	            'user_create_id' => 1,
	            'models' => []
	        ];
        	$changedValues = [];
			echo $voter->id." => ".$voter->support_status_id."<br>";
			    if(is_null($voter->support_status_id)){

                    $newVoterSupportStatus = new \App\Models\VoterSupportStatus;
                    $newVoterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
                    $newVoterSupportStatus->election_campaign_id = 21;
                    $newVoterSupportStatus->voter_id = $voter->id ;
                    $newVoterSupportStatus->entity_type = 0;
                    $newVoterSupportStatus->support_status_id = 2;//supporter
                    $newVoterSupportStatus->create_user_id = 1;//dror vomberg
                    $newVoterSupportStatus->save();

                    $supportStatusFields = [
                        'election_campaign_id',
                        'voter_id',
                        'entity_type',
                        'support_status_id'
                    ];

                    for ( $fieldIndex = 0; $fieldIndex < count($supportStatusFields); $fieldIndex++ ) {
                        $fieldName = $supportStatusFields[$fieldIndex];

                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                            'new_numeric_value' => $newVoterSupportStatus->{$fieldName}
                        ];
                    }

                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'VoterSupportStatus',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                        'referenced_id' => $newVoterSupportStatus->id,
                        'valuesList' => $changedValues
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
                }
                else{

                    $voterSupportStatus = \App\Models\VoterSupportStatus::where([
                    			'voter_id' => $voter->id,
                    			'election_campaign_id' => 21,
                    			'entity_type' => 0
                    		])->first();

                    $oldValue = $voterSupportStatus->support_status_id;

                    if ( $oldValue != 2 ) {
                    	$voterSupportStatus->support_status_id = 2;//supporter
                    	$voterSupportStatus->save();
                        $historyArgsArr['models'][] = [
                            'referenced_model' => 'VoterSupportStatus',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $voterSupportStatus->id,
                            'valuesList' => [
                                [
                                    'field_name' => 'support_status_id',
                                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                                    'old_numeric_value' => $oldValue,
                                    'new_numeric_value' => $voterSupportStatus->support_status_id
                                ]
                            ]
                        ];

                         ActionController::AddHistoryItem($historyArgsArr);
                    }
                }

		}
	}

	public function testRand() {
		$numbers = [
			1 => 30,
			2 => 70
		];
		$firstCount = 0;
		$secondCount = 0;
		for ($i=0; $i<10000; $i++) {
			$result = Helper::randWeight($numbers);
			if ($result == 1) $firstCount++;
			else $secondCount++;
		}
		echo $firstCount." ".$secondCount;
	}

	public function deleteDoubleVotes() {
		$originalBook = public_path()."\double_votes_2.csv";
		$originalFile = fopen($originalBook, 'r');
		$i = 0;
		$newFile = true;
		while ( ($fileData = fgetcsv($originalFile)) !== false ) {
			$i++;
			$voterId = $fileData[0];
			$votes = \App\Models\Votes::select('id')
									->where('voter_id', $voterId)
									->where('election_campaign_id', 21)
									->get();

			$duplicateIds = [];
			for($j=1;$j<count($votes); $j++) {
				$duplicateIds[] = $votes[$j]->id;
			}
			echo $voterId."=>".count($votes)."=>".count($duplicateIds)."<br>";
			if (count($duplicateIds) > 0) \App\Models\Votes::whereIn('id', $duplicateIds)->delete();
        }
        fclose($originalFile);		
	}

	public function deleteVotes() {
		$originalBook = public_path()."\\no_vote_beitar.csv";
		$originalFile = fopen($originalBook, 'r');
		$i = 0;
		$j = 0;
		$newFile = true;
		$voterPersonalIdentityIds = [];
		while ( ($fileData = fgetcsv($originalFile)) !== false ) {
			$i++;
			if ($i == 1) continue;
			$voterPersonalIdentityIds[] = ltrim($fileData[0], "0");
			/*$votes = \App\Models\Votes::select('id')
									->where('voter_id', $voterId)
									->where('election_campaign_id', 21)
									->get();

			$duplicateIds = [];
			for($j=1;$j<count($votes); $j++) {
				$duplicateIds[] = $votes[$j]->id;
			}
			echo $voterId."=>".count($votes)."=>".count($duplicateIds)."<br>";
			if (count($duplicateIds) > 0) \App\Models\Votes::whereIn('id', $duplicateIds)->delete();*/
        }
       	$voters = \App\Models\Voters::select('id')->whereIn('personal_identity', $voterPersonalIdentityIds)->get();
       	foreach($voters as $voter) {
				//echo $voter->id."<br>";
			$vote = \App\Models\Votes::select('id')
							->where('voter_id', $voter->id)
							->where('election_campaign_id', 21)
							->first();
			if ($vote) {
				echo $vote->id."<br>";
				\App\Models\Votes::where('id', $vote->id)->delete();
				$j++;
			}      		
       	}
        echo $j;
        fclose($originalFile);		
	}

	public function voterCount() {
		$data = \App\Models\BallotBox::select(
				'clusters.id as cluster_id',
				'ballot_boxes.id as ballot_box_id',
				'ballot_boxes.reporting',
				DB::raw('count(viec.id) as voter_count')
				)
				->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
				->join('voters_in_election_campaigns as viec', function($query) {
					$query->on('viec.ballot_box_id', '=', 'ballot_boxes.id')
					->on('clusters.election_campaign_id', '=', 'viec.election_campaign_id');
				})
				->where('viec.election_campaign_id', 21)
				->groupBy('cluster_id')
				->groupBy('ballot_box_id')
				->orderBy('cluster_id')
				->orderBy('ballot_box_id')
				->get();

		$currentClusterId = 0;
		$currentClusterVotersCount = 0;
		$currentClusterReportingVotersCount = 0;

		$currentBallotBoxId = 0;
		$currentBallotBoxCount = 0;
		foreach($data as $row) {
			if ($row->ballot_box_id != $currentBallotBoxId) {
				if ($currentBallotBoxId != 0) {
					\App\Models\BallotBox::where('id', $currentBallotBoxId)
						->update([
							'voter_count' => $currentBallotBoxCount
						]);
				}
				echo $currentClusterId." ".$currentClusterVotersCount." ".$currentClusterReportingVotersCount." ".$row->reporting." ".$currentBallotBoxCount."<br>";
				$currentBallotBoxId = $row->ballot_box_id;
				$currentBallotBoxCount = 0;
			}

			if ($row->cluster_id != $currentClusterId) {
				if ($currentClusterId != 0) {
					\App\Models\Cluster::where('id', $currentClusterId)
						->update([
							'voter_count' => $currentClusterVotersCount,
							'reporting_ballot_voter_count' => $currentClusterReportingVotersCount

						]);
				}
				echo $currentClusterId." ".$currentClusterVotersCount." ".$currentClusterReportingVotersCount." ".$row->reporting." ".$currentBallotBoxCount."<br>";
				$currentClusterId = $row->cluster_id;
				$currentClusterVotersCount = 0;
				$currentClusterReportingVotersCount = 0;			
			}
			if ($row->reporting) $currentClusterReportingVotersCount += $row->voter_count;
			$currentClusterVotersCount += $row->voter_count;

			$currentBallotBoxCount += $row->voter_count;
		} 
	}

	public function voterSupporterCount() {
		$data = \App\Models\BallotBox::select(
				'clusters.id as cluster_id',
				'ballot_boxes.id as ballot_box_id',
				'ballot_boxes.reporting',
				DB::raw('count(viec.id) as voter_supporter_count')
				)
				->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
				->join('voters_in_election_campaigns as viec', function($query) {
					$query->on('viec.ballot_box_id', '=', 'ballot_boxes.id')
					->on('clusters.election_campaign_id', '=', 'viec.election_campaign_id');
				})
				->join('voter_support_status as vss', function($query) {
					$query->on('vss.voter_id', '=', 'viec.voter_id')
						->on('vss.election_campaign_id', '=', 'viec.election_campaign_id');
				})
				->where('viec.election_campaign_id', 21)
				->where('vss.entity_type', 2)
				->whereIn('vss.support_status_id', [1,2])
				->groupBy('cluster_id')
				->groupBy('ballot_box_id')
				->orderBy('cluster_id')
				->orderBy('ballot_box_id')
				->get();

		$currentClusterId = 0;
		$currentClusterVotersCount = 0;
		$currentClusterReportingVotersCount = 0;

		$currentBallotBoxId = 0;
		$currentBallotBoxCount = 0;		
		foreach($data as $row) {
			if ($row->ballot_box_id != $currentBallotBoxId) {
				if ($currentBallotBoxId != 0) {
					\App\Models\BallotBox::where('id', $currentBallotBoxId)
						->update([
							'voter_support_count' => $currentBallotBoxCount
						]);
				}
				echo $currentClusterId." ".$currentClusterVotersCount." ".$currentClusterReportingVotersCount." ".$row->reporting." ".$currentBallotBoxCount."<br>";
				$currentBallotBoxId = $row->ballot_box_id;
				$currentBallotBoxCount = 0;
			}

			if ($row->cluster_id != $currentClusterId) {
				if ($currentClusterId != 0) {
					\App\Models\Cluster::where('id', $currentClusterId)
						->update([
							'voter_support_count' => $currentClusterVotersCount,
							'reporting_ballot_voter_support_count' => $currentClusterReportingVotersCount

						]);
				}
				echo $currentClusterId." ".$currentClusterVotersCount." ".$currentClusterReportingVotersCount." ".$row->reporting." ".$currentBallotBoxCount."<br>";
				$currentClusterId = $row->cluster_id;
				$currentClusterVotersCount = 0;
				$currentClusterReportingVotersCount = 0;			
			}
			if ($row->reporting) $currentClusterReportingVotersCount += $row->voter_supporter_count;
			$currentClusterVotersCount += $row->voter_supporter_count;

			$currentBallotBoxCount += $row->voter_supporter_count;
		} 
	}

	public function transferVotersWithCaptain() {
		$voters = \App\Models\VoterCaptainFifty::select([
							'voters_with_captains_of_fifty.voter_id',
							'voters_with_captains_of_fifty.captain_id'

						])
						->join('voters_in_election_campaigns', function($query) {
							$query->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
							->on('voters_in_election_campaigns.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
						})
						->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
						->join('clusters','clusters.id', '=', 'ballot_boxes.cluster_id')
						->where('voters_with_captains_of_fifty.election_campaign_id', 21)
						->where('clusters.city_id', 67)
						->where('voters_with_captains_of_fifty.deleted', 0)
						->groupBy('voter_id')
						->groupBy('captain_id')
						->get();
		echo count($voters)."<br>";
		$missing = 0;
		foreach($voters as $voter) {
			$existingVoter = \DB::connection('muni')
				->table('voters_with_captains_of_fifty')
				->where('voter_id', $voter->voter_id)
				->where('captain_id', $voter->captain_id)
				->where('election_campaign_id', 21)
				->first();
			if ($existingVoter == null) {
				\DB::connection('muni')
					->table('voters_with_captains_of_fifty')
					->insert([
						'key' => Helper::getNewTableKey('voters_with_captains_of_fifty', 10),
						'voter_id' =>$voter->voter_id,
						'captain_id' => $voter->captain_id,
						'election_campaign_id' => 21
					]);
				$missing++;
				//die();
			}
		}
		echo "missing: ".$missing;
	}

	public function jerusalemBallots() {
		$originalBook = public_path()."\\jerusalem_ballots.csv";
		$originalFile = fopen($originalBook, 'r');
		$i = 0;
		$j = 0;
		$newFile = true;
		while ( ($fileData = fgetcsv($originalFile)) !== false ) {
			$miId = $fileData[0];
			if (strpos($miId, ".") > 0) $miId = str_replace(".", "", $miId);
			else $miId .= "0";
			echo $miId."<br>";
			$ballotBox = \App\Models\BallotBox::select('ballot_boxes.id')
							->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
							->where('clusters.election_campaign_id', 21)
							->where('clusters.city_id', 146)
							->where('ballot_boxes.mi_id', $miId)
							->first();
			if ($ballotBox) {
				echo "exists<br>";
				DB::table('jerusalem_ballots')
						->insert([
							'ballot_box_id' => 	$ballotBox->id
						]);
			}
			$voterPersonalIdentityIds[] = ltrim($fileData[0], "0");
        }
        fclose($originalFile);			
	}





	public function fileRowCount() {
		$fileLocation = public_path()."\\voter_book_8.txt";
		$file = fopen($fileLocation, 'r');
		$i = 0;
		while ( ($fileData = fgets($file)) !== false ) {
			$i++;
		}
		fclose($file);
		echo "count: ".$i;
	}

	public function moveTmVoterSupport() {
		$voterSupport = VoterSupportStatus::where('entity_type', 1)
											->where('election_campaign_id', 21)
											->get();
		echo count($voterSupport);
		foreach($voterSupport as $support) {
			$support->election_campaign_id = 22;
			$support->save();
		}
	}

	public function getSipStatus() {
		$sips = Redis::keys("tm:sip_numbers:*");
		forEach($sips as $sip) {
			$sipInfo = Redis::hgetall($sip);
			$sipNumber = substr($sip, -4);
			echo $sipNumber."-> "."Campaign: ".$sipInfo['campaign_id']." Status: ".$sipInfo['status']."<br>";
		}
	}

	public function importBallotRoles() {
		$roles = [
			'חבר' => 3,
			'יור' => 1,
			'סגן' => 2,
			'משקיף' => 4,
			'סופר' => 5
		];
		$fileLocation = public_path()."\\ballot_roles.csv";
		$file = fopen($fileLocation, 'r');
		$i = 0;
		$countBad = 0;
		while ( ($fileData = fgetcsv($file)) !== false ) {
			$i++;
			if ($i <= 1) continue;
			$ballotBoxMiId = (substr($fileData[1],-2,1) == '.')? str_replace(".", "",$fileData[1]) : $fileData[1]*10;
			$ballotBox = BallotBox::select('ballot_boxes.id', 'ballot_boxes.ballot_box_role_id')
									->withCluster()
									->join('cities', 'clusters.city_id', '=', 'cities.id')
									->where('ballot_boxes.mi_id', $ballotBoxMiId)
									->where('clusters.election_campaign_id', 22)
									->where('cities.mi_id', $fileData[0])
									->first();
			if ($ballotBox) {
				if (!$ballotBox->ballot_box_role_id) {
					$ballotBox->ballot_box_role_id = $roles[$fileData[2]];
					$ballotBox->save();
				}
				echo $fileData[0]."-".$ballotBoxMiId.":".$ballotBox->id." ".$ballotBox->ballot_box_role_id."<br>";
			} else {
				echo $fileData[0]."-".$ballotBoxMiId.": not exists<br>";
				$countBad++;
			}
		}
		echo "Count Bad: ".$countBad;
		fclose($file);		
	}

	public function updateVssFromCallNotes() {
		$voters = \App\Models\Tm\Call::select('calls.voter_id', 'calls.user_id', 'call_notes.support_status_id')
								->join('call_notes', 'call_notes.call_id', 'calls.id')
								->leftJoin('voter_support_status', function($query) {
									$query->on('voter_support_status.voter_id', 'calls.voter_id')
										->on('voter_support_status.entity_type', DB::raw(1))
										->on('voter_support_status.election_campaign_id', DB::raw(22));
								})
								->whereNotNull('call_notes.support_status_id')
								->whereNull('voter_support_status.id')
								->orderBy('call_notes.id', 'DESC')
								->get();
		echo count($voters);
		foreach ($voters as $voter) {
			$support = VoterSupportStatus::select('id')
							->where('entity_type', 1)
							->where('election_campaign_id', 22)
							->where('voter_id', $voter->voter_id)
							->first();
			if ($support) echo "voter: ".$voter->voter_id. " has TM support<br>";
			else {
				echo "voter: ".$voter->voter_id. " does not have TM support<br>";
				$newVss = new VoterSupportStatus;
				$newVss->key = $this->getNewKey('voter_support_status', 10, Helper::DIGIT + Helper::LOWER + Helper::UPPER);
				$newVss->voter_id = $voter->voter_id;
				$newVss->election_campaign_id = 22;
				$newVss->entity_type = 1;
				$newVss->support_status_id = $voter->support_status_id;
				$newVss->create_user_id = $voter->user_id;
				$newVss->save();
				//die();

			}
		}
	}

	public function updateCallNotesWithTmSupport() {
		$voters = VoterSupportStatus::select('voter_support_status.voter_id', 
												'voter_support_status.support_status_id',
												'voter_support_status.updated_at',
												'voter_support_status.create_user_id', 
												DB::raw('count(call_notes.support_status_id) as count_notes'))
										->join('calls', function($query) {
											$query->on('calls.voter_id', 'voter_support_status.voter_id')
											->on('calls.call_end_status', DB::raw('0'))
											->on(DB::raw('ABS(TIMESTAMPDIFF(SECOND, calls.updated_at, voter_support_status.updated_at))'), '<=' ,DB::raw('1'));
										})
										->leftJoin('call_notes', 'calls.id', 'call_notes.call_id')
										->where('voter_support_status.entity_type', 1)
										->where('voter_support_status.election_campaign_id', 22)
										//->where(DB::raw('ABS(TIMESTAMPDIFF(SECOND, calls.updated_at, voter_support_status.updated_at)) < 100000'))
										//->whereNull('call_notes.support_status_id')
										->having('count_notes', '=' ,0)
										->groupBy('voter_support_status.voter_id')
										->get();
		echo count($voters)."<br>";
		$i=0;
		$j=0;
		foreach($voters as $voter) {
			$i++;
			$calls = \App\Models\Tm\Call::select('id', 'user_id' ,'updated_at')
										->where('call_end_status', 0)
										->where('user_id', $voter->create_user_id)
										->where('voter_id', $voter->voter_id)
										->get();
			foreach($calls as $call) {
				$callDate = Carbon::parse($call->updated_at);
				$voterDate = Carbon::parse($voter->updated_at);
				$diff = abs($callDate->diffInSeconds($voterDate));
				echo "Support: ".$voterDate," - Call: ".$callDate." Call user: ".$call->user_id." support user: ".$voter->create_user_id." Diff: ".$diff."<br>";
				if ($diff <= 1) {
					$j++;
					//echo "Support: ".$voterDate," - Call: ".$callDate." Call user: ".$call->user_id." support user: ".$voter->create_user_id." Diff: ".$diff."<br>";
					$callNote = \App\Models\Tm\CallNote::select('id', 'support_status_id')
														->where('call_id', $call->id)
														->first();
					if ($callNote) {
						if (!$callNote->support_status_id) \App\Models\Tm\CallNote::where('id', $callNote->id)
										->update([
											'support_status_id' =>  $voter->support_status_id
										]);
						echo "Call id: ".$call->id." call note support: ".$callNote->support_status_id."<br>";
					} else {
						$data = [
				            'key' => Helper::getNewTableKey('call_notes', 10),
				            'call_id' => $call->id,
				            'support_status_id' =>  $voter->support_status_id,
				        ];
				        \App\Models\Tm\CallNote::insert($data);
					}
				}
			}
			if ($i == 1000) {
				echo $j;
				die();
			}
		}
	}

	public function addHouseholdIdToWaitingVoters(Request $request){
        $campaignId = $request->input('campaign_id');
        if(!$campaignId){
            die( 'campaign is required!');
            return;
        }
        $updatedArray = [];
        $notUpdatedArray = [];
        $waitingPhonesRedisKey = 'tm:campaigns:' . $campaignId . ':waiting_phones:*';
        $redisCallKeys = Redis::keys($waitingPhonesRedisKey);
        foreach ($redisCallKeys as $redisCallKey) {
            $redisCallData = json_decode(Redis::get($redisCallKey));
            if(!empty($redisCallData->household_id)){ 
                $notUpdatedArray[$redisCallKey] = $redisCallData->household_id;
                continue; 
            }

            $voter = Voters::select('household_id')
            ->where('voters.id', $redisCallData->id)->first();
            $household_id = $voter->household_id;
            $redisCallData->household_id = $household_id;
            Redis::set($redisCallKey, json_encode($redisCallData));
            $updatedArray[$redisCallKey] = $household_id;
        }
        echo 'updatedArray: ' .implode(",",$updatedArray)."<br>";
        echo 'notUpdatedArray: '.implode(",",$notUpdatedArray)."<br>";
    }

    public function fixCallAudioFiles() {
    	$calls = \App\Models\Tm\Call::select('id', 'sip_server_key', 'audio_file_name')
    								->where('created_at', '<', '2019-13-18')
    								->whereNotNull('sip_server_key')
    								->whereNull('audio_file_name')
    								->get();
    	echo count($calls)."<br>";
    	foreach ($calls as $call) {
    		$file = "https://calls.shass.co.il/".$call->sip_server_key.".wav";
			$file_headers = @get_headers($file);
			if($file_headers[0] == 'HTTP/1.1 404 Not Found') {
			    $exists = "false";
			}
			else {
				$call->audio_file_name = $call->sip_server_key.".wav";
				$call->save();
			    $exists = "true";
			}
			echo "file: ".$file." - ".$exists."<br>";
    	}
    }

    public function splitLog() {
		$fileLocation = public_path()."\\laravel.log";
		$newFileLocation = public_path()."\\laravel.new.log";
		$file = fopen($fileLocation, 'r');
		$newFile = fopen($newFileLocation, 'w');
		$i = 0;
		$start = false;
		while ( ($fileData = fgets($file)) !== false ) {
			$i++;
			if (strpos($fileData, "2019-03-17 17:") > 0) $start = true;
			if ($start) fwrite($newFile, $fileData);;
		}
		fclose($file);
		fclose($newFile);
		echo "count: ".$i;
	}

	public function actualAddressUpdateDate() {
		set_time_limit(0);
		$voters = DB::table('action_history')->select('action_history.referenced_id', 'action_history.created_at')
						->join('action_history_details', 'action_history.id' ,'=', 'action_history_details.action_history_id')
						->where('action_history.referenced_model', 'voters')
						->where(function($query) {
							$query->orWhere('action_history_details.field_name', 'city')
							->orWhere('action_history_details.field_name', 'street')
							->orWhere('action_history_details.field_name', 'house')
							->orWhere('action_history_details.field_name', 'house_entry')
							->orWhere('action_history_details.field_name', 'flat')
							->orWhere('action_history_details.field_name', 'zip');
						})
						->groupBy('action_history.referenced_id', 'action_history.created_at')
						->orderBy('action_history.created_at', 'desc')
						->get();
		foreach($voters as $voter) {
			$voterWithDate = DB::table('voters')->whereNotNull('actual_address_update_date')->where('id', $voter->referenced_id)->first();
			if (!$voterWithDate) {
				DB::table('voters')->where('id', $voter->referenced_id)
				->update([
					'actual_address_update_date' => $voter->created_at
				]);
			}
		}
	}

	public function getKosherPhones() {
		$activists = \App\Models\ElectionRolesByVoters::select([
			//'election_roles_by_voters.id',
			DB::raw('distinct phone_number'),
			//'election_role_by_voter_geographic_areas.election_role_shift_id as election_role_shift'
		])->WithElectionRoleGeographical(false)
			->where('election_role_by_voter_geographic_areas.entity_type', 4)
			->whereIn('election_role_by_voter_geographic_areas.election_role_shift_id', [3])
			/*->where(function($query) {
				$query->orWhereNull('election_role_by_voter_geographic_areas.arrival_date')
					->orWhere('election_role_by_voter_geographic_areas.correct_reporting', 0);
			})*/
			//->whereNull('election_role_by_voter_geographic_areas.arrival_date')
			->where('election_role_by_voter_geographic_areas.correct_reporting', 0)
			//->WithElectionRoleGeographical(false)
			//->where('election_role_by_voter_geographic_areas.entity_type', 4)
			//->whereIn('election_role_shift_id',[2])
			//->join('ballot_boxes', 'ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id')
			/*->join('clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id')
			->join('cities', 'cities.id', '=', 'clusters.city_id')
			->where('cities.name', 'ירושלים')*/
			->get();
		$list = [];
		foreach($activists as $activist) {
			if (Helper::isKosherPhone($activist->phone_number)) {
				echo $activist->phone_number."<br>";
				$list[] = $activist;
			}
		}
		echo count($list);
	}


	public function clearReportingForSub20() {
		$ballotBoxes = ballotbox::select(DB::raw('distinct ballot_boxes.id'))
									->join('voters_in_election_campaigns as viec', 'ballot_boxes.id', '=', 'viec.ballot_box_id')
									->join('votes', function($query) {
										$query->on('votes.voter_id', '=', 'viec.voter_id')
											->on('votes.election_campaign_id', '=', 'viec.election_campaign_id');
									})
									->where('viec.election_campaign_id', 22)
									->where('ballot_boxes.reporting', 1)
									->where('ballot_boxes.hot', 1)
									->groupBy('ballot_boxes.id')
									->having(DB::raw('count(votes.id)'), '<=', 50)
									->get();
		echo count($ballotBoxes);

		/*$support = VoterSupportStatus::select(DB::raw("count(id)"))
									->join('voters_in_election_campaigns as viec', function($query) {
										$query->on('viec.voter', 'voter_support_status.voter_id')
												->
									})*/
		foreach($ballotBoxes as $ballotBox) {
			BallotBox::where('id', $ballotBox->id)
					->update([
						'reporting' => 0
					]);
		}
		
	}
	// i put this in comment because this function is duplicate
	/*
	public function loadVotes(Request $request, $fileName) {
		set_time_limit(0);
		$secondary = DB::connection('master')->getPdo();
	    DB::setReadPdo($secondary);
        //get current campaign
        $currentCampaign =  ElectionCampaigns::currentCampaign();
        //get degel vote source
        $voteSource = VoteSources::select('id')
                            ->where('system_name', 'degel')
                            ->first();

		$fileName = public_path().'/'.$fileName;
		$fileHandle = fopen($fileName, 'r');
		$startFrom = 0;
		//if ($fileName == "allday_3.txt") $startFrom = 168082;
		//else if ($fileName == "allday_4.txt") $startFrom = 158600;
		$i=0;
		while ( ($fileData = fgetcsv($fileHandle)) !== false  ) {
			if (\File::exists(public_path()."/stop.txt")) {
				   die('stop file');
			}
			$i++;
			echo $i."\r\n";
			$cityMiId = $fileData[0];
			$ballotMiId = $fileData[1];
			$voterSerialNumber = $fileData[2];
			$date = $fileData[3];
			//echo $cityMiId."-".$ballotMiId."-".$voterSerialNumber."-".$date;
			$voter = VotersInElectionCampaigns::select('voters_in_election_campaigns.voter_id',
                                                            'ballot_boxes.id as ballot_box_id')
                            ->withBallotCluster()
                            ->join('cities', 'cities.id', '=', 'clusters.city_id')
                            ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id)
                            ->where('cities.mi_id', $cityMiId)
                            ->where('ballot_boxes.mi_id', $ballotMiId)
                            ->where('voters_in_election_campaigns.voter_serial_number', $voterSerialNumber)
                            ->first();
                if ($voter) {
                    
                    //get existing vote
                    $vote = Votes::select('id')
                                ->where('election_campaign_id', $currentCampaign->id)
                                ->where('voter_id', $voter->voter_id)
                                ->first();
                    if (!$vote) {

                        //create new vote
                        Votes::insert([
                            'key' => Helper::getNewTableKey('votes', 10),
                            'voter_id' => $voter->voter_id,
                            'election_campaign_id' => $currentCampaign->id,
                            'vote_date' => $date,
                            'vote_source_id' => $voteSource->id
                        ]);

                        //update ballotbox to reporting if not set
                        BallotBox::where('id', $voter->ballot_box_id)
                                    ->where('reporting', 0)
                                    ->update([
                                        'reporting' => 1
                                    ]);
                    }
                }
        }
        fclose($fileHandle);		
	}
	*/
	

	public function loadVotes(Request $request, $fileName) {
		set_time_limit(0);

        //get current campaign
        $currentCampaign =  ElectionCampaigns::currentCampaign();
        //get degel vote source
        $voteSource = VoteSources::select('id')
                            ->where('system_name', 'degel')
                            ->first();

		$fileName = public_path().'/'.$fileName;
		$fileHandle = fopen($fileName, 'r');
		$i=0;
		while ( ($fileData = fgetcsv($fileHandle)) !== false  && $i < 1000) {
			$i++;
			$cityMiId = $fileData[0];
			$ballotMiId = $fileData[1];
			$voterSerialNumber = $fileData[2];
			$date = $fileData[3];
			echo $cityMiId."-".$ballotMiId."-".$voterSerialNumber."-".$date;
			$voter = VotersInElectionCampaigns::select('voters_in_election_campaigns.voter_id',
                                                            'ballot_boxes.id as ballot_box_id')
                            ->withBallotCluster()
                            ->join('cities', 'cities.id', '=', 'clusters.city_id')
                            ->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign->id)
                            ->where('cities.mi_id', $cityMiId)
                            ->where('ballot_boxes.mi_id', $ballotMiId)
                            ->where('voters_in_election_campaigns.voter_serial_number', $voterSerialNumber)
                            ->first();
                if ($voter) {
                    
                    //get existing vote
                    $vote = Votes::select('id')
                                ->where('election_campaign_id', $currentCampaign->id)
                                ->where('voter_id', $voter->voter_id)
                                ->first();
                    if (!$vote) {

                        //create new vote
                        Votes::insert([
                            'key' => Helper::getNewTableKey('votes', 10),
                            'voter_id' => $voter->voter_id,
                            'election_campaign_id' => $currentCampaign->id,
                            'vote_date' => $date,
                            'vote_source_id' => $voteSource->id
                        ]);

                        //update ballotbox to reporting if not set
                        BallotBox::where('id', $voter->ballot_box_id)
                                    ->where('reporting', 0)
                                    ->update([
                                        'reporting' => 1
                                    ]);
                    }
                }
        }
        fclose($fileHandle);		
	}

	private function getNewKey($table, $length = 10, $dataType = 7) {
		do {
			$key = Helper::random($length, $dataType);
			$row = DB::table($table)->select('id')->where('key', $key)->first();
		} while ($row != null);
		return $key;
	}
	public function deleteEmptyBallots(){
	$emptyBallots =	BallotBox::select([
			'ballot_boxes.id',
			DB::raw('(COUNT(viec.id)) AS viec_cnt')
		])
		->join('clusters', 'clusters.id','=', 'ballot_boxes.cluster_id')
		->leftJoin('voters_in_election_campaigns as viec',function($q){
			$q->on( 'viec.ballot_box_id','=', 'ballot_boxes.id')
			->on('viec.election_campaign_id', '=', DB::raw(22));
		})
		->where('clusters.election_campaign_id', '=', 22)
		->groupBy('ballot_boxes.id')
		->having('viec_cnt', '=' , '0')
		->get();
		// dd($emptyBallots->toArray());
		$deletedBallots = [];
		$notDeletedBallots = [];
		foreach ($emptyBallots as $ballot){
			$ballotVoters = VotersInElectionCampaigns::select('id')
			->where('voters_in_election_campaigns.ballot_box_id', $ballot->id)
			->where('voters_in_election_campaigns.election_campaign_id', '=', DB::raw(22))
			->first();
			$ballotId = $ballot->id;
			if(!$ballotVoters){
				$ballot->delete();
				$deletedBallots[$ballotId] = $ballotId;
				dump('deletedBallots' ,$ballotId, $ballotVoters);
			}else{
				$notDeletedBallots[$ballotId] = $ballotId;
				dump('notDeletedBallots' ,$ballotId, $ballotVoters);
			}
		}
		dd($deletedBallots,$notDeletedBallots);
	}
	public function exportAreasGeoArraiveData(){
		ini_set('memory_limit', '-1');
		$jsonOutput = app()->make("JsonOutput");
		$jsonOutput->setBypass(true);

        header("Content-Type: application/txt");
		header("Content-Disposition: attachment; filename=export.csv");
		
		$allGeoQuery = 'SUM(CASE WHEN geo.id IS NOT NULL THEN 1 ELSE 0 END)';
		$arrivalGeoQuery = 'SUM(CASE WHEN geo.arrival_date IS NOT NULL THEN 1 ELSE 0 END)';
		$fields = [
			'areas.name AS אזור',
			'cities.name AS עיר',
			DB::raw("$allGeoQuery AS `שיבוצים`"),
			DB::raw("$arrivalGeoQuery AS `דיווחו הגעה`"),
			DB::raw('SUM(CASE WHEN geo.arrival_date IS NULL THEN 1 ELSE 0 END) AS `לא דיווחו הגעה`'),
			DB::raw('SUM(CASE WHEN geo.correct_reporting = 1 THEN 1 ELSE 0 END) AS `דיווחו נכון`'),
			DB::raw("CONCAT(($arrivalGeoQuery/$allGeoQuery)*100,'%')  AS `אחוזי התייצבות`"),
		];
		$areasArrivalData = ElectionRolesByVoters::select($fields)
		->join('election_role_by_voter_geographic_areas as geo' ,'geo.election_role_by_voter_id', 'election_roles_by_voters.id')
		->join('cities' ,'cities.id', 'election_roles_by_voters.assigned_city_id')
		->join('areas' ,'areas.id', 'cities.area_id')
		->join('ballot_boxes', function ( $joinOn ) {
			$joinOn->on([
				['ballot_boxes.id', '=', 'geo.entity_id'],
				['geo.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))],
			]);
		})
		->where('election_roles_by_voters.election_campaign_id', 22)
		->where('ballot_boxes.hot', 1)
		->whereIn('geo.election_role_shift_id', [1,3])
		->groupBy('areas.id')
		->groupBy('cities.id')
		->orderBy('areas.name')
		->orderBy('cities.name')
		->get();

		$titleRow = implode(',', array_keys($areasArrivalData[0]->toArray()));

		$titleRowPrint = mb_convert_encoding($titleRow, "ISO-8859-8", "UTF-8") . "\n";
		echo $titleRowPrint;

		foreach($areasArrivalData as $areaArrivalData){
                $fullRow = implode(',', $areaArrivalData->toArray());
				$rowToPrint =  mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
				echo $rowToPrint;
		}

		// dd($areasArrivalData->toArray());
	}
	public function updateClustersMiIdByName(){
		ini_set('memory_limit', '-1');
		$jsonOutput = app()->make("JsonOutput");
		// Need to define election campaign id, according to file election campaign
		$electionCampaignId =19;
		$citiesFileLocation = env('FILES_FOLDER')."\\ballots_2015.csv"; 
		$citiesFile = fopen($citiesFileLocation, 'r');
		$i = 0;
		$clusterIdHash = [];
		$clusterWrongIdHash = [];
		while ( ($fileData = fgets($citiesFile)) !== false ) {

			$encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
        	$utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
			$csvData = str_getcsv($utf8Data);
			if( $i==0) {  $i++; dump($csvData); continue;}

			$ballotMiId = str_replace('.', '', $csvData[8])  . '0';

			$city = City::select('id','name')->where('mi_id', $csvData[4])->first();
			$ballot = BallotBox::select(
					'ballot_boxes.mi_id', 'ballot_boxes.id',
					'clusters.id as cluster_id', 'clusters.mi_id as cluster_mi_id',
					'cities.id as city_id', 'cities.mi_id as city_mi_id'
				)
			->withCluster()->withCity()->where([
				'ballot_boxes.mi_id' => $ballotMiId,
				'cities.id' => $city->id,
				'clusters.election_campaign_id' => $electionCampaignId,
			])
			->first();
			$cluster_id = isset($ballot->cluster_id) ? $ballot->cluster_id :null;
			// dump($ballotMiId, $cluster_id, $city->id, $city->name);

			if($ballot && $cluster_id && !isset($clusterIdHash[$cluster_id])){
				$new_cluster_mi_id = $csvData[9];
				$ballot->new_cluster_mi_id = $new_cluster_mi_id;
				$clusterIdHash[$cluster_id] = $ballot;
				Cluster::where(['id' => $cluster_id, 'city_id' => $city->id, 'election_campaign_id' => $electionCampaignId])
				->update(['mi_id' => $ballot->new_cluster_mi_id]);
				dump('cluster_updated_date:', $city->toArray(), $ballot->toArray());
			}
			if(!$ballot || !$ballot->cluster_id){
				$clusterWrongIdHash[$cluster_id] = $ballot;
			}
			$i++;
		}
		fclose($citiesFile);
		$jsonOutput->setData([
			'clusterIdHash' => $clusterIdHash,
			'clusterWrongIdHash' => $clusterWrongIdHash
		]);
	}

	public function resetWaitingVoters(Request $request, $campaignId) {
		$voters = Redis::keys("tm:campaigns:".$campaignId.":waiting_phones:*");
		forEach($voters as $voterKey) {
			$voterInfo = json_decode(Redis::get($voterKey));
			echo $voterInfo->id."<br>";
			DB::table('telemarketing_voter_phones')
				->where('campaign_id', $campaignId)
				->where('voter_id', $voterInfo->id)
				->delete();
			Redis::del($voterKey);
			// $sipInfo = Redis::hgetall($sip);
			// $sipNumber = substr($sip, -4);
			// echo $sipNumber."-> "."Campaign: ".$sipInfo['campaign_id']." Status: ".$sipInfo['status']."<br>";
		}
	}
	public function setAllVoterNumericKey(){
		ini_set('memory_limit', '-1');
		// $skipRows = 0;
		$limitRows = 100000;
		do {
			
			$stopFileExist = file_exists(storage_path( '/app/stop.txt'));
			if(!$stopFileExist) { 
				$jsonOutput = app()->make("JsonOutput");
				$jsonOutput->setData('stop');
				return;
			}
			$votersArray = Voters::select('voters.id')
								->orderBy('voters.id')
								// ->skip($skipRows)
								->take($limitRows)
								->whereRaw("not voters.key REGEXP '^[0-9]{10}$'")
								->get();
								// $skipRows += $limitRows;
			foreach($votersArray as $voterRow){
				$newNumericKey = Helper::getNewTableKey('voters', 10, 1, true);
				Voters::where('id', $voterRow->id)
				->update(['key' => $newNumericKey]); 
				echo 'voter_id:' . $voterRow->id .' key: ' . $newNumericKey . " <br>";;
			}
		} while (count($votersArray) > 0);
	}
	public function loadVotersInstitutionsFile (){
		$fileLocation = storage_path( 'app/INSTITUTIONS.csv'); 
		$votersInstitutionsFile = fopen($fileLocation, 'r');
		$i = 0;
		$existList = [];
		$newExistList = [];
		$newList = [];
		$defaultInstitutionGroupTypeId = 15; // global group type
		$defaultInstitutionType = 26; // global type
		$defaultCityId = 146; // ירושלים
		$defaultInstitutionRoleType = 70; // global

		while ( ($fileData = fgets($votersInstitutionsFile)) !== false ) {
			$i++;
			$stopFileExist = file_exists(storage_path( 'app/stop.txt'));
			if(!$stopFileExist) { 
				$jsonOutput = app()->make("JsonOutput");
				$jsonOutput->setData('stop');
				return;
			}
			
			$encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
        	$utf8Data = mb_convert_encoding($fileData, "UTF-8", $encoding);
			$voterData = str_getcsv($utf8Data);
			if($i == 0) {  $i++; dump($voterData); continue;}
			$institutionName = trim($voterData[0]);
			$institutionTypeName = trim($voterData[1]);
			$institutionCityName = trim($voterData[2]);
			$voter_personal_identity = trim($voterData[3]);

			$voter =  Voters::select('id', 'first_name', 'last_name')
			->where('personal_identity', $voter_personal_identity)
			->first();
			if($voter){
				$city_id = $defaultCityId;
				$institution_type_id = null;

				$tempInstitution = Institutes::select('id', 'name', 'institute_type_id', 'city_id')
				->where('name', $institutionName)
				->where('deleted', DB::raw(0));
				if(!empty($institutionCityName)){
					$city = City::select('id')
					->where('name', $institutionCityName)
					->first();
					if($city){
						$city_id = $city->id;
						$tempInstitution->where('city_id', $city_id);
					}
				}
				if(!empty($institutionTypeName)){
					$institutionType = InstituteTypes::select('id')
					->where('name', $institutionTypeName)
					->first();
	
					if($institutionType) {
						$institute_type_id = $institutionType->id;
					} else {
						$newInstituteTypes = new InstituteTypes;
						$newInstituteTypes->institute_group_id = $defaultInstitutionGroupTypeId ;
						$newInstituteTypes->name = $institutionTypeName ;
						$newInstituteTypes->key =  Helper::getNewTableKey('institute_types', 5 );
						$newInstituteTypes->save();
						$institute_type_id = $newInstituteTypes->id;
					}
					$tempInstitution->where('institute_type_id', $institute_type_id );

				} else {
					// $institute_type_id = $defaultInstitutionTypeId;

				}

				$tempInstitution = $tempInstitution->first();

				if($tempInstitution){
					$instituteRolesByVoter = InstituteRolesByVoters::where('voter_id', $voter->id)
					->where('institute_id', $tempInstitution->id)->first();
					if($instituteRolesByVoter){
						echo($i . 'exist:'. $instituteRolesByVoter->id) ."<br>";
						continue;
					}
					$institute_id = $tempInstitution->id;
				} else {
					$newInstitute = new Institutes;
					$newInstitute->key =  Helper::getNewTableKey('institutes', 5 );
					$newInstitute->name =  $institutionName;
					$newInstitute->city_id =  $city_id;
					$newInstitute->institute_type_id = $institute_type_id;
					$newInstitute->save();
					$institute_id = $newInstitute->id;
				} 

				$newInstituteRolesByVoters = new InstituteRolesByVoters;
				$newInstituteRolesByVoters->institute_id = $institute_id;
				$newInstituteRolesByVoters->voter_id = $voter->id;
				$newInstituteRolesByVoters->institute_role_id = $defaultInstitutionRoleType;
				$newInstituteRolesByVoters->save();

				echo $i .'newInstituteRolesByVoters'. $newInstituteRolesByVoters->id .' ' . $voter->id .'institute_id '. $institute_id ."<br>";

			}

		}
	}

	/* 
		fixVotersBallotAllocation 
		fix allocation of voters by voters book rows
		-> Not working perfect - not update all voters
	*/
	public function fixVotersBallotAllocation(){
		$skip = 0;
		$limitRows = 100000;
		do {
			$stopFileExist = file_exists(storage_path( '/app/stop.txt'));
			if(!$stopFileExist) { 
				$jsonOutput = app()->make("JsonOutput");
				$jsonOutput->setData('stop');
				return;
			}
			$VoterBookRows = VoterBookRows::select('voter_id', 'ballot_box_city_id', 'ballot_box_mi_id')
			->where('voter_books.election_campaign_id', DB::raw(24))
			->withVoterBook()
			->skip($skip )
			->take($limitRows)
			->get();

            $i = $skip;
			foreach($VoterBookRows as $row){
                $i ++;
				$ballot = BallotBox::select('ballot_boxes.id')
				->join('clusters', 'clusters.id', 'ballot_boxes.cluster_id')
				->where('ballot_boxes.mi_id', $row->ballot_box_mi_id)
                ->where('clusters.city_id', $row->ballot_box_city_id)
                ->where('clusters.election_campaign_id', DB::raw(24))
				->first();


				if(!$ballot) {
					Log::info( $i .' ballot-not exist: '. $row->voter_id .
					' VoterBookRows' . $row->ballot_box_city_id .' '. $row->ballot_box_mi_id );
					continue;
				}

				$VotersInElectionCampaign = VotersInElectionCampaigns::where('voter_id', $row->voter_id)
				->where('election_campaign_id', DB::raw(24))->first();

				$VotersInElectionCampaign->ballot_box_id = $ballot->id;
				$VotersInElectionCampaign->save();

				 Log::info( $i . ' ballot'. $VotersInElectionCampaign->id .' '.$row->voter_id .
				 $ballot->id.' VoterBookRows' . $row->ballot_box_city_id . ' '. $row->ballot_box_mi_id );
            }
			$skip += $limitRows;
            
		} while (count($VoterBookRows) > 0);

	}
	public function defineBankBranches(){
		$file = fopen( storage_path( '\app\banks_branches_israel.csv'), "r");
		$index = 0;
		$bankHashTable = [];
		while ($data = fgetcsv($file)) {
			$index++;
			if($index == 1){
				continue;
			}
			$bankNumber = $data[0];
			$bankName = $data[1];
			$branchNumber = $data[2];
			$branchName = $data[3];
			if(!isset($bankHashTable[$bankNumber])){
				$bankHashTable[$bankNumber] = [];
				$bankHashTable[$bankNumber]['name'] = "$bankName ($bankNumber)" ;
				$bankHashTable[$bankNumber]['branches'] = [];
			}
			$currentBranch = [
				'id' => $branchNumber,
				'name' => "$branchName ($branchNumber)" ,
			];
			$bankHashTable[$bankNumber]['branches'] [] = $currentBranch;
		}
		echo(json_encode($bankHashTable));
		die;
	}
	public function updateBallotsRoles(){
		$file = fopen( storage_path( 'app/observers_2020_02_19.csv'), "r");

		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;
		$i = 0;
		while ($data = fgetcsv($file)) {
			$i++;
			if($i == 1){
				continue;
			}
			$ballot_mi_id = $data[1] * 10;
			$ballot = BallotBox::select('ballot_boxes.id as ballot_id', 'ballot_boxes.mi_id as ballot_mi', 'cities.mi_id as city_mi','cities.name')
			->withCluster()
			->withCity()
			->where('clusters.election_campaign_id' , $last_campaign_id)
			->where('ballot_boxes.mi_id' , $ballot_mi_id)
			->where('cities.mi_id' , $data[0])
			->first();
			dump($data);
			if($ballot){
				BallotBox::where('id',$ballot->ballot_id)
				->update(['ballot_box_role_id' => DB::raw(4)]);
				dump($ballot->toArray());
			}else{
				dump('not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			}
		}

	}

	public function defineBallotsIronNumbers(){
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;

		$file = fopen( storage_path( 'app/ballot_iron_numbers.csv'), "r");
		$i = 0;
		while ($data = fgetcsv($file)) {
			$i++;
			if($i == 1){
				continue;
			}

			$ballot_mi_id = $data[2] * 10;
			$currentBallot = BallotBox::select('ballot_boxes.id as ballot_id')
							->withCluster()	
							->withCity()	
							->where('ballot_boxes.mi_id', $ballot_mi_id)
							->where('clusters.election_campaign_id', $last_campaign_id)
							->where('cities.mi_id', $data[1])
							->first();

							dump($data, $currentBallot? $currentBallot->toArray() : 'not found!!!!!');
							if($currentBallot){
								BallotBox::where('id', $currentBallot->ballot_id)
								->update(['mi_iron_id' => $data[0]]);
							}

		}
	}
	public function exportFileToPdfByBallot(){
		$fileLocation = storage_path( 'app/ballots.csv'); 
		$file = fopen($fileLocation, 'r');
		$currentBallotId = null;
		$prevBallotId = null;
		$headers = [];
		$i = 0;
		while ($data = fgetcsv($file)) {
			$i++;
			if($i == 1){
				$headers = $data;
				continue;
			}
			dump($i, $data);

			$currentBallotId = $data[0];
			$filePath = storage_path( "app/ballots/ballot_$currentBallotId.csv");

			if($currentBallotId != $prevBallotId){
				$newFile = fopen($filePath, 'w');
				 fwrite($newFile, '');
				file_put_contents ($filePath, implode(',', $headers));
			}
			$newContent = file_get_contents($filePath ) ."\n". implode(',', $data);
			file_put_contents ($filePath, $newContent );
			$prevBallotId = $data[0];
		}
		die;
	}
	public function removeTwoStepAuthenticationToKosherUsers(){
		$users = \App\Models\User::with(['phones' => function ($query) {
			$query->addSelect(['id', 'user_id', 'phone_number'])
				->where('deleted', 0);
		}])->get();
		$LoginController = new \App\Http\Controllers\Auth\LoginController();
		foreach($users as $user){
			$hasOnlyIvrPhone = false;
			$userPhone = $LoginController->getUserPhone($user->phones, $hasOnlyIvrPhone);
			$isKosher = Helper::isKosherPhone($userPhone);
			dump($user->id, $isKosher, $userPhone);
			if($isKosher){
				$user->two_step_authentication = 0;
				$user->save();
			}
		}
		dd($users->toArray());

	}
	/* Start calculatePrevBallotsHourlyVotes*/
	public function calculatePrevBallotsHourlyVotes(){
		$ballotBoxesHash = []; $clustersHash = [];
		
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;


		$prevCampaign = ElectionCampaigns::previousCampaign();
		$prev_campaign_id = $prevCampaign->id;

		$this->prevCampaignId = $prev_campaign_id;

        $ballotVotesData = Votes::select(
            	'ballot_boxes.reporting as ballot_box_reporting',
				'clusters.id as cluster_id','ballot_boxes.id as ballot_box_id',
				DB::raw('Hour(IFNULL(votes.vote_date,votes.created_at)) as current_hour'),
				DB::raw('count(votes.id) as hour_count')
			   )
			->join('voters_in_election_campaigns' , function($joinOn) use($last_campaign_id){
				$joinOn->on('voters_in_election_campaigns.election_campaign_id' ,'='  , DB::raw($last_campaign_id))
				->on('voters_in_election_campaigns.voter_id' ,'=', 'votes.voter_id');
			})
			->withCluster()
			->where('votes.election_campaign_id' , $prev_campaign_id)
			// ->where('votes.created_at','>','2019-04-09 07:00:00')//Need to update this hour
			// ->where('ballot_boxes.hot', 1)
			->orderBy('cluster_id', 'asc')
			->orderBy('ballot_box_id', 'asc')
			->orderBy('current_hour', 'asc')
			->groupBy('cluster_id')
			->groupBy('ballot_box_id')
			->groupBy('current_hour')
			->get();


			//*************************************************************************** */

			$whereList= [
				['support_status.level', '>' , 0],
				['vssFinal.deleted' , 0],
				['votes.election_campaign_id' , $prev_campaign_id],
				// ['ballot_boxes.hot', 1]
			];
			//* Supports
			$ballotSupportsVotesData = Votes::select(
				'clusters.id as cluster_id','ballot_boxes.id as ballot_box_id',
				'ballot_boxes.reporting as ballot_box_reporting',
				DB::raw('Hour(IFNULL(votes.vote_date,votes.created_at)) as current_hour'),
				DB::raw('count(votes.id) as hour_count')
			   )
			->join('voters_in_election_campaigns' , function($joinOn) use($last_campaign_id){
				$joinOn->on('voters_in_election_campaigns.election_campaign_id' ,'='  , DB::raw($last_campaign_id))
				->on('voters_in_election_campaigns.voter_id' ,'=', 'votes.voter_id');
			})
			->withCluster()
			->withFinalSupportStatus()
			->where($whereList)
			// ->where('votes.created_at','>','2019-04-09 07:00:00') //Need to update this hour
			->orderBy('cluster_id', 'asc')
			->orderBy('ballot_box_id', 'asc')
			->orderBy('current_hour', 'asc')
			->groupBy('cluster_id')
			->groupBy('ballot_box_id')
			->groupBy('current_hour')
			->get();

			dump( json_encode($ballotSupportsVotesData[0]->toArray()));
			
				// log::info($ballotSupportsVotesData->toSql());
		
				$this->updateHashData($ballotBoxesHash, $clustersHash, $ballotVotesData, 'reported_votes_count');
				$this->updateHashData($ballotBoxesHash, $clustersHash, $ballotSupportsVotesData, 'reported_supporters_votes_count');
				$ballotEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
				$clusterEntityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
				// dump('ballotBoxesHash', json_encode($ballotBoxesHash[0] ));
				// dump('clustersHash', json_encode($clustersHash[0]) );
				// die;
				foreach($ballotBoxesHash as $ballotId => $ballotVotesCountObj){
					  $this->insertHoursVotesForEntity($ballotVotesCountObj, $ballotEntityType, $ballotId);
				}
			  
				foreach($clustersHash as $clusterId => $clusterVotesCountObj){
					$this->insertHoursVotesForEntity($clusterVotesCountObj, $clusterEntityType, $clusterId);
				}

	}
	private function updateHashData(&$ballotBoxesHash, &$clustersHash, $ballotVotesData, $field){
		foreach($ballotVotesData as $row){ 
			$currentBallotId = $row->ballot_box_id;
			$currentClusterId = $row->cluster_id;
	
			if(empty($ballotBoxesHash[$currentBallotId])){ //Check if ballot exist in ballot hash table
				$ballotBoxesHash[$currentBallotId] = [];
		   }
			if(empty($clustersHash[$currentClusterId])){//Check if cluster exist in ballot hash table
				 $clustersHash[$currentClusterId] = [];
			}
			//Insert fields data acording to the ballotVotesData ("$field" is the field in DB)
			$votesCountByHour = $row->hour_count;
			$currentHour = $row->current_hour ;
	
			if(empty($ballotBoxesHash[$currentBallotId][$currentHour] )){
				$ballotBoxesHash[$currentBallotId][$currentHour] = ['reported_votes_count' => 0,'reported_supporters_votes_count' => 0];
			}
			if(empty($clustersHash[$currentClusterId][$currentHour] )){
				$clustersHash[$currentClusterId][$currentHour] = [
					'reported_votes_count' => 0,
					'reported_supporters_votes_count' => 0,
					'reporting_ballot_reported_votes_count' => 0,
					'reporting_ballot_reported_supporters_votes_count' => 0
				];
			}
			if(!empty($row->ballot_box_reporting)){
				$clustersHash[$currentClusterId][$currentHour]["reporting_ballot_$field"] +=$votesCountByHour;
			}
			$ballotBoxesHash[$currentBallotId][$currentHour][$field] = $votesCountByHour;
			$clustersHash[$currentClusterId][$currentHour][$field] += $votesCountByHour;
		}

	}
	private function insertHoursVotesForEntity($hoursCountObj, $entityType, $entityId){
		foreach($hoursCountObj as $currentHour => $hourRowCount){
			if($currentHour == 'total' || empty($currentHour)){continue;}
	
			$reportedHourlyVotes = ReportedHourlyVotes::select('id')
			->where('hour', $currentHour)
			->where('entity_type', $entityType)
			->where('entity_id', $entityId)
			->where('election_campaign_id', $this->prevCampaignId)
			->first();
			if($reportedHourlyVotes){
				$reportedHourlyVotes->updated_at = Carbon::now()->toDateTimeString();
			}else{
				$reportedHourlyVotes = new ReportedHourlyVotes;
				$reportedHourlyVotes->election_campaign_id = $this->prevCampaignId;
				$reportedHourlyVotes->entity_type = $entityType;
				$reportedHourlyVotes->entity_id = $entityId;
				$reportedHourlyVotes->hour = $currentHour;
			}
			$reportedHourlyVotes->reported_votes_count = $hourRowCount['reported_votes_count'];
			$reportedHourlyVotes->reported_supporters_votes_count = $hourRowCount['reported_supporters_votes_count'];
			if($entityType == config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')){
				$reportedHourlyVotes->reporting_ballot_reported_votes_count = $hourRowCount['reporting_ballot_reported_votes_count'];
				$reportedHourlyVotes->reporting_ballot_reported_supporters_votes_count =$hourRowCount['reporting_ballot_reported_supporters_votes_count'];
			}
			dump($reportedHourlyVotes->toArray());
	
			$reportedHourlyVotes->save();
		}
	}
	
	/* End calculatePrevBallotsHourlyVotes*/
	public function updateLandPhonesForAllHousehold(){
		$currentCampaign = ElectionCampaigns::currentCampaign();
		$last_campaign_id = $currentCampaign->id;

		$whereList = [
			'vssFinal.support_status_id' => DB::raw(58),
		];
		// $LandPhoneList =['02','03','04','09','08'];
		$landPhoneWhereLikeQuery = '( land_phone_number.phone_number LIKE "02%" OR land_phone_number.phone_number LIKE "03%" OR land_phone_number.phone_number LIKE "04%" OR land_phone_number.phone_number LIKE "08%" OR land_phone_number.phone_number LIKE "09%")';
		$voters = Voters::select('voters.id as voter_id' , 'land_phone_voter.household_id', 'voters.key', 'voters.personal_identity', 'land_phone_number.phone_number')
		->withFinalSupportStatus($last_campaign_id, false)
		->leftJoin('voter_phones', function($joinOn)  {
			$joinOn->on('voters.id', '=', 'voter_phones.voter_id');
				// ->on('voter_phones.wrong', DB::raw(0));
		})
		->join('voters as land_phone_voter','land_phone_voter.household_id', 'voters.household_id')
		->join('voter_phones as land_phone_number', function($joinOn)  {
			$joinOn->on('land_phone_voter.id', '=', 'land_phone_number.voter_id')
				->on('land_phone_number.wrong', DB::raw(0));
		})
		->where($whereList)
		->whereRaw($landPhoneWhereLikeQuery)
		->whereNull('voter_phones.phone_number')
		->groupBy('voter_id')
		->get();
		$filePath = storage_path( "app/voters_land_phones_new.csv");
		dump(count($voters));
		foreach($voters as $voter){
			$voterData = [$voter->voter_id, $voter->household_id, $voter->personal_identity , $voter->phone_number];
			dump($voterData);
			$newVoterPhone = new VoterPhone;
			$newVoterPhone->phone_number = $voter->phone_number;
			$newVoterPhone->voter_id = $voter->voter_id;
			$newVoterPhone->key = Helper::getNewTableKey('voter_phones', 10);
			$newVoterPhone->phone_type_id = 2;
			$newVoterPhone->save();
			dump($newVoterPhone->toArray());

			// $newContent = file_get_contents($filePath ) ."\n". implode(',', $voterData);
			// 		file_put_contents ($filePath, $newContent );
		}
	}
		/* End calculatePrevBallotsHourlyVotes*/
		public function updateVotersPhones(){
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$last_campaign_id = $currentCampaign->id;
			$i = 0;
			$filePath = storage_path( "app/all_phones.csv");
			$file = fopen($filePath, 'r');

			$j = 0;
			$r=0;
			while ($data = fgetcsv($file)) {
				$pid = $data[0];
				$phone_number = $data[1];
				$i++;
				if($i == 1){
					continue;
				}
				$voter = Voters::select('voters.id as voter_id' , 'voters.personal_identity', 'voter_phones.phone_number' ,'voter_phones.wrong')
				->leftJoin('voter_phones', function($joinOn)  {
					$joinOn->on('voters.id', '=', 'voter_phones.voter_id')
						->on('voter_phones.wrong', DB::raw(0));
				})
				->where('voters.personal_identity', $pid)
				// ->whereNull('voter_phones.phone_number')
				->first();
				
				// if((!$voter->phone_number || $voter->wrong) && $phone_number != $voter->phone_number ){
					if($voter){
						if(is_null($voter->phone_number)){
							$j ++;
							$newVoterPhone = new VoterPhone;
							$newVoterPhone->phone_number = $phone_number;
							$newVoterPhone->voter_id = $voter->voter_id;
							$newVoterPhone->key = Helper::getNewTableKey('voter_phones', 10);
							$newVoterPhone->phone_type_id = 2;
							$newVoterPhone->save();
							dump($j. ' - '. json_encode($newVoterPhone->toArray()));
						}else{
							dump('total:' . $i . ' '.  $voter->phone_number . ' '. $pid);
						}
					}else{
						$r++;
						dump('Not exist ' .$r);
					}


				// }
					
				}
			}
			public function updateCitiesAreas(){
				$filePath = storage_path( "app/cities_areas_08-03-2020.csv");
				$file = fopen($filePath, 'r');
				$i = 0;
				while ($data = fgetcsv($file)) {
					dump($data);
					$i++;
					if($i == 1){ continue; }

					$city_mi_id = $data[3];
					$city = City::where('mi_id', $city_mi_id)->where('deleted', 0)->first();
					if(!$city){
						echo 'city not exist!' . $city_mi_id .' '. $i;
						continue;
					}
					$areaName = $data[0];

					// if($areaName != 'התיישבות'){ echo $areaName . ' city:' . $city_mi_id; continue; }

					$area = Area::where('name', $data[0] )->where('deleted', 0)->first();
					$subArea = SubArea::where('name', $data[1])->where('deleted', 0)->first();

					if($area){
						$city->area_id = $area->id;
						$city->updated_at = Carbon::now()->toDateTimeString();
						dump($area->toArray());
					}else{
						echo 'Area not exist!' . $areaName;
					}
					if($subArea){
						$city->sub_area_id = $subArea->id;
						$city->updated_at = Carbon::now()->toDateTimeString();
						dump($subArea->toArray());
					}else{
						echo 'subArea not exist!' . $data[1];
					}
					$city->save();
					dump($city->toArray());
				}
			
			}
			public function updateActivistsBankDetails(){
				
				$bankDetails = [
						'bank_number', 'bank_branch_number' , 'bank_branch_name', 
						'bank_account_number' ,'bank_owner_name', 'other_owner_type',
						'is_activist_bank_owner', 'is_bank_verified', 'verify_bank_document_key'
				];
				$last_campaign_id =  ElectionCampaigns::currentCampaign()->id;

				$activistsWithBankDetails = ElectionRolesByVoters::select($bankDetails)
				->addSelect('voter_id')
				->where('election_campaign_id', $last_campaign_id)
				->whereNotNull('bank_account_number')
				->orderBy('election_campaign_id', 'desc')
				->orderBy('updated_at', 'desc')
				->get();
					dump(count($activistsWithBankDetails->toArray()));
				foreach ($activistsWithBankDetails  as $activistRole){
					dump('$activistRole', $activistRole->toArray());

					$otherRoles = ElectionRolesByVoters::select('id','voter_id', 'bank_account_number')
       					 ->where('election_campaign_id', $last_campaign_id)
						->whereNull('bank_account_number')
						->where('voter_id', $activistRole->voter_id)
						->get();
						

						if(count($otherRoles) > 0){
							dump('otherRolesExist:', $activistRole->voter_id, $otherRoles->toArray());

							foreach($otherRoles as $otherRole){
								foreach($bankDetails  as $item){
									$otherRole->$item = $activistRole->$item;
								}
								$otherRole->save();
							}	
						} else {
							dump('otherRolesNotExist:', $activistRole->voter_id);
						}
				}
			}
			public function updateCaptain50ActionsFromHistory(){
				$last_campaign_id =  ElectionCampaigns::currentCampaign()->id;

				$field = 'is_phone_changed';
				// $field = 'is_ethnic_changed';
				// $field = 'is_religious_changed';
				// $field = 'is_address_changed';
				// $field = 'is_support_status_changed';

				$historyAddressDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'Voters');

				$historyAddressDetailsQuery
				->where( function ($q){
					$q
					->where('field_name', DB::raw("'city_id'"))
					->orWhere('field_name', DB::raw("'street_id'"))
					->orWhere('field_name', DB::raw("'neighborhood'"))
					->orWhere('field_name', DB::raw("'house'"))
					->orWhere('field_name', DB::raw("'flat'"))
					->orWhere('field_name', DB::raw("'zip'"));
				});

				// echo $historyAddressDetailsQuery->toSql();
				// echo "<br><br><br><br><br><br>";

				$historyEthnicDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'Voters');

				$historyEthnicDetailsQuery
				->where('field_name', DB::raw("'ethnic_group_id'"));


				// echo $historyEthnicDetailsQuery->toSql();
				// echo "<br><br><br><br><br><br>";

				$historyReligiousDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'Voters');

				$historyReligiousDetailsQuery
				->where('field_name', DB::raw("'religious_group_id'"));

				$historySupportStatusesDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'VoterSupportStatus');
				
				$historySupportStatusesDetailsQuery
				->where('field_name', DB::raw("'entity_type'"))
				->where('new_numeric_value', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'));
				// ->where('field_value', '!=' , DB::raw(60));
				
				// echo $historyReligiousDetailsQuery->toSql();
				// echo "<br><br><br><br><br><br>";


				// $historyPhonesDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'VoterPhone');
				
				if($field == 'is_phone_changed'){
					$historyPhonesDetailsQuery = VoterPhone::select('captain_id', 'voters_with_captains_of_fifty.voter_id')
					->join('voters_with_captains_of_fifty','voters_with_captains_of_fifty.voter_id','voter_phones.voter_id')
					// ->join('temp_first_time_captain50_for_voter','temp_first_time_captain50_for_voter.voter_id','voter_phones.voter_id')
					->join('temp_first_time_captain50_for_voter', function($joinOn)   {
						$joinOn->on('temp_first_time_captain50_for_voter.voter_id', '=', 'voter_phones.voter_id')
						->on('temp_first_time_captain50_for_voter.first_time', '<', 'voter_phones.updated_at');
					})
					->where('voters_with_captains_of_fifty.election_campaign_id', $last_campaign_id)
					// ->where(DB::raw('2020-01-22 00:00:00'), '<' ,'voter_phones.updated_at')
					->where('temp_first_time_captain50_for_voter.first_time', '<' ,'voter_phones.updated_at')
					->whereNotNull('voter_phones.phone_number')
					
					->groupBy('voter_phones.voter_id')
					->orderBy('temp_first_time_captain50_for_voter.created_at');
				}
				if($field == 'is_support_status_changed'){

					// $historySupportStatusesDetailsQuery = $this->getActionHistoryDetailsQuery($last_campaign_id, 'VoterSupportStatus');
					$historySupportStatusesDetailsQuery = VoterSupportStatus::join('voters_with_captains_of_fifty','voters_with_captains_of_fifty.voter_id','voter_support_status.voter_id')
					// ->join('temp_first_time_captain50_for_voter','temp_first_time_captain50_for_voter.voter_id','voters_with_captains_of_fifty.voter_id')
					->join('temp_first_time_captain50_for_voter', function($joinOn)   {
						$joinOn->on('temp_first_time_captain50_for_voter.voter_id', '=', 'voter_support_status.voter_id')
						->on('temp_first_time_captain50_for_voter.first_time', '<', 'voter_support_status.created_at');
					})
					->where('entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))
					->where('voter_support_status.election_campaign_id', $last_campaign_id)
					->where('voters_with_captains_of_fifty.election_campaign_id', $last_campaign_id)
					->where('voter_support_status.support_status_id', '!=' ,DB::raw(60))
					->where('temp_first_time_captain50_for_voter.first_time', '<' ,'voter_support_status.updated_at')
					->groupBy('voters_with_captains_of_fifty.voter_id')
					->orderBy('temp_first_time_captain50_for_voter.created_at');
	
					echo $historySupportStatusesDetailsQuery->toSql();
				}
				dump($historyPhonesDetailsQuery->toSql());
				// $historyPhonesDetailsQuery->addSelect( DB::raw('COUNT(distinct action_history.referenced_id) as cnt'));
								
				// echo $historyPhonesDetailsQuery->toSql();
				// echo "<br><br><br><br><br><br>";



				$historyDetailsArray = $historyPhonesDetailsQuery->get();

				// $votersHadUpdated = [];
				dump(count($historyDetailsArray));
				// dd($historyDetailsArray);
				die;
				foreach ($historyDetailsArray as $row){
					// if(isset($votersHadUpdated[$row->voter_id])){continue;}
					dump($row->toArray());
					// DB::table('temp_first_time_captain50_for_voter')
					$existVoterRow = VotersUpdatesByCaptains::select('id')
						->where('captain_id', $row->captain_id)
						->where('voter_id', $row->voter_id)
						->first();
						if($existVoterRow){
							echo 'exist';
							$existVoterRow->$field = 1;
							$existVoterRow->save();
						} else {
							echo 'not-exist';

							$voterRow = new VotersUpdatesByCaptains;
							$voterRow->captain_id = $row->captain_id;
							$voterRow->voter_id = $row->voter_id;
							$voterRow->$field = 1;
							$voterRow->save();
						}
				}
				die;
			}
			private function getActionHistoryDetailsQuery($last_campaign_id, $model){
				$historyDetailsQuery = History::select('captain_id', 'voters_with_captains_of_fifty.voter_id','field_name')
				->join('action_history', 'action_history.history_id', '=', 'history.id')
				->join('action_history_details', 'action_history_details.action_history_id', '=', 'action_history.id')
				->join('voters_with_captains_of_fifty','voters_with_captains_of_fifty.voter_id','action_history.referenced_id')
				// ->join('temp_first_time_captain50_for_voter','temp_first_time_captain50_for_voter.voter_id','voters_with_captains_of_fifty.voter_id')
				->join('temp_first_time_captain50_for_voter', function($joinOn)   {
					$joinOn->on('temp_first_time_captain50_for_voter.voter_id', '=', 'action_history.referenced_id')
					->on('temp_first_time_captain50_for_voter.first_time', '<', 'action_history.created_at');
				})
				->where('action_history.referenced_model' , 'like', DB::raw("'$model'")) 
				->where('voters_with_captains_of_fifty.election_campaign_id', $last_campaign_id)
				->where('temp_first_time_captain50_for_voter.first_time', '<' ,'history.created_at')

				// ->where('voters_with_captains_of_fifty.voter_id', DB::raw("'3964766'"))
				// ->whereNotNull('history.user_create_id')
				->groupBy('voters_with_captains_of_fifty.voter_id')
				->orderBy('temp_first_time_captain50_for_voter.created_at');
				return $historyDetailsQuery; 
			}
			public function updateVotersFirstTimeOfCaptain(){
				$last_campaign_id =  ElectionCampaigns::currentCampaign()->id;

				$voters = VoterCaptainFifty::select('voters_with_captains_of_fifty.voter_id', 'voters_with_captains_of_fifty.created_at')
					->where('voters_with_captains_of_fifty.election_campaign_id', $last_campaign_id)
					->orderBy('voters_with_captains_of_fifty.created_at', 'asc')
					->groupBy('voters_with_captains_of_fifty.voter_id')
					->get();
					// dd($voters->toArray());
				foreach( $voters as $row){
					dump($row->toArray());
					DB::table('temp_first_time_captain50_for_voter')->insert([
						'voter_id' => $row->voter_id,
						'first_time' => $row->created_at,
					]);
				}

			}
		public function updateCitiesForVoters(){
			$voters = Voters::select(['id','mi_city','mi_city_id', 'city' ,'city_id'])
			->whereNull('mi_city_id')
			->orWhereNull('city_id')
			->get();
			echo json_encode($voters->toArray());
			// die;
			if($voters){
				foreach($voters as $voter){

					if(!$voter->city_id && $voter->mi_city_id){
						$city = City::where('id', $voter->mi_city_id)->first();
						if($city){
							$voter->city_id = $city->id;
							$voter->city = $city->name;
							if(!$voter->mi_city ){
								$voter->mi_city = $city->name;
							}
							$voter->save();
							continue;
						}
					} else if($voter->city_id && !$voter->mi_city_id){
						$city = City::where('id', $voter->city_id)->first();
						if($city){
							$voter->mi_city_id = $city->id;
							$voter->mi_city = $city->name;
							if(!$voter->city ){
								$voter->city = $city->name;
							}
							$voter->save();
							continue;
						}
					}else if(!$voter->city_id && !$voter->mi_city_id ){
						$cityName = $voter->mi_city ? $voter->mi_city  : $voter->city ;
						$city = City::where('name', $cityName)->first();
						if($city){
							$voter->mi_city_id = $city->id;
							$voter->city_id = $city->id;
							$voter->save();
							continue;
						}
					}
				}
			}
			die;
			
		}
		public function fixCitiesForVoters(){
			$limit = 3500000;
			$skip = 1900000;
			set_time_limit(0);
			ini_set('memory_limit', '-1');
			// ini_set('max_execution_time', '300');
			$voters = Voters::select(['voters.id as voter_id', 'mi_city','mi_city_id', 'city' ,'city_id', 'cities.name as city_name', 'mi_city.name as mi_city_name'])
			->leftJoin('cities', 'cities.id', 'city_id')
			->leftJoin('cities as mi_city', 'mi_city.id', 'mi_city_id')
			->limit($limit)
			->skip($skip)
			->get();
			foreach( $voters as $voter){
				$needToUpdate = false;
				dump($voter->voter_id . ' - '. $voter->city . ' - '. $voter->city_name . ' - '. $voter->mi_city . ' - '. $voter->mi_city_name . ' - '. $needToUpdate);
				if($voter->city != $voter->city_name){
					$voter->city = $voter->city_name;
					$needToUpdate = true;
				}
				if($voter->mi_city != $voter->mi_city_name){
					$voter->mi_city = $voter->mi_city_name;
					$needToUpdate = true;
				}
				if($needToUpdate){
					dump('$needToUpdate', $needToUpdate);
					Voters::where('id', $voter->voter_id)->update([
						'city' => $voter->city_name,
						'mi_city' => $voter->mi_city_name
					]);
					// $voter->save();
				}
			}
			echo json_encode($voters->toArray());
			die;
		}

		public function transferBankDetailsToVoters(){
	
			$bankDetailsFields = [
				'voter_id', 'is_bank_pass_validation',
				'bank_number', 'bank_branch_number' , 'bank_branch_name', 
				'bank_account_number' ,'bank_owner_name', 'other_owner_type',
				'is_activist_bank_owner', 'is_bank_verified', 'verify_bank_document_key'
			];
			$ElectionRolesByVoters = ElectionRolesByVoters::select( 
				[
				'election_roles_by_voters.voter_id',
				'election_roles_by_voters.bank_number',
				'election_roles_by_voters.bank_branch_number',
				'election_roles_by_voters.bank_branch_name',
				'election_roles_by_voters.bank_account_number',
				'election_roles_by_voters.bank_owner_name',
				'election_roles_by_voters.other_owner_type',
				'election_roles_by_voters.is_activist_bank_owner',
				'election_roles_by_voters.is_bank_verified',
				'election_roles_by_voters.verify_bank_document_key',
				'election_roles_by_voters.is_bank_pass_validation',
				]
				)
			->groupBy('voter_id')
			->whereNotNull('election_roles_by_voters.bank_number')
			->orderby('created_at', 'desc')
			->get();
			foreach ($ElectionRolesByVoters as $item) {
				$BankDetails = BankDetails::where('voter_id', $item->voter_id)->first();
				if(!$BankDetails){
					$BankDetails = new BankDetails;
				}
				$BankDetails->key = Helper::getNewTableKey('bank_details', 5);
				dump($item->toArray(), $BankDetails->toArray());

				foreach ($bankDetailsFields as $key) {
					// dump($key,$item->$key);
					$BankDetails->$key = $item->$key;
				}
				$BankDetails->save();
			}
			
		}
		public function insertHistoryActivists(){
			$jsonOutput = app()->make("JsonOutput");
			$jsonOutput->setBypass(true);

			$historyElectionCampaigns = [
				15 => 'כנסת ה-19 - 2013', 
				17 => 'בחירות לרשויות - 2013', 
				19 => 'כנסת ה-20 - 2015', 
			];
			$historyElectionCampaignsCities = [
				15 => 1301, 
				17 => 1300, 
				19 => 1302, 
			];

			$file = fopen('c:\xampp\htdocs\shas\files\history_activists.csv', "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				// dump($i, $data);
				$i++;
				if($i == 1){ continue; }
				$election_campaign_name = $data['8']; 
				$personalIdentity = $data['2']; 
				$sum = intval(str_replace(',', '', trim($data['5'])));
				// dump('sum', $sum . ' ==> ' . $data[5]);
				// continue;
				$electionCampaignId = array_search( $election_campaign_name, $historyElectionCampaigns);
				if(!$electionCampaignId){
					dump('no_election_campaign!!!!!!!!!!!!!!', $i);
				}
				$voter = Voters::where('personal_identity', $personalIdentity)->first();
				if(!$voter){
					dump('no-voter!!!!!!!!!!!!!!', $i);
					continue;
				}
				$voterId =  $voter->id;
				$assigned_city_id = $historyElectionCampaignsCities[$electionCampaignId];
				$electionRolesByVoter = ElectionRolesByVoters::
				where('voter_id', $voterId)
				->where('election_role_id', 6)
				->where('assigned_city_id', $assigned_city_id)
				->first();

				if(!$electionRolesByVoter){
					dump('no-electionRolesByVoter', $i);
					continue;
				} else {
					continue;
				}
				$last_campaign_id =  ElectionCampaigns::currentCampaign()->id;

				if(!$electionRolesByVoter){
					$phone = VoterPhone::where('voter_id', $voterId)->orderBy('created_at', 'desc')->first();
					$phoneNumber = '';
					if($phone){
						$phoneNumber = $phone->phone_number;
					}
					$electionRolesByVoter = new ElectionRolesByVoters;
					$electionRolesByVoter->election_role_id = 6;
					$electionRolesByVoter->voter_id = $voterId;
					$electionRolesByVoter->assigned_city_id = $assigned_city_id;
					$electionRolesByVoter->phone_number = $phoneNumber;
					$electionRolesByVoter->user_create_id = Auth::user()->id;
					$electionRolesByVoter->key = Helper::getNewTableKey('election_roles_by_voters', 5);
				}
				$electionRolesByVoter->election_campaign_id = $last_campaign_id;

				$electionRolesByVoter->sum = $sum;
				$electionRolesByVoter->save();
				dump($electionRolesByVoter->toArray());
			}
			$jsonOutput->setData('stop');

			die;
		}
		public function setPermissionsByUserRoles(){
			$PermissionsInUserRoleList = \App\Models\PermissionsInUserRole::all();
			echo(json_encode($PermissionsInUserRoleList->toArray()));
			foreach ($PermissionsInUserRoleList as $item) {
				$userRole = UserRoles::where('permission_group_id', $item->user_role_id)->first();
				$user_role_id = null;
				if($userRole){
					$user_role_id = $userRole->id;
					$item->user_role_id = $user_role_id;
					$item->save();
				} else{
					$item->delete();
				}

			}
			dd('ok');

		}
		public function updateActivistPhoneNumbers(){
        	$electionCampaignId = ElectionCampaigns::currentCampaign()->id;

			$ElectionRolesByVoters = ElectionRolesByVoters::select('voter_id', 'phone_number', 'updated_at')
			->orderBy('updated_at', 'desc')
			->where('election_campaign_id', $electionCampaignId)
			->get();
			$hash = [];
			foreach($ElectionRolesByVoters as $item){
				if(empty($hash[$item->voter_id])){
					$hash[$item->voter_id] = $item->phone_number;
				}
			}
			foreach ($hash as $voterId => $phone_number){
				ElectionRolesByVoters::where('voter_id', $voterId)->update(['phone_number' => $phone_number]);
			}
			echo(json_encode($hash));
			die;
		}
		public function updateLoginServerElectionsRoles (){
			UserService::updateLoginServerElectionsRoles();
		}
		public function updateAllActivistsUsersElectionsRoles (){
			UserService::updateAllActivistsUsersElectionsRoles();
		}
		public function getMunicipalEntitySummary ( $entityType =-1 , $entityId =1){
			$jsonOutput = app()->make("JsonOutput");
			
			$data = MunicipalElectionsRolesService::getMunicipalEntitySummary($entityType, $entityId);
			$jsonOutput->setData($data);

		}

		public function addQuestionColumnToPortionPhonesVoters(){
			// PollsPortionsService::addQuestionColumnToPortionPhonesVoters(1, 2);
		}
		public function removeQuestionColumnToPortionPhonesVoters(){
			// PollsPortionsService::removeQuestionColumnToPortionPhonesVoters(1, 2);
		}

		// this function generates an .sql ready-to-insert query 
		// from existing *local* csv file:

		public function sqlGenerator(){
	
			$file_received_path = storage_path( '\voters_new_data\voters_received.txt');
			$file_created_path = storage_path( '\voters_new_data\new_created.sql');

			// $file_received_path = storage_path( '\voters_new_data\short.txt');
			// $file_created_path = storage_path( '\voters_new_data\short_created.sql');

			$row_count = 0;
			$table_name = 'new_voters_table';
			$base_query = "INSERT INTO '" . $table_name . "' VALUES ";
			$base_query .= "('', '', '', '', '', '', '', '', '', '', '', '', '', '', '')";

			// open files:
			$received_file = fopen($file_received_path, "r") or die("Unable to open file: " . $file_received_path);
			$created_file = fopen($file_created_path, "a") or die("Unable to open file: " . $file_created_path);

			// insert the first line into the new file:
			fwrite($created_file, $base_query);

			// iterate through the csv data (received file) & read it:
			while(!feof($received_file))
			{
				// control num of iterations to prevent exhausting resources:
				$row_count ++;
				// // if($row_count < 1000001){continue;}
				// // if($row_count > 1000000) {break;} 

				$row = fgetcsv($received_file);

				// if its not last:
				if ($row) {

					// create the row from csv with only the relevant (not empty) fields:
					$relevant_row = [
						$row[0], 
						$row[1],
						$row[2],
						$row[3],
						$row[4],
						$row[5],
						$row[6],
						$row[7],
						$row[8],
						$row[10],
						$row[11],
						$row[12],
						$row[14],
						$row[16],
						$row[18]
					];
					
					$row_as_string = ",\n(";
					$column_num = count($relevant_row);
					$items_counter = 0;
				
					// iterate through every item in the current row and trim spaces + add Quote ('):
					foreach ($relevant_row as $row_item) {
						$items_counter++;
						$temp_item = "'";
						$temp_item .= trim($row_item);
						if ($items_counter == $column_num) {
							$temp_item .= "'";
						} else {
							$temp_item .= "',";
						}
						// insert the new item into string:
						$row_as_string .= $temp_item;
					}
					$row_as_string .= ")";
					// insert the new row:
					fwrite($created_file, $row_as_string);

					// show progress:
					dump($row_count);
				}
			}

			// add a close query to the end:
			fwrite($created_file, ';');

			// close open files:
			fclose($created_file);
			fclose($received_file);
		}
		public function addAllocationsFromFile(){
			$election_campaign_id = ElectionCampaigns::currentCampaign()->id;
			$path = storage_path( 'app\activists_all_allocations.csv');
			$file = fopen($path, "r");
			$i = 0;
			$citiesIds = [];
			while ($data = fgetcsv($file)) {
				$i++;
				if($i == 1){ continue; }
				$city_mi_id = $data['0']; 
				$cluster_mi_id = $data['2']; 
				$clusterCount = $data['4']; 
				$captain100Count = $data['5']; 
				dump($i-1, $data, $city_mi_id, $captain100Count);

				$city = City::where('mi_id', $city_mi_id)->first();
				$cluster = Cluster::where('city_id', $city->id)->where('clusters.mi_id', $cluster_mi_id)->where('election_campaign_id', $election_campaign_id)->first();

				if($city && $cluster){
					$citiesIds[$city_mi_id][$cluster_mi_id] = ['id' => $city->id, 'name' => $city->name,  'cluster_name' => $cluster->name];
					dump( $city->id, $cluster->id);
					//!! need to check allocations counters
					$clusterElectionRolId = 5; // For captain100:

					// dump( $counts->toArray());

					// $captain100CurrentCount = $counts ? $counts->captain100_cnt : 0;
					if($clusterCount){
						$clusterExist = ActivistsAllocations::select('id')
							->where('city_id', $city->id)
							->where('cluster_id', $cluster->id)
							->where('election_campaign_id', $election_campaign_id)
							->where('election_role_id', $clusterElectionRolId)
							->first();
						if(!$clusterExist){
							$newAllocation = new ActivistsAllocations;
							$newAllocation->city_id = $city->id;
							$newAllocation->cluster_id = $cluster->id;
							$newAllocation->election_campaign_id = $election_campaign_id;
							$newAllocation->election_role_id = 5;
							// dump($newAllocation->toArray());
							$newAllocation->save();	
						}

					}

					$captain100ElectionRolId = 2; // For captain100:

					$captain100ExistsCount = ActivistsAllocations::select(
						DB::raw('count(*) as captain100_cnt' ))
						->where('city_id', $city->id)
						->where('cluster_id', $cluster->id)
						->where('election_campaign_id', $election_campaign_id)
						->where('election_role_id', $captain100ElectionRolId)
						->first();


					for($x = $captain100ExistsCount->captain100_cnt; $x < $captain100Count; $x++){
						$newAllocation = new ActivistsAllocations;
						$newAllocation->city_id = $city->id;
						$newAllocation->cluster_id = $cluster->id;
						$newAllocation->election_campaign_id = $election_campaign_id;
						$newAllocation->election_role_id = $captain100ElectionRolId;
						// dump($newAllocation->toArray());
						$newAllocation->save();
						// dump( $newAllocation->toArray());
					}
				} else {
					dump($i-1, $data, $city_mi_id, 'not found');
				}
			}
			echo json_encode($citiesIds);
			die;
		}


		public function fixActivistsAllocations(){
			$election_campaign_id = ElectionCampaigns::currentCampaign()->id;
			$path = storage_path( 'app/new_elections_roles.csv');
			$file = fopen($path, "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				$i++;
				if($i == 1 || $i == 2){ continue; }
				Log::info($data);
				$city_mi_id = $data[3];
				$ballot_mi_id = $data[5] * 10;
				$personalIdentity = $data[10];

				if(empty($city_mi_id)){
					return;
				}
				$noAllocationText = 'לא לשיבוץ';
				$old_election_role_id = null;
				$new_election_role_id = null;

				$ballot = BallotBox::select('ballot_boxes.id as ballot_box_id', 'cluster_id', 'city_id')
				->WithCluster()
				->WithCity()
				->where('cities.mi_id', $city_mi_id)
				->where('ballot_boxes.mi_id', $ballot_mi_id)
				->where('election_campaign_id', $election_campaign_id)
				->first();
				
				if($data[8] != $noAllocationText){
					$old_election_role_id = ElectionRoles::where('name',$data[8])->first()->id;
				}
				if($data[9] != $noAllocationText){
					$new_election_role_id = ElectionRoles::where('name',$data[9])->first()->id;
				}

				if($ballot){
					Log::info(json_encode($ballot));
					Log::info("old_election_role_id - $old_election_role_id");
					Log::info("new_election_role_id - $new_election_role_id");
					$newBallotRole = ($new_election_role_id) == 4 ? 5 : 4;
					Log::info("new_election_role_id - $newBallotRole");

					if(!$old_election_role_id && $new_election_role_id){
						BallotBox::where('id', $ballot->ballot_box_id)->update(['ballot_box_role_id' => $newBallotRole]);
						$newAllocation = ActivistsAllocations::where([
							'ballot_box_id' => $ballot->ballot_box_id,
							'city_id' => $ballot->city_id,
							'cluster_id' => $ballot->cluster_id,
							'election_role_id' => $new_election_role_id,
						])->first();
						if(!$newAllocation){
							foreach([1,2,4] as $shift){
								$newAllocation = new ActivistsAllocations();
								$newAllocation->ballot_box_id =  $ballot->ballot_box_id;
								$newAllocation->city_id =  $ballot->city_id;
								$newAllocation->cluster_id =  $ballot->cluster_id;
								$newAllocation->election_role_id =  $new_election_role_id;
								$newAllocation->election_campaign_id =  $election_campaign_id;
								$newAllocation->election_role_shift_id =  $shift;
								$newAllocation->save();
							}

						}

					} else if($old_election_role_id  && $new_election_role_id){
						BallotBox::where('id', $ballot->ballot_box_id)->update(['ballot_box_role_id' => $newBallotRole]);
						
						$oldActivistsAllocations = ActivistsAllocations::where([
							'ballot_box_id' => $ballot->ballot_box_id,
							'city_id' => $ballot->city_id,
							'cluster_id' => $ballot->cluster_id,
							'election_role_id' => $old_election_role_id,
							'election_campaign_id' => $election_campaign_id,
						])->get();
						if($oldActivistsAllocations){
							foreach($oldActivistsAllocations as $item){
								$item->election_role_id = $new_election_role_id;
								$item->save();
							}
						}
					} else if($old_election_role_id  && !$new_election_role_id){
						BallotBox::where('id', $ballot->ballot_box_id)->update(['ballot_box_role_id' => null]);

						$oldActivistsAllocations = ActivistsAllocations::where([
							'ballot_box_id' => $ballot->ballot_box_id,
							'city_id' => $ballot->city_id,
							'cluster_id' => $ballot->cluster_id,
							'election_campaign_id' => $election_campaign_id,
							'election_role_id' => $old_election_role_id,
						])->delete();
					}

				} else {
					Log::info('לא נמצא קלפי');
				}

			}
			die ('end');
		}
		public function updateClusterLeaderActivistsAllocations(){
        
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;
	
			$electionRolesClusters = ElectionRolesByVoters::select([
				'activists_allocations.id as activists_allocations_id',
				'activists_allocations.election_role_by_voter_id as activists_allocations_role',
				'clusters.id as cluster_id',
				'election_roles_by_voters.id as election_roles_by_voters_id'
			])
			->WithClusterLeader($currentCampaignId)
			->join( 'activists_allocations', 'activists_allocations.cluster_id', '=','clusters.id' )
			->where('election_roles_by_voters.election_role_id', 5)
			->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
			->where('clusters.election_campaign_id', $currentCampaignId)
			->where('activists_allocations.election_campaign_id', $currentCampaignId)
			->get();
			foreach($electionRolesClusters as $clusterLeader){
				// dump($clusterLeader->activists_allocations_id, $clusterLeader->election_roles_by_voters_id);
				ActivistsAllocations::where('id', $clusterLeader->activists_allocations_id)->update(['election_role_by_voter_id' => $clusterLeader->election_roles_by_voters_id]);
			}
			echo json_encode($electionRolesClusters->toArray());
			die;
		}
		public function restoreBallots(){
			$path = storage_path( 'app/ballots_24_backup.csv');
			$file = fopen($path, "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				// dd($data);
				$i++;
				// if($i < 49000 || $i > 75000){ continue; }
				if($i < 75000 ){ continue; }
				$mi_iron_number = $data[4] == 'NULL' ? NULL : $data[4];
				$ballot_box_role_id = $data[6] == 'NULL' ? NULL : $data[6];
				$votes_count = $data[15] == 'NULL' ? NULL : $data[15];
				$invalid_votes_count = $data[14] == 'NULL' ? NULL : $data[14];
				$existBallot = BallotBox::where('id',$data[0])->first();
				
				if($existBallot) {Log::info(json_encode($existBallot)); continue;}
				$ballot = new BallotBox();
				$ballot->id =  $data[0];
				$ballot->key =  $data[1];
				$ballot->cluster_id =  $data[2];
				$ballot->mi_id =  $data[3];
				$ballot->mi_iron_number =  $mi_iron_number;
				$ballot->crippled =  $data[5];
				$ballot->ballot_box_role_id =  $ballot_box_role_id;
				$ballot->special_access =  $data[7];
				$ballot->special_markings =  $data[8];
				$ballot->reporting =  $data[9];
				$ballot->strictly_orthodox =  $data[10];
				$ballot->hot =  $data[11];
				$ballot->voter_count =  $data[12];
				$ballot->mi_voter_count =  $data[13];
				$ballot->votes_count =  $votes_count;
				$ballot->invalid_votes_count =  $invalid_votes_count;
				$ballot->banned_votes_count =  $data[26];
				$ballot->valid_votes_count =  $data[27];
				// $ballot->created_at =  Carbon::parse($data[29] . ':00');
				// $ballot->updated_at =  Carbon::parse($data[30] . ':00');
				$ballot->save();
			}
		}
		public static function  exportBallotsCalculateBallotsVotersFile(){
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;
			$fields = [
				'cities.name as "שם עיר"',
				'cities.mi_id as "סמל עיר"',
				'clusters.name as "שם אשכול"',
				'clusters.mi_id as "סמל אשכול"',
				'ballot_boxes.mi_id as "סמל קלפי"',
				DB::raw('CONCAT(clusters.street,clusters.house) as "כתובת אשכול"'),
				'ballot_boxes.voter_count as "מספר בוחררים בקלפי"',
				// 'ballot_boxes.votes_count',
				// 'calculated_mi_total_votes_percents',
				// 'calculated_mi_shas_votes_percents',
				'calculated_probability_total_votes_percents as "אחוז הצבעה מחושב קלפי"',
				'calculated_probability_shas_votes_percents as "אחוז הצבעה מחושב שס קלפי"',
			];
			$ballots =BallotBox::select($fields)
			->withCluster()
			->withCity()
			->where('clusters.election_campaign_id', $currentCampaignId)
			->get();
			ExportService::export($ballots->toArray());
			Log::info(json_encode($ballots));
			echo json_encode($ballots);
			die;
		}
		public function getDatabaseName(){
			if(DB::connection()->getDatabaseName())
			{
				dump(config()->get('database.connections.mysql.read.host'));
				die;
			}
		}
		public function transferCallsFiles($skip = 0, $limit = 10000){
			$calls = Call::select('audio_file_name','campaign_id')->whereNotNull('audio_file_name')->skip($skip)->limit($limit)->get();
			
			$fileStorage = env('FILES_CALLS_FOLDER', base_path() . '/files');
			
			foreach($calls as $call){
				$old_path = "$fileStorage/$call->audio_file_name";
				Log::info(file_exists ($old_path));
				Log::info("$old_path - path");
				$new_path = "$fileStorage/$call->campaign_id";

				Log::info('file_exists:'. file_exists ($old_path). ' campaign_id '. $call->campaign_id . ' new file:' . file_exists("$new_path/$call->audio_file_name"));
				if(file_exists ($old_path) ){

					if(!is_dir($new_path)){
						mkdir($new_path);
					}
					try {
						rename($old_path, "$new_path/$call->audio_file_name");

					} catch (\Throwable $th) {
						//throw $th;
					}
				}
			}
		}
		public function addBallotsAndAllocationsFromFile(){
			$path = storage_path( 'app/covid19-ballots.csv');
			$file = fopen($path, "r");
			$i = 0;
			$clusterMiId = 999999;
			$currentCityId = null;
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			while ($data = fgetcsv($file)) {
				$i++;

				if($i == 1){
					continue;
				}

				$city_mi_id = $data[1];
				$ballot_mi_id = $data[2] * 10;
				$roleName = $data[3];
				$clusterAddress = $data[4];
				$ballot_box_role_id = BallotBoxRole::where('name', $roleName)->first()->id;
				if(!$ballot_box_role_id){
					Log::info("לא נמצא תפקיד $roleName -> $i");
					Log::info(json_encode($data));
					continue;
				}
				$city = City::where('mi_id', $city_mi_id)->first();


				if(!$city){
					Log::info("לא נמצא $city_mi_id -> $i");
					Log::info(json_encode($data));
					continue;
				}

				if($currentCityId != $city->id) {
					$clusterMiId = 999999;
					$currentCityId = $city->id;
				}

				$ballot = BallotBox::where('ballot_boxes.mi_id', $ballot_mi_id)
				->where('city_id', $ballot_mi_id)
				->withCluster()
				->first();

				if(!$ballot){
					$name ='אשכול קורונה - ' . $clusterAddress;
					$cluster = Cluster::where('name', $name)->where('street', $clusterAddress)->where('city_id', $city->id)->where('election_campaign_id', $currentCampaignId)->first();
					if(!$cluster){
						$cluster = new Cluster();
						$cluster->name = $name;
						$cluster->street = $clusterAddress;
						$cluster->mi_id = $clusterMiId;
						$cluster->city_id = $city->id;
						$cluster->election_campaign_id = $currentCampaignId;
						$cluster->key = Helper::getNewTableKey('clusters', 5);
						$cluster->save();
					}
					$ballot = new BallotBox();
					$ballot->mi_id = $ballot_mi_id;
					$ballot->cluster_id = $cluster->id;
					$ballot->ballot_box_role_id = $ballot_box_role_id;
					$ballot->voter_count = 0;
					$ballot->key = Helper::getNewTableKey('ballot_boxes');
					$ballot->save();

					$new_election_role_id = 8;
					$newAllocation = ActivistsAllocations::where([
						'ballot_box_id' => $ballot->id,
						'city_id' => $cluster->city_id,
						'cluster_id' => $cluster->id,
						'election_role_id' => $new_election_role_id,
					])->first();

					if(!$newAllocation){
						foreach([1,2,4] as $shift){
							$newAllocation = new ActivistsAllocations();
							$newAllocation->ballot_box_id =  $ballot->id;
							$newAllocation->city_id =  $cluster->city_id;
							$newAllocation->cluster_id =  $cluster->id;
							$newAllocation->election_role_id =  $new_election_role_id;
							$newAllocation->election_campaign_id =  $currentCampaignId;
							$newAllocation->election_role_shift_id =  $shift;
							$newAllocation->save();
						}
					}
				}
				$clusterMiId = $clusterMiId - 1;
			}
			die;
		}
		public static function FixBoValidHouseholds(){
			$householdIds =[];
			$voters = Voters::select('household_id', Db::raw('count(distinct last_name) as family_cnt'))
			->groupBy('household_id')
			// ->groupBy('last_name')
			->having('family_cnt', '>', '1')
			->get();
			echo $voters->count();
			Log::info($voters);
			die;

			foreach($voters as $v ){
				$householdIds[]= $v->household_id;
			}
			Log::info($voters->toArray());
			Log::info(json_encode($householdIds));
		}
		public function updateVoterSupportStatusesFromFile(){
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			$path = storage_path( 'app/orders_2021_3_17_22_31_42.csv');
			$file = fopen($path, "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				$i++;

				if($i == 1){
					continue;
				}
				$supportStatusId = $data[0];
				if(empty($supportStatusId)){
					continue;
				}
				// $supportStatus = SupportStatus::select('id')->where('name', $data[1])->first();
				// if(!$supportStatus){
				// 	Log::info("$i - failed to update support status");
				// 	Log::info($data);
				$entityType = config( 'constants.ENTITY_TYPE_VOTER_SUPPORT_TM');
				// }
				
				$voter = Voters::select('voters.id as voter_id')
				->where('voters.key', $data[1])
				->first();

				$VoterSupportStatus= VoterSupportStatus::where('entity_type', $entityType)
				->where('election_campaign_id', $currentCampaignId)
				->where('voter_id', $voter->voter_id)
				->first();

				dump($VoterSupportStatus,$voter, $supportStatusId, $data, $i);
				// continue;

				$userId = 626;
				if(empty($VoterSupportStatus)){
					VoterSupportStatusService::addVoterSupportStatuses($voter->voter_id, $supportStatusId, $currentCampaignId, $entityType, $userId);
				} else {
					$VoterSupportStatus->support_status_id = $supportStatusId;
					$VoterSupportStatus->update_user_id = $userId;
					$VoterSupportStatus->save();
				}
			}
			die;
		}
		public function setHotBallots(){
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			$path = storage_path( 'app/hots_new.csv');
			$file = fopen($path, "r");
			$i = 0;
			while ($data = fgetcsv($file)) {
				$i++;
				Log::info($data);

				if($i == 1){
					continue;
				}
				$city = City::where('mi_id', $data[0])->first();
				if(!$city){
					Log::info($data);
					Log::info("City not found!");
					continue;
				}
				Log::info($city->mi_id);

				$ballot = BallotBox::select('ballot_boxes.id', 'ballot_boxes.mi_id')
				->join('clusters', 'clusters.id', 'ballot_boxes.cluster_id')
				->where('clusters.election_campaign_id', $currentCampaignId)
				->where('clusters.city_id', $city->id)
				->where('ballot_boxes.mi_id', ($data[2] * 10) )
				->first();

				if(!$ballot){
					Log::info($data);
					Log::info("ballot not found!");
					continue;
				}
				Log::info($ballot->id);
				Log::info($ballot->mi_id);

				$ballot->hot =1;
				$ballot->save();
			}
			die;
		}
		public function updateProtocolsFilesNames(){
			$path = storage_path( 'ballot_boxes_protocols');

			$files = scandir($path, 1);
			foreach($files as $f){
				$ballot = BallotBox::where('name_protocol_image', 'like', "%$f")->first();
				dump($ballot, "$path/$f", "/mnt/files/shas_prod/ballot_boxes_protocols//$f");
				if($ballot && $ballot->mi_iron_number){
					dump('exists'. $ballot->mi_iron_number, "$path/$f", "$path/$ballot->mi_iron_number");
					rename("$path/$f", "$path/$ballot->mi_iron_number.jpg");
				}else{
					dump('exists- not');
				}
			}
		}

		public function UpdateMultiActivistsPaymentFormCsvFile(){
			// 
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			$path = storage_path( 'app/update_activists_payments.csv');
			$file = fopen($path, "r");
			$i = 0;
			$logErrors = [];
			$userId = 626;
			$now = Carbon::now()->toDateTimeString();

			while ($data = fgetcsv($file)) {
				$i++;
				Log::info($i);
				Log::info($data);

				$tz = $data[0];
				$captainSum = $data[3];
				$clusterLeaderSum = $data[4];
				$captainBonus = $data[5];
				$captainComment = $data[6];

				if($i == 1){ continue; }

				$voter = Voters::select('id')->where('personal_identity', $tz)->first();
				if(!$voter){
					$logErrors[] = [
						'error' => 'לא קיים בוחר',
						'personal_identity' => $tz
					];
				}
				$captain = ElectionRolesByVoters::
				where('voter_id', $voter->id)
				->where('election_campaign_id', $currentCampaignId)
				->where('election_role_id', 2)
				->first();
				if(!$captain){
					$logErrors[] = [
						'error' => 'לא קיים שר 100',
						'personal_identity' => $tz
					];
				} else {
					$captain->sum = $captainSum;
					if(!empty($captainComment)){
						$captain->comment = $captainComment;
					}
					$captain->user_lock_id = $userId;
					$captain->lock_date = $now;
					if($captainSum == 0){
						$captain->not_for_payment = 1;
					}
					$captain->save();
				}
				$clusterLeader = ElectionRolesByVoters::
				where('voter_id', $voter->id)
				->where('election_campaign_id', $currentCampaignId)
				->where('election_role_id', 5)
				->first();
				if(!$clusterLeader){
					$logErrors[] = [
						'error' => 'לא קיים ראש אשכול',
						'personal_identity' => $tz
					];
				} else {
					$clusterLeader->sum = $clusterLeaderSum;
					$clusterLeader->user_lock_id = $userId;
					$clusterLeader->lock_date = $now;
					if($clusterLeaderSum == 0){
						$clusterLeader->not_for_payment = 1;
					}
					$clusterLeader->save();
				}
				if($captain){
					$bonus = ElectionRolesByVoters::
					where('voter_id', $voter->id)
					->where('election_campaign_id', $currentCampaignId)
					->where('election_role_id', 18)
					->first();
					if($captainBonus != 0){
						if(!$bonus){
							$bonus = new ElectionRolesByVoters;
							$bonus->voter_id = $voter->id;
							$bonus->election_campaign_id = $currentCampaignId;
							$bonus->election_role_id = 18;
							$bonus->phone_number = $captain->phone_number;
							$bonus->user_create_id = $userId;
							$bonus->user_update_id = $userId;
							$bonus->assigned_city_id = $captain->assigned_city_id;
							$bonus->key = Helper::getNewTableKey('election_roles_by_voters', 5);
						}
						$bonus->sum = $captainBonus;
						$bonus->user_lock_id = $userId;
						$bonus->lock_date = $now;
						$bonus->save();
					} else{
						if($bonus){
							$bonus->delete();
						}
					}
				}
				
			}
			Log::info('log_errors');
			Log::info(json_encode($logErrors));
		}
		public static function UpdateActivistsPaymentFormCsvFile(){
			// 
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			$path = storage_path( 'app/yerusalem_1.csv');
			$file = fopen($path, "r");
			$i = 0;
			$now = Carbon::now()->toDateTimeString();

			$logErrors = [];
			while ($data = fgetcsv($file)) {
				$i++;
				Log::info($i);
				Log::info($data);

				$tz = $data[1];
				$newSum = $data[3];
				$roleId = $data[3];

				$voter = Voters::select('id')->where('personal_identity', $tz)->first();
				if(!$voter){
					$logErrors[] = [
						'error' => 'לא קיים בוחר',
						'personal_identity' => $tz
					];
					continue;
				}
				$activist = ElectionRolesByVoters::
				where('voter_id', $voter->id)
				->where('election_campaign_id', $currentCampaignId)
				->where('election_role_id', $roleId)
				->first();

				if(!$activist){
					$logErrors[] = [
						'error' => 'תפקיד לא קיים בוחר',
						'personal_identity' => $tz
					];
					continue;
				}
				$geo = ElectionRolesGeographical::where('election_role_by_voter_id', $activist->id)
				->where('entity_type', DB::raw(4))
				->first();

				if(!$geo){
					$logErrors[] = [
						'error' => 'שיבוץ לא קיים בוחר',
						'personal_identity' => $tz
					];
					continue;
				}
				$activist->sum = $newSum;
				$activist->save();

				$geo->sum = $newSum;
				$geo->save();

			}
			Log::info($logErrors);
		}
		public static function UpdateActivistsPaidStatusFormCsvFile(){
			// 
			$currentCampaign = ElectionCampaigns::currentCampaign();
			$currentCampaignId = $currentCampaign->id;

			$path = storage_path( 'app/tora.csv');
			$file = fopen($path, "r");
			$i = 0;

			$logErrors = [];
			while ($data = fgetcsv($file)) {
				$i++;
				Log::info($i);
				Log::info($data);

				$tz = $data[0];
				$roleId = $data[1];

				$voter = Voters::select('id')->where('personal_identity', $tz)->first();
				if(!$voter){
					$logErrors[] = [
						'error' => 'לא קיים בוחר',
						'personal_identity' => $tz
					];
					continue;
				}
				$activist = ElectionRolesByVoters::
				where('voter_id', $voter->id)
				->where('election_campaign_id', $currentCampaignId)
				->where('election_role_id', $roleId)
				->first();

				if(!$activist){
					$logErrors[] = [
						'error' => 'תפקיד לא קיים בוחר',
						'personal_identity' => $tz
					];
					continue;
				}

				$activist->paid = 1;
				$activist->save();


			}
			Log::info($logErrors);
		}
	/** Found doubles activists roles in all activists */
	public function foundDoublesElectionRolesByVoters(){
		$currentCampaign =ElectionCampaigns::currentCampaign();
		$currentCampaignId = $currentCampaign->id;
		$allActivists = ElectionRolesByVoters::select(
			'election_roles_by_voters.id',
			'election_roles_by_voters.election_role_id',
			'election_roles_by_voters.phone_number',
			'voters.personal_identity'
		)->where('election_campaign_id', $currentCampaignId)->withVoter()->get();
		$votersActivistsHash = [];
		foreach($allActivists as $item){
			if(empty($votersActivistsHash[$item->personal_identity])){
				$votersActivistsHash[$item->personal_identity] = [];
			}
			if(empty($votersActivistsHash[$item->personal_identity][$item->election_role_id])){
				$votersActivistsHash[$item->personal_identity][$item->election_role_id] = [];
			}
			$votersActivistsHash[$item->personal_identity][$item->election_role_id][] = $item;

		}
		$doubleRoles = [];
		// Log::info(json_encode($votersActivistsHash));

		foreach($votersActivistsHash as $personal_identity => $voterElectionRoles){
			foreach ($voterElectionRoles as $role_id => $items) {
				if(count($items) > 1){
					$doubleRoles[$personal_identity] = $items;
				}
			}	
		}
		/** Sent to log doubles roles */
		Log::info(json_encode($doubleRoles));
	}
}

