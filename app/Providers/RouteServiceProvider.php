<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider {

    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot () {

        //

        parent::boot();
    }

    /**
     * Define the routes for the application.
     *
     * @return void
     */
    public function map () {

        $this->mapApiRoutes();

        $this->mapWebRoutes();

        //
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     *
     * @return void
     */
    protected function mapWebRoutes () {
        $jwtToken = $this->app->request->header(config('jwt.header', null));

        if ($jwtToken == null) {

            //bypass session update so request will not update TTL
            Route::group( [ 'middleware' => 'read_session',
                            'namespace'  => $this->namespace, ], function ( $router ) {
                require base_path( 'routes/readSession.php' );
            });

            Route::group( [ 'middleware' => 'web',
                            'namespace'  => $this->namespace, ], function ( $router ) {
                                
                require base_path( 'routes/telemarketing.php' );
                require base_path( 'routes/voterFilters.php' );
                require base_path( 'routes/cti.php' );
                require base_path( 'routes/elections.php' );
                require base_path( 'routes/AllocationAndAssignmentRoute.php' );
                require base_path( 'routes/cityActivists.php' );
                require base_path( 'routes/cityActivistMobile.php' );
                require base_path( 'routes/dashboard.php' );
                require base_path( 'routes/mandates-dashboard.php' );
                require base_path( 'routes/ActivistsPaymentsRoute.php' );
                require base_path( 'routes/UploadExcelRoute.php' );
                require base_path( 'routes/globalListsRoute.php' );
                require base_path( 'routes/CrmRequestApiRoute.php' );
                require base_path( 'routes/VotersRoutes.php' );
                require base_path( 'routes/mobile.php');
                require base_path( 'routes/web.php' );
                require base_path( 'routes/ApiOutData.php' );
            } );
        } else {
           Route::group( [ 'middleware' => 'api',
                            'namespace'  => $this->namespace, ], function ( $router ) {

                require base_path( 'routes/readSession.php' );
                require base_path( 'routes/telemarketing.php' );
                require base_path( 'routes/voterFilters.php' );
                require base_path( 'routes/cti.php' );
                require base_path( 'routes/elections.php' );
                require base_path( 'routes/AllocationAndAssignmentRoute.php' );
                require base_path( 'routes/cityActivists.php' );
                require base_path( 'routes/cityActivistMobile.php' );
                require base_path( 'routes/dashboard.php' );
                require base_path( 'routes/ActivistsPaymentsRoute.php' );
                require base_path( 'routes/UploadExcelRoute.php' );
                require base_path( 'routes/globalListsRoute.php' );
                require base_path( 'routes/CrmRequestApiRoute.php' );
                require base_path( 'routes/VotersRoutes.php' );
                require base_path( 'routes/mandates-dashboard.php' );
                require base_path( 'routes/mobile.php');
                require base_path( 'routes/web.php' );
                require base_path( 'routes/ApiOutData.php' );
                
            } ); 
        }
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    protected function mapApiRoutes () {

        Route::group( [ 'middleware' => 'api',
                        'namespace'  => $this->namespace,
                        'prefix'     => '_api', ], function ( $router ) {

            require base_path( 'routes/api.php' );
        } );
    }
}
