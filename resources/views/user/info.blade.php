@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col-md-4">
            {{ $data['label_name'] . " " . $data['user_details']->P_N .  " " .  $data['user_details']->F_N }}
        </div>
    </div>
    <div class="row">
        <div class="col-md-4">
            {{ $data['label_phone'] . " " . $data['user_details']->PHONE1 }}
        </div>
    </div>

    <div class="row">
        <a href="#" class="btn btn-lg btn-success" data-toggle="modal" data-target="#basicModal">אפס סיסמא</a>
    </div>

    <script>
        var password_url = "<?php echo url( 'api/user/password' ); ?>";
    </script>
    <link href="{{ URL::asset('css/user.css') }}" rel="stylesheet">

    <div class="modal fade" id="basicModal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true" style="display: none;">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h4 class="modal-title" id="myModalLabel">אפס סיסמא</h4>
                </div>
                <div class="modal-body">
                    <h3>אפס סיסמא</h3>
                </div>
                <form id="form-reset-password" method="post" action="">
                    <div id="error_box">
                    </div>
                    <div class="form-group row">
                        <label for="example-text-input" class="col-xs-2 col-form-label">סיסמא ישנה</label>
                        <div class="col-xs-10">
                            <input class="form-control" type="password" id="old_password" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="example-text-input" class="col-xs-2 col-form-label">סיסמא חדשה</label>
                        <div class="col-xs-10">
                            <input class="form-control" type="password" id="password" required>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="example-text-input" class="col-xs-2 col-form-label">אשר סיסמא</label>
                        <div class="col-xs-10">
                            <input class="form-control" type="password" id="confirm_password" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">סגור חלון</button>
                        <input type="submit" id="btn-reset-password" class="btn btn-default" value="אפס סיסמא">
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection