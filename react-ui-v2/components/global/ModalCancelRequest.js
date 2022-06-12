import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import Combo from './Combo';

import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validatePhoneNumber } from '../../libs/globalFunctions';

import constants from 'libs/constants';

class ModalCancelRequest extends React.Component {
    
    componentDidMount() {
        //this.hideCloseRequestModal();
    }

    componentWillMount() {
        this.statusTypeCanceled = 4
        CrmActions.getRequestSourceByKey(this.props.dispatch, null);
        //CrmActions.getRequestClosureReasonByKey(this.props.dispatch, null);
        CrmActions.getCancelRequestStatusesByType(this.props.dispatch, this.statusTypeCanceled);
    }

    saveCancelRequest() {

      if (this.props.modalCancelRequestDetails.status_name.trim() != '' && this.props.modalCancelRequestDetails.details.trim() != ''){
        let topicID = null, subTopicID = null, statusID = null, requestSourceID = null, requestSourceFax = null, requestSourceEmail = null, 
        requestSourcePhone = null, requestSourceFirstName = null, requestSourceLastName = null, priorityID = null, targetCloseDate = null, userID = null, 
        teamID = null, targetCloseDateFormatted = null, requestDate = null, requestDateFormatted = null ;

        if (this.props.originalDataRequest.status_name != this.props.modalCancelRequestDetails.status_name){
            statusID = this.getStatusID(this.props.modalCancelRequestDetails.status_name);          
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

        if ( this.props.requestSourceDocumentDetails.file == null || this.props.requestSourceDocumentDetails.file == undefined && statusID != null ){

            let actionType = constants.request_action_type_cancel; // 1= transfer request, 2= close request, 3=cancel request
            let closureReasonID = null, voter_satisfaction = null, isSendEmail = null, isIncludeClosingReason = null

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
                this.props.modalCancelRequestDetails.status_name,
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
                this.props.newCallbizDetails.details, this.props.modalCancelRequestDetails.details, actionType, closureReasonID, 
                voter_satisfaction, isSendEmail, isIncludeClosingReason
                );

            this.hideCancelRequestModal();
            } 
      }
      
    }

    hideCancelRequestModal() {

        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_CANCEL_REQUEST_MODAL}); 
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
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CANCEL_REQUEST_STATUS_CHANGE, data: statusName, statusTypeName: statusTypeName});
        
    }

    detailsOnChange(e) {

    //        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
            let details = e.target.value;
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.MODAL_CANCEL_REQUEST_DETAILS_CHANGE, details: details});      
    }  

        /* This function returns status id by status name and status-type id */
    getStatusID(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.modalCancelRequestDetails.statusList.length; i < len; i++) {
            if (this.props.modalCancelRequestDetails.statusList[i].name == StatusName) {
                returnedValue = this.props.modalCancelRequestDetails.statusList[i].id;
                break;
            }
        }
        return returnedValue;
    }  
        /* This function returns status id by status name and status-type id */
    getStatusTypeName(StatusName) {
        let returnedValue = "";
        for (let i = 0, len = this.props.modalCancelRequestDetails.statusList.length; i < len; i++) {
            if (this.props.modalCancelRequestDetails.statusList[i].name == StatusName) {
                returnedValue = this.props.modalCancelRequestDetails.statusList[i].status_type_name;
                break;
            }
        }
        return returnedValue;
    }

    initVariables() {

      this.modalTitle = "ביטול פניה";
      this.generalStyle = {};
      this.validatorsStyle = {};

      this.generalStyle.smallTitleStyle = {color: '#111111', fontWeight: '700', fontSize: '16px'};
        let statusID = this.getStatusID(this.props.modalCancelRequestDetails.status_name);
        if (this.props.modalCancelRequestDetails.status_name.trim() == '' || statusID == '') {
            this.validatorsStyle.statusStyle = {borderColor: '#ff0000'};
            this.missingStatus = true;
        } else {

            this.validatorsStyle.statusStyle = {borderColor: '#cccccc'};
            this.missingStatus = false;
        }

        if (this.props.modalCancelRequestDetails.details.trim() == ''){            
            this.validatorsStyle.detailsStyle = {borderColor: '#ff0000'};
            this.missingTransferReason = true;
        } else {
            this.validatorsStyle.detailsStyle = {borderColor: '#cccccc'};
            this.missingTransferReason = false;
        }
    }


   render() {

        this.initVariables();

        return (
            <ModalWindow show={this.props.showCancelRequestModalDialog} title={this.modalTitle}
                         buttonOk={this.saveCancelRequest.bind(this)}
                         buttonCancel={this.hideCancelRequestModal.bind(this)}
                         buttonX={this.hideCancelRequestModal.bind(this)}>
                 <div>        
                <div className="row">

                          <div className="modal-body" style={{width: '500px'}}>
                        <form className="form-horizontal">

                             <div className="row" style={{paddingBottom:'20px'}}>
                                <div className="col-md-4" style={this.generalStyle.smallTitleStyle}>
                                    סטטוס ביטול   
                                </div>
                                <div className="col-md-7">
                                    <Combo items={this.props.modalCancelRequestDetails.statusList} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.modalCancelRequestDetails.status_name} onChange={this.statusOnChange.bind(this)} inputStyle={this.validatorsStyle.statusStyle} />
                                </div>
                             </div>
                              
                              <div className="row" style={{paddingBottom:'20px'}}>
                                <label className="col-sm-4 control-label" style={this.generalStyle.smallTitleStyle}>תיאור מילולי</label>
                                <div className="col-sm-7">
                                    <textarea className="form-control" rows="4" id="cancelReason" placeholder="סיבת ביטול הפניה"
                                        style={this.validatorsStyle.detailsStyle}
                                        value={this.props.modalCancelRequestDetails.details == undefined ? '' : this.props.modalCancelRequestDetails.details}
                                        onChange={this.detailsOnChange.bind(this)}>
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
        showCancelRequestModalDialog: state.crm.searchRequestsScreen.showCancelRequestModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        modalCancelRequestDetails: state.crm.searchRequestsScreen.modalCancelRequestDetails,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        currentUser: state.system.currentUser,
        newActionDetails: state.crm.searchRequestsScreen.newActionDetails,
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        requestSourceList : state.crm.searchRequestsScreen.requestSourceList,        

    }
}

export default connect(mapStateToProps)(withRouter(ModalCancelRequest))