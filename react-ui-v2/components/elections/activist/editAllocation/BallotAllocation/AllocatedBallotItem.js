import React from 'react';

const AllocatedBallotItem = ({item, isActivistLocked, isOtherActivistLocked, currentUser, showConfirmDeleteBallot,
                                 showEditRoleShiftsModal, getBallotMiId, editElectionRoleDetails, election_role_key, currentTabRoleSystemName,editNoCheckLocationBallotMember}) => {
    let accessibilityColumn = (item.special_access) ? <div className="accessibility"/> : <div style={{ width: '17px' }}/>;;

    const pagePermissions = 'elections.activists.' + currentTabRoleSystemName;
    /**
     * This function checks if the current user
     * has permission to edit ballot role.
     *
     * @returns {string|boolean|*}
     */
    function checkEditBallotPermission() {
        return ( currentUser.admin || currentUser.permissions[pagePermissions + '.edit']);
    }
    function checkdeleteBallotPermission() {
        return ( currentUser.admin || currentUser.permissions[pagePermissions + '.assignment_delete']);
    }
    function notCheckLocationPermission() {
        return ( currentUser.admin || currentUser.permissions['elections.activists.cluster_summary.cancel-google-map']);
    }


    function renderEditColumn() {
        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול',
            otherLocked: 'פעיל אחר נעול בקלפי'
        };

        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';
        if ( isActivistLocked ) {
            return (
                <span title={titles.locked}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>
            );
        } else if ( !checkEditBallotPermission() ) {
            return '\u00A0';
        } else {
            return <span className="glyphicon glyphicon-pencil" title={titles.edit}
                         onClick={showEditRoleShiftsModal.bind(this, item.id)}
                         aria-hidden="true"
                         style={{cursor: "pointer"}}/>;
        }
    }

    function renderDeleteColumn() {
        if ( isActivistLocked || !checkdeleteBallotPermission() ) {
            return '\u00A0';
        } else {
            return <span className="glyphicon glyphicon-trash" title="מחק"
                         onClick={showConfirmDeleteBallot.bind(this, item.id)}
                         aria-hidden="true"
                         style={{cursor: "pointer"}}/>;
        }
    }
    let hasAppointmentExportPermission = currentUser.admin || currentUser.permissions[pagePermissions + '.appointment_letter'];
    return (
        <tr>
            <td>{item.city_name}</td>
            <td>{item.cluster_name}</td>
            <td>{item.street != null ? item.street : '\u00A0'}</td>
            <td>{getBallotMiId(item.mi_id)}</td>
            <td>{accessibilityColumn}</td>
            <td>{item.ballot_box_role_name}</td>
            <td>{item.sum} &#8362;</td>
            <td>
                {hasAppointmentExportPermission ?
                    <a href={window.Laravel.baseURL + 'api/elections/activists/appointment_letters/' + election_role_key +
                        '/' + item.ballot_box_id + '/export'} target="_blank" style={{ display: 'inline' }}>
                        <label className="fa fa-wpforms" aria-hidden="true" style={{ cursor: 'pointer', marginLeft: '10px' }}></label>
                    </a>
                    : <label className="fa fa-wpforms" aria-hidden="true" style={{ marginLeft: '10px' }}></label>
                }
                <input type="checkbox"   id="inputInstructed-role-details" checked={item.appointment_letter || false}
                    onChange={editElectionRoleDetails.bind(this,'appointmentLetter','appointment_letter')} />
            </td>
            <td>
                <span>{item.election_role_shift_name}</span>
                {renderEditColumn()}
            </td>
           

            <td><input type="checkbox" disabled={!notCheckLocationPermission()} id="inputInstructed-role-details" checked={item.not_check_location || false}
                    onChange={editElectionRoleDetails.bind(this,'notCheckLocation','not_check_location')} /></td>
                     <td className="status-data">{renderDeleteColumn()}</td>
        </tr>
    );
};

export default AllocatedBallotItem;