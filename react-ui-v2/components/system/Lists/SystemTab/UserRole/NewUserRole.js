import React from 'react';
import { connect }
from 'react-redux';
import { withRouter }
from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import Combo from '../../../../global/Combo';

class NewUserRole extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_VALUE_CHANGED, key, value});
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
        }
    }

    cancelAddMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_ADD_MODE_UPDATED, event});
    }

    saveNewRole() {
        SystemActions.addUserRole(store, this.props.userRoleInEditMode);
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_ADD_MODE_UPDATED, event});
    }

    textIgniter() {
        this.textValues = {
            nameTitle: 'מודל',
            roleNameTitle: 'שם תפקיד',
            teamLeaderTitle: 'ראש צוות',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    isAddValid() {
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
        return (-1 != this.props.userRoleInEditMode.module_id && !existingRole && this.props.userRoleInEditMode.role_name.length >= 2) ? '' : 'disabled';
    }

    render() {
        return(
                <div className={'well' + (this.props.isUserRoleInAddMode ? '' : ' hidden')}>
                    <div className="row form-horizontal">
                        <div className="col-md-1"></div>
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label htmlFor="roleName" className="col-sm-4 control-label">{this.textValues.roleNameTitle}</label>
                                <div className="col-sm-8">
                                    <input type="input" className="form-control" id="roleName" value={this.props.userRoleInEditMode.role_name} onChange={this.updateRowText.bind(this, 'role_name')}/>
                                </div>
                            </div>
                            <div className='checkbox'>
                                <label>
                                    <input type="checkbox" value={this.textValues.teamLeaderTitle}
                                           onChange={this.updateRowText.bind(this, 'team_leader')}
                                           checked={this.props.userRoleInEditMode.team_leader == 1 ? 'checked' : ''}/>
                                    {this.textValues.teamLeaderTitle}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label className="col-md-4 control-label">{this.textValues.nameTitle}</label>
                                <div className='col-md-8'>
                                    <Combo items={this.props.modules} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                                           defaultValue={this.props.userRoleInEditMode.module_name} onChange={this.comboChange.bind(this, 'module')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <span className="edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveNewRole.bind(this)} 
                                        disabled={this.isAddValid()} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelAddMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </div>
                </div>
                );
    }
}


function mapStateToProps(state) {
    return {
        modules: state.system.lists.modules,
        userRoleInEditMode: state.system.listsScreen.systemTab.userRoleInEditMode,
        isUserRoleInAddMode: state.system.listsScreen.systemTab.isUserRoleInAddMode,
    };
}
export default connect(mapStateToProps)(withRouter(NewUserRole));