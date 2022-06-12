import React from 'react';
import PropTypes from 'prop-types';

const TextInput = ({name, label, type, onChange, placeholder, value, error,errorMsg, onKeyDownEnter, bsFeedbackIcon, className,  disabled,
                    required, isHorizontal, isInvalid, minNumber, maxNumber , style=null}) => {
    let wrapperClass = 'form-group';
    if(error)
        wrapperClass += " " + 'has-error';
    if(bsFeedbackIcon)
        wrapperClass += ' has-feedback';

    function onKeyPress(event) {
        if(event.key == 'Enter')
            onKeyDownEnter();
    }

    let validClass = (isInvalid)? "invalid" : "";

    let labelElem = label ? <label htmlFor={name} className="control-label" children={label}/> : '';
    let inputElem = '';

    if (type == 'number') {
        let minValue = minNumber ? minNumber: 0;

        if (maxNumber) {
            inputElem = <input
                type={type || "text"}
                name={name}
                className={`form-control ${className} ${validClass}`}
                placeholder={placeholder}
                min={minValue}
                max={maxNumber}
                value={value || ''}
                onKeyPress={onKeyPress}
                onChange={onChange}
                disabled={disabled}
                required={required}
				style={style}
				/>;
        } else {
            inputElem = <input
                type={type || "text"}
                name={name}
                className={`form-control ${className} ${validClass}`}
                placeholder={placeholder}
                min={minValue}
                value={value || ''}
                onKeyPress={onKeyPress}
                onChange={onChange}
                disabled={disabled}
                required={required}
				style = {style}
				/>;
        }

    } else {
        inputElem = <input
            type={type || "text"}
            name={name}
            className={`form-control ${className} ${validClass}`}
            placeholder={placeholder}
            value={value || ''}
            onKeyPress={onKeyPress}
            onChange={onChange}
            disabled={disabled}
            required={required}
			style = {style}
			/>;
    }

    return (
        <div className={wrapperClass}>
            {isHorizontal ? <div className="col-sm-2" children={labelElem}/> : labelElem}
            {isHorizontal ? <div className="col-sm-10" children={inputElem}/> : inputElem}
            {bsFeedbackIcon && <span className={`glyphicon glyphicon-${bsFeedbackIcon} form-control-feedback`} aria-hidden="true"></span>}
            {errorMsg && <span className="help-block">{errorMsg}</span>}
        </div>
    );
};

TextInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    error: PropTypes.bool,
    errorMsg: PropTypes.string,
    onKeyDownEnter: PropTypes.func,
    bsFeedbackIcon: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    isHorizontal: PropTypes.bool,
};

TextInput.defaultProps = {
    onKeyDownEnter: function(){},
    className: '',
}

export default TextInput;
