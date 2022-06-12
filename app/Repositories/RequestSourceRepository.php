<?php

namespace App\Repositories;

use App\Models\RequestClosureReason;
use App\Models\RequestSource;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class RequestSourceRepository
{

    /**
     * @param int $id
     * @return RequestSource
     * @throws Exception
     */
    public static function getById($id)
    {
        $requestSource = RequestSource::where('id', $id)->first();
        if (!$requestSource)
            throw new Exception(config('errors.crm.REQUEST_SOURCE_NOT_EXISTS'));

        return  $requestSource;
    }

    public static function geIdtBySystemName($systemName)
    {
        $requestSource = RequestSource::where('system_name', $systemName)->first();
        if (!$requestSource)
            throw new Exception(config('errors.crm.REQUEST_SOURCE_NOT_EXISTS'));

        return  $requestSource->id;
    }
}
