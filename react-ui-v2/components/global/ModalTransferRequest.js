import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import Combo from './Combo';

import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';


import { validatePhoneNumber } from '../../libs/globalFunctions';

import constants from 'libs/constants';

class ModalTransferRequest extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      recheckUserHandler: false
    };
  }

    componentDidMount() {
        this.hideTransferRequestModal();
    }

    componentWillMount() {
        SystemActions.loadMinimalTeams(this.props.dispatch , this.props.router, null, 1);
        SystemActions.loadMinimalUsersForTeam(this.props.dispatch);
        CrmActions.getRequestSourceByKey(this.props.dispatch, null);
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.modalTransferRequestDetails.team_name == '')&&(nextProps.modalTransferRequestDetails.team_name != '')) {
            SystemActions.loadMinimalUsersForTeam(this.props.dispatch , nextProps.modalTransferRequestDetails.teamKey);
        }

        if (nextProps.params.reqKey == 'new' && this.props.params.reqKey != 'new'){
            SystemActions.loadMinimalUsersForTeam(this.props.dispatch );
        }

        if ((this.state.recheckUserHandler)&&(!_.isEqual(this.props.users, nextProps.users))) {
            this.setState({
                changedUsers: true
            });
        }      
    }

    userHandlerOnChange(e) {
        /*
         * do correlation with teamHandler
         */
          //this.updatedUser = 1;
            this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.transfer'});
           // this.props.dataRequest.team_name = '';
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_USER_HANDLER_CHANGE, userHandlerName: e.target.value, users: this.props.users});
            let userID = -1;
            let userKey = '';
            for(let i = 0 , len = this.props.users.length ; i<len ; i++){
                 if(this.props.users[i].name == e.target.value){
                     userID = this.props.users[i].id;
                     userKey = this.props.users[i].key;
                     break;                 
                 }
            }
            if(userID == -1){
                SystemActions.loadMinimalTeams(this.props.dispatch  , this.props.router, null, 1);
//             this.props.dispatch({type: SystemActions.ActionTypes.RESET_TEAM_HANDLERS, data: this.props.staticTeams });
            }
            else{
                SystemActions.loadMinimalTeams(this.props.dispatch  , this.props.router, userKey, 1); 
            }  
    }

    teamHandlerOnChange(e) {
      /*
       * do correlation with userHandler
       */
      let team = (this.getTeam(e.target.value));
      this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.transfer'});
      if(team == null){
          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_TEAM_HANDLER_CHANGE, teamHandlerName: e.target.value });
          this.props.dispatch({type: SystemActions.ActionTypes.RESET_USER_HANDLERS, data: []});
      } else{
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_TEAM_HANDLER_CHANGE, teamHandlerName: e.target.value, teamHandlerKey: team.key });
        this.setState({
            recheckUserHandler: true
        });
          SystemActions.loadMinimalUsersForTeam(this.props.dispatch , team.key,null,constants.module_type.requests,true); 
      }        
    }

    isFilled(){
        let userID = this.getUserID(this.props.modalTransferRequestDetails.user_handler_name);
        let team = this.getTeam(this.props.modalTransferRequestDetails.team_name);
        return (team != null && userID > -1 && this.props.newActionDetails.details.trim() != '');
    }

    saveTransferRequest() {

      if (this.isFilled()){
        let topicID = null, subTopicID = null, statusID = null, requestSourceID = null, requestSourceFax = null, requestSourceEmail = null, 
        requestSourcePhone = null, requestSourceFirstName = null, requestSourceLastName = null, priorityID = null, targetCloseDate = null, 
        userID = null, team = null, targetCloseDateFormatted = null, requestDate = null, requestDateFormatted = null;

        if (this.props.originalDataRequest.user_handler_name != this.props.modalTransferRequestDetails.user_handler_name)
            userID = this.getUserID(this.props.modalTransferRequestDetails.user_handler_name);
        // if (this.props.originalDataRequest.team_name != this.props.modalTransferRequestDetails.team_name)
            team = this.getTeam(this.props.modalTransferRequestDetails.team_name);

        let closeDate = null;
        if (targetCloseDate != null) {
            let targetCloseDateArr = targetCloseDate.split('/');
            targetCloseDate = targetCloseDateArr[2] + '-' + targetCloseDateArr[1] + '-' + targetCloseDateArr[0] + ' 00:00:00';
            targetCloseDateFormatted = targetCloseDateArr[0] + '/' + targetCloseDateArr[1] + '/' + targetCloseDateArr[2];
        } 

        if (requestDate != null) {
            let requestDateParts = requestDate.split(' ');

            let requestDateArr = requestDateParts[0].split('/');
            requestDate = requestDateArr[2] + '-' + requestDateArr[1] + '-' + requestDateArr[0] + ' '  + requestDateParts[1];
            requestDateFormatted = requestDateArr[0] + '/' + requestDateArr[1] + '/' + requestDateArr[2];
        }


        let originalCloseDateArr = this.props.originalDataRequest.target_close_date.split('/');
        let originalCloseDate = originalCloseDateArr[0] + '/' + originalCloseDateArr[1] + '/' + originalCloseDateArr[2];

        //this.OriginalStatusName = this.props.dataRequest.status_name;
        requestSourceID = this.getRequestSourceID(this.props.dataRequest.request_source_name);
        let newDesc = null;
        let oldDesc = null;
        if(this.props.dataRequest.user_create_key == this.props.currentUser.key){
            if(this.props.originalDataRequest.first_desc != this.props.dataRequest.first_desc){
                newDesc = this.props.dataRequest.first_desc;
                oldDesc = this.props.originalDataRequest.first_desc;
            }
             
        }
        if ( this.props.requestSourceDocumentDetails.file == null || this.props.requestSourceDocumentDetails.file == undefined || this.props.requestSourceDocumentDetails.file == ''){

            let actionType = constants.request_action_type_transfer; // 1= transfer request, 2= close request, 3=cancel request
            let closureReasonID = null, voterSatisfaction = null, isSendEmail = null, isIncludeClosingReason = null; //close request params 
            
            CrmActions.editRequest(this.props.dispatch, this.props.router, this.props.router.params.reqKey,
                topicID, subTopicID, statusID, requestSourceID, requestSourceFax, requestSourceEmail, requestSourcePhone, requestSourceFirstName,
                requestSourceLastName, priorityID, userID, (team == null)? -1 : team.id, targetCloseDate, requestDate,
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
                this.props.modalTransferRequestDetails.user_handler_name,
                this.props.modalTransferRequestDetails.team_name, targetCloseDateFormatted,
                requestDate , newDesc , oldDesc, this.props.newCallbizDetails.ID , this.props.newCallbizDetails.datetime , 
                this.props.newCallbizDetails.details, this.props.newActionDetails.details, actionType, 
                closureReasonID, voterSatisfaction, isSendEmail, isIncludeClosingReason
                );

            this.hideTransferRequestModal();
            } 
      }
      
    }

    componentDidUpdate() {
      if (this.state.recheckUserHandler && this.state.changedUsers) {
          this.setState({
              recheckUserHandler: false,
              changedUsers: false
          });
          this.setUserHandlerToTeamLeader();
      }
    }

    setUserHandlerToTeamLeader() {
      let team = this.getTeam(this.props.modalTransferRequestDetails.team_name);
      let user_name = '';
      let user_id = null;
      let user_key = null;
      let updateUser = false;

      if (!this.userInUsers(this.props.modalTransferRequestDetails.user_handler_id)) {
          if ((team != null)&&(this.userInUsers(team.leader_id))) {
              user_name = team.first_name + ' ' + team.last_name;
              user_id = team.leader_id;
              user_key = team.leader_key;
          }
          updateUser = true;
      }

      if (updateUser) {
          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_TRANSFER_REQUEST_USER_HANDLER_CHANGE, userHandlerName:user_name, userHandlerId:user_id, users: this.props.users});
          SystemActions.loadMinimalTeams(this.props.dispatch  , this.props.router, user_key, 1);                
      }
    }

    userInUsers(userId) {
        for (let i=0; i<this.props.users.length; i++) {
            if (this.props.users[i].id == userId) {
                return true;
            }
        }
        return false;    
    }


    hideTransferRequestModal() {
        this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY, target:'crm.requests.transfer'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_TRANSFER_REQUEST_MODAL}); 
    }

    requestTransferReason(e) {
        var transferRequestReason = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.transfer'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_OPERATION_DETAILS_CHANGED, newValue: transferRequestReason });
    }
      
    /* This function returns user hanler id by user full name */
    getUserID(fullName) {

        let returnedValue = -1;
        for (let i = 0, len = this.props.users.length; i < len; i++) {
            if ((this.props.users[i].name) == fullName) {
                returnedValue = this.props.users[i].id;
                break;
            }
        }

        return returnedValue;
    }

    /* This function returns handler team id by team name */
    getTeam(teamName) {
        let returnedValue = null;
        for (let i = 0, len = this.props.teams.length; i < len; i++) {
            if ((this.props.teams[i].name) == teamName) {
                returnedValue = this.props.teams[i];
                break;
            }
        }
        return returnedValue;
    }

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

    initVariables() {

      this.modalTitle = "העברת פניה";
      this.generalStyle = {};
      this.validatorsStyle = {};

      this.generalStyle.smallTitleStyle = {color: '#111111', fontWeight: '700', fontSize: '16px'};
      let userID = this.getUserID(this.props.modalTransferRequestDetails.user_handler_name);
        if (userID == -1) {
            this.validatorsStyle.userStyle = {borderColor: '#ff0000'};
            this.missingUser = true;
        } else {

            this.validatorsStyle.userStyle = {borderColor: '#cccccc'};
            this.missingUser = false;
        }

        let team = this.getTeam(this.props.modalTransferRequestDetails.team_name);
        if (team == null) {
            this.validatorsStyle.teamStyle = {borderColor: '#ff0000'};
            this.missingTeam = true;
        } else {

            this.validatorsStyle.teamStyle = {borderColor: '#cccccc'};
            this.missingTeam = false;
        }

        if (this.props.newActionDetails.details.trim() == ''){            
            this.validatorsStyle.transferReasonStyle = {borderColor: '#ff0000'};
            this.missingTransferReason = true;
        } else {
            this.validatorsStyle.transferReasonStyle = {borderColor: '#cccccc'};
            this.missingTransferReason = false;
        }
    }


   render() {

        this.initVariables();

        return (
            <ModalWindow show={this.props.showTransferRequestModalDialog} title={this.modalTitle}
                         buttonOk={this.saveTransferRequest.bind(this)}
                         buttonCancel={this.hideTransferRequestModal.bind(this)}
                         buttonX={this.hideTransferRequestModal.bind(this)}
                         disabledOkStatus={!this.isFilled()}
                         >
                 <div>        
                <div className="row">

                          <div className="modal-body">
                        <form className="form-horizontal">
                            <div className="row" style={{paddingBottom:'20px'}}>
                               <div className="col-md-5" style={this.generalStyle.smallTitleStyle}>
                                  צוות מטפל   
                                </div>
                                <div className="col-md-7">
                                   <Combo items={this.props.teams} maxDisplayItems={5} itemIdProperty="id"
                                          itemDisplayProperty='name'
                                          value={"" + this.props.modalTransferRequestDetails.team_name}
                                          onChange={this.teamHandlerOnChange.bind(this)}
                                          inputStyle={this.validatorsStyle.teamStyle} />
                                </div>
                              </div>
                              <div className="row" style={{paddingBottom:'20px'}}>
                                <div className="col-md-5" style={this.generalStyle.smallTitleStyle} >
                                  משתמש מטפל  
                                </div>
                                <div className="col-md-7">
                                  <Combo  items={this.props.users} 
                                          maxDisplayItems={5} 
                                          itemIdProperty="id" 
                                          itemDisplayProperty='name' 
                                          value={this.props.modalTransferRequestDetails.user_handler_name} 
                                          onChange={this.userHandlerOnChange.bind(this)} 
                                          inputStyle={this.validatorsStyle.userStyle} />
                                </div>
                              </div>
                              <div className="row" style={{paddingBottom:'20px'}}>
                                <label className="col-sm-5 control-label" style={this.generalStyle.smallTitleStyle}>סיבת העברה</label>
                                <div className="col-sm-7">
                                    <textarea className="form-control" rows="4" placeholder="סיבת העברה"
                                        style={this.validatorsStyle.transferReasonStyle}
                                        value={this.props.newActionDetails.details == undefined ? '' : this.props.newActionDetails.details}
                                        onChange={this.requestTransferReason.bind(this)}>
                                    </textarea>
                                    
                                </div>
                            </div>
                        </form>
                      </div>                        
                  </div>
                  </div>
                  </ModalWindow>
        )
    }

}



function mapStateToProps(state) {
    return {
        showTransferRequestModalDialog: state.crm.searchRequestsScreen.showTransferRequestModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        modalTransferRequestDetails: state.crm.searchRequestsScreen.modalTransferRequestDetails,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        currentUser: state.system.currentUser,
        users: state.system.teamsScreen.minimalUsers,
        teams: state.system.teamsScreen.minimalTeams,
        newActionDetails: state.crm.searchRequestsScreen.newActionDetails,
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        requestSourceList : state.crm.searchRequestsScreen.requestSourceList,
        staticUsers:state.system.teamsScreen.staticUsers,
    }
}

export default connect(mapStateToProps)(withRouter(ModalTransferRequest))