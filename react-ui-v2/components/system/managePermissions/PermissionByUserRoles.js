import React from 'react'
import { connect } from 'react-redux'
import Combo from '../../global/Combo'
import PermissionItem from './PermissionItem'
import ModalWindow from '../../global/ModalWindow'
import { withRouter } from 'react-router'
import * as SystemActions from '../../../actions/SystemActions'
import globalSaving from './../../hoc/globalSaving'

class PermissionByUserRoles extends React.Component {

    componentWillMount() {
        SystemActions.loadRoles(this.props.dispatch);

        SystemActions.loadPermissions(this.props.dispatch);
        if ((this.props.router.params.groupKey != undefined) && (this.props.selectedUserRole.key == null)) {
            this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_CURRENT_URL_KEY, key: this.props.router.params.groupKey});
        }
        if (this.props.router.params.groupKey != undefined) {
            this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_GROUP_INPUT, groupInput: ''});
            this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGED_INPUT, inputChanged: false});
        }
        //clear when returning to screen
        this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_GROUP_INPUT, groupInput: ''});
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    componentWillUpdate() {

        if (this.props.router.params.groupKey != this.props.currentUrlKey)
            this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_CURRENT_URL_KEY, key: this.props.router.params.groupKey});
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.currentUrlKey != nextProps.currentUrlKey) && (nextProps.currentUrlKey != undefined))
            SystemActions.loadUserRolePermissions(this.props.dispatch, this.props.router, nextProps.currentUrlKey);

        if((this.props.router.params.groupKey == undefined) && (nextProps.currentUrlKey == undefined)) { //clear permission group when entering
            this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.GROUP_PERMISSION_EDIT_MODE_UPDATED, isPermissionGroupInEditMode: false});
        }

        if((this.props.currentUrlKey != nextProps.currentUrlKey) && (nextProps.currentUrlKey == undefined && this.props.inputChanged) ) {
           this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_GROUP_INPUT, groupInput: ''}); 
          
        }

        if (!this.props.selectedUserRole.key && nextProps.selectedUserRole.key || (this.props.selectedUserRole.key == nextProps.selectedUserRole.key )){
            var systemTitle = (nextProps.selectedUserRole.name ? "הרשאת "+ nextProps.selectedUserRole.name : "הרשאות");                    
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle});

        } else {
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'הרשאות'});
        }  

        if (!this.props.currentUser.admin && !nextProps.currentUser.permissions['system.permission_groups'] && this.props.currentUser.permissions['system.permission_groups'] && this.props.currentUser.first_name.length>1){
            this.props.router.replace('/unauthorized');
        }             
    }

    setGroup(e) {
        this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGE_GROUP_INPUT, groupInput: e.target.value});
        if (e.target.selectedItem != undefined) {
            var selectedItem = e.target.selectedItem;

            if (selectedItem.key != this.props.router.params.groupKey){                
                this.props.router.push("/system/permission_groups/" + selectedItem.key);
                this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGED_INPUT, inputChanged: true});
             }           
        } else {
            if (this.props.router.params.groupKey != undefined && !this.props.isPermissionGroupInEditMode){
                this.props.router.push("/system/permission_groups/");                
                this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGED_INPUT, inputChanged: false});
            }
            else{
                this.props.dispatch({type: SystemActions.ActionTypes.PERMISSIONS.CHANGED_INPUT, inputChanged: true});
            }
        }
      
    }

    setPermissionBlockStyle() {
        if ((this.props.router.params.groupKey == undefined) || (this.props.isPermissionGroupInEditMode)) {
            this.permissionBlockStyle = {
                display: "none"
            }
        } else {
            this.permissionBlockStyle = {};
            this.permissionBlockStyle.paddingTop = "10px";
        }
    }

    setComboValue() {
        if (this.props.selectedUserRole.name == null) {
            this.comboValue = '';
        } else {
            this.comboValue = this.props.selectedUserRole.name;
        }
    }

    setDeleteButtonStyle() {
        if (this.props.router.params.groupKey == undefined) {
            this.deleteButtonStyle = {
                display: "none"
            }
        } else {
            this.deleteButtonStyle = {};
        }
    }

    isSaveGroupEnabled() {
        if (this.props.groupInputValue.trim().length >= 3 && this.props.savingChanges == false && this.props.dirtyComponents[0]== 'system.permissiongroups.groups' && this.props.groupInputValue != this.props.selectedUserRole.name){
            if (this.props.selectedUserRole.name != this.props.groupInputValue)     
                return true;
            else{
                if (this.props.isPermissionGroupInEditMode){
                    return true;
                }
                return false;
            }
        }
    }
    isSavePermissionsEnabled() {
        return this.props.savingChanges == false && this.props.dirtyComponents[0] == 'system.permissiongroups.items';
    }

    getPermissions() {
        var _this = this;
        this.permissionItems = this.props.permissions.map(function (permission) {
            return <PermissionItem key={permission.key} item={permission} selectedPermissions={_this.props.selectedPermissions} openPermissions={_this.props.openPermissions}/>
        });
    }

        updatePermissions(e) {
        e.preventDefault();
        SystemActions.updateUserRolePermissions(this.props.dispatch, this.props.selectedUserRole.key, this.props.selectedPermissions , this.props.groupInputValue);
    }

    setInputValue() {
        this.inputValue = '';
        if  (this.props.router.params.groupKey == undefined || this.props.isPermissionGroupInEditMode) {
            this.inputValue = this.props.groupInputValue;

        } else {
            var _this = this;
            this.props.userRoles.forEach(function(permissionGroup1) {
            if (permissionGroup1.key == _this.props.router.params.groupKey)  _this.inputValue = permissionGroup1.name;
            });
        }
    }

    validateInput() {
        this.validInputs = true;

        if (this.props.groupInputValue.trim().length >= 3) {
            this.inputStyle = {};
        } else {
            this.validInputs = false;
            this.inputStyle = {
                borderColor: '#cc0000'
            };
        }
    }

    render() {


        this.setInputValue();
        this.setPermissionBlockStyle();
        this.getPermissions();
        this.setDeleteButtonStyle();
        this.validateInput();
		let inputItem = '' ;
        //displays unauthorize screen if user has no permission
        if (!this.props.currentUser.admin && !this.props.currentUser.permissions['system.permission_groups'] && this.props.currentUser.first_name.length>1){
            // this.props.router.replace('/unauthorized');
        }
        if (!this.props.isPermissionGroupInEditMode){
            inputItem = <Combo items={this.props.userRoles} value={this.inputValue} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty="name" onChange={this.setGroup.bind(this)}/>
        } 						
        return (
                <div>
					<h1>הרשאות</h1>
                    <section className="main-section-block dtlsBox">
                        <div className="row">
                            <div className="col-md-2" style={{fontSize: "20px"}}>הרשאות:</div>
                            <div className="col-md-2">
                            <Combo items={this.props.userRoles} value={this.inputValue} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty="name" onChange={this.setGroup.bind(this)}/>
                            </div>
                        </div>
                    </section>
                    <section className="section-block" style={this.permissionBlockStyle}>
                        <div className="ContainerCollapse">
                            <div className="row collapseContent">
                                <div className="col-md-12">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <ul style={{listStyleType: "none"}}>
                                                {this.permissionItems}
                                            </ul>
                                        </div>
                                        <div className="form-group" style={{margin:'0 auto', width: '250px'}}>
										    <button className="btn btn-block btn-primary saveChanges" onClick={this.updatePermissions.bind(this) } disabled={this.isSavePermissionsEnabled() ? "":"disabled"}>שמירה</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                                )
                    }
                }

        function mapStateToProps(state) {

            return {
                userRoles: state.system.roles,
                selectedUserRole: state.system.permissionGroupsScreen.selectedUserRole,
                permissions: state.system.permissionGroupsScreen.permissions,
                selectedPermissions: state.system.permissionGroupsScreen.selectedPermissions,
                openPermissions: state.system.permissionGroupsScreen.openPermissions,
                groupInputValue: state.system.permissionGroupsScreen.groupInputValue,
                inputChanged: state.system.permissionGroupsScreen.inputChanged,
                isPermissionGroupInEditMode: state.system.permissionGroupsScreen.isPermissionGroupInEditMode,
                currentUrlKey: state.system.permissionGroupsScreen.currentUrlKey,
                showCantDeleteModal: state.system.permissionGroupsScreen.showCantDeleteModal,
                showMissingGroupModal: state.system.permissionGroupsScreen.showMissingGroupModal,
                dirtyComponents: state.system.dirtyComponents,
                dirty: state.system.dirty,
				currentUser: state.system.currentUser,
                savingChanges: state.system.savingChanges,
                changesSaved: state.system.changesSaved
            }
        }

        export default globalSaving(connect(mapStateToProps)(withRouter(PermissionByUserRoles)));