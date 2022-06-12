import React from 'react';

const ClusterItem = ({item, roleClustersHash, clusterChecked, changeClickedCluster, activistAllocatedClusters,
                      isActivistLocked, editPermission}) => {
    function getAddress() {
        let address = '';
        if (item.street != null) {
            address = item.street + ' ' + item.city_name;
        } else {
            address = item.city_name;
        }

        return address;
    }

    function getAllocatedCount() {
        let allocated = '';
        if ( item.driver_geo_count > 0 ) {
            allocated = 'משובץ, ' + item.driver_geo_count;
        } else {
            allocated = <i>לא משובץ</i>;
        }
        return allocated;
    }

    return (
        <tr>
            <td><input type="checkbox" checked={clusterChecked}
                       disabled={activistAllocatedClusters[item.key] == 1 || isActivistLocked || !editPermission}
                       onChange={changeClickedCluster.bind(this, item.key)}/>
            </td>
            <td>{item.name}</td>
            <td>{getAddress()}</td>
            <td>{item.ballot_boxes_count}</td>
            <td>{getAllocatedCount()}</td>
            <td>{item.count_cluster_transportations > 0 ? item.count_cluster_transportations : '-'}</td>
            <td>{item.count_cluster_transportations_crippled > 0 ? item.count_cluster_transportations_crippled : '-'}</td>
        </tr>
    );
};

export default ClusterItem;