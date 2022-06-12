<?php

namespace App\Enums;

abstract class RequestStatusType
{
    const REQUEST_STATUS_NEW = 1;
    const REQUEST_STATUS_PROCESS = 2;
    const REQUEST_STATUS_CLOSED = 3;
    const REQUEST_STATUS_CANCELED = 4;
}
