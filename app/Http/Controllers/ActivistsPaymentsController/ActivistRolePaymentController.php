<?php

namespace App\Http\Controllers\ActivistsPaymentsController;

use App\DTO\PaymentGroupCreatorDto;
use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Http\Requests\ActivistPaymentRequest;
use App\Http\Requests\ActivistRolePaymentRequest;
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
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistRolePaymentUpdator;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use stdClass;

class ActivistRolePaymentController extends Controller
{

    public static function downloadExcelFileBySearch(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        $jsonOutput = app()->make("JsonOutput");
        $searchObject = searchActivistService::getSearchActivistByPrams($request);
        $arrPaymentGroup = ActivistRolesPaymentService::downloadExcelPaymentRoleDetailsBySearchObject($searchObject);
        $jsonOutput->setData($arrPaymentGroup);
    }

    public static function update(Request $request, $activistRolePaymentId)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $activistRolePaymentRequest = new ActivistRolePaymentRequest();
            $activistRolePaymentRequest->id = $activistRolePaymentId;
            $activistRolePaymentRequest->sum = $request->input('sum');
            $activistRolePaymentRequest->comment = $request->input('comment');
            $activistRolePaymentRequest->user_lock_id = $request->input('user_lock_id');
            $activistRolePaymentRequest->not_for_payment = $request->input('not_for_payment');
            $activistRolePaymentRequest = ActivistRolePaymentUpdator::update($activistRolePaymentRequest);
            $jsonOutput->setData($activistRolePaymentRequest);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
}
