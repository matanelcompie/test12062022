import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import CityDepartmentRow from './CityDepartmentRow';
import * as SystemActions from 'actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class CityDepartment extends React.Component {
    componentDidUpdate(){
        //after editing scroll back to the item position
        if (undefined!= this.self&& null !=this.self && this.props.currentTableScrollerPosition>0) {
            this.self.scrollTop=this.props.currentTableScrollerPosition;
        }
    }

    textIgniter() {
        this.textValues={
            listTitle: 'תיקים בעיר',
            addButtonTitle: 'הוספת תיק',
            searchTitle: 'חיפוש',
            nameTitle : 'תיק',
            modalWindowTitle:'מחיקת תיק',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התיק הזה?'
        };
    }

    updateCityDepartmentSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CITY_DEPARTMENT_SEARCH_VALUE, value});
    }

    addNewCityDepartment() {
        SystemActions.addCityDepartment(this.props.dispatch, this.props.cityDepartmentSearchValue);
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_CITY_DEPARTMENT,orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteCityDepartment(this.props.dispatch,this.props.cityDepartmentKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_DEPARTMENT_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.cityDepartmentRows=this.props.cityDepartment
                .map(function(item){
                    if(item.name.indexOf(this.props.cityDepartmentSearchValue)!=-1){
                        let isInEditMode =(this.props.isCityDepartmentInEditMode && item.key === this.props.cityDepartmentKeyInSelectMode)?true:false;
                            return <CityDepartmentRow key={item.key} item={item} isInEditMode={isInEditMode} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isCityDepartmentOrderedAsc? 'asc':'desc';
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

    isNameExistInTheList(name){
        var result=_.find(this.props.cityDepartment, ['name', name]);
        return(undefined==result)?false:true;
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.city_departments']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'cityDepartment')} aria-expanded={this.props.containerCollapseStatus.cityDepartment}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.cityDepartment}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="cityDepartmentSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="cityDepartmentSearch"
                                            value={this.props.cityDepartmentSearchValue} onChange={this.updateCityDepartmentSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm"+ ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.city_departments.add']) ? '' : ' hidden')} 
                                            disabled={(((this.props.cityDepartmentSearchValue.length >= 2)&& (false==this.isNameExistInTheList(this.props.cityDepartmentSearchValue)))? "" : "disabled")} 
                                            onClick={this.addNewCityDepartment.bind(this)}>
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-7">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.cityDepartmentOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.cityDepartmentRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showCityDepartmentModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        cityDepartment: state.system.lists.cityDepartment,
        isCityDepartmentInEditMode: state.system.listsScreen.generalTab.isCityDepartmentInEditMode,
        cityDepartmentSearchValue: state.system.listsScreen.generalTab.cityDepartmentSearchValue,
        showCityDepartmentModalDialog: state.system.listsScreen.generalTab.showCityDepartmentModalDialog,
        cityDepartmentKeyInSelectMode: state.system.listsScreen.generalTab.cityDepartmentKeyInSelectMode,
        isCityDepartmentOrderedAsc: state.system.listsScreen.generalTab.isCityDepartmentOrderedAsc,
        cityDepartmentOrderColumn: state.system.listsScreen.generalTab.cityDepartmentOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser
    };
}
export default connect(mapStateToProps)(withRouter(CityDepartment));