<?php

namespace App\Providers;

use App\Extensions\ActivistUserProvider;
use Illuminate\Support\Facades\Auth;
use App\Extensions\ShasUserProvider;
use App\Extensions\ExternalUserProvider;
use App\Extensions\ExternalUserGuard;
use App\Extensions\JwtGuard;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider {

    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [ 'App\Model' => 'App\Policies\ModelPolicy', ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot () {

        $this->registerPolicies();

        Auth::provider( 'shas_provider', function ( $app, array $config ) {

            // Return an instance of Illuminate\Contracts\Auth\UserProvider...
            return new ShasUserProvider( $app['hash'], $config["model"] );
        } );

        Auth::provider( 'external_provider', function ( $app, array $config ) {

            // Return an instance of Illuminate\Contracts\Auth\UserProvider...
            return new ExternalUserProvider( $app['hash'], $config["model"] );
        } );        
        Auth::provider( 'activist_provider', function ( $app, array $config ) {

            // Return an instance of Illuminate\Contracts\Auth\UserProvider...
            return new ActivistUserProvider( $app['hash'], $config["model"] );
        } );        

        Auth::extend('shas_token', function ($app, $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new ExternalUserGuard(Auth::createUserProvider($config['provider']), $this->app->request);
        });
        Auth::extend('activist_token', function ($app, $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']), $this->app->request);
        });
    }
}
