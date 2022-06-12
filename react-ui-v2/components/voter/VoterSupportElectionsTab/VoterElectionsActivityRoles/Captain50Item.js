import React from 'react';

const Captain50Item = ({item}) => {

    return (
        <tr>
            <td>{item.CampaignName}</td>
            <td>{item.election_role_name}</td>
            <td>{item.assigned_city_name}</td>
            <td><label> {(item.captain50_households.length).toString()} תושבים </label></td>
            <td>-</td>
            <td>{item.sum}</td>
        </tr>
    );
};

export default Captain50Item;