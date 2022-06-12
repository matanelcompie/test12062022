import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import DocumentsItem from './DocumentsItem';
import UploadNewDocument from './UploadNewDocument';

import ModalWindow from './ModalWindow';

import * as GlobalActions from '../../actions/GlobalActions';


/*
 *   This class is a component which
 *   is displayed on clicking tab
 *   documents.
 *   This component displays a table with
 *   documents related to the voter.
 *
 *   The component using Documents component
 *   should listen to state.global.documents.documents
 *   and load documents before using LowerDocuments
 *   component.
 *
 *   This component recieves 5 parameters
 *     disabled - added by Pnina - if is true then all add/edit/delete buttons are disabled
 *     display - A boolean which indicates whether to show the component
 *     entity_key - The entity's key (voter's key or request's key
 *     entity_type - 0 for voter
 *                   1 for request
 *     documents - Array of documents
 *
 *     Example: <Documents display={true} entity_key={this.props.router.params.voterKey}
 *                         entity_type={0}
 *                         documents={this.props.documents}/>
 */
class Documents extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.panelTitle = "מסמכים";
        this.newDocumentTitle = "מסמך חדש";

        this.entityTypes = {
            voter: 0,
            request: 1
        };
    }

    showNewDocumentDiv() {
        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DIV});
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_DELETE_HIDE_MODAL_DIALOG});
    }

    deleteDocument() {
        var entityType = ''; //
        var entityKey = '';
        var documentKey = this.props.deleteDocumentKey;
        var deleteDocumentRequestKey = this.props.deleteDocumentRequestKey;


        // If entity type is a voter we have to distinguish
        // between a document associated with the voter
        // and a document associated to a voter's request
        if (this.props.entity_type == 0) {
            // The document associated with voter's request
            if ( deleteDocumentRequestKey.length > 0 && deleteDocumentRequestKey != "null") {
                entityType = 1;
                entityKey = deleteDocumentRequestKey;
            } else { // The document associated with the voter
                entityType = this.props.entity_type;
                entityKey = this.props.entity_key;
            }
        } else { // entity type is a request
            entityType = this.props.entity_type;
            entityKey = this.props.entity_key;
        }


        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_DELETE_HIDE_MODAL_DIALOG});

        GlobalActions.deleteEntityDocument(this.props.dispatch, entityType, entityKey, documentKey);
    }

    /*
     *  This function arranges the voter's
     *  documents array in a table
     */
    renderDocumentsData() {
        var colSpan = 0;
        var entity_type = this.props.entity_type;
        var entity_key = this.props.entity_key;
        var editingKey = this.props.editingKey;
        var editingMode = false;
        var enableEditing = false;
        var currentUser = this.props.currentUser;
        var showNewDocumentDiv = this.props.showNewDocumentDiv;
        let self = this;

        this.documentsRows = this.props.documents.map(function (document, index) {
            // Checking if the document is to
            // be edited by comparing the current
            // document's key to editing key
            // which specifies the document's
            // key to be edited
            if ( document.key == editingKey ) {
                editingMode = true;
            } else { // document is not to be deleted
                editingMode = false;

                if ( editingKey ) {
                    // If another document is
                    // being edited, then
                    // disable the editing
                    // of the current document
                    enableEditing = false;
                } else {
                    // No document is to be edited,
                    // then enable editing the current
                    // document
                    enableEditing = true;
                }
            }

            if (showNewDocumentDiv) {
                enableEditing = false;
            }

            switch ( entity_type ) {
                case self.entityTypes.voter:
                    return <DocumentsItem key={document.id} entity_type={entity_type}
                                          entity_key={entity_key} documentIndex={index} item={document} editing_mode={editingMode}
                                          enable_editing={enableEditing} currentUser={currentUser}
                                          dirtyComponents={self.props.dirtyComponents}
                                          savingChanges={self.props.savingChanges}/>
                    break;

                case self.entityTypes.request:
                    return <DocumentsItem key={document.id} entity_type={entity_type}
                                          entity_key={entity_key} documentIndex={index} item={document} editing_mode={editingMode}
                                          enable_editing={enableEditing} currentUser={currentUser}
                                          dirtyComponents={self.props.dirtyComponents}
                                          savingChanges={self.props.savingChanges}
                                          requestStatusNotForEdit={self.props.requestStatusNotForEdit}
                                          hasRequestAdminEdit={self.props.hasRequestAdminEdit}/>
                    break;
            }
        });

        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                colSpan = 5;
                break;

            case this.entityTypes.request:
                colSpan = 4;
                break;
        }

        return (
            <tbody>
                {this.documentsRows}
            </tbody>
        );
    }

    renderVoterTableThead() {
        return (
            <thead>
            <tr>
                <th>שם המסמך</th>                
                <th>סוג מסמך</th>
                <th>פניה</th>
                <th>מועד יצירה</th>
                <th>{'\u00A0'}</th>
            </tr>
            </thead>
        );
    }

    renderRequestTableThead() {
        return (
            <thead>
            <tr>
                <th>שם המסמך</th>                
                <th>סוג מסמך</th>
                <th>מועד יצירה</th>
                <th>{'\u00A0'}</th>
            </tr>
            </thead>
        );
    }

     renderHeaders() {
        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                return this.renderVoterTableThead();
                break;

            case this.entityTypes.request:
                return this.renderRequestTableThead();
                break;
        }
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.documentsBlockClass = "tab-content tabContnt";

            return;
        }

        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                if (this.props.currentUser.permissions['elections.voter.documents'] == true) {
                    this.documentsBlockClass = "tab-content tabContnt";
                }
                break;

            case this.entityTypes.request:
                if (this.props.currentUser.permissions['crm.requests.documents'] == true) {
                    this.documentsBlockClass = "tab-content tabContnt";
                }
                break;
        }
    }

    renderNewDocumentButton() {
        var displayButton = false;

        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                if ( this.props.currentUser.admin ||
                     this.props.currentUser.permissions['elections.voter.documents.add'] == true ) {
                    displayButton = true;
                }
                break;

            case this.entityTypes.request:
                if ( !this.props.requestStatusNotForEdit &&
                     (this.props.currentUser.admin ||
                      this.props.currentUser.permissions['crm.requests.documents.add'] == true)
                   ) {
                    displayButton = true;
                }
                break;
        }

        if ( displayButton ) {
            return (
                <button className="btn btn-primary mainBtn pull-left"
                        onClick={this.showNewDocumentDiv.bind(this)}
                        disabled={this.props.showNewDocumentDiv || this.props.editingKey}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                    {this.newDocumentTitle}
                </button>
            );
        }
    }

    /**
     *
     * @returns {XML}
     */
    renderNewDocumentDiv() {
        // If the user doesn't have permissions to upload a document
        // then don't show the upload document block
        if ( !this.props.currentUser.admin &&
             this.props.currentUser.permissions['elections.voter.documents.add'] != true &&
             this.props.currentUser.permissions['crm.requests.documents.add'] != true) {
            return;
        }

        if ( this.props.showNewDocumentDiv ) {
            return <UploadNewDocument showNewDocumentName={this.props.showNewDocumentName}
                                      entity_type={this.props.entity_type}
                                      entity_key={this.props.entity_key}
                                      documentTypes={this.props.documentTypes}
                                      max_upload_size={this.props.max_upload_size}
                                      newDocumentDetails={this.props.newDocumentDetails}
                                      currentUser={this.props.currentUser} dirtyComponents={this.props.dirtyComponents}
                                      savingChanges={this.props.savingChanges}/>
        }
    }

    render() {
        this.initVariables();

        this.checkPermissions();

        return(
            <div className={this.documentsBlockClass} id="tabDocuments" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home"
                     aria-labelledby="more-documents">
                    <div className="containerStrip" style={{minHeight:420}}>
                        <div className="row panelTitle">
                            {this.panelTitle}
                            {this.renderNewDocumentButton()}
                        </div>

                        <div className="row panelContent">
                            <table className="table table-bordered table-striped">
                                {this.renderHeaders()}
                                {this.renderDocumentsData()}
                            </table>

                            {this.renderNewDocumentDiv()}

                            <ModalWindow show={this.props.showDeleteModalDialog}
                                         buttonOk={this.deleteDocument.bind(this)}
                                         buttonCancel={this.hideDeleteModalDialog.bind(this)}
                                         buttonX={this.hideDeleteModalDialog.bind(this)}
                                         title={this.props.deleteModalHeader} style={{zIndex: '9001'}}>
                                <div>{this.props.deleteConfirmText}</div>
                            </ModalWindow>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        showDeleteModalDialog: state.global.documents.showDeleteModalDialog,
        deleteModalHeader: state.global.documents.deleteModalHeader,
        deleteConfirmText: state.global.documents.deleteConfirmText,
        deleteDocumentKey: state.global.documents.deleteDocumentKey,
        deleteDocumentName: state.global.documents.deleteDocumentName,
        deleteDocumentRequestKey: state.global.documents.deleteDocumentRequestKey,
        showNewDocumentDiv: state.global.documents.showNewDocumentDiv,
        showNewDocumentName: state.global.documents.showNewDocumentName,
        editingKey: state.global.documents.editingKey,
        newDocumentDetails: state.global.documents.newDocumentDetails,
        documentTypes: state.global.documents.documentTypes,
        max_upload_size: state.system.systemSettings.max_upload_size,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(Documents));