@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="{{ URL::asset('css/login.css', $secure) }}">
<div class="container-fluid">
    <div class="row">
    	<div class="col-md-4"></div>
        <div class="col-md-4">
        	<div class="maintenance">
        	<div>המערכת נמצאת בתחזוקה</div>
        	<div>מסך הכניסה יחזור בסיום</div>
        </div>
        </div>
        <div class="col-md-4"></div>
    </div>
</div>

@endsection

<script>
	var getSystemStatus = function() {
		if (!jQuery) return;
		jQuery.ajax(window.Laravel.baseURL + 'api/system/status')
		.done(function(data) {
			location.reload();
		});
	}

	setInterval(getSystemStatus, 60*1000);
</script>