import React from 'react';
import PropTypes from 'prop-types';


const QuestionListHeader = () => {
    let textValues = {
        question: 'שאלה',
        nextQuestion: 'שאלה הבאה',
        nextPossibilities: 'שאלות הבאות אפשריות',
        actions: 'פעולות',
    }
    return (
        <div className="question-list-row-data question-list-header">
            <div className="question-list__cell question-list__cell_col_expand question-list__cell_spacer"/>
            <div className="question-list__cell question-list__cell_col_order">#</div>
            <div className="question-list__cell question-list__cell_col_question">{textValues.question}</div>
            <div className="question-list__cell question-list__cell_col_next">{textValues.nextQuestion}</div>
            <div className="question-list__cell question-list__cell_col_next-possibilities">{textValues.nextPossibilities}</div>
            <div className="question-list__cell question-list__cell_col_actions">{textValues.actions}</div>
        </div>
    );
}

QuestionListHeader.propTypes = {

}

export default QuestionListHeader;