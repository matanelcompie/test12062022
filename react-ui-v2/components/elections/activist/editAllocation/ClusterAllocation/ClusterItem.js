import React from 'react';

import constants from 'libs/constants';

const ClusterItem = ({item, currentUser, currentTabRoleSystemName, updateActivistRoleCluster,
                      showAlertUpdateModal, activistAllocatedClusters, isActivistLocked}) => {
    let buttonText = 'בחר';
    let hashKey = 'cluster_' + item.id;

    /**
     * This function renders the select
     * button if the current user has a
     * permission to edit cluster leader.
     *
     * @returns {*}
     */
    function renderAddButton() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;

        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול'
        };
        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        switch ( currentTabRoleSystemName ) {
            case electionRoleSytemNames.clusterLeader:
                let clusterLeader =   {
                    first_name: item.leader_first_name,
                    last_name: item.leader_last_name,
                    personal_identity: item.leader_personal_identity,
                    verified_status: item.leader_verified_status,
                    activists_allocations_assignment_id:item.activists_allocations_assignment_id
                };
              

                if (item.leader_user_lock_id != null) {
                    return (
                        <span title={titles.locked} className="pull-left">
                            <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                                 data-original-title={titles.locked}/>
                        </span>
                    );
                } else if ( (currentUser.admin || currentUser.permissions['elections.activists.cluster_leader.edit'] == true) &&
                             !isActivistLocked) {
                    return (
                        <button title="בחר" type="submit" className="btn new-btn-default srch-btn-sm pull-left"
                                disabled={activistAllocatedClusters[item.key] == 1}
                                onClick={item.leader_id == null ? updateActivistRoleCluster.bind(this, item.key)
                                                                : showAlertUpdateModal.bind(this, item.key, item.name, clusterLeader)}>
                            {buttonText}
                        </button>
                    );
                } else {
                    return '--';
                }
                break;

            case electionRoleSytemNames.motivator:
                if ( (currentUser.admin || currentUser.permissions['elections.activists.motivator.edit'] == true) && !isActivistLocked ) {
                    return (
                        <button title="בחר" type="submit" className="btn new-btn-default srch-btn-sm pull-left"
                                disabled={activistAllocatedClusters[item.key] == 1}
                                onClick={showAlertUpdateModal.bind(this, item.key, item.name)}>
                            {buttonText}
                        </button>
                    );
                } else {
                    return '--';
                }
                break;
        }
    }

    function getAddress() {
        let address = '';

        if (item.street != null && item.street.length > 0) {
            address = item.street + ' ' + item.city_name;
        } else {
            address = item.city_name;
        }

        return address;
    }

    function getNumOfClusterMotivators() {
        let allocated = '';

        if ( item.motivator_geo_count > 0 ) {
            allocated = 'משובץ, ' + item.motivator_geo_count;
        } else {
            allocated = '-';
        }

        return allocated;
    }

    function getLeaderDetails() {
        let leaderDetails = '';

        if ( item.leader_id != null ) {
            leaderDetails = item.leader_first_name + ' ' + item.leader_last_name;
            leaderDetails += ' ' + item.leader_personal_identity + ' | ' + item.leader_phone_number;
        } else {
            leaderDetails = '-';
        }

        return leaderDetails;
    }

    function getStatusColumn() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;

        switch ( currentTabRoleSystemName ) {
            case electionRoleSytemNames.clusterLeader:
                return getLeaderDetails();
                break;

            case electionRoleSytemNames.motivator:
                return getNumOfClusterMotivators();
                break;
        }
    }

    return (
        <tr>
            <td>{item.city_name}</td>
            <td>{item.name}</td>
            <td>{getAddress()}</td>
            <td>{item.ballot_boxes_count}</td>
            <td>{getStatusColumn()}</td>
            <td>{renderAddButton()}</td>
        </tr>
    );
};

export default ClusterItem;