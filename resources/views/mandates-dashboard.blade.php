<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="utf-8">
    {{--<meta http-equiv="X-UA-Compatible" content="IE=edge">--}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>דשבורד ספירת קולות</title>
    <!-- Styles -->
    <link rel="shortcut icon" type="image/x-icon" href="{{ $baseURL }}Images/favicon.ico"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Assistant:400,600,700,800&subset=hebrew">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    <link rel="stylesheet" href="{{ URL::asset('css/react-datepicker.css', $secure) }}">
    <link rel="stylesheet" href="{{ URL::asset('css/react-widgets.css', $secure) }}">
    
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
<script src="{{ URL::asset('js/mandates-dashboard.js', $secure) }}"></script>
<link rel="stylesheet" href="{{ URL::asset('css/mandates-dashboard.css', $secure) }}">
</body>
</html>

