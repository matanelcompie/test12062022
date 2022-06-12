<?php

namespace App\Console\Commands;

use App\Http\Controllers\Transfer\TransferController;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Models\Voters;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class CompareVotersFromCsvCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    // 1. cd /var/www/html/shas_elections_qa or cd /var/www/html/shas_prod 
    // 2. sudo php artisan voters:compare-voters-from-csv description comment 0 200
    // password : One1erp!
    
    protected $signature = 'voters:compare-voters-from-csv {description?} {comment?} {from?} {limit?} {processId?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for long transfer proccess';

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
        $description = $this->argument("description");
        $comment = $this->argument("comment");
        $from = $this->argument("from", 0);
        $limit = $this->argument("limit", 0);
        $processId = $this->argument("processId", 0);
        $from = $from ? intval($from) : 0;
        $limit = $limit ? intval($limit) : 1000;
        $this->compareVotersFromCsv($description, $comment, $from, $limit, $processId);
    }
	private static function  compareVotersFromCsv($description = null, $comment = null, $from, $limit, $processId){
        if(empty($processId)){
            $processId = DB::table('comparison_processes')->insertGetId([
                'description' => $description,
                'comment' => $comment
            ]);
        }

        $votersForCompare = DB::table('comparison_name_list_source')
        ->Where('status', 0)
        ->WhereRaw('LENGTH(firstN) > 0 AND LENGTH(lastN) > 0')
        ->skip($from)
        ->limit($limit)
        ->get();
        // echo $votersForCompare;
        // die;
        $i = 0;
        foreach($votersForCompare as $tempVoter){
            $i++;
            if($i > $limit) { dump("index-$i"); return; } 
            dump("index-in->$i | tempVoter: $tempVoter->id");
            //!! Every letter in hebrew is 2 chars in utf8!!!!!
            $chars = 4;
            $firstName = substr(trim($tempVoter->firstN), 0, $chars * 2); 
            $lastName = substr(trim($tempVoter->lastN), 0, $chars * 2);
            $gender = ($tempVoter->gender == 'F') ? 2 : 1;
            $tempVoterAgeQuery = "abs((2021-year(birth_date))-$tempVoter->age)<5";

            dump("$firstName, $tempVoter->firstN");
            dump("$lastName, $tempVoter->lastN") ;
            $whereList = [
                ['first_name' , 'like', "$firstName%"],
                ['last_name' , 'like', "$lastName%"],
            ];
            $foundVoters = Voters::select('id')
            ->where(function($q) use($gender){
                $q->where('gender' , '=', $gender)->orWhereNull('gender');
            })
            ->where($whereList)
            ->whereRaw($tempVoterAgeQuery)
            ->get();

            echo(json_encode($foundVoters));
            // Log::info($foundVoters->toSql());
            // Log::info($foundVoters->getBindings());
            // die;
            $rowStatus = 4;
            
            $numberOfResults = $foundVoters->count();
            dump($numberOfResults);
            if($numberOfResults >  0 ){ 
                // dump($numberOfResults, $foundVoters);
                if($numberOfResults  == 1){ // Found single row
                    $rowStatus = 1;
                    $insertVoters = true;
                } else if($numberOfResults > 1 && $numberOfResults <= 5){ //Found multiple rows
                    $rowStatus = 2;
                    $insertVoters= true;
                } else if($numberOfResults > 5 ){ // Found more then 5 results 
                    $rowStatus = 3;
                    $insertVoters= false;
                }
                if($insertVoters){
                    foreach($foundVoters as $voter){
                        DB::table('comparison_voters_names_results')->insert([
                            'comparison_process_id' => $processId,
                            'voter_id' => $voter->id,
                            'comparison_name_list_source_id' => $tempVoter->id
                        ]);
                    }
                }
            }
            DB::table('comparison_name_list_source')->where('id', $tempVoter->id)->update([
                'status' => $rowStatus,
                'count' => $numberOfResults
            ]);
        }
    }
   
}
