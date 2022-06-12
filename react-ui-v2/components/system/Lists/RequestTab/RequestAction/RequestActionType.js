import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestActionTypeRow from './RequestActionTypeRow';
import RequestActionTopics from './RequestActionTopic';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
        import ModalWindow from '../../../../global/ModalWindow';

class RequestActionType extends React.Component {

    textIgniter() {
        this.textValues = {
            listTitle: 'סוגי פעולות',
            subListTitle: 'נושא פעולות',
            addButtonTitle: 'הוספת סוג פעולה',
            searchTitle: 'חיפוש',
            nameTitle: 'סוגי פעולות',
            modalWindowTitle: 'מחיקת סוג פעולה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את סוג הפעולה הזה?'
        };
    }

    updateRequestActionTypeSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_ACTION_TYPE_SEARCH_VALUE, value});
    }

    addNewRequestActionType() {
        SystemActions.addRequestActionType(store, this.props.requestActionTypeSearchValue);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_ACTION_TYPE});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteRequestActionType(store, this.props.requestActionTypeKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TYPE_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.requestActionTypeRows = this.props.requestActionTypes
                .map(function (item) {
                    if (item.name.indexOf(this.props.requestActionTypeSearchValue) != -1) {
                        return <RequestActionTypeRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isRequestActionTypeOrderedAsc ? 'asc' : 'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_types']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-6">
                            <a onClick={this.updateCollapseStatus.bind(this,'requestActionType')} aria-expanded={this.props.containerCollapseStatus.requestActionType}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-6 collapseTitle"+(true == this.props.containerCollapseStatus.requestActionType && true == this.props.isRequestActionTypeTopicsDisplayed && false == this.props.isRequestActionTypeInEditMode?"":" hidden")}>
                            {this.textValues.subListTitle + ' - ' + this.props.requestActionTypeNameInSelectMode}
                        </div>
                    </div>                    
                    <Collapse isOpened={this.props.containerCollapseStatus.requestActionType}>
                        <div className='row CollapseContent'>
                            <div className='col-md-6'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="requestActionTypeSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestActionTypeSearch"
                                                        value={this.props.requestActionTypeSearchValue} onChange={this.updateRequestActionTypeSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_types.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.requestActionTypeSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewRequestActionType.bind(this)}>
                                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                            <span>{this.textValues.addButtonTitle}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
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
                                                {this.requestActionTypeRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showRequestActionTypeModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className={'col-md-6' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics']) ? '' : ' hidden')}>
                                <RequestActionTopics />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        requestActionTypes: state.system.lists.requestActionTypes,
        requestActionTypeSearchValue: state.system.listsScreen.requestTab.requestActionTypeSearchValue,
        showRequestActionTypeModalDialog: state.system.listsScreen.requestTab.showRequestActionTypeModalDialog,
        requestActionTypeKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTypeKeyInSelectMode,
        requestActionTypeNameInSelectMode: state.system.listsScreen.requestTab.requestActionTypeNameInSelectMode,
        isRequestActionTypeOrderedAsc: state.system.listsScreen.requestTab.isRequestActionTypeOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isRequestActionTypeTopicsDisplayed: state.system.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed,
        isRequestActionTypeInEditMode: state.system.listsScreen.requestTab.isRequestActionTypeInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(RequestActionType));