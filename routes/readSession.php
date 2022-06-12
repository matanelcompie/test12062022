<?php

/*
  |--------------------------------------------------------------------------
  | No session Routes
  |--------------------------------------------------------------------------
  |
  | This file is where you may define all of the routes that are handled
  | by your application without going thru session create/update. Just tell Laravel the URIs it should respond
  | to using a Closure or controller method. Build something great!
  |
 */

//api prefix
Route::group(['prefix' => 'api'], function () {

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {

        	/* system status */
            Route::get('/system/status', 'SettingsController@getSystemStatus');
        });
    });
});