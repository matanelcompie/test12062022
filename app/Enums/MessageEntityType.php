<?php

namespace App\Enums;

/**
 * Enum class of type entity that send message
 */
abstract class MessageEntityType
{
    const ENTITY_TYPE_VOTER = 0;
    const ENTITY_TYPE_REQUEST = 1;
    const ENTITY_TYPE_ACTIVIST = 2;
}
