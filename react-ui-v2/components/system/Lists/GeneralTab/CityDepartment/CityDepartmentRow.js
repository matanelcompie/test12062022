import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from 'actions/SystemActions';

class CityDepartmentRow extends React.Component {
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
        };
    }

    deleteRow() {
        this.props.updateScrollPosition();
        const cityDepartmentKey = this.props.item.key;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_DELETE_MODE_UPDATED, cityDepartmentKey });
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_DEPARTMENT_MODAL_DIALOG_DISPLAY });
    }

    editRow() {
        this.props.updateScrollPosition();
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_EDIT_MODE_UPDATED, item: this.props.item });
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_EDIT_VALUE_CHANGED, key, value });
        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'cityDepartment' });
    }

    cancelEditMode() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_EDIT_MODE_UPDATED });
        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'cityDepartment' });
    }

    saveEdit() {
        SystemActions.updateCityDepartment(this.props.dispatch, this.props.cityDepartmentKeyInSelectMode, this.props.cityDepartmentInEditMode);
    }

    renderDisplayMode() {
        return (
            <tr className="lists-row">
                <td>
                {this.props.item.name}
                    <span className={"pull-left edit-buttons" + (this.props.isInEditMode ? " hidden" : "")}>
                        <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.city_departments.edit']) ? '' : ' hidden')}
                            onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.city_departments.delete']) ? '' : ' hidden')}
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
                    <div className="col-md-8 checkbox">
                        <input type="text" className="form-control" value={this.props.cityDepartmentInEditMode.name} onChange={this.updateRowText.bind(this, 'name')} />
                    </div>
                    <div className="col-md-4">
                        <span className="pull-left edit-buttons">
                            <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}
                                disabled={(!this.props.dirty || this.props.isNameExistInTheList(this.props.cityDepartmentInEditMode.name) || (this.props.cityDepartmentInEditMode.name.length >= 2) ? "" : "disabled")}>
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
        isCityDepartmentInEditMode: state.system.listsScreen.generalTab.isCityDepartmentInEditMode,
        cityDepartmentKeyInSelectMode: state.system.listsScreen.generalTab.cityDepartmentKeyInSelectMode,
        cityDepartmentInEditMode: state.system.listsScreen.generalTab.cityDepartmentInEditMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(CityDepartmentRow));