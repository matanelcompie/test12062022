<?php

namespace App\Http\Controllers\ActivistsPaymentsController;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Models\Tm\PossibleAnswer;
use App\Models\Voters;

use App\Models\ElectionCampaigns;
use App\Models\City;
use App\Models\Streets;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;


use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Repositories\ActivistRolesPaymentsRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use stdClass;

class searchActivistPaymentController extends Controller {
    
    public function searchActivistPayment(Request $request) {
        //searchActivistService::searchActivistByPrams($request);
    }
    public static function getDetailsSummeryActivistPayment(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $searchObjectDetails=searchActivistService::getSearchActivistByPrams($request);
            $detailsSummeryPaymentActivist=ActivistPaymentsService::getSummeryDetailsPaymentActivist($searchObjectDetails);
            $jsonOutput->setData($detailsSummeryPaymentActivist);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function getDetailsAllPaymentsActivist(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        try {
            $searchObjectDetails=searchActivistService::getSearchActivistByPrams($request);   
            $voter_key = $request->input('voter_key', null); 
            $voter=Voters::select('id')->where('key',$voter_key)->first();
            $searchObjectDetails->voterId= $voter->id;
            $detailsSummeryPaymentActivist=ActivistRolesPaymentsRepository::getListPaymentsByVoter($searchObjectDetails);
            $jsonOutput->setData($detailsSummeryPaymentActivist);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //get list role without payment id
    public static function getAllRoleVoterWithoutPaymentId(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $electionCampaignId=ElectionCampaigns::currentCampaign()->id;
            $objectSearchDetails=searchActivistService::getSearchActivistByPrams($request);
            $arrRoleVoterWithoutPayment=ActivistPaymentsService::getArrRoleNeedPayForAllUsers($electionCampaignId,$objectSearchDetails);
            $hashRoleActivistNeedPayments=ActivistPaymentsService::makeHashActivistRoleNeedPayments($arrRoleVoterWithoutPayment);
            $countNotValidBank=0;
            $countNotLockAmountForPaid=0;
            $countValidPaymentGroupItem=0;
            foreach ($hashRoleActivistNeedPayments as $key => $paymentGroupItem) {
                if (!$paymentGroupItem->bankDetails || !$paymentGroupItem->bankDetails->is_bank_valid) {
                    $countNotValidBank++;
                }
                if ($paymentGroupItem->lockAmountForPaid == 0) {
                    $countNotLockAmountForPaid++;
                }
                if($paymentGroupItem->isValidForPaid)
                $countValidPaymentGroupItem++;
            }
         
           $result=array(
                'arrPaymentGroupItem'=> Helper::hashToArray($hashRoleActivistNeedPayments),
                'countNotValidBank'=>$countNotValidBank,
                'countNotLockAmountForPaid'=>$countNotLockAmountForPaid,
                'countValidPaymentGroupItem'=> $countValidPaymentGroupItem
           );
           $jsonOutput->setData($result);
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function getArrGroupPayments(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $searchObject=searchActivistService::getSearchActivistByPrams($request);
            $arrPaymentGroup=paymentsGroupService::getArrPaymentGroupsBySearchDetailsWithSumAmount($searchObject);
            $jsonOutput->setData($arrPaymentGroup);
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function updateReferenceId(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());
            $transfer_date=Carbon::parse($object->transfer_date);
            $arrPaymentGroup=paymentsGroupService::updateReferenceId($object->payment_group_id,$object->reference_id,$transfer_date);
            
            $jsonOutput->setData($arrPaymentGroup);
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function downloadPaymentGroupFileMasav(Request $request){
        try {
            $jsonOutput = app()->make( "JsonOutput" );
            $jsonOutput->setBypass(true);
            $object = (object)($request->all());
            
            paymentsGroupService::downloadPaymentGroupFileMasav($object->paymentGroupId);
         
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }

    }

    public static function getListPaymentByPaymentGroup(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());
            $arrActivistPayments=ActivistPaymentsService::getListActivistPaymentByPaymentGroup($object->paymentGroupId);
            $jsonOutput->setData($arrActivistPayments);
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
        
    public static function removePaymentGroupByGroupId(Request $request){
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());
            $arrActivistPayments=paymentsGroupService::removePaymentGroup($object->paymentGroupId);
            $jsonOutput->setData($arrActivistPayments);
           
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function getPaymentRoleVoterDetails($electionRoleVoterId)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $arrActivistPayments = ActivistRolesPaymentsRepository::getPaymentsDetailsByRoleVoterId($electionRoleVoterId);
            $jsonOutput->setData($arrActivistPayments);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}