import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import Combo from '../../../../global/Combo';

class UserRoleRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const userRolekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_DELETE_MODE_UPDATED, userRolekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_USER_ROLE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_MODE_UPDATED, item: this.props.item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'userRole'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'userRole'});
    }

    saveEdit() {
        SystemActions.updateUserRole(store, this.props.userRoleInEditMode);
    }

    comboChange(columnName, el) {
        if (el.target.selectedItem) {

            //store the name
            var value = el.target.selectedItem.name;
            var key = columnName + '_name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_VALUE_CHANGED, key, value});

            //store the key
            value = el.target.selectedItem.id;
            key = columnName + '_id';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_VALUE_CHANGED, key, value});
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'userRole'});
        }
    }

    textIgniter() {
        this.textValues = {
            teamLeaderTitle: '?ראש צוות',
            yesValue: 'כן',
            noValue: 'לא',
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.module_name}</td>
                    <td>{this.props.item.role_name}</td>
                    <td>{(this.props.item.team_leader) ? this.textValues.yesValue : this.textValues.noValue }</td>
                    <td>

                        <span className={"pull-left edit-buttons" + (this.props.isUserRoleInEditMode || this.props.isUserRoleInAddMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            {(this.props.item.role_system_name == null) && 
                                <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                                }
                        </span>
                    </td>
                </tr>
                );
    }

    /** 
     * Check if user can save role
     *
     * @retrun void
     */
    isSaveValid() {
        //check if role already exists in module
        let moduleId = null;
        let existingRole = false;
        for (let i=0; i<this.props.modules.length; i++) {
            let currentModule = this.props.modules[i];
            if (currentModule.name == this.props.userRoleInEditMode.module_name) {
                moduleId = currentModule.id;
                break;
            }
        }
        if (moduleId) {
            let newRoleName = this.props.userRoleInEditMode.role_name.trim();
            for (let i=0; i<this.props.userRoles.length; i++) {
                let userRole = this.props.userRoles[i];
                if (userRole.module_id == moduleId && newRoleName == userRole.role_name.trim()) {
                    existingRole = true;
                    break;
                }
            }
        }

        //check all prameters
        this.canSave = this.props.dirty &&
                        !existingRole && 
                        this.props.userRoleInEditMode.role_name.length >= 2;
    }

    renderEditMode() {
        this.isSaveValid();
        return (
                <tr className='edit-mode-tr'>
                    <td>
                <Combo className="input-group" items={this.props.modules} maxDisplayItems={5} itemIdProperty="id" 
                       itemDisplayProperty="name" defaultValue={this.props.userRoleInEditMode.module_name} onChange={this.comboChange.bind(this, 'module')}/>
                </td>
                <td>
                    <input type="text" className="form-control" value={this.props.userRoleInEditMode.role_name} onChange={this.updateRowText.bind(this, 'role_name')}/>
                </td>
                <td>
                    <div className='checkbox'>
                        <label>
                            <input type="checkbox" value={this.textValues.teamLeaderTitle}
                                   onChange={this.updateRowText.bind(this, 'team_leader')}
                                   checked={this.props.userRoleInEditMode.team_leader == 1 ? 'checked' : ''}/>
                            {this.textValues.yesValue + '?'}
                        </label>
                    </div>
                </td>
                <td>
                    <div >

                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.canSave ? "" : "disabled")} 
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
        if (this.props.isUserRoleInEditMode && this.props.item.key === this.props.userRoleKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        modules: state.system.lists.modules,
        isUserRoleInEditMode: state.system.listsScreen.systemTab.isUserRoleInEditMode,
        isUserRoleInAddMode: state.system.listsScreen.systemTab.isUserRoleInAddMode,
        userRoleKeyInSelectMode: state.system.listsScreen.systemTab.userRoleKeyInSelectMode,
        userRoleInEditMode: state.system.listsScreen.systemTab.userRoleInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(UserRoleRow));