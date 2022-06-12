import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import ReligiousGroupRow from './ReligiousGroupRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class ReligiousGroups extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'זרם',
            addButtonTitle: 'הוספת זרם',
            searchTitle: 'חיפוש',
            nameTitle : 'זרם',
            modalWindowTitle:'מחיקת זרם',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הזרם הזה'
        };
    }

    updateReligiousGroupsSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_RELIGIOUS_GROUPS_SEARCH_VALUE, value});
    }

    addNewReligiousGroup() {
        SystemActions.addReligiousGroup(store, this.props.religiousGroupsSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_RELIGIOUS_GROUPS});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteReligiousGroup(store,this.props.religiousGroupKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_RELIGIOUS_GROUP_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.religiousGroupRows=this.props.religiousGroups
                .map(function(item){
                    if(item.name.indexOf(this.props.religiousGroupsSearchValue)!=-1){
                        return <ReligiousGroupRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isReligiousGroupsOrderedAsc? 'asc':'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_groups']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'religiousGroups')} aria-expanded={this.props.containerCollapseStatus.religiousGroups}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.religiousGroups}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="religiousGroupsSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="religiousGroupsSearch"
                                            value={this.props.religiousGroupsSearchValue} onChange={this.updateReligiousGroupsSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_groups.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.religiousGroupsSearchValue.length >=2 ? "" : " disabled")} onClick={this.addNewReligiousGroup.bind(this)}>
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
                                            {this.religiousGroupRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showReligiousGroupsModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        religiousGroups: state.system.lists.religiousGroups,
        religiousGroupsSearchValue: state.system.listsScreen.voterTab.religiousGroupsSearchValue,
        showReligiousGroupsModalDialog: state.system.listsScreen.voterTab.showReligiousGroupsModalDialog,
        religiousGroupKeyInSelectMode: state.system.listsScreen.voterTab.religiousGroupKeyInSelectMode,
        isReligiousGroupsOrderedAsc: state.system.listsScreen.voterTab.isReligiousGroupsOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isReligiousGroupInEditMode: state.system.listsScreen.voterTab.isReligiousGroupInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(ReligiousGroups));