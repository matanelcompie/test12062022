import React from 'react';
import PropTypes from 'prop-types';

const SelectInput = ({name, label, onChange, defaultOption, value, error, options, required, disabled, className, requireDefault}) => {
    return (
        <div className="form-group">
            {label && <label htmlFor={name}>{label}</label>}
            {/* Note, value is set here rather than on the option - docs: https://facebook.github.io/react/docs/forms.html */}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={"form-control " + className}
                disabled={disabled}>
                {!requireDefault && <option value="">{defaultOption}</option>}
                {options.map(option =>
                    <option key={option.value} value={option.value}>{option.label}</option>
                )}
            </select>
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
};

SelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    error: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.object),
    required: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    requireDefault: PropTypes.bool
};

SelectInput.defaultProps = {
    options: [],
    className: '',
};

export default SelectInput;
