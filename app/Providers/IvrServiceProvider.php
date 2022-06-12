<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\API\Ivr\IvrManager;

class IvrServiceProvider extends ServiceProvider
{

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = true;

    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('ivr', function ($app) {
            return new IvrManager($app);
        });

        $this->app->singleton('ivr.store', function ($app) {
            return $app['ivr']->store();
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return ['ivr'];
    }
}
