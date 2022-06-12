import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class VoterElectionRolesRow extends React.Component {

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
        const voterElectionRoleskey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_DELETE_MODE_UPDATED, voterElectionRoleskey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ELECTION_ROLES_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const voterElectionRoleskey = this.props.item.key;
        const voterElectionRolesName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_EDIT_MODE_UPDATED, voterElectionRoleskey, voterElectionRolesName});
    }

    updateRowText(e) {
        const voterElectionRolesName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_EDIT_VALUE_CHANGED, voterElectionRolesName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'VoterElectionRole'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'VoterElectionRole'});
    }

    saveEdit() {
        SystemActions.updateVoterElectionRoles(store, this.props.voterElectionRolesKeyInSelectMode, this.props.voterElectionRolesTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons hidden"}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.roles.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.roles.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control col-md-9" value={this.props.voterElectionRolesTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.voterElectionRolesTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isVoterElectionRolesInEditMode && this.props.item.key === this.props.voterElectionRolesKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterElectionRolesInEditMode: state.system.listsScreen.voterTab.isVoterElectionRolesInEditMode,
        voterElectionRolesKeyInSelectMode: state.system.listsScreen.voterTab.voterElectionRolesKeyInSelectMode,
        voterElectionRolesTextBeingEdited: state.system.listsScreen.voterTab.voterElectionRolesTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterElectionRolesRow));