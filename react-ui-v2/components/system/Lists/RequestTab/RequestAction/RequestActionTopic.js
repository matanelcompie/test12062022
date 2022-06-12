import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestActionTopicRow from './RequestActionTopicRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
import ModalWindow from '../../../../global/ModalWindow';

class RequestActionTopic extends React.Component {

    textIgniter() {
        this.textValues={
            addButtonTitle: 'הוספת נושא פעולה',
            searchTitle: 'חיפוש',
            nameTitle : 'נושא פעולות',
            activeTitle : 'פעיל',
            modalWindowTitle:'מחיקת נושא פעולה',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את נושא הפעולה הזה?'
        };
        this.noBorderLeft={borderLeft:'none'};
    }

    updateRequestActionTopicSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_ACTION_TOPIC_SEARCH_VALUE, value});
    }

    addNewRequestActionTopic() {
        const item=this.props.requestActionTopicInEditMode;
        const key=this.props.requestActionTypeKeyInSelectMode;
        SystemActions.addRequestActionTopic(store, item, key);
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_ACTION_TOPIC,orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteRequestActionTopic(store,this.props.requestActionTopicKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TOPIC_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.requestActionTopicRows=this.props.requestActionTopics
                .map(function(item){
                    if(item.name.indexOf(this.props.requestActionTopicSearchValue)!=-1){
                        return <RequestActionTopicRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isRequestActionTopicOrderedAsc? 'asc':'desc';
    }
        
    displayActionTypeTopicsStatus(){
        return ((this.props.isRequestActionTypeTopicsDisplayed==true && this.props.isRequestActionTypeInEditMode!=true)?'':'hidden');
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='requestActionTopic';
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
        return this.props.tableHasScrollbar.requestActionTopic? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
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
                <div className={this.displayActionTypeTopicsStatus() + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics']) ? '' : ' hidden')}>
                    <div>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="requestActionTopicSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-5">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestActionTopicSearch"
                                        value={this.props.requestActionTopicSearchValue} onChange={this.updateRequestActionTopicSearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-4">
                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics.add']) ? '' : ' hidden')} 
                                        disabled={(this.props.requestActionTopicSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewRequestActionTopic.bind(this)}>
                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="row">
                            <div className="col-md-11">
                                <table className="table table-bordered table-striped table-hover lists-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                    {this.textValues.nameTitle}&nbsp;
                                                    <i className={this.props.requestActionTopicOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                            <th style={this.noBorderLeft}>
                                                <span onClick={this.orderList.bind(this,'active')} className="cursor-pointer">
                                                    {this.textValues.activeTitle}&nbsp;
                                                    <i className={this.props.requestActionTopicOrderColumn==='active'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                            <th style={this.getScrollHeaderStyle()}></th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.requestActionTopicRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showRequestActionTopicModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                    <div>{this.textValues.modalWindowBody}</div>
                                </ModalWindow>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        requestActionTopics: state.system.lists.requestActionTopics,
        requestActionTopicSearchValue: state.system.listsScreen.requestTab.requestActionTopicSearchValue,
        showRequestActionTopicModalDialog: state.system.listsScreen.requestTab.showRequestActionTopicModalDialog,
        requestActionTopicKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTopicKeyInSelectMode,
        isRequestActionTopicOrderedAsc: state.system.listsScreen.requestTab.isRequestActionTopicOrderedAsc,
        requestActionTopicOrderColumn: state.system.listsScreen.requestTab.requestActionTopicOrderColumn,
        isRequestActionTypeTopicsDisplayed: state.system.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed,
        requestActionTopicInEditMode: state.system.listsScreen.requestTab.requestActionTopicInEditMode,
        requestActionTypeKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTypeKeyInSelectMode,
        isRequestActionTypeInEditMode: state.system.listsScreen.requestTab.isRequestActionTypeInEditMode,
        isRequestActionTopicInEditMode: state.system.listsScreen.requestTab.isRequestActionTopicInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        scrollbarWidth : state.system.scrollbarWidth,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(RequestActionTopic));