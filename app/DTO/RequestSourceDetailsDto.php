<?php

namespace App\DTO;

use App\Enums\MessageTemplate;
use App\Libraries\Services\SendMessage\SendMessageDto;
use App\Libraries\Services\SendMessage\SendMessageService;
use App\Libraries\Services\ServicesModel\VoterPhoneService;
use App\Models\CrmRequest;
use App\Models\CrmRequestPriority;
use App\Models\RequestClosureReason;
use App\Models\RequestSource;
use App\Models\RequestStatus;
use App\Models\RequestTopic;
use App\Models\Teams;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\TeamRepository;
use App\Repositories\UserPhonesRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Illuminate\Support\Facades\Log;

class RequestSourceDetailsDto
{   public $oldRequestSourceName;
    
    public $requestSourceFax;
   
    public $requestSourceEmail;

    public $requestSourceFirstName;
    public $requestSourceLastName;
    public $requestSourcePhone;

    public $newCallBizID;
    public $newCallBizDatetime;
    public $newCallBizDetails;
}
