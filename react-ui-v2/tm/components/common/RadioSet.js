import React from 'react';
import PropTypes from 'prop-types';

const RadioInput = ({name, label, value, checked, onChange, className, inline, disabled}) => {
    let wrapperClass = (inline ? 'radio-inline ' : 'radio ') + className;
    let inputElem = <input
                        type="radio"
                        name={name}
                        value={value}
                        id={name + '_' + value}
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                    />;

    return (inline ?
            <label className={wrapperClass}>{inputElem}{label}</label>
            :
            <div className={wrapperClass}>
                <label>{inputElem}{label}</label>
            </div>
    );
};

RadioInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    inline: PropTypes.bool
};

RadioInput.defaultProps = {
    label: '',
    value: ''
};


const RadioSet = ({name, options, activeValue, onChange, className, outerClassName, inline, disabled}) => {
    return (
        <div className={outerClassName}>
            {options.map(option =>
                <RadioInput
                    key={`${name}_${option.value}`}
                    name={name}
                    label={option.label}
                    value={option.value}
                    checked={activeValue == option.value}
                    onChange={onChange}
                    className={className}
                    inline={inline}
                    disabled={disabled}
                />
            )}
        </div>
    );
};

RadioSet.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.array,
    activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    inline: PropTypes.bool
};

RadioSet.defaultProps = {
    options: [],
    activeValue: '',
    className: '',
    outerClassName: '',
    inline: false
};

export default RadioSet;
