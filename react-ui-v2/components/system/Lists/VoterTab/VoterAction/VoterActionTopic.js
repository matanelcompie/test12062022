import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import VoterActionTopicRow from './VoterActionTopicRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
import ModalWindow from '../../../../global/ModalWindow';

class VoterActionTopic extends React.Component {

    textIgniter() {
        this.textValues={
            addButtonTitle: 'הוספת נושא פעולה',
            searchTitle: 'חיפוש',
            nameTitle : 'נושא פעולות',
            activeTitle : 'פעיל',
            modalWindowTitle:'מחיקת נושא פעולה',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את נושא הפעולה הזה?'
        };
    }

    updateVoterActionTopicSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ACTION_TOPIC_SEARCH_VALUE, value});
    }

    addNewVoterActionTopic() {
        const item=this.props.voterActionTopicInEditMode;
        const key=this.props.voterActionTypeKeyInSelectMode;
        SystemActions.addVoterActionTopic(store, item, key);
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_ACTION_TOPIC,orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteVoterActionTopic(store,this.props.voterActionTopicKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TOPIC_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.voterActionTopicRows=this.props.voterActionTopics
                .map(function(item){
                    if(item.name.indexOf(this.props.voterActionTopicSearchValue)!=-1){
                        return <VoterActionTopicRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isVoterActionTopicOrderedAsc? 'asc':'desc';
    }
    
    displayActionTypeTopicsStatus(){
        return ((this.props.isVoterActionTypeTopicsDisplayed==true && this.props.isVoterActionTypeInEditMode!=true)?'':'hidden');
    }
    
    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='voterActionTopic';
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
        return this.props.tableHasScrollbar.voterActionTopic? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
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
                <div className={this.displayActionTypeTopicsStatus() + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_topics']) ? '' : ' hidden')}>
                    <div>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="voterActionTopicSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-5">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="voterActionTopicSearch"
                                        value={this.props.voterActionTopicSearchValue} onChange={this.updateVoterActionTopicSearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-4">
                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_topics.add']) ? '' : ' hidden')} 
                                    disabled={(this.props.voterActionTopicSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewVoterActionTopic.bind(this)}>
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
                                                    <i className={this.props.voterActionTopicOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                            <th>
                                                <span onClick={this.orderList.bind(this,'active')} className="cursor-pointer">
                                                    {this.textValues.activeTitle}&nbsp;
                                                    <i className={this.props.voterActionTopicOrderColumn==='active'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                            <th style={this.getScrollHeaderStyle()}></th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.voterActionTopicRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showVoterActionTopicModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        voterActionTopics: state.system.lists.voterActionTopics,
        voterActionTopicSearchValue: state.system.listsScreen.voterTab.voterActionTopicSearchValue,
        showVoterActionTopicModalDialog: state.system.listsScreen.voterTab.showVoterActionTopicModalDialog,
        voterActionTopicKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTopicKeyInSelectMode,
        isVoterActionTopicOrderedAsc: state.system.listsScreen.voterTab.isVoterActionTopicOrderedAsc,
        voterActionTopicOrderColumn: state.system.listsScreen.voterTab.voterActionTopicOrderColumn,
        isVoterActionTypeTopicsDisplayed: state.system.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed,
        voterActionTopicInEditMode: state.system.listsScreen.voterTab.voterActionTopicInEditMode,
        voterActionTypeKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTypeKeyInSelectMode,
        isVoterActionTypeInEditMode: state.system.listsScreen.voterTab.isVoterActionTypeInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
    };
}
export default connect(mapStateToProps)(withRouter(VoterActionTopic));