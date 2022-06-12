import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterMetaKeyRow from './VoterMetaKeyRow';
import VoterMetaValue from './VoterMetaValue';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import ModalWindow from '../../../../global/ModalWindow';

class VoterMetaKey extends React.Component {

    textIgniter() {
        this.textValues = {
            listTitle: 'נתונים נוספים',
            subListTitle: 'ערכים',
            addButtonTitle: 'הוספת שדה נתונים',
            searchTitle: 'חיפוש',
            metaName: 'שם שדה',
            metaType: 'סוג שדה',
            perCampaign: 'מערכת בחירות',
            max: 'ערך מקסימלי / מספר תווים',
            modalWindowTitle: 'מחיקת שדה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את השדה הזה?'
        };
    }

    updateVoterMetaKeySearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_META_KEY_SEARCH_VALUE, value});
    }

    addNewVoterMetaKey() {
        SystemActions.addVoterMetaKey(store, this.props.voterMetaKeySearchValue);
    }

    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_META_KEY,orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteVoterMetaKey(store, this.props.voterMetaKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_KEY_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.voterMetaKeyRows = this.props.voterMetaKeys
                .map(function (item) {
                    if (item.key_name.indexOf(this.props.voterMetaKeySearchValue) != -1) {
                        return <VoterMetaKeyRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isVoterMetaKeyOrderedAsc ? 'asc' : 'desc';
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
        const container='voterMetaKey';
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
        return this.props.tableHasScrollbar.voterMetaKey? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-9">
                            <a onClick={this.updateCollapseStatus.bind(this,'voterMetaKey')} aria-expanded={this.props.containerCollapseStatus.voterMetaKey}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-3 collapseTitle"+(true == this.props.containerCollapseStatus.voterMetaKey && true == this.props.isVoterMetaKeyValuesDisplayed && false == this.props.isVoterMetaKeyInEditMode?"":" hidden")}>
                            {this.textValues.subListTitle + ' - ' + this.props.voterMetaKeyNameInSelectMode}
                        </div>
                    </div>     
                    <Collapse isOpened={this.props.containerCollapseStatus.voterMetaKey}>
                        <div className='row CollapseContent'>
                            <div className='col-md-9'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="voterMetaKeySearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="voterMetaKeySearch"
                                                        value={this.props.voterMetaKeySearchValue} onChange={this.updateVoterMetaKeySearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.voterMetaKeySearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewVoterMetaKey.bind(this)}>
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
                                                        <span onClick={this.orderList.bind(this,'key_name')} className="cursor-pointer">
                                                            {this.textValues.metaName}&nbsp;
                                                            <i className={this.props.voterMetaKeyOrderColumn==='key_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'key_type')} className="cursor-pointer">
                                                            {this.textValues.metaType}&nbsp;
                                                            <i className={this.props.voterMetaKeyOrderColumn==='key_type'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'max')} className="cursor-pointer">
                                                            {this.textValues.max}&nbsp;
                                                            <i className={this.props.voterMetaKeyOrderColumn==='max'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th style={{borderLeft:'none'}}>
                                                        <span onClick={this.orderList.bind(this,'per_campaign')} className="cursor-pointer">
                                                            {this.textValues.perCampaign}&nbsp;
                                                            <i className={this.props.voterMetaKeyOrderColumn==='per_campaign'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th style={this.getScrollHeaderStyle()}></th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.voterMetaKeyRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showVoterMetaKeyModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className={'col-md-3' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas']) ? '' : ' hidden')}>
                                <VoterMetaValue />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        voterMetaKeys: state.system.lists.voterMetaKeys,
        voterMetaKeySearchValue: state.system.listsScreen.voterTab.voterMetaKeySearchValue,
        showVoterMetaKeyModalDialog: state.system.listsScreen.voterTab.showVoterMetaKeyModalDialog,
        voterMetaKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyInSelectMode,
        voterMetaKeyNameInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyNameInSelectMode,
        isVoterMetaKeyOrderedAsc: state.system.listsScreen.voterTab.isVoterMetaKeyOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        voterMetaKeyOrderColumn: state.system.listsScreen.voterTab.voterMetaKeyOrderColumn,
        isVoterMetaKeyInEditMode: state.system.listsScreen.voterTab.isVoterMetaKeyInEditMode,
        isVoterMetaKeyValuesDisplayed: state.system.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        scrollbarWidth : state.system.scrollbarWidth,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(VoterMetaKey));