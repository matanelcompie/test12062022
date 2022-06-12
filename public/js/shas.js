if (typeof jQry != 'function') {
    var jQry = jQuery.noConflict();
}

jQry(document).ready(function () {

    let loginButton = jQry('#loginButton');
    let resetPasswordButton = jQry('#resetPasswordButton');
    let savePasswordButton = jQry('#savePasswordButton');
    let backToLoginLink = jQry('#backToLoginLink');
    let forgotPasswordLink = jQry('#forgotPasswordLink');
    let undoForgetPasswordLink = jQry('#undoForgetPasswordLink');
    let smsLoginButton = jQry('#smsLoginButton');
    let smsResetPasswordButton = jQry('#smsResetPasswordButton');
    let resendLoginSmsCodeLink = jQry('#resendLoginSmsCodeLink');
    let resendResetPasswordSmsCodeLink = jQry('#resendResetPasswordSmsCodeLink');

    let newPassword = jQry('#new_password');
    let validatePassword = jQry('#validate_password');

    let upperCaseImg = jQry('#uperCaseImg');
    let lowerCaseImg = jQry('#lowerCaseImg');
    let numberImg = jQry('#numberImg');
    let passwordLengthIndicator = jQry('#password_length_indicator');
    let lengthImg = jQry('#lengthImg');
    let matchImg = jQry('#matchImg');

    let passwordStrengthUpperCase = jQry('.password-strength #upper_case');
    let passwordStrengthLowerCase = jQry('.password-strength #lower_case');
    let passwordStrengthNumber = jQry('.password-strength #number');
    let passwordStrengthLength = jQry('.password-strength #length_check');
    let passwordStrengthMatch = jQry('.password-strength #match');


    loginButton.click(function (e) {
        e.preventDefault();
        doLogin();
    });

    smsLoginButton.click(function (e) {
        e.preventDefault();
        checkSms();
    });
    smsResetPasswordButton.click(function (e) {
        e.preventDefault();
        resetPasswordViaSms();
    });

    resendLoginSmsCodeLink.click(function(e) {
        e.preventDefault();
        resendLoginSmsCode();
    });
    resendResetPasswordSmsCodeLink.click(function(e) {
        e.preventDefault();
        resendResetPasswordSmsCode();
    });

    resetPasswordButton.click(function(e) {
        e.preventDefault();
        resetPassword();        
    });

    savePasswordButton.click(function(e) {
        e.preventDefault();
        resetingPassword();        
    });

    backToLoginLink.click(function(e) {
        e.preventDefault();
        backToLoginScreen();
    });

    forgotPasswordLink.click(function(e) {
        e.preventDefault();
        forgotPassword();        
    });

    undoForgetPasswordLink.click(function(e) {
        e.preventDefault();
        undoForgetPassword();        
    });

    newPassword.keyup(function (e) {

        let newPasswordValue = newPassword.val();
        let validatePasswordValue = validatePassword.val();

        let disabledButton = false;

        if ( checkNewPasswordUpper(newPasswordValue) ) {
            passwordStrengthUpperCase.removeClass('weak');
            passwordStrengthUpperCase.addClass('strong');

            upperCaseImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
        } else {
            passwordStrengthUpperCase.removeClass('strong');
            passwordStrengthUpperCase.addClass('weak');

            upperCaseImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            disabledButton = true;
        }

        if ( checkNewPasswordLower(newPasswordValue) ) {
            passwordStrengthLowerCase.removeClass('weak');
            passwordStrengthLowerCase.addClass('strong');

            lowerCaseImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
        } else {
            passwordStrengthLowerCase.removeClass('strong');
            passwordStrengthLowerCase.addClass('weak');

            lowerCaseImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            disabledButton = true;
        }

        if ( checkNewPasswordDigit(newPasswordValue) ) {
            passwordStrengthNumber.removeClass('weak');
            passwordStrengthNumber.addClass('strong');

            numberImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
        } else {
            passwordStrengthNumber.removeClass('strong');
            passwordStrengthNumber.addClass('weak');

            numberImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            disabledButton = true;
        }

        if ( checkNewPasswordLength(newPasswordValue) ) {
            passwordStrengthLength.removeClass('weak');
            passwordStrengthLength.addClass('strong');

            passwordLengthIndicator.text(newPasswordValue.length);
            lengthImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
        } else {
            passwordStrengthLength.removeClass('strong');
            passwordStrengthLength.addClass('weak');

            passwordLengthIndicator.text(newPasswordValue.length);
            lengthImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            disabledButton = true;
        }

        if ( newPasswordValue.length == 0 && validatePasswordValue.length == 0 ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( newPasswordValue == validatePasswordValue ) {
            passwordStrengthMatch.removeClass('weak');
            passwordStrengthMatch.addClass('strong');

            matchImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
        } else {
            passwordStrengthMatch.removeClass('strong');
            passwordStrengthMatch.addClass('weak');

            matchImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            disabledButton = true;
        }

        savePasswordButton.attr("disabled", disabledButton);
    });

    validatePassword.keyup(function (e) {
        let newPasswordValue = newPassword.val();
        let validatePasswordValue = validatePassword.val();

        if ( newPasswordValue.length == 0 && validatePasswordValue.length == 0 ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( !checkNewPasswordUpper(newPasswordValue) ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( !checkNewPasswordLower(newPasswordValue) ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( !checkNewPasswordDigit(newPasswordValue) ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( !checkNewPasswordLength(newPasswordValue) ) {
            savePasswordButton.attr("disabled", true);
            return;
        }

        if ( newPasswordValue == validatePasswordValue ) {
            passwordStrengthMatch.removeClass('weak');
            passwordStrengthMatch.addClass('strong');

            matchImg.attr("src", window.Laravel.baseURL + 'Images/icon-ok.png');
            savePasswordButton.attr("disabled", false);
        } else {
            passwordStrengthMatch.removeClass('strong');
            passwordStrengthMatch.addClass('weak');

            matchImg.attr("src", window.Laravel.baseURL + 'Images/icon-x.png');
            savePasswordButton.attr("disabled", true);
        }
    });
});

function backToLoginScreen(){
    window.location.href  = window.Laravel.baseURL + 'login';
}

/**
 * This function does the 2 login steps
 *   1. personal identity + password
 *   2. sms code.
 *
 *   If the ajax call returns the sms_code_login
 *   then the next login step should start.
 *   else if there is redirect value, then tje
 *   login succeeded.
 */
function doLogin() {
    let restM = 'post',
        urlTo = window.Laravel.baseURL + 'api/login',
        formData = null,
        loginForm = jQry('#loginFrm');
    formData = loginForm.serialize();
    jQry("#login_error").text("");

    jQry.ajax({
        type: restM,
        url: urlTo,
        data: formData,
        dataType: 'json',
        success: function (data) {
            if ((data.data.redirect != undefined) && (data.data.redirect != null)) {
                let redirect = window.Laravel.baseURL;
                if (redirect.slice(-1) != "/") redirect += "/";
                if (data.data.redirect.substring(0, 1) == "/") redirect += data.data.redirect.substring(1, data.data.redirect.length);
                else redirect += data.data.redirect;

                window.location.href = redirect;
            } else if (data.data.sms_code_login == 1) {
                // Starting the login step vis sms code
                // sms_code_login is the flag which indicates
                // to do the login step via sms
                startSmsLogin(false);
            } else {
                window.location.href = window.Laravel.baseURL;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage = jqXHR.responseJSON.message;
            jQry("#login_error").text(errorMessage);
        }
    });
}

/**
 * This function resends an sms code
 * for login step vis sms code
 */
function resendLoginSmsCode() {
    
    let urlTo = window.Laravel.baseURL + 'api/login',
        formData = null,
        loginForm = jQry('#loginFrm');
    formData = loginForm.serialize();
    
    resendSmsCodeSend(urlTo, formData)

}
/**
 * This function resends an sms code
 * for reset password via sms code
 */
function resendResetPasswordSmsCode() {
    
    let urlTo = window.Laravel.baseURL + 'api/login/resend-sms-code'

    resendSmsCodeSend(urlTo, []);
}
function resendSmsCodeSend(url, data){
    jQry("#sms_error").text("");
    $( "#smsCodeSentSuccessfuly" ).hide();

    jQry.ajax({
        type: 'post',
        url: url,
        data: data,
        dataType: 'json',
        success: function (data) {
            $( "#smsCodeSentSuccessfuly" ).show();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage = jqXHR.responseJSON.message;
            jQry("#sms_error").text(errorMessage);
        }
    });
}
/**
 * This function sends the sms code
 * in the login step vis sms code
 * sent to the user's mobile phone.
 */
function checkSms() {
    let restM = 'post',
        urlTo = window.Laravel.baseURL + 'api/login',
        formData = null,
        loginForm = jQry('#smsCodeFrm');
    formData = loginForm.serialize();
    jQry("#sms_error").text("");
    $( "#smsCodeSentSuccessfuly" ).hide();

    jQry.ajax({
        type: restM,
        url: urlTo,
        data: formData,
        dataType: 'json',
        success: function (data) {
            if ((data.data.redirect != undefined) && (data.data.redirect != null)) {
                let redirect = window.Laravel.baseURL;
                if (redirect.slice(-1) != "/") redirect += "/";
                if (data.data.redirect.substring(0, 1) == "/") redirect += data.data.redirect.substring(1, data.data.redirect.length);
                else redirect += data.data.redirect;

                window.location.href = redirect;
            } else {
                window.location.href = window.Laravel.baseURL;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage = jqXHR.responseJSON.message;
            jQry("#sms_error").text(errorMessage);
        }
    });
}
/**
 * This function sends the sms code
 * in the login step vis sms code
 * sent to the user's mobile phone.
 */
function resetPasswordViaSms() {
    let urlTo = window.Laravel.baseURL + 'api/login/reset-password-sms',
        formData = null,
        loginForm = jQry('#smsCodeFrm');
    formData = loginForm.serialize();
    jQry("#sms_error").text("");
    $( "#smsCodeSentSuccessfuly" ).hide();

    jQry.ajax({
        type: 'post',
        url: urlTo,
        data: formData,
        dataType: 'json',
        success: function (data) {
            if ((data.data.redirect != undefined) && (data.data.redirect != null)) {
                let redirect = window.Laravel.baseURL;
                if (redirect.slice(-1) != "/") redirect += "/";
                if (data.data.redirect.substring(0, 1) == "/") redirect += data.data.redirect.substring(1, data.data.redirect.length);
                else redirect += data.data.redirect;

                window.location.href = redirect;
            } 
        },
        error: function (jqXHR, textStatus, errorThrown) {
            var errorMessage = jqXHR.responseJSON.message;
            var errorData = jqXHR.responseJSON.data;
            jQry("#sms_error").text(errorMessage);
            var needToReloadPage = errorData ? errorData.need_to_reload_page: null;
            if(needToReloadPage){
                window.location.reload();
            }
        }
    });
}

function forgotPassword() {
   $( "#forgotPasswordBlock" ).hide();
   $( "#loginTitle" ).hide(); 
   $( "#loginTitleResetPassword" ).show();
   $( "#resetPasswordBlock" ).show();
   $( "#loginBlock").hide();
}

function undoForgetPassword() {
   $( "#forgotPasswordBlock" ).show();
   $( "#loginTitle" ).show(); 
   $( "#loginBlock").show();
   $( "#loginTitleResetPassword" ).hide();
   $( "#resetPasswordBlock" ).hide();

}


function sentMailSuccess(){
   $( "#resetPasswordBlock" ).hide();
   $( "#mailSentSuccessfuly" ).show();
}

function resetedPasswordSuccessfuly(){
    $( ".resetPasswordMessage" ).hide();
    $( "#resetPasswordScreen" ).hide();
    $( "#resetPasswordSuccessfuly" ).show();
}

function startSmsLogin(fromResetPassword) {
    $( "#forgotPasswordBlock" ).hide();
    $( "#loginTitle" ).hide();
    $( "#loginTitleResetPassword" ).hide();
    $( "#resetPasswordBlock" ).hide();
    $( "#loginBlock").hide();

    $( "#smsLoginTitle" ).show();
    $( "#smsCodedBlock" ).show();
    if(fromResetPassword){
        $( "#smsCodedBlock .reset_password_sms" ).show();
        $( "#smsCodedBlock .login_sms" ).hide();
    } else {
        $( "#smsCodedBlock .reset_password_sms" ).hide();
        $( "#smsCodedBlock .login_sms" ).show();
    }
    $( "#sms_code").focus();
}

//send user email with new reset password token
function resetPassword(){

    //let restM = 'post',
    urlTo = window.Laravel.baseURL + 'api/login/reset_password' ,
    formData = null,
    resetPasswordForm = jQry('#resetPasswordFrm');
    
    formData = resetPasswordForm.serialize();
    jQry("#error").text("");
    jQry.ajax({
    url: urlTo ,  
    type: 'POST',
    data: formData,
    dataType: 'json',
    success: function(result) {
        var resetPasswordMethod = $('.reset_password_method:checked').val();
        if(resetPasswordMethod == 'email'){
            sentMailSuccess();
        } else {
            if (result.data.sms_code_login == 1) {
                // Display Reset password form - via sms
                startSmsLogin(true);
            } 
        }
    },
    error: function (jqXHR, textStatus, errorThrown) {
        errorMessage = jqXHR.responseJSON.message;
        jQry("#error").text(errorMessage);
    }
});
}

function resetingPassword(){

    //let restM = 'post',
    resetingPasswordForm = jQry('#resetingPasswordFrm');
    formData = null;
    formData = resetingPasswordForm.serialize();
    let fromDataArray = formData.split('&');

    keyValue =  fromDataArray[0].split('=');
    urlTo = window.Laravel.baseURL + 'api/login/reset_password/' +  keyValue[1];

    jQry("#error").text("");
    jQry.ajax({
        url: urlTo ,
        type: 'PUT',
        data: formData,
        dataType: 'json',

        success: function(data) {
            resetedPasswordSuccessfuly();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage = jqXHR.responseJSON.message;
            jQry("#error").text(errorMessage);
        }
    });
}

function checkNewPasswordUpper(newPasswordValue) {
    return (newPasswordValue.match(/[A-Z]/));
}

function checkNewPasswordLower(newPasswordValue) {
    return (newPasswordValue.match(/[a-z]/));
}

function checkNewPasswordDigit(newPasswordValue) {
    return (newPasswordValue.match(/[0-9]/));
}

function checkNewPasswordLength(newPasswordValue) {
    return (newPasswordValue.length >= 5);
}