import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import DraggableListItem from 'tm/components/common/DraggableListItem';

import * as questionnaireActions from 'tm/actions/questionnaireActions';

import PossibleAnswer from '../display/PossibleAnswer';
import PossibleAnswerHeader from '../display/PossibleAnswerHeader';


class PossibleAnswerList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            idCounter: 2,
        };

        this.onPossibleAnswerChange = this.onPossibleAnswerChange.bind(this);
        this.onDeletePossibleAnswer = this.onDeletePossibleAnswer.bind(this);
        this.onAddPossibleAnswerClick = this.onAddPossibleAnswerClick.bind(this);
        this.onPaListReorder = this.onPaListReorder.bind(this);
    }


    componentWillMount() {
        this.loadEmptyPossibleAnswer(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.isEditMode == false && nextProps.isEditMode == true)
            this.loadEmptyPossibleAnswer(nextProps);
    }

    loadEmptyPossibleAnswer(props) {
        if (props.isEditMode && (props.question.possible_answers == undefined || props.question.possible_answers.length == 0)) {
            let possible_answers = [{id:-1, order: 1, active: 1}];
            let question = {...props.question, possible_answers};
            this.props.questionnaireActions.onEditedQuestionChange(question);
        }
    }

    onPossibleAnswerChange(name, value, id) {
        if(this.props.isEditMode) {
            let question = _.cloneDeep(this.props.question);
            let possibleAnswer = question.possible_answers.map(answer => {
                if (answer.id == id) {
                    answer[name] = value;
                }
                return answer;
            });
            this.props.questionnaireActions.onEditedQuestionChange(question);
        }
    }

    onDeletePossibleAnswer(id) {
        if(this.props.isEditMode) {
            let question = _.cloneDeep(this.props.question);
            let possibleAnswer = question.possible_answers.filter(answer => {
                return answer.id != id
            });

            if (possibleAnswer.length == 0) {
                possibleAnswer = [{id: (-1)*this.state.idCounter, order:1, active:1}];
                this.setState({idCounter: ++this.state.idCounter});
            } 
            question.possible_answers = possibleAnswer;
            this.props.questionnaireActions.onEditedQuestionChange(question);
        }
    }

    onAddPossibleAnswerClick(id = "", isDup = false) {
        if(this.props.isEditMode) {
            let question = _.cloneDeep(this.props.question);
            if (id) {
                let pa = [];
                let orderFlag = 0;
                question.possible_answers.forEach(answer => {
                    if (!orderFlag)
                        pa.push(answer);
                    else {
                        answer.order = ++answer.order;
                        pa.push(answer);
                    }
                    if (id == answer.id) {
                        if (isDup) {
                            let newAnswer = _.cloneDeep(answer);
                            newAnswer.id = (-1) * this.state.idCounter;
                            newAnswer.key = "";
                            newAnswer.order = ++newAnswer.order;
                            pa.push(newAnswer);
                        }
                        else
                            pa.push({id: (-1) * this.state.idCounter, active: 1, order: (answer.order) + 1});
                        orderFlag = 1;
                    }
                });
                question.possible_answers = pa;
            }
            else {
                let order = question.possible_answers ? (question.possible_answers).length : 0;
                question.possible_answers.push({id: (-1) * this.state.idCounter, active: 1, order: ++order});
            }
            this.setState({idCounter: ++this.state.idCounter});
            this.props.questionnaireActions.onEditedQuestionChange(question);
        }
    }

    onPaListReorder(dragIndex, hoverIndex) {
        let question = _.cloneDeep(this.props.question);
        const dragPa = question.possible_answers[dragIndex];

        question.possible_answers.splice(dragIndex, 1);
        question.possible_answers.splice(hoverIndex, 0, dragPa);

        _.forEach(question.possible_answers, function(paObj, index) {
            paObj.order = (index + 1);
        });

        this.props.questionnaireActions.onEditedQuestionChange(question);
    }

    render() {
        let questionTypeConst = this.props.questionTypeConstOptions[this.props.question.type];
        let isHaveNextQuestion = ['radio'].includes(questionTypeConst);

        if(!this.props.question.possible_answers || !['radio', 'multiple'].includes(questionTypeConst))
            return null;
    
        return (  
            <div className='possible-answer-list'>
                <PossibleAnswerHeader isHaveNextQuestion={isHaveNextQuestion}/>
                {this.props.question.possible_answers.map((possibleAnswer, index) =>
                    <DraggableListItem
                        key={possibleAnswer.id}
                        index={index}
                        isDraggable={this.props.isEditMode}
                        onReorder={this.onPaListReorder}
                        group={'pa_' + this.props.question.key}
                    >
                        <PossibleAnswer
                            questions={this.props.questions}
                            question={this.props.question}
                            possibleAnswer={possibleAnswer}
                            onPossibleAnswerChange={this.onPossibleAnswerChange}
                            onDeletePossibleAnswer={this.onDeletePossibleAnswer}
                            onAddPossibleAnswerClick={this.onAddPossibleAnswerClick}
                            isHaveNextQuestion={isHaveNextQuestion}
                            supportStatusConstOptions={this.props.supportStatusConstOptions}
                            isEditMode={this.props.isEditMode}
                        />
                    </DraggableListItem>
                )}
            </div>
        );
    }
}

PossibleAnswerList.propTypes = {
    question: PropTypes.object,
    questions: PropTypes.array,
    questionTypeConstOptions: PropTypes.object,
    supportStatusConstOptions: PropTypes.array,
    isEditMode: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    return {
        questions: state.tm.questionnaire.questionnaire.questions || [],
        questionTypeConstOptions: state.tm.system.lists.questionTypeConst || {},
        supportStatusConstOptions: state.tm.system.lists.support_statuses || [],
        isEditMode: state.tm.questionnaire.isQuestionModalOpen || state.tm.questionnaire.isEditQuestionsMode
    };
}

function mapDispatchToProps(dispatch) {
    return {
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PossibleAnswerList);
