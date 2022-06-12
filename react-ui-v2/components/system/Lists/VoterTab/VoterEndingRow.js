import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class VoterEndingRow extends React.Component {

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
        const voterEndingkey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ENDING_DELETE_MODE_UPDATED, voterEndingkey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ENDING_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const voterEndingkey = this.props.item.key;
        const voterEndingName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ENDING_EDIT_MODE_UPDATED, voterEndingkey, voterEndingName});
    }

    updateRowText(e) {
        const voterEndingName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ENDING_EDIT_VALUE_CHANGED, voterEndingName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'VoterEnding'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ENDING_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'VoterEnding'});
    }

    saveEdit() {
        SystemActions.updateVoterEnding(store, this.props.voterEndingKeyInSelectMode, this.props.voterEndingTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isVoterEndingInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_endings.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_endings.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr' style={this.props.style}>
                    <td className="row">
                        <input type="text" className="form-control col-md-9" value={this.props.voterEndingTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.voterEndingTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isVoterEndingInEditMode && this.props.item.key === this.props.voterEndingKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterEndingInEditMode: state.system.listsScreen.voterTab.isVoterEndingInEditMode,
        voterEndingKeyInSelectMode: state.system.listsScreen.voterTab.voterEndingKeyInSelectMode,
        voterEndingTextBeingEdited: state.system.listsScreen.voterTab.voterEndingTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterEndingRow));