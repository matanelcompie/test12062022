import React from 'react';
import PropTypes from 'prop-types';

import Question from './Question';


const Questionnaire = ({questions, activeQuestionKey, questionTypeConst, votersAnswers, voter, onAnswerChange, onNextQuestionClick}) => {
    let activeQuestion = questions.filter(question => {return question.key == activeQuestionKey})[0];
    return (
        <div className="questionnaire">
            questionnaire
            {activeQuestionKey ?
                <Question
                    key={activeQuestionKey}
                    question={activeQuestion}
                    questionTypeConst={questionTypeConst}
                    voter={voter}
                    answerValue={votersAnswers[activeQuestionKey]}
                    onAnswerChange={onAnswerChange}
                    onNextQuestionClick={onNextQuestionClick}
                />
                : <div>The questionnaire is over, thank you and have a good day!</div>
            }
        </div>
    );
};

Questionnaire.PropTypes = {

};

export default Questionnaire;
