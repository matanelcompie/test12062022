import React from 'react';
import PropTypes from 'prop-types';
import constants from 'tm/constants/constants';


const QuestionModalButtons = ({onQuestionChange,
                                onDeleteQuestionClick,
                                onCloseQuestionModal,
                                onSaveClick,
                                editedQuestion,
                                question,
                                textField}) => {

	let textValues = {
		save: 'שמירה',
		cancel: 'בטל'
	}

    let questionConst = constants.TM.CAMPAIGN.QUESTIONS;

    let questionLengthError = false;
    textField.forEach(field => {
        let value = (question[field.name])? question[field.name] : '';
        if (question.type != questionConst.TYPES.MESSAGE && value.length > questionConst.LENGTH.NORMAL) questionLengthError = true;
        else if (question.type == questionConst.TYPES.MESSAGE && value.length > questionConst.LENGTH.MESSAGE) questionLengthError = true;
    });

    /**
     * Save if doesn't have error
     *
     * @return void
     */
    function saveClick() {
        if (!questionLengthError) onSaveClick();
    }
    
	return(
		<div className="question-modal__footer">
            <div className="question-modal__footer-btns">
                {editedQuestion.id > 0 ?
                    [
                    <span key="active" className="btn question-modal__btn" onClick={() => onQuestionChange('active', !editedQuestion['active'])}>
                        <i className={"action-icon fa fa-eye" + (editedQuestion.active ? '' : '-slash')} aria-hidden="true"/>
                    </span>,
                    <span key="delete" className={"btn question-modal__btn" + (editedQuestion.answered ? ' disabled' : '')} onClick={onDeleteQuestionClick}>
                        <i className="action-icon fa fa-trash" aria-hidden="true"/>
                    </span>
                    ]
                :""}
                <span className="btn question-modal__btn question-modal__btn_type_cancel" onClick={() => onCloseQuestionModal()}>
                    {textValues.cancel}
                </span>
                <span className={"btn btn-primary question-modal__btn" + (questionLengthError ? ' disabled' : '') + " question-modal__btn_type_save"} onClick={saveClick}>
                    {textValues.save}
                </span>
            </div>
        </div>
	);
}

QuestionModalButtons.propTypes = {
    
}

export default QuestionModalButtons;