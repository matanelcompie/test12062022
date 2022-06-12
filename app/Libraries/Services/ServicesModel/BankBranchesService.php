<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\BankBranches;
use App\Models\Banks;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoleShifts;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class BankBranchesService
{

    private static $colFieldsInCsv=[
        'bank_id',
        'branch_number',
        'name',
        'branch_address',
        'branch_city'
    ];


   public static function loadBankBranchesFromCsv($csvLocation){
	   
		$bankBranchCSV = storage_path('\\app\\'.$csvLocation);//."\\".$csvLocation;
		$originalFile = fopen($bankBranchCSV, 'r');
        $countInsert=0;
    
		while ( ($fileData = fgetcsv($originalFile)) !== false ) {
            if($countInsert==0){
                $countInsert++;
                continue;
            }
        
            $index_branch_number=array_search('branch_number',self::$colFieldsInCsv);
            $index_Bank_id=array_search('bank_id',self::$colFieldsInCsv);
            //check if exist by bank id and branch number
            if(self::isExist($fileData[$index_Bank_id],$fileData[$index_branch_number]))
            continue;

            $newBankBranch=new BankBranches();
            Log::info($fileData);
            for ($i=0; $i <count(self::$colFieldsInCsv) ; $i++) { 
                $nameField=self::$colFieldsInCsv[$i];
                //update field from csv row 
                Log::info(($fileData[$i]));
                $newBankBranch->$nameField=ltrim($fileData[$i]);
            }
            $newBankBranch->save();
            $countInsert++;
        }

        fclose($originalFile);	
	  
        echo 'insert '. $countInsert.' record from csv';
   }

   public static function isExist($bank_id,$branch_number){
    $bankBranch = BankBranches::select()->where('bank_id',$bank_id)->where('branch_number',$branch_number)->first();

    if($bankBranch)
    return $bankBranch;


    return false;
   }
   public static function getBanksBranchesTree(){
        return Banks::select('banks.id', DB::raw("CONCAT(name,' (',id,')') AS name"))->with(['branches' => function($q){
            $q->select('id','bank_id', 'branch_number', DB::raw("CONCAT(name,' (',branch_number,')') AS name"));
        }])->get();
   }
}