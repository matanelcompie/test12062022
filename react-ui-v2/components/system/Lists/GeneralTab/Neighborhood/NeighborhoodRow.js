import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';

class NeighborhoodRow extends React.Component {
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
        const neighborhoodkey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_DELETE_MODE_UPDATED, neighborhoodkey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_MODAL_DIALOG_DISPLAY});
    }

    editRow(e) {
        e.stopPropagation();
        this.props.updateScrollPosition();
        const neighborhood = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_EDIT_MODE_UPDATED, neighborhood});
    }

    updateRowText(e) {
        const name = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_EDIT_VALUE_CHANGED, name});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'neighborhood'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'neighborhood'});
    }

    saveEdit() {
        SystemActions.updateNeighborhood(store, this.props.neighborhoodInEditMode, this.props.neighborhoodCityKey);
    }

    loadNeighborhoodClusters() {
        SystemActions.loadNeighborhoodClusters(store, this.props.item.key);
    }

    renderDisplayMode() {
        return(
                <tr className={this.props.className} onClick={this.loadNeighborhoodClusters.bind(this)} style={{cursor:'pointer'}}>
                    <td>
                        <span>{this.props.item.name}</span>
                        <span className={"pull-left edit-buttons" + (this.props.isNeighborhoodInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.neighborhoods.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.neighborhoods.delete']) ? '' : ' hidden')} 
                                    onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}><i className="fa fa-trash-o"></i></button>
                        </span>
                    </td>
                </tr>
                );
    }

    renderEditMode() {
        return (
                <tr className={this.props.className}>
                    <td>
                        <div className="row no-margin">
                            <div className="col-md-6">
                                <input type="text" className="form-control" value={this.props.neighborhoodInEditMode.name} onChange={this.updateRowText.bind(this)}/>
                            </div>
                            <div className="col-md-6">
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                    disabled={(!this.props.dirty || this.props.isNameExistInTheList(this.props.neighborhoodInEditMode.name) || (this.props.neighborhoodInEditMode.name.length < 2))}>
                                        <i className="fa fa-floppy-o"></i>
                                    </button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                
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
        isNeighborhoodInEditMode: state.system.listsScreen.generalTab.isNeighborhoodInEditMode,
        neighborhoodInEditMode: state.system.listsScreen.generalTab.neighborhoodInEditMode,
        neighborhoodCityKey: state.system.listsScreen.generalTab.neighborhoodCityKey,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(NeighborhoodRow));