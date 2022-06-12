import React from 'react';

const ElectionRoleItem = ({item, roleIndex, shiftIndex, editPermission, showEditRoleModal}) => {
    function renderEditButton() {
        if ( editPermission ) {
            return <span className="edit-group edit-group-icon" style={{cursor: 'pointer'}}
                         onClick={showEditRoleModal.bind(this, item)}/>;
        } else {
            return '\u00A0';
        }
    }
    let subIndex = item.election_role_shift_name ?  (shiftIndex + 1) + '.': null;
    return (
        <tr>
            <td> {subIndex + (roleIndex + 1) }</td>
            <td>{item.election_role_name}</td>
            <td>{item.election_role_shift_name}</td>
            <td>{item.budget}</td>
            <td>{renderEditButton()}</td>
        </tr>
    );
};

export default ElectionRoleItem;