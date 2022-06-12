<?php

namespace App\Enums;

abstract class ActionTopic
{
    const CANCEL_REQUEST =  'request.cancel';
    const TRANSFER_REQUEST = 'request.transfer';
    const CLOSE_REQUEST = 'request.close';
}
