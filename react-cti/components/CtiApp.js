import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as campaignActions from 'actions/campaignActions';
import * as systemActions from 'actions/systemActions';
import * as types from 'actions/actionTypes';

import Baloon from './global/Baloon'
import ConfirmAlert from '../components/common/ConfirmAlert';
import ModalMaintenance from '../components/common/global/ModalMaintenance';
import ModalMaintenanceWarning from '../components/common/global/ModalMaintenanceWarning';
import ModalAudio from '../components/common/global/ModalAudio';
import ModalWindow from '../components/common/ModalWindow';
import WebSocket from './WebSocket';
import WebDialer from './WebDialer';


class CtiApp extends React.Component {
    constructor(props, context) {
        super(props, context);

        props.systemActions.getCurrentUser();
        props.campaignActions.getAllCampaigns();
        props.systemActions.getAllLists();

    }



    componentWillMount() {
        // Making sure that current user has been loaded
        //initiate audio input check
        this.checkAudioInput();
    }

    maintenanceModal() {
        if (this.props.maintenanceMode) {
            return ( <ModalMaintenance/> )
        } else { return ""; }
    }
    maintenanceDateModal() {
        if (this.props.maintenanceDate) {
            return ( <ModalMaintenanceWarning/> )
        } else { return ""; }
    }
    closeErrorMsgModalDialog() {
        this.props.systemActions.closeErrorMsgDialog();
    }

    /**
     * Show audio modal if needed
     *
     * @return void
     */
    showModalAudio() {
        if (!this.props.audioInput) {
            return (<ModalAudio buttonOk={this.checkAudioInput.bind(this)}/>)
        } else {
            return "";
        }
    }

    /**
     * Check if audio input exists
     *
     * @return void
     */
    checkAudioInput() {
        let _this = this;
        try{
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function() {
                if (!_this.props.audioInput) _this.props.systemActions.changeAudioInput(true);
            }, function() {
                if (_this.props.audioInput) _this.props.systemActions.changeAudioInput(false);
            });
        } catch(err){
             _this.props.systemActions.changeAudioInput(false);
        }

    }
    closeSavedBaloon() {
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_CHANGES_SAVED});
    }

    closeNotSavedBaloon() {
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_CHANGES_NOT_SAVED});
    }
    render() {
        return (
            <div>
                {this.props.children}
                <ConfirmAlert />
                <WebSocket />
                <WebDialer />
                {this.maintenanceModal()}
                {this.maintenanceDateModal()}
                <ModalWindow show={this.props.displayErrorModalDialog} buttonX={this.closeErrorMsgModalDialog.bind(this)}
                    buttonOk={this.closeErrorMsgModalDialog.bind(this)} title='הודעה'>
                    <div>{this.props.modalDialogErrorMessage}</div>
                </ModalWindow>
                {this.showModalAudio()}
                <Baloon type="success" text="נתונים נשמרו" show={this.props.changesSaved} onClick={this.closeSavedBaloon.bind(this)} timeout={3000} timeoutAction={this.closeSavedBaloon.bind(this)}/>
                <Baloon type="error" text="נתונים לא נשמרו" show={this.props.changesNotSaved} onClick={this.closeNotSavedBaloon.bind(this)} timeout={3000} timeoutAction={this.closeNotSavedBaloon.bind(this)}/>
                <Baloon type="loading" text="שומר נתונים" show={this.props.savingChanges}/>
            </div>
        );
    }

}
CtiApp.propTypes = {
};

function mapStateToProps(state, ownProps) {
    return {
        currentUser: state.system.currentUser,
        maintenanceMode: state.system.maintenanceMode,
        maintenanceDate: state.system.maintenanceDate,
        displayErrorModalDialog: state.system.displayErrorModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        audioInput: state.system.audioInput,
        changesSaved: state.system.changesSaved,
        changesNotSaved: state.system.changesNotSaved,
        savingChanges: state.system.savingChanges,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch),
        systemActions: bindActionCreators(systemActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {pure:false})(CtiApp);