import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';

class CsvSourceRow extends React.Component {

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
        const csvSourcekey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CSV_SOURCE_DELETE_MODE_UPDATED, csvSourcekey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CSV_SOURCE_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const csvSourcekey = this.props.item.key;
        const csvSourceName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CSV_SOURCE_EDIT_MODE_UPDATED, csvSourcekey, csvSourceName});
    }

    updateRowText(e) {
        const csvSourceName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CSV_SOURCE_EDIT_VALUE_CHANGED, csvSourceName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'CsvSource'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.CSV_SOURCE_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'CsvSource'});
    }

    saveEdit() {
        SystemActions.updateCsvSource(this.props.dispatch, this.props.csvSourceKeyInSelectMode, this.props.csvSourceTextBeingEdited);
    }

    isSystemSource() {
        this.systemSource = (this.props.item.system_name == null || this.props.item.system_name == undefined)? false : true;
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>
                            <span>{this.props.item.name}</span>
                        </span>
                        <span className={"pull-left edit-buttons" + (this.systemSource || this.props.isCsvSourceInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.csv_sources.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.csv_sources.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className='edit-mode-tr' style={this.props.style}>
                    <td className="row">
                        <input type="text" className="form-control col-md-9" value={this.props.csvSourceTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                        <span className="pull-left edit-buttons col-md-3">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} 
                                    disabled={(this.props.dirty && this.props.csvSourceTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                    title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    render() {
        this.isSystemSource();
        if (this.props.isCsvSourceInEditMode && this.props.item.key === this.props.csvSourceKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isCsvSourceInEditMode: state.system.listsScreen.voterTab.isCsvSourceInEditMode,
        csvSourceKeyInSelectMode: state.system.listsScreen.voterTab.csvSourceKeyInSelectMode,
        csvSourceTextBeingEdited: state.system.listsScreen.voterTab.csvSourceTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(CsvSourceRow));