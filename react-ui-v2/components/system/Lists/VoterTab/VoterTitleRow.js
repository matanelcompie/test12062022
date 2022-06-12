import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class VoterTitleRow extends React.Component {

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
        const voterTitlekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_TITLE_DELETE_MODE_UPDATED, voterTitlekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_TITLE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const voterTitlekey = this.props.item.key;
        const voterTitleName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_TITLE_EDIT_MODE_UPDATED, voterTitlekey, voterTitleName});
    }

    updateRowText(e) {
        const voterTitleName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_TITLE_EDIT_VALUE_CHANGED, voterTitleName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'VoterTitle'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_TITLE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'VoterTitle'});
    }

    saveEdit() {
        SystemActions.updateVoterTitle(store, this.props.voterTitleKeyInSelectMode, this.props.voterTitleTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isVoterTitleInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_titles.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_titles.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control col-md-9" value={this.props.voterTitleTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.voterTitleTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isVoterTitleInEditMode && this.props.item.key === this.props.voterTitleKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterTitleInEditMode: state.system.listsScreen.voterTab.isVoterTitleInEditMode,
        voterTitleKeyInSelectMode: state.system.listsScreen.voterTab.voterTitleKeyInSelectMode,
        voterTitleTextBeingEdited: state.system.listsScreen.voterTab.voterTitleTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterTitleRow));