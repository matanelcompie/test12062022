import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';
import constants from '../../libs/constants';
import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validatePhoneNumber } from '../../libs/globalFunctions';

class ModalRequestSourceOther extends React.Component {

    componentDidMount() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_OTHER_MODAL}); 
        this.setDefaultRequestSource();
    }

    setDefaultRequestSource(){
        if(!this.props.dataRequest.request_source_first_name || this.props.dataRequest.request_source_first_name==''){
            this.props.dispatch({type:CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_FIRST_NAME, request_source_first_name:this.props.voterDetails.first_name });
            this.props.dispatch({type:CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_LAST_NAME, request_source_last_name:this.props.voterDetails.last_name});
            if(this.props.voterDetails.phones && this.props.voterDetails.phones.length>0){
                var mobilePhone=this.props.voterDetails.phones.find(a=>a.phone_type_id==constants.phone_types.mobile);
                this.props.dispatch({type:CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_PHONE, request_source_phone:mobilePhone?mobilePhone.phone_number:this.props.voterDetails.phones[0].phone_number });
            }
            
        }
    }

    addNewDetails() {

        if (this.props.dataRequest.request_source_first_name && validatePhoneNumber(this.props.dataRequest.request_source_phone)){
          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_OTHER_MODAL }); 
        }  
    }

    hideRequestSourceOtherModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_OTHER_MODAL}); 
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE, request_source_name:''}); 
    }

    closeRequestSourceOtherModalDialog(){
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_OTHER_MODAL}); 
    }

    sourceFirstNameChange(e) {
        var sourceFirstName = e.target.value;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_FIRST_NAME, request_source_first_name: sourceFirstName });
    }

    sourceLastNameChange(e) {
        var sourceLastName = e.target.value;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_LAST_NAME, request_source_last_name: sourceLastName });
    }

    sourcePhoneChange(e) {
        var sourcePhone = e.target.value;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_PHONE, request_source_phone: sourcePhone });
    } 
    
    saveVoterPhoneChange(e) {
        debugger
        var check = e.target.checked;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_CHANGE_FIELD, nameField:'save_voter_phone',value:check?1:0 });
    }  

    initVariables() {
      this.borderColor = {
          valid: '#ccc',
          inValid: '#ff0000'
      }
      this.modalTitle = 'הופנה בעל פה';
      if (validatePhoneNumber(this.props.dataRequest.request_source_phone)){            
            this.flatStylePhone = { borderColor: this.borderColor.valid}
      }else {
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


   render() {

        this.initVariables();
        return (
            <ModalWindow show={this.props.showRequestSourceOtherModalDialog} title={this.modalTitle}
                         buttonOk={this.addNewDetails.bind(this)}
                         buttonCancel={this.hideRequestSourceOtherModalDialog.bind(this)}
                         buttonX={this.closeRequestSourceOtherModalDialog.bind(this)}>
                 <div>        
                <div className="row">

                          <div className="col-md-12">
                        
                              <div className="row" >
                            <label className="col-sm-4">שם פרטי</label>
                            <div className="col-sm-8">                                  
                                <input type="text" className="form-control"
                                       style={this.flatStyleFirstName}
                                       value={this.props.dataRequest.request_source_first_name == undefined ? '' : this.props.dataRequest.request_source_first_name}
                                       onChange={this.sourceFirstNameChange.bind(this)}
                                />
                                </div>
                          </div>
                            <div className="row"   style={{paddingTop:'10px'}}>
                            <label  className="col-sm-4">שם משפחה</label>
                            <div className="col-sm-8">
                               <input type="text" className="form-control"
                                       style={this.flatStyleLasttName}
                                       value={this.props.dataRequest.request_source_last_name == undefined ? '' : this.props.dataRequest.request_source_last_name}
                                       onChange={this.sourceLastNameChange.bind(this)}
                                />
                                </div>
                            </div>
                            <div className="row"   style={{paddingTop:'10px'}}>
                                <label  className="col-sm-4">מס' טלפון</label>
                                <div className="col-sm-8">
                                    
                                    <input   type="text" className="form-control" 
                                        style={this.flatStylePhone}
                                        value={this.props.dataRequest.request_source_phone == undefined ? '' : this.props.dataRequest.request_source_phone}
                                        onChange={this.sourcePhoneChange.bind(this)}
                                    />
                                    
                                </div>
                            </div>

                            <div className="row" style={{paddingTop:'10px'}}>   
                            <label  className="control-label" >עדכון טלפון בכרטיס תושב</label>                         
                              <div className="col-md-2">
                                              
                                                <input type="checkbox" id="inputInstructed-role-details" ref="modalInputLastName" className="checkbox-inline" style={{ marginRight: '10px' }}
                                                    checked={this.props.dataRequest.save_phone} onChange={this.saveVoterPhoneChange.bind(this)} /> 
                                                
                                        </div>
                              </div>
                      
                      </div>                        
                  </div>
                  </div>
                  </ModalWindow>
        )
    }

}



function mapStateToProps(state) {
    return {
        showRequestSourceOtherModalDialog: state.crm.searchRequestsScreen.showRequestSourceOtherModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        voterDetails: state.voters.voterDetails,
    }
}

export default connect(mapStateToProps)(withRouter(ModalRequestSourceOther))