import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import * as questionnaireActions from 'tm/actions/questionnaireActions';

import QuestionModal from './QuestionModal';
import QuestionListButtons from '../display/QuestionListButtons';
import QuestionList from '../display/QuestionList';
import NoData from 'tm/components/common/NoData';

class QuestionsManagment extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.onNewQuestionClick = this.onNewQuestionClick.bind(this);
        this.onEditQuestionsClick = this.onEditQuestionsClick.bind(this);
        this.onCloseQuestionModal = this.onCloseQuestionModal.bind(this);
        this.onSaveQuestionsClick = this.onSaveQuestionsClick.bind(this);
        this.onQuestionListReorder = this.onQuestionListReorder.bind(this);
    }

    onNewQuestionClick() {
        this.props.questionnaireActions.onOpenQuestionModal(null, true);
    }

    onEditQuestionsClick() {
        this.props.questionnaireActions.onEditQuestions();
    }

    onCloseQuestionModal() {
        this.props.questionnaireActions.onCloseQuestionModal();
    }

    onSaveQuestionsClick() {
        this.props.questionnaireActions.updateQuestionList(this.props.questionnaireKey)
    }

    onQuestionListReorder(dragIndex, hoverIndex) {
        let questions = _.cloneDeep(this.props.questions);
        const dragQuestion = questions[dragIndex];

        questions.splice(dragIndex, 1);
        questions.splice(hoverIndex, 0, dragQuestion);

        this.props.questionnaireActions.onQuestionListReorder(questions);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.updateQuestionsOrder && !this.props.updateQuestionsOrder) {
            this.onSaveQuestionsClick();
        }
    }
    render() {
        let textValue = {
            noDataText: 'לא קיימות שאלות',
            rightButtonText: 'צור שאלות לשאלון'
        }
        let noDataProps = this.props.noDataProps;
        noDataProps.noDataText = textValue.noDataText;
        noDataProps.rightButtonText = textValue.rightButtonText;
        noDataProps.onRightButtonClick = this.onNewQuestionClick;

        if (this.props.questions.length == 0) {
            return (
                <div>
                    <NoData {...this.props.noDataProps} />
                    {this.props.isQuestionModalOpen &&
                        <QuestionModal onCloseQuestionModal={this.onCloseQuestionModal} />
                    }
                </div>
            )
        }

        return (
            <div>
                <QuestionListButtons
                    onNewQuestionClick={this.onNewQuestionClick}
                    onEditQuestionsClick={this.onEditQuestionsClick}
                    onSaveQuestionsClick={this.onSaveQuestionsClick}
                    isEditQuestions={this.props.isEditQuestions}
                    isPending={this.props.isSaveQuestionListPending}
                />
                <QuestionList
                    questions={this.props.questions}
                    isEditQuestions={this.props.isEditQuestions}
                    onReorder={this.onQuestionListReorder}
                />
                {this.props.isQuestionModalOpen &&
                    <QuestionModal onCloseQuestionModal={this.onCloseQuestionModal} />
                }
            </div>
        );
    }
}

QuestionsManagment.propTypes = {
    isEditQuestions: PropTypes.bool,
    isQuestionModalOpen: PropTypes.bool,
    questions: PropTypes.array,
};

function mapStateToProps(state, ownProps) {
    let isEditQuestions = state.tm.questionnaire.isEditQuestionsMode;
    let questions=[];
    if (state.tm.questionnaire.questionnaire) {
        if (isEditQuestions) { questions = state.tm.questionnaire.editedQuestions }
        else { questions = state.tm.questionnaire.questionnaire.questions }
    }

    return {
        isEditQuestions,
        questions,
        isQuestionModalOpen: state.tm.questionnaire.isQuestionModalOpen,
        questionnaireKey: state.tm.questionnaire.questionnaire.key,
        isSaveQuestionListPending: !!state.tm.questionnaire.saveQuestionListPending,
        updateQuestionsOrder: state.tm.questionnaire.updateQuestionsOrder
    };
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(QuestionsManagment));