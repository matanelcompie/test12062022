import React from 'react';
import {Link} from 'react-router';

import ClusterActivistSearchResultItem from './ClusterActivistSearchResultItem';

const ClusterActivistSearchResult = ({currentUser, totalSummaryResults, currentPageRows, searchFields, electionRoles}) => {
    function getBlockStyle() {
        let style = {};

        if ( totalSummaryResults == 0 ) {
            style = {display: 'none'};
        }

        return style;
    }

    function getLeaderAddress(clusterIndex) {
        let address = '';

        if ( currentPageRows[clusterIndex].leader_street != null ) {
            address += currentPageRows[clusterIndex].leader_street + ' ';
        }

        if ( currentPageRows[clusterIndex].leader_house != null  ) {
            address += currentPageRows[clusterIndex].leader_house + ' ';
        }

        address += currentPageRows[clusterIndex].leader_city;

        return address;
    }

    function getElectionRolesHash() {
        let electionRolesHash = {};

        for ( let roleIndex = 0; roleIndex < electionRoles.length; roleIndex++ ) {
            let  electionRoleKey = electionRoles[roleIndex].key;

            electionRolesHash[electionRoleKey] = electionRoles[roleIndex];
        }

        return electionRolesHash;
    }

    function renderLeaderFullName(clusterIndex) {
        if ( currentUser.admin || currentUser.permissions['elections.activists'] == true ) {
            return (
                <Link to={'elections/activists/' + currentPageRows[clusterIndex].leader_key + '/' + currentPageRows[clusterIndex].election_role_key} target="_blank">
                    {currentPageRows[clusterIndex].leader_first_name + ' ' + currentPageRows[clusterIndex].leader_last_name}
                </Link>
            );
        } else {
            return currentPageRows[clusterIndex].leader_first_name + ' ' + currentPageRows[clusterIndex].leader_last_name;
        }
    }

    function renderLeaderPersoanlIdentity(clusterIndex) {
        if ( currentUser.admin || currentUser.permissions['elections.voters'] == true ) {
            return (
                <Link to={'elections/voters/' + currentPageRows[clusterIndex].leader_key} target="_blank">
                    {currentPageRows[clusterIndex].leader_personal_identity}
                </Link>
            );
        } else {
            return currentPageRows[clusterIndex].leader_personal_identity;
        }
    }

    function renderClusterActivists(clusterIndex) {
        const electionRoleSytemNames = require('../../../../libs/constants').electionRoleSytemNames;
        let electionRolesHash = getElectionRolesHash();
        let activists = [];
        let activistArr = [];
        if(!currentPageRows[clusterIndex]){return};

        for ( let selectedIndex = 0; selectedIndex < searchFields.selected_roles.length; selectedIndex++ ) {
            let selectedRoleKey = searchFields.selected_roles[selectedIndex];
            let selectedRoleSystemName = electionRolesHash[selectedRoleKey].system_name;
            let selectedRoleName = electionRolesHash[selectedRoleKey].name;

            switch (selectedRoleSystemName) {
                case electionRoleSytemNames.driver:
                    activistArr = currentPageRows[clusterIndex].driver_geo;
                    break;

                case electionRoleSytemNames.motivator:
                    activistArr = currentPageRows[clusterIndex].motivator_geo;
                    break;

                case electionRoleSytemNames.observer:
                    activistArr = currentPageRows[clusterIndex].observer_geo;
                    break;

                case electionRoleSytemNames.ministerOfFifty:
                    activistArr = currentPageRows[clusterIndex].captain50_geo;
                    break;
            }
            if ( activistArr.length == 0 ) {
                activists.push(<ClusterActivistSearchResultItem key={currentPageRows[clusterIndex].cluster_key + '-' + selectedRoleKey}
                                                                selectedRoleName={selectedRoleName}
                                                                numOfRoleActivists={0}/>);
            } else {
                for ( let activistIndex = 0; activistIndex < activistArr.length; activistIndex++ ) {
                    activists.push(<ClusterActivistSearchResultItem key={currentPageRows[clusterIndex].cluster_key + '-' +
                                                                         selectedRoleKey + '-' + activistArr[activistIndex].activist_key}
                                                                    currentUser={currentUser}
                                                                    activistItem={activistArr[activistIndex]}
                                                                    activistIndex={activistIndex}
                                                                    selectedRoleName={selectedRoleName}
                                                                    selectedRoleSystemName={selectedRoleSystemName}
                                                                    numOfRoleActivists={activistArr.length}/>);
                }
            }
        }

        return activists;
    }

    function renderLeaderRow(clusterIndex) {
        // console.log(currentPageRows[clusterIndex],clusterIndex);
        if(!currentPageRows[clusterIndex]){return};
        // console.log(currentPageRows[clusterIndex].cluster_key);
        if ( currentPageRows[clusterIndex].leader_key==null ) {
            return (
                <tr key={currentPageRows[clusterIndex].cluster_key + '-leader'} className="team-head">
                    <td>{'\u00A0'}</td>
                    <td><strong>ראש אשכול</strong></td>
                    <td>לא שובץ ראש אשכול</td>
                    <td>{'\u00A0'}</td>
                    <td>{'\u00A0'}</td>
                    <td>{'\u00A0'}</td>
                    <td>{'\u00A0'}</td>
                </tr>
            );
        } else {
            return (
                <tr key={currentPageRows[clusterIndex].cluster_key + '-leader'} className="team-head">
                <td>{'\u00A0'}</td>
                    <td><strong>ראש אשכול</strong></td>
                    <td>{renderLeaderFullName(clusterIndex)}</td>
                    <td>{renderLeaderPersoanlIdentity(clusterIndex)}</td>
                    <td>{getLeaderAddress(clusterIndex)}</td>
                    <td>{currentPageRows[clusterIndex].leader_phone_number}</td>
                    <td>{'\u00A0'}</td>
                </tr>
            );
        }
    }

    function renderClusterHeader(clusterIndex) {
        let currentCluster = currentPageRows[clusterIndex];
        return (
            <tr key={currentCluster.cluster_key} className="activity-details cluster-details">
                <td className="text-center">{currentCluster.index + 1}</td>
                <td colSpan="2">
                    <span className="item-space">אשכול</span>
                    <strong>{currentCluster.cluster_name}</strong>
                </td>
                <td colSpan="2">
                    <span className="item-space">כתובת</span>
                    <strong>{currentCluster.cluster_street}</strong>
                </td>
                <td colSpan="2">
                    <span className="item-space">עיר</span>
                    <strong>{currentCluster.cluster_city}</strong>
                </td>
            </tr>
        );
    }

    function renderClusters() {
        let clusters = [];

        for ( let clusterIndex = 0; clusterIndex < currentPageRows.length; clusterIndex++ ) {
            if(!currentPageRows[clusterIndex]){ continue;} // if row exist
                clusters.push(renderClusterHeader(clusterIndex));

                clusters.push(renderLeaderRow(clusterIndex));
    
                let clusterActivists = renderClusterActivists(clusterIndex);
                for ( let activistIndex = 0; activistIndex < clusterActivists.length; activistIndex++ ) {
                    clusters.push(clusterActivists[activistIndex]);
                }
        }

        return clusters;
    }

    return (
        <div className="table-container" style={getBlockStyle()}>
            <table className="table treadmill-report-table line-around">
                <thead>
                <tr>
                    <th>מס"ד</th>
                    <th>סוג פעיל</th>
                    <th>שם מלא</th>
                    <th>ת.ז</th>
                    <th>כתובת מלאה</th>
                    <th>מס' טלפון</th>
                    <th>מספר תושבים לדיווח</th>
                </tr>
                </thead>

                <tbody>
                {renderClusters()}
                </tbody>
            </table>
        </div>
    );
};

export default ClusterActivistSearchResult;