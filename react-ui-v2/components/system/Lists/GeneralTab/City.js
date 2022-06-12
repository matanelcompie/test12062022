import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import Collapse from 'react-collapse';

import CityRow from './CityRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';

class City extends React.Component {
    
    constructor(props) {
      super(props);
        this.textIgniter();
        this.noBorderLeft={borderLeft:'none'};
    }
    
    textIgniter() {
        this.textValues = {
            listTitle: 'ערים',
            addButtonTitle: 'הוספת עיר',
            searchTitle: 'חיפוש',
            nameTitle: 'עיר',
            areaTitle: 'אזור',
            subAreaTitle: 'תת אזור',
            miIdTitle: 'קוד עיר',
            modalWindowTitle: 'מחיקת עיר',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את העיר הזו?',
            miIdIsmissing: 'חסר קוד עיר',
            miIdIsAlreadyExist: 'קוד עיר קיים',
            cityNameNotValid: 'שם עיר קצר מדי או קיים',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_CITIES, orderColumn});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CURRENT_DISPLAYED_CITIES});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteCity(store, this.props.cityKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.cityRows = this.props.currentDisplayedCities
            .map(function (item) {
                return <CityRow key={item.city_key} item={item} />
            }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isCitiesOrderedAsc ? 'asc' : 'desc';
    }
    
    cityNameValidation(){
        const name=this.props.isCityInAddMode?this.props.cityInEditMode.cityName:this.props.citySearchValue;
        var isNameValid = name.trim().length>=2?true:false;

        if(isNameValid){
            var cities=this.props.cities;
            
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].city_name==name.trim()){
                    isNameValid = false;
                    break;
                }
            }
        }
        this.isCityNameValid=isNameValid;
    }
    
    /**
     *scroll callback function
     *check if ration between scrolled and left is 0.8 and load more
     */
    scrolling() {
        if (this.props.IsThereMoreCitiesToDisplay) {
            var ratio = 0.8;
            if ((this.self.offsetHeight / (this.self.scrollHeight - this.self.scrollTop)) > ratio) {
                this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_MORE_CITIES});
                this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CURRENT_DISPLAYED_CITIES});
            }
        }
    }

    updateCitySearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CITY_SEARCH_VALUE, value});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CURRENT_DISPLAYED_CITIES});
    }

    addNewCity() {
        const event = 'add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_CITY_MODE_UPDATED, event});
    }

    updateCityName(e) {
        const key = 'cityName';
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
    }

    updateCityMiId(e) {
        const key = 'miId';
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_MIID_VALUE_CHANGED});
    }

    cancelEditMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_CITY_MODE_UPDATED, event});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CURRENT_DISPLAYED_CITIES});
    }

    saveEdit() {
        SystemActions.addCity(store, this.props.cityInEditMode);
    }

    comboChange(columnName, el) {
        if (el.target.selectedItem) {

            if (columnName === 'area') {
                SystemActions.loadSubAreas(store, el.target.selectedItem.key);
            }

            //store the name
            var value = el.target.selectedItem.name;
            var key = columnName + 'Name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
            //store the key
            value = el.target.selectedItem.key;
            key = columnName + 'Key';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
        }
    }

    updateCollapseStatus(container) {
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
        const container='city';
        let hasScrollbar=false;
        
        if (undefined!= this.self&& null !=this.self) {
            hasScrollbar=this.self.scrollHeight > this.self.clientHeight ?true:false;
        }
        
        if(hasScrollbar!=this.props.tableHasScrollbar[container]){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED, container, hasScrollbar});
        }
    }
    
    getScrollHeaderStyle(){
        return this.props.tableHasScrollbar.city? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
       
    render() {
        this.renderRows();
        this.setOrderDirection();
        this.cityNameValidation();
        
        return (
            <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.cities']) ? '' : ' hidden')}>
                <a onClick={this.updateCollapseStatus.bind(this, 'city')} aria-expanded={this.props.containerCollapseStatus.city}>
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <span className="collapseTitle">{this.textValues.listTitle}</span>
                </a>
                <Collapse isOpened={this.props.containerCollapseStatus.city}>
                    <div className="CollapseContent">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="citySearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-2">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="citySearch"
                                           value={this.props.citySearchValue} onChange={this.updateCitySearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-1">
                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.cities.add']) ? '' : ' hidden')} 
                                        disabled={(this.isCityNameValid? "" : "disabled")} onClick={this.addNewCity.bind(this)}>
                                        <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                        <span>{this.textValues.addButtonTitle}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className={"well" + (this.props.isCityInAddMode ? "" : " hidden")}>
                            <div className="row form-horizontal">
                            <div className="col-lg-1"></div>
                                <div className="col-lg-4">
                                    <div className="row">
                                        <div className={"form-group" + (this.isCityNameValid ? '' : ' has-error')}>
                                            <label htmlFor="cityName" className="col-sm-4 control-label">{this.textValues.nameTitle}</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" id="cityName"
                                                       value={this.props.cityInEditMode.cityName} onChange={this.updateCityName.bind(this)}/>
                                                <span className={"help-block" + (this.isCityNameValid ? ' not-visible' : '')}>
                                                        {this.textValues.cityNameNotValid}
                                                    </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="form-group">
                                            <label htmlFor="subArea" className="col-sm-4 control-label">{this.textValues.subAreaTitle}</label>
                                            <div className="col-sm-8">
                                                <Combo className="" items={this.props.subAreas} maxDisplayItems={5} itemIdProperty="key"
                                                       itemDisplayProperty='name' value={this.props.cityInEditMode.subAreaName}
                                                       onChange={this.comboChange.bind(this, "subArea")} id="subArea"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-1"></div>
                                <div className="col-lg-4">
                                    <div className="row">
                                        <div className="form-group">
                                            <label htmlFor="areaName" className="col-sm-4 control-label">{this.textValues.areaTitle}</label>
                                            <div className="col-sm-8">
                                                <Combo className="" items={this.props.areas} maxDisplayItems={5}
                                                       itemIdProperty="key" itemDisplayProperty='name' value={this.props.cityInEditMode.areaName}
                                                       onChange={this.comboChange.bind(this, "area")} id="areaName"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className={"form-group" + (!this.props.isCityMiIDValid ? ' has-error' : '')}>
                                            <label htmlFor="miId" className="col-sm-4 control-label">{this.textValues.miIdTitle}</label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control" value={this.props.cityInEditMode.miId}
                                                       onChange={this.updateCityMiId.bind(this)} id="miId"/>
                                                <span className={"help-block" + (!this.props.isCityMiIDValid ? '' : ' not-visible')}>
                                                            {this.props.cityInEditMode.miId ? this.textValues.miIdIsAlreadyExist : this.textValues.miIdIsmissing}
                                                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-2">
                                    <span className="edit-buttons">
                                        <button type="button" className="btn btn-success btn-xs" 
                                        disabled={((this.props.isCityMiIDValid && this.isCityNameValid) ? "" : "disabled")}
                                                onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}>
                                            <i className="fa fa-floppy-o"></i>
                                        </button>
                                        &nbsp;
                                        <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}>
                                                <i className="fa fa-times"></i>
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-1"></div>
                            <div className="col-md-11">
                                <table className="table table-bordered table-striped table-hover lists-table">
                                    <thead>
                                    <tr>
                                        <th>
                                            <span onClick={this.orderList.bind(this, 'city_name')} className="cursor-pointer">
                                                {this.textValues.nameTitle}&nbsp;
                                                <i className={this.props.cityOrderColumn === 'city_name' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                            </span>
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this, 'area_name')} className="cursor-pointer">
                                                {this.textValues.areaTitle}&nbsp;
                                                <i className={this.props.cityOrderColumn === 'area_name' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                            </span>
                                        </th>
                                        <th>
                                            <span onClick={this.orderList.bind(this, 'sub_area_name')} className="cursor-pointer">
                                                {this.textValues.subAreaTitle}&nbsp;
                                                <i className={this.props.cityOrderColumn === 'sub_area_name' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                            </span>
                                        </th>
                                        <th style={this.noBorderLeft}>
                                            <span onClick={this.orderList.bind(this, 'mi_id')} className="cursor-pointer">
                                                {this.textValues.miIdTitle}&nbsp;
                                                <i className={this.props.cityOrderColumn === 'mi_id' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                            </span>
                                        </th>
                                        <th style={this.getScrollHeaderStyle()}></th>
                                    </tr>
                                    </thead>
                                    <tbody onScroll={this.scrolling.bind(this)} ref={this.getRef.bind(this)}>
                                    {this.cityRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showCityModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)}
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
        cities: state.system.lists.cities,
        currentDisplayedCities: state.system.listsScreen.generalTab.currentDisplayedCities,
        IsThereMoreCitiesToDisplay: state.system.listsScreen.generalTab.IsThereMoreCitiesToDisplay,
        isCitiesOrderedAsc: state.system.listsScreen.generalTab.isCitiesOrderedAsc,
        showCityModalDialog: state.system.listsScreen.generalTab.showCityModalDialog,
        cityKeyInSelectMode: state.system.listsScreen.generalTab.cityKeyInSelectMode,
        cityOrderColumn: state.system.listsScreen.generalTab.cityOrderColumn,
        citySearchValue: state.system.listsScreen.generalTab.citySearchValue,
        isCityInAddMode: state.system.listsScreen.generalTab.isCityInAddMode,
        cityInEditMode: state.system.listsScreen.generalTab.cityInEditMode,
        isCityMiIDValid: state.system.listsScreen.generalTab.isCityMiIDValid,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isCityInEditMode: state.system.listsScreen.generalTab.isCityInEditMode,
        areas: state.system.lists.areas,
        subAreas: state.system.lists.subAreas,
        currentUser: state.system.currentUser,
        scrollbarWidth : state.system.scrollbarWidth,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
    };
}
export default connect(mapStateToProps)(withRouter(City));