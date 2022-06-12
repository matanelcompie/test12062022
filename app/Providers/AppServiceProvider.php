<?php

namespace App\Providers;

use App\Libraries\HelperSingleton;
use App\Libraries\JsonOutput;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //Add JsonOutput singleton to the app
        $this->app->singleton('JsonOutput', function ($app) {

            return new JsonOutput();
        });
        // DB::listen(function ($query) {
        //     Log::info( json_encode($query->sql) );
        //     Log::info( json_encode($query->bindings) );
        //     Log::info( json_encode($query->time)   );
        // });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //add helper singleton
        $this->app->singleton('helperSingleton', function ($app) {

            return new HelperSingleton();
        });

        if ($this->app->environment() !== 'production') {
            $this->app->register(\Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class);
        }
    }
}



