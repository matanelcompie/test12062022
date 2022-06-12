<?php

namespace App\Libraries\Services\ServicesModel\ActivistPaymentService;

use App\Enums\PaymentStatus as EnumsPaymentStatus;
use App\Enums\PaymentType as EnumsPaymentType;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ExportFile\ExcelFileService;
use App\Libraries\Services\FileService;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistPaymentModels\PaymentType;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class paymentsGroupService
{
    //details for search masav by masav details
    public static $arrSearchFieldGroupPayments = [];



    public static function updateLocationFileCsv($payment_group_id, $location_file)
    {

        PaymentGroup::where('id', $payment_group_id)->update(['location_file' => $location_file]);
        return true;
    }

    //!!function for copy group for marcantil bank that limit 150 record in group file
    // public static function copyGroupPayment($group_payments)
    // {
    //     return self::insertNewGroupPayments($group_payments->payment_type_id, $group_payments->shas_bank_details_id, $group_payments->name, $group_payments->election_campaign_id);
    // }

    public static function getArrPaymentGroupsBySearchDetailsWithSumAmount($objectSearchDetails = null)
    {
        $allPaymentBySearchVoter=self::getAllPaymentGroupBySearchObject($objectSearchDetails);
        $arrPaymentGroupId=$allPaymentBySearchVoter->map(function($group){return $group->id;});
        // $arrayFieldPaymentGroup = searchActivistService::getArraySearchNameFieldOfPaymentGroup();
        // $objectDetailsSearchGroup = new stdClass();
        // if($objectSearchDetails){
        //     foreach ($objectSearchDetails as $key => $value) {
        //         if (in_array($key, $arrayFieldPaymentGroup)){
        //             $objectDetailsSearchGroup->$key = $value;
        //         }   
        //     }
        // }
      
        $arrField = [
            'payment_group.id as payment_group_id',
            'payment_group.transfer_date',
            'payment_group.created_at as payment_group_create_at',
            'payment_group.name as payment_group_name',
            'location_file',
            'payment_type_id',
            'shas_bank_details_id',
            'payment_group.election_campaign_id',
            'reference_id',
            'payment_type.name as payment_type_name',
            'payment_type.system_name as payment_type_system_name',
            //calculate sum of amount payment not incorrect for payment group
            DB::raw("concat(voters_create.first_name,' ',voters_create.last_name) as create_by_full_name"),
            DB::raw('CAST(sum(activist_payments.amount) AS UNSIGNED ) as sumAmount')
        ];

        $arrGroupPayment = PaymentGroup::select($arrField)
        ->whereIn('payment_group.id', $arrPaymentGroupId)
        ->withVoterCreate()
        ->withPaymentType()
        ->withActivistPayment()
        ->groupBy('payment_group.id')->get();


        //$query = searchActivistService::createQueryWithSearchDetails($query, $objectDetailsSearchGroup);

        return $arrGroupPayment;
    }

    public static function getAllPaymentGroupBySearchObject($objectSearchDetails)
    {
        $query = PaymentGroup::select(DB::raw('payment_group.*'))
        ->withVoterCreate()
        ->withPaymentType()
        ->withActivistPayment(true, true)
        ->leftJoin('cities as assigned_city', 'assigned_city.id', 'election_roles_by_voters.assigned_city_id')
        ->leftJoin('bank_details', 'bank_details.voter_id', 'voters.id');
        $query = searchActivistService::createQueryWithSearchDetails($query, $objectSearchDetails);

        return $query->get();
    }


    //update reference id of paymentGroup
    public static function updateReferenceId($paymentGroupId, $referenceId, $transfer_date)
    {
        DB::beginTransaction();
        try {
            $paymentGroup = PaymentGroup::select()->where('id', $paymentGroupId)->first();
            $countUpdate = PaymentGroup::where('id', $paymentGroupId)->update(['reference_id' => $referenceId, 'transfer_date' => $transfer_date]);

            //update all record payment group that its paid
            if (is_null($paymentGroup->reference_id)) {
                ActivistPayment::where('payment_group_id', $paymentGroupId)->update(['status_id' => PaymentStatus::getBySystemName(EnumsPaymentStatus::STATUS_PAID)]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }


    public static function downloadPaymentGroupFileMasav($paymentGroupId)
    {
        $paymentGroup = PaymentGroup::select()->where('id', $paymentGroupId)->first();
        $urlDirectory = config('constants.MASAVS_FILE_DIRECTORY');
        FileService::downloadFile($urlDirectory, "$paymentGroup->location_file.msv", $paymentGroup->location_file, 'msv');
    }

    //function remove payment group nd all activist payment only if payment group without reference id
    public static function removePaymentGroup($paymentGroupId)
    {

        $paymentGroup = PaymentGroup::select()->where('id', $paymentGroupId)->first();
        if (!is_null($paymentGroup->reference_id))
            throw new Exception(config('errors.payments.ERROR_DELETE_PAYMENT_GROUP'));

        DB::beginTransaction();
        try {
            //reset payment if of election role in group
            $activistRoleInGroup = ActivistRolesPayments::select('activist_roles_payments.id')
                ->withActivistPayment(true)
                ->where('activist_payments.payment_group_id', $paymentGroupId)->get();
            $ArrActivistRolePaymentId = $activistRoleInGroup->map(function ($a) {
                return $a->id;
            });
            ActivistRolesPayments::whereIn('id', $ArrActivistRolePaymentId)->update(['activist_payment_id' => null]);

            //delete activist payment record in group
            ActivistPayment::where('payment_group_id', $paymentGroupId)->delete();
            //delete group
            PaymentGroup::select()->where('id', $paymentGroupId)->delete();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    //function return list of payment group without reference id 
    public static function getListOpenPaymentGroups()
    {
        $listField = [
            'payment_group.id as payment_group_id',
            'payment_group.transfer_date',
            'payment_group.created_at as payment_group_create_at',
            'payment_group.name as payment_group_name',
            DB::raw("concat(voters_create.first_name,' ',voters_create.last_name) as create_by_full_name"),
            DB::raw("concat(payment_group.name,'נוצר בתאריך :',payment_group.created_at,' עי-',voters_create.first_name,' ',voters_create.last_name) as display_details")
        ];

        $listOpenPaymentGroup = PaymentGroup::select($listField)
            ->whereNull('reference_id')
            ->withVoterCreate()
            ->get();

        return $listOpenPaymentGroup;
    }

    public static function downloadExcelPaymentDetailsInGroup($paymentGroupId)
    {
        $arrActivistPaymentGroup = ActivistPaymentRepository::getActivistPaymentDetailsByGroupId($paymentGroupId);
        if ($arrActivistPaymentGroup->count() > 0) {
            $nameFile = $arrActivistPaymentGroup[0]->payment_group_name;
            $headers = [
                'תאריך העברה' => 'transfer_date',
                'שם קבוצה' => 'payment_group_name',
                'שם פעיל' => 'voter_name',
                'סכום' => 'amount',
                'סטטוס' => 'payment_status_name',
                'אסמכתא'=>'reference_id',
            ];
            if ($arrActivistPaymentGroup[0]->payment_type_system_name == EnumsPaymentType::BANK_TRANSFER) {
                $detailsTransfer = [
                    'בנק' => 'bank_id',
                    'סניף' => 'branch_number',
                    'מספר חשבון' => 'bank_account_number',
                    'תעודת זהות בעל החשבון  ' => 'bank_account_owner_id',
                    'בעל החשבון' => 'bank_account_owner_name',
                    'פרטי העברה' =>'full_bank_details'
                ];
            } else {
                $detailsTransfer = [
                    'מספר צק' => 'check_number',
                ];
            }

            $headers = array_merge($headers, $detailsTransfer);
        }

        ExcelFileService::download($headers, $arrActivistPaymentGroup, $nameFile);
    }
}
