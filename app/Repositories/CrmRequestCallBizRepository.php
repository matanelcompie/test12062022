<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\UserLogin\AuthService;
use App\Models\Action;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\CrmRequestCallBiz;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Teams;
use App\Models\User;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class CrmRequestCallBizRepository
{
    /**
     * 

     * @return CrmRequestCallBiz
     */
    public static function insert($crmRequestId, $callBizId, $callBizDateTime, $callBizDetails)
    {
        $newCallbiz = new CrmRequestCallBiz();
        $newCallbiz->request_id = $crmRequestId;
        $newCallbiz->callbiz_id = $callBizId;
        $newCallbiz->user_create_id = Auth::user()->id;
        $callBizDateTime = date("Y-m-d H:i:s", strtotime($callBizDateTime));
        $newCallbiz->date = $callBizDateTime;
        $newCallbiz->details = $callBizDetails;
        $newCallbiz->key = Helper::getNewTableKey('request_callbiz', 10);
        $newCallbiz->save();

        return $newCallbiz;
    }

    public static function getHistoryModelInsertCallBiz(CrmRequestCallBiz $newCallbiz)
    {

        $callBizFields = [
            'request_id',
            'callbiz_id',
            'user_create_id',
            'date',
            'details'
        ];


        $historyFieldsNames = [];
        for ($fieldIndex = 0; $fieldIndex < count($callBizFields); $fieldIndex++) {
            $fieldName = $callBizFields[$fieldIndex];

            $historyFieldsNames[$fieldName] = config('history.CrmRequestCallBiz.' . $fieldName);
        }

        $fieldsArray = [];
        foreach ($historyFieldsNames as $fieldName => $display_field_name) {
            $insertFields = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name
            ];

            if ('details' == $fieldName || 'date' == $fieldName) {
                $insertFields['new_value'] = $newCallbiz->{$fieldName};
            } else {
                $insertFields['new_numeric_value'] = $newCallbiz->{$fieldName};
            }

            $fieldsArray[] = $insertFields;
        }

        $model = [
            'description' => 'הוספת פניה ממוקד פניות',
            'referenced_model' => 'CrmRequestCallBiz',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $newCallbiz->id,
            'valuesList' => $fieldsArray
        ];

        return $model;
    }
}
