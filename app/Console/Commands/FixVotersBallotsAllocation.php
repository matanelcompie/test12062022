<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use App\Models\VoterBookRows;
use App\Models\BallotBox;
use App\Models\VotersInElectionCampaigns;

class FixVotersBallotsAllocation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'voters:ballot-fix-allocation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'fix voters allocation after loading ballot file';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->fixVotersBallotAllocation();
    }

    private function fixVotersBallotAllocation(){
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

			$skip += $limitRows;
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
		} while (count($VoterBookRows) > 0);

	}
}
