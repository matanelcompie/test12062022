import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({name, label, onChange, placeholder, value, error, onKeyDownEnter, className, disabled, rows, cols, isHorizontal}) => {
    value = value || '';

    let wrapperClass = 'form-group';
    if (error && error.length > 0) {
        wrapperClass += " " + 'has-error';
    }

    function onKeyPress(event) {
        if(event.key == 'Enter')
            onKeyDownEnter();
    }
    let labelElem = label ? <label htmlFor={name} children={label}/> : '';
    let inputElem = <textarea
        name={name}
        rows={rows}
        cols={cols}
        onChange={onChange}
        value={value}
        className={"form-control " + className}
        placeholder={placeholder}
        disabled={disabled}
    />;

    return (
        <div className={wrapperClass} style={{verticalAlign: 'top'}}>
            {isHorizontal ? <div className="col-sm-2" children={labelElem}/> : labelElem}
            {isHorizontal ? <div className="col-sm-10" children={inputElem}/> : inputElem}
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
};

Textarea.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.string,
    onKeyDownEnter: PropTypes.func,
    className: PropTypes.string,
    rows: PropTypes.number,
    cols: PropTypes.number,
    isHorizontal: PropTypes.bool,
};

Textarea.defaultProps = {
    className: '',
    onKeyDownEnter: () => {},
};

export default Textarea;
