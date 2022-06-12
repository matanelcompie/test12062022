import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import _ from 'lodash';

import * as callActions from 'actions/callActions';
import * as callAnswerActions from 'actions/callAnswerActions';

import Question from '../display/Question';

class Questionnaire extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.initialState = {
            viewedQuestions: [],
            activeQuestion: {},
            voters_answers: {}
        };
        this.state = Object.assign({}, this.initialState);

        this.onNextQuestionClick = this.onNextQuestionClick.bind(this);
        this.onAnswerChange = this.onAnswerChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let tempState = Object.assign({}, this.state);

        if (this.props.activeCall.id !== nextProps.activeCall.id) {
            // reset the state object
            Object.assign(tempState, this.initialState);
        }

        if (!tempState.activeQuestion.id && nextProps.questionnaire.questions) {
            // if the state is reset, get the first question available and set as active
            tempState.activeQuestion = Object.assign({}, nextProps.questionnaire.questions[0]);
            this.setState(tempState);
        }
    }

    onAnswerChange(answer){
        let voters_answers = Object.assign({}, this.state.voters_answers);
        voters_answers[this.state.activeQuestion.id] = answer;
        this.setState({voters_answers});
        this.props.callAnswerActions.storeCallAnswer(voters_answers);
    }

    onNextQuestionClick() {
        let currentQuestion = Object.assign({}, this.state.activeQuestion);
        let currentQuestionAnswerValue = this.state.voters_answers[this.state.activeQuestion.id];

        let nextQuestionId, possibleAnswer;
        if(_.isArray(currentQuestionAnswerValue)) {
            // if it's an array, we need to iterate through all entries
            _.forEach(currentQuestionAnswerValue, answerData => {
                possibleAnswer = _.find(currentQuestion.possible_answers, {id: answerData.possible_answer_id});
                if (possibleAnswer && possibleAnswer.jump_to_question_id && !nextQuestionId) {
                    // assuming we have an answer and it has a jump_to,
                    // we only need the first one so just make sure it's not yet defined
                    nextQuestionId = possibleAnswer.jump_to_question_id;
                }
            });
        } else if (_.isPlainObject(currentQuestionAnswerValue)) {
            // using else if instead of else so we skip the value not existing
            // if it's not an array, we just need to grab the jump_to_question_id that might be tied to this answer
            possibleAnswer = _.find(currentQuestion.possible_answers, {id: currentQuestionAnswerValue.possible_answer_id});
            if (possibleAnswer && possibleAnswer.jump_to_question_id) {
                nextQuestionId = possibleAnswer.jump_to_question_id;
            }
        }

        if (!nextQuestionId) {
            // if we get here, there's no jump_to_question_id tied to any of our answers
            nextQuestionId = currentQuestion.next_question_id;
        }

        let viewedQuestions = [...this.state.viewedQuestions, currentQuestion];

        let nextQuestion = Object.assign({}, _.find(this.props.questionnaire.questions, {id: nextQuestionId}));

        this.setState({
            viewedQuestions,
            activeQuestion: nextQuestion
        });
    }

    render() {
        console.log(this.props.currentVoter, this.props.currentUser);
        return (
            <div className="questionnaire">
                <div>questionnaire id: {this.props.questionnaire.id}</div>
                <div>currentVoter id: {this.props.currentVoter.id}</div>
                <div>activeCall id: {this.props.activeCall.id}</div>
                {this.state.activeQuestion.id ?
                    <Question
                        key={this.state.activeQuestion.id}
                        question={this.state.activeQuestion}
                        voter={this.props.currentVoter}
                        currentUser={this.props.currentUser}
                        answerValue={this.state.voters_answers[this.state.activeQuestion.id]}
                        onAnswerChange={this.onAnswerChange}
                        onNextQuestionClick={this.onNextQuestionClick}
                    />
                    : <div>The questionnaire is over, thank you and have a good day!</div>
                }
            </div>
        );
    }
}

Questionnaire.propTypes = {
    questionnaire: PropTypes.object,
    currentVoter: PropTypes.object,
    activeCall: PropTypes.object,
    onFinish: PropTypes.func
};

function mapStateToProps(state, ownProps) {
    return {
        questionnaire: state.campaign.questionnaire,
        activeCall: state.call.activeCall,
        currentVoter: state.call.activeCall.voter,
        currentUser: state.system.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return {
        callActions: bindActionCreators(callActions, dispatch),
        callAnswerActions: bindActionCreators(callAnswerActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Questionnaire);
