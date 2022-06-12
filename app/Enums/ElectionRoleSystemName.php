<?php

namespace App\Enums;

abstract class ElectionRoleSystemName
{
    const ELECTION_GENERAL_WORKER = 'election_general_worker';
    const MINISTER_OF_FIFTY = 'captain_of_fifty';
    const CLUSTER_LEADER = 'cluster_leader';
    const MOTIVATOR = 'motivator';
    const DRIVER = 'driver';
    const BALLOT_MEMBER = 'ballot_member';
    const OBSERVER = 'observer';
    const COUNTER = 'counter';
    const MUNI_DIRECTOR = 'municipal_director';
    const MUNI_SECRETARY = 'municipal_secretary';
    const QUARTER_DIRECTOR = 'quarter_director';
    const OPTIMIZER_COORDINATOR = 'optimization_data_coordinator';
    const DRIVERS_COORDINATOR = 'drivers_coordinator';
    const MOTIVATOR_COORDINATOR = 'motivator_coordinator';
    const ALLOCATION_COORDINATOR = 'allocation_coordinator';
}
