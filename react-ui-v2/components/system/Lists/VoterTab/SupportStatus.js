import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import SupportStatusRow from './SupportStatusRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
        import ModalWindow from '../../../global/ModalWindow';

class SupportStatus extends React.Component {

    textIgniter() {
        this.textValues = {
            listTitle: 'מצב תמיכה',
            addButtonTitle: 'הוספת מצב תמיכה',
            searchTitle: 'חיפוש',
            nameTitle: 'מצב תמיכה',
            modalWindowTitle: 'מחיקת מצב תמיכה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את מצב התמיכה הזה?'
        };
    }

    updateSupportStatusSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_SUPPORT_STATUS_SEARCH_VALUE, value});
    }

    addNewSupportStatus() {
        SystemActions.addSupportStatus(store, this.props.supportStatusSearchValue);
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteSupportStatus(store, this.props.supportStatusKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUPPORT_STATUS_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.supportStatusRows = this.props.supportStatus
                .map(function (item) {
                    if (item.name.indexOf(this.props.supportStatusSearchValue) != -1) {
                        return <SupportStatusRow key={item.key} item={item}  move={this.move.bind(this)} 
                                  revertToOriginal={this.revertToOriginal.bind(this)} drop={this.drop.bind(this)} 
                                  updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    sortListDnD(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS_MODE});
    }

    //move items in hover - only if needed
    move(fromItem, toItem, before) {
        if (fromItem.key != toItem.key) {
            var i = 0;

            for (; i < this.props.supportStatus.length; i++) {
                if (this.props.supportStatus[i].key == fromItem.key)
                    break;
            }
            if (before) {
                if ((this.props.supportStatus.length == i + 1) || ((this.props.supportStatus.length > i + 1) && (this.props.supportStatus[i + 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS, fromItem: fromItem, toItem: toItem, before: before});
                }
            } else {
                if ((i == 0) || ((i > 0) && (this.props.supportStatus[i - 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS, fromItem: fromItem, toItem: toItem, before: before});
                }
            }
        }
    }    
    
    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS_DROP});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'SupportStatus'});
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.DND_SUPPORT_STATUS_REVERT_TO_ORIGINAL});
    }

    cancelDnDSort() {
        SystemActions.loadSupportStatus(store);
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'SupportStatus'});
    }

    saveDndSort() {
        var itemsOrder = [];
        for (var i = 0; i < this.props.supportStatus.length; i++) {
            var key = this.props.supportStatus[i].key;
            var level = this.props.supportStatus[i].level;
            itemsOrder.push({key, level});
        }
        SystemActions.updateSupportStatusOrder(store,itemsOrder);
    }

    renderTableHeader() {
        if (this.props.issupportStatusInDnDSort == true) {
            this.tableHeader =
                    <tr>
                        <th>
                            {this.textValues.nameTitle}
                            <span className="pull-left">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveDndSort.bind(this)}>
                                    <i className="fa fa-floppy-o"></i>
                                </button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelDnDSort.bind(this)}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </span>
                        </th>
                    </tr>
        } else {
            this.tableHeader =
                    <tr>
                        <th>
                            {this.textValues.nameTitle}
                            <span className="pull-left">
                                <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status.edit']) ? '' : ' hidden')} 
                                    onClick={this.sortListDnD.bind(this)}>
                                    <i className="fa fa-sort-numeric-asc"></i>
                                </button>
                            </span>
                        </th>
                    </tr>

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
        this.renderTableHeader();
        this.renderRows();

        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'supportStatus')} aria-expanded={this.props.containerCollapseStatus.supportStatus}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.supportStatus}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="supportStatusSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="supportStatusSearch"
                                            value={this.props.supportStatusSearchValue} onChange={this.updateSupportStatusSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.support_status.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.supportStatusSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewSupportStatus.bind(this)}>
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
                                            {this.tableHeader}
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.supportStatusRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showSupportStatusModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        supportStatus: state.system.lists.supportStatus,
        supportStatusSearchValue: state.system.listsScreen.voterTab.supportStatusSearchValue,
        showSupportStatusModalDialog: state.system.listsScreen.voterTab.showSupportStatusModalDialog,
        supportStatusKeyInSelectMode: state.system.listsScreen.voterTab.supportStatusKeyInSelectMode,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        issupportStatusInDnDSort: state.system.listsScreen.voterTab.issupportStatusInDnDSort,
        isSupportStatusInEditMode: state.system.listsScreen.voterTab.isSupportStatusInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(SupportStatus));