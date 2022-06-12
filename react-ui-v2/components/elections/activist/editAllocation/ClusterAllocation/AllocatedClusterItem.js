import React from 'react';

import constants from 'libs/constants';

const AllocatedClusterItem = ({item, currentTabRoleSystemName, currentUser, isActivistLocked, electionRoleByVoterKey, deleteActivistRoleCluster}) => {
    const electionRoleSytemNames = constants.electionRoleSytemNames;

    let clusterName = '';
    let clusterKey = '';
    let numberOfClusterBallotBoxes = 0;

    clusterName = item.cluster_name;
    clusterKey = item.cluster_key;
    numberOfClusterBallotBoxes =  item.countBallotBox;

    function checkEditPermissions() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;

        switch ( currentTabRoleSystemName ) {
            case electionRoleSytemNames.clusterLeader:
                return (currentUser.admin || currentUser.permissions['elections.activists.cluster_leader.edit'] == true );
                break;

            case electionRoleSytemNames.motivator:
                return (currentUser.admin || currentUser.permissions['elections.activists.motivator.edit'] == true );
                break;

            default:
                return false;
                break;
        }
    }

    /**
     * This function renders the select
     * button if the current user has a
     * permission to edit cluster leader.
     *
     * @returns {*}
     */
    function renderDeleteButton() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;
        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול',
            otherLocked: 'פעיל אחר נעול באשכול'
        };
        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        if ( isActivistLocked ) {
            return (
                <span title={titles.locked}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>
            );
        } else if ( checkEditPermissions() ) {
            return (
                <span className="glyphicon glyphicon-trash" style={{cursor: 'pointer'}} title="מחק"
                      onClick={deleteActivistRoleCluster.bind(this, item)}
                      aria-hidden="true"/>
            );
        } else {
            return '--';
        }
    }

    function getAddress() {
        let address = '';

        if (item.street != null) {
            address = item.street + ' ' + item.city_name;
        } else {
            address = item.city_name;
        }

        return address;
    }
    function renderDisplayAppointmentLetter(){
        let hasAppointmentExportPermission = currentUser.admin || currentUser.permissions['elections.activists.' + currentTabRoleSystemName + '.appointment_letter'];
        if(electionRoleByVoterKey && hasAppointmentExportPermission){
            return(
                <a href={window.Laravel.baseURL + 'api/elections/activists/appointment_letters/observer/' + electionRoleByVoterKey + '/export'}
                    target="_blank" style={{ display: 'inline' }}>
                    <label className="fa fa-wpforms" aria-hidden="true" style={{ cursor: 'pointer', marginLeft: '10px' }}></label>
                </a>
            )
        }else {
            return null;
        }
    }
    return (
        <tr>
            <td>{item.city_name}</td>
            <td>{item.quarter_name}</td>
            <td>{item.cluster_mi_id}</td>
            <td>{clusterName}</td>
            <td>{getAddress()}</td>
            <td>{numberOfClusterBallotBoxes}</td>
            <td>{renderDisplayAppointmentLetter()}</td>
            <td className="status-data">{renderDeleteButton()}</td>
        </tr>
    );
};

export default AllocatedClusterItem;