<?php

namespace App\Enums;

abstract class CsvParserStatus
{
    const CSV_PARSER_STATUS_DID_NOT_START = 0;
    const CSV_PARSER_STATUS_AT_WORK      = 1;
    const CSV_PARSER_STATUS_SUCCESS      = 2;
    const CSV_PARSER_STATUS_ERROR        = 3;
    const CSV_PARSER_STATUS_WAITING      = 4;
    const CSV_PARSER_STATUS_CANCELLED    = 5;
    const CSV_PARSER_STATUS_RESTARTED    = 6;
}
