import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import EthnicRow from './EthnicRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class Ethnic extends React.Component {
    textIgniter() {
        this.textValues={
            listTitle: 'עדות',
            addButtonTitle: 'הוספת עדה',
            searchTitle: 'חיפוש',
            nameTitle : 'עדה',
            sephardiTitle : 'ספרדי?',
            modalWindowTitle:'מחיקת קבוצה',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הקבוצה זו?'
        };
    }

    updateEthnicSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_ETHNIC_SEARCH_VALUE, value});
    }

    addNewEthnic() {
        SystemActions.addEthnic(store, this.props.ethnicSearchValue);
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_ETHNIC, orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteEthnic(store,this.props.ethnicKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_ETHNIC_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.ethnicRows=this.props.ethnic
                .map(function(item){
                    if(item.name.indexOf(this.props.ethnicSearchValue)!=-1){
                        return <EthnicRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isEthnicOrderedAsc? 'asc':'desc';
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

    componentDidUpdate() {
        const container='ethnic';
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
        return this.props.tableHasScrollbar.ethnic? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.ethnic_groups']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'ethnic')} aria-expanded={this.props.containerCollapseStatus.ethnic}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.ethnic}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="ethnicSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="ethnicSearch"
                                            value={this.props.ethnicSearchValue} onChange={this.updateEthnicSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.ethnic_groups.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.ethnicSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewEthnic.bind(this)}>
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
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.ethnicOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={{borderLeft:'none'}}>
                                                    <span onClick={this.orderList.bind(this,'sephardi')} className="cursor-pointer">
                                                        {this.textValues.sephardiTitle}&nbsp;
                                                        <i className={this.props.ethnicOrderColumn==='sephardi'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.ethnicRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showEthnicModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        ethnic: state.system.lists.ethnic,
        ethnicSearchValue: state.system.listsScreen.voterTab.ethnicSearchValue,
        showEthnicModalDialog: state.system.listsScreen.voterTab.showEthnicModalDialog,
        ethnicKeyInSelectMode: state.system.listsScreen.voterTab.ethnicKeyInSelectMode,
        isEthnicOrderedAsc: state.system.listsScreen.voterTab.isEthnicOrderedAsc,
        ethnicOrderColumn: state.system.listsScreen.voterTab.ethnicOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isEthnicInEditMode: state.system.listsScreen.voterTab.isEthnicInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
        scrollbarWidth : state.system.scrollbarWidth,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
    };
}
export default connect(mapStateToProps)(withRouter(Ethnic));