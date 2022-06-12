import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import InstituteRow from './InstituteRow';
import NewInstitute from './NewInstitute';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class Institute extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            listTitle: 'מוסדות',
            addButtonTitle: 'הוספת מוסד',
            searchTitle: 'חיפוש',
            nameTitle: 'שם מוסד',
            groupTitle: 'קבוצה',
            typeTitle: 'סוג',
            networkTitle: 'רשת',
            cityTitle: 'עיר',
            modalWindowTitle: 'מחיקת מוסד',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את המוסד הזה?'
        };
    }

    updateInstituteSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_SEARCH_VALUE, value});
    }

    addNewInstitute() {
        const event='add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ADD_MODE_UPDATED, event});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target:'institute'});
    }

    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE,orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteInstitute(this.props.dispatch, this.props.instituteInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.instituteRows = this.props.institutes
                .map(function (item) {
                    if (item.name.indexOf(this.props.instituteSearchValue) != -1) {
                        return <InstituteRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isInstituteOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    //ref of element for height calculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        this.renderRows();
        this.setOrderDirection();
        
        const container='institute';
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
        return this.props.tableHasScrollbar.institute? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    render() {
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-12">
                            <a onClick={this.updateCollapseStatus.bind(this,'institute')} aria-expanded={this.props.containerCollapseStatus.institute}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                    </div>     
                    <Collapse isOpened={this.props.containerCollapseStatus.institute}>
                        <div className='row CollapseContent'>
                            <div className='col-md-12'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="instituteSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-md-3">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="instituteSearch"
                                                        value={this.props.instituteSearchValue} onChange={this.updateInstituteSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.instituteSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewInstitute.bind(this)}>
                                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                            <span>{this.textValues.addButtonTitle}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                        <NewInstitute />
                                        <table className="table table-bordered table-striped table-hover lists-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                            {this.textValues.nameTitle}&nbsp;
                                                            <i className={this.props.instituteOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'group')} className="cursor-pointer">
                                                            {this.textValues.groupTitle}&nbsp;
                                                            <i className={this.props.instituteOrderColumn==='group'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'type')} className="cursor-pointer">
                                                            {this.textValues.typeTitle}&nbsp;
                                                            <i className={this.props.instituteOrderColumn==='type'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this,'network')} className="cursor-pointer">
                                                            {this.textValues.networkTitle}&nbsp;
                                                            <i className={this.props.instituteOrderColumn==='network'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th style={{borderLeft:'none'}}>
                                                        <span onClick={this.orderList.bind(this,'city')} className="cursor-pointer">
                                                            {this.textValues.cityTitle}&nbsp;
                                                            <i className={this.props.instituteOrderColumn==='city'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                    <th style={this.getScrollHeaderStyle()}></th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.instituteRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showInstituteModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
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
        institutes: state.system.lists.institutes,
        instituteSearchValue: state.system.listsScreen.voterTab.instituteSearchValue,
        showInstituteModalDialog: state.system.listsScreen.voterTab.showInstituteModalDialog,
        instituteInSelectMode: state.system.listsScreen.voterTab.instituteInSelectMode,
        instituteNameInSelectMode: state.system.listsScreen.voterTab.instituteNameInSelectMode,
        isInstituteOrderedAsc: state.system.listsScreen.voterTab.isInstituteOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        instituteOrderColumn: state.system.listsScreen.voterTab.instituteOrderColumn,
        isInstituteInEditMode: state.system.listsScreen.voterTab.isInstituteInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentUser: state.system.currentUser,
        scrollbarWidth: state.system.scrollbarWidth,
    };
}
export default connect(mapStateToProps)(withRouter(Institute));