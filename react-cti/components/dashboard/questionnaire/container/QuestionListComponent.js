import {connect} from 'react-redux';
import R from 'ramda';

import * as uiActions from 'actions/uiActions';

import QuestionList from '../display/QuestionList';


function mapStateToProps(state, ownProps) {
    return {
        activeQeustionId: state.ui.questionnaire.activeQuestionId,
        viewedQuestions: state.ui.questionnaire.viewedQuestions,
        voterAnswers: state.callAnswer.voterAnswers,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        onQuestionClick: (questionId) => dispatch(uiActions.setActiveQuestion(questionId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionList);
