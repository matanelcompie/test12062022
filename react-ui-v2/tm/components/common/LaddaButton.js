import React from 'react';
import PropTypes from 'prop-types';

const LaddaButton = ({loading, disabled, className, onClick, children, type}) => {
    let buttonClass = 'ladda-button ';
        buttonClass += (loading ? 'ladda-button_loading ': '');
        buttonClass += className;
    return (
        <button className={buttonClass} type={type} disabled={disabled || loading} onClick={onClick}>
            <span className="ladda-label">
              {children}
            </span>
            <span className="ladda-spinner" />
        </button>
    );
};

LaddaButton.propTypes = {
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
    type: PropTypes.string
};

LaddaButton.defaultProps = {
    loading: false,
    disabled: false,
    className: '',
    onClick: () => {}
};

export default (LaddaButton);
