import React from 'react';

const InstituteItem = ({currentIndex, item, selectedInstituteKey, selectInstituteItem}) => {
    function getStyle() {
        if ( item.key == selectedInstituteKey ) {
            return {backgroundColor: '#498BB6', cursor: 'pointer'};
        } else {
            return {cursor: 'pointer'};
        }
    }

    return (
        <tr style={getStyle()} onClick={selectInstituteItem.bind(this, item)}>
            <td>{currentIndex + 1}</td>
            <td>{item.name}</td>
            <td>{item.type_name}</td>
            <td>{item.city_name}</td>
        </tr>
    );
};

export default InstituteItem;