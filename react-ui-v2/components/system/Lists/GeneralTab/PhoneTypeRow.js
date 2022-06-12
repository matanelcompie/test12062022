import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class PhoneTypeRow extends React.Component {
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
        const phoneTypekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PHONE_TYPE_DELETE_MODE_UPDATED, phoneTypekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PHONE_TYPE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const phoneTypekey = this.props.item.key;
        const phoneTypeName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PHONE_TYPE_EDIT_MODE_UPDATED, phoneTypekey, phoneTypeName});
    }

    updateRowText(e) {
        const phoneTypeName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PHONE_TYPE_EDIT_VALUE_CHANGED, phoneTypeName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'phoneType'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PHONE_TYPE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'phoneType'});
    }

    saveEdit() {
        SystemActions.updatePhoneType(store, this.props.phoneTypeKeyInSelectMode, this.props.phoneTypeTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isPhoneTypeInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.phone_types.edit']) ? '' : ' hidden')}
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.phone_types.delete']) ? '' : ' hidden')} 
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
                        <div className="col-md-8">
                            <input type="text" className="form-control" value={this.props.phoneTypeTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                        disabled={(!this.props.dirty || this.props.isNameExistInTheList(this.props.phoneTypeTextBeingEdited) || (this.props.phoneTypeTextBeingEdited.length >= 2) ? "" : "disabled")}>
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
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isPhoneTypeInEditMode: state.system.listsScreen.generalTab.isPhoneTypeInEditMode,
        phoneTypeKeyInSelectMode: state.system.listsScreen.generalTab.phoneTypeKeyInSelectMode,
        phoneTypeTextBeingEdited: state.system.listsScreen.generalTab.phoneTypeTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(PhoneTypeRow));