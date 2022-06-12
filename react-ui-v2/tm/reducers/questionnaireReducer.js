import { types } from 'tm/actions/questionnaireActions';

const initialState = {
    questionnaire: null,
	loadedQsts : false,
    editedQuestions: [],
    isEditQuestionsMode: false,
    isQuestionModalOpen: false,
    saveDetailsPending: 0,
    saveQuestionPending: 0,
    saveQuestionListPending: 0,
    isValidQuestionnaire: false,
    invalidQuestion: -1,
    inactiveQuestionnaires: [],
    otherQuestionnaires: [],
    isOpenInactiveQuestionnaires: false,
    questionnaireToActivate: '',
    copyQuestionnaire: '',
    updateQuestionsOrder: false
}

let textValues = {
    dupTitle: 'הוספה'
};

export default function (state = initialState, action) {
    switch (action.type) {
        case types.GET_CAMPAIGN_QUESTIONNAIRE_FULL_SUCCESS: {
            return Object.assign({}, state, {
                isEditQuestionsMode: false,
                isOpenInactiveQuestionnaires: false,
                updateQuestionsOrder: false,
                questionnaire: action.data
            });
        }

        case types.GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS: {
            let questionnaire = Object.assign({}, state.questionnaire, action.data);
            let newState = { questionnaire: questionnaire, isEditQuestionsMode: false, isOpenInactiveQuestionnaires: false };
            return Object.assign({}, state, newState);
        }

        case types.GET_QUESTION_SUCCESS: {
            let questions = state.questionnaire.questions.map(q => {
                return q.key == action.data.key ? action.data : q;
            });
            let questionnaire = Object.assign({}, state.questionnaire, { questions });
            return Object.assign({}, state, { questionnaire });
        }
		
		case types.SET_CAMPAIGN_QST_FIELD:
            var newState = { ...state };
            newState[action.fieldName] = [action.fieldValue];
            return newState;

        case types.ADD_QUESTION_SUCCESS: {
            let questionnaire = Object.assign({}, state.questionnaire, action.data);
            return Object.assign({}, state, { questionnaire });
        }

        case types.START_QUESTIONNAIRE_AJAX_CALL: {
            var ajaxType = {};
            ajaxType[action.ajaxType] = state[action.ajaxType] + 1;
            return Object.assign({}, state, ajaxType);
        }

        case types.END_QUESTIONNAIRE_AJAX_CALL: {
            var ajaxType = {};
            ajaxType[action.ajaxType] = state[action.ajaxType] - 1;
            return Object.assign({}, state, ajaxType);
        }

        case types.DELETE_QUESTION_SUCCESS: {
            let questions = state.questionnaire.questions.filter(q => {
                return q.key != action.questionKey
            });
            let questionnaire = Object.assign({}, state.questionnaire, { questions });
            return Object.assign({}, state, { questionnaire, updateQuestionsOrder: true, editedQuestions: questions });
        }

        case types.DELETE_QUESTIONAIRE_SUCCESS: {
            return initialState;
        }

        case types.LOAD_EDITED_QUESTIONS: {
            return Object.assign({}, state, { editedQuestions: action.questions });
        }

        case types.ON_EDITED_QUESTION_CHANGE: {
            let editedQuestions = [];
            if (state.editedQuestions.length == 1) {
                editedQuestions = [action.question];
            }
            else {
                editedQuestions = [...state.editedQuestions].map(q => {
                    return q.key == action.question.key ? action.question : q;
                });
            }
            return { ...state, editedQuestions };
        }

        case types.ON_EDIT_QUESTIONS: {
            let newState = {};
            if (state.isEditQuestionsMode)
                newState = { isEditQuestionsMode: false };
            else
                newState = { isEditQuestionsMode: true, editedQuestions: action.questions };
            return { ...state, ...newState };
        }

        case types.ON_OPEN_QUESTION_MODAL: {
            let editedQuestions = [];
            let newState = {};
            if (action.isNew && !action.questionKey) {
                editedQuestions.push({ key: "" });
                newState = { isQuestionModalOpen: true, editedQuestions };
            }
            else if (action.questionKey) {
                editedQuestions = state.questionnaire.questions.filter(q => {
                    return q.key == action.questionKey
                });
                if (action.isNew) {
                    let question = _.cloneDeep(editedQuestions[0]);
                    question.key = "";
                    question.id = "";
                    question.name = question.name + ' - ' + textValues.dupTitle;
                    question.possible_answers.map(pa => {
                        pa.key = "";
                        pa.id = pa.id * (-1);
                        return pa;
                    });
                    editedQuestions = [question];
                }
                newState = { isQuestionModalOpen: true, editedQuestions };
            }
            return Object.assign({}, state, newState);
        }
        case types.ON_CLOSE_QUESTION_MODAL: {
            return Object.assign({}, state, { isQuestionModalOpen: false });
        }

        case types.ON_QUESTION_LIST_REORDER:
            return Object.assign({}, state, { editedQuestions: action.data });

        case types.CHECK_IS_VALID_QUESTIONNAIRE:
            let invalidQuestion = action.data.invalidQuestion;
            return Object.assign({}, state, { isValidQuestionnaire: action.data.valid, invalidQuestion });
        case types.GET_INACTIVE_QUESTIONNAIRES: {
            let newState = { ...state };
            let inactiveQuestionnaires = action.data;
            newState.inactiveQuestionnaires = inactiveQuestionnaires;
            newState.isOpenInactiveQuestionnaires = true;
            return newState;
        }

        case types.CLOSE_INACTIVE_QUESTIONNAIRES_MODAL: {
            return Object.assign({}, state, { isOpenInactiveQuestionnaires: false, copyQuestionnaire: '', questionnaireToActivate: '' });
        }

        case types.GET_OTHER_QUESTIONNAIRES: {
            let newState = { ...state };
            let otherQuestionnaires = action.data;
            newState.otherQuestionnaires = otherQuestionnaires;
            newState.isOpenInactiveQuestionnaires = true;
            return newState;
        }

        case types.ON_CHOSE_CAMPAIGN_QUESTIONNAIRE_TO_ACTIVATE: {
            return Object.assign({}, state, { copyQuestionnaire: '', questionnaireToActivate: action.questionnaireKey })
        }

        case types.ON_CHOSE_OTHER_QUESTIONNAIRE_TO_ACTIVATE: {
            return Object.assign({}, state, { copyQuestionnaire: action.questionnaireKey, questionnaireToActivate: '' })
        }

        default:
            return state;
    }
}