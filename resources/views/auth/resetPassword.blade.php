@extends('layouts.app')

@section('content')

<script>

</script>

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
                        <h3 class="panel-title" id="loginTitleResetPassword" >{{trans('menu.login_reset_password_title')}} עבור {{$firstName}} {{$lastName}}</h3>

                    </div>
                    <div class="panel-body" id="resetingPasswordBlock">
                        <form class="1form-horizontal" role="form" id="resetingPasswordFrm" method="POST" action="">
                            <input type="hidden" name="resetPasswordToken" value="{{$resetPasswordToken}}" id="resetPasswordToken" />
                            <input type="hidden" name="firstName" value="{{$firstName}}" id="firstName" />
                            <input type="hidden" name="lastName" value="{{$lastName}}" id="lastName" />

                            <div class="resetPasswordMessage" style="display:block">{{$resetMessage}}</div>

                            {{ csrf_field() }}
                                <div id="resetPasswordScreen">
                                    <div class="form-group" >
                                        <label for="new_password">{{trans('menu.new_password')}}</label>
                                        <input type="password" name="new_password" class="form-control" id="new_password" placeholder="{{Lang::get('menu.new_password')}}"  required>
                                    </div>
                                    <div class="form-group" >
                                        <label for="validate_password">{{trans('menu.validate_password')}}</label>
                                        <input type="password" name="validate_password" class="form-control" id="validate_password" placeholder="{{Lang::get('menu.validate_password')}}" required>
                                    </div>

                                    <div class="password-strength">
                                        <div id="upper_case" class="strength-element weak"}>
                                            {{trans('menu.password_strength_upper_case')}} <img id="uperCaseImg" src="{{ URL::asset('Images/icon-x.png', $secure) }}">
                                        </div>

                                        <div id="lower_case" class="strength-element weak"}>
                                            {{trans('menu.password_strength_lower_case')}} <img id="lowerCaseImg" src="{{ URL::asset('Images/icon-x.png', $secure) }}">
                                        </div>

                                        <div id="number" class="strength-element weak"}>
                                            {{trans('menu.password_strength_number')}} <img id="numberImg" src="{{ URL::asset('Images/icon-x.png', $secure) }}">
                                        </div>

                                        <div id="length_check" class="strength-element weak"}>
                                            {{trans('menu.password_strength_length')}} <span id="password_length_indicator">0</span> <img id="lengthImg" src="{{ URL::asset('Images/icon-x.png', $secure) }}">
                                        </div>

                                        <div id="match" class="strength-element weak"}>
                                            {{trans('menu.password_match')}} <img id="matchImg" src="{{ URL::asset('Images/icon-x.png', $secure) }}">
                                        </div>
                                    </div>

                                    <button type="submit" id="savePasswordButton" class="btn btn-primary" disabled>{{trans('menu.send')}}</button>
                                    <span id="error"></span>
                                </div>
                                <div class="panel-body row" id="resetPasswordSuccessfuly" style="display:none">
                                    <div class="col-md-6"><label><strong>{{trans('menu.password_changed_successfuly')}}</strong></label> </div>
                                    <div class="col-md-6" id="backToLogin" style="text-align: left; padding-left:0"><a href="#" id="backToLoginLink">{{trans('menu.back_to_login')}}</a></div>                               
                                </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-md-4"></div>
        </div>
    </div>

@endsection
