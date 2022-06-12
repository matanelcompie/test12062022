import constants from "../constants";

// Update ballot role after save:
export function updateClusterBallotField(newState, action ){

    newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
    let electionsActivistsClustersSummary = {...newState.managementCityViewScreen.electionsActivistsClustersSummary};
    let parentEntityType = action.parentEntityType;
    let parentEntityId = action.parentEntityId;

    electionsActivistsClustersSummary[parentEntityType] = {...electionsActivistsClustersSummary[parentEntityType]};

    let entityClusters = [...electionsActivistsClustersSummary[parentEntityType][parentEntityId]];
    if(!entityClusters ){ return}

    let clusterCityIndex = action.ballotBoxData.clusterIndex; // Current cluster
    let ballotCityIndex = action.ballotBoxData.ballotIndex;  // Current ballot changed


    if (entityClusters[clusterCityIndex] && entityClusters[clusterCityIndex].ballot_boxes[ballotCityIndex]) {
        entityClusters[clusterCityIndex].ballot_boxes  = [...entityClusters[clusterCityIndex].ballot_boxes];
        entityClusters[clusterCityIndex].ballot_boxes[ballotCityIndex].role = action.ballotBoxData.ballotRoleId;
    }
    newState.managementCityViewScreen.electionsActivistsClustersSummary[parentEntityType][parentEntityId] = entityClusters
}
// Update ballot role after save:
export function updateBallotField(newState, action ){

    newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
    let ballotsFullData = [...newState.managementCityViewScreen.ballotsFullData ];

    let ballotCityIndex = ballotsFullData.findIndex((item) => {
        return item.id == action.ballotBoxData.ballotId
    });  // Current ballot changed
    if(ballotsFullData[ballotCityIndex]){
        ballotsFullData[ballotCityIndex] = {...ballotsFullData[ballotCityIndex] }; 
        ballotsFullData[ballotCityIndex].role = action.ballotBoxData.ballotRoleId; 
    }

    newState.managementCityViewScreen.ballotsFullData = ballotsFullData
}
export function getActivistsElectionsRoles(){
    let counterSystemName =constants.electionRoleSytemNames.counter;

    const activistsItems = [
        // {label: 'מנהלי רובעים', system_name: constants.electionRoleSytemNames.quarterDirector},
        {label: 'משקיפים', system_name: constants.electionRoleSytemNames.observer, isBallotRole:true},
        {label: 'חברי קלפי', system_name: constants.electionRoleSytemNames.ballotMember, isBallotRole: true},
        {label: 'סופרים', system_name: counterSystemName, isBallotRole:true},
        {label: 'שרי 100', system_name: constants.electionRoleSytemNames.ministerOfFifty},
        {label: 'ראשי אשכולות', system_name: constants.electionRoleSytemNames.clusterLeader},
        {label: 'נהגים', system_name: constants.electionRoleSytemNames.driver},
        {label: 'ממריצים', system_name: constants.electionRoleSytemNames.motivator},
    ];
    return activistsItems;
}