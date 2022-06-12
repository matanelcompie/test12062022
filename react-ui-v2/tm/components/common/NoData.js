import React from 'react';
import PropTypes from 'prop-types';

const NoData = ({ noDataText, rightButtonText, leftButtonText, onRightButtonClick, onLeftButtonClick, isPermittedAdding }) => {
    let buttons = '';
    if (isPermittedAdding) {
        buttons = <div className="no-data__btns">
            {rightButtonText && <div className="no-data__btn" onClick={onRightButtonClick}>{rightButtonText}</div>}
            {leftButtonText && <div className="no-data__btn no-data__btn_main" onClick={onLeftButtonClick}>{leftButtonText}</div>}
        </div>
    }
    return (
        <div className="no-data">
            <div className="no-data__icon"><i className="fa fa-exclamation-triangle fa-5x" aria-hidden="true" /></div>
            <div className="no-data__main_txt">{noDataText}</div>
            {buttons}
        </div>
    );
};

NoData.propTypes = {
    noDataText: PropTypes.string,
    rightButtonText: PropTypes.string,
    leftButtonText: PropTypes.string,
    onRightButtonClick: PropTypes.func,
    onLeftButtonClick: PropTypes.func
};

NoData.defaultProps = {
    onRightButtonClick: () => { },
    onLeftButtonClick: () => { }
};

export default NoData;
