import React from 'react';
import * as SystemActions from '../actions/SystemActions';
import Header from './Header';
import Breadcrumbs from './Breadcrombs';
import Footer from './Footer';
import Menu from './Menu';
import Baloon from './global/Baloon'
import { connect } from 'react-redux';
import VoterDialerWindow from './global/VoterWebDialer/VoterDialerWindow';
import ModalWindow from './global/ModalWindow';
import ModalMaintenance from './global/ModalMaintenance'
import ModalMaintenanceWarning from './global/ModalMaintenanceWarning'
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import flow from 'lodash/flow';
import { withRouter } from 'react-router';

class App extends React.Component {

    componentWillMount() {
        document.title = this.props.systemTitle + " - " + this.props.baseSystemTitle;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.systemTitle != nextProps.systemTitle) {
            document.title = nextProps.systemTitle + " - " + this.props.baseSystemTitle;
        }
    }

    //if scrollbar div is present calculate scrollbar width and send it to state
    componentDidMount() {
        var scrollDiv = this.refs.scrollbarDiv;
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        this.props.dispatch({type: SystemActions.ActionTypes.SET_SCROLLBAR_WIDTH, scrollbarWidth: scrollbarWidth});
    }
    //set div for getting scrollbar width
    setScrollbarTest() {
        var scrollDivStyle = {
            position: "absolute",
            top: "-999px",
            height: "50px",
            overflow: "scroll"
        }
        if (this.props.scrollbarWidth == 0) {
            return <div ref="scrollbarDiv" style={scrollDivStyle}></div>
        } else {
            return;
        }
    }

    ignoreDirty() {
        this.props.dispatch({type: SystemActions.ActionTypes.SAVE_CHANGES_MODAL_HIDE});
        this.props.dispatch({type: SystemActions.ActionTypes.IGNORE_DIRTY});
    }

    closeSaveChangesModal() {
        this.props.dispatch({type: SystemActions.ActionTypes.SAVE_CHANGES_MODAL_HIDE});
    }

    closeErrorMsgModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: false, errorMessage: ''});
    }

    closeSavedBaloon() {
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_CHANGES_SAVED});
    }

    closeNotSavedBaloon() {
        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_CHANGES_NOT_SAVED});
    }

    maintenanceModal() {
        if (this.props.maintenanceMode) {
            return (
                <ModalMaintenance/>
            )
        } else {
            return "";
        }
    }

    maintenanceWarningModal() {
        if (this.props.maintenanceDate != null) {
            return (
                <ModalMaintenanceWarning/>
            )
        } else {
            return "";
        }        
    }

    render() {
        return (
                <div>
                    <Header/>
                    <Menu/>
                    <div className="stripMain">
                        <div className="container">
                            <Breadcrumbs/>
                            {this.props.children}
                        </div>
                    </div>
                    <Footer/>
                    {this.setScrollbarTest()}
                    <ModalWindow show={this.props.saveChangesModalShow} title="שמירת שינויים" buttonOk={this.ignoreDirty.bind(this)} buttonCancel={this.closeSaveChangesModal.bind(this)} buttonX={this.closeSaveChangesModal.bind(this)}>
                        <div>
                            ישנם שינויים שלא נשמרו. האם את/ה בטוח/ה?
                        </div>
                    </ModalWindow>
                    <ModalWindow show={this.props.displayErrorModalDialog} buttonX={this.closeErrorMsgModalDialog.bind(this)}
                                 buttonOk={this.closeErrorMsgModalDialog.bind(this)} title='הודעה'>
                        <div>{this.props.modalDialogErrorMessage}</div>
                    </ModalWindow>
                    {this.maintenanceWarningModal()}
                    {this.maintenanceModal()}
                    <Baloon type="success" text="נתונים נשמרו" show={this.props.changesSaved} onClick={this.closeSavedBaloon.bind(this)} timeout={3000} timeoutAction={this.closeSavedBaloon.bind(this)}/>
                    <Baloon type="error" text="נתונים לא נשמרו" show={this.props.changesNotSaved} onClick={this.closeNotSavedBaloon.bind(this)} timeout={3000} timeoutAction={this.closeNotSavedBaloon.bind(this)}/>
                    <Baloon type="loading" text="שומר נתונים" show={this.props.savingChanges}/>
                    {this.props.displayDialWindow && <VoterDialerWindow />}
                
            </div>
                )
    }
}

function mapStateToProps(state) {
    return {
        scrollbarWidth: state.system.scrollbarWidth,
        systemTitle: state.system.systemTitle,
        baseSystemTitle: state.system.baseSystemTitle,
        saveChangesModalShow: state.system.saveChangesModalShow,
        displayErrorModalDialog: state.system.displayErrorModalDialog,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage,
        savingChanges: state.system.savingChanges,
        changesSaved: state.system.changesSaved,
        changesNotSaved: state.system.changesNotSaved,
        maintenanceMode: state.system.maintenanceMode,
        maintenanceDate: state.system.maintenanceDate,
        displayDialWindow: state.voters.voterScreen.displayDialWindow
    }
}

export default flow(
        DragDropContext(HTML5Backend),
        connect(mapStateToProps)
        )(withRouter(App));
