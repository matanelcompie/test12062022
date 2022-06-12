import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import SubAreaRow from './SubAreaRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
import ModalWindow from '../../../../global/ModalWindow';

class SubArea extends React.Component {

    textIgniter() {
        this.textValues={
            addButtonTitle: 'הוספת תת אזור',
            searchTitle: 'חיפוש',
            nameTitle : 'תת אזור',
            modalWindowTitle:'מחיקת תת אזור',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את תת האזור הזה?'
        };
    }

    updateSubAreaSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_SUBAREA_SEARCH_VALUE, value});
    }

    addNewSubArea() {
        const item=this.props.subAreaInEditMode;
        const key=this.props.areaKeyInSelectMode;
        SystemActions.addSubArea(store, item, key);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_SUBAREAS});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteSubArea(store,this.props.subAreaKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUBAREA_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.subAreaRows=this.props.subAreas
                .map(function(item){
                    if(item.name.indexOf(this.props.subAreaSearchValue)!=-1){
                        return <SubAreaRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isSubAreaOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
    }
    
    displayActionTypeTopicsStatus(){
        return ((this.props.isSubAreasDisplayed==true && this.props.isAreaInEditMode!=true)?'':'hidden');
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
                <div className={this.displayActionTypeTopicsStatus() + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.sub_areas']) ? '' : ' hidden')}>
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle">{this.textValues.listTitle}</div>
                    </div>
                    <div>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="subAreaSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-5">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="subAreaSearch"
                                        value={this.props.subAreaSearchValue} onChange={this.updateSubAreaSearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-4">
                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.sub_areas.add']) ? '' : ' hidden')} 
                                    disabled={(this.props.subAreaSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewSubArea.bind(this)}>
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
                                                <span onClick={this.orderList.bind(this)} className="cursor-pointer">
                                                    {this.textValues.nameTitle}&nbsp;
                                                    <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.subAreaRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showSubAreaModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        subAreas: state.system.lists.subAreas,
        subAreaSearchValue: state.system.listsScreen.generalTab.subAreaSearchValue,
        showSubAreaModalDialog: state.system.listsScreen.generalTab.showSubAreaModalDialog,
        subAreaKeyInSelectMode: state.system.listsScreen.generalTab.subAreaKeyInSelectMode,
        isSubAreaOrderedAsc: state.system.listsScreen.generalTab.isSubAreaOrderedAsc,
        subAreaOrderColumn: state.system.listsScreen.generalTab.subAreaOrderColumn,
        isSubAreasDisplayed: state.system.listsScreen.generalTab.isSubAreasDisplayed,
        subAreaInEditMode: state.system.listsScreen.generalTab.subAreaInEditMode,
        areaKeyInSelectMode: state.system.listsScreen.generalTab.areaKeyInSelectMode,
        isAreaInEditMode: state.system.listsScreen.generalTab.isAreaInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(SubArea));