import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class VoterMetaValueRow extends React.Component {

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
        const voterMetaValuekey = this.props.item.key;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_DELETE_MODE_UPDATED, voterMetaValuekey });
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_VALUE_MODAL_DIALOG_DISPLAY });
    }

    editRow() {
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_EDIT_MODE_UPDATED, item });
    }

    updateRowText(e) {
        const value = e.target.value;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_EDIT_VALUE_CHANGED, value });
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'VoterMetaValue' });
    }

    cancelEditMode() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_EDIT_MODE_UPDATED });
        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'VoterMetaValue' });
    }

    saveEdit() {
        const item = this.props.voterMetaValueInEditMode;
        const key = this.props.voterMetaKeyInSelectMode;
        SystemActions.updateVoterMetaValue(store, item, key);
    }

    getKeyTextInputType() {
        return (this.props.voterMetaKeyTypeInSelectMode == 2 ? 'number' : 'text');
    }

    renderDisplayMode() {
        return (
            <tr className="lists-row">
                <td>
                    {this.props.item.value}
                    <span className={"pull-left edit-buttons" + (this.props.isVoterMetaValueInEditMode ? " hidden" : "")}>
                        <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas.edit']) ? '' : ' hidden')}
                            onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.metas.add']) ? '' : ' hidden')}
                            onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                    </span>
                </td>
            </tr>
        );
    }

    renderEditMode() {
        return (
            <tr className='edit-mode-tr'>
                <td className="row">
                    <div className="col-md-6">
                        <input type={this.getKeyTextInputType()} className="form-control" value={this.props.voterMetaValueInEditMode.value} onChange={this.updateRowText.bind(this)} />
                    </div>
                    <div className="col-md-6">
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)}
                                disabled={(this.props.dirty && this.props.voterMetaValueInEditMode.value.length >= 2 ? "" : "disabled")}
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
        if (this.props.isVoterMetaValueInEditMode && this.props.item.key === this.props.voterMetaValueKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterMetaValueInEditMode: state.system.listsScreen.voterTab.isVoterMetaValueInEditMode,
        voterMetaValueKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaValueKeyInSelectMode,
        voterMetaValueInEditMode: state.system.listsScreen.voterTab.voterMetaValueInEditMode,
        voterMetaKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyInSelectMode,
        voterMetaKeyTypeInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyTypeInSelectMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterMetaValueRow));