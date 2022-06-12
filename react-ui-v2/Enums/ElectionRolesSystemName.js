export class ElectionRoleSystemName
{
    static ELECTION_GENERAL_WORKER = 'election_general_worker';
    static MINISTER_OF_FIFTY = 'captain_of_fifty';
    static CLUSTER_LEADER = 'cluster_leader';
    static MOTIVATOR = 'motivator';
    static DRIVER = 'driver';
    static BALLOT_MEMBER = 'ballot_member';
    static OBSERVER = 'observer';
    static COUNTER = 'counter';
    static MUNI_DIRECTOR = 'municipal_director';
    static MUNI_SECRETARY = 'municipal_secretary';
    static QUARTER_DIRECTOR = 'quarter_director';
    static OPTIMIZER_COORDINATOR = 'optimization_data_coordinator';
    static DRIVERS_COORDINATOR = 'drivers_coordinator';
    static MOTIVATOR_COORDINATOR = 'motivator_coordinator';
    static ALLOCATION_COORDINATOR = 'allocation_coordinator';

    static  getBallotRolesSystemName()
    {
        return [
            this.BALLOT_MEMBER,
            this.COUNTER,
            this.OBSERVER,
        ];
    }
     static  getClusterRolesSystemName()
    {
        return [
            this.CLUSTER_LEADER,
            this.DRIVER,
            this.MINISTER_OF_FIFTY,
        ];
    }

     static  getQuarterRolesSystemName()
    {
        return [
            this.QUARTER_DIRECTOR,
            this.DRIVER,
        ];
    }

     static  getCityRolesSystemName()
    {
        return [
            this.ELECTION_GENERAL_WORKER,
            this.DRIVER,
            this.DRIVERS_COORDINATOR,
            this.MINISTER_OF_FIFTY,
            this.MOTIVATOR,
            this.MOTIVATOR_COORDINATOR,
            this.MUNI_DIRECTOR,
            this.MUNI_SECRETARY,
            this.OPTIMIZER_COORDINATOR,

        ];
    }

}
