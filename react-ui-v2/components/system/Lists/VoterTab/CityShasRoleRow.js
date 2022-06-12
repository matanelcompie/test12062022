import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';
import store from 'store';

class CityShasRoleRow extends React.Component {

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
        const key = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_DELETE_MODE_UPDATED, key});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_SHAS_ROLES_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const key = this.props.item.key;
        const name = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_EDIT_MODE_UPDATED, key, name});
    }

    updateRowText(e) {
        const name = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_EDIT_VALUE_CHANGED, name});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'CityShasRole'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'CityShasRole'});
    }

    saveEdit() {
        SystemActions.updateCityShasRole(store, this.props.cityShasKeyInSelectMode, this.props.cityShasTextBeingEdited);
    }

    renderDisplayMode() {
        
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isCityShasInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.city_shas_roles.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.city_shas_roles.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control col-md-9" value={this.props.cityShasTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                    disabled={(this.props.dirty && this.props.cityShasTextBeingEdited.length >= 2 ? "" : "disabled")}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isCityShasInEditMode && this.props.item.key === this.props.cityShasKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isCityShasInEditMode: state.system.listsScreen.voterTab.isCityShasInEditMode,
        cityShasKeyInSelectMode: state.system.listsScreen.voterTab.cityShasKeyInSelectMode,
        cityShasTextBeingEdited: state.system.listsScreen.voterTab.cityShasTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(CityShasRoleRow));