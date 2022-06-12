import React from 'react';
import PropTypes from 'prop-types';

const QuestionListRowButtons = ({question, onQuestionEditClick, onDeleteQuestionClick, onQuestionActiveClick}) => {
	return (
		<div className="question-list__cell question-list__cell_col_actions">
	        <div className="list-actions">
	            <i className="action-icon fa fa-pencil" aria-hidden="true" onClick={() => onQuestionEditClick(question.key, false)}/>
	            <i className="action-icon fa fa-trash" aria-hidden="true" onClick={() => onDeleteQuestionClick()}/>
	            <i className="action-icon fa fa-files-o fa-flip-horizontal" aria-hidden="true" onClick={() => onQuestionEditClick(question.key, true)}/>
	            <i className={"action-icon fa fa-eye" + (question.active ? '' : '-slash')} aria-hidden="true" onClick={() => onQuestionActiveClick(question.key)}/>
	        </div>
	    </div>
	);
}

QuestionListRowButtons.propTypes = {
    question: PropTypes.object,
    onQuestionEditClick: PropTypes.func,
    onDeleteQuestionClick: PropTypes.func,
    onQuestionActiveClick: PropTypes.func
}

export default QuestionListRowButtons;
