import React from 'react';

const ElectionCampainItem = ({item, electionCampaignChecked, electionCampaignChange, numOfCheckedCampaigns}) => {
    return (
        <li>
            <a tabIndex="0" className="multi-select-campaign">
                <label className="checkbox">
                    <input type="checkbox" checked={electionCampaignChecked}
                           disabled={!electionCampaignChecked && numOfCheckedCampaigns == 3}
                           onChange={electionCampaignChange.bind(this, item.key, item.id)}/>
                    {item.name}
                </label>
            </a>
        </li>
    );
};

export default ElectionCampainItem;