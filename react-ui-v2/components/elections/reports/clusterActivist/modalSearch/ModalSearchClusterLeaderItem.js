import React from 'react';

const ModalSearchClusterLeaderItem = ({leaderItem, selectedLeaderKey, selectLeader}) => {
    function getRowStyle() {
        let style = {};
        if ( leaderItem.leader_key == selectedLeaderKey ) {
            style = {backgroundColor: '#498BB6', cursor: 'pointer'};
        } else {
            style = {cursor: 'pointer'};
        }

        return style;
    }

    return (
        <tr style={getRowStyle()} onClick={selectLeader.bind(this, leaderItem)}>
            <td>{leaderItem.leader_personal_identity}</td>
            <td>{leaderItem.leader_last_name}</td>
            <td>{leaderItem.leader_first_name}</td>
            <td>{leaderItem.leader_city}</td>
            <td>-</td>
            <td>{leaderItem.count_clusters_households}</td>
        </tr>
    );
};

export default ModalSearchClusterLeaderItem;