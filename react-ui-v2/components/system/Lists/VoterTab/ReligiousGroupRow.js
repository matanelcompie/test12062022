import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class ReligiousGroupRow extends React.Component {

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
        const religiousGroupKey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_DELETE_MODE_UPDATED, religiousGroupKey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_RELIGIOUS_GROUP_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const religiousGroupKey = this.props.item.key;
        const religiousGroupName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_EDIT_MODE_UPDATED, religiousGroupKey, religiousGroupName});
    }

    updateRowText(e) {
        const religiousGroupName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_EDIT_VALUE_CHANGED, religiousGroupName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'ReligiousGroups'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'ReligiousGroups'});
    }

    saveEdit() {
        let religiousGroup = {
            key: this.props.religiousGroupKeyInSelectMode,
            name: this.props.religiousGroupTextBeingEdited
        };
        SystemActions.updateReligiousGroup(store, religiousGroup);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.props.isReligiousGroupInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_groups.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.religious_groups.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control col-md-9" value={this.props.religiousGroupTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.religiousGroupTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isReligiousGroupInEditMode && this.props.item.key === this.props.religiousGroupKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isReligiousGroupInEditMode: state.system.listsScreen.voterTab.isReligiousGroupInEditMode,
        religiousGroupKeyInSelectMode: state.system.listsScreen.voterTab.religiousGroupKeyInSelectMode,
        religiousGroupTextBeingEdited: state.system.listsScreen.voterTab.religiousGroupTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(ReligiousGroupRow));