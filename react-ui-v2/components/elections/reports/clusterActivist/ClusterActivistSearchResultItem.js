import React from 'react';
import {Link} from 'react-router';

const ClusterActivistSearchResultItem = ({currentUser, activistItem, activistIndex, selectedRoleName, selectedRoleSystemName,
                                          numOfRoleActivists}) => {

    function getUnAssignedRole() {
        return 'לא שובץ ' + selectedRoleName;
    }
    function renderActivistFullName() {
        if ( currentUser.admin || currentUser.permissions['elections.activists'] == true ) {
            return (
                <Link to={'elections/activists/' + activistItem.activist_key + '/' + activistItem.election_role_key} target="_blank">
                    {activistItem.activist_first_name + ' ' + activistItem.activist_last_name}
                </Link>
            );
        } else {
            return activistItem.activist_first_name + ' ' + activistItem.activist_last_name;
        }
    }

    function renderActivistPersoanlIdentity() {
        if ( currentUser.admin || currentUser.permissions['elections.voters'] == true ) {
            return (
                <Link to={'elections/voters/' + activistItem.activist_key} target="_blank">
                    {activistItem.activist_personal_identity}
                </Link>
            );
        } else {
            return activistItem.activist_personal_identity;
        }
    }

    function getActivistAddress() {
        let address = '';

        if ( activistItem.activit_street != null ) {
            address += activistItem.activit_street + ' ';
        }

        if ( activistItem.activit_house != null  ) {
            address += activistItem.activit_house + ' ';
        }

        address += activistItem.activist_city_name;

        return address;
    }

    function renderSelectedRoleName() {
        if ( 0 == activistIndex ) {
            return <strong>{selectedRoleName}</strong>;
        } else {
            return '\u00A0';
        }
    }

    function getActivistCountVoters() {
        const electionRoleSytemNames = require('../../../../libs/constants').electionRoleSytemNames;

        switch (selectedRoleSystemName) {
            case electionRoleSytemNames.driver:
                return activistItem.count_driver_transportation + ' נוסעים';
                break;

            case electionRoleSytemNames.ministerOfFifty:
                return activistItem.count_captain50_voters + ' תושבים ב ' + activistItem.count_captain50_households + ' בתי אב';
                break;

            default:
                return '\u00A0';
                break;
        }
    }

    if (  numOfRoleActivists==0 ) {
        return (
            <tr className="team-head">
                <td>{'\u00A0'}</td>
                <td><strong>{selectedRoleName}</strong></td>
                <td>{getUnAssignedRole()}</td>
                <td>{'\u00A0'}</td>
                <td>{'\u00A0'}</td>
                <td>{'\u00A0'}</td>
                <td>{'\u00A0'}</td>
            </tr>
        );
    } else {
        return (
            <tr className={activistIndex == 0 ? 'team-head' : ''}>
                <td>{'\u00A0'}</td>
                <td>{renderSelectedRoleName()}</td>
                <td>{renderActivistFullName()}</td>
                <td>{renderActivistPersoanlIdentity()}</td>
                <td>{getActivistAddress()}</td>
                <td>{activistItem.activist_phone_number}</td>
                <td>{getActivistCountVoters()}</td>
            </tr>
        );
    }
};

export default ClusterActivistSearchResultItem;