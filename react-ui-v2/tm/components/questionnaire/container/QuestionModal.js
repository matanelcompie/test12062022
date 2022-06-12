import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { serachForNextQuestions } from 'tm/libs/questionnaireFunctions';

import * as questionnaireActions from 'tm/actions/questionnaireActions';
import * as systemActions from 'tm/actions/systemActions';

import ModalWindow from 'tm/components/common/ModalWindow';
import ToggleCheckbox from 'tm/components/common/ToggleCheckbox';
import QuestionForm from '../display/QuestionForm';
import PossibleAnswerList from './PossibleAnswerList';
import QuestionModalButtons from '../display/QuestionModalButtons';


class QuestionModal extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            question: {},
            errorFields: [],
            isNeedValidation: false
        };

        this.textFieldOptions = [
            { label: 'שם פרטי', value: 'שם_פרטי' },
            { label: 'שם משפחה', value: 'שם_משפחה' },
            { label: 'עיר', value: 'עיר' },
            { label: 'נציג', value: 'נציג' },
            { label: 'ת"ז', value: 'ת"ז'}
        ];

        this.textField = [
        {label: 'ניסוח לשני המינים' , name: 'text_general'},
        {label: 'ניסוח לזכר' , name: 'text_male'},
        {label: 'ניסוח לנקבה' , name: 'text_female'}
    ];

        this.onQuestionChange = this.onQuestionChange.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onDeleteQuestionClick = this.onDeleteQuestionClick.bind(this);
        this.onRewindQuestionText = this.onRewindQuestionText.bind(this);
        this.onCopyQuestionTextClick = this.onCopyQuestionTextClick.bind(this);
        this.onCopyLabel = this.onCopyLabel.bind(this);
    }

    componentWillMount() {
        this.setState({ question: this.props.editedQuestion })
    }

    onQuestionChange(fieldName, value) {
        let question = Object.assign({}, this.props.editedQuestion);
        question[fieldName] = value;
        this.props.questionnaireActions.onEditedQuestionChange(question);
        if (this.state.isNeedValidation)
            this.questionValidation(question);
    }

    questionValidation(question) {
        this.setState({ isNeedValidation: true });
        let errorMassages = [];
        let requiredFields = ['type', 'name', 'text_general'];
        let errorFields = [];
        requiredFields.forEach(field => {
            if (!question[field])
                errorFields.push(field);
        });
        if (errorFields.length) {
            this.setState({ errorFields });
            errorMassages.push('');
        }
        return _.isEmpty(errorMassages);
    }

    onSaveClick() {
        let isValid = this.questionValidation(this.props.editedQuestion);
        let questionsArr = [];
        if (this.props.editedQuestion.active != this.state.question.active) {
            questionsArr = serachForNextQuestions(this.props.questions, this.props.editedQuestion.id);
            if (questionsArr.length > 0)
                this.props.systemActions.showAlertMessage('אי אפשר לבצע שמירה, עדכן קודם את השאלות הבאות: ' + _.join(questionsArr));
        }
        if (!isValid || questionsArr.length > 0) return false;

        let question = _.cloneDeep(this.props.editedQuestion);
        let questionTypeConst = this.props.questionTypeConstOptions[this.props.editedQuestion.type];
        if (!this.havePossibleAnswer(questionTypeConst)) {
            question.possible_answers = [];
        }
        else {
            // manage possible answers order field
            question.possible_answers = question.possible_answers.filter(answer => {
                return answer.text_general != undefined && answer.text_general != ''
            }).map((answer, i) => {
                answer.order = i + 1;
                return answer;
            });
        }
        if (!question.key) {
            question.admin_order = ((this.props.questions).length + 1);
            this.props.questionnaireActions.addQuestion(this.props.questionnaireKey, question);
        }
        else {
            this.props.questionnaireActions.updateQuestion(question);
        }
        this.props.onCloseQuestionModal();
    }

    onDeleteQuestionClick() {
        if (!this.props.editedQuestion.answered) {
            let questionsArr = serachForNextQuestions(this.props.questions, this.props.editedQuestion.id);
            if (questionsArr.length > 0)
                this.props.systemActions.showAlertMessage('אי אפשר לבצע פעולה זו, עדכן קודם את השאלות הבאות: ' + _.join(questionsArr));
            else {
                this.props.systemActions.showConfirmMessage('questionnaireActions', 'deleteQuestion', [this.props.questionnaireKey, this.props.editedQuestion.key]);
                this.props.onCloseQuestionModal();
            }
        }
    }

    onRewindQuestionText(fieldName) {
        let question = Object.assign({}, this.props.editedQuestion);
        question[fieldName] = this.state.question[fieldName];
        this.props.questionnaireActions.onEditedQuestionChange(question);
    }

    onCopyQuestionTextClick(fieldName = "") {
        let question = _.cloneDeep(this.props.editedQuestion);
        question['text_female'] = this.props.editedQuestion[fieldName];
        question['text_male'] = this.props.editedQuestion[fieldName];
        question['text_general'] = this.props.editedQuestion[fieldName];
        this.props.systemActions.showConfirmMessage('questionnaireActions', 'onEditedQuestionChange', [question]);
    }

    onCopyLabel(value) {
        this.props.systemActions.showAlertMessage('בוצעה העתקת השדה. אנא בצע פעולת הדבקה במקום המתאים.');
        let textArea = document.createElement("textarea");
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    havePossibleAnswer(questionTypeConst) {
        return ['radio', 'multiple'].includes(questionTypeConst);
    }
    haveNextQuestion(questionTypeConst) {
        return ['radio'].includes(questionTypeConst);
    }

    render() {
        let textValues = {
            title: 'עריכת שאלה'
        };
        let questionTypeConst = this.props.questionTypeConstOptions[this.props.editedQuestion.type];

        return (
            <div className="question-modal">
                <ModalWindow
                    show={true}
                    title={textValues.title + (this.props.isSaveQuestionPending ? "..." : "")}
                    buttonOk={this.onSaveClick}
                    buttonCancel={this.props.onCloseQuestionModal}
                    buttonX={this.props.onCloseQuestionModal}
                    children={<div>
                        <QuestionForm
                            question={this.props.editedQuestion}
                            questions={this.props.questions}
                            onQuestionChange={this.onQuestionChange}
                            questionTypeOptions={this.props.questionTypeOptions}
                            onRewindQuestionText={this.onRewindQuestionText}
                            onCopyQuestionTextClick={this.onCopyQuestionTextClick}
                            fieldOptions={this.textFieldOptions}
                            onCopyLabel={this.onCopyLabel}
                            errorFields={this.state.errorFields}
                            textField={this.textField}
                        />
                        {this.havePossibleAnswer(questionTypeConst) &&
                            <PossibleAnswerList
                                question={this.props.editedQuestion}
                                questions={this.props.questions}
                                haveNextQuestion={this.haveNextQuestion(questionTypeConst)}
                            />
                        }
                    </div>}
                    footer={
                        <QuestionModalButtons
                            onSaveClick={this.onSaveClick}
                            onCloseQuestionModal={this.props.onCloseQuestionModal}
                            onDeleteQuestionClick={this.onDeleteQuestionClick}
                            onQuestionChange={this.onQuestionChange}
                            editedQuestion={this.props.editedQuestion}
                            question={this.props.editedQuestion}
                            textField={this.textField}
                        />
                    }
                />
            </div>
        );
    }
}

QuestionModal.propTypes = {
    isNewQuestion: PropTypes.bool,
    questionKey: PropTypes.string,
    questionnaireKey: PropTypes.string,
    onCloseQuestionModal: PropTypes.func,
    question: PropTypes.object,
    questions: PropTypes.array,
    questionTypeOptions: PropTypes.object,
    questionTypeConstOptions: PropTypes.object
};

function mapStateToProps(state, ownProps) {
    let questionTypeOptions = state.tm.system.lists.questionType || {};
    let questionTypeConstOptions = state.tm.system.lists.questionTypeConst || {};
    let supportStatusConstOptions = state.tm.system.lists.support_statuses || [];

    return {
        editedQuestion: state.tm.questionnaire.editedQuestions[0] || {},
        questions: state.tm.questionnaire.questionnaire.questions || [],
        isSaveQuestionPending: !!state.tm.questionnaire.saveQuestionPending,
        questionTypeOptions,
        questionTypeConstOptions,
        questionnaireKey: state.tm.questionnaire.questionnaire.key,
        supportStatusConstOptions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionModal);