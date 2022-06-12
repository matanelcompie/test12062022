import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';

class LanguageRow extends React.Component {
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
            main: 'שפה ראישית',
            yes: 'כן',
            no: 'לא'
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const languageKey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LANGUAGE_DELETE_MODE_UPDATED, languageKey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_LANGUAGE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LANGUAGE_EDIT_MODE_UPDATED, item: this.props.item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LANGUAGE_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'language'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LANGUAGE_EDIT_MODE_UPDATED});
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'language'});
    }

    saveEdit() {
        SystemActions.updateLanguage(this.props.dispatch, this.props.languageKeyInSelectMode, this.props.languageInEditMode);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>
                        <span>{(this.props.item.main == "1") ? this.textValues.yes : this.textValues.no}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.languages.edit']) ? '' : ' hidden')}
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.languages.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control" value={this.props.languageInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                    </td>
                    <td className="row">
                        <div className="col-md-8 checkbox">
                            <label>
                                <input type="checkbox" value={this.props.languageInEditMode.main}
                                       onChange={this.updateRowText.bind(this, 'main')}
                                       checked={this.props.languageInEditMode.main == 1 ? 'checked' : ''}/>
                                {this.textValues.main + '?'}
                            </label>
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                        disabled={(!this.props.dirty || (this.props.languageInEditMode.name.length >= 2) ? "" : "disabled")}>
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
        isLanguageInEditMode: state.system.listsScreen.generalTab.isLanguageInEditMode,
        languageKeyInSelectMode: state.system.listsScreen.generalTab.languageKeyInSelectMode,
        languageInEditMode: state.system.listsScreen.generalTab.languageInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(LanguageRow));