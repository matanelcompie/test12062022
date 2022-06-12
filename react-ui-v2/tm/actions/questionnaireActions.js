import Axios from 'axios';
import * as SystemActions from 'actions/SystemActions';
import * as questionnaireFunctions from 'tm/libs/questionnaireFunctions';

export const types = {
  GET_CAMPAIGN_QUESTIONNAIRE_FULL_SUCCESS: 'GET_CAMPAIGN_QUESTIONNAIRE_FULL_SUCCESS',
  GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS: 'GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS',
  GET_QUESTION_SUCCESS: 'GET_QUESTION_SUCCESS',
  START_QUESTIONNAIRE_AJAX_CALL: 'START_QUESTIONNAIRE_AJAX_CALL',
  END_QUESTIONNAIRE_AJAX_CALL: 'END_QUESTIONNAIRE_AJAX_CALL',
  DELETE_QUESTION_SUCCESS: 'DELETE_QUESTION_SUCCESS',
  ADD_QUESTION_SUCCESS: 'ADD_QUESTION_SUCCESS',
  DELETE_QUESTIONAIRE_SUCCESS: 'DELETE_QUESTIONAIRE_SUCCESS',
  LOAD_EDITED_QUESTIONS: 'LOAD_EDITED_QUESTIONS',
  ON_EDITED_QUESTION_CHANGE: 'ON_EDITED_QUESTION_CHANGE',
  ON_EDIT_QUESTIONS: 'ON_EDIT_QUESTIONS',
  ON_OPEN_QUESTION_MODAL: 'ON_OPEN_QUESTION_MODAL',
  ON_CLOSE_QUESTION_MODAL: 'ON_CLOSE_QUESTION_MODAL',
  ON_QUESTION_LIST_REORDER: 'ON_QUESTION_LIST_REORDER',
  CHECK_IS_VALID_QUESTIONNAIRE: 'CHECK_IS_VALID_QUESTIONNAIRE',
  GET_INACTIVE_QUESTIONNAIRES: 'GET_INACTIVE_QUESTIONNAIRES',
  CLOSE_INACTIVE_QUESTIONNAIRES_MODAL: 'CLOSE_INACTIVE_QUESTIONNAIRES_MODAL',
  GET_OTHER_QUESTIONNAIRES: 'GET_OTHER_QUESTIONNAIRES',
  ON_CHOSE_CAMPAIGN_QUESTIONNAIRE_TO_ACTIVATE: 'ON_CHOSE_CAMPAIGN_QUESTIONNAIRE_TO_ACTIVATE',
  ON_CHOSE_OTHER_QUESTIONNAIRE_TO_ACTIVATE: 'ON_CHOSE_OTHER_QUESTIONNAIRE_TO_ACTIVATE',
  SET_CAMPAIGN_QST_FIELD: 'SET_CAMPAIGN_QST_FIELD',
}

function startAjaxCall(ajaxType) {
  return {
    ajaxType,
    type: types.START_QUESTIONNAIRE_AJAX_CALL
  }
}

function endAjaxCall(ajaxType) {
  return {
    ajaxType,
    type: types.END_QUESTIONNAIRE_AJAX_CALL
  }
}

export function loadEditedQuestions(questions) {
  return {
    type: types.LOAD_EDITED_QUESTIONS,
    questions
  }
}

export function onEditedQuestionChange(question) {
  return {
    type: types.ON_EDITED_QUESTION_CHANGE,
    question
  }
}

export function onEditQuestions() {
  return function (dispatch, getState) {
    dispatch({
      type: types.ON_EDIT_QUESTIONS,
      questions: getState().tm.questionnaire.questionnaire.questions
    });
  }
}

export function onOpenQuestionModal(questionKey, isNew) {
  return {
    type: types.ON_OPEN_QUESTION_MODAL,
    questionKey,
    isNew
  }
}
export function onCloseQuestionModal() {
  return {
    type: types.ON_CLOSE_QUESTION_MODAL
  }
}

function getCampaignQuestionnaireFullSuccess(data) {
  return {
    type: types.GET_CAMPAIGN_QUESTIONNAIRE_FULL_SUCCESS,
    data
  }
}

export function getCampaignQuestionnaireFull(campaignKey) {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/questionnaire',
      method: "get"
    }).then(result => {
      dispatch(getCampaignQuestionnaireFullSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch({ type: types.SET_CAMPAIGN_QST_FIELD, fieldName: 'loadedQsts', fieldValue: true });
    }), (error => {
      console.log('getCampaignQuestionnaireFull failed', error);
    })
  }
}


function getCampaignQuestionnaireSuccess(data) {
  return {
    type: types.GET_CAMPAIGN_QUESTIONNAIRE_SUCCESS,
    data
  }
}

export function updateQuestionnaire(data) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveDetailsPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questionnaires/' + data.key,
      method: "put",
      data
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(getCampaignQuestionnaireSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveDetailsPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('updateQuestionnaire failed', error)
    })
  }
}

export function updateQuestionList(questionnaireKey) {
  return function (dispatch, getState) {
    let questions = _.cloneDeep(getState().tm.questionnaire.editedQuestions);
    questions.forEach((qObj, index) => {
      qObj.admin_order = (index + 1);
    });

    let questionnaire = {
      key: questionnaireKey,
      questions,
    };
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveQuestionListPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questionnaires/' + questionnaireKey,
      method: "put",
      data: questionnaire
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(getCampaignQuestionnaireFullSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveQuestionListPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('updateQuestionList failed', error);
    })
  }
}


function getQuestionSuccess(data) {
  return {
    type: types.GET_QUESTION_SUCCESS,
    data
  }
}

export function updateQuestion(data) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveQuestionPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questions/' + data.key,
      method: "put",
      data
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(getQuestionSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveQuestionPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('updateQuestion failed', error);
    })
  }
}

export function addQuestion(questionnaireKey, data) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveQuestionPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questionnaires/' + questionnaireKey + '/add_question',
      method: "post",
      data
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(addQuestionSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveQuestionPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('addQuestion failed', error);
    })
  }
}

function addQuestionSuccess(data) {
  return {
    type: types.ADD_QUESTION_SUCCESS,
    data
  }
}

export function deleteQuestion(questionnairesKey, questionKey) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveQuestionPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questions/' + questionKey,
      method: "delete"
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(deleteQuestionSuccess(questionKey));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveQuestionPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('deleteQuestion failed', error);
    })
  }
}

function deleteQuestionSuccess(questionKey) {
  return {
    type: types.DELETE_QUESTION_SUCCESS,
    questionKey
  }
}
/**
 * @function deleteQuestionnaire
 * Delete or archive the questionnaire
 * Turn the acive of the questionnaire to "fasle".
 * -> if the "delete" is true -> the questionnaire will also deleted!
 * @param {string} questionnairesKey -  questionnaire Key
 */
export function deleteQuestionnaire(questionnairesKey) {
  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveQuestionPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questionnaires/' + questionnairesKey,
      method: "delete"
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch({ type: types.DELETE_QUESTIONAIRE_SUCCESS });
      dispatch(endAjaxCall('saveQuestionPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      console.log('deleteQuestionnaire failed', error);
    })
  }
}
export function archiveOldQuestionnaire(questionnairesKey) {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/questionnaires/' + questionnairesKey,
      method: "delete"
    }).then(result => {
    }), (error => {
      console.log('archiveOld failed', error);
    });
  }
}
export function addQuestionnaire(data, campaignKey) {

  return function (dispatch) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    dispatch(startAjaxCall('saveDetailsPending'));
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/addQuestionnaire',
      method: "post",
      data
    }).then(result => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
      dispatch(getCampaignQuestionnaireSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
      dispatch(endAjaxCall('saveDetailsPending'));
    }), (error => {
      dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
      dispatch(endAjaxCall('saveDetailsPending'));
      console.log('updateQuestionnaire failed', error);
    })
  }
}

export function onQuestionListReorder(reorderedQuestions) {
  return function (dispatch, getState) {
    if (getState().tm.questionnaire.isEditQuestionsMode) {
      dispatch({
        type: types.ON_QUESTION_LIST_REORDER,
        data: reorderedQuestions
      });
    }
  }
}


export function getInactiveQuestionnaires(campaignKey) {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/inactive_questionnaires',
      method: "get"
    }).then(result => {
      dispatch(getCampaignQuestionnaireInactiveSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
    }), (error => {
      console.log('getCampaignQuestionnaireFull failed', error);
    })
  }
}

function getCampaignQuestionnaireInactiveSuccess(data) {
  return {
    type: types.GET_INACTIVE_QUESTIONNAIRES,
    data
  }
}

export function getOtherQuestionnaires(campaignKey) {
  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/other_questionnaires',
      method: "get"
    }).then(result => {
      dispatch(getOtherQuestionnaireSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
    }), (error => {
      console.log('getOtherQuestionnaireFull failed', error);
    })
  }
}

function getOtherQuestionnaireSuccess(data) {
  return {
    type: types.GET_OTHER_QUESTIONNAIRES,
    data,
  }
}

export function onCloseInactiveQuestionnairesModal() {
  return {
    type: types.CLOSE_INACTIVE_QUESTIONNAIRES_MODAL
  }
}

export function onChososeCampaignQuestionnaire(questionnaireKey) {
  return {
    type: types.ON_CHOSE_CAMPAIGN_QUESTIONNAIRE_TO_ACTIVATE,
    questionnaireKey,
  }
}

export function onChososeOtherQuestionnaire(questionnaireKey) {
  return {
    type: types.ON_CHOSE_OTHER_QUESTIONNAIRE_TO_ACTIVATE,
    questionnaireKey,
  }
}

export function copyOtherQuestionnaireToCampaign(questionnaireKey, campaignKey) {

  return function (dispatch) {
    Axios({
      url: window.Laravel.baseURL + 'api/tm/campaigns/' + campaignKey + '/copy_questionnaire/' + questionnaireKey,
      method: "post"
    }).then(result => {
      dispatch(getCampaignQuestionnaireSuccess(result.data.data));
      dispatch(isQuestionnaireValid());
    }), (error => {
      console.log('copyOtherQuestionnaireToCampaign failed', error);
    })
  }
}
function isQuestionnaireValid() {
  return function (dispatch, getState) {
    let questionnaire = getState().tm.questionnaire.questionnaire;
    let questionTypeConstOptions = getState().tm.system.lists.questionTypeConst;
    let validData = questionnaireFunctions.isQuestionnaireValid(questionnaire, questionTypeConstOptions);
    // console.log(validData);
    dispatch({ type: 'CHECK_IS_VALID_QUESTIONNAIRE', data: validData });
  }
}
