import React from 'react';
import { connect } from 'react-redux';

import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';
import { sizeToBytes } from '../../libs/globalFunctions';
import './Css//global-component.css'

/**
 *  This class is displayed after clicking
 *  new document button.
 */
class UploadNewDocument extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    componentDidMount() {
        document.body.scrollTop = document.body.scrollHeight;
    }

    initConstants() {
        this.documentNameLabel = "שם המסמך";

        this.labels = {
            fileName: "שם קובץ מקורי",
            fileUpload: "בחירת קובץ",
            documentName: "שם המסמך"
        };
    }

    addNewDocument() {
        if ( !this.validInputs ) {
            return;
        }

        let entityType = this.props.entity_type;
        let entityKey = this.props.entity_key;
        let newDocumentDetails = this.props.newDocumentDetails;

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DOCUMENT_NAME});

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DIV});

        GlobalActions.addEntityDocument(this.props.dispatch, entityType, entityKey, newDocumentDetails);
		
		this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    documentNameChange(e) {
        var newDocumentName = e.target.value;

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_DOCUMENT_NAME_CHANGE,
                             document_name: newDocumentName});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    hideNewDocumentDiv() {
        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DOCUMENT_NAME});

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DIV});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    uploadFile(e) {
        var file = null;

        if (e.target.files != undefined ) {
            file = e.target.files[0];
        }

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_FILE_UPLOAD_CHANGE,
                             file: file});

        let fileName = "";
        let documentName = "";
        let arrOfFileElements = [];

        if ( file != undefined ) {
            fileName = file.name;

            arrOfFileElements = fileName.split('.');
            documentName = arrOfFileElements[0];
        } else {
            fileName = "";

            arrOfFileElements = [];
            documentName = "";
        }


        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_DOCUMENT_NAME_CHANGE,
                             document_name: documentName});

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DOCUMENT_NAME});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    /**
     * This function loops through the
     * document types and returns a string
     * for accept attribute of the file input.
     *
     * @returns {string}
     */
    getFileExtensionsForAccept() {
        var documentTypes = this.props.documentTypes;
        var extensionsArr = [];
        var typeIndex = -1;

        for (typeIndex = 0; typeIndex < documentTypes.length; typeIndex++) {
            switch (documentTypes[typeIndex].name) {
                case 'doc':
                    extensionsArr.push('application/msword');
                    break;

                case 'docx':
                    extensionsArr.push("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                    break;

                case 'xls':
                    extensionsArr.push("application/vnd.ms-excel");
                    break;

                case 'xlsx':
                    extensionsArr.push("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    break;

                case 'txt':
                    extensionsArr.push("text/plain");
                    break;

                case 'csv':
                    extensionsArr.push("." + documentTypes[typeIndex].name);
                    break;

                case 'pdf':
                    extensionsArr.push("application/pdf");
                    break;

                case 'png':
                case 'jpg':
                case 'gif':
                case 'jpeg':
                    extensionsArr.push("image/" + documentTypes[typeIndex].name);
                    break;
            }
        }

        return extensionsArr.join(',');
    }

    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        // File upload style
        this.fileUploadStyle = {
            display: 'none'
        };

        this.documentNameDivStyle = {
            display: 'none'
        };
        if ( this.props.showNewDocumentName ) {
            this.documentNameDivStyle.display = 'block';
        } else {
            this.documentNameDivStyle.display = 'none';
        }

        this.documentNameInputStyle = {
            borderColor: this.borderColor.inValid
        };

        this.fileNameClass = "col-md-4 no-padding";
        this.fileNameErrorText = "";

        if ( this.props.newDocumentDetails.file != null ) {
            this.fileName = this.props.newDocumentDetails.file.name;
        } else {
            this.fileName = '';
        }

        switch (this.props.entity_type) {
            case 0: // Voter type
                this.setDirtyTarget = "elections.voter.documents";
                break;

            case 1: // Request type
                this.setDirtyTarget = "crm.requests.documents";
                break;
        }
    }

    /**
     * This function validates the file size
     * and the file extension
     *
     * @returns {boolean}
     */
    validateFile() {
        if ( null == this.props.newDocumentDetails.file || undefined == this.props.newDocumentDetails.file ) {
            return false;
        }

        let documentTypes = this.props.documentTypes;
        let fileName = this.props.newDocumentDetails.file.name;
        let fileSize = this.props.newDocumentDetails.file.size;
        let fileExtension = "";
        let arrOfFileElements = [];
        let extensionIndex = -1;
        let max_upload_size = this.props.max_upload_size;

        arrOfFileElements = fileName.split('.');
        fileExtension = arrOfFileElements[1];

        // Checking if file size does not exceed
        // the maximum document file size
        if ( fileSize > sizeToBytes(max_upload_size) ) {
            this.fileNameErrorText = "גודל קובץ חורג מהמקסימום (" + max_upload_size + ")";
            return false;
        }

        // Checking if the file extension is an allowed document type
        extensionIndex = documentTypes.findIndex(typeItem => typeItem.name == fileExtension);
        if ( -1 == extensionIndex ) {
            this.fileNameErrorText = "סוג קובץ לא חוקי";
            return false;
        } else {
            this.fileNameErrorText = "";
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        let documentName = this.props.newDocumentDetails.document_name;

        if ( documentName.length == 0) {
            this.documentNameInputStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.documentNameInputStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateFile() ) {
            this.fileNameClass = "col-md-4 no-padding has-error";
            this.validInputs = false;
        } else {
            this.fileNameClass = "col-md-4 no-padding";
        }
    }

    render() {

        this.initVariables();

        this.validateVariables();

        this.getFileExtensionsForAccept();

        return (
          <div className="col-md-12 no-padding" >
              <div style={{margin:'auto',width:'600px'}}>
            <div className="upload-container">
              <input
                type="file"
                id="file_upload"
                accept={this.getFileExtensionsForAccept()}
                onChange={this.uploadFile.bind(this)}
              />
            </div>
            <div style={{ display: "flex",display:'block',marginTop:'20px' }}>
              <div style={{float:'left'}}>
                <button className="btn btn_cancel"  onClick={this.hideNewDocumentDiv.bind(this)}>ביטול</button>
                <button className="btn btn-primary"
                  onClick={this.addNewDocument.bind(this)}
                  disabled={!this.validInputs || this.props.savingChanges}
                > שמור</button>
              </div>
              <div style={{float:'right',display:'flex'}}>
                <span className="tit_name_file">שם הקובץ הנבחר</span>
                <input
                type="text"
                value={this.props.newDocumentDetails.document_name}
                className="form-control"
                style={this.documentNameInputStyle}
                onChange={this.documentNameChange.bind(this)}
              />
              </div>
            </div>
{/* 
            <div className={this.fileNameClass}>
              <label
                htmlFor="inputPostalNo-ver"
                className="col-sm-4 control-label"
              >
                {this.labels.fileName}
              </label>
              {this.fileName}

              <span className="help-block">{this.fileNameErrorText}</span>
            </div> */}

            {/* <div
              className="col-md-1 no-padding"
              style={this.documentNameDivStyle}
            >
              <label htmlFor="document_name" id="label">
                {this.labels.documentName}
              </label>
            </div> */}

            {/* <div
              className="col-md-2 no-padding"
              id="document_name"
              style={this.documentNameDivStyle}
            >
              <input
                type="text"
                value={this.props.newDocumentDetails.document_name}
                className="form-control"
                style={this.documentNameInputStyle}
                onChange={this.documentNameChange.bind(this)}
              />
            </div> */}

            {/* <div className="col-md-2 no-padding">
              <div style={{ paddingRight: "74px" }}>
                <span className="pull-left edit-buttons">
                  <button
                    className="btn btn-success btn-xs"
                    onClick={this.addNewDocument.bind(this)}
                    disabled={!this.validInputs || this.props.savingChanges}
                  >
                    <i className="fa fa-floppy-o" />
                  </button>
                  {"\u00A0"}
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={this.hideNewDocumentDiv.bind(this)}
                  >
                    <i className="fa fa-times" />
                  </button>
                </span>
              </div>
            </div> */}
            </div>
          </div>
        );
    }
}


export default connect()(UploadNewDocument);