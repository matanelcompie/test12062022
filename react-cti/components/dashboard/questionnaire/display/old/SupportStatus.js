import React from 'react';
import PropTypes from 'prop-types';

const SupportStatus = ({statusList, onChange, selectedId}) => {
    let handleClick = (event) => {
        onChange('support_status_id',Number(event.target.dataset.id));
    };

    return (
        <div className="support-status">
            <h2>Support Status:</h2>
            {statusList.map(supportStatus =>
                <div
                    key={supportStatus.id}
                    className={"support-status__status-btn" + (supportStatus.id === selectedId ? ' support-status__status-btn_selected' : '')}
                    onClick={handleClick}
                    data-id={supportStatus.id}
                >
                    {supportStatus.name}
                </div>
            )}
        </div>
    );
};

SupportStatus.propTypes = {
    statusList: PropTypes.array,
    onChange: PropTypes.func,
    selectedKey: PropTypes.string,
};

SupportStatus.defaultProps = {
    statusList: [],
    onChange: () => {},
    selectedKey: null,
};

export default (SupportStatus);
