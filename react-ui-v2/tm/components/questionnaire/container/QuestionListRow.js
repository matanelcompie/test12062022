import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { serachForNextQuestions } from 'tm/libs/questionnaireFunctions';

import * as questionnaireActions from 'tm/actions/questionnaireActions';
import * as systemActions from 'tm/actions/systemActions';

import QuestionListRowData from '../display/QuestionListRowData';
import PossibleAnswerList from './PossibleAnswerList';

class QuestionListRow extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            expandedKey: false
        }

        this.onDeleteQuestionClick = this.onDeleteQuestionClick.bind(this);
        this.onQuestionActiveClick = this.onQuestionActiveClick.bind(this);
        this.onQuestionEditClick = this.onQuestionEditClick.bind(this);
        this.onExpandQuestionDataClick = this.onExpandQuestionDataClick.bind(this);
        this.onQuestionChange = this.onQuestionChange.bind(this);
        this.onCloseQuestionModal = this.onCloseQuestionModal.bind(this);
    }

    onExpandQuestionDataClick() {
        this.setState({ expandedKey: !this.state.expandedKey });
    }

    onQuestionEditClick(key, isNew) {
        if (!this.props.isEditQuestions)
            this.props.questionnaireActions.onOpenQuestionModal(key, isNew);
    }

    onCloseQuestionModal() {
        this.props.questionnaireActions.onCloseQuestionModal();
    }

    onDeleteQuestionClick() {
        if (!this.props.isEditQuestions && !this.props.question.answered) {
            let questionsArr = serachForNextQuestions(this.props.questions, this.props.question.id);
            if (questionsArr.length > 0)
                this.props.systemActions.showAlertMessage('אי אפשר לבצע פעולה זו, עדכן קודם את השאלות הבאות: ' + _.join(questionsArr));
            else
                this.props.systemActions.showConfirmMessage('questionnaireActions', 'deleteQuestion', [this.props.questionnaireKey, this.props.question.key]);
        }
    }

    onQuestionActiveClick() {
        if (!this.props.isEditQuestions) {
            let questionsArr = serachForNextQuestions(this.props.questions, this.props.question.id);
            if (questionsArr.length > 0)
                this.props.systemActions.showAlertMessage('אי אפשר לבצע פעולה זו, עדכן קודם את השאלות הבאות: ' + _.join(questionsArr));
            else {
                let question = Object.assign({}, this.props.question);
                question.active = !question.active;
                this.props.systemActions.showConfirmMessage('questionnaireActions', 'updateQuestion', [question]);
            }
        }
    }

    onQuestionChange(event) {
        let question = Object.assign({}, this.props.question);
        question[event.target.name] = event.target.value;
        this.props.questionnaireActions.onEditedQuestionChange(question);
    }

    render() {
        let question = this.props.question;
        let questionTypeConst = this.props.questionTypeConstOptions[question.type];

        let className = "question-list-row";
        if (question.answered) { className += ' question-list-row_answered' }
        if (!question.active) { className += ' question-list-row_inactive' }
        if (this.state.expandedKey) { className += ' question-list-row_expanded' }

        return (
            <div className={className}>
                <QuestionListRowData
                    question={this.props.question}
                    questions={this.props.questions}
                    onExpandQuestionDataClick={this.onExpandQuestionDataClick}
                    questionTypeConst={questionTypeConst}
                    onQuestionChange={this.onQuestionChange}
                    onQuestionActiveClick={this.onQuestionActiveClick}
                    onDeleteQuestionClick={this.onDeleteQuestionClick}
                    onQuestionEditClick={this.onQuestionEditClick}
                    expandedKey={this.state.expandedKey}
                    isEditQuestions={this.props.isEditQuestions}
                    invalidQuestion={this.props.invalidQuestion}
                />
                {this.state.expandedKey &&
                    <PossibleAnswerList
                        question={this.props.question}
                        questions={this.props.questions}
                        possibleAnswers={question.possible_answers}
                    />
                }
            </div>
        );
    }
}

QuestionListRow.propTypes = {
    question: PropTypes.object,
    questions: PropTypes.array,
    questionTypeConstOptions: PropTypes.object,
    isEditQuestions: PropTypes.bool,
    questionnaireKey: PropTypes.string,
    questionTypeConstOptions: PropTypes.object
};

function mapStateToProps(state) {
    let questions = [];
    let isEditQuestions = false;
    if (state.tm.questionnaire) {
        isEditQuestions = state.tm.questionnaire.isEditQuestionsMode;
        if (isEditQuestions) { questions = state.tm.questionnaire.editedQuestions }
        else { questions = state.tm.questionnaire.questionnaire.questions }
    }

    return {
        questions,
        isEditQuestions,
        questionnaireKey: state.tm.questionnaire.questionnaire.key,
        invalidQuestion: state.tm.questionnaire.invalidQuestion,
        questionTypeConstOptions: state.tm.system.lists.questionTypeConst || {},
    };
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionListRow);
