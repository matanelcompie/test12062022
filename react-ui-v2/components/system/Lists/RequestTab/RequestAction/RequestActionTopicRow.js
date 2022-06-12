import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class RequestActionTopicRow extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול',
            active: 'פעיל',
            notActive: 'לא פעיל'
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const requestActionTopickey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_DELETE_MODE_UPDATED, requestActionTopickey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TOPIC_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requestActionTopic'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestActionTopic'});
    }

    saveEdit() {
        const item = this.props.requestActionTopicInEditMode;
        const key = this.props.requestActionTypeKeyInSelectMode;
        SystemActions.updateRequestActionTopic(store, item, key);
    }


    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>
                        {(this.props.item.active == "1") ? this.textValues.active : this.textValues.notActive}
                        {(this.props.item.system_name==null) &&<span className={"pull-left edit-buttons" + (this.props.isRequestActionTopicInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control" value={this.props.requestActionTopicInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>        
                    </td>
                    <td className="row">
                        <div className="checkbox col-md-6">
                            <label>
                                <input type="checkbox" value={this.props.requestActionTopicInEditMode.active}
                                       onChange={this.updateRowText.bind(this, 'active')}
                                       checked={this.props.requestActionTopicInEditMode.active == 1 ? 'checked' : ''}/>
                                {this.textValues.active + '?'}
                            </label>
                        </div>
                        <div className="col-md-6">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.requestActionTopicInEditMode.name.length >= 2 ? "" : "disabled")} 
                                onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isRequestActionTopicInEditMode && this.props.item.key === this.props.requestActionTopicKeyInSelectMode && (this.props.item.system_name==null)) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isRequestActionTopicInEditMode: state.system.listsScreen.requestTab.isRequestActionTopicInEditMode,
        requestActionTopicKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTopicKeyInSelectMode,
        requestActionTopicInEditMode: state.system.listsScreen.requestTab.requestActionTopicInEditMode,
        requestActionTypeKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTypeKeyInSelectMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(RequestActionTopicRow));