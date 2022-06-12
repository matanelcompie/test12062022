import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';

import {dateTimeReversePrint} from '../../libs/globalFunctions';


class DocumentsItem extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.entityTypes = {
            voter: 0,
            request: 1
        };
    }

    documentNameChange(e) {
        var documentIndex = this.props.documentIndex;
        var newDocumentName = e.target.value;

        var data = {
            documentIndex: documentIndex,
            newDocumentName: newDocumentName
        };

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_INPUT_NAME_CHANGE,
                             data: data});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});
    }

    editDocument() {
        var newDocumentName = this.props.item.name;
        var entityType = this.props.entity_type;
        var documentKey = this.props.item.key;
        var entityKey = this.props.entity_key;

        if ( 0 == newDocumentName.length ) {
            return;
        }

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_EDIT_DISABLE_EDITING});

        GlobalActions.editEntityDocument(this.props.dispatch, entityType, entityKey, documentKey, newDocumentName);
    }

    enableEditing() {
        this.oldDocumentName = this.props.item.name;
        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_EDIT_ENABLE_EDITING,
                             documentKey: this.props.item.key});
    }

    disableEditing() {
        this.props.item.name = this.oldDocumentName;

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_EDIT_DISABLE_EDITING});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    showDeleteModalDialog() {
        // Checking if the document is related to a voter's request
        var deleteDocumentRequestKey = '';
        var entityType = this.props.entity_type;

        // If entity type is a voter we need to check
        // if the document belongs to a voter's request
        if ( entityType == 0 ) {
            deleteDocumentRequestKey = this.props.item.request_key;
        } else {
            deleteDocumentRequestKey = '';
        }

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_DELETE_SHOW_MODAL_DIALOG,
            deleteDocumentKey: this.props.item.key,
            deleteDocumentName: this.props.item.name,
            deleteDocumentRequestKey: deleteDocumentRequestKey
        });
    }

    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.documentNameStyle = {
            borderColor: this.borderColor.valid
        };

        this.allowEditDocument = false;
        this.allowDeleteDocument = false;
        this.allowDownloadDocument = false;

        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            disableEditing:'הפסקת עריכה',
            watchTitle: 'צפיה',
            downloadTitle: 'הורדה'
        };

        switch (this.props.entity_type) {
            case this.entityTypes.voter:
                this.setDirtyTarget = "elections.voter.documents";
                break;

            case this.entityTypes.request:
                this.setDirtyTarget = "crm.requests.documents";
                break;
        }
    }

    validateVariables() {
        this.validInputs = true;

        let documentName = this.props.item.name;
        if ( 0 ==  documentName.length) {
            this.documentNameStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.documentNameStyle.borderColor = this.borderColor.valid;
        }
    }

    renderEditingModeRow(entity_type) {
        let td_created_at = dateTimeReversePrint(this.props.item.created_at, true, true);

        let td_request_link_to = '';
        let td_request_link = '';

        let requestKey = this.props.item.request_key;
        if (requestKey != "null") {
            td_request_link_to = 'crm/requests/' + requestKey;
            td_request_link = <Link to={td_request_link_to}>{requestKey}</Link>;
        }

        switch (entity_type) {

            case this.entityTypes.voter:
                return (
                    <tr key={this.props.item.id}>
                        <td>
                            <input type="text" value={this.props.item.name} width="80%"
                                   onChange={this.documentNameChange.bind(this)}
                                   style={this.documentNameStyle}/>

                        </td>
                        <td>{this.props.item.type}</td>
                        <td>{td_request_link}</td>
                        <td>{td_created_at}</td>
                        <td>
                            <span className="pull-left edit-buttons">
                                <button className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                        onClick={this.editDocument.bind(this)}
                                        disabled={!this.validInputs || !this.documentHasChanged ||
                                                  this.props.savingChanges}>
                                        <i className="fa fa-floppy-o"/>
                                </button>
                                {'\u00A0'}
                                <button className="btn btn-danger btn-xs" title={this.tooltip.disableEditing}
                                        onClick={this.disableEditing.bind(this)}>
                                        <i className="fa fa-times"/>
                                </button>
                            </span>
                        </td>
                    </tr>
                );
                break;

            case this.entityTypes.request:
                return (
                    <tr key={this.props.item.id}>
                        <td>
                            <input type="text" value={this.props.item.name} width="80%"
                                   onChange={this.documentNameChange.bind(this)} style={this.documentNameStyle}/>
                        </td>
                        <td>{this.props.item.type}</td>
                        <td>{td_created_at}</td>
                        <td>
                            <span className="pull-left edit-buttons">
                                <button className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                                        onClick={this.editDocument.bind(this)}
                                        disabled={!this.validInputs || !this.documentHasChanged ||
                                                  this.props.savingChanges}>
                                    <i className="fa fa-floppy-o"/>
                                </button>
                                {'\u00A0'}
                                <button className="btn btn-danger btn-xs" title={this.tooltip.disableEditing}
                                        onClick={this.disableEditing.bind(this)}>
                                    <i className="fa fa-times"/>
                                </button>
                            </span>
                        </td>
                    </tr>
                );
                break;
        }
    }

    /**
     * This function renders the edit + delete buttons.
     *
     * @returns {*}
     */
    renderNonEditActionsButtons() {
        var buttonsStyle = {
            marginRight: '4px'
        };

        if ( !this.props.enable_editing ) {
            return '\u00A0';
        }

        if ( this.allowEditDocument && this.allowDeleteDocument ) {
            return (
                <span className="pull-left edit-buttons" style={buttonsStyle}>
                    <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                            onClick={this.enableEditing.bind(this)}>
                        <i className="fa fa-pencil-square-o"/>
                    </button>
                    {'\u00A0'}
                    <button type="button" className="btn btn-danger btn-xs" title={this.tooltip.deleteTitle}
                            onClick={this.showDeleteModalDialog.bind(this)}>
                        <i className="fa fa-trash-o"/>
                    </button>
                </span>
            );
        } else if ( this.allowEditDocument ) {
            return (
                <button type="button" className="btn btn-success btn-xs" style={buttonsStyle}
                        title={this.tooltip.editTitle}
                        onClick={this.enableEditing.bind(this)}>
                    <i className="fa fa-pencil-square-o"/>
                </button>
            );
        } else if ( this.allowDeleteDocument ) {
            return (
                <button type="button" className="btn btn-danger btn-xs" style={buttonsStyle}
                        title={this.tooltip.deleteTitle}
                        onClick={this.showDeleteModalDialog.bind(this)}>
                    <i className="fa fa-trash-o"/>
                </button>
            );
        } else {
            return '\u00A0';
        }
    }

    /**
     * This function displays the view and watch buttons
     * only if the user has download permissions.
     *
     * @returns {*}
     */
    renderNonEditViewDownloadButtons() {
        var documentWatchLink = "";
        var documentDownloadLink = "";

        if ( !this.props.enable_editing ) {
            return '\u00A0';
        }
        if(this.props.item.document_file_missing != '1'){
			switch ( this.props.entity_type ) {
				case this.entityTypes.voter:
					documentWatchLink = '/elections/voters/documents/' + this.props.item.key;
					documentDownloadLink = '/elections/voters/documents/' + this.props.item.key + '/download';
					break;

				case this.entityTypes.request:
					documentWatchLink = '/crm/requests/documents/' + this.props.item.key;
					documentDownloadLink = '/crm/requests/documents/' + this.props.item.key + '/download';
					break;
        }
		}

        if ( this.allowDownloadDocument ) {
            return (
                <span className="pull-left edit-buttons">
                    <Link to={documentDownloadLink} target="_blank">
                        <button type="button" className="btn btn-info btn-xs" title={this.tooltip.downloadTitle} disabled={this.props.item.document_file_missing == '1'}>
                            <i className="fa fa-download"/>
                        </button>
                    </Link>
                    {'\u00A0'}
                    <Link to={documentWatchLink} target="_blank">
                        <button type="button" className="btn btn-info btn-xs" title={this.tooltip.watchTitle} disabled={['doc', 'docx' , 'csv','xls','xlsx','csvx'].indexOf(this.props.item.type) >-1 || this.props.item.document_file_missing == '1'}>
                            <i className="fa fa-eye"/>
                        </button>
                    </Link>
                </span>
            );
        } else {
            return '\u00A0';
        }
    }

    /**
     * This function renders the row which
     * is not being edited.
     *
     * @param entity_type - A voter entity or request entity
     * @returns {XML}
     */
    renderNonEditingModeRow(entity_type) {
        let td_created_at = dateTimeReversePrint(this.props.item.created_at, true, true);

        let td_request_link_to = '';
        let td_request_link = '';

        let requestKey = this.props.item.request_key;
        if (requestKey != "null") {
            td_request_link_to = 'crm/requests/' + requestKey;
            td_request_link = <Link to={td_request_link_to}>{requestKey}</Link>;
        }

        switch (entity_type) {
            case this.entityTypes.voter:
                return (
                    <tr key={this.props.item.id}>
                        <td>{this.props.item.name}</td>
                        <td>{this.props.item.type}</td>
                        <td>{td_request_link}</td>
                        <td>{td_created_at}</td>
                        <td>
                            {this.renderNonEditActionsButtons()}
                            {this.renderNonEditViewDownloadButtons()}
                        </td>
                    </tr>
                );
                break;

            case this.entityTypes.request:
                return (
                    <tr key={this.props.item.id}>
                        <td>{this.props.item.name}</td>
                        <td>{this.props.item.type}</td>
                        <td>{td_created_at}</td>
                        <td>
                            {this.renderNonEditActionsButtons()}
                            {this.renderNonEditViewDownloadButtons()}
                        </td>
                    </tr>
                );
                break;
        }
    }

    checkPermissions() {
        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                if ( this.props.currentUser.admin ||
                     this.props.currentUser.permissions['elections.voter.documents.edit'] == true ) {
                    this.allowEditDocument = true;
                }

                if ( this.props.currentUser.admin ||
                     this.props.currentUser.permissions['elections.voter.documents.delete'] == true ) {
                    this.allowDeleteDocument = true;
                }

                if ( this.props.currentUser.admin ||
                     this.props.currentUser.permissions['elections.voter.documents.download'] == true ) {
                    this.allowDownloadDocument = true;
                }
                break;

            case this.entityTypes.request:
                if ( this.props.requestStatusNotForEdit ) {
                    this.allowEditDocument = false;
                    this.allowDeleteDocument = false;
                } else {
                    if (this.props.currentUser.admin ||
                        this.props.currentUser.permissions['crm.requests.documents.edit'] == true) {
                        this.allowEditDocument = true;
                    }

                    if (this.props.currentUser.admin ||
                        this.props.currentUser.permissions['crm.requests.documents.delete'] == true) {
                        this.allowDeleteDocument = true;
                    }
                }

                if ( this.props.currentUser.admin ||
                     this.props.currentUser.permissions['crm.requests.documents.download'] == true ) {
                    this.allowDownloadDocument = true;
                }
                break;
        }
    }

    /*
     *  This function checks if any changes
     *  have been made in document.
     *
     *  If no changes have been made
     *  the save button will be disabled
     */
    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.documentHasChanged = false;
        } else {
            this.documentHasChanged = true;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        this.checkAnyChanges();

        let entity_mode = this.props.editing_mode;
        let entity_type = this.props.entity_type;

        if ( entity_mode ) {
            return this.renderEditingModeRow(entity_type);
        } else {
            return this.renderNonEditingModeRow(entity_type);
        }
    }
}


export default connect()(DocumentsItem);