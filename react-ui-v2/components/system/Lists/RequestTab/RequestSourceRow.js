import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as SystemActions from '../../../../actions/SystemActions';

class RequestSourceRow extends React.Component {
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
        const requestSourcekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_DELETE_MODE_UPDATED, requestSourcekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_SOURCE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const requestSourcekey = this.props.item.key;
        const requestSourceName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_EDIT_MODE_UPDATED, requestSourcekey, requestSourceName});
    }

    updateRowText(e) {
        const requestSourceName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_EDIT_VALUE_CHANGED, requestSourceName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'requestSource'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'requestSource'});
    }

    saveEdit() {
        SystemActions.updateRequestSource(this.props.dispatch, this.props.requestSourceKeyInSelectMode, this.props.requestSourceTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        {false && <span className={"pull-left edit-buttons" + (this.props.isRequestSourceInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.request_source.edit']) ? '' : ' hidden')}
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.request_source.delete']) ? '' : ' hidden')} 
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
                            <input type="text" className="form-control" value={this.props.requestSourceTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                        disabled={(!this.props.dirty || this.props.isNameExistInTheList(this.props.requestSourceTextBeingEdited) || (this.props.requestSourceTextBeingEdited.length >= 2) ? "" : "disabled")}>
                                    <i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>        
                        </div>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isInEditMode) {
            /* EDIT MODE */
//            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isRequestSourceInEditMode: state.system.listsScreen.requestTab.isRequestSourceInEditMode,
        requestSourceKeyInSelectMode: state.system.listsScreen.requestTab.requestSourceKeyInSelectMode,
        requestSourceTextBeingEdited: state.system.listsScreen.requestTab.requestSourceTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(RequestSourceRow));