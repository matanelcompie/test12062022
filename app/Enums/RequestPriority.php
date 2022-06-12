<?php

namespace App\Enums;

abstract class RequestPriority
{
    const NORMAL = 1;
    const MEDIUM = 2;
    const HIGH = 3;
    const HASH_NAME = [
        self::NORMAL => 'רגילה',
        self::MEDIUM => 'בינונית',
        self::HIGH => 'גבוהה',
    ];
}
