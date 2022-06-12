import React from 'react';
import {connect} from 'react-redux';
// import {withRouter} from 'react-router';

import ModalWindow from '../global/ModalWindow';

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
class ModalHeaderChangePassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // disable status of the
            // modal's OK button
            disabledOkStatus: true
        };

        this.initConstants();
    }

    initConstants() {
        this.weakStyle = {color: 'red'};
        this.strongStyle = {color: 'green'};

        this.passwordStrengthTexts = {
            upper: 'אות גדולה',
            lower: 'אות קטנה',
            digit: 'מספרים',
            length: 'אורך',
            match: 'תאימות ססמאות',
            old: 'סיסמא ישנה שונה מסיסמא חדשה'
        };

        this.passwordStrengthIcons = {
            strong: window.Laravel.baseURL + 'Images/icon-ok.png',
            weak: window.Laravel.baseURL + 'Images/icon-x.png'
        };
    }
  
    checkPasswordLength(password) {
        return (password.length >= 5);
    }

    checkPasswordDigit(password) {
        return (password.match(/[0-9]/));
    }

    checkPasswordLowerCase(password) {
        return (password.match(/[a-z]/));
    }

    checkPasswordUpperCase(password) {
        return (password.match(/[A-Z]/));
    }


    /**
     * This function calls a function
     * which doea an Ajax call for
     * updating the user's password.
     */
    changeToNewPassword() {

        let changePasswordModalOtherUser = this.props.changePasswordModalOtherUser;
        if ( !this.validInputs ) {
            return;
        }

        let newPassword = this.props.password;
        let oldPassword = this.props.oldPassword;

        let otherUserKey = (changePasswordModalOtherUser && changePasswordModalOtherUser.key) ? changePasswordModalOtherUser.key : null
        if (this.props.password.length < 4){
            return;
        } 
        
        SystemActions.changeUserPassword(this.props.dispatch , oldPassword, newPassword, otherUserKey);
    }

    /**
     * This function hides the reset
     * password modal.
     */
    hideResetPasswordModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.HIDE_RESET_PASSWORD_MODAL});
        this.props.dispatch({type: SystemActions.ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE,  errorMessage: ''});  
    }

    /**
     * This function invoked by event of
     * password change.
     *
     * @param e
     */
    oldPasswordChange(e) {
        var oldPassword = e.target.value;

        this.props.dispatch({type: SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_OLD_PASSWORD,
                             oldPassword: oldPassword
                           });
        this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE, errorMessage: '' });

        let passwordFields = {
            oldPassword,
            password: this.props.password,
            confirmPassword: this.props.confirmPassword
        };
        this.validateVariablesForButton(passwordFields);
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
        this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE, errorMessage: '' });

        let passwordFields = {
            oldPassword: this.props.oldPassword,
            password,
            confirmPassword: this.props.confirmPassword
        };
        this.validateVariablesForButton(passwordFields);
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
        this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE, errorMessage: '' });

        let passwordFields = {
            oldPassword: this.props.oldPassword,
            password: this.props.password,
            confirmPassword
        };
        this.validateVariablesForButton(passwordFields);
    }

    validateVariablesForButton(passwordFields) {
        let oldPassword = passwordFields.oldPassword;
        let password = passwordFields.password;
        let confirmPassword = passwordFields.confirmPassword;

        let validInputs = true;

        let changePasswordModalOtherUser = this.props.changePasswordModalOtherUser;
        if ( 0 == oldPassword.length  && !changePasswordModalOtherUser) {
            validInputs = false;
        }

        if (oldPassword == password && !changePasswordModalOtherUser) {
            validInputs = false;
        }

        if ( !this.checkPasswordUpperCase(password) ) {
            validInputs = false;
        }

        if ( !this.checkPasswordLowerCase(password) ) {
            validInputs = false;
        }

        if ( !this.checkPasswordDigit(password) ) {
            validInputs = false;
        }

        if ( !this.checkPasswordLength(password) ) {
            validInputs = false;
        }

        if ( password.length == 0 && confirmPassword.length == 0) {
            validInputs = false;
        } else if ( password != confirmPassword ) {
            validInputs = false;
        }

        this.setState({disabledOkStatus: !validInputs});
    }

    validateVariables() {
        this.validInputs = true;

        let oldPassword = this.props.oldPassword;
        let password = this.props.password;
        let confirmPassword = this.props.confirmPassword;

        let changePasswordModalOtherUser = this.props.changePasswordModalOtherUser;

        if ( 0 == oldPassword.length && !changePasswordModalOtherUser) {
            this.flatStyleOldPassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }

        if (oldPassword == password && !changePasswordModalOtherUser) {
            this.passwordStrengthParams.old.style = this.weakStyle;
            this.passwordStrengthParams.old.icon = this.passwordStrengthIcons.weak;

            this.flatStyleOldPassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }


        if ( !this.checkPasswordUpperCase(password) ) {
            this.passwordStrengthParams.upper.style = this.weakStyle;
            this.passwordStrengthParams.upper.icon = this.passwordStrengthIcons.weak;

            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }

        if ( !this.checkPasswordLowerCase(password) ) {
            this.passwordStrengthParams.lower.style = this.weakStyle;
            this.passwordStrengthParams.lower.icon = this.passwordStrengthIcons.weak;

            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }

        if ( !this.checkPasswordDigit(password) ) {
            this.passwordStrengthParams.digit.style = this.weakStyle;
            this.passwordStrengthParams.digit.icon = this.passwordStrengthIcons.weak;

            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }

        if ( !this.checkPasswordLength(password) ) {
            this.passwordStrengthParams.length.style = this.weakStyle;
            this.passwordStrengthParams.length.icon = this.passwordStrengthIcons.weak;

            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }

        if ( password.length == 0 && confirmPassword.length == 0) {
            this.passwordStrengthParams.match.style = this.weakStyle;
            this.passwordStrengthParams.match.icon = this.passwordStrengthIcons.weak;

            this.flatStylePasswordAgain.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else if ( password != confirmPassword ) {
            this.passwordStrengthParams.match.style = this.weakStyle;
            this.passwordStrengthParams.match.icon = this.passwordStrengthIcons.weak;


            this.flatStylePassword.borderColor = this.borderColor.inValid;
            this.flatStylePasswordAgain.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        }
    }

    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#ff0000'
        };

        this.modalTitle = 'שינוי סיסמא';
        this.oldPasswordLabel = 'סיסמא ישנה :';
        this.newPasswordLabel = 'סיסמא חדשה :';
        this.confirmPasswordLabel = 'אישור סיסמא:';

        this.flatStyleOldPassword = {
            borderColor: this.borderColor.valid
        };

        this.flatStylePassword = {
            borderColor: this.borderColor.valid
        };

        this.flatStylePasswordAgain = {
            borderColor: this.borderColor.valid
        };

        this.passwordStrengthParams = {
            upper: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong},
            lower: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong},
            digit: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong},
            length: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong},
            match: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong},
            old: {style: this.strongStyle, icon: this.passwordStrengthIcons.strong}
        }
    }

    render() {

        this.initVariables();
        this.validateVariables();
        let changePasswordModalOtherUser = this.props.changePasswordModalOtherUser;
        let modalTitle = this.modalTitle;
        if(changePasswordModalOtherUser){
            modalTitle += (' :למשתמש ' + changePasswordModalOtherUser.full_name);
        }
 
        return (
            <ModalWindow show={this.props.showHeaderChangePasswordModal} title={modalTitle}
                         buttonOk={this.changeToNewPassword.bind(this)}
                         buttonCancel={this.hideResetPasswordModalDialog.bind(this)}
                         buttonX={this.hideResetPasswordModalDialog.bind(this)}
                         disabledOkStatus={this.state.disabledOkStatus}>
                <div>

                    { !changePasswordModalOtherUser && 
                        <div className="row form-group">
                            <div className="col-md-6">{this.oldPasswordLabel}</div>
                            <div className="col-md-6">
                                <div className="input-group input-group-sm">
                                    <input ref="oldPassword" type="password" className="form-control"
                                        style={this.flatStyleOldPassword}
                                        // value={this.props.oldPassword}
                                        onChange={this.oldPasswordChange.bind(this)}
                                    />
                                </div>
                            </div>
                        </div> 
                    }

                    <div className="row">
                        <div className="col-md-12"></div>
                    </div>


                    <div className="row form-group">
                        <div className="col-md-6">{this.newPasswordLabel}</div>
                        <div className="col-md-6">
                            <div className="input-group input-group-sm">
                                <input ref="password" type="password" className="form-control" minLength="4" required
                                       style={this.flatStylePassword}
                                       value={this.props.password}
                                       onChange={this.passwordChange.bind(this)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row form-group form-group">                    
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

                    <div className="row form-group">
                        <div className="col-md-12" style={this.passwordStrengthParams.upper.style}>
                            {this.passwordStrengthTexts.upper}: <img src={this.passwordStrengthParams.upper.icon}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12" style={this.passwordStrengthParams.lower.style}>
                            {this.passwordStrengthTexts.lower}: <img src={this.passwordStrengthParams.lower.icon}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12" style={this.passwordStrengthParams.digit.style}>
                            {this.passwordStrengthTexts.digit}: <img src={this.passwordStrengthParams.digit.icon}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12" style={this.passwordStrengthParams.length.style}>
                            {this.passwordStrengthTexts.length}: {this.props.password.length} <img src={this.passwordStrengthParams.length.icon}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12" style={this.passwordStrengthParams.match.style}>
                            {this.passwordStrengthTexts.match}: <img src={this.passwordStrengthParams.match.icon}/>
                        </div>
                    </div>
                    { !changePasswordModalOtherUser && 
                        <div className="row form-group">
                            <div className="col-md-12" style={this.passwordStrengthParams.old.style}>
                                {this.passwordStrengthTexts.old}: <img src={this.passwordStrengthParams.old.icon}/>
                            </div>
                        </div>
                    }
                    <div className="row">
                        <div className="col-md-12" style={{color: 'red', fontWeight: 'bold'}}>
                            {this.props.modalDialogErrorMessage}
                        </div>
                    </div>
                </div>
            </ModalWindow>
        )
    }
}


function mapStateToProps(state) {
    return {
		currentUser: state.system.currentUser,
        modalHeaderText: state.system.userScreen.modalHeaderText,
        oldPassword: state.system.userScreen.oldPassword,
        password: state.system.userScreen.password,
        confirmPassword: state.system.userScreen.confirmPassword,
        modalContentText: state.system.userScreen.modalContentText,
        showHeaderChangePasswordModal: state.system.userScreen.showHeaderChangePasswordModal,
        changePasswordModalOtherUser: state.system.userScreen.changePasswordModalOtherUser,
        modalDialogErrorMessage: state.system.modalDialogErrorMessage
    }
}

export default connect(mapStateToProps)(ModalHeaderChangePassword)