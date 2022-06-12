import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import Combo from '../../../global/Combo';

class EthnicRow extends React.Component {

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

    deleteRow() {
        this.props.updateScrollPosition();
        const ethnickey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ETHNIC_DELETE_MODE_UPDATED, ethnickey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_ETHNIC_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const ethnickey = this.props.item.key;
        const ethnicName = this.props.item.name;
        const ethnicSephardi = this.props.item.sephardi;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ETHNIC_EDIT_MODE_UPDATED, ethnickey, ethnicName, ethnicSephardi});
    }

    updateRowText(e) {
        const ethnicName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ETHNIC_EDIT_VALUE_CHANGED, ethnicName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'Ethnic'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ETHNIC_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'Ethnic'});
    }

    saveEdit() {
        const ethnicGroup = {
            key: this.props.ethnicKeyInSelectMode,
            name: this.props.ethnicTextBeingEdited,
            sephardi: this.props.ethnicSephardiValueInEdited
        };

        SystemActions.updateEthnic(store, ethnicGroup);
    }

    setComboOptions() {
        this.sephardiOptions = [{id: 0, value: 'לא'}, {id: 1, value: 'כן'}, {id: null, value: ''}];
    }

    setSephardiText() {
        this.sephardiText = ((this.props.item.sephardi === 1) ? 'כן' : (this.props.item.sephardi === 0) ? 'לא' : '');
    }

    comboChange(e) {
        if (e.target.selectedItem) {
            const ethnicSephardi = e.target.selectedItem.id;
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ETHNIC_SEPHARDI_VALUE_CHANGED, ethnicSephardi});
            this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'Ethnic'});
        }
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>{this.props.item.name}</span>
                    </td>
                    <td>
                        <span>
                            {this.sephardiText}
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isEthnicInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.ethnic_groups.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.ethnic_groups.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control" value={this.props.ethnicTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                    </td>
                    <td>
                <Combo className="input-group pull-right lists-combo" items={this.sephardiOptions} maxDisplayItems={5} itemIdProperty="id" 
                       itemDisplayProperty='value' defaultValue={this.sephardiText} onChange={this.comboChange.bind(this)}/>
                <span className="pull-left edit-buttons">
                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                            disabled={(this.props.dirty && this.props.ethnicTextBeingEdited.length >= 2 ? "" : "disabled")} 
                            title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                            title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                </span>
                </td>
                </tr>
                );
    }

    render() {
        this.setComboOptions();
        this.setSephardiText();
        if (this.props.isEthnicInEditMode && this.props.item.key === this.props.ethnicKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isEthnicInEditMode: state.system.listsScreen.voterTab.isEthnicInEditMode,
        ethnicKeyInSelectMode: state.system.listsScreen.voterTab.ethnicKeyInSelectMode,
        ethnicTextBeingEdited: state.system.listsScreen.voterTab.ethnicTextBeingEdited,
        ethnicSephardiValueInEdited: state.system.listsScreen.voterTab.ethnicSephardiValueInEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(EthnicRow));