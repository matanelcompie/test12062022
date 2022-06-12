<?php

namespace App\Enums;


abstract class VerifyBankStatuses
{
    const ALL_DETAILS_COMPLETED = 0;
    const NOT_ALL_DETAILS_COMPLETED = 1;
    const BANK_DETAILS_MISSING = 2;
    const VERIFIED_DOCUMENT_MISSING = 3;
    const BANK_NOT_VERIFIED = 4;
    const BANK_NOT_UPDATED = 5;
}
