import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class CountryRow extends React.Component {
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
        const countrykey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.COUNTRY_DELETE_MODE_UPDATED, countrykey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_COUNTRY_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const countrykey = this.props.item.key;
        const countryName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.COUNTRY_EDIT_MODE_UPDATED, countrykey, countryName});
    }

    updateRowText(e) {
        const countryName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.COUNTRY_EDIT_VALUE_CHANGED, countryName});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'country'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.COUNTRY_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'country'});
    }

    saveEdit() {
        SystemActions.updateCountry(store, this.props.countryKeyInSelectMode, this.props.countryTextBeingEdited);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isCountryInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.countries.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.countries.delete']) ? '' : ' hidden')} 
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
                        <div className="row no-margin">
                            <div className="col-md-6">
                                <input type="text" className="form-control" value={this.props.countryTextBeingEdited} onChange={this.updateRowText.bind(this)}/>
                            </div>
                            <div className="col-md-6">
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.countryTextBeingEdited.length >= 2 ? "" : "disabled")} 
                                    onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                
                        </div>
                
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isCountryInEditMode && this.props.item.key === this.props.countryKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }

        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isCountryInEditMode: state.system.listsScreen.generalTab.isCountryInEditMode,
        countryKeyInSelectMode: state.system.listsScreen.generalTab.countryKeyInSelectMode,
        countryTextBeingEdited: state.system.listsScreen.generalTab.countryTextBeingEdited,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(CountryRow));