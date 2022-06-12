import React from 'react';

const ClusterItem = ({item, index}) => {
    function getPrevPercentage() {
        if ( item.prev_supporters_percents == null) {
            return '\u00A0';
        }

        let percentage = parseFloat(item.prev_supporters_percents);
        percentage = (percentage * 100 ).toFixed(2);

        return percentage + '%';
    }

    return (
        <tr>
            <td>{index + 1}</td>
            <td>{item.city_name}</td>
            <td>{item.cluster_name}</td>
            <td>{item.street}</td>
            <td>{getPrevPercentage()}</td>
            <td>{item.count_supporters}</td>
            <td className="regular-transport">{item.count_total_regular}</td>
            <td className="regular-transport">{item.count_regular_wating}</td>
            <td className="handicapped-transport">{item.count_total_crippled}</td>
            <td className="handicapped-transport">{item.count_crippled_wating}</td>
            <td className="drivers">{item.count_total_drivers == null ? 0 : item.count_total_drivers}</td>
            <td className="drivers">{item.count_waiting_drivers == null ? 0 : item.count_waiting_drivers}</td>
        </tr>
    );
};

export default ClusterItem;