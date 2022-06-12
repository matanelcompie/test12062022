import React from 'react';

const BallotDumbItem = ({item, getBallotMiId}) => {
    function getBallotType() {
        if ( item.special_access ) {
            return <div className="accessibility"/>;
        } else { return <div style={{ width: '17px' }}/>; }
    }

    function getActivistDetails(activists_allocations_assignments) {
        let details = '';

        details = activists_allocations_assignments.first_name + ' ' + activists_allocations_assignments.last_name + ' ';
        details += activists_allocations_assignments.personal_identity + ' | ' + activists_allocations_assignments.phone_number;

        return details;
    }

    function renderActivists() {
        switch ( item.all_assignment.length ) {
            case 0:
                return '\u00A0';
                break;

            case 1:
                return getActivistDetails(item.all_assignment[0]);
                break;

            default:
                return (
                    item.all_assignment.map(function(geoItem, index) {
                        return (
                            <div key={index} className="td-info">
                                <div className="flexed align-items-center flexed-space-between">
                                    {getActivistDetails(geoItem)}
                                </div>
                            </div>
                        )
                    })
                );
                break;
        }
    }

    function renderShifts() {
        switch ( item.all_assignment.length ) {
            case 0:
                return '\u00A0';
                break;

            case 1:
                return item.all_assignment[0].election_role_shift_name;
                break;

            default:
                return (
                    item.all_assignment.map(function(geoItem, index) {
                        return (
                            <div key={index} className="td-info">
                                <span className="flexed align-items-center flexed-space-between">
                                    {geoItem.election_role_shift_name}
                                </span>
                            </div>   
                        )
                    })
                );
                break;
        }
    }

    return(
        <tr>
            <td style={{ width: '8%' }}>{item.city_name}</td>
            <td style={{ width: '12%' }}>{item.cluster_name}</td>
            <td style={{ width: '15%' }}>{(item.street != null && item.street.length > 0) ? item.street : '\u00A0'}</td>
            <td style={{ width: '7%' }}>{getBallotMiId(item.name)}</td>
            <td style={{ width: '7%' }}>{getBallotType()}</td>
            <td style={{ width: '8%' }}>{(null == item.ballot_box_role_id) ? '\u00A0' : item.ballot_box_role_name}</td>
            <td style={{ width: '8%' }} className="right-separator-line nopaddingR nopaddingL">{renderShifts()}</td>
            <td style={{ width: '331px' }} className="nopaddingR nopaddingL">{renderActivists()}</td>
        </tr>
    );
};

export default BallotDumbItem;