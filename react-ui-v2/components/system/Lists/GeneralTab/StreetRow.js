import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as SystemActions from '../../../../actions/SystemActions';

class StreetRow extends React.Component {

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
        const streetkey = this.props.item.key;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_DELETE_MODE_UPDATED, streetkey});
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_STREET_MODAL_DIALOG_DISPLAY});
    }

    editRow() {
        this.props.updateScrollPosition();
        const street = this.props.item;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_EDIT_MODE_UPDATED, street});
    }

    updateRowText(key, e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_EDIT_VALUE_CHANGED, key, value});
        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target:'street'});
    }

    cancelEditMode() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_EDIT_MODE_UPDATED});
        this.props.dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target:'street'});
    }

    saveEdit() {
        SystemActions.updateStreet(this.props.dispatch, this.props.streetInEditMode, this.props.streetCityKey);
    }

    renderDisplayMode() {
        return(
                <tr className="lists-row">
                    <td>{this.props.item.name}</td>
                    <td>
                        {this.props.item.mi_id}
                        <span className={"pull-left edit-buttons" + (this.props.isStreetInEditMode ? " hidden" : "")}>
                            <button type="button" className={"btn btn-success btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.streets.edit']) ? '' : ' hidden')} 
                                    onClick={this.editRow.bind(this)} title={this.textValues.editTitle}><i className="fa fa-pencil-square-o"></i></button>&nbsp;
                            <button type="button" className={"btn btn-danger btn-xs" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.streets.delete']) ? '' : ' hidden')} 
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
                        <input type="text" className="form-control" value={this.props.streetInEditMode.name} onChange={this.updateRowText.bind(this, 'name')}/>
                    </td>
                    <td>
                        <div className="row no-margin">
                            <div className="col-md-6">
                                <input type="text" className="form-control" value={this.props.streetInEditMode.mi_id} onChange={this.updateRowText.bind(this, 'mi_id')}/>
                            </div>
                            <div className="col-md-6">
                                <span className="pull-left edit-buttons">
                                    <button type="button" className="btn btn-success btn-xs" onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle} 
                                    disabled={(this.props.dirty && (this.props.streetInEditMode.name.length >= 2) ? "" : "disabled")} 
                                    ><i className="fa fa-floppy-o"></i></button>&nbsp;
                                    <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelEditMode.bind(this)} title={this.textValues.cancelTitle}><i className="fa fa-times"></i></button>
                                </span>
                            </div>
                
                        </div>
                
                    </td>
                </tr>
                );
    }

    render() {
        if (this.props.isStreetInEditMode && this.props.item.key === this.props.streetKeyInSelectMode) {
            /* EDIT MODE */
            return this.renderEditMode();
        }

        /* DISPLAY MODE */
        return this.renderDisplayMode();
    }
}

function mapStateToProps(state) {
    return {
        isStreetInEditMode: state.system.listsScreen.generalTab.isStreetInEditMode,
        streetKeyInSelectMode: state.system.listsScreen.generalTab.streetKeyInSelectMode,
        streetInEditMode: state.system.listsScreen.generalTab.streetInEditMode,
        streetCityKey: state.system.listsScreen.generalTab.streetCityKey,
        currentUser: state.system.currentUser,
        dirty: state.system.dirty,
    };
}
export default connect(mapStateToProps)(withRouter(StreetRow));