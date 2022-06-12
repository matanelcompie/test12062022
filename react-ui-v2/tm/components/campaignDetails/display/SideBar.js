import React from 'react';
import PropTypes from 'prop-types';

import History from './History';
import StatusHeader from './StatusHeader';

const SideBar = ({campaignEdits, campaignStatusList}) => {
	let sideBarHistory = [
		{title: `תאריך התחלה`, text: campaignEdits.activation_start_date, date: ``, status: `` },
		{title: `עובדים`, text: `22 עובדים התגייסו לקמפיין`, date: `22.05.2016`, status: `` },
		{title: `קמפיין פעיל`, text: `הקמפיין עבר לסטטוס פעיל`, date: `26.04.2017`, status: `ok` },
		{title: `תושבים`, text: `250 בחרים הצטרפו לקמפיין`, date: `10.05.2017`, status: `` },				
		{title: `שאלון`, text: `נוצר שאלון חדש`, date: `11.03.2017`, status: `` },
	];

    return (
    	<div className="campaign-sidebar">
    		<StatusHeader statusCampaign={campaignEdits.status} campaignStatusList={campaignStatusList}/>
	    	<div className="campaign-sidebar__history-block">
		    	{sideBarHistory.map((sbHistory, i) => 
		            <History 
		            	key={i} 
		            	title={sbHistory.title} 
		            	text={sbHistory.text} 
		            	date={sbHistory.date} 
		            	status={sbHistory.status}
	            	/>
			    )}
		    </div> 
	    </div>
    );
}

SideBar.propTypes = {
    campaignStatusList: PropTypes.object
}

export default SideBar;