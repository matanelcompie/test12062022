import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class VoterActionTopicRow extends React.Component {

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
        const voterActionTopickey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_DELETE_MODE_UPDATED, voterActionTopickey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TOPIC_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'VoterActionTopic'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'VoterActionTopic'});
    }

    saveEdit() {
        const item = this.props.voterActionTopicInEditMode;
        const key = this.props.voterActionTypeKeyInSelectMode;
        SystemActions.updateVoterActionTopic(store, item, key);
    }

    initVariables() {
        this.textValues = {
            active: 'פעיל',
            notActive: 'לא פעיל'
        };
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>
                        {(this.props.item.active == "1") ? this.textValues.active : this.textValues.notActive}
                        {(this.props.item.system_name==null) && <span className={"pull-left edit-buttons" + (this.props.isVoterActionTopicInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_topics.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_topics.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>}
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <input type="text" className="form-control" value={this.props.voterActionTopicInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>        
                    </td>
                    <td className="row">
                        <div className="checkbox col-md-6">
                            <label>
                                <input type="checkbox" value={this.props.voterActionTopicInEditMode.active}
                                       onChange={this.updateRowText.bind(this, 'active')}
                                       checked={this.props.voterActionTopicInEditMode.active == 1 ? 'checked' : ''}/>
                                {this.textValues.active + '?'}
                            </label>
                        </div>
                        <div className="col-md-6">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                        disabled={(this.props.dirty && this.props.voterActionTopicInEditMode.name.length >= 2 ? "" : "disabled")} 
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
        this.initVariables();

        if (this.props.isVoterActionTopicInEditMode && this.props.item.key === this.props.voterActionTopicKeyInSelectMode && (this.props.item.system_name==null)) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isVoterActionTopicInEditMode: state.system.listsScreen.voterTab.isVoterActionTopicInEditMode,
        voterActionTopicKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTopicKeyInSelectMode,
        voterActionTopicInEditMode: state.system.listsScreen.voterTab.voterActionTopicInEditMode,
        voterActionTypeKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTypeKeyInSelectMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(VoterActionTopicRow));