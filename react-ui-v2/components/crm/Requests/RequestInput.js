import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
/**/
import Combo from '../../global/Combo';
import * as SystemActions from '../../../actions/SystemActions';
import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import constants from '../../../libs/constants';
import ModalWindow from '../../global/ModalWindow';
import ModalRequestSourceFax from '../../global/ModalRequestSourceFax';
import ModalRequestSourceEmail from '../../global/ModalRequestSourceEmail';
import ModalRequestSourceCallBiz from '../../global/ModalRequestSourceCallBiz';
import ModalRequestSourceOther from '../../global/ModalRequestSourceOther';
import ModalRequestSourceInfo from '../../global/ModalRequestSourceInfo';
import ModalTransferRequest from '../../global/ModalTransferRequest';
import ModalCloseRequest from '../../global/ModalCloseRequest';
import ModalCancelRequest from '../../global/ModalCancelRequest';
import AddEditActionModal from '../../global/AddEditActionModal';
import  '../../../css/modal.css'

import { validateEmail, parseDateToPicker, parseDateFromPicker, validatePhoneNumber } from '../../../libs/globalFunctions';


import moment from 'moment';

import { dateTimeReversePrint, getCurrentFormattedDateTime, currentDateInDbFormat, currentDateInRegularFormat } from '../../../libs/globalFunctions';
import { UnknownVoterDto } from '../../../Models/UnknownVoterDto';

class RequestInput extends React.Component {
    constructor(props) {
        super(props);

        momentLocalizer(moment);
        this.styleIgniter();
        this.textIgniter();
        this.state = {
            isMunicipalCityUser: this.isUserCityMunicipal(props),
			updatedSavedRequest:{},
            recheckUserHandler: false , 
            currentTeamHandler: null,
            crmDefaultTeam: null,
			buttons: [
				 {
                    class: 'btn btn-primary',
                    text: 'אישור',
                    action: this.updateNewEmail.bind(this),
                    disabled: false
                }, 
				{
                    class: 'btn btn-primary',
                    text: 'צור ללא אימייל',
                    action: this.createWithoutEmail.bind(this),
                    disabled: false
                },
				
                {
                    class: 'btn btn-secondary pull-left',
                    text: 'סגור',
                    action: this.cancelCreateEmailDialog.bind(this),
                    disabled: false
                }
               
            ],
            display_unknown_voter_data:false
        }
    }

    isUserCityMunicipal(props){
        let isMunicipalCityUser = false;
        for(var i in props.currentUser.geographicFilters){
            let geoFilter = props.currentUser.geographicFilters[i];
            let entity_type = geoFilter.entity_type;
            if(entity_type == -1 || entity_type == 0){
                isMunicipalCityUser = false; break;
            }
            if(entity_type == 1 ){
                isMunicipalCityUser = true;
            }
        }
        return isMunicipalCityUser;
    }
    /*initing validation styles*/
    validatorStyleIgnitor() {
        this.validatorsStyle = {};

        let topicID = this.getTopicID(this.props.dataRequest.topic_name);
        if (this.props.dataRequest.topic_name == '' || topicID == '') {

            this.validatorsStyle.topicStyle = { borderColor: '#ff0000' };
            this.missingTopic = true;
        } else {

            this.validatorsStyle.topicStyle = { borderColor: '#cccccc' };
            this.missingTopic = false;
        }


        let subTopicID = this.getSubTopicID(topicID, this.props.dataRequest.sub_topic_name);

        if (this.props.dataRequest.sub_topic_name == '') {

            this.validatorsStyle.subTopicStyle = { borderColor: '#ff0000' };
            this.missingSubTopic = true;
        } else {
            this.validatorsStyle.subTopicStyle = { borderColor: '#cccccc' };
            this.missingSubTopic = false;
        }

        let statusID = this.getStatusID(this.props.dataRequest.status_name);
        if (this.props.dataRequest.status_name == '' || statusID == '') {
            this.validatorsStyle.statusStyle = { borderColor: '#ff0000' };
            this.missingStatus = true;
        } else {

            this.validatorsStyle.statusStyle = { borderColor: '#cccccc' };
            this.missingStatus = false;
        }

        let priorityID = this.getPriorityID(this.props.dataRequest.priority_name);
        if (this.props.dataRequest.priority_name == '') {
            this.validatorsStyle.priorityStyle = { borderColor: '#ff0000' };
            this.missingPriority = true;
        } else {

            this.validatorsStyle.priorityStyle = { borderColor: '#cccccc' };
            this.missingPriority = false;
        }

        let requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
        let dataRequestSourceSystemName = this.getRequestSourceSystemName(this.props.dataRequest.request_source_name);
        let originalDataRequestSourceSystemName = this.getRequestSourceSystemName(this.props.originalDataRequest.request_source_name);

        if (this.getRequestSourceID(this.props.dataRequest.request_source_name) == '') {
            this.validatorsStyle.requestSourceStyle = { borderColor: '#ff0000' };
            this.missingRequestSource = true;

        } /*else if (dataRequestSourceSystemName == 'fax' && originalDataRequestSourceSystemName != 'fax') {
            if (this.props.dataRequest.request_source_fax == '' ){
               this.missingRequestSourceDetails = true;  
            }else{
               this.missingRequestSourceDetails = false;
               this.missingRequestSource = false; 
            }
        } else if (dataRequestSourceSystemName == 'email' && originalDataRequestSourceSystemName != 'email') {
            if (this.props.dataRequest.request_source_email == '' ){
               this.missingRequestSourceDetails = true;  
            }else{
               this.missingRequestSourceDetails = false;
               this.missingRequestSource = false; 
            }
        } else if (dataRequestSourceSystemName == 'other' && originalDataRequestSourceSystemName != 'other') {
            if (this.props.dataRequest.request_source_first_name == ''  || this.props.dataRequest.request_source_phone == '' ){
               this.missingRequestSourceDetails = true;  
            }else{
               this.missingRequestSourceDetails = false;
               this.missingRequestSource = false; 
            }
        } else if (dataRequestSourceSystemName == 'callbiz' && originalDataRequestSourceSystemName != 'callbiz') {
            if (this.props.newCallbizDetails.ID == ''  || this.props.newCallbizDetails.details == '' || (this.props.newCallbizDetails.datetime == undefined || this.props.newCallbizDetails.datetime == '' || this.props.newCallbizDetails.datetime.length < 7)){
               this.missingRequestSourceDetails = true;  
            }else{
               this.missingRequestSourceDetails = false;
               this.missingRequestSource = false; 
            }
        }*/else {
            this.validatorsStyle.requestSourceStyle = { borderColor: '#cccccc' };
            this.missingRequestSource = false;
            this.missingRequestSourceDetails = false;
        }


        //userID = this.getUserID(this.props.dataRequest.user_handler_name);

        let userID = this.getUserID(this.props.dataRequest.user_handler_name);
        if (userID == '' || this.props.dataRequest.user_handler_name == '') {
            this.validatorsStyle.userStyle = { borderColor: '#ff0000' };
            this.missingUser = true;
        } else {
            this.validatorsStyle.userStyle = { borderColor: '#cccccc' };
            this.missingUser = false;
        }


        let teamID = this.getTeamID(this.props.dataRequest.team_name);
        if (this.props.dataRequest.team_name == '' || teamID == '') {
            this.validatorsStyle.teamStyle = { borderColor: '#ff0000' };
            this.missingTeam = true;
        } else {

            this.validatorsStyle.teamStyle = { borderColor: '#cccccc' };
            this.missingTeam = false;
        }

        let target_close_date = this.props.dataRequest.target_close_date;
        let status_type_id = this.props.dataRequest.status_type_id;
        let targetCloseDateArrParts = target_close_date.split('/');
        if (target_close_date == undefined || target_close_date.trim() == '' || target_close_date.length < 7) {
            this.validatorsStyle.targetCloseDateStyle = { borderColor: '#ff0000' };
            this.wrongTargetCloseDate = true;
        } else if (target_close_date.charAt(2) != '/' || target_close_date.charAt(5) != '/') {
            this.validatorsStyle.targetCloseDateStyle = { borderColor: '#ff0000' };
            this.wrongTargetCloseDate = true;
        } else {

            let date1 = new Date(targetCloseDateArrParts[2], targetCloseDateArrParts[1] - 1, targetCloseDateArrParts[0]);
            let date2 = new Date();

            if (date1.getTime() - date2.getTime() <= 23 * 60 * 60 * (-1000)) {
                this.validatorsStyle.targetCloseDateStyle = { borderColor: '#ff0000' };
                this.validatorsStyle.targetCloseDatePlainStyle = { color: '#ff0000', fontWeight: 'bold' }
                this.wrongTargetCloseDate = false;
            }
            else {
                this.validatorsStyle.targetCloseDateStyle = { borderColor: '#cccccc' };
                this.wrongTargetCloseDate = false;
            }
        }


        let date = dateTimeReversePrint(this.props.dataRequest.date);
        if (date == undefined || date.trim() == '' || date.length < 7) {
            this.validatorsStyle.dateStyle = { borderColor: '#ff0000' };
            this.wrongDate = true;
        } else if (date.charAt(2) != '/' || date.charAt(5) != '/') {
            this.validatorsStyle.dateStyle = { borderColor: '#ff0000' };
            this.wrongDate = true;
        } else {
            this.validatorsStyle.dateStyle = { borderColor: '#cccccc' };
            this.wrongDate = false;
        }

        if (this.props.router.params.reqKey == 'new' && this.props.dataRequest.first_desc.length < 5) {
            this.validatorsStyle.firstDescStyle = { borderColor: '#ff0000' };
            this.missingDesc = true;
        } else {
            this.validatorsStyle.firstDescStyle = { borderColor: '#cccccc' };
            this.missingDesc = false;
        }

        if (this.props.statusNotForEdit) {
            if (this.props.hasAdminEdit) {
                this.noPermissionMessage = '';
            } else {
                this.noPermissionMessage = 'אין למשתמש הרשאה לעריכת הפניה';
            }
        } else if (this.props.hasRequestEditingPermissions) {
            this.noPermissionMessage = '';
        } else {
            this.noPermissionMessage = 'אין למשתמש הרשאה לעריכת הפניה';
        }
    }

    initConstants() {
        this.imageIcoCallDoc = window.Laravel.baseURL + 'Images/ico-callDoc.svg';
        this.imageIcoForward = window.Laravel.baseURL + 'Images/ico-forward.svg';
        this.imageIcoCloseInqry = window.Laravel.baseURL + 'Images/ico-close-inqry.svg';
        this.imageIcoCancel = window.Laravel.baseURL + 'Images/ico-cancel.svg';
        this.imageIcoSourceInfo = window.Laravel.baseURL + 'Images/ico-direct-link.svg';
        this.entityTypes = {
            voter: 0,
            request: 1
        };
    }



    /*general function that closes all types of dialogues */
    closeModalDialog() {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CLOSE_MODAL_DIALOG });
    }

	componentWillUnmount(){
		let clearData = {
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
            
        };
		this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SEARCH_END, reqData: clearData});
		this.setState({updatedSavedRequest:{}});
	}
	
    componentWillMount() {
        //displays unauthorized screen if user has no permission
        if (!this.props.currentUser.admin && !this.props.currentUser.permissions['crm.requests'] && this.props.currentUser.first_name.length > 1) {
            this.props.router.replace('/unauthorized');
        }
        CrmActions.getAllRequestTopics(this.props.dispatch);
        CrmActions.getAllRequestsActionsTypes(this.props.dispatch, this.props.router, 1);  // 1 = entity_type - request
        CrmActions.getAllRequestsActionsStatuses(this.props.dispatch, this.props.router);
        CrmActions.getRequestActionTopicsByType(this.props.dispatch, null); // 1 = action_type - request
        CrmActions.getRequestStatuses(this.props.dispatch);
        CrmActions.getRequestPriorityByKey(this.props.dispatch, null);
        CrmActions.getRequestSourceByKey(this.props.dispatch, null);
        CrmActions.getRequestClosureReasonByKey(this.props.dispatch, null);
        SystemActions.loadMinimalTeams(this.props.dispatch, this.props.router, null, 1);
        this.setAddingUserText();
        if(this.state.isMunicipalCityUser){
            let topic = this.getTopic('municipally', 'system_name');
            if(topic){ 
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TOPIC_CHANGE, topicName: topic.name });
                CrmActions.getRequestSubTopicsByParentID(this.props.dispatch, topic.id);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.reqKey == 'new' && this.props.params.reqKey != 'new') {
            SystemActions.loadMinimalUsersForTeam(this.props.dispatch);
        }
        if ((this.props.dataRequest.team_name == '') && (nextProps.dataRequest.team_name != '')) {
            SystemActions.loadMinimalUsersForTeam(this.props.dispatch, nextProps.dataRequest.teamKey);
        }
		if (Object.keys(nextProps.updatedSavedRequest).length > 0 && nextProps.updatedSavedRequest != this.props.updatedSavedRequest) {
           this.setState({updatedSavedRequest:nextProps.updatedSavedRequest});
        }

        if (this.props.params.reqKey == 'new' && !_.isEqual(this.props.users, nextProps.users)) {
            this.checkExistUserInTeam(nextProps.users);
        }

        
        let optionalTeamsChange = JSON.stringify(this.props.teams) != JSON.stringify(nextProps.teams)
        
        if(this.state.currentTeamHandler && optionalTeamsChange){ 
            let currentTeam = nextProps.teams.find(team => { return team.id == this.state.currentTeamHandler.id;})
            if(currentTeam){
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE, teamHandlerName: this.state.currentTeamHandler.name, teamHandlerKey: this.state.currentTeamHandler.key });
            }
        }
        // console.log(this.props.teams.length == 0 && nextProps.teams.length);
        if(!this.state.crmDefaultTeam &&  nextProps.teams.length > 0){
            let crmDefaultTeam = nextProps.teams.find((item) =>{ return item.crm_center == 1; })
            this.setState({crmDefaultTeam});
        }
    }

    componentDidUpdate() {

        //    this.renderTeam();
        //    this.renderUser();

        if (this.props.router.params.reqKey == 'new') {
            if (this.userCounter == undefined) {
                if (this.props.addUnknownVoterScreen.key == '') {
                    //here comes the code that checks only for existing voter if he created already in specific time , 
                    //and if yes , then it will show him a modal dialog : 
                    if (this.props.oldVoterDetails != undefined) {
                        if (this.props.oldVoterDetails.lastCrmRequestDateTime != null) {
                            let dateTimeParts = this.props.oldVoterDetails.lastCrmRequestDateTime.split(' ');
                            let dateOnly = dateTimeParts[0].split('-');
                            let timeOnly = dateTimeParts[1].split(':');

                            let lastDate = new Date(parseInt(dateOnly[0]), parseInt(dateOnly[1]) - 1, parseInt(dateOnly[2]), parseInt(timeOnly[0]), parseInt(timeOnly[1]), parseInt(timeOnly[2]), 0);
                            let nowDate = new Date();
                            nowDate.setMilliseconds(0);
                            let timePassed = nowDate.getTime() - lastDate.getTime();


                            let MINIMAL_TIME_IN_DAYS = this.props.systemSettings.minimum_days_between_requests;

                            let timePassedInDays = (timePassed / (1000 * 60 * 60 * 24));
                            if (timePassedInDays < MINIMAL_TIME_IN_DAYS) {
                                //console.log("minimal time didn't passed - show modal dialog");
                                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.SET_MODAL_DISPLAY_DELAY_TIME_SHOW, data: true });
                            }
                            else {

                            }
                        }
                    }
                }
                this.userCounter = '1';
                //this.updatedUser = 0;
                // console.log(this.props.currentTeams);
                //* No need to set current user has request user handler!
                /*
                
                let teamsList = this.props.currentTeams;
                if (teamsList.length > 0) {
                    if (this.props.router.params.reqKey == 'new') {
                        let team_name = '';
                        let team_key = '';
                        if (teamsList.length == 1) {
                            team_name = teamsList[0].team_name;
                            team_key = teamsList[0].team_key;
                        } else {
                            for (let i = 0, len = teamsList.length; i < len; i++) {
                                if (teamsList[i].main == 1) {
                                    team_name = teamsList[i].team_name;
                                    team_key = teamsList[i].team_key;
                                    break;
                                }
                            }
                        }
                        // console.log(team_key, team_name);
                        this.props.dispatch({
                            type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE,
                            teamHandlerName: team_name, teamHandlerKey: team_key
                        });
                    }

                }
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE, userHandlerName: this.props.currentUser.first_name + ' ' + this.props.currentUser.last_name, users: this.props.users });
                */
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.PRIORITY_CHANGE, data: 'רגילה' });
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.DATE_CHANGE, reqDate: currentDateInRegularFormat() });
            }
        } else {
            if (this.OriginalStatusName == undefined && this.props.dataRequest.status_name != '') {
                this.OriginalStatusName = this.props.dataRequest.status_name;

            }
        }

        this.setAddingUserText();
        if (this.props.dataRequest.voter_id != undefined && this.props.dataRequest.voter_id != '' && this.props.dataRequest.voter_id != '0' && this.counter == undefined) {
            this.counter = 1;

            //VoterActions.getVoterByKey(this.props.dispatch, this.props.dataRequest.voter_key, false, false);

        } else if (this.props.selectedVoterForRedirect.voters_key != undefined && this.props.dataRequest.voter_id!='' && this.props.dataRequest.voter_id != '0' && this.counter == undefined) {
            this.counter = 1;
            VoterActions.getVoterByKey(this.props.dispatch, this.props.selectedVoterForRedirect.voters_key, false, false, this.props.router);
            this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
        } else if (this.props.dataRequest.unknown_voter_id != undefined && this.props.dataRequest.unknown_voter_id != '' && this.props.dataRequest.unknown_voter_id != '0' && this.counterVoter == undefined) {
            this.counterVoter = 1;

            //  VoterActions.getTempVoterByID(this.props.dispatch, this.props.dataRequest.temp_voter_id);
        }
        if (this.props.dataRequest.user_handler_name != '' && this.firstTeamsLoadCounter == undefined && this.props.users.length > 0) {
            this.firstTeamsLoadCounter = 1;
            let counter = 0;
            this.old_topic_name = this.props.dataRequest.topic_name;
            this.old_sub_topic_name = this.props.dataRequest.sub_topic_name;
            this.old_status_type_name = this.props.dataRequest.status_type_name;
            this.old_status_name = this.props.dataRequest.status_name;
            this.old_user_handler_name = this.props.dataRequest.user_handler_name;
            this.old_team_name = this.props.dataRequest.team_name;
            this.old_priority_name = this.props.dataRequest.priority_name;
            this.old_source_name = this.props.dataRequest.source_name;

            for (let i = 0, len = this.props.users.length; i < len; i++) {
                if (this.props.users[i].first_name == this.props.dataRequest.user_handler_name) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.LOAD_FIRST_TEAMS, teams: this.props.users[i].teams });
                    counter++;
                    break;
                }
            }
            if (counter == 0) {
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.LOAD_FIRST_TEAMS, teams: [] });
            }
        }


    }

    /**
     * Let's set here the large and frequently used styles.
     * Kind of CSS.
     */
    styleIgniter() {
        this.colWrapperStyle = { padding: '0', lineHeight: '14px' };
        this.inputGroupHeightStyle = { height: '20px' };
        this.labelPaddingStyle = { padding: '0 5px', lineHeight: '14px' };

        this.label0Style = { padding: '0 5px', minWidth: '82px', textAlign: 'right', lineHeight: '14px', height: '14px', fontWeight: '600' };
        this.label1Style = { padding: '0 5px', minWidth: '102px', textAlign: 'right', lineHeight: '14px', height: '14px', fontWeight: '600' };
        this.label2Style = { padding: '0 5px', minWidth: '120px', textAlign: 'right', lineHeight: '14px', height: '14px', fontWeight: '600' };

        this.inputStyle = { padding: '2px 5px' };
        this.purePointerStyle = { cursor: 'pointer', };
        this.cleanReminderStyle = { height: '20px', paddingTop: '8px', cursor: 'pointer', };
    }

    textIgniter() {
        this.cleanReminderTitle = 'בטל תזכורת';
    }

    requestKeyOnChange(e) {
        //this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.KEY_CHANGE, reqKey: e.target.value});
    }

    requestDateOnChange(e) {
        //this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.KEY_CHANGE, reqDate: e.target.value});
    }

    requestCreatorOnChange(e) {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CREATOR_CHANGE, reqUserCreateName: e.target.value });
    }

    requestCreatedAtOnChange(e) {
        // this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CREATION_DATE_CHANGE, createdAt: e.target.value});
    }

    requestUpdaterOnChange(e) {
        //  this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CREATOR_CHANGE, reqUserUpdateId: e.target.value});
    }

    requestUpdatedAtOnChange(e) {
        //  this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.UPDATE_DATE_CHANGE, updatedAt: e.target.value});
    }

    openRequestSourceInfoModal() {
        if (this.props.hasRequestEditingPermissions == true) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_INFO_MODAL });
        }
    }

    /* This function returns topic id by topic name */
    getTopic(topicName, fieldName = 'name') {
        let returnedValue = null;
        for (let i = 0, len = this.props.topicList.length; i < len; i++) {
            if ((this.props.topicList[i][fieldName]) == topicName) {
                returnedValue = this.props.topicList[i];
                break;
            }
        }
        return returnedValue;
    }
    getTopicID(topicName){
      let topic = this.getTopic(topicName);
      return topic ? topic.id : '';
    }
    /* This function returns sub-topic id by sub-topic name */
    getSubTopic(topicID, subTopicName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.subTopicList.length; i < len; i++) {
            if ((this.props.subTopicList[i].parent_id == topicID) && (this.props.subTopicList[i].name) == subTopicName) {
                returnedValue = this.props.subTopicList[i];
                break;
            }
        }
        return returnedValue;
    }
    getSubTopicID(topicID, subTopicName){
        let subTopic = this.getSubTopic(topicID, subTopicName);
        return subTopic ? subTopic.id : '';
    }
    /* This function returns status id by status name and status-type id */
    getStatusID(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.statusList.length; i < len; i++) {
            if (this.props.statusList[i].name == StatusName) {
                returnedValue = this.props.statusList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    /* This function returns status id by status name and status-type id */
    getStatusPos(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.statusList.length; i < len; i++) {
            if (this.props.statusList[i].name == StatusName) {
                returnedValue = i;
                break;
            }
        }
        return returnedValue;
    }

    /* This function returns status id by status name and status-type id */
    getStatusTypeName(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.statusList.length; i < len; i++) {
            if (this.props.statusList[i].name == StatusName) {
                returnedValue = this.props.statusList[i].status_type_name;
                break;
            }
        }
        return returnedValue;
    }

    /* This function returns priority id by priority name */
    getPriorityID(priorityName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.priorityList.length; i < len; i++) {
            if ((this.props.priorityList[i].name) == priorityName) {
                returnedValue = this.props.priorityList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    /* This function returns request source id by request source name */
    getRequestSourceID(requestSourceName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.requestSourceList.length; i < len; i++) {
            if ((this.props.requestSourceList[i].name) == requestSourceName) {
                returnedValue = this.props.requestSourceList[i].id;
                break;
            }
        }
        return returnedValue;
    }
    getRequestSourceSystemName(requestSourceName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.requestSourceList.length; i < len; i++) {
            if ((this.props.requestSourceList[i].name) == requestSourceName) {
                returnedValue = this.props.requestSourceList[i].system_name;
                break;
            }
        }
        return returnedValue;
    }

    /* This function returns user hanler id by user full name */
    getUserID(fullName) {
        let returnedValue = "";

        for (let i = 0, len = this.props.users.length; i < len; i++) {
            if ((this.props.users[i].name) == fullName) {
                returnedValue = this.props.users[i].id;
                break;
            }
        }

        return returnedValue;
    }

    setTeamsByNameParentTopic(topicName){
        let team = null;
        let topic = this.getTopic(topicName);
        
        if(topic && topic.team_handler_id){
            team = this.getTeam(topic.team_handler_id, 'id');
        }

        let muniTopic = this.getTopic('municipally', 'system_name');
        let crm_team_id = this.props.voterDetails.crm_team_id;

        if(topic &&  crm_team_id && muniTopic && topic.id == muniTopic.id){
            team = this.getTeam( crm_team_id, 'id');
        }

        if(!team && this.state.crmDefaultTeam){ team = this.state.crmDefaultTeam; } 
        
        if(team){
            this.changeHandleTeam(team, team.name)
        }
            
        else if(this.state.crmDefaultTeam){
                this.changeHandleTeam(this.state.crmDefaultTeam, this.state.crmDefaultTeam.name, true);
        }

    }
    topicOnChange(e) {
        if (this.props.hasRequestEditingPermissions) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            this.props.dataRequest.sub_topic_name = '';
            let topicName = e.target.value;

            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TOPIC_CHANGE, topicName: topicName });
            if (topicName != '') {
                this.setTeamsByNameParentTopic(topicName);
                let topic = this.getTopic(topicName);
                let topicID = topic ? topic.id : -1; 

                CrmActions.getRequestSubTopicsByParentID(this.props.dispatch, topicID);
                
            } else {
                CrmActions.getRequestSubTopicsByParentID(this.props.dispatch, -1);
            }
            SystemActions.loadMinimalTeams(this.props.dispatch, this.props.router, null, 1);
        }
    }

    subTopicOnChange(e) {
            if (this.props.hasRequestEditingPermissions) {
                this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
                let subTopicName = e.target.value;
    
                this.changeUserHandlerAfterChangeSubTopic(subTopicName);
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.SUB_TOPIC_CHANGE, subTopicName: subTopicName });
            }
    }

    /**
     * Topic status.
     */
    statusOnChange(e) {
        if (this.props.hasRequestEditingPermissions || this.props.currentUser.admin) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            let statusName = e.target.value;
            let statusTypeName = this.getStatusTypeName(statusName);

            //let statusTypeName =
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.STATUS_CHANGE, data: statusName, statusTypeName: statusTypeName });
        }
    }

    statusTypeOnChange(e) {

        let statusType = e.target.value;
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.STATUS_TYPE_CHANGE, data: statusType });
        CrmActions.getRequestStatuses(this.props.dispatch);
    }

    /**
     * Topic priority.
     */
    priorityOnChange(e) {

        if (this.props.hasRequestEditingPermissions) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.PRIORITY_CHANGE, data: e.target.value });
        }
    }

    requestSourceOnChange(e) {

        if (this.props.hasRequestEditingPermissions) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE, data: e.target.value });
            if (e.target.selectedItem) {
                let selectedItem = e.target.selectedItem;
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_ID_CHANGE, data: selectedItem.id });
                if (selectedItem.system_name == "fax" && (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new')) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_FAX_MODAL });
                } else if (selectedItem.system_name == "fax" && this.props.originalDataRequest.request_source_id != selectedItem.id) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_FAX_MODAL });
                }
                if (selectedItem.system_name == "email" && (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new')) {
                    let voterEmail = (this.voterHasEmail()) ? this.getVoterEmail() : '';
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_EMAIL_MODAL, voterEmail: voterEmail });
                } else if (selectedItem.system_name == "email" && this.props.originalDataRequest.request_source_id != selectedItem.id) {
                    let voterEmail = (this.voterHasEmail()) ? this.getVoterEmail() : '';
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_EMAIL_MODAL, voterEmail: voterEmail });
                }
                if (selectedItem.system_name == "other" && (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new')) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_OTHER_MODAL });
                } else if (selectedItem.system_name == "other" && this.props.originalDataRequest.request_source_id != selectedItem.id) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_OTHER_MODAL });
                }
                if (selectedItem.system_name == "callbiz" && (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new')) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_CALLBIZ_MODAL });
                } else if (selectedItem.system_name == "callbiz" && this.props.originalDataRequest.request_source_id != selectedItem.id) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_REQUEST_SOURCE_CALLBIZ_MODAL });
                }
            }
        }
    }
    checkExistUserInTeam(newUsersList) {
        let userExit = false;
        let currentUserId = this.props.dataRequest.user_handler_id;
        newUsersList.forEach(function (user) {
            if (user.id === currentUserId) {
                userExit = true;
            }
        });
        if (!userExit) {
            this.missingUser
            // this.props.dispatch({
            //     type: CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE,
            //     userHandlerName: '', userHandlerId: -1, users: this.props.users
            // });
        }

    }

    changeUserHandlerAfterChangeSubTopic(subTopicName){
        let topicID = this.getTopicID(this.props.dataRequest.topic_name);
        let currentSubTopic = this.getSubTopic(topicID, subTopicName);
        let user_handler_id = null;
        let userHandler =null;
        if(!currentSubTopic.city_id){
            user_handler_id = currentSubTopic.user_handler_id;
        } else {
            let voterCityId = this.props.voterDetails.city_id
            user_handler_id = currentSubTopic.users_handler_by_city[voterCityId];
        }
        if (user_handler_id)
          userHandler = this.props.users.find((item) => {
            return item.id == user_handler_id;
          });

        if (!userHandler)
          userHandler = this.props.staticUsers.find((item) => {
            return item.id == user_handler_id;
          }); 
          
        if(userHandler && typeof(userHandler) !='undefined'){
           let userName = `${userHandler.first_name} ${userHandler.last_name}` ;


            this.onChangeUser(userHandler, userName);
            
            let currentTeam = this.props.staticTeams.find(team => {
                return team.key == userHandler.team_key;
            })

            if(currentTeam){
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE, teamHandlerName: currentTeam.name, teamHandlerKey: currentTeam.key});
                // this.props.dispatch({ type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: this.props.staticUsers });
            }else{
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE, teamHandlerName: '' });
                // this.props.dispatch({ type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: this.props.staticUsers });
            }
        } 
        else{
            this.setTeamsByNameParentTopic(this.props.dataRequest.topic_name);
        }

    }

    /**
     * do correlation with teamHandler
     * @param {*} e - on change event
     */
    userHandlerOnChange(e) {
        if (this.props.hasRequestEditingPermissions) {
            let selectedUser = e.target.selectedItem;
            this.onChangeUser(selectedUser, e.target.value);
        }
    }

    onChangeUser(selectedUser , userName){
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
        let userID = '';
        if (selectedUser) {
            userID = selectedUser.id;
            SystemActions.loadMinimalTeams(this.props.dispatch, this.props.router, selectedUser.key, 1);
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.LOADED_MINIMAL_TEAMS, teams: this.props.staticTeams, setStaticTeams: false });
            // SystemActions.loadMinimalTeams(this.props.dispatch, this.props.router, null, 1);
        }
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE, userHandlerName: userName, userHandlerId: userID, users: this.props.users });
    }


    /* This function returns handler team id by team name */
    getTeamID(teamName) {
        let team = this.getTeam(teamName);
        return team ? team.id: -1;
    }

    getTeam(fieldValue, fieldName = 'name'){
        let team=!this.props.staticTeams?this.props.teams:this.props.staticTeams;
        if(fieldValue && fieldValue!=''){
            return team.find((item) => {
                return item[fieldName] == fieldValue;
            })
        }

    }
    teamHandlerOnChange(e){
        let selectedTeam = e.target.selectedItem;
        let teamName = e.target.value
        this.changeHandleTeam(selectedTeam, teamName);
    }

    changeHandleTeam(selectedTeam, teamName, isDefaultTeam = false) {
        /*
         * do correlation with userHandler
         */
        if (this.props.hasRequestEditingPermissions) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE, teamHandlerName: teamName });
            if (selectedTeam) {
            //     this.props.dispatch({ type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: this.props.staticUsers });
                this.props.dispatch({ type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: [] });
            //     return;
            // } else {
                let teamKey = selectedTeam.key;
                
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.TEAM_HANDLER_CHANGE, teamHandlerName: teamName, teamHandlerKey: teamKey });
                SystemActions.loadMinimalUsersForTeam(this.props.dispatch, teamKey, true);

                let user_handler_name = selectedTeam.leader_id ? (selectedTeam.first_name + ' ' + selectedTeam.last_name) : '';
                let user_handler_id = selectedTeam.leader_id;
                
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE, userHandlerName: user_handler_name, userHandlerId: user_handler_id, users: this.props.users });
                if(!isDefaultTeam){
                    this.setState({currentTeamHandler: selectedTeam})
                }
            } else {
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.USER_HANDLER_CHANGE, userHandlerName: '', userHandlerId: null, users: [] });
                this.props.dispatch({ type: SystemActions.ActionTypes.LOADED_MINIMAL_TEAMS, teams: this.props.staticTeams, setStaticTeams: false });

                this.props.dispatch({ type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: [] });
            }
        }
        return false;    
    }

    closeDateOnChange(e) {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CLOSE_DATE_CHANGE, closeDate: e.target.value });
    }

    firstDescChange(e) {
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.FIRST_DESC_CHANGE, data: e.target.value });
    }

    estimatedCloseDateOnChange(value, format, filterName) {

        let selectedDateParts = value.split('-');
        if (this.props.hasRequestEditingPermissions) {
            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.ESTIMATED_CLOSE_DATE_CHANGE, estimatedCloseDate: (selectedDateParts[2] + '/' + selectedDateParts[1] + '/' + selectedDateParts[0]) });
        }

    }

    dateChange(value, filters) {

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'crm.requests.general' });
        let formattedValue = value.split(' ');
        let formattedValueDateOnly = formattedValue[0].split('-');
        let formattedValueTimeOnly = formattedValue[1];

        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.DATE_CHANGE, reqDate: (formattedValueDateOnly[2] + '/' + formattedValueDateOnly[1] + '/' + formattedValueDateOnly[0] + ' ' + formattedValueTimeOnly + ':00') });
    }

    /* Change add user button to loader while loading */
    setAddingUserText() {
        if (this.props.addingEditingRequest) {
            this.addButtonText = <i className="fa fa-spinner fa-spin"></i>
        } else {
            if (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new' || this.props.router.location.pathname == 'crm/requests/new')
                this.addButtonText = 'צור פנייה';
            else
                this.addButtonText = 'שמירה';
        }

        this.clearButtonText = 'נקה';
    }

    /*function that clears screen */
    clearForm(e) {

        this.props.router.push('crm/requests/');

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA
        });

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA });

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA });
        VoterActions.initVoterPhones(this.props.dispatch, this.props.voterDetails);

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'personal_identity',
            readOnlyValue: false
        });

        // Change fields last_name readOnly to false in component VoterDetails
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'last_name',
            readOnlyValue: false
        });

        // Change fields first_name readOnly to false in component VoterDetails
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'first_name',
            readOnlyValue: false
        });

        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.CLEAR_REQUEST_FORM
        });

        let currentFormattedDate = getCurrentFormattedDateTime(new Date());
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CLEAR_REQUEST_FORM, currentFormattedDate });
    }

    doSaveAction() {
        if (this.props.router.location.pathname == 'crm/requests/new' && this.props.addUnknownVoterScreen.key.length == 10) {
            let statusID = this.getStatusID(this.props.dataRequest.status_name);
            let requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
            let requestSourceFax = this.props.dataRequest.request_source_fax;
            let requestSourceEmail = this.props.dataRequest.request_source_Email;
            let requestSourcePhone = this.props.dataRequest.request_source_Phone;
            let requestSourceFirstName = this.props.dataRequest.request_source_first_name;
            let requestSourceLastName = this.props.dataRequest.request_source_last_name;
            let priorityID = this.getPriorityID(this.props.dataRequest.priority_name);
            let userID = this.getUserID(this.props.dataRequest.user_handler_name);
            let teamID = this.getTeamID(this.props.dataRequest.team_name);
            let topicID = this.getTopicID(this.props.dataRequest.topic_name);
            let targetCloseDate = this.props.dataRequest.target_close_date;
            let targetCloseDateArr = targetCloseDate.split(' ')[0];
            targetCloseDateArr = targetCloseDateArr.split('/');

            targetCloseDate = targetCloseDateArr[2] + '-' + targetCloseDateArr[1] + '-' + targetCloseDateArr[0] + ' 00:00:00';

            let requestDate = this.props.dataRequest.date;
            if (requestDate != null) {
                let requestDateParts = requestDate.split(' ');
                let requestDateArr = requestDateParts[0].split('/');
                let requestTime = requestDateParts[1];
                if (requestTime == undefined) {
                    requestTime = '00:00:00';
                }
                requestDate = requestDateArr[2] + '-' + requestDateArr[1] + '-' + requestDateArr[0] + ' ' + requestTime;
                let requestDateFormatted = requestDateArr[0] + '/' + requestDateArr[1] + '/' + requestDateArr[2];
            }

            let defaultCloseDays = 0;

            for (let i = 0; i < this.props.topicList.length; i++) {
                if (this.props.topicList[i].parent_id == 0 && this.props.topicList[i].name == this.props.dataRequest.topic_name) {
                    defaultCloseDays = this.props.topicList[i].target_close_days;
                    break;
                }
            }

            let closeDate = null;
            if (this.getStatusTypeName(this.props.dataRequest.status_name) == 'סגור') {
                let d = new Date();
                //d.setDate(d.getDate()+defaultCloseDays);
                let month = '' + (d.getMonth() + 1);
                let day = '' + d.getDate();
                let year = d.getFullYear();
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                closeDate = [year, month, day].join('-');
            }

            CrmActions.addRequest(this.props.dispatch, this.props.router, -1,
                this.getTopicID(this.props.dataRequest.topic_name),
                this.getSubTopicID(topicID, this.props.dataRequest.sub_topic_name),
                statusID, requestSourceID, priorityID, userID, teamID, targetCloseDate, closeDate, requestDate, true,
                this.props.dataRequest.topic_name, this.props.dataRequest.sub_topic_name, this.props.dataRequest.request_source_name,
                this.props.dataRequest.request_source_fax, this.props.dataRequest.request_source_email, this.props.dataRequest.request_source_phone,
                this.props.dataRequest.request_source_first_name, this.props.dataRequest.request_source_last_name,
                this.props.dataRequest.priority_name, this.props.dataRequest.status_name, this.props.dataRequest.user_handler_name,
                this.props.dataRequest.team_name, this.props.dataRequest.first_desc, this.props.addUnknownVoterScreen.key,
                this.props.requestSourceDocumentDetails.documentName, this.props.requestSourceDocumentDetails.file,
                this.props.newCallbizDetails.ID, this.props.newCallbizDetails.datetime, this.props.newCallbizDetails.details,this.props.dataRequest);

        } 
		else if (this.props.router.params.reqKey == 'new') //create new request to existing voter
        {
            let statusID = this.getStatusID(this.props.dataRequest.status_name);
            let requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
            let requestSourceFax = this.props.dataRequest.request_source_fax;
            let requestSourceEmail = this.props.dataRequest.request_source_Email;
            let requestSourcePhone = this.props.dataRequest.request_source_Phone;
            let requestSourceFirstName = this.props.dataRequest.request_source_first_name;
            let requestSourceLastName = this.props.dataRequest.request_source_last_name;
            let priorityID = this.getPriorityID(this.props.dataRequest.priority_name);
            let userID = this.getUserID(this.props.dataRequest.user_handler_name);
            let teamID = this.getTeamID(this.props.dataRequest.team_name);
            let topicID = this.getTopicID(this.props.dataRequest.topic_name);
            let targetCloseDate = this.props.dataRequest.target_close_date;
            let targetCloseDateArr = targetCloseDate.split(' ')[0];
            targetCloseDateArr = targetCloseDateArr.split('/');

            targetCloseDate = targetCloseDateArr[2] + '-' + targetCloseDateArr[1] + '-' + targetCloseDateArr[0] + ' 00:00:00';
            let requestDate = this.props.dataRequest.date;
            if (requestDate != null) {
                let requestDateParts = requestDate.split(' ');
                let requestDateArr = requestDateParts[0].split('/');
                let requestTime = requestDateParts[1];
                if (requestTime == undefined) {
                    requestTime = '00:00:00';
                }
                requestDate = requestDateArr[2] + '-' + requestDateArr[1] + '-' + requestDateArr[0] + ' ' + requestTime;

                let requestDateFormatted = requestDateArr[0] + '/' + requestDateArr[1] + '/' + requestDateArr[2];
            }

            let defaultCloseDays = 0;

            for (let i = 0; i < this.props.topicList.length; i++) {
                if (this.props.topicList[i].parent_id == 0 && this.props.topicList[i].name == this.props.dataRequest.topic_name) {
                    defaultCloseDays = this.props.topicList[i].target_close_days;
                    break;
                }
            }

            let closeDate = null;
            if (this.getStatusTypeName(this.props.dataRequest.status_name) == 'סגור') {
                let d = new Date();
                //d.setDate(d.getDate()+defaultCloseDays);
                let month = '' + (d.getMonth() + 1);
                let day = '' + d.getDate();
                let year = d.getFullYear();
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                closeDate = [year, month, day].join('-');
            }

            CrmActions.addRequest(this.props.dispatch, this.props.router, this.props.searchVoterDetails.id,
                this.getTopicID(this.props.dataRequest.topic_name),
                this.getSubTopicID(topicID, this.props.dataRequest.sub_topic_name),
                statusID, requestSourceID, priorityID, userID, teamID, targetCloseDate, closeDate, requestDate, false,
                this.props.dataRequest.topic_name, this.props.dataRequest.sub_topic_name, this.props.dataRequest.request_source_name,
                this.props.dataRequest.request_source_fax, this.props.dataRequest.request_source_email, this.props.dataRequest.request_source_phone,
                this.props.dataRequest.request_source_first_name, this.props.dataRequest.request_source_last_name,
                this.props.dataRequest.priority_name, this.props.dataRequest.status_name, this.props.dataRequest.user_handler_name,
                this.props.dataRequest.team_name, this.props.dataRequest.first_desc, '', this.props.requestSourceDocumentDetails.documentName, this.props.requestSourceDocumentDetails.file,
                this.props.newCallbizDetails.ID, this.props.newCallbizDetails.datetime, this.props.newCallbizDetails.details,this.props.dataRequest);


        } 
		else 
		{   //save existing request
            let topicID = null, subTopicID = null, statusID = null, requestSourceID = null, requestSourceFax = null, requestSourceEmail = null,
                requestSourcePhone = null, requestSourceFirstName = null, requestSourceLastName = null, priorityID = null, targetCloseDate = null, userID = null, teamID = null, targetCloseDateFormatted = null, requestDate = null, requestDateFormatted = null;
			
			let updatedSavedRequest = this.state.updatedSavedRequest;
			
			let changesCount = 0;
			//date
			 
            if (this.props.originalDataRequest.topic_name != this.props.dataRequest.topic_name){
				changesCount ++;
				updatedSavedRequest["topic_name"] = this.props.dataRequest.topic_name;
				topicID = this.getTopicID(this.props.dataRequest.topic_name);
			}
			if (this.props.originalDataRequest.sub_topic_name != this.props.dataRequest.sub_topic_name){
                changesCount ++;
				updatedSavedRequest["sub_topic_name"] = this.props.dataRequest.sub_topic_name;
				subTopicID = this.getSubTopicID(this.getTopicID(this.props.dataRequest.topic_name), this.props.dataRequest.sub_topic_name);
            }
			/*
			if (this.props.originalDataRequest.status_type_id != this.props.dataRequest.status_type_id){
                changesCount ++;
				updatedSavedRequest["status_type_id"] = this.props.dataRequest.status_type_id;
            }
			*/
			if (this.props.originalDataRequest.status_name != this.props.dataRequest.status_name){
                changesCount ++;
				updatedSavedRequest["status_name"] = this.props.dataRequest.status_name;
				statusID = this.getStatusID(this.props.dataRequest.status_name);
            }
			if (this.props.originalDataRequest.request_source_name != this.props.dataRequest.request_source_name){
                changesCount ++;
				updatedSavedRequest["request_source_name"] = this.props.dataRequest.request_source_name;
				requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
            }
			if (this.props.originalDataRequest.request_source_fax != this.props.dataRequest.request_source_fax){
                changesCount ++;
				updatedSavedRequest["request_source_fax"] = this.props.dataRequest.request_source_fax;
				requestSourceFax = this.props.dataRequest.request_source_fax;
			}
			if (this.props.originalDataRequest.request_source_email != this.props.dataRequest.request_source_email){
                changesCount ++;
				updatedSavedRequest["request_source_email"] = this.props.dataRequest.request_source_email;
				requestSourceEmail = this.props.dataRequest.request_source_email;
            }
			if (this.props.originalDataRequest.request_source_phone != this.props.dataRequest.request_source_phone){
                changesCount ++;
				updatedSavedRequest["request_source_phone"] = this.props.dataRequest.request_source_phone;
				requestSourcePhone = this.props.dataRequest.request_source_phone;
            }
			if (this.props.originalDataRequest.request_source_first_name != this.props.dataRequest.request_source_first_name){
                updatedSavedRequest["request_source_first_name"] = this.props.dataRequest.request_source_first_name;
				changesCount ++;
				requestSourceFirstName = this.props.dataRequest.request_source_first_name;
            }
			if (this.props.originalDataRequest.request_source_last_name != this.props.dataRequest.request_source_last_name){
                updatedSavedRequest["request_source_last_name"] = this.props.dataRequest.request_source_last_name;
				changesCount ++;
				requestSourceLastName = this.props.dataRequest.request_source_last_name;
            }
			if (this.props.originalDataRequest.priority_name != this.props.dataRequest.priority_name){
                changesCount ++;
				updatedSavedRequest["priority_name"] = this.props.dataRequest.priority_name;
				priorityID = this.getPriorityID(this.props.dataRequest.priority_name);
            }
			if (this.props.originalDataRequest.target_close_date != this.props.dataRequest.target_close_date){
				changesCount ++;
				updatedSavedRequest["target_close_date"] = this.props.dataRequest.target_close_date;
				targetCloseDate = this.props.dataRequest.target_close_date;
			}
			if (this.props.originalDataRequest.user_handler_name != this.props.dataRequest.user_handler_name){
                userID = this.getUserID(this.props.dataRequest.user_handler_name);
			}
			if (this.props.originalDataRequest.team_name != this.props.dataRequest.team_name){
                teamID = this.getTeamID(this.props.dataRequest.team_name);
			}
            if (this.props.originalDataRequest.date != this.props.dataRequest.date){
				changesCount ++;
				updatedSavedRequest["date"] = this.props.dataRequest.date;
                requestDate = this.props.dataRequest.date;
			}

            let closeDate = null;
            if (targetCloseDate != null) {
                let targetCloseDateArr = targetCloseDate.split('/');
                targetCloseDate = targetCloseDateArr[2] + '-' + targetCloseDateArr[1] + '-' + targetCloseDateArr[0] + ' 00:00:00';
                targetCloseDateFormatted = targetCloseDateArr[0] + '/' + targetCloseDateArr[1] + '/' + targetCloseDateArr[2];
            } else {
                if (this.getStatusTypeName(this.props.dataRequest.status_name) == 'סגור') {


                    let d = new Date();
                    //d.setDate(d.getDate()+defaultCloseDays);
                    let month = '' + (d.getMonth() + 1);
                    let day = '' + d.getDate();
                    let year = d.getFullYear();
                    if (month.length < 2)
                        month = '0' + month;
                    if (day.length < 2)
                        day = '0' + day;
                    closeDate = [year, month, day].join('-');
                }
            }


            if (requestDate != null) {
                let requestDateParts = requestDate.split(' ');

                let requestDateArr = requestDateParts[0].split('/');
                requestDate = requestDateArr[2] + '-' + requestDateArr[1] + '-' + requestDateArr[0] + ' ' + requestDateParts[1];
                requestDateFormatted = requestDateArr[0] + '/' + requestDateArr[1] + '/' + requestDateArr[2];
            }


            let originalCloseDateArr = this.props.originalDataRequest.target_close_date.split('/');
            let originalCloseDate = originalCloseDateArr[0] + '/' + originalCloseDateArr[1] + '/' + originalCloseDateArr[2];

            this.OriginalStatusName = this.props.dataRequest.status_name;
            requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
            let newDesc = null;
            let oldDesc = null;
            if (this.props.dataRequest.user_create_key == this.props.currentUser.key) {
                if (this.props.originalDataRequest.first_desc != this.props.dataRequest.first_desc) {
					 
					changesCount ++;
					updatedSavedRequest["first_desc"] = this.props.dataRequest.first_desc;
                    newDesc = this.props.dataRequest.first_desc;
                    oldDesc = this.props.originalDataRequest.first_desc;
                }

            }

            let dataSourceSystemName = this.getRequestSourceSystemName(this.props.dataRequest.request_source_name);
            let actionType = null; // 1= transfer request, 2= close request, 3=cancel request
            let requestClosureReasonID = null, voterSatisfaction = null, isSendEmail = null, isIncludeClosingReason = null; //close request params
            if (dataSourceSystemName == 'fax' && !validatePhoneNumber(this.props.dataRequest.request_source_fax)) {
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא את כל שדות החובה במקור הפניה' });
                return;
            }
            if (dataSourceSystemName == 'email' && this.props.dataRequest.request_source_email != undefined) {
                if (!validateEmail(this.props.dataRequest.request_source_email)) {
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא את כל שדות החובה במקור הפניה' });
                    return;
                }
            }

            if (dataSourceSystemName == 'other' && (this.props.dataRequest.request_source_first_name == '' || !validatePhoneNumber(this.props.dataRequest.request_source_phone))) {
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא את כל שדות החובה במקור הפניה' });
                return;
            }
            if (this.props.requestSourceDocumentDetails.file != null && requestSourceID != this.props.originalDataRequest.request_source_id && (dataSourceSystemName == 'fax' || dataSourceSystemName == 'email')) {
                CrmActions.editRequestWithFile(this.props.dispatch, this.props.router, this.props.router.params.reqKey,
                    topicID, subTopicID, statusID, requestSourceID, requestSourceFax, requestSourceEmail, requestSourcePhone, requestSourceFirstName,
                    requestSourceLastName, priorityID, userID, teamID, targetCloseDate, requestDate,
                    this.props.originalDataRequest.topic_name, this.props.originalDataRequest.sub_topic_name,
                    this.props.originalDataRequest.status_name, this.props.originalDataRequest.request_source_name,
                    this.props.originalDataRequest.request_source_fax, this.props.originalDataRequest.request_source_email,
                    this.props.originalDataRequest.request_source_phone, this.props.originalDataRequest.request_source_first_name,
                    this.props.originalDataRequest.request_source_last_name,
                    this.props.originalDataRequest.priority_name,
                    this.props.originalDataRequest.user_handler_name,
                    this.props.originalDataRequest.team_name, closeDate,
                    this.props.originalDataRequest.date,
                    this.props.dataRequest.topic_name, this.props.dataRequest.sub_topic_name,
                    this.props.dataRequest.status_name,
                    this.props.dataRequest.request_source_name,
                    this.props.dataRequest.request_source_fax,
                    this.props.dataRequest.request_source_email,
                    this.props.dataRequest.request_source_phone,
                    this.props.dataRequest.request_source_first_name,
                    this.props.dataRequest.request_source_last_name,
                    this.props.dataRequest.priority_name,
                    this.props.dataRequest.user_handler_name,
                    this.props.dataRequest.team_name, targetCloseDateFormatted,
                    requestDate, newDesc, oldDesc, this.props.requestSourceDocumentDetails.documentName, this.props.requestSourceDocumentDetails.file
                    //,this.props.newActionDetails.details, actionType, requestClosureReasonID

                );
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_FAX_MODAL });
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_EMAIL_MODAL });

            } else {

                CrmActions.editRequest(this.props.dispatch, this.props.router, this.props.router.params.reqKey,
                    topicID, subTopicID, statusID, requestSourceID, requestSourceFax, requestSourceEmail, requestSourcePhone, requestSourceFirstName,
                    requestSourceLastName, priorityID, userID, teamID, targetCloseDate, requestDate,
                    this.props.originalDataRequest.topic_name, this.props.originalDataRequest.sub_topic_name,
                    this.props.originalDataRequest.status_name, this.props.originalDataRequest.request_source_name,
                    this.props.originalDataRequest.request_source_fax, this.props.originalDataRequest.request_source_email,
                    this.props.originalDataRequest.request_source_phone, this.props.originalDataRequest.request_source_first_name,
                    this.props.originalDataRequest.request_source_last_name,
                    this.props.originalDataRequest.priority_name,
                    this.props.originalDataRequest.user_handler_name,
                    this.props.originalDataRequest.team_name, closeDate,
                    this.props.originalDataRequest.date,
                    this.props.dataRequest.topic_name, this.props.dataRequest.sub_topic_name,
                    this.props.dataRequest.status_name,
                    this.props.dataRequest.request_source_name,
                    this.props.dataRequest.request_source_fax,
                    this.props.dataRequest.request_source_email,
                    this.props.dataRequest.request_source_phone,
                    this.props.dataRequest.request_source_first_name,
                    this.props.dataRequest.request_source_last_name,
                    this.props.dataRequest.priority_name,
                    this.props.dataRequest.user_handler_name,
                    this.props.dataRequest.team_name, targetCloseDateFormatted,
                    requestDate, newDesc, oldDesc, this.props.newCallbizDetails.ID, this.props.newCallbizDetails.datetime,
                    this.props.newCallbizDetails.details, this.props.newActionDetails.details, actionType, requestClosureReasonID, voterSatisfaction,
                    isSendEmail, isIncludeClosingReason , this.props.setUpdatedSavedRequest
                );

                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL });
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_OTHER_MODAL });
            }
            
			if(changesCount > 0){
				this.setState({updatedSavedRequest});
			}
        }
		
		
	}

	cancelCreateEmailDialog() {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED, data: false
        });
    }
	
    createWithoutEmail() {

        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED, data: false
        });
        this.doSaveAction();
    }

    newEmailChange(e) {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.NEW_EMAIL_CHANGE, data: e.target.value
        });
    }

    updateNewEmail() {
        // console.log("update to new email");
        if (this.props.newEmail.length > 3 && this.props.newEmail != undefined) {
            if (validateEmail(this.props.newEmail)) {
                if (this.props.oldVoterDetails.key.trim() != '' && this.props.oldVoterDetails.email.trim() == '') {
                    CrmActions.updateRequestVoterEmail(this.props.dispatch, this.props.oldVoterDetails.key, this.props.newEmail, false);
                }
                else if (this.props.addUnknownVoterScreen.key.trim() != '' && this.props.addUnknownVoterScreen.email.trim() == '') {
                    //console.log("update unknown voter delails");
                    CrmActions.updateRequestVoterEmail(this.props.dispatch, this.props.addUnknownVoterScreen.key, this.props.newEmail, true);
                }
                this.doSaveAction();
            }
        }
    }

    showNewActionModalDialog() {

        if (this.props.dirtyComponents.length == 0) {
            var actionModalHeader = "יצירת פעולה עבור פניה ";
            var actionData = {};

            actionModalHeader += this.props.router.params.reqKey;

            actionData = {
                key: null,
                action_type: '',
                action_topic: '',
                action_status: '',
                action_direction: '',
                action_date: '',
                description: '',
                conversation_with_other: '',
                action_type_id: 0,
                action_topic_id: 0,
                action_status_id: 0,
                conversation_direction: ''
            };

            this.props.dispatch({
                type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
                actionData: actionData, entityActionTopicsList: []
            });
        } else {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שים לב', content: 'בוצעו שינויים בנתוני הפניה, יש לשמור את הנתונים לפני ביצוע העברת פניה ' });
        }
    }

    forwardRequestHandle() {

        if (this.props.dirtyComponents.length == 0) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_TRANSFER_REQUEST_MODAL });
        } else {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שים לב', content: 'בוצעו שינויים בנתוני הפניה, יש לשמור את הנתונים לפני ביצוע העברת פניה ' });
        }
    }

    closeRequestHandle() {

        if (this.props.dirtyComponents.length == 0 || this.saveButtonDisabled()) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_CLOSE_REQUEST_MODAL });
        } else {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שים לב', content: 'בוצעו שינויים בנתוני הפניה, יש לשמור את הנתונים לפני ביצוע סגירת פניה ' });
        }
    }

    cancelRequestHandle() {

        if (this.props.dirtyComponents.length == 0) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_CANCEL_REQUEST_MODAL });
        } else {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שים לב', content: 'בוצעו שינויים בנתוני הפניה, יש לשמור את הנתונים לפני ביצוע ביטול פניה ' });
        }
    }

    //user clicks 'cancel' button
    onClickCancelBtn(e) {
        //this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SET_MODAL_CANCEL_REQUEST_SHOW, data: true});
        this.props.router.goBack();
    }

    /*user clicks save or add new request */
    onClickSaveBtn(e) {
        if (this.props.addUnknownVoterScreen.key != undefined && this.props.addUnknownVoterScreen.key != '' && (this.props.location.pathname == 'crm/requests/new' || this.props.location.pathname == 'crm/requests/new/') && this.props.addUnknownVoterScreen.first_name.trim() == '' && this.props.addUnknownVoterScreen.last_name.trim() == '') {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא שם פרטי או שם משפחה' });
        } else if (this.missingTopic || this.missingSubTopic /*|| this.missingStatusType*/ ||
            this.missingStatus || this.missingPriority || this.missingUser || this.missingTeam ||
            this.missingRequestSource) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא את כל שדות החובה' });
        } else if (this.missingRequestSourceDetails) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה בשמירת נתונים', content: 'יש למלא את כל שדות החובה במקור הפניה' });
        } else if (this.wrongTargetCloseDate) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאת תאריך יעד לסגירה', content: 'יש להזין תאריך תקין בפורמט dd/mm/yyyy' });
        } else if (this.props.router.params.reqKey == 'new' && this.missingDesc) {
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאת תיאור פניה', content: 'יש לכתוב תיאור פנייה' });
        } else {
            if (this.props.router.params.reqKey == undefined || this.props.router.params.reqKey == 'new' || this.props.router.location.pathname == 'crm/requests/new') {
                if ((this.props.oldVoterDetails.key.trim() != '' && this.props.oldVoterDetails.email.trim() == '') || (this.props.addUnknownVoterScreen.key.trim() != '' && this.props.addUnknownVoterScreen.email.trim() == '')) {
                    this.props.dispatch({
                        type: CrmActions.ActionTypes.REQUEST.SET_CREATE_EMAIL_DIALOG_OPENED, data: true
                    });
                }
                else {
                    this.doSaveAction();
                }
            }
            else {
                this.doSaveAction();
            }
        }
    }

    getActionStatusID(actionStatusName) {
        let returnedValue = -1;
        for (let i = 0, len = this.props.actionStatusesList.length; i < len; i++) {
            if ((this.props.actionStatusesList[i].name) == actionStatusName) {
                returnedValue = this.props.actionStatusesList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    getActionTopicID(actionTopicName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.actionTopicsList.length; i < len; i++) {
            if ((this.props.actionTopicsList[i].name) == actionTopicName) {
                returnedValue = this.props.actionTopicsList[i].id;
                break;
            }
        }
        return returnedValue;
    }

    getActionTypeParam(actionTypeName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.actionTypesList.length; i < len; i++) {
            if ((this.props.actionTypesList[i].name) == actionTypeName) {
                returnedValue = this.props.actionTypesList[i].id;
                break;
            }
        }
        return returnedValue;

    }

    voterHasEmail() {
        if (this.props.addUnknownVoterScreen.key.length == 10) {
            if ((this.props.addUnknownVoterScreen.email != undefined) && (this.props.addUnknownVoterScreen.email.trim() != '')) return true;
            return false;
        } else {
            if ((this.props.voterDetails.email != undefined) && (this.props.voterDetails.email.trim() != '')) return true;
            else return false;
        }
    }

    getVoterEmail() {
        if (this.props.addUnknownVoterScreen.key.length == 10) {
            return this.props.addUnknownVoterScreen.email;
        } else {
            return this.props.voterDetails.email;
        }
    }


    styleIgnitor() {
        this.generalStyle = {};
        this.generalStyle.reqNumHeader = { color: '#327DA4', fontWeight: '600', fontSize: '23px', paddingRight: '30px', paddingTop: '10px',display:'flex' ,position:'relative'};
        this.generalStyle.smallTitleStyle = { color: '#111111', fontWeight: '700', fontSize: '16px' };
        this.generalStyle.buttonSaveStyle = { width: '100px', height: '40px', fontSize: '18px', backgroundColor: '#498BB6' };
        this.generalStyle.buttonSaveWrapperStyle = { paddingLeft: '88px', paddingTop: '20px' };
        this.generalStyle.leftTH = { paddingRight: '20px', paddingTop: '30px' };
        this.generalStyle.leftThExtended = { paddingRight: '20px', paddingTop: '30px', paddingBottom: '30px' };
        this.generalStyle.leftTdExtended = { paddingRight: '20px', paddingTop: '30px', paddingLeft: '20px', paddingBottom: '30px' };
        this.generalStyle.leftTD = { paddingRight: '20px', paddingTop: '30px', paddingLeft: '20px' };
        this.generalStyle.leftTableStyle = { backgroundColor: '#F6F6F6', border: '1px solid #ccc' };
        this.generalStyle.rightTableRowStyle = { paddingBottom: '20px' };
    }

    renderTopic() {
        /*let topicNameItem = <div></div>
        //console.log('new',this.props.router.params.reqKey, 'props.hasRequestEditingPermissions', this.props.hasRequestEditingPermissions,  'props.hasAdminEdit', this.props.hasAdminEdit);
        if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true && this.props.hasAdminEdit == true)){            
            topicNameItem = <Combo items={this.props.topicList}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.topic_name}  onChange={this.topicOnChange.bind(this)} inputStyle={this.validatorsStyle.topicStyle} />;
        } else{
            topicNameItem = <span>{this.props.dataRequest.topic_name}</span>;
        }*/
        let topicNameItem = <div></div>

        if (this.props.statusNotForEdit == true) {
            topicNameItem = <span>{this.props.dataRequest.topic_name}</span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            topicNameItem = <Combo items={this.props.topicList} maxDisplayItems={5} itemIdProperty="id"
                itemDisplayProperty='name' value={this.props.dataRequest.topic_name}
                onChange={this.topicOnChange.bind(this)}
                inputStyle={this.validatorsStyle.topicStyle} />;
        } else {
            topicNameItem = <span>{this.props.dataRequest.topic_name}</span>;
        }

        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                נושא הפניה
            </div>
            <div className="col-md-7">
                {topicNameItem}
            </div>
        </div>);


        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                נושא הפניה
                            </div>
            <div className="col-md-7">
                {topicNameItem}
            </div>
        </div>);
    }

    renderStatus() {
        let statusNameItem = <div></div>
        var request_status_type_closed = constants.request_status_type_closed;
        var request_status_type_canceled = constants.request_status_type_canceled;
        let filteredStatusList = this.props.statusList.filter(function (statusList) {
            return statusList.status_type_id != request_status_type_closed && statusList.status_type_id != request_status_type_canceled
        });

        if (this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true)) {
            statusNameItem = <Combo items={filteredStatusList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.status_name} onChange={this.statusOnChange.bind(this)} inputStyle={this.validatorsStyle.statusStyle} />
        } else if (this.props.currentUser.admin && this.props.hasRequestEditingPermissions == false) {
            var requestStatusPos = this.getStatusPos(this.props.dataRequest.status_name);
            let filteredStatusListAdmin = this.props.statusList[requestStatusPos];
            if (filteredStatusListAdmin != undefined) {
                filteredStatusList.push(filteredStatusListAdmin);
            }
            statusNameItem = <Combo items={filteredStatusList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.status_name} onChange={this.statusOnChange.bind(this)} inputStyle={this.validatorsStyle.statusStyle} />

        } else {
            statusNameItem = <span>{this.props.dataRequest.status_name}</span>;
        }
        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                סטטוס
                                    </div>
            <div className="col-md-7">
                {statusNameItem}
            </div>
        </div>);
    }

    renderDate() {
        let dateItem = <div></div>;

        /*if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true)){
            dateItem =  <ReactWidgets.DateTimePicker 
                                isRtl={true}
                                time={true}
                                value={parseDateToPicker(this.props.dataRequest.date)}
                                onChange={parseDateFromPicker.bind(this, {callback: this.dateChange, format: "YYYY-MM-DD HH:mm", functionParams: ''})}
                                format="DD/MM/YYYY HH:mm"
                            />
        } else{
            dateItem = <span>{this.props.dataRequest.date}</span>;
        }*/

        if (this.props.statusNotForEdit == true) {
            dateItem = <span>{this.props.dataRequest.date}</span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            dateItem = <ReactWidgets.DateTimePicker
                isRtl={true}
                time={true}
                value={parseDateToPicker(this.props.dataRequest.date)}
                onChange={parseDateFromPicker.bind(this, { callback: this.dateChange, format: "YYYY-MM-DD HH:mm", functionParams: '' })}
                format="DD/MM/YYYY HH:mm"
            />;
        } else {
            dateItem = <span>{this.props.dataRequest.date}</span>;
        }

        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                תאריך פניה
                                    </div>
            <div className="col-md-7">
                {false && <input type="datetime" className="form-control form-control-sm" value={this.props.dataRequest.date} onChange={this.dateChange.bind(this)} style={this.validatorsStyle.dateStyle} />}
                {dateItem}
            </div>
        </div>);
    }

    renderDesc() {
        let descItem = <div></div>
        if (this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true)) {
            descItem = <textarea className="form-control" rows="6" disabled={this.props.router.params.reqKey != 'new' && this.props.dataRequest.user_create_key != this.props.currentUser.key} value={this.props.dataRequest.first_desc} style={this.validatorsStyle.firstDescStyle} onChange={this.firstDescChange.bind(this)}></textarea>
        } else {
            descItem = <span>{this.props.dataRequest.first_desc}</span>;
        }
        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                תיאור
                                    </div>
            <div className="col-md-7">
                {descItem}
            </div>
        </div>);
    }

    renderSubTopic() {
        let subTopicNameItem = <div></div>;

        /*if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true && this.props.hasAdminEdit == true)){
         subTopicNameItem = <Combo items={this.props.subTopicList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.sub_topic_name} onChange={this.subTopicOnChange.bind(this)}  inputStyle={this.validatorsStyle.subTopicStyle} />;
         } else{
         subTopicNameItem = <span>{this.props.dataRequest.sub_topic_name}</span>;
         }*/

        if (this.props.statusNotForEdit == true) {
            subTopicNameItem = <span>{this.props.dataRequest.sub_topic_name}</span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            subTopicNameItem = <Combo items={this.props.subTopicList} maxDisplayItems={5} itemIdProperty="id"
                itemDisplayProperty='name' value={this.props.dataRequest.sub_topic_name}
                onChange={this.subTopicOnChange.bind(this)}
                inputStyle={this.validatorsStyle.subTopicStyle} />;
        } else {
            subTopicNameItem = <span>{this.props.dataRequest.sub_topic_name}</span>;
        }

        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                תת נושא
            </div>
            <div className="col-md-7">
                {subTopicNameItem}
            </div>
        </div>);
    }

    renderStatusType() {
        let statusTypeNameItem = this.getStatusTypeName(this.props.dataRequest.status_name)
        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4">
                <span style={this.generalStyle.smallTitleStyle}> סוג</span>
            </div>
            <div className="col-md-7">
                {statusTypeNameItem}
            </div>
        </div>);
    }

    renderSource() {

        let sourceItem = <div></div>;
        let requestSourceInfo = <div ></div>;
        let requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
        let dataSourceSystemName = this.getRequestSourceSystemName(this.props.dataRequest.request_source_name);
        let originalDataSourceSystemName = this.getRequestSourceSystemName(this.props.originalDataRequest.request_source_name);

        /*if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true)){
            sourceItem = <Combo items={this.props.requestSourceList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.request_source_name} onChange={this.requestSourceOnChange.bind(this)} inputStyle={this.validatorsStyle.requestSourceStyle} />
            if (dataSourceSystemName != 'callbiz' && (dataSourceSystemName == originalDataSourceSystemName) ){
                requestSourceInfo =   <div className="col-md-1" disabled={true}>
                                        <a href="#" title="מקור הפניה" onClick={this.openRequestSourceInfoModal.bind(this)}><img src={this.imageIcoSourceInfo} alt="מקור הפניה" /></a>
                                      </div>
            }
        } else{
            sourceItem = <span>{this.props.dataRequest.request_source_name}</span>;
        }*/

        if (this.props.statusNotForEdit == true) {
            sourceItem = <span>{this.props.dataRequest.request_source_name}</span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            sourceItem = <Combo items={this.props.requestSourceList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.request_source_name} onChange={this.requestSourceOnChange.bind(this)} inputStyle={this.validatorsStyle.requestSourceStyle} />
            if (dataSourceSystemName != 'callbiz' && (dataSourceSystemName == originalDataSourceSystemName) && (requestSourceID != '')) {
                requestSourceInfo = <div className="col-md-1" disabled={true}>
                    <a href="javascript:void(0)" title="מקור הפניה" onClick={this.openRequestSourceInfoModal.bind(this)}><img src={this.imageIcoSourceInfo} alt="מקור הפניה" /></a>
                </div>
            }
        } else {
            sourceItem = <span>{this.props.dataRequest.request_source_name}</span>;
        }


        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                מקור הפניה
            </div>
            <div className="col-md-7" >
                {sourceItem}
            </div>
            {requestSourceInfo}
        </div>);
    }

    renderPriority() {
        let priorityNameItem = <div></div>;

        /*if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true)){
            priorityNameItem = <Combo items={this.props.priorityList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.dataRequest.priority_name} onChange={this.priorityOnChange.bind(this)} inputStyle={this.validatorsStyle.priorityStyle} />
        } else{
            priorityNameItem = <span>{this.props.dataRequest.priority_name}</span>;
        }*/

        if (this.props.statusNotForEdit == true) {
            priorityNameItem = <span>{this.props.dataRequest.priority_name}</span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            priorityNameItem = <Combo items={this.props.priorityList} maxDisplayItems={5} itemIdProperty="id"
                itemDisplayProperty='name' value={this.props.dataRequest.priority_name}
                onChange={this.priorityOnChange.bind(this)}
                inputStyle={this.validatorsStyle.priorityStyle} />;
        } else {
            priorityNameItem = <span>{this.props.dataRequest.priority_name}</span>;
        }


        return (<div className="row" style={{ paddingBottom: '20px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                עדיפות
                                    </div>
            <div className="col-md-7">
                {priorityNameItem}
            </div>
        </div>);
    }

    renderTargetCloseDate() {

        let newTargetCloseDate = this.props.dataRequest.target_close_date.split(' ')[0];
        newTargetCloseDate = newTargetCloseDate.split('/');
        let targetCloseDateItem = <div></div>

        /*if(this.props.router.params.reqKey == 'new' || (this.props.hasRequestEditingPermissions == true && this.props.hasAdminEdit == true)){
            targetCloseDateItem   = <ReactWidgets.DateTimePicker 
                                                        isRtl={true}
                                                        time={false}
                                                        value={parseDateToPicker(this.props.dataRequest.target_close_date)}
                                                        onChange={parseDateFromPicker.bind(this, {callback: this.estimatedCloseDateOnChange, format: "YYYY-MM-DD", functionParams: ''})}
                                                        format="DD/MM/YYYY"
                                                        />; 
        } else{
            targetCloseDateItem = <span style={this.validatorsStyle.targetCloseDatePlainStyle}>
                                      {this.props.dataRequest.target_close_date.split(' ')[0]}
                                  </span>;
        }*/

        if (this.props.statusNotForEdit == true) {
            targetCloseDateItem = <span style={this.validatorsStyle.targetCloseDatePlainStyle}>
                {this.props.dataRequest.target_close_date.split(' ')[0]}
            </span>;
        } else if (this.props.hasRequestEditingPermissions || this.props.hasAdminEdit == true) {
            targetCloseDateItem = <ReactWidgets.DateTimePicker
                isRtl={true}
                time={false}
                value={parseDateToPicker(this.props.dataRequest.target_close_date)}
                onChange={parseDateFromPicker.bind(this, { callback: this.estimatedCloseDateOnChange, format: "YYYY-MM-DD", functionParams: '' })}
                format="DD/MM/YYYY"
            />;
        } else {
            targetCloseDateItem = <span style={this.validatorsStyle.targetCloseDatePlainStyle}>
                {this.props.dataRequest.target_close_date.split(' ')[0]}
            </span>;
        }

        return (<div className="row" style={{ paddingBottom: '10px' }}>
            <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                תאריך יעד לסגירה
                                        </div>
            <div className="col-md-7">
                {targetCloseDateItem}
            </div>
        </div>);
    }

    renderTeam() {
        if (this.props.router.params.reqKey == 'new') {
            return (<div className="row" style={{ paddingBottom: '20px' }}>
                <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>צוות מטפל</div>
                <div className="col-md-7">
                    <Combo items={this.props.teams} maxDisplayItems={5}
                        itemIdProperty="id" itemDisplayProperty='name' value={"" + this.props.dataRequest.team_name}
                        onChange={this.teamHandlerOnChange.bind(this)} inputStyle={this.validatorsStyle.teamStyle} />
                </div>
            </div>);

        } else {
            return (<div className="row" style={{ paddingBottom: '20px' }}>
                <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>צוות מטפל</div>
                <div className="col-md-7">
                    {this.props.dataRequest.team_name}
                </div>
            </div>);
        }
    }
    renderUser() {
        if (this.props.router.params.reqKey == 'new') {
            return (<div className="row" style={{ paddingBottom: '20px' }}>
                <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                    משתמש מטפל
                                    </div>
                <div className="col-md-7">
                    <Combo items={this.props.users} maxDisplayItems={5} itemIdProperty="id"
                        itemDisplayProperty='name' value={this.props.dataRequest.user_handler_name}
                        onChange={this.userHandlerOnChange.bind(this)} inputStyle={this.validatorsStyle.userStyle} />
                </div>
            </div>);
        } else {
            return (<div className="row" style={{ paddingBottom: '20px' }}>
                <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                    משתמש מטפל
                                    </div>
                <div className="col-md-7">
                    {this.props.dataRequest.user_handler_name}
                </div>
            </div>);
        }
    }

    saveDisabled() {
        if (this.missingUser || this.missingTeam) return true;
        return false;
    }
	
	saveButtonDisabled(){
		if(this.props.location.pathname == 'crm/requests/new' || this.props.location.pathname == 'crm/requests/new/'){
			return false;
		}
		
		let updatedSavedRequest = this.state.updatedSavedRequest;
		let dataRequest = this.props.dataRequest;
		if(Object.keys(updatedSavedRequest).length == 0){
			return true;
		}
		let changesCount = 0 ;
		for(let key in updatedSavedRequest  ){
			
			if(updatedSavedRequest[key] != dataRequest[key] ){
				//console.log(updatedSavedRequest[key]  + "-" +  dataRequest[key])
				changesCount++;
			}
		}
		if(changesCount == 0 ){
			return true;
		}
		return false;
	}
	
	setRequestClosed(actionTypeID , newStatusName ,newDesc){
		let updatedSavedRequest = this.state.updatedSavedRequest;
		updatedSavedRequest["status_type_id"] = actionTypeID;
		updatedSavedRequest["status_name"] = newStatusName;
		updatedSavedRequest["first_desc"] = newDesc;
		this.setState({updatedSavedRequest});
	}

    getUnknownVoterDetails(){
       let detailsUnknownVoterTag=[];
       let fieldsUnknownVoter=UnknownVoterDto.getHashFieldToDisplay();
        for (const [field, displayTextField] of Object.entries(fieldsUnknownVoter)) {
            var valueField=this.props.dataRequest.unknown_voter_data[field];
            if(valueField &&valueField!='')
            detailsUnknownVoterTag.push(
                <div key={field} className="cont-detail">
                    <div className="title-detail">{displayTextField} :</div><div className="value-detail">{valueField}</div>
                </div>
            )
          }
          return detailsUnknownVoterTag;
    }


    setDisplayUnknowVoter=()=>{
        this.setState((prevState)=>{
            return {display_unknown_voter_data:!prevState.display_unknown_voter_data}
        })
    }
    render() {
        this.styleIgnitor();
        this.validatorStyleIgnitor();
        this.initConstants();

        let noEditPermissionsMessage = <div className="col-md-12" style={{ color: '#ff0000' }}><strong>{this.noPermissionMessage}</strong></div>
        let buttonItem = '', cancelItem = '';
        /*if (this.props.currentUser.admin || (this.props.hasRequestEditingPermissions == true &&
            (this.props.currentUser.permissions['crm.requests.add'] && this.props.router.params.reqKey == undefined) ||
            (this.props.currentUser.permissions['crm.requests.edit'] && this.props.router.params.reqKey != undefined))) {
            buttonItem = <button type="submit" disabled={this.isButtonDisabled() || (!this.props.currentUser.admin && ((this.props.statusNotForEdit == true  || (this.props.router.params.reqKey == undefined && this.props.voterDetails.personal_identity == ''))))} className="btn btn-primary btn-md" style={this.generalStyle.buttonSaveStyle} onClick={this.onClickSaveBtn.bind(this)}>{this.addButtonText}</button>;
        }*/

        if (this.props.statusNotForEdit) {
            if (this.props.hasAdminEdit) {
                buttonItem = <button type="submit" className="btn btn-primary btn-md"
                    style={this.generalStyle.buttonSaveStyle}
                    onClick={this.onClickSaveBtn.bind(this)}  disabled={this.saveButtonDisabled()}>
                    {this.addButtonText}
                </button>;
            }
        } else if (this.props.hasRequestEditingPermissions) {
            buttonItem = <button type="submit" className="btn btn-primary btn-md"
                style={this.generalStyle.buttonSaveStyle}
                onClick={this.onClickSaveBtn.bind(this)} disabled={this.saveButtonDisabled()}>
                {this.addButtonText}
            </button>;
        }

        if (this.props.router.params.reqKey == 'new') {
            cancelItem = <button type="submit" disabled={(this.props.statusNotForEdit == true || (this.props.router.params.reqKey == undefined && this.props.voterDetails.personal_identity == ''))} className="btn btn-primary btn-md" style={this.generalStyle.buttonSaveStyle} onClick={this.onClickCancelBtn.bind(this)}>ביטול</button>;
        }

        if (this.props.router.params.reqKey != undefined) {
            this.setAddingUserText();
        }
        let crmDetailsInfoItem = <div style={{ height: '200px' }}></div>;
        let closeDateItem = '';
        let theCloseDate = '';
        let requestStatusTypeClosed = constants.request_status_type_closed;
        let lastUpdateItem = <tr>
            <th style={this.generalStyle.leftThExtended}>עדכון אחרון </th>
            <td style={this.generalStyle.leftTdExtended}>{dateTimeReversePrint(this.props.dataRequest.updated_at, true)}</td>
        </tr>;
        if (this.props.dataRequest.status_type_id == requestStatusTypeClosed) {
            if (this.props.dataRequest.close_date == null) {

            } else {
                theCloseDate = dateTimeReversePrint(this.props.dataRequest.close_date, true);
            }
        }
        if (this.props.router.params.reqKey != undefined && this.props.dataRequest.reqId != '') {

            crmDetailsInfoItem = <div className="col-md-12"  >
                <table style={this.generalStyle.leftTableStyle}>
                    <tbody>
                        <tr>
                            <th style={this.generalStyle.leftTH}>משתמש יוצר </th>
                            <td style={this.generalStyle.leftTD}>{this.props.dataRequest.user_create_name == undefined ? '' : this.props.dataRequest.user_create_name}</td>
                        </tr>
                        <tr>
                            <th style={this.generalStyle.leftTH}>מועד יצירה </th>
                            <td style={this.generalStyle.leftTD}>{dateTimeReversePrint(this.props.dataRequest.created_at, true)}</td>
                        </tr>
                        <tr>
                            <th style={this.generalStyle.leftTH}>מעדכן אחרון </th>
                            <td style={this.generalStyle.leftTD}>{this.props.dataRequest.user_update_name}</td>
                        </tr>
                        <tr>
                            <th style={this.generalStyle.leftTH}>עדכון אחרון </th>
                            <td style={this.generalStyle.leftTD}>{dateTimeReversePrint(this.props.dataRequest.updated_at, true)}</td>
                        </tr>
                        <tr>
                            <th style={this.generalStyle.leftThExtended}>מועד סגירה </th>
                            <td style={this.generalStyle.leftTdExtended}>{theCloseDate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>;

        }


        let requestActions = <div></div>;

        if (this.props.router.params.reqKey != undefined && this.props.dataRequest.reqId != '' && this.props.hasRequestEditingPermissions == true) {
            requestActions = <div className="col-md-8 inqryActions extendedActions nopadding">
                <ul className=" pull-left " style={{ paddingTop: '10px', paddingLeft: '20px' }}>
                    <li className="exportIcon forward"><a href="javascript:void(0)" title="תיעוד שיחה" style={{opacity:(this.props.statusNotForEdit == true ? '0.4' : '' )}} onClick={this.props.statusNotForEdit == true ? null : this.showNewActionModalDialog.bind(this)}><img src={this.imageIcoCallDoc} alt="תיעוד שיחה" />תיעוד שיחה</a></li>
                    <li className="exportIcon forward"><a href="javascript:void(0)" title="העברת פניה" style={{opacity:(this.props.statusNotForEdit == true ? '0.4' : '' )}} onClick={this.props.statusNotForEdit == true ? null : this.forwardRequestHandle.bind(this)}><img src={this.imageIcoForward} alt="העברת פנייה" />העברת פניה</a></li>
                    <li className="exportIcon closeInqry"><a href="javascript:void(0)" title="סגירת פניה" style={{opacity:(this.props.statusNotForEdit == true ? '0.4' : '' )}} onClick={this.props.statusNotForEdit == true ? null : this.closeRequestHandle.bind(this)}><img src={this.imageIcoCloseInqry} alt="סגירת פנייה" />סגירת פניה</a></li>
                    <li className="exportIcon cancelInqry"><a href="javascript:void(0)" title="ביטול פניה" style={{opacity:(this.props.statusNotForEdit == true ? '0.4' : '' )}} onClick={this.props.statusNotForEdit == true ? null : this.cancelRequestHandle.bind(this)}><img src={this.imageIcoCancel} alt="ביטול פנייה" />ביטול פניה</a></li>
                </ul>
            </div>
        }
		 
        return (<div>
            <div className="row">
                <div className="col-md-12">
                    <div className="row " style={{ marginBottom: '25px' }}>
                        <div className="col-md-4" style={this.generalStyle.reqNumHeader} >
                           <div> פנייה מס' {this.props.dataRequest.reqKey}</div>
                           {this.props.dataRequest.voter_key && this.props.dataRequest.unknown_voter_data &&<div style={{color:'red',marginRight:'5px'}} onClick={this.setDisplayUnknowVoter}><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></div>}
                       {this.props.dataRequest.unknown_voter_data &&  this.state.display_unknown_voter_data && 
                        <div style={{marginTop:'45px'}} className="open-modal" >
                            <div style={{fontSize:'16px',opacity:'0.7','margin':'5px 0px 5px 0px',display:'flex',flexDirection:'column'}}>
                               <span> הפניה נוצרה באמצעות פתיחת פניה אנונימית.</span>
                              <span>נא וודא שהנתונים שהוזנו בפתיחת הפניה,זהים לנתונים הקיימים במערכת.</span> 
                            </div>
                            {this.getUnknownVoterDetails()}
                        </div>
                        }
                        </div>
                        {requestActions}
                    </div>
                    <div className="row" style={{ paddingRight: '35px' }}>
                        <div className="col-md-9">
                            <div className='row'>
                                <div className="col-md-6">
                                    {this.renderTopic()}
                                    {this.renderStatus()}
                                    {this.renderDate()}
                                    {this.renderDesc()}
                                </div>
                                <div className="col-md-6">
                                    {this.renderSubTopic()}
                                    {this.renderStatusType()}
                                    {this.renderSource()}
                                    {this.renderPriority()}
                                    {this.renderTeam()}
                                    {this.renderUser()}
                                    {this.renderTargetCloseDate()}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className='row'>
                                {crmDetailsInfoItem}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="row" style={{ marginBottom: '25px' }}>
                <div className="col-md-12">
                    <div className="col-md-8" style={{ marginRight: '25px' }}>
                        {noEditPermissionsMessage}
                    </div>
                    <div className="col-md-3 text-left" style={{ ...this.generalStyle.buttonSaveWrapperStyle, paddingLeft: '1px', margin: '10px' }}>
                        {buttonItem}&nbsp;&nbsp;
                        {cancelItem}
                    </div>
                </div>
                <ModalRequestSourceInfo />
                <ModalRequestSourceFax />
                <ModalRequestSourceEmail currentVoterEmail={this.props.voterDetails.email}
                    updateVoterEmail={this.updateVoterEmail.bind(this)} />
                <ModalRequestSourceCallBiz />
                <ModalRequestSourceOther />
                <ModalTransferRequest />
                <ModalCloseRequest setRequestClosed={this.setRequestClosed.bind(this)} />
                <ModalCancelRequest />
                <AddEditActionModal entity_type={this.entityTypes.request}
                    action_entity_key={this.props.router.params.reqKey}
                    actionTypesList={this.props.actionTypesList}
                    actionStatusesList={this.props.actionStatusesList}
                    actionTopicsList={this.props.actionTopicsList} />

                <ModalWindow title={'יצירת אימייל'} show={this.props.showCreateEmailDialog}   buttonX={this.cancelCreateEmailDialog.bind(this)} buttons={this.state.buttons}>
                    <div>
                        לא קיים אימייל לתושב , ובאפשרותך ליצור לו אימייל עכשיו.
                        <br />
                        במידה והנך מעוניין ליצור אימייל עכשיו לתושב , אנא כתוב אותו :
                        <br />
                        <input type='text' className="form-control form-control-sm" value={this.props.newEmail} onChange={this.newEmailChange.bind(this)} style={{borderColor:(validateEmail(this.props.newEmail) ? '#ccc' : '#ff0000')}} />
                    </div>
                </ModalWindow>
                <ModalWindow title={'הודעה'} show={this.props.showConfirmTimeDelayDlg} buttonCancel={this.closeTimeWarnDialog.bind(this)} buttonX={this.closeTimeWarnDialog.bind(this)} buttonOk={this.cancelNewRequest.bind(this)}>
                    <div>
                        לתושב הנוכחי כבר קיימת פנייה שלא מזמן
                        עשה . האם ברצונך בכל זאת לייצר לו עוד פנייה חדשה ?
                        </div>
                </ModalWindow>
                </div>
        </div>)
    }
    closeTimeWarnDialog() {
	 
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.PERSONAL_ID_CHANGE, data: '' });
        // this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA});
        // this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA});
        // this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAN_TEMP_VOTER_DATA});
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.SET_MODAL_DISPLAY_DELAY_TIME_SHOW, data: false });

		 
        if (this.props.router.location.search != '') {
            this.props.router.goBack();
        } else {
            this.props.router.push('crm/requests');
        }
    }

    cancelNewRequest() {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.SET_MODAL_DISPLAY_DELAY_TIME_SHOW, data: false });

    }


    isButtonDisabled() {
        return this.props.dirtyComponents.indexOf('crm.requests.general') == -1 || this.props.savingChanges;
    }
    updateVoterEmail(newEmail) {
        let voterKey = this.props.voterDetails.key;
        VoterActions.saveVoterEmail(this.props.dispatch, voterKey, newEmail);
    }
}

function mapStateToProps(state) {
    return {
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        searchVoterDetails: state.voters.voterDetails,
        voterDetails: state.voters.voterDetails,
        voterScreen: state.voters.voterScreen,
        showConfirmTimeDelayDlg: state.crm.searchRequestsScreen.showConfirmTimeDelayDlg,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        topicList: state.crm.searchRequestsScreen.topicList,
        subTopicList: state.crm.searchRequestsScreen.subTopicList,
        statusList: state.crm.searchRequestsScreen.statusList,
        statusTypesList: state.crm.searchRequestsScreen.statusTypesList,
        priorityList: state.crm.searchRequestsScreen.priorityList,
        requestSourceList: state.crm.searchRequestsScreen.requestSourceList,
        users: state.system.teamsScreen.minimalUsers,
        teams: state.system.teamsScreen.minimalTeams,
        staticTeams: state.system.teamsScreen.staticTeams,
        staticUsers: state.system.teamsScreen.staticUsers,
        addingEditingRequest: state.crm.addingEditingRequest,
        showModalDialog: state.crm.searchRequestsScreen.showModalDialog,
        modalHeaderText: state.crm.searchRequestsScreen.modalHeaderText,
        modalContentText: state.crm.searchRequestsScreen.modalContentText,
        currentUser: state.system.currentUser,
        systemSettings: state.system.systemSettings,
        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
        currentTeams: state.crm.requestSearch.lists.currentUserRoleTeams,
        addUnknownVoterScreen: state.crm.addUnknownVoterScreen,
        newEmail: state.crm.searchRequestsScreen.newEmail,
        oldVoterDetails: state.voters.oldVoterDetails,
        showCreateEmailDialog: state.crm.searchRequestsScreen.showCreateEmailDialog,
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        //        showRequestSourceFaxModalDialog: state.crm.searchRequestsScreen.showRequestSourceFaxModalDialog,                       
        //        showRequestSourceEmailModalDialog: state.crm.searchRequestsScreen.showRequestSourceEmailModalDialog,  
        //        showRequestSourceInfoModalDialog: state.crm.searchRequestsScreen.showRequestSourceEmailModalDialog,             
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        newActionDetails: state.crm.searchRequestsScreen.newActionDetails,
        modalCloseRequestDetails: state.crm.searchRequestsScreen.modalCloseRequestDetails,
        actionTypesList: state.crm.searchRequestsScreen.actionTypesList,
        actionStatusesList: state.crm.searchRequestsScreen.actionStatusesList,
        actionTopicsList: state.crm.searchRequestsScreen.actionTopicsList,
    }
}

export default connect(mapStateToProps)(withRouter(RequestInput));
