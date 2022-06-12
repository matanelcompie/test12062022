import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import Combo from '../../../../global/Combo';

class VoterMetaKeyRow extends React.Component {

    constructor(props) {
        super(props);
        this.initVariables();
    }

    deleteRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const voterMetaKey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_META_KEY_DELETE_MODE_UPDATED, voterMetaKey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_KEY_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'VoterMetaKey'});
    }

    cancelEditMode(e) {
        e.stopPropagation();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_MODE_UPDATED});
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'VoterMetaKey'});
    }

    saveEdit(e) {
        e.stopPropagation();
        SystemActions.updateVoterMetaKey(store, this.props.voterMetaKeyInEditMode);
    }

    loadMetaKeyValues() {
        if (this.props.isVoterMetaKeyInEditMode == false && this.props.item.key_type == 0 && this.props.isVoterMetaValueInEditMode == false) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const keyType = this.props.item.key_type;
            const name = this.props.item.key_name;
            SystemActions.loadVoterMetaValues(store, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_VOTER_META_KEY_VALUES, key, id, keyType, name});
        }
    }

    highlight() {
        if (this.props.isVoterMetaKeyValuesDisplayed == true && (this.props.item.key == this.props.voterMetaKeyInSelectMode)) {
            return 'lists-row success';
        }
        return 'lists-row';
    }

    initVariables() {
        this.textValues = {
            voterMetaKeyPerCampaign: 'כן',
            voterMetaKeyNotPerCampaign: 'לא',
            voterMetaKeyTypes: {
                0: 'ערכים לבחירה',
                1: 'ערך חופשי',
                2: 'מספר'
            },
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    setComboOptions() {
        this.keyTypeOptions = [{id: 0, value: this.textValues.voterMetaKeyTypes[0]},
            {id: 1, value: this.textValues.voterMetaKeyTypes[1]}, {id: 2, value: this.textValues.voterMetaKeyTypes[2]}, {id: null, value: ''}];
    }

    comboChange(key, e) {
        if (e.target.selectedItem) {
            const value = e.target.selectedItem.id;
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_VALUE_CHANGED, key, value});
            this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'VoterMetaKey'});
        }
    }

    renderDisplayMode() {
        return(
                <tr onClick={this.loadMetaKeyValues.bind(this)} className={this.highlight()}>
                    <td>
                        <span>{this.props.item.key_name}</span>
                    </td>
                    <td>
                        {this.textValues.voterMetaKeyTypes[this.props.item.key_type]}
                    </td>
                    <td>
                        {this.props.item.max}
                    </td>
                    <td>
                        {this.props.item.per_campaign == 1 ? this.textValues.voterMetaKeyPerCampaign : this.textValues.voterMetaKeyNotPerCampaign}
                        <span className={"pull-left edit-buttons" + (this.props.isVoterMetaKeyInEditMode || this.props.isVoterMetaValueInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td><input type="text" className="form-control" value={this.props.voterMetaKeyInEditMode.key_name} onChange={this.updateRowText.bind(this, 'key_name')}/></td>
                    <td>
                <Combo className="input-group pull-right" items={this.keyTypeOptions} maxDisplayItems={5} 
                       itemIdProperty="id" itemDisplayProperty='value' onChange={this.comboChange.bind(this, 'key_type')} 
                       defaultValue={this.textValues.voterMetaKeyTypes[this.props.item.key_type]} />
                </td>
                <td>
                    <input type="number" min="1" max="1000000" className={"form-control" + (this.props.item.key_type == 0 ? ' hidden' : '')} value={this.props.voterMetaKeyInEditMode.max || ''} onChange={this.updateRowText.bind(this, 'max')}/>
                </td>
                <td className="row">
                    <div className="col-md-6 no-padding">
                        <label>
                            <input type="checkbox" value={this.textValues.voterMetaKeyPerCampaign}
                                   onChange={this.updateRowText.bind(this, 'per_campaign')}
                                   checked={this.props.voterMetaKeyInEditMode.per_campaign == 1 ? 'checked' : ''}/>&nbsp;&nbsp;&nbsp;
                            {this.textValues.voterMetaKeyPerCampaign + '?'}
                        </label>
                    </div>
                    <div className="col-md-6 no-padding">
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.voterMetaKeyInEditMode.key_name.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </div>
                </td>
                </tr>
                );
    }

    render() {
        this.setComboOptions();

        if (this.props.isVoterMetaKeyInEditMode && this.props.item.key === this.props.voterMetaKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterMetaKeyInEditMode: state.system.listsScreen.voterTab.isVoterMetaKeyInEditMode,
        voterMetaKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyInSelectMode,
        voterMetaKeyInEditMode: state.system.listsScreen.voterTab.voterMetaKeyInEditMode,
        isVoterMetaKeyValuesDisplayed: state.system.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed,
        isVoterMetaValueInEditMode: state.system.listsScreen.voterTab.isVoterMetaValueInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterMetaKeyRow));