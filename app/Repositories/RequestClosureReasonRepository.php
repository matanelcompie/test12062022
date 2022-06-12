<?php

namespace App\Repositories;

use App\Models\RequestClosureReason;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class RequestClosureReasonRepository
{

    /**
     * @param int $id
     * @return RequestClosureReason
     * @throws Exception
     */
    public static function getById($id)
    {
        $reqClosureReason = RequestClosureReason::where('id', $id)->first();
        if (!$reqClosureReason)
            throw new Exception(config('errors.crm.MISSING_CLOSURE_REQUEST_REASON'));

        return  $reqClosureReason;
    }
}
