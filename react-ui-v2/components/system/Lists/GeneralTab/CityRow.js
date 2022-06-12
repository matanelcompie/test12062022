import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import Combo from '../../../global/Combo';

class CityRow extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            miIdIsmissing: 'חסר קוד עיר',
            miIdIsAlreadyExist: 'קוד עיר קיים',
            cityNameIsSmall: 'שם עיר קצר מדי',
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    deleteRow() {
        const citykey = this.props.item.city_key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_DELETE_MODE_UPDATED, citykey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        const city = this.props.item;

        if (city.area_key !== null) {
            SystemActions.loadSubAreas(store, city.area_key);
        }
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_MODE_UPDATED, city});
    }

    updateCityName(e) {
        const key = 'cityName';
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
		this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'city'});
    }

    updateCityMiId(e) {
        const key = 'miId';
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_MIID_VALUE_CHANGED});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'city'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'city'});
    }

    saveEdit() {
        SystemActions.updateCity(store, this.props.cityKeyInSelectMode, this.props.cityInEditMode);
    }

    comboChange(columnName, el) {
	 
      //  if (el.target.selectedItem) {

            if (columnName === 'area') {
				if(el.target.selectedItem){
					SystemActions.loadSubAreas(store, el.target.selectedItem.key);
				}
                if (!el.target.selectedItem || (el.target.selectedItem.key != this.props.cityInEditMode.areaKey)) {
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key:'subAreaName', value:''});
                    this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key:'subAreaKey', value:''});
                }
            }

            //store the name
            var value = (el.target.selectedItem ? el.target.selectedItem.name : '');
            var key = columnName + 'Name';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});

            //store the key
            value = (el.target.selectedItem ? el.target.selectedItem.key : '');
            key = columnName + 'Key';
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED, key, value});
		 
            //set dirty
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'city'});
        //}
    }
	
    renderDisplayMode() {
        return (
                <tr className="lists-row">
                    <td><span>{this.props.item.city_name}</span></td>
                    <td><span>{this.props.item.area_name}</span></td>
                    <td><span>{this.props.item.sub_area_name}</span></td>
                    <td>
                        <span>{this.props.item.mi_id}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isCityInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.cities.edit']) ? '' : ' hidden')} 
                            onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>
                            &nbsp;
                            <button type="button" className={"btn btn-danger btn-xs"+ ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.cities.delete']) ? '' : ' hidden')} 
                            onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <div className={"form-group" + (this.props.cityInEditMode.cityName.length >= 2 ? '' : ' has-error')}>
                            <input type="text" className="form-control" value={this.props.cityInEditMode.cityName} onChange={this.updateCityName.bind(this)}/>
                            <span className={"help-block" + (this.props.cityInEditMode.cityName.length >= 2 ? ' hidden' : '')}>
                                {this.textValues.cityNameIsSmall}
                            </span>
                        </div>
                    </td>
                    <td>
                <Combo className="input-group" items={this.props.areas} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                       value={this.props.cityInEditMode.areaName} onChange={this.comboChange.bind(this, "area")}/>
                </td>
                <td>
                <Combo className="input-group" disabled={(this.props.cityInEditMode.areaKey ? "" : "disabled")} items={this.props.subAreas} maxDisplayItems={5} itemIdProperty="key" itemDisplayProperty='name'
                       value={this.props.cityInEditMode.subAreaName} onChange={this.comboChange.bind(this, "subArea")}/>
                </td>
                <td>
                    <div className="row">
                        <div className="col-md-6">
                            <div className={"form-group" + (!this.props.isCityMiIDValid ? ' has-error' : '')}>
                                <input type="text" className="form-control" value={this.props.cityInEditMode.miId} onChange={this.updateCityMiId.bind(this)}/>
                                <span className={"help-block" + (!this.props.isCityMiIDValid ? '' : ' hidden')}>
                                    {this.props.cityInEditMode.miId ? this.textValues.miIdIsAlreadyExist : this.textValues.miIdIsmissing}
                                </span>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.isCityMiIDValid && (this.props.cityInEditMode.cityName.length >= 2) ? "" : "disabled")}
                                        onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>
                                &nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </div>
                </td>
                </tr>
                );
    }

    render() {
 
        if (this.props.isCityInEditMode && this.props.item.city_key === this.props.cityKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isCityInEditMode: state.system.listsScreen.generalTab.isCityInEditMode,
        cityKeyInSelectMode: state.system.listsScreen.generalTab.cityKeyInSelectMode,
        cityInEditMode: state.system.listsScreen.generalTab.cityInEditMode,
        isCityMiIDValid: state.system.listsScreen.generalTab.isCityMiIDValid,
        areas: state.system.lists.areas,
        subAreas: state.system.lists.subAreas,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(CityRow));
