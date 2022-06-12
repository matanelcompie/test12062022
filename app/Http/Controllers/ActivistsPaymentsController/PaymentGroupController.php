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

class PaymentGroupController extends Controller
{

    public static function downloadExcelFile(Request $request, $paymentGroupId)
    {
        $jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);
        paymentsGroupService::downloadExcelPaymentDetailsInGroup($paymentGroupId);
    }
}
