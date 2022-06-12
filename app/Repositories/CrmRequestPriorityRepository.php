<?php

namespace App\Repositories;

use App\Models\CrmRequestPriority;
use App\Models\RequestClosureReason;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class CrmRequestPriorityRepository
{

    /**
     * @param int $id
     * @return CrmRequestPriority
     * @throws Exception
     */
    public static function getById($id)
    {
        $crmRequestPriority = CrmRequestPriority::where('id', $id)->first();
        if (!$crmRequestPriority)
            throw new Exception(config('errors.crm.REQUEST_PRIOTIY_NOT_EXISTS'));

        return  $crmRequestPriority;
    }
}
