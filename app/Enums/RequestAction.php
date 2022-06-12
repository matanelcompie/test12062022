<?php

namespace App\Enums;

abstract class RequestAction
{
  const REQUEST_ACTION_TRANSFER_REQUEST = 1;
  const REQUEST_ACTION_CLOSE_REQUEST = 2;
  const REQUEST_ACTION_CANCEL_REQUEST = 3;
  const REQUEST_ACTION_UPDATE_REQUEST = 4;
}
