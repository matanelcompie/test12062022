import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class VoterActionTypeRow extends React.Component {

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
        const voterActionTypekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_DELETE_MODE_UPDATED, voterActionTypekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TYPE_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const voterActionTypekey = this.props.item.key;
        const voterActionTypeName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_EDIT_MODE_UPDATED, voterActionTypekey, voterActionTypeName});
    }

    updateRowText(e) {
        const voterActionTypeName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_EDIT_VALUE_CHANGED, voterActionTypeName});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'VoterActionType'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_EDIT_MODE_UPDATED});
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'VoterActionType'});
    }

    saveEdit() {
        SystemActions.updateVoterActionType(store, this.props.voterActionTypeKeyInSelectMode, this.props.voterActionTypeTextBeingEdited);
    }

    loadActionTypeTopics() {
        if (this.props.isVoterActionTypeInEditMode == false && this.props.isVoterActionTopicInEditMode == false) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const name = this.props.item.name;
            SystemActions.loadVoterActionTopics(store, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_VOTER_ACTION_TYPE_TOPICS, key, id, name});
        }
    }

    highlight() {
        if (this.props.isVoterActionTypeTopicsDisplayed == true && (this.props.item.key == this.props.voterActionTypeKeyInSelectMode)) {
            return 'lists-row success';
        }
        return 'lists-row';
    }

    renderDisplayMode() {
        return(
                <tr onClick={this.loadActionTypeTopics.bind(this)} className={this.highlight()}>
                    <td>
                        <span>{this.props.item.name}</span>
                        {(this.props.item.system_name==null) && <span className={"pull-left edit-buttons" + (this.props.isVoterActionTypeInEditMode || this.props.isVoterActionTopicInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_types.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_types.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>}
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td className="row">
                        <div className="col-md-8">
                            <input type="text" className="form-control" value={this.props.voterActionTypeTextBeingEdited} onChange={this.updateRowText.bind(this)}/>        
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                        disabled={(this.props.dirty && this.props.voterActionTypeTextBeingEdited.length >= 2 ? "" : "disabled")} 
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
        if (this.props.isVoterActionTypeInEditMode && this.props.item.key === this.props.voterActionTypeKeyInSelectMode && (this.props.item.system_name==null)) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterActionTypeInEditMode: state.system.listsScreen.voterTab.isVoterActionTypeInEditMode,
        isVoterActionTopicInEditMode: state.system.listsScreen.voterTab.isVoterActionTopicInEditMode,
        voterActionTypeKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTypeKeyInSelectMode,
        voterActionTypeTextBeingEdited: state.system.listsScreen.voterTab.voterActionTypeTextBeingEdited,
        isVoterActionTypeTopicsDisplayed: state.system.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterActionTypeRow));