import React from 'react';
import PropTypes from 'prop-types';
import ActionAreaMenuComponent from 'components/dashboard/actionArea/actionAreaMenu/container/ActionAreaMenuComponent';
import ActionAreaMenuDrawer from 'components/dashboard/actionArea/actionAreaMenuDrawer/display/ActionAreaMenuDrawer';
import HouseholdComponent from 'components/dashboard/actionArea/household/container/HouseholdComponent';
import TransportationComponent from 'components/dashboard/actionArea/transportation/container/TransportationComponent';
import AddressComponent from 'components/dashboard/actionArea/address/container/AddressComponent';
import ContactInfoComponent from 'components/dashboard/actionArea/contactInfo/container/ContactInfoComponent';
import StatusComponent from 'components/dashboard/actionArea/status/container/StatusComponent';
import MessagesComponent from 'components/dashboard/actionArea/messages/container/MessagesComponent';

const ActionArea = ({activeActionArea, nextCall, endCallStatusesList, canUserEndCall}) => {

	let actionAreaComponents = {
		Household: <HouseholdComponent />,
		Transportation: <TransportationComponent />,
		Address: <AddressComponent />,
		ContactInfo: <ContactInfoComponent />,
		Status: <StatusComponent />,
		Messages: <MessagesComponent />,
	}

    return (
		<div className="action-area">
			<ActionAreaMenuComponent />
			<ActionAreaMenuDrawer show={false} nextCall={nextCall}
				endCallStatusesList={endCallStatusesList}
				canUserEndCall={canUserEndCall} />
			<div className="action-area__content">
				{actionAreaComponents[activeActionArea]}
			</div>
		</div>
    );
};

ActionArea.PropTypes = {
	activeActionArea: PropTypes.string,
};

export default ActionArea;
