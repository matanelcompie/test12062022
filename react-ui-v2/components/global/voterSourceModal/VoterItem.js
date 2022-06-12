import React from 'react';

const VoterItem = ({currentIndex, item, selectedVoterKey, selectVoterItem}) => {
    function getStyle() {
        if ( item.key == selectedVoterKey ) {
            return {backgroundColor: '#498BB6', cursor: 'pointer'};
        } else {
            return {cursor: 'pointer'};
        }
    }

    function getStreet() {
        let address = '';

        if ( item.street_name != null ) {
            address += item.street_name + ' ';
        } else if ( item.street != null ) {
            address += item.street + ' ';
        }

        if ( item.house != null ) {
            address += item.house;
        }

        if ( address.length > 0 ) {
            return address;
        } else {
            return '\u00A0';
        }
    }

    return (
        <tr style={getStyle()} onClick={selectVoterItem.bind(this, item)}>
            <td>{currentIndex}</td>
            <td>{item.last_name}</td>
            <td>{item.first_name}</td>
            <td>{item.city_name}</td>
            <td>{getStreet()}</td>
        </tr>
    );
};

export default VoterItem;