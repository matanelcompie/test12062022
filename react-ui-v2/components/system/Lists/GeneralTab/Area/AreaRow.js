import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class AreaRow extends React.Component {
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
        const areakey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.AREA_DELETE_MODE_UPDATED, areakey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_AREA_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const areakey = this.props.item.key;
        const areaName = this.props.item.name;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.AREA_EDIT_MODE_UPDATED, areakey, areaName});
    }

    updateRowText(e) {
        const areaName = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.AREA_EDIT_VALUE_CHANGED, areaName});
        this.props.dispatch({type: SystemActions.ActionTypes.SET_DIRTY, target: 'area'});

    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.AREA_EDIT_MODE_UPDATED});
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'area'});
    }

    saveEdit() {
        SystemActions.updateArea(store, this.props.areaKeyInSelectMode, this.props.areaTextBeingEdited);
    }

    loadSubAreas() {
        if (this.props.isAreaInEditMode == false) {
            const key = this.props.item.key;
            const id = this.props.item.id;
            const areaName = this.props.item.name;

            SystemActions.loadSubAreas(store, key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_SUBAREAS, key, id, areaName});
        }
    }

    highlight() {
        if (this.props.isSubAreasDisplayed == true && this.props.item.key == this.props.areaKeyInSelectMode) {
            return 'lists-row success';
        }
        return 'lists-row';
    }

    renderDisplayMode() {
        return(
                <tr onClick={this.loadSubAreas.bind(this)} className={this.highlight()}>
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isAreaInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.delete']) ? '' : ' hidden')} 
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
                            <input type="text" className="form-control" value={this.props.areaTextBeingEdited} onChange={this.updateRowText.bind(this)}/>        
                        </div>
                        <div className="col-md-4">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" disabled={(this.props.dirty && this.props.areaTextBeingEdited.length >= 2 ? "" : "disabled")} 
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
        if (this.props.isAreaInEditMode && this.props.item.key === this.props.areaKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }
        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isAreaInEditMode: state.system.listsScreen.generalTab.isAreaInEditMode,
        areaKeyInSelectMode: state.system.listsScreen.generalTab.areaKeyInSelectMode,
        areaTextBeingEdited: state.system.listsScreen.generalTab.areaTextBeingEdited,
        isSubAreasDisplayed: state.system.listsScreen.generalTab.isSubAreasDisplayed,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(AreaRow));