<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ShasBankDetails;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ShasBankDetailsService
{
    public static function getListShasBankDetails(){

        $listShasBank=ShasBankDetails::select(
            DB::raw('shas_bank_details.*'),
            'shas_bank_details.id as shas_bank_details_id',
            'bank_branches.branch_number as branch_number',
            'bank_branches.name as bank_branch_name',
            'bank_branches.bank_id',
            'banks.name as bank_name',
            DB::raw("concat(banks.name,' / ','סניף-',' ',bank_branches.branch_number,'/ חשבון- ',shas_bank_details.bank_account_number) as display_name")
        )
        ->withBankBranch()
        ->where('is_not_active',0)
        ->get();

        return $listShasBank;
    }
}
