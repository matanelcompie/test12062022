import React from 'react';
import PropTypes from 'prop-types';

const StatusHeader = ({ statusCampaign, campaignStatusOptions, campaignStatusConstOptions, onOpenCampaignStatusModalClick }) => {
    let textValues = {
        changeStatus: 'שנה סטטוס קמפיין',
    }
    let statusOption = campaignStatusOptions.find(function (status) {
        if (statusCampaign == status.id) return status;
    });
    let statusName = (statusOption != undefined) ? statusOption.name : '';
    return (
        <div className="campaign-sidebar__header">
            <span className={`campaign-status campaign-status_${campaignStatusConstOptions[statusCampaign].toLowerCase()}`} onClick={onOpenCampaignStatusModalClick} title={textValues.changeStatus}>
                {statusName}
            </span>
        </div>
    );
}

StatusHeader.propTypes = {
    statusCampaign: PropTypes.number,
    campaignStatusOptions: PropTypes.array,
    campaignStatusConstOptions: PropTypes.array,
    onOpenCampaignStatusModalClick: PropTypes.func,
}

export default StatusHeader;
