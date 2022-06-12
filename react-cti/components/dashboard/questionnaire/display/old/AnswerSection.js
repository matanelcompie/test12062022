import React from 'react';
import PropTypes from 'prop-types';

const AnswerSection = ({question, questionTypeConst, answerValue, onAnswerChange}) => {

    let handleInputChange = (event) => {
        let answer = {
            question_id: question.id,
            answer_text: event.target.value
        };
        onAnswerChange(answer);
    };

    let handleRadioChange = (event) => {
        let answer = {
            question_id: question.id,
            answer_text: event.target.dataset.text,
            possible_answer_id: parseInt(event.target.value)
        };
        onAnswerChange(answer);
    };

    let handleSelectChange = (event) => {
        let options = event.target.options;
        let answers = [];

        _.forEach(options, (option) => {
            if (option.selected) {
                answers = [...answers, {
                    question_id: question.id,
                    answer_text: option.label,
                    possible_answer_id: parseInt(option.value)
                }];
            }
        });
        onAnswerChange(answers);
    };


    let innerElem;
    switch (questionTypeConst[question.type]) {
        case 'text':
            innerElem = <input type="text" onChange={handleInputChange} value={answerValue.answer_text}/>;
            break;
        case 'radio':
            innerElem = question.possible_answers.map(possibleAnswer =>
                <label key={possibleAnswer.id}>
                    <input type="radio"
                           checked={answerValue.possible_answer_id === possibleAnswer.id}
                           value={possibleAnswer.id}
                           onChange={handleRadioChange}
                           data-text={possibleAnswer.text_general}/>
                    {possibleAnswer.text_general}
                </label>
            );
            break;
        case 'multiple':
            innerElem = <select multiple={true} onChange={handleSelectChange} value={_.map(answerValue, 'possible_answer_id')}>
                {question.possible_answers.map(possibleAnswer =>
                    <option key={possibleAnswer.id} label={possibleAnswer.text_general} value={possibleAnswer.id}/>
                )}
            </select>;
            break;
        case 'date':
            innerElem = <input type="date" onChange={handleInputChange} value={answerValue.answer_text}/>;
            break;
    }

    return (
        <div className="answer-section">{innerElem}</div>
    );
};

AnswerSection.propTypes = {
    question: PropTypes.object,
    answerValue: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]),
    onAnswerChange: PropTypes.func
};

AnswerSection.defaultProps = {
    //
};

export default (AnswerSection);
