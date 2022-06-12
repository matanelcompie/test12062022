<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="utf-8">
    {{--<meta http-equiv="X-UA-Compatible" content="IE=edge">--}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.mobile_name', 'Laravel') }}</title>
    <!-- Styles -->
    <link rel="shortcut icon" type="image/x-icon" href="{{ $baseURL }}Images/favicon.ico"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Assistant:400,600,700,800&subset=hebrew">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ URL::asset('css/bootstrap-rtl.3.3.4.min.css', $secure) }}">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
    <link rel="stylesheet" href="{{ URL::asset('./css/' . $css, $secure) }}">
    <!-- Scripts -->
    <script>
        window.Laravel = {
            csrfToken: "{{ $csrfToken }}",
            baseURL: "{{ $baseURL }}",
            env: "{{ $env }}",
            isValidReporter:"{{ $isValidReporter }}",
            cityPhone:"{{ $cityPhone }}"
        };
    </script>
</head>
<body>
<div id="appMobile">
</div>
<!-- Scripts -->
<script  src="{{ URL::asset('./js/' . $reactJs. '?h=' . $reactHash, $secure) }}"></script>
</body>
<style type="text/css">
    @font-face {
        font-family:"Assistant";
        src:url('{{URL::asset('fonts/Assistant-Regular.ttf', $secure) }}');
    }
</style>
</html>