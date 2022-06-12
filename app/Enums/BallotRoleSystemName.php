<?php

namespace App\Enums;

abstract class BallotRoleSystemName
{
    const BALLOT_LEADER = 'ballot_leader';
    const  BALLOT_VICE_LEADER = 'ballot_vice_leader';
    const BALLOT_MEMBER = 'ballot_member';
    const OBSERVER = 'observer';
    const COUNTER = 'counter';
}
