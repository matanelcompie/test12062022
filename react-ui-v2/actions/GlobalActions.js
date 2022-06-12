import Axios from 'axios';
import _ from 'lodash';
import * as SystemActions from './SystemActions';
import * as ElectionsActions from './ElectionsActions';
import errors from '../libs/errors'
/**
 * Global component action types.
 */
export const ActionTypes = {
	SET_SMALL_AUDIO_PLAYING:'SET_SMALL_AUDIO_PLAYING',
    MESSAGES: {
        LOADING_MESSAGES_BY_ENTITY_TYPE: 'MESSAGES.LOADING_MESSAGES_BY_ENTITY_TYPE',
        LOADED_MESSAGES_BY_ENTITY_TYPE: 'MESSAGES.LOADED_MESSAGES_BY_ENTITY_TYPE',
        OPEN_GLOBAL_DIALOG: 'MESSAGES.OPEN_GLOBAL_DIALOG',
        CLOSE_GLOBAL_DIALOG: 'MESSAGES.CLOSE_GLOBAL_DIALOG',
    },
    GEO_FILTERS: {
        LOADED_DEFINITION_GROUPS: 'GEO_FILTERS.LOADED_DEFINITION_GROUPS',
        OPEN_ADD_NEW_GEO_FILTER_MODAL: 'GEO_FILTERS.OPEN_ADD_NEW_GEO_FILTER_MODAL',
        OPEN_EDIT_EXISTING_GEO_FILTER_MODAL: 'GEO_FILTERS.OPEN_EDIT_EXISTING_GEO_FILTER_MODAL',
        CLOSE_ADD_EDIT_GEO_FILTER_MODAL: 'GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL',
        UPDATE_COLLAPSE_STATUS_OF_DEF_GROUP: 'GEO_FILTERS.UPDATE_COLLAPSE_STATUS_OF_DEF_GROUP',
        FILTER_ITEM_CHANGE: 'GEO_FILTERS.FILTER_ITEM_CHANGE',
        LOADED_DEFINITION_GROUPS_VALUE: 'GEO_FILTERS.LOADED_DEFINITION_GROUPS_VALUE',
        LOAD_DEPENDENCIED_LISTS: 'GEO_FILTERS.LOAD_DEPENDENCIED_LISTS',
        FILTER_NAME_HEADER_CHANGE: 'GEO_FILTERS.FILTER_NAME_HEADER_CHANGE',
        ADD_NEW_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY: 'GEO_FILTERS.ADD_NEW_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY',
        ADD_TEMP_GEO_FILTER_TO_TEMP_ROLE_ARR: 'GEO_FILTERS.ADD_TEMP_GEO_FILTER_TO_TEMP_ROLE_ARR',
        DELETE_ROLE_SECORIAL_FILTER_FROM_TEMP_ARRAY: 'GEO_FILTERS.DELETE_ROLE_SECORIAL_FILTER_FROM_TEMP_ARRAY',
        EDIT_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY: 'EDIT_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY.EDIT_TEMP_GEO_FILTER_TO_TEMP_ROLE_ARR',
        LOADED_TEMP_DEFINITION_GROUPS_VALUE: 'GEO_FILTERS.LOADED_TEMP_DEFINITION_GROUPS_VALUE',
        EDIT_TEMP_SECTORIAL_FILTERS_OF_NEW_ROLE: 'GEO_FILTERS.EDIT_TEMP_SECTORIAL_FILTERS_OF_NEW_ROLE',
        RESET_TEMP_SECTORIAL_FILTERS_ARRAY: 'GEO_FILTERS.RESET_TEMP_SECTORIAL_FILTERS_ARRAY',
        NEW_USER_OPEN_EDIT_EXISTING_GEO_FILTER_MODAL: 'GEO_FILTERS.NEW_USER_OPEN_EDIT_EXISTING_GEO_FILTER_MODAL',
    },

    DOCUMENT: {
        DOCUMENT_ADD_SHOW_DIV: 'DOCUMENT.DOCUMENT_ADD_SHOW_DIV',
        DOCUMENT_ADD_HIDE_DIV: 'DOCUMENT.DOCUMENT_ADD_HIDE_DIV',
        DOCUMENT_INPUT_NAME_CHANGE: 'DOCUMENT.DOCUMENT_INPUT_NAME_CHANGE',
        DOCUMENT_LOAD_ALL_DOCUMENTS: 'DOCUMENT.DOCUMENT_LOAD_ALL_DOCUMENTS',
        SAVING_DOCUMENT: 'DOCUMENT.SAVING_DOCUMENT',
        SAVED_DOCUMENT: 'DOCUMENT.SAVED_DOCUMENT',
        DELETING_DOCUMENT: 'DOCUMENT.EDITING_DOCUMENT',
        DELETED_DOCUMENT: 'DOCUMENT.SAVED_DOCUMENT',
        ADDING_DOCUMENT: 'DOCUMENT.ADDING_DOCUMENT',
        ADDED_DOCUMENT: 'DOCUMENT.ADDED_DOCUMENT',
        DOCUMENT_DELETE_SHOW_MODAL_DIALOG: 'DOCUMENT.DOCUMENT_DELETE_SHOW_MODAL_DIALOG',
        DOCUMENT_DELETE_HIDE_MODAL_DIALOG: 'DOCUMENT.DOCUMENT_DELETE_HIDE_MODAL_DIALOG',
        DOCUMENT_ADD_FILE_UPLOAD_CHANGE: 'DOCUMENT.DOCUMENT_ADD_FILE_FILE_UPLOAD_CHANGE',
        DOCUMENT_ADD_DOCUMENT_NAME_CHANGE: 'DOCUMENT.DOCUMENT_ADD_DOCUMENT_NAME_CHANGE',
        DOCUMENT_ADD_SHOW_DOCUMENT_NAME: 'DOCUMENT.DOCUMENT_ADD_SHOW_DOCUMENT_NAME',
        DOCUMENT_ADD_HIDE_DOCUMENT_NAME: 'DOCUMENT.DOCUMENT_ADD_HIDE_DOCUMENT_NAME',
        DOCUMENT_EDIT_ENABLE_EDITING: 'DOCUMENT.DOCUMENT_EDIT_ENABLE_EDITING',
        DOCUMENT_EDIT_DISABLE_EDITING: 'DOCUMENT.DOCUMENT_EDIT_DISABLE_EDITING',
        SET_DOCUMENT_EDITING: 'DOCUMENT.SET_DOCUMENT_EDITING',
        SHOW_ADD_DOCUMENT_TO_REQUEST_SCREEN: 'DOCUMENT.SHOW_ADD_DOCUMENT_TO_REQUEST_SCREEN',
        HIDE_ADD_DOCUMENT_TO_REQUEST_SCREEN: 'DOCUMENT.HIDE_ADD_DOCUMENT_TO_REQUEST_SCREEN',
        DOCUMENT_LOAD_DOCUMENT_TYPES: 'DOCUMENT.DOCUMENT_LOAD_DOCUMENT_TYPES',
        DOCUMENT_CLEAN_DATA: 'DOCUMENT.DOCUMENT_CLEAN_DATA'
    },

    ACTION: {
        ACTION_INPUT_CHANGE: 'ACTION.ACTION_INPUT_CHANGE',
        LOAD_TOPICS_BY_TYPE: 'ACTION.LOAD_TOPICS_BY_TYPE',
        SHOW_MODAL_DIALOG: 'ACTION.SHOW_MODAL_DIALOG',
        HIDE_MODAL_DIALOG: 'ACTION.HIDE_MODAL_DIALOG',
        ENABLE_MODAL_OK_BUTTON: 'ACTION.ENABLE_MODAL_OK_BUTTON',
        DISABLE_MODAL_OK_BUTTON: 'ACTION.DISABLE_MODAL_OK_BUTTON'
    },

    VOTER_SOURCE_MODAL: {
        CLEAN_DATA: 'VOTER_SOURCE_MODAL.CLEAN_DATA',

        RESET_STREETS: 'VOTER_SOURCE_MODAL.RESET_STREETS',
        LOAD_STREETS: 'VOTER_SOURCE_MODAL.LOAD_STREETS',

        CHANGE_LOADED_VOTERS_FLAG: 'VOTER_SOURCE_MODAL.CHANGE_LOADED_VOTERS_FLAG',
        CHANGE_LOADING_VOTERS_FLAG: 'VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG',

        RESET_VOTERS: 'VOTER_SOURCE_MODAL.RESET_VOTERS',
        LOAD_VOTERS: 'VOTER_SOURCE_MODAL.LOAD_VOTERS',
        LOAD_MORE_VOTERS: 'VOTER_SOURCE_MODAL.LOAD_MORE_VOTERS'
    },

    INSTITUTE_MODAL : {
        CLEAN_DATA: 'INSTITUTE_MODAL.CLEAN_DATA',

        LOAD_INSTITUTE_GROUPS: 'INSTITUTE_MODAL.LOAD_INSTITUTE_GROUPS',
        LOAD_INSTITUTE_TYPES: 'INSTITUTE_MODAL.LOAD_INSTITUTE_TYPES',
        LOAD_INSTITUTE_NETWORKS: 'INSTITUTE_MODAL.LOAD_INSTITUTE_NETWORKS',

        CHANGE_LOADED_INSTITUTES_FLAG: 'INSTITUTE_MODAL.CHANGE_LOADED_INSTITUTES_FLAG',
        CHANGE_LOADING_INSTITUTES_FLAG: 'INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG',

        RESET_INSTITUTES: 'INSTITUTE_MODAL.RESET_INSTITUTES',
        LOAD_INSTITUTES: 'INSTITUTE_MODAL.LOAD_INSTITUTES',
        LOAD_MORE_INSTITUTES: 'INSTITUTE_MODAL.LOAD_MORE_INSTITUTES'
    },

    VOTER_GROUP_MODAL: {
        CLEAN_DATA: 'VOTER_GROUP_MODAL.CLEAN_DATA',
        ADDED_NEW_GROUP_DATA:'VOTER_GROUP_MODAL.ADDED_NEW_GROUP_DATA',
        LOAD_VOTER_GROUPS: 'VOTER_GROUP_MODAL.LOAD_VOTER_GROUPS'
    } , 
	VOTER_FILTER:{
		EXPAND_SHRINK_ALL_DEFINITION_GROUPS:'VOTER_FILTER.EXPAND_SHRINK_ALL_DEFINITION_GROUPS',
		EXPAND_SHRINK_DEFINITION_GROUP_BY_INDEX:'VOTER_FILTER.EXPAND_SHRINK_DEFINITION_GROUP_BY_INDEX',

        GEOGRAPHIC_FILTER: {
		    CHANGE_GROUP_EXPANDED_FLAG: 'VOTER_FILTER.GEOGRAPHIC_FILTER.CHANGE_GROUP_EXPANDED_FLAG',
            RESET_GROUP_EXPANDED_FLAG: 'VOTER_FILTER.GEOGRAPHIC_FILTER.RESET_GROUP_EXPANDED_FLAG'
        }
	},
    LOAD_BANKS_BRANCHES: 'LOAD_BANKS_BRANCHES'
};

var voterSearchToken = Axios.CancelToken;
var voterSource;

var instituteToken = Axios.CancelToken;
var instituteSource;

export function getEntityMessages(dispatch, router, entityType, entityKey) {

    dispatch({type: ActionTypes.MESSAGES.LOADING_MESSAGES_BY_ENTITY_TYPE});
    let messagesUrl = window.Laravel.baseURL + 'api/elections/voters/' + entityKey + '/messages';
    if (entityType == 1) {
        messagesUrl = window.Laravel.baseURL + 'api/crm/requests/' + entityKey + '/messages';
    }
    Axios({url: messagesUrl,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.MESSAGES.LOADED_MESSAGES_BY_ENTITY_TYPE, messagesList: response.data.data});
    }).catch(function (error) {
        console.log(error);
    });
}

export function loadTempSectorialFilterDefinitionGroupsValuesOnly(dispatch, rowIndex) {

    dispatch({
        type: ActionTypes.GEO_FILTERS.LOADED_TEMP_DEFINITION_GROUPS_VALUE,
        rowIndex
    });
}

export function loadGeoFilterDefinitionGroups(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/user/sectorialFilters/definitionGroups',
        method: "get"
    }).then(function (result) {
        dispatch({type: ActionTypes.GEO_FILTERS.LOADED_DEFINITION_GROUPS, data: result.data.data});
    });
}

export function loadGeoFilterDefinitionGroupsValuesOnly(dispatch, roleUserID) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/user/sectorialFilters/definitionGroupsValues',
        method: "get",
        params: {user_role_id: roleUserID}
    }).then(function (result) {
        dispatch({type: ActionTypes.GEO_FILTERS.LOADED_DEFINITION_GROUPS_VALUE, data: result.data.data});

    });
}

export function loadGeoTplDefinitionGroupsValuesOnly(dispatch, teamKey , templateHeader , tplKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/teams/' + teamKey + '/sectorialFilterTpls/definitionGroupsValues/'+tplKey,
        method: "get",

    }).then(function (result) {
		 
        dispatch({type: ActionTypes.GEO_FILTERS.LOADED_DEFINITION_GROUPS_VALUE, data: result.data.data , templateHeader});

    });
}

export function AddEditDeleteFilters(dispatch, userKey, roleByUserID, roleUserIndex, addFilterString, editFilterString, deleteFilterString, addEditStringMultiItems, deleteStringMultiItems, filterNameHeader, sectorialFilterID) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
	Axios({
        url: window.Laravel.baseURL + 'api/system/users/' + userKey + '/roles/' + roleByUserID + '/sectorialFilters',
        method: "put",
        data: {
            add_filter_string: addFilterString,
            edit_filter_string: editFilterString,
            delete_filter_string: deleteFilterString,
            add_edit_string_multi_items: addEditStringMultiItems,
            delete_string_multi_items: deleteStringMultiItems,
            filter_name_header: filterNameHeader,
            sectorial_filter_id: sectorialFilterID,

        }
    }).then(function (result) {

        dispatch({type: SystemActions.ActionTypes.USERS.USER_ROLE_ADDED_SECTORIAL_FILTER, data: result.data.data, roleByUserID, roleUserIndex});

        dispatch({
            type: ActionTypes.GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL
        });

        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});		
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function loadDependenciesLists(dispatch, dependencyID, itemID) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/user/sectorialFilters/dependencyList?dep_id=' + dependencyID + '&sub_list_key=' + itemID + '',
        method: "get",

    }).then(function (result) {
        dispatch({
            type: ActionTypes.GEO_FILTERS.LOAD_DEPENDENCIED_LISTS, data: result.data.data
        });
    });
}

export function addNewSectorialFilterToRoleByUser(dispatch, userKey, roleByUserID, sectorialFiltersData, roleUserIndex, filterNameHeader) {
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/' + userKey + '/roles/' + roleByUserID + '/sectorialFilters',
        method: "post",
        data: {
            sectorial_filters: sectorialFiltersData,
            filter_name_header: filterNameHeader
        }
    }).then(function (result) {
        dispatch({type: SystemActions.ActionTypes.USERS.USER_ROLE_ADDED_SECTORIAL_FILTER, data: result.data.data, roleByUserID, roleUserIndex});

        dispatch({
            type: ActionTypes.GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL
        });
		dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function getDocumentsTypes(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/documents/types',
        method: 'get'
    }).then(function (response) {
        dispatch({type: ActionTypes.DOCUMENT.DOCUMENT_LOAD_DOCUMENT_TYPES, documentTypes: response.data.data});
    });
}

export function getEntityDocuments(dispatch, entityType, entityKey) {
    var entityUrl = '';

    switch (entityType) {
        case 0: // Voter entity
            entityUrl = window.Laravel.baseURL + 'api/elections/voters/' + entityKey + '/documents';
            break;
        case 1: // Request entity
            entityUrl = window.Laravel.baseURL + 'api/crm/requests/' + entityKey + '/documents';
            break;
    }

    Axios({
        url: entityUrl,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({type: ActionTypes.DOCUMENT.DOCUMENT_LOAD_ALL_DOCUMENTS, documents: response.data.data});
    });
}

export function editEntityDocument(dispatch, entityType, entityKey, documentkey, newDocumentName) {
    var entityUrl = '';

    dispatch({type: ActionTypes.DOCUMENT.SAVING_DOCUMENT});

    switch (entityType) {
        case 0: // Voter entity
            entityUrl = window.Laravel.baseURL + 'api/elections/voters/' + entityKey + '/documents/' + documentkey;
            break;
        case 1: // Request entity
            entityUrl = window.Laravel.baseURL + 'api/crm/requests/' + entityKey + '/documents/' + documentkey;
            break;
    }

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});

    Axios({
        url: entityUrl,
        method: 'put',
        data: {
            document_name: newDocumentName
        }
    }).then(function (response) {
        var dirtyTarget  = "";

        switch (entityType) {
            case 0:
                dirtyTarget = "elections.voter.documents";
                break;

            case 1:
                dirtyTarget = "crm.requests.documents";
                break;
        }
        dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: dirtyTarget});

        dispatch({type: ActionTypes.DOCUMENT.SAVED_DOCUMENT});

		dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function deleteEntityDocument(dispatch, entityType, entityKey, documentkey) {
    var entityUrl = '';

    dispatch({type: ActionTypes.DOCUMENT.DELETING_DOCUMENT});

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});

    switch (entityType) {
        case 0: // Voter entity
            entityUrl = window.Laravel.baseURL + 'api/elections/voters/' + entityKey + '/documents/' + documentkey;
            break;

        case 1: // Request entity
            entityUrl = window.Laravel.baseURL + 'api/crm/requests/' + entityKey + '/documents/' + documentkey;
            break;
    }

    Axios({
        url: entityUrl,
        method: 'delete',
    }).then(function (response) {
        getEntityDocuments(dispatch, entityType, entityKey);

        dispatch({type: ActionTypes.DOCUMENT.DELETED_DOCUMENT});

        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

export function addEntityDocument(dispatch, entityType, entityKey, newDocumentDetails) {
    var entityUrl = '';
    var data = new FormData();

    dispatch({type: ActionTypes.DOCUMENT.ADDING_DOCUMENT});

    switch (entityType) {
        case 0: // Voter entity
            entityUrl = window.Laravel.baseURL + 'api/elections/voters/' + entityKey + '/documents';
            break;
        case 1: // Request entity
            entityUrl = window.Laravel.baseURL + 'api/crm/requests/' + entityKey + '/documents';
            break;
        case 2: // Bank verify entity
            entityUrl = window.Laravel.baseURL + 'api/elections/activists/' + entityKey + '/documents';
            data.append('doc_entity_type', 'bank_verify_document');
            break;
    }
    
    data.append('document_name', newDocumentDetails.document_name);
    data.append('file_upload', newDocumentDetails.file);

    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});

    Axios({
        url: entityUrl,
        method: 'post',
        data: data
    }).then(function (response) {
		
        dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.documents"});
        if(entityType != 2){
            getEntityDocuments(dispatch, entityType, entityKey);
        }else{
            window.location.reload();
            dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.EDIT_BANK_VERIFY_DOCUMENT, verify_bank_document_key: response.data.data.key , electionRoleByVoterKey: newDocumentDetails.electionRoleByVoterKey });
        }

        dispatch({type: ActionTypes.DOCUMENT.ADDED_DOCUMENT});
		dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
    }),(function (error) {
        displayErrorMessage(error, dispatch);
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}

/*  Voter Source Modal functions */

export function loadVoterSourceCityStreets(dispatch, cityKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/cities/' + cityKey + '/streets',
        method: "get"
    }).then(function (result) {
        dispatch({ type: ActionTypes.VOTER_SOURCE_MODAL.LOAD_STREETS, streets: result.data.data });
    }, function (error) {
        console.log(error);
    });
}

export function loadCityQuarters(dispatch, cityKey) {
   return Axios({
        url: window.Laravel.baseURL + 'api/system/cities/' + cityKey + '/quarters',
        method: "get"
    }).then(function (result) {
      return result.data.data
    }, function (error) {
        displayErrorMessage(error, dispatch);
    });
}

export function searchVoterSourceVoters(dispatch, searchFields, dbConstraints) {
    voterSource = voterSearchToken.source();

    dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.RESET_VOTERS});
    dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADED_VOTERS_FLAG, loadedVoters: false});
    dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG, loadingData: true});

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters-source/voters',
        method: 'get',
        params: Object.assign(searchFields, dbConstraints),
        cancelToken: voterSource.token
    }).then(function (response) {
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.LOAD_VOTERS, totalVoters: response.data.data.totalVoters,
                  voters: response.data.data.voters});
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADED_VOTERS_FLAG, loadedVoters: true});
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG, loadingData: false});
    }, function (error) {
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADED_VOTERS_FLAG, loadedVoters: true});
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG, loadingData: false});
    });
}

export function cancelVoterSearch(dispatch) {
    dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG, loadingData: false});
    voterSource.cancel('Operation canceled by the user, cancelVoterSearch.');
}

export function loadMoreVoterSourceVoters(dispatch, searchFields, dbConstraints) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters-source/voters',
        method: 'get',
        params: Object.assign(searchFields, dbConstraints)
    }).then(function (response) {
        dispatch({type: ActionTypes.VOTER_SOURCE_MODAL.LOAD_MORE_VOTERS, voters: response.data.data.voters});
    }, function (error) {

    });
}

/*  Institute Modal functions */

export function loadInstituteGroupsForInstituteModal(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/institutes/groups',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_GROUPS, instituteGroups: response.data.data });
    }, function (error) {

    });
}

export function loadInstituteTypesForInstituteModal(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/institutes/types',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_TYPES, instituteTypes: response.data.data });
    }, function (error) {

    });
}

export function loadInstituteNetworksForInstituteModal(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/institutes/networks',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_NETWORKS, instituteNetworks: response.data.data });
    }, function (error) {

    });
}

export function searchInstitutesForInstituteModal(dispatch, searchFields, dbConstraints) {
    instituteSource = instituteToken.source();

    dispatch({type: ActionTypes.INSTITUTE_MODAL.RESET_INSTITUTES});
    dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADED_INSTITUTES_FLAG, loadedInstitutes: false});
    dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG, loadingInstitutes: true});

    Axios({
        url: window.Laravel.baseURL + 'api/system/institutes/search',
        method: 'get',
        params: Object.assign(searchFields, dbConstraints),
        cancelToken: instituteSource.token
    }).then(function (response) {
        dispatch({type: ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTES, totalInstitutes: response.data.data.totalInstitutes,
                  institutes: response.data.data.institutes});
        dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADED_INSTITUTES_FLAG, loadedInstitutes: true});
        dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG, loadingInstitutes: false});
    }, function (error) {
        dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADED_INSTITUTES_FLAG, loadedInstitutes: true});
        dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG, loadingInstitutes: false});
    });
}

export function cancelInstitutesSearch(dispatch) {
    dispatch({type: ActionTypes.INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG, loadingInstitutes: false});
    instituteSource.cancel('Operation canceled by the user, cancelInstitutesSearch.');
}

export function loadMoreInstitutesForInstituteModal(dispatch, searchFields, dbConstraints) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/institutes/search',
        method: 'get',
        params: Object.assign(searchFields, dbConstraints)
    }).then(function (response) {
        dispatch({type: ActionTypes.INSTITUTE_MODAL.LOAD_MORE_INSTITUTES, institutes: response.data.data.institutes});
    }, function (error) {

    });
}

/* Voter Groups Modal functions */

export function loadVoterGroupsForVoterGroupModal(dispatch, newGroupData = null) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/voters/groups',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_GROUP_MODAL.LOAD_VOTER_GROUPS, voterGroups: response.data.data });
        if(newGroupData){
            dispatch({ type: ActionTypes.VOTER_GROUP_MODAL.ADDED_NEW_GROUP_DATA, newGroup: newGroupData });
        }
    }, function (error) {

    });
}

export function addNewGroupForVoterGroupModal(dispatch, data) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/voters/groups',
        method: 'post',
        data
    }).then(function (response) {
        loadVoterGroupsForVoterGroupModal(dispatch,response.data.data);
    }, function (error) {

    });
}

/** Load bank branches */

export function loadBankBranches(dispatch) {
   return Axios({
        url: window.Laravel.baseURL + 'api/banks/branches',
        method: 'get',
    }).then(function (response) {
        dispatch({ type: ActionTypes.LOAD_BANKS_BRANCHES, banksBranches: response.data.data });
    }, function (error) {

    });;
}

/**
 * @function
 * display error message modal
 * @param error - error data;
 * Need to replace all the errors with this function.
 * @returns void.
 */
 function displayErrorMessage(error, dispatch){
    let response = error.response || false;
    if (response) {
        let data = response.data || false;
        // console.log(data);
        if (data) {
            let errorCode = data.error_code || false;
            if (errorCode && errors[errorCode]) {
                dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode] });
            }
        }
    }

}
