import React from 'react';

import constants from 'libs/constants';

const ElectionCampaignItem = ({campaignIndex, item, currentCampignId, editPermission, redirectToEditCampaign}) => {
    const electionCampaignTypes = constants.electionCampaignTypes;

    function renderEditButton(item) {
        if ( editPermission ) {
            return <span className="edit-group edit-group-icon" style={{cursor: 'pointer'}} onClick={redirectToEditCampaign.bind(this , item.key)}/>;
        } else {
            return '\u00A0';
        }
    }

    function getTime(timeValue) {
        let timeElements = timeValue.split(':');
        let hour = timeElements[0];
        let minutes = timeElements[1];

        if ( hour.indexOf("0") == 0 ) {
            hour = hour.slice(1);
        }

        return (hour + ':' + minutes);
    }

    function getTypeName(type) {
        switch(item.type) {
            case electionCampaignTypes.knesset:
                return 'כנסת';
                break;

            case electionCampaignTypes.municipal:
                return 'רשויות';
                break;

            case electionCampaignTypes.intermediate:
                return 'ביניים';
                break;
        }
    }
	
    return (
        <tr className={campaignIndex == 0 ? "selected-period" : ""}>
            <td>{campaignIndex + 1}</td>
            <td><u><a className="cursor-pointer" onClick={redirectToEditCampaign.bind(this, item.key)}>{item.name}</a></u></td>
            <td>{getTypeName(item.type)}</td>
            <td>{item.election_date != null ? item.election_date.split('-').reverse().join('/') : '\u00A0'}</td>
            <td>{item.vote_start_time != null ? getTime(item.vote_start_time) : '\u00A0'}</td>
            <td>{item.vote_end_time != null ? getTime(item.vote_end_time) : '\u00A0'}</td>
            <td className="text-center"><input type="checkbox" title="מערכת פעילה" checked={item.id == currentCampignId}
                                               disabled={true}/></td>
            <td>{renderEditButton(item)}</td>
        </tr>
    );
};

export default ElectionCampaignItem;