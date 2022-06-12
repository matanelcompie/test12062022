<?php

namespace App\Repositories;

use App\Models\RequestClosureReason;
use App\Models\RequestStatus;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class RequestStatusRepository
{
    /**
     * @param int $id
     * @return RequestStatus
     * @throws Exception
     */
    public static function getById($id)
    {
        $requestStatus = RequestStatus::where('id', $id)->first();
        if (!$requestStatus)
            throw new Exception(config('errors.crm.REQUEST_STATUS_NOT_EXISTS'));

        return  $requestStatus;
    }


    public static function getAll($arrayField = false)
    {
        return RequestStatus::select($arrayField ? $arrayField : DB::raw('request_status.*'))->get();
    }
}
