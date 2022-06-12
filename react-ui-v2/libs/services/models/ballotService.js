import constants from "../../constants";

export function getBallotsAvailableShifts(allShifts, currentBallot, roleSystemName){

//hash of all role shift include arr role shift not available
    let hashNotAvailableRoleShiftByRoleShift={
        'first':['all_day_and_count','all_day'],
        'second':['all_day_and_count','all_day','second_and_count'],
        'all_day':['all_day_and_count','first','second_and_count','second_and_count'],
        'count':['second_and_count','all_day_and_count'],
        'second_and_count':['all_day_and_count','all_day','second','count'],
        'all_day_and_count':['all_day','second','count','first','second_and_count']
    }

    let roleShiftsSystemNames = {...constants.activists.roleShiftsSytemNames};
    let availableShifts = allShifts;
    //id election role is counter the role shift is only counter
    if(roleSystemName==constants.electionRoleSytemNames.counter)
    availableShifts=filter(role_shift=>{return role_shift.system_name==constants.activists.roleShiftsSytemNames.count});
    

    //foreach all assignment shift role for remove not available shift
    currentBallot.activists_allocations_assignments.forEach(activist_assignment => {
       let activist_assignment_role_shift=activist_assignment.role_shift_system_name;
       let arrNotAvailable=hashNotAvailableRoleShiftByRoleShift[activist_assignment_role_shift];
       arrNotAvailable.push(activist_assignment_role_shift);
       availableShifts=availableShifts.filter(role_shift=>{return arrNotAvailable.indexOf(role_shift.system_name)==-1});
    });
 
    //return all role shift that available
    return availableShifts;
}
// Check if ballot has free allocation:
export function checkIfBallotHasFreeAllocation(ballotGeoAllocations, ballot_role_system_name){
    if(!ballot_role_system_name){
        return false;
    }
    let roleShiftsSystemNames = constants.activists.roleShiftsSytemNames;
    let freeShifts = {
        first: true,
        second: true,
        count: true,
    }
    // console.log('ballotGeoAllocations', ballotGeoAllocations)
    let isBallotCounterRole = (ballot_role_system_name == 'counter');
    ballotGeoAllocations.forEach((item) => {

        switch(item.shift_system_name){
            case roleShiftsSystemNames.allDayAndCount :
                freeShifts.first = false;freeShifts.second = false;freeShifts.count = false;
                break;
            case roleShiftsSystemNames.secondAndCount :
                freeShifts.second = false;freeShifts.count = false;
                break;
            case roleShiftsSystemNames.allDay :
                freeShifts.first = false;freeShifts.second = false;
                break;
            default:
                // For counter Role ballot:
                if(isBallotCounterRole && item.shift_system_name == roleShiftsSystemNames.count){
                    freeShifts.first = false;freeShifts.second = false;freeShifts.count = false;
                }
                freeShifts[item.shift_system_name] = false;
            break;
        }
        // console.log('freeShifts', freeShifts);
    })
    return (freeShifts.first || freeShifts.second || freeShifts.count);
}