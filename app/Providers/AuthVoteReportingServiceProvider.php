<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Libraries\VoteReporting;

use Illuminate\Support\Facades\Cache;

class AuthVoteReportingServiceProvider extends ServiceProvider {

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot () {

        //Add VoteReporting singleton to the app
        $this->app->singleton( 'VoteReporting', function ( $app ) {

            return new VoteReporting();
        } );
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register () {
        //
    }
}
