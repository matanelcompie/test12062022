<?php

namespace App\Http\Controllers\ActivistsPaymentsController;

use App\DTO\PaymentGroupCreatorDto;
use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Http\Requests\ActivistPaymentRequest;
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
use App\Libraries\Services\ActivistPayment\ActivistPaymentUpdator;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ActivistPayment\PaymentGroupCreator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Repositories\ActivistPaymentRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use stdClass;

class ActivistPaymentController extends Controller
{
    public static function update(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $activistPaymentRequest = new ActivistPaymentRequest();
        $activistPaymentRequest->id = $request->input('id');
        $activistPaymentRequest->reason_status_id = $request->input('reason_status_id');
        $activistPaymentRequest->comment = $request->input('comment');
        $activistPaymentRequest->status_id = $request->input('status_id');
        ActivistPaymentUpdator::update($activistPaymentRequest);
        $jsonOutput->setData(true);
    }

    public static function getRecurringActivistPayments(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $result = ActivistPaymentRepository::getRecurringActivistPaymentToPay();
        $countNotValidBank=0;
        $countValid=0;
       
        foreach ($result as $key => $activistPayment) {
           
            if (!$activistPayment->voterDefaultBankDetails || !$activistPayment->voterDefaultBankDetails->is_bank_valid) {
                $countNotValidBank++;
            }
            else
            $countValid++;
        }

        $result=array(
            'arrPaymentGroupItem'=> $result,
            'countNotValidBank'=>$countNotValidBank,
            'countValid'=> $countValid
       );
        $jsonOutput->setData($result);
    }
}
