<?php

namespace App\DTO;

use App\Enums\CommonEnum;
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
use App\Models\User;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\TeamRepository;
use App\Repositories\UserPhonesRepository;
use App\Repositories\VoterPhoneRepository;
use App\Repositories\VotersRepository;
use Illuminate\Support\Facades\Log;

class CrmRequestDto
{

    public $crmRequestKey;


    /**
     * @var RequestTopic
     */
    public $requestTopic;

    /**
     * @var RequestTopic
     */
    public $requestSubTopic;

    /**
     * @var RequestClosureReason
     */
    public $requestClosureReason;

    public $newActionType;

    /**
     * number between 1-5
     * @var int 
     */
    public $voterSatisfaction;

    /**
     * @var RequestStatus
     */
    public $requestStatus;

    /**
     * @var CrmRequestPriority
     */
    public $crmRequestPriority;

    /**
     * @var RequestSource
     */
    public $requestSource;

    /**
     * @var RequestSourceDetailsDto
     */
    public $requestSourceDetails;

    /**
     * Request action enum
     *
     * @var int
     */
    public $requestActionType;

    public $requestActionDetails;

    /**
     * @var User
     */
    public $userHandler;

    /**
     * @var Teams
     */
    public $teamHandler;

    /**
     * @var string
     */
    public $requestClosureReasonDescription;

    public $targetCloseDate;

    public $requestDate;

    public $requestDescription;

    /**
     * CommonEnum
     */
    public $sendEmailOfCloseRequestToVoter;
    /**
     * CommonEnum
     */
    public $sendEmailOfCloseRequestToVoterIncludeResson;
    public $documentName;

    public $fileToUpload;

    public $staticSubTopicName;
}
