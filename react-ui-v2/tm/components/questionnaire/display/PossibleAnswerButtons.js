import React from 'react';
import PropTypes from 'prop-types';

const PossibleAnswerButtons = ({possibleAnswer, onDeletePossibleAnswer, onAddPossibleAnswerClick, onPossibleAnswerChange, isEditMode}) => {
	return (
		<div className="possible-answer__btns">
            <span
                className={"btn question-modal__btn" + (isEditMode ? '' : ' disabled')}
                onClick={() => onAddPossibleAnswerClick(possibleAnswer.id)}
            >
                <i className="action-icon fa fa-plus" aria-hidden="true"/>
            </span>
            <span
                className={"btn question-modal__btn" + (isEditMode ? '' : ' disabled')}
                onClick={() => onPossibleAnswerChange('active',  !possibleAnswer.active, possibleAnswer.id)}
            >
                <i className={"action-icon fa fa-eye" + (possibleAnswer.active ? '' : '-slash')} aria-hidden="true"/>
            </span>
            <span
                className={"btn question-modal__btn" + (isEditMode ? '' : ' disabled')}
                onClick={() => onAddPossibleAnswerClick(possibleAnswer.id, 'true')}
            >
                <i className="action-icon fa fa-files-o  fa-flip-horizontal" aria-hidden="true"/>
            </span>
            <span
                className={"btn question-modal__btn" + (isEditMode ? '' : ' disabled')}
                onClick={() => onDeletePossibleAnswer(possibleAnswer.id)}
            >
                <i className="action-icon fa fa-trash" aria-hidden="true"/>
            </span>
        </div>
    )	
};


PossibleAnswerButtons.propTypes = {
    possibleAnswer: PropTypes.object,
    onPossibleAnswerChange: PropTypes.func,
    onDeletePossibleAnswer: PropTypes.func,
    onAddPossibleAnswerClick: PropTypes.func,
    isEditMode: PropTypes.bool,
}

export default PossibleAnswerButtons;