import {connect} from 'react-redux';
import R from 'ramda';

import * as callAnswerActions from 'actions/callAnswerActions';
import * as uiActions from 'actions/uiActions';

import Question from '../display/Question';

function mapStateToProps(state, ownProps) {
    let questions = state.campaign.questionnaire.questions || [];
    let activeQuestion = questions.find(q => {return q.id == state.ui.questionnaire.activeQuestionId});
    return {
        question: activeQuestion,
        questionIndex: state.ui.questionnaire.viewedQuestions.indexOf(state.ui.questionnaire.activeQuestionId) + 1,
        questionTypeConst: state.system.lists.questionTypeConst,
        answerValue: state.callAnswer.voterAnswers[state.ui.questionnaire.activeQuestionId],
        voter: state.call.activeCall.voter,
        currentUser: state.system.currentUser,
        voterAnswers: state.callAnswer.voterAnswers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onVoterAnswerChange: (questionId, answer) => dispatch(callAnswerActions.onVoterAnswerChange(questionId, answer)),
        onNextQuestionClick: () => dispatch(uiActions.onNextQuestionClick()),
        onPrevQuestionClick: () => dispatch(uiActions.onPrevQuestionClick()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Question);
