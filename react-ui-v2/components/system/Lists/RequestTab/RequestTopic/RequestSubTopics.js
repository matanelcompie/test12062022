import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestTopicsRow from './RequestTopicsRow';
import UpdateMultiSubTopicsModal from './UpdateMultiSubTopicsModal';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';

class RequestSubTopics extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
        this.state = {
            displayUpdateMultiSubTopicModal : false
        }
    }

    textIgniter() {
        this.textValues = {
            addButtonTitle: 'הוספת נושא',
            nameTitle: 'נושא',
            searchTitle: 'חיפוש',
            activeTitle: 'פעיל',
            topicOrderTitle: 'סדר הצגה',
            modalWindowTitle: 'מחיקת נושא',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הנושא הזה?',
            targetCloseDays:'ימים לסגירה',
            defaultRequestStatus:'סטטוס פניה',
            active: 'פעיל',
            user_handler: 'משתמש מטפל',
            notActive: 'לא פעיל',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    updateRequestSubTopicSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_SUB_TOPIC_SEARCH_VALUE, value});
    }

    addNewRequestTopic() {
        const event = 'add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.SUB_TOPIC_ADD_MODE_UPDATED, event});
    }
    
    cancelEditMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.SUB_TOPIC_ADD_MODE_UPDATED, event});
    }
    
    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key, value});
    }
    
    comboChange(columnName, el) {
        if (el.target.selectedItem) {
            //store the name
            var value = el.target.selectedItem.name;
            var key = columnName + '_name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key, value});

            //store the key
            value = el.target.selectedItem.id;
            key = columnName + '_id';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED, key, value});
        }
    }

    saveEdit() {
        SystemActions.addRequestTopic(store, this.props.requestTopicInEditedMode, this.props.subTopicsParentKey);
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_SUB_TOPICS, orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteRequestTopic(store, this.props.requestTopicKeyInSelectMode, this.props.subTopicsParentKey);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_TOPIC_MODAL_DIALOG_DISPLAY});
    }
    displayUpdateSubTopicsModal(bool){
        this.setState({displayUpdateMultiSubTopicModal : bool})
    }
    renderRows() {
        this.requestTopicRows = this.props.requestSubTopics
                .map( item => {
                    if (item.name.indexOf(this.props.requestSubTopicSearchValue) > -1) {
                        return <RequestTopicsRow key={item.key} item={item} move={this.move.bind(this)} 
                                            requestModuleUsers={this.props.requestModuleUsers}
                                            revertToOriginal={this.revertToOriginal.bind(this)} drop={this.drop.bind(this)} 
                                            updateScrollPosition={this.updateScrollPosition.bind(this)}
                                            onSaveTopicData={this.onSaveTopicData.bind(this)}
                                         />
                    }
                });
    }

    setOrderDirection() {
        this.orderDirection = this.props.isRequestSubTopicOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
    }

    sortTopicsDnD() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS_MODE});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_SUB_TOPICS, orderColumn: 'topic_order'});
    }

    //move items in hover - only if needed
    move(fromItem, toItem, before) {
        if (fromItem.key != toItem.key) {
            var i = 0;

            for (; i < this.props.requestSubTopics.length; i++) {
                if (this.props.requestSubTopics[i].key == fromItem.key)
                    break;
            }
            if (before) {
                if ((this.props.requestSubTopics.length == i + 1) || ((this.props.requestSubTopics.length > i + 1) && (this.props.requestSubTopics[i + 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS, fromItem: fromItem, toItem: toItem, before: before});
                }
            } else {
                if ((i == 0) || ((i > 0) && (this.props.requestSubTopics[i - 1].key != toItem.key))) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS, fromItem: fromItem, toItem: toItem, before: before});
                }
            }
        }
    }

    //set drop callback - maybe send data to server
    drop() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS_DROP});
    }

    //return items to original state if not dropped on another item
    revertToOriginal() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.DND_SUB_TOPICS_REVERT_TO_ORIGINAL});
    }
    cancelDnDSort() {
        SystemActions.loadRequestTopics(store.dispatch, this.props.subTopicsParentKey);
    }

    saveDndSort() {
        var itemsOrder = [];
        for (var i = 0; i < this.props.requestSubTopics.length; i++) {
            var key = this.props.requestSubTopics[i].key;
            var order = this.props.requestSubTopics[i].topic_order;
            itemsOrder.push({key, order});
        }
        SystemActions.updateTopicOrder(store,itemsOrder, this.props.subTopicsParentKey);
    }
    onSaveTopicData(isNewUserSelected, selectedSubTopicsKeys = []){
        const subTopicsParentKey = this.props.subTopicsParentKey;
        if(!isNewUserSelected){
            this.saveTopicData(subTopicsParentKey, selectedSubTopicsKeys);
        } else{
            this.displayUpdateSubTopicsModal(true);
        }
    }
    saveTopicData(subTopicsParentKey, selectedSubTopicsKeys){
        SystemActions.updateRequestTopic(store, this.props.requestTopicKeyInSelectMode, this.props.requestTopicInEditedMode, subTopicsParentKey, selectedSubTopicsKeys);
    }
    renderTableHeader() {
        if(this.props.isSubTopicsInDnDSort==true){
            this.tableHeader=
                    <tr>
                        <th>{this.textValues.nameTitle}</th>
                        <th>{this.textValues.activeTitle}</th>
                        <th>{this.textValues.user_handler}</th>
                        <th>{this.textValues.targetCloseDays}</th>
                        <th>{this.textValues.defaultRequestStatus}</th>
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
                                <i className={this.props.requestSubTopicOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                            </span>
                        </th>
                        <th>
                            <span onClick={this.orderList.bind(this,'active')} className="cursor-pointer">
                                {this.textValues.activeTitle}&nbsp;
                                <i className={this.props.requestSubTopicOrderColumn==='active'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                            </span>
                        </th>
                        <th>
                            <span onClick={this.orderList.bind(this,'user_handler_name')} className="cursor-pointer">
                                {this.textValues.user_handler}&nbsp;
                                <i className={this.props.requestSubTopicOrderColumn==='active'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                            </span>
                        </th>
                        <th>
                            <span onClick={this.orderList.bind(this,'target_close_days')} className="cursor-pointer">
                                {this.textValues.targetCloseDays}&nbsp;
                                <i className={this.props.requestTopicOrderColumn==='target_close_days'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                            </span>
                        </th>
                        <th>
                            <span onClick={this.orderList.bind(this,'default_request_status_id')} className="cursor-pointer">
                                {this.textValues.defaultRequestStatus}&nbsp;
                                <i className={this.props.requestTopicOrderColumn==='default_request_status_id'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                            </span>
                        </th>
                        <th style={{borderLeft:(this.props.tableHasScrollbar.requestSubTopic ? '0':'')}}>
                            {this.textValues.topicOrderTitle}
                            <span className="pull-left">
                                <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics.edit']) ? '' : ' hidden')} 
                                onClick={this.sortTopicsDnD.bind(this)}>
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
        const container='requestSubTopic';
        let hasScrollbar=false;
        
        if (undefined!= this.self&& null !=this.self) {
            hasScrollbar=this.self.scrollHeight > this.self.clientHeight ?true:false;
        }
        
        if(hasScrollbar!=this.props.tableHasScrollbar[container]){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED, container, hasScrollbar});
        }
    }
    
    getScrollHeaderStyle(){
        return this.props.tableHasScrollbar.requestSubTopic? {width: '17px', borderRight: '0'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
  
    updateMultiSubTopics(selectedSubTopicsKeys){
        this.displayUpdateSubTopicsModal(false)
        this.saveTopicData(this.props.subTopicsParentKey, selectedSubTopicsKeys);
    }
    render() {
        this.renderTableHeader();
        this.renderRows();
        this.setOrderDirection();
        return (
                <div className={(this.props.isSubTopicsDisplayed == true) ? '' : 'not-visible'}>
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label htmlFor="requestSubTopicSearch" className="col-md-2 control-label">{this.textValues.searchTitle}</label>
                            <div className="col-md-5">
                                <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestSubTopicSearch"
                                       value={this.props.requestSubTopicSearchValue} onChange={this.updateRequestSubTopicSearchValue.bind(this)}/>
                            </div>
                            <div className="col-md-5">
                                <button type="button" className="btn btn-primary btn-sm" disabled={(this.props.requestSubTopicSearchValue.length >= 2 ? "" : "disabled")}
                                        onClick={this.addNewRequestTopic.bind(this)}>
                                    <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                    <span>{this.textValues.addButtonTitle}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className={"well" + (this.props.isSubTopicInAddMode ? "" : " hidden")}>
                        <div className="row form-horizontal">
                            <div className="col-md-1"></div>
                            <div className="col-md-5">
                                <div className="row">
                                    <div className={"form-group" + (this.props.requestTopicInEditedMode.name.length >= 2 ? '' : ' has-error')}>
                                        <label htmlFor="topicName" className="control-label col-md-6">{this.textValues.nameTitle}</label>
                                        <input type="text" className="form-control col-md-6" value={this.props.requestTopicInEditedMode.name} id="topicName" 
                                        onChange={this.updateRowText.bind(this, 'name')}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group">
                                        <label htmlFor="targetCloseDays" className="control-label col-md-6">{this.textValues.targetCloseDays}</label>
                                        <input type="text" className="form-control col-md-6" id="targetCloseDays" onChange={this.updateRowText.bind(this, 'target_close_days')}
                                        value={(null==this.props.requestTopicInEditedMode.target_close_days?'':this.props.requestTopicInEditedMode.target_close_days)}/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-1"></div>
                            <div className="col-md-5">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="checkbox">
                                            <label>
                                                <input type="checkbox" value={this.props.requestTopicInEditedMode.active}
                                                       onChange={this.updateRowText.bind(this, 'active')}
                                                       checked={this.props.requestTopicInEditedMode.active == 1 ? 'checked' : ''}/>
                                                {this.textValues.active + '?'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <span className="edit-buttons">
                                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                                disabled={(this.props.requestTopicInEditedMode.name.length >= 2 ? "" : "disabled")} title={this.textValues.saveTitle}>
                                                <i className="fa fa-floppy-o"></i></button>
                                            &nbsp;
                                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                            title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                        </span>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group">
                                        <label htmlFor="defaultRequestStatus" className="control-label col-md-5">{this.textValues.defaultRequestStatus}</label>
                                        <div className="col-md-6">
                                            <Combo items={this.props.requestStatus} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name' 
                                            defaultValue={this.props.requestTopicInEditedMode.request_status_name} onChange={this.comboChange.bind(this, 'default_request_status')}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <table className="table table-bordered table-striped table-hover lists-table">
                                <thead>
                                    {this.tableHeader}
                                </thead>
                                <tbody ref={this.getRef.bind(this)}>
                                    {this.requestTopicRows}
                                </tbody>
                            </table>
                            <ModalWindow show={this.props.showRequestTopicModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)}
                                         buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                <div>{this.textValues.modalWindowBody}</div>
                            </ModalWindow>
                            <UpdateMultiSubTopicsModal 
                                show={this.state.displayUpdateMultiSubTopicModal} requestSubTopics={this.props.requestSubTopics} currentTopicKey={this.props.requestTopicKeyInSelectMode}
                                updateMultiSubTopics={this.updateMultiSubTopics.bind(this)} displayUpdateSubTopicsModal={this.displayUpdateSubTopicsModal.bind(this)}>
                            </UpdateMultiSubTopicsModal>
                        </div>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        requestSubTopics: state.system.lists.subTopics,
        requestStatus: state.system.lists.requestStatus,
        requestSubTopicSearchValue: state.system.listsScreen.requestTab.requestSubTopicSearchValue,
        showRequestTopicModalDialog: state.system.listsScreen.requestTab.showRequestTopicModalDialog,
        requestTopicKeyInSelectMode: state.system.listsScreen.requestTab.requestTopicKeyInSelectMode,
        isRequestSubTopicOrderedAsc: state.system.listsScreen.requestTab.isRequestSubTopicOrderedAsc,
        requestSubTopicOrderColumn: state.system.listsScreen.requestTab.requestSubTopicOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        requestTopicInEditedMode: state.system.listsScreen.requestTab.requestTopicInEditedMode,
        isSubTopicsDisplayed: state.system.listsScreen.requestTab.isSubTopicsDisplayed,
        subTopicsParentKey: state.system.listsScreen.requestTab.subTopicsParentKey,
        isSubTopicsInDnDSort: state.system.listsScreen.requestTab.isSubTopicsInDnDSort,
        isSubTopicInAddMode: state.system.listsScreen.requestTab.isSubTopicInAddMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        requestModuleUsers: state.system.requestModuleUsers,
        teams: state.system.teams,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(RequestSubTopics));