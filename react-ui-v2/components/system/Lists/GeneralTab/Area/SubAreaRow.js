import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class SubAreaRow extends React.Component {
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
        const subAreakey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUBAREA_DELETE_MODE_UPDATED, subAreakey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUBAREA_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const item = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUBAREA_EDIT_MODE_UPDATED, item});
    }

    updateRowText(key, e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUBAREA_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'subArea'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.SUBAREA_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'subArea'});
    }

    saveEdit() {
        const item = this.props.subAreaInEditMode;
        const key = this.props.areaKeyInSelectMode;
        SystemActions.updateSubArea(store, item, key);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}
                        <span className={"pull-left edit-buttons" + (this.props.isSubAreaInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.sub_areas.edit']) ? '' : ' hidden')} 
                            onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.sub_areas.delete']) ? '' : ' hidden')} 
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
                        <div className="col-md-6">
                            <input type="text" className="form-control" value={this.props.subAreaInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                        </div>
                        <div className="col-md-6">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.subAreaInEditMode.name.length >= 2 ? "" : "disabled")} 
                                onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}><i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} 
                                        title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                            </span>
                        </div>
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isSubAreaInEditMode && this.props.item.key === this.props.subAreaKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isSubAreaInEditMode: state.system.listsScreen.generalTab.isSubAreaInEditMode,
        subAreaKeyInSelectMode: state.system.listsScreen.generalTab.subAreaKeyInSelectMode,
        subAreaInEditMode: state.system.listsScreen.generalTab.subAreaInEditMode,
        areaKeyInSelectMode: state.system.listsScreen.generalTab.areaKeyInSelectMode,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(SubAreaRow));