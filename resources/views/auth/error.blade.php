@extends('layouts.app')

@section('content')

<script>

</script>

<a href="javascript:myFunc()">href</a>
<a href="#" onclick="javascript:myFunc()">onclick</a>
    <link rel="stylesheet" href="{{ URL::asset('css/login.css') }}">
    <div class="container-fluid">
        <div class="row"></div>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4 login-form">
                <div class="panel panel-default panel-primary">
                    <div class="panel-heading" >
                        <h3 class="panel-title" id="loginTitleResetPassword" >{{trans('menu.login_reset_password_title')}}  </h3>

                    </div>

                    <div class="panel-body" id="errorInToken" >
                        <span id="token_error"><strong>קישור לאיפוס סיסמה אינו בתוקף, נא בצע איפוס סיסמה מחדש</strong></span>
                    </div>
                </div>
            </div>
            <div class="col-md-4"></div>
        </div>
    </div>

@endsection
