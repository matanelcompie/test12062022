<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            //\App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\ApiResponseToken::class,
        ],

        'api' => [
            //'throttle:60,1',
            //'bindings',
            \App\Http\Middleware\ApiResponseToken::class,

        ],

        'activists_api' => [
            //'throttle:60,1',
            //'bindings',
            \App\Http\Middleware\apiActivistsPermissions::class,

        ],
        'read_session' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \App\Http\Middleware\ReadSession::class,
            \App\Http\Middleware\ApiResponseToken::class,         
        ],
    ];

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'auth.user' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'apiOutput' => \App\Http\Middleware\ApiOutput::class,
        'auth.guest' => \App\Http\Middleware\RedirectIfGuest::class,
        'apiPermissions' => \App\Http\Middleware\ApiPermissions::class,
        'apiActivistsPermissions' => \App\Http\Middleware\apiActivistsPermissions::class,
        'ApiResponseToken' => \App\Http\Middleware\ApiResponseToken::class,
        'AuthMobileVoter' => \App\Http\Middleware\AuthMobileVoter::class,
        'CheckMaintenance' => \App\Http\Middleware\CheckMaintenance::class,
    ];
}
