import React from 'react';
import PropTypes from 'prop-types';

const PossibleAnswerHeader = ({isHaveNextQuestion}) => {

	let textValues = {
        answer: 'תשובה',
        nextQuestion: 'שאלה הבאה',
        updateStatus: 'עדכון סטטוס'
    }; 
        
	return (
		<div className="possible-answer-list__headers">
            <div className="possible-answer-list__cell possible-answer-list__cell_col_answer">{textValues.answer}</div>
            {isHaveNextQuestion &&
                <div className="possible-answer-list__cell possible-answer-list__cell_col_next-question">{textValues.nextQuestion}</div>
            }
            <div className="possible-answer-list__cell possible-answer-list__cell_col_status">{textValues.updateStatus}</div>
        </div>
    )	
};


PossibleAnswerHeader.propTypes = {
    isHaveNextQuestion: PropTypes.bool
}

export default PossibleAnswerHeader;