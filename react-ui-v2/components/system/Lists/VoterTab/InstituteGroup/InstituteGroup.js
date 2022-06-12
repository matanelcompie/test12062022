import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import InstituteGroupRow from './InstituteGroupRow';
import InstituteType from './InstituteType';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import ModalWindow from '../../../../global/ModalWindow';

class InstituteGroup extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            listTitle: 'קבוצת מוסד',
            subListTitle: 'סוג מוסד',
            addButtonTitle: 'הוספת קבוצה',
            searchTitle: 'חיפוש',
            groupName: 'שם קבוצה',
            modalWindowTitle: 'מחיקת קבוצה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הקבוצה הזו?'
        };
    }

    updateInstituteGroupSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_GROUP_SEARCH_VALUE, value});
    }

    addNewInstituteGroup() {
        SystemActions.addInstituteGroup(store, this.props.instituteGroupSearchValue);
    }

    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_GROUP,orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteInstituteGroup(store, this.props.instituteGroupInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_GROUP_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.instituteGroupRows = this.props.instituteGroups
                .map(function (item) {
                    if (item.name.indexOf(this.props.instituteGroupSearchValue) != -1) {
                        return <InstituteGroupRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isInstituteGroupOrderedAsc ? 'asc' : 'desc';
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
        this.renderRows();
        this.setOrderDirection();
        
        const container='instituteGroup';
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
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    render() {
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-6">
                            <a onClick={this.updateCollapseStatus.bind(this,'instituteGroup')} aria-expanded={this.props.containerCollapseStatus.instituteGroup}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-6 collapseTitle"+(true == this.props.containerCollapseStatus.instituteGroup && true == this.props.isInstituteGroupValuesDisplayed && false == this.props.isInstituteGroupInEditMode?"":" hidden")}>
                            {this.textValues.subListTitle + ' - ' +this.props.instituteGroupNameInSelectMode}
                        </div>
                    </div>     
                    <Collapse isOpened={this.props.containerCollapseStatus.instituteGroup}>
                        <div className='row CollapseContent'>
                            <div className='col-md-6'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="instituteGroupSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="instituteGroupSearch"
                                                        value={this.props.instituteGroupSearchValue} onChange={this.updateInstituteGroupSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.instituteGroupSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewInstituteGroup.bind(this)}>
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
                                                        <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                            {this.textValues.groupName}&nbsp;
                                                            <i className={this.props.instituteGroupOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.instituteGroupRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showInstituteGroupModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className={'col-md-6' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.groups']) ? '' : ' hidden')}>
                                <InstituteType />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        instituteGroups: state.system.lists.instituteGroups,
        instituteGroupSearchValue: state.system.listsScreen.voterTab.instituteGroupSearchValue,
        showInstituteGroupModalDialog: state.system.listsScreen.voterTab.showInstituteGroupModalDialog,
        instituteGroupInSelectMode: state.system.listsScreen.voterTab.instituteGroupInSelectMode,
        instituteGroupNameInSelectMode: state.system.listsScreen.voterTab.instituteGroupNameInSelectMode,
        isInstituteGroupOrderedAsc: state.system.listsScreen.voterTab.isInstituteGroupOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        instituteGroupOrderColumn: state.system.listsScreen.voterTab.instituteGroupOrderColumn,
        isInstituteGroupInEditMode: state.system.listsScreen.voterTab.isInstituteGroupInEditMode,
        isInstituteGroupValuesDisplayed: state.system.listsScreen.voterTab.isInstituteGroupValuesDisplayed,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteGroup));