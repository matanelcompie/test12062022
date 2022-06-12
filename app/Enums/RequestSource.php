<?php

namespace App\Enums;

abstract class RequestSource
{
    const EMAIL = 'email';
    const OTHER = 'other';
    const FAX = 'fax';
    const CALLBIZ = 'callbiz';
    const APPLICATION = 'application';
}
