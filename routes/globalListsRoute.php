<?php

use Illuminate\Support\Facades\Route;



Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/activists-payments/{all?}', 'ActivistsPaymentsController@index')->where('all', '.*')->name('allow');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/list/cities', "ListsController@getCities")->name('allow');
                Route::get('/list/payment-status-type', "ListsController@getPaymentStatus")->name('allow');
                Route::get('/list/payment-type', "ListsController@getPaymentType")->name('allow');
                Route::get('/list/shas-banks', "ListsController@getListShasBank")->name('allow');
                Route::get('/list/election-roles', "ListsController@getVoterElectionRoles")->name('allow');
                Route::get('/list/election-campaign', "ListsController@getListElectionCampaign")->name('allow');
                Route::get('/list/payment-type-additional', "ListsController@getListPaymentTypeAdditional")->name('allow');
                Route::get('/list/reason-payment-status', "ListsController@getListReasonPaymentStatus")->name('allow');
            });

            Route::group(['middleware' => 'CheckMaintenance'], function () {
                Route::group(['middleware' => 'apiActivistsPermissions'], function () {
                    Route::get('/list/cities', "ListsController@getNameAndIdCityList")->name('allow');
                    Route::get('/list/teams', "ListsController@getListTeams")->name('allow');
                    Route::get('/list/city/{city_id}/streets', "ListsController@getNameStreetListByCityId")->name('allow');
                });
            });
        });
    });
});
