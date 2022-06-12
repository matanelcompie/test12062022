import React from 'react';
import PropTypes from 'prop-types';

import CheckboxInput from 'tm/components/common/CheckboxInput';


const Statuses = ({searchStatusesChecked, onCoverClick, onSearchStatusChange, campaignStatusOptions}) => {
	let textValues = {
        markAll: "סמן הכל",
        removeAll: "נקה"
    };

    let onSearchStatusChecked = (event) => {
        let searchStatusList = searchStatusesChecked;
        let statusId = eval(event.target.value);

        if(event.target.checked)
        	searchStatusList.push(statusId);
        else {
            let index = searchStatusList.indexOf(statusId);
            searchStatusList.splice(index, 1);
        }
        onSearchStatusChange(searchStatusList);
    }

    let campaignStatusKeys = _.keys(campaignStatusOptions);

	return (
		<div className="status-filter">
			<div className="tm-popup__cover" onClick={onCoverClick}></div>
			<div className="status-filter__general-actions">
				<span onClick={() => onSearchStatusChange(campaignStatusKeys.map(item => {return eval(item)}))}>{textValues.markAll}</span>
					&nbsp; - &nbsp;
				<span onClick={() => onSearchStatusChange([])}>{textValues.removeAll}</span>
			</div>
			<div className="status-filter__statuses">
        	{campaignStatusKeys.map(key=>
					<CheckboxInput
						key={key}
						name="status"
						value={key}
						label={campaignStatusOptions[key]}
						onChange={onSearchStatusChecked}
						checked={searchStatusesChecked.indexOf(eval(key)) > -1}
						className={`status-filter__status status-filter__status_id_${key}`}
					/>
				)}
			</div>
		</div>
	);
};

Statuses.propTypes = {
    searchStatusesChecked: PropTypes.array,
    onSearchStatusChange: PropTypes.func,
    onCoverClick:PropTypes.func,
    campaignStatusOptions: PropTypes.object
};

export default Statuses;
