<?php

namespace App\Enums;

abstract class BallotAssignmentStatus
{
    const ALL_ROWS = -1;
    const NO_ASSIGNMENT = 0;
    const NO_OR_PARTIAL_ASSIGNMENT = 1;
    const PARTIAL_ASSIGNMENT = 2;
    const FIRST_SHIFT_ASSIGNMENT = 3;
    const SECOND_SHIFT_ASSIGNMENT = 4;
    const ASSIGNED_WITHOUT_COUNT = 5;
    const FULL_ASSIGNMENT = 6;
}
