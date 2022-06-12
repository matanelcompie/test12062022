@extends('layouts.app')

@section('content')

<a href="javascript:myFunc()">href</a>
<a href="#" onclick="javascript:myFunc()">onclick</a>
    <link rel="stylesheet" href="{{ URL::asset('css/login.css', $secure) }}">
    <div class="container-fluid">
        <div class="row"></div>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4 login-form">
                <div class="panel panel-default panel-primary">
                    <div class="panel-heading" >
                        <h3 class="panel-title" id="loginTitle">{{trans('menu.login_panel_title')}}</h3>
                        <h3 class="panel-title" id="loginTitleResetPassword" style="display:none">{{trans('menu.login_reset_password_title')}}</h3>
                        <h3 class="panel-title" id="smsLoginTitle" style="display:none">{{trans('menu.login_sms_title')}}</h3>
                    </div>
                    <div class="panel-body" id="loginBlock">
                        <form class="1form-horizontal" role="form" id="loginFrm" method="POST" action="">
                            {{ csrf_field() }}
                            <div class="form-group{{  $errors->has('personal_identity') ? ' has-error' : '' }}" id="forgotPasswordBlock">
                                <label for="personal_identity">{{trans('menu.identity_card')}}</label>
                                <input type="text" oninput="this.value=this.value.replace(/[^0-9]/g,'');" name="personal_identity" class="form-control" id="personal_identity" placeholder="{{Lang::get('menu.identity_card')}}"  required autofocus>
                            </div>
                            <div id="forgotPassword">
                                <div id="forgotPasswordBlock">
                                    <div class="form-group">
                                        <label for="password">{{trans('menu.password')}}</label>
                                        <input type="password" name="password" class="form-control" id="password" placeholder="{{Lang::get('menu.password')}}" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6" style="padding-right:0" >
                                            <button type="submit" id="loginButton" class="btn btn-primary">
                                                {{trans('menu.enter')}}
                                            </button>
                                        </div>
                                        <div class="col-md-6" style="text-align: left">
                                            <a href="#" id="forgotPasswordLink">{{trans('menu.is_forgot_password')}}</a>
                                        </div>
                                    </div>
                                    <span id="login_error"></span>
                                </div>                                
                            </div>
                        </form>
                    </div>
                    <div class="panel-body" id="resetPasswordBlock" style="display:none">
                        <form class="1form-horizontal" role="form" id="resetPasswordFrm"  method="POST" action="" >
                            <div class="form-group{{  $errors->has('personal_identity') ? ' has-error' : '' }}" >
                                <label for="personal_identity">{{trans('menu.identity_card')}}</label>
                                <input type="text" oninput="this.value=this.value.replace(/[^0-9]/g,'');" name="personal_identity" class="form-control" id="reset_password_personal_identity" placeholder="{{Lang::get('menu.identity_card')}}"  required autofocus>
                            </div>
                            <div class="row">
                                <label class="radio-inline">
                                    <input type="radio" name="reset_password_method" class="reset_password_method" id="sms" value="sms" checked> בהודעה
                                </label>
                                <label class="radio-inline">
                                    <input type="radio" name="reset_password_method" class="reset_password_method" id="email" value="email"> באימייל
                                </label>
                            </div>
                            <div class="row">
                                <div class="col-md-6" id="sendInstructions" style="padding-right:0"><button type="submit" id="resetPasswordButton" class="btn btn-primary" >{{trans( 'menu.reset_password_instructions' )}}</button></div>
                                <div class="col-md-6" id="undoForgetPasswordLink" style="text-align: left"><a href="#" id="undoForgetPasswordLink">{{trans('menu.back_to_login')}}</a></div>
                            </div>
                            <div class="form-group{{  $errors->has('personal_identity') ? 'has-error' : '' }}" >
                                <span class="has-error span.input-group-addon" id="error" ></span> </div>                             
                        </form>
                    </div>
                    <div class="panel-body" id="smsCodedBlock" style="display:none" >
                        <form class="1form-horizontal" role="form" id="smsCodeFrm" method="POST" action="" >
                            <div class="form-group{{  $errors->has('sms_code') ? ' has-error' : '' }}" >
                                <label id="sms_message" for="sms_code" class="login_sms">{{trans('menu.sms_message')}}</label>
                                <label id="sms_message_reset_password" for="sms_code" class="reset_password_sms">{{trans('menu.sms_message_reset_password')}}</label>
                                <input type="text" name="sms_code" class="form-control" id="sms_code"
                                       placeholder="{{Lang::get('menu.sms_code')}}" required autofocus>
                            </div>
                            <div class="row">
                                <div class="col-md-6" style="padding-right:0" >
                                    <button type="submit" id="smsLoginButton" class="btn btn-primary login_sms"  >{{trans('menu.enter')}}</button>
                                    <button type="submit" id="smsResetPasswordButton" class="btn btn-primary reset_password_sms"  >{{trans('menu.sms_reset_password')}}</button>
                                </div>
                                <div class="col-md-6" style="text-align: left">
                                    <a href="" id="resendLoginSmsCodeLink" class="login_sms">{{trans('menu.resend_sms_code')}}</a>
                                    <a href="" id="resendResetPasswordSmsCodeLink" class="reset_password_sms">{{trans('menu.resend_sms_code')}}</a>
                                </div>
                            </div>
                            <div class="form-group{{  $errors->has('sms_code') ? 'has-error' : '' }}" >
                                <span class="has-error span.input-group-addon" id="sms_error" ></span>
                            </div>
                        </form>
                    </div>
                    <div class="panel-body" id="mailSentSuccessfuly" style="display:none">
                        <label><strong>{{trans('menu.reset_instructions_sent')}}</strong></label>
                    </div>
                    <div class="panel-body" id="smsCodeSentSuccessfuly" style="display:none">
                        <label><strong>{{trans('menu.sms_code_sent')}}</strong></label>
                    </div>
                </div>
            </div>
            <div class="col-md-4"></div>
        </div>
    </div>

@endsection
