import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import InstituteRoleRow from './InstituteRoleRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';

class InstituteRole extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle:'תפקיד במוסד',
            addButtonTitle: 'הוספת תפקיד',
            searchTitle: 'חיפוש',
            nameTitle : 'תפקיד',
            typeLabel : 'סוג',
            modalWindowTitle:'מחיקת תפקיד',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התפקיד הזו?'
        };
    }
    
    updateInstituteRoleSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_ROLE_SEARCH_VALUE, value});
    }

    addNewInstituteRole() {
        SystemActions.addInstituteRole(store, this.props.instituteRoleInEditMode,this.props.instituteRoleTypeKey);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_ROLES});
    }
    
    deleteInstituteRoleConfirm(){
        SystemActions.deleteInstituteRole(store,this.props.instituteRoleKeyInSelectMode, this.props.instituteRoleTypeKey);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_ROLE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.instituteRoleRows=this.props.instituteRoles.map(function(item){
                    if(item.name.indexOf(this.props.instituteRoleSearchValue)!=-1){
                        if(this.props.isInstituteRoleInEditMode && item.key === this.props.instituteRoleKeyInSelectMode){
                            /* EDIT MODE */
                            return <InstituteRoleRow key={item.key} item={item} isInEditMode={true} isNameExistInTheList={this.isNameExistInTheList.bind(this)}/>
                        }else{
                            /* DISPLAY MODE */
                            return <InstituteRoleRow key={item.key} item={item} isInEditMode={false} updateScrollPosition={this.updateScrollPosition.bind(this)} />    
                        }
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isInstituteRolesOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    comboChange(el) {
        if (el.target.selectedItem) {
            let item=el.target.selectedItem;
            SystemActions.loadInstituteRoles(store, item.key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_INSTITUTE_ROLES, id:item.id,key:item.key});
        }
    }
    
    isNameExistInTheList(name){
        var result=_.find(this.props.instituteRoles, ['name', name]);
        return(undefined==result)?false:true;
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
    componentDidUpdate(){
        //after editing scroll back to the item position
        if (undefined!= this.self&& null !=this.self && this.props.currentTableScrollerPosition>0) {
            this.self.scrollTop=this.props.currentTableScrollerPosition;
        }
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.roles']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'instituteRole')} aria-expanded={this.props.containerCollapseStatus.instituteRole}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.instituteRole}>
                        <div className="CollapseContent">
                            <div className="row form-group">
                                <label htmlFor="selectType" className="col-md-1 control-label">{this.textValues.typeLabel}</label>
                                <div className="col-md-5">
                                    <Combo className="input-group" items={this.props.allInstituteTypes} maxDisplayItems={10} itemIdProperty="key" itemDisplayProperty='name'
                                        defaultValue='' onChange={this.comboChange.bind(this)} idForLabel="selectType" />
                                </div>
                            </div>
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="instituteRoleSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="instituteRoleSearch"
                                               value={this.props.instituteRoleSearchValue} onChange={this.updateInstituteRoleSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" onClick={this.addNewInstituteRole.bind(this)}
                                            className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.roles.add']) ? '' : ' hidden')} 
                                            disabled={(((this.props.instituteRoleTypeKey !=-1) && (this.props.instituteRoleSearchValue.length >= 2) && (false==this.isNameExistInTheList(this.props.instituteRoleSearchValue))) ? "" : "disabled")}>
                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-5">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this)} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.instituteRoleRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showInstituteRoleModalDialog} buttonOk={this.deleteInstituteRoleConfirm.bind(this)} 
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
        allInstituteTypes: state.system.lists.allInstituteTypes,
        instituteRoles: state.system.lists.instituteRoles,
        instituteRoleSearchValue: state.system.listsScreen.voterTab.instituteRoleSearchValue,
        isInstituteRolesOrderedAsc: state.system.listsScreen.voterTab.isInstituteRolesOrderedAsc,
        showInstituteRoleModalDialog: state.system.listsScreen.voterTab.showInstituteRoleModalDialog,
        instituteRoleKeyInSelectMode: state.system.listsScreen.voterTab.instituteRoleKeyInSelectMode,
        instituteRoleTypeKey: state.system.listsScreen.voterTab.instituteRoleTypeKey,
        instituteRoleInEditMode: state.system.listsScreen.voterTab.instituteRoleInEditMode,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isInstituteRoleInEditMode: state.system.listsScreen.voterTab.isInstituteRoleInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteRole));