import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class InstituteRoleRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const instituteRolekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_DELETE_MODE_UPDATED, instituteRolekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_ROLE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const instituteRole = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_EDIT_MODE_UPDATED, instituteRole});
    }

    updateRowText(e) {
        const name = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_EDIT_VALUE_CHANGED, name});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_EDIT_MODE_UPDATED});
    }

    saveEdit() {
        SystemActions.updateInstituteRole(store, this.props.instituteRoleInEditMode, this.props.instituteRoleTypeKey);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isInstituteRoleInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.roles.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.roles.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <div className="row no-margin">
                            <div className="col-md-6">
                                <input type="text" className="form-control" value={this.props.instituteRoleInEditMode.name} onChange={this.updateRowText.bind(this)}/>
                            </div>
                            <div className="col-md-6">
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                            disabled={(this.props.isNameExistInTheList(!this.props.instituteRoleInEditMode.name) && (this.props.instituteRoleInEditMode.name.length >= 2) ? "" : "disabled")}>
                                        <i className="fa fa-floppy-o"></i>
                                    </button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                
                        </div>
                
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isInEditMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isInstituteRoleInEditMode: state.system.listsScreen.voterTab.isInstituteRoleInEditMode,
        instituteRoleInEditMode: state.system.listsScreen.voterTab.instituteRoleInEditMode,
        instituteRoleTypeKey: state.system.listsScreen.voterTab.instituteRoleTypeKey,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteRoleRow));