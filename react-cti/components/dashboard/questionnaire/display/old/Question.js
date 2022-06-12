import React from 'react';
import PropTypes from 'prop-types';

import AnswerSection from './AnswerSection';

const Question = ({question, voter, questionTypeConst, answerValue, onAnswerChange, onNextQuestionClick}) => {
    let textToUse = question['text_' + (['general', 'male', 'female'][voter.gender])]; // using + to coerce to number

    return (
        <div className={`question question_type_${questionTypeConst[question.type]}`}>
            <div>question id: {question.id}</div>
            <div>question key: {question.key}</div>
            <div>question text: {textToUse}</div>
            <AnswerSection question={question} questionTypeConst={questionTypeConst} answerValue={answerValue} onAnswerChange={onAnswerChange}/>
            <div>
                <button onClick={onNextQuestionClick}>Next Question</button>
            </div>
        </div>
    );
};

Question.propTypes = {
    question: PropTypes.object,
    voter: PropTypes.object,
    answerValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onAnswerChange: PropTypes.func,
    onNextQuestionClick: PropTypes.func
};

Question.defaultProps = {
    answerValue: {
        answer_text: ''
    }
};

export default (Question);
