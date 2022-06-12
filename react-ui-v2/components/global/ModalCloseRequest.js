import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import Combo from './Combo';
import constants from 'libs/constants';
import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validatePhoneNumber } from '../../libs/globalFunctions';

class ModalCloseRequest extends React.Component {
    
    componentDidMount() {
        //this.hideCloseRequestModal();
    }

    componentWillMount() {
        this.statusTypeClosed = 3;
        CrmActions.getRequestSourceByKey(this.props.dispatch, null);
        CrmActions.getRequestClosureReasonByKey(this.props.dispatch, null);
        CrmActions.getCloseRequestStatusesByType(this.props.dispatch, this.statusTypeClosed);
        CrmActions.getRequestSatisfactionVoter(this.props.dispatch);
    }

    saveCloseRequest() {

      if (this.props.modalCloseRequestDetails.status_name.trim() != '' && this.props.modalCloseRequestDetails.reason_name.trim() != '' && this.props.modalCloseRequestDetails.details.trim() != ''){
        let topicID = null, subTopicID = null, statusID = null, requestSourceID = null, requestSourceFax = null, requestSourceEmail = null, 
        requestSourcePhone = null, requestSourceFirstName = null, requestSourceLastName = null, priorityID = null, targetCloseDate = null, userID = null, teamID = null, targetCloseDateFormatted = null, requestDate = null, requestDateFormatted = null;

        if (this.props.originalDataRequest.status_name != this.props.modalCloseRequestDetails.status_name){
            statusID = this.getStatusID(this.props.modalCloseRequestDetails.status_name);          
        }

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

        let isSendEmail = false;
        let isIncludeClosingReason = false;
        if (this.voterHasEmail()) {
            isSendEmail = this.props.modalCloseRequestDetails.isSendEmail;
            isIncludeClosingReason = this.props.modalCloseRequestDetails.isIncludeClosingReason;
        }

        if ( this.props.requestSourceDocumentDetails.file == null || this.props.requestSourceDocumentDetails.file == undefined && statusID != null && closureReasonID != null){

            let actionType = constants.request_action_type_close;
            let closureReasonID = this.getClosureReasonID(this.props.modalCloseRequestDetails.reason_name);
			this.props.setRequestClosed(actionType,this.props.modalCloseRequestDetails.status_name,newDesc);
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
                this.props.modalCloseRequestDetails.status_name,
                this.props.dataRequest.request_source_name,
                this.props.dataRequest.request_source_fax, 
                this.props.dataRequest.request_source_email, 
                this.props.dataRequest.request_source_phone, 
                this.props.dataRequest.request_source_first_name, 
                this.props.dataRequest.request_source_last_name,
                this.props.dataRequest.priority_name,
                this.props.dataRequest.user_handler_name,
                this.props.dataRequest.team_name, targetCloseDateFormatted,
                requestDate , newDesc , oldDesc, this.props.newCallbizDetails.ID , this.props.newCallbizDetails.datetime , 
                this.props.newCallbizDetails.details, this.props.modalCloseRequestDetails.details, actionType, closureReasonID, 
                this.props.modalCloseRequestDetails.voter_satisfaction, isSendEmail, isIncludeClosingReason
                );

            this.hideCloseRequestModal();
            } 
      }
      
    }

    hideCloseRequestModal() {

        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_CLOSE_REQUEST_MODAL}); 
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

    statusOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            let statusName = e.target.value;
            let statusTypeName = this.getStatusTypeName(statusName);
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_STATUS_CHANGE, data: statusName, statusTypeName: statusTypeName});
        
    }

    reasonOnChange(e) {

     //       this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            let reasonName = e.target.value;
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_REASON_CHANGE, data: reasonName});        
    }

    detailsOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            let details = e.target.value;
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_DETAILS_CHANGE, details: details});      
    }  

    voterSatisfactionOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            let voter_satisfaction = e.target.value;
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_VOTER_SATISFACTION_CHANGE, voter_satisfaction: voter_satisfaction});       
    }

    sendEmailOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_SEND_EMAIL_CHANGE, data: !this.props.modalCloseRequestDetails.isSendEmail});                
    }

    includeReasonOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CLOSE_REQUEST_INCLUDE_CLOSING_REASON_CHANGE, data: !this.props.modalCloseRequestDetails.isIncludeClosingReason});  
    }  

        /* This function returns status id by status name and status-type id */
    getStatusID(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.modalCloseRequestDetails.statusList.length; i < len; i++) {
            if (this.props.modalCloseRequestDetails.statusList[i].name == StatusName) {
                returnedValue = this.props.modalCloseRequestDetails.statusList[i].id;
                break;
            }
        }
        return returnedValue;
    }  
        /* This function returns status id by status name and status-type id */
    getStatusTypeName(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.modalCloseRequestDetails.statusList.length; i < len; i++) {
            if (this.props.modalCloseRequestDetails.statusList[i].name == StatusName) {
                returnedValue = this.props.modalCloseRequestDetails.statusList[i].status_type_name;
                break;
            }
        }
        return returnedValue;
    }
        /* This function returns closure reason id by closure reason name */
    getClosureReasonID(ClosureReasonName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.requestCloseReasonList.length; i < len; i++) {
            if (this.props.requestCloseReasonList[i].name == ClosureReasonName) {
                returnedValue = this.props.requestCloseReasonList[i].id;
                break;
            }
        }
        return returnedValue;
    } 



    initVariables() {

      this.modalTitle = "סגירת פניה";
      this.generalStyle = {};
      this.validatorsStyle = {};

      this.generalStyle.smallTitleStyle = {color: '#111111', fontWeight: '700', fontSize: '16px'};
        let statusID = this.getStatusID(this.props.modalCloseRequestDetails.status_name);
        if (this.props.modalCloseRequestDetails.status_name.trim() == '' || statusID == '') {
            this.validatorsStyle.statusStyle = {borderColor: '#ff0000'};
            this.missingStatus = true;
        } else {

            this.validatorsStyle.statusStyle = {borderColor: '#cccccc'};
            this.missingStatus = false;
        }

        let closureReasonID = this.getClosureReasonID(this.props.modalCloseRequestDetails.reason_name);
        if (this.props.modalCloseRequestDetails.reason_name.trim() == '' || closureReasonID == '') {
            this.validatorsStyle.closureReasonStyle = {borderColor: '#ff0000'};
            this.missingTeam = true;
        } else {

            this.validatorsStyle.closureReasonStyle = {borderColor: '#cccccc'};
            this.missingTeam = false;
        }

        if (this.props.modalCloseRequestDetails.details.trim() == ''){            
            this.validatorsStyle.detailsStyle = {borderColor: '#ff0000'};
            this.missingTransferReason = true;
        } else {
            this.validatorsStyle.detailsStyle = {borderColor: '#cccccc'};
            this.missingTransferReason = false;
        }
    }

    voterHasEmail() {
        if ((this.props.dataRequest.voter_id != undefined)&&(this.props.dataRequest.voter_id > 0)) {
            if ((this.props.voterDetails.email != undefined)&&(this.props.voterDetails.email.trim() != '')) return true;
            else return false;
        } else {
            if ((this.props.addUnknownVoterScreen.email != undefined)&&(this.props.addUnknownVoterScreen.email.trim() != '')) return true;
            return false;
        }
    }

    getVoterEmail() {
        if ((this.props.dataRequest.voter_id != undefined)&&(this.props.dataRequest.voter_id > 0)) {
            return this.props.voterDetails.email;
        } else {
            return this.props.addUnknownVoterScreen.email;
        }        
    }

    renderEmailCheckbox() {
        return (
          <div className="row" style={{paddingBottom:'20px'}}>                                
            <div className="checkbox">
                <label><input type="checkbox" 
                    checked={this.props.modalCloseRequestDetails.isSendEmail == undefined ? true : this.props.modalCloseRequestDetails.isSendEmail}
                    onChange={this.sendEmailOnChange.bind(this)}/> הודעה על סגירת הפניה תשלח לתושב, לכתובת המייל <span>{this.getVoterEmail()}</span> </label>                                                                   
                <label><input type="checkbox" 
                    checked={this.props.modalCloseRequestDetails.isIncludeClosingReason == undefined ? true : this.props.modalCloseRequestDetails.isIncludeClosingReason}
                    onChange={this.includeReasonOnChange.bind(this)}/> כלול את ההסבר לסיבת סגירת הפניה בהודעה לפונה</label>    
            </div>
          </div>
        );
    }

    renderSatisfactionInputs(){
        let satisfactionRows = this.props.requestSatisfactionList.map((item) => {
            let itemId = item.id;
            return (
                <label key={itemId} style={{padding:'0 10px'}}>
                    <input id={'fb' + itemId} type="radio" name="satisMeter" value={itemId}/>
                    <span className={'smile fb' + itemId}></span>
                </label>
            )
        })
        return (
            <div className="stsfcttMtrContainer" onChange={this.voterSatisfactionOnChange.bind(this)}>
                {satisfactionRows}
            </div>
        )
    }
   render() {

        this.initVariables();

        return (
            <ModalWindow show={this.props.showCloseRequestModalDialog} title={this.modalTitle}
                         buttonOk={this.saveCloseRequest.bind(this)}
                         buttonCancel={this.hideCloseRequestModal.bind(this)}
                         buttonX={this.hideCloseRequestModal.bind(this)}>
                 <div>        
                <div className="row">

                          <div className="modal-body" style={{width: '500px'}}>
                        <form className="form-horizontal">

                             <div className="row" style={{paddingBottom:'20px'}}>
                                <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                                    סטטוס סגירה   
                                </div>
                                <div className="col-md-7">
                                    <Combo items={this.props.modalCloseRequestDetails.statusList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.modalCloseRequestDetails.status_name} onChange={this.statusOnChange.bind(this)} inputStyle={this.validatorsStyle.statusStyle} />
                                </div>
                             </div>

                              <div className="row" style={{paddingBottom:'20px'}}>
                                <div className="col-md-4" style={this.generalStyle.smallTitleStyle} >
                                   סיבת סגירה  
                                </div>
                                <div className="col-md-7">
                                  <Combo items={this.props.requestCloseReasonList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.modalCloseRequestDetails.reason_name} onChange={this.reasonOnChange.bind(this)} inputStyle={this.validatorsStyle.closureReasonStyle} />
                                </div>
                              </div>

                              <div className="row" style={{paddingBottom:'20px'}}>
                                <label className="col-sm-4 control-label" style={this.generalStyle.smallTitleStyle}>תיאור מילולי</label>
                                <div className="col-sm-7">
                                    <textarea className="form-control" rows="4" id="closeReason" placeholder="סיבת סגירת הפניה"
                                        style={this.validatorsStyle.detailsStyle}
                                        value={this.props.modalCloseRequestDetails.details == undefined ? '' : this.props.modalCloseRequestDetails.details}
                                        onChange={this.detailsOnChange.bind(this)}>
                                    </textarea>                                
                                </div>
                            </div>
                              
                          <div className="form-group">
                             <div className="col-sm-4">
                                <label  className=" control-label" style={this.generalStyle.smallTitleStyle}>הערכת שביעות הרצון</label>
                              </div>

                              <div className="col-sm-7">
                                  {this.renderSatisfactionInputs()}
                            </div>
                        </div>  
                        {(this.voterHasEmail()? this.renderEmailCheckbox() : '')}
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
        showCloseRequestModalDialog: state.crm.searchRequestsScreen.showCloseRequestModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        modalCloseRequestDetails: state.crm.searchRequestsScreen.modalCloseRequestDetails,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        currentUser: state.system.currentUser,
        users: state.system.teamsScreen.minimalUsers,
        teams: state.system.teamsScreen.minimalTeams,
        newActionDetails: state.crm.searchRequestsScreen.newActionDetails,
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        requestSourceList : state.crm.searchRequestsScreen.requestSourceList,
        statusList : state.crm.searchRequestsScreen.statusList,
        requestCloseReasonList: state.crm.searchRequestsScreen.requestCloseReasonList,
        requestSatisfactionList: state.crm.searchRequestsScreen.requestSatisfactionList,
        voterDetails:state.voters.voterDetails,
        addUnknownVoterScreen: state.crm.addUnknownVoterScreen
    }
}

export default connect(mapStateToProps)(withRouter(ModalCloseRequest))