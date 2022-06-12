import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment  from 'moment';

import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validatePhoneNumber, parseDateToPicker, parseDateFromPicker } from '../../libs/globalFunctions';

class ModalRequestSourceCallBiz extends React.Component {

    componentDidMount() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL});
    }


    addNewDetails() {

        if (this.props.newCallbizDetails.ID.length > 0 && this.props.newCallbizDetails.datetime && this.props.newCallbizDetails.details.trim() != ''){
          let foramatDateArrParts = this.props.newCallbizDetails.datetime.split(' ');
          let foramatDate = foramatDateArrParts[0].split('/');
          let dbFormatedDate = null
          // if this.props.newCallbizDetails.datetime in wrong DB date format
          if (foramatDate[0].length == 2){
            dbFormatedDate = foramatDate[2]+'-'+foramatDate[1]+'-'+foramatDate[0]+' '+foramatDateArrParts[1];
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE, newValue:dbFormatedDate});
          } 

          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_CALLBIZ_MODAL }); 
        }  
    }

    hideRequestSourceCallBizModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_CALLBIZ_MODAL}); 
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE, request_source_name:''}); 
    }

    closeRequestSourceCallBizModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_CALLBIZ_MODAL});
    }

    callBizIDChange(e) {
      if(e.target.value.length <= 30){
        var callBizID = e.target.value;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_ID_CHANGE, newValue: callBizID });
      }
    }

    callBizDateTimeChange(callBizDateTime, format, filterParams) {

        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DATETIME_CHANGE, newValue: callBizDateTime });       
    }

    callBizDetailsChange(e) {
      if(e.target.value.length <= 3000){
          var callBizDetails = e.target.value;
          this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.NEW_REQUEST_CALLBIZ_DETAILS_CHANGE, newValue: callBizDetails });
      }
    }      

    initVariables() {
      this.borderColor = {
          valid: '#ccc',
          inValid: '#ff0000'
      }
      this.modalTitle = 'Call Biz';
      if (this.props.newCallbizDetails.details.trim() != '' && this.props.newCallbizDetails.details.length <= 3000){            
            this.flatStyleDetails = { borderColor: this.borderColor.valid }
      } else {
          this.flatStyleDetails = { borderColor: this.borderColor.inValid }
      }
      if (this.props.newCallbizDetails.ID.trim() != '' && this.props.newCallbizDetails.ID.length <= 30){
          this.flatStyleID = { borderColor: this.borderColor.valid }
      } else {
          this.flatStyleID = { borderColor: this.borderColor.inValid }
      }

      this.flatStyleDateTime = {
          borderColor: this.borderColor.valid
      }
    }


   render() {

        this.initVariables();                                                  
            

        return (
            <ModalWindow show={this.props.showRequestSourceCallBizModalDialog} title={this.modalTitle}
                         buttonOk={this.addNewDetails.bind(this)}
                         buttonCancel={this.hideRequestSourceCallBizModalDialog.bind(this)}
                         buttonX={this.closeRequestSourceCallBizModalDialog.bind(this)}>
                 <div>        
                <div className="row">

                          <div className="col-md-12">
                    
                              <div className="row">
                            <label className="col-sm-5">מזהה CallBiz</label>
                            <div className="col-sm-7">                                  
                                <input type="text" className="form-control"
                                       style={this.flatStyleID}
                                       value={this.props.newCallbizDetails.ID == undefined ? '' : this.props.newCallbizDetails.ID}
                                       onChange={this.callBizIDChange.bind(this)}
                                />
                                </div>
                          </div>
                            <div className="row"   style={{paddingTop:'15px'}}>
                            <label  className="col-sm-5">תאריך ושעה</label>
                            <div className="col-sm-7 form-control" style={{border:'0' , WebkitBoxShadow:'none'}}>
                               <ReactWidgets.DateTimePicker 
													 
													  
                                                      isRtl={true}
                                                      value={parseDateToPicker(this.props.newCallbizDetails.datetime) ? parseDateToPicker(this.props.newCallbizDetails.datetime) :  moment().format("YYYY-MM-DD HH:mm:ss")}
                                                      onChange={parseDateFromPicker.bind(this, {callback: this.callBizDateTimeChange, format: "YYYY-MM-DD HH:mm:ss", functionParams: ''})}
                                                      format="DD/MM/YYYY HH:mm"
                                                      />
                                </div>
                            </div>
                            <div className="row" style={{paddingTop:'15px'}}>
                                <label  className="col-sm-5">פירוט</label>
                                <div className="col-sm-7">
                                    <textarea className="form-control" rows="4" id="modalTextDtls" placeholder="פירוט"
                                        style={this.flatStyleDetails}
                                        value={this.props.newCallbizDetails.details == undefined ? '' : this.props.newCallbizDetails.details}
                                        onChange={this.callBizDetailsChange.bind(this)}>
                                    </textarea>
                                    
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
        showRequestSourceCallBizModalDialog: state.crm.searchRequestsScreen.showRequestSourceCallBizModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        newCallbizDetails: state.crm.searchRequestsScreen.newCallbizDetails,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
    }
}

export default connect(mapStateToProps)(withRouter(ModalRequestSourceCallBiz))