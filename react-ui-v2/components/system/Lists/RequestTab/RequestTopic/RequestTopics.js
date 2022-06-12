import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestTopicsRow from './RequestTopicsRow';
import RequestSubTopics from './RequestSubTopics';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import ModalWindow from '../../../../global/ModalWindow';

class RequestTopics extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            listTitle: 'נושא פניה',
            subListTitle: 'תת נושא',
            addButtonTitle: 'הוספת נושא',
            nameTitle: 'נושא',
            searchTitle: 'חיפוש',
            activeTitle: 'פעיל',
            teamTitle: 'צוות',
            topicOrderTitle: 'סדר הצגה',
            modalWindowTitle: 'מחיקת נושא',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הנושא הזה?'
        };
    }

    updateRequestTopicSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_TOPIC_SEARCH_VALUE, value});
    }

    addNewRequestTopic() {
        SystemActions.addRequestTopic(store, this.props.requestTopicInEditedMode);
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_TOPICS, orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteRequestTopic(store, this.props.requestTopicKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_TOPIC_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.requestTopicRows = this.props.requestTopics.map(function (item) {
            if (item.name.indexOf(this.props.requestTopicSearchValue) > -1) {
                return <RequestTopicsRow key={item.key} item={item} move={this.move.bind(this)} 
                                teams={this.props.teams} requestModuleUsers={this.props.requestModuleUsers}
                                revertToOriginal={this.revertToOriginal.bind(this)} drop={this.drop.bind(this)} 
                                updateScrollPosition={this.updateScrollPosition.bind(this)} 
                                onSaveTopicData={this.onSaveTopicData.bind(this)} 
                                />
            }
        }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isRequestTopicOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    onSaveTopicData(){
        SystemActions.updateRequestTopic(store, this.props.requestTopicKeyInSelectMode, this.props.requestTopicInEditedMode);
    }
    sortTopicsDnD(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS_MODE});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_TOPICS, orderColumn:'topic_order'});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requestTopicDnDSort'});
    }

    //move items in hover - only if needed
    move(fromItem, toItem, before) {
        if (fromItem.key != toItem.key) {
            var i = 0;

            for (; i < this.props.requestTopics.length; i++) {
                if (this.props.requestTopics[i].key == fromItem.key)
                    break;
            }
            if (before) {
                if ((this.props.requestTopics.length == i + 1) || ((this.props.requestTopics.length > i + 1) && (this.props.requestTopics[i + 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS, fromItem: fromItem, toItem: toItem, before: before});
                }
            } else {
                if ((i == 0) || ((i > 0) && (this.props.requestTopics[i - 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS, fromItem: fromItem, toItem: toItem, before: before});
                }
            }
        }
    }

    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS_DROP});
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_TOPICS_REVERT_TO_ORIGINAL});
    }
    
    cancelDnDSort(){
        SystemActions.loadRequestTopics(store.dispatch);
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestTopicDnDSort'});
    }
    
    saveDndSort(){
        var itemsOrder=[];
        for(var i=0;i<this.props.requestTopics.length;i++){
            var key=this.props.requestTopics[i].key;
            var order=this.props.requestTopics[i].topic_order;
            itemsOrder.push({key,order});
        }
        SystemActions.updateTopicOrder(store,itemsOrder);
    }
    
    renderTableHeader(){
        if(this.props.isTopicsInDnDSort==true){
            this.tableHeader=
                        <tr>
                            <th>{this.textValues.nameTitle}</th>
                            <th>{this.textValues.activeTitle}</th>
                            <th>{this.textValues.teamTitle}</th>
                            <th>
                                {this.textValues.topicOrderTitle}
                                <span className="pull-left">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveDndSort.bind(this)}>
                                        <i className="fa fa-floppy-o"></i>
                                    </button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelDnDSort.bind(this)}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                </span>
                            </th>
                            <th style={this.getScrollHeaderStyle()}></th>
                        </tr>
        }else{
           this.tableHeader=
                        <tr>
                            <th>
                                <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                    {this.textValues.nameTitle}&nbsp;
                                    <i className={this.props.requestTopicOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                </span>
                            </th>
                            <th>
                                <span onClick={this.orderList.bind(this,'active')} className="cursor-pointer">
                                    {this.textValues.activeTitle}&nbsp;
                                    <i className={this.props.requestTopicOrderColumn==='active'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                </span>
                            </th>
                            <th>
                                <span onClick={this.orderList.bind(this,'team_handler_name')} className="cursor-pointer">
                                    {this.textValues.teamTitle}&nbsp;
                                    <i className={this.props.requestTopicOrderColumn==='team_handler_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                </span>
                            </th>
                            <th style={{borderLeft:(this.props.tableHasScrollbar.requestTopic?'0':'')}}>
                                {this.textValues.topicOrderTitle}
                                <span className={"pull-left" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics.edit']) ? '' : ' hidden')}>
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.sortTopicsDnD.bind(this)}>
                                        <i className="fa fa-sort-numeric-asc"></i>
                                    </button>
                                </span>
                            </th>
                            <th style={this.getScrollHeaderStyle()}></th>
                        </tr>
        }
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='requestTopic';
        let hasScrollbar=false;
        
        if (undefined!= this.self&& null !=this.self) {
            hasScrollbar=this.self.scrollHeight > this.self.clientHeight ?true:false;
        }
        
        if(hasScrollbar!=this.props.tableHasScrollbar[container]){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED, container, hasScrollbar});
        }
		 
    }
    
    getScrollHeaderStyle(){
        return this.props.tableHasScrollbar.requestTopic? {width: '17px', borderRight: '0'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
     
    
    render() {
        this.renderTableHeader();
        this.renderRows();
        this.setOrderDirection();
 
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-5">
                            <a onClick={this.updateCollapseStatus.bind(this,'requestTopic')} aria-expanded={this.props.containerCollapseStatus.requestTopic}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-7 collapseTitle"+(true == this.props.containerCollapseStatus.requestTopic && true ==this.props.isSubTopicsDisplayed?"":" hidden")}>
                            {this.textValues.subListTitle + ' - ' + this.props.requestTopicNameInSelectMode}
                        </div>
                    </div>
                    <Collapse isOpened={this.props.containerCollapseStatus.requestTopic}>
                        <div className='row CollapseContent'>
                            <div className='col-md-5'>
                                <div className="row">
                                    {/* <div className="col-md-1"></div> */}
                                    <div className="col-md-12">
                                        <form className="form-horizontal">
                                            <div className="row">
                                                <div className="form-group">
                                                    <label htmlFor="requestTopicSearch" className="col-md-2 control-label">{this.textValues.searchTitle}</label>
                                                    <div className="col-md-5">
                                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestTopicSearch"
                                                            value={this.props.requestTopicSearchValue} onChange={this.updateRequestTopicSearchValue.bind(this)}/>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <button type="button" disabled={(this.props.requestTopicSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewRequestTopic.bind(this)}
                                                            className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics.add']) ? '' : ' hidden')} >
                                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                                <span>{this.textValues.addButtonTitle}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                        <table className="table table-bordered table-striped table-hover lists-table">
                                            <thead>
                                                {this.tableHeader}
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)} style={{overflowX:'hidden'}}>
                                                {this.requestTopicRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showRequestTopicModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                                buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                                <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-7'>
                                <RequestSubTopics />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        requestTopics: state.system.lists.topics,
        requestTopicSearchValue: state.system.listsScreen.requestTab.requestTopicSearchValue,
        showRequestTopicModalDialog: state.system.listsScreen.requestTab.showRequestTopicModalDialog,
        requestTopicKeyInSelectMode: state.system.listsScreen.requestTab.requestTopicKeyInSelectMode,
        requestTopicNameInSelectMode: state.system.listsScreen.requestTab.requestTopicNameInSelectMode,
        isRequestTopicOrderedAsc: state.system.listsScreen.requestTab.isRequestTopicOrderedAsc,
        requestTopicOrderColumn: state.system.listsScreen.requestTab.requestTopicOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        requestTopicInEditedMode: state.system.listsScreen.requestTab.requestTopicInEditedMode,
        isTopicsInDnDSort: state.system.listsScreen.requestTab.isTopicsInDnDSort,
        isRequestTopicInEditMode: state.system.listsScreen.requestTab.isRequestTopicInEditMode,
        isSubTopicsDisplayed: state.system.listsScreen.requestTab.isSubTopicsDisplayed,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        requestModuleUsers: state.system.requestModuleUsers,
        teams: state.system.teams,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(RequestTopics));