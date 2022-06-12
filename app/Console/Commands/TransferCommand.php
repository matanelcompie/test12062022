<?php

namespace App\Console\Commands;

use App\Http\Controllers\Transfer\TransferController;
use App\Libraries\Services\activists\UploadExcelActivist;
use App\Libraries\Services\activists\UploadExcelDonorsActivist;
use App\Libraries\Services\municipal\MunicipalCaptainActivistReport;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Libraries\Services\ServicePayments\ManagerMasavService;
use App\Libraries\Services\ServicesModel\BankBranchesService;
use App\Libraries\Services\ServicesModel\BankDetailsService;
use App\Libraries\Services\ServicesModel\CallsService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleProcessForArrangeSystem;
use App\Models\ActivistAllocationAssignment;
use App\Models\BankDetails;
use App\Models\ElectionRolesByVoters;
use App\Models\VoterPhone;
use App\Models\Voters;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TransferCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transfer:command-for-transfer-functions {arg1} {arg2}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command for long transfer process';

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
        
        BankDetailsService::uploadCsvFileForCheckBankDetails();
        //SendMessageService::sendIvrVoiceToArrPhoneNumber();
        // ElectionRoleProcessForArrangeSystem::arrange27Election();
        //UploadExcelDonorsActivist::uploadFile();
        //ElectionRoleProcessForArrangeSystem::updateClustersElectionsRolesPaymentsTable();
        //ElectionRoleProcessForArrangeSystem::updateBallotsElectionsRolesPaymentsTable();
        // ElectionRoleProcessForArrangeSystem::arrangeBonusRecordDev();
        // ElectionRoleProcessForArrangeSystem::ArrangeElectionRoleBonusForNewSystemRules();
        // ElectionRoleProcessForArrangeSystem::updateBallotsElectionsRolesPaymentsTable();
        // ElectionRoleProcessForArrangeSystem::updateClustersElectionsRolesPaymentsTable();
        //TransferController::up
    }

    public static function updateVerified(){
        VoterPhone::whereNull('verified')->update(['verified'=>0]);
    }

    
    public static function updateStreetIdVoters($election_campaign_id){

        $query= Voters::withVoterInElectionCampaigns()
         ->where('election_campaign_id',$election_campaign_id)
         ->where('mi_street','<>','')
         ->whereNotNull('mi_street')
         ->whereNull('mi_street_id')
         ->update([
             'mi_street_id'=>DB::raw('select id from streets where name=voters.mi_street and deleted=0 and city_id=voters.mi_city_id order by id desc limit 1')
         ])->toSql();
 
         Log::info($query);
     }





   
}
