import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestStatusRow from './RequestStatusRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';

class RequestStatus extends React.Component {
    textIgniter() {
        this.textValues={
            listTitle: 'סטטוס פניה',
            addButtonTitle: 'הוספת סטטוס',
            searchTitle: 'חיפוש',
            nameTitle : 'סטטוס',
            requestStatusTypeTitle : 'סוג סטטוס',
            modalWindowTitle:'מחיקת סטטוס',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הסטטוס הזו?',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול',
            orderTitle: 'שנוי סדר הצגה',
        };
        this.noBorderLeft={borderLeft:'none'};
    }

    updateRequestStatusSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_STATUS_SEARCH_VALUE, value});
    }

    addNewRequestStatus() {
        const event='add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ADD_REQUEST_STATUS_MODE_UPDATED, event});
    }
    
    orderList(orderColumn) {
        //this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_STATUS, orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteRequestStatus(store,this.props.requestStatusKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_STATUS_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
     
        this.requestStatusRows=this.props.requestStatus
                .map(function(item){
                    if(item.name.indexOf(this.props.requestStatusSearchValue)!=-1){
                        return <RequestStatusRow key={item.key} item={item} move={this.move.bind(this)} 
                                  revertToOriginal={this.revertToOriginal.bind(this)} drop={this.drop.bind(this)} 
                                  updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isRequestStatusOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }

    sortListDnD(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS_MODE});

    }

    //move items in hover - only if needed
    move(fromItem, toItem, before) {
        if (fromItem.key != toItem.key) {
            var i = 0;

            for (; i < this.props.requestStatus.length; i++) {
                if (this.props.requestStatus[i].key == fromItem.key)
                    break;
            }
            if (before) {
                if ((this.props.requestStatus.length == i + 1) || ((this.props.requestStatus.length > i + 1) && (this.props.requestStatus[i + 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS, fromItem: fromItem, toItem: toItem, before: before});
                }
            } else {
                if ((i == 0) || ((i > 0) && (this.props.requestStatus[i - 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS, fromItem: fromItem, toItem: toItem, before: before});
                }
            }
        }
    }    
    
    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS_DROP});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requeststatus'});
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_REQUEST_STATUS_REVERT_TO_ORIGINAL});
    }

    cancelDnDSort() {
        SystemActions.loadRequestStatus(this.props.dispatch);
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requeststatus'});
    }

    saveDndSort() {
        var itemsOrder = [];
        for (var i = 0; i < this.props.requestStatus.length; i++) {
            var key = this.props.requestStatus[i].key;
            var order = this.props.requestStatus[i].order;
            itemsOrder.push({key, order});
        }
        SystemActions.updateRequestStatusOrder(store,itemsOrder);
    }
    
    updateRowText(key, e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});
    }

    saveNewRequestStatus(){
        SystemActions.addRequestStatus(store,this.props.requestStatusInEditMode);
    }
    
    cancelAddMode(){
        const event='cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ADD_REQUEST_STATUS_MODE_UPDATED, event});
    }
    
    comboChange(columnName, el) {
        if (el.target.selectedItem) {
            //store the name
            var value = el.target.selectedItem.name;
            var key = columnName + '_name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});

            //store the key
            value = el.target.selectedItem.id;
            key = columnName + '_id';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED, key, value});
        }
    }
    
    isAddValid(){
        return (this.props.requestStatusInEditMode.type_id != -1 && this.props.requestStatusInEditMode.name.length>=2) ? '' : 'disabled';
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='requestStatus';
        let hasScrollbar=false;

        if (undefined!= this.self && null !=this.self) {
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
        return this.props.tableHasScrollbar.requestStatus? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }

    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    renderTableHeader() {
        if (this.props.isRequestStatusInDnDSort == true) {
            this.tableHeader =

                            <span className="pull-left">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveDndSort.bind(this)} title={this.textValues.saveTitle} >
                                    <i className="fa fa-floppy-o"></i>
                                </button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelDnDSort.bind(this)} title={this.textValues.cancelTitle} >
                                    <i className="fa fa-times"></i>
                                </button>
                            </span>
        } else {
            this.tableHeader =

                            <span className="pull-left">
                                <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status.edit']) ? '' : ' hidden')} 
                                    onClick={this.sortListDnD.bind(this)} title={this.textValues.orderTitle} >
                                    <i className="fa fa-sort-numeric-asc"></i>
                                </button>
                            </span>


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
    
    render() {

        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        this.renderTableHeader();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'requestStatus')} aria-expanded={this.props.containerCollapseStatus.requestStatus}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.requestStatus}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="requestStatusSearch" className="col-md-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestStatusSearch"
                                            value={this.props.requestStatusSearchValue} onChange={this.updateRequestStatusSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-md-2">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.requestStatusSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewRequestStatus.bind(this)}>
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className={'well'+(this.props.isRequestStatusInAddMode? '':' hidden')}>
                                <div className="row form-horizontal">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-2">
                                        <div className="row form-group">
                                            <label htmlFor="statusName" className="col-md-5 control-label">{this.textValues.nameTitle}</label>
                                                <input type="input" className="col-md-7 form-control" id="statusName" value={this.props.requestStatusInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row">
                                                    <label className="col-md-5 control-label">{this.textValues.requestStatusTypeTitle}</label>
                                            <div className="col-md-7">                                                    
                                              <Combo  items={this.props.requestStatusType} maxDisplayItems={5} itemIdProperty="id" 
                                              itemDisplayProperty='name' defaultValue='' onChange={this.comboChange.bind(this, 'type')} />
                                           </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <span className="edit-buttons">
                                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveNewRequestStatus.bind(this)} 
                                            disabled={this.isAddValid()} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelAddMode.bind(this)} 
                                            title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-5">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead >
                                            <tr >
                                                <th style={{verticalAlign: 'top'}}>
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer" >
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.requestStatusOrderColumn==='name1'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={this.noBorderLeft}>
                                                    <span onClick={this.orderList.bind(this,'type_name')} className="cursor-pointer" >
                                                        {this.textValues.requestStatusTypeTitle}&nbsp;
                                                        <i className={this.props.requestStatusOrderColumn==='type_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>

                                                    </span>
                                                     {this.tableHeader}

                                                </th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.requestStatusRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showRequestStatusModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        requestStatus: state.system.lists.requestStatus,
        requestStatusType: state.system.lists.requestStatusType,
        requestStatusSearchValue: state.system.listsScreen.requestTab.requestStatusSearchValue,
        showRequestStatusModalDialog: state.system.listsScreen.requestTab.showRequestStatusModalDialog,
        requestStatusKeyInSelectMode: state.system.listsScreen.requestTab.requestStatusKeyInSelectMode,
        isRequestStatusOrderedAsc: state.system.listsScreen.requestTab.isRequestStatusOrderedAsc,
        requestStatusOrderColumn: state.system.listsScreen.requestTab.requestStatusOrderColumn,
        requestStatusInEditMode: state.system.listsScreen.requestTab.requestStatusInEditMode,
        isRequestStatusInAddMode: state.system.listsScreen.requestTab.isRequestStatusInAddMode,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        dirtyComponents: state.system.dirtyComponents,
        isRequestStatusInEditMode: state.system.listsScreen.requestTab.isRequestStatusInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentUser: state.system.currentUser,
        scrollbarWidth : state.system.scrollbarWidth,
        isRequestStatusInDnDSort: state.system.listsScreen.requestTab.isRequestStatusInDnDSort,  
    };
}
export default connect(mapStateToProps)(withRouter(RequestStatus));