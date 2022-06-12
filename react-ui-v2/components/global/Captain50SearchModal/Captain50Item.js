import React from 'react';

const Captain50Item = ({item, selectedCaptainId, captain50Click}) => {
    let style = {};
    if (item.captain_id == selectedCaptainId) {
        style = { backgroundColor: '#498BB6', color: 'white', cursor: 'pointer' };
    } else {
        style = { cursor: 'pointer' };
    }

    return (
        <tr style={style} onClick={captain50Click.bind(this, item.captain_id, item.first_name + ' ' + item.last_name, item.captain_key)}>
            <td>{item.personal_identity}</td>
            <td>{item.last_name}</td>
            <td>{item.first_name}</td>
            <td>{item.city_name}</td>
            <td>{(item.total_count_minister_of_fifty_count > 0) ? 'משובץ' : '-' }</td>
            <td>{(item.total_count_minister_of_fifty_count > 0) ? item.total_count_minister_of_fifty_count : '-' }</td>
        </tr>
    );
};

export default Captain50Item;