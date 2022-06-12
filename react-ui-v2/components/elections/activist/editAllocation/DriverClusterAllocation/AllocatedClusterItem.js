import React from 'react';

const AllocatedClusterItem = ({item, currentUser, isActivistLocked, deleteDriverCluster}) => {

    function getAddress() {
        let address = '';

        if (item.street != null) {
            address = item.street + ' ' + item.city_name;
        } else {
            address = item.city_name;
        }

        return address;
    }

    /**
     * This function checks if the current user
     * has permission to edit ballot role.
     *
     * @returns {string|boolean|*}
     */
    function checkEditPermission() {
        return ( currentUser.admin || currentUser.permissions['elections.activists.driver.edit'] == true);
    }

    /**
     * This function renders the delete button if
     * the current user has edit driver role permission.
     *
     * @returns {*}
     */
    function renderDeleteButton() {
        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול'
        };

        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        if ( isActivistLocked ) {
            return (
                <span title={titles.locked}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>
            );
        } else if ( checkEditPermission() ) {
            return (
                <span className="glyphicon glyphicon-trash" style={{cursor: 'pointer'}} title="מחק"
                      onClick={deleteDriverCluster.bind(this, item.cluster_key)}
                      aria-hidden="true"/>
            );
        } else {
            return '\u00A0';
        }
    }

    return (
        <tr>
            <td>{item.city_name}</td>
            <td>{item.quarter_name}</td>
            <td>{item.cluster_mi_id}</td>
            <td>{item.cluster_name}</td>
            <td>{getAddress()}</td>
            <td>{item.countBallotBox}</td>
            <td className="status-data">{renderDeleteButton()}</td>
        </tr>
    );
};

export default AllocatedClusterItem;