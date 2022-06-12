import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';

import TextInput from 'components/common/TextInput';
import DateInput from 'components/common/DateInput';
import TextArea from 'components/common/TextArea';
import RadioSet from 'components/common/RadioSet';
import CheckboxSet from 'components/common/CheckboxSet';


const AnswerSection = ({ question, questionTypeConst, answerValue, onVoterAnswerChange }) => {

    function handleTextChange(event) {
        let answer;
        if (event.target.value) {
            answer = {
                questionKey: question.key,
                answerText: event.target.value
            };
        }
        onVoterAnswerChange(question.id, answer);
    };

    function handleRadioChange(event) {
        let answer = {
            questionKey: question.key,
            possibleAnswerKey: event.target.value,
            answerText: (question.possible_answers.filter(ps => ps.key == event.target.value)[0] || {}).text_general,
        };
        onVoterAnswerChange(question.id, answer);
    };

    function handleMultipleChange(name, values) {
        let options = event.target.options;
        let answers = [];

        values.forEach(value => {
            answers.push({
                questionKey: name,
                possibleAnswerKey: value,
                answerText: (question.possible_answers.filter(ps => ps.key == value)[0] || {}).text_general,
            })
        });
        onVoterAnswerChange(question.id, answers);
    };

    function handleDateChange(name, value) {
        let answer;
        if (value) {
            answer = {
                questionKey: question.key,
                answerText: value
            };
        }
        onVoterAnswerChange(question.id, answer);
    };

    function renderText(isTextInput) {
        let Component = isTextInput ? TextInput : TextArea;
        return (
            <Component
                name={question.key}
                value={answerValue.answerText}
                onChange={handleTextChange}
            />
        );
    }

    function renderRadio() {
        let options = question.possible_answers.map(ps => {
            return { value: ps.key, label: ps.text_general };
        });
        return (
            <RadioSet
                name={question.key}
                options={options}
                value={answerValue.possibleAnswerKey}
                onChange={handleRadioChange}
                className="answer-section__radio"
            />
        );
    }

    function renderMultiple() {
        let options = question.possible_answers.map(ps => {
            return { value: ps.key, label: ps.text_general };
        });
        let values = R.isEmpty(answerValue) ? [] : answerValue.map(av => { return av.possibleAnswerKey });

        return (
            <CheckboxSet
                name={question.key}
                options={options}
                values={values}
                onChange={handleMultipleChange}
                className="stylish-checkbox"
                outerClassName="answer-section__checkbox-set"
            />
        );
    }

    function renderDate(type) {
        let timeFormat = "HH:mm";;
        let dateFormat;
        let isCalendar;
        let isTime;
        switch (type) {
            case 'datetime':
                dateFormat = "DD/MM/YYYY HH:mm";
                isCalendar = true;
                isTime = true;
                break;
            case 'time':
                dateFormat = "HH:mm"
                isCalendar = false;
                isTime = true;
                break;
            case 'date':
            default:
                dateFormat = "DD/MM/YYYY";
                isCalendar = true;
                isTime = false;
        }
        return (
            <DateInput
                name={question.key}
                value={answerValue.answerText}
                onChange={handleDateChange}
                format={dateFormat}
                timeFormat={timeFormat}
                calendar={isCalendar}
                time={isTime}
            />
        );
    }

    function renderAnswerSection() {
        switch (questionTypeConst[question.type]) {
            case 'one_line':
            case 'multiple_lines':
                return renderText(questionTypeConst[question.type] == 'one_line');
            case 'radio':
                return renderRadio();
            case 'multiple':
                return renderMultiple();
            case 'date':
            case 'time':
            case 'datetime':
                return renderDate(questionTypeConst[question.type]);
            case 'message':
            default:
                return null;
        }
    }

    return (
        <div className="answer-section">
            {renderAnswerSection()}
        </div>
    );
};

AnswerSection.propTypes = {
    question: PropTypes.object,
    questionTypeConst: PropTypes.object,
    answerValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onVoterAnswerChange: PropTypes.func,
};

AnswerSection.defaultProps = {
    answerValue: {},
};

export default (AnswerSection);
