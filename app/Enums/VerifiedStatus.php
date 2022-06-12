<?php

namespace App\Enums;


abstract class VerifiedStatus
{
    const NO_MESSAGE_SENT = 0;
    const MESSAGE_SENT = 1;
    const VERIFIED = 2;
    const REFUSED = 3;
    const MORE_INFO = 4;
}
