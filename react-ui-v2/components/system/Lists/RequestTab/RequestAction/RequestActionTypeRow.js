import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class RequestActionTypeRow extends React.Component {

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
        const requestActionTypekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_DELETE_MODE_UPDATED, requestActionTypekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TYPE_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const requestActionTypekey = this.props.item.key;
        const requestActionTypeName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_EDIT_MODE_UPDATED, requestActionTypekey, requestActionTypeName});
    }

    updateRowText(e) {
        const requestActionTypeName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_EDIT_VALUE_CHANGED, requestActionTypeName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requestActionType'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestActionType'});
    }

    saveEdit() {
        SystemActions.updateRequestActionType(store, this.props.requestActionTypeKeyInSelectMode, this.props.requestActionTypeTextBeingEdited);
    }

    loadActionTypeTopics() {
        if (this.props.isRequestActionTypeInEditMode == false && !this.props.isRequestActionTopicInEditMode) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const name = this.props.item.name;
            SystemActions.loadRequestActionTopics(store, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.LOAD_REQUEST_ACTION_TYPE_TOPICS, key, id, name});
        }
    }

    highlight() {
        if (this.props.isRequestActionTypeTopicsDisplayed == true && (this.props.item.key == this.props.requestActionTypeKeyInSelectMode)) {
            return 'lists-row success';
        }
        return 'lists-row';
    }

    renderDisplayMode() {
        return(
                <tr onClick={this.loadActionTypeTopics.bind(this)} className={this.highlight()}>
                    <td>
                        <span>{this.props.item.name}</span>
                        {(this.props.item.system_name==null) && <span className={"pull-left edit-buttons" + (this.props.isRequestActionTypeInEditMode || this.props.isRequestActionTopicInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_types.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_types.delete']) ? '' : ' hidden')} 
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
                            <input type="text" className="form-control" value={this.props.requestActionTypeTextBeingEdited} onChange={this.updateRowText.bind(this)}/>        
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.requestActionTypeTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isRequestActionTypeInEditMode && this.props.item.key === this.props.requestActionTypeKeyInSelectMode && this.props.item.system_name==null) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isRequestActionTypeInEditMode: state.system.listsScreen.requestTab.isRequestActionTypeInEditMode,
        isRequestActionTopicInEditMode: state.system.listsScreen.requestTab.isRequestActionTopicInEditMode,
        requestActionTypeKeyInSelectMode: state.system.listsScreen.requestTab.requestActionTypeKeyInSelectMode,
        requestActionTypeTextBeingEdited: state.system.listsScreen.requestTab.requestActionTypeTextBeingEdited,
        isRequestActionTypeTopicsDisplayed: state.system.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(RequestActionTypeRow));