import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import UserRoleRow from './UserRoleRow';
import NewUserRole from './NewUserRole';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
import ModalWindow from '../../../../global/ModalWindow';

class UserRole extends React.Component {
    textIgniter() {
        this.textValues={
            listTitle: 'תפקידי משתמש',
            addButtonTitle: 'הוספת תפקיד',
            searchTitle: 'חיפוש',
            nameTitle : 'מודל',
            roleNameTitle : 'שם תפקיד',
            teamLeaderTitle : 'ראש צוות',
            modalWindowTitle:'מחיקת תפקיד',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התפקיד הזו?'
        };
    }

    updateUserRoleSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_USER_ROLE_SEARCH_VALUE, value});
    }

    addNewUserRole() {
        const event='add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.USER_ROLE_ADD_MODE_UPDATED, event});
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_USER_ROLES, orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteUserRole(store,this.props.userRoleKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_USER_ROLE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.userRoleRows=this.props.userRoles
                .map(function(item){
                    if(item.role_name.indexOf(this.props.userRoleSearchValue)!=-1){
                        return <UserRoleRow key={item.key}
                                            item={item}
                                            updateScrollPosition={this.updateScrollPosition.bind(this)}
                                            userRoles={this.props.userRoles}/>
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isUserRoleOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='userRole';
        let hasScrollbar=false;
        
        if (undefined!= this.self&& null !=this.self) {
            hasScrollbar=this.self.scrollHeight > this.self.clientHeight ?true:false;
        }
        
        if(hasScrollbar!=this.props.tableHasScrollbar[container]){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED, container, hasScrollbar});
        }
        
        //after editing scroll back to the item position
        if (undefined!= this.self&& null !=this.self && this.props.currentTableScrollerPosition>0) {
            this.self.scrollTop=this.props.currentTableScrollerPosition;
        }
    }
    
    getScrollHeaderStyle(){
        return this.props.tableHasScrollbar.userRole? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'userRole')} aria-expanded={this.props.containerCollapseStatus.userRole}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.userRole}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="userRoleSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="userRoleSearch"
                                            value={this.props.userRoleSearchValue} onChange={this.updateUserRoleSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles.add']) ? '' : ' hidden')} 
                                            onClick={this.addNewUserRole.bind(this)} disabled={(this.props.userRoleSearchValue.length >= 2 && !this.props.isUserRoleInEditMode ? "" : "disabled")} >
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <NewUserRole userRoles={this.props.userRoles}/>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-11">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'module_name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.userRoleOrderColumn==='module_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'role_name')} className="cursor-pointer">
                                                        {this.textValues.roleNameTitle}&nbsp;
                                                        <i className={this.props.userRoleOrderColumn==='role_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'team_leader')} className="cursor-pointer">
                                                        {this.textValues.teamLeaderTitle}&nbsp;
                                                        <i className={this.props.userRoleOrderColumn==='team_leader'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th></th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.userRoleRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showUserRoleModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                    buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                        <div>{this.textValues.modalWindowBody}</div>
                                    </ModalWindow>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        userRoles: state.system.lists.userRoles,
        userRoleSearchValue: state.system.listsScreen.systemTab.userRoleSearchValue,
        showUserRoleModalDialog: state.system.listsScreen.systemTab.showUserRoleModalDialog,
        userRoleKeyInSelectMode: state.system.listsScreen.systemTab.userRoleKeyInSelectMode,
        isUserRoleOrderedAsc: state.system.listsScreen.systemTab.isUserRoleOrderedAsc,
        userRoleOrderColumn: state.system.listsScreen.systemTab.userRoleOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isUserRoleInEditMode: state.system.listsScreen.systemTab.isUserRoleInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentUser: state.system.currentUser,
        scrollbarWidth : state.system.scrollbarWidth,
    };
}
export default connect(mapStateToProps)(withRouter(UserRole));