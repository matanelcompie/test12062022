<?php

namespace App\Http\Controllers\ActivistsPaymentsController;

use App\DTO\PaymentGroupCreatorDto;
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
use App\Libraries\Services\ActivistPayment\PaymentGroupCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use stdClass;

class CreatePaymentsController extends Controller
{


    public static function createPaymentsGroup(Request $request)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());
            $paymentGroupCreator = new PaymentGroupCreatorDto();
            $paymentGroupCreator->electionCampaignId = ElectionCampaigns::currentCampaign()->id;
            $paymentGroupCreator->shasBankId = $object->shasBankId;
            $paymentGroupCreator->paymentTypeId = $object->paymentTypeId;
            $paymentGroupCreator->paymentGroupName = $object->paymentGroupName;
            $paymentGroupCreator->isRecurringActivistPayment = $object->isRecurringActivistPayment;
            if ($paymentGroupCreator->isRecurringActivistPayment) {
                $paymentGroupCreator->arrActivistPayment = json_decode($object->arrSelectedRecord);
            } else {
                $paymentGroupCreator->arrPaymentGroupItem = json_decode($object->arrSelectedRecord);
            }

            PaymentGroupCreator::CreatePaymentsGroup($paymentGroupCreator);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    //function create new activist payment and add to existing group
    public static function addPaymentToExistingGroup(Request $request)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());

            $paymentGroupId = $object->payment_group_id;
            $arrSelectedRecord = json_decode($object->arrSelectedRecord);

            PaymentGroupCreator::addActivistPaymentsForExistingGroup($paymentGroupId, $arrSelectedRecord);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function create new activist payment and add to existing group
    public static function removeRecordActivistPaymentInGroup(Request $request)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());
            $activist_payment_key = $object->activist_payment_key;

            ActivistPaymentsService::removeRecordActivistPayment($activist_payment_key);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }




    //function update status by activist payment list

    public static function updateActivistPaymentStatus(Request $request)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $object = (object)($request->all());

            $arrActivistPaymentId = $object->arrActivistPaymentId;
            $paymentStatusSystemName = $object->paymentStatusSystemName;

            ActivistPaymentsService::updateActivistPaymentStatusByActivistId($arrActivistPaymentId, $paymentStatusSystemName);

            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function getListPaymentGroupOpen(Request $request)
    {

        try {
            $jsonOutput = app()->make("JsonOutput");
            $arrListPaymentGroupOpen = paymentsGroupService::getListOpenPaymentGroups();
            $jsonOutput->setData($arrListPaymentGroupOpen);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
