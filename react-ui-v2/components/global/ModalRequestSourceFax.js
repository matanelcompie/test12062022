import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import * as CrmActions from  '../../actions/CrmActions';
import * as SystemActions from  '../../actions/SystemActions';

import { validatePhoneNumber } from '../../libs/globalFunctions';

/**
 * This component is a global Modal
 * for adding request's fax.
 *
 * The component recieves as a parameter an
 * object of user fields were 2 fields
 * must be in the object: key
 *
 *
 */

class ModalRequestSourceFax extends React.Component {

    componentDidMount() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_FAX_MODAL});
    }


    addNewDocument() {

        if (validatePhoneNumber(this.props.dataRequest.request_source_fax)){
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_FAX_MODAL }); 
        }  
    }

    /**
     * This function hides the request source fax modal
     */
    hideRequestSourceFaxModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_FAX_MODAL});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE, request_source_name:''}); 
    }

    closeRequestSourceFaxModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_FAX_MODAL}); 
    }

    /**
     * This function invoked by event of
     * fax number change.
     *
     * @param e
     */
    documentFaxNumberChange(e) {
        var DocumentFaxNumber = e.target.value;
        //this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general'});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_FAX_NUMBER, request_source_fax: DocumentFaxNumber });
    }

    uploadFile(e) {
        var file = null;
        if (e.target.files != undefined ) {
            file = e.target.files[0];
        }
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_ADD_FILE_UPLOAD_CHANGE, file: file});
        if (file != undefined){
            let fileName = file.name;
            let arrOfFileElements = fileName.split('.');
            let documentName = arrOfFileElements[0];
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME, document_name: documentName});
        }
    } 

    documentNameChange(e) {
        var newDocumentName = e.target.value;
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME, document_name: newDocumentName});
    }       

    initVariables() {
      this.borderColor = {
          valid: '#ccc',
          inValid: '#ff0000'
      }
      this.modalTitle = 'פקס';
      this.fileUploadLabel = "בחירת קובץ";
      if (validatePhoneNumber(this.props.dataRequest.request_source_fax)){            
            this.flatStyleFaxNumber = { borderColor: this.borderColor.valid}
      }else {
          this.flatStyleFaxNumber = { borderColor: this.borderColor.inValid}
      }
      this.flatStyleFaxName = {
          borderColor: this.borderColor.valid
      }
      this.flatStyleFile = {
          borderColor: this.borderColor.valid
      }
    }


   render() {

        this.initVariables();

        return (
            <ModalWindow show={this.props.showRequestSourceFaxModalDialog} title={this.modalTitle}
                         buttonOk={this.addNewDocument.bind(this)}
                         buttonCancel={this.hideRequestSourceFaxModalDialog.bind(this)}
                         buttonX={this.closeRequestSourceFaxModalDialog.bind(this)}>
                <div>        
					<div className="row">
						<div className="col-md-12">
							<div className="row" style={{paddingTop:'10px'}}>
								<label  className="col-sm-3">מספר פקס</label>
								<div className="col-sm-8">
									<input ref="modalInputFaxNo" type="text" className="form-control"
											style={this.flatStyleFaxNumber}
											value={this.props.dataRequest.request_source_fax == undefined ? '' : this.props.dataRequest.request_source_fax}
											onChange={this.documentFaxNumberChange.bind(this)}
									/>
								</div>
							</div>
							<div className="row" style={{paddingTop:'15px'}}>
								<label  className="col-sm-3">צרף מסמך</label>
								<div className="col-sm-8">
									<span>
										<input type="file" id="requestSourceDocument2" style={{border:'0'}}  className="form-control"  onChange={this.uploadFile.bind(this)}/>
									</span>
								</div>
							</div>
							<div className="row" style={{paddingTop:'15px'}}>
								<label className="col-sm-3 control-label">שם מסמך</label>
								<div className="col-sm-8">
									<input ref="modalInputFaxName" type="text" className="form-control" 
                                        style={this.flatStyleFaxName}
                                        value={this.props.requestSourceDocumentDetails.documentName}
                                        onChange={this.documentNameChange.bind(this)}
                                    />
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
        requestSourceDocumentDetails: state.crm.searchRequestsScreen.requestSourceDocumentDetails,
        showRequestSourceFaxModalDialog: state.crm.searchRequestsScreen.showRequestSourceFaxModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        dirtyComponents :state.system.dirtyComponents,
    }
}

export default connect(mapStateToProps)(withRouter(ModalRequestSourceFax))