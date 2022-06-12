import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import ModalWindow from './ModalWindow';

import * as CrmActions from '../../actions/CrmActions';
import * as SystemActions from '../../actions/SystemActions';

import { validateEmail } from '../../libs/globalFunctions';

/**
 * This component is a global Modal
 * for adding request's email.
*/

class ModalRequestSourceEmail extends React.Component {

    componentDidMount() {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_EMAIL_MODAL });
    }


    addNewDocument() {

        if (this.props.dataRequest.request_source_email != undefined) {
            if (validateEmail(this.props.dataRequest.request_source_email)) {
                if (this.toUpdateVoterEmail) {
                    this.props.updateVoterEmail(this.props.dataRequest.request_source_email);
                    this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_VOTER_ORIGINAL_EMAIL, request_source_email: this.props.dataRequest.request_source_email });
                }
                this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_EMAIL_MODAL });

            }
        }
    }

    /**
     * This function hides the request source email modal
     */
    hideRequestSourceEmailModalDialog() {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.HIDE_REQUEST_SOURCE_EMAIL_MODAL });
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE, request_source_name: '' });
    }

    closeRequestSourceEmailModalDialog() {
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.CLOSE_REQUEST_SOURCE_EMAIL_MODAL });
    }

    /**
     * This function invoked by event of
     * email change.
     *
     * @param e
     */
    documentEmailChange(e) {
        var DocumentEmail = e.target.value;
        //     this.props.dispatch ({ type : SystemActions.ActionTypes.SET_DIRTY, target:'crm.requests.general' });
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_EMAIL, request_source_email: DocumentEmail });
    }

    uploadFile(e) {
        var file = null;
        if (e.target.files != undefined) {
            file = e.target.files[0];
        }
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_ADD_FILE_UPLOAD_CHANGE,
            file: file
        });
        if (file != undefined) {
            let fileName = file.name;
            let arrOfFileElements = fileName.split('.');
            let documentName = arrOfFileElements[0];
            this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME, document_name: documentName });
        }
    }

    documentNameChange(e) {
        var newDocumentName = e.target.value;
        this.props.dispatch({ type: CrmActions.ActionTypes.REQUEST.REQUEST_SOURCE_CHANGE_DOCUMENT_NAME, document_name: newDocumentName });
    }
    updateVoterEmail() {
        this.toUpdateVoterEmail = !this.toUpdateVoterEmail;
    }
    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#ff0000'
        }
        this.modalTitle = 'אימייל';
        this.fileUploadLabel = "בחירת קובץ";
        if (this.props.dataRequest.request_source_email != undefined) {
            if (validateEmail(this.props.dataRequest.request_source_email)) {
                this.flatStyleEmail = { borderColor: this.borderColor.valid }
            } else {
                this.flatStyleEmail = { borderColor: this.borderColor.inValid }
            }
        }
        this.flatStyleEmailName = {
            borderColor: this.borderColor.valid
        }
        this.flatStyleFile = {
            borderColor: this.borderColor.valid
        }
        this.updateVoterEmailCheckbox = null;
        if (this.props.currentVoterEmail != this.props.dataRequest.request_source_email) {
            this.updateVoterEmailCheckbox = <label className="checkbox" style={{ marginRight: '20px' }}>
                <input type="checkbox" value={this.toUpdateVoterEmail} onChange={this.updateVoterEmail.bind(this)} />
                עידכון אימייל של תושב
            </label>
        }
    }


    render() {
        this.initVariables();

        return (
            <ModalWindow show={this.props.showRequestSourceEmailModalDialog} title={this.modalTitle}
                buttonOk={this.addNewDocument.bind(this)}
                buttonCancel={this.hideRequestSourceEmailModalDialog.bind(this)}
                buttonX={this.closeRequestSourceEmailModalDialog.bind(this)}
                buttonCancelText='המשך ללא הגדרת דוא"ל'>
                <div>
                    <div className="row">

                        <div className="col-md-12">
                            
                                <div className="row" style={{paddingTop:'10px'}}>
                                    <label className="col-sm-3">אימייל</label>
                                    <div className="col-sm-8">

                                        <input ref="modalInputEmail" type="text" className="form-control"
                                            style={this.flatStyleEmail}
                                            value={this.props.dataRequest.request_source_email == undefined ? '' : this.props.dataRequest.request_source_email}
                                            onChange={this.documentEmailChange.bind(this)}
                                        />
                                        {this.updateVoterEmailCheckbox}
                                    </div>
                                </div>
                                <div className="row"  style={{paddingTop:'15px'}}>
                                    <label  className="col-sm-3">צרף מסמך</label>
                                    <div className="col-sm-8">

                                        <span >
                                            <input type="file" className="form-control" style={{border:'0'}} onChange={this.uploadFile.bind(this)} />
                                        </span>
                                    </div>
                                </div>
                                <div className="row"  style={{paddingTop:'15px'}}>
                                    <label  className="col-sm-3">שם מסמך</label>
                                    <div className="col-sm-8">

                                        <input ref="modalInputEmailName" type="text" className="form-control"
                                            style={this.flatStyleEmailName}
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
        showRequestSourceEmailModalDialog: state.crm.searchRequestsScreen.showRequestSourceEmailModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
        dirtyComponents: state.system.dirtyComponents,
    }
}

export default connect(mapStateToProps)(withRouter(ModalRequestSourceEmail))