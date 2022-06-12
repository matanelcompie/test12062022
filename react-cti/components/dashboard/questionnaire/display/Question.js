import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';

import AnswerSection from './AnswerSection';


const Question = ({ question, questionIndex, voter, voterAnswers, currentUser, questionTypeConst, answerValue, onVoterAnswerChange, onNextQuestionClick, onPrevQuestionClick, nextCall, canUserEndCall }) => {
    if (R.isEmpty(question)) return <div className="question question_empty" />;

    let textToUse = question['text_' + (['general', 'male', 'female'][+voter.gender])] || question['text_general']; // using + to coerce to number
    let textValues = {
        nextQuestion: 'שאלה הבאה',
        prevQuestion: 'שאלה קודמת',
    };
    textToUse = textToUse.replace('[שם_פרטי]', voter.first_name)
                        .replace('[שם_משפחה]', voter.last_name)
                        .replace('[עיר]', voter.address.city)
                        .replace('[נציג]', currentUser.first_name)
                        .replace('[ת"ז]', voter.personal_identity);

    let errorMessage = '';
    let next_question_id = question.next_question_id;
    if(questionTypeConst[question.type] == 'radio') {
        let questionAnswer = voterAnswers[question.id];
        if(questionAnswer && questionAnswer.possibleAnswerKey) {
            question.possible_answers.forEach(ps => {
                if(ps.key == questionAnswer.possibleAnswerKey && ps.jump_to_question_id) {
                    next_question_id = ps.jump_to_question_id;
                }
            })
        }
    }
    if (!next_question_id) { errorMessage = 'חובה לענות לשאלה!' }
    else if (next_question_id == -1 && Object.keys(voterAnswers).length == 0) {
            errorMessage = 'חובה למלא את השאלון!'
    }
    return (
        <div className={`question question_type_${questionTypeConst[question.type]}`}>
            <div className="question__number">{'שאלה מספר ' + questionIndex}</div>
            <div className="question__text">{textToUse}</div>
            <AnswerSection
                question={question}
                questionTypeConst={questionTypeConst}
                answerValue={answerValue}
                onVoterAnswerChange={onVoterAnswerChange}
            />
            <div className="question__nav">
                {question.next_question_id > -1 ?
                    <button className="cti-btn cti-btn_type_primary" disabled={!next_question_id} onClick={onNextQuestionClick}>{textValues.nextQuestion}</button>
                    :
                    <button className="cti-btn cti-btn_type_primary" disabled={!canUserEndCall} onClick={nextCall}>שיחה הבאה</button>
                }
                {errorMessage && <b style={{ color: 'red', marginTop: '6px' }}>{errorMessage}</b>}
                {questionIndex > 1 &&
                    <button className="cti-btn" onClick={onPrevQuestionClick}>{textValues.prevQuestion}</button>
                }
            </div>
        </div>
    );
};

Question.propTypes = {
    question: PropTypes.object,
    questionIndex: PropTypes.number,
    voter: PropTypes.object,
    questionTypeConst: PropTypes.object,
    answerValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onVoterAnswerChange: PropTypes.func,
    onNextQuestionClick: PropTypes.func,
    onPrevQuestionClick: PropTypes.func,
    nextCall: PropTypes.func,
};

Question.defaultProps = {
    question: {},
};

export default (Question);
