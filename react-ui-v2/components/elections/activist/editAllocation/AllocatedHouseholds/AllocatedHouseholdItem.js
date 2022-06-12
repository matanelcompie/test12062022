import React from 'react';

import {formatBallotMiId} from 'libs/globalFunctions'
import constants from 'libs/constants';

const AllocatedHouseholdItem = ({householdIndex, item, householdSelected, changeSelectedHousehold, deleteHousehold,
                                 isActivistLocked, currentUser, editingCaptainHouseholdsFlag}) => {
    let address = [];

    if (item.mi_street) {
        address.push(item.mi_street);
    }
    if (item.city_name) {
        address.push(item.city_name);
    }
    let addressString = address.length?address.join(', '):'';

    function renderDeleteButton() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;
        const titles = {
            edit: 'ערוך',
            locked: 'השיבוץ נעול'
        };
        const lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        if ( isActivistLocked ) {
            return (
                <span title={titles.locked}>
                    <img data-toggle="tooltip" data-placement="left" title={titles.locked} src={lockIcon}
                         data-original-title={titles.locked}/>
                </span>
            );
        } else if ( currentUser.admin || currentUser.permissions['elections.activists.captain_of_fifty.edit'] == true ) {
            return (
                <a onClick={deleteHousehold.bind(this, item.household_id)}>
                    <span style={{cursor: 'pointer'}} className="glyphicon glyphicon-trash" disabled={editingCaptainHouseholdsFlag}
                          aria-hidden="true"/>
                </a>
            );
        } else {
            return '--';
        }
    }
	
	let household_members = item.household_members;
	let onHoverTitle = "";
	if(household_members){
		for(let i = 0 ; i < household_members.length ; i++){
			let member = household_members[i];
			onHoverTitle += member.personal_identity + " - " + member.first_name + ' ' + member.last_name + String.fromCharCode(13);
			if(i == 15){
				onHoverTitle = onHoverTitle.substr(0 , onHoverTitle.length - 3);
				onHoverTitle += "...";
				break;
			}
		}
	}
	 
    let mi_id = formatBallotMiId(item.mi_id);
    return (
        <tr className="cursor-pointer" title={onHoverTitle}>
            <td><input type="checkbox" checked={householdSelected} onChange={changeSelectedHousehold.bind(this, item.household_id)}/></td>
            <td>{householdIndex + 1}</td>
            <td>{item.last_name}</td>
            <td>{item.household_members_count}</td>
            <td>{addressString}</td>
            <td>{mi_id}</td>
            <td className="status-data">{renderDeleteButton()}</td>
        </tr>
    );
};

export default AllocatedHouseholdItem;