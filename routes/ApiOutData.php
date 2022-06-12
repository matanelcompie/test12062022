<?php
 use Illuminate\Support\Facades\Route;


Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'],function () {
            Route::group(['middleware' => 'apiPermissions'],function () {
//                Route::get('/details-report/ballot-box', "ApiOutDataReportVotes@getReportFinalVotsShasData")->name('allow');
            });
        });
    });
});
