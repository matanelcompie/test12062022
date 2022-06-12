import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import ModalWindow from './ModalWindow';

import * as SystemActions from  '../../actions/SystemActions';

/**
 * This component is a global Modal
 * for changing user password.
 *
 * The component recieves as a parameter an
 * object of user fields were 2 fields
 * must be in the object: key
 * Example:  <div className="col-md-12 no-padding">
 *              <ModalChangePassword item={this.props.voterSystemUser}/>
 *           </div>
 *
 * The event function which invokes an event of showing the Modal,
 * should pass the type and the current user's password
 *
 * Example:
 *   showResetPasswordModalDialog() {
 *       this.props.dispatch({type: SystemActions.ActionTypes.USERS.SHOW_RESET_PASSWORD_MODAL});
 *   }
 */
class ModalChangePassword extends React.Component {

    /**
     * This function calls a function
     * which doea an Ajax call for
     * updating the user's password.
     */
    changeToNewPassword() {
        if ( !this.validInputs ) {
            return;
        }

        let password = this.props.password;

        this.hideResetPasswordModalDialog();

        SystemActions.savePassword(this.props.dispatch, this.props.router,
                                   this.props.item.key, password);
    }

    /**
     * This function hides the reset
     * password modal.
     */
    hideResetPasswordModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.HIDE_RESET_PASSWORD_MODAL});
    }

    /**
     * This function invoked by event of
     * password change.
     *
     * @param e
     */
    passwordChange(e) {
        var password = e.target.value;

        this.props.dispatch({type: SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_PASSWORD,
                             password: password
                           });
    }

    /**
     * This function invoked by event of
     * confirm password change.
     *
     * @param e
     */
    confirmPasswordChange(e) {
        var confirmPassword = e.target.value;

        this.props.dispatch({type: SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_CONFIRM_PASSWORD,
                             confirmPassword: confirmPassword
        });
    }

    validateVariables() {
        this.validInputs = true;

        let password = this.props.password;
        if ( 0 == password.length ) {
            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.flatStylePassword.borderColor = this.borderColor.valid;
        }

        let confirmPassword = this.props.confirmPassword;
        if ( 0 == confirmPassword.length ) {
            this.flatStylePasswordAgain.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.flatStylePasswordAgain.borderColor = this.borderColor.valid;
        }

        if ( password != confirmPassword ) {
            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.flatStylePasswordAgain.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }
    }

    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#ff0000'
        }

        this.modalTitle = 'איפוס סיסמא';
        this.newPasswordLabel = 'סיסמא חדשה :';
        this.confirmPasswordLabel = 'אישור סיסמא:';
        this.identicalPasswordsText = "* יש להזין סיסמאות זהות ולא ריקות";

        this.flatStylePassword = {
            borderColor: this.borderColor.valid
        }

        this.flatStylePasswordAgain = {
            borderColor: this.borderColor.valid
        }
    }

    render() {

        this.initVariables();

        this.validateVariables();

        return (
            <ModalWindow show={this.props.showResetPasswordModal} title={this.modalTitle}
                         buttonOk={this.changeToNewPassword.bind(this)}
                         buttonCancel={this.hideResetPasswordModalDialog.bind(this)}>
                <div>
                    <div className="row">
                        <div className="col-md-6">{this.newPasswordLabel}</div>
                        <div className="col-md-6">
                            <div className="input-group input-group-sm">
                                <input ref="password" type="password" className="form-control"
                                       style={this.flatStylePassword}
                                       value={this.props.password}
                                       onChange={this.passwordChange.bind(this)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12"></div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">{this.confirmPasswordLabel}</div>

                        <div className="col-md-6">
                            <div className="input-group input-group-sm">
                                <input type="password" ref="passwordAgain" className="form-control"
                                       style={this.flatStylePasswordAgain}
                                       value={this.props.confirmPassword}
                                       onChange={this.confirmPasswordChange.bind(this)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">{this.identicalPasswordsText}</div>
                    </div>
                </div>
            </ModalWindow>
        )
    }
}


function mapStateToProps(state) {
    return {
        modalHeaderText: state.system.userScreen.modalHeaderText,
        password: state.system.userScreen.password,
        confirmPassword: state.system.userScreen.confirmPassword,
        modalContentText: state.system.userScreen.modalContentText,
        showResetPasswordModal: state.system.userScreen.showResetPasswordModal
    }
}

export default connect(mapStateToProps)(withRouter(ModalChangePassword))