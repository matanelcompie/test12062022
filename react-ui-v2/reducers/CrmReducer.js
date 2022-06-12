import _ from 'lodash';
import * as CrmActions from '../actions/CrmActions';
import {arraySort} from '../libs/globalFunctions';
/*this block constructs formatted date of today*/
let nowDate = new Date();
let dd = nowDate.getDate();
let mm = nowDate.getMonth() + 1; //January is 0!
let yyyy = nowDate.getFullYear();
var seconds = nowDate.getSeconds();
var minutes = nowDate.getMinutes();
var hour = nowDate.getHours();
if (hour <= 9)
    hour = '0' + hour;
if (minutes <= 9)
    minutes = '0' + minutes;
if (seconds <= 9)
    seconds = '0' + seconds;
if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}
/*end of this block*/

const initialState = {
    isEditingUnknownVoter: false,
    showSendEmailModalDialog: false,

    emailContent: {
        title: '',
        body: ''
    },
    addUnknownVoterScreen: {
        key: '',
        personal_identity: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        passport: '',
        city: '',
        neighborhood: '',
        street: '',
        streets: [],
        house: '',
        house_entry: '',
        flat: '',
        zip: '',
        email: '',
        phone1: '',
        phone2: '',
        age: '',
        existingVoterKey: '',
        existingVoterName: '',
    },
    requestSearch: {
        lists: {
            cities: [],
            countries: [],
            teams: [],
            currentUserRoleTeams: [],
            topics: [],
            subTopics: [],
            fullSubTopics: [],
            priority: [],
            status: [],
            statusType: [],
            allUsers: [],
            users: [],
            teamsUsers: [],
            inDate: [{id: 1, name: 'עבר'}, {id: 2, name: 'עתידי'}],
            actionTypes: [],
            selectedVoters: [],
        },
        searchFilters: {
            fromRequestDate: '',
            toRequestDate: '',
            fromCreateDate: '',
            toCreateDate: '',
            fromCloseDate: '',
            toCloseDate: '',
            firstName: '',
            lastName: '',
            phone: '',
            inDate: '',
            callbizId: '',
            includingOperation: [],
            statusType: [],
            status: [],
            priority: [],
            topics: [],
            subTopics: [],
            voterRequests: [],
            requestsFromCity: [],
            handlerUser: [],
            handlerTeam: [],
            creatorUser: [],
            updaterUser: [],
        }, comboFilters: {
            includingOperation: '',
            statusType: '',
            status: '',
            priority: '',
            topics: '',
            subTopics: '',
            voterRequests: '',
            requestsFromCity: '',
            handlerUser: '',
            handlerTeam: '',
            creatorUser: '',
            updaterUser: '',
        }, collapseStatus: {
            //is collapse opened
            dates: true
        },
        isDateFilterExist: false,
        isThereFiltersExist: false,
        isFiltersHasErrors: false,
        searchResults: [],
        clearedSerachFilters: {},
        errorMessage: '',
        isSearchButtonPressed: false,
        isResultsOrderedAsc: false,
        resultsOrderColumn: 'request_date',
        tableHasScrollbar: false,
    },
    searchRequestsScreen: {
    //    showCancelCrmRequestDlg: false,
        showConfirmTimeDelayDlg: false,
        showDeleteActionModalDialog: false,
        showRedirectToNewRequest: false,
        deleteOperationIndex: -1,
        editOperationIndex: -1,
        newEmail: '',
        showCreateEmailDialog: false,
        personalIdentity: '',
        addingNewCallbiz: false,
        editingCallbizRow: false,
        requests: [],
        requestRowCheckedOut: [],
        requestTypes: [],
        actionTypesList: [],
        actionTopicsList: [],
        actionStatusesList: [],
        directions: [{"id": 0, "key": "56yhjur5tw", "name": "יוצאת"}, {"id": 1, "key": "76yhjur5tw", "name": "נכנסת"}],
        modalHeaderText: '',
        modalContentText: '',
        newActionDetails: {
            conversationWith: '',
            details: '',
            target_date: (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds),
            action_type: '',
            action_topic: '',
            action_status: '',
            action_direction: ''
        },
        newCallbizDetails: {
            ID: '',
            datetime: (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds),
            details: ''
        },
        showModalDialog: false,
        showConfirmDialog: false,
        addingNewAction: false,
        showRequestSourceFaxModalDialog: false,
        showRequestSourceEmailModalDialog: false,
        showRequestSourceCallBizModalDialog: false,
        showRequestSourceOtherModalDialog: false,
        showRequestSourceInfoModalDialog: false,
        showTransferRequestModalDialog: false,
        showCloseRequestModalDialog: false,
        showCancelRequestModalDialog: false,
        requestSourceDocumentDetails: {
            documentName: '',
            file: null
        },
        /**/
        activeRequestDetailTab: {'operation': true, 'history': false, 'callBiz': false, 'message': false, 'document': false},
        originalDataRequest: {
            reqId: '',
            reqKey: '',
            first_desc: '',
            voter_id: '', // perhaps
            temp_voter_id: '', // perhaps
            voter_key: '',
            temp_voter_key: '',
            topic_id: '',
            sub_topic_id: '',
            date: '',
            close_date: '',
            target_close_date: '',
            request_priority_id: '',
            request_source_id: '',
            user_handler_id: '',
            team_handler_id: '',
            shas_representative_id: '',
            status_id: '',
            status_type_id: '',
            user_create_id: '',
            user_update_id: '',
            city: '',
            neighborhood: '',
            street: '',
            house: '',
            house_entry: '',
            flat: '',
            zip: '',
            created_at: '',
            updated_at: '',
            /* normal fields are above!!! */
            reqCreatedAt: '',
            reqUpdatedAt: '',
            /*=*/
            topic_name: '',
            sub_topic_name: '',
            status_name: '',
            status_type_name: '',
            priority_name: '',
            request_source_name: '',
            user_handler_name: '',
            team_name: '',
            teamKey: '',
            request_source_fax: '',
            request_source_email: '',
            request_source_first_name: '',
            request_source_last_name: '',
            request_source_phone: '',
            
        },
        dataRequest: {
            reqId: '',
            reqKey: '',
            first_desc: '',
            voter_id: '', // perhaps
            temp_voter_id: '', // perhaps
            topic_id: '',
            sub_topic_id: '',
            voter_key: '',
            temp_voter_key: '',
            date: '',
            close_date: '',
            target_close_date: '',
            request_priority_id: '',
            request_source_id: '',
            user_handler_id: '',
            team_handler_id: '',
            shas_representative_id: '',
            status_id: '',
            status_type_id: '',
            user_create_id: '',
            user_update_id: '',
            city: '',
            neighborhood: '',
            street: '',
            house: '',
            house_entry: '',
            flat: '',
            zip: '',
            created_at: '',
            updated_at: '',
            /* normal fields are above!!! */
            reqCreatedAt: '',
            reqUpdatedAt: '',
            /*=*/
            topic_name: '',
            sub_topic_name: '',
            status_name: '',
            status_type_name: '',
            priority_name: '',
            request_source_name: '',
            user_handler_name: '',
            team_name: '',
            teamKey: '',
            request_source_fax: '',
            request_source_email: '',
            request_source_first_name: '',
            request_source_last_name: '',
            request_source_phone: '',            
            
        },
        modalTransferRequestDetails: {
            user_handler_name: '',
            user_handler_id: null,
            team_name: '',
            teamKey: '',
        },
        modalCloseRequestDetails: {
            statusList: [],
            status_id: '',
            status_name: '',
            status_type_name: '',
            reason_id: '',
            reason_name: '',
            details: '',
            voter_satisfaction : null,
            isSendEmail: true,
            isIncludeClosingReason: true,
        },
        modalCancelRequestDetails: {
            statusList: [],
            status_id: '',
            status_name: '',
            status_type_name: '',
            details: '',
        },

        topicList: [],
        subTopicList: [],
        statusList: [],
        statusTypesList: [],
        priorityList: [],
        requestSourceList: [],
        requestCloseReasonList: [],
        requestSatisfactionList: [],
        teams: [],
        handlerTeamList: [],
        handlerTeamUserList: [],
        operationList: [],
        historyList: [],
        callBizList: [],
        messageList: [],
        documentList: [],
        addingRequest: false,
        callBizDeleteIndex: -1,
        callBizEditIndex: -1,
    },
};
//use this empty search filter to reset the filters
const emptySearchFilters = initialState.requestSearch.searchFilters;
function crmReducer(state = initialState, action) {

    switch (action.type) {

        case CrmActions.ActionTypes.REQUESTS.TOGGLE_MODAL_WINDOW:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.activeModalWindow = {...newState.searchRequestsScreen.activeModalWindow};
            /**
             * Debatable if we have to close all others modals!
             */
            for (let i in newState.searchRequestsScreen.activeModalWindow) {
                if (action.reqModalName == i) {
                    if (true == newState.searchRequestsScreen.activeModalWindow[i]) {
                        /**
                         * Hide the showed modal
                         */
                        newState.searchRequestsScreen.activeModalWindow[i] = false;
                        newState.searchRequestsScreen.showThisOne = '';
                    } else {
                        /**
                         * Show the proper modal
                         */
                        newState.searchRequestsScreen.activeModalWindow[i] = true;
                        newState.searchRequestsScreen.showThisOne = action.reqModalName;
                    }
                } else {
                    newState.searchRequestsScreen.activeModalWindow[i] = false;
                }
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUESTS.REDIRECT_TO_REQUEST_PAGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.ADDED_REQUEST:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [];
            newState.searchRequestsScreen.oldCallBiz = [];
            newState.searchRequestsScreen.historyList = [];
            newState.searchRequestsScreen.messageList = [];
            newState.searchRequestsScreen.documentList = [];
            return newState;
            break;
            /**/
        case CrmActions.ActionTypes.REQUEST.SEARCH_BEGIN:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_MODAL_DISPLAY_DELAY_TIME_SHOW:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.showConfirmTimeDelayDlg = action.data;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_FIRST_NAME:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};                        
            newState.searchRequestsScreen.dataRequest.request_source_first_name = action.request_source_first_name;
            return newState;
            break;

            case CrmActions.ActionTypes.REQUEST.REQUEST_CHANGE_FIELD:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};                        
            newState.searchRequestsScreen.dataRequest[action.nameField] = action.value;
            return newState;
            break;    
    

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_LAST_NAME:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_last_name = action.request_source_last_name;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_PHONE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};                
            newState.searchRequestsScreen.dataRequest.request_source_phone = action.request_source_phone;
            return newState;
            break;  

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_FAX_NUMBER:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_fax = action.request_source_fax;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_ADD_FILE_UPLOAD_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceDocumentDetails = {...newState.searchRequestsScreen.requestSourceDocumentDetails};
            newState.searchRequestsScreen.requestSourceDocumentDetails.file = action.file;
            return newState;
            break; 

        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceDocumentDetails = {...newState.searchRequestsScreen.requestSourceDocumentDetails};
            newState.searchRequestsScreen.requestSourceDocumentDetails.documentName = action.document_name;
            return newState;
            break;   

        case CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_FAX_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceDocumentDetails = {...newState.searchRequestsScreen.requestSourceDocumentDetails};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.requestSourceDocumentDetails.documentName = '';
            newState.searchRequestsScreen.requestSourceDocumentDetails.file = null;
            newState.searchRequestsScreen.showRequestSourceFaxModalDialog = false;
            newState.searchRequestsScreen.dataRequest.request_source_fax = '';
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_FAX_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceFaxModalDialog = true;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_FAX_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceFaxModalDialog = false;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.newCallbizDetails = {...newState.searchRequestsScreen.newCallbizDetails};
            newState.searchRequestsScreen.newCallbizDetails.ID = '';
            newState.searchRequestsScreen.newCallbizDetails.datetime = (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds);
            newState.searchRequestsScreen.newCallbizDetails.details = '';
            newState.searchRequestsScreen.showRequestSourceCallBizModalDialog = false;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_CALLBIZ_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceCallBizModalDialog = true;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_CALLBIZ_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceCallBizModalDialog = false;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_EMAIL_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceDocumentDetails = {...newState.searchRequestsScreen.requestSourceDocumentDetails};
            newState.searchRequestsScreen.showRequestSourceEmailModalDialog = false;
            newState.searchRequestsScreen.dataRequest.request_source_email = '';
            newState.searchRequestsScreen.requestSourceDocumentDetails.documentName = '';
            newState.searchRequestsScreen.requestSourceDocumentDetails.file = null;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_OTHER_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.showRequestSourceOtherModalDialog = false;            
            newState.searchRequestsScreen.dataRequest.request_source_first_name = '';            
            newState.searchRequestsScreen.dataRequest.request_source_last_name = '';  
            newState.searchRequestsScreen.dataRequest.request_source_phone = '';
            return newState;
            break;            

        case CrmActions.ActionTypes.REQUEST.CLEAN_REQUEST_SOURCE_DOCUMENT_DATA:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceDocumentDetails = {...newState.searchRequestsScreen.requestSourceDocumentDetails};
            newState.searchRequestsScreen.requestSourceDocumentDetails.documentName = '';
            newState.searchRequestsScreen.requestSourceDocumentDetails.file = null;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceInfoModalDialog = false;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_INFO_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.originalDataRequest = {...newState.searchRequestsScreen.originalDataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_fax = newState.searchRequestsScreen.originalDataRequest.request_source_fax;
            newState.searchRequestsScreen.dataRequest.request_source_email = newState.searchRequestsScreen.originalDataRequest.request_source_email;            
            newState.searchRequestsScreen.dataRequest.request_source_first_name = newState.searchRequestsScreen.originalDataRequest.request_source_first_name;            
            newState.searchRequestsScreen.dataRequest.request_source_last_name = newState.searchRequestsScreen.originalDataRequest.request_source_last_name;
            newState.searchRequestsScreen.dataRequest.request_source_phone = newState.searchRequestsScreen.originalDataRequest.request_source_phone;
            newState.searchRequestsScreen.showRequestSourceInfoModalDialog = false;
            return newState;
            break;            

        case CrmActions.ActionTypes.REQUEST.OPEN_TRANSFER_REQUEST_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showTransferRequestModalDialog = true;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.CLOSE_TRANSFER_REQUEST_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showTransferRequestModalDialog = false;
            return newState;
            break; 

        case CrmActions.ActionTypes.REQUEST.HIDE_TRANSFER_REQUEST_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.modalTransferRequestDetails = {...state.searchRequestsScreen.modalTransferRequestDetails};
            newState.searchRequestsScreen.modalTransferRequestDetails.teamKey = '';
            newState.searchRequestsScreen.modalTransferRequestDetails.team_name = '';
            newState.searchRequestsScreen.modalTransferRequestDetails.user_handler_id = '';
            newState.searchRequestsScreen.modalTransferRequestDetails.user_handler_name = '';
            newState.searchRequestsScreen.newActionDetails = {...newState.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.details = '';
            newState.searchRequestsScreen.showTransferRequestModalDialog = false;
            return newState;
            break; 

        case CrmActions.ActionTypes.REQUEST.OPEN_CLOSE_REQUEST_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showCloseRequestModalDialog = true;
            return newState;
            break; 

        case CrmActions.ActionTypes.REQUEST.HIDE_CLOSE_REQUEST_MODAL:

            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...state.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.status_id = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.status_name = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.status_type_name = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.reason_id = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.reason_name = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.details = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.voter_satisfaction = '';
            newState.searchRequestsScreen.modalCloseRequestDetails.isSendEmail = true;
            newState.searchRequestsScreen.modalCloseRequestDetails.isIncludeClosingReason = true;
            newState.searchRequestsScreen.showCloseRequestModalDialog = false;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.OPEN_CANCEL_REQUEST_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showCancelRequestModalDialog = true;
            return newState;
            break; 

        case CrmActions.ActionTypes.REQUEST.HIDE_CANCEL_REQUEST_MODAL:

            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.modalCancelRequestDetails = {...state.searchRequestsScreen.modalCancelRequestDetails};            
            newState.searchRequestsScreen.modalCancelRequestDetails.status_id = '';
            newState.searchRequestsScreen.modalCancelRequestDetails.status_name = '';
            newState.searchRequestsScreen.modalCancelRequestDetails.status_type_name = '';
            newState.searchRequestsScreen.modalCancelRequestDetails.details = '';
            newState.searchRequestsScreen.showCancelRequestModalDialog = false;
            return newState;
            break;                                              
                       
        case CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_INFO_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceInfoModalDialog = true;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_OTHER_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceOtherModalDialog = true;
            return newState;
            break;            

        case CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_EMAIL_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceEmailModalDialog = true;
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_email = action.voterEmail;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_OTHER_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceOtherModalDialog = false;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_EMAIL_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showRequestSourceEmailModalDialog = false;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_EMAIL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_email = action.request_source_email;
            return newState;
        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_VOTER_ORIGINAL_EMAIL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.originalDataRequest.request_source_email = action.request_source_email;
            return newState;
        case CrmActions.ActionTypes.REQUEST.CLEAN_TEMP_VOTER_DATA:
            var newState = {...state};
            newState.isEditingUnknownVoter = false;
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.unknown_voter_data = undefined;
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            for (var key in newState.addUnknownVoterScreen) {
                newState.addUnknownVoterScreen[key] = '';
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.UNKNOWN_VOTER_PERSONAL_IDENTITY:
            var newState = {...state};
            newState.isEditingUnknownVoter = false;
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            newState.addUnknownVoterScreen.personal_identity = '';
            return newState;
            break;            
        case CrmActions.ActionTypes.REQUEST.SEARCH_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...action.reqData};
            newState.searchRequestsScreen.activeRequestDetailTab = {'operation': true, 'history': false, 'callBiz': false, 'message': false, 'document': false};
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            newState.searchRequestsScreen.originalDataRequest = {...action.reqData};
            if (action.reqData.unknown_voter_data != undefined && !action.reqData.voter_key) { //temp voter 
                let localData = action.reqData.unknown_voter_data;
                newState.addUnknownVoterScreen.streets = localData.streets;
                newState.addUnknownVoterScreen.key = localData.key == null ? '' : localData.key;
                newState.addUnknownVoterScreen.last_name = localData.last_name == null ? '' : localData.last_name;
                newState.addUnknownVoterScreen.passport = localData.passport == null ? '' : localData.passport;
                newState.addUnknownVoterScreen.phone1 = localData.phone1 == null ? '' : localData.phone1;
                newState.addUnknownVoterScreen.phone2 = localData.phone2 == null ? '' : localData.phone2;
                newState.addUnknownVoterScreen.first_name = localData.first_name == null ? '' : localData.first_name;
                newState.addUnknownVoterScreen.email = localData.email == null ? '' : localData.email;
                newState.addUnknownVoterScreen.personal_identity = localData.personal_identity == null ? '' : localData.personal_identity;
                newState.addUnknownVoterScreen.neighborhood = localData.neighborhood == null ? '' : localData.neighborhood;
                newState.addUnknownVoterScreen.street = localData.street == null ? '' : localData.street;
                newState.addUnknownVoterScreen.house = localData.house == null ? '' : localData.house;
                newState.addUnknownVoterScreen.house_entry = localData.house_entry == null ? '' : localData.house_entry;
                newState.addUnknownVoterScreen.flat = action.reqData.unknown_voter_data.flat == null ? '' : action.reqData.unknown_voter_data.flat;
                newState.addUnknownVoterScreen.zip = action.reqData.unknown_voter_data.zip == null ? '' : action.reqData.unknown_voter_data.zip;
                newState.addUnknownVoterScreen.gender = action.reqData.unknown_voter_data.gender == null ? '' : (action.reqData.unknown_voter_data.gender == '1' ? 'נקבה' : 'זכר');
                newState.addUnknownVoterScreen.city = (action.reqData.unknown_voter_data.city_name == undefined || action.reqData.unknown_voter_data.city_name == null) ? '' : action.reqData.unknown_voter_data.city_name;
                newState.addUnknownVoterScreen.voter_id=action.reqData.voter_id;
                if (action.reqData.unknown_voter_data.birth_date != null) {
                    let arrDate = action.reqData.unknown_voter_data.birth_date.split('-');
                    let currentYear = new Date().getFullYear();
                    newState.addUnknownVoterScreen.age = currentYear - parseInt(arrDate[0]);
                    //newState.addUnknownVoterScreen.age='34';
                }

            }

            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.DATE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.date = action.reqDate;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.FIRST_DESC_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.first_desc = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.TOPIC_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.topic_name = action.topicName;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_TOPIC_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_TOPIC_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.topicList = [...action.topicList];
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_SUB_TOPIC_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.subTopicList = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SUB_TOPIC_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.sub_topic_name = action.subTopicName;
            let defaultStatusID = -1;
            let numOfDays = 0;
            //set default status and target close day
            if(newState.searchRequestsScreen.subTopicList.length>0)
            {
                let subTopicDefault = newState.searchRequestsScreen.subTopicList.find(a=>a.name==newState.searchRequestsScreen.dataRequest.sub_topic_name)
                if(subTopicDefault){
                    numOfDays = subTopicDefault.target_close_days;
                    //set default status if not exist
                    if(subTopicDefault.default_request_status_id && newState.searchRequestsScreen.dataRequest.status_name==""){
                       var statusObj=newState.searchRequestsScreen.statusList.find(a=>a.id==subTopicDefault.default_request_status_id);
                       newState.searchRequestsScreen.dataRequest.status_id=statusObj.id;
                       newState.searchRequestsScreen.dataRequest.status_name=statusObj.name;
                    }
                }
            }

            let d = new Date();
            d.setDate(d.getDate() + numOfDays);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            let year = d.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            newState.searchRequestsScreen.dataRequest.target_close_date = [day, month, year].join('/');
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.STATUS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.status_id = action.statusNewValue;
            newState.searchRequestsScreen.dataRequest.status_name = action.data;
            newState.searchRequestsScreen.dataRequest.status_type_name = action.statusTypeName;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_STATUS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.status_id = action.statusNewValue;
            newState.searchRequestsScreen.modalCloseRequestDetails.status_name = action.data;
            newState.searchRequestsScreen.modalCloseRequestDetails.status_type_name = action.statusTypeName;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_REASON_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.reason_id = action.reasonNewValue;
            newState.searchRequestsScreen.modalCloseRequestDetails.reason_name = action.data;
            return newState;            

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_DETAILS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.details = action.details;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_VOTER_SATISFACTION_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.voter_satisfaction = action.voter_satisfaction;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_SEND_EMAIL_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};            
            newState.searchRequestsScreen.modalCloseRequestDetails.isSendEmail = action.data;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_INCLUDE_CLOSING_REASON_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.isIncludeClosingReason = action.data;
            return newState; 

        case CrmActions.ActionTypes.REQUEST.MODAL_CANCEL_REQUEST_STATUS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCancelRequestDetails = {...newState.searchRequestsScreen.modalCancelRequestDetails};
            newState.searchRequestsScreen.modalCancelRequestDetails.status_id = action.statusNewValue;
            newState.searchRequestsScreen.modalCancelRequestDetails.status_name = action.data;
            newState.searchRequestsScreen.modalCancelRequestDetails.status_type_name = action.statusTypeName;
            return newState;

        case CrmActions.ActionTypes.REQUEST.MODAL_CANCEL_REQUEST_DETAILS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCancelRequestDetails = {...newState.searchRequestsScreen.modalCancelRequestDetails};
            newState.searchRequestsScreen.modalCancelRequestDetails.details = action.details;
            return newState;                                               

        case CrmActions.ActionTypes.REQUEST.CLEAN_CRM_INPUT_DATA :
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            for (let key in     newState.searchRequestsScreen.dataRequest) {
                newState.searchRequestsScreen.dataRequest[key] = '';
            }
            return newState;
            break;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_STATUS_BEGIN:

            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_STATUS_END:

            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.statusList = [...action.statusList];
            /*newState.searchRequestsScreen.statusList = action.data;*/
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_STATUSES_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.statusList = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SEARCH_STATUSES_FILTERED_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCloseRequestDetails = {...newState.searchRequestsScreen.modalCloseRequestDetails};
            newState.searchRequestsScreen.modalCloseRequestDetails.statusList = [...action.data];
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CANCEL_REQUEST_SEARCH_STATUSES_FILTERED_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalCancelRequestDetails = {...newState.searchRequestsScreen.modalCancelRequestDetails};
            newState.searchRequestsScreen.modalCancelRequestDetails.statusList = [...action.data];
            return newState;
            break;                        
        case CrmActions.ActionTypes.REQUEST.SEARCH_STATUS_TYPES_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.statusTypesList = [...action.statusList];
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.ADDED_UNKNOWN_VOTER_SUCCESSFULLY:
            var newState = {...state};
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            newState.addUnknownVoterScreen.key = action.data;
            newState.addUnknownVoterScreen.age = action.age;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.STATUS_TYPE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.status_type_id = action.statusTypeNewValue;
            newState.searchRequestsScreen.dataRequest.status_name = '';
            newState.searchRequestsScreen.dataRequest.status_type_name = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_DATE_CHANGE:// מועד סגירה
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.close_date = action.closeDate;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CREATOR_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.user_create_id = action.reqUserCreateId;
            newState.searchRequestsScreen.dataRequest.user_create_name = action.reqUserCreateName;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CREATION_DATE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            /*newState.searchRequestsScreen.dataRequest.created_at = action.createdAt;*/
            newState.searchRequestsScreen.dataRequest.reqCreatedAt = action.createdAt;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.UPDATER_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            /*newState.searchRequestsScreen.dataRequest.updated_at = action.updatedAt;*/
            newState.searchRequestsScreen.dataRequest.reqUpdatedAt = action.updatedAt;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLEAR_REQUEST_FORM:
            var newState = {...state};
            var dataRequest = {...newState.searchRequestsScreen.dataRequest};

            for (let i in  dataRequest) {
                dataRequest[i] = '';
            }

            newState.searchRequestsScreen.dataRequest=dataRequest;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.user_handler_id = action.userHandlerId;
            newState.searchRequestsScreen.dataRequest.user_handler_name = action.userHandlerName;
            let counter = 0;
            for (let i = 0, len = action.users.length; i < len; i++) {
                if (action.users[i].full_name == action.userHandlerName) {
                    newState.searchRequestsScreen.teams = action.users[i].teams;
                    counter++;
                    break;
                }
            }
            if (counter == 0) {
                newState.searchRequestsScreen.teams = [];
            }
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_USER_HANDLER_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.modalTransferRequestDetails = {...newState.searchRequestsScreen.modalTransferRequestDetails};
            newState.searchRequestsScreen.modalTransferRequestDetails.user_handler_id = action.userHandlerId;
            newState.searchRequestsScreen.modalTransferRequestDetails.user_handler_name = action.userHandlerName;
            let counter1 = 0;
            for (let i = 0, len = action.users.length; i < len; i++) {
                if (action.users[i].full_name == action.userHandlerName) {
                    newState.searchRequestsScreen.teams = action.users[i].teams;
                    counter1++;
                    break;
                }
            }
            if (counter == 0) {
                newState.searchRequestsScreen.teams = [];
            }
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.LOAD_FIRST_TEAMS:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.teams = action.teams;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.team_name = action.teamHandlerName;
            newState.searchRequestsScreen.dataRequest.teamKey = action.teamHandlerKey;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_TEAM_HANDLER_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.modalTransferRequestDetails = {...newState.searchRequestsScreen.modalTransferRequestDetails};
            newState.searchRequestsScreen.modalTransferRequestDetails.team_name = action.teamHandlerName;
            newState.searchRequestsScreen.modalTransferRequestDetails.teamKey = action.teamHandlerKey;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.PRIORITY_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_priority_id = action.requestPriorityId;
            newState.searchRequestsScreen.dataRequest.priority_name = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_PRIORITY_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_PRIORITY_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.priorityList = [...action.priorityList];
            return newState;
            break;
        //request source handle
        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_name = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_ID_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.request_source_id = action.data;
            return newState;
            break;            
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_SOURCE_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_SOURCE_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSourceList = action.requestSourceList;
            return newState;
            break;

        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_CLOSURE_REASON_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestCloseReasonList = action.requestCloseReasonList;
            return newState;
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_SATISFACTION_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.requestSatisfactionList = action.requestSatisfactionList;
            return newState;
        case CrmActions.ActionTypes.REQUEST.ESTIMATED_CLOSE_DATE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen.dataRequest = {...newState.searchRequestsScreen.dataRequest};
            newState.searchRequestsScreen.dataRequest.target_close_date = action.estimatedCloseDate;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.REMINDER_CLOSING_DATE_CHANGE:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.REMINDER_CLOSING_DATE_CANCEL:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_TEMP_VOTER_EDITING:
            var newState = {...state};
            newState.isEditingUnknownVoter = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.TOGGLE_SEND_EMAIL_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.emailContent = {...newState.emailContent};
            newState.showSendEmailModalDialog = action.showModal;
            newState.emailContent.body = '';
            newState.emailContent.title = '';
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_UNKNOWN_VOTER_KEY:
            var newState = {...state};
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            newState.addUnknownVoterScreen.existingVoterKey = action.voterKey;
            newState.addUnknownVoterScreen.existingVoterName = action.voterName;
            return newState;
            break;            
        case CrmActions.ActionTypes.REQUEST.UPDATE_EMAIL_CONTENT:
            var newState = {...state};
            newState.emailContent = {...newState.emailContent};
            newState.emailContent[action.key] = action.value;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_ACTIVE_TAB_PANEL:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.activeRequestDetailTab = {...action.activeTab};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_ACTION_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_ACTION_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.operationList = [...action.operationList];
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_REQUEST_ACTION_EDITING:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.operationList = [...newState.searchRequestsScreen.operationList];
            newState.searchRequestsScreen.operationList[action.actionIndex].is_editing = action.isEditing;
            if (action.isEditing) {
                newState.searchRequestsScreen.editOperationIndex = action.actionIndex;
            } else {
                newState.searchRequestsScreen.editOperationIndex = -1
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_DISPLAY_CONFIRM_ACTION_DELETE:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.showDeleteActionModalDialog = action.isShow;
            newState.searchRequestsScreen.deleteOperationIndex = action.deleteIndex;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.showRedirectToNewRequest = action.isShow;
            return newState;
            break;            
        case CrmActions.ActionTypes.REQUEST.CHANGE_EDIT_ACTION_ROW_FIELD:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.operationList = [...newState.searchRequestsScreen.operationList];
            newState.searchRequestsScreen.operationList[action.rowIndex][action.rowKey] = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_HISTORY_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_HISTORY_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.historyList = [...action.historyList];
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_CALLBIZ_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_CALLBIZ_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [...action.callBizList];
            for (let i = 0; i < newState.searchRequestsScreen.callBizList.length; i++) {
                let old_val = newState.searchRequestsScreen.callBizList[i].callBizCenterDate;
                let arr1 = old_val.split(' ');
                let arr2 = arr1[0].split('-');
                newState.searchRequestsScreen.callBizList[i].callBizCenterDate = arr2[2] + '/' + arr2[1] + '/' + arr2[0] + ' ' + arr1[1];
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_DOCUMENT_BEGIN:
            var newState = {...state};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.GRAB_DOCUMENT_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.documentList = [...action.documentList];
            return newState;
            break;
            /**/
        case CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showModalDialog = true;
            newState.searchRequestsScreen.modalHeaderText = action.header;
            newState.searchRequestsScreen.modalContentText = action.content;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.OPEN_GENERAL_ERROR_MODAL:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.showModalDialog = true;
            newState.searchRequestsScreen.modalHeaderText = action.header;
            newState.searchRequestsScreen.modalContentText = action.content;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_MODAL_DIALOG:
            var newState = {...state};
            newState.searchRequestsScreen.modalHeaderText = '';
            newState.searchRequestsScreen.modalContentText = '';
            newState.searchRequestsScreen.showModalDialog = false;
            return newState;
            break;            
        case CrmActions.ActionTypes.REQUEST.NEW_EMAIL_CHANGE :
            var newState = {...state};
            newState.searchRequestsScreen.newEmail = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED:
            var newState = {...state};
            newState.searchRequestsScreen.showCreateEmailDialog = action.data;
            newState.searchRequestsScreen.newEmail = '';
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.OPEN_CONFIRM_DIALOG :
            var newState = {...state};
            newState.searchRequestsScreen.modalHeaderText = action.header;
            newState.searchRequestsScreen.modalContentText = 'האם את/ה בטוח/ה ? ';
            newState.searchRequestsScreen.showConfirmDialog = true;
            if (action.actionType == 'callbiz') {
                newState.searchRequestsScreen.callBizDeleteIndex = action.rowIndex;
            } else if (action.actionType == 'doc') {
                newState.searchRequestsScreen.documentDeleteIndex = action.rowIndex;
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.CLOSE_CONFIRM_DIALOG :
            var newState = {...state};
            newState.searchRequestsScreen.modalHeaderText = '';
            newState.searchRequestsScreen.modalContentText = '';
            newState.searchRequestsScreen.showConfirmDialog = false;
            newState.searchRequestsScreen.callBizDeleteIndex = -1;
            newState.searchRequestsScreen.documentDeleteIndex = -1;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SHOW_ADD_CALLBIZ_TO_REQUEST_SCREEN:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.addingNewCallbiz = true;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SHOW_ADD_ACTION_TO_REQUEST_SCREEN:
            var newState = {...state};
            newState.searchRequestsScreen.addingNewAction = true;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.HIDE_ADD_CALLBIZ_TO_REQUEST_SCREEN:
            var newState = {...state};
            newState.searchRequestsScreen.addingNewCallbiz = false;
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newCallbizDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newCallbizDetails.ID = '';
            newState.searchRequestsScreen.newCallbizDetails.details = '';
            newState.searchRequestsScreen.newCallbizDetails.datetime = (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds);
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.HIDE_ADD_ACTION_TO_REQUEST_SCREEN:
            var newState = {...state};
            newState.searchRequestsScreen.addingNewAction = false;
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.conversationWith = '';
            newState.searchRequestsScreen.newActionDetails.details = '';
            newState.searchRequestsScreen.newActionDetails.target_date = (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds);
            newState.searchRequestsScreen.newActionDetails.action_type = '';
            newState.searchRequestsScreen.newActionDetails.action_topic = '';
            newState.searchRequestsScreen.newActionDetails.action_direction = '';
            newState.searchRequestsScreen.newActionDetails.action_status = '';
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_TYPE_ADDED:
            var newState = {...state};
            newState.searchRequestsScreen = {...newState.searchRequestsScreen};
            newState.searchRequestsScreen.operationList.push(action.newActionRecord);
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_OPERATION_CONVERSATION_WITH_CHANGED:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.conversationWith = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DETAILS_CHANGED:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.details = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DATE_CHANGED:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.target_date = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_ID_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newCallbizDetails = {...state.searchRequestsScreen.newCallbizDetails};
            newState.searchRequestsScreen.newCallbizDetails.ID = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newCallbizDetails = {...state.searchRequestsScreen.newCallbizDetails};
            newState.searchRequestsScreen.newCallbizDetails.datetime = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DETAILS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newCallbizDetails = {...state.searchRequestsScreen.newCallbizDetails};
            newState.searchRequestsScreen.newCallbizDetails.details = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TYPE_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.actionTypesList = action.actionTypesList;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_TOPICS_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.actionTopicsList = action.actionTopicsList;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_ACTION_TYPE_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.action_type = action.actionType;
            newState.searchRequestsScreen.newActionDetails.action_topic = '';
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_ACTION_TOPIC_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.action_topic = action.actionTopic;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SEARCH_REQUEST_ACTION_STATUSES_END:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.actionStatusesList = action.actionStatusesList;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_ACTION_STATUS_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.action_status = action.actionStatus;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.NEW_ACTION_DIRECTION_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            newState.searchRequestsScreen.newActionDetails.action_direction = action.actionDirection;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.MISSING_REQUEST:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.newActionDetails = {...state.searchRequestsScreen.newActionDetails};
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.DELETED_CALLBIZ_ROW:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = action.data;
            for (let i = 0; i < newState.searchRequestsScreen.callBizList.length; i++) {
                let old_val = newState.searchRequestsScreen.callBizList[i].callBizCenterDate;
                let arr1 = old_val.split(' ');
                let arr2 = arr1[0].split('-');
                newState.searchRequestsScreen.callBizList[i].callBizCenterDate = arr2[2] + '/' + arr2[1] + '/' + arr2[0] + ' ' + arr1[1];
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_EDITING:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.editingCallbizRow = action.newValue;
            newState.searchRequestsScreen.callBizList = [...state.searchRequestsScreen.callBizList];
            newState.searchRequestsScreen.callBizList[action.theIndex].is_editing = action.newValue;
            newState.searchRequestsScreen.callBizEditIndex = action.theIndex;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SAVED_CALLBIZ_ROW:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = action.data;
            newState.searchRequestsScreen.callBizEditIndex = -1;
            newState.searchRequestsScreen.editingCallbizRow = false;
            newState.searchRequestsScreen.callBizList = action.data;
            for (let i = 0; i < newState.searchRequestsScreen.callBizList.length; i++) {
                let old_val = newState.searchRequestsScreen.callBizList[i].callBizCenterDate;
                let arr1 = old_val.split(' ');
                let arr2 = arr1[0].split('-');
                newState.searchRequestsScreen.callBizList[i].callBizCenterDate = arr2[2] + '/' + arr2[1] + '/' + arr2[0] + ' ' + arr1[1];
            }
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_ID:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [...state.searchRequestsScreen.callBizList];
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterKey = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.PERSONAL_ID_CHANGE:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.personalIdentity = action.data;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_DATETIME:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [...state.searchRequestsScreen.callBizList];
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterDate = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.SET_CALLBIZ_DETAILS:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [...state.searchRequestsScreen.callBizList];
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterDetails = action.newValue;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.UNDO_EDIT_CALLBIZ:
            var newState = {...state};
            newState.searchRequestsScreen.editingCallbizRow = false;
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = [...state.searchRequestsScreen.callBizList];
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterKey = action.oldBizID;
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterDate = action.oldBizDateTime;
            newState.searchRequestsScreen.callBizList[action.theIndex].callBizCenterDetails = action.oldBizDetails;
            newState.searchRequestsScreen.callBizEditIndex = -1;
            return newState;
            break;
        case CrmActions.ActionTypes.REQUEST.ADDED_CALLBIZ_ROW:
            var newState = {...state};
            newState.searchRequestsScreen = {...state.searchRequestsScreen};
            newState.searchRequestsScreen.callBizList = action.data;
            for (let i = 0; i < newState.searchRequestsScreen.callBizList.length; i++) {
                let old_val = newState.searchRequestsScreen.callBizList[i].callBizCenterDate;
                let arr1 = old_val.split(' ');
                let arr2 = arr1[0].split('-');
                newState.searchRequestsScreen.callBizList[i].callBizCenterDate = arr2[2] + '/' + arr2[1] + '/' + arr2[0] + ' ' + arr1[1];
            }
            newState.searchRequestsScreen.addingNewCallbiz = false;
            newState.searchRequestsScreen.newCallbizDetails = {...state.searchRequestsScreen.newCallbizDetails};
            newState.searchRequestsScreen.newCallbizDetails.ID = '';
            newState.searchRequestsScreen.newCallbizDetails.datetime = (dd + '/' + mm + '/' + yyyy) + ' ' + (hour + ':' + minutes + ':' + seconds);
            newState.searchRequestsScreen.newCallbizDetails.details = '';
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_CITIES:
            var newState = {...state};
            newState.requestSearch.lists.cities = action.list.sort(arraySort('asc', 'city_name'));
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_TEAMS:
            var newState = {...state};
            newState.requestSearch.lists.teams = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_ROLE_TEAMS:
            var newState = {...state};
            newState.requestSearch.lists.currentUserRoleTeams = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_TOPICS:
            var newState = {...state};
            var topics = [], subTopics = [];
            for (var i = 0; i < action.list.length; i++) {
                if (0 == action.list[i].parent_id) {
                    topics.push(action.list[i]);
                } else {
                    subTopics.push(action.list[i]);
                }
            }

            topics.sort(arraySort('asc', 'topic_order'));
            subTopics.sort(arraySort('asc', 'topic_order'));
            newState.requestSearch.lists.topics = topics;
            newState.requestSearch.lists.subTopics = subTopics;
            newState.requestSearch.lists.fullSubTopics = subTopics;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_PRIORITY:
            var newState = {...state};
            newState.requestSearch.lists.priority = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_STATUS:
            var newState = {...state};
            newState.requestSearch.lists.status = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_STATUS_TYPE:
            var newState = {...state};
            newState.requestSearch.lists.statusType = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_USERS:
            var newState = {...state};
            newState.requestSearch.lists.allUsers = action.list;
            newState.requestSearch.lists.users = _.uniqBy(action.list, 'key');
            newState.requestSearch.lists.teamsUsers = _.uniqBy(action.list, 'key');
            return newState;
            break;
        case CrmActions.ActionTypes.LISTS.LOADED_ACTION_TYPES:
            var newState = {...state};
            newState.requestSearch.lists.actionTypes = action.list;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.COMBO_VALUE_UPDATED:
            var newState = {...state};
            var comboFilters = {...newState.requestSearch.comboFilters};
            comboFilters[action.filterName] = action.value;
            newState.requestSearch.comboFilters = comboFilters;
            newState.requestSearch.isThereFiltersExist = true;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.FILTER_VALUE_UPDATED:
            var newState = {...state};
            var searchFilters = {...newState.requestSearch.searchFilters};
            searchFilters[action.filterName] = action.value;
            newState.requestSearch.searchFilters = searchFilters;
            newState.requestSearch.isThereFiltersExist = true;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.UPDATE_SUB_TOPICS_LIST:
            var newState = {...state};
            var subTopics = newState.requestSearch.lists.fullSubTopics;
            var searchFiltersSubTopics = newState.requestSearch.searchFilters.subTopics;
            if (newState.requestSearch.searchFilters.topics.length) {
                var parentIds = [];
                subTopics = [];
                for (var i = 0; i < newState.requestSearch.searchFilters.topics.length; i++) {
                    parentIds.push(newState.requestSearch.searchFilters.topics[i].id);
                }

                for (var i = 0; i < newState.requestSearch.lists.fullSubTopics.length; i++) {
                    var parentId = newState.requestSearch.lists.fullSubTopics[i].parent_id;
                    if (parentIds.indexOf(parentId) > -1) {
                        subTopics.push(newState.requestSearch.lists.fullSubTopics[i]);
                    }
                }

                for (var i = 0; i < searchFiltersSubTopics.length; i++) {
                    var parentId = newState.requestSearch.lists.subTopics[i].parent_id;
                    if (parentIds.indexOf(parentId) == -1) {
                        searchFiltersSubTopics.splice(i, 1);
                    }
                }
            }

            subTopics.sort(arraySort('asc', 'topic_order'));
            newState.requestSearch.lists.subTopics = subTopics;
            newState.requestSearch.searchFilters.subTopics = searchFiltersSubTopics;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.UPDATE_TEAM_USERS_LIST:
            var newState = {...state};
            var users = newState.requestSearch.lists.allUsers;
            if (newState.requestSearch.searchFilters.handlerTeam.length) {
                var handlerUser = [...newState.requestSearch.searchFilters.handlerUser];
                var creatorUser = [...newState.requestSearch.searchFilters.creatorUser];
                var teamKeys = [];
                users = [];
                for (var i = 0; i < newState.requestSearch.searchFilters.handlerTeam.length; i++) {
                    teamKeys.push(newState.requestSearch.searchFilters.handlerTeam[i].key);
                }

                for (var i = 0; i < newState.requestSearch.lists.allUsers.length; i++) {
                    var teamKey = newState.requestSearch.lists.allUsers[i].team_key;
                    if (teamKeys.indexOf(teamKey) > -1) {
                        users.push(newState.requestSearch.lists.allUsers[i]);
                    }
                }

                for (var i = 0; i < handlerUser.length; i++) {
                    if (teamKeys.indexOf(handlerUser[i].team_key) == -1) {
                        handlerUser.splice(i, 1);
                    }
                }

                for (var i = 0; i < creatorUser.length; i++) {
                    if (teamKeys.indexOf(creatorUser[i].team_key) == -1) {
                        creatorUser.splice(i, 1);
                    }
                }

                newState.requestSearch.searchFilters.handlerUser = handlerUser;
                newState.requestSearch.searchFilters.creatorUser = creatorUser;
            }

            newState.requestSearch.lists.teamsUsers = _.uniqBy(users, 'key');
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.CONTAINER_COLLAPSE_TOGGLE:
            var newState = {...state};
            var collapseStatus = {...newState.requestSearch.collapseStatus};
            collapseStatus[action.container] = !collapseStatus[action.container];
            newState.requestSearch.collapseStatus = collapseStatus;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.UPDATE_DATE_VALUE:
            var newState = {...state};
            var searchFilters = {...newState.requestSearch.searchFilters};
            let isDateFilterExist = false;
            const dateField = ['fromRequestDate', 'toRequestDate', 'fromCreateDate', 'toCreateDate', 'fromCloseDate', 'toCloseDate', 'inDate'];
            for (let field of dateField) {
                if (searchFilters[field] != '') {
                    isDateFilterExist = true;
                    break;
                }
            }

            newState.requestSearch.isDateFilterExist = isDateFilterExist;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.RESET_FILTERS:
            var newState = {...state};
            var searchFilters = {...newState.requestSearch.searchFilters};
            var comboFilters = {...newState.requestSearch.comboFilters};

            _.forEach(comboFilters, function (value, key) {
                comboFilters[key] = '';
            });
            searchFilters = emptySearchFilters;
            newState.requestSearch.searchFilters = searchFilters;
            newState.requestSearch.lists.selectedVoters = [];
            newState.requestSearch.isThereFiltersExist = false;
            newState.requestSearch.isFiltersHasErrors = false;
            newState.requestSearch.isSearchButtonPressed = false;
            newState.requestSearch.errorMessage = '';
            newState.requestSearch.searchResults = [];

            newState.requestSearch.comboFilters = comboFilters;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.STARTED:
            var newState = {...state};
            newState.requestSearch.isFiltersHasErrors = action.isFiltersHasErrors;
            newState.requestSearch.isThereFiltersExist = action.isThereFiltersExist;
            newState.requestSearch.errorMessage = '';
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.REQUEST_RESULTS_RECEIVED:
            let newState = {...state};
            let requestSearch = {...newState.requestSearch};

            requestSearch.clearedSerachFilters = action.searchFilters;
            requestSearch.searchResults = action.list;
            newState.requestSearch = requestSearch;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.UPDATE_ERROR_MESSAGE:
            var newState = {...state};
            newState.requestSearch.errorMessage = action.errorMessage;
            newState.requestSearch.isFiltersHasErrors = action.isFiltersHasErrors;
            newState.requestSearch.isThereFiltersExist = action.isThereFiltersExist;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.BUTTON_PRESSED:
            var newState = {...state};
            newState.requestSearch.isSearchButtonPressed = true;
            newState.requestSearch.searchResults = [];
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.NEW_USER_SELECTED:
            var newState = {...state};
            if (!_.isEmpty(action.selectedVoter)) {
                var selectedVoters = [...newState.requestSearch.lists.selectedVoters];
                var filtersSelectedVoters = [...newState.requestSearch.searchFilters.voterRequests];
                selectedVoters.push(action.selectedVoter);
                filtersSelectedVoters.push(action.selectedVoter);
                selectedVoters = _.uniqBy(selectedVoters, 'key');
                filtersSelectedVoters = _.uniqBy(filtersSelectedVoters, 'key');
                newState.requestSearch.lists.selectedVoters = selectedVoters;
                newState.requestSearch.searchFilters.voterRequests = filtersSelectedVoters;
                newState.requestSearch.isThereFiltersExist = true;
            }

            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.ORDER_RESULTS:
            var newState = {...state};
            var searchResults = [...newState.requestSearch.searchResults];
            newState.requestSearch.resultsOrderColumn = action.orderColumn || 'request_date';
            var sortDirection = newState.requestSearch.isResultsOrderedAsc ? 'asc' : 'desc';
            searchResults.sort(arraySort(sortDirection, newState.requestSearch.resultsOrderColumn));
            newState.requestSearch.searchResults = searchResults;
            newState.requestSearch.isResultsOrderedAsc = !newState.requestSearch.isResultsOrderedAsc;
            return newState;
            break;
        case CrmActions.ActionTypes.SEARCH.TABLE_CONTENT_UPDATED:
            var newState = {...state};
            newState.requestSearch.tableHasScrollbar = action.hasScrollbar;
            return newState;
            break;
        case CrmActions.ActionTypes.UNKNOWN_VOTER.CHANGE_DATA_ITEM_VALUE :
            var newState = {...state};
            newState.addUnknownVoterScreen = {...newState.addUnknownVoterScreen};
            newState.addUnknownVoterScreen[action.theKey] = action.theValue;
            return newState;
            break;
        default:
            return state;
            break;
}
}

export default crmReducer;
