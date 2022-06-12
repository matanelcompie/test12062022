import React from 'react';
import PropTypes from 'prop-types';

import ComboSelect from 'tm/components/common/ComboSelect';
import NextQuestions from './NextQuestions';
import QuestionListRowButtons from './QuestionListRowButtons';


const QuestionListRowData = ({ question, questions, onExpandQuestionDataClick, questionTypeConst, onQuestionChange,
    onQuestionActiveClick, onDeleteQuestionClick, onQuestionEditClick, expandedKey, isEditQuestions, invalidQuestion }) => {

    let nextQuestion = {};
    let questionsArr = questions.filter(q => {
        return (q.key != question.key && q.active == 1);
    }).map(q => {
        if (question.next_question_id === q.id) { nextQuestion = q }
        return { value: Number(q.id), label: `${q.admin_order}# ${q.name}`, order: q.admin_order };
    });
    questionsArr.push({ value: -1, label: 'שיחה הבאה' });

    let expandable = ['radio', 'select', 'multiple', 'rate'].includes(questionTypeConst);
    let expandColumn = (
        expandable ?
            <div className="question-list__cell question-list__cell_col_expand" onClick={() => onExpandQuestionDataClick(question.key)}>
                <i className={`fa fa-${expandedKey ? 'minus' : 'plus'}-circle`} aria-hidden="true" />
            </div>
            :
            <div className="question-list__cell question-list__cell_col_expand question-list__cell_spacer" />
    );

    let nextQuestionLabel = '';
    if (question.next_question_id && !_.isEmpty(nextQuestion) && nextQuestion.name) {
        nextQuestionLabel = `${nextQuestion.admin_order}# ${nextQuestion.name}`;
    } else if (question.next_question_id == -1) {
        nextQuestionLabel = `שיחה הבאה`;
    }
    let isInvaildClass = invalidQuestion === question.id ? ' nav-item_invalid' : '';
    return (
        <div className="question-list-row-data">
            {expandColumn}
            <div className={`question-list__cell question-list__cell_col_order` + isInvaildClass}>{question.admin_order}</div>
            <div className="question-list__cell question-list__cell_col_question">{question.name}</div>
            <div className="question-list__cell question-list__cell_col_next">
                {isEditQuestions ?
                    <ComboSelect
                        value={question.next_question_id}
                        defaultValue={question.next_question_id}
                        name="next_question_id"
                        options={questionsArr}
                        onChange={onQuestionChange}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        multiSelect={false}
                    />
                    :
                    <span className="question-list-row-data__next-name">{nextQuestionLabel}</span>
                }
            </div>
            <div className="question-list__cell question-list__cell_col_next-possibilities">
                <NextQuestions questions={questions} question={question} />
            </div>
            <QuestionListRowButtons
                question={question}
                onQuestionEditClick={onQuestionEditClick}
                onDeleteQuestionClick={onDeleteQuestionClick}
                onQuestionActiveClick={onQuestionActiveClick}
                isEditQuestions={isEditQuestions}
            />
        </div>
    );
}

QuestionListRowData.propTypes = {
    question: PropTypes.object,
    questions: PropTypes.array,
    onExpandQuestionDataClick: PropTypes.func,
    questionTypeConst: PropTypes.string,
    onQuestionChange: PropTypes.func,
    onQuestionActiveClick: PropTypes.func,
    onDeleteQuestionClick: PropTypes.func,
    onQuestionEditClick: PropTypes.func,
    expandedKey: PropTypes.bool,
    isEditQuestions: PropTypes.bool
}

export default QuestionListRowData;              