import React from 'react';
import PropTypes from 'prop-types';

const HouseholdDetailsHeader = ({permissions}) => {
	let headerTitle = [
		{key: 'first-name', label: 'שם פרטי'},
		{key: 'age', label: 'גיל'},
	];

    //set permissions names
    let contactPermission = 'cti.activity_area.household.household_contacts';
    let supportPermission = 'cti.activity_area.household.household_voter_status';
    let votePermission = 'cti.activity_area.household.household_voting';

    //check permissions
    if ((permissions[contactPermission] != undefined)&&(Number(permissions[contactPermission].value) > 0)) {
        headerTitle.push({key: 'phone-num', label: 'מספרי טלפון'});
    }

    if ((permissions[supportPermission] != undefined)&&(Number(permissions[supportPermission].value) > 0)) {
        headerTitle.push({key: 'support-status', label: 'סטטוס תמיכה'});
    }    

    if ((permissions[votePermission] != undefined)&&(Number(permissions[votePermission].value) > 0)) {
        headerTitle.push({key: 'vote-status', label: 'סטטוס הצבעה'});
    } 

    return (
        <div className="household-details__header household-details__row">
        	{headerTitle.map(item=>{
        		return (
        			<div key={item.key} className={`household-details__cell household-details__cell_col_${item.key}`}>{item.label}</div>
        		);
        	})}
        </div>
    );
};

HouseholdDetailsHeader.propTypes = {
};

export default HouseholdDetailsHeader;
