import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class InstituteNetworkRow extends React.Component {

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
        const instituteNetwork = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_DELETE_MODE_UPDATED, instituteNetwork});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_NETWORK_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'InstituteNetwork'});
    }

    cancelEditMode(e) {
        e.stopPropagation();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'InstituteNetwork'});
    }

    saveEdit(e) {
        e.stopPropagation();
        SystemActions.updateInstituteNetwork(store, this.props.instituteNetworkInEditMode);
    }

    renderDisplayMode() {
        return(
                <tr className='lists-row'>
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isInstituteNetworkInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.networks.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.networks.add']) ? '' : ' hidden')} 
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
                            <input type="text" className="form-control" value={this.props.instituteNetworkInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                        </div>
                        <div className="col-md-6">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                        disabled={(this.props.dirty && this.props.instituteNetworkInEditMode.name.length >= 2 ? "" : "disabled")} 
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
        if (this.props.isInstituteNetworkInEditMode && this.props.item.key === this.props.instituteNetworkInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isInstituteNetworkInEditMode: state.system.listsScreen.voterTab.isInstituteNetworkInEditMode,
        instituteNetworkInSelectMode: state.system.listsScreen.voterTab.instituteNetworkInSelectMode,
        instituteNetworkInEditMode: state.system.listsScreen.voterTab.instituteNetworkInEditMode,
        isInstituteNetworkValuesDisplayed: state.system.listsScreen.voterTab.isInstituteNetworkValuesDisplayed,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteNetworkRow));