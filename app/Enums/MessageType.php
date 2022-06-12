<?php

namespace App\Enums;

abstract class MessageType
{
    const MESSAGE_TYPE_EMAIL = 0;
    const MESSAGE_TYPE_SMS = 1;
    const MESSAGE_TYPE_IVR = 2;
}
