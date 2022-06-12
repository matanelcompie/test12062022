import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class InstituteGroupRow extends React.Component {

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

    deleteRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const instituteGroup = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_DELETE_MODE_UPDATED, instituteGroup});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_GROUP_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'instituteGroup'});
    }

    cancelEditMode(e) {
        e.stopPropagation();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'instituteGroup'});
    }

    saveEdit(e) {
        e.stopPropagation();
        SystemActions.updateInstituteGroup(store, this.props.instituteGroupInEditMode);
    }

    loadInstituteTypes() {
        if (((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.types'])) && !this.props.isInstituteGroupInEditMode) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const name = this.props.item.name;
            SystemActions.loadInstituteTypes(this.props.dispatch, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_INSTITUTE_GROUP_VALUES, key, id, name});
        }
    }

    highlight() {
        if (this.props.isInstituteGroupValuesDisplayed == true && (this.props.item.key == this.props.instituteGroupInSelectMode)) {
            return 'lists-row success';
        }
        return 'lists-row';
    }

    renderDisplayMode() {
        return(
                <tr onClick={this.loadInstituteTypes.bind(this)} className={this.highlight()}>
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isInstituteGroupInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups.delete']) ? '' : ' hidden')}
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td className="row">
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={this.props.instituteGroupInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                        </div>
                        <div className="col-md-6">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                        disabled={(this.props.dirty && this.props.instituteGroupInEditMode.name.length >= 2 ? "" : "disabled")} 
                                        title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                        title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isInstituteGroupInEditMode && this.props.item.key === this.props.instituteGroupInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isInstituteGroupInEditMode: state.system.listsScreen.voterTab.isInstituteGroupInEditMode,
        instituteGroupInSelectMode: state.system.listsScreen.voterTab.instituteGroupInSelectMode,
        instituteGroupInEditMode: state.system.listsScreen.voterTab.instituteGroupInEditMode,
        isInstituteGroupValuesDisplayed: state.system.listsScreen.voterTab.isInstituteGroupValuesDisplayed,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteGroupRow));