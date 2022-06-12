import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validateEmail, validatePhoneNumber } from '../../libs/globalFunctions';

/**
 * This component is a global Modal
 *
 * The component recieves as a parameter an
 * object of user fields were 2 fields
 * must be in the object: key

 *
 *
 * Example:
 *   showRequestSourceEmailModalDialog() {
 *       this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SHOW_REQUEST_SOURCE_EMAIL_MODAL});
 *   }
 */

class ModalRequestSourceInfo extends React.Component {

    componentDidMount() {
        this.hideRequestSourceInfoModalDialog();      
    }

    componentWillMount() {
      CrmActions.getRequestSourceByKey(this.props.dispatch, null);
    }

    /**
     * This function hides the request source email modal
     */
    hideRequestSourceInfoModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL});
    }

    closeRequestSourceInfoModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_INFO_MODAL});
    }
      
    initVariables() {
      this.borderColor = {
          valid: '#ccc',
          inValid: '#ff0000'
      }
      this.modalTitle = 'מקור הפניה';
      this.flatStyleInfo = { borderColor: this.borderColor.valid}
      if (validatePhoneNumber(this.props.dataRequest.request_source_fax)){            
          this.flatStyleFaxNumber = { borderColor: this.borderColor.valid}
      } else {
          this.flatStyleFaxNumber = { borderColor: this.borderColor.inValid}
      }
      if (this.props.dataRequest.request_source_email != undefined){
        if (validateEmail(this.props.dataRequest.request_source_email)){            
          this.flatStyleEmail = { borderColor: this.borderColor.valid}
        } else {
          this.flatStyleEmail = { borderColor: this.borderColor.inValid}
        }
      }
      if (validatePhoneNumber(this.props.dataRequest.request_source_phone)){            
          this.flatStylePhone = { borderColor: this.borderColor.valid}
      } else {
          this.flatStylePhone = { borderColor: this.borderColor.inValid}
      }
      if (this.props.dataRequest.request_source_first_name == undefined || this.props.dataRequest.request_source_first_name == null){
        this.flatStyleFirstName = { borderColor: this.borderColor.inValid}
      }
      else if (this.props.dataRequest.request_source_first_name.trim() != ''){            
          this.flatStyleFirstName = { borderColor: this.borderColor.valid}
      } else {
          this.flatStyleFirstName = { borderColor: this.borderColor.inValid}
      }

      this.flatStyleLastName = {
          borderColor: this.borderColor.valid
      }
    }

        /* This function returns request source id by request source name */
    getRequestSourceSystemName(requestSourceId) {
        let returnedValue = "";
        for (let i = 0, len = this.props.requestSourceList.length; i < len; i++) {
            if (this.props.requestSourceList[i].id == requestSourceId) {
                returnedValue = this.props.requestSourceList[i].system_name;
                break;
            }
        }
        return returnedValue;
    }

    editRequestSourceDetails() {

      let sourceSystemName = this.getRequestSourceSystemName(this.props.dataRequest.request_source_id);

      if (sourceSystemName == 'fax' && validatePhoneNumber(this.props.dataRequest.request_source_fax) ){
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL }); 
      }
      if (sourceSystemName == 'email' && this.props.dataRequest.request_source_email != undefined ){
        if (validateEmail(this.props.dataRequest.request_source_email)){
          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL });
        }
      } 
      if (sourceSystemName == 'other' && this.props.dataRequest.request_source_first_name && validatePhoneNumber(this.props.dataRequest.request_source_phone)){
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_INFO_MODAL });
      }  
    }

    documentFaxNumberChange(e) {
        var DocumentFaxNumber = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_FAX_NUMBER, request_source_fax: DocumentFaxNumber });
    }

    documentEmailChange(e) {
        var DocumentEmail = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_EMAIL, request_source_email: DocumentEmail });
    }

    sourceFirstNameChange(e) {
        var sourceFirstName = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_FIRST_NAME, request_source_first_name: sourceFirstName });
    }

    sourceLastNameChange(e) {
        var sourceLastName = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});        
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_LAST_NAME, request_source_last_name: sourceLastName });
    }

    sourcePhoneChange(e) {
        var sourcePhone = e.target.value;
        this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});        
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_PHONE, request_source_phone: sourcePhone });
    }        

   render() {

        this.initVariables();
        let requestInfoType = ''
        let requestSourceSystemName = this.getRequestSourceSystemName(this.props.dataRequest.request_source_id);
        if (requestSourceSystemName == 'fax'){
            requestInfoType = <div className="row">                          
                            <div className="col-sm-12">
                              <div className="col-sm-3">
                               {this.props.dataRequest.request_source_name}:
                              </div>
                              <div className= "col-sm-9">   
                                  <input ref="modalInputFaxNo" type="text" className="form-control"
                                       style={this.flatStyleFaxNumber}
                                       value={this.props.dataRequest.request_source_fax == undefined ? '' : this.props.dataRequest.request_source_fax}
                                       onChange={this.documentFaxNumberChange.bind(this)}
                                />
                              </div>
                            </div>
                          </div>
        }
        if (requestSourceSystemName == 'email'){
            requestInfoType = <div className="row">                            
                            <div className="col-sm-12">
                              <div className="col-sm-3">
                               {this.props.dataRequest.request_source_name}:
                              </div>
                              <div className= "col-sm-9">   
                                  <input ref="modalInputEmail" type="text" className="form-control"
                                       style={this.flatStyleEmail}
                                       value={this.props.dataRequest.request_source_email == undefined ? '' : this.props.dataRequest.request_source_email}
                                       onChange={this.documentEmailChange.bind(this)}
                                  />
                                </div>
                            </div>
                          </div>
        }
        if (requestSourceSystemName == 'other'){
            requestInfoType = <div>
                                <div className="row">                            
                                  <div className="col-sm-12">
                                    <div className="col-sm-5">
                                      שם פרטי:
                                    </div>
                                    <div className= "col-sm-7">   
                                      <input ref="modalInputFirstName" type="text" className="form-control"
                                       style={this.flatStyleFirstName}
                                       value={this.props.dataRequest.request_source_first_name == undefined ? '' : this.props.dataRequest.request_source_first_name}
                                       onChange={this.sourceFirstNameChange.bind(this)}
                                      />
                                  </div>
                                </div>
                              </div>
                                <div className="row">                            
                                  <div className="col-sm-12">
                                    <div className="col-sm-5">
                                      שם משפחה:
                                    </div>
                                    <div className= "col-sm-7">   
                                      <input ref="modalInputLastName" type="text" className="form-control"
                                       style={this.flatStyleLasttName}
                                       value={this.props.dataRequest.request_source_last_name == undefined ? '' : this.props.dataRequest.request_source_last_name}
                                       onChange={this.sourceLastNameChange.bind(this)}
                                      />
                                  </div>
                                </div>
                              </div>
                                <div className="row">                            
                                  <div className="col-sm-12">
                                    <div className="col-sm-5">
                                      מס' טלפון:
                                    </div>
                                    <div className= "col-sm-7">   
                                      <input ref="modalInputPhone" type="text" className="form-control" 
                                        style={this.flatStylePhone}
                                        value={this.props.dataRequest.request_source_phone == undefined ? '' : this.props.dataRequest.request_source_phone}
                                        onChange={this.sourcePhoneChange.bind(this)}
                                      />
                                  </div>
                                </div>
                              </div>
                          </div>
        }
               
        return (
            <ModalWindow show={this.props.showRequestSourceInfoModalDialog} title={this.modalTitle}
                         buttonOk={this.editRequestSourceDetails.bind(this)}
                         buttonCancel={this.closeRequestSourceInfoModalDialog.bind(this)}
                         buttonX={this.hideRequestSourceInfoModalDialog.bind(this)}>
                 <div>        
                <div className = "row">

                          <div className="modal-body">
                        <form className="form-horizontal">
                              {requestInfoType}
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
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        showRequestSourceInfoModalDialog: state.crm.searchRequestsScreen.showRequestSourceInfoModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        requestSourceList : state.crm.searchRequestsScreen.requestSourceList, 
    }
}

export default connect(mapStateToProps)(withRouter(ModalRequestSourceInfo))