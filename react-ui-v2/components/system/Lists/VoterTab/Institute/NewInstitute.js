import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import Combo from '../../../../global/Combo';

class NewInstitute extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            nameTitle: 'שם מוסד',
            groupTitle: 'קבוצה',
            typeTitle: 'סוג',
            networkTitle: 'רשת',
            cityTitle: 'עיר',
            modalWindowTitle: 'מחיקת מוסד',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את המוסד הזה?',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key, value});
    }

    comboChange(key, el) {
        let value = el.target.value;
        let selectedKey = undefined;
        if (el.target.selectedItem != undefined){
           if (key == 'city') selectedKey = el.target.selectedItem.city_key;
           else selectedKey = el.target.selectedItem.key;
        } 
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: key + '_key', value: selectedKey});

        if (key == 'group') {
            if (selectedKey != undefined) this.loadInstituteTypes(selectedKey);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'type', value: ''});
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'type_key', value: undefined});
        }

        if (key == 'type' && !this.props.instituteInEditMode.group_key) {
            let groupName = '';
            let groupKey = undefined;
            this.props.instituteGroups.map(function (group) {
                if (group.id == value.institute_group_id) {
                    groupName = group.name;
                    groupKey = group.key;
                    return;
                }
            });

            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'group', value: groupName});
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED, key: 'group_key', value: groupKey});
        }
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'institute'});
    }

    cancelAddMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.INSTITUTE_ADD_MODE_UPDATED, event});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'institute'});
    }

    addNewInstitute() {
        let institute = {
            name: this.props.instituteInEditMode.name,
            network: this.props.instituteInEditMode.network_key,
            city: this.props.instituteInEditMode.city_key,
            type: this.props.instituteInEditMode.type_key
        };
        SystemActions.addInstitute(this.props.dispatch, institute);
        this.cancelAddMode();
    }

    addDisabled() {
        let edit = this.props.instituteInEditMode;
        let dirty = this.props.dirty;
        let name = edit.name.length >= 2;
        let type = edit.type_key != undefined;
        let city = edit.city_key != undefined;
        let network = edit.network_key != undefined || edit.network == undefined || (edit.network != undefined && edit.network.length == 0);
        return !(dirty && name && type && city && network);
    }

    loadInstituteTypes(key) {
        SystemActions.loadInstituteTypes(this.props.dispatch, key);
    }

    render() {
        return (
                <div className={'well' + (this.props.isInstituteInAddMode ? '' : ' hidden')}>
                    <div className="row form-horizontal">
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label htmlFor="roleName" className="col-sm-4 control-label">{this.textValues.nameTitle}</label>
                                <div className="col-sm-8">
                                    <input type="input" className="form-control" id="roleName" value={this.props.instituteInEditMode.name} 
                                           onChange={this.updateRowText.bind(this, 'name')}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label className="col-md-4 control-label">{this.textValues.networkTitle}</label>
                                <div className='col-md-8'>
                                    <Combo items={this.props.instituteNetworks} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                                           value={this.props.instituteInEditMode.network} onChange={this.comboChange.bind(this, 'network')}/>        
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label className="col-md-4 control-label">{this.textValues.cityTitle}</label>
                                <div className='col-md-8'>
                                    <Combo items={this.props.cities} maxDisplayItems={5} itemIdProperty="city_key" itemDisplayProperty="city_name" 
                                           value={this.props.instituteInEditMode.city} onChange={this.comboChange.bind(this, 'city')}/>        
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row form-horizontal">
                        <div className="col-md-4">
                            <div className="row form-group">
                                <label className="col-md-4 control-label">{this.textValues.groupTitle}</label>
                                <div className='col-md-8'>
                                    <Combo items={this.props.instituteGroups} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                                           value={this.props.instituteInEditMode.group} onChange={this.comboChange.bind(this, 'group')}/>        
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="row form-group">
                                <label className="col-md-3 control-label">{this.textValues.typeTitle}</label>
                                <div className='col-md-8'>
                                    <Combo items={this.props.instituteInEditMode.group ? this.props.instituteTypes : this.props.allInstituteTypes} 
                                           maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty="name" 
                                           value={this.props.instituteInEditMode.type} onChange={this.comboChange.bind(this, 'type')}/>        
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <span className="edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.addNewInstitute.bind(this)} 
                                        disabled={this.addDisabled()} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelAddMode.bind(this)} 
                                        title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </div>
                </div>)
    }
}

function mapStateToProps(state) {
    return {
        instituteInEditMode: state.system.listsScreen.voterTab.instituteInEditMode,
        isInstituteInAddMode: state.system.listsScreen.voterTab.isInstituteInAddMode,
        dirty: state.system.dirty,
        instituteNetworks: state.system.lists.instituteNetworks,
        cities: state.system.lists.cities,
        instituteGroups: state.system.lists.instituteGroups,
        instituteTypes: state.system.lists.instituteTypes,
        allInstituteTypes: state.system.lists.allInstituteTypes,
    };
}
export default connect(mapStateToProps)(withRouter(NewInstitute));