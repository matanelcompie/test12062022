<?php

/*
|--------------------------------------------------------------------------
| voterFilters Routes
|--------------------------------------------------------------------------
|
| This file is where we define all of the routes that are handled
| by the application for election.
|
 */

/* Route all ajax calls */
//api prefix

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'api'], function () {

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking permission on API calls
        Route::group(['middleware' => 'apiPermissions'], function () {
            /* voter_filter_groups */
            Route::get('filter_groups/{moduleName}', 'VoterFilterController@getDefinitions')->name('elections.reports.general');

            /* voter_filters */
            Route::get('voter_filters/query/{key}', 'VoterFilterController@getVotersFilterQuery')->name('elections.reports.general');
            Route::get('voter_filters/geo_init', 'VoterFilterController@getGeoOptionsInit')->name('elections.reports.general');
            Route::put('voter_filters/geo/{key}', 'VoterFilterController@updateGeoVoterFilter')->name('elections.reports.general');
            Route::delete('voter_filters/geo/{key}', 'VoterFilterController@deleteGeoVoterFilter')->name('elections.reports.general');
            Route::get('voter_filters/geo/{entityType}/{entityId}', 'VoterFilterController@getGeoOptions')->name('elections.reports.general');
            Route::get('voter_filters/{key}', 'VoterFilterController@getVoterFilter')->name('elections.reports.general');
            Route::delete('voter_filters/{key}', 'VoterFilterController@deleteVoterFilter')->name('elections.reports.general');
            Route::post('voter_filters/{key}/geo', 'VoterFilterController@addGeoVoterFilter')->name('elections.reports.general');
            Route::post('voter_filters/{parentKey}/{moduleName}', 'VoterFilterController@addVoterFilter')->name('elections.reports.general');
            Route::put('voter_filters', 'VoterFilterController@massUpdateVoterFilters')->name('elections.reports.general');
            Route::get('voter_filters/count_voters/{key}', 'VoterFilterController@getCountVoters')->name('elections.reports.general');
            Route::put('voter_filters/{key}', 'VoterFilterController@updateVoterFilter')->name('elections.reports.general');
            Route::get('voter_filters/definitions/{key}/values', 'VoterFilterController@getDefinitionValues')->name('elections.reports.general');
        });
    });

});
