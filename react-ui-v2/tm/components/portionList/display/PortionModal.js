import React from 'react';
import PropTypes from 'prop-types';

import ModalWindow from 'tm/components/common/ModalWindow';
import VoterFilter from 'components/global/voterFilter/container/VoterFilter';


const PortionModal = ({ portion, newVoterFilterParentKey, onPortionModalCloseClick, currentCampaignKey }) => {
    let textValues = {
        filters: 'סינונים'
    }
    return (
        <div className="portion-modal">
            <ModalWindow
                show={true}
                title={textValues.filters}
                buttonX={onPortionModalCloseClick}
                footer={<span />}
            >
                <VoterFilter
                    baseVoterFilter={portion}
                    moduleType="portion"
                    newVoterFilterParentKey={newVoterFilterParentKey}
                    closeModal={onPortionModalCloseClick}
                    currentCampaignKey={currentCampaignKey}
                />
            </ModalWindow>
        </div>
    );
}

PortionModal.propTypes = {
    portion: PropTypes.object,
    newVoterFilterParentKey: PropTypes.string,
    onPortionModalCloseClick: PropTypes.func
}

export default PortionModal;
