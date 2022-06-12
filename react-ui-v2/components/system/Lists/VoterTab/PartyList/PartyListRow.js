import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';

class PartyListRow extends React.Component {
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            yes: 'כן',
            no: 'לא',
            isShas: 'מפלגת שס?',
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const partyListkey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_DELETE_MODE_UPDATED, partyListkey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PARTY_LIST_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const partyList = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_MODE_UPDATED, partyList});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'PartyList'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'PartyList'});
    }

    saveEdit() {
        SystemActions.updatePartyList(this.props.dispatch, this.props.partyListInEditMode);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>{this.props.item.letters}</td>
                    <td>
                        {this.props.item.shas ? this.textValues.yes : this.textValues.no}
                        <span className={"pull-left edit-buttons" + (this.props.isPartyListInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.party_lists.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.party_lists.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr'>
                    <td>
                        <input type="text" className="form-control" value={this.props.partyListInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                    </td>
                    <td>
                        <input type="text" className="form-control" value={this.props.partyListInEditMode.letters} onChange={this.updateRowText.bind(this, 'letters')}/>
                    </td>
                    <td>
                        <div className="row no-margin">
                            <div className="col-md-6 checkbox">
                                <label>
                                    <input type="checkbox" value={this.props.partyListInEditMode.shas}
                                           onChange={this.updateRowText.bind(this, 'shas')}
                                           checked={this.props.partyListInEditMode.shas == 1 ? 'checked' : ''}/>
                                    {this.textValues.isShas}
                                </label>
                            </div>
                            <div className="col-md-6">
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                            disabled = {(this.props.dirty && this.props.partyListInEditMode.name.length >= 2 ? "" : "disabled")}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                            title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                
                        </div>
                
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isPartyListInEditMode && this.props.item.key === this.props.partyListKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }

        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isPartyListInEditMode: state.system.listsScreen.voterTab.isPartyListInEditMode,
        partyListKeyInSelectMode: state.system.listsScreen.voterTab.partyListKeyInSelectMode,
        partyListInEditMode: state.system.listsScreen.voterTab.partyListInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(PartyListRow));