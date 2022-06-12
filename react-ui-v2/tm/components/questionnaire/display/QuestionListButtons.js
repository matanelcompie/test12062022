import React from 'react';
import PropTypes from 'prop-types';

import LaddaButton from 'tm/components/common/LaddaButton';


const QuestionListButtons = ({onNewQuestionClick, onEditQuestionsClick, onSaveQuestionsClick, isEditQuestions, isPending}) => {
    let textValues = {
        title: 'ערוך סדר שאלות',
        newQuestion: 'צור שאלה חדשה',
        editQuestions: 'ערוך סדר שאלות',
        saveQuestions: 'שמור סדר שאלות',
        cancelEdit: 'בטל'
    };
    return (
        <div className="tab-title question-list-title">
            <div className="tab-title__title">{textValues.title}</div>
            <div className="tab-title__btns">
                {isEditQuestions ?
                    [
                        <button key="1" className="btn question-list-title__cancel-question-btn"
                                onClick={() => onEditQuestionsClick()}>
                            {textValues.cancelEdit}</button>,
                        <LaddaButton key="2" className="btn question-list-title__save-question-btn"
                                     onClick={() => onSaveQuestionsClick()}
                                     loading={isPending}>
                            <i className="fa fa-floppy-o" aria-hidden="true"/>
                            {textValues.saveQuestions}
                        </LaddaButton>
                    ]
                    :
                    <button className="btn question-list-title__edit-question-btn"
                            onClick={() => onEditQuestionsClick()}>
                        <i className="fa fa-list-ol" aria-hidden="true"/> {textValues.editQuestions}
                    </button>
                }
                <button className="btn question-list-title__new-question-btn" disabled={isEditQuestions}
                        onClick={() => onNewQuestionClick(null, true)}>
                    <i className="fa fa-question-circle" aria-hidden="true"/> {textValues.newQuestion}
                </button>
            </div>
        </div>
    );
}

QuestionListButtons.propTypes = {
    onNewQuestionClick: PropTypes.func,
    onEditQuestionsClick: PropTypes.func,
    onSaveQuestionsClick:PropTypes.func,
    isEditQuestions: PropTypes.bool,
    isPending: PropTypes.bool
}

export default QuestionListButtons;