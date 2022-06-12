<?php

namespace App\Libraries\Services\ServicesModel;

use App\Libraries\Helper;
use App\Models\BankBranches;
use App\Models\BankDetails;
use App\Models\ElectionCampaigns;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class BankDetailsService
{

    /**
     * @function checkBankDetailsValidation
     * Check if bank details is valid.
     * - Send post request, to external bank validation api. 
     * @param (int) $bankCode - bank code number
     * @param (int) $branchCode - bank branch code number
     * @param (int) $accountNumber - bank account number
     * @returns (bool) Bank details are valid or not.
     */
    public static function checkBankDetailsValidation($bankCode, $branchCode, $accountNumber)
    {
        $postFields = [
            'BankCode' => $bankCode,
            'BranchCode' => $branchCode,
            'AccountNumber' => $accountNumber,
            "VerifyBranchNumber" => true,
            "Credentials" => [
                "CompanyID" => "58963938",
                // "APIKey" => env('MY_OFFICE_GUY_API_KEY', 'TUjPchRY1i6oCuPfOWIOJtrQKGVUdUFG17Cnrxe4HSKfK4a0Ac')
                "APIKey" => env('MY_OFFICE_GUY_API_KEY', '3yZb0FHMTdMI9HvlkX3oKePNAE1LzdWeCjB4KTF1YAzIWKJkJo')
            ]
        ];
        $BASE_URL = 'https://www.myofficeguy.com/api/accounting/general/verifybankaccount/';
        $myHeader = array(
            "accept: text/plain",
            "Content-Type: application/json-patch+json"
        );
        // Log::info('checkBankDetailsValidation');

        // Log::info(json_encode($postFields));

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
        curl_setopt($ch, CURLOPT_URL, $BASE_URL);
        $postResult = curl_exec($ch);
        curl_close($ch);

        // Log::info($postResult);
        $result = false;
        if (!empty($postResult)) {
            $postResultJson = json_decode($postResult);
            if ($postResultJson->Data && $postResultJson->Data->Result) {
                $result = true;
            }
        }

        return  $result;
    }


    /**
     * Get bank details object by voter id
     * @throws Exception if not exist bank details of voter
     * @param [type] $voterId 
     * @return BankDetails
     */
    public static function getByVoterId($voterId)
    {
        $bankDetails = BankDetails::where('voter_id', $voterId)->first();
        if (!$bankDetails) {
            throw new Exception(config('errors.elections.BANK_DETAILS_MISSING'));
        }

        return $bankDetails;
    }


    public static function checkAllNotValidBankDetails()
    {
        $allNotValidBankDetails = BankDetails::select('id', 'bank_number', 'bank_branch_number', 'bank_account_number')
            ->whereNull('is_bank_pass_validation')
            // ->limit(1000)
            ->get();
        foreach ($allNotValidBankDetails as $bankDetails) {
            $result = self::checkBankDetailsValidation($bankDetails->bank_number, $bankDetails->bank_branch_number, $bankDetails->bank_account_number);
            Log::info("$bankDetails->id =>, $bankDetails->bank_number, $bankDetails->bank_branch_number, $bankDetails->bank_account_number $result");
            $bankDetails->is_bank_pass_validation = $result ? 1 : 0;
            $bankDetails->save();
        }
    }
    public  static function checkIfBankDetailsExistsInOldElection()
    {
        $oldElectionTableName = 'bank_details_election_24';
        $bankDetailsFields = [
            'bank_details.id', "$oldElectionTableName.is_bank_verified as is_bank_verified_prev_election"
        ];
        $bankMainFields = ['bank_number', 'bank_branch_number', 'bank_account_number'];
        foreach ($bankMainFields as $item) {
            $bankDetailsFields[] = "$oldElectionTableName.$item as $item" . '_prev_election';
            $bankDetailsFields[] = "bank_details.$item";
        }
        //Need to check if bank details are same!
        $allValidBankDetails = BankDetails::select($bankDetailsFields)
            ->leftJoin($oldElectionTableName, "$oldElectionTableName.voter_id", 'bank_details.voter_id')
            // ->where("$oldElectionTableName.validation_election_campaign_id", 24)
            ->where("bank_details.validation_election_campaign_id", 26)
            ->where('bank_details.is_bank_verified', 1)
            ->get();
        foreach ($allValidBankDetails as $bankDetails) {
            Log::info($bankDetails->toArray());
            $isBankVerified = false;
            if ($bankDetails->is_bank_verified_prev_election == 1) {
                if (
                    $bankDetails->bank_number == $bankDetails->bank_number_prev_election &&
                    $bankDetails->bank_branch_number == $bankDetails->bank_branch_number_prev_election &&
                    $bankDetails->bank_account_number == $bankDetails->bank_account_number_prev_election
                ) {
                    $isBankVerified = true;
                }
                // $bankDetails->save();
            }
            if (!$isBankVerified) {
                $bankDetails->is_bank_verified = 0;
                $bankDetails->validation_election_campaign_id = 24;
                $bankDetails->save();
                Log::info('not_bank_verified_election_24' . $bankDetails->id);
            } else {
                Log::info('bank_verified_election_24' . $bankDetails->id);
            }
            Log::info(
                "$bankDetails->bank_number == $bankDetails->bank_number_prev_election ,
            $bankDetails->bank_branch_number == $bankDetails->bank_branch_number_prev_election ,
            $bankDetails->bank_account_number == $bankDetails->bank_account_number_prev_election " .
                    $bankDetails->bank_number == $bankDetails->bank_number_prev_election &&
                    $bankDetails->bank_branch_number == $bankDetails->bank_branch_number_prev_election &&
                    $bankDetails->bank_account_number == $bankDetails->bank_account_number_prev_election
            );
        }
    }

    // process that update all branch id for bank details 
    //the process create because we add new column -branch_id in bank details table
    public static function updateBranchIdForAllBankDetails()
    {

        $bankDetailsArr = BankDetails::select()->get();

        foreach ($bankDetailsArr as $key => $bankDetails) {
            if (!is_null($bankDetails->bank_number)) {
                $bankBranch = BankBranchesService::isExist($bankDetails->bank_number, $bankDetails->bank_branch_number);
                if (!$bankBranch) {
                    $newBranch = new BankBranches();
                    $newBranch->branch_number = $bankDetails->bank_branch_number;
                    $newBranch->bank_id = $bankDetails->bank_number;
                    $newBranch->name = $bankDetails->bank_branch_name;
                    $newBranch->save();
                    Log::info('insert ' . $newBranch->id);
                } else {
                    $bankDetails->bank_branch_id = $bankBranch->id;
                    $bankDetails->save();
                }
            }
        }
    }

    // function return global data need for details bank
    public static function getArrFieldBankDetails($include_table = true)
    {
        $electionCampaignId=ElectionCampaigns::currentCampaign()->id;
        if ($include_table)
            return [ //bank details
                'bank_details.voter_id',
                'bank_details.bank_branch_id',
                'bank_details.is_bank_verified',
                'bank_branches.branch_number',
                'bank_branches.name as branch_name',
                'bank_branches.bank_id',
                'banks.name as bank_name',
                'bank_details.bank_account_number',
                'bank_details.bank_owner_name',
                DB::raw(BankDetailsService::getStringFieldQueryForValidBank($electionCampaignId))
            ];

        else
            return ['is_bank_verified', 'branch_number', 'bank_id', 'bank_account_number', 'bank_name', 'bank_owner_name','bank_branch_id'];
    }

    public static function getStringFieldQueryForValidBank($electionCampaignId){
     return "
     (case when bank_details.bank_account_number is not null 
     and bank_details.verify_bank_document_key is not null
     and bank_details.is_bank_verified=1
     and bank_details.validation_election_campaign_id=".$electionCampaignId."
     then 1
     else 0 
     end)
      as is_bank_valid    
        ";
    }

    /**
     * function get old current bank details and last current bank details
     * function throw Exception check if the old current is wrong and if the last current bank not change details any details
     * @throws Exception
     * @param  $oldBankDetails
     * @param  $lastBankDetails
     * @return void
     */
    public static function checkIsValidUpdateWrongBankDetails($oldBankDetails, $lastBankDetails)
    {
        if (
            $oldBankDetails->is_bank_wrong &&
            $oldBankDetails->bank_account_number == $lastBankDetails->bank_account_number
            &&
            $oldBankDetails->bank_branch_number == $lastBankDetails->bank_branch_number
        ) {
            throw new Exception(config('errors.elections.ERROR_UPDATE_WRONG_BANK'));
        }
    }


    public static function updateBankDetailsWrongByVoterId($voterId)
    {
        $bankDetails = self::getByVoterId($voterId);
        $bankDetails->is_bank_wrong = 1;
        $bankDetails->is_bank_verified = 0;
        $bankDetails->save();
    }

    public static function uploadCsvFileForCheckBankDetails()
    {
        $bankDetailsCsv = storage_path('\\app\\' . 'bankDetails.csv'); //."\\".$csvLocation;
        $originalFile = fopen($bankDetailsCsv, 'r');

        while (($fileData = fgetcsv($originalFile)) !== false) {
           // $tz = preg_replace('/\s+/', '', $fileData[0]);
          //  $personal_identity = Helper::trimStartZero($tz); //tz captain
            $bank = $fileData[0];
            $branch = $fileData[1];
            $accountNumber = $fileData[2];

            $isValid = self::checkBankDetailsValidation($bank, $branch, $accountNumber);
            Log::info($accountNumber . '-isValid' . ($isValid?'true':'false'));
        }

        fclose($originalFile);
    }

}
