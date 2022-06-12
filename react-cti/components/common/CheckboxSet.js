import React from 'react';
import PropTypes from 'prop-types';


const CheckboxInput = ({name, label, value, checked, onChange, className, inline, disabled}) => {
    let wrapperClass = (inline ? 'radio-inline ' : 'radio ')
        + className
        + (checked ? ` ${className}_checked` : '')
        + (disabled ? ` ${className}_disabled` : '');

    let inputElem =
        <input
            type="checkbox"
            name={name}
            value={value}
            id={name + '_' + value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />;

    return (
        inline ?
            <label className={wrapperClass}>{inputElem}{label}</label>
            :
            <div className={wrapperClass}>
                <label>{inputElem}{label}</label>
            </div>
    );
};

CheckboxInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    inline: PropTypes.bool
};

CheckboxInput.defaultProps = {
    label: '',
    value: ''
};


const CheckboxSet = ({name, options, values, onChange, className, outerClassName, inline, disabled}) => {

    function onChangeTemp(event) {
        let newValues = [];
        if(event.target.checked)
            newValues = _.union(values, [event.target.value]);
        else
            newValues = _.without(values, event.target.value);
        onChange(name, newValues);
    }

    return (
        <div className={outerClassName}>
            {options.map(option =>
                <CheckboxInput
                    key={`${name}_${option.value}`}
                    name={`${name}_${option.value}`}
                    label={option.label}
                    value={option.value}
                    checked={values.includes(option.value)}
                    onChange={onChangeTemp}
                    className={className}
                    inline={inline}
                    disabled={disabled}
                />
            )}
        </div>
    );
};

CheckboxSet.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.array,
    values: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    inline: PropTypes.bool
};

CheckboxSet.defaultProps = {
    options: [],
    values: [],
    className: '',
    outerClassName: '',
    inline: false
};

export default CheckboxSet;
