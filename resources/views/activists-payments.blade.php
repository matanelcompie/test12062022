<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="utf-8">
    {{--<meta http-equiv="X-UA-Compatible" content="IE=edge">--}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ניהול תשלומי פעילים</title>
    <!-- Styles -->
    {{-- <link rel="shortcut icon" type="image/x-icon" href="{{ $baseURL }}Images/favicon.ico"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    <link rel="stylesheet" href="{{ URL::asset('css/react-datepicker.css', $secure) }}">
    <link rel="stylesheet" href="{{ URL::asset('css/react-widgets.css', $secure) }}"> --}}
    <link rel="shortcut icon" type="image/x-icon" href="{{ $baseURL }}Images/favicon.ico"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Assistant:400,600,700,800&subset=hebrew">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    {{--<link rel="stylesheet" href="{{ URL::asset('css/app.css', $secure) }}">--}}
    <link rel="stylesheet" href="{{ URL::asset('css/bootstrap-rtl.3.3.4.min.css', $secure) }}">
    {{-- <link rel="stylesheet" href="{{ URL::asset('css/'.$css.'?h='.$reactHash, $secure) }}">
    <link rel="stylesheet" href="{{ URL::asset('css/compiled.css?h='.$reactHash, $secure) }}"> --}}
    <link rel="stylesheet" href="{{ URL::asset('css/react-datepicker.css', $secure) }}">
    <link rel="stylesheet" href="{{ URL::asset('css/react-widgets.css', $secure) }}">
    <link rel="stylesheet" href="{{ URL::asset('css/responsive.css', $secure) }}">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    
    <!-- Scripts -->
    <!-- <script src="{{ URL::asset('js/sip-0.12.0.min.js', $secure) }}"></script> -->

    <script>
        window.Laravel = {
            csrfToken: "{{ $csrfToken }}",
            baseURL: "{{ $baseURL }}",
            env: "{{ $env }}"
        };
    </script>
</head>
<body>
<div id="app"></div>
<!-- Scripts -->
<script src="https://code.jquery.com/jquery-3.1.0.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="{{ URL::asset('js/activists-payments.js', $secure) }}"></script>
<link rel="stylesheet" href="{{ URL::asset('css/activists-payments.css', $secure) }}">
</body>
</html>

