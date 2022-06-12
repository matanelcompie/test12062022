<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="utf-8">
    {{--<meta http-equiv="X-UA-Compatible" content="IE=edge">--}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <!-- Styles -->
    <link rel="shortcut icon" type="image/x-icon" href="{{ $baseURL }}Images/favicon.ico"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    {{--<link rel="stylesheet" href="{{ URL::asset('css/app.css', $secure) }}">--}}
    <link rel="stylesheet" href="https://cdn.rawgit.com/morteza/bootstrap-rtl/v3.3.4/dist/css/bootstrap-rtl.min.css">
    <link href="https://fonts.googleapis.com/css?family=Assistant" rel="stylesheet">
    <link rel="stylesheet" href="{{ URL::asset('css/shas.css', $secure) }}">
    <!-- Scripts -->
    <script>
        window.Laravel =  {csrfToken: "{{ $csrfToken }}",
                            baseURL: "{{ $baseURL }}"};
    </script>

</head>
<body>
@yield('side-bar')

<div class="container-fluid">
            <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
                <div class="row">
                  <div class="col-sm-9 col-md-9">                  
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#app-navbar-collapse">
                        <span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="{{ url('/') }}">{{ config('app.brand', 'Shas New') }}</a> 
                    <div class="systemName"> <Link to="./" title="לדף הבית"> 
                       @if( env('DB_HOST') != config('app.production_db_ip', '10.192.138.3') )
                            <span>
                                <img src= "{{ URL::asset('Images/dev-logo.png', $secure) }}" alt="לוגו שס"/>
                                ניהול קשרי תושבים - DEV
                            </span>
                        @else
                            <span>
                                <img src= "{{ URL::asset('Images/logo-shas.png', $secure) }}" alt="לוגו שס"/>
                                ניהול קשרי תושבים
                            </span>
                        @endif</Link></div>                                    
                  </div>
              </div>  
            </nav>

    <div class="row">
        @yield('content')
    </div>
    <div class="row">
        @include('layouts/footer')
    </div>
</div>
<!-- Scripts -->
<script src="https://code.jquery.com/jquery-3.1.0.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="{{ URL::asset('js/app.js', $secure) }}"></script>
<script src="{{ URL::asset('js/shas.js?ver=1.1', $secure) }}"></script>
</body>
</html>
