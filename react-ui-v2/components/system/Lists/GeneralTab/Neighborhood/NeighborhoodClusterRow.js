import React from 'react';
import { connect } from 'react-redux';
import store from 'store';

import * as SystemActions from '../../../../../actions/SystemActions';


class NeighborhoodClusterRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clusterName: '',
            clusterPrefix: ''
        }
        this.textIgniter();
    }
    componentWillReceiveProps(nextProps) {
        let wasInEditmode = this.props.index == this.props.clusterEditRowIndex;
        let inEditMode = nextProps.index == nextProps.clusterEditRowIndex;

        if (wasInEditmode && !inEditMode) {
            this.clearFileds();
        }
    }
    clearFileds() {
        this.setState({ clusterName: '', clusterPrefix: '' });
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
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_CLUSTER_DELETE_MODE_UPDATED, clusterKey: this.props.item.key });
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_CLUSTER_MODAL_DIALOG_DISPLAY });
    }
    editRow() {
        this.setState({ clusterName: this.props.item.name, clusterPrefix: this.props.item.prefix || '' });
        this.props.editClusterRow(this.props.index);

    }

    updateRowText(type, e) {
        let newState = {};
        newState[type] = e.target.value;
        this.setState(newState);
    }
    cancelEditMode() {
        this.clearFileds();
        this.props.editClusterRow(null);

    }
    saveEdit() {
        let name = this.state.clusterName;
        let prefix = this.state.clusterPrefix;
        if (name.length > 3) {
            let requestData = { name, prefix };
            SystemActions.updateCluster(store, this.props.neighborhoodKey, this.props.cityKey, this.props.item.key, requestData);
            this.clearFileds();
            this.props.editClusterRow(null);
        }
    }
    renderEditMode() {
        let notValidName = this.state.clusterName.length < 2;
        let prefixLen = this.state.clusterPrefix.length;
        let notValidPrefix = (prefixLen > 1 || prefixLen == 0) ? false : true;
        // let isNameExistInTheList = this.props.isNameExistInClusterList(this.state.clusterName);
        let detailsChanged = this.props.item.name != this.state.clusterName || this.props.item.prefix != this.state.clusterPrefix;
        // console.log( notValidName, nameChanged ,this.state.clusterName.length,this.state.clusterName);

        return (
            <tr className="edit-mode-tr" >
                <td>
                    <div className="row no-margin">
                        <div className="col-md-3" style={{ padding: 0 }}>
                            <input type="text" className="form-control" value={this.state.clusterPrefix} onChange={this.updateRowText.bind(this, 'clusterPrefix')} placeholder="תחילית" />
                        </div>
                        <div className="col-md-1" style={{ fontSize: '24px' }}>-</div>
                        <div className="col-md-5" style={{ padding: 0 }}>
                            <input type="text" className="form-control" value={this.state.clusterName} onChange={this.updateRowText.bind(this, 'clusterName')}
                                style={notValidName ? { borderColor: 'red' } : {}} placeholder="שם" />
                        </div>
                        <div className="col-md-3">
                            <span className="pull-left edit-buttons">
                                <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}
                                    disabled={notValidName || notValidPrefix || !detailsChanged}>
                                    <i className="fa fa-floppy-o"></i></button>&nbsp;
                                <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}>
                                    <i className="fa fa-times"></i></button>
                            </span>
                        </div>

                    </div>

                </td>
            </tr>
        );
    }
    renderDisplayMode() {
        let editPermission = (this.props.currentUser.admin || (this.props.currentUser.permissions['system.lists.general.neighborhoods.edit']));
        let deletePermission = (this.props.currentUser.admin || (this.props.currentUser.permissions['system.lists.general.neighborhoods.delete']));
        let clusterPrefix = (this.props.item.prefix && this.props.item.prefix != '') ? this.props.item.prefix + ' - ' : '';
        let inEditOtherRow = this.props.clusterEditRowIndex != null;
        return (
            <tr className="lists-row" style={{ cursor: 'pointer' }}>
                <td>
                    <span>{clusterPrefix + this.props.item.name}</span>
                    <span className="pull-left">
                        <label style={{ margin: '0 10px 2px 0' }}>
                            <input type="checkbox" checked={this.props.isSelected || false} onChange={this.props.clusterSelected} disabled={inEditOtherRow} />
                        </label>
                    </span>
                    <span className="pull-left edit-buttons">
                        <button type="button" className={"btn btn-success btn-xs" + (editPermission ? '' : ' hidden')}
                            onClick={this.editRow.bind(this)} title={this.textValues.editTitle}
                            disabled={inEditOtherRow}>
                            <i className="fa fa-pencil-square-o"></i></button>&nbsp;
                        {this.props.neighborhoodKey && <button type="button" className={"btn btn-danger btn-xs" + (deletePermission ? '' : ' hidden')}
                            onClick={this.deleteRow.bind(this)} title={this.textValues.deleteTitle}
                            disabled={inEditOtherRow}>
                            <i className="fa fa-trash-o"></i></button>}
                    </span>
                </td>
            </tr>
        );
    }
    render() {
        let inEditMode = this.props.index == this.props.clusterEditRowIndex;
        if (!inEditMode) {
            return this.renderDisplayMode();
        } else {
            return this.renderEditMode();
        }
    }
}

export default connect()(NeighborhoodClusterRow);