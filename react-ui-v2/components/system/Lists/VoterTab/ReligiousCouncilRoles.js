import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import ReligiousCouncilRoleRow from './ReligiousCouncilRoleRow';
import * as SystemActions from 'actions/SystemActions';
import store from 'store'
import ModalWindow from 'components/global/ModalWindow';

class ReligiousCouncilRole  extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'תפקידים במועצה הדתית',
            addButtonTitle: 'הוספת תפקיד',
            searchTitle: 'חיפוש',
            nameTitle : 'תפקיד',
            modalWindowTitle:'מחיקת תפקיד',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התפקיד הזה?'
        };
    }

    updateReligiousCouncilSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_RELIGIOUS_COUNCIL_ROLES_SEARCH_VALUE, value}); 
    }

    addNewReligiousCouncil() {
        SystemActions.addReligiousCouncilRole(store, this.props.religiousCouncilSearchValue); 
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_RELIGIOUS_COUNCIL_ROLES}); 
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteReligiousCouncilRole(store,this.props.religiousCouncilKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_RELIGIOUS_COUNCIL_ROLES_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.religiousCouncilRows = this.props.religiousCouncilRoles
                .map(function(item){
                    if(item.name.indexOf(this.props.religiousCouncilSearchValue)!=-1){
                        return <ReligiousCouncilRoleRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isReligiousCouncilOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false == this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
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

    isNameExistInTheList(){
        var result=_.find(this.props.religiousCouncilRoles, ['name', this.props.religiousCouncilSearchValue]);
        return(undefined==result)?false:true;
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();

        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_council_roles']) ? '' : ' hidden')}> 
                    <a onClick={this.updateCollapseStatus.bind(this,'religeousCouncilRole')} aria-expanded={this.props.containerCollapseStatus.religeousCouncilRole}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.religeousCouncilRole}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="religiousCouncilSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="religiousCouncilSearch"
                                            value={this.props.religiousCouncilSearchValue} onChange={this.updateReligiousCouncilSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_council_roles.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.religiousCouncilSearchValue.length >= 2 && !this.isNameExistInTheList()) ? "" : "disabled")} onClick={this.addNewReligiousCouncil.bind(this)}>
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
                                            {this.religiousCouncilRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showReligiousCouncilModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        religiousCouncilRoles: state.system.lists.religiousCouncilRoles,
        religiousCouncilSearchValue: state.system.listsScreen.voterTab.religiousCouncilSearchValue,
        showReligiousCouncilModalDialog: state.system.listsScreen.voterTab.showReligiousCouncilModalDialog,
        religiousCouncilKeyInSelectMode: state.system.listsScreen.voterTab.religiousCouncilKeyInSelectMode,
        isReligiousCouncilOrderedAsc: state.system.listsScreen.voterTab.isReligiousCouncilOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isReligiousCouncilInEditMode: state.system.listsScreen.voterTab.isReligiousCouncilInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(ReligiousCouncilRole));