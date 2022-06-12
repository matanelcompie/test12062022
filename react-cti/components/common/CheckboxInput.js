import React from 'react';
import PropTypes from 'prop-types';


const CheckboxInput = ({name, label, onChange, value, checked, className, disabled}) => {
    let wrapperClass = 'checkbox '+ className + (checked ? ` ${className}_checked` : '');

    let inputElem =
        <input
            type="checkbox"
            name={name}
            id={name+"_"+value}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />;

    return (
        <div className={wrapperClass}>
            {label ? 
                <label>{inputElem}{label}</label> 
                : inputElem
            }
        </div>
    );
};

CheckboxInput.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
    checked: PropTypes.bool,
    className: PropTypes.string
};

CheckboxInput.defaultProps = {
    className: '',
    value: '',
    onChange: () => {},
};

export default CheckboxInput;