import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import RequestSourceRow from './RequestSourceRow';
import * as SystemActions from '../../../../actions/SystemActions';
import ModalWindow from '../../../global/ModalWindow';

class RequestSource extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'מקור פניה',
            addButtonTitle: 'הוספת מקור',
            searchTitle: 'חיפוש',
            nameTitle : 'מקור',
            modalWindowTitle:'מחיקת מקור',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את המקור הזה?'
        };
    }

    updateRequestSourceSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_SOURCE_SEARCH_VALUE, value});
    }

    addNewRequestSource() {
        SystemActions.addRequestSource(this.props.dispatch, this.props.requestSourceSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_SOURCE});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteRequestSource(this.props.dispatch,this.props.requestSourceKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_SOURCE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.requestSourceRows=this.props.requestSource
                .map(function(item){
                    if(item.name.indexOf(this.props.requestSourceSearchValue)!=-1){
                        if(this.props.isRequestSourceInEditMode && item.key === this.props.requestSourceKeyInSelectMode){
                            /* EDIT MODE */
                            return <RequestSourceRow key={item.key} item={item} isInEditMode={true} isNameExistInTheList={this.isNameExistInTheList.bind(this)}/>
                        }else{
                            /* DISPLAY MODE */
                            return <RequestSourceRow key={item.key} item={item} isInEditMode={false} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                        }
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isRequestSourceOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    isNameExistInTheList(name){
        var result=_.find(this.props.requestSource, ['name', name]);
        return(undefined==result)?false:true;
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.request_source']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'requestSource')} aria-expanded={this.props.containerCollapseStatus.requestSource}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.requestSource}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="requestSourceSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="requestSourceSearch"
                                            value={this.props.requestSourceSearchValue} onChange={this.updateRequestSourceSearchValue.bind(this)}/>
                                    </div>
                                    {false && <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm"+ ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.request_source.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.requestSourceSearchValue.length >= 2) && (false==this.isNameExistInTheList(this.props.requestSourceSearchValue)) ? "" : "disabled")} 
                                            onClick={this.addNewRequestSource.bind(this)}>
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>}
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
                                            {this.requestSourceRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showRequestSourceModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        requestSource: state.system.lists.requestSource,
        isRequestSourceInEditMode: state.system.listsScreen.requestTab.isRequestSourceInEditMode,
        requestSourceSearchValue: state.system.listsScreen.requestTab.requestSourceSearchValue,
        showRequestSourceModalDialog: state.system.listsScreen.requestTab.showRequestSourceModalDialog,
        requestSourceKeyInSelectMode: state.system.listsScreen.requestTab.requestSourceKeyInSelectMode,
        isRequestSourceOrderedAsc: state.system.listsScreen.requestTab.isRequestSourceOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser
    };
}
export default connect(mapStateToProps)(withRouter(RequestSource));