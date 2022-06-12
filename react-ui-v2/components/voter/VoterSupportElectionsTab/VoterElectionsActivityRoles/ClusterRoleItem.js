import React from 'react';

const ClusterRoleItem = ({item}) => {
    function renderClustersDetails() {
        let names = item.election_roles_geographical.map( function(clusterItem, index ) {
            let clusterDetails = clusterItem.cluster_name;
            if ( clusterItem.street != null ) {
                clusterDetails += ', ' + clusterItem.street;
            }

            return <span key={clusterItem.key} className="td-info">{clusterDetails}</span>;
        });

        return names;
    }

    function renderClustersCities() {
        let cities = item.election_roles_geographical.map( function(clusterItem, index ) {
            return <span key={clusterItem.key} className="td-info">{clusterItem.city_name}</span>;
        });

        return cities;
    }

    return (
        <tr>
            <td>{item.CampaignName}</td>
            <td>{item.election_role_name}</td>
            <td>{item.assigned_city_name}</td>
            <td>{item.election_roles_geographical.length > 0 ? renderClustersDetails() : '-'}</td>
            <td>-</td>
            <td>{item.sum}</td>
        </tr>
    );
};

export default ClusterRoleItem;