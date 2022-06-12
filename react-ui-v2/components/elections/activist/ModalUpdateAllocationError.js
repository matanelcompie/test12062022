import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from 'components/global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';


class ModalUpdateAllocationError extends React.Component {
    closeErrorMsgModalDialog() {
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY,
                             displayError: false, errorMessage: ''});
    }

    render() {
        return (
            <div className="modal-update-allocation-error modal-lg">
                <ModalWindow show={this.props.displayError} buttonX={this.closeErrorMsgModalDialog.bind(this)}
                             buttonOk={this.closeErrorMsgModalDialog.bind(this)} title='הודעה'>
                    <div style={{color: '#cc0000'}}>{this.props.errorMessage}</div>
                </ModalWindow>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        displayError: state.elections.activistsScreen.modalUpdateAllocationError.displayError,
        errorMessage: state.elections.activistsScreen.modalUpdateAllocationError.errorMessage
    };
}

export default connect(mapStateToProps)(ModalUpdateAllocationError);