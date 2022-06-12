import React from 'react';
import PropTypes from 'prop-types';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import { parseDateToPicker } from 'libs/globalFunctions';


const DateInput = ({ name, label, onChange, value, format, timeFormat, savingFormat, calendar, time, isRtl,
    error, errorMsg, className, bsFeedbackIcon, disabled, required, isHorizontal }) => {
    let wrapperClass = 'form-group';
    if (error)
        wrapperClass += " " + 'has-error';
    if (bsFeedbackIcon)
        wrapperClass += ' has-feedback';

    function onChangeTemp(value) {
        let date;
        if (value == '') {
            date = '';
        }
        else {
            date = moment(value);
            date = date.isValid() ? date.format(savingFormat || format) : null;
        }
        onChange(name, date);
    }

    let labelElem = label ? <label htmlFor={name} className="control-label" children={label} /> : '';
    let inputElem =
        <ReactWidgets.DateTimePicker
            isRtl={isRtl}
            value={parseDateToPicker(value)}
            onChange={onChangeTemp}
            format={format}
            timeFormat={timeFormat ? timeFormat : 'HH:mm'}
            calendar={calendar}
            time={time}
            disabled={disabled}
            required={required}
        />
    //disabled? required?

    return (
        <div className={wrapperClass}>
            {isHorizontal ? <div className="col-sm-2" children={labelElem} /> : labelElem}
            {isHorizontal ? <div className="col-sm-10" children={inputElem} /> : inputElem}
            {bsFeedbackIcon && <span className={`glyphicon glyphicon-${bsFeedbackIcon} form-control-feedback`} aria-hidden="true"></span>}
            {errorMsg && <span className="help-block">{errorMsg}</span>}
        </div>
    );
};

DateInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    error: PropTypes.bool,
    errorMsg: PropTypes.string,
    bsFeedbackIcon: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    isHorizontal: PropTypes.bool,
    format: PropTypes.string,
    savingFormat: PropTypes.string,
    calendar: PropTypes.bool,
    time: PropTypes.bool,
    isRtl: PropTypes.bool,
};

DateInput.defaultProps = {
    className: '',
    format: "DD/MM/YYYY",
    calendar: true,
    time: false,
    isRtl: true,
}

export default DateInput;
