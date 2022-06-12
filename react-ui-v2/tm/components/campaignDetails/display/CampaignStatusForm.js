import React from 'react';
import PropTypes from 'prop-types';

import ComboSelect from 'tm/components/common/ComboSelect';


const CampaignStatusForm = ({selectedStatus, campaignStatusArr, onStatusChange, validCampignArr}) => {
    let textValues = {
        chooseStatus: 'בחר סטטוס',
        completeAlert: 'אנא השלם הגדרות',
    };


    return (
        <div className="campaign-status-form">
            <div className="campaign-status-form_valid-campign">
                {validCampignArr.map((item, i) =>
                    <div key={i}>
                        <span>{item.label}: </span>
                        {item.isValid
                            ? <i className="fa fa-check"></i>
                            : <span>{textValues.completeAlert}</span>
                        }
                    </div>
                )}
            </div>
            <ComboSelect
                label={textValues.chooseStatus}
                value={0}
                defaultValue={0}
                name="status"
                options={campaignStatusArr}
                onChange={onStatusChange}
                itemDisplayProperty="name"
                itemIdProperty="id"
            />
        </div>
    );
}

CampaignStatusForm.propTypes = {
    selectedStaus: PropTypes.number,
    campaignStatusArr: PropTypes.array,
    onStatusChange: PropTypes.func,
    validCampignArr: PropTypes.array,
}

export default CampaignStatusForm;
