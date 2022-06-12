import React from 'react';

import constants from 'libs/constants';

const HouseholdItem = ({item, householdIndex, activistKey, householdSelected, householdAllocated, changeSelectedHousehold,
                        isActivistLocked, currentUser, captainRoleKey}) => {
    function getAddress() {
        let address = '';

        if ( item.mi_street != null ) {
            address += item.mi_street;

            if (item.mi_house != null) {
                address += ' ' + item.mi_house;
            }

            address += ',';
        }
		if(item.city_name){
			address += item.city_name;
		}
        return address;
    }

    function getHoverTitle() {
        let household_members = item.household_members;
        let onHoverTitle = "";
        for(let i = 0 ; i < household_members.length ; i++){
            let member = household_members[i];
            onHoverTitle += member.personal_identity + " - " + member.first_name + ' ' + member.last_name+ String.fromCharCode(13);
            if(i == 15){
                onHoverTitle = onHoverTitle.substr(0 , onHoverTitle.length - 3);
                onHoverTitle += "...";
                break;
            }
        }

        return onHoverTitle;
    }

    function renderCaptainLink(item) {
        let captainLink = '-';
        let captainHtml = [];

        const electionRoleSytemNames = constants.electionRoleSytemNames;

        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול'
        };
        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        if (item.captain_id) {
            let captainUrl = window.Laravel.baseURL + 'elections/activists/' + item.captain_key + '/' + item.captain_election_role_key;
            captainLink = <a key="captain-link" href={captainUrl} style={{ cursor: 'pointer' }} target="_blank">
                {item.captain_first_name + ' ' + item.captain_last_name + ' (' + item.captain_personal_identity + ')'}
            </a>;

            captainHtml.push(captainLink);
        }

        if ( item.user_lock_id != null ) {
            captainHtml.push(
                <span key="captain-locked" title={titles.locked} style={{marginRight: '5px'}}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>);
        }

        return (captainHtml)
    }

    function checkEditPermission() {
        return ( currentUser.admin || currentUser.permissions['elections.activists.captain_of_fifty.edit'] == true );
    }

    function renderCheckBox() {
        if ( checkEditPermission() && !isActivistLocked && item.user_lock_id == null) {
            return (
                <input type="checkbox" checked={householdSelected}
                       disabled={item.captain_key == activistKey || householdAllocated}
                       onChange={changeSelectedHousehold.bind(this, item.household_id, item.captain_id)}/>
            );
        } else {
            return '\u00A0';
        }
    }

    return (
        <tr className="cursor-pointer" title={getHoverTitle()}>
            <td>{renderCheckBox()}</td>
            <td>{householdIndex}</td>
            <td>{item.last_name}</td>
            <td>{item.household_members.length}</td>
            <td>{getAddress()}</td>
            <td>{item.cluster_name}</td>
            <td>{item.mi_id}</td>
            <td>{renderCaptainLink(item)}</td>
        </tr>
    );
};

export default HouseholdItem;