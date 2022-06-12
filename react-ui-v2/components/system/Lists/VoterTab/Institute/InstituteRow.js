import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import Combo from '../../../../global/Combo';

class InstituteRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    deleteRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const institute = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_DELETE_MODE_UPDATED, institute});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_MODE_UPDATED, item});

        this.loadInstituteTypes(this.props.item.group_key);
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'institute'});
    }

    comboChange(key, el) {
        let  value = el.target.value;
        let  selectedItemKey = el.target.selectedItem? ((key == 'city')? el.target.selectedItem.city_key : el.target.selectedItem.key) : '';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: key + '_key', value: selectedItemKey});

        if (key == 'group') {
            if (selectedItemKey.length > 0) this.loadInstituteTypes(selectedItemKey);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'type', value: ''});
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'type_key', value: ''});
        }
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'institute'});
    }

    loadInstituteTypes(key) {
        SystemActions.loadInstituteTypes(this.props.dispatch, key);
    }

    cancelEditMode(e) {
        e.stopPropagation();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'institute'});
    }

    saveEdit(e) {
        e.stopPropagation();
        let institute = {
            name: this.props.instituteInEditMode.name,
            network: this.props.instituteInEditMode.network_key,
            city: this.props.instituteInEditMode.city_key,
            type: this.props.instituteInEditMode.type_key
        };
        SystemActions.updateInstitute(this.props.dispatch, this.props.instituteInSelectMode, institute);
    }
/** Not in use! */
    saveEditDisabled() {
        let edit = this.props.instituteInEditMode;
        let dirty = this.props.dirty;
        let name = edit.name.length >= 2;
        let type = edit.type_key != undefined;
        let city = edit.city_key != undefined;
        let network = edit.network_key != undefined || edit.network == undefined || (edit.network != undefined && edit.network.length == 0);
        return !(dirty && name && type && city && network);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>{this.props.item.name}</span>
                    </td>
                    <td>
                        <span>{this.props.item.group}</span>
                    </td>
                    <td>
                        <span>{this.props.item.type}</span>
                    </td>
                    <td>
                        <span>{this.props.item.network}</span>
                    </td>
                    <td>
                        <span>{this.props.item.city}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isInstituteInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.add']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control" value={this.props.instituteInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>                
                    </td>
                    <td>
                <Combo items={this.props.instituteGroups} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                       value={this.props.instituteInEditMode.group} onChange={this.comboChange.bind(this, 'group')}/>    
                </td>
                <td>
                <Combo items={this.props.instituteTypes} 
                       maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                       disabled={this.props.instituteInEditMode.group_key.length == 0? 'disabled' : ''}
                       value={this.props.instituteInEditMode.type} onChange={this.comboChange.bind(this, 'type')}/>   
                </td>
                <td>
                <Combo items={this.props.instituteNetworks} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                       value={this.props.instituteInEditMode.network} onChange={this.comboChange.bind(this, 'network')}/>     
                </td>
                <td className="row">
                    <div className="col-md-8 no-padding">
                        <Combo items={this.props.cities} maxDisplayItems={5} itemIdProperty="city_key" itemDisplayProperty="city_name" 
                               value={this.props.instituteInEditMode.city} onChange={this.comboChange.bind(this, 'city')} />                
                    </div>
                    <div className="col-md-4 no-padding">
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.canSaveInstitute() ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </div>
                </td>
                </tr>
                );
    }

    /**
     * Check to see if user can save institute
     *
     * @return boolean
     **/
    canSaveInstitute() {
        return this.props.dirty && this.props.instituteInEditMode.name.length >= 2
                && this.props.instituteInEditMode.type_key.length > 0
                && this.props.instituteInEditMode.city_key.length > 0
    }

    render() {
        if (this.props.isInstituteInEditMode && this.props.item.key === this.props.instituteInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isInstituteInEditMode: state.system.listsScreen.voterTab.isInstituteInEditMode,
        instituteInSelectMode: state.system.listsScreen.voterTab.instituteInSelectMode,
        instituteInEditMode: state.system.listsScreen.voterTab.instituteInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
        instituteNetworks: state.system.lists.instituteNetworks,
        cities: state.system.lists.cities,
        instituteGroups: state.system.lists.instituteGroups,
        instituteTypes: state.system.lists.instituteTypes,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteRow));