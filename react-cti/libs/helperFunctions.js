import R from 'ramda';


export function getNextQuestionId(state) {
    let nextQuestionId;
    if(state.ui.questionnaire.activeQuestionId) {
        let activeQuestion = state.campaign.questionnaire.questions.filter(q => {
            return state.ui.questionnaire.activeQuestionId == q.id;
        })[0];
        if(!R.isEmpty(activeQuestion)) {
            nextQuestionId = activeQuestion.next_question_id;
            if(state.system.lists.questionTypeConst[activeQuestion.type] == 'radio') {
                let questionAnswer = state.callAnswer.voterAnswers[activeQuestion.id];
                if(questionAnswer && questionAnswer.possibleAnswerKey) {
                    activeQuestion.possible_answers.forEach(ps => {
                        if(ps.key == questionAnswer.possibleAnswerKey && ps.jump_to_question_id) {
                            nextQuestionId = ps.jump_to_question_id;
                        }
                    })
                }
            }
        }
    }
    return nextQuestionId;
}

export function isNeedToDeleteQuestionRoute(state, nextQuestionId) {
    let activeQuestionIndex = state.ui.questionnaire.viewedQuestions.indexOf(state.ui.questionnaire.activeQuestionId);
    return state.ui.questionnaire.viewedQuestions[activeQuestionIndex + 1] && state.ui.questionnaire.viewedQuestions[activeQuestionIndex + 1] != nextQuestionId;
}

