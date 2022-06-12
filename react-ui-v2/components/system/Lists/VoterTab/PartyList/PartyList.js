import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import PartyListRow from './PartyListRow';
import NewPartyList from './NewPartyList';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class PartyList extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            listTitle: 'מפלגות',
            addButtonTitle: 'הוספת מפלגה',
            searchTitle: 'חיפוש',
            nameTitle: 'מפלגה',
            lettersTitle: 'אותיות',
            shasTitle: 'מפלגת שס',
            modalWindowTitle: 'מחיקת מפלגה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את המפלגה הזה?',
            partyListNameIsSmall: 'שם מפלגהס קצר מדי'
        };
    }

    updatePartyListSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_PARTY_LIST_SEARCH_VALUE, value});
    }

    addNewPartyList() {
        const event = 'add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_PARTY_LIST_MODE_UPDATED, event});
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_PARTY_LISTS, orderColumn});
    }

    deletePartyListConfirm() {
        SystemActions.deletePartyList(this.props.dispatch, this.props.partyListKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PARTY_LIST_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.partyListRows = this.props.partyLists
                .map(function (item) {
                    if (item.name.indexOf(this.props.partyListSearchValue) != -1) {
                        return <PartyListRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isPartyListsOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container) {
        if (false == this.props.dirty) {
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }

    updateRowText(key, e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_VALUE_CHANGED, key, value});
    }

    cancelAddMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_PARTY_LIST_MODE_UPDATED, event});
    }

    saveEdit() {
        SystemActions.addPartyList(this.props.dispatch, this.props.partyListInEditMode);
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='partyList';
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
        return this.props.tableHasScrollbar.partyList? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    render() {
        this.renderRows();
        this.setOrderDirection();

        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.party_lists']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'partyList')} aria-expanded={this.props.containerCollapseStatus.partyList}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.partyList}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="partyListSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="partyListSearch"
                                               value={this.props.partyListSearchValue} onChange={this.updatePartyListSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" onClick={this.addNewPartyList.bind(this)}
                                            className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.party_lists.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.partyListSearchValue.length >= 2) ? "" : "disabled")}>
                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <NewPartyList partyListInEditMode={this.props.partyListInEditMode} isPartyListInAddMode={this.props.isPartyListInAddMode}/>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-10">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.partyListOrderColumn === 'name' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'letters')} className="cursor-pointer">
                                                        {this.textValues.lettersTitle}&nbsp;
                                                        <i className={this.props.partyListOrderColumn === 'letters' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={{borderLeft:'none'}}>
                                                    <span onClick={this.orderList.bind(this,'shas')} className="cursor-pointer">
                                                        {this.textValues.shasTitle}&nbsp;
                                                        <i className={this.props.partyListOrderColumn === 'shas' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.partyListRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showPartyListModalDialog} buttonOk={this.deletePartyListConfirm.bind(this)} 
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
        partyLists: state.system.lists.partyLists,
        isPartyListInEditMode: state.system.listsScreen.voterTab.isPartyListInEditMode,
        partyListSearchValue: state.system.listsScreen.voterTab.partyListSearchValue,
        isPartyListsOrderedAsc: state.system.listsScreen.voterTab.isPartyListsOrderedAsc,
        showPartyListModalDialog: state.system.listsScreen.voterTab.showPartyListModalDialog,
        partyListKeyInSelectMode: state.system.listsScreen.voterTab.partyListKeyInSelectMode,
        partyListInEditMode: state.system.listsScreen.voterTab.partyListInEditMode,
        isPartyListInAddMode: state.system.listsScreen.voterTab.isPartyListInAddMode,
        partyListOrderColumn: state.system.listsScreen.voterTab.partyListOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser,
        scrollbarWidth: state.system.scrollbarWidth,
    };
}
export default connect(mapStateToProps)(withRouter(PartyList));