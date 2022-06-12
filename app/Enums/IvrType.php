<?php

namespace App\Enums;

/**
 * Enum class of type Ivr that send o astriks
 */
abstract class IvrType
{
    const TYPE_DEFAULT = "default";
    const TYPE_ACTIVIST_VERIFICATION = "activist_verification";
    const TYPE_VOTE_REPORTING = "vote_reporting";
}
