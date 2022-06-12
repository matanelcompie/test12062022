import React from 'react';
import PropTypes from 'prop-types';

const ToggleCheckbox = ({onClick, value, className}) => {
    let wrapperClass = 'checkbox-inline '+ className;

    return (
        <div className={wrapperClass} onClick={onClick}>
            <label className="toggle">
                <input type="checkbox" className="toggle__checkbox" checked={value} readOnly />
                <div className={"toggle__slider btn active" + (value ? ' btn-primary' : ' btn-default')}></div>
            </label>
        </div>
    );
};

ToggleCheckbox.propTypes = {
    onClick: PropTypes.func.isRequired,
    value: PropTypes.bool,
    className: PropTypes.string
};

export default ToggleCheckbox;
