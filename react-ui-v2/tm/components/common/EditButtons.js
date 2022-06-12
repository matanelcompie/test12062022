import React from 'react';
import PropTypes from 'prop-types';

import LaddaButton from './LaddaButton';

const EditButtons = ({isEditing, onSaveClick, onCancelClick, onEditClick, editLabel, saveLabel, cancelLabel, className,  isPending, disableSave}) => {
    return (
        <div className={className}>
            {(isEditing || isPending) ?
                <div>
                    <LaddaButton onClick={onSaveClick} value="submit" type="submit" className="btn btn-primary btn-sm" loading={isPending} disabled={disableSave}>
                        <i className="fa fa-floppy-o"></i>&nbsp;&nbsp;
                        <span>{saveLabel}</span>
                    </LaddaButton>
                    &nbsp;&nbsp;
                    <button onClick={onCancelClick} type="button" className="btn btn-danger pull-left btn-sm" disabled={isPending}>
                        <i className="fa fa-ban"></i>&nbsp;&nbsp;
                        <span>{cancelLabel}</span>
                    </button>
                </div>
                :
                <button onClick={onEditClick} type="button" className="btn btn-primary btn-block btn-sm">
                    <i className="fa fa-pencil"></i>&nbsp;&nbsp;
                    <span>{editLabel}</span>
                </button>
            }
        </div>
    );
};

EditButtons.propTypes = {
    isEditing: PropTypes.bool,
    onEditClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    onCancelClick: PropTypes.func,
    editLabel: PropTypes.string,
    saveLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    className: PropTypes.string,
    isPending: PropTypes.bool
};

EditButtons.defaultProps = {
    cancelLabel: 'בטל',
    saveLabel: 'שמור',
    editLabel: 'ערוך',
    className: '',
    isPending: false,
    onSaveClick: ()=>{}
};

export default EditButtons;
